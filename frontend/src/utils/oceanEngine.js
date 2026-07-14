export function calculateOceanScore(spot = {}) {
  let score = 0;
  const factors = [];

  /*
   * Some imported structures do not have ocean-condition data yet.
   * These defaults prevent the engine from crashing.
   */
  const conditions =
    spot?.conditions &&
    typeof spot.conditions === "object"
      ? spot.conditions
      : {};

  const rawSst = conditions.sst;

  const sst =
    typeof rawSst === "number"
      ? rawSst
      : Number.parseFloat(
          String(rawSst ?? "")
        );

  const current = String(
    conditions.current ?? ""
  ).toLowerCase();

  const chlorophyll = String(
    conditions.chlorophyll ?? ""
  ).toLowerCase();


  // SST evaluation

  if (
    Number.isFinite(sst) &&
    sst >= 78 &&
    sst <= 82
  ) {
    score += 25;
    factors.push(
      "Ideal blue water temperature"
    );
  } else if (
    Number.isFinite(sst) &&
    sst >= 76 &&
    sst <= 84
  ) {
    score += 15;
    factors.push(
      "Acceptable temperature range"
    );
  } else if (
    Number.isFinite(sst)
  ) {
    score += 5;
    factors.push(
      "Temperature outside ideal range"
    );
  } else {
    factors.push(
      "SST data unavailable"
    );
  }


  // Current evaluation

  if (
    current.includes("strong")
  ) {
    score += 25;
    factors.push(
      "Strong current edge"
    );
  } else if (
    current.includes("moderate")
  ) {
    score += 15;
    factors.push(
      "Moderate current activity"
    );
  } else if (current) {
    score += 5;
    factors.push(
      "Light current activity"
    );
  } else {
    factors.push(
      "Current data unavailable"
    );
  }


  // Chlorophyll evaluation

  if (
    chlorophyll.includes("high")
  ) {
    score += 20;
    factors.push(
      "High chlorophyll productivity"
    );
  } else if (
    chlorophyll.includes("moderate")
  ) {
    score += 15;
    factors.push(
      "Moderate chlorophyll productivity"
    );
  } else if (
    chlorophyll.includes("low")
  ) {
    score += 8;
    factors.push(
      "Low chlorophyll concentration"
    );
  } else {
    factors.push(
      "Chlorophyll data unavailable"
    );
  }


  return {
    score,
    factors
  };
}