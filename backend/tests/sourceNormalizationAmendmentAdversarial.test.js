// STOP evidence only. Uses synthetic JSON transport through unchanged production parsers.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {fields, parse} from './fixtures/sourceNormalizationFixture.mjs';

for (const id of ['marine:sea_surface_temperature', 'sst:directional']) {
  test(`${id}: finite JSON transport overflows converted SST`, async t => {
    const field = fields.find(item => item.id === id);
    for (const input of [1e308, -1e308]) {
      assert.equal(JSON.parse(JSON.stringify(input)), input);
      assert.equal(Number.isFinite(input), true);
      const {result, requests} = await parse(t, field, 'positive', input);
      const samples = id.startsWith('marine:') ? [result.sst] : result.samples;
      assert.ok(requests.length > 0);
      for (const sample of samples) {
        assert.equal(sample.temperatureCelsius, input);
        assert.equal(sample.temperatureFahrenheit, input > 0 ? Infinity : -Infinity);
      }
      if (id === 'sst:directional') {
        assert.equal(samples.length, 4);
        assert.equal(result.validNeighborCount, 0);
        assert.equal(result.coverage, 'insufficient');
        assert.equal(result.rangeFahrenheit, null);
        assert.ok(samples.every(sample => sample.source.availability === 'available'));
      }
    }
  });

  test(`${id}: ordinary values, null, missing and signed Celsius zero controls`, async t => {
    const field = fields.find(item => item.id === id);
    for (const [name, input, celsius, fahrenheit] of [
      ['positive', 25, 25, 77],
      ['positive-zero', 0, 0, 32],
      ['negative-zero', -0, -0, 32],
      ['negative-zero', -Number.MIN_VALUE * 0.5, -0, 32],
      ['null', null, null, null],
      ['missing', undefined, null, null],
    ]) {
      const {result} = await parse(t, field, name, input);
      const samples = id.startsWith('marine:') ? [result.sst] : result.samples;
      for (const sample of samples) {
        assert.ok(Object.is(sample.temperatureCelsius, celsius));
        assert.ok(Object.is(sample.temperatureFahrenheit, fahrenheit));
      }
    }
  });
}
