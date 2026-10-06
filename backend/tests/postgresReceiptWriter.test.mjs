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

test('CP-06 accepted-observation receipt integration',{skip:process.env.PELORA_CP06_LOCAL!=='1'},async t=>{
 const root=path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification');
 const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8')),admin=read('credentials.json'),worker=read('worker-credentials.json');
 for(const c of [admin,worker])assert(c.host==='127.0.0.1'&&Number(c.port)===55432&&c.cluster==='pelora_phase3_qualification');
 assert.equal(worker.database,'pelora_phase3_qualification');assert.equal(worker.username,'pelora_cp02_worker');
 const config=c=>({host:c.host,port:c.port,user:c.username,password:c.password,database:worker.database,connectionTimeoutMillis:3000,query_timeout:10000});
 const owner=new pg.Client(config(admin)),pool=new pg.Pool({...config(worker),max:6});pool.on('error',()=>{});await owner.connect();
 const query=(...args)=>pool.query(...args),transaction=postgresTransaction(pool),at=()=>new Date().toISOString();
 const manifest=JSON.parse(fs.readFileSync(new URL('../durableObserve/receiptPrivilegeManifest.v1.json',import.meta.url),'utf8'));
 const storage=createPostgresObservationStorage({query});
 const portFor=(h,cap=h.capability)=>createPostgresAttempt({query,transaction,jobId:h.job.jobId,capability:cap});
 async function setup({leaseMs=120000}={}){
  const anchor=Math.floor(Date.now()/3600000)*3600000,delta=anchor-Date.parse(time());
  const shift=v=>typeof v==='string'&&/^2026-10-0[12]T/.test(v)?new Date(Date.parse(v)+delta).toISOString():Array.isArray(v)?v.map(shift):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,shift(x)])):v;
  const context=fixture('synthetic-'+randomUUID(),m=>Object.assign(m,shift({...m,effectiveUntil:time(24)}))),job=createJob(context.manifest,'cell-a',context.manifest.schedule.anchor);
  await registerLocalJob(owner,context,job,{leaseMs});
  const bytes=Buffer.from(' \n'+JSON.stringify({table:{columnNames:['time','latitude','longitude','u_current','v_current'],rows:[[job.window.start,job.cell.coordinates.latitude,job.cell.coordinates.longitude,0.51,0.26]]}})+'\n');
  const h={context,job,bytes,capability:randomUUID()};h.port=portFor(h);return h;
 }
 function composition(h,port=h.port){return {control:port.control,responses:port.responses,results:port.results,clock:{now:at},timers:{arm(){return 1;},clear(){}},
  policy:{async select(reference){return {policyReference:reference,selectedProviderTime:h.job.window.start};}},transport:async()=>({bytes:h.bytes,status:200,provider:h.context.manifest.product.provider,dataset:h.context.manifest.product.dataset})};}
 async function staged(options){const h=await setup(options),c=composition(h);c.control={...c.control,release:async()=>{}};
  c.results={...c.results,async accept(record){h.record=record;throw Error('cp05-staged-before-accept');}};
  const result=await createCurrentObservationWorker(c).run(h.port.handle);assert.equal(result.accepted,false);assert(h.record,result.reason);return h;}
 const accept=(client,h,record=h.record)=>client.query('SELECT cp02.worker($1,$2,$3,$4,NULL)',['accept',h.job.jobId,h.capability,JSON.stringify({recordText:JSON.stringify(record),retainedAt:at()})]);
 const terminal=async h=>(await owner.query('SELECT o.consumed_at,o.lease_until,o.released,d.accepted_at,o.consumed_at=d.accepted_at AND o.consumed_at<o.lease_until AS valid_transition FROM cp02.ownership o LEFT JOIN cp02.accepted d USING(job_id) WHERE o.job_id=$1',[h.job.jobId])).rows[0];
 const writer=createAcceptedObservationReceiptWriter({query,transaction,enabledLocal:true});
 const accepted=async()=>{const h=await setup();assert.equal((await createCurrentObservationWorker(composition(h)).run(h.port.handle)).accepted,true);return h;};
 const input=h=>({jobId:h.job.jobId,capability:h.capability});
 let h,receipt;
 try{
  await t.test('default disabled performs no receipt queries and does not manufacture authority',async()=>{
   const w=createAcceptedObservationReceiptWriter({query:async()=>{throw Error('must-not-query');},transaction:async()=>{throw Error('must-not-query');}});
   assert.equal((await w.issue({})).status,'AS_OF_AUTHORITY_UNKNOWN');
  });
  await t.test('accepted live evidence remains valid without a receipt; historical authority unknown',async()=>{
   h=await accepted();const before=await storage.readAccepted(h.job.jobId);assert(before);assert.equal(before.index.receipt_reference,null);
   assert.equal((await writer.resolve(h.job.jobId,at())).status,'AS_OF_AUTHORITY_UNKNOWN');assert.deepEqual(await storage.readAccepted(h.job.jobId),before);
  });
  await t.test('database witness uses accepted scope and exact raw/evidence/binding/index linkage',async()=>{
   const before=await storage.readAccepted(h.job.jobId);receipt=await writer.issue(input(h));assert.equal(receipt.status,'RECEIPT_ACCEPTED');assert.deepEqual(receipt.linkage,before.index);
   assert.deepEqual(receipt.record.evidenceReference,before.index.evidence_reference);assert.deepEqual(await storage.readAccepted(h.job.jobId),before);
   assert.equal((await writer.resolve(h.job.jobId,at())).status,'AVAILABLE_BY_ASSESSMENT');
   assert.equal((await writer.resolve(h.job.jobId,new Date(Date.parse(receipt.record.receivedAt)-1).toISOString())).status,'NOT_RECEIVED_BY_ASSESSMENT');
  });
  await t.test('duplicate/concurrent retry returns exactly the same receipt without another identity',async()=>{
   const results=await Promise.all(Array.from({length:4},()=>writer.issue(input(h))));for(const r of results)assert.deepEqual(r,receipt);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp06.links WHERE job_id=$1',[h.job.jobId])).rows[0].n,1);
  });
  await t.test('captain/user/session/viewport/mission/report/request coordinates cannot influence identity',async()=>{
   for(const extra of [{latitude:10,longitude:20},{captainCoordinates:[30,40]},{userCoordinates:[1,2]},{session:{latitude:9}},{viewport:[1,2,3,4]},{mission:'private'},{fishingReports:[]},{request:{latitude:88,longitude:99}}]){
    assert.equal((await writer.issue({...input(h),...extra})).status,'AS_OF_AUTHORITY_UNKNOWN');assert.deepEqual(await writer.issue(input(h)),receipt);
   }
   let touched=false;const poison={...input(h)};Object.defineProperty(poison,'latitude',{enumerable:true,get(){touched=true;throw Error('private');}});
   assert.equal((await writer.issue(poison)).status,'AS_OF_AUTHORITY_UNKNOWN');assert.equal(touched,false);
  });
  await t.test('unaccepted, stale and revoked claimant cannot create receipt or terminal state',async()=>{
   const pending=await staged();await assert.rejects(transaction(async q=>{await q("SET LOCAL pelora.cp06_local='on'");await q('SELECT cp06.worker($1,$2)',[pending.job.jobId,pending.capability]);}),/receipt-accepted-attempt-required/);
   await pending.port.control.release(pending.port.handle);const next=portFor(pending,randomUUID());await next.control.claim(next.handle,at());
   assert.equal((await writer.issue(input(pending))).status,'AS_OF_AUTHORITY_UNKNOWN');assert.equal(await storage.readAccepted(pending.job.jobId),null);
   assert.equal((await writer.issue({jobId:h.job.jobId,capability:randomUUID()})).status,'AS_OF_AUTHORITY_UNKNOWN');
  });
  await t.test('SQL receipt creation also requires explicit local opt-in',async()=>{await assert.rejects(query('SELECT cp06.worker($1,$2)',[h.job.jobId,h.capability]),/receipt-local-opt-in-required/);});
  await t.test('rollback after receipt writes leaves no receipt and preserves accepted evidence',async()=>{
   const r=await accepted(),before=await storage.readAccepted(r.job.jobId);
   const w=createAcceptedObservationReceiptWriter({query,enabledLocal:true,transaction:op=>transaction(async q=>{await op(q);throw Error('crash-before-commit');})});
   assert.equal((await w.issue(input(r))).status,'AS_OF_AUTHORITY_UNKNOWN');assert.equal((await writer.resolve(r.job.jobId,at())).status,'AS_OF_AUTHORITY_UNKNOWN');assert.deepEqual(await storage.readAccepted(r.job.jobId),before);
   assert.equal((await writer.issue(input(r))).status,'RECEIPT_ACCEPTED');
  });
  await t.test('lost commit ACK fails closed and retry reconciles the exact committed witness',async()=>{
   const r=await accepted();const w=createAcceptedObservationReceiptWriter({query,enabledLocal:true,transaction:async op=>{await transaction(op);throw Error('lost-ack');}});
   assert.equal((await w.issue(input(r))).status,'AS_OF_AUTHORITY_UNKNOWN');const saved=(await query('SELECT cp06.lookup($1) AS value',[r.job.jobId])).rows[0].value;
   const retry=await writer.issue(input(r));assert.equal(retry.status,'RECEIPT_ACCEPTED');assert.deepEqual(retry.record,JSON.parse(saved.envelopeText).record);
  });
  for(const mode of ['pending','committed'])await t.test('real process death with '+mode+' receipt transaction recovers deterministically',async()=>{
   const r=await accepted(),before=await storage.readAccepted(r.job.jobId);
   const child=spawn(process.execPath,[fileURLToPath(new URL('./fixtures/receiptCrashChild.mjs',import.meta.url)),r.job.jobId,r.capability,mode],{stdio:['ignore','ignore','ignore','ipc'],windowsHide:true});
   try{await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('child-not-ready')),10000);child.once('message',()=>{clearTimeout(timer);resolve();});child.once('error',reject);child.once('exit',code=>{clearTimeout(timer);if(code!==null)reject(Error('child-exited'));});});}
   finally{const stopped=new Promise(resolve=>child.once('close',resolve));child.kill();await stopped;}
   const prior=(await query('SELECT cp06.lookup($1) AS value',[r.job.jobId])).rows[0].value;assert.equal(prior!==null,mode==='committed');
   const retry=await writer.issue(input(r));assert.equal(retry.status,'RECEIPT_ACCEPTED');if(prior)assert.deepEqual(retry.record,JSON.parse(prior.envelopeText).record);assert.deepEqual(await storage.readAccepted(r.job.jobId),before);
  });
  await t.test('tampered linkage/envelope/accepted raw fail closed; fault injection rolls back',async()=>{
   for(const sql of ["UPDATE cp06.links SET linkage=jsonb_set(linkage,'{cell_key}','\"forged\"') WHERE job_id=$1", "UPDATE cp06.envelopes SET envelope_text=replace(envelope_text,'receipt-','forged-') WHERE evidence_id=(SELECT evidence_id FROM cp06.links WHERE job_id=$1)"]){
    await owner.query('BEGIN');try{await owner.query('SET LOCAL ROLE pelora_cp02_owner');await owner.query('ALTER TABLE cp06.links DISABLE TRIGGER immutable');await owner.query('ALTER TABLE cp06.envelopes DISABLE TRIGGER immutable');await owner.query(sql,[h.job.jobId]);
     const w=createAcceptedObservationReceiptWriter({query:(...a)=>owner.query(...a),transaction,enabledLocal:true});assert.equal((await w.resolve(h.job.jobId,at())).status,'AS_OF_AUTHORITY_UNKNOWN');
    }finally{await owner.query('ROLLBACK');}
   }
   const w=createAcceptedObservationReceiptWriter({query:async(...args)=>{const r=await query(...args);if(args[0].includes('cp03.lookup')&&r.rows[0].value)r.rows[0].value.rawHex='00';return r;},transaction,enabledLocal:true});
   assert.equal((await w.issue(input(h))).status,'AS_OF_AUTHORITY_UNKNOWN');assert.deepEqual(await writer.issue(input(h)),receipt);
  });
  await t.test('receipt worker cannot directly mutate receipt objects or accepted evidence/job state',async()=>{
   for(const table of ['policy','envelopes','links'])for(const op of [`SELECT * FROM cp06.${table}`,`UPDATE cp06.${table} SET ${table==='policy'?'id=id':table==='links'?'job_id=job_id':'evidence_id=evidence_id'}`,`DELETE FROM cp06.${table}`,`TRUNCATE cp06.${table}`])await assert.rejects(query(op),e=>e.code==='42501');
   for(const sql of ['CREATE TABLE cp06.forge(x int)','ALTER TABLE cp06.links DISABLE TRIGGER immutable','UPDATE cp02.ownership SET released=true','DELETE FROM cp03.observations','SET ROLE pelora_cp02_owner'])await assert.rejects(query(sql),e=>e.code==='42501');
   assert.equal((await verifyWorkerPrivileges((...a)=>owner.query(...a),manifest)).status,'PASS');
  });
  await t.test('ordinary owner mutation cannot change immutable receipts',async()=>{
   await owner.query('BEGIN');try{await owner.query('SET LOCAL ROLE pelora_cp02_owner');await assert.rejects(owner.query('DELETE FROM cp06.links WHERE job_id=$1',[h.job.jobId]),/immutable-record/);}finally{await owner.query('ROLLBACK');}
  });
 }finally{await pool.end();await owner.end();}
});
