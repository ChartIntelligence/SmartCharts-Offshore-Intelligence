import HistoricalOpportunityContinuity from "./HistoricalOpportunityContinuity";
import { EVALUATION_MESSAGES } from "../utils/opportunityEvaluationState.js";

function TodayDashboard({
  historicalFallback = null,
  qaReadOnly = false,
  topOpportunities,
  activeOpportunity,
  opportunityState = "loading",
  setSelectedOpportunity,
  navigateToTopZoneMap,
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


const opportunityScore =
  Number.isFinite(
    dynamicOpportunity?.score
  )
    ? dynamicOpportunity.score
    : null;


const opportunityConfidence =
  Number.isFinite(
    dynamicOpportunity
      ?.confidence
      ?.score
  )
    ? dynamicOpportunity
        .confidence
        .score
    : null;


const opportunityConfidenceLevel =
  dynamicOpportunity
    ?.confidence
    ?.level ??
  "Unavailable";

const opportunityStateLabel = opportunityState === "partial" ? "Partial Ocean Picture" :
  opportunityState === "loading"
    ? "Evaluating"
    : opportunityState === "governed-zero"
      ? "Top Opportunity Not Established"
      : opportunityState === "unavailable"
        ? "Unavailable"
        : activeOpportunity?.name ??
          "Available";


const opportunityScoreLabel =
  opportunityState === "loading"
    ? "Evaluating"
    : opportunityState === "governed-zero"
      ? "Not Ranked"
      : opportunityState === "unavailable"
        ? "Unavailable"
        : Number.isFinite(
            opportunityScore
          )
          ? opportunityScore
          : "Unavailable";


const opportunityScoreTileLabel =
  ["available", "partial"].includes(opportunityState)
    ? opportunityScoreLabel
    : "—";


const opportunityConfidenceLabel =
  opportunityState === "loading"
    ? "Evaluating"
    : opportunityState === "governed-zero"
      ? "Not Established"
      : opportunityState === "unavailable"
        ? "Unavailable"
        : Number.isFinite(
            opportunityConfidence
          )
          ? `${opportunityConfidence}%`
          : "Unavailable";


const opportunityConfidenceStateLabel =
  opportunityState === "loading"
    ? "Reading the ocean"
    : opportunityState === "governed-zero"
      ? "No governed ranking"
      : opportunityState === "unavailable"
        ? "Ocean picture unresolved"
        : opportunityConfidenceLevel;

const oceanBriefSummary =
  buildOceanBriefSummary({
    opportunity:
      activeOpportunity,

    opportunityState,

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

const windAndWavesAvailable =
  !liveMarineLoading &&
  !liveMarineError &&
  Number.isFinite(
    wind.speedKnots
  ) &&
  Number.isFinite(
    waves.heightFeet
  );

const windAndWaveValue =
  liveMarineLoading
    ? "Loading live data..."
    : windAndWavesAvailable
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

  return (<main className="dashboard-tab-content velion-home pelora-top-view">
<section>  <div className="ocean-brief-ranking">

    <div className="ocean-brief-ranking-header">

      <div>

        <h2>Top Opportunities</h2>

        {!qaReadOnly && ["available","partial"].includes(opportunityState) && topOpportunities.length > 0 && <h3>Select an Opportunity to inspect its evidence</h3>}

      </div>




    </div>


    <div className="ocean-brief-opportunity-list">

      {qaReadOnly ? <p>Opportunity evaluation is disabled in this read-only QA workspace. This is not a diagnosis of the ocean.</p> : opportunityState !== "available" && <p>{EVALUATION_MESSAGES[opportunityState]}</p>}

      {!qaReadOnly && ["available", "partial"].includes(opportunityState) &&
        topOpportunities.map(
          (opportunity, index) => {

            const dynamicOpportunity =
              opportunity
                ?.dynamicOpportunity ??
              null;


            const displayedScore =
              Number.isFinite(
                dynamicOpportunity?.score
              )
                ? dynamicOpportunity.score
                : null;


            const displayedConfidenceLevel =
              dynamicOpportunity
                ?.confidence
                ?.level ??
              "Unavailable";


            const isActive =
              activeOpportunity?.id ===
                opportunity.id ||
              activeOpportunity?.name ===
                opportunity.name;


            return (

              <article key={opportunity.id ?? opportunity.name}><button
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
                    {Number.isFinite(displayedScore)
                      ? displayedScore
                      : "Unavailable"}
                  </strong>

                </span>

              </button><div className="pelora-opportunity-actions"><button type="button" onClick={()=>{setSelectedOpportunity(opportunity);setActiveTab("map");}}>View on map</button><button type="button" onClick={()=>{setSelectedOpportunity(opportunity);setActiveTab("intelligence");}}>Open analysis</button></div></article>

            );
          }
        )}

    </div>

  </div>
</section>
{!qaReadOnly && opportunityState === "governed-zero" && historicalFallback?.available === true && <HistoricalOpportunityContinuity historicalFallback={historicalFallback} compact/>}

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
              {activeOpportunity ? `Evidence for ${activeOpportunity.name}. It does not describe the entire mission area.` : "No selected Opportunity evidence. Weather reflects its supplied forecast context."}
            </p>
            </div>

          </div>


          <div className="velion-condition-list">

            <ConditionCard
              loading={opportunityState === "loading"}
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
              loading={opportunityState === "loading"}
              accent="chlorophyll"
              freshness={productivityFreshness}
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
              loading={opportunityState === "loading"}
              accent="current"
              freshness={currentFreshness}
              label="Ocean Current"
              value={currentValue}
              detail={currentDetail}
              available={
                currentEvidence
                  ?.available === true
              }
            />

            <ConditionCard
                loading={Boolean(liveMarineLoading)}
                failed={Boolean(liveMarineError)}
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
                  windAndWavesAvailable
                }
         />

          </div>

        </aside>
<section className="ocean-brief-command-center pelora-compact-brief"><details><summary>Ocean Brief</summary>  <div className="ocean-brief-header">

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



    <div>

      <span>
        Selected Opportunity
      </span>

      <strong>
        {opportunityStateLabel}
      </strong>

    </div>


    <div>

      <span>
        Opportunity Score
      </span>

      <strong>
        {opportunityScoreLabel}
      </strong>

    </div>


    <div>

      <span>
        Forecast Confidence
      </span>

      <strong>
        {opportunityConfidenceLabel}
      </strong>

      <small>
        {opportunityConfidenceStateLabel}
      </small>

    </div>


    <div>

      <span>
        Marine Data Observed
      </span>

      <strong>
        {marineUpdatedLabel ??
          (liveMarineLoading ? "Loading" : "Unavailable")}
      </strong>

    </div>

  </div>


{!qaReadOnly && ["available","partial"].includes(opportunityState) && activeOpportunity && (        <article className="velion-featured-opportunity">

          <div className="velion-featured-topline">

            <div>

              <p className="velion-card-label">
                Top Blue Marlin Opportunity
              </p>

              <h3>
                {opportunityState === "loading"
                  ? "Reading the ocean"
                  : opportunityState ===
                      "governed-zero"
                    ? "Top Opportunity not established"
                    : opportunityState ===
                        "unavailable"
                      ? "Ocean picture unresolved"
                      : activeOpportunity?.name ??
                        (opportunityState === "partial" ? "Partial ocean picture" : "Ocean picture unresolved")}
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
                {opportunityScoreTileLabel}
              </strong>

              <small>
                {["available", "partial"].includes(opportunityState) && Number.isFinite(opportunityScore)
                  ? "out of 100"
                  : opportunityState === "loading"
                    ? "evaluating"
                    : opportunityState === "governed-zero"
                      ? "not ranked"
                      : "unavailable"}
              </small>

            </div>

          </div>


          <div className="velion-confidence-panel">

            <div>

              <span>
                Forecast Confidence
              </span>

              <strong>
                {opportunityConfidenceLabel}
              </strong>

            </div>

            <div className="velion-confidence-track">

              <span
                style={{
                  width:
                    `${Number.isFinite(
                      opportunityConfidence
                    )
                      ? opportunityConfidence
                      : 0}%`
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
                loading={opportunityState === "loading"}
                label="Temperature Pattern"
                value={temperatureValue}
                available={
                  temperatureEvidence
                    ?.available === true
                }
              />

              <ReasonCard
                loading={opportunityState === "loading"}
                freshness={currentFreshness}
                label="Current Evidence"
                value={currentValue}
                available={
                  currentEvidence
                    ?.available === true
                }
              />

              <ReasonCard
                loading={opportunityState === "loading"}
                freshness={productivityFreshness}
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
                loading={opportunityState === "loading"}
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
                if (
                  activeOpportunity
                    ?.dynamicOpportunity
                ) {
                  setSelectedOpportunity(
                    activeOpportunity
                  );

                  setSelectedSpot(null);
                } else {
                  setSelectedSpot(
                    activeOpportunity
                  );

                  setSelectedOpportunity(null);
                }

                navigateToTopZoneMap();
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

        </article>)}</details><p>{qaReadOnly ? "Evaluation is disabled for local QA; no current ocean conclusion is supplied." : oceanBriefSummary}</p></section>
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
</main>);
}


function ReasonCard({
  label,
  value,
  loading = false,
  freshness = null,
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
          {loading && !available && freshness !== "stale" && freshness !== "aging" ? "Loading…" : value}
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
  available,
  loading = false,
  failed = false,
  freshness = null
}) {
  const freshnessKnown = freshness === "stale" || freshness === "aging";
  const evidenceState = freshness === "stale" ? "Stale" : freshness === "aging" ? "Latest available · aging" :
    available ? "Available" : "Unavailable";
  const labelState = loading ? (freshnessKnown ? "Loading · " + evidenceState : available ? "Refreshing" : "Loading") :
    failed ? (available || freshnessKnown ? evidenceState + " · refresh failed" : "Unavailable") : evidenceState;
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
              available && !loading && !failed && freshness !== "stale"
                ? "condition-live"
                : "condition-pending"
            }
          >
            {labelState}
          </small>

        </div>

        <strong>
          {loading && !available && !freshnessKnown ? "Loading…" : value}
        </strong>

        <p>
          {loading && !available && !freshnessKnown ? "Evidence is loading." : detail}
        </p>

      </div>

    </article>
  );
}

function buildOceanBriefSummary({
  opportunity,
  opportunityState,
  dynamicOpportunity,
  liveMarineData,
  score,
  confidence
}) {
  if (opportunityState !== "available") {
    return EVALUATION_MESSAGES[opportunityState] ?? EVALUATION_MESSAGES.unavailable;
  }

  if (!opportunity) {
    return (
      "No governed opportunity is currently available for analysis."
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
    "The available evidence describes the current ocean setting.";


  if (
    primarySignal ===
      "current-supported-transition" &&
    temperatureAvailable &&
    currentAvailable
  ) {
    oceanStory =
      isStructureAssociated
        ? (
            "Temperature-transition evidence and a current observation are available near the structure."
          )
        : (
            "Temperature-transition evidence and a current observation are available in this area."
          );
  } else if (
    primarySignal ===
      "temperature-transition" &&
    temperatureAvailable
  ) {
    oceanStory =
      isStructureAssociated
        ? (
            "Temperature-transition evidence is available near the structure."
          )
        : (
            "Temperature-transition evidence is available in this area."
          );
  } else if (
    currentAvailable
  ) {
    oceanStory =
      isStructureAssociated
        ? (
            "A current observation is available near the structure; organized current features are not established."
          )
        : (
            "A current observation is available in this area; organized current features are not established."
          );
  }


  let structureStory = "";


  if (
    isOpenWater &&
    !structureAvailable
  ) {
    structureStory =
      " This is an open-water setting without established nearby structure support.";
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
      "feature persistence has not been established"
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
        ? "The evidence supports a closer look, with the stated limitations."
        : "The evidence is limited; it does not support a strong conclusion.";


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
