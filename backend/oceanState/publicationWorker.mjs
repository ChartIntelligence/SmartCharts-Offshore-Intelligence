// Explicit background invocation only. No scheduler, provider, HTTP or database calls.
import {resolveUnifiedOpportunityRankingInputV1} from '../server.js';
import {PUBLICATION_CONTRACT, check, copy, keys, freeze, canonical, hash, id, utc,
  cycleV1, freezeEvidenceV1, publicationV1, validatePublicationV1, publicationLookupV1} from '../../shared/oceanPublication.mjs';

export const PUBLICATION_WORKER = 'pelora-ocean-publication-worker-v1';
export const CRASH_WINDOWS = Object.freeze({
  CLAIM: 'Claim outcome may be uncertain; reconcile durable claim ledger. No automatic expiry or takeover.',
  FREEZE: 'Persist/reconcile the exact frozen set; never silently replace it on retry.',
  EVALUATE: 'Reconcile frozen evidence and evaluator version before repeating evaluation.',
  WRITE: 'Reconcile exact cycle object; create-if-absent only, never overwrite.',
  READBACK: 'Read exact accepted object and verify integrity before pointer advancement.',
  CAS: 'Pointer write outcome may be uncertain; reconcile durable pointer and publication.'
});
function functions(port,names) {
  check(port && Object.getPrototypeOf(port)===Object.prototype);
  return Object.fromEntries(names.map(n=>{const d=Object.getOwnPropertyDescriptor(port,n);check(d&&Object.hasOwn(d,'value')&&typeof d.value==='function');return [n,d.value];}));
}
export const pointerKeyV1=cycle=>`latest-publication-${hash({contractVersion:PUBLICATION_CONTRACT,region:cycle.region,
  configuration:{id:cycle.configuration.id,version:cycle.configuration.version,governanceReference:cycle.configuration.governanceReference,
    evaluatorVersion:cycle.configuration.evaluatorVersion,candidateUniverseVersion:cycle.configuration.candidateUniverseVersion,
    species:cycle.configuration.species,families:cycle.configuration.families}})}`;
export const targetV1=p=>freeze({publicationId:p.publicationId,cycleId:p.cycle.cycleId,scheduledAt:p.cycle.scheduledAt,contentDigest:p.contentDigest,integrityDigest:p.integrityDigest});
export async function readPublicationV1(port,publicationId) {
  id(publicationId);const {readExact}=functions(port,['readExact']);const r=copy(await readExact(publicationId));
  if(r.status==='NOT_FOUND'){keys(r,['status']);return null;}
  keys(r,['status','durable','record']);check(r.status==='FOUND'&&r.durable===true);
  const p=validatePublicationV1(r.record);check(p.publicationId===publicationId);return p;
}
export async function writePublicationV1(port,input) {
  const p=validatePublicationV1(input);const {createIfAbsent}=functions(port,['createIfAbsent']);
  const a=copy(await createIfAbsent(p.publicationId,p));keys(a,['status','durable','record']);
  check(['CREATED','EXISTS'].includes(a.status)&&a.durable===true);
  const accepted=validatePublicationV1(a.record);check(accepted.publicationId===p.publicationId);
  if(a.status==='CREATED')check(canonical(accepted)===canonical(p));
  if(accepted.contentDigest!==p.contentDigest)return freeze({status:'PUBLICATION_CONFLICT',publication:null});
  const readback=await readPublicationV1(port,p.publicationId);
  check(readback&&canonical(readback)===canonical(accepted));
  return freeze({status:a.status,publication:readback});
}
async function previousV1(port,key,assessedAt) {
  const {readLatest}=functions(port,['readLatest']);const snapshot=copy(await readLatest(key));
  keys(snapshot,['key','version','target']);check(snapshot.key===key);id(snapshot.version);
  if(snapshot.target===null)return {snapshot,publication:null,ageHours:null};
  const p=await readPublicationV1(port,snapshot.target.publicationId);
  check(p&&pointerKeyV1(p.cycle)===key&&canonical(targetV1(p))===canonical(snapshot.target));
  check(p.attempt.endedAt<=assessedAt);
  const ageHours=(Date.parse(assessedAt)-Date.parse(p.cycle.scheduledAt))/3600000;check(ageHours>=0);
  return {snapshot,publication:p,ageHours};
}
// Future captain reads do not acquire, evaluate, project or mutate. Projection remains separate.
export async function readLatestPublicationV1(port,cycleInput,assessedAt) {
  const cycle=cycleV1(cycleInput);return freeze(await previousV1(port,pointerKeyV1(cycle),utc(assessedAt)));
}
function governedEvaluation(cycle,evidence,result) {
  const e=copy(result);keys(e,['evaluatorVersion','evidenceSetId','results','signalReferences','lineageReferences']);
  check(Array.isArray(e.results));
  const candidateResults=e.results.map(r=>{
    keys(r,['candidateId','species','interpretation','evaluationReference','opportunityId','continuityReference','usedFamilies']);
    check(r.interpretation?.candidate?.id===r.candidateId&&r.interpretation?.species===r.species);
    rejectPrivateContext(r.interpretation);
    const gate=resolveUnifiedOpportunityRankingInputV1({speciesInterpretation:r.interpretation});
    // Existing Minimum Opportunity Evidence Gate, not a new score/eligibility rule.
    return {candidateId:r.candidateId,species:r.species,evaluationReference:r.evaluationReference,
      gate:{contractVersion:gate.contractVersion,eligibleForRanking:gate.eligibleForRanking,reasons:gate.reasons},
      opportunityId:gate.eligibleForRanking?r.opportunityId:null,continuityReference:r.continuityReference,usedFamilies:r.usedFamilies};
  });
  return {evaluatorVersion:e.evaluatorVersion,evidenceSetId:e.evidenceSetId,candidateResults,signalReferences:e.signalReferences,lineageReferences:e.lineageReferences};
}
// Captured interpretation must be shared, not a silently stripped captain evaluation.
// This rejects dedicated context fields; it cannot qualify opaque referenced content.
const privateFields=new Set(['captaincontext','captainid','userid','account','accountid','authuuid','email','captainname','boatname',
  'gps','captaingps','origin','captainorigin','range','rangenm','operatingrangenm','captainrange','selectedspecies','speciesselection',
  'speciespreference','favoriteplace','fishinglog','recentfishinglog','catch','catchresult','privatereport','privatecoordinates',
  'mission','missionstate','personalmissionstate','authtoken','credentials','rankingoverride']);
function rejectPrivateContext(value) {
  if(value&&typeof value==='object')for(const [key,child] of Object.entries(value)) {
    check(!privateFields.has(key.replace(/[_-]/g,'').toLowerCase()));rejectPrivateContext(child);
  }
}
export async function runPublicationCycleV1(input,dependencies) {
  let stage='INPUT',previous=null,cycle=null,accepted=null,assessmentTime=null;
  const report=status=>freeze({contractVersion:PUBLICATION_WORKER,status,stage,cycleId:cycle?.cycleId??null,
    publication:accepted,previous:previous?{publication:previous.publication,ageHours:previous.ageHours,assessedAt:assessmentTime}:null,
    reconciliationRequired:status.includes('CONFLICT')||(['CLAIM','FREEZE','EVALUATE','WRITE','READBACK','CAS'].includes(stage)&&!['COMPLETED','IDEMPOTENT','POINTER_ALREADY_CURRENT','OLDER_PUBLICATION_RETAINED'].includes(status))});
  try {
    const request=copy(input);keys(request,['cycle','attemptId','startedAt','assessedAt']);id(request.attemptId);
    request.startedAt=utc(request.startedAt);request.assessedAt=utc(request.assessedAt);cycle=cycleV1(request.cycle);
    assessmentTime=request.assessedAt;
    check(cycle.scheduledAt<=request.startedAt&&request.startedAt<=request.assessedAt);
    const port=functions(dependencies,['readLatest','readExact','createIfAbsent','compareAndSet','claim','collectEvidence','verifyEvidence','evaluate','finishedAt']);
    stage='PREVIOUS';const key=pointerKeyV1(cycle);previous=await previousV1(port,key,request.assessedAt);
    const existing=await readPublicationV1(port,publicationLookupV1(cycle));
    if(existing&&canonical(existing.cycle)!==canonical(cycle))return report('SAME_CYCLE_CONFIGURATION_CONFLICT');
    if(!existing){
      stage='CLAIM';const claim=copy(await port.claim(freeze({cycleId:cycle.cycleId,attemptId:request.attemptId})));
      keys(claim,['status','cycleId','attemptId']);check(claim.cycleId===cycle.cycleId&&claim.attemptId===request.attemptId);
      if(claim.status==='HELD')return report('CLAIM_HELD_RECONCILIATION_REQUIRED');
      check(claim.status==='ACQUIRED');
    }
    stage='FREEZE';const evidence=freezeEvidenceV1(cycle,await port.collectEvidence(cycle));
    const verification=copy(await port.verifyEvidence(evidence));keys(verification,['status','evidenceSetId']);
    check(verification.status==='VERIFIED'&&verification.evidenceSetId===evidence.evidenceSetId);
    if(existing){
      if(existing.evidence.evidenceSetId!==evidence.evidenceSetId)return report('SAME_CYCLE_EVIDENCE_CONFLICT');
      accepted=existing;
    }else{
      stage='EVALUATE';const evaluation=governedEvaluation(cycle,evidence,await port.evaluate(freeze({cycle,evidence})));
      const endedAt=utc(await port.finishedAt());check(endedAt<=request.assessedAt);
      const record=publicationV1({cycle,evidence,evaluation,attempt:{id:request.attemptId,startedAt:request.startedAt,endedAt}});
      stage='WRITE';const written=await writePublicationV1(port,record);
      if(written.status==='PUBLICATION_CONFLICT')return report(written.status);
      accepted=written.publication;
    }
    stage='READBACK';check(accepted&&canonical(await readPublicationV1(port,accepted.publicationId))===canonical(accepted));
    const target=targetV1(accepted),old=previous.snapshot.target;
    if(old){
      if(canonical(old)===canonical(target))return report('POINTER_ALREADY_CURRENT');
      if(old.scheduledAt>=target.scheduledAt)return report('OLDER_PUBLICATION_RETAINED');
    }
    stage='CAS';const cas=copy(await port.compareAndSet(freeze({key,expected:previous.snapshot,target})));
    keys(cas,['status','durable','snapshot']);
    if(cas.status==='CONFLICT')return report('POINTER_CONFLICT');
    check(cas.status==='ADVANCED'&&cas.durable===true);
    keys(cas.snapshot,['key','version','target']);id(cas.snapshot.version);
    check(cas.snapshot.key===key&&cas.snapshot.version!==previous.snapshot.version&&canonical(cas.snapshot.target)===canonical(target));
    // Durable external pointer read, bound to exact immutable publication; later races require reconciliation.
    const latest=await previousV1(port,key,request.assessedAt);check(canonical(latest.snapshot)===canonical(cas.snapshot));
    return report(existing?'IDEMPOTENT':'COMPLETED');
  }catch{return report('CYCLE_FAILED');}
}
