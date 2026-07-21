function TodayDashboard({
  topSpot,
  topScore,
  topConfidence,
  liveMarineData,
  liveMarineLoading,
  liveMarineError,
  setActiveTab,
  setSelectedSpot,
  setReportPanelOpen
}) {
  const conditions =
    topSpot?.conditions ?? {};

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

      <section className="velion-home-hero">

        <div className="velion-home-intro">

          <p className="section-eyebrow">
            Offshore Command Center
          </p>

          <h2>
            Today&apos;s Offshore Intelligence
          </h2>

          <p>
            Live ocean conditions,
            structure intelligence and
            captain knowledge combined
            into one clear recommendation.
          </p>

        </div>


        <div className="velion-live-status">

          <span className="velion-live-indicator" />

          <div>
            <strong>
              Pelora Intelligence Online
            </strong>

            <small>
              Map and intelligence engine
              operational
            </small>
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
                {topSpot?.name ??
                  "Opportunity unavailable"}
              </h3>

              <p className="velion-location-meta">
                {topSpot?.region ??
                  "Gulf of Mexico"}

                {topSpot?.type
                  ? ` · ${topSpot.type}`
                  : ""}
              </p>

            </div>


            <div className="velion-score-display">

              <span>
                Opportunity
              </span>

              <strong>
                {topScore}
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
                {topConfidence}%
              </strong>

            </div>

            <div className="velion-confidence-track">

              <span
                style={{
                  width:
                    `${topConfidence}%`
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
                label="Temperature"
                value={
                  conditions.sst ??
                  "Awaiting live data"
                }
                available={
                  Boolean(conditions.sst)
                }
              />

              <ReasonCard
                label="Current"
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
                label="Water Productivity"
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
                label="Structure"
                value={
                  topSpot?.type ??
                  "Structure analyzed"
                }
                available={
                  Boolean(topSpot)
                }
              />

            </div>

          </div>


          <div className="velion-featured-actions">

            <button
              type="button"
              className="velion-view-zone-button"
              disabled={!topSpot}
              onClick={() => {
                setSelectedSpot(topSpot);
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
                Ocean Conditions
              </h3>

              <p>
                Conditions influencing
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

function formatMarineTime(value) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short"
    }
  ).format(date);
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