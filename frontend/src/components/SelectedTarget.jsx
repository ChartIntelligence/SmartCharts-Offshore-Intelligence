import { calculateBlueMarlinScore } from "../utils/scoreEngine";
import { calculateConfidence } from "../utils/confidenceEngine";


function SelectedTarget({
  selectedSpot,
  oceanData,
  oceanLoading,
  oceanError
}) {

  if (!selectedSpot) {
    return (
      <div className="selected-target empty-target">

        <p className="selected-label">
          Selected Location
        </p>

        <h2 className="selected-target-name">
          No Location Selected
        </h2>

        <p>
          Select a location on the map or in the rankings
          to view its SmartCharts Intelligence Report.
        </p>

      </div>
    );
  }


  const score =
    calculateBlueMarlinScore(selectedSpot);

  const confidence =
    safelyCalculateConfidence(selectedSpot);

  const hasScoringData =
    score.dataComplete !== false;

    const isDrillShip =
  selectedSpot.category === "drill_ship";

const reportedPosition =
  selectedSpot.position?.reportedAt;

const positionFreshness =
  selectedSpot.position?.freshness;

  return (
    <div className="selected-target">

      <div className="selected-target-header">

        <div>

          <p className="selected-label">
            SMARTCHARTS INTELLIGENCE REPORT
          </p>

          <h2 className="selected-target-name">
            {selectedSpot.name ||
              "Unnamed Location"}
          </h2>

          <p className="selected-region">
            {selectedSpot.type ||
              "Offshore Location"}

            {selectedSpot.region
              ? ` • ${selectedSpot.region}`
              : ""}
          </p>

        </div>


        <div className="selected-score">

          <strong>
            {hasScoringData
              ? score.total
              : "—"}
          </strong>

          <span>
            {hasScoringData
              ? "Opportunity Score"
              : "Collecting Data"}
          </span>

        </div>

      </div>


     <div className="selected-target-grid">

  {isDrillShip && (
    <div>
      <span>Position Status</span>

      <strong>
        {formatPositionStatus(
          positionFreshness
        )}
      </strong>
    </div>
  )}

  {isDrillShip && (
    <div>
      <span>Position Updated</span>

      <strong>
        {reportedPosition
          ? new Date(
              reportedPosition
            ).toLocaleString()
          : "Timestamp unavailable"}
      </strong>
    </div>
  )}

  <div>
    <span>Confidence</span>

    <strong>
      {hasScoringData
        ? confidence.level
        : "Insufficient Data"}
    </strong>
  </div>

        <div>
          <span>Depth</span>

          <strong>
            {selectedSpot.depth ??
              "Not available"}
          </strong>
        </div>


        <div>
          <span>Sea Surface Temp</span>

          <strong>
            {selectedSpot.conditions?.sst ??
              "Waiting for live data"}
          </strong>
        </div>


        <div>
          <span>Current</span>

          <strong>
            {selectedSpot.conditions?.current ??
              "Waiting for live data"}
          </strong>
        </div>


        <div>
          <span>Chlorophyll</span>

          <strong>
            {selectedSpot.conditions
              ?.chlorophyll ??
              "Waiting for live data"}
          </strong>
        </div>

<div>
  <span>Intelligence Status</span>

  <strong>
    {hasScoringData
      ? "Live Intelligence"
      : "Reference Location"}
  </strong>
</div>

        <div>
          <span>Learning Status</span>

          <strong>
            {hasScoringData
              ? "Active"
              : "Collecting Data"}
          </strong>
        </div>

      </div>


<div className="selected-live-conditions">

  <h3>
    Live Ocean Conditions
  </h3>

  {oceanLoading && (
    <p>
      Loading live conditions...
    </p>
  )}

  {oceanError && (
    <p>
      Live conditions unavailable: {oceanError}
    </p>
  )}

  {!oceanLoading &&
    !oceanError &&
    oceanData && (
      <div className="selected-target-grid">

        <div>
          <span>Wind</span>

          <strong>
            {formatWind(oceanData.wind)}
          </strong>
        </div>

        <div>
          <span>Wind Gusts</span>

          <strong>
            {formatKnots(
              oceanData.wind?.gustKnots
            )}
          </strong>
        </div>

        <div>
          <span>Wave Height</span>

          <strong>
            {formatFeet(
              oceanData.waves?.heightFeet
            )}
          </strong>
        </div>

        <div>
          <span>Wave Period</span>

          <strong>
            {formatSeconds(
              oceanData.waves?.periodSeconds
            )}
          </strong>
        </div>

        <div>
          <span>Swell</span>

          <strong>
            {formatSwell(
              oceanData.swell
            )}
          </strong>
        </div>

        <div>
          <span>Updated</span>

          <strong>
            {formatUpdatedTime(
              oceanData.lastUpdated
            )}
          </strong>
        </div>

      </div>
    )}

</div>


      <div className="selected-recommendation">

        <h3>
          Captain&apos;s Recommendation
        </h3>

        <p>
          {selectedSpot.recommendation ||
            "Review live ocean conditions before evaluating this location."}
        </p>

      </div>

    </div>
  );
}


function safelyCalculateConfidence(spot) {
  try {
    const confidence =
      calculateConfidence(spot);

    return confidence &&
      typeof confidence === "object"
      ? confidence
      : {
          level: "Insufficient Data"
        };
  } catch (error) {
    console.warn(
      `Confidence calculation unavailable for ${
        spot?.name ||
        "unknown location"
      }:`,
      error
    );

    return {
      level: "Insufficient Data"
    };
  }
}

function formatPositionStatus(value) {
  const labels = {
    current: "Current",
    recent: "Recently Reported",
    stale: "Needs Verification",
    "unverified-time": "Timestamp Unavailable",
    "recent-location-unverified":
      "Exact Position Unverified"
  };

  return (
    labels[value] ||
    "Verify Before Navigation"
  );
}

function formatKnots(value) {
  return Number.isFinite(value)
    ? `${value} kt`
    : "Unavailable";
}


function formatFeet(value) {
  return Number.isFinite(value)
    ? `${value} ft`
    : "Unavailable";
}


function formatSeconds(value) {
  return Number.isFinite(value)
    ? `${value} sec`
    : "Unavailable";
}


function formatWind(wind) {
  if (
    !wind ||
    !Number.isFinite(
      wind.speedKnots
    )
  ) {
    return "Unavailable";
  }

  const direction =
    Number.isFinite(
      wind.directionDegrees
    )
      ? ` from ${Math.round(
          wind.directionDegrees
        )}°`
      : "";

  return `${wind.speedKnots} kt${direction}`;
}


function formatSwell(swell) {
  if (
    !swell ||
    !Number.isFinite(
      swell.heightFeet
    )
  ) {
    return "Unavailable";
  }

  const period =
    Number.isFinite(
      swell.periodSeconds
    )
      ? ` at ${swell.periodSeconds} sec`
      : "";

  return `${swell.heightFeet} ft${period}`;
}


function formatUpdatedTime(value) {
  if (!value) {
    return "Unavailable";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unavailable";
  }

  return date.toLocaleString();
}

export default SelectedTarget;