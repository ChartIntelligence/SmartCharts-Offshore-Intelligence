// Pure, versioned controlled bridge validation. No scientific computation or I/O.
import {copy,keys,check,freeze,reference,utc} from '../../shared/oceanPublication.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
import {createHash} from 'node:crypto';
export const CONTROLLED_P4_ADAPTER='controlled-p2-p1-publication-explicit-assessment-v1';
export const CONTROLLED_P4_BUNDLE='pelora-controlled-retained-composition-bundle-v1';
export const same=(a,b)=>exactJson(a)===exactJson(b);
const hash=s=>createHash('sha256').update(s).digest('hex');
export const controlledQualification=freeze({scope:'CONTROLLED_CURRENT_EVIDENCE_ONLY',sourceAdmission:'NOT_SCIENTIFICALLY_ADMITTED',history:'UNAVAILABLE',historySourceReference:null,operationalPublishing:false,betaReady:false,cp10:'BLOCKED'});
export function validateControlledConfigurationBinding(c){
 check(c.clockMode==='CONTROLLED_FIXTURE'&&c.scopes.length===0&&!c.requireHistoricalReceipt);
 keys(c.controlledSupply,['referenceSetReference','originalCohortReference','originalCandidates','staticParents']);reference(c.controlledSupply.referenceSetReference);reference(c.controlledSupply.originalCohortReference);
 const raw=c.controlledSupply.originalCandidates;
 check(raw.length===c.candidates.length&&raw.length===c.controlledSupply.staticParents.length&&raw.length>0);
 check(c.controlledSupply.originalCohortReference.sha256===hash(exactJson(raw)));
 for(let i=0;i<raw.length;i++){check(!Object.hasOwn(raw[i],'eligibility'));const {eligibility,...snapshot}=c.candidates[i];check(same(snapshot,raw[i])&&eligibility&&typeof eligibility.eligible==='boolean');}
}
export function validateControlledBundle(input,cutoff){
 const b=copy(input);keys(b,['contractVersion','assessmentCutoff','constructedAt','qualification','referenceSetReference','referenceSet','records','compositionInput','candidateBinding']);
 check(b.contractVersion===CONTROLLED_P4_BUNDLE&&b.assessmentCutoff===cutoff&&utc(b.constructedAt)>=cutoff&&same(b.qualification,controlledQualification));
 reference(b.referenceSetReference);check(b.referenceSetReference.sha256===hash(exactJson(b.referenceSet)));
 check(b.compositionInput.context.sourceAuthority==='CONTROLLED_FIXTURE'&&b.compositionInput.assessment.assessmentAt===cutoff&&same(b.compositionInput.history,{state:'UNAVAILABLE',reason:'shared-scientific-history-unavailable-for-p1',sourceReference:null}));
 check(same(b.referenceSet.assessment,b.compositionInput.assessment)&&same(b.referenceSet.context,b.compositionInput.context));
 const {digest,...set}=b.referenceSet;check(digest===hash(exactJson(set)));
 const records=new Map();for(const r of b.records){keys(r,['reference','recordText','digest','retainedAt']);reference(r.reference);check(typeof r.retainedAt==='string'&&Number.isFinite(Date.parse(r.retainedAt))&&Date.parse(r.retainedAt)<=Date.parse(b.constructedAt));check(r.digest===hash(r.recordText));const v=JSON.parse(r.recordText);check(exactJson(v)===r.recordText&&v.sourceClass==='CONTROLLED_FIXTURE'&&v.type==='P1_EXACT_ARTIFACT'&&v.admission==='NOT_SCIENTIFICALLY_ADMITTED'&&same(v.artifact.reference,r.reference)&&r.reference.sha256===hash(exactJson(v.artifact.content)));const key=exactJson(r.reference);check(!records.has(key));records.set(key,v.artifact);}
 check(same(b.records.map(r=>r.reference),b.referenceSet.references));
 function expand(v){if(!v||typeof v!=='object')return v;if(Object.hasOwn(v,'retainedReference')){keys(v,['retainedReference']);const found=records.get(exactJson(v.retainedReference));check(found);return found;}return Array.isArray(v)?v.map(expand):Object.fromEntries(Object.entries(v).map(([k,c])=>[k,expand(c)]));}check(same(expand(b.referenceSet.template),b.compositionInput));
 function verify(v){if(!v||typeof v!=='object')return;if(v.reference?.kind==='captured'&&Object.hasOwn(v,'content'))check(same(v,records.get(exactJson(v.reference))));Object.values(v).forEach(verify);}verify(b.compositionInput);
 const cb=b.candidateBinding;keys(cb,['originalCohortReference','originalCandidates','staticParents','derivedCandidates','publicationCohortReference']);
 check(same(cb.originalCohortReference,b.compositionInput.context.cohortReference)&&same(cb.originalCandidates,b.compositionInput.entries.map(e=>e.candidate.content))&&same(cb.staticParents,b.compositionInput.entries.map(e=>e.staticParent.content)));
 check(cb.derivedCandidates.length===cb.originalCandidates.length);
 for(let i=0;i<cb.derivedCandidates.length;i++){const {eligibility,...raw}=cb.derivedCandidates[i];check(same(raw,cb.originalCandidates[i])&&eligibility&&typeof eligibility.eligible==='boolean');}
 reference(cb.publicationCohortReference);check(cb.publicationCohortReference.sha256===hash(exactJson(cb.derivedCandidates)));
 return freeze(b);
}
export function validateControlledComposition(output,bundle,results,delivery,state){
 check(output.contractVersion==='pelora-retained-blue-marlin-composition-output-v1'&&output.qualificationScope==='CONTROLLED_CURRENT_EVIDENCE_ONLY');
 check(same(output.assessment,bundle.compositionInput.assessment)&&same(output.context,bundle.compositionInput.context)&&same(output.history,bundle.compositionInput.history));
 check(same(results,output.evaluations.map(e=>({candidate:e.candidate,status:'fulfilled',value:e.interpretation})))&&same(delivery,output.delivery)&&same(state,output.evaluationState));
 check(same(output.evaluations.map(e=>e.candidate),bundle.candidateBinding.derivedCandidates));
 for(const used of output.inputsUsed){const r=bundle.records.find(r=>same(r.reference,used.reference));check(r&&same(JSON.parse(r.recordText).artifact.content,used.content));}
 check(Array.isArray(output.limitations)&&output.limitations.includes('not-operational-science')&&output.limitations.includes('not-beta-readiness'));
}
