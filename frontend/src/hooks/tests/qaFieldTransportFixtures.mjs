import http from 'node:http';
import assert from 'node:assert/strict';
import {createQaBoundaryServer} from '../../../../backend/localQaServer.mjs';
import {QA_PROJECT,QA_API,QA_FRONTEND} from '../../../../backend/localQaPolicy.mjs';
export const environment={VITE_PELORA_LOCAL_QA_READ_ONLY:'1',VITE_SUPABASE_URL:QA_PROJECT,VITE_PELORA_API_BASE:QA_API};
export const fieldUrl=layer=>QA_API+'/api/ocean/field?'+new URLSearchParams({layer,bbox:'-90,27,-89,28',density:'48',time:'latest-available'});
export function syntheticSession({id='SYNTHETIC-OWNER-A',claims={},user={},header={alg:'HS256',typ:'JWT'}}={}){
 const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
 return {access_token:[encode(header),encode({iss:QA_PROJECT+'/auth/v1',sub:id,exp:Math.floor(Date.now()/1000)+3600,is_anonymous:false,...claims}),Buffer.from('SYNTHETIC-NOT-A-SIGNATURE').toString('base64url')].join('.'),
  user:{id,is_anonymous:false,...user}};
}
export function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
// Real local HTTP/auth boundary; every authority/read port is injected synthetic data.
// This never imports the data-connected server runtime or accesses SDK/storage/providers.
export async function syntheticBoundary(fieldFor,{denyAuthority=false}={}){
 const counts={authority:0,handler:0,requests:0};let expected=syntheticSession();
 const server=createQaBoundaryServer({configuration:{project:QA_PROJECT,api:QA_API,frontend:QA_FRONTEND,
  key:'sb_publishable_SYNTHETIC',qaUserId:expected.user.id},
  fetchPort:async(input,options)=>{
   counts.authority++;const url=new URL(input);
   assert.ok(url.origin===QA_PROJECT,'synthetic authority target exact');
   assert.ok(options.headers.Authorization==='Bearer '+expected.access_token,'backend still verifies supplied access token through authority port');
   if(url.pathname==='/auth/v1/user'&&denyAuthority)return {ok:false};
   if(url.pathname==='/auth/v1/user')return {ok:true,json:async()=>({id:expected.user.id,is_anonymous:false})};
   assert.ok(url.pathname==='/rest/v1/captain_access','only synthetic access read');
   return {ok:true,json:async()=>[{user_id:expected.user.id,access_role:'founder',access_status:'approved'}]};
  },requestHandler:(req,res)=>{counts.handler++;res.writeHead(200,{'Content-Type':'application/json'});
   res.end(JSON.stringify(fieldFor(new URL(req.url,QA_API).searchParams.get('layer'))));}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const port=server.address().port;
 return {counts,setExpected(session){expected=session;},async fetchPort(input,options={}){
   const url=new URL(input);assert.ok(url.origin===QA_API&&url.pathname==='/api/ocean/field','logical transport target must be exact');
   counts.requests++;
   return new Promise((resolve,reject)=>{
    const request=http.request({hostname:'127.0.0.1',port,path:url.pathname+url.search,method:options.method??'GET',signal:options.signal,
     headers:{...options.headers,Host:'127.0.0.1:8787',Origin:QA_FRONTEND}},response=>{
      const chunks=[];response.on('data',chunk=>chunks.push(chunk));response.on('error',reject);
      response.on('end',()=>resolve({ok:response.statusCode>=200&&response.statusCode<300,status:response.statusCode,
       text:async()=>Buffer.concat(chunks).toString('utf8')}));
     });request.on('error',reject);request.end();
   });
  },async close(){server.closeAllConnections?.();await new Promise(resolve=>server.close(resolve));}};
}
