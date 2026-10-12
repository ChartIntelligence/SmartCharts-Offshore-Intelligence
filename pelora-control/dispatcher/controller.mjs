import { reload, begin, fail, pause, executionPackage, ingest, refresh } from './core.mjs';
import { assert, GOVERNANCE } from './policy.mjs';

export async function dispatch({ queue, registry, store, workspace, adapter, id, resume = false }) {
  const task = queue.tasks.find(t => t.id === id); assert(task, 'unknown task');
  let attempt, threadId;
  store.transaction(state => {
    reload(queue, registry, state);
    const r = state.tasks[id];
    if (resume) {
      // Only explicitly reconciled, stopped executors may resume. A surviving runner
      // must never receive a second turn from a newly started controller.
      assert(r.state === 'WAITING_FOR_APPROVAL' && r.resumeReceipt?.executorStopped === true && r.threadId, 'resume needs stopped-executor receipt');
      r.state = 'RUNNING'; delete r.resumeReceipt; attempt = r.attempt; threadId = r.threadId;
    } else attempt = begin(id, queue, state);
  });
  try {
    const cwd = workspace.provision(task, resume);
    const paths = ['AGENTS.md', ...task.governance.map(k => GOVERNANCE[k])];
    const pkg = executionPackage(task, attempt, workspace.governance(task, paths));
    const result = await adapter.run(pkg, cwd, {
      onThread: value => store.transaction(s => {
        reload(queue, registry, s); assert(s.tasks[id].attempt === attempt && s.tasks[id].state === 'RUNNING', 'attempt fenced');
        s.tasks[id].threadId = value;
      }),
      onApproval: reason => store.transaction(s => { reload(queue, registry, s); assert(s.tasks[id].attempt === attempt, 'attempt fenced'); pause(id, s, reason); }),
      // Only counts/method names enter status; no raw model/tool content or secret text.
      onEvent: method => store.transaction(s => {
        reload(queue, registry, s);
        const r = s.tasks[id]; assert(r.attempt === attempt, 'attempt fenced');
        assert(typeof method === 'string' && /^[a-zA-Z][a-zA-Z0-9._-]*\/[a-zA-Z0-9/._-]+$/.test(method) && method.length <= 128, 'invalid event method');
        r.events ??= {}; r.events[method] = (r.events[method] ?? 0) + 1;
      }),
    }, threadId);
    const metadata = workspace.metadata(task);
    store.transaction(s => { reload(queue, registry, s); ingest(task, s, result, metadata); });
    return { id, attempt, disposition: 'SUBMITTED', commit: metadata.head };
  } catch (error) {
    store.transaction(s => {
      reload(queue, registry, s);
      if (s.tasks[id].state === 'RUNNING' && s.tasks[id].attempt === attempt) fail(id, s, 'dispatch failed or uncertain; operator reconciliation required');
    });
    throw error;
  }
}

export function allowResume(queue, registry, store, id, receipt) {
  store.transaction(s => {
    reload(queue, registry, s); const r = s.tasks[id];
    assert(r && ['QUALIFICATION_FAILED', 'WAITING_FOR_APPROVAL'].includes(r.state)
      && r.threadId && receipt.attempt === r.attempt && receipt.executorStopped === true && receipt.operatorRef,
    'exact attempt and stopped-executor receipt required');
    // A sensitive queue entry cannot be unblocked through this recovery interface.
    const task = queue.tasks.find(t => t.id === id);
    assert(task.approvalRequirements.length === 0, 'human-gated task has no v1 executor');
    r.state = 'WAITING_FOR_APPROVAL'; r.resumeReceipt = {attempt:receipt.attempt,executorStopped:true,operatorRef:receipt.operatorRef};
    s.history.push({ revision: ++s.revision, id, to: r.state, reason: 'operator confirmed executor stopped; resume permitted', at: new Date().toISOString() });
    refresh(queue, s);
  });
}
