// Task 12B.6J scope STOP diagnostic. No v3 implementation or reconstruction.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getSstSpatialStructure,buildObservationSnapshot,buildGovernedEnvironmentalFeatureObservationV1} from '../server.js';
import {projectCandidateSemanticSurfacesV2 as project,compareCandidateScientificSurfacesV2 as compare} from '../candidateSemanticProjectionV2.mjs';
import prior from '../../docs/Exact_Candidate_Snapshot_Boundary_v1.json' with {type:'json'};
import shapes from '../../docs/Candidate_Semantic_Shapes_v2.json' with {type:'json'};

const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'};
const rootPrefix='/sst/derived/spatialStructure/';
const aliasPrefix='/observationSnapshot/observations/sst/derived/spatialStructure/';
const featurePrefix='/observationSnapshot/observations/sst/derived/governedEnvironmentalFeatureObservation/';
const source=readFileSync(new URL('../server.js',import.meta.url),'utf8');
const cases=[];
let sequence=0;
async function produce(t,values,time='2026-09-24T00:00:00Z',center=78.8){
  const latitude=20+sequence++;let n=0;
  const mock=t.mock.method(globalThis,'fetch',async url=>{
    assert.equal(new URL(url).hostname,'marine-api.open-meteo.com');
    const value=values[n++%4];
    const body='{"latitude":'+latitude+',"longitude":-91,"current":{"time":'+JSON.stringify(time)+',"sea_surface_temperature":'+(Object.is(value,-0)?'-0':JSON.stringify(value))+'}}';
    return {ok:true,json:async()=>JSON.parse(body)};
  });
  try{return await getSstSpatialStructure(latitude,-91,center,assessment);}finally{mock.mock.restore();}
}
const root=s=>({assessment,sst:{derived:{spatialStructure:s}}});
function emit(s){
  const feature=buildGovernedEnvironmentalFeatureObservationV1({spatialStructure:s});
  const sst={derived:{spatialStructure:s,governedEnvironmentalFeatureObservation:feature}};
  const snapshot=buildObservationSnapshot({location:{latitude:25,longitude:-91},observedAt:'2026-09-24T00:00:00Z',
    generatedAt:'2026-09-24T02:00:00Z',observations:{sst}});
  return {feature,snapshot,view:{observationSnapshot:{observations:{sst:snapshot.observations.sst}}}};
}
function at(object,path){return path.slice(1).split('/').reduce((v,k)=>v[k],object);}
function result(view){try{const p=project(view);return {outcome:p.complete?'ACCEPTED':'UNRESOLVED',unresolved:p.unresolved.map(x=>({path:x.path,value:x.value}))};}catch(e){return {outcome:'REJECTED',error:e.message};}}
test.before(async t=>{
  for(const [name,values,time,center] of [
    ['populated',[25,26,27,28]],['missing',[null,null,null,null]],['partial',[25,null,27,null]],
    ['uniform',[25,25,25,25],undefined,77],['positive-zero',[0,0,0,0],undefined,32],['negative-zero',[-0,0,0,0],undefined,32],
    ['missing-time',[25,26,27,28],null]
  ]){const spatial=await produce(t,values,time,center);cases.push({name,spatial,...emit(spatial)});}
});
test('route and snapshot use the existing clone port, not a replacement spatial calculator',()=>{
  const start=source.indexOf('export function buildObservationSnapshot('),end=source.indexOf('export function ',start+30);
  assert(source.slice(start,end).includes('cloneSnapshotValue(\n      observations ?? {}'.replaceAll('\n','\r\n'))||/observations:\s*cloneSnapshotValue\(\s*observations \?\? \{\}/.test(source.slice(start,end)));
  const clone=source.slice(source.indexOf('function cloneSnapshotValue('),source.indexOf('function deepFreezeSnapshotValue('));
  assert(clone.includes('structuredClone('));
  const route=source.slice(source.indexOf('async function getOceanConditionsAtAssessment('));
  assert(/observations:\s*\{\s*wind:[\s\S]*?\bsst,/.test(route));
});
for(const name of ['populated','missing','partial','uniform','positive-zero','negative-zero','missing-time'])test('actual snapshot carries spatial facts exactly: '+name,()=>{
  const c=cases.find(x=>x.name===name);
  assert.deepEqual(c.snapshot.observations.sst.derived.spatialStructure,c.spatial);
  assert.deepEqual(c.snapshot.observations.sst.derived.governedEnvironmentalFeatureObservation,c.feature);
  assert.notEqual(c.snapshot.observations.sst.derived.spatialStructure,c.spatial);
  assert.equal(compare(root(c.spatial),root(c.spatial)).classification,'EXACT_MATCH');
});
test('all 22 prior concrete spatial paths have exact root-to-snapshot correspondence',()=>{
  const c=cases.find(x=>x.name==='missing');
  assert.equal(prior.blockingConcretePaths.length,22);
  for(const path of prior.blockingConcretePaths){assert.equal(at(c.view,path),null);assert(Object.is(at(root(c.spatial),path.replace(aliasPrefix,rootPrefix)),at(c.view,path)));}
  assert.equal(new Set(prior.blockingConcretePaths.map(p=>p.replace(/\/samples\/\d+\//g,'/samples/*/'))).size,16);
});
test('one-at-a-time source mutations survive only as corresponding snapshot spatial changes',()=>{
  const baseline=cases[0].spatial;
  const mutations=[['minimumFahrenheit',-0],['maximumFahrenheit',0],['rangeFahrenheit',null],
    ['orientation/warmSide','north'],['orientation/dominantDifferenceFahrenheit',12],
    ['samples/0/observedAt',null],['samples/0/temperatureCelsius',-0]];
  for(const [path,value] of mutations){
    const changed=structuredClone(baseline),parts=path.split('/');let parent=changed;
    for(const key of parts.slice(0,-1))parent=parent[key];parent[parts.at(-1)]=value;
    const emitted=emit(changed).snapshot.observations.sst.derived.spatialStructure;
    assert.deepEqual(emitted,changed);assert(Object.is(at(emitted,'/'+path),value));
  }
  // These deliberate mutations prove cloning, not scientific legitimacy.
});
test('snapshot clone preserves signed zero and detaches source mutations',()=>{
  const c=cases.find(x=>x.name==='negative-zero'),mutable=structuredClone(c.spatial),out=emit(mutable);
  assert(Object.is(out.snapshot.observations.sst.derived.spatialStructure.samples[0].temperatureCelsius,-0));
  mutable.samples[0].temperatureCelsius=0;
  assert(Object.is(out.snapshot.observations.sst.derived.spatialStructure.samples[0].temperatureCelsius,-0));
});
test('all 28 prior blocked paths remain accounted for without a v2 amendment',()=>{
  const c=cases.find(x=>x.name==='missing'),p=project(c.view);
  assert.deepEqual(p.unresolved.map(x=>x.path).sort(),[...prior.blockingConcretePaths,...prior.otherSubtreeUnresolved.map(x=>x.path)].sort());
  assert.throws(()=>compare(c.view,c.view),/SEMANTIC_AUTHORITY_UNRESOLVED/);
});
test('required uniform and signed-zero snapshots demonstrate additional path-specific privacy authority',()=>{
  for(const name of ['uniform','positive-zero','negative-zero']){
    const c=cases.find(x=>x.name===name),reason='minimal-total-temperature-range';
    assert(c.spatial.confidence.reasons.includes(reason));
    assert.equal(compare(root(c.spatial),root(c.spatial)).classification,'EXACT_MATCH');
    assert.throws(()=>project(c.view),/Private scientific content/);
    const leaf={observationSnapshot:{observations:{sst:{derived:{spatialStructure:{confidence:{reasons:[reason]}}}}}}};
    assert.throws(()=>project(leaf),/Private scientific content/);
    assert(!prior.blockingPatterns.includes(aliasPrefix+'confidence/reasons/*'));
  }
});
test('required missing-time snapshot demonstrates four additional null sample observation paths',()=>{
  const c=cases.find(x=>x.name==='missing-time'),p=project(c.view);
  for(let i=0;i<4;i++){
    const path=aliasPrefix+'samples/'+i+'/observedAt';
    assert(p.unresolved.some(x=>x.path===path&&x.value===null));
    assert(!prior.blockingConcretePaths.includes(path));
  }
  assert(shapes.nullablePaths.some(x=>x.path===rootPrefix+'samples/*/observedAt'));
});
test('feature builder distinguishes unavailable with null time from unavailable with represented time',()=>{
  const missing=cases.find(x=>x.name==='missing').feature,partial=cases.find(x=>x.name==='partial').feature,populated=cases[0].feature;
  assert.equal(missing.available,false);assert.equal(missing.observationReference,null);assert.equal(missing.observedAt,null);
  assert.deepEqual(missing.missingRequirements,prior.otherSubtreeUnresolved.filter(x=>x.path.includes('/missingRequirements/')).map(x=>x.value));
  assert.equal(partial.available,false);assert.equal(partial.observationReference,null);assert.equal(partial.observedAt,'2026-09-24T00:00:00.000Z');
  assert.equal(populated.available,true);assert.deepEqual(populated.missingRequirements,[]);
  assert.match(populated.observationReference,/^pelora-observation-v1:[a-f0-9]{64}$/);
});
test('feature requirements have deterministic producer order and no duplicates',()=>{
  for(const c of cases){assert.equal(new Set(c.feature.missingRequirements).size,c.feature.missingRequirements.length);assert.deepEqual(emit(c.spatial).feature,c.feature);}
  const start=source.indexOf('export function buildGovernedEnvironmentalFeatureObservationV1('),end=source.indexOf('export function ',start+60);
  const body=source.slice(start,end);assert(/missingRequirements:\s*\[\s*\.\.\.new Set\(/.test(body));
  assert(body.includes('JSON.stringify({')); // Existing observation identity, not a new exact digest.
});
test('unmodified v2 still blocks unknown paths and accessors without invocation',()=>{
  const c=structuredClone(cases.find(x=>x.name==='missing').view);
  c.observationSnapshot.observations.sst.unknownScience=1;
  assert.throws(()=>compare(c,c));
  let called=false;Object.defineProperty(c.observationSnapshot.observations.sst,'privateValue',{get(){called=true;return 1;}});
  assert.throws(()=>project(c));assert(!called);
});
test('write proposed authority delta and precise STOP without creating v3',()=>{
  const original=[...prior.blockingConcretePaths,...prior.otherSubtreeUnresolved.map(x=>x.path)];
  const files=['backend/candidateSemanticProjection.mjs','backend/candidateSemanticProjectionV2.mjs',
    'docs/Candidate_Semantic_Surfaces_v1.json','docs/Candidate_Semantic_Shapes_v2.json'];
  const report={verdict:'SNAPSHOT_SEMANTIC_AUTHORITY_UNRESOLVED',baseline:'10ae54e634684771149fa5a728528cbb1a31977f',
    v3Created:false,task12B6C:'PAUSED',task9ED:'PAUSED',scope:'PRODUCER_CORRESPONDENCE_AND_PROPOSED_DELTA_AUDIT_ONLY',
    predecessorHashes:Object.fromEntries(files.map(file=>[file,createHash('sha256').update(readFileSync(new URL('../../'+file,import.meta.url))).digest('hex')])),
    proposedDelta:{applied:false,spatialNullablePatterns:prior.blockingPatterns,
      featurePaths:[featurePrefix+'missingRequirements/*',featurePrefix+'observationReference',featurePrefix+'observedAt']},
    spatialPatternMapping:prior.blockingPatterns.map(snapshotPath=>({snapshotPath,rootPath:snapshotPath.replace(aliasPrefix,rootPrefix),
      mechanism:'buildObservationSnapshot -> cloneSnapshotValue -> structuredClone',correspondence:'EXACT_MATCH',
      upstreamReviewedRule:shapes.nullablePaths.find(x=>x.path===snapshotPath.replace(aliasPrefix,rootPrefix)),
      recomputed:false,defaulted:false,omittedBySnapshot:false,nullifiedBySnapshot:false,temporalSubstitution:false,
      consumer:'fixed candidate semantic registry scientific comparison; source spatial facts also consumed by buildTemperatureEvidence'})),
    featureAudit:{producer:'buildGovernedEnvironmentalFeatureObservationV1',
      consumer:'buildTemperatureEvidence checks available, feature/contract/type/authority, reference shape; carries observation provenance',
      missingRequirements:{role:'producer prerequisite state: length controls available and observation identity; no direct string consumer demonstrated in buildTemperatureEvidence',
        order:'fixed producer check order; Set removes duplicates without reordering',
        reviewedScenarioVocabulary:['sufficient-spatial-coverage','supported-temperature-transition-classification','at-least-three-valid-spatial-samples','consistent-spatial-sample-observation-time'],
        entireProducerVocabularyIsNotNewlyAuthorized:true},
      observationReference:{nullWhen:'available is false',populatedShape:'pelora-observation-v1:<64 lowercase hex>',
        source:'existing SHA256(JSON.stringify(canonicalObservation))',newValidationOrRecomputation:false},
      observedAt:{role:'REPRESENTED_ENVIRONMENTAL_TIME of filtered feature sampling footprint',
        populatedWhen:'exactly one distinct normalized observedAt among retained valid samples',
        nullWhen:'zero or multiple distinct retained sample times',
        availabilityIndependent:true,normalization:'Date.parse eligibility followed by new Date(...).toISOString() in unchanged producer',
        newTimeAuthority:false}},
    additionalAuthorityRequired:[{path:aliasPrefix+'confidence/reasons/*',kind:'PATH_SPECIFIC_PRIVACY_ALLOWLIST',
      demonstratedValue:'minimal-total-temperature-range',condition:'uniform or zero actual producer output'},
      {path:aliasPrefix+'samples/*/observedAt',kind:'PATH_SPECIFIC_NULL_SHAPE',condition:'actual missing-time producer output',
        concretePaths:[0,1,2,3].map(i=>aliasPrefix+'samples/'+i+'/observedAt')}],
    original28Disposition:original.map(path=>({path,disposition:'UNRESOLVED',
      producerCorrespondence:'EXACT_MATCH',proposedAuthority:'CURRENT_OCEAN_SCIENTIFIC_EVIDENCE',
      reason:'No versioned authority granted after out-of-scope prerequisite STOP',
      producer:path.startsWith(aliasPrefix)?'getSstSpatialStructure -> buildObservationSnapshot':'buildGovernedEnvironmentalFeatureObservationV1 -> buildObservationSnapshot',
      copied:true,transformedBySnapshot:false,recomputedBySnapshot:false,defaultedBySnapshot:false})),
    scenarios:cases.map(c=>({name:c.name,rootComparison:'EXACT_MATCH',snapshotSpatialCorrespondence:'EXACT_MATCH',
      projection:result(c.view),feature:{available:c.feature.available,missingRequirements:c.feature.missingRequirements,
        observationReference:c.feature.observationReference,observedAt:c.feature.observedAt}})),
    qualification:'NOT_QUALIFIED',nextGate:'Separately authorize/review exact additional snapshot reason privacy and sample observedAt authority; then re-enter snapshot shape qualification',
    openIssue:'UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED'};
  assert.equal(report.original28Disposition.length,28);
  if(process.env.PELORA_SNAPSHOT_SHAPE_REPORT)writeFileSync(process.env.PELORA_SNAPSHOT_SHAPE_REPORT,JSON.stringify(report,null,2)+'\n');
});
