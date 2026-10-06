import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {composeRetainedBlueMarlinV1} from '../durableObserve/retainedBlueMarlinComposition.mjs';
import {retainedBlueMarlinFixture, refresh} from './fixtures/retainedBlueMarlinFixture.mjs';
import {baselineComposition} from './fixtures/retainedBlueMarlinBaseline.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
import {bindCenterSstSpatial, captureBoundCenterSst, captureLiveChlorophyll} from '../scalarEvidenceHandoff.mjs';
import {encodeNormalizedCurrentHandoff} from '../normalizedEvidenceCapture.mjs';
import {SOURCE_NORMALIZATION_VERSION, SOURCE_NORMALIZATION_REFERENCE} from '../sourceNormalization.mjs';
const projection = r => ({history: r.history, evaluations: r.evaluations, delivery: r.delivery, evaluationState: r.evaluationState});
function compare(f) {const a = composeRetainedBlueMarlinV1(f), b = baselineComposition(f);assert.deepEqual(projection(a), b);return a;}
const env = f => f.entries[0].environment.content;
function ages(f, hours) {
  f.assessment.assessmentAt = new Date(Date.parse('2026-09-24T00:00:00Z') + hours * 3600000).toISOString();
  for (const entry of f.entries) {
    entry.environment.content.assessmentAt = f.assessment.assessmentAt;
    function visit(v) {if (!v || typeof v !== 'object') return; if (Object.hasOwn(v, 'ageHours') && v.observedAt) v.ageHours = Number(((Date.parse(f.assessment.assessmentAt) - Date.parse(v.observedAt)) / 3600000).toFixed(1));Object.values(v).forEach(visit);}
    visit(entry.environment.content);
  }
  return refresh(f);
}

test('independent checkpoint: complete evidence, spatial, habitat, relationship, interpretation, gates, delivery and state', () => {
  const f = retainedBlueMarlinFixture(2), before = exactJson(f), r = compare(f);
  assert.equal(exactJson(f), before);assert.equal(r.evaluations.length, 2);
  assert.deepEqual(r.evaluations.map(e => e.candidate.id), f.entries.map(e => e.candidate.content.id));
  assert.equal(r.evaluations[0].interpretation.negativeConclusionAdequacy.adequate, true);
  assert.equal(r.evaluationState.scope, 'selected-analysis-cohort');assert.equal(r.evaluationState.establishesSpatialCoverage, false);
  assert.equal(r.evaluations[0].ocean.currents.derived.spatialAnalysis.spatialStructure.validSampleCount, 4);
  assert.equal(r.evaluations[0].ocean.sst.derived.spatialStructure.validNeighborCount, 4);
  assert(Object.isFrozen(r.inputsUsed));assert(r.inputsUsed.every(a => a.purposes.length > 0));
});
test('history is explicitly UNAVAILABLE, not AVAILABLE-empty or reconstructed history', () => {
  const r = compare(retainedBlueMarlinFixture());assert.deepEqual(r.history, {state: 'UNAVAILABLE', reason: 'shared-scientific-history-unavailable-for-p1', sourceReference: null});
  assert(!Object.hasOwn(r.history, 'entries'));assert.equal(r.evaluations[0].provenance.history.state, 'UNAVAILABLE');
});
test('absent centers/neighborhood/chlorophyll remain unavailable, never zero-valued observations', () => {
  const f = retainedBlueMarlinFixture(), e = env(f);e.sst.center = null;e.currents.center = null;e.chlorophyll.direct = null;e.chlorophyll.gapFilled = null;
  for (const group of [e.sst, e.currents]) group.neighbors.forEach(s => {s.outcome = 'REJECTED';s.point = null;s.reason = 'controlled-source-unavailable';});
  const r = compare(refresh(f)), o = r.evaluations[0].ocean;
  assert.equal(o.sst.temperatureFahrenheit, null);assert.equal(o.currents.speedKnots, null);assert.equal(o.chlorophyll.concentrationMgM3, null);
  assert.equal(r.evaluationState.state, 'unavailable');assert.equal(r.evaluations[0].interpretation.negativeConclusionAdequacy.adequate, false);
});
for (const failures of [1, 2, 4]) test('partial coverage and rejected samples: ' + failures, () => {
  const f = retainedBlueMarlinFixture();for (const group of [env(f).sst, env(f).currents]) for (let i = 0; i < failures; i++) Object.assign(group.neighbors[i], {outcome: 'REJECTED', point: null, reason: 'controlled-failure'});
  const r = compare(refresh(f));assert.equal(r.evaluations[0].ocean.sst.derived.spatialStructure.validNeighborCount, 4 - failures);
  assert.equal(r.evaluations[0].ocean.currents.derived.spatialAnalysis.spatialStructure.failedSampleCount, failures);
});
test('missing source values are valid missingness through existing governed science', () => {
  const f = retainedBlueMarlinFixture();const p = env(f).currents.center.content.payload;
  Object.assign(p, {speedKnots: null, directionDegrees: null, eastwardMetersPerSecond: null, northwardMetersPerSecond: null});p.source.availability = 'no-valid-pixel';
  const r = compare(refresh(f));assert.equal(r.evaluations[0].ocean.currents.speedKnots, null);assert.equal(r.evaluations[0].interpretation.negativeConclusionAdequacy.adequate, false);
});
test('equal numbers with different source availability preserve the Task 12B.6 counterexample', () => {
  const f = retainedBlueMarlinFixture(), a = compare(f);env(f).currents.neighbors.forEach(s => {s.point.content.payload.source.availability = 'unavailable';});
  const b = compare(refresh(f));assert.equal(a.evaluations[0].ocean.currents.speedKnots, b.evaluations[0].ocean.currents.speedKnots);
  assert.equal(a.evaluations[0].interpretation.negativeConclusionAdequacy.adequate, true);assert.equal(b.evaluations[0].interpretation.negativeConclusionAdequacy.adequate, false);
});
test('equal values with different layer-quality state preserve inadequate surface-water result', () => {
  const f = retainedBlueMarlinFixture();env(f).dataQuality.content.layers.chlorophyll.state = 'unavailable';
  const r = compare(refresh(f));assert.equal(r.evaluations[0].interpretation.negativeConclusionAdequacy.predicates.surfaceWater, false);
  assert(!Object.hasOwn(r.evaluations[0].ocean.dataQuality, 'score'));
});
test('DIRECT preferred over equally current GAP_FILLED with exact alternative lineage retained', () => {
  const r = compare(retainedBlueMarlinFixture());assert.equal(r.evaluations[0].ocean.chlorophyll.source.observationType, 'direct-satellite');
  assert(r.inputsUsed.some(a => a.purposes.some(p => p.endsWith(':chlorophyll-gap'))));
  assert(r.inputsUsed.some(a => a.content.productRevision === 'controlled-v1'));
});
test('existing selection chooses current GAP_FILLED over stale DIRECT without changing provider lineage', () => {
  const f = retainedBlueMarlinFixture(), p = env(f).chlorophyll.direct.content.payload;
  p.observedAt = '2026-09-19T00:00:00Z';p.ageHours = 124;
  const r = compare(refresh(f));assert.equal(r.evaluations[0].ocean.chlorophyll.source.observationType, 'gap-filled-reconstruction');
  assert.equal(r.evaluations[0].ocean.chlorophyll.source.algorithm, 'DINEOF');
});
for (const hours of [72, 73, 96, 97]) test('stale/live-age boundaries preserve existing science at ' + hours + 'h', () => {
  const r = compare(ages(retainedBlueMarlinFixture(), hours));assert.equal(r.evaluations[0].ocean.currents.ageHours, hours);
  assert.equal(r.evaluations[0].interpretation.negativeConclusionAdequacy.adequate, false);
});
test('signed zero survives retained content, composition and existing current handoff decoder', () => {
  const f = retainedBlueMarlinFixture(), p = env(f).currents.center.content.payload;p.northwardMetersPerSecond = -0;
  const r = compare(refresh(f));assert(Object.is(r.evaluations[0].ocean.currents.northwardMetersPerSecond, -0));
  env(f).currents.center.content = {format: 'CURRENT_HANDOFF', family: 'CURRENTS', payload: encodeNormalizedCurrentHandoff(p, SOURCE_NORMALIZATION_VERSION)};
  const decoded = compare(refresh(f));assert(Object.is(decoded.evaluations[0].ocean.currents.northwardMetersPerSecond, -0));
});
test('existing bound SST and DIRECT/GAP scalar decoders reconstruct the same complete composition', async () => {
  const f = retainedBlueMarlinFixture(), e = env(f), expected = compare(f), p = structuredClone(e.sst.center.content.payload);
  delete p.source.availability;
  const spatial = await bindCenterSstSpatial(p, SOURCE_NORMALIZATION_VERSION, () => expected.evaluations[0].ocean.sst.derived.spatialStructure);
  p.derived = {spatialStructure: spatial};
  const scalar = captureBoundCenterSst(p, spatial, [SOURCE_NORMALIZATION_REFERENCE]);
  e.sst.center.content = {format: 'SCALAR_HANDOFF', family: 'SST', payload: scalar};
  for (const [name, family] of [['direct', 'CHLOROPHYLL_DIRECT'], ['gapFilled', 'CHLOROPHYLL_GAP_FILLED']]) {
    e.chlorophyll[name].content = {format: 'SCALAR_HANDOFF', family, payload: captureLiveChlorophyll(e.chlorophyll[name].content.payload, [SOURCE_NORMALIZATION_REFERENCE])};
  }
  const r = compare(refresh(f));assert.deepEqual(r.evaluations[0].ocean.oceanEvidence, expected.evaluations[0].ocean.oceanEvidence);
});
for (const [name, change, pattern] of [
  ['candidate identity', f => {env(f).candidateId = 'wrong';}, /environment binding/],
  ['static parent', f => {f.entries[0].staticParent.content.bathymetry.depthMeters += 1;}, /static parent mismatch/],
  ['sample layout', f => {env(f).currents.neighbors.reverse();}, /sample order\/layout/],
  ['requested coordinates', f => {env(f).sst.center.content.payload.requestedLatitude += 0.01;}, /requested sample/],
  ['species context', f => {f.context.species = 'wahoo';}, /controlled context/],
  ['region context', f => {f.context.regionId = 'wrong';}, /environment binding/],
  ['assessment context', f => {env(f).assessmentAt = '2026-09-24T08:00:00.000Z';}, /environment binding/],
  ['age mismatch', f => {env(f).currents.center.content.payload.ageHours = 3;}, /source age mismatch/],
  ['finished eligibility', f => {f.entries[0].candidate.content.eligibility = {eligible: true};}, /candidate identity\/authority/],
  ['fabricated quality score', f => {env(f).dataQuality.content.score = 100;}, /route does not emit/],
  ['AVAILABLE empty history', f => {f.history.state = 'AVAILABLE';}, /explicit unavailable history/],
  ['private input', f => {env(f).sourceMetadata.content.userId = 'private';}, /private input/]
]) test('reject mismatched/corrupt authority: ' + name, () => {const f = retainedBlueMarlinFixture();change(f);assert.throws(() => composeRetainedBlueMarlinV1(refresh(f)), pattern);});
test('corrupt content reference fails closed', () => {
  const f = retainedBlueMarlinFixture();env(f).sst.center.content.payload.temperatureFahrenheit = 999;
  assert.throws(() => composeRetainedBlueMarlinV1(f), /artifact reference/);
});
test('corrupt current capture/reference fails closed even with refreshed outer retention digest', () => {
  const f = retainedBlueMarlinFixture(), e = env(f);
  const wire = structuredClone(encodeNormalizedCurrentHandoff(e.currents.center.content.payload, SOURCE_NORMALIZATION_VERSION));wire.reference.sha256 = '0'.repeat(64);
  e.currents.center.content = {format: 'CURRENT_HANDOFF', family: 'CURRENTS', payload: wire};
  assert.throws(() => composeRetainedBlueMarlinV1(refresh(f)));
});
test('invalid/accessor/nonfinite input is distinct from valid missingness', () => {
  const f = retainedBlueMarlinFixture();let reads = 0;Object.defineProperty(f, 'assessment', {enumerable: true, get() {reads++;throw Error('getter');}});
  assert.throws(() => composeRetainedBlueMarlinV1(f));assert.equal(reads, 0);
  const bad = retainedBlueMarlinFixture();env(bad).sst.center.content.payload.temperatureFahrenheit = NaN;assert.throws(() => composeRetainedBlueMarlinV1(bad));
});
test('caller mutation cannot change detached frozen outputs or used content; repeated replay is exact', () => {
  const f = retainedBlueMarlinFixture(), a = compare(f), b = compare(f), bytes = exactJson(a);
  assert.equal(bytes, exactJson(b));env(f).sst.center.content.payload.temperatureFahrenheit = 0;f.history.reason = 'mutated';
  assert.equal(exactJson(a), bytes);assert(Object.isFrozen(a.evaluations[0].ocean.sst));assert.equal(a.history.reason, 'shared-scientific-history-unavailable-for-p1');
});
test('requested and provider-resolved coordinates stay separate, never nearest-cell substituted', () => {
  const r = compare(retainedBlueMarlinFixture()), s = r.evaluations[0].ocean.currents.derived.spatialAnalysis.spatialStructure.vectors[0];
  assert.notEqual(s.requestedLatitude, s.resolvedLatitude);assert.notEqual(s.requestedLongitude, s.resolvedLongitude);
  assert.equal(r.evaluations[0].provenance.requestedCoordinates[0], r.evaluations[0].candidate.coordinates[0]);
});
test('same scientific numbers with changed product revision/support retain different references without scientific promotion', () => {
  const f = retainedBlueMarlinFixture(), a = compare(f);env(f).sourceMetadata.content.productRevision = 'controlled-v2';
  const b = compare(refresh(f));assert.deepEqual(a.delivery, b.delivery);assert.notDeepEqual(a.inputsUsed, b.inputsUsed);
  assert.equal(b.evaluations[0].provenance.sourceMetadata.temporalSupport.qualification, 'NOT_QUALIFIED');
});
test('pre-import network/listen denial and implicit-clock denial: fresh processes replay exact bytes', () => {
  const runs = [0, 1].map(() => spawnSync(process.execPath, ['backend/tests/fixtures/retainedBlueMarlinReplay.mjs'],
    {env: {...process.env, PELORA_TEST_OCEAN_CONDITIONS: '1'}, encoding: 'utf8', timeout: 30000, windowsHide: true, maxBuffer: 4e6}));
  runs.forEach(r => assert.equal(r.status, 0, r.stderr));assert.equal(runs[0].stdout, runs[1].stdout);
});
test('adapter has no acquisition/Auth/cache/publication/scheduler ports or import-time activation', () => {
  const source = readFileSync(new URL('../durableObserve/retainedBlueMarlinComposition.mjs', import.meta.url), 'utf8');
  assert(!/\bfetch\(|getOceanConditions\(|getCached|retrieveOceanMemory|Date\.now\(|\.query\(|\.submit\(|setInterval\(|\.listen\(/.test(source));
  assert(!source.includes('publicationScheduler'));assert(!source.includes('publicationStore'));
});

test('conflicting immutable reference identity cannot be repaired by a new content digest', () => {
  const f = retainedBlueMarlinFixture(), e = env(f);
  e.chlorophyll.gapFilled.reference.referenceId = e.chlorophyll.direct.reference.referenceId;
  assert.throws(() => composeRetainedBlueMarlinV1(refresh(f)), /conflicting artifact/);
});
test('future represented source time fails before scientific classification', () => {
  const f = retainedBlueMarlinFixture(), p = env(f).sst.center.content.payload;p.observedAt = '2026-09-24T08:00:00.000Z';
  assert.throws(() => composeRetainedBlueMarlinV1(refresh(f)), /after scientific assessment/);
});


for (const [name, change, pattern] of [
  ['source units', f => {env(f).currents.center.content.payload.source.units = 'kn';}, /source units/],
  ['malformed availability', f => {env(f).sst.center.content.payload.source.availability = 'fresh';}, /source availability/],
  ['wrong chlorophyll family lineage', f => {env(f).chlorophyll.direct.content.payload.source.observationType = 'gap-filled-reconstruction';}, /chlorophyll family lineage/]
]) test('typed retained source refuses invalid ' + name, () => {const f = retainedBlueMarlinFixture();change(f);assert.throws(() => composeRetainedBlueMarlinV1(refresh(f)), pattern);});

for (const family of ['sst', 'currents']) test('nested source role cannot override exact ' + family + ' sample binding', () => {
  const f = retainedBlueMarlinFixture();env(f)[family].neighbors[0].point.content.payload.direction = 'south';
  assert.throws(() => composeRetainedBlueMarlinV1(refresh(f)), /nested sample role mismatch/);
});
