import {check, data, keys, utc, iso, digest, freeze, same} from './canonical.mjs';
import {validateManifest} from './manifest.mjs';
import {resolveActivation} from './activation.mjs';

export const JOB = 'pelora-current-observation-job-v1';
export function createJob(manifest, cellKey, windowStart) {
  const m = validateManifest(manifest);
  return jobFromValidated(m, m.sampling.cells.find(c => c.key === cellKey), windowStart);
}
function jobFromValidated(m, cell, windowStart) {
  const start = utc(windowStart), s = m.schedule;
  check(start >= utc(s.anchor) && (start - utc(s.anchor)) % s.intervalMs === 0, 'unaligned-window');
  check(start >= utc(m.effectiveFrom) && start < utc(m.effectiveUntil), 'window-outside-manifest');
  check(cell, 'unauthorized-cell'); const cellKey = cell.key;
  const window = {start:windowStart, end:iso(start + s.intervalMs)};
  const identity = {contractVersion:JOB, manifestDigest:m.digest, cellKey, window};
  return freeze({...identity, jobId:'coj1-' + digest(JOB + '/identity', identity), manifestReference:{id:m.id,version:m.version,sha256:m.digest},
    samplingReference:m.samplingReference, product:m.product, gridReference:m.gridReference, cell,
    deadline:iso(Math.min(start + s.deadlineMs, utc(m.effectiveUntil)))});
}
export function validateJob(manifest, input) {
  const j = data(input); check(j && typeof j === 'object', 'job');
  const expected = createJob(manifest, j.cellKey, j.window?.start);
  check(same(j, expected), 'job-mismatch'); return expected;
}
export function authorizeJob(manifest, activation, trustedState, job, at) {
  const m = validateManifest(manifest), j = validateJob(m, job);
  const a = resolveActivation(m, activation, trustedState, at);
  check(utc(j.window.start) >= utc(a.effectiveAt), 'retroactive-job');
  check(utc(at) >= utc(j.window.start) && utc(at) < utc(j.deadline), 'job-execution-time');
  return j;
}

// Strict input allowlist: no clock, environment, application state or I/O dependencies.
export function planJobs(input) {
  const p = data(input); keys(p, ['manifest','activation','trustedState','range','asOf']); keys(p.range, ['from','until']);
  const m = validateManifest(p.manifest), now = utc(p.asOf);
  const a = resolveActivation(m, p.activation, p.trustedState, p.asOf);
  const from = utc(p.range.from), until = utc(p.range.until); check(from < until, 'planning-range');
  const s = m.schedule, anchor = utc(s.anchor), current = Math.floor((now - anchor) / s.intervalMs);
  const lower = Math.max(from, utc(m.effectiveFrom), utc(a.effectiveAt), anchor,
    now - s.catchUpMaxAgeMs, anchor + (current - s.catchUpMaxWindows + 1) * s.intervalMs);
  const upper = Math.min(until, utc(m.effectiveUntil), now + 1);
  const first = Math.max(0, Math.ceil((lower - anchor) / s.intervalMs));
  const windows = [];
  for (let slot = first; anchor + slot * s.intervalMs < upper; slot++) {
    const start = anchor + slot * s.intervalMs;
    if (now >= Math.min(start + s.deadlineMs, utc(m.effectiveUntil)) || now - start > s.permittedExecutionDelayMs) continue;
    windows.push(iso(start));
    check(windows.length * m.sampling.cells.length <= m.limits.maxJobsPerPlan && windows.length * m.sampling.cells.length <= m.limits.queueCapacity, 'planning-capacity');
  }
  const jobs = windows.flatMap(start => m.sampling.cells.map(c => jobFromValidated(m, c, start)));
  return freeze({contractVersion:'pelora-observe-plan-v1', asOf:p.asOf, range:p.range, manifestDigest:m.digest,
    activationDigest:a.digest, jobs, exclusionPolicy:'EXPIRED_DELAYED_OR_OUTSIDE_BOUNDED_CATCHUP_NOT_EMITTED'});
}
