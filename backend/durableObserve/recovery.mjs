import {randomUUID} from 'node:crypto';
import {check,keys,same,utc,reference} from '../observe/canonical.mjs';
import {snapshot,bytesHash,responseReference} from '../observe/workerData.mjs';
import {validateBinding} from '../observe/provenance.mjs';
import {readCurrentEvidenceCaptureV3,validateCurrentCaptureReferenceV3} from '../currentEvidenceCaptureV3.mjs';
import {currentProviderRequest} from '../currentProviderAdapter.mjs';
import {createCurrentObservationWorker} from '../observe/currentObservationWorker.mjs';
import {createPostgresAttempt} from './postgresPorts.mjs';
import {validateStoredObservation} from './observationStorage.mjs';

const rawBytes=value=>{check(typeof value==='string'&&/^(?:[a-f0-9]{2})+$/.test(value),'recovery-raw-encoding');return Buffer.from(value,'hex');};
export function validateRecoveryStage(jobId,value){
 const v=snapshot(value),record=snapshot(JSON.parse(v.recordText)),e=record.execution,b=record.binding;
 keys(record,['execution','binding','captureText','assessment','responseRetainedAt','requestUrl','metadataBasis']);
 check(bytesHash(Buffer.from(v.recordText,'utf8'))===v.recordHash,'recovery-record-hash');
 check(record.captureText===v.captureText&&bytesHash(Buffer.from(v.captureText,'utf8'))===v.captureTextHash,'recovery-capture-text');
 const capture=readCurrentEvidenceCaptureV3(v.captureText);validateCurrentCaptureReferenceV3(v.evidenceReference,capture);
 validateBinding(v.context,e,v.captureText,b);
 check(v.context.job.jobId===jobId&&e.jobId===jobId&&v.executionId===e.attemptId&&v.executionDigest===e.digest&&v.bindingDigest===b.digest&&v.evidenceId===capture.captureId,'recovery-binding-reference');
 const bytes=rawBytes(v.rawHex),ref=responseReference(bytes);
 check(v.rawHash===ref.sha256&&same(ref,e.acquisition.retainedResponseReference)&&same(v.evidenceReference,e.evidenceReference),'recovery-stage-raw');
 utc(record.responseRetainedAt);
 check(utc(record.responseRetainedAt)>=utc(e.acquisition.receivedAt)&&utc(record.responseRetainedAt)<=utc(e.acquisition.normalizedAt),'recovery-retention-time');
 const expectedUrl=currentProviderRequest(v.context.job.cell.coordinates.latitude,v.context.job.cell.coordinates.longitude,{mode:'TIME',time:e.acquisition.request.selectedProviderTime}).href;
 check(record.requestUrl===expectedUrl,'recovery-stage-url');return record;
}
function validateCandidate(jobId,context,value){
 if(value===null)return null;
 const v=snapshot(value);keys(v.origin,['url','provider','dataset']);
 const bytes=rawBytes(v.rawHex),ref=responseReference(bytes);reference(ref);
 check(ref.sha256===v.rawHash&&(v.checkpointHash===null||v.checkpointHash===v.rawHash),'recovery-raw-hash');
 check(v.origin.provider===context.manifest.product.provider&&v.origin.dataset===context.manifest.product.dataset&&typeof v.origin.url==='string','recovery-origin');
 const record=v.stage===null?null:validateRecoveryStage(jobId,v.stage);
 if(record)check(Array.isArray(v.stage.sourcePath)&&v.stage.sourcePath[0]===v.sourceAttemptId&&
 v.stage.sourcePath.at(-1)===record.execution.attemptId&&v.stage.sourcePath.length<=20&&new Set(v.stage.sourcePath).size===v.stage.sourcePath.length&&
 record.requestUrl===v.origin.url&&same(record.execution.acquisition.retainedResponseReference,ref),'recovery-source-reference');
 return {value:v,record,bytes};
}

// Session advisory serialization is operational only: CP-02 ownership, locks,
// fences and commit checks remain the sole acceptance authority. It survives
// no crash/restart and supplies no stale authorization boolean.
export function postgresRecoveryLock(pool){return async(jobId,operation)=>{
 const client=await pool.connect();let held=false,released=false;
 try{
  held=(await client.query("SELECT pg_try_advisory_lock(hashtextextended('pelora-cp04/'||$1,0)) AS held",[jobId])).rows[0].held;
  return held?await operation():snapshot({status:'BUSY',accepted:null,reason:'recovery-in-flight'});
 }finally{
  if(held){try{await client.query("SELECT pg_advisory_unlock(hashtextextended('pelora-cp04/'||$1,0))",[jobId]);}catch{client.release(true);released=true;}}
  if(!released)client.release();
 }
};}

// Explicit local privileged composition. No timers/connections/transport on
// import; only the opaque handle and cancellation signal reach run/inspect.
export function createPostgresRecovery({query,transaction,withLock,jobId,capability=randomUUID(),policy,transport,clock,timers}){
 check(typeof withLock==='function','recovery-lock-required');
 check(typeof jobId==='string'&&/^coj1-[a-f0-9]{64}$/.test(jobId),'recovery-job-id');
 const handle=Object.freeze({});let running=false;
 const admit=h=>check(h===handle,'opaque-recovery-handle');
 const inspect=async()=>{
  const value=snapshot((await query('SELECT cp04.inspect($1,$2) AS value',[jobId,capability])).rows[0].value);
  if(value.status==='ACCEPTED')return {status:'ACCEPTED',accepted:validateStoredObservation(jobId,value.accepted)};
  check(['READY','OWNED','FENCED','BUSY','BLOCKED'].includes(value.status),'recovery-state');
  return {...value,candidate:validateCandidate(jobId,value.context,value.candidate)};
 };
 const failure=error=>snapshot({status:error instanceof TypeError||error.code?.startsWith('23')||/conflict|mismatch|immutable|durable-|recovery-(raw|evidence|checkpoint)/.test(error.message)?'INTEGRITY_FAILED':error.code==='P0001'?'BLOCKED':'INDETERMINATE',accepted:null,reason:error.message});
 const accepted=value=>Object.freeze({...value,status:'ACCEPTED_HISTORICAL',accepted:true,recovered:true});
 return Object.freeze({handle,
  async inspect(h){admit(h);try{const v=await inspect();return v.status==='ACCEPTED'?accepted(v.accepted):snapshot({status:v.status,accepted:false,stage:v.candidate?.record?'STAGED':v.candidate?'RAW_RETAINED':'EMPTY'});}catch(e){return failure(e);}},
  async run(h,signal=null){
   admit(h);check(signal===null||signal instanceof AbortSignal,'cancellation-signal');
   if(running)return snapshot({status:'BUSY',accepted:null,reason:'recovery-in-flight'});
   running=true;
   try{return await withLock(jobId,async()=>{
    if(signal?.aborted)return snapshot({status:'STOPPED',accepted:false,reason:'cancelled-before-recovery'});
    let current=await inspect();if(current.status==='ACCEPTED')return accepted(current.accepted);
    if(!['READY','OWNED'].includes(current.status))return snapshot({status:current.status,accepted:null,reason:'recovery-not-authorized'});
    let envelope=null,candidate=current.candidate,ownedAttemptId=null;
    const rewrite=(execute)=>(sql,args)=>{
     if(sql==='SELECT cp02.worker($1,$2,$3,$4,$5) AS value'){
      const values=[...args];if(values[0]==='raw-write'){
       check(envelope,'recovery-transport-origin-required');
       const source=candidate?.value.sourceAttemptId===ownedAttemptId&&candidate.value.replaySourceAttemptId!==null
        ?candidate.value.replaySourceAttemptId:candidate?.value.sourceAttemptId??null;
       values[3]=JSON.stringify({origin:envelope,replaySourceAttemptId:source});
      }
      return execute('SELECT cp04.worker($1,$2,$3,$4,$5) AS value',values);
     }return execute(sql,args);
    };
    const ports=createPostgresAttempt({query:rewrite(query),transaction:operation=>transaction(q=>operation(rewrite(q))),jobId,capability});
    let owned=false;
    try{
     const state=await ports.control.claim(ports.handle,clock.now());owned=true;
     ownedAttemptId=state.attempt.attemptId;
     current=await inspect();if(current.status==='ACCEPTED')return accepted(current.accepted);
     check(current.status==='OWNED','recovery-authority-changed');candidate=current.candidate;
     const guard=async()=>{check(!signal?.aborted,'recovery-cancelled');const fresh=await ports.control.check(ports.handle,clock.now());check(same(fresh,state),'recovery-authorization-changed');};
     if(candidate?.record&&candidate.record.execution.attemptId===state.attempt.attemptId){
      check(same(candidate.value.stage.context,state.context),'recovery-context-changed');await guard();
      await ports.results.accept(candidate.record,guard,clock.now());
     }else{
      const worker=createCurrentObservationWorker({control:ports.control,policy,clock,timers,responses:ports.responses,
       results:{...ports.results,async write(record){
        if(candidate?.record)check(record.captureText===candidate.record.captureText&&same(record.execution.evidenceReference,candidate.record.execution.evidenceReference),'recovery-evidence-conflict');
        return ports.results.write(record);
       }},transport:async request=>{
        envelope=snapshot({url:request.url,provider:state.context.manifest.product.provider,dataset:state.context.manifest.product.dataset});
        if(candidate){check(same(envelope,candidate.value.origin),'recovery-request-conflict');
         return {bytes:Buffer.from(candidate.bytes),status:200,provider:envelope.provider,dataset:envelope.dataset};}
        return transport(request);
       }});
      const result=await worker.run(ports.handle,signal);
      if(result.accepted!==true){
       // Inspect once through fresh PostgreSQL state. A lost reply never leads
       // to blind second acceptance, failed-acceptance claims, or HTTP replay.
       const found=await inspect();if(found.status==='ACCEPTED')return accepted(found.accepted);
       if(result.accepted===null)return snapshot({status:'INDETERMINATE',accepted:null,reason:result.reason});
       if(/conflict|mismatch|immutable/.test(result.reason))return snapshot({status:'INTEGRITY_FAILED',accepted:null,reason:result.reason});
       return snapshot({status:'RECOVERABLE',accepted:false,reason:result.reason});
      }
     }
     const final=await inspect();check(final.status==='ACCEPTED','recovery-acceptance-unconfirmed');return accepted(final.accepted);
    }catch(error){
     if(error.code==='ACCEPTANCE_UNCERTAIN'||error.message==='job-already-accepted'){
      const found=await inspect();if(found.status==='ACCEPTED')return accepted(found.accepted);
     }throw error;
    }finally{if(owned){try{await ports.control.release(ports.handle);}catch{/* DB lease is the recovery authority. */}}}
   });}catch(error){return failure(error);}finally{running=false;}
  }
 });
}
