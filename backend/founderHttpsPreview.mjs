import http from 'node:http';
import {pathToFileURL} from 'node:url';
import {PREVIEW_FRONTEND,PREVIEW_API,PREVIEW_PROJECT,validatePreviewPublicKey} from '../shared/founderHttpsPreview.mjs';
import {createQaReadOnlyFetch} from './localQaPolicy.mjs';
const fail=()=>{throw new Error('Preview boundary denied');};
export function validateFounderPreviewServer(env){
 if(env.PELORA_FOUNDER_HTTPS_PREVIEW!=='1'||env.SUPABASE_URL!==PREVIEW_PROJECT||env.PELORA_PREVIEW_FRONTEND!==PREVIEW_FRONTEND||env.PELORA_PREVIEW_API!==PREVIEW_API||env.SUPABASE_SERVICE_ROLE_KEY?.trim())fail();
 validatePreviewPublicKey(env.SUPABASE_PUBLISHABLE_KEY,x=>Buffer.from(x,'base64url').toString());
 if(!/^[1-9][0-9]{0,4}$/.test(env.PORT??'')||Number(env.PORT)>65535)fail();
 return Object.freeze({key:env.SUPABASE_PUBLISHABLE_KEY,port:Number(env.PORT)});
}
export function createFounderPreviewFetch(fetchPort){
 const readOnly=createQaReadOnlyFetch(fetchPort);
 return async(input,init={})=>{
  const url=new URL(typeof input==='string'||input instanceof URL?input:input.url);
  if(url.port||url.hash||init.body!==undefined||input?.body)fail();
  return readOnly(input,init);
 };
}
export async function authorizeFounderPreview(headers,configuration,fetchPort,now=Date.now){
 const authorization=headers.authorization;
 if(typeof authorization!=='string'||!/^Bearer [A-Za-z0-9_.-]+$/.test(authorization))fail();
 let claims;try{claims=JSON.parse(Buffer.from(authorization.slice(7).split('.')[1],'base64url'));}catch{fail();}
 if(claims.iss!==PREVIEW_PROJECT+'/auth/v1'||!Number.isFinite(claims.exp)||claims.exp*1000<=now())fail();
 const requestHeaders={apikey:configuration.key,Authorization:authorization};
 const response=await fetchPort(PREVIEW_PROJECT+'/auth/v1/user',{headers:requestHeaders});
 if(!response.ok)fail();
 const user=await response.json();
 if(typeof user?.id!=='string'||!user.id||user.id!==claims.sub||user.is_anonymous!==false)fail();
 const url=new URL(PREVIEW_PROJECT+'/rest/v1/captain_access');
 url.searchParams.set('user_id','eq.'+user.id);url.searchParams.set('select','user_id,access_role,access_status');url.searchParams.set('limit','2');
 const access=await fetchPort(url,{headers:requestHeaders});if(!access.ok)fail();const rows=await access.json();
 if(!Array.isArray(rows)||rows.length!==1||rows[0].user_id!==user.id||rows[0].access_status!=='approved'||!['founder','founding_captain'].includes(rows[0].access_role))fail();
 return true;
}
export function createFounderPreviewServer({configuration,fetchPort,requestHandler}){
 return http.createServer(async(req,res)=>{
  const origin=req.headers.origin;
  const reply=(code,error)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error,previewReadOnly:true}));};
  // Override downstream wildcard CORS: the wrapper owns the final response headers.
  const original=res.writeHead;
  res.writeHead=function(code,...args){
   const last=args.at(-1);
   if(Array.isArray(last)||typeof last==='string'){return original.call(this,500,{'Cache-Control':'no-store'});}
   const headers={...(last??{})};
   for(const name of Object.keys(headers))if(name.toLowerCase().startsWith('access-control-')||name.toLowerCase()==='vary')delete headers[name];
   this.removeHeader('Access-Control-Allow-Origin');this.removeHeader('Access-Control-Allow-Credentials');
   if(origin===PREVIEW_FRONTEND){headers['Access-Control-Allow-Origin']=PREVIEW_FRONTEND;headers.Vary='Origin';headers['Access-Control-Allow-Methods']='GET, OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type, Authorization, X-Pelora-Persistence-Project';}
   return original.call(this,code,headers);
  };
  if(req.headers.host!==new URL(PREVIEW_API).host){reply(403,'preview-host-denied');return;}
  if(origin&&origin!==PREVIEW_FRONTEND){reply(403,'preview-origin-denied');return;}
  if(req.method==='OPTIONS'){if(origin!==PREVIEW_FRONTEND||req.headers['access-control-request-method']!=='GET'){reply(403,'preview-preflight-denied');return;}res.writeHead(204);res.end();return;}
  if(req.method!=='GET'){reply(405,'preview-write-denied');return;}
  if(!req.url?.startsWith('/')||req.url.startsWith('//')||req.url.includes('\\')){reply(400,'preview-url-denied');return;}
  let url;try{url=new URL(req.url,PREVIEW_API);}catch{reply(400,'preview-url-denied');return;}
  if(url.pathname==='/api/health'){reply(200,'preview-boundary-ready');return;}
  if(!['/api/ocean/field','/api/live/marine','/api/ocean','/api/opportunities'].includes(url.pathname)){reply(404,'preview-route-denied');return;}
  if(origin!==PREVIEW_FRONTEND){reply(403,'preview-origin-required');return;}
  try{
   await authorizeFounderPreview(req.headers,configuration,fetchPort);
   if(url.pathname==='/api/opportunities'){reply(503,'preview-opportunity-persistence-disabled');return;}
   await requestHandler(req,res);
  }catch{if(!res.headersSent)reply(403,'preview-request-denied');else res.destroy();}
 });
}
export async function prepareFounderPreview({environment=process.env,fetchPort=globalThis.fetch,loadRuntime=()=>import('./server.js')}={}){
 const configuration=validateFounderPreviewServer(environment),guarded=createFounderPreviewFetch(fetchPort),prior=globalThis.fetch;
 globalThis.fetch=guarded;
 try{
  const runtime=await loadRuntime();const internal=runtime.createPeloraServer();
  const server=createFounderPreviewServer({configuration,fetchPort:guarded,requestHandler:(req,res)=>internal.emit('request',req,res)});
  return {server,configuration,dispose(){server.closeAllConnections?.();server.close();internal.close();if(globalThis.fetch===guarded)globalThis.fetch=prior;}};
 }catch(error){if(globalThis.fetch===guarded)globalThis.fetch=prior;throw error;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{const run=await prepareFounderPreview();run.server.listen(run.configuration.port,'0.0.0.0');let stopped=false;const stop=()=>{if(!stopped){stopped=true;run.dispose();}};process.once('SIGTERM',stop);process.once('SIGINT',stop);run.server.on('error',()=>{stop();process.exitCode=1;});}
 catch{console.error('Founder HTTPS preview refused unsafe configuration');process.exitCode=1;}
}
