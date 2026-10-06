// Isolated manual-cluster restart; preserves exact records, grants and readback.
import fs from 'node:fs';
import {database,setup,stage,runtime} from '../backend/tests/fixtures/localPublicationFixture.mjs';
import {createPublisherLedger,disableLocalPublisherConfiguration} from '../backend/durableObserve/publicationScheduler.mjs';
import {createLocalFourHourPublisher} from '../backend/durableObserve/localPublicationPublisher.mjs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import pg from 'pg';
import {readRankedPublication,byteHash} from '../backend/durableObserve/publicationEnvelope.mjs';
import {createPublicationStore} from '../backend/durableObserve/publicationStore.mjs';
import {createOceanStateReader} from '../backend/durableObserve/oceanStateReader.mjs';
import {validateHistoricalReceiptEnvelope} from '../backend/historicalReceiptRuntime.mjs';
import {verifyWorkerPrivileges} from '../backend/durableObserve/privilegeManifest.mjs';
const manifest=JSON.parse(fs.readFileSync(new URL('../backend/durableObserve/publisherPrivilegeManifest.v1.json',import.meta.url),'utf8'));
import {createPostgresObservationStorage} from '../backend/durableObserve/observationStorage.mjs';
import {validateRecoveryStage} from '../backend/durableObserve/recovery.mjs';
if(process.env.PELORA_CP09_LOCAL!=='1')throw Error('local-qualification-opt-in-required');
const root=path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const admin=read('credentials.json'),worker=read('worker-credentials.json');
for(const c of [admin,worker])assert(c.host==='127.0.0.1'&&Number(c.port)===55432&&c.cluster==='pelora_phase3_qualification');
assert.equal(worker.database,'pelora_phase3_qualification');assert.equal(worker.username,'pelora_cp02_worker');
const config=c=>({host:c.host,port:c.port,user:c.username,password:c.password,database:worker.database});
const hash=v=>createHash('sha256').update(v).digest('hex');
const tables={cp02:['registry','jobs','ownership','attempts','raw','results','accepted'],cp03:['evidence','bindings','observations'],cp04:['raw_checkpoints','replays'],cp06:['policy','envelopes','links'],cp08:['contexts','versions','heads'],cp09:['configurations','disables','jobs','attempts','freezes','submissions','completions']};
const stagedDb=await database(),stagedJob=await setup(stagedDb);await stage(stagedJob);const stagedSubmission=(await stagedJob.ledger.inspect(stagedJob.id)).submissionText;await stagedDb.close();
const assessmentAt=new Date().toISOString();
async function snapshot(){
 const owner=new pg.Client(config(admin)),restricted=new pg.Client(config(worker));await owner.connect();await restricted.connect();
 try{
  const s=(await owner.query("SELECT current_setting('data_directory') AS data,current_setting('listen_addresses') AS listen,inet_server_port() AS port,pg_postmaster_start_time() AS started")).rows[0];
  assert.equal(path.resolve(s.data).toLowerCase(),path.resolve(root,'data').toLowerCase());assert.equal(s.listen,'127.0.0.1');assert.equal(s.port,55432);
  const records={};for(const [schema,names] of Object.entries(tables))for(const table of names){
   records[schema+'.'+table]=(await owner.query(`SELECT count(*)::int AS count,encode(sha256(convert_to(coalesce(string_agg(encode(sha256(convert_to(r::text,'UTF8')),'hex'),'' ORDER BY encode(sha256(convert_to(r::text,'UTF8')),'hex')),''),'UTF8')),'hex') AS sha256 FROM ${schema}.${table} r`)).rows[0];}
  const authority=(await owner.query("SELECT n.nspname,p.proname,encode(sha256(convert_to(pg_get_functiondef(p.oid),'UTF8')),'hex') AS sha256,p.proacl::text AS grants FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname IN ('cp02','cp03','cp04','cp06','cp07','cp08','cp09') ORDER BY n.nspname,p.proname")).rows;
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
  const receipts={};for(const {job_id} of (await owner.query('SELECT job_id FROM cp06.links ORDER BY job_id')).rows){const v=(await restricted.query('SELECT cp06.lookup($1) AS value',[job_id])).rows[0].value;assert(v);validateHistoricalReceiptEnvelope(v.envelopeText,v.linkage.evidence_reference);receipts[job_id]=hash(JSON.stringify(v));}
    const reader=createOceanStateReader({query:(...args)=>restricted.query(...args),clock:{now:()=>assessmentAt}}),states={};
  for(const {job_id} of (await owner.query('SELECT job_id FROM cp02.accepted ORDER BY job_id')).rows){
   const v=(await restricted.query('SELECT cp03.lookup($1) AS value',[job_id])).rows[0].value,m=v.context.manifest;
   const selected=v.index.timestamps.selectedProviderTime;
   const state=await reader.read({scope:{manifestDigest:m.digest,region:m.region,product:{family:m.product.family,provider:m.product.provider,dataset:m.product.dataset,productId:m.product.productId},cellKey:v.index.cell_key},queryContext:'historical',targetTime:assessmentAt,sourceTime:{from:selected,until:new Date(Date.parse(selected)+1).toISOString()},maxObservations:20});
   assert.equal(state.status,'OK');assert(state.observations.some(o=>o.observationId===job_id));assert(state.observations.every(o=>!o.currentLive));states[job_id]=hash(JSON.stringify(state));
  }
  const publications={},publicationReads={};
  for(const row of (await owner.query('SELECT version_id,record_text,digest FROM cp08.versions ORDER BY version_id')).rows){assert.equal(byteHash(row.record_text),row.digest);assert.equal(readRankedPublication(row.record_text).versionId,row.version_id);publications[row.version_id]=row.digest;}
  const publicationStore=createPublicationStore({query:(...args)=>restricted.query(...args),clock:{now:()=>assessmentAt}});
  for(const row of (await owner.query('SELECT h.context_key,h.cycle_at,c.descriptor FROM cp08.heads h JOIN cp08.contexts c USING(context_key) ORDER BY h.context_key,h.cycle_at')).rows){const r=await publicationStore.read({context:row.descriptor,mode:'exact-cycle',scheduledAt:row.cycle_at.toISOString()});assert(r.record);publicationReads[row.context_key+row.cycle_at.toISOString()]=hash(JSON.stringify(r));}
  const schedulerReads={};for(const row of (await owner.query('SELECT job_id FROM cp09.jobs ORDER BY job_id')).rows){const v=await createPublisherLedger({query:(...args)=>restricted.query(...args)}).inspect(row.job_id);schedulerReads[row.job_id]=hash(JSON.stringify(v));}
  const privileges=await verifyWorkerPrivileges((...args)=>owner.query(...args),manifest); return {started:s.started.toISOString(),records,authority,accepted,pending,privileges,receipts,states,publications,publicationReads,schedulerReads};
 }finally{await restricted.end();await owner.end();}
}
const before=await snapshot();
const restart=spawnSync('C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe',['restart','-D',path.join(root,'data'),'-w','-t','30','-m','fast','-l',path.join(root,'cp09-restart.log')],{encoding:'utf8',timeout:45000,windowsHide:true});
assert.equal(restart.status,0,restart.stderr);
const after=await snapshot();assert.notEqual(after.started,before.started);
assert.deepEqual(after.records,before.records);assert.deepEqual(after.authority,before.authority);assert.deepEqual(after.accepted,before.accepted);assert.deepEqual(after.pending,before.pending);assert.deepEqual(after.privileges,before.privileges);assert.deepEqual(after.receipts,before.receipts);assert.deepEqual(after.states,before.states);
assert.deepEqual(after.publications,before.publications);assert.deepEqual(after.publicationReads,before.publicationReads);
assert.deepEqual(after.schedulerReads,before.schedulerReads);
const resumedDb=await database(),resumedLedger=createPublisherLedger({query:resumedDb.query}),resumed=createLocalFourHourPublisher({enabled:true,limits:{maxCyclesPerTick:1,maxConfigurationScan:1},createRuntime:async()=>runtime(stagedJob,{ledger:resumedLedger})});const resumedResult=await resumed.tick(),resumedState=await resumedLedger.inspect(stagedJob.id);assert(resumedState.completion);assert.equal(resumedState.submissionText,stagedSubmission);await resumed.close();await disableLocalPublisherConfiguration(resumedDb.owner,stagedJob.c.id,new Date().toISOString());await resumedDb.close();
const report={validatedPublisherLedgerReads:Object.keys(after.schedulerReads).length,publisherLedgerReadDigest:hash(JSON.stringify(after.schedulerReads)),pendingPreparedSubmissionRecoveredAfterRestart:{jobId:stagedJob.id,submissionDigest:hash(stagedSubmission),versionId:resumedState.completion.version_id,status:resumedResult.results[0].status},validatedPublicationVersions:Object.keys(after.publications).length,validatedPublicationCycleReads:Object.keys(after.publicationReads).length,publicationReadbackDigest:hash(JSON.stringify(after.publicationReads)),contract:'pelora-cp09-real-postgresql-restart-v1',scope:'ISOLATED_LOCAL_QUALIFICATION_ONLY',beforeStartedAt:before.started,afterStartedAt:after.started,
 validatedOceanStateReads:Object.keys(after.states).length,oceanStateReadDigest:hash(JSON.stringify(after.states)),assessmentAt,validatedReceiptLinks:Object.keys(after.receipts).length,receiptReadbackDigest:hash(JSON.stringify(after.receipts)),privileges:after.privileges,records:after.records,authority:after.authority,validatedAcceptedObservations:Object.keys(after.accepted).length,
 validatedPendingRecoveryCandidates:Object.keys(after.pending).length,acceptedReadbackDigest:hash(JSON.stringify(after.accepted)),pendingReadbackDigest:hash(JSON.stringify(after.pending)),
 restrictedWorkerReadbackAndPrivilegeDenialAfterRestart:true,persistence:'EXACT_TABLE_CONTENT_FUNCTIONS_GRANTS_ACCEPTED_AND_PENDING_READBACK_PRESERVED',receiptWriterIntegrated:true,receiptWriterEnabledByDefault:false};
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
