// Task 12B.6O: actual exported evaluation entry, synthetic transport only.
// No historical qualification fixture or draft projection is imported.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Session} from 'node:inspector';
import {evaluateUnifiedOpportunityOceanConditionsV1} from '../../server.js';

export const assessment=Object.freeze({contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'});
// Accepted internal evaluation input, not a claim of habitat/candidate qualification.
export const candidate=Object.freeze({id:'transitive-boundary-controlled-candidate',candidateClass:'open-water',coordinates:Object.freeze([25,-90]),eligibility:Object.freeze({eligible:true})});
export const scenarios=Object.freeze([
 {id:'finite-control',mode:'finite'},
 {id:'empty-chlorophyll',mode:'empty-chlorophyll'},
 {id:'future-directional-sst',mode:'future-directional-sst'},
 {id:'rejected-directional-sst',mode:'rejected-directional-sst'},
 {id:'empty-currents',mode:'empty-currents'},
 {id:'rejected-weather',mode:'rejected-weather'},
].map(s=>Object.freeze({...s,latitude:25,longitude:-90})));
export const source=readFileSync(new URL('../../server.js',import.meta.url),'utf8');
export const sha256=v=>createHash('sha256').update(v).digest('hex');

export async function coverageSession(){
 const session=new Session();session.connect();
 const post=(name,args={})=>new Promise((resolve,reject)=>session.post(name,args,(e,r)=>e?reject(e):resolve(r)));
 await post('Profiler.enable');await post('Profiler.startPreciseCoverage',{callCount:true,detailed:true});
 return {async take(){const {result}=await post('Profiler.takePreciseCoverage');return result.filter(s=>s.url.endsWith('/backend/server.js')).flatMap(s=>s.functions);},async close(){await post('Profiler.stopPreciseCoverage');session.disconnect();}};
}

export async function runScenario(t,scenario,{clock=Date.parse('2040-01-01T00:00:00Z')}={}){
 const calls=[];
 const clockMock=t.mock.method(Date,'now',()=>clock);
 const warnings=t.mock.method(console,'warn',()=>{});
 const fetchMock=t.mock.method(globalThis,'fetch',async raw=>{
  const u=new URL(raw),weather=u.hostname==='api.open-meteo.com',marine=u.hostname==='marine-api.open-meteo.com',noaa=u.hostname.endsWith('.noaa.gov');
  assert(weather||marine||noaa,`Forbidden external-service request: ${u.hostname}`);
  const directional=marine&&u.searchParams.get('current')==='sea_surface_temperature';
  const chl=noaa&&decodeURIComponent(String(raw)).includes('chlor_a');
  calls.push({host:u.hostname,role:weather?'weather':marine?(directional?'directional-sst':'marine'):chl?'chlorophyll':'currents'});
  if((scenario.mode==='rejected-weather'&&weather)||(scenario.mode==='rejected-directional-sst'&&directional))throw Error('Controlled synthetic transport rejection');
  const current={time:directional&&scenario.mode==='future-directional-sst'?'2026-09-25T00:00:00Z':'2026-09-24T00:00:00Z',wind_speed_10m:4,wind_gusts_10m:6,wind_direction_10m:90,sea_surface_temperature:25,wave_height:1,wave_direction:90,wave_period:7,swell_wave_height:.5,swell_wave_direction:90,swell_wave_period:8};
  const missing=(chl&&scenario.mode==='empty-chlorophyll')||(!chl&&scenario.mode==='empty-currents');
  return {ok:true,json:async()=>noaa?{table:{columnNames:['time','latitude','longitude','chlor_a','u_current','v_current'],rows:missing?[]:[['2026-09-24T00:00:00Z',25,-90,.1,.5,.2]]}}:{latitude:Number(u.searchParams.get('latitude')),longitude:Number(u.searchParams.get('longitude')),current}};
 });
 try{
  // No callback override: execute the actual default producer. Null bearer
  // makes memory retrieval return before any database/Auth request.
  const result=await evaluateUnifiedOpportunityOceanConditionsV1({assessment,candidates:[candidate],bearerToken:null,concurrency:1});
  const record=result.controlledEvaluation.evaluation.results[0];
  assert.equal(record.status,'fulfilled');assert.equal(record.value.available,true);
  const ocean=record.value.oceanConditions;
  return {id:scenario.id,ocean,calls,warnings:warnings.mock.calls.map(c=>String(c.arguments[0]))};
 }finally{fetchMock.mock.restore();warnings.mock.restore();clockMock.mock.restore();}
}

// Test-only AST discovery uses the Acorn bundled in the installed Node runtime.
// This is a conservative SERVER-LOCAL reference graph, not a complete call graph:
// dynamic dispatch, imported callees and callback output contracts remain open.
export function discoverBoundary(){
 const acorn={};const parser=process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'];
 assert(parser,'Bundled parser unavailable; do not substitute regex extraction');
 new Function('exports','module',parser)(acorn,{exports:acorn});
 const ast=acorn.parse(source,{ecmaVersion:'latest',sourceType:'module',locations:true});
 const functions=new Map();
 for(const statement of ast.body){const node=statement.type==='ExportNamedDeclaration'?statement.declaration:statement;if(node?.type==='FunctionDeclaration')functions.set(node.id.name,node);}
 function walk(node,visit){if(!node||typeof node!=='object')return;visit(node);for(const [key,value]of Object.entries(node)){if(['loc','start','end'].includes(key))continue;if(Array.isArray(value))for(const child of value)walk(child,visit);else if(value&&typeof value==='object')walk(value,visit);}}
 const queue=['evaluateUnifiedOpportunityOceanConditionsV1'],seen=new Set(),nodes=[],branches=[];
 while(queue.length){const name=queue.shift();if(seen.has(name))continue;seen.add(name);const fn=functions.get(name);if(!fn)continue;
  const refs=new Set(),calls=new Set(),decisions=[];
  walk(fn.body,node=>{
   if(node.type==='Identifier'&&functions.has(node.name)&&node.name!==name)refs.add(node.name);
   if(node.type==='CallExpression')calls.add(source.slice(node.callee.start,node.callee.end));
   if(['IfStatement','ConditionalExpression','LogicalExpression','SwitchStatement','CatchClause','ChainExpression','AssignmentPattern'].includes(node.type))decisions.push(node);
  });
  // Parameter defaults can bind an injected provider to the built-in producer.
  for(const p of fn.params)walk(p,node=>{if(node.type==='Identifier'&&functions.has(node.name)&&node.name!==name)refs.add(node.name);});
  const duplicate=new Map();
  for(const node of decisions){const expression=source.slice(node.start,node.end);const fingerprint=sha256(expression.replace(/\s+/g,' ')).slice(0,16);const role=node.type;const key=role+':'+fingerprint;const ordinal=duplicate.get(key)||0;duplicate.set(key,ordinal+1);
   const predicate=node.test||node.discriminant||node;
   branches.push({id:`backend/server.js::${name}::${key}:${ordinal}`,function:name,construct:role,line:node.loc.start.line,start:node.start,end:node.end,predicate:source.slice(predicate.start,predicate.end).slice(0,600),sourceSha256:sha256(expression),disposition:'REQUIRES_FURTHER_REVIEW'});
  }
  nodes.push({id:`backend/server.js::${name}`,function:name,line:fn.loc.start.line,async:fn.async,localReferences:[...refs].sort(),callExpressions:[...calls].sort(),providerFacing:calls.has('fetchJson')||calls.has('fetch'),cacheAware:/cache/i.test(name),assessmentAware:/assessment/i.test(source.slice(fn.start,fn.body.start)),status:'DISCOVERED_NOT_TRANSITIVELY_CLOSED'});
  queue.push(...[...refs].sort());
 }
 nodes.sort((a,b)=>a.id.localeCompare(b.id));branches.sort((a,b)=>a.id.localeCompare(b.id));
 for(const node of nodes)node.callers=nodes.filter(n=>n.localReferences.includes(node.function)).map(n=>n.id);
 return {parserVersion:acorn.version,sourceSha256:sha256(source),scope:'Conservative server-local references from exported evaluation entry; NOT complete transitive semantic branch universe',nodes,branches};
}
