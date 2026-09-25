import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getSstSpatialStructure} from '../server.js';
import {captureCurrentEvidenceV1,replayCurrentEvidenceSourceV1,serializeCurrentEvidenceCaptureV1,readCurrentEvidenceCaptureV1} from '../currentEvidenceCapture.mjs';
import {compareCandidateScientificSurfacesV1 as compare,projectCandidateSemanticSurfacesV1 as project} from '../candidateSemanticProjection.mjs';
import {ref} from './fixtures/currentEvidenceCaptureFixture.mjs';

const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'};
const wrap=spatialStructure=>({sst:{derived:{spatialStructure}}});
async function currentSpatial(t,latitude,values,center=null){
  let calls=0;
  const mock=t.mock.method(globalThis,'fetch',async url=>{
    assert.equal(new URL(url).hostname,'marine-api.open-meteo.com');
    const value=values[calls++%values.length];
    return {ok:true,json:async()=>({latitude,longitude:-91,current:{time:'2026-09-24T00:00:00Z',sea_surface_temperature:value}})};
  });
  try{
    const spatial=await getSstSpatialStructure(latitude,-91,center,assessment);
    assert.equal(calls,4);
    return spatial;
  }finally{mock.mock.restore();}
}
function capture(spatial){
  return captureCurrentEvidenceV1({family:'SST',sourceAuthority:{status:'SYNTHETIC_FIXTURE',reference:ref('synthetic-spatial-source')},
    samples:spatial.samples.map(({direction,cache,...point})=>({role:direction,outcome:'FULFILLED',point})),
    lineageReferences:[ref('synthetic-spatial-parser')]});
}
let missing,partial,complete;
test.before(async t=>{
  missing=await currentSpatial(t,26,[null,null,null,null]);
  partial=await currentSpatial(t,27,[25,null,null,null],78.8);
  complete=await currentSpatial(t,28,[25,26,27,28],78.8);
});
test('actual current parser and unchanged SST assembler produce legitimate missing spatial evidence',()=>{
  assert.equal(missing.coverage,'insufficient');
  assert.equal(missing.rangeFahrenheit,null);
  assert.equal(missing.minimumFahrenheit,null);
  assert.equal(missing.validNeighborCount,0);
  assert(missing.samples.every(s=>s.temperatureCelsius===null&&s.temperatureFahrenheit===null&&s.source.availability==='unavailable'));
});
test('locked capture preserves every missing normalized directional point without another source contract',()=>{
  const c=capture(missing),r=replayCurrentEvidenceSourceV1(readCurrentEvidenceCaptureV1(serializeCurrentEvidenceCaptureV1(c)));
  assert.deepEqual(r.samples,missing.samples.map(({direction,cache,...point})=>({role:direction,outcome:'FULFILLED',point})));
});
test('locked projection rejects current producer null shapes rather than silently granting equivalence',()=>{
  const p=project(wrap(missing));
  assert.equal(p.complete,false);
  assert.equal(p.unresolved.length,22);
  assert(p.unresolved.every(x=>x.value===null));
  assert.throws(()=>compare(wrap(missing),wrap(missing)),/SEMANTIC_AUTHORITY_UNRESOLVED/);
});
test('exact affected registry patterns are recorded and remain scientifically classified',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../../docs/Candidate_Semantic_Surfaces_v1.json',import.meta.url),'utf8'));
  const map=JSON.parse(readFileSync(new URL('../../docs/Current_Scientific_Reconstruction_Boundary_v1.json',import.meta.url),'utf8'));
  const paths=[...new Set(project(wrap(missing)).unresolved.map(x=>x.path.replace(/\/samples\/\d+\//g,'/samples/*/')))].sort();
  assert.equal(paths.length,16);
  assert.deepEqual(paths,map.blockingRegistryPaths.map(x=>x.path).sort());
  for(const path of paths){
    const row=manifest.reviewedPaths.find(x=>x[0]===path);
    assert.equal(row[1],'currentOceanScientificEvidence');assert(!row[3].includes('null'));
  }
});
test('partial current spatial coverage reproduces the same blocking shape class',()=>{
  assert.equal(partial.validNeighborCount,1);assert.equal(partial.coverage,'insufficient');
  assert.equal(partial.rangeFahrenheit,null);
  assert(project(wrap(partial)).unresolved.some(x=>x.path.endsWith('/rangeFahrenheit')));
  assert.throws(()=>compare(wrap(partial),wrap(partial)),/SEMANTIC_AUTHORITY_UNRESOLVED/);
});
test('populated current spatial fixture remains within the previous reviewed boundary',()=>{
  assert.equal(complete.coverage,'sufficient');
  assert.equal(project(wrap(complete)).complete,true);
  assert.equal(compare(wrap(complete),wrap(complete)).classification,'EXACT_MATCH');
});
test('capture replay of missing points is detached and needs neither network nor execution clock',t=>{
  const raw=capture(missing),serialized=serializeCurrentEvidenceCaptureV1(raw);
  t.mock.method(globalThis,'fetch',()=>{throw Error('network forbidden');});
  t.mock.method(Date,'now',()=>{throw Error('clock forbidden');});
  const replay=replayCurrentEvidenceSourceV1(readCurrentEvidenceCaptureV1(serialized));
  assert.deepEqual(replay.samples,raw.samples);assert(Object.isFrozen(replay.samples[0].point.source));
  assert.throws(()=>{replay.samples[0].point.temperatureCelsius=0;},TypeError);
});
test('no null-to-zero repair or additional coercion is used to bypass the stop',()=>{
  const original=capture(missing),changed=structuredClone(missing);
  changed.samples[0].temperatureCelsius=0;changed.samples[0].temperatureFahrenheit=32;
  const zero=capture(changed);
  assert.notEqual(original.captureId,zero.captureId);
  assert.equal(replayCurrentEvidenceSourceV1(original).samples[0].point.temperatureCelsius,null);
  assert.equal(replayCurrentEvidenceSourceV1(zero).samples[0].point.temperatureCelsius,0);
});
test('locked guard still detects changed spatial values and signed zero in reviewed shapes',()=>{
  const changed=structuredClone(complete);changed.rangeFahrenheit+=1;
  assert.equal(compare(wrap(complete),wrap(changed)).classification,'MISMATCH');
  assert.equal(compare({currents:{northwardMetersPerSecond:-0}},{currents:{northwardMetersPerSecond:0}}).classification,'MISMATCH');
});
test('stop inventory does not claim a complete dependency audit or candidate reconstruction',()=>{
  const map=JSON.parse(readFileSync(new URL('../../docs/Current_Scientific_Reconstruction_Boundary_v1.json',import.meta.url),'utf8'));
  const manifest=JSON.parse(readFileSync(new URL('../../docs/Candidate_Semantic_Surfaces_v1.json',import.meta.url),'utf8'));
  assert.equal(map.verdict,'SEMANTIC_PROJECTION_SHAPE_REVIEW_REQUIRED');
  assert.equal(map.completeReconstruction,false);
  assert.deepEqual(map.scientificPathAudit.map(x=>x.path),manifest.reviewedPaths.filter(x=>x[1]==='currentOceanScientificEvidence').map(x=>x[0]));
  assert(map.scientificPathAudit.every(x=>['DERIVED_EXISTING_ASSEMBLER','CURRENT_CAPTURE','UNRESOLVED'].includes(x.authority)));
});
