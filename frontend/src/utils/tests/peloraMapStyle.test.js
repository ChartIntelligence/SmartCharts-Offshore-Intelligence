import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateStyleMin} from '@maplibre/maplibre-gl-style-spec';
import {createPeloraMapStyle, orderPeloraLayers, enforcePeloraLayerOrder, PELORA_MAP_COLORS, PELORA_BASEMAP_URL} from '../peloraMapStyle.js';

// Schema fixture only, no downloaded tiles or environmental observations.
function fixture() {
  return {version: 8, glyphs: 'https://example.invalid/{fontstack}/{range}.pbf',
    sources: {maplibre: {type: 'vector', url: 'https://example.invalid/tiles.json', attribution: 'Synthetic attribution'}},
    layers: [
      {id: 'background', type: 'background', paint: {'background-color': '#ffffff'}},
      {id: 'coastline', type: 'line', source: 'maplibre', 'source-layer': 'countries'},
      {id: 'countries-fill', type: 'fill', source: 'maplibre', 'source-layer': 'countries'},
      {id: 'countries-boundary', type: 'line', source: 'maplibre', 'source-layer': 'countries'},
      {id: 'countries-label', type: 'symbol', source: 'maplibre', 'source-layer': 'centroids', layout: {'text-field': '{NAME}', 'text-font': ['Open Sans Semibold']}},
      {id: 'geolines', type: 'line', source: 'maplibre', 'source-layer': 'geolines'},
      {id: 'geolines-label', type: 'symbol', source: 'maplibre', 'source-layer': 'geolines'},
      {id: 'unexpected-road-label', type: 'symbol', source: 'maplibre', 'source-layer': 'roads'},
    ]};
}
test('owned style validates with MapLibre specification and is deterministic/detached', () => {
  const input = fixture(), before = JSON.stringify(input), a = createPeloraMapStyle(input), b = createPeloraMapStyle(input);
  assert.deepEqual(validateStyleMin(a), []); assert.deepEqual(a, b); assert.equal(JSON.stringify(input), before);
  a.sources.maplibre.attribution = 'changed'; assert.equal(input.sources.maplibre.attribution, 'Synthetic attribution');
});
test('near-black land and distinct neutral ocean replace data-driven demo palette', () => {
  const layers = createPeloraMapStyle(fixture()).layers;
  assert.equal(layers.find(l => l.id === 'background').paint['background-color'], '#101e29');
  assert.equal(layers.find(l => l.id === 'countries-fill').paint['fill-color'], '#090e13');
  assert.notEqual(PELORA_MAP_COLORS.land, PELORA_MAP_COLORS.ocean);
  assert.equal(layers.find(l => l.id === 'coastline').paint['line-opacity'], 0.7);
});
test('only orientation labels retained with collision-aware subdued typography', () => {
  const input = fixture(), output = createPeloraMapStyle(input);
  assert.deepEqual(output.sources, input.sources); assert.equal(output.glyphs, input.glyphs);
  assert.deepEqual(output.layers.filter(l => l.type === 'symbol').map(l => l.id), ['countries-label']);
  const label = output.layers.find(l => l.id === 'countries-label');
  assert.equal(label.layout['text-field'], '{NAME}'); assert.equal(label.layout['text-allow-overlap'], false);
  assert.equal(label.paint['text-color'], '#a3b0b9');
  assert.ok(!output.layers.some(l => /geolines|road/.test(l.id)));
});
test('upstream schema changes fail rather than inventing geographic layers', () => {
  const f = fixture(); f.layers = f.layers.filter(l => l.id !== 'countries-fill');
  assert.throws(() => createPeloraMapStyle(f), /Unsupported/);
});
test('hierarchy is independent of late insertion and leaves layer data/paint unchanged', () => {
  const layers = [
    {id: 'ranked-fixture', metadata: {'pelora:visualSlot': 'opportunities'}},
    {id: 'pelora-temperature-transition-samples'}, {id: 'structure-clusters'}, {id: 'pelora-geostrophic-arrows'},
    ...createPeloraMapStyle(fixture()).layers,
    {id: 'pelora-sst-samples', paint: {'circle-color': '#123456'}}, {id: 'pelora-bathymetry-shading'},
  ];
  const before = JSON.stringify(layers), ordered = orderPeloraLayers(layers).map(l => l.id);
  for (const [low, high] of [['background', 'pelora-bathymetry-shading'], ['pelora-bathymetry-shading', 'pelora-sst-samples'],
    ['pelora-sst-samples', 'countries-fill'], ['countries-fill', 'countries-label'], ['countries-label', 'pelora-geostrophic-arrows'],
    ['pelora-geostrophic-arrows', 'structure-clusters'], ['structure-clusters', 'pelora-temperature-transition-samples'],
    ['pelora-temperature-transition-samples', 'ranked-fixture']]) assert.ok(ordered.indexOf(low) < ordered.indexOf(high));
  assert.equal(JSON.stringify(layers), before);
});
test('ordering converges and no-ops when already correct; future scalar slot fits', () => {
  let layers = [{id: 'structure-clusters'}, {id: 'background'}, {id: 'future-scalar', metadata: {'pelora:visualSlot': 'scalar'}},
    {id: 'countries-fill'}]; let moves = 0;
  const map = {getStyle: () => ({layers}), moveLayer(id) { moves++; const index = layers.findIndex(l => l.id === id); layers.push(...layers.splice(index, 1)); }};
  enforcePeloraLayerOrder(map); assert.deepEqual(layers.map(l => l.id), ['background', 'future-scalar', 'countries-fill', 'structure-clusters']);
  const count = moves; enforcePeloraLayerOrder(map); assert.equal(moves, count);
});
test('mobile sheet isolation and Opportunity DOM stacking remain explicit', () => {
  const css = fs.readFileSync(new URL('../../styles/dashboard.css', import.meta.url), 'utf8');
  assert.match(css, /\.map-intelligence-workspace \.maplibre-map\s*\{[^}]*isolation: isolate/s);
  assert.match(css, /\.maplibregl-marker\.smartcharts-marker-anchor\s*\{ z-index: 25/);
  assert.match(css, /\.maplibregl-marker\.pelora-open-water-opportunity-anchor\s*\{ z-index: 35/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /\.maplibregl-ctrl-group button\s*\{ width: 44px; height: 44px/);
});
test('active setup transforms the existing URL before loading and cleans up without a second map', () => {
  let effect, instances = 0, removed = false, transformed;
  const events = new Map();
  class MapDouble {
    constructor(options) { instances++; assert.equal(options.style, null); }
    on(name, ...args) { events.set(`${name}:${args.length}`, args); }
    once(name, ...args) { events.set(`${name}:${args.length}`, args); }
    off(name, ...args) { events.delete(`${name}:${args.length}`); }
    setStyle(url, options) { assert.equal(url, PELORA_BASEMAP_URL); transformed = options.transformStyle(undefined, fixture()); }
    addControl() {}
    remove() { removed = true; }
  }
  const context = vm.createContext({useEffect: fn => { effect = fn; },
    maplibregl: {Map: MapDouble, NavigationControl: class {}},
    PELORA_BASEMAP_URL, createPeloraMapStyle, enforcePeloraLayerOrder});
  const hook = fs.readFileSync(new URL('../../hooks/useMapLibreSetup.js', import.meta.url), 'utf8')
    .replace(/^import[^\n]+\r?\n/gm, '').replace('export function', 'function');
  vm.runInContext(hook, context);
  const mapRef = {current: null};
  context.useMapLibreSetup({containerRef: {current: {}}, mapRef, layers: {locations: true}});
  const cleanup = effect(); assert.equal(instances, 1); assert.equal(transformed.name, 'Pelora Living Ocean');
  assert.equal(effect(), undefined); assert.equal(instances, 1);
  cleanup(); assert.equal(mapRef.current, null); assert.equal(removed, true); assert.equal(events.size, 0);
  const remountCleanup = effect(); assert.equal(instances, 2);
  assert.equal(transformed.layers.find(l => l.id === 'background').paint['background-color'], '#101e29');
  remountCleanup(); assert.equal(events.size, 0); assert.equal(mapRef.current, null);
});
test('light geographic edge stays below opaque land but above future scalar fields', () => {
  const styled = createPeloraMapStyle(fixture());
  const coast = styled.layers.find(l => l.id === 'coastline');
  assert.equal(coast.source, 'maplibre'); assert.equal(coast['source-layer'], 'countries');
  assert.deepEqual(coast.paint, {'line-color': '#cbd1d3', 'line-width': ['interpolate', ['linear'], ['zoom'], 0, 1.5, 5, 2, 10, 2.4],
    'line-opacity': 0.7, 'line-blur': 0});
  const ordered = orderPeloraLayers([...styled.layers, {id: 'future-sst', metadata: {'pelora:visualSlot': 'scalar'}}]).map(l => l.id);
  assert.ok(ordered.indexOf('future-sst') < ordered.indexOf('coastline'));
  assert.ok(ordered.indexOf('coastline') < ordered.indexOf('countries-fill'));
  assert.equal(styled.layers.find(l => l.id === 'countries-fill').paint['fill-opacity'], 1);
});
test('neutral coastline has useful ocean contrast without blur or neon color', () => {
  const rgb = hex => hex.slice(1).match(/../g).map(v => parseInt(v, 16));
  const luminance = a => a.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const ocean = rgb(PELORA_MAP_COLORS.ocean), coast = rgb(PELORA_MAP_COLORS.coastline);
  const blended = coast.map((c, i) => c * 0.7 + ocean[i] * 0.3);
  const contrast = (luminance(blended) + 0.05) / (luminance(ocean) + 0.05);
  assert.ok(contrast > 3); assert.ok(Math.max(...coast) - Math.min(...coast) < 10);
  // This is ideal stroke contrast; antialiased subpixels are not an accessibility certification.
});
test('style reload is idempotent and source/geometry semantics remain unchanged', () => {
  const original = fixture(), once = createPeloraMapStyle(original), twice = createPeloraMapStyle(once);
  assert.deepEqual(twice, once);
  for (const layer of once.layers) {
    const base = original.layers.find(l => l.id === layer.id);
    assert.equal(layer.source, base.source); assert.equal(layer['source-layer'], base['source-layer']);
    assert.deepEqual(layer.filter, base.filter);
  }
});
test('late layer insertion repeatedly converges without changing scientific paint/source', () => {
  let layers = createPeloraMapStyle(fixture()).layers;
  const map = {getStyle: () => ({layers}), moveLayer(id) { const i = layers.findIndex(l => l.id === id); layers.push(...layers.splice(i, 1)); }};
  for (const added of [{id: 'pelora-temperature-transition-samples'}, {id: 'structure-clusters'},
    {id: 'pelora-geostrophic-arrows'}, {id: 'pelora-bathymetry-shading'},
    {id: 'future-scalar', metadata: {'pelora:visualSlot': 'scalar'}}]) {
    added.source = 'unchanged-evidence'; added.paint = {fixture: 0}; const before = JSON.stringify(added);
    layers.push(added); enforcePeloraLayerOrder(map); assert.equal(JSON.stringify(added), before);
    assert.deepEqual(layers.map(l => l.id), orderPeloraLayers(layers).map(l => l.id));
  }
});
