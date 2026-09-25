// Pure qualification representations. No acquisition, storage or history selection.
import {normalizeOceanProductFrameV1} from '../shared/oceanProductFrame.mjs';
import {oceanArchiveIdentityV1} from '../shared/oceanProductArchive.mjs';
import {copy, freeze, canonical, check, keys, validatePublicationV3} from '../shared/oceanPublication.mjs';

export const ENVIRONMENTAL_OBSERVATION_V1 = 'pelora-environmental-evidence-sample-v1';
export const SCIENTIFIC_ASSESSMENT_RECORD_V1 = 'pelora-publication-candidate-assessment-v1';

// Strict source schemas reject unknown fields too; this also covers private fields
// placed in otherwise descriptive metadata. Opaque identifiers still need governance.
function shared(value) {
  const detached = copy(value); // Reject accessors/inheritance before reading values.
  const privateName = name => typeof name === 'string' &&
    /^(userid|useruuid|captainid|captainuuid|authuuid|email|boat|boatname|origin|range|captainorigin|captainrange|fishinglog|catch|lure|bait|presentation|privatecoordinates|privatetripcoordinates|captaincoordinates|mission|missioncontext|missionstate|auth|token|session)$/.test(name.replace(/[^a-z0-9]/gi, '').toLowerCase());
  const visit = v => {
    if (!v || typeof v !== 'object') return;
    for (const [key, child] of Object.entries(v)) {
      check(!privateName(key));
      // Frame provenance parameters and quality flags encode field names as
      // values. Dedicated private fields there must not bypass key rejection.
      if (key === 'name' || key === 'flagId') check(!privateName(child));
      visit(child);
    }
  };
  visit(detached);
  return detached;
}

/** One exact governed frame/component/sample, not a new global observation identity.
 * Frame identity qualification remains upstream. No claim of archive durability.
 */
export function environmentalObservationV1(input) {
  const p = shared(input);
  keys(p, ['frame', 'componentIndex', 'sampleIndex']);
  const frame = normalizeOceanProductFrameV1(p.frame);
  // Only exact point samples are qualified here. Grid sampling belongs to the
  // existing scalar/archive adapter boundary, not an inferred new sampler.
  check(frame.payload.layout === 'points');
  const {componentIndex, sampleIndex} = p;
  check(Number.isSafeInteger(componentIndex) && componentIndex >= 0);
  check(Number.isSafeInteger(sampleIndex) && sampleIndex >= 0);
  const component = frame.payload.components[componentIndex];
  check(component && sampleIndex < component.values.length);
  const source = oceanArchiveIdentityV1(frame);
  const coordinates = frame.payload.coordinates[sampleIndex];
  return freeze({
    contractVersion: ENVIRONMENTAL_OBSERVATION_V1,
    // Existing frame digest and explicit sample address; no second content hash.
    observationId: canonical([source.frameId, source.frameDigest, componentIndex, sampleIndex]),
    source, componentIndex, sampleIndex,
    product: frame.product, temporal: frame.temporal,
    spatial: {crs: frame.spatial.crs, coordinates},
    component: {variableId: component.variableId, unit: component.unit,
      value: component.values[sampleIndex], missing: component.missing[sampleIndex]},
    quality: frame.quality, provenance: frame.provenance, lineage: frame.lineage
  });
}

export function validateEnvironmentalObservationV1(value, frame) {
  const p = shared(value);
  const expected = environmentalObservationV1({frame, componentIndex: p.componentIndex, sampleIndex: p.sampleIndex});
  check(canonical(p) === canonical(expected));
  return expected;
}

/** Narrow scheduled assessment projection; V3 is the authority, not this view.
 * Result stays an exact governed reference. No fabricated score or intelligence.
 */
export function scientificAssessmentRecordV1(input) {
  const p = shared(input);
  keys(p, ['publication', 'candidateId']);
  const publication = validatePublicationV3(p.publication);
  const result = publication.evaluation.candidateResults.find(r => r.candidateId === p.candidateId);
  check(result && result.species === 'blue-marlin');
  return freeze({
    contractVersion: SCIENTIFIC_ASSESSMENT_RECORD_V1,
    assessmentId: canonical([publication.publicationId, publication.contentDigest, result.candidateId, result.species]),
    publicationReference: {publicationId: publication.publicationId, contentDigest: publication.contentDigest},
    assessment: {contractVersion: 'pelora-scheduled-scientific-assessment-v1', assessmentAt: publication.evaluation.assessmentAt},
    evaluatorVersion: publication.evaluation.evaluatorVersion,
    configuration: {id: publication.cycle.configuration.id,
      version: publication.cycle.configuration.version,
      governanceReference: publication.cycle.configuration.governanceReference},
    evidenceSetId: publication.evidence.evidenceSetId,
    historyId: publication.history.historyId,
    result
  });
}

export function validateScientificAssessmentRecordV1(value, publication) {
  const p = shared(value);
  const expected = scientificAssessmentRecordV1({publication, candidateId: p.result?.candidateId});
  check(canonical(p) === canonical(expected));
  return expected;
}
