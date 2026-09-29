import test from 'node:test';
import assert from 'node:assert/strict';
import {frame, observation, at, context, sstQualificationView, captureFixture, supports} from './fixtures/activeProductTemporalSupportFixture.mjs';
import {validateEnvironmentalObservationV1} from '../temporalEvidencePrimitives.mjs';
import {captureCurrentEvidenceV1} from '../currentEvidenceCapture.mjs';
import {captureCurrentEvidenceV2} from '../currentEvidenceCaptureV2.mjs';

for (const family of ['SST','CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED','CURRENTS']) {
  test(`${family}: exact captures preserve reported time without granting support`, () => {
    const input = captureFixture(family);
    for (const capture of [captureCurrentEvidenceV1, captureCurrentEvidenceV2]) {
      const result = capture(input);
      assert.equal(result.samples[0].point.observedAt, input.samples[0].point.observedAt);
      assert.equal(Object.hasOwn(result.samples[0].point, 'support'), false);
      const invented = structuredClone(input);
      invented.samples[0].point.support = supports[1];
      assert.throws(() => capture(invented));
    }
  });
}
for (const support of supports) {
  test(`Frame/sample preserves explicit ${support.kind}; structure is not product authority`, () => {
    const f = frame(); f.temporal.support = support;
    if (support.kind === 'static') f.temporal.observationTime = null;
    const o = observation(f);
    assert.deepEqual(o.temporal.support, support);
    assert.deepEqual(validateEnvironmentalObservationV1(o, f), o);
  });
}
for (const support of supports.filter(s => s.kind !== 'instant')) {
  test(`locked instant-only SST view rejects ${support.kind}`, () => {
    const f = frame(); f.temporal.support = support;
    if (support.kind === 'static') f.temporal.observationTime = null;
    assert.throws(() => sstQualificationView([{frame:f, observation:observation(f)}], context(24)));
  });
}
test('qualified synthetic instant view stays narrow; no persistence arithmetic executed', () => {
  const f = frame(); assert.equal(sstQualificationView([{frame:f, observation:observation(f)}], context(24)).length, 1);
});
test('support changes cannot be rebound to an old exact observation reference', () => {
  const f = frame(), o = observation(f), changed = structuredClone(f);
  changed.temporal.support = supports[1];
  assert.notEqual(observation(changed).observationId, o.observationId);
  assert.throws(() => validateEnvironmentalObservationV1(o, changed));
});
test('same time distinct revisions retain distinct exact identities', () => {
  const a = observation(frame(0,'A')), b = observation(frame(0,'B'));
  assert.deepEqual(a.temporal.support, b.temporal.support);
  assert.notEqual(a.observationId,b.observationId);
});
test('receipt/publication changes do not manufacture support', () => {
  const f = frame(); f.temporal.support = supports[4];
  f.temporal.acquiredAt = at(10); f.temporal.providerPublishedAt = at(5);
  const o = observation(f);
  assert.equal(o.temporal.support.kind,'unknown');
  assert.equal(o.temporal.observationTime,at(0));
});
test('nominal past time can coexist structurally with future interval support', () => {
  const f = frame(); f.temporal.support = {kind:'interval',start:at(-1),end:at(2)};
  const o = observation(f);
  assert(o.temporal.observationTime <= context(1).assessmentAt);
  assert(o.temporal.support.end > context(1).assessmentAt);
  assert.throws(() => sstQualificationView([{frame:f, observation:o}],context(1)));
});
test('overlapping synthetic composites are representable; no selection permission implied', () => {
  const a = frame(), b = frame(1);
  a.temporal.support = {kind:'composite-window',start:at(-2),end:at(0)};
  b.temporal.support = {kind:'composite-window',start:at(-1),end:at(1)};
  assert(observation(a).temporal.support.end > observation(b).temporal.support.start);
});
test('Frame interval validation requires strictly increasing bounds, not equality', () => {
  for (const end of [at(0),at(-1)]) {
    const f = frame(); f.temporal.support = {kind:'interval',start:at(0),end};
    assert.throws(() => observation(f));
  }
});
test('UTC/calendar authority cannot be inferred from ambiguous time text', () => {
  for (const at of ['2026-09-24T00:00:00','2026-02-30T00:00:00Z']) {
    const f = frame(); f.temporal.support = {kind:'instant',at};
    assert.throws(() => observation(f));
  }
});
test('instant/static support reject fabricated interval fields', () => {
  for (const kind of ['instant','static']) {
    const f = frame(); f.temporal.support = {kind,start:at(0),end:at(1),...(kind==='instant'?{at:at(0)}:{})};
    assert.throws(() => observation(f));
  }
});
test('support accessor rejected without invocation', () => {
  const f = frame(); let calls=0;
  Object.defineProperty(f.temporal,'support',{enumerable:true,get(){calls++;return supports[0];}});
  assert.throws(() => observation(f)); assert.equal(calls,0);
});
