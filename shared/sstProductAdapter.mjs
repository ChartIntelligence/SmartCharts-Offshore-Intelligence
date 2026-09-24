import {OCEAN_PRODUCT_FRAME_CONTRACT, OCEAN_MISSING_REASONS,
  normalizeOceanProductFrameV1} from './oceanProductFrame.mjs';

export const SST_ADAPTER_CONTRACT = 'pelora-sst-product-adapter-v1';
const fail = path => { throw new TypeError(`Invalid SST adapter input: ${path}`); };
const finite = value => typeof value === 'number' && Number.isFinite(value);
const identifier = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._:/+-]*$/.test(value);
const requireId = (value, path) => { if (!identifier(value)) fail(path); };
const keys = (value, names, path) => {
  if (!value || Object.getPrototypeOf(value) !== Object.prototype ||
      Reflect.ownKeys(value).length !== names.length || names.some(k => !Object.hasOwn(value, k))) fail(path);
};
// Reject non-JSON evidence, accessors and sparse arrays; never coerce raw observations.
function copy(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || finite(value)) return value;
  if (Array.isArray(value)) {
    if (Reflect.ownKeys(value).length !== value.length + 1) fail('sparse/extended array');
    return Array.from({length: value.length}, (_, i) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(i));
      if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) fail('array property');
      return copy(descriptor.value);
    });
  }
  if (!value || Object.getPrototypeOf(value) !== Object.prototype) fail('non-JSON value');
  const result = {};
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (typeof key !== 'string' || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) fail('property');
    Object.defineProperty(result, key, {value: copy(descriptor.value), enumerable: true, writable: true});
  }
  return result;
}
const canonical = value => JSON.stringify(sort(value));
function sort(value) {
  return Array.isArray(value) ? value.map(sort) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(k => [k, sort(value[k])])) : value;
}
const same = (a, b) => canonical(a) === canonical(b);
const reason = value => value === null || OCEAN_MISSING_REASONS.includes(value);
const classes = ['DIRECT_OBSERVATION', 'ANALYSIS', 'DERIVED', 'RECONSTRUCTED', 'FORECAST'];
const supports = ['instant', 'interval', 'composite-window', 'unknown', 'forecast-valid-interval'];

function profile(q) {
  keys(q, ['qualificationId', 'qualificationVersion', 'status', 'reviewReference', 'product', 'streamId',
    'representationId', 'grid', 'supportKinds', 'providerScheme', 'variables'], 'qualification');
  for (const k of ['qualificationId', 'qualificationVersion', 'reviewReference', 'representationId']) requireId(q[k], k);
  if (q.status !== 'QUALIFIED') fail('qualification.status');
  if (q.streamId !== null) requireId(q.streamId, 'streamId');
  if (q.providerScheme !== null) requireId(q.providerScheme, 'providerScheme');
  keys(q.product, ['productId', 'providerId', 'datasetId', 'productVersion', 'family', 'processingLevel', 'evidenceClass'], 'product');
  for (const k of ['productId', 'providerId', 'family']) requireId(q.product[k], k);
  for (const k of ['datasetId', 'productVersion', 'processingLevel']) if (q.product[k] !== null) requireId(q.product[k], k);
  if (!classes.includes(q.product.evidenceClass)) fail('evidenceClass');
  keys(q.grid, ['coordinateSystem', 'crs', 'horizontalDatum', 'longitudeConvention', 'nativeResolution', 'deliveredResolution', 'resamplingMethod'], 'grid profile');
  if (q.grid.coordinateSystem !== 'geographic') fail('geographic grid required');
  requireId(q.grid.crs, 'crs'); requireId(q.grid.horizontalDatum, 'horizontalDatum');
  if (!/^EPSG:[1-9]\d*$/.test(q.grid.crs) || /^(unknown|unresolved)$/i.test(q.grid.horizontalDatum)) fail('unresolved CRS/datum');
  if (!['-180:180', '0:360'].includes(q.grid.longitudeConvention)) fail('longitudeConvention');
  for (const k of ['nativeResolution', 'deliveredResolution']) {
    const r = q.grid[k];
    keys(r, ['x', 'y', 'unit'], k);
    if (!finite(r.x) || r.x <= 0 || !finite(r.y) || r.y <= 0 || r.unit !== 'degree') fail(k);
  }
  if (q.grid.resamplingMethod !== null) requireId(q.grid.resamplingMethod, 'resamplingMethod');
  if (!same(q.grid.nativeResolution, q.grid.deliveredResolution) && q.grid.resamplingMethod === null) fail('resampling provenance');
  if (!Array.isArray(q.supportKinds) || !q.supportKinds.length || q.supportKinds.some(k => !supports.includes(k)) ||
      new Set(q.supportKinds).size !== q.supportKinds.length) fail('supportKinds');
  if (!Array.isArray(q.variables) || !q.variables.length) fail('variables');
  const ids = new Set();
  for (const v of q.variables) {
    keys(v, ['variableId', 'role', 'meaning', 'encoding', 'codes'], 'variable');
    requireId(v.variableId, 'variableId'); requireId(v.meaning, 'meaning');
    if (ids.has(v.variableId)) fail('duplicate variable'); ids.add(v.variableId);
    if (!['sst', 'uncertainty', 'flag'].includes(v.role)) fail('role');
    const e = v.encoding;
    keys(e, ['kind', 'unit', 'scaleFactor', 'addOffset', 'fillValues'], 'encoding');
    if (!['physical', 'packed'].includes(e.kind) || !Array.isArray(e.fillValues) ||
        e.fillValues.some(n => !finite(n)) || new Set(e.fillValues).size !== e.fillValues.length) fail('encoding');
    if (e.kind === 'physical' && (e.scaleFactor !== null || e.addOffset !== null)) fail('physical packing');
    if (e.kind === 'packed' && (!finite(e.scaleFactor) || e.scaleFactor <= 0 || !finite(e.addOffset))) fail('packing');
    if (v.role === 'flag') {
      if (e.kind !== 'physical' || e.unit !== '1' || !Array.isArray(v.codes) || !v.codes.length) fail('flag encoding');
      const codes = new Set();
      for (const code of v.codes) {
        keys(code, ['value', 'meaning', 'sstMissingReason'], 'flag code');
        requireId(code.meaning, 'flag meaning');
        if (!Number.isSafeInteger(code.value) || codes.has(code.value) || e.fillValues.includes(code.value) ||
            !reason(code.sstMissingReason)) fail('flag code');
        codes.add(code.value);
      }
    } else if (!['K', 'degC', 'degF'].includes(e.unit) || v.codes !== null) fail('temperature unit/codes');
  }
  if (q.variables.filter(v => v.role === 'sst').length !== 1 ||
      q.variables.filter(v => v.role === 'uncertainty').length > 1) fail('temperature roles');
  return q;
}

function decode(v, raw, missing, maskReason) {
  if (!reason(missing)) fail('missing reason');
  const e = v.encoding;
  const fill = finite(raw) && e.fillValues.includes(raw);
  if (raw !== null && !finite(raw)) fail('numeric evidence');
  if (maskReason !== null && missing !== null && maskReason !== missing) fail('mask/missing disagreement');
  const why = maskReason ?? missing ?? (fill ? 'provider-no-data' : null);
  if (raw === null || fill) {
    if (why === null) fail('missing reason required');
    return [null, why];
  }
  if (why !== null) fail('numeric value with missing reason');
  let value = e.kind === 'packed' ? raw * e.scaleFactor + e.addOffset : raw;
  if (v.role === 'flag') {
    if (!v.codes.some(c => c.value === value)) fail('unsupported provider flag');
  } else if (v.role === 'sst') {
    if (e.unit === 'degC') value += 273.15;
    if (e.unit === 'degF') value = (value - 32) * 5 / 9 + 273.15;
  } else {
    // Difference units never receive an absolute-temperature offset.
    if (e.unit === 'degF') value *= 5 / 9;
    if (value < 0) fail('negative uncertainty');
  }
  if (!finite(value)) fail('decoded nonfinite value');
  return [value, null];
}

/** Trusted, current registry snapshot only. No built-in products or qualification decisions.
 * Recreate this boundary when governance changes; this pure function cannot observe revocation.
 */
export function createSstProductAdapterV1(registryInput) {
  const registry = copy(registryInput);
  keys(registry, ['contractVersion', 'registryId', 'registryVersion', 'qualifications'], 'registry');
  if (registry.contractVersion !== SST_ADAPTER_CONTRACT) fail('contractVersion');
  requireId(registry.registryId, 'registryId'); requireId(registry.registryVersion, 'registryVersion');
  if (!Array.isArray(registry.qualifications)) fail('qualifications');
  const profiles = new Map();
  for (const input of registry.qualifications) {
    const q = profile(input);
    if (profiles.has(q.qualificationId)) fail('duplicate qualification');
    profiles.set(q.qualificationId, q);
  }
  return function normalizeSst(sourceInput) {
    const s = copy(sourceInput);
    keys(s, ['contractVersion', 'frameId', 'qualification', 'identity', 'grid', 'temporal', 'source',
      'axes', 'dimensions', 'components', 'coverage', 'lineage'], 'source');
    if (s.contractVersion !== SST_ADAPTER_CONTRACT) fail('contractVersion');
    keys(s.qualification, ['registryId', 'registryVersion', 'qualificationId', 'qualificationVersion'], 'qualification reference');
    const q = profiles.get(s.qualification.qualificationId);
    if (!q || s.qualification.registryId !== registry.registryId || s.qualification.registryVersion !== registry.registryVersion ||
        s.qualification.qualificationVersion !== q.qualificationVersion) fail('unsupported/stale qualification');
    keys(s.identity, ['providerId', 'productId', 'datasetId', 'productVersion', 'streamId', 'representationId'], 'identity');
    for (const k of ['providerId', 'productId', 'datasetId', 'productVersion']) if (s.identity[k] !== q.product[k]) fail(`identity.${k}`);
    if (s.identity.streamId !== q.streamId || s.identity.representationId !== q.representationId) fail('representation/stream');
    if (!same(s.grid, q.grid)) fail('grid qualification mismatch');
    if (!q.supportKinds.includes(s.temporal?.support?.kind)) fail('temporal support qualification');
    keys(s.source, ['objectId', 'revision', 'validator', 'receiptId', 'checksum', 'nominalTime'], 'source evidence');
    for (const k of ['objectId', 'receiptId']) requireId(s.source[k], k);
    for (const k of ['revision', 'validator']) if (s.source[k] !== null) requireId(s.source[k], k);
    if (typeof s.source.checksum !== 'string' || !/^sha256:[a-f0-9]{64}$/.test(s.source.checksum)) fail('source checksum');
    keys(s.axes, ['longitude', 'latitude'], 'axes');
    keys(s.dimensions, ['latitude', 'longitude'], 'dimensions');
    for (const [name, lower, upper] of [['latitude', -90, 90], ['longitude', q.grid.longitudeConvention === '0:360' ? 0 : -180,
      q.grid.longitudeConvention === '0:360' ? 360 : 180]]) {
      const a = s.axes[name];
      if (!Array.isArray(a) || !a.length || s.dimensions[name] !== a.length ||
          a.some((n, i) => !finite(n) || n < lower || n > upper || (i > 0 && n <= a[i - 1]))) fail(`axes.${name}`);
      if (name === 'longitude' && a[a.length - 1] - a[0] >= 360) fail('duplicate/wrapped meridian');
    }
    const count = s.axes.latitude.length * s.axes.longitude.length;
    if (!Array.isArray(s.components) || s.components.length !== q.variables.length) fail('components');
    const inputs = new Map();
    for (const c of s.components) {
      keys(c, ['variableId', 'values', 'missing'], 'component');
      if (inputs.has(c.variableId) || !Array.isArray(c.values) || !Array.isArray(c.missing) ||
          c.values.length !== count || c.missing.length !== count) fail('component shape');
      inputs.set(c.variableId, c);
    }
    const decoded = new Map(), mask = Array(count).fill(null);
    for (const v of q.variables) {
      const c = inputs.get(v.variableId); if (!c) fail('component identity');
      if (v.role !== 'flag') continue;
      const cells = c.values.map((raw, i) => decode(v, raw, c.missing[i], null));
      decoded.set(v.variableId, cells);
      cells.forEach(([value], i) => {
        if (value === null) return;
        const why = v.codes.find(code => code.value === value).sstMissingReason;
        if (mask[i] !== null && why !== null && mask[i] !== why) fail('conflicting masks');
        if (why !== null) mask[i] = why;
      });
    }
    const components = q.variables.map(v => {
      const c = inputs.get(v.variableId);
      const cells = decoded.get(v.variableId) ?? c.values.map((raw, i) => decode(v, raw, c.missing[i], v.role === 'sst' ? mask[i] : null));
      return {variableId: v.variableId, unit: v.role === 'flag' ? '1' : 'K', axis: null, positiveDirection: null,
        values: cells.map(c => c[0]), missing: cells.map(c => c[1])};
    });
    keys(s.coverage, ['completeness', 'basis'], 'coverage');
    if (!Array.isArray(s.lineage?.sourceRecordIds) || !s.lineage.sourceRecordIds.includes(s.source.objectId)) fail('source ancestry required');
    const x = s.axes.longitude, y = s.axes.latitude;
    const parameters = Object.entries({qualificationProfile: canonical(q), registryId: registry.registryId,
      registryVersion: registry.registryVersion, ...s.source}).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
      .map(([name, value]) => ({name, value}));
    // Check nominal reference timestamp without reclassifying it as an observation.
    if (s.source.nominalTime !== null) {
      const t = s.source.nominalTime;
      if (typeof t !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(t) ||
          !Number.isFinite(Date.parse(t)) || new Date(Date.parse(t)).toISOString() !== (t.includes('.') ? t : t.replace('Z', '.000Z'))) fail('nominalTime');
    }
    return normalizeOceanProductFrameV1({contractVersion: OCEAN_PRODUCT_FRAME_CONTRACT, frameId: s.frameId,
      product: q.product, temporal: s.temporal,
      spatial: {crs: q.grid.crs, horizontalDatum: q.grid.horizontalDatum, verticalDatum: null, coordinateOrder: 'x,y',
        bounds: [x[0], y[0], x.at(-1), y.at(-1)], boundsMeaning: 'payload-extent', nativeResolution: q.grid.nativeResolution,
        deliveredResolution: q.grid.deliveredResolution, resamplingMethod: q.grid.resamplingMethod,
        coverageCompleteness: s.coverage.completeness, coverageBasis: s.coverage.basis,
        landMask: components.some(c => c.missing.includes('land')) || q.variables.some(v => v.codes?.some(c => c.sstMissingReason === 'land'))
          ? 'explicit-cell-reasons' : 'not-supplied'},
      payload: {kind: components.length === 1 ? 'scalar' : 'multivariable', layout: 'rectilinear-grid', coordinates: null,
        axes: {x, y}, vectorBasis: null, components},
      quality: {providerScheme: q.providerScheme, flags: [], uncertainty: null},
      provenance: {sources: [{providerId: q.product.providerId, datasetId: q.product.datasetId, recordId: s.source.objectId,
        locatorId: s.source.receiptId, checksum: s.source.checksum}], adapterId: SST_ADAPTER_CONTRACT, adapterVersion: '1',
        steps: [{operationId: 'qualified-sst-normalization', version: '1', parameters}]},
      lineage: s.lineage});
  };
}
