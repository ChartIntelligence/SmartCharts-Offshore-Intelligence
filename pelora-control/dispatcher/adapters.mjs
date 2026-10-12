import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { assert } from './policy.mjs';

// Stable JSON-RPC surface over stdio; no SDK, daemon or API key required by the core.
export class StdioRpc extends EventEmitter {
  constructor(executable = 'codex', timeoutMs = 30000) {
    super(); this.nextId = 1; this.pending = new Map(); this.buffer = ''; this.timeoutMs = timeoutMs;
    assert(!/\.(cmd|bat)$/i.test(executable), 'use a native executable, never a shell wrapper');
    this.child = spawn(executable, ['app-server', '--listen', 'stdio://'], {
      stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true, shell: false,
    });
    this.child.stdout.setEncoding('utf8');
    this.child.stdout.on('data', chunk => {
      this.buffer += chunk;
      if (this.buffer.length > 2 * 1024 * 1024) return this.close();
      let index;
      while ((index = this.buffer.indexOf('\n')) >= 0) {
        const line = this.buffer.slice(0, index); this.buffer = this.buffer.slice(index + 1);
        if (!line.trim()) continue;
        try { this.receive(JSON.parse(line)); } catch { this.emit('fault', 'invalid app-server frame'); this.close(); }
      }
    });
    // Drain diagnostics without persisting possible private content, credentials or prompts.
    this.child.stderr.on('data', () => {});
    this.child.on('error', () => this.rejectAll('app-server unavailable'));
    this.child.on('exit', () => { this.rejectAll('app-server disconnected'); this.emit('fault', 'app-server disconnected'); });
  }
  send(message) { this.child.stdin.write(JSON.stringify(message) + '\n'); }
  notify(method, params = {}) { this.send({ method, params }); }
  request(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id); reject(new Error(`RPC timeout: ${method}; execution may be uncertain`));
      }, this.timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.send({ id, method, params });
    });
  }
  receive(message) {
    if (message.method) {
      if (message.id !== undefined) {
        // Never grant an executor's approval request by interpreting a queue flag as consent.
        const decisions = {
          'item/commandExecution/requestApproval': { decision: 'decline' },
          'item/fileChange/requestApproval': { decision: 'decline' },
        };
        if (Object.hasOwn(decisions, message.method)) this.send({ id: message.id, result: decisions[message.method] });
        else this.send({ id: message.id, error: { code: -32601, message: 'Human gateway unavailable; refused' } });
        this.emit('approval', { method: message.method });
      } else this.emit('notification', message);
      return;
    }
    const waiter = this.pending.get(message.id); if (!waiter) return;
    clearTimeout(waiter.timer); this.pending.delete(message.id);
    if (message.error) waiter.reject(new Error('app-server request rejected'));
    else waiter.resolve(message.result);
  }
  rejectAll(reason) {
    for (const p of this.pending.values()) { clearTimeout(p.timer); p.reject(new Error(reason)); }
    this.pending.clear();
  }
  close() { this.rejectAll('app-server closed'); this.child.kill(); }
}

export class LocalAdapter {
  constructor(rpc, { timeoutMs = 30 * 60 * 1000 } = {}) { this.rpc = rpc; this.timeoutMs = timeoutMs; this.initialized = false; }
  async run(pkg, cwd, callbacks, resumeThreadId = null) {
    const rpc = this.rpc;
    if (!this.initialized) {
      await rpc.request('initialize', { clientInfo: { name: 'pelora_control', title: 'Pelora Control', version: '1.0.0' } });
      rpc.notify('initialized'); this.initialized = true;
    }
    const settings = { cwd, approvalPolicy: 'on-request', sandbox: pkg.task.permittedActions.includes('write') ? 'workspaceWrite' : 'readOnly' };
    const response = await rpc.request(resumeThreadId ? 'thread/resume' : 'thread/start',
      resumeThreadId ? { threadId: resumeThreadId, ...settings } : settings);
    const threadId = response.thread?.id; assert(typeof threadId === 'string', 'missing thread identity');
    if (resumeThreadId) assert(threadId === resumeThreadId, 'resume thread mismatch');
    await callbacks.onThread(threadId);
    const instruction = pkg.instruction + `\nYour executor threadId is ${threadId}. Return ONLY the result JSON as the final agent message.`;
    let turnId = null;
    return new Promise((resolve, reject) => {
      let finalText = '', done = false;
      const pendingNotifications = [];
      const cleanup = () => { clearTimeout(timer); rpc.off('notification', notification); rpc.off('approval', approval); rpc.off('fault', fault); };
      const end = (error, result) => { if (done) return; done = true; cleanup(); error ? reject(error) : resolve(result); };
      const approval = () => {
        callbacks.onApproval('executor requested human action; declined by v1 gateway');
        if (turnId) rpc.request('turn/interrupt', { threadId, turnId }).catch(() => {});
        end(new Error('WAITING_FOR_APPROVAL'));
      };
      const fault = () => end(new Error('executor disconnected; lock retained'));
      const notification = message => {
        const p = message.params ?? {};
        if (p.threadId !== threadId) return;
        if (!turnId) { if (pendingNotifications.length < 1000) pendingNotifications.push(message); return; }
        const notificationTurn = p.turnId ?? p.turn?.id;
        if (notificationTurn && notificationTurn !== turnId) return;
        callbacks.onEvent?.(message.method);
        if (message.method === 'item/completed' && p.item?.type === 'agentMessage') finalText = p.item.text ?? '';
        if (message.method === 'turn/completed') {
          if (p.turn?.status !== 'completed') return end(new Error('turn failed/interrupted; lock retained'));
          try { end(null, JSON.parse(finalText)); } catch { end(new Error('final result is not JSON')); }
        }
      };
      const timer = setTimeout(() => {
        if (turnId) rpc.request('turn/interrupt', { threadId, turnId }).catch(() => {});
        end(new Error('turn timeout; reconcile executor before retry'));
      }, this.timeoutMs);
      rpc.on('notification', notification); rpc.on('approval', approval); rpc.on('fault', fault);
      rpc.request('turn/start', {
        threadId, cwd, approvalPolicy: 'on-request',
        sandboxPolicy: pkg.task.permittedActions.includes('write')
          ? { type: 'workspaceWrite', writableRoots: [cwd], networkAccess: false }
          : { type: 'readOnly' },
        input: [{ type: 'text', text: instruction }],
      }).then(r => {
        turnId = r.turn?.id; assert(typeof turnId === 'string', 'missing turn identity');
        for (const message of pendingNotifications) notification(message);
      }).catch(error => end(error));
    });
  }
}

export class CloudAdapter {
  constructor(port = null) { this.port = port; }
  async run(pkg, cwd, callbacks, threadId = null) {
    assert(this.port, 'Cloud dispatch is interface-only: no configured task API/auth/environment binding');
    // Port must isolate the exact baseline and supply real repository metadata on result.
    // Do not substitute local cwd, local session credentials or an imagined Cloud API.
    return this.port.run(pkg, callbacks, threadId);
  }
}
