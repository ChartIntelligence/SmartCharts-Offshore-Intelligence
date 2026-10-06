import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import pg from 'pg';
import {fixtureInput,envelope,ref} from './fixtures/rankedPublicationFixture.mjs';
import {createPublicationStore,registerLocalPublicationContext} from '../durableObserve/publicationStore.mjs';
import {contextKey,serializeRankedPublication,byteHash,createRankedPublicationComposer} from '../durableObserve/publicationEnvelope.mjs';
import {createOceanStateReader} from '../durableObserve/oceanStateReader.mjs';
import {buildUnifiedSpeciesOpportunityInterpretationV1} from '../server.js';
import {cycleV2,freezeEvidenceV1} from '../../shared/oceanPublication.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
import {fork} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {postgresTransaction} from '../durableObserve/postgresPorts.mjs';
import {verifyWorkerPrivileges} from '../durableObserve/privilegeManifest.mjs';
test('CP-08 real PostgreSQL immutable publication qualification',{skip:process.env.PELORA_CP08_LOCAL!=='1'},async t=>{
 const root=path.join(process.env.LOCALAPPDATA,'Pelora/PostgreSQL/pelora_phase3_qualification'),read=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8'));
 const admin=read('credentials.json'),worker=read('worker-credentials.json');for(const c of [admin,worker])assert(c.host==='127.0.0.1'&&Number(c.port)===55432&&c.cluster==='pelora_phase3_qualification');
 const config=c=>({host:c.host,port:c.port,user:c.username,password:c.password,database:'pelora_phase3_qualification'}),owner=new pg.Client(config(admin)),pool=new pg.Pool({...config(worker),max:6});pool.on('error',()=>{});await owner.connect();
 const query=(...a)=>pool.query(...a),transaction=postgresTransaction(pool);let now=new Date().toISOString();const clock={now:()=>now};const store=createPublicationStore({query,transaction,clock});
 const scheduled=(()=>{const d=new Date();d.setUTCHours(Math.floor(d.getUTCHours()/4)*4,0,0,0);return d.toISOString();})();
 const input=(states,id='case-'+Date.now()+Math.random().toString(16).slice(2),at=scheduled)=>fixtureInput(states,at,id);
 const make=async x=>{await registerLocalPublicationContext(owner,x.context);return envelope(x);};
 let positive;
 try{
  await t.test('available and genuine governed-zero preserve exact producer/envelope bytes',async()=>{
   for(const states of [[{adequate:true,positive:true}],[{adequate:true,positive:false}]]){const p=await make(input(states));assert.deepEqual(await store.submit(p),p);assert.equal((await store.read({context:p.context,mode:'exact-cycle',scheduledAt:scheduled})).scientificState,p.producerBundle.evaluationState.state);positive??=p;}
  });
  await t.test('partial positive/zero and unavailable remain distinct even when operationally completed',async()=>{
   for(const [states,state] of [[[ {adequate:true,positive:true},'failed' ],'partial'],[[{adequate:true,positive:false},'failed'],'partial'],[[{adequate:false,positive:false}],'unavailable'],[[],'unavailable']]){const p=await make(input(states));await store.submit(p);const r=await store.read({context:p.context,mode:'current-cycle'});assert.equal(r.lifecycle,'completed');assert.equal(r.scientificState,state);}
  });
  await t.test('failed/delayed/running cycle retains status without borrowing previous successful history',async()=>{
   for(const lifecycle of ['failed','delayed','running']){const earlier=input([{adequate:true,positive:true}],undefined,new Date(Date.parse(scheduled)-4*3600000).toISOString()),p=await make(earlier);await store.submit(p);
    const current=input([{adequate:true,positive:true}]);current.context=earlier.context;current.cycle.region=earlier.context.region;current.lifecycle=lifecycle;const failed=await make(current);await store.submit(failed);
    const r=await store.read({context:p.context,mode:'current-cycle'});assert.equal(r.lifecycle,lifecycle);assert.equal(r.activePublication,null);assert.equal(r.scientificState,null);
    const history=await store.read({context:p.context,mode:'latest-successful-history'});assert.equal(history.record.versionId,p.versionId);assert.equal(history.historicalOnly,true);assert.equal(history.isCurrent,false);assert.equal(history.currentCycleStatus,lifecycle);
   }
  });
  await t.test('duplicate concurrent submission is identical and never inserts second authoritative version',async()=>{
   const values=await Promise.all(Array.from({length:4},()=>store.submit(positive)));for(const p of values)assert.deepEqual(p,positive);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp08.versions WHERE version_id=$1',[positive.versionId])).rows[0].n,1);
  });
  await t.test('actual CP-07 historical read is bound before evaluation; missing other science stays unavailable',async()=>{
   const {job_id}=(await owner.query("SELECT job_id FROM cp03.observations WHERE (timestamps->>'acceptedAt')::timestamptz<=$1 ORDER BY job_id LIMIT 1",[scheduled])).rows[0];
   const v=(await query('SELECT cp03.lookup($1) AS value',[job_id])).rows[0].value,m=v.context.manifest,selected=v.index.timestamps.selectedProviderTime;
   const reader=createOceanStateReader({query,clock:{now:()=>now}});
   const source=await reader.read({scope:{manifestDigest:m.digest,region:m.region,product:{family:m.product.family,provider:m.product.provider,dataset:m.product.dataset,productId:m.product.productId},cellKey:v.index.cell_key},queryContext:'historical',targetTime:scheduled,sourceTime:{from:selected,until:new Date(Date.parse(selected)+1).toISOString()},maxObservations:20});
   assert.equal(source.status,'OK');const x=input();x.context.region=m.region;x.cycle.region=m.region;x.cycle.configuration.families=['CURRENTS'];const observation=source.observations[0];
   const reference={kind:'captured',contractVersion:source.contractVersion,referenceId:'cp07-snapshot-'+byteHash(exactJson(source)),sha256:byteHash(exactJson(source))};
   x.artifacts=[{reference,content:source,receivedAt:observation?.acquisition.receivedAt??scheduled,assessmentCutoff:scheduled}];
   x.evidenceFreeze=freezeEvidenceV1(cycleV2(x.cycle),[{...x.evidenceFreeze.entries[0],family:'CURRENTS',status:observation?(observation.freshnessState==='fresh'?'AVAILABLE':'STALE'):'UNAVAILABLE',representedAt:observation?.observationTime??null,ageHours:observation?.age.hours??null,reference,qualification:{status:'UNKNOWN',policyReference:'cp07-source-not-requalified'},admissibility:{status:'UNASSESSED',policyReference:'cp08-no-science-redesign'}}]);
   const composer=await createRankedPublicationComposer({evaluate:async({binding,candidates,species},readEvidence)=>({binding,results:candidates.map(candidate=>{const used=readEvidence(reference,candidate.id);assert.deepEqual(used,source);return {candidate,status:'fulfilled',value:buildUnifiedSpeciesOpportunityInterpretationV1({assessment:{contractVersion:'pelora-scientific-assessment-v1',assessmentAt:binding.assessmentCutoff},candidate,species,oceanConditions:{currents:used.observations[0]?.evidence.point??null}})};})})});
   const p=await composer.compose(x);assert.equal(p.producerBundle.evaluationState.state,'unavailable');assert.deepEqual(p.producerBundle.inputsUsed[0].content,source);await registerLocalPublicationContext(owner,x.context);await store.submit(p);assert.deepEqual((await store.read({context:x.context,mode:'exact-cycle',scheduledAt:scheduled})).record,p);
   const bad=structuredClone(x);bad.artifacts[0].content.observations[0].evidence.point.speedKnots+=1;bad.artifacts[0].reference.sha256=byteHash(exactJson(bad.artifacts[0].content));bad.evidenceFreeze.entries[0].reference=bad.artifacts[0].reference;bad.evidenceFreeze=freezeEvidenceV1(cycleV2(bad.cycle),bad.evidenceFreeze.entries);await assert.rejects(composer.compose(bad));
  });
  await t.test('operational status revisions cannot replace a completed result without explicit correction',async()=>{
   const x=input();x.lifecycle='running';const a=await make(x);await store.submit(a);x.revision=2;x.parentId=a.versionId;x.action='STATUS';x.lifecycle='delayed';const b=await envelope(x);await store.submit(b);
   x.revision=3;x.parentId=b.versionId;x.lifecycle='completed';const c=await envelope(x);await store.submit(c);x.revision=4;x.parentId=c.versionId;x.lifecycle='failed';await assert.rejects(store.submit(await envelope(x)),/publication-explicit-correction-required/);
  });
  await t.test('conflicting same version and concurrent corrections fail closed; lineage remains explicit',async()=>{
   const x=input([{adequate:true,positive:false}]);x.context=positive.context;x.cycle=fixtureInput([{adequate:true,positive:false}],scheduled).cycle;x.cycle.region=positive.context.region;
   const conflict=await envelope(x);await assert.rejects(store.submit(conflict),/publication-version-conflict/);
   x.revision=2;x.parentId=positive.versionId;x.action='CORRECTION';const a=await envelope(x),b=await envelope({...x,reason:'alternative-correction'});
   const races=await Promise.allSettled([store.submit(a),store.submit(b)]);assert.equal(races.filter(r=>r.status==='fulfilled').length,1);assert.equal(races.filter(r=>r.status==='rejected').length,1);
   const winner=races.find(r=>r.status==='fulfilled').value;const r=await store.read({context:positive.context,mode:'current-cycle'});assert.equal(r.record.versionId,winner.versionId);assert.equal(r.record.parentId,positive.versionId);assert.equal(r.scientificState,'governed-zero');
   const withdraw=await envelope({...x,revision:3,parentId:winner.versionId,action:'WITHDRAWAL',lifecycle:'withdrawn',reason:'explicit-withdrawal'});await store.submit(withdraw);
   const removed=await store.read({context:positive.context,mode:'current-cycle'});assert.equal(removed.lifecycle,'withdrawn');assert.equal(removed.activePublication,null);assert.equal(removed.isCurrent,false);
   assert.equal((await owner.query('SELECT count(*)::int AS n FROM cp08.versions WHERE context_key=$1 AND cycle_at=$2',[contextKey(positive.context),scheduled])).rows[0].n,3);
  });
  await t.test('rollback after version/head write exposes no pending artifact; safe identical retry',async()=>{
   const p=await make(input([{adequate:true,positive:true}]));const rollback=createPublicationStore({query,clock,transaction:op=>transaction(async q=>{await op(q);throw Error('interrupted-before-commit');})});
   await assert.rejects(rollback.submit(p));assert.equal((await store.read({context:p.context,mode:'current-cycle'})).record,null);assert.deepEqual(await store.submit(p),p);
  });
  await t.test('lost commit ACK reconciles through authoritative exact read before any retry',async()=>{
   const p=await make(input([{adequate:true,positive:true}]));const unknown=createPublicationStore({query,clock,transaction:async op=>{await transaction(op);throw Error('lost-commit-ack');}});await assert.rejects(unknown.submit(p));
   const known=await store.read({context:p.context,mode:'exact-cycle',scheduledAt:scheduled});assert.equal(known.record.versionId,p.versionId);assert.deepEqual(await store.submit(p),p);
  });
  await t.test('killed writer rolls pending transaction back; killed committed writer reconciles exact bytes',async()=>{
   for(const commit of [false,true]){const p=await make(input());const child=fork(fileURLToPath(new URL('./fixtures/publicationCrashChild.mjs',import.meta.url)),[],{stdio:['ignore','ignore','ignore','ipc'],windowsHide:true});
    try{await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('crash-child-timeout')),10000);child.once('message',()=>{clearTimeout(timeout);resolve();});child.once('exit',()=>{clearTimeout(timeout);reject(Error('crash-child-early-exit'));});child.send({text:serializeRankedPublication(p),commit});});const exited=new Promise(resolve=>child.once('exit',resolve));child.kill();await exited;
     const before=await store.read({context:p.context,mode:'exact-cycle',scheduledAt:scheduled});assert.deepEqual(before.record,commit?p:null);assert.deepEqual(await store.submit(p),p);
    }finally{child.kill();}
   }
  });
  await t.test('publication/read time preserves frozen cutoff, source age, stale/live fields and missing receipt',async()=>{
   const p=await make(input([{adequate:true,positive:true}]));await store.submit(p);const a=await store.read({context:p.context,mode:'exact-cycle',scheduledAt:scheduled});now=new Date(Date.parse(now)+3600000).toISOString();const b=await store.read({context:p.context,mode:'exact-cycle',scheduledAt:scheduled});
   assert.deepEqual(b.record,a.record);assert.equal(b.sourceAgesAtRead[0].milliseconds-a.sourceAgesAtRead[0].milliseconds,3600000);assert.equal(b.record.producerBundle.inputsUsed[0].content.freshnessState,'stale');assert.equal(b.record.producerBundle.inputsUsed[0].content.receiptStatus,'AS_OF_AUTHORITY_UNKNOWN');now=new Date().toISOString();
  });
  await t.test('cross-context/species lookup and tampered publication reference cannot substitute a result',async()=>{
   const other=input([{adequate:true,positive:true}]);await registerLocalPublicationContext(owner,other.context);assert.equal((await store.read({context:other.context,mode:'current-cycle'})).record,null);
   await assert.rejects(store.read({context:{...other.context,species:'yellowfin'},mode:'current-cycle'}));
   const poison=createPublicationStore({clock,transaction,query:async(...a)=>{const r=await query(...a);if(r.rows[0].value?.recordText)r.rows[0].value.digest='0'.repeat(64);return r;}});await assert.rejects(poison.read({context:positive.context,mode:'current-cycle'}));
  });
  await t.test('worker minimal grants and immutable finalized versions remain enforced',async()=>{
   for(const table of ['contexts','versions','heads'])for(const sql of [`SELECT * FROM cp08.${table}`,`DELETE FROM cp08.${table}`,`TRUNCATE cp08.${table}`])await assert.rejects(query(sql),e=>e.code==='42501');
   await assert.rejects(query('CREATE TABLE cp08.forge(x int)'),e=>e.code==='42501');await assert.rejects(owner.query('UPDATE cp08.versions SET lifecycle=lifecycle'),/immutable-record/);
   const manifest=JSON.parse(fs.readFileSync(new URL('../durableObserve/publicationPrivilegeManifest.v1.json',import.meta.url)));assert.equal((await verifyWorkerPrivileges((...a)=>owner.query(...a),manifest)).status,'PASS');
  });
 }finally{await pool.end();await owner.end();}
});
