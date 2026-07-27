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
