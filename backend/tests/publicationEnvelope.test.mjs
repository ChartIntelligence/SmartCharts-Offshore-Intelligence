import test from 'node:test';import assert from 'node:assert/strict';
import {fixtureInput,envelope} from './fixtures/rankedPublicationFixture.mjs';
import {validateRankedPublication,serializeRankedPublication,readRankedPublication,createRankedPublicationComposer,byteHash} from '../durableObserve/publicationEnvelope.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
test('actual producers preserve available, governed-zero, partial positive/zero, unavailable and empty cohort',async()=>{
 for(const [states,expected] of [[[ {adequate:true,positive:true} ],'available'],[[{adequate:true,positive:false}],'governed-zero'],[[{adequate:true,positive:true},'failed'],'partial'],[[{adequate:true,positive:false},'failed'],'partial'],[[{adequate:false,positive:false}],'unavailable'],[[],'unavailable']]){
  const p=await envelope(fixtureInput(states));assert.equal(p.producerBundle.evaluationState.state,expected);assert.equal(p.producerBundle.evaluationState.scope,'selected-analysis-cohort');assert.deepEqual(readRankedPublication(serializeRankedPublication(p)),p);
 }
});
test('lifecycle finished does not turn unavailable into zero; failed/delayed/running need no result',async()=>{
 for(const lifecycle of ['failed','delayed','running']){const x=fixtureInput();x.lifecycle=lifecycle;const p=await envelope(x);assert.equal(p.producerBundle,null);assert.equal(p.lifecycle,lifecycle);}
});
test('shell alone and missing state are rejected; changed order/score/confidence/state/bindings fail closed',async()=>{
 const p=await envelope(fixtureInput([{adequate:true,positive:true},{adequate:true,positive:true}]));assert.throws(()=>validateRankedPublication({status:'COMPLETED'}));
 for(const mutate of [p=>delete p.producerBundle.evaluationState,p=>p.producerBundle.delivery.opportunities.reverse(),p=>p.producerBundle.delivery.opportunities[0].score=999,p=>p.producerBundle.delivery.opportunities[0].confidence='forged',p=>p.producerBundle.binding.cycleId='different',p=>p.context.species='yellowfin',p=>p.producerBundle.inputsUsed[0].reference.sha256='0'.repeat(64)]){const v=structuredClone(p);mutate(v);assert.throws(()=>validateRankedPublication(v));}
});
test('caller mutation cannot change frozen validated producer/result/evidence bytes',async()=>{
 const x=fixtureInput(),p=await envelope(x),bytes=serializeRankedPublication(p);x.artifacts[0].content.states[0].positive=false;x.context.region.id='other';assert.equal(serializeRankedPublication(p),bytes);assert(Object.isFrozen(p.producerBundle.delivery));
});

test('composition rejects cross-cohort/context/species/cycle inputs and evidence acquired after cutoff',async()=>{
 for(const mutate of [x=>x.candidates[0].coordinates[0]=29,x=>x.context.region={id:'other',version:'v1'},x=>x.context.species='yellowfin',x=>x.cycle.scheduledAt='2026-10-06T04:00:00.000Z',x=>x.artifacts[0].receivedAt='2026-10-06T00:00:00.001Z',x=>x.artifacts[0].reference.sha256='0'.repeat(64),x=>x.context.userId='private']){const x=fixtureInput();mutate(x);await assert.rejects(envelope(x));}
 const c=await createRankedPublicationComposer({evaluate:async({binding})=>({binding:{...binding,cycleId:'wrong-evaluation'},results:[]})});await assert.rejects(c.compose(fixtureInput()));
});

test('recomputed outer digest cannot hide changed upstream order, confidence or evidence binding',async()=>{
 const p=await envelope(fixtureInput([{adequate:true,positive:true},{adequate:true,positive:true}]));
 for(const mutate of [x=>x.producerBundle.delivery.opportunities.reverse(),x=>x.producerBundle.delivery.opportunities[0].confidence='forged',x=>x.producerBundle.binding.evidenceSetId='wrong',x=>x.producerBundle.evaluationState.state='governed-zero',x=>x.producerBundle.inputsUsed[0].content.receiptStatus='fabricated']){
  const x=structuredClone(p);mutate(x);const {contentDigest,...body}=x;x.contentDigest=byteHash(exactJson(body));assert.throws(()=>validateRankedPublication(x));
 }
});
