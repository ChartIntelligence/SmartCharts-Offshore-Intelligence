import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import pg from 'pg';
import {SOURCE_NORMALIZATION_DESCRIPTOR,SOURCE_NORMALIZATION_REFERENCE} from '../backend/sourceNormalization.mjs';
if(process.env.PELORA_CP06_LOCAL!=='1')throw Error('local-qualification-opt-in-required');
const root=path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification');
const c=JSON.parse(fs.readFileSync(path.join(root,'credentials.json'),'utf8'));
assert(c.host==='127.0.0.1'&&Number(c.port)===55432&&c.cluster==='pelora_phase3_qualification');
const owner=new pg.Client({host:c.host,port:c.port,user:c.username,password:c.password,database:'pelora_phase3_qualification'});await owner.connect();
try{
 const s=(await owner.query("SELECT current_database() AS db,current_setting('data_directory') AS data,current_setting('listen_addresses') AS listen,inet_server_port() AS port")).rows[0];
 assert.equal(s.db,'pelora_phase3_qualification');assert.equal(s.listen,'127.0.0.1');assert.equal(s.port,55432);assert.equal(path.resolve(s.data).toLowerCase(),path.resolve(root,'data').toLowerCase());
 assert((await owner.query("SELECT to_regnamespace('cp06') IS NULL AND to_regprocedure('cp02.accept_terminal(text,uuid,text)') IS NOT NULL AS ready")).rows[0].ready);
 await owner.query('BEGIN');
 try{
  await owner.query(fs.readFileSync(new URL('../backend/durableObserve/cp06.sql',import.meta.url),'utf8').replace(/^BEGIN;$/m,'').replace(/^COMMIT;$/m,''));
  const policy={contractVersion:'pelora-receipt-writer-v1',receiptContractVersion:'pelora-historical-availability-reference-v1',event:'validated-exact-current-v3-and-dependency-closure-possessed',clock:'trusted-backend-utc',storage:'private-append-only-atomic-envelope-v1'};
  await owner.query('INSERT INTO cp06.policy VALUES(true,$1,$2,$3)',[policy,SOURCE_NORMALIZATION_REFERENCE,JSON.stringify(SOURCE_NORMALIZATION_DESCRIPTOR)]);
  await owner.query('COMMIT');console.log('CP-06 isolated local schema applied; default writer disabled; two narrow receipt APIs, no table grants.');
 }catch(e){await owner.query('ROLLBACK');throw e;}
}finally{await owner.end();}
