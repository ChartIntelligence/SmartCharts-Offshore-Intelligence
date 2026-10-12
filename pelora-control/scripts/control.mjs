import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { validateQueue, reload, refresh, ingest, qualify, reconcile, finish, recordPush } from '../dispatcher/core.mjs';
import { assert } from '../dispatcher/policy.mjs';
import { Store } from '../dispatcher/store.mjs';
import { GitWorkspace } from '../dispatcher/git.mjs';
import { StdioRpc, LocalAdapter } from '../dispatcher/adapters.mjs';
import { dispatch, allowResume } from '../dispatcher/controller.mjs';

const area = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
const [command = 'validate', id, receiptPath, disposition] = process.argv.slice(2);
try {
  const queue = read(join(area, 'queue.json')), registry = read(join(area, 'agents.json'));
  validateQueue(queue, registry);
  if (command === 'validate') console.log(JSON.stringify({ valid: true, baseline: queue.baseline, tasks: queue.tasks.length }));
  else {
    const settings = read(join(area, '.local', 'settings.json'));
    const store = new Store(settings.statusDirectory);
    const workspace = new GitWorkspace(settings.repositoryRoot, settings.worktreeRoot);
    const task = queue.tasks.find(t => t.id === id);
    if (command === 'status') {
      console.log(JSON.stringify(store.transaction(s => { reload(queue, registry, s); refresh(queue, s); return s; }), null, 2));
    } else {
      assert(task, 'unknown task');
      if (command === 'run' || command === 'resume') {
        assert(task.environment === 'local', 'Cloud dispatch interface-only; no task API configured');
        assert(settings.localExecutionEnabled === true, 'local execution disabled; follow Windows activation runbook');
        const rpc = new StdioRpc(settings.codexExecutable);
        try { console.log(JSON.stringify(await dispatch({ queue, registry, store, workspace, adapter: new LocalAdapter(rpc), id, resume: command === 'resume' }))); }
        finally { rpc.close(); }
      } else if (command === 'allow-resume') allowResume(queue, registry, store, id, read(receiptPath));
      else {
        const receipt = receiptPath ? read(receiptPath) : null;
        const meta = workspace.metadata(task);
        const remote = command === 'verify-push' ? workspace.remoteHead(task) : null;
        store.transaction(s => {
          reload(queue, registry, s);
          if (command === 'ingest') ingest(task, s, receipt, meta);
          else if (command === 'qualify') qualify(task, s, receipt, meta);
          else if (command === 'reconcile') reconcile(task, s, receipt, meta);
          else if (command === 'finish') finish(task, s, disposition, receipt);
          else if (command === 'verify-push') recordPush(task, s, remote);
          else throw new Error('unknown command');
        });
        console.log(JSON.stringify({ id, recorded: command }));
      }
    }
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
