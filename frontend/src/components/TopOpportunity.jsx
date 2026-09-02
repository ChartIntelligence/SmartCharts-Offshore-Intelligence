function TopOpportunity({
  opportunities = []
}) {
  const best =
    Array.isArray(opportunities)
      ? opportunities[0] ?? null
      : null;

  const dynamicOpportunity =
    best?.dynamicOpportunity ?? null;

  if (!best || !dynamicOpportunity) {
    return (
      <div className="top-opportunity">
        <h2>
          Today's Best Opportunity
        </h2>

        <p>
          No governed opportunity currently
          meets Pelora&apos;s minimum evidence
          requirements.
        </p>
      </div>
    );
  }

  const confidence =
    dynamicOpportunity?.confidence ?? null;

  return (
    <div className="top-opportunity">

      <h2>
        Today's Best Opportunity
      </h2>

      <h1>
        {best.name}
      </h1>

      <p>
        <strong>
          Blue Marlin Score:
        </strong>{" "}
        {Number.isFinite(
          dynamicOpportunity?.score
        )
          ? dynamicOpportunity.score
          : "Unavailable"}
      </p>

      <p>
        <strong>
          Confidence:
        </strong>{" "}
        {confidence?.level ??
          "Unavailable"}
      </p>

      {Number.isFinite(
        confidence?.score
      ) && (
        <p>
          <strong>
            Confidence Score:
          </strong>{" "}
          {confidence.score}%
        </p>
      )}

      {dynamicOpportunity
        ?.primarySignal && (
        <p>
          <strong>
            Primary Signal:
          </strong>{" "}
          {dynamicOpportunity
            .primarySignal
            ?.label ??
            dynamicOpportunity
              .primarySignal
              ?.type ??
            "Unavailable"}
        </p>
      )}

    </div>
  );
}

export default TopOpportunity;
