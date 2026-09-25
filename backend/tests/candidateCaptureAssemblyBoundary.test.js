// Task 12B.6C: source sufficiency diagnostic, not a candidate assembler.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getMarineConditions, getSeaSurfaceTemperaturePoint, getMoonConditions,
  buildOceanEvidenceLineage} from '../server.js';
import {captureCurrentEvidenceV1 as capture, serializeCurrentEvidenceCaptureV1 as serialize,
  readCurrentEvidenceCaptureV1 as read, replayCurrentEvidenceSourceV1 as replay,
  captureSampleAgeV1 as age} from '../currentEvidenceCapture.mjs';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';

const assessment = {contractVersion:'pelora-scientific-assessment-v1', assessmentAt:'2026-09-24T01:00:00Z'};
const source = readFileSync(new URL('../server.js', import.meta.url), 'utf8');
// Execute the exact current inline neutral quality assembler, not copied science.
// The full route is intentionally not invoked: it continues into Auth/history/species.
const start = source.indexOf('  const chlorophyllHasValue =', source.indexOf('async function getOceanConditionsAtAssessment'));
const end = source.indexOf('  const oceanConditions =', start);
assert(start > 0 && end > start);
const thresholds = ['CHLOROPHYLL_MAX_LIVE_AGE_HOURS','CURRENTS_MAX_LIVE_AGE_HOURS']
  .map(name => source.match(new RegExp(`const ${name} =\\s*\\d+;`))?.[0]);
assert(thresholds.every(Boolean));
const quality = new Function('marine','chlorophyll','currents','moon','chlorophyllResult','gapFilledChlorophyllResult','currentsResult',
  '"use strict";\n' + thresholds.join('\n') + '\n' + source.slice(start,end) + '\nreturn dataQuality;');
function assembleQuality(marine) {
  const point = family => {const c=capture(captureFixture(family)); return {...replay(c).samples[0].point,ageHours:age(c,'center',assessment)};};
  return quality(marine, point('CHLOROPHYLL_DIRECT'), point('CURRENTS'),getMoonConditions(assessment.assessmentAt),
    {status:'fulfilled'},{status:'fulfilled'},{status:'fulfilled'});
}
async function current(t, mode='complete', weatherTime='2026-09-24T00:00:00Z') {
  let calls=0;
  const mock=t.mock.method(globalThis,'fetch',async url=>{
    calls++;
    const weather=String(url).includes('api.open-meteo.com/v1/forecast');
    if(weather && mode==='weather-failed') throw new Error('synthetic weather failure');
    return {ok:true,json:async()=>({latitude:25.05,longitude:-90.05,current:weather
      ? {time:weatherTime,...(mode==='complete'?{wind_speed_10m:4,wind_direction_10m:90,wind_gusts_10m:5}:{})}
      : {time:'2026-09-24T00:00:00Z',sea_surface_temperature:26,...(mode==='complete'?{wave_height:1,swell_wave_height:0.5}:{})}})};
  });
  try {
    const marine=await getMarineConditions(25,-90);
    const point=await getSeaSurfaceTemperaturePoint(25,-90,assessment);
    const input=captureFixture(); input.samples[0].point=point;
    const c=capture(input);
    return {marine,capture:c,quality:assembleQuality(marine),calls};
  } finally {mock.mock.restore();}
}

test('actual current parsers: identical SST capture, different complete candidate quality',async t=>{
  const a=await current(t),b=await current(t,'missing');
  assert.deepEqual(a.capture,b.capture);
  assert.deepEqual(a.marine.sst,b.marine.sst);
  assert.equal(a.quality.overall.classification,'complete');
  assert.equal(b.quality.overall.classification,'insufficient');
  assert.notDeepEqual(a.quality,b.quality);
});
test('exact current quality output carries uncaptured acquisition outcomes',async t=>{
  const missing=await current(t,'missing'),failed=await current(t,'weather-failed');
  assert.deepEqual(missing.capture,failed.capture);
  assert.equal(missing.quality.layers.wind.state,'unavailable');
  assert.equal(failed.quality.layers.wind.state,'degraded');
  assert.notEqual(missing.quality.layers.wind.reason,failed.quality.layers.wind.reason);
});
test('marine aggregate observedAt is not the captured SST represented time',async t=>{
  const a=await current(t),b=await current(t,'complete','2026-09-23T23:00:00Z');
  assert.deepEqual(a.capture,b.capture);
  assert.notEqual(a.quality.layers.sst.observedAt,b.quality.layers.sst.observedAt);
  assert.equal(b.marine.sst.observedAt,'2026-09-24T00:00:00Z');
  // Preserve the existing discrepancy; do not replace aggregate time with SST time.
});
test('quality classification is consumed by actual neutral evidence lineage',async t=>{
  const a=await current(t),b=await current(t,'missing');
  const lineage=q=>buildOceanEvidenceLineage({groups:{},environmentalOpportunityEvidence:{},limitations:[],dataQuality:q});
  assert.notDeepEqual(lineage(a.quality),lineage(b.quality));
  assert(JSON.stringify(lineage(b.quality)).includes('data-quality:insufficient'));
  // No species score, eligibility, confidence or ranking change is asserted.
});
test('locked point capture rejects the missing marine payload rather than silently accepting it',()=>{
  for(const name of ['wind','waves','swell','diagnostics','dataQuality']){
    const f=captureFixture();f.samples[0].point[name]={};assert.throws(()=>capture(f));
  }
});
test('source projection still round trips exactly without network or implicit clock',async t=>{
  const a=await current(t);
  t.mock.method(globalThis,'fetch',()=>{throw new Error('network forbidden');});
  t.mock.method(Date,'now',()=>{throw new Error('clock forbidden');});
  assert.deepEqual(replay(read(serialize(a.capture))),replay(a.capture));
  assert.equal(age(a.capture,'center',assessment),1);
  assert.deepEqual(assembleQuality(a.marine),a.quality);
});
test('missing and zero wind are distinct in the existing quality assembler',async t=>{
  const a=await current(t,'missing');const zero=structuredClone(a.marine);zero.wind.speedKnots=0;
  assert.equal(assembleQuality(zero).layers.wind.state,'live');
  assert.equal(a.quality.layers.wind.state,'unavailable');
});
test('SST capture cannot stand in for missing weather, waves or swell',async t=>{
  const a=await current(t,'missing');
  assert.equal(a.capture.samples[0].point.source.availability,'available');
  for(const family of ['wind','waves','swell']) assert.equal(a.quality.layers[family].state,'unavailable');
});
