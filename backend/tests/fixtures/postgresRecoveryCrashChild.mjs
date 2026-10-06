// Local crash-injection fixture only. No secret values in IPC, arguments or output.
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {createPostgresRecovery,postgresRecoveryLock} from '../../durableObserve/recovery.mjs';
import {postgresTransaction} from '../../durableObserve/postgresPorts.mjs';
if(process.env.PELORA_CP04_LOCAL!=='1')throw Error('local-opt-in');
const c=JSON.parse(fs.readFileSync(path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification/worker-credentials.json'),'utf8'));
if(c.host!=='127.0.0.1'||Number(c.port)!==55432||c.cluster!=='pelora_phase3_qualification'||c.database!=='pelora_phase3_qualification'||c.username!=='pelora_cp02_worker')throw Error('isolation-mismatch');
const [jobId,mode]=process.argv.slice(2),capability=randomUUID();
const pool=new pg.Pool({host:c.host,port:c.port,user:c.username,password:c.password,database:c.database,application_name:'pelora-cp04-'+mode,max:4});pool.on('error',()=>{});
const at=()=>new Date().toISOString(),baseQuery=(...args)=>pool.query(...args);
const tx=postgresTransaction(pool);
let selectedJob;
const query=async(sql,args)=>{
 if(sql==='SELECT cp04.worker($1,$2,$3,$4,$5) AS value'){
  if(args[0]==='raw-write'&&mode==='before-raw')process.exit(81);
  if(args[0]==='write'&&mode==='before-stage')process.exit(82);
  if(args[0]==='write'&&['inside-evidence','inside-binding'].includes(mode)){
   const client=await pool.connect();await client.query('BEGIN');
   await client.query(sql,args); // parent kills process while trigger is waiting
   throw Error('inside-transaction-crash-not-reached');
  }
 }
 const value=await baseQuery(sql,args);
 if(sql==='SELECT cp04.worker($1,$2,$3,$4,$5) AS value'){
  if(args[0]==='raw-write'&&mode==='after-raw')process.exit(83);
  if(args[0]==='write'&&mode==='after-stage')process.exit(84);
 }
 return value;
};
const transaction=operation=>tx(async q=>{
 const value=await operation(async(sql,args)=>{
  const result=await q(sql,args);
  if(sql==='SELECT cp04.worker($1,$2,$3,$4,$5) AS value'&&args[0]==='accept'&&mode==='after-accept-insert')process.exit(85);
  return result;
 });return value;
}).then(value=>{if(mode==='after-commit')process.exit(86);return value;});
const recovery=createPostgresRecovery({query,transaction,withLock:postgresRecoveryLock(pool),jobId,capability,
 clock:{now:at},timers:{arm(){return 1;},clear(){}},
 policy:{async select(reference,job){selectedJob=job;return {policyReference:reference,selectedProviderTime:job.window.start};}},
 transport:async()=>({status:200,provider:'NOAA CoastWatch',dataset:'noaacwBLENDEDNRTcurrentsDaily',
  bytes:Buffer.from(' \n'+JSON.stringify({table:{columnNames:['time','latitude','longitude','u_current','v_current'],
   rows:[[selectedJob.window.start,selectedJob.cell.coordinates.latitude,selectedJob.cell.coordinates.longitude,0.5+parseInt(selectedJob.jobId.slice(-12),16)/1e15,0.25]]}})+'\n')})});
const result=await recovery.run(recovery.handle);await pool.end();console.error('crash-boundary-not-reached:'+result.status+':'+result.reason);process.exit(87);
