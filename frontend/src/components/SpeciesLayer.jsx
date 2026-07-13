import { Circle } from "react-leaflet";
import { calculateBlueMarlinScore } from "../utils/scoreEngine";

function getColor(score, species){

    if (species === "blackfin") {

        if (score >= 90) {
            return "#111111";
        }

        if (score >= 75) {
            return "#333333";
        }

        if (score >= 60) {
            return "#666666";
        }

        return "#999999";

    }


    if (species === "yellowfin") {

        if (score >= 90) {
            return "#ffd700";
        }

        if (score >= 75) {
            return "#ffb000";
        }

        if (score >= 60) {
            return "#ffe680";
        }

        return "#fff2b3";

    }


    // Blue Marlin default

    if (score >= 90) {
        return "#ff4d4d";
    }

    if (score >= 75) {
        return "#ff8c42";
    }

    if (score >= 60) {
        return "#ffd166";
    }

    return "#9ec9df";

}

function SpeciesLayer({spot, species}){


const marlinScore = calculateBlueMarlinScore(spot);

const score = 
  species === "blueMarlin"
    ? marlinScore.total
    : spot.scores[species];
    

return (

<Circle

center={spot.coordinates}

radius={score * 500}

pathOptions={{

color:getColor(score, species),

fillColor:getColor(score, species),

fillOpacity:0.25

}}

>

</Circle>

);

}


export default SpeciesLayer;