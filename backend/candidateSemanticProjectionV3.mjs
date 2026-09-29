// Versioned, read-only snapshot shape overlay. No runtime integration or identity.
import {isDeepStrictEqual} from 'node:util';
import {copy,freeze,utc} from '../shared/oceanPublication.mjs';
import {requireScientificAssessmentV1} from './scientificAssessment.mjs';
import {projectCandidateSemanticSurfacesV2,compareCandidateScientificSurfacesV2} from './candidateSemanticProjectionV2.mjs';
import definition from '../docs/Candidate_Semantic_Shapes_v3.json' with {type:'json'};

export const SEMANTIC_PROJECTION_V3='pelora-candidate-semantic-projection-v3';
const amendment=freeze(copy(definition));
const prefix='/observationSnapshot/observations/sst/derived/';
const reasons=[prefix+'spatialStructure/confidence/reasons/','/observationSnapshot/evidence/groups/temperature/confidence/reasons/'];
const privateExceptions=new Set(['minimal-total-temperature-range','weak-total-temperature-range','moderate-total-temperature-range']);
const delta=new Map(amendment.delta.map(row=>[row.path,row]));
const pattern=path=>path.replace(/\/\d+(?=\/|$)/g,'/*');
const check=(ok,why)=>{if(!ok)throw new TypeError('SNAPSHOT_SHAPE_INVALID: '+why);};
const own=(value,key)=>{check(value&&Object.hasOwn(value,key),'missing '+key);return value[key];};
function safe(value,ancestors=new Set()){
  if(!value||typeof value!=='object')return;
  check(!ancestors.has(value),'cycle');
  check(Object.getPrototypeOf(value)===(Array.isArray(value)?Array.prototype:Object.prototype),'prototype');
  const next=new Set(ancestors);next.add(value);
  for(const key of Reflect.ownKeys(value)){
    const d=Object.getOwnPropertyDescriptor(value,key);
    check(typeof key==='string'&&Object.hasOwn(d,'value')&&!['__proto__','prototype','constructor'].includes(key),'unsafe descriptor');
    safe(d.value,next);
  }
}
function time(value,assessment){
  utc(value); // Existing strict UTC grammar/calendar validator; output discarded.
  check(Date.parse(value)<=Date.parse(assessment.assessmentAt),'future represented time');
}
function coherent(input){
  const snapshot=input.observationSnapshot;
  const sst=snapshot?.observations?.sst;
  const s=sst?.derived?.spatialStructure;
  if(s===undefined)return false;
  const assessment=requireScientificAssessmentV1(input.assessment);
  // Reuse the unchanged v2 root coherence authority through an explicit port.
  const root={assessment,sst:{derived:{spatialStructure:s}}};
  check(projectCandidateSemanticSurfacesV2(root).complete,'unreviewed root spatial shape');
  if(input.sst?.derived?.spatialStructure!==undefined){
    check(compareCandidateScientificSurfacesV2(root,{assessment,sst:{derived:{spatialStructure:input.sst.derived.spatialStructure}}}).classification==='EXACT_MATCH','root/snapshot scientific divergence');
  }
  check(amendment.confidenceArrays.some(x=>isDeepStrictEqual(x,s.confidence.reasons)),'confidence vocabulary/order');
  for(const sample of s.samples)if(sample.observedAt!==null)time(sample.observedAt,assessment);
  const group=snapshot.evidence?.groups?.temperature;
  if(group!==undefined){
    check(isDeepStrictEqual(own(group,'orientation'),s.orientation),'temperature orientation alias');
    check(isDeepStrictEqual(own(group,'confidence'),s.confidence),'temperature confidence alias');
  }
  const band=own(sst.derived,'temperatureBand'),center=own(sst,'temperatureFahrenheit');
  check((band===null)===!Number.isFinite(center),'center temperature band missingness');
  const f=own(sst.derived,'governedEnvironmentalFeatureObservation');
  check(f&&typeof f==='object'&&!Array.isArray(f),'feature object');
  const required=own(f,'missingRequirements'),reference=own(f,'observationReference'),observed=own(f,'observedAt');
  check(Array.isArray(required),'requirement array');
  check(required.every(x=>amendment.requirementVocabulary.includes(x)),'requirement vocabulary');
  check(new Set(required).size===required.length,'duplicate requirement');
  check(f.contractVersion==='pelora-governed-environmental-feature-observation-v1'&&f.observationType==='temperature-transition-observation','feature contract');
  check(f.feature?.featureType==='temperature-transition'&&f.feature?.featureFamily==='physical-ocean','feature type');
  check(f.source?.type==='spatial-temperature-analysis'&&f.source?.contractVersion==='pelora-sst-spatial-range-v1','feature source');
  check(typeof f.available==='boolean','feature availability');
  check((reference===null)===!f.available,'reference absence/availability');
  if(reference!==null)check(typeof reference==='string'&&/^pelora-observation-v1:[a-f0-9]{64}$/.test(reference),'reference family/shape');
  const footprint=own(f,'samplingFootprint'),samples=own(footprint,'samples');
  check(Array.isArray(samples)&&footprint.sampleCount===samples.length,'footprint count');
  check(Object.is(footprint.radiusNauticalMiles,s.sampleRadiusNauticalMiles),'footprint radius');
  let previous=-1;
  for(const sample of samples){
    const i=s.samples.findIndex(x=>x.direction===sample.direction);check(i>previous,'footprint direction order/duplicates');previous=i;
    const original=s.samples[i];
    for(const key of ['requestedLatitude','requestedLongitude','resolvedLatitude','resolvedLongitude','temperatureFahrenheit'])check(Object.is(sample[key],original[key]),'footprint source '+key);
    check(isDeepStrictEqual(sample.source,{provider:original.source.provider,classification:original.source.classification,availability:original.source.availability}),'footprint provenance');
    time(sample.observedAt,assessment);
    check(original.observedAt!==null&&Date.parse(sample.observedAt)===Date.parse(original.observedAt),'footprint represented-time correspondence');
  }
  const times=new Set(samples.map(x=>x.observedAt));
  if(observed!==null){time(observed,assessment);check(times.size===1&&times.has(observed),'feature retained time');}
  else check(times.size!==1,'null conceals retained time');
  const tuple=[s.coverage,s.classification,s.validNeighborCount,samples.length,f.available,required,reference===null,observed===null];
  check(amendment.featureStates.some(x=>isDeepStrictEqual(x,tuple)),'unreviewed feature-state combination');
  if(group!==undefined){
    const provenance=own(group,'observationProvenance');
    check(provenance.available===f.available,'observation provenance availability');
    check(provenance.observationReference===(f.available?reference:null),'observation provenance reference');
    check(provenance.observedAt===(f.available?observed:null),'observation provenance time');
  }
  check(f.authority?.establishesObservationIdentity===f.available&&f.authority?.establishesSamplingFootprint===f.available,'feature observation authority');
  for(const [key,value] of Object.entries(f.authority))if(!['establishesObservationIdentity','establishesSamplingFootprint'].includes(key))check(value===false,'unsupported feature authority');
  return true;
}
function visit(value,fn,path=''){
  if(value&&typeof value==='object')for(const key of Object.keys(value)){
    const p=path+'/'+key.replaceAll('~','~0').replaceAll('/','~1');
    fn(value,key,p);visit(value[key],fn,p);
  }
}
export function projectCandidateSemanticSurfacesV3(input){
  safe(input);const original=copy(input),validationView=copy(original);
  const qualified=coherent(original),restored=new Map();
  // V2's private classifier has no extension port. Only the three independently
  // validated reason strings at these two exact paths use a validation token.
  // Original scientific values are restored verbatim; nothing is omitted.
  if(qualified)visit(validationView,(parent,key,path)=>{
    if(reasons.some(p=>path.startsWith(p)&&/^\d+$/.test(path.slice(p.length)))&&privateExceptions.has(parent[key])){
      restored.set(path,parent[key]);parent[key]='strong-total-temperature-range';
    }
  });
  const result=copy(projectCandidateSemanticSurfacesV2(validationView));
  const promoted=new Set();
  result.unresolved=result.unresolved.filter(entry=>{
    const rule=delta.get(pattern(entry.path));
    if(!qualified||!rule)return true;
    const allowed=entry.value===null&&rule.types.includes('null')||typeof entry.value==='string'&&rule.stringValues.includes(entry.value);
    if(!allowed)return true;
    result.currentOceanScientificEvidence.push(entry);promoted.add(entry.path);return false;
  });
  for(const entry of result.currentOceanScientificEvidence)if(restored.has(entry.path))entry.value=restored.get(entry.path);
  for(const row of result.coverage)if(promoted.has(row.path))row.authority='currentOceanScientificEvidence';
  result.currentOceanScientificEvidence.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
  result.complete=result.unresolved.length===0;result.version=SEMANTIC_PROJECTION_V3;
  return freeze(result);
}
export function requireCurrentScientificSurfaceV3(input){
  const p=projectCandidateSemanticSurfacesV3(input);
  if(!p.complete)throw new TypeError('SEMANTIC_AUTHORITY_UNRESOLVED');
  if(!p.currentOceanScientificEvidence.some(x=>x.value===null||typeof x.value!=='object'))throw new TypeError('SCIENTIFIC_SURFACE_EMPTY');
  return p.currentOceanScientificEvidence;
}
export function compareCandidateScientificSurfacesV3(a,b){
  const left=new Map(requireCurrentScientificSurfaceV3(a).map(x=>[x.path,x.value]));
  const right=new Map(requireCurrentScientificSurfaceV3(b).map(x=>[x.path,x.value]));
  const differences=[...new Set([...left.keys(),...right.keys()])].sort().filter(path=>!left.has(path)||!right.has(path)||!isDeepStrictEqual(left.get(path),right.get(path)))
    .map(path=>({path,currentPresent:left.has(path),reconstructedPresent:right.has(path)}));
  return freeze({classification:differences.length?'MISMATCH':'EXACT_MATCH',scope:'SUPPLIED_REVIEWED_CURRENT_SCIENTIFIC_SURFACE',
    completeCandidateReconstruction:false,version:SEMANTIC_PROJECTION_V3,differences});
}
