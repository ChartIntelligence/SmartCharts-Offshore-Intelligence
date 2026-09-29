import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {sourceRows,resolve} from './fixtures/consumerAwareHistorySelectionFixture.mjs';
import {encoded} from './fixtures/chlorophyllTemporalDerivedFinitenessFixture.mjs';
const evidence={reachability:[],cutoff:null};
for(const family of ['direct','gap'])test(family+' finite endpoints cross actual storage response adapter/query/time-series boundary',async t=>{
 const {points,rows}=await sourceRows(t,family),r=await resolve(rows);
 assert.equal(r.transportCalls,1);assert.equal(r.adapted.length,2);assert.equal(r.series.historicalSnapshots.length,2);
 for(const output of Object.values(r.results)){assert.equal(output.available,true);assert.equal(output.values.concentrationChangeMgM3,-Infinity);assert.equal(output.confidence.score,60);}
 evidence.reachability.push({family,points,rows,result:r,boundary:'Conditional production resolver/selection reachability with synthetic database-transport source; not observed provider/database occurrence or shared-history qualification.'});
});
test('STOP: default history handoff admits represented evidence after assessment cutoff',async t=>{
 const assessmentAt='2026-09-23T12:00:00Z';const {rows}=await sourceRows(t,'direct',[.3,.4]);const r=await resolve(rows);
 assert.equal(r.series.historicalSnapshots.length,2);assert(r.results.productivity.values.lastObservedAt>assessmentAt);assert(r.results.productivity.available);
 const q=new URL(r.query);assert.equal(q.searchParams.get('order'),'observed_at.asc');assert.equal(q.searchParams.get('limit'),'48');assert.equal(q.searchParams.has('observed_at'),false);
 const source=readFileSync(new URL('../server.js',import.meta.url),'utf8');const a=source.indexOf('const oceanMemoryRowRetrieval =',source.indexOf('async function getOceanConditionsAtAssessment'));const b=source.indexOf('const oceanChangeFromTimeSeries',a);const flow=source.slice(a,b);assert(!flow.includes('observedBefore'));assert(!flow.includes('assessmentAt'));assert(flow.includes('buildHistoricalSnapshotQuery'));assert(flow.includes('buildOceanMemoryTimeSeries'));
 evidence.cutoff={assessmentAt,sourceFlow:flow,result:r,verdict:'ASSESSMENT_CUTOFF_NOT_ENFORCED_AT_PRODUCTION_HISTORY_BOUNDARY'};
});
test('missing synthetic bearer token fails retrieval closed without transport call',async t=>{const {rows}=await sourceRows(t,'direct',[.3,.4]);const r=await resolve(rows,{bearerToken:null});assert.equal(r.transportCalls,0);assert.equal(r.series.available,false);});
test('row metadata mismatch is rejected; valid repeated identity is deduplicated',async t=>{const {rows}=await sourceRows(t,'direct',[.3,.4]);const malformed=structuredClone(rows[0]);malformed.snapshot_id='mismatch';const r=await resolve([malformed,rows[0],rows[0],rows[1]]);assert.equal(r.adapted.length,3);assert.equal(r.series.historicalSnapshots.length,2);});
test('stored source distinction survives resolver but mixed history is not rejected by persistence',async t=>{const d=await sourceRows(t,'direct',[.3,.4]),g=await sourceRows(t,'gap',[.3,.4]);const r=await resolve([d.rows[0],g.rows[1]]);assert.equal(r.series.historicalSnapshots.length,2);assert(r.results.productivity.available);assert(r.results.clarity.available);evidence.mixed=r;});
test('write STOP diagnostic only to ignored scratch',()=>{writeFileSync('.local/ocean-quarantine/consumer-history/evidence.json',JSON.stringify(encoded(evidence),null,2)+'\n');});
