export function calculatePreyScore(spot) {

  let yellowfin = spot.scores.yellowfin;
  let blackfin = spot.scores.blackfin;


  let score = 0;

  let factors = [];


  // Yellowfin contribution

  if (yellowfin >= 90) {

    score += 40;
    factors.push("Exceptional yellowfin activity");

  }

  else if (yellowfin >= 75) {

    score += 30;
    factors.push("Strong yellowfin presence");

  }

  else if (yellowfin >= 60) {

    score += 20;
    factors.push("Moderate yellowfin activity");

  }



  // Blackfin contribution

  if (blackfin >= 90) {

    score += 35;
    factors.push("High blackfin concentration");

  }

  else if (blackfin >= 75) {

    score += 25;
    factors.push("Good blackfin availability");

  }

  else if (blackfin >= 60) {

    score += 15;
    factors.push("Blackfin present");

  }



  // Bait assumption (temporary)

  if (
    spot.conditions.chlorophyll === "High"
  ) {

    score += 25;

    factors.push(
      "Strong bait-producing water"
    );

  }



  return {

    score: Math.min(score,100),

    factors

  };

}