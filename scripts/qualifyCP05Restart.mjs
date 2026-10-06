// Isolated manual-cluster restart; preserves exact records, grants and readback.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import pg from 'pg';
import {verifyWorkerPrivileges} from '../backend/durableObserve/privilegeManifest.mjs';
const manifest=JSON.parse(fs.readFileSync(new URL('../backend/durableObserve/workerPrivilegeManifest.v1.json',import.meta.url),'utf8'));
import {createPostgresObservationStorage} from '../backend/durableObserve/observationStorage.mjs';
import {validateRecoveryStage} from '../backend/durableObserve/recovery.mjs';
if(process.env.PELORA_CP05_LOCAL!=='1')throw Error('local-qualification-opt-in-required');
const root=path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const admin=read('credentials.json'),worker=read('worker-credentials.json');
for(const c of [admin,worker])assert(c.host==='127.0.0.1'&&Number(c.port)===55432&&c.cluster==='pelora_phase3_qualification');
assert.equal(worker.database,'pelora_phase3_qualification');assert.equal(worker.username,'pelora_cp02_worker');
const config=c=>({host:c.host,port:c.port,user:c.username,password:c.password,database:worker.database});
const hash=v=>createHash('sha256').update(v).digest('hex');
const tables={cp02:['registry','jobs','ownership','attempts','raw','results','accepted'],cp03:['evidence','bindings','observations'],cp04:['raw_checkpoints','replays']};
async function snapshot(){
 const owner=new pg.Client(config(admin)),restricted=new pg.Client(config(worker));await owner.connect();await restricted.connect();
 try{
  const s=(await owner.query("SELECT current_setting('data_directory') AS data,current_setting('listen_addresses') AS listen,inet_server_port() AS port,pg_postmaster_start_time() AS started")).rows[0];
  assert.equal(path.resolve(s.data).toLowerCase(),path.resolve(root,'data').toLowerCase());assert.equal(s.listen,'127.0.0.1');assert.equal(s.port,55432);
  const records={};for(const [schema,names] of Object.entries(tables))for(const table of names){
   records[schema+'.'+table]=(await owner.query(`SELECT count(*)::int AS count,encode(sha256(convert_to(coalesce(string_agg(encode(sha256(convert_to(r::text,'UTF8')),'hex'),'' ORDER BY encode(sha256(convert_to(r::text,'UTF8')),'hex')),''),'UTF8')),'hex') AS sha256 FROM ${schema}.${table} r`)).rows[0];}
  const authority=(await owner.query("SELECT n.nspname,p.proname,encode(sha256(convert_to(pg_get_functiondef(p.oid),'UTF8')),'hex') AS sha256,p.proacl::text AS grants FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname IN ('cp02','cp03','cp04') ORDER BY n.nspname,p.proname")).rows;
  const storage=createPostgresObservationStorage({query:(...args)=>restricted.query(...args)}),accepted={},pending={};
  for(const {job_id} of (await owner.query('SELECT job_id FROM cp02.accepted ORDER BY job_id')).rows){
   const value=await storage.readAccepted(job_id);assert(value);accepted[job_id]=hash(JSON.stringify({...value,rawBytes:value.rawBytes.toString('hex')}));}
  for(const {job_id} of (await owner.query('SELECT DISTINCT a.job_id FROM cp04.raw_checkpoints q JOIN cp02.attempts a USING(token) WHERE NOT EXISTS(SELECT 1 FROM cp02.accepted x WHERE x.job_id=a.job_id) ORDER BY a.job_id')).rows){
   const value=(await restricted.query('SELECT cp04.inspect($1,$2) AS value',[job_id,randomUUID()])).rows[0].value;
   assert(value.candidate);const c=value.candidate;assert.equal(hash(Buffer.from(c.rawHex,'hex')),c.rawHash);
   if(c.stage)validateRecoveryStage(job_id,c.stage);pending[job_id]=hash(JSON.stringify(c));
  }
  for(const table of tables.cp04)await assert.rejects(restricted.query(`DELETE FROM cp04.${table}`),e=>e.code==='42501');
  await assert.rejects(restricted.query('CREATE SCHEMA cp04_restart_forbidden'),e=>e.code==='42501');
  const privileges=await verifyWorkerPrivileges((...args)=>owner.query(...args),manifest); return {started:s.started.toISOString(),records,authority,accepted,pending,privileges};
 }finally{await restricted.end();await owner.end();}
}
const before=await snapshot();
const restart=spawnSync('C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe',['restart','-D',path.join(root,'data'),'-w','-t','30','-m','fast','-l',path.join(root,'cp05-restart.log')],{encoding:'utf8',timeout:45000,windowsHide:true});
assert.equal(restart.status,0,restart.stderr);
const after=await snapshot();assert.notEqual(after.started,before.started);
assert.deepEqual(after.records,before.records);assert.deepEqual(after.authority,before.authority);assert.deepEqual(after.accepted,before.accepted);assert.deepEqual(after.pending,before.pending);assert.deepEqual(after.privileges,before.privileges);
const report={contract:'pelora-cp05-real-postgresql-restart-v1',scope:'ISOLATED_LOCAL_QUALIFICATION_ONLY',beforeStartedAt:before.started,afterStartedAt:after.started,
 privileges:after.privileges,records:after.records,authority:after.authority,validatedAcceptedObservations:Object.keys(after.accepted).length,
 validatedPendingRecoveryCandidates:Object.keys(after.pending).length,acceptedReadbackDigest:hash(JSON.stringify(after.accepted)),pendingReadbackDigest:hash(JSON.stringify(after.pending)),
 restrictedWorkerReadbackAndPrivilegeDenialAfterRestart:true,persistence:'EXACT_TABLE_CONTENT_FUNCTIONS_GRANTS_ACCEPTED_AND_PENDING_READBACK_PRESERVED',receiptWriterIntegrated:false};
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
