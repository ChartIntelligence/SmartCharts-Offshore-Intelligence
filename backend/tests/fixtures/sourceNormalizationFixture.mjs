// Synthetic transport through unchanged production parsers. No provider callback injection.
import assert from 'node:assert/strict';
import {getMarineConditions,getChlorophyllConditions,getGapFilledChlorophyllConditions,getCurrentConditionsPoint,getSstSpatialStructure} from '../../server.js';
export const assessment=Object.freeze({contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'});
export const states=[['positive',2],['negative',-2],['positive-zero',0],['negative-zero',-0],['null',null],['missing',undefined],['undefined',undefined],['empty-string',''],['whitespace','  '],['numeric-string','2'],['nan',NaN],['infinity',Infinity],['negative-infinity',-Infinity],['malformed','bad'],['object',{}],['array',[]],['boolean',false],['numeric-array',[2]]];
export const fields=[
 ...[['wind_speed_10m','wind.speedKnots','knots'],['wind_gusts_10m','wind.gustKnots','knots'],['wind_direction_10m','wind.directionDegrees','safe'],['wave_height','waves.heightFeet','feet'],['wave_direction','waves.directionDegrees','safe'],['wave_period','waves.periodSeconds','safe'],['swell_wave_height','swell.heightFeet','feet'],['swell_wave_direction','swell.directionDegrees','safe'],['swell_wave_period','swell.periodSeconds','safe'],['sea_surface_temperature','sst.temperatureCelsius','strict']].map(([key,path,conversion])=>({id:'marine:'+key,parser:'marine',key,path,conversion,transportPath:'current.'+key})),
 ...['direct','gap'].map(parser=>({id:parser+':chlor_a',parser,key:'chlor_a',path:'concentrationMgM3',conversion:'safe-rounded',transportPath:'table.rows[0][columnNames.indexOf(chlor_a)]'})),
 ...[['u_current','eastwardMetersPerSecond'],['v_current','northwardMetersPerSecond']].map(([key,path])=>({id:'current:'+key,parser:'current',key,path,conversion:'safe-rounded',transportPath:'table.rows[0][columnNames.indexOf('+key+')]'})),
 {id:'sst:directional',parser:'sst',key:'sea_surface_temperature',path:'samples.0.temperatureCelsius',conversion:'strict',transportPath:'current.sea_surface_temperature'},
 ...['marine','direct','gap','current','sst'].flatMap(parser=>['latitude','longitude'].map(key=>({id:parser+':'+key,parser,key,path:(parser==='marine'?'sst.':parser==='sst'?'samples.0.providerCoordinates.':'')+(key==='latitude'?'resolvedLatitude':'resolvedLongitude'),conversion:'coordinate',transportPath:['marine','sst'].includes(parser)?key:'table.rows[0][columnNames.indexOf('+key+')]'})))
];
export const get=(o,path)=>path.split('.').reduce((v,k)=>v?.[k],o);
export const encode=v=>v===undefined?{type:'UNDEFINED'}:typeof v==='number'?(Object.is(v,-0)?{type:'NUMBER',value:'-0'}:Number.isFinite(v)?{type:'NUMBER',value:v}:{type:'NONFINITE',value:String(v)}):{type:v===null?'NULL':Array.isArray(v)?'ARRAY':typeof v==='object'?'OBJECT':typeof v,value:v};
export function representation(name){return ['undefined','nan','infinity','negative-infinity','getter','inherited'].includes(name)?'INTERNAL_ONLY':'TRANSPORT_REPRESENTABLE';}
function wireClone(x){return JSON.parse(JSON.stringify(x,(_k,v)=>Object.is(v,-0)?'__NEGATIVE_ZERO__':v).replaceAll('"__NEGATIVE_ZERO__"','-0'));}
let executionClock=Date.parse('2500-01-01');
export async function parse(t,field,name,value,{allMissing=false,empty=false,reject=false,privateMetadata=false,rowOverrides={}}={}){
 let getterCalls=0;const requests=[];const clock=t.mock.method(Date,'now',()=>executionClock);executionClock+=86400000;
 const fetch=t.mock.method(globalThis,'fetch',async input=>{
  const u=new URL(input);assert(['api.open-meteo.com','marine-api.open-meteo.com','coastwatch.noaa.gov','coastwatch.pfeg.noaa.gov'].includes(u.hostname),'Forbidden endpoint');requests.push(u.hostname);
  if(reject)throw Error('Synthetic transport rejection');
  const weather=u.hostname==='api.open-meteo.com',noaa=u.hostname.endsWith('.noaa.gov');
  let payload=noaa?{table:{columnNames:['time','latitude','longitude','chlor_a','u_current','v_current'],rows:empty?[]:[['2026-09-24T00:00:00Z',25,-90,.1,.5,.2]]}}:{latitude:25,longitude:-90,current:{time:'2026-09-24T00:00:00Z',...(allMissing?{}:{wind_speed_10m:4,wind_gusts_10m:6,wind_direction_10m:90,wave_height:1,wave_direction:90,wave_period:7,swell_wave_height:.5,swell_wave_direction:90,swell_wave_period:8,sea_surface_temperature:25})}};
  const applies=noaa||field.parser==='sst'||(field.key.startsWith('wind_')?weather:!weather);
  if(applies&&!empty){let target,key;
   if(noaa){const index=payload.table.columnNames.indexOf(field.key);target=payload.table.rows[0];key=index;if(name==='missing')payload.table.columnNames[index]='omitted-column';}
   else{target=['latitude','longitude'].includes(field.key)?payload:payload.current;key=field.key;}
   if(name==='missing')delete target[key];
   else if(name==='undefined')target[key]=undefined;
   else if(name==='getter')Object.defineProperty(target,key,{enumerable:true,get(){getterCalls++;return 2;}});
   else if(name==='inherited'){delete target[key];Object.setPrototypeOf(target,{[key]:2});}
   else target[key]=value;
  }
  if(noaa&&!empty)for(const [k,v] of Object.entries(rowOverrides))payload.table.rows[0][payload.table.columnNames.indexOf(k)]=v;
  if(privateMetadata)payload.captainSecret='PRIVATE_SENTINEL';
  if(representation(name)==='TRANSPORT_REPRESENTABLE')payload=wireClone(payload);
  return {ok:true,json:async()=>payload};
 });
 const warn=t.mock.method(console,'warn',()=>{}),error=t.mock.method(console,'error',()=>{});
 try{let result;if(field.parser==='marine')result=await getMarineConditions(25,-90);else if(field.parser==='sst')result=await getSstSpatialStructure(25,-90,25,assessment);else result=await ({direct:getChlorophyllConditions,gap:getGapFilledChlorophyllConditions,current:getCurrentConditionsPoint}[field.parser])(25,-90,assessment);return {result,value:get(result,field.path),getterCalls,requests};}
 finally{fetch.mock.restore();warn.mock.restore();error.mock.restore();clock.mock.restore();}
}
