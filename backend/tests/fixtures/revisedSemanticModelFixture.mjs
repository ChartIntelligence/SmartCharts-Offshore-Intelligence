import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Session} from 'node:inspector';
import assert from 'node:assert/strict';
import {evaluateUnifiedOpportunityOceanConditionsV1} from '../../server.js';
export const sha=x=>createHash('sha256').update(x).digest('hex');
export const read=p=>readFileSync(new URL('../../../'+p,import.meta.url),'utf8');
export const source=read('backend/server.js');
const acorn={};new Function('exports','module',process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'])(acorn,{exports:acorn});
function walk(n,f){if(!n||typeof n!=='object')return;f(n);for(const[k,v]of Object.entries(n)){if(['loc','start','end'].includes(k))continue;if(Array.isArray(v))v.forEach(x=>walk(x,f));else if(v&&typeof v==='object')walk(v,f);}}
export function discover(){
 const units=new Map();for(const file of ['backend/server.js','backend/scientificAssessment.mjs']){const text=read(file);const ast=acorn.parse(text,{ecmaVersion:'latest',sourceType:'module',locations:true});for(const statement of ast.body){const n=statement.declaration??statement;if(n.type==='FunctionDeclaration')units.set(n.id.name,{file,text,n});}}
 const queue=['getOceanConditions'],seen=new Set(),nodes=[],edges=[],bindings=[];
 const builtins=new Set(['Number','String','Boolean','encodeURIComponent','setTimeout','clearTimeout','fetch','structuredClone','createHash']);
 while(queue.length){const name=queue.shift();if(seen.has(name))continue;seen.add(name);const{file,text,n}=units.get(name),id=file+'::'+name,targets=new Set(),locals=new Map();
 walk(n.body,x=>{if(x.type==='Identifier'&&units.has(x.name))targets.add(x.name);if(x.type==='VariableDeclarator'&&['ArrowFunctionExpression','FunctionExpression'].includes(x.init?.type))locals.set(x.id.name,x);if(x.type==='FunctionDeclaration')locals.set(x.id.name,x);});
 walk(n.body,x=>{if(x.type!=='CallExpression'||x.callee.type!=='Identifier')return;const target=x.callee.name;if(units.has(target)||builtins.has(target)||bindings.some(b=>b.caller===id&&b.target===target))return;bindings.push({caller:id,target,line:locals.get(target)?.loc.start.line??x.loc.start.line,resolution:locals.has(target)?'LEXICAL_TARGET':target==='operation'&&name==='settleWithTiming'?'CLOSED_ACQUISITION_CLOSURES':target==='fetchImplementation'&&name==='retrieveOceanMemoryRows'?'HISTORY_DEFAULT_FETCH':'UNRESOLVED_DYNAMIC'});});
 nodes.push({id,function:name,file,line:n.loc.start.line,sourceHash:sha(text.slice(n.start,n.end))});for(const target of targets){edges.push({from:id,to:units.get(target).file+'::'+target});queue.push(target);}
 }
 return {nodes:nodes.sort((a,b)=>a.id.localeCompare(b.id)),edges:edges.sort((a,b)=>(a.from+a.to).localeCompare(b.from+b.to)),bindings:bindings.sort((a,b)=>(a.caller+a.target).localeCompare(b.caller+b.target)),units};
}
export const gapFunctions=['assessOceanEvidence','buildSurfaceWaterCharacterAnalysis','buildWaterMassAnalysis','buildMixingZoneAnalysis','buildEnvironmentalTransitionAnalysis','buildOceanFrontAnalysis','buildOceanOrganizationAnalysis','buildOceanPhysicsExplainabilitySummary','buildOceanPhysicsExplainabilityLineage'];
export function originalAreas(){const q=read('docs/Default_Provider_Transitive_Review_v1.md');const r=JSON.parse(read('docs/Default_Provider_Semantic_Review_v1.json'));const lines=q.split(/\r?\n/).filter(x=>/^\d\. /.test(x)).map(x=>x.slice(3));assert.equal(lines.length,9);for(const [i,a]of r.ledger.entries())assert.equal(a.description,lines[i]);return structuredClone(r.ledger);}
export async function coverage(){const s=new Session();s.connect();const post=(m,p={})=>new Promise((resolve,reject)=>s.post(m,p,(e,v)=>e?reject(e):resolve(v)));await post('Profiler.enable');await post('Profiler.startPreciseCoverage',{callCount:true,detailed:true});return {async take(){return (await post('Profiler.takePreciseCoverage')).result.filter(x=>x.url.endsWith('/backend/server.js')).flatMap(x=>x.functions);},async close(){await post('Profiler.stopPreciseCoverage');s.disconnect();}};}
export function count(c,fn,anchor){const start=source.indexOf('function '+fn+'('),offset=source.indexOf(anchor,start);assert(start>=0&&offset>=start);return c.flatMap(x=>x.ranges).filter(r=>r.startOffset<=offset&&r.endOffset>offset).sort((a,b)=>a.endOffset-a.startOffset-(b.endOffset-b.startOffset))[0]?.count??0;}
// Stable semantic request coordinates select source samples; no request-ordinal meaning.
export async function runDefault(t,{mode='uniform',clock=Date.parse('2200-01-01')}={}){
 const requests=[],now=t.mock.method(Date,'now',()=>clock),warn=t.mock.method(console,'warn',()=>{});
 const transport=t.mock.method(globalThis,'fetch',async input=>{const u=new URL(input),weather=u.hostname==='api.open-meteo.com',marine=u.hostname==='marine-api.open-meteo.com',noaa=u.hostname.endsWith('.noaa.gov');assert(weather||marine||noaa);const lat=Number(u.searchParams.get('latitude')),lon=Number(u.searchParams.get('longitude')),directional=marine&&u.searchParams.get('current')==='sea_surface_temperature';requests.push(String(u));const temp=mode==='thermal'&&directional?(lat>25?28:lat<25?24:lon>-90?27:25):25;return {ok:true,json:async()=>noaa?{table:{columnNames:['time','latitude','longitude','chlor_a','u_current','v_current'],rows:[['2026-09-24T00:00:00Z',25,-90,.1,.5,.2]]}}:{latitude:lat,longitude:lon,current:{time:'2026-09-24T00:00:00Z',wind_speed_10m:4,wind_gusts_10m:6,wind_direction_10m:90,sea_surface_temperature:temp,wave_height:1,wave_direction:90,wave_period:7,swell_wave_height:.5,swell_wave_direction:90,swell_wave_period:8}}};});
 try{const r=await evaluateUnifiedOpportunityOceanConditionsV1({assessment:{contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-26T01:00:00Z'},candidates:[{id:'model-completeness-witness',candidateClass:'open-water',coordinates:[25,-90],eligibility:{eligible:true}}],bearerToken:null,concurrency:1});const leaf=r.controlledEvaluation.evaluation.results[0];assert.equal(leaf.status,'fulfilled');return {ocean:leaf.value.oceanConditions,requests};}finally{transport.mock.restore();now.mock.restore();warn.mock.restore();}
}
