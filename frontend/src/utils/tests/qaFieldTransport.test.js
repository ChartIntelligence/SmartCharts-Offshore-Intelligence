import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createQaFieldTransport} from '../qaFieldTransport.js';
import {environment,fieldUrl,syntheticSession,deferred,syntheticBoundary} from '../../hooks/tests/qaFieldTransportFixtures.mjs';
let session=syntheticSession(),dispatches=0,denials=0,changes=[];let controller;
const fetchPort=async(url,options)=>{
 dispatches++;assert.ok(url===fieldUrl('currents'));assert.ok(options.method==='GET'&&options.body===undefined);
 assert.deepEqual(Object.keys(options.headers),['Authorization']);
 assert.ok(options.headers.Authorization==='Bearer '+session.access_token,'only existing access token attached');
 assert.equal(options.redirect,'error');assert.equal(options.credentials,'omit');
 return {ok:true,status:200,text:async()=>'{"status":"stale"}'};
};
const make=overrides=>createQaFieldTransport({environment,getSession:()=>session,fetchPort,
 onDenied:()=>denials++,onChange:change=>changes.push(change),...overrides});
let transport=make();await transport.request(fieldUrl('currents'));assert.equal(dispatches,1);
for(const [url,options] of [
 [fieldUrl('currents').replace('127.0.0.1','localhost')], [fieldUrl('currents').replace('8787','8788')],
 [fieldUrl('currents').replace('http:','https:')], [fieldUrl('currents').replace('/field?','/other?')],
 [fieldUrl('currents').replace('127.0.0.1','127.1')], [fieldUrl('currents').replace('127.0.0.1','name@127.0.0.1')],
 ['https://velion-ocean-engine.onrender.com/api/ocean/field'], [fieldUrl('currents')+'#fragment'],
 [fieldUrl('currents')+'&extra=SYNTHETIC'], [fieldUrl('currents')+'&layer=bathymetry'],
 [fieldUrl('currents'),{method:'POST'}], [fieldUrl('currents'),{body:'SYNTHETIC'}],
 [fieldUrl('currents').replace('density=48','density=NaN')], [fieldUrl('currents').replace('-90%2C27%2C-89%2C28','0%2C0%2C0%2C0')]]){
 const count=dispatches;await assert.rejects(transport.request(url,options),{name:'AbortError'});assert.equal(dispatches,count,'disallowed request never dispatches');
}
console.log('PASS exact QA destination/method/query, no body, per-request access header, cookie omission and redirect refusal configuration');
for(const invalid of [null,{user:{id:'SYNTHETIC'},access_token:'SYNTHETIC-MALFORMED'},
 syntheticSession({claims:{exp:0}}),syntheticSession({claims:{iss:'https://wrong-project.invalid/auth/v1'}}),
 syntheticSession({claims:{sub:'SYNTHETIC-OTHER'}}),syntheticSession({claims:{is_anonymous:true}}),
 syntheticSession({user:{is_anonymous:true}}),syntheticSession({header:{alg:'none'}}),
 syntheticSession({claims:{exp:'unbounded'}})]){
 session=invalid;const count=dispatches;transport=make();await assert.rejects(transport.request(fieldUrl('currents')),{name:'AbortError'});assert.equal(dispatches,count);
}
for(const response of [{ok:false,status:403},{ok:false,status:401},{ok:false,status:302},{ok:true,status:200,redirected:true}]){
 session=syntheticSession();transport=make({fetchPort:async()=>response});const prior=denials;
 await assert.rejects(transport.request(fieldUrl('currents')),{name:'AbortError'});assert.equal(denials,prior+1);
}
console.log('PASS missing/malformed/expired/wrong issuer/subject/anonymous credentials and HTTP auth/redirect rejection');
for(const transition of ['logout','principal','refresh','cancel','dispose','same-object-mutation']){
 session=syntheticSession();const pending=deferred(),started=deferred();let reads=0;transport=make({fetchPort:async()=>({ok:true,status:200})});
 const request=transport.request(fieldUrl('currents'),{signal:(controller=new AbortController()).signal},async()=>{started.resolve();await pending.promise;reads++;return 'SYNTHETIC';});
 await started.promise;const before=denials;
 if(transition==='logout')session=null;
 if(transition==='principal')session=syntheticSession({id:'SYNTHETIC-OWNER-B'});
 if(transition==='refresh')session=syntheticSession({claims:{exp:Math.floor(Date.now()/1000)+7200}});
 if(transition==='same-object-mutation')session.user.id='SYNTHETIC-OWNER-B';
 if(transition==='cancel')controller.abort();if(transition==='dispose')transport.dispose();
 if(!['cancel','dispose'].includes(transition))transport.sessionChanged();
 pending.resolve();await assert.rejects(request,{name:'AbortError'});assert.equal(reads,1);assert.equal(denials,before,'obsolete completion must not invalidate newer state');
}
// Principal changes during the injected fetch cannot even begin decoding an old response.
session=syntheticSession();const pending=deferred();let bodyReads=0;transport=make({fetchPort:()=>pending.promise});
const old=transport.request(fieldUrl('currents'),{},async()=>bodyReads++);session=syntheticSession({id:'SYNTHETIC-OWNER-B'});transport.sessionChanged();
pending.resolve({ok:true,status:200});await assert.rejects(old,{name:'AbortError'});assert.equal(bodyReads,0);
// Pre-dispatch state recheck even if a session getter changes while deriving the credential.
const first=syntheticSession(),second=syntheticSession({id:'SYNTHETIC-OWNER-B'});let reads=0;
transport=make({getSession:()=>++reads<=2?first:second});const before=dispatches;
await assert.rejects(transport.request(fieldUrl('currents')),{name:'AbortError'});assert.equal(dispatches,before);
console.log('PASS post-await/pre-dispatch principal guards, logout/refresh/cancel/disposal, immutable snapshot and no late invalidation');
session=syntheticSession();changes=[];transport=make();transport.sessionChanged();transport.sessionChanged();assert.equal(changes.length,0);
session={...session,user:{...session.user}};transport.sessionChanged();assert.equal(changes.length,0,'same session identity does not reacquire');
session=syntheticSession({claims:{exp:Math.floor(Date.now()/1000)+7200}});transport.sessionChanged();transport.sessionChanged();assert.equal(changes.length,1);assert.equal(changes[0].principalChanged,false);
session=null;transport.sessionChanged();assert.equal(changes.length,2);assert.equal(changes[1].authorized,false);transport.dispose();session=syntheticSession();transport.sessionChanged();assert.equal(changes.length,2);
let normalCalls=0;transport=make({environment:{},getSession:()=>{throw new Error('normal mode must not inspect session');},fetchPort:async(url,options)=>{normalCalls++;assert.deepEqual(Object.keys(options),['signal']);assert.equal(url,'/api/ocean/field?unchanged');return {ok:true};}});
await transport.request('/api/ocean/field?unchanged');transport.sessionChanged();assert.equal(normalCalls,1);
assert.throws(()=>make({environment:{...environment,VITE_PELORA_API_BASE:'https://invalid.example'}}),/Invalid local QA target/);
for(const filename of ['../qaFieldTransport.js','../../hooks/useMapLibreOceanFields.js']){
 const text=fs.readFileSync(new URL(filename,import.meta.url),'utf8');
 assert.ok(!/getSession\s*\(|signIn|refreshSession|localStorage|sessionStorage|indexedDB|console\./.test(text.replaceAll('getSession()','readExistingSession()')),'no SDK/storage/logging APIs');
}
console.log('PASS same-credential deduplication, session-only lifecycle recovery, unchanged normal fetch and no SDK/storage/logging APIs');
const boundary=await syntheticBoundary(layer=>({status:'static',layer,fixture:'SYNTHETIC'}));
try{
 const missing=await boundary.fetchPort(fieldUrl('currents'));assert.equal(missing.status,403);assert.equal(boundary.counts.authority,0);assert.equal(boundary.counts.handler,0);
 session=syntheticSession();boundary.setExpected(session);transport=make({fetchPort:boundary.fetchPort});
 for(const layer of ['bathymetry','currents']){
  const response=await transport.request(fieldUrl(layer));assert.equal(response.status,200);const field=JSON.parse(await response.text());assert.equal(field.layer,layer);
 }
 assert.equal(boundary.counts.authority,4);assert.equal(boundary.counts.handler,2);
}finally{await boundary.close();}
console.log('PASS real QA HTTP boundary: missing header 403, exact synthetic authorized bathymetry/current GET 200 through unchanged authoritative verification/access checks');

// Expiry after asynchronous body reading is denial even if the body read fails.
let clock=Date.now();session=syntheticSession({claims:{exp:Math.floor(clock/1000)+5}});
let expiryDenied=0;transport=make({now:()=>clock,onDenied:()=>expiryDenied++,fetchPort:async()=>({ok:true,status:200})});
await assert.rejects(transport.request(fieldUrl('currents'),{},async()=>{clock+=10000;throw new Error('synthetic read failure');}),{name:'AbortError'});
assert.equal(expiryDenied,1);
for(const condition of ['cancelled','disposed']){
 session=syntheticSession();transport=make();const control=new AbortController();const count=dispatches;
 if(condition==='cancelled')control.abort();else transport.dispose();
 await assert.rejects(transport.request(fieldUrl('currents'),{signal:control.signal}),{name:'AbortError'});assert.equal(dispatches,count);
}
console.log('PASS expiry during body failure and pre-dispatch abort/disposal deny without credential transmission');
const deniedBoundary=await syntheticBoundary(()=>({status:'static'}),{denyAuthority:true});
try{
 session=syntheticSession();deniedBoundary.setExpected(session);const prior=denials;
 transport=make({fetchPort:deniedBoundary.fetchPort});await assert.rejects(transport.request(fieldUrl('currents')),{name:'AbortError'});
 assert.equal(denials,prior+1);assert.equal(deniedBoundary.counts.authority,1);assert.equal(deniedBoundary.counts.handler,0);
}finally{await deniedBoundary.close();}
console.log('PASS matching decoded claims grant no access when synthetic authoritative verification rejects');
