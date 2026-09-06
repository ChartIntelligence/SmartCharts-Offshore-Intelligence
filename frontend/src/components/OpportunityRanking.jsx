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


  let emptyMessage = null;


  if (opportunityState === "loading") {
    emptyMessage =
      "Evaluating governed opportunities…";
  } else if (
    opportunityState === "unavailable"
  ) {
    emptyMessage =
      "Opportunity ranking is temporarily unavailable.";
  } else if (
    opportunityState === "governed-zero"
  ) {
    emptyMessage =
      "No governed opportunities currently meet Pelora's minimum evidence requirements.";
  }


  return (
    <div className="opportunity-ranking">

      <h2>
        Top Blue Marlin Opportunities
      </h2>

      {opportunityState !== "available" ||
      governedOpportunities.length === 0 ? (
        <p>
          {emptyMessage ??
            "No governed opportunities are currently available."}
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
