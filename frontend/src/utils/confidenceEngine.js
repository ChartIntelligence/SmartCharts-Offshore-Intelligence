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


export function calculateConfidence(spot = {}) {
  let confidence = 35;

  const reasons = [];

  const modelScore =
    calculateBlueMarlinScore(spot) ?? {};

  const scores =
    spot?.scores &&
    typeof spot.scores === "object"
      ? spot.scores
      : {};

  const conditions =
    spot?.conditions &&
    typeof spot.conditions === "object"
      ? spot.conditions
      : {};


  // Data completeness: up to 20 points

  if (spot?.structureProfile) {
    confidence += 8;
    reasons.push(
      "Complete structure profile"
    );
  }

  if (conditions.sst) {
    confidence += 4;
  }

  if (conditions.current) {
    confidence += 4;
  }

  if (conditions.chlorophyll) {
    confidence += 4;
  }


  // Predator-prey agreement: up to 15 points

  const yellowfin =
    Number(scores.yellowfin);

  const blackfin =
    Number(scores.blackfin);

  if (
    Number.isFinite(yellowfin) &&
    Number.isFinite(blackfin)
  ) {
    const preyDifference =
      Math.abs(
        yellowfin - blackfin
      );

    if (preyDifference <= 5) {
      confidence += 15;

      reasons.push(
        "Strong agreement between tuna indicators"
      );
    } else if (
      preyDifference <= 12
    ) {
      confidence += 10;

      reasons.push(
        "Good agreement between tuna indicators"
      );
    } else {
      confidence += 4;

      reasons.push(
        "Mixed tuna activity signals"
      );
    }
  } else {
    confidence += 2;

    reasons.push(
      "Tuna indicator data incomplete"
    );
  }


  // Agreement across scoring categories: up to 20 points

  const contributions = [
    modelScore.ocean,
    modelScore.prey,
    modelScore.structure,
    modelScore.current
  ]
    .map((value) =>
      Number(value)
    )
    .filter((value) =>
      Number.isFinite(value)
    );

  if (contributions.length >= 2) {
    const contributionAverage =
      contributions.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / contributions.length;

    const averageDifference =
      contributions.reduce(
        (sum, value) =>
          sum +
          Math.abs(
            value -
            contributionAverage
          ),
        0
      ) / contributions.length;

    if (averageDifference <= 3) {
      confidence += 20;

      reasons.push(
        "Strong agreement across intelligence models"
      );
    } else if (
      averageDifference <= 7
    ) {
      confidence += 13;

      reasons.push(
        "Good agreement across intelligence models"
      );
    } else {
      confidence += 5;

      reasons.push(
        "Several intelligence signals disagree"
      );
    }
  } else {
    confidence += 3;

    reasons.push(
      "Limited intelligence model coverage"
    );
  }


  // Current and productivity confirmation: up to 10 points

  const current = String(
    conditions.current ?? ""
  ).toLowerCase();

  const chlorophyll = String(
    conditions.chlorophyll ?? ""
  ).toLowerCase();

  if (
    current.includes("strong") &&
    chlorophyll.includes("high")
  ) {
    confidence += 10;

    reasons.push(
      "Current and productivity signals align"
    );
  } else if (
    current.includes("strong") ||
    chlorophyll.includes("high")
  ) {
    confidence += 6;

    reasons.push(
      "Partial ocean-condition confirmation"
    );
  } else {
    confidence += 2;
  }


  const score = Math.min(
    Math.max(
      Math.round(confidence),
      0
    ),
    100
  );


  return {
    score,
    level:
      getConfidenceLevel(score),
    reasons
  };
}