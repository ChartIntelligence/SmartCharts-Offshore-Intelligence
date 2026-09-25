// Synthetic transport through the actual parser. No live acquisition/integration.
import assert from 'node:assert/strict';
import {getMarineConditions,getMoonConditions} from '../../server.js';
import {captureWeatherMarineQualityV1,weatherMarineQualityReferenceV1} from '../../weatherMarineQualityCapture.mjs';
import {captureCurrentEvidenceV1,replayCurrentEvidenceSourceV1,captureSampleAgeV1} from '../../currentEvidenceCapture.mjs';
import {qualityCaptureInput,currentQuality} from './weatherMarineQualityFixture.mjs';
import {captureFixture,ref} from './currentEvidenceCaptureFixture.mjs';

export async function parsed(t,opts={}) {
  const mock=t.mock.method(globalThis,'fetch',async url=>{
    const host=new URL(url).hostname;
    assert(['api.open-meteo.com','marine-api.open-meteo.com'].includes(host));
    const weather=host==='api.open-meteo.com';
    if(weather?opts.weatherFail:opts.marineFail) throw Error('synthetic failure');
    const current=weather
      ? {time:'2026-09-24T00:00:00Z',wind_speed_10m:4,wind_gusts_10m:6,wind_direction_10m:90,...opts.weather}
      : {time:'2026-09-24T00:00:00Z',sea_surface_temperature:26,wave_height:1,wave_direction:90,wave_period:7,swell_wave_height:0.5,swell_wave_direction:90,swell_wave_period:8,...opts.marine};
    return {ok:true,json:async()=>({latitude:25.05,longitude:-90.05,
      ...(opts.units?{current_units:{}}:{}),current:weather&&opts.noWeatherCurrent?null:current})};
  });
  try{return await getMarineConditions(25,-90);}finally{mock.mock.restore();}
}
export function inputs(m) {
  const q=captureWeatherMarineQualityV1(qualityCaptureInput(m));
  const marineInputs={};
  for(const [family,names] of Object.entries({wind:['gustKnots','directionDegrees','source'],waves:['directionDegrees','periodSeconds'],swell:['directionDegrees','periodSeconds']}))
    marineInputs[family]={family,...Object.fromEntries(names.map(k=>[k,structuredClone(m[family][k])]))};
  return {q,input:{qualityReference:weatherMarineQualityReferenceV1(q),marineInputs,
    source:structuredClone(m.source),lineageReferences:[ref('synthetic-marine-parser-output')]}};
}
export function currentSupport(m) {
  const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'};
  const s=captureFixture();s.samples[0].point={...m.sst,source:{provider:'Open-Meteo',classification:'forecast-model',availability:Number.isFinite(m.sst.temperatureFahrenheit)?'available':'unavailable'}};
  const sst=captureCurrentEvidenceV1(s);
  const point=family=>{const c=captureCurrentEvidenceV1(captureFixture(family));return {...replayCurrentEvidenceSourceV1(c).samples[0].point,ageHours:captureSampleAgeV1(c,'center',assessment)};};
  const context={chlorophyll:point('CHLOROPHYLL_DIRECT'),currents:point('CURRENTS'),moon:getMoonConditions(assessment.assessmentAt),
    chlorophyllResult:{status:'fulfilled'},gapFilledChlorophyllResult:{status:'fulfilled'},currentsResult:{status:'fulfilled'}};
  return {sst,replaySst:replayCurrentEvidenceSourceV1(sst).samples[0].point,quality:value=>currentQuality(value,context)};
}
export const sixFields=[['wind','gustKnots','wind_gusts_10m',25],['wind','directionDegrees','wind_direction_10m',270],
  ['waves','directionDegrees','wave_direction',270],['waves','periodSeconds','wave_period',3],
  ['swell','directionDegrees','swell_wave_direction',270],['swell','periodSeconds','swell_wave_period',3]];
