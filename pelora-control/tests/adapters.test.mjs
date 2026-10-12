import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalAdapter, CloudAdapter, StdioRpc } from '../dispatcher/adapters.mjs';
import { dispatch, allowResume } from '../dispatcher/controller.mjs';
import { Store } from '../dispatcher/store.mjs';
import { reload } from '../dispatcher/core.mjs';
import { BASELINE } from '../dispatcher/policy.mjs';
const registry = JSON.parse(readFileSync(new URL('../agents.json', import.meta.url)));
const task = JSON.parse(readFileSync(new URL('../docs/example-task.json', import.meta.url)));
const queue = { version: 1, baseline: BASELINE, tasks: [task] };
class Rpc extends EventEmitter {
  constructor(mode = 'ok') { super(); this.calls = []; this.mode = mode; }
  notify(method) { this.calls.push({ method }); }
  async request(method, params) {
    this.calls.push({ method, params });
    if (method.startsWith('thread/')) return { thread: { id: 'thread-test' } };
    if (method === 'turn/start') {
      setImmediate(() => {
        if (this.mode === 'approval') this.emit('approval', { method: 'item/commandExecution/requestApproval' });
        else if (this.mode === 'fault') this.emit('fault', 'disconnect');
        else {
          this.emit('notification', { method: 'item/completed', params: { threadId: 'unrelated', item: { type: 'agentMessage', text: 'wrong' } } });
          this.emit('notification', { method: 'turn/completed', params: { threadId: 'thread-test', turn: { id: 'old-turn', status: 'completed' } } });
          this.emit('notification', { method: 'item/completed', params: { threadId: 'thread-test', turnId: 'turn-test', item: { type: 'agentMessage', text: '{"synthetic":true}' } } });
          this.emit('notification', { method: 'turn/completed', params: { threadId: 'thread-test', turn: { id: 'turn-test', status: 'completed' } } });
        }
      });
      return { turn: { id: 'turn-test' } };
    }
    return {};
  }
}
test('local boundary initializes, binds worktree, no network, captures status; resumes exact thread', async () => {
  const rpc = new Rpc(), adapter = new LocalAdapter(rpc, { timeoutMs: 500 });
  const callbacks = { onThread: id => assert.equal(id, 'thread-test'), onApproval: () => assert.fail('unexpected approval') };
  const pkg = { task, instruction: 'synthetic bounded instruction' };
  assert.deepEqual(await adapter.run(pkg, 'C:/isolated/worktree', callbacks), { synthetic: true });
  const start = rpc.calls.find(x => x.method === 'thread/start'); assert.equal(start.params.cwd, 'C:/isolated/worktree'); assert.equal(start.params.sandbox, 'readOnly');
  assert.equal(start.params.approvalPolicy, 'on-request');
  await adapter.run(pkg, 'C:/isolated/worktree', callbacks, 'thread-test');
  assert.equal(rpc.calls.filter(x => x.method === 'initialize').length, 1);
  assert.equal(rpc.calls.find(x => x.method === 'thread/resume').params.threadId, 'thread-test');
});
test('writer sandbox denies network and uses only assigned writable root', async () => {
  const rpc = new Rpc(); await new LocalAdapter(rpc).run({ task: { ...task, permittedActions: ['read', 'write'] }, instruction: 'x' }, '/isolated', { onThread() {}, onApproval() {} });
  assert.deepEqual(rpc.calls.find(x => x.method === 'turn/start').params.sandboxPolicy, { type: 'workspaceWrite', writableRoots: ['/isolated'], networkAccess: false });
});
test('executor approval pauses; transport disconnect and timeout fail closed', async () => {
  let approvals = 0;
  const cb = { onThread() {}, onApproval: () => { approvals++; } }, pkg = { task, instruction: 'x' };
  await assert.rejects(new LocalAdapter(new Rpc('approval')).run(pkg, '/isolated', cb), /WAITING_FOR_APPROVAL/);
  assert.equal(approvals, 1);
  await assert.rejects(new LocalAdapter(new Rpc('fault')).run(pkg, '/isolated', cb), /disconnected/);
  const slow = new Rpc(); slow.request = async method => method === 'thread/start' ? { thread: { id: 'thread-test' } } : method === 'turn/start' ? new Promise(() => {}) : {};
  await assert.rejects(new LocalAdapter(slow, { timeoutMs: 10 }).run(pkg, '/isolated', cb), /timeout/);
});
test('stdio dispatcher declines known approvals and rejects unknown server requests', () => {
  const rpc = Object.create(StdioRpc.prototype); const frames = [], approvals = [];
  rpc.send = frame => frames.push(frame); rpc.emit = (_, p) => approvals.push(p);
  rpc.receive({ id: 1, method: 'item/commandExecution/requestApproval' });
  rpc.receive({ id: 2, method: 'item/fileChange/requestApproval' });
  rpc.receive({ id: 3, method: 'unexpected/privilegedTool' });
  assert.deepEqual(frames[0].result, { decision: 'decline' }); assert.deepEqual(frames[1].result, { decision: 'decline' });
  assert.equal(frames[2].error.code, -32601); assert.equal(approvals.length, 3);
});
test('cloud is explicit interface-only; injected controlled port is usable', async () => {
  await assert.rejects(new CloudAdapter().run({}, null, {}), /interface-only/);
  const adapter = new CloudAdapter({ run: async (pkg, callbacks, threadId) => ({ id: pkg.id, threadId }) });
  assert.deepEqual(await adapter.run({ id: 'test' }, null, {}, 'cloud-test'), { id: 'test', threadId: 'cloud-test' });
});
function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'pelora-dispatch-')), store = new Store(dir);
  const workspace = {
    provision: () => '/synthetic',
    governance: (t, paths) => Object.fromEntries(paths.map(p => [p, 'synthetic governance'])),
    metadata: t => ({ branch: t.branch, baseline: BASELINE, head: BASELINE, baselineAncestor: true, clean: true, changedFiles: [] }),
  };
  return { dir, store, workspace };
}
test('dispatcher persists intent before side effects, restart refuses duplicate and results ingest', async () => {
  const { dir, store, workspace } = setup();
  try {
    const adapter = { run: async (pkg, cwd, cb) => {
      assert.equal(new Store(dir).transaction(s => s.tasks[task.id].state), 'RUNNING'); cb.onThread('thread-test'); cb.onEvent('turn/completed');
      return { version: 1, id: task.id, attempt: pkg.attempt, taskDigest: pkg.taskDigest, baseline: BASELINE, threadId: 'thread-test', branch: task.branch, commit: BASELINE, tests: [], disposition: 'SUBMITTED' };
    } };
    const args = { queue, registry, store, workspace, adapter, id: task.id };
    await dispatch(args); assert.equal(store.transaction(s => s.tasks[task.id].evidence.submitted.commit), BASELINE);
    await assert.rejects(dispatch({ ...args, store: new Store(dir) }), /retained/);
  } finally { rmSync(dir, { recursive: true }); }
});
test('uncertain dispatch and approval retain locks; explicit stopped receipt permits resume', async () => {
  const { dir, store, workspace } = setup();
  try {
    const failing = { run: async (pkg, cwd, cb) => { cb.onThread('thread-test'); throw new Error('disconnect'); } };
    const args = { queue, registry, store, workspace, adapter: failing, id: task.id };
    await assert.rejects(dispatch(args), /disconnect/);
    const r = store.transaction(s => s.tasks[task.id]); assert.equal(r.state, 'QUALIFICATION_FAILED');
    assert.throws(() => allowResume(queue, registry, store, task.id, { attempt: r.attempt }), /stopped/);
    allowResume(queue, registry, store, task.id, { attempt: r.attempt, executorStopped: true, operatorRef: 'synthetic operator' });
    const paused = { run: async (pkg, cwd, cb, threadId) => { assert.equal(threadId, 'thread-test'); cb.onApproval('needs human review'); throw new Error('WAITING_FOR_APPROVAL'); } };
    await assert.rejects(dispatch({ ...args, adapter: paused, resume: true }), /WAITING/);
    assert.equal(store.transaction(s => s.tasks[task.id].state), 'WAITING_FOR_APPROVAL');
  } finally { rmSync(dir, { recursive: true }); }
});
