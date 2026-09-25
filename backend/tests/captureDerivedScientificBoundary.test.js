// Offline reconstruction diagnostic. Extracts unchanged private assembler bodies;
// no production integration, alternative scientific algorithm or species evaluator.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {getSeaSurfaceTemperaturePoint,getSstSpatialStructure,assessSstTransitionConfidence,
  buildUnifiedOpportunityCandidateSourceUniverseV1,resolveOpportunityCandidateBathymetryV1} from '../server.js';
import {resolveScientificAssessmentV1,requireScientificAssessmentV1} from '../scientificAssessment.mjs';
import {captureCurrentEvidenceV1,serializeCurrentEvidenceCaptureV1,readCurrentEvidenceCaptureV1,replayCurrentEvidenceSourceV1} from '../currentEvidenceCapture.mjs';
import {projectCandidateSemanticSurfacesV2 as project,compareCandidateScientificSurfacesV2 as compare} from '../candidateSemanticProjectionV2.mjs';
import {copy,freeze} from '../../shared/oceanPublication.mjs';
import {ref} from './fixtures/currentEvidenceCaptureFixture.mjs';

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
    const captured=captureCurrentEvidenceV1({family:'SST',sourceAuthority:{status:'SYNTHETIC_FIXTURE',reference:ref('synthetic-'+c.id)},
      samples:normalized,lineageReferences:[ref('synthetic-current-parser')]});
    const serialized=serializeCurrentEvidenceCaptureV1(captured);
    const current=await getSstSpatialStructure(...c.coordinates,normalized[0].point.temperatureFahrenheit,assessment);
    return {candidate:c,binding:freeze({candidate:context(c),assessment:requireScientificAssessmentV1(assessment),captureId:captured.captureId}),
      captured,serialized,normalized,current,A:wrap(current,c,assessment)};
  }finally{fetch.mock.restore();}
}
async function reconstruct(serialized,c,a,binding){
  const exact=copy(c),governed=catalog.find(x=>x.id===exact.id);
  assert(governed,'Exact governed candidate identity required');
  assert.deepEqual(context(exact),context(governed),'Candidate/static substitution');
  assert.deepEqual(context(exact),binding.candidate,'Wrong bound candidate');
  const at=requireScientificAssessmentV1(a);assert.deepEqual(at,binding.assessment,'Wrong assessment');
  const capture=readCurrentEvidenceCaptureV1(serialized);
  assert.equal(capture.captureId,binding.captureId,'Wrong capture reference');
  const replay=replayCurrentEvidenceSourceV1(capture);
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
for(let i=0;i<10;i++)test('independent capture-derived SST producer comparison: '+scenarios[i][0],async()=>{
  const b=bundles[i],B=await reconstruct(b.serialized,b.candidate,assessment,b.binding);
  assert.equal(compare(b.A,B).classification,'EXACT_MATCH');
  assert.notEqual(b.A.sst.derived.spatialStructure,B.sst.derived.spatialStructure);
});
test('literal transport negative zero demonstrates serialization mismatch, not a spatial formula difference',async()=>{
  const b=bundles[10],B=await reconstruct(b.serialized,b.candidate,assessment,b.binding);
  assert(Object.is(b.normalized[1].point.temperatureCelsius,-0));
  assert(Object.is(b.captured.samples[1].point.temperatureCelsius,-0));
  assert(Object.is(b.A.sst.derived.spatialStructure.samples[0].temperatureCelsius,-0));
  assert(Object.is(B.sst.derived.spatialStructure.samples[0].temperatureCelsius,0));
  assert(!Object.is(B.sst.derived.spatialStructure.samples[0].temperatureCelsius,-0));
  const compared=compare(b.A,B);assert.equal(compared.classification,'MISMATCH');
  assert.deepEqual(compared.differences.map(x=>x.path),['/sst/derived/spatialStructure/samples/0/temperatureCelsius']);
});
test('capture content identity cannot distinguish this signed-zero source change under its locked canonicalization',()=>{
  const b=bundles[10],input=copy(b.captured);
  input.samples[1].point.temperatureCelsius=0;
  const positive=captureCurrentEvidenceV1({family:input.family,sourceAuthority:input.sourceAuthority,samples:input.samples,lineageReferences:input.lineageReferences});
  assert.equal(positive.captureId,b.captured.captureId);
  assert.equal(positive.scientificContentDigest,b.captured.scientificContentDigest);
  assert.equal(serializeCurrentEvidenceCaptureV1(positive),b.serialized);
});
test('removing all Path A derived objects cannot affect replay; no network or implicit clock required',async t=>{
  const b=copy(bundles[0]);delete b.current;delete b.A;delete b.normalized;delete b.captured;
  t.mock.method(globalThis,'fetch',()=>{throw Error('network forbidden');});
  t.mock.method(Date,'now',()=>{throw Error('clock forbidden');});
  const B=await reconstruct(b.serialized,b.candidate,assessment,b.binding);
  assert.equal(compare(bundles[0].A,B).classification,'EXACT_MATCH');
});
test('candidate identity, exact coordinates, static source and assessment substitution are rejected in controlled binding',async()=>{
  const b=bundles[0];
  for(const change of [
    c=>c.id='unknown',c=>c.id=catalog[1].id,c=>c.coordinates[0]+=0.00001,c=>c.coordinates[1]+=0.00001,
    c=>{delete c.id;c.name=b.candidate.name;},c=>{delete c.id;c.rank=1;},
    c=>c.waterMask.elevationMeters-=1
  ]){
    const c=copy(b.candidate);change(c);await assert.rejects(reconstruct(b.serialized,c,assessment,b.binding));
  }
  await assert.rejects(reconstruct(b.serialized,b.candidate,{...assessment,assessmentAt:'2026-09-24T02:00:00Z'},b.binding));
  await assert.rejects(reconstruct(bundles[1].serialized,b.candidate,assessment,b.binding));
});
test('reconstructed root surface is detached immutable and source mutations cannot change it',async()=>{
  const b=copy(bundles[0]),B=await reconstruct(b.serialized,b.candidate,assessment,b.binding),before=JSON.stringify(B);
  b.candidate.coordinates[0]=0;b.captured.samples[0].point.temperatureCelsius=null;b.binding.assessment.assessmentAt='changed';
  assert.equal(JSON.stringify(B),before);
  assert(Object.isFrozen(B.sst.derived.spatialStructure.samples[0].source));
  assert.throws(()=>{B.sst.derived.spatialStructure.rangeFahrenheit=0;},TypeError);
});
test('scientific fields cannot be demoted deleted or hidden by shape validity',async()=>{
  const b=bundles[0],B=copy(await reconstruct(b.serialized,b.candidate,assessment,b.binding));
  for(const change of [
    x=>delete x.sst.derived.spatialStructure.rangeFahrenheit,
    x=>x.sst.derived.spatialStructure.unknownScience=1,
    x=>x.sst.derived.spatialStructure.rangeFahrenheit=null,
    x=>x.sst.derived.spatialStructure.samples[0].source.provider='captain_id.private'
  ]){
    const x=copy(B);change(x);assert.throws(()=>compare(b.A,x));
  }
  B.sst.derived.spatialStructure.rangeFahrenheit+=1;
  assert.equal(compare(b.A,B).classification,'MISMATCH');
});
test('emit concrete scientific field matrix for all independently reconstructed root scenarios',async()=>{
  const rows=[];
  for(let i=0;i<bundles.length;i++){
    const b=bundles[i],B=await reconstruct(b.serialized,b.candidate,assessment,b.binding),left=project(b.A),right=project(B);
    assert(left.complete&&right.complete);
    const r=new Map(right.currentOceanScientificEvidence.map(x=>[x.path,x.value]));
    for(const {path,value} of left.currentOceanScientificEvidence){
      const classification=r.has(path)&&isDeepStrictEqual(value,r.get(path))?'EXACT_MATCH':'MISMATCH';
      const authority=path.startsWith('/candidateContext/')?'STATIC_GOVERNED_CONTEXT':path.startsWith('/assessment/')?'ASSESSMENT_CONTEXT':path.includes('/samples/')?'CURRENT_CAPTURE':'DERIVED_FROM_EXISTING_ASSEMBLER';
      rows.push({scenario:scenarios[i][0],path,authority,classification});
    }
  }
  console.log('SCIENTIFIC_RECONSTRUCTION_MATRIX='+JSON.stringify(rows));
});
