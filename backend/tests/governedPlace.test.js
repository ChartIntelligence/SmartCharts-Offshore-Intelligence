import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {GOVERNED_PLACE_CONTRACT, PLACE_TYPES, normalizeGovernedPlaceV1 as normalize,
  serializeGovernedPlaceV1 as serialize, normalizePlaceAliasV1 as alias,
  resolvePlaceAliasV1 as resolve, validateGovernedPlaceCatalogV1 as catalog} from '../../shared/governedPlace.mjs';

const decision = () => ({status: 'not-assessed', decisionRef: null, policyRef: null});
test('catalog admission is depth-neutral and supports shallow-relevant place types', () => {
  const source = readFileSync(new URL('../../shared/governedPlace.mjs', import.meta.url), 'utf8');
  // Guard the current pure boundary: no depth/distance/species admission inputs or acquisition.
  assert.doesNotMatch(source, /depth|bathymetr|offshoreDistance|distanceFromShore|distanceToShore|species|\b200\b|\bimport\b|\bfetch\b/i);
  for (const placeType of ['FAD', 'OFFSHORE_STRUCTURE', 'MARINE_AREA', 'OTHER_NAMED_PLACE']) {
    const p = fixture(); p.placeType = placeType;
    const r = normalize(p);
    assert.equal(r.placeType, placeType);
    assert.equal(Object.hasOwn(r, 'depth'), false);
    assert.equal(catalog([p]).length, 1);
    for (const permission of Object.values(r.eligibility)) assert.equal(permission.status, 'not-assessed');
  }
});
const fixture = () => ({
  contractVersion: GOVERNED_PLACE_CONTRACT, placeId: 'test:place-a', revisionId: 'r1',
  canonicalName: 'Test Bank', aliases: ['Test Shelf'], placeType: 'BANK', regionIds: ['test-region'],
  geometry: {type: 'Point', coordinates: [-87, 29]}, geometryMeaning: 'representative-location',
  coordinateReferenceSystem: {crs: 'EPSG:4267', horizontalDatum: 'NAD27', verticalDatum: null, coordinateOrder: 'x,y', unit: 'degree'},
  representativePoint: null,
  provenance: [{sourceId: 'source-a', authorityId: 'test-agency', datasetId: 'test-dataset', featureId: '001',
    sourceSnapshot: 'test-snapshot-1', sourceDate: '2026-01', retrievedAt: null, locatorId: 'test-source-record'}],
  transformation: null,
  verification: {state: 'UNVERIFIED', assessmentRef: null, assessedAt: null, evidenceSourceIds: []},
  temporal: {nature: 'STATIC_GEOGRAPHIC', status: 'unknown', observedAt: null, validFrom: null, validTo: null},
  contextRefs: [], eligibility: {display: decision(), candidateContext: decision(), learningContext: decision()}
});
function verified() { const p = fixture(); p.verification = {state: 'VERIFIED', assessmentRef: 'review-1',
  assessedAt: '2026-01-02T00:00:00Z', evidenceSourceIds: ['source-a']}; return p; }
function second() { const p = fixture(); p.placeId = 'test:place-b'; p.provenance[0].featureId = '002'; return p; }

test('stable supplied identity survives name, coordinate and revision corrections', () => {
  const a = normalize(fixture()), b = fixture(); b.revisionId = 'r2'; b.canonicalName = 'Corrected Bank'; b.geometry.coordinates[0] = -86;
  assert.equal(normalize(b).placeId, a.placeId); assert.notEqual(serialize(b), serialize(a));
  assert.equal(normalize(b).revisionId, 'r2');
});
test('exact alias normalization preserves punctuation, accents and meaningful differences', () => {
  assert.equal(alias('  TEST\t Shelf  '), 'test shelf'); assert.equal(alias('Cafe\u0301'), alias('Café'));
  assert.notEqual(alias('PLEM #2'), alias('PLEM 2')); assert.notEqual(alias('St. Bank'), alias('Saint Bank'));
  assert.notEqual(alias('Café'), alias('Cafe')); assert.throws(() => alias('   '));
});
test('canonical and aliases resolve deterministically without granting use', () => {
  assert.deepEqual(resolve([fixture()], ' test shelf '), {status: 'resolved', placeIds: ['test:place-a']});
  assert.equal(resolve([fixture()], 'Test Bank').status, 'resolved');
  assert.equal(resolve([fixture()], 'Test Ban').status, 'not-found');
  assert.equal(normalize(fixture()).eligibility.display.status, 'not-assessed');
});
test('ambiguous alias never silently chooses one place; explicit region can disambiguate', () => {
  const b = second(); b.regionIds = ['other-region'];
  assert.deepEqual(resolve([b, fixture()], 'Test Shelf'), {status: 'ambiguous', placeIds: ['test:place-a', 'test:place-b']});
  assert.deepEqual(resolve([fixture(), b], 'Test Shelf', 'other-region').placeIds, ['test:place-b']);
});
test('point coordinates, zero and NAD27 survive without transformation or datum inference', () => {
  const p = fixture(); p.geometry.coordinates = [0, 0]; assert.deepEqual(normalize(p).geometry.coordinates, [0, 0]);
  assert.equal(normalize(p).coordinateReferenceSystem.horizontalDatum, 'NAD27');
  p.coordinateReferenceSystem.crs = null; p.coordinateReferenceSystem.horizontalDatum = null;
  assert.equal(normalize(p).coordinateReferenceSystem.crs, null); assert.equal(normalize(p).transformation, null);
});
test('line, polygon and multipolygon retain geometry; representative point remains separate', () => {
  const p = fixture(), ring = [[-88, 28], [-86, 28], [-87, 30], [-88, 28]];
  for (const g of [{type:'LineString', coordinates:ring.slice(0, 3)}, {type:'Polygon', coordinates:[ring]}, {type:'MultiPolygon', coordinates:[[ring]]}]) {
    p.geometry = g; p.geometryMeaning = 'feature-extent';
    p.representativePoint = {coordinates:[-87,29], method:'source label point', sourceRef:'source-a'};
    const r = normalize(p); assert.deepEqual(r.geometry, g); assert.equal(r.representativePoint.method, 'source label point');
  }
});
test('malformed geometry and nonnumeric evidence fail without coercion', () => {
  for (const bad of [null, undefined, '', '29', false, {}, [], NaN, Infinity, -Infinity]) {
    const p = fixture(); p.geometry.coordinates[0] = bad; assert.throws(() => normalize(p));
  }
  for (const g of [{type:'Point',coordinates:[1]}, {type:'LineString',coordinates:[[1,2]]},
    {type:'Polygon',coordinates:[]}, {type:'Polygon',coordinates:[[[0,0],[1,0],[0,1],[2,2]]]},
    {type:'MultiPolygon',coordinates:[]}, {type:'Point',coordinates:[181,0]}, {type:'Point',coordinates:[0,91]}]) {
    const p = fixture(); p.geometry = g; assert.throws(() => normalize(p));
  }
});
test('projected coordinates are not misread as degrees', () => {
  const p = fixture(); p.coordinateReferenceSystem.crs = 'test:projected'; p.coordinateReferenceSystem.unit = 'metre';
  p.geometry.coordinates = [500000, 3000000]; assert.deepEqual(normalize(p).geometry.coordinates, p.geometry.coordinates);
});
test('unknown geometry cannot pretend to carry a marker or transformation', () => {
  const p = fixture(); p.geometry = null; p.geometryMeaning = 'unknown'; assert.equal(normalize(p).geometry, null);
  p.representativePoint = {coordinates:[0,0], method:'test', sourceRef:'source-a'}; assert.throws(() => normalize(p));
});
test('source and transformation lineage are preserved with source and target CRS distinct', () => {
  const p = fixture(); p.transformation = {sourceGeometry:structuredClone(p.geometry), sourceReferenceSystem:structuredClone(p.coordinateReferenceSystem),
    sourceRef:'source-a', method:'synthetic test only', implementation:'test-adapter', implementationVersion:'1', verificationRef:null};
  p.coordinateReferenceSystem.crs = 'EPSG:4326'; p.coordinateReferenceSystem.horizontalDatum = 'WGS84';
  const r = normalize(p); assert.equal(r.transformation.sourceReferenceSystem.horizontalDatum, 'NAD27');
  assert.equal(r.coordinateReferenceSystem.horizontalDatum, 'WGS84');
  p.transformation.sourceRef = 'missing'; assert.throws(() => normalize(p));
});
test('verification claims require assessment evidence, not merely source presence', () => {
  assert.equal(normalize(fixture()).verification.state, 'UNVERIFIED');
  for (const state of ['VERIFIED', 'CORROBORATED']) {
    const p = fixture(); p.verification.state = state; assert.throws(() => normalize(p));
    const v = verified(); v.verification.state = state; assert.equal(normalize(v).verification.state, state);
  }
  const p = verified(); p.verification.evidenceSourceIds = ['missing']; assert.throws(() => normalize(p));
});
test('static and mobile records preserve unknown time; no current position is inferred', () => {
  for (const nature of ['STATIC_GEOGRAPHIC','FIXED_STRUCTURE','TIME_VARYING_STRUCTURE']) {
    const p = fixture(); p.temporal.nature = nature; const r = normalize(p);
    assert.equal(r.temporal.observedAt, null); assert.equal(r.eligibility.display.status, 'not-assessed');
  }
  const p = fixture(); p.temporal.validFrom = '2026-02-02T00:00:00Z'; p.temporal.validTo = '2026-02-01T00:00:00Z';
  assert.throws(() => normalize(p)); p.temporal.validFrom = '2026-02-30T00:00:00Z'; assert.throws(() => normalize(p));
});
test('verification does not grant display, candidate or learning eligibility', () => {
  const p = verified(); const r = normalize(p);
  for (const d of Object.values(r.eligibility)) assert.equal(d.status, 'not-assessed');
  p.eligibility.display = {status:'permitted', decisionRef:'approval-a', policyRef:'policy-a'};
  assert.equal(normalize(p).eligibility.candidateContext.status, 'not-assessed');
  assert.equal(normalize(p).eligibility.learningContext.status, 'not-assessed');
});
test('explicit eligibility decisions need references and unverified records cannot be permitted', () => {
  const p = fixture(); p.eligibility.display.status = 'permitted'; assert.throws(() => normalize(p));
  p.eligibility.display.decisionRef = 'a'; p.eligibility.display.policyRef = 'b'; assert.throws(() => normalize(p));
  const v = verified(); v.verification.state = 'CORROBORATED'; v.eligibility.display = p.eligibility.display;
  assert.equal(normalize(v).eligibility.display.decisionRef, 'a');
});
test('untimed mobile structure cannot carry permitted use, even with a recorded approval', () => {
  const p = verified(); p.temporal.nature = 'TIME_VARYING_STRUCTURE';
  p.eligibility.display = {status:'permitted', decisionRef:'approval-a', policyRef:'policy-a'};
  assert.throws(() => normalize(p));
  p.temporal.observedAt = '2026-01-01T00:00:00Z';
  assert.equal(normalize(p).temporal.observedAt, '2026-01-01T00:00:00.000Z');
  // This preserves an observation/decision; it does not establish present-day freshness.
  assert.equal(normalize(p).temporal.validTo, null);
});
test('catalog fails closed for duplicate identities and conflicting authority IDs', () => {
  assert.throws(() => catalog([fixture(), fixture()]));
  const b = second(); b.provenance[0].featureId = '001'; assert.throws(() => catalog([fixture(), b]));
  b.provenance[0].featureId = '002'; assert.equal(catalog([fixture(), b]).length, 2);
});
test('unknown fields, captain data, popularity and species fields are rejected', () => {
  for (const key of ['captainId','userId','privateNote','catchCount','reportDensity','popularity','species','score','confidence']) {
    const p = fixture(); p[key] = 'test'; assert.throws(() => normalize(p));
  }
  const p = fixture(); p.provenance[0].secret = 'test'; assert.throws(() => normalize(p));
});
test('detached deep immutability does not mutate input or retain references', () => {
  const p = verified(), before = structuredClone(p), r = normalize(p);
  assert.deepEqual(p, before); assert.equal(Object.isFrozen(p), false);
  const frozen = v => { if (v && typeof v === 'object') { assert.ok(Object.isFrozen(v)); Object.values(v).forEach(frozen); } }; frozen(r);
  p.geometry.coordinates[0] = 0; p.aliases.push('new'); p.provenance[0].featureId = 'changed';
  assert.equal(r.geometry.coordinates[0], -87); assert.equal(r.aliases.length, 1); assert.equal(r.provenance[0].featureId, '001');
  assert.throws(() => {r.geometry.coordinates[0] = 0;});
});
test('serialization ignores object insertion order but preserves array order', () => {
  const reverse = v => Array.isArray(v) ? v.map(reverse) : v && typeof v === 'object'
    ? Object.fromEntries(Object.entries(v).reverse().map(([k,x]) => [k,reverse(x)])) : v;
  const p = fixture(); assert.equal(serialize(p), serialize(reverse(p)));
  p.aliases = ['A','B']; const a = serialize(p); p.aliases.reverse(); assert.notEqual(serialize(p), a);
});
test('unsupported contract, missing required fields and unknown taxonomy fail', () => {
  const p = fixture(); p.contractVersion = 'v2'; assert.throws(() => normalize(p));
  p.contractVersion = GOVERNED_PLACE_CONTRACT; delete p.revisionId; assert.throws(() => normalize(p));
  p.revisionId = 'r1'; p.placeType = 'DRILLSHIP'; assert.throws(() => normalize(p));
  assert.ok(PLACE_TYPES.includes('OFFSHORE_STRUCTURE'));
});

test('canonical collisions and repeated aliases never guess or duplicate an identity', () => {
  const a = fixture(), b = second(); b.canonicalName = 'Test Shelf'; b.aliases = [];
  a.aliases.push('Test Shelf', 'TEST BANK');
  assert.deepEqual(resolve([a], 'test bank').placeIds, [a.placeId]);
  assert.deepEqual(resolve([b, a], 'test shelf'), {status:'ambiguous', placeIds:[a.placeId,b.placeId]});
  assert.notEqual(alias("Captain's Bank"), alias('Captains Bank'));
  assert.notEqual(alias('North-Bank'), alias('North Bank'));
  for (const name of ['', '  ', 42, [], null]) {
    const p = fixture(); p.canonicalName = name; assert.throws(() => normalize(p));
  }
});

test('authority namespaces and multiple sources preserve evidence without identity merging', () => {
  const a = fixture(), b = second(); b.provenance[0].featureId = a.provenance[0].featureId;
  b.provenance[0].authorityId = 'other-authority'; assert.equal(catalog([a,b]).length, 2);
  b.provenance[0].authorityId = a.provenance[0].authorityId;
  b.provenance[0].datasetId = 'other-dataset'; assert.equal(catalog([a,b]).length, 2);
  b.provenance[0].datasetId = a.provenance[0].datasetId; assert.throws(() => catalog([a,b]));
  b.provenance[0].featureId = null; assert.equal(catalog([a,b]).length, 2);
  a.provenance.push({...a.provenance[0], sourceId:'source-b', sourceSnapshot:'later-snapshot'});
  assert.equal(normalize(a).provenance.length, 2); assert.equal(catalog([a]).length, 1);
  a.provenance[1].sourceId = 'source-a'; assert.throws(() => normalize(a));
});

test('revisions preserve identity across geometry, alias, provenance, verification and status changes', () => {
  const original = fixture(), revised = verified(); revised.revisionId = 'r2';
  revised.aliases = []; revised.canonicalName = 'Corrected Name';
  revised.transformation = {sourceGeometry:structuredClone(original.geometry),
    sourceReferenceSystem:structuredClone(original.coordinateReferenceSystem), sourceRef:'source-a',
    method:'synthetic supplied transformation', implementation:'test', implementationVersion:'1', verificationRef:'review-2'};
  revised.coordinateReferenceSystem = {...original.coordinateReferenceSystem, crs:'EPSG:4326', horizontalDatum:'WGS84'};
  revised.geometry.coordinates = [-86,28]; revised.geometryMeaning = 'feature-location';
  revised.temporal.nature = 'FIXED_STRUCTURE'; revised.temporal.status = 'removed';
  revised.provenance.push({...original.provenance[0], sourceId:'source-b', featureId:null});
  const result = normalize(revised);
  assert.equal(result.placeId, normalize(original).placeId); assert.notEqual(result.revisionId, original.revisionId);
  assert.deepEqual(result.transformation.sourceGeometry, original.geometry);
  assert.equal(result.temporal.status, 'removed'); assert.equal(result.verification.state, 'VERIFIED');
  assert.throws(() => catalog([original,revised])); // one current revision, not a history store
});

test('permissions are independently recorded and frozen without association or current-use inference', () => {
  for (const key of ['display','candidateContext','learningContext']) {
    const p = verified(); p.verification.state = 'CORROBORATED';
    p.eligibility[key] = {status:'permitted', decisionRef:'decision', policyRef:'policy'};
    const r = normalize(p);
    for (const other of Object.keys(r.eligibility).filter(x => x !== key)) assert.equal(r.eligibility[other].status, 'not-assessed');
    p.eligibility[key].status = 'withheld'; assert.equal(r.eligibility[key].status, 'permitted');
    assert.throws(() => { r.eligibility[key].policyRef = 'changed'; });
    assert.equal(Object.hasOwn(r, 'association'), false);
    p.temporal.nature = 'TIME_VARYING_STRUCTURE'; p.eligibility[key].status = 'permitted';
    assert.throws(() => normalize(p));
  }
});

test('malformed nested metadata fails, while execution time and randomness cannot supply facts', () => {
  const edits = [p=>p.placeId=7, p=>p.revisionId='', p=>p.aliases='name', p=>p.aliases=[null],
    p=>p.coordinateReferenceSystem.crs=4326, p=>p.coordinateReferenceSystem.horizontalDatum={},
    p=>p.coordinateReferenceSystem.coordinateOrder='lat,lon', p=>p.provenance=[null],
    p=>p.provenance[0].authorityId='', p=>p.verification.state='trusted',
    p=>p.verification.assessedAt='yesterday', p=>p.eligibility.display.status=true,
    p=>p.eligibility.display.extra='unknown', p=>p.temporal.status='current', p=>p.temporal.observedAt=1,
    p=>p.geometry={type:'MultiPolygon',coordinates:[[]]}];
  for (const edit of edits) { const p = fixture(); edit(p); assert.throws(() => normalize(p)); }
  for (const key of ['reportCount','successRate','communityActivity','rankingBoost','speciesScore','privateLabel','privateCatchHistory']) {
    const p=fixture(); p[key]=1; assert.throws(() => normalize(p));
  }
  const now = Date.now, random = Math.random;
  Date.now = Math.random = () => { throw new Error('implicit fact generation'); };
  try { assert.equal(normalize(fixture()).temporal.observedAt, null); assert.equal(serialize(fixture()), serialize(fixture())); }
  finally { Date.now=now; Math.random=random; }
});
