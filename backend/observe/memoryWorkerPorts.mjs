import {check, freeze, same, utc} from './canonical.mjs';
import {validateManifest} from './manifest.mjs';
import {validateActivation} from './activation.mjs';
import {authorizeJob, validateJob} from './jobs.mjs';
import {attemptIdFor} from './provenance.mjs';
import {snapshot, responseReference, responseBytes} from './workerData.mjs';

// Explicit FAKE control plane. Admin methods belong to test composition, never run input.
// No durability, protected registry, distributed fencing, cadence or rate-limit claim.
export function createMemoryControl(initialContext) {
  const source = snapshot(initialContext), manifest = validateManifest(source.manifest);
  let activation = validateActivation(source.activation), trustedState = snapshot(source.trustedState);
  const handles = new WeakMap(), jobs = new Map(); let nextFence = 0;
  function current(handle, at, running) {
    const attempt = handles.get(handle);
    check(attempt && jobs.get(attempt.job.jobId) === attempt && !attempt.done && (!running || attempt.running), 'attempt-not-owned');
    const job = authorizeJob(manifest, activation, trustedState, attempt.job, at);
    check(utc(at) - utc(job.window.start) <= manifest.schedule.permittedExecutionDelayMs || attempt.running, 'late-attempt');
    return freeze({context:{manifest,activation,trustedState,job}, attempt:{attemptId:attempt.attemptId,attemptNumber:attempt.attemptNumber,fencingToken:attempt.fencingToken}});
  }
  return {
    port:Object.freeze({
      claim(handle, at) { const state = current(handle, at, false), a = handles.get(handle); check(!a.running, 'duplicate-attempt'); a.running = true; return state; },
      check(handle, at) { return current(handle, at, true); },
      release(handle) { const a = handles.get(handle); if (a) { a.done = true; a.running = false; } }
    }),
    issue(jobInput, at) {
      const job = validateJob(manifest, snapshot(jobInput)); authorizeJob(manifest, activation, trustedState, job, at);
      const previous = jobs.get(job.jobId), attemptNumber = (previous?.attemptNumber ?? 0) + 1;
      check(attemptNumber <= manifest.retry.maxAttempts, 'attempt-budget');
      const fencingToken = ++nextFence, handle = Object.freeze({});
      const a = {job,attemptNumber,fencingToken,attemptId:attemptIdFor(job.jobId,attemptNumber,fencingToken),running:false,done:false};
      jobs.set(job.jobId,a); handles.set(handle,a); return handle;
    },
    updateActivation(next, trusted) { activation = validateActivation(snapshot(next)); trustedState = snapshot(trusted); }
  };
}

export function createMemoryTimePolicy(policyReference, selectedTime) {
  const approved = snapshot(policyReference); let selected = selectedTime;
  return {port:Object.freeze({async select(reference) { check(same(reference,approved), 'time-policy-mismatch'); return {policyReference:approved,selectedProviderTime:selected}; }}),
    set(value) { selected = value; }};
}

export function createMemoryResponseStore() {
  const rows = new Map();
  return Object.freeze({
    async retain(bytes) { const copy = responseBytes(bytes,16777216), reference = responseReference(copy); rows.set(reference.id,copy); return {status:'ACKNOWLEDGED',reference}; },
    async read(reference) { const value = rows.get(reference.id); return value ? {status:'FOUND',bytes:Buffer.from(value)} : {status:'MISSING'}; }
  });
}

export function createMemoryResultStore() {
  const pending = new Map(), accepted = new Map();
  return Object.freeze({
    async write(record) { const copy = snapshot(record); if (accepted.has(copy.execution.jobId)) return {status:'REJECTED'};
      pending.set(copy.execution.attemptId,copy); return {status:'ACKNOWLEDGED'}; },
    async read(attemptId) { return pending.get(attemptId) ?? null; },
    // Synchronous compare-and-accept in one JS turn, deliberately not a database guarantee.
    accept(record, authorize, retainedAt) {
      const copy = snapshot(record), jobId = copy.execution.jobId;
      check(pending.get(copy.execution.attemptId) && JSON.stringify(pending.get(copy.execution.attemptId)) === JSON.stringify(copy), 'pending-readback-mismatch');
      check(!accepted.has(jobId), 'job-already-accepted'); authorize(); utc(retainedAt);
      const result = freeze({status:'ACKNOWLEDGED',retainedAt,record:copy}); accepted.set(jobId,result); pending.delete(copy.execution.attemptId); return result;
    },
    discard(attemptId) { pending.delete(attemptId); },
    readAccepted(jobId) { return accepted.get(jobId) ?? null; },
    counts() { return {pending:pending.size,accepted:accepted.size}; }
  });
}
