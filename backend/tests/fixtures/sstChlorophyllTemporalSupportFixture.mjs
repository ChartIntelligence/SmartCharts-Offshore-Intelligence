// Synthetic metadata probes only. No provider data, selector or temporal arithmetic.
import {getSeaSurfaceTemperaturePoint,getMarineConditions,getChlorophyllConditions,getGapFilledChlorophyllConditions} from '../../server.js';
import {captureFixture} from './currentEvidenceCaptureFixture.mjs';
export {frame,observation,at,context,sstQualificationView} from './temporalEvidenceFixture.mjs';
export {witnessedFixture,conceptualAvailability} from './historicalAvailabilityReferenceFixture.mjs';
export const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T14:00:00Z'};
export async function probe(t,family,extra={},value=.1){
  const requests=[];
  const mock=t.mock.method(globalThis,'fetch',async input=>{
    const url=new URL(input);requests.push(url);
    if(!['marine-api.open-meteo.com','api.open-meteo.com','coastwatch.noaa.gov','coastwatch.pfeg.noaa.gov'].includes(url.hostname))throw Error('unexpected synthetic endpoint');
    const body=url.hostname.endsWith('.noaa.gov')
      ? {table:{columnNames:['time','latitude','longitude','chlor_a','pixel_time','support_start','support_end'],rows:[['2026-09-24T12:00:00Z',25,-90,value,'2026-09-24T11:10:00Z','2026-09-24T00:00:00Z','2026-09-25T00:00:00Z']]},...extra}
      : {latitude:25,longitude:-90,current:{time:'2026-09-24T12:00:00Z',interval:900,sea_surface_temperature:25,wind_speed_10m:2,wind_gusts_10m:3,wind_direction_10m:90,wave_height:1,wave_direction:90,wave_period:7,swell_wave_height:1,swell_wave_direction:90,swell_wave_period:7},...extra};
    return {ok:true,json:async()=>body};
  });
  try { const point=await ({sst:getSeaSurfaceTemperaturePoint,marine:getMarineConditions,direct:getChlorophyllConditions,gap:getGapFilledChlorophyllConditions}[family])(25,-90,assessment);return {point,requests}; }
  finally {mock.mock.restore();}
}
export function inputFor(point,family){
  const input=captureFixture(family==='direct'?'CHLOROPHYLL_DIRECT':family==='gap'?'CHLOROPHYLL_GAP_FILLED':'SST');
  input.samples[0].point=Object.fromEntries(Object.keys(input.samples[0].point).map(k=>[k,point[k]]));
  return input;
}
