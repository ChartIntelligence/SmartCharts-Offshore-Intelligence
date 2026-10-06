import {createHash} from 'node:crypto';
import {copy,keys,check,freeze,utc,reference,cycleV2,freezeEvidenceV1} from '../../shared/oceanPublication.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
import {buildGovernedOpportunityEvaluationStateV1,EVALUATION_STATE_CONTRACT} from '../opportunityEvaluationState.js';
import {readCurrentEvidenceCaptureV3,validateCurrentCaptureReferenceV3} from '../currentEvidenceCaptureV3.mjs';
import {OCEAN_STATE_READER,CURRENTS_READER_POLICY} from './oceanStateReader.mjs';
import {withScientificAssessmentV1} from '../scientificAssessment.mjs';
export const RANKED_PUBLICATION='pelora-ranked-opportunity-publication-envelope-v1';
export const CONTEXT='pelora-governed-publication-context-v1';
export const byteHash=text=>createHash('sha256').update(text).digest('hex');
const equal=(a,b)=>exactJson(a)===exactJson(b);
function sourceSnapshot(content,cutoff,context){
 if(content?.contractVersion!==OCEAN_STATE_READER)return;
 check(content.queryContext==='historical'&&content.assessmentAt===cutoff&&['OK','MISSING'].includes(content.status)&&equal(content.policy,CURRENTS_READER_POLICY)&&equal(content.scope.region,context.region));
 for(const o of content.observations){
  const c=readCurrentEvidenceCaptureV3(o.evidence.captureText);validateCurrentCaptureReferenceV3(o.evidence.reference,c);
  const point=c.samples.find(s=>s.role==='center')?.point;check(point&&equal(point,o.evidence.point)&&equal(c.sourceAuthority,o.provenance.sourceAuthority));
  const sourceTime=utc(point.observedAt),age=Date.parse(cutoff)-Date.parse(sourceTime);
  check(age>=0&&o.observationTime===sourceTime&&o.providerSelectedTime===sourceTime&&age===o.age.milliseconds&&o.age.assessedAt===cutoff&&o.acceptance.acceptedAt<=cutoff&&o.currentLive===false);
  check(o.freshnessState===(age<=72*3600000?'fresh':'stale')&&o.liveAuthorityState===(age<=96*3600000?'eligible':'not-current'));
  const receipt=o.provenance.receipt;check(receipt.status!=='AVAILABLE_BY_ASSESSMENT'||receipt.record?.receivedAt<=cutoff);
 }
}
function privacy(v){if(typeof v==='string')check(!/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(v));if(v&&typeof v==='object')for(const [key,value] of Object.entries(v)){
 check(!/^(captainid|captaincontext|userid|session|sessionid|authtoken|credentials|token|privatecoordinates|triporigin|origin|fishingreport|reportcontents|email|captainname|boatname)$/i.test(key.replace(/[_-]/g,'')));
 privacy(value);
}}
export function contextDescriptor(input){const c=copy(input);keys(c,['contractVersion','species','region','spatialClass','spatialReference','missionReference']);
 check(c.contractVersion===CONTEXT&&c.species==='blue-marlin');keys(c.region,['id','version']);check(['REGIONAL_SELECTED_COHORT','GOVERNED_MISSION_COHORT'].includes(c.spatialClass));reference(c.spatialReference);
 if(c.spatialClass==='REGIONAL_SELECTED_COHORT')check(c.missionReference===null);else reference(c.missionReference);privacy(c);return freeze(c);
}
export const contextKey=c=>'pcx1-'+byteHash(exactJson(contextDescriptor(c)));
export const versionId=(key,scheduledAt,revision)=>'rpv1-'+byteHash(key+'\n'+utc(scheduledAt)+'\n'+revision);
function fields(input){const p=copy(input);privacy(p);keys(p,['contractVersion','context','contextKey','cycle','assessmentCutoff','execution','publicationAt','revision','parentId','action','lifecycle','reason','producerBundle','versionId','contentDigest']);
 check(p.contractVersion===RANKED_PUBLICATION);const ctx=contextDescriptor(p.context);check(p.contextKey===contextKey(ctx));
 const cyc=cycleV2({scheduledAt:p.cycle.scheduledAt,region:p.cycle.region,configuration:p.cycle.configuration});check(equal(cyc,p.cycle)&&equal(ctx.region,cyc.region));
 check(cyc.configuration.species.length===1&&cyc.configuration.species[0]===ctx.species);check(utc(p.assessmentCutoff)===cyc.scheduledAt);
 keys(p.execution,['startedAt','finishedAt']);check(utc(p.execution.startedAt)>=p.assessmentCutoff);if(p.execution.finishedAt!==null)check(utc(p.execution.finishedAt)>=p.execution.startedAt);
 check(utc(p.publicationAt)>=(p.execution.finishedAt??p.execution.startedAt));check(Number.isSafeInteger(p.revision)&&p.revision>=1);
 check(['ORIGINAL','STATUS','CORRECTION','WITHDRAWAL'].includes(p.action));check((p.revision===1)===(p.action==='ORIGINAL'));check((p.revision===1)===(p.parentId===null));
 if(p.parentId!==null)check(/^rpv1-[a-f0-9]{64}$/.test(p.parentId));check(['running','delayed','completed','failed','withdrawn'].includes(p.lifecycle));check(typeof p.reason==='string'&&p.reason.length>0&&p.reason.length<=200);
 check((p.action==='WITHDRAWAL')===(p.lifecycle==='withdrawn'));if(p.action==='CORRECTION')check(p.lifecycle==='completed');
 if(p.lifecycle==='completed'){
  check(p.execution.finishedAt!==null);const b=p.producerBundle;keys(b,['binding','candidates','results','searchCounts','evidenceFreeze','inputsUsed','delivery','evaluationState','producerVersions','producerText','producerDigest']);
  keys(b.binding,['cycleId','contextKey','assessmentCutoff','cohortReference','evidenceSetId']);check(b.binding.cycleId===cyc.cycleId&&b.binding.contextKey===p.contextKey&&b.binding.assessmentCutoff===p.assessmentCutoff&&equal(b.binding.cohortReference,cyc.configuration.candidateUniverse.reference));
  check(equal(freezeEvidenceV1(cyc,b.evidenceFreeze.entries),b.evidenceFreeze)&&b.evidenceFreeze.evidenceSetId===b.binding.evidenceSetId);check(equal(b.candidates.map(c=>c.id),cyc.configuration.candidateUniverse.candidateIds)&&b.binding.cohortReference.sha256===byteHash(exactJson(b.candidates)));check(b.results.length===b.candidates.length);
  for(let i=0;i<b.results.length;i++){const r=b.results[i];check(equal(r.candidate,b.candidates[i])&&['fulfilled','rejected'].includes(r.status));if(r.status==='fulfilled')check(r.value.species===ctx.species&&equal(r.value.candidate,r.candidate));}
  check(b.delivery.contractVersion==='pelora-unified-captain-opportunity-delivery-v1'&&b.delivery.species===ctx.species);check(b.evaluationState.contractVersion===EVALUATION_STATE_CONTRACT&&b.evaluationState.scope==='selected-analysis-cohort'&&b.evaluationState.establishesSpatialCoverage===false);
  // Existing classifier owns this decision. Structural replay checks it, never ranks.
  check(equal(buildGovernedOpportunityEvaluationStateV1({candidates:b.candidates,results:b.results,delivery:b.delivery,searchCounts:b.searchCounts}),b.evaluationState));
  check(equal(b.delivery.opportunities,b.delivery.ranking.rankedOpportunities)&&equal(b.delivery.opportunities,b.delivery.presentation.presentedOpportunities));
  check(b.producerText===exactJson({binding:b.binding,delivery:b.delivery,evaluationState:b.evaluationState})&&b.producerDigest===byteHash(b.producerText));
  check(equal(b.producerVersions,{delivery:'pelora-unified-captain-opportunity-delivery-v1',ranking:'pelora-unified-species-opportunity-ranking-v1',evaluationState:EVALUATION_STATE_CONTRACT}));
  for(const a of b.inputsUsed){keys(a,['reference','receivedAt','assessmentCutoff','content','candidateIds']);reference(a.reference);check(a.candidateIds.length>0&&a.candidateIds.every(id=>b.candidates.some(c=>c.id===id))&&b.evidenceFreeze.entries.some(e=>equal(e.reference,a.reference))&&a.assessmentCutoff===p.assessmentCutoff&&utc(a.receivedAt)<=p.assessmentCutoff&&a.reference.sha256===byteHash(exactJson(a.content)));sourceSnapshot(a.content,p.assessmentCutoff,ctx);}
  for(const r of b.results.filter(r=>r.status==='fulfilled'))check(b.inputsUsed.some(a=>a.candidateIds.includes(r.candidate.id)));
 }else check(p.producerBundle===null);
 check(p.versionId===versionId(p.contextKey,cyc.scheduledAt,p.revision));const {contentDigest,...body}=p;check(contentDigest===byteHash(exactJson(body)));return freeze(p);
}
export const validateRankedPublication=fields;
export function serializeRankedPublication(p){return exactJson(fields(p));}
export function readRankedPublication(text){const p=fields(JSON.parse(text));check(exactJson(p)===text);return p;}

// Explicit local composition. Producer execution is trusted, not authenticated
// by a digest. No request wrapper, acquisition, scheduler or rank implementation.
export async function createRankedPublicationComposer({evaluate,clock={now:()=>new Date().toISOString()}}){
 check(process.env.PELORA_CP08_LOCAL==='1'&&process.env.PELORA_TEST_OCEAN_CONDITIONS==='1');check(typeof evaluate==='function');
 const {buildUnifiedCaptainOpportunityDeliveryV1}=await import('../server.js');
 return Object.freeze({async compose(input){
  const x=copy(input);privacy(x);keys(x,['context','cycle','candidates','evidenceFreeze','artifacts','searchCounts','revision','parentId','action','lifecycle','reason']);
  const context=contextDescriptor(x.context),key=contextKey(context),cycle=cycleV2(x.cycle),cutoff=cycle.scheduledAt;
  check(equal(x.candidates.map(c=>c.id),cycle.configuration.candidateUniverse.candidateIds)&&cycle.configuration.candidateUniverse.reference.sha256===byteHash(exactJson(x.candidates)));check(equal(context.region,cycle.region));check(equal(freezeEvidenceV1(cycle,x.evidenceFreeze.entries),x.evidenceFreeze));
  const startedAt=utc(clock.now()),used=new Map();let bundle=null;
  if(x.lifecycle==='completed'){
   const binding=freeze({cycleId:cycle.cycleId,contextKey:key,assessmentCutoff:cutoff,cohortReference:cycle.configuration.candidateUniverse.reference,evidenceSetId:x.evidenceFreeze.evidenceSetId});
   const artifacts=copy(x.artifacts);const result=copy(await withScientificAssessmentV1({contractVersion:'pelora-scientific-assessment-v1',assessmentAt:cutoff},()=>evaluate(freeze({binding,candidates:copy(x.candidates),species:context.species}), (ref,candidateId)=>{
    reference(ref);check(x.candidates.some(c=>c.id===candidateId));const a=artifacts.find(a=>equal(a.reference,ref));check(a&&a.assessmentCutoff===cutoff&&utc(a.receivedAt)<=cutoff&&a.reference.sha256===byteHash(exactJson(a.content)));sourceSnapshot(a.content,cutoff,context);
    const key=exactJson(ref),item=used.get(key)??{...copy(a),candidateIds:[]};if(!item.candidateIds.includes(candidateId))item.candidateIds.push(candidateId);used.set(key,item);return freeze(copy(a.content));
   })));keys(result,['binding','results']);check(equal(result.binding,binding));
   const results=result.results;check(results.length===x.candidates.length);for(let i=0;i<results.length;i++)check(equal(results[i].candidate,x.candidates[i]));
   const delivery=copy(buildUnifiedCaptainOpportunityDeliveryV1({species:context.species,speciesInterpretations:results.filter(r=>r.status==='fulfilled').map(r=>r.value)}));
   const evaluationState=buildGovernedOpportunityEvaluationStateV1({candidates:x.candidates,results,delivery,searchCounts:x.searchCounts});
   const producerText=exactJson({binding,delivery,evaluationState});
   bundle={binding,candidates:x.candidates,results,searchCounts:x.searchCounts,evidenceFreeze:x.evidenceFreeze,inputsUsed:[...used.values()],delivery,evaluationState,
    producerVersions:{delivery:delivery.contractVersion,ranking:delivery.ranking.contractVersion,evaluationState:EVALUATION_STATE_CONTRACT},producerText,producerDigest:byteHash(producerText)};
  }
  const finishedAt=x.lifecycle==='running'?null:utc(clock.now()),publicationAt=utc(clock.now());
  const body={contractVersion:RANKED_PUBLICATION,context,contextKey:key,cycle,assessmentCutoff:cutoff,execution:{startedAt,finishedAt},publicationAt,revision:x.revision,parentId:x.parentId,action:x.action,lifecycle:x.lifecycle,reason:x.reason,producerBundle:bundle,versionId:versionId(key,cutoff,x.revision)};
  return fields({...body,contentDigest:byteHash(exactJson(body))});
 }});
}
