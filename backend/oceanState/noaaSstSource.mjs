// Offline product-specific foundation. No transport, clock, default worker or runtime import.
import {createHash} from 'node:crypto';
import {createSstProductAdapterV1, SST_ADAPTER_CONTRACT} from '../../shared/sstProductAdapter.mjs';
import {decodeNetcdf} from './noaaNetcdf.mjs';

export const PRODUCT = 'Geo_Polar_Blended_Night-OSPO-L4-GLOB-v1.0';
export const DATASET = 'noaacwBLENDEDsstDaily';
export const BASE = `https://oceanwatch.pifsc.noaa.gov/erddap/griddap/${DATASET}`;
export const SOURCE_CONTRACT = 'pelora-noaa-sst-source-v1';
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const check = (condition, reason) => { if (!condition) throw new TypeError(reason); };
export const freeze = v => { if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
const sorted = v => Array.isArray(v) ? v.map(sorted) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sorted(v[k])])) : v;
export const digest = v => sha256(JSON.stringify(sorted(v)));
export function iso(value) {
  check(typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value), 'explicit-millisecond-UTC-required');
  const date = new Date(value); check(Number.isFinite(date.getTime()), 'invalid-time');
  check(date.toISOString().slice(0,19) === value.slice(0,19), 'invalid-calendar');
  return date.toISOString();
}
export function exact(v, names) {
  check(v && Object.getPrototypeOf(v) === Object.prototype && Reflect.ownKeys(v).length === names.length &&
    names.every(k => Object.getOwnPropertyDescriptor(v,k)?.enumerable && Object.hasOwn(Object.getOwnPropertyDescriptor(v,k), 'value')), 'invalid-fields');
}
export function candidateOf(input) {
  exact(input, ['product','dataset','nominalTime','revision']);
  check(input.product === PRODUCT && input.dataset === DATASET, 'source-identity');
  check(input.revision === null || typeof input.revision === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/.test(input.revision), 'revision-identity');
  return freeze({...input, nominalTime: iso(input.nominalTime)});
}
export const candidateKey = c => `noaa-${digest(candidateOf(c))}`;
export const discoveryManifest = freeze({url: `${BASE}.json?time%5Blast%5D`, maxBodyBytes: 4096,
  redirects: 0, retries: 0, purpose: 'TIME_COORDINATE_ONLY', product: PRODUCT, dataset: DATASET});
// HTTP headers here are discovery-response metadata, never selected-object revision/publication.
export function parseDiscovery(bytes, input) {
  exact(input, ['url','status','discoveredAt','responseValidator']);
  check(Buffer.isBuffer(bytes) && bytes.length <= discoveryManifest.maxBodyBytes && input.url === discoveryManifest.url && input.status === 200, 'discovery-response');
  check(input.responseValidator === null || typeof input.responseValidator === 'string' && input.responseValidator.length <= 200, 'discovery-validator');
  const body = JSON.parse(bytes.toString('utf8')), t = body.table;
  exact(body, ['table']); exact(t, ['columnNames','columnTypes','columnUnits','rows']);
  check(t && JSON.stringify(t.columnNames) === '["time"]' && JSON.stringify(t.columnTypes) === '["String"]' &&
    JSON.stringify(t.columnUnits) === '["UTC"]' && Array.isArray(t.rows) && t.rows.length <= 1 && t.rows.every(r => Array.isArray(r) && r.length === 1), 'time-coordinate-schema');
  const candidate = t.rows.length ? candidateOf({product: PRODUCT, dataset: DATASET, nominalTime: t.rows[0][0], revision: null}) : null;
  check(candidate === null || candidate.nominalTime <= iso(input.discoveredAt), 'future-coordinate');
  return freeze({status: candidate ? 'ADVERTISED' : 'NO_CANDIDATE', candidate, discoveredAt: iso(input.discoveredAt),
    locator: input.url, responseValidator: input.responseValidator, providerPublishedAt: null, providerModifiedAt: null,
    bodyBytes: bytes.length, sha256: sha256(bytes)});
}
export function acquisitionManifest(input) {
  const c = candidateOf(input);
  // Coordinate selector is taken from actual discovery. Returned time must match exactly:
  // ERDDAP nearest-coordinate lookup is not authority if its time axis changes meanwhile.
  const query = ['analysed_sst','analysis_error','mask'].map(v => `${v}[(${c.nominalTime})][2160:1:2419][5240:1:5599]`).join(',');
  return freeze({url: `${BASE}.nc?${encodeURI(query).replaceAll('[','%5B').replaceAll(']','%5D')}`, candidate: c,
    variables: ['analysed_sst','analysis_error','mask'], bounds: [-98,18,-80,31], sourceBounds: [262,18,280,31],
    dimensions: [1,260,360], providerId: 'NOAA-NESDIS-OSPO', longitudeConvention: '0:360',
    qualification: {id: 'noaa-geo-polar-task11d-pilot', version: '1', digest: QUALIFICATION_DIGEST},
    bodyAcceptanceCeiling: 4194304, maxTransferBytes: 4194304, redirects: 0, retries: 0, encoding: 'identity'});
}

export function validateDecoded(n, nominalTime) {
  const v = n.variables;
  check(JSON.stringify(n.dimensions) === JSON.stringify([{name: 'time', length: 1}, {name: 'latitude', length: 260}, {name: 'longitude', length: 360}]), 'dimensions');
  check(Object.keys(v).sort().join(',') === 'analysed_sst,analysis_error,latitude,longitude,mask,time', 'variables');
  check(n.global.id === PRODUCT && n.global.product_version === '1.0' && n.global.processing_level === 'L4' && n.global.gds_version_id === '2.0', 'source identity');
  check(v.time.type === 6 && JSON.stringify(v.time.dimensions) === '[0]' && v.time.values.length === 1 && v.time.attributes.units === 'seconds since 1970-01-01T00:00:00Z' &&
    v.time.attributes.calendar === 'Gregorian' && new Date(v.time.values[0] * 1000).toISOString() === iso(nominalTime), 'nominal time');
  for (const [key, length, low, high] of [['longitude', 360, 262, 280], ['latitude', 260, 18, 31]]) {
    const a = v[key].values;
    check(JSON.stringify(v[key].dimensions) === (key === 'longitude' ? '[2]' : '[1]') &&
      v[key].attributes.units === (key === 'longitude' ? 'degrees_east' : 'degrees_north'), 'coordinate-declaration');
    check(v[key].type === 5 && a.length === length && a.every((x, i) => Number.isFinite(x) && x > low && x < high && (!i || x > a[i - 1])), 'axis ordering/bounds');
    check(a.every((x, i) => x === Math.fround(low + 0.025 + i * 0.05)), 'qualified exact source centers');
  }
  for (const [key, type, unit, fill] of [['analysed_sst', 5, 'kelvin', Math.fround(-54.53)], ['analysis_error', 5, 'degree_C', Math.fround(-327.68)], ['mask', 1, undefined, 0]]) {
    const a = v[key], m = a.attributes;
    check(a.type === type && a.values.length === 93600 && JSON.stringify(a.dimensions) === '[0,1,2]', 'array type/shape');
    check(m.units === unit && m._FillValue === fill && !Object.hasOwn(m, 'scale_factor') && !Object.hasOwn(m, 'add_offset'), 'served physical encoding/fill');
    const range = key === 'analysed_sst' ? [Math.fround(271.15), Math.fround(313.15)] : key === 'analysis_error' ? [0,5] : [1,4];
    check(m.valid_min === range[0] && m.valid_max === range[1], 'qualified validity range changed');
    check(a.values.every(x => typeof x === 'number' && Number.isFinite(x) && (x === fill || x >= range[0] && x <= range[1])), 'invalid/range evidence');
  }
  check(v.analysed_sst.attributes.standard_name === 'sea_surface_foundation_temperature', 'foundation SST');
  check(v.analysis_error.attributes.long_name === 'estimated error standard deviation of analysed_sst', 'uncertainty meaning');
  check(v.mask.attributes.flag_meanings === 'water land ice' && JSON.stringify(v.mask.attributes.flag_values) === '[1,2,4]', 'mask metadata');
  // No combined-bit interpretation. The qualified Gulf representation admitted only 1/2.
  check(v.mask.values.every(x => x === 1 || x === 2), 'unexpected mask: stop for review');
  v.mask.values.forEach((mask, i) => {
    if (mask === 2) check(v.analysed_sst.values[i] === v.analysed_sst.attributes._FillValue, 'finite SST on land');
  });
  return n;
}

function normalized(n, receipt, candidate) {
  const nominalTime = candidate.nominalTime; validateDecoded(n, nominalTime);

  const v = n.variables;
  const q = {
    qualificationId: 'noaa-geo-polar-task11d-pilot', qualificationVersion: '1', status: 'QUALIFIED',
    reviewReference: 'Task11D-public-metadata-and-CMR-C2036877745-POCLOUD',
    product: {productId: PRODUCT, providerId: 'NOAA-NESDIS-OSPO', datasetId: 'noaacwBLENDEDsstDaily', productVersion: '1.0', family: 'SST', processingLevel: 'L4', evidenceClass: 'ANALYSIS'},
    streamId: 'NRT-2017-onward', representationId: 'erddap-netcdf3-physical-lon-minus-360-pilot-v1',
    grid: {coordinateSystem: 'geographic', crs: 'EPSG:4326', horizontalDatum: 'WGS84', longitudeConvention: '-180:180',
      nativeResolution: {x: 0.05, y: 0.05, unit: 'degree'}, deliveredResolution: {x: 0.05, y: 0.05, unit: 'degree'}, resamplingMethod: null},
    supportKinds: ['unknown'], providerScheme: 'GHRSST-sea-land-ice-bit-mask',
    variables: [
      {variableId: 'analysed_sst', role: 'sst', meaning: 'sea_surface_foundation_temperature', encoding: {kind: 'physical', unit: 'K', scaleFactor: null, addOffset: null, fillValues: [Math.fround(-54.53)]}, codes: null},
      {variableId: 'analysis_error', role: 'uncertainty', meaning: 'provider-analysis-error-standard-deviation', encoding: {kind: 'physical', unit: 'degC', scaleFactor: null, addOffset: null, fillValues: [Math.fround(-327.68)]}, codes: null},
      {variableId: 'mask', role: 'flag', meaning: 'provider-sea-land-ice-mask', encoding: {kind: 'physical', unit: '1', scaleFactor: null, addOffset: null, fillValues: [0]}, codes: [
        {value: 1, meaning: 'water', sstMissingReason: null}, {value: 2, meaning: 'land', sstMissingReason: 'land'},
        {value: 4, meaning: 'ice', sstMissingReason: 'unknown'}]},
    ],
  };
  const registry = {contractVersion: SST_ADAPTER_CONTRACT, registryId: 'task11d-pilot-only', registryVersion: '1', qualifications: [q]};
  const objectId = `erddap-subset-sha256-${receipt.sha256}`;
  const source = {contractVersion: SST_ADAPTER_CONTRACT, frameId: `noaa-geo-polar-gulf-${receipt.sha256}${candidate.revision === null ? '' : `-${digest(candidate.revision)}`}`,
    qualification: {registryId: registry.registryId, registryVersion: '1', qualificationId: q.qualificationId, qualificationVersion: '1'},
    identity: {...Object.fromEntries(['providerId', 'productId', 'datasetId', 'productVersion'].map(k => [k, q.product[k]])), streamId: q.streamId, representationId: q.representationId},
    grid: q.grid,
    temporal: {support: {kind: 'unknown', reason: 'nominal-L4-time-known-exact-support-window-not-established'}, observationTime: null, forecastIssuedAt: null, providerPublishedAt: null, acquiredAt: iso(receipt.completedAt), processedAt: null},
    source: {objectId, revision: candidate.revision, validator: null, receiptId: receipt.reference, checksum: `sha256:${receipt.sha256}`, nominalTime},
    // Explicit pilot representation step: source east longitude minus 360, no index/value changes.
    axes: {longitude: v.longitude.values.map(x => x - 360), latitude: v.latitude.values}, dimensions: {latitude: 260, longitude: 360},
    components: q.variables.map(a => ({variableId: a.variableId, values: v[a.variableId].values, missing: Array(93600).fill(null)})),
    coverage: {completeness: 'partial', basis: 'bounded-Gulf-source-subset-with-explicit-provider-land-mask'},
    lineage: {parentFrameIds: [], sourceRecordIds: [objectId], completeness: 'partial'},
  };
  return {frame: createSstProductAdapterV1(registry)(source), registry};
}

// The reviewed Task 11D profile is pinned, not silently upgraded to operational status.
export const QUALIFICATION_DIGEST = '1a340319a1ba613a57d829c0d2671de91511847732760c8c0e8cf97ba3efb839';
export function normalizeNoaaSst(bytes, receipt, input, qualificationDigest) {
  const candidate = candidateOf(input);
  check(qualificationDigest === QUALIFICATION_DIGEST, 'qualification-mismatch');
  check(Buffer.isBuffer(bytes) && bytes.length > 0 && bytes.length <= 4194304, 'bounded-source');
  check(receipt.sha256 === sha256(bytes) && receipt.bodyBytes === bytes.length &&
    digest(candidateOf(receipt.candidate)) === digest(candidate) &&
    receipt.selectedTime === candidate.nominalTime && receipt.requestedUrl === acquisitionManifest(candidate).url &&
    receipt.finalUrl === receipt.requestedUrl && receipt.status === 200, 'acquisition-binding');
  iso(receipt.completedAt);
  const result = normalized(decodeNetcdf(bytes), receipt, candidate);
  check(digest(result.registry) === QUALIFICATION_DIGEST, 'qualification-profile-drift');
  return result.frame;
}

/** Transport is injected; no live implementation is supplied. Its readUpTo(n) MUST
 * enforce the actual cumulative transfer ceiling below buffering/TLS, including any
 * prefetched bytes, and never follow redirects/retry. This routine bounds accepted
 * response bodies; that alone is not proof of bounded upstream network I/O. */
export async function acquireBounded(transport, input, completedAt) {
  const manifest = acquisitionManifest(input);
  iso(completedAt);
  const response = await transport.open(manifest);
  const chunks = []; let count = 0;
  try {
    check(response.redirects === 0 && response.retries === 0, 'transport-attempt-policy');
    check(response.status === 200 && response.finalUrl === manifest.url && response.encoding === 'identity', 'response-authority');
    check(response.contentLength === null || Number.isSafeInteger(response.contentLength) && response.contentLength > 0 && response.contentLength <= manifest.maxTransferBytes, 'advertised-limit');
    while (count < manifest.maxTransferBytes) {
      const part = await response.readUpTo(manifest.maxTransferBytes - count);
      if (part === null) break;
      check(Buffer.isBuffer(part) && part.length > 0 && part.length <= manifest.maxTransferBytes - count, 'observed-limit');
      chunks.push(Buffer.from(part)); count += part.length;
    }
    // At the ceiling no extra read is permitted; require transport's completed-body flag.
    check(response.complete === true && count > 0 && (response.contentLength === null || count === response.contentLength), 'incomplete-response');
    const bytes = Buffer.concat(chunks), checksum = sha256(bytes);
    return {bytes, receipt: freeze({reference: `noaa-raw-${checksum}`, requestedUrl: manifest.url, finalUrl: response.finalUrl,
      status: 200, bodyBytes: count, sha256: checksum, completedAt: iso(completedAt), selectedTime: manifest.candidate.nominalTime,
      candidate: manifest.candidate, dimensions: manifest.dimensions, variables: manifest.variables,
      bounds: manifest.bounds, sourceBounds: manifest.sourceBounds, contentLength: response.contentLength, encoding: response.encoding,
      providerPublishedAt: null, providerModifiedAt: null, transferCeiling: manifest.maxTransferBytes, retries: response.retries, redirects: response.redirects})};
  } finally { await response.close(); }
}
