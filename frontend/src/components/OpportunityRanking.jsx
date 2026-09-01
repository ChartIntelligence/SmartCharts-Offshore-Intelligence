function OpportunityRanking({
  opportunities = [],
  setSelectedOpportunity,
  setActiveTab
}) {
  const governedOpportunities =
    Array.isArray(opportunities)
      ? opportunities
      : [];

  return (
    <div className="opportunity-ranking">

      <h2>
        Top Blue Marlin Opportunities
      </h2>

      {governedOpportunities.length ===
      0 ? (
        <p>
          No governed opportunities currently
          meet Pelora&apos;s minimum evidence
          requirements.
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
