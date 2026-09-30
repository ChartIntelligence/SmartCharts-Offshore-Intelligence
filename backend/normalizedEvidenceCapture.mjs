import {createHash} from 'node:crypto';
import {SOURCE_NORMALIZATION_VERSION, SOURCE_NORMALIZATION_REFERENCE} from './sourceNormalization.mjs';
import {captureCurrentEvidenceV3, serializeCurrentEvidenceCaptureV3, readCurrentEvidenceCaptureV3,
  replayCurrentEvidenceSourceV3, currentCaptureReferenceV3, validateCurrentCaptureReferenceV3} from './currentEvidenceCaptureV3.mjs';
import {readCurrentEvidenceCaptureV1} from './currentEvidenceCapture.mjs';
import {readCurrentEvidenceCaptureV2} from './currentEvidenceCaptureV2.mjs';
import {exactJson, MAX_EXACT_CAPTURE_BYTES} from './exactScientificEvidence.mjs';
import {copy, freeze, keys, check, hash} from '../shared/oceanPublication.mjs';

export const NORMALIZED_CURRENT_HANDOFF_V1 = 'pelora-normalized-current-handoff-v1';
const fields = ['speedKnots','directionDegrees','eastwardMetersPerSecond','northwardMetersPerSecond',
  'observedAt','source','requestedLatitude','requestedLongitude','resolvedLatitude','resolvedLongitude'];
const sha = text => createHash('sha256').update(text).digest('hex');
function requireVersion(version) {
  if (version !== SOURCE_NORMALIZATION_VERSION) throw new TypeError('Normalization processing version required');
}
function requireLineage(refs) {
  check(Array.isArray(refs));
  const versions = refs.filter(r => r?.contractVersion?.startsWith('pelora-source-normalization-'));
  check(versions.length === 1 && exactJson(versions[0]) === exactJson(SOURCE_NORMALIZATION_REFERENCE));
}
function splitPoint(point) {
  const context = copy(point), captured = {};
  for (const field of fields) if (Object.hasOwn(context, field)) { captured[field] = context[field]; delete context[field]; }
  const failed = captured.source?.availability === 'available' &&
    Number.isFinite(captured.eastwardMetersPerSecond) && Number.isFinite(captured.northwardMetersPerSecond) && captured.speedKnots === null;
  if (Object.hasOwn(context,'speedDerivationFailed')) { check(context.speedDerivationFailed === failed); delete context.speedDerivationFailed; }
  captured.speedDerivationFailed = failed;
  return {captured,context};
}
// Only NEW normalized evidence: version is mandatory, never inferred from history.
export function captureNewNormalizedCurrentPoint(point, sourceAuthority, lineageReferences = [], normalizationVersion) {
  requireVersion(normalizationVersion);
  const refs = [...lineageReferences, SOURCE_NORMALIZATION_REFERENCE]; requireLineage(refs);
  return captureCurrentEvidenceV3({family:'CURRENTS',sourceAuthority,
    samples:[{role:'center',outcome:'FULFILLED',point:splitPoint(point).captured}],lineageReferences:refs});
}
function recordedSourceAuthority(point) {
  // Binds recorded provider metadata, not processing semantics or source qualification.
  const {provider,dataset,classification} = point.source;
  const metadata = {provider,dataset,classification};
  return {status:'RECORDED_NOT_REQUALIFIED',reference:{kind:'captured',
    referenceId:'recorded-current-source-'+hash(metadata),contractVersion:'pelora-recorded-current-source-metadata-v1',sha256:hash(metadata)}};
}
function handoffDigest(content) { return sha(exactJson(content)); }
export function encodeNormalizedCurrentHandoff(point, normalizationVersion) {
  requireVersion(normalizationVersion);
  if (point?.contractVersion === NORMALIZED_CURRENT_HANDOFF_V1) {
    decodeNormalizedCurrentHandoff(point);
    return freeze(copy(point));
  }
  const {captured,context} = splitPoint(point);
  const samples = [{role:'center',outcome:'FULFILLED',point:captured}];
  const spatial = context.derived?.spatialAnalysis?.spatialStructure;
  if (spatial?.vectors) spatial.vectors = spatial.vectors.map(vector => {
    const split = splitPoint(vector);
    samples.push({role:vector.direction,outcome:'FULFILLED',point:split.captured});
    return split.context;
  });
  const capture = captureCurrentEvidenceV3({family:'CURRENTS',sourceAuthority:recordedSourceAuthority(captured),
    samples,lineageReferences:[SOURCE_NORMALIZATION_REFERENCE]});
  const content = {contractVersion:NORMALIZED_CURRENT_HANDOFF_V1,reference:currentCaptureReferenceV3(capture),
    captureText:serializeCurrentEvidenceCaptureV3(capture),contextText:exactJson(context)};
  check(Buffer.byteLength(content.captureText)+Buffer.byteLength(content.contextText)<=MAX_EXACT_CAPTURE_BYTES);
  // This checksum binds the transport remainder to its capture; it is not a scientific digest.
  return freeze({...content,sha256:handoffDigest(content)});
}
export function decodeNormalizedCurrentHandoff(input) {
  const p=copy(input);keys(p,['contractVersion','reference','captureText','contextText','sha256']);
  check(p.contractVersion===NORMALIZED_CURRENT_HANDOFF_V1 && typeof p.captureText==='string' && typeof p.contextText==='string');
  check(Buffer.byteLength(p.captureText)+Buffer.byteLength(p.contextText)<=MAX_EXACT_CAPTURE_BYTES);
  const {sha256,...content}=p;check(sha256===handoffDigest(content));
  const capture=readCurrentEvidenceCaptureV3(p.captureText);validateCurrentCaptureReferenceV3(p.reference,capture);requireLineage(capture.lineageReferences);
  const context=copy(JSON.parse(p.contextText));check(exactJson(context)===p.contextText);
  const samples=replayCurrentEvidenceSourceV3(capture).samples,center=samples.find(x=>x.role==='center');
  check(center?.outcome==='FULFILLED');
  function merge(extra,point) { check(![...fields,'speedDerivationFailed'].some(k=>Object.hasOwn(extra,k)));return {...extra,...point}; }
  const spatial=context.derived?.spatialAnalysis?.spatialStructure;
  const used=new Set(['center']);
  if(spatial?.vectors) spatial.vectors=spatial.vectors.map(extra=>{const sample=samples.find(x=>x.role===extra.direction);
    check(sample?.outcome==='FULFILLED'&&!used.has(sample.role));used.add(sample.role);return merge(extra,sample.point);});
  check(used.size===samples.length);
  return freeze(merge(context,center.point));
}
function normalizedObservation(observation, encode, version) {
  if(!observation || !Object.hasOwn(observation.observations??{},'currents')) return observation;
  const point=observation.observations.currents;
  const refs=observation.lineage?.processingReferences;
  if(!encode && point?.contractVersion!==NORMALIZED_CURRENT_HANDOFF_V1) {
    // Unmarked historical point shapes retain their original semantics. A newly
    // normalized persisted point cannot fall back to a lossy raw representation.
    check(!point?.contractVersion && !refs?.some(r=>r?.contractVersion?.startsWith('pelora-source-normalization-')));
    return observation;
  }
  requireLineage(refs);
  return {...observation,observations:{...observation.observations,currents:encode?
    encodeNormalizedCurrentHandoff(point,version):decodeNormalizedCurrentHandoff(point)}};
}
export function encodeNormalizedOceanSnapshot(snapshot, normalizationVersion) {
  requireVersion(normalizationVersion);
  return snapshot ? {...snapshot,observation:normalizedObservation(snapshot.observation,true,normalizationVersion)} : snapshot;
}
export function decodeNormalizedOceanSnapshot(snapshot) {
  return snapshot ? {...snapshot,observation:normalizedObservation(snapshot.observation,false)} : snapshot;
}
export function encodeNormalizedOceanResponse(payload, normalizationVersion) {
  requireVersion(normalizationVersion);
  // These are the literal live snapshot handoff slots, not a recursive path heuristic.
  return {...payload,
    ...(payload.observationSnapshot?{observationSnapshot:normalizedObservation(payload.observationSnapshot,true,normalizationVersion)}:{}),
    ...(payload.oceanSnapshot?{oceanSnapshot:encodeNormalizedOceanSnapshot(payload.oceanSnapshot,normalizationVersion)}:{})};
}
export function hasNormalizedCurrentProvenance(snapshot) {
  return snapshot?.observation?.lineage?.processingReferences?.some(r=>r?.contractVersion?.startsWith('pelora-source-normalization-')) === true;
}
// Explicit version dispatch: no implicit historical normalization upgrade.
export function readVersionedCurrentEvidence(text) {
  if(typeof text!=='string') throw new TypeError('Capture wire text is required');
  const readers={'pelora-governed-current-evidence-capture-v1':readCurrentEvidenceCaptureV1,
    'pelora-governed-current-evidence-capture-v2':readCurrentEvidenceCaptureV2,
    'pelora-governed-current-evidence-capture-v3':readCurrentEvidenceCaptureV3};
  const version=JSON.parse(text).contractVersion;if(!Object.hasOwn(readers,version))throw new TypeError('Unsupported current capture version');
  return readers[version](text);
}
