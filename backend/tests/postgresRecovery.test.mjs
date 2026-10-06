import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import pg from 'pg';
import {fixture,time} from './fixtures/continuousObserveFixture.mjs';
import {createJob} from '../observe/jobs.mjs';
import {createActivation} from '../observe/activation.mjs';
import {createCurrentObservationWorker} from '../observe/currentObservationWorker.mjs';
import {createPostgresAttempt,postgresTransaction,registerLocalJob,updateLocalActivation} from '../durableObserve/postgresPorts.mjs';
import {createPostgresObservationStorage} from '../durableObserve/observationStorage.mjs';
import {createPostgresRecovery,postgresRecoveryLock} from '../durableObserve/recovery.mjs';

test('CP-04 real PostgreSQL restart and uncertain-write recovery',{skip:process.env.PELORA_CP04_LOCAL!=='1'},async t=>{
 const root=path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification');
 const admin=JSON.parse(fs.readFileSync(path.join(root,'credentials.json'),'utf8')),worker=JSON.parse(fs.readFileSync(path.join(root,'worker-credentials.json'),'utf8'));
 for(const c of [admin,worker])assert(c.host==='127.0.0.1'&&Number(c.port)===55432&&c.cluster==='pelora_phase3_qualification');
 assert.equal(worker.database,'pelora_phase3_qualification');assert.equal(worker.username,'pelora_cp02_worker');
 const config=c=>({host:c.host,port:c.port,user:c.username,password:c.password,database:worker.database,connectionTimeoutMillis:3000,query_timeout:10000});
 let owner,pool;
 const connect=async()=>{owner=new pg.Client(config(admin));await owner.connect();pool=new pg.Pool({...config(worker),max:6});pool.on('error',()=>{});};await connect();
 const at=()=>new Date().toISOString(),query=(...args)=>pool.query(...args),transaction=op=>postgresTransaction(pool)(op);
 const childFile=fileURLToPath(new URL('./fixtures/postgresRecoveryCrashChild.mjs',import.meta.url));
 const storage=()=>createPostgresObservationStorage({query});
 async function setup({leaseMs=120000}={}){
  const anchor=Math.floor(Date.now()/3600000)*3600000,delta=anchor-Date.parse(time());
  const shift=v=>typeof v==='string'&&/^2026-10-0[12]T/.test(v)?new Date(Date.parse(v)+delta).toISOString():Array.isArray(v)?v.map(shift):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,shift(x)])):v;
  const context=fixture('synthetic-'+randomUUID(),m=>Object.assign(m,shift({...m,effectiveUntil:time(24)}))),job=createJob(context.manifest,'cell-a',context.manifest.schedule.anchor);
  await registerLocalJob(owner,context,job,{leaseMs});
  // Unique finite source values avoid shared evidence in in-transaction fault probes.
  const u=0.5+parseInt(job.jobId.slice(-12),16)/1e15;
  const bytes=Buffer.from(' \n'+JSON.stringify({table:{columnNames:['time','latitude','longitude','u_current','v_current'],rows:[[job.window.start,job.cell.coordinates.latitude,job.cell.coordinates.longitude,u,0.25]]}})+'\n');
  return {context,job,bytes,capability:randomUUID(),calls:0};
 }
 const recoveryFor=(h,options={})=>createPostgresRecovery({jobId:h.job.jobId,capability:h.capability,query,transaction,withLock:postgresRecoveryLock(pool),
  clock:{now:at},timers:{arm(){return 1;},clear(){}},
  policy:{async select(reference){return {policyReference:reference,selectedProviderTime:h.job.window.start};}},
  transport:async()=>{h.calls++;return {bytes:h.bytes,status:200,provider:h.context.manifest.product.provider,dataset:h.context.manifest.product.dataset};},...options});
 const run=async(h,options)=>{const r=recoveryFor(h,options);return r.run(r.handle);};
 const inspect=async h=>(await query('SELECT cp04.inspect($1,$2) AS value',[h.job.jobId,h.capability])).rows[0].value;
 const count=async(table,jid)=>Number((await owner.query(`SELECT count(*)::int AS n FROM ${table} WHERE job_id=$1`,[jid])).rows[0].n);
 async function crash(h,mode,code){
  const child=spawnSync(process.execPath,[childFile,h.job.jobId,mode],{encoding:'utf8',timeout:15000,windowsHide:true});
  assert.equal(child.status,code,child.stderr||child.error?.message);return h;
 }
 const originalCap=async h=>(await owner.query('SELECT token FROM cp02.attempts WHERE job_id=$1 ORDER BY fence DESC LIMIT 1',[h.job.jobId])).rows[0].token;
 async function stageLegacy(h){
   const ports=createPostgresAttempt({query,transaction,jobId:h.job.jobId,capability:h.capability});
   const result=await createCurrentObservationWorker({control:{...ports.control,release:async()=>{}},responses:ports.responses,
    results:{...ports.results,async accept(){throw Error('legacy-before-accept');}},clock:{now:at},timers:{arm(){return 1;},clear(){}},
    policy:{async select(reference){return {policyReference:reference,selectedProviderTime:h.job.window.start};}},
    transport:async()=>({bytes:h.bytes,status:200,provider:h.context.manifest.product.provider,dataset:h.context.manifest.product.dataset})}).run(ports.handle);
   assert.equal(result.accepted,false);
 }
 const assertAccepted=async(h,result)=>{
  assert.equal(result.status,'ACCEPTED_HISTORICAL',JSON.stringify(result));assert.equal(result.accepted,true);
  assert.equal(await count('cp02.accepted',h.job.jobId),1);assert.equal(await count('cp03.observations',h.job.jobId),1);
  assert(await storage().readAccepted(h.job.jobId));
 };
 try{
  await t.test('fresh run creates one chain and already-accepted retry never acquires or accepts again',async()=>{
   const h=await setup();await assertAccepted(h,await run(h));assert.equal(h.calls,1);
   let writes=0;const q=async(sql,args)=>{if(sql.includes('worker')&&['write','accept','raw-write'].includes(args[0]))writes++;return query(sql,args);};
   const retry=await run({...h,capability:randomUUID()},{query:q,transport:async()=>{throw Error('must-not-acquire');}});
   await assertAccepted(h,retry);assert.equal(writes,0);
  });
  await t.test('process interruption before raw retention safely retries without accepted artifacts',async()=>{
   const h=await setup({leaseMs:2000});await crash(h,'before-raw',81);assert.equal((await inspect(h)).candidate,null);
   assert.equal(await storage().readAccepted(h.job.jobId),null);await owner.query('SELECT pg_sleep(2.1)');await assertAccepted(h,await run(h));assert.equal(h.calls,1);
  });
  await t.test('process interruption after raw retention reuses exact bytes without transport',async()=>{
   const h=await setup({leaseMs:2000});await crash(h,'after-raw',83);
   const before=await inspect(h);assert(before.candidate);assert.equal(before.candidate.stage,null);assert.equal(await storage().readAccepted(h.job.jobId),null);
   await owner.query('SELECT pg_sleep(2.1)');const result=await run(h,{transport:async()=>{throw Error('must-reuse-raw');}});await assertAccepted(h,result);
   assert.equal(result.rawBytes.toString('hex'),before.candidate.rawHex);assert.equal(h.calls,0);
  });
  await t.test('live same-attempt raw-only retry uses checkpoint and keeps original fence',async()=>{
   const h=await setup();await crash(h,'after-raw',83);h.capability=await originalCap(h);
   const result=await run(h,{transport:async()=>{throw Error('must-reuse-raw');}});await assertAccepted(h,result);assert.equal(result.record.execution.fencingToken,1);
  });
  for(const [mode,table] of [['inside-evidence','cp03.evidence'],['inside-binding','cp03.bindings']]){
   await t.test(`actual process death after ${mode} write rolls back partial staging, then recovers`,async()=>{
    const h=await setup({leaseMs:2000});
    await owner.query("CREATE FUNCTION cp04.crash_pause() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN PERFORM pg_sleep(2); RETURN NEW; END $$");
    await owner.query(`CREATE TRIGGER cp04_crash_pause AFTER INSERT ON ${table} FOR EACH ROW EXECUTE FUNCTION cp04.crash_pause()`);
    const child=spawn(process.execPath,[childFile,h.job.jobId,mode],{stdio:'ignore',windowsHide:true});
    const exited=new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',(code,signal)=>resolve({code,signal}));});
    try{
     let reached=false;
     for(let i=0;i<100;i++){
      reached=(await owner.query("SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE application_name=$1 AND wait_event='PgSleep') AS reached",['pelora-cp04-'+mode])).rows[0].reached;
      if(reached)break;await new Promise(r=>setTimeout(r,30));
     }
     assert(reached,'transaction fault point not reached');assert(child.kill('SIGKILL'));await exited;
     await owner.query('SELECT pg_sleep(2.1)');
     assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp02.results s JOIN cp02.attempts a USING(token) WHERE a.job_id=$1',[h.job.jobId])).rows[0].n,0);
     assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp03.bindings d JOIN cp02.attempts a USING(token) WHERE a.job_id=$1',[h.job.jobId])).rows[0].n,0);
     assert.equal(await storage().readAccepted(h.job.jobId),null);
    }finally{child.kill('SIGKILL');await owner.query(`DROP TRIGGER cp04_crash_pause ON ${table}; DROP FUNCTION cp04.crash_pause();`);}
    await assertAccepted(h,await run(h,{transport:async()=>{throw Error('must-reuse-raw');}}));
   });
  }
  await t.test('crash after complete stage: same live claimant accepts exact original record without normalization',async()=>{
   const h=await setup();await crash(h,'after-stage',84);h.capability=await originalCap(h);const before=await inspect(h);
   const result=await run(h,{policy:{select:async()=>{throw Error('must-not-select');}},transport:async()=>{throw Error('must-not-acquire');}});
   await assertAccepted(h,result);assert.equal(JSON.stringify(result.record),before.candidate.stage.recordText);assert.equal(result.record.execution.fencingToken,1);
  });
  await t.test('crash after complete stage: reclaim reuses exact capture and records distinct replay binding',async()=>{
   const h=await setup({leaseMs:2000});await crash(h,'after-stage',84);const before=await inspect(h);const old=await originalCap(h);
   await owner.query('SELECT pg_sleep(2.1)');
   await query('SELECT cp04.worker($1,$2,$3,NULL,NULL)',['claim',h.job.jobId,h.capability]);
   await assert.rejects(query('SELECT cp04.worker($1,$2,$3,$4,$5)',['raw-write',h.job.jobId,h.capability,JSON.stringify({origin:before.candidate.origin,replaySourceAttemptId:null}),Buffer.from(before.candidate.rawHex,'hex')]),/recovery-replay-source-required/);
   const result=await run(h,{transport:async()=>{throw Error('must-reuse-stage-raw');}});await assertAccepted(h,result);
   assert.equal(result.record.captureText,before.candidate.stage.captureText);assert.notEqual(result.record.execution.attemptId,before.candidate.stage.executionId);
   const replay=(await owner.query('SELECT source_attempt_id,raw_hash FROM cp04.replays WHERE token=$1',[h.capability])).rows[0];assert.equal(replay.source_attempt_id,before.candidate.sourceAttemptId);
   const stale=await run({...h,capability:old});await assertAccepted(h,stale); // archival accepted retry is read-only, never stale acceptance.
   await assert.rejects(query('SELECT cp04.worker($1,$2,$3,$4,NULL)',['accept',h.job.jobId,old,JSON.stringify({recordText:before.candidate.stage.recordText,retainedAt:at()})]),/job-already-accepted/);
  });
  await t.test('crash after acceptance insert but before COMMIT leaves no decision/index and recovers',async()=>{
   const h=await setup({leaseMs:2000});await crash(h,'after-accept-insert',85);assert.equal(await storage().readAccepted(h.job.jobId),null);
   await owner.query('SELECT pg_sleep(2.1)');await assertAccepted(h,await run(h,{transport:async()=>{throw Error('must-reuse-stage');}}));
  });
  await t.test('process death after COMMIT resolves existing authoritative chain without replay',async()=>{
   const h=await setup();await crash(h,'after-commit',86);await assertAccepted(h,await run(h,{transport:async()=>{throw Error('must-not-acquire');}}));assert.equal(h.calls,0);
  });
  await t.test('lost raw ACK returns recoverable state and retry reuses committed raw checkpoint',async()=>{
   const h=await setup();let lost=false;const q=async(sql,args)=>{const value=await query(sql,args);if(sql.includes('cp04.worker')&&args[0]==='raw-write'&&!lost){lost=true;throw Error('synthetic-lost-raw-ack');}return value;};
   const uncertain=await run(h,{query:q});assert.equal(uncertain.status,'RECOVERABLE');assert.equal(await storage().readAccepted(h.job.jobId),null);
   h.capability=randomUUID();await assertAccepted(h,await run(h,{transport:async()=>{throw Error('must-reuse-lost-ack-raw');}}));assert.equal(h.calls,1);
  });
  await t.test('lost staged-write ACK validates readback and accepts original immutable stage',async()=>{
   const h=await setup();let lost=false;const q=async(sql,args)=>{const value=await query(sql,args);if(sql.includes('cp04.worker')&&args[0]==='write'&&!lost){lost=true;throw Error('synthetic-lost-stage-ack');}return value;};
   await assertAccepted(h,await run(h,{query:q}));assert(lost);
  });
  await t.test('lost COMMIT ACK reconciles the committed chain, with no second accept',async()=>{
   const h=await setup();let accepts=0;
   const tx=async op=>{const value=await transaction(q=>op(async(sql,args)=>{if(sql.includes('cp04.worker')&&args[0]==='accept')accepts++;return q(sql,args);}));throw Error('synthetic-lost-commit-ack');};
   await assertAccepted(h,await run(h,{transaction:tx}));assert.equal(accepts,1);
  });
  await t.test('commit outcome unknown with actual rollback stays indeterminate; next retry rechecks and safely reclaims',async()=>{
   const h=await setup();const tx=async op=>{const c=await pool.connect();try{await c.query('BEGIN');await op((...args)=>c.query(...args));await c.query('ROLLBACK');throw Error('synthetic-unknown-commit-rolled-back');}finally{c.release();}};
   const first=await run(h,{transaction:tx});assert.equal(first.status,'INDETERMINATE');assert.equal(first.accepted,null);assert.equal(await storage().readAccepted(h.job.jobId),null);
   const before=await inspect(h);h.capability=randomUUID();const result=await run(h,{transport:async()=>{throw Error('must-reuse');}});await assertAccepted(h,result);assert.equal(result.record.captureText,before.candidate.stage.captureText);
  });
  await t.test('unavailable authoritative reconciliation never fabricates an outcome or blindly accepts',async()=>{
   const h=await setup();let committed=false,accepts=0;
   const tx=async op=>{await transaction(q=>op(async(sql,args)=>{if(sql.includes('worker')&&args[0]==='accept')accepts++;return q(sql,args);}));committed=true;throw Error('synthetic-lost-commit');};
   const q=async(sql,args)=>{if(committed&&(sql.includes('inspect')||args[0]==='accepted'))throw Error('synthetic-database-unreachable');return query(sql,args);};
   const first=await run(h,{query:q,transaction:tx});assert.equal(first.status,'INDETERMINATE');assert.equal(first.accepted,null);assert.equal(accepts,1);
   await assertAccepted(h,await run({...h,capability:randomUUID()},{transport:async()=>{throw Error('must-not-acquire');}}));
  });
  await t.test('duplicate concurrent recovery attempts serialize, then retry resolves existing chain',async()=>{
   const h=await setup();let enter,release;const entered=new Promise(r=>enter=r),gate=new Promise(r=>release=r);
   const first=run(h,{transport:async()=>{enter();await gate;return {bytes:h.bytes,status:200,provider:h.context.manifest.product.provider,dataset:h.context.manifest.product.dataset};}});
   await entered;const second=await run({...h,capability:randomUUID()});assert.equal(second.status,'BUSY');assert.equal(second.accepted,null);release();await assertAccepted(h,await first);
   await assertAccepted(h,await run({...h,capability:randomUUID()},{transport:async()=>{throw Error('must-not-acquire');}}));
  });
  await t.test('legacy CP-03 staging recovers exact evidence while keeping a new fenced binding',async()=>{
   const h=await setup({leaseMs:2000});await stageLegacy(h);const before=await inspect(h);await owner.query('SELECT pg_sleep(2.1)');h.capability=randomUUID();
   const result=await run(h,{transport:async()=>{throw Error('must-reuse-legacy');}});await assertAccepted(h,result);assert.equal(result.record.captureText,before.candidate.stage.captureText);
  });
  await t.test('second crash after replayed raw retains original exact evidence constraint through ancestry',async()=>{
   const h=await setup({leaseMs:2000});await crash(h,'after-stage',84);const original=await inspect(h);await owner.query('SELECT pg_sleep(2.1)');await crash(h,'after-raw',83);
   const middle=await inspect(h);assert.equal(middle.candidate.stage.captureText,original.candidate.stage.captureText);assert.equal(middle.candidate.stage.sourcePath.length,2);
   await owner.query('SELECT pg_sleep(2.1)');const result=await run(h,{transport:async()=>{throw Error('must-reuse-ancestry');}});await assertAccepted(h,result);assert.equal(result.record.captureText,original.candidate.stage.captureText);
  });
  await t.test('same live attempt resumes after replayed-raw crash without changing its immutable replay source',async()=>{
   // Release a legacy stage, then crash its successor with a still-live lease.
   const fresh=await setup();await stageLegacy(fresh);await query('SELECT cp04.worker($1,$2,$3,NULL,NULL)',['release',fresh.job.jobId,fresh.capability]);
   await crash(fresh,'after-raw',83);fresh.capability=await originalCap(fresh);const before=await inspect(fresh);
   assert(before.candidate.replaySourceAttemptId);const result=await run(fresh,{transport:async()=>{throw Error('must-reuse-same-attempt');}});await assertAccepted(fresh,result);
   assert.equal(result.record.captureText,before.candidate.stage.captureText);
   assert.equal((await owner.query('SELECT source_attempt_id FROM cp04.replays WHERE token=$1',[fresh.capability])).rows[0].source_attempt_id,before.candidate.replaySourceAttemptId);
  });
  await t.test('stale/revoked claimant cannot stage or finish after reclaim',async()=>{
   const h=await setup({leaseMs:2000});await crash(h,'after-stage',84);const old=await originalCap(h),pending=await inspect(h);await owner.query('SELECT pg_sleep(2.1)');
   const fresh=createPostgresAttempt({query,transaction,jobId:h.job.jobId,capability:h.capability});await fresh.control.claim(fresh.handle,at());
   const staleRecovery=recoveryFor({...h,capability:old});assert.equal((await staleRecovery.run(staleRecovery.handle)).status,'FENCED');
   await assert.rejects(query('SELECT cp04.worker($1,$2,$3,$4,NULL)',['write',h.job.jobId,old,pending.candidate.stage.recordText]),/attempt-not-owned/);
   await assert.rejects(query('SELECT cp04.worker($1,$2,$3,$4,NULL)',['accept',h.job.jobId,old,JSON.stringify({recordText:pending.candidate.stage.recordText,retainedAt:at()})]),/attempt-not-owned/);
   const {digest:oldDigest,...activationBody}=h.context.activation;
   const activation=createActivation({...activationBody,revision:2,state:'DISABLED',stoppedAt:at()});
   await updateLocalActivation(owner,h.context.manifest.digest,activation,{...h.context.trustedState,activationDigest:activation.digest,activationRevision:2});
   assert.equal((await run(h)).status,'BLOCKED');assert.equal(await storage().readAccepted(h.job.jobId),null);
  });
  await t.test('raw origin mismatch fails closed without transport or replacement evidence',async()=>{
   const h=await setup({leaseMs:2000});await crash(h,'after-raw',83);await owner.query('SELECT pg_sleep(2.1)');
   const result=await run(h,{policy:{async select(reference){return {policyReference:reference,selectedProviderTime:new Date(Date.parse(h.job.window.start)-86400000).toISOString()};}}});
   assert.equal(result.status,'INTEGRITY_FAILED');assert.equal(h.calls,0);assert.equal(await storage().readAccepted(h.job.jobId),null);
  });
  await t.test('conflicting raw content for same attempt is rejected, never overwritten',async()=>{
   const h=await setup();await crash(h,'after-raw',83);h.capability=await originalCap(h);const before=await inspect(h);
   await assert.rejects(query('SELECT cp04.worker($1,$2,$3,$4,$5)',['raw-write',h.job.jobId,h.capability,JSON.stringify({origin:before.candidate.origin,replaySourceAttemptId:null}),Buffer.from('different')]),/immutable-recovery-raw-conflict/);
   assert.equal((await inspect(h)).candidate.rawHex,before.candidate.rawHex);
  });
  await t.test('conflicting staged binding/result for same attempt fails closed without replacement',async()=>{
   const h=await setup();await crash(h,'after-stage',84);h.capability=await originalCap(h);const before=await inspect(h);
   const record=JSON.parse(before.candidate.stage.recordText);record.metadataBasis.revision='CONFLICTING_RETRY';
   await assert.rejects(query('SELECT cp04.worker($1,$2,$3,$4,NULL)',['write',h.job.jobId,h.capability,JSON.stringify(record)]),/immutable-result-conflict/);
   assert.equal((await inspect(h)).candidate.stage.recordText,before.candidate.stage.recordText);
  });
  await t.test('lost advisory unlock reply cannot erase a verified committed acceptance',async()=>{
   const h=await setup();let destroyed=false;
   const lockPool={async connect(){const client=await pool.connect();return {async query(sql,args){if(sql.includes('pg_advisory_unlock'))throw Error('synthetic-lost-unlock-connection');return client.query(sql,args);},release(force){destroyed=force===true;client.release(force);}};}};
   await assertAccepted(h,await run(h,{withLock:postgresRecoveryLock(lockPool)}));assert(destroyed);
  });
  await t.test('database-level raw/evidence/reference/binding corruption fails closed and fault transaction rolls back',async()=>{
   const h=await setup();await crash(h,'after-stage',84);const pending=await inspect(h),rawHash=pending.candidate.rawHash,evidenceId=pending.candidate.stage.evidenceId,cap=await originalCap(h);
   for(const mutate of [
    async()=>{const row=(await owner.query("SELECT conname FROM pg_constraint WHERE conrelid='cp02.raw'::regclass AND pg_get_constraintdef(oid) LIKE '%sha256%'")).rows[0];assert(/^[a-z_]+$/.test(row.conname));await owner.query(`ALTER TABLE cp02.raw DROP CONSTRAINT ${row.conname}; ALTER TABLE cp02.raw DISABLE TRIGGER USER`);await owner.query('UPDATE cp02.raw SET bytes=$2 WHERE hash=$1',[rawHash,Buffer.from('tampered')]);},
    async()=>{await owner.query('ALTER TABLE cp03.evidence DISABLE TRIGGER USER');await owner.query("UPDATE cp03.evidence SET reference=jsonb_set(reference,'{sha256}',to_jsonb($2::text)) WHERE evidence_id=$1",[evidenceId,'0'.repeat(64)]);},
    async()=>{await owner.query('ALTER TABLE cp03.evidence DISABLE TRIGGER USER');await owner.query("UPDATE cp03.evidence SET capture_text=capture_text||' ',text_hash=encode(sha256(convert_to(capture_text||' ','UTF8')),'hex') WHERE evidence_id=$1",[evidenceId]);},
    async()=>{await owner.query('ALTER TABLE cp03.bindings DISABLE TRIGGER USER');await owner.query('UPDATE cp03.bindings SET binding_digest=$2 WHERE token=$1',[cap,'0'.repeat(64)]);}
   ]){
    await owner.query('BEGIN');try{await mutate();const r=recoveryFor(h,{query:(...args)=>owner.query(...args)});const result=await r.inspect(r.handle);assert.equal(result.status,'INTEGRITY_FAILED',JSON.stringify(result));}finally{await owner.query('ROLLBACK');}
   }
   assert.equal((await inspect(h)).candidate.stage.recordText,pending.candidate.stage.recordText);
  });
  await t.test('real PostgreSQL restart between empty/raw/staged interruptions preserves state and deterministic retry',async()=>{
   const jobs=[await setup({leaseMs:2000}),await setup({leaseMs:2000}),await setup({leaseMs:2000})];
   await crash(jobs[0],'before-raw',81);await crash(jobs[1],'after-raw',83);await crash(jobs[2],'after-stage',84);
   const before=[];for(const h of jobs){const v=await inspect(h);before.push(v.candidate);assert.equal(await storage().readAccepted(h.job.jobId),null);}
   const started=(await owner.query('SELECT pg_postmaster_start_time() AS started')).rows[0].started.toISOString();
   await pool.end();await owner.end();
   const restart=spawnSync('C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe',['restart','-D',path.join(root,'data'),'-w','-t','30','-m','fast','-l',path.join(root,'cp04-stage-restart.log')],{encoding:'utf8',timeout:45000,windowsHide:true});assert.equal(restart.status,0,restart.stderr);
   await connect();assert.notEqual((await owner.query('SELECT pg_postmaster_start_time() AS started')).rows[0].started.toISOString(),started);await owner.query('SELECT pg_sleep(2.1)');
   for(let i=0;i<jobs.length;i++){assert.deepEqual((await inspect(jobs[i])).candidate,before[i]);assert.equal(await storage().readAccepted(jobs[i].job.jobId),null);const result=await run(jobs[i],i?{transport:async()=>{throw Error('restart-must-reuse');}}:{});await assertAccepted(jobs[i],result);if(i===2)assert.equal(result.record.captureText,before[i].stage.captureText);}
  });
  await t.test('restricted worker cannot bypass recovery/immutable/DML/admin invariants',async()=>{
   for(const table of ['raw_checkpoints','replays'])for(const sql of [`SELECT * FROM cp04.${table}`,`INSERT INTO cp04.${table} DEFAULT VALUES`,`DELETE FROM cp04.${table}`,`UPDATE cp04.${table} SET raw_hash='forbidden'`,`TRUNCATE cp04.${table}`,`ALTER TABLE cp04.${table} ADD COLUMN forbidden int`])await assert.rejects(query(sql),e=>e.code==='42501');
   for(const sql of ['CREATE TABLE cp04.forbidden(x int)','SET ROLE pelora_cp02_owner','CREATE SCHEMA cp04_forbidden','CREATE ROLE cp04_forbidden',"SELECT cp04.staged('forbidden','forbidden')"])await assert.rejects(query(sql),e=>e.code==='42501');
   assert.deepEqual((await owner.query("SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='cp04' AND has_function_privilege('pelora_cp02_worker',p.oid,'EXECUTE') ORDER BY p.proname")).rows,[{proname:'inspect'},{proname:'worker'}]);
   await assert.rejects(owner.query("UPDATE cp04.raw_checkpoints SET raw_hash='forbidden'"),/immutable-record/);
   await assert.rejects(owner.query('DELETE FROM cp04.replays'),/immutable-record/);
  });
  await t.test('opaque recovery admission and poisoned private context cannot control acquisition/jobs/recovery',async()=>{
   const h=await setup(),r=recoveryFor(h,{captain:{session:'PRIVATE',coordinates:[1,2]},viewport:[1,2],mission:'PRIVATE'});
   await assert.rejects(r.run({jobId:h.job.jobId,session:'PRIVATE'}),/opaque-recovery-handle/);
   await assertAccepted(h,await r.run(r.handle));assert(!JSON.stringify(await inspect(h)).includes('PRIVATE'));
   await assert.rejects(registerLocalJob(owner,{...h.context,session:'PRIVATE'},h.job),/exact-fields/);
  });
  await t.test('reviewed CP-04 functions are applied with fixed search paths and no public execute',async()=>{
   const sql=fs.readFileSync(new URL('../durableObserve/cp04.sql',import.meta.url),'utf8');
   for(const match of sql.matchAll(/CREATE FUNCTION cp04\.([a-z_]+)\([\s\S]*?\$\$([\s\S]*?)\$\$;/g)){
    const row=(await owner.query("SELECT prosrc,proconfig,prosecdef FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='cp04' AND p.proname=$1",[match[1]])).rows[0];
    assert.equal(row.prosrc.trim(),match[2].trim());assert.deepEqual(row.proconfig,['search_path=pg_catalog']);assert(row.prosecdef);
   }
  });
 }finally{await pool.end();await owner.end();}
});
