// Contract evidence only. No new failure-state enum or runtime normalization policy.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {writeFileSync} from 'node:fs';
import {getCurrentConditionsPoint,getMoonConditions} from '../server.js';
import {runCurrent,nonfinitePaths} from './fixtures/currentVectorDerivedFinitenessFixture.mjs';
import {assessment,fields,parse} from './fixtures/sourceNormalizationFixture.mjs';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {captureCurrentEvidenceV1} from '../currentEvidenceCapture.mjs';
import {captureCurrentEvidenceV2,replayCurrentEvidenceSourceV2} from '../currentEvidenceCaptureV2.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
import {copy as publicationCopy} from '../../shared/oceanPublication.mjs';
import {parsed} from './fixtures/marineAssessorCompanionFixture.mjs';
import {currentQuality} from './fixtures/weatherMarineQualityFixture.mjs';
const evidence={ordinary:null,zeros:[],controls:[],partial:null,capture:null,analogy:null};
async function point(t,components,internal=false){
 const fetch=t.mock.method(globalThis,'fetch',async input=>{
  assert.equal(new URL(input).hostname,'coastwatch.noaa.gov');
  const data={time:'2026-09-24T00:00:00Z',latitude:25,longitude:-90,...components};
  const body={table:{columnNames:Object.keys(data),rows:[Object.values(data)]}};
  return {ok:true,json:async()=>internal?body:JSON.parse(JSON.stringify(body))};
 });
 try{return await getCurrentConditionsPoint(25,-90,assessment);}finally{fetch.mock.restore();}
}
function captureInput(p){const input=captureFixture('CURRENTS');input.samples[0].point=
 Object.fromEntries(Object.keys(input.samples[0].point).map(k=>[k,p[k]]));return input;}
test('ordinary vector has coherent finite source, vector and spatial representations',async t=>{
 const r=await runCurrent(t,{all:[.5,.2]});
 assert.equal(r.point.speedKnots,1);assert.equal(r.point.directionDegrees,68);
 assert.equal(r.point.source.availability,'available');assert.equal(r.spatial.available,true);
 assert.equal(r.projection.coverage,'complete');assert.equal(r.gradient.coverage,'complete');
 assert.equal(nonfinitePaths(r).length,0);evidence.ordinary=r;
});
test('four signed-zero source pairs are not treated as numeric failures',async t=>{
 for(const u of [0,-0])for(const v of [0,-0]){
  const r=await runCurrent(t,{all:[u,v]});
  assert.equal(r.point.speedKnots,0);assert.equal(r.point.source.availability,'available');
  assert.equal(r.projection.coverage,'complete');assert.equal(nonfinitePaths(r).length,0);
  assert.ok(r.projection.projections.every(p=>p.vectorMagnitudeMetersPerSecond===0&&p.inwardAlignmentDegrees===null));
  evidence.zeros.push({input:[u,v],point:r.point,projection:r.projection});
 }
 assert.notEqual(exactJson({u:-0}),exactJson({u:0}));
});
test('absent components and internal nonfinite source differ from finite-source derivation failure',async t=>{
 const cases=[['u-missing',{v_current:.2},false],['v-missing',{u_current:.5},false],
  ['both-missing',{},false],['u-infinity',{u_current:Infinity,v_current:.2},true],
  ['u-negative-infinity',{u_current:-Infinity,v_current:.2},true],['u-nan',{u_current:NaN,v_current:.2},true]];
 for(const [id,components,internal]of cases){const p=await point(t,components,internal);
  assert.equal(p.source.availability,'no-valid-pixel');assert.equal(p.directionDegrees,null);
  assert.equal(p.speedKnots,0); // Preserves prior null-magnitude coercion finding, not a contract approval.
  evidence.controls.push({id,transportClass:internal?'INTERNAL_ONLY':'TRANSPORT_REPRESENTABLE',point:p});
 }
 const p=await point(t,{u_current:1e200,v_current:1});
 assert.equal(p.source.availability,'available');assert.equal(p.speedKnots,null);
 assert.equal(p.directionDegrees,90);evidence.controls.push({id:'finite-source-derivation-failure',point:p});
});
test('source availability, spatial validity and projection validity use different predicates',async t=>{
 const r=await runCurrent(t,{all:[Number.MAX_VALUE,Number.MAX_VALUE]});
 assert.equal(r.point.source.availability,'available');assert.equal(r.point.speedKnots,null);
 assert.equal(r.spatial.available,false);assert.equal(r.projection.available,true);
 assert.equal(r.projection.coverage,'complete');assert.ok(nonfinitePaths(r.projection).length>0);
 assert.throws(()=>publicationCopy(r.projection));evidence.partial=r;
});
test('capture contracts include required derived fields and do not decide all future derivations',async t=>{
 const ordinary=await point(t,{u_current:.5,v_current:.2});
 const accepted=captureCurrentEvidenceV2(captureInput(ordinary));
 const replay=replayCurrentEvidenceSourceV2(accepted);
 assert.equal(replay.samples[0].point.speedKnots,ordinary.speedKnots);
 assert.equal(exactJson(replay.samples[0].point),exactJson(captureInput(ordinary).samples[0].point));
 const failed=await point(t,{u_current:Number.MAX_VALUE,v_current:Number.MAX_VALUE});
 const input=captureInput(failed);
 assert.throws(()=>captureCurrentEvidenceV1(input));assert.throws(()=>captureCurrentEvidenceV2(input));
 input.samples[0].point.source={...input.samples[0].point.source,availability:'unavailable'};
 assert.doesNotThrow(()=>captureCurrentEvidenceV2(input));
 evidence.capture={ordinaryReplay:'EXACT',availablePartial:'REJECTED_V1_V2',unavailablePartial:'SCHEMA_ONLY_DIAGNOSTIC_ACCEPTED',
  changedSourceAvailabilityIsNotProducerEvidence:true};
});
test('weather partial-family analogy is bounded and does not decide current atomicity',async t=>{
 const f=fields.find(f=>f.id==='marine:wind_speed_10m');const {result}=await parse(t,f,'missing',undefined);
 assert.equal(result.wind.speedKnots,null);assert.ok(Number.isFinite(result.wind.gustKnots));
 assert.equal(result.wind.source.availability,'available');evidence.analogy={wind:result.wind,scope:'Independent family fields, not proof that vector norm is optional'};
});
test('quality measures its own input layers, not every spatial derivative',async t=>{
 const r=await runCurrent(t,{all:[Number.MAX_VALUE,Number.MAX_VALUE],center:[.5,.2]});
 const marine=await parsed(t);
 const quality=currentQuality(marine,{currents:r.point,
  chlorophyll:{...captureFixture('CHLOROPHYLL_DIRECT').samples[0].point,ageHours:1},
  moon:getMoonConditions(assessment.assessmentAt),chlorophyllResult:{status:'fulfilled'},
  gapFilledChlorophyllResult:{status:'fulfilled'},currentsResult:{status:'fulfilled'}});
 assert.equal(quality.layers.currents.state,'live');
 assert.equal(quality.overall.classification,'complete');
 assert.ok(nonfinitePaths(r.projection).length>0);
 evidence.quality={quality,projectionNonfinite:nonfinitePaths(r.projection),
  boundary:'Unchanged inline quality block with controlled companion context; not whole default evaluation'};
});
test('retain contract evidence without implementing a policy',()=>{
 writeFileSync('.local/ocean-quarantine/task12b7f/evidence.json',JSON.stringify(evidence,(_k,v)=>
 typeof v==='number'&&!Number.isFinite(v)?{nonfinite:String(v)}:Object.is(v,-0)?{signedZero:'-0'}:v,2)+'\n');
});
