import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {fixture,time} from './fixtures/continuousObserveFixture.mjs';
import {createJob} from '../observe/jobs.mjs';
import {createCurrentObservationWorker} from '../observe/currentObservationWorker.mjs';
import {createPostgresAttempt,postgresTransaction,registerLocalJob} from '../durableObserve/postgresPorts.mjs';
import {createPostgresRecovery,postgresRecoveryLock} from '../durableObserve/recovery.mjs';
import {createPostgresObservationStorage} from '../durableObserve/observationStorage.mjs';
import {verifyWorkerPrivileges} from '../durableObserve/privilegeManifest.mjs';
import {createAcceptedObservationReceiptWriter} from '../durableObserve/receiptWriter.mjs';
import {createOceanStateReader} from '../durableObserve/oceanStateReader.mjs';
import {createExecution,createBinding} from '../observe/provenance.mjs';
import {encodeNormalizedCurrentHandoff} from '../normalizedEvidenceCapture.mjs';
import {SOURCE_NORMALIZATION_VERSION} from '../sourceNormalization.mjs';

test('CP-07 accepted Ocean State reader',{skip:process.env.PELORA_CP07_LOCAL!=='1'},async t=>{
 const root=path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification');
 const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8')),admin=read('credentials.json'),worker=read('worker-credentials.json');
 for(const c of [admin,worker])assert(c.host==='127.0.0.1'&&Number(c.port)===55432&&c.cluster==='pelora_phase3_qualification');
 assert.equal(worker.database,'pelora_phase3_qualification');assert.equal(worker.username,'pelora_cp02_worker');
 const config=c=>({host:c.host,port:c.port,user:c.username,password:c.password,database:worker.database,connectionTimeoutMillis:3000,query_timeout:10000});
 const owner=new pg.Client(config(admin)),pool=new pg.Pool({...config(worker),max:6});pool.on('error',()=>{});await owner.connect();
 const query=(...args)=>pool.query(...args),transaction=postgresTransaction(pool),at=()=>new Date().toISOString();
 const manifest=JSON.parse(fs.readFileSync(new URL('../durableObserve/readerPrivilegeManifest.v1.json',import.meta.url),'utf8'));
 const storage=createPostgresObservationStorage({query});
 const portFor=(h,cap=h.capability)=>createPostgresAttempt({query,transaction,jobId:h.job.jobId,capability:cap});
 async function setup({leaseMs=120000,sourceAgeHours=0,noData=false}={}){
  const anchor=Math.floor(Date.now()/3600000)*3600000,delta=anchor-Date.parse(time());
  const shift=v=>typeof v==='string'&&/^2026-10-0[12]T/.test(v)?new Date(Date.parse(v)+delta).toISOString():Array.isArray(v)?v.map(shift):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,shift(x)])):v;
  const context=fixture('synthetic-'+randomUUID(),m=>{Object.assign(m,shift({...m,effectiveUntil:time(24)}));m.schedule.intervalMs=1000;}),job=createJob(context.manifest,'cell-a',context.manifest.schedule.anchor);
  await registerLocalJob(owner,context,job,{leaseMs});
  const selected=new Date(Date.parse(job.window.start)-sourceAgeHours*3600000).toISOString();
  const bytes=Buffer.from(' \n'+JSON.stringify({table:{columnNames:['time','latitude','longitude','u_current','v_current'],rows:[[selected,job.cell.coordinates.latitude,job.cell.coordinates.longitude,noData?null:0.51,noData?null:0.26]]}})+'\n');
  const h={context,job,bytes,selected,capability:randomUUID()};h.port=portFor(h);return h;
 }
 function composition(h,port=h.port){return {control:port.control,responses:port.responses,results:port.results,clock:{now:at},timers:{arm(){return 1;},clear(){}},
  policy:{async select(reference){return {policyReference:reference,selectedProviderTime:h.selected};}},transport:async()=>({bytes:h.bytes,status:200,provider:h.context.manifest.product.provider,dataset:h.context.manifest.product.dataset})};}
 async function staged(options){const h=await setup(options),c=composition(h);c.control={...c.control,release:async()=>{}};
  c.results={...c.results,async accept(record){h.record=record;throw Error('cp05-staged-before-accept');}};
  const result=await createCurrentObservationWorker(c).run(h.port.handle);assert.equal(result.accepted,false);assert(h.record,result.reason);return h;}
 const accept=(client,h,record=h.record)=>client.query('SELECT cp02.worker($1,$2,$3,$4,NULL)',['accept',h.job.jobId,h.capability,JSON.stringify({recordText:JSON.stringify(record),retainedAt:at()})]);
 const terminal=async h=>(await owner.query('SELECT o.consumed_at,o.lease_until,o.released,d.accepted_at,o.consumed_at=d.accepted_at AND o.consumed_at<o.lease_until AS valid_transition FROM cp02.ownership o LEFT JOIN cp02.accepted d USING(job_id) WHERE o.job_id=$1',[h.job.jobId])).rows[0];
 let clockAt=at();const clock={now:()=>clockAt};
 const reader=createOceanStateReader({query,clock}),writer=createAcceptedObservationReceiptWriter({query,transaction,enabledLocal:true});
 const accepted=async options=>{const h=await setup(options);assert.equal((await createCurrentObservationWorker(composition(h)).run(h.port.handle)).accepted,true);return h;};
 const q=h=>({scope:{manifestDigest:h.context.manifest.digest,region:h.context.manifest.region,product:{family:h.context.manifest.product.family,provider:h.context.manifest.product.provider,dataset:h.context.manifest.product.dataset,productId:h.context.manifest.product.productId},cellKey:h.job.cellKey},queryContext:'live',sourceTime:{from:new Date(Date.parse(h.selected)-3600000).toISOString(),until:new Date(Date.parse(h.selected)+3600000).toISOString()},maxObservations:1});
 const readAt=async(h,hours)=>{clockAt=new Date(Date.parse(h.selected)+hours*3600000).toISOString();return reader.read(q(h));};
 let h;
 try{
  await t.test('accepted chain retains exact observation/evidence/raw/execution identities and governed scope',async()=>{
   h=await accepted();clockAt=at();const r=await reader.read(q(h));assert.equal(r.status,'OK');const o=r.observations[0],s=await storage.readAccepted(h.job.jobId);
   assert.equal(o.observationId,h.job.jobId);assert.equal(o.observationTime,h.selected);assert.deepEqual(o.evidence.reference,s.index.evidence_reference);assert.deepEqual(o.rawResponseReference,s.index.response_reference);assert.equal(o.binding.digest,s.index.binding_digest);assert.equal(o.execution.digest,s.index.execution_digest);assert.equal(o.evidence.captureText,s.record.captureText);assert.equal(o.freshnessState,'fresh');assert.equal(o.liveAuthorityState,'eligible');assert.equal(o.queryContext,'live');assert.equal(o.currentLive,true);
  });
  await t.test('72-hour presentation and 96-hour live authority boundaries remain independent to one millisecond',async()=>{
   for(const [hours,fresh,live] of [[72,'fresh','eligible'],[72+1/3600000,'stale','eligible'],[80,'stale','eligible'],[96,'stale','eligible'],[96+1/3600000,'stale','not-current']]){
    const r=await readAt(h,hours),o=r.observations[0];assert.equal(r.status,'OK');assert.equal(o.freshnessState,fresh);assert.equal(o.liveAuthorityState,live);assert.equal(o.age.milliseconds,Math.round(hours*3600000));assert.equal(o.currentLive,live==='eligible');assert.equal(o.observationState,'accepted');assert.equal(o.queryContext,'live');
   }
  });
  await t.test('later reads increase source age without changing any observation identity or capture',async()=>{
   const a=(await readAt(h,80)).observations[0],b=(await readAt(h,81)).observations[0];assert.equal(b.age.milliseconds-a.age.milliseconds,3600000);
   for(const key of ['observationId','observationTime','providerSelectedTime','evidence','rawResponseReference','execution','binding','acceptance'])assert.deepEqual(b[key],a[key]);
   assert.deepEqual(await reader.read(q(h)),await reader.read(q(h)));
  });
  await t.test('old/not-current is archived without becoming historical unless explicitly requested',async()=>{
   const old=await readAt(h,100);assert.equal(old.observations[0].liveAuthorityState,'not-current');assert.equal(old.observations[0].observationState,'accepted');assert.equal(old.currentLiveAvailable,false);
   const historical={...q(h),queryContext:'historical',targetTime:new Date(Date.parse(h.selected)+80*3600000).toISOString(),maxObservations:20};const past=await reader.read(historical);
   assert.equal(past.status,'OK');assert.equal(past.observations[0].observationState,'historical-accepted');assert.equal(past.observations[0].freshnessState,'stale');assert.equal(past.observations[0].liveAuthorityState,'eligible');assert.equal(past.observations[0].currentLive,false);assert.equal(past.currentLiveAvailable,false);
  });
  await t.test('future historical target or caller-supplied live age/read time cannot create freshness',async()=>{
   assert.equal((await reader.read({...q(h),assessmentAt:h.selected})).status,'INVALID_QUERY');
   assert.equal((await reader.read({...q(h),queryContext:'historical',targetTime:new Date(Date.parse(clockAt)+1).toISOString()})).status,'INVALID_QUERY');
  });
  await t.test('missing acquisition, pending evidence and stale claimant artifacts never enter reader',async()=>{
   const pending=await staged();clockAt=at();assert.equal((await reader.read(q(pending))).status,'MISSING');
   await pending.port.control.release(pending.port.handle);const next=portFor(pending,randomUUID());await next.control.claim(next.handle,at());assert.equal((await reader.read(q(pending))).status,'MISSING');
   const empty=await setup();assert.equal((await reader.read(q(empty))).status,'MISSING');
  });
  await t.test('no-valid-pixel worker outcome is unaccepted and is never forged into accepted no-data',async()=>{
   const empty=await setup({noData:true});const run=await createCurrentObservationWorker(composition(empty)).run(empty.port.handle);assert.equal(run.accepted,false);assert.equal(run.status,'NO_DATA');clockAt=at();const r=await reader.read(q(empty));assert.equal(r.status,'MISSING');assert.equal(r.acceptedNoDataSupport,'NOT_SUPPORTED_BY_QUALIFIED_CURRENTS_ACCEPTANCE');assert.equal(r.observations.length,0);
  });
  for(const preserveComponents of [false,true])await t.test(preserveComponents?'component evidence remains live eligible without upgrading a failed speed derivation':'qualified acceptance rejects attempted no-data chain; reader cannot fabricate one',async()=>{
   const nd=await staged();const state=await nd.port.control.check(nd.port.handle,at()),point=JSON.parse(nd.record.captureText).samples[0].point;
   point.speedKnots=null;point.speedDerivationFailed=preserveComponents;
   if(!preserveComponents){point.source.availability='no-valid-pixel';point.directionDegrees=null;point.eastwardMetersPerSecond=null;point.northwardMetersPerSecond=null;}
   const capture=encodeNormalizedCurrentHandoff(point,SOURCE_NORMALIZATION_VERSION);
   // A distinct job/attempt using existing validated staging contract, not a worker behavior change.
   const test=await setup({noData:!preserveComponents}),control=await test.port.control.claim(test.port.handle,at()),raw=await test.port.responses.retain(test.bytes),now=at();
   const base=structuredClone(nd.record.execution);delete base.digest;Object.assign(base,control.attempt,{jobId:test.job.jobId,manifestDigest:test.context.manifest.digest,cellKey:test.job.cellKey,startedAt:now,finishedAt:now,evidenceReference:capture.reference});
   base.acquisition.requestedAt=now;base.acquisition.receivedAt=now;base.acquisition.normalizedAt=now;base.acquisition.retainedResponseReference=raw.reference;base.acquisition.request.selectedProviderTime=test.selected;base.acquisition.response.observationTime=test.selected;
   const context={...test.context,job:test.job};base.acquisition.request.coordinates=test.job.cell.coordinates;base.acquisition.response.coordinates=test.job.cell.coordinates;const p=JSON.parse(capture.captureText).samples[0].point;p.requestedLatitude=test.job.cell.coordinates.latitude;p.resolvedLatitude=test.job.cell.coordinates.latitude;p.requestedLongitude=test.job.cell.coordinates.longitude;p.resolvedLongitude=test.job.cell.coordinates.longitude;p.observedAt=test.selected;
   const finalCapture=encodeNormalizedCurrentHandoff(p,SOURCE_NORMALIZATION_VERSION);base.evidenceReference=finalCapture.reference;const execution=createExecution(context,base,finalCapture.captureText),binding=createBinding(context,execution,finalCapture.captureText);
   const record={...nd.record,execution,binding,captureText:finalCapture.captureText,responseRetainedAt:now};
   if(!preserveComponents){await assert.rejects(test.port.results.write(record),/durable-provenance-mismatch/);clockAt=at();const r=await reader.read(q(test));assert.equal(r.status,'MISSING');assert.equal(r.observations.length,0);assert.equal(r.currentLiveAvailable,false);}
   else{await test.port.results.write(record);await test.port.results.accept(record,async()=>{await test.port.control.check(test.port.handle,at());},at());clockAt=at();const r=await reader.read(q(test));assert.equal(r.status,'OK');const o=r.observations[0];assert.equal(o.liveAuthorityState,'eligible');assert.equal(o.quality.componentsAvailable,true);assert.equal(o.quality.completeVectorAvailable,false);assert.equal(o.quality.speedDerivationFailed,true);assert.equal(o.evidence.point.speedKnots,null);}
  });
  await t.test('source-time ordering beats later acceptance; bounded historical ranges remain explicit',async()=>{
   const head=await accepted(),job=createJob(head.context.manifest,head.job.cellKey,new Date(Date.parse(head.job.window.start)+1000).toISOString());
   await registerLocalJob(owner,head.context,job);const selected=new Date(Date.parse(head.selected)-3600000).toISOString();
   const bytes=Buffer.from(JSON.stringify({table:{columnNames:['time','latitude','longitude','u_current','v_current'],rows:[[selected,job.cell.coordinates.latitude,job.cell.coordinates.longitude,0.61,0.36]]}}));
   const prior={context:head.context,job,bytes,selected,capability:randomUUID()};prior.port=portFor(prior);assert.equal((await createCurrentObservationWorker(composition(prior)).run(prior.port.handle)).accepted,true);
   clockAt=new Date(Date.parse(head.selected)+80*3600000).toISOString();const query=q(head);query.sourceTime.from=new Date(Date.parse(selected)-3600000).toISOString();
   const live=await reader.read(query);assert.equal(live.observations[0].observationId,head.job.jobId);assert.equal(live.observations[0].freshnessState,'stale');assert.equal(live.observations[0].liveAuthorityState,'eligible');assert.equal(live.hasMore,true);
   const history=await reader.read({...query,queryContext:'historical',targetTime:clockAt,maxObservations:20});assert.deepEqual(history.observations.map(o=>o.observationId),[head.job.jobId,prior.job.jobId]);assert.equal(history.hasMore,false);
   const bounded=await reader.read({...query,sourceTime:{...query.sourceTime,until:head.selected}});assert.equal(bounded.observations[0].observationId,prior.job.jobId);
  });
  await t.test('unobserved governed cell is missing and region/product mismatch cannot cross scope',async()=>{
   clockAt=at();const query=q(h);query.scope.cellKey='cell-b';assert.equal((await reader.read(query)).status,'MISSING');
   for(const field of ['region','product']){const forged=structuredClone(q(h));if(field==='region')forged.scope.region.id='different-region';else forged.scope.product.productId='different-product';assert.equal((await reader.read(forged)).status,'INTEGRITY_FAILED');}
  });
  await t.test('receipt absence preserves accepted evidence, while valid receipt proves only assessed provenance',async()=>{
   const before=await storage.readAccepted(h.job.jobId);clockAt=at();let r=await reader.read(q(h));assert.equal(r.observations[0].provenance.receipt.status,'AS_OF_AUTHORITY_UNKNOWN');
   assert.equal((await writer.issue({jobId:h.job.jobId,capability:h.capability})).status,'RECEIPT_ACCEPTED');clockAt=at();r=await reader.read(q(h));assert.equal(r.observations[0].provenance.receipt.status,'AVAILABLE_BY_ASSESSMENT');assert.deepEqual(await storage.readAccepted(h.job.jobId),before);assert.equal(JSON.stringify(r).includes(h.capability),false);assert.equal(Object.hasOwn(r.observations[0].provenance.receipt.linkage,'token'),false);
  });
  await t.test('receipt received after historical target cannot fabricate as-of receipt authority',async()=>{
   const fresh=await accepted({sourceAgeHours:2.001+(Date.now()%3600000)/3600000}),target=at();await new Promise(resolve=>setTimeout(resolve,5));assert.equal((await writer.issue({jobId:fresh.job.jobId,capability:fresh.capability})).status,'RECEIPT_ACCEPTED');clockAt=at();
   const r=await reader.read({...q(fresh),queryContext:'historical',targetTime:target});assert.equal(r.status,'OK');assert.equal(r.observations[0].provenance.receipt.status,'NOT_RECEIVED_BY_ASSESSMENT');assert.equal(r.observations[0].currentLive,false);
  });
  await t.test('historical target before acceptance remains missing even if source time is earlier',async()=>{
   const target=new Date(Date.parse(h.selected)+1).toISOString();clockAt=at();const r=await reader.read({...q(h),queryContext:'historical',targetTime:target});assert.equal(r.status,'MISSING');
  });
  await t.test('tampered raw/evidence/binding/receipt/scope references fail closed without fallback',async()=>{
   const mutations=[v=>v.observations[0].chain.rawHex='00',v=>v.observations[0].chain.evidenceReference.sha256='0'.repeat(64),v=>v.observations[0].chain.index.binding_digest='0'.repeat(64),v=>v.observations[0].receipt.linkage.cell_key='forged',v=>v.cell.coordinates.latitude=1];
   for(const mutate of mutations){const poison=createOceanStateReader({clock,query:async(...args)=>{const r=await query(...args);mutate(r.rows[0].value);return r;}});assert.equal((await poison.read(q(h))).status,'INTEGRITY_FAILED');}
  });
  await t.test('privacy fields, coordinates, session, viewport, reports and getters cannot affect base state',async()=>{
   const original=await reader.read(q(h));for(const extra of [{latitude:1,longitude:2},{captainCoordinates:[1,2]},{userId:'x'},{session:{}},{viewport:[]},{mission:'x'},{fishingReports:[]},{appActivity:true}])assert.equal((await reader.read({...q(h),...extra})).status,'INVALID_QUERY');
   let touched=false;const poison=q(h);Object.defineProperty(poison,'latitude',{enumerable:true,get(){touched=true;throw Error('private');}});assert.equal((await reader.read(poison)).status,'INVALID_QUERY');assert.equal(touched,false);assert.deepEqual(await reader.read(q(h)),original);
  });
  await t.test('reader executes one SELECT in a read-only transaction and cannot mutate immutable state',async()=>{
   await owner.query('BEGIN READ ONLY');try{const readOnly=createOceanStateReader({clock,query:(...a)=>owner.query(...a)});assert.equal((await readOnly.read(q(h))).status,'OK');}finally{await owner.query('ROLLBACK');}
   const calls=[];const instrumented=createOceanStateReader({clock,query:(text,values)=>{calls.push(text);return query(text,values);}});assert.equal((await instrumented.read(q(h))).status,'OK');assert.equal(calls.length,1);assert(calls[0].startsWith('SELECT cp07.read_scope'));
   await assert.rejects(query('CREATE TABLE cp07.forge(x int)'),e=>e.code==='42501');await assert.rejects(query('UPDATE cp03.observations SET cell_key=cell_key'),e=>e.code==='42501');
   assert.equal((await verifyWorkerPrivileges((...a)=>owner.query(...a),manifest)).status,'PASS');
  });
 }finally{await pool.end();await owner.end();}
});
