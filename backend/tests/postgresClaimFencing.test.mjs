import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import pg from 'pg';
import {fixture,time} from './fixtures/continuousObserveFixture.mjs';
import {createJob} from '../observe/jobs.mjs';
import {createActivation} from '../observe/activation.mjs';
import {createCurrentObservationWorker} from '../observe/currentObservationWorker.mjs';
import {createPostgresAttempt,postgresTransaction,registerLocalJob,updateLocalActivation} from '../durableObserve/postgresPorts.mjs';

// Explicit opt-in. No default ambient database or production connection URL.
test('CP-02 real local PostgreSQL qualification',{skip:process.env.PELORA_CP02_LOCAL!=='1'},async t=>{
 const root=path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification');
 const admin=JSON.parse(fs.readFileSync(path.join(root,'credentials.json'),'utf8'));
 const worker=JSON.parse(fs.readFileSync(path.join(root,'worker-credentials.json'),'utf8'));
 for(const c of [admin,worker])assert(c.host==='127.0.0.1' && Number(c.port)===55432 && c.cluster==='pelora_phase3_qualification');
 assert.equal(worker.database,'pelora_phase3_qualification');assert.equal(worker.username,'pelora_cp02_worker');
 const config=c=>({host:c.host,port:c.port,user:c.username,password:c.password,database:worker.database,connectionTimeoutMillis:3000,query_timeout:5000});
 const owner=new pg.Client(config(admin)),pool=new pg.Pool({...config(worker),max:4});
 await owner.connect();
 const query=(...args)=>pool.query(...args),at=()=>new Date().toISOString();
 const transaction=postgresTransaction(pool),attemptFor=options=>createPostgresAttempt({query,transaction,...options});
 async function setup({leaseMs=120000,expiresMs=null}={}) {
  const anchor=Math.floor(Date.now()/3600000)*3600000, delta=anchor-Date.parse(time());
  const shift=value=>typeof value==='string' && /^2026-10-0[12]T/.test(value)?new Date(Date.parse(value)+delta).toISOString():
   Array.isArray(value)?value.map(shift):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,shift(v)])):value;
  // Shift fixture times before sealing; never treat historical evidence as now.
  const context=fixture('synthetic-'+randomUUID(),m=>{Object.assign(m,shift({...m,effectiveUntil:time(24)}));
   if(expiresMs!==null)m.effectiveUntil=new Date(Date.now()+expiresMs).toISOString();});
  const job=createJob(context.manifest,'cell-a',context.manifest.schedule.anchor);
  await registerLocalJob(owner,context,job,{leaseMs});
  const capability=randomUUID(),port=attemptFor({jobId:job.jobId,capability});
  const bytes=Buffer.from(' \n'+JSON.stringify({table:{columnNames:['time','latitude','longitude','u_current','v_current'],
   rows:[[job.window.start,job.cell.coordinates.latitude,-90,0.5,0.25]]}})+'\n');
  const timers=new Map();let next=0;
  const composition={control:port.control,responses:port.responses,results:port.results,
   clock:{now:at},timers:{arm(ms,fn){const id=++next;timers.set(id,{ms,fn});return id;},clear(id){timers.delete(id);}},
   policy:{async select(reference){return {policyReference:reference,selectedProviderTime:job.window.start};}},
   transport:async()=>({bytes,status:200,provider:context.manifest.product.provider,dataset:context.manifest.product.dataset})};
  return {context,job,port,bytes,composition,timers,capability};
 }
 async function staged(options={}) {
  const h=await setup(options);let record;
  h.composition.results={...h.port.results,async accept(value){record=value;throw Error('synthetic-crash-before-accept');}};
  // Simulate unavailable cleanup; immutable staging and lease survive process loss.
  h.composition.control={...h.port.control,release:async()=>{}};
  const result=await createCurrentObservationWorker(h.composition).run(h.port.handle);
  assert.equal(result.accepted,false);assert(record,JSON.stringify(result));return {...h,record};
 }
 try {
  await t.test('authenticated endpoint, SCRAM storage and restricted role attributes',async()=>{
   const row=(await query('SELECT current_database() AS db,current_user AS role,inet_server_addr()::text AS host,inet_server_port() AS port')).rows[0];
   assert.deepEqual(row,{db:worker.database,role:worker.username,host:'127.0.0.1/32',port:55432});
   const r=(await owner.query('SELECT rolsuper,rolcreatedb,rolcreaterole,rolbypassrls,rolreplication FROM pg_roles WHERE rolname=$1',[worker.username])).rows[0];
   assert(Object.values(r).every(v=>v===false));
   assert(!(await owner.query('SELECT rolinherit FROM pg_roles WHERE rolname=$1',[worker.username])).rows[0].rolinherit);
   assert((await owner.query("SELECT bool_and(auth_method='scram-sha-256') AS scram FROM pg_hba_file_rules WHERE type='host' AND address='127.0.0.1'")).rows[0].scram);
   const owners=(await owner.query("SELECT n.nspowner=(SELECT oid FROM pg_roles WHERE rolname='pelora_cp02_owner') AS separate FROM pg_namespace n WHERE nspname='cp02'")).rows[0];assert(owners.separate);
   assert((await owner.query("SELECT rolpassword LIKE 'SCRAM-SHA-256$%' AS scram FROM pg_authid WHERE rolname=$1",[worker.username])).rows[0].scram);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM pg_auth_members WHERE member=(SELECT oid FROM pg_roles WHERE rolname=$1)',[worker.username])).rows[0].n,0);
  });
  await t.test('worker denied admin, migration, registry and direct-table operations',async()=>{
   for(const sql of ['CREATE DATABASE cp02_forbidden','CREATE ROLE cp02_forbidden',
    'SET ROLE pelora_cp02_owner','CREATE SCHEMA cp02_forbidden','CREATE TEMP TABLE cp02_forbidden(x int)',
    'SELECT * FROM pg_authid','SELECT * FROM cp02.registry','UPDATE cp02.ownership SET fence=0',
    'INSERT INTO cp02.accepted VALUES(NULL,NULL,NULL,NULL)','DELETE FROM cp02.results',
    'ALTER TABLE cp02.jobs ADD COLUMN forbidden int','TRUNCATE cp02.raw',
    "ALTER ROLE pelora_cp02_worker SUPERUSER", "SELECT pg_read_file('postgresql.conf')"])
    await assert.rejects(query(sql),error=>error.code==='42501',sql);
   assert(!(await query("SELECT has_database_privilege(current_user,current_database(),'CREATE') AS create,has_database_privilege(current_user,current_database(),'TEMP') AS temp")).rows[0].create);
   assert(!(await query("SELECT has_database_privilege(current_user,current_database(),'TEMP') AS temp")).rows[0].temp);
   assert(!(await query("SELECT has_function_privilege(current_user,'cp02.immutable()','EXECUTE') AS allowed")).rows[0].allowed);
   for(const database of ['postgres','template1']) {
    const denied=new pg.Client({...config(worker),database});
    try {await assert.rejects(denied.connect(),error=>error.code==='42501');}finally{await denied.end();}
   }
  });
  await t.test('reviewed SQL body is applied; future functions and tables default-deny access',async()=>{
   const sql=fs.readFileSync(new URL('../durableObserve/cp02.sql',import.meta.url),'utf8');
   const start=sql.indexOf('CREATE FUNCTION cp02.worker('),bodyStart=sql.indexOf('$$',start)+2,bodyEnd=sql.indexOf('$$;',bodyStart);
   const functionRow=(await owner.query("SELECT prosrc,prosecdef,proconfig FROM pg_proc WHERE oid='cp02.worker(text,text,uuid,text,bytea)'::regprocedure")).rows[0];
   assert.equal(functionRow.prosrc.trim(),sql.slice(bodyStart,bodyEnd).trim());assert(functionRow.prosecdef);assert.deepEqual(functionRow.proconfig,['search_path=pg_catalog']);
   await owner.query('BEGIN; SET LOCAL ROLE pelora_cp02_owner; CREATE FUNCTION cp02.future_denied() RETURNS integer LANGUAGE sql AS $$ SELECT 1 $$; CREATE TABLE cp02.future_denied(x integer); COMMIT;');
   try {await assert.rejects(query('SELECT cp02.future_denied()'),error=>error.code==='42501');
    await assert.rejects(query('SELECT * FROM cp02.future_denied'),error=>error.code==='42501');
   } finally {await owner.query('DROP FUNCTION cp02.future_denied(); DROP TABLE cp02.future_denied;');}
  });
  await t.test('authoritative idempotent creation, private input exclusion, opaque handles',async()=>{
   const h=await setup();await registerLocalJob(owner,h.context,h.job);
   await assert.rejects(registerLocalJob(owner,{...h.context,sessionId:'PRIVATE'},h.job),/exact-fields/);
   await assert.rejects(registerLocalJob(owner,h.context,{...h.job,captainCoordinates:{latitude:1,longitude:2}}),/job-mismatch/);
   await assert.rejects(h.port.control.claim({},at()),/opaque-handle/);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp02.jobs WHERE job_id=$1',[h.job.jobId])).rows[0].n,1);
  });
  await t.test('real worker acquires exact bytes and accepts once with poisoned user context',async()=>{
   const h=await setup();h.composition.captain={sessionId:'PRIVATE',viewport:[1,2]};h.composition.activeUsers=0;
   const result=await createCurrentObservationWorker(h.composition).run(h.port.handle);
   assert.equal(result.accepted,true,JSON.stringify(result));assert.equal(h.timers.size,0);assert(!JSON.stringify(result).includes('PRIVATE'));
   const raw=(await owner.query('SELECT bytes FROM cp02.raw WHERE hash=$1',[result.record.execution.acquisition.retainedResponseReference.sha256])).rows[0].bytes;
   assert.deepEqual(raw,h.bytes);assert.deepEqual(await h.port.results.reconcile(),{status:'ACKNOWLEDGED',retainedAt:result.retainedAt,record:result.record});
   const another=attemptFor({jobId:h.job.jobId});await assert.rejects(another.control.claim(another.handle,at()),/job-already-accepted/);
   await assert.rejects(h.port.responses.retain(h.bytes),/job-already-accepted/);
  });
  await t.test('concurrent claimants serialize: exactly one current owner',async()=>{
   const h=await setup(),other=attemptFor({jobId:h.job.jobId});
   const outcomes=await Promise.allSettled([h.port.control.claim(h.port.handle,at()),other.control.claim(other.handle,at())]);
   assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);assert.match(outcomes.find(x=>x.status==='rejected').reason.message,/job-busy/);
  });
  await t.test('crash before acceptance recovers; reclaim increments fence; stale claimant cannot accept',async()=>{
   const h=await staged({leaseMs:2000});
   const old=h.record.execution.fencingToken;await owner.query('SELECT pg_sleep(2.1)');
   const next=attemptFor({jobId:h.job.jobId});const state=await next.control.claim(next.handle,at());
   assert.equal(state.attempt.fencingToken,old+1);assert.notEqual(state.attempt.attemptId,h.record.execution.attemptId);
   await assert.rejects(h.port.results.accept(h.record,async()=>true,at()),/attempt-not-owned/);
   await assert.rejects(h.port.control.check(h.port.handle,at()),/attempt-not-owned/);
   // Retrying the stale claim capability must not mint a fresh fence.
   await assert.rejects(h.port.control.claim(h.port.handle,at()),/attempt-not-owned/);
   h.composition.control=next.control;h.composition.responses=next.responses;h.composition.results=next.results;
   // Claim retry for the same capability is idempotent.
   const result=await createCurrentObservationWorker(h.composition).run(next.handle);assert.equal(result.accepted,true,JSON.stringify(result));
   assert.equal(result.record.execution.fencingToken,old+1);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp02.accepted WHERE job_id=$1',[h.job.jobId])).rows[0].n,1);
  });
  await t.test('acceptance rechecks database ownership even after a successful earlier check',async()=>{
   const h=await staged();await h.port.control.check(h.port.handle,at());await h.port.control.release(h.port.handle);
   const next=attemptFor({jobId:h.job.jobId});await next.control.claim(next.handle,at());
   await assert.rejects(h.port.results.accept(h.record,async()=>true,at()),/attempt-not-owned/);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp02.accepted WHERE job_id=$1',[h.job.jobId])).rows[0].n,0);
  });
  await t.test('immutable staging rejects conflicting retry and preserves evidence/result history',async()=>{
   const h=await staged();assert.equal((await h.port.results.write(h.record)).status,'ACKNOWLEDGED');
   await assert.rejects(h.port.results.write({...h.record,requestUrl:h.record.requestUrl+'changed'}),/immutable-result-conflict/);
   await assert.rejects(owner.query('UPDATE cp02.results SET capture_text=$1 WHERE token=(SELECT token FROM cp02.attempts WHERE attempt_id=$2)',
    ['changed',h.record.execution.attemptId]),/immutable-record/);
   await assert.rejects(owner.query('UPDATE cp02.jobs SET job=job WHERE job_id=$1',[h.job.jobId]),/immutable-record/);
   await assert.rejects(owner.query('UPDATE cp02.attempts SET fence=fence WHERE job_id=$1',[h.job.jobId]),/immutable-record/);
   await assert.rejects(owner.query('UPDATE cp02.raw SET bytes=bytes WHERE hash=$1',[h.record.execution.acquisition.retainedResponseReference.sha256]),/immutable-record/);
   assert.deepEqual(await h.port.results.read(h.record.execution.attemptId),h.record);
  });
  await t.test('concurrent identical acceptance retry has one decision and exact deterministic acknowledgment',async()=>{
   const h=await staged(),retainedAt=at();
   const retry=attemptFor({jobId:h.job.jobId,capability:h.capability});
   const values=await Promise.all([h.port.results.accept(h.record,async()=>true,retainedAt),retry.results.accept(h.record,async()=>true,retainedAt)]);
   assert.deepEqual(values[0],values[1]);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp02.accepted WHERE job_id=$1',[h.job.jobId])).rows[0].n,1);
   await assert.rejects(h.port.results.accept({...h.record,requestUrl:'conflicting'},async()=>true,at()),/accepted-retry-conflict/);
   await assert.rejects(owner.query('UPDATE cp02.accepted SET retained_at=retained_at WHERE job_id=$1',[h.job.jobId]),/immutable-record/);
  });
  await t.test('forged attempt/fence and foreign capability cannot stage or accept',async()=>{
   const h=await staged();
   const call=(op,cap,payload)=>query('SELECT cp02.worker($1,$2,$3,$4,NULL)',[op,h.job.jobId,cap,payload]);
   for(const change of [r=>r.execution.fencingToken++,r=>r.execution.attemptId='forged',r=>r.binding.fencingToken++,r=>r.execution.jobId='forged']) {
    const record=structuredClone(h.record);change(record);
    await assert.rejects(call('write',h.capability,JSON.stringify(record)),/result-binding/);
   }
   await assert.rejects(call('accept',randomUUID(),JSON.stringify({recordText:JSON.stringify(h.record),retainedAt:at()})),/attempt-not-owned/);
   await assert.rejects(call('accept',h.capability,JSON.stringify({recordText:JSON.stringify(h.record),retainedAt:new Date(Date.now()+3600000).toISOString()})),/retention-time-order/);
  });
  await t.test('claim acknowledgment retry is idempotent and exhausted attempts fail closed',async()=>{
   const h=await setup();let last;
   for(let i=1;i<=3;i++) {
    const attempt=attemptFor({jobId:h.job.jobId});
    const first=await attempt.control.claim(attempt.handle,at());assert.equal(first.attempt.fencingToken,i);
    assert.deepEqual(await attempt.control.claim(attempt.handle,at()),first);
    await attempt.control.release(attempt.handle);last=first;
   }
   assert.equal(last.attempt.attemptNumber,3);
   await assert.rejects(h.port.control.claim(h.port.handle,at()),/attempt-budget-or-delay/);
  });
  await t.test('protected revocation after staging blocks acceptance and worker cannot re-enable',async()=>{
   const h=await staged(),{digest:ignored,...body}=h.context.activation;void ignored;
   const activation=createActivation({...body,revision:2,state:'REVOKED',stoppedAt:at()});
   await updateLocalActivation(owner,h.context.manifest.digest,activation,{...h.context.trustedState,activationDigest:activation.digest,activationRevision:2});
   await assert.rejects(h.port.results.accept(h.record,async()=>true,at()),/inactive-or-expired/);
   await assert.rejects(query('UPDATE cp02.registry SET enabled=true WHERE manifest_id=$1',[h.context.manifest.digest]),error=>error.code==='42501');
  });
  await t.test('lease expiry while waiting for authority lock is checked using live database time',async()=>{
   const h=await staged({leaseMs:500});const blocker=new pg.Client(config(admin));await blocker.connect();
   try {await blocker.query('BEGIN');await blocker.query('SELECT 1 FROM cp02.registry WHERE manifest_id=$1 FOR UPDATE',[h.context.manifest.digest]);
    const pending=h.port.results.accept(h.record,async()=>true,at());const observed=assert.rejects(pending,/attempt-not-owned/);
    await blocker.query('SELECT pg_sleep(0.6)');await blocker.query('COMMIT');await observed;
   } finally {await blocker.end();}
  });
  await t.test('job deadline during an acceptance lock wait fails closed even with an earlier valid check',async()=>{
   const h=await staged({expiresMs:2000});await h.port.control.check(h.port.handle,at());
   const blocker=new pg.Client(config(admin));await blocker.connect();
   try {await blocker.query('BEGIN');await blocker.query('SELECT 1 FROM cp02.registry WHERE manifest_id=$1 FOR UPDATE',[h.context.manifest.digest]);
    const observed=assert.rejects(h.port.results.accept(h.record,async()=>true,at()),/inactive-or-expired/);
    await blocker.query('SELECT pg_sleep(2.1)');await blocker.query('COMMIT');await observed;
   } finally {await blocker.end();}
  });
  await t.test('acceptance transaction rolls back cancellation after insert but before commit',async()=>{
   const h=await setup(),c=new AbortController();let reached=false;
   const attempt=attemptFor({jobId:h.job.jobId,transaction:operation=>transaction(txQuery=>operation(async(sql,args)=>{
    const value=await txQuery(sql,args);if(args[0]==='accept'){reached=true;c.abort();}return value;
   }))});
   Object.assign(h.composition,{control:attempt.control,responses:attempt.responses,results:attempt.results});
   const result=await createCurrentObservationWorker(h.composition).run(attempt.handle,c.signal);
   assert(reached);assert.equal(result.status,'STOPPED');assert.equal(result.accepted,false);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp02.accepted WHERE job_id=$1',[h.job.jobId])).rows[0].n,0);
  });
  await t.test('atomic valid acceptance consumes claim even if former lease expires before commit',async()=>{
   const h=await staged({leaseMs:2000}),connection=await pool.connect();
   try {await connection.query('BEGIN');await connection.query('SELECT cp02.worker($1,$2,$3,$4,NULL)',
    ['accept',h.job.jobId,h.capability,JSON.stringify({recordText:JSON.stringify(h.record),retainedAt:at()})]);
    await connection.query('SELECT pg_sleep(2.1)');await connection.query('COMMIT');
   } finally {await connection.query('ROLLBACK');connection.release();}
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp02.accepted WHERE job_id=$1',[h.job.jobId])).rows[0].n,1);
   assert((await owner.query('SELECT consumed_at IS NOT NULL AND released AS consumed FROM cp02.ownership WHERE job_id=$1',[h.job.jobId])).rows[0].consumed);
   const later=attemptFor({jobId:h.job.jobId});await assert.rejects(later.control.claim(later.handle,at()),/job-already-accepted/);
  });
  await t.test('uncertain staged write acknowledgment reconciles exact immutable readback',async()=>{
   const h=await setup();let lost=false;
   const attempt=attemptFor({jobId:h.job.jobId,query:async(sql,args)=>{
    const value=await query(sql,args);if(args[0]==='write'&&!lost){lost=true;throw Error('synthetic-lost-write-reply');}return value;}});
   Object.assign(h.composition,{control:attempt.control,responses:attempt.responses,results:attempt.results});
   const result=await createCurrentObservationWorker(h.composition).run(attempt.handle);assert.equal(result.accepted,true,JSON.stringify(result));assert.equal(result.reconciled,true);
  });
  await t.test('lost acceptance reply reconciles committed decision without another insert',async()=>{
   const h=await setup();let lost=false;
   const attempt=attemptFor({jobId:h.job.jobId,transaction:async operation=>{
    const value=await transaction(operation);if(!lost){lost=true;throw Error('synthetic-lost-commit-reply');}return value;}});
   Object.assign(h.composition,{control:attempt.control,responses:attempt.responses,results:attempt.results});
   const result=await createCurrentObservationWorker(h.composition).run(attempt.handle);assert.equal(result.accepted,true,JSON.stringify(result));
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp02.accepted WHERE job_id=$1',[h.job.jobId])).rows[0].n,1);
  });
  await t.test('unavailable reconciliation leaves acceptance explicitly indeterminate',async()=>{
   const h=await setup();
   const attempt=attemptFor({jobId:h.job.jobId,query:async(sql,args)=>{
    if(args[0]==='accepted')throw Error('synthetic-disconnection');return query(sql,args);},
    transaction:async operation=>{await transaction(operation);throw Error('synthetic-lost-commit-reply');}});
   Object.assign(h.composition,{control:attempt.control,responses:attempt.responses,results:attempt.results});
   const result=await createCurrentObservationWorker(h.composition).run(attempt.handle);assert.equal(result.status,'INDETERMINATE');assert.equal(result.accepted,null);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp02.accepted WHERE job_id=$1',[h.job.jobId])).rows[0].n,1);
  });
  await t.test('actual process death after staging leaves recoverable claims and immutable records',async()=>{
   const h=await setup({leaseMs:1000});
   const child=spawnSync(process.execPath,[new URL('./fixtures/postgresCrashChild.mjs',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),h.job.jobId,'before-accept'],{encoding:'utf8',timeout:10000,windowsHide:true});
   assert.equal(child.status,71,child.stderr);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp02.results r JOIN cp02.attempts a USING(token) WHERE a.job_id=$1',[h.job.jobId])).rows[0].n,1);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp02.accepted WHERE job_id=$1',[h.job.jobId])).rows[0].n,0);
   await owner.query('SELECT pg_sleep(1.1)');
   const result=await createCurrentObservationWorker(h.composition).run(h.port.handle);assert.equal(result.accepted,true,JSON.stringify(result));assert.equal(result.record.execution.fencingToken,2);
  });
  await t.test('actual process death after commit retains exactly one accepted result',async()=>{
   const h=await setup();const child=spawnSync(process.execPath,[new URL('./fixtures/postgresCrashChild.mjs',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),h.job.jobId,'after-accept'],{encoding:'utf8',timeout:10000,windowsHide:true});
   assert.equal(child.status,72,child.stderr);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp02.accepted WHERE job_id=$1',[h.job.jobId])).rows[0].n,1);
   await assert.rejects(h.port.control.claim(h.port.handle,at()),/job-already-accepted/);
  });
 } finally {await pool.end();await owner.end();}
});
