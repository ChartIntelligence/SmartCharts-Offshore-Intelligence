// Descriptive evidence only: no acquisition, storage, freshness policy or eligibility.
export const OCEAN_PRODUCT_FRAME_CONTRACT = 'pelora-ocean-product-frame-v1';

const fail = path => { throw new TypeError(`Invalid ocean product frame: ${path}`); };
const text = (value, path) => typeof value === 'string' && value.trim() ? value : fail(path);
const id = (value, path) => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._:/+-]*$/.test(value)
  ? value : fail(path);
const number = (value, path) => typeof value === 'number' && Number.isFinite(value) ? value : fail(path);
const positive = (value, path) => number(value, path) > 0 ? value : fail(path);
const nullable = validate => (value, path) => value === null ? null : validate(value, path);
const choice = options => (value, path) => options.includes(value) ? value : fail(path);
const list = validate => (value, path) => Array.isArray(value)
  ? Array.from(value, (item, i) => validate(item, `${path}[${i}]`)) : fail(path);
const object = fields => (value, path) => {
  if (!value || Object.getPrototypeOf(value) !== Object.prototype ||
      Object.keys(value).some(key => !Object.hasOwn(fields, key))) fail(path);
  return Object.fromEntries(Object.entries(fields).map(([key, validate]) =>
    [key, validate(value[key], `${path}.${key}`)]));
};
const timestamp = (value, path) => {
  // Explicit UTC and calendar validity; never infer a timezone or consult the clock.
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) fail(path);
  const parsed = Date.parse(value);
  const canonical = value.includes('.') ? value : value.replace('Z', '.000Z');
  if (!Number.isFinite(parsed) || new Date(parsed).toISOString() !== canonical) fail(path);
  return new Date(parsed).toISOString();
};
const pair = (value, path) => {
  const result = list(number)(value, path);
  if (result.length !== 2) fail(path);
  return result;
};
const resolution = nullable(object({x: positive, y: positive, unit: id}));
const primitive = (value, path) => value === null || typeof value === 'boolean' ? value
  : typeof value === 'number' ? number(value, path) : text(value, path);

export const OCEAN_MISSING_REASONS = Object.freeze([
  'provider-no-data', 'land', 'outside-coverage', 'cloud-obscuration',
  'acquisition-failure', 'temporal-gap', 'invalid-observation', 'unresolved-processing', 'unknown'
]);

function support(value, path) {
  const kind = value?.kind;
  if (kind === 'static') return object({kind: choice(['static'])})(value, path);
  if (kind === 'unknown') return object({kind: choice(['unknown']), reason: id})(value, path);
  if (kind === 'instant') return object({kind: choice(['instant']), at: timestamp})(value, path);
  const result = object({kind: choice(['interval', 'composite-window', 'forecast-valid-interval']),
    start: timestamp, end: timestamp})(value, path);
  if (Date.parse(result.start) >= Date.parse(result.end)) fail(`${path}.interval`);
  return result;
}

const schema = object({
  contractVersion: choice([OCEAN_PRODUCT_FRAME_CONTRACT]),
  frameId: id,
  product: object({productId: id, providerId: id, datasetId: nullable(id), productVersion: nullable(id),
    family: id, processingLevel: nullable(id),
    evidenceClass: choice(['DIRECT_OBSERVATION', 'ANALYSIS', 'DERIVED', 'RECONSTRUCTED', 'STATIC_MODEL', 'FORECAST'])}),
  temporal: object({support, observationTime: nullable(timestamp), forecastIssuedAt: nullable(timestamp),
    providerPublishedAt: nullable(timestamp), acquiredAt: timestamp, processedAt: nullable(timestamp)}),
  spatial: object({crs: nullable(id), horizontalDatum: nullable(text), verticalDatum: nullable(text),
    coordinateOrder: choice(['x,y']), bounds: nullable(list(number)),
    boundsMeaning: choice(['payload-extent', 'provider-coverage', 'unknown']),
    nativeResolution: resolution, deliveredResolution: resolution,
    resamplingMethod: nullable(id), coverageCompleteness: choice(['complete', 'partial', 'unknown']),
    coverageBasis: id, landMask: choice(['explicit-cell-reasons', 'not-supplied', 'unknown'])}),
  payload: object({kind: choice(['scalar', 'vector', 'multivariable']), layout: choice(['points', 'rectilinear-grid']),
    coordinates: nullable(list(pair)), axes: nullable(object({x: list(number), y: list(number)})),
    vectorBasis: nullable(choice(['east-north', 'grid-relative', 'unknown'])),
    components: list(object({variableId: id, unit: id, axis: nullable(id), positiveDirection: nullable(id),
      values: list(nullable(number)), missing: list(nullable(choice(OCEAN_MISSING_REASONS)))}))}),
  quality: object({providerScheme: nullable(id), flags: list(object({flagId: id, value: primitive})),
    uncertainty: nullable(object({value: number, unit: id, meaning: text}))}),
  provenance: object({sources: list(object({providerId: id, datasetId: nullable(id), recordId: nullable(id),
    locatorId: nullable(id), checksum: nullable(id)})), adapterId: id, adapterVersion: id,
    steps: list(object({operationId: id, version: id,
      parameters: list(object({name: id, value: primitive}))}))}),
  lineage: object({parentFrameIds: list(id), sourceRecordIds: list(id),
    completeness: choice(['complete', 'partial', 'unknown'])})
});

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

/** Strict clone/validation. Explicit null means unknown; missing fields are malformed.
 * Success proves structural validity, NOT source qualification or consumer eligibility.
 * IDs are supplied by a future archive writer; this function creates no identity.
 */
export function normalizeOceanProductFrameV1(input) {
  const frame = schema(input, 'frame');
  const {payload, spatial, temporal, product, lineage} = frame;
  if (spatial.bounds !== null && (spatial.bounds.length !== 4 || spatial.bounds[0] > spatial.bounds[2] ||
      spatial.bounds[1] > spatial.bounds[3])) fail('spatial.bounds');
  // No geographic range assumptions for projected/unknown CRS. Wrapped regions use separate frames.
  let count;
  if (payload.layout === 'points') {
    if (!payload.coordinates || payload.axes !== null) fail('payload.points');
    count = payload.coordinates.length;
  } else {
    if (!payload.axes || payload.coordinates !== null) fail('payload.grid');
    for (const axis of [payload.axes.x, payload.axes.y]) {
      if (!axis.length || axis.some((v, i) => i > 0 && v <= axis[i - 1])) fail('payload.axes');
    }
    // Grid order is y ascending rows, x ascending columns. Reordering belongs in a logged adapter step.
    count = payload.axes.x.length * payload.axes.y.length;
  }
  if (!payload.components.length || new Set(payload.components.map(c => c.variableId)).size !== payload.components.length)
    fail('payload.components');
  if (payload.kind === 'scalar' && payload.components.length !== 1) fail('payload.scalar');
  if (payload.kind === 'vector') {
    if (payload.components.length !== 2 || !payload.vectorBasis ||
        payload.components.some(c => c.axis === null) || payload.components[0].axis === payload.components[1].axis ||
        payload.components[0].unit !== payload.components[1].unit) fail('payload.vector');
    if (payload.vectorBasis === 'east-north' && payload.components.map(c => c.axis).join(',') !== 'east,north') fail('payload.vector.axes');
  } else if (payload.vectorBasis !== null) fail('payload.vectorBasis');
  for (const component of payload.components) {
    if (component.values.length !== count || component.missing.length !== count) fail('payload.component.length');
    component.values.forEach((value, i) => {
      if ((value === null) !== (component.missing[i] !== null)) fail('payload.component.missing');
    });
  }
  if (product.evidenceClass === 'STATIC_MODEL' && temporal.support.kind !== 'static') fail('temporal.static');
  if (temporal.support.kind === 'static' && (temporal.observationTime !== null || temporal.forecastIssuedAt !== null)) fail('temporal.staticTime');
  if (product.evidenceClass !== 'FORECAST' && temporal.forecastIssuedAt !== null) fail('temporal.forecastIssuedAt');
  if (temporal.support.kind === 'forecast-valid-interval' && product.evidenceClass !== 'FORECAST') fail('temporal.forecastSupport');
  if (frame.quality.uncertainty && frame.quality.uncertainty.value < 0) fail('quality.uncertainty');
  if (lineage.parentFrameIds.includes(frame.frameId)) fail('lineage.self');
  for (const refs of [lineage.parentFrameIds, lineage.sourceRecordIds]) if (new Set(refs).size !== refs.length) fail('lineage.duplicates');
  return freeze(frame);
}

/** Stable object-key order, preserved array order. Not a cryptographic identity algorithm. */
export function serializeOceanProductFrameV1(input) {
  const sorted = value => Array.isArray(value) ? value.map(sorted) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, sorted(value[key])])) : value;
  return JSON.stringify(sorted(normalizeOceanProductFrameV1(input)));
}

/** Positive common-ancestry detection only; no shared reference NEVER proves independence. */
export function inspectOceanFrameAncestryV1(leftId, rightId, inputs) {
  id(leftId, 'leftId'); id(rightId, 'rightId');
  if (!Array.isArray(inputs)) fail('lineage.frames');
  const frames = new Map();
  for (const input of inputs) {
    const frame = normalizeOceanProductFrameV1(input);
    if (frames.has(frame.frameId)) fail('lineage.duplicateFrameId');
    frames.set(frame.frameId, frame);
  }
  function trace(start) {
    const refs = new Set(), missing = new Set(), visited = new Set(), active = new Set();
    let incomplete = false;
    function visit(frameId) {
      if (active.has(frameId)) fail('lineage.cycle');
      if (visited.has(frameId)) return;
      refs.add(`frame:${frameId}`);
      const frame = frames.get(frameId);
      if (!frame) { missing.add(frameId); incomplete = true; return; }
      active.add(frameId);
      if (frame.lineage.completeness !== 'complete') incomplete = true;
      frame.lineage.sourceRecordIds.forEach(ref => refs.add(`source:${ref}`));
      frame.lineage.parentFrameIds.forEach(visit);
      active.delete(frameId); visited.add(frameId);
    }
    visit(start);
    return {refs, missing, incomplete};
  }
  const left = trace(leftId), right = trace(rightId);
  const sharedReferences = [...left.refs].filter(ref => right.refs.has(ref)).sort();
  return freeze({status: sharedReferences.length ? 'shared-ancestry' : 'not-established',
    sharedReferences, incomplete: left.incomplete || right.incomplete,
    missingFrameIds: [...new Set([...left.missing, ...right.missing])].sort()});
}
