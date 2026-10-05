import {discoverModuleSourceClosure} from './moduleSourceClosureFixture.mjs';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Session} from 'node:inspector';
export const source=readFileSync(new URL('../../server.js',import.meta.url),'utf8');
const adapterURL=new URL('../../currentProviderAdapter.mjs',import.meta.url);
const adapterSource=existsSync(adapterURL)?readFileSync(adapterURL,'utf8'):null;
export const sha=value=>createHash('sha256').update(value).digest('hex');
export async function coverageSession(){const s=new Session();s.connect();const post=(method,params={})=>new Promise((resolve,reject)=>s.post(method,params,(error,value)=>error?reject(error):resolve(value)));await post('Profiler.enable');await post('Profiler.startPreciseCoverage',{callCount:true,detailed:true});return {async take(){const r=await post('Profiler.takePreciseCoverage');return r.result.filter(x=>x.url.endsWith('/backend/server.js')||x.url.endsWith('/backend/currentProviderAdapter.mjs')).flatMap(x=>x.functions.map(f=>({...f,sourceOwner:x.url.endsWith('/backend/server.js')?'server':'adapter'})));},async close(){await post('Profiler.stopPreciseCoverage');s.disconnect();}};}
export function branchCount(coverage,functionName,text,owner='server'){
 const implementation=owner==='server'?source:owner==='adapter'?adapterSource:null;
 if(implementation===null)throw Error('Unknown source owner');
 const start=implementation.indexOf('function '+functionName+'('),offset=implementation.indexOf(text,start);
 if(start<0||offset<0)throw Error('Stale source anchor');
 const ranges=coverage.filter(f=>f.sourceOwner===owner).flatMap(f=>f.ranges).filter(r=>r.startOffset<=offset&&r.endOffset>offset).sort((a,b)=>(a.endOffset-a.startOffset)-(b.endOffset-b.startOffset));
 return ranges[0]?.count??0;
}
// Actual default-route execution must reach the branch in its scientific owner.
// The preserved baseline owns the same branch inside its server acquisition.
export function currentProviderNoDataBranchCount(coverage){
 return adapterSource===null
  ? branchCount(coverage,'getCurrentConditionsPointAtAssessment','"no-valid-pixel"')
  : branchCount(coverage,'parseCurrentProviderResponse','"no-valid-pixel"','adapter');
}

// Fresh bounded traversal of actual module-qualified declarations and imports.
export function discoverDefaultGraph({root=new URL('../../../',import.meta.url)}={}){
 return discoverModuleSourceClosure({
  readSource:file=>readFileSync(new URL(file,root),'utf8'),
  allowedFiles:['backend/server.js','backend/scientificAssessment.mjs','backend/currentProviderAdapter.mjs'],
  roots:['backend/server.js','backend/scientificAssessment.mjs'],
  entry:'backend/server.js::getOceanConditions',
  transportRule:{caller:'backend/server.js::getCurrentConditionsPointAtAssessment',
   callee:'backend/currentProviderAdapter.mjs::acquireCurrentProviderPoint',
   parameter:'transport',index:3,argument:'fetchJson'}
 });
}
