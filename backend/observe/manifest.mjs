import {check, data, keys, id, integer, reference, coordinates, utc, digest, seal, unseal, same, freeze} from './canonical.mjs';

export const MANIFEST = 'pelora-continuous-observe-manifest-v1';
export const GRID = 'pelora-observe-regular-grid-v1';
export const SAMPLING = 'pelora-observe-sampling-set-v1';
const DAY = 86400000;
const refOf = (body, domain) => ({id:body.id, version:body.version, sha256:digest(domain, body)});

export function gridReference(input) { const g = validateGrid(data(input)); return freeze(refOf(g, GRID)); }
function validateGrid(g) {
  keys(g, ['id','version','revision','coordinateConvention','originMicrodegrees','stepMicrodegrees','dimensions']);
  id(g.id); id(g.version); check(g.revision === null || typeof g.revision === 'string', 'grid-revision');
  if (g.revision !== null) id(g.revision);
  check(g.coordinateConvention === 'WGS84_LAT_LON_DEGREES_LON_NEG180_INCLUSIVE_POS180_EXCLUSIVE', 'coordinate-convention');
  for (const field of ['originMicrodegrees','stepMicrodegrees','dimensions']) keys(g[field], ['latitude','longitude']);
  for (const axis of ['latitude','longitude']) {
    integer(g.originMicrodegrees[axis], -180000000, 180000000);
    integer(g.stepMicrodegrees[axis], 1, 180000000);
    integer(g.dimensions[axis], 1, 360000000);
  }
  for (const endpoint of [0,1]) coordinates(Object.fromEntries(['latitude','longitude'].map(axis => [axis,
    (g.originMicrodegrees[axis] + endpoint * (g.dimensions[axis] - 1) * g.stepMicrodegrees[axis]) / 1e6])));
  return g;
}
function samplingBody(input, grid) {
  const s = data(input); keys(s, ['id','version','inclusionRule','cells']); id(s.id); id(s.version);
  check(s.inclusionRule === 'EXPLICIT_NATIVE_CELLS_V1', 'inclusion-rule');
  check(Array.isArray(s.cells) && s.cells.length > 0 && s.cells.length <= 10000, 'sampling-size');
  const names = new Set(), positions = new Set();
  for (const c of s.cells) {
    keys(c, ['key','indices','coordinates']); id(c.key); keys(c.indices, ['latitude','longitude']); coordinates(c.coordinates);
    check(!names.has(c.key), 'duplicate-cell-key'); names.add(c.key);
    for (const axis of ['latitude','longitude']) {
      integer(c.indices[axis], 0, grid.dimensions[axis] - 1);
      check(c.coordinates[axis] === (grid.originMicrodegrees[axis] + c.indices[axis] * grid.stepMicrodegrees[axis]) / 1e6, 'grid-cell-mismatch');
    }
    const position = `${c.indices.latitude}:${c.indices.longitude}`;
    check(!positions.has(position), 'duplicate-cell-position'); positions.add(position);
  }
  s.cells.sort((a,b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
  return s;
}
export function samplingReference(input, grid) { return freeze(refOf(samplingBody(input, validateGrid(data(grid))), SAMPLING)); }

function body(input) {
  const m = data(input);
  keys(m, ['contractVersion','id','version','region','product','grid','gridReference','sampling','samplingReference','coverage','schedule','providerTime','limits','retry','effectiveFrom','effectiveUntil']);
  check(m.contractVersion === MANIFEST, 'manifest-version'); id(m.id); id(m.version);
  keys(m.region, ['id','version']); id(m.region.id); id(m.region.version);
  keys(m.product, ['family','provider','dataset','productId','adapter']);
  check(m.product.family === 'CURRENTS' && m.product.provider === 'NOAA CoastWatch' && m.product.dataset === 'noaacwBLENDEDNRTcurrentsDaily', 'current-v3-product');
  id(m.product.productId); reference(m.product.adapter);
  validateGrid(m.grid); reference(m.gridReference); check(same(m.gridReference, gridReference(m.grid)), 'grid-reference');
  m.sampling = samplingBody(m.sampling, m.grid); reference(m.samplingReference);
  check(same(m.samplingReference, samplingReference(m.sampling, m.grid)), 'sampling-reference');
  keys(m.coverage, ['coverageReference','maskReference']); reference(m.coverage.coverageReference); reference(m.coverage.maskReference);
  const s = m.schedule;
  keys(s, ['anchor','intervalMs','permittedExecutionDelayMs','deadlineMs','catchUpMaxWindows','catchUpMaxAgeMs']); utc(s.anchor);
  integer(s.intervalMs, 1, 31 * DAY); integer(s.deadlineMs, 1, 31 * DAY);
  integer(s.permittedExecutionDelayMs, 0, s.deadlineMs - 1); integer(s.catchUpMaxWindows, 1, 10000); integer(s.catchUpMaxAgeMs, 0, 31 * DAY);
  keys(m.providerTime, ['policyReference','expectedPublicationLagMs','maxWaitMs']); reference(m.providerTime.policyReference);
  integer(m.providerTime.expectedPublicationLagMs, 0, 366 * DAY); integer(m.providerTime.maxWaitMs, 0, s.deadlineMs - 1);
  const l = m.limits;
  keys(l, ['maxCells','maxJobsPerPlan','maxRequestBytes','maxResponseBytes','requestTimeoutMs','concurrency','queueCapacity','rateLimit']);
  integer(l.maxCells, 1, 10000); check(m.sampling.cells.length <= l.maxCells, 'cell-capacity');
  integer(l.maxJobsPerPlan, m.sampling.cells.length, 100000);
  integer(l.maxRequestBytes, 1, 2097152); integer(l.maxResponseBytes, 1, 16777216);
  integer(l.requestTimeoutMs, 1, s.deadlineMs); integer(l.concurrency, 1, 100); integer(l.queueCapacity, l.concurrency, 100000);
  keys(l.rateLimit, ['requests','periodMs']); integer(l.rateLimit.requests, 1, 100000); integer(l.rateLimit.periodMs, 1, DAY);
  keys(m.retry, ['retryableFailures','maxAttempts','initialBackoffMs','maxBackoffMs']);
  check(Array.isArray(m.retry.retryableFailures) && m.retry.retryableFailures.every(x => ['PROVIDER_TIMEOUT','PROVIDER_UNAVAILABLE','RATE_LIMITED','PUBLICATION_PENDING'].includes(x)), 'retry-failures');
  check(new Set(m.retry.retryableFailures).size === m.retry.retryableFailures.length, 'duplicate-retry-failure'); m.retry.retryableFailures.sort();
  integer(m.retry.maxAttempts, 1, 20); integer(m.retry.initialBackoffMs, 1, s.deadlineMs); integer(m.retry.maxBackoffMs, m.retry.initialBackoffMs, s.deadlineMs);
  check(m.providerTime.maxWaitMs + l.requestTimeoutMs <= s.deadlineMs, 'wait-timeout-budget');
  check(utc(m.effectiveFrom) < utc(m.effectiveUntil), 'effective-range');
  return m;
}
export function createManifest(input) { return seal(MANIFEST, body(input)); }
export function validateManifest(input) {
  const raw = unseal(MANIFEST, input), normalized = body(raw);
  check(same(raw, normalized), 'noncanonical-set-order'); return seal(MANIFEST, normalized);
}
export function readManifest(text) {
  check(typeof text === 'string' && Buffer.byteLength(text) <= 4194304, 'manifest-wire-size');
  const m = validateManifest(JSON.parse(text));
  // Wire admission also rejects duplicate keys and alternate numeric spellings.
  check(text === JSON.stringify(data(m)), 'noncanonical-wire'); return m;
}
export const manifestReference = m => { const v = validateManifest(m); return freeze({id:v.id, version:v.version, sha256:v.digest}); };
