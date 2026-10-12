import test from 'node:test';
import assert from 'node:assert/strict';
import {fixtureInput,composer} from './fixtures/rankedPublicationFixture.mjs';
import {buildUnifiedCaptainOpportunityDeliveryV1} from '../server.js';
import {buildGovernedOpportunityEvaluationStateV1} from '../opportunityEvaluationState.js';
import {createRankedPublicationComposer,validateRankedPublication,serializeRankedPublication,readRankedPublication,byteHash} from '../durableObserve/publicationEnvelope.mjs';
import {controlledQualification} from '../durableObserve/controlledPublicationBinding.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
const clock={now:()=> '2026-10-07T00:00:00.000Z'};
const bind=async x=>(await composer(x.artifacts[0].reference,clock)).compose(x);
const resign=p=>{const {contentDigest,...body}=p;return {...body,contentDigest:byteHash(exactJson(body))};};

test('existing producer outputs and all interpretations survive exact publication readback',async()=>{
 const p=await bind(fixtureInput([{adequate:true,positive:true},{adequate:true,positive:false},'failed',{adequate:true,positive:true}]));
 const b=p.producerBundle;
 const direct=buildUnifiedCaptainOpportunityDeliveryV1({species:p.context.species,speciesInterpretations:b.results.filter(r=>r.status==='fulfilled').map(r=>r.value)});
 assert.deepEqual(b.delivery,direct);
 assert.deepEqual(b.evaluationState,buildGovernedOpportunityEvaluationStateV1({candidates:b.candidates,results:b.results,delivery:direct,searchCounts:b.searchCounts}));
 assert(b.delivery.opportunities.length>0);assert(b.results.some(r=>r.status==='rejected'));
 const before=exactJson(b);const back=readRankedPublication(serializeRankedPublication(p));assert.equal(exactJson(back.producerBundle),before);
 assert.deepEqual(back.context,p.context);assert.deepEqual(back.cycle,p.cycle);assert.deepEqual(back.producerBundle.inputsUsed,b.inputsUsed);
});
for(const [name,states,expected] of [
 ['zero',[{adequate:true,positive:false}],'governed-zero'],
 ['partial-zero',[{adequate:true,positive:false},'failed'],'partial'],
 ['unavailable',[{adequate:false,positive:false}],'unavailable'],
 ['empty',[],'unavailable']
])test('preserve upstream '+name,async()=>{
 const p=await bind(fixtureInput(states));assert.equal(p.producerBundle.evaluationState.state,expected);
 assert.equal(readRankedPublication(serializeRankedPublication(p)).producerBundle.evaluationState.state,expected);
 if(expected!=='governed-zero'){const wrong=structuredClone(p);wrong.producerBundle.evaluationState.state='governed-zero';assert.throws(()=>validateRankedPublication(resign(wrong)));}
});
test('no eligibility, confidence, rank or identity can be minted by binding tampering',async()=>{
 const p=await bind(fixtureInput([{adequate:true,positive:true},{adequate:true,positive:true}]));
 for(const mutate of [
  x=>x.producerBundle.delivery.opportunities.reverse(),
  x=>x.producerBundle.delivery.opportunities[0].score=999,
  x=>x.producerBundle.delivery.opportunities[0].confidence='forged',
  x=>x.producerBundle.delivery.opportunities[0].id='invented',
  x=>x.producerBundle.binding.evidenceSetId='invented',
  x=>x.producerBundle.results[0].value.speciesOpportunity.eligibility.eligibleForRanking=false
 ]){const x=structuredClone(p);mutate(x);assert.throws(()=>validateRankedPublication(resign(x)));}
});
test('fixed explicit clock produces exact deterministic envelope and producer binding',async()=>{
 const x=fixtureInput();assert.equal(serializeRankedPublication(await bind(x)),serializeRankedPublication(await bind(x)));
});
test('changed context or evidence changes binding; previous binding rejected',async()=>{
 const a=await bind(fixtureInput());
 for(const x of [fixtureInput(undefined,undefined,'synthetic-other-context'),fixtureInput([{adequate:true,positive:false}])]){
  const b=await bind(x);assert.notEqual(exactJson(a.producerBundle.binding),exactJson(b.producerBundle.binding));
  const bad=structuredClone(b);bad.producerBundle.binding=structuredClone(a.producerBundle.binding);assert.throws(()=>validateRankedPublication(resign(bad)));
 }
 // Version address is context/cycle/revision, not content; a different evidence body may share that address but must have different content digest.
 const b=await bind(fixtureInput([{adequate:true,positive:false}]));assert.equal(b.versionId,a.versionId);assert.notEqual(b.contentDigest,a.contentDigest);
});
test('publication does not refresh cutoff, source age or manufacture receipt authority',async()=>{
 const x=fixtureInput(),p=await bind(x);assert.equal(p.assessmentCutoff,x.cycle.scheduledAt);assert(p.publicationAt>p.assessmentCutoff);
 assert.deepEqual(p.producerBundle.evidenceFreeze,x.evidenceFreeze);
 assert.equal(p.producerBundle.inputsUsed[0].content.sourceTime,x.artifacts[0].content.sourceTime);
 assert.equal(p.producerBundle.evidenceFreeze.entries[0].ageHours,80);
 assert.equal(p.producerBundle.inputsUsed[0].content.receiptStatus,'AS_OF_AUTHORITY_UNKNOWN');
});
test('publication readback never invokes supplied evaluation again',async()=>{
 const original=await bind(fixtureInput());let calls=0;
 const c=await createRankedPublicationComposer({clock,evaluate:async({binding,candidates},read)=>{
  calls++;for(const candidate of candidates)read(original.producerBundle.inputsUsed[0].reference,candidate.id);
  return {binding,results:original.producerBundle.results};
 }});
 const p=await c.compose(fixtureInput());assert.deepEqual(p.producerBundle.delivery,original.producerBundle.delivery);
 readRankedPublication(serializeRankedPublication(p));validateRankedPublication(p);assert.equal(calls,1);
});
test('controlled qualification limits remain unadmitted and history unavailable',()=>{
 assert.equal(controlledQualification.sourceAdmission,'NOT_SCIENTIFICALLY_ADMITTED');assert.equal(controlledQualification.history,'UNAVAILABLE');
 assert.equal(controlledQualification.historySourceReference,null);assert.equal(controlledQualification.operationalPublishing,false);assert.equal(controlledQualification.betaReady,false);
});
