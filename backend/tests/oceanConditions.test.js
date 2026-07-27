import assert from "node:assert/strict";

import {
  assessOceanConditions
} from "../server.js";

const result =
  assessOceanConditions({
    wind: {
      speedKnots: 12,
      gustKnots: 16,
      directionDegrees: 300
    },

    waves: {
      heightFeet: 3,
      periodSeconds: 4,
      directionDegrees: 295
    },

    swell: {
      heightFeet: 2,
      periodSeconds: 8,
      directionDegrees: 302
    },

    dataQuality: {}
  });

assert.equal(
  result.overall.classification,
  "use-caution"
);

assert.equal(
  result.directionalInteraction
    .classification,
  "aligned"
);

assert.equal(
  result.seaStateInteraction
    .classification,
  "use-caution"
);

assert.equal(
  result.seaStateInteraction
    .seaStateType,
  "organized-short-period-chop"
);

console.log(
  "PASS aligned short-period chop"
);

const crossingResult =
  assessOceanConditions({
    wind: {
      speedKnots: 12,
      gustKnots: 16,
      directionDegrees: 0
    },

    waves: {
      heightFeet: 2,
      periodSeconds: 9,
      directionDegrees: 90
    },

    swell: {
      heightFeet: 2,
      periodSeconds: 11,
      directionDegrees: 90
    },

    dataQuality: {}
  });

assert.equal(
  crossingResult.overall
    .classification,
  "favorable"
);

assert.equal(
  crossingResult
    .directionalInteraction
    .classification,
  "crossing"
);

assert.equal(
  crossingResult
    .seaStateInteraction
    .classification,
  "use-caution"
);

assert.equal(
  crossingResult
    .seaStateInteraction
    .seaStateType,
  "confused-or-crossing-seas"
);

console.log(
  "PASS crossing seas"
);

const opposingResult =
  assessOceanConditions({
    wind: {
      speedKnots: 14,
      gustKnots: 18,
      directionDegrees: 0
    },

    waves: {
      heightFeet: 3,
      periodSeconds: 4,
      directionDegrees: 180
    },

    swell: {
      heightFeet: 2,
      periodSeconds: 10,
      directionDegrees: 180
    },

    dataQuality: {}
  });

assert.equal(
  opposingResult.overall
    .classification,
  "use-caution"
);

assert.equal(
  opposingResult
    .directionalInteraction
    .classification,
  "opposing"
);

assert.equal(
  opposingResult
    .seaStateInteraction
    .classification,
  "use-caution"
);

assert.equal(
  opposingResult
    .seaStateInteraction
    .seaStateType,
  "steep-opposing-seas"
);

console.log(
  "PASS opposing short-period seas"
);

const hazardousWindResult =
  assessOceanConditions({
    wind: {
      speedKnots: 30,
      gustKnots: 36,
      directionDegrees: 270
    },

    waves: {
      heightFeet: 3,
      periodSeconds: 8,
      directionDegrees: 275
    },

    swell: {
      heightFeet: 2,
      periodSeconds: 10,
      directionDegrees: 278
    },

    dataQuality: {}
  });

assert.equal(
  hazardousWindResult.overall
    .classification,
  "hazardous"
);

assert.equal(
  hazardousWindResult
    .directionalInteraction
    .classification,
  "aligned"
);

assert.equal(
  hazardousWindResult
    .seaStateInteraction
    .classification,
  "hazardous"
);

console.log(
  "PASS hazardous wind"
);

const missingWindResult =
  assessOceanConditions({
    wind: {
      speedKnots: null,
      gustKnots: null,
      directionDegrees: null
    },

    waves: {
      heightFeet: 2,
      periodSeconds: 9,
      directionDegrees: 220
    },

    swell: {
      heightFeet: 2,
      periodSeconds: 11,
      directionDegrees: 225
    },

    dataQuality: {}
  });

assert.equal(
  missingWindResult.assessments
    .wind.classification,
  "unavailable"
);

assert.equal(
  missingWindResult
    .directionalInteraction
    .classification,
  "aligned"
);

assert.equal(
  missingWindResult
    .seaStateInteraction
    .classification,
  "favorable"
);

console.log(
  "PASS missing wind data"
);

assert.equal(
  result.confidence.score,
  1
);

assert.equal(
  result.confidence.level,
  "very-high"
);

assert.equal(
  result.confidence.label,
  "Very High"
);

assert.equal(
  result.confidence
    .components
    .wind
    .available,
  true
);

assert.equal(
  result.confidence.limitations.length,
  0
);

console.log(
  "PASS complete-data confidence"
);


assert.equal(
  missingWindResult.confidence.score,
  0.8
);

assert.equal(
  missingWindResult.confidence.level,
  "high"
);

assert.equal(
  missingWindResult.confidence.label,
  "High"
);

assert.equal(
  missingWindResult.confidence
    .components
    .wind
    .available,
  false
);

assert.deepEqual(
  missingWindResult.confidence
    .limitations,
  [
    "Wind data is unavailable."
  ]
);

assert.equal(
  missingWindResult.confidence
    .methodVersion,
  "pelora-assessment-confidence-v1.0"
);

console.log(
  "PASS missing-wind confidence"
);

const missingGustsResult =
  assessOceanConditions({
    wind: {
      speedKnots: 12,
      gustKnots: null,
      directionDegrees: 300
    },

    waves: {
      heightFeet: 3,
      periodSeconds: 8,
      directionDegrees: 295
    },

    swell: {
      heightFeet: 2,
      periodSeconds: 11,
      directionDegrees: 302
    },

    dataQuality: {}
  });

assert.equal(
  missingGustsResult.confidence.score,
  0.95
);

assert.equal(
  missingGustsResult.confidence.level,
  "very-high"
);

assert.equal(
  missingGustsResult.confidence
    .components
    .wind
    .available,
  true
);

assert.equal(
  missingGustsResult.confidence
    .components
    .wind
    .gustsAvailable,
  false
);

assert.deepEqual(
  missingGustsResult.confidence
    .limitations,
  [
    "Wind-gust data is unavailable."
  ]
);

console.log(
  "PASS missing-gust confidence"
);

const missingWavesResult =
  assessOceanConditions({
    wind: {
      speedKnots: 12,
      gustKnots: 16,
      directionDegrees: 300
    },

    waves: {
      heightFeet: null,
      periodSeconds: null,
      directionDegrees: null
    },

    swell: {
      heightFeet: 2,
      periodSeconds: 11,
      directionDegrees: 302
    },

    dataQuality: {}
  });

assert.equal(
  missingWavesResult.confidence.score,
  0.8
);

assert.equal(
  missingWavesResult.confidence.level,
  "high"
);

assert.equal(
  missingWavesResult.confidence
    .components
    .waves
    .available,
  false
);

assert.equal(
  missingWavesResult.confidence
    .components
    .wind
    .available,
  true
);

assert.equal(
  missingWavesResult.confidence
    .components
    .swell
    .available,
  true
);

assert.deepEqual(
  missingWavesResult.confidence
    .limitations,
  [
    "Combined-wave data is unavailable."
  ]
);

console.log(
  "PASS missing-wave confidence"
);


const missingSwellResult =
  assessOceanConditions({
    wind: {
      speedKnots: 12,
      gustKnots: 16,
      directionDegrees: 300
    },

    waves: {
      heightFeet: 3,
      periodSeconds: 8,
      directionDegrees: 295
    },

    swell: {
      heightFeet: null,
      periodSeconds: null,
      directionDegrees: null
    },

    dataQuality: {}
  });

assert.equal(
  missingSwellResult.confidence.score,
  0.8
);

assert.equal(
  missingSwellResult.confidence.level,
  "high"
);

assert.equal(
  missingSwellResult.confidence
    .components
    .swell
    .available,
  false
);

assert.equal(
  missingSwellResult.confidence
    .components
    .wind
    .available,
  true
);

assert.equal(
  missingSwellResult.confidence
    .components
    .waves
    .available,
  true
);

assert.deepEqual(
  missingSwellResult.confidence
    .limitations,
  [
    "Swell data is unavailable."
  ]
);

console.log(
  "PASS missing-swell confidence"
);

const limitedEvidenceResult =
  assessOceanConditions({
    wind: {
      speedKnots: 12,
      gustKnots: null,
      directionDegrees: 300
    },

    waves: {
      heightFeet: null,
      periodSeconds: null,
      directionDegrees: null
    },

    swell: {
      heightFeet: null,
      periodSeconds: null,
      directionDegrees: null
    },

    dataQuality: {}
  });

assert.equal(
  limitedEvidenceResult.confidence.score,
  0.45
);

assert.equal(
  limitedEvidenceResult.confidence.level,
  "low"
);

assert.deepEqual(
  limitedEvidenceResult.confidence
    .limitations,
  [
    "Combined-wave data is unavailable.",
    "Swell data is unavailable.",
    "Wind-gust data is unavailable.",
    "Directional interaction is incomplete because fewer than two directions are available."
  ]
);

console.log(
  "PASS limited-evidence confidence"
);


assert.equal(
  hazardousWindResult.overall
    .classification,
  "hazardous"
);

assert.equal(
  hazardousWindResult.confidence.score,
  1
);

assert.equal(
  hazardousWindResult.confidence.level,
  "very-high"
);

console.log(
  "PASS hazardous high-confidence distinction"
);

const degradedDataQualityResult =
  assessOceanConditions({
    wind: {
      speedKnots: 12,
      gustKnots: 16,
      directionDegrees: 300
    },

    waves: {
      heightFeet: 3,
      periodSeconds: 8,
      directionDegrees: 295
    },

    swell: {
      heightFeet: 2,
      periodSeconds: 11,
      directionDegrees: 302
    },

    dataQuality: {
      overall: {
        classification: "degraded"
      }
    }
  });

assert.equal(
  degradedDataQualityResult
    .confidence
    .score,
  0.95
);

assert.equal(
  degradedDataQualityResult
    .confidence
    .level,
  "very-high"
);

assert.deepEqual(
  degradedDataQualityResult
    .confidence
    .limitations,
  [
    "The supporting data-quality assessment indicates degraded evidence."
  ]
);

console.log(
  "PASS degraded-data-quality confidence"
);
