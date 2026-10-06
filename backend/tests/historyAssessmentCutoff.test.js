import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';
import {sourceRows,resolve,frame,observation,sstQualificationView,publication,at,context,encoded,cutoffCases} from './fixtures/historyAssessmentCutoffFixture.mjs';
import {requireScientificAssessmentV1,resolveScientificAssessmentV1,scientificAgeHoursV1,withScientificAssessmentV1} from '../scientificAssessment.mjs';
import {normalizeOceanProductFrameV1} from '../../shared/oceanProductFrame.mjs';
import {freezeEvidenceV1,assessmentContextV3,freezeScientificHistoryV1} from '../../shared/oceanPublication.mjs';
import {buildSeaSurfaceTemperaturePersistence,buildCurrentPersistence} from '../server.js';
const evidence={support:[],chlorophyll:[],availability:[]};
test('actual production resolver chain reproduces future represented-row admission',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]),r=await resolve(rows),assessmentAt='2026-09-23T12:00:00Z';assert.equal(r.adapted.length,2);assert.equal(r.selected.historicalSnapshots.length,2);assert(r.results.productivity.available);assert(r.results.productivity.values.lastObservedAt>assessmentAt);evidence.future={assessmentAt,query:r.query,selected:r.series.historicalSnapshots.map(x=>({id:x.snapshot.identity.snapshotId,time:x.snapshot.metadata.time.observedAt})),results:r.results};
});
test('explicit instant authority accepts before and equal, rejects after without tolerance',()=>{
 assert.equal(scientificAgeHoursV1(at(-1),context(0)),1);assert.equal(scientificAgeHoursV1(at(0),context(0)),0);assert.throws(()=>scientificAgeHoursV1(at(1),context(0)));assert.throws(()=>scientificAgeHoursV1('2026-09-24T00:00:00.001Z',context(0)));
});
test('qualified synthetic instant SST view retains two points and rejects future or same-support revisions',()=>{
 const pair=h=>{const f=frame(h);return {frame:f,observation:observation(f)};};const rows=sstQualificationView([pair(-1),pair(0)],context(0));const r=buildSeaSurfaceTemperaturePersistence({historicalSnapshots:rows});assert(r.available);assert.equal(r.values.durationHours,1);assert.throws(()=>sstQualificationView([pair(0),pair(1)],context(0)));const revision=frame(0,'corrected');assert.throws(()=>sstQualificationView([pair(0),{frame:revision,observation:observation(revision)}],context(0)));
});
test('interval and composite windows preserve support; no existing Frame assessment admission is implied',()=>{
 for(const kind of ['interval','composite-window'])for(const c of cutoffCases){const f=frame(-1);f.temporal.support={kind,start:c.start,end:c.end};const o=observation(f);assert.deepEqual(o.temporal.support,normalizeOceanProductFrameV1(f).temporal.support);assert.equal(Date.parse(c.end)<=Date.parse(at(0)),c.entireSupportNotFuture);evidence.support.push({kind,...c,frameAccepted:true,verdict:c.entireSupportNotFuture?'NECESSARY_REPRESENTED_BOUND_ONLY':'FAILS_NO_FUTURE_INFORMATION_PRINCIPLE',fullAdmissibility:'UNQUALIFIED_SUPPORT_AND_AVAILABILITY_POLICY'});}
});
test('publication envelope representedAt guard is not a support-end or known-as-of validator',()=>{
 const p=publication(0);for(const kind of ['interval','composite-window']){const entries=structuredClone(p.evidence.entries);entries[0].support={kind,start:at(-1),end:at(1)};assert.doesNotThrow(()=>freezeEvidenceV1(p.cycle,entries));}evidence.envelope='Straddling support accepted with representedAt at cutoff; declared policy flags are not product support qualification.';
});
test('publication availability metadata is preserved but nullable; late availability is not automatically rejected',()=>{
 for(const published of [at(-2),at(1),null]){const f=frame(-3);f.temporal.providerPublishedAt=published;f.temporal.acquiredAt=at(2);const o=observation(f);assert.equal(o.temporal.providerPublishedAt,published);evidence.availability.push({representedAt:o.temporal.observationTime,providerPublishedAt:published,acquiredAt:o.temporal.acquiredAt,frameAccepted:true,knownAsOfEstablished:false});}
});
test('same-support late revision has distinct source identity and cannot replace original as-used reference',()=>{
 const original=frame(-1,'original'),corrected=frame(-1,'corrected');original.temporal.providerPublishedAt=at(-1);corrected.temporal.providerPublishedAt=at(1);const saved=JSON.stringify(original),a=observation(original),b=observation(corrected);assert.notEqual(a.observationId,b.observationId);assert.equal(a.temporal.support.at,b.temporal.support.at);assert.equal(JSON.stringify(original),saved);
});
test('static context has no observation instant and is not an SST temporal sample',()=>{
 const f=frame();f.product.evidenceClass='STATIC_MODEL';f.temporal.support={kind:'static'};f.temporal.observationTime=null;const o=observation(f);assert.equal(o.temporal.observationTime,null);assert.throws(()=>sstQualificationView([{frame:f,observation:o}],context(0)));
});
test('missing selector assessment must not fall back to clock; outer request clock capture remains distinct',t=>{
 assert.throws(()=>requireScientificAssessmentV1(undefined));let calls=0;const hostile={contractVersion:'pelora-scientific-assessment-v1',get assessmentAt(){calls++;return at(0);}};assert.throws(()=>requireScientificAssessmentV1(hostile));assert.equal(calls,0);const clock=t.mock.method(Date,'now',()=>Date.parse(at(0)));const c=resolveScientificAssessmentV1();assert.equal(c.assessmentAt,at(0));clock.mock.restore();withScientificAssessmentV1(c,()=>assert.throws(()=>resolveScientificAssessmentV1(undefined)));
});
test('fixed explicit assessment has identical instant admission at later execution clocks',t=>{
 const clock=t.mock.method(Date,'now',()=>Date.parse('2099-01-01T00:00:00Z'));assert.equal(scientificAgeHoursV1(at(-1),context(0)),1);assert.throws(()=>scientificAgeHoursV1(at(1),context(0)));clock.mock.restore();
});
test('scheduled publication assessment is cycle time and future decision history is rejected',()=>{
 const p=publication(0),c=assessmentContextV3(p.cycle);assert.equal(c.assessmentAt,p.cycle.scheduledAt);const h={contractVersion:p.history.contractVersion,state:'AVAILABLE',asOf:at(0),reason:'synthetic',sourceReference:p.history.sourceReference,entries:[{candidateId:p.evaluation.candidateResults[0].candidateId,species:'blue-marlin',representedAt:at(-1),evaluatedAt:at(1),evaluationReference:p.evaluation.candidateResults[0].evaluationReference,opportunityId:null,continuityReference:null}]};assert.throws(()=>freezeScientificHistoryV1(p.cycle,h));h.entries[0].evaluatedAt=at(0);assert.doesNotThrow(()=>freezeScientificHistoryV1(p.cycle,h));
});
for(const family of ['direct','gap'])test(family+' overflow passes represented-instant cutoff but full as-of eligibility remains unresolved',async t=>{
 const {points,rows}=await sourceRows(t,family);const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'};for(const p of points)assert(scientificAgeHoursV1(p.observedAt,assessment)>=0);const r=await resolve(rows);for(const out of Object.values(r.results))assert.equal(out.values.concentrationChangeMgM3,-Infinity);evidence.chlorophyll.push({family,assessment,representedOnly:'STILL_REACHABLE_AFTER_CUTOFF',fullContract:'DEPENDS_ON_UNRESOLVED_POLICY',missing:['authoritative support/causal window','known-as-of availability and exact revision authority'],results:r.results});
});
test('envelope-only filter cannot prevent a later family evidence timestamp from reaching its consumer',async t=>{
 const {rows}=await sourceRows(t,'direct',[.3,.4]);const altered=JSON.parse(JSON.stringify(rows));altered[1].snapshot_payload.observation.evidence.groups.productivity.values.observedAt='2026-09-25T00:00:00Z';const r=await resolve(altered),assessmentAt='2026-09-24T01:00:00Z';assert(altered.every(x=>Date.parse(x.observed_at)<=Date.parse(assessmentAt)));assert.equal(r.adapted.length,2);assert(r.results.productivity.available);assert(r.results.productivity.values.lastObservedAt>assessmentAt);evidence.envelopeMismatch={assessmentAt,rowTimes:altered.map(x=>x.observed_at),familyTime:r.results.productivity.values.lastObservedAt,available:true,scope:'Malformed/inconsistent synthetic source row, not actual stored corruption'};
});
test('request carries explicit context into repaired private history handoff',()=>{
 const s=readFileSync(new URL('../server.js',import.meta.url),'utf8');assert(s.includes('const assessment=assessmentFromOptionsV1(options)'));const a=s.indexOf('const privateHistory = await',s.indexOf('async function getOceanConditionsAtAssessment')),b=s.indexOf('const oceanChangeFromTimeSeries',a);assert(s.slice(a,b).includes('collectPrivateOceanHistoryAtAssessment'));assert(s.slice(a,b).includes('assessment, context:historyContext'));
});
test('prior low-level SST/current overflow is not excluded solely by represented time; production remains unproven',()=>{
 const rows=[1e308,-1e308].map((value,i)=>({snapshot:{available:true,identity:{snapshotId:'synthetic-only-'+i},metadata:{time:{observedAt:at(i-2)}},observation:{observations:{sst:{temperatureFahrenheit:value},currents:{speedKnots:value,directionDegrees:90}}}}}));
 for(const row of rows)assert(scientificAgeHoursV1(row.snapshot.metadata.time.observedAt,context(0))>=0);
 assert.equal(buildSeaSurfaceTemperaturePersistence({historicalSnapshots:rows}).values.temperatureChangeFahrenheit,-Infinity);assert.equal(buildCurrentPersistence({historicalSnapshots:rows}).values.speedChangeKnots,-Infinity);evidence.siblings={representedOnly:'STILL_REACHABLE_AFTER_CUTOFF',fullContract:'DEPENDS_ON_UNRESOLVED_POLICY',production:'NOT_ESTABLISHED',limit:'Synthetic Fahrenheit/speed history; negative speed not default magnitude output.'};
});
test('write bounded contract diagnostics',()=>{writeFileSync('.local/ocean-quarantine/history-cutoff/evidence.json',JSON.stringify(encoded(evidence),null,2)+'\n');});
