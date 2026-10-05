export const assessment = {contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-10-01T02:00:00.000Z'};
export function payload(u=0.5,v=0,latitude=25,longitude=-90,time='2026-10-01T00:00:00.000Z') {
  return {table:{columnNames:['time','latitude','longitude','u_current','v_current'],rows:[[time,latitude,longitude,u,v]]}};
}
export const cases = [
  {name:'normal east',body:payload()},
  ...[[1,1],[-1,1],[-1,-1],[1,-1],[0,0],[-0,0],[0,-0],[-0,-0],[0.128601,0.333333],[0.00004,-0.00004],[1e308,1e308]].map(([u,v],i)=>({name:'vectors '+i,body:payload(u,v)})),
  ...[null,'',undefined,'0.512345','bad',{},false].map((u,i)=>({name:'missing and numeric '+i,body:payload(u,0.2)})),
  ...[[90,360],[-90,-180],[0,180],[0,181],[-0,-0],[91,361],['25','270']].map(([lat,lon],i)=>({name:'provider coordinates '+i,body:payload(0.5,0,lat,lon)})),
  {name:'missing body',body:null}, {name:'empty table',body:{table:{columnNames:[],rows:[]}}},
  {name:'missing columns',body:{table:{rows:[[1]]}}},
  {name:'bad columns',body:{table:{columnNames:'bad',rows:[[1]]}}},
  {name:'missing vector columns',body:{table:{columnNames:['time','latitude','longitude'],rows:[['2026-10-01T00:00:00.000Z',25,-90]]}}},
  {name:'null row',body:{table:{columnNames:['u_current'],rows:[null]}}},
  {name:'short row',body:{table:{columnNames:['time','latitude','longitude','u_current','v_current'],rows:[[]]}}},
  {name:'first row only',body:{table:{...payload().table,rows:[payload().table.rows[0],payload(2,2).table.rows[0]]}}},
  {name:'future observation',body:payload(1,1,25,-90,'2026-10-02T00:00:00.000Z')},
  {name:'invalid observation',body:payload(1,1,25,-90,'invalid')},
  {name:'absent observation',body:payload(1,1,25,-90,null)},
  {name:'requested edge and signed zero',latitude:-0,longitude:180,body:payload()},
  {name:'transport error',error:{message:'fixture transport failed',code:'FIXTURE_FAILURE'}},
  {name:'abort transport',error:{message:'fixture abort',name:'AbortError'}}
];
export function exactValues(value) {
  if(typeof value==='number' && (Object.is(value,-0)||!Number.isFinite(value))) return {$number:Object.is(value,-0)?'-0':String(value)};
  if(value===undefined)return {$undefined:true};
  if(Array.isArray(value))return value.map(exactValues);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,exactValues(v)]));
  return value;
}
// Characterization harness only: restore global transport in finally, execute serially.
export async function characterize(acquire,encode,version,fixture) {
  const saved=globalThis.fetch,urls=[];
  globalThis.fetch=async url=>{
    urls.push(String(url));
    if(fixture.error)throw Object.assign(new Error(fixture.error.message),fixture.error);
    return {ok:true,json:async()=>structuredClone(fixture.body)};
  };
  try {
    const point=await acquire(fixture.latitude??25,fixture.longitude??-90,assessment);
    let evidence;
    try {evidence=encode(point,version);}catch(error){evidence={error:{name:error.name,message:error.message}};}
    return exactValues({urls,point,evidence});
  } catch(error) {return exactValues({urls,error:{name:error.name,message:error.message,code:error.code}});}
  finally {globalThis.fetch=saved;}
}
