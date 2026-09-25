// Read-only comparison utility. Not a capture, identity, scientific assembler or runtime route.
import manifest from '../docs/Candidate_Semantic_Surfaces_v1.json' with {type:'json'};
import {copy,freeze} from '../shared/oceanPublication.mjs';
import {isDeepStrictEqual} from 'node:util';

const SEMANTIC_PROJECTION_VERSION='pelora-candidate-semantic-projection-v1';
const surfaces=['currentOceanScientificEvidence','documentaryHistoryContext','retrievalSnapshotMetadata',
  'operationalRequestContext','speciesInterpretationOutput','unresolved'];
const reviewed=new Map(manifest.reviewedPaths.map(([path,surface,kinds,types])=>[path,{surface,kinds,types}]));
const pointer=p=>'/'+p.map(x=>String(x).replaceAll('~','~0').replaceAll('/','~1')).join('/');
const privateText=/(?:captain|user|auth)[._\s-]*(?:id|uuid)|email|fishing[._\s-]*log|private[._\s-]*(?:coordinates|latitude|longitude)|(?:^|[._\s-])(?:boat|origin|range|catch|lure|bait|session|token|mission)(?:$|[._\s-])|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?<![0-9a-f])[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}(?![0-9a-f])/i;
// Exact existing governance prose, not private payload labels. No substring exemption.
const publicLimitations=new Set(['does-not-confirm-bait','does-not-identify-bait-or-feeding',
  'relationship-confidence-does-not-estimate-catch-probability',
  'does-not-estimate-catch-probability','pelora-sst-spatial-range-v1','strong-total-temperature-range',
  'Nearby samples show a pronounced temperature range. This is a candidate spatial pattern, not confirmation of a persistent ocean front or habitat feature.',
  'Nearby samples show a pronounced temperature range. This remains a local surface-pattern candidate rather than a confirmed front or water-mass boundary.',
  'No prey concentration, fish presence, habitat quality, species suitability, catch probability, or fishing recommendation is inferred.']);

const reviewedReason=(path,value)=>/^\/sst\/derived\/spatialStructure\/confidence\/reasons\/\d+$/.test(path)&&['minimal-total-temperature-range','weak-total-temperature-range','moderate-total-temperature-range'].includes(value);

function safe(value,ancestors=new Set()){
  if(!value||typeof value!=='object')return;
  if(ancestors.has(value))throw new TypeError('Cyclic semantic input');
  if(Object.getPrototypeOf(value)!==(Array.isArray(value)?Array.prototype:Object.prototype))throw new TypeError('Inherited semantic input');
  const next=new Set(ancestors);next.add(value);
  for(const key of Reflect.ownKeys(value)){
    const d=Object.getOwnPropertyDescriptor(value,key);
    if(typeof key!=='string'||!Object.hasOwn(d,'value')||['__proto__','prototype','constructor'].includes(key))throw new TypeError('Unsafe semantic descriptor');
    safe(d.value,next);
  }
}
function privacy(value){
  if(typeof value==='string'&&privateText.test(value)&&!publicLimitations.has(value))throw new TypeError('Private scientific content');
  if(value&&typeof value==='object')for(const [k,v] of Object.entries(value)){
    if(privateText.test(k))throw new TypeError('Private scientific field');privacy(v);
  }
}

/**
 * Returns source JSON-pointer/value entries, not a rewritten candidate object.
 * Container topology is retained separately for lossless inventory accounting.
 * Every input node is recorded once in coverage; unknown subtrees are retained
 * in unresolved, never admitted to science. No identity or digest is created.
 */
function projectBase(input){
  safe(input);const source=copy(input);
  if(!source||typeof source!=='object'||Array.isArray(source))throw new TypeError('Expected composite object');
  const result=Object.fromEntries(surfaces.map(k=>[k,[]]));
  const coverage=[];
  function walk(value,path=[],pattern=[]){
    const id=pointer(path),entry=reviewed.get(pointer(pattern));
    const container=value!==null&&typeof value==='object';
    const kind=container?(Array.isArray(value)?'array':'object'):'value';
    const type=value===null?'null':typeof value;
    const rule=entry&&entry.kinds.includes(kind)&&(kind!=='value'||entry.types.includes(type))?entry.surface:undefined;
    const keys=container?Object.keys(value).sort():[];
    coverage.push({path:id,kind:container?(Array.isArray(value)?'array':'object'):'value',
      authority:rule??'unresolved',...(container?{keys}: {})});
    if(!rule&&path.length){result.unresolved.push({path:id,value});return;}
    if(container&&keys.length){
      for(const key of keys)walk(value[key],[...path,key],[...pattern,Array.isArray(value)?'*':key]);
    }else if(path.length){
      const bucket=rule==='split'?'unresolved':rule;
      if(bucket==='currentOceanScientificEvidence'&&!reviewedReason(id,value))privacy({[path.at(-1)]:value});
      result[bucket].push({path:id,value});
    }
  }
  walk(source);
  // Privacy is checked across complete scientific entries, including nested source text.
  for(const item of result.currentOceanScientificEvidence){if(!reviewedReason(item.path,item.value))privacy(item.value);if(privateText.test(item.path.replaceAll('/','.')))throw new TypeError('Private scientific path');}
  return freeze({version:SEMANTIC_PROJECTION_VERSION,...result,coverage,
    complete:result.unresolved.length===0});
}


// Versioned read-only shape overlay. No source, identity, science or v1 registry mutation.
import {requireScientificAssessmentV1} from './scientificAssessment.mjs';
import amendment from '../docs/Candidate_Semantic_Shapes_v2.json' with {type:'json'};
export const SEMANTIC_PROJECTION_V2='pelora-candidate-semantic-projection-v2';
const allowed=new Set(amendment.nullablePaths.map(x=>x.path));
const prefix='/sst/derived/spatialStructure/';
const pattern=p=>p.replace(/\/samples\/\d+\//g,'/samples/*/');
const check=(v,message)=>{if(!v)throw new TypeError('SEMANTIC_SHAPE_INCOHERENT: '+message);};
const numberOrNull=v=>v===null||typeof v==='number'&&Number.isFinite(v);
function coherent(input){
  if(!input.sst?.derived||!Object.hasOwn(input.sst.derived,'spatialStructure'))return;
  const s=input.sst.derived.spatialStructure;
  check(s&&typeof s==='object'&&!Array.isArray(s),'spatial object required');
  const at=requireScientificAssessmentV1(input.assessment).assessmentAt;
  // Required sibling shape for this reviewed four-direction assembler branch.
  for(const row of amendment.nullablePaths){
    const suffix=row.path.slice(prefix.length).split('/');
    const targets=suffix[0]==='samples'?s.samples?.map(x=>[x,suffix.slice(2)]):[[s,suffix]];
    check(Array.isArray(targets),'samples required');
    for(const [target,keys] of targets){
      let value=target;
      for(const key of keys){check(value&&typeof value==='object'&&Object.hasOwn(value,key),'required '+row.path);value=value[key];}
    }
  }
  check(Array.isArray(s.samples)&&s.samples.length===4,'four directional samples required');
  const roles=['north','east','south','west'];
  for(let i=0;i<4;i++){
    const x=s.samples[i];
    check(x.direction===roles[i],'direction role/order');
    check(numberOrNull(x.temperatureCelsius)&&numberOrNull(x.temperatureFahrenheit),'temperature types');
    check((x.temperatureCelsius===null)===(x.temperatureFahrenheit===null),'paired missing temperatures');
    check(x.timestampProvenance==='marine-current-block-valid-time','reviewed parser timestamp provenance');
    check(x.observedAt===null||typeof x.observedAt==='string','sample time shape');
    check(x.source?.availability===(x.temperatureCelsius===null?'unavailable':'available'),'sample availability');
  }
  const finite=s.samples.filter(x=>Number.isFinite(x.temperatureFahrenheit));
  check(s.validNeighborCount===finite.length&&s.expectedNeighborCount===4,'neighbor counts');
  check(typeof s.centerTemperatureAvailable==='boolean','center availability');
  const sufficient=finite.length>=3; // Existing assembler coverage predicate; validation only.
  check(s.coverage===(sufficient?'sufficient':'insufficient'),'coverage');
  for(const key of ['minimumFahrenheit','maximumFahrenheit','rangeFahrenheit']){
    check(numberOrNull(s[key])&&(s[key]===null)===!sufficient,'coverage-dependent '+key);
  }
  check((s.classification===null)===!sufficient,'classification missingness');
  if(sufficient){
    check(['uniform-water','weak-temperature-transition','moderate-temperature-transition','strong-temperature-break-candidate'].includes(s.classification),'classification vocabulary');
    check(s.minimumFahrenheit<=s.maximumFahrenheit&&s.rangeFahrenheit>=0,'ordered bounds/nonnegative range');
  }
  const o=s.orientation,c=s.confidence;
  check(o&&c,'orientation/confidence required');
  check(Array.isArray(c.reasons)&&c.reasons.every(reason=>amendment.confidenceReasonVocabulary.includes(reason)),'reviewed confidence-reason vocabulary');
  const has=role=>finite.some(x=>x.direction===role);
  const axes=[has('east')&&has('west'),has('north')&&has('south')];
  for(const [i,key] of ['eastWestDifferenceFahrenheit','northSouthDifferenceFahrenheit'].entries()){
    check(numberOrNull(o[key])&&(o[key]===null)===!axes[i],'opposite-pair '+key);
  }
  check(['directional-temperature-transition','no-clear-directional-transition'].includes(o.classification),'orientation class');
  const clear=o.classification==='directional-temperature-transition';
  check(!clear||axes.some(Boolean),'orientation requires an opposite pair');
  for(const key of ['dominantAxis','warmSide','coolSide','dominantDifferenceFahrenheit']){
    check((o[key]===null)===!clear,'orientation-dependent '+key);
  }
  if(clear){
    const sides={'east-west':['east','west'],'north-south':['north','south']}[o.dominantAxis];
    check(sides&&sides.includes(o.warmSide)&&sides.includes(o.coolSide)&&o.warmSide!==o.coolSide,'axis-side coherence');
    check(axes[o.dominantAxis==='east-west'?0:1],'dominant axis has opposite pair');
  }
  const count=axes.filter(Boolean).length;
  for(const [key,needed] of [['dominantDirectionalDifferenceFahrenheit',1],['secondaryDirectionalDifferenceFahrenheit',2],['axisSeparationFahrenheit',2]]){
    check(numberOrNull(c[key])&&(c[key]===null)===(count<needed),'confidence-axis '+key);
  }
  const times=finite.map(x=>Date.parse(x.observedAt)).filter(Number.isFinite);
  check(!times.some(time=>time>Date.parse(at)),'future finite sample');
  check(numberOrNull(c.sampleAgeHours)&&(c.sampleAgeHours===null)===(times.length===0),'age presence');
  check(c.sampleAgeHours===null||c.sampleAgeHours>=0,'negative age');
  // No range/orientation/confidence/age recomputation, no numeric truth authentication.
}
export function projectCandidateSemanticSurfacesV2(input){
  // Version-isolated base preserves v1 own-data, prototype, privacy, sparse-array and path checks.
  const prior=projectBase(input);
  const result=copy(prior),source=copy(input);
  coherent(source);
  const promoted=new Set();
  result.unresolved=result.unresolved.filter(entry=>{
    if(entry.value===null&&allowed.has(pattern(entry.path))){
      result.currentOceanScientificEvidence.push(entry);promoted.add(entry.path);return false;
    }
    return true;
  });
  for(const row of result.coverage)if(promoted.has(row.path))row.authority='currentOceanScientificEvidence';
  result.currentOceanScientificEvidence.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
  result.complete=result.unresolved.length===0;
  result.version=SEMANTIC_PROJECTION_V2;
  return freeze(result);
}
export function requireCurrentScientificSurfaceV2(input){
  const p=projectCandidateSemanticSurfacesV2(input);
  if(!p.complete)throw new TypeError('SEMANTIC_AUTHORITY_UNRESOLVED');
  if(!p.currentOceanScientificEvidence.some(x=>x.value===null||typeof x.value!=='object'))throw new TypeError('SCIENTIFIC_SURFACE_EMPTY');
  return p.currentOceanScientificEvidence;
}
export function compareCandidateScientificSurfacesV2(a,b){
  const left=new Map(requireCurrentScientificSurfaceV2(a).map(x=>[x.path,x.value]));
  const right=new Map(requireCurrentScientificSurfaceV2(b).map(x=>[x.path,x.value]));
  const differences=[...new Set([...left.keys(),...right.keys()])].sort()
    .filter(p=>!left.has(p)||!right.has(p)||!isDeepStrictEqual(left.get(p),right.get(p)))
    .map(path=>({path,currentPresent:left.has(path),reconstructedPresent:right.has(path)}));
  return freeze({classification:differences.length?'MISMATCH':'EXACT_MATCH',scope:'SUPPLIED_REVIEWED_CURRENT_SCIENTIFIC_SURFACE',
    completeCandidateReconstruction:false,differences});
}
