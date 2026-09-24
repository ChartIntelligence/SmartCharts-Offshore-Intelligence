// Explicitly invoked background-worker foundation. Never imported by server startup.
import {writeOceanArchiveV1, readOceanArchiveV1} from '../../shared/oceanProductArchive.mjs';
import {candidateOf, candidateKey, discoveryManifest, parseDiscovery, acquireBounded, normalizeNoaaSst,
  QUALIFICATION_DIGEST, PRODUCT, DATASET, check, exact, iso, digest, freeze} from './noaaSstSource.mjs';

export const SST_WORKER_CONTRACT = 'pelora-sst-ocean-state-worker-v1';
export const DISPLAY_POLICY = 'complete-frame-outward-whole-F-zero-clipping-v1';
const detached = v => freeze(structuredClone(v));
export function compareCandidate(latest, discovery) {
  try {
  check(discovery && ['ADVERTISED','NO_CANDIDATE','DISCOVERY_FAILURE'].includes(discovery.status), 'discovery-state');
  if (discovery.status === 'DISCOVERY_FAILURE') return 'DISCOVERY_FAILURE';
  if (discovery.status === 'NO_CANDIDATE') { check(discovery.candidate === null, 'discovery-state'); return 'NO_CANDIDATE'; }
  const c = candidateOf(discovery.candidate);
  if (!latest) return 'NEW_CANDIDATE';
  const previous = candidateOf(latest.candidate);
  if (c.nominalTime < previous.nominalTime) return 'SOURCE_REGRESSION';
  if (c.nominalTime > previous.nominalTime) return 'NEW_CANDIDATE';
  // Coordinate equality without an object revision cannot establish unchanged bytes.
  return c.revision !== null && c.revision === previous.revision ? 'SAME_AS_QUALIFIED' : 'AMBIGUOUS_REVISION';
  } catch { return 'DISCOVERY_FAILURE'; }
}
export function freshnessInputs(candidate, times) {
  const nominal = Date.parse(candidateOf(candidate).nominalTime);
  exact(times, ['discoveredAt','acquiredAt','assessedAt']);
  iso(times.assessedAt);
  const lag = t => {
    if (t === null) return null;
    const hours = (Date.parse(iso(t)) - nominal) / 3600000;
    check(hours >= 0, 'time-precedes-evidence'); return hours;
  };
  return freeze({evidenceAgeHours: lag(times.assessedAt), discoveryLagHours: lag(times.discoveredAt),
    acquisitionLagHours: lag(times.acquiredAt), freshness: 'UNASSESSED', policyDecision: 'THRESHOLD_DECISION_REQUIRED',
    providerPublicationLatencyHours: null});
}
export function completeFrameDomain(frame) {
  const c = frame.payload.components.find(c => c.variableId === 'analysed_sst');
  check(c?.unit === 'K' && c.values.length === c.missing.length, 'sst-domain-source');
  let min = Infinity, max = -Infinity;
  c.values.forEach((v,i) => {
    check(c.missing[i] === null ? typeof v === 'number' && Number.isFinite(v) : v === null, 'domain-numeric-integrity');
    if (c.missing[i] === null) { min = Math.min(min,v); max = Math.max(max,v); }
  });
  check(Number.isFinite(min), 'no-valid-sst');
  const f = k => (k - 273.15) * 1.8 + 32;
  const domainF = [Math.floor(f(min)), Math.ceil(f(max))];
  return freeze({policy: DISPLAY_POLICY, frameId: frame.frameId, domainF,
    domainK: domainF.map(v => (v - 32) / 1.8 + 273.15), clipping: 0,
    constantDomain: domainF[0] === domainF[1]});
}

/** Required external guarantees (not implemented here):
 * state.claim(key, owner) atomically creates a persistent one-attempt claim;
 * state.complete(key, owner, accepted) atomically commits the exact immutable result;
 * state.compareAndSet(expectedVersion, value) returns the durable accepted snapshot;
 * raw.retain(receipt, bytes) conditionally retains exact bytes + first acquisition receipt.
 * No automatic claim expiration/retry: uncertain/crashed attempts require reconciliation.
 * All ports are trusted server dependencies, never query/environment-selected.
 */
export function createSstWorkerV1(config) {
  exact(config, ['state','archive','raw','transport','authorize','assess']);
  const {state, archive, raw, transport, authorize, assess} = config;
  for (const [object, methods] of [[state,['readPointer','readCandidate','claim','complete','compareAndSet']],
    [archive,['createIfAbsent','readExact']],[raw,['retain']],[transport,['discover','open']]]) {
    check(object && methods.every(k => typeof Object.getOwnPropertyDescriptor(object,k)?.value === 'function'), 'explicit-port-required');
  }
  check(typeof authorize === 'function' && typeof assess === 'function', 'explicit-governance-required');

  return async function iterate(input) {
    exact(input, ['iterationId','discoveredAt','acquiredAt','processedAt','assessedAt']);
    check(typeof input.iterationId === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,100}$/.test(input.iterationId), 'iteration-id');
    for (const key of ['discoveredAt','acquiredAt','processedAt','assessedAt']) iso(input[key]);
    check(Date.parse(input.discoveredAt) <= Date.parse(input.acquiredAt) && Date.parse(input.acquiredAt) <= Date.parse(input.processedAt) && Date.parse(input.processedAt) <= Date.parse(input.assessedAt), 'time-order');
    let snapshot, discovery = null, decision = null;
    const report = (status, extra = {}) => {
      let age = null;
      if (snapshot?.value) {
        try { age = freshnessInputs(snapshot.value.candidate, {discoveredAt: snapshot.value.discoveredAt,
          acquiredAt: snapshot.value.acquiredAt, assessedAt: input.assessedAt}); }
        catch { status = 'INVALID_ASSESSMENT_TIME'; }
      }
      return detached({contractVersion: SST_WORKER_CONTRACT, status, candidateDecision: decision,
        discovery, lastQualified: snapshot?.value ?? null, age, ...extra});
    };
    try {
      snapshot = await state.readPointer();
      exact(snapshot, ['version','value']);
      check(Number.isSafeInteger(snapshot.version) && snapshot.version >= 0, 'pointer-version');
      if (snapshot.value !== null) { check(Object.hasOwn(snapshot.value,'assessment'), 'pointer-admission-required'); await verifyAccepted(snapshot.value); }
    } catch { snapshot = null; return report('STATE_UNAVAILABLE'); }
    if (snapshot.value && Date.parse(input.assessedAt) < Date.parse(snapshot.value.candidate.nominalTime)) return report('INVALID_ASSESSMENT_TIME');
    try {
      const response = await transport.discover(discoveryManifest);
      check(response.redirects === 0 && response.retries === 0, 'discovery-attempt-policy');
      discovery = parseDiscovery(response.bytes, {url: response.url, status: response.status,
        discoveredAt: input.discoveredAt, responseValidator: response.responseValidator});
      check(!discovery.candidate || discovery.candidate.nominalTime <= iso(input.discoveredAt), 'future-coordinate');
      decision = compareCandidate(snapshot.value, discovery);
    } catch { decision = 'DISCOVERY_FAILURE'; return report('DISCOVERY_FAILURE'); }
    if (['NO_CANDIDATE','SOURCE_REGRESSION','SAME_AS_QUALIFIED','DISCOVERY_FAILURE'].includes(decision)) return report(decision);
    // A same-time revision is always manual review, even with a changed validator.
    if (decision === 'AMBIGUOUS_REVISION') return report('REVISION_REVIEW_REQUIRED');
    const candidate = discovery.candidate, key = candidateKey(candidate);
    let accepted;
    try {
      const prior = await state.readCandidate(key);
      if (prior?.status === 'COMPLETE') {
        accepted = prior.accepted;
        check(candidateKey(accepted.candidate) === key, 'ledger-candidate');
        await verifyAccepted(accepted);
      } else if (prior !== null) return report('ACQUISITION_ALREADY_ATTEMPTED');
      else {
        // Both download authorization AND exact reviewed profile identity are mandatory.
        const permission = await authorize(detached({candidate, qualificationDigest: QUALIFICATION_DIGEST}));
        exact(permission, ['acquisitionAuthorized','qualificationDigest']);
        if (permission.acquisitionAuthorized !== true || permission.qualificationDigest !== QUALIFICATION_DIGEST) return report('QUALIFICATION_OR_ACQUISITION_APPROVAL_REQUIRED');
        if (await state.claim(key, input.iterationId) !== true) return report('ACQUISITION_ALREADY_ATTEMPTED');
        let acquired;
        try { acquired = await acquireBounded(transport, candidate, input.acquiredAt); }
        catch { return report('ACQUISITION_FAILED'); }
        const retained = await raw.retain(acquired.receipt, acquired.bytes);
        check(retained?.durable === true && retained.sha256 === acquired.receipt.sha256 && retained.bodyBytes === acquired.bytes.length &&
          retained.reference === acquired.receipt.reference && digest(retained.receipt) === digest(acquired.receipt), 'raw-retention-ack');
        let frame;
        try { frame = normalizeNoaaSst(acquired.bytes, acquired.receipt, candidate, permission.qualificationDigest); }
        catch { return report('VALIDATION_FAILED'); }
        const archived = await writeOceanArchiveV1(archive, frame, {writeId: `sst-${key}`, archivedAt: input.processedAt,
          storageReference: 'sst-worker-injected-archive', sourceRevision: candidate.revision,
          rawEvidence: [{reference: acquired.receipt.reference, sha256: acquired.receipt.sha256, availability: 'retained'}]});
        if (archived.status !== 'ARCHIVED') return report(archived.status);
        accepted = detached({candidate, archiveId: archived.receipt.archiveId, frameId: frame.frameId,
          contentDigest: archived.receipt.contentDigest, frameDigest: archived.receipt.frameDigest, receiptDigest: archived.receipt.receiptDigest,
          rawSha256: acquired.receipt.sha256, discoveredAt: discovery.discoveredAt, acquiredAt: acquired.receipt.completedAt,
          processedAt: iso(input.processedAt), presentation: completeFrameDomain(frame),
          qualificationDigest: permission.qualificationDigest});
        await verifyAccepted(accepted); // Verify exact durable readback before recording completion/admission.
        check(await state.complete(key, input.iterationId, accepted) === true, 'ledger-completion');
      }
      const age = freshnessInputs(candidate, {discoveredAt: accepted.discoveredAt, acquiredAt: accepted.acquiredAt, assessedAt: input.assessedAt});
      const assessment = await assess(detached({accepted, age, assessedAt: iso(input.assessedAt)}));
      exact(assessment, ['status','policyId','evidenceReceiptDigest','assessedAt']);
      check(['ADMISSIBLE','INADMISSIBLE','THRESHOLD_DECISION_REQUIRED'].includes(assessment.status) &&
        (assessment.policyId === null || typeof assessment.policyId === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,150}$/.test(assessment.policyId)) &&
        assessment.evidenceReceiptDigest === accepted.receiptDigest && iso(assessment.assessedAt) === iso(input.assessedAt), 'assessment-binding');
      if (assessment.status !== 'ADMISSIBLE') return report(assessment.status, {accepted, assessment});
      check(typeof assessment.policyId === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,150}$/.test(assessment.policyId) && age.evidenceAgeHours >= 0, 'admissibility-policy');
      const value = detached({...accepted, assessment});
      const ack = await state.compareAndSet(snapshot.version, value);
      if (ack.status === 'CONFLICT') return report('POINTER_CONFLICT', {accepted});
      check(ack.status === 'UPDATED' && ack.durable === true && ack.version === snapshot.version + 1 && digest(ack.value) === digest(value), 'pointer-ack');
      snapshot = {version: ack.version, value};
      return report('POINTER_ADVANCED');
    } catch { return report('WORKER_FAILED'); }
  };

  async function verifyAccepted(a) {
    const names = ['candidate','archiveId','frameId','contentDigest','frameDigest','receiptDigest','rawSha256',
      'discoveredAt','acquiredAt','processedAt','presentation','qualificationDigest'];
    exact(a, Object.hasOwn(a,'assessment') ? [...names,'assessment'] : names);
    if (Object.hasOwn(a,'assessment')) {
      exact(a.assessment, ['status','policyId','evidenceReceiptDigest','assessedAt']);
      check(a.assessment.status === 'ADMISSIBLE' && a.assessment.evidenceReceiptDigest === a.receiptDigest &&
        typeof a.assessment.policyId === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,150}$/.test(a.assessment.policyId), 'stored-admission');
      iso(a.assessment.assessedAt);
    }
    iso(a.discoveredAt); iso(a.acquiredAt); iso(a.processedAt);
    candidateOf(a.candidate);
    freshnessInputs(a.candidate, {discoveredAt: a.discoveredAt, acquiredAt: a.acquiredAt,
      assessedAt: a.assessment?.assessedAt ?? a.processedAt});
    check(Date.parse(a.discoveredAt) <= Date.parse(a.acquiredAt) && Date.parse(a.acquiredAt) <= Date.parse(a.processedAt), 'stored-time-order');
    if (a.assessment) check(Date.parse(a.processedAt) <= Date.parse(a.assessment.assessedAt), 'stored-assessment-order');
    const read = await readOceanArchiveV1(archive, {archiveId: a.archiveId, frameId: null});
    check(read.status === 'ARCHIVED' && read.receipt.receiptDigest === a.receiptDigest && read.frame.frameId === a.frameId &&
      read.frame.product.productId === PRODUCT && read.frame.product.datasetId === DATASET &&
      read.frame.product.providerId === 'NOAA-NESDIS-OSPO' && read.frame.product.evidenceClass === 'ANALYSIS' &&
      read.receipt.contentDigest === a.contentDigest && read.receipt.frameDigest === a.frameDigest &&
      read.receipt.rawEvidence.some(r => r.sha256 === a.rawSha256 && r.availability === 'retained') &&
      read.frame.provenance.steps[0].parameters.find(p => p.name === 'nominalTime')?.value === a.candidate.nominalTime &&
      read.frame.provenance.steps[0].parameters.find(p => p.name === 'revision')?.value === a.candidate.revision &&
      read.frame.temporal.acquiredAt === a.acquiredAt &&
      read.receipt.archivedAt === a.processedAt &&
      digest(completeFrameDomain(read.frame)) === digest(a.presentation) && a.qualificationDigest === QUALIFICATION_DIGEST, 'stored-state-integrity');
  }
}

// Review relationship only; neither revision wins qualification automatically.
export function revisionRelationship(original, proposed) {
  check(candidateOf(original.candidate).nominalTime === candidateOf(proposed.candidate).nominalTime, 'revision-period');
  check(/^[a-f0-9]{64}$/.test(original.rawSha256) && /^[a-f0-9]{64}$/.test(proposed.rawSha256), 'revision-checksum');
  return freeze({kind: original.rawSha256 === proposed.rawSha256 ? 'SAME_RAW_BYTES' : 'CHANGED_EVIDENCE_REVIEW_REQUIRED',
    originalFrameId: original.frameId, proposedFrameId: proposed.frameId, automaticReplacement: false});
}
