import { Circle } from "react-leaflet";
import { calculateBlueMarlinScore } from "../utils/scoreEngine";


function getZoneColor(score){

    if(score >= 90){
        return "#ff4d4d";
    }

    if(score >= 75){
        return "#ff8c42";
    }

    return "#ffd166";

}



function OpportunityZone({spot}){


const score = calculateBlueMarlinScore(spot).total;


return (

<Circle

center={spot.coordinates}

radius={
    score >= 90
    ? 5000
    :
    score >=75
    ? 8000
    :
    12000
}

pathOptions={{

color:getZoneColor(score),

fillColor:getZoneColor(score),

fillOpacity:0.18

}}

/>

);


}


export default OpportunityZone;