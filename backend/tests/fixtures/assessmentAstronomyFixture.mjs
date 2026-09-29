import assert from 'node:assert/strict';
import {Session} from 'node:inspector';
import {readFileSync} from 'node:fs';
import {evaluateUnifiedOpportunityOceanConditionsV1} from '../../server.js';
export const source=readFileSync(new URL('../../server.js',import.meta.url),'utf8');
export const instants=['2026-09-26T01:00:00Z','2026-10-03T01:00:00Z'];
export async function runDefault(t,{assessmentAt=instants[0],contractVersion='pelora-scientific-assessment-v1',assessmentOmitted=false,coordinates=[25,-90],candidateId='astronomy-synthetic',extras={},sourceTime='2026-09-24T00:00:00Z',clock=Date.parse('2100-01-01'),trace={requests:[],clocks:[]}}={}){
 const now=t.mock.method(Date,'now',()=>{const stack=new Error().stack;trace.clocks.push(stack);return clock+trace.clocks.length-1;}),warn=t.mock.method(console,'warn',()=>{});
 const transport=t.mock.method(globalThis,'fetch',async input=>{const url=new URL(input),weather=url.hostname==='api.open-meteo.com',marine=url.hostname==='marine-api.open-meteo.com',noaa=url.hostname.endsWith('.noaa.gov');assert(weather||marine||noaa,'Forbidden service target');trace.requests.push(String(url));return {ok:true,json:async()=>noaa?{table:{columnNames:['time','latitude','longitude','chlor_a','u_current','v_current'],rows:[[sourceTime,25,-90,.1,.5,.2]]}}:{latitude:25,longitude:-90,current:{time:sourceTime,wind_speed_10m:4,wind_gusts_10m:6,wind_direction_10m:90,sea_surface_temperature:25,wave_height:1,wave_direction:90,wave_period:7,swell_wave_height:.5,swell_wave_direction:90,swell_wave_period:8}}};});
 try{const result=await evaluateUnifiedOpportunityOceanConditionsV1({...extras,...(!assessmentOmitted?{assessment:{contractVersion,assessmentAt}}:{}),candidates:[{...extras.candidate,id:candidateId,candidateClass:'open-water',coordinates,eligibility:{eligible:true}}],bearerToken:null,concurrency:1});const record=result.controlledEvaluation.evaluation.results[0];assert.equal(record.status,'fulfilled');return {ocean:record.value.oceanConditions,result,trace};}
 finally{transport.mock.restore();now.mock.restore();warn.mock.restore();}
}
export function differences(a,b,path=''){
 if(Object.is(a,b))return [];if(a===null||b===null||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return [{path,left:a,right:b}];
 const result=[];for(const k of [...new Set([...Object.keys(a),...Object.keys(b)])].sort()){const p=path+'/'+k;if(Object.hasOwn(a,k)!==Object.hasOwn(b,k))result.push({path:p,leftPresent:Object.hasOwn(a,k),rightPresent:Object.hasOwn(b,k)});else result.push(...differences(a[k],b[k],p));}return result;
}
export async function profiler(){const session=new Session();session.connect();const post=(method,params={})=>new Promise((resolve,reject)=>session.post(method,params,(error,value)=>error?reject(error):resolve(value)));await post('Profiler.enable');await post('Profiler.startPreciseCoverage',{callCount:true,detailed:true});return {async take(){const r=await post('Profiler.takePreciseCoverage');return r.result.filter(x=>x.url.endsWith('/backend/server.js')).flatMap(x=>x.functions);},async close(){await post('Profiler.stopPreciseCoverage');session.disconnect();}};}
export function phaseCount(coverage,label){const start=source.indexOf('function classifyMoonPhase('),offset=source.indexOf('return "'+label+'";',start);assert(offset>=0);return coverage.flatMap(f=>f.ranges).filter(r=>r.startOffset<=offset&&r.endOffset>offset).sort((a,b)=>(a.endOffset-a.startOffset)-(b.endOffset-b.startOffset))[0]?.count??0;}
