// Qualification-only exact successor. Source semantics come from the unchanged v1 validator.
import {captureWeatherMarineQualityV1} from './weatherMarineQualityCapture.mjs';
import {copy, freeze, keys, check, reference} from '../shared/oceanPublication.mjs';
import {EXACT_SCIENTIFIC_JSON_V1, EXACT_SCIENTIFIC_DIGEST_V1, MAX_EXACT_CAPTURE_BYTES,
  detached, exactJson, exactDigest} from './exactScientificEvidence.mjs';
export const WEATHER_MARINE_QUALITY_CAPTURE_V2 = 'pelora-weather-marine-quality-capture-v2';
export const EXACT_WEATHER_MARINE_REFERENCE_V1 = 'pelora-exact-weather-marine-quality-reference-v1';
const digest = (purpose, content) => exactDigest(WEATHER_MARINE_QUALITY_CAPTURE_V2, purpose, content);
function body(input) {
  const {source, sourceAuthority, location, qualityInputs, lineageReferences} = captureWeatherMarineQualityV1(detached(input));
  return {source, sourceAuthority, location, qualityInputs, lineageReferences};
}
export function captureWeatherMarineQualityV2(input) {
  const p = body(input);
  const scientificContentDigest = digest('scientific-content', {source:p.source, location:p.location, qualityInputs:p.qualityInputs});
  const content = {contractVersion:WEATHER_MARINE_QUALITY_CAPTURE_V2, serializationVersion:EXACT_SCIENTIFIC_JSON_V1,
    digestVersion:EXACT_SCIENTIFIC_DIGEST_V1, ...p, scientificContentDigest};
  const c = {...content, captureId:'wmq2-'+digest('capture-identity', content)};
  check(Buffer.byteLength(exactJson(c),'utf8') <= MAX_EXACT_CAPTURE_BYTES);
  return freeze(c);
}
export function validateWeatherMarineQualityCaptureV2(input) {
  const p = detached(input);
  keys(p,['contractVersion','serializationVersion','digestVersion','source','sourceAuthority','location','qualityInputs','lineageReferences','scientificContentDigest','captureId']);
  check(p.contractVersion === WEATHER_MARINE_QUALITY_CAPTURE_V2 && p.serializationVersion === EXACT_SCIENTIFIC_JSON_V1 && p.digestVersion === EXACT_SCIENTIFIC_DIGEST_V1);
  const c = captureWeatherMarineQualityV2({source:p.source,sourceAuthority:p.sourceAuthority,location:p.location,qualityInputs:p.qualityInputs,lineageReferences:p.lineageReferences});
  check(exactJson(c) === exactJson(p));
  return c;
}
export function serializeWeatherMarineQualityCaptureV2(input) { return exactJson(validateWeatherMarineQualityCaptureV2(input)); }
export function readWeatherMarineQualityCaptureV2(text) {
  check(typeof text === 'string' && Buffer.byteLength(text,'utf8') <= MAX_EXACT_CAPTURE_BYTES);
  const c = validateWeatherMarineQualityCaptureV2(JSON.parse(text));
  check(serializeWeatherMarineQualityCaptureV2(c) === text);
  return c;
}
export function replayWeatherMarineQualityV2(input) {
  const c = validateWeatherMarineQualityCaptureV2(input);
  return freeze(copy({location:c.location,...c.qualityInputs}));
}
export function weatherMarineQualityReferenceV2(input) {
  const c = validateWeatherMarineQualityCaptureV2(input);
  return freeze({kind:'captured',referenceId:c.captureId,contractVersion:WEATHER_MARINE_QUALITY_CAPTURE_V2,sha256:digest(EXACT_WEATHER_MARINE_REFERENCE_V1,c)});
}
export function validateWeatherMarineQualityReferenceV2(input,capture) {
  const r = detached(input);reference(r);
  check(r.kind === 'captured' && r.contractVersion === WEATHER_MARINE_QUALITY_CAPTURE_V2);
  const expected = weatherMarineQualityReferenceV2(capture);
  check(exactJson(r) === exactJson(expected));
  return expected;
}
