import { calculateOceanScore } from "./oceanEngine";
import { calculatePreyScore } from "./preyEngine";
import { calculateStructureScore } from "./structureEngine";


export function calculateBlueMarlinScore(spot) {


  let current = 0;

  let seasonal = 8;



  // =========================
  // CURRENT MODEL
  // =========================

  if (
    spot.conditions.current
      .toLowerCase()
      .includes("strong")
  ) {

    current = 18;

  }

  else if (
    spot.conditions.current
      .toLowerCase()
      .includes("moderate")
  ) {

    current = 12;

  }

  else {

    current = 6;

  }



  // =========================
  // OCEAN ENGINE
  // =========================

  const oceanData = calculateOceanScore(spot);

  const ocean = oceanData.score;



  // =========================
  // PREY ENGINE
  // =========================

  const preyData = calculatePreyScore(spot);

  const preyScore = preyData.score;



  // =========================
  // STRUCTURE ENGINE
  // =========================

  const structureData = calculateStructureScore(spot);

  const structureScore = structureData.score;



  // =========================
  // WEIGHTED BLUE MARLIN MODEL
  //
  // Ocean        35%
  // Prey         30%
  // Structure    20%
  // Current      10%
  // Seasonality   5%
  // =========================


  const oceanWeighted = 
    (ocean / 100) * 35;


  const preyWeighted = 
    (preyScore / 100) * 30;


  const structureWeighted = 
    (structureScore / 100) * 20;


  const currentWeighted = 
    (current / 18) * 10;


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


    ocean: Math.round(oceanWeighted),

    prey: Math.round(preyWeighted),

    structure: Math.round(structureWeighted),

    current: Math.round(currentWeighted),

    seasonal: Math.round(seasonalWeighted),


    oceanFactors: oceanData.factors,

    preyFactors: preyData.factors,

    structureFactors: structureData.factors

  };


}