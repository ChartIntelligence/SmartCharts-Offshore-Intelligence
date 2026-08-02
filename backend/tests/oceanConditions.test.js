import assert from "node:assert/strict";

import {
  buildCurrentGradientAnalysis,
  buildCurrentShearAnalysis,
  assessOceanConditions,
  assessOceanEvidence,
  assessOceanOpportunity,
  assessBlueMarlinHabitat,
  buildBlueMarlinHabitatLineage,
  buildOpenWaterEvidence,
  buildEnvironmentalOpportunityEvidence,
  classifyOceanOpportunity,
  buildRelationshipContext,
  buildRelationshipContextLineage,
  assessRelationships,
  buildRelationshipAssessmentLineage,
  interpretBlueMarlinPathway,
  buildBlueMarlinPathwayLineage,
  resolveBlueMarlinOpportunityType,
  resolveSpeciesOpportunityType,
  buildOpportunityTypeResolutionLineage,
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE,
  SPECIES_RELATIONSHIP_IMPORTANCE,
  SPECIES_KNOWLEDGE_FRAMEWORK,
  resolveRelationshipImportance,
  validateSpeciesKnowledgeProfile,
  SPECIES_KNOWLEDGE_PROVENANCE,
  validateKnowledgeProvenance,
  CONFIDENCE_DOMAINS,
  CONFIDENCE_LEVELS,
  CONFIDENCE_SCALES,
  CONFIDENCE_GOVERNANCE_RULES,
  CONFIDENCE_GOVERNANCE_FRAMEWORK,
  normalizeConfidenceScore,
  confidenceLevelForScore,
  validateConfidenceContract,
  LINEAGE_ENGINE_TYPES,
  LINEAGE_GOVERNANCE_RULES,
  EVIDENCE_LINEAGE_FRAMEWORK,
  validateLineageUpstreamReference,
  validateEvidenceLineage,
  buildOceanEvidenceLineage,
  LINEAGE_PROPAGATION_FRAMEWORK,
  buildLineageUpstreamReference,
  propagateEvidenceLineage,
  buildOceanOpportunityLineage
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


/**
 * ------------------------------------------------------------
 * Blue Marlin Habitat Validation Suite
 * Integrated scenario tests — Phase 1
 * ------------------------------------------------------------
 */


/*
 * Scenario 1:
 * Organized offshore environmental feature
 *
 * Strong directional thermal break
 * Strong current associated with the feature
 * Productive blue-green boundary
 * Transitional water character
 *
 * Expected:
 * Multiple relationship groups should combine into
 * moderate preliminary habitat support.
 */
const organizedOffshoreFeatureBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone",
        "current-supported-transition-candidate",
        "surface-water-boundary-candidate",
        "multi-signal-feature-candidate"
      ],

      opportunityConfidenceScore: 80,
      opportunityConfidenceLevel:
        "High",

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
          score: 92,
          level: "high"
        }
      },

      current: {
        available: true,

        classification:
          "strong",

        values: {
          speedKnots: 1.2,

          strengthClassification:
            "strong",

          directionDegrees: 225,

          compassDirection:
            "SW",

          freshness:
            "recent",

          ageHours: 5,

          sourceAvailability:
            "available"
        }
      },

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

          ageHours: 7
        }
      },

      clarity: {
        available: true,

        classification:
          "transitional-surface-water",

        values: {
          concentrationMgM3: 0.34,

          waterClassification:
            "productive-blue-green-transition",

          freshness:
            "recent",

          ageHours: 7
        }
      }
    })
  );

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .relationshipGroups
    .thermalStructure
    .score,
  25
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  19
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  18
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  9
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .rawSuitabilityScore,
  71
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .suitabilityScore,
  71
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .classification,
  "moderate-preliminary-habitat-support"
);

console.log(
  "PASS organized offshore feature produces moderate preliminary blue marlin habitat support"
);


/*
 * Scenario 2:
 * Blue-water desert
 *
 * Clear blue surface water is present, but no thermal
 * transition, current organization, productivity boundary,
 * structure interaction, or persistence is established.
 *
 * Expected:
 * Clear water alone must remain weak habitat evidence.
 */
const blueWaterDesertBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone"
      ],

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

          ageHours: 6
        }
      }
    })
  );

assert.equal(
  blueWaterDesertBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  7
);

assert.equal(
  blueWaterDesertBlueMarlinHabitat
    .summary
    .rawSuitabilityScore,
  7
);

assert.equal(
  blueWaterDesertBlueMarlinHabitat
    .summary
    .classification,
  "weak-preliminary-habitat-support"
);

assert.ok(
  blueWaterDesertBlueMarlinHabitat
    .summary
    .suitabilityScore <
  30
);

console.log(
  "PASS clear blue water without ocean organization remains weak blue marlin habitat evidence"
);


/*
 * Scenario 3:
 * Chlorophyll-supported boundary without thermal
 * or current organization
 *
 * Expected:
 * Productivity and water-character evidence may identify
 * an interesting water boundary, but chlorophyll-derived
 * evidence alone must remain below limited habitat support.
 */
const chlorophyllOnlyBoundaryBlueMarlinHabitat =
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
          concentrationMgM3: 0.31,

          productivityClassification:
            "productive-blue-green-transition",

          freshness:
            "recent",

          ageHours: 8
        }
      },

      clarity: {
        available: true,

        classification:
          "transitional-surface-water",

        values: {
          concentrationMgM3: 0.31,

          waterClassification:
            "productive-blue-green-transition",

          freshness:
            "recent",

          ageHours: 8
        }
      }
    })
  );

assert.equal(
  chlorophyllOnlyBoundaryBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  16
);

assert.equal(
  chlorophyllOnlyBoundaryBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  9
);

assert.equal(
  chlorophyllOnlyBoundaryBlueMarlinHabitat
    .summary
    .rawSuitabilityScore,
  25
);

assert.equal(
  chlorophyllOnlyBoundaryBlueMarlinHabitat
    .summary
    .classification,
  "weak-preliminary-habitat-support"
);

assert.ok(
  chlorophyllOnlyBoundaryBlueMarlinHabitat
    .summary
    .suitabilityScore <
  30
);

console.log(
  "PASS chlorophyll-derived evidence alone cannot create limited blue marlin habitat support"
);


/*
 * Scenario 4:
 * Strong integrated evidence with low upstream confidence
 *
 * Expected:
 * Raw habitat evidence may be strong, but the species model
 * cannot exceed the confidence of the species-neutral
 * Opportunity assessment.
 */
const lowConfidenceOrganizedFeatureBlueMarlinHabitat =
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
          score: 92,
          level: "high"
        }
      },

      current: {
        available: true,

        classification:
          "strong",

        values: {
          speedKnots: 1.2,

          strengthClassification:
            "strong",

          directionDegrees: 225,

          compassDirection:
            "SW",

          freshness:
            "recent",

          ageHours: 5,

          sourceAvailability:
            "available"
        }
      },

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

          ageHours: 7
        }
      },

      clarity: {
        available: true,

        classification:
          "transitional-surface-water",

        values: {
          concentrationMgM3: 0.34,

          waterClassification:
            "productive-blue-green-transition",

          freshness:
            "recent",

          ageHours: 7
        }
      }
    })
  );

assert.equal(
  lowConfidenceOrganizedFeatureBlueMarlinHabitat
    .summary
    .rawSuitabilityScore,
  71
);

assert.equal(
  lowConfidenceOrganizedFeatureBlueMarlinHabitat
    .summary
    .suitabilityScore,
  35
);

assert.equal(
  lowConfidenceOrganizedFeatureBlueMarlinHabitat
    .summary
    .classification,
  "limited-preliminary-habitat-support"
);

assert.ok(
  lowConfidenceOrganizedFeatureBlueMarlinHabitat
    .summary
    .rawSuitabilityScore >
  lowConfidenceOrganizedFeatureBlueMarlinHabitat
    .summary
    .suitabilityScore
);

console.log(
  "PASS upstream confidence caps an otherwise strong integrated blue marlin habitat scenario"
);


/*
 * Scenario 5:
 * Aging multi-signal offshore feature
 *
 * The organized feature remains meaningful, but aging
 * current and chlorophyll observations reduce confidence
 * in the present condition of the feature.
 *
 * Expected:
 * Score remains moderate but is lower than the equivalent
 * recent-observation scenario.
 */
const agingOrganizedFeatureBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone",
        "current-supported-transition-candidate",
        "surface-water-boundary-candidate",
        "multi-signal-feature-candidate"
      ],

      opportunityConfidenceScore: 80,
      opportunityConfidenceLevel:
        "High",

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
          score: 92,
          level: "high"
        }
      },

      current: {
        available: true,

        classification:
          "strong",

        values: {
          speedKnots: 1.2,

          strengthClassification:
            "strong",

          directionDegrees: 225,

          compassDirection:
            "SW",

          freshness:
            "aging",

          ageHours: 60,

          sourceAvailability:
            "available"
        }
      },

      productivity: {
        available: true,

        classification:
          "productive-blue-green-transition",

        values: {
          concentrationMgM3: 0.34,

          productivityClassification:
            "productive-blue-green-transition",

          freshness:
            "aging",

          ageHours: 60
        }
      },

      clarity: {
        available: true,

        classification:
          "transitional-surface-water",

        values: {
          concentrationMgM3: 0.34,

          waterClassification:
            "productive-blue-green-transition",

          freshness:
            "aging",

          ageHours: 60
        }
      }
    })
  );

assert.equal(
  agingOrganizedFeatureBlueMarlinHabitat
    .relationshipGroups
    .thermalStructure
    .score,
  25
);

assert.equal(
  agingOrganizedFeatureBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  14
);

assert.equal(
  agingOrganizedFeatureBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  14
);

assert.equal(
  agingOrganizedFeatureBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  7
);

assert.equal(
  agingOrganizedFeatureBlueMarlinHabitat
    .summary
    .rawSuitabilityScore,
  60
);

assert.equal(
  agingOrganizedFeatureBlueMarlinHabitat
    .summary
    .classification,
  "moderate-preliminary-habitat-support"
);

assert.ok(
  agingOrganizedFeatureBlueMarlinHabitat
    .summary
    .suitabilityScore <
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .suitabilityScore
);

console.log(
  "PASS aging observations reduce but do not erase an organized offshore habitat signal"
);


/**
 * ------------------------------------------------------------
 * Blue Marlin Habitat Validation Suite
 * Integrated scenario tests — Phase 2
 * ------------------------------------------------------------
 */


/*
 * Scenario 6:
 * Strong thermal break without current support
 *
 * Expected:
 * Thermal organization alone may create limited support,
 * but should not reach moderate support.
 */
const strongThermalWithoutCurrentBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone"
      ],

      opportunityConfidenceScore: 85,
      opportunityConfidenceLevel:
        "High",

      temperature: {
        available: true,

        classification:
          "strong-temperature-break-candidate",

        values: {
          spatialClassification:
            "strong-temperature-break-candidate",

          spatialRangeFahrenheit:
            3.4,

          coverage:
            "sufficient"
        },

        orientation: {
          classification:
            "directional-temperature-transition"
        },

        confidence: {
          score: 93,
          level: "high"
        }
      }
    })
  );

assert.equal(
  strongThermalWithoutCurrentBlueMarlinHabitat
    .relationshipGroups
    .thermalStructure
    .score,
  25
);

assert.equal(
  strongThermalWithoutCurrentBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  0
);

assert.equal(
  strongThermalWithoutCurrentBlueMarlinHabitat
    .summary
    .rawSuitabilityScore,
  25
);

assert.equal(
  strongThermalWithoutCurrentBlueMarlinHabitat
    .summary
    .classification,
  "weak-preliminary-habitat-support"
);

console.log(
  "PASS strong thermal organization without current support remains weak preliminary habitat evidence"
);


/*
 * Scenario 7:
 * Strong current without thermal organization
 *
 * Expected:
 * Movement evidence alone should remain weak.
 */
const strongCurrentWithoutThermalBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityConfidenceScore: 85,
      opportunityConfidenceLevel:
        "High",

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

          ageHours: 4,

          sourceAvailability:
            "available"
        }
      }
    })
  );

assert.equal(
  strongCurrentWithoutThermalBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  10
);

assert.equal(
  strongCurrentWithoutThermalBlueMarlinHabitat
    .relationshipGroups
    .thermalStructure
    .score,
  0
);

assert.equal(
  strongCurrentWithoutThermalBlueMarlinHabitat
    .summary
    .classification,
  "insufficient-habitat-evidence"
);

assert.ok(
  strongCurrentWithoutThermalBlueMarlinHabitat
    .summary
    .suitabilityScore <
  30
);

console.log(
  "PASS strong current without an ocean opportunity remains insufficient blue marlin habitat evidence"
);


/*
 * Scenario 8:
 * Organized thermal-current feature with chlorophyll missing
 *
 * Expected:
 * The feature may still produce limited support, but missing
 * productivity and water-character evidence should prevent a
 * stronger interpretation.
 */
const organizedFeatureWithoutChlorophyllBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone",
        "current-supported-transition-candidate"
      ],

      opportunityConfidenceScore: 80,
      opportunityConfidenceLevel:
        "High",

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
          score: 92,
          level: "high"
        }
      },

      current: {
        available: true,

        classification:
          "strong",

        values: {
          speedKnots: 1.2,

          strengthClassification:
            "strong",

          directionDegrees: 225,

          compassDirection:
            "SW",

          freshness:
            "recent",

          ageHours: 5,

          sourceAvailability:
            "available"
        }
      },

      productivity: {
        available: false
      },

      clarity: {
        available: false
      }
    })
  );

assert.equal(
  organizedFeatureWithoutChlorophyllBlueMarlinHabitat
    .relationshipGroups
    .thermalStructure
    .score,
  25
);

assert.equal(
  organizedFeatureWithoutChlorophyllBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  17
);

assert.equal(
  organizedFeatureWithoutChlorophyllBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  0
);

assert.equal(
  organizedFeatureWithoutChlorophyllBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  0
);

assert.equal(
  organizedFeatureWithoutChlorophyllBlueMarlinHabitat
    .summary
    .rawSuitabilityScore,
  42
);

assert.equal(
  organizedFeatureWithoutChlorophyllBlueMarlinHabitat
    .summary
    .classification,
  "limited-preliminary-habitat-support"
);

console.log(
  "PASS organized thermal-current feature remains limited when chlorophyll evidence is unavailable"
);


/*
 * Scenario 9:
 * Stale integrated feature
 *
 * Expected:
 * Stale current and chlorophyll evidence should materially
 * reduce the final score below the equivalent recent or
 * merely aging scenario.
 */
const staleOrganizedFeatureBlueMarlinHabitat =
  assessBlueMarlinHabitat(
    createBlueMarlinHabitatInput({
      opportunityTypes: [
        "environmental-transition-zone",
        "current-supported-transition-candidate",
        "surface-water-boundary-candidate",
        "multi-signal-feature-candidate"
      ],

      opportunityConfidenceScore: 80,
      opportunityConfidenceLevel:
        "High",

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
          score: 92,
          level: "high"
        }
      },

      current: {
        available: true,

        classification:
          "strong",

        values: {
          speedKnots: 1.2,

          strengthClassification:
            "strong",

          directionDegrees: 225,

          compassDirection:
            "SW",

          freshness:
            "stale",

          ageHours: 120,

          sourceAvailability:
            "available"
        }
      },

      productivity: {
        available: true,

        classification:
          "productive-blue-green-transition",

        values: {
          concentrationMgM3: 0.34,

          productivityClassification:
            "productive-blue-green-transition",

          freshness:
            "stale",

          ageHours: 120
        }
      },

      clarity: {
        available: true,

        classification:
          "transitional-surface-water",

        values: {
          concentrationMgM3: 0.34,

          waterClassification:
            "productive-blue-green-transition",

          freshness:
            "stale",

          ageHours: 120
        }
      }
    })
  );

assert.equal(
  staleOrganizedFeatureBlueMarlinHabitat
    .relationshipGroups
    .thermalStructure
    .score,
  25
);

assert.equal(
  staleOrganizedFeatureBlueMarlinHabitat
    .relationshipGroups
    .oceanMovement
    .score,
  8
);

assert.equal(
  staleOrganizedFeatureBlueMarlinHabitat
    .relationshipGroups
    .productivityAndPreySupport
    .score,
  8
);

assert.equal(
  staleOrganizedFeatureBlueMarlinHabitat
    .relationshipGroups
    .waterCharacter
    .score,
  4
);

assert.equal(
  staleOrganizedFeatureBlueMarlinHabitat
    .summary
    .rawSuitabilityScore,
  45
);

assert.equal(
  staleOrganizedFeatureBlueMarlinHabitat
    .summary
    .classification,
  "limited-preliminary-habitat-support"
);

assert.ok(
  staleOrganizedFeatureBlueMarlinHabitat
    .summary
    .suitabilityScore <
  agingOrganizedFeatureBlueMarlinHabitat
    .summary
    .suitabilityScore
);

console.log(
  "PASS stale observations materially reduce an integrated blue marlin habitat signal"
);


/*
 * Scenario 10:
 * Current practical model ceiling
 *
 * Structure Interaction and Persistence are not yet backed
 * by connected upstream evidence. This scenario documents
 * the strongest currently observable combination.
 *
 * Expected current ceiling:
 * Thermal 25
 * Movement 19
 * Productivity 18
 * Water Character 9
 * Total 71
 */
assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .rawSuitabilityScore,
  71
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .relationshipGroups
    .structureInteraction
    .score,
  0
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .relationshipGroups
    .persistence
    .score,
  0
);

assert.ok(
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .rawSuitabilityScore <
  100
);

console.log(
  "PASS current blue marlin model ceiling is documented before structure and persistence evidence are connected"
);


/*
 * Structure Evidence missing-location fallback
 *
 * Verified structure data is connected, but calls without valid
 * coordinates must still return a complete, explicitly unavailable,
 * species-neutral evidence contract.
 */
const structureEvidenceContractResult =
  assessOceanEvidence({
    sst: null,
    chlorophyll: null,
    currents: null,
    dataQuality: {}
  });

const structureEvidence =
  structureEvidenceContractResult
    .groups
    .structure;

assert.equal(
  structureEvidence.available,
  false
);

assert.equal(
  structureEvidence.classification,
  "unavailable"
);

assert.equal(
  structureEvidence.reason,
  "invalid-analysis-location"
);

assert.equal(
  structureEvidence.interpretation,
  "species-neutral-structure-evidence"
);

assert.equal(
  structureEvidence.values
    .featureType,
  null
);

assert.equal(
  structureEvidence.values
    .nearestStructureDistanceNm,
  null
);

assert.equal(
  structureEvidence.values
    .currentInteraction,
  false
);

assert.equal(
  structureEvidence.values
    .currentConvergenceDetected,
  false
);

assert.equal(
  structureEvidence.values
    .currentShearDetected,
  false
);

assert.equal(
  structureEvidence.values
    .currentEdgeDetected,
  false
);

assert.equal(
  structureEvidence.values
    .eddyBoundaryDetected,
  false
);

assert.equal(
  structureEvidence.values
    .currentInteractionClassification,
  "unavailable"
);

assert.equal(
  structureEvidence.values
    .thermalInteraction,
  false
);

assert.equal(
  structureEvidence.values
    .productivityInteraction,
  false
);

assert.equal(
  structureEvidence.values
    .multiSignalInteraction,
  false
);

assert.equal(
  structureEvidence.confidence
    .score,
  0
);

assert.equal(
  structureEvidence.confidence
    .level,
  "Unavailable"
);

assert.ok(
  structureEvidence.limitations
    .includes(
      "invalid-analysis-location"
    )
);

assert.ok(
  structureEvidence.limitations
    .includes(
      "does-not-evaluate-bathymetry"
    )
);

assert.ok(
  structureEvidence.limitations
    .includes(
      "does-not-evaluate-current-interaction"
    )
);

assert.ok(
  structureEvidence.limitations
    .includes(
      "does-not-establish-fish-presence"
    )
);

console.log(
  "PASS Structure Evidence missing-location fallback remains complete, conservative, and species-neutral"
);


/*
 * Structure Evidence v2.0 verified proximity
 *
 * A valid location matching a verified BOEM structure should
 * produce available, species-neutral proximity evidence without
 * claiming biological activity or species suitability.
 */
const appomattoxStructureResult =
  assessOceanEvidence({
    latitude: 28.57350034,
    longitude: -87.93421264,
    sst: null,
    chlorophyll: null,
    currents: null,
    dataQuality: {}
  });

const appomattoxStructureEvidence =
  appomattoxStructureResult
    .groups
    .structure;

assert.equal(
  appomattoxStructureEvidence.available,
  true
);

assert.equal(
  appomattoxStructureEvidence.classification,
  "verified-structure-proximity"
);

assert.equal(
  appomattoxStructureEvidence.reason,
  "nearest-verified-structure-identified"
);

assert.equal(
  appomattoxStructureEvidence.interpretation,
  "species-neutral-structure-evidence"
);

assert.equal(
  appomattoxStructureEvidence.values
    .featureName,
  "Appomattox"
);

assert.equal(
  appomattoxStructureEvidence.values
    .featureType,
  "Offshore Platform"
);

assert.equal(
  appomattoxStructureEvidence.values
    .featureSource,
  "BOEM"
);

assert.ok(
  appomattoxStructureEvidence.values
    .nearestStructureDistanceNm <=
  0.01
);

assert.equal(
  appomattoxStructureEvidence.values
    .analysisRadiusNm,
  1.89
);

assert.equal(
  appomattoxStructureEvidence.values
    .freshness,
  "verified-static"
);

assert.equal(
  appomattoxStructureEvidence.values
    .currentInteraction,
  false
);

assert.equal(
  appomattoxStructureEvidence.values
    .currentInteractionClassification,
  "unavailable"
);

assert.equal(
  appomattoxStructureEvidence.values
    .thermalInteraction,
  false
);

assert.equal(
  appomattoxStructureEvidence.values
    .productivityInteraction,
  false
);

assert.equal(
  appomattoxStructureEvidence.values
    .multiSignalInteraction,
  false
);

assert.equal(
  appomattoxStructureEvidence.confidence
    .score,
  95
);

assert.equal(
  appomattoxStructureEvidence.confidence
    .level,
  "High"
);

assert.ok(
  appomattoxStructureEvidence.confidence
    .limitations
    .includes(
      "structure-presence-does-not-confirm-biological-activity"
    )
);

assert.ok(
  appomattoxStructureEvidence.limitations
    .includes(
      "does-not-establish-fish-presence"
    )
);

assert.ok(
  appomattoxStructureEvidence.limitations
    .includes(
      "does-not-indicate-species-suitability"
    )
);

assert.ok(
  appomattoxStructureEvidence.limitations
    .includes(
      "does-not-evaluate-current-interaction"
    )
);

assert.ok(
  appomattoxStructureEvidence.limitations
    .includes(
      "does-not-evaluate-bathymetry"
    )
);

console.log(
  "PASS Structure Evidence v2.0 identifies verified Appomattox proximity without biological inference"
);

/*
 * Structure Evidence current-data classification
 *
 * A valid single-point current observation may be acknowledged,
 * but it cannot establish current interaction with a structure.
 */
const appomattoxCurrentStructureResult =
  assessOceanEvidence({
    latitude: 28.57350034,
    longitude: -87.93421264,

    sst: null,
    chlorophyll: null,

    currents: {
      speedKnots: 1.1,
      directionDegrees: 180,

      observedAt:
        "2026-07-27T12:00:00.000Z",

      ageHours: 10,

      source: {
        availability:
          "available"
      }
    },

    dataQuality: {}
  });

const appomattoxCurrentStructureEvidence =
  appomattoxCurrentStructureResult
    .groups
    .structure;

assert.equal(
  appomattoxCurrentStructureEvidence
    .available,
  true
);

assert.equal(
  appomattoxCurrentStructureEvidence
    .values
    .currentInteraction,
  false
);

assert.equal(
  appomattoxCurrentStructureEvidence
    .values
    .currentInteractionClassification,
  "single-point-current-only"
);

assert.equal(
  appomattoxCurrentStructureEvidence
    .values
    .currentConvergenceDetected,
  false
);

assert.equal(
  appomattoxCurrentStructureEvidence
    .values
    .currentShearDetected,
  false
);

assert.equal(
  appomattoxCurrentStructureEvidence
    .values
    .currentEdgeDetected,
  false
);

assert.equal(
  appomattoxCurrentStructureEvidence
    .values
    .eddyBoundaryDetected,
  false
);

assert.ok(
  appomattoxCurrentStructureEvidence
    .limitations
    .includes(
      "does-not-evaluate-current-interaction"
    )
);

assert.ok(
  appomattoxCurrentStructureEvidence
    .limitations
    .includes(
      "does-not-establish-fish-presence"
    )
);

assert.ok(
  appomattoxCurrentStructureEvidence
    .limitations
    .includes(
      "does-not-indicate-species-suitability"
    )
);

console.log(
  "PASS Structure Evidence acknowledges single-point current data without inferring interaction"
);

/*
 * Structure Evidence v2.0 verified FAD proximity
 *
 * A valid location matching a verified county FAD should
 * preserve the FAD identity, source, depth, and conservative
 * species-neutral limitations.
 */
const okaloosaFadStructureResult =
  assessOceanEvidence({
    latitude: 29.528317,
    longitude: -87.043883,
    sst: null,
    chlorophyll: null,
    currents: null,
    dataQuality: {}
  });

const okaloosaFadStructureEvidence =
  okaloosaFadStructureResult
    .groups
    .structure;

assert.equal(
  okaloosaFadStructureEvidence.available,
  true
);

assert.equal(
  okaloosaFadStructureEvidence.classification,
  "verified-structure-proximity"
);

assert.equal(
  okaloosaFadStructureEvidence.reason,
  "nearest-verified-structure-identified"
);

assert.equal(
  okaloosaFadStructureEvidence.interpretation,
  "species-neutral-structure-evidence"
);

assert.equal(
  okaloosaFadStructureEvidence.values
    .featureName,
  "Okaloosa FAD 1"
);

assert.equal(
  okaloosaFadStructureEvidence.values
    .featureType,
  "Fish Aggregating Device"
);

assert.equal(
  okaloosaFadStructureEvidence.values
    .featureSource,
  "Okaloosa County"
);

assert.ok(
  okaloosaFadStructureEvidence.values
    .nearestStructureDistanceNm <=
  0.01
);

assert.equal(
  okaloosaFadStructureEvidence.values
    .depthFeet,
  1191
);

assert.equal(
  okaloosaFadStructureEvidence.values
    .analysisRadiusNm,
  1.35
);

assert.equal(
  okaloosaFadStructureEvidence.values
    .freshness,
  "verified-static"
);

assert.equal(
  okaloosaFadStructureEvidence.values
    .currentInteraction,
  false
);

assert.equal(
  okaloosaFadStructureEvidence.values
    .thermalInteraction,
  false
);

assert.equal(
  okaloosaFadStructureEvidence.values
    .productivityInteraction,
  false
);

assert.equal(
  okaloosaFadStructureEvidence.values
    .multiSignalInteraction,
  false
);

assert.equal(
  okaloosaFadStructureEvidence.confidence
    .score,
  95
);

assert.equal(
  okaloosaFadStructureEvidence.confidence
    .level,
  "High"
);

assert.ok(
  okaloosaFadStructureEvidence.confidence
    .limitations
    .includes(
      "structure-presence-does-not-confirm-biological-activity"
    )
);

assert.ok(
  okaloosaFadStructureEvidence.limitations
    .includes(
      "does-not-establish-fish-presence"
    )
);

assert.ok(
  okaloosaFadStructureEvidence.limitations
    .includes(
      "does-not-indicate-species-suitability"
    )
);

assert.ok(
  okaloosaFadStructureEvidence.limitations
    .includes(
      "does-not-evaluate-current-interaction"
    )
);

console.log(
  "PASS Structure Evidence v2.0 identifies verified Okaloosa FAD proximity without biological inference"
);


/**
 * ------------------------------------------------------------
 * Persistence Evidence Contract v1.0
 * ------------------------------------------------------------
 */

const persistenceEvidenceContractResult =
  assessBlueMarlinHabitat({
    oceanOpportunity: {
      opportunities: [],
      confidence: {
        score: 0,
        level: "Very Low"
      },
      limitations: []
    },

    oceanEvidence: {
      groups: {},
      confidence: {
        score: 0,
        level: "Very Low"
      }
    }
  });

const persistenceEvidence =
  persistenceEvidenceContractResult
    .relationshipGroups
    .persistence;

assert.equal(
  persistenceEvidence.available,
  false
);

assert.equal(
  persistenceEvidence.classification,
  "unavailable"
);

assert.equal(
  persistenceEvidence.headline,
  "Feature persistence unavailable"
);

assert.equal(
  persistenceEvidence.reason,
  "persistence-analysis-not-yet-implemented"
);

assert.equal(
  persistenceEvidence.interpretation,
  "species-neutral-persistence-evidence"
);

assert.equal(
  persistenceEvidence.score,
  0
);

assert.equal(
  persistenceEvidence.maximumScore,
  5
);

assert.equal(
  persistenceEvidence.values
    .lifecycleState,
  null
);

assert.equal(
  persistenceEvidence.values
    .observationWindowHours,
  null
);

assert.equal(
  persistenceEvidence.values
    .sampleCount,
  null
);

assert.equal(
  persistenceEvidence.values
    .multiSignalPersistence,
  false
);

assert.equal(
  persistenceEvidence.values
    .freshness,
  "unknown"
);

assert.equal(
  persistenceEvidence.confidence
    .score,
  0
);

assert.equal(
  persistenceEvidence.confidence
    .level,
  "Unavailable"
);

assert.ok(
  persistenceEvidence.confidence
    .limitations.includes(
      "historical-observations-not-connected"
    )
);

assert.ok(
  persistenceEvidence.limitations
    .includes(
      "single-time-observation-does-not-establish-persistence"
    )
);

assert.ok(
  persistenceEvidence.limitations
    .includes(
      "persistence-does-not-establish-prey-or-fish-presence"
    )
);

assert.deepEqual(
  persistenceEvidence.drivers,
  []
);

console.log(
  "PASS Persistence Evidence Contract v1.0 remains species-neutral and unavailable until verified temporal analysis is connected"
);



/**
 * ------------------------------------------------------------
 * Open-Water Organization Evidence Contract v1.0
 * ------------------------------------------------------------
 */

const unavailableOpenWaterEvidence =
  buildOpenWaterEvidence();

assert.equal(
  unavailableOpenWaterEvidence.available,
  false
);

assert.equal(
  unavailableOpenWaterEvidence.classification,
  "unavailable"
);

assert.equal(
  unavailableOpenWaterEvidence.values
    .organized,
  false
);

assert.equal(
  unavailableOpenWaterEvidence.values
    .organizationSignalCount,
  0
);

assert.equal(
  unavailableOpenWaterEvidence.values
    .structureRequired,
  false
);

assert.equal(
  unavailableOpenWaterEvidence.confidence
    .score,
  0
);

assert.equal(
  unavailableOpenWaterEvidence.confidence
    .level,
  "Unavailable"
);

assert.ok(
  unavailableOpenWaterEvidence.limitations
    .includes(
      "open-water-organization-does-not-establish-fish-presence"
    )
);

console.log(
  "PASS Open-Water Evidence remains conservative when spatial environmental data is unavailable"
);


const openWaterOnlyEvidence =
  buildOpenWaterEvidence({
    current: {
      available: true,
      convergenceDetected: true,
      shearDetected: false,
      currentEdgeDetected: false,
      eddyBoundaryDetected: false,
      observedAt:
        "2026-07-28T18:00:00.000Z",
      ageHours: 1,
      freshness: "fresh"
    }
  });

assert.equal(
  openWaterOnlyEvidence.available,
  true
);

assert.equal(
  openWaterOnlyEvidence.classification,
  "single-signal-open-water-organization"
);

assert.equal(
  openWaterOnlyEvidence.values
    .organized,
  true
);

assert.equal(
  openWaterOnlyEvidence.values
    .organizationSignalCount,
  1
);

assert.equal(
  openWaterOnlyEvidence.values
    .currentConvergenceDetected,
  true
);

assert.equal(
  openWaterOnlyEvidence.values
    .structureRequired,
  false
);

assert.deepEqual(
  openWaterOnlyEvidence.drivers,
  [
    "current-convergence"
  ]
);

console.log(
  "PASS Open-Water Evidence identifies environmental organization without requiring physical structure"
);


/**
 * ------------------------------------------------------------
 * Environmental Opportunity Evidence Contract v1.0
 * ------------------------------------------------------------
 */

const unavailableEnvironmentalEvidence =
  buildEnvironmentalOpportunityEvidence({
    structureEvidence: {
      available: false
    },

    openWaterEvidence:
      unavailableOpenWaterEvidence,

    persistenceEvidence: {
      available: false
    }
  });

assert.equal(
  unavailableEnvironmentalEvidence.available,
  false
);

assert.equal(
  unavailableEnvironmentalEvidence.classification,
  "insufficient-environmental-opportunity-evidence"
);

assert.equal(
  unavailableEnvironmentalEvidence.rules
    .structureRequired,
  false
);

assert.equal(
  unavailableEnvironmentalEvidence.rules
    .missingStructureIsNegative,
  false
);

assert.equal(
  unavailableEnvironmentalEvidence.rules
    .structureAbsenceTreatment,
  "neutral"
);

console.log(
  "PASS Environmental Opportunity Evidence treats missing structure as neutral"
);


const openWaterEnvironmentalEvidence =
  buildEnvironmentalOpportunityEvidence({
    structureEvidence: {
      available: false,
      classification:
        "unavailable"
    },

    openWaterEvidence:
      openWaterOnlyEvidence,

    persistenceEvidence: {
      available: false,
      classification:
        "unavailable"
    }
  });

assert.equal(
  openWaterEnvironmentalEvidence.available,
  true
);

assert.equal(
  openWaterEnvironmentalEvidence.classification,
  "open-water-evidence"
);

assert.equal(
  openWaterEnvironmentalEvidence.pathways
    .structureAssociated
    .available,
  false
);

assert.equal(
  openWaterEnvironmentalEvidence.pathways
    .openWater
    .available,
  true
);

assert.equal(
  openWaterEnvironmentalEvidence.pathways
    .openWater
    .organized,
  true
);

assert.equal(
  openWaterEnvironmentalEvidence.rules
    .missingStructureIsNegative,
  false
);

console.log(
  "PASS Environmental Opportunity Evidence supports a first-class open-water-only pathway"
);


const structureOnlyEnvironmentalEvidence =
  buildEnvironmentalOpportunityEvidence({
    structureEvidence: {
      available: true,
      classification:
        "verified-structure-proximity"
    },

    openWaterEvidence:
      unavailableOpenWaterEvidence,

    persistenceEvidence: {
      available: false,
      classification:
        "unavailable"
    }
  });

assert.equal(
  structureOnlyEnvironmentalEvidence.available,
  true
);

assert.equal(
  structureOnlyEnvironmentalEvidence.classification,
  "structure-evidence"
);

assert.equal(
  structureOnlyEnvironmentalEvidence.pathways
    .structureAssociated
    .available,
  true
);

assert.equal(
  structureOnlyEnvironmentalEvidence.pathways
    .openWater
    .organized,
  false
);

console.log(
  "PASS Environmental Opportunity Evidence preserves the independent structure-associated pathway"
);


const multiSignalOpenWaterEvidence =
  buildOpenWaterEvidence({
    current: {
      available: true,
      currentEdgeDetected: true,
      eddyBoundaryDetected: true,
      observedAt:
        "2026-07-28T18:00:00.000Z",
      ageHours: 1,
      freshness: "fresh"
    },

    thermal: {
      available: true,
      boundaryDetected: true,
      observedAt:
        "2026-07-28T18:00:00.000Z",
      ageHours: 1,
      freshness: "fresh"
    }
  });

const combinedEnvironmentalEvidence =
  buildEnvironmentalOpportunityEvidence({
    structureEvidence: {
      available: true,
      classification:
        "verified-structure-proximity"
    },

    openWaterEvidence:
      multiSignalOpenWaterEvidence,

    persistenceEvidence: {
      available: false,
      classification:
        "unavailable"
    }
  });

assert.equal(
  multiSignalOpenWaterEvidence.classification,
  "multi-signal-open-water-organization"
);

assert.equal(
  multiSignalOpenWaterEvidence.values
    .organizationSignalCount,
  3
);

assert.equal(
  combinedEnvironmentalEvidence.classification,
  "structure-and-open-water-evidence"
);

assert.equal(
  combinedEnvironmentalEvidence.pathways
    .structureAssociated
    .available,
  true
);

assert.equal(
  combinedEnvironmentalEvidence.pathways
    .openWater
    .organized,
  true
);

assert.equal(
  combinedEnvironmentalEvidence.rules
    .structureRequired,
  false
);

console.log(
  "PASS Environmental Opportunity Evidence recognizes combined structure and open-water pathways"
);



/**
 * ------------------------------------------------------------
 * Environmental Opportunity Evidence integration
 * ------------------------------------------------------------
 */

const integratedEnvironmentalEvidence =
  assessOceanEvidence({
    latitude: 28.25,
    longitude: -85.58,

    sst: null,
    chlorophyll: null,
    currents: null,

    dataQuality: {}
  });

assert.ok(
  integratedEnvironmentalEvidence
    .environmentalOpportunityEvidence
);

assert.ok(
  integratedEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .openWater
);

assert.ok(
  integratedEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .persistence
);

assert.ok(
  integratedEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .combined
);

assert.equal(
  integratedEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .openWater
    .values
    .organized,
  false
);

assert.equal(
  integratedEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .openWater
    .values
    .structureRequired,
  false
);

assert.equal(
  integratedEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .persistence
    .available,
  false
);

assert.equal(
  integratedEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .combined
    .rules
    .structureRequired,
  false
);

assert.equal(
  integratedEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .combined
    .rules
    .missingStructureIsNegative,
  false
);

assert.equal(
  integratedEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .combined
    .rules
    .structureAbsenceTreatment,
  "neutral"
);

assert.deepEqual(
  Object.keys(
    integratedEnvironmentalEvidence.groups
  ),
  [
    "temperature",
    "current",
    "productivity",
    "clarity",
    "structure"
  ]
);

assert.equal(
  integratedEnvironmentalEvidence
    .methodVersion,
  "pelora-ocean-evidence-v1.2"
);

console.log(
  "PASS Ocean Evidence exposes environmental opportunity contracts without changing established evidence groups"
);


const singlePointEnvironmentalEvidence =
  assessOceanEvidence({
    latitude: 28.25,
    longitude: -85.58,

    sst: {
      temperatureFahrenheit: 82,
      observedAt:
        "2026-07-28T18:00:00.000Z"
    },

    chlorophyll: null,

    currents: {
      speedKnots: 1.5,
      directionDegrees: 220,
      observedAt:
        "2026-07-28T18:00:00.000Z"
    },

    dataQuality: {}
  });

assert.equal(
  singlePointEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .openWater
    .values
    .currentConvergenceDetected,
  false
);

assert.equal(
  singlePointEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .openWater
    .values
    .currentShearDetected,
  false
);

assert.equal(
  singlePointEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .openWater
    .values
    .currentEdgeDetected,
  false
);

assert.equal(
  singlePointEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .openWater
    .values
    .eddyBoundaryDetected,
  false
);

assert.equal(
  singlePointEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .openWater
    .values
    .thermalBoundaryDetected,
  false
);

assert.equal(
  singlePointEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .openWater
    .values
    .productivityBoundaryDetected,
  false
);

assert.equal(
  singlePointEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .openWater
    .values
    .waterMassInteractionDetected,
  false
);

assert.equal(
  singlePointEnvironmentalEvidence
    .environmentalOpportunityEvidence
    .openWater
    .values
    .organized,
  false
);

console.log(
  "PASS Ocean Evidence does not infer open-water spatial organization from single-point observations"
);



/**
 * ------------------------------------------------------------
 * Opportunity Classification Engine v1.0
 * ------------------------------------------------------------
 */

const insufficientOpportunityClassification =
  classifyOceanOpportunity();

assert.equal(
  insufficientOpportunityClassification
    .available,
  false
);

assert.equal(
  insufficientOpportunityClassification
    .classification,
  "insufficient-evidence"
);

assert.equal(
  insufficientOpportunityClassification
    .pathway,
  "unresolved"
);

assert.equal(
  insufficientOpportunityClassification
    .rules
    .structureRequired,
  false
);

assert.equal(
  insufficientOpportunityClassification
    .rules
    .missingStructureIsNegative,
  false
);

assert.equal(
  insufficientOpportunityClassification
    .rules
    .structureAbsenceTreatment,
  "neutral"
);

assert.equal(
  insufficientOpportunityClassification
    .rules
    .classificationChangesScores,
  false
);

console.log(
  "PASS Opportunity Classification remains conservative when evidence is insufficient"
);


const unclassifiedFeatureClassification =
  classifyOceanOpportunity({
    environmentalOpportunityEvidence: {
      combined: {
        pathways: {
          structureAssociated: {
            available: false
          },

          openWater: {
            available: true,
            organized: false
          },

          persistence: {
            available: false
          }
        }
      }
    },

    featureCandidates: [
      {
        type:
          "temperature-transition-candidate",

        supportingEvidence: [
          "temperature"
        ],

        sourceFamilies: [
          "spatial-temperature"
        ]
      }
    ]
  });

assert.equal(
  unclassifiedFeatureClassification
    .available,
  true
);

assert.equal(
  unclassifiedFeatureClassification
    .classification,
  "environmental-feature-unclassified"
);

assert.equal(
  unclassifiedFeatureClassification
    .pathway,
  "observed-feature-candidate"
);

assert.equal(
  unclassifiedFeatureClassification
    .evidence
    .featureCandidateCount,
  1
);

assert.deepEqual(
  unclassifiedFeatureClassification
    .sourceOpportunityTypes,
  [
    "temperature-transition-candidate"
  ]
);

assert.deepEqual(
  unclassifiedFeatureClassification
    .supportingEvidenceGroups,
  [
    "temperature"
  ]
);

console.log(
  "PASS Opportunity Classification preserves an environmental feature candidate when its pathway is not yet verified"
);


const openWaterOpportunityClassification =
  classifyOceanOpportunity({
    environmentalOpportunityEvidence: {
      combined: {
        pathways: {
          structureAssociated: {
            available: false
          },

          openWater: {
            available: true,
            organized: true
          },

          persistence: {
            available: false
          }
        }
      }
    },

    featureCandidates: [
      {
        type:
          "multi-signal-feature-candidate",

        supportingEvidence: [
          "temperature",
          "current"
        ],

        sourceFamilies: [
          "spatial-temperature",
          "spatial-current"
        ]
      }
    ]
  });

assert.equal(
  openWaterOpportunityClassification
    .classification,
  "open-water"
);

assert.equal(
  openWaterOpportunityClassification
    .pathway,
  "environmental-organization"
);

assert.equal(
  openWaterOpportunityClassification
    .evidence
    .structureAvailable,
  false
);

assert.equal(
  openWaterOpportunityClassification
    .evidence
    .openWaterOrganized,
  true
);

assert.equal(
  openWaterOpportunityClassification
    .rules
    .missingStructureIsNegative,
  false
);

console.log(
  "PASS Opportunity Classification recognizes a first-class open-water pathway without physical structure"
);


const structureOpportunityClassification =
  classifyOceanOpportunity({
    environmentalOpportunityEvidence: {
      combined: {
        pathways: {
          structureAssociated: {
            available: true
          },

          openWater: {
            available: false,
            organized: false
          },

          persistence: {
            available: false
          }
        }
      }
    },

    featureCandidates: []
  });

assert.equal(
  structureOpportunityClassification
    .classification,
  "structure-associated"
);

assert.equal(
  structureOpportunityClassification
    .pathway,
  "physical-structure"
);

assert.equal(
  structureOpportunityClassification
    .evidence
    .structureAvailable,
  true
);

assert.equal(
  structureOpportunityClassification
    .evidence
    .openWaterOrganized,
  false
);

console.log(
  "PASS Opportunity Classification recognizes an independent structure-associated pathway"
);


const combinedOpportunityClassification =
  classifyOceanOpportunity({
    environmentalOpportunityEvidence: {
      combined: {
        pathways: {
          structureAssociated: {
            available: true
          },

          openWater: {
            available: true,
            organized: true
          },

          persistence: {
            available: true
          }
        }
      }
    },

    featureCandidates: [
      {
        type:
          "multi-signal-feature-candidate",

        supportingEvidence: [
          "temperature",
          "current",
          "productivity"
        ],

        sourceFamilies: [
          "spatial-temperature",
          "spatial-current",
          "surface-chlorophyll"
        ]
      }
    ]
  });

assert.equal(
  combinedOpportunityClassification
    .classification,
  "combined"
);

assert.equal(
  combinedOpportunityClassification
    .pathway,
  "structure-and-open-water"
);

assert.equal(
  combinedOpportunityClassification
    .evidence
    .structureAvailable,
  true
);

assert.equal(
  combinedOpportunityClassification
    .evidence
    .openWaterOrganized,
  true
);

assert.equal(
  combinedOpportunityClassification
    .evidence
    .persistenceAvailable,
  true
);

assert.deepEqual(
  combinedOpportunityClassification
    .supportingPathways,
  [
    "structure-associated",
    "open-water",
    "persistence",
    "environmental-feature-candidate"
  ]
);

assert.equal(
  combinedOpportunityClassification
    .rules
    .biologicalInferenceAllowed,
  false
);

console.log(
  "PASS Opportunity Classification recognizes a combined structure and open-water pathway"
);



/**
 * ------------------------------------------------------------
 * Ocean Opportunity pathway-classification integration
 * ------------------------------------------------------------
 */

const pathwayIntegrationEvidence =
  assessOceanEvidence({
    marine: {
      wind: {
        speedKnots: 12,
        directionDegrees: 180
      },

      waves: {
        heightFeet: 2,
        directionDegrees: 175,
        periodSeconds: 7
      },

      swell: {
        heightFeet: 2,
        directionDegrees: 170,
        periodSeconds: 8
      },

      current: {
        speedKnots: 1.6,
        directionDegrees: 90
      },

      sst: {
        temperatureF: 80
      },

      chlorophyll: {
        value: 0.22
      }
    },

    spatialTemperature: {
      center: 80,
      north: 81.4,
      south: 79.1,
      east: 80.9,
      west: 79.4
    },

    dataQuality: {}
  });

const pathwayIntegrationBaseline =
  assessOceanOpportunity({
    oceanEvidence:
      pathwayIntegrationEvidence
  });

assert.ok(
  pathwayIntegrationBaseline
    .pathwayClassification
);

assert.equal(
  pathwayIntegrationBaseline
    .pathwayClassification
    .rules
    .structureRequired,
  false
);

assert.equal(
  pathwayIntegrationBaseline
    .pathwayClassification
    .rules
    .missingStructureIsNegative,
  false
);

assert.equal(
  pathwayIntegrationBaseline
    .pathwayClassification
    .rules
    .structureAbsenceTreatment,
  "neutral"
);

assert.equal(
  pathwayIntegrationBaseline
    .pathwayClassification
    .rules
    .classificationIsSpeciesNeutral,
  true
);

assert.equal(
  pathwayIntegrationBaseline
    .pathwayClassification
    .rules
    .classificationChangesScores,
  false
);

assert.equal(
  pathwayIntegrationBaseline
    .pathwayClassification
    .rules
    .biologicalInferenceAllowed,
  false
);

assert.equal(
  pathwayIntegrationBaseline
    .pathwayClassification
    .evidence
    .featureCandidateCount,
  pathwayIntegrationBaseline
    .opportunities
    .length
);

assert.equal(
  pathwayIntegrationBaseline
    .summary
    .opportunityCount,
  pathwayIntegrationBaseline
    .opportunities
    .length
);

assert.equal(
  pathwayIntegrationBaseline
    .methodVersion,
  "pelora-ocean-opportunity-v1.1"
);

console.log(
  "PASS Ocean Opportunity exposes pathway classification without changing established opportunity behavior"
);


const noEvidencePathwayIntegration =
  assessOceanOpportunity({
    oceanEvidence: {
      groups: {},

      confidence: {
        score: 0,
        level: "Very Low"
      },

      environmentalOpportunityEvidence: {
        combined: {
          pathways: {
            structureAssociated: {
              available: false
            },

            openWater: {
              available: false,
              organized: false
            },

            persistence: {
              available: false
            }
          }
        }
      },

      summary: {
        availableGroupCount: 0
      },

      limitations: []
    }
  });

assert.equal(
  noEvidencePathwayIntegration
    .summary
    .classification,
  "no-supported-feature-candidate"
);

assert.equal(
  noEvidencePathwayIntegration
    .summary
    .opportunityCount,
  0
);

assert.equal(
  noEvidencePathwayIntegration
    .opportunities
    .length,
  0
);

assert.equal(
  noEvidencePathwayIntegration
    .pathwayClassification
    .classification,
  "insufficient-evidence"
);

assert.equal(
  noEvidencePathwayIntegration
    .pathwayClassification
    .available,
  false
);

assert.equal(
  noEvidencePathwayIntegration
    .confidence
    .score,
  0
);

console.log(
  "PASS Ocean Opportunity pathway integration preserves the insufficient-evidence fallback"
);



/**
 * ------------------------------------------------------------
 * Relationship Context Engine v1.0
 * ------------------------------------------------------------
 */

const emptyRelationshipContext =
  buildRelationshipContext();

assert.equal(
  emptyRelationshipContext
    .available,
  false
);

assert.equal(
  emptyRelationshipContext
    .pathway,
  "insufficient-evidence"
);

assert.equal(
  emptyRelationshipContext
    .environmentType,
  "unresolved"
);

assert.deepEqual(
  emptyRelationshipContext
    .supportedRelationships,
  []
);

assert.equal(
  emptyRelationshipContext
    .rules
    .structureRequired,
  false
);

assert.equal(
  emptyRelationshipContext
    .rules
    .missingStructureIsNegative,
  false
);

assert.equal(
  emptyRelationshipContext
    .rules
    .contextChangesScores,
  false
);

console.log(
  "PASS Relationship Context remains conservative when environmental evidence is unavailable"
);


const openWaterRelationshipContext =
  buildRelationshipContext({
    oceanOpportunity: {
      pathwayClassification: {
        classification:
          "open-water",

        pathway:
          "environmental-organization",

        evidence: {
          structureAvailable:
            false,

          openWaterOrganized:
            true,

          persistenceAvailable:
            false
        }
      }
    },

    oceanEvidence: {
      groups: {
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
          available: false
        }
      }
    }
  });

assert.equal(
  openWaterRelationshipContext
    .pathway,
  "open-water"
);

assert.equal(
  openWaterRelationshipContext
    .environmentType,
  "environmental-organization"
);

assert.equal(
  openWaterRelationshipContext
    .relationshipSupport
    .openWaterOrganization
    .supported,
  true
);

assert.equal(
  openWaterRelationshipContext
    .relationshipSupport
    .structureInteraction
    .supported,
  false
);

assert.equal(
  openWaterRelationshipContext
    .relationshipSupport
    .persistence
    .supported,
  false
);

assert.ok(
  openWaterRelationshipContext
    .supportedRelationships
    .includes(
      "thermalStructure"
    )
);

assert.ok(
  openWaterRelationshipContext
    .supportedRelationships
    .includes(
      "oceanMovement"
    )
);

assert.ok(
  openWaterRelationshipContext
    .supportedRelationships
    .includes(
      "openWaterOrganization"
    )
);

assert.equal(
  openWaterRelationshipContext
    .rules
    .missingStructureIsNegative,
  false
);

console.log(
  "PASS Relationship Context recognizes open-water organization without requiring structure"
);


const structureRelationshipContext =
  buildRelationshipContext({
    oceanOpportunity: {
      pathwayClassification: {
        classification:
          "structure-associated",

        pathway:
          "physical-structure",

        evidence: {
          structureAvailable:
            true,

          openWaterOrganized:
            false,

          persistenceAvailable:
            false
        }
      }
    },

    oceanEvidence: {
      groups: {
        temperature: {
          available: false
        },

        current: {
          available: false
        },

        productivity: {
          available: false
        },

        clarity: {
          available: false
        },

        structure: {
          available: true
        }
      }
    }
  });

assert.equal(
  structureRelationshipContext
    .pathway,
  "structure-associated"
);

assert.equal(
  structureRelationshipContext
    .relationshipSupport
    .structureInteraction
    .supported,
  true
);

assert.equal(
  structureRelationshipContext
    .relationshipSupport
    .openWaterOrganization
    .supported,
  false
);

assert.deepEqual(
  structureRelationshipContext
    .supportedRelationships,
  [
    "structureInteraction"
  ]
);

console.log(
  "PASS Relationship Context preserves an independent structure-associated pathway"
);


const combinedRelationshipContext =
  buildRelationshipContext({
    oceanOpportunity: {
      pathwayClassification: {
        classification:
          "combined",

        pathway:
          "structure-and-open-water",

        evidence: {
          structureAvailable:
            true,

          openWaterOrganized:
            true,

          persistenceAvailable:
            true
        }
      }
    },

    oceanEvidence: {
      groups: {
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
      }
    }
  });

assert.equal(
  combinedRelationshipContext
    .pathway,
  "combined"
);

assert.equal(
  combinedRelationshipContext
    .environmentType,
  "structure-and-open-water"
);

assert.equal(
  combinedRelationshipContext
    .relationshipSupport
    .structureInteraction
    .supported,
  true
);

assert.equal(
  combinedRelationshipContext
    .relationshipSupport
    .openWaterOrganization
    .supported,
  true
);

assert.equal(
  combinedRelationshipContext
    .relationshipSupport
    .persistence
    .supported,
  true
);

assert.deepEqual(
  combinedRelationshipContext
    .supportedRelationships,
  [
    "thermalStructure",
    "oceanMovement",
    "productivity",
    "structureInteraction",
    "waterCharacter",
    "openWaterOrganization",
    "persistence"
  ]
);

assert.equal(
  combinedRelationshipContext
    .summary
    .supportedCount,
  7
);

assert.equal(
  combinedRelationshipContext
    .rules
    .biologicalInferenceAllowed,
  false
);

console.log(
  "PASS Relationship Context recognizes combined environmental relationship support"
);



/**
 * ------------------------------------------------------------
 * Blue Marlin Relationship Context Integration
 * ------------------------------------------------------------
 */

const blueMarlinRelationshipContextEvidence = {
  groups: {
    temperature: {
      available: true,

      classification:
        "moderate-temperature-transition",

      values: {
        transitionStrength:
          "moderate",

        transitionDirection:
          "warming",

        patternConfidence:
          "moderate",

        spatialCoverage:
          "complete"
      }
    },

    current: {
      available: true,

      classification:
        "moderate",

      values: {
        strengthClassification:
          "moderate",

        speedKnots:
          1.2,

        directionDegrees:
          135,

        freshness:
          "fresh",

        sourceAvailability:
          "available"
      }
    },

    productivity: {
      available: true,

      classification:
        "productive-surface-water",

      values: {
        waterClassification:
          "productive-green-water",

        concentrationMgM3:
          0.25,

        freshness:
          "fresh"
      }
    },

    clarity: {
      available: true,

      classification:
        "transitional-surface-water",

      values: {
        waterClassification:
          "productive-blue-green-transition",

        concentrationMgM3:
          0.25,

        freshness:
          "fresh"
      }
    },

    structure: {
      available: false
    }
  }
};


const blueMarlinOpportunityWithoutContext = {
  opportunities: [
    {
      type:
        "current-supported-transition-candidate"
    },

    {
      type:
        "multi-signal-feature-candidate"
    }
  ],

  confidence: {
    score: 60,
    level: "Moderate"
  },

  limitations: []
};


const blueMarlinOpportunityWithContext = {
  ...blueMarlinOpportunityWithoutContext,

  pathwayClassification: {
    classification:
      "open-water",

    pathway:
      "environmental-organization",

    evidence: {
      structureAvailable:
        false,

      openWaterOrganized:
        true,

      persistenceAvailable:
        false
    }
  }
};


const blueMarlinBeforeRelationshipContext =
  assessBlueMarlinHabitat({
    oceanOpportunity:
      blueMarlinOpportunityWithoutContext,

    oceanEvidence:
      blueMarlinRelationshipContextEvidence,

    dataQuality: {
      score: 80,
      level: "High"
    }
  });


const blueMarlinAfterRelationshipContext =
  assessBlueMarlinHabitat({
    oceanOpportunity:
      blueMarlinOpportunityWithContext,

    oceanEvidence:
      blueMarlinRelationshipContextEvidence,

    dataQuality: {
      score: 80,
      level: "High"
    }
  });


assert.equal(
  blueMarlinAfterRelationshipContext
    .relationshipContext
    .pathway,
  "open-water"
);

assert.equal(
  blueMarlinAfterRelationshipContext
    .relationshipContext
    .environmentType,
  "environmental-organization"
);

assert.equal(
  blueMarlinAfterRelationshipContext
    .relationshipContext
    .relationshipSupport
    .openWaterOrganization
    .supported,
  true
);

assert.equal(
  blueMarlinAfterRelationshipContext
    .relationshipContext
    .relationshipSupport
    .structureInteraction
    .supported,
  false
);

assert.equal(
  blueMarlinAfterRelationshipContext
    .relationshipContext
    .rules
    .contextChangesScores,
  false
);

assert.equal(
  blueMarlinAfterRelationshipContext
    .relationshipContext
    .rules
    .biologicalInferenceAllowed,
  false
);


/*
 * Final and raw scores must remain identical.
 */
assert.equal(
  blueMarlinAfterRelationshipContext
    .summary
    .suitabilityScore,

  blueMarlinBeforeRelationshipContext
    .summary
    .suitabilityScore
);

assert.equal(
  blueMarlinAfterRelationshipContext
    .summary
    .rawSuitabilityScore,

  blueMarlinBeforeRelationshipContext
    .summary
    .rawSuitabilityScore
);


/*
 * Classification and confidence must remain identical.
 */
assert.equal(
  blueMarlinAfterRelationshipContext
    .summary
    .classification,

  blueMarlinBeforeRelationshipContext
    .summary
    .classification
);

assert.equal(
  blueMarlinAfterRelationshipContext
    .summary
    .confidenceScore,

  blueMarlinBeforeRelationshipContext
    .summary
    .confidenceScore
);

assert.equal(
  blueMarlinAfterRelationshipContext
    .summary
    .confidenceLevel,

  blueMarlinBeforeRelationshipContext
    .summary
    .confidenceLevel
);


/*
 * Every scored relationship group must remain identical.
 */
assert.deepEqual(
  blueMarlinAfterRelationshipContext
    .relationshipGroups,

  blueMarlinBeforeRelationshipContext
    .relationshipGroups
);


/*
 * Existing positive and negative scoring drivers must not change.
 */
assert.deepEqual(
  blueMarlinAfterRelationshipContext
    .positiveDrivers,

  blueMarlinBeforeRelationshipContext
    .positiveDrivers
);

assert.deepEqual(
  blueMarlinAfterRelationshipContext
    .negativeDrivers,

  blueMarlinBeforeRelationshipContext
    .negativeDrivers
);


/*
 * Confidence calculations and score components must not change.
 */
assert.deepEqual(
  blueMarlinAfterRelationshipContext
    .confidence
    .components,

  blueMarlinBeforeRelationshipContext
    .confidence
    .components
);

assert.equal(
  blueMarlinAfterRelationshipContext
    .confidence
    .score,

  blueMarlinBeforeRelationshipContext
    .confidence
    .score
);

assert.equal(
  blueMarlinAfterRelationshipContext
    .confidence
    .level,

  blueMarlinBeforeRelationshipContext
    .confidence
    .level
);


/*
 * The currently implemented relationship-group ceiling remains
 * unchanged at 95 points:
 *
 * Ocean Movement              20
 * Thermal Structure           25
 * Productivity and Prey       20
 * Structure Interaction       15
 * Water Character             10
 * Persistence                  5
 */
const blueMarlinMaximumScore =
  Object.values(
    blueMarlinAfterRelationshipContext
      .relationshipGroups
  )
    .reduce(
      (
        total,
        relationship
      ) =>
        total +
        (
          Number.isFinite(
            relationship
              ?.maximumScore
          )
            ? relationship
                .maximumScore
            : 0
        ),
      0
    );

assert.equal(
  blueMarlinMaximumScore,
  95
);

assert.equal(
  blueMarlinAfterRelationshipContext
    .methodVersion,
  "pelora-blue-marlin-hsm-v1.7"
);

console.log(
  "PASS Blue Marlin HSM exposes relationship context without changing habitat scoring"
);



/**
 * ------------------------------------------------------------
 * Blue Marlin Pathway Interpretation v1.0
 * ------------------------------------------------------------
 */

const insufficientBlueMarlinPathway =
  interpretBlueMarlinPathway();

assert.equal(
  insufficientBlueMarlinPathway
    .available,
  false
);

assert.equal(
  insufficientBlueMarlinPathway
    .classification,
  "insufficient-blue-marlin-pathway-evidence"
);

assert.deepEqual(
  insufficientBlueMarlinPathway
    .plausibleOpportunityTypes,
  []
);

assert.equal(
  insufficientBlueMarlinPathway
    .confirmedOpportunityType,
  null
);

assert.equal(
  insufficientBlueMarlinPathway
    .rules
    .changesHabitatScores,
  false
);

assert.equal(
  insufficientBlueMarlinPathway
    .rules
    .biologicalInferenceAllowed,
  false
);

console.log(
  "PASS Blue Marlin Pathway Interpretation remains conservative when pathway evidence is unavailable"
);


const openWaterBlueMarlinPathway =
  interpretBlueMarlinPathway({
    relationshipContext: {
      pathway:
        "open-water",

      environmentType:
        "environmental-organization",

      relationshipSupport: {
        openWaterOrganization: {
          supported: true
        },

        structureInteraction: {
          supported: false
        },

        persistence: {
          supported: false
        }
      }
    }
  });

assert.equal(
  openWaterBlueMarlinPathway
    .available,
  true
);

assert.equal(
  openWaterBlueMarlinPathway
    .classification,
  "open-water-blue-marlin-opportunity-context"
);

assert.deepEqual(
  openWaterBlueMarlinPathway
    .plausibleOpportunityTypes,
  [
    "current-convergence-feeding-pocket",
    "feeding-corridor",
    "eddy-edge-opportunity",
    "productive-water-boundary",
    "open-water-prey-aggregation"
  ]
);

assert.equal(
  openWaterBlueMarlinPathway
    .relationshipSupport
    .structureInteraction,
  false
);

assert.ok(
  openWaterBlueMarlinPathway
    .limitations
    .includes(
      "feature-persistence-not-established"
    )
);

console.log(
  "PASS Blue Marlin Pathway Interpretation recognizes first-class open-water opportunity context"
);


const structureBlueMarlinPathway =
  interpretBlueMarlinPathway({
    relationshipContext: {
      pathway:
        "structure-associated",

      environmentType:
        "physical-structure",

      relationshipSupport: {
        openWaterOrganization: {
          supported: false
        },

        structureInteraction: {
          supported: true
        },

        persistence: {
          supported: false
        }
      }
    }
  });

assert.equal(
  structureBlueMarlinPathway
    .available,
  true
);

assert.deepEqual(
  structureBlueMarlinPathway
    .plausibleOpportunityTypes,
  [
    "bathymetric-interaction-zone"
  ]
);

assert.equal(
  structureBlueMarlinPathway
    .rules
    .structureRequired,
  false
);

console.log(
  "PASS Blue Marlin Pathway Interpretation recognizes an independent structure-associated context"
);


const combinedBlueMarlinPathway =
  interpretBlueMarlinPathway({
    relationshipContext: {
      pathway:
        "combined",

      environmentType:
        "structure-and-open-water",

      relationshipSupport: {
        openWaterOrganization: {
          supported: true
        },

        structureInteraction: {
          supported: true
        },

        persistence: {
          supported: true
        }
      }
    }
  });

assert.equal(
  combinedBlueMarlinPathway
    .available,
  true
);

assert.equal(
  combinedBlueMarlinPathway
    .classification,
  "combined-blue-marlin-opportunity-context"
);

assert.ok(
  combinedBlueMarlinPathway
    .plausibleOpportunityTypes
    .includes(
      "bathymetric-interaction-zone"
    )
);

assert.ok(
  combinedBlueMarlinPathway
    .plausibleOpportunityTypes
    .includes(
      "feeding-corridor"
    )
);

assert.equal(
  combinedBlueMarlinPathway
    .relationshipSupport
    .persistence,
  true
);

assert.equal(
  combinedBlueMarlinPathway
    .confirmedOpportunityType,
  null
);

console.log(
  "PASS Blue Marlin Pathway Interpretation recognizes combined structure and open-water context"
);



/**
 * ------------------------------------------------------------
 * Blue Marlin Pathway Interpretation HSM Integration
 * ------------------------------------------------------------
 */

const pathwayInterpretationOceanEvidence = {
  groups: {
    temperature: {
      available: true,

      classification:
        "moderate-temperature-transition",

      values: {
        transitionStrength:
          "moderate",

        transitionDirection:
          "warming",

        patternConfidence:
          "moderate",

        spatialCoverage:
          "complete"
      }
    },

    current: {
      available: true,

      classification:
        "moderate",

      values: {
        strengthClassification:
          "moderate",

        speedKnots:
          1.2,

        directionDegrees:
          135,

        freshness:
          "fresh",

        sourceAvailability:
          "available"
      }
    },

    productivity: {
      available: true,

      classification:
        "productive-surface-water",

      values: {
        waterClassification:
          "productive-green-water",

        concentrationMgM3:
          0.25,

        freshness:
          "fresh"
      }
    },

    clarity: {
      available: true,

      classification:
        "transitional-surface-water",

      values: {
        waterClassification:
          "productive-blue-green-transition",

        concentrationMgM3:
          0.25,

        freshness:
          "fresh"
      }
    },

    structure: {
      available: false
    }
  }
};


const pathwayInterpretationBaseOpportunity = {
  opportunities: [
    {
      type:
        "current-supported-transition-candidate"
    },

    {
      type:
        "multi-signal-feature-candidate"
    }
  ],

  confidence: {
    score: 60,
    level: "Moderate"
  },

  limitations: []
};


const habitatWithoutResolvedPathway =
  assessBlueMarlinHabitat({
    oceanOpportunity:
      pathwayInterpretationBaseOpportunity,

    oceanEvidence:
      pathwayInterpretationOceanEvidence,

    dataQuality: {
      score: 80,
      level: "High"
    }
  });


const habitatWithResolvedPathway =
  assessBlueMarlinHabitat({
    oceanOpportunity: {
      ...pathwayInterpretationBaseOpportunity,

      pathwayClassification: {
        classification:
          "open-water",

        pathway:
          "environmental-organization",

        evidence: {
          structureAvailable:
            false,

          openWaterOrganized:
            true,

          persistenceAvailable:
            false
        }
      }
    },

    oceanEvidence:
      pathwayInterpretationOceanEvidence,

    dataQuality: {
      score: 80,
      level: "High"
    }
  });


assert.equal(
  habitatWithResolvedPathway
    .speciesPathwayInterpretation
    .species,
  "blue-marlin"
);

assert.equal(
  habitatWithResolvedPathway
    .speciesPathwayInterpretation
    .environmentalPathway,
  "open-water"
);

assert.equal(
  habitatWithResolvedPathway
    .speciesPathwayInterpretation
    .classification,
  "open-water-blue-marlin-opportunity-context"
);

assert.ok(
  habitatWithResolvedPathway
    .speciesPathwayInterpretation
    .plausibleOpportunityTypes
    .includes(
      "feeding-corridor"
    )
);

assert.equal(
  habitatWithResolvedPathway
    .speciesPathwayInterpretation
    .confirmedOpportunityType,
  null
);

assert.equal(
  habitatWithResolvedPathway
    .speciesPathwayInterpretation
    .rules
    .changesHabitatScores,
  false
);


/*
 * No final or raw habitat score may change.
 */
assert.equal(
  habitatWithResolvedPathway
    .summary
    .suitabilityScore,

  habitatWithoutResolvedPathway
    .summary
    .suitabilityScore
);

assert.equal(
  habitatWithResolvedPathway
    .summary
    .rawSuitabilityScore,

  habitatWithoutResolvedPathway
    .summary
    .rawSuitabilityScore
);


/*
 * No relationship-group score may change.
 */
assert.deepEqual(
  habitatWithResolvedPathway
    .relationshipGroups,

  habitatWithoutResolvedPathway
    .relationshipGroups
);


/*
 * No classification or confidence result may change.
 */
assert.equal(
  habitatWithResolvedPathway
    .summary
    .classification,

  habitatWithoutResolvedPathway
    .summary
    .classification
);

assert.deepEqual(
  habitatWithResolvedPathway
    .confidence,

  habitatWithoutResolvedPathway
    .confidence
);


/*
 * Existing scoring drivers must remain untouched.
 */
assert.deepEqual(
  habitatWithResolvedPathway
    .positiveDrivers,

  habitatWithoutResolvedPathway
    .positiveDrivers
);

assert.deepEqual(
  habitatWithResolvedPathway
    .negativeDrivers,

  habitatWithoutResolvedPathway
    .negativeDrivers
);


assert.equal(
  habitatWithResolvedPathway
    .methodVersion,
  "pelora-blue-marlin-hsm-v1.7"
);

console.log(
  "PASS Blue Marlin HSM exposes species pathway interpretation without changing scoring"
);



/**
 * ------------------------------------------------------------
 * Blue Marlin Opportunity Type Resolution v1.0
 * ------------------------------------------------------------
 */

const insufficientBlueMarlinTypeResolution =
  resolveBlueMarlinOpportunityType();

assert.equal(
  insufficientBlueMarlinTypeResolution
    .available,
  false
);

assert.equal(
  insufficientBlueMarlinTypeResolution
    .leadingCandidate,
  null
);

assert.equal(
  insufficientBlueMarlinTypeResolution
    .resolvedType,
  null
);

assert.equal(
  insufficientBlueMarlinTypeResolution
    .confirmedType,
  null
);

assert.equal(
  insufficientBlueMarlinTypeResolution
    .confidence,
  "insufficient"
);

assert.equal(
  insufficientBlueMarlinTypeResolution
    .rules
    .changesHabitatScores,
  false
);

assert.equal(
  insufficientBlueMarlinTypeResolution
    .rules
    .confirmedTypeAllowed,
  false
);

console.log(
  "PASS Blue Marlin Opportunity Type Resolution remains conservative when evidence is unavailable"
);


const unresolvedBlueMarlinCandidates =
  resolveBlueMarlinOpportunityType({
    speciesPathwayInterpretation: {
      environmentalPathway:
        "open-water",

      plausibleOpportunityTypes: [
        "feeding-corridor",
        "open-water-prey-aggregation"
      ]
    },

    relationshipContext: {
      pathway:
        "open-water",

      relationshipSupport: {
        openWaterOrganization: {
          supported: true
        },

        structureInteraction: {
          supported: false
        },

        persistence: {
          supported: false
        }
      }
    },

    oceanEvidence: {
      groups: {}
    },

    oceanOpportunity: {
      opportunities: []
    }
  });

assert.equal(
  unresolvedBlueMarlinCandidates
    .available,
  true
);

assert.equal(
  unresolvedBlueMarlinCandidates
    .leadingCandidate,
  null
);

assert.equal(
  unresolvedBlueMarlinCandidates
    .classification,
  "multiple-unresolved-opportunity-type-candidates"
);

assert.equal(
  unresolvedBlueMarlinCandidates
    .resolvedType,
  null
);

console.log(
  "PASS Blue Marlin Opportunity Type Resolution preserves unresolved candidate ambiguity"
);


const feedingCorridorResolution =
  resolveBlueMarlinOpportunityType({
    speciesPathwayInterpretation: {
      environmentalPathway:
        "open-water",

      plausibleOpportunityTypes: [
        "feeding-corridor",
        "current-convergence-feeding-pocket",
        "eddy-edge-opportunity"
      ]
    },

    relationshipContext: {
      pathway:
        "open-water",

      relationshipSupport: {
        openWaterOrganization: {
          supported: true
        },

        structureInteraction: {
          supported: false
        },

        persistence: {
          supported: false
        }
      }
    },

    oceanEvidence: {
      groups: {
        current: {
          available: true,

          classification:
            "strong",

          values: {
            strengthClassification:
              "strong"
          }
        },

        temperature: {
          available: true,

          classification:
            "moderate-temperature-transition",

          values: {
            transitionStrength:
              "moderate"
          }
        }
      }
    },

    oceanOpportunity: {
      opportunities: [
        {
          type:
            "current-supported-transition-candidate"
        },

        {
          type:
            "multi-signal-feature-candidate"
        }
      ]
    }
  });

assert.equal(
  feedingCorridorResolution
    .leadingCandidate,
  "feeding-corridor"
);

assert.equal(
  feedingCorridorResolution
    .confidence,
  "moderate"
);

assert.equal(
  feedingCorridorResolution
    .resolvedType,
  null
);

assert.equal(
  feedingCorridorResolution
    .confirmedType,
  null
);

assert.ok(
  feedingCorridorResolution
    .evidenceFor
    .includes(
      "organized-current-support"
    )
);

assert.ok(
  feedingCorridorResolution
    .evidenceFor
    .includes(
      "thermal-boundary-support"
    )
);

console.log(
  "PASS Blue Marlin Opportunity Type Resolution identifies a feeding-corridor leading candidate"
);


const productiveBoundaryResolution =
  resolveBlueMarlinOpportunityType({
    speciesPathwayInterpretation: {
      environmentalPathway:
        "open-water",

      plausibleOpportunityTypes: [
        "feeding-corridor",
        "productive-water-boundary",
        "open-water-prey-aggregation"
      ]
    },

    relationshipContext: {
      pathway:
        "open-water",

      relationshipSupport: {
        openWaterOrganization: {
          supported: true
        },

        structureInteraction: {
          supported: false
        },

        persistence: {
          supported: false
        }
      }
    },

    oceanEvidence: {
      groups: {
        current: {
          available: false
        },

        temperature: {
          available: true,

          classification:
            "moderate-temperature-transition",

          values: {
            transitionStrength:
              "moderate"
          }
        },

        productivity: {
          available: true,

          classification:
            "productive-surface-water",

          values: {
            waterClassification:
              "productive-blue-green-transition"
          }
        },

        clarity: {
          available: true,

          classification:
            "transitional-surface-water",

          values: {
            waterClassification:
              "productive-blue-green-transition"
          }
        }
      }
    },

    oceanOpportunity: {
      opportunities: [
        {
          type:
            "surface-water-boundary-candidate"
        },

        {
          type:
            "multi-signal-feature-candidate"
        }
      ]
    }
  });

assert.equal(
  productiveBoundaryResolution
    .leadingCandidate,
  "productive-water-boundary"
);

assert.equal(
  productiveBoundaryResolution
    .confidence,
  "moderate"
);

assert.ok(
  productiveBoundaryResolution
    .evidenceFor
    .includes(
      "productivity-or-water-character-boundary-supported"
    )
);

assert.equal(
  productiveBoundaryResolution
    .confirmedType,
  null
);

console.log(
  "PASS Blue Marlin Opportunity Type Resolution identifies a productive-water-boundary leading candidate"
);


const bathymetricResolution =
  resolveBlueMarlinOpportunityType({
    speciesPathwayInterpretation: {
      environmentalPathway:
        "structure-associated",

      plausibleOpportunityTypes: [
        "bathymetric-interaction-zone"
      ]
    },

    relationshipContext: {
      pathway:
        "structure-associated",

      relationshipSupport: {
        openWaterOrganization: {
          supported: false
        },

        structureInteraction: {
          supported: true,

          interactionVerified:
            false
        },

        persistence: {
          supported: false
        }
      }
    },

    oceanEvidence: {
      groups: {
        current: {
          available: true,

          classification:
            "moderate",

          values: {
            strengthClassification:
              "moderate"
          }
        },

        structure: {
          available: true
        }
      }
    },

    oceanOpportunity: {
      opportunities: []
    }
  });

assert.equal(
  bathymetricResolution
    .leadingCandidate,
  "bathymetric-interaction-zone"
);

assert.equal(
  bathymetricResolution
    .confidence,
  "limited"
);

assert.ok(
  bathymetricResolution
    .evidenceMissing
    .includes(
      "current-structure-interaction-not-verified"
    )
);

assert.equal(
  bathymetricResolution
    .resolvedType,
  null
);

console.log(
  "PASS Blue Marlin Opportunity Type Resolution identifies a preliminary bathymetric candidate without claiming interaction"
);



/**
 * ------------------------------------------------------------
 * Blue Marlin Opportunity Type Resolution HSM Integration
 * ------------------------------------------------------------
 */

const typeResolutionOceanEvidence = {
  groups: {
    temperature: {
      available: true,

      classification:
        "moderate-temperature-transition",

      values: {
        transitionStrength:
          "moderate",

        transitionDirection:
          "warming",

        patternConfidence:
          "moderate",

        spatialCoverage:
          "complete"
      }
    },

    current: {
      available: true,

      classification:
        "strong",

      values: {
        strengthClassification:
          "strong",

        speedKnots:
          1.8,

        directionDegrees:
          135,

        freshness:
          "fresh",

        sourceAvailability:
          "available"
      }
    },

    productivity: {
      available: true,

      classification:
        "productive-surface-water",

      values: {
        waterClassification:
          "productive-blue-green-transition",

        concentrationMgM3:
          0.25,

        freshness:
          "fresh"
      }
    },

    clarity: {
      available: true,

      classification:
        "transitional-surface-water",

      values: {
        waterClassification:
          "productive-blue-green-transition",

        concentrationMgM3:
          0.25,

        freshness:
          "fresh"
      }
    },

    structure: {
      available: false
    }
  }
};


const typeResolutionBaseOpportunity = {
  opportunities: [
    {
      type:
        "current-supported-transition-candidate"
    },

    {
      type:
        "multi-signal-feature-candidate"
    }
  ],

  confidence: {
    score: 60,
    level: "Moderate"
  },

  limitations: []
};


const habitatWithoutTypeResolutionPathway =
  assessBlueMarlinHabitat({
    oceanOpportunity:
      typeResolutionBaseOpportunity,

    oceanEvidence:
      typeResolutionOceanEvidence,

    dataQuality: {
      score: 80,
      level: "High"
    }
  });


const habitatWithTypeResolutionPathway =
  assessBlueMarlinHabitat({
    oceanOpportunity: {
      ...typeResolutionBaseOpportunity,

      pathwayClassification: {
        classification:
          "open-water",

        pathway:
          "environmental-organization",

        evidence: {
          structureAvailable:
            false,

          openWaterOrganized:
            true,

          persistenceAvailable:
            false
        }
      }
    },

    oceanEvidence:
      typeResolutionOceanEvidence,

    dataQuality: {
      score: 80,
      level: "High"
    }
  });


assert.equal(
  habitatWithTypeResolutionPathway
    .opportunityTypeResolution
    .species,
  "blue-marlin"
);

assert.equal(
  habitatWithTypeResolutionPathway
    .opportunityTypeResolution
    .resolvedType,
  null
);

assert.equal(
  habitatWithTypeResolutionPathway
    .opportunityTypeResolution
    .confirmedType,
  null
);

assert.equal(
  habitatWithTypeResolutionPathway
    .opportunityTypeResolution
    .leadingCandidate,
  "productive-water-boundary"
);

assert.ok(
  habitatWithTypeResolutionPathway
    .opportunityTypeResolution
    .candidateTypes
    .includes(
      "productive-water-boundary"
    )
);

assert.equal(
  habitatWithTypeResolutionPathway
    .opportunityTypeResolution
    .rules
    .changesHabitatScores,
  false
);


/*
 * Final and raw habitat scores must remain identical.
 */
assert.equal(
  habitatWithTypeResolutionPathway
    .summary
    .suitabilityScore,

  habitatWithoutTypeResolutionPathway
    .summary
    .suitabilityScore
);

assert.equal(
  habitatWithTypeResolutionPathway
    .summary
    .rawSuitabilityScore,

  habitatWithoutTypeResolutionPathway
    .summary
    .rawSuitabilityScore
);


/*
 * All relationship groups and model ceilings must remain
 * identical.
 */
assert.deepEqual(
  habitatWithTypeResolutionPathway
    .relationshipGroups,

  habitatWithoutTypeResolutionPathway
    .relationshipGroups
);


/*
 * Habitat classification and confidence must remain identical.
 */
assert.equal(
  habitatWithTypeResolutionPathway
    .summary
    .classification,

  habitatWithoutTypeResolutionPathway
    .summary
    .classification
);

assert.deepEqual(
  habitatWithTypeResolutionPathway
    .confidence,

  habitatWithoutTypeResolutionPathway
    .confidence
);


/*
 * Existing score drivers must remain untouched.
 */
assert.deepEqual(
  habitatWithTypeResolutionPathway
    .positiveDrivers,

  habitatWithoutTypeResolutionPathway
    .positiveDrivers
);

assert.deepEqual(
  habitatWithTypeResolutionPathway
    .negativeDrivers,

  habitatWithoutTypeResolutionPathway
    .negativeDrivers
);


assert.equal(
  habitatWithTypeResolutionPathway
    .methodVersion,
  "pelora-blue-marlin-hsm-v1.7"
);

console.log(
  "PASS Blue Marlin HSM exposes opportunity type resolution without changing scoring"
);



/**
 * ------------------------------------------------------------
 * Generic Species Opportunity Resolver Architecture
 * ------------------------------------------------------------
 */

assert.equal(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .species,
  "blue-marlin"
);

assert.equal(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .rules
    .changesHabitatScores,
  false
);

assert.equal(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .rules
    .biologicalInferenceAllowed,
  false
);

assert.equal(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .opportunityTypes
    ["feeding-corridor"]
    .signals
    .organizedCurrent,
  "strong"
);

assert.equal(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .opportunityTypes
    ["productive-water-boundary"]
    .signals
    .productivityBoundary,
  "critical"
);


const genericBlueMarlinResolution =
  resolveSpeciesOpportunityType({
    speciesProfile:
      BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE,

    speciesPathwayInterpretation: {
      environmentalPathway:
        "open-water",

      plausibleOpportunityTypes: [
        "feeding-corridor",
        "productive-water-boundary",
        "open-water-prey-aggregation"
      ]
    },

    relationshipContext: {
      pathway:
        "open-water",

      relationshipSupport: {
        openWaterOrganization: {
          supported: true
        },

        structureInteraction: {
          supported: false
        },

        persistence: {
          supported: false
        }
      }
    },

    oceanEvidence: {
      groups: {
        temperature: {
          available: true,

          classification:
            "moderate-temperature-transition",

          values: {
            transitionStrength:
              "moderate"
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

        productivity: {
          available: true,

          classification:
            "productive-surface-water",

          values: {
            waterClassification:
              "productive-blue-green-transition"
          }
        },

        clarity: {
          available: true,

          classification:
            "transitional-surface-water",

          values: {
            waterClassification:
              "productive-blue-green-transition"
          }
        }
      }
    },

    oceanOpportunity: {
      opportunities: [
        {
          type:
            "current-supported-transition-candidate"
        },

        {
          type:
            "multi-signal-feature-candidate"
        }
      ]
    }
  });


assert.equal(
  genericBlueMarlinResolution
    .species,
  "blue-marlin"
);

assert.equal(
  genericBlueMarlinResolution
    .leadingCandidate,
  "productive-water-boundary"
);

assert.equal(
  genericBlueMarlinResolution
    .resolvedType,
  null
);

assert.equal(
  genericBlueMarlinResolution
    .confirmedType,
  null
);

assert.equal(
  genericBlueMarlinResolution
    .rules
    .changesHabitatScores,
  false
);

assert.equal(
  genericBlueMarlinResolution
    .knowledgeProfile
    .methodVersion,
  "pelora-blue-marlin-species-knowledge-profile-v1.1"
);

assert.equal(
  genericBlueMarlinResolution
    .methodVersion,
  "pelora-species-opportunity-type-resolution-v1.2"
);

console.log(
  "PASS generic species opportunity resolver uses governed Blue Marlin profile"
);


const wrappedBlueMarlinResolution =
  resolveBlueMarlinOpportunityType({
    speciesPathwayInterpretation: {
      environmentalPathway:
        "open-water",

      plausibleOpportunityTypes: [
        "feeding-corridor",
        "productive-water-boundary",
        "open-water-prey-aggregation"
      ]
    },

    relationshipContext: {
      pathway:
        "open-water",

      relationshipSupport: {
        openWaterOrganization: {
          supported: true
        },

        structureInteraction: {
          supported: false
        },

        persistence: {
          supported: false
        }
      }
    },

    oceanEvidence: {
      groups: {
        temperature: {
          available: true,

          classification:
            "moderate-temperature-transition",

          values: {
            transitionStrength:
              "moderate"
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

        productivity: {
          available: true,

          classification:
            "productive-surface-water",

          values: {
            waterClassification:
              "productive-blue-green-transition"
          }
        },

        clarity: {
          available: true,

          classification:
            "transitional-surface-water",

          values: {
            waterClassification:
              "productive-blue-green-transition"
          }
        }
      }
    },

    oceanOpportunity: {
      opportunities: [
        {
          type:
            "current-supported-transition-candidate"
        },

        {
          type:
            "multi-signal-feature-candidate"
        }
      ]
    }
  });


assert.deepEqual(
  wrappedBlueMarlinResolution
    .rankedCandidates,

  genericBlueMarlinResolution
    .rankedCandidates
);

assert.equal(
  wrappedBlueMarlinResolution
    .leadingCandidate,

  genericBlueMarlinResolution
    .leadingCandidate
);

assert.equal(
  wrappedBlueMarlinResolution
    .methodVersion,
  "pelora-blue-marlin-opportunity-type-resolution-v1.3"
);

console.log(
  "PASS Blue Marlin resolver wrapper preserves generic resolution behavior"
);



/**
 * ------------------------------------------------------------
 * Species Knowledge Framework v1.0
 * ------------------------------------------------------------
 */

assert.deepEqual(
  SPECIES_RELATIONSHIP_IMPORTANCE,
  {
    unavailable: 0,
    supporting: 1,
    moderate: 2,
    strong: 3,
    critical: 5
  }
);

assert.equal(
  resolveRelationshipImportance(
    "critical"
  ),
  5
);

assert.equal(
  resolveRelationshipImportance(
    "strong"
  ),
  3
);

assert.equal(
  resolveRelationshipImportance(
    "moderate"
  ),
  2
);

assert.equal(
  resolveRelationshipImportance(
    "supporting"
  ),
  1
);

assert.equal(
  resolveRelationshipImportance(
    "unknown"
  ),
  0
);

console.log(
  "PASS Species Knowledge Framework translates governed importance levels"
);


assert.equal(
  SPECIES_KNOWLEDGE_FRAMEWORK
    .methodVersion,
  "pelora-species-knowledge-framework-v1.1"
);

assert.ok(
  SPECIES_KNOWLEDGE_FRAMEWORK
    .requiredRelationshipGroups
    .includes(
      "oceanMovement"
    )
);

assert.ok(
  SPECIES_KNOWLEDGE_FRAMEWORK
    .requiredRelationshipGroups
    .includes(
      "persistence"
    )
);

console.log(
  "PASS Species Knowledge Framework defines canonical relationship groups"
);


const blueMarlinProfileValidation =
  validateSpeciesKnowledgeProfile(
    BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
  );

assert.equal(
  blueMarlinProfileValidation
    .valid,
  true
);

assert.deepEqual(
  blueMarlinProfileValidation
    .errors,
  []
);

assert.ok(
  blueMarlinProfileValidation
    .warnings
    .includes(
      "profile:no-scientific-references-recorded"
    )
);

assert.ok(
  blueMarlinProfileValidation
    .warnings
    .includes(
      "profile:not-yet-formally-reviewed"
    )
);

assert.equal(
  blueMarlinProfileValidation
    .knowledgeStatus,
  "provisional"
);

assert.equal(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .commonName,
  "Blue Marlin"
);

assert.equal(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .scientificName,
  "Makaira nigricans"
);

assert.equal(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .relationshipGroups
    .structureInteraction
    .required,
  false
);

assert.equal(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .opportunityTypes
    ["feeding-corridor"]
    .signals
    .organizedCurrent,
  "strong"
);

assert.equal(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .opportunityTypes
    ["productive-water-boundary"]
    .signals
    .productivityBoundary,
  "critical"
);

console.log(
  "PASS Species Knowledge Framework validates the governed Blue Marlin profile"
);


const invalidSpeciesProfile = {
  species:
    "test-species",

  opportunityTypes: {
    "test-opportunity": {
      signals: {
        currentSupport:
          "extreme"
      }
    }
  },

  rules: {
    biologicalInferenceAllowed:
      true,

    confirmedTypeAllowed:
      true,

    changesHabitatScores:
      true
  }
};


const invalidProfileValidation =
  validateSpeciesKnowledgeProfile(
    invalidSpeciesProfile
  );

assert.equal(
  invalidProfileValidation
    .valid,
  false
);

assert.ok(
  invalidProfileValidation
    .errors
    .includes(
      "invalid-relationship-importance:test-opportunity:currentSupport"
    )
);

assert.ok(
  invalidProfileValidation
    .errors
    .includes(
      "invalid-required-rule:biologicalInferenceAllowed"
    )
);

assert.ok(
  invalidProfileValidation
    .errors
    .includes(
      "confirmed-opportunity-types-are-not-allowed"
    )
);

console.log(
  "PASS Species Knowledge Framework rejects unsafe or incomplete species profiles"
);


const invalidProfileResolution =
  resolveSpeciesOpportunityType({
    speciesProfile:
      invalidSpeciesProfile,

    speciesPathwayInterpretation: {
      environmentalPathway:
        "open-water",

      plausibleOpportunityTypes: [
        "test-opportunity"
      ]
    }
  });


assert.equal(
  invalidProfileResolution
    .available,
  false
);

assert.equal(
  invalidProfileResolution
    .classification,
  "species-knowledge-profile-invalid"
);

assert.equal(
  invalidProfileResolution
    .leadingCandidate,
  null
);

assert.equal(
  invalidProfileResolution
    .confirmedType,
  null
);

assert.equal(
  invalidProfileResolution
    .rules
    .rankingAllowed,
  false
);

assert.equal(
  invalidProfileResolution
    .rules
    .changesHabitatScores,
  false
);

console.log(
  "PASS generic resolver refuses to use an invalid species knowledge profile"
);



/**
 * ------------------------------------------------------------
 * Species Knowledge Provenance and Governance v1.0
 * ------------------------------------------------------------
 */

assert.equal(
  SPECIES_KNOWLEDGE_PROVENANCE
    .methodVersion,
  "pelora-species-knowledge-provenance-v1.0"
);

assert.ok(
  SPECIES_KNOWLEDGE_PROVENANCE
    .allowedEvidenceStatuses
    .includes(
      "provisional"
    )
);

assert.ok(
  SPECIES_KNOWLEDGE_PROVENANCE
    .allowedSourceTypes
    .includes(
      "peer-reviewed-research"
    )
);

assert.ok(
  SPECIES_KNOWLEDGE_PROVENANCE
    .allowedSourceTypes
    .includes(
      "captain-observation"
    )
);

console.log(
  "PASS Species Knowledge Provenance defines governed vocabularies"
);


const provisionalProvenance =
  validateKnowledgeProvenance({
    rationale:
      "This relationship is retained as a provisional environmental interpretation pending formal scientific review.",

    evidenceStatus:
      "provisional",

    sourceType:
      "expert-knowledge",

    references: [],

    reviewedBy: [],

    lastReviewedAt:
      null,

    regionalScope:
      "global",

    seasonalScope:
      "year-round",

    limitations: [
      "formal-review-not-yet-complete"
    ]
  });


assert.equal(
  provisionalProvenance
    .valid,
  true
);

assert.ok(
  provisionalProvenance
    .warnings
    .includes(
      "knowledge-provenance:no-scientific-references-recorded"
    )
);

assert.ok(
  provisionalProvenance
    .warnings
    .includes(
      "knowledge-provenance:not-yet-formally-reviewed"
    )
);

console.log(
  "PASS provisional knowledge remains valid while review gaps are disclosed"
);


const unsafeValidatedProvenance =
  validateKnowledgeProvenance({
    rationale:
      "This record incorrectly claims validation without attaching a scientific reference or reviewer.",

    evidenceStatus:
      "validated",

    sourceType:
      "expert-knowledge",

    references: [],

    reviewedBy: [],

    lastReviewedAt:
      null,

    regionalScope:
      "global",

    seasonalScope:
      "year-round",

    limitations: []
  });


assert.equal(
  unsafeValidatedProvenance
    .valid,
  false
);

assert.ok(
  unsafeValidatedProvenance
    .errors
    .includes(
      "knowledge-provenance:reviewed-status-requires-reviewer"
    )
);

assert.ok(
  unsafeValidatedProvenance
    .errors
    .includes(
      "knowledge-provenance:validated-status-requires-reference"
    )
);

console.log(
  "PASS validated knowledge requires references and formal review"
);


assert.equal(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .knowledgeProvenance
    .evidenceStatus,
  "provisional"
);

assert.equal(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .knowledgeProvenance
    .sourceType,
  "expert-knowledge"
);

assert.equal(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .knowledgeProvenance
    .regionalScope,
  "global"
);

assert.ok(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .knowledgeProvenance
    .limitations
    .includes(
      "formal-literature-review-not-yet-attached"
    )
);

assert.equal(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .relationshipGroups
    .oceanMovement
    .provenance
    .evidenceStatus,
  "provisional"
);

assert.equal(
  BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
    .opportunityTypes
    ["feeding-corridor"]
    .provenance
    .evidenceStatus,
  "provisional"
);

console.log(
  "PASS Blue Marlin profile exposes governed knowledge provenance"
);


const governedBlueMarlinValidation =
  validateSpeciesKnowledgeProfile(
    BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE
  );

assert.equal(
  governedBlueMarlinValidation
    .valid,
  true
);

assert.ok(
  governedBlueMarlinValidation
    .warnings
    .some(
      warning =>
        warning.includes(
          "no-scientific-references-recorded"
        )
    )
);

assert.ok(
  governedBlueMarlinValidation
    .warnings
    .some(
      warning =>
        warning.includes(
          "not-yet-formally-reviewed"
        )
    )
);

console.log(
  "PASS Species Knowledge Framework preserves provenance warnings without invalidating provisional knowledge"
);


const governedResolution =
  resolveSpeciesOpportunityType({
    speciesProfile:
      BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE,

    speciesPathwayInterpretation: {
      environmentalPathway:
        "open-water",

      plausibleOpportunityTypes: [
        "feeding-corridor"
      ]
    },

    relationshipContext: {
      pathway:
        "open-water",

      relationshipSupport: {
        openWaterOrganization: {
          supported:
            true
        },

        persistence: {
          supported:
            false
        }
      }
    },

    oceanEvidence: {
      groups: {
        current: {
          available:
            true,

          classification:
            "strong",

          values: {
            strengthClassification:
              "strong"
          }
        },

        temperature: {
          available:
            true,

          classification:
            "moderate-temperature-transition",

          values: {
            transitionStrength:
              "moderate"
          }
        }
      }
    },

    oceanOpportunity: {
      opportunities: [
        {
          type:
            "current-supported-transition-candidate"
        }
      ]
    }
  });


assert.equal(
  governedResolution
    .knowledgeProfile
    .provenance
    .evidenceStatus,
  "provisional"
);

assert.equal(
  governedResolution
    .knowledgeProfile
    .provenance
    .referenceCount,
  0
);

assert.equal(
  governedResolution
    .knowledgeProfile
    .provenance
    .reviewerCount,
  0
);

assert.equal(
  governedResolution
    .rules
    .changesHabitatScores,
  false
);

console.log(
  "PASS generic resolver exposes provenance without changing resolution behavior"
);



const explicitNullReviewDateValidation =
  validateKnowledgeProvenance({
    rationale:
      "This provisional relationship has not yet received formal review, so the review date is explicitly recorded as null.",

    evidenceStatus:
      "provisional",

    sourceType:
      "expert-knowledge",

    references: [],

    reviewedBy: [],

    lastReviewedAt:
      null,

    regionalScope:
      "global",

    seasonalScope:
      "year-round",

    limitations: [
      "formal-review-not-yet-complete"
    ]
  });


assert.equal(
  explicitNullReviewDateValidation
    .valid,
  true
);

assert.equal(
  explicitNullReviewDateValidation
    .errors
    .includes(
      "knowledge-provenance:missing-provenance-field:lastReviewedAt"
    ),
  false
);

console.log(
  "PASS provenance distinguishes an explicit null review date from a missing review field"
);


const missingReviewDateValidation =
  validateKnowledgeProvenance({
    rationale:
      "This record intentionally omits the review-date field so the validator can distinguish absence from an explicit null value.",

    evidenceStatus:
      "provisional",

    sourceType:
      "expert-knowledge",

    references: [],

    reviewedBy: [],

    regionalScope:
      "global",

    seasonalScope:
      "year-round",

    limitations: [
      "formal-review-not-yet-complete"
    ]
  });


assert.equal(
  missingReviewDateValidation
    .valid,
  false
);

assert.ok(
  missingReviewDateValidation
    .errors
    .includes(
      "knowledge-provenance:missing-provenance-field:lastReviewedAt"
    )
);

console.log(
  "PASS provenance rejects a genuinely missing review-date field"
);



/*
 * ------------------------------------------------------------
 * Confidence Governance Framework v1.0
 * ------------------------------------------------------------
 */

assert.deepEqual(
  Object.values(
    CONFIDENCE_DOMAINS
  ),
  [
    "data",
    "evidence",
    "opportunity",
    "relationship",
    "model"
  ]
);

assert.deepEqual(
  CONFIDENCE_LEVELS,
  [
    "Unavailable",
    "Very Low",
    "Low",
    "Moderate",
    "High",
    "Very High"
  ]
);

assert.deepEqual(
  Object.keys(
    CONFIDENCE_SCALES
  ),
  [
    "normalized",
    "percentage"
  ]
);

assert.equal(
  CONFIDENCE_GOVERNANCE_RULES
    .confidenceMayIncreaseOnlyWithIndependentEvidence,
  true
);

assert.equal(
  CONFIDENCE_GOVERNANCE_FRAMEWORK
    .rules
    .changesExistingConfidenceScores,
  false
);


const normalizedConfidenceValidation =
  validateConfidenceContract({
    domain:
      "relationship",

    score:
      0.72,

    scale:
      "normalized",

    level:
      "High",

    reasons: [
      "relationship-supported-by-environmental-evidence"
    ],

    limitations: [
      "persistence-evidence-unavailable"
    ],

    components: {},

    methodVersion:
      "test-relationship-confidence-v1.0"
  });


assert.equal(
  normalizedConfidenceValidation
    .valid,
  true
);

assert.equal(
  normalizedConfidenceValidation
    .normalizedScore,
  0.72
);

assert.equal(
  normalizedConfidenceValidation
    .canonicalLevel,
  "High"
);


const percentageConfidenceValidation =
  validateConfidenceContract({
    domain:
      "evidence",

    score:
      72,

    scale:
      "percentage",

    level:
      "High",

    reasons: [
      "multiple-evidence-groups-available"
    ],

    limitations: [
      "persistence-evidence-unavailable"
    ],

    components: {},

    methodVersion:
      "test-evidence-confidence-v1.0"
  });


assert.equal(
  percentageConfidenceValidation
    .valid,
  true
);

assert.equal(
  percentageConfidenceValidation
    .normalizedScore,
  0.72
);

assert.equal(
  normalizeConfidenceScore(
    72,
    "percentage"
  ),
  normalizeConfidenceScore(
    0.72,
    "normalized"
  )
);

assert.equal(
  confidenceLevelForScore(
    72,
    "percentage"
  ),
  "High"
);

console.log(
  "PASS Confidence Governance Framework validates normalized and percentage contracts"
);


const invalidConfidenceDomain =
  validateConfidenceContract({
    domain:
      "biological-certainty",

    score:
      60,

    scale:
      "percentage",

    level:
      "Moderate",

    reasons: [
      "test"
    ],

    limitations: [
      "test"
    ],

    methodVersion:
      "test-invalid-domain-v1.0"
  });


assert.equal(
  invalidConfidenceDomain
    .valid,
  false
);

assert.ok(
  invalidConfidenceDomain
    .errors
    .includes(
      "confidence:invalid-confidence-domain"
    )
);

console.log(
  "PASS Confidence Governance Framework rejects invalid domains"
);


const invalidConfidenceScore =
  validateConfidenceContract({
    domain:
      "data",

    score:
      120,

    scale:
      "percentage",

    level:
      "Very High",

    reasons: [
      "test"
    ],

    limitations: [
      "test"
    ],

    methodVersion:
      "test-invalid-score-v1.0"
  });


assert.equal(
  invalidConfidenceScore
    .valid,
  false
);

assert.ok(
  invalidConfidenceScore
    .errors
    .includes(
      "confidence:confidence-score-outside-declared-scale"
    )
);

console.log(
  "PASS Confidence Governance Framework rejects out-of-range scores"
);


const invalidConfidenceScale =
  validateConfidenceContract({
    domain:
      "evidence",

    score:
      50,

    scale:
      "ordinal",

    level:
      "Moderate",

    reasons: [
      "test"
    ],

    limitations: [
      "test"
    ],

    methodVersion:
      "test-invalid-scale-v1.0"
  });


assert.equal(
  invalidConfidenceScale
    .valid,
  false
);

assert.ok(
  invalidConfidenceScale
    .errors
    .includes(
      "confidence:invalid-confidence-scale"
    )
);

console.log(
  "PASS Confidence Governance Framework rejects invalid scales"
);


const mismatchedConfidenceLevel =
  validateConfidenceContract({
    domain:
      "opportunity",

    score:
      72,

    scale:
      "percentage",

    level:
      "Moderate",

    reasons: [
      "test"
    ],

    limitations: [
      "test"
    ],

    methodVersion:
      "test-mismatched-level-v1.0"
  });


assert.equal(
  mismatchedConfidenceLevel
    .valid,
  false
);

assert.ok(
  mismatchedConfidenceLevel
    .errors
    .includes(
      "confidence:confidence-level-does-not-match-score"
    )
);

console.log(
  "PASS Confidence Governance Framework rejects score-level mismatches"
);


const incompleteConfidenceContract =
  validateConfidenceContract({
    domain:
      "model",

    score:
      45,

    scale:
      "percentage",

    level:
      "Moderate",

    reasons:
      "not-an-array",

    methodVersion:
      ""
  });


assert.equal(
  incompleteConfidenceContract
    .valid,
  false
);

assert.ok(
  incompleteConfidenceContract
    .errors
    .includes(
      "confidence:missing-confidence-field:limitations"
    )
);

assert.ok(
  incompleteConfidenceContract
    .errors
    .includes(
      "confidence:reasons-must-be-an-array"
    )
);

assert.ok(
  incompleteConfidenceContract
    .errors
    .includes(
      "confidence:method-version-required"
    )
);

console.log(
  "PASS Confidence Governance Framework rejects incomplete contracts"
);


const unexplainedConfidenceIncrease =
  validateConfidenceContract({
    domain:
      "opportunity",

    score:
      80,

    scale:
      "percentage",

    level:
      "High",

    derivedFrom: [
      {
        domain:
          "evidence",

        score:
          65,

        scale:
          "percentage"
      }
    ],

    reasons: [
      "feature-candidate-supported"
    ],

    limitations: [
      "persistence-evidence-unavailable"
    ],

    methodVersion:
      "test-unexplained-increase-v1.0"
  });


assert.equal(
  unexplainedConfidenceIncrease
    .valid,
  false
);

assert.ok(
  unexplainedConfidenceIncrease
    .errors
    .includes(
      "confidence:unexplained-confidence-increase"
    )
);

console.log(
  "PASS Confidence Governance Framework rejects unexplained confidence increases"
);


const independentlySupportedConfidenceIncrease =
  validateConfidenceContract({
    domain:
      "relationship",

    score:
      80,

    scale:
      "percentage",

    level:
      "High",

    derivedFrom: [
      {
        domain:
          "opportunity",

        score:
          65,

        scale:
          "percentage"
      }
    ],

    reasons: [
      "independent-evidence-added"
    ],

    limitations: [
      "independent-evidence-requires-scientific-review"
    ],

    methodVersion:
      "test-explained-increase-v1.0"
  });


assert.equal(
  independentlySupportedConfidenceIncrease
    .valid,
  true
);

assert.ok(
  independentlySupportedConfidenceIncrease
    .warnings
    .includes(
      "confidence:confidence-increase-requires-independent-evidence-review"
    )
);

console.log(
  "PASS Confidence Governance Framework discloses independently supported confidence increases"
);



/*
 * ------------------------------------------------------------
 * Evidence Lineage and Traceability Framework v1.0
 * ------------------------------------------------------------
 */

assert.deepEqual(
  LINEAGE_ENGINE_TYPES,
  [
    "data-assessment",
    "ocean-evidence",
    "environmental-opportunity",
    "ocean-opportunity",
    "relationship-context",
    "relationship-assessment",
    "species-pathway",
    "opportunity-type",
    "habitat-suitability"
  ]
);

assert.equal(
  LINEAGE_GOVERNANCE_RULES
    .lineageMayChangeReasoning,
  false
);

assert.equal(
  LINEAGE_GOVERNANCE_RULES
    .lineageMayChangeConfidence,
  false
);

assert.equal(
  LINEAGE_GOVERNANCE_RULES
    .missingEvidenceMustRemainVisible,
  true
);

assert.equal(
  EVIDENCE_LINEAGE_FRAMEWORK
    .methodVersion,
  "pelora-evidence-lineage-framework-v1.1"
);


const validUpstreamReference =
  validateLineageUpstreamReference({
    engine:
      "ocean-evidence",

    methodVersion:
      "pelora-ocean-evidence-v2.0",

    traceId:
      "trace-ocean-evidence-001"
  });


assert.equal(
  validUpstreamReference
    .valid,
  true
);

assert.equal(
  validUpstreamReference
    .engine,
  "ocean-evidence"
);


const completeLineageValidation =
  validateEvidenceLineage({
    traceId:
      "trace-relationship-assessment-001",

    upstream: [
      {
        engine:
          "ocean-evidence",

        methodVersion:
          "pelora-ocean-evidence-v2.0",

        traceId:
          "trace-ocean-evidence-001"
      },

      {
        engine:
          "ocean-opportunity",

        methodVersion:
          "pelora-ocean-opportunity-v1.0",

        traceId:
          "trace-ocean-opportunity-001"
      }
    ],

    observationsUsed: [
      "temperature-transition",
      "organized-current",
      "surface-water-boundary"
    ],

    observationsUnavailable: [
      "temporal-persistence"
    ],

    evidenceProduced: [
      "relationship-assessment-evidence"
    ],

    inheritedLimitations: [
      "single-point-current-observation"
    ],

    inheritedWarnings: [
      "spatial-validation-unavailable"
    ],

    producedBy:
      "relationship-assessment",

    components: {},

    methodVersion:
      "pelora-relationship-lineage-v1.0"
  });


assert.equal(
  completeLineageValidation
    .valid,
  true
);

assert.equal(
  completeLineageValidation
    .upstreamCount,
  2
);

assert.equal(
  completeLineageValidation
    .observationsUsedCount,
  3
);

assert.equal(
  completeLineageValidation
    .observationsUnavailableCount,
  1
);

assert.equal(
  completeLineageValidation
    .inheritedLimitationCount,
  1
);

assert.equal(
  completeLineageValidation
    .inheritedWarningCount,
  1
);

console.log(
  "PASS Evidence Lineage Framework validates a complete governed lineage contract"
);


const missingLineageFields =
  validateEvidenceLineage({
    upstream: [],

    observationsUsed: [],

    evidenceProduced: [],

    producedBy:
      "ocean-evidence",

    methodVersion:
      "test-lineage-v1.0"
  });


assert.equal(
  missingLineageFields
    .valid,
  false
);

assert.ok(
  missingLineageFields
    .errors
    .includes(
      "lineage:missing-lineage-field:observationsUnavailable"
    )
);

assert.ok(
  missingLineageFields
    .errors
    .includes(
      "lineage:missing-lineage-field:inheritedLimitations"
    )
);

assert.ok(
  missingLineageFields
    .errors
    .includes(
      "lineage:missing-lineage-field:inheritedWarnings"
    )
);

console.log(
  "PASS Evidence Lineage Framework rejects incomplete lineage contracts"
);


const invalidProducedBy =
  validateEvidenceLineage({
    upstream: [],

    observationsUsed: [],

    observationsUnavailable: [],

    evidenceProduced: [],

    inheritedLimitations: [],

    inheritedWarnings: [],

    producedBy:
      "fish-presence-engine",

    methodVersion:
      "test-invalid-produced-by-v1.0"
  });


assert.equal(
  invalidProducedBy
    .valid,
  false
);

assert.ok(
  invalidProducedBy
    .errors
    .includes(
      "lineage:invalid-produced-by"
    )
);

console.log(
  "PASS Evidence Lineage Framework rejects unknown producing engines"
);


const invalidUpstreamReference =
  validateEvidenceLineage({
    upstream: [
      {
        engine:
          "unknown-engine",

        methodVersion:
          ""
      }
    ],

    observationsUsed: [
      "temperature-transition"
    ],

    observationsUnavailable: [],

    evidenceProduced: [],

    inheritedLimitations: [],

    inheritedWarnings: [],

    producedBy:
      "ocean-opportunity",

    methodVersion:
      "test-invalid-upstream-v1.0"
  });


assert.equal(
  invalidUpstreamReference
    .valid,
  false
);

assert.ok(
  invalidUpstreamReference
    .errors
    .includes(
      "lineage:upstream:0:invalid-upstream-engine"
    )
);

assert.ok(
  invalidUpstreamReference
    .errors
    .includes(
      "lineage:upstream:0:upstream-method-version-required"
    )
);

console.log(
  "PASS Evidence Lineage Framework rejects invalid upstream references"
);


const invalidEvidenceEntries =
  validateEvidenceLineage({
    upstream: [],

    observationsUsed: [
      "",
      null
    ],

    observationsUnavailable: [
      "temporal-persistence"
    ],

    evidenceProduced: [],

    inheritedLimitations: [
      ""
    ],

    inheritedWarnings: [
      "spatial-validation-unavailable"
    ],

    producedBy:
      "habitat-suitability",

    methodVersion:
      "test-invalid-evidence-entry-v1.0"
  });


assert.equal(
  invalidEvidenceEntries
    .valid,
  false
);

assert.ok(
  invalidEvidenceEntries
    .errors
    .includes(
      "lineage:observationsUsed:0:must-be-a-nonempty-string"
    )
);

assert.ok(
  invalidEvidenceEntries
    .errors
    .includes(
      "lineage:observationsUsed:1:must-be-a-nonempty-string"
    )
);

assert.ok(
  invalidEvidenceEntries
    .errors
    .includes(
      "lineage:inheritedLimitations:0:must-be-a-nonempty-string"
    )
);

console.log(
  "PASS Evidence Lineage Framework rejects malformed lineage entries"
);


const undocumentedLineageValidation =
  validateEvidenceLineage({
    upstream: [],

    observationsUsed: [],

    observationsUnavailable: [],

    evidenceProduced: [],

    inheritedLimitations: [],

    inheritedWarnings: [],

    producedBy:
      "data-assessment",

    methodVersion:
      "test-undocumented-lineage-v1.0"
  });


assert.equal(
  undocumentedLineageValidation
    .valid,
  true
);

assert.ok(
  undocumentedLineageValidation
    .warnings
    .includes(
      "lineage:no-upstream-contracts-recorded"
    )
);

assert.ok(
  undocumentedLineageValidation
    .warnings
    .includes(
      "lineage:no-used-observations-recorded"
    )
);

assert.ok(
  undocumentedLineageValidation
    .warnings
    .includes(
      "lineage:no-unavailable-observations-recorded"
    )
);

console.log(
  "PASS Evidence Lineage Framework preserves valid empty lineage while disclosing documentation gaps"
);


const explicitEmptyLineageArrays =
  validateEvidenceLineage({
    upstream: [],

    observationsUsed: [],

    observationsUnavailable: [],

    evidenceProduced: [],

    inheritedLimitations: [],

    inheritedWarnings: [],

    producedBy:
      "data-assessment",

    methodVersion:
      "test-explicit-empty-lineage-v1.0"
  });


assert.equal(
  explicitEmptyLineageArrays
    .errors
    .some(
      error =>
        error.includes(
          "missing-lineage-field"
        )
    ),
  false
);

console.log(
  "PASS Evidence Lineage Framework distinguishes explicit empty arrays from missing fields"
);



/*
 * ------------------------------------------------------------
 * Ocean Evidence Lineage v1.0
 * ------------------------------------------------------------
 */

const completeOceanEvidenceLineage =
  assessOceanEvidence({
    latitude:
      28.25,

    longitude:
      -85.58,

    sst: {
      temperatureFahrenheit:
        82,

      observedAt:
        "2026-07-28T18:00:00.000Z"
    },

    chlorophyll: {
      concentrationMgM3:
        0.2,

      observedAt:
        "2026-07-28T18:00:00.000Z"
    },

    currents: {
      speedKnots:
        1.5,

      directionDegrees:
        220,

      observedAt:
        "2026-07-28T18:00:00.000Z"
    },

    dataQuality: {
      methodVersion:
        "test-data-quality-v1.0",

      overall: {
        classification:
          "complete"
      }
    }
  });


assert.ok(
  completeOceanEvidenceLineage
    .lineage
);

assert.deepEqual(
  completeOceanEvidenceLineage
    .lineage
    .observationsUsed,
  [
    "temperature",
    "currents",
    "chlorophyll"
  ]
);

assert.deepEqual(
  completeOceanEvidenceLineage
    .lineage
    .observationsUnavailable,
  []
);

assert.deepEqual(
  completeOceanEvidenceLineage
    .lineage
    .evidenceProduced,
  [
    "temperature-evidence",
    "current-evidence",
    "productivity-evidence",
    "clarity-evidence",
    "structure-evidence",
    "open-water-evidence",
    "persistence-evidence",
    "environmental-opportunity-evidence"
  ]
);

assert.equal(
  completeOceanEvidenceLineage
    .lineage
    .upstream[0]
    .engine,
  "data-assessment"
);

assert.equal(
  completeOceanEvidenceLineage
    .lineage
    .upstream[0]
    .methodVersion,
  "test-data-quality-v1.0"
);

assert.equal(
  completeOceanEvidenceLineage
    .lineage
    .producedBy,
  "ocean-evidence"
);

assert.equal(
  completeOceanEvidenceLineage
    .lineage
    .methodVersion,
  "pelora-ocean-evidence-lineage-v1.0"
);

assert.equal(
  validateEvidenceLineage(
    completeOceanEvidenceLineage
      .lineage
  ).valid,
  true
);

console.log(
  "PASS Ocean Evidence exposes a valid observation-to-evidence lineage contract"
);


const missingObservationOceanEvidenceLineage =
  assessOceanEvidence({
    latitude:
      28.25,

    longitude:
      -85.58,

    sst: {
      temperatureFahrenheit:
        82,

      observedAt:
        "2026-07-28T18:00:00.000Z"
    },

    chlorophyll:
      null,

    currents: {
      speedKnots:
        1.5,

      directionDegrees:
        220,

      observedAt:
        "2026-07-28T18:00:00.000Z"
    },

    dataQuality: {
      overall: {
        classification:
          "degraded"
      }
    }
  });


assert.deepEqual(
  missingObservationOceanEvidenceLineage
    .lineage
    .observationsUsed,
  [
    "temperature",
    "currents"
  ]
);

assert.deepEqual(
  missingObservationOceanEvidenceLineage
    .lineage
    .observationsUnavailable,
  [
    "chlorophyll"
  ]
);

assert.ok(
  missingObservationOceanEvidenceLineage
    .lineage
    .inheritedWarnings
    .includes(
      "data-quality:degraded"
    )
);

assert.ok(
  missingObservationOceanEvidenceLineage
    .lineage
    .inheritedWarnings
    .includes(
      "persistence-evidence-unavailable"
    )
);

assert.equal(
  validateEvidenceLineage(
    missingObservationOceanEvidenceLineage
      .lineage
  ).valid,
  true
);

console.log(
  "PASS Ocean Evidence lineage keeps unavailable observations and degraded data quality visible"
);


const directOceanEvidenceLineage =
  buildOceanEvidenceLineage({
    groups: {
      temperature: {
        available:
          true
      },

      current: {
        available:
          false
      },

      productivity: {
        available:
          false
      },

      clarity: {
        available:
          false
      },

      structure: {
        available:
          false
      }
    },

    environmentalOpportunityEvidence: {
      openWater: {
        available:
          false
      },

      persistence: {
        available:
          false
      },

      combined: {
        available:
          false
      }
    },

    limitations: [
      "current-observation-unavailable",
      "current-observation-unavailable"
    ],

    dataQuality: {}
  });


assert.deepEqual(
  directOceanEvidenceLineage
    .observationsUsed,
  [
    "temperature"
  ]
);

assert.deepEqual(
  directOceanEvidenceLineage
    .observationsUnavailable,
  [
    "currents",
    "chlorophyll"
  ]
);

assert.deepEqual(
  directOceanEvidenceLineage
    .inheritedLimitations,
  [
    "current-observation-unavailable"
  ]
);

assert.equal(
  validateEvidenceLineage(
    directOceanEvidenceLineage
  ).valid,
  true
);

console.log(
  "PASS Ocean Evidence lineage deduplicates inherited limitations without altering evidence"
);


const lineageBehaviorPreservation =
  assessOceanEvidence({
    latitude:
      28.25,

    longitude:
      -85.58,

    sst: {
      temperatureFahrenheit:
        82,

      observedAt:
        "2026-07-28T18:00:00.000Z"
    },

    chlorophyll:
      null,

    currents: {
      speedKnots:
        1.5,

      directionDegrees:
        220,

      observedAt:
        "2026-07-28T18:00:00.000Z"
    },

    dataQuality: {}
  });


assert.deepEqual(
  Object.keys(
    lineageBehaviorPreservation
      .groups
  ),
  [
    "temperature",
    "current",
    "productivity",
    "clarity",
    "structure"
  ]
);

assert.equal(
  lineageBehaviorPreservation
    .methodVersion,
  "pelora-ocean-evidence-v1.2"
);

assert.equal(
  lineageBehaviorPreservation
    .environmentalOpportunityEvidence
    .openWater
    .values
    .organized,
  false
);

console.log(
  "PASS Ocean Evidence lineage integration preserves established scientific behavior"
);




/*
 * ------------------------------------------------------------
 * Relationship Context Lineage v1.0
 * ------------------------------------------------------------
 */

const relationshipLineageOceanEvidence =
  assessOceanEvidence({
    latitude:
      28.25,

    longitude:
      -85.58,

    sst: {
      temperatureFahrenheit:
        82,

      observedAt:
        "2026-07-28T18:00:00.000Z"
    },

    chlorophyll: {
      concentrationMgM3:
        0.2,

      observedAt:
        "2026-07-28T18:00:00.000Z"
    },

    currents: {
      speedKnots:
        1.5,

      directionDegrees:
        220,

      observedAt:
        "2026-07-28T18:00:00.000Z"
    },

    dataQuality: {
      methodVersion:
        "test-data-quality-v1.0",

      overall: {
        classification:
          "complete"
      }
    }
  });


const relationshipLineageOceanOpportunity =
  assessOceanOpportunity({
    oceanEvidence:
      relationshipLineageOceanEvidence
  });


const relationshipLineageContext =
  buildRelationshipContext({
    oceanOpportunity:
      relationshipLineageOceanOpportunity,

    oceanEvidence:
      relationshipLineageOceanEvidence
  });


assert.ok(
  relationshipLineageContext
    .lineage
);

assert.equal(
  relationshipLineageContext
    .lineage
    .producedBy,
  "relationship-context"
);

assert.equal(
  relationshipLineageContext
    .lineage
    .methodVersion,
  "pelora-relationship-context-lineage-v1.0"
);

assert.deepEqual(
  relationshipLineageContext
    .lineage
    .upstream,
  [
    {
      engine:
        "ocean-opportunity",

      methodVersion:
        "pelora-ocean-opportunity-lineage-v1.0"
    },

    {
      engine:
        "ocean-evidence",

      methodVersion:
        "pelora-ocean-evidence-lineage-v1.0"
    }
  ]
);

assert.ok(
  relationshipLineageContext
    .lineage
    .evidenceProduced
    .includes(
      "relationship-context"
    )
);

assert.equal(
  relationshipLineageContext
    .lineage
    .components
    .pathway,
  relationshipLineageContext
    .pathway
);

assert.equal(
  relationshipLineageContext
    .lineage
    .components
    .environmentType,
  relationshipLineageContext
    .environmentType
);

assert.deepEqual(
  relationshipLineageContext
    .lineage
    .components
    .supportedRelationships,
  relationshipLineageContext
    .supportedRelationships
);

assert.deepEqual(
  relationshipLineageContext
    .lineage
    .components
    .unavailableRelationships,
  relationshipLineageContext
    .unavailableRelationships
);

assert.deepEqual(
  relationshipLineageContext
    .lineage
    .components
    .unresolvedRelationships,
  relationshipLineageContext
    .unresolvedRelationships
);

assert.equal(
  validateEvidenceLineage(
    relationshipLineageContext
      .lineage
  ).valid,
  true
);

console.log(
  "PASS Relationship Context exposes governed multi-parent lineage"
);


const directRelationshipLineage =
  buildRelationshipContextLineage({
    oceanOpportunity:
      relationshipLineageOceanOpportunity,

    oceanEvidence:
      relationshipLineageOceanEvidence,

    pathway:
      relationshipLineageContext
        .pathway,

    environmentType:
      relationshipLineageContext
        .environmentType,

    supportedRelationships:
      relationshipLineageContext
        .supportedRelationships,

    unavailableRelationships:
      relationshipLineageContext
        .unavailableRelationships,

    unresolvedRelationships:
      relationshipLineageContext
        .unresolvedRelationships,

    limitations:
      relationshipLineageContext
        .limitations
  });


assert.equal(
  validateEvidenceLineage(
    directRelationshipLineage
  ).valid,
  true
);

assert.deepEqual(
  directRelationshipLineage
    .observationsUsed,
  relationshipLineageContext
    .lineage
    .observationsUsed
);

assert.deepEqual(
  directRelationshipLineage
    .observationsUnavailable,
  relationshipLineageContext
    .lineage
    .observationsUnavailable
);

console.log(
  "PASS Relationship Context lineage builder preserves inherited observations"
);


const relationshipBehaviorBaseline =
  buildRelationshipContext({
    oceanOpportunity:
      relationshipLineageOceanOpportunity,

    oceanEvidence:
      relationshipLineageOceanEvidence
  });


assert.deepEqual(
  relationshipBehaviorBaseline
    .relationshipSupport,
  relationshipLineageContext
    .relationshipSupport
);

assert.deepEqual(
  relationshipBehaviorBaseline
    .supportedRelationships,
  relationshipLineageContext
    .supportedRelationships
);

assert.deepEqual(
  relationshipBehaviorBaseline
    .unavailableRelationships,
  relationshipLineageContext
    .unavailableRelationships
);

assert.deepEqual(
  relationshipBehaviorBaseline
    .unresolvedRelationships,
  relationshipLineageContext
    .unresolvedRelationships
);

assert.equal(
  relationshipBehaviorBaseline
    .available,
  relationshipLineageContext
    .available
);

assert.equal(
  relationshipBehaviorBaseline
    .pathway,
  relationshipLineageContext
    .pathway
);

assert.equal(
  relationshipBehaviorBaseline
    .environmentType,
  relationshipLineageContext
    .environmentType
);

console.log(
  "PASS Relationship Context lineage integration preserves established scientific behavior"
);


const missingOpportunityLineageContext =
  buildRelationshipContext({
    oceanOpportunity: {
      pathwayClassification:
        relationshipLineageOceanOpportunity
          .pathwayClassification
    },

    oceanEvidence:
      relationshipLineageOceanEvidence
  });


assert.ok(
  missingOpportunityLineageContext
    .lineage
);

assert.deepEqual(
  missingOpportunityLineageContext
    .lineage
    .upstream,
  [
    {
      engine:
        "ocean-evidence",

      methodVersion:
        "pelora-ocean-evidence-lineage-v1.0"
    }
  ]
);

assert.ok(
  missingOpportunityLineageContext
    .lineage
    .inheritedWarnings
    .includes(
      "primary-upstream-lineage-unavailable"
    )
);

assert.equal(
  validateEvidenceLineage(
    missingOpportunityLineageContext
      .lineage
  ).valid,
  true
);

assert.deepEqual(
  missingOpportunityLineageContext
    .relationshipSupport,
  relationshipLineageContext
    .relationshipSupport
);

console.log(
  "PASS Relationship Context discloses missing primary lineage without changing relationship interpretation"
);


const malformedOpportunityLineageContext =
  buildRelationshipContext({
    oceanOpportunity: {
      pathwayClassification:
        relationshipLineageOceanOpportunity
          .pathwayClassification,

      lineage: {
        producedBy:
          "ocean-opportunity"
      }
    },

    oceanEvidence:
      relationshipLineageOceanEvidence
  });


assert.deepEqual(
  malformedOpportunityLineageContext
    .lineage
    .upstream,
  [
    {
      engine:
        "ocean-evidence",

      methodVersion:
        "pelora-ocean-evidence-lineage-v1.0"
    }
  ]
);

assert.ok(
  malformedOpportunityLineageContext
    .lineage
    .inheritedWarnings
    .includes(
      "primary-upstream-lineage-invalid"
    )
);

assert.equal(
  validateEvidenceLineage(
    malformedOpportunityLineageContext
      .lineage
  ).valid,
  true
);

assert.deepEqual(
  malformedOpportunityLineageContext
    .relationshipSupport,
  relationshipLineageContext
    .relationshipSupport
);

console.log(
  "PASS Relationship Context rejects malformed primary lineage while preserving valid secondary provenance"
);



/*
 * ------------------------------------------------------------
 * Relationship Assessment Lineage v1.0
 * ------------------------------------------------------------
 */

const relationshipLineageAssessment =
  assessRelationships({
    relationshipContext:
      relationshipLineageContext,

    oceanOpportunity:
      relationshipLineageOceanOpportunity,

    oceanEvidence:
      relationshipLineageOceanEvidence,

    dataQuality: {
      score:
        0.8
    }
  });


assert.ok(
  relationshipLineageAssessment
    .lineage
);

assert.equal(
  relationshipLineageAssessment
    .lineage
    .producedBy,
  "relationship-assessment"
);

assert.equal(
  relationshipLineageAssessment
    .lineage
    .methodVersion,
  "pelora-relationship-assessment-lineage-v1.0"
);

assert.deepEqual(
  relationshipLineageAssessment
    .lineage
    .upstream,
  [
    {
      engine:
        "relationship-context",

      methodVersion:
        "pelora-relationship-context-lineage-v1.0"
    },

    {
      engine:
        "ocean-opportunity",

      methodVersion:
        "pelora-ocean-opportunity-lineage-v1.0"
    },

    {
      engine:
        "ocean-evidence",

      methodVersion:
        "pelora-ocean-evidence-lineage-v1.0"
    }
  ]
);

assert.ok(
  relationshipLineageAssessment
    .lineage
    .evidenceProduced
    .includes(
      "relationship-support-assessment"
    )
);

assert.ok(
  relationshipLineageAssessment
    .lineage
    .evidenceProduced
    .includes(
      "relationship-confidence-assessment"
    )
);

assert.equal(
  validateEvidenceLineage(
    relationshipLineageAssessment
      .lineage
  ).valid,
  true
);

console.log(
  "PASS Relationship Assessment exposes governed multi-parent lineage"
);


assert.equal(
  relationshipLineageAssessment
    .lineage
    .components
    .pathway,
  relationshipLineageAssessment
    .pathway
);

assert.equal(
  relationshipLineageAssessment
    .lineage
    .components
    .environmentType,
  relationshipLineageAssessment
    .environmentType
);

assert.equal(
  relationshipLineageAssessment
    .lineage
    .components
    .supportedCount,
  relationshipLineageAssessment
    .relationshipConfidence
    .summary
    .supportedCount
);

assert.equal(
  relationshipLineageAssessment
    .lineage
    .components
    .unavailableCount,
  relationshipLineageAssessment
    .relationshipConfidence
    .summary
    .unavailableCount
);

assert.equal(
  relationshipLineageAssessment
    .lineage
    .components
    .unresolvedCount,
  relationshipLineageAssessment
    .relationshipConfidence
    .summary
    .unresolvedCount
);

assert.equal(
  relationshipLineageAssessment
    .lineage
    .components
    .assessedCount,
  relationshipLineageAssessment
    .relationshipConfidence
    .summary
    .assessedCount
);

assert.equal(
  relationshipLineageAssessment
    .lineage
    .components
    .overallConfidence,
  relationshipLineageAssessment
    .relationshipConfidence
    .overall
    .value
);

console.log(
  "PASS Relationship Assessment lineage records compact canonical output summaries"
);


const directRelationshipAssessmentLineage =
  buildRelationshipAssessmentLineage({
    relationshipContext:
      relationshipLineageContext,

    oceanOpportunity:
      relationshipLineageOceanOpportunity,

    oceanEvidence:
      relationshipLineageOceanEvidence,

    pathway:
      relationshipLineageAssessment
        .pathway,

    environmentType:
      relationshipLineageAssessment
        .environmentType,

    supportedCount:
      relationshipLineageAssessment
        .relationshipConfidence
        .summary
        .supportedCount,

    unavailableCount:
      relationshipLineageAssessment
        .relationshipConfidence
        .summary
        .unavailableCount,

    unresolvedCount:
      relationshipLineageAssessment
        .relationshipConfidence
        .summary
        .unresolvedCount,

    assessedCount:
      relationshipLineageAssessment
        .relationshipConfidence
        .summary
        .assessedCount,

    overallConfidence:
      relationshipLineageAssessment
        .relationshipConfidence
        .overall
        .value,

    limitations:
      relationshipLineageAssessment
        .limitations
  });


assert.equal(
  validateEvidenceLineage(
    directRelationshipAssessmentLineage
  ).valid,
  true
);

assert.deepEqual(
  directRelationshipAssessmentLineage
    .observationsUsed,
  relationshipLineageAssessment
    .lineage
    .observationsUsed
);

assert.deepEqual(
  directRelationshipAssessmentLineage
    .observationsUnavailable,
  relationshipLineageAssessment
    .lineage
    .observationsUnavailable
);

console.log(
  "PASS Relationship Assessment lineage preserves inherited observation trace"
);


const relationshipAssessmentBehaviorBaseline =
  assessRelationships({
    relationshipContext:
      relationshipLineageContext,

    oceanOpportunity:
      relationshipLineageOceanOpportunity,

    oceanEvidence:
      relationshipLineageOceanEvidence,

    dataQuality: {
      score:
        0.8
    }
  });


assert.deepEqual(
  relationshipAssessmentBehaviorBaseline
    .relationshipSupport,
  relationshipLineageAssessment
    .relationshipSupport
);

assert.deepEqual(
  relationshipAssessmentBehaviorBaseline
    .relationshipConfidence,
  relationshipLineageAssessment
    .relationshipConfidence
);

assert.equal(
  relationshipAssessmentBehaviorBaseline
    .available,
  relationshipLineageAssessment
    .available
);

assert.equal(
  relationshipAssessmentBehaviorBaseline
    .pathway,
  relationshipLineageAssessment
    .pathway
);

assert.equal(
  relationshipAssessmentBehaviorBaseline
    .environmentType,
  relationshipLineageAssessment
    .environmentType
);

assert.deepEqual(
  relationshipAssessmentBehaviorBaseline
    .rules,
  relationshipLineageAssessment
    .rules
);

assert.deepEqual(
  relationshipAssessmentBehaviorBaseline
    .limitations,
  relationshipLineageAssessment
    .limitations
);

console.log(
  "PASS Relationship Assessment lineage integration preserves established assessment behavior"
);


const missingContextLineageAssessment =
  assessRelationships({
    relationshipContext: {
      ...relationshipLineageContext,

      lineage:
        null
    },

    oceanOpportunity:
      relationshipLineageOceanOpportunity,

    oceanEvidence:
      relationshipLineageOceanEvidence,

    dataQuality: {
      score:
        0.8
    }
  });


assert.ok(
  missingContextLineageAssessment
    .lineage
    .inheritedWarnings
    .includes(
      "primary-upstream-lineage-unavailable"
    )
);

assert.deepEqual(
  missingContextLineageAssessment
    .lineage
    .upstream,
  [
    {
      engine:
        "ocean-opportunity",

      methodVersion:
        "pelora-ocean-opportunity-lineage-v1.0"
    },

    {
      engine:
        "ocean-evidence",

      methodVersion:
        "pelora-ocean-evidence-lineage-v1.0"
    }
  ]
);

assert.equal(
  validateEvidenceLineage(
    missingContextLineageAssessment
      .lineage
  ).valid,
  true
);

assert.deepEqual(
  missingContextLineageAssessment
    .relationshipConfidence,
  relationshipLineageAssessment
    .relationshipConfidence
);

console.log(
  "PASS Relationship Assessment discloses missing primary lineage without changing confidence"
);


const malformedContextLineageAssessment =
  assessRelationships({
    relationshipContext: {
      ...relationshipLineageContext,

      lineage: {
        producedBy:
          "relationship-context"
      }
    },

    oceanOpportunity:
      relationshipLineageOceanOpportunity,

    oceanEvidence:
      relationshipLineageOceanEvidence,

    dataQuality: {
      score:
        0.8
    }
  });


assert.ok(
  malformedContextLineageAssessment
    .lineage
    .inheritedWarnings
    .includes(
      "primary-upstream-lineage-invalid"
    )
);

assert.deepEqual(
  malformedContextLineageAssessment
    .lineage
    .upstream,
  [
    {
      engine:
        "ocean-opportunity",

      methodVersion:
        "pelora-ocean-opportunity-lineage-v1.0"
    },

    {
      engine:
        "ocean-evidence",

      methodVersion:
        "pelora-ocean-evidence-lineage-v1.0"
    }
  ]
);

assert.equal(
  validateEvidenceLineage(
    malformedContextLineageAssessment
      .lineage
  ).valid,
  true
);

assert.deepEqual(
  malformedContextLineageAssessment
    .relationshipSupport,
  relationshipLineageAssessment
    .relationshipSupport
);

assert.deepEqual(
  malformedContextLineageAssessment
    .relationshipConfidence,
  relationshipLineageAssessment
    .relationshipConfidence
);

console.log(
  "PASS Relationship Assessment rejects malformed primary lineage while preserving valid secondary provenance"
);



/*
 * ------------------------------------------------------------
 * Blue Marlin Pathway Lineage v1.0
 * ------------------------------------------------------------
 */

const blueMarlinPathwayLineageInterpretation =
  interpretBlueMarlinPathway({
    relationshipAssessment:
      relationshipLineageAssessment,

    relationshipContext:
      relationshipLineageContext
  });


assert.ok(
  blueMarlinPathwayLineageInterpretation
    .lineage
);

assert.equal(
  blueMarlinPathwayLineageInterpretation
    .lineage
    .producedBy,
  "species-pathway"
);

assert.equal(
  blueMarlinPathwayLineageInterpretation
    .lineage
    .methodVersion,
  "pelora-blue-marlin-pathway-lineage-v1.0"
);

assert.deepEqual(
  blueMarlinPathwayLineageInterpretation
    .lineage
    .upstream,
  [
    {
      engine:
        "relationship-assessment",

      methodVersion:
        "pelora-relationship-assessment-lineage-v1.0"
    },

    {
      engine:
        "relationship-context",

      methodVersion:
        "pelora-relationship-context-lineage-v1.0"
    }
  ]
);

assert.ok(
  blueMarlinPathwayLineageInterpretation
    .lineage
    .evidenceProduced
    .includes(
      "blue-marlin-pathway-interpretation"
    )
);

assert.equal(
  validateEvidenceLineage(
    blueMarlinPathwayLineageInterpretation
      .lineage
  ).valid,
  true
);

console.log(
  "PASS Blue Marlin Pathway Interpretation exposes governed lineage"
);


assert.equal(
  blueMarlinPathwayLineageInterpretation
    .lineage
    .components
    .species,
  "blue-marlin"
);

assert.equal(
  blueMarlinPathwayLineageInterpretation
    .lineage
    .components
    .classification,
  blueMarlinPathwayLineageInterpretation
    .classification
);

assert.equal(
  blueMarlinPathwayLineageInterpretation
    .lineage
    .components
    .pathway,
  blueMarlinPathwayLineageInterpretation
    .environmentalPathway
);

assert.equal(
  blueMarlinPathwayLineageInterpretation
    .lineage
    .components
    .environmentType,
  blueMarlinPathwayLineageInterpretation
    .environmentType
);

assert.deepEqual(
  blueMarlinPathwayLineageInterpretation
    .lineage
    .components
    .plausibleOpportunityTypes,
  blueMarlinPathwayLineageInterpretation
    .plausibleOpportunityTypes
);

const expectedSupportedRelationships =
  Object.entries(
    blueMarlinPathwayLineageInterpretation
      .relationshipSupport
  )
    .filter(
      (
        [
          ,
          supported
        ]
      ) =>
        supported === true
    )
    .map(
      (
        [
          relationship
        ]
      ) =>
        relationship
    );

assert.deepEqual(
  blueMarlinPathwayLineageInterpretation
    .lineage
    .components
    .supportedRelationships,
  expectedSupportedRelationships
);

console.log(
  "PASS Blue Marlin Pathway lineage records compact species interpretation outputs"
);


const directBlueMarlinPathwayLineage =
  buildBlueMarlinPathwayLineage({
    relationshipAssessment:
      relationshipLineageAssessment,

    relationshipContext:
      relationshipLineageContext,

    classification:
      blueMarlinPathwayLineageInterpretation
        .classification,

    pathway:
      blueMarlinPathwayLineageInterpretation
        .environmentalPathway,

    environmentType:
      blueMarlinPathwayLineageInterpretation
        .environmentType,

    plausibleOpportunityTypes:
      blueMarlinPathwayLineageInterpretation
        .plausibleOpportunityTypes,

    supportedRelationships:
      expectedSupportedRelationships,

    limitations:
      blueMarlinPathwayLineageInterpretation
        .limitations
  });


assert.equal(
  validateEvidenceLineage(
    directBlueMarlinPathwayLineage
  ).valid,
  true
);

assert.deepEqual(
  directBlueMarlinPathwayLineage
    .observationsUsed,
  blueMarlinPathwayLineageInterpretation
    .lineage
    .observationsUsed
);

assert.deepEqual(
  directBlueMarlinPathwayLineage
    .observationsUnavailable,
  blueMarlinPathwayLineageInterpretation
    .lineage
    .observationsUnavailable
);

console.log(
  "PASS Blue Marlin Pathway lineage preserves inherited observation trace"
);


const blueMarlinPathwayBehaviorBaseline =
  interpretBlueMarlinPathway({
    relationshipContext:
      relationshipLineageContext
  });


assert.equal(
  blueMarlinPathwayLineageInterpretation
    .available,
  blueMarlinPathwayBehaviorBaseline
    .available
);

assert.equal(
  blueMarlinPathwayLineageInterpretation
    .classification,
  blueMarlinPathwayBehaviorBaseline
    .classification
);

assert.deepEqual(
  blueMarlinPathwayLineageInterpretation
    .plausibleOpportunityTypes,
  blueMarlinPathwayBehaviorBaseline
    .plausibleOpportunityTypes
);

assert.deepEqual(
  blueMarlinPathwayLineageInterpretation
    .relationshipSupport,
  blueMarlinPathwayBehaviorBaseline
    .relationshipSupport
);

assert.deepEqual(
  blueMarlinPathwayLineageInterpretation
    .positiveDrivers,
  blueMarlinPathwayBehaviorBaseline
    .positiveDrivers
);

assert.deepEqual(
  blueMarlinPathwayLineageInterpretation
    .limitations,
  blueMarlinPathwayBehaviorBaseline
    .limitations
);

assert.equal(
  blueMarlinPathwayLineageInterpretation
    .interpretation,
  blueMarlinPathwayBehaviorBaseline
    .interpretation
);

assert.deepEqual(
  blueMarlinPathwayLineageInterpretation
    .rules,
  blueMarlinPathwayBehaviorBaseline
    .rules
);

console.log(
  "PASS Blue Marlin Pathway lineage integration preserves established interpretation behavior"
);


const missingAssessmentLineagePathway =
  interpretBlueMarlinPathway({
    relationshipAssessment: {
      ...relationshipLineageAssessment,

      lineage:
        null
    },

    relationshipContext:
      relationshipLineageContext
  });


assert.ok(
  missingAssessmentLineagePathway
    .lineage
    .inheritedWarnings
    .includes(
      "primary-upstream-lineage-unavailable"
    )
);

assert.deepEqual(
  missingAssessmentLineagePathway
    .lineage
    .upstream,
  [
    {
      engine:
        "relationship-context",

      methodVersion:
        "pelora-relationship-context-lineage-v1.0"
    }
  ]
);

assert.equal(
  validateEvidenceLineage(
    missingAssessmentLineagePathway
      .lineage
  ).valid,
  true
);

assert.equal(
  missingAssessmentLineagePathway
    .classification,
  blueMarlinPathwayLineageInterpretation
    .classification
);

assert.deepEqual(
  missingAssessmentLineagePathway
    .plausibleOpportunityTypes,
  blueMarlinPathwayLineageInterpretation
    .plausibleOpportunityTypes
);

console.log(
  "PASS Blue Marlin Pathway discloses missing assessment lineage without changing interpretation"
);


const malformedAssessmentLineagePathway =
  interpretBlueMarlinPathway({
    relationshipAssessment: {
      ...relationshipLineageAssessment,

      lineage: {
        producedBy:
          "relationship-assessment"
      }
    },

    relationshipContext:
      relationshipLineageContext
  });


assert.ok(
  malformedAssessmentLineagePathway
    .lineage
    .inheritedWarnings
    .includes(
      "primary-upstream-lineage-invalid"
    )
);

assert.deepEqual(
  malformedAssessmentLineagePathway
    .lineage
    .upstream,
  [
    {
      engine:
        "relationship-context",

      methodVersion:
        "pelora-relationship-context-lineage-v1.0"
    }
  ]
);

assert.equal(
  validateEvidenceLineage(
    malformedAssessmentLineagePathway
      .lineage
  ).valid,
  true
);

assert.equal(
  malformedAssessmentLineagePathway
    .classification,
  blueMarlinPathwayLineageInterpretation
    .classification
);

assert.deepEqual(
  malformedAssessmentLineagePathway
    .plausibleOpportunityTypes,
  blueMarlinPathwayLineageInterpretation
    .plausibleOpportunityTypes
);

console.log(
  "PASS Blue Marlin Pathway rejects malformed assessment lineage while preserving context provenance"
);


const pathwayLineageHsmResult =
  assessBlueMarlinHabitat({
    oceanOpportunity:
      relationshipLineageOceanOpportunity,

    oceanEvidence:
      relationshipLineageOceanEvidence,

    dataQuality: {
      score:
        0.8
    }
  });


assert.ok(
  pathwayLineageHsmResult
    .speciesPathwayInterpretation
    .lineage
);

assert.equal(
  pathwayLineageHsmResult
    .speciesPathwayInterpretation
    .lineage
    .producedBy,
  "species-pathway"
);

assert.equal(
  validateEvidenceLineage(
    pathwayLineageHsmResult
      .speciesPathwayInterpretation
      .lineage
  ).valid,
  true
);

console.log(
  "PASS Blue Marlin HSM propagates Relationship Assessment lineage into species pathway interpretation"
);



/*
 * ------------------------------------------------------------
 * Blue Marlin Habitat Suitability Lineage v1.0
 * ------------------------------------------------------------
 */

assert.ok(
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .producedBy,
  "habitat-suitability"
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .methodVersion,
  "pelora-blue-marlin-hsm-lineage-v1.0"
);

assert.deepEqual(
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .upstream,
  [
    {
      engine:
        "opportunity-type",

      methodVersion:
        "pelora-opportunity-type-resolution-lineage-v1.0"
    }
  ]
);

assert.ok(
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .evidenceProduced
    .includes(
      "blue-marlin-habitat-suitability-assessment"
    )
);

assert.equal(
  validateEvidenceLineage(
    organizedOffshoreFeatureBlueMarlinHabitat
      .lineage
  ).valid,
  true
);

console.log(
  "PASS Blue Marlin HSM exposes governed Opportunity Type Resolution lineage"
);


assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .components
    .species,
  "blue-marlin"
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .components
    .classification,
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .classification
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .components
    .rawSuitabilityScore,
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .rawSuitabilityScore
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .components
    .suitabilityScore,
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .suitabilityScore
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .components
    .confidenceScore,
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .confidenceScore
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .components
    .confidenceLevel,
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .confidenceLevel
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .components
    .maximumSuitabilityScore,
  100
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .components
    .leadingOpportunityCandidate,
  organizedOffshoreFeatureBlueMarlinHabitat
    .opportunityTypeResolution
    .leadingCandidate
);

console.log(
  "PASS Blue Marlin HSM lineage records compact canonical suitability outputs"
);


for (
  const [
    groupName,
    group
  ]
  of Object.entries(
    organizedOffshoreFeatureBlueMarlinHabitat
      .relationshipGroups
  )
) {
  const lineageGroup =
    organizedOffshoreFeatureBlueMarlinHabitat
      .lineage
      .components
      .relationshipGroups[
        groupName
      ];

  assert.ok(
    lineageGroup,
    `Missing lineage relationship group: ${groupName}`
  );

  assert.equal(
    lineageGroup.score,
    group.score
  );

  assert.equal(
    lineageGroup.maximumScore,
    group.maximumScore
  );
}

console.log(
  "PASS Blue Marlin HSM lineage records every governed relationship-group score"
);


assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .rawSuitabilityScore,
  71
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .relationshipGroups
    .structureInteraction
    .score,
  0
);

assert.equal(
  organizedOffshoreFeatureBlueMarlinHabitat
    .relationshipGroups
    .persistence
    .score,
  0
);

assert.ok(
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .rawSuitabilityScore <
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .components
    .maximumSuitabilityScore
);

console.log(
  "PASS Blue Marlin HSM lineage preserves the governed current model ceiling"
);


const directBlueMarlinHabitatLineage =
  buildBlueMarlinHabitatLineage({
    opportunityTypeResolution:
      organizedOffshoreFeatureBlueMarlinHabitat
        .opportunityTypeResolution,

    classification:
      organizedOffshoreFeatureBlueMarlinHabitat
        .summary
        .classification,

    suitabilityScore:
      organizedOffshoreFeatureBlueMarlinHabitat
        .summary
        .suitabilityScore,

    rawSuitabilityScore:
      organizedOffshoreFeatureBlueMarlinHabitat
        .summary
        .rawSuitabilityScore,

    confidenceScore:
      organizedOffshoreFeatureBlueMarlinHabitat
        .summary
        .confidenceScore,

    confidenceLevel:
      organizedOffshoreFeatureBlueMarlinHabitat
        .summary
        .confidenceLevel,

    relationshipGroups:
      organizedOffshoreFeatureBlueMarlinHabitat
        .relationshipGroups,

    leadingOpportunityCandidate:
      organizedOffshoreFeatureBlueMarlinHabitat
        .opportunityTypeResolution
        .leadingCandidate,

    limitations:
      organizedOffshoreFeatureBlueMarlinHabitat
        .limitations
  });


assert.equal(
  validateEvidenceLineage(
    directBlueMarlinHabitatLineage
  ).valid,
  true
);

assert.deepEqual(
  directBlueMarlinHabitatLineage
    .observationsUsed,
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .observationsUsed
);

assert.deepEqual(
  directBlueMarlinHabitatLineage
    .observationsUnavailable,
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .observationsUnavailable
);

console.log(
  "PASS Blue Marlin HSM lineage preserves the complete inherited observation trace"
);


const missingOpportunityTypeLineage =
  buildBlueMarlinHabitatLineage({
    opportunityTypeResolution: {
      ...organizedOffshoreFeatureBlueMarlinHabitat
        .opportunityTypeResolution,

      lineage:
        null
    },

    classification:
      organizedOffshoreFeatureBlueMarlinHabitat
        .summary
        .classification,

    suitabilityScore:
      organizedOffshoreFeatureBlueMarlinHabitat
        .summary
        .suitabilityScore,

    rawSuitabilityScore:
      organizedOffshoreFeatureBlueMarlinHabitat
        .summary
        .rawSuitabilityScore,

    confidenceScore:
      organizedOffshoreFeatureBlueMarlinHabitat
        .summary
        .confidenceScore,

    confidenceLevel:
      organizedOffshoreFeatureBlueMarlinHabitat
        .summary
        .confidenceLevel,

    relationshipGroups:
      organizedOffshoreFeatureBlueMarlinHabitat
        .relationshipGroups,

    leadingOpportunityCandidate:
      organizedOffshoreFeatureBlueMarlinHabitat
        .opportunityTypeResolution
        .leadingCandidate,

    limitations:
      organizedOffshoreFeatureBlueMarlinHabitat
        .limitations
  });


assert.deepEqual(
  missingOpportunityTypeLineage
    .upstream,
  []
);

assert.ok(
  missingOpportunityTypeLineage
    .inheritedWarnings
    .includes(
      "upstream-lineage-unavailable"
    )
);

assert.equal(
  validateEvidenceLineage(
    missingOpportunityTypeLineage
  ).valid,
  true
);

assert.equal(
  missingOpportunityTypeLineage
    .components
    .rawSuitabilityScore,
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .rawSuitabilityScore
);

assert.equal(
  missingOpportunityTypeLineage
    .components
    .suitabilityScore,
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .suitabilityScore
);

console.log(
  "PASS Blue Marlin HSM discloses missing Opportunity Type lineage without changing documented scores"
);


const malformedOpportunityTypeLineage =
  buildBlueMarlinHabitatLineage({
    opportunityTypeResolution: {
      ...organizedOffshoreFeatureBlueMarlinHabitat
        .opportunityTypeResolution,

      lineage: {
        producedBy:
          "opportunity-type"
      }
    },

    classification:
      organizedOffshoreFeatureBlueMarlinHabitat
        .summary
        .classification,

    suitabilityScore:
      organizedOffshoreFeatureBlueMarlinHabitat
        .summary
        .suitabilityScore,

    rawSuitabilityScore:
      organizedOffshoreFeatureBlueMarlinHabitat
        .summary
        .rawSuitabilityScore,

    confidenceScore:
      organizedOffshoreFeatureBlueMarlinHabitat
        .summary
        .confidenceScore,

    confidenceLevel:
      organizedOffshoreFeatureBlueMarlinHabitat
        .summary
        .confidenceLevel,

    relationshipGroups:
      organizedOffshoreFeatureBlueMarlinHabitat
        .relationshipGroups,

    leadingOpportunityCandidate:
      organizedOffshoreFeatureBlueMarlinHabitat
        .opportunityTypeResolution
        .leadingCandidate,

    limitations:
      organizedOffshoreFeatureBlueMarlinHabitat
        .limitations
  });


assert.deepEqual(
  malformedOpportunityTypeLineage
    .upstream,
  []
);

assert.ok(
  malformedOpportunityTypeLineage
    .inheritedWarnings
    .includes(
      "upstream-lineage-invalid"
    )
);

assert.equal(
  validateEvidenceLineage(
    malformedOpportunityTypeLineage
  ).valid,
  true
);

assert.equal(
  malformedOpportunityTypeLineage
    .components
    .classification,
  organizedOffshoreFeatureBlueMarlinHabitat
    .summary
    .classification
);

console.log(
  "PASS Blue Marlin HSM rejects malformed Opportunity Type lineage while preserving its documentary result"
);


assert.deepEqual(
  organizedOffshoreFeatureBlueMarlinHabitat
    .lineage
    .components
    .relationshipGroups,
  {
    oceanMovement: {
      classification:
        organizedOffshoreFeatureBlueMarlinHabitat
          .relationshipGroups
          .oceanMovement
          .classification,

      score:
        organizedOffshoreFeatureBlueMarlinHabitat
          .relationshipGroups
          .oceanMovement
          .score,

      maximumScore:
        20
    },

    thermalStructure: {
      classification:
        organizedOffshoreFeatureBlueMarlinHabitat
          .relationshipGroups
          .thermalStructure
          .classification,

      score:
        organizedOffshoreFeatureBlueMarlinHabitat
          .relationshipGroups
          .thermalStructure
          .score,

      maximumScore:
        25
    },

    productivityAndPreySupport: {
      classification:
        organizedOffshoreFeatureBlueMarlinHabitat
          .relationshipGroups
          .productivityAndPreySupport
          .classification,

      score:
        organizedOffshoreFeatureBlueMarlinHabitat
          .relationshipGroups
          .productivityAndPreySupport
          .score,

      maximumScore:
        20
    },

    structureInteraction: {
      classification:
        organizedOffshoreFeatureBlueMarlinHabitat
          .relationshipGroups
          .structureInteraction
          .classification,

      score:
        0,

      maximumScore:
        15
    },

    waterCharacter: {
      classification:
        organizedOffshoreFeatureBlueMarlinHabitat
          .relationshipGroups
          .waterCharacter
          .classification,

      score:
        organizedOffshoreFeatureBlueMarlinHabitat
          .relationshipGroups
          .waterCharacter
          .score,

      maximumScore:
        10
    },

    persistence: {
      classification:
        organizedOffshoreFeatureBlueMarlinHabitat
          .relationshipGroups
          .persistence
          .classification,

      score:
        0,

      maximumScore:
        5
    }
  }
);

console.log(
  "PASS Blue Marlin HSM lineage integration preserves established scientific behavior"
);


/*
 * ------------------------------------------------------------
 * Opportunity Type Resolution Lineage v1.0
 * ------------------------------------------------------------
 */

const opportunityTypeLineageResolution =
  resolveBlueMarlinOpportunityType({
    speciesPathwayInterpretation:
      blueMarlinPathwayLineageInterpretation,

    relationshipContext:
      relationshipLineageContext,

    oceanEvidence:
      relationshipLineageOceanEvidence,

    oceanOpportunity:
      relationshipLineageOceanOpportunity
  });


assert.ok(
  opportunityTypeLineageResolution
    .lineage
);

assert.equal(
  opportunityTypeLineageResolution
    .lineage
    .producedBy,
  "opportunity-type"
);

assert.equal(
  opportunityTypeLineageResolution
    .lineage
    .methodVersion,
  "pelora-opportunity-type-resolution-lineage-v1.0"
);

assert.deepEqual(
  opportunityTypeLineageResolution
    .lineage
    .upstream,
  [
    {
      engine:
        "species-pathway",

      methodVersion:
        "pelora-blue-marlin-pathway-lineage-v1.0"
    }
  ]
);

assert.ok(
  opportunityTypeLineageResolution
    .lineage
    .evidenceProduced
    .includes(
      "species-opportunity-type-resolution"
    )
);

assert.equal(
  validateEvidenceLineage(
    opportunityTypeLineageResolution
      .lineage
  ).valid,
  true
);

console.log(
  "PASS Opportunity Type Resolution exposes governed species-pathway lineage"
);


assert.equal(
  opportunityTypeLineageResolution
    .lineage
    .components
    .species,
  opportunityTypeLineageResolution
    .species
);

assert.equal(
  opportunityTypeLineageResolution
    .lineage
    .components
    .available,
  opportunityTypeLineageResolution
    .available
);

assert.equal(
  opportunityTypeLineageResolution
    .lineage
    .components
    .classification,
  opportunityTypeLineageResolution
    .classification
);

assert.equal(
  opportunityTypeLineageResolution
    .lineage
    .components
    .confidence,
  opportunityTypeLineageResolution
    .confidence
);

assert.equal(
  opportunityTypeLineageResolution
    .lineage
    .components
    .leadingCandidate,
  opportunityTypeLineageResolution
    .leadingCandidate
);

assert.equal(
  opportunityTypeLineageResolution
    .lineage
    .components
    .candidateCount,
  opportunityTypeLineageResolution
    .candidateTypes
    .length
);

assert.deepEqual(
  opportunityTypeLineageResolution
    .lineage
    .components
    .rankedCandidateTypes,
  opportunityTypeLineageResolution
    .rankedCandidates
    .map(
      candidate =>
        candidate.type
    )
);

console.log(
  "PASS Opportunity Type Resolution lineage records compact canonical ranking outputs"
);


const directOpportunityTypeLineage =
  buildOpportunityTypeResolutionLineage({
    speciesPathwayInterpretation:
      blueMarlinPathwayLineageInterpretation,

    species:
      opportunityTypeLineageResolution
        .species,

    available:
      opportunityTypeLineageResolution
        .available,

    classification:
      opportunityTypeLineageResolution
        .classification,

    confidence:
      opportunityTypeLineageResolution
        .confidence,

    leadingCandidate:
      opportunityTypeLineageResolution
        .leadingCandidate,

    candidateTypes:
      opportunityTypeLineageResolution
        .candidateTypes,

    rankedCandidates:
      opportunityTypeLineageResolution
        .rankedCandidates,

    limitations:
      opportunityTypeLineageResolution
        .limitations
  });


assert.equal(
  validateEvidenceLineage(
    directOpportunityTypeLineage
  ).valid,
  true
);

assert.deepEqual(
  directOpportunityTypeLineage
    .observationsUsed,
  opportunityTypeLineageResolution
    .lineage
    .observationsUsed
);

assert.deepEqual(
  directOpportunityTypeLineage
    .observationsUnavailable,
  opportunityTypeLineageResolution
    .lineage
    .observationsUnavailable
);

console.log(
  "PASS Opportunity Type Resolution lineage preserves inherited observation trace"
);


const opportunityTypeBehaviorBaseline =
  resolveBlueMarlinOpportunityType({
    speciesPathwayInterpretation: {
      environmentalPathway:
        blueMarlinPathwayLineageInterpretation
          .environmentalPathway,

      plausibleOpportunityTypes:
        blueMarlinPathwayLineageInterpretation
          .plausibleOpportunityTypes
    },

    relationshipContext:
      relationshipLineageContext,

    oceanEvidence:
      relationshipLineageOceanEvidence,

    oceanOpportunity:
      relationshipLineageOceanOpportunity
  });


assert.equal(
  opportunityTypeLineageResolution
    .available,
  opportunityTypeBehaviorBaseline
    .available
);

assert.equal(
  opportunityTypeLineageResolution
    .leadingCandidate,
  opportunityTypeBehaviorBaseline
    .leadingCandidate
);

assert.deepEqual(
  opportunityTypeLineageResolution
    .candidateTypes,
  opportunityTypeBehaviorBaseline
    .candidateTypes
);

assert.deepEqual(
  opportunityTypeLineageResolution
    .rankedCandidates,
  opportunityTypeBehaviorBaseline
    .rankedCandidates
);

assert.equal(
  opportunityTypeLineageResolution
    .confidence,
  opportunityTypeBehaviorBaseline
    .confidence
);

assert.equal(
  opportunityTypeLineageResolution
    .classification,
  opportunityTypeBehaviorBaseline
    .classification
);

assert.deepEqual(
  opportunityTypeLineageResolution
    .evidenceFor,
  opportunityTypeBehaviorBaseline
    .evidenceFor
);

assert.deepEqual(
  opportunityTypeLineageResolution
    .evidenceMissing,
  opportunityTypeBehaviorBaseline
    .evidenceMissing
);

assert.deepEqual(
  opportunityTypeLineageResolution
    .limitations,
  opportunityTypeBehaviorBaseline
    .limitations
);

assert.deepEqual(
  opportunityTypeLineageResolution
    .knowledgeProfile,
  opportunityTypeBehaviorBaseline
    .knowledgeProfile
);

assert.deepEqual(
  opportunityTypeLineageResolution
    .profileValidation,
  opportunityTypeBehaviorBaseline
    .profileValidation
);

console.log(
  "PASS Opportunity Type Resolution lineage integration preserves established ranking behavior"
);


const missingPathwayLineageResolution =
  resolveBlueMarlinOpportunityType({
    speciesPathwayInterpretation: {
      ...blueMarlinPathwayLineageInterpretation,

      lineage:
        null
    },

    relationshipContext:
      relationshipLineageContext,

    oceanEvidence:
      relationshipLineageOceanEvidence,

    oceanOpportunity:
      relationshipLineageOceanOpportunity
  });


assert.ok(
  missingPathwayLineageResolution
    .lineage
    .inheritedWarnings
    .includes(
      "primary-upstream-lineage-unavailable"
    )
);

assert.deepEqual(
  missingPathwayLineageResolution
    .lineage
    .upstream,
  []
);

assert.equal(
  validateEvidenceLineage(
    missingPathwayLineageResolution
      .lineage
  ).valid,
  true
);

assert.equal(
  missingPathwayLineageResolution
    .leadingCandidate,
  opportunityTypeLineageResolution
    .leadingCandidate
);

assert.deepEqual(
  missingPathwayLineageResolution
    .rankedCandidates,
  opportunityTypeLineageResolution
    .rankedCandidates
);

console.log(
  "PASS Opportunity Type Resolution discloses missing pathway lineage without changing ranking"
);


const malformedPathwayLineageResolution =
  resolveBlueMarlinOpportunityType({
    speciesPathwayInterpretation: {
      ...blueMarlinPathwayLineageInterpretation,

      lineage: {
        producedBy:
          "species-pathway"
      }
    },

    relationshipContext:
      relationshipLineageContext,

    oceanEvidence:
      relationshipLineageOceanEvidence,

    oceanOpportunity:
      relationshipLineageOceanOpportunity
  });


assert.ok(
  malformedPathwayLineageResolution
    .lineage
    .inheritedWarnings
    .includes(
      "primary-upstream-lineage-invalid"
    )
);

assert.deepEqual(
  malformedPathwayLineageResolution
    .lineage
    .upstream,
  []
);

assert.equal(
  validateEvidenceLineage(
    malformedPathwayLineageResolution
      .lineage
  ).valid,
  true
);

assert.equal(
  malformedPathwayLineageResolution
    .leadingCandidate,
  opportunityTypeLineageResolution
    .leadingCandidate
);

assert.deepEqual(
  malformedPathwayLineageResolution
    .candidateTypes,
  opportunityTypeLineageResolution
    .candidateTypes
);

console.log(
  "PASS Opportunity Type Resolution rejects malformed pathway lineage without changing candidates"
);


const invalidProfileLineageResolution =
  resolveSpeciesOpportunityType({
    speciesProfile: {
      species:
        "test-species"
    },

    speciesPathwayInterpretation:
      blueMarlinPathwayLineageInterpretation
  });


assert.equal(
  invalidProfileLineageResolution
    .classification,
  "species-knowledge-profile-invalid"
);

assert.equal(
  invalidProfileLineageResolution
    .lineage
    .producedBy,
  "opportunity-type"
);

assert.deepEqual(
  invalidProfileLineageResolution
    .lineage
    .upstream,
  [
    {
      engine:
        "species-pathway",

      methodVersion:
        "pelora-blue-marlin-pathway-lineage-v1.0"
    }
  ]
);

assert.equal(
  validateEvidenceLineage(
    invalidProfileLineageResolution
      .lineage
  ).valid,
  true
);

assert.equal(
  invalidProfileLineageResolution
    .leadingCandidate,
  null
);

assert.deepEqual(
  invalidProfileLineageResolution
    .rankedCandidates,
  []
);

console.log(
  "PASS Opportunity Type Resolution preserves lineage when species knowledge validation fails"
);


const opportunityTypeLineageHsmResult =
  assessBlueMarlinHabitat({
    oceanOpportunity:
      relationshipLineageOceanOpportunity,

    oceanEvidence:
      relationshipLineageOceanEvidence,

    dataQuality: {
      score:
        0.8
    }
  });


assert.ok(
  opportunityTypeLineageHsmResult
    .opportunityTypeResolution
    .lineage
);

assert.equal(
  opportunityTypeLineageHsmResult
    .opportunityTypeResolution
    .lineage
    .producedBy,
  "opportunity-type"
);

assert.deepEqual(
  opportunityTypeLineageHsmResult
    .opportunityTypeResolution
    .lineage
    .upstream,
  [
    {
      engine:
        "species-pathway",

      methodVersion:
        "pelora-blue-marlin-pathway-lineage-v1.0"
    }
  ]
);

assert.equal(
  validateEvidenceLineage(
    opportunityTypeLineageHsmResult
      .opportunityTypeResolution
      .lineage
  ).valid,
  true
);

console.log(
  "PASS Blue Marlin HSM propagates Species Pathway lineage into opportunity-type resolution"
);


/*
 * ------------------------------------------------------------
 * Lineage Propagation Framework v1.0
 * ------------------------------------------------------------
 */

assert.equal(
  LINEAGE_PROPAGATION_FRAMEWORK
    .rules
    .upstreamValidationRequired,
  true
);

assert.equal(
  LINEAGE_PROPAGATION_FRAMEWORK
    .rules
    .changesScores,
  false
);

assert.equal(
  LINEAGE_PROPAGATION_FRAMEWORK
    .rules
    .biologicalInferenceAllowed,
  false
);


const propagationUpstreamLineage = {
  upstream: [
    {
      engine:
        "data-assessment",

      methodVersion:
        "test-data-assessment-v1.0"
    }
  ],

  observationsUsed: [
    "temperature",
    "currents"
  ],

  observationsUnavailable: [
    "chlorophyll"
  ],

  evidenceProduced: [
    "temperature-evidence",
    "current-evidence"
  ],

  inheritedLimitations: [
    "single-time-snapshot"
  ],

  inheritedWarnings: [
    "chlorophyll-unavailable"
  ],

  producedBy:
    "ocean-evidence",

  methodVersion:
    "test-ocean-evidence-lineage-v1.0"
};


const propagatedLineage =
  propagateEvidenceLineage({
    upstreamLineage:
      propagationUpstreamLineage,

    producedBy:
      "ocean-opportunity",

    methodVersion:
      "test-ocean-opportunity-lineage-v1.0",

    evidenceProduced: [
      "ocean-feature-candidate-assessment"
    ],

    inheritedLimitations: [
      "does-not-establish-biological-significance"
    ],

    inheritedWarnings: [
      "pathway-unresolved"
    ]
  });


assert.deepEqual(
  propagatedLineage
    .upstream,
  [
    {
      engine:
        "ocean-evidence",

      methodVersion:
        "test-ocean-evidence-lineage-v1.0"
    }
  ]
);

assert.deepEqual(
  propagatedLineage
    .observationsUsed,
  [
    "temperature",
    "currents"
  ]
);

assert.deepEqual(
  propagatedLineage
    .observationsUnavailable,
  [
    "chlorophyll"
  ]
);

assert.deepEqual(
  propagatedLineage
    .evidenceProduced,
  [
    "temperature-evidence",
    "current-evidence",
    "ocean-feature-candidate-assessment"
  ]
);

assert.ok(
  propagatedLineage
    .inheritedLimitations
    .includes(
      "single-time-snapshot"
    )
);

assert.ok(
  propagatedLineage
    .inheritedLimitations
    .includes(
      "does-not-establish-biological-significance"
    )
);

assert.ok(
  propagatedLineage
    .inheritedWarnings
    .includes(
      "chlorophyll-unavailable"
    )
);

assert.ok(
  propagatedLineage
    .inheritedWarnings
    .includes(
      "pathway-unresolved"
    )
);

assert.equal(
  validateEvidenceLineage(
    propagatedLineage
  ).valid,
  true
);

console.log(
  "PASS Lineage Propagation preserves upstream observations and appends downstream evidence"
);


const malformedUpstreamPropagation =
  propagateEvidenceLineage({
    upstreamLineage: {
      producedBy:
        "ocean-evidence"
    },

    producedBy:
      "ocean-opportunity",

    methodVersion:
      "test-ocean-opportunity-lineage-v1.0",

    evidenceProduced: [
      "opportunity-pathway-classification"
    ]
  });


assert.deepEqual(
  malformedUpstreamPropagation
    .upstream,
  []
);

assert.deepEqual(
  malformedUpstreamPropagation
    .observationsUsed,
  []
);

assert.ok(
  malformedUpstreamPropagation
    .inheritedWarnings
    .includes(
      "upstream-lineage-invalid"
    )
);

assert.equal(
  validateEvidenceLineage(
    malformedUpstreamPropagation
  ).valid,
  true
);

console.log(
  "PASS Lineage Propagation rejects malformed upstream lineage without invalidating the downstream trace"
);


const missingUpstreamPropagation =
  propagateEvidenceLineage({
    upstreamLineage:
      null,

    producedBy:
      "ocean-opportunity",

    methodVersion:
      "test-ocean-opportunity-lineage-v1.0",

    evidenceProduced: [
      "opportunity-pathway-classification"
    ]
  });


assert.ok(
  missingUpstreamPropagation
    .inheritedWarnings
    .includes(
      "upstream-lineage-unavailable"
    )
);

assert.equal(
  validateEvidenceLineage(
    missingUpstreamPropagation
  ).valid,
  true
);

console.log(
  "PASS Lineage Propagation keeps absent upstream lineage explicitly visible"
);



/*
 * ------------------------------------------------------------
 * Lineage Propagation Framework v2.0
 * ------------------------------------------------------------
 */

assert.equal(
  LINEAGE_PROPAGATION_FRAMEWORK
    .methodVersion,
  "pelora-lineage-propagation-framework-v2.0"
);


const secondaryPropagationLineage = {
  upstream: [
    {
      engine:
        "data-assessment",

      methodVersion:
        "test-secondary-data-assessment-v1.0"
    }
  ],

  observationsUsed: [
    "temperature",
    "chlorophyll"
  ],

  observationsUnavailable: [
    "structure"
  ],

  evidenceProduced: [
    "temperature-evidence",
    "productivity-evidence"
  ],

  inheritedLimitations: [
    "secondary-source-limitation"
  ],

  inheritedWarnings: [
    "secondary-source-warning"
  ],

  producedBy:
    "ocean-evidence",

  methodVersion:
    "test-secondary-ocean-evidence-lineage-v1.0"
};


const multiParentPropagation =
  propagateEvidenceLineage({
    primaryUpstreamLineage:
      propagatedLineage,

    upstreamLineages: [
      secondaryPropagationLineage
    ],

    producedBy:
      "relationship-context",

    methodVersion:
      "test-relationship-context-lineage-v1.0",

    evidenceProduced: [
      "relationship-context"
    ],

    inheritedLimitations: [
      "species-neutral-relationship-context"
    ]
  });


assert.deepEqual(
  multiParentPropagation
    .upstream,
  [
    {
      engine:
        "ocean-opportunity",

      methodVersion:
        "test-ocean-opportunity-lineage-v1.0"
    },

    {
      engine:
        "ocean-evidence",

      methodVersion:
        "test-secondary-ocean-evidence-lineage-v1.0"
    }
  ]
);

assert.deepEqual(
  multiParentPropagation
    .observationsUsed,
  [
    "temperature",
    "currents",
    "chlorophyll"
  ]
);

assert.deepEqual(
  multiParentPropagation
    .observationsUnavailable,
  [
    "chlorophyll",
    "structure"
  ]
);

assert.ok(
  multiParentPropagation
    .evidenceProduced
    .includes(
      "ocean-feature-candidate-assessment"
    )
);

assert.ok(
  multiParentPropagation
    .evidenceProduced
    .includes(
      "productivity-evidence"
    )
);

assert.ok(
  multiParentPropagation
    .evidenceProduced
    .includes(
      "relationship-context"
    )
);

assert.ok(
  multiParentPropagation
    .inheritedLimitations
    .includes(
      "secondary-source-limitation"
    )
);

assert.ok(
  multiParentPropagation
    .inheritedWarnings
    .includes(
      "secondary-source-warning"
    )
);

assert.equal(
  validateEvidenceLineage(
    multiParentPropagation
  ).valid,
  true
);

console.log(
  "PASS Lineage Propagation v2.0 merges multiple governed upstream lineage contracts"
);


const invalidSecondaryPropagation =
  propagateEvidenceLineage({
    primaryUpstreamLineage:
      propagatedLineage,

    upstreamLineages: [
      {
        producedBy:
          "ocean-evidence"
      }
    ],

    producedBy:
      "relationship-context",

    methodVersion:
      "test-relationship-context-lineage-v1.0",

    evidenceProduced: [
      "relationship-context"
    ]
  });


assert.deepEqual(
  invalidSecondaryPropagation
    .upstream,
  [
    {
      engine:
        "ocean-opportunity",

      methodVersion:
        "test-ocean-opportunity-lineage-v1.0"
    }
  ]
);

assert.deepEqual(
  invalidSecondaryPropagation
    .observationsUsed,
  propagatedLineage
    .observationsUsed
);

assert.ok(
  invalidSecondaryPropagation
    .inheritedWarnings
    .includes(
      "upstream-lineage-invalid"
    )
);

assert.ok(
  invalidSecondaryPropagation
    .inheritedWarnings
    .includes(
      "secondary-upstream-lineage-invalid"
    )
);

assert.equal(
  validateEvidenceLineage(
    invalidSecondaryPropagation
  ).valid,
  true
);

console.log(
  "PASS Lineage Propagation v2.0 preserves a valid primary chain when a secondary parent is malformed"
);


const duplicateParentPropagation =
  propagateEvidenceLineage({
    primaryUpstreamLineage:
      propagatedLineage,

    upstreamLineages: [
      propagatedLineage,
      propagationUpstreamLineage
    ],

    producedBy:
      "relationship-context",

    methodVersion:
      "test-relationship-context-lineage-v1.0"
  });


assert.deepEqual(
  duplicateParentPropagation
    .upstream,
  [
    {
      engine:
        "ocean-opportunity",

      methodVersion:
        "test-ocean-opportunity-lineage-v1.0"
    },

    {
      engine:
        "ocean-evidence",

      methodVersion:
        "test-ocean-evidence-lineage-v1.0"
    }
  ]
);

assert.ok(
  duplicateParentPropagation
    .inheritedWarnings
    .includes(
      "duplicate-upstream-lineage-ignored"
    )
);

assert.equal(
  validateEvidenceLineage(
    duplicateParentPropagation
  ).valid,
  true
);

console.log(
  "PASS Lineage Propagation v2.0 collapses duplicate upstream parents"
);


const legacyPropagationCompatibility =
  propagateEvidenceLineage({
    upstreamLineage:
      propagationUpstreamLineage,

    producedBy:
      "ocean-opportunity",

    methodVersion:
      "test-legacy-lineage-v1.0",

    evidenceProduced: [
      "legacy-compatible-evidence"
    ]
  });


assert.deepEqual(
  legacyPropagationCompatibility
    .upstream,
  [
    {
      engine:
        "ocean-evidence",

      methodVersion:
        "test-ocean-evidence-lineage-v1.0"
    }
  ]
);

assert.ok(
  legacyPropagationCompatibility
    .evidenceProduced
    .includes(
      "legacy-compatible-evidence"
    )
);

assert.equal(
  validateEvidenceLineage(
    legacyPropagationCompatibility
  ).valid,
  true
);

console.log(
  "PASS Lineage Propagation v2.0 preserves the original single-upstream API"
);


/*
 * ------------------------------------------------------------
 * Ocean Opportunity Lineage v1.0
 * ------------------------------------------------------------
 */

const lineageOceanEvidence =
  assessOceanEvidence({
    latitude:
      28.25,

    longitude:
      -85.58,

    sst: {
      temperatureFahrenheit:
        82,

      observedAt:
        "2026-07-28T18:00:00.000Z"
    },

    chlorophyll: {
      concentrationMgM3:
        0.2,

      observedAt:
        "2026-07-28T18:00:00.000Z"
    },

    currents: {
      speedKnots:
        1.5,

      directionDegrees:
        220,

      observedAt:
        "2026-07-28T18:00:00.000Z"
    },

    dataQuality: {
      methodVersion:
        "test-data-quality-v1.0",

      overall: {
        classification:
          "complete"
      }
    }
  });


const lineageOceanOpportunity =
  assessOceanOpportunity({
    oceanEvidence:
      lineageOceanEvidence
  });


assert.ok(
  lineageOceanOpportunity
    .lineage
);

assert.deepEqual(
  lineageOceanOpportunity
    .lineage
    .upstream,
  [
    {
      engine:
        "ocean-evidence",

      methodVersion:
        "pelora-ocean-evidence-lineage-v1.0"
    }
  ]
);

assert.deepEqual(
  lineageOceanOpportunity
    .lineage
    .observationsUsed,
  lineageOceanEvidence
    .lineage
    .observationsUsed
);

assert.deepEqual(
  lineageOceanOpportunity
    .lineage
    .observationsUnavailable,
  lineageOceanEvidence
    .lineage
    .observationsUnavailable
);

assert.ok(
  lineageOceanOpportunity
    .lineage
    .evidenceProduced
    .includes(
      "ocean-feature-candidate-assessment"
    )
);

assert.ok(
  lineageOceanOpportunity
    .lineage
    .evidenceProduced
    .includes(
      "opportunity-pathway-classification"
    )
);

assert.equal(
  lineageOceanOpportunity
    .lineage
    .producedBy,
  "ocean-opportunity"
);

assert.equal(
  lineageOceanOpportunity
    .lineage
    .methodVersion,
  "pelora-ocean-opportunity-lineage-v1.0"
);

assert.equal(
  validateEvidenceLineage(
    lineageOceanOpportunity
      .lineage
  ).valid,
  true
);

assert.equal(
  lineageOceanOpportunity
    .methodVersion,
  "pelora-ocean-opportunity-v1.1"
);

console.log(
  "PASS Ocean Opportunity extends Ocean Evidence lineage without changing established behavior"
);


const noLineageOceanOpportunity =
  assessOceanOpportunity({
    oceanEvidence: {
      groups: {},

      confidence: {
        score:
          0,

        level:
          "Very Low"
      },

      environmentalOpportunityEvidence: {
        combined: {
          pathways: {
            structureAssociated: {
              available:
                false
            },

            openWater: {
              available:
                false,

              organized:
                false
            },

            persistence: {
              available:
                false
            }
          }
        }
      },

      summary: {
        availableGroupCount:
          0
      },

      limitations: []
    }
  });


assert.ok(
  noLineageOceanOpportunity
    .lineage
    .inheritedWarnings
    .includes(
      "upstream-lineage-unavailable"
    )
);

assert.ok(
  noLineageOceanOpportunity
    .lineage
    .inheritedWarnings
    .includes(
      "no-ocean-feature-candidates-produced"
    )
);

assert.ok(
  noLineageOceanOpportunity
    .lineage
    .inheritedWarnings
    .includes(
      "opportunity-pathway-unresolved"
    )
);

assert.equal(
  validateEvidenceLineage(
    noLineageOceanOpportunity
      .lineage
  ).valid,
  true
);

assert.equal(
  noLineageOceanOpportunity
    .confidence
    .score,
  0
);

assert.equal(
  noLineageOceanOpportunity
    .pathwayClassification
    .classification,
  "insufficient-evidence"
);

console.log(
  "PASS Ocean Opportunity lineage discloses missing upstream trace while preserving insufficient-evidence behavior"
);


/**
 * ------------------------------------------------------------
 * Current Gradient Analysis Contract v1.0
 * ------------------------------------------------------------
 */

const buildGradientProjection =
  projections => ({
    available:
      projections.length >= 3,

    analysisType:
      "current-vector-projection",

    coverage:
      projections.length === 4
        ? "complete"
        : projections.length >= 3
          ? "partial"
          : "insufficient",

    requestedProjectionCount:
      4,

    validProjectionCount:
      projections.length,

    failedProjectionCount:
      4 - projections.length,

    sufficientCoverage:
      projections.length >= 3,

    sampleRadiusNauticalMiles:
      15,

    projections,

    limitations:
      [],

    contractVersion:
      "pelora-current-vector-projection-v1"
  });


const uniformGradientProjections = [
  {
    sampleDirection:
      "north",

    available:
      true,

    requestedLatitude:
      29.25,

    requestedLongitude:
      -87,

    speedKnots:
      0.972,

    directionDegrees:
      90,

    eastwardMetersPerSecond:
      0.5,

    northwardMetersPerSecond:
      0,

    signedRadialMetersPerSecond:
      0,

    signedClockwiseTangentialMetersPerSecond:
      0.5
  },

  {
    sampleDirection:
      "east",

    available:
      true,

    requestedLatitude:
      29,

    requestedLongitude:
      -86.713,

    speedKnots:
      0.972,

    directionDegrees:
      90,

    eastwardMetersPerSecond:
      0.5,

    northwardMetersPerSecond:
      0,

    signedRadialMetersPerSecond:
      -0.5,

    signedClockwiseTangentialMetersPerSecond:
      0
  },

  {
    sampleDirection:
      "south",

    available:
      true,

    requestedLatitude:
      28.75,

    requestedLongitude:
      -87,

    speedKnots:
      0.972,

    directionDegrees:
      90,

    eastwardMetersPerSecond:
      0.5,

    northwardMetersPerSecond:
      0,

    signedRadialMetersPerSecond:
      0,

    signedClockwiseTangentialMetersPerSecond:
      -0.5
  },

  {
    sampleDirection:
      "west",

    available:
      true,

    requestedLatitude:
      29,

    requestedLongitude:
      -87.287,

    speedKnots:
      0.972,

    directionDegrees:
      90,

    eastwardMetersPerSecond:
      0.5,

    northwardMetersPerSecond:
      0,

    signedRadialMetersPerSecond:
      0.5,

    signedClockwiseTangentialMetersPerSecond:
      0
  }
];


const uniformCurrentGradient =
  buildCurrentGradientAnalysis(
    buildGradientProjection(
      uniformGradientProjections
    )
  );

assert.equal(
  uniformCurrentGradient.available,
  true
);

assert.equal(
  uniformCurrentGradient.coverage,
  "complete"
);

assert.equal(
  uniformCurrentGradient.validAxisCount,
  2
);

assert.equal(
  uniformCurrentGradient.failedAxisCount,
  0
);

assert.equal(
  uniformCurrentGradient.axisComparisons.length,
  2
);

assert.equal(
  uniformCurrentGradient.measurements
    .maximumTotalVectorGradientMetersPerSecondPerNauticalMile,
  0
);

assert.equal(
  uniformCurrentGradient.contractVersion,
  "pelora-current-gradient-v1"
);

assert.equal(
  uniformCurrentGradient.upstreamContract
    .version,
  "pelora-current-vector-projection-v1"
);

console.log(
  "PASS Current Gradient Analysis measures a complete uniform current field"
);


const changingGradientProjections =
  uniformGradientProjections.map(
    projection => ({
      ...projection
    })
  );

changingGradientProjections[2] = {
  ...changingGradientProjections[2],

  speedKnots:
    0.972,

  directionDegrees:
    270,

  eastwardMetersPerSecond:
    -0.5,

  signedClockwiseTangentialMetersPerSecond:
    0.5
};

changingGradientProjections[3] = {
  ...changingGradientProjections[3],

  directionDegrees:
    0,

  eastwardMetersPerSecond:
    0,

  northwardMetersPerSecond:
    0.5,

  signedRadialMetersPerSecond:
    0,

  signedClockwiseTangentialMetersPerSecond:
    0.5
};


const changingCurrentGradient =
  buildCurrentGradientAnalysis(
    buildGradientProjection(
      changingGradientProjections
    )
  );

assert.equal(
  changingCurrentGradient.available,
  true
);

assert.equal(
  changingCurrentGradient.validAxisCount,
  2
);

assert.ok(
  changingCurrentGradient.measurements
    .maximumTotalVectorGradientMetersPerSecondPerNauticalMile >
    0
);

assert.ok(
  changingCurrentGradient.measurements
    .maximumTangentialGradientMetersPerSecondPerNauticalMile >
    0
);

assert.ok(
  changingCurrentGradient.axisComparisons.some(
    comparison =>
      comparison.available ===
        true &&
      comparison
        .totalVectorDifferenceMetersPerSecond >
        0
  )
);

console.log(
  "PASS Current Gradient Analysis measures horizontal vector change across opposing axes"
);


const partialCurrentGradient =
  buildCurrentGradientAnalysis(
    buildGradientProjection(
      uniformGradientProjections.slice(
        0,
        3
      )
    )
  );

assert.equal(
  partialCurrentGradient.available,
  true
);

assert.equal(
  partialCurrentGradient.coverage,
  "partial"
);

assert.equal(
  partialCurrentGradient.validAxisCount,
  1
);

assert.equal(
  partialCurrentGradient.failedAxisCount,
  1
);

assert.equal(
  partialCurrentGradient.axisComparisons
    .find(
      comparison =>
        comparison.axis ===
        "east-west"
    )
    .reason,
  "missing-opposing-projection"
);

console.log(
  "PASS Current Gradient Analysis reports partial opposing-axis coverage"
);


const unavailableCurrentGradient =
  buildCurrentGradientAnalysis(
    buildGradientProjection(
      uniformGradientProjections.slice(
        0,
        2
      )
    )
  );

assert.equal(
  unavailableCurrentGradient.available,
  false
);

assert.equal(
  unavailableCurrentGradient.sufficientCoverage,
  false
);

assert.equal(
  unavailableCurrentGradient.coverage,
  "unavailable"
);

console.log(
  "PASS Current Gradient Analysis requires sufficient vector-projection coverage"
);


/**
 * ------------------------------------------------------------
 * Current Shear Analysis Contract v1.0
 * ------------------------------------------------------------
 */

const buildShearGradient = ({
  coverage = "complete",
  axisComparisons = []
} = {}) => ({
  available:
    axisComparisons.some(
      comparison =>
        comparison.available ===
        true
    ),

  analysisType:
    "current-gradient-analysis",

  coverage,

  requestedAxisCount:
    2,

  validAxisCount:
    axisComparisons.filter(
      comparison =>
        comparison.available ===
        true
    ).length,

  failedAxisCount:
    axisComparisons.filter(
      comparison =>
        comparison.available !==
        true
    ).length,

  sufficientCoverage:
    axisComparisons.some(
      comparison =>
        comparison.available ===
        true
    ),

  axisComparisons,

  limitations:
    [],

  contractVersion:
    "pelora-current-gradient-v1"
});


const uniformShearGradient =
  buildShearGradient({
    axisComparisons: [
      {
        axis:
          "north-south",

        available:
          true,

        totalVectorGradientMetersPerSecondPerNauticalMile:
          0,

        tangentialGradientMetersPerSecondPerNauticalMile:
          0,

        radialAsymmetryGradientMetersPerSecondPerNauticalMile:
          0
      },

      {
        axis:
          "east-west",

        available:
          true,

        totalVectorGradientMetersPerSecondPerNauticalMile:
          0.004,

        tangentialGradientMetersPerSecondPerNauticalMile:
          0.003,

        radialAsymmetryGradientMetersPerSecondPerNauticalMile:
          0.001
      }
    ]
  });


const uniformCurrentShear =
  buildCurrentShearAnalysis(
    uniformShearGradient
  );

assert.equal(
  uniformCurrentShear.available,
  true
);

assert.equal(
  uniformCurrentShear.currentShearDetected,
  false
);

assert.equal(
  uniformCurrentShear.shearType,
  "no-shear-candidate"
);

assert.equal(
  uniformCurrentShear.shearState,
  "not-supported"
);

assert.equal(
  uniformCurrentShear.shearStrength,
  "none"
);

assert.equal(
  uniformCurrentShear.contractVersion,
  "pelora-current-shear-v1"
);

console.log(
  "PASS Current Shear Analysis rejects weak horizontal gradients"
);


const measurableShearGradient =
  buildShearGradient({
    axisComparisons: [
      {
        axis:
          "north-south",

        available:
          true,

        totalVectorGradientMetersPerSecondPerNauticalMile:
          0.014,

        tangentialGradientMetersPerSecondPerNauticalMile:
          0.011,

        radialAsymmetryGradientMetersPerSecondPerNauticalMile:
          0.006
      },

      {
        axis:
          "east-west",

        available:
          true,

        totalVectorGradientMetersPerSecondPerNauticalMile:
          0.004,

        tangentialGradientMetersPerSecondPerNauticalMile:
          0.003,

        radialAsymmetryGradientMetersPerSecondPerNauticalMile:
          0.002
      }
    ]
  });


const measurableCurrentShear =
  buildCurrentShearAnalysis(
    measurableShearGradient
  );

assert.equal(
  measurableCurrentShear.available,
  true
);

assert.equal(
  measurableCurrentShear.currentShearDetected,
  true
);

assert.equal(
  measurableCurrentShear.shearType,
  "horizontal-shear-candidate"
);

assert.equal(
  measurableCurrentShear.shearState,
  "candidate"
);

assert.equal(
  measurableCurrentShear.shearStrength,
  "measurable"
);

assert.deepEqual(
  measurableCurrentShear.evidence
    .supportingAxes,
  [
    "north-south"
  ]
);

console.log(
  "PASS Current Shear Analysis identifies a measurable horizontal shear candidate"
);


const pronouncedShearGradient =
  buildShearGradient({
    axisComparisons: [
      {
        axis:
          "north-south",

        available:
          true,

        totalVectorGradientMetersPerSecondPerNauticalMile:
          0.024,

        tangentialGradientMetersPerSecondPerNauticalMile:
          0.019,

        radialAsymmetryGradientMetersPerSecondPerNauticalMile:
          0.011
      },

      {
        axis:
          "east-west",

        available:
          true,

        totalVectorGradientMetersPerSecondPerNauticalMile:
          0.013,

        tangentialGradientMetersPerSecondPerNauticalMile:
          0.009,

        radialAsymmetryGradientMetersPerSecondPerNauticalMile:
          0.007
      }
    ]
  });


const pronouncedCurrentShear =
  buildCurrentShearAnalysis(
    pronouncedShearGradient
  );

assert.equal(
  pronouncedCurrentShear.currentShearDetected,
  true
);

assert.equal(
  pronouncedCurrentShear.shearType,
  "pronounced-horizontal-shear-candidate"
);

assert.equal(
  pronouncedCurrentShear.shearStrength,
  "pronounced"
);

assert.equal(
  pronouncedCurrentShear.evidence
    .strongAxisCount,
  1
);

assert.equal(
  pronouncedCurrentShear.evidence
    .meaningfulAxisCount,
  2
);

console.log(
  "PASS Current Shear Analysis identifies pronounced horizontal shear"
);


const partialShearGradient =
  buildShearGradient({
    coverage:
      "partial",

    axisComparisons: [
      {
        axis:
          "north-south",

        available:
          true,

        totalVectorGradientMetersPerSecondPerNauticalMile:
          0.018,

        tangentialGradientMetersPerSecondPerNauticalMile:
          0.012,

        radialAsymmetryGradientMetersPerSecondPerNauticalMile:
          0.008
      },

      {
        axis:
          "east-west",

        available:
          false,

        reason:
          "missing-opposing-projection"
      }
    ]
  });


const partialCurrentShear =
  buildCurrentShearAnalysis(
    partialShearGradient
  );

assert.equal(
  partialCurrentShear.available,
  true
);

assert.equal(
  partialCurrentShear.currentShearDetected,
  false
);

assert.equal(
  partialCurrentShear.shearType,
  "localized-horizontal-velocity-change"
);

assert.equal(
  partialCurrentShear.shearState,
  "incomplete-support"
);

console.log(
  "PASS Current Shear Analysis preserves localized change under partial coverage"
);


const unavailableCurrentShear =
  buildCurrentShearAnalysis({
    available:
      false,

    coverage:
      "unavailable",

    sufficientCoverage:
      false,

    axisComparisons:
      [],

    contractVersion:
      "pelora-current-gradient-v1"
  });

assert.equal(
  unavailableCurrentShear.available,
  false
);

assert.equal(
  unavailableCurrentShear.currentShearDetected,
  false
);

assert.equal(
  unavailableCurrentShear.shearType,
  "unavailable"
);

assert.equal(
  unavailableCurrentShear.shearState,
  "insufficient-evidence"
);

console.log(
  "PASS Current Shear Analysis requires available gradient evidence"
);