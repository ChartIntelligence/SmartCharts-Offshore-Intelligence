// Internal, species-neutral source serialization. No provider, storage or request integration.
import {copy,keys,check,freeze,canonical,hash,utc,reference} from '../shared/oceanPublication.mjs';
import {scientificAgeHoursV1,requireScientificAssessmentV1} from './scientificAssessment.mjs';
export const CURRENT_EVIDENCE_CAPTURE_V1='pelora-governed-current-evidence-capture-v1';
const profiles={
  SST:{provider:'Open-Meteo',classification:'forecast-model',values:['temperatureCelsius','temperatureFahrenheit'],source:[]},
  CHLOROPHYLL_DIRECT:{provider:'NOAA CoastWatch',classification:'satellite-observation',dataset:'noaacwNPPVIIRSchlaDaily',values:['concentrationMgM3','waterClassification'],source:['platform','variable','units','observationType']},
  CHLOROPHYLL_GAP_FILLED:{provider:'NOAA NESDIS CoastWatch',classification:'satellite-derived-reconstruction',dataset:'nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily',values:['concentrationMgM3','waterClassification'],source:['platform','variable','units','observationType','algorithm','resolutionKilometers','experimental']},
  CURRENTS:{provider:'NOAA CoastWatch',classification:'altimetry-derived-geostrophic-current',dataset:'noaacwBLENDEDNRTcurrentsDaily',values:['speedKnots','directionDegrees','eastwardMetersPerSecond','northwardMetersPerSecond'],source:['variables','units','directionConvention']}
};
const privateName=s=>/^(userid|useruuid|captainid|captainidentity|captainuuid|authidentity|authuuid|email|boat|boatname|origin|range|captainorigin|captainrange|fishinglog|catch|lure|bait|presentation|privatecoordinates|privatetripcoordinates|captaincoordinates|mission|missioncontext|missionstate|auth|token|session)$/.test(s.replace(/[^a-z0-9]/gi,'').toLowerCase());
function detached(v){
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
  allowed(p,[...profile.values,'observedAt','source'],['requestedLatitude','requestedLongitude','resolvedLatitude','resolvedLongitude',...(family==='SST'?['providerCoordinates','timestampProvenance']:[])]);
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
  if(s.availability==='available')check(profile.values.filter(k=>k!=='waterClassification').every(k=>Number.isFinite(p[k])));
  const expected={variable:'chlor_a',units:family==='CURRENTS'?'m/s':'mg m^-3',observationType:family==='CHLOROPHYLL_GAP_FILLED'?'gap-filled-reconstruction':'direct-satellite',algorithm:'DINEOF',resolutionKilometers:9,experimental:true,directionConvention:'degrees-toward',platform:family==='CHLOROPHYLL_GAP_FILLED'?'S-NPP + NOAA-20 VIIRS':'Suomi-NPP VIIRS'};
  for(const k of profile.source)if(Object.hasOwn(s,k)){if(k==='variables')check(canonical(s[k])==='["u_current","v_current"]');else check(s[k]===expected[k]);}
  // Do not infer source quality, land masks, represented time or availability from bytes.
  return p;
}
function body(input){
  const p=detached(input);keys(p,['family','sourceAuthority','samples','lineageReferences']);check(Object.hasOwn(profiles,p.family));
  keys(p.sourceAuthority,['status','reference']);check(['SYNTHETIC_FIXTURE','RECORDED_NOT_REQUALIFIED'].includes(p.sourceAuthority.status));reference(p.sourceAuthority.reference);
  check(Array.isArray(p.samples)&&p.samples.length>0);const roles=new Set();
  for(const s of p.samples){keys(s,['role','outcome','point']);check(['center','north','east','south','west'].includes(s.role)&&!roles.has(s.role));roles.add(s.role);
    check(['FULFILLED','REJECTED'].includes(s.outcome));if(s.outcome==='REJECTED')check(s.point===null);else sourcePoint(s.point,p.family);
  }
  check(Array.isArray(p.lineageReferences));p.lineageReferences.forEach(reference);return p;
}
export function captureCurrentEvidenceV1(input){
  const p=body(input);
  // Scientific digest excludes authority claim/audit lineage, which remain bound by capture ID.
  const scientificContentDigest=hash({contractVersion:CURRENT_EVIDENCE_CAPTURE_V1,family:p.family,samples:p.samples});
  const content={contractVersion:CURRENT_EVIDENCE_CAPTURE_V1,...p,scientificContentDigest};
  return freeze({...content,captureId:`cec-${hash(content)}`});
}
export function validateCurrentEvidenceCaptureV1(input){
  const p=detached(input);keys(p,['contractVersion','family','sourceAuthority','samples','lineageReferences','scientificContentDigest','captureId']);check(p.contractVersion===CURRENT_EVIDENCE_CAPTURE_V1);
  const result=captureCurrentEvidenceV1({family:p.family,sourceAuthority:p.sourceAuthority,samples:p.samples,lineageReferences:p.lineageReferences});check(canonical(result)===canonical(p));return result;
}
export const serializeCurrentEvidenceCaptureV1=input=>canonical(validateCurrentEvidenceCaptureV1(input));
export function readCurrentEvidenceCaptureV1(text){check(typeof text==='string');const result=validateCurrentEvidenceCaptureV1(JSON.parse(text));check(serializeCurrentEvidenceCaptureV1(result)===text);return result;}
export function replayCurrentEvidenceSourceV1(input){const c=validateCurrentEvidenceCaptureV1(input);return freeze(copy({family:c.family,samples:c.samples}));}
export function currentCaptureReferenceV1(input){const c=validateCurrentEvidenceCaptureV1(input);return freeze({kind:'captured',referenceId:c.captureId,contractVersion:CURRENT_EVIDENCE_CAPTURE_V1,sha256:hash(c)});}
// Optional age view uses existing locked science only. Does not select family state or reconstruct candidates.
export function captureSampleAgeV1(input,role,assessment){
  const c=validateCurrentEvidenceCaptureV1(input),context=requireScientificAssessmentV1(assessment);const s=c.samples.find(s=>s.role===role);check(s&&s.outcome==='FULFILLED');
  if(c.family==='SST')check(s.point.timestampProvenance==='marine-current-block-valid-time');
  const t=s.point.observedAt;check(typeof t==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(t));
  // Calendar validation is delegated to the same strict instant contract; no defaults.
  utc(t);
  return scientificAgeHoursV1(t,context);
}
