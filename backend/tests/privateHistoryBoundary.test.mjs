import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {sourceRows as originalSourceRows,resolve} from './fixtures/consumerAwareHistorySelectionFixture.mjs';
async function sourceRows(...args){return structuredClone(await originalSourceRows(...args));}
import {collectPrivateOceanHistoryAtAssessment,getOceanConditionsAtAssessment,buildOceanPersistence,buildSeaSurfaceTemperaturePersistence,buildProductivityPersistence,buildClarityPersistence} from '../server.js';
import {controlledHistoryAuthorityV1,privateHistoryBoundarySummaryV1} from '../privateHistoryBoundary.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
const cutoff='2026-09-24T01:00:00.000Z';
const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:cutoff};
const context={scope:'PRIVATE_CURRENT_WORKFLOW_ONLY',latitude:25,longitude:-90};
const configuration={available:true,restUrl:'https://synthetic.invalid/rest/v1',credentials:{publishableKey:'synthetic-key'}};
const facts=rows=>rows.map(r=>({support:{kind:'instant',at:r.observed_at},possessedAt:r.observed_at,parentReference:{referenceId:'controlled-parent-'+r.snapshot_id,revision:'controlled-original'}}));
async function run(rows,{metadata=facts(rows),controlled=true,reply=rows,...args}={}){
 return collectPrivateOceanHistoryAtAssessment({assessment,context,configuration,bearerToken:'synthetic-owned-token',controlledAuthority:controlled?controlledHistoryAuthorityV1(rows,metadata):null,fetchImplementation:async()=>({ok:true,status:200,json:async()=>reply}),...args});
}
const selection=(r,name='buildProductivityPersistence')=>r.boundary.selections[name];
const reasons=(r,name)=>selection(r,name).decisions.map(x=>x.reason);
function retime(row,time){const x=structuredClone(row);x.observed_at=time;x.snapshot_payload.metadata.time.observedAt=time;x.snapshot_payload.observation.observedAt=time;return x;}
test('active private handoff independent of transport filter rejects baseline future row',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);const old=await resolve(rows);assert(old.results.productivity.available);
 const r=await run(rows,{assessment:{...assessment,assessmentAt:'2026-09-23T12:00:00.000Z'}});
 assert(reasons(r).includes('FUTURE_CONSUMED_EVIDENCE'));assert.equal(selection(r).inputs.length,1);assert.equal(buildProductivityPersistence({historicalSnapshots:selection(r).inputs}).available,false);
});
test('future preferred productivity leaf does not hide behind earlier envelope',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);rows[1].snapshot_payload.observation.evidence.groups.productivity.values.observedAt='2026-09-24T01:00:00.001Z';
 const r=await run(rows);assert.equal(selection(r).inputs.length,1);assert.equal(selection(r,'buildClarityPersistence').inputs.length,2);assert(reasons(r).includes('FUTURE_CONSUMED_EVIDENCE'));
});
test('future preferred clarity leaf is checked separately',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);rows[1].snapshot_payload.observation.evidence.groups.clarity.values.observedAt='2026-09-25T00:00:00Z';
 const r=await run(rows);assert.equal(selection(r,'buildClarityPersistence').inputs.length,1);assert.equal(selection(r).inputs.length,2);
});
for(const [label,time,allowed] of [['before','2026-09-24T00:59:59.999Z',true],['equal',cutoff,true],['after','2026-09-24T01:00:00.001Z',false]])test('authoritative controlled instant '+label+' cutoff',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);const x=retime(rows[1],time);const r=await run([rows[0],x]);assert.equal(selection(r).inputs.length,allowed?2:1);
});
for(const [kind,end,count] of [['interval',cutoff,2],['composite-window',cutoff,2],['interval','2026-09-24T01:00:00.001Z',1]])test(kind+' support end '+end,async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]),metadata=facts(rows);metadata[1].support={kind,start:rows[1].observed_at,end};const r=await run(rows,{metadata});assert.equal(selection(r).inputs.length,count);
});
test('unknown support passes necessary represented check but not admission',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]),metadata=facts(rows);metadata[1].support={kind:'unknown'};const r=await run(rows,{metadata});assert.equal(r.boundary.inspected[1].representedTimeCheck,'PASSED_NECESSARY_CHECK_ONLY');assert.equal(selection(r).inputs.length,1);assert(reasons(r).includes('UNKNOWN_TEMPORAL_SUPPORT'));
});
for(const possessedAt of [null,'2026-09-24T01:00:00.001Z'])test('unproven/late possession '+possessedAt,async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]),metadata=facts(rows);metadata[1].possessedAt=possessedAt;const r=await run(rows,{metadata});assert.equal(selection(r).inputs.length,1);assert.equal(r.boundary.admission,'NOT_OPERATIONALLY_ADMITTED');
});
test('legacy payload metadata and Booleans cannot establish authority',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);rows[0].sourceQualified=true;rows[0].support={kind:'instant',at:rows[0].observed_at};rows[0].possessedAt=rows[0].observed_at;
 const r=await run(rows,{controlled:false});assert.equal(selection(r).inputs.length,0);assert.equal(r.boundary.resolution.state,'UNRESOLVED');assert(reasons(r).includes('UNKNOWN_SUPPORT_AND_EXACT_VINTAGE_POSSESSION'));
});
test('missing or invalid explicit assessment fails before transport without clock',async()=>{
 let calls=0;for(const value of [undefined,null,{...assessment,assessmentAt:'bad'}])await assert.rejects(collectPrivateOceanHistoryAtAssessment({assessment:value,context,fetchImplementation:async()=>{calls++;throw Error('network');}}));assert.equal(calls,0);await assert.rejects(getOceanConditionsAtAssessment(25,-90,{}));
});
test('empty successful response is absent, never governed AVAILABLE-empty',async()=>{const r=await run([]);assert.equal(r.boundary.resolution.reason,'ABSENT_ROWS_NOT_GOVERNED_EMPTY');assert.equal(selection(r).state,'UNRESOLVED');});
test('failed transport is unavailable, not insufficient resolution',async()=>{const r=await run([],{fetchImplementation:async()=>{throw Error('controlled outage');}});assert.equal(r.boundary.resolution.state,'UNAVAILABLE');assert.equal(r.boundary.resolution.reason,'READ_FAILED_OR_SOURCE_UNAVAILABLE');assert.equal(selection(r).state,'UNAVAILABLE');});
test('malformed response and corrupt row are INVALID, not unavailable fallback',async t=>{
 const a=await run([],{reply:{rows:[]}});assert.equal(a.boundary.resolution.state,'INVALID');const primitive=await run([],{reply:[null]});assert.equal(primitive.boundary.resolution.state,'INVALID');
 const {rows}=await sourceRows(t,'direct',[.3,.4]);rows[0].snapshot_id='mismatch';const b=await run(rows);assert.equal(b.boundary.resolution.state,'INVALID');assert.equal(selection(b).state,'INVALID');assert.equal(selection(b).inputs.length,0);const {rows:native}=await sourceRows(t,'direct',[.3,.4]);native[0].snapshot_payload.observation.observations.currents={contractVersion:'corrupt-native-handoff'};const decoded=await run(native);assert.equal(decoded.boundary.resolution.state,'INVALID');assert.equal(selection(decoded).inputs.length,0);
});
test('valid insufficient controlled history is not transport failure or zero',async t=>{const {rows}=await sourceRows(t,'direct',[.3,.4]);const r=await run([rows[0]]);assert.equal(r.boundary.resolution.state,'CONTROLLED_RESOLVED');assert.equal(selection(r).state,'INSUFFICIENT');assert.equal(buildProductivityPersistence({historicalSnapshots:selection(r).inputs}).available,false);});
test('identical duplicates reuse once; conflicting duplicates invalidate before dedup',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);const a=await run([rows[0],rows[0],rows[1]]);assert.equal(selection(a).inputs.length,2);assert(reasons(a).includes('EXACT_DUPLICATE_REUSE'));
 const conflict=structuredClone(rows[0]);conflict.snapshot_payload.observation.evidence.groups.productivity.values.concentrationMgM3=.9;const b=await run([rows[0],conflict,rows[1]]);assert.equal(b.boundary.resolution.state,'INVALID');
});
test('same-target different revision is unresolved, never latest-wins',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);const changed=structuredClone(rows[1]);changed.snapshot_id+='-revision';changed.snapshot_payload.identity.snapshotId=changed.snapshot_id;const r=await run([rows[0],rows[1],changed]);assert(reasons(r).includes('SAME_TARGET_REVISION_SELECTION_UNRESOLVED'));assert.equal(selection(r).inputs.length,1);
});
test('exact selection snapshots resist caller mutation and later revision replay',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);const authority=controlledHistoryAuthorityV1(rows,facts(rows));const r=await run(rows,{controlledAuthority:authority}),before=exactJson(r.boundary);rows[1].snapshot_payload.observation.evidence.groups.productivity.values.concentrationMgM3=9;
 let reads=0;const replay=await collectPrivateOceanHistoryAtAssessment({assessment,context,replay:r.boundary,controlledAuthority:authority,fetchImplementation:async()=>{reads++;throw Error('must not reread');}});assert.equal(reads,0);assert.equal(exactJson(replay.boundary),before);assert.throws(()=>{r.boundary.returnedRows.push(rows[0]);});
 const bad=structuredClone(r.boundary);bad.selections.buildProductivityPersistence.inputs.reverse();await assert.rejects(collectPrivateOceanHistoryAtAssessment({assessment,context,replay:bad,controlledAuthority:authority}));
});
test('snapshot context detaches before asynchronous transport',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);const mutableContext={...context},mutableAssessment={...assessment};let release;const pending=collectPrivateOceanHistoryAtAssessment({assessment:mutableAssessment,context:mutableContext,configuration,bearerToken:'synthetic',fetchImplementation:()=>new Promise(resolve=>{release=()=>resolve({ok:true,status:200,json:async()=>rows});})});mutableContext.latitude=26;mutableAssessment.assessmentAt='2099-01-01T00:00:00Z';release();const r=await pending;assert.equal(r.boundary.context.latitude,25);assert.equal(r.boundary.assessment.assessmentAt,cutoff);
});
test('native payload/reference bytes and signed zero are retained unchanged',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);rows[0].snapshot_payload.observation.controlledSignedZero=-0;const before=exactJson(rows);const r=await run(rows);assert.equal(exactJson(r.boundary.returnedRows),before);assert(Object.is(r.boundary.returnedRows[0].snapshot_payload.observation.controlledSignedZero,-0));assert(Object.is(selection(r).inputs[0].snapshot.observation.controlledSignedZero,-0));
});
test('private summary excludes owned rows, identities, credentials and locations; shared scope rejected',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);const r=await run(rows),s=JSON.stringify(privateHistoryBoundarySummaryV1(r.boundary));for(const name of ['synthetic-owner','synthetic-owned-token','synthetic-key','latitude','longitude','snapshot_payload'])assert(!s.includes(name));await assert.rejects(run(rows,{context:{...context,scope:'SHARED_REGIONAL'}}));
});
test('controlled permitted selections reproduce exact existing scientific outputs',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);const baseline=await resolve(rows),r=await run(rows);
 for(const [name,fn] of [['buildProductivityPersistence',buildProductivityPersistence],['buildClarityPersistence',buildClarityPersistence],['buildSeaSurfaceTemperaturePersistence',buildSeaSurfaceTemperaturePersistence]])assert.deepEqual(fn({historicalSnapshots:selection(r,name).inputs}),fn({historicalSnapshots:baseline.series.historicalSnapshots}));
 assert.deepEqual(buildOceanPersistence({timeSeries:baseline.series}),buildOceanPersistence({timeSeries:baseline.series,historyBoundary:r.boundary}));
});
test('bounded page never implies complete history or approved lookback',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);const r=await run(Array.from({length:48},()=>rows[0]));assert.equal(r.boundary.resolution.state,'BOUNDED_TRUNCATION_POSSIBLE');assert.equal(r.boundary.resolution.completeScope,false);
});
test('real production request assembler uses repaired handoff with controlled transports',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);const old={url:process.env.SUPABASE_URL,key:process.env.SUPABASE_PUBLISHABLE_KEY,service:process.env.SUPABASE_SERVICE_ROLE_KEY};process.env.SUPABASE_URL='https://synthetic.invalid';process.env.SUPABASE_PUBLISHABLE_KEY='synthetic-key';delete process.env.SUPABASE_SERVICE_ROLE_KEY;t.after(()=>{for(const [name,value] of [['SUPABASE_URL',old.url],['SUPABASE_PUBLISHABLE_KEY',old.key],['SUPABASE_SERVICE_ROLE_KEY',old.service]])if(value===undefined)delete process.env[name];else process.env[name]=value;});
 t.mock.method(Date,'now',()=>Date.parse(cutoff));t.mock.method(globalThis,'fetch',async url=>{assert(!String(url).includes('synthetic.invalid'));return {ok:true,status:200,json:async()=>({latitude:25,longitude:-90,current:{time:'2026-09-24T00:00:00Z',sea_surface_temperature:26,wind_speed_10m:5,wave_height:1},table:{columnNames:['time','latitude','longitude','chlor_a','u_current','v_current'],rows:[['2026-09-24T00:00:00Z',25,-90,.3,.5,.2]]}})};});
 let request;const r=await getOceanConditionsAtAssessment(25,-90,{assessment,bearerToken:'synthetic',historyFetchImplementation:async url=>{request=new URL(url);return {ok:true,status:200,json:async()=>rows};}});
 assert.equal(request.searchParams.get('observed_at'),'lte.'+cutoff);assert.equal(r.diagnostics.oceanMemory.historyBoundary.admission,'NOT_OPERATIONALLY_ADMITTED');assert.equal(r.diagnostics.oceanMemory.historicalSnapshotCount,0);assert(Number.isFinite(r.sst.temperatureFahrenheit));assert.equal(r.diagnostics.oceanMemory.historyBoundary.consumers.buildProductivityPersistence.inputCount,0);
 const future=structuredClone(rows);future[1].snapshot_payload.observation.evidence.groups.productivity.values.observedAt='2026-09-24T01:00:00.001Z';
 const guarded=await getOceanConditionsAtAssessment(25,-90,{assessment,bearerToken:'synthetic',historyFetchImplementation:async()=>({ok:true,status:200,json:async()=>future})});
 assert(guarded.diagnostics.oceanMemory.historyBoundary.consumers.buildProductivityPersistence.reasons.includes('FUTURE_CONSUMED_EVIDENCE'));assert(Number.isFinite(guarded.sst.temperatureFahrenheit));
 const corruptNative=structuredClone(rows);corruptNative[0].snapshot_payload.observation.observations.currents={contractVersion:'corrupt-native-handoff'};
 for(const transport of [async()=>({ok:true,status:200,json:async()=>corruptNative}),async()=>{throw Error('controlled read outage');},async()=>({ok:true,status:200,json:async()=>({invalid:true})})]){const isolated=await getOceanConditionsAtAssessment(25,-90,{assessment,bearerToken:'synthetic',historyFetchImplementation:transport});assert(Number.isFinite(isolated.sst.temperatureFahrenheit));assert.equal(isolated.diagnostics.oceanMemory.historyBoundary.consumers.buildProductivityPersistence.inputCount,0);}
 const source=readFileSync(new URL('../server.js',import.meta.url),'utf8');assert(source.includes('const privateHistory = await collectPrivateOceanHistoryAtAssessment'));
});

test('valid retained no-data stays distinct from an absent record',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);for(const row of rows){row.snapshot_payload.observation.evidence.groups.productivity.available=false;row.snapshot_payload.observation.evidence.groups.productivity.values.concentrationMgM3=null;}
 const r=await run(rows);assert.equal(r.boundary.resolution.returnedCount,2);assert.equal(selection(r).inputs.length,2);assert.equal(selection(r).inputs[0].snapshot.observation.evidence.groups.productivity.values.concentrationMgM3,null);assert.equal(buildProductivityPersistence({historicalSnapshots:selection(r).inputs}).available,false);
});
test('spatial mismatch and mixed owned contexts fail closed',async t=>{const {rows}=await sourceRows(t,'direct',[.3,.4]);rows[0].latitude=26;const mismatch=await run(rows);assert.equal(mismatch.boundary.resolution.state,'INVALID');const {rows:other}=await sourceRows(t,'direct',[.3,.4]);other[1].user_id='different-synthetic-owner';assert.equal((await run(other)).boundary.resolution.state,'INVALID');});
test('new-process replay uses original input bytes with a later execution clock',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);const r=await run(rows);
 const script=`import fs from 'node:fs';import {collectPrivateOceanHistoryAtAssessment} from './backend/server.js';import {controlledHistoryAuthorityV1} from './backend/privateHistoryBoundary.mjs';import {exactJson} from './backend/exactScientificEvidence.mjs';const x=JSON.parse(fs.readFileSync(0,'utf8'));Date.now=()=>Date.parse('2099-01-01T00:00:00Z');const metadata=x.record.returnedRows.map(row=>({support:{kind:'instant',at:row.observed_at},possessedAt:row.observed_at,parentReference:{referenceId:'controlled-parent-'+row.snapshot_id,revision:'controlled-original'}}));const result=await collectPrivateOceanHistoryAtAssessment({assessment:x.assessment,context:x.context,replay:x.record,controlledAuthority:controlledHistoryAuthorityV1(x.record.returnedRows,metadata),fetchImplementation:()=>{throw Error('recollection forbidden');}});process.stdout.write(exactJson(result.boundary));`;
 const child=spawnSync(process.execPath,['--input-type=module','-e',script],{input:exactJson({record:r.boundary,assessment,context}),encoding:'utf8',windowsHide:true,maxBuffer:8e6});assert.equal(child.status,0,child.stderr);assert.equal(child.stdout,exactJson(r.boundary));
});
test('legacy replay cannot be forged into affirmative history by recomputing digests',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);const controlled=await run(rows);const record=structuredClone(controlled.boundary);record.mode='LEGACY_AUTHORITY_UNRESOLVED';await assert.rejects(collectPrivateOceanHistoryAtAssessment({assessment,context,replay:record}));await assert.rejects(getOceanConditionsAtAssessment(25,-90,{assessment,historyReplay:controlled.boundary}));
});
