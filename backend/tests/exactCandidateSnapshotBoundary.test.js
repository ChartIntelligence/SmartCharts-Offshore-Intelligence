import {existingDeclaration} from './fixtures/sourceDeclarationFixture.mjs';
// Exact-capture STOP diagnostic. Root reconstruction does not qualify complete candidate evidence. Extracts unchanged private assembler bodies;
// no production integration, alternative scientific algorithm or species evaluator.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {getSeaSurfaceTemperaturePoint,getSstSpatialStructure,assessSstTransitionConfidence,
  buildUnifiedOpportunityCandidateSourceUniverseV1,resolveOpportunityCandidateBathymetryV1} from '../server.js';
import {resolveScientificAssessmentV1,requireScientificAssessmentV1} from '../scientificAssessment.mjs';
import {captureCurrentEvidenceV2,serializeCurrentEvidenceCaptureV2,readCurrentEvidenceCaptureV2,replayCurrentEvidenceSourceV2,currentCaptureReferenceV2,validateCurrentCaptureReferenceV2} from '../currentEvidenceCaptureV2.mjs';
import {projectCandidateSemanticSurfacesV2 as project,compareCandidateScientificSurfacesV2 as compare} from '../candidateSemanticProjectionV2.mjs';
import {copy,freeze} from '../../shared/oceanPublication.mjs';
import {ref} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {buildObservationSnapshot,buildGovernedEnvironmentalFeatureObservationV1} from '../server.js';
import {writeFileSync} from 'node:fs';

const source=readFileSync(new URL('../server.js',import.meta.url),'utf8');
function block(start,end){const a=source.indexOf(start),b=source.indexOf(end,a+start.length);assert(a>=0&&b>a);return source.slice(a,b);}
const radius=source.match(/const SST_SPATIAL_SAMPLE_RADIUS_NM =\s*\d+;/)[0];
const ttl=source.match(/const SST_POINT_CACHE_TTL_MS =\s*5 \* 60 \* 1000;/)[0];
const pointsCode=block('function createSstSpatialSamplePoints(','export async function getSeaSurfaceTemperaturePoint(');
const rangeCode=block('function classifySstSpatialRange(','function deriveSstTransitionOrientation(');
const orientationCode=block('function deriveSstTransitionOrientation(','export function assessSstTransitionConfidence(');
const assemblerCode=block('async function getSstSpatialStructureAtAssessment(','export async function getMarineConditions(');
const points=new Function(radius+pointsCode+'return createSstSpatialSamplePoints;')();
const offline=new Function('getCachedSeaSurfaceTemperaturePoint','resolveScientificAssessmentV1','assessSstTransitionConfidence',
  radius+ttl+pointsCode+rangeCode+orientationCode+assemblerCode+'return getSstSpatialStructureAtAssessment;');
const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'};
const catalog=buildUnifiedOpportunityCandidateSourceUniverseV1().candidates;
const used=new Set();
function candidate(){
  for(const c of catalog){
    const locations=points(...c.coordinates),keys=locations.map(p=>p.latitude.toFixed(4)+','+p.longitude.toFixed(4));
    if(keys.some(k=>used.has(k)))continue;
    keys.forEach(k=>used.add(k));return copy(c);
  }
  throw Error('No independent governed test candidate');
}
const context=c=>({id:c.id,coordinates:copy(c.coordinates),bathymetry:resolveOpportunityCandidateBathymetryV1(c)});
const wrap=(spatial,c,a)=>({assessment:a,candidateContext:context(c),sst:{derived:{spatialStructure:spatial}}});
async function fixture(t,values,center=26,time='2026-09-24T00:00:00Z'){
  const c=candidate(),locations=points(...c.coordinates);
  const entries=[{role:'center',latitude:c.coordinates[0],longitude:c.coordinates[1],value:center},
    ...locations.map((p,i)=>({role:p.direction,latitude:p.latitude,longitude:p.longitude,value:values[i]}))];
  const fetch=t.mock.method(globalThis,'fetch',async url=>{
    const u=new URL(url);assert.equal(u.hostname,'marine-api.open-meteo.com');
    const lat=Number(u.searchParams.get('latitude')),lon=Number(u.searchParams.get('longitude'));
    const entry=entries.find(p=>p.latitude===lat&&p.longitude===lon);assert(entry);
    // Literal JSON -0 is valid transport syntax and JSON.parse preserves its sign.
    const raw=Object.is(entry.value,-0)?'-0':JSON.stringify(entry.value);
    const body='{"latitude":'+lat+',"longitude":'+lon+',"current":{"time":'+JSON.stringify(time)+',"sea_surface_temperature":'+raw+'}}';
    return {ok:true,json:async()=>JSON.parse(body)};
  });
  try{
    const normalized=[];
    for(const e of entries)normalized.push({role:e.role,outcome:'FULFILLED',point:await getSeaSurfaceTemperaturePoint(e.latitude,e.longitude)});
    const captured=captureCurrentEvidenceV2({family:'SST',sourceAuthority:{status:'SYNTHETIC_FIXTURE',reference:ref('synthetic-'+c.id)},
      samples:normalized,lineageReferences:[ref('synthetic-current-parser')]});
    const serialized=serializeCurrentEvidenceCaptureV2(captured);
    const current=await getSstSpatialStructure(...c.coordinates,normalized[0].point.temperatureFahrenheit,assessment);
    return {candidate:c,binding:freeze({candidate:context(c),assessment:requireScientificAssessmentV1(assessment),reference:currentCaptureReferenceV2(captured)}),
      captured,serialized,normalized,current,A:wrap(current,c,assessment)};
  }finally{fetch.mock.restore();}
}
async function reconstruct(serialized,c,a,binding){
  const exact=copy(c),governed=catalog.find(x=>x.id===exact.id);
  assert(governed,'Exact governed candidate identity required');
  assert.deepEqual(context(exact),context(governed),'Candidate/static substitution');
  assert.deepEqual(context(exact),binding.candidate,'Wrong bound candidate');
  const at=requireScientificAssessmentV1(a);assert.deepEqual(at,binding.assessment,'Wrong assessment');
  const capture=readCurrentEvidenceCaptureV2(serialized);
  validateCurrentCaptureReferenceV2(binding.reference,capture);
  const replay=replayCurrentEvidenceSourceV2(capture);
  assert.equal(replay.family,'SST');
  const center=replay.samples.find(s=>s.role==='center');assert(center);
  assert.equal(center.point.requestedLatitude,exact.coordinates[0]);assert.equal(center.point.requestedLongitude,exact.coordinates[1]);
  const expected=points(...exact.coordinates);
  const port=async(lat,lon)=>{
    const e=expected.find(p=>p.latitude===lat&&p.longitude===lon);assert(e,'Exact sample location required');
    const sample=replay.samples.find(s=>s.role===e.direction);assert(sample);
    assert.equal(sample.point.requestedLatitude,lat);assert.equal(sample.point.requestedLongitude,lon);
    return copy(sample.point); // Only frozen normalized source; no derived fields or cache facts.
  };
  const assemble=offline(port,resolveScientificAssessmentV1,assessSstTransitionConfidence);
  const spatial=await assemble(...exact.coordinates,center.point.temperatureFahrenheit,at);
  return freeze(wrap(spatial,exact,a));
}
const scenarios=[
 ['populated',[25,26,27,28],26],
 ['all directional missing',[null,null,null,null],26],
 ['one missing',[null,26,27,28],26],
 ['two missing',[null,null,27,28],26],
 ['three missing',[null,null,null,28],26],
 ['center and directions missing',[null,null,null,null],null],
 ['center missing',[25,26,27,28],null],
 ['uniform',[25,25,25,25],25],
 ['positive zero',[0,0,0,0],0],
 ['missing time',[25,26,27,28],26,null],
 ['negative zero',[-0,0,0,0],0]
];
const bundles=[];
test.before(async t=>{for(const [,values,center,time] of scenarios)bundles.push(await fixture(t,values,center,time));});
for(let i=0;i<scenarios.length;i++)test('independent capture-derived SST producer comparison: '+scenarios[i][0],async()=>{
  const b=bundles[i],B=await reconstruct(b.serialized,b.candidate,assessment,b.binding);
  assert.equal(compare(b.A,B).classification,'EXACT_MATCH');
  assert.notEqual(b.A.sst.derived.spatialStructure,B.sst.derived.spatialStructure);
});

// The route's exact SST assembly block and snapshot builder, without executing
// its provider/Auth/history/species wrapper. No replacement scientific formulas.
const sstStart=source.indexOf('    const sst = {',source.indexOf('async function getOceanConditionsAtAssessment('));
const sstEnd=source.indexOf('const oceanEvidence =',sstStart);
assert(sstStart>0&&sstEnd>sstStart);
const band=existingDeclaration(source,'classifySeaSurfaceTemperature');
const assembleSst=new Function('marine','sstSpatial','governedEnvironmentalFeatureObservation','classifySeaSurfaceTemperature',source.slice(sstStart,sstEnd)+'return sst;');
function snapshotView(center,spatial){
  const sst=assembleSst({sst:center},spatial,buildGovernedEnvironmentalFeatureObservationV1({spatialStructure:spatial}),band);
  const snapshot=buildObservationSnapshot({location:{latitude:center.requestedLatitude,longitude:center.requestedLongitude},
    observedAt:center.observedAt,generatedAt:'2026-09-24T02:00:00Z',observations:{sst}});
  // Inspect the emitted observations branch in isolation to avoid attributing
  // unrelated omitted snapshot inputs to this demonstrated boundary.
  return {observationSnapshot:{observations:{sst:snapshot.observations.sst}}};
}
async function independentSnapshot(b){
  const replay=replayCurrentEvidenceSourceV2(readCurrentEvidenceCaptureV2(b.serialized));
  const B=await reconstruct(b.serialized,b.candidate,assessment,b.binding);
  return snapshotView(replay.samples.find(s=>s.role==='center').point,B.sst.derived.spatialStructure);
}
const aliasPrefix='/observationSnapshot/observations/sst/derived/spatialStructure/';
test('actual snapshot producer and reconstruction agree on known science and blocked null leaves',async()=>{
  const b=bundles[1],A=snapshotView(b.normalized[0].point,b.current),B=await independentSnapshot(b);
  assert.notEqual(A.observationSnapshot.observations.sst,B.observationSnapshot.observations.sst);
  const p=project(A),q=project(B);
  assert.deepEqual(p.currentOceanScientificEvidence,q.currentOceanScientificEvidence);
  // The producer also emits cache metadata. Retain its governed operational
  // classification; whole-object equality is deliberately not the criterion.
  const unresolved=p.unresolved.filter(x=>x.path.startsWith(aliasPrefix));
  assert.equal(unresolved.length,22);assert(unresolved.every(x=>x.value===null));
  assert.equal(p.unresolved.length,28);
  const featurePrefix='/observationSnapshot/observations/sst/derived/governedEnvironmentalFeatureObservation/';
  assert.deepEqual(p.unresolved.filter(x=>!x.path.startsWith(aliasPrefix)).map(x=>[x.path.slice(featurePrefix.length),x.value]),[
    ['missingRequirements/0','sufficient-spatial-coverage'],
    ['missingRequirements/1','supported-temperature-transition-classification'],
    ['missingRequirements/2','at-least-three-valid-spatial-samples'],
    ['missingRequirements/3','consistent-spatial-sample-observation-time'],
    ['observationReference',null],['observedAt',null]
  ]);
  assert.deepEqual(p.unresolved,q.unresolved);
  assert.throws(()=>compare(A,B),/SEMANTIC_AUTHORITY_UNRESOLVED/);
});
test('the 16 snapshot alias patterns retain scientific authority but lack the root null amendment',async()=>{
  const b=bundles[1],view=await independentSnapshot(b),p=project(view);
  const registry=JSON.parse(readFileSync(new URL('../../docs/Candidate_Semantic_Surfaces_v1.json',import.meta.url),'utf8'));
  const rows=new Map(registry.reviewedPaths.map(row=>[row[0],row]));
  const paths=[...new Set(p.unresolved.filter(x=>x.path.startsWith(aliasPrefix)).map(x=>x.path.replace(/\/samples\/\d+\//g,'/samples/*/')))];
  assert.equal(paths.length,16);
  for(const path of paths){assert.equal(rows.get(path)[1],'currentOceanScientificEvidence');assert(!rows.get(path)[3].includes('null'));}
});
test('removing Path A derived and normalized working objects does not prevent exact replay',async t=>{
  const expected=await independentSnapshot(bundles[1]),b=copy(bundles[1]);
  delete b.A;delete b.current;delete b.normalized;delete b.captured;
  t.mock.method(globalThis,'fetch',()=>{throw Error('network prohibited');});
  t.mock.method(Date,'now',()=>{throw Error('scientific wall clock prohibited');});
  assert.deepEqual(await independentSnapshot(b),expected);
});
test('negative zero survives exact wire/reference/replay and authoritative spatial assembly',async()=>{
  const b=bundles[10],B=await reconstruct(b.serialized,b.candidate,assessment,b.binding);
  assert(Object.is(B.sst.derived.spatialStructure.samples[0].temperatureCelsius,-0));
  assert.equal(compare(b.A,B).classification,'EXACT_MATCH');
});
test('candidate coordinates static context assessment and exact reference substitutions fail',async()=>{
  const b=bundles[0];
  for(const change of [c=>c.id='unknown',c=>c.id=catalog[1].id,c=>c.coordinates[0]+=0.00001,c=>c.coordinates[1]+=0.00001,
    c=>{delete c.id;c.rank=1;},c=>{delete c.id;c.name=b.candidate.name;},c=>c.waterMask.elevationMeters-=1]){
    const c=copy(b.candidate);change(c);await assert.rejects(reconstruct(b.serialized,c,assessment,b.binding));
  }
  await assert.rejects(reconstruct(b.serialized,b.candidate,{...assessment,assessmentAt:'2026-09-24T03:00:00Z'},b.binding));
  await assert.rejects(reconstruct(bundles[1].serialized,b.candidate,assessment,b.binding));
});
test('unknown descendants and deleting the scientific subtree cannot establish complete equivalence',async()=>{
  const b=bundles[1],B=await independentSnapshot(b);
  assert.throws(()=>compare(B,{}));assert.throws(()=>compare({},B));
  const unknown=copy(B);unknown.observationSnapshot.observations.sst.unknownScience=1;
  assert.throws(()=>compare(B,unknown));
});
test('emit bounded inventory and exact STOP evidence without claiming remaining paths qualified',async()=>{
  const rows=[];
  for(let i=0;i<bundles.length;i++){
    const b=bundles[i],B=await reconstruct(b.serialized,b.candidate,assessment,b.binding);
    const right=new Map(project(B).currentOceanScientificEvidence.map(x=>[x.path,x.value]));
    for(const {path,value} of project(b.A).currentOceanScientificEvidence)rows.push({scenario:scenarios[i][0],path,
      authority:path.startsWith('/candidateContext/')?'STATIC_GOVERNED_CONTEXT':path.startsWith('/assessment/')?'ASSESSMENT_CONTEXT':path.includes('/samples/')?'CURRENT_EXACT_CAPTURE_V2':'DERIVED_EXISTING_ASSEMBLER',
      classification:right.has(path)&&isDeepStrictEqual(value,right.get(path))?'EXACT_MATCH':'MISMATCH'});
  }
  assert(rows.every(x=>x.classification==='EXACT_MATCH'));
  const p=project(await independentSnapshot(bundles[1]));
  const producer=project(snapshotView(bundles[1].normalized[0].point,bundles[1].current));
  const replayLeaves=new Map(p.currentOceanScientificEvidence.map(x=>[x.path,x.value]));
  const snapshotScientificMatrix=producer.currentOceanScientificEvidence.map(({path,value})=>({path,
    authority:'DERIVED_EXISTING_ASSEMBLER',sourceChain:'CURRENT_EXACT_CAPTURE_V2 -> SST assembly -> feature observation -> snapshot',
    classification:replayLeaves.has(path)&&isDeepStrictEqual(value,replayLeaves.get(path))?'EXACT_MATCH':'MISMATCH'}));
  assert(snapshotScientificMatrix.every(x=>x.classification==='EXACT_MATCH'));
  const unresolved=p.unresolved.filter(x=>x.path.startsWith(aliasPrefix));
  const result={verdict:'SEMANTIC_PROJECTION_SHAPE_REVIEW_REQUIRED',scope:'ROOT_SST_AND_EMITTED_SNAPSHOT_SST_SUBTREE_ONLY',
    baseline:'e4c253fa4d9736980ec39d293ebf7c5c5f81463d',comparisonContract:'pelora-candidate-semantic-projection-v2',
    sourceContract:'pelora-governed-current-evidence-capture-v2',
    producers:['getSeaSurfaceTemperaturePoint','getSstSpatialStructureAtAssessment','getOceanConditionsAtAssessment SST assembly block',
      'buildGovernedEnvironmentalFeatureObservationV1','buildObservationSnapshot'],
    rootScenarios:scenarios.map(x=>x[0]),scientificMatrix:rows,snapshotScientificMatrix,
    snapshotCoverage:producer.coverage,blockingConcretePaths:unresolved.map(x=>x.path),
    blockingPatterns:[...new Set(unresolved.map(x=>x.path.replace(/\/samples\/\d+\//g,'/samples/*/')))].sort(),
    otherSubtreeUnresolved:p.unresolved.filter(x=>!x.path.startsWith(aliasPrefix)),
    totalDemonstratedUnresolved:p.unresolved.length,
    limitations:['No complete three-capture candidate composition claimed','No new environmental measurement gap demonstrated',
      'No capture authority conflict demonstrated','No semantic authority reclassification performed',
      'Other complete candidate scenarios not qualified after STOP','UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED'],
    completeCandidateReconstruction:false,remainingScientificSurface:'NOT_QUALIFIED_AFTER_STOP'};
  if(process.env.PELORA_BOUNDARY_REPORT)writeFileSync(process.env.PELORA_BOUNDARY_REPORT,JSON.stringify(result,null,2)+'\n');
});
