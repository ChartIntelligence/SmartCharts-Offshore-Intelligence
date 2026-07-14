import { calculateOceanScore } from "./oceanEngine";
import { calculatePreyScore } from "./preyEngine";
import { calculateStructureScore } from "./structureEngine";


export function calculateBlueMarlinScore(spot = {}) {

  const conditions =
    spot.conditions || {};

  const hasOceanData =
    conditions.sst != null ||
    conditions.chlorophyll != null ||
    conditions.current != null;


  // =========================
  // CURRENT MODEL
  // =========================

  const currentText = String(
    conditions.current || ""
  ).toLowerCase();

  let current = 0;

  if (currentText.includes("strong")) {
    current = 18;
  } else if (
    currentText.includes("moderate")
  ) {
    current = 12;
  } else if (currentText) {
    current = 6;
  }


  // =========================
  // SEASONAL MODEL
  // =========================

  const seasonal = 8;


  // =========================
  // ENGINE FALLBACKS
  // =========================

  const oceanData = safelyRunEngine(
    calculateOceanScore,
    spot,
    {
      score: 0,
      factors: [
        "Ocean data not yet available"
      ]
    }
  );

  const preyData = safelyRunEngine(
    calculatePreyScore,
    spot,
    {
      score: 0,
      factors: [
        "Prey data not yet available"
      ]
    }
  );

  const structureData = safelyRunEngine(
    calculateStructureScore,
    spot,
    {
      score: 0,
      factors: [
        "Structure data not yet available"
      ]
    }
  );


  const ocean =
    normalizeScore(oceanData.score);

  const preyScore =
    normalizeScore(preyData.score);

  const structureScore =
    normalizeScore(
      structureData.score
    );


  // =========================
  // WEIGHTED MODEL
  // =========================

  const oceanWeighted =
    (ocean / 100) * 35;

  const preyWeighted =
    (preyScore / 100) * 30;

  const structureWeighted =
    (structureScore / 100) * 20;

  const currentWeighted =
    current > 0
      ? (current / 18) * 10
      : 0;

  const seasonalWeighted =
    (seasonal / 10) * 5;


  const total = Math.round(
    oceanWeighted +
    preyWeighted +
    structureWeighted +
    currentWeighted +
    seasonalWeighted
  );


  return {
    total,

    ocean:
      Math.round(oceanWeighted),

    prey:
      Math.round(preyWeighted),

    structure:
      Math.round(structureWeighted),

    current:
      Math.round(currentWeighted),

    seasonal:
      Math.round(seasonalWeighted),

    oceanFactors:
      oceanData.factors || [],

    preyFactors:
      preyData.factors || [],

    structureFactors:
      structureData.factors || [],

    confidence:
      hasOceanData
        ? "developing"
        : "insufficient-data",

    dataComplete:
      hasOceanData
  };
}


function safelyRunEngine(
  engine,
  spot,
  fallback
) {
  try {
    const result =
      engine(spot);

    if (
      !result ||
      typeof result !== "object"
    ) {
      return fallback;
    }

    return {
      ...fallback,
      ...result
    };
  } catch (error) {
    console.warn(
      `SmartCharts engine failed for ${
        spot.name ||
        "unknown location"
      }:`,
      error
    );

    return fallback;
  }
}


function normalizeScore(value) {
  const numericValue =
    Number(value);

  if (
    !Number.isFinite(numericValue)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      numericValue
    )
  );
}