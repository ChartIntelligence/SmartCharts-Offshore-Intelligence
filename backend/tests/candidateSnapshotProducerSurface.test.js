// STOP checkpoint: reproduce the failed inventory proposal; no v3 dependency or authority creation.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {producerCorpus,assessment,scenarios} from './fixtures/snapshotProducerSurfaceFixture.mjs';
import {projectCandidateSemanticSurfacesV2 as project} from '../candidateSemanticProjectionV2.mjs';
import registry from '../../docs/Candidate_Semantic_Surfaces_v1.json' with {type:'json'};
const rules=new Map(registry.reviewedPaths.map(row=>[row[0],row]));
const escape=x=>x.replaceAll('~','~0').replaceAll('/','~1');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const states=[];
let inventory,delta;
function singleton(pattern,value){
  let out=value;
  for(const key of pattern.slice(1).split('/').reverse())out=key==='*'?[out]:{[key.replaceAll('~1','/').replaceAll('~0','~')]:out};
  return out;
}
function qualified(pattern,value,kind,type){
  if(pattern==='/')return 'CROSS_CUTTING_ALREADY_QUALIFIED';
  const row=rules.get(pattern);
  if(!row||!row[2].includes(kind)||(kind==='value'&&!row[3].includes(type)))return 'NEW_AUTHORITY_REQUIRED';
  if(row[1]==='currentOceanScientificEvidence'&&kind==='value'){
    try{project(singleton(pattern,value));}catch{return 'NEW_AUTHORITY_REQUIRED';}
  }
  return row[1]==='split'?'CROSS_CUTTING_ALREADY_QUALIFIED':row[1]==='currentOceanScientificEvidence'?'ALREADY_QUALIFIED_V2':'DOCUMENTARY_ALREADY_QUALIFIED';
}
function collect(rows){
  const paths=new Map(),newPatterns=new Map();
  for(const row of rows){
    function walk(value,path='',pattern=''){
      const kind=value===null||typeof value!=='object'?'value':Array.isArray(value)?'array':'object';
      const type=value===null?'null':typeof value,id=path||'/',rule=pattern||'/';
      const classification=qualified(rule,value,kind,type);
      const state=kind==='value'?type.toUpperCase():kind.toUpperCase();
      if(!paths.has(id))paths.set(id,{path:id,pattern:rule,shapes:new Set(),numberShapes:new Set(),stringValues:new Set(),scenarios:new Set(),classifications:new Set(),authority:rules.get(rule)?.[1]??'UNRESOLVED',temporalRole:/generatedAt$/.test(id)?'RETRIEVAL_SNAPSHOT_TIME':/observedAt$/.test(id)?'REPRESENTED_ENVIRONMENTAL_TIME':/ageHours$|sampleAgeHours$/i.test(id)?'ASSESSMENT_RELATIVE_SCIENTIFIC_FACT':null});
      const p=paths.get(id);p.shapes.add(state);p.scenarios.add(row.name);p.classifications.add(classification);
      if(typeof value==='number')p.numberShapes.add(Object.is(value,-0)?'-0':Object.is(value,0)?'+0':'finite-nonzero');
      if(typeof value==='string')p.stringValues.add(value);
      if(kind==='array')p.shapes.add(value.length?'POPULATED_ARRAY':'EMPTY_ARRAY');
      if(classification==='NEW_AUTHORITY_REQUIRED'){
        if(!newPatterns.has(rule))newPatterns.set(rule,{path:rule,kinds:new Set(),types:new Set(),stringValues:new Set(),concretePaths:new Set(),scenarios:new Set()});
        const d=newPatterns.get(rule);d.kinds.add(kind);d.types.add(type);d.concretePaths.add(id);d.scenarios.add(row.name);if(typeof value==='string')d.stringValues.add(value);
      }
      if(kind!=='value')for(const key of Object.keys(value))walk(value[key],path+'/'+escape(key),pattern+'/'+(kind==='array'?'*':escape(key)));
    }
    walk({observationSnapshot:row.snapshot});
  }
  const ordered=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,v instanceof Set?[...v].sort():v]));
  inventory=[...paths.values()].map(p=>{if(p.scenarios.size<rows.length)p.shapes.add('ABSENT');return ordered(p);}).sort((a,b)=>a.path.localeCompare(b.path));
  delta=[...newPatterns.values()].map(ordered).sort((a,b)=>a.path.localeCompare(b.path));
}
test.before(async t=>{states.push(...await producerCorpus(t));collect(states);});
test('inventory covers every emitted concrete path, container, array element and optional state',()=>{
  assert.equal(states.length,29);assert(inventory.length>1000);
  assert(inventory.every(x=>x.classifications.length>0&&x.shapes.length>0));
  assert(inventory.some(x=>x.numberShapes.includes('-0')));
  assert(inventory.some(x=>x.shapes.includes('ABSENT')));
});

// Adversarial regeneration: separate traversal, without collect/qualified or
// frozen expected paths driving discovery. Arrays keep their concrete order.
function independentUnion(corpus){
  const records=new Map();
  for(const {name,snapshot} of corpus){
    const pending=[['/','/',{observationSnapshot:snapshot}]];
    while(pending.length){
      const [path,pattern,value]=pending.pop();
      let row=records.get(path);
      if(!row){row={path,pattern,shapes:new Set(),numberShapes:new Set(),stringValues:new Set(),scenarios:new Set()};records.set(path,row);}
      row.scenarios.add(name);
      const array=Array.isArray(value),object=value!==null&&typeof value==='object';
      row.shapes.add(value===null?'NULL':array?'ARRAY':object?'OBJECT':typeof value==='string'?'STRING':typeof value==='boolean'?'BOOLEAN':'NUMBER');
      if(array)row.shapes.add(value.length?'POPULATED_ARRAY':'EMPTY_ARRAY');
      if(typeof value==='number')row.numberShapes.add(Object.is(value,-0)?'-0':value===0?'+0':'finite-nonzero');
      if(typeof value==='string')row.stringValues.add(value);
      if(object)for(const key of Object.keys(value)){
        const escaped=key.replace(/~/g,'~0').replace(/\//g,'~1');
        pending.push([(path==='/'?'':path)+'/'+escaped,(pattern==='/'?'':pattern)+'/'+(array?'*':escaped),value[key]]);
      }
    }
  }
  return [...records.values()].map(row=>{
    if(row.scenarios.size!==corpus.length)row.shapes.add('ABSENT');
    return Object.fromEntries(Object.entries(row).map(([k,v])=>[k,v instanceof Set?[...v].sort():v]));
  }).sort((a,b)=>a.path.localeCompare(b.path));
}
test('STOP: cold inventory reproduces, but repeated same-process producer inventory is cache-dependent',async t=>{
  const actual=independentUnion(states);
  const frozen=JSON.parse(readFileSync(new URL('../../docs/Candidate_Snapshot_Producer_Surface_v1.json',import.meta.url)));
  const keys=['path','pattern','shapes','numberShapes','stringValues','scenarios'];
  assert.equal(actual.length,3259);
  assert.deepEqual(actual,frozen.inventory.map(row=>Object.fromEntries(keys.map(k=>[k,row[k]]))));
  const reverse=value=>Array.isArray(value)?value.map(reverse):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).reverse().map(k=>[k,reverse(value[k])])):value;
  assert.deepEqual(independentUnion([...states].reverse().map(c=>({...c,snapshot:reverse(c.snapshot)}))),actual);
  const fresh=await producerCorpus(t),repeated=independentUnion(fresh);
  const baseline=new Map(actual.map(row=>[row.path,row]));
  const changes=repeated.filter(row=>JSON.stringify(row)!==JSON.stringify(baseline.get(row.path)));
  assert(changes.length>0,'Revisit STOP if same-process replay becomes deterministic');
  assert(changes.some(row=>row.path.endsWith('/cache/status')&&row.stringValues.includes('hit')));
  // Retain evidence in the test log without modifying the frozen inventory.
  console.log('REPEATED_INVENTORY_DIFFERENCES',JSON.stringify(changes.map(row=>({path:row.path,before:baseline.get(row.path),after:row}))));
});

test('adversarial actual producer vocabulary and state tables reproduce the frozen 29-case domain',()=>{
  const schema=JSON.parse(readFileSync(new URL('../../docs/Candidate_Snapshot_Producer_Surface_v1.json',import.meta.url)));
  assert.deepEqual([...new Set(states.flatMap(c=>c.spatial.confidence.reasons))].sort(),schema.confidenceVocabulary);
  assert.deepEqual([...new Set(states.flatMap(c=>c.feature.missingRequirements))].sort(),schema.requirementVocabulary);
  assert.deepEqual([...new Map(states.map(c=>[JSON.stringify(c.spatial.confidence.reasons),c.spatial.confidence.reasons])).values()],[...new Map(schema.scenarios.map(c=>[JSON.stringify(c.confidenceReasons),c.confidenceReasons])).values()]);
  const tuples=states.map(c=>[c.spatial.coverage,c.spatial.classification,c.spatial.validNeighborCount,c.feature.samplingFootprint.sampleCount,c.feature.available,c.feature.missingRequirements,c.feature.observationReference===null,c.feature.observedAt===null]);
  assert.equal(new Set(tuples.map(x=>JSON.stringify(x))).size,10);
  assert.deepEqual(states.map(c=>({available:c.feature.available,requirements:c.feature.missingRequirements,referencePresent:c.feature.observationReference!==null,observedAt:c.feature.observedAt})),schema.scenarios.map(c=>c.feature));
});

test('STOP: a reachable weak-axis-separation producer branch is absent from frozen authority',async t=>{
  // Diagnostic only: never persist this scenario into the frozen corpus/delta.
  const before=readFileSync(new URL('../../docs/Candidate_Snapshot_Producer_Surface_v1.json',import.meta.url));
  scenarios.push({name:'adversarial-weak-axis-separation',values:[25,25,26,26.2],center:26});
  let probe;
  try{probe=(await producerCorpus(t)).at(-1);}finally{scenarios.pop();}
  assert.equal(scenarios.length,29);
  assert.equal(probe.spatial.confidence.axisSeparationFahrenheit,0.4);
  assert(probe.spatial.confidence.reasons.includes('weak-axis-separation'));
  assert.deepEqual(probe.snapshot.observations.sst.derived.spatialStructure,probe.spatial);
  const frozen=JSON.parse(before);
  assert(!frozen.confidenceVocabulary.includes('weak-axis-separation'));
  assert(!frozen.scenarios.some(x=>JSON.stringify(x.confidenceReasons)===JSON.stringify(probe.spatial.confidence.reasons)));
  console.log('MISSING_PRODUCER_BRANCH',JSON.stringify({values:[25,25,26,26.2],axisSeparationFahrenheit:probe.spatial.confidence.axisSeparationFahrenheit,reasons:probe.spatial.confidence.reasons}));
  assert.deepEqual(readFileSync(new URL('../../docs/Candidate_Snapshot_Producer_Surface_v1.json',import.meta.url)),before);
});
test('actual snapshot spatial and feature facts remain exact and detached',()=>{
  for(const c of states){
    assert.deepEqual(c.snapshot.observations.sst.derived.spatialStructure,c.spatial);
    assert.deepEqual(c.snapshot.observations.sst.derived.governedEnvironmentalFeatureObservation,c.feature);
    assert.notEqual(c.snapshot.observations.sst.derived.spatialStructure,c.spatial);
  }
});
test('original frozen proposal reproduces without granting authority or rewriting artifacts',()=>{
  const artifact={phase:'A_B_PRODUCER_INVENTORY_AND_FROZEN_PROPOSED_DELTA',baseline:'4b0ce857117b14b4690a656c9a76088a25e79e5c',
    scope:'ENTIRE_CONTROLLED_OBSERVATION_SNAPSHOT_OUTPUT',assessment,
    scenarios:states.map(c=>({name:c.name,neighborCount:c.spatial.validNeighborCount,confidenceReasons:c.spatial.confidence.reasons,
      feature:{available:c.feature.available,requirements:c.feature.missingRequirements,referencePresent:c.feature.observationReference!==null,observedAt:c.feature.observedAt}})),
    producerPathCount:inventory.length,inventory,proposedDelta:delta,
    frozenDeltaSha256:sha(JSON.stringify(delta)),
    confidenceVocabulary:[...new Set(states.flatMap(c=>c.spatial.confidence.reasons))].sort(),
    requirementVocabulary:[...new Set(states.flatMap(c=>c.feature.missingRequirements))].sort(),
    implementationStarted:false};
  const path=new URL('../../docs/Candidate_Snapshot_Producer_Surface_v1.json',import.meta.url);
  const frozen=JSON.parse(readFileSync(path,'utf8'));
  assert.equal(frozen.frozenDeltaSha256,artifact.frozenDeltaSha256,'SNAPSHOT_PRODUCER_SURFACE_INCOMPLETE');
  assert.deepEqual(frozen.inventory,artifact.inventory,'SNAPSHOT_PRODUCER_SURFACE_INCOMPLETE');
  assert.deepEqual(frozen.scenarios,artifact.scenarios,'SNAPSHOT_PRODUCER_SURFACE_INCOMPLETE');
});
