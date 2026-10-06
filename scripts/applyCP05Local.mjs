import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import pg from 'pg';
if(process.env.PELORA_CP05_LOCAL!=='1')throw Error('local-qualification-opt-in-required');
const root=path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification');
const c=JSON.parse(fs.readFileSync(path.join(root,'credentials.json'),'utf8'));
assert(c.host==='127.0.0.1'&&Number(c.port)===55432&&c.cluster==='pelora_phase3_qualification');
const owner=new pg.Client({host:c.host,port:c.port,user:c.username,password:c.password,database:'pelora_phase3_qualification'});await owner.connect();
try{
 const s=(await owner.query("SELECT current_database() AS db,current_setting('data_directory') AS data,current_setting('listen_addresses') AS listen,inet_server_port() AS port")).rows[0];
 assert.equal(s.db,'pelora_phase3_qualification');assert.equal(s.listen,'127.0.0.1');assert.equal(s.port,55432);
 assert.equal(path.resolve(s.data).toLowerCase(),path.resolve(root,'data').toLowerCase());
 assert(!(await owner.query("SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='cp02' AND table_name='ownership' AND column_name='consumed_at') AS applied")).rows[0].applied,'migration-already-applied');
 await owner.query('BEGIN');
 try{
  // Dedicated local cluster ACLs only, never production or OS configuration.
  await owner.query('REVOKE ALL ON DATABASE postgres,template0,template1 FROM PUBLIC,pelora_cp02_worker');
  await owner.query('REVOKE ALL ON DATABASE pelora_phase3_qualification FROM PUBLIC,pelora_cp02_worker');
  await owner.query('GRANT CONNECT ON DATABASE pelora_phase3_qualification TO pelora_cp02_worker');
  const largeObjects=(await owner.query("SELECT format('%I.%I(%s)',n.nspname,p.proname,oidvectortypes(p.proargtypes)) AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='pg_catalog' AND (p.proname LIKE 'lo\\_%' ESCAPE '\\' OR p.proname IN ('loread','lowrite'))")).rows;
  for(const {signature} of largeObjects)await owner.query('REVOKE EXECUTE ON FUNCTION '+signature+' FROM PUBLIC,pelora_cp02_worker');
  // Also cover accidental future creation as the local admin instead of SET ROLE.
  await owner.query('ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC,pelora_cp02_worker');
  await owner.query('ALTER DEFAULT PRIVILEGES REVOKE ALL ON TABLES FROM PUBLIC,pelora_cp02_worker');
  await owner.query('ALTER DEFAULT PRIVILEGES REVOKE ALL ON SEQUENCES FROM PUBLIC,pelora_cp02_worker');
  await owner.query(fs.readFileSync(new URL('../backend/durableObserve/cp05.sql',import.meta.url),'utf8').replace(/^BEGIN;$/m,'').replace(/^COMMIT;$/m,''));
  const base=fs.readFileSync(new URL('../backend/durableObserve/cp02.sql',import.meta.url),'utf8');
  const recovery=fs.readFileSync(new URL('../backend/durableObserve/cp04.sql',import.meta.url),'utf8');
  for(const match of recovery.matchAll(/CREATE FUNCTION cp04\.[\s\S]*?\$\$;/g))await owner.query(match[0].replace('CREATE FUNCTION','CREATE OR REPLACE FUNCTION'));
  for(const match of base.matchAll(/CREATE FUNCTION cp02\.[\s\S]*?\$\$;/g))await owner.query(match[0].replace('CREATE FUNCTION','CREATE OR REPLACE FUNCTION'));
  await owner.query('CREATE TRIGGER terminal_immutable BEFORE UPDATE OR DELETE ON cp02.ownership FOR EACH ROW EXECUTE FUNCTION cp02.terminal_immutable()');
  await owner.query('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA cp02 FROM PUBLIC,pelora_cp02_worker');
  await owner.query('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA cp04 FROM PUBLIC,pelora_cp02_worker');
  await owner.query('GRANT EXECUTE ON FUNCTION cp02.worker(text,text,uuid,text,bytea),cp03.lookup(text),cp04.inspect(text,uuid),cp04.worker(text,text,uuid,text,bytea) TO pelora_cp02_worker');
  await owner.query('COMMIT');console.log('Local CP-05 upgrade applied: atomic claim consumption; deferred fencing trigger removed; no new worker grants.');
 }catch(error){await owner.query('ROLLBACK');throw error;}
}finally{await owner.end();}
