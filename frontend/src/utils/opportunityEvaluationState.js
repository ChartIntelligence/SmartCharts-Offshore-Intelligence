export const EVALUATION_MESSAGES = Object.freeze({
  loading: "Reading the current ocean picture…",
  available: "Current ocean evidence supports the governed opportunities shown here.",
  "governed-zero": "No governed Top Opportunity is established from the current ocean evidence.",
  partial: "Pelora is seeing part of the current ocean picture, but some supporting evidence remains unresolved.",
  unavailable: "The current ocean evidence isn't complete enough to establish a governed opportunity picture yet."
});
export function interpretOpportunityEvaluation({data = null, loading = false, error = null} = {}) {
  const contract = data?.evaluationState;
  const valid = contract?.contractVersion === "pelora-governed-opportunity-evaluation-state-v1" &&
    ["available", "governed-zero", "partial", "unavailable"].includes(contract.state);
  const state = loading ? "loading" : error || !valid ? "unavailable" : contract.state;
  return {
    state,
    scopeNarrative: !loading && !error && valid &&
      data?.evaluationNarrative?.contractVersion === "pelora-opportunity-evaluation-narrative-v1"
      ? data.evaluationNarrative.scope : null,
    opportunities: ["available", "partial"].includes(state) && Array.isArray(data?.opportunities) ? data.opportunities : [],
    narrative: !loading && !error && valid &&
      data?.evaluationNarrative?.contractVersion === "pelora-opportunity-evaluation-narrative-v1"
      ? data.evaluationNarrative.summary : EVALUATION_MESSAGES[state]
  };
}
