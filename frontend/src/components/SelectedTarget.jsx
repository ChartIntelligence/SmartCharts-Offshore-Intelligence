import { calculateBlueMarlinScore } from "../utils/scoreEngine";
import { calculateConfidence } from "../utils/confidenceEngine";

function SelectedTarget({ selectedSpot }) {

  if (!selectedSpot) {
    return (
      <div className="selected-target empty-target">

        <p className="selected-label">
          Selected Target
        </p>

        <h2 className="selected-target-name">
          No Target Selected
        </h2>

        <p>
          Click a location in the rankings to view its intelligence.
        </p>

      </div>
    );
  }

  const score = calculateBlueMarlinScore(selectedSpot);
  const confidence = calculateConfidence(selectedSpot);

  return (

    <div className="selected-target">

      <div className="selected-target-header">

        <div>

          <p className="selected-label">
            🎯 SELECTED TARGET
          </p>

          <h2 className="selected-target-name">
            {selectedSpot.name}
          </h2>

          <p className="selected-region">
            {selectedSpot.type} • {selectedSpot.region}
          </p>

        </div>


        <div className="selected-score">

          <strong>
            {score.total}
          </strong>

          <span>
            Blue Marlin Score
          </span>

        </div>

      </div>


      <div className="selected-target-grid">

        <div>
          <span>Confidence</span>
          <strong>{confidence.level}</strong>
        </div>

        <div>
          <span>Yellowfin</span>
          <strong>{selectedSpot.scores.yellowfin}</strong>
        </div>

        <div>
          <span>Blackfin</span>
          <strong>{selectedSpot.scores.blackfin}</strong>
        </div>

        <div>
          <span>Sea Surface Temp</span>
          <strong>{selectedSpot.conditions.sst}</strong>
        </div>

        <div>
          <span>Current</span>
          <strong>{selectedSpot.conditions.current}</strong>
        </div>

        <div>
          <span>Chlorophyll</span>
          <strong>{selectedSpot.conditions.chlorophyll}</strong>
        </div>

      </div>


      <div className="selected-recommendation">

        <h3>
          Captain's Recommendation
        </h3>

        <p>
          {selectedSpot.recommendation}
        </p>

      </div>

    </div>

  );

}

export default SelectedTarget;