// Descriptive records and exact name resolution only. No runtime eligibility policy.
export const GOVERNED_PLACE_CONTRACT = 'pelora-governed-place-v1';
export const PLACE_TYPES = Object.freeze(['FISHING_GROUND', 'CANYON', 'RIDGE', 'LEDGE',
  'BANK', 'SEAMOUNT_OR_HUMP', 'FAD', 'PLATFORM', 'OFFSHORE_STRUCTURE', 'MARINE_AREA', 'OTHER_NAMED_PLACE',
  'OBSERVATION_STATION', 'ARTIFICIAL_REEF', 'WRECK']);
const fail = path => { throw new TypeError(`Invalid governed place: ${path}`); };
const text = (v, p) => typeof v === 'string' && v.trim() ? v : fail(p);
const id = (v, p) => typeof v === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:/+-]*$/.test(v) ? v : fail(p);
const number = (v, p) => typeof v === 'number' && Number.isFinite(v) ? v : fail(p);
const nullable = fn => (v, p) => v === null ? null : fn(v, p);
const choice = values => (v, p) => values.includes(v) ? v : fail(p);
const list = fn => (v, p) => Array.isArray(v) ? Array.from(v, (item, i) => fn(item, `${p}[${i}]`)) : fail(p);
const object = fields => (v, p) => {
  if (!v || Object.getPrototypeOf(v) !== Object.prototype || Object.keys(v).some(k => !Object.hasOwn(fields, k))) fail(p);
  return Object.fromEntries(Object.entries(fields).map(([k, fn]) => [k, fn(v[k], `${p}.${k}`)]));
};
const time = (v, p) => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(v)) fail(p);
  const n = Date.parse(v), expected = v.includes('.') ? v : v.replace('Z', '.000Z');
  if (!Number.isFinite(n) || new Date(n).toISOString() !== expected) fail(p);
  return expected;
};
const pair = (v, p) => { const r = list(number)(v, p); if (r.length !== 2) fail(p); return r; };
const line = (v, p) => { const r = list(pair)(v, p); if (r.length < 2) fail(p); return r; };
const ring = (v, p) => {
  const r = line(v, p);
  if (r.length < 4 || JSON.stringify(r[0]) !== JSON.stringify(r.at(-1)) ||
      new Set(r.slice(0, -1).map(x => JSON.stringify(x))).size < 3) fail(p);
  return r;
};
const polygon = (v, p) => { const r = list(ring)(v, p); if (!r.length) fail(p); return r; };
const geometry = (v, p) => {
  const parsers = {Point: pair, LineString: line, Polygon: polygon,
    MultiPolygon: (x, q) => { const r = list(polygon)(x, q); if (!r.length) fail(q); return r; }};
  if (!Object.hasOwn(parsers, v?.type)) fail(p);
  return object({type: choice(Object.keys(parsers)), coordinates: parsers[v.type]})(v, p);
};
const reference = object({crs: nullable(id), horizontalDatum: nullable(text), verticalDatum: nullable(text),
  coordinateOrder: choice(['x,y']), unit: nullable(id)});
const source = object({sourceId: id, authorityId: id, datasetId: id, featureId: nullable(text),
  sourceSnapshot: nullable(text), sourceDate: nullable(text), retrievedAt: nullable(time), locatorId: nullable(id)});
const decision = object({status: choice(['not-assessed', 'permitted', 'withheld']),
  decisionRef: nullable(id), policyRef: nullable(id)});
const schema = object({
  contractVersion: choice([GOVERNED_PLACE_CONTRACT]), placeId: id, revisionId: id,
  canonicalName: text, aliases: list(text), placeType: choice(PLACE_TYPES), regionIds: list(id),
  geometry: nullable(geometry), geometryMeaning: choice(['feature-location', 'feature-extent', 'representative-location', 'observed-position', 'unknown']),
  coordinateReferenceSystem: reference,
  representativePoint: nullable(object({coordinates: pair, method: text, sourceRef: id})),
  provenance: list(source),
  transformation: nullable(object({sourceGeometry: geometry, sourceReferenceSystem: reference,
    sourceRef: id, method: text, implementation: text, implementationVersion: text,
    verificationRef: nullable(id)})),
  verification: object({state: choice(['VERIFIED', 'CORROBORATED', 'UNVERIFIED']),
    assessmentRef: nullable(id), assessedAt: nullable(time), evidenceSourceIds: list(id)}),
  temporal: object({nature: choice(['STATIC_GEOGRAPHIC', 'FIXED_STRUCTURE', 'TIME_VARYING_STRUCTURE']),
    status: choice(['present', 'removed', 'unknown']), observedAt: nullable(time),
    validFrom: nullable(time), validTo: nullable(time)}),
  contextRefs: list(id),
  eligibility: object({display: decision, candidateContext: decision, learningContext: decision})
});
function freeze(v) { if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); } return v; }
function canonical(v) {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])]));
  return v;
}
/** Validates a detached descriptive record; does not certify its assertions or authorize use. */
export function normalizeGovernedPlaceV1(input) {
  const r = schema(input, 'place');
  const sources = new Set(r.provenance.map(s => s.sourceId));
  if (sources.size !== r.provenance.length) fail('provenance.duplicateSourceId');
  if (r.verification.evidenceSourceIds.some(s => !sources.has(s))) fail('verification.sourceRef');
  if (r.verification.state !== 'UNVERIFIED' && (!r.verification.assessmentRef ||
      !r.verification.assessedAt || !r.verification.evidenceSourceIds.length)) fail('verification.assessment');
  if (!r.geometry && (r.geometryMeaning !== 'unknown' || r.representativePoint || r.transformation)) fail('geometry.absent');
  if (r.representativePoint && !sources.has(r.representativePoint.sourceRef)) fail('representativePoint.sourceRef');
  if (r.transformation && !sources.has(r.transformation.sourceRef)) fail('transformation.sourceRef');
  if (r.temporal.validFrom && r.temporal.validTo && r.temporal.validFrom > r.temporal.validTo) fail('temporal.interval');
  for (const d of Object.values(r.eligibility)) {
    if (d.status !== 'not-assessed' && (!d.decisionRef || !d.policyRef)) fail('eligibility.decision');
    if (d.status === 'not-assessed' && (d.decisionRef || d.policyRef)) fail('eligibility.unassessed');
    if (d.status === 'permitted' && r.verification.state === 'UNVERIFIED') fail('eligibility.unverified');
    if (d.status === 'permitted' && r.temporal.nature === 'TIME_VARYING_STRUCTURE' &&
        !r.temporal.observedAt) fail('eligibility.untimedPosition');
  }
  // Unknown CRS is preserved, never interpreted. Recognized geographic CRS gets basic bounds checks only.
  const checkGeometry = (g, ref) => {
    if (!g || !['EPSG:4326', 'EPSG:4267', 'EPSG:4269', 'OGC:CRS84'].includes(ref.crs)) return;
    const walk = v => {
      if (typeof v[0] === 'number') { if (Math.abs(v[0]) > 180 || Math.abs(v[1]) > 90) fail('geometry.bounds'); }
      else v.forEach(walk);
    };
    walk(g.coordinates);
  };
  checkGeometry(r.geometry, r.coordinateReferenceSystem);
  if (r.representativePoint) checkGeometry({coordinates: r.representativePoint.coordinates}, r.coordinateReferenceSystem);
  if (r.transformation) checkGeometry(r.transformation.sourceGeometry, r.transformation.sourceReferenceSystem);
  return freeze(r);
}
export function serializeGovernedPlaceV1(input) { return JSON.stringify(canonical(normalizeGovernedPlaceV1(input))); }
/** No punctuation stripping, abbreviation guessing, accent folding or fuzzy identity. */
export function normalizePlaceAliasV1(value) { return text(value, 'alias').normalize('NFC').trim().replace(/\s+/gu, ' ').toLowerCase(); }
/** One current revision per identity. Conflicting authority references fail, never merge. */
export function validateGovernedPlaceCatalogV1(inputs) {
  if (!Array.isArray(inputs)) fail('catalog');
  const places = Array.from(inputs, normalizeGovernedPlaceV1), ids = new Set(), authorityIds = new Map();
  for (const place of places) {
    if (ids.has(place.placeId)) fail('catalog.duplicatePlaceId');
    ids.add(place.placeId);
    for (const s of place.provenance) {
      if (s.featureId === null) continue;
      const key = JSON.stringify([s.authorityId, s.datasetId, s.featureId]);
      if (authorityIds.has(key) && authorityIds.get(key) !== place.placeId) fail('catalog.conflictingAuthorityId');
      authorityIds.set(key, place.placeId);
    }
  }
  return freeze(places);
}
/** Research identity resolution, NOT a display filter, geographic match or report association. */
export function resolvePlaceAliasV1(inputs, query, regionId = null) {
  const places = validateGovernedPlaceCatalogV1(inputs), key = normalizePlaceAliasV1(query);
  if (regionId !== null) id(regionId, 'regionId');
  const placeIds = places.filter(p => (regionId === null || p.regionIds.includes(regionId)) &&
    [p.canonicalName, ...p.aliases].some(name => normalizePlaceAliasV1(name) === key)).map(p => p.placeId).sort();
  return freeze({status: placeIds.length === 0 ? 'not-found' : placeIds.length === 1 ? 'resolved' : 'ambiguous', placeIds});
}
