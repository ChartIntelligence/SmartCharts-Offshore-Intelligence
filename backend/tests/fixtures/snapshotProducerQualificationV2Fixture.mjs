// New Task 12B.6M harness. No imports from failed qualification or draft projection.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getSeaSurfaceTemperaturePoint,getSstSpatialStructure,buildGovernedEnvironmentalFeatureObservationV1} from '../../server.js';
import {parsed,currentSupport} from './marineAssessorCompanionFixture.mjs';
import {composite,spatialCorpus} from './candidateSemanticFixture.mjs';

export const assessment=Object.freeze({contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'});
export const source=readFileSync(new URL('../../server.js',import.meta.url),'utf8');
function section(start,end){const a=source.indexOf(start),b=source.indexOf(end,a+start.length);assert(a>=0&&b>a);return source.slice(a,b);}
const band=new Function(section('function classifySeaSurfaceTemperature(','function currentDirectionDegrees(')+';return classifySeaSurfaceTemperature;')();
const pointSource=section('function createSstSpatialSamplePoints(','export async function getSeaSurfaceTemperaturePoint(');
const radius=Number(source.match(/const SST_SPATIAL_SAMPLE_RADIUS_NM\s*=\s*(\d+)/)[1]);
const samplePoints=new Function('SST_SPATIAL_SAMPLE_RADIUS_NM',pointSource+';return createSstSpatialSamplePoints;')(radius);
const route=source.indexOf('async function getOceanConditionsAtAssessment(');
const sstStart=source.indexOf('    const sst = {',route),sstEnd=source.indexOf('const oceanEvidence =',sstStart);
assert(sstStart>route&&sstEnd>sstStart);
const assembleSst=new Function('marine','sstSpatial','governedEnvironmentalFeatureObservation','classifySeaSurfaceTemperature',source.slice(sstStart,sstEnd)+';return sst;');

const definitions=[];
function add(id,values,center=25,extra={}){
 definitions.push(Object.freeze({id,coordinates:Object.freeze({latitude:25,longitude:-91}),values:Object.freeze(values),center,
  time:'2026-09-24T00:00:00Z',purpose:id,expectedBranchFamilies:['SST sampling','temperature evidence','snapshot carry-forward'],...extra}));
}
for(let mask=0;mask<16;mask++)add('availability-'+mask,[25,26,27,28].map((v,direction)=>mask&(1<<direction)?v:null));
add('all-missing',[null,null,null,null],null);
add('center-missing',[25,26,27,28],null);
add('uniform',[25,25,25,25]);
add('positive-zero',[0,0,0,0],0);
add('negative-zero',[-0,-0,-0,-0],-0);
add('mixed-zero',[-0,0,-0,0],0);
add('missing-time',[25,26,27,28],25,{time:null});
add('weak-axis-demonstrated',[25,25,26,26.2],26);
add('partial-low-driver-demonstrated',[25,25,null,25.2]);
add('symmetric-range-no-direction',[25,28,25,28]);
for(const direction of ['north','east','south','west'])add('rejected-'+direction,[25,26,27,28],25,{rejected:[direction]});
for(const count of [1,2,3])add('missing-times-'+count,[25,26,27,28],25,{times:[0,1,2,3].map(role=>role<count?null:'2026-09-24T00:00:00Z')});
add('mixed-times',[25,26,27,28],25,{times:['2026-09-24T00:00:00Z','2026-09-23T23:00:00Z','2026-09-24T00:00:00Z','2026-09-24T00:00:00Z']});
// Inputs are C values; the current converter/assembler alone establishes rounded F outcomes.
// These decimal grids bracket the source's 0.2/0.3/0.5/1/2 F thresholds; no tolerance is used.
for(const delta of [0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5,0.55,0.6,1.05,1.1,1.15,1.2]){
 add('range-north-'+delta,[25+delta,25,25,25]);
 add('range-east-'+delta,[25,25+delta,25,25]);
 add('partial-range-'+delta,[25,25,null,25+delta]);
 add('axis-separation-'+delta,[25,25,26,26+delta],26);
}
for(const c of [19.9,20,20.1,23.8,23.88888888888889,24,26.6,26.666666666666668,26.7,29.4,29.444444444444443,29.5])add('center-band-'+c,[25,26,27,28],c);
for(const hours of [0,2.9,3,3.1,11.9,12,12.1,23.9,24,24.1,30])add('age-'+hours,[25,26,27,28],25,{time:new Date(Date.parse(assessment.assessmentAt)-hours*3600000).toISOString()});
add('score-44',[25.1111111111,25,25,25.2222222222],25,{time:'2026-09-23T19:00:00Z'});
add('score-46',[25,25,25,25],25.6666666667,{time:'2026-09-23T07:00:00Z'});
add('score-74',[25.4444444444,25,25,25.7777777778],25,{time:'2026-09-23T07:00:00Z'});
add('score-76',[25.6111111111,25,25,25.7777777778]);
export const scenarios=Object.freeze(definitions);
assert.equal(new Set(scenarios.map(x=>x.id)).size,scenarios.length);

let executionTick=0;
const response=payload=>({ok:true,json:async()=>structuredClone(payload)});
async function auxiliaryTransport(url){
 const u=new URL(url);
 if(u.hostname==='marine-api.open-meteo.com')return response({latitude:Number(u.searchParams.get('latitude')),longitude:Number(u.searchParams.get('longitude')),current:{time:'2026-09-24T00:00:00Z',sea_surface_temperature:25}});
 assert(u.hostname.endsWith('noaa.gov'));
 return response({table:{columnNames:['time','latitude','longitude','chlor_a','u_current','v_current'],rows:[['2026-09-24T00:00:00Z',25,-90,0.1,0.5,0.2]]}});
}

export async function createHarness(t){
 // This clock has no role in assessment or represented time. It only controls existing caches.
 let executionTime=Date.parse('2031-01-01T00:00:00Z')+(++executionTick)*86400000;
 const clock=t.mock.method(Date,'now',()=>executionTime);
 try {
  const marine=await parsed(t),support=currentSupport(marine);
  const adapter={mock:{method(object,key){assert.equal(object,globalThis);assert.equal(key,'fetch');return t.mock.method(object,key,auxiliaryTransport);}}};
  const ocean=await spatialCorpus(adapter);
  return {
   close(){clock.mock.restore();},
   async run(scenario,{mode='both',reverseRequestSetup=false,irrelevantRequest=false}={}){
    assert(['both','cold','warm','warm-first','concurrent'].includes(mode));
    executionTime=Date.parse('2031-01-01T00:00:00Z')+(++executionTick)*86400000;
    const {latitude,longitude}=scenario.coordinates;
    const points=[{direction:'center',latitude,longitude},...samplePoints(latitude,longitude)];
    const key=p=>String(p.latitude)+'/'+String(p.longitude);
    const setup=reverseRequestSetup?[...points].reverse():points;
    const byRequest=new Map(setup.map(point=>[key(point),point.direction]));
    let requests=0;
    const requestKeys=[];
    const transport=t.mock.method(globalThis,'fetch',async url=>{
     const u=new URL(url);assert.equal(u.hostname,'marine-api.open-meteo.com');
     const requested={latitude:Number(u.searchParams.get('latitude')),longitude:Number(u.searchParams.get('longitude'))};
     const direction=byRequest.get(key(requested));assert(direction,'Unexpected semantic request');
     const role=['north','east','south','west'].indexOf(direction);
     requests++;requestKeys.push(key(requested));
     if(scenario.rejected?.includes(direction))throw Error('controlled rejected '+direction);
     const value=direction==='center'?scenario.center:scenario.values[role];
     const time=scenario.times?scenario.times[direction==='center'?0:role]:scenario.time;
     return response({...requested,current:{time,sea_surface_temperature:value}});
    });
    try {
     if(irrelevantRequest)await getSeaSurfaceTemperaturePoint(latitude,longitude);
     async function produce(cacheState){
      const before=requests;
      const point=await getSeaSurfaceTemperaturePoint(latitude,longitude);
      const spatial=await getSstSpatialStructure(latitude,longitude,point.temperatureFahrenheit,assessment);
      const feature=buildGovernedEnvironmentalFeatureObservationV1({spatialStructure:spatial});
      const sst=assembleSst({sst:point},spatial,feature,band);
      const candidate=composite({...marine,location:{latitude,longitude},sst:point},support,{ocean:{...ocean,sst}});
      return {id:scenario.id,cacheState,requests:requests-before,requestKeys:requestKeys.slice(before),spatial,feature,snapshot:candidate.observationSnapshot};
     }
     if(mode==='concurrent')return await Promise.all([produce('concurrent-first'),produce('concurrent-second')]);
     const cold=await produce('cold');
     if(mode==='cold')return [cold];
     const warm=await produce('warm');
     // warm-first means explicitly prime, then publish the cache-hit observation first.
     return mode==='both'?[cold,warm]:[warm];
    }finally{transport.mock.restore();}
   }
  };
 } catch(error){clock.mock.restore();throw error;}
}

export async function produceCases(t,cases=scenarios,options={}){
 const harness=await createHarness(t),rows=[];
 try{for(const scenario of cases)rows.push(...await harness.run(scenario,options));return rows;}finally{harness.close();}
}
