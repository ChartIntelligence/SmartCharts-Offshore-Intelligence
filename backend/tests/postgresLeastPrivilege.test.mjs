import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {fixture,time} from './fixtures/continuousObserveFixture.mjs';
import {createJob} from '../observe/jobs.mjs';
import {createCurrentObservationWorker} from '../observe/currentObservationWorker.mjs';
import {createPostgresAttempt,postgresTransaction,registerLocalJob} from '../durableObserve/postgresPorts.mjs';
import {createPostgresRecovery,postgresRecoveryLock} from '../durableObserve/recovery.mjs';
import {createPostgresObservationStorage} from '../durableObserve/observationStorage.mjs';
import {verifyWorkerPrivileges} from '../durableObserve/privilegeManifest.mjs';

test('CP-05 atomic terminal acceptance and least privilege',{skip:process.env.PELORA_CP05_LOCAL!=='1'},async t=>{
 const root=path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification');
 const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8')),admin=read('credentials.json'),worker=read('worker-credentials.json');
 for(const c of [admin,worker])assert(c.host==='127.0.0.1'&&Number(c.port)===55432&&c.cluster==='pelora_phase3_qualification');
 assert.equal(worker.database,'pelora_phase3_qualification');assert.equal(worker.username,'pelora_cp02_worker');
 const config=c=>({host:c.host,port:c.port,user:c.username,password:c.password,database:worker.database,connectionTimeoutMillis:3000,query_timeout:10000});
 const owner=new pg.Client(config(admin)),pool=new pg.Pool({...config(worker),max:6});pool.on('error',()=>{});await owner.connect();
 const query=(...args)=>pool.query(...args),transaction=postgresTransaction(pool),at=()=>new Date().toISOString();
 const manifest=JSON.parse(fs.readFileSync(new URL('../durableObserve/workerPrivilegeManifest.v1.json',import.meta.url),'utf8'));
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
 try{
  await t.test('exact intended privilege manifest passes',async()=>{assert.equal((await verifyWorkerPrivileges((...args)=>owner.query(...args),manifest)).status,'PASS');});
  for(const timing of ['ALL IMMEDIATE','ALL DEFERRED','cp02.accepted_job_id_fkey IMMEDIATE']){
   await t.test('valid terminal consumption remains correct with SET CONSTRAINTS '+timing+' and late COMMIT',async()=>{
    const h=await staged({leaseMs:2000}),client=await pool.connect();
    try{await client.query('BEGIN');await client.query('SET CONSTRAINTS '+timing);await accept(client,h);
     assert.equal((await client.query('SELECT cp04.inspect($1,$2) AS value',[h.job.jobId,h.capability])).rows[0].value.status,'ACCEPTED');
     await client.query('SELECT pg_sleep(2.1)');await client.query('COMMIT');
    }finally{await client.query('ROLLBACK');client.release();}
    const state=await terminal(h);assert(state.valid_transition);assert(state.released);assert(state.lease_until<Date.now());
    assert.equal((await storage.readAccepted(h.job.jobId)).record.captureText,h.record.captureText);
    const next=portFor(h,randomUUID());await assert.rejects(next.control.claim(next.handle,at()),/job-already-accepted/);
    const first=await h.port.results.reconcile();await h.port.results.accept(h.record,async()=>{},at());assert.deepEqual(await h.port.results.reconcile(),first);
    assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp03.observations WHERE job_id=$1',[h.job.jobId])).rows[0].n,1);
   });
  }
  await t.test('constraint manipulation cannot admit an already expired claim at transition',async()=>{
   const h=await staged({leaseMs:2000}),client=await pool.connect();
   try{await client.query('BEGIN');await client.query('SET CONSTRAINTS ALL IMMEDIATE');await client.query('SELECT cp02.worker($1,$2,$3,NULL,NULL)',['check',h.job.jobId,h.capability]);
    await client.query('SELECT pg_sleep(2.1)');await assert.rejects(accept(client,h),/attempt-not-owned/);
   }finally{await client.query('ROLLBACK');client.release();}
   assert.equal((await terminal(h)).consumed_at,null);assert.equal(await storage.readAccepted(h.job.jobId),null);
  });
  for(const outcome of ['COMMIT','ROLLBACK']){
   await t.test('competing reclaimer waits for terminal acceptance '+outcome+' past former lease expiry',async()=>{
    const h=await staged({leaseMs:2000}),a=await pool.connect(),b=await pool.connect(),newCap=randomUUID();let pending;
    try{
     const aid=(await a.query('SELECT pg_backend_pid() AS pid')).rows[0].pid,bid=(await b.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
     await a.query('BEGIN');await a.query('SET CONSTRAINTS ALL IMMEDIATE');await accept(a,h);await a.query('SELECT pg_sleep(2.1)');
     pending=b.query('SELECT cp02.worker($1,$2,$3,NULL,NULL) AS value',['claim',h.job.jobId,newCap]).then(v=>({value:v.rows[0].value}),error=>({error}));
     let blocked=false;for(let i=0;i<30;i++){blocked=(await owner.query('SELECT $1=ANY(pg_blocking_pids($2)) AS blocked',[aid,bid])).rows[0].blocked;if(blocked)break;await new Promise(r=>setTimeout(r,20));}
     assert(blocked,'reclaimer must block, not acquire another claim');assert.equal(await storage.readAccepted(h.job.jobId),null);
     await a.query(outcome);const result=await pending;
     if(outcome==='COMMIT'){assert.match(result.error.message,/job-already-accepted/);assert((await terminal(h)).valid_transition);assert(await storage.readAccepted(h.job.jobId));}
     else{
      assert.equal(result.value.attempt.fencingToken,2);assert.equal((await terminal(h)).consumed_at,null);assert.equal(await storage.readAccepted(h.job.jobId),null);
      await assert.rejects(accept(b,h),/attempt-not-owned/);
      const c=composition(h);const recovery=createPostgresRecovery({query,transaction,withLock:postgresRecoveryLock(pool),jobId:h.job.jobId,capability:newCap,policy:c.policy,transport:async()=>{throw Error('must-reuse-authoritative-raw');},clock:c.clock,timers:c.timers});
      const recovered=await recovery.run(recovery.handle);assert.equal(recovered.accepted,true,JSON.stringify(recovered));assert.equal(recovered.record.captureText,h.record.captureText);assert((await terminal(h)).valid_transition);
     }
    }finally{await a.query('ROLLBACK');a.release();b.release();}
   });
  }
  await t.test('removed deferred trigger cannot be restored or named by worker; remaining keys stay nondeferrable',async()=>{
   assert((await owner.query("SELECT to_regprocedure('cp02.fenced_commit()') IS NULL AS removed")).rows[0].removed);
   const c=await pool.connect();try{await assert.rejects(c.query('SET CONSTRAINTS cp02.fenced_acceptance IMMEDIATE'),/does not exist/);
    await assert.rejects(c.query('SET CONSTRAINTS cp02.accepted_job_id_fkey DEFERRED'),/not deferrable/);
   }finally{c.release();}
  });
  await t.test('consumption and index roll back together on application cancellation',async()=>{
   const h=await staged();let checks=0;
   await assert.rejects(h.port.results.accept(h.record,async()=>{await h.port.control.check(h.port.handle,at());if(++checks===2)throw Error('cancel-terminal-transition');},at()),/cancel-terminal-transition/);
   assert.equal((await terminal(h)).consumed_at,null);assert.equal(await storage.readAccepted(h.job.jobId),null);
   await h.port.results.accept(h.record,()=>h.port.control.check(h.port.handle,at()),at());assert((await terminal(h)).valid_transition);
  });
  await t.test('legacy entrypoint cannot bypass checkpoint/replay rules for a recovery-bound job',async()=>{
   const h=await setup(),c=composition(h);let record;
   const q=async(sql,args)=>{if(sql.includes('worker')&&args[0]==='accept'){record=JSON.parse(args[3]).recordText;throw Error('cp05-stop-recovery-before-accept');}if(sql.includes('worker')&&args[0]==='release')return {rows:[{value:{}}]};return query(sql,args);};
   const recovery=createPostgresRecovery({query:q,transaction:op=>transaction(tx=>op(async(sql,args)=>{if(args[0]==='accept'){record=JSON.parse(args[3]).recordText;throw Error('cp05-stop-recovery-before-accept');}return tx(sql,args);})),withLock:postgresRecoveryLock(pool),jobId:h.job.jobId,capability:h.capability,policy:c.policy,transport:c.transport,clock:c.clock,timers:c.timers});
   const pending=await recovery.run(recovery.handle);assert.notEqual(pending.accepted,true);assert(record);
   await query('SELECT cp02.worker($1,$2,$3,NULL,NULL)',['release',h.job.jobId,h.capability]);
   const next=portFor(h,randomUUID());const state=await next.control.claim(next.handle,at());
   const replacement=JSON.parse(record);replacement.execution.attemptId=state.attempt.attemptId;replacement.execution.fencingToken=2;replacement.execution.attemptNumber=2;
   // Even a direct lower-level call is stopped at the database boundary before INSERT.
   await assert.rejects(query('SELECT cp02.worker($1,$2,$3,$4,NULL)',['write',h.job.jobId,(await owner.query('SELECT token FROM cp02.attempts WHERE attempt_id=$1',[state.attempt.attemptId])).rows[0].token,JSON.stringify(replacement)]),/recovery-checkpoint-mismatch/);
   assert.equal(await storage.readAccepted(h.job.jobId),null);
  });
  await t.test('all protected tables deny direct reads, inserts, updates, deletes, truncation and trigger changes',async()=>{
   const columns={'cp02.accepted':'job_id','cp02.attempts':'token','cp02.jobs':'job_id','cp02.ownership':'fence','cp02.raw':'hash','cp02.registry':'manifest_id','cp02.results':'token','cp03.bindings':'token','cp03.evidence':'evidence_id','cp03.observations':'job_id','cp04.raw_checkpoints':'token','cp04.replays':'token'};
   for(const table of manifest.protectedTables)for(const sql of [`SELECT * FROM ${table}`,`INSERT INTO ${table} DEFAULT VALUES`,`UPDATE ${table} SET ${columns[table]}=${columns[table]}`,`DELETE FROM ${table}`,`TRUNCATE ${table}`,`ALTER TABLE ${table} DISABLE TRIGGER ALL`,`ALTER TABLE ${table} OWNER TO pelora_cp02_worker`])await assert.rejects(query(sql),e=>e.code==='42501',sql);
  });
  await t.test('routine replacement, escalation, schema/temp shadowing, constraint removal and unrelated data access denied',async()=>{
   for(const sql of ["CREATE SCHEMA cp05_forbidden","CREATE TABLE public.cp05_forbidden(x int)","CREATE TEMP TABLE ownership(x int)","CREATE FUNCTION public.clock_timestamp() RETURNS timestamptz LANGUAGE sql AS $$ SELECT now() $$", "CREATE OR REPLACE FUNCTION cp02.accept_terminal(jid text,cap uuid,payload text) RETURNS jsonb LANGUAGE sql AS $$ SELECT '{}'::jsonb $$",
    'ALTER FUNCTION cp02.accept_terminal(text,uuid,text) OWNER TO pelora_cp02_worker','DROP FUNCTION cp02.accept_terminal(text,uuid,text)','ALTER TABLE cp02.accepted DROP CONSTRAINT accepted_pkey','SET ROLE pelora_cp02_owner','SET ROLE pelora_admin','SET SESSION AUTHORIZATION pelora_admin','ALTER ROLE pelora_cp02_worker SUPERUSER','GRANT pelora_cp02_owner TO pelora_cp02_worker',"SET session_replication_role='replica'",'SELECT * FROM pg_authid','SELECT * FROM pg_largeobject',"SELECT pg_read_file('postgresql.conf')",'SELECT lo_create(0)'])await assert.rejects(query(sql),e=>e.code==='42501',sql);
   for(const schema of manifest.protectedSchemas)await assert.rejects(query(`CREATE TABLE ${schema}.cp05_forbidden(x int)`),e=>e.code==='42501');
   await assert.rejects(query("SELECT cp02.accept_terminal('forbidden',NULL,NULL)"),e=>e.code==='42501');
   await assert.rejects(query("SELECT cp04.validate_acceptance('forbidden',NULL,NULL)"),e=>e.code==='42501');
  });
  await t.test('GRANT and REVOKE cannot change worker privileges',async()=>{
   for(const sql of ['GRANT ALL ON cp02.accepted TO pelora_cp02_worker','REVOKE EXECUTE ON FUNCTION cp02.worker(text,text,uuid,text,bytea) FROM pelora_cp02_worker','GRANT EXECUTE ON FUNCTION cp02.accept_terminal(text,uuid,text) TO pelora_cp02_worker']){
    try{await query(sql);}catch(e){assert.equal(e.code,'42501');}
   }
   assert.equal((await verifyWorkerPrivileges((...args)=>owner.query(...args),manifest)).status,'PASS');
  });
  await t.test('future objects created by owner or admin default-deny worker and PUBLIC',async()=>{
   for(const role of manifest.creationRoles)for(const schema of [...manifest.protectedSchemas,'public']){
    await owner.query(`BEGIN;SET LOCAL ROLE ${role};CREATE FUNCTION ${schema}.cp05_future() RETURNS integer LANGUAGE sql AS $$ SELECT 1 $$;CREATE TABLE ${schema}.cp05_future(x int);CREATE SEQUENCE ${schema}.cp05_future_seq;COMMIT`);
    try{for(const sql of [`SELECT ${schema}.cp05_future()`,`SELECT * FROM ${schema}.cp05_future`,`SELECT nextval('${schema}.cp05_future_seq')`])await assert.rejects(query(sql),e=>e.code==='42501');
     assert(!(await owner.query('SELECT has_function_privilege($1,$2,\'EXECUTE\') AS allowed',[worker.username,`${schema}.cp05_future()`])).rows[0].allowed);
    }finally{await owner.query(`DROP FUNCTION ${schema}.cp05_future();DROP TABLE ${schema}.cp05_future;DROP SEQUENCE ${schema}.cp05_future_seq`);}
   }
  });
  await t.test('hostile search_path, timezone, prepared transactions, and reconnect preserve legitimate runtime',async()=>{
   const h=await staged(),client=await pool.connect();
   try{await client.query('SET search_path=pg_temp,public,cp04,cp03,cp02');await client.query("SET TIME ZONE 'Pacific/Auckland'");
    await client.query('PREPARE cp05_request(text,text,uuid,text,bytea) AS SELECT cp02.worker($1,$2,$3,$4,$5)');
    await client.query({name:'cp05-fenced-accept',text:'SELECT cp02.worker($1,$2,$3,$4,NULL)',values:['accept',h.job.jobId,h.capability,JSON.stringify({recordText:JSON.stringify(h.record),retainedAt:at()})]});
    await client.query('DEALLOCATE cp05_request');await client.query('RESET search_path');await client.query('RESET TIME ZONE');
   }finally{client.release();}
   const reconnect=new pg.Client(config(worker));await reconnect.connect();try{assert.equal((await reconnect.query('SELECT cp04.inspect($1,$2) AS value',[h.job.jobId,randomUUID()])).rows[0].value.status,'ACCEPTED');}finally{await reconnect.end();}
   assert((await terminal(h)).valid_transition);assert(await storage.readAccepted(h.job.jobId));
  });
  await t.test('privilege drift is detected, not silently approved',async()=>{
   await owner.query('BEGIN');try{await owner.query('GRANT SELECT ON cp02.accepted TO pelora_cp02_worker');await assert.rejects(verifyWorkerPrivileges((...args)=>owner.query(...args),manifest),/privilege-table-drift/);}finally{await owner.query('ROLLBACK');}
   assert.equal((await verifyWorkerPrivileges((...args)=>owner.query(...args),manifest)).status,'PASS');
  });
  await t.test('terminal state is immutable even for ordinary owner mutation',async()=>{
   const h=await setup(),result=await createCurrentObservationWorker(composition(h)).run(h.port.handle);assert(result.accepted);
   await assert.rejects(owner.query('UPDATE cp02.ownership SET released=false WHERE job_id=$1',[h.job.jobId]),/immutable-terminal-claim/);
   await assert.rejects(owner.query('DELETE FROM cp02.ownership WHERE job_id=$1',[h.job.jobId]),/immutable-terminal-claim/);
  });
 }finally{await pool.end();await owner.end();}
});
