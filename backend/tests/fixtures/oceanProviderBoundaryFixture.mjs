// Task 12B.6P independent synthetic transport, actual default evaluator.
import assert from 'node:assert/strict';
import {evaluateUnifiedOpportunityOceanConditionsV1} from '../../server.js';
export const assessment=Object.freeze({contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'});
export const candidate=Object.freeze({id:'provider-boundary-synthetic',candidateClass:'open-water',coordinates:Object.freeze([25,-90]),eligibility:Object.freeze({eligible:true})});
export const modes=['complete','empty-chlorophyll','future-sst','rejected-sst','empty-currents','rejected-weather'];
export async function actualDefault(t,mode='complete',clock=Date.parse('2045-01-01T00:00:00Z')){
 const requests=[];const now=t.mock.method(Date,'now',()=>clock),warn=t.mock.method(console,'warn',()=>{});
 const transport=t.mock.method(globalThis,'fetch',async input=>{
  const url=new URL(input),weather=url.hostname==='api.open-meteo.com',marine=url.hostname==='marine-api.open-meteo.com',noaa=url.hostname.endsWith('.noaa.gov');
  assert(weather||marine||noaa,'Forbidden remote-service target');
  const directional=marine&&url.searchParams.get('current')==='sea_surface_temperature',chlorophyll=noaa&&decodeURIComponent(String(input)).includes('chlor_a');
  requests.push({host:url.hostname,role:weather?'weather':marine?(directional?'directional-sst':'marine'):chlorophyll?'chlorophyll':'currents'});
  if((mode==='rejected-weather'&&weather)||(mode==='rejected-sst'&&directional))throw Error('Synthetic acquisition rejection');
  const missing=(mode==='empty-chlorophyll'&&chlorophyll)||(mode==='empty-currents'&&noaa&&!chlorophyll);
  return {ok:true,json:async()=>noaa?{table:{columnNames:['time','latitude','longitude','chlor_a','u_current','v_current'],rows:missing?[]:[['2026-09-24T00:00:00Z',25,-90,.1,.5,.2]]}}:{latitude:Number(url.searchParams.get('latitude')),longitude:Number(url.searchParams.get('longitude')),current:{time:directional&&mode==='future-sst'?'2026-09-25T00:00:00Z':'2026-09-24T00:00:00Z',wind_speed_10m:4,wind_gusts_10m:6,wind_direction_10m:90,sea_surface_temperature:25,wave_height:1,wave_direction:90,wave_period:7,swell_wave_height:.5,swell_wave_direction:90,swell_wave_period:8}}};
 });
 try{const result=await evaluateUnifiedOpportunityOceanConditionsV1({assessment,candidates:[candidate],bearerToken:null,concurrency:1});const record=result.controlledEvaluation.evaluation.results[0];assert.equal(record.status,'fulfilled');return {result,ocean:record.value.oceanConditions,requests};}
 finally{transport.mock.restore();now.mock.restore();warn.mock.restore();}
}
export async function injected(value,extra={}){return evaluateUnifiedOpportunityOceanConditionsV1({assessment,candidates:[candidate],oceanConditionsProvider:async()=>value,...extra});}
export function observation(result){const e=result.controlledEvaluation.evaluation;const r=e.results[0];return {status:r.status,leafAvailable:r.value?.available??null,wrapperAvailable:result.available,successful:e.successfulCandidateCount,failed:e.failedCandidateCount};}
export function inventory(outputs){
 const paths=new Map(),universe=[...new Set(outputs.map(x=>x.id))].sort();
 function walk(value,path,id){const shape=value===null?'NULL':Array.isArray(value)?'ARRAY':typeof value==='object'?'OBJECT':typeof value==='number'?(Object.is(value,-0)?'NUMBER_NEGATIVE_ZERO':value===0?'NUMBER_POSITIVE_ZERO':Number.isFinite(value)?'NUMBER_FINITE':'NUMBER_NONFINITE'):typeof value==='string'?'STRING':typeof value==='boolean'?'BOOLEAN':typeof value;
  const entry=paths.get(path)||{path,shapes:new Set(),scenarios:new Set()};entry.shapes.add(shape);entry.scenarios.add(id);paths.set(path,entry);
  if(value&&typeof value==='object')for(const key of Object.keys(value).sort())walk(value[key],path+'/'+key.replaceAll('~','~0').replaceAll('/','~1'),id);
 }
 for(const x of outputs)walk(x.ocean,'',x.id);
 return [...paths.values()].sort((a,b)=>a.path.localeCompare(b.path)).map(p=>({path:p.path,shapes:[...p.shapes].sort(),present:[...p.scenarios].sort(),absent:universe.filter(id=>!p.scenarios.has(id)),consumer:'IGNORED_BY_TRANSPARENT_EVALUATION_WRAPPER',downstreamAuthority:'NOT_INFERRED'}));
}
