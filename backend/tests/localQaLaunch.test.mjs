import assert from 'node:assert/strict';
import {test} from 'node:test';
import {spawnSync} from 'node:child_process';
import http from 'node:http';
import {validateQaConfiguration,createQaReadOnlyFetch,authorizeQaCaptain,QA_PROJECT,QA_API} from '../localQaPolicy.mjs';
import {createQaBoundaryServer,prepareQaServer} from '../localQaServer.mjs';
import {localQaReadOnly,assertLocalQaWriteAllowed} from '../../frontend/src/utils/localQaReadOnly.js';
const env={PELORA_QA_CAPTAIN_USER_ID:'synthetic-owner',PELORA_LOCAL_QA_READ_ONLY:'1',VITE_PELORA_LOCAL_QA_READ_ONLY:'1',SUPABASE_URL:QA_PROJECT,VITE_SUPABASE_URL:QA_PROJECT,VITE_PELORA_API_BASE:QA_API,SUPABASE_PUBLISHABLE_KEY:'sb_publishable_SYNTHETIC',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_SYNTHETIC'};
const token=iss=>['SYNTHETIC',Buffer.from(JSON.stringify({iss,exp:Date.now()/1000+60})).toString('base64url'),'SYNTHETIC'].join('.');
const headers={authorization:'Bearer '+token(QA_PROJECT+'/auth/v1')};
const authFetch=async(url)=>({ok:true,status:200,json:async()=>String(url).includes('/auth/v1/user')?{id:'synthetic-owner'}:[{user_id:'synthetic-owner',access_role:'founding_captain',access_status:'approved'}]});
test('explicit config and approved identical frontend/backend targets; no service-role or wrong key/port',()=>{
 assert.equal(validateQaConfiguration(env).project,QA_PROJECT);
 for(const patch of [{PELORA_QA_CAPTAIN_USER_ID:undefined},{PELORA_LOCAL_QA_READ_ONLY:undefined},{SUPABASE_URL:'https://unexpected.supabase.co'},{VITE_SUPABASE_URL:'https://unexpected.supabase.co'},{VITE_PELORA_API_BASE:'https://hosted.invalid'},{SUPABASE_SERVICE_ROLE_KEY:'SYNTHETIC'},{PORT:'9000'},{SUPABASE_PUBLISHABLE_KEY:'sb_secret_SYNTHETIC'},{VITE_SUPABASE_PUBLISHABLE_KEY:''}])assert.throws(()=>validateQaConfiguration({...env,...patch}));
});
test('read-only egress rejects writes, unapproved targets, paths, redirects and provider credentials before port',async()=>{
 let calls=0;const port=async()=>{calls++;return {status:200};},read=createQaReadOnlyFetch(port);
 for(const method of ['POST','PATCH','DELETE','PUT'])await assert.rejects(read(QA_PROJECT+'/rest/v1/ocean_snapshots',{method}));
 for(const url of ['https://unexpected.supabase.co/auth/v1/user',QA_PROJECT+'/rest/v1/fishing_day_reports','http://coastwatch.noaa.gov/erddap/info/a/index.json',QA_PROJECT+'/auth/v1/admin'])await assert.rejects(read(url));
 await assert.rejects(read('https://coastwatch.noaa.gov/erddap/info/a/index.json',{headers:{Authorization:'Bearer SYNTHETIC'}}));assert.equal(calls,0);
 await read(QA_PROJECT+'/rest/v1/ocean_snapshots');assert.equal(calls,1);
 await assert.rejects(createQaReadOnlyFetch(async()=>({status:302}))(QA_PROJECT+'/auth/v1/user'));
});
test('issuer prefilter is not signature verification: authoritative Auth and owner-approved row required',async()=>{
 let calls=0;const read=async(...args)=>{calls++;return authFetch(...args);};const cfg=validateQaConfiguration(env);
 await assert.rejects(authorizeQaCaptain({authorization:'Bearer '+token('https://wrong/auth/v1')},cfg,read));assert.equal(calls,0);
 assert.equal(await authorizeQaCaptain(headers,cfg,read),true);assert.equal(calls,2);
 await assert.rejects(authorizeQaCaptain(headers,cfg,async()=>({ok:false})));
 await assert.rejects(authorizeQaCaptain(headers,cfg,async url=>({ok:true,json:async()=>String(url).includes('/auth/')?{id:'synthetic-owner',is_anonymous:true}:[]})));
 for(const row of [{user_id:'other-owner',access_role:'founder',access_status:'approved'},{user_id:'synthetic-owner',access_role:'founding_captain',access_status:'revoked'},{user_id:'synthetic-owner',access_role:'unknown',access_status:'approved'}])await assert.rejects(authorizeQaCaptain(headers,cfg,async url=>({ok:true,json:async()=>String(url).includes('/auth/')?{id:'synthetic-owner'}:[row]})));
});
test('frontend utility normal mode unchanged and explicit QA rejects target/write, retains caller draft',()=>{
 assert.equal(localQaReadOnly({}),false);assert.doesNotThrow(()=>assertLocalQaWriteAllowed({}));
 const qa={...env,VITE_PELORA_LOCAL_QA_READ_ONLY:'1'};assert.equal(localQaReadOnly(qa),true);assert.throws(()=>assertLocalQaWriteAllowed(qa));assert.throws(()=>localQaReadOnly({...qa,VITE_PELORA_API_BASE:''}));
});
test('actual HTTP boundary binds loopback, denies unsafe GET/mutations/host/origin/auth; closes cleanly',async()=>{
 let calls=0;const server=createQaBoundaryServer({configuration:validateQaConfiguration(env),fetchPort:authFetch,requestHandler:(req,res)=>{calls++;res.end('SYNTHETIC read');}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const address=server.address();assert.equal(address.address,'127.0.0.1');
 const request=(path,options={})=>new Promise((resolve,reject)=>{const r=http.request({hostname:'127.0.0.1',port:address.port,path,headers:{host:'127.0.0.1:8787',...headers,...options.headers},method:options.method??'GET'},res=>{res.resume();res.on('end',()=>resolve(res.statusCode));});r.on('error',reject);r.end();});
 try{assert.equal(await request('/api/ocean/field'),200);assert.equal(calls,1);assert.equal(await request('/api/opportunities'),503);assert.equal(await request('/api/ocean',{method:'POST'}),405);assert.equal(await request('/api/ocean',{headers:{origin:'https://unexpected.invalid'}}),403);assert.equal(await request('/api/ocean',{headers:{host:'localhost:8787'}}),403);assert.equal(await request('/api/ocean',{headers:{authorization:''}}),403);assert.equal(calls,1);}finally{await new Promise(resolve=>server.close(resolve));}assert.equal(server.listening,false);
});
test('preparation validates before loading and restores global guard; real CLI refuses missing config without runtime import/listener',async()=>{
 let loads=0;await assert.rejects(prepareQaServer({environment:{},loadRuntime:()=>{loads++;}}));assert.equal(loads,0);
 const prior=globalThis.fetch;const prepared=await prepareQaServer({environment:env,fetchPort:authFetch,loadRuntime:async()=>({createPeloraServer:()=>http.createServer()})});assert.notEqual(globalThis.fetch,prior);prepared.dispose();assert.equal(globalThis.fetch,prior);
 const result=spawnSync(process.execPath,['backend/localQaServer.mjs'],{cwd:process.cwd(),env:{SystemRoot:process.env.SystemRoot,PATH:process.env.PATH},encoding:'utf8'});assert.equal(result.status,1);assert.match(result.stderr,/refused startup/);
});