// Presentation only. Scientific values and archive identities are never rewritten.
export const SST_REVIEW_SOURCE = 'pelora-review-sst';
export const SST_REVIEW_LAYER = 'pelora-review-sst-shading';
export const SST_RAMP = Object.freeze([
  Object.freeze({k: 273.15, color: '#354b70'}),
  Object.freeze({k: 283.15, color: '#427f96'}),
  Object.freeze({k: 293.15, color: '#91b7ad'}),
  Object.freeze({k: 303.15, color: '#e4cd92'}),
]);
const freeze = v => { if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
const fail = () => { throw Error('Unsupported synthetic SST response'); };
export const kelvinToFahrenheit = k => typeof k === 'number' && Number.isFinite(k) ? (k - 273.15) * 1.8 + 32 : null;
export function parseSyntheticSstResponse(response) {
  if (response?.contractVersion !== 'pelora-scalar-field-runtime-v1' || response.synthetic !== true ||
      response.evidenceNotice !== 'SYNTHETIC TEST EVIDENCE' || !['DELIVERED', 'DELIVERED_PARTIAL'].includes(response.status)) fail();
  const f = response.field, g = f?.grid;
  if (f?.contractVersion !== 'pelora-ocean-scalar-field-delivery-v1' ||
      f.product?.providerId !== 'synthetic' || !f.product?.productId?.startsWith('synthetic-') ||
      !f.product?.datasetId?.startsWith('synthetic-') || f.product?.family !== 'temperature' ||
      f.product.evidenceClass !== 'ANALYSIS' || f.scalar?.variableId !== 'temperature' || f.scalar.unit !== 'K' ||
      !/^osfd-[a-f0-9]{64}$/.test(f.deliveryId) || !/^opf-[a-f0-9]{64}$/.test(f.source?.archiveId) ||
      !['receiptDigest', 'contentDigest', 'frameDigest'].every(k => /^[a-f0-9]{64}$/.test(f.source?.[k])) ||
      f.spatial?.crs !== 'EPSG:4326' || f.spatial.horizontalDatum !== 'WGS84' ||
      g?.order !== 'y-row-x-column' || !Number.isSafeInteger(g.width) || !Number.isSafeInteger(g.height) ||
      g.width < 1 || g.height < 1 || g.width * g.height > 4096) fail();
  for (const [axis, count, limit] of [['x', g.width, 180], ['y', g.height, 85]]) {
    const a = g.axes?.[axis];
    if (!Array.isArray(a) || a.length !== count || a.some((v, i) => typeof v !== 'number' || !Number.isFinite(v) || Math.abs(v) > limit || (i && v <= a[i - 1]))) fail();
  }
  const reasons = ['provider-no-data', 'land', 'cloud', 'outside-coverage', 'temporal-gap', 'invalid-observation', 'unknown'];
  if (!Array.isArray(g.values) || !Array.isArray(g.missing) || g.values.length !== g.width * g.height || g.missing.length !== g.values.length) fail();
  g.values.forEach((v, i) => { if (v === null ? !reasons.includes(g.missing[i]) : typeof v !== 'number' || !Number.isFinite(v) || g.missing[i] !== null) fail(); });
  return freeze(JSON.parse(JSON.stringify(f)));
}
export function sstColor(k) {
  if (typeof k !== 'number' || !Number.isFinite(k)) return null;
  const value = Math.max(SST_RAMP[0].k, Math.min(SST_RAMP.at(-1).k, k));
  const hi = SST_RAMP.findIndex(s => s.k >= value), a = SST_RAMP[Math.max(0, hi - 1)], b = SST_RAMP[hi];
  const t = a === b ? 0 : (value - a.k) / (b.k - a.k);
  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const x = rgb(a.color), y = rgb(b.color);
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
}
export function sstDisplayPlan(field) {
  const {axes: {x, y}, width, values, missing} = field.grid;
  if (x.length < 2 || y.length < 2) return null; // No invented footprint for singleton axes.
  const west = x[0], east = x.at(-1), south = y[0], north = y.at(-1);
  const rectangles = [];
  y.forEach((lat, j) => x.forEach((lon, i) => {
    const index = j * width + i;
    if (missing[index] !== null) return;
    const left = i ? (x[i - 1] + lon) / 2 : west, right = i < x.length - 1 ? (lon + x[i + 1]) / 2 : east;
    const low = j ? (y[j - 1] + lat) / 2 : south, high = j < y.length - 1 ? (lat + y[j + 1]) / 2 : north;
    rectangles.push({index, bounds: [left, low, right, high], color: sstColor(values[index])});
  }));
  return freeze({coordinates: [[west, north], [east, north], [east, south], [west, south]], rectangles});
}
export function sstGridGeoJson(field) {
  const plan = sstDisplayPlan(field); if (!plan) return null;
  return freeze({type: 'FeatureCollection', features: plan.rectangles.map(r => {
    const [w, s, e, n] = r.bounds;
    return {type: 'Feature', properties: {sourceIndex: r.index, color: r.color},
      geometry: {type: 'Polygon', coordinates: [[[w,s],[e,s],[e,n],[w,n],[w,s]]]}};
  })});
}
export const sstLayer = () => ({id: SST_REVIEW_LAYER, type: 'fill', source: SST_REVIEW_SOURCE,
  metadata: {'pelora:visualSlot': 'scalar'}, paint: {'fill-color': ['get', 'color'], 'fill-opacity': 0.85, 'fill-antialias': false}});
