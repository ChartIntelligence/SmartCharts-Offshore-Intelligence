export function calculateOceanScore(spot){

    let score = 0;

    let factors = [];


    // SST evaluation

    const sst = parseFloat(
        spot.conditions.sst
    );


    if(sst >= 78 && sst <= 82){

        score += 25;
        factors.push("Ideal blue water temperature");

    }

    else if(sst >= 76 && sst <= 84){

        score += 15;
        factors.push("Acceptable temperature range");

    }

    else{

        score += 5;
        factors.push("Temperature outside ideal range");

    }



    // Current evaluation

    if(
        spot.conditions.current
        .toLowerCase()
        .includes("strong")
    ){

        score += 25;
        factors.push("Strong current edge");

    }

    else if(
        spot.conditions.current
        .toLowerCase()
        .includes("moderate")
    ){

        score += 15;
        factors.push("Moderate current activity");

    }

    else{

        score += 5;

    }



    // Chlorophyll

    if(
        spot.conditions.chlorophyll === "High"
    ){

        score +=25;
        factors.push("High biological activity");

    }

    else if(
        spot.conditions.chlorophyll === "Moderate"
    ){

        score +=15;

    }

    else{

        score +=5;

    }



    return {

        score: Math.min(score,100),

        factors

    };

}