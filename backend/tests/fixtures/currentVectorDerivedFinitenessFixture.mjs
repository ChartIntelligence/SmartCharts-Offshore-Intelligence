import assert from 'node:assert/strict';
import {getCurrentConditionsPoint,getCurrentSpatialStructure,buildCurrentVectorProjectionAnalysis,
  buildCurrentGradientAnalysis,buildCurrentShearAnalysis} from '../../server.js';
import {assessment} from './sourceNormalizationFixture.mjs';
export {nonfinitePaths} from './crossRouteFinitenessFixture.mjs';
let clock=Date.parse('2700-01-01');
export async function runCurrent(t,values){
 const requests=[];const now=t.mock.method(Date,'now',()=>clock);clock+=86400000;
 const fetch=t.mock.method(globalThis,'fetch',async input=>{
  const url=new URL(input);assert.equal(url.hostname,'coastwatch.noaa.gov');
  const coordinates=[...decodeURIComponent(url.search).matchAll(/\[\(([-\d.]+)\)\]/g)].map(x=>Number(x[1]));
  const [latitude,longitude]=coordinates;
  const role=latitude>25?'north':latitude<25?'south':longitude>-90?'east':longitude<-90?'west':'center';
  const [u,v]=values[role]??values.all;requests.push({role,latitude,longitude,u,v});
  const text=JSON.stringify({table:{columnNames:['time','latitude','longitude','u_current','v_current'],
   rows:[['2026-09-24T00:00:00Z',latitude,longitude,u,v]]}},(_k,x)=>Object.is(x,-0)?'__minuszero__':x).replaceAll('"__minuszero__"','-0');
  return {ok:true,json:async()=>JSON.parse(text)};
 });
 try{
  const point=await getCurrentConditionsPoint(25,-90,assessment);
  const spatial=await getCurrentSpatialStructure(25,-90,assessment);
  const projection=buildCurrentVectorProjectionAnalysis(spatial);
  const gradient=buildCurrentGradientAnalysis(projection);
  const shear=buildCurrentShearAnalysis(gradient);
  return {requests,point,spatial,projection,gradient,shear};
 }finally{fetch.mock.restore();now.mock.restore();}
}
