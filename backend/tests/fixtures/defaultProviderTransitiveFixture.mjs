import assert from 'node:assert/strict';
import {evaluateUnifiedOpportunityOceanConditionsV1} from '../../server.js';
export const assessment=Object.freeze({contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'});
// Every request is keyed by endpoint and coordinates; no ordinal or list-index semantics.
export async function runDefault(t,{mode='complete',clock=Date.parse('2050-01-01'),coordinates=[25,-90]}={}){
 const requests=[];const now=t.mock.method(Date,'now',()=>clock),warn=t.mock.method(console,'warn',()=>{});
 const transport=t.mock.method(globalThis,'fetch',async input=>{
  const url=new URL(input),weather=url.hostname==='api.open-meteo.com',marine=url.hostname==='marine-api.open-meteo.com',noaa=url.hostname.endsWith('.noaa.gov');
  assert(weather||marine||noaa,'Non-environmental endpoint forbidden');
  const directional=marine&&url.searchParams.get('current')==='sea_surface_temperature',chl=noaa&&decodeURIComponent(String(input)).includes('chlor_a');
  const role=weather?'weather':marine?(directional?'directional-sst':'marine'):chl?'chlorophyll':'currents'; requests.push({role,url:String(url)});
  if((mode==='rejected-weather'&&weather)||(mode==='rejected-sst'&&directional))throw Error('Synthetic request rejection');
  const empty=(mode==='empty-chlorophyll'&&chl)||(mode==='empty-currents'&&noaa&&!chl);
  return {ok:true,json:async()=>noaa?{table:{columnNames:['time','latitude','longitude','chlor_a','u_current','v_current'],rows:empty?[]:[['2026-09-24T00:00:00Z',coordinates[0],coordinates[1],.1,.5,.2]]}}:{latitude:Number(url.searchParams.get('latitude')),longitude:Number(url.searchParams.get('longitude')),current:{time:directional&&mode==='future-sst'?'2026-09-25T00:00:00Z':'2026-09-24T00:00:00Z',wind_speed_10m:4,wind_gusts_10m:6,wind_direction_10m:90,sea_surface_temperature:25,wave_height:1,wave_direction:90,wave_period:7,swell_wave_height:.5,swell_wave_direction:90,swell_wave_period:8}}};
 });
 try{const result=await evaluateUnifiedOpportunityOceanConditionsV1({assessment,candidates:[{id:'default-transitive',candidateClass:'open-water',coordinates,eligibility:{eligible:true}}],bearerToken:null,concurrency:1}); const record=result.controlledEvaluation.evaluation.results[0]; assert.equal(record.status,'fulfilled');return {result,leaf:record.value,ocean:record.value.oceanConditions,requests};}
 finally{transport.mock.restore();now.mock.restore();warn.mock.restore();}
}
export function differences(a,b,path=''){
 if(Object.is(a,b))return [];
 if(a===null||b===null||typeof a!=='object'||typeof b!=='object')return [{path,left:a,right:b}];
 if(Array.isArray(a)!==Array.isArray(b))return [{path,left:a,right:b}];
 const result=Array.isArray(a)&&a.length!==b.length?[{path:path+'/length',left:a.length,right:b.length}]:[];
 for(const k of [...new Set([...Object.keys(a),...Object.keys(b)])].sort()){
  if(Object.hasOwn(a,k)!==Object.hasOwn(b,k))result.push({path:path+'/'+k,leftPresent:Object.hasOwn(a,k),rightPresent:Object.hasOwn(b,k)});
  else result.push(...differences(a[k],b[k],path+'/'+k));
 }
 return result;
}
