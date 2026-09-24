import assert from 'node:assert/strict';
import {test} from 'node:test';
import {EventEmitter} from 'node:events';
import {writeOceanArchiveV1} from '../../shared/oceanProductArchive.mjs';
import {createSyntheticScalarRuntimeV1} from '../fields/scalarRuntime.js';
import {syntheticScalarFrame} from './fixtures/syntheticScalarFrame.js';
import {createPeloraServer} from '../server.js';

const params = extra => new URLSearchParams({mode: 'scalar', layer: 'synthetic-sst', evidence: 'synthetic-day-v1',
  component: 'temperature', bbox: '-90,25,-86,27', strideX: '1', strideY: '1', ...extra});
async function setup(overrides = {}, frame = syntheticScalarFrame()) {
  let stored;
  // In-memory TEST double simulates durable/atomic storage acknowledgements only.
  const port = {createIfAbsent: async (_id, record) => {
    const outcome = stored ? 'exists' : 'created'; stored ??= structuredClone(record);
    return {outcome, durable: true, record: stored};
  }, readExact: async id => stored?.receipt.archiveId === id ? {status: 'found', durable: true, record: stored} : {status: 'not-found'}};
  const archive = await writeOceanArchiveV1(port, frame, {writeId: 'synthetic-write',
    archivedAt: '2026-09-03T00:00:00Z', storageReference: 'synthetic-memory', sourceRevision: 'synthetic-revision-1', rawEvidence: []});
  assert.equal(archive.status, 'ARCHIVED');
  const configuration = {port, selection: {selector: 'synthetic-day-v1', layer: 'synthetic-sst', variableId: 'temperature',
    archiveId: archive.receipt.archiveId, receiptDigest: archive.receipt.receiptDigest},
    limits: {maxSourceBytes: 30000, maxSourceCells: 6, maxCells: 6, maxPayloadBytes: 20000, maxHttpBytes: 22000},
    generatedAt: '2026-09-03T01:00:00Z', ...overrides};
  return {port, archive, configuration, record: stored, runtime: createSyntheticScalarRuntimeV1(configuration)};
}
test('archived synthetic scalar reaches actual route without network or provider fallback', async () => {
  const s = await setup(); const server = createPeloraServer({scalarFieldRuntime: s.runtime,
    persistenceConfigurationProvider: () => { throw Error('Auth forbidden'); }});
  const request = Object.assign(new EventEmitter(), {method: 'GET', url: '/api/ocean/field?' + params(), headers: {host: 'localhost'}});
  const response = new EventEmitter(); let code, body;
  response.writeHead = status => { code = status; }; response.end = value => { body = JSON.parse(value); };
  await server.listeners('request')[0](request, response);
  assert.equal(code, 200); assert.equal(body.synthetic, true); assert.equal(body.status, 'DELIVERED_PARTIAL');
  assert.equal(body.field.source.receiptDigest, s.archive.receipt.receiptDigest);
  assert.equal(request.listenerCount('aborted'), 0); assert.equal(response.listenerCount('close'), 0);
});
test('default server refuses scalar fixture; no environment flag or query enables it', async () => {
  const server = createPeloraServer(); const req = Object.assign(new EventEmitter(), {method: 'GET', url: '/api/ocean/field?' + params(), headers: {host: 'localhost'}});
  const res = new EventEmitter(); let code, body; res.writeHead = n => { code = n; }; res.end = v => { body = JSON.parse(v); };
  await server.listeners('request')[0](req, res);
  assert.equal(code, 404); assert.equal(body.status, 'SCALAR_RUNTIME_DISABLED'); assert.equal(body.field, null);
});
test('asymmetric indexing, zero, missing and archive provenance remain intact', async () => {
  const s = await setup(); const r = await s.runtime(params()); const f = r.body.field;
  assert.deepEqual(f.grid.axes, {x: [-90, -88, -86], y: [25, 27]});
  assert.deepEqual(f.grid.values, [0, 280, null, 290, null, 292]);
  assert.deepEqual(f.grid.missing, [null, null, 'provider-no-data', null, 'land', null]);
  assert.equal(f.product.evidenceClass, 'ANALYSIS'); assert.equal(f.scalar.unit, 'K');
  assert.equal(f.temporal.support.kind, 'interval'); assert.equal(f.temporal.support.end, '2026-09-02T00:00:00.000Z');
  assert.deepEqual(f.spatial.nativeResolution, {x: 1, y: 1, unit: 'degree'});
  assert.equal(f.spatial.sourceDeliveredResolution.x, 2); assert.equal(f.spatial.deliveredResolution.x, 2);
  assert.equal(f.source.frameDigest, s.archive.receipt.frameDigest); assert.equal(f.source.contentDigest, s.archive.receipt.contentDigest);
  assert.deepEqual(f.derivation.sourceLineage, s.archive.frame.lineage);
  assert.ok(Object.isFrozen(f.grid.values));
});
test('viewport clipping and stride preserve exact selected cells and deterministic identity', async () => {
  const s = await setup(); const r = await s.runtime(params({bbox: '-89,24,-85,28', strideX: '2'}));
  assert.deepEqual(r.body.field.grid.values, [null, 292]);
  assert.deepEqual(r.body.field.spatial.requestedBounds, [-89, 24, -85, 28]);
  assert.deepEqual(r.body.field.spatial.deliveredBounds, [-86, 25, -86, 27]);
  assert.deepEqual(await s.runtime(params({bbox: '-89,24,-85,28', strideX: '2'})), r);
  assert.notEqual((await s.runtime(params())).body.field.deliveryId, r.body.field.deliveryId);
});
test('invalid, nonfinite and antimeridian bbox fail closed', async () => {
  const s = await setup();
  for (const bbox of ['170,0,-170,1', '-181,0,0,1', '0,-91,1,1', '0,1,1,0', '0,0,0,1', '0,,1,1', '0,0,Infinity,1', '0x10,0,17,1', 'null,0,1,1']) {
    const r = await s.runtime(params({bbox})); assert.equal(r.body.status, 'INVALID_BOUNDS'); assert.equal(r.body.field, null);
  }
});
test('unknown selectors/components/layers and private or duplicate query fields reject', async () => {
  const s = await setup();
  for (const [extra, status] of [[{layer: 'sst'}, 'UNSUPPORTED_SCALAR_LAYER'], [{component: 'mask'}, 'UNSUPPORTED_SCALAR_COMPONENT'],
    [{evidence: 'latest-sst'}, 'UNKNOWN_EVIDENCE_SELECTOR'], [{archiveId: 'path'}, 'INVALID_REQUEST'],
    [{species: 'fish'}, 'INVALID_REQUEST'], [{captainId: 'private'}, 'INVALID_REQUEST'], [{values: '[1]'}, 'INVALID_REQUEST'],
    [{strideX: '1.5'}, 'INVALID_REQUEST'], [{strideY: '0'}, 'INVALID_REQUEST']]) assert.equal((await s.runtime(params(extra))).body.status, status);
  const duplicate = params(); duplicate.append('bbox', '0,0,1,1'); assert.equal((await s.runtime(duplicate)).body.status, 'INVALID_REQUEST');
});
test('missing, unavailable, wrong receipt, corrupt and nonnumeric archive evidence remain distinct failures', async () => {
  const a = await setup(); a.port.readExact = async () => ({status: 'not-found'});
  assert.equal((await a.runtime(params())).body.status, 'ARCHIVE_NOT_FOUND');
  a.port.readExact = async () => { throw Error('secret'); };
  const unavailable = await a.runtime(params()); assert.equal(unavailable.body.status, 'SOURCE_UNAVAILABLE'); assert.ok(!JSON.stringify(unavailable).includes('secret'));
  for (const mutate of [r => { r.receipt.receiptDigest = '0'.repeat(64); }, r => { r.frameJson = '{bad'; },
    r => { const f = JSON.parse(r.frameJson); f.payload.components[0].values[0] = '0'; r.frameJson = JSON.stringify(f); }]) {
    const s = await setup(); mutate(s.record); assert.equal((await s.runtime(params())).body.status, 'SOURCE_INTEGRITY_FAILURE');
  }
  const s = await setup(); const runtime = createSyntheticScalarRuntimeV1({...s.configuration,
    selection: {...s.configuration.selection, receiptDigest: 'f'.repeat(64)}});
  assert.equal((await runtime(params())).body.status, 'SOURCE_INTEGRITY_FAILURE');
});
test('no selected cells is not empty success', async () => {
  const s = await setup(); const r = await s.runtime(params({bbox: '10,10,11,11'}));
  assert.equal(r.statusCode, 422); assert.equal(r.body.status, 'NO_DELIVERED_CELLS'); assert.equal(r.body.field, null);
});
test('source, cell, scalar JSON and HTTP JSON budgets are separate', async () => {
  const s = await setup();
  for (const [key, value, status, reason] of [['maxSourceBytes', 1, 'SOURCE_LIMIT_EXCEEDED', 'source-processing-budget'],
    ['maxSourceCells', 5, 'SOURCE_LIMIT_EXCEEDED', 'source-processing-budget'],
    ['maxCells', 5, 'DELIVERY_LIMIT_EXCEEDED', 'cell-limit'], ['maxPayloadBytes', 1, 'DELIVERY_LIMIT_EXCEEDED', 'payload-byte-limit'],
    ['maxHttpBytes', 1024, 'HTTP_PAYLOAD_LIMIT_EXCEEDED', 'json-response-body-budget']]) {
    const runtime = createSyntheticScalarRuntimeV1({...s.configuration, limits: {...s.configuration.limits, [key]: value}});
    const r = await runtime(params()); assert.equal(r.body.status, status); assert.equal(r.body.reason, reason); assert.equal(r.body.field, null);
  }
  const response = await s.runtime(params()), bytes = Buffer.byteLength(JSON.stringify(response.body));
  const exact = createSyntheticScalarRuntimeV1({...s.configuration, limits: {...s.configuration.limits, maxHttpBytes: bytes}});
  assert.equal((await exact(params())).statusCode, 200);
});
test('cancellation before/after archive read does not return values', async () => {
  const s = await setup(); const c = new AbortController(); c.abort();
  assert.equal((await s.runtime(params(), c.signal)).body.status, 'DELIVERY_CANCELLED');
  const c2 = new AbortController(); const original = s.port.readExact;
  s.port.readExact = async id => { c2.abort(); return original(id); };
  assert.equal((await s.runtime(params(), c2.signal)).body.field, null);
});
test('route disconnect suppresses response and cleans listeners', async () => {
  const s = await setup(); let release;
  const server = createPeloraServer({scalarFieldRuntime: async (_p, signal) => {
    await new Promise(resolve => { release = resolve; }); assert.equal(signal.aborted, true); return s.runtime(params(), signal);
  }});
  const req = Object.assign(new EventEmitter(), {method: 'GET', url: '/api/ocean/field?' + params(), headers: {host: 'localhost'}});
  const res = new EventEmitter(); res.writeHead = () => { throw Error('must not send'); }; res.end = res.writeHead;
  const pending = server.listeners('request')[0](req, res); res.emit('close'); release(); await pending;
  assert.equal(res.listenerCount('close'), 0);
});

async function route(query, options, headers = {}) {
  const server = createPeloraServer(options);
  const req = Object.assign(new EventEmitter(), {method: 'GET', url: '/api/ocean/field?' + query, headers: {host: 'localhost', ...headers}});
  const res = new EventEmitter(); let code, body;
  res.writeHead = n => { code = n; }; res.end = v => { body = JSON.parse(v); };
  await server.listeners('request')[0](req, res);
  return {code, body};
}

test('inherited runtime and truthy nonfunctions cannot enable synthetic evidence', async () => {
  const s = await setup();
  for (const options of [Object.create({scalarFieldRuntime: s.runtime}), {scalarFieldRuntime: 'true'}, {scalarFieldRuntime: true}]) {
    const r = await route(params(), options);
    assert.equal(r.code, 404); assert.equal(r.body.status, 'SCALAR_RUNTIME_DISABLED');
  }
});

test('unknown, blank and duplicate modes reject instead of falling through legacy dispatch', async () => {
  for (const mode of ['bogus', '', 'true', 'SCALAR']) {
    const r = await route(new URLSearchParams({mode, layer: 'currents', bbox: '0,0,0,1'}));
    assert.equal(r.code, 400); assert.equal(r.body.reason, 'invalid-field-mode');
  }
  const p = params(); p.append('mode', 'scalar');
  assert.equal((await route(p)).body.reason, 'invalid-field-mode');
});

test('query, headers, environment and accessor dependencies cannot activate default scalar mode', async () => {
  const previous = process.env.PELORA_SCALAR_RUNTIME;
  process.env.PELORA_SCALAR_RUNTIME = 'true';
  try {
    for (const extra of [{}, {enable: 'true'}, {component: 'NOAA'}, {evidence: '__proto__'}, {layer: 'currents'}]) {
      const r = await route(params(extra), undefined, {'x-scalar-runtime': 'true'});
      assert.equal(r.body.status, 'SCALAR_RUNTIME_DISABLED'); assert.equal(r.body.field, null);
    }
    const options = Object.defineProperty({}, 'scalarFieldRuntime', {get() { throw Error('must not inspect accessor'); }});
    assert.equal((await route(params(), options)).code, 404);
  } finally { if (previous === undefined) delete process.env.PELORA_SCALAR_RUNTIME; else process.env.PELORA_SCALAR_RUNTIME = previous; }
});

test('ordinary currents and bathymetry use actual legacy route with strictly local mock acquisition', async () => {
  const original = globalThis.fetch; let calls = 0;
  const time = new Date(Date.now() - 3600000).toISOString();
  globalThis.fetch = async url => {
    calls++;
    const table = url.includes('/info/') ? {rows: [['attribute', 'NC_GLOBAL', 'time_coverage_end', 'String', time]]}
      : decodeURIComponent(url).includes('u_current')
        ? {columnNames: ['time', 'latitude', 'longitude', 'u_current', 'v_current'], rows: [[time, 25, -90, 0, 0.2]]}
        : {columnNames: ['latitude', 'longitude', 'z'], rows: [[25, 270, 0], [27, 272, -20]]};
    return new Response(JSON.stringify({table}));
  };
  try {
    for (const layer of ['currents', 'bathymetry']) {
      const base = {layer, bbox: '-90,25,-88,27', density: '4', time: 'latest-available'};
      const r = await route(new URLSearchParams(base));
      assert.equal(r.code, 200); assert.equal(r.body.contractVersion, 'pelora-spatial-field-v1');
      assert.ok(!Object.hasOwn(r.body, 'synthetic'));
      const before = calls;
      for (const extra of [{bbox: '0,0,0,1'}, {density: '0'}, {density: '10000'}, {time: 'latest-qualified'}, {layer: 'synthetic-sst'}]) {
        const bad = await route(new URLSearchParams({...base, ...extra}));
        assert.equal(bad.code, 400); assert.equal(bad.body.contractVersion, 'pelora-spatial-field-v1');
        assert.equal(bad.body.status, 'unavailable'); assert.deepEqual(bad.body.candidates, []);
      }
      assert.equal(calls, before, 'invalid legacy requests cannot acquire');
    }
  } finally { globalThis.fetch = original; }
});

test('archive mutations and swapped records never yield a derivative', async () => {
  const mutations = [f => { f.frameId = 'other'; }, f => { f.payload.components[0].values[1] = 281; },
    f => { f.payload.components[0].missing[2] = 'land'; }, f => { f.payload.axes.x[0] = -91; },
    f => { f.temporal.support.start = '2026-08-01T00:00:00Z'; }, f => { f.lineage.parentFrameIds = []; },
    ...[true, [], {}, null].map(value => f => { f.payload.components[0].values[0] = value; })];
  for (const mutate of mutations) {
    const s = await setup(); const f = JSON.parse(s.record.frameJson); mutate(f); s.record.frameJson = JSON.stringify(f);
    const r = await s.runtime(params()); assert.equal(r.body.status, 'SOURCE_INTEGRITY_FAILURE'); assert.equal(r.body.field, null);
  }
  for (const mutate of [r => { r.receipt = null; }, r => { r.receipt.contractVersion = 'unsupported'; }]) {
    const s = await setup(); mutate(s.record);
    s.port.readExact = async () => ({status: 'found', durable: true, record: s.record});
    assert.equal((await s.runtime(params())).body.status, 'SOURCE_INTEGRITY_FAILURE');
  }
  const a = await setup(), b = await setup({}, syntheticScalarFrame('synthetic-other'));
  a.port.readExact = async () => ({status: 'found', durable: true, record: b.record});
  assert.equal((await a.runtime(params())).body.status, 'SOURCE_INTEGRITY_FAILURE');
});

test('selectors and components reject prototype, path, URL, provider and contract spoofing', async () => {
  const s = await setup();
  for (const evidence of ['__proto__', 'constructor', 'prototype', '../', 'C:\\secret', 'https://example.test', '', 'latest-qualified']) {
    assert.equal((await s.runtime(params({evidence}))).body.status, 'UNKNOWN_EVIDENCE_SELECTOR');
  }
  for (const component of ['analysis_error', 'mask', 'u_current', '__proto__', '']) {
    assert.equal((await s.runtime(params({component}))).body.status, 'UNSUPPORTED_SCALAR_COMPONENT');
  }
  for (const key of ['contractVersion', 'storageReference', 'providerUrl', 'module', 'frame', 'email', 'token', 'confidence', 'rank']) {
    assert.equal((await s.runtime(params({[key]: 'injected'}))).body.status, 'INVALID_REQUEST');
  }
});

test('real provider identities cannot be served as synthetic even with a valid archive', async () => {
  for (const providerId of ['NOAA', 'OSTIA', 'Open-Meteo', 'Copernicus']) {
    const f = syntheticScalarFrame(); f.product.providerId = providerId;
    const s = await setup({}, f); const r = await s.runtime(params());
    assert.equal(r.body.status, 'SOURCE_INTEGRITY_FAILURE'); assert.equal(r.body.field, null);
  }
  const realDataset = syntheticScalarFrame(); realDataset.product.datasetId = 'noaacwBLENDEDsstDaily';
  const mixed = await setup({}, realDataset);
  assert.equal((await mixed.runtime(params())).body.status, 'SOURCE_INTEGRITY_FAILURE');
  const s = await setup(); const r = await s.runtime(params());
  assert.equal(r.body.evidenceNotice, 'SYNTHETIC TEST EVIDENCE');
  assert.equal(r.body.field.temporal.providerPublishedAt, null);
  assert.equal(r.body.field.product.evidenceClass, 'ANALYSIS');
});

test('bounds and stride edge cases retain index anchored selection', async () => {
  const s = await setup();
  for (const strideX of ['0', '-1', '1.1', 'NaN', 'Infinity', '9007199254740992']) {
    assert.equal((await s.runtime(params({strideX}))).body.status, 'INVALID_REQUEST');
  }
  const one = await s.runtime(params({bbox: '-90.1,24.9,-89.9,25.1'}));
  assert.deepEqual(one.body.field.grid.values, [0]);
  const huge = await s.runtime(params({strideX: '9007199254740991', strideY: '9007199254740991'}));
  assert.deepEqual(huge.body.field.grid.values, [0]);
  assert.deepEqual((await s.runtime(params({bbox: '-89,26,-87,28'}))).body.field.grid.missing, ['land']);
});

test('exact canonical and HTTP byte boundaries and oversized metadata fail truthfully', async () => {
  const s = await setup(); const success = await s.runtime(params());
  // Key ordering does not change UTF-8 JSON length for this validated JSON field.
  for (const [key, bytes] of [['maxPayloadBytes', Buffer.byteLength(JSON.stringify(success.body.field))],
    ['maxHttpBytes', Buffer.byteLength(JSON.stringify(success.body))]]) {
    const make = n => createSyntheticScalarRuntimeV1({...s.configuration, limits: {...s.configuration.limits, [key]: n}});
    assert.equal((await make(bytes)(params())).statusCode, 200);
    assert.equal((await make(bytes - 1)(params())).statusCode, 413);
  }
  const f = syntheticScalarFrame();
  f.provenance.sources = Array.from({length: 500}, (_, i) => ({...f.provenance.sources[0], recordId: `synthetic-${i}`}));
  const large = await setup({}, f);
  assert.equal((await large.runtime(params())).body.status, 'SOURCE_LIMIT_EXCEEDED');
});

test('pending archive cancellation waits for port but suppresses scientific output', async () => {
  const s = await setup(); let release, reads = 0;
  s.port.readExact = async () => { reads++; await new Promise(resolve => { release = resolve; }); return {status: 'found', durable: true, record: s.record}; };
  const c = new AbortController(); c.abort(); await s.runtime(params(), c.signal); assert.equal(reads, 0);
  const pendingSignal = new AbortController(); let settled = false;
  const pending = s.runtime(params(), pendingSignal.signal).then(r => { settled = true; return r; });
  pendingSignal.abort(); await Promise.resolve(); assert.equal(settled, false);
  release(); const r = await pending; assert.equal(r.body.status, 'DELIVERY_CANCELLED'); assert.equal(r.body.field, null);
});

test('unexpected injected exception returns sanitized HTTP failure', async () => {
  const r = await route(params(), {scalarFieldRuntime: async () => { throw Error('C:\\secret token=private'); }});
  assert.equal(r.code, 500); assert.equal(r.body.reason, 'scalar-runtime-failed');
  assert.ok(!JSON.stringify(r).includes('private')); assert.equal(r.body.field, null);
});
