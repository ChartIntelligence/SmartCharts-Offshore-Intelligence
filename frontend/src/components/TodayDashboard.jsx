import {
  calculateBlueMarlinScore
} from "../utils/scoreEngine";

import {
  calculateConfidence
} from "../utils/confidenceEngine";

function TodayDashboard({
  topOpportunities,
  activeOpportunity,
  setSelectedOpportunity,
  liveMarineData,
  liveMarineLoading,
  liveMarineError,
  setActiveTab,
  setSelectedSpot,
  setReportPanelOpen
}) {
  const conditions =
    activeOpportunity?.conditions ?? {};

  const activeScore =
    activeOpportunity
      ? calculateBlueMarlinScore(
          activeOpportunity
        )
      : null;

  const activeConfidence =
    activeOpportunity
      ? calculateConfidence(
          activeOpportunity
        )
      : null;

  const opportunityScore =
    activeScore?.total ?? 0;

  const opportunityConfidence =
    activeConfidence?.score ?? 0;

    const oceanBriefSummary =
  buildOceanBriefSummary({
    opportunity: activeOpportunity,
    conditions,
    score: opportunityScore,
    confidence: opportunityConfidence
  });

const wind =
  liveMarineData?.wind ?? {};

const waves =
  liveMarineData?.waves ?? {};

const swell =
  liveMarineData?.swell ?? {};

const windDirection =
  formatDirection(
    wind.directionDegrees
  );

const waveDirection =
  formatDirection(
    waves.directionDegrees
  );

const marineUpdatedLabel =
  formatMarineTime(
    liveMarineData?.observedAt
  );

const windAndWaveValue =
  liveMarineLoading
    ? "Loading live data..."
    : liveMarineError
      ? "Live data unavailable"
      : Number.isFinite(
          wind.speedKnots
        ) &&
        Number.isFinite(
          waves.heightFeet
        )
        ? `${wind.speedKnots} kt ${windDirection} · ${waves.heightFeet} ft`
        : "Live data unavailable";

  return (
    <main className="dashboard-tab-content velion-home">

      <section className="ocean-brief-command-center">

  <div className="ocean-brief-header">

    <div>

      <p className="section-eyebrow">
        Offshore Command Center
      </p>

      <h2>
        Ocean Brief
      </h2>

      <p className="ocean-brief-summary">
        {oceanBriefSummary}
      </p>

    </div>

  </div>


  <div className="ocean-brief-meta">
   
    <div className="ocean-brief-online-metric">

  <span
    className="velion-live-indicator"
  />

  <span className="ocean-brief-online-copy">

    <strong>
      Pelora Intelligence Online
    </strong>

    <small>
      Brief and opportunity engine
      operational
    </small>

  </span>

</div>

    <div>

      <span>
        Selected Opportunity
      </span>

      <strong>
        {activeOpportunity?.name ??
          "Unavailable"}
      </strong>

    </div>


    <div>

      <span>
        Opportunity Score
      </span>

      <strong>
        {opportunityScore}
      </strong>

    </div>


    <div>

      <span>
        Forecast Confidence
      </span>

      <strong>
        {opportunityConfidence}%
      </strong>

    </div>


    <div>

      <span>
        Marine Data Observed
      </span>

      <strong>
        {marineUpdatedLabel ??
          "Awaiting live update"}
      </strong>

    </div>

  </div>


  <div className="ocean-brief-ranking">

    <div className="ocean-brief-ranking-header">

      <div>

        <p className="velion-card-label">
          Today&apos;s Top Opportunities
        </p>

        <h3>
          Select a location to update the
          dashboard
        </h3>

      </div>


      <button
        type="button"
        className="ocean-brief-view-all"
        onClick={() =>
          setActiveTab("intelligence")
        }
      >
        View All
      </button>

    </div>


    <div className="ocean-brief-opportunity-list">

      {topOpportunities.map(
        (opportunity, index) => {

          const score =
            calculateBlueMarlinScore(
              opportunity
            );

          const confidence =
            calculateConfidence(
              opportunity
            );

          const isActive =
            activeOpportunity?.id ===
              opportunity.id ||
            activeOpportunity?.name ===
              opportunity.name;

          return (

            <button
              type="button"
              key={
                opportunity.id ??
                opportunity.name
              }
              className={[
                "ocean-brief-opportunity",
                isActive
                  ? "active-ocean-opportunity"
                  : ""
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                setSelectedOpportunity(
                  opportunity
                )
              }
            >

              <span className="ocean-brief-rank">
                {index + 1}
              </span>


              <span className="ocean-brief-location">

                <strong>
                  {opportunity.name}
                </strong>

                <small>
                  {opportunity.region ??
                    "Gulf of Mexico"}
                </small>

              </span>


              <span className="ocean-brief-trend">

                <small>
                  {confidence.level}
                </small>

                <strong>
                  {score.total}
                </strong>

              </span>

            </button>

          );
        }
      )}

    </div>

  </div>

</section>


      <section className="velion-command-grid">

        <article className="velion-featured-opportunity">

          <div className="velion-featured-topline">

            <div>

              <p className="velion-card-label">
                Top Blue Marlin Opportunity
              </p>

              <h3>
                {activeOpportunity?.name ??
                  "Opportunity unavailable"}
              </h3>

              <p className="velion-location-meta">
                {activeOpportunity?.region ??
                  "Gulf of Mexico"}

                {activeOpportunity?.type
                  ? ` · ${activeOpportunity.type}`
                  : ""}
              </p>

            </div>


            <div className="velion-score-display">

              <span>
                Opportunity
              </span>

              <strong>
                {opportunityScore}
              </strong>

              <small>
                out of 100
              </small>

            </div>

          </div>


          <div className="velion-confidence-panel">

            <div>

              <span>
                Forecast Confidence
              </span>

              <strong>
                {opportunityConfidence}%
              </strong>

            </div>

            <div className="velion-confidence-track">

              <span
                style={{
                  width:
                    `${opportunityConfidence}%`
                }}
              />

            </div>

          </div>


          <div className="velion-why-panel">

            <div className="velion-section-title">

              <span className="velion-title-icon">
                ✦
              </span>

              <div>
                <h4>
                  Why this zone?
                </h4>

                <p>
                  Current intelligence
                  factors supporting this
                  recommendation.
                </p>
              </div>

            </div>


            <div className="velion-reason-grid">

              <ReasonCard
                label="Temperature Stability"
                value={
                  conditions.sst ??
                  "Awaiting live data"
                }
                available={
                  Boolean(conditions.sst)
                }
              />

              <ReasonCard
                label="Current Organization"
                value={
                  conditions.current ??
                  "Awaiting live data"
                }
                available={
                  Boolean(
                    conditions.current
                  )
                }
              />

              <ReasonCard
                label="Biological Productivity"
                value={
                  conditions.chlorophyll ??
                  "Awaiting live data"
                }
                available={
                  Boolean(
                    conditions.chlorophyll
                  )
                }
              />

              <ReasonCard
                label="Structure Interaction"
                value={
                  activeOpportunity?.type ??
                  "Structure analyzed"
                }
                available={
                  Boolean(activeOpportunity)
                }
              />

            </div>

          </div>


          <div className="velion-featured-actions">

            <button
              type="button"
              className="velion-view-zone-button"
              disabled={!activeOpportunity}
              onClick={() => {
                setSelectedSpot(activeOpportunity);
                setActiveTab("map");
              }}
            >
              View Top Zone on Map
            </button>

            <button
              type="button"
              className="velion-analysis-button"
              onClick={() =>
                setActiveTab(
                  "intelligence"
                )
              }
            >
              Open Full Analysis
            </button>

          </div>

        </article>


        <aside className="velion-condition-panel">

          <div className="velion-section-title">

            <span className="velion-title-icon blue">
              ≋
            </span>

            <div>
             <h3>
               Ocean Evidence
            </h3>

            <p>
              Scientific evidence supporting
              today&apos;s opportunity.
            </p>
            </div>

          </div>


          <div className="velion-condition-list">

            <ConditionCard
              accent="temperature"
              label="Sea Surface Temperature"
              value={
                conditions.sst ??
                "Connecting"
              }
              detail="Temperature and break analysis"
              available={
                Boolean(conditions.sst)
              }
            />

            <ConditionCard
              accent="chlorophyll"
              label="Chlorophyll"
              value={
                conditions.chlorophyll ??
                "Connecting"
              }
              detail="Productive water and edge detection"
              available={
                Boolean(
                  conditions.chlorophyll
                )
              }
            />

            <ConditionCard
              accent="current"
              label="Ocean Current"
              value={
                conditions.current ??
                "Connecting"
              }
              detail="Speed, direction and structure interaction"
              available={
                Boolean(
                  conditions.current
                )
              }
            />

            <ConditionCard
                accent="weather"
                label="Wind and Waves"
                value={windAndWaveValue}
                detail={
                    liveMarineError
                    ? liveMarineError
                    : liveMarineData
                        ? [
                            Number.isFinite(
                            wind.gustKnots
                            )
                            ? `Gusts ${wind.gustKnots} kt`
                            : null,

                            Number.isFinite(
                            waves.periodSeconds
                            )
                            ? `${waves.periodSeconds}s period`
                            : null,

                            waveDirection !== "—"
                            ? `waves ${waveDirection}`
                            : null,

                            marineUpdatedLabel
                            ? `updated ${marineUpdatedLabel}`
                            : null
                        ]
                            .filter(Boolean)
                            .join(" · ")
                        : "Marine forecast and sea state"
                }
                available={
                    Boolean(
                    liveMarineData &&
                    !liveMarineError
                )
             }
         />

          </div>

        </aside>

      </section>


      <section className="velion-home-actions">

        <button
          type="button"
          className="velion-launch-map"
          onClick={() =>
            setActiveTab("map")
          }
        >
          <span>
            Explore
          </span>

          <strong>
            Launch Intelligence Map
          </strong>
        </button>


        <button
          type="button"
          className="velion-log-trip"
          onClick={() =>
            setReportPanelOpen(true)
          }
        >
          <span>
            Captain Data
          </span>

          <strong>
            Log Current or Historical Trip
          </strong>
        </button>

      </section>


      <section className="velion-founding-card">

        <div className="velion-founding-mark">
          FC
        </div>

        <div>

          <p className="section-eyebrow">
            Founding Captain Program
          </p>

          <h3>
            Built with captains, not just
            for captains.
          </h3>

          <p>
            Private logs remain private.
            Captains control whether
            anonymized trip outcomes help
            improve shared intelligence.
          </p>

        </div>


        <span className="velion-founding-badge">
          Founding Access
        </span>

      </section>

    </main>
  );
}


function ReasonCard({
  label,
  value,
  available
}) {
  return (
    <article className="velion-reason-card">

      <span
        className={[
          "velion-reason-check",
          available
            ? "available"
            : "pending"
        ].join(" ")}
      >
        {available ? "✓" : "○"}
      </span>

      <div>

        <small>
          {label}
        </small>

        <strong>
          {value}
        </strong>

      </div>

    </article>
  );
}


function ConditionCard({
  accent,
  label,
  value,
  detail,
  available
}) {
  return (
    <article
      className={[
        "velion-condition-card",
        `velion-condition-${accent}`
      ].join(" ")}
    >

      <div className="velion-condition-accent" />

      <div className="velion-condition-content">

        <div className="velion-condition-header">

          <span>
            {label}
          </span>

          <small
            className={
              available
                ? "condition-live"
                : "condition-pending"
            }
          >
            {available
              ? "Available"
              : "Pending"}
          </small>

        </div>

        <strong>
          {value}
        </strong>

        <p>
          {detail}
        </p>

      </div>

    </article>
  );
}

function buildOceanBriefSummary({
  opportunity,
  conditions,
  score,
  confidence
}) {
  if (!opportunity) {
    return (
      "Pelora is reviewing current ocean conditions " +
      "and waiting for a leading offshore opportunity."
    );
  }

  const evidence = [];

  if (conditions.sst) {
    evidence.push("temperature support");
  }

  if (conditions.current) {
    evidence.push("organized current flow");
  }

  if (conditions.chlorophyll) {
    evidence.push("biological productivity");
  }

  if (opportunity.type) {
    evidence.push("structure interaction");
  }

  const evidenceText =
    evidence.length > 0
      ? evidence.join(", ")
      : "the available ocean evidence";

  const confidenceText =
    confidence >= 80
      ? "high"
      : confidence >= 60
        ? "moderate"
        : "developing";

  return (
    `${opportunity.name} is currently Pelora's leading ` +
    `offshore opportunity with a score of ${score}. ` +
    `The zone is supported by ${evidenceText}. ` +
    `Forecast confidence is ${confidenceText} at ` +
    `${confidence}%.`
  );
}

function formatMarineTime(value) {
  if (!value) {
    return null;
  }

  const rawValue = String(value).trim();

  // If the timestamp doesn't already include a timezone,
  // treat it as UTC.
  const hasTimeZone =
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(rawValue);

  const normalizedValue =
    hasTimeZone
      ? rawValue
      : `${rawValue}Z`;

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(date);
}


function formatDirection(degrees) {
  const value =
    Number(degrees);

  if (
    !Number.isFinite(value)
  ) {
    return "—";
  }

  const directions = [
    "N",
    "NE",
    "E",
    "SE",
    "S",
    "SW",
    "W",
    "NW"
  ];

  const index =
    Math.round(
      value / 45
    ) % 8;

  return directions[index];
}

export default TodayDashboard;