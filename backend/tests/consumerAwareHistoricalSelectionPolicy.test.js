import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';
import * as science from '../server.js';
import {captureCurrentEvidenceV2,currentCaptureReferenceV2} from '../currentEvidenceCaptureV2.mjs';
import {witnessedFixture,conceptualAvailability,at,context,captureFixture,sourceRows,resolve,captureInput,encoded,sstRow} from './fixtures/consumerAwareHistoricalSelectionPolicyFixture.mjs';
const prior=JSON.parse(readFileSync(new URL('../../docs/Active_Historical_Temporal_Provenance_v1.json',import.meta.url),'utf8'));
const evidence={insufficient:[],resolver:[],controls:{}};
// Necessary gate applied to each locked consumer's requirements. Does not invoke
// quarantined consumers or pretend to qualify their complete selection policy.
for(const c of prior.activeConsumers)test(c.name+': future exact revision fails required availability gate',()=>{
 const input=captureFixture();input.samples[0].point.observedAt=at(-2);const capture=captureCurrentEvidenceV2(input),ref=currentCaptureReferenceV2(capture),late=witnessedFixture(ref,at(1)),early=witnessedFixture(ref,at(-1));
 assert(!conceptualAvailability(late.record,ref,context(0),late.witnesses));assert(conceptualAvailability(early.record,ref,context(0),early.witnesses));
 assert.deepEqual(late.record.evidenceReference,early.record.evidenceReference);
});
test('repeated receipts are one exact identity, while equal-valued observations remain distinct',()=>{
 const a=captureCurrentEvidenceV2(captureFixture()),bInput=captureFixture();bInput.samples[0].point.observedAt=at(-1);const b=captureCurrentEvidenceV2(bInput),ar=currentCaptureReferenceV2(a),br=currentCaptureReferenceV2(b);
 const receipts=[witnessedFixture(ar,at(-1),'one'),witnessedFixture(ar,at(0),'two')];assert.equal(new Set(receipts.map(x=>JSON.stringify(x.record.evidenceReference))).size,1);assert.notDeepEqual(ar,br);
 const r=science.buildSeaSurfaceTemperaturePersistence({historicalSnapshots:[sstRow('a',-2),sstRow('b',-1)]});assert.equal(r.values.sampleCount,2);assert(r.available);
});
test('same-support revisions are not elapsed history; no preference inferred',()=>{
 const r=science.buildSeaSurfaceTemperaturePersistence({historicalSnapshots:[sstRow('a',-1,84),sstRow('b',-1,85)]});assert(!r.available);assert.equal(r.values.durationHours,0);
});
test('ordering and large gaps are calculable, not a newly qualified gap policy',()=>{
 const rows=[sstRow('before',-240),sstRow('after',0)],a=science.buildSeaSurfaceTemperaturePersistence({historicalSnapshots:rows}),b=science.buildSeaSurfaceTemperaturePersistence({historicalSnapshots:[...rows].reverse()});assert.deepEqual(a,b);assert(a.available);assert.equal(a.values.durationHours,240);evidence.controls.largeGap={available:a.available,durationHours:a.values.durationHours,scientificallyQualified:false};
});
test('unavailable and missing SST rows do not supply observations or manufactured zero',()=>{
 const unavailable=sstRow('outage',-1);unavailable.snapshot.available=false;const r=science.buildSeaSurfaceTemperaturePersistence({historicalSnapshots:[sstRow('a',-4),sstRow('missing',-3,null),unavailable,sstRow('b',0)]});assert.equal(r.values.sampleCount,2);assert.equal(r.values.temperatureChangeFahrenheit,0);
});
test('empty-history fail-closed outputs recorded for nonquarantined active consumers',()=>{
 for(const c of prior.activeConsumers){if(c.name==='buildCurrentConvergencePersistence')continue;const r=science[c.name]({});assert.equal(r.available,false,c.name);evidence.insufficient.push({consumer:c.name,output:r});}
 assert.equal(evidence.insufficient.length,15);
});
for(const family of ['direct','gap'])test(family+': faithful resolver then test-only availability exclusion before dependent arithmetic',async t=>{
 const {points,rows}=await sourceRows(t,family),r=await resolve(rows);assert.equal(r.series.historicalSnapshots.length,2);assert.equal(r.results.productivity.values.concentrationChangeMgM3,null);
 const captures=points.map(p=>captureCurrentEvidenceV2(captureInput(p,family))),refs=captures.map(currentCaptureReferenceV2);const witnesses=refs.map((ref,i)=>witnessedFixture(ref,at(i?2:-1),'receipt-'+i));
 // Fixture provenance explicitly binds each actual parser endpoint to its row;
 // this relation is synthetic and is NOT present in the current production row.
 for(let i=0;i<2;i++)assert.equal(rows[i].snapshot_payload.observation.observations.chlorophyll.concentrationMgM3,captures[i].samples[0].point.concentrationMgM3);
 const admission=witnesses.map((w,i)=>conceptualAvailability(w.record,refs[i],context(1),w.witnesses));assert.deepEqual(admission,[true,false]);
 const permitted=r.series.historicalSnapshots.filter((_,i)=>admission[i]);const after=science.buildProductivityPersistence({historicalSnapshots:permitted});assert.equal(after.available,false);assert.equal(after.values.sampleCount,1);assert.equal(after.values.concentrationChangeMgM3,null);assert.equal(after.confidence.score,0);
 evidence.resolver.push({family,baselineAvailable:r.results.productivity.available,baselineChange:r.results.productivity.values.concentrationChangeMgM3,receiptGate:admission,after,fullPolicyQualified:false,unresolved:['support','source/mixing','revision','gap/lookback','real issuer authority']});
});
test('unknown active support and selection authority remain blocking, not default instant',()=>{
 assert.equal(prior.activeConsumers.length,16);assert(prior.families.every(x=>x.support==='UNKNOWN'));assert(prior.policiesNotChosen.includes('lookback'));assert(prior.policiesNotChosen.includes('gap/outage'));
});
test('write diagnostics only to ignored scratch',()=>{writeFileSync('.local/ocean-quarantine/selection-policy/evidence.json',JSON.stringify(encoded(evidence),null,2)+'\n');});
