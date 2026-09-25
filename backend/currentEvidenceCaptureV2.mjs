// Qualification-only exact source capture. No route, provider, archive or storage integration.
import {createHash} from 'node:crypto';
import {captureCurrentEvidenceV1} from './currentEvidenceCapture.mjs';
import {copy, freeze, keys, check, reference} from '../shared/oceanPublication.mjs';

export const CURRENT_EVIDENCE_CAPTURE_V2 = 'pelora-governed-current-evidence-capture-v2';
export const EXACT_SCIENTIFIC_JSON_V1 = 'pelora-exact-scientific-json-v1';
export const EXACT_SCIENTIFIC_DIGEST_V1 = 'pelora-exact-scientific-content-sha256-v1';
// Protocol name; the existing four-field captured-reference wire schema is unchanged.
export const EXACT_CURRENT_REFERENCE_V1 = 'pelora-exact-current-evidence-reference-v1';
export const MAX_EXACT_CAPTURE_BYTES = 1024 * 1024;

const privateText = /(?:captain|user|auth)[._\s-]*(?:id|uuid|identity)|email|fishing[._\s-]*log|private[._\s-]*(?:coordinates|latitude|longitude)|(?:^|[._\s-])(?:boat|origin|range|catch|lure|bait|session|token|mission)(?:$|[._\s-])|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?<![0-9a-f])[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}(?![0-9a-f])/i;
const privateLabels = new Set(['userid','useruuid','captainid','captainidentity','captainuuid','authidentity','authuuid',
  'email','boat','boatname','origin','range','captainorigin','captainrange','fishinglog','catch','lure','bait','presentation',
  'privatecoordinates','privatetripcoordinates','captaincoordinates','mission','missioncontext','missionstate','auth','token','session']);
function privateLabelText(value) {
  if (privateText.test(value)) return true;
  const parts = value.split(/[._:=\s-]+/);
  for (let start = 0; start < parts.length; start++) {
    let label = '';
    for (let end = start; end < parts.length; end++) {
      label += parts[end].replace(/[^a-z0-9]/gi, '').toLowerCase();
      if (label.length > 32) break;
      if (privateLabels.has(label)) return true;
    }
  }
  return false;
}

// Inspect descriptors before reading. No getters, custom prototypes, revival or private tags.
function safe(input, active = new Set(), depth = 0) {
  check(depth <= 32);
  // Every allowed current-source string is an existing <=200-character ID,
  // <=64-character time, fixed profile text or digest. Bound before regex scans.
  if (typeof input === 'string') { check(input.length <= 200 && !privateLabelText(input)); return; }
  if (!input || typeof input !== 'object') return;
  check(!active.has(input));
  check(Object.getPrototypeOf(input) === (Array.isArray(input) ? Array.prototype : Object.prototype));
  active.add(input);
  for (const key of Reflect.ownKeys(input)) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    check(typeof key === 'string' && key.length <= 200 && !['__proto__', 'prototype', 'constructor'].includes(key));
    check(!privateLabelText(key) && Object.hasOwn(descriptor, 'value'));
    safe(descriptor.value, active, depth + 1);
  }
  active.delete(input);
}
function detached(input) { safe(input); return copy(input); }

// Private encoder: reachable only after the closed capture schema has validated the data,
// or for internal digest envelopes with fixed keys. This is not an arbitrary-object API.
function exactJson(value) {
  if (typeof value === 'number') { check(Number.isFinite(value)); return Object.is(value, -0) ? '-0' : JSON.stringify(value); }
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(exactJson).join(',') + ']';
  return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + exactJson(value[key])).join(',') + '}';
}
function digest(purpose, content) {
  return createHash('sha256').update(exactJson({digestVersion: EXACT_SCIENTIFIC_DIGEST_V1,
    serializationVersion: EXACT_SCIENTIFIC_JSON_V1, captureVersion: CURRENT_EVIDENCE_CAPTURE_V2,
    purpose, content}), 'utf8').digest('hex');
}
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
