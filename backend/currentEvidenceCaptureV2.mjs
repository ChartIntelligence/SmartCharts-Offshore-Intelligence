// Qualification-only exact source capture. No route, provider, archive or storage integration.
import {EXACT_SCIENTIFIC_JSON_V1, EXACT_SCIENTIFIC_DIGEST_V1, MAX_EXACT_CAPTURE_BYTES,
  detached, exactJson, exactDigest} from './exactScientificEvidence.mjs';
export {EXACT_SCIENTIFIC_JSON_V1, EXACT_SCIENTIFIC_DIGEST_V1, MAX_EXACT_CAPTURE_BYTES};
import {captureCurrentEvidenceV1} from './currentEvidenceCapture.mjs';
import {copy, freeze, keys, check, reference} from '../shared/oceanPublication.mjs';

export const CURRENT_EVIDENCE_CAPTURE_V2 = 'pelora-governed-current-evidence-capture-v2';
// Protocol name; the existing four-field captured-reference wire schema is unchanged.
export const EXACT_CURRENT_REFERENCE_V1 = 'pelora-exact-current-evidence-reference-v1';

const digest = (purpose, content) => exactDigest(CURRENT_EVIDENCE_CAPTURE_V2, purpose, content);
function body(input) {
  // Reuse the locked source schema and normalized scientific semantics in memory only.
  // Discard every historical identity: v1 canonical hashes are never v2 authority.
  const validated = captureCurrentEvidenceV1(detached(input));
  const {family, sourceAuthority, samples, lineageReferences} = validated;
  return {family, sourceAuthority, samples, lineageReferences};
}
export function captureCurrentEvidenceV2(input) {
  const p = body(input);
  const scientificContentDigest = digest('scientific-content', {family: p.family, samples: p.samples});
  const content = {contractVersion: CURRENT_EVIDENCE_CAPTURE_V2, serializationVersion: EXACT_SCIENTIFIC_JSON_V1,
    digestVersion: EXACT_SCIENTIFIC_DIGEST_V1, ...p, scientificContentDigest};
  const result = {...content, captureId: 'cec2-' + digest('capture-identity', content)};
  check(Buffer.byteLength(exactJson(result), 'utf8') <= MAX_EXACT_CAPTURE_BYTES);
  return freeze(result);
}
export function validateCurrentEvidenceCaptureV2(input) {
  const p = detached(input);
  keys(p, ['contractVersion', 'serializationVersion', 'digestVersion', 'family', 'sourceAuthority',
    'samples', 'lineageReferences', 'scientificContentDigest', 'captureId']);
  check(p.contractVersion === CURRENT_EVIDENCE_CAPTURE_V2 && p.serializationVersion === EXACT_SCIENTIFIC_JSON_V1 &&
    p.digestVersion === EXACT_SCIENTIFIC_DIGEST_V1);
  const result = captureCurrentEvidenceV2({family: p.family, sourceAuthority: p.sourceAuthority,
    samples: p.samples, lineageReferences: p.lineageReferences});
  check(exactJson(result) === exactJson(p));
  return result;
}
export function serializeCurrentEvidenceCaptureV2(input) {
  return exactJson(validateCurrentEvidenceCaptureV2(input));
}
export function readCurrentEvidenceCaptureV2(text) {
  check(typeof text === 'string' && Buffer.byteLength(text, 'utf8') <= MAX_EXACT_CAPTURE_BYTES);
  // Native JSON numbers preserve -0; strings remain strings. No reviver or custom tags.
  const result = validateCurrentEvidenceCaptureV2(JSON.parse(text));
  // Reject duplicate keys, alternate number spellings, extra whitespace and underflow aliases.
  check(serializeCurrentEvidenceCaptureV2(result) === text);
  return result;
}
export function replayCurrentEvidenceSourceV2(input) {
  const c = validateCurrentEvidenceCaptureV2(input);
  return freeze(copy({family: c.family, samples: c.samples}));
}
export function currentCaptureReferenceV2(input) {
  const c = validateCurrentEvidenceCaptureV2(input);
  return freeze({kind: 'captured', referenceId: c.captureId, contractVersion: CURRENT_EVIDENCE_CAPTURE_V2,
    sha256: digest(EXACT_CURRENT_REFERENCE_V1, c)});
}
export function validateCurrentCaptureReferenceV2(input, capture) {
  const r = detached(input);
  reference(r);
  check(r.kind === 'captured' && r.contractVersion === CURRENT_EVIDENCE_CAPTURE_V2);
  const expected = currentCaptureReferenceV2(capture);
  check(exactJson(r) === exactJson(expected));
  return expected;
}
