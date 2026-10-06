import {retainedArchiveFixture} from './fixtures/retainedInputSupplyFixture.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {randomUUID,createHash} from 'node:crypto';
import {database} from './fixtures/localPublicationFixture.mjs';
import {retainedBlueMarlinFixture,retainedArtifact,refresh} from './fixtures/retainedBlueMarlinFixture.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
import {composeRetainedBlueMarlinV1} from '../durableObserve/retainedBlueMarlinComposition.mjs';
import {createRetainedInputStore,sealRetainedInputRecord,planControlledRetainedSupply,resolveControlledRetainedSupply,
 readRetainedReferenceSet,nativeRetainedArtifact,inspectRetainedSource,resolveExactCurrentReaderSupply} from '../durableObserve/retainedInputSupply.mjs';
import {bindCenterSstSpatial,captureBoundCenterSst,captureLiveChlorophyll} from '../scalarEvidenceHandoff.mjs';
import {encodeNormalizedCurrentHandoff} from '../normalizedEvidenceCapture.mjs';
import {SOURCE_NORMALIZATION_VERSION,SOURCE_NORMALIZATION_REFERENCE} from '../sourceNormalization.mjs';
import {verifyWorkerPrivileges} from '../durableObserve/privilegeManifest.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
const oldManifest=JSON.parse(fs.readFileSync(new URL('../durableObserve/retainedSupplyPrivilegeManifest.v1.json',import.meta.url),'utf8'));
test('P2 isolated PostgreSQL exact unadmitted supply',{skip:process.env.PELORA_CP09B_P2_LOCAL!=='1'},async t=>{
 const db=await database(),store=createRetainedInputStore({query:db.query}),run='controlled-p2-'+randomUUID();
 function unique(f){const id=run+'-'+randomUUID();function v(x){if(!x||typeof x!=='object')return;if(x.reference?.kind==='captured'&&Object.hasOwn(x,'content'))x.reference.referenceId=id+'-'+x.reference.referenceId;Object.values(x).forEach(v);}v(f);return refresh(f);}
 const f=unique(retainedBlueMarlinFixture(2)),plan=planControlledRetainedSupply(f,new Date().toISOString()),records=[];
 const rec=async(a,type='P1_EXACT_ARTIFACT',sourceClass='CONTROLLED_FIXTURE',metadata={fixtureOrigin:'CONTROLLED_SYNTHETIC',temporalSupport:null,receipt:null})=>sealRetainedInputRecord({type,sourceClass,artifact:a,metadata});
 async function protectedSnapshot(){return (await db.owner.query("SELECT n.nspname,p.proname,pg_get_functiondef(p.oid) AS definition,p.proacl::text AS grants FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname IN ('cp02','cp03','cp04','cp06','cp07','cp08','cp09') ORDER BY n.nspname,p.proname")).rows;}
 const before=await protectedSnapshot(),counts=(await db.owner.query('SELECT (SELECT count(*) FROM cp03.observations)::int AS observations,(SELECT count(*) FROM cp02.accepted)::int AS accepted,(SELECT count(*) FROM cp06.links)::int AS receipts')).rows[0];
 try{
 await t.test('exact UTF8 bytes, digest and all original references read back',async()=>{
  for(const a of plan.artifacts){const r=await rec(a);records.push(r);const stored=await store.retain(r);assert.equal(stored.status,'FOUND_VALIDATED');assert.equal(stored.recordText,exactJson(r));assert.equal(stored.digest,hash(Buffer.from(exactJson(r),'utf8')));assert.equal(exactJson(stored.record.artifact),exactJson(a));}
 });
 await t.test('complete stored set equals direct P1 including full adequacy/exclusions/ranking/evaluation',async()=>{
  const r=await resolveControlledRetainedSupply({referenceSet:plan.referenceSet,store});assert.equal(r.status,'CONTROLLED_SUPPLY_READY');assert.equal(exactJson(composeRetainedBlueMarlinV1(r.compositionInput)),exactJson(composeRetainedBlueMarlinV1(f)));
 });
 await t.test('versioned selection/binding reference set itself durably retained and read exactly',async()=>{
  const a=retainedArtifact(run+'-selection',plan.referenceSet),r=await rec(a,'REFERENCE_SET');await store.retain(r);
  const read=await readRetainedReferenceSet({reference:a.reference,store});assert.equal(exactJson(read.referenceSet),exactJson(plan.referenceSet));
 });
 await t.test('candidate/static parents derive from existing producers, without caller eligibility',async()=>{
  const e=f.entries[0],a=retainedArtifact(run+'-static',{version:'controlled-catalog-v1',candidate:e.candidate.content,staticParent:e.staticParent.content}),r=await rec(a,'STATIC_CONTEXT','RETAINED_SOURCE');
  assert.equal((await store.retain(r)).status,'FOUND_VALIDATED');assert.equal((await inspectRetainedSource({reference:a.reference,store,assessment:f.assessment})).status,'RETAINED_AUTHORITY_UNRESOLVED');
  const b=structuredClone(a);b.content.staticParent.bathymetry.depthMeters+=1;b.reference.sha256=hash(exactJson(b.content));await assert.rejects(()=>rec(b,'STATIC_CONTEXT','RETAINED_SOURCE'));
 });
 await t.test('identical duplicate retains original server retention timestamp',async()=>{const a=await store.read(records[0].artifact.reference),b=await store.retain(records[0]);assert.equal(b.retainedAt,a.retainedAt);assert.equal(b.recordText,a.recordText);});
 await t.test('two concurrent identical submissions reconcile one immutable record',async()=>{const a=retainedArtifact(run+'-concurrent',{availability:'unknown',value:-0}),r=await rec(a),both=await Promise.all([store.retain(r),store.retain(r)]);assert(both.every(x=>x.status==='FOUND_VALIDATED'));assert.equal(both[0].retainedAt,both[1].retainedAt);assert(Object.is(both[0].record.artifact.content.value,-0));});
 await t.test('concurrent conflicting same-identity content rejects loser without overwrite',async()=>{
  const a=retainedArtifact(run+'-conflict',{value:1}),b=retainedArtifact(run+'-conflict',{value:2}),both=await Promise.all([store.retain(await rec(a)),store.retain(await rec(b))]);assert.equal(both.filter(x=>x.status==='FOUND_VALIDATED').length,1);assert.equal(both.filter(x=>x.status==='CONFLICT_OR_CORRUPT').length,1);
 });
 await t.test('different content at identical target time stays distinct',async()=>{
  const a=retainedArtifact(run+'-vintage-a',{targetTime:f.assessment.assessmentAt,value:1}),b=retainedArtifact(run+'-vintage-b',{targetTime:f.assessment.assessmentAt,value:2});await store.retain(await rec(a));await store.retain(await rec(b));assert.notEqual((await store.read(a.reference)).recordText,(await store.read(b.reference)).recordText);
 });
 await t.test('transaction rollback leaves exact source absent and retry recoverable',async()=>{
  const connection=await db.pool.connect();try{const a=retainedArtifact(run+'-rollback',{value:-0}),r=await rec(a),txStore=createRetainedInputStore({query:(...args)=>connection.query(...args)});await connection.query('BEGIN');assert.equal((await txStore.retain(r)).status,'FOUND_VALIDATED');assert.equal((await store.read(a.reference)).status,'ABSENT');await connection.query('ROLLBACK');assert.equal((await store.read(a.reference)).status,'ABSENT');assert.equal((await store.retain(r)).status,'FOUND_VALIDATED');}finally{await connection.query('ROLLBACK');connection.release();}
 });
 await t.test('lost committed ACK reads exact authoritative winner with only one retain call',async()=>{
  const r=await rec(retainedArtifact(run+'-lost-ack',{value:3}));let writes=0;const uncertain=createRetainedInputStore({query:async(sql,args)=>{const v=await db.query(sql,args);if(sql.includes('.retain(')){writes++;throw Error('controlled-lost-ack');}return v;}});
  const recovered=await uncertain.retain(r);assert.equal(recovered.status,'FOUND_VALIDATED');assert.equal(recovered.reconciledUncertainWrite,true);assert.equal(writes,1);
 });
 await t.test('actual SST bound handoff bytes and source context round-trip unchanged',async()=>{
  const direct=composeRetainedBlueMarlinV1(f),p=structuredClone(f.entries[0].environment.content.sst.center.content.payload);delete p.source.availability;
  const spatial=await bindCenterSstSpatial(p,SOURCE_NORMALIZATION_VERSION,()=>direct.evaluations[0].ocean.sst.derived.spatialStructure);p.derived={spatialStructure:spatial};
  const payload=captureBoundCenterSst(p,spatial,[SOURCE_NORMALIZATION_REFERENCE]),a=nativeRetainedArtifact('SCALAR_HANDOFF',{format:'SCALAR_HANDOFF',family:'SST',payload}),r=await rec(a,'SCALAR_HANDOFF','RETAINED_SOURCE');await store.retain(r);
  const found=await store.read(a.reference);assert.equal(found.record.artifact.content.payload.captureText,payload.captureText);assert.equal(found.record.artifact.content.payload.contextText,payload.contextText);assert.equal(found.admission,'NOT_SCIENTIFICALLY_ADMITTED');
 });
 await t.test('DIRECT/GAP_FILLED native scalar lineage is separate; late receipt/support unknown preserved',async()=>{
  const refs=[];for(const [name,family] of [['direct','CHLOROPHYLL_DIRECT'],['gapFilled','CHLOROPHYLL_GAP_FILLED']]){
   const payload=captureLiveChlorophyll(f.entries[0].environment.content.chlorophyll[name].content.payload,[SOURCE_NORMALIZATION_REFERENCE]),a=nativeRetainedArtifact('SCALAR_HANDOFF',{format:'SCALAR_HANDOFF',family,payload});refs.push(a.reference);
   const prior=await store.read(a.reference);const r=prior.status==='FOUND_VALIDATED'?prior.record:await rec(a,'SCALAR_HANDOFF','RETAINED_SOURCE',{fixtureOrigin:'CONTROLLED_SYNTHETIC',modelRun:null,productRevision:null,temporalSupport:null,receipt:{status:'NOT_RECEIVED_BY_ASSESSMENT',receivedAt:new Date().toISOString()}});assert.equal((await store.retain(r)).status,'FOUND_VALIDATED');
   const s=await inspectRetainedSource({reference:a.reference,store,assessment:f.assessment});assert.equal(s.status,'RETAINED_AUTHORITY_UNRESOLVED');assert.equal(s.record.metadata.temporalSupport,null);assert.equal(s.compositionInput,null);
  }assert.notEqual(refs[0].referenceId,refs[1].referenceId);
 });
 await t.test('current handoff signed zero and later assessment leave source bytes untouched',async()=>{
  const p=structuredClone(f.entries[0].environment.content.currents.center.content.payload);p.eastwardMetersPerSecond=-0;const payload=encodeNormalizedCurrentHandoff(p,SOURCE_NORMALIZATION_VERSION),a=nativeRetainedArtifact('CURRENT_HANDOFF',{format:'CURRENT_HANDOFF',family:'CURRENTS',payload});await store.retain(await rec(a,'CURRENT_HANDOFF','RETAINED_SOURCE'));
  const before=await store.read(a.reference),s=await inspectRetainedSource({reference:a.reference,store,assessment:{...f.assessment,assessmentAt:'2026-09-28T04:00:00.000Z'}});assert(Object.is(s.sourcePoint.eastwardMetersPerSecond,-0));assert.equal(s.sourcePoint.ageHours,4);assert.equal(s.assessmentProjection.ageHours,100);assert.equal((await store.read(a.reference)).recordText,before.recordText);
 });
 await t.test('existing Frame/archive bytes retain their own representation without lossy scalar conversion',async()=>{
  const content=await retainedArchiveFixture(run+'-frame'),a=nativeRetainedArtifact('FRAME_ARCHIVE',content),r=await rec(a,'FRAME_ARCHIVE','RETAINED_SOURCE');const stored=await store.retain(r);
  assert.equal(stored.status,'FOUND_VALIDATED');assert.equal(stored.record.artifact.content.frameJson,content.frameJson);assert.equal(stored.record.artifact.content.receipt.archiveId,content.receipt.archiveId);
  assert.equal((await inspectRetainedSource({store,reference:a.reference,assessment:f.assessment})).sourcePoint,null);
 });
 await t.test('scalar signed zero round trip does not pass through jsonb numeric storage',async()=>{
  const p=structuredClone(f.entries[0].environment.content.chlorophyll.gapFilled.content.payload);p.concentrationMgM3=-0;
  const payload=captureLiveChlorophyll(p,[SOURCE_NORMALIZATION_REFERENCE]),a=nativeRetainedArtifact('SCALAR_HANDOFF',{format:'SCALAR_HANDOFF',family:'CHLOROPHYLL_GAP_FILLED',payload});assert.equal((await store.retain(await rec(a,'SCALAR_HANDOFF','RETAINED_SOURCE'))).status,'FOUND_VALIDATED');
  const s=await inspectRetainedSource({reference:a.reference,store,assessment:f.assessment});assert(Object.is(s.sourcePoint.concentrationMgM3,-0));assert.equal(s.record.artifact.content.payload.captureText,payload.captureText);
 });
 await t.test('tampered raw stored text fails closed; owner exercise rolls back',async()=>{
  await db.owner.query('BEGIN');try{await db.owner.query('ALTER TABLE cp09b_supply.artifacts DISABLE TRIGGER immutable');await db.owner.query('UPDATE cp09b_supply.artifacts SET record_text=record_text||$2,digest=encode(sha256(convert_to(record_text||$2,\'UTF8\')),\'hex\') WHERE identity=$1',[records[0].identity,' ']);const r=await createRetainedInputStore({query:(...args)=>db.owner.query(...args)}).read(records[0].artifact.reference);assert.equal(r.status,'CONFLICT_OR_CORRUPT');}finally{await db.owner.query('ROLLBACK');}
 });
 await t.test('wrong requested reference hash is a conflict rather than fallback selection',async()=>{assert.equal((await store.read({...records[0].artifact.reference,sha256:'0'.repeat(64)})).status,'CONFLICT_OR_CORRUPT');});
 await t.test('worker cannot mutate immutable retention or any accepted records',async()=>{
  for(const sql of ['SELECT * FROM cp09b_supply.artifacts','INSERT INTO cp09b_supply.artifacts(identity,record_text,digest) VALUES (\'x\',\'x\',\'x\')','UPDATE cp09b_supply.artifacts SET digest=\'x\'','DELETE FROM cp09b_supply.artifacts','UPDATE cp03.evidence SET capture_text=capture_text','DELETE FROM cp03.observations','DELETE FROM cp09.jobs'])await assert.rejects(()=>db.query(sql),e=>e.code==='42501');
 });
 await t.test('worker cannot own, alter, replace, create schema, or grant privileged routines',async()=>{
  for(const sql of ['CREATE TABLE cp09b_supply.unauthorized(x int)','ALTER FUNCTION cp09b_supply.read_exact(text) OWNER TO pelora_cp02_worker','CREATE OR REPLACE FUNCTION cp09b_supply.read_exact(text) RETURNS jsonb LANGUAGE sql AS $$SELECT null::jsonb$$','ALTER TABLE cp09b_supply.artifacts DISABLE TRIGGER immutable','CREATE SCHEMA unauthorized_p2','SET ROLE pelora_cp02_owner'])await assert.rejects(()=>db.query(sql),e=>e.code==='42501');
 });
 await t.test('exact new privilege surface and safe resolution; PUBLIC has no execution',async()=>{
  const s=(await db.owner.query("SELECT n.nspname,pg_get_userbyid(n.nspowner) AS owner,has_schema_privilege('pelora_cp02_worker',n.oid,'USAGE') AS usage,has_schema_privilege('pelora_cp02_worker',n.oid,'CREATE') AS create FROM pg_namespace n WHERE n.nspname='cp09b_supply'")).rows[0];assert.equal(s.owner,'pelora_cp02_owner');assert.equal(s.usage,true);assert.equal(s.create,false);
  const routines=(await db.owner.query("SELECT p.proname,p.prosecdef,p.proconfig,pg_get_userbyid(p.proowner) AS owner,has_function_privilege('pelora_cp02_worker',p.oid,'EXECUTE') AS worker,EXISTS(SELECT 1 FROM aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a WHERE a.grantee=0 AND a.privilege_type='EXECUTE') AS public FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='cp09b_supply' ORDER BY p.proname")).rows;
  assert.deepEqual(routines.map(x=>x.proname),['read_exact','retain']);for(const r of routines){assert(r.prosecdef);assert.deepEqual(r.proconfig,['search_path=pg_catalog']);assert.equal(r.owner,'pelora_cp02_owner');assert(r.worker);assert.equal(r.public,false);}
  const privileges=(await db.owner.query("SELECT has_table_privilege('pelora_cp02_worker','cp09b_supply.artifacts',$1) AS allowed",['SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'])).rows[0];assert.equal(privileges.allowed,false);
  await verifyWorkerPrivileges((...args)=>db.owner.query(...args),oldManifest);
 });
 await t.test('new unadmitted artifacts cannot appear in accepted/current lookup; existing records/routines intact',async()=>{
  assert.deepEqual((await db.owner.query('SELECT (SELECT count(*) FROM cp03.observations)::int AS observations,(SELECT count(*) FROM cp02.accepted)::int AS accepted,(SELECT count(*) FROM cp06.links)::int AS receipts')).rows[0],counts);assert.deepEqual(await protectedSnapshot(),before);
 });
 await t.test('exact existing accepted CURRENTS uses bounded CP07 and refuses native-cell equivalence',async()=>{
  const row=(await db.owner.query('SELECT r.context->\'manifest\' AS manifest,j.job->>\'cellKey\' AS cell_key,a.job_id FROM cp02.accepted a JOIN cp02.jobs j USING(job_id) JOIN cp02.registry r USING(manifest_id) ORDER BY a.accepted_at DESC LIMIT 1')).rows[0];assert(row);
  const m=row.manifest;let calls=0;const at=new Date().toISOString(),r=await resolveExactCurrentReaderSupply({query:async(sql,args)=>{assert(sql.startsWith('SELECT cp07.read_scope('));calls++;return db.query(sql,args);},clock:{now:()=>at},
   request:{scope:{manifestDigest:m.digest,region:m.region,product:{family:m.product.family,provider:m.product.provider,dataset:m.product.dataset,productId:m.product.productId},cellKey:row.cell_key},queryContext:'historical',targetTime:at,sourceTime:{from:'2020-01-01T00:00:00.000Z',until:'2030-01-01T00:00:00.000Z'},maxObservations:20},observationId:row.job_id,requestedCoordinates:[0,0]});
  assert.equal(calls,1);assert.equal(r.status,'RETAINED_AUTHORITY_UNRESOLVED');assert.equal(r.observation.observationId,row.job_id);assert.notEqual(r.observation.evidence.point.requestedLatitude,0);assert.deepEqual(r.requestedCoordinates,[0,0]);assert.equal(r.compositionInput,null);
 });
 }finally{await db.close();}
});
