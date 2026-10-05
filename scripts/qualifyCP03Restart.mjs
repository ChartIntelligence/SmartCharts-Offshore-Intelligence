// Explicit isolated-local manual-cluster restart. No service/system configuration.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import pg from 'pg';
import {createPostgresObservationStorage} from '../backend/durableObserve/observationStorage.mjs';
if(process.env.PELORA_CP03_LOCAL!=='1')throw Error('local-qualification-opt-in-required');
const root=path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification');
const credential=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const admin=credential('credentials.json'),worker=credential('worker-credentials.json');
for(const c of [admin,worker])assert(c.host==='127.0.0.1'&&Number(c.port)===55432&&c.cluster==='pelora_phase3_qualification');
assert.equal(worker.database,'pelora_phase3_qualification');assert.equal(worker.username,'pelora_cp02_worker');
const config=c=>({host:c.host,port:c.port,user:c.username,password:c.password,database:worker.database});
const hash=text=>createHash('sha256').update(text).digest('hex');
const tables={cp02:['registry','jobs','ownership','attempts','raw','results','accepted'],cp03:['evidence','bindings','observations']};
async function snapshot(){
 const owner=new pg.Client(config(admin)),restricted=new pg.Client(config(worker));await owner.connect();await restricted.connect();
 try{
  const s=(await owner.query("SELECT current_setting('data_directory') AS data,current_setting('listen_addresses') AS listen,inet_server_port() AS port,pg_postmaster_start_time() AS started")).rows[0];
  assert.equal(path.resolve(s.data).toLowerCase(),path.resolve(root,'data').toLowerCase());assert.equal(s.listen,'127.0.0.1');assert.equal(s.port,55432);
  const records={};for(const [schema,names] of Object.entries(tables))for(const table of names){
   records[schema+'.'+table]=(await owner.query(`SELECT count(*)::int AS count,encode(sha256(convert_to(coalesce(string_agg(encode(sha256(convert_to(r::text,'UTF8')),'hex'),'' ORDER BY encode(sha256(convert_to(r::text,'UTF8')),'hex')),''),'UTF8')),'hex') AS sha256 FROM ${schema}.${table} r`)).rows[0];}
  const authority=(await owner.query("SELECT n.nspname,p.proname,encode(sha256(convert_to(pg_get_functiondef(p.oid),'UTF8')),'hex') AS sha256,p.proacl::text AS grants FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname IN ('cp02','cp03') ORDER BY n.nspname,p.proname")).rows;
  const storage=createPostgresObservationStorage({query:(...args)=>restricted.query(...args)}),observations={};
  for(const {job_id} of (await owner.query('SELECT job_id FROM cp02.accepted ORDER BY job_id')).rows){
   const value=await storage.readAccepted(job_id);assert(value);observations[job_id]=hash(JSON.stringify({...value,rawBytes:value.rawBytes.toString('hex')}));}
  assert(Object.keys(observations).length>0);
  for(const table of tables.cp03)await assert.rejects(restricted.query(`DELETE FROM cp03.${table}`),e=>e.code==='42501');
  await assert.rejects(restricted.query('CREATE SCHEMA cp03_restart_forbidden'),e=>e.code==='42501');
  return {started:s.started.toISOString(),records,authority,observations};
 }finally{await restricted.end();await owner.end();}
}
const before=await snapshot();
const restart=spawnSync('C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe',['restart','-D',path.join(root,'data'),'-w','-t','30','-m','fast','-l',path.join(root,'cp03-restart.log')],{encoding:'utf8',timeout:45000,windowsHide:true});
assert.equal(restart.status,0,restart.stderr);
const after=await snapshot();assert.notEqual(after.started,before.started);
assert.deepEqual(after.records,before.records);assert.deepEqual(after.authority,before.authority);assert.deepEqual(after.observations,before.observations);
const report={contract:'pelora-cp03-real-postgresql-restart-v1',scope:'ISOLATED_LOCAL_QUALIFICATION_ONLY',beforeStartedAt:before.started,afterStartedAt:after.started,
 records:after.records,authority:after.authority,validatedAcceptedObservations:Object.keys(after.observations).length,
 validatedObservationReadbackDigest:hash(JSON.stringify(after.observations)),restrictedWorkerReadbackAndDenialAfterRestart:true,
 persistence:'EXACT_ALL_TABLE_CONTENT_AND_VALIDATED_ACCEPTED_OBSERVATION_READBACK_PRESERVED',receiptWriterIntegrated:false};
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
