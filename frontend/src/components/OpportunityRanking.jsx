import { EVALUATION_MESSAGES } from "../utils/opportunityEvaluationState.js";
function OpportunityRanking({
  opportunities = [],
  opportunityState = "loading",
  setSelectedOpportunity,
  setActiveTab
}) {
  const governedOpportunities =
    Array.isArray(opportunities)
      ? opportunities
      : [];


  const emptyMessage = EVALUATION_MESSAGES[opportunityState] ?? EVALUATION_MESSAGES.unavailable;

  return (
    <div className="opportunity-ranking">

      <h2>
        Top Blue Marlin Opportunities
      </h2>

      {!["available", "partial"].includes(opportunityState) ||
      governedOpportunities.length === 0 ? (
        <p>
          {emptyMessage}
        </p>
      ) : (
        governedOpportunities.map(
          opportunity => {
            const dynamicOpportunity =
              opportunity
                ?.dynamicOpportunity ??
              null;

            const rank =
              dynamicOpportunity?.rank ??
              null;

            const score =
              dynamicOpportunity?.score ??
              null;

            const confidence =
              dynamicOpportunity
                ?.confidence ??
              null;

            return (
              <div
                className="ranking-card"
                key={
                  opportunity?.id ??
                  opportunity?.name
                }
                onClick={() => {
                  if (
                    setSelectedOpportunity
                  ) {
                    setSelectedOpportunity(
                      opportunity
                    );
                  }

                  if (setActiveTab) {
                    setActiveTab("map");
                  }
                }}
              >
                <h3>
                  {Number.isFinite(rank)
                    ? `${rank}. `
                    : ""}
                  {opportunity?.name ??
                    "Open Water Opportunity"}
                </h3>

                <p>
                  Blue Marlin Score:
                  <strong>
                    {" "}
                    {Number.isFinite(score)
                      ? score
                      : "Unavailable"}
                  </strong>
                </p>

                <p>
                  Confidence:
                  <strong>
                    {" "}
                    {confidence?.level ??
                      "Unavailable"}
                  </strong>
                </p>
              </div>
            );
          }
        )
      )}

    </div>
  );
}


export default OpportunityRanking;
