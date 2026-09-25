// Shared implementation extracted with explicit user authorization; same numeric grammar/digest envelope.
import {createHash} from 'node:crypto';
import {copy, check, id} from '../shared/oceanPublication.mjs';
export const EXACT_SCIENTIFIC_JSON_V1 = 'pelora-exact-scientific-json-v1';
export const EXACT_SCIENTIFIC_DIGEST_V1 = 'pelora-exact-scientific-content-sha256-v1';
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
export function detached(input) { safe(input); return copy(input); }

// Internal codec port: capture callers must validate their closed schema first.
// No tagged values or revival; this port alone does not authenticate a capture schema.
export function exactJson(value) {
  if (typeof value === 'number') { check(Number.isFinite(value)); return Object.is(value, -0) ? '-0' : JSON.stringify(value); }
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(exactJson).join(',') + ']';
  return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + exactJson(value[key])).join(',') + '}';
}
export function exactDigest(captureVersion, purpose, content) {
  // Explicit primitive domain identifiers only; never traverse caller-supplied domain objects.
  // Family-specific allowed versions/purposes remain fixed by each capture caller.
  id(captureVersion);id(purpose);
  return createHash('sha256').update(exactJson({digestVersion: EXACT_SCIENTIFIC_DIGEST_V1,
    serializationVersion: EXACT_SCIENTIFIC_JSON_V1, captureVersion,
    purpose, content}), 'utf8').digest('hex');
}
