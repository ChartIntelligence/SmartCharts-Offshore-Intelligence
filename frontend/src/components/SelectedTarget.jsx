import { calculateBlueMarlinScore } from "../utils/scoreEngine";
import { calculateConfidence } from "../utils/confidenceEngine";


function SelectedTarget({ selectedSpot }) {

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
              "Not available"}
          </strong>
        </div>


        <div>
          <span>Current</span>

          <strong>
            {selectedSpot.conditions?.current ??
              "Not available"}
          </strong>
        </div>


        <div>
          <span>Chlorophyll</span>

          <strong>
            {selectedSpot.conditions
              ?.chlorophyll ??
              "Not available"}
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


export default SelectedTarget;