import { calculateBlueMarlinScore } from "./scoreEngine";


function getConfidenceLevel(score) {

  if (score >= 92) {
    return "VERY HIGH";
  }

  if (score >= 82) {
    return "HIGH";
  }

  if (score >= 68) {
    return "MODERATE";
  }

  return "LOW";
}


export function calculateConfidence(spot) {

  let confidence = 35;

  const reasons = [];

  const modelScore = calculateBlueMarlinScore(spot);


  // Data completeness: up to 20 points

  if (spot.structureProfile) {
    confidence += 8;
    reasons.push("Complete structure profile");
  }

  if (spot.conditions?.sst) {
    confidence += 4;
  }

  if (spot.conditions?.current) {
    confidence += 4;
  }

  if (spot.conditions?.chlorophyll) {
    confidence += 4;
  }


  // Predator-prey agreement: up to 15 points

  const preyDifference = Math.abs(
    spot.scores.yellowfin - spot.scores.blackfin
  );

  if (preyDifference <= 5) {
    confidence += 15;
    reasons.push("Strong agreement between tuna indicators");
  } else if (preyDifference <= 12) {
    confidence += 10;
    reasons.push("Good agreement between tuna indicators");
  } else {
    confidence += 4;
    reasons.push("Mixed tuna activity signals");
  }


  // Agreement across scoring categories: up to 20 points

  const contributions = [
    modelScore.ocean,
    modelScore.prey,
    modelScore.structure,
    modelScore.current
  ];

  const contributionAverage =
    contributions.reduce((sum, value) => sum + value, 0) /
    contributions.length;

  const averageDifference =
    contributions.reduce(
      (sum, value) =>
        sum + Math.abs(value - contributionAverage),
      0
    ) / contributions.length;


  if (averageDifference <= 3) {
    confidence += 20;
    reasons.push("Strong agreement across intelligence models");
  } else if (averageDifference <= 7) {
    confidence += 13;
    reasons.push("Good agreement across intelligence models");
  } else {
    confidence += 5;
    reasons.push("Several intelligence signals disagree");
  }


  // Current and productivity confirmation: up to 10 points

  const current =
    spot.conditions.current.toLowerCase();

  if (
    current.includes("strong") &&
    spot.conditions.chlorophyll === "High"
  ) {
    confidence += 10;
    reasons.push("Current and productivity signals align");
  } else if (
    current.includes("strong") ||
    spot.conditions.chlorophyll === "High"
  ) {
    confidence += 6;
    reasons.push("Partial ocean-condition confirmation");
  } else {
    confidence += 2;
  }


  const score = Math.min(
    Math.round(confidence),
    100
  );


  return {
    score,
    level: getConfidenceLevel(score),
    reasons
  };
}