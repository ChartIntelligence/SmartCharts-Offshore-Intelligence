import fs from 'node:fs';import {spawn} from 'node:child_process';import {randomUUID} from 'node:crypto';
import {PUBLISHER_FREEZE} from '../durableObserve/publicationScheduler.mjs';import {cycleV2} from '../../shared/oceanPublication.mjs';
import {createControlledP4Runtime,createControlledP4Configuration} from '../durableObserve/controlledRetainedPublication.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
import {database} from './fixtures/localPublicationFixture.mjs';import {setupControlledP4} from './fixtures/controlledRetainedPublicationFixture.mjs';
import {composeRetainedBlueMarlinV1} from '../durableObserve/retainedBlueMarlinComposition.mjs';import {exactJson} from '../exactScientificEvidence.mjs';
import {serializeRankedPublication,byteHash,validateRankedPublication} from '../durableObserve/publicationEnvelope.mjs';import {createPublicationStore} from '../durableObserve/publicationStore.mjs';
test('P4-A real PostgreSQL controlled integration',{skip:process.env.PELORA_CP09_P4A_LOCAL!=='1'},async t=>{
 const db=await database(),jobs=[],publishers=[];const setup=async options=>{const h=await setupControlledP4(db,options);jobs.push(h);return h;};
 try{
 await t.test('actual scheduled job resolves persisted P2, freezes, executes P1 and finalizes through CP09',async()=>{
  const h=await setup({count:1}),{publisher}=await h.publisher();publishers.push(publisher);const r=await publisher.tick();assert.equal(r.results[0].status,'COMMITTED');
  const saved=await h.ledger.inspect(h.id),text=saved.submissionText,p=JSON.parse(text),direct=composeRetainedBlueMarlinV1(h.x);assert.equal(exactJson(p.producerBundle.controlledComposition),exactJson(direct));assert.equal(p.producerBundle.evaluationState.state,'governed-zero');assert.equal(p.producerBundle.delivery.opportunities.length,0);
  const read=await createPublicationStore({query:db.query}).read({context:h.c.context,mode:'exact-cycle',scheduledAt:h.x.assessment.assessmentAt});assert.equal(serializeRankedPublication(read.record),text);assert(saved.completion);assert.equal(p.producerBundle.inputsUsed[0].content.qualification.sourceAdmission,'NOT_SCIENTIFICALLY_ADMITTED');
  assert.equal(JSON.parse(saved.freezeText).input.artifacts[0].content.compositionInput.history.state,'UNAVAILABLE');assert.equal(JSON.parse(saved.freezeText).input.artifacts[0].content.compositionInput.history.sourceReference,null);
 });
 await t.test('two-candidate partial result preserves actual P1 state and original order',async()=>{
  const h=await setup({mutate:x=>x.entries.reverse()}),{publisher}=await h.publisher();publishers.push(publisher);assert.equal((await publisher.tick()).results[0].status,'COMMITTED');
  const p=JSON.parse((await h.ledger.inspect(h.id)).submissionText),direct=composeRetainedBlueMarlinV1(h.x);assert.equal(exactJson(p.producerBundle.controlledComposition),exactJson(direct));assert.deepEqual(p.producerBundle.candidates.map(c=>c.id),h.x.entries.map(e=>e.candidate.content.id));assert.equal(p.producerBundle.evaluationState.state,direct.evaluationState.state);assert.equal(direct.evaluationState.state,'partial');
 });
 await t.test('valid retained no-valid-pixel and sample failures reach actual governed unavailable science',async()=>{
  const h=await setup({count:1,mutate:x=>{const e=x.entries[0].environment.content;for(const p of [e.sst.center,e.currents.center,e.chlorophyll.direct,e.chlorophyll.gapFilled]){const q=p.content.payload;for(const k of ['temperatureCelsius','temperatureFahrenheit','speedKnots','directionDegrees','eastwardMetersPerSecond','northwardMetersPerSecond','concentrationMgM3'])if(Object.hasOwn(q,k))q[k]=null;q.source.availability='no-valid-pixel';}for(const g of [e.sst,e.currents])g.neighbors.forEach(s=>Object.assign(s,{outcome:'REJECTED',point:null,reason:'controlled-source-failure'}));e.dataQuality.content.layers={sst:{state:'unavailable'},currents:{state:'unavailable'},chlorophyll:{state:'unavailable'}};}}),{publisher}=await h.publisher();publishers.push(publisher);
  assert.equal((await publisher.tick()).results[0].status,'COMMITTED');const p=JSON.parse((await h.ledger.inspect(h.id)).submissionText);assert.equal(exactJson(p.producerBundle.controlledComposition),exactJson(composeRetainedBlueMarlinV1(h.x)));assert.equal(p.producerBundle.evaluationState.state,'unavailable');assert.equal(p.producerBundle.controlledComposition.evaluations[0].ocean.currents.speedKnots,null);
 });
 for(const stage of ['beforeCollect','afterCollect','afterFreeze','beforeCompute','afterCompute','beforePrepare','afterPrepare','beforeFinalize','afterFinalize'])await t.test('interruption and exact retry: '+stage,async()=>{
  const h=await setup({count:1});let failed=false,collect=0,compute=0;const hooks={beforeCollect(){collect++;if(stage==='beforeCollect'&&!failed){failed=true;throw Error('controlled-interrupt');}},afterCollect(){if(stage==='afterCollect'&&!failed){failed=true;throw Error('controlled-interrupt');}},beforeCompute(){compute++;if(stage==='beforeCompute'&&!failed){failed=true;throw Error('controlled-interrupt');}},afterCompute(){if(stage==='afterCompute'&&!failed){failed=true;throw Error('controlled-interrupt');}}};
  const {runtime,publisher}=await h.publisher({hooks});publishers.push(publisher);
  for(const [name,before,after] of [['freeze',null,'afterFreeze'],['prepare','beforePrepare','afterPrepare'],['finalize','beforeFinalize','afterFinalize']]){
   const original=runtime.ledger[name];runtime.ledger[name]=async(...args)=>{if(stage===before&&!failed){failed=true;throw Error('controlled-interrupt');}const r=await original(...args);if(stage===after&&!failed){failed=true;throw Error('controlled-lost-ack');}return r;};
  }
  const first=await publisher.tick(),saved=await h.ledger.inspect(h.id),freezeText=saved.freezeText,submissionText=saved.submissionText,oldCompute=compute,oldCollect=collect;
  if(stage==='afterFinalize')assert.equal(first.results[0].status,'RECONCILED');else assert.equal(first.results[0].status,'RECOVERABLE');
  await publisher.tick();const final=await h.ledger.inspect(h.id);assert(final.completion);if(freezeText)assert.equal(final.freezeText,freezeText);if(submissionText){assert.equal(final.submissionText,submissionText);assert.equal(compute,oldCompute);assert.equal(collect,oldCollect);}if(freezeText)assert.equal(collect,oldCollect);
  assert.equal(exactJson(JSON.parse(final.submissionText).producerBundle.controlledComposition),exactJson(composeRetainedBlueMarlinV1(h.x)));
 });
 await t.test('stale attempt after reclaim cannot prepare or finalize; current attempt completes',async()=>{
  const h=await setup({count:1}),{runtime}=await h.publisher(),cap=randomUUID(),claim=await h.ledger.claim(h.id,cap),input=await runtime.collect(h.c,h.x.assessment.assessmentAt,{});
  await h.ledger.freeze(h.id,cap,claim.fence,{contractVersion:PUBLISHER_FREEZE,configurationId:h.c.id,cycleId:cycleV2(input.cycle).cycleId,constructedAt:new Date().toISOString(),input});const p=await runtime.compose(input,h.c);await h.ledger.release(h.id,cap);const replacement=randomUUID(),next=await h.ledger.claim(h.id,replacement);assert(next.fence>claim.fence);
  await assert.rejects(()=>h.ledger.prepare(h.id,cap,claim.fence,p));await assert.rejects(()=>h.ledger.finalize(h.id,cap,claim.fence));await h.ledger.prepare(h.id,replacement,next.fence,p);await h.ledger.finalize(h.id,replacement,next.fence);assert((await h.ledger.inspect(h.id)).completion);
 });
 await t.test('prepared submission prevents later supply/source/receipt recollection or re-evaluation',async()=>{
  const h=await setup({count:1}),{runtime,publisher}=await h.publisher();publishers.push(publisher);const finalize=runtime.ledger.finalize;runtime.ledger.finalize=async()=>{throw Error('controlled-before-commit');};await publisher.tick();const saved=await h.ledger.inspect(h.id);assert(saved.submissionText);
  runtime.collect=()=>{throw Error('no recollection');};runtime.compose=()=>{throw Error('no reevaluation');};runtime.ledger.finalize=finalize;await publisher.tick();assert.equal((await h.ledger.inspect(h.id)).submissionText,saved.submissionText);
  const replay=await publisher.tick();assert.equal(replay.results.length,0);
 });
 for(const mode of ['absent','corrupt','outage'])await t.test('required P2 '+mode+' remains explicit without completed assessment',async()=>{
  const h=await setup({count:1}),ref=h.plan.artifacts.find(a=>a.content.family==='CURRENTS').reference;
  const query=async(sql,args)=>{if(sql.includes('cp09b_supply.read_exact')&&args[0].includes('supply1-')){const r=await db.query(sql,args),v=r.rows[0].value;if(v&&JSON.parse(v.recordText).artifact.reference.referenceId===ref.referenceId){if(mode==='absent')return {rows:[{value:null}]};if(mode==='outage')throw Error('controlled-read-outage');return {rows:[{value:{...v,recordText:v.recordText+' '}}]};}return r;}return db.query(sql,args);};
  const runtime=await createControlledP4Runtime({query,configuration:h.c});const {createLocalFourHourPublisher}=await import('../durableObserve/localPublicationPublisher.mjs'),publisher=createLocalFourHourPublisher({enabled:true,createRuntime:async()=>runtime});publishers.push(publisher);
  const r=await publisher.tick();assert.equal(r.results[0].status,'RECOVERABLE');assert.equal(r.results[0].supplyStatus,mode==='corrupt'?'CONFLICT_OR_CORRUPT':'UNRESOLVED_SUPPLY');assert(r.results[0].resolutions.some(v=>v.status===(mode==='absent'?'ABSENT':mode==='corrupt'?'CONFLICT_OR_CORRUPT':'READ_UNAVAILABLE')));const saved=await h.ledger.inspect(h.id);assert.equal(saved.freezeText,null);assert.equal(saved.submissionText,null);assert.equal(saved.completion,null);
  assert.equal((await createPublicationStore({query:db.query}).read({context:h.c.context,mode:'exact-cycle',scheduledAt:h.x.assessment.assessmentAt})).record,null);
 });
 await t.test('two actual publisher processes compete for one authoritative publication',async()=>{
  const h=await setup({count:1}),file='.local/ocean-quarantine/'+h.c.id+'.json';fs.writeFileSync(file,exactJson(h.c));
  const child=()=>new Promise((resolve,reject)=>{const p=spawn(process.execPath,['backend/tests/fixtures/controlledRetainedPublicationProcess.mjs',file],{env:process.env,windowsHide:true});let out='',err='';p.stdout.on('data',x=>out+=x);p.stderr.on('data',x=>err+=x);p.on('error',reject);p.on('exit',code=>code===0?resolve(JSON.parse(out.trim())):reject(Error('controlled-child-failed '+err)));});
  const results=await Promise.all([child(),child()]);assert.equal(results.flatMap(r=>r.results).filter(r=>['COMMITTED','RECONCILED'].includes(r.status)).length,1);assert((await h.ledger.inspect(h.id)).completion);
 });
  await t.test('native SST/current/DIRECT/GAP handoff bytes are actually retrieved, consumed and retained',async()=>{
  const h=await setup({count:1,native:true}),{publisher}=await h.publisher();publishers.push(publisher);assert.equal((await publisher.tick()).results[0].status,'COMMITTED');const p=JSON.parse((await h.ledger.inspect(h.id)).submissionText);assert.equal(exactJson(p.producerBundle.controlledComposition),exactJson(composeRetainedBlueMarlinV1(h.x)));
  const input=p.producerBundle.inputsUsed[0].content.compositionInput,e=input.entries[0].environment.content,original=h.x.entries[0].environment.content;
  for(const [a,b] of [[e.sst.center,original.sst.center],[e.currents.center,original.currents.center],[e.chlorophyll.direct,original.chlorophyll.direct],[e.chlorophyll.gapFilled,original.chlorophyll.gapFilled]]){assert.equal(a.content.payload.captureText,b.content.payload.captureText);assert.equal(a.content.payload.contextText,b.content.payload.contextText);assert.equal(exactJson(a.reference),exactJson(b.reference));}
  const read=await createPublicationStore({query:db.query}).read({context:h.c.context,mode:'exact-cycle',scheduledAt:h.x.assessment.assessmentAt});assert.equal(read.operationalPublication,false);assert.equal(read.qualification.history,'UNAVAILABLE');
 });
 for(const [name,change] of [['context',x=>x.context.region.id='other'],['cycle',x=>x.cycle.scheduledAt=new Date(Date.parse(x.cycle.scheduledAt)-14400000).toISOString()],['cohort',x=>x.cycle.configuration.candidateUniverse.reference.sha256='0'.repeat(64)],['candidate',x=>x.candidates[0].coordinates[0]+=0.01],['source reference',x=>x.artifacts[0].content.records[0].digest='0'.repeat(64)],['original cohort',x=>x.artifacts[0].content.candidateBinding.originalCohortReference.sha256='0'.repeat(64)]])await t.test('controlled bridge rejects '+name+' mismatch',async()=>{
  const h=await setup({count:1}),{runtime}=await h.publisher(),input=structuredClone(await runtime.collect(h.c,h.x.assessment.assessmentAt,{}));change(input);await assert.rejects(()=>runtime.compose(input,h.c));assert.equal((await h.ledger.inspect(h.id)).submissionText,null);
 });
 await t.test('prepared exact chain remains withdrawn/corrected after ordinary retries',async()=>{
  const h=await setup({count:1}),{publisher}=await h.publisher();publishers.push(publisher);await publisher.tick();const original=JSON.parse((await h.ledger.inspect(h.id)).submissionText);
  function revision(parent,action){const body={...parent,revision:parent.revision+1,parentId:parent.versionId,action,lifecycle:action==='WITHDRAWAL'?'withdrawn':'completed',reason:'controlled-explicit-'+action.toLowerCase(),publicationAt:new Date().toISOString()};body.versionId='rpv1-'+byteHash(body.contextKey+'\n'+body.cycle.scheduledAt+'\n'+body.revision);if(action==='WITHDRAWAL')body.producerBundle=null;delete body.contentDigest;return validateRankedPublication({...body,contentDigest:byteHash(exactJson(body))});}
  // Explicit existing owner-only revision authority, separate from the integration worker.
  const correction=revision(original,'CORRECTION');await db.owner.query('SELECT cp08.submit_internal($1)',[serializeRankedPublication(correction)]);await publisher.tick();let read=await createPublicationStore({query:db.query}).read({context:h.c.context,mode:'exact-cycle',scheduledAt:h.x.assessment.assessmentAt});assert.equal(read.record.versionId,correction.versionId);
  const withdrawn=revision(correction,'WITHDRAWAL');await db.owner.query('SELECT cp08.submit_internal($1)',[serializeRankedPublication(withdrawn)]);await publisher.tick();read=await createPublicationStore({query:db.query}).read({context:h.c.context,mode:'exact-cycle',scheduledAt:h.x.assessment.assessmentAt});assert.equal(read.record.lifecycle,'withdrawn');assert.equal(read.activePublication,null);assert.equal((await h.ledger.inspect(h.id)).completion.version_id,original.versionId);
 });
 await t.test('later independently retained source/receipt declaration cannot improve a frozen cycle',async()=>{
  const h=await setup({count:1}),{runtime,publisher}=await h.publisher({hooks:{beforeCompute(){throw Error('controlled-interrupt');}}});publishers.push(publisher);await publisher.tick();const freeze=(await h.ledger.inspect(h.id)).freezeText;
  const {sealRetainedInputRecord}=await import('../durableObserve/retainedInputSupply.mjs'),{retainedArtifact}=await import('./fixtures/retainedBlueMarlinFixture.mjs');const content=structuredClone(h.x.entries[0].environment.content.currents.center.content);content.payload.source.revision='controlled-later';
  const later=retainedArtifact('controlled-later-'+randomUUID(),content);assert.equal((await h.store.retain(await sealRetainedInputRecord({type:'P1_EXACT_ARTIFACT',sourceClass:'CONTROLLED_FIXTURE',artifact:later,metadata:{fixtureOrigin:'CONTROLLED_P4A',receipt:{status:'DECLARED_UNQUALIFIED_LATER_FIXTURE',receivedAt:new Date().toISOString()}}}))).status,'FOUND_VALIDATED');
  runtime.collect=()=>{throw Error('must not recollect later evidence');};const next=await h.publisher();publishers.push(next.publisher);await next.publisher.tick();assert.equal((await h.ledger.inspect(h.id)).freezeText,freeze);assert((await h.ledger.inspect(h.id)).completion);
 });
 await t.test('controlled limitations cannot be removed or promoted on stored readback',async()=>{
  const h=await setup({count:1}),{publisher}=await h.publisher();publishers.push(publisher);await publisher.tick();const p=JSON.parse((await h.ledger.inspect(h.id)).submissionText);p.controlledQualification.sourceAdmission='QUALIFIED';const {contentDigest,...body}=p;await assert.rejects(async()=>validateRankedPublication({...body,contentDigest:byteHash(exactJson(body))}));
 });
 await t.test('disabled publisher starts no configuration, supply, database or scheduler work',async()=>{
  const {createLocalFourHourPublisher}=await import('../durableObserve/localPublicationPublisher.mjs');const p=createLocalFourHourPublisher({enabled:false,createRuntime:()=>{throw Error('no work');}});assert.equal((await p.tick()).status,'DISABLED');assert.equal(p.start().status,'DISABLED');await p.close();
 });
  await t.test('delayed cycle records controlled lifecycle without scientific execution or prior-result substitution',async()=>{
  const h=await setup({count:1,settings:{deadlineMs:1}}),{publisher}=await h.publisher({hooks:{beforeCompute(){throw Error('must not evaluate delayed cycle');}}});publishers.push(publisher);assert.equal((await publisher.tick()).results[0].status,'COMMITTED');const saved=await h.ledger.inspect(h.id),p=JSON.parse(saved.submissionText);assert.equal(p.lifecycle,'delayed');assert.equal(p.producerBundle,null);assert.equal(p.controlledQualification.operationalPublishing,false);const read=await createPublicationStore({query:db.query}).read({context:h.c.context,mode:'current-cycle'});assert.equal(read.lifecycle,'delayed');assert.equal(read.activePublication,null);assert.equal(read.operationalPublication,false);
 });
 await t.test('exhausted failed job cannot fabricate completed science or borrow a publication',async()=>{
  const h=await setup({count:1,settings:{maxAttempts:1}}),{publisher}=await h.publisher({hooks:{beforeCompute(){throw Error('controlled-failure');}}});publishers.push(publisher);assert.equal((await publisher.tick()).results[0].status,'RECOVERABLE');assert.equal((await publisher.tick()).results[0].status,'RETRY_EXHAUSTED');const saved=await h.ledger.inspect(h.id);assert.equal(saved.job.state,'failed');assert.equal(saved.submissionText,null);assert.equal(saved.completion,null);assert.equal((await createPublicationStore({query:db.query}).read({context:h.c.context,mode:'current-cycle'})).record,null);
 });
 await t.test('controlled adapter gate denies selection before database work when opt-in absent',async()=>{
  const value=process.env.PELORA_CP09_P4A_LOCAL;delete process.env.PELORA_CP09_P4A_LOCAL;try{await assert.rejects(()=>createControlledP4Runtime({configuration:{adapterVersion:'controlled-p2-p1-publication-explicit-assessment-v1'},query(){throw Error('must not access DB');}}));}finally{process.env.PELORA_CP09_P4A_LOCAL=value;}
 });
  await t.test('selected reference and runtime configuration detach before asynchronous caller mutation',async()=>{
  const h=await setup({count:1}),selected=structuredClone(h.setArtifact.reference),expected=selected.sha256;
  const store={read:async ref=>{const result=await h.store.read(ref);selected.sha256='0'.repeat(64);return result;}};
  const c=await createControlledP4Configuration({store,referenceSetReference:selected,configurationId:'controlled-snapshot-'+randomUUID()});assert.equal(c.controlledSupply.referenceSetReference.sha256,expected);assert.equal(selected.sha256,'0'.repeat(64));
  const mutable=structuredClone(h.c),runtime=await createControlledP4Runtime({query:db.query,configuration:mutable});mutable.id='changed';const configurations=await runtime.ledger.configurations();assert.equal(configurations.length,1);assert.equal(configurations[0].id,h.c.id);
 });
 await t.test('worker privileges unchanged; no protected direct access or internal CP08 execution',async()=>{
  for(const sql of ['SELECT * FROM cp09.freezes','SELECT * FROM cp09b_supply.artifacts','DELETE FROM cp08.versions','SELECT cp08.submit_internal(null)'])await assert.rejects(()=>db.query(sql),e=>e.code==='42501');
 });
 }finally{for(const p of publishers)await p.close();for(const h of jobs)await h.disable();await db.close();}
});
