import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createHash} from 'node:crypto';
import {OCEAN_PRODUCT_FRAME_CONTRACT} from '../../shared/oceanProductFrame.mjs';
import {OCEAN_PRODUCT_ARCHIVE_CONTRACT, oceanArchiveIdentityV1 as identity,
  planOceanArchiveWriteV1 as plan, writeOceanArchiveV1 as write,
  readOceanArchiveV1 as read} from '../../shared/oceanProductArchive.mjs';

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

test('valid write receipt preserves identity, times, byte digest, versions and lineage', async () => {
  const r = await write(memory(), fixture(), intent());
  assert.equal(r.status, 'ARCHIVED'); assert.equal(r.duplicate, false);
  assert.equal(r.receipt.contractVersion, OCEAN_PRODUCT_ARCHIVE_CONTRACT);
  assert.equal(r.receipt.archivedAt, '2026-09-02T00:00:00.000Z');
  assert.equal(r.receipt.provenance.adapterVersion, '1');
  assert.deepEqual(r.receipt.lineage, fixture().lineage);
  assert.equal(r.receipt.temporal.support.kind, 'unknown');
  assert.equal(r.frame.temporal.observationTime, null);
  assert.equal(r.receipt.digestAlgorithm, 'SHA-256');
});
test('canonical digest is deterministic and independent of object key insertion order', () => {
  const reverse = v => Array.isArray(v) ? v.map(reverse) : v && typeof v === 'object'
    ? Object.fromEntries(Object.keys(v).reverse().map(k => [k, reverse(v[k])])) : v;
  assert.deepEqual(identity(fixture()), identity(reverse(fixture())));
  assert.deepEqual(plan(fixture(), intent()), plan(fixture(), intent()));
});
test('meaningful source array ordering changes content identity', () => {
  const a = fixture(); a.lineage.sourceRecordIds.push('source-2');
  const b = clone(a); b.lineage.sourceRecordIds.reverse();
  assert.notEqual(identity(a).contentDigest, identity(b).contentDigest);
});
test('same ID and evidence are idempotent, preserving original write receipt', async () => {
  const port = memory(); const first = await write(port, fixture(), intent());
  const later = intent('write-2'); later.archivedAt = '2026-09-03T00:00:00Z'; later.storageReference = 'another-ref';
  const second = await write(port, fixture(), later);
  assert.equal(second.duplicate, true); assert.deepEqual(second.receipt, first.receipt);
  assert.equal(port.records.size, 1);
});
test('same ID with changed values fails closed without overwriting', async () => {
  const port = memory(); const a = await write(port, fixture(), intent());
  const b = fixture(); b.payload.components[0].values[0] = 1;
  assert.equal((await write(port, b, intent())).status, 'ARCHIVE_COLLISION');
  assert.deepEqual((await read(port, lookup(b.frameId))).receipt, a.receipt);
});
test('different IDs with identical canonical content coexist and share content digest', async () => {
  const port = memory(); const a = await write(port, fixture(), intent());
  const b = await write(port, fixture('synthetic-b'), intent('write-b'));
  assert.notEqual(a.receipt.archiveId, b.receipt.archiveId);
  assert.notEqual(a.receipt.frameDigest, b.receipt.frameDigest);
  assert.equal(a.receipt.contentDigest, b.receipt.contentDigest); assert.equal(port.records.size, 2);
});
test('original NRT, corrected NRT and REP coexist; publication exact reference remains original', async () => {
  const port = memory(); const original = await write(port, fixture(), intent());
  const corrected = fixture('corrected'); corrected.provenance.sources[0].recordId = 'source-2';
  corrected.payload.components[0].values[0] = 2;
  const revision = {...intent('write-2'), sourceRevision: 'revision-2'};
  await write(port, corrected, revision);
  const rep = fixture('rep'); rep.product.datasetId = 'synthetic-reprocessed'; rep.product.productVersion = '2';
  await write(port, rep, {...intent('write-3'), sourceRevision: 'rep-1'});
  const replay = await read(port, {frameId: null, archiveId: original.receipt.archiveId});
  assert.equal(replay.frame.payload.components[0].values[0], 0); assert.equal(port.records.size, 3);
});
test('source revision or raw binding changes cannot reuse frame identity', async () => {
  for (const changed of [{...intent(), sourceRevision: 'revision-2'},
    {...intent(), rawEvidence: [{reference: 'raw-1', sha256: 'a'.repeat(64), availability: 'retained'}]}]) {
    const port = memory(); await write(port, fixture(), intent());
    assert.equal((await write(port, fixture(), changed)).status, 'ARCHIVE_COLLISION');
  }
});
test('exact read by either identity returns detached validated immutable frame', async () => {
  const port = memory(); const r = await write(port, fixture(), intent());
  const a = await read(port, lookup(r.frame.frameId));
  const b = await read(port, {frameId: null, archiveId: r.receipt.archiveId});
  assert.deepEqual(a, b); assert.notEqual(a.frame, r.frame);
  assert.throws(() => { a.frame.lineage.parentFrameIds.push('bad'); });
  assert.throws(() => { a.receipt.product.productVersion = 'bad'; });
});
test('not-found differs from storage unavailability', async () => {
  assert.equal((await read(memory(), lookup('absent'))).status, 'ARCHIVE_NOT_FOUND');
  assert.equal((await read({readExact: async () => {throw Error('secret');}}, lookup('absent'))).status, 'ARCHIVE_READ_UNAVAILABLE');
});
test('payload corruption, noncanonical bytes and malformed receipts fail integrity checks', async () => {
  for (const corrupt of [r => {r.frameJson = r.frameJson.replace('"values":[0,null]', '"values":[1,null]');},
    r => {r.frameJson += ' ';}, r => {r.receipt.contractVersion = 'unsupported';},
    r => {r.receipt.frameDigest = 'a'.repeat(64);}, r => {r.receipt.receiptDigest = 'b'.repeat(64);},
    r => {r.receipt.product.productVersion = 'wrong';}, r => {r.receipt.extra = true;}]) {
    const port = memory(); const r = await write(port, fixture(), intent());
    corrupt(port.records.get(r.receipt.archiveId));
    assert.equal((await read(port, lookup(r.frame.frameId))).status, 'ARCHIVE_INTEGRITY_FAILURE');
  }
});
test('misdirected storage read never returns another identity', async () => {
  const port = memory(); await write(port, fixture(), intent());
  const record = [...port.records.values()][0];
  assert.equal((await read({readExact: async () => ({status: 'found', durable: true, record})}, lookup('other'))).status, 'ARCHIVE_INTEGRITY_FAILURE');
});
test('write exceptions, malformed acknowledgements and volatile writes never claim archived', async () => {
  const failed = await write({createIfAbsent: async () => {throw Error('secret');}}, fixture(), intent());
  assert.deepEqual(failed, {status: 'ARCHIVE_WRITE_FAILED', reason: 'storage-unavailable-or-outcome-unknown'});
  const pending = await write(memory(false), fixture(), intent());
  assert.equal(pending.status, 'ARCHIVE_WRITE_PENDING'); assert.equal(Object.hasOwn(pending, 'receipt'), false);
  assert.equal((await write({createIfAbsent: async () => ({})}, fixture(), intent())).status, 'ARCHIVE_INTEGRITY_FAILURE');
});
test('non-durable read and incomplete stored content fail closed', async () => {
  const port = memory(false); await write(port, fixture(), intent());
  assert.equal((await read(port, lookup(fixture().frameId))).status, 'ARCHIVE_READ_UNAVAILABLE');
  port.records.set(identity(fixture()).archiveId, {receipt: {}});
  assert.equal((await read(port, lookup(fixture().frameId))).status, 'ARCHIVE_INTEGRITY_FAILURE');
});
test('static bathymetry does not acquire a fabricated observation time', async () => {
  const f = fixture(); f.product.family = 'bathymetry'; f.product.evidenceClass = 'STATIC_MODEL';
  f.temporal.support = {kind: 'static'};
  Object.assign(f.payload.components[0], {variableId: 'elevation', unit: 'm', positiveDirection: 'up'});
  const r = await write(memory(), f, intent());
  assert.equal(r.status, 'ARCHIVED'); assert.deepEqual(r.frame.temporal.support, {kind: 'static'});
  assert.equal(r.frame.temporal.observationTime, null);
});
test('aligned multivariable uncertainty and mask are preserved without scalar confidence', async () => {
  const f = fixture(); f.payload.kind = 'multivariable';
  f.payload.components.push({variableId: 'analysis-error', unit: 'K', axis: null, positiveDirection: null,
    values: [0.2, null], missing: [null, 'land']}, {variableId: 'provider-mask', unit: 'code', axis: null,
    positiveDirection: null, values: [1, 2], missing: [null, null]});
  const r = await write(memory(), f, intent());
  assert.deepEqual(r.frame.payload, f.payload); assert.equal(r.frame.quality.uncertainty, null);
  assert.equal(Object.hasOwn(r.receipt, 'confidence'), false);
});
test('vector currents and other scalar families need no archive-specific branches', async () => {
  for (const family of ['chlorophyll', 'altimetry', 'currents']) {
    const f = fixture(); f.product.family = family;
    if (family === 'currents') {
      f.payload.kind = 'vector'; f.payload.vectorBasis = 'east-north';
      f.payload.components[0].axis = 'east'; f.payload.components[0].unit = 'm/s';
      f.payload.components.push({...clone(f.payload.components[0]), variableId: 'north', axis: 'north'});
    }
    assert.equal((await write(memory(), f, intent())).status, 'ARCHIVED');
  }
});
test('zero and explicit missing reasons survive exact replay', async () => {
  for (const reason of ['provider-no-data', 'land', 'outside-coverage', 'invalid-observation', 'unknown']) {
    const port = memory(), f = fixture(); f.payload.components[0].missing[1] = reason;
    await write(port, f, intent()); const r = await read(port, lookup(f.frameId));
    assert.deepEqual(r.frame.payload.components[0].values, [0, null]);
    assert.deepEqual(r.frame.payload.components[0].missing, [null, reason]);
  }
});
test('raw references distinguish retained from reference-only; absent raw is not fabricated', async () => {
  const i = intent(); i.rawEvidence = [{reference: 'raw-object', sha256: 'a'.repeat(64), availability: 'reference-only'}];
  const r = await write(memory(), fixture(), i); assert.deepEqual(r.receipt.rawEvidence, i.rawEvidence);
  assert.equal((await write(memory(), fixture(), intent())).receipt.rawEvidence.length, 0);
});
test('caller inputs remain unchanged and planning freezes detached inputs', () => {
  const f = fixture(), i = intent(), before = JSON.stringify([f, i]); const p = plan(f, i);
  assert.equal(p.status, 'VALIDATED_NOT_ARCHIVED'); assert.equal(JSON.stringify([f, i]), before);
  f.payload.components[0].values[0] = 50; i.writeId = 'changed';
  assert.equal(p.frame.payload.components[0].values[0], 0); assert.equal(p.intent.writeId, 'write-1');
  assert.throws(() => {p.intent.rawEvidence.push({});});
});
test('unknown private fields, unsupported versions and malformed source values are rejected before storage', async () => {
  for (const key of ['captainId', 'privateNotes', 'catch', 'species', 'rank', 'token']) {
    await assert.rejects(write(memory(), {...fixture(), [key]: 'forbidden'}, intent()), TypeError);
    await assert.rejects(write(memory(), fixture(), {...intent(), [key]: 'forbidden'}), TypeError);
  }
  for (const value of [undefined, '0', false, NaN, Infinity, [], {}]) {
    const f = fixture(); f.payload.components[0].values[0] = value;
    await assert.rejects(write(memory(), f, intent()), TypeError);
  }
  await assert.rejects(write(memory(), {...fixture(), contractVersion: 'future'}, intent()), TypeError);
});
test('signed URL locators, invented times and non-JSON objects fail', () => {
  for (const i of [{...intent(), storageReference: 'https://example.invalid/a?token=x'},
    {...intent(), archivedAt: 'now'}, {...intent(), archivedAt: '2026-02-30T00:00:00Z'}]) assert.throws(() => plan(fixture(), i));
  const f = fixture(); Object.defineProperty(f, 'bad', {get() {throw Error('accessor ran');}, enumerable: true});
  assert.throws(() => plan(f, intent()), TypeError);
  const cycle = fixture(); cycle.loop = cycle; assert.throws(() => plan(cycle, intent()), TypeError);
  const sparse = fixture(); delete sparse.payload.components[0].values[0]; assert.throws(() => plan(sparse, intent()));
});
test('conditional-create port handles concurrent identical writers idempotently', async () => {
  const port = memory();
  const r = await Promise.all([write(port, fixture(), intent()), write(port, fixture(), intent('write-2'))]);
  assert.deepEqual(r.map(v => v.status), ['ARCHIVED', 'ARCHIVED']);
  assert.equal(r.filter(v => v.duplicate).length, 1); assert.equal(port.records.size, 1);
  assert.deepEqual(r[0].receipt, r[1].receipt);
});
test('concurrent conflicting writers leave exactly one immutable winner', async () => {
  const port = memory(), b = fixture(); b.payload.components[0].values[0] = 3;
  const r = await Promise.all([write(port, fixture(), intent()), write(port, b, intent())]);
  assert.deepEqual(r.map(v => v.status).sort(), ['ARCHIVED', 'ARCHIVE_COLLISION']); assert.equal(port.records.size, 1);
});
test('digest is the SHA-256 of exact stored UTF-8 frame bytes', async () => {
  const port = memory(); const r = await write(port, fixture(), intent());
  const bytes = [...port.records.values()][0].frameJson;
  assert.equal(r.receipt.frameDigest, createHash('sha256').update(bytes, 'utf8').digest('hex'));
  assert.equal(r.receipt.byteLength, Buffer.byteLength(bytes, 'utf8'));
});
test('exact lookup rejects ambiguous or unsupported selection fields', async () => {
  for (const q of [{frameId: null, archiveId: null}, {frameId: 'a', archiveId: 'x'},
    {frameId: 'a', archiveId: null, latest: true}, {frameId: null, archiveId: 'bad'}]) {
    await assert.rejects(read(memory(), q), TypeError);
  }
});

test('caller mutation while storage is pending cannot change accepted evidence', async () => {
  const backing = memory(); let release;
  const gate = new Promise(resolve => {release = resolve;});
  const port = {createIfAbsent: async (key, record) => {await gate; return backing.createIfAbsent(key, record);}};
  const f = fixture(), i = intent(); const writing = write(port, f, i);
  f.payload.components[0].values[0] = 9; i.sourceRevision = 'changed';
  release(); const r = await writing;
  assert.equal(r.frame.payload.components[0].values[0], 0);
  assert.equal(r.receipt.sourceRevision, 'revision-1');
});

test('new-write acknowledgement cannot substitute another valid receipt', async () => {
  const backing = memory(); const f = fixture();
  await write(backing, f, intent('other-write'));
  const port = {createIfAbsent: async key => ({outcome: 'created', durable: true, record: backing.records.get(key)})};
  assert.equal((await write(port, f, intent())).status, 'ARCHIVE_INTEGRITY_FAILURE');
});

test('lost acknowledgement does not claim success; exact read can resolve committed outcome', async () => {
  const backing = memory();
  const port = {createIfAbsent: async (key, record) => {
    await backing.createIfAbsent(key, record); throw Error('transport failed after commit');
  }};
  assert.equal((await write(port, fixture(), intent())).status, 'ARCHIVE_WRITE_FAILED');
  assert.equal((await read(backing, lookup(fixture().frameId))).status, 'ARCHIVED');
});

test('clock and randomness are not consulted when producing a plan', () => {
  const now = Date.now, random = Math.random;
  const expected = plan(fixture(), intent());
  try {
    Date.now = () => {throw Error('clock forbidden');};
    Math.random = () => {throw Error('random forbidden');};
    assert.deepEqual(plan(fixture(), intent()), expected);
  } finally {Date.now = now; Math.random = random;}
});

test('adversarial content changes each collide under the same declared identity', async () => {
  const mutations = [
    f => {f.product.productId = 'different-product';},
    f => {f.temporal.support = {kind: 'instant', at: '2026-09-03T00:00:00Z'};},
    f => {f.payload.axes.x[0] = -91;},
    f => {f.payload.components[0].values[0] = 10;},
    f => {f.payload.components[0].missing[1] = 'unknown';},
    f => {f.lineage.parentFrameIds.push('another-parent');},
    f => {f.quality.flags[0].value = true;},
    f => {f.provenance.sources[0].checksum = 'sha256:changed';}
  ];
  for (const mutate of mutations) {
    const port = memory(), a = fixture(), b = fixture(); mutate(b);
    const original = await write(port, a, intent());
    assert.notEqual(identity(a).contentDigest, identity(b).contentDigest);
    assert.equal((await write(port, b, intent())).status, 'ARCHIVE_COLLISION');
    assert.deepEqual((await read(port, lookup(a.frameId))).receipt, original.receipt);
  }
});

test('Unicode, escapes, nested parameter order and signed zero follow canonical JSON semantics', async () => {
  const f = fixture(); f.spatial.horizontalDatum = 'Synthetic café "quoted" \\ datum\nΩ';
  f.provenance.steps = [{operationId: 'synthetic', version: '1', parameters: [
    {name: 'first', value: 'é'}, {name: 'second', value: 'e\u0301'}]}];
  const reordered = clone(f); reordered.provenance.steps[0].parameters.reverse();
  assert.notEqual(identity(f).contentDigest, identity(reordered).contentDigest);
  const port = memory(); const negative = clone(f); negative.payload.components[0].values[0] = -0;
  assert.equal(identity(f).contentDigest, identity(negative).contentDigest);
  await write(port, negative, intent());
  const r = await read(port, lookup(f.frameId));
  assert.equal(Object.is(r.frame.payload.components[0].values[0], 0), true);
  assert.equal(r.frame.spatial.horizontalDatum, f.spatial.horizontalDatum);
  assert.deepEqual(r.frame.provenance.steps, f.provenance.steps);
  assert.deepEqual(r.receipt.rawEvidence, []);
  assert.throws(() => plan({...fixture(), quality: {}}, intent()), TypeError);
});

test('aligned uncertainty and mask changes independently alter the sealed evidence', async () => {
  const f = fixture(); f.payload.kind = 'multivariable';
  for (const variableId of ['error', 'mask']) f.payload.components.push({variableId,
    unit: variableId === 'error' ? 'K' : 'code', axis: null, positiveDirection: null,
    values: [0, 1], missing: [null, null]});
  for (const index of [1, 2]) {
    const port = memory(), changed = clone(f); changed.payload.components[index].values[0] = 2;
    await write(port, f, intent());
    assert.notEqual(identity(f).contentDigest, identity(changed).contentDigest);
    assert.equal((await write(port, changed, intent())).status, 'ARCHIVE_COLLISION');
  }
});

test('hostile null, false, misdirected and corrupt acknowledgements cannot claim ARCHIVED', async () => {
  const backing = memory(); await write(backing, fixture(), intent());
  const record = clone([...backing.records.values()][0]);
  const wrong = memory(); await write(wrong, fixture('other-frame'), intent());
  for (const acknowledgement of [null, {}, {outcome: 'created', record},
    {outcome: 'created', durable: 'true', record},
    {outcome: 'created', durable: false, record},
    {outcome: 'exists', durable: true, record: [...wrong.records.values()][0]},
    {outcome: 'created', durable: true, record: {...record, receipt: {...record.receipt, frameDigest: '0'.repeat(64)}}}]) {
    assert.notEqual((await write({createIfAbsent: async () => acknowledgement}, fixture(), intent())).status, 'ARCHIVED');
  }
});

test('receipt/payload swaps, locator corruption and missing record parts fail exact reads', async () => {
  for (const corrupt of [r => {delete r.receipt;}, r => {delete r.frameJson;},
    r => {r.receipt.contentDigest = '0'.repeat(64);}, r => {r.receipt.frameId = 'other';},
    r => {r.receipt.storageReference = 'wrong-storage';},
    r => {r.frameJson = JSON.stringify({...fixture(), payload: {}});},
    r => {r.receipt.rawEvidence = [{reference: 'raw', sha256: '0'.repeat(64), availability: 'retained'}];}]) {
    const port = memory(); const first = await write(port, fixture(), intent());
    corrupt(port.records.get(first.receipt.archiveId));
    assert.equal((await read(port, lookup(first.frame.frameId))).status, 'ARCHIVE_INTEGRITY_FAILURE');
  }
  const port = memory(); const a = await write(port, fixture(), intent());
  const b = await write(port, fixture('other'), intent());
  port.records.get(a.receipt.archiveId).frameJson = port.records.get(b.receipt.archiveId).frameJson;
  assert.equal((await read(port, lookup(a.frame.frameId))).status, 'ARCHIVE_INTEGRITY_FAILURE');
});

test('all nested returned evidence is frozen and independent of storage acknowledgement objects', async () => {
  const port = memory(); const i = intent();
  i.rawEvidence = [{reference: 'raw', sha256: 'a'.repeat(64), availability: 'retained'}];
  const r = await write(port, fixture(), i);
  const check = v => {if (v && typeof v === 'object') {assert.ok(Object.isFrozen(v)); Object.values(v).forEach(check);}};
  check(r);
  assert.throws(() => {r.receipt.rawEvidence[0].availability = 'reference-only';});
  assert.throws(() => {r.frame.provenance.sources[0].recordId = 'changed';});
  assert.deepEqual((await read(port, lookup(r.frame.frameId))).frame, r.frame);
  port.records.get(r.receipt.archiveId).receipt.rawEvidence[0].availability = 'reference-only';
  assert.equal(r.receipt.rawEvidence[0].availability, 'retained');
});
