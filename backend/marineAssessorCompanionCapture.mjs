// Pure normalized companion; no acquisition or scientific formulas.
import {copy, keys, check, freeze, canonical, hash, reference} from '../shared/oceanPublication.mjs';
import {validateWeatherMarineQualityCaptureV1, weatherMarineQualityReferenceV1, replayWeatherMarineQualityV1} from './weatherMarineQualityCapture.mjs';
export const MARINE_ASSESSOR_COMPANION_V1 = 'pelora-marine-assessor-companion-capture-v1';
const fields = {wind:['gustKnots','directionDegrees'], waves:['directionDegrees','periodSeconds'], swell:['directionDegrees','periodSeconds']};
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

function body(input, qualityCapture) {
  const q = validateWeatherMarineQualityCaptureV1(qualityCapture);
  const p = detached(input);
  keys(p, ['qualityReference','marineInputs','source','lineageReferences']);
  reference(p.qualityReference);
  check(canonical(p.qualityReference) === canonical(weatherMarineQualityReferenceV1(q)));
  keys(p.marineInputs, Object.keys(fields));
  for (const [family, names] of Object.entries(fields)) {
    const f = p.marineInputs[family];
    keys(f, ['family',...names,...(family === 'wind' ? ['source'] : [])]);
    check(f.family === family);
    for (const name of names) check(f[name] === null || Number.isFinite(f[name]));
  }
  const w = p.marineInputs.wind.source;
  keys(w, ['provider','classification','availability']);
  check(w.provider === 'Open-Meteo Weather API' && w.classification === 'forecast-model');
  check(['available','provider-request-failed','provider-returned-null',
    'provider-returned-no-current-data'].includes(w.availability));
  // Parser invariant only: reject contradictory recorded provenance, never repair it.
  // getMarineConditions defines windHasAnyValue over speed OR gust OR direction.
  const windHasAnyValue = [q.qualityInputs.wind.speedKnots,
    p.marineInputs.wind.gustKnots,p.marineInputs.wind.directionDegrees].some(Number.isFinite);
  check((w.availability === 'available') === windHasAnyValue);
  keys(p.source, ['provider','weatherModel','marineModel']);
  check(p.source.provider === 'Open-Meteo');
  check(p.source.weatherModel === null || p.source.weatherModel === 'Weather Forecast API');
  check(p.source.marineModel === null || p.source.marineModel === 'Marine Forecast API');
  // Recorded provenance is not provider authentication. Never manufacture missing facts.
  const status = q.qualityInputs.diagnostics.providerStatus;
  if (status.weatherApi === 'rejected') {
    check(w.availability === 'provider-request-failed' && p.source.weatherModel === null);
    check(fields.wind.every(k => p.marineInputs.wind[k] === null));
  } else check(w.availability !== 'provider-request-failed');
  if (status.marineApi === 'rejected') {
    check(p.source.marineModel === null);
    for (const family of ['waves','swell']) check(fields[family].every(k => p.marineInputs[family][k] === null));
  }
  check(Array.isArray(p.lineageReferences));
  p.lineageReferences.forEach(reference);
  return p;
}
export function captureMarineAssessorCompanionV1(input, qualityCapture) {
  const p = body(input, qualityCapture);
  const content = {contractVersion:MARINE_ASSESSOR_COMPANION_V1,...p};
  return freeze({...content,captureId:'mac-'+hash(content)});
}
export function validateMarineAssessorCompanionV1(input, qualityCapture) {
  const p = detached(input);
  keys(p,['contractVersion','qualityReference','marineInputs','source','lineageReferences','captureId']);
  check(p.contractVersion === MARINE_ASSESSOR_COMPANION_V1);
  const c = captureMarineAssessorCompanionV1({qualityReference:p.qualityReference,
    marineInputs:p.marineInputs,source:p.source,lineageReferences:p.lineageReferences},qualityCapture);
  check(canonical(c) === canonical(p));
  return c;
}
export const serializeMarineAssessorCompanionV1 = (input,q) => canonical(validateMarineAssessorCompanionV1(input,q));
export function readMarineAssessorCompanionV1(text,q) {
  check(typeof text === 'string');
  const c = validateMarineAssessorCompanionV1(JSON.parse(text),q);
  check(serializeMarineAssessorCompanionV1(c,q) === text);
  return c;
}
export function replayMarineAssessorCompanionV1(input,qualityCapture) {
  const c = validateMarineAssessorCompanionV1(input,qualityCapture);
  const result = copy(replayWeatherMarineQualityV1(qualityCapture));
  for (const family of Object.keys(fields)) {
    const {family:tag,...values} = c.marineInputs[family];
    Object.assign(result[family],copy(values));
  }
  result.source = copy(c.source);
  return freeze(result);
}
export function marineAssessorCompanionReferenceV1(input,q) {
  const c = validateMarineAssessorCompanionV1(input,q);
  return freeze({kind:'captured',referenceId:c.captureId,contractVersion:MARINE_ASSESSOR_COMPANION_V1,sha256:hash(c)});
}
