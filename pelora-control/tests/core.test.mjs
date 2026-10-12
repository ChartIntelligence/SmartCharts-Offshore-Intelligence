import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as core from '../dispatcher/core.mjs';
import { BASELINE, digest, conflicts, safeScope } from '../dispatcher/policy.mjs';
import { Store } from '../dispatcher/store.mjs';
import { schema } from '../scripts/schema.mjs';
const registry = JSON.parse(readFileSync(new URL('../agents.json', import.meta.url)));
const example = JSON.parse(readFileSync(new URL('../docs/example-task.json', import.meta.url)));
const task = (id = 'pelora-test-one', extra = {}) => ({ ...structuredClone(example), id, worktree: id, branch: `codex/${id}`, ...extra });
const writer = (id, file) => task(id, { type: 'implementation', allowedFiles: [file], permittedActions: ['read', 'write', 'worktree', 'test', 'commit'], blockedActions: example.blockedActions.filter(x => !['write', 'commit'].includes(x)), commitPolicy: 'allow' });
const queue = (...tasks) => ({ version: 1, baseline: BASELINE, tasks });
function running(t) {
  const q = queue(t), s = core.reload(q, registry, core.initialState());
  const attempt = core.begin(t.id, q, s); s.tasks[t.id].threadId = 'thread-test';
  const meta = { baseline: BASELINE, baselineAncestor: true, branch: t.branch, head: BASELINE, clean: true, changedFiles: [] };
  const result = { version: 1, id: t.id, attempt, threadId: 'thread-test', taskDigest: digest(t), baseline: BASELINE, branch: t.branch, commit: BASELINE, disposition: 'SUBMITTED', tests: [] };
  return { q, s, meta, result };
}
test('valid task, exact schema fields and unqueued sample accepted', () => {
  core.validateTask(example, registry); core.validateTask(task(), registry);
  assert.deepEqual(Object.keys(example).sort(), schema.required.slice().sort());
});
for (const [name, extra, message] of [
  ['missing/unknown field', { surprise: true }, /field/], ['unknown agent', { owner: 'PELORA-99' }, /unknown agent/],
  ['wrong baseline', { baseline: '789de11a6aedd50e6e3a8dcf366d4d662f4dc4f5' }, /baseline/],
  ['unsafe branch', { branch: 'main' }, /branch/], ['path traversal', { allowedFiles: ['../x'] }, /scope/],
  ['outside owner scope', { allowedFiles: ['backend/server.js'] }, /owner scope/],
  ['production blocked', { permittedActions: ['read', 'production-deploy'] }, /contradiction/],
  ['no human gate', { permittedActions: ['read', 'production-deploy'], blockedActions: [] }, /human gate/],
  ['write in analysis', { permittedActions: ['read', 'write'], blockedActions: [], allowedFiles: ['pelora-control/x'] }, /read-only/],
  ['missing governance', { governance: ['product'] }, /mandatory/],
]) test(`reject ${name}`, () => assert.throws(() => core.validateTask(task('pelora-test-one', extra), registry), message));
test('unknown dependency, cycle and duplicate worktree rejected', () => {
  assert.throws(() => core.validateQueue(queue(task('pelora-test-one', { dependencies: ['missing'] })), registry), /dependency/);
  assert.throws(() => core.validateQueue(queue(task('pelora-test-one', { dependencies: ['pelora-test-two'] }), task('pelora-test-two', { dependencies: ['pelora-test-one'] })), registry), /cycle/);
  assert.throws(() => core.validateQueue(queue(task(), task('pelora-test-two', { worktree: 'pelora-test-one' })), registry), /duplicate/);
});
test('dependency stays blocked until explicit COMPLETE', () => {
  const a = task(), b = task('pelora-test-two', { dependencies: [a.id] }), q = queue(a, b), s = core.reload(q, registry, core.initialState());
  assert.equal(core.readiness(b, q, s).state, 'BLOCKED');
  s.tasks[a.id].state = 'QUALIFIED'; assert.equal(core.readiness(b, q, s).state, 'BLOCKED');
  s.tasks[a.id].state = 'COMPLETE'; assert.equal(core.readiness(b, q, s).state, 'READY');
});
test('overlapping writes lock; disjoint scopes parallel; readonly concurrent', () => {
  const a = writer('pelora-test-one', 'pelora-control/docs/**'), b = writer('pelora-test-two', 'pelora-control/docs/a.md'), c = writer('pelora-test-three', 'pelora-control/scripts/x.mjs');
  assert(conflicts(a, b)); assert(!conflicts(a, c)); assert(!conflicts(a, task()));
  const q = queue(a, b, c), s = core.reload(q, registry, core.initialState()); core.begin(a.id, q, s);
  assert.equal(core.readiness(b, q, s).state, 'BLOCKED'); assert.equal(core.readiness(c, q, s).state, 'READY');
  assert.throws(() => core.begin(a.id, q, s), /retained/);
});
test('protected contract inferred even when task omits lock names', () => {
  const a = writer('pelora-test-one', 'frontend/src/A.jsx'), b = writer('pelora-test-two', 'frontend/src/B.jsx');
  a.owner = 'PELORA-02'; b.owner = 'PELORA-03'; assert(conflicts(a, b));
});
test('explicit protected files, case-insensitive paths and secrets denied', () => {
  const a = writer('pelora-test-one', 'pelora-control/a'), b = writer('pelora-test-two', 'pelora-control/B');
  a.protectedFiles = ['pelora-control/b']; assert(conflicts(a, b));
  assert(!safeScope('pelora-control/.env.local')); assert(!safeScope('pelora-control/../x'));
});
test('sensitive gated task waits; no dispatch despite approval metadata', () => {
  const t = task('pelora-test-one', { permittedActions: ['read', 'production-deploy'], blockedActions: [], approvalRequirements: ['production-deploy'] });
  const q = queue(t), s = core.reload(q, registry, core.initialState());
  assert.equal(core.readiness(t, q, s).state, 'WAITING_FOR_APPROVAL'); assert.throws(() => core.begin(t.id, q, s), /human gate/);
});
test('ingestion is submission only, qualification and complete are explicit', () => {
  const t = task(), { s, meta, result } = running(t); core.ingest(t, s, result, meta);
  assert.equal(s.tasks[t.id].state, 'RUNNING'); assert.throws(() => core.finish(t, s, 'COMPLETE'), /unqualified/);
  core.qualify(t, s, { attempt: result.attempt, commit: BASELINE, reviewer: 'PELORA-04', evidence: 'synthetic independent check', passed: true }, meta);
  assert.equal(s.tasks[t.id].state, 'QUALIFIED'); core.finish(t, s, 'COMPLETE'); assert.equal(s.tasks[t.id].state, 'COMPLETE');
  assert(!s.tasks[t.id].evidence.deployed && !s.tasks[t.id].evidence.live);
});
for (const [name, patch, metaPatch, message] of [
  ['stale result', { attempt: 'old' }, {}, /stale/], ['changed task digest', { taskDigest: 'bad' }, {}, /stale/],
  ['branch mismatch', { branch: 'main' }, {}, /branch/], ['SHA mismatch', { commit: 'a'.repeat(40) }, {}, /SHA/],
  ['different repository baseline', {}, { baselineAncestor: false }, /SHA/], ['dirty result', {}, { clean: false }, /dirty/],
  ['out of scope', {}, { changedFiles: ['backend/server.js'] }, /scope/], ['fake qualified status', { disposition: 'QUALIFIED' }, {}, /mint/],
]) test(`reject ${name} retaining lock`, () => {
  const t = task(), { s, meta, result } = running(t);
  assert.throws(() => core.ingest(t, s, { ...result, ...patch }, { ...meta, ...metaPatch }), message);
  assert.equal(s.tasks[t.id].state, 'RUNNING');
});
test('required tests, stale qualification and self review rejected', () => {
  const t = task('pelora-test-one', { requiredTests: ['check'] }), { s, meta, result } = running(t);
  assert.throws(() => core.ingest(t, s, result, meta), /test/);
  result.tests = [{ name: 'check', outcome: 'PASS', evidence: 'synthetic check receipt' }]; core.ingest(t, s, result, meta);
  const review = { attempt: result.attempt, commit: BASELINE, reviewer: t.owner, passed: true, evidence: 'x' };
  assert.throws(() => core.qualify(t, s, review, meta), /independent/);
  assert.throws(() => core.qualify(t, s, { ...review, attempt: 'old' }, meta), /stale/);
});
test('commit, push and integration evidence remain separate', () => {
  const t = writer('pelora-test-one', 'pelora-control/docs/a.md'); t.pushPolicy = 'allow'; t.permittedActions.push('push'); t.blockedActions = t.blockedActions.filter(x => x !== 'push'); t.expectedDisposition = 'READY_FOR_INTEGRATION';
  const { s, result, meta } = running(t); meta.head = result.commit = 'b'.repeat(40); meta.changedFiles = ['pelora-control/docs/a.md'];
  core.ingest(t, s, result, meta); core.qualify(t, s, { attempt: result.attempt, commit: meta.head, reviewer: 'PELORA-04', evidence: 'check', passed: true }, meta);
  assert.equal(s.tasks[t.id].state, 'COMMITTED'); assert.throws(() => core.recordPush(t, s, 'a'.repeat(40)), /mismatch/);
  core.recordPush(t, s, meta.head); assert.equal(s.tasks[t.id].state, 'PUSHED'); core.finish(t, s, 'READY_FOR_INTEGRATION');
  assert.throws(() => core.finish(t, s, 'INTEGRATED', { commit: meta.head }), /human/);
});
test('restart keeps locks and fences edited queue; reconciliation fences old attempt', () => {
  const t = task(), { q, s, meta, result } = running(t); core.fail(t.id, s, 'uncertain');
  const restarted = core.reload(q, registry, JSON.parse(JSON.stringify(s)));
  assert.equal(restarted.tasks[t.id].state, 'QUALIFICATION_FAILED');
  assert.throws(() => core.reload(queue({ ...t, goal: 'different' }), registry, restarted), /changed/);
  core.reconcile(t, restarted, { attempt: result.attempt, executorStopped: true, operatorRef: 'synthetic operator' }, meta);
  core.begin(t.id, q, restarted); assert.throws(() => core.ingest(t, restarted, result, meta), /stale/);
});
test('governance package needs canonical files and stable task identity', () => {
  const t = task(); assert.throws(() => core.executionPackage(t, 'attempt', {}), /governance/);
  const paths = ['AGENTS.md', ...t.governance.map(k => ({ product: 'docs/PELORA_PRODUCT_CONSTITUTION.md', science: 'docs/PELORA_SCIENCE_GOVERNANCE.md', privacy: 'docs/PELORA_PRIVACY_AND_EVIDENCE_RULES.md', release: 'docs/PELORA_RELEASE_GATES.md', beta: 'docs/Beta_Command_Board_Current_State_v1.md', decisions: 'docs/PELORA_DECISION_LOG.md', ownership: 'docs/agents/EXECUTION_BOARD_v1.md' })[k])];
  const p = core.executionPackage(t, 'attempt', Object.fromEntries(paths.map(x => [x, 'synthetic governance'])));
  assert.equal(p.governance[0].path, 'AGENTS.md'); assert.equal(p.taskDigest, digest(t));
});
test('atomic store reload, concurrent lock denial and exception rollback', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pelora-store-'));
  try {
    const store = new Store(dir); store.transaction(s => { s.revision = 3; });
    assert.equal(new Store(dir).transaction(s => s.revision), 3);
    assert.throws(() => store.transaction(s => { s.revision = 9; throw new Error('abort'); }), /abort/);
    assert.equal(store.transaction(s => s.revision), 3);
    mkdirSync(join(dir, 'controller.lock')); assert.throws(() => store.transaction(() => {}), /busy/);
  } finally { rmSync(dir, { recursive: true }); }
});
test('canonical governance scope cannot omit a human review gate', () => {
  const t = writer('pelora-test-one', 'docs/**'); t.owner = 'PELORA-GOV'; t.type = 'documentation';
  assert.throws(() => core.validateTask(t, registry), /human review/);
  t.approvalRequirements = ['locked-governance-change']; core.validateTask(t, registry);
  const q = queue(t), s = core.reload(q, registry, core.initialState());
  assert.equal(core.readiness(t, q, s).state, 'WAITING_FOR_APPROVAL');
});
test('unknown report/review fields are not persisted', () => {
  const t = task(), { s, meta, result } = running(t);
  result.tests = [{ name: 'synthetic', outcome: 'PASS', evidence: 'synthetic receipt', unrelatedField: 'excluded' }];
  result.unrelatedReport = 'excluded'; core.ingest(t, s, result, meta);
  core.qualify(t, s, { attempt: result.attempt, commit: BASELINE, reviewer: 'PELORA-04', evidence: 'synthetic review', passed: true, unrelatedField: 'excluded' }, meta);
  assert(!JSON.stringify(s).includes('excluded'));
});
