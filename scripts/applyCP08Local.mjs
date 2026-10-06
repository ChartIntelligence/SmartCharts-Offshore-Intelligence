import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import pg from 'pg';
if(process.env.PELORA_CP08_LOCAL!=='1')throw Error('local-qualification-opt-in-required');
const root=path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification');
const c=JSON.parse(fs.readFileSync(path.join(root,'credentials.json'),'utf8'));
assert(c.host==='127.0.0.1'&&Number(c.port)===55432&&c.cluster==='pelora_phase3_qualification');
const owner=new pg.Client({host:c.host,port:c.port,user:c.username,password:c.password,database:'pelora_phase3_qualification'});await owner.connect();
try{
 const s=(await owner.query("SELECT current_database() AS db,current_setting('data_directory') AS data,current_setting('listen_addresses') AS listen,inet_server_port() AS port")).rows[0];
 assert.equal(s.db,'pelora_phase3_qualification');assert.equal(s.listen,'127.0.0.1');assert.equal(s.port,55432);
 assert.equal(path.resolve(s.data).toLowerCase(),path.resolve(root,'data').toLowerCase());
 assert((await owner.query("SELECT to_regnamespace('cp07') IS NOT NULL AND to_regnamespace('cp08') IS NULL AS ready")).rows[0].ready,'migration-state');
 await owner.query(fs.readFileSync(new URL('../backend/durableObserve/cp08.sql',import.meta.url),'utf8'));
 console.log('CP-08 isolated publication store applied: append-only versions, serialized heads, no direct worker table grants.');
}finally{await owner.end();}
