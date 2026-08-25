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

  const dynamicOpportunity =
    activeOpportunity
      ?.dynamicOpportunity ??
    null;


  const hasGovernedScore =
    Number.isFinite(
      dynamicOpportunity?.score
    );


  const hasGovernedConfidence =
    Number.isFinite(
      dynamicOpportunity
        ?.confidence
        ?.score
    );


  const activeScore =
    activeOpportunity &&
    !hasGovernedScore
      ? calculateBlueMarlinScore(
          activeOpportunity
        )
      : null;


  const activeConfidence =
    activeOpportunity &&
    !hasGovernedConfidence
      ? calculateConfidence(
          activeOpportunity
        )
      : null;


  const opportunityScore =
    Number.isFinite(
      dynamicOpportunity?.score
    )
      ? dynamicOpportunity.score
      : activeScore?.total ?? 0;


  const opportunityConfidence =
    Number.isFinite(
      dynamicOpportunity
        ?.confidence
        ?.score
    )
      ? dynamicOpportunity
          .confidence
          .score
      : activeConfidence?.score ?? 0;


  const opportunityConfidenceLevel =
    dynamicOpportunity
      ?.confidence
      ?.level ??
    activeConfidence?.level ??
    "Unavailable";

  const oceanBriefSummary =
    buildOceanBriefSummary({
      opportunity:
        activeOpportunity,

      dynamicOpportunity,

      liveMarineData,

      score:
        opportunityScore,

      confidence:
        opportunityConfidence
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

const evidenceGroups =
  liveMarineData
    ?.oceanEvidence
    ?.groups ??
  {};


const temperatureEvidence =
  evidenceGroups
    ?.temperature ??
  {};


const currentEvidence =
  evidenceGroups
    ?.current ??
  {};


const productivityEvidence =
  evidenceGroups
    ?.productivity ??
  {};


const structureEvidence =
  evidenceGroups
    ?.structure ??
  {};


const temperatureValue =
  Number.isFinite(
    temperatureEvidence
      ?.values
      ?.temperatureFahrenheit
  )
    ? `${temperatureEvidence.values.temperatureFahrenheit.toFixed(1)}°F`
    : "Unavailable";


const temperatureDetail =
  temperatureEvidence
    ?.headline ??
  "Temperature evidence unavailable";


const currentSpeed =
  currentEvidence
    ?.values
    ?.speedKnots;


const currentDirection =
  currentEvidence
    ?.values
    ?.compassDirection;


const currentFreshness =
  currentEvidence
    ?.values
    ?.freshness ??
  null;


const currentValue =
  Number.isFinite(currentSpeed)
    ? `${currentSpeed} kt${
        currentDirection
          ? ` toward ${currentDirection}`
          : ""
      }`
    : "Unavailable";


const currentDetail =
  currentFreshness === "aging"
    ? `Latest available · Aging · ${
        currentEvidence?.headline ??
        "Current evidence available"
      }`
    : currentEvidence
        ?.headline ??
      "Current evidence unavailable";


const productivityFreshness =
  productivityEvidence
    ?.values
    ?.freshness ??
  null;


const productivityConcentration =
  productivityEvidence
    ?.values
    ?.concentrationMgM3;


const productivityValue =
  productivityFreshness === "stale"
    ? "Stale satellite context"
    : Number.isFinite(
        productivityConcentration
      )
      ? `${productivityConcentration.toFixed(3)} mg/m³`
      : "Unavailable";


const productivityDetail =
  productivityFreshness === "stale"
    ? Number.isFinite(
        productivityConcentration
      )
      ? `${productivityConcentration.toFixed(3)} mg/m³ · ${
          Math.round(
            productivityEvidence
              ?.values
              ?.ageHours ??
            0
          )
        } h old · Not treated as current prey evidence`
      : "Stale observation · Not treated as current prey evidence"
    : productivityEvidence
        ?.headline ??
      "Productivity evidence unavailable";


const structureName =
  structureEvidence
    ?.values
    ?.featureName ??
  null;


const structureDistance =
  structureEvidence
    ?.values
    ?.nearestStructureDistanceNm;


const structureValue =
  structureName
    ? Number.isFinite(
        structureDistance
      )
      ? `${structureName} · ${structureDistance} nm`
      : structureName
    : "Unavailable";


const structureDetail =
  structureEvidence
    ?.headline ??
  "Verified structure evidence unavailable";

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

      <small>
        {opportunityConfidenceLevel}
      </small>

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

          const dynamicOpportunity =
            opportunity
              ?.dynamicOpportunity ??
            null;


          const hasGovernedScore =
            Number.isFinite(
              dynamicOpportunity?.score
            );


          const hasGovernedConfidence =
            Number.isFinite(
              dynamicOpportunity
                ?.confidence
                ?.score
            );


          const fallbackScore =
            !hasGovernedScore
              ? calculateBlueMarlinScore(
                  opportunity
                )
              : null;


          const fallbackConfidence =
            !hasGovernedConfidence
              ? calculateConfidence(
                  opportunity
                )
              : null;


          const displayedScore =
            Number.isFinite(
              dynamicOpportunity
                ?.score
            )
              ? dynamicOpportunity.score
              : fallbackScore?.total ?? 0;


          const displayedConfidenceLevel =
            dynamicOpportunity
              ?.confidence
              ?.level ??
            fallbackConfidence?.level ??
            "Unavailable";

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
                  {displayedConfidenceLevel}
                </small>

                <strong>
                  {displayedScore}
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
                label="Temperature Pattern"
                value={temperatureValue}
                available={
                  temperatureEvidence
                    ?.available === true
                }
              />

              <ReasonCard
                label="Current Evidence"
                value={currentValue}
                available={
                  currentEvidence
                    ?.available === true
                }
              />

              <ReasonCard
                label="Productivity Context"
                value={productivityValue}
                available={
                  productivityEvidence
                    ?.available === true &&
                  productivityFreshness !==
                    "stale"
                }
              />

              <ReasonCard
                label="Verified Structure Context"
                value={structureValue}
                available={
                  structureEvidence
                    ?.available === true
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
              value={temperatureValue}
              detail={temperatureDetail}
              available={
                temperatureEvidence
                  ?.available === true
              }
            />

            <ConditionCard
              accent="chlorophyll"
              label="Chlorophyll"
              value={productivityValue}
              detail={productivityDetail}
              available={
                productivityEvidence
                  ?.available === true &&
                productivityFreshness !==
                  "stale"
              }
            />

            <ConditionCard
              accent="current"
              label="Ocean Current"
              value={currentValue}
              detail={currentDetail}
              available={
                currentEvidence
                  ?.available === true
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
  dynamicOpportunity,
  liveMarineData,
  score,
  confidence
}) {
  if (!opportunity) {
    return (
      "Pelora is still reading the water. " +
      "No clear leading opportunity has separated itself yet."
    );
  }


  const evidenceGroups =
    liveMarineData
      ?.oceanEvidence
      ?.groups ??
    {};


  const temperatureEvidence =
    evidenceGroups
      ?.temperature ??
    {};


  const currentEvidence =
    evidenceGroups
      ?.current ??
    {};


  const productivityEvidence =
    evidenceGroups
      ?.productivity ??
    {};


  const structureEvidence =
    evidenceGroups
      ?.structure ??
    {};


  const pathway =
    dynamicOpportunity
      ?.pathway ??
    null;


  const primarySignal =
    dynamicOpportunity
      ?.primarySignal
      ?.type ??
    null;


  const limitations =
    Array.isArray(
      dynamicOpportunity
        ?.limitations
    )
      ? dynamicOpportunity.limitations
      : [];


  const temperatureAvailable =
    temperatureEvidence
      ?.available ===
    true;


  const currentAvailable =
    currentEvidence
      ?.available ===
    true;


  const currentFreshness =
    currentEvidence
      ?.values
      ?.freshness ??
    null;


  const productivityFreshness =
    productivityEvidence
      ?.values
      ?.freshness ??
    null;


  const structureAvailable =
    structureEvidence
      ?.available ===
    true;


  const persistenceNotEstablished =
    limitations.some(
      limitation =>
        String(limitation)
          .includes(
            "persistence"
          )
    );


  const isStructureAssociated =
    pathway ===
      "structure-associated";


  const isOpenWater =
    pathway ===
      "open-water" ||
    pathway ===
      "open-water-associated";


  let opening =
    `${opportunity.name} is standing apart today.`;


  let oceanStory =
    "The surrounding water is beginning to show a more defined setup.";


  if (
    primarySignal ===
      "current-supported-transition" &&
    temperatureAvailable &&
    currentAvailable
  ) {
    oceanStory =
      isStructureAssociated
        ? (
            "A temperature transition is developing around the structure, " +
            "with the current helping shape the water around it."
          )
        : (
            "A temperature transition is beginning to separate itself from " +
            "the surrounding water, with the current helping define the feature."
          );
  } else if (
    primarySignal ===
      "temperature-transition" &&
    temperatureAvailable
  ) {
    oceanStory =
      isStructureAssociated
        ? (
            "A temperature transition is developing around the structure " +
            "and beginning to separate this area from the surrounding water."
          )
        : (
            "A temperature transition is beginning to stand apart from " +
            "the surrounding water."
          );
  } else if (
    currentAvailable
  ) {
    oceanStory =
      isStructureAssociated
        ? (
            "The current is beginning to shape a more distinct piece of water " +
            "around the structure."
          )
        : (
            "The current is beginning to shape a more distinct piece of open water."
          );
  }


  let structureStory = "";


  if (
    isOpenWater &&
    !structureAvailable
  ) {
    structureStory =
      " The signal is being created by the water itself rather than nearby structure.";
  }


  let cautionStory = "";


  const cautionSignals = [];


  if (
    currentFreshness ===
      "aging"
  ) {
    cautionSignals.push(
      "some of the supporting evidence is getting older"
    );
  }


  if (
    productivityFreshness ===
      "stale"
  ) {
    cautionSignals.push(
      "the biological side of the picture needs a fresher look"
    );
  }


  if (
    persistenceNotEstablished
  ) {
    cautionSignals.push(
      "the feature has not shown enough persistence yet"
    );
  }


  if (
    cautionSignals.length > 0
  ) {
    cautionStory =
      ` ${formatNaturalList(cautionSignals)}.`;
  }


  const confidenceStory =
    confidence >= 80
      ? "Pelora has strong confidence in the setup."
      : confidence >= 60
        ? "The signal is still developing, but it is worth a closer look."
        : "The picture is still developing, so this area is worth watching rather than drawing a strong conclusion from it.";


  return (
    opening +
    " " +
    oceanStory +
    structureStory +
    cautionStory +
    " " +
    confidenceStory
  );
}


function formatNaturalList(items = []) {
  if (items.length === 0) {
    return "";
  }


  if (items.length === 1) {
    return items[0];
  }


  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }


  return (
    `${items.slice(0, -1).join(", ")}, and ` +
    items[items.length - 1]
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