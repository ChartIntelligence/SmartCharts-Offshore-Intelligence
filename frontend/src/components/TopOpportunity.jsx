import { useState } from "react";
import { calculateBlueMarlinScore } from "../utils/scoreEngine";
import { calculateConfidence } from "../utils/confidenceEngine";


function TopOpportunity({ structures }) {

  const [showBreakdown, setShowBreakdown] = useState(false);


  const ranked = [...structures].sort(
    (a, b) =>
      calculateBlueMarlinScore(b).total -
      calculateBlueMarlinScore(a).total
  );


  const best = ranked[0];

  const score = calculateBlueMarlinScore(best);

  const confidence = calculateConfidence(best);



  return (

    <div className="top-opportunity">


      <h2>
        🎯 Today's Best Opportunity
      </h2>


      <h1>
        {best.name}
      </h1>


      <p>
        <strong>Blue Marlin Score:</strong> {score.total}
      </p>


      <p>
        <strong>Yellowfin:</strong> {best.scores.yellowfin}
      </p>


      <p>
        <strong>Blackfin:</strong> {best.scores.blackfin}
      </p>


      <p>
        <strong>SST:</strong> {best.conditions.sst}
      </p>


      <p>
        <strong>Current:</strong> {best.conditions.current}
      </p>


      <p>
        <strong>Chlorophyll:</strong> {best.conditions.chlorophyll}
      </p>


      <p>
        {best.recommendation}
      </p>



      <hr />



      <div className="confidence-badge">

        <strong>
          Confidence:
        </strong>

        <span>
          {confidence.level}
        </span>

      </div>



      <hr />



      <button

        className="breakdown-button"

        onClick={() =>
          setShowBreakdown(!showBreakdown)
        }

      >

        {showBreakdown
          ? "Hide Intelligence Details"
          : "View Intelligence Details"}

      </button>





      {showBreakdown && (

        <div className="intelligence-details">


          <h3>
            Confidence Details
          </h3>


          <p>
            <strong>
              Confidence Score:
            </strong>{" "}
            {confidence.score}%
          </p>



          <ul>

            {confidence.reasons.map((reason)=>(

              <li key={reason}>
                {reason}
              </li>

            ))}

          </ul>





          <div className="score-breakdown">


            <h3>
              Score Breakdown
            </h3>


            <p>
              🌡 Ocean Conditions: +{score.ocean}
            </p>


            <p>
              🐟 Prey Activity: +{score.prey}
            </p>


            <p>
              🏗 Structure Quality: +{score.structure}
            </p>


            <p>
              🌊 Current Position: +{score.current}
            </p>


            <p>
              📅 Seasonality: +{score.seasonal}
            </p>


          </div>


        </div>

      )}


    </div>

  );

}


export default TopOpportunity;