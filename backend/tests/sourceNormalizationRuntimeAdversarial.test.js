import test from 'node:test';
import assert from 'node:assert/strict';
import {getMarineConditions, getSeaSurfaceTemperaturePoint, buildCurrentVectorProjectionAnalysis, buildCurrentGradientAnalysis} from '../server.js';
import {sourceNumber, SOURCE_NORMALIZATION_REFERENCE} from '../sourceNormalization.mjs';
import {fields, parse} from './fixtures/sourceNormalizationFixture.mjs';
import {runCurrent} from './fixtures/currentVectorDerivedFinitenessFixture.mjs';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';
import * as v1 from '../currentEvidenceCapture.mjs';
import * as v2 from '../currentEvidenceCaptureV2.mjs';
const versions=[
  {capture:v1.captureCurrentEvidenceV1,serialize:v1.serializeCurrentEvidenceCaptureV1,read:v1.readCurrentEvidenceCaptureV1,replay:v1.replayCurrentEvidenceSourceV1},
  {capture:v2.captureCurrentEvidenceV2,serialize:v2.serializeCurrentEvidenceCaptureV2,read:v2.readCurrentEvidenceCaptureV2,replay:v2.replayCurrentEvidenceSourceV2}
];
function inputFor(point) {
  const input=captureFixture('CURRENTS');
  for(const k of ['speedKnots','directionDegrees','eastwardMetersPerSecond','northwardMetersPerSecond','observedAt'])input.samples[0].point[k]=point[k];
  input.samples[0].point.source.availability=point.source.availability;
  return input;
}

test('actual partial current: source components survive; speed-required capture rejects in both versions',async t=>{
  const r=await runCurrent(t,{all:[1e200,1]});
  assert.equal(r.point.source.availability,'available');assert.equal(r.point.speedKnots,null);
  assert.equal(r.point.eastwardMetersPerSecond,1e200);assert.equal(r.point.northwardMetersPerSecond,1);
  assert(Number.isFinite(r.point.directionDegrees));assert.equal(r.projection.available,true);
  const input=inputFor(r.point);
  for(const v of versions)assert.throws(()=>v.capture(input));
  console.log('PARTIAL_STATE',JSON.stringify({u:r.point.eastwardMetersPerSecond,v:r.point.northwardMetersPerSecond,speed:r.point.speedKnots,heading:r.point.directionDegrees,source:r.point.source.availability,projection:r.projection.available,gradient:r.gradient.coverage}));
});

test('other availability labels validate diagnostic bytes but rewrite source semantics; replay never repairs null',async t=>{
  const r=await runCurrent(t,{all:[1e200,1]});
  for(const availability of ['unavailable','no-valid-pixel','provider-unavailable','request-failed'])for(const v of versions){
    const input=inputFor(r.point);input.samples[0].point.source.availability=availability;
    const replay=v.replay(v.read(v.serialize(v.capture(input))));const point=replay.samples[0].point;
    assert.equal(point.speedKnots,null);assert.equal(point.eastwardMetersPerSecond,1e200);
    assert.equal(point.source.availability,availability);assert.notEqual(availability,r.point.source.availability);
    const projection=buildCurrentVectorProjectionAnalysis({vectors:[{direction:'north',...point}]});
    assert.equal(projection.projections[0].available,false); // Retained diagnostics are not admissible source evidence.
  }
});

test('omitting speed, changing outcome, adding status, or authority/lineage substitution cannot capture the original partial point',async t=>{
  const r=await runCurrent(t,{all:[1e200,1]});
  const variants=[];
  let x=inputFor(r.point);delete x.samples[0].point.speedKnots;variants.push(x);
  x=inputFor(r.point);x.samples[0].outcome='REJECTED';variants.push(x);
  x=inputFor(r.point);x.samples[0].point.derivedSpeedAvailability='failed';variants.push(x);
  x=inputFor(r.point);x.sourceAuthority.status='RECORDED_NOT_REQUALIFIED';x.lineageReferences.push(SOURCE_NORMALIZATION_REFERENCE);variants.push(x);
  for(const input of variants)for(const v of versions)assert.throws(()=>v.capture(input));
  x=inputFor(r.point);x.samples[0]={role:'center',outcome:'REJECTED',point:null};
  for(const v of versions)assert.equal(v.replay(v.capture(x)).samples[0].point,null); // Loses valid components; not a faithful workaround.
  x=inputFor(r.point);x.samples[0].point.speedKnots=0;
  for(const v of versions)assert.equal(v.replay(v.capture(x)).samples[0].point.speedKnots,0); // Valid shape, invented derived fact: rejected as a semantic workaround.
});

test('processing reference is optional existing lineage; it binds identity but not source scientific digest',()=>{
  const original=captureFixture('CURRENTS');const old=v2.captureCurrentEvidenceV2(original);
  const bound=v2.captureCurrentEvidenceV2({...original,lineageReferences:[...original.lineageReferences,SOURCE_NORMALIZATION_REFERENCE]});
  assert.equal(old.scientificContentDigest,bound.scientificContentDigest);assert.notEqual(old.captureId,bound.captureId);
  assert.equal(old.lineageReferences.some(x=>x.referenceId===SOURCE_NORMALIZATION_REFERENCE.referenceId),false);
  assert.equal(v2.readCurrentEvidenceCaptureV2(v2.serializeCurrentEvidenceCaptureV2(bound)).lineageReferences.at(-1).sha256,SOURCE_NORMALIZATION_REFERENCE.sha256);
});

test('boxed and effectful nonnumeric values are rejected without invoking their coercion hooks',()=>{
  let calls=0;const value={valueOf(){calls++;return 2;},toString(){calls++;return '2';}};
  for(const x of [new Number(2),new String('2'),new Boolean(false),value,2n,Symbol('number')])assert.equal(sourceNumber(x),null);
  assert.equal(calls,0);
});

test('existing inherited/getter numeric behavior remains an internal-only characterization',async t=>{
  for(const f of fields.filter(f=>f.conversion!=='coordinate'))for(const state of ['inherited','getter']){
    const result=await parse(t,f,state);assert(Number.isFinite(result.value),f.id);
    if(state==='getter')assert(result.getterCalls>0);
  }
});

test('rejected acquisition stays rejected rather than manufacturing normalized evidence',async t=>{
  for(const parser of ['marine','direct','gap','current'])await assert.rejects(()=>parse(t,fields.find(f=>f.parser===parser),'null',null,{reject:true}),/Synthetic transport rejection|Both weather and marine data providers are temporarily unavailable/);
});

test('center SST must not admit a changed nonfinite getter value after successful Fahrenheit conversion',async t=>{
  let reads=0;
  const fetch=t.mock.method(globalThis,'fetch',async input=>{
    const url=new URL(input);assert(['api.open-meteo.com','marine-api.open-meteo.com'].includes(url.hostname));
    const current={time:'2026-09-24T00:00:00Z'};
    if(url.hostname==='marine-api.open-meteo.com')Object.defineProperty(current,'sea_surface_temperature',{enumerable:true,get(){reads++;return reads===1?25:Infinity;}});
    return {ok:true,json:async()=>({latitude:25,longitude:-90,current})};
  });
  try{const m=await getMarineConditions(25,-90);console.log('SST_GETTER',JSON.stringify({reads,celsius:String(m.sst.temperatureCelsius),fahrenheit:m.sst.temperatureFahrenheit}));assert.equal(m.sst.temperatureCelsius===null||Number.isFinite(m.sst.temperatureCelsius),true);}
  finally{fetch.mock.restore();}
});

test('center SST retains exactly one read across changing getters and numeric edge values',async t=>{
  const cases=[[25,26],[25,Infinity],[Infinity,25],[0,1],[-0,1],[null,25],
    [undefined,25],[NaN,25],[-Infinity,25]];
  for(const [first,next] of cases){
    let reads=0;
    const fetch=t.mock.method(globalThis,'fetch',async input=>{
      const u=new URL(input),current={time:'2026-09-24T00:00:00Z'};
      if(u.hostname==='marine-api.open-meteo.com')Object.defineProperty(current,'sea_surface_temperature',{get(){return ++reads===1?first:next;}});
      return {ok:true,json:async()=>({latitude:25,longitude:-90,current})};
    });
    try{
      const {sst}=await getMarineConditions(25,-90);
      assert.equal(reads,1);
      assert(Object.is(sst.temperatureCelsius,Number.isFinite(first)?first:null));
      assert.equal(sst.temperatureFahrenheit,Number.isFinite(first)?Number((first*9/5+32).toFixed(1)):null);
    }finally{fetch.mock.restore();}
  }
});

test('directional SST also validates and converts one retained accessor value',async t=>{
  for(const [first,next] of [[25,26],[25,Infinity],[Infinity,25],[0,1],[-0,1],[null,25],[undefined,25],[NaN,25],[-Infinity,25]]){
    let reads=0;const fetch=t.mock.method(globalThis,'fetch',async()=>{
      const current={time:'2026-09-24T00:00:00Z'};
      Object.defineProperty(current,'sea_surface_temperature',{get(){return ++reads===1?first:next;}});
      return {ok:true,json:async()=>({latitude:25,longitude:-90,current})};
    });
    try{const p=await getSeaSurfaceTemperaturePoint(25,-90);assert.equal(reads,1);assert(Object.is(p.temperatureCelsius,Number.isFinite(first)?first:null));}
    finally{fetch.mock.restore();}
  }
});

test('sub-resolution axis preserves the existing invalid-separation rejection',()=>{
  const projection=buildCurrentVectorProjectionAnalysis({vectors:[
    {direction:'north',source:{availability:'available'},requestedLatitude:25.0000001,requestedLongitude:-90,eastwardMetersPerSecond:1,northwardMetersPerSecond:1},
    {direction:'south',source:{availability:'available'},requestedLatitude:25,requestedLongitude:-90,eastwardMetersPerSecond:1,northwardMetersPerSecond:1}
  ]});
  assert.equal(projection.validProjectionCount,2);
  const axis=buildCurrentGradientAnalysis(projection).axisComparisons.find(x=>x.axis==='north-south');
  assert.equal(axis.available,false);console.log('ROUNDED_SEPARATION',JSON.stringify(axis));
  assert.doesNotMatch(axis.reason,/nonfinite/);
});
test('v1 canonical wire loses negative zero; existing exact v2 preserves it without relabelling v1',()=>{
  const input=captureFixture('CURRENTS');input.samples[0].point.eastwardMetersPerSecond=-0;
  const old=v1.readCurrentEvidenceCaptureV1(v1.serializeCurrentEvidenceCaptureV1(v1.captureCurrentEvidenceV1(input)));
  const exact=v2.readCurrentEvidenceCaptureV2(v2.serializeCurrentEvidenceCaptureV2(v2.captureCurrentEvidenceV2(input)));
  assert.equal(Object.is(old.samples[0].point.eastwardMetersPerSecond,-0),false);
  assert.equal(Object.is(exact.samples[0].point.eastwardMetersPerSecond,-0),true);
});

test('throwing SST getter fails closed after exactly one read',async t=>{
  for(const parser of [getMarineConditions,getSeaSurfaceTemperaturePoint]){
    let reads=0;const fetch=t.mock.method(globalThis,'fetch',async input=>{
      const current={time:'2026-09-24T00:00:00Z'};
      if(new URL(input).hostname==='marine-api.open-meteo.com')Object.defineProperty(current,'sea_surface_temperature',{get(){reads++;throw Error('SYNTHETIC_GETTER_FAILURE');}});
      return {ok:true,json:async()=>({latitude:25,longitude:-90,current})};
    });
    try{await assert.rejects(()=>parser(25,-90),/SYNTHETIC_GETTER_FAILURE/);assert.equal(reads,1);}finally{fetch.mock.restore();}
  }
});
