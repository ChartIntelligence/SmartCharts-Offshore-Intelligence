import {check,same,keys} from '../observe/canonical.mjs';
import {createPostgresObservationStorage} from './observationStorage.mjs';
import {createHistoricalReceiptRuntimeWithConnection,validateHistoricalReceiptEnvelope} from '../historicalReceiptRuntime.mjs';

// Privileged server composition only. No coordinates, request objects or routes.
// Does not create observation eligibility, acquire, claim, normalize or accept.
export function createAcceptedObservationReceiptWriter({query,transaction,enabledLocal=false}) {
 const unavailable=()=>({status:'AS_OF_AUTHORITY_UNKNOWN'});
 const enabled=enabledLocal===true&&process.env.PELORA_CP06_LOCAL==='1';
 const storage=createPostgresObservationStorage({query});
 async function read(jobId) {
  const accepted=await storage.readAccepted(jobId); if(!accepted)return null;
  const value=(await query('SELECT cp06.lookup($1) AS value',[jobId])).rows[0].value;
  if(value===null)return null;
  check(same(value.linkage,accepted.index),'receipt-linkage-mismatch');
  const envelope=validateHistoricalReceiptEnvelope(value.envelopeText,accepted.index.evidence_reference);
  check(envelope.captureText===accepted.record.captureText,'receipt-capture-mismatch');
  return {value,envelope,accepted};
 }
 return Object.freeze({
  async issue(input) {
   if(!enabled)return unavailable();
   try {
    keys(input,['jobId','capability']);
    const {jobId,capability}=input,accepted=await storage.readAccepted(jobId);
    if(!accepted||accepted.index.token!==capability)return unavailable();
    let durable;
    const connection={close:async()=>{},async execute(op,values){
     const er=accepted.index.evidence_reference;
     check(same(values.slice(0,4),[er.kind,er.contractVersion,er.referenceId,er.sha256]),'receipt-reference-mismatch');
     if(op==='insert'){
      durable=await transaction(async q=>{
       await q("SET LOCAL pelora.cp06_local='on'");
       return (await q('SELECT cp06.worker($1,$2) AS value',[jobId,capability])).rows[0].value;
      });
     }else durable=(await read(jobId))?.value;
     return {ok:true,rows:durable?[{envelopeText:durable.envelopeText}]:[]};
    }};
    const runtime=createHistoricalReceiptRuntimeWithConnection({connection,clock:()=>new Date().toISOString()});
    const result=await runtime.issue({family:'CURRENTS',evidenceReference:accepted.index.evidence_reference,captureText:accepted.record.captureText});
    if(result.status!=='RECEIPT_ACCEPTED')return unavailable();
    const verified=await read(jobId);check(verified&&same(verified.envelope.record,result.record),'receipt-readback-required');
    return Object.freeze({...result,linkage:verified.value.linkage});
   }catch{return unavailable();}
  },
  async resolve(jobId,assessmentAt){
   if(!enabled)return unavailable();
   try {
    const durable=await read(jobId);if(!durable)return unavailable();
    const runtime=createHistoricalReceiptRuntimeWithConnection({clock:()=>new Date().toISOString(),connection:{close:async()=>{},async execute(){return {ok:true,rows:[{envelopeText:durable.value.envelopeText}]};}}});
    return await runtime.resolve(durable.accepted.index.evidence_reference,assessmentAt);
   }catch{return unavailable();}
  }
 });
}
