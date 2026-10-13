import http from 'node:http';
import {pathToFileURL} from 'node:url';
import {validateQaConfiguration,createQaReadOnlyFetch,authorizeQaCaptain,QA_FRONTEND} from './localQaPolicy.mjs';
function reply(res,status,reason){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:reason,localQaReadOnly:true}));}
export function createQaBoundaryServer({configuration,requestHandler,fetchPort}){
 return http.createServer(async(req,res)=>{
  if(req.headers.host!=='127.0.0.1:8787'){reply(res,403,'qa-host-denied');return;}
  const origin=req.headers.origin;
  if(origin&&origin!==QA_FRONTEND){reply(res,403,'qa-origin-denied');return;}
  if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization, X-Pelora-Persistence-Project'});res.end();return;}
  if(req.method!=='GET'){reply(res,405,'qa-application-write-denied');return;}
  let url;try{url=new URL(req.url,'http://127.0.0.1:8787');}catch{reply(res,400,'qa-invalid-url');return;}
  if(!['/api/health','/api/ocean/field','/api/live/marine','/api/ocean','/api/opportunities'].includes(url.pathname)){reply(res,404,'qa-route-denied');return;}
  try{
   if(url.pathname!=='/api/health')await authorizeQaCaptain(req.headers,configuration,fetchPort);
   if(url.pathname==='/api/opportunities'){reply(res,503,'qa-opportunity-persistence-path-disabled');return;}
   await requestHandler(req,res);
  }catch{if(!res.headersSent)reply(res,403,'qa-request-denied');else res.destroy();}
 });
}
export async function prepareQaServer({environment=process.env,fetchPort=globalThis.fetch,loadRuntime=()=>import('./server.js')}={}){
 const configuration=validateQaConfiguration(environment),guardedFetch=createQaReadOnlyFetch(fetchPort);
 // Validate before imports; install process-wide guard before any runtime side effect.
 const previous=globalThis.fetch;globalThis.fetch=guardedFetch;
 try{
  const runtime=await loadRuntime();const internal=runtime.createPeloraServer();
  const server=createQaBoundaryServer({configuration,fetchPort:guardedFetch,requestHandler:(req,res)=>internal.emit('request',req,res)});
  return {server,configuration,dispose(){server.closeAllConnections?.();server.close();internal.close();if(globalThis.fetch===guardedFetch)globalThis.fetch=previous;}};
 }catch(error){if(globalThis.fetch===guardedFetch)globalThis.fetch=previous;throw error;}
}
const direct=process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href;
if(direct){
 try{
  const prepared=await prepareQaServer();
  prepared.server.listen(8787,'127.0.0.1',()=>console.log('Pelora local QA read-only API listening on 127.0.0.1:8787'));
  let stopping=false;const stop=()=>{if(stopping)return;stopping=true;prepared.dispose();};process.once('SIGINT',stop);process.once('SIGTERM',stop);
  prepared.server.on('error',()=>{prepared.dispose();process.exitCode=1;});
 }catch{console.error('Local QA refused startup: missing, unsafe or incompatible configuration');process.exitCode=1;}
}