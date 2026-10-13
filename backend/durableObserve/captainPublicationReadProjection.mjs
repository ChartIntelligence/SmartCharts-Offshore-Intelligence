// Offline projection only. The injected port owns strict source validation/ingestion.
// A store-shaped value or matching digest does not authenticate a producer.
import {copy, keys, check, freeze, utc, digest, reference, cycleV2} from '../../shared/oceanPublication.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
import {contextDescriptor, contextKey, versionId, byteHash, RANKED_PUBLICATION} from './publicationEnvelope.mjs';

export const PUBLICATION_READ_PROJECTION = 'pelora-offline-publication-read-projection-v1';
export const SYNTHETIC_PUBLICATION_SCOPE = 'pelora-synthetic-publication-read-scope-v1';
const STORE = 'pelora-published-opportunity-store-v1';
const modes = ['current-cycle', 'exact-cycle', 'latest-successful-history'];
const lifecycles = ['running', 'delayed', 'completed', 'failed', 'withdrawn'];
const equal = (a, b) => exactJson(a) === exactJson(b);
const boundary = value => {
  const d = new Date(utc(value));
  d.setUTCHours(Math.floor(d.getUTCHours() / 4) * 4, 0, 0, 0);
  return d.toISOString();
};
const empty = (resolution, queryContext = null) => freeze({
  contractVersion: PUBLICATION_READ_PROJECTION,
  scope: 'OFFLINE_SYNTHETIC_ONLY', resolution, queryContext,
  source: null, sourceText: null, identity: null, currentPresentation: false,
  operationalAdmission: 'UNKNOWN',
  materialComparison: {state: 'UNRESOLVED', reason: 'NO_QUALIFIED_PRODUCER'},
});

function project(request, response) {
  keys(response, ['status', 'value', 'recordText']);
  check(response.status === 'VALIDATED');
  const s = response.value;
  keys(s, ['contractVersion', 'mode', 'historicalOnly', 'requestedCycle', 'currentCycle',
    'currentCycleStatus', 'lifecycle', 'scientificState', 'record', 'activePublication',
    'isCurrent', 'readAt', 'sourceAgesAtRead', ...(s.record?.controlledQualification ?
      ['qualification', 'operationalPublication'] : [])]);
  check(s.contractVersion === STORE && s.mode === request.mode);
  check(utc(s.readAt) === s.readAt && boundary(s.readAt) === s.currentCycle);
  check(boundary(s.requestedCycle) === s.requestedCycle && s.requestedCycle <= s.currentCycle);
  check(s.requestedCycle === (request.mode === 'exact-cycle' ? request.scheduledAt : s.currentCycle));
  const historical = request.mode === 'latest-successful-history' || s.requestedCycle < s.currentCycle;
  check(s.historicalOnly === historical && [...lifecycles, 'missing'].includes(s.currentCycleStatus));
  check(Array.isArray(s.sourceAgesAtRead));
  const queryContext = request.mode === 'current-cycle' ? 'current' : 'historical';
  const p = s.record;
  if (p === null) {
    check(s.lifecycle === 'missing' && s.scientificState === null && s.activePublication === null &&
      s.isCurrent === false && s.sourceAgesAtRead.length === 0 && response.recordText === null);
    return freeze({...empty('NO_RECORD', queryContext), source: s});
  }
  keys(p, ['contractVersion', 'context', 'contextKey', 'cycle', 'assessmentCutoff', 'execution',
    'publicationAt', 'revision', 'parentId', 'action', 'lifecycle', 'reason', 'producerBundle',
    'versionId', 'contentDigest', ...(p.controlledQualification ? ['controlledQualification'] : [])]);
  check(p.contractVersion === RANKED_PUBLICATION);
  check(equal(p.context, request.scope.context) && p.contextKey === contextKey(request.scope.context));
  check(p.context.species === 'blue-marlin' && equal(p.cycle.region, p.context.region));
  check(equal(cycleV2({scheduledAt: p.cycle.scheduledAt, region: p.cycle.region, configuration: p.cycle.configuration}), p.cycle));
  keys(p.execution, ['startedAt', 'finishedAt']);
  check(utc(p.execution.startedAt) >= p.assessmentCutoff);
  if (p.execution.finishedAt !== null) check(utc(p.execution.finishedAt) >= p.execution.startedAt);
  check(utc(p.publicationAt) >= (p.execution.finishedAt ?? p.execution.startedAt));
  check(boundary(p.cycle.scheduledAt) === p.cycle.scheduledAt && p.assessmentCutoff === p.cycle.scheduledAt);
  check(request.mode === 'latest-successful-history' ? p.cycle.scheduledAt <= s.requestedCycle :
    p.cycle.scheduledAt === s.requestedCycle);
  check(Number.isSafeInteger(p.revision) && p.revision >= 1);
  check(p.versionId === versionId(p.contextKey, p.cycle.scheduledAt, p.revision));
  check(['ORIGINAL', 'STATUS', 'CORRECTION', 'WITHDRAWAL'].includes(p.action));
  check((p.revision === 1) === (p.action === 'ORIGINAL') && (p.revision === 1) === (p.parentId === null));
  if (p.parentId !== null) check(/^rpv1-[a-f0-9]{64}$/.test(p.parentId));
  check(lifecycles.includes(p.lifecycle) && s.lifecycle === p.lifecycle);
  check((p.action === 'WITHDRAWAL') === (p.lifecycle === 'withdrawn'));
  check(p.action !== 'CORRECTION' || p.lifecycle === 'completed');
  const science = p.producerBundle?.evaluationState?.state ?? null;
  check(p.lifecycle === 'completed' ? ['available', 'governed-zero', 'partial', 'unavailable'].includes(science) :
    p.producerBundle === null);
  check(s.scientificState === science);
  if (p.producerBundle !== null) {
    const b = p.producerBundle;
    keys(b, ['binding', 'candidates', 'results', 'searchCounts', 'evidenceFreeze', 'inputsUsed', 'delivery',
      'evaluationState', 'producerVersions', 'producerText', 'producerDigest',
      ...(Object.hasOwn(b, 'controlledComposition') ? ['controlledComposition'] : [])]);
    keys(b.binding, ['cycleId', 'contextKey', 'assessmentCutoff', 'cohortReference', 'evidenceSetId']);
    reference(b.binding.cohortReference);
    check(b.binding.contextKey === p.contextKey && b.binding.cycleId === p.cycle.cycleId &&
      b.binding.assessmentCutoff === p.assessmentCutoff &&
      equal(b.binding.cohortReference, p.cycle.configuration.candidateUniverse.reference));
    check(Array.isArray(b.inputsUsed));
    for (const a of b.inputsUsed) {
      reference(a.reference);
      check(a.reference.sha256 === byteHash(exactJson(a.content)) && a.assessmentCutoff === p.assessmentCutoff);
    }
    // These mechanical checks supplement, never replace, the injected strict validator.
    // No eligibility, adequacy, classification, confidence or ranking is recomputed.
  }
  const usable = p.lifecycle === 'completed' && science !== 'unavailable';
  check(equal(s.activePublication, usable ? p : null) && s.isCurrent === (!historical && usable));
  const {contentDigest, ...body} = p;
  digest(contentDigest); check(contentDigest === byteHash(exactJson(body)));
  const text = exactJson(p);
  if (response.recordText !== null) check(typeof response.recordText === 'string' && response.recordText === text);
  if (p.controlledQualification) {
    check(equal(s.qualification, p.controlledQualification) && s.operationalPublication === false &&
      p.controlledQualification.operationalPublishing === false);
  }
  if (request.priorWitness !== null) {
    const w = request.priorWitness;
    keys(w, ['versionId', 'contentDigest', 'text']); digest(w.contentDigest);
    if (w.versionId === p.versionId) check(w.contentDigest === contentDigest && w.text === text);
  }
  return freeze({
    ...empty('RESOLVED', queryContext), source: s,
    sourceText: {text, origin: response.recordText === null ? 'DERIVED_EXACT_SERIALIZATION' : 'PORT_NATIVE_TEXT'},
    identity: {cycleId: p.cycle.cycleId, scheduledAt: p.cycle.scheduledAt, versionId: p.versionId,
      revision: p.revision, parentId: p.parentId, action: p.action, contentDigest},
    currentPresentation: queryContext === 'current' && s.isCurrent,
    operationalAdmission: p.controlledQualification ? 'CONTROLLED_NOT_OPERATIONAL' : 'UNKNOWN',
  });
}

// Trusted composition dependency, NOT a caller-supplied approval Boolean.
// Port returns {status:'VALIDATED', value:<strictly validated store read>, recordText:string|null}
// or {status:'INVALID_BINDING'|'READ_UNAVAILABLE'}. Full envelope/reference validation
// must occur before this boundary; the projection deliberately does not replay science.
export function createOfflinePublicationReadProjection({readValidated}) {
  check(typeof readValidated === 'function');
  return Object.freeze({async read(input) {
    let request;
    try {
      request = freeze(copy(input));
      keys(request, ['scope', 'mode', 'scheduledAt', 'priorWitness']);
      check(modes.includes(request.mode));
      check(request.mode === 'exact-cycle' ? boundary(request.scheduledAt) === request.scheduledAt : request.scheduledAt === null);
      if (request.scope === null) return empty('UNRESOLVED_CONTEXT');
      keys(request.scope, ['contractVersion', 'kind', 'context']);
      check(request.scope.contractVersion === SYNTHETIC_PUBLICATION_SCOPE && request.scope.kind === 'SYNTHETIC_SCOPE_ONLY');
      contextDescriptor(request.scope.context);
    } catch { return empty('INVALID_BINDING'); }
    const queryContext = request.mode === 'current-cycle' ? 'current' : 'historical';
    const query = freeze({context: request.scope.context, mode: request.mode,
      ...(request.mode === 'exact-cycle' ? {scheduledAt: request.scheduledAt} : {})});
    // Unexpected port exceptions propagate, never become a successful empty/unavailable read.
    const raw = await readValidated(query);
    try {
      const response = copy(raw); // Detach once before projection/consumer use.
      if (['READ_UNAVAILABLE', 'INVALID_BINDING'].includes(response.status)) {
        keys(response, ['status']); return empty(response.status, queryContext);
      }
      return project(request, response);
    } catch { return empty('INVALID_BINDING', queryContext); }
  }});
}
