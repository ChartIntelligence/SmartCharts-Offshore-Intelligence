import {spawnSync} from 'node:child_process';
import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {exactJson} from '../exactScientificEvidence.mjs';
import {composeRetainedBlueMarlinV1} from '../durableObserve/retainedBlueMarlinComposition.mjs';
import {retainedBlueMarlinFixture,refresh,retainedArtifact} from './fixtures/retainedBlueMarlinFixture.mjs';
import {planControlledRetainedSupply,sealRetainedInputRecord,resolveControlledRetainedSupply,createRetainedInputStore,
 nativeRetainedArtifact,inspectRetainedSource,resolveExactCurrentReaderSupply,validateRetainedInputRecord,sealExplicitRetainedSelection,resolveExplicitRetainedSelection,EXPLICIT_RETAINED_SELECTION} from '../durableObserve/retainedInputSupply.mjs';
import {captureLiveChlorophyll} from '../scalarEvidenceHandoff.mjs';
import {encodeNormalizedCurrentHandoff} from '../normalizedEvidenceCapture.mjs';
import {SOURCE_NORMALIZATION_VERSION,SOURCE_NORMALIZATION_REFERENCE} from '../sourceNormalization.mjs';
const constructedAt='2026-10-06T16:00:00.000Z',digest=x=>createHash('sha256').update(x).digest('hex');
const env=f=>f.entries[0].environment.content;
async function memory(plan){
 const rows=new Map(),query=async(sql,args)=>{
  if(sql.includes('.retain(')){
   const [id,text,sha]=args,old=rows.get(id);if(old&&old.recordText!==text)throw Error('conflict');
   rows.set(id,old??{recordText:text,digest:sha,retainedAt:constructedAt});return {rows:[{value:rows.get(id)}]};
  }return {rows:[{value:rows.get(args[0])??null}]};
 };
 const store=createRetainedInputStore({query});
 for(const a of plan.artifacts)assert.equal((await store.retain(await sealRetainedInputRecord({type:'P1_EXACT_ARTIFACT',sourceClass:'CONTROLLED_FIXTURE',artifact:a,metadata:{temporalSupport:null,receipt:null}}))).status,'FOUND_VALIDATED');
 return {store,rows,query};
}
async function resolve(f){const plan=planControlledRetainedSupply(f,constructedAt),m=await memory(plan);return {...m,plan,r:await resolveControlledRetainedSupply({referenceSet:plan.referenceSet,store:m.store})};}
test('complete controlled exact stored supply equals unchanged P1, including adequacy/exclusions/ranked state',async()=>{
 const f=retainedBlueMarlinFixture(2),x=await resolve(f);assert.equal(x.r.status,'CONTROLLED_SUPPLY_READY');
 assert.equal(exactJson(x.r.compositionInput),exactJson(f));assert.equal(exactJson(composeRetainedBlueMarlinV1(x.r.compositionInput)),exactJson(composeRetainedBlueMarlinV1(f)));
 assert.equal(x.r.admission,'NOT_SCIENTIFICALLY_ADMITTED');assert.equal(x.r.compositionInput.history.state,'UNAVAILABLE');
});
test('snapshot detaches caller mutation; identical replays retain source/order/identity',async()=>{
 const f=retainedBlueMarlinFixture(),plan=planControlledRetainedSupply(f,constructedAt),m=await memory(plan);env(f).currents.center.content.payload.speedKnots=123;
 const a=await resolveControlledRetainedSupply({referenceSet:plan.referenceSet,store:m.store}),b=await resolveControlledRetainedSupply({referenceSet:plan.referenceSet,store:m.store});
 assert.equal(exactJson(a),exactJson(b));assert(Object.isFrozen(a.compositionInput));assert.notEqual(a.compositionInput.entries[0].environment.content.currents.center.content.payload.speedKnots,123);
});
test('exact signed zero survives transport text and current handoff unchanged',async()=>{
 const f=retainedBlueMarlinFixture(),p=env(f).currents.center.content.payload;p.eastwardMetersPerSecond=-0;
 env(f).currents.center.content={format:'CURRENT_HANDOFF',family:'CURRENTS',payload:encodeNormalizedCurrentHandoff(p,SOURCE_NORMALIZATION_VERSION)};
 const x=await resolve(refresh(f));assert.equal(x.r.status,'CONTROLLED_SUPPLY_READY');assert.equal(exactJson(composeRetainedBlueMarlinV1(x.r.compositionInput)),exactJson(composeRetainedBlueMarlinV1(f)));
 assert.equal(x.r.compositionInput.entries[0].environment.content.currents.center.content.payload.captureText,env(f).currents.center.content.payload.captureText);
});
test('DIRECT/GAP_FILLED scalar native handoffs retain separate capture lineage and source identity',async()=>{
 const f=retainedBlueMarlinFixture();for(const [name,family] of [['direct','CHLOROPHYLL_DIRECT'],['gapFilled','CHLOROPHYLL_GAP_FILLED']]){
  const a=env(f).chlorophyll[name];a.content={format:'SCALAR_HANDOFF',family,payload:captureLiveChlorophyll(a.content.payload,[SOURCE_NORMALIZATION_REFERENCE])};
 }
 const x=await resolve(refresh(f));assert.equal(x.r.status,'CONTROLLED_SUPPLY_READY');assert.equal(exactJson(composeRetainedBlueMarlinV1(x.r.compositionInput)),exactJson(composeRetainedBlueMarlinV1(f)));
 assert.notEqual(env(f).chlorophyll.direct.content.payload.reference.referenceId,env(f).chlorophyll.gapFilled.content.payload.reference.referenceId);
});
for(const [name,mutate] of [
 ['candidate',f=>{env(f).candidateId='different';}],['static parent',f=>{f.entries[0].staticParent.content.coordinates=[0,0];}],
 ['sample coordinates',f=>{env(f).sst.neighbors[0].point.content.payload.requestedLatitude+=0.01;}],
 ['provider cell relabel refusal',f=>{env(f).currents.center.content.payload.requestedLatitude=env(f).currents.center.content.payload.resolvedLatitude;}],
 ['sample role',f=>{env(f).currents.neighbors[0].direction='south';}],['context',f=>{env(f).context.regionId='other';}],
 ['assessment',f=>{env(f).assessmentAt=constructedAt;}],['asserted eligibility',f=>{f.entries[0].candidate.content.eligibility={eligible:true};}]
])test('binding mismatch fails closed: '+name,async()=>{const f=retainedBlueMarlinFixture();mutate(f);assert.equal((await resolve(refresh(f))).r.status,'CONFLICT_OR_CORRUPT');});
test('missing exact artifact stays absent with no invented provider failure or zeros',async()=>{
 const x=await resolve(retainedBlueMarlinFixture());x.rows.delete(x.r.states.find(s=>s.record.artifact.content.family==='SST').record.identity);
 const r=await resolveControlledRetainedSupply({referenceSet:x.plan.referenceSet,store:x.store});assert.equal(r.status,'UNRESOLVED_SUPPLY');assert.equal(r.compositionInput,null);assert(r.states.some(s=>s.status==='ABSENT'));
});
test('missing candidate neighborhood remains unresolved without fabricated coverage',async()=>{const f=retainedBlueMarlinFixture();env(f).currents.neighbors.pop();const x=await resolve(refresh(f));assert.equal(x.r.status,'UNRESOLVED_SUPPLY');assert(x.r.unresolved.some(v=>v.reason==='NEIGHBORHOOD_SUPPORT_UNRESOLVED'));});
test('valid no-valid-pixel record is found, unlike absent artifact; governed result preserved',async()=>{
 const f=retainedBlueMarlinFixture(),p=env(f).currents.center.content.payload;Object.assign(p,{speedKnots:null,directionDegrees:null,eastwardMetersPerSecond:null,northwardMetersPerSecond:null});p.source.availability='no-valid-pixel';
 const x=await resolve(refresh(f));assert.equal(x.r.status,'CONTROLLED_SUPPLY_READY');assert.equal(exactJson(composeRetainedBlueMarlinV1(x.r.compositionInput)),exactJson(composeRetainedBlueMarlinV1(f)));
});
test('failed samples are preserved as supplied, not fabricated from missing database rows',async()=>{
 const f=retainedBlueMarlinFixture();Object.assign(env(f).sst.neighbors[0],{outcome:'REJECTED',point:null,reason:'controlled-failure'});
 const x=await resolve(refresh(f));assert.equal(exactJson(composeRetainedBlueMarlinV1(x.r.compositionInput)),exactJson(composeRetainedBlueMarlinV1(f)));
});
test('corrupt stored bytes fail closed despite a plausible supplied reference',async()=>{
 const x=await resolve(retainedBlueMarlinFixture()),row=x.rows.values().next().value;row.recordText+=' ';
 assert.equal((await resolveControlledRetainedSupply({referenceSet:x.plan.referenceSet,store:x.store})).status,'CONFLICT_OR_CORRUPT');
});
test('tampered nested source reference rejected without repairing parent',async()=>{
 const f=retainedBlueMarlinFixture();env(f).sst.center.reference.sha256='0'.repeat(64);await assert.rejects(async()=>resolve(f));
});
test('reference-set digest and assessment mutation rejected',async()=>{
 const x=await resolve(retainedBlueMarlinFixture()),s=structuredClone(x.plan.referenceSet);s.assessment.assessmentAt=constructedAt;
 await assert.rejects(()=>resolveControlledRetainedSupply({referenceSet:s,store:x.store}));
});
test('same logical artifact identity cannot overwrite differing content',async()=>{
 const x=await resolve(retainedBlueMarlinFixture()),a=structuredClone(x.plan.artifacts[0]);a.content.id='other';a.reference.sha256=digest(exactJson(a.content));
 const r=await x.store.retain(await sealRetainedInputRecord({type:'P1_EXACT_ARTIFACT',sourceClass:'CONTROLLED_FIXTURE',artifact:a,metadata:{temporalSupport:null,receipt:null}}));assert.equal(r.status,'CONFLICT_OR_CORRUPT');
});
test('commit ACK loss reconciles authoritative exact bytes before any replay',async()=>{
 const plan=planControlledRetainedSupply(retainedBlueMarlinFixture(),constructedAt),m=await memory(plan);let writes=0;
 const store=createRetainedInputStore({query:async(sql,args)=>{const r=await m.query(sql,args);if(sql.includes('.retain(')){writes++;throw Error('lost-ack');}return r;}});
 const record=await sealRetainedInputRecord({type:'P1_EXACT_ARTIFACT',sourceClass:'CONTROLLED_FIXTURE',artifact:plan.artifacts[0],metadata:{temporalSupport:null,receipt:null}});
 const r=await store.retain(record);assert.equal(r.reconciledUncertainWrite,true);assert.equal(writes,1);
});
test('unknown write with absent authoritative state remains unresolved',async()=>{
 const plan=planControlledRetainedSupply(retainedBlueMarlinFixture(),constructedAt),record=await sealRetainedInputRecord({type:'P1_EXACT_ARTIFACT',sourceClass:'CONTROLLED_FIXTURE',artifact:plan.artifacts[0],metadata:{}});
 const store=createRetainedInputStore({query:async(sql)=>{if(sql.includes('.retain('))throw Error('disconnect');return {rows:[{value:null}]};}});assert.equal((await store.retain(record)).status,'WRITE_UNRESOLVED');
});
test('real scalar record retains unknown support and late receipt without admission or composition',async()=>{
 const f=retainedBlueMarlinFixture(),content={format:'SCALAR_HANDOFF',family:'CHLOROPHYLL_DIRECT',payload:captureLiveChlorophyll(env(f).chlorophyll.direct.content.payload,[SOURCE_NORMALIZATION_REFERENCE])};
 const a=nativeRetainedArtifact('SCALAR_HANDOFF',content),record=await sealRetainedInputRecord({type:'SCALAR_HANDOFF',sourceClass:'RETAINED_SOURCE',artifact:a,metadata:{modelRun:null,temporalSupport:null,productRevision:null,receipt:{status:'NOT_RECEIVED_BY_ASSESSMENT',receivedAt:constructedAt}}});
 const m=await memory({artifacts:[]});await m.store.retain(record);const r=await inspectRetainedSource({store:m.store,reference:a.reference,assessment:f.assessment});
 assert.equal(r.status,'RETAINED_AUTHORITY_UNRESOLVED');assert.equal(r.compositionInput,null);assert.equal(r.record.metadata.temporalSupport,null);assert.equal(r.record.metadata.receipt.receivedAt,constructedAt);
 assert.equal(r.sourcePoint.requestedLatitude,content.payload?env(f).chlorophyll.direct.content.payload.requestedLatitude:null);
});
test('later assessment projection never rewrites original capture/handoff context or possession',async()=>{
 const f=retainedBlueMarlinFixture(),content={format:'CURRENT_HANDOFF',family:'CURRENTS',payload:encodeNormalizedCurrentHandoff(env(f).currents.center.content.payload,SOURCE_NORMALIZATION_VERSION)},a=nativeRetainedArtifact('CURRENT_HANDOFF',content);
 const record=await sealRetainedInputRecord({type:'CURRENT_HANDOFF',sourceClass:'RETAINED_SOURCE',artifact:a,metadata:{receipt:null,temporalSupport:null}}),m=await memory({artifacts:[]});await m.store.retain(record);
 const before=await m.store.read(a.reference),r=await inspectRetainedSource({store:m.store,reference:a.reference,assessment:{...f.assessment,assessmentAt:'2026-09-28T04:00:00.000Z'}}),after=await m.store.read(a.reference);
 assert.equal(before.recordText,after.recordText);assert.equal(r.sourcePoint.ageHours,4);assert.equal(r.assessmentProjection.ageHours,100);assert.equal(r.retainedAt,constructedAt);assert.equal(r.record.metadata.receipt,null);
});
test('later reference-set construction cannot alter retained source age to match new assessment',async()=>{
 const f=retainedBlueMarlinFixture();f.assessment.assessmentAt='2026-09-28T04:00:00.000Z';env(f).assessmentAt=f.assessment.assessmentAt;
 const x=await resolve(refresh(f));assert.equal(x.r.status,'UNRESOLVED_SUPPLY');assert(x.r.unresolved.some(v=>v.reason==='SOURCE_ASSESSMENT_CONTEXT_DIFFERS'));assert.equal(env(f).currents.center.content.payload.ageHours,4);
});
test('native source cannot hide behind an arbitrary transport identity',async()=>{
 const f=retainedBlueMarlinFixture(),content={format:'CURRENT_HANDOFF',family:'CURRENTS',payload:encodeNormalizedCurrentHandoff(env(f).currents.center.content.payload,SOURCE_NORMALIZATION_VERSION)};
 await assert.rejects(()=>sealRetainedInputRecord({type:'CURRENT_HANDOFF',sourceClass:'RETAINED_SOURCE',artifact:retainedArtifact('forged',content),metadata:{}}));
});
test('real records cannot become CONTROLLED_FIXTURE through reference-set resolution',async()=>{
 const x=await resolve(retainedBlueMarlinFixture()),key=x.rows.keys().next().value,row=x.rows.get(key),v=JSON.parse(row.recordText);v.sourceClass='RETAINED_SOURCE';row.recordText=exactJson(v);row.digest=digest(row.recordText);
 assert.equal((await resolveControlledRetainedSupply({referenceSet:x.plan.referenceSet,store:x.store})).status,'CONFLICT_OR_CORRUPT');
});
test('no provider/Auth/cache/queue calls; bounded CP07 query remains the only current read port',async()=>{
 const oldFetch=globalThis.fetch,oldNow=Date.now;globalThis.fetch=()=>{throw Error('provider-forbidden');};Date.now=()=>{throw Error('implicit-clock');};
 try{assert.equal((await resolve(retainedBlueMarlinFixture())).r.status,'CONTROLLED_SUPPLY_READY');let calls=0;
 const r=await resolveExactCurrentReaderSupply({query:async(sql)=>{assert(sql.startsWith('SELECT cp07.read_scope('));calls++;return {rows:[{value:null}]};},clock:{now:()=>constructedAt},
 request:{scope:{manifestDigest:'1'.repeat(64),region:{id:'controlled',version:'1'},product:{family:'CURRENTS',provider:'NOAA',dataset:'RTOFS',productId:'rtofs'},cellKey:'cell'},queryContext:'historical',targetTime:'2026-09-24T04:00:00.000Z',sourceTime:{from:'2026-09-24T00:00:00.000Z',until:'2026-09-25T00:00:00.000Z'},maxObservations:20},observationId:'explicit',requestedCoordinates:[26,-90]});
 assert.equal(r.status,'UNRESOLVED_SUPPLY');assert.equal(calls,1);
 }finally{globalThis.fetch=oldFetch;Date.now=oldNow;}
});
test('descriptor-safe supply rejects getters and private identifiers before storage',()=>{
 const f=retainedBlueMarlinFixture();Object.defineProperty(f,'private',{enumerable:true,get(){throw Error('getter');}});assert.throws(()=>planControlledRetainedSupply(f,constructedAt));
 const g=retainedBlueMarlinFixture();g.sessionId='forbidden';assert.throws(()=>planControlledRetainedSupply(g,constructedAt));
});
test('retention cannot claim scientific admission',async()=>{const p=planControlledRetainedSupply(retainedBlueMarlinFixture(),constructedAt),r=await sealRetainedInputRecord({type:'P1_EXACT_ARTIFACT',sourceClass:'CONTROLLED_FIXTURE',artifact:p.artifacts[0],metadata:{}});await assert.rejects(()=>validateRetainedInputRecord({...r,admission:'QUALIFIED'}));});

test('explicit real-source selection preserves producer-derived static binding without invoking P1',async()=>{
 const f=retainedBlueMarlinFixture(),e=f.entries[0],m=await memory({artifacts:[]});
 const parent=retainedArtifact('static',{version:'controlled-catalog-v1',candidate:e.candidate.content,staticParent:e.staticParent.content});
 await m.store.retain(await sealRetainedInputRecord({type:'STATIC_CONTEXT',sourceClass:'RETAINED_SOURCE',artifact:parent,metadata:{fixtureOrigin:'CONTROLLED_SYNTHETIC'}}));
 const content={format:'CURRENT_HANDOFF',family:'CURRENTS',payload:encodeNormalizedCurrentHandoff(env(f).currents.center.content.payload,SOURCE_NORMALIZATION_VERSION)},a=nativeRetainedArtifact('CURRENT_HANDOFF',content);
 await m.store.retain(await sealRetainedInputRecord({type:'CURRENT_HANDOFF',sourceClass:'RETAINED_SOURCE',artifact:a,metadata:{fixtureOrigin:'CONTROLLED_SYNTHETIC'}}));
 const body={contractVersion:EXPLICIT_RETAINED_SELECTION,sourceClass:'RETAINED_SOURCE',constructedAt,assessment:f.assessment,context:{species:'blue-marlin',regionId:'controlled',contextVersion:'v1'},bindings:[{candidateId:e.candidate.content.id,staticReference:parent.reference,artifactReference:a.reference,family:'CURRENTS',role:'center'}]};
 const selection=sealExplicitRetainedSelection(body),r=await resolveExplicitRetainedSelection({selection,store:m.store});assert.equal(r.results[0].status,'RETAINED_AUTHORITY_UNRESOLVED');assert.equal(r.compositionInput,null);
 const changed=structuredClone(body);changed.bindings[0].role='north';assert.equal((await resolveExplicitRetainedSelection({selection:sealExplicitRetainedSelection(changed),store:m.store})).status,'CONFLICT_OR_CORRUPT');
});
test('explicit real-source absent reference remains unresolved and never synthesizes a failed sample',async()=>{
 const f=retainedBlueMarlinFixture(),m=await memory({artifacts:[]}),ref=retainedArtifact('missing',{}).reference;
 const selection=sealExplicitRetainedSelection({contractVersion:EXPLICIT_RETAINED_SELECTION,sourceClass:'RETAINED_SOURCE',constructedAt,assessment:f.assessment,context:{species:'blue-marlin',regionId:'controlled',contextVersion:'v1'},bindings:[{candidateId:'candidate',staticReference:ref,artifactReference:ref,family:'SST',role:'north'}]});
 const r=await resolveExplicitRetainedSelection({selection,store:m.store});assert.equal(r.status,'UNRESOLVED_SUPPLY');assert.equal(r.results[0].status,'ABSENT');assert.equal(r.compositionInput,null);
});
test('duplicate explicit binding and missing species/context are rejected, without selection policy',()=>{
 const f=retainedBlueMarlinFixture(),ref=retainedArtifact('ref',{}).reference,b={candidateId:'candidate',staticReference:ref,artifactReference:ref,family:'SST',role:'center'},body={contractVersion:EXPLICIT_RETAINED_SELECTION,sourceClass:'RETAINED_SOURCE',constructedAt,assessment:f.assessment,context:{species:'blue-marlin',regionId:'controlled',contextVersion:'v1'},bindings:[b,b]};
 assert.throws(()=>sealExplicitRetainedSelection(body));body.bindings=[b];delete body.context.species;assert.throws(()=>sealExplicitRetainedSelection(body));
});
test('unavailable authoritative read keeps uncertain outcome unknown, never conflict or absent',async()=>{
 const plan=planControlledRetainedSupply(retainedBlueMarlinFixture(),constructedAt),record=await sealRetainedInputRecord({type:'P1_EXACT_ARTIFACT',sourceClass:'CONTROLLED_FIXTURE',artifact:plan.artifacts[0],metadata:{}});
 const store=createRetainedInputStore({query:async()=>{throw Error('offline');}});assert.equal((await store.read(record.artifact.reference)).status,'READ_UNAVAILABLE');assert.equal((await store.retain(record)).status,'OUTCOME_UNKNOWN');
});

test('fresh process import starts no network, Auth transport, database or implicit scientific clock',()=>{
 const r=spawnSync(process.execPath,['backend/tests/fixtures/retainedInputSupplyImport.mjs'],{env:{...process.env,PELORA_TEST_OCEAN_CONDITIONS:'1'},encoding:'utf8',windowsHide:true,timeout:10000});assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/P2 module imported/);
});
test('private captain/session coordinates and viewport cannot enter retained metadata',async()=>{
 const p=planControlledRetainedSupply(retainedBlueMarlinFixture(),constructedAt);
 for(const key of ['captainCoordinates','sessionCoordinates','tripOriginCoordinates','requestLocation','viewport','selectedMission','auth'])await assert.rejects(()=>sealRetainedInputRecord({type:'P1_EXACT_ARTIFACT',sourceClass:'CONTROLLED_FIXTURE',artifact:p.artifacts[0],metadata:{[key]:[25,-90]}}));
});

test('explicit selection read outage is unavailable, never artifact absence',async()=>{
 const f=retainedBlueMarlinFixture(),ref=retainedArtifact('reference',{}).reference;
 const selection=sealExplicitRetainedSelection({contractVersion:EXPLICIT_RETAINED_SELECTION,sourceClass:'RETAINED_SOURCE',constructedAt,assessment:f.assessment,context:{species:'blue-marlin',regionId:'controlled',contextVersion:'v1'},bindings:[{candidateId:'candidate',staticReference:ref,artifactReference:ref,family:'SST',role:'center'}]});
 const r=await resolveExplicitRetainedSelection({selection,store:{read:async reference=>({status:'READ_UNAVAILABLE',reference})}});assert.equal(r.status,'UNRESOLVED_SUPPLY');assert.equal(r.results[0].status,'READ_UNAVAILABLE');assert.equal(r.compositionInput,null);
});
