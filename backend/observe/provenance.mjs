import {check, data, keys, integer, reference, coordinates, utc, seal, unseal, same, freeze, digest} from './canonical.mjs';
import {validateManifest} from './manifest.mjs';
import {authorizeJob} from './jobs.mjs';
import {readCurrentEvidenceCaptureV3, validateCurrentCaptureReferenceV3} from '../currentEvidenceCaptureV3.mjs';
import {SOURCE_NORMALIZATION_VERSION, SOURCE_NORMALIZATION_REFERENCE} from '../sourceNormalization.mjs';
import {hash as sourceMetadataHash} from '../../shared/oceanPublication.mjs';

export const EXECUTION = 'pelora-observe-execution-v1';
export const BINDING = 'pelora-observe-binding-v1';
const failures = ['PROVIDER_TIMEOUT','PROVIDER_UNAVAILABLE','RATE_LIMITED','PUBLICATION_PENDING','NORMALIZATION_FAILED','REFERENCE_FAILED'];
export function attemptIdFor(jobId, attemptNumber, fencingToken) {
  check(typeof jobId === 'string' && /^coj1-[a-f0-9]{64}$/.test(jobId), 'attempt-job-id');
  integer(attemptNumber,1,20); integer(fencingToken,1);
  return 'coat1-' + digest(EXECUTION + '/attempt', {jobId,attemptNumber,fencingToken});
}

function executionBody(context, input, captureText) {
  const c = data(context); keys(c, ['manifest','activation','trustedState','job']);
  const m = validateManifest(c.manifest), e = data(input);
  keys(e, ['contractVersion','jobId','manifestDigest','cellKey','attemptId','attemptNumber','fencingToken','startedAt','finishedAt','outcome','failure','acquisition','evidenceReference','normalizationVersion']);
  check(e.contractVersion === EXECUTION, 'execution-version');
  integer(e.attemptNumber, 1, m.retry.maxAttempts); integer(e.fencingToken, 1);
  check(e.attemptId === attemptIdFor(e.jobId,e.attemptNumber,e.fencingToken), 'attempt-identity');
  check(utc(e.startedAt) <= utc(e.finishedAt), 'attempt-time-order');
  const j = authorizeJob(m, c.activation, c.trustedState, c.job, e.startedAt);
  authorizeJob(m, c.activation, c.trustedState, j, e.finishedAt);
  check(utc(e.startedAt) - utc(j.window.start) <= m.schedule.permittedExecutionDelayMs, 'late-attempt');
  check(e.jobId === j.jobId && e.manifestDigest === m.digest && e.cellKey === j.cellKey, 'execution-job-binding');
  check(['NORMALIZED','FAILED'].includes(e.outcome), 'execution-outcome');
  if (e.outcome === 'FAILED') {
    check(failures.includes(e.failure) && e.acquisition === null && e.evidenceReference === null && e.normalizationVersion === null && captureText === null, 'failed-attempt-payload');
    return e;
  }
  check(e.failure === null && e.normalizationVersion === SOURCE_NORMALIZATION_VERSION, 'normalization-version');
  const a = e.acquisition;
  keys(a, ['request','response','requestedAt','receivedAt','normalizedAt','retainedResponseReference']);
  const r = a.request;
  keys(r, ['provider','dataset','adapter','gridReference','indices','coordinates','selectedProviderTime']);
  check(r.provider === m.product.provider && r.dataset === m.product.dataset && same(r.adapter,m.product.adapter) && same(r.gridReference,m.gridReference), 'request-source');
  check(same(r.indices,j.cell.indices) && same(r.coordinates,j.cell.coordinates), 'request-cell'); coordinates(r.coordinates);
  const response = a.response;
  keys(response, ['provider','dataset','gridReference','coordinates','observationTime']); coordinates(response.coordinates);
  check(response.provider === r.provider && response.dataset === r.dataset && same(response.gridReference,r.gridReference), 'response-source');
  // V1 supports exact native-cell resolution only; no nearest-cell tolerance.
  check(same(response.coordinates,j.cell.coordinates), 'resolved-cell');
  check(utc(r.selectedProviderTime) === utc(response.observationTime), 'provider-time-mismatch');
  const times = [e.startedAt,a.requestedAt,a.receivedAt,a.normalizedAt,e.finishedAt].map(utc);
  check(times.every((t,i) => i === 0 || t >= times[i-1]), 'acquisition-time-order');
  check(utc(r.selectedProviderTime) <= utc(a.receivedAt), 'future-provider-time');
  check(utc(a.receivedAt) - utc(a.requestedAt) <= m.limits.requestTimeoutMs, 'request-timeout');
  reference(a.retainedResponseReference);
  const capture = readCurrentEvidenceCaptureV3(captureText);
  validateCurrentCaptureReferenceV3(e.evidenceReference,capture);
  check(capture.samples.length === 1 && capture.samples[0].role === 'center' && capture.samples[0].outcome === 'FULFILLED', 'center-only-capture');
  check(same(capture.lineageReferences,[SOURCE_NORMALIZATION_REFERENCE]), 'normalization-lineage');
  check(capture.sourceAuthority.status === 'RECORDED_NOT_REQUALIFIED', 'recorded-source-required');
  const point = capture.samples[0].point;
  check(point.source.provider === r.provider && point.source.dataset === r.dataset, 'capture-provider');
  const source = {provider:point.source.provider,dataset:point.source.dataset,classification:point.source.classification};
  const sourceDigest = sourceMetadataHash(source);
  check(same(capture.sourceAuthority.reference,{kind:'captured',referenceId:'recorded-current-source-'+sourceDigest,
    contractVersion:'pelora-recorded-current-source-metadata-v1',sha256:sourceDigest}), 'capture-source-authority');
  check(point.requestedLatitude === r.coordinates.latitude && point.requestedLongitude === r.coordinates.longitude &&
    !Object.is(point.requestedLatitude,-0) && !Object.is(point.requestedLongitude,-0), 'capture-request-coordinates');
  check(point.resolvedLatitude === response.coordinates.latitude && point.resolvedLongitude === response.coordinates.longitude &&
    !Object.is(point.resolvedLatitude,-0) && !Object.is(point.resolvedLongitude,-0), 'capture-resolved-coordinates');
  check(typeof point.observedAt === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(point.observedAt), 'capture-time-format');
  const observedAt = point.observedAt.includes('.') ? point.observedAt : point.observedAt.replace('Z','.000Z');
  check(utc(observedAt) === utc(response.observationTime), 'capture-time');
  return e;
}

// These are consistency validators, not execution witnesses or authorization minting APIs.
// trustedState and fencing ownership must originate from protected future storage.
export const createExecution = (context, input, captureText = null) => seal(EXECUTION, executionBody(context,input,captureText));
export const validateExecution = (context, input, captureText = null) => createExecution(context,unseal(EXECUTION,input),captureText);

export function createBinding(context, execution, captureText) {
  const e = validateExecution(context,execution,captureText);
  check(e.outcome === 'NORMALIZED', 'no-evidence-binding');
  return seal(BINDING, {contractVersion:BINDING, manifestReference:context.job.manifestReference,
    activationDigest:context.activation.digest, jobId:e.jobId, cellKey:e.cellKey,
    executionDigest:e.digest, attemptId:e.attemptId, fencingToken:e.fencingToken,
    retainedResponseReference:e.acquisition.retainedResponseReference, evidenceReference:e.evidenceReference,
    assurance:'STRUCTURAL_CONSISTENCY_ONLY_REQUIRES_TRUSTED_EXECUTION_WITNESS'});
}
export function validateBinding(context, execution, captureText, input) {
  const body = unseal(BINDING,input), expected = createBinding(context,execution,captureText);
  check(same(seal(BINDING,body),expected), 'binding-mismatch');
  return freeze(expected);
}
