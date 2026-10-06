import {createHash} from 'node:crypto';
import {check,same} from '../observe/canonical.mjs';

// Read-only drift verifier. Uses migration authority for complete catalogs;
// runtime EXECUTE/DML denial is also exercised with the real worker in tests.
export async function verifyWorkerPrivileges(query,manifest){
 const hash=v=>createHash('sha256').update(v).digest('hex');
 const role=manifest.workerRole,owner=manifest.migrationOwner,schemas=manifest.protectedSchemas;
 const attributes=(await query('SELECT rolsuper,rolcreatedb,rolcreaterole,rolbypassrls,rolreplication,rolinherit,rolcanlogin FROM pg_roles WHERE rolname=$1',[role])).rows[0];
 check(same(attributes,manifest.workerAttributes),'privilege-role-drift');
 check((await query('SELECT count(*)::int AS n FROM pg_auth_members WHERE member=(SELECT oid FROM pg_roles WHERE rolname=$1)',[role])).rows[0].n===0,'privilege-membership-drift');
 const databases=(await query("SELECT datname,pg_get_userbyid(datdba) AS owner,has_database_privilege($1,oid,'CONNECT') AS connect,has_database_privilege($1,oid,'CREATE') AS create,has_database_privilege($1,oid,'TEMP') AS temp FROM pg_database ORDER BY datname",[role])).rows;
 for(const d of databases)check(d.owner!==role&&!d.create&&!d.temp&&d.connect===(d.datname===manifest.database),'privilege-database-drift');
 const schemaRows=(await query('SELECT nspname,pg_get_userbyid(nspowner) AS owner,has_schema_privilege($1,oid,\'USAGE\') AS usage,has_schema_privilege($1,oid,\'CREATE\') AS create FROM pg_namespace ORDER BY nspname',[role])).rows;
 for(const s of schemaRows){check(s.owner!==role&&!s.create,'privilege-schema-drift');if(schemas.includes(s.nspname))check(s.owner===owner&&s.usage,'privilege-protected-schema-drift');if(s.nspname==='public')check(!s.usage,'privilege-public-schema-drift');}
 const objects=(await query("SELECT n.nspname||'.'||c.relname AS name,c.relkind,pg_get_userbyid(c.relowner) AS owner,CASE WHEN c.relkind='S' THEN has_sequence_privilege($1,c.oid,'USAGE,SELECT,UPDATE') ELSE has_table_privilege($1,c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN') END AS accessible FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=ANY($2) AND c.relkind IN ('r','p','v','m','S') ORDER BY name",[role,[...schemas,'public']])).rows;
 check(same(objects.map(o=>o.name),manifest.protectedTables),'privilege-object-inventory-drift');
 for(const o of objects)check(o.owner===owner&&!o.accessible&&o.relkind==='r','privilege-table-drift');
 const routines=(await query("SELECT p.oid::regprocedure::text AS name,pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.proconfig,p.prosrc,has_function_privilege($1,p.oid,'EXECUTE') AS execute,EXISTS(SELECT 1 FROM aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a WHERE a.grantee=0 AND a.privilege_type='EXECUTE') AS public_execute FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname=ANY($2) ORDER BY name",[role,[...schemas,'public']])).rows;
 check(same(routines.map(r=>r.name),manifest.routines.map(r=>r.name)),'privilege-routine-inventory-drift');
 for(let i=0;i<routines.length;i++){const r=routines[i],expected=manifest.routines[i];
  check(r.owner===owner&&!r.public_execute&&r.execute===expected.workerExecute&&r.prosecdef===expected.securityDefiner&&same(r.proconfig,['search_path=pg_catalog'])&&hash(r.prosrc.trim())===expected.bodySha256,'privilege-routine-drift');
 }
 for(const name of manifest.creationRoles){
  check((await query("SELECT EXISTS(SELECT 1 FROM pg_default_acl WHERE defaclrole=(SELECT oid FROM pg_roles WHERE rolname=$1) AND defaclnamespace=0 AND defaclobjtype='f' AND NOT EXISTS(SELECT 1 FROM aclexplode(defaclacl) a WHERE a.grantee=0 AND a.privilege_type='EXECUTE')) AS denied",[name])).rows[0].denied,'privilege-default-function-drift');
  check((await query("SELECT count(*)::int AS n FROM pg_default_acl d, LATERAL aclexplode(d.defaclacl) a WHERE d.defaclrole=(SELECT oid FROM pg_roles WHERE rolname=$1) AND a.grantee IN (0,(SELECT oid FROM pg_roles WHERE rolname=$2))",[name,role])).rows[0].n===0,'privilege-default-grant-drift');
 }
 const platform=(await query("SELECT format('%I.%I(%s)',n.nspname,p.proname,oidvectortypes(p.proargtypes)) AS name,has_function_privilege($1,p.oid,'EXECUTE') AS execute FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='pg_catalog' AND (p.proname LIKE 'lo\\_%' ESCAPE '\\' OR p.proname IN ('loread','lowrite')) ORDER BY name",[role])).rows;
 check(same(platform.map(p=>p.name),manifest.deniedLargeObjectRoutines)&&platform.every(p=>!p.execute),'privilege-platform-write-drift');
 check((await query("SELECT count(*)::int AS n FROM pg_trigger WHERE tgrelid='cp02.accepted'::regclass AND tgname='fenced_acceptance'")).rows[0].n===0,'privilege-deferred-authority-present');
 check((await query("SELECT to_regprocedure('cp02.fenced_commit()') IS NULL AS removed")).rows[0].removed,'privilege-old-authority-present');
 const triggers=(await query("SELECT n.nspname||'.'||c.relname||':'||t.tgname AS name,t.tgenabled,t.tgdeferrable FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=ANY($1) AND NOT t.tgisinternal ORDER BY name",[schemas])).rows;
 check(same(triggers.map(t=>t.name),manifest.requiredTriggers),'privilege-trigger-inventory-drift');
 for(const t of triggers)check(t.tgenabled==='O'&&!t.tgdeferrable,'privilege-trigger-drift');
 check((await query("SELECT count(*)::int AS n FROM cp02.ownership o FULL JOIN cp02.accepted d USING(job_id) WHERE (d.job_id IS NULL AND o.consumed_at IS NOT NULL) OR (d.job_id IS NOT NULL AND (o.token IS DISTINCT FROM d.token OR o.consumed_at IS DISTINCT FROM d.accepted_at OR NOT o.released))")).rows[0].n===0,'privilege-terminal-integrity-drift');
 return {status:'PASS',workerRole:role,runtimeExecute:routines.filter(r=>r.execute).map(r=>r.name),protectedTables:objects.length,triggerCount:triggers.length};
}
