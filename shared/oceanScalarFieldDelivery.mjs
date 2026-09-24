import {createHash} from 'node:crypto';
import {readOceanArchiveV1} from './oceanProductArchive.mjs';

export const OCEAN_SCALAR_FIELD_DELIVERY_CONTRACT = 'pelora-ocean-scalar-field-delivery-v1';
export const OCEAN_SCALAR_FIELD_DELIVERY_ADAPTER = 'pelora-ocean-scalar-field-delivery-adapter-v1';
const sort = v => Array.isArray(v) ? v.map(sort) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sort(v[k])])) : v;
const canonical = v => JSON.stringify(sort(v));
const hash = v => createHash('sha256').update(canonical(v), 'utf8').digest('hex');
function freeze(v) {
  if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); }
  return v;
}
const result = (status, reason, field = null) => freeze({status, reason, field});
const fail = () => { throw new TypeError('Invalid scalar delivery request'); };
// Reject accessors, non-JSON types, sparse arrays and unknown fields before any port call.
function copy(v, seen = new Set()) {
  if (v === null || typeof v === 'string' || typeof v === 'boolean') return v;
  if (typeof v === 'number') return Number.isFinite(v) ? v : fail();
  if (!v || typeof v !== 'object' || seen.has(v)) fail();
  seen.add(v);
  const array = Array.isArray(v);
  if (!array && Object.getPrototypeOf(v) !== Object.prototype) fail();
  const names = Reflect.ownKeys(v);
  if (array && names.length !== v.length + 1) fail();
  const out = array ? [] : {};
  for (const k of names) {
    if (array && k === 'length') continue;
    const d = Object.getOwnPropertyDescriptor(v, k);
    if (typeof k !== 'string' || !d.enumerable || !Object.hasOwn(d, 'value') ||
        (array && (!/^(0|[1-9]\d*)$/.test(k) || Number(k) >= v.length))) fail();
    Object.defineProperty(out, k, {value: copy(d.value, seen), enumerable: true, writable: true});
  }
  seen.delete(v);
  return out;
}
function keys(v, names) {
  if (!v || Array.isArray(v) || Object.getPrototypeOf(v) !== Object.prototype ||
      Object.keys(v).length !== names.length || names.some(k => !Object.hasOwn(v, k))) fail();
}
const positiveInteger = n => Number.isSafeInteger(n) && n > 0;
function bounds(b) {
  return Array.isArray(b) && b.length === 4 && b.every(n => typeof n === 'number' && Number.isFinite(n)) &&
    b[0] >= -180 && b[2] <= 180 && b[1] >= -90 && b[3] <= 90 && b[0] < b[2] && b[1] < b[3];
}
function spacing(axis) {
  if (axis.length < 2) return null;
  const delta = axis[1] - axis[0];
  return axis.slice(1).every((n, i) => n - axis[i] === delta) ? delta : null;
}

/** Exact archive read through the existing contract; no storage/provider implementation.
 * limits bound the canonical UTF-8 FIELD, not transport headers/compression or source reads.
 * signal is an optional caller-owned AbortSignal, checked around the asynchronous port call.
 */
export async function deliverOceanScalarFieldV1(port, input, signal = null) {
  let request;
  try {
    request = copy(input);
    keys(request, ['source', 'variableId', 'bounds', 'stride', 'limits', 'generatedAt']);
    keys(request.source, ['archiveId', 'receiptDigest']);
    if (typeof request.source.archiveId !== 'string' || !/^opf-[a-f0-9]{64}$/.test(request.source.archiveId) ||
        typeof request.source.receiptDigest !== 'string' || !/^[a-f0-9]{64}$/.test(request.source.receiptDigest) ||
        typeof request.variableId !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._:/+-]*$/.test(request.variableId)) fail();
    keys(request.stride, ['x', 'y']); keys(request.limits, ['maxCells', 'maxPayloadBytes']);
    if (![...Object.values(request.stride), ...Object.values(request.limits)].every(positiveInteger)) fail();
    if (typeof request.generatedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(request.generatedAt)) fail();
    const timestamp = new Date(request.generatedAt).toISOString();
    if (timestamp !== (request.generatedAt.includes('.') ? request.generatedAt : request.generatedAt.replace('Z', '.000Z'))) fail();
    request.generatedAt = timestamp;
  } catch { return result('INVALID_REQUEST', 'invalid-or-unknown-request-fields'); }
  if (!bounds(request.bounds)) return result('INVALID_BOUNDS', 'ordered-non-crossing-geographic-bounds-required');
  if (signal?.aborted) return result('DELIVERY_CANCELLED', 'caller-cancelled');
  let source;
  try { source = await readOceanArchiveV1(port, {archiveId: request.source.archiveId, frameId: null}); }
  catch { return result('SOURCE_UNAVAILABLE', 'invalid-archive-port'); }
  if (signal?.aborted) return result('DELIVERY_CANCELLED', 'caller-cancelled');
  if (source.status === 'ARCHIVE_INTEGRITY_FAILURE') return result('SOURCE_INTEGRITY_FAILURE', 'archive-validation-failed');
  if (source.status !== 'ARCHIVED') return result('SOURCE_UNAVAILABLE', source.status);
  const {frame, receipt} = source;
  if (receipt.receiptDigest !== request.source.receiptDigest) return result('SOURCE_INTEGRITY_FAILURE', 'pinned-receipt-mismatch');
  const {payload, spatial} = frame;
  const component = payload.components.find(c => c.variableId === request.variableId);
  if (payload.kind === 'vector' || !component || component.axis !== null) return result('UNSUPPORTED_SCALAR_COMPONENT', 'scalar-component-required');
  // Explicit geographic CRS pairs only. No datum inference, conversion or longitude wrapping.
  const datums = {'EPSG:4326': 'WGS84', 'EPSG:4269': 'NAD83', 'EPSG:4267': 'NAD27'};
  if (payload.layout !== 'rectilinear-grid' || !Object.hasOwn(datums, spatial.crs) ||
      spatial.horizontalDatum !== datums[spatial.crs]) return result('UNSUPPORTED_GRID', 'explicit-supported-geographic-grid-required');
  const {x, y} = payload.axes;
  if (x.some(n => n < -180 || n > 180) || y.some(n => n < -90 || n > 90)) return result('UNSUPPORTED_GRID', 'geographic-axes-out-of-range');
  const extent = [x[0], y[0], x.at(-1), y.at(-1)];
  if (spatial.bounds && (extent[0] < spatial.bounds[0] || extent[1] < spatial.bounds[1] ||
      extent[2] > spatial.bounds[2] || extent[3] > spatial.bounds[3])) return result('UNSUPPORTED_GRID', 'axes-outside-declared-source-bounds');
  const [west, south, east, north] = request.bounds;
  // Global source-index anchor makes neighboring viewport/chunk selections consistent.
  const ix = [], iy = [];
  x.forEach((n, i) => { if (n >= west && n <= east && i % request.stride.x === 0) ix.push(i); });
  y.forEach((n, i) => { if (n >= south && n <= north && i % request.stride.y === 0) iy.push(i); });
  if (!ix.length || !iy.length) return result('NO_DELIVERED_CELLS', 'no-source-samples-selected');
  if (ix.length * iy.length > request.limits.maxCells) return result('DELIVERY_LIMIT_EXCEEDED', 'cell-limit');
  try {
    const axes = {x: ix.map(i => x[i]), y: iy.map(i => y[i])};
    const values = [], missing = [];
    for (const j of iy) for (const i of ix) {
      values.push(component.values[j * x.length + i]); missing.push(component.missing[j * x.length + i]);
    }
    const partial = missing.some(m => m !== null) || west < extent[0] || south < extent[1] ||
      east > extent[2] || north > extent[3] || spatial.coverageCompleteness !== 'complete';
    const body = {
      contractVersion: OCEAN_SCALAR_FIELD_DELIVERY_CONTRACT,
      adapterVersion: OCEAN_SCALAR_FIELD_DELIVERY_ADAPTER,
      source: {archiveId: receipt.archiveId, frameId: receipt.frameId, receiptDigest: receipt.receiptDigest,
        contentDigest: receipt.contentDigest, frameDigest: receipt.frameDigest},
      product: frame.product, temporal: frame.temporal,
      scalar: {variableId: component.variableId, unit: component.unit, positiveDirection: component.positiveDirection},
      spatial: {crs: spatial.crs, horizontalDatum: spatial.horizontalDatum, verticalDatum: spatial.verticalDatum,
        coordinateOrder: 'x,y', coordinateUnit: 'degree', requestedBounds: request.bounds,
        deliveredBounds: [axes.x[0], axes.y[0], axes.x.at(-1), axes.y.at(-1)], boundsMeaning: 'sample-coordinate-extent',
        nativeResolution: spatial.nativeResolution, sourceDeliveredResolution: spatial.deliveredResolution,
        sourceResamplingMethod: spatial.resamplingMethod,
        deliveredResolution: {x: spacing(axes.x), y: spacing(axes.y), unit: 'degree', meaning: 'sample-spacing'},
        sourceCoverage: {completeness: spatial.coverageCompleteness, basis: spatial.coverageBasis}, landMask: spatial.landMask},
      grid: {width: ix.length, height: iy.length, order: 'y-row-x-column', axes, values, missing},
      coverage: partial ? 'partial-or-missing' : 'complete-selected-samples',
      providerEvidence: {archiveId: receipt.archiveId, receiptDigest: receipt.receiptDigest,
        qualityReference: 'frame.quality', companionVariableIds: payload.components.filter(c => c !== component).map(c => c.variableId)},
      derivation: {method: 'source-index-decimation', stride: request.stride, anchor: 'source-index-zero',
        sourceXIndices: ix, sourceYIndices: iy, sourceAdapter: {id: frame.provenance.adapterId, version: frame.provenance.adapterVersion},
        sourceLineage: frame.lineage}
    };
    const field = sort({...body, deliveryId: `osfd-${hash(body)}`, generatedAt: request.generatedAt});
    if (Buffer.byteLength(canonical(field), 'utf8') > request.limits.maxPayloadBytes) return result('DELIVERY_LIMIT_EXCEEDED', 'payload-byte-limit');
    return result(partial ? 'DELIVERED_PARTIAL' : 'DELIVERED', null, field);
  } catch { return result('DELIVERY_TRANSFORMATION_FAILURE', 'derivative-construction-failed'); }
}
