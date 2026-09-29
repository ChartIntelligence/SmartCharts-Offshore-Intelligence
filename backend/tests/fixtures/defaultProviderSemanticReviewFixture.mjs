import assert from 'node:assert/strict';
import {Session} from 'node:inspector';
import {readFileSync} from 'node:fs';
import {evaluateUnifiedOpportunityOceanConditionsV1} from '../../server.js';
export const source=readFileSync(new URL('../../server.js',import.meta.url),'utf8');
export const scenarios=Object.freeze([
 {id:'lunar-assessment-september',coordinates:[25,-90],assessmentAt:'2026-09-26T01:00:00Z',purpose:'Assessment-controlled lunar classification before snapshot',branchId:'classifyMoonPhase::phase-fraction::full-moon'},
 {id:'lunar-assessment-october',coordinates:[25,-90],assessmentAt:'2026-10-03T01:00:00Z',purpose:'Contrasting assessment-controlled lunar classification',branchId:'classifyMoonPhase::phase-fraction::waning-gibbous'}
]);
export async function run(t,scenario,clock=Date.parse('2080-01-01')){
 const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:scenario.assessmentAt},requests=[];
 const now=t.mock.method(Date,'now',()=>clock),warn=t.mock.method(console,'warn',()=>{});
 const transport=t.mock.method(globalThis,'fetch',async input=>{
  const url=new URL(input),weather=url.hostname==='api.open-meteo.com',marine=url.hostname==='marine-api.open-meteo.com',noaa=url.hostname.endsWith('.noaa.gov');assert(weather||marine||noaa,'Unexpected endpoint');requests.push(String(url));
  return {ok:true,json:async()=>noaa?{table:{columnNames:['time','latitude','longitude','chlor_a','u_current','v_current'],rows:[['2026-09-24T00:00:00Z',25,-90,.1,.5,.2]]}}:{latitude:Number(url.searchParams.get('latitude')),longitude:Number(url.searchParams.get('longitude')),current:{time:'2026-09-24T00:00:00Z',wind_speed_10m:4,wind_gusts_10m:6,wind_direction_10m:90,sea_surface_temperature:25,wave_height:1,wave_direction:90,wave_period:7,swell_wave_height:.5,swell_wave_direction:90,swell_wave_period:8}}};
 });
 try{const result=await evaluateUnifiedOpportunityOceanConditionsV1({assessment,candidates:[{id:'semantic-review-location',candidateClass:'open-water',coordinates:scenario.coordinates,eligibility:{eligible:true}}],bearerToken:null,concurrency:1});const record=result.controlledEvaluation.evaluation.results[0];assert.equal(record.status,'fulfilled');return {ocean:record.value.oceanConditions,requests};}
 finally{transport.mock.restore();now.mock.restore();warn.mock.restore();}
}
export async function profiler(){const session=new Session();session.connect();const post=(method,params={})=>new Promise((resolve,reject)=>session.post(method,params,(error,value)=>error?reject(error):resolve(value)));await post('Profiler.enable');await post('Profiler.startPreciseCoverage',{callCount:true,detailed:true});return {async take(){const result=await post('Profiler.takePreciseCoverage');return result.result.filter(x=>x.url.endsWith('/backend/server.js')).flatMap(x=>x.functions);},async close(){await post('Profiler.stopPreciseCoverage');session.disconnect();}};}
export function count(coverage,phase){const start=source.indexOf('function classifyMoonPhase('),offset=source.indexOf('return "'+phase+'";',start);assert(offset>=0);return coverage.flatMap(f=>f.ranges).filter(r=>r.startOffset<=offset&&r.endOffset>offset).sort((a,b)=>(a.endOffset-a.startOffset)-(b.endOffset-b.startOffset))[0]?.count??0;}
