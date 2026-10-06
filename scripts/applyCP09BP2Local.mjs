import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {database} from '../backend/tests/fixtures/localPublicationFixture.mjs';
if(process.env.PELORA_CP09B_P2_LOCAL!=='1')throw Error('local-opt-in-required');
const db=await database();try{
 const s=(await db.owner.query("SELECT current_database() AS db,current_setting('data_directory') AS data,current_setting('listen_addresses') AS listen,inet_server_port() AS port,to_regnamespace('cp09b_supply') AS existing")).rows[0];
 assert.equal(s.db,'pelora_phase3_qualification');assert.equal(s.listen,'127.0.0.1');assert.equal(s.port,55432);
 assert.equal(path.resolve(s.data).toLowerCase(),path.resolve(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification/data').toLowerCase());assert.equal(s.existing,null);
 await db.owner.query(fs.readFileSync(new URL('../backend/durableObserve/cp09bSupply.sql',import.meta.url),'utf8'));
 console.log('P2 isolated immutable unadmitted retention applied; worker retain/read_exact only.');
}finally{await db.close();}
