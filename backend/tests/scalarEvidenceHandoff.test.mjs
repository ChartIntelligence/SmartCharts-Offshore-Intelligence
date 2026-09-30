import test from 'node:test';
import assert from 'node:assert/strict';
import {bindCenterSstSpatial, captureBoundCenterSst, captureLiveChlorophyll, registerScalarPublication,
  encodeScalarHandoff, decodeScalarHandoff} from '../scalarEvidenceHandoff.mjs';
import {encodeNormalizedOceanResponse,decodeNormalizedOceanSnapshot} from '../normalizedEvidenceCapture.mjs';
import {SOURCE_NORMALIZATION_VERSION as version,SOURCE_NORMALIZATION_REFERENCE as provenance} from '../sourceNormalization.mjs';
import {readCurrentEvidenceCaptureV2 as read} from '../currentEvidenceCaptureV2.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
import {captureFixture,ref} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {runScenario,scenarios} from './fixtures/transitiveProducerBoundaryFixture.mjs';
import {createPeloraServer,buildOceanMemoryStorageRecordFromRow,buildOceanMemoryStorage} from '../server.js';
import {buildOceanSnapshotStorageRow} from '../../frontend/src/lib/oceanMemoryStorageContract.js';

const refs=[provenance];
function point() { const p=captureFixture().samples[0].point;delete p.source.availability;return p; }
async function bound(p=point(),state=true) {
  const spatial=await bindCenterSstSpatial(p,version,async f=>({thresholdVersion:'pelora-sst-spatial-range-v1',centerTemperatureAvailable:state,samples:[]}));
  p.derived={spatialStructure:spatial};return {p,spatial};
}
const capture=({p,spatial},r=refs)=>captureBoundCenterSst(p,spatial,r);

for(const mode of ['changing','throw-on-second','mutate-backing','positive-zero','negative-zero']) {
  test('single-read center handoff: '+mode,async()=>{
    const assembled=point();
    const expected=mode==='positive-zero'?0:mode==='negative-zero'?-0:78.8;
    assembled.temperatureFahrenheit=expected;
    const source={...assembled};let reads=0,backing=expected,spatialInput;
    Object.defineProperty(source,'temperatureFahrenheit',{enumerable:true,get(){
      reads++;
      if(reads>1&&mode==='throw-on-second')throw Error('Forbidden second read');
      return reads===1?backing:80.6;
    }});
    const spatial=await bindCenterSstSpatial(source,version,async retained=>{
      spatialInput=retained;if(mode==='mutate-backing')backing=99;
      return {thresholdVersion:'pelora-sst-spatial-range-v1',centerTemperatureAvailable:Number.isFinite(retained),samples:[]};
    });
    assembled.derived={spatialStructure:spatial};
    const e=captureBoundCenterSst(assembled,spatial,refs);
    const captured=read(e.captureText).samples[0].point;
    assert.equal(reads,1);assert(Object.is(spatialInput,expected));
    assert(Object.is(captured.temperatureFahrenheit,expected));
    assert.equal(captured.source.availability,'available');
    assert(Object.is(decodeScalarHandoff(JSON.parse(JSON.stringify(e)),'SST').temperatureFahrenheit,expected));
    const reference=structuredClone(e.reference);backing=123;source.temperatureCelsius=99;
    assert.deepEqual(e.reference,reference);assert(Object.is(read(e.captureText).samples[0].point.temperatureFahrenheit,expected));
    assert.equal(reads,1);assert(Object.isFrozen(e));
  });
}
test('first Fahrenheit read failure rejects without retry or spatial invocation',async()=>{
  const source=point();let reads=0,spatialCalls=0;
  Object.defineProperty(source,'temperatureFahrenheit',{enumerable:true,get(){reads++;throw Error('Synthetic first-read failure');}});
  await assert.rejects(bindCenterSstSpatial(source,version,async()=>{spatialCalls++;return {};}),/Synthetic first-read failure/);
  assert.equal(reads,1);assert.equal(spatialCalls,0);
});

test('same-center true maps to v2 available; source absence and exact round-trip preserved',async()=>{
  const b=await bound(),e=capture(b);assert.equal(read(e.captureText).samples[0].point.source.availability,'available');
  assert(!Object.hasOwn(b.p.source,'availability'));assert.deepEqual(decodeScalarHandoff(JSON.parse(JSON.stringify(e)),'SST'),b.p);
  assert(Object.isFrozen(e.reference));assert(Object.isFrozen(decodeScalarHandoff(e,'SST').derived));
});
test('same-center false maps to unavailable and preserves null or permitted Celsius diagnostic',async()=>{
  for(const c of [null,10]) {const p=point();p.temperatureCelsius=c;p.temperatureFahrenheit=null;
    const b=await bound(p,false),e=capture(b),out=read(e.captureText).samples[0].point;
    assert.equal(out.source.availability,'unavailable');assert.equal(out.temperatureCelsius,c);assert.deepEqual(decodeScalarHandoff(e,'SST'),p);}
});
for(const state of [undefined,null,'true',1,{},[]]) test('non-Boolean refuses: '+String(state),async()=>{
  const p=point(),spatial=await bindCenterSstSpatial(p,version,async()=>({thresholdVersion:'pelora-sst-spatial-range-v1',centerTemperatureAvailable:state}));
  p.derived={spatialStructure:spatial};assert.throws(()=>capture({p,spatial}));
});
test('spatial omission refuses reference without changing ordinary publication',async()=>{
  const p=point();p.derived={spatialStructure:{thresholdVersion:'pelora-sst-spatial-range-v1'}};
  const obs={observations:{sst:p},lineage:{processingReferences:refs}};
  registerScalarPublication(obs,p.derived.spatialStructure);assert.equal(encodeScalarHandoff(p),p);
});
for(const value of [null,NaN,Infinity,'25']) test('true contradicts invalid C/F: '+String(value),async()=>{
  const p=point();p.temperatureCelsius=value;p.temperatureFahrenheit=value;
  const b=await bound(p,true);assert.throws(()=>capture(b));
});
test('false with finite Fahrenheit contradicts this producer; no preference heuristic',async()=>{
  const b=await bound(point(),false);assert.throws(()=>capture(b));
});
for(const [label,mutate] of [['value',p=>p.temperatureCelsius++],['coordinate',p=>p.requestedLatitude++],['time',p=>p.observedAt='other']]) {
  test('wrong center rejects '+label,async()=>{const b=await bound();b.p={...b.p};mutate(b.p);assert.throws(()=>capture(b));});
}
test('copied Boolean/spatial object from another point does not acquire a binding',async()=>{
  const b=await bound();b.spatial=structuredClone(b.spatial);b.p.derived.spatialStructure=b.spatial;assert.throws(()=>capture(b));
});
test('different bound center cannot substitute even when both Booleans are true',async()=>{
  const a=await bound(),p=point();p.temperatureCelsius=27;p.temperatureFahrenheit=80.6;const b=await bound(p);
  a.p.derived.spatialStructure=b.spatial;assert.throws(()=>captureBoundCenterSst(a.p,b.spatial,refs));
});
test('producer threshold mismatch refuses',async()=>{
  const p=point(),spatial=await bindCenterSstSpatial(p,version,async()=>({thresholdVersion:'other',centerTemperatureAvailable:true,samples:[]}));
  p.derived={spatialStructure:spatial};assert.throws(()=>capture({p,spatial}));
});
test('normalization missing, changed or duplicated is never defaulted',async()=>{
  const b=await bound();for(const r of [[],[{...provenance,contractVersion:'other'}],[provenance,provenance]])assert.throws(()=>capture(b,r));
});
test('additional recorded processing provenance is preserved and changes identity',async()=>{
  const b=await bound(),a=capture(b),lineage=[provenance,ref('additional-recorded-processing')],e=capture(b,lineage);
  assert.deepEqual(read(e.captureText).lineageReferences,lineage);assert.notDeepEqual(a.reference,e.reference);
  const snapshot={observation:{observations:{sst:e},lineage:{processingReferences:refs}}};
  assert.throws(()=>decodeNormalizedOceanSnapshot(snapshot));
  snapshot.observation.lineage.processingReferences=lineage;
  assert.deepEqual(decodeNormalizedOceanSnapshot(snapshot).observation.observations.sst,b.p);
});
test('positive and negative Celsius zero remain available and have distinct exact references',async()=>{
  const results=[];for(const z of [0,-0]) {const p=point();p.temperatureCelsius=z;p.temperatureFahrenheit=32;
    const e=capture(await bound(p));assert.equal(read(e.captureText).samples[0].point.source.availability,'available');
    assert(Object.is(decodeScalarHandoff(e,'SST').temperatureCelsius,z));results.push(e.reference);}
  assert.notDeepEqual(...results);
});
test('determinism, same-time revisions, and post-capture mutation',async()=>{
  const b=await bound(),e=capture(b);assert.deepEqual(capture(b),e);const old=e.captureText;
  b.p={...b.p,temperatureCelsius:27};assert.equal(e.captureText,old);assert.throws(()=>capture(b));
  b.p.temperatureFahrenheit=80.6;const other=capture(await bound(b.p));assert.notDeepEqual(other.reference,e.reference);
});
for(const family of ['CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED']) {
  test(family+' exact live shape captures, detaches, reconstructs, and distinguishes revisions',()=>{
    const p=captureFixture(family).samples[0].point;p.ageHours=24;
    const e=captureLiveChlorophyll(p,refs);assert.deepEqual(decodeScalarHandoff(JSON.parse(JSON.stringify(e)),family),p);
    assert.deepEqual(e,captureLiveChlorophyll(structuredClone(p),refs));p.concentrationMgM3=.2;
    assert.notDeepEqual(e.reference,captureLiveChlorophyll(p,refs).reference);assert.equal(read(e.captureText).samples[0].point.concentrationMgM3,.1);
    assert.throws(()=>captureLiveChlorophyll(p,[]));
  });
}
test('DIRECT and GAP_FILLED equal value/time/coordinates never collide; marker corruption refuses',()=>{
  const direct=captureFixture('CHLOROPHYLL_DIRECT').samples[0].point,gap=captureFixture('CHLOROPHYLL_GAP_FILLED').samples[0].point;
  assert.notDeepEqual(captureLiveChlorophyll(direct,refs).reference,captureLiveChlorophyll(gap,refs).reference);
  gap.source.algorithm='unqualified';assert.throws(()=>captureLiveChlorophyll(gap,refs));
});
test('historical missing provenance remains untouched and unreferenced',()=>{
  const p=point(),o={observations:{sst:p},lineage:{processingReferences:[]}};
  registerScalarPublication(o,{});assert.equal(encodeScalarHandoff(p),p);
  assert.deepEqual(decodeNormalizedOceanSnapshot({observation:o}),{observation:o});
});
test('live default cold/warm handoff produces references and restores all consumer payload bytes',async t=>{
  const results=[];
  for(let i=0;i<2;i++) {
    const {ocean,calls}=await runScenario(t,scenarios.find(s=>s.id==='finite-control'),{clock:Date.parse('2080-01-01T00:00:00Z')+i*1000});
    const before=exactJson(ocean),wire=encodeNormalizedOceanResponse(ocean,version);
    assert.equal(exactJson(ocean),before);
    for(const f of ['sst','chlorophyll']) {
      const a=wire.observationSnapshot.observations[f],b=wire.oceanSnapshot.observation.observations[f];
      assert.equal(typeof a.captureText,'string',f);assert.deepEqual(a.reference,b.reference);
    }
    const restored=decodeNormalizedOceanSnapshot(JSON.parse(JSON.stringify(wire.oceanSnapshot)));
    // Current-v3 has its established speedDerivationFailed field; compare scalar state and scientific outputs.
    for(const f of ['sst','chlorophyll']) assert.deepEqual(restored.observation.observations[f],ocean.observationSnapshot.observations[f]);
    assert.deepEqual(wire.oceanOpportunity,ocean.oceanOpportunity);assert.deepEqual(wire.dataQuality,ocean.dataQuality);
    results.push({ref:wire.observationSnapshot.observations.sst.reference,calls:calls.length});
  }
  assert.deepEqual(results[0].ref,results[1].ref);assert(results[1].calls<results[0].calls);
});

test('actual default GAP_FILLED selection traverses HTTP, browser row, and backend reconstruction',async t=>{
  const adapter={mock:{method(object,key,implementation){
    if(object!==globalThis||key!=='fetch') return t.mock.method(object,key,implementation);
    return t.mock.method(object,key,async raw=>{
      const response=await implementation(raw);
      if(!String(raw).includes('noaacwNPPVIIRSchlaDaily'))return response;
      return {...response,json:async()=>{const body=await response.json();body.table.rows=[];return body;}};
    });
  }}};
  const {ocean}=await runScenario(adapter,scenarios.find(s=>s.id==='finite-control'),{clock:Date.parse('2081-01-01T00:00:00Z')});
  assert.equal(ocean.observationSnapshot.observations.chlorophyll.source.classification,'satellite-derived-reconstruction');
  const server=createPeloraServer({oceanConditionsProvider:async()=>ocean,persistenceConfigurationProvider:()=>({available:false})});
  const response=await new Promise(resolve=>server.emit('request',{method:'GET',url:'/api/ocean?lat=25&lon=-90',headers:{host:'test.invalid'}},
    {writeHead(status){this.status=status;},end(text){resolve({status:this.status,body:JSON.parse(text)});}}));
  assert.equal(response.status,200);const wire=response.body.oceanSnapshot;
  const row=buildOceanSnapshotStorageRow({userId:'synthetic-owner',oceanSnapshot:wire});
  assert.deepEqual(buildOceanMemoryStorage({oceanSnapshot:wire,storedAt:'2026-09-24T02:00:00Z'}).snapshot,wire);
  const replay=buildOceanMemoryStorageRecordFromRow({row:{...row,created_at:'2026-09-24T02:00:00Z'}});
  assert.equal(replay.available,true);
  for(const f of ['sst','chlorophyll']) assert.deepEqual(replay.snapshot.observation.observations[f],ocean.observationSnapshot.observations[f]);
  assert.equal(read(wire.observation.observations.chlorophyll.captureText).family,'CHLOROPHYLL_GAP_FILLED');
});

test('scalar transport rejects tampering, wrong family and accessor input',async()=>{
  const e=capture(await bound());
  for(const field of ['captureText','contextText','sha256']) {
    const bad=structuredClone(e);bad[field]+=' ';assert.throws(()=>decodeScalarHandoff(bad,'SST'));
  }
  assert.throws(()=>decodeScalarHandoff(e,'CHLOROPHYLL_DIRECT'));
  let calls=0;const bad={...e};Object.defineProperty(bad,'captureText',{enumerable:true,get(){calls++;return e.captureText;}});
  assert.throws(()=>decodeScalarHandoff(bad,'SST'));assert.equal(calls,0);
});

test('v2 independently refuses true with valid Fahrenheit but null Celsius',async()=>{
  const p=point();p.temperatureCelsius=null;assert.throws(()=>captureBoundCenterSst(p,{},refs));
  const b=await bound(p,true);assert.throws(()=>capture(b));
});
for(const [index,value] of [0,-0,null].entries()) test('actual live center through JSON preserves '+(Object.is(value,-0)?'-0':String(value)),async t=>{
  const adapter={mock:{method(object,key,implementation){
    if(object!==globalThis||key!=='fetch') return t.mock.method(object,key,implementation);
    return t.mock.method(object,key,async raw=>{
      const response=await implementation(raw),u=new URL(raw);
      if(u.hostname!=='marine-api.open-meteo.com'||u.searchParams.get('current')==='sea_surface_temperature')return response;
      return {...response,json:async()=>{const body=await response.json();body.current.sea_surface_temperature=value;return body;}};
    });
  }}};
  const {ocean}=await runScenario(adapter,scenarios.find(s=>s.id==='finite-control'),{clock:Date.parse('2082-01-01T00:00:00Z')+index*86400000});
  const wire=encodeNormalizedOceanResponse(ocean,version).oceanSnapshot;
  const envelope=wire.observation.observations.sst;
  assert.equal(read(envelope.captureText).samples[0].point.source.availability,value===null?'unavailable':'available');
  const replay=decodeNormalizedOceanSnapshot(JSON.parse(JSON.stringify(wire)));
  assert(Object.is(replay.observation.observations.sst.temperatureCelsius,value));
  assert.equal(ocean.oceanEvidence.groups.temperature.available,true); // Neighbor state does not supply center availability.
});
