// Task 12B.6L: request-keyed offline producer harness. No draft-v3 imports.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getSeaSurfaceTemperaturePoint,getSstSpatialStructure,buildGovernedEnvironmentalFeatureObservationV1} from '../../server.js';
import {parsed,currentSupport} from './marineAssessorCompanionFixture.mjs';
import {composite,spatialCorpus} from './candidateSemanticFixture.mjs';

export const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'};
const server=readFileSync(new URL('../../server.js',import.meta.url),'utf8');
const bandStart=server.indexOf('function classifySeaSurfaceTemperature('),bandEnd=server.indexOf('function currentDirectionDegrees(',bandStart);
const band=new Function(server.slice(bandStart,bandEnd)+'return classifySeaSurfaceTemperature;')();
const start=server.indexOf('    const sst = {',server.indexOf('async function getOceanConditionsAtAssessment('));
const end=server.indexOf('const oceanEvidence =',start);assert(start>0&&end>start);
const assembleSst=new Function('marine','sstSpatial','governedEnvironmentalFeatureObservation','classifySeaSurfaceTemperature',server.slice(start,end)+'return sst;');
export const isolatedScenarios=[
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
  {name:'weak-axis-separation',values:[25,25,26,26.2],center:26},
  {name:'cool-center',values:[25,26,27,28],center:15},
  {name:'mild-center',values:[25,26,27,28],center:22},
  {name:'very-warm-center',values:[25,26,27,28],center:28},
  ...[1,2,3].map(count=>({name:'partial-sample-time-'+count,values:[25,26,27,28],center:26,times:[0,1,2,3].map(i=>i<count?null:'2026-09-24T00:00:00Z')})),
  {name:'hot-center',values:[25,26,27,28],center:32},
  {name:'north-dominant',values:[28,25,25,25],center:26},
  {name:'south-dominant',values:[25,25,28,25],center:26},
  {name:'east-dominant',values:[25,28,25,25],center:26},
  {name:'west-dominant',values:[25,25,25,28],center:26},
  ...['north','east','south','west'].map(role=>({name:'direction-request-rejected-'+role,values:[25,26,27,28],center:26,rejected:[role]})),
  ...[6,18,30].map(hours=>({name:'sample-age-'+hours,values:[25,26,27,28],center:26,time:new Date(Date.parse(assessment.assessmentAt)-hours*3600000).toISOString()}))
];

let runNumber=0;
const encode=value=>Object.is(value,-0)?'-0':JSON.stringify(value);
const response=payload=>({ok:true,json:async()=>payload});
// Fixed auxiliary scientific inputs, still passed through the actual parsers.
// Override only the older fixture's transport boundary, never its assemblers.
async function auxiliaryRequest(url){
  const u=new URL(url);
  if(u.hostname==='marine-api.open-meteo.com')return response({latitude:Number(u.searchParams.get('latitude')),longitude:Number(u.searchParams.get('longitude')),current:{time:'2026-09-24T00:00:00Z',sea_surface_temperature:25}});
  assert(u.hostname.endsWith('noaa.gov'));
  return response({table:{columnNames:['time','latitude','longitude','chlor_a','u_current','v_current'],rows:[['2026-09-24T00:00:00Z',25,-90,0.1,0.5,0.2]]}});
}
export async function isolatedProducerCorpus(t){
  const clock=t.mock.method(Date,'now',()=>Date.parse('2030-01-01T00:00:00Z')+(++runNumber)*86400000);
  // Keep execution time constant within a run; advance beyond cache TTL between runs.
  const executionTime=Date.now();clock.mock.mockImplementation(()=>executionTime);
  try{
    const marine=await parsed(t),support=currentSupport(marine);
    const adapter={mock:{method(object,key){assert.equal(object,globalThis);assert.equal(key,'fetch');return t.mock.method(object,key,auxiliaryRequest);}}};
    const ocean=await spatialCorpus(adapter),rows=[];
    for(const [index,scenario] of isolatedScenarios.entries()){
      const latitude=30+index,longitude=-91;let requests=0;
      const transport=t.mock.method(globalThis,'fetch',async url=>{
        const u=new URL(url);assert.equal(u.hostname,'marine-api.open-meteo.com');
        const lat=Number(u.searchParams.get('latitude')),lon=Number(u.searchParams.get('longitude'));
        const role=lat===latitude&&lon===longitude?'center':lat>latitude?'north':lat<latitude?'south':lon>longitude?'east':'west';
        const i=['north','east','south','west'].indexOf(role);
        requests++;
        if(scenario.rejected?.includes(role))throw Error('synthetic rejected directional request');
        const value=role==='center'?scenario.center:scenario.values[i];
        const time=scenario.times?scenario.times[role==='center'?0:i]:(Object.hasOwn(scenario,'time')?scenario.time:'2026-09-24T00:00:00Z');
        return {ok:true,json:async()=>JSON.parse('{"latitude":'+lat+',"longitude":'+lon+',"current":{"time":'+JSON.stringify(time)+',"sea_surface_temperature":'+encode(value)+'}}')};
      });
      try{
        for(const cacheRun of ['cold','warm']){
          const before=requests,point=await getSeaSurfaceTemperaturePoint(latitude,longitude);
          const spatial=await getSstSpatialStructure(latitude,longitude,point.temperatureFahrenheit,assessment);
          const feature=buildGovernedEnvironmentalFeatureObservationV1({spatialStructure:spatial});
          const sst=assembleSst({sst:point},spatial,feature,band);
          const current=composite({...marine,location:{latitude,longitude},sst:point},support,{ocean:{...ocean,sst}});
          rows.push({name:scenario.name,cacheRun,requests:requests-before,spatial,feature,sst,snapshot:current.observationSnapshot});
        }
      }finally{transport.mock.restore();}
    }
    return rows;
  }finally{clock.mock.restore();}
}
