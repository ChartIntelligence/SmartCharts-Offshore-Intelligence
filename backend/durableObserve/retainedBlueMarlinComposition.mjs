// Trusted local retained-input composition only. No acquisition, history resolver or publication port.
import {createHash} from 'node:crypto';
import {copy, freeze, keys, reference} from '../../shared/oceanPublication.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
import {requireScientificAssessmentV1, withScientificAssessmentV1} from '../scientificAssessment.mjs';
import {decodeScalarHandoff} from '../scalarEvidenceHandoff.mjs';
import {decodeNormalizedCurrentHandoff} from '../normalizedEvidenceCapture.mjs';
import {buildGovernedOpportunityEvaluationStateV1} from '../opportunityEvaluationState.js';
import {
  retainedSpatialSampleLayoutV1, buildSstSpatialStructureFromRetainedSamplesV1,
  buildCurrentSpatialStructureFromRetainedSamplesV1, buildCurrentDerivedFromRetainedSpatialV1,
  buildSstConditionsFromRetainedSpatialV1, buildGovernedEnvironmentalFeatureObservationV1,
  resolveOpportunityCandidateBathymetryV1, evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1,
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE, getAgeHours, resolveChlorophyllObservation,
  assessOceanEvidence, assessOceanOpportunity, resolveOceanSignals, buildRelationshipContext,
  assessRelationships, assessBlueMarlinHabitat, buildUnifiedSpeciesOpportunityInterpretationV1,
  resolveUnifiedOpportunityRankingInputV1, buildUnifiedCaptainOpportunityDeliveryV1
} from '../server.js';

export const RETAINED_BLUE_MARLIN_INPUT_V1 = 'pelora-retained-blue-marlin-composition-input-v1';
export const RETAINED_BLUE_MARLIN_OUTPUT_V1 = 'pelora-retained-blue-marlin-composition-output-v1';
const hash = value => createHash('sha256').update(exactJson(value)).digest('hex');
const same = (a, b) => exactJson(a) === exactJson(b);
const requireValue = (condition, reason) => { if (!condition) throw new TypeError('Retained composition: ' + reason); };
function privacy(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    requireValue(!/^(captainid|userid|session|sessionid|authtoken|credentials|password|token|privatecoordinates|triporigin|fishingreport|reportcontents|email|boatname)$/i.test(key.replace(/[_-]/g, '')), 'private input');
    privacy(child);
  }
}
function finiteCoordinates(value) {
  requireValue(Array.isArray(value) && value.length === 2 && value.every(Number.isFinite) &&
    Math.abs(value[0]) <= 90 && Math.abs(value[1]) <= 180, 'coordinates');
}
function artifact(value, used, purpose) {
  keys(value, ['reference', 'content']);
  reference(value.reference);
  requireValue(value.reference.kind === 'captured' && value.reference.sha256 === hash(value.content), 'artifact reference');
  const key = exactJson({contractVersion: value.reference.contractVersion, referenceId: value.reference.referenceId});
  const prior = used.get(key);
  requireValue(!prior || same(prior.content, value.content) && same(prior.reference, value.reference), 'conflicting artifact');
  if (!prior) used.set(key, {...value, purposes: []});
  used.get(key).purposes.push(purpose);
  return value.content;
}
function point(value, family, assessment, used, purpose) {
  if (value === null) return null;
  const data = artifact(value, used, purpose);
  keys(data, ['format', 'family', 'payload']);
  requireValue(data.family === family, 'point family');
  let result;
  if (data.format === 'SCALAR_HANDOFF') result = decodeScalarHandoff(data.payload, family);
  else if (data.format === 'CURRENT_HANDOFF') {
    requireValue(family === 'CURRENTS', 'current handoff family');
    result = decodeNormalizedCurrentHandoff(data.payload);
  } else {
    requireValue(data.format === 'CONTROLLED_NORMALIZED_POINT', 'point format');
    result = data.payload;
    requireValue(!Object.hasOwn(result, 'derived'), 'precomputed controlled context');
  }
  const detached = copy(result);
  requireValue(detached.source && typeof detached.source === 'object', 'point source');
  requireValue(['available', 'unavailable', 'no-valid-pixel', 'provider-unavailable', 'request-failed'].includes(detached.source.availability) || family === 'SST' && !Object.hasOwn(detached.source, 'availability'), 'source availability');
  if (family !== 'SST' && Object.hasOwn(detached.source, 'units')) requireValue(detached.source.units === (family === 'CURRENTS' ? 'm/s' : 'mg m^-3'), 'source units');
  if (family.startsWith('CHLOROPHYLL') && Object.hasOwn(detached.source, 'observationType')) requireValue(detached.source.observationType === (family === 'CHLOROPHYLL_DIRECT' ? 'direct-satellite' : 'gap-filled-reconstruction'), 'chlorophyll family lineage');
  if (detached.observedAt !== null && detached.observedAt !== undefined) {
    const age = getAgeHours(detached.observedAt, assessment);
    requireValue(age !== null, 'source time');
    if (Object.hasOwn(detached, 'ageHours')) requireValue(detached.ageHours === age, 'source age mismatch');
    if (family !== 'SST') detached.ageHours = age;
  } else {
    requireValue(detached.source.availability !== 'available', 'available source without time');
    if (Object.hasOwn(detached, 'ageHours')) requireValue(detached.ageHours === null, 'missing source age');
  }
  const numericFields = family === 'SST' ? ['temperatureFahrenheit', 'temperatureCelsius'] :
    family === 'CURRENTS' ? ['speedKnots', 'directionDegrees', 'eastwardMetersPerSecond', 'northwardMetersPerSecond'] : ['concentrationMgM3'];
  requireValue(numericFields.every(key => Object.hasOwn(detached, key) &&
    (detached[key] === null || Number.isFinite(detached[key]))), 'point numeric shape');
  return detached;
}
function requested(pointValue, expected) {
  if (pointValue === null) return;
  requireValue(Object.is(pointValue.requestedLatitude, expected[0]) && Object.is(pointValue.requestedLongitude, expected[1]), 'requested sample coordinates');
  for (const [key, limit] of [['resolvedLatitude', 90], ['resolvedLongitude', 180]]) {
    requireValue(Object.hasOwn(pointValue, key) && (pointValue[key] === null ||
      Number.isFinite(pointValue[key]) && Math.abs(pointValue[key]) <= limit), 'provider resolved coordinates');
  }
}
function neighbors(values, layout, family, assessment, used, purpose) {
  requireValue(Array.isArray(values) && values.length === layout.length, 'sample layout size');
  return values.map((sample, index) => {
    keys(sample, ['direction', 'outcome', 'point', 'reason']);
    const expected = layout[index];
    requireValue(sample.direction === expected.direction && ['FULFILLED', 'REJECTED'].includes(sample.outcome), 'sample order/layout');
    if (sample.outcome === 'REJECTED') {
      requireValue(sample.point === null && typeof sample.reason === 'string' && sample.reason.length > 0, 'failed sample');
      return {status: 'rejected', reason: sample.reason};
    }
    requireValue(sample.reason === null && sample.point !== null, 'fulfilled sample');
    const p = point(sample.point, family, assessment, used, purpose + ':' + sample.direction);
    requested(p, [expected.latitude, expected.longitude]);
    requireValue(!Object.hasOwn(p, 'derived'), 'nested sample derived context');
    requireValue(!Object.hasOwn(p, 'direction') || p.direction === sample.direction, 'nested sample role mismatch');
    return {status: 'fulfilled', value: family === 'SST' ? {direction: sample.direction, ...p} : {...expected, current: p}};
  });
}

export function composeRetainedBlueMarlinV1(input) {
  // Descriptor-safe snapshot first: no getter, custom prototype, nonfinite value or later mutation.
  const x = copy(input);
  privacy(x);
  keys(x, ['contractVersion', 'assessment', 'context', 'history', 'entries']);
  requireValue(x.contractVersion === RETAINED_BLUE_MARLIN_INPUT_V1, 'input version');
  const assessment = requireScientificAssessmentV1(x.assessment);
  keys(x.context, ['species', 'regionId', 'cohortReference', 'sourceAuthority']);
  requireValue(x.context.species === 'blue-marlin' && typeof x.context.regionId === 'string' && x.context.regionId.length > 0 &&
    x.context.sourceAuthority === 'CONTROLLED_FIXTURE', 'controlled context');
  reference(x.context.cohortReference);
  keys(x.history, ['state', 'reason', 'sourceReference']);
  requireValue(x.history.state === 'UNAVAILABLE' && typeof x.history.reason === 'string' && x.history.reason.length > 0 &&
    x.history.sourceReference === null, 'explicit unavailable history');
  requireValue(Array.isArray(x.entries) && x.entries.length > 0 && x.entries.length <= 64, 'selected cohort');
  requireValue(x.context.cohortReference.kind === 'captured' && x.context.cohortReference.sha256 === hash(x.entries.map(e => e.candidate.content)), 'cohort reference');
  return withScientificAssessmentV1(assessment, () => {
    const used = new Map(), seen = new Set();
    const candidates = [], evaluations = [];
    for (const entry of x.entries) {
      keys(entry, ['candidate', 'staticParent', 'environment']);
      const raw = artifact(entry.candidate, used, 'candidate');
      requireValue(typeof raw.id === 'string' && !seen.has(raw.id) && !Object.hasOwn(raw, 'eligibility'), 'candidate identity/authority');
      seen.add(raw.id);
      finiteCoordinates(raw.coordinates);
      const parent = artifact(entry.staticParent, used, 'static-parent');
      keys(parent, ['candidateId', 'coordinates', 'bathymetry']);
      const bathymetry = resolveOpportunityCandidateBathymetryV1(raw);
      requireValue(parent.candidateId === raw.id && same(parent.coordinates, raw.coordinates) && same(parent.bathymetry, bathymetry), 'static parent mismatch');
      const candidate = {...raw, eligibility: evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1({candidate: raw, speciesProfile: BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE})};
      candidates.push(candidate);
      const env = artifact(entry.environment, used, 'environment');
      keys(env, ['candidateId', 'assessmentAt', 'context', 'requestedCoordinates', 'sst', 'currents', 'chlorophyll', 'dataQuality', 'sourceMetadata']);
      requireValue(env.candidateId === raw.id && env.assessmentAt === assessment.assessmentAt && same(env.context, x.context) && same(env.requestedCoordinates, raw.coordinates), 'environment binding');
      keys(env.sst, ['center', 'neighbors']); keys(env.currents, ['center', 'neighbors']); keys(env.chlorophyll, ['direct', 'gapFilled']);
      const [latitude, longitude] = raw.coordinates, layout = retainedSpatialSampleLayoutV1(latitude, longitude);
      requireValue(layout.sst.length > 0 && layout.currents.length > 0, 'unsupported spatial layout');
      const centerSst = point(env.sst.center, 'SST', assessment, used, raw.id + ':sst-center');
      requested(centerSst, raw.coordinates);
      const sstResults = neighbors(env.sst.neighbors, layout.sst, 'SST', assessment, used, raw.id + ':sst');
      const spatialSst = buildSstSpatialStructureFromRetainedSamplesV1({samplePoints: layout.sst, results: sstResults,
        centerTemperatureFahrenheit: centerSst?.temperatureFahrenheit ?? null, assessment});
      if (centerSst?.derived) requireValue(same(centerSst.derived.spatialStructure, spatialSst), 'retained SST spatial mismatch');
      const sst = buildSstConditionsFromRetainedSpatialV1({sst: centerSst}, spatialSst,
        buildGovernedEnvironmentalFeatureObservationV1({spatialStructure: spatialSst}));
      const centerCurrent = point(env.currents.center, 'CURRENTS', assessment, used, raw.id + ':current-center');
      requested(centerCurrent, raw.coordinates);
      requireValue(!centerCurrent?.derived, 'precomputed current context');
      const currents = centerCurrent ?? {speedKnots: null, directionDegrees: null, eastwardMetersPerSecond: null,
        northwardMetersPerSecond: null, observedAt: null, ageHours: null, source: {provider: 'NOAA CoastWatch',
          classification: 'altimetry-derived-geostrophic-current', availability: 'provider-unavailable'}};
      const currentResults = neighbors(env.currents.neighbors, layout.currents, 'CURRENTS', assessment, used, raw.id + ':current');
      const spatialCurrent = buildCurrentSpatialStructureFromRetainedSamplesV1({samplePoints: layout.currents, results: currentResults});
      currents.derived = buildCurrentDerivedFromRetainedSpatialV1(currents, spatialCurrent);
      const direct = point(env.chlorophyll.direct, 'CHLOROPHYLL_DIRECT', assessment, used, raw.id + ':chlorophyll-direct');
      const gap = point(env.chlorophyll.gapFilled, 'CHLOROPHYLL_GAP_FILLED', assessment, used, raw.id + ':chlorophyll-gap');
      requested(direct, raw.coordinates); requested(gap, raw.coordinates);
      const chlorophyllResolution = resolveChlorophyllObservation({observations: [direct, gap]});
      const chlorophyll = chlorophyllResolution.selectedObservation ?? {concentrationMgM3: null, waterClassification: null,
        observedAt: null, ageHours: null, source: {provider: null, classification: 'chlorophyll-unavailable', availability: 'unavailable'}};
      const dataQuality = artifact(env.dataQuality, used, raw.id + ':data-quality');
      requireValue(Object.keys(dataQuality).every(key => ['overall', 'layers', 'summary', 'interpretation', 'methodVersion'].includes(key)) && !Object.hasOwn(dataQuality.summary ?? {}, 'score'), 'route does not emit dataQuality.score');
      const sourceMetadata = artifact(env.sourceMetadata, used, raw.id + ':source-metadata');
      const ocean = {sst, currents, chlorophyll, dataQuality};
      ocean.oceanEvidence = assessOceanEvidence({latitude, longitude, ...ocean});
      ocean.oceanOpportunity = assessOceanOpportunity({oceanEvidence: ocean.oceanEvidence, oceanPersistence: null});
      ocean.oceanSignals = resolveOceanSignals({oceanOpportunity: ocean.oceanOpportunity});
      const relationshipContext = buildRelationshipContext({oceanEvidence: ocean.oceanEvidence, oceanOpportunity: ocean.oceanOpportunity, dataQuality});
      const relationships = assessRelationships({relationshipContext, oceanEvidence: ocean.oceanEvidence, oceanOpportunity: ocean.oceanOpportunity, dataQuality});
      ocean.blueMarlinHabitat = assessBlueMarlinHabitat(ocean);
      const interpretation = buildUnifiedSpeciesOpportunityInterpretationV1({candidate, oceanConditions: ocean, species: 'blue-marlin', assessment});
      evaluations.push({candidate, ocean, chlorophyllResolution, bathymetry, relationshipContext, relationships, interpretation,
        rankingInput: resolveUnifiedOpportunityRankingInputV1({speciesInterpretation: interpretation}),
        provenance: {sourceMetadata, history: x.history, requestedCoordinates: raw.coordinates, sourceAuthority: x.context.sourceAuthority}});
    }
    const results = evaluations.map(e => ({candidate: e.candidate, status: 'fulfilled', value: e.interpretation}));
    const delivery = buildUnifiedCaptainOpportunityDeliveryV1({species: 'blue-marlin', speciesInterpretations: evaluations.map(e => e.interpretation)});
    const evaluationState = buildGovernedOpportunityEvaluationStateV1({candidates, results, delivery});
    return freeze({contractVersion: RETAINED_BLUE_MARLIN_OUTPUT_V1, qualificationScope: 'CONTROLLED_CURRENT_EVIDENCE_ONLY',
      assessment, context: x.context, history: x.history, evaluations, delivery, evaluationState, inputsUsed: [...used.values()],
      limitations: ['not-operational-science', 'not-beta-readiness', 'full-temporal-narrative-equivalence-unqualified',
        'provider-product-support-and-receipt-authority-not-qualified', 'derivative-feature-science-gates-preserved']});
  });
}
