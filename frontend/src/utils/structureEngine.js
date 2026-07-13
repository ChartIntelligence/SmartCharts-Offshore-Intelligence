export function calculateStructureScore(spot) {

  let score = 0;

  let factors = [];


  const profile = spot.structureProfile;


  if (profile) {

    score += profile.baitRetention * 0.35;

    score += profile.currentInteraction * 0.35;

    score += profile.marlinAttraction * 0.30;


    if (profile.baitRetention >= 90) {

      factors.push("Excellent bait retention");

    }


    if (profile.currentInteraction >= 90) {

      factors.push("Strong current interaction");

    }


    if (profile.marlinAttraction >= 90) {

      factors.push("High marlin attraction profile");

    }


  } 
  
  else {


    if (spot.type === "Seamount") {

      score = 90;
      factors.push("Seamount structure");

    }

    else if (spot.type === "Deepwater Platform") {

      score = 85;
      factors.push("Deepwater platform");

    }

    else if (spot.type === "Canyon System") {

      score = 80;
      factors.push("Canyon system");

    }

    else {

      score = 70;

      factors.push("Standard offshore structure");

    }

  }


  return {

    score: Math.round(Math.min(score, 100)),

    factors

  };

}