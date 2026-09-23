export const EVALUATION_STATE_CONTRACT = "pelora-governed-opportunity-evaluation-state-v1";

// Completeness describes the selected cohort, never the unsampled captain range.
// Opportunity eligibility and rank are inputs owned exclusively by existing governance.
export function buildGovernedOpportunityEvaluationStateV1({
  candidates = null, results = null, delivery = null, searchCounts = {}, failed = false
} = {}) {
  const known = !failed && Array.isArray(candidates) && Array.isArray(results) &&
    results.length === candidates.length && candidates.every((candidate, index) =>
      candidate.id === results[index]?.candidate?.id &&
      ["fulfilled", "rejected"].includes(results[index]?.status));
  const counts = {
    selectedCandidates: known ? candidates.length : null,
    attemptedCandidates: known ? results.length : null,
    fulfilledExecutionResults: null,
    failedExecutionResults: null,
    rangeExcludedCandidates: searchCounts.rangeExcludedCandidates ?? null,
    habitatIneligibleCandidates: searchCounts.habitatIneligibleCandidates ?? null,
    habitatUnresolvedCandidates: searchCounts.habitatUnresolvedCandidates ?? null,
    adequatelyEvaluatedCandidates: null,
    unresolvedCandidates: null,
    minimumEvidenceGateApprovedCandidates: null,
    rankedOpportunities: null,
    deliveredOpportunities: null
  };
  let state = "unavailable";
  let reason = failed ? "controlled-gulf-evaluation-failed" : "evaluation-cohort-unresolved";
  if (known) {
    const fulfilled = results.filter(result => result.status === "fulfilled");
    const adequate = fulfilled.filter(result =>
      result.value?.negativeConclusionAdequacy?.contractVersion ===
        "pelora-candidate-negative-conclusion-adequacy-v1" &&
      result.value.negativeConclusionAdequacy.adequate === true);
    const resolutions = delivery?.ranking?.rankingResolutions;
    const delivered = delivery?.opportunities;
    const rankingKnown = Array.isArray(resolutions) && Array.isArray(delivered) &&
      Array.isArray(delivery?.ranking?.rankedOpportunities) &&
      resolutions.length === fulfilled.length;
    const gateApprovedCount = fulfilled.filter(result =>
      result.value?.speciesOpportunity?.eligibility?.eligibleForRanking === true).length;
    // Delivery v1 copies the governed ranking. Inconsistent totals cannot support
    // a current conclusion; the caller's existing exception boundary fails closed.
    if (rankingKnown && (
      delivery.ranking.rankedOpportunities.length > gateApprovedCount ||
      delivered.length !== delivery.ranking.rankedOpportunities.length
    )) {
      throw new Error("governed-evaluation-delivery-counts-inconsistent");
    }
    Object.assign(counts, {
      fulfilledExecutionResults: fulfilled.length,
      failedExecutionResults: results.length - fulfilled.length,
      adequatelyEvaluatedCandidates: adequate.length,
      unresolvedCandidates: candidates.length - adequate.length,
      minimumEvidenceGateApprovedCandidates: gateApprovedCount,
      rankedOpportunities: rankingKnown ? delivery.ranking.rankedOpportunities.length : null,
      deliveredOpportunities: rankingKnown ? delivered.length : null
    });
    if (rankingKnown && candidates.length > 0) {
      const complete = adequate.length === candidates.length;
      const useful = adequate.length > 0 || delivered.length > 0;
      state = complete ? (delivered.length > 0 ? "available" : "governed-zero") :
        useful ? "partial" : "unavailable";
      reason = complete ? "selected-cohort-adequately-evaluated" :
        useful ? "selected-cohort-partially-resolved" : "no-adequate-current-opportunity-picture";
    } else if (candidates.length === 0) {
      reason = "no-selected-candidates";
    }
  }
  return {
    state, scope: "selected-analysis-cohort", counts, reason,
    establishesSpatialCoverage: false,
    contractVersion: EVALUATION_STATE_CONTRACT
  };
}

// Narrative is deliberately separate from diagnostic reasons and counts.
export function translateOpportunityEvaluationNarrativeV1(evaluationState) {
  const messages = {
    available: "Current ocean evidence supports the governed opportunities shown here.",
    "governed-zero": "No governed Top Opportunity is established from the current ocean evidence.",
    partial: "Pelora is seeing part of the current ocean picture, but some supporting evidence remains unresolved.",
    unavailable: "The current ocean evidence isn't complete enough to establish a governed opportunity picture yet."
  };
  return {
    summary: messages[evaluationState?.state] ?? messages.unavailable,
    scope: "This reading covers the locations evaluated, not every location in your range.",
    contractVersion: "pelora-opportunity-evaluation-narrative-v1"
  };
}
