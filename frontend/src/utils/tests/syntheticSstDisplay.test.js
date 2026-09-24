import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import * as display from '../syntheticSstDisplay.js';
import {orderPeloraLayers, enforcePeloraLayerOrder} from '../peloraMapStyle.js';
import {createViewportFieldRequests} from '../viewportFieldRequests.js';
import {writeOceanArchiveV1} from '../../../../shared/oceanProductArchive.mjs';
import {createSyntheticScalarRuntimeV1} from '../../../../backend/fields/scalarRuntime.js';
import {syntheticScalarFrame} from '../../../../backend/tests/fixtures/syntheticScalarFrame.js';
let record;
const port = {createIfAbsent: async (_id, r) => { record = r; return {outcome: 'created', durable: true, record}; },
  readExact: async () => ({status: 'found', durable: true, record})};
const archive = await writeOceanArchiveV1(port, syntheticScalarFrame(), {writeId: 'synthetic-write', archivedAt: '2026-09-03T00:00:00Z', storageReference: 'synthetic-memory', sourceRevision: 'synthetic-revision-1', rawEvidence: []});
const runtime = createSyntheticScalarRuntimeV1({port, selection: {selector: 'synthetic-day-v1', layer: 'synthetic-sst', variableId: 'temperature', archiveId: archive.receipt.archiveId, receiptDigest: archive.receipt.receiptDigest},
  limits: {maxSourceBytes: 30000, maxSourceCells: 6, maxCells: 6, maxPayloadBytes: 20000, maxHttpBytes: 22000}, generatedAt: '2026-09-03T01:00:00Z'});
const response = (await runtime(new URLSearchParams({mode: 'scalar', layer: 'synthetic-sst', evidence: 'synthetic-day-v1', component: 'temperature', bbox: '-90,25,-86,27', strideX: '1', strideY: '1'}))).body;
const field = display.parseSyntheticSstResponse(response);

test('actual archived runtime response is accepted without scientific mutation', () => {
  const before = JSON.stringify(response), parsed = display.parseSyntheticSstResponse(response);
  assert.deepEqual(parsed, response.field); assert.equal(JSON.stringify(response), before);
  assert.notEqual(parsed, response.field); assert.ok(Object.isFrozen(parsed.grid.values));
  assert.equal(parsed.scalar.unit, 'K'); assert.equal(parsed.product.evidenceClass, 'ANALYSIS');
});
test('non-synthetic, vector, wrong units and malformed numeric responses reject', () => {
  for (const mutate of [r => { r.synthetic = false; }, r => { r.field.product.providerId = 'NOAA'; },
    r => { r.field.scalar.variableId = 'u_current'; }, r => { r.field.scalar.unit = 'F'; },
    r => { r.field.product.evidenceClass = 'DIRECT_OBSERVATION'; }, r => { r.field.grid.values[0] = '0'; },
    r => { r.field.grid.missing[0] = 'land'; }, r => { r.field.grid.width = 2; },
    r => { r.field.grid.axes.x.reverse(); }, r => { r.field.source.receiptDigest = 'bad'; }]) {
    const r = structuredClone(response); mutate(r); assert.throws(() => display.parseSyntheticSstResponse(r));
  }
});
test('Kelvin and zero remain exact; Fahrenheit is presentation only', () => {
  assert.equal(field.grid.values[0], 0);
  assert.ok(Math.abs(display.kelvinToFahrenheit(273.15) - 32) < 1e-10);
  assert.ok(Math.abs(display.kelvinToFahrenheit(0) + 459.67) < 1e-10);
  for (const v of [null, undefined, '', '273.15', true, [], {}, NaN, Infinity]) assert.equal(display.kelvinToFahrenheit(v), null);
});
test('display plan preserves asymmetric source indexing and transparent missing rectangles', () => {
  const plan = display.sstDisplayPlan(field);
  assert.deepEqual(plan.rectangles.map(r => r.index), [0, 1, 3, 5]);
  assert.ok(plan.rectangles.find(r => r.index === 0).bounds[1] < plan.rectangles.find(r => r.index === 3).bounds[1]);
  assert.ok(plan.rectangles.find(r => r.index === 5).bounds[0] > plan.rectangles.find(r => r.index === 3).bounds[0]);
  assert.deepEqual(plan.coordinates, [[-90, 27], [-86, 27], [-86, 25], [-90, 25]]);
  assert.deepEqual(display.sstDisplayPlan(field), plan); assert.ok(Object.isFrozen(plan.rectangles));
});
test('grid renders only numeric cell footprints with no gap filling or antialiasing', () => {
  const grid = display.sstGridGeoJson(field);
  assert.deepEqual(grid.features.map(f => f.properties.sourceIndex), [0, 1, 3, 5]);
  assert.equal(display.sstLayer().paint['fill-antialias'], false);
  assert.equal(grid.features[0].geometry.type, 'Polygon');
  assert.ok(Object.isFrozen(grid.features));
});
test('continuous ordered display scale clips only colors and never alters Kelvin', () => {
  assert.equal(display.sstColor(0), display.sstColor(273.15));
  assert.notEqual(display.sstColor(283.15), display.sstColor(293.15));
  assert.equal(display.sstColor(null), null); assert.equal(field.grid.values[0], 0);
});
test('scalar slot is above relief and below coastline, currents and governed context', () => {
  const layers = [ {id: 'opportunity', metadata: {'pelora:visualSlot': 'opportunities'}},
    {id: 'signal', metadata: {'pelora:visualSlot': 'signals'}}, {id: 'structure-clusters'},
    {id: 'pelora-geostrophic-arrows'}, {id: 'countries-fill'}, {id: 'coastline'}, display.sstLayer(),
    {id: 'pelora-bathymetry-shading'}, {id: 'background'} ];
  assert.deepEqual(orderPeloraLayers(layers).map(l => l.id), ['background', 'pelora-bathymetry-shading', display.SST_REVIEW_LAYER,
    'coastline', 'countries-fill', 'pelora-geostrophic-arrows', 'structure-clusters', 'signal', 'opportunity']);
});
test('review hook has no default acquisition; disable cleans source and pending requests', () => {
  let effect, config, disposed = false, scheduled = 0;
  const sources = new Map(), layers = [], events = new Map();
  const map = {isStyleLoaded: () => true, getSource: id => sources.get(id), addSource: (id, s) => sources.set(id, {...s, setData() {}}),
    getLayer: id => layers.find(l => l.id === id), addLayer: l => layers.push(l), getStyle: () => ({layers}), moveLayer() {},
    setLayoutProperty() {}, removeLayer: id => layers.splice(layers.findIndex(l => l.id === id), 1), removeSource: id => sources.delete(id),
    on: (n, f) => events.set(n, f), off: n => events.delete(n), once: (n, f) => events.set(n, f),
    getBounds: () => ({getWest: () => -90, getSouth: () => 25, getEast: () => -86, getNorth: () => 27})};
  const context = vm.createContext({...display, enforcePeloraLayerOrder, useEffect: f => { effect = f; },
    sstGridGeoJson: () => ({type: 'FeatureCollection', features: []}), createViewportFieldRequests: c => { config = c; return {
      schedule: () => scheduled++, cancel() {}, dispose: () => { disposed = true; }}; }});
  const src = fs.readFileSync(new URL('../../hooks/useSyntheticSstReview.js', import.meta.url), 'utf8').replace(/^import[^\n]*\n/gm, '').replace('export function', 'function');
  vm.runInContext(src, context);
  context.useSyntheticSstReview({mapRef: {current: map}}); assert.equal(effect(), undefined); assert.equal(scheduled, 0);
  context.useSyntheticSstReview({mapRef: {current: map}, review: {enabled: true, request: async () => response}});
  const cleanup = effect(); assert.equal(scheduled, 1);
  config.onState('sst', {field, status: 'DELIVERED_PARTIAL'}); assert.ok(sources.has(display.SST_REVIEW_SOURCE));
  cleanup(); assert.equal(sources.size, 0); assert.equal(layers.length, 0); assert.equal(events.size, 0); assert.equal(disposed, true);
});
test('shared viewport lifecycle rejects late synthetic replies after cancel/dispose', async () => {
  let timer, resolve, states = [];
  const lifecycle = createViewportFieldRequests({setTimer: f => { timer = f; return 1; }, clearTimer() {},
    request: () => new Promise(r => { resolve = r; }), onState: (_l, s) => states.push(s)});
  lifecycle.schedule({bbox: [-90, 25, -86, 27]}, ['sst']); const running = timer(); lifecycle.cancel();
  resolve(field); await running; assert.ok(states.every(s => !s.field)); lifecycle.dispose();
});
test('normal Dashboard supplies no synthetic capability and production entry excludes review harness', () => {
  const dashboard = fs.readFileSync(new URL('../../components/Dashboard.jsx', import.meta.url), 'utf8');
  assert.ok(!dashboard.includes('syntheticSstReview'));
  const main = fs.readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  assert.ok(!main.includes('review/sst'));
});

test('unknown missingness stays transparent and scientific reference is not densified', () => {
  const r = structuredClone(response); r.field.grid.values[0] = null; r.field.grid.missing[0] = 'unknown';
  const parsed = display.parseSyntheticSstResponse(r), grid = display.sstGridGeoJson(parsed);
  assert.deepEqual(grid.features.map(f => f.properties.sourceIndex), [1, 3, 5]);
  assert.equal(field.grid.width, 3); assert.equal(field.grid.height, 2); assert.equal(field.grid.values[0], 0);
});
test('private texture diagnosis and scale fixtures are excluded from runtime renderer', () => {
  for (const path of ['../../hooks/useSyntheticSstReview.js', '../syntheticSstDisplay.js', '../../components/MapLibreIntelligenceMap.jsx']) {
    const source = fs.readFileSync(new URL(path, import.meta.url), 'utf8');
    assert.ok(!/imageSourceProbe|scalingProbe|texParameteri|node_modules/.test(source));
  }
});
