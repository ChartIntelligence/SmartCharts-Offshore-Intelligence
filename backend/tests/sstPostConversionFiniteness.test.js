// Numeric-safety scope evidence only; unchanged production parsers, synthetic transport.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {writeFileSync} from 'node:fs';
import {fields, parse, encode} from './fixtures/sourceNormalizationFixture.mjs';
import {celsiusToFahrenheit} from '../server.js';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {captureCurrentEvidenceV1} from '../currentEvidenceCapture.mjs';
import {captureCurrentEvidenceV2} from '../currentEvidenceCaptureV2.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';

const evidence = {sst: [], arithmetic: [], boundary: null};
const buffer = new ArrayBuffer(8), view = new DataView(buffer);
const fromBits = bits => {view.setBigUint64(0, bits); return view.getFloat64(0);};
test('binary64 adjacent boundary of unchanged Fahrenheit calculation', () => {
  let low = 0n, high = 0x7fefffffffffffffn;
  while (high - low > 1n) {
    const mid = (low + high) / 2n;
    if (Number.isFinite(celsiusToFahrenheit(fromBits(mid)))) low = mid;
    else high = mid;
  }
  const finite = fromBits(low), overflow = fromBits(high);
  for (const sign of [1, -1]) {
    assert.ok(Number.isFinite(celsiusToFahrenheit(sign * finite)));
    assert.equal(celsiusToFahrenheit(sign * overflow), sign * Infinity);
    assert.ok(Number.isFinite(sign * overflow));
  }
  evidence.boundary = {lastFiniteInput: finite, firstOverflowInput: overflow,
    lastFiniteBits: low.toString(16), firstOverflowBits: high.toString(16),
    lastFiniteFahrenheit: celsiusToFahrenheit(finite), negativeSymmetric: true};
});

for (const id of ['marine:sea_surface_temperature', 'sst:directional']) {
  test(`${id}: overflow, ordinary and malformed transport`, async t => {
    const field = fields.find(f => f.id === id);
    const cases = [['positive', 1e308], ['negative', -1e308], ['positive', 25],
      ['positive', 25.123], ['positive-zero', 0], ['negative-zero', -0],
      ['negative-zero', -Number.MIN_VALUE * 0.5], ['null', null], ['missing', undefined],
      ['numeric-string', '25'], ['whitespace', ' '], ['array', []], ['object', {}],
      ['nan', NaN], ['infinity', Infinity], ['negative-infinity', -Infinity]];
    for (const [name, input] of cases) {
      const {result} = await parse(t, field, name, input);
      const samples = id.startsWith('marine:') ? [result.sst] : result.samples;
      const c = typeof input === 'number' && Number.isFinite(input) ? input : null;
      const f = celsiusToFahrenheit(c);
      for (const sample of samples) {
        assert.ok(Object.is(sample.temperatureCelsius, c));
        assert.ok(Object.is(sample.temperatureFahrenheit, f));
      }
      if (id === 'sst:directional') assert.equal(result.validNeighborCount, Number.isFinite(f) ? 4 : 0);
      evidence.sst.push({route: id, state: name, input: encode(input), celsius: encode(c),
        fahrenheit: encode(f), availability: samples[0].source?.availability ?? 'NO_SST_SOURCE_STATUS',
        validNeighborCount: result.validNeighborCount ?? null});
    }
  });
}

test('all thirteen proposed measurement routes: extreme finite arithmetic attack', async t => {
  const selected = fields.filter(f => f.conversion !== 'coordinate' && f.conversion !== 'strict');
  assert.equal(selected.length, 13);
  const affected = new Set(['marine:wind_speed_10m', 'marine:wind_gusts_10m',
    'marine:wave_height', 'marine:swell_wave_height']);
  for (const field of selected) for (const sign of [1, -1]) {
    const input = sign * 1e308;
    const {result, value} = await parse(t, field, 'positive', input);
    if (affected.has(field.id)) assert.equal(value, sign * Infinity);
    else assert.ok(Number.isFinite(value));
    if (field.parser === 'current') {
      assert.equal(result.speedKnots, null); // Overflowed square/sqrt rejected by knots input guard.
      assert.equal(result.source.availability, 'available'); // Component validity, not derived speed.
    }
    evidence.arithmetic.push({route: field.id, input: encode(input), output: encode(value),
      speedKnots: field.parser === 'current' ? encode(result.speedKnots) : null,
      sourceAvailability: result.source?.availability ?? result.wind?.source?.availability ?? null});
  }
});

test('capture acceptance is separate: nonfinite rejected, unavailable partial representation supported', () => {
  for (const capture of [captureCurrentEvidenceV1, captureCurrentEvidenceV2]) {
    const p = captureFixture();
    p.samples[0].point.temperatureCelsius = 1e308;
    p.samples[0].point.temperatureFahrenheit = Infinity;
    assert.throws(() => capture(p));
    p.samples[0].point.temperatureFahrenheit = null;
    assert.throws(() => capture(p)); // Available requires both finite representations.
    p.samples[0].point.source.availability = 'unavailable';
    assert.doesNotThrow(() => capture(p)); // Schema permits retaining finite C with unavailable F.
    p.samples[0].point.temperatureCelsius = null;
    assert.doesNotThrow(() => capture(p));
  }
  assert.throws(() => exactJson({temperatureFahrenheit: Infinity}));
  assert.throws(() => exactJson({temperatureFahrenheit: -Infinity}));
  assert.notEqual(exactJson({temperatureCelsius: -0}), exactJson({temperatureCelsius: 0}));
});

test('record bounded scope evidence without changing previous artifacts', () => {
  writeFileSync('.local/ocean-quarantine/task12b7c/evidence.json', JSON.stringify(evidence, null, 2) + '\n');
});
