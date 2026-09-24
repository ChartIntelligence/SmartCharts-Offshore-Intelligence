import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {syntheticScalarFrame} from './fixtures/syntheticScalarFrame.js';
import {writeOceanArchiveV1,readOceanArchiveV1} from '../../shared/oceanProductArchive.mjs';
import {cycleV1,freezeEvidenceV1,publicationV1,validatePublicationV1,copy,canonical,hash} from '../../shared/oceanPublication.mjs';
import {runPublicationCycleV1,readLatestPublicationV1,writePublicationV1,pointerKeyV1,targetV1,CRASH_WINDOWS} from '../oceanState/publicationWorker.mjs';

const clone=structuredClone;
const ref=n=>({kind:'captured',referenceId:n,contractVersion:'synthetic-capture-v1',sha256:hash(n)});
const sst={kind:'archive',archiveId:`opf-${createHash('sha256').update('sst-frame').digest('hex')}`,frameId:'sst-frame',receiptDigest:hash('receipt'),contentDigest:hash('science')};
const cycleInput=(hour=0)=>({scheduledAt:`2026-09-24T${String(hour).padStart(2,'0')}:00:00Z`,region:{id:'gulf',version:'1'},configuration:{id:'governed-analysis',version:'1',governanceReference:'synthetic-only-policy',evaluatorVersion:'existing-gate-fixture-v1',candidateUniverseVersion:'declared-universe-v1',species:['blue-marlin'],families:['SST','chlorophyll'],candidateUniverse:{reference:ref('universe'),candidateIds:['near','far']}}});
const input=(hour=0)=>({cycle:cycleInput(hour),attemptId:`attempt-${hour}`,startedAt:`2026-09-24T${String(hour).padStart(2,'0')}:01:00Z`,assessedAt:`2026-09-24T${String(hour).padStart(2,'0')}:02:00Z`});
function entries(c){return [
  {family:'SST',status:'AVAILABLE',reason:'synthetic-admission',reference:clone(sst),product:{providerId:'synthetic',productId:'synthetic-sst',evidenceClass:'ANALYSIS'},representedAt:'2026-09-23T12:00:00Z',support:{kind:'unknown',start:null,end:null},qualification:{status:'QUALIFIED',policyReference:'synthetic-only'},admissibility:{status:'ADMISSIBLE',policyReference:'synthetic-only'},assessedAt:c.scheduledAt,ageHours:(Date.parse(c.scheduledAt)-Date.parse('2026-09-23T12:00:00Z'))/3600000,qualityReferences:[ref('quality')],lineageReferences:[ref('lineage')]},
  {family:'chlorophyll',status:'UNAVAILABLE',reason:'no-captured-evidence',reference:null,product:null,representedAt:null,support:{kind:'unknown',start:null,end:null},qualification:{status:'UNKNOWN',policyReference:'chl-policy-separate'},admissibility:{status:'UNASSESSED',policyReference:'chl-policy-separate'},assessedAt:c.scheduledAt,ageHours:null,qualityReferences:[],lineageReferences:[]}
];}
function evaluation({cycle,evidence},eligible=false){return {evaluatorVersion:'existing-gate-fixture-v1',evidenceSetId:evidence.evidenceSetId,
  results:cycle.configuration.candidateUniverse.candidateIds.flatMap(candidateId=>cycle.configuration.species.map(species=>({candidateId,species,
    interpretation:{candidate:{id:candidateId},species,available:true,speciesOpportunity:{available:true,score:90,eligibility:{eligibleForRanking:eligible}}},
    evaluationReference:ref(`evaluation-${candidateId}`),opportunityId:`continuity-${candidateId}`,continuityReference:ref(`continuity-${candidateId}`),usedFamilies:['SST']}))),signalReferences:[ref('signal')],lineageReferences:[ref('analysis-lineage')]};}
// Test ports simulate atomic single-process operations only. They establish no production durability.
function fixture(){
  const records=new Map(),pointers=new Map(),claims=new Set(),calls={claim:0,write:0,evaluate:0,verify:0};
  let version=0;
  const port={
    readExact:async key=>records.has(key)?{status:'FOUND',durable:true,record:clone(records.get(key))}:{status:'NOT_FOUND'},
    createIfAbsent:async(key,p)=>{calls.write++;const exists=records.has(key);if(!exists)records.set(key,clone(p));return {status:exists?'EXISTS':'CREATED',durable:true,record:clone(records.get(key))};},
    readLatest:async key=>clone(pointers.get(key)??{key,version:'v0',target:null}),
    compareAndSet:async({key,expected,target})=>{const old=await port.readLatest(key);if(canonical(old)!==canonical(expected))return {status:'CONFLICT',durable:true,snapshot:old};const snapshot={key,version:`v${++version}`,target:clone(target)};pointers.set(key,snapshot);return {status:'ADVANCED',durable:true,snapshot:clone(snapshot)};},
    claim:async r=>{calls.claim++;const held=claims.has(r.cycleId);claims.add(r.cycleId);return {...r,status:held?'HELD':'ACQUIRED'};},
    collectEvidence:async c=>entries(c),
    verifyEvidence:async e=>{calls.verify++;return {status:'VERIFIED',evidenceSetId:e.evidenceSetId};},
    evaluate:async arg=>{calls.evaluate++;return evaluation(arg);},
    finishedAt:async()=> '2026-09-24T00:01:30Z'
  };
  const run=async(hour=0)=>{port.finishedAt=async()=>`2026-09-24T${String(hour).padStart(2,'0')}:01:30Z`;return runPublicationCycleV1(input(hour),port);};
  return {port,records,pointers,claims,calls,run};
}
const good=async()=>{const f=fixture();const r=await f.run();assert.equal(r.status,'COMPLETED');return {...f,result:r,p:r.publication};};

test('four-hour UTC cycle identity, normalization and region/config authority',()=>{
  const ids=[0,4,8,12,16,20].map(h=>cycleV1(cycleInput(h)).cycleId);assert.equal(new Set(ids).size,6);
  const a=cycleInput();const b=clone(a);b.scheduledAt=b.scheduledAt.replace('Z','.000Z');b.configuration.candidateUniverse.candidateIds.reverse();assert.deepEqual(cycleV1(a),cycleV1(b));
  b.region.id='atlantic';assert.notEqual(cycleV1(a).cycleId,cycleV1(b).cycleId);b.region=a.region;b.configuration.version='2';assert.notEqual(cycleV1(a).cycleId,cycleV1(b).cycleId);
  for(const t of ['2026-09-24T01:00:00Z','2026-09-24T04:00:01Z','2026-09-24T04:00:00-04:00','2026-02-30T00:00:00Z'])assert.throws(()=>cycleV1({...a,scheduledAt:t}));
});
test('species-neutral shell; unsupported current pathways fail closed',()=>{
  const c=cycleInput();c.configuration.species=[];assert.throws(()=>cycleV1(c));
  for(const s of ['yellowfin-tuna','blackfin-tuna','mahi','sailfish','white-marlin','wahoo','unknown']){c.configuration.species=[s];assert.throws(()=>cycleV1(c));}
});
test('exact frozen SST receipt, lineage and incomplete family availability',()=>{
  const c=cycleV1(cycleInput()),raw=entries(c),e=freezeEvidenceV1(c,raw);assert.deepEqual(e.entries.find(x=>x.family==='SST').reference,sst);
  raw[0].reference.frameId='changed';assert.equal(e.entries.find(x=>x.family==='SST').reference.frameId,'sst-frame');assert(Object.isFrozen(e.entries[0].lineageReferences));
  assert.equal(e.entries.find(x=>x.family==='chlorophyll').status,'UNAVAILABLE');assert.throws(()=>freezeEvidenceV1(c,raw.slice(0,1)));
});
test('admissibility is family-specific; future/incorrect age and unavailable admission fail',()=>{
  const c=cycleV1(cycleInput());for(const mutate of [e=>e[0].ageHours=0,e=>e[0].representedAt='2026-09-25T00:00:00Z',e=>e[1].admissibility.status='ADMISSIBLE',e=>e[0].qualification.status='UNKNOWN']){const e=entries(c);mutate(e);assert.throws(()=>freezeEvidenceV1(c,e));}
});
test('provider locator cannot replace exact evidence identity',()=>{
  const c=cycleV1(cycleInput()),e=entries(c);e[0].reference={kind:'captured',referenceId:'https://provider/latest',contractVersion:'x',sha256:hash('x')};assert.throws(()=>freezeEvidenceV1(c,e));
});
test('real archive contract receipt is verified and reused without modifying archived evidence',async()=>{
  let stored=null;const archive={createIfAbsent:async(key,record)=>{const exists=stored!==null;if(!exists)stored=clone(record);return {outcome:exists?'exists':'created',durable:true,record:clone(stored)};},readExact:async()=>stored?{status:'found',durable:true,record:clone(stored)}:{status:'not-found'}};
  const frame=syntheticScalarFrame('sst-frame');frame.temporal.observationTime='2026-09-23T12:00:00Z';
  const result=await writeOceanArchiveV1(archive,frame,{writeId:'synthetic-write',archivedAt:'2026-09-23T13:00:00Z',storageReference:'synthetic-memory',sourceRevision:'one',rawEvidence:[]});assert.equal(result.status,'ARCHIVED');
  const receipt=result.receipt,exact={kind:'archive',archiveId:receipt.archiveId,frameId:receipt.frameId,receiptDigest:receipt.receiptDigest,contentDigest:receipt.contentDigest};const before=canonical(stored),f=fixture();
  f.port.collectEvidence=async c=>{const e=entries(c);e[0].reference=clone(exact);e[0].product={providerId:receipt.product.providerId,productId:receipt.product.productId,evidenceClass:receipt.product.evidenceClass};e[0].support=clone(receipt.temporal.support);return e;};
  f.port.verifyEvidence=async e=>{const read=await readOceanArchiveV1(archive,{archiveId:exact.archiveId,frameId:null});assert.equal(read.status,'ARCHIVED');const bound=e.entries.find(x=>x.family==='SST');assert.deepEqual(bound.reference,exact);assert.equal(read.receipt.receiptDigest,bound.reference.receiptDigest);return {status:'VERIFIED',evidenceSetId:e.evidenceSetId};};
  for(const hour of [0,4,8]){const r=await f.run(hour);assert.equal(r.status,'COMPLETED');assert.deepEqual(r.publication.evidence.entries.find(x=>x.family==='SST').reference,exact);}assert.equal(canonical(stored),before);
});
test('completed zero-opportunity publication preserves every exclusion and signal',async()=>{
  const {p}=await good();assert.equal(p.evaluation.candidateResults.length,2);assert(p.evaluation.candidateResults.every(r=>!r.gate.eligibleForRanking&&r.opportunityId===null));
  assert(p.evaluation.candidateResults[0].gate.reasons.includes('minimum-opportunity-evidence-gate-not-satisfied'));assert.equal(p.evaluation.signalReferences.length,1);
});
test('actual existing ranking gate rejects score-only permission',async()=>{
  const f=fixture();f.port.evaluate=async a=>{const e=evaluation(a,true);delete e.results.find(x=>x.candidateId==='near').interpretation.speciesOpportunity.eligibility;return e;};const r=await f.run();assert.equal(r.status,'COMPLETED');assert.equal(r.publication.evaluation.candidateResults.find(x=>x.candidateId==='near').gate.eligibleForRanking,false);
});
test('eligible candidate retains opportunity and continuity identity without assigning rank',async()=>{
  const f=fixture();f.port.evaluate=async a=>evaluation(a,true);const r=await f.run();assert.equal(r.status,'COMPLETED');assert(r.publication.evaluation.candidateResults.every(x=>x.opportunityId===`continuity-${x.candidateId}`&&!Object.hasOwn(x,'rank')));
});
test('no global Top-N, cross-candidate spoof, or inadmissible used family',async()=>{
  for(const mutate of [e=>e.results.pop(),e=>e.results[0].interpretation.candidate.id='other',e=>e.results[0].usedFamilies=['chlorophyll']]){const f=fixture();f.port.evaluate=async a=>{const e=evaluation(a);mutate(e);return e;};assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.records.size,0);}
});
test('evidence arriving during evaluation cannot alter frozen cycle',async()=>{
  const f=fixture();let raw;f.port.collectEvidence=async c=>(raw=entries(c));f.port.evaluate=async a=>{raw[0].reference.frameId='new-frame';assert.throws(()=>a.evidence.entries[0].status='ERROR');return evaluation(a);};const r=await f.run();assert.equal(r.status,'COMPLETED');assert.equal(r.publication.evidence.entries.find(e=>e.family==='SST').reference.frameId,'sst-frame');
});
test('deterministic scientific content excludes attempts, full integrity includes them',async()=>{
  const {p}=await good();const q=publicationV1({cycle:p.cycle,evidence:p.evidence,evaluation:p.evaluation,attempt:{...p.attempt,id:'retry',endedAt:'2026-09-24T00:01:59Z'}});
  assert.equal(p.contentDigest,q.contentDigest);assert.equal(p.publicationId,q.publicationId);assert.notEqual(p.integrityDigest,q.integrityDigest);
});
test('object-key insertion order independent, nested publication deeply immutable',async()=>{
  const {p}=await good();assert.deepEqual(validatePublicationV1(Object.fromEntries(Object.entries(p).reverse())),p);
  for(const mutate of [()=>p.evidence.entries[0].qualityReferences.push(ref('new')),()=>p.cycle.region.id='new',()=>p.evaluation.candidateResults[0].gate.reasons.push('new'),()=>p.attempt.id='new'])assert.throws(mutate);
});
test('unknown private fields and accessors/cycles fail closed',async()=>{
  const {p}=await good();for(const field of ['captainId','email','authUuid','fishingLog','catch','privateCoordinates','speciesPreference']){const q=clone(p);q[field]='private';assert.throws(()=>validatePublicationV1(q));const c=cycleInput();c.region[field]='private';assert.throws(()=>cycleV1(c));}
  let called=false;const c=cycleInput();Object.defineProperty(c,'x',{get(){called=true;return 1;},enumerable:true});assert.throws(()=>cycleV1(c));assert.equal(called,false);const cyclic={};cyclic.self=cyclic;assert.throws(()=>copy(cyclic));
});
test('same-cycle accepted retry reuses exact accepted execution and no evaluation/write',async()=>{
  const f=await good();const r=await f.run();assert.equal(r.status,'POINTER_ALREADY_CURRENT');assert.deepEqual(r.publication,f.p);assert.equal(f.calls.evaluate,1);assert.equal(f.calls.write,1);
});
test('same-cycle revised evidence conflicts; original immutable publication remains',async()=>{
  const f=await good();f.port.collectEvidence=async c=>{const e=entries(c);e[0].reference.contentDigest=hash('revision');return e;};const r=await f.run();assert.equal(r.status,'SAME_CYCLE_EVIDENCE_CONFLICT');assert.deepEqual([...f.records.values()][0],f.p);assert.equal(r.previous.publication.contentDigest,f.p.contentDigest);
});
test('external conditional writer preserves original attempt and detects content conflict',async()=>{
  const f=await good();const q=publicationV1({cycle:f.p.cycle,evidence:f.p.evidence,evaluation:f.p.evaluation,attempt:{...f.p.attempt,id:'retry'}});assert.deepEqual((await writePublicationV1(f.port,q)).publication,f.p);
  const evaluation=clone(f.p.evaluation);evaluation.signalReferences=[];const other=publicationV1({cycle:f.p.cycle,evidence:f.p.evidence,evaluation,attempt:f.p.attempt});assert.equal((await writePublicationV1(f.port,other)).status,'PUBLICATION_CONFLICT');
});
test('concurrent cycle claims suppress duplicate evaluation',async()=>{
  const f=fixture();let release;const wait=new Promise(r=>release=r);const original=f.port.evaluate;f.port.evaluate=async a=>{await wait;return original(a);};
  const first=f.run();await new Promise(r=>setImmediate(r));const second=await f.run();assert.equal(second.status,'CLAIM_HELD_RECONCILIATION_REQUIRED');release();assert.equal((await first).status,'COMPLETED');assert.equal(f.calls.evaluate,1);
});
test('claim failure and malformed/inherited enablement do not evaluate',async()=>{
  const f=fixture();f.port.claim=async()=>({status:'ACQUIRED'});assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.calls.evaluate,0);
  assert.equal((await runPublicationCycleV1(input(),Object.create(f.port))).status,'CYCLE_FAILED');
});
test('durability false, pending and wrong record acknowledgements fail closed',async()=>{
  for(const response of [null,{status:'PENDING',durable:false,record:null}]){const f=fixture();f.port.createIfAbsent=async()=>response;const r=await f.run();assert.equal(r.status,'CYCLE_FAILED');assert.equal(f.pointers.size,0);}
  const f=fixture(),write=f.port.createIfAbsent;f.port.createIfAbsent=async(...a)=>({...await write(...a),durable:false});assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.pointers.size,0);
});
test('corrupt or missing durable readback cannot advance pointer',async()=>{
  for(const corrupt of [true,false]){const f=fixture(),read=f.port.readExact;f.port.readExact=async key=>{const r=await read(key);if(r.status==='FOUND'){if(corrupt)r.record.evidence.entries[0].reason='tampered';else return {status:'NOT_FOUND'};}return r;};assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.pointers.size,0);}
});
test('receipt-bound evidence verification is mandatory',async()=>{
  const f=fixture();f.port.verifyEvidence=async()=>({status:'VERIFIED',evidenceSetId:'wrong'});assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.calls.evaluate,0);
});
test('latest pointer durable CAS and exact read path',async()=>{
  const f=await good();const read=await readLatestPublicationV1(f.port,cycleInput(),input().assessedAt);assert.deepEqual(read.publication,f.p);assert.equal(read.ageHours,2/60);assert.equal(f.calls.evaluate,1);
});
test('pointer CAS conflict preserves prior verified publication and exposes reconciliation',async()=>{
  const f=await good();f.port.compareAndSet=async({expected})=>({status:'CONFLICT',durable:true,snapshot:expected});const r=await f.run(4);assert.equal(r.status,'POINTER_CONFLICT');assert.deepEqual(r.previous.publication,f.p);assert(r.previous.ageHours>4);assert.equal(r.reconciliationRequired,true);
});
test('false or wrong-target CAS acknowledgement cannot claim completed success',async()=>{
  for(const mutate of [r=>r.durable=false,r=>r.snapshot.target.contentDigest=hash('wrong')]){const f=fixture(),cas=f.port.compareAndSet;f.port.compareAndSet=async a=>{const r=await cas(a);mutate(r);return r;};const r=await f.run();assert.equal(r.status,'CYCLE_FAILED');assert.equal(r.stage,'CAS');assert.equal(r.reconciliationRequired,true);}
});
test('older publication never replaces newer pointer',async()=>{
  const f=fixture();const newer=await f.run(8);assert.equal(newer.status,'COMPLETED');const request=input(4);request.assessedAt=input(12).assessedAt;f.port.finishedAt=async()=>input(4).startedAt;const r=await runPublicationCycleV1(request,f.port);assert.equal(r.status,'OLDER_PUBLICATION_RETAINED');assert.deepEqual([...f.pointers.values()][0].target,targetV1(newer.publication));
});
test('every stage failure preserves old evidence and increasing publication age',async()=>{
  for(const name of ['collectEvidence','verifyEvidence','evaluate','createIfAbsent','compareAndSet']){const f=await good();f.port[name]=async()=>{throw Error('secret filesystem token');};const r=await f.run(4);assert.equal(r.status,'CYCLE_FAILED');assert.deepEqual(r.previous.publication,f.p);assert.equal(r.previous.ageHours,4+2/60);assert(!JSON.stringify(r).includes('secret'));}
});
test('malformed old pointer fails closed rather than claiming prior evidence exists',async()=>{
  const f=await good();[...f.pointers.values()][0].target.integrityDigest=hash('bad');const r=await f.run(4);assert.equal(r.status,'CYCLE_FAILED');assert.equal(r.previous,null);assert.equal(r.stage,'PREVIOUS');
});
test('00Z 04Z 08Z reuse same exact SST receipt; no acquisition and evidence age increases',async()=>{
  const f=fixture(),results=[];for(const hour of [0,4,8])results.push(await f.run(hour));assert(results.every(r=>r.status==='COMPLETED'));
  const e=results.map(r=>r.publication.evidence.entries.find(e=>e.family==='SST'));assert(e.every(x=>canonical(x.reference)===canonical(sst)&&x.representedAt==='2026-09-23T12:00:00.000Z'));assert.deepEqual(e.map(x=>x.ageHours),[12,16,20]);assert.equal(f.records.size,3);
});
test('post-archive retry can reconcile pointer without duplicate scientific publication',async()=>{
  const f=fixture(),cas=f.port.compareAndSet;f.port.compareAndSet=async()=>{throw Error('uncertain');};assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.records.size,1);f.port.compareAndSet=cas;assert.equal((await f.run()).status,'IDEMPOTENT');assert.equal(f.calls.evaluate,1);
});
test('crash windows remain explicit and claims never auto-release',async()=>{
  assert.deepEqual(Object.keys(CRASH_WINDOWS),['CLAIM','FREEZE','EVALUATE','WRITE','READBACK','CAS']);const f=fixture();f.port.collectEvidence=async()=>{throw Error('crash');};assert.equal((await f.run()).stage,'FREEZE');assert.equal((await f.run()).status,'CLAIM_HELD_RECONCILIATION_REQUIRED');
});
test('new candidate universe does not silently create another latest namespace',()=>{
  const a=cycleV1(cycleInput()),b=cycleInput();b.configuration.candidateUniverse.candidateIds.push('new');const c=cycleV1(b);assert.equal(c.cycleId,a.cycleId);assert.equal(pointerKeyV1(a),pointerKeyV1(c));
});
test('changed candidate universe for an accepted cycle requires explicit reconciliation',async()=>{
  const f=await good(),request=input();request.cycle.configuration.candidateUniverse.candidateIds.push('new');const r=await runPublicationCycleV1(request,f.port);assert.equal(r.status,'SAME_CYCLE_CONFIGURATION_CONFLICT');assert.equal(r.reconciliationRequired,true);assert.equal(f.records.size,1);
});
test('worker absent from app/server maintenance paths; no acquisition or learning call',()=>{
  const server=readFileSync(new URL('../server.js',import.meta.url),'utf8');assert(!server.includes('publicationWorker'));
  const worker=readFileSync(new URL('../oceanState/publicationWorker.mjs',import.meta.url),'utf8');for(const pattern of [/\bfetch\s*\(/,/\bgetOceanConditions\s*\(/,/\brunSstWorker\s*\(/,/\.listen\s*\(/,/\bsetInterval\s*\(/])assert(!pattern.test(worker));
  const dir=new URL('../../frontend/src/hooks/',import.meta.url);for(const file of readdirSync(dir).filter(x=>/\.[jt]sx?$/.test(x)))assert(!readFileSync(new URL(file,dir),'utf8').includes('publicationWorker'));
});
test('synthetic serialization benchmark records size/time without production budgets',async()=>{
  const f=fixture();const req=input();req.cycle.configuration.candidateUniverse.candidateIds=Array.from({length:1000},(_,i)=>`candidate-${i}`);const t=performance.now();const r=await runPublicationCycleV1(req,f.port);assert.equal(r.status,'COMPLETED');const elapsed=performance.now()-t;const start=performance.now();const bytes=Buffer.byteLength(canonical(r.publication));const ms=performance.now()-start;
  console.log(JSON.stringify({syntheticCandidates:1000,publicationBytes:bytes,workerMs:Number(elapsed.toFixed(2)),serializationMs:Number(ms.toFixed(2)),projection:'not-implemented'}));assert.equal(r.publication.evaluation.candidateResults.length,1000);
});
test('adversarial empty species must not complete a publication',async()=>{
  const f=fixture(),request=input();request.cycle.configuration.species=[];assert.equal((await runPublicationCycleV1(request,f.port)).status,'CYCLE_FAILED');assert.equal(f.records.size,0);
});
test('adversarial evaluator version cannot differ from the cycle configuration',async()=>{
  const f=fixture();f.port.evaluate=async a=>({...evaluation(a),evaluatorVersion:'unregistered-revision'});assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.records.size,0);
});
test('adversarial caller mutation cannot falsify reported assessment time',async()=>{
  const f=await good(),request=input(4),original=request.assessedAt;f.port.collectEvidence=async()=>{request.assessedAt='2099-01-01T00:00:00Z';throw Error('failure');};const r=await runPublicationCycleV1(request,f.port);assert.equal(r.status,'CYCLE_FAILED');assert.equal(r.previous.assessedAt,new Date(original).toISOString());
});
test('adversarial private context in evaluator output is rejected, not silently stripped',async()=>{
  const f=fixture();f.port.evaluate=async a=>{const e=evaluation(a,true);e.results[0].interpretation.captainContext={origin:[28,-88],rangeNm:100};return e;};assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.records.size,0);
});
test('adversarial CREATED acknowledgement must preserve submitted execution metadata',async()=>{
  const f=fixture();f.port.createIfAbsent=async(key,p)=>{const altered=publicationV1({cycle:p.cycle,evidence:p.evidence,evaluation:p.evaluation,attempt:{...p.attempt,id:'invented-execution'}});f.records.set(key,altered);return {status:'CREATED',durable:true,record:altered};};assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.pointers.size,0);
});
test('adversarial read cannot report completion before recorded evaluation end',async()=>{
  const f=await good();await assert.rejects(()=>readLatestPublicationV1(f.port,cycleInput(),'2026-09-24T00:00:30Z'));
});
test('adversarial cycle binds universe/evaluator/governance and region versions',()=>{
  const a=cycleInput(),base=cycleV1(a).cycleId;
  for(const field of ['version','evaluatorVersion','candidateUniverseVersion','governanceReference']){const b=clone(a);b.configuration[field]+='-changed';assert.notEqual(cycleV1(b).cycleId,base);}
  const b=clone(a);b.region.version='2';assert.notEqual(cycleV1(b).cycleId,base);
  for(const region of ['us-atlantic','bahamas-caribbean','central-america','future-offshore']){b.region.id=region;assert.equal(cycleV1(b).region.id,region);}
});
test('adversarial noncadence, precision, timezone, duplicates and prototype data',()=>{
  for(const t of ['2026-09-24','2026-09-24T04:00:00.0001Z','2026-09-24T24:00:00Z','2026-09-24T04:00:00+00:00','2026-09-24T04:00:00.001Z'])assert.throws(()=>cycleV1({...cycleInput(),scheduledAt:t}));
  for(const change of [c=>c.configuration.species.push('blue-marlin'),c=>c.configuration.candidateUniverse.candidateIds.push('near'),c=>c.configuration.families.push('SST')]){const c=cycleInput();change(c);assert.throws(()=>cycleV1(c));}
  assert.throws(()=>cycleV1(Object.create(cycleInput())));
});
test('adversarial captain concepts cannot alter declared shared configuration',()=>{
  for(const key of ['origin','GPS','range','selectedSpecies','favoritePlace','recentFishingLog','account','userId']){
    for(const where of ['configuration','universe']){const c=cycleInput();(where==='configuration'?c.configuration:c.configuration.candidateUniverse)[key]='private';assert.throws(()=>cycleV1(c));}
  }
});
test('adversarial pair accounting reconciles admitted plus excluded without duplicates',async()=>{
  const f=fixture();f.port.evaluate=async a=>{const e=evaluation(a,true);e.results[0].interpretation.speciesOpportunity.eligibility.eligibleForRanking=false;return e;};const r=await f.run();assert.equal(r.status,'COMPLETED');
  const rows=r.publication.evaluation.candidateResults,declared=r.publication.cycle.configuration.candidateUniverse.candidateIds.length;assert.equal(declared,rows.filter(x=>x.gate.eligibleForRanking).length+rows.filter(x=>!x.gate.eligibleForRanking).length);assert.equal(new Set(rows.map(x=>`${x.species}:${x.candidateId}`)).size,declared);
  for(const change of [e=>e.results.push(clone(e.results[0])),e=>e.results[1]=clone(e.results[0]),e=>e.results[1].candidateId='undeclared']){const f=fixture();f.port.evaluate=async a=>{const e=evaluation(a);change(e);return e;};assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.pointers.size,0);}
});
test('adversarial partial stale unqualified and unavailable states remain distinct',async()=>{
  for(const state of ['STALE','UNQUALIFIED','UNAVAILABLE','ERROR']){
    const f=fixture();f.port.collectEvidence=async c=>{const e=entries(c);e[0].status=['STALE','ERROR','UNAVAILABLE'].includes(state)?state:'AVAILABLE';e[0].admissibility.status='UNASSESSED';if(state==='UNQUALIFIED')e[0].qualification.status='UNQUALIFIED';return e;};
    f.port.evaluate=async a=>{const e=evaluation(a);e.results.forEach(x=>{x.usedFamilies=[];x.interpretation.available=false;});e.signalReferences=[];return e;};
    const r=await f.run();assert.equal(r.status,'COMPLETED');const e=r.publication.evidence.entries.find(x=>x.family==='SST');assert.equal(e.admissibility.status,'UNASSESSED');assert(r.publication.evaluation.candidateResults.every(x=>!x.gate.eligibleForRanking&&x.gate.reasons.includes('species-interpretation-unavailable')));
  }
});
test('adversarial zero retains evaluated exclusion versus unavailable reasons',async()=>{
  const a=await good(),f=fixture();f.port.evaluate=async arg=>{const e=evaluation(arg);e.results.forEach(x=>{x.interpretation.available=false;x.interpretation.speciesOpportunity=null;x.usedFamilies=[];});return e;};const b=await f.run();assert.equal(b.status,'COMPLETED');
  assert.notDeepEqual(a.p.evaluation.candidateResults[0].gate.reasons,b.publication.evaluation.candidateResults[0].gate.reasons);assert(a.p.evaluation.candidateResults.every(x=>x.opportunityId===null));assert(b.publication.evaluation.candidateResults.every(x=>x.opportunityId===null));
});
test('adversarial low finite score does not override eligible gate; strings cannot rank',async()=>{
  for(const score of [0,'999']){const f=fixture();f.port.evaluate=async a=>{const e=evaluation(a,true);e.results.forEach(x=>x.interpretation.speciesOpportunity.score=score);return e;};const r=await f.run();assert.equal(r.status,'COMPLETED');assert(r.publication.evaluation.candidateResults.every(x=>x.gate.eligibleForRanking===(score===0)&&!Object.hasOwn(x,'rank')));}
});
test('adversarial private fields rejected at every persisted structured boundary',async()=>{
  const {p}=await good();for(const key of ['userId','AuthUUID','email','captainName','boatName','captainGPS','captainOrigin','captainRange','FishingLog','catch','privateReport','personalMissionState','credentials','rankingOverride']){
    for(const select of [p=>p.attempt,p=>p.evidence.entries[0],p=>p.evaluation.candidateResults[0],p=>p.evaluation.candidateResults[0].gate,p=>p.evaluation.lineageReferences[0]]){const q=clone(p);select(q)[key]='private';assert.throws(()=>validatePublicationV1(q));}
    const f=fixture();f.port.evaluate=async a=>{const e=evaluation(a);e.results[0].interpretation.candidate[key]='private';return e;};assert.equal((await f.run()).status,'CYCLE_FAILED');
  }
});
test('adversarial meaningful result changes conflict under same cycle object key',async()=>{
  const f=await good();for(const change of [e=>e.signalReferences=[],e=>e.lineageReferences=[ref('new')],e=>e.candidateResults[0].continuityReference=ref('other'),e=>e.candidateResults[0].evaluationReference=ref('changed-evaluation'),e=>e.candidateResults[0].gate.reasons=['another-exclusion'],e=>{e.candidateResults[0].gate.eligibleForRanking=true;e.candidateResults[0].gate.reasons=[];e.candidateResults[0].opportunityId='eligible';}]){
    const e=clone(f.p.evaluation);change(e);const q=publicationV1({cycle:f.p.cycle,evidence:f.p.evidence,evaluation:e,attempt:f.p.attempt});assert.equal(q.publicationId,f.p.publicationId);assert.notEqual(q.contentDigest,f.p.contentDigest);assert.equal((await writePublicationV1(f.port,q)).status,'PUBLICATION_CONFLICT');assert.deepEqual([...f.records.values()][0],f.p);
  }
});
test('adversarial read has no fallback for missing corrupt incomplete or mismatched publication',async()=>{
  const empty=fixture();assert.equal((await readLatestPublicationV1(empty.port,cycleInput(),input().assessedAt)).publication,null);assert.equal(empty.calls.evaluate,0);
  for(const mutate of [f=>f.records.clear(),f=>[...f.records.values()][0].status='PENDING',f=>[...f.records.values()][0].integrityDigest=hash('wrong'),f=>[...f.pointers.values()][0].target.publicationId='wrong',f=>[...f.pointers.values()][0].target.contentDigest=hash('wrong'),f=>[...f.pointers.values()][0].target.extra='invalid']){const f=await good();mutate(f);await assert.rejects(()=>readLatestPublicationV1(f.port,cycleInput(),input().assessedAt));assert.equal(f.calls.evaluate,1);}
});
test('adversarial actual newer-cycle CAS race cannot be overwritten by older worker',async()=>{
  const f=await good(),cas=f.port.compareAndSet;let newer=null;
  f.port.compareAndSet=async arg=>{if(arg.target.scheduledAt==='2026-09-24T04:00:00.000Z'){newer=await f.run(8);assert.equal(newer.status,'COMPLETED');}return cas(arg);};
  const r=await f.run(4);assert.equal(r.status,'POINTER_CONFLICT');assert.deepEqual([...f.pointers.values()][0].target,targetV1(newer.publication));assert.deepEqual(r.previous.publication,f.p);
});
test('adversarial write wrong publication and forged digest never advances pointer',async()=>{
  for(const mutate of [p=>p.publicationId='wrong',p=>p.contentDigest=hash('wrong'),p=>p.status='PENDING']){const f=fixture();f.port.createIfAbsent=async(key,p)=>{const q=clone(p);mutate(q);return {status:'CREATED',durable:true,record:q};};assert.equal((await f.run()).status,'CYCLE_FAILED');assert.equal(f.pointers.size,0);}
});
test('adversarial uncertain post-write and post-CAS states are not rolled back or concealed',async()=>{
  const f=fixture(),write=f.port.createIfAbsent;f.port.createIfAbsent=async(...args)=>{await write(...args);throw Error('uncertain-write');};let r=await f.run();assert.equal(r.status,'CYCLE_FAILED');assert.equal(r.stage,'WRITE');assert.equal(f.records.size,1);assert.equal(f.pointers.size,0);assert.equal(r.reconciliationRequired,true);
  const g=fixture(),cas=g.port.compareAndSet;g.port.compareAndSet=async arg=>{await cas(arg);throw Error('uncertain-cas');};r=await g.run();assert.equal(r.status,'CYCLE_FAILED');assert.equal(r.stage,'CAS');assert.equal(g.pointers.size,1);assert.equal(r.reconciliationRequired,true);
});
test('adversarial evidence cycle ages and leap-day checks do not establish freshness',()=>{
  const c=cycleInput();c.scheduledAt='2024-03-01T00:00:00Z';const cycle=cycleV1(c),e=entries(cycle);e[0].representedAt='2024-02-29T12:00:00Z';e[0].ageHours=12;assert.equal(freezeEvidenceV1(cycle,e).entries.find(x=>x.family==='SST').ageHours,12);
  e[0].ageHours=-1;assert.throws(()=>freezeEvidenceV1(cycle,e));e[0].ageHours=0;e[0].representedAt=c.scheduledAt;assert.equal(freezeEvidenceV1(cycle,e).entries.find(x=>x.family==='SST').ageHours,0);
});
test('adversarial nested caller mutation cannot rewrite scientific results or references',async()=>{
  const {p}=await good(),raw={cycle:clone(p.cycle),evidence:clone(p.evidence),evaluation:clone(p.evaluation),attempt:clone(p.attempt)},q=publicationV1(raw),before=canonical(q);
  raw.evaluation.candidateResults[0].continuityReference.sha256=hash('new');raw.evaluation.signalReferences=[];raw.evidence.entries[0].lineageReferences=[];raw.attempt.id='modified';assert.equal(canonical(q),before);
  const read=clone(q);read.evaluation.candidateResults[0].gate.reasons=[];assert.throws(()=>validatePublicationV1(read));
});
test('adversarial pathological sparse universe and oversized locator fail before evaluation',async()=>{
  const f=fixture(),request=input();request.cycle.configuration.candidateUniverse.candidateIds.length=0xffffffff;
  assert.equal((await runPublicationCycleV1(request,f.port)).status,'CYCLE_FAILED');assert.equal(f.calls.evaluate,0);
  const c=cycleInput();c.configuration.candidateUniverse.reference.referenceId='x'.repeat(100000);assert.throws(()=>cycleV1(c));
});
