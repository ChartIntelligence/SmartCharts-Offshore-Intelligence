import test from 'node:test';
import assert from 'node:assert/strict';
import {probe,inputFor,frame,observation,at,context,witnessedFixture,conceptualAvailability,ref,
  captureCurrentEvidenceV2,currentCaptureReferenceV2,validateCurrentCaptureReferenceV2,syntheticSst} from './fixtures/remainingTemporalAuthorityFixture.mjs';

for(const route of ['sst','marine']) test(`${route}: default request does not pin scientific run or time format`,async t=>{
  const {requests}=await probe(t,route);
  const u=requests.find(u=>u.hostname==='marine-api.open-meteo.com');
  assert.equal(u.pathname,'/v1/marine'); assert.equal(u.searchParams.get('timezone'),'UTC');
  for(const name of ['models','run','initialization_time','timeformat','start_date','end_date']) assert.equal(u.searchParams.has(name),false);
});

test('same SST scientific content with different synthetic run metadata yields identical capture',async t=>{
  const a=(await probe(t,'sst',{model:'A',run:'run-A',initialization_time:at(0),revision:'A'})).point;
  const b=(await probe(t,'sst',{model:'B',run:'run-B',initialization_time:at(6),revision:'B'})).point;
  assert.deepEqual(a,b);
  assert.deepEqual(captureCurrentEvidenceV2(inputFor(a,'sst')),captureCurrentEvidenceV2(inputFor(b,'sst')));
});

test('changed SST values at same valid time have distinct exact content but no run attribution',async t=>{
  const a=(await probe(t,'sst',{current:syntheticSst(25),model:'A',run:'A'})).point;
  const b=(await probe(t,'sst',{current:syntheticSst(26),model:'B',run:'B'})).point;
  assert.equal(a.observedAt,b.observedAt); assert.deepEqual(a.source,b.source);
  const ca=captureCurrentEvidenceV2(inputFor(a,'sst')),cb=captureCurrentEvidenceV2(inputFor(b,'sst'));
  assert.notEqual(ca.scientificContentDigest,cb.scientificContentDigest);
  assert.throws(()=>validateCurrentCaptureReferenceV2(currentCaptureReferenceV2(ca),cb));
});

test('existing capture rejects an invented run field instead of silently extending schema',async t=>{
  const input=inputFor((await probe(t,'sst')).point,'sst');input.samples[0].point.modelRun='synthetic';
  assert.throws(()=>captureCurrentEvidenceV2(input));
});

test('existing reference lineage can distinguish authority without changing measured content',async t=>{
  const a=inputFor((await probe(t,'sst')).point,'sst');const b=structuredClone(a);
  b.lineageReferences=[ref('synthetic-different-authority')];
  const ca=captureCurrentEvidenceV2(a),cb=captureCurrentEvidenceV2(b);
  assert.equal(ca.scientificContentDigest,cb.scientificContentDigest); assert.notEqual(ca.captureId,cb.captureId);
});

for(const family of ['direct','gap']) test(`${family}: changed synthetic support/processing claims are not retained`,async t=>{
  const a=(await probe(t,family,{support_start:at(0),support_end:at(24),processing_version:'A',input_window:'A'})).point;
  const b=(await probe(t,family,{support_start:at(-24),support_end:at(48),processing_version:'B',input_window:'B'})).point;
  assert.deepEqual(a,b);assert.deepEqual(captureCurrentEvidenceV2(inputFor(a,family)),captureCurrentEvidenceV2(inputFor(b,family)));
});

test('GAP_FILLED capture retains reconstruction identity without asserting a deployed window',async t=>{
  const c=captureCurrentEvidenceV2(inputFor((await probe(t,'gap')).point,'gap'));
  const s=c.samples[0].point.source;
  assert.equal(s.algorithm,'DINEOF');assert.equal(s.observationType,'gap-filled-reconstruction');assert.equal(s.experimental,true);
  for(const k of ['algorithmVersion','inputWindow','supportStart','supportEnd','receivedAt'])assert.equal(Object.hasOwn(s,k),false);
});

test('same numeric endpoint and target never erase DIRECT versus GAP_FILLED identity',async t=>{
  const a=captureCurrentEvidenceV2(inputFor((await probe(t,'direct')).point,'direct'));
  const b=captureCurrentEvidenceV2(inputFor((await probe(t,'gap')).point,'gap'));
  assert.notEqual(a.scientificContentDigest,b.scientificContentDigest);
});

test('primitive identity distinguishes explicit product versions with equal state and support',()=>{
  const a=frame(); const b=structuredClone(a);b.product.productVersion='synthetic-second-version';
  assert.notDeepEqual(observation(a),observation(b));
});

test('primitive identity distinguishes supplied composite bounds at equal nominal time',()=>{
  const a=frame(12);a.temporal.support={kind:'composite-window',start:at(0),end:at(24)};
  const b=structuredClone(a);b.temporal.support.start=at(-24);
  assert.notDeepEqual(observation(a),observation(b));
});

test('unknown product support is preserved rather than manufactured from a noon label',()=>{
  const f=frame(12);f.temporal.support={kind:'unknown',reason:'product-authority-pending'};
  assert.equal(observation(f).temporal.support.kind,'unknown');
});

test('reconstruction target cannot substitute for exact pre-assessment receipt authority',async t=>{
  const r=currentCaptureReferenceV2(captureCurrentEvidenceV2(inputFor((await probe(t,'gap')).point,'gap')));
  const late=witnessedFixture(r,at(25));assert.equal(conceptualAvailability(late.record,r,context(14),late.witnesses),false);
  const early=witnessedFixture(r,at(13));assert.equal(conceptualAvailability(early.record,r,context(14),early.witnesses),true);
});
