import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getEventListeners} from 'node:events';
import {harness,time,flush,deferred} from './fixtures/currentObservationWorkerFixture.mjs';
import {createActivation} from '../observe/activation.mjs';
import {createJob} from '../observe/jobs.mjs';
import {createBinding,validateBinding} from '../observe/provenance.mjs';
import {readCurrentEvidenceCaptureV3,validateCurrentCaptureReferenceV3} from '../currentEvidenceCaptureV3.mjs';
import {encodeNormalizedCurrentHandoff} from '../normalizedEvidenceCapture.mjs';
import {SOURCE_NORMALIZATION_VERSION} from '../sourceNormalization.mjs';
import {acquireCurrentProviderPoint} from '../currentProviderAdapter.mjs';
import {bytesHash,snapshot} from '../observe/workerData.mjs';

async function rejected(h,handle=h.handle,signal=null) { const r=await h.worker().run(handle,signal); assert.equal(r.accepted,false,JSON.stringify(r));assert.equal(h.results.counts().accepted,0);assert.equal(h.timers.count(),0);return r; }
function revoke(h,state='REVOKED') { const {digest:_digest,...a}=h.context.activation;const next=createActivation({...a,state,stoppedAt:time(0,1)});
 h.control.updateActivation(next,{...h.context.trustedState,activationRevision:next.revision,activationDigest:next.digest}); }

for(const region of ['synthetic-gulf','synthetic-second-region'])test('exact retained-byte acquisition/capture and Phase 1 binding: '+region,async()=>{
 const h=harness({region}),r=await h.worker().run(h.handle);assert.equal(r.status,'ACCEPTED',JSON.stringify(r));
 const expected=await acquireCurrentProviderPoint(h.job.cell.coordinates.latitude,-90,r.record.assessment,async()=>JSON.parse(h.bytes),{mode:'TIME',time:time()});
 const handoff=encodeNormalizedCurrentHandoff(expected,SOURCE_NORMALIZATION_VERSION);
 assert.equal(r.record.captureText,handoff.captureText);assert.deepEqual(r.record.execution.evidenceReference,handoff.reference);
 const e=r.record.execution;assert.equal(e.acquisition.retainedResponseReference.sha256,bytesHash(h.bytes));
 assert.notEqual(bytesHash(h.bytes),bytesHash(Buffer.from(JSON.stringify(JSON.parse(h.bytes)))));
 assert.equal(decodeURIComponent(new URL(h.requests[0]).search.slice(1)),`u_current[(${time()})][(${h.job.cell.coordinates.latitude})][(-90)],v_current[(${time()})][(${h.job.cell.coordinates.latitude})][(-90)]`);
 assert.equal(new URL(h.requests[0]).hostname,'coastwatch.noaa.gov');assert.equal(new URL(h.requests[0]).pathname,'/erddap/griddap/noaacwBLENDEDNRTcurrentsDaily.json');
 validateBinding({...h.context,job:h.job},e,r.record.captureText,r.record.binding);
 validateCurrentCaptureReferenceV3(e.evidenceReference,readCurrentEvidenceCaptureV3(r.record.captureText));
 assert.equal(h.results.readAccepted(h.job.jobId).record.captureText,r.record.captureText);assert.equal(h.timers.count(),0);
 assert.equal(r.record.metadataBasis.grid,'APPROVED_REQUEST_GRID_NOT_PROVIDER_REPORTED');
 assert(Date.parse(r.retainedAt)>=Date.parse(e.finishedAt));assert(Date.parse(e.acquisition.normalizedAt)>=Date.parse(r.record.responseRetainedAt));
});

for(const forged of [{},null,{authorized:true},'job-id'])test('caller cannot mint attempt authority: '+JSON.stringify(forged),async()=>{const h=harness();await rejected(h,forged);assert.equal(h.requests.length,0);});
test('structurally valid job/digest is not an attempt handle',async()=>{const h=harness();await rejected(h,h.job);assert.equal(h.requests.length,0);});
for(const state of ['DISABLED','REVOKED'])test('inactive '+state+' before transport',async()=>{const h=harness();revoke(h,state);await rejected(h);assert.equal(h.requests.length,0);});
test('expired authorization refuses transport',async()=>{const h=harness();h.clock.set(time(24));await rejected(h);assert.equal(h.requests.length,0);});
test('late attempt outside permitted execution delay refuses transport',async()=>{const h=harness();h.clock.set(time(1,31));await rejected(h);assert.equal(h.requests.length,0);});
test('cancelled before entry invokes no transport',async()=>{const h=harness(),c=new AbortController();c.abort();await rejected(h,h.handle,c.signal);assert.equal(h.requests.length,0);});
for(const kind of ['mode','accessor','proxy','missing','wrong-policy','bad-time'])test('time policy fails closed: '+kind,async()=>{
 const h=harness();h.ports.policy={async select(){if(kind==='missing')return null;if(kind==='bad-time')return {policyReference:h.context.manifest.providerTime.policyReference,selectedProviderTime:'last'};
 const v={policyReference:h.context.manifest.providerTime.policyReference,selectedProviderTime:time()};if(kind==='mode')v.mode='LATEST';if(kind==='wrong-policy')v.policyReference={...v.policyReference,id:'wrong'};
 if(kind==='accessor')Object.defineProperty(v,'selectedProviderTime',{get(){throw Error('must not read');},enumerable:true});return kind==='proxy'?new Proxy(v,{}):v;}};
 await rejected(h);assert.equal(h.requests.length,0);
});
test('provider selection does not enter logical job identity',async()=>{const h=harness();const id=h.job.jobId;h.policy.set(time(0,0,-1000));h.setBytes(Buffer.from(JSON.stringify({...h.payload,table:{...h.payload.table,rows:[[time(0,0,-1000),25,-90,0.5,0.25]]}})));const r=await h.worker().run(h.handle);assert.equal(r.accepted,true);assert.equal(r.record.execution.jobId,id);});
for(const field of ['provider','dataset','status'])test('wrong transport '+field+' denied',async()=>{const h=harness();h.ports.transport=async()=>({...h.envelope(),[field]:field==='status'?503:'wrong'});await rejected(h);});
for(const [label,mutate] of [['latitude',r=>{r[1]=25.25;}],['longitude',r=>{r[2]=-89.75;}],['time',r=>{r[0]=time(0,0,-1000);}],['future',r=>{r[0]=time(1);}],['malformed-time',r=>{r[0]='invalid';}]])test('no time/cell rewrite: '+label,async()=>{await rejected(harness({payloadChange:p=>mutate(p.table.rows[0])}));});
for(const body of ['{','null','[]','{"table":{"rows":[]}}',''])test('malformed/empty response '+body,async()=>{const h=harness();h.setBytes(Buffer.from(body));const r=await rejected(h);assert(['REJECTED','NO_DATA'].includes(r.status));});
for(const v of [null,'bad',false])test('missing/non-numeric vector is NO_DATA: '+v,async()=>{const h=harness({payloadChange:p=>{p.table.rows[0][3]=v;}});const r=await rejected(h);assert.equal(r.status,'NO_DATA');});
test('oversized bytes fail before retention',async()=>{const h=harness({change:m=>{m.limits.maxResponseBytes=10;}});let calls=0;h.ports.responses={...h.responses,retain:()=>{calls++;throw Error();}};await rejected(h);assert.equal(calls,0);});
test('invalid UTF-8 fails without evidence',async()=>{const h=harness();h.setBytes(Buffer.from([0xc3,0x28]));await rejected(h);});
test('request bytes bounded by manifest',async()=>{const h=harness({change:m=>{m.limits.maxRequestBytes=10;}});await rejected(h);assert.equal(h.requests.length,0);});
test('transport failure yields no fabricated execution',async()=>{const h=harness();h.ports.transport=async()=>{throw Error('synthetic transport failure');};const r=await rejected(h);assert(!r.record);});
for(const phase of ['policy','transport'])test('bounded timeout and late completion: '+phase,async()=>{
 const h=harness(),d=deferred();if(phase==='policy')h.ports.policy={select:()=>d.promise};else h.ports.transport=()=>d.promise;
 const pending=h.worker().run(h.handle);await flush();h.timers.fire(phase==='policy'?60000:20000);const r=await pending;assert.equal(r.status,'STOPPED');
 d.resolve(phase==='policy'?{policyReference:h.context.manifest.providerTime.policyReference,selectedProviderTime:time()}:h.envelope());await flush();assert.equal(h.results.counts().accepted,0);assert.equal(h.timers.count(),0);
});
for(const action of ['cancel','revoke','new-fence'])test('ownership changes during acquisition: '+action,async()=>{const h=harness(),d=deferred(),c=new AbortController();h.ports.transport=()=>d.promise;const p=h.worker().run(h.handle,c.signal);await flush();if(action==='cancel')c.abort();if(action==='revoke')revoke(h);if(action==='new-fence')h.control.issue(h.job,time(0,1));d.resolve(h.envelope());const r=await p;assert.equal(r.accepted,false);assert.equal(h.results.counts().accepted,0);assert.equal(h.timers.count(),0);});
test('duplicate simultaneous attempt cannot release the first owner',async()=>{const h=harness(),d=deferred();h.ports.transport=()=>d.promise;const w=h.worker(),p=w.run(h.handle);await flush();assert.equal((await w.run(h.handle)).accepted,false);d.resolve(h.envelope());assert.equal((await p).accepted,true);});
test('one accepted result per logical job across fresh attempts',async()=>{const h=harness();assert.equal((await h.worker().run(h.handle)).accepted,true);const handle=h.control.issue(h.job,time(0,1));assert.equal((await h.worker().run(handle)).accepted,false);assert.equal(h.results.counts().accepted,1);});
test('new attempt after failed transport can succeed without changing job',async()=>{const h=harness();const good=h.ports.transport;h.ports.transport=async()=>{throw Error('first');};await rejected(h);h.ports.transport=good;const handle=h.control.issue(h.job,time(0,1)),r=await h.worker().run(handle);assert.equal(r.accepted,true);assert.equal(r.record.execution.attemptNumber,2);assert.equal(r.record.execution.jobId,h.job.jobId);});
for(const store of ['responses','results'])for(const mode of ['reject','uncertain','corrupt','missing'])test(store+' '+mode+' acknowledgment/readback',async()=>{
 const h=harness(),port=h[store],method=store==='responses'?'retain':'write';
 h.ports[store]={...port,[method]:async value=>{if(mode==='reject')return {status:'REJECTED'};const ack=await port[method](value);return mode==='uncertain'?{...ack,status:'UNCERTAIN'}:ack;},read:async key=>{const value=await port.read(key);if(mode==='missing')return null;if(mode==='corrupt'){if(store==='responses')return {...value,bytes:Buffer.from('{}')};return {...value,captureText:'{}'};}return value;}};
 const r=await h.worker().run(h.handle);assert.equal(r.accepted,mode==='uncertain',JSON.stringify(r));assert.equal(h.timers.count(),0);assert.equal(h.results.counts().accepted,mode==='uncertain'?1:0);
});
test('revocation at final readback prevents acceptance',async()=>{const h=harness();h.ports.results={...h.results,async read(id){const r=await h.results.read(id);revoke(h);return r;}};await rejected(h);});
test('late result write after cancellation is discarded',async()=>{const h=harness(),d=deferred(),c=new AbortController();h.ports.results={...h.results,async write(r){await d.promise;return h.results.write(r);}};const pending=h.worker().run(h.handle,c.signal);await flush();c.abort();assert.equal((await pending).accepted,false);d.resolve();await flush();assert.deepEqual(h.results.counts(),{pending:0,accepted:0});assert.equal(h.timers.count(),0);});
test('raw response mutation after retain cannot change parsed/captured values',async()=>{const h=harness();const original=h.bytes;h.ports.responses={...h.responses,async retain(bytes){const ack=await h.responses.retain(bytes);bytes.fill(0);h.setBytes(Buffer.from('{}'));return ack;}};const r=await h.worker().run(h.handle);assert.equal(r.accepted,true);assert.equal(r.record.execution.acquisition.retainedResponseReference.sha256,bytesHash(original));});
for(const field of ['bytes','provider'])test('transport accessors are never invoked: '+field,async()=>{const h=harness();let reads=0;h.ports.transport=async()=>{const e=h.envelope();Object.defineProperty(e,field,{enumerable:true,get(){reads++;return field==='bytes'?h.bytes:'NOAA CoastWatch';}});return e;};await rejected(h);assert.equal(reads,0);});
test('proxy envelope rejected before traps',async()=>{const h=harness();let traps=0;h.ports.transport=async()=>new Proxy(h.envelope(),{ownKeys(){traps++;return [];}});await rejected(h);assert.equal(traps,0);});
test('returned capture and provenance are frozen and detached',async()=>{const h=harness(),r=await h.worker().run(h.handle);assert.equal(r.accepted,true);assert.throws(()=>{r.record.execution.cellKey='other';});assert.equal(h.results.readAccepted(h.job.jobId).record.execution.cellKey,'cell-a');});
test('capture/reference corruption cannot be promoted by a replacement binding',async()=>{const h=harness();h.ports.results={...h.results,async read(id){const r=structuredClone(await h.results.read(id));r.execution.evidenceReference.sha256='f'.repeat(64);return r;}};await rejected(h);});
test('clock regression fails closed',async()=>{const h=harness();h.ports.transport=async()=>{h.clock.set(time());return h.envelope();};await rejected(h);});
test('no science/capture rewriting or interactive dependencies',()=>{for(const file of ['currentObservationWorker.mjs','memoryWorkerPorts.mjs','workerData.mjs']){const source=readFileSync(new URL('../observe/'+file,import.meta.url),'utf8');assert(!/from ['"].*(?:server|receipt|cache|opportunity|species)/i.test(source));assert(!/\b(?:fetch|setTimeout|setInterval|Date\.now)\s*\(/.test(source));}});
test('zero users and poisoned app/cache context cannot affect output',async()=>{const a=harness(),b=harness();const saved=globalThis.fetch;globalThis.fetch=()=>{throw Error('interactive network forbidden');};
 try{b.ports.captain={userId:'PRIVATE-USER',viewport:[0,0],species:'PRIVATE-SPECIES',reportId:'PRIVATE-REPORT'};b.ports.interactiveCache=new Proxy({}, {get(){throw Error('cache touched');}});b.ports.activeUsers=999;
 const x=await a.worker().run(a.handle),y=await b.worker().run(b.handle);assert.equal(x.accepted,true);assert.deepEqual(x,y);assert.deepEqual(a.requests,b.requests);assert(!JSON.stringify(y).includes('PRIVATE-'));}finally{globalThis.fetch=saved;}
});
test('job input mutation cannot change an issued capability',async()=>{const h=harness();const j=structuredClone(createJob(h.context.manifest,'cell-b',time())),handle=h.control.issue(j,time(0,1));j.cell.coordinates.latitude=0;h.payload.table.rows[0][1]=25.25;h.setBytes(Buffer.from(JSON.stringify(h.payload)));const r=await h.worker().run(handle);assert.equal(r.accepted,true);assert.equal(r.record.execution.acquisition.request.coordinates.latitude,25.25);});
test('descriptor snapshot rejects proxies/accessors without invoking them',()=>{let n=0;assert.throws(()=>snapshot({get x(){n++;return 1;}}));assert.throws(()=>snapshot(new Proxy({},{})));assert.equal(n,0);});
test('binding remains structural-only, not receipt authority',async()=>{const h=harness(),r=await h.worker().run(h.handle);assert.equal(r.record.binding.assurance,'STRUCTURAL_CONSISTENCY_ONLY_REQUIRES_TRUSTED_EXECUTION_WITNESS');assert.deepEqual(createBinding({...h.context,job:h.job},r.record.execution,r.record.captureText),r.record.binding);assert(!JSON.stringify(r.record).includes('receivedAtTrusted'));});
test('valid empty table is NO_DATA, malformed table is rejection',async()=>{const h=harness({payloadChange:p=>{p.table.rows=[];}});assert.equal((await rejected(h)).status,'NO_DATA');const bad=harness();bad.setBytes(Buffer.from('{"table":{"rows":[]}}'));assert.equal((await rejected(bad)).status,'REJECTED');});
test('typed byte accessors cannot change byte ownership or trigger code',async()=>{const h=harness(),raw=h.bytes;let reads=0;for(const field of ['buffer','byteLength','valueOf'])Object.defineProperty(raw,field,{get(){reads++;throw Error('not authoritative');}});h.setBytes(raw);const r=await h.worker().run(h.handle);assert.equal(r.accepted,true);assert.equal(reads,0);});
test('shared mutable byte backing is refused',async()=>{const h=harness();h.setBytes(new Uint8Array(new SharedArrayBuffer(200)));await rejected(h);});
test('all terminal paths remove cancellation listeners',async()=>{for(const failure of [false,true]){const h=harness(),c=new AbortController();if(failure)h.ports.transport=async()=>{throw Error('failure');};await h.worker().run(h.handle,c.signal);assert.equal(getEventListeners(c.signal,'abort').length,0);assert.equal(h.timers.count(),0);}});
test('capture numeric semantics retain signed zero and finite-vector overflow',async()=>{for(const [u,v] of [[-0,0],[1e200,1e200]]){const h=harness();h.setBytes(Buffer.from(`{"table":{"columnNames":["time","latitude","longitude","u_current","v_current"],"rows":[["${time()}",25,-90,${Object.is(u,-0)?'-0':u},${v}]]}}`));const r=await h.worker().run(h.handle);assert.equal(r.accepted,true,JSON.stringify(r));const expected=await acquireCurrentProviderPoint(25,-90,r.record.assessment,async()=>JSON.parse(h.bytes),{mode:'TIME',time:time()});assert.equal(r.record.captureText,encodeNormalizedCurrentHandoff(expected,SOURCE_NORMALIZATION_VERSION).captureText);}});
test('delayed policy input mutation cannot alter retained selected time',async()=>{const h=harness(),selection={policyReference:h.context.manifest.providerTime.policyReference,selectedProviderTime:time()};h.ports.policy={async select(){return selection;}};const original=h.ports.transport;h.ports.transport=async r=>{selection.selectedProviderTime='last';return original(r);};const r=await h.worker().run(h.handle);assert.equal(r.accepted,true);assert.equal(r.record.execution.acquisition.request.selectedProviderTime,time());});
test('stale attempt fails before transport after a new fence is issued',async()=>{const h=harness();h.control.issue(h.job,time(0,1));await rejected(h);assert.equal(h.requests.length,0);});
test('uncertain writes without readback acknowledgment cannot accept',async()=>{const h=harness();h.ports.results={...h.results,async write(){return {status:'UNCERTAIN'};}};await rejected(h);});
test('request timeout also refuses late completion by controlled clock',async()=>{const h=harness();h.ports.transport=async()=>{h.clock.set(time(0,2));return h.envelope();};await rejected(h);});
test('controlled policy clock cannot bypass max-wait budget',async()=>{const h=harness();h.ports.policy={async select(){h.clock.set(time(0,3));return {policyReference:h.context.manifest.providerTime.policyReference,selectedProviderTime:time()};}};await rejected(h);assert.equal(h.requests.length,0);});
