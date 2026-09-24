import test from 'node:test';
import assert from 'node:assert/strict';
import {cycleV1,cycleV2,publicationV1,publicationV2,validatePublicationV1,validatePublicationV2,
  freezeEvidenceV1,assessmentContextV2,hash,ASSESSMENT_POLICY_V1} from '../../shared/oceanPublication.mjs';
import {runPublicationCycleV2,writePublicationV2,readLatestPublicationV2,pointerKeyV1,pointerKeyV2} from '../oceanState/publicationWorker.mjs';
const clone=structuredClone;
const ref=id=>({kind:'captured',referenceId:id,contractVersion:'synthetic-test-v1',sha256:hash(id)});
const scheduled='2026-09-24T12:00:00.000Z';
const evaluator='synthetic-test-explicit-assessment-v1';
function cycleInput(at=scheduled){return {scheduledAt:at,region:{id:'test-region',version:'1'},configuration:{id:'test-analysis',version:'2',governanceReference:'test-only',evaluatorVersion:evaluator,candidateUniverseVersion:'1',species:['blue-marlin'],families:['SST'],candidateUniverse:{reference:ref('universe'),candidateIds:['a','b']}}};}
function entries(c){return [{family:'SST',status:'UNAVAILABLE',reason:'test-unavailable',reference:null,product:null,representedAt:null,support:{kind:'unknown',start:null,end:null},qualification:{status:'UNKNOWN',policyReference:'test-only'},admissibility:{status:'UNASSESSED',policyReference:'test-only'},assessedAt:c.scheduledAt,ageHours:null,qualityReferences:[],lineageReferences:[]}];}
function input(version=2){
  const cycle=(version===2?cycleV2:cycleV1)(cycleInput()),evidence=freezeEvidenceV1(cycle,entries(cycle));
  return {cycle,evidence,attempt:{id:'first',startedAt:'2026-09-24T12:07:00Z',endedAt:'2026-09-24T12:09:00Z'},evaluation:{evaluatorVersion:evaluator,evidenceSetId:evidence.evidenceSetId,...(version===2?{assessmentAt:scheduled}:{}),candidateResults:cycle.configuration.candidateUniverse.candidateIds.map(candidateId=>({candidateId,species:'blue-marlin',evaluationReference:ref(candidateId),gate:{contractVersion:'pelora-unified-opportunity-ranking-input-v1',eligibleForRanking:false,reasons:['insufficient-evidence']},opportunityId:null,continuityReference:null,usedFamilies:[]})),signalReferences:[],lineageReferences:[]}};
}
function fixture(){
 const records=new Map(),claims=new Set();let pointer=null,version=0;
 const calls={evaluate:0,write:0,cas:0,seen:[]};
 const port={
  readExact:async id=>records.has(id)?{status:'FOUND',durable:true,record:clone(records.get(id))}:{status:'NOT_FOUND'},
  createIfAbsent:async(id,p)=>{calls.write++;const exists=records.has(id);if(!exists)records.set(id,clone(p));return {status:exists?'EXISTS':'CREATED',durable:true,record:clone(records.get(id))};},
  readLatest:async key=>clone(pointer??{key,version:'v0',target:null}),
  compareAndSet:async({key,expected,target})=>{calls.cas++;const actual=await port.readLatest(key);if(JSON.stringify(expected)!==JSON.stringify(actual))return {status:'CONFLICT',durable:true,snapshot:actual};pointer={key,version:`v${++version}`,target:clone(target)};return {status:'ADVANCED',durable:true,snapshot:clone(pointer)};},
  claim:async r=>{const held=claims.has(r.cycleId);claims.add(r.cycleId);return {...r,status:held?'HELD':'ACQUIRED'};},
  collectEvidence:async c=>entries(c),verifyEvidence:async e=>({status:'VERIFIED',evidenceSetId:e.evidenceSetId}),
  evaluate:async ({cycle,evidence,assessment})=>{
   calls.evaluate++;assert(Object.isFrozen(assessment));assert.equal(assessment.contractVersion,ASSESSMENT_POLICY_V1);
   const results=cycle.configuration.candidateUniverse.candidateIds.map(candidateId=>{
    calls.seen.push(assessment.assessmentAt);
    return {candidateId,species:'blue-marlin',interpretation:{candidate:{id:candidateId},species:'blue-marlin',available:true,speciesOpportunity:{available:true,score:999,eligibility:{eligibleForRanking:false}}},evaluationReference:ref(candidateId),opportunityId:null,continuityReference:null,usedFamilies:[]};
   });
   return {evaluatorVersion:cycle.configuration.evaluatorVersion,evidenceSetId:evidence.evidenceSetId,assessmentAt:assessment.assessmentAt,results,signalReferences:[],lineageReferences:[]};
  },finishedAt:async()=> '2026-09-24T12:09:00Z'
 };
 const request={cycle:cycleInput(),attemptId:'first',startedAt:'2026-09-24T12:07:00Z',assessedAt:'2026-09-24T12:10:00Z'};
 return {port,request,records,calls,run:()=>runPublicationCycleV2(request,port)};
}

test('valid v2 separates cycle, scientific assessment and delayed execution',()=>{
 const p=publicationV2(input());assert.equal(p.contractVersion,'pelora-governed-ocean-publication-v2');
 assert.equal(p.evaluation.assessmentAt,scheduled);assert.equal(p.evidence.entries[0].assessedAt,scheduled);
 assert.equal(p.attempt.startedAt,'2026-09-24T12:07:00.000Z');assert.deepEqual(validatePublicationV2(p),p);
});
for(const [name,value] of Object.entries({missing:undefined,malformed:'bad',offset:'2026-09-24T08:00:00-04:00',precision:'2026-09-24T12:00:00.0001Z',before:'2026-09-24T11:59:59Z',after:'2026-09-24T12:00:01Z',execution:'2026-09-24T12:07:00Z',number:NaN,object:new Date(scheduled),null:null})) {
 test(`reject ${name} scientific assessment`,()=>{const p=input();if(value===undefined)delete p.evaluation.assessmentAt;else p.evaluation.assessmentAt=value;assert.throws(()=>publicationV2(p));});
}
test('canonical seconds and milliseconds normalize to same assessment and identity',()=>{const p=input(),a=publicationV2(p);p.evaluation.assessmentAt='2026-09-24T12:00:00Z';assert.deepEqual(publicationV2(p),a);});
test('family assessment remains cycle-bound',()=>{const c=cycleV2(cycleInput()),e=entries(c);e[0].assessedAt='2026-09-24T12:07:00Z';assert.throws(()=>freezeEvidenceV1(c,e));});
test('conflicting and private fields cannot use assessment context as escape hatch',()=>{
 for(const key of ['assessment','captainId','origin','range','email','catch','assessment_at']){const p=input();p.evaluation[key]={assessmentAt:scheduled};assert.throws(()=>publicationV2(p));}
 const p=input();p.attempt.assessmentAt=scheduled;assert.throws(()=>publicationV2(p));
});
test('nested assessment input accessor rejected without execution',()=>{let invoked=false;const p=input();Object.defineProperty(p.evaluation,'assessmentAt',{enumerable:true,get(){invoked=true;return scheduled;}});assert.throws(()=>publicationV2(p));assert.equal(invoked,false);});
test('wall clock is not read for reconstruction or assessment context',t=>{
 t.mock.method(Date,'now',()=>{throw Error('wall clock forbidden');});const p=publicationV2(input());assert.deepEqual(validatePublicationV2(p),p);assert.equal(assessmentContextV2(p.cycle).assessmentAt,scheduled);
});
test('later replay execution changes integrity but not scientific content identity',()=>{
 const p=input(),a=publicationV2(p);p.attempt={id:'replay',startedAt:'2026-09-27T12:07:00Z',endedAt:'2026-09-27T12:09:00Z'};const b=publicationV2(p);
 assert.equal(a.publicationId,b.publicationId);assert.equal(a.contentDigest,b.contentDigest);assert.notEqual(a.integrityDigest,b.integrityDigest);assert.equal(b.evaluation.assessmentAt,scheduled);
});
test('changed scientific assessment alone rejected; different valid cycle changes identity',()=>{
 const a=publicationV2(input()),p=input();p.cycle=cycleV2(cycleInput('2026-09-24T16:00:00Z'));p.evidence=freezeEvidenceV1(p.cycle,entries(p.cycle));p.evaluation.assessmentAt=p.cycle.scheduledAt;p.evaluation.evidenceSetId=p.evidence.evidenceSetId;p.attempt={id:'later',startedAt:'2026-09-24T16:07:00Z',endedAt:'2026-09-24T16:09:00Z'};
 const b=publicationV2(p);assert.notEqual(a.publicationId,b.publicationId);assert.notEqual(a.contentDigest,b.contentDigest);
});
test('v1 remains v1 without invented assessment; validators do not cross-upgrade',()=>{
 const a=publicationV1(input(1)),b=publicationV2(input());assert.equal(a.contractVersion,'pelora-governed-ocean-publication-v1');assert(!Object.hasOwn(a.evaluation,'assessmentAt'));assert.deepEqual(validatePublicationV1(a),a);
 assert.throws(()=>validatePublicationV2(a));assert.throws(()=>validatePublicationV1(b));assert.notEqual(a.publicationId,b.publicationId);assert.notEqual(pointerKeyV1(a.cycle),pointerKeyV2(b.cycle));
});
test('v2 requires explicit evaluator identity opt-in',()=>{const c=cycleInput();c.configuration.evaluatorVersion='implicit-clock-v1';assert.throws(()=>cycleV2(c));assert.doesNotThrow(()=>cycleV1(c));});
test('worker explicitly supplies same frozen instant for complete candidate universe',async()=>{const f=fixture(),r=await f.run();assert.equal(r.status,'COMPLETED');assert.equal(r.contractVersion,'pelora-ocean-publication-worker-v2');assert.deepEqual(f.calls.seen,[scheduled,scheduled]);assert.equal(r.publication.evaluation.candidateResults.length,2);assert(r.publication.evaluation.candidateResults.every(x=>!x.gate.eligibleForRanking));});
for(const kind of ['missing','wrong','private'])test(`worker rejects ${kind} evaluator assessment output`,async()=>{
 const f=fixture(),evaluate=f.port.evaluate;f.port.evaluate=async arg=>{const r=await evaluate(arg);if(kind==='missing')delete r.assessmentAt;else if(kind==='wrong')r.assessmentAt='2026-09-24T12:07:00Z';else r.assessment={captainId:'no'};return r;};
 assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.calls.write,0);assert.equal(f.calls.cas,0);
});
test('durable retry reuses original accepted attempt and does not reevaluate',async()=>{
 const f=fixture(),first=await f.run();f.request.attemptId='retry';f.request.startedAt='2026-09-27T12:07:00Z';f.request.assessedAt='2026-09-27T12:10:00Z';
 const retry=await f.run();assert.equal(retry.status,'POINTER_ALREADY_CURRENT');assert.deepEqual(retry.publication,first.publication);assert.equal(f.calls.evaluate,1);
 const p=clone(first.publication);const retryInput={cycle:p.cycle,evidence:p.evidence,evaluation:p.evaluation,attempt:{id:'late',startedAt:'2026-09-27T12:07:00Z',endedAt:'2026-09-27T12:09:00Z'}};
 const accepted=await writePublicationV2(f.port,publicationV2(retryInput));assert.equal(accepted.status,'EXISTS');assert.deepEqual(accepted.publication,first.publication);
});
for(const kind of ['missing','false','pending','wrong-assessment','corrupt-readback'])test(`durability ${kind} prevents pointer advancement`,async()=>{
 const f=fixture(),write=f.port.createIfAbsent;f.port.createIfAbsent=async(...args)=>{const a=await write(...args);if(kind==='missing')delete a.durable;if(kind==='false')a.durable=false;if(kind==='pending')a.status='PENDING';if(kind==='wrong-assessment')a.record.evaluation.assessmentAt='2026-09-24T12:07:00Z';if(kind==='corrupt-readback')f.records.get(args[0]).evaluation.assessmentAt='2026-09-24T12:07:00Z';return a;};
 assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.calls.cas,0);
});
test('latest reads verify exact v2 assessment and digest; corruption has no fallback',async()=>{
 const f=fixture(),r=await f.run();const latest=await readLatestPublicationV2(f.port,cycleInput(),'2026-09-27T12:10:00Z');assert.equal(latest.publication.evaluation.assessmentAt,scheduled);assert(latest.ageHours>72);
 f.records.get(r.publication.publicationId).evaluation.assessmentAt='2026-09-27T12:00:00Z';await assert.rejects(readLatestPublicationV2(f.port,cycleInput(),'2026-09-27T12:10:00Z'));
});
test('CAS conflict remains explicit',async()=>{const f=fixture();f.port.compareAndSet=async()=>({status:'CONFLICT',durable:true,snapshot:null});assert.equal((await f.run()).status,'POINTER_CONFLICT');});
test('cycle cannot be after declared execution start',async()=>{const f=fixture();f.request.startedAt='2026-09-24T11:59:59Z';assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.calls.evaluate,0);});
test('accepted nested record and evaluator assessment are immutable',async()=>{const f=fixture(),r=await f.run();assert.throws(()=>{r.publication.evaluation.assessmentAt='changed';});const p=input(),accepted=publicationV2(p);p.evaluation.assessmentAt='changed';assert.equal(accepted.evaluation.assessmentAt,scheduled);});
test('assessment-context constructor validates without executing caller accessors',()=>{
 let invoked=false;const c=clone(cycleV2(cycleInput()));Object.defineProperty(c,'contractVersion',{enumerable:true,get(){invoked=true;return 'pelora-governed-ocean-publication-v2';}});
 assert.throws(()=>assessmentContextV2(c));assert.equal(invoked,false);assert.throws(()=>assessmentContextV2(cycleV1(cycleInput())));
});

// Adversarial review: checkpoint-derived golden digests, not amended-code snapshots.
// Source: HEAD 1f69f79fbd6e02936e09e0fd727b0eb8b925d7e8 v1 modules.
import {createHash} from 'node:crypto';
import {writePublicationV1,readLatestPublicationV1} from '../oceanState/publicationWorker.mjs';
test('checkpoint v1 full serialization, all content and execution metadata remain identical',async()=>{
 const p=publicationV1(input(1));
 assert.equal(createHash('sha256').update(JSON.stringify(p)).digest('hex'),'8c73043f70ca2e294cefcd454a8d37640e3cacc91addeea149eb974681105fd6');
 assert.equal(p.contentDigest,'52c785027d71cf951d48dcb42b1563d5a755fd8107a9b329f8bb648c95582ef6');
 assert.equal(p.integrityDigest,'8702d8a80162918a821d05179097573344d0b0e0ac795cd6c2598321ccc18867');
 assert.equal(p.cycle.cycleId,'ocycle-37e2242a6d770c99bd11e835f6631ad9feaa0b89712297ea83b466e20465d9cd');
 const key=pointerKeyV1(p.cycle);assert.equal(key,'latest-publication-1c5b45dec51410cb48bfc77badcd7fa488abc5704dad8f80adf67332ab39ef39');
 const f=fixture(),written=await writePublicationV1(f.port,p);assert.deepEqual(written.publication,p);
 const target={publicationId:p.publicationId,cycleId:p.cycle.cycleId,scheduledAt:p.cycle.scheduledAt,contentDigest:p.contentDigest,integrityDigest:p.integrityDigest};
 f.port.readLatest=async()=>({key,version:'golden',target});
 const latest=await readLatestPublicationV1(f.port,cycleInput(),'2026-09-27T12:10:00Z');assert.deepEqual(latest.publication,p);
 assert(!Object.hasOwn(latest.publication.evaluation,'assessmentAt'));
});
for(const [name,value] of Object.entries({empty:'',space:' ',local:'2026-09-24T12:00:00',offsetZero:'2026-09-24T12:00:00+00:00',array:[],plain:{},shortPrecision:'2026-09-24T12:00:00.0Z',beforeMs:'2026-09-24T11:59:59.999Z',afterMs:'2026-09-24T12:00:00.001Z',badCalendar:'2026-02-30T12:00:00Z',endTime:'2026-09-24T12:09:00Z'}))test(`hostile assessment ${name}`,()=>{
 const p=input();p.evaluation.assessmentAt=value;assert.throws(()=>publicationV2(p));
});
test('inherited assessment rejected at publication and evaluator boundaries',async()=>{
 const p=input();delete p.evaluation.assessmentAt;Object.setPrototypeOf(p.evaluation,{assessmentAt:scheduled});assert.throws(()=>publicationV2(p));
 const f=fixture(),evaluate=f.port.evaluate;f.port.evaluate=async a=>{const r=await evaluate(a);delete r.assessmentAt;Object.setPrototypeOf(r,{assessmentAt:scheduled});return r;};assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.calls.write,0);
});
test('family field cannot be removed or substituted into execution/evaluation schema',()=>{
 const p=input(),raw=entries(p.cycle);delete raw[0].assessedAt;assert.throws(()=>freezeEvidenceV1(p.cycle,raw));
 delete p.evaluation.assessmentAt;p.evaluation.assessedAt=scheduled;assert.throws(()=>publicationV2(p));
});
for(const kind of ['wrong-contract','accessor','family-location','execution-end'])test(`evaluator acknowledgement ${kind} rejected`,async()=>{
 const f=fixture(),evaluate=f.port.evaluate;let invoked=false;
 f.port.evaluate=async a=>{const r=await evaluate(a);
 if(kind==='wrong-contract')r.contractVersion='wrong-assessment-policy';
 if(kind==='accessor')Object.defineProperty(r,'assessmentAt',{enumerable:true,get(){invoked=true;return scheduled;}});
 if(kind==='family-location'){delete r.assessmentAt;r.assessedAt=scheduled;}
 if(kind==='execution-end')r.assessmentAt='2026-09-24T12:09:00Z';
 return r;};assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.calls.cas,0);assert.equal(invoked,false);
});
for(const value of ['','implicit-v1','test-explicit-assessment-v1-extra','test-explicit-assessment-v10','explicit-assessment-v1','test-EXPLICIT-ASSESSMENT-v1'])test(`reject deceptive evaluator ID ${JSON.stringify(value)}`,()=>{
 const c=cycleInput();c.configuration.evaluatorVersion=value;assert.throws(()=>cycleV2(c));
});
test('evaluator cannot replace frozen context or caller-detached cycle',async()=>{
 const f=fixture(),evaluate=f.port.evaluate;
 f.port.evaluate=async arg=>{const original=arg.assessment;
 assert.throws(()=>{arg.assessment={assessmentAt:'changed'};});assert.throws(()=>{arg.assessment.assessmentAt='changed';});
 f.request.cycle.scheduledAt='2026-09-27T12:00:00Z';assert.equal(arg.cycle.scheduledAt,scheduled);assert.strictEqual(arg.assessment,original);
 return evaluate(arg);};assert.equal((await f.run()).status,'COMPLETED');assert.deepEqual(f.calls.seen,[scheduled,scheduled]);
});
test('declared execution exactly on cycle allowed; one millisecond early rejected',async()=>{
 const good=fixture();good.request.startedAt=scheduled;assert.equal((await good.run()).status,'COMPLETED');
 const early=fixture();early.request.startedAt='2026-09-24T11:59:59.999Z';assert.equal((await early.run()).status,'CYCLE_FAILED');assert.equal(early.calls.evaluate,0);
});
test('accepted record verification is identical under Sep24 and Sep27 replay clocks',t=>{
 const clock=t.mock.method(Date,'now',()=>Date.parse('2026-09-24T12:10:00Z'));const p=publicationV2(input()),a=validatePublicationV2(p);
 clock.mock.mockImplementation(()=>Date.parse('2026-09-27T12:10:00Z'));assert.deepEqual(validatePublicationV2(p),a);
});
test('same-cycle changed evidence and universe require explicit reconciliation',async()=>{
 const f=fixture();await f.run();f.port.collectEvidence=async c=>{const e=entries(c);e[0].reason='changed';return e;};assert.equal((await f.run()).status,'SAME_CYCLE_EVIDENCE_CONFLICT');
 const u=fixture();await u.run();u.request.cycle.configuration.candidateUniverse.candidateIds.push('c');assert.equal((await u.run()).status,'SAME_CYCLE_CONFIGURATION_CONFLICT');
});
test('changed evaluator identity produces distinct cycle and pointer namespace',()=>{
 const a=cycleV2(cycleInput()),c=cycleInput();c.configuration.evaluatorVersion='other-explicit-assessment-v1';const b=cycleV2(c);assert.notEqual(a.cycleId,b.cycleId);assert.notEqual(pointerKeyV2(a),pointerKeyV2(b));
});
test('CREATED acknowledgement cannot rewrite accepted execution metadata',async()=>{
 const f=fixture(),write=f.port.createIfAbsent;f.port.createIfAbsent=async(...args)=>{const a=await write(...args),p=a.record;a.record=publicationV2({cycle:p.cycle,evidence:p.evidence,evaluation:p.evaluation,attempt:{...p.attempt,id:'replacement'}});return a;};
 assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.calls.cas,0);
});
test('missing assessment in durable readback cannot advance latest',async()=>{
 const f=fixture(),write=f.port.createIfAbsent;f.port.createIfAbsent=async(...args)=>{const a=await write(...args);delete f.records.get(args[0]).evaluation.assessmentAt;return a;};assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.calls.cas,0);
});
for(const field of ['boat','captainId','email','authUuid','origin','range','fishingLog','catch','mission'])test(`v2 rejects dedicated private interpretation field ${field}`,async()=>{
 const f=fixture(),evaluate=f.port.evaluate;f.port.evaluate=async a=>{const r=await evaluate(a);r.results[0].interpretation[field]='PRIVATE-SYNTHETIC-TEST';return r;};assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.calls.write,0);
});
