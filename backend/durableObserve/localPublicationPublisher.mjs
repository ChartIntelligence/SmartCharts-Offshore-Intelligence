import {randomUUID} from 'node:crypto';
import {check,freeze,copy,utc,cycleV2} from '../../shared/oceanPublication.mjs';
import {PUBLISHER_FREEZE,validatePublisherConfiguration,emptyCycleInput} from './publicationScheduler.mjs';
import {readRankedPublication,serializeRankedPublication,byteHash} from './publicationEnvelope.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
export const LOCAL_PUBLISHER='pelora-local-four-hour-publisher-v1';
// No startup side effect. Disabled mode never constructs a port, timer or DB client.
export function createLocalFourHourPublisher({enabled=false,createRuntime,clock={now:()=>new Date().toISOString()},limits={maxCyclesPerTick:1,maxConfigurationScan:1},onError=()=>{}}={}){
 if(!enabled)return Object.freeze({tick:async()=>({status:'DISABLED'}),start:()=>({status:'DISABLED'}),close:async()=>({status:'CLOSED'})});
 check(process.env.PELORA_CP09_LOCAL==='1'&&typeof createRuntime==='function');check(Number.isInteger(limits.maxCyclesPerTick)&&limits.maxCyclesPerTick>=1&&limits.maxCyclesPerTick<=12&&Number.isInteger(limits.maxConfigurationScan)&&limits.maxConfigurationScan>=1&&limits.maxConfigurationScan<=32);
 let runtimePromise,busy=false,closed=false,timer,active;const controller=new AbortController();const runtime=()=>runtimePromise??=Promise.resolve().then(createRuntime);
 async function run(id,c,r){
  const cap=randomUUID(),claim=await r.ledger.claim(id,cap);if(claim.status!=='OWNED')return {jobId:id,status:claim.status};const signal=AbortSignal.any([controller.signal,AbortSignal.timeout(c.settings.executionTimeoutMs)]);let stage='READ';
  try{
   let saved=await r.ledger.inspect(id);if(saved.completion)return {jobId:id,status:'RECONCILED'};
   if(!saved.submissionText){
    let input;
    if(claim.late){input=emptyCycleInput(c,new Date(saved.job.cycle_at).toISOString(),'delayed');}
    else{
     stage='FREEZE';if(saved.freezeText){const f=JSON.parse(saved.freezeText);check(f.contractVersion===PUBLISHER_FREEZE&&f.configurationId===c.id);input=f.input;}
     else{input=copy(await r.collect(c,new Date(saved.job.cycle_at).toISOString(),{signal}));signal.throwIfAborted();const document={contractVersion:PUBLISHER_FREEZE,configurationId:c.id,cycleId:cycleV2(input.cycle).cycleId,constructedAt:utc(clock.now()),input};await r.ledger.freeze(id,cap,claim.fence,document);saved=await r.ledger.inspect(id);check(exactJson(JSON.parse(saved.freezeText))===exactJson(document));input=JSON.parse(saved.freezeText).input;}
    }
    signal.throwIfAborted();stage='EVALUATE';const p=await r.compose(input,c,{signal});signal.throwIfAborted();stage='PREPARE';await r.ledger.prepare(id,cap,claim.fence,p);saved=await r.ledger.inspect(id);check(saved.submissionText===serializeRankedPublication(p));
   }
   // Every attempt reads persisted state before retrying these exact bytes.
   signal.throwIfAborted();stage='SUBMIT';await r.ledger.finalize(id,cap,claim.fence);stage='READBACK';const accepted=await r.ledger.inspect(id);check(accepted.completion&&accepted.completion.digest===byteHash(accepted.submissionText));readRankedPublication(accepted.submissionText);return {jobId:id,status:'COMMITTED',versionId:accepted.completion.version_id};
  }catch(error){
   const authoritative=await r.ledger.inspect(id);if(authoritative.completion){check(authoritative.completion.digest===byteHash(authoritative.submissionText));return {jobId:id,status:'RECONCILED',stage};}
   try{await r.ledger.release(id,cap);}catch{/* A superseding owner can deny release; authoritative state was inspected above. */}return {jobId:id,status:'RECOVERABLE',stage,errorCode:signal.aborted?'INTERRUPTED':'LOCAL_EXECUTION_FAILED',...(c.adapterVersion==='controlled-p2-p1-publication-explicit-assessment-v1'&&['ABSENT','UNRESOLVED_SUPPLY','CONFLICT_OR_CORRUPT','READ_UNAVAILABLE'].includes(error.supplyStatus)?{supplyStatus:error.supplyStatus,resolutions:error.resolutions??[]}: {})};
  }
 }
 async function tick(){
  if(closed)return {status:'CLOSED'};if(busy)return {status:'BUSY'};busy=true;
  try{const r=await runtime(),configs=await r.ledger.configurations();check(configs.length<=limits.maxConfigurationScan);const results=[];for(const raw of configs){if(closed)break;const c=validatePublisherConfiguration(raw);await r.ledger.enumerate(c,utc(clock.now()));const pending=await r.ledger.pending(c);for(let i=0;i<pending.length&&results.length<limits.maxCyclesPerTick;i+=c.settings.maxConcurrent){const group=pending.slice(i,i+Math.min(c.settings.maxConcurrent,limits.maxCyclesPerTick-results.length));results.push(...await Promise.all(group.map(id=>run(id,c,r))));}if(results.length>=limits.maxCyclesPerTick)break;}return freeze({contractVersion:LOCAL_PUBLISHER,status:'TICK',results});}finally{busy=false;}
 }
 return Object.freeze({tick(){if(busy)return Promise.resolve({status:'BUSY'});active=tick();return active;},async start(){check(!closed&&!timer);const r=await runtime(),configs=await r.ledger.configurations();check(configs.length>0&&configs.length<=limits.maxConfigurationScan);configs.forEach(validatePublisherConfiguration);const pollMs=Math.min(...configs.map(c=>c.settings.pollMs));timer=setInterval(()=>{if(!busy&&!closed){active=tick();active.catch(onError);}},pollMs);active=tick();active.catch(onError);return {status:'STARTED',pollMs};},async close(){closed=true;controller.abort();if(timer)clearInterval(timer);if(active)await active; if(runtimePromise){const r=await runtimePromise;await r.close?.();}return {status:'CLOSED'};}});
}
