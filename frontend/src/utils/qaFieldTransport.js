import {founderHttpsProfile,PREVIEW_API} from '../../../shared/founderHttpsPreview.mjs';
import {localQaReadOnly} from './localQaReadOnly.js';

const FIELD_URL='http://127.0.0.1:8787/api/ocean/field';
const ISSUER='https://vqzskzoizpomwzgbgdwl.supabase.co/auth/v1';
class QaFieldDenied extends Error {}
const denied=()=>new QaFieldDenied('QA field authentication unavailable');
const obsolete=()=>Object.assign(new Error('Obsolete field request'),{name:'AbortError'});

// Defensive consistency only: trusted token verification/access remain on the backend.
function credential(session,now){
  try{
    const token=session?.access_token,id=session?.user?.id;
    if(typeof id!=='string'||!id||session.user.is_anonymous!==false||typeof token!=='string')return null;
    const parts=token.split('.');
    if(parts.length!==3||parts.some(p=>!p||!/^[A-Za-z0-9_-]+$/.test(p)))return null;
    const decode=part=>JSON.parse(atob(part.replace(/-/g,'+').replace(/_/g,'/')));
    const header=decode(parts[0]),claims=decode(parts[1]);
    if(typeof header.alg!=='string'||!header.alg||header.alg==='none'||claims.iss!==ISSUER||claims.sub!==id||
      claims.is_anonymous!==false||!Number.isFinite(claims.exp)||claims.exp*1000<=now())return null;
    return {id,token};
  }catch{return null;}
}
function validateTarget(input,method,body,fieldUrl=FIELD_URL){
  let url;try{url=new URL(input);}catch{throw new QaFieldDenied('QA field target denied');}
  if(url.origin!==new URL(fieldUrl).origin||url.pathname!=='/api/ocean/field'||url.username||url.password||
    url.href!==input||url.hash||method!=='GET'||body!==undefined)throw new QaFieldDenied('QA field target denied');
  const names=['layer','bbox','density','time'];
  if([...url.searchParams.keys()].some(key=>!names.includes(key))||names.some(key=>url.searchParams.getAll(key).length!==1))
    throw new QaFieldDenied('QA field query denied');
  const bbox=url.searchParams.get('bbox').split(',').map(Number),density=url.searchParams.get('density');
  if(!['bathymetry','currents'].includes(url.searchParams.get('layer'))||url.searchParams.get('time')!=='latest-available'||
    bbox.length!==4||url.searchParams.get('bbox').split(',').some(v=>!v.trim())||!bbox.every(Number.isFinite)||bbox[0]<-180||bbox[2]>180||bbox[1]<-90||bbox[3]>90||
    bbox[0]>=bbox[2]||bbox[1]>=bbox[3]||!/^\d+$/.test(density)||Number(density)<1||Number(density)>512)
    throw new QaFieldDenied('QA field query denied');
}
const identity=session=>({id:session?.user?.id,anonymous:session?.user?.is_anonymous,token:session?.access_token});
const same=(a,b)=>a.id===b.id&&a.anonymous===b.anonymous&&a.token===b.token;

// Field-lifetime port: no SDK, session retrieval, storage, sign-in or global headers.
export function createQaFieldTransport({getSession,fetchPort=(...args)=>fetch(...args),
  environment=import.meta.env??{},getPrincipalRevision=()=>0,now=Date.now,onChange=()=>{},onDenied=()=>{}}){
  const qa=localQaReadOnly(environment);
  const fieldUrl=founderHttpsProfile(environment,globalThis.window?.location?.origin)?PREVIEW_API+'/api/ocean/field':FIELD_URL;
  let disposed=false,revision=0,observed=qa?identity(getSession()):null;
  let principalRevision=getPrincipalRevision();
  function current(snapshot,signal){
    if(disposed||signal?.aborted||snapshot.revision!==revision||snapshot.principalRevision!==getPrincipalRevision()||!same(snapshot.identity,identity(getSession())))throw obsolete();
    if(!credential(getSession(),now))throw denied();
  }
  // Capture owner authorization, not a token: valid same-owner renewal may retain display.
  function captureApplicationGuard(){
    if(!qa)return ()=>true;
    const owner=observed?.id,ownerRevision=principalRevision;
    return ()=>!disposed&&ownerRevision===getPrincipalRevision()&&owner===getSession()?.user?.id&&!!credential(getSession(),now);
  }
  return {
    captureApplicationGuard,
    capturePublicationGuard(){
      const boundary=getPrincipalRevision();return ()=>!qa||(!disposed&&boundary===getPrincipalRevision());
    },
    canApply(){return captureApplicationGuard()();},
    canPublish(){return !qa||(!disposed&&principalRevision===getPrincipalRevision()&&same(observed,identity(getSession()))&&!!credential(getSession(),now));},
    sessionChanged(){
      if(!qa||disposed)return;
      const next=getSession(),nextIdentity=identity(next);if(same(observed,nextIdentity)&&principalRevision===getPrincipalRevision())return;
      const principalChanged=observed.id!==nextIdentity.id||principalRevision!==getPrincipalRevision();
      observed=nextIdentity;principalRevision=getPrincipalRevision();revision++;
      onChange({principalChanged,authorized:!!credential(next,now)});return true;
    },
    async request(url,{signal,method='GET',body}={},readResponse=response=>response){
      if(!qa)return readResponse(await fetchPort(url,{signal})); // Original non-QA contract.
      if(disposed||signal?.aborted)throw obsolete();
      const snapshot={revision,principalRevision:getPrincipalRevision(),identity:identity(getSession())};
      try{
        validateTarget(url,method,body,fieldUrl); // Final URL first, before token attachment.
        const access=credential(getSession(),now);if(!access)throw denied();
        current(snapshot,signal);
        const response=await fetchPort(url,{method:'GET',signal,headers:{Authorization:`Bearer ${access.token}`},
          redirect:'error',credentials:'omit'});
        current(snapshot,signal);
        if(response.redirected||(response.status>=300&&response.status<400))throw new QaFieldDenied('QA field redirect denied');
        if(response.status===401||response.status===403)throw denied();
        const result=await readResponse(response);
        current(snapshot,signal);return result;
      }catch(error){
        // An obsolete completion cannot invalidate a newer principal or publish state.
        if(disposed||signal?.aborted||snapshot.revision!==revision||snapshot.principalRevision!==getPrincipalRevision()||!same(snapshot.identity,identity(getSession())))throw obsolete();
        if(error instanceof QaFieldDenied){onDenied(new Error(error.message));throw obsolete();}
        if(!credential(getSession(),now)){onDenied(denied());throw obsolete();}
        throw error;
      }
    },
    dispose(){disposed=true;revision++;observed=null;}
  };
}
