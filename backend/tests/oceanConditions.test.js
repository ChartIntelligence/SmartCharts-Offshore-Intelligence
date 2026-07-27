import assert from "node:assert/strict";

import {
  assessOceanConditions
} from "../server.js";


const createConditionsInput = ({
  wind = {},
  waves = {},
  swell = {},
  dataQuality = {}
} = {}) => ({
  wind: {
    speedKnots: 10,
    gustKnots: 14,
    directionDegrees: 300,
    ...wind
  },

  waves: {
    heightFeet: 2,
    periodSeconds: 10,
    directionDegrees: 300,
    ...waves
  },

  swell: {
    heightFeet: 2,
    periodSeconds: 12,
    directionDegrees: 300,
    ...swell
  },

  dataQuality
});


const assessTestConditions =
  overrides =>
    assessOceanConditions(
      createConditionsInput(
        overrides
      )
    );

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


const windBoundaryCases = [
  {
    name:
      "wind 15.0 knots remains favorable",

    speedKnots: 15,
    gustKnots: 20,

    expected:
      "favorable"
  },

  {
    name:
      "wind above 15 knots uses caution",

    speedKnots: 15.1,
    gustKnots: 20,

    expected:
      "use-caution"
  },

  {
    name:
      "wind 25.0 knots remains use-caution",

    speedKnots: 25,
    gustKnots: 20,

    expected:
      "use-caution"
  },

  {
    name:
      "wind above 25 knots is hazardous",

    speedKnots: 25.1,
    gustKnots: 20,

    expected:
      "hazardous"
  }
];


for (
  const windBoundaryCase
  of windBoundaryCases
) {
  const windBoundaryResult =
    assessTestConditions({
      wind: {
        speedKnots:
          windBoundaryCase
            .speedKnots,

        gustKnots:
          windBoundaryCase
            .gustKnots
      }
    });


  assert.equal(
    windBoundaryResult
      .assessments
      .wind
      .classification,

    windBoundaryCase.expected
  );


  console.log(
    `PASS ${windBoundaryCase.name}`
  );
}


const gustBoundaryCases = [
  {
    name:
      "gust 20.0 knots remains favorable",

    speedKnots: 15,
    gustKnots: 20,

    expected:
      "favorable"
  },

  {
    name:
      "gust above 20 knots uses caution",

    speedKnots: 15,
    gustKnots: 20.1,

    expected:
      "use-caution"
  },

  {
    name:
      "gust 30.0 knots remains use-caution",

    speedKnots: 15,
    gustKnots: 30,

    expected:
      "use-caution"
  },

  {
    name:
      "gust above 30 knots is hazardous",

    speedKnots: 15,
    gustKnots: 30.1,

    expected:
      "hazardous"
  }
];


for (
  const gustBoundaryCase
  of gustBoundaryCases
) {
  const gustBoundaryResult =
    assessOceanConditions({
      wind: {
        speedKnots:
          gustBoundaryCase
            .speedKnots,

        gustKnots:
          gustBoundaryCase
            .gustKnots,

        directionDegrees: 300
      },

      waves: {
        heightFeet: 2,
        periodSeconds: 10,
        directionDegrees: 300
      },

      swell: {
        heightFeet: 2,
        periodSeconds: 12,
        directionDegrees: 300
      },

      dataQuality: {}
    });


  assert.equal(
    gustBoundaryResult
      .assessments
      .wind
      .classification,

    gustBoundaryCase.expected
  );


  console.log(
    `PASS ${gustBoundaryCase.name}`
  );
}


const waveHeightBoundaryCases = [
  {
    name:
      "wave height 3.0 feet remains favorable",

    heightFeet: 3,

    expected:
      "favorable"
  },

  {
    name:
      "wave height above 3 feet uses caution",

    heightFeet: 3.1,

    expected:
      "use-caution"
  },

  {
    name:
      "wave height 6.0 feet remains use-caution",

    heightFeet: 6,

    expected:
      "use-caution"
  },

  {
    name:
      "wave height above 6 feet is hazardous",

    heightFeet: 6.1,

    expected:
      "hazardous"
  }
];


for (
  const waveHeightBoundaryCase
  of waveHeightBoundaryCases
) {
  const waveHeightBoundaryResult =
    assessOceanConditions({
      wind: {
        speedKnots: 10,
        gustKnots: 14,
        directionDegrees: 300
      },

      waves: {
        heightFeet:
          waveHeightBoundaryCase
            .heightFeet,

        periodSeconds: 8,
        directionDegrees: 300
      },

      swell: {
        heightFeet: 2,
        periodSeconds: 12,
        directionDegrees: 300
      },

      dataQuality: {}
    });


  assert.equal(
    waveHeightBoundaryResult
      .assessments
      .waves
      .classification,

    waveHeightBoundaryCase.expected
  );


  console.log(
    `PASS ${waveHeightBoundaryCase.name}`
  );
}


const waveSteepnessBoundaryCases = [
  {
    name:
      "2.5-foot waves at 6 seconds remain favorable",

    heightFeet: 2.5,
    periodSeconds: 6,

    expected:
      "favorable"
  },

  {
    name:
      "2.5-foot waves below 6 seconds use caution",

    heightFeet: 2.5,
    periodSeconds: 5.9,

    expected:
      "use-caution"
  },

  {
    name:
      "5.0-foot waves below 6 seconds remain use-caution",

    heightFeet: 5,
    periodSeconds: 5.9,

    expected:
      "use-caution"
  },

  {
    name:
      "waves above 5 feet below 6 seconds are hazardous",

    heightFeet: 5.1,
    periodSeconds: 5.9,

    expected:
      "hazardous"
  },

  {
    name:
      "waves above 5 feet at 6 seconds remain use-caution",

    heightFeet: 5.1,
    periodSeconds: 6,

    expected:
      "use-caution"
  }
];


for (
  const waveSteepnessBoundaryCase
  of waveSteepnessBoundaryCases
) {
  const waveSteepnessBoundaryResult =
    assessOceanConditions({
      wind: {
        speedKnots: 10,
        gustKnots: 14,
        directionDegrees: 300
      },

      waves: {
        heightFeet:
          waveSteepnessBoundaryCase
            .heightFeet,

        periodSeconds:
          waveSteepnessBoundaryCase
            .periodSeconds,

        directionDegrees: 300
      },

      swell: {
        heightFeet: 2,
        periodSeconds: 12,
        directionDegrees: 300
      },

      dataQuality: {}
    });


  assert.equal(
    waveSteepnessBoundaryResult
      .assessments
      .waves
      .classification,

    waveSteepnessBoundaryCase.expected
  );


  console.log(
    `PASS ${waveSteepnessBoundaryCase.name}`
  );
}


const swellHeightBoundaryCases = [
  {
    name:
      "swell height 4.0 feet remains favorable",

    heightFeet: 4,

    expected:
      "favorable"
  },

  {
    name:
      "swell height above 4 feet uses caution",

    heightFeet: 4.1,

    expected:
      "use-caution"
  },

  {
    name:
      "swell height 7.0 feet remains use-caution",

    heightFeet: 7,

    expected:
      "use-caution"
  },

  {
    name:
      "swell height above 7 feet is hazardous",

    heightFeet: 7.1,

    expected:
      "hazardous"
  }
];


for (
  const swellHeightBoundaryCase
  of swellHeightBoundaryCases
) {
  const swellHeightBoundaryResult =
    assessOceanConditions({
      wind: {
        speedKnots: 10,
        gustKnots: 14,
        directionDegrees: 300
      },

      waves: {
        heightFeet: 2,
        periodSeconds: 10,
        directionDegrees: 300
      },

      swell: {
        heightFeet:
          swellHeightBoundaryCase
            .heightFeet,

        periodSeconds: 10,
        directionDegrees: 300
      },

      dataQuality: {}
    });


  assert.equal(
    swellHeightBoundaryResult
      .assessments
      .swell
      .classification,

    swellHeightBoundaryCase.expected
  );


  console.log(
    `PASS ${swellHeightBoundaryCase.name}`
  );
}


const swellSteepnessBoundaryCases = [
  {
    name:
      "3.5-foot swell at 7 seconds remains favorable",

    heightFeet: 3.5,
    periodSeconds: 7,

    expected:
      "favorable"
  },

  {
    name:
      "3.5-foot swell below 7 seconds uses caution",

    heightFeet: 3.5,
    periodSeconds: 6.9,

    expected:
      "use-caution"
  },

  {
    name:
      "6.0-foot swell below 8 seconds remains use-caution",

    heightFeet: 6,
    periodSeconds: 7.9,

    expected:
      "use-caution"
  },

  {
    name:
      "swell above 6 feet below 8 seconds is hazardous",

    heightFeet: 6.1,
    periodSeconds: 7.9,

    expected:
      "hazardous"
  },

  {
    name:
      "swell above 6 feet at 8 seconds remains use-caution",

    heightFeet: 6.1,
    periodSeconds: 8,

    expected:
      "use-caution"
  }
];


for (
  const swellSteepnessBoundaryCase
  of swellSteepnessBoundaryCases
) {
  const swellSteepnessBoundaryResult =
    assessOceanConditions({
      wind: {
        speedKnots: 10,
        gustKnots: 14,
        directionDegrees: 300
      },

      waves: {
        heightFeet: 2,
        periodSeconds: 10,
        directionDegrees: 300
      },

      swell: {
        heightFeet:
          swellSteepnessBoundaryCase
            .heightFeet,

        periodSeconds:
          swellSteepnessBoundaryCase
            .periodSeconds,

        directionDegrees: 300
      },

      dataQuality: {}
    });


  assert.equal(
    swellSteepnessBoundaryResult
      .assessments
      .swell
      .classification,

    swellSteepnessBoundaryCase.expected
  );


  console.log(
    `PASS ${swellSteepnessBoundaryCase.name}`
  );
}


const directionalBoundaryCases = [
  {
    name:
      "30-degree difference remains aligned",

    waveDirectionDegrees: 30,

    expected:
      "aligned"
  },

  {
    name:
      "difference above 30 degrees becomes angled",

    waveDirectionDegrees: 30.1,

    expected:
      "angled"
  },

  {
    name:
      "60-degree difference becomes crossing",

    waveDirectionDegrees: 60,

    expected:
      "crossing"
  },

  {
    name:
      "120-degree difference remains crossing",

    waveDirectionDegrees: 120,

    expected:
      "crossing"
  },

  {
    name:
      "difference above 120 degrees becomes angled",

    waveDirectionDegrees: 120.1,

    expected:
      "angled"
  },

  {
    name:
      "difference below 150 degrees remains angled",

    waveDirectionDegrees: 149.9,

    expected:
      "angled"
  },

  {
    name:
      "150-degree difference becomes opposing",

    waveDirectionDegrees: 150,

    expected:
      "opposing"
  }
];


for (
  const directionalBoundaryCase
  of directionalBoundaryCases
) {
  const directionalBoundaryResult =
    assessOceanConditions({
      wind: {
        speedKnots: 10,
        gustKnots: 14,
        directionDegrees: 0
      },

      waves: {
        heightFeet: 2,
        periodSeconds: 10,
        directionDegrees:
          directionalBoundaryCase
            .waveDirectionDegrees
      },

      swell: {
        heightFeet: 2,
        periodSeconds: 12,
        directionDegrees:
          directionalBoundaryCase
            .waveDirectionDegrees
      },

      dataQuality: {}
    });


  assert.equal(
    directionalBoundaryResult
      .directionalInteraction
      .comparisons
      .windVsWaves
      .relationship,

    directionalBoundaryCase.expected
  );


  assert.equal(
    directionalBoundaryResult
      .directionalInteraction
      .comparisons
      .windVsSwell
      .relationship,

    directionalBoundaryCase.expected
  );


  console.log(
    `PASS ${directionalBoundaryCase.name}`
  );
}
