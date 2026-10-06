import {existingDeclaration, declarationSource} from './sourceDeclarationFixture.mjs';
// Offline producer inventory only. No candidate reconstruction or species evaluation.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getSeaSurfaceTemperaturePoint,getSstSpatialStructure,buildGovernedEnvironmentalFeatureObservationV1} from '../../server.js';
import {parsed,currentSupport} from './marineAssessorCompanionFixture.mjs';
import {composite,spatialCorpus} from './candidateSemanticFixture.mjs';

export const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'};
const server=readFileSync(new URL('../../server.js',import.meta.url),'utf8');
const band=existingDeclaration(server,'classifySeaSurfaceTemperature');
// CP-09B P1: same source body now owned by the pure center-assembly helper.
const assembleSst=new Function("classifySeaSurfaceTemperature", declarationSource(server, "buildSstConditionsFromRetainedSpatialV1")+";return buildSstConditionsFromRetainedSpatialV1;")(band);
export const scenarios=[
  ...Array.from({length:16},(_,mask)=>({name:'direction-mask-'+mask,values:[25,26,27,28].map((x,i)=>mask&(1<<i)?x:null),center:26})),
  {name:'center-and-directions-missing',values:[null,null,null,null],center:null},
  {name:'center-missing-directions-present',values:[25,26,27,28],center:null},
  {name:'uniform',values:[25,25,25,25],center:25},
  {name:'positive-zero',values:[0,0,0,0],center:0},
  {name:'negative-zero',values:[-0,-0,-0,-0],center:-0},
  {name:'mixed-signed-zero',values:[-0,0,-0,0],center:0},
  {name:'missing-time',values:[25,26,27,28],center:26,time:null},
  {name:'weak-range',values:[25,25.2,25.4,25.1],center:25.2},
  {name:'moderate-range',values:[25,25.5,26,25.1],center:25.5},
  {name:'mixed-represented-times',values:[25,26,27,28],center:26,times:['2026-09-24T00:00:00Z','2026-09-23T23:00:00Z','2026-09-24T00:00:00Z','2026-09-24T00:00:00Z']},
  ...[6,18,30].map(hours=>({name:'sample-age-'+hours,values:[25,26,27,28],center:26,time:new Date(Date.parse(assessment.assessmentAt)-hours*3600000).toISOString()}))
];
export async function producerCorpus(t){
  const marine=await parsed(t),support=currentSupport(marine),ocean=await spatialCorpus(t),rows=[];
  for(const [index,scenario] of scenarios.entries()){
    const latitude=30+index,longitude=-91;let n=0;
    const mock=t.mock.method(globalThis,'fetch',async url=>{
      const u=new URL(url);assert.equal(u.hostname,'marine-api.open-meteo.com');
      const lat=Number(u.searchParams.get('latitude')),lon=Number(u.searchParams.get('longitude'));
      const center=lat===latitude&&lon===longitude;
      const i=center?0:n++,value=center?scenario.center:scenario.values[i];
      const time=scenario.times?.[i]??(Object.hasOwn(scenario,'time')?scenario.time:'2026-09-24T00:00:00Z');
      const text='{"latitude":'+lat+',"longitude":'+lon+',"current":{"time":'+JSON.stringify(time)+',"sea_surface_temperature":'+(Object.is(value,-0)?'-0':JSON.stringify(value))+'}}';
      return {ok:true,json:async()=>JSON.parse(text)};
    });
    try{
      const point=await getSeaSurfaceTemperaturePoint(latitude,longitude);
      const spatial=await getSstSpatialStructure(latitude,longitude,point.temperatureFahrenheit,assessment);
      const feature=buildGovernedEnvironmentalFeatureObservationV1({spatialStructure:spatial});
      const sst=assembleSst({sst:point},spatial,feature,band);
      // Explicit non-SST auxiliary inputs remain fixed. The entire emitted
      // observationSnapshot is inventoried, including evidence and metadata.
      const current=composite({...marine,location:{latitude,longitude},sst:point},support,{ocean:{...ocean,sst}});
      rows.push({name:scenario.name,spatial,feature,sst,snapshot:current.observationSnapshot});
    }finally{mock.mock.restore();}
  }
  return rows;
}
