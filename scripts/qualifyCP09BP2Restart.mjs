// Narrow restart readback of P2 only; no earlier restart suite, provider or publisher.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';
import {database} from '../backend/tests/fixtures/localPublicationFixture.mjs';
import {createRetainedInputStore} from '../backend/durableObserve/retainedInputSupply.mjs';
if(process.env.PELORA_CP09B_P2_LOCAL!=='1')throw Error('isolated-local-opt-in-required');
const hash=x=>createHash('sha256').update(x).digest('hex'),root=path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification');
async function snapshot(){
 const db=await database();try{
  const s=(await db.owner.query("SELECT current_database() AS db,current_setting('data_directory') AS data,current_setting('listen_addresses') AS listen,inet_server_port() AS port,pg_postmaster_start_time() AS started")).rows[0];
  assert.equal(s.db,'pelora_phase3_qualification');assert.equal(s.listen,'127.0.0.1');assert.equal(s.port,55432);assert.equal(path.resolve(s.data).toLowerCase(),path.resolve(root,'data').toLowerCase());
  const rows=(await db.owner.query('SELECT identity,record_text,digest FROM cp09b_supply.artifacts ORDER BY identity')).rows;assert(rows.length>0);const readbacks=[],store=createRetainedInputStore({query:db.query});
  for(const row of rows){const ref=JSON.parse(row.record_text).artifact.reference,r=await store.read(ref);assert.equal(r.status,'FOUND_VALIDATED');assert.equal(r.recordText,row.record_text);readbacks.push({identity:row.identity,digest:row.digest,readbackSha256:hash(JSON.stringify(r))});}
  return {started:s.started.toISOString(),rows:readbacks};
 }finally{await db.close();}
}
const before=await snapshot(),restart=spawnSync('C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe',['restart','-D',path.join(root,'data'),'-w','-t','30','-m','fast','-l',path.join(root,'cp09b-p2-restart.log')],{encoding:'utf8',windowsHide:true,timeout:45000});
assert.equal(restart.status,0,'isolated restart failed');const after=await snapshot();assert.notEqual(after.started,before.started);assert.deepEqual(after.rows,before.rows);
const output={contractVersion:'pelora-p2-narrow-restart-evidence-v1',scope:'P2_IMMUTABLE_UNADMITTED_ARTIFACTS_ONLY',beforeStarted:before.started,afterStarted:after.started,count:after.rows.length,rows:after.rows,result:'PASS'};
const destination=path.resolve(process.argv[2]??'.local/ocean-quarantine/cp09b-p2/restart.json');fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify({result:output.result,count:output.count,scope:output.scope}));
