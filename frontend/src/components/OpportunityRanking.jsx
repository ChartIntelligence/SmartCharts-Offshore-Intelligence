import { calculateBlueMarlinScore } from "../utils/scoreEngine";
import { calculateConfidence } from "../utils/confidenceEngine";


function OpportunityRanking({ structures, setSelectedSpot }) {


  const ranked = [...structures].sort(
    (a, b) =>
      calculateBlueMarlinScore(b).total -
      calculateBlueMarlinScore(a).total
  );


  return (

    <div className="opportunity-ranking">


      <h2>
        🏆 Top Blue Marlin Opportunities
      </h2>



      {ranked.map((spot, index) => {


        const score = calculateBlueMarlinScore(spot);

        const confidence = calculateConfidence(spot);



        return (

          <div

  className="ranking-card"

  key={spot.name}

  onClick={() => {

    console.log("Selected:", spot.name);

    setSelectedSpot(spot);

  }}

>


            <h3>
              {index + 1}. {spot.name}
            </h3>


            <p>
              Blue Marlin Score:

              <strong>
                {" "}{score.total}
              </strong>
            </p>


            <p>
              Confidence:

              <strong>
                {" "}{confidence.level}
              </strong>
            </p>


          </div>

        );


      })}


    </div>

  );

}


export default OpportunityRanking;