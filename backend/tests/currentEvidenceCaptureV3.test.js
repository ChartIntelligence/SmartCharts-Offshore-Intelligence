import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as v3 from '../currentEvidenceCaptureV3.mjs';
import * as v2 from '../currentEvidenceCaptureV2.mjs';
import * as v1 from '../currentEvidenceCapture.mjs';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {SOURCE_NORMALIZATION_REFERENCE} from '../sourceNormalization.mjs';
import {readVersionedCurrentEvidence} from '../normalizedEvidenceCapture.mjs';
import {captureNormalizedCurrentConditions,buildCurrentVectorProjectionAnalysis,buildObservationSnapshot,
  buildSnapshotMetadata,buildOceanSnapshot,buildOceanMemoryStorage} from '../server.js';
import {assessment} from './fixtures/sourceNormalizationFixture.mjs';
const input=()=>{const x=captureFixture('CURRENTS');x.samples[0].point.speedDerivationFailed=false;return x;};
const partial=()=>{const x=input();Object.assign(x.samples[0].point,{eastwardMetersPerSecond:1e200,northwardMetersPerSecond:1,speedKnots:null,speedDerivationFailed:true});return x;};

test('v3 full and partial vectors have distinct bound semantics and exact reconstruction',()=>{
  for(const x of [input(),partial()]){
    const c=v3.captureCurrentEvidenceV3(x),wire=v3.serializeCurrentEvidenceCaptureV3(c);
    const replay=v3.replayCurrentEvidenceSourceV3(readVersionedCurrentEvidence(wire));
    assert.deepEqual(replay.samples,x.samples);assert(Object.isFrozen(c.samples[0].point));
    assert.deepEqual(v3.validateCurrentCaptureReferenceV3(v3.currentCaptureReferenceV3(c),c),v3.currentCaptureReferenceV3(c));
    x.samples[0].point.eastwardMetersPerSecond=7;assert.notEqual(c.samples[0].point.eastwardMetersPerSecond,7);
    assert.throws(()=>v2.validateCurrentEvidenceCaptureV2(c));
  }
});

test('v3 absent and single-component sources remain unavailable, never complete vectors',()=>{
  for(const u of [null,1]){
    const x=input(),p=x.samples[0].point;Object.assign(p,{eastwardMetersPerSecond:u,northwardMetersPerSecond:null,speedKnots:null,directionDegrees:null});p.source.availability='no-valid-pixel';
    const replay=v3.replayCurrentEvidenceSourceV3(v3.captureCurrentEvidenceV3(x));
    assert.equal(replay.samples[0].point.speedKnots,null);assert.equal(replay.samples[0].point.speedDerivationFailed,false);
    const projection=buildCurrentVectorProjectionAnalysis({vectors:[{direction:'north',...replay.samples[0].point}]});
    assert.equal(projection.available,false);
    p.speedKnots=1;assert.throws(()=>v3.captureCurrentEvidenceV3(x));p.speedKnots=null;
    p.directionDegrees=90;assert.throws(()=>v3.captureCurrentEvidenceV3(x));p.directionDegrees=null;
    p.source.availability='available';assert.throws(()=>v3.captureCurrentEvidenceV3(x));
  }
});

test('v3 rejects untruthful failure claims and all nonfinite source representations',()=>{
  for(const n of [NaN,Infinity,-Infinity])for(const field of ['speedKnots','directionDegrees','eastwardMetersPerSecond','northwardMetersPerSecond']){
    const x=input();x.samples[0].point[field]=n;assert.throws(()=>v3.captureCurrentEvidenceV3(x));
  }
  const mutations=[p=>{p.speedKnots=0;},p=>{p.eastwardMetersPerSecond=null;},p=>{p.northwardMetersPerSecond=null;},p=>{p.directionDegrees=null;},p=>{p.source.availability='unavailable';},p=>{p.speedDerivationFailed=false;},p=>{delete p.speedDerivationFailed;}];
  for(const change of mutations){const x=partial();change(x.samples[0].point);assert.throws(()=>v3.captureCurrentEvidenceV3(x));}
});

test('v3 signed zero, no null-to-zero repair, immutable references and exact wire integrity',()=>{
  const x=input();Object.assign(x.samples[0].point,{eastwardMetersPerSecond:-0,northwardMetersPerSecond:0,speedKnots:0});
  const c=v3.captureCurrentEvidenceV3(x),wire=v3.serializeCurrentEvidenceCaptureV3(c);
  const out=v3.readCurrentEvidenceCaptureV3(wire);assert(Object.is(out.samples[0].point.eastwardMetersPerSecond,-0));
  assert(!Object.is(out.samples[0].point.northwardMetersPerSecond,-0));assert.throws(()=>v3.readCurrentEvidenceCaptureV3(wire+' '));
  const p=v3.captureCurrentEvidenceV3(partial());assert.equal(v3.replayCurrentEvidenceSourceV3(p).samples[0].point.speedKnots,null);
  const changed=structuredClone(p);changed.samples[0].point.speedDerivationFailed=false;assert.throws(()=>v3.validateCurrentEvidenceCaptureV3(changed));
  assert.throws(()=>v3.validateCurrentCaptureReferenceV3(v3.currentCaptureReferenceV3(c),p));
});

test('v3 refuses accessors, inherited input, unknown fields and cyclic input before copying',()=>{
  assert.throws(()=>v3.captureCurrentEvidenceV3(captureFixture('SST')));
  let calls=0;const x=input();Object.defineProperty(x.samples[0].point,'speedKnots',{enumerable:true,get(){calls++;return 1;}});
  assert.throws(()=>v3.captureCurrentEvidenceV3(x));assert.equal(calls,0);
  assert.throws(()=>v3.captureCurrentEvidenceV3(Object.create(input())));
  const y=input();y.samples[0].point.extra=true;assert.throws(()=>v3.captureCurrentEvidenceV3(y));
  const z=input();z.samples.push(z);assert.throws(()=>v3.captureCurrentEvidenceV3(z));
});

test('live current acquisition captures partial values and processing lineage at the real boundary',async t=>{
  const fetch=t.mock.method(globalThis,'fetch',async url=>{
    assert.equal(new URL(url).hostname,'coastwatch.noaa.gov');
    return {ok:true,json:async()=>({table:{columnNames:['time','latitude','longitude','u_current','v_current'],rows:[['2026-09-24T00:00:00Z',25,-90,1e200,1]]}})};
  });
  try{
    const c=await captureNormalizedCurrentConditions(25,-90,assessment,{sourceAuthority:captureFixture('CURRENTS').sourceAuthority});
    const replay=v3.replayCurrentEvidenceSourceV3(readVersionedCurrentEvidence(v3.serializeCurrentEvidenceCaptureV3(c)));
    assert.equal(replay.samples[0].point.speedDerivationFailed,true);assert.equal(replay.samples[0].point.speedKnots,null);
    assert.deepEqual(replay.lineageReferences,[SOURCE_NORMALIZATION_REFERENCE]);
    const projections=buildCurrentVectorProjectionAnalysis({vectors:[{direction:'north',...replay.samples[0].point}]});
    assert.equal(projections.projections[0].available,true);assert.equal(projections.available,false);
  }finally{fetch.mock.restore();}
});

test('historical v1/v2 readers never default missing processing version to v1',()=>{
  for(const api of [v1,v2]){
    const suffix=api===v1?'V1':'V2',c=api['captureCurrentEvidence'+suffix](captureFixture('CURRENTS'));
    const out=readVersionedCurrentEvidence(api['serializeCurrentEvidenceCapture'+suffix](c));
    assert(!out.lineageReferences.some(r=>r.referenceId===SOURCE_NORMALIZATION_REFERENCE.referenceId));
  }
  assert.throws(()=>readVersionedCurrentEvidence('{}'));
  assert.throws(()=>readVersionedCurrentEvidence({toString(){throw Error('must not coerce');}}),/wire text/);
});

test('live snapshot lineage carries processing provenance through metadata and storage; historical default absent',()=>{
  const args={location:{latitude:25,longitude:-90},observedAt:'2026-09-24T00:00:00Z',generatedAt:'2026-09-24T01:00:00Z',oceanEvidence:{groups:{}}};
  const old=buildObservationSnapshot(args);assert(!Object.hasOwn(old.lineage,'processingReferences'));
  const now=buildObservationSnapshot({...args,processingReferences:[SOURCE_NORMALIZATION_REFERENCE]});
  assert.deepEqual(now.lineage.processingReferences,[SOURCE_NORMALIZATION_REFERENCE]);
  const metadata=buildSnapshotMetadata({observationSnapshot:now});
  assert.deepEqual(metadata.lineageReferences.observationSnapshot.processingReferences,[SOURCE_NORMALIZATION_REFERENCE]);
  const snapshot=buildOceanSnapshot({snapshotMetadata:metadata,observationSnapshot:now});
  const storage=buildOceanMemoryStorage({oceanSnapshot:snapshot,storedAt:'2026-09-24T02:00:00Z'});
  assert(JSON.stringify(storage).includes(SOURCE_NORMALIZATION_REFERENCE.sha256));
  const source=readFileSync(new URL('../server.js',import.meta.url),'utf8');
  assert(source.includes('const observationSnapshot =\n  buildObservationSnapshot({\n    processingReferences: [SOURCE_NORMALIZATION_REFERENCE],'));
});
import {SOURCE_NORMALIZATION_VERSION} from '../sourceNormalization.mjs';
import {encodeNormalizedCurrentHandoff,decodeNormalizedCurrentHandoff,encodeNormalizedOceanResponse,
  captureNewNormalizedCurrentPoint,NORMALIZED_CURRENT_HANDOFF_V1} from '../normalizedEvidenceCapture.mjs';
import {getCurrentConditionsPoint,createPeloraServer,buildOceanMemoryStorageRecordFromRow,
  buildCurrentGradientAnalysis,buildCurrentShearAnalysis,buildCurrentEdgeAnalysis,buildCurrentConvergenceAnalysis} from '../server.js';
import {runCurrent} from './fixtures/currentVectorDerivedFinitenessFixture.mjs';
import {buildOceanSnapshotStorageRow} from '../../frontend/src/lib/oceanMemoryStorageContract.js';
const transport=x=>JSON.parse(JSON.stringify(x));
function snapshots(currents){
  const observationSnapshot=buildObservationSnapshot({location:{latitude:25,longitude:-90},observedAt:'2026-09-24T00:00:00Z',
    generatedAt:'2026-09-24T01:00:00Z',oceanEvidence:{groups:{}},observations:{currents},processingReferences:[SOURCE_NORMALIZATION_REFERENCE]});
  const snapshotMetadata=buildSnapshotMetadata({observationSnapshot});
  return {observationSnapshot,oceanSnapshot:buildOceanSnapshot({snapshotMetadata,observationSnapshot})};
}
function rowFor(snapshot){return {snapshot_id:snapshot.identity.snapshotId,user_id:'synthetic-owner',
  observed_at:snapshot.metadata.time.observedAt,created_at:'2026-09-24T02:00:00Z',snapshot_schema_version:snapshot.identity.snapshotSchemaVersion,
  snapshot_contract_version:snapshot.contractVersion,snapshot_payload:snapshot};}
function dispatch(server){return new Promise(resolve=>server.emit('request',{method:'GET',url:'/api/ocean?lat=25&lon=-90',headers:{host:'test.invalid'}},
  {writeHead(status){this.status=status;},end(text){resolve({status:this.status,body:JSON.parse(text)});}}));}

test('actual normalization to HTTP wire to storage row to consumer preserves signed zero and partial/diagnostic states',async t=>{
  for(const values of [[-0,0],[0,-0],[1e200,1],[1,null]]){
    const acquired=await runCurrent(t,{all:values});
    const point={...acquired.point,derived:{spatialAnalysis:{spatialStructure:acquired.spatial}}};
    const payload=snapshots(point);
    assert.equal(payload.oceanSnapshot.available,true);
    const server=createPeloraServer({oceanConditionsProvider:async()=>payload,
      persistenceConfigurationProvider:()=>({available:false})});
    const response=await dispatch(server);assert.equal(response.status,200,JSON.stringify(response.body));
    const encoded=response.body.oceanSnapshot.observation.observations.currents;
    assert.equal(encoded.contractVersion,NORMALIZED_CURRENT_HANDOFF_V1);assert(!Object.hasOwn(encoded,'eastwardMetersPerSecond'));
    assert.deepEqual(response.body.observationSnapshot.observations.currents,encoded);
    const directStorage=buildOceanMemoryStorage({oceanSnapshot:payload.oceanSnapshot,storedAt:'2026-09-24T02:00:00Z'});
    assert.deepEqual(directStorage.snapshot.observation.observations.currents,encoded);
    const storage=buildOceanMemoryStorage({oceanSnapshot:response.body.oceanSnapshot,storedAt:'2026-09-24T02:00:00Z'});
    // Exercise the actual browser persistence payload builder without loading a
    // database client or issuing a request; created_at is the returned-row field.
    const persistenceRow=buildOceanSnapshotStorageRow({userId:'synthetic-owner',oceanSnapshot:response.body.oceanSnapshot});
    assert.deepEqual(persistenceRow.snapshot_payload,storage.snapshot);
    const replay=buildOceanMemoryStorageRecordFromRow({row:transport({...persistenceRow,created_at:'2026-09-24T02:00:00Z'})});
    assert.equal(replay.available,true,JSON.stringify(replay.missingRequirements));
    const current=replay.snapshot.observation.observations.currents;
    for(const key of ['eastwardMetersPerSecond','northwardMetersPerSecond','speedKnots','directionDegrees'])assert(Object.is(current[key],point[key]),key);
    assert.equal(current.speedDerivationFailed,point.source.availability==='available'&&point.speedKnots===null);
    assert.deepEqual(replay.snapshot.observation.lineage.processingReferences,[SOURCE_NORMALIZATION_REFERENCE]);
    const projection=buildCurrentVectorProjectionAnalysis(current.derived.spatialAnalysis.spatialStructure);
    assert.equal(projection.validProjectionCount,point.source.availability==='available'?4:0);
    if(values.every(value=>value===0))for(const v of projection.projections){
      assert(Object.is(v.eastwardMetersPerSecond,values[0]));assert(Object.is(v.northwardMetersPerSecond,values[1]));
    }
    if(point.source.availability!=='available'){assert.equal(projection.available,false);assert.equal(projection.coverage,'unavailable');assert.equal(current.eastwardMetersPerSecond,1);}
    if(values[0]===1e200){assert.equal(current.speedKnots,null);assert.equal(projection.available,true);}
    const recapture=encodeNormalizedCurrentHandoff(current,SOURCE_NORMALIZATION_VERSION);
    assert.deepEqual(recapture,encoded);assert(Object.isFrozen(current));
  }
});

test('mixed replayed availability filters diagnostic sources before unchanged projection coverage rules',()=>{
  const directions=['north','south','east','west'];
  for(let count=0;count<=4;count++){
    const p=input().samples[0].point;
    p.derived={spatialAnalysis:{spatialStructure:{vectors:directions.map((direction,i)=>{
      const v={...input().samples[0].point,direction};
      if(i>=count){v.source={...v.source,availability:'unavailable'};v.speedKnots=null;v.directionDegrees=null;}
      return v;
    })}}};
    const reconstructed=decodeNormalizedCurrentHandoff(transport(encodeNormalizedCurrentHandoff(p,SOURCE_NORMALIZATION_VERSION)));
    const projection=buildCurrentVectorProjectionAnalysis(reconstructed.derived.spatialAnalysis.spatialStructure);
    assert.equal(projection.validProjectionCount,count);assert.equal(projection.available,count>=3);
    assert.equal(projection.coverage,['unavailable','insufficient','insufficient','partial','complete'][count]);
    const gradient=buildCurrentGradientAnalysis(projection);
    if(count===0){assert.equal(gradient.available,false);assert.equal(buildCurrentShearAnalysis(gradient).available,false);
      assert.equal(buildCurrentEdgeAnalysis(gradient).available,false);assert.equal(buildCurrentConvergenceAnalysis(gradient).available,false);}
  }
});

test('normalized creation requires explicit correct processing identity; generic v3 and history do not acquire it',()=>{
  const p=input().samples[0].point,authority=input().sourceAuthority;
  for(const version of [undefined,null,'','pelora-source-normalization-v0']){
    assert.throws(()=>encodeNormalizedCurrentHandoff(p,version));assert.throws(()=>captureNewNormalizedCurrentPoint(p,authority,[],version));
  }
  assert.equal(v3.captureCurrentEvidenceV3({...input(),lineageReferences:[]}).lineageReferences.length,0);
  for(const refs of [[],[SOURCE_NORMALIZATION_REFERENCE,{...SOURCE_NORMALIZATION_REFERENCE,contractVersion:'pelora-source-normalization-v0'}]]){
    const payload=structuredClone(snapshots(p));payload.observationSnapshot.lineage.processingReferences=refs;
    assert.throws(()=>encodeNormalizedOceanResponse(payload,SOURCE_NORMALIZATION_VERSION));
  }
});

test('exact live envelope rejects tampering, inherited values and accessors without evaluation',()=>{
  const e=encodeNormalizedCurrentHandoff(input().samples[0].point,SOURCE_NORMALIZATION_VERSION);
  for(const field of ['captureText','contextText','sha256']){const bad=structuredClone(e);bad[field]+=' ';assert.throws(()=>decodeNormalizedCurrentHandoff(bad));}
  const bad=structuredClone(e);bad.reference.sha256='0'.repeat(64);assert.throws(()=>decodeNormalizedCurrentHandoff(bad));
  assert.throws(()=>decodeNormalizedCurrentHandoff({...e,extra:true}));assert.throws(()=>decodeNormalizedCurrentHandoff(Object.create(e)));
  let calls=0;const accessor={...e};Object.defineProperty(accessor,'captureText',{get(){calls++;return e.captureText;}});
  assert.throws(()=>decodeNormalizedCurrentHandoff(accessor));assert.equal(calls,0);
});

test('admission rejects missing/nonfinite sources, and independently rechecks available partial arithmetic',()=>{
  for(const source of [undefined,null,{availability:'unavailable'},{availability:'request-failed'}]){
    const projection=buildCurrentVectorProjectionAnalysis({vectors:[{direction:'north',source,eastwardMetersPerSecond:1,northwardMetersPerSecond:1}]});
    assert.equal(projection.validProjectionCount,0);
  }
  for(const component of [null,NaN,Infinity,-Infinity]){
    assert.equal(buildCurrentVectorProjectionAnalysis({vectors:[{direction:'north',source:{availability:'available'},eastwardMetersPerSecond:component,northwardMetersPerSecond:1}]}).validProjectionCount,0);
  }
  for(const n of [1e200,Number.MAX_VALUE]){
    const p=partial().samples[0].point;p.eastwardMetersPerSecond=n;p.northwardMetersPerSecond=n;
    const r=decodeNormalizedCurrentHandoff(transport(encodeNormalizedCurrentHandoff(p,SOURCE_NORMALIZATION_VERSION)));
    const projection=buildCurrentVectorProjectionAnalysis({vectors:[{direction:'north',...r}]});
    assert.equal(projection.validProjectionCount,n===1e200?1:0);assert.equal(r.speedKnots,null);
  }
});

test('stored normalized raw points cannot bypass exact replay; unmarked historical points retain historical shape',()=>{
  const payload=snapshots(input().samples[0].point);
  assert.throws(()=>buildOceanMemoryStorageRecordFromRow({row:rowFor(payload.oceanSnapshot)}));
  const historical=structuredClone(payload.oceanSnapshot);delete historical.observation.lineage.processingReferences;
  const out=buildOceanMemoryStorageRecordFromRow({row:rowFor(historical)});
  assert.equal(out.available,true);assert(!Object.hasOwn(out.snapshot.observation.lineage,'processingReferences'));
  assert(!Object.hasOwn(out.snapshot.observation.observations.currents,'contractVersion'));
  const encoded=encodeNormalizedOceanResponse(payload,SOURCE_NORMALIZATION_VERSION).oceanSnapshot;
  const bad=structuredClone(encoded);delete bad.observation.lineage.processingReferences;
  assert.throws(()=>buildOceanMemoryStorageRecordFromRow({row:rowFor(bad)}));
});
