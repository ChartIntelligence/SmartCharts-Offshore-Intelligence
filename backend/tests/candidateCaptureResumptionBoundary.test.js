// Resumed 12B.6C: prove source sufficiency before constructing a candidate assembler.
import test from 'node:test';
import assert from 'node:assert/strict';
import {getMarineConditions,assessOceanConditions,getMoonConditions} from '../server.js';
import {captureCurrentEvidenceV1 as captureCurrent,replayCurrentEvidenceSourceV1 as replayCurrent,captureSampleAgeV1} from '../currentEvidenceCapture.mjs';
import {captureWeatherMarineQualityV1 as captureWeather,replayWeatherMarineQualityV1 as replayWeather} from '../weatherMarineQualityCapture.mjs';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {qualityCaptureInput,currentQuality} from './fixtures/weatherMarineQualityFixture.mjs';

const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'};
async function source(t,weather={},marine={}) {
  const mock=t.mock.method(globalThis,'fetch',async url=>{
    const u=new URL(url);assert(['api.open-meteo.com','marine-api.open-meteo.com'].includes(u.hostname));
    return {ok:true,json:async()=>({latitude:25.05,longitude:-90.05,current:u.hostname==='api.open-meteo.com'
      ? {time:'2026-09-24T00:00:00Z',wind_speed_10m:4,wind_gusts_10m:6,wind_direction_10m:90,...weather}
      : {time:'2026-09-24T00:00:00Z',sea_surface_temperature:26,wave_height:1,wave_direction:90,wave_period:7,swell_wave_height:0.5,swell_wave_direction:90,swell_wave_period:8,...marine}})};
  });
  try{return await getMarineConditions(25,-90);}finally{mock.mock.restore();}
}
function captures(m) {
  const sst=captureFixture();sst.samples[0].point={...m.sst,source:{provider:'Open-Meteo',classification:'forecast-model',availability:'available'}};
  return {weather:captureWeather(qualityCaptureInput(m)),sst:captureCurrent(sst),
    chlorophyll:captureCurrent(captureFixture('CHLOROPHYLL_DIRECT')),currents:captureCurrent(captureFixture('CURRENTS'))};
}
function quality(m,c) {
  const point=k=>({...replayCurrent(c[k]).samples[0].point,ageHours:captureSampleAgeV1(c[k],'center',assessment)});
  return currentQuality(m,{chlorophyll:point('chlorophyll'),currents:point('currents'),moon:getMoonConditions(assessment.assessmentAt),
    chlorophyllResult:{status:'fulfilled'},gapFilledChlorophyllResult:{status:'fulfilled'},currentsResult:{status:'fulfilled'}});
}
const assess=(m,c)=>assessOceanConditions({wind:m.wind,waves:m.waves,swell:m.swell,dataQuality:quality(m,c)});
function leaves(value,path='') {
  if(value&&typeof value==='object'&&Object.keys(value).length)return Object.entries(value).flatMap(([k,v])=>leaves(v,path?path+'.'+k:k));
  return [[path,value]];
}
const cases=[
  ['wind.gustKnots',{wind_gusts_10m:25},{},'wind_gusts_10m'],
  ['wind.directionDegrees',{wind_direction_10m:270},{},'wind_direction_10m'],
  ['waves.directionDegrees',{}, {wave_direction:270},'wave_direction'],
  ['waves.periodSeconds',{}, {wave_period:3},'wave_period'],
  ['swell.directionDegrees',{}, {swell_wave_direction:270},'swell_wave_direction'],
  ['swell.periodSeconds',{}, {swell_wave_period:3},'swell_wave_period']
];
for(const [field,w,m,transportField] of cases)test('identical BOTH captures omit consumed candidate input '+field,async t=>{
  const a=await source(t),b=await source(t,w,m),ca=captures(a),cb=captures(b);
  assert.deepEqual(ca,cb);assert.deepEqual(quality(a,ca),quality(b,cb));
  const x=assess(a,ca),y=assess(b,cb);assert.notDeepEqual(x,y);
  const other=Object.fromEntries(leaves(y));
  const changed=leaves(x).filter(([p,v])=>JSON.stringify(v)!==JSON.stringify(other[p])).map(([p])=>'oceanConditions.'+p);
  assert(changed.length>0);
  console.log(JSON.stringify({diagnostic:'RESUMED_CANDIDATE_SOURCE_GAP',field,transportField,classification:'MISSING_GOVERNED_SOURCE',changedCandidateFields:changed}));
});
test('same existing full marine assembler replays exactly when complete normalized inputs are frozen',async t=>{
  const m=await source(t),c=captures(m),expected=assess(m,c),frozen=structuredClone(m);
  t.mock.method(globalThis,'fetch',()=>{throw Error('network forbidden');});t.mock.method(Date,'now',()=>{throw Error('clock forbidden');});
  assert.deepEqual(assess(frozen,c),expected);
  // A complete manually retained parser result is not a newly qualified source capture.
  console.log(JSON.stringify({diagnostic:'CURRENT_MARINE_CANDIDATE_FIELD_INVENTORY',fields:leaves({wind:m.wind,waves:m.waves,swell:m.swell,oceanConditions:expected}).map(([field])=>field)}));
});
test('locked weather capture cannot be extended with uncaptured directions/gust/periods',()=>{
  for(const [family,field] of [['wind','directionDegrees'],['wind','gustKnots'],['waves','directionDegrees'],['waves','periodSeconds'],['swell','directionDegrees'],['swell','periodSeconds']]){
    const input={source:{provider:'Open-Meteo',weatherProduct:'Weather Forecast API',marineProduct:'Marine Forecast API'},sourceAuthority:captureFixture().sourceAuthority,
      location:{latitude:25,longitude:-90},qualityInputs:{wind:{speedKnots:8},waves:{heightFeet:3},swell:{heightFeet:2},observedAt:null,diagnostics:{providerStatus:{weatherApi:'fulfilled',marineApi:'fulfilled'}}},lineageReferences:[]};
    input.qualityInputs[family][field]=1;assert.throws(()=>captureWeather(input));
    const current=captureFixture();current.samples[0].point[field]=1;assert.throws(()=>captureCurrent(current));
  }
});
test('dropping missing fields silently changes the species-neutral marine result',async t=>{
  const m=await source(t),c=captures(m),partial={...replayWeather(c.weather),sst:replayCurrent(c.sst).samples[0].point};
  assert.deepEqual(quality(partial,c),quality(m,c));assert.notDeepEqual(assess(partial,c),assess(m,c));
});
test('zero versus absent uncaptured wave period remains a distinct current candidate input',async t=>{
  const a=await source(t,{}, {wave_period:0}),b=await source(t,{}, {wave_period:undefined});
  assert.equal(a.waves.periodSeconds,0);assert.equal(b.waves.periodSeconds,null);
  assert.deepEqual(captures(a),captures(b));assert.notDeepEqual(assess(a,captures(a)),assess(b,captures(b)));
});
test('quality capture gap is closed even under partial family evidence; full object gap remains',async t=>{
  const a=await source(t,{}, {wave_height:undefined}),b=await source(t,{wind_gusts_10m:25},{wave_height:undefined});
  const ca=captures(a),cb=captures(b);assert.deepEqual(ca,cb);
  assert.equal(quality(a,ca).overall.classification,'degraded');assert.deepEqual(quality(a,ca),quality(b,cb));assert.notDeepEqual(assess(a,ca),assess(b,cb));
});
test('wind provenance availability uses uncaptured gust/direction even with identical missing speed',async t=>{
  const a=await source(t,{wind_speed_10m:undefined,wind_gusts_10m:undefined,wind_direction_10m:undefined});
  const b=await source(t,{wind_speed_10m:undefined});
  assert.deepEqual(captures(a),captures(b));assert.deepEqual(quality(a,captures(a)),quality(b,captures(b)));
  assert.equal(a.wind.source.availability,'provider-returned-null');assert.equal(b.wind.source.availability,'available');
});
