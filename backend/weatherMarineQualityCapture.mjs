// Internal normalized quality-source projection. No acquisition or quality formulas.
import {copy, keys, check, freeze, canonical, hash, reference} from '../shared/oceanPublication.mjs';

export const WEATHER_MARINE_QUALITY_CAPTURE_V1 = 'pelora-weather-marine-quality-capture-v1';
const sourceProfile = {
  provider: 'Open-Meteo',
  weatherProduct: 'Weather Forecast API',
  marineProduct: 'Marine Forecast API'
};
const privateName = value => /^(userid|useruuid|captainid|captainidentity|captainuuid|authidentity|authuuid|email|boat|boatname|origin|range|captainorigin|captainrange|fishinglog|catch|lure|bait|presentation|privatecoordinates|privatetripcoordinates|captaincoordinates|mission|missioncontext|missionstate|auth|token|session)$/.test(value.replace(/[^a-z0-9]/gi, '').toLowerCase());
function privateText(value) {
  const parts = value.split(/[._:=\s-]+/);
  for (let start = 0; start < parts.length; start++) {
    let label = '';
    for (let end = start; end < parts.length; end++) {
      label += parts[end];
      if (privateName(label)) return true;
    }
  }
  return false;
}

function detached(input) {
  const active = new Set();
  function own(value) {
    if (!value || typeof value !== 'object') return;
    check(!active.has(value));
    active.add(value);
    check(Object.getPrototypeOf(value) === (Array.isArray(value) ? Array.prototype : Object.prototype));
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      check(typeof key === 'string' && Object.hasOwn(descriptor, 'value'));
      own(descriptor.value);
    }
    active.delete(value);
  }
  own(input); // Never read accessors, inherited properties or toJSON.
  const result = copy(input);
  function privacy(value) {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      check(!privateName(key));
      if (typeof child === 'string') {
        check(!privateName(child));
        // Reject dedicated private labels embedded in structured reference text too.
        check(!privateText(child));
        check(!/[^\s@]+@[^\s@]+\.[^\s@]+|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i.test(child));
      }
      privacy(child);
    }
  }
  privacy(result);
  return result;
}

function body(input) {
  const p = detached(input);
  keys(p, ['source', 'sourceAuthority', 'location', 'qualityInputs', 'lineageReferences']);
  keys(p.source, Object.keys(sourceProfile));
  check(canonical(p.source) === canonical(sourceProfile));
  keys(p.sourceAuthority, ['status', 'reference']);
  check(['SYNTHETIC_FIXTURE', 'RECORDED_NOT_REQUALIFIED'].includes(p.sourceAuthority.status));
  reference(p.sourceAuthority.reference);
  keys(p.location, ['latitude', 'longitude']);
  check(Number.isFinite(p.location.latitude) && Math.abs(p.location.latitude) <= 90);
  check(Number.isFinite(p.location.longitude) && Math.abs(p.location.longitude) <= 180);
  const q = p.qualityInputs;
  keys(q, ['wind', 'waves', 'swell', 'observedAt', 'diagnostics']);
  for (const [family, field] of [['wind', 'speedKnots'], ['waves', 'heightFeet'], ['swell', 'heightFeet']]) {
    keys(q[family], [field]);
    check(q[family][field] === null || Number.isFinite(q[family][field]));
  }
  // Preserve parser-selected aggregate time text, including invalid/ambiguous text.
  // This is NOT represented-time qualification and exposes no scientific age helper.
  check(q.observedAt === null || typeof q.observedAt === 'string' && q.observedAt.length <= 64);
  keys(q.diagnostics, ['providerStatus']);
  const status = q.diagnostics.providerStatus;
  keys(status, ['weatherApi', 'marineApi']);
  check(Object.values(status).every(s => ['fulfilled', 'rejected'].includes(s)));
  // The actual parser throws on total provider failure: no normalized return exists.
  check(status.weatherApi !== 'rejected' || status.marineApi !== 'rejected');
  if (status.weatherApi === 'rejected') check(q.wind.speedKnots === null);
  if (status.marineApi === 'rejected') check(q.waves.heightFeet === null && q.swell.heightFeet === null);
  check(Array.isArray(p.lineageReferences));
  p.lineageReferences.forEach(reference);
  return p;
}

export function captureWeatherMarineQualityV1(input) {
  const p = body(input);
  const scientificContentDigest = hash({contractVersion: WEATHER_MARINE_QUALITY_CAPTURE_V1,
    source: p.source, location: p.location, qualityInputs: p.qualityInputs});
  const content = {contractVersion: WEATHER_MARINE_QUALITY_CAPTURE_V1, ...p, scientificContentDigest};
  return freeze({...content, captureId: `wmq-${hash(content)}`});
}
export function validateWeatherMarineQualityCaptureV1(input) {
  const p = detached(input);
  keys(p, ['contractVersion', 'source', 'sourceAuthority', 'location', 'qualityInputs', 'lineageReferences', 'scientificContentDigest', 'captureId']);
  check(p.contractVersion === WEATHER_MARINE_QUALITY_CAPTURE_V1);
  const c = captureWeatherMarineQualityV1({source: p.source, sourceAuthority: p.sourceAuthority,
    location: p.location, qualityInputs: p.qualityInputs, lineageReferences: p.lineageReferences});
  check(canonical(c) === canonical(p));
  return c;
}
export const serializeWeatherMarineQualityCaptureV1 = input => canonical(validateWeatherMarineQualityCaptureV1(input));
export function readWeatherMarineQualityCaptureV1(text) {
  check(typeof text === 'string');
  const c = validateWeatherMarineQualityCaptureV1(JSON.parse(text));
  check(serializeWeatherMarineQualityCaptureV1(c) === text);
  return c;
}
export function replayWeatherMarineQualityV1(input) {
  const c = validateWeatherMarineQualityCaptureV1(input);
  return freeze(copy({location: c.location, ...c.qualityInputs}));
}
export function weatherMarineQualityReferenceV1(input) {
  const c = validateWeatherMarineQualityCaptureV1(input);
  return freeze({kind: 'captured', referenceId: c.captureId,
    contractVersion: WEATHER_MARINE_QUALITY_CAPTURE_V1, sha256: hash(c)});
}
