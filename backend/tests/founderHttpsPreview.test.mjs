import assert from 'node:assert/strict';
import {test} from 'node:test';
import {founderHttpsProfile,PREVIEW_FRONTEND,PREVIEW_API,PREVIEW_PROJECT,validatePreviewPublicKey} from '../../shared/founderHttpsPreview.mjs';
import {validateFounderPreviewServer,createFounderPreviewFetch,authorizeFounderPreview,createFounderPreviewServer,prepareFounderPreview} from '../founderHttpsPreview.mjs';
import {localQaReadOnly,assertLocalQaWriteAllowed} from '../../frontend/src/utils/localQaReadOnly.js';
import {founderPreviewConfiguration,founderPreviewSession,founderPreviewSignInOptions} from '../../frontend/src/utils/founderHttpsPreview.js';
const client={VITE_PELORA_FOUNDER_HTTPS_PREVIEW:'1',VITE_PELORA_LOCAL_QA_READ_ONLY:'1',VITE_SUPABASE_URL:PREVIEW_PROJECT,VITE_PELORA_API_BASE:PREVIEW_API,VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_SYNTHETIC'};
const env={PELORA_FOUNDER_HTTPS_PREVIEW:'1',PELORA_PREVIEW_FRONTEND:PREVIEW_FRONTEND,PELORA_PREVIEW_API:PREVIEW_API,SUPABASE_URL:PREVIEW_PROJECT,SUPABASE_PUBLISHABLE_KEY:'sb_publishable_SYNTHETIC',PORT:'10000'};
const token=(overrides={})=>Buffer.from(JSON.stringify({alg:'HS256'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({iss:PREVIEW_PROJECT+'/auth/v1',sub:'SYNTHETIC_OWNER',exp:2000000000,...overrides})).toString('base64url')+'.SYNTHETIC';
const auth=async(url)=>({ok:true,json:async()=>String(url).includes('/auth/')?{id:'SYNTHETIC_OWNER',is_anonymous:false}:[{user_id:'SYNTHETIC_OWNER',access_role:'founding_captain',access_status:'approved'}]});
test('normal and legacy loopback remain compatible; preview host cannot silently fall back',()=>{
 assert.equal(founderHttpsProfile({}),null);assert.equal(localQaReadOnly({}),false);assert.doesNotThrow(()=>assertLocalQaWriteAllowed({}));
 assert.equal(localQaReadOnly({VITE_PELORA_LOCAL_QA_READ_ONLY:'1',VITE_SUPABASE_URL:PREVIEW_PROJECT,VITE_PELORA_API_BASE:'http://127.0.0.1:8787'}),true);
 assert.throws(()=>founderHttpsProfile({},PREVIEW_FRONTEND));assert.throws(()=>founderHttpsProfile(client,'https://peloraoffshore.com'));
 assert.equal(founderPreviewConfiguration(client,PREVIEW_FRONTEND).api,PREVIEW_API);
});
for(const key of Object.keys(client))test('frontend required configuration fails closed: '+key,()=>{assert.throws(()=>founderPreviewConfiguration({...client,[key]:''},PREVIEW_FRONTEND));});
test('public key role/project checks and anonymous/session/sign-in boundaries',()=>{
 const decode=x=>Buffer.from(x,'base64url').toString();
 for(const claims of [{role:'service_role',ref:'vqzskzoizpomwzgbgdwl'},{role:'anon',ref:'production'}])assert.throws(()=>validatePreviewPublicKey('x.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.y',decode));
 assert.equal(founderPreviewSession({access_token:'SYNTHETIC',user:{id:'synthetic',is_anonymous:true}},client),null);
 assert.equal(founderPreviewSignInOptions(' TEST@example.invalid ',{frontend:PREVIEW_FRONTEND}).options.shouldCreateUser,false);
 assert.equal(founderPreviewSignInOptions('TEST@example.invalid',{frontend:PREVIEW_FRONTEND}).options.emailRedirectTo,PREVIEW_FRONTEND+'/?app=1');
});
for(const key of Object.keys(env))test('backend required configuration fails closed: '+key,()=>assert.throws(()=>validateFounderPreviewServer({...env,[key]:''})));
test('backend refuses privileged key, wrong port and production project',()=>{
 for(const patch of [{SUPABASE_SERVICE_ROLE_KEY:'SYNTHETIC'},{PORT:'65536'},{PORT:'0'},{SUPABASE_URL:'https://production.invalid'}])assert.throws(()=>validateFounderPreviewServer({...env,...patch}));
});
test('egress denies mutations/production/redirect/credential leaks before network',async()=>{
 let calls=0;const guard=createFounderPreviewFetch(async()=>{calls++;return {status:200};});
 for(const [url,init] of [[PREVIEW_PROJECT+'/rest/v1/fishing_day_reports',{}],['https://production.invalid/auth/v1/user',{}],[PREVIEW_PROJECT+'/auth/v1/user',{method:'POST'}],['https://coastwatch.noaa.gov/erddap/x',{headers:{Authorization:'SYNTHETIC'}}],['https://coastwatch.noaa.gov:8443/erddap/x',{}],[PREVIEW_PROJECT+'/auth/v1/user',{body:'SYNTHETIC'}]])await assert.rejects(guard(url,init));
 assert.equal(calls,0);await guard(PREVIEW_PROJECT+'/auth/v1/user');assert.equal(calls,1);
 await assert.rejects(createFounderPreviewFetch(async()=>({status:302}))(PREVIEW_PROJECT+'/auth/v1/user'));
});
test('server checks authoritative Non-Production user, owner role, revocation and token target',async()=>{
 const cfg=validateFounderPreviewServer(env);await authorizeFounderPreview({authorization:'Bearer '+token()},cfg,auth,()=>1000);
 for(const patch of [{iss:'https://production.invalid/auth/v1'},{exp:0},{sub:'OTHER'}])await assert.rejects(authorizeFounderPreview({authorization:'Bearer '+token(patch)},cfg,auth,()=>1000));
 for(const row of [{user_id:'OTHER',access_role:'founder',access_status:'approved'},{user_id:'SYNTHETIC_OWNER',access_role:'founding_captain',access_status:'revoked'},{user_id:'SYNTHETIC_OWNER',access_role:'beta_captain',access_status:'approved'}])await assert.rejects(authorizeFounderPreview({authorization:'Bearer '+token()},cfg,async u=>String(u).includes('/auth/')?auth(u):{ok:true,json:async()=>[row]},()=>1000));
 await assert.rejects(authorizeFounderPreview({authorization:'Bearer '+token()},cfg,async()=>({ok:true,json:async()=>({id:'SYNTHETIC_OWNER'})}),()=>1000));
});
async function request(server,url,patch={}){
 return new Promise((resolve,reject)=>{
 const stored={};const res={headersSent:false,setHeader(k,v){stored[k.toLowerCase()]=v;},removeHeader(k){delete stored[k.toLowerCase()];},writeHead(status,headers){this.headersSent=true;for(const [k,v]of Object.entries(headers??{}))stored[k.toLowerCase()]=v;this.status=status;return this;},end(body){resolve({status:this.status,headers:stored,body});},destroy(){reject(new Error('destroyed'));}};
 server.emit('request',{url,method:patch.method??'GET',headers:{host:new URL(PREVIEW_API).host,origin:PREVIEW_FRONTEND,authorization:'Bearer '+token(),...patch.headers}},res);
 });
}
test('actual unlistened HTTP wrapper enforces host/origin/method/routes and overrides runtime wildcard CORS',async()=>{
 let calls=0;const server=createFounderPreviewServer({configuration:validateFounderPreviewServer(env),fetchPort:auth,requestHandler:(_req,res)=>{calls++;res.writeHead(200,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Credentials':'true'});res.end('SYNTHETIC');}});
 try{
 const own=await request(server,'/api/ocean/field');assert.equal(own.status,200);assert.equal(own.headers['access-control-allow-origin'],PREVIEW_FRONTEND);assert.equal(own.headers['access-control-allow-credentials'],undefined);
 for(const [path,patch,status]of [['/api/ocean',{method:'POST'},405],['/api/ocean',{headers:{host:'production.invalid'}},403],['/api/ocean',{headers:{origin:'https://peloraoffshore.com'}},403],['/api/ocean',{headers:{origin:''}},403],['/api/ocean',{headers:{authorization:''}},403],['/rest/v1/fishing_day_reports',{},404],['/api/opportunities',{},503],['//production.invalid/x',{},400]])assert.equal((await request(server,path,patch)).status,status);
 assert.equal(calls,1);assert.equal(server.listening,false);
 const pre=await request(server,'/api/ocean/field',{method:'OPTIONS',headers:{'access-control-request-method':'GET'}});assert.equal(pre.status,204);
 assert.equal((await request(server,'/api/health',{headers:{origin:''}})).status,200);
 }finally{server.close();}
});
test('composition guards before runtime import, installs egress before import and restores on cleanup/failure',async()=>{
 const previous=globalThis.fetch;let imports=0;await assert.rejects(prepareFounderPreview({environment:{},loadRuntime:async()=>{imports++;}}));assert.equal(imports,0);
 const prepared=await prepareFounderPreview({environment:env,fetchPort:auth,loadRuntime:async()=>{assert.notEqual(globalThis.fetch,previous);return {createPeloraServer:()=>({emit(){},close(){}})};}});assert.equal(prepared.server.listening,false);prepared.dispose();assert.equal(globalThis.fetch,previous);
 await assert.rejects(prepareFounderPreview({environment:env,loadRuntime:async()=>{throw new Error('controlled');}}));assert.equal(globalThis.fetch,previous);
});

test('HTTPS field request uses exact same-session guarded destination and preview writes stay blocked',async()=>{
 const {createQaFieldTransport}=await import('../../frontend/src/utils/qaFieldTransport.js');
 const previous=globalThis.window;globalThis.window={location:{origin:PREVIEW_FRONTEND}};
 let calls=0;const session={access_token:token({is_anonymous:false}),user:{id:'SYNTHETIC_OWNER',is_anonymous:false}};
 try{
 assert.equal(localQaReadOnly(client),true);assert.throws(()=>assertLocalQaWriteAllowed(client));
 const transport=createQaFieldTransport({environment:client,getSession:()=>session,now:()=>1000,fetchPort:async(url,options)=>{calls++;assert.equal(new URL(url).origin,PREVIEW_API);assert.equal(options.headers.Authorization,'Bearer '+session.access_token);assert.equal(options.credentials,'omit');return {status:200,ok:true};}});
 const path='/api/ocean/field?layer=bathymetry&bbox=-90,25,-85,30&density=16&time=latest-available';
 await transport.request(PREVIEW_API+path);assert.equal(calls,1);
 for(const base of ['http://127.0.0.1:8787','https://velion-ocean-engine.onrender.com','https://peloraoffshore.com'])await assert.rejects(transport.request(base+path));
 assert.equal(calls,1);transport.dispose();
 }finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});
