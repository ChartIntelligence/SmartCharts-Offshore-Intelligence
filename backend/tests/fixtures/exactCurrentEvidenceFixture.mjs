// Narrow SST compatibility only. The producer and spatial formulas are unchanged.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getSeaSurfaceTemperaturePoint, getSstSpatialStructure, assessSstTransitionConfidence} from '../../server.js';
import {resolveScientificAssessmentV1} from '../../scientificAssessment.mjs';
import {copy, freeze} from '../../../shared/oceanPublication.mjs';
import {ref} from './currentEvidenceCaptureFixture.mjs';

const source = readFileSync(new URL('../../server.js', import.meta.url), 'utf8');
function block(start, end) { const a = source.indexOf(start), b = source.indexOf(end, a + start.length); assert(a >= 0 && b > a); return source.slice(a, b); }
const radius = source.match(/const SST_SPATIAL_SAMPLE_RADIUS_NM =\s*\d+;/)[0];
const ttl = source.match(/const SST_POINT_CACHE_TTL_MS =\s*5 \* 60 \* 1000;/)[0];
const pointsCode = block('function createSstSpatialSamplePoints(', 'export async function getSeaSurfaceTemperaturePoint(');
const rangeCode = block('function classifySstSpatialRange(', 'function deriveSstTransitionOrientation(');
const orientationCode = block('function deriveSstTransitionOrientation(', 'export function assessSstTransitionConfidence(');
const assemblerCode = block('async function getSstSpatialStructureAtAssessment(', 'export async function getMarineConditions(');
const points = new Function(radius + pointsCode + 'return createSstSpatialSamplePoints;')();
const offline = new Function('getCachedSeaSurfaceTemperaturePoint', 'resolveScientificAssessmentV1', 'assessSstTransitionConfidence',
  radius + ttl + pointsCode + rangeCode + orientationCode + assemblerCode + 'return getSstSpatialStructureAtAssessment;');
export const assessment = freeze({contractVersion: 'pelora-scientific-assessment-v1', assessmentAt: '2026-09-24T01:00:00Z'});
const latitude = 25, longitude = -90;
const wrap = spatial => ({assessment, sst: {derived: {spatialStructure: spatial}}});

export async function signedZeroProducer(t) {
  const entries = [{role: 'center', latitude, longitude, value: 0},
    ...points(latitude, longitude).map((p, i) => ({...p, role: p.direction, value: i === 0 ? -0 : 0}))];
  const mock = t.mock.method(globalThis, 'fetch', async url => {
    const u = new URL(url); assert.equal(u.hostname, 'marine-api.open-meteo.com');
    const lat = Number(u.searchParams.get('latitude')), lon = Number(u.searchParams.get('longitude'));
    const e = entries.find(p => p.latitude === lat && p.longitude === lon); assert(e);
    const text = '{"latitude":' + lat + ',"longitude":' + lon + ',"current":{"time":"2026-09-24T00:00:00Z","sea_surface_temperature":' + (Object.is(e.value, -0) ? '-0' : '0') + '}}';
    return {ok: true, json: async () => JSON.parse(text)};
  });
  try {
    const samples = [];
    for (const e of entries) samples.push({role: e.role, outcome: 'FULFILLED', point: await getSeaSurfaceTemperaturePoint(e.latitude, e.longitude)});
    const input = {family: 'SST', sourceAuthority: {status: 'SYNTHETIC_FIXTURE', reference: ref('synthetic-exact-source')},
      samples, lineageReferences: [ref('synthetic-parser-response')]};
    return {input, A: wrap(await getSstSpatialStructure(latitude, longitude, samples[0].point.temperatureFahrenheit, assessment))};
  } finally { mock.mock.restore(); }
}
export async function assembleReplayedSst(replay) {
  assert.equal(replay.family, 'SST');
  const center = replay.samples.find(s => s.role === 'center'); assert(center);
  const assemble = offline(async (lat, lon) => {
    const e = points(latitude, longitude).find(p => p.latitude === lat && p.longitude === lon); assert(e);
    const s = replay.samples.find(p => p.role === e.direction); assert(s);
    assert.equal(s.point.requestedLatitude, lat); assert.equal(s.point.requestedLongitude, lon);
    return copy(s.point); // Frozen normalized evidence only, never producer spatial output.
  }, resolveScientificAssessmentV1, assessSstTransitionConfidence);
  return freeze(wrap(await assemble(latitude, longitude, center.point.temperatureFahrenheit, assessment)));
}
