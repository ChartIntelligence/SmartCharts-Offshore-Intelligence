// Task 11D retained-evidence review only. No provider I/O and no runtime imports.
import {createHash} from 'node:crypto';
import {readFileSync, existsSync, mkdirSync, openSync, writeFileSync, fsyncSync, closeSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {decodeNetcdf} from './netcdf.mjs';
import {createSstProductAdapterV1, SST_ADAPTER_CONTRACT} from '../../shared/sstProductAdapter.mjs';
import {writeOceanArchiveV1, readOceanArchiveV1} from '../../shared/oceanProductArchive.mjs';
import {deliverOceanScalarFieldV1} from '../../shared/oceanScalarFieldDelivery.mjs';

export const DIRECTORY = fileURLToPath(new URL('../../.local/ocean-quarantine/sst/noaa-geo-polar/task11d-20260922T120000Z-gulf/', import.meta.url));
export const METADATA = fileURLToPath(new URL('../../.local/ocean-quarantine/sst/noaa-geo-polar/task11d-metadata/', import.meta.url));
export const SOURCE_SHA256 = '26fe69f0e376322fd2e81ecb9375e5737ede4134cbd9711608ee9c2e2253a843';
export const NOMINAL_TIME = '2026-09-22T12:00:00Z';
const PRODUCT = 'Geo_Polar_Blended_Night-OSPO-L4-GLOB-v1.0';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const check = (condition, reason) => { if (!condition) throw Error(`Pilot rejected: ${reason}`); };
const json = path => JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
const iso = text => new Date(text).toISOString();

export function verifyMetadata(cmr, das, selected) {
  const spatial = cmr.SpatialExtent.HorizontalSpatialDomain.ResolutionAndCoordinateSystem;
  check(cmr.ShortName === PRODUCT && cmr.Version === '1.0', 'collection identity');
  check(spatial.GeodeticModel.HorizontalDatumName === 'World Geodetic System 1984' &&
    spatial.GeodeticModel.EllipsoidName === 'WGS 84', 'explicit WGS84 datum');
  check(spatial.HorizontalDataResolution.GenericResolutions.some(r => r.XDimension === 0.05 && r.YDimension === 0.05 && r.Unit === 'Decimal Degrees'), 'native grid');
  check(das.includes(`String id "${PRODUCT}"`) && das.includes('String product_version "1.0"') &&
    das.includes('String gds_version_id "2.0"') && das.includes('String processing_level "L4"'), 'distribution identity');
  check(selected.table.rows.length === 1 && selected.table.rows[0][0] === NOMINAL_TIME, 'actual selected coordinate');
  return true;
}

export function validateDecoded(n) {
  const v = n.variables;
  check(JSON.stringify(n.dimensions) === JSON.stringify([{name: 'time', length: 1}, {name: 'latitude', length: 260}, {name: 'longitude', length: 360}]), 'dimensions');
  check(Object.keys(v).sort().join(',') === 'analysed_sst,analysis_error,latitude,longitude,mask,time', 'variables');
  check(n.global.id === PRODUCT && n.global.product_version === '1.0' && n.global.processing_level === 'L4' && n.global.gds_version_id === '2.0', 'source identity');
  check(v.time.type === 6 && v.time.values.length === 1 && v.time.attributes.units === 'seconds since 1970-01-01T00:00:00Z' &&
    v.time.attributes.calendar === 'Gregorian' && iso(v.time.values[0] * 1000) === iso(NOMINAL_TIME), 'nominal time');
  for (const [key, length, low, high] of [['longitude', 360, 262, 280], ['latitude', 260, 18, 31]]) {
    const a = v[key].values;
    check(v[key].type === 5 && a.length === length && a.every((x, i) => Number.isFinite(x) && x > low && x < high && (!i || x > a[i - 1])), 'axis ordering/bounds');
    check(a.slice(1).every((x, i) => Math.abs(x - a[i] - 0.05) < 0.00004), 'axis spacing');
  }
  for (const [key, type, unit, fill] of [['analysed_sst', 5, 'kelvin', Math.fround(-54.53)], ['analysis_error', 5, 'degree_C', Math.fround(-327.68)], ['mask', 1, undefined, 0]]) {
    const a = v[key], m = a.attributes;
    check(a.type === type && a.values.length === 93600 && JSON.stringify(a.dimensions) === '[0,1,2]', 'array type/shape');
    check(m.units === unit && m._FillValue === fill && !Object.hasOwn(m, 'scale_factor') && !Object.hasOwn(m, 'add_offset'), 'served physical encoding/fill');
    check(a.values.every(x => typeof x === 'number' && Number.isFinite(x) && (x === fill || x >= m.valid_min && x <= m.valid_max)), 'invalid/range evidence');
  }
  check(v.analysed_sst.attributes.standard_name === 'sea_surface_foundation_temperature', 'foundation SST');
  check(v.analysis_error.attributes.long_name === 'estimated error standard deviation of analysed_sst', 'uncertainty meaning');
  check(v.mask.attributes.flag_meanings === 'water land ice' && JSON.stringify(v.mask.attributes.flag_values) === '[1,2,4]', 'mask metadata');
  // No combined-bit interpretation. This particular acquired Gulf frame contains only 1/2.
  check(v.mask.values.every(x => x === 1 || x === 2), 'unexpected mask: stop for review');
  v.mask.values.forEach((mask, i) => {
    if (mask === 2) check(v.analysed_sst.values[i] === v.analysed_sst.attributes._FillValue, 'finite SST on land');
  });
  return n;
}

export function normalizePilot(n, receipt) {
  validateDecoded(n);
  check(receipt.sha256 === SOURCE_SHA256 && receipt.selectedTime === NOMINAL_TIME && receipt.bodyBytes === 853144, 'pinned acquisition');
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
  const objectId = `erddap-subset-sha256-${SOURCE_SHA256}`;
  const source = {contractVersion: SST_ADAPTER_CONTRACT, frameId: `noaa-geo-polar-20260922-gulf-${SOURCE_SHA256}`,
    qualification: {registryId: registry.registryId, registryVersion: '1', qualificationId: q.qualificationId, qualificationVersion: '1'},
    identity: {...Object.fromEntries(['providerId', 'productId', 'datasetId', 'productVersion'].map(k => [k, q.product[k]])), streamId: q.streamId, representationId: q.representationId},
    grid: q.grid,
    temporal: {support: {kind: 'unknown', reason: 'nominal-L4-time-known-exact-support-window-not-established'}, observationTime: null, forecastIssuedAt: null, providerPublishedAt: null, acquiredAt: iso(receipt.completedAt), processedAt: null},
    source: {objectId, revision: null, validator: null, receiptId: 'task11d-noaa-acquisition-receipt', checksum: `sha256:${SOURCE_SHA256}`, nominalTime: NOMINAL_TIME},
    // Explicit pilot representation step: source east longitude minus 360, no index/value changes.
    axes: {longitude: v.longitude.values.map(x => x - 360), latitude: v.latitude.values}, dimensions: {latitude: 260, longitude: 360},
    components: q.variables.map(a => ({variableId: a.variableId, values: v[a.variableId].values, missing: Array(93600).fill(null)})),
    coverage: {completeness: 'partial', basis: 'bounded-Gulf-source-subset-with-explicit-provider-land-mask'},
    lineage: {parentFrameIds: [], sourceRecordIds: [objectId], completeness: 'partial'},
  };
  return {frame: createSstProductAdapterV1(registry)(source), registry};
}

// PILOT / NON-PRODUCTION STORAGE. Exclusive file create + fsync + exact readback.
// No overwrite, no delete, no production durability/backup/retention claim.
export function localReviewPort(directory) {
  mkdirSync(directory, {recursive: true});
  const path = id => { check(/^opf-[a-f0-9]{64}$/.test(id), 'archive locator'); return `${directory}/${id}.json`; };
  return {
    async createIfAbsent(id, record) {
      let fd, outcome = 'created';
      try { fd = openSync(path(id), 'wx'); }
      catch (error) { if (error.code !== 'EEXIST') throw error; outcome = 'exists'; }
      if (fd !== undefined) { try { writeFileSync(fd, JSON.stringify(record)); fsyncSync(fd); } finally { closeSync(fd); } }
      return {outcome, durable: true, record: json(path(id))};
    },
    async readExact(id) { return existsSync(path(id)) ? {status: 'found', durable: true, record: json(path(id))} : {status: 'not-found'}; },
  };
}

export async function buildPilot(processedAt) {
  check(typeof processedAt === 'string' && iso(processedAt) === processedAt, 'explicit processing timestamp');
  verifyMetadata(json(`${METADATA}cmr.json`), readFileSync(`${METADATA}current.das`, 'utf8'), json(`${METADATA}selected-time.json`));
  const bytes = readFileSync(`${DIRECTORY}source.nc`), receipt = json(`${DIRECTORY}acquisition.receipt.json`);
  check(hash(bytes) === SOURCE_SHA256 && bytes.length === receipt.bodyBytes, 'source byte checksum');
  const n = decodeNetcdf(bytes), {frame, registry} = normalizePilot(n, receipt);
  const port = localReviewPort(`${DIRECTORY}archive`);
  const archived = await writeOceanArchiveV1(port, frame, {writeId: 'task11d-local-review-write-v1', archivedAt: processedAt,
    storageReference: 'task11d-local-ignored-review-archive', sourceRevision: null,
    rawEvidence: [{reference: 'task11d-source-netcdf', sha256: SOURCE_SHA256, availability: 'retained'}]});
  check(archived.status === 'ARCHIVED', `archive ${archived.status}`);
  const read = await readOceanArchiveV1(port, {archiveId: archived.receipt.archiveId, frameId: null});
  check(read.status === 'ARCHIVED' && read.frame.frameId === frame.frameId, 'exact archive read');
  const delivery = await deliverOceanScalarFieldV1(port, {source: {archiveId: archived.receipt.archiveId, receiptDigest: archived.receipt.receiptDigest},
    variableId: 'analysed_sst', bounds: [-98, 18, -80, 31], stride: {x: 1, y: 1},
    limits: {maxCells: 93600, maxPayloadBytes: 8 * 1024 * 1024}, generatedAt: processedAt});
  check(['DELIVERED', 'DELIVERED_PARTIAL'].includes(delivery.status), `scalar ${delivery.status}`);
  const stats = {};
  for (const c of frame.payload.components) {
    const valid = c.values.filter(x => x !== null).sort((a, b) => a - b);
    stats[c.variableId] = {min: valid[0], max: valid.at(-1), median: valid[Math.floor(valid.length / 2)], missing: c.values.length - valid.length};
  }
  const summary = {notice: 'REAL NOAA SST ANALYSIS — PILOT EVIDENCE', operationalStatus: 'PILOT / NOT YET OPERATIONAL',
    storageClass: 'PILOT / NON-PRODUCTION STORAGE', freshness: 'UNASSESSED', nominalTime: NOMINAL_TIME,
    acquisition: receipt, evidenceAgeAtAcquisitionHours: (Date.parse(receipt.completedAt) - Date.parse(NOMINAL_TIME)) / 3600000,
    receipt: archived.receipt, deliveryId: delivery.field.deliveryId, dimensions: [360, 260], stats,
    landCount: frame.payload.components[0].missing.filter(x => x === 'land').length};
  return {frame, registry, field: delivery.field, summary};
}
