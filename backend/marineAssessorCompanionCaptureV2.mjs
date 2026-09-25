// Qualification-only exact companion. No acquisition, availability repair or scientific formulas.
import {captureMarineAssessorCompanionV1} from './marineAssessorCompanionCapture.mjs';
import {captureWeatherMarineQualityV1,weatherMarineQualityReferenceV1} from './weatherMarineQualityCapture.mjs';
import {validateWeatherMarineQualityCaptureV2,validateWeatherMarineQualityReferenceV2,replayWeatherMarineQualityV2} from './weatherMarineQualityCaptureV2.mjs';
import {copy, freeze, keys, check, reference} from '../shared/oceanPublication.mjs';
import {EXACT_SCIENTIFIC_JSON_V1, EXACT_SCIENTIFIC_DIGEST_V1, MAX_EXACT_CAPTURE_BYTES,
  detached, exactJson, exactDigest} from './exactScientificEvidence.mjs';
export const MARINE_ASSESSOR_COMPANION_V2 = 'pelora-marine-assessor-companion-capture-v2';
export const EXACT_MARINE_COMPANION_REFERENCE_V1 = 'pelora-exact-marine-assessor-companion-reference-v1';
const digest = (purpose, content) => exactDigest(MARINE_ASSESSOR_COMPANION_V2,purpose,content);
function body(input,qualityCapture) {
  const q = validateWeatherMarineQualityCaptureV2(qualityCapture),p = detached(input);
  keys(p,['qualityReference','marineInputs','source','lineageReferences']);
  const qualityReference = validateWeatherMarineQualityReferenceV2(p.qualityReference,q);
  // Internal source-schema adapter only. Never accept a historical external binding or serialize this shadow.
  // Reuse v1's full provenance/availability validation; discard all historical IDs and hashes.
  const legacyQuality = captureWeatherMarineQualityV1({source:q.source,sourceAuthority:q.sourceAuthority,
    location:q.location,qualityInputs:q.qualityInputs,lineageReferences:q.lineageReferences});
  const validated = captureMarineAssessorCompanionV1({...p,qualityReference:weatherMarineQualityReferenceV1(legacyQuality)},legacyQuality);
  return {qualityReference,marineInputs:validated.marineInputs,source:validated.source,lineageReferences:validated.lineageReferences};
}
export function captureMarineAssessorCompanionV2(input,q) {
  const p = body(input,q);
  const scientificContentDigest = digest('scientific-content',{qualityReference:p.qualityReference,marineInputs:p.marineInputs,source:p.source});
  const content = {contractVersion:MARINE_ASSESSOR_COMPANION_V2,serializationVersion:EXACT_SCIENTIFIC_JSON_V1,
    digestVersion:EXACT_SCIENTIFIC_DIGEST_V1,...p,scientificContentDigest};
  const c = {...content,captureId:'mac2-'+digest('capture-identity',content)};
  check(Buffer.byteLength(exactJson(c),'utf8') <= MAX_EXACT_CAPTURE_BYTES);
  return freeze(c);
}
export function validateMarineAssessorCompanionV2(input,q) {
  const p = detached(input);
  keys(p,['contractVersion','serializationVersion','digestVersion','qualityReference','marineInputs','source','lineageReferences','scientificContentDigest','captureId']);
  check(p.contractVersion === MARINE_ASSESSOR_COMPANION_V2 && p.serializationVersion === EXACT_SCIENTIFIC_JSON_V1 && p.digestVersion === EXACT_SCIENTIFIC_DIGEST_V1);
  const c = captureMarineAssessorCompanionV2({qualityReference:p.qualityReference,marineInputs:p.marineInputs,source:p.source,lineageReferences:p.lineageReferences},q);
  check(exactJson(c) === exactJson(p));return c;
}
export function serializeMarineAssessorCompanionV2(input,q) {return exactJson(validateMarineAssessorCompanionV2(input,q));}
export function readMarineAssessorCompanionV2(text,q) {
  check(typeof text === 'string' && Buffer.byteLength(text,'utf8') <= MAX_EXACT_CAPTURE_BYTES);
  const c = validateMarineAssessorCompanionV2(JSON.parse(text),q);
  check(serializeMarineAssessorCompanionV2(c,q) === text);return c;
}
export function replayMarineAssessorCompanionV2(input,q) {
  const c = validateMarineAssessorCompanionV2(input,q),result = copy(replayWeatherMarineQualityV2(q));
  for (const [family,values] of Object.entries(c.marineInputs)) {
    const {family:tag,...fields} = values;Object.assign(result[family],copy(fields));
  }
  result.source = copy(c.source);return freeze(result);
}
export function marineAssessorCompanionReferenceV2(input,q) {
  const c = validateMarineAssessorCompanionV2(input,q);
  return freeze({kind:'captured',referenceId:c.captureId,contractVersion:MARINE_ASSESSOR_COMPANION_V2,sha256:digest(EXACT_MARINE_COMPANION_REFERENCE_V1,c)});
}
export function validateMarineAssessorCompanionReferenceV2(input,capture,q) {
  const r = detached(input);reference(r);
  check(r.kind === 'captured' && r.contractVersion === MARINE_ASSESSOR_COMPANION_V2);
  const expected = marineAssessorCompanionReferenceV2(capture,q);
  check(exactJson(r) === exactJson(expected));return expected;
}
