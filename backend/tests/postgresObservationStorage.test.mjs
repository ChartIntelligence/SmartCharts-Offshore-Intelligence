import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import pg from 'pg';
import {fixture,time} from './fixtures/continuousObserveFixture.mjs';
import {createJob} from '../observe/jobs.mjs';
import {createCurrentObservationWorker} from '../observe/currentObservationWorker.mjs';
import {createPostgresAttempt,postgresTransaction,registerLocalJob} from '../durableObserve/postgresPorts.mjs';
import {createPostgresObservationStorage,validateStoredObservation} from '../durableObserve/observationStorage.mjs';
import {responseReference} from '../observe/workerData.mjs';

test('CP-03 real local durable observation qualification',{skip:process.env.PELORA_CP03_LOCAL!=='1'},async t=>{
 const root=path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification');
 const admin=JSON.parse(fs.readFileSync(path.join(root,'credentials.json'),'utf8'));
 const worker=JSON.parse(fs.readFileSync(path.join(root,'worker-credentials.json'),'utf8'));
 for(const c of [admin,worker])assert(c.host==='127.0.0.1'&&Number(c.port)===55432&&c.cluster==='pelora_phase3_qualification');
 assert.equal(worker.database,'pelora_phase3_qualification');assert.equal(worker.username,'pelora_cp02_worker');
 const config=c=>({host:c.host,port:c.port,user:c.username,password:c.password,database:worker.database,query_timeout:5000});
 const owner=new pg.Client(config(admin)),pool=new pg.Pool({...config(worker),max:4});await owner.connect();
 const query=(...args)=>pool.query(...args),at=()=>new Date().toISOString(),transaction=postgresTransaction(pool);
 const attemptFor=options=>createPostgresAttempt({query,transaction,...options});
 const storage=createPostgresObservationStorage({query});
 async function setup({leaseMs=120000}={}){
  const anchor=Math.floor(Date.now()/3600000)*3600000,delta=anchor-Date.parse(time());
  const shift=v=>typeof v==='string'&&/^2026-10-0[12]T/.test(v)?new Date(Date.parse(v)+delta).toISOString():Array.isArray(v)?v.map(shift):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,shift(x)])):v;
  const context=fixture('synthetic-'+randomUUID(),m=>Object.assign(m,shift({...m,effectiveUntil:time(24)})));
  const job=createJob(context.manifest,'cell-a',context.manifest.schedule.anchor);await registerLocalJob(owner,context,job,{leaseMs});
  const capability=randomUUID(),port=attemptFor({jobId:job.jobId,capability});
  const bytes=Buffer.from(' \r\n'+JSON.stringify({table:{columnNames:['time','latitude','longitude','u_current','v_current'],rows:[[job.window.start,job.cell.coordinates.latitude,-90,0.5,0.25]]}})+'\n\t');
  const composition={control:port.control,responses:port.responses,results:port.results,clock:{now:at},timers:{arm(){return 1;},clear(){}},
   policy:{async select(reference){return {policyReference:reference,selectedProviderTime:job.window.start};}},
   transport:async()=>({bytes,status:200,provider:context.manifest.product.provider,dataset:context.manifest.product.dataset})};
  return {context,job,port,bytes,composition,capability};
 }
 async function staged(options){const h=await setup(options);let record;
  h.composition.results={...h.port.results,async accept(v){record=v;throw Error('synthetic-crash-before-accept');}};
  h.composition.control={...h.port.control,release:async()=>{}};
  const result=await createCurrentObservationWorker(h.composition).run(h.port.handle);assert.equal(result.accepted,false);assert(record,result.reason);return {...h,record};}
 const run=h=>createCurrentObservationWorker(h.composition).run(h.port.handle);
 const lookup=async jid=>(await query('SELECT cp03.lookup($1) AS value',[jid])).rows[0].value;
 try{
  await t.test('exact raw bytes, original V3 capture, execution and index round trip',async()=>{
   const h=await setup(),r=await run(h);assert.equal(r.accepted,true,r.reason);
   const back=await storage.readAccepted(h.job.jobId);assert.equal(back.status,'ACCEPTED_HISTORICAL');assert.deepEqual(back.rawBytes,h.bytes);
   assert.deepEqual(back.record,r.record);assert.equal(back.record.captureText,r.record.captureText);
   assert.deepEqual(back.index.response_reference,responseReference(h.bytes));assert.deepEqual(back.index.evidence_reference,r.record.execution.evidenceReference);
   assert.equal(back.index.receipt_reference,null);assert.equal(back.index.cell_key,h.job.cellKey);assert.deepEqual(back.index.observation_window,h.job.window);
  });
  await t.test('missing job and pre-accept immutable artifacts never surface as accepted',async()=>{
   const h=await staged();assert.equal(await storage.readAccepted(h.job.jobId),null);
   assert.equal(await storage.readAccepted('coj1-'+'0'.repeat(64)),null);
   const n=(await owner.query('SELECT count(*)::int AS n FROM cp03.bindings WHERE token=$1',[h.capability])).rows[0].n;assert.equal(n,1);
  });
  await t.test('same-attempt retry reconciles original immutable artifacts without capture recreation',async()=>{
   const h=await staged();assert.deepEqual(await h.port.results.write(h.record),{status:'ACKNOWLEDGED'});
   assert.deepEqual(await h.port.results.read(h.record.execution.attemptId),h.record);
   await h.port.results.accept(h.record,()=>h.port.control.check(h.port.handle,at()),at());
   assert.equal((await storage.readAccepted(h.job.jobId)).record.captureText,h.record.captureText);
  });
  await t.test('reclaim reuses evidence identity and bytes with distinct new attempt/binding',async()=>{
   const h=await staged({leaseMs:2000});await owner.query('SELECT pg_sleep(2.1)');
   const next=attemptFor({jobId:h.job.jobId});await next.control.claim(next.handle,at());
   await assert.rejects(h.port.results.accept(h.record,async()=>{},at()),/attempt-not-owned/);
   await assert.rejects(h.port.results.write(h.record),/attempt-not-owned/);
   Object.assign(h.composition,{control:next.control,responses:next.responses,results:next.results});
   const r=await createCurrentObservationWorker(h.composition).run(next.handle);assert.equal(r.accepted,true,r.reason);
   assert.notEqual(r.record.execution.attemptId,h.record.execution.attemptId);
   assert.notEqual(r.record.binding.digest,h.record.binding.digest);
   assert.deepEqual(r.record.execution.evidenceReference,h.record.execution.evidenceReference);
   assert.equal(r.record.captureText,h.record.captureText);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp03.evidence WHERE evidence_id=$1',[r.record.execution.evidenceReference.referenceId])).rows[0].n,1);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp03.bindings d JOIN cp02.attempts a USING(token) WHERE a.job_id=$1',[h.job.jobId])).rows[0].n,2);
  });
  await t.test('duplicate acceptance and competing claim cannot create a second index',async()=>{
   const h=await staged();const guard=()=>h.port.control.check(h.port.handle,at()),retained=at();
   await Promise.all([h.port.results.accept(h.record,guard,retained),query('SELECT cp02.worker($1,$2,$3,$4,NULL)',['accept',h.job.jobId,h.capability,JSON.stringify({recordText:JSON.stringify(h.record),retainedAt:retained})])]);
   const next=attemptFor({jobId:h.job.jobId});await assert.rejects(next.control.claim(next.handle,at()),/job-already-accepted/);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp03.observations WHERE job_id=$1',[h.job.jobId])).rows[0].n,1);
  });
  await t.test('cancel after index insertion rolls back both authoritative decision and index',async()=>{
   const h=await staged();let calls=0;
   await assert.rejects(h.port.results.accept(h.record,async()=>{await h.port.control.check(h.port.handle,at());if(++calls===2)throw Error('cancel-after-insert');},at()),/cancel-after-insert/);
   assert.equal(await storage.readAccepted(h.job.jobId),null);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp03.observations WHERE job_id=$1',[h.job.jobId])).rows[0].n,0);
  });
  await t.test('raw, evidence, binding, index and missing-chain tampering fail closed on replay',async()=>{
   const h=await setup(),r=await run(h);assert.equal(r.accepted,true,r.reason);const value=await lookup(h.job.jobId);
   for(const mutate of [v=>{v.rawHex='00';},v=>{v.rawHash='0'.repeat(64);},v=>{v.captureText+=' ';},v=>{v.evidenceReference.sha256='0'.repeat(64);},
    v=>{v.binding.binding_digest='0'.repeat(64);},v=>{v.index.timestamps.selectedProviderTime=time();},v=>{v.index.response_reference.id='wrong';},v=>{v.binding=null;},
    v=>{const p=JSON.parse(v.recordText);p.binding.digest='0'.repeat(64);v.recordText=JSON.stringify(p);},v=>{v.index.receipt_reference={id:'fake'};}]){
    const changed=structuredClone(value);mutate(changed);assert.throws(()=>validateStoredObservation(h.job.jobId,changed));}
  });
  await t.test('direct runtime procedure cannot stage tampered reference or binding digests',async()=>{
   // A fresh claim with raw retained, before the first result INSERT.
   const h=await setup();await h.port.control.claim(h.port.handle,at());await h.port.responses.retain(h.bytes);
   let record;h.composition.results={...h.port.results,async write(r){record=r;throw Error('stop-before-stage');}};
   await run(h);assert(record); // worker cleanup released, reclaim same capability forbidden; restore ownership for isolated adversary fixture.
   await owner.query('UPDATE cp02.ownership SET released=false WHERE job_id=$1',[h.job.jobId]);
   for(const mutate of [r=>{r.execution.evidenceReference.sha256='0'.repeat(64);r.binding.evidenceReference.sha256='0'.repeat(64);},
    r=>{r.execution.acquisition.retainedResponseReference.id='wrong';r.binding.retainedResponseReference.id='wrong';},r=>{r.binding.digest='0'.repeat(64);}]){
    const copy=structuredClone(record);mutate(copy);
    await assert.rejects(query('SELECT cp02.worker($1,$2,$3,$4,NULL)',['write',h.job.jobId,h.capability,JSON.stringify(copy)]),/durable-(reference|provenance)-mismatch/);
   }
   const copy=structuredClone(record),{digest,...body}=copy.execution;
   body.acquisition.request.coordinates.latitude=1;body.acquisition.response.coordinates.latitude=1;
   // Correctly re-sealed operational digests still cannot contradict approved cell authority.
   const {digest:hash}=await import('../observe/canonical.mjs');
   copy.execution={...body,digest:hash('pelora-observe-execution-v1',body)};
   const {digest:oldBindingDigest,...bindingBody}=copy.binding;bindingBody.executionDigest=copy.execution.digest;
   copy.binding={...bindingBody,digest:hash('pelora-observe-binding-v1',bindingBody)};
   await assert.rejects(query('SELECT cp02.worker($1,$2,$3,$4,NULL)',['write',h.job.jobId,h.capability,JSON.stringify(copy)]),/durable-provenance-mismatch/);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp02.results WHERE token=$1',[h.capability])).rows[0].n,0);
  });
  await t.test('restricted worker denied immutable table mutation, schema/admin and helper execution',async()=>{
   for(const table of ['evidence','bindings','observations'])for(const sql of [`SELECT * FROM cp03.${table}`,`UPDATE cp03.${table} SET ${table==='observations'?'receipt_reference=NULL':table==='evidence'?"capture_text=''":"record_hash=''"}`,`DELETE FROM cp03.${table}`,`TRUNCATE cp03.${table}`,`ALTER TABLE cp03.${table} ADD COLUMN forbidden int`])
    await assert.rejects(query(sql),e=>e.code==='42501');
   for(const sql of ["CREATE TABLE cp03.forbidden(x int)","SET ROLE pelora_cp02_owner","CREATE ROLE cp03_forbidden","CREATE SCHEMA cp03_forbidden","SELECT cp03.canonical('{}'::jsonb)"])
    await assert.rejects(query(sql),e=>e.code==='42501');
   const privileges=(await owner.query("SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='cp03' AND has_function_privilege('pelora_cp02_worker',p.oid,'EXECUTE') ORDER BY p.proname")).rows;
   assert.deepEqual(privileges,[{proname:'lookup'}]);
  });
  await t.test('immutable triggers reject migration-owner update and delete too',async()=>{
   const h=await setup(),r=await run(h);assert.equal(r.accepted,true,r.reason);
   await assert.rejects(owner.query('UPDATE cp03.observations SET receipt_reference=NULL WHERE job_id=$1',[h.job.jobId]),/immutable-record/);
   await assert.rejects(owner.query('DELETE FROM cp03.bindings WHERE token=$1',[h.capability]),/immutable-record/);
  });
  await t.test('real process death before acceptance leaves staging; reclaim preserves exact evidence',async()=>{
   const h=await setup({leaseMs:2000});const file=new URL('./fixtures/postgresCrashChild.mjs',import.meta.url).pathname.replace(/^\/(\w:)/,'$1');
   const child=spawnSync(process.execPath,[file,h.job.jobId,'before-accept'],{encoding:'utf8',timeout:10000,windowsHide:true});assert.equal(child.status,71,child.stderr);
   assert.equal(await storage.readAccepted(h.job.jobId),null);
   const before=(await owner.query('SELECT r.capture_text FROM cp02.results r JOIN cp02.attempts a USING(token) WHERE a.job_id=$1',[h.job.jobId])).rows[0].capture_text;
   await owner.query('SELECT pg_sleep(2.1)');const r=await run(h);assert.equal(r.accepted,true,r.reason);assert.equal(r.record.captureText,before);
  });
  await t.test('real process death after COMMIT allows independent validated accepted readback',async()=>{
   const h=await setup(),file=new URL('./fixtures/postgresCrashChild.mjs',import.meta.url).pathname.replace(/^\/(\w:)/,'$1');
   const child=spawnSync(process.execPath,[file,h.job.jobId,'after-accept'],{encoding:'utf8',timeout:10000,windowsHide:true});assert.equal(child.status,72,child.stderr);
   const back=await storage.readAccepted(h.job.jobId);assert(back);assert.equal(back.record.execution.fencingToken,1);
  });
  await t.test('poisoned captain/session inputs cannot reach acquisition or job authority',async()=>{
   const h=await setup();h.composition.captain={coordinates:[1,2],mission:'PRIVATE',session:'PRIVATE'};h.composition.viewport=[1,2];let url;
   const transport=h.composition.transport;h.composition.transport=async req=>{url=req.url;return transport(req);};
   const r=await run(h);assert.equal(r.accepted,true,r.reason);assert.equal(url,r.record.requestUrl);assert(!JSON.stringify(await lookup(h.job.jobId)).includes('PRIVATE'));
   await assert.rejects(registerLocalJob(owner,{...h.context,session:'PRIVATE'},h.job),/exact-fields/);
  });
  await t.test('reviewed migration replays legacy history transactionally and applied functions match source',async()=>{
   const sql=fs.readFileSync(new URL('../durableObserve/cp03.sql',import.meta.url),'utf8');
   for(const match of sql.matchAll(/CREATE FUNCTION cp03\.([a-z_]+)\([\s\S]*?\$\$([\s\S]*?)\$\$;/g)){
    const row=(await owner.query("SELECT prosrc,proconfig FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='cp03' AND p.proname=$1",[match[1]])).rows[0];
    assert.equal(row.prosrc.trim(),match[2].trim());assert.deepEqual(row.proconfig,['search_path=pg_catalog']);
   }
   const before=(await owner.query('SELECT count(*)::int AS n FROM cp03.observations')).rows[0].n;
   await owner.query('BEGIN');
   try{
    await owner.query('DROP SCHEMA cp03 CASCADE');
    await owner.query(sql.replace(/^BEGIN;$/m,'').replace(/^COMMIT;$/m,''));
    assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp03.observations')).rows[0].n,before);
    for(const {job_id} of (await owner.query('SELECT job_id FROM cp02.accepted')).rows){
     const value=(await owner.query('SELECT cp03.lookup($1) AS value',[job_id])).rows[0].value;
     assert(validateStoredObservation(job_id,value));
    }
   }finally{await owner.query('ROLLBACK');}
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp03.observations')).rows[0].n,before);
  });
 }finally{await pool.end();await owner.end();}
});
