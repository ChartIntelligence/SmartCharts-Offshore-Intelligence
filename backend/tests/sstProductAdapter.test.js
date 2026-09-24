import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {SST_ADAPTER_CONTRACT as version, createSstProductAdapterV1 as create} from '../../shared/sstProductAdapter.mjs';
import {serializeOceanProductFrameV1 as serialize, inspectOceanFrameAncestryV1 as ancestry} from '../../shared/oceanProductFrame.mjs';

// Entirely synthetic: this is NOT a qualification of any real provider/product.
function fixture() {
  const grid = {coordinateSystem: 'geographic', crs: 'EPSG:4326', horizontalDatum: 'WGS84', longitudeConvention: '-180:180',
    nativeResolution: {x: 1, y: 1, unit: 'degree'}, deliveredResolution: {x: 1, y: 1, unit: 'degree'}, resamplingMethod: null};
  const encoding = unit => ({kind: 'physical', unit, scaleFactor: null, addOffset: null, fillValues: [-999]});
  const q = {qualificationId: 'synthetic-only-qualification', qualificationVersion: '1', status: 'QUALIFIED',
    reviewReference: 'synthetic-only-review', product: {providerId: 'synthetic-provider', productId: 'synthetic-sst',
      datasetId: 'synthetic-dataset', productVersion: null, family: 'sst', processingLevel: 'synthetic-L4', evidenceClass: 'ANALYSIS'},
    streamId: 'synthetic-analysis', representationId: 'synthetic-decoded-grid', grid,
    supportKinds: ['instant', 'interval', 'composite-window', 'unknown'], providerScheme: 'synthetic-mask-scheme',
    variables: [
      {variableId: 'sst', role: 'sst', meaning: 'synthetic-foundation-temperature', encoding: encoding('degC'), codes: null},
      {variableId: 'error', role: 'uncertainty', meaning: 'synthetic-standard-error', encoding: encoding('degC'), codes: null},
      {variableId: 'mask', role: 'flag', meaning: 'synthetic-surface-mask', encoding: encoding('1'), codes: [
        {value: 1, meaning: 'water', sstMissingReason: null}, {value: 2, meaning: 'land', sstMissingReason: 'land'},
        {value: 4, meaning: 'ice', sstMissingReason: 'unknown'}, {value: 8, meaning: 'analysis-fill', sstMissingReason: null}]}]};
  const registry = {contractVersion: version, registryId: 'synthetic-registry', registryVersion: '1', qualifications: [q]};
  const source = {contractVersion: version, frameId: 'synthetic-frame-a',
    qualification: {registryId: registry.registryId, registryVersion: '1', qualificationId: q.qualificationId, qualificationVersion: '1'},
    identity: {...Object.fromEntries(['providerId', 'productId', 'datasetId', 'productVersion'].map(k => [k, q.product[k]])),
      streamId: q.streamId, representationId: q.representationId}, grid: structuredClone(grid),
    temporal: {support: {kind: 'interval', start: '2026-01-01T00:00:00Z', end: '2026-01-02T00:00:00Z'},
      observationTime: null, forecastIssuedAt: null, providerPublishedAt: '2026-01-02T06:00:00Z',
      acquiredAt: '2026-01-02T07:00:00Z', processedAt: null},
    source: {objectId: 'synthetic-provider/object-a', revision: 'r1', validator: 'synthetic-etag-a',
      receiptId: 'synthetic-receipt-a', checksum: `sha256:${'a'.repeat(64)}`, nominalTime: '2026-01-01T12:00:00Z'},
    axes: {longitude: [-90, -89, -88], latitude: [25, 26]}, dimensions: {longitude: 3, latitude: 2},
    components: [
      {variableId: 'sst', values: [0, 25.123, -999, null, null, null], missing: [null, null, null, 'land', 'unknown', 'outside-coverage']},
      {variableId: 'error', values: [0, 1, null, null, null, null], missing: [null, null, 'provider-no-data', 'land', 'unknown', 'outside-coverage']},
      {variableId: 'mask', values: [1, 8, 1, 2, 4, null], missing: [null, null, null, null, null, 'outside-coverage']}],
    coverage: {completeness: 'partial', basis: 'synthetic-returned-grid'},
    lineage: {parentFrameIds: [], sourceRecordIds: ['synthetic-provider/object-a'], completeness: 'partial'}};
  return {registry, source, q};
}
const run = f => create(f.registry)(f.source);

test('synthetic analysis: Kelvin values, zero, aligned uncertainty and masks; no scalar confidence', () => {
  const frame = run(fixture());
  assert.equal(frame.product.evidenceClass, 'ANALYSIS');
  assert.equal(frame.product.productVersion, null);
  assert.equal(frame.payload.components[0].values[0], 273.15);
  assert.ok(Math.abs(frame.payload.components[0].values[1] - 298.273) < 1e-12);
  assert.deepEqual(frame.payload.components[0].values.slice(2), [null, null, null, null]);
  assert.deepEqual(frame.payload.components[0].missing, [null, null, 'provider-no-data', 'land', 'unknown', 'outside-coverage']);
  assert.deepEqual(frame.payload.components[1].values, [0, 1, null, null, null, null]);
  assert.equal(frame.quality.uncertainty, null);
  assert.equal(frame.payload.kind, 'multivariable');
  assert.equal(frame.spatial.landMask, 'explicit-cell-reasons');
  assert.deepEqual(frame.payload.components[2].values, [1, 8, 1, 2, 4, null]);
});

test('no built-in qualification, unsupported states and stale references fail closed', () => {
  for (const state of ['METADATA_QUALIFICATION_INCOMPLETE', 'PROVIDER_CLARIFICATION_REQUIRED', 'REVOKED', 'UNQUALIFIED']) {
    const f = fixture(); f.q.status = state; assert.throws(() => run(f));
  }
  for (const key of ['registryId', 'registryVersion', 'qualificationId', 'qualificationVersion']) {
    const f = fixture(); f.source.qualification[key] = 'wrong'; assert.throws(() => run(f));
  }
  const f = fixture(); f.registry.qualifications = []; assert.throws(() => run(f));
  delete f.source.qualification; assert.throws(() => run(f));
});

test('every product, stream and representation identity is qualification bound', () => {
  for (const key of Object.keys(fixture().source.identity)) {
    const f = fixture(); f.source.identity[key] = 'different'; assert.throws(() => run(f));
  }
  for (const name of ['noaacwBLENDEDsstDaily', 'METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2', 'METOFFICE-GLO-SST-L4-REP-OBS-SST_202003']) {
    const f = fixture(); f.source.identity.datasetId = name; assert.throws(() => run(f));
  }
});

test('strict raw numeric matrix rejects all malformed evidence; null needs reason', () => {
  for (const value of [undefined, '', ' ', '0', '25', true, false, NaN, Infinity, -Infinity, [], [25], {}, new Number(25)]) {
    for (const index of [0, 1, 2]) {
      const f = fixture(); f.source.components[index].values[0] = value; assert.throws(() => run(f));
    }
  }
  const f = fixture(); f.source.components[0].values[0] = null; assert.throws(() => run(f));
  f.source.components[0].missing[0] = 'invalid-observation';
  assert.equal(run(f).payload.components[0].values[0], null);
});

test('physical Kelvin, Celsius and Fahrenheit preserve zero without rounding; differences have no offset', () => {
  for (const [unit, value, expected] of [['K', 0, 0], ['degC', -1, 272.15], ['degF', 32, 273.15]]) {
    const f = fixture(); f.q.variables[0].encoding.unit = unit; f.source.components[0].values[0] = value;
    assert.equal(run(f).payload.components[0].values[0], expected);
  }
  const f = fixture(); f.q.variables[1].encoding.unit = 'degF'; f.source.components[1].values[1] = 9;
  assert.equal(run(f).payload.components[1].values[1], 5);
});

test('packing detects fill before scale/offset; absolute and difference conversions remain separate', () => {
  const f = fixture();
  Object.assign(f.q.variables[0].encoding, {kind: 'packed', scaleFactor: 0.01, addOffset: 0});
  Object.assign(f.q.variables[1].encoding, {kind: 'packed', scaleFactor: 0.1, addOffset: 0});
  f.source.components[0].values[1] = 2500;
  assert.equal(run(f).payload.components[0].values[1], 298.15);
  assert.equal(run(f).payload.components[0].values[2], null);
  assert.equal(run(f).payload.components[1].values[1], 0.1);
});

test('invalid encoding, overflow, negative uncertainty and unsupported flags reject whole frame', () => {
  for (const change of [f => { f.q.variables[0].encoding.unit = 'unknown'; },
    f => { f.q.variables[0].encoding.scaleFactor = 1; },
    f => { f.q.variables[0].encoding.kind = 'packed'; },
    f => { Object.assign(f.q.variables[0].encoding, {kind: 'packed', scaleFactor: 1e308, addOffset: 0}); },
    f => { f.source.components[1].values[0] = -1; }, f => { f.source.components[2].values[0] = 3; }]) {
    const f = fixture(); change(f); assert.throws(() => run(f));
  }
});

test('missing/value and mask contradictions fail; native ice is retained without inventing ice reason', () => {
  const f = fixture(); f.source.components[0].values[3] = 10; assert.throws(() => run(f));
  f.source.components[0].values[3] = null; f.source.components[0].missing[3] = 'unknown'; assert.throws(() => run(f));
  f.source.components[0].missing[3] = 'land';
  const frame = run(f); assert.equal(frame.payload.components[2].values[4], 4);
  assert.equal(frame.payload.components[0].missing[4], 'unknown');
  assert.match(frame.provenance.steps[0].parameters.find(p => p.name === 'qualificationProfile').value, /ice/);
});

test('dimensions, axis order, uniqueness, coordinate bounds and aligned component counts are checked', () => {
  for (const change of [f => { f.source.dimensions.latitude = 3; },
    f => { f.source.axes.latitude = [26, 25]; }, f => { f.source.axes.longitude[1] = -90; },
    f => { f.source.axes.latitude[1] = 91; }, f => { f.source.axes.longitude[0] = '-90'; },
    f => { f.source.components[1].values.pop(); }, f => { f.source.components[0].missing.pop(); },
    f => { f.source.components[0].variableId = 'other'; }, f => { delete f.source.components[0].values[0]; }]) {
    const f = fixture(); change(f); assert.throws(() => run(f));
  }
});

test('CRS/datum required, preserved without transformation; longitude convention and resolutions remain separate', () => {
  for (const key of ['crs', 'horizontalDatum']) {
    const f = fixture(); f.q.grid[key] = null; f.source.grid[key] = null; assert.throws(() => run(f));
  }
  const f = fixture(); f.q.grid.crs = 'EPSG:4267'; f.q.grid.horizontalDatum = 'NAD27';
  f.q.grid.longitudeConvention = '0:360'; f.q.grid.nativeResolution.x = 0.5; f.q.grid.resamplingMethod = 'synthetic-stride';
  f.source.grid = structuredClone(f.q.grid); f.source.axes.longitude = [270, 271, 272];
  const frame = run(f);
  assert.equal(frame.spatial.horizontalDatum, 'NAD27'); assert.deepEqual(frame.payload.axes.x, [270, 271, 272]);
  assert.equal(frame.spatial.nativeResolution.x, 0.5); assert.equal(frame.spatial.deliveredResolution.x, 1);
  f.source.grid.crs = 'EPSG:4326'; assert.throws(() => run(f));
});

test('instant, interval, composite-window and unknown preserve distinct acquisition/publication/reference times', () => {
  for (const support of [{kind: 'instant', at: '2026-01-01T12:00:00Z'},
    {kind: 'composite-window', start: '2026-01-01T00:00:00Z', end: '2026-01-02T00:00:00Z'},
    {kind: 'unknown', reason: 'synthetic-unspecified'}]) {
    const f = fixture(); f.source.temporal.support = support;
    const frame = run(f); assert.equal(frame.temporal.support.kind, support.kind);
    assert.equal(frame.temporal.observationTime, null);
    assert.equal(frame.temporal.acquiredAt, '2026-01-02T07:00:00.000Z');
    assert.equal(frame.temporal.providerPublishedAt, '2026-01-02T06:00:00.000Z');
    assert.equal(frame.temporal.processedAt, null);
  }
  const f = fixture(); f.source.temporal.support.end = f.source.temporal.support.start; assert.throws(() => run(f));
  const invalidTime = fixture(); invalidTime.source.source.nominalTime = 'now'; assert.throws(() => run(invalidTime));
});

test('evidence class comes only from qualification, not processing-level branding', () => {
  for (const evidenceClass of ['DIRECT_OBSERVATION', 'ANALYSIS', 'DERIVED', 'RECONSTRUCTED', 'FORECAST']) {
    const f = fixture(); f.q.product.evidenceClass = evidenceClass;
    assert.equal(run(f).product.evidenceClass, evidenceClass);
  }
});

test('revision and checksum remain distinguishable; caller supplies IDs and source ancestry', () => {
  const f = fixture(), a = run(f);
  f.source.frameId = 'synthetic-frame-b'; f.source.source.revision = 'r2'; f.source.source.checksum = `sha256:${'b'.repeat(64)}`;
  const b = run(f); assert.notEqual(serialize(a), serialize(b));
  assert.equal(a.provenance.sources[0].checksum, `sha256:${'a'.repeat(64)}`);
  assert.equal(ancestry(a.frameId, b.frameId, [a, b]).status, 'shared-ancestry');
  f.source.lineage.sourceRecordIds = []; assert.throws(() => run(f));
});

test('output is deeply immutable, detached, deterministic; registry and source input stay unchanged', () => {
  const f = fixture(), before = structuredClone(f), adapter = create(f.registry), a = adapter(f.source);
  assert.deepEqual(f, before);
  const reverse = v => Array.isArray(v) ? v.map(reverse) : v && typeof v === 'object'
    ? Object.fromEntries(Object.entries(v).reverse().map(([k, value]) => [k, reverse(value)])) : v;
  assert.equal(serialize(a), serialize(create(reverse(f.registry))(reverse(f.source))));
  const frozen = v => { if (v && typeof v === 'object') { assert.ok(Object.isFrozen(v)); Object.values(v).forEach(frozen); } };
  frozen(a);
  assert.throws(() => { a.payload.components[0].values[0] = 7; });
  f.source.axes.longitude[0] = -100; f.registry.qualifications[0].product.evidenceClass = 'DIRECT_OBSERVATION';
  assert.equal(a.payload.axes.x[0], -90); assert.equal(adapter(before.source).product.evidenceClass, 'ANALYSIS');
});

test('unknown/private/species/consumer fields and malformed envelopes are rejected', () => {
  for (const key of ['captainId', 'fishingLog', 'catch', 'privateNotes', 'species', 'confidence', 'rank', 'opportunityScore']) {
    for (const target of ['source', 'identity', 'qualification']) {
      const f = fixture(); (target === 'source' ? f.source : f.source[target])[key] = 'forbidden'; assert.throws(() => run(f));
    }
  }
  for (const target of ['registry', 'source']) {
    const f = fixture(); f[target].contractVersion = 'unsupported'; assert.throws(() => run(f));
  }
});

test('pure implementation has no implicit clock, random IDs, numeric coercion, provider or runtime imports', () => {
  const code = readFileSync(new URL('../../shared/sstProductAdapter.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(code, /Date\.now|new Date\(\)|performance\.now|Temporal\.Now|Math\.random|randomUUID|\bfetch\s*\(|\bNumber\s*\(|parseFloat|parseInt/);
  assert.deepEqual([...code.matchAll(/from '([^']+)'/g)].map(m => m[1]), ['./oceanProductFrame.mjs']);
});

test('minimal scalar SST and explicit missing reasons need no uncertainty or flags', () => {
  const f = fixture(); f.q.variables = [f.q.variables[0]]; f.source.components = [f.source.components[0]];
  const frame = run(f); assert.equal(frame.payload.kind, 'scalar'); assert.equal(frame.spatial.landMask, 'explicit-cell-reasons');
  assert.equal(frame.payload.components[0].missing[3], 'land');
});

test('current registry revisions reject old references; profile order and payload cell order remain meaningful', () => {
  const f = fixture(); f.registry.registryVersion = '2'; assert.throws(() => run(f));
  f.source.qualification.registryVersion = '2'; const a = run(f);
  f.q.variables.reverse(); const b = run(f);
  assert.notEqual(serialize(a), serialize(b));
  assert.deepEqual(b.payload.components[2].values, a.payload.components[0].values);
});

test('duplicate qualification/variables, unknown nested metadata and contradictory masks fail', () => {
  const accessor = fixture(); let invoked = false;
  Object.defineProperty(accessor.source.components[0].values, '0', {enumerable: true, get() { invoked = true; return 0; }});
  assert.throws(() => run(accessor)); assert.equal(invoked, false);
  for (const change of [f => f.registry.qualifications.push(structuredClone(f.q)),
    f => { f.q.variables[1].variableId = 'sst'; }, f => { f.source.temporal.species = 'forbidden'; },
    f => { f.source.lineage.confidence = 1; }, f => { f.q.grid.crs = 'unknown'; f.source.grid.crs = 'unknown'; },
    f => { f.source.source.checksum = null; }]) {
    const f = fixture(); change(f); assert.throws(() => run(f));
  }
  const f = fixture(); const second = structuredClone(f.q.variables[2]); second.variableId = 'quality';
  second.codes[0].sstMissingReason = 'outside-coverage'; f.q.variables.push(second);
  const cells = structuredClone(f.source.components[2]); cells.variableId = 'quality'; cells.values[3] = 1;
  f.source.components.push(cells); assert.throws(() => run(f));
});
