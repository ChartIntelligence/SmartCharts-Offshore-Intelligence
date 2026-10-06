// Controlled normalized source shapes. No provider/product or receipt qualification.
import {createHash} from 'node:crypto';
import {exactJson} from '../../exactScientificEvidence.mjs';
import {buildUnifiedOpportunityCandidateSourceUniverseV1, resolveOpportunityCandidateBathymetryV1,
  retainedSpatialSampleLayoutV1} from '../../server.js';
import {captureFixture} from './currentEvidenceCaptureFixture.mjs';
import {RETAINED_BLUE_MARLIN_INPUT_V1} from '../../durableObserve/retainedBlueMarlinComposition.mjs';
export const BASELINE = '234fef5203fab91df3f0132cada6d9ab7726e065';
export const assessment = {contractVersion: 'pelora-scientific-assessment-v1', assessmentAt: '2026-09-24T04:00:00.000Z'};
const digest = value => createHash('sha256').update(exactJson(value)).digest('hex');
export function retainedArtifact(name, content) {
  return {reference: {kind: 'captured', contractVersion: 'pelora-p1-controlled-retained-source-v1',
    referenceId: 'controlled-' + name, sha256: digest(content)}, content};
}
export function refresh(input) {
  function visit(v) {
    if (!v || typeof v !== 'object') return;
    Object.values(v).forEach(visit);
    if (v.reference?.kind === 'captured' && Object.hasOwn(v, 'content')) v.reference.sha256 = digest(v.content);
  }
  visit(input);
  input.context.cohortReference.sha256 = digest(input.entries.map(e => e.candidate.content));
  return input;
}
export function pointArtifact(family, coordinates, name) {
  const p = captureFixture(family).samples[0].point;
  p.requestedLatitude = coordinates[0]; p.requestedLongitude = coordinates[1];
  p.resolvedLatitude = coordinates[0] + 0.01; p.resolvedLongitude = coordinates[1] - 0.01;
  if (p.providerCoordinates) p.providerCoordinates = {resolvedLatitude: p.resolvedLatitude, resolvedLongitude: p.resolvedLongitude};
  if (family !== 'SST') p.ageHours = 4;
  if (family === 'CHLOROPHYLL_DIRECT') p.source.observationType = 'direct-satellite';
  return retainedArtifact(name, {format: 'CONTROLLED_NORMALIZED_POINT', family, payload: p});
}
export function retainedBlueMarlinFixture(count = 1) {
  const raw = buildUnifiedOpportunityCandidateSourceUniverseV1().candidates.slice(0, count);
  const context = {species: 'blue-marlin', regionId: 'controlled-selected-gulf-cohort', sourceAuthority: 'CONTROLLED_FIXTURE', cohortReference: retainedArtifact('selected-cohort', raw).reference};
  const entries = raw.map(candidate => {
    const [lat, lon] = candidate.coordinates, layout = retainedSpatialSampleLayoutV1(lat, lon);
    const neighbors = (points, family) => points.map(p => ({direction: p.direction, outcome: 'FULFILLED', reason: null,
      point: pointArtifact(family, [p.latitude, p.longitude], candidate.id + '-' + family + '-' + p.direction)}));
    return {
      candidate: retainedArtifact(candidate.id + '-catalog', candidate),
      staticParent: retainedArtifact(candidate.id + '-static-parent', {candidateId: candidate.id, coordinates: candidate.coordinates,
        bathymetry: resolveOpportunityCandidateBathymetryV1(candidate)}),
      environment: retainedArtifact(candidate.id + '-environment', {candidateId: candidate.id, assessmentAt: assessment.assessmentAt, context: structuredClone(context),
        requestedCoordinates: candidate.coordinates,
        sst: {center: pointArtifact('SST', candidate.coordinates, candidate.id + '-sst-center'), neighbors: neighbors(layout.sst, 'SST')},
        currents: {center: pointArtifact('CURRENTS', candidate.coordinates, candidate.id + '-current-center'), neighbors: neighbors(layout.currents, 'CURRENTS')},
        chlorophyll: {direct: pointArtifact('CHLOROPHYLL_DIRECT', candidate.coordinates, candidate.id + '-direct'),
          gapFilled: pointArtifact('CHLOROPHYLL_GAP_FILLED', candidate.coordinates, candidate.id + '-gap')},
        dataQuality: retainedArtifact(candidate.id + '-quality', {overall: {classification: 'complete'},
          layers: {chlorophyll: {state: 'live'}, currents: {state: 'live'}, sst: {state: 'live'}}}),
        sourceMetadata: retainedArtifact(candidate.id + '-source-metadata', {sourceAuthority: 'CONTROLLED_FIXTURE',
          units: {SST: ['degC', 'degF'], CURRENTS: ['kn', 'degree', 'm/s'], CHLOROPHYLL: ['mg m^-3']},
          temporalSupport: {kind: 'unknown', qualification: 'NOT_QUALIFIED'}, productRevision: 'controlled-v1',
          receipts: {status: 'UNQUALIFIED_CONTROLLED_FIXTURE'}, staticParents: 'existing-catalog-controlled-replay'})})
    };
  });
  return refresh({contractVersion: RETAINED_BLUE_MARLIN_INPUT_V1, assessment: {...assessment},
    context,
    history: {state: 'UNAVAILABLE', reason: 'shared-scientific-history-unavailable-for-p1', sourceReference: null}, entries});
}
