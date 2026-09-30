// V3 freezes a separate admission contract. Historical V1/V2 are not modified.
import {copy,keys,check,freeze,canonical,hash,utc,reference} from '../shared/oceanPublication.mjs';
import {EXACT_SCIENTIFIC_JSON_V1, EXACT_SCIENTIFIC_DIGEST_V1, MAX_EXACT_CAPTURE_BYTES, exactJson, exactDigest, detached as exactDetached} from './exactScientificEvidence.mjs';
export const CURRENT_EVIDENCE_CAPTURE_V3='pelora-governed-current-evidence-capture-v3';
const profiles={
  SST:{provider:'Open-Meteo',classification:'forecast-model',values:['temperatureCelsius','temperatureFahrenheit'],source:[]},
  CHLOROPHYLL_DIRECT:{provider:'NOAA CoastWatch',classification:'satellite-observation',dataset:'noaacwNPPVIIRSchlaDaily',values:['concentrationMgM3','waterClassification'],source:['platform','variable','units','observationType']},
  CHLOROPHYLL_GAP_FILLED:{provider:'NOAA NESDIS CoastWatch',classification:'satellite-derived-reconstruction',dataset:'nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily',values:['concentrationMgM3','waterClassification'],source:['platform','variable','units','observationType','algorithm','resolutionKilometers','experimental']},
  CURRENTS:{provider:'NOAA CoastWatch',classification:'altimetry-derived-geostrophic-current',dataset:'noaacwBLENDEDNRTcurrentsDaily',values:['speedKnots','directionDegrees','eastwardMetersPerSecond','northwardMetersPerSecond'],source:['variables','units','directionConvention']}
};
const privateName=s=>/^(userid|useruuid|captainid|captainidentity|captainuuid|authidentity|authuuid|email|boat|boatname|origin|range|captainorigin|captainrange|fishinglog|catch|lure|bait|presentation|privatecoordinates|privatetripcoordinates|captaincoordinates|mission|missioncontext|missionstate|auth|token|session)$/.test(s.replace(/[^a-z0-9]/gi,'').toLowerCase());
function detached(v){
  v = exactDetached(v);
  const active=new Set();function own(x){if(!x||typeof x!=='object')return;check(!active.has(x));active.add(x);check(Object.getPrototypeOf(x)===(Array.isArray(x)?Array.prototype:Object.prototype));for(const k of Reflect.ownKeys(x)){const d=Object.getOwnPropertyDescriptor(x,k);check(typeof k==='string'&&Object.hasOwn(d,'value'));own(d.value);}active.delete(x);}own(v);
  const p=copy(v); // Reject getters/inheritance before examining any supplied value.
  function visit(x){if(!x||typeof x!=='object')return;for(const [k,v] of Object.entries(x)){
    check(!privateName(k));if(['name','flagId'].includes(k)&&typeof v==='string')check(!privateName(v));
    if(typeof v==='string')check(!/[^\s@]+@[^\s@]+\.[^\s@]+|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i.test(v));
    visit(v);
  }}visit(p);return p;
}
function allowed(v,required,optional=[]){check(v&&typeof v==='object'&&!Array.isArray(v));check(required.every(k=>Object.hasOwn(v,k)));check(Object.keys(v).every(k=>[...required,...optional].includes(k)));}
const numeric=v=>check(v===null||typeof v==='number'&&Number.isFinite(v));
function coordinates(p){for(const k of ['requestedLatitude','requestedLongitude','resolvedLatitude','resolvedLongitude'])if(Object.hasOwn(p,k)){numeric(p[k]);if(p[k]!==null)check(Math.abs(p[k])<=(k.endsWith('Latitude')?90:180));}}
function sourcePoint(p,family){
  const profile=profiles[family];
  allowed(p,[...profile.values,'observedAt','source',...(family==='CURRENTS'?['speedDerivationFailed']:[])],['requestedLatitude','requestedLongitude','resolvedLatitude','resolvedLongitude',...(family==='SST'?['providerCoordinates','timestampProvenance']:[])]);
  coordinates(p);
  // Preserve supplied time text exactly. Capture is not temporal-support qualification.
  check(p.observedAt===null||typeof p.observedAt==='string'&&p.observedAt.length>0&&p.observedAt.length<=64);
  for(const key of profile.values)if(key==='waterClassification')check(p[key]===null||['very-clear-low-productivity','clear-blue-water','productive-blue-green-transition','productive-green-water','high-chlorophyll-coastal-or-bloom-influenced'].includes(p[key]));else numeric(p[key]);
  if(Object.hasOwn(p,'providerCoordinates')){keys(p.providerCoordinates,['resolvedLatitude','resolvedLongitude']);coordinates(p.providerCoordinates);}
  if(Object.hasOwn(p,'timestampProvenance'))check(p.timestampProvenance===null||p.timestampProvenance==='marine-current-block-valid-time');
  const s=p.source;allowed(s,['provider','classification','availability',...(profile.dataset?['dataset']:[])],profile.source);
  check(s.provider===profile.provider&&s.classification===profile.classification);if(profile.dataset)check(s.dataset===profile.dataset);
  // Both successful and no-pixel current reconstruction returns carry these markers.
  if(family==='CHLOROPHYLL_GAP_FILLED')check(['observationType','algorithm','resolutionKilometers','experimental'].every(k=>Object.hasOwn(s,k)));
  check(['available','unavailable','no-valid-pixel','provider-unavailable','request-failed'].includes(s.availability));
  if(family==='CURRENTS') {
    check(typeof p.speedDerivationFailed==='boolean');
    if(p.speedDerivationFailed) {
      // This is a bound processing-failure assertion, not new source science.
      check(s.availability==='available' && p.speedKnots===null);
      check(['eastwardMetersPerSecond','northwardMetersPerSecond','directionDegrees'].every(k=>Number.isFinite(p[k])));
    } else if(s.availability==='available') check(profile.values.every(k=>Number.isFinite(p[k])));
    else check(p.speedKnots===null && p.directionDegrees===null);
    // An unavailable source may retain diagnostic components, not derived speed/heading.
  } else if(s.availability==='available')check(profile.values.filter(k=>k!=='waterClassification').every(k=>Number.isFinite(p[k])));
  const expected={variable:'chlor_a',units:family==='CURRENTS'?'m/s':'mg m^-3',observationType:family==='CHLOROPHYLL_GAP_FILLED'?'gap-filled-reconstruction':'direct-satellite',algorithm:'DINEOF',resolutionKilometers:9,experimental:true,directionConvention:'degrees-toward',platform:family==='CHLOROPHYLL_GAP_FILLED'?'S-NPP + NOAA-20 VIIRS':'Suomi-NPP VIIRS'};
  for(const k of profile.source)if(Object.hasOwn(s,k)){if(k==='variables')check(canonical(s[k])==='["u_current","v_current"]');else check(s[k]===expected[k]);}
  // Do not infer source quality, land masks, represented time or availability from bytes.
  return p;
}
function body(input){
  const p=detached(input);keys(p,['family','sourceAuthority','samples','lineageReferences']);check(p.family==='CURRENTS');
  keys(p.sourceAuthority,['status','reference']);check(['SYNTHETIC_FIXTURE','RECORDED_NOT_REQUALIFIED'].includes(p.sourceAuthority.status));reference(p.sourceAuthority.reference);
  check(Array.isArray(p.samples)&&p.samples.length>0);const roles=new Set();
  for(const s of p.samples){keys(s,['role','outcome','point']);check(['center','north','east','south','west'].includes(s.role)&&!roles.has(s.role));roles.add(s.role);
    check(['FULFILLED','REJECTED'].includes(s.outcome));if(s.outcome==='REJECTED')check(s.point===null);else sourcePoint(s.point,p.family);
  }
  check(Array.isArray(p.lineageReferences));p.lineageReferences.forEach(reference);return p;
}

export const EXACT_CURRENT_REFERENCE_V1 = 'pelora-exact-current-evidence-reference-v1';
const digest=(purpose,content)=>exactDigest(CURRENT_EVIDENCE_CAPTURE_V3,purpose,content);
export function captureCurrentEvidenceV3(input) {
  const p = body(input);
  const scientificContentDigest = digest('scientific-content', {family: p.family, samples: p.samples});
  const content = {contractVersion: CURRENT_EVIDENCE_CAPTURE_V3, serializationVersion: EXACT_SCIENTIFIC_JSON_V1,
    digestVersion: EXACT_SCIENTIFIC_DIGEST_V1, ...p, scientificContentDigest};
  const result = {...content, captureId: 'cec3-' + digest('capture-identity', content)};
  check(Buffer.byteLength(exactJson(result), 'utf8') <= MAX_EXACT_CAPTURE_BYTES);
  return freeze(result);
}
export function validateCurrentEvidenceCaptureV3(input) {
  const p = detached(input);
  keys(p, ['contractVersion', 'serializationVersion', 'digestVersion', 'family', 'sourceAuthority',
    'samples', 'lineageReferences', 'scientificContentDigest', 'captureId']);
  check(p.contractVersion === CURRENT_EVIDENCE_CAPTURE_V3 && p.serializationVersion === EXACT_SCIENTIFIC_JSON_V1 &&
    p.digestVersion === EXACT_SCIENTIFIC_DIGEST_V1);
  const result = captureCurrentEvidenceV3({family: p.family, sourceAuthority: p.sourceAuthority,
    samples: p.samples, lineageReferences: p.lineageReferences});
  check(exactJson(result) === exactJson(p));
  return result;
}
export function serializeCurrentEvidenceCaptureV3(input) {
  return exactJson(validateCurrentEvidenceCaptureV3(input));
}
export function readCurrentEvidenceCaptureV3(text) {
  check(typeof text === 'string' && Buffer.byteLength(text, 'utf8') <= MAX_EXACT_CAPTURE_BYTES);
  // Native JSON numbers preserve -0; strings remain strings. No reviver or custom tags.
  const result = validateCurrentEvidenceCaptureV3(JSON.parse(text));
  // Reject duplicate keys, alternate number spellings, extra whitespace and underflow aliases.
  check(serializeCurrentEvidenceCaptureV3(result) === text);
  return result;
}
export function replayCurrentEvidenceSourceV3(input) {
  const c = validateCurrentEvidenceCaptureV3(input);
  return freeze(copy({family: c.family, samples: c.samples, lineageReferences: c.lineageReferences}));
}
export function currentCaptureReferenceV3(input) {
  const c = validateCurrentEvidenceCaptureV3(input);
  return freeze({kind: 'captured', referenceId: c.captureId, contractVersion: CURRENT_EVIDENCE_CAPTURE_V3,
    sha256: digest(EXACT_CURRENT_REFERENCE_V1, c)});
}
export function validateCurrentCaptureReferenceV3(input, capture) {
  const r = detached(input);
  reference(r);
  check(r.kind === 'captured' && r.contractVersion === CURRENT_EVIDENCE_CAPTURE_V3);
  const expected = currentCaptureReferenceV3(capture);
  check(exactJson(r) === exactJson(expected));
  return expected;
}
