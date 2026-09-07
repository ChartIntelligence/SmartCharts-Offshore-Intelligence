function HistoricalOpportunityContinuity({
  historicalFallback = null,
  compact = false
}) {
  if (
    historicalFallback?.available !== true ||
    !Array.isArray(
      historicalFallback?.opportunities
    ) ||
    historicalFallback.opportunities.length ===
      0
  ) {
    return null;
  }


  const evaluatedAt =
    formatHistoricalDate(
      historicalFallback.evaluatedAt
    );

  const age =
    formatHistoricalAge(
      historicalFallback.ageMilliseconds
    );


  return (
    <section
      className={[
        "historical-opportunity-continuity",
        compact
          ? "historical-opportunity-continuity-compact"
          : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="historical-opportunity-header">

        <div>
          <p className="section-eyebrow">
            Ocean Memory
          </p>

          <h2>
            Latest Governed Opportunity
          </h2>

          <p>
            Pelora did not establish a qualifying
            current opportunity for this trip
            mission. Below is the latest governed
            opportunity history Pelora preserved
            under the same captain context.
          </p>
        </div>

        <span className="historical-opportunity-badge">
          Historical
        </span>

      </div>


      <div className="historical-opportunity-time">

        {evaluatedAt && (
          <span>
            Evaluated {evaluatedAt}
          </span>
        )}

        {age && (
          <span>
            {age} ago
          </span>
        )}

      </div>


      <div className="historical-opportunity-list">

        {historicalFallback.opportunities.map(
          historicalEntry => {
            const opportunity =
              historicalEntry?.opportunity ??
              null;

            if (!opportunity) {
              return null;
            }

            const rank =
              Number.isFinite(
                Number(opportunity?.rank)
              )
                ? Number(opportunity.rank)
                : null;

            const score =
              Number.isFinite(
                Number(opportunity?.score)
              )
                ? Number(opportunity.score)
                : null;

            const confidence =
              opportunity?.confidence ??
              null;

            const confidenceScore =
              Number.isFinite(
                Number(confidence?.score)
              )
                ? Number(confidence.score)
                : null;

            const confidenceLevel =
              confidence?.level ??
              null;

            const location =
              opportunity?.location ??
              {};

            const captainContext =
              historicalEntry?.captainContext ??
              null;

            const captainNarrative =
              historicalEntry?.captainNarrative ??
              null;

            return (
              <article
                className="historical-opportunity-card"
                key={
                  historicalEntry?.historyId ??
                  location?.id ??
                  `${location?.name}-${rank}`
                }
              >
                <div className="historical-opportunity-card-header">

                  <div>
                    <span>
                      {Number.isFinite(rank)
                        ? `Historical Rank #${rank}`
                        : "Previously Governed"}
                    </span>

                    <h3>
                      {location?.name ??
                        "Historical Opportunity"}
                    </h3>

                    {location?.region && (
                      <p>
                        {location.region}
                      </p>
                    )}
                  </div>

                </div>


                <div className="historical-opportunity-metrics">

                  <div>
                    <span>
                      Original Score
                    </span>

                    <strong>
                      {Number.isFinite(score)
                        ? score
                        : "Unavailable"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Original Confidence
                    </span>

                    <strong>
                      {Number.isFinite(
                        confidenceScore
                      )
                        ? `${confidenceScore}%`
                        : confidenceLevel ??
                          "Unavailable"}
                    </strong>
                  </div>

                </div>

                {!compact && (
                  <>
                    <HistoricalMissionContext
                    captainContext={
                        captainContext
                    }
                    />

                    <HistoricalNarrative
                    captainNarrative={
                        captainNarrative
                    }
                    />
                </>
                )}

              </article>
            );
          }
        )}

      </div>


      <div className="historical-opportunity-caution">
        <strong>
          Conditions may have changed.
        </strong>

        <p>
          This is preserved historical
          intelligence. It does not establish a
          current opportunity, current ranking
          eligibility, or current rank.
        </p>
      </div>

    </section>
  );
}


const HISTORICAL_NARRATIVE_SECTIONS = [
  ["thermalStructure", "Thermal Structure"],
  ["oceanMovement", "Ocean Movement"],
  [
    "waterColorAndWaterCharacter",
    "Water Color & Water Character"
  ],
  [
    "productivityAndPreyContext",
    "Productivity & Prey Context"
  ],
  [
    "structureInteraction",
    "Structure Context"
  ],
  ["persistence", "Persistence"],
  [
    "speciesHabitatFit",
    "Species Habitat Fit"
  ],
  [
    "evidenceAndConfidence",
    "Evidence & Confidence"
  ]
];


function HistoricalMissionContext({
  captainContext = null
}) {
  if (!captainContext) {
    return null;
  }

  const range =
    Number.isFinite(
      Number(
        captainContext?.operatingRangeNm
      )
    )
      ? Number(
          captainContext.operatingRangeNm
        )
      : null;

  const latitude =
    Number.isFinite(
      Number(
        captainContext?.origin?.latitude
      )
    )
      ? Number(
          captainContext.origin.latitude
        )
      : null;

  const longitude =
    Number.isFinite(
      Number(
        captainContext?.origin?.longitude
      )
    )
      ? Number(
          captainContext.origin.longitude
        )
      : null;

  const entireGulf =
    captainContext?.explorationMode ===
    "entire-gulf";

  const hasContext =
    entireGulf ||
    Number.isFinite(range) ||
    (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    );

  if (!hasContext) {
    return null;
  }


  return (
    <div className="historical-mission-context">

      <span>
        Historical Mission Context
      </span>

      <div>
        {entireGulf && (
          <strong>
            Entire Gulf
          </strong>
        )}

        {!entireGulf &&
          Number.isFinite(range) && (
            <strong>
              Within {range} NM
            </strong>
          )}

        {Number.isFinite(latitude) &&
          Number.isFinite(longitude) && (
            <p>
              Origin{" "}
              {latitude.toFixed(2)},{" "}
              {longitude.toFixed(2)}
            </p>
          )}
      </div>

    </div>
  );
}


function HistoricalNarrative({
  captainNarrative = null
}) {
  const sections =
    captainNarrative?.sections ??
    captainNarrative ??
    null;

  if (!sections) {
    return null;
  }

  const availableSections =
    HISTORICAL_NARRATIVE_SECTIONS
      .map(([key, label]) => ({
        key,
        label,
        section:
          sections?.[key] ?? null
      }))
      .filter(
        item =>
          item.section &&
          typeof item.section === "object"
      );

  if (availableSections.length === 0) {
    return null;
  }


  return (
    <div className="historical-narrative">

      <div className="historical-narrative-heading">
        <span>
          Preserved Governed Analysis
        </span>

        <p>
          This analysis is preserved from
          the original governed evaluation.
          It has not been recalculated using
          current conditions.
        </p>
      </div>


      <div className="historical-narrative-grid">

        {availableSections.map(
          ({
            key,
            label,
            section
          }) => (
            <HistoricalNarrativeSection
              key={key}
              label={label}
              section={section}
            />
          )
        )}

      </div>

    </div>
  );
}


function HistoricalNarrativeSection({
  label,
  section
}) {
  const statements = [
    ["Observed", section?.observed],
    [
      "Interpretation",
      section?.interpreted
    ],
    [
      "What This Supported",
      section?.supported
    ],
    ["Limitation", section?.limited]
  ].filter(
    ([, value]) =>
      typeof value === "string" &&
      value.trim().length > 0
  );

  if (statements.length === 0) {
    return null;
  }


  return (
    <section className="historical-narrative-section">

      <h4>
        {label}
      </h4>

      {statements.map(
        ([heading, value]) => (
          <div
            className="historical-narrative-statement"
            key={heading}
          >
            <span>
              {heading}
            </span>

            <p>
              {value}
            </p>
          </div>
        )
      )}

    </section>
  );
}


function formatHistoricalDate(value) {
  if (
    typeof value !== "string" ||
    !Number.isFinite(Date.parse(value))
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }
  ).format(new Date(value));
}


function formatHistoricalAge(value) {
  const milliseconds =
    Number(value);

  if (
    !Number.isFinite(milliseconds) ||
    milliseconds < 0
  ) {
    return null;
  }

  const minutes =
    Math.floor(
      milliseconds / 60000
    );

  if (minutes < 60) {
    return `${Math.max(1, minutes)} min`;
  }

  const hours =
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"}`;
  }

  const days =
    Math.floor(hours / 24);

  if (days < 30) {
    return `${days} day${days === 1 ? "" : "s"}`;
  }

  const months =
    Math.floor(days / 30);

  return `${months} month${months === 1 ? "" : "s"}`;
}


export default HistoricalOpportunityContinuity;