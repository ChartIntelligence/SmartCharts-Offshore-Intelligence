// Descriptive immutable publication contract. No provider, captain or ranking policy.
import {createHash} from 'node:crypto';
export const PUBLICATION_CONTRACT = 'pelora-governed-ocean-publication-v1';
export const PUBLICATION_CONTRACT_V2 = 'pelora-governed-ocean-publication-v2';
export const PUBLICATION_CONTRACT_V3 = 'pelora-governed-ocean-publication-v3';
export const SCIENTIFIC_HISTORY_V1 = 'pelora-shared-scientific-history-v1';
export const ASSESSMENT_POLICY_V1 = 'pelora-scheduled-scientific-assessment-v1';
export const fail = () => { throw new TypeError('Invalid governed publication input'); };
export function check(v) { if (!v) fail(); }
export function copy(v, ancestors = new Set()) {
  if (v === null || typeof v === 'string' || typeof v === 'boolean' || typeof v === 'number' && Number.isFinite(v)) return v;
  check(v && typeof v === 'object');
  check(!ancestors.has(v));const next=new Set(ancestors);next.add(v);
  if (Array.isArray(v)) {
    check(Reflect.ownKeys(v).length === v.length + 1);
    return Array.from({length:v.length},(_,i)=>{const d=Object.getOwnPropertyDescriptor(v,String(i));check(d?.enumerable && Object.hasOwn(d,'value'));return copy(d.value,next);});
  }
  check(Object.getPrototypeOf(v) === Object.prototype);
  return Object.fromEntries(Reflect.ownKeys(v).map(k=>{const d=Object.getOwnPropertyDescriptor(v,k);check(typeof k==='string' && d.enumerable && Object.hasOwn(d,'value'));return [k,copy(d.value,next)];}));
}
export function keys(v, names) { check(v && !Array.isArray(v) && Object.getPrototypeOf(v)===Object.prototype && Reflect.ownKeys(v).length===names.length && names.every(k=>Object.hasOwn(v,k))); }
export function freeze(v) { if(v && typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v; }
const sort=v=>Array.isArray(v)?v.map(sort):v && typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;
export const canonical=v=>JSON.stringify(sort(v));
export const hash=v=>createHash('sha256').update(canonical(v)).digest('hex');
export function id(v){check(typeof v==='string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/.test(v));}
export function digest(v){check(typeof v==='string' && /^[a-f0-9]{64}$/.test(v));}
export function utc(v){check(typeof v==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(v));const d=new Date(v);check(Number.isFinite(d.getTime())&&d.toISOString()===v.replace(/(?<!\.[0-9]{3})Z$/,'.000Z'));return d.toISOString();}
function unique(a){check(Array.isArray(a)&&new Set(a).size===a.length);a.forEach(id);}
export function reference(r){
  check(r && typeof r==='object');
  if(r.kind==='archive') { keys(r,['kind','archiveId','frameId','receiptDigest','contentDigest']);id(r.archiveId);id(r.frameId);digest(r.receiptDigest);digest(r.contentDigest);check(r.archiveId===`opf-${createHash('sha256').update(r.frameId,'utf8').digest('hex')}`); }
  else {keys(r,['kind','referenceId','contractVersion','sha256']);check(r.kind==='captured');id(r.referenceId);id(r.contractVersion);digest(r.sha256);}
}
function buildCycle(input,version){
  const c=copy(input);keys(c,['scheduledAt','region','configuration']);
  c.scheduledAt=utc(c.scheduledAt);const t=new Date(c.scheduledAt);
  check(t.getUTCHours()%4===0&&t.getUTCMinutes()===0&&t.getUTCSeconds()===0&&t.getUTCMilliseconds()===0);
  keys(c.region,['id','version']);id(c.region.id);id(c.region.version);
  keys(c.configuration,['id','version','governanceReference','evaluatorVersion','candidateUniverseVersion','species','families','candidateUniverse']);
  for(const k of ['id','version','governanceReference','evaluatorVersion','candidateUniverseVersion'])id(c.configuration[k]);
  if(version===PUBLICATION_CONTRACT_V2)check(c.configuration.evaluatorVersion.endsWith('-explicit-assessment-v1'));
  if(version===PUBLICATION_CONTRACT_V3)check(c.configuration.evaluatorVersion.endsWith('-explicit-assessment-history-v1'));
  unique(c.configuration.species);check(c.configuration.species.length===1&&c.configuration.species[0]==='blue-marlin'); // Only existing governed ranking pathway.
  unique(c.configuration.families);check(c.configuration.families.length>0);
  const u=c.configuration.candidateUniverse;keys(u,['reference','candidateIds']);reference(u.reference);unique(u.candidateIds);
  c.configuration.species.sort();c.configuration.families.sort();u.candidateIds.sort();
  // Candidate-universe capture is frozen content, not a new scheduled cycle on retry.
  const {candidateUniverse,...configurationIdentity}=c.configuration;
  return freeze({contractVersion:version,...c,cycleId:`ocycle-${hash({contractVersion:version,
    scheduledAt:c.scheduledAt,region:c.region,configuration:configurationIdentity})}`});
}
export const cycleV1=input=>buildCycle(input,PUBLICATION_CONTRACT);
export const cycleV2=input=>buildCycle(input,PUBLICATION_CONTRACT_V2);
export function assessmentContextV2(cycle){
  cycle=copy(cycle);
  check(cycle.contractVersion===PUBLICATION_CONTRACT_V2);
  check(canonical(cycleV2({scheduledAt:cycle.scheduledAt,region:cycle.region,configuration:cycle.configuration}))===canonical(cycle));
  return freeze({contractVersion:ASSESSMENT_POLICY_V1,assessmentAt:cycle.scheduledAt});
}
export function freezeEvidenceV1(cycle,input){
  const entries=copy(input);check(Array.isArray(entries));const seen=new Set();
  for(const e of entries){
    keys(e,['family','status','reason','reference','product','representedAt','support','qualification','admissibility','assessedAt','ageHours','qualityReferences','lineageReferences']);
    id(e.family);check(!seen.has(e.family));seen.add(e.family);id(e.reason);
    check(['AVAILABLE','STALE','UNAVAILABLE','ERROR'].includes(e.status));
    keys(e.support,['kind','start','end']);check(['instant','interval','composite-window','static','unknown'].includes(e.support.kind));
    if(e.support.start!==null)e.support.start=utc(e.support.start);if(e.support.end!==null)e.support.end=utc(e.support.end);
    if(['interval','composite-window'].includes(e.support.kind))check(e.support.start!==null&&e.support.end!==null&&e.support.start<=e.support.end);
    else check(e.support.start===null&&e.support.end===null);
    keys(e.qualification,['status','policyReference']);check(['QUALIFIED','UNQUALIFIED','UNKNOWN'].includes(e.qualification.status));id(e.qualification.policyReference);
    keys(e.admissibility,['status','policyReference']);check(['ADMISSIBLE','INADMISSIBLE','UNASSESSED'].includes(e.admissibility.status));id(e.admissibility.policyReference);
    e.assessedAt=utc(e.assessedAt);check(e.assessedAt===cycle.scheduledAt); // Replayable cycle-time assessment, not wall-clock freshness.
    if(e.representedAt!==null){e.representedAt=utc(e.representedAt);check(e.representedAt<=e.assessedAt&&e.ageHours===(Date.parse(e.assessedAt)-Date.parse(e.representedAt))/3600000);}
    else check(e.ageHours===null);
    if(e.reference!==null){reference(e.reference);keys(e.product,['providerId','productId','evidenceClass']);Object.values(e.product).forEach(id);}
    else check(e.product===null&&['UNAVAILABLE','ERROR'].includes(e.status)&&e.admissibility.status!=='ADMISSIBLE');
    if(e.admissibility.status==='ADMISSIBLE')check(e.reference!==null&&e.qualification.status==='QUALIFIED'&&['AVAILABLE','STALE'].includes(e.status));
    for(const list of [e.qualityReferences,e.lineageReferences]){check(Array.isArray(list));list.forEach(reference);}
  }
  check(canonical([...seen].sort())===canonical(cycle.configuration.families));entries.sort((a,b)=>a.family<b.family?-1:1);
  return freeze({evidenceSetId:`oes-${hash(entries)}`,entries});
}
function buildPublication(input,version){
  const p=copy(input);keys(p,['cycle','evidence','attempt','evaluation',...(version===PUBLICATION_CONTRACT_V3?['history']:[])]);
  const c=p.cycle;keys(c,['contractVersion','scheduledAt','region','configuration','cycleId']);
  const cycle=buildCycle({scheduledAt:c.scheduledAt,region:c.region,configuration:c.configuration},version);check(canonical(cycle)===canonical(c));
  keys(p.evidence,['evidenceSetId','entries']);check(canonical(freezeEvidenceV1(cycle,p.evidence.entries))===canonical(p.evidence));
  keys(p.attempt,['id','startedAt','endedAt']);id(p.attempt.id);p.attempt.startedAt=utc(p.attempt.startedAt);p.attempt.endedAt=utc(p.attempt.endedAt);
  check(cycle.scheduledAt<=p.attempt.startedAt&&p.attempt.startedAt<=p.attempt.endedAt);
  const e=p.evaluation;keys(e,['evaluatorVersion','evidenceSetId','candidateResults','signalReferences','lineageReferences',...(version!==PUBLICATION_CONTRACT?['assessmentAt']:[]),...(version===PUBLICATION_CONTRACT_V3?['historyId','historyState']:[])]);
  if(version!==PUBLICATION_CONTRACT){e.assessmentAt=utc(e.assessmentAt);check(e.assessmentAt===cycle.scheduledAt);}
  if(version===PUBLICATION_CONTRACT_V3){const h=freezeScientificHistoryV1(cycle,historyInput(p.history));check(canonical(h)===canonical(p.history)&&h.state!=='INVALID');check(e.historyId===h.historyId&&e.historyState===h.state);}
  id(e.evaluatorVersion);check(e.evaluatorVersion===cycle.configuration.evaluatorVersion&&e.evidenceSetId===p.evidence.evidenceSetId);
  check(Array.isArray(e.candidateResults));const seen=new Set();
  for(const r of e.candidateResults){
    keys(r,['candidateId','species','evaluationReference','gate','opportunityId','continuityReference','usedFamilies']);
    id(r.candidateId);check(cycle.configuration.candidateUniverse.candidateIds.includes(r.candidateId)&&cycle.configuration.species.includes(r.species));
    const key=`${r.species}:${r.candidateId}`;check(!seen.has(key));seen.add(key);reference(r.evaluationReference);
    keys(r.gate,['contractVersion','eligibleForRanking','reasons']);check(r.gate.contractVersion==='pelora-unified-opportunity-ranking-input-v1'&&typeof r.gate.eligibleForRanking==='boolean');unique(r.gate.reasons);
    if(r.gate.eligibleForRanking){check(r.gate.reasons.length===0);id(r.opportunityId);}else{check(r.opportunityId===null&&r.gate.reasons.length>0);}
    if(r.continuityReference!==null)reference(r.continuityReference);
    unique(r.usedFamilies);check(r.usedFamilies.every(f=>p.evidence.entries.some(x=>x.family===f&&x.admissibility.status==='ADMISSIBLE')));
  }
  check(seen.size===cycle.configuration.candidateUniverse.candidateIds.length*cycle.configuration.species.length); // No global Top-N truncation.
  e.candidateResults.sort((a,b)=>`${a.species}:${a.candidateId}`<`${b.species}:${b.candidateId}`?-1:1);
  for(const list of [e.signalReferences,e.lineageReferences]){check(Array.isArray(list));list.forEach(reference);}
  const content={contractVersion:version,cycle,evidence:p.evidence,...(version===PUBLICATION_CONTRACT_V3?{history:p.history}:{}),evaluation:e,status:'COMPLETED'};
  const record={...content,publicationId:`opub-${hash(cycle.cycleId)}`,contentDigest:hash(content),attempt:p.attempt};
  return freeze({...record,integrityDigest:hash(record)});
}
function validatePublication(record,version){
  const p=copy(record);keys(p,['contractVersion','cycle','evidence','evaluation','status','publicationId','contentDigest','attempt','integrityDigest',...(version===PUBLICATION_CONTRACT_V3?['history']:[])]);
  const expected=buildPublication({cycle:p.cycle,evidence:p.evidence,attempt:p.attempt,evaluation:p.evaluation,...(version===PUBLICATION_CONTRACT_V3?{history:p.history}:{})},version);check(canonical(expected)===canonical(p));return expected;
}
export const publicationLookupV1=cycle=>`opub-${hash(cycle.cycleId)}`;
export const publicationV1=input=>buildPublication(input,PUBLICATION_CONTRACT);
export const publicationV2=input=>buildPublication(input,PUBLICATION_CONTRACT_V2);
export const validatePublicationV1=input=>validatePublication(input,PUBLICATION_CONTRACT);
export const validatePublicationV2=input=>validatePublication(input,PUBLICATION_CONTRACT_V2);

export const cycleV3=input=>buildCycle(input,PUBLICATION_CONTRACT_V3);
export const publicationV3=input=>buildPublication(input,PUBLICATION_CONTRACT_V3);
export const validatePublicationV3=input=>validatePublication(input,PUBLICATION_CONTRACT_V3);
export function assessmentContextV3(cycle){
 const c=copy(cycle);check(canonical(cycleV3({scheduledAt:c.scheduledAt,region:c.region,configuration:c.configuration}))===canonical(c));
 return freeze({contractVersion:ASSESSMENT_POLICY_V1,assessmentAt:c.scheduledAt});
}
function historyInput(value){const h=copy(value);keys(h,['contractVersion','state','asOf','reason','sourceReference','entries','historyId','contentDigest']);const {historyId,contentDigest,...input}=h;return input;}
export function freezeScientificHistoryV1(cycle,input){
 assessmentContextV3(cycle);
 const h=copy(input);keys(h,['contractVersion','state','asOf','reason','sourceReference','entries']);
 check(h.contractVersion===SCIENTIFIC_HISTORY_V1);check(['AVAILABLE','UNAVAILABLE','INVALID'].includes(h.state));
 h.asOf=utc(h.asOf);check(h.asOf===cycle.scheduledAt);id(h.reason);check(Array.isArray(h.entries));
 if(h.sourceReference!==null)reference(h.sourceReference);
 if(h.state==='AVAILABLE')check(h.sourceReference!==null);else check(h.entries.length===0);
 const seen=new Set();
 for(const e of h.entries){
  keys(e,['candidateId','species','representedAt','evaluatedAt','evaluationReference','opportunityId','continuityReference']);
  id(e.candidateId);check(cycle.configuration.candidateUniverse.candidateIds.includes(e.candidateId));check(e.species==='blue-marlin'&&cycle.configuration.species.includes(e.species));
  e.representedAt=utc(e.representedAt);e.evaluatedAt=utc(e.evaluatedAt);check(e.representedAt<=e.evaluatedAt&&e.evaluatedAt<=h.asOf);
  reference(e.evaluationReference);if(e.opportunityId!==null)id(e.opportunityId);if(e.continuityReference!==null)reference(e.continuityReference);
  const key=canonical([e.candidateId,e.species,e.evaluationReference]);check(!seen.has(key));seen.add(key);
 }
 h.entries.sort((a,b)=>{const x=canonical([a.evaluatedAt,a.candidateId,a.species,a.evaluationReference]),y=canonical([b.evaluatedAt,b.candidateId,b.species,b.evaluationReference]);return x<y?-1:x>y?1:0;});
 const contentDigest=hash(h);return freeze({...h,historyId:'osh-'+contentDigest,contentDigest});
}
