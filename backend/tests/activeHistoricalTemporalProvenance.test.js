import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sourceRows,resolve,frame,observation,at,context,sstQualificationView,archiveIntent} from './fixtures/activeHistoricalTemporalProvenanceFixture.mjs';
import {planOceanArchiveWriteV1,oceanArchiveIdentityV1} from '../../shared/oceanProductArchive.mjs';
import {scientificAgeHoursV1} from '../scientificAssessment.mjs';
const source=p=>readFileSync(new URL(p,import.meta.url),'utf8');

test('locked active ledger remains 16 active, 2 documentary and 9 unwired',()=>{
 const r=JSON.parse(source('../../docs/Historical_Assessment_Cutoff_Contract_v1.json'));
 assert.equal(r.activeConsumers.length,16);assert.equal(r.documentaryConsumers.length,2);assert.equal(r.unwiredConsumers.length,9);
});
test('future represented row survives actual retrieval, adapter, selector and temporal consumer',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]),r=await resolve(rows);
 assert.equal(r.transportCalls,1);assert.equal(r.adapted.length,2);assert(r.results.productivity.available);
 assert(r.results.productivity.values.lastObservedAt>'2026-09-23T12:00:00Z');
});
test('late storage receipt is retained but not an as-of selection predicate',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);for(const r of rows)r.created_at=at(24);
 const r=await resolve(rows);assert.equal(r.selected.historicalSnapshots.length,2);assert(r.results.productivity.available);
 assert(rows.every(x=>Date.parse(x.observed_at)<=Date.parse(at(1))));
 assert(r.adapted.every(x=>Date.parse(x.storage.storedAt)>Date.parse(at(1))));
});
test('Frame represents future support despite earlier nominal observation',()=>{
 const f=frame(-2);f.temporal.support={kind:'composite-window',start:at(-3),end:at(1)};
 const o=observation(f);assert(o.temporal.observationTime<at(0));assert(o.temporal.support.end>at(0));
});
test('known late receipt and publication survive representation; instant fixture view does not govern availability',()=>{
 const pairs=[-2,-1].map(h=>{const f=frame(h);f.temporal.providerPublishedAt=at(1);f.temporal.acquiredAt=at(2);return {frame:f,observation:observation(f)};});
 assert.equal(sstQualificationView(pairs,context(0)).length,2);
 assert(pairs.every(p=>p.observation.temporal.acquiredAt>at(0)));
 // This view is explicitly synthetic qualification, not the default production resolver.
});
test('same support different exact revision has different identity without revision precedence',()=>{
 const a=frame(-1,'a'),b=frame(-1,'b');a.temporal.providerPublishedAt=at(-1);b.temporal.providerPublishedAt=at(1);
 assert.equal(a.temporal.support.at,b.temporal.support.at);assert.notEqual(observation(a).observationId,observation(b).observationId);
});
test('archive event time is not observation identity or proof of first availability',()=>{
 const f=frame(-1),a=planOceanArchiveWriteV1(f,archiveIntent(at(1))),b=planOceanArchiveWriteV1(f,archiveIntent(at(24)));
 assert.equal(a.status,'VALIDATED_NOT_ARCHIVED');assert.deepEqual(a.identity,b.identity);assert.notEqual(a.intent.archivedAt,b.intent.archivedAt);
 assert.deepEqual(oceanArchiveIdentityV1(f),a.identity);
});
test('acquisition metadata is digest-bound when in Frame, but a digest does not certify its clock',()=>{
 const a=frame(-1),b=structuredClone(a);b.temporal.acquiredAt=at(2);
 assert.notEqual(observation(a).observationId,observation(b).observationId);
 assert.equal(observation(b).temporal.acquiredAt,at(2));
});
for(const family of ['direct','gap'])test(family+' overflow history has represented times but lacks complete as-of authority',async t=>{
 const {points,rows}=await sourceRows(t,family),r=await resolve(rows);
 for(const p of points){assert(scientificAgeHoursV1(p.observedAt,context(1))>=0);assert(!Object.hasOwn(p,'providerPublishedAt'));assert(!Object.hasOwn(p,'acquiredAt'));}
 assert.equal(r.results.productivity.values.concentrationChangeMgM3,-Infinity);assert.equal(r.results.clarity.values.concentrationChangeMgM3,-Infinity);
 assert(r.results.productivity.available);assert.equal(r.results.productivity.confidence.score,60);
});
test('existing archive worker capability is receipt-bound but not a first-seen default history selector',()=>{
 const n=source('../oceanState/noaaSstSource.mjs'),w=source('../oceanState/sstWorker.mjs');
 assert(n.includes('acquiredAt: iso(receipt.completedAt)'));assert(n.includes('providerPublishedAt: null'));assert(n.includes('nominal-L4-time-known-exact-support-window-not-established'));
 assert(w.includes('first acquisition receipt'));assert(n.includes('completedAt: iso(completedAt)'));
});
test('repaired handoff has no operational admission resolver; cache timestamps remain operational',()=>{
 const s=source('../server.js'),start=s.indexOf('const privateHistory = await',s.indexOf('async function getOceanConditionsAtAssessment')),end=s.indexOf('const oceanChangeFromTimeSeries',start),block=s.slice(start,end);
 assert(start>0&&end>start);assert(block.includes('collectPrivateOceanHistoryAtAssessment'));assert(block.includes('assessment, context:historyContext'));for(const name of ['providerPublishedAt','acquiredAt'])assert(!block.includes(name));
 assert(s.includes('cached.cachedAt'));assert(s.includes('Date.now()'));assert(s.includes('row\n      ?.created_at')||s.includes('row\r\n      ?.created_at'));
});
test('storage default timestamp is not an enforced source-acquisition clock',()=>{
 const sql=source('../../supabase/migrations/20260802_ocean_snapshots_v1.sql').replace(/\s+/g,' ');
 const grants=source('../../supabase/migrations/20260925_client_privilege_hardening_v1.sql').replace(/\s+/g,' ');
 const row=source('../../frontend/src/lib/oceanMemoryStorageContract.js');
 assert(sql.includes('created_at timestamptz not null default now()'));assert(sql.includes("'historical-backfill'"));
 assert(grants.includes('grant select, insert on table public.ocean_snapshots'));
 assert(!row.includes('created_at:')); // Normal writer relies on DB default; no exact provider receipt added.
});
