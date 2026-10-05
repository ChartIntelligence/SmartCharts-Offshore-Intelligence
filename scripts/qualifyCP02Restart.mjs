// Explicit isolated local cluster lifecycle qualification. Never production.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import pg from 'pg';
if(process.env.PELORA_CP02_LOCAL!=='1')throw Error('local-qualification-opt-in-required');
const root=path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification');
const credential=JSON.parse(fs.readFileSync(path.join(root,'credentials.json'),'utf8'));
assert(credential.host==='127.0.0.1'&&Number(credential.port)===55432&&credential.cluster==='pelora_phase3_qualification');
const config={host:credential.host,port:credential.port,user:credential.username,password:credential.password,database:'pelora_phase3_qualification'};
const tables=['registry','jobs','ownership','attempts','raw','results','accepted'];
const normalize=p=>path.resolve(p).replaceAll('\\','/').toLowerCase();
async function snapshot() {
 const client=new pg.Client(config);await client.connect();
 try {
  const server=(await client.query("SELECT current_setting('data_directory') AS data,current_setting('listen_addresses') AS listen,inet_server_port() AS port,pg_postmaster_start_time() AS started")).rows[0];
  assert.equal(normalize(server.data),normalize(path.join(root,'data')));assert.equal(server.listen,'127.0.0.1');assert.equal(server.port,55432);
  const records={};for(const table of tables)records[table]=(await client.query(`SELECT count(*)::int AS count,encode(sha256(convert_to(coalesce(string_agg(encode(sha256(convert_to(r::text,'UTF8')),'hex'),'' ORDER BY encode(sha256(convert_to(r::text,'UTF8')),'hex')),''),'UTF8')),'hex') AS sha256 FROM cp02.${table} r`)).rows[0];
  const authority=(await client.query("SELECT encode(sha256(convert_to(pg_get_functiondef('cp02.worker(text,text,uuid,text,bytea)'::regprocedure),'UTF8')),'hex') AS function_sha256,encode(sha256(convert_to(pg_get_functiondef('cp02.fenced_commit()'::regprocedure),'UTF8')),'hex') AS commit_authority_sha256,(SELECT encode(sha256(convert_to(rolsuper::text||rolcreatedb::text||rolcreaterole::text||rolbypassrls::text||rolreplication::text||rolinherit::text,'UTF8')),'hex') FROM pg_roles WHERE rolname='pelora_cp02_worker') AS worker_attributes_sha256")).rows[0];
  const sample=(await client.query('SELECT job_id,token FROM cp02.accepted ORDER BY job_id LIMIT 1')).rows[0];assert(sample,'accepted-fixture-required');
  const decision=(await client.query('SELECT cp02.worker($1,$2,$3,NULL,NULL) AS value',['accepted',sample.job_id,sample.token])).rows[0].value;
  return {started:server.started.toISOString(),records,authority,sample,decision};
 } finally {await client.end();}
}
const before=await snapshot();
const command=spawnSync('C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe',
 ['restart','-D',path.join(root,'data'),'-w','-t','30','-m','fast','-l',path.join(root,'cp02-restart.log')],
 {encoding:'utf8',timeout:45000,windowsHide:true});
assert.equal(command.status,0,command.stderr);
const after=await snapshot();assert.notEqual(after.started,before.started);assert.deepEqual(after.records,before.records);assert.deepEqual(after.decision,before.decision);
assert.deepEqual(after.authority,before.authority);
const worker=JSON.parse(fs.readFileSync(path.join(root,'worker-credentials.json'),'utf8'));
assert(worker.host==='127.0.0.1'&&Number(worker.port)===55432&&worker.database==='pelora_phase3_qualification');
const restricted=new pg.Client({host:worker.host,port:worker.port,user:worker.username,password:worker.password,database:worker.database});
await restricted.connect();try {
 const decision=(await restricted.query('SELECT cp02.worker($1,$2,$3,NULL,NULL) AS value',['accepted',after.sample.job_id,after.sample.token])).rows[0].value;
 assert.deepEqual(decision,before.decision);
 await assert.rejects(restricted.query('CREATE SCHEMA restart_forbidden'),error=>error.code==='42501');
} finally {await restricted.end();}
const report={contract:'pelora-cp02-real-postgresql-restart-v1',scope:'ISOLATED_LOCAL_QUALIFICATION_ONLY',
 beforeStartedAt:before.started,afterStartedAt:after.started,records:after.records,authority:after.authority,restrictedWorkerReconciliationAfterRestart:true,
 persistence:'EXACT_TABLE_CONTENT_AND_ACCEPTED_ACKNOWLEDGMENT_PRESERVED',receiptWriterIntegrated:false};
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
