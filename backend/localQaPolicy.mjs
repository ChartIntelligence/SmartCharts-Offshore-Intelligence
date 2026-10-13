// Isolated QA policy only. Production server imports nothing from this module.
export const QA_PROJECT='https://vqzskzoizpomwzgbgdwl.supabase.co';
export const QA_API='http://127.0.0.1:8787';
export const QA_FRONTEND='http://127.0.0.1:4173';
const fail=reason=>{throw new Error(reason);};
export function validateQaConfiguration(env){
 if(env.PELORA_LOCAL_QA_READ_ONLY!=='1'||env.VITE_PELORA_LOCAL_QA_READ_ONLY!=='1')fail('qa-explicit-mode-required');
 if(env.SUPABASE_URL!==QA_PROJECT||env.VITE_SUPABASE_URL!==QA_PROJECT||env.VITE_PELORA_API_BASE!==QA_API)fail('qa-target-mismatch');
 if(env.SUPABASE_SERVICE_ROLE_KEY?.trim())fail('qa-service-role-denied');
 const key=env.SUPABASE_PUBLISHABLE_KEY;
 if(typeof key!=='string'||!key.trim()||key!==env.VITE_SUPABASE_PUBLISHABLE_KEY)fail('qa-public-key-required');
 if(!key.startsWith('sb_publishable_')){
  let role;try{role=JSON.parse(Buffer.from(key.split('.')[1],'base64url')).role;}catch{fail('qa-public-key-format');}
  if(role!=='anon')fail('qa-privileged-key-denied');
 }
 if(env.PORT&&env.PORT!=='8787')fail('qa-port-mismatch');
 if(typeof env.PELORA_QA_CAPTAIN_USER_ID!=='string'||!env.PELORA_QA_CAPTAIN_USER_ID.trim())fail('qa-dedicated-captain-required');
 return Object.freeze({project:QA_PROJECT,api:QA_API,frontend:QA_FRONTEND,key,qaUserId:env.PELORA_QA_CAPTAIN_USER_ID});
}
const PROVIDERS=new Set(['oceanwatch.pifsc.noaa.gov','coastwatch.noaa.gov','coastwatch.pfeg.noaa.gov','marine-api.open-meteo.com','api.open-meteo.com']);
export function createQaReadOnlyFetch(fetchPort){
 return async(input,init={})=>{
  const url=new URL(typeof input==='string'||input instanceof URL?input:input.url);
  const method=(init.method??input?.method??'GET').toUpperCase();
  if(method!=='GET')fail('qa-network-write-denied');
  if(url.protocol!=='https:'||url.username||url.password)fail('qa-egress-target-denied');
  const project=url.origin===QA_PROJECT;
  if(project){if(!['/auth/v1/user','/rest/v1/captain_access','/rest/v1/ocean_snapshots'].includes(url.pathname))fail('qa-project-route-denied');}
  else if(!PROVIDERS.has(url.hostname)||!(url.pathname.startsWith('/erddap/')||url.pathname==='/v1/marine'||url.pathname==='/v1/forecast'))fail('qa-egress-target-denied');
  const headers=new Headers(init.headers??input?.headers);
  if(!project&&(headers.has('authorization')||headers.has('apikey')))fail('qa-provider-credential-denied');
  // Manual redirect prevents an allowed host redirecting to production or a write endpoint.
  const result=await fetchPort(input,{...init,method:'GET',redirect:'manual',signal:init.signal??AbortSignal.timeout(20000)});
  if(result.status>=300&&result.status<400)fail('qa-redirect-denied');
  return result;
 };
}
export async function authorizeQaCaptain(headers,config,fetchPort){
 const authorization=headers.authorization;
 if(typeof authorization!=='string'||!authorization.startsWith('Bearer '))fail('qa-auth-required');
 const token=authorization.slice(7);let claims;
 try{claims=JSON.parse(Buffer.from(token.split('.')[1],'base64url'));}catch{fail('qa-token-format');}
 // This prefilter is NOT signature validation. Auth /user supplies authoritative verification.
 if(claims.iss!==QA_PROJECT+'/auth/v1'||!Number.isFinite(claims.exp)||claims.exp*1000<=Date.now())fail('qa-token-target-or-expiry');
 const requestHeaders={apikey:config.key,Authorization:authorization};
 const response=await fetchPort(QA_PROJECT+'/auth/v1/user',{headers:requestHeaders});
 if(!response.ok)fail('qa-auth-denied');
 const user=await response.json();
 if(typeof user.id!=='string'||user.id!==config.qaUserId||user.is_anonymous===true)fail('qa-principal-denied');
 const url=new URL(QA_PROJECT+'/rest/v1/captain_access');url.searchParams.set('user_id','eq.'+user.id);url.searchParams.set('select','user_id,access_role,access_status');url.searchParams.set('limit','2');
 const access=await fetchPort(url,{headers:requestHeaders});if(!access.ok)fail('qa-access-read-denied');
 const rows=await access.json();
 if(!Array.isArray(rows)||rows.length!==1||rows[0].user_id!==user.id||rows[0].access_status!=='approved'||!['founder','founding_captain'].includes(rows[0].access_role))fail('qa-access-denied');
 return true;
}