// Independent checkpoint oracle: all scientific implementations imported from the git archive.
// Only original acquisition-free blocks are exposed by the qualification preparer.
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root = path.resolve('.local/ocean-quarantine/cp09b-p1/baseline');
const baseline = await import(pathToFileURL(path.join(root, 'backend/p1Oracle.js')));
const {decodeScalarHandoff} = await import(pathToFileURL(path.join(root, 'backend/scalarEvidenceHandoff.mjs')));
const {decodeNormalizedCurrentHandoff} = await import(pathToFileURL(path.join(root, 'backend/normalizedEvidenceCapture.mjs')));
const {withScientificAssessmentV1} = await import(pathToFileURL(path.join(root, 'backend/scientificAssessment.mjs')));
const {buildGovernedOpportunityEvaluationStateV1} = await import(pathToFileURL(path.join(root, 'backend/opportunityEvaluationState.js')));
export function baselineComposition(input) {
  const x = structuredClone(input);
  const decode = a => a === null ? null : a.content.format === 'SCALAR_HANDOFF' ?
    structuredClone(decodeScalarHandoff(a.content.payload, a.content.family)) :
    a.content.format === 'CURRENT_HANDOFF' ? structuredClone(decodeNormalizedCurrentHandoff(a.content.payload)) : a.content.payload;
  return withScientificAssessmentV1(x.assessment, () => {
    const evaluations = x.entries.map(entry => {
      const raw = entry.candidate.content, env = entry.environment.content, [latitude, longitude] = raw.coordinates;
      const candidate = {...raw, eligibility: baseline.evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1({candidate: raw,
        speciesProfile: baseline.BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE})};
      const layout = baseline.retainedSpatialSampleLayoutV1(latitude, longitude);
      const settled = (values, points, family) => values.map((s, i) => s.outcome === 'REJECTED' ?
        {status: 'rejected', reason: s.reason} : {status: 'fulfilled', value: family === 'SST' ?
          {direction: s.direction, ...decode(s.point)} : {...points[i], current: decode(s.point)}});
      const centerSst = decode(env.sst.center);
      const spatialSst = baseline.buildSstSpatialStructureFromRetainedSamplesV1({samplePoints: layout.sst,
        results: settled(env.sst.neighbors, layout.sst, 'SST'), centerTemperatureFahrenheit: centerSst?.temperatureFahrenheit ?? null, assessment: x.assessment});
      const sst = baseline.buildSstConditionsFromRetainedSpatialV1({sst: centerSst}, spatialSst,
        baseline.buildGovernedEnvironmentalFeatureObservationV1({spatialStructure: spatialSst}));
      const currents = decode(env.currents.center) ?? {speedKnots: null, directionDegrees: null, eastwardMetersPerSecond: null,
        northwardMetersPerSecond: null, observedAt: null, ageHours: null, source: {provider: 'NOAA CoastWatch',
          classification: 'altimetry-derived-geostrophic-current', availability: 'provider-unavailable'}};
      const spatialCurrent = baseline.buildCurrentSpatialStructureFromRetainedSamplesV1({samplePoints: layout.currents,
        results: settled(env.currents.neighbors, layout.currents, 'CURRENTS')});
      currents.derived = baseline.buildCurrentDerivedFromRetainedSpatialV1(currents, spatialCurrent);
      const chlorophyllResolution = baseline.resolveChlorophyllObservation({observations: [decode(env.chlorophyll.direct), decode(env.chlorophyll.gapFilled)]});
      const chlorophyll = chlorophyllResolution.selectedObservation ?? {concentrationMgM3: null, waterClassification: null,
        observedAt: null, ageHours: null, source: {provider: null, classification: 'chlorophyll-unavailable', availability: 'unavailable'}};
      const dataQuality = env.dataQuality.content, ocean = {sst, currents, chlorophyll, dataQuality};
      ocean.oceanEvidence = baseline.assessOceanEvidence({latitude, longitude, ...ocean});
      ocean.oceanOpportunity = baseline.assessOceanOpportunity({oceanEvidence: ocean.oceanEvidence, oceanPersistence: null});
      ocean.oceanSignals = baseline.resolveOceanSignals({oceanOpportunity: ocean.oceanOpportunity});
      const relationshipContext = baseline.buildRelationshipContext({oceanEvidence: ocean.oceanEvidence, oceanOpportunity: ocean.oceanOpportunity, dataQuality});
      const relationships = baseline.assessRelationships({relationshipContext, oceanEvidence: ocean.oceanEvidence, oceanOpportunity: ocean.oceanOpportunity, dataQuality});
      ocean.blueMarlinHabitat = baseline.assessBlueMarlinHabitat(ocean);
      const interpretation = baseline.buildUnifiedSpeciesOpportunityInterpretationV1({candidate, oceanConditions: ocean, species: 'blue-marlin', assessment: x.assessment});
      return {candidate, ocean, chlorophyllResolution, bathymetry: baseline.resolveOpportunityCandidateBathymetryV1(raw), relationshipContext,
        relationships, interpretation, rankingInput: baseline.resolveUnifiedOpportunityRankingInputV1({speciesInterpretation: interpretation}),
        provenance: {sourceMetadata: env.sourceMetadata.content, history: x.history, requestedCoordinates: raw.coordinates, sourceAuthority: x.context.sourceAuthority}};
    });
    const candidates = evaluations.map(e => e.candidate);
    const delivery = baseline.buildUnifiedCaptainOpportunityDeliveryV1({species: 'blue-marlin', speciesInterpretations: evaluations.map(e => e.interpretation)});
    const results = evaluations.map(e => ({candidate: e.candidate, status: 'fulfilled', value: e.interpretation}));
    return {history: x.history, evaluations, delivery, evaluationState: buildGovernedOpportunityEvaluationStateV1({candidates, results, delivery})};
  });
}
