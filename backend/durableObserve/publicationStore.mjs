import {copy,keys,check,utc,freeze} from '../../shared/oceanPublication.mjs';
import {contextDescriptor,contextKey,serializeRankedPublication,readRankedPublication,byteHash} from './publicationEnvelope.mjs';
export const PUBLICATION_STORE='pelora-published-opportunity-store-v1';
const boundary=t=>{const d=new Date(utc(t));d.setUTCHours(Math.floor(d.getUTCHours()/4)*4,0,0,0);return d.toISOString();};
function decoded(v,ctx){if(!v?.recordText)return null;check(v.digest===byteHash(v.recordText));const p=readRankedPublication(v.recordText);check(p.contextKey===contextKey(ctx));return p;}
export async function registerLocalPublicationContext(owner,input){const c=contextDescriptor(input),key=contextKey(c);const s=(await owner.query("SELECT current_database() AS db,current_setting('listen_addresses') AS listen,inet_server_port() AS port")).rows[0];check(s.db==='pelora_phase3_qualification'&&s.listen==='127.0.0.1'&&s.port===55432);await owner.query('INSERT INTO cp08.contexts VALUES($1,$2) ON CONFLICT DO NOTHING',[key,c]);const stored=(await owner.query('SELECT descriptor FROM cp08.contexts WHERE context_key=$1',[key])).rows[0];check(contextKey(stored.descriptor)===key);return key;}
export function createPublicationStore({query,transaction,clock={now:()=>new Date().toISOString()}}){
 return Object.freeze({
  async submit(input){const text=serializeRankedPublication(input),p=readRankedPublication(text);
   const receipt=await transaction(async q=>(await q('SELECT cp08.submit($1) AS value',[text])).rows[0].value);
   const saved=decoded(receipt,p.context);check(saved&&serializeRankedPublication(saved)===text);return saved;
  },
  async read(input){const q=copy(input);keys(q,['context','mode',...(q.mode==='exact-cycle'?['scheduledAt']:[])]);const ctx=contextDescriptor(q.context);check(['current-cycle','exact-cycle','latest-successful-history'].includes(q.mode));
   const readAt=utc(clock.now()),currentCycle=boundary(readAt),slot=q.mode==='exact-cycle'?utc(q.scheduledAt):currentCycle;check(boundary(slot)===slot&&slot<=currentCycle);
   const result=(await query('SELECT cp08.lookup($1,$2,$3) AS value',[contextKey(ctx),slot,q.mode==='latest-successful-history'?'successful-history':'cycle'])).rows[0].value;
   const record=decoded(result,ctx);if(record&&q.mode!=='latest-successful-history')check(record.cycle.scheduledAt===slot);
   const historical=q.mode==='latest-successful-history'||slot<currentCycle;
   const current=(await query('SELECT cp08.lookup($1,$2,$3) AS value',[contextKey(ctx),currentCycle,'cycle'])).rows[0].value;
   const currentRecord=decoded(current,ctx);
   return freeze({contractVersion:PUBLICATION_STORE,mode:q.mode,historicalOnly:historical,requestedCycle:slot,currentCycle,currentCycleStatus:currentRecord?.lifecycle??'missing',
    lifecycle:record?.lifecycle??'missing',scientificState:record?.producerBundle?.evaluationState.state??null,record,
    activePublication:record?.lifecycle==='completed'&&record.producerBundle.evaluationState.state!=='unavailable'?record:null,isCurrent:!historical&&record?.lifecycle==='completed'&&record.producerBundle.evaluationState.state!=='unavailable',readAt,...(record?.controlledQualification?{qualification:record.controlledQualification,operationalPublication:false}:{}),
    sourceAgesAtRead:record?.producerBundle?.inputsUsed.flatMap(a=>(a.content.snapshots?.flatMap(s=>s.snapshot.observations)??a.content.observations)?.map(o=>({reference:a.reference,observationId:o.observationId,sourceTime:o.observationTime,milliseconds:Date.parse(readAt)-Date.parse(o.observationTime)}))??[{reference:a.reference,sourceTime:a.content.sourceTime??null,milliseconds:typeof a.content.sourceTime==='string'?Date.parse(readAt)-Date.parse(a.content.sourceTime):null}])??[]});
  }
 });
}
