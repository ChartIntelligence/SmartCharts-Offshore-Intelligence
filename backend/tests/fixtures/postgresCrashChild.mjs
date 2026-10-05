// Dedicated local qualification subprocess. No credential values in IPC/output.
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import {createPostgresAttempt,postgresTransaction} from '../../durableObserve/postgresPorts.mjs';
import {createCurrentObservationWorker} from '../../observe/currentObservationWorker.mjs';
const credential=JSON.parse(fs.readFileSync(path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification/worker-credentials.json'),'utf8'));
if(credential.host!=='127.0.0.1'||Number(credential.port)!==55432||credential.database!=='pelora_phase3_qualification')throw Error('isolation-mismatch');
const pool=new pg.Pool({host:credential.host,port:credential.port,database:credential.database,user:credential.username,password:credential.password});
const [jobId,mode]=process.argv.slice(2);
const ports=createPostgresAttempt({query:(...args)=>pool.query(...args),transaction:postgresTransaction(pool),jobId});
const state=await ports.control.claim(ports.handle,new Date().toISOString());
const {manifest,job}=state.context;
const bytes=Buffer.from(JSON.stringify({table:{columnNames:['time','latitude','longitude','u_current','v_current'],
 rows:[[job.window.start,job.cell.coordinates.latitude,job.cell.coordinates.longitude,0.5,0.25]]}}));
const results={...ports.results,async accept(record,authorize,retainedAt){
 if(mode==='before-accept')process.exit(71);
 await ports.results.accept(record,authorize,retainedAt);process.exit(72);
}};
const result=await createCurrentObservationWorker({control:ports.control,responses:ports.responses,results,
 clock:{now:()=>new Date().toISOString()},timers:{arm(){return 1;},clear(){}},
 policy:{async select(reference){return {policyReference:reference,selectedProviderTime:job.window.start};}},
 transport:async()=>({bytes,status:200,provider:manifest.product.provider,dataset:manifest.product.dataset})}).run(ports.handle);
await pool.end();console.error('crash-boundary-not-reached:'+result.reason);process.exit(73);
