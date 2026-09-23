import assert from 'node:assert/strict';
import {test} from 'node:test';
import {OCEAN_PRODUCT_FRAME_CONTRACT, OCEAN_MISSING_REASONS, normalizeOceanProductFrameV1 as normalize,
  serializeOceanProductFrameV1 as serialize, inspectOceanFrameAncestryV1 as ancestry} from '../../shared/oceanProductFrame.mjs';

// Synthetic values only; no provider, storage, application imports or wall-clock dependencies.
function fixture() {
  return {contractVersion: OCEAN_PRODUCT_FRAME_CONTRACT, frameId: 'frame-a',
    product: {productId: 'synthetic-temperature', providerId: 'synthetic', datasetId: 'dataset-a',
      productVersion: '1', family: 'temperature', processingLevel: null, evidenceClass: 'ANALYSIS'},
    temporal: {support: {kind: 'instant', at: '2026-09-01T00:00:00Z'}, observationTime: null,
      forecastIssuedAt: null, providerPublishedAt: null, acquiredAt: '2026-09-02T02:00:00Z', processedAt: null},
    spatial: {crs: 'EPSG:4326', horizontalDatum: 'WGS84', verticalDatum: null, coordinateOrder: 'x,y',
      bounds: [-90, 25, -89, 26], boundsMeaning: 'payload-extent', nativeResolution: {x: 1, y: 1, unit: 'degree'},
      deliveredResolution: {x: 2, y: 2, unit: 'degree'}, resamplingMethod: 'stride',
      coverageCompleteness: 'partial', coverageBasis: 'returned-cells-only', landMask: 'not-supplied'},
    payload: {kind: 'scalar', layout: 'rectilinear-grid', coordinates: null, axes: {x: [-90, -89], y: [25]},
      vectorBasis: null, components: [{variableId: 'temperature', unit: 'degC', axis: null, positiveDirection: null,
        values: [0, null], missing: [null, 'provider-no-data']}]},
    quality: {providerScheme: null, flags: [], uncertainty: null},
    provenance: {sources: [{providerId: 'synthetic', datasetId: 'dataset-a', recordId: 'record-a', locatorId: 'archive-a', checksum: null}],
      adapterId: 'synthetic-adapter', adapterVersion: '1', steps: []},
    lineage: {parentFrameIds: [], sourceRecordIds: ['synthetic/dataset-a/record-a'], completeness: 'complete'}};
}

test('scalar frame keeps zero, missing support, native/delivered resolution and immutable detached state', () => {
  const input = fixture(), frame = normalize(input);
  assert.deepEqual(frame.payload.components[0].values, [0, null]);
  assert.equal(frame.spatial.nativeResolution.x, 1);
  assert.equal(frame.spatial.deliveredResolution.x, 2);
  input.payload.components[0].values[0] = 12;
  assert.equal(frame.payload.components[0].values[0], 0);
  assert.throws(() => { frame.payload.components[0].values[0] = 3; }, TypeError);
  assert.deepEqual(normalize(JSON.parse(serialize(frame))), frame);
});

test('all evidence classes are descriptive; no freshness or eligibility is invented', () => {
  for (const evidenceClass of ['DIRECT_OBSERVATION', 'ANALYSIS', 'DERIVED', 'RECONSTRUCTED', 'FORECAST', 'STATIC_MODEL']) {
    const input = fixture(); input.product.evidenceClass = evidenceClass;
    if (evidenceClass === 'STATIC_MODEL') input.temporal.support = {kind: 'static'};
    const frame = normalize(input);
    assert.equal(frame.product.evidenceClass, evidenceClass);
    assert.equal(Object.hasOwn(frame, 'freshness'), false);
    assert.equal(Object.hasOwn(frame, 'eligible'), false);
    assert.equal(frame.quality.uncertainty, null);
  }
});

test('vector samples preserve actual components and independently missing components', () => {
  const input = fixture();
  input.product.evidenceClass = 'DERIVED';
  input.payload = {kind: 'vector', layout: 'points', coordinates: [[-90, 25], [-89, 25]], axes: null,
    vectorBasis: 'east-north', components: [
      {variableId: 'u', unit: 'm/s', axis: 'east', positiveDirection: 'east', values: [0, 1], missing: [null, null]},
      {variableId: 'v', unit: 'm/s', axis: 'north', positiveDirection: 'north', values: [-1, null], missing: [null, 'provider-no-data']} ]};
  assert.deepEqual(normalize(input).payload, input.payload);
  input.payload.components[1].unit = 'knots'; assert.throws(() => normalize(input));
  input.payload.components[1].unit = 'm/s'; input.payload.components[1].axis = 'east'; assert.throws(() => normalize(input));
});

test('static bathymetry preserves unknown vertical datum, sign convention and source version without live time', () => {
  const input = fixture(); input.product.evidenceClass = 'STATIC_MODEL'; input.product.family = 'bathymetry';
  input.temporal.support = {kind: 'static'}; input.spatial.horizontalDatum = 'NAD27';
  Object.assign(input.payload.components[0], {variableId: 'elevation', unit: 'm', positiveDirection: 'up', values: [-500, null]});
  const frame = normalize(input);
  assert.equal(frame.spatial.horizontalDatum, 'NAD27'); assert.equal(frame.spatial.verticalDatum, null);
  assert.equal(frame.temporal.observationTime, null); assert.equal(frame.product.productVersion, '1');
  input.temporal.observationTime = '2026-09-01T00:00:00Z'; assert.throws(() => normalize(input));
});

test('instant, interval, composite and forecast time do not become acquisition time', () => {
  for (const kind of ['interval', 'composite-window', 'forecast-valid-interval']) {
    const input = fixture(); input.temporal.support = {kind, start: '2026-09-01T00:00:00Z', end: '2026-09-02T00:00:00Z'};
    if (kind === 'forecast-valid-interval') {
      input.product.evidenceClass = 'FORECAST'; input.temporal.forecastIssuedAt = '2026-08-31T00:00:00Z';
    }
    const frame = normalize(input);
    assert.equal(frame.temporal.support.start, '2026-09-01T00:00:00.000Z');
    assert.equal(frame.temporal.acquiredAt, '2026-09-02T02:00:00.000Z');
    assert.equal(frame.temporal.providerPublishedAt, null);
    input.temporal.support.end = input.temporal.support.start; assert.throws(() => normalize(input));
  }
  const input = fixture(); input.temporal.support = {kind: 'unknown', reason: 'provider-support-unspecified'};
  input.product.productVersion = null; input.spatial.crs = null;
  assert.equal(normalize(input).temporal.support.kind, 'unknown');
  assert.equal(normalize(input).product.productVersion, null);
});

test('timestamps reject impossible dates/timezone-free input and preserve explicit milliseconds', () => {
  for (const at of [null, '2026-02-30T00:00:00Z', '2026-09-01', '2026-09-01T00:00:00', 'now']) {
    const input = fixture(); input.temporal.support.at = at; assert.throws(() => normalize(input));
  }
  const input = fixture(); input.temporal.support.at = '2026-09-01T00:00:00.123Z';
  assert.equal(normalize(input).temporal.support.at, input.temporal.support.at);
});

test('every missing reason remains missing; values are not coerced', () => {
  for (const reason of OCEAN_MISSING_REASONS) {
    const input = fixture(); input.payload.components[0].missing[1] = reason;
    assert.equal(normalize(input).payload.components[0].values[1], null);
    assert.equal(normalize(input).payload.components[0].missing[1], reason);
  }
  for (const value of [NaN, Infinity, -Infinity, undefined, '', '0', false]) {
    const input = fixture(); input.payload.components[0].values[0] = value; assert.throws(() => normalize(input));
  }
  const input = fixture(); input.payload.components[0].missing[1] = null; assert.throws(() => normalize(input));
  input.payload.components[0].values[1] = 0; assert.equal(normalize(input).payload.components[0].values[1], 0);
});

test('malformed grids, masks, bounds, payloads and unknown fields fail closed', () => {
  const mutations = [f => f.payload.components[0].values.pop(), f => f.payload.axes.x.reverse(),
    f => f.payload.axes.x.push(NaN), f => f.spatial.bounds = [1, 2], f => f.spatial.nativeResolution.x = 0,
    f => f.payload.coordinates = [], f => f.payload.kind = 'raster-png', f => delete f.temporal.acquiredAt,
    f => f.quality.confidence = 99, f => f.product.displayName = 'not-identity'];
  for (const mutate of mutations) { const input = fixture(); mutate(input); assert.throws(() => normalize(input)); }
  for (const input of [null, [], {}, 'frame']) assert.throws(() => normalize(input));
});

test('strict schema rejects captain/species data at envelope and nested boundaries, and URL credentials', () => {
  for (const field of ['captainId', 'userId', 'notes', 'reportId', 'species', 'catchCount', 'opportunityScore']) {
    const input = fixture(); input[field] = 'private'; assert.throws(() => normalize(input));
    delete input[field]; input.provenance.sources[0][field] = 'private'; assert.throws(() => normalize(input));
  }
  const input = fixture(); input.provenance.sources[0].locatorId = 'https://user:secret@host/data?token=secret';
  assert.throws(() => normalize(input));
});

test('provider flags and declared processing remain source metadata, not comparable confidence', () => {
  const input = fixture(); input.quality = {providerScheme: 'synthetic-flags-v1', flags: [{flagId: 'quality-code', value: 2}], uncertainty: null};
  input.provenance.steps = [{operationId: 'unit-conversion', version: '1', parameters: [{name: 'scale', value: 1}]}];
  assert.deepEqual(normalize(input).quality, input.quality);
  assert.deepEqual(normalize(input).provenance.steps, input.provenance.steps);
});

test('multivariable forecast keeps distinct units, future valid support and supplied observation time', () => {
  const input = fixture(); input.product.evidenceClass = 'FORECAST';
  input.temporal.support = {kind: 'forecast-valid-interval', start: '2026-09-03T00:00:00Z', end: '2026-09-03T01:00:00Z'};
  input.temporal.forecastIssuedAt = '2026-09-02T00:00:00Z';
  input.payload.kind = 'multivariable';
  Object.assign(input.payload.components[0], {variableId: 'height', unit: 'm'});
  input.payload.components.push({variableId: 'period', unit: 's', axis: null, positiveDirection: null,
    values: [8, 9], missing: [null, null]});
  const frame = normalize(input);
  assert.deepEqual(frame.payload.components.map(c => c.unit), ['m', 's']);
  assert.ok(Date.parse(frame.temporal.support.start) > Date.parse(frame.temporal.acquiredAt));
  const direct = fixture(); direct.product.evidenceClass = 'DIRECT_OBSERVATION';
  direct.temporal.observationTime = '2026-09-01T00:00:00Z';
  assert.notEqual(normalize(direct).temporal.observationTime, normalize(direct).temporal.acquiredAt);
});

test('serialization is deterministic, clock-free and refuses unsupported contract versions', () => {
  const input = fixture(), reversed = Object.fromEntries(Object.entries(input).reverse());
  const expected = serialize(input);
  const originalNow = Date.now; Date.now = () => { throw new Error('clock accessed'); };
  try { assert.equal(serialize(reversed), expected); } finally { Date.now = originalNow; }
  input.contractVersion = 'pelora-ocean-product-frame-v99'; assert.throws(() => serialize(input));
});

test('lineage finds transitive/common source ancestry without asserting independence', () => {
  const root = fixture(), current = fixture(), signal = fixture(), other = fixture();
  current.frameId = 'current'; current.lineage = {parentFrameIds: ['frame-a'], sourceRecordIds: [], completeness: 'complete'};
  signal.frameId = 'signal'; signal.lineage = {parentFrameIds: ['current'], sourceRecordIds: [], completeness: 'complete'};
  assert.equal(ancestry('frame-a', 'signal', [root, current, signal]).status, 'shared-ancestry');
  other.frameId = 'other';
  assert.deepEqual(ancestry('frame-a', 'other', [root, other]).sharedReferences, ['source:synthetic/dataset-a/record-a']);
  other.lineage.sourceRecordIds = ['different'];
  assert.equal(ancestry('frame-a', 'other', [root, other]).status, 'not-established');
  const incomplete = ancestry('signal', 'other', [signal, other]);
  assert.equal(incomplete.incomplete, true); assert.deepEqual(incomplete.missingFrameIds, ['current']);
  current.lineage.parentFrameIds = ['signal']; assert.throws(() => ancestry('current', 'signal', [current, signal]));
  assert.throws(() => ancestry('frame-a', 'frame-a', [root, root]));
});

test('identity differences survive; all nested objects are detached and frozen without mutating input', () => {
  const input = fixture();
  input.provenance.steps = [{operationId: 'stride', version: '1', parameters: [{name: 'stride', value: 2}]}];
  input.quality.flags = [{flagId: 'provider-code', value: 1}];
  input.quality.uncertainty = {value: 0, unit: 'degC', meaning: 'synthetic supplied uncertainty'};
  const before = structuredClone(input), frame = normalize(input);
  assert.deepEqual(input, before);
  function inspect(source, copy) {
    assert.notEqual(source, copy);
    assert.equal(Object.isFrozen(copy), true);
    for (const key of Object.keys(copy)) {
      assert.throws(() => { copy[key] = null; }, TypeError);
      if (copy[key] && typeof copy[key] === 'object') inspect(source[key], copy[key]);
    }
    assert.throws(() => { copy.extra = true; }, TypeError);
  }
  inspect(input, frame);
  input.product.productId = 'changed'; input.temporal.support.at = 'changed';
  input.spatial.nativeResolution.x = 999; input.payload.components[0].missing[1] = 'land';
  input.provenance.sources[0].recordId = 'changed'; input.lineage.sourceRecordIds.push('changed');
  assert.deepEqual(frame, normalize(before));
  for (const field of ['productId', 'providerId', 'datasetId', 'productVersion']) {
    const different = fixture(); different.product[field] = 'distinct';
    assert.notEqual(serialize(different), serialize(fixture()));
  }
  const unknown = fixture(); unknown.product.productVersion = null;
  assert.equal(normalize(unknown).product.productVersion, null);
});

test('adversarial temporal, coordinate, component and missing-mask shapes fail without coercion', () => {
  for (const kind of ['interval', 'composite-window', 'forecast-valid-interval']) {
    const input = fixture(); input.product.evidenceClass = 'FORECAST';
    input.temporal.support = {kind, start: '2026-09-02T00:00:00Z', end: '2026-09-01T00:00:00Z'};
    assert.throws(() => normalize(input));
    input.temporal.support.end = 'invalid'; assert.throws(() => normalize(input));
  }
  for (const value of [null, undefined, '', ' ', '0', true, false, {}, [], NaN, Infinity, -Infinity]) {
    const input = fixture(); input.payload.components[0].values[0] = value;
    assert.throws(() => normalize(input)); // null also needs an explicit missing reason.
    input.payload.components[0].values[0] = 0; input.payload.axes.x[0] = value;
    assert.throws(() => normalize(input));
  }
  for (const coordinates of [[[1]], [[1, 2, 3]], [['1', 2]], [[null, 2]], [[Infinity, 2]]]) {
    const input = fixture(); Object.assign(input.payload, {layout: 'points', axes: null, coordinates});
    assert.throws(() => normalize(input));
  }
  for (const mutate of [f => f.payload.axes.x = [-90, -90], f => f.payload.components[0].missing.pop(),
    f => f.payload.components[0].missing[0] = 'land', f => f.payload.components.push(structuredClone(f.payload.components[0])),
    f => f.payload.axes.y = [], f => f.payload.kind = 'vector']) {
    const input = fixture(); mutate(input); assert.throws(() => normalize(input));
  }
  const vector = fixture(); vector.payload.kind = 'vector'; vector.payload.vectorBasis = 'east-north';
  vector.payload.components[0].axis = 'east';
  vector.payload.components.push({...structuredClone(vector.payload.components[0]), variableId: 'north', axis: 'north'});
  normalize(vector);
  vector.payload.components[1].values.pop(); assert.throws(() => normalize(vector));
  const unknown = fixture(); Object.assign(unknown.spatial, {crs: null, horizontalDatum: null, verticalDatum: null});
  assert.equal(normalize(unknown).spatial.crs, null);
  assert.equal(normalize(unknown).spatial.horizontalDatum, null);
});

test('nested key order is deterministic while value, source and processing array order is preserved', () => {
  const input = fixture();
  const reverseKeys = value => Array.isArray(value) ? value.map(reverseKeys) : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).reverse().map(([key, item]) => [key, reverseKeys(item)])) : value;
  assert.equal(serialize(input), serialize(reverseKeys(input)));
  input.provenance.steps = ['first', 'second'].map(operationId => ({operationId, version: '1', parameters: []}));
  input.lineage.sourceRecordIds.push('synthetic/second');
  const output = JSON.parse(serialize(input));
  assert.deepEqual(output.payload.components[0].values, input.payload.components[0].values);
  assert.deepEqual(output.provenance.steps, input.provenance.steps);
  assert.deepEqual(output.lineage.sourceRecordIds, input.lineage.sourceRecordIds);
  const earlier = serialize(input); input.provenance.steps.reverse(); assert.notEqual(serialize(input), earlier);
});

test('multiple-parent and sibling lineage retain common ancestry and explicit unresolved status', () => {
  const root = fixture(), other = fixture(), a = fixture(), b = fixture();
  other.frameId = 'other'; other.lineage.sourceRecordIds = ['synthetic/other'];
  a.frameId = 'a'; a.lineage = {parentFrameIds: ['frame-a', 'other'], sourceRecordIds: [], completeness: 'complete'};
  b.frameId = 'b'; b.lineage = {parentFrameIds: ['frame-a'], sourceRecordIds: [], completeness: 'complete'};
  const frames = [root, other, a, b];
  assert.equal(ancestry('a', 'b', frames).status, 'shared-ancestry');
  assert.equal(ancestry('a', 'other', frames).status, 'shared-ancestry');
  assert.equal(ancestry('frame-a', 'other', frames).status, 'not-established');
  a.lineage.parentFrameIds.push('unresolved');
  assert.deepEqual(ancestry('a', 'b', frames).missingFrameIds, ['unresolved']);
  assert.equal(ancestry('a', 'b', frames).incomplete, true);
  assert.equal(ancestry('absent-a', 'absent-b', frames).status, 'not-established');
  assert.equal(ancestry('absent-a', 'absent-b', frames).incomplete, true);
  a.lineage.parentFrameIds = ['a']; assert.throws(() => normalize(a));
});
