import {snapshot,bytesHash,responseReference} from '../observe/workerData.mjs';
import {check,same,utc,keys} from '../observe/canonical.mjs';
import {validateBinding} from '../observe/provenance.mjs';
import {readCurrentEvidenceCaptureV3,validateCurrentCaptureReferenceV3} from '../currentEvidenceCaptureV3.mjs';

// Archival replay only. Never selects provider time, acquires data, re-normalizes,
// mints a capture or asserts that accepted historical intelligence is current.
export function validateStoredObservation(jobId,input) {
 const value=snapshot(input);check(value && value.index && value.binding && value.accepted,'durable-chain-missing');
 const {index,context,binding,accepted}=value,record=snapshot(JSON.parse(value.recordText));
 keys(record,['execution','binding','captureText','assessment','responseRetainedAt','requestUrl','metadataBasis']);
 check(bytesHash(Buffer.from(value.recordText,'utf8'))===value.recordHash && binding.record_hash===value.recordHash,'durable-record-hash');
 check(record.captureText===value.captureText && bytesHash(Buffer.from(value.captureText,'utf8'))===value.captureTextHash,'durable-capture-text');
 const capture=readCurrentEvidenceCaptureV3(value.captureText);
 validateCurrentCaptureReferenceV3(value.evidenceReference,capture);
 validateBinding(context,record.execution,record.captureText,record.binding);
 const e=record.execution,b=record.binding,a=e.acquisition;
 check(typeof value.rawHex==='string' && /^(?:[a-f0-9]{2})+$/.test(value.rawHex),'durable-raw-encoding');
 const bytes=Buffer.from(value.rawHex,'hex'),reference=responseReference(bytes);
 check(reference.sha256===value.rawHash && same(reference,a.retainedResponseReference),'durable-raw-reference');
 check(same(value.evidenceReference,e.evidenceReference) && binding.evidence_id===capture.captureId &&
 binding.raw_hash===value.rawHash && binding.execution_id===e.attemptId && binding.execution_digest===e.digest && binding.binding_digest===b.digest,'durable-binding-reference');
 check(context.job.jobId===jobId && e.jobId===jobId && accepted.jobId===jobId && binding.token===accepted.token,'durable-job-reference');
 utc(accepted.acceptedAt);utc(accepted.retainedAt);utc(record.responseRetainedAt);
 check(utc(record.responseRetainedAt)>=utc(a.receivedAt) && utc(record.responseRetainedAt)<=utc(a.normalizedAt) &&
 utc(accepted.retainedAt)>=utc(e.finishedAt) && utc(accepted.acceptedAt)>=utc(accepted.retainedAt),'durable-retention-order');
 const expected={job_id:jobId,token:accepted.token,manifest_digest:e.manifestDigest,cell_key:e.cellKey,observation_window:context.job.window,
 response_reference:reference,evidence_reference:e.evidenceReference,execution_digest:e.digest,binding_digest:b.digest,
 timestamps:{selectedProviderTime:a.request.selectedProviderTime,startedAt:e.startedAt,requestedAt:a.requestedAt,receivedAt:a.receivedAt,
 normalizedAt:a.normalizedAt,finishedAt:e.finishedAt,responseRetainedAt:record.responseRetainedAt,retainedAt:accepted.retainedAt,acceptedAt:accepted.acceptedAt},
 source_metadata:{request:a.request,response:a.response,metadataBasis:record.metadataBasis},receipt_reference:null};
 check(same(index,expected),'durable-index-mismatch');
 return Object.freeze({status:'ACCEPTED_HISTORICAL',index:snapshot(index),record,rawBytes:bytes});
}
export function createPostgresObservationStorage({query}) {
 check(typeof query==='function','storage-query-required');
 return Object.freeze({async readAccepted(jobId){
  check(typeof jobId==='string' && /^coj1-[a-f0-9]{64}$/.test(jobId),'storage-job-id');
  const value=(await query('SELECT cp03.lookup($1) AS value',[jobId])).rows[0].value;
  return value===null ? null : validateStoredObservation(jobId,value);
 }});
}
