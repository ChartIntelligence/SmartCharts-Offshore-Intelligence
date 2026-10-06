// One-shot restricted-worker competing process; no admin connection or persistent publisher.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import http from 'node:http';import https from 'node:https';import pg from 'pg';
import {createControlledP4Runtime} from '../../durableObserve/controlledRetainedPublication.mjs';import {createLocalFourHourPublisher} from '../../durableObserve/localPublicationPublisher.mjs';
const forbidden=()=>{throw Error('controlled-p4-provider-or-auth-forbidden');};globalThis.fetch=forbidden;http.request=forbidden;https.request=forbidden;
const c=JSON.parse(fs.readFileSync(path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification/worker-credentials.json'),'utf8'));assert.equal(c.host,'127.0.0.1');assert.equal(Number(c.port),55432);assert.equal(c.database,'pelora_phase3_qualification');assert.equal(c.username,'pelora_cp02_worker');
const pool=new pg.Pool({host:c.host,port:c.port,user:c.username,password:c.password,database:c.database,max:2,query_timeout:10000});pool.on('error',()=>{/* One-shot shutdown owns the pool. */});const query=(...args)=>pool.query(...args);
const configuration=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),runtime=await createControlledP4Runtime({query,configuration}),publisher=createLocalFourHourPublisher({enabled:true,createRuntime:async()=>runtime});
try{assert.equal((await query('SELECT current_user AS role')).rows[0].role,'pelora_cp02_worker');console.log(JSON.stringify(await publisher.tick()));}finally{await publisher.close();await pool.end();}
