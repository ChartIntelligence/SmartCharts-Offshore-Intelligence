import test from 'node:test';
import assert from 'node:assert/strict';
import {probe,inputFor,syntheticSst,captureCurrentEvidenceV2,currentCaptureReferenceV2,validateCurrentCaptureReferenceV2,ref,at,context,witnessedFixture,conceptualAvailability,historicalSnapshot,adapt} from './fixtures/sstProvenanceGapFilledBindingFixture.mjs';

test('different exact SST content at equal location/time shares legacy snapshot ID',async t=>{
  const a=(await probe(t,'sst',{current:syntheticSst(25)})).point,b=(await probe(t,'sst',{current:syntheticSst(26)})).point;
  const sa=historicalSnapshot(a),sb=historicalSnapshot(b);assert(sa.available&&sb.available);
  assert.equal(sa.identity.snapshotId,sb.identity.snapshotId);
  assert.notEqual(sa.observation.observations.sst.temperatureFahrenheit,sb.observation.observations.sst.temperatureFahrenheit);
  assert.notEqual(captureCurrentEvidenceV2(inputFor(a,'sst')).captureId,captureCurrentEvidenceV2(inputFor(b,'sst')).captureId);
});

test('actual row adapter preserves competing payloads but does not add revision authority',async t=>{
  const a=adapt(historicalSnapshot((await probe(t,'sst',{current:syntheticSst(25)})).point));
  const b=adapt(historicalSnapshot((await probe(t,'sst',{current:syntheticSst(26)})).point));
  assert(a.available&&b.available); assert.equal(a.snapshot.identity.snapshotId,b.snapshot.identity.snapshotId);
  assert.notDeepEqual(a.snapshot.observation.observations.sst,b.snapshot.observation.observations.sst);
});

test('unknown model/run does not prevent exact capture replay identity',async t=>{
  const p=(await probe(t,'sst')).point; const c=captureCurrentEvidenceV2(inputFor(p,'sst'));
  assert.equal(Object.hasOwn(p.source,'model'),false); assert.equal(Object.hasOwn(p.source,'run'),false);
  assert.doesNotThrow(()=>validateCurrentCaptureReferenceV2(currentCaptureReferenceV2(c),c));
});

test('exact reference rejects same-time replacement SST content',async t=>{
  const a=captureCurrentEvidenceV2(inputFor((await probe(t,'sst',{current:syntheticSst(25)})).point,'sst'));
  const b=captureCurrentEvidenceV2(inputFor((await probe(t,'sst',{current:syntheticSst(26)})).point,'sst'));
  assert.throws(()=>validateCurrentCaptureReferenceV2(currentCaptureReferenceV2(a),b));
});

test('same retained SST content cannot recover two discarded upstream runs',async t=>{
  const a=(await probe(t,'sst',{model:'synthetic-A',run:'run-A'})).point;
  const b=(await probe(t,'sst',{model:'synthetic-B',run:'run-B'})).point;
  assert.deepEqual(a,b);assert.equal(historicalSnapshot(a).identity.snapshotId,historicalSnapshot(b).identity.snapshotId);
});

for(const [field,wrong] of [['observationType','direct-satellite'],['algorithm','OTHER'],['resolutionKilometers',4],['experimental',false]]){
  test(`GAP_FILLED capture requires exact existing ${field} marker`,async t=>{
    const input=inputFor((await probe(t,'gap')).point,'gap');
    const missing=structuredClone(input);delete missing.samples[0].point.source[field];assert.throws(()=>captureCurrentEvidenceV2(missing));
    const bad=structuredClone(input);bad.samples[0].point.source[field]=wrong;assert.throws(()=>captureCurrentEvidenceV2(bad));
    assert.doesNotThrow(()=>captureCurrentEvidenceV2(input));
  });
}

test('locally assigned GAP_FILLED markers do not authenticate injected provider versions/windows',async t=>{
  const a=(await probe(t,'gap',{algorithm:'A',processing_version:'A',input_window:'target-plus29'})).point;
  const b=(await probe(t,'gap',{algorithm:'B',processing_version:'B',input_window:'different'})).point;
  assert.deepEqual(a,b);assert.equal(a.source.algorithm,'DINEOF');
  assert.deepEqual(captureCurrentEvidenceV2(inputFor(a,'gap')),captureCurrentEvidenceV2(inputFor(b,'gap')));
});

test('GAP_FILLED request selects fixed dataset chlor_a last without version or window parameters',async t=>{
  const {requests}=await probe(t,'gap');assert.equal(requests.length,1);
  assert.equal(requests[0].pathname,'/erddap/griddap/nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily.json');
  assert(requests[0].search.includes('chlor_a'));assert(requests[0].search.includes('last'));
  assert(!/version|window|algorithm/.test(requests[0].search));
});

test('GAP_FILLED row target remains separate from unsupported bounds and receipt fields',async t=>{
  const p=(await probe(t,'gap',{supportStart:at(0),supportEnd:at(24),receivedAt:at(25)})).point;
  assert.equal(p.observedAt,'2026-09-24T12:00:00Z');
  for(const k of ['supportStart','supportEnd','receivedAt'])assert.equal(Object.hasOwn(p,k),false);
});

test('capture does not accept an invented algorithm version inside its locked source schema',async t=>{
  const i=inputFor((await probe(t,'gap')).point,'gap');i.samples[0].point.source.algorithmVersion='synthetic-v1';
  assert.throws(()=>captureCurrentEvidenceV2(i));
});

test('separate lineage changes capture identity without proving a real algorithm binding',async t=>{
  const a=inputFor((await probe(t,'gap')).point,'gap'),b=structuredClone(a);b.lineageReferences=[ref('synthetic-version-binding')];
  const ca=captureCurrentEvidenceV2(a),cb=captureCurrentEvidenceV2(b);
  assert.notEqual(ca.captureId,cb.captureId);assert.equal(ca.scientificContentDigest,cb.scientificContentDigest);
});

test('same-target reconstructed revisions cannot share receipt authority',async t=>{
  const a=currentCaptureReferenceV2(captureCurrentEvidenceV2(inputFor((await probe(t,'gap',{},.1)).point,'gap')));
  const b=currentCaptureReferenceV2(captureCurrentEvidenceV2(inputFor((await probe(t,'gap',{},.2)).point,'gap')));
  const receipt=witnessedFixture(a,at(13));assert(conceptualAvailability(receipt.record,a,context(14),receipt.witnesses));
  assert.throws(()=>conceptualAvailability(receipt.record,b,context(14),receipt.witnesses));
});

test('documented reconstruction target never overrides a late exact-content receipt',async t=>{
  const r=currentCaptureReferenceV2(captureCurrentEvidenceV2(inputFor((await probe(t,'gap')).point,'gap')));
  const late=witnessedFixture(r,at(25));assert.equal(conceptualAvailability(late.record,r,context(14),late.witnesses),false);
});
