import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {isolatedProducerCorpus,isolatedScenarios} from './fixtures/cacheIsolatedSnapshotFixture.mjs';
import registry from '../../docs/Candidate_Semantic_Surfaces_v1.json' with {type:'json'};
const sha=x=>createHash('sha256').update(x).digest('hex');
const rules=new Map(registry.reviewedPaths.map(x=>[x[0],x]));
const pointer=x=>x.replaceAll('~','~0').replaceAll('/','~1');
const pattern=p=>p.replace(/\/\d+(?=\/|$)/g,'/*');
function leaves(value,path='/observationSnapshot',out=[]){
  if(value===null||typeof value!=='object')out.push([path,value]);
  else for(const key of Object.keys(value))leaves(value[key],path+'/'+pointer(key),out);
  return out;
}
function semantic(snapshot){return leaves(snapshot).filter(([p])=>rules.get(pattern(p))?.[1]!=='operationalRequestContext');}
function inventory(rows){
 const map=new Map();
 for(const c of rows){const seen=new Set();
  function walk(v,p='/observationSnapshot'){
   const shape=v===null?'NULL':Array.isArray(v)?'ARRAY':typeof v==='object'?'OBJECT':typeof v==='string'?'STRING':typeof v==='number'?'NUMBER':'BOOLEAN';
   let x=map.get(p);if(!x){x={path:p,pattern:pattern(p),shapes:new Set(),numbers:new Set(),strings:new Set(),cases:new Set(),authority:rules.get(pattern(p))?.[1]??'UNRESOLVED'};map.set(p,x);}
   x.shapes.add(shape);seen.add(p);x.cases.add(c.name+'/'+c.cacheRun);
   if(typeof v==='number')x.numbers.add(Object.is(v,-0)?'-0':v===0?'+0':'FINITE_NONZERO');
   if(typeof v==='string')x.strings.add(v);
   if(Array.isArray(v))x.shapes.add(v.length?'POPULATED_ARRAY':'EMPTY_ARRAY');
   if(v!==null&&typeof v==='object')for(const k of Object.keys(v))walk(v[k],p+'/'+pointer(k));
  }walk(c.snapshot);
 }
 return [...map.values()].map(x=>{if(x.cases.size<rows.length)x.shapes.add('ABSENT');return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,v instanceof Set?[...v].sort():v]));}).sort((a,b)=>a.path.localeCompare(b.path));
}
let baseline,union;const hashes=[];
test('request-keyed corpus: actual cold and warm producer scientific/feature outputs agree',async t=>{
 baseline=await isolatedProducerCorpus(t);union=inventory(baseline);hashes.push(sha(JSON.stringify(union)));
 for(const name of isolatedScenarios.map(x=>x.name)){
  const [cold,warm]=baseline.filter(x=>x.name===name);
  assert.deepEqual(semantic(cold.snapshot),semantic(warm.snapshot),'PRODUCTION_CACHE_SEMANTIC_MISMATCH: '+name);
  assert.deepEqual(cold.feature,warm.feature);assert.deepEqual(cold.snapshot.observations.sst.derived.spatialStructure,cold.spatial);
 }
 const full=baseline.find(x=>x.name==='direction-mask-15'&&x.cacheRun==='warm');assert.equal(full.requests,1);
});
test('three same-process enumerations have identical complete inventory digests',async t=>{
 for(let i=0;i<2;i++){const rows=await isolatedProducerCorpus(t),next=inventory(rows);assert.deepEqual(next,union);assert.deepEqual(rows.map(x=>semantic(x.snapshot)),baseline.map(x=>semantic(x.snapshot)));hashes.push(sha(JSON.stringify(next)));}
 console.log('ISOLATED_INVENTORY',JSON.stringify({scenarioCount:isolatedScenarios.length,paths:union.length,hashes}));
});
test('weak-axis branch and signed-zero correspondence use actual producers',()=>{
 const weak=baseline.find(x=>x.name==='weak-axis-separation');assert.equal(weak.spatial.confidence.axisSeparationFahrenheit,0.4);assert(weak.spatial.confidence.reasons.includes('weak-axis-separation'));
 const zero=baseline.find(x=>x.name==='negative-zero');assert(zero.spatial.samples.every(x=>Object.is(x.temperatureCelsius,-0)));
});
test('quarantined draft bytes unchanged; no draft is imported as authority',()=>{
 const hashes={
 'backend/candidateSemanticProjectionV3.mjs':'cc610ad547fac883c003219f143035101679a1f5adb6ccc0f10e14dd74adab0e',
 'backend/tests/candidateSemanticProjectionV3.test.js':'98f097f673976161946d7d311661477e345bca0add4a2957b9d1527199fe16ab',
 'docs/Candidate_Semantic_Shapes_v3.json':'0987dfbd9eca48e10e283757381c1a87b67caceca961e3ca20ee79c4dcb4673c'};
 for(const [path,expected] of Object.entries(hashes))assert.equal(sha(readFileSync(new URL('../../'+path,import.meta.url))),expected);
});
import {branchMatrix,confidenceReasonSourceVocabulary,reasonStages} from './fixtures/snapshotProducerBranchAudit.mjs';
test('recorded branch rows reproduce their coverage claim; adversarial tests challenge completeness',()=>{
 const matrix=branchMatrix(baseline),uncovered=matrix.branches.filter(x=>x.status==='UNCOVERED');
 console.log('BRANCH_AUDIT',JSON.stringify({total:matrix.branches.length,reachable:matrix.branches.filter(x=>x.reachable).length,unreachable:matrix.branches.filter(x=>!x.reachable).length,uncovered}));
 assert.equal(uncovered.length,0,'SNAPSHOT_PRODUCER_SURFACE_INCOMPLETE');
 const emitted=[...new Set(baseline.flatMap(x=>x.spatial.confidence.reasons))].sort();
 assert.deepEqual(emitted,confidenceReasonSourceVocabulary.filter(x=>x!=='future-dated-sample-time').sort());
 for(const c of baseline){let last=-1;for(const reason of c.spatial.confidence.reasons){const stage=reasonStages.findIndex(x=>x.values.includes(reason));assert(stage>last);last=stage;}}
});
import {projectCandidateSemanticSurfacesV2} from '../candidateSemanticProjectionV2.mjs';
const paths={inventory:'docs/Candidate_Snapshot_Producer_Surface_v2.json',branches:'docs/Candidate_Snapshot_Producer_Branches_v1.json',scenarios:'docs/Candidate_Snapshot_Producer_Scenarios_v1.json',delta:'docs/Candidate_Semantic_Projection_v3_Proposed_Delta.json',freeze:'docs/Candidate_Snapshot_Authority_Freeze_v1.json'};
const file=path=>new URL('../../'+path,import.meta.url);
function projectionProbe(path,value){let result=value;for(const k of path.slice(1).split('/').reverse())result=/^\d+$/.test(k)?[result]:{[k]:result};return projectCandidateSemanticSurfacesV2(result);}
function proposed(rows,inv,matrix){
 const additions=[];
 for(const item of inv){const rule=rules.get(item.pattern),types=item.shapes.filter(x=>['NULL','STRING','NUMBER','BOOLEAN'].includes(x));
  const newTypes=types.filter(t=>!rule||!rule[3].includes(t.toLowerCase()));
  const newStrings=[];
  if(rule?.[1]==='currentOceanScientificEvidence')for(const s of item.strings){try{projectionProbe(item.path,s);}catch{newStrings.push(s);}}
  if(!newTypes.length&&!newStrings.length)continue;
  let role=rule?.[1];if(!role&&item.path.includes('/governedEnvironmentalFeatureObservation/missingRequirements/'))role='currentOceanScientificEvidence';
  const feature=item.path.includes('/governedEnvironmentalFeatureObservation/');
  const sourceMapping=item.path.startsWith('/observationSnapshot/evidence/groups/temperature/')?item.path.replace('/observationSnapshot/evidence/groups/temperature/','/sst/derived/spatialStructure/') :item.path.replace('/observationSnapshot/observations/','/');
  const evidence=matrix.branches.filter(b=>b.reachable&&b.paths.some(p=>item.path===p||item.path.startsWith(p.replace(/\/\*.*$/,''))));
  additions.push({path:item.path,pattern:item.pattern,newTypes,newStrings,semanticSurface:role??'UNRESOLVED_AUTHORITY',classification:role?'NEW_AUTHORITY_REQUIRED':'UNRESOLVED_AUTHORITY',sourceMapping,producer:feature?'buildGovernedEnvironmentalFeatureObservationV1':item.path.endsWith('/temperatureBand')?'classifySeaSurfaceTemperature':'snapshot structuredClone / buildTemperatureEvidence carry-forward',branches:evidence.map(x=>x.id),scenarios:item.cases,downstreamRole:feature?'Requirements govern feature availability/reference; temperature evidence consumes observation provenance.':'Retained current scientific fact under unchanged v2 classification.',reason:'Actual producer-emitted leaf shape or exact scientific string is absent from locked v2 allowance.'});
 }
 return {version:'pelora-snapshot-future-projection-v3-authority-proposal-v1',status:'PROPOSAL_ONLY_NOT_IMPLEMENTED',comparisonAuthority:'pelora-candidate-semantic-projection-v2',entries:additions,confidenceReasonStages:reasonStages,confidenceVocabulary:confidenceReasonSourceVocabulary.filter(x=>x!=='future-dated-sample-time'),requirements:matrix.requirementSourceVocabulary.filter(x=>matrix.branches.find(b=>b.id==='requirement:'+x)?.reachable),referenceBoundary:'Shape/placement only, never digest/content authentication',temporalBoundary:'Sample represented time retained; feature time is one unique normalized retained sample time, else null; no assessment/quality/retrieval substitution',patterns:'Entries grant no authority yet. Exact concrete paths; no implicit wildcard siblings.'};
}
test('pre-implementation proposal and freeze reproduce exact independently enumerated content',()=>{
 const matrix=branchMatrix(baseline),proposal=proposed(baseline,union,matrix);
 assert(!proposal.entries.some(x=>x.classification==='UNRESOLVED_AUTHORITY'),'SNAPSHOT_SEMANTIC_AUTHORITY_UNRESOLVED');
 assert(proposal.entries.every(x=>x.branches.length),'Missing branch source evidence');
 const old=JSON.parse(readFileSync(file('docs/Candidate_Snapshot_Producer_Surface_v1.json'))),oldMap=new Map(old.inventory.map(x=>[x.path,x]));
 const inventoryArtifact={version:'pelora-snapshot-producer-surface-v2',status:'CANDIDATE_FOR_ADVERSARIAL_REVIEW',scenarioCount:isolatedScenarios.length,pathCount:union.length,inventoryDigest:sha(JSON.stringify(union)),inventory:union,oldComparison:union.map(x=>({path:x.path,classification:x.strings.includes('weak-axis-separation')?'OLD_MISSING_REACHABLE_BRANCH':x.path.includes('/cache/')?'OLD_CACHE_ARTIFACT':!oldMap.has(x.path)?'NEWLY_EXPOSED_BY_BRANCH_COMPLETENESS':(JSON.stringify(x.shapes)===JSON.stringify(oldMap.get(x.path).shapes)&&JSON.stringify(x.strings)===JSON.stringify(oldMap.get(x.path).stringValues)?'SAME':'OTHER_EXPLAINED'),note:'All paths and shapes retained. OTHER_EXPLAINED records changed scenario coverage or deterministic fixed auxiliary input vocabularies; old/new exact values are separately preserved.'})),oldOnly:old.inventory.filter(x=>!union.some(y=>y.path===x.path)).map(x=>({path:x.path,classification:'OTHER_EXPLAINED',reason:'Historical synthetic wrapper root is not a producer-emitted snapshot path.'}))};
 const scenariosArtifact={version:'pelora-snapshot-producer-scenarios-v1',domain:'Nonpolar four-cardinal SST samples, finite-or-null C, valid UTC or null sample time, explicit rejection; fixed valid provider/location metadata; fixed producer-derived non-SST context; explicit scientific assessment. Corrupt contract arguments and geography expansion excluded.',scenarios:isolatedScenarios.map(x=>({...x,center:Object.is(x.center,-0)?"NEGATIVE_ZERO":x.center,values:x.values.map(v=>Object.is(v,-0)?"NEGATIVE_ZERO":v)})),scenarioEvidence:baseline.filter(x=>x.cacheRun==='cold').map(x=>({id:x.name,confidenceReasons:x.spatial.confidence.reasons,requirements:x.feature.missingRequirements,available:x.feature.available,observedAt:x.feature.observedAt,sampleCount:x.feature.samplingFootprint.sampleCount})),signedZeroNote:'NEGATIVE_ZERO is an explicit scenario-description label, not a provider value or new scientific serializer; the hashed fixture constructs literal -0 transport and exact producer comparison never canonicalizes signs.'};
 const contents={inventory:inventoryArtifact,branches:matrix,scenarios:scenariosArtifact,delta:proposal};
 if(process.env.PELORA_FREEZE_ISOLATED_PROPOSAL==='1'){
  for(const [key,content] of Object.entries(contents))writeFileSync(file(paths[key]),JSON.stringify(content,null,2)+'\n',{flag:'wx'});
  const references=Object.fromEntries(Object.keys(contents).map(k=>[k,{path:paths[k],sha256:sha(readFileSync(file(paths[k])))}]));
  const sourceFiles=['backend/server.js','backend/candidateSemanticProjection.mjs','backend/candidateSemanticProjectionV2.mjs','docs/Candidate_Semantic_Surfaces_v1.json','docs/Candidate_Semantic_Shapes_v2.json','backend/tests/fixtures/cacheIsolatedSnapshotFixture.mjs','backend/tests/fixtures/snapshotProducerBranchAudit.mjs'];
  writeFileSync(file(paths.freeze),JSON.stringify({version:'pelora-snapshot-authority-preimplementation-freeze-v1',status:'REVIEW_REQUIRED_NO_AUTHORITY_GRANTED',baseline:'c0d97f1f1281e99898b908af8dd9c8e1f81056d1',references,sourceFiles:Object.fromEntries(sourceFiles.map(p=>[p,sha(readFileSync(file(p)))])),statement:'No projection v3 was implemented from this proposal. Existing unqualified draft files were quarantined and not imported. STOP for review before implementation.'},null,2)+'\n',{flag:'wx'});
 }
 const frozen=JSON.parse(readFileSync(file(paths.freeze)));
 for(const [key,reference] of Object.entries(frozen.references)){assert.equal(sha(readFileSync(file(reference.path))),reference.sha256);assert.deepEqual(JSON.parse(readFileSync(file(reference.path))),contents[key]);}
 for(const [p,h] of Object.entries(frozen.sourceFiles))assert.equal(sha(readFileSync(file(p))),h);
 console.log('FROZEN_PROPOSAL',JSON.stringify({paths:union.length,delta:proposal.entries.length,branches:matrix.branches.length,inventory:inventoryArtifact.inventoryDigest}));
});

// Adversarial STOP evidence. These tests preserve the failed proposal, not amend it.
test('independent stack enumeration reproduces the fixed-order inventory, not completeness',()=>{
 const found=new Map();
 for(const row of baseline){
  const stack=[['/observationSnapshot',row.snapshot]];
  while(stack.length){
   const [path,value]=stack.pop();
   let item=found.get(path);
   if(!item){item={shapes:new Set(),numbers:new Set(),strings:new Set(),cases:new Set()};found.set(path,item);}
   item.cases.add(row.name+'/'+row.cacheRun);
   item.shapes.add(value===null?'NULL':Array.isArray(value)?'ARRAY':typeof value==='object'?'OBJECT':typeof value==='string'?'STRING':typeof value==='number'?'NUMBER':'BOOLEAN');
   if(Array.isArray(value))item.shapes.add(value.length?'POPULATED_ARRAY':'EMPTY_ARRAY');
   if(typeof value==='number')item.numbers.add(Object.is(value,-0)?'-0':value===0?'+0':'FINITE_NONZERO');
   if(typeof value==='string')item.strings.add(value);
   if(value!==null&&typeof value==='object')for(const key of Object.keys(value).reverse())stack.push([path+'/'+key.replaceAll('~','~0').replaceAll('/','~1'),value[key]]);
  }
 }
 const independent=[...found].map(([path,item])=>{
  if(item.cases.size<baseline.length)item.shapes.add('ABSENT');
  const pattern=path.replace(/\/\d+(?=\/|$)/g,'/*');
  return {path,pattern,shapes:[...item.shapes].sort(),numbers:[...item.numbers].sort(),strings:[...item.strings].sort(),cases:[...item.cases].sort(),authority:rules.get(pattern)?.[1]??'UNRESOLVED'};
 }).sort((a,b)=>a.path.localeCompare(b.path));
 assert.equal(independent.length,3258);
 assert.deepEqual(independent,union);
 assert.equal(sha(JSON.stringify(independent)),'0f6b06cd02d2917db2fee6ac327c166b866167790d1870e3b24596ecc285f559');
});

test('STOP: scenario execution order still changes scientific locations and references',async t=>{
 const original=[...isolatedScenarios];
 try {
  isolatedScenarios.reverse();
  const reordered=await isolatedProducerCorpus(t),next=inventory(reordered);
  const changed=baseline.filter(row=>!isDeepStrictEqual(row.feature,reordered.find(other=>other.name===row.name&&other.cacheRun===row.cacheRun).feature));
  assert.equal(changed.length,84);
  assert.notEqual(sha(JSON.stringify(next)),sha(JSON.stringify(union)));
  const before=baseline.find(x=>x.name==='direction-mask-15'),after=reordered.find(x=>x.name===before.name);
  assert.equal(before.feature.samplingFootprint.samples[0].requestedLatitude,45.25);
  assert.equal(after.feature.samplingFootprint.samples[0].requestedLatitude,59.25);
  assert.notEqual(before.feature.observationReference,after.feature.observationReference);
  const changedRecords=union.filter(record=>!isDeepStrictEqual(record,next.find(x=>x.path===record.path))).length;
  console.log('ADVERSARIAL_ORDER_STOP',JSON.stringify({changedFeatureRecords:changed.length,changedInventoryRecords:changedRecords,baseline:sha(JSON.stringify(union)),reordered:sha(JSON.stringify(next))}));
 } finally {isolatedScenarios.splice(0,isolatedScenarios.length,...original);}
});

test('STOP: a valid partial scenario emits an unrecorded temperature-driver value at a reviewed path',async t=>{
 const original=[...isolatedScenarios];
 const path='/observationSnapshot/evidence/groups/temperature/drivers/3';
 const value='spatial-pattern-confidence-low';
 try {
  // Only synthetic transport inputs change. Existing parser and all assemblers execute.
  isolatedScenarios.splice(0,isolatedScenarios.length,{name:'adversarial-partial-low-confidence',values:[25,25,null,25.2],center:25});
  const rows=await isolatedProducerCorpus(t);
  assert(!union.find(x=>x.path===path).strings.includes(value));
  assert.equal(baseline.filter(x=>x.snapshot.evidence.groups.temperature.drivers[3]===value).length,0);
  for(const row of rows){
   assert.equal(row.spatial.validNeighborCount,3);
   assert.equal(row.spatial.confidence.level,'low');
   assert.equal(row.snapshot.evidence.groups.temperature.drivers[3],value);
  }
  const source=readFileSync(file('backend/server.js'),'utf8');
  assert(source.includes('`spatial-pattern-confidence-${confidence.level}`'));
  const matrix=branchMatrix(baseline);
  assert(!matrix.branches.some(x=>x.paths.some(p=>p.includes('/drivers'))));
  console.log('ADVERSARIAL_SURFACE_STOP',JSON.stringify({input:[25,25,null,25.2],center:25,path,value,score:rows[0].spatial.confidence.score,reasons:rows[0].spatial.confidence.reasons,drivers:rows[0].snapshot.evidence.groups.temperature.drivers}));
 } finally {isolatedScenarios.splice(0,isolatedScenarios.length,...original);}
});

test('STOP: duplicate case labels fabricate ABSENT for a container present in every output',()=>{
 const root=union.find(x=>x.path==='/observationSnapshot');
 assert(!root.shapes.includes('ABSENT'));
 const repeated=[...baseline,baseline[0]];
 assert(repeated.every(x=>x.snapshot!==null&&typeof x.snapshot==='object'));
 const duplicated=inventory(repeated).find(x=>x.path==='/observationSnapshot');
 assert(duplicated.shapes.includes('ABSENT'));
 assert.equal(duplicated.cases.length,90);
 assert.equal(repeated.length,91);
});

test('freeze byte integrity survives review and detects one-byte tampering, without granting authority',()=>{
 const frozen=JSON.parse(readFileSync(file(paths.freeze)));
 for(const reference of Object.values(frozen.references)){
  const bytes=readFileSync(file(reference.path));
  assert.equal(sha(bytes),reference.sha256);
  const altered=Buffer.from(bytes);altered[0]^=1;
  assert.notEqual(sha(altered),reference.sha256);
 }
 for(const [path,expected] of Object.entries(frozen.sourceFiles))assert.equal(sha(readFileSync(file(path))),expected);
 assert.equal(frozen.status,'REVIEW_REQUIRED_NO_AUTHORITY_GRANTED');
});
