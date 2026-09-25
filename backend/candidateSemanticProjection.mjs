// Read-only comparison utility. Not a capture, identity, scientific assembler or runtime route.
import manifest from '../docs/Candidate_Semantic_Surfaces_v1.json' with {type:'json'};
import {copy,freeze} from '../shared/oceanPublication.mjs';
import {isDeepStrictEqual} from 'node:util';

export const SEMANTIC_PROJECTION_VERSION='pelora-candidate-semantic-projection-v1';
const surfaces=['currentOceanScientificEvidence','documentaryHistoryContext','retrievalSnapshotMetadata',
  'operationalRequestContext','speciesInterpretationOutput','unresolved'];
const reviewed=new Map(manifest.reviewedPaths.map(([path,surface,kinds,types])=>[path,{surface,kinds,types}]));
const pointer=p=>'/'+p.map(x=>String(x).replaceAll('~','~0').replaceAll('/','~1')).join('/');
const privateText=/(?:captain|user|auth)[._\s-]*(?:id|uuid)|email|fishing[._\s-]*log|private[._\s-]*(?:coordinates|latitude|longitude)|(?:^|[._\s-])(?:boat|origin|range|catch|lure|bait|session|token|mission)(?:$|[._\s-])|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\b/i;
// Exact existing governance prose, not private payload labels. No substring exemption.
const publicLimitations=new Set(['does-not-confirm-bait','does-not-identify-bait-or-feeding',
  'relationship-confidence-does-not-estimate-catch-probability',
  'does-not-estimate-catch-probability','pelora-sst-spatial-range-v1','strong-total-temperature-range',
  'Nearby samples show a pronounced temperature range. This is a candidate spatial pattern, not confirmation of a persistent ocean front or habitat feature.',
  'Nearby samples show a pronounced temperature range. This remains a local surface-pattern candidate rather than a confirmed front or water-mass boundary.',
  'No prey concentration, fish presence, habitat quality, species suitability, catch probability, or fishing recommendation is inferred.']);

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
export function projectCandidateSemanticSurfacesV1(input){
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
      if(bucket==='currentOceanScientificEvidence')privacy({[path.at(-1)]:value});
      result[bucket].push({path:id,value});
    }
  }
  walk(source);
  // Privacy is checked across complete scientific entries, including nested source text.
  for(const item of result.currentOceanScientificEvidence){privacy(item.value);if(privateText.test(item.path.replaceAll('/','.')))throw new TypeError('Private scientific path');}
  return freeze({version:SEMANTIC_PROJECTION_VERSION,...result,coverage,
    complete:result.unresolved.length===0});
}

// Comparison callers must not treat a partial projection as scientific equivalence.
export function requireCurrentScientificSurfaceV1(input){
  const projection=projectCandidateSemanticSurfacesV1(input);
  if(!projection.complete)throw new TypeError('SEMANTIC_AUTHORITY_UNRESOLVED');
  if(!projection.currentOceanScientificEvidence.some(x=>x.value===null||typeof x.value!=='object'))throw new TypeError('SCIENTIFIC_SURFACE_EMPTY');
  return projection.currentOceanScientificEvidence;
}

// Both sides are independently guarded. This compares the supplied reviewed surface;
// it does not certify required candidate fields, source authenticity or reconstruction.
export function compareCandidateScientificSurfacesV1(current,reconstructed){
  const a=requireCurrentScientificSurfaceV1(current),b=requireCurrentScientificSurfaceV1(reconstructed);
  const left=new Map(a.map(x=>[x.path,x.value])),right=new Map(b.map(x=>[x.path,x.value]));
  const differences=[...new Set([...left.keys(),...right.keys()])].sort().filter(path=>
    !left.has(path)||!right.has(path)||!isDeepStrictEqual(left.get(path),right.get(path)))
    .map(path=>({path,currentPresent:left.has(path),reconstructedPresent:right.has(path)}));
  return freeze({classification:differences.length?'MISMATCH':'EXACT_MATCH',
    scope:'SUPPLIED_REVIEWED_CURRENT_SCIENTIFIC_SURFACE',completeCandidateReconstruction:false,differences});
}
