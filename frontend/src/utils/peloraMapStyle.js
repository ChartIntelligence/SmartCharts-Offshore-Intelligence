// Visual geography only: these colors carry no environmental meaning.
export const PELORA_BASEMAP_URL = 'https://demotiles.maplibre.org/style.json';
export const PELORA_MAP_COLORS = Object.freeze({
  ocean: '#101e29', land: '#090e13', coastline: '#cbd1d3', boundary: '#29343e', label: '#a3b0b9',
});
const clone = value => JSON.parse(JSON.stringify(value));

/** Transform the existing basemap before its first paint. Keep source attribution,
 * geographic geometry, glyphs and label identities; never synthesize place names.
 */
export function createPeloraMapStyle(style) {
  const next = clone(style);
  const required = ['background', 'countries-fill', 'coastline', 'countries-boundary', 'countries-label'];
  if (required.some(id => !next.layers?.some(layer => layer.id === id))) {
    throw new Error('Unsupported Pelora basemap schema');
  }
  const allowed = new Set([...required, 'crimea-fill']);
  next.name = 'Pelora Living Ocean';
  next.layers = next.layers.filter(layer => allowed.has(layer.id)).map(layer => {
    if (layer.id === 'background') layer.paint = {'background-color': PELORA_MAP_COLORS.ocean};
    else if (layer.type === 'fill') layer.paint = {'fill-color': PELORA_MAP_COLORS.land, 'fill-opacity': 1};
    else if (layer.id === 'coastline') layer.paint = {
      // Country polygon outlines are covered on their landward half by opaque land.
      // This leaves a thin geographic seaward edge, without bright inland borders.
      'line-color': PELORA_MAP_COLORS.coastline, 'line-width': ['interpolate', ['linear'], ['zoom'], 0, 1.5, 5, 2, 10, 2.4],
      'line-opacity': 0.7, 'line-blur': 0,
    };
    else if (layer.id === 'countries-boundary') layer.paint = {
      'line-color': PELORA_MAP_COLORS.boundary, 'line-width': 0.6, 'line-opacity': 0.55,
    };
    else if (layer.id === 'countries-label') {
      layer.paint = {'text-color': PELORA_MAP_COLORS.label, 'text-halo-color': PELORA_MAP_COLORS.land,
        'text-halo-width': 1.4, 'text-halo-blur': 0.3};
      layer.layout = {...layer.layout, 'text-size': ['interpolate', ['linear'], ['zoom'], 2, 10, 6, 13],
        'text-allow-overlap': false, 'text-ignore-placement': false};
    }
    return layer;
  });
  next.layers = orderPeloraLayers(next.layers);
  return next;
}

// Future layers can declare a visual slot without introducing data or consumers.
export const PELORA_LAYER_SLOTS = Object.freeze({background: 0, relief: 10, scalar: 20,
  coastline: 24, land: 25, geography: 30, currents: 40, places: 50, signals: 60, opportunities: 70, inspection: 80});
function slot(layer) {
  const declared = layer.metadata?.['pelora:visualSlot'];
  if (Object.hasOwn(PELORA_LAYER_SLOTS, declared)) return PELORA_LAYER_SLOTS[declared];
  if (layer.id === 'background') return 0;
  if (layer.id === 'pelora-bathymetry-shading') return 10;
  if (['chlorophyll-raster', 'pelora-sst-samples', 'pelora-chlorophyll-direct', 'pelora-chlorophyll-reconstructed'].includes(layer.id)) return 20;
  if (['countries-fill', 'crimea-fill'].includes(layer.id)) return 25;
  if (layer.id === 'coastline') return 24;
  if (['countries-boundary', 'countries-label'].includes(layer.id)) return 30;
  if (['pelora-geostrophic-arrows', 'pelora-current-observations'].includes(layer.id)) return 40;
  if (['structure-clusters', 'structure-cluster-count', 'fad-clusters', 'fad-cluster-count'].includes(layer.id)) return 50;
  if (layer.id === 'pelora-temperature-transition-samples') return 60;
  return 80; // Unknown application layers are not silently buried under geography.
}
export function orderPeloraLayers(layers) {
  return [...layers].sort((a, b) => slot(a) - slot(b));
}
/** Called on style changes, including asynchronously added fields. No paint/data edits.
 * Reentrant MapLibre styledata events are handled by the setup hook's guard.
 */
export function enforcePeloraLayerOrder(map) {
  const current = map.getStyle()?.layers ?? [];
  const desired = orderPeloraLayers(current);
  if (current.every((layer, i) => layer.id === desired[i].id)) return;
  // Move bottom-to-top; stable sorting preserves ordering within each semantic slot.
  for (const layer of desired) map.moveLayer(layer.id);
}
