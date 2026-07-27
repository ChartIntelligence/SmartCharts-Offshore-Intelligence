import assert from "node:assert/strict";

import {
  assessOceanConditions,
  assessOceanOpportunity,
  assessBlueMarlinHabitat
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


/*
 * ------------------------------------------------------------
 * Ocean Opportunity Engine regression tests
 * ------------------------------------------------------------
 */

const createOceanEvidenceInput = ({
  temperature = {},
  current = {},
  productivity = {},
  clarity = {},
  structure = {},
  confidence = {},
  summary = {},
  limitations = []
} = {}) => ({
  groups: {
    temperature: {
      available: false,
      classification:
        "unavailable",
      ...temperature
    },

    current: {
      available: false,
      classification:
        "unavailable",
      ...current
    },

    productivity: {
      available: false,
      classification:
        "unavailable",
      ...productivity
    },

    clarity: {
      available: false,
      classification:
        "unavailable",
      ...clarity
    },

    structure: {
      available: false,
      classification:
        "unavailable",
      ...structure
    }
  },

  confidence: {
    score: 80,
    level: "High",
    limitations: [],
    ...confidence
  },

  summary: {
    availableGroupCount: 0,
    ...summary
  },

  limitations
});


const noOpportunityResult =
  assessOceanOpportunity({
    oceanEvidence:
      createOceanEvidenceInput({
        confidence: {
          score: 20,
          level: "Very Low"
        }
      })
  });

assert.equal(
  noOpportunityResult
    .summary
    .opportunityCount,
  0
);

assert.equal(
  noOpportunityResult
    .summary
    .classification,
  "no-supported-feature-candidate"
);

console.log(
  "PASS no evidence produces no opportunity candidate"
);


const moderateTemperatureOpportunity =
  assessOceanOpportunity({
    oceanEvidence:
      createOceanEvidenceInput({
        temperature: {
          available: true,

          classification:
            "moderate-temperature-structure",

          orientation: {
            classification:
              "directional-temperature-transition"
          }
        },

        confidence: {
          score: 72,
          level: "Moderate"
        },

        summary: {
          availableGroupCount: 1
        }
      })
  });

assert.equal(
  moderateTemperatureOpportunity
    .summary
    .opportunityCount,
  1
);

assert.equal(
  moderateTemperatureOpportunity
    .opportunities[0]
    .type,
  "environmental-transition-zone"
);

console.log(
  "PASS moderate temperature transition produces feature candidate"
);


const temperatureCurrentOpportunity =
  assessOceanOpportunity({
    oceanEvidence:
      createOceanEvidenceInput({
        temperature: {
          available: true,

          classification:
            "moderate-temperature-structure",

          orientation: {
            classification:
              "directional-temperature-transition"
          }
        },

        current: {
          available: true,

          classification:
            "weak",

          values: {
            strengthClassification:
              "weak"
          }
        },

        confidence: {
          score: 70,
          level: "Moderate"
        },

        summary: {
          availableGroupCount: 2
        }
      })
  });

assert.equal(
  temperatureCurrentOpportunity
    .summary
    .opportunityCount,
  2
);

assert.ok(
  temperatureCurrentOpportunity
    .opportunities
    .some(
      opportunity =>
        opportunity.type ===
        "current-supported-transition-candidate"
    )
);

console.log(
  "PASS temperature and current produce current-supported candidate"
);


const surfaceWaterOpportunity =
  assessOceanOpportunity({
    oceanEvidence:
      createOceanEvidenceInput({
        productivity: {
          available: true,

          classification:
            "productive-blue-green-transition"
        },

        clarity: {
          available: true,

          classification:
            "transitional-surface-water"
        },

        confidence: {
          score: 66,
          level: "Moderate"
        },

        summary: {
          availableGroupCount: 2
        }
      })
  });

assert.equal(
  surfaceWaterOpportunity
    .summary
    .opportunityCount,
  1
);

assert.equal(
  surfaceWaterOpportunity
    .opportunities[0]
    .type,
  "surface-water-boundary-candidate"
);

assert.deepEqual(
  surfaceWaterOpportunity
    .opportunities[0]
    .sourceFamilies,
  [
    "surface-chlorophyll"
  ]
);

console.log(
  "PASS chlorophyll transition produces surface-water candidate"
);


const multiSignalOpportunity =
  assessOceanOpportunity({
    oceanEvidence:
      createOceanEvidenceInput({
        temperature: {
          available: true,

          classification:
            "strong-temperature-break-candidate",

          orientation: {
            classification:
              "directional-temperature-transition"
          }
        },

        current: {
          available: true,

          classification:
            "moderate",

          values: {
            strengthClassification:
              "moderate"
          }
        },

        productivity: {
          available: true,

          classification:
            "productive-blue-green-transition"
        },

        clarity: {
          available: true,

          classification:
            "transitional-surface-water"
        },

        confidence: {
          score: 88,
          level: "High"
        },

        summary: {
          availableGroupCount: 4
        }
      })
  });

assert.ok(
  multiSignalOpportunity
    .opportunities
    .some(
      opportunity =>
        opportunity.type ===
        "multi-signal-feature-candidate"
    )
);

const multiSignalCandidate =
  multiSignalOpportunity
    .opportunities
    .find(
      opportunity =>
        opportunity.type ===
        "multi-signal-feature-candidate"
    );

assert.deepEqual(
  multiSignalCandidate
    .sourceFamilies,
  [
    "spatial-temperature",
    "single-point-current",
    "surface-chlorophyll"
  ]
);

console.log(
  "PASS three source families produce multi-signal candidate"
);


const lowConfidenceOpportunity =
  assessOceanOpportunity({
    oceanEvidence:
      createOceanEvidenceInput({
        temperature: {
          available: true,

          classification:
            "strong-temperature-break-candidate",

          orientation: {
            classification:
              "directional-temperature-transition"
          }
        },

        current: {
          available: true,

          classification:
            "strong",

          values: {
            strengthClassification:
              "strong"
          }
        },

        confidence: {
          score: 32,
          level: "Very Low"
        },

        summary: {
          availableGroupCount: 2
        }
      })
  });

assert.equal(
  lowConfidenceOpportunity
    .summary
    .confidenceScore,
  32
);

assert.equal(
  lowConfidenceOpportunity
    .confidence
    .score,
  32
);

console.log(
  "PASS opportunity confidence remains capped by upstream evidence"
);


const uniformTemperatureOpportunity =
  assessOceanOpportunity({
    oceanEvidence:
      createOceanEvidenceInput({
        temperature: {
          available: true,

          classification:
            "uniform-water"
        },

        confidence: {
          score: 84,
          level: "High"
        },

        summary: {
          availableGroupCount: 1
        }
      })
  });

assert.equal(
  uniformTemperatureOpportunity
    .summary
    .opportunityCount,
  0
);

assert.equal(
  uniformTemperatureOpportunity
    .opportunities
    .some(
      opportunity =>
        opportunity.type ===
        "environmental-transition-zone"
    ),
  false
);

console.log(
  "PASS uniform temperature produces no transition candidate"
);


/*
 * ------------------------------------------------------------
 * Blue Marlin Habitat Suitability Model regression tests
 * ------------------------------------------------------------
 */

const createBlueMarlinHabitatInput = ({
  opportunityTypes = [],
  opportunityConfidenceScore = 80,
  opportunityConfidenceLevel = "High",
  temperature = {},
  current = {},
  productivity = {},
  clarity = {},
  structure = {},
  dataQuality = {}
} = {}) => ({
  oceanOpportunity: {
    opportunities:
      opportunityTypes.map(
        type => ({
          type
        })
      ),

    confidence: {
      score:
        opportunityConfidenceScore,

      level:
        opportunityConfidenceLevel
    },

    limitations: []
  },

  oceanEvidence: {
    groups: {
      temperature: {
        available: false,
        classification:
          "unavailable",
        ...temperature
      },

      current: {
        available: false,
        classification:
          "unavailable",
        ...current
      },

      productivity: {
        available: false,
        classification:
          "unavailable",
        ...productivity
      },

      clarity: {
        available: false,
        classification:
          "unavailable",
        ...clarity
      },

      structure: {
        available: false,
        classification:
          "unavailable",
        ...structure
      }
    }
  },

  dataQuality
});


const noBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityConfidenceScore: 20,
      opportunityConfidenceLevel:
        "Very Low"
    })
  );

assert.equal(
  noBlueMarlinHabitat
    .summary
    .classification,
  "insufficient-habitat-evidence"
);

assert.equal(
  noBlueMarlinHabitat
    .summary
    .suitabilityScore,
  0
);

assert.equal(
  noBlueMarlinHabitat
    .opportunityTypes
    .length,
  0
);

console.log(
  "PASS no ocean opportunity produces insufficient blue marlin habitat evidence"
);


const temperatureOnlyBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone"
      ],

      temperature: {
        available: true,

        classification:
          "moderate-temperature-structure",

        values: {
          spatialClassification:
            "moderate-temperature-transition",

          spatialRangeFahrenheit:
            1.8,

          coverage:
            "sufficient"
        },

        confidence: {
          score: 86,
          level: "high"
        }
      }
    })
  );

assert.equal(
  temperatureOnlyBlueMarlinHabitat
    .relationshipGroups
    .thermalStructure
    .classification,
  "moderate-temperature-transition-supported"
);

assert.equal(
  temperatureOnlyBlueMarlinHabitat
    .relationshipGroups
    .thermalStructure
    .score,
  22
);

assert.ok(
  temperatureOnlyBlueMarlinHabitat
    .positiveDrivers
    .includes(
      "moderate-spatial-temperature-transition"
    )
);

console.log(
  "PASS temperature transition supports blue marlin thermal structure"
);


const movementAndThermalBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone",
        "current-supported-transition-candidate"
      ],

      opportunityConfidenceScore: 43,
      opportunityConfidenceLevel:
        "Low",

      temperature: {
        available: true,

        classification:
          "moderate-temperature-structure",

        values: {
          spatialClassification:
            "moderate-temperature-transition",

          spatialRangeFahrenheit:
            1.8,

          coverage:
            "sufficient"
        },

        confidence: {
          score: 86,
          level: "high"
        }
      },

      current: {
        available: true,

        classification:
          "weak"
      }
    })
  );

assert.equal(
  movementAndThermalBlueMarlinHabitat
    .summary
    .rawSuitabilityScore,
  34
);

assert.equal(
  movementAndThermalBlueMarlinHabitat
    .summary
    .suitabilityScore,
  34
);

assert.equal(
  movementAndThermalBlueMarlinHabitat
    .summary
    .classification,
  "limited-preliminary-habitat-support"
);

assert.equal(
  movementAndThermalBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  12
);

console.log(
  "PASS current-supported temperature transition produces limited blue marlin habitat support"
);


const confidenceCappedBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone",
        "current-supported-transition-candidate",
        "surface-water-boundary-candidate",
        "multi-signal-feature-candidate"
      ],

      opportunityConfidenceScore: 35,
      opportunityConfidenceLevel:
        "Low",

      temperature: {
        available: true
      },

      current: {
        available: true
      },

      productivity: {
        available: true
      },

      clarity: {
        available: true
      },

      structure: {
        available: true
      }
    })
  );

assert.ok(
  confidenceCappedBlueMarlinHabitat
    .summary
    .rawSuitabilityScore >
  confidenceCappedBlueMarlinHabitat
    .summary
    .suitabilityScore
);

assert.equal(
  confidenceCappedBlueMarlinHabitat
    .summary
    .suitabilityScore,
  35
);

assert.equal(
  confidenceCappedBlueMarlinHabitat
    .confidence
    .score,
  35
);

console.log(
  "PASS blue marlin suitability remains capped by upstream confidence"
);


const missingEvidenceBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone",
        "current-supported-transition-candidate"
      ],

      temperature: {
        available: true
      },

      current: {
        available: true
      }
    })
  );

assert.ok(
  missingEvidenceBlueMarlinHabitat
    .negativeDrivers
    .includes(
      "productivity-evidence-unavailable"
    )
);

assert.ok(
  missingEvidenceBlueMarlinHabitat
    .negativeDrivers
    .includes(
      "structure-interaction-unavailable"
    )
);

assert.ok(
  missingEvidenceBlueMarlinHabitat
    .negativeDrivers
    .includes(
      "feature-persistence-not-established"
    )
);

console.log(
  "PASS missing blue marlin evidence is disclosed through negative drivers"
);


const conservativeBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone",
        "current-supported-transition-candidate"
      ]
    })
  );

assert.ok(
  conservativeBlueMarlinHabitat
    .limitations
    .includes(
      "does-not-confirm-blue-marlin-presence"
    )
);

assert.ok(
  conservativeBlueMarlinHabitat
    .limitations
    .includes(
      "does-not-confirm-feeding"
    )
);

assert.ok(
  conservativeBlueMarlinHabitat
    .limitations
    .includes(
      "does-not-estimate-catch-probability"
    )
);

assert.ok(
  conservativeBlueMarlinHabitat
    .limitations
    .includes(
      "does-not-indicate-fishing-success"
    )
);

console.log(
  "PASS blue marlin model preserves conservative biological limitations"
);


/*
 * ------------------------------------------------------------
 * Blue Marlin Thermal Structure v1.1 regression tests
 * ------------------------------------------------------------
 */

const uniformThermalHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [],

      temperature: {
        available: true,

        classification:
          "uniform-water",

        values: {
          spatialClassification:
            "uniform-water",

          spatialRangeFahrenheit:
            0.2,

          coverage:
            "sufficient"
        },

        confidence: {
          score: 90,
          level: "high"
        }
      }
    })
  );

assert.equal(
  uniformThermalHabitat
    .relationshipGroups
    .thermalStructure
    .classification,
  "uniform-local-temperature-field"
);

assert.equal(
  uniformThermalHabitat
    .relationshipGroups
    .thermalStructure
    .score,
  3
);

console.log(
  "PASS uniform thermal field receives minimal blue marlin thermal support"
);


const weakThermalHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone"
      ],

      temperature: {
        available: true,

        classification:
          "weak-temperature-structure",

        values: {
          spatialClassification:
            "weak-temperature-transition",

          spatialRangeFahrenheit:
            0.8,

          coverage:
            "sufficient"
        },

        confidence: {
          score: 82,
          level: "high"
        }
      }
    })
  );

assert.equal(
  weakThermalHabitat
    .relationshipGroups
    .thermalStructure
    .classification,
  "weak-temperature-transition-supported"
);

assert.equal(
  weakThermalHabitat
    .relationshipGroups
    .thermalStructure
    .score,
  12
);

console.log(
  "PASS weak thermal transition receives limited blue marlin thermal support"
);


const directionalModerateThermalHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone"
      ],

      temperature: {
        available: true,

        classification:
          "moderate-temperature-structure",

        values: {
          spatialClassification:
            "moderate-temperature-transition",

          spatialRangeFahrenheit:
            1.8,

          coverage:
            "sufficient"
        },

        orientation: {
          classification:
            "directional-temperature-transition"
        },

        confidence: {
          score: 86,
          level: "high"
        }
      }
    })
  );

assert.equal(
  directionalModerateThermalHabitat
    .relationshipGroups
    .thermalStructure
    .score,
  24
);

assert.ok(
  directionalModerateThermalHabitat
    .positiveDrivers
    .includes(
      "directional-temperature-transition"
    )
);

console.log(
  "PASS directional moderate transition earns additional thermal support"
);


const strongDirectionalThermalHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone"
      ],

      temperature: {
        available: true,

        classification:
          "strong-temperature-break-candidate",

        values: {
          spatialClassification:
            "strong-temperature-break-candidate",

          spatialRangeFahrenheit:
            3.1,

          coverage:
            "sufficient"
        },

        orientation: {
          classification:
            "directional-temperature-transition"
        },

        confidence: {
          score: 91,
          level: "high"
        }
      }
    })
  );

assert.equal(
  strongDirectionalThermalHabitat
    .relationshipGroups
    .thermalStructure
    .score,
  25
);

console.log(
  "PASS strong directional thermal break candidate reaches thermal maximum"
);


const confidenceLimitedThermalHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone"
      ],

      temperature: {
        available: true,

        classification:
          "strong-temperature-break-candidate",

        values: {
          spatialClassification:
            "strong-temperature-break-candidate",

          spatialRangeFahrenheit:
            3.2,

          coverage:
            "sufficient"
        },

        orientation: {
          classification:
            "directional-temperature-transition"
        },

        confidence: {
          score: 35,
          level: "low"
        }
      }
    })
  );

assert.equal(
  confidenceLimitedThermalHabitat
    .relationshipGroups
    .thermalStructure
    .score,
  14
);

assert.ok(
  confidenceLimitedThermalHabitat
    .limitations
    .includes(
      "thermal-score-capped-by-pattern-confidence"
    )
);

console.log(
  "PASS low pattern confidence caps blue marlin thermal support"
);


const incompleteCoverageThermalHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone"
      ],

      temperature: {
        available: true,

        classification:
          "strong-temperature-break-candidate",

        values: {
          spatialClassification:
            "strong-temperature-break-candidate",

          spatialRangeFahrenheit:
            3,

          coverage:
            "limited"
        },

        confidence: {
          score: 88,
          level: "high"
        }
      }
    })
  );

assert.equal(
  incompleteCoverageThermalHabitat
    .relationshipGroups
    .thermalStructure
    .score,
  10
);

assert.ok(
  incompleteCoverageThermalHabitat
    .limitations
    .includes(
      "thermal-score-limited-by-incomplete-spatial-coverage"
    )
);

console.log(
  "PASS incomplete spatial coverage limits blue marlin thermal support"
);


/**
 * ------------------------------------------------------------
 * Blue Marlin Ocean Movement v1.1 regression tests
 * ------------------------------------------------------------
 */


const weakCurrentOnlyBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      current: {
        available: true,

        classification:
          "weak",

        values: {
          speedKnots: 0.2,

          strengthClassification:
            "weak",

          directionDegrees: 90,

          compassDirection:
            "E",

          freshness:
            "recent",

          ageHours: 6,

          sourceAvailability:
            "available"
        }
      }
    })
  );

assert.equal(
  weakCurrentOnlyBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  4
);

assert.equal(
  weakCurrentOnlyBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .classification,
  "weak-current-observation"
);

console.log(
  "PASS weak current receives minimal blue marlin ocean-movement support"
);


const moderateCurrentOnlyBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      current: {
        available: true,

        classification:
          "moderate",

        values: {
          speedKnots: 0.5,

          strengthClassification:
            "moderate",

          directionDegrees: 135,

          compassDirection:
            "SE",

          freshness:
            "recent",

          ageHours: 8,

          sourceAvailability:
            "available"
        }
      }
    })
  );

assert.equal(
  moderateCurrentOnlyBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  7
);

assert.equal(
  moderateCurrentOnlyBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .classification,
  "moderate-current-observation"
);

console.log(
  "PASS moderate current receives moderate blue marlin ocean-movement support"
);


const strongCurrentOnlyBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      current: {
        available: true,

        classification:
          "strong",

        values: {
          speedKnots: 1.1,

          strengthClassification:
            "strong",

          directionDegrees: 180,

          compassDirection:
            "S",

          freshness:
            "recent",

          ageHours: 10,

          sourceAvailability:
            "available"
        }
      }
    })
  );

assert.equal(
  strongCurrentOnlyBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  9
);

assert.equal(
  strongCurrentOnlyBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .classification,
  "strong-current-observation"
);

console.log(
  "PASS strong current receives increased blue marlin ocean-movement support"
);


const veryStrongCurrentOnlyBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      current: {
        available: true,

        classification:
          "very-strong",

        values: {
          speedKnots: 1.8,

          strengthClassification:
            "very-strong",

          directionDegrees: 225,

          compassDirection:
            "SW",

          freshness:
            "recent",

          ageHours: 5,

          sourceAvailability:
            "available"
        }
      }
    })
  );

assert.equal(
  veryStrongCurrentOnlyBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  10
);

assert.equal(
  veryStrongCurrentOnlyBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .classification,
  "very-strong-current-observation"
);

console.log(
  "PASS very strong current reaches maximum observation-only movement support"
);


const currentSupportedTransitionBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone",
        "current-supported-transition-candidate"
      ],

      current: {
        available: true,

        classification:
          "strong",

        values: {
          speedKnots: 1.1,

          strengthClassification:
            "strong",

          directionDegrees: 270,

          compassDirection:
            "W",

          freshness:
            "recent",

          ageHours: 4,

          sourceAvailability:
            "available"
        }
      }
    })
  );

assert.equal(
  currentSupportedTransitionBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  17
);

assert.equal(
  currentSupportedTransitionBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .classification,
  "current-associated-with-environmental-transition"
);

assert.ok(
  currentSupportedTransitionBlueMarlinHabitat
    .positiveDrivers
    .includes(
      "water-movement-near-environmental-transition"
    )
);

console.log(
  "PASS current-supported transition increases blue marlin ocean-movement support"
);


const multiSignalCurrentBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "multi-signal-feature-candidate"
      ],

      current: {
        available: true,

        classification:
          "moderate",

        values: {
          speedKnots: 0.5,

          strengthClassification:
            "moderate",

          directionDegrees: 315,

          compassDirection:
            "NW",

          freshness:
            "recent",

          ageHours: 7,

          sourceAvailability:
            "available"
        }
      }
    })
  );

assert.equal(
  multiSignalCurrentBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  9
);

assert.ok(
  multiSignalCurrentBlueMarlinHabitat
    .positiveDrivers
    .includes(
      "current-associated-with-multi-signal-feature"
    )
);

console.log(
  "PASS multi-signal association adds limited blue marlin movement support"
);


const agingCurrentBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone",
        "current-supported-transition-candidate",
        "multi-signal-feature-candidate"
      ],

      current: {
        available: true,

        classification:
          "very-strong",

        values: {
          speedKnots: 1.8,

          strengthClassification:
            "very-strong",

          directionDegrees: 45,

          compassDirection:
            "NE",

          freshness:
            "aging",

          ageHours: 48,

          sourceAvailability:
            "available"
        }
      }
    })
  );

assert.equal(
  agingCurrentBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  14
);

assert.ok(
  agingCurrentBlueMarlinHabitat
    .limitations
    .includes(
      "ocean-movement-score-limited-by-aging-current-observation"
    )
);

console.log(
  "PASS aging current observation caps blue marlin ocean-movement support"
);


const staleCurrentBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone",
        "current-supported-transition-candidate",
        "multi-signal-feature-candidate"
      ],

      current: {
        available: true,

        classification:
          "very-strong",

        values: {
          speedKnots: 1.8,

          strengthClassification:
            "very-strong",

          directionDegrees: 90,

          compassDirection:
            "E",

          freshness:
            "stale",

          ageHours: 96,

          sourceAvailability:
            "available"
        }
      }
    })
  );

assert.equal(
  staleCurrentBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  8
);

assert.ok(
  staleCurrentBlueMarlinHabitat
    .limitations
    .includes(
      "ocean-movement-score-limited-by-stale-current-observation"
    )
);

console.log(
  "PASS stale current observation strongly caps blue marlin ocean-movement support"
);


const unknownAgeCurrentBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone",
        "current-supported-transition-candidate",
        "multi-signal-feature-candidate"
      ],

      current: {
        available: true,

        classification:
          "very-strong",

        values: {
          speedKnots: 1.8,

          strengthClassification:
            "very-strong",

          directionDegrees: 135,

          compassDirection:
            "SE",

          freshness:
            "unknown",

          ageHours: null,

          sourceAvailability:
            "available"
        }
      }
    })
  );

assert.equal(
  unknownAgeCurrentBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  18
);

assert.ok(
  unknownAgeCurrentBlueMarlinHabitat
    .limitations
    .includes(
      "ocean-movement-score-limited-by-unknown-observation-age"
    )
);

console.log(
  "PASS unknown current age conservatively caps blue marlin ocean-movement support"
);


const unavailableCurrentBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      current: {
        available: false,

        classification:
          "unavailable"
      }
    })
  );

assert.equal(
  unavailableCurrentBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  0
);

assert.equal(
  unavailableCurrentBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .classification,
  "unsupported"
);

assert.ok(
  unavailableCurrentBlueMarlinHabitat
    .negativeDrivers
    .includes(
      "ocean-movement-evidence-unavailable"
    )
);

console.log(
  "PASS unavailable current evidence produces no blue marlin ocean-movement support"
);


/**
 * ------------------------------------------------------------
 * Blue Marlin Productivity and Prey Support v1.1
 * regression tests
 * ------------------------------------------------------------
 */


const veryClearProductivityBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      productivity: {
        available: true,

        classification:
          "very-clear-low-productivity",

        values: {
          concentrationMgM3: 0.05,

          productivityClassification:
            "very-clear-low-productivity",

          freshness:
            "recent",

          ageHours: 12
        }
      }
    })
  );

assert.equal(
  veryClearProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  2
);

assert.equal(
  veryClearProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .classification,
  "very-clear-low-surface-productivity"
);

console.log(
  "PASS very clear low-productivity water receives minimal blue marlin productivity support"
);


const clearBlueProductivityBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      productivity: {
        available: true,

        classification:
          "clear-blue-water",

        values: {
          concentrationMgM3: 0.14,

          productivityClassification:
            "clear-blue-water",

          freshness:
            "recent",

          ageHours: 10
        }
      }
    })
  );

assert.equal(
  clearBlueProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  5
);

assert.equal(
  clearBlueProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .classification,
  "clear-blue-water-productivity-context"
);

console.log(
  "PASS clear blue water receives limited blue marlin productivity support"
);


const transitionProductivityBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      productivity: {
        available: true,

        classification:
          "productive-blue-green-transition",

        values: {
          concentrationMgM3: 0.32,

          productivityClassification:
            "productive-blue-green-transition",

          freshness:
            "recent",

          ageHours: 8
        }
      }
    })
  );

assert.equal(
  transitionProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  10
);

assert.equal(
  transitionProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .classification,
  "productive-blue-green-transition-observed"
);

console.log(
  "PASS productive blue-green transition receives strongest observation-only productivity support"
);


const greenWaterProductivityBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      productivity: {
        available: true,

        classification:
          "productive-green-water",

        values: {
          concentrationMgM3: 0.72,

          productivityClassification:
            "productive-green-water",

          freshness:
            "recent",

          ageHours: 7
        }
      }
    })
  );

assert.equal(
  greenWaterProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  8
);

assert.equal(
  greenWaterProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .classification,
  "productive-green-water-observed"
);

console.log(
  "PASS productive green water receives elevated blue marlin productivity support"
);


const highChlorophyllProductivityBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      productivity: {
        available: true,

        classification:
          "high-chlorophyll-coastal-or-bloom-influenced",

        values: {
          concentrationMgM3: 1.4,

          productivityClassification:
            "high-chlorophyll-coastal-or-bloom-influenced",

          freshness:
            "recent",

          ageHours: 6
        }
      }
    })
  );

assert.equal(
  highChlorophyllProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  3
);

assert.equal(
  highChlorophyllProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .classification,
  "high-chlorophyll-water-with-context-uncertainty"
);

assert.ok(
  highChlorophyllProductivityBlueMarlinHabitat
    .limitations
    .includes(
      "high-chlorophyll-does-not-automatically-indicate-blue-marlin-prey-support"
    )
);

console.log(
  "PASS high chlorophyll water remains cautiously interpreted for blue marlin"
);


const boundaryProductivityBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "surface-water-boundary-candidate"
      ],

      productivity: {
        available: true,

        classification:
          "productive-blue-green-transition",

        values: {
          concentrationMgM3: 0.34,

          productivityClassification:
            "productive-blue-green-transition",

          freshness:
            "recent",

          ageHours: 9
        }
      }
    })
  );

assert.equal(
  boundaryProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  16
);

assert.equal(
  boundaryProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .classification,
  "surface-productivity-associated-with-water-boundary"
);

assert.ok(
  boundaryProductivityBlueMarlinHabitat
    .positiveDrivers
    .includes(
      "chlorophyll-derived-surface-water-transition"
    )
);

console.log(
  "PASS surface-water boundary increases blue marlin productivity support"
);


const multiSignalProductivityBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "multi-signal-feature-candidate"
      ],

      productivity: {
        available: true,

        classification:
          "productive-green-water",

        values: {
          concentrationMgM3: 0.7,

          productivityClassification:
            "productive-green-water",

          freshness:
            "recent",

          ageHours: 11
        }
      }
    })
  );

assert.equal(
  multiSignalProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  10
);

assert.ok(
  multiSignalProductivityBlueMarlinHabitat
    .positiveDrivers
    .includes(
      "surface-productivity-associated-with-multi-signal-feature"
    )
);

console.log(
  "PASS multi-signal association adds limited blue marlin productivity support"
);


const agingProductivityBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "surface-water-boundary-candidate",
        "multi-signal-feature-candidate"
      ],

      productivity: {
        available: true,

        classification:
          "productive-blue-green-transition",

        values: {
          concentrationMgM3: 0.38,

          productivityClassification:
            "productive-blue-green-transition",

          freshness:
            "aging",

          ageHours: 60
        }
      }
    })
  );

assert.equal(
  agingProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  14
);

assert.ok(
  agingProductivityBlueMarlinHabitat
    .limitations
    .includes(
      "productivity-score-limited-by-aging-satellite-observation"
    )
);

console.log(
  "PASS aging chlorophyll observation caps blue marlin productivity support"
);


const staleProductivityBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "surface-water-boundary-candidate",
        "multi-signal-feature-candidate"
      ],

      productivity: {
        available: true,

        classification:
          "productive-blue-green-transition",

        values: {
          concentrationMgM3: 0.4,

          productivityClassification:
            "productive-blue-green-transition",

          freshness:
            "stale",

          ageHours: 120
        }
      }
    })
  );

assert.equal(
  staleProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  8
);

assert.ok(
  staleProductivityBlueMarlinHabitat
    .limitations
    .includes(
      "productivity-score-limited-by-stale-satellite-observation"
    )
);

console.log(
  "PASS stale chlorophyll observation strongly caps blue marlin productivity support"
);


const unknownAgeProductivityBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "surface-water-boundary-candidate",
        "multi-signal-feature-candidate"
      ],

      productivity: {
        available: true,

        classification:
          "productive-blue-green-transition",

        values: {
          concentrationMgM3: 0.36,

          productivityClassification:
            "productive-blue-green-transition",

          freshness:
            "unknown",

          ageHours: null
        }
      }
    })
  );

assert.equal(
  unknownAgeProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  16
);

assert.ok(
  unknownAgeProductivityBlueMarlinHabitat
    .limitations
    .includes(
      "productivity-score-limited-by-unknown-observation-age"
    )
);

console.log(
  "PASS unknown chlorophyll age conservatively caps blue marlin productivity support"
);


const unavailableProductivityBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      productivity: {
        available: false,

        classification:
          "unavailable"
      }
    })
  );

assert.equal(
  unavailableProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  0
);

assert.equal(
  unavailableProductivityBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .classification,
  "unsupported"
);

assert.ok(
  unavailableProductivityBlueMarlinHabitat
    .negativeDrivers
    .includes(
      "productivity-evidence-unavailable"
    )
);

console.log(
  "PASS unavailable productivity evidence produces no blue marlin prey-support score"
);


/**
 * ------------------------------------------------------------
 * Blue Marlin Water Character v1.1
 * regression tests
 * ------------------------------------------------------------
 */


const veryClearWaterCharacterBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      clarity: {
        available: true,

        classification:
          "very-clear-surface-water",

        values: {
          concentrationMgM3: 0.05,

          waterClassification:
            "very-clear-low-productivity",

          freshness:
            "recent",

          ageHours: 8
        }
      }
    })
  );

assert.equal(
  veryClearWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  5
);

assert.equal(
  veryClearWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .classification,
  "very-clear-surface-water-observed"
);

assert.ok(
  veryClearWaterCharacterBlueMarlinHabitat
    .positiveDrivers
    .includes(
      "very-clear-surface-water-character"
    )
);

console.log(
  "PASS very clear water receives moderate blue marlin water-character support"
);


const clearBlueWaterCharacterBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      clarity: {
        available: true,

        classification:
          "clear-surface-water",

        values: {
          concentrationMgM3: 0.14,

          waterClassification:
            "clear-blue-water",

          freshness:
            "recent",

          ageHours: 7
        }
      }
    })
  );

assert.equal(
  clearBlueWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  7
);

assert.equal(
  clearBlueWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .classification,
  "clear-blue-surface-water-observed"
);

assert.ok(
  clearBlueWaterCharacterBlueMarlinHabitat
    .positiveDrivers
    .includes(
      "clear-blue-surface-water-character"
    )
);

console.log(
  "PASS clear blue water receives strongest observation-only blue marlin water-character support"
);


const transitionalWaterCharacterBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      clarity: {
        available: true,

        classification:
          "transitional-surface-water",

        values: {
          concentrationMgM3: 0.32,

          waterClassification:
            "productive-blue-green-transition",

          freshness:
            "recent",

          ageHours: 9
        }
      }
    })
  );

assert.equal(
  transitionalWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  6
);

assert.equal(
  transitionalWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .classification,
  "transitional-surface-water-observed"
);

assert.ok(
  transitionalWaterCharacterBlueMarlinHabitat
    .positiveDrivers
    .includes(
      "blue-green-surface-water-character"
    )
);

console.log(
  "PASS transitional water receives elevated blue marlin water-character support"
);


const greenWaterCharacterBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      clarity: {
        available: true,

        classification:
          "chlorophyll-influenced-surface-water",

        values: {
          concentrationMgM3: 0.72,

          waterClassification:
            "productive-green-water",

          freshness:
            "recent",

          ageHours: 6
        }
      }
    })
  );

assert.equal(
  greenWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  3
);

assert.equal(
  greenWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .classification,
  "chlorophyll-influenced-surface-water-observed"
);

assert.ok(
  greenWaterCharacterBlueMarlinHabitat
    .negativeDrivers
    .includes(
      "reduced-surface-water-clarity-inferred"
    )
);

console.log(
  "PASS chlorophyll-influenced green water receives limited blue marlin water-character support"
);


const stronglyInfluencedWaterCharacterBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      clarity: {
        available: true,

        classification:
          "strongly-chlorophyll-influenced-surface-water",

        values: {
          concentrationMgM3: 1.35,

          waterClassification:
            "high-chlorophyll-coastal-or-bloom-influenced",

          freshness:
            "recent",

          ageHours: 5
        }
      }
    })
  );

assert.equal(
  stronglyInfluencedWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  1
);

assert.equal(
  stronglyInfluencedWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .classification,
  "strongly-chlorophyll-influenced-water-with-context-uncertainty"
);

assert.ok(
  stronglyInfluencedWaterCharacterBlueMarlinHabitat
    .limitations
    .includes(
      "high-chlorophyll-water-may-reflect-coastal-bloom-or-sediment-influence"
    )
);

console.log(
  "PASS strongly chlorophyll-influenced water remains cautiously interpreted for blue marlin"
);


const boundaryWaterCharacterBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "surface-water-boundary-candidate"
      ],

      clarity: {
        available: true,

        classification:
          "clear-surface-water",

        values: {
          concentrationMgM3: 0.16,

          waterClassification:
            "clear-blue-water",

          freshness:
            "recent",

          ageHours: 8
        }
      }
    })
  );

assert.equal(
  boundaryWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  10
);

assert.equal(
  boundaryWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .classification,
  "surface-water-character-transition-supported"
);

assert.ok(
  boundaryWaterCharacterBlueMarlinHabitat
    .positiveDrivers
    .includes(
      "surface-water-character-transition"
    )
);

console.log(
  "PASS surface-water boundary raises blue marlin water-character support to maximum"
);


const agingWaterCharacterBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "surface-water-boundary-candidate"
      ],

      clarity: {
        available: true,

        classification:
          "clear-surface-water",

        values: {
          concentrationMgM3: 0.15,

          waterClassification:
            "clear-blue-water",

          freshness:
            "aging",

          ageHours: 60
        }
      }
    })
  );

assert.equal(
  agingWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  7
);

assert.ok(
  agingWaterCharacterBlueMarlinHabitat
    .limitations
    .includes(
      "water-character-score-limited-by-aging-satellite-observation"
    )
);

console.log(
  "PASS aging clarity observation caps blue marlin water-character support"
);


const staleWaterCharacterBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "surface-water-boundary-candidate"
      ],

      clarity: {
        available: true,

        classification:
          "clear-surface-water",

        values: {
          concentrationMgM3: 0.13,

          waterClassification:
            "clear-blue-water",

          freshness:
            "stale",

          ageHours: 120
        }
      }
    })
  );

assert.equal(
  staleWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  4
);

assert.ok(
  staleWaterCharacterBlueMarlinHabitat
    .limitations
    .includes(
      "water-character-score-limited-by-stale-satellite-observation"
    )
);

console.log(
  "PASS stale clarity observation strongly caps blue marlin water-character support"
);


const unknownAgeWaterCharacterBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "surface-water-boundary-candidate"
      ],

      clarity: {
        available: true,

        classification:
          "clear-surface-water",

        values: {
          concentrationMgM3: 0.17,

          waterClassification:
            "clear-blue-water",

          freshness:
            "unknown",

          ageHours: null
        }
      }
    })
  );

assert.equal(
  unknownAgeWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  9
);

assert.ok(
  unknownAgeWaterCharacterBlueMarlinHabitat
    .limitations
    .includes(
      "water-character-score-limited-by-unknown-observation-age"
    )
);

console.log(
  "PASS unknown clarity age conservatively caps blue marlin water-character support"
);


const unavailableWaterCharacterBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      clarity: {
        available: false,

        classification:
          "unavailable"
      }
    })
  );

assert.equal(
  unavailableWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  0
);

assert.equal(
  unavailableWaterCharacterBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .classification,
  "unsupported"
);

assert.ok(
  unavailableWaterCharacterBlueMarlinHabitat
    .negativeDrivers
    .includes(
      "water-character-evidence-unavailable"
    )
);

console.log(
  "PASS unavailable clarity evidence produces no blue marlin water-character support"
);
