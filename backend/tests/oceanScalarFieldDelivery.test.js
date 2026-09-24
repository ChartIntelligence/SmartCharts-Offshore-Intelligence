import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createHash} from 'node:crypto';
import {OCEAN_PRODUCT_FRAME_CONTRACT} from '../../shared/oceanProductFrame.mjs';
import {writeOceanArchiveV1 as write} from '../../shared/oceanProductArchive.mjs';
import {deliverOceanScalarFieldV1 as deliver} from '../../shared/oceanScalarFieldDelivery.mjs';
function fixture(frameId = 'synthetic-frame-a') {
  return {contractVersion: OCEAN_PRODUCT_FRAME_CONTRACT, frameId,
    product: {productId: 'synthetic-analysis', providerId: 'synthetic', datasetId: 'synthetic-nrt',
      productVersion: '1', family: 'temperature', processingLevel: null, evidenceClass: 'ANALYSIS'},
    temporal: {support: {kind: 'unknown', reason: 'synthetic-unknown'}, observationTime: null,
      forecastIssuedAt: null, providerPublishedAt: null, acquiredAt: '2026-09-01T00:00:00Z', processedAt: null},
    spatial: {crs: 'EPSG:4326', horizontalDatum: 'WGS84', verticalDatum: null, coordinateOrder: 'x,y',
      bounds: [-90, 25, -89, 25], boundsMeaning: 'payload-extent', nativeResolution: null,
      deliveredResolution: null, resamplingMethod: null, coverageCompleteness: 'partial',
      coverageBasis: 'synthetic', landMask: 'explicit-cell-reasons'},
    payload: {kind: 'scalar', layout: 'rectilinear-grid', coordinates: null, axes: {x: [-90, -89], y: [25]},
      vectorBasis: null, components: [{variableId: 'temperature', unit: 'K', axis: null,
        positiveDirection: null, values: [0, null], missing: [null, 'land']}]},
    quality: {providerScheme: 'synthetic-flags', flags: [{flagId: 'ice', value: false}], uncertainty: null},
    provenance: {sources: [{providerId: 'synthetic', datasetId: 'synthetic-nrt', recordId: 'source-1',
      locatorId: 'source-ref-1', checksum: null}], adapterId: 'synthetic-normalizer', adapterVersion: '1', steps: []},
    lineage: {parentFrameIds: ['synthetic-parent'], sourceRecordIds: ['source-1'], completeness: 'partial'}};
}
const intent = (writeId = 'write-1') => ({writeId, archivedAt: '2026-09-02T00:00:00Z',
  storageReference: 'synthetic-storage-ref', sourceRevision: 'revision-1', rawEvidence: []});
const lookup = frameId => ({frameId, archiveId: null});
const clone = value => JSON.parse(JSON.stringify(value));

// Test double only. durable=true SIMULATES an infrastructure acknowledgement;
// this volatile Map is never a production durability implementation.
function memory(durable = true) {
  const records = new Map();
  return {records,
    async createIfAbsent(key, record) {
      const outcome = records.has(key) ? 'exists' : 'created';
      if (outcome === 'created') records.set(key, clone(record));
      return {outcome, durable, record: clone(records.get(key))};
    },
    async readExact(key) {
      return records.has(key) ? {status: 'found', durable, record: clone(records.get(key))} : {status: 'not-found'};
    }};
}

function grid() {
  const f = fixture();
  f.spatial.bounds = [-90, 25, -87, 27];
  f.spatial.nativeResolution = {x: 0.5, y: 0.5, unit: 'degree'};
  f.spatial.deliveredResolution = {x: 1, y: 1, unit: 'degree'};
  f.spatial.coverageCompleteness = 'complete';
  f.payload.axes = {x: [-90, -89, -88, -87], y: [25, 26, 27]};
  f.payload.components[0].values = [0, 281, null, null, 284, 285, 286, 287, 288, 289, 290, 291];
  f.payload.components[0].missing = [null, null, 'land', 'provider-no-data', null, null, null, null, null, null, null, null];
  return f;
}
async function setup(f = grid()) {
  const port = memory(); const archived = await write(port, f, intent());
  assert.equal(archived.status, 'ARCHIVED');
  const request = {source: {archiveId: archived.receipt.archiveId, receiptDigest: archived.receipt.receiptDigest},
    variableId: 'temperature', bounds: [-90, 25, -87, 27], stride: {x: 1, y: 1},
    limits: {maxCells: 100, maxPayloadBytes: 100000}, generatedAt: '2026-09-03T00:00:00Z'};
  return {port, request, archived};
}
test('SST delivery preserves Kelvin, analysis, zero, missing and land as archived', async () => {
  const {port, request, archived} = await setup(); const r = await deliver(port, request);
  assert.equal(r.status, 'DELIVERED_PARTIAL');
  assert.equal(r.field.scalar.unit, 'K'); assert.equal(r.field.product.evidenceClass, 'ANALYSIS');
  assert.deepEqual(r.field.grid.values, archived.frame.payload.components[0].values);
  assert.deepEqual(r.field.grid.missing, archived.frame.payload.components[0].missing);
  assert.equal(r.field.source.frameDigest, archived.receipt.frameDigest);
  assert.deepEqual(r.field.derivation.sourceLineage, archived.frame.lineage);
});
for (const [family, evidenceClass, unit] of [['chlorophyll', 'DIRECT_OBSERVATION', 'mg/m3'],
  ['chlorophyll', 'RECONSTRUCTED', 'mg/m3'], ['bathymetry', 'STATIC_MODEL', 'm'], ['altimetry', 'ANALYSIS', 'm']]) {
  test(`${family} ${evidenceClass} preserves source semantics`, async () => {
    const f = grid(); f.product.family = family; f.product.evidenceClass = evidenceClass;
    f.payload.components[0].variableId = family; f.payload.components[0].unit = unit;
    if (evidenceClass === 'STATIC_MODEL') { f.temporal.support = {kind: 'static'}; f.spatial.verticalDatum = 'synthetic-vertical-reference'; }
    const {port, request} = await setup(f); request.variableId = family;
    const r = await deliver(port, request); assert.equal(r.status, 'DELIVERED_PARTIAL');
    assert.equal(r.field.product.evidenceClass, evidenceClass); assert.equal(r.field.scalar.unit, unit);
    assert.deepEqual(r.field.temporal.support, f.temporal.support);
    assert.equal(r.field.temporal.observationTime, null); assert.equal(r.field.spatial.verticalDatum, f.spatial.verticalDatum);
  });
}
test('determinism, nested object key independence, generated time excluded from identity', async () => {
  const reverse = v => Array.isArray(v) ? v.map(reverse) : v && typeof v === 'object'
    ? Object.fromEntries(Object.keys(v).reverse().map(k => [k, reverse(v[k])])) : v;
  const a = await setup(); const b = await setup(reverse(grid()));
  const first = await deliver(a.port, a.request); const second = await deliver(b.port, reverse(b.request));
  assert.equal(JSON.stringify(first), JSON.stringify(second));
  a.request.generatedAt = '2026-09-04T00:00:00Z';
  const later = await deliver(a.port, a.request); assert.equal(later.field.deliveryId, first.field.deliveryId);
  assert.notEqual(later.field.generatedAt, first.field.generatedAt);
});
test('meaningful array order and changed source identity change derivative identity', async () => {
  const a = await setup(); const first = await deliver(a.port, a.request);
  for (const change of [f => { f.frameId = 'other'; }, f => { f.payload.components[0].values.reverse(); f.payload.components[0].missing.reverse(); },
    f => { f.lineage.parentFrameIds.push('second'); }]) {
    const f = grid(); change(f); const b = await setup(f);
    assert.notEqual((await deliver(b.port, b.request)).field.deliveryId, first.field.deliveryId);
  }
});
test('viewport and conservative stride change identity without interpolation or sharpening', async () => {
  const {port, request} = await setup(); const first = await deliver(port, request);
  request.stride = {x: 2, y: 2}; const r = await deliver(port, request);
  assert.deepEqual(r.field.grid.values, [0, null, 288, 290]);
  assert.deepEqual(r.field.grid.axes, {x: [-90, -88], y: [25, 27]});
  assert.deepEqual(r.field.spatial.nativeResolution, {x: 0.5, y: 0.5, unit: 'degree'});
  assert.equal(r.field.spatial.deliveredResolution.x, 2);
  assert.notEqual(r.field.deliveryId, first.field.deliveryId);
  request.bounds = [-89, 25, -87, 27]; const clipped = await deliver(port, request);
  assert.deepEqual(clipped.field.grid.axes.x, [-88]);
  assert.equal(clipped.field.spatial.deliveredResolution.x, null);
  assert.notEqual(clipped.field.deliveryId, r.field.deliveryId);
});
test('aligned uncertainty and mask references stay separate provider evidence', async () => {
  const f = grid(); f.payload.kind = 'multivariable';
  for (const variableId of ['analysis-error', 'mask']) f.payload.components.push({variableId, unit: '1', axis: null,
    positiveDirection: null, values: Array(12).fill(0), missing: Array(12).fill(null)});
  const {port, request} = await setup(f); const r = await deliver(port, request);
  assert.deepEqual(r.field.providerEvidence.companionVariableIds, ['analysis-error', 'mask']);
  assert.equal(r.field.providerEvidence.receiptDigest, r.field.source.receiptDigest);
  assert.equal(Object.hasOwn(r.field, 'confidence'), false);
});
test('exact receipt pin and corrupted archive fail closed', async () => {
  const {port, request} = await setup(); request.source.receiptDigest = '0'.repeat(64);
  assert.equal((await deliver(port, request)).status, 'SOURCE_INTEGRITY_FAILURE');
  const record = port.records.get(request.source.archiveId); record.receipt.contentDigest = '0'.repeat(64);
  assert.equal((await deliver(port, request)).status, 'SOURCE_INTEGRITY_FAILURE');
});
test('unavailable, absent and non-durable source never deliver', async () => {
  const {request} = await setup();
  for (const port of [memory(), {readExact: async () => { throw Error('secret'); }}]) {
    assert.equal((await deliver(port, request)).status, 'SOURCE_UNAVAILABLE');
  }
  const s = await setup(); const original = s.port.readExact;
  s.port.readExact = async k => ({...await original(k), durable: false});
  assert.equal((await deliver(s.port, s.request)).status, 'SOURCE_UNAVAILABLE');
});
test('unsupported component and vector current rejected', async () => {
  const s = await setup(); s.request.variableId = 'unknown';
  assert.equal((await deliver(s.port, s.request)).status, 'UNSUPPORTED_SCALAR_COMPONENT');
  const f = grid(); f.payload.kind = 'vector'; f.payload.vectorBasis = 'east-north';
  f.payload.components[0].axis = 'east'; const c = clone(f.payload.components[0]); c.variableId = 'north-current'; c.axis = 'north';
  f.payload.components.push(c); const v = await setup(f);
  assert.equal((await deliver(v.port, v.request)).status, 'UNSUPPORTED_SCALAR_COMPONENT');
});
test('geographic bounds reject antimeridian, nonfinite, coercion, swapped and degenerate requests', async () => {
  const s = await setup();
  for (const b of [[170, -10, -170, 10], [-181, 0, 0, 1], [0, -91, 1, 1], [0, 2, 1, 1], [0, 0, 0, 1],
    [0, 0, 1, 91], [0, 0, 181, 1], [null, 0, 1, 1], ['0', 0, 1, 1], [NaN, 0, 1, 1], [Infinity, 0, 1, 1]]) {
    s.request.bounds = b; assert.ok(['INVALID_BOUNDS', 'INVALID_REQUEST'].includes((await deliver(s.port, s.request)).status));
  }
});
test('unknown CRS, datum mismatch, projected and 0-360 axes fail without conversion', async () => {
  for (const change of [f => { f.spatial.crs = null; }, f => { f.spatial.horizontalDatum = null; },
    f => { f.spatial.crs = 'EPSG:3857'; }, f => { f.payload.axes.x = [270, 271, 272, 273]; f.spatial.bounds = null; }]) {
    const f = grid(); change(f); const s = await setup(f);
    assert.equal((await deliver(s.port, s.request)).status, 'UNSUPPORTED_GRID');
  }
});
test('archive validation rejects invalid values, axis ordering, lengths and missing alignment', async () => {
  const mutations = [f => f.payload.components[0].values.pop(), f => f.payload.axes.x.reverse(),
    f => { f.payload.axes.x[1] = f.payload.axes.x[0]; }, f => { f.payload.components[0].missing[0] = 'land'; }];
  for (const value of [null, '0', true, [], {}, NaN, Infinity, -Infinity]) mutations.push(f => { f.payload.components[0].values[0] = value; });
  for (const mutate of mutations) {
    const s = await setup(); const rec = s.port.records.get(s.request.source.archiveId); const f = JSON.parse(rec.frameJson);
    mutate(f); rec.frameJson = JSON.stringify(f);
    assert.equal((await deliver(s.port, s.request)).status, 'SOURCE_INTEGRITY_FAILURE');
  }
});
test('cell and exact canonical UTF-8 field payload limits are enforced', async () => {
  const s = await setup(); const r = await deliver(s.port, s.request);
  const bytes = Buffer.byteLength(JSON.stringify(r.field), 'utf8');
  s.request.limits.maxPayloadBytes = bytes;
  assert.equal((await deliver(s.port, s.request)).status, 'DELIVERED_PARTIAL');
  s.request.limits.maxPayloadBytes = bytes - 1;
  assert.equal((await deliver(s.port, s.request)).reason, 'payload-byte-limit');
  s.request.limits.maxCells = 11;
  assert.equal((await deliver(s.port, s.request)).reason, 'cell-limit');
});
test('all missing is valid partial; outside footprint has no invented cells', async () => {
  const f = grid(); f.payload.components[0].values.fill(null); f.payload.components[0].missing.fill('cloud-obscuration');
  const s = await setup(f); assert.equal((await deliver(s.port, s.request)).status, 'DELIVERED_PARTIAL');
  s.request.bounds = [1, 1, 2, 2]; assert.equal((await deliver(s.port, s.request)).status, 'NO_DELIVERED_CELLS');
});
test('valid complete samples, partial viewport and source coverage remain distinct', async () => {
  const f = grid(); f.payload.components[0].values.fill(0); f.payload.components[0].missing.fill(null);
  const s = await setup(f); assert.equal((await deliver(s.port, s.request)).status, 'DELIVERED');
  s.request.bounds = [-91, 24, -87, 27]; assert.equal((await deliver(s.port, s.request)).status, 'DELIVERED_PARTIAL');
});
test('caller cancellation checked before and after read, request detached before await', async () => {
  const s = await setup(); const controller = new AbortController(); controller.abort();
  assert.equal((await deliver(s.port, s.request, controller.signal)).status, 'DELIVERY_CANCELLED');
  const c = new AbortController(); const original = s.port.readExact;
  s.port.readExact = async k => { c.abort(); return original(k); };
  assert.equal((await deliver(s.port, s.request, c.signal)).status, 'DELIVERY_CANCELLED');
  s.port.readExact = original; const pending = deliver(s.port, s.request); s.request.bounds[0] = 10;
  assert.equal((await pending).field.spatial.requestedBounds[0], -90);
});
test('output deeply frozen and detached, source and caller unchanged', async () => {
  const s = await setup(); const before = JSON.stringify(s.request); const r = await deliver(s.port, s.request);
  function frozen(v) { if (v && typeof v === 'object') { assert.ok(Object.isFrozen(v)); Object.values(v).forEach(frozen); } }
  frozen(r); assert.equal(JSON.stringify(s.request), before);
  assert.throws(() => { r.field.grid.values[0] = 8; }, TypeError);
  s.request.stride.x = 3; assert.equal(r.field.derivation.stride.x, 1);
  assert.equal(s.port.records.get(s.request.source.archiveId).receipt.contentDigest, r.field.source.contentDigest);
});
test('unknown/private fields and malformed requests rejected before storage access', async () => {
  const s = await setup(); let calls = 0; const port = {readExact: async () => { calls++; }};
  for (const mutate of [r => { r.captainId = 'private'; }, r => { r.limits.confidence = 1; },
    r => { r.stride.x = '1'; }, r => { r.generatedAt = '2026-02-30T00:00:00Z'; },
    r => { Object.defineProperty(r, 'variableId', {get() { throw Error('getter'); }, enumerable: true}); }]) {
    const r = clone(s.request); mutate(r); assert.equal((await deliver(port, r)).status, 'INVALID_REQUEST');
  }
  assert.equal(calls, 0);
});

// 5 longitude columns by 3 latitude rows, distinct row/column signatures.
function asymmetric() {
  const f = grid();
  f.payload.axes = {x: [-100, -98, -96, -94, -92], y: [10, 13, 16]};
  f.spatial.bounds = [-100, 10, -92, 16];
  f.payload.components[0].values = [0, 101, null, 103, null, 200, null, 202, null, 204, null, 301, null, 303, null];
  f.payload.components[0].missing = [null, null, 'provider-no-data', null, 'land', null, 'cloud-obscuration', null,
    'outside-coverage', null, 'temporal-gap', null, 'invalid-observation', null, 'unknown'];
  return f;
}
async function asymmetricSetup() {
  const s = await setup(asymmetric()); s.request.bounds = [-100, 10, -92, 16]; return s;
}
test('hostile 5x3 indexing retains every asymmetric value and all seven missing reasons', async () => {
  const s = await asymmetricSetup(); const r = await deliver(s.port, s.request);
  assert.deepEqual(r.field.grid, {axes: {x: [-100, -98, -96, -94, -92], y: [10, 13, 16]},
    width: 5, height: 3, order: 'y-row-x-column',
    values: [0, 101, null, 103, null, 200, null, 202, null, 204, null, 301, null, 303, null],
    missing: [null, null, 'provider-no-data', null, 'land', null, 'cloud-obscuration', null,
      'outside-coverage', null, 'temporal-gap', null, 'invalid-observation', null, 'unknown']});
  s.request.bounds = [-98, 13, -94, 16]; const c = await deliver(s.port, s.request);
  assert.deepEqual(c.field.grid.values, [null, 202, null, 301, null, 303]);
  assert.deepEqual(c.field.grid.missing, ['cloud-obscuration', null, 'outside-coverage', null, 'invalid-observation', null]);
});
const edgeCases = [
  ['exact source bounds', [-100, 10, -92, 16], [0, 1, 2, 3, 4], [0, 1, 2]],
  ['exact interior centers', [-98, 10, -94, 13], [1, 2, 3], [0, 1]],
  ['between centers', [-99, 11, -93, 15], [1, 2, 3], [1]],
  ['one row', [-100, 12, -92, 14], [0, 1, 2, 3, 4], [1]],
  ['one column', [-97, 10, -95, 16], [2], [0, 1, 2]],
  ['one cell', [-97, 12, -95, 14], [2], [1]],
  ['bare overlap including edge center', [-92.000001, 15.999999, -91, 17], [4], [2]],
  ['overlap without center', [-92.1, 14, -91, 15], [], []],
  ['non-overlapping', [-91, 10, -90, 16], [], []],
  ['extends beyond coverage', [-101, 9, -91, 17], [0, 1, 2, 3, 4], [0, 1, 2]]
];
for (const [label, bounds, ix, iy] of edgeCases) test(`viewport edge: ${label}`, async () => {
  const s = await asymmetricSetup(); s.request.bounds = bounds; const r = await deliver(s.port, s.request);
  if (!ix.length) { assert.equal(r.status, 'NO_DELIVERED_CELLS'); assert.equal(r.field, null); return; }
  assert.deepEqual(r.field.derivation.sourceXIndices, ix); assert.deepEqual(r.field.derivation.sourceYIndices, iy);
  const f = asymmetric(); const indexes = iy.flatMap(j => ix.map(i => j * 5 + i));
  assert.deepEqual(r.field.grid.values, indexes.map(i => f.payload.components[0].values[i]));
  assert.deepEqual(r.field.grid.missing, indexes.map(i => f.payload.components[0].missing[i]));
});
test('odd dimensions decimate globally; endpoints are not forcibly appended', async () => {
  const s = await asymmetricSetup(); s.request.stride = {x: 3, y: 2};
  const a = await deliver(s.port, s.request);
  assert.deepEqual(a.field.derivation.sourceXIndices, [0, 3]);
  assert.deepEqual(a.field.derivation.sourceYIndices, [0, 2]);
  assert.deepEqual(a.field.grid.values, [0, 103, null, 303]);
  assert.deepEqual(a.field.grid.missing, [null, null, 'temporal-gap', null]);
  assert.equal(a.field.spatial.deliveredResolution.x, 6);
  assert.deepEqual(await deliver(s.port, s.request), a);
  s.request.stride = {x: 99, y: 99}; const b = await deliver(s.port, s.request);
  assert.deepEqual(b.field.grid.values, [0]); assert.deepEqual(b.field.derivation.sourceXIndices, [0]);
  s.request.bounds = [-99, 11, -92, 16]; assert.equal((await deliver(s.port, s.request)).status, 'NO_DELIVERED_CELLS');
});
test('1x1 source and irregular source spacing remain truthfully represented', async () => {
  const f = asymmetric(); f.payload.axes = {x: [-100], y: [10]};
  f.payload.components[0].values = [0]; f.payload.components[0].missing = [null];
  const s = await setup(f); s.request.bounds = [-101, 9, -99, 11]; s.request.stride = {x: 99, y: 99};
  const one = await deliver(s.port, s.request); assert.deepEqual(one.field.grid.values, [0]);
  assert.deepEqual(one.field.spatial.deliveredResolution, {x: null, y: null, unit: 'degree', meaning: 'sample-spacing'});
  const uneven = asymmetric(); uneven.payload.axes.x = [-100, -99, -97, -94, -92];
  const u = await setup(uneven); u.request.bounds = [-100, 10, -92, 16]; u.request.stride.x = 2;
  const r = await deliver(u.port, u.request);
  assert.deepEqual(r.field.grid.axes.x, [-100, -97, -92]);
  assert.equal(r.field.spatial.deliveredResolution.x, null); assert.equal(r.field.spatial.deliveredResolution.y, 3);
});
test('wrong/swapped/malformed/unsupported archive receipt and frame combinations fail', async () => {
  const other = asymmetric(); other.frameId = 'different-frame'; const b = await setup(other);
  const foreign = b.port.records.get(b.request.source.archiveId);
  for (const mutate of [r => { r.receipt = clone(foreign.receipt); }, r => { r.frameJson = foreign.frameJson; },
    r => { delete r.receipt; }, r => { r.receipt = null; }, r => { r.receipt.contractVersion = 'unsupported-v99'; },
    r => { r.receipt.receiptDigest = 'f'.repeat(64); }]) {
    const s = await asymmetricSetup(); mutate(s.port.records.get(s.request.source.archiveId));
    const result = await deliver(s.port, s.request); assert.equal(result.status, 'SOURCE_INTEGRITY_FAILURE'); assert.equal(result.field, null);
  }
  const s = await asymmetricSetup(); s.port.records.set(s.request.source.archiveId, clone(foreign));
  assert.equal((await deliver(s.port, s.request)).status, 'SOURCE_INTEGRITY_FAILURE');
});
test('same selected cells but different requested bounds intentionally have distinct identities', async () => {
  const s = await asymmetricSetup(); s.request.bounds = [-97, 12, -95, 14]; const a = await deliver(s.port, s.request);
  s.request.bounds = [-96.5, 12.5, -95.5, 13.5]; const b = await deliver(s.port, s.request);
  assert.deepEqual(a.field.grid, b.field.grid); assert.deepEqual(a.field.spatial.deliveredBounds, b.field.spatial.deliveredBounds);
  assert.notEqual(a.field.deliveryId, b.field.deliveryId);
});
test('digest commits to actual grid, bounds, selected indices, transformation and adapter version', async () => {
  const s = await asymmetricSetup(); const {field} = await deliver(s.port, s.request);
  const canonical = v => JSON.stringify((function sort(v) { return Array.isArray(v) ? v.map(sort) : v && typeof v === 'object'
    ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sort(v[k])])) : v; })(v));
  const digest = body => `osfd-${createHash('sha256').update(canonical(body)).digest('hex')}`;
  const {deliveryId, generatedAt, ...body} = field;
  assert.equal(digest(body), deliveryId);
  for (const mutate of [b => { b.adapterVersion = 'synthetic-v2'; }, b => { b.grid.axes.x[0] -= 0.1; },
    b => { b.spatial.deliveredBounds[0] -= 0.1; }, b => { b.derivation.sourceXIndices[0] = 1; },
    b => { b.derivation.stride.x = 2; }, b => { b.derivation.method = 'hypothetical-other-method'; }]) {
    const b = clone(body); mutate(b); assert.notEqual(digest(b), deliveryId);
  }
  // This proves hash coverage, not support for injecting an alternative adapter/method.
});
test('selected component identity and foreign companion injection are bound to archived revision', async () => {
  const f = asymmetric(); f.payload.kind = 'multivariable';
  const c = clone(f.payload.components[0]); c.variableId = 'analysis-error'; f.payload.components.push(c);
  const s = await setup(f); s.request.bounds = [-100, 10, -92, 16];
  const a = await deliver(s.port, s.request); s.request.variableId = 'analysis-error';
  const b = await deliver(s.port, s.request); assert.notEqual(a.field.deliveryId, b.field.deliveryId);
  s.request.providerEvidence = {archiveId: 'foreign', receiptDigest: 'f'.repeat(64), companionVariableIds: ['mask']};
  assert.equal((await deliver(s.port, s.request)).status, 'INVALID_REQUEST'); delete s.request.providerEvidence;
  const record = s.port.records.get(s.request.source.archiveId); const tampered = JSON.parse(record.frameJson);
  tampered.payload.components[1].values[1] = 999; record.frameJson = JSON.stringify(tampered);
  assert.equal((await deliver(s.port, s.request)).status, 'SOURCE_INTEGRITY_FAILURE');
});
test('invalid budget types, exact cell count, oversized and Unicode metadata are bounded', async () => {
  const s = await asymmetricSetup();
  for (const key of ['maxCells', 'maxPayloadBytes']) for (const v of [0, -1, 1.5, '15', null, true, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    const r = clone(s.request); r.limits[key] = v; assert.equal((await deliver(s.port, r)).status, 'INVALID_REQUEST');
  }
  s.request.limits.maxCells = 15; assert.equal((await deliver(s.port, s.request)).status, 'DELIVERED_PARTIAL');
  s.request.limits.maxCells = 14; assert.equal((await deliver(s.port, s.request)).reason, 'cell-limit');
  const f = asymmetric(); f.spatial.verticalDatum = 'Synthetic 海🌊 '.repeat(300);
  const u = await setup(f); u.request.bounds = [-100, 10, -92, 16]; const a = await deliver(u.port, u.request);
  const json = JSON.stringify(a.field); const bytes = Buffer.byteLength(json, 'utf8'); assert.ok(bytes > json.length);
  u.request.limits.maxPayloadBytes = bytes; assert.equal((await deliver(u.port, u.request)).status, 'DELIVERED_PARTIAL');
  u.request.limits.maxPayloadBytes = bytes - 1; assert.equal((await deliver(u.port, u.request)).reason, 'payload-byte-limit');
  u.request.limits.maxPayloadBytes = 1000; assert.equal((await deliver(u.port, u.request)).field, null);
});
test('cancellation avoids initial read and cannot abort a pending archive operation', async () => {
  const s = await asymmetricSetup(); const c = new AbortController(); let calls = 0;
  c.abort(); assert.equal((await deliver({readExact: async () => { calls++; }}, s.request, c.signal)).status, 'DELIVERY_CANCELLED');
  assert.equal(calls, 0);
  let release; let settled = false; const next = new AbortController();
  const pending = deliver({readExact: () => new Promise(resolve => { release = resolve; })}, s.request, next.signal);
  pending.then(() => { settled = true; }); next.abort(); await Promise.resolve(); assert.equal(settled, false);
  release(await s.port.readExact(s.request.source.archiveId));
  const r = await pending; assert.equal(r.status, 'DELIVERY_CANCELLED'); assert.equal(r.field, null);
  // Post-read checkpoint is before transformation; there is no later async checkpoint.
});
test('nested axes, reasons, resolution, source provenance and companion references resist mutation', async () => {
  const s = await asymmetricSetup(); const r = await deliver(s.port, s.request);
  for (const mutate of [f => { f.grid.axes.x[0] = 0; }, f => { f.grid.values[0] = 42; },
    f => { f.grid.missing[2] = 'land'; }, f => { f.spatial.nativeResolution.x = 9; },
    f => { f.derivation.sourceAdapter.version = 'bad'; }, f => { f.derivation.sourceLineage.parentFrameIds.push('bad'); },
    f => { f.providerEvidence.receiptDigest = 'bad'; }, f => { f.providerEvidence.companionVariableIds.push('foreign'); }]) {
    assert.throws(() => mutate(r.field), TypeError);
  }
  assert.deepEqual(await deliver(s.port, s.request), r);
});
for (const variableId of ['ssh', 'sla', 'adt']) test(`synthetic ${variableId} scalar compatibility`, async () => {
  const f = asymmetric(); f.product.family = 'altimetry'; f.payload.components[0].variableId = variableId;
  f.payload.components[0].unit = 'm'; f.spatial.verticalDatum = 'synthetic-reference';
  const s = await setup(f); s.request.bounds = [-100, 10, -92, 16]; s.request.variableId = variableId;
  const r = await deliver(s.port, s.request); assert.equal(r.field.scalar.variableId, variableId);
  assert.equal(r.field.scalar.unit, 'm'); assert.equal(r.field.spatial.verticalDatum, 'synthetic-reference');
});
