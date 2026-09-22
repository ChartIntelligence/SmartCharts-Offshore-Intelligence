import assert from "node:assert/strict";
import {
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE,
  GULF_EVALUATION_CONTROL_V1,
  buildUnifiedCaptainOpportunityDeliveryV1,
  buildUnifiedOpportunityCandidateSourceUniverseV1,
  buildUnifiedSpeciesOpportunityInterpretationV1,
  evaluateControlledGulfBlueMarlinV1,
  evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1,
  filterUnifiedOpportunityCandidatesByCaptainContextV1,
  getDynamicBlueMarlinOpportunities
} from "../server.js";

const failureReason = "controlled-gulf-evaluation-failed";
const zeroReason = "controlled-gulf-evaluation-produced-no-governed-opportunities";
const mission = {
  originCoordinates: [29.815, -85.303],
  operatingRangeNm: 0.01,
  explorationMode: "within-range"
};
const originalFetch = globalThis.fetch;
const originalWarn = console.warn;
let networkRequests = 0;

// Fail on any alternate provider acquisition, including a swallowed request error.
globalThis.fetch = async () => {
  networkRequests += 1;
  throw new Error("Unexpected provider or storage request in isolated regression");
};
console.warn = () => {};

function assertUnavailable(result) {
  assert.equal(result.available, false);
  assert.equal(result.reason, failureReason);
  assert.notEqual(result.reason, zeroReason);
  assert.equal(result.contractVersion, "pelora-dynamic-blue-marlin-opportunities-v1");
  assert.equal(result.species, "blue-marlin");
  assert.ok(Number.isFinite(Date.parse(result.generatedAt)));
  assert.deepEqual(result.opportunities, []);
  for (const field of ["delivery", "historicalFallback", "search", "evaluation",
    "candidateCount", "evaluatedCandidateCount", "failedCandidateCount"]) {
    assert.equal(result[field], null, `${field} must not imply a completed evaluation`);
  }
  assert.equal(networkRequests, 0, "Failure must not acquire substitute candidates");
}

try {
  for (const error of [new Error("provider timeout"), new Error("internal evaluation failure"), "non-Error rejection"]) {
    let calls = 0;
    let receivedOptions;
    const result = await getDynamicBlueMarlinOpportunities(mission, {
      controlledEvaluator: async options => {
        calls += 1;
        receivedOptions = options;
        throw error;
      }
    });
    assert.equal(calls, 1);
    assert.deepEqual(receivedOptions, {
      ...mission,
      bearerToken: null,
      maximumCandidates: GULF_EVALUATION_CONTROL_V1.maximumCandidates,
      concurrency: GULF_EVALUATION_CONTROL_V1.concurrency
    });
    assertUnavailable(result);
  }
  console.log("PASS controlled exceptions return unavailable without substitute provider requests");

  const universe = buildUnifiedOpportunityCandidateSourceUniverseV1();
  const filtered = filterUnifiedOpportunityCandidatesByCaptainContextV1({
    ...mission, candidates: universe.candidates
  });
  assert.ok(universe.candidates.length > 0);
  assert.deepEqual(filtered.candidates, []);
  const rangeFailure = await getDynamicBlueMarlinOpportunities(mission, {
    controlledEvaluator: async () => {
      throw new Error("failure after captain-context filtering");
    }
  });
  assertUnavailable(rangeFailure);
  console.log("PASS exception cannot replace captain-range-excluded candidates");

  for (const candidate of [
    { id: "shallow", coordinates: [28, -88], waterMask: { elevationMeters: -50 } },
    { id: "unresolved", coordinates: [28.123, -88.123] }
  ]) {
    const eligibility = evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1({
      candidate, speciesProfile: BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    });
    assert.notEqual(eligibility.eligible, true);
  }
  const bathymetryFailure = await getDynamicBlueMarlinOpportunities(mission, {
    controlledEvaluator: async () => {
      throw new Error("failure after bathymetry eligibility");
    }
  });
  assertUnavailable(bathymetryFailure);
  console.log("PASS exception cannot replace depth-ineligible or unresolved candidates");

  // Use the real evidence gate and delivery composition, not a manufactured rank.
  const interpretation = buildUnifiedSpeciesOpportunityInterpretationV1({
    species: "blue-marlin",
    candidate: { id: "governed-test", coordinates: [28, -88] },
    oceanConditions: {
      observedAt: "2026-09-22T12:00:00Z",
      blueMarlinHabitat: {
        summary: { classification: "limited-preliminary-habitat-support" },
        confidence: { score: 60, level: "Moderate", components: {
          confidenceAdjustedSuitability: { score: 45 }
        } },
        opportunityTypes: ["environmental-transition-zone"],
        relationshipGroups: {
          thermalStructure: { score: 22, classification: "moderate-temperature-transition-supported" },
          waterCharacter: { score: 8, classification: "clear-blue-surface-water-observed" }
        }
      }
    }
  });
  const delivery = buildUnifiedCaptainOpportunityDeliveryV1({
    species: "blue-marlin", speciesInterpretations: [interpretation]
  });
  assert.equal(delivery.available, true);
  const controlled = {
    available: true,
    evaluatedAt: "2026-09-22T12:00:00Z",
    search: { totalMarineCandidateCount: 295, selection: "captain-range-stable-nearest-v1",
      explorationMode: mission.explorationMode, originCoordinates: mission.originCoordinates,
      operatingRangeNm: mission.operatingRangeNm },
    evaluation: { evaluatedCandidateCount: 1, successfulCandidateCount: 1, failedCandidateCount: 0 },
    opportunities: delivery.opportunities,
    delivery,
    reason: "controlled-gulf-evaluation-complete"
  };
  const before = structuredClone(controlled);
  const successful = await getDynamicBlueMarlinOpportunities(mission, {
    controlledEvaluator: async () => controlled
  });
  const { generatedAt, ...successfulContract } = successful;
  assert.ok(Number.isFinite(Date.parse(generatedAt)));
  assert.deepEqual(successfulContract, {
    available: true, species: "blue-marlin", candidateCount: 295,
    evaluatedCandidateCount: 1, failedCandidateCount: 0,
    opportunities: before.opportunities, delivery: before.delivery,
    historicalFallback: null, search: before.search, evaluation: before.evaluation,
    reason: before.reason,
    limitations: ["gulf-search-uses-captain-range-stable-nearest-v1-sampling",
      "does-not-yet-evaluate-every-marine-grid-cell", "does-not-confirm-blue-marlin-presence",
      "does-not-estimate-catch-probability"],
    interpretation: "dynamic-governed-blue-marlin-opportunity-ranking",
    contractVersion: "pelora-dynamic-blue-marlin-opportunities-v1"
  });
  assert.deepEqual(controlled, before, "Successful controlled result must not be mutated");
  console.log("PASS successful controlled delivery preserves the existing response contract");

  const zero = await getDynamicBlueMarlinOpportunities(mission);
  const controlledZero = await evaluateControlledGulfBlueMarlinV1(mission);
  assert.equal(zero.available, false);
  assert.equal(zero.reason, zeroReason);
  assert.deepEqual(zero.opportunities, []);
  assert.deepEqual(zero.delivery, controlledZero.delivery);
  assert.deepEqual(zero.search, controlledZero.search);
  assert.deepEqual(zero.evaluation, controlledZero.evaluation);
  assert.equal(zero.evaluatedCandidateCount, 0);
  assert.equal(zero.failedCandidateCount, 0);
  assert.equal(networkRequests, 0);
  console.log("PASS real governed zero remains a completed zero, not an exception failure");
} finally {
  globalThis.fetch = originalFetch;
  console.warn = originalWarn;
}
