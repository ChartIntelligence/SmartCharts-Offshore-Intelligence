import assert from "node:assert/strict";

import {
  buildCurrentGradientAnalysis,
  buildCurrentShearAnalysis,
  buildSurfaceWaterCharacterAnalysis,
  buildWaterMassAnalysis,
  buildMixingZoneAnalysis,
  buildEnvironmentalTransitionAnalysis,
  buildOceanFrontAnalysis,
  buildOceanPhysicsExplainabilitySummary,
  buildOceanPhysicsExplainabilityLineage,
  buildOceanOrganizationAnalysis,
  buildObservationSnapshot,
  buildIntelligenceSnapshot,
  buildSnapshotMetadata,
  buildOceanSnapshot,
  buildBackendSupabaseConfiguration,
  retrieveOceanMemoryRows,
  buildOceanMemoryStorage,
  buildOceanMemoryStorageRecordFromRow,
  buildOceanSnapshotRetrieval,
  buildHistoricalSnapshotQuery,
  kilometersBetween,
  buildLatestOceanSnapshotQuery,
  buildPreviousOceanSnapshotQuery,
  buildOceanSnapshotByIdQuery,
  buildHistoricalOceanSnapshotWindowQuery,
  buildNearbyOceanHistoryQuery,
  buildOceanMemoryTimeSeries,
  buildOceanChangeFromTimeSeries,
  buildOceanEvolution,
  buildTemporalOceanExplainability,
  buildHistoricalSnapshotBackfill,
  buildPersistenceEvidence,
  buildSeaSurfaceTemperaturePersistence,
  buildCurrentPersistence,
  buildCurrentEdgePersistence,
  buildCurrentShearPersistence,
  buildCurrentConvergencePersistence,
  buildEnvironmentalTransitionPersistence,
  buildSurfaceWaterCharacterPersistence,
  buildWaterMassPersistence,
  buildMixingZonePersistence,
  buildOceanFrontPersistence,
  buildProductivityPersistence,
  buildClarityPersistence,
  buildOceanPersistence,
  OCEAN_PERSISTENCE_LIFECYCLE_STATES,
  OCEAN_PERSISTENCE_FEATURE_FAMILIES,
  buildFeaturePersistenceContract,
  buildTemporalFeatureContinuity,
  buildGovernedFeaturePosition,
  buildOceanChangeAnalysis,
  buildCurrentEdgeAnalysis,
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
  "pelora-ocean-evidence-v2.0"
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
    "habitat-suitability",
    "ocean-physics-explainability"
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
  "pelora-ocean-evidence-v2.0"
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


/**
 * ------------------------------------------------------------
 * Current Edge Analysis Contract v1.0
 * ------------------------------------------------------------
 */

const buildEdgeGradient = ({
  available = true,
  coverage = "complete"
} = {}) => ({
  available,

  coverage,

  sufficientCoverage:
    available,

  limitations:
    [],

  contractVersion:
    "pelora-current-gradient-v1"
});


const buildEdgeShear = ({
  available = true,
  detected = false,
  state = "not-supported",
  type = "no-shear-candidate",
  strength = "none",
  completeAxisCoverage = true,
  supportingAxes = []
} = {}) => ({
  available,

  currentShearDetected:
    detected,

  shearState:
    state,

  shearType:
    type,

  shearStrength:
    strength,

  evidence: {
    completeAxisCoverage,

    supportingAxes,

    maximumTotalVectorGradientMetersPerSecondPerNauticalMile:
      detected
        ? 0.015
        : 0.004
  },

  limitations:
    [],

  contractVersion:
    "pelora-current-shear-v1"
});


const buildEdgePattern = ({
  available = true,
  type = "uniform-flow-pattern",
  state = "observed",
  dominantVariation = "none",
  speedRangeKnots = 0.1,
  maximumDirectionDifferenceDegrees = 10
} = {}) => ({
  available,

  patternType:
    type,

  patternState:
    state,

  dominantVariation,

  evidence: {
    speedRangeKnots,

    maximumDirectionDifferenceDegrees
  },

  limitations:
    [],

  thresholdVersion:
    "pelora-current-spatial-pattern-v1"
});


const buildEdgeConvergence = ({
  available = true,
  detected = false
} = {}) => ({
  available,

  currentConvergenceDetected:
    detected,

  limitations:
    [],

  contractVersion:
    "pelora-current-convergence-v1"
});


const unavailableCurrentEdge =
  buildCurrentEdgeAnalysis(
    buildEdgeGradient({
      available:
        false,

      coverage:
        "unavailable"
    }),

    buildEdgeShear({
      available:
        false,

      completeAxisCoverage:
        false
    }),

    buildEdgePattern({
      available:
        false
    }),

    buildEdgeConvergence({
      available:
        false
    })
  );

assert.equal(
  unavailableCurrentEdge.available,
  false
);

assert.equal(
  unavailableCurrentEdge.edgeType,
  "unavailable"
);

assert.equal(
  unavailableCurrentEdge.edgeState,
  "insufficient-evidence"
);

console.log(
  "PASS Current Edge Analysis requires available gradient, shear, and spatial-pattern evidence"
);


const uniformCurrentEdge =
  buildCurrentEdgeAnalysis(
    buildEdgeGradient(),

    buildEdgeShear(),

    buildEdgePattern(),

    buildEdgeConvergence()
  );

assert.equal(
  uniformCurrentEdge.available,
  true
);

assert.equal(
  uniformCurrentEdge.currentEdgeDetected,
  false
);

assert.equal(
  uniformCurrentEdge.edgeType,
  "no-edge-candidate"
);

assert.equal(
  uniformCurrentEdge.edgeState,
  "not-supported"
);

console.log(
  "PASS Current Edge Analysis rejects a uniform current field"
);


const measurableCurrentEdge =
  buildCurrentEdgeAnalysis(
    buildEdgeGradient(),

    buildEdgeShear({
      detected:
        true,

      state:
        "candidate",

      type:
        "horizontal-shear-candidate",

      strength:
        "measurable",

      supportingAxes: [
        "east-west"
      ]
    }),

    buildEdgePattern({
      type:
        "speed-transition-pattern",

      state:
        "candidate",

      dominantVariation:
        "speed",

      speedRangeKnots:
        0.7
    }),

    buildEdgeConvergence()
  );

assert.equal(
  measurableCurrentEdge.currentEdgeDetected,
  true
);

assert.equal(
  measurableCurrentEdge.edgeType,
  "current-edge-candidate"
);

assert.equal(
  measurableCurrentEdge.edgeStrength,
  "measurable"
);

assert.equal(
  measurableCurrentEdge.dominantTransition,
  "speed"
);

console.log(
  "PASS Current Edge Analysis identifies a corroborated current-edge candidate"
);


const pronouncedCurrentEdge =
  buildCurrentEdgeAnalysis(
    buildEdgeGradient(),

    buildEdgeShear({
      detected:
        true,

      state:
        "candidate",

      type:
        "pronounced-horizontal-shear-candidate",

      strength:
        "pronounced",

      supportingAxes: [
        "north-south",
        "east-west"
      ]
    }),

    buildEdgePattern({
      type:
        "pronounced-mixed-transition-pattern",

      state:
        "candidate",

      dominantVariation:
        "mixed",

      speedRangeKnots:
        1.2,

      maximumDirectionDifferenceDegrees:
        75
    }),

    buildEdgeConvergence({
      detected:
        true
    })
  );

assert.equal(
  pronouncedCurrentEdge.currentEdgeDetected,
  true
);

assert.equal(
  pronouncedCurrentEdge.edgeType,
  "pronounced-current-edge-candidate"
);

assert.equal(
  pronouncedCurrentEdge.edgeStrength,
  "pronounced"
);

assert.equal(
  pronouncedCurrentEdge.evidence
    .convergenceCandidateSupported,
  true
);

console.log(
  "PASS Current Edge Analysis identifies a pronounced current-edge candidate"
);


const localizedCurrentTransition =
  buildCurrentEdgeAnalysis(
    buildEdgeGradient({
      coverage:
        "partial"
    }),

    buildEdgeShear({
      detected:
        false,

      state:
        "incomplete-support",

      type:
        "localized-horizontal-velocity-change",

      strength:
        "localized",

      completeAxisCoverage:
        false,

      supportingAxes: [
        "east-west"
      ]
    }),

    buildEdgePattern({
      type:
        "speed-transition-pattern",

      state:
        "candidate",

      dominantVariation:
        "speed",

      speedRangeKnots:
        0.8
    }),

    buildEdgeConvergence()
  );

assert.equal(
  localizedCurrentTransition.currentEdgeDetected,
  false
);

assert.equal(
  localizedCurrentTransition.edgeType,
  "localized-current-transition"
);

assert.equal(
  localizedCurrentTransition.edgeState,
  "incomplete-support"
);

console.log(
  "PASS Current Edge Analysis preserves localized transition evidence under partial coverage"
);


const transitionWithoutShear =
  buildCurrentEdgeAnalysis(
    buildEdgeGradient(),

    buildEdgeShear(),

    buildEdgePattern({
      type:
        "directional-transition-pattern",

      state:
        "candidate",

      dominantVariation:
        "direction",

      maximumDirectionDifferenceDegrees:
        45
    }),

    buildEdgeConvergence()
  );

assert.equal(
  transitionWithoutShear.currentEdgeDetected,
  false
);

assert.equal(
  transitionWithoutShear.edgeType,
  "no-edge-candidate"
);

console.log(
  "PASS Current Edge Analysis does not promote an uncorroborated transition into an edge"
);


assert.equal(
  pronouncedCurrentEdge.contractVersion,
  "pelora-current-edge-v1"
);

console.log(
  "PASS Current Edge Analysis exposes the governed v1 contract"
);



/**
 * ------------------------------------------------------------
 * Surface Water Character Analysis Contract v1.0
 * ------------------------------------------------------------
 */

const buildSurfaceTemperature = ({
  available = true,
  classification = "temperature-only",
  spatialClassification = null,
  coverage = "unavailable",
  rangeFahrenheit = null,
  orientationClassification =
    "no-clear-directional-transition"
} = {}) => ({
  available,

  classification,

  values: {
    temperatureFahrenheit:
      available
        ? 82
        : null,

    temperatureBand:
      available
        ? "warm"
        : null,

    spatialClassification,

    coverage,

    spatialRangeFahrenheit:
      rangeFahrenheit
  },

  orientation: {
    classification:
      orientationClassification,

    dominantAxis:
      orientationClassification ===
        "directional-temperature-transition"
        ? "east-west"
        : null,

    warmSide:
      orientationClassification ===
        "directional-temperature-transition"
        ? "east"
        : null,

    coolSide:
      orientationClassification ===
        "directional-temperature-transition"
        ? "west"
        : null,

    dominantDifferenceFahrenheit:
      orientationClassification ===
        "directional-temperature-transition"
        ? rangeFahrenheit
        : null
  },

  limitations:
    [],

  interpretation:
    "species-neutral-temperature-structure-evidence"
});


const buildSurfaceProductivity = ({
  available = true,
  classification = "clear-blue-water"
} = {}) => ({
  available,

  classification,

  values: {
    concentrationMgM3:
      available
        ? 0.15
        : null,

    productivityClassification:
      classification,

    freshness:
      "recent"
  },

  limitations:
    [],

  interpretation:
    "species-neutral-surface-productivity-evidence"
});


const buildSurfaceClarity = ({
  available = true,
  classification = "clear-surface-water"
} = {}) => ({
  available,

  classification,

  limitations:
    [],

  interpretation:
    "species-neutral-surface-water-clarity-evidence"
});


const buildSurfaceCurrent = ({
  edgeAvailable = false,
  edgeDetected = false,
  edgeType = "no-edge-candidate",
  edgeStrength = "none"
} = {}) => ({
  spatialAnalysis: {
    edge: {
      available:
        edgeAvailable,

      currentEdgeDetected:
        edgeDetected,

      edgeState:
        edgeDetected
          ? "candidate"
          : "not-supported",

      edgeType,

      edgeStrength,

      limitations:
        [],

      contractVersion:
        "pelora-current-edge-v1"
    }
  }
});


const unavailableSurfaceWaterCharacter =
  buildSurfaceWaterCharacterAnalysis({
    temperature:
      buildSurfaceTemperature({
        available:
          false
      }),

    productivity:
      buildSurfaceProductivity({
        available:
          false,

        classification:
          "unavailable"
      }),

    clarity:
      buildSurfaceClarity({
        available:
          false,

        classification:
          "unavailable"
      }),

    current:
      buildSurfaceCurrent()
  });

assert.equal(
  unavailableSurfaceWaterCharacter.available,
  false
);

assert.equal(
  unavailableSurfaceWaterCharacter.classification,
  "unavailable"
);

console.log(
  "PASS Surface Water Character Analysis requires at least one local observation"
);


const singleObservationSurfaceWater =
  buildSurfaceWaterCharacterAnalysis({
    temperature:
      buildSurfaceTemperature(),

    productivity:
      buildSurfaceProductivity(),

    clarity:
      buildSurfaceClarity(),

    current:
      buildSurfaceCurrent()
  });

assert.equal(
  singleObservationSurfaceWater.classification,
  "single-observation-surface-water-character"
);

assert.equal(
  singleObservationSurfaceWater.state,
  "observed"
);

console.log(
  "PASS Surface Water Character Analysis preserves local observations without inventing spatial water masses"
);


const uniformSurfaceWater =
  buildSurfaceWaterCharacterAnalysis({
    temperature:
      buildSurfaceTemperature({
        classification:
          "uniform-water",

        spatialClassification:
          "uniform-water",

        coverage:
          "sufficient",

        rangeFahrenheit:
          0.2
      }),

    productivity:
      buildSurfaceProductivity(),

    clarity:
      buildSurfaceClarity(),

    current:
      buildSurfaceCurrent()
  });

assert.equal(
  uniformSurfaceWater.classification,
  "uniform-thermal-surface-water-character"
);

assert.equal(
  uniformSurfaceWater.boundaryContext,
  "not-established"
);

console.log(
  "PASS Surface Water Character Analysis identifies a uniform thermal surface-water field"
);


const moderateThermalSurfaceWater =
  buildSurfaceWaterCharacterAnalysis({
    temperature:
      buildSurfaceTemperature({
        classification:
          "moderate-temperature-structure",

        spatialClassification:
          "moderate-temperature-transition",

        coverage:
          "sufficient",

        rangeFahrenheit:
          1.3,

        orientationClassification:
          "directional-temperature-transition"
      }),

    productivity:
      buildSurfaceProductivity({
        classification:
          "productive-blue-green-transition"
      }),

    clarity:
      buildSurfaceClarity({
        classification:
          "transitional-surface-water"
      }),

    current:
      buildSurfaceCurrent()
  });

assert.equal(
  moderateThermalSurfaceWater.classification,
  "surface-water-near-moderate-thermal-transition"
);

assert.equal(
  moderateThermalSurfaceWater.spatialContext
    .directionalThermalTransition,
  true
);

console.log(
  "PASS Surface Water Character Analysis identifies moderate thermal-boundary context"
);


const currentEdgeSurfaceWater =
  buildSurfaceWaterCharacterAnalysis({
    temperature:
      buildSurfaceTemperature(),

    productivity:
      buildSurfaceProductivity(),

    clarity:
      buildSurfaceClarity(),

    current:
      buildSurfaceCurrent({
        edgeAvailable:
          true,

        edgeDetected:
          true,

        edgeType:
          "current-edge-candidate",

        edgeStrength:
          "measurable"
      })
  });

assert.equal(
  currentEdgeSurfaceWater.classification,
  "surface-water-character-near-current-edge"
);

assert.equal(
  currentEdgeSurfaceWater.spatialContext
    .currentEdgeDetected,
  true
);

console.log(
  "PASS Surface Water Character Analysis preserves current-edge boundary context"
);


const combinedSurfaceBoundary =
  buildSurfaceWaterCharacterAnalysis({
    temperature:
      buildSurfaceTemperature({
        classification:
          "strong-temperature-break-candidate",

        spatialClassification:
          "strong-temperature-break-candidate",

        coverage:
          "sufficient",

        rangeFahrenheit:
          2.4,

        orientationClassification:
          "directional-temperature-transition"
      }),

    productivity:
      buildSurfaceProductivity({
        classification:
          "productive-blue-green-transition"
      }),

    clarity:
      buildSurfaceClarity({
        classification:
          "transitional-surface-water"
      }),

    current:
      buildSurfaceCurrent({
        edgeAvailable:
          true,

        edgeDetected:
          true,

        edgeType:
          "pronounced-current-edge-candidate",

        edgeStrength:
          "pronounced"
      })
  });

assert.equal(
  combinedSurfaceBoundary.classification,
  "combined-thermal-current-boundary-context"
);

assert.equal(
  combinedSurfaceBoundary.boundaryContext,
  "pronounced-thermal-and-current-boundary"
);

assert.equal(
  combinedSurfaceBoundary.contractVersion,
  "pelora-surface-water-character-v1"
);

console.log(
  "PASS Surface Water Character Analysis identifies combined thermal-current boundary context"
);



/**
 * ------------------------------------------------------------
 * Water Mass Analysis Contract v1.0
 * ------------------------------------------------------------
 */

const buildWaterMassSurfaceCharacter = ({
  available = true
} = {}) => ({
  available,

  limitations:
    [],

  contractVersion:
    "pelora-surface-water-character-v1"
});


const buildWaterMassTemperature = ({
  available = true,
  classification = "temperature-only",
  spatialClassification = null,
  coverage = "unavailable",
  directional = false
} = {}) => ({
  available,

  classification,

  values: {
    coverage,

    spatialClassification
  },

  orientation: {
    classification:
      directional
        ? "directional-temperature-transition"
        : "no-clear-directional-transition"
  },

  limitations:
    [],

  interpretation:
    "species-neutral-temperature-structure-evidence"
});


const buildWaterMassProductivity = ({
  available = true
} = {}) => ({
  available,

  limitations:
    [],

  interpretation:
    "species-neutral-surface-productivity-evidence"
});


const buildWaterMassClarity = ({
  available = true
} = {}) => ({
  available,

  limitations:
    [],

  interpretation:
    "species-neutral-surface-water-clarity-evidence"
});


const buildWaterMassCurrent = ({
  edgeAvailable = false,
  edgeDetected = false,
  edgeType = "no-edge-candidate",
  edgeStrength = "none"
} = {}) => ({
  spatialAnalysis: {
    edge: {
      available:
        edgeAvailable,

      currentEdgeDetected:
        edgeDetected,

      edgeState:
        edgeDetected
          ? "candidate"
          : "not-supported",

      edgeType,

      edgeStrength,

      limitations:
        [],

      contractVersion:
        "pelora-current-edge-v1"
    }
  }
});


const unavailableWaterMassAnalysis =
  buildWaterMassAnalysis({
    surfaceWaterCharacter:
      buildWaterMassSurfaceCharacter({
        available:
          false
      }),

    temperature:
      buildWaterMassTemperature({
        available:
          false
      }),

    productivity:
      buildWaterMassProductivity({
        available:
          false
      }),

    clarity:
      buildWaterMassClarity({
        available:
          false
      }),

    current:
      buildWaterMassCurrent()
  });

assert.equal(
  unavailableWaterMassAnalysis.available,
  false
);

assert.equal(
  unavailableWaterMassAnalysis.classification,
  "unavailable"
);

assert.equal(
  unavailableWaterMassAnalysis
    .distinctAdjacentWaterMassesEstablished,
  false
);

console.log(
  "PASS Water Mass Analysis requires available surface-water character"
);


const localOnlyWaterMassAnalysis =
  buildWaterMassAnalysis({
    surfaceWaterCharacter:
      buildWaterMassSurfaceCharacter(),

    temperature:
      buildWaterMassTemperature(),

    productivity:
      buildWaterMassProductivity(),

    clarity:
      buildWaterMassClarity(),

    current:
      buildWaterMassCurrent()
  });

assert.equal(
  localOnlyWaterMassAnalysis.classification,
  "local-surface-character-only"
);

assert.equal(
  localOnlyWaterMassAnalysis.readinessState,
  "not-ready"
);

assert.equal(
  localOnlyWaterMassAnalysis
    .waterMassDistinctionReady,
  false
);

console.log(
  "PASS Water Mass Analysis preserves local character without inventing adjacent water masses"
);


const uniformWaterMassAnalysis =
  buildWaterMassAnalysis({
    surfaceWaterCharacter:
      buildWaterMassSurfaceCharacter(),

    temperature:
      buildWaterMassTemperature({
        classification:
          "uniform-water",

        spatialClassification:
          "uniform-water",

        coverage:
          "sufficient"
      }),

    productivity:
      buildWaterMassProductivity(),

    clarity:
      buildWaterMassClarity(),

    current:
      buildWaterMassCurrent()
  });

assert.equal(
  uniformWaterMassAnalysis.classification,
  "uniform-surface-water-context"
);

assert.equal(
  uniformWaterMassAnalysis.readinessState,
  "not-ready"
);

console.log(
  "PASS Water Mass Analysis identifies uniform thermal context"
);


const thermalContrastWaterMassAnalysis =
  buildWaterMassAnalysis({
    surfaceWaterCharacter:
      buildWaterMassSurfaceCharacter(),

    temperature:
      buildWaterMassTemperature({
        classification:
          "moderate-temperature-structure",

        spatialClassification:
          "moderate-temperature-transition",

        coverage:
          "sufficient",

        directional:
          true
      }),

    productivity:
      buildWaterMassProductivity(),

    clarity:
      buildWaterMassClarity(),

    current:
      buildWaterMassCurrent()
  });

assert.equal(
  thermalContrastWaterMassAnalysis.classification,
  "single-variable-spatial-water-contrast"
);

assert.equal(
  thermalContrastWaterMassAnalysis.readinessState,
  "partially-ready"
);

assert.equal(
  thermalContrastWaterMassAnalysis
    .evidence
    .independentSpatialCharacterVariableCount,
  1
);

console.log(
  "PASS Water Mass Analysis recognizes temperature as a single spatial water-character variable"
);


const combinedWaterMassBoundary =
  buildWaterMassAnalysis({
    surfaceWaterCharacter:
      buildWaterMassSurfaceCharacter(),

    temperature:
      buildWaterMassTemperature({
        classification:
          "strong-temperature-break-candidate",

        spatialClassification:
          "strong-temperature-break-candidate",

        coverage:
          "sufficient",

        directional:
          true
      }),

    productivity:
      buildWaterMassProductivity(),

    clarity:
      buildWaterMassClarity(),

    current:
      buildWaterMassCurrent({
        edgeAvailable:
          true,

        edgeDetected:
          true,

        edgeType:
          "pronounced-current-edge-candidate",

        edgeStrength:
          "pronounced"
      })
  });

assert.equal(
  combinedWaterMassBoundary.classification,
  "combined-boundary-context-without-water-mass-distinction"
);

assert.equal(
  combinedWaterMassBoundary.readinessState,
  "partially-ready"
);

assert.equal(
  combinedWaterMassBoundary
    .distinctAdjacentWaterMassesEstablished,
  false
);

assert.equal(
  combinedWaterMassBoundary
    .waterMassDistinctionReady,
  false
);

assert.equal(
  combinedWaterMassBoundary.contractVersion,
  "pelora-water-mass-analysis-v1"
);

assert.ok(
  combinedWaterMassBoundary
    .missingRequirements
    .includes(
      "second-independent-spatial-water-character-variable"
    )
);

console.log(
  "PASS Water Mass Analysis preserves combined boundary evidence without overstating water-mass distinction"
);



/**
 * ------------------------------------------------------------
 * Mixing Zone Analysis Contract v1.0
 * ------------------------------------------------------------
 */

const buildMixingWaterMass = ({
  available = true,
  spatialThermalContrast = false,
  meaningfulThermalContrast = false
} = {}) => ({
  available,

  distinctAdjacentWaterMassesEstablished:
    false,

  waterMassDistinctionReady:
    false,

  evidence: {
    spatialThermalContrast,

    meaningfulSpatialThermalContrast:
      meaningfulThermalContrast,

    directionalThermalContrast:
      spatialThermalContrast
  },

  limitations:
    [],

  contractVersion:
    "pelora-water-mass-analysis-v1"
});


const buildMixingSurfaceCharacter = ({
  available = true
} = {}) => ({
  available,

  limitations:
    [],

  contractVersion:
    "pelora-surface-water-character-v1"
});


const buildMixingTemperature = () => ({
  available:
    true,

  limitations:
    [],

  interpretation:
    "species-neutral-temperature-structure-evidence"
});


const buildMixingCurrent = ({
  edge = false,
  convergence = false,
  shear = false
} = {}) => ({
  spatialAnalysis: {
    edge: {
      currentEdgeDetected:
        edge,

      edgeState:
        edge
          ? "candidate"
          : "not-supported",

      limitations:
        [],

      contractVersion:
        "pelora-current-edge-v1"
    },

    convergence: {
      currentConvergenceDetected:
        convergence,

      convergenceState:
        convergence
          ? "candidate"
          : "not-supported",

      limitations:
        [],

      contractVersion:
        "pelora-current-convergence-v1"
    },

    shear: {
      currentShearDetected:
        shear,

      shearState:
        shear
          ? "candidate"
          : "not-supported",

      limitations:
        [],

      contractVersion:
        "pelora-current-shear-v1"
    }
  }
});


const unavailableMixingZone =
  buildMixingZoneAnalysis({
    waterMassAnalysis:
      buildMixingWaterMass({
        available:
          false
      }),

    surfaceWaterCharacter:
      buildMixingSurfaceCharacter({
        available:
          false
      }),

    temperature:
      buildMixingTemperature(),

    current:
      buildMixingCurrent()
  });

assert.equal(
  unavailableMixingZone.available,
  false
);

assert.equal(
  unavailableMixingZone.classification,
  "unavailable"
);

assert.equal(
  unavailableMixingZone.mixingZoneDetected,
  false
);

console.log(
  "PASS Mixing Zone Analysis requires water-character or water-mass evidence"
);


const noMixingContext =
  buildMixingZoneAnalysis({
    waterMassAnalysis:
      buildMixingWaterMass(),

    surfaceWaterCharacter:
      buildMixingSurfaceCharacter(),

    temperature:
      buildMixingTemperature(),

    current:
      buildMixingCurrent()
  });

assert.equal(
  noMixingContext.classification,
  "no-mixing-zone-context"
);

assert.equal(
  noMixingContext.readinessState,
  "not-ready"
);

console.log(
  "PASS Mixing Zone Analysis remains conservative without boundary evidence"
);


const thermalOnlyMixingContext =
  buildMixingZoneAnalysis({
    waterMassAnalysis:
      buildMixingWaterMass({
        spatialThermalContrast:
          true,

        meaningfulThermalContrast:
          true
      }),

    surfaceWaterCharacter:
      buildMixingSurfaceCharacter(),

    temperature:
      buildMixingTemperature(),

    current:
      buildMixingCurrent()
  });

assert.equal(
  thermalOnlyMixingContext.classification,
  "thermal-boundary-context-without-mixing-evidence"
);

assert.equal(
  thermalOnlyMixingContext.mixingZoneReady,
  false
);

console.log(
  "PASS Mixing Zone Analysis preserves thermal-boundary context without claiming mixing"
);


const hydrodynamicOnlyMixingContext =
  buildMixingZoneAnalysis({
    waterMassAnalysis:
      buildMixingWaterMass(),

    surfaceWaterCharacter:
      buildMixingSurfaceCharacter(),

    temperature:
      buildMixingTemperature(),

    current:
      buildMixingCurrent({
        edge:
          true
      })
  });

assert.equal(
  hydrodynamicOnlyMixingContext.classification,
  "hydrodynamic-boundary-context-without-water-mass-distinction"
);

assert.equal(
  hydrodynamicOnlyMixingContext
    .evidence
    .hydrodynamicInteractionSignalCount,
  1
);

console.log(
  "PASS Mixing Zone Analysis preserves hydrodynamic context without inventing water masses"
);


const combinedMixingContext =
  buildMixingZoneAnalysis({
    waterMassAnalysis:
      buildMixingWaterMass({
        spatialThermalContrast:
          true,

        meaningfulThermalContrast:
          true
      }),

    surfaceWaterCharacter:
      buildMixingSurfaceCharacter(),

    temperature:
      buildMixingTemperature(),

    current:
      buildMixingCurrent({
        edge:
          true,

        convergence:
          true,

        shear:
          true
      })
  });

assert.equal(
  combinedMixingContext.classification,
  "multi-signal-boundary-interaction-context"
);

assert.equal(
  combinedMixingContext.readinessState,
  "partially-ready"
);

assert.equal(
  combinedMixingContext
    .evidence
    .hydrodynamicInteractionSignalCount,
  3
);

assert.equal(
  combinedMixingContext.mixingZoneDetected,
  false
);

assert.equal(
  combinedMixingContext.mixingZoneReady,
  false
);

assert.equal(
  combinedMixingContext.contractVersion,
  "pelora-mixing-zone-analysis-v1"
);

assert.ok(
  combinedMixingContext
    .missingRequirements
    .includes(
      "distinct-adjacent-water-masses"
    )
);

console.log(
  "PASS Mixing Zone Analysis identifies multi-signal interaction context without confirming a mixing zone"
);



/**
 * ------------------------------------------------------------
 * Environmental Transition Analysis Contract v1.0
 * ------------------------------------------------------------
 */

const buildTransitionSurfaceCharacter = ({
  available = true
} = {}) => ({
  available,

  limitations:
    [],

  contractVersion:
    "pelora-surface-water-character-v1"
});


const buildTransitionWaterMass = ({
  available = true,
  classification =
    "local-surface-character-only",
  spatialVariableCount = 1
} = {}) => ({
  available,

  classification,

  distinctAdjacentWaterMassesEstablished:
    false,

  evidence: {
    independentSpatialCharacterVariableCount:
      spatialVariableCount
  },

  limitations:
    [],

  contractVersion:
    "pelora-water-mass-analysis-v1"
});


const buildTransitionMixingZone = ({
  available = true,
  classification =
    "no-mixing-zone-context"
} = {}) => ({
  available,

  classification,

  mixingZoneDetected:
    false,

  limitations:
    [],

  contractVersion:
    "pelora-mixing-zone-analysis-v1"
});


const buildTransitionTemperature = ({
  available = true,
  classification = "temperature-only",
  coverage = "unavailable",
  spatialClassification = null,
  directional = false
} = {}) => ({
  available,

  classification,

  values: {
    coverage,

    spatialClassification
  },

  orientation: {
    classification:
      directional
        ? "directional-temperature-transition"
        : "no-clear-directional-transition"
  },

  limitations:
    [],

  interpretation:
    "species-neutral-temperature-structure-evidence"
});


const buildTransitionCurrent = ({
  edge = false,
  edgeStrength = "none",
  convergence = false,
  shear = false
} = {}) => ({
  spatialAnalysis: {
    edge: {
      currentEdgeDetected:
        edge,

      edgeState:
        edge
          ? "candidate"
          : "not-supported",

      edgeStrength,

      limitations:
        [],

      contractVersion:
        "pelora-current-edge-v1"
    },

    convergence: {
      currentConvergenceDetected:
        convergence,

      convergenceState:
        convergence
          ? "candidate"
          : "not-supported",

      limitations:
        [],

      contractVersion:
        "pelora-current-convergence-v1"
    },

    shear: {
      currentShearDetected:
        shear,

      shearState:
        shear
          ? "candidate"
          : "not-supported",

      limitations:
        [],

      contractVersion:
        "pelora-current-shear-v1"
    }
  }
});


const unavailableEnvironmentalTransition =
  buildEnvironmentalTransitionAnalysis({
    surfaceWaterCharacter:
      buildTransitionSurfaceCharacter({
        available:
          false
      }),

    waterMassAnalysis:
      buildTransitionWaterMass({
        available:
          false
      }),

    mixingZoneAnalysis:
      buildTransitionMixingZone({
        available:
          false
      }),

    temperature:
      buildTransitionTemperature({
        available:
          false
      }),

    current:
      buildTransitionCurrent()
  });

assert.equal(
  unavailableEnvironmentalTransition.available,
  false
);

assert.equal(
  unavailableEnvironmentalTransition.classification,
  "unavailable"
);

assert.equal(
  unavailableEnvironmentalTransition
    .environmentalTransitionDetected,
  false
);

console.log(
  "PASS Environmental Transition Analysis requires available upstream evidence"
);


const uniformEnvironmentalContext =
  buildEnvironmentalTransitionAnalysis({
    surfaceWaterCharacter:
      buildTransitionSurfaceCharacter(),

    waterMassAnalysis:
      buildTransitionWaterMass(),

    mixingZoneAnalysis:
      buildTransitionMixingZone(),

    temperature:
      buildTransitionTemperature({
        classification:
          "uniform-water",

        coverage:
          "sufficient",

        spatialClassification:
          "uniform-water"
      }),

    current:
      buildTransitionCurrent()
  });

assert.equal(
  uniformEnvironmentalContext.classification,
  "uniform-environmental-context"
);

assert.equal(
  uniformEnvironmentalContext.transitionState,
  "observed"
);

console.log(
  "PASS Environmental Transition Analysis identifies uniform environmental context"
);


const thermalEnvironmentalContext =
  buildEnvironmentalTransitionAnalysis({
    surfaceWaterCharacter:
      buildTransitionSurfaceCharacter(),

    waterMassAnalysis:
      buildTransitionWaterMass({
        classification:
          "single-variable-spatial-water-contrast"
      }),

    mixingZoneAnalysis:
      buildTransitionMixingZone({
        classification:
          "thermal-boundary-context-without-mixing-evidence"
      }),

    temperature:
      buildTransitionTemperature({
        classification:
          "moderate-temperature-structure",

        coverage:
          "sufficient",

        spatialClassification:
          "moderate-temperature-transition",

        directional:
          true
      }),

    current:
      buildTransitionCurrent()
  });

assert.equal(
  thermalEnvironmentalContext.classification,
  "thermal-transition-context"
);

assert.equal(
  thermalEnvironmentalContext.transitionStrength,
  "measurable"
);

console.log(
  "PASS Environmental Transition Analysis preserves thermal-only transition context"
);


const hydrodynamicEnvironmentalContext =
  buildEnvironmentalTransitionAnalysis({
    surfaceWaterCharacter:
      buildTransitionSurfaceCharacter(),

    waterMassAnalysis:
      buildTransitionWaterMass({
        classification:
          "hydrodynamic-boundary-with-local-water-character"
      }),

    mixingZoneAnalysis:
      buildTransitionMixingZone({
        classification:
          "hydrodynamic-boundary-context-without-water-mass-distinction"
      }),

    temperature:
      buildTransitionTemperature(),

    current:
      buildTransitionCurrent({
        edge:
          true,

        shear:
          true
      })
  });

assert.equal(
  hydrodynamicEnvironmentalContext.classification,
  "hydrodynamic-transition-context"
);

assert.equal(
  hydrodynamicEnvironmentalContext
    .evidence
    .hydrodynamicSignalCount,
  2
);

console.log(
  "PASS Environmental Transition Analysis preserves hydrodynamic-only transition context"
);


const combinedEnvironmentalContext =
  buildEnvironmentalTransitionAnalysis({
    surfaceWaterCharacter:
      buildTransitionSurfaceCharacter(),

    waterMassAnalysis:
      buildTransitionWaterMass({
        classification:
          "local-surface-character-only"
      }),

    mixingZoneAnalysis:
      buildTransitionMixingZone({
        classification:
          "no-mixing-zone-context"
      }),

    temperature:
      buildTransitionTemperature({
        classification:
          "moderate-temperature-structure",

        coverage:
          "sufficient",

        spatialClassification:
          "moderate-temperature-transition",

        directional:
          true
      }),

    current:
      buildTransitionCurrent({
        edge:
          true
      })
  });

assert.equal(
  combinedEnvironmentalContext.classification,
  "combined-environmental-transition-context"
);

assert.equal(
  combinedEnvironmentalContext.transitionType,
  "thermal-and-hydrodynamic"
);

console.log(
  "PASS Environmental Transition Analysis identifies combined thermal-current context"
);


const multiSignalEnvironmentalContext =
  buildEnvironmentalTransitionAnalysis({
    surfaceWaterCharacter:
      buildTransitionSurfaceCharacter(),

    waterMassAnalysis:
      buildTransitionWaterMass({
        classification:
          "combined-boundary-context-without-water-mass-distinction"
      }),

    mixingZoneAnalysis:
      buildTransitionMixingZone({
        classification:
          "multi-signal-boundary-interaction-context"
      }),

    temperature:
      buildTransitionTemperature({
        classification:
          "strong-temperature-break-candidate",

        coverage:
          "sufficient",

        spatialClassification:
          "strong-temperature-break-candidate",

        directional:
          true
      }),

    current:
      buildTransitionCurrent({
        edge:
          true,

        edgeStrength:
          "pronounced",

        convergence:
          true,

        shear:
          true
      })
  });

assert.equal(
  multiSignalEnvironmentalContext.classification,
  "multi-signal-environmental-transition-context"
);

assert.equal(
  multiSignalEnvironmentalContext.transitionStrength,
  "pronounced"
);

assert.equal(
  multiSignalEnvironmentalContext
    .environmentalTransitionReady,
  false
);

assert.equal(
  multiSignalEnvironmentalContext
    .environmentalTransitionDetected,
  false
);

assert.equal(
  multiSignalEnvironmentalContext
    .oceanFrontDetected,
  false
);

assert.equal(
  multiSignalEnvironmentalContext.contractVersion,
  "pelora-environmental-transition-analysis-v1"
);

console.log(
  "PASS Environmental Transition Analysis identifies multi-signal context without confirming an ocean front"
);



/**
 * ------------------------------------------------------------
 * Ocean Front Analysis Contract v1.0
 * ------------------------------------------------------------
 */

const buildFrontEnvironmentalTransition = ({
  available = true,
  classification =
    "uniform-environmental-context",
  strength = "none",
  thermal = false,
  meaningfulThermal = false,
  hydrodynamic = false,
  hydrodynamicSignalCount = 0,
  currentEdge = false
} = {}) => ({
  available,

  classification,

  transitionState:
    classification ===
      "uniform-environmental-context"
      ? "observed"
      : "candidate-context",

  transitionStrength:
    strength,

  evidence: {
    thermalTransitionSupported:
      thermal,

    meaningfulThermalTransition:
      meaningfulThermal,

    directionalThermalTransition:
      thermal,

    hydrodynamicTransitionSupported:
      hydrodynamic,

    hydrodynamicSignalCount,

    combinedThermalCurrentContext:
      thermal &&
      hydrodynamic,

    currentEdgeDetected:
      currentEdge
  },

  limitations:
    [],

  contractVersion:
    "pelora-environmental-transition-analysis-v1"
});


const buildFrontWaterMass = ({
  spatialVariableCount = 1
} = {}) => ({
  distinctAdjacentWaterMassesEstablished:
    false,

  waterMassDistinctionReady:
    false,

  evidence: {
    independentSpatialCharacterVariableCount:
      spatialVariableCount
  },

  limitations:
    [],

  contractVersion:
    "pelora-water-mass-analysis-v1"
});


const buildFrontMixingZone = ({
  classification =
    "no-mixing-zone-context"
} = {}) => ({
  classification,

  mixingZoneDetected:
    false,

  mixingZoneReady:
    false,

  limitations:
    [],

  contractVersion:
    "pelora-mixing-zone-analysis-v1"
});


const buildFrontTemperature = () => ({
  limitations:
    [],

  interpretation:
    "species-neutral-temperature-structure-evidence"
});


const unavailableOceanFront =
  buildOceanFrontAnalysis({
    environmentalTransitionAnalysis:
      buildFrontEnvironmentalTransition({
        available:
          false
      }),

    waterMassAnalysis:
      buildFrontWaterMass(),

    mixingZoneAnalysis:
      buildFrontMixingZone(),

    temperature:
      buildFrontTemperature()
  });

assert.equal(
  unavailableOceanFront.available,
  false
);

assert.equal(
  unavailableOceanFront.classification,
  "unavailable"
);

assert.equal(
  unavailableOceanFront.oceanFrontDetected,
  false
);

console.log(
  "PASS Ocean Front Analysis requires available environmental-transition evidence"
);


const thermalOnlyOceanFront =
  buildOceanFrontAnalysis({
    environmentalTransitionAnalysis:
      buildFrontEnvironmentalTransition({
        classification:
          "thermal-transition-context",

        strength:
          "measurable",

        thermal:
          true,

        meaningfulThermal:
          true
      }),

    waterMassAnalysis:
      buildFrontWaterMass(),

    mixingZoneAnalysis:
      buildFrontMixingZone(),

    temperature:
      buildFrontTemperature()
  });

assert.equal(
  thermalOnlyOceanFront.classification,
  "thermal-boundary-without-front-support"
);

assert.equal(
  thermalOnlyOceanFront.frontState,
  "incomplete-support"
);

console.log(
  "PASS Ocean Front Analysis preserves thermal-only boundary context"
);


const currentOnlyOceanFront =
  buildOceanFrontAnalysis({
    environmentalTransitionAnalysis:
      buildFrontEnvironmentalTransition({
        classification:
          "hydrodynamic-transition-context",

        strength:
          "pronounced",

        hydrodynamic:
          true,

        hydrodynamicSignalCount:
          2,

        currentEdge:
          true
      }),

    waterMassAnalysis:
      buildFrontWaterMass(),

    mixingZoneAnalysis:
      buildFrontMixingZone(),

    temperature:
      buildFrontTemperature()
  });

assert.equal(
  currentOnlyOceanFront.classification,
  "current-boundary-without-front-support"
);

assert.equal(
  currentOnlyOceanFront.frontStrength,
  "pronounced"
);

console.log(
  "PASS Ocean Front Analysis preserves current-only boundary context"
);


const candidateOceanFront =
  buildOceanFrontAnalysis({
    environmentalTransitionAnalysis:
      buildFrontEnvironmentalTransition({
        classification:
          "combined-environmental-transition-context",

        strength:
          "measurable",

        thermal:
          true,

        meaningfulThermal:
          true,

        hydrodynamic:
          true,

        hydrodynamicSignalCount:
          1,

        currentEdge:
          true
      }),

    waterMassAnalysis:
      buildFrontWaterMass(),

    mixingZoneAnalysis:
      buildFrontMixingZone(),

    temperature:
      buildFrontTemperature()
  });

assert.equal(
  candidateOceanFront.classification,
  "ocean-front-candidate-context"
);

assert.equal(
  candidateOceanFront.frontType,
  "thermal-current-boundary"
);

assert.equal(
  candidateOceanFront.oceanFrontReady,
  false
);

console.log(
  "PASS Ocean Front Analysis identifies thermal-current candidate context"
);


const multiSignalOceanFront =
  buildOceanFrontAnalysis({
    environmentalTransitionAnalysis:
      buildFrontEnvironmentalTransition({
        classification:
          "multi-signal-environmental-transition-context",

        strength:
          "pronounced",

        thermal:
          true,

        meaningfulThermal:
          true,

        hydrodynamic:
          true,

        hydrodynamicSignalCount:
          3,

        currentEdge:
          true
      }),

    waterMassAnalysis:
      buildFrontWaterMass(),

    mixingZoneAnalysis:
      buildFrontMixingZone({
        classification:
          "multi-signal-boundary-interaction-context"
      }),

    temperature:
      buildFrontTemperature()
  });

assert.equal(
  multiSignalOceanFront.classification,
  "multi-signal-ocean-front-candidate-context"
);

assert.equal(
  multiSignalOceanFront.frontStrength,
  "pronounced"
);

assert.equal(
  multiSignalOceanFront.oceanFrontReady,
  false
);

assert.equal(
  multiSignalOceanFront.oceanFrontDetected,
  false
);

assert.equal(
  multiSignalOceanFront.contractVersion,
  "pelora-ocean-front-analysis-v1"
);

assert.ok(
  multiSignalOceanFront
    .missingRequirements
    .includes(
      "temporal-persistence"
    )
);

assert.ok(
  multiSignalOceanFront
    .missingRequirements
    .includes(
      "second-independent-spatial-water-character-variable"
    )
);

console.log(
  "PASS Ocean Front Analysis identifies multi-signal front context without confirming an ocean front"
);



/**
 * ------------------------------------------------------------
 * Ocean Physics Explainability Summary Contract v1.0
 * ------------------------------------------------------------
 */

const buildExplainabilityContract = ({
  available = true,
  analysisType,
  classification,
  stateField = {},
  readyField = {},
  detectedField = {},
  missingRequirements = [],
  contractVersion
}) => ({
  available,

  analysisType,

  classification,

  ...stateField,

  ...readyField,

  ...detectedField,

  missingRequirements,

  limitations:
    [],

  contractVersion
});


const emptyPhysicsExplainability =
  buildOceanPhysicsExplainabilitySummary();

assert.equal(
  emptyPhysicsExplainability.available,
  false
);

assert.equal(
  emptyPhysicsExplainability.summaryState,
  "unavailable"
);

assert.equal(
  emptyPhysicsExplainability.highestSupportedStage,
  "unavailable"
);

console.log(
  "PASS Ocean Physics Explainability remains unavailable without upstream contracts"
);


const candidatePhysicsExplainability =
  buildOceanPhysicsExplainabilitySummary({
    surfaceWaterCharacter:
      buildExplainabilityContract({
        analysisType:
          "surface-water-character-analysis",

        classification:
          "combined-thermal-current-boundary-context",

        stateField: {
          state:
            "candidate-context"
        },

        contractVersion:
          "pelora-surface-water-character-v1"
      }),

    waterMassAnalysis:
      buildExplainabilityContract({
        analysisType:
          "water-mass-analysis",

        classification:
          "combined-boundary-context-without-water-mass-distinction",

        stateField: {
          readinessState:
            "partially-ready"
        },

        readyField: {
          waterMassDistinctionReady:
            false
        },

        detectedField: {
          distinctAdjacentWaterMassesEstablished:
            false
        },

        missingRequirements: [
          "second-independent-spatial-water-character-variable"
        ],

        contractVersion:
          "pelora-water-mass-analysis-v1"
      }),

    mixingZoneAnalysis:
      buildExplainabilityContract({
        analysisType:
          "mixing-zone-analysis",

        classification:
          "multi-signal-boundary-interaction-context",

        stateField: {
          readinessState:
            "partially-ready"
        },

        readyField: {
          mixingZoneReady:
            false
        },

        detectedField: {
          mixingZoneDetected:
            false
        },

        missingRequirements: [
          "temporal-persistence"
        ],

        contractVersion:
          "pelora-mixing-zone-analysis-v1"
      }),

    environmentalTransitionAnalysis:
      buildExplainabilityContract({
        analysisType:
          "environmental-transition-analysis",

        classification:
          "multi-signal-environmental-transition-context",

        stateField: {
          transitionState:
            "candidate-context"
        },

        readyField: {
          environmentalTransitionReady:
            false
        },

        detectedField: {
          environmentalTransitionDetected:
            false
        },

        missingRequirements: [
          "temporal-persistence"
        ],

        contractVersion:
          "pelora-environmental-transition-analysis-v1"
      }),

    oceanFrontAnalysis:
      buildExplainabilityContract({
        analysisType:
          "ocean-front-analysis",

        classification:
          "multi-signal-ocean-front-candidate-context",

        stateField: {
          frontState:
            "candidate-context"
        },

        readyField: {
          oceanFrontReady:
            false
        },

        detectedField: {
          oceanFrontDetected:
            false
        },

        missingRequirements: [
          "temporal-persistence",
          "second-independent-spatial-water-character-variable"
        ],

        contractVersion:
          "pelora-ocean-front-analysis-v1"
      })
  });

assert.equal(
  candidatePhysicsExplainability.available,
  true
);

assert.equal(
  candidatePhysicsExplainability.highestSupportedStage,
  "ocean-front"
);

assert.equal(
  candidatePhysicsExplainability.summaryState,
  "candidate-or-observational-context"
);

assert.equal(
  candidatePhysicsExplainability.stages.length,
  5
);

assert.equal(
  candidatePhysicsExplainability
    .readiness
    .oceanFront,
  false
);

assert.equal(
  candidatePhysicsExplainability
    .detections
    .oceanFront,
  false
);

assert.equal(
  candidatePhysicsExplainability
    .missingRequirements
    .filter(
      requirement =>
        requirement ===
        "temporal-persistence"
    ).length,
  1
);

assert.equal(
  candidatePhysicsExplainability
    .contractVersions
    ["ocean-front"],
  "pelora-ocean-front-analysis-v1"
);

assert.equal(
  candidatePhysicsExplainability.contractVersion,
  "pelora-ocean-physics-explainability-v1"
);

console.log(
  "PASS Ocean Physics Explainability normalizes the complete physics chain without changing scientific meaning"
);



/**
 * ------------------------------------------------------------
 * Ocean Physics Explainability Lineage Contract v1.0
 * ------------------------------------------------------------
 */

const buildPhysicsLineageUpstream = ({
  available = true
} = {}) => (
  available
    ? {
        upstream: [
          {
            engine:
              "data-assessment",

            methodVersion:
              "pelora-data-quality-v2"
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

        inheritedWarnings: [],

        producedBy:
          "ocean-evidence",

        components: {
          groupsProduced: [
            "temperature",
            "current"
          ]
        },

        methodVersion:
          "pelora-ocean-evidence-lineage-v1.0"
      }
    : null
);


const buildPhysicsLineageContract = ({
  available = true,
  contractVersion
} = {}) => ({
  available,

  limitations:
    [],

  contractVersion
});


const physicsExplainabilityForLineage = {
  available:
    true,

  summaryState:
    "candidate-or-observational-context",

  highestSupportedStage:
    "ocean-front",

  stages: [
    {
      stage:
        "surface-water-character",

      available:
        true
    },

    {
      stage:
        "water-mass",

      available:
        true
    },

    {
      stage:
        "mixing-zone",

      available:
        true
    },

    {
      stage:
        "environmental-transition",

      available:
        true
    },

    {
      stage:
        "ocean-front",

      available:
        true
    }
  ],

  readiness: {
    waterMass:
      false,

    mixingZone:
      false,

    environmentalTransition:
      false,

    oceanFront:
      false
  },

  detections: {
    distinctAdjacentWaterMasses:
      false,

    mixingZone:
      false,

    environmentalTransition:
      false,

    oceanFront:
      false
  },

  missingRequirements: [
    "temporal-persistence",
    "second-independent-spatial-water-character-variable"
  ],

  limitations: [
    "No verified ocean front is confirmed."
  ],

  contractVersion:
    "pelora-ocean-physics-explainability-v1"
};


const governedPhysicsExplainabilityLineage =
  buildOceanPhysicsExplainabilityLineage({
    oceanEvidenceLineage:
      buildPhysicsLineageUpstream(),

    oceanPhysicsExplainability:
      physicsExplainabilityForLineage,

    surfaceWaterCharacter:
      buildPhysicsLineageContract({
        contractVersion:
          "pelora-surface-water-character-v1"
      }),

    waterMassAnalysis:
      buildPhysicsLineageContract({
        contractVersion:
          "pelora-water-mass-analysis-v1"
      }),

    mixingZoneAnalysis:
      buildPhysicsLineageContract({
        contractVersion:
          "pelora-mixing-zone-analysis-v1"
      }),

    environmentalTransitionAnalysis:
      buildPhysicsLineageContract({
        contractVersion:
          "pelora-environmental-transition-analysis-v1"
      }),

    oceanFrontAnalysis:
      buildPhysicsLineageContract({
        contractVersion:
          "pelora-ocean-front-analysis-v1"
      })
  });


const governedPhysicsLineageValidation =
  validateEvidenceLineage(
    governedPhysicsExplainabilityLineage
  );

assert.equal(
  governedPhysicsLineageValidation.valid,
  true
);

assert.equal(
  governedPhysicsExplainabilityLineage.producedBy,
  "ocean-physics-explainability"
);

assert.equal(
  governedPhysicsExplainabilityLineage.upstream.length,
  1
);

assert.equal(
  governedPhysicsExplainabilityLineage.upstream[0].engine,
  "ocean-evidence"
);

assert.ok(
  governedPhysicsExplainabilityLineage
    .observationsUsed
    .includes(
      "temperature"
    )
);

assert.ok(
  governedPhysicsExplainabilityLineage
    .observationsUsed
    .includes(
      "currents"
    )
);

assert.ok(
  governedPhysicsExplainabilityLineage
    .evidenceProduced
    .includes(
      "ocean-physics-explainability-summary"
    )
);

assert.equal(
  governedPhysicsExplainabilityLineage
    .components
    .highestSupportedStage,
  "ocean-front"
);

assert.equal(
  governedPhysicsExplainabilityLineage
    .components
    .contractVersions
    .oceanFrontAnalysis,
  "pelora-ocean-front-analysis-v1"
);

assert.equal(
  governedPhysicsExplainabilityLineage.methodVersion,
  "pelora-ocean-physics-explainability-lineage-v1.0"
);

console.log(
  "PASS Ocean Physics Explainability Lineage preserves a valid observation-to-explainability trace"
);


const missingUpstreamPhysicsLineage =
  buildOceanPhysicsExplainabilityLineage({
    oceanEvidenceLineage:
      null,

    oceanPhysicsExplainability:
      physicsExplainabilityForLineage,

    surfaceWaterCharacter:
      buildPhysicsLineageContract({
        contractVersion:
          "pelora-surface-water-character-v1"
      }),

    waterMassAnalysis:
      buildPhysicsLineageContract({
        contractVersion:
          "pelora-water-mass-analysis-v1"
      }),

    mixingZoneAnalysis:
      buildPhysicsLineageContract({
        contractVersion:
          "pelora-mixing-zone-analysis-v1"
      }),

    environmentalTransitionAnalysis:
      buildPhysicsLineageContract({
        contractVersion:
          "pelora-environmental-transition-analysis-v1"
      }),

    oceanFrontAnalysis:
      buildPhysicsLineageContract({
        contractVersion:
          "pelora-ocean-front-analysis-v1"
      })
  });

assert.ok(
  missingUpstreamPhysicsLineage
    .inheritedWarnings
    .includes(
      "primary-upstream-lineage-unavailable"
    )
);

assert.equal(
  missingUpstreamPhysicsLineage.upstream.length,
  0
);

assert.equal(
  missingUpstreamPhysicsLineage
    .components
    .highestSupportedStage,
  "ocean-front"
);

console.log(
  "PASS Ocean Physics Explainability Lineage discloses missing upstream lineage without changing the documentary summary"
);



/**
 * ------------------------------------------------------------
 * Ocean Organization Analysis Contract v1.0
 * ------------------------------------------------------------
 */

const buildOrganizationCurrent = ({
  organizationAvailable = true,
  organizationClassification =
    "uniform-current-field",
  patternType =
    "uniform-flow-pattern",
  patternState =
    "observed",
  shear = false,
  convergence = false,
  edge = false
} = {}) => ({
  spatialAnalysis: {
    organization: {
      available:
        organizationAvailable,

      classification:
        organizationClassification,

      limitations:
        [],

      thresholdVersion:
        "pelora-current-organization-v1"
    },

    spatialPattern: {
      patternType,

      patternState,

      limitations:
        [],

      thresholdVersion:
        "pelora-current-spatial-pattern-v1"
    },

    shear: {
      currentShearDetected:
        shear,

      shearState:
        shear
          ? "candidate"
          : "not-supported",

      limitations:
        [],

      contractVersion:
        "pelora-current-shear-v1"
    },

    convergence: {
      currentConvergenceDetected:
        convergence,

      convergenceState:
        convergence
          ? "candidate"
          : "not-supported",

      limitations:
        [],

      contractVersion:
        "pelora-current-convergence-v1"
    },

    edge: {
      currentEdgeDetected:
        edge,

      edgeState:
        edge
          ? "candidate"
          : "not-supported",

      limitations:
        [],

      contractVersion:
        "pelora-current-edge-v1"
    }
  }
});


const buildOrganizationTemperature = ({
  available = true,
  classification =
    "uniform-water",
  coverage =
    "sufficient",
  spatialClassification =
    "uniform-water"
} = {}) => ({
  available,

  classification,

  values: {
    coverage,

    spatialClassification
  },

  limitations:
    []
});


const buildOrganizationContract = ({
  available = true,
  classification,
  detectedFields = {},
  contractVersion
} = {}) => ({
  available,

  classification,

  ...detectedFields,

  limitations:
    [],

  contractVersion
});


const unavailableOceanOrganization =
  buildOceanOrganizationAnalysis();

assert.equal(
  unavailableOceanOrganization.available,
  false
);

assert.equal(
  unavailableOceanOrganization.organizationLevel,
  "unavailable"
);

assert.equal(
  unavailableOceanOrganization.organizationIndex,
  0
);

console.log(
  "PASS Ocean Organization Analysis remains unavailable without physical evidence"
);


const uniformOceanOrganization =
  buildOceanOrganizationAnalysis({
    current:
      buildOrganizationCurrent(),

    temperature:
      buildOrganizationTemperature(),

    surfaceWaterCharacter:
      buildOrganizationContract({
        classification:
          "uniform-surface-water-character",

        contractVersion:
          "pelora-surface-water-character-v1"
      }),

    waterMassAnalysis:
      buildOrganizationContract({
        classification:
          "uniform-surface-water-context",

        detectedFields: {
          distinctAdjacentWaterMassesEstablished:
            false
        },

        contractVersion:
          "pelora-water-mass-analysis-v1"
      }),

    mixingZoneAnalysis:
      buildOrganizationContract({
        classification:
          "no-mixing-zone-context",

        detectedFields: {
          mixingZoneDetected:
            false
        },

        contractVersion:
          "pelora-mixing-zone-analysis-v1"
      }),

    environmentalTransitionAnalysis:
      buildOrganizationContract({
        classification:
          "uniform-environmental-context",

        detectedFields: {
          environmentalTransitionDetected:
            false
        },

        contractVersion:
          "pelora-environmental-transition-analysis-v1"
      }),

    oceanFrontAnalysis:
      buildOrganizationContract({
        classification:
          "no-ocean-front-context",

        detectedFields: {
          oceanFrontDetected:
            false
        },

        contractVersion:
          "pelora-ocean-front-analysis-v1"
      })
  });

assert.equal(
  uniformOceanOrganization.organizationLevel,
  "uniform"
);

assert.equal(
  uniformOceanOrganization.organizationIndex,
  0
);

assert.ok(
  uniformOceanOrganization
    .counterEvidence
    .includes(
      "uniform-current-field"
    )
);

assert.ok(
  uniformOceanOrganization
    .counterEvidence
    .includes(
      "uniform-temperature-field"
    )
);

console.log(
  "PASS Ocean Organization Analysis preserves a uniform ocean context"
);


const developingOceanOrganization =
  buildOceanOrganizationAnalysis({
    current:
      buildOrganizationCurrent({
        organizationClassification:
          "organized-current-transition",

        patternType:
          "speed-transition-pattern",

        patternState:
          "candidate",

        shear:
          true
      }),

    temperature:
      buildOrganizationTemperature({
        classification:
          "moderate-temperature-structure",

        spatialClassification:
          "moderate-temperature-transition"
      }),

    surfaceWaterCharacter:
      buildOrganizationContract({
        classification:
          "thermal-boundary-context",

        contractVersion:
          "pelora-surface-water-character-v1"
      }),

    waterMassAnalysis:
      buildOrganizationContract({
        classification:
          "local-surface-character-only",

        contractVersion:
          "pelora-water-mass-analysis-v1"
      }),

    mixingZoneAnalysis:
      buildOrganizationContract({
        classification:
          "no-mixing-zone-context",

        contractVersion:
          "pelora-mixing-zone-analysis-v1"
      }),

    environmentalTransitionAnalysis:
      buildOrganizationContract({
        classification:
          "thermal-transition-context",

        contractVersion:
          "pelora-environmental-transition-analysis-v1"
      }),

    oceanFrontAnalysis:
      buildOrganizationContract({
        classification:
          "thermal-boundary-without-front-support",

        contractVersion:
          "pelora-ocean-front-analysis-v1"
      })
  });

assert.equal(
  developingOceanOrganization.organizationLevel,
  "developing-organization"
);

assert.equal(
  developingOceanOrganization.organizationIndex,
  4
);

assert.equal(
  developingOceanOrganization.organizationSignalCount,
  4
);

console.log(
  "PASS Ocean Organization Analysis identifies developing multi-signal organization"
);


const highlyOrganizedOcean =
  buildOceanOrganizationAnalysis({
    current:
      buildOrganizationCurrent({
        organizationClassification:
          "organized-current-transition",

        patternType:
          "pronounced-mixed-transition-pattern",

        patternState:
          "candidate",

        shear:
          true,

        convergence:
          true,

        edge:
          true
      }),

    temperature:
      buildOrganizationTemperature({
        classification:
          "strong-temperature-break-candidate",

        spatialClassification:
          "strong-temperature-break-candidate"
      }),

    surfaceWaterCharacter:
      buildOrganizationContract({
        classification:
          "combined-thermal-current-boundary-context",

        contractVersion:
          "pelora-surface-water-character-v1"
      }),

    waterMassAnalysis:
      buildOrganizationContract({
        classification:
          "combined-boundary-context-without-water-mass-distinction",

        contractVersion:
          "pelora-water-mass-analysis-v1"
      }),

    mixingZoneAnalysis:
      buildOrganizationContract({
        classification:
          "multi-signal-boundary-interaction-context",

        contractVersion:
          "pelora-mixing-zone-analysis-v1"
      }),

    environmentalTransitionAnalysis:
      buildOrganizationContract({
        classification:
          "multi-signal-environmental-transition-context",

        contractVersion:
          "pelora-environmental-transition-analysis-v1"
      }),

    oceanFrontAnalysis:
      buildOrganizationContract({
        classification:
          "multi-signal-ocean-front-candidate-context",

        contractVersion:
          "pelora-ocean-front-analysis-v1"
      })
  });

assert.equal(
  highlyOrganizedOcean.organizationLevel,
  "highly-organized"
);

assert.equal(
  highlyOrganizedOcean.organizationState,
  "strong-candidate-context"
);

assert.equal(
  highlyOrganizedOcean.organizationIndex,
  11
);

assert.equal(
  highlyOrganizedOcean.organizationSignalCount,
  10
);

assert.equal(
  highlyOrganizedOcean.contractVersion,
  "pelora-ocean-organization-v1"
);

assert.ok(
  highlyOrganizedOcean
    .organizationDrivers
    .includes(
      "current-edge"
    )
);

assert.ok(
  highlyOrganizedOcean
    .organizationDrivers
    .includes(
      "ocean-front-candidate-context"
    )
);

console.log(
  "PASS Ocean Organization Analysis identifies highly organized multi-contract context"
);



/**
 * ------------------------------------------------------------
 * Observation Snapshot Contract v1.0
 * ------------------------------------------------------------
 */

const observationSnapshotSource = {
  location: {
    latitude:
      29.5,

    longitude:
      -87.2,

    name:
      "Test Water"
  },

  observedAt:
    "2026-08-02T18:00:00.000Z",

  generatedAt:
    "2026-08-02T18:05:00.000Z",

  observations: {
    sst: {
      temperatureFahrenheit:
        84.2
    },

    currents: {
      speedKnots:
        1.4,

      directionDegrees:
        92
    }
  },

  oceanEvidence: {
    summary: {
      classification:
        "available"
    },

    groups: {
      temperature: {
        available:
          true,

        interpretation:
          "species-neutral-temperature-structure-evidence"
      },

      current: {
        available:
          true,

        interpretation:
          "species-neutral-current-evidence"
      }
    },

    surfaceWaterCharacter: {
      available:
        true,

      contractVersion:
        "pelora-surface-water-character-v1"
    },

    waterMassAnalysis: {
      available:
        true,

      contractVersion:
        "pelora-water-mass-analysis-v1"
    },

    mixingZoneAnalysis: {
      available:
        true,

      contractVersion:
        "pelora-mixing-zone-analysis-v1"
    },

    environmentalTransitionAnalysis: {
      available:
        true,

      contractVersion:
        "pelora-environmental-transition-analysis-v1"
    },

    oceanFrontAnalysis: {
      available:
        true,

      contractVersion:
        "pelora-ocean-front-analysis-v1"
    },

    oceanPhysicsExplainability: {
      available:
        true,

      contractVersion:
        "pelora-ocean-physics-explainability-v1",

      lineage: {
        methodVersion:
          "pelora-ocean-physics-explainability-lineage-v1.0"
      }
    },

    oceanOrganization: {
      available:
        true,

      organizationLevel:
        "developing-organization",

      contractVersion:
        "pelora-ocean-organization-v1"
    },

    confidence: {
      score:
        72,

      level:
        "Moderate"
    },

    limitations:
      [],

    lineage: {
      methodVersion:
        "pelora-ocean-evidence-lineage-v1.0"
    },

    methodVersion:
      "pelora-ocean-evidence-v2.0"
  },

  dataQuality: {
    overall: {
      classification:
        "partial"
    },

    methodVersion:
      "pelora-data-quality-v2"
  }
};


const governedObservationSnapshot =
  buildObservationSnapshot(
    observationSnapshotSource
  );

assert.equal(
  governedObservationSnapshot.available,
  true
);

assert.equal(
  governedObservationSnapshot.snapshotType,
  "observation"
);

assert.equal(
  governedObservationSnapshot.responsibility,
  "preserve"
);

assert.equal(
  governedObservationSnapshot
    .location
    .latitude,
  29.5
);

assert.equal(
  governedObservationSnapshot
    .oceanOrganization
    .organizationLevel,
  "developing-organization"
);

assert.equal(
  governedObservationSnapshot
    .contractVersions
    .oceanOrganization,
  "pelora-ocean-organization-v1"
);

assert.equal(
  governedObservationSnapshot.contractVersion,
  "pelora-observation-snapshot-v1"
);

assert.equal(
  Object.isFrozen(
    governedObservationSnapshot
  ),
  true
);

assert.equal(
  Object.isFrozen(
    governedObservationSnapshot
      .oceanPhysics
  ),
  true
);

assert.equal(
  Object.isFrozen(
    governedObservationSnapshot
      .observations
      .sst
  ),
  true
);

console.log(
  "PASS Observation Snapshot preserves and freezes governed ocean-state contracts"
);


observationSnapshotSource
  .observations
  .sst
  .temperatureFahrenheit =
  90;

assert.equal(
  governedObservationSnapshot
    .observations
    .sst
    .temperatureFahrenheit,
  84.2
);

console.log(
  "PASS Observation Snapshot remains isolated from later upstream-object mutation"
);


assert.equal(
  Object.hasOwn(
    governedObservationSnapshot,
    "oceanOpportunity"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedObservationSnapshot,
    "blueMarlinHabitat"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedObservationSnapshot,
    "trend"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedObservationSnapshot,
    "persistence"
  ),
  false
);

console.log(
  "PASS Observation Snapshot excludes opportunity, species, trend, and persistence reasoning"
);


const unavailableObservationSnapshot =
  buildObservationSnapshot();

assert.equal(
  unavailableObservationSnapshot.available,
  false
);

assert.ok(
  unavailableObservationSnapshot
    .limitations
    .includes(
      "snapshot-location-unavailable"
    )
);

assert.ok(
  unavailableObservationSnapshot
    .limitations
    .includes(
      "ocean-evidence-unavailable"
    )
);

console.log(
  "PASS Observation Snapshot discloses missing preservation inputs"
);



/**
 * ------------------------------------------------------------
 * Intelligence Snapshot Contract v1.0
 * ------------------------------------------------------------
 */

const intelligenceSnapshotSource = {
  observedAt:
    "2026-08-02T19:00:00.000Z",

  generatedAt:
    "2026-08-02T19:05:00.000Z",

  oceanOpportunity: {
    opportunities: [
      {
        type:
          "environmental-transition-zone",

        classification:
          "temperature-transition-candidate"
      }
    ],

    pathwayClassification: {
      classification:
        "open-water",

      pathway:
        "environmental-organization"
    },

    limitations:
      [],

    lineage: {
      methodVersion:
        "pelora-ocean-opportunity-lineage-v1.0"
    },

    methodVersion:
      "pelora-ocean-opportunity-v1.2"
  },

  relationshipContext: {
    available:
      true,

    pathway:
      "open-water",

    environmentType:
      "environmental-organization",

    supportedRelationships: [
      "thermalStructure",
      "oceanMovement"
    ],

    limitations:
      [],

    lineage: {
      methodVersion:
        "pelora-relationship-context-lineage-v1.0"
    },

    methodVersion:
      "pelora-relationship-context-v1.0"
  },

  relationshipAssessment: {
    available:
      true,

    relationshipContext: {
      pathway:
        "open-water"
    },

    relationshipConfidence: {
      overall: {
        value:
          0.62,

        level:
          "Moderate"
      }
    },

    limitations:
      [],

    lineage: {
      methodVersion:
        "pelora-relationship-assessment-lineage-v1.0"
    },

    methodVersion:
      "pelora-relationship-assessment-v1.0"
  },

  oceanPhysicsExplainability: {
    available:
      true,

    highestSupportedStage:
      "ocean-front",

    limitations:
      [],

    lineage: {
      methodVersion:
        "pelora-ocean-physics-explainability-lineage-v1.0"
    },

    contractVersion:
      "pelora-ocean-physics-explainability-v1"
  },

  oceanOrganization: {
    available:
      true,

    organizationLevel:
      "organized",

    organizationIndex:
      6,

    limitations:
      [],

    contractVersion:
      "pelora-ocean-organization-v1"
  }
};


const governedIntelligenceSnapshot =
  buildIntelligenceSnapshot(
    intelligenceSnapshotSource
  );

assert.equal(
  governedIntelligenceSnapshot.available,
  true
);

assert.equal(
  governedIntelligenceSnapshot.snapshotType,
  "intelligence"
);

assert.equal(
  governedIntelligenceSnapshot.responsibility,
  "preserve"
);

assert.equal(
  governedIntelligenceSnapshot
    .relationshipContext
    .pathway,
  "open-water"
);

assert.equal(
  governedIntelligenceSnapshot
    .relationshipAssessment
    .relationshipConfidence
    .overall
    .level,
  "Moderate"
);

assert.equal(
  governedIntelligenceSnapshot
    .oceanOrganization
    .organizationIndex,
  6
);

assert.equal(
  governedIntelligenceSnapshot
    .contractVersions
    .oceanOrganization,
  "pelora-ocean-organization-v1"
);

assert.equal(
  governedIntelligenceSnapshot.contractVersion,
  "pelora-intelligence-snapshot-v1"
);

assert.equal(
  Object.isFrozen(
    governedIntelligenceSnapshot
  ),
  true
);

assert.equal(
  Object.isFrozen(
    governedIntelligenceSnapshot
      .relationshipAssessment
  ),
  true
);

console.log(
  "PASS Intelligence Snapshot preserves and freezes governed interpretation contracts"
);


intelligenceSnapshotSource
  .oceanOrganization
  .organizationIndex =
  10;

assert.equal(
  governedIntelligenceSnapshot
    .oceanOrganization
    .organizationIndex,
  6
);

console.log(
  "PASS Intelligence Snapshot remains isolated from later upstream-object mutation"
);


assert.equal(
  Object.hasOwn(
    governedIntelligenceSnapshot,
    "observations"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedIntelligenceSnapshot,
    "groups"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedIntelligenceSnapshot,
    "blueMarlinHabitat"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedIntelligenceSnapshot,
    "speciesPathwayInterpretation"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedIntelligenceSnapshot,
    "trend"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedIntelligenceSnapshot,
    "persistence"
  ),
  false
);

console.log(
  "PASS Intelligence Snapshot excludes observations, species, trend, and persistence reasoning"
);


const unavailableIntelligenceSnapshot =
  buildIntelligenceSnapshot();

assert.equal(
  unavailableIntelligenceSnapshot.available,
  false
);

assert.ok(
  unavailableIntelligenceSnapshot
    .limitations
    .includes(
      "ocean-opportunity-unavailable"
    )
);

assert.ok(
  unavailableIntelligenceSnapshot
    .limitations
    .includes(
      "relationship-context-unavailable"
    )
);

assert.ok(
  unavailableIntelligenceSnapshot
    .limitations
    .includes(
      "relationship-assessment-unavailable"
    )
);

console.log(
  "PASS Intelligence Snapshot discloses missing preservation inputs"
);



/**
 * ------------------------------------------------------------
 * Ocean Change Analysis Contract v1.0
 * ------------------------------------------------------------
 */

const buildChangeObservationSnapshot = ({
  observedAt,
  latitude = 29.5,
  longitude = -87.2,
  currentSpeedKnots = 1,
  currentDirectionDegrees = 90,
  temperatureFahrenheit = 82,
  organizationIndex = 2,
  organizationLevel =
    "limited-organization",
  frontClassification =
    "thermal-boundary-without-front-support"
} = {}) => ({
  available:
    true,

  snapshotType:
    "observation",

  observedAt,

  location: {
    latitude,
    longitude
  },

  observations: {
    currents: {
      speedKnots:
        currentSpeedKnots,

      directionDegrees:
        currentDirectionDegrees
    },

    sst: {
      temperatureFahrenheit
    }
  },

  oceanPhysics: {
    oceanFrontAnalysis: {
      classification:
        frontClassification
    }
  },

  oceanOrganization: {
    organizationIndex,

    organizationLevel
  },

  limitations:
    [],

  contractVersion:
    "pelora-observation-snapshot-v1"
});


const buildChangeIntelligenceSnapshot = ({
  observedAt,
  organizationIndex = 2,
  organizationLevel =
    "limited-organization",
  pathway =
    "insufficient-evidence"
} = {}) => ({
  available:
    true,

  snapshotType:
    "intelligence",

  observedAt,

  oceanOrganization: {
    organizationIndex,

    organizationLevel
  },

  oceanOpportunity: {
    pathwayClassification: {
      classification:
        pathway
    }
  },

  limitations:
    [],

  contractVersion:
    "pelora-intelligence-snapshot-v1"
});


const unavailableOceanChange =
  buildOceanChangeAnalysis();

assert.equal(
  unavailableOceanChange.available,
  false
);

assert.equal(
  unavailableOceanChange.changeState,
  "insufficient-comparison-evidence"
);

assert.ok(
  unavailableOceanChange
    .missingRequirements
    .includes(
      "previous-observation-snapshot"
    )
);

assert.ok(
  unavailableOceanChange
    .missingRequirements
    .includes(
      "current-observation-snapshot"
    )
);

console.log(
  "PASS Ocean Change Analysis requires two governed observation snapshots"
);


const stableOceanChange =
  buildOceanChangeAnalysis({
    previousObservationSnapshot:
      buildChangeObservationSnapshot({
        observedAt:
          "2026-08-02T12:00:00.000Z"
      }),

    currentObservationSnapshot:
      buildChangeObservationSnapshot({
        observedAt:
          "2026-08-02T18:00:00.000Z",

        currentSpeedKnots:
          1.05,

        currentDirectionDegrees:
          95,

        temperatureFahrenheit:
          82.1
      }),

    previousIntelligenceSnapshot:
      buildChangeIntelligenceSnapshot({
        observedAt:
          "2026-08-02T12:00:00.000Z"
      }),

    currentIntelligenceSnapshot:
      buildChangeIntelligenceSnapshot({
        observedAt:
          "2026-08-02T18:00:00.000Z"
      })
  });

assert.equal(
  stableOceanChange.available,
  true
);

assert.equal(
  stableOceanChange.changeState,
  "no-meaningful-change-detected"
);

assert.equal(
  stableOceanChange.meaningfulChangeDetected,
  false
);

assert.equal(
  stableOceanChange.changes.length,
  0
);

assert.equal(
  stableOceanChange
    .comparison
    .durationHours,
  6
);

console.log(
  "PASS Ocean Change Analysis preserves a stable two-snapshot comparison"
);


const measurableOceanChange =
  buildOceanChangeAnalysis({
    previousObservationSnapshot:
      buildChangeObservationSnapshot({
        observedAt:
          "2026-08-02T06:00:00.000Z",

        currentSpeedKnots:
          0.8,

        currentDirectionDegrees:
          80,

        temperatureFahrenheit:
          81.5,

        organizationIndex:
          2,

        organizationLevel:
          "limited-organization"
      }),

    currentObservationSnapshot:
      buildChangeObservationSnapshot({
        observedAt:
          "2026-08-02T18:00:00.000Z",

        currentSpeedKnots:
          1.4,

        currentDirectionDegrees:
          110,

        temperatureFahrenheit:
          82.4,

        organizationIndex:
          6,

        organizationLevel:
          "organized",

        frontClassification:
          "multi-signal-ocean-front-candidate-context"
      }),

    previousIntelligenceSnapshot:
      buildChangeIntelligenceSnapshot({
        observedAt:
          "2026-08-02T06:00:00.000Z",

        organizationIndex:
          2,

        organizationLevel:
          "limited-organization",

        pathway:
          "insufficient-evidence"
      }),

    currentIntelligenceSnapshot:
      buildChangeIntelligenceSnapshot({
        observedAt:
          "2026-08-02T18:00:00.000Z",

        organizationIndex:
          6,

        organizationLevel:
          "organized",

        pathway:
          "open-water-opportunity"
      })
  });

assert.equal(
  measurableOceanChange.available,
  true
);

assert.equal(
  measurableOceanChange.changeState,
  "change-detected"
);

assert.equal(
  measurableOceanChange.changeClassification,
  "measurable-ocean-change"
);

assert.equal(
  measurableOceanChange.meaningfulChangeDetected,
  true
);

assert.ok(
  measurableOceanChange
    .changes
    .some(
      change =>
        change.dimension ===
        "current-speed"
    )
);

assert.ok(
  measurableOceanChange
    .changes
    .some(
      change =>
        change.dimension ===
        "ocean-organization-index"
    )
);

assert.ok(
  measurableOceanChange
    .changes
    .some(
      change =>
        change.dimension ===
        "ocean-front-context"
    )
);

assert.ok(
  measurableOceanChange
    .changes
    .some(
      change =>
        change.dimension ===
        "opportunity-pathway"
    )
);

assert.equal(
  measurableOceanChange.contractVersion,
  "pelora-ocean-change-analysis-v1"
);

assert.equal(
  Object.isFrozen(
    measurableOceanChange
  ),
  true
);

assert.equal(
  Object.isFrozen(
    measurableOceanChange
      .changes
  ),
  true
);

console.log(
  "PASS Ocean Change Analysis identifies measurable governed snapshot differences"
);


const movedLocationOceanChange =
  buildOceanChangeAnalysis({
    previousObservationSnapshot:
      buildChangeObservationSnapshot({
        observedAt:
          "2026-08-02T12:00:00.000Z"
      }),

    currentObservationSnapshot:
      buildChangeObservationSnapshot({
        observedAt:
          "2026-08-02T18:00:00.000Z",

        latitude:
          29.7
      })
  });

assert.equal(
  movedLocationOceanChange.available,
  false
);

assert.ok(
  movedLocationOceanChange
    .missingRequirements
    .includes(
      "matching-snapshot-location"
    )
);

console.log(
  "PASS Ocean Change Analysis refuses to compare different snapshot locations"
);


const reversedTimeOceanChange =
  buildOceanChangeAnalysis({
    previousObservationSnapshot:
      buildChangeObservationSnapshot({
        observedAt:
          "2026-08-02T18:00:00.000Z"
      }),

    currentObservationSnapshot:
      buildChangeObservationSnapshot({
        observedAt:
          "2026-08-02T12:00:00.000Z"
      })
  });

assert.equal(
  reversedTimeOceanChange.available,
  false
);

assert.ok(
  reversedTimeOceanChange
    .missingRequirements
    .includes(
      "current-snapshot-must-follow-previous-snapshot"
    )
);

console.log(
  "PASS Ocean Change Analysis requires chronological snapshot order"
);


assert.equal(
  Object.hasOwn(
    measurableOceanChange,
    "persistence"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    measurableOceanChange,
    "trend"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    measurableOceanChange,
    "captainNarrative"
  ),
  false
);

console.log(
  "PASS Ocean Change Analysis excludes persistence, trend, and captain guidance"
);



/**
 * ------------------------------------------------------------
 * Snapshot Metadata Contract v1.0
 * ------------------------------------------------------------
 */

const metadataObservationSnapshot = {
  available:
    true,

  snapshotType:
    "observation",

  observedAt:
    "2026-08-02T20:00:00.000Z",

  generatedAt:
    "2026-08-02T20:05:00.000Z",

  location: {
    latitude:
      29.5,

    longitude:
      -87.2,

    name:
      "Test Water"
  },

  lineage: {
    oceanEvidence: {
      methodVersion:
        "pelora-ocean-evidence-lineage-v1.0"
    }
  },

  contractVersions: {
    oceanEvidence:
      "pelora-ocean-evidence-v2.0",

    surfaceWaterCharacter:
      "pelora-surface-water-character-v1",

    waterMassAnalysis:
      "pelora-water-mass-analysis-v1",

    mixingZoneAnalysis:
      "pelora-mixing-zone-analysis-v1",

    environmentalTransitionAnalysis:
      "pelora-environmental-transition-analysis-v1",

    oceanFrontAnalysis:
      "pelora-ocean-front-analysis-v1",

    oceanPhysicsExplainability:
      "pelora-ocean-physics-explainability-v1",

    oceanPhysicsExplainabilityLineage:
      "pelora-ocean-physics-explainability-lineage-v1.0",

    oceanOrganization:
      "pelora-ocean-organization-v1",

    oceanEvidenceLineage:
      "pelora-ocean-evidence-lineage-v1.0",

    dataQuality:
      "pelora-data-quality-v2"
  },

  contractVersion:
    "pelora-observation-snapshot-v1"
};


const metadataIntelligenceSnapshot = {
  available:
    true,

  snapshotType:
    "intelligence",

  observedAt:
    "2026-08-02T20:00:00.000Z",

  generatedAt:
    "2026-08-02T20:05:00.000Z",

  lineage: {
    oceanOpportunity: {
      methodVersion:
        "pelora-ocean-opportunity-lineage-v1.0"
    }
  },

  contractVersions: {
    oceanOpportunity:
      "pelora-ocean-opportunity-v1.2",

    oceanOpportunityLineage:
      "pelora-ocean-opportunity-lineage-v1.0",

    relationshipContext:
      "pelora-relationship-context-v1.0",

    relationshipContextLineage:
      "pelora-relationship-context-lineage-v1.0",

    relationshipAssessment:
      "pelora-relationship-assessment-v1.0",

    relationshipAssessmentLineage:
      "pelora-relationship-assessment-lineage-v1.0",

    oceanPhysicsExplainability:
      "pelora-ocean-physics-explainability-v1",

    oceanPhysicsExplainabilityLineage:
      "pelora-ocean-physics-explainability-lineage-v1.0",

    oceanOrganization:
      "pelora-ocean-organization-v1"
  },

  contractVersion:
    "pelora-intelligence-snapshot-v1"
};


const governedSnapshotMetadata =
  buildSnapshotMetadata({
    observationSnapshot:
      metadataObservationSnapshot,

    intelligenceSnapshot:
      metadataIntelligenceSnapshot,

    captureMode:
      "live",

    sourceType:
      "live-observation",

    lifecycleState:
      "live"
  });

assert.equal(
  governedSnapshotMetadata.available,
  true
);

assert.equal(
  governedSnapshotMetadata.metadataType,
  "snapshot-metadata"
);

assert.equal(
  governedSnapshotMetadata.responsibility,
  "preserve"
);

assert.equal(
  governedSnapshotMetadata
    .availability
    .classification,
  "complete"
);

assert.equal(
  governedSnapshotMetadata
    .provenance
    .historicalBackfill,
  false
);

assert.equal(
  governedSnapshotMetadata
    .versionManifest
    .snapshotSchemaVersion,
  "pelora-ocean-memory-snapshot-schema-v1"
);

assert.equal(
  governedSnapshotMetadata
    .versionManifest
    .manifestVersion,
  "pelora-version-manifest-v1"
);

assert.equal(
  governedSnapshotMetadata
    .versionManifest
    .contractVersions
    .observationSnapshot,
  "pelora-observation-snapshot-v1"
);

assert.equal(
  governedSnapshotMetadata.contractVersion,
  "pelora-snapshot-metadata-v1"
);

assert.equal(
  Object.isFrozen(
    governedSnapshotMetadata
  ),
  true
);

assert.equal(
  Object.isFrozen(
    governedSnapshotMetadata
      .versionManifest
  ),
  true
);

console.log(
  "PASS Snapshot Metadata preserves authoritative identity, provenance, and version manifest"
);


const repeatedSnapshotMetadata =
  buildSnapshotMetadata({
    observationSnapshot:
      metadataObservationSnapshot,

    intelligenceSnapshot:
      metadataIntelligenceSnapshot,

    captureMode:
      "live"
  });

assert.equal(
  repeatedSnapshotMetadata
    .identity
    .snapshotId,
  governedSnapshotMetadata
    .identity
    .snapshotId
);

console.log(
  "PASS Snapshot Metadata produces deterministic identity for the same governed snapshot"
);


const historicalSnapshotMetadata =
  buildSnapshotMetadata({
    observationSnapshot: {
      ...metadataObservationSnapshot,

      observedAt:
        "2026-06-15T11:00:00.000Z",

      generatedAt:
        "2026-08-02T20:05:00.000Z"
    },

    intelligenceSnapshot: {
      ...metadataIntelligenceSnapshot,

      observedAt:
        "2026-06-15T11:00:00.000Z",

      generatedAt:
        "2026-08-02T20:05:00.000Z"
    },

    captureMode:
      "historical-backfill",

    sourceType:
      "archived-observation",

    lifecycleState:
      "historical-backfill",

    reconstructionStatus:
      "completed"
  });

assert.equal(
  historicalSnapshotMetadata
    .provenance
    .historicalBackfill,
  true
);

assert.equal(
  historicalSnapshotMetadata
    .time
    .observedAt,
  "2026-06-15T11:00:00.000Z"
);

assert.equal(
  historicalSnapshotMetadata
    .time
    .generatedAt,
  "2026-08-02T20:05:00.000Z"
);

assert.notEqual(
  historicalSnapshotMetadata
    .identity
    .snapshotId,
  governedSnapshotMetadata
    .identity
    .snapshotId
);

console.log(
  "PASS Snapshot Metadata distinguishes historical backfill time and provenance"
);


const partialSnapshotMetadata =
  buildSnapshotMetadata({
    observationSnapshot:
      metadataObservationSnapshot,

    intelligenceSnapshot:
      null
  });

assert.equal(
  partialSnapshotMetadata.available,
  true
);

assert.equal(
  partialSnapshotMetadata
    .availability
    .classification,
  "partial"
);

assert.ok(
  partialSnapshotMetadata
    .missingRequirements
    .includes(
      "intelligence-snapshot"
    )
);

console.log(
  "PASS Snapshot Metadata preserves partial snapshot availability"
);


const unavailableSnapshotMetadata =
  buildSnapshotMetadata();

assert.equal(
  unavailableSnapshotMetadata.available,
  false
);

assert.equal(
  unavailableSnapshotMetadata
    .availability
    .classification,
  "unavailable"
);

assert.ok(
  unavailableSnapshotMetadata
    .missingRequirements
    .includes(
      "observation-snapshot"
    )
);

assert.ok(
  unavailableSnapshotMetadata
    .missingRequirements
    .includes(
      "snapshot-location"
    )
);

console.log(
  "PASS Snapshot Metadata discloses missing identity and provenance inputs"
);


assert.equal(
  Object.hasOwn(
    governedSnapshotMetadata,
    "oceanOpportunity"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedSnapshotMetadata,
    "observations"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedSnapshotMetadata,
    "trend"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedSnapshotMetadata,
    "captainNarrative"
  ),
  false
);

console.log(
  "PASS Snapshot Metadata excludes scientific reasoning, comparison, and guidance"
);



/**
 * ------------------------------------------------------------
 * Ocean Snapshot Assembly Contract v1.0
 * ------------------------------------------------------------
 */

const assemblyObservationSnapshot = {
  available:
    true,

  snapshotType:
    "observation",

  observedAt:
    "2026-08-02T21:00:00.000Z",

  generatedAt:
    "2026-08-02T21:05:00.000Z",

  location: {
    latitude:
      29.5,

    longitude:
      -87.2
  },

  observations: {
    sst: {
      temperatureFahrenheit:
        83
    }
  },

  limitations:
    [],

  contractVersion:
    "pelora-observation-snapshot-v1"
};


const assemblyIntelligenceSnapshot = {
  available:
    true,

  snapshotType:
    "intelligence",

  observedAt:
    "2026-08-02T21:00:00.000Z",

  generatedAt:
    "2026-08-02T21:05:00.000Z",

  oceanOrganization: {
    organizationLevel:
      "organized"
  },

  limitations:
    [],

  contractVersion:
    "pelora-intelligence-snapshot-v1"
};


const assemblySnapshotMetadata = {
  available:
    true,

  identity: {
    snapshotId:
      "pelora-snapshot-test1234",

    snapshotSchemaVersion:
      "pelora-ocean-memory-snapshot-schema-v1"
  },

  time: {
    observedAt:
      "2026-08-02T21:00:00.000Z",

    generatedAt:
      "2026-08-02T21:05:00.000Z"
  },

  versionManifest: {
    contractVersions: {
      observationSnapshot:
        "pelora-observation-snapshot-v1",

      intelligenceSnapshot:
        "pelora-intelligence-snapshot-v1"
    },

    snapshotSchemaVersion:
      "pelora-ocean-memory-snapshot-schema-v1",

    manifestVersion:
      "pelora-version-manifest-v1"
  },

  limitations:
    [],

  contractVersion:
    "pelora-snapshot-metadata-v1"
};


const governedOceanSnapshot =
  buildOceanSnapshot({
    snapshotMetadata:
      assemblySnapshotMetadata,

    observationSnapshot:
      assemblyObservationSnapshot,

    intelligenceSnapshot:
      assemblyIntelligenceSnapshot
  });

assert.equal(
  governedOceanSnapshot.available,
  true
);

assert.equal(
  governedOceanSnapshot.snapshotType,
  "ocean-memory"
);

assert.equal(
  governedOceanSnapshot.responsibility,
  "preserve"
);

assert.equal(
  governedOceanSnapshot
    .identity
    .snapshotId,
  "pelora-snapshot-test1234"
);

assert.equal(
  governedOceanSnapshot
    .integrity
    .observedAtConsistent,
  true
);

assert.equal(
  governedOceanSnapshot
    .integrity
    .generatedAtConsistent,
  true
);

assert.equal(
  governedOceanSnapshot
    .integrity
    .observationContractConsistent,
  true
);

assert.equal(
  governedOceanSnapshot
    .integrity
    .intelligenceContractConsistent,
  true
);

assert.equal(
  governedOceanSnapshot.contractVersion,
  "pelora-ocean-snapshot-assembly-v1"
);

assert.equal(
  Object.isFrozen(
    governedOceanSnapshot
  ),
  true
);

assert.equal(
  Object.isFrozen(
    governedOceanSnapshot
      .metadata
  ),
  true
);

assert.equal(
  Object.isFrozen(
    governedOceanSnapshot
      .observation
      .observations
  ),
  true
);

console.log(
  "PASS Ocean Snapshot Assembly composes and freezes the canonical Ocean Memory record"
);


assemblyObservationSnapshot
  .observations
  .sst
  .temperatureFahrenheit =
  90;

assert.equal(
  governedOceanSnapshot
    .observation
    .observations
    .sst
    .temperatureFahrenheit,
  83
);

console.log(
  "PASS Ocean Snapshot Assembly remains isolated from later child-contract mutation"
);


const partialOceanSnapshot =
  buildOceanSnapshot({
    snapshotMetadata: {
      ...assemblySnapshotMetadata,

      versionManifest: {
        ...assemblySnapshotMetadata
          .versionManifest,

        contractVersions: {
          observationSnapshot:
            "pelora-observation-snapshot-v1",

          intelligenceSnapshot:
            null
        }
      }
    },

    observationSnapshot:
      assemblyObservationSnapshot,

    intelligenceSnapshot:
      null
  });

assert.equal(
  partialOceanSnapshot.available,
  true
);

assert.equal(
  partialOceanSnapshot
    .integrity
    .intelligenceSnapshotAvailable,
  false
);

assert.ok(
  partialOceanSnapshot
    .missingRequirements
    .includes(
      "intelligence-snapshot"
    )
);

console.log(
  "PASS Ocean Snapshot Assembly preserves a valid observation-only partial record"
);


const inconsistentTimeOceanSnapshot =
  buildOceanSnapshot({
    snapshotMetadata:
      assemblySnapshotMetadata,

    observationSnapshot:
      assemblyObservationSnapshot,

    intelligenceSnapshot: {
      ...assemblyIntelligenceSnapshot,

      observedAt:
        "2026-08-02T22:00:00.000Z"
    }
  });

assert.equal(
  inconsistentTimeOceanSnapshot.available,
  false
);

assert.equal(
  inconsistentTimeOceanSnapshot
    .integrity
    .observedAtConsistent,
  false
);

assert.ok(
  inconsistentTimeOceanSnapshot
    .missingRequirements
    .includes(
      "consistent-observed-at"
    )
);

console.log(
  "PASS Ocean Snapshot Assembly rejects inconsistent observation timestamps"
);


const inconsistentVersionOceanSnapshot =
  buildOceanSnapshot({
    snapshotMetadata:
      assemblySnapshotMetadata,

    observationSnapshot: {
      ...assemblyObservationSnapshot,

      contractVersion:
        "pelora-observation-snapshot-v2"
    },

    intelligenceSnapshot:
      assemblyIntelligenceSnapshot
  });

assert.equal(
  inconsistentVersionOceanSnapshot.available,
  false
);

assert.equal(
  inconsistentVersionOceanSnapshot
    .integrity
    .observationContractConsistent,
  false
);

assert.ok(
  inconsistentVersionOceanSnapshot
    .missingRequirements
    .includes(
      "observation-contract-version-consistency"
    )
);

console.log(
  "PASS Ocean Snapshot Assembly rejects inconsistent governed contract versions"
);


const unavailableOceanSnapshot =
  buildOceanSnapshot();

assert.equal(
  unavailableOceanSnapshot.available,
  false
);

assert.ok(
  unavailableOceanSnapshot
    .missingRequirements
    .includes(
      "snapshot-metadata"
    )
);

assert.ok(
  unavailableOceanSnapshot
    .missingRequirements
    .includes(
      "observation-snapshot"
    )
);

console.log(
  "PASS Ocean Snapshot Assembly discloses missing canonical child contracts"
);


assert.equal(
  Object.hasOwn(
    governedOceanSnapshot,
    "trend"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedOceanSnapshot,
    "persistence"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedOceanSnapshot,
    "captainNarrative"
  ),
  false
);

console.log(
  "PASS Ocean Snapshot Assembly excludes comparison, persistence, and guidance"
);


/**
 * ------------------------------------------------------------
 * Backend Supabase Configuration v1.0
 * ------------------------------------------------------------
 */

const unavailableBackendSupabaseConfiguration =
  buildBackendSupabaseConfiguration({
    environment: {}
  });

assert.equal(
  unavailableBackendSupabaseConfiguration
    .available,
  false
);

assert.equal(
  unavailableBackendSupabaseConfiguration
    .configurationType,
  "backend-supabase-configuration"
);

assert.equal(
  unavailableBackendSupabaseConfiguration
    .responsibility,
  "preserve"
);

assert.equal(
  unavailableBackendSupabaseConfiguration
    .restUrl,
  null
);

assert.equal(
  unavailableBackendSupabaseConfiguration
    .projectUrl,
  null
);

assert.equal(
  unavailableBackendSupabaseConfiguration
    .publishableKeyAvailable,
  false
);

assert.ok(
  unavailableBackendSupabaseConfiguration
    .missingRequirements
    .includes(
      "supabase-url"
    )
);

assert.ok(
  unavailableBackendSupabaseConfiguration
    .missingRequirements
    .includes(
      "supabase-publishable-key"
    )
);

console.log(
  "PASS Backend Supabase Configuration remains unavailable without environment variables"
);


const validBackendSupabaseConfiguration =
  buildBackendSupabaseConfiguration({
    environment: {
      SUPABASE_URL:
        "https://pelora-test.supabase.co/",

      SUPABASE_PUBLISHABLE_KEY:
        "pelora-test-publishable-key"
    }
  });

assert.equal(
  validBackendSupabaseConfiguration
    .available,
  true
);

assert.equal(
  validBackendSupabaseConfiguration
    .projectUrl,
  "https://pelora-test.supabase.co"
);

assert.equal(
  validBackendSupabaseConfiguration
    .restUrl,
  "https://pelora-test.supabase.co/rest/v1"
);

assert.equal(
  validBackendSupabaseConfiguration
    .publishableKeyAvailable,
  true
);

assert.equal(
  validBackendSupabaseConfiguration
    .serviceRoleConfigured,
  false
);

assert.equal(
  validBackendSupabaseConfiguration
    .credentials
    .publishableKey,
  "pelora-test-publishable-key"
);

assert.equal(
  validBackendSupabaseConfiguration
    .credentials
    .serviceRoleKey,
  null
);

assert.equal(
  validBackendSupabaseConfiguration
    .diagnostics
    .urlConfigured,
  true
);

assert.equal(
  validBackendSupabaseConfiguration
    .diagnostics
    .urlValid,
  true
);

assert.equal(
  validBackendSupabaseConfiguration
    .diagnostics
    .publishableKeyConfigured,
  true
);

assert.equal(
  validBackendSupabaseConfiguration
    .contractVersion,
  "pelora-backend-supabase-configuration-v1"
);

console.log(
  "PASS Backend Supabase Configuration accepts and normalizes valid public REST configuration"
);


const invalidProtocolBackendSupabaseConfiguration =
  buildBackendSupabaseConfiguration({
    environment: {
      SUPABASE_URL:
        "http://pelora-test.supabase.co",

      SUPABASE_PUBLISHABLE_KEY:
        "pelora-test-publishable-key"
    }
  });

assert.equal(
  invalidProtocolBackendSupabaseConfiguration
    .available,
  false
);

assert.equal(
  invalidProtocolBackendSupabaseConfiguration
    .diagnostics
    .urlConfigured,
  true
);

assert.equal(
  invalidProtocolBackendSupabaseConfiguration
    .diagnostics
    .urlValid,
  false
);

assert.ok(
  invalidProtocolBackendSupabaseConfiguration
    .missingRequirements
    .includes(
      "supabase-url"
    )
);

console.log(
  "PASS Backend Supabase Configuration rejects non-HTTPS project URLs"
);


const malformedBackendSupabaseConfiguration =
  buildBackendSupabaseConfiguration({
    environment: {
      SUPABASE_URL:
        "not-a-valid-url",

      SUPABASE_PUBLISHABLE_KEY:
        "pelora-test-publishable-key"
    }
  });

assert.equal(
  malformedBackendSupabaseConfiguration
    .available,
  false
);

assert.equal(
  malformedBackendSupabaseConfiguration
    .projectUrl,
  null
);

assert.equal(
  malformedBackendSupabaseConfiguration
    .restUrl,
  null
);

assert.equal(
  malformedBackendSupabaseConfiguration
    .diagnostics
    .urlValid,
  false
);

console.log(
  "PASS Backend Supabase Configuration rejects malformed project URLs"
);


const serviceRoleBackendSupabaseConfiguration =
  buildBackendSupabaseConfiguration({
    environment: {
      SUPABASE_URL:
        "https://pelora-test.supabase.co",

      SUPABASE_PUBLISHABLE_KEY:
        "pelora-test-publishable-key",

      SUPABASE_SERVICE_ROLE_KEY:
        "pelora-test-service-role-key"
    }
  });

assert.equal(
  serviceRoleBackendSupabaseConfiguration
    .available,
  false
);

assert.equal(
  serviceRoleBackendSupabaseConfiguration
    .serviceRoleConfigured,
  true
);

assert.equal(
  serviceRoleBackendSupabaseConfiguration
    .credentials
    .publishableKey,
  null
);

assert.equal(
  serviceRoleBackendSupabaseConfiguration
    .credentials
    .serviceRoleKey,
  null
);

assert.equal(
  serviceRoleBackendSupabaseConfiguration
    .diagnostics
    .serviceRoleRejected,
  true
);

assert.ok(
  serviceRoleBackendSupabaseConfiguration
    .missingRequirements
    .includes(
      "remove-service-role-key-from-ocean-memory-runtime"
    )
);

console.log(
  "PASS Backend Supabase Configuration rejects service-role access"
);


assert.equal(
  Object.isFrozen(
    validBackendSupabaseConfiguration
  ),
  true
);

assert.equal(
  Object.isFrozen(
    validBackendSupabaseConfiguration
      .credentials
  ),
  true
);

assert.equal(
  Object.isFrozen(
    validBackendSupabaseConfiguration
      .diagnostics
  ),
  true
);

assert.ok(
  validBackendSupabaseConfiguration
    .limitations
    .includes(
      "This contract does not query Supabase, validate a captain session, expose credentials, bypass Row Level Security, or support service-role access."
    )
);

assert.equal(
  validBackendSupabaseConfiguration
    .query,
  undefined
);

assert.equal(
  validBackendSupabaseConfiguration
    .session,
  undefined
);

assert.equal(
  validBackendSupabaseConfiguration
    .user,
  undefined
);

console.log(
  "PASS Backend Supabase Configuration remains frozen and excludes database or authentication behavior"
);


/**
 * ------------------------------------------------------------
 * Backend Ocean Memory Retrieval v1.0
 * ------------------------------------------------------------
 */

let missingRequirementsFetchCallCount =
  0;


const unavailableOceanMemoryRetrieval =
  await retrieveOceanMemoryRows({
    configuration:
      unavailableBackendSupabaseConfiguration,

    bearerToken:
      null,

    fetchImplementation:
      async () => {
        missingRequirementsFetchCallCount +=
          1;

        throw new Error(
          "Fetch should not be called."
        );
      }
  });


assert.equal(
  unavailableOceanMemoryRetrieval.available,
  false
);

assert.equal(
  unavailableOceanMemoryRetrieval
    .retrievalType,
  "backend-ocean-memory-row-retrieval"
);

assert.equal(
  unavailableOceanMemoryRetrieval
    .responsibility,
  "preserve"
);

assert.equal(
  unavailableOceanMemoryRetrieval
    .requestPerformed,
  false
);

assert.equal(
  missingRequirementsFetchCallCount,
  0
);

assert.deepEqual(
  unavailableOceanMemoryRetrieval.rows,
  []
);

assert.ok(
  unavailableOceanMemoryRetrieval
    .missingRequirements
    .includes(
      "available-backend-supabase-configuration"
    )
);

assert.ok(
  unavailableOceanMemoryRetrieval
    .missingRequirements
    .includes(
      "captain-bearer-token"
    )
);

console.log(
  "PASS Backend Ocean Memory Retrieval remains unavailable and avoids network access without required inputs"
);


let authenticatedRequestUrl =
  null;

let authenticatedRequestOptions =
  null;


const successfulOceanMemoryRows = [
  {
    id:
      "database-row-1",

    snapshot_id:
      "pelora-snapshot-1",

    user_id:
      "captain-test-user",

    observed_at:
      "2026-08-01T12:00:00.000Z",

    created_at:
      "2026-08-01T12:05:00.000Z",

    snapshot_schema_version:
      "pelora-ocean-memory-snapshot-schema-v1",

    snapshot_contract_version:
      "pelora-ocean-snapshot-assembly-v1",

    snapshot_payload: {
      available:
        true
    }
  },

  {
    id:
      "database-row-2",

    snapshot_id:
      "pelora-snapshot-2",

    user_id:
      "captain-test-user",

    observed_at:
      "2026-08-02T12:00:00.000Z",

    created_at:
      "2026-08-02T12:05:00.000Z",

    snapshot_schema_version:
      "pelora-ocean-memory-snapshot-schema-v1",

    snapshot_contract_version:
      "pelora-ocean-snapshot-assembly-v1",

    snapshot_payload: {
      available:
        true
    }
  }
];


const successfulOceanMemoryRetrieval =
  await retrieveOceanMemoryRows({
    configuration:
      validBackendSupabaseConfiguration,

    bearerToken:
      "captain-test-access-token",

    latitude:
      29.5,

    longitude:
      -87.25,

    observedAfter:
      "2026-08-01T00:00:00.000Z",

    observedBefore:
      "2026-08-03T00:00:00.000Z",

    maximumRows:
      25,

    fetchImplementation:
      async (
        url,
        options
      ) => {
        authenticatedRequestUrl =
          url;

        authenticatedRequestOptions =
          options;

        return {
          ok:
            true,

          status:
            200,

          async json() {
            return successfulOceanMemoryRows;
          }
        };
      }
  });


assert.equal(
  successfulOceanMemoryRetrieval.available,
  true
);

assert.equal(
  successfulOceanMemoryRetrieval
    .requestPerformed,
  true
);

assert.equal(
  successfulOceanMemoryRetrieval
    .summary
    .responseOk,
  true
);

assert.equal(
  successfulOceanMemoryRetrieval
    .summary
    .httpStatus,
  200
);

assert.equal(
  successfulOceanMemoryRetrieval
    .summary
    .returnedRowCount,
  2
);

assert.deepEqual(
  successfulOceanMemoryRetrieval.rows,
  successfulOceanMemoryRows
);

assert.notEqual(
  successfulOceanMemoryRetrieval.rows,
  successfulOceanMemoryRows
);

assert.equal(
  successfulOceanMemoryRetrieval
    .contractVersion,
  "pelora-backend-ocean-memory-retrieval-v1"
);

console.log(
  "PASS Backend Ocean Memory Retrieval returns successful captain-owned REST rows"
);


const parsedAuthenticatedRequestUrl =
  new URL(
    authenticatedRequestUrl
  );


assert.equal(
  parsedAuthenticatedRequestUrl.origin,
  "https://pelora-test.supabase.co"
);

assert.equal(
  parsedAuthenticatedRequestUrl.pathname,
  "/rest/v1/ocean_snapshots"
);

assert.equal(
  parsedAuthenticatedRequestUrl
    .searchParams
    .get(
      "select"
    ),
  "*"
);

assert.equal(
  parsedAuthenticatedRequestUrl
    .searchParams
    .get(
      "latitude"
    ),
  "eq.29.5"
);

assert.equal(
  parsedAuthenticatedRequestUrl
    .searchParams
    .get(
      "longitude"
    ),
  "eq.-87.25"
);

assert.deepEqual(
  parsedAuthenticatedRequestUrl
    .searchParams
    .getAll(
      "observed_at"
    ),
  [
    "gte.2026-08-01T00:00:00.000Z",
    "lte.2026-08-03T00:00:00.000Z"
  ]
);

assert.equal(
  parsedAuthenticatedRequestUrl
    .searchParams
    .get(
      "order"
    ),
  "observed_at.asc"
);

assert.equal(
  parsedAuthenticatedRequestUrl
    .searchParams
    .get(
      "limit"
    ),
  "25"
);

assert.equal(
  authenticatedRequestOptions.method,
  "GET"
);

assert.equal(
  authenticatedRequestOptions
    .headers
    .apikey,
  "pelora-test-publishable-key"
);

assert.equal(
  authenticatedRequestOptions
    .headers
    .Authorization,
  "Bearer captain-test-access-token"
);

assert.equal(
  authenticatedRequestOptions
    .headers
    .Accept,
  "application/json"
);

assert.equal(
  authenticatedRequestOptions.cache,
  "no-store"
);

assert.equal(
  successfulOceanMemoryRetrieval
    .request
    .coordinateFilterApplied,
  true
);

assert.equal(
  successfulOceanMemoryRetrieval
    .request
    .latitude,
  29.5
);

assert.equal(
  successfulOceanMemoryRetrieval
    .request
    .longitude,
  -87.25
);

console.log(
  "PASS Backend Ocean Memory Retrieval builds authenticated RLS-preserving filters and headers"
);


let cappedLimitRequestUrl =
  null;


const cappedLimitOceanMemoryRetrieval =
  await retrieveOceanMemoryRows({
    configuration:
      validBackendSupabaseConfiguration,

    bearerToken:
      "captain-test-access-token",

    maximumRows:
      1000,

    fetchImplementation:
      async url => {
        cappedLimitRequestUrl =
          url;

        return {
          ok:
            true,

          status:
            200,

          async json() {
            return [];
          }
        };
      }
  });


assert.equal(
  cappedLimitOceanMemoryRetrieval
    .request
    .maximumRows,
  250
);

assert.equal(
  new URL(
    cappedLimitRequestUrl
  )
    .searchParams
    .get(
      "limit"
    ),
  "250"
);

assert.equal(
  cappedLimitOceanMemoryRetrieval
    .request
    .coordinateFilterApplied,
  false
);

assert.ok(
  cappedLimitOceanMemoryRetrieval
    .limitations
    .includes(
      "exact-coordinate-filter-not-applied"
    )
);

console.log(
  "PASS Backend Ocean Memory Retrieval caps row limits and discloses missing coordinate filtering"
);


const emptyOceanMemoryRetrieval =
  await retrieveOceanMemoryRows({
    configuration:
      validBackendSupabaseConfiguration,

    bearerToken:
      "captain-test-access-token",

    fetchImplementation:
      async () => ({
        ok:
          true,

        status:
          200,

        async json() {
          return [];
        }
      })
  });


assert.equal(
  emptyOceanMemoryRetrieval.available,
  true
);

assert.equal(
  emptyOceanMemoryRetrieval
    .summary
    .responseOk,
  true
);

assert.equal(
  emptyOceanMemoryRetrieval
    .summary
    .returnedRowCount,
  0
);

assert.ok(
  emptyOceanMemoryRetrieval
    .limitations
    .includes(
      "no-ocean-memory-rows-returned"
    )
);

console.log(
  "PASS Backend Ocean Memory Retrieval preserves a successful empty historical response"
);


const unsuccessfulOceanMemoryRetrieval =
  await retrieveOceanMemoryRows({
    configuration:
      validBackendSupabaseConfiguration,

    bearerToken:
      "captain-test-access-token",

    fetchImplementation:
      async () => ({
        ok:
          false,

        status:
          401,

        async json() {
          return {
            message:
              "Unauthorized"
          };
        }
      })
  });


assert.equal(
  unsuccessfulOceanMemoryRetrieval.available,
  false
);

assert.equal(
  unsuccessfulOceanMemoryRetrieval
    .requestPerformed,
  true
);

assert.equal(
  unsuccessfulOceanMemoryRetrieval
    .summary
    .responseOk,
  false
);

assert.equal(
  unsuccessfulOceanMemoryRetrieval
    .summary
    .httpStatus,
  401
);

assert.equal(
  unsuccessfulOceanMemoryRetrieval
    .summary
    .returnedRowCount,
  0
);

assert.ok(
  unsuccessfulOceanMemoryRetrieval
    .limitations
    .includes(
      "supabase-response-not-successful"
    )
);

console.log(
  "PASS Backend Ocean Memory Retrieval preserves unsuccessful Supabase responses without exposing data"
);


const failedNetworkOceanMemoryRetrieval =
  await retrieveOceanMemoryRows({
    configuration:
      validBackendSupabaseConfiguration,

    bearerToken:
      "captain-test-access-token",

    fetchImplementation:
      async () => {
        throw new Error(
          "Test network failure"
        );
      }
  });


assert.equal(
  failedNetworkOceanMemoryRetrieval.available,
  false
);

assert.equal(
  failedNetworkOceanMemoryRetrieval
    .requestPerformed,
  true
);

assert.equal(
  failedNetworkOceanMemoryRetrieval
    .summary
    .responseOk,
  false
);

assert.equal(
  failedNetworkOceanMemoryRetrieval
    .summary
    .httpStatus,
  null
);

assert.deepEqual(
  failedNetworkOceanMemoryRetrieval.rows,
  []
);

assert.ok(
  failedNetworkOceanMemoryRetrieval
    .limitations
    .includes(
      "supabase-request-failed"
    )
);

console.log(
  "PASS Backend Ocean Memory Retrieval degrades safely after a network failure"
);


const invalidWindowOceanMemoryRetrieval =
  await retrieveOceanMemoryRows({
    configuration:
      validBackendSupabaseConfiguration,

    bearerToken:
      "captain-test-access-token",

    observedAfter:
      "2026-08-05T00:00:00.000Z",

    observedBefore:
      "2026-08-01T00:00:00.000Z",

    fetchImplementation:
      async () => {
        throw new Error(
          "Fetch should not be called for an invalid time window."
        );
      }
  });


assert.equal(
  invalidWindowOceanMemoryRetrieval.available,
  false
);

assert.equal(
  invalidWindowOceanMemoryRetrieval
    .requestPerformed,
  false
);

assert.ok(
  invalidWindowOceanMemoryRetrieval
    .missingRequirements
    .includes(
      "valid-observed-time-window"
    )
);

console.log(
  "PASS Backend Ocean Memory Retrieval rejects an invalid observation window before network access"
);


assert.equal(
  Object.isFrozen(
    successfulOceanMemoryRetrieval
  ),
  true
);

assert.equal(
  Object.isFrozen(
    successfulOceanMemoryRetrieval.rows
  ),
  true
);

assert.equal(
  Object.isFrozen(
    successfulOceanMemoryRetrieval
      .request
  ),
  true
);

assert.ok(
  successfulOceanMemoryRetrieval
    .limitations
    .includes(
      "This contract does not adapt database rows, compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    )
);

assert.equal(
  successfulOceanMemoryRetrieval
    .persistence,
  undefined
);

assert.equal(
  successfulOceanMemoryRetrieval
    .trend,
  undefined
);

assert.equal(
  successfulOceanMemoryRetrieval
    .opportunity,
  undefined
);

assert.equal(
  successfulOceanMemoryRetrieval
    .species,
  undefined
);

console.log(
  "PASS Backend Ocean Memory Retrieval remains frozen, preservation-only, and scientifically neutral"
);


/**
 * ------------------------------------------------------------
 * Ocean Memory Storage Contract v1.0
 * ------------------------------------------------------------
 */

const oceanMemoryStoredAt =
  "2026-08-02T21:05:00.000Z";

const governedOceanMemoryRecord =
  buildOceanMemoryStorage({
    oceanSnapshot:
      governedOceanSnapshot,

    storedAt:
      oceanMemoryStoredAt,

    storageProvider:
      "pelora-test-memory"
  });

assert.equal(
  governedOceanMemoryRecord.available,
  true
);

assert.equal(
  governedOceanMemoryRecord.storageType,
  "ocean-memory-record"
);

assert.equal(
  governedOceanMemoryRecord.responsibility,
  "preserve"
);

assert.equal(
  governedOceanMemoryRecord
    .identity
    .snapshotId,
  governedOceanSnapshot
    .identity
    .snapshotId
);

assert.equal(
  governedOceanMemoryRecord
    .identity
    .snapshotSchemaVersion,
  governedOceanSnapshot
    .identity
    .snapshotSchemaVersion
);

assert.equal(
  governedOceanMemoryRecord
    .storage
    .storedAt,
  oceanMemoryStoredAt
);

assert.equal(
  governedOceanMemoryRecord
    .storage
    .storageProvider,
  "pelora-test-memory"
);

assert.equal(
  governedOceanMemoryRecord
    .storage
    .immutable,
  true
);

assert.equal(
  governedOceanMemoryRecord
    .storage
    .externalWritePerformed,
  false
);

assert.equal(
  governedOceanMemoryRecord
    .governedVersions
    .oceanSnapshot,
  "pelora-ocean-snapshot-assembly-v1"
);

assert.equal(
  governedOceanMemoryRecord
    .contractVersion,
  "pelora-ocean-memory-storage-v1"
);

assert.equal(
  Object.isFrozen(
    governedOceanMemoryRecord
  ),
  true
);

assert.equal(
  Object.isFrozen(
    governedOceanMemoryRecord.snapshot
  ),
  true
);

console.log(
  "PASS Ocean Memory Storage creates and freezes a governed storage record"
);


const mutableOceanSnapshotSource =
  JSON.parse(
    JSON.stringify(
      governedOceanSnapshot
    )
  );

const isolatedOceanMemoryRecord =
  buildOceanMemoryStorage({
    oceanSnapshot:
      mutableOceanSnapshotSource,

    storedAt:
      oceanMemoryStoredAt,

    storageProvider:
      "pelora-test-memory"
  });

mutableOceanSnapshotSource
  .metadata
  .time
  .observedAt =
  "2099-01-01T00:00:00.000Z";

assert.equal(
  isolatedOceanMemoryRecord
    .snapshot
    .metadata
    .time
    .observedAt,
  assemblySnapshotMetadata
    .time
    .observedAt
);

console.log(
  "PASS Ocean Memory Storage remains isolated from later canonical snapshot mutation"
);


const unavailableOceanMemoryRecord =
  buildOceanMemoryStorage();

assert.equal(
  unavailableOceanMemoryRecord.available,
  false
);

assert.ok(
  unavailableOceanMemoryRecord
    .missingRequirements
    .includes(
      "canonical-ocean-snapshot"
    )
);

assert.ok(
  unavailableOceanMemoryRecord
    .missingRequirements
    .includes(
      "stored-at"
    )
);

console.log(
  "PASS Ocean Memory Storage discloses missing canonical storage inputs"
);


assert.equal(
  Object.hasOwn(
    governedOceanMemoryRecord,
    "retrieval"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedOceanMemoryRecord,
    "comparison"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedOceanMemoryRecord,
    "persistence"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedOceanMemoryRecord,
    "trend"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedOceanMemoryRecord,
    "captainNarrative"
  ),
  false
);

console.log(
  "PASS Ocean Memory Storage excludes retrieval, comparison, persistence, trend, and guidance"
);


/**
 * ------------------------------------------------------------
 * Ocean Memory Storage Row Adapter v1.0
 * ------------------------------------------------------------
 */

const validOceanSnapshotDatabaseRow = {
  id:
    "database-row-test-1",

  snapshot_id:
    governedOceanSnapshot
      .identity
      .snapshotId,

  user_id:
    "pelora-test-user",

  fishing_day_report_id:
    "pelora-test-report",

  observed_at:
    governedOceanSnapshot
      .metadata
      .time
      .observedAt,

  generated_at:
    governedOceanSnapshot
      .metadata
      .time
      .generatedAt,

  created_at:
    "2026-08-05T21:30:00.000Z",

  latitude:
    governedOceanSnapshot
      .observation
      .location
      .latitude,

  longitude:
    governedOceanSnapshot
      .observation
      .location
      .longitude,

  capture_mode:
    "live",

  lifecycle_state:
    "live",

  availability_classification:
    "complete",

  snapshot_schema_version:
    governedOceanSnapshot
      .identity
      .snapshotSchemaVersion,

  snapshot_contract_version:
    governedOceanSnapshot
      .contractVersion,

  snapshot_payload:
    JSON.parse(
      JSON.stringify(
        governedOceanSnapshot
      )
    )
};


const adaptedOceanMemoryStorageRecord =
  buildOceanMemoryStorageRecordFromRow({
    row:
      validOceanSnapshotDatabaseRow
  });

assert.equal(
  adaptedOceanMemoryStorageRecord.available,
  true
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .storageType,
  "ocean-memory-storage-record"
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .responsibility,
  "preserve"
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .identity
    .snapshotId,
  governedOceanSnapshot
    .identity
    .snapshotId
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .identity
    .snapshotSchemaVersion,
  governedOceanSnapshot
    .identity
    .snapshotSchemaVersion
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .identity
    .userId,
  "pelora-test-user"
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .storage
    .storedAt,
  "2026-08-05T21:30:00.000Z"
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .storage
    .storageProvider,
  "supabase-ocean-snapshots"
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .storage
    .externalWritePerformed,
  true
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .governedVersions
    .oceanSnapshot,
  governedOceanSnapshot
    .contractVersion
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .contractVersion,
  "pelora-ocean-memory-storage-v1"
);

console.log(
  "PASS Ocean Memory Storage Row Adapter converts a valid Supabase row into a governed storage record"
);


assert.deepEqual(
  adaptedOceanMemoryStorageRecord
    .snapshot,
  governedOceanSnapshot
);

assert.notEqual(
  adaptedOceanMemoryStorageRecord
    .snapshot,
  validOceanSnapshotDatabaseRow
    .snapshot_payload
);

assert.equal(
  Object.isFrozen(
    adaptedOceanMemoryStorageRecord
  ),
  true
);

assert.equal(
  Object.isFrozen(
    adaptedOceanMemoryStorageRecord
      .snapshot
  ),
  true
);

assert.equal(
  Object.isFrozen(
    adaptedOceanMemoryStorageRecord
      .databaseReference
  ),
  true
);

console.log(
  "PASS Ocean Memory Storage Row Adapter preserves and freezes the canonical snapshot payload"
);


assert.equal(
  adaptedOceanMemoryStorageRecord
    .databaseReference
    .rowId,
  "database-row-test-1"
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .databaseReference
    .fishingDayReportId,
  "pelora-test-report"
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .databaseReference
    .observedAt,
  governedOceanSnapshot
    .metadata
    .time
    .observedAt
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .databaseReference
    .latitude,
  governedOceanSnapshot
    .observation
    .location
    .latitude
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .databaseReference
    .longitude,
  governedOceanSnapshot
    .observation
    .location
    .longitude
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .integrity
    .payloadAvailable,
  true
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .integrity
    .snapshotIdConsistent,
  true
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .integrity
    .snapshotSchemaVersionConsistent,
  true
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .integrity
    .snapshotContractVersionConsistent,
  true
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .integrity
    .observedAtConsistent,
  true
);

console.log(
  "PASS Ocean Memory Storage Row Adapter preserves ownership, provenance, and integrity"
);


const missingCreatedAtStorageRecord =
  buildOceanMemoryStorageRecordFromRow({
    row: {
      ...validOceanSnapshotDatabaseRow,

      created_at:
        null
    }
  });

assert.equal(
  missingCreatedAtStorageRecord.available,
  false
);

assert.ok(
  missingCreatedAtStorageRecord
    .missingRequirements
    .includes(
      "database-created-at"
    )
);

assert.equal(
  missingCreatedAtStorageRecord
    .snapshot,
  null
);

console.log(
  "PASS Ocean Memory Storage Row Adapter rejects missing external storage time"
);


const mismatchedSnapshotIdStorageRecord =
  buildOceanMemoryStorageRecordFromRow({
    row: {
      ...validOceanSnapshotDatabaseRow,

      snapshot_id:
        "mismatched-database-snapshot-id"
    }
  });

assert.equal(
  mismatchedSnapshotIdStorageRecord.available,
  false
);

assert.equal(
  mismatchedSnapshotIdStorageRecord
    .integrity
    .snapshotIdConsistent,
  false
);

assert.ok(
  mismatchedSnapshotIdStorageRecord
    .missingRequirements
    .includes(
      "snapshot-id-consistency"
    )
);

console.log(
  "PASS Ocean Memory Storage Row Adapter rejects mismatched snapshot identity"
);


const mismatchedSchemaVersionStorageRecord =
  buildOceanMemoryStorageRecordFromRow({
    row: {
      ...validOceanSnapshotDatabaseRow,

      snapshot_schema_version:
        "pelora-test-mismatched-schema-version"
    }
  });

assert.equal(
  mismatchedSchemaVersionStorageRecord.available,
  false
);

assert.equal(
  mismatchedSchemaVersionStorageRecord
    .integrity
    .snapshotSchemaVersionConsistent,
  false
);

assert.ok(
  mismatchedSchemaVersionStorageRecord
    .missingRequirements
    .includes(
      "snapshot-schema-version-consistency"
    )
);

console.log(
  "PASS Ocean Memory Storage Row Adapter rejects mismatched snapshot schema versions"
);


const mismatchedContractVersionStorageRecord =
  buildOceanMemoryStorageRecordFromRow({
    row: {
      ...validOceanSnapshotDatabaseRow,

      snapshot_contract_version:
        "pelora-test-mismatched-contract-version"
    }
  });

assert.equal(
  mismatchedContractVersionStorageRecord.available,
  false
);

assert.equal(
  mismatchedContractVersionStorageRecord
    .integrity
    .snapshotContractVersionConsistent,
  false
);

assert.ok(
  mismatchedContractVersionStorageRecord
    .missingRequirements
    .includes(
      "snapshot-contract-version-consistency"
    )
);

console.log(
  "PASS Ocean Memory Storage Row Adapter rejects mismatched snapshot contract versions"
);


const mismatchedObservedAtStorageRecord =
  buildOceanMemoryStorageRecordFromRow({
    row: {
      ...validOceanSnapshotDatabaseRow,

      observed_at:
        "2026-08-05T00:00:00.000Z"
    }
  });

assert.equal(
  mismatchedObservedAtStorageRecord.available,
  false
);

assert.equal(
  mismatchedObservedAtStorageRecord
    .integrity
    .observedAtConsistent,
  false
);

assert.ok(
  mismatchedObservedAtStorageRecord
    .missingRequirements
    .includes(
      "snapshot-observed-at-consistency"
    )
);

console.log(
  "PASS Ocean Memory Storage Row Adapter rejects mismatched observation timestamps"
);


const historicalQueryWithAdaptedStorageRecord =
  buildHistoricalSnapshotQuery({
    historicalSnapshots: [
      adaptedOceanMemoryStorageRecord
    ],

    observedAfter:
      governedOceanSnapshot
        .metadata
        .time
        .observedAt,

    observedBefore:
      governedOceanSnapshot
        .metadata
        .time
        .observedAt,

    snapshotSchemaVersion:
      governedOceanSnapshot
        .identity
        .snapshotSchemaVersion
  });

assert.equal(
  historicalQueryWithAdaptedStorageRecord
    .available,
  true
);

assert.equal(
  historicalQueryWithAdaptedStorageRecord
    .summary
    .inputRecordCount,
  1
);

assert.equal(
  historicalQueryWithAdaptedStorageRecord
    .summary
    .validGovernedRecordCount,
  1
);

assert.equal(
  historicalQueryWithAdaptedStorageRecord
    .summary
    .returnedRecordCount,
  1
);

assert.equal(
  historicalQueryWithAdaptedStorageRecord
    .historicalSnapshots[0]
    .identity
    .snapshotId,
  governedOceanSnapshot
    .identity
    .snapshotId
);

assert.equal(
  historicalQueryWithAdaptedStorageRecord
    .historicalSnapshots[0]
    .storage
    .storageProvider,
  "supabase-ocean-snapshots"
);

console.log(
  "PASS Historical Snapshot Query accepts governed records produced by the Supabase row adapter"
);


assert.ok(
  adaptedOceanMemoryStorageRecord
    .limitations
    .includes(
      "This contract does not query a database, authorize access, compare snapshots, calculate persistence, infer trends, perform opportunity or species reasoning, or generate captain guidance."
    )
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .persistence,
  undefined
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .trend,
  undefined
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .opportunity,
  undefined
);

assert.equal(
  adaptedOceanMemoryStorageRecord
    .species,
  undefined
);

console.log(
  "PASS Ocean Memory Storage Row Adapter remains preservation-only and excludes scientific reasoning"
);


/**
 * ------------------------------------------------------------
 * Ocean Snapshot Retrieval Contract v1.0
 * ------------------------------------------------------------
 */

const oceanSnapshotRetrievedAt =
  "2026-08-02T21:10:00.000Z";

const governedOceanSnapshotRetrieval =
  buildOceanSnapshotRetrieval({
    storageRecord:
      governedOceanMemoryRecord,

    requestedSnapshotId:
      governedOceanMemoryRecord
        .identity
        .snapshotId,

    retrievedAt:
      oceanSnapshotRetrievedAt
  });

assert.equal(
  governedOceanSnapshotRetrieval.available,
  true
);

assert.equal(
  governedOceanSnapshotRetrieval.retrievalType,
  "ocean-snapshot-retrieval"
);

assert.equal(
  governedOceanSnapshotRetrieval.responsibility,
  "preserve"
);

assert.equal(
  governedOceanSnapshotRetrieval
    .request
    .requestedSnapshotId,
  governedOceanMemoryRecord
    .identity
    .snapshotId
);

assert.equal(
  governedOceanSnapshotRetrieval
    .request
    .retrievedAt,
  oceanSnapshotRetrievedAt
);

assert.equal(
  governedOceanSnapshotRetrieval
    .identity
    .snapshotId,
  governedOceanMemoryRecord
    .identity
    .snapshotId
);

assert.equal(
  governedOceanSnapshotRetrieval
    .provenance
    .storageProvider,
  "pelora-test-memory"
);

assert.equal(
  governedOceanSnapshotRetrieval
    .provenance
    .storedAt,
  oceanMemoryStoredAt
);

assert.equal(
  governedOceanSnapshotRetrieval
    .provenance
    .storageContractVersion,
  "pelora-ocean-memory-storage-v1"
);

assert.equal(
  governedOceanSnapshotRetrieval
    .provenance
    .oceanSnapshotContractVersion,
  "pelora-ocean-snapshot-assembly-v1"
);

assert.equal(
  governedOceanSnapshotRetrieval
    .contractVersion,
  "pelora-ocean-snapshot-retrieval-v1"
);

assert.equal(
  Object.isFrozen(
    governedOceanSnapshotRetrieval
  ),
  true
);

assert.equal(
  Object.isFrozen(
    governedOceanSnapshotRetrieval.snapshot
  ),
  true
);

console.log(
  "PASS Ocean Snapshot Retrieval returns and freezes the requested governed snapshot"
);


const mutableStorageRecordSource =
  JSON.parse(
    JSON.stringify(
      governedOceanMemoryRecord
    )
  );

const isolatedOceanSnapshotRetrieval =
  buildOceanSnapshotRetrieval({
    storageRecord:
      mutableStorageRecordSource,

    requestedSnapshotId:
      mutableStorageRecordSource
        .identity
        .snapshotId,

    retrievedAt:
      oceanSnapshotRetrievedAt
  });

mutableStorageRecordSource
  .snapshot
  .metadata
  .time
  .observedAt =
  "2099-01-01T00:00:00.000Z";

assert.equal(
  isolatedOceanSnapshotRetrieval
    .snapshot
    .metadata
    .time
    .observedAt,
  assemblySnapshotMetadata
    .time
    .observedAt
);

console.log(
  "PASS Ocean Snapshot Retrieval remains isolated from later storage-record mutation"
);


const mismatchedOceanSnapshotRetrieval =
  buildOceanSnapshotRetrieval({
    storageRecord:
      governedOceanMemoryRecord,

    requestedSnapshotId:
      "pelora-snapshot-does-not-match",

    retrievedAt:
      oceanSnapshotRetrievedAt
  });

assert.equal(
  mismatchedOceanSnapshotRetrieval.available,
  false
);

assert.equal(
  mismatchedOceanSnapshotRetrieval.snapshot,
  null
);

assert.ok(
  mismatchedOceanSnapshotRetrieval
    .missingRequirements
    .includes(
      "snapshot-id-match"
    )
);

console.log(
  "PASS Ocean Snapshot Retrieval rejects a mismatched snapshot identifier"
);


const unavailableOceanSnapshotRetrieval =
  buildOceanSnapshotRetrieval();

assert.equal(
  unavailableOceanSnapshotRetrieval.available,
  false
);

assert.equal(
  unavailableOceanSnapshotRetrieval.snapshot,
  null
);

assert.ok(
  unavailableOceanSnapshotRetrieval
    .missingRequirements
    .includes(
      "governed-storage-record"
    )
);

assert.ok(
  unavailableOceanSnapshotRetrieval
    .missingRequirements
    .includes(
      "requested-snapshot-id"
    )
);

assert.ok(
  unavailableOceanSnapshotRetrieval
    .missingRequirements
    .includes(
      "retrieved-at"
    )
);

console.log(
  "PASS Ocean Snapshot Retrieval discloses missing retrieval inputs"
);


assert.equal(
  Object.hasOwn(
    governedOceanSnapshotRetrieval,
    "comparison"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedOceanSnapshotRetrieval,
    "persistence"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedOceanSnapshotRetrieval,
    "trend"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedOceanSnapshotRetrieval,
    "species"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedOceanSnapshotRetrieval,
    "captainNarrative"
  ),
  false
);

console.log(
  "PASS Ocean Snapshot Retrieval excludes comparison, persistence, trend, species reasoning, and guidance"
);


/**
 * ------------------------------------------------------------
 * Historical Snapshot Backfill Contract v1.0
 * ------------------------------------------------------------
 */

const historicalBackfillObservationSnapshot = {
  ...metadataObservationSnapshot,

  observedAt:
    "2026-06-15T11:00:00.000Z",

  generatedAt:
    "2026-08-02T20:05:00.000Z"
};

const historicalBackfillIntelligenceSnapshot = {
  ...metadataIntelligenceSnapshot,

  observedAt:
    "2026-06-15T11:00:00.000Z",

  generatedAt:
    "2026-08-02T20:05:00.000Z"
};

const historicalBackfillStoredAt =
  "2026-08-02T20:10:00.000Z";

const governedHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      historicalBackfillObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      historicalBackfillStoredAt,

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-test-location"
  });

assert.equal(
  governedHistoricalBackfill.available,
  true
);

assert.equal(
  governedHistoricalBackfill.backfillType,
  "historical-ocean-snapshot"
);

assert.equal(
  governedHistoricalBackfill.responsibility,
  "preserve"
);

assert.equal(
  governedHistoricalBackfill
    .time
    .observedAt,
  historicalBackfillObservationSnapshot
    .observedAt
);

assert.equal(
  governedHistoricalBackfill
    .time
    .generatedAt,
  historicalBackfillObservationSnapshot
    .generatedAt
);

assert.equal(
  governedHistoricalBackfill
    .time
    .storedAt,
  historicalBackfillStoredAt
);

assert.equal(
  governedHistoricalBackfill
    .time
    .historicalTimeOrderValid,
  true
);

assert.equal(
  governedHistoricalBackfill
    .provenance
    .captureMode,
  "historical-backfill"
);

assert.equal(
  governedHistoricalBackfill
    .provenance
    .sourceType,
  "archived-observation"
);

assert.equal(
  governedHistoricalBackfill
    .provenance
    .historicalBackfill,
  true
);

assert.equal(
  governedHistoricalBackfill
    .provenance
    .reconstructionStatus,
  "completed"
);

assert.equal(
  governedHistoricalBackfill
    .provenance
    .storageProvider,
  "pelora-test-historical-memory"
);

assert.equal(
  governedHistoricalBackfill
    .governedVersions
    .snapshotMetadata,
  "pelora-snapshot-metadata-v1"
);

assert.equal(
  governedHistoricalBackfill
    .governedVersions
    .oceanSnapshot,
  "pelora-ocean-snapshot-assembly-v1"
);

assert.equal(
  governedHistoricalBackfill
    .governedVersions
    .oceanMemoryStorage,
  "pelora-ocean-memory-storage-v1"
);

assert.equal(
  governedHistoricalBackfill
    .contractVersion,
  "pelora-historical-snapshot-backfill-v1"
);

assert.equal(
  Object.isFrozen(
    governedHistoricalBackfill
  ),
  true
);

assert.equal(
  Object.isFrozen(
    governedHistoricalBackfill
      .storageRecord
  ),
  true
);

console.log(
  "PASS Historical Snapshot Backfill creates and freezes a governed historical record"
);


const invalidTimeHistoricalObservation =
  JSON.parse(
    JSON.stringify(
      historicalBackfillObservationSnapshot
    )
  );

invalidTimeHistoricalObservation
  .generatedAt =
  "2025-01-01T00:00:00.000Z";

const invalidTimeHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      invalidTimeHistoricalObservation,

    intelligenceSnapshot:
      metadataIntelligenceSnapshot,

    storedAt:
      historicalBackfillStoredAt,

    storageProvider:
      "pelora-test-historical-memory"
  });

assert.equal(
  invalidTimeHistoricalBackfill.available,
  false
);

assert.equal(
  invalidTimeHistoricalBackfill
    .time
    .historicalTimeOrderValid,
  false
);

assert.equal(
  invalidTimeHistoricalBackfill
    .provenance
    .reconstructionStatus,
  "invalid-time-order"
);

assert.equal(
  invalidTimeHistoricalBackfill
    .storageRecord,
  null
);

assert.ok(
  invalidTimeHistoricalBackfill
    .missingRequirements
    .includes(
      "generated-at-not-before-observed-at"
    )
);

console.log(
  "PASS Historical Snapshot Backfill rejects invalid historical time order"
);


const unavailableHistoricalBackfill =
  buildHistoricalSnapshotBackfill();

assert.equal(
  unavailableHistoricalBackfill.available,
  false
);

assert.equal(
  unavailableHistoricalBackfill
    .oceanSnapshot,
  null
);

assert.equal(
  unavailableHistoricalBackfill
    .storageRecord,
  null
);

assert.ok(
  unavailableHistoricalBackfill
    .missingRequirements
    .includes(
      "archived-observation-snapshot"
    )
);

assert.ok(
  unavailableHistoricalBackfill
    .missingRequirements
    .includes(
      "valid-historical-observed-at"
    )
);

assert.ok(
  unavailableHistoricalBackfill
    .missingRequirements
    .includes(
      "valid-backfill-generated-at"
    )
);

console.log(
  "PASS Historical Snapshot Backfill discloses missing historical inputs"
);


assert.equal(
  Object.hasOwn(
    governedHistoricalBackfill,
    "comparison"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedHistoricalBackfill,
    "persistence"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedHistoricalBackfill,
    "trend"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedHistoricalBackfill,
    "species"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    governedHistoricalBackfill,
    "captainNarrative"
  ),
  false
);

console.log(
  "PASS Historical Snapshot Backfill excludes comparison, persistence, trend, species reasoning, and guidance"
);

/**
 * ------------------------------------------------------------
 * Persistence Evidence Contract v2.0
 * ------------------------------------------------------------
 */

const persistenceNoHistory =
  buildPersistenceEvidence();

assert.equal(
  persistenceNoHistory.available,
  false
);

assert.equal(
  persistenceNoHistory.classification,
  "unavailable"
);

assert.equal(
  persistenceNoHistory.reason,
  "persistence-analysis-not-yet-implemented"
);

assert.equal(
  persistenceNoHistory
    .values
    .sampleCount,
  null
);

assert.equal(
  persistenceNoHistory
    .contractVersion,
  "pelora-persistence-evidence-v2"
);

console.log(
  "PASS Persistence Evidence v2 preserves the original no-history fallback"
);


const persistenceSingleSnapshot =
  buildPersistenceEvidence({
    historicalSnapshots: [
      governedHistoricalBackfill
    ]
  });

assert.equal(
  persistenceSingleSnapshot.available,
  false
);

assert.equal(
  persistenceSingleSnapshot.classification,
  "insufficient-history"
);

assert.equal(
  persistenceSingleSnapshot.reason,
  "insufficient-chronological-history"
);

assert.equal(
  persistenceSingleSnapshot
    .values
    .sampleCount,
  1
);

assert.equal(
  persistenceSingleSnapshot
    .values
    .firstObservedAt,
  historicalBackfillObservationSnapshot
    .observedAt
);

assert.equal(
  persistenceSingleSnapshot
    .values
    .lastObservedAt,
  historicalBackfillObservationSnapshot
    .observedAt
);

assert.ok(
  persistenceSingleSnapshot
    .limitations
    .includes(
      "minimum-two-chronological-snapshots-required"
    )
);

console.log(
  "PASS Persistence Evidence v2 requires more than one governed historical snapshot"
);


const persistenceDuplicateSnapshots =
  buildPersistenceEvidence({
    historicalSnapshots: [
      governedHistoricalBackfill,
      governedHistoricalBackfill
    ]
  });

assert.equal(
  persistenceDuplicateSnapshots.available,
  false
);

assert.equal(
  persistenceDuplicateSnapshots.classification,
  "insufficient-history"
);

assert.equal(
  persistenceDuplicateSnapshots
    .values
    .sampleCount,
  1
);

console.log(
  "PASS Persistence Evidence v2 deduplicates repeated snapshot identifiers"
);


const laterHistoricalObservationSnapshot = {
  ...historicalBackfillObservationSnapshot,

  observedAt:
    "2026-06-16T11:00:00.000Z",

  generatedAt:
    "2026-08-02T20:06:00.000Z"
};

const laterHistoricalIntelligenceSnapshot = {
  ...historicalBackfillIntelligenceSnapshot,

  observedAt:
    "2026-06-16T11:00:00.000Z",

  generatedAt:
    "2026-08-02T20:06:00.000Z"
};



/**
 * ------------------------------------------------------------
 * Historical Snapshot Query Layer v1.0
 * ------------------------------------------------------------
 */

const historicalSnapshotQueryNoRecords =
  buildHistoricalSnapshotQuery();

assert.equal(
  historicalSnapshotQueryNoRecords.available,
  false
);

assert.equal(
  historicalSnapshotQueryNoRecords
    .queryType,
  "historical-snapshot-query"
);

assert.equal(
  historicalSnapshotQueryNoRecords
    .responsibility,
  "preserve"
);

assert.equal(
  historicalSnapshotQueryNoRecords
    .summary
    .inputRecordCount,
  0
);

assert.equal(
  historicalSnapshotQueryNoRecords
    .summary
    .returnedRecordCount,
  0
);

assert.deepEqual(
  historicalSnapshotQueryNoRecords
    .historicalSnapshots,
  []
);

assert.equal(
  historicalSnapshotQueryNoRecords
    .contractVersion,
  "pelora-historical-snapshot-query-v1"
);

console.log(
  "PASS Historical Snapshot Query v1 remains unavailable without supplied records"
);


const historicalQueryEarlierObservationSnapshot = {
  ...historicalBackfillObservationSnapshot,

  observedAt:
    "2026-06-14T11:00:00.000Z"
};


const historicalQueryEarlierIntelligenceSnapshot = {
  ...historicalBackfillIntelligenceSnapshot,

  observedAt:
    "2026-06-14T11:00:00.000Z"
};


const historicalQueryMiddleObservationSnapshot = {
  ...historicalBackfillObservationSnapshot,

  observedAt:
    "2026-06-15T11:00:00.000Z"
};


const historicalQueryOtherLocationObservationSnapshot = {
  ...historicalBackfillObservationSnapshot,

  observedAt:
    "2026-06-15T12:00:00.000Z",

  location: {
    ...historicalBackfillObservationSnapshot
      .location,

    latitude:
      28.75,

    longitude:
      -88.25,

    name:
      "Historical Query Location B"
  }
};


const historicalQueryOtherLocationIntelligenceSnapshot = {
  ...historicalBackfillIntelligenceSnapshot,

  observedAt:
    "2026-06-15T12:00:00.000Z"
};


const historicalQueryLaterObservationSnapshot = {
  ...laterHistoricalObservationSnapshot,

  observedAt:
    "2026-06-16T11:00:00.000Z"
};


const historicalQueryEarlierBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      historicalQueryEarlierObservationSnapshot,

    intelligenceSnapshot:
      historicalQueryEarlierIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-query-location-a"
  });


const historicalQueryMiddleBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      historicalQueryMiddleObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-query-location-a"
  });


const historicalQueryLaterBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      historicalQueryLaterObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:12:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-query-location-a"
  });


const historicalQueryOtherLocationBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      historicalQueryOtherLocationObservationSnapshot,

    intelligenceSnapshot:
      historicalQueryOtherLocationIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:13:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "Mississippi Canyon",

    locationId:
      "historical-query-location-b"
  });


const historicalQueryInvalidRecord = {
  available:
    false,

  snapshot:
    null
};


const historicalSnapshotQueryRejectsInvalid =
  buildHistoricalSnapshotQuery({
    historicalSnapshots: [
      historicalQueryInvalidRecord
    ]
  });

assert.equal(
  historicalSnapshotQueryRejectsInvalid.available,
  false
);

assert.equal(
  historicalSnapshotQueryRejectsInvalid
    .summary
    .inputRecordCount,
  1
);

assert.equal(
  historicalSnapshotQueryRejectsInvalid
    .summary
    .validGovernedRecordCount,
  0
);

assert.equal(
  historicalSnapshotQueryRejectsInvalid
    .summary
    .rejectedRecordCount,
  1
);

assert.equal(
  historicalSnapshotQueryRejectsInvalid
    .summary
    .returnedRecordCount,
  0
);

console.log(
  "PASS Historical Snapshot Query v1 rejects invalid storage records"
);


const historicalSnapshotQueryByLocation =
  buildHistoricalSnapshotQuery({
    historicalSnapshots: [
      historicalQueryOtherLocationBackfill,
      historicalQueryLaterBackfill,
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill
    ],

    location: {
      locationId:
        "historical-query-location-a"
    }
  });

assert.equal(
  historicalSnapshotQueryByLocation.available,
  true
);

assert.equal(
  historicalSnapshotQueryByLocation
    .query
    .locationId,
  "historical-query-location-a"
);

assert.equal(
  historicalSnapshotQueryByLocation
    .summary
    .inputRecordCount,
  4
);

assert.equal(
  historicalSnapshotQueryByLocation
    .summary
    .locationExcludedCount,
  1
);

assert.equal(
  historicalSnapshotQueryByLocation
    .summary
    .returnedRecordCount,
  3
);

assert.equal(
  historicalSnapshotQueryByLocation
    .summary
    .firstObservedAt,
  "2026-06-14T11:00:00.000Z"
);

assert.equal(
  historicalSnapshotQueryByLocation
    .summary
    .lastObservedAt,
  "2026-06-16T11:00:00.000Z"
);

console.log(
  "PASS Historical Snapshot Query v1 filters governed history by location ID"
);


const historicalSnapshotQueryByTime =
  buildHistoricalSnapshotQuery({
    historicalSnapshots: [
      historicalQueryLaterBackfill,
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill
    ],

    observedAfter:
      "2026-06-15T00:00:00.000Z",

    observedBefore:
      "2026-06-15T23:59:59.999Z"
  });

assert.equal(
  historicalSnapshotQueryByTime.available,
  true
);

assert.equal(
  historicalSnapshotQueryByTime
    .summary
    .timeExcludedCount,
  2
);

assert.equal(
  historicalSnapshotQueryByTime
    .summary
    .returnedRecordCount,
  1
);

assert.equal(
  historicalSnapshotQueryByTime
    .summary
    .firstObservedAt,
  "2026-06-15T11:00:00.000Z"
);

assert.equal(
  historicalSnapshotQueryByTime
    .summary
    .lastObservedAt,
  "2026-06-15T11:00:00.000Z"
);

console.log(
  "PASS Historical Snapshot Query v1 filters governed history by observed-time window"
);


const historicalQuerySchemaVersion =
  historicalQueryEarlierBackfill
    ?.storageRecord
    ?.identity
    ?.snapshotSchemaVersion ??
  historicalQueryEarlierBackfill
    ?.storageRecord
    ?.snapshot
    ?.identity
    ?.snapshotSchemaVersion ??
  null;


assert.equal(
  typeof historicalQuerySchemaVersion,
  "string"
);


const historicalQueryMismatchedSchemaRecord = {
  ...historicalQueryMiddleBackfill
    .storageRecord,

  identity: {
    ...historicalQueryMiddleBackfill
      .storageRecord
      .identity,

    snapshotSchemaVersion:
      "pelora-ocean-snapshot-schema-test-mismatch"
  },

  snapshot: {
    ...historicalQueryMiddleBackfill
      .storageRecord
      .snapshot,

    identity: {
      ...historicalQueryMiddleBackfill
        .storageRecord
        .snapshot
        .identity,

      snapshotSchemaVersion:
        "pelora-ocean-snapshot-schema-test-mismatch"
    }
  }
};


const historicalSnapshotQueryBySchema =
  buildHistoricalSnapshotQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill,
      historicalQueryMismatchedSchemaRecord
    ],

    snapshotSchemaVersion:
      historicalQuerySchemaVersion
  });

assert.equal(
  historicalSnapshotQueryBySchema.available,
  true
);

assert.equal(
  historicalSnapshotQueryBySchema
    .summary
    .schemaExcludedCount,
  1
);

assert.equal(
  historicalSnapshotQueryBySchema
    .summary
    .returnedRecordCount,
  1
);

assert.equal(
  historicalSnapshotQueryBySchema
    .historicalSnapshots[0]
    .identity
    .snapshotSchemaVersion,
  historicalQuerySchemaVersion
);

console.log(
  "PASS Historical Snapshot Query v1 filters governed history by snapshot schema version"
);


const historicalSnapshotQueryDeduplicated =
  buildHistoricalSnapshotQuery({
    historicalSnapshots: [
      historicalQueryLaterBackfill,
      historicalQueryEarlierBackfill,
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill
    ]
  });

assert.equal(
  historicalSnapshotQueryDeduplicated.available,
  true
);

assert.equal(
  historicalSnapshotQueryDeduplicated
    .summary
    .duplicateRecordCount,
  1
);

assert.equal(
  historicalSnapshotQueryDeduplicated
    .summary
    .matchingRecordCount,
  3
);

assert.equal(
  historicalSnapshotQueryDeduplicated
    .summary
    .returnedRecordCount,
  3
);

console.log(
  "PASS Historical Snapshot Query v1 deduplicates repeated snapshot identifiers"
);


const historicalSnapshotQueryChronological =
  buildHistoricalSnapshotQuery({
    historicalSnapshots: [
      historicalQueryLaterBackfill,
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill
    ]
  });

assert.equal(
  historicalSnapshotQueryChronological
    .historicalSnapshots[0]
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-14T11:00:00.000Z"
);

assert.equal(
  historicalSnapshotQueryChronological
    .historicalSnapshots[1]
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-15T11:00:00.000Z"
);

assert.equal(
  historicalSnapshotQueryChronological
    .historicalSnapshots[2]
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-16T11:00:00.000Z"
);

console.log(
  "PASS Historical Snapshot Query v1 sorts governed results chronologically"
);


const historicalSnapshotQueryLimited =
  buildHistoricalSnapshotQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryLaterBackfill
    ],

    maximumSnapshots:
      2
  });

assert.equal(
  historicalSnapshotQueryLimited.available,
  true
);

assert.equal(
  historicalSnapshotQueryLimited
    .summary
    .matchingRecordCount,
  3
);

assert.equal(
  historicalSnapshotQueryLimited
    .summary
    .returnedRecordCount,
  2
);

assert.equal(
  historicalSnapshotQueryLimited
    .summary
    .resultLimitApplied,
  true
);

assert.equal(
  historicalSnapshotQueryLimited
    .historicalSnapshots[0]
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-15T11:00:00.000Z"
);

assert.equal(
  historicalSnapshotQueryLimited
    .historicalSnapshots[1]
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-16T11:00:00.000Z"
);

console.log(
  "PASS Historical Snapshot Query v1 returns the most recent requested snapshot limit"
);


assert.equal(
  Object.isFrozen(
    historicalSnapshotQueryChronological
  ),
  true
);

assert.equal(
  Object.isFrozen(
    historicalSnapshotQueryChronological
      .historicalSnapshots
  ),
  true
);

assert.equal(
  Object.isFrozen(
    historicalSnapshotQueryChronological
      .historicalSnapshots[0]
  ),
  true
);

assert.ok(
  historicalSnapshotQueryChronological
    .limitations
    .includes(
      "This contract does not compare snapshots, calculate persistence, infer trends, alter scientific contracts, perform opportunity or species reasoning, or generate captain guidance."
    )
);

assert.equal(
  historicalSnapshotQueryChronological
    .persistence,
  undefined
);

assert.equal(
  historicalSnapshotQueryChronological
    .trend,
  undefined
);

assert.equal(
  historicalSnapshotQueryChronological
    .opportunity,
  undefined
);

assert.equal(
  historicalSnapshotQueryChronological
    .species,
  undefined
);

console.log(
  "PASS Historical Snapshot Query v1 remains frozen and excludes scientific reasoning"
);


/**
 * ------------------------------------------------------------
 * Historical Snapshot Query Radius Filtering v1.0
 * ------------------------------------------------------------
 */

const historicalSnapshotQueryWithoutRadius =
  buildHistoricalSnapshotQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryLaterBackfill
    ]
  });


assert.equal(
  historicalSnapshotQueryWithoutRadius
    .query
    .radiusFilterApplied,
  false
);

assert.equal(
  historicalSnapshotQueryWithoutRadius
    .summary
    .radiusExcludedCount,
  0
);

assert.equal(
  historicalSnapshotQueryWithoutRadius
    .summary
    .returnedRecordCount,
  3
);

console.log(
  "PASS Historical Snapshot Query preserves established behavior when no radius is requested"
);


const historicalSnapshotQueryByRadius =
  buildHistoricalSnapshotQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryLaterBackfill,
      historicalQueryOtherLocationBackfill
    ],

    location: {
      latitude:
        29.5,

      longitude:
        -87.2
    },

    radiusKm:
      25
  });


assert.equal(
  historicalSnapshotQueryByRadius.available,
  true
);

assert.equal(
  historicalSnapshotQueryByRadius
    .query
    .radiusFilterApplied,
  true
);

assert.equal(
  historicalSnapshotQueryByRadius
    .query
    .centerLatitude,
  29.5
);

assert.equal(
  historicalSnapshotQueryByRadius
    .query
    .centerLongitude,
  -87.2
);

assert.equal(
  historicalSnapshotQueryByRadius
    .summary
    .radiusExcludedCount,
  1
);

assert.equal(
  historicalSnapshotQueryByRadius
    .summary
    .returnedRecordCount,
  3
);

assert.ok(
  historicalSnapshotQueryByRadius
    .historicalSnapshots
    .every(record =>
      record
        ?.snapshot
        ?.metadata
        ?.location
        ?.locationId ===
      "historical-query-location-a"
    )
);

console.log(
  "PASS Historical Snapshot Query applies governed geographic-radius filtering"
);


const historicalSnapshotQueryRadiusWithoutCenter =
  buildHistoricalSnapshotQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryLaterBackfill
    ],

    radiusKm:
      25
  });


assert.equal(
  historicalSnapshotQueryRadiusWithoutCenter
    .query
    .radiusFilterApplied,
  false
);

assert.equal(
  historicalSnapshotQueryRadiusWithoutCenter
    .summary
    .radiusExcludedCount,
  0
);

assert.ok(
  historicalSnapshotQueryRadiusWithoutCenter
    .limitations
    .includes(
      "geographic-radius-filter-requires-valid-center-coordinates"
    )
);

console.log(
  "PASS Historical Snapshot Query discloses an unapplied radius without valid center coordinates"
);


const historicalSnapshotQueryExactRadiusBoundary =
  buildHistoricalSnapshotQuery({
    historicalSnapshots: [
      historicalQueryOtherLocationBackfill
    ],

    location: {
      latitude:
        29.5,

      longitude:
        -87.2
    },

    radiusKm:
      kilometersBetween(
        29.5,
        -87.2,
        28.75,
        -88.25
      )
  });


assert.equal(
  historicalSnapshotQueryExactRadiusBoundary.available,
  true
);

assert.equal(
  historicalSnapshotQueryExactRadiusBoundary
    .summary
    .radiusExcludedCount,
  0
);

assert.equal(
  historicalSnapshotQueryExactRadiusBoundary
    .summary
    .returnedRecordCount,
  1
);

console.log(
  "PASS Historical Snapshot Query includes snapshots exactly on the radius boundary"
);

const laterHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterHistoricalObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-test-location"
  });


  /**
 * ------------------------------------------------------------
 * Latest Ocean Snapshot Query v1.0
 * ------------------------------------------------------------
 */

const unavailableLatestOceanSnapshotQuery =
  buildLatestOceanSnapshotQuery({
    historicalSnapshots: []
  });


assert.equal(
  unavailableLatestOceanSnapshotQuery.available,
  false
);

assert.equal(
  unavailableLatestOceanSnapshotQuery
    .queryType,
  "latest-ocean-snapshot"
);

assert.equal(
  unavailableLatestOceanSnapshotQuery
    .responsibility,
  "preserve"
);

assert.equal(
  unavailableLatestOceanSnapshotQuery
    .latestSnapshot,
  null
);

assert.equal(
  unavailableLatestOceanSnapshotQuery
    .historicalSnapshot,
  null
);

assert.equal(
  unavailableLatestOceanSnapshotQuery
    .snapshot,
  null
);

assert.ok(
  unavailableLatestOceanSnapshotQuery
    .missingRequirements
    .includes(
      "latest-governed-ocean-snapshot"
    )
);

console.log(
  "PASS Latest Ocean Snapshot Query remains unavailable without governed history"
);


const latestOceanSnapshotQuery =
  buildLatestOceanSnapshotQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill
        .storageRecord,

      governedHistoricalBackfill
        .storageRecord,

      laterHistoricalBackfill
        .storageRecord
    ]
  });


assert.equal(
  latestOceanSnapshotQuery.available,
  true
);

assert.equal(
  latestOceanSnapshotQuery
    .sourceQuery
    .available,
  true
);

assert.equal(
  latestOceanSnapshotQuery
    .sourceQuery
    .returnedRecordCount,
  1
);

assert.equal(
  latestOceanSnapshotQuery
    .latestSnapshot
    .identity
    .snapshotId,
  laterHistoricalBackfill
    .storageRecord
    .identity
    .snapshotId
);

assert.equal(
  latestOceanSnapshotQuery
    .latestSnapshot
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-16T11:00:00.000Z"
);

assert.deepEqual(
  latestOceanSnapshotQuery
    .historicalSnapshot,
  latestOceanSnapshotQuery
    .latestSnapshot
);

assert.deepEqual(
  latestOceanSnapshotQuery
    .snapshot,
  latestOceanSnapshotQuery
    .latestSnapshot
);

console.log(
  "PASS Latest Ocean Snapshot Query returns the newest governed record"
);


const latestOceanSnapshotByLocation =
  buildLatestOceanSnapshotQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill
        .storageRecord,

      governedHistoricalBackfill
        .storageRecord,

      laterHistoricalBackfill
        .storageRecord,

      historicalQueryOtherLocationBackfill
        .storageRecord
    ],

    location:
      governedHistoricalBackfill
        .provenance
        .locationId
  });


assert.equal(
  latestOceanSnapshotByLocation.available,
  true
);

assert.equal(
  latestOceanSnapshotByLocation
    .latestSnapshot
    .identity
    .snapshotId,
  laterHistoricalBackfill
    .storageRecord
    .identity
    .snapshotId
);

assert.notEqual(
  latestOceanSnapshotByLocation
    .latestSnapshot
    .identity
    .snapshotId,
  historicalQueryOtherLocationBackfill
    .storageRecord
    .identity
    .snapshotId
);

console.log(
  "PASS Latest Ocean Snapshot Query preserves governed location filtering"
);


const latestOceanSnapshotByWindow =
  buildLatestOceanSnapshotQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill
        .storageRecord,

      governedHistoricalBackfill
        .storageRecord,

      laterHistoricalBackfill
        .storageRecord
    ],

    observedAfter:
      "2026-06-14T00:00:00.000Z",

    observedBefore:
      "2026-06-15T23:59:59.999Z"
  });


assert.equal(
  latestOceanSnapshotByWindow.available,
  true
);

assert.equal(
  latestOceanSnapshotByWindow
    .latestSnapshot
    .identity
    .snapshotId,
  governedHistoricalBackfill
    .storageRecord
    .identity
    .snapshotId
);

assert.equal(
  latestOceanSnapshotByWindow
    .sourceQuery
    .lastObservedAt,
  "2026-06-15T11:00:00.000Z"
);

console.log(
  "PASS Latest Ocean Snapshot Query preserves governed observation-window filtering"
);


const latestOceanSnapshotBySchema =
  buildLatestOceanSnapshotQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill
        .storageRecord,

      governedHistoricalBackfill
        .storageRecord,

      laterHistoricalBackfill
        .storageRecord
    ],

    snapshotSchemaVersion:
      governedHistoricalBackfill
        .storageRecord
        .identity
        .snapshotSchemaVersion
  });


assert.equal(
  latestOceanSnapshotBySchema.available,
  true
);

assert.equal(
  latestOceanSnapshotBySchema
    .latestSnapshot
    .identity
    .snapshotSchemaVersion,
  governedHistoricalBackfill
    .storageRecord
    .identity
    .snapshotSchemaVersion
);

assert.equal(
  latestOceanSnapshotBySchema
    .sourceQuery
    .contractVersion,
  "pelora-historical-snapshot-query-v1"
);

console.log(
  "PASS Latest Ocean Snapshot Query preserves governed schema filtering and source-query provenance"
);


assert.equal(
  Object.isFrozen(
    latestOceanSnapshotQuery
  ),
  true
);

assert.equal(
  Object.isFrozen(
    latestOceanSnapshotQuery
      .latestSnapshot
  ),
  true
);

assert.equal(
  Object.isFrozen(
    latestOceanSnapshotQuery
      .sourceQuery
  ),
  true
);

assert.ok(
  latestOceanSnapshotQuery
    .limitations
    .includes(
      "This contract does not normalize raw database rows, compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    )
);

assert.equal(
  latestOceanSnapshotQuery
    .comparison,
  undefined
);

assert.equal(
  latestOceanSnapshotQuery
    .persistence,
  undefined
);

assert.equal(
  latestOceanSnapshotQuery
    .trend,
  undefined
);

assert.equal(
  latestOceanSnapshotQuery
    .species,
  undefined
);

assert.equal(
  latestOceanSnapshotQuery
    .guidance,
  undefined
);

console.log(
  "PASS Latest Ocean Snapshot Query remains frozen, preservation-only, and scientifically neutral"
);


/**
 * ------------------------------------------------------------
 * Previous Ocean Snapshot Query v1.0
 * ------------------------------------------------------------
 */

const unavailablePreviousOceanSnapshotQuery =
  buildPreviousOceanSnapshotQuery({
    historicalSnapshots: []
  });


assert.equal(
  unavailablePreviousOceanSnapshotQuery.available,
  false
);

assert.equal(
  unavailablePreviousOceanSnapshotQuery
    .queryType,
  "previous-ocean-snapshot"
);

assert.equal(
  unavailablePreviousOceanSnapshotQuery
    .responsibility,
  "preserve"
);

assert.equal(
  unavailablePreviousOceanSnapshotQuery
    .previousSnapshot,
  null
);

assert.ok(
  unavailablePreviousOceanSnapshotQuery
    .missingRequirements
    .includes(
      "valid-before-observed-at"
    )
);

assert.ok(
  unavailablePreviousOceanSnapshotQuery
    .missingRequirements
    .includes(
      "previous-governed-ocean-snapshot"
    )
);

console.log(
  "PASS Previous Ocean Snapshot Query remains unavailable without a valid cutoff timestamp"
);


const noEarlierPreviousOceanSnapshotQuery =
  buildPreviousOceanSnapshotQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill
        .storageRecord,

      governedHistoricalBackfill
        .storageRecord,

      laterHistoricalBackfill
        .storageRecord
    ],

    beforeObservedAt:
      "2026-06-14T11:00:00.000Z"
  });


assert.equal(
  noEarlierPreviousOceanSnapshotQuery.available,
  false
);

assert.equal(
  noEarlierPreviousOceanSnapshotQuery
    .previousSnapshot,
  null
);

assert.ok(
  noEarlierPreviousOceanSnapshotQuery
    .missingRequirements
    .includes(
      "previous-governed-ocean-snapshot"
    )
);

console.log(
  "PASS Previous Ocean Snapshot Query remains unavailable when no earlier governed record exists"
);


const previousOceanSnapshotQuery =
  buildPreviousOceanSnapshotQuery({
    historicalSnapshots: [
      laterHistoricalBackfill
        .storageRecord,

      historicalQueryEarlierBackfill
        .storageRecord,

      governedHistoricalBackfill
        .storageRecord
    ],

    beforeObservedAt:
      "2026-06-16T11:00:00.000Z"
  });


assert.equal(
  previousOceanSnapshotQuery.available,
  true
);

assert.equal(
  previousOceanSnapshotQuery
    .previousSnapshot
    .identity
    .snapshotId,
  governedHistoricalBackfill
    .storageRecord
    .identity
    .snapshotId
);

assert.equal(
  previousOceanSnapshotQuery
    .previousSnapshot
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-15T11:00:00.000Z"
);

assert.deepEqual(
  previousOceanSnapshotQuery
    .historicalSnapshot,
  previousOceanSnapshotQuery
    .previousSnapshot
);

assert.deepEqual(
  previousOceanSnapshotQuery
    .snapshot,
  previousOceanSnapshotQuery
    .previousSnapshot
);

console.log(
  "PASS Previous Ocean Snapshot Query returns the nearest strictly earlier governed record"
);


const exactCutoffPreviousOceanSnapshotQuery =
  buildPreviousOceanSnapshotQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill
        .storageRecord,

      governedHistoricalBackfill
        .storageRecord,

      laterHistoricalBackfill
        .storageRecord
    ],

    beforeObservedAt:
      "2026-06-15T11:00:00.000Z"
  });


assert.equal(
  exactCutoffPreviousOceanSnapshotQuery.available,
  true
);

assert.equal(
  exactCutoffPreviousOceanSnapshotQuery
    .previousSnapshot
    .identity
    .snapshotId,
  historicalQueryEarlierBackfill
    .storageRecord
    .identity
    .snapshotId
);

assert.notEqual(
  exactCutoffPreviousOceanSnapshotQuery
    .previousSnapshot
    .identity
    .snapshotId,
  governedHistoricalBackfill
    .storageRecord
    .identity
    .snapshotId
);

console.log(
  "PASS Previous Ocean Snapshot Query never returns the snapshot observed exactly at the cutoff"
);


const previousOceanSnapshotByLocation =
  buildPreviousOceanSnapshotQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill
        .storageRecord,

      governedHistoricalBackfill
        .storageRecord,

      laterHistoricalBackfill
        .storageRecord,

      historicalQueryOtherLocationBackfill
        .storageRecord
    ],

    beforeObservedAt:
      "2026-06-17T00:00:00.000Z",

    location:
      governedHistoricalBackfill
        .provenance
        .locationId
  });


assert.equal(
  previousOceanSnapshotByLocation.available,
  true
);

assert.equal(
  previousOceanSnapshotByLocation
    .previousSnapshot
    .identity
    .snapshotId,
  laterHistoricalBackfill
    .storageRecord
    .identity
    .snapshotId
);

assert.notEqual(
  previousOceanSnapshotByLocation
    .previousSnapshot
    .identity
    .snapshotId,
  historicalQueryOtherLocationBackfill
    .storageRecord
    .identity
    .snapshotId
);

console.log(
  "PASS Previous Ocean Snapshot Query preserves governed location filtering"
);


const previousOceanSnapshotBySchema =
  buildPreviousOceanSnapshotQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill
        .storageRecord,

      governedHistoricalBackfill
        .storageRecord,

      laterHistoricalBackfill
        .storageRecord
    ],

    beforeObservedAt:
      "2026-06-17T00:00:00.000Z",

    snapshotSchemaVersion:
      governedHistoricalBackfill
        .storageRecord
        .identity
        .snapshotSchemaVersion
  });


assert.equal(
  previousOceanSnapshotBySchema.available,
  true
);

assert.equal(
  previousOceanSnapshotBySchema
    .previousSnapshot
    .identity
    .snapshotSchemaVersion,
  governedHistoricalBackfill
    .storageRecord
    .identity
    .snapshotSchemaVersion
);

assert.equal(
  previousOceanSnapshotBySchema
    .sourceQuery
    .contractVersion,
  "pelora-historical-snapshot-query-v1"
);

console.log(
  "PASS Previous Ocean Snapshot Query preserves governed schema filtering and source-query provenance"
);


assert.equal(
  Object.isFrozen(
    previousOceanSnapshotQuery
  ),
  true
);

assert.equal(
  Object.isFrozen(
    previousOceanSnapshotQuery
      .previousSnapshot
  ),
  true
);

assert.equal(
  Object.isFrozen(
    previousOceanSnapshotQuery
      .sourceQuery
  ),
  true
);

assert.ok(
  previousOceanSnapshotQuery
    .limitations
    .includes(
      "This contract does not normalize raw database rows, compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    )
);

assert.equal(
  previousOceanSnapshotQuery
    .comparison,
  undefined
);

assert.equal(
  previousOceanSnapshotQuery
    .persistence,
  undefined
);

assert.equal(
  previousOceanSnapshotQuery
    .trend,
  undefined
);

assert.equal(
  previousOceanSnapshotQuery
    .species,
  undefined
);

assert.equal(
  previousOceanSnapshotQuery
    .guidance,
  undefined
);

console.log(
  "PASS Previous Ocean Snapshot Query remains frozen, preservation-only, and scientifically neutral"
);


/**
 * ------------------------------------------------------------
 * Ocean Snapshot By ID Query v1.0
 * ------------------------------------------------------------
 */

const unavailableOceanSnapshotByIdQuery =
  buildOceanSnapshotByIdQuery({
    historicalSnapshots: []
  });


assert.equal(
  unavailableOceanSnapshotByIdQuery.available,
  false
);

assert.equal(
  unavailableOceanSnapshotByIdQuery
    .queryType,
  "ocean-snapshot-by-id"
);

assert.equal(
  unavailableOceanSnapshotByIdQuery
    .responsibility,
  "preserve"
);

assert.equal(
  unavailableOceanSnapshotByIdQuery
    .matchingSnapshot,
  null
);

assert.ok(
  unavailableOceanSnapshotByIdQuery
    .missingRequirements
    .includes(
      "valid-snapshot-id"
    )
);

assert.ok(
  unavailableOceanSnapshotByIdQuery
    .missingRequirements
    .includes(
      "matching-governed-ocean-snapshot"
    )
);

console.log(
  "PASS Ocean Snapshot By ID Query remains unavailable without a valid snapshot identifier"
);


const missingOceanSnapshotByIdQuery =
  buildOceanSnapshotByIdQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill
        .storageRecord,

      governedHistoricalBackfill
        .storageRecord,

      laterHistoricalBackfill
        .storageRecord
    ],

    snapshotId:
      "pelora-snapshot-does-not-exist"
  });


assert.equal(
  missingOceanSnapshotByIdQuery.available,
  false
);

assert.equal(
  missingOceanSnapshotByIdQuery
    .matchingSnapshot,
  null
);

assert.ok(
  missingOceanSnapshotByIdQuery
    .missingRequirements
    .includes(
      "matching-governed-ocean-snapshot"
    )
);

console.log(
  "PASS Ocean Snapshot By ID Query remains unavailable when no governed record matches"
);


const oceanSnapshotByIdQuery =
  buildOceanSnapshotByIdQuery({
    historicalSnapshots: [
      laterHistoricalBackfill
        .storageRecord,

      historicalQueryEarlierBackfill
        .storageRecord,

      governedHistoricalBackfill
        .storageRecord
    ],

    snapshotId:
      governedHistoricalBackfill
        .storageRecord
        .identity
        .snapshotId
  });


assert.equal(
  oceanSnapshotByIdQuery.available,
  true
);

assert.equal(
  oceanSnapshotByIdQuery
    .matchingSnapshot
    .identity
    .snapshotId,
  governedHistoricalBackfill
    .storageRecord
    .identity
    .snapshotId
);

assert.equal(
  oceanSnapshotByIdQuery
    .matchingSnapshot
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-15T11:00:00.000Z"
);

assert.deepEqual(
  oceanSnapshotByIdQuery
    .historicalSnapshot,
  oceanSnapshotByIdQuery
    .matchingSnapshot
);

assert.deepEqual(
  oceanSnapshotByIdQuery
    .snapshot,
  oceanSnapshotByIdQuery
    .matchingSnapshot
);

console.log(
  "PASS Ocean Snapshot By ID Query returns the exact governed record"
);


const oceanSnapshotByIdWrongLocation =
  buildOceanSnapshotByIdQuery({
    historicalSnapshots: [
      historicalQueryOtherLocationBackfill,
      historicalQueryLaterBackfill,
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill
    ],

    snapshotId:
      historicalQueryOtherLocationBackfill
        .storageRecord
        .identity
        .snapshotId,

    location: {
      locationId:
        "historical-query-location-a"
    }
  });


assert.equal(
  oceanSnapshotByIdWrongLocation.available,
  false
);

assert.equal(
  oceanSnapshotByIdWrongLocation
    .matchingSnapshot,
  null
);

assert.ok(
  oceanSnapshotByIdWrongLocation
    .missingRequirements
    .includes(
      "matching-governed-ocean-snapshot"
    )
);

console.log(
  "PASS Ocean Snapshot By ID Query preserves governed location filtering"
);


const oceanSnapshotByIdBySchema =
  buildOceanSnapshotByIdQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill
        .storageRecord,

      governedHistoricalBackfill
        .storageRecord,

      laterHistoricalBackfill
        .storageRecord
    ],

    snapshotId:
      laterHistoricalBackfill
        .storageRecord
        .identity
        .snapshotId,

    snapshotSchemaVersion:
      laterHistoricalBackfill
        .storageRecord
        .identity
        .snapshotSchemaVersion
  });


assert.equal(
  oceanSnapshotByIdBySchema.available,
  true
);

assert.equal(
  oceanSnapshotByIdBySchema
    .matchingSnapshot
    .identity
    .snapshotSchemaVersion,
  laterHistoricalBackfill
    .storageRecord
    .identity
    .snapshotSchemaVersion
);

assert.equal(
  oceanSnapshotByIdBySchema
    .sourceQuery
    .contractVersion,
  "pelora-historical-snapshot-query-v1"
);

assert.equal(
  oceanSnapshotByIdBySchema
    .sourceQuery
    .returnedRecordCount,
  3
);

console.log(
  "PASS Ocean Snapshot By ID Query preserves governed schema filtering and source-query provenance"
);


assert.equal(
  Object.isFrozen(
    oceanSnapshotByIdQuery
  ),
  true
);

assert.equal(
  Object.isFrozen(
    oceanSnapshotByIdQuery
      .matchingSnapshot
  ),
  true
);

assert.equal(
  Object.isFrozen(
    oceanSnapshotByIdQuery
      .sourceQuery
  ),
  true
);

assert.ok(
  oceanSnapshotByIdQuery
    .limitations
    .includes(
      "This contract does not normalize raw database rows, compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    )
);

assert.equal(
  oceanSnapshotByIdQuery
    .comparison,
  undefined
);

assert.equal(
  oceanSnapshotByIdQuery
    .persistence,
  undefined
);

assert.equal(
  oceanSnapshotByIdQuery
    .trend,
  undefined
);

assert.equal(
  oceanSnapshotByIdQuery
    .species,
  undefined
);

assert.equal(
  oceanSnapshotByIdQuery
    .guidance,
  undefined
);

console.log(
  "PASS Ocean Snapshot By ID Query remains frozen, preservation-only, and scientifically neutral"
);


/**
 * ------------------------------------------------------------
 * Historical Ocean Snapshot Window Query v1.0
 * ------------------------------------------------------------
 */

const unavailableHistoricalWindowQuery =
  buildHistoricalOceanSnapshotWindowQuery({
    historicalSnapshots: []
  });


assert.equal(
  unavailableHistoricalWindowQuery.available,
  false
);

assert.equal(
  unavailableHistoricalWindowQuery
    .queryType,
  "historical-ocean-snapshot-window"
);

assert.equal(
  unavailableHistoricalWindowQuery
    .responsibility,
  "preserve"
);

assert.deepEqual(
  unavailableHistoricalWindowQuery
    .historicalSnapshots,
  []
);

assert.ok(
  unavailableHistoricalWindowQuery
    .missingRequirements
    .includes(
      "valid-observed-after"
    )
);

assert.ok(
  unavailableHistoricalWindowQuery
    .missingRequirements
    .includes(
      "valid-observed-before"
    )
);

console.log(
  "PASS Historical Ocean Snapshot Window Query remains unavailable without both valid boundaries"
);


const reversedHistoricalWindowQuery =
  buildHistoricalOceanSnapshotWindowQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryLaterBackfill
    ],

    observedAfter:
      "2026-06-17T00:00:00.000Z",

    observedBefore:
      "2026-06-14T00:00:00.000Z"
  });


assert.equal(
  reversedHistoricalWindowQuery.available,
  false
);

assert.equal(
  reversedHistoricalWindowQuery
    .request
    .validTimeWindow,
  false
);

assert.deepEqual(
  reversedHistoricalWindowQuery
    .snapshots,
  []
);

assert.ok(
  reversedHistoricalWindowQuery
    .missingRequirements
    .includes(
      "valid-observed-time-window"
    )
);

console.log(
  "PASS Historical Ocean Snapshot Window Query rejects a reversed observation window"
);


const historicalWindowQuery =
  buildHistoricalOceanSnapshotWindowQuery({
    historicalSnapshots: [
      historicalQueryLaterBackfill,
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill
    ],

    observedAfter:
      "2026-06-14T11:00:00.000Z",

    observedBefore:
      "2026-06-15T11:00:00.000Z"
  });


assert.equal(
  historicalWindowQuery.available,
  true
);

assert.equal(
  historicalWindowQuery
    .historicalSnapshots
    .length,
  2
);

assert.equal(
  historicalWindowQuery
    .historicalSnapshots[0]
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-14T11:00:00.000Z"
);

assert.equal(
  historicalWindowQuery
    .historicalSnapshots[1]
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-15T11:00:00.000Z"
);

assert.deepEqual(
  historicalWindowQuery
    .snapshots,
  historicalWindowQuery
    .historicalSnapshots
);

console.log(
  "PASS Historical Ocean Snapshot Window Query returns an inclusive chronological window"
);


const historicalWindowByLocation =
  buildHistoricalOceanSnapshotWindowQuery({
    historicalSnapshots: [
      historicalQueryOtherLocationBackfill,
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryLaterBackfill
    ],

    observedAfter:
      "2026-06-14T00:00:00.000Z",

    observedBefore:
      "2026-06-17T00:00:00.000Z",

    location: {
      locationId:
        "historical-query-location-a"
    }
  });


assert.equal(
  historicalWindowByLocation.available,
  true
);

assert.equal(
  historicalWindowByLocation
    .historicalSnapshots
    .length,
  3
);

assert.equal(
  historicalWindowByLocation
    .sourceQuery
    .returnedRecordCount,
  3
);

assert.ok(
  historicalWindowByLocation
    .historicalSnapshots
    .every(record =>
      record
        ?.snapshot
        ?.metadata
        ?.location
        ?.locationId ===
      "historical-query-location-a"
    )
);

console.log(
  "PASS Historical Ocean Snapshot Window Query preserves governed location filtering"
);


const historicalWindowBySchemaAndLimit =
  buildHistoricalOceanSnapshotWindowQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryLaterBackfill
    ],

    observedAfter:
      "2026-06-14T00:00:00.000Z",

    observedBefore:
      "2026-06-17T00:00:00.000Z",

    maximumSnapshots:
      2,

    snapshotSchemaVersion:
      historicalQueryMiddleBackfill
        .storageRecord
        .identity
        .snapshotSchemaVersion
  });


assert.equal(
  historicalWindowBySchemaAndLimit.available,
  true
);

assert.equal(
  historicalWindowBySchemaAndLimit
    .historicalSnapshots
    .length,
  2
);

assert.equal(
  historicalWindowBySchemaAndLimit
    .request
    .maximumSnapshots,
  2
);

assert.equal(
  historicalWindowBySchemaAndLimit
    .sourceQuery
    .returnedRecordCount,
  2
);

assert.equal(
  historicalWindowBySchemaAndLimit
    .sourceQuery
    .contractVersion,
  "pelora-historical-snapshot-query-v1"
);

assert.ok(
  historicalWindowBySchemaAndLimit
    .historicalSnapshots
    .every(record =>
      record
        ?.identity
        ?.snapshotSchemaVersion ===
      historicalQueryMiddleBackfill
        .storageRecord
        .identity
        .snapshotSchemaVersion
    )
);

console.log(
  "PASS Historical Ocean Snapshot Window Query preserves schema filtering and record limits"
);


const emptyHistoricalWindowQuery =
  buildHistoricalOceanSnapshotWindowQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryLaterBackfill
    ],

    observedAfter:
      "2026-07-01T00:00:00.000Z",

    observedBefore:
      "2026-07-02T00:00:00.000Z"
  });


assert.equal(
  emptyHistoricalWindowQuery.available,
  false
);

assert.deepEqual(
  emptyHistoricalWindowQuery
    .historicalSnapshots,
  []
);

assert.ok(
  emptyHistoricalWindowQuery
    .missingRequirements
    .includes(
      "governed-ocean-snapshots-within-window"
    )
);

console.log(
  "PASS Historical Ocean Snapshot Window Query remains unavailable when the valid window contains no governed records"
);


assert.equal(
  Object.isFrozen(
    historicalWindowQuery
  ),
  true
);

assert.equal(
  Object.isFrozen(
    historicalWindowQuery
      .historicalSnapshots
  ),
  true
);

assert.equal(
  Object.isFrozen(
    historicalWindowQuery
      .sourceQuery
  ),
  true
);

assert.ok(
  historicalWindowQuery
    .limitations
    .includes(
      "This contract does not normalize raw database rows, compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    )
);

assert.equal(
  historicalWindowQuery
    .comparison,
  undefined
);

assert.equal(
  historicalWindowQuery
    .persistence,
  undefined
);

assert.equal(
  historicalWindowQuery
    .trend,
  undefined
);

assert.equal(
  historicalWindowQuery
    .species,
  undefined
);

assert.equal(
  historicalWindowQuery
    .guidance,
  undefined
);

console.log(
  "PASS Historical Ocean Snapshot Window Query remains frozen, preservation-only, and scientifically neutral"
);


/**
 * ------------------------------------------------------------
 * Nearby Ocean History Query v1.0
 * ------------------------------------------------------------
 */

const unavailableNearbyOceanHistoryQuery =
  buildNearbyOceanHistoryQuery({
    historicalSnapshots: []
  });


assert.equal(
  unavailableNearbyOceanHistoryQuery.available,
  false
);

assert.equal(
  unavailableNearbyOceanHistoryQuery
    .queryType,
  "nearby-ocean-history"
);

assert.equal(
  unavailableNearbyOceanHistoryQuery
    .responsibility,
  "preserve"
);

assert.deepEqual(
  unavailableNearbyOceanHistoryQuery
    .historicalSnapshots,
  []
);

assert.ok(
  unavailableNearbyOceanHistoryQuery
    .missingRequirements
    .includes(
      "valid-center-coordinates"
    )
);

assert.ok(
  unavailableNearbyOceanHistoryQuery
    .missingRequirements
    .includes(
      "valid-radius-km"
    )
);

console.log(
  "PASS Nearby Ocean History Query remains unavailable without center coordinates and radius"
);


const nearbyOceanHistoryQuery =
  buildNearbyOceanHistoryQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryLaterBackfill,
      historicalQueryOtherLocationBackfill
    ],

    location: {
      latitude:
        29.5,

      longitude:
        -87.2
    },

    radiusKm:
      25
  });


assert.equal(
  nearbyOceanHistoryQuery.available,
  true
);

assert.equal(
  nearbyOceanHistoryQuery
    .sourceQuery
    .radiusFilterApplied,
  true
);

assert.equal(
  nearbyOceanHistoryQuery
    .sourceQuery
    .radiusExcludedCount,
  1
);

assert.equal(
  nearbyOceanHistoryQuery
    .historicalSnapshots
    .length,
  3
);

assert.equal(
  nearbyOceanHistoryQuery
    .request
    .centerLatitude,
  29.5
);

assert.equal(
  nearbyOceanHistoryQuery
    .request
    .centerLongitude,
  -87.2
);

assert.equal(
  nearbyOceanHistoryQuery
    .request
    .radiusKm,
  25
);

console.log(
  "PASS Nearby Ocean History Query returns governed history within the requested radius"
);


const nearbyOceanHistoryQueryWithWindow =
  buildNearbyOceanHistoryQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryLaterBackfill,
      historicalQueryOtherLocationBackfill
    ],

    location: {
      latitude:
        29.5,

      longitude:
        -87.2
    },

    radiusKm:
      25,

    observedAfter:
      "2026-06-15T00:00:00.000Z",

    observedBefore:
      "2026-06-16T23:59:59.999Z"
  });


assert.equal(
  nearbyOceanHistoryQueryWithWindow.available,
  true
);

assert.equal(
  nearbyOceanHistoryQueryWithWindow
    .historicalSnapshots
    .length,
  2
);

assert.equal(
  nearbyOceanHistoryQueryWithWindow
    .historicalSnapshots[0]
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-15T11:00:00.000Z"
);

assert.equal(
  nearbyOceanHistoryQueryWithWindow
    .historicalSnapshots[1]
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-16T11:00:00.000Z"
);

console.log(
  "PASS Nearby Ocean History Query preserves governed observation-window filtering"
);


const nearbyOceanHistoryQueryWithLimit =
  buildNearbyOceanHistoryQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryLaterBackfill
    ],

    location: {
      latitude:
        29.5,

      longitude:
        -87.2
    },

    radiusKm:
      25,

    maximumSnapshots:
      2
  });


assert.equal(
  nearbyOceanHistoryQueryWithLimit.available,
  true
);

assert.equal(
  nearbyOceanHistoryQueryWithLimit
    .historicalSnapshots
    .length,
  2
);

assert.equal(
  nearbyOceanHistoryQueryWithLimit
    .sourceQuery
    .returnedRecordCount,
  2
);

console.log(
  "PASS Nearby Ocean History Query preserves governed record limits"
);


const emptyNearbyOceanHistoryQuery =
  buildNearbyOceanHistoryQuery({
    historicalSnapshots: [
      historicalQueryOtherLocationBackfill
    ],

    location: {
      latitude:
        29.5,

      longitude:
        -87.2
    },

    radiusKm:
      25
  });


assert.equal(
  emptyNearbyOceanHistoryQuery.available,
  false
);

assert.deepEqual(
  emptyNearbyOceanHistoryQuery
    .historicalSnapshots,
  []
);

assert.ok(
  emptyNearbyOceanHistoryQuery
    .missingRequirements
    .includes(
      "governed-ocean-snapshots-within-radius"
    )
);

console.log(
  "PASS Nearby Ocean History Query remains unavailable when no governed records fall within radius"
);


const invalidRadiusNearbyOceanHistoryQuery =
  buildNearbyOceanHistoryQuery({
    historicalSnapshots: [
      historicalQueryEarlierBackfill
    ],

    location: {
      latitude:
        29.5,

      longitude:
        -87.2
    },

    radiusKm:
      -1
  });


assert.equal(
  invalidRadiusNearbyOceanHistoryQuery.available,
  false
);

assert.ok(
  invalidRadiusNearbyOceanHistoryQuery
    .missingRequirements
    .includes(
      "valid-radius-km"
    )
);

assert.equal(
  invalidRadiusNearbyOceanHistoryQuery
    .sourceQuery
    .radiusFilterApplied,
  false
);

console.log(
  "PASS Nearby Ocean History Query rejects an invalid radius"
);


assert.equal(
  Object.isFrozen(
    nearbyOceanHistoryQuery
  ),
  true
);

assert.equal(
  Object.isFrozen(
    nearbyOceanHistoryQuery
      .historicalSnapshots
  ),
  true
);

assert.equal(
  Object.isFrozen(
    nearbyOceanHistoryQuery
      .sourceQuery
  ),
  true
);

assert.ok(
  nearbyOceanHistoryQuery
    .limitations
    .includes(
      "This contract does not compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    )
);

assert.equal(
  nearbyOceanHistoryQuery
    .comparison,
  undefined
);

assert.equal(
  nearbyOceanHistoryQuery
    .persistence,
  undefined
);

assert.equal(
  nearbyOceanHistoryQuery
    .trend,
  undefined
);

assert.equal(
  nearbyOceanHistoryQuery
    .species,
  undefined
);

assert.equal(
  nearbyOceanHistoryQuery
    .guidance,
  undefined
);

console.log(
  "PASS Nearby Ocean History Query remains frozen, preservation-only, and scientifically neutral"
);

/**
 * ------------------------------------------------------------
 * Ocean Memory Time-Series Retrieval v1.0
 * ------------------------------------------------------------
 */

const unavailableOceanMemoryTimeSeries =
  buildOceanMemoryTimeSeries({
    historicalSnapshots: []
  });


assert.equal(
  unavailableOceanMemoryTimeSeries.available,
  false
);

assert.equal(
  unavailableOceanMemoryTimeSeries
    .retrievalType,
  "ocean-memory-time-series"
);

assert.equal(
  unavailableOceanMemoryTimeSeries
    .responsibility,
  "preserve"
);

assert.deepEqual(
  unavailableOceanMemoryTimeSeries
    .timeSeries,
  []
);

assert.equal(
  unavailableOceanMemoryTimeSeries
    .summary
    .sampleCount,
  0
);

assert.ok(
  unavailableOceanMemoryTimeSeries
    .missingRequirements
    .includes(
      "governed-ocean-memory-time-series"
    )
);

console.log(
  "PASS Ocean Memory Time-Series Retrieval remains unavailable without governed history"
);


const oceanMemoryTimeSeries =
  buildOceanMemoryTimeSeries({
    historicalSnapshots: [
      historicalQueryLaterBackfill,
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryEarlierBackfill
    ]
  });


assert.equal(
  oceanMemoryTimeSeries.available,
  true
);

assert.equal(
  oceanMemoryTimeSeries
    .summary
    .sampleCount,
  3
);

assert.equal(
  oceanMemoryTimeSeries
    .sourceQuery
    .duplicateRecordCount,
  1
);

assert.equal(
  oceanMemoryTimeSeries
    .timeSeries[0]
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-14T11:00:00.000Z"
);

assert.equal(
  oceanMemoryTimeSeries
    .timeSeries[1]
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-15T11:00:00.000Z"
);

assert.equal(
  oceanMemoryTimeSeries
    .timeSeries[2]
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-16T11:00:00.000Z"
);

console.log(
  "PASS Ocean Memory Time-Series Retrieval returns deduplicated chronological governed history"
);


assert.equal(
  oceanMemoryTimeSeries
    .summary
    .firstObservedAt,
  "2026-06-14T11:00:00.000Z"
);

assert.equal(
  oceanMemoryTimeSeries
    .summary
    .lastObservedAt,
  "2026-06-16T11:00:00.000Z"
);

assert.equal(
  oceanMemoryTimeSeries
    .summary
    .durationHours,
  48
);

console.log(
  "PASS Ocean Memory Time-Series Retrieval exposes the governed chronological observation window"
);


const oceanMemoryTimeSeriesByWindow =
  buildOceanMemoryTimeSeries({
    historicalSnapshots: [
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryLaterBackfill
    ],

    observedAfter:
      "2026-06-15T00:00:00.000Z",

    observedBefore:
      "2026-06-16T23:59:59.999Z"
  });


assert.equal(
  oceanMemoryTimeSeriesByWindow.available,
  true
);

assert.equal(
  oceanMemoryTimeSeriesByWindow
    .summary
    .sampleCount,
  2
);

assert.equal(
  oceanMemoryTimeSeriesByWindow
    .summary
    .firstObservedAt,
  "2026-06-15T11:00:00.000Z"
);

assert.equal(
  oceanMemoryTimeSeriesByWindow
    .summary
    .lastObservedAt,
  "2026-06-16T11:00:00.000Z"
);

console.log(
  "PASS Ocean Memory Time-Series Retrieval preserves governed time-window filtering"
);


const oceanMemoryTimeSeriesNearby =
  buildOceanMemoryTimeSeries({
    historicalSnapshots: [
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryLaterBackfill,
      historicalQueryOtherLocationBackfill
    ],

    location: {
      latitude:
        29.5,

      longitude:
        -87.2
    },

    radiusKm:
      25
  });


assert.equal(
  oceanMemoryTimeSeriesNearby.available,
  true
);

assert.equal(
  oceanMemoryTimeSeriesNearby
    .summary
    .sampleCount,
  3
);

assert.equal(
  oceanMemoryTimeSeriesNearby
    .sourceQuery
    .radiusFilterApplied,
  true
);

console.log(
  "PASS Ocean Memory Time-Series Retrieval preserves governed spatial filtering"
);


const oceanMemoryTimeSeriesWithLimit =
  buildOceanMemoryTimeSeries({
    historicalSnapshots: [
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryLaterBackfill
    ],

    maximumSnapshots:
      2
  });


assert.equal(
  oceanMemoryTimeSeriesWithLimit.available,
  true
);

assert.equal(
  oceanMemoryTimeSeriesWithLimit
    .summary
    .sampleCount,
  2
);

assert.equal(
  oceanMemoryTimeSeriesWithLimit
    .timeSeries[0]
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-15T11:00:00.000Z"
);

assert.equal(
  oceanMemoryTimeSeriesWithLimit
    .timeSeries[1]
    .snapshot
    .metadata
    .time
    .observedAt,
  "2026-06-16T11:00:00.000Z"
);

console.log(
  "PASS Ocean Memory Time-Series Retrieval preserves governed record limits"
);


assert.equal(
  Object.isFrozen(
    oceanMemoryTimeSeries
  ),
  true
);

assert.equal(
  Object.isFrozen(
    oceanMemoryTimeSeries
      .timeSeries
  ),
  true
);

assert.equal(
  Object.isFrozen(
    oceanMemoryTimeSeries
      .summary
  ),
  true
);

assert.equal(
  Object.isFrozen(
    oceanMemoryTimeSeries
      .sourceQuery
  ),
  true
);

assert.ok(
  oceanMemoryTimeSeries
    .limitations
    .includes(
      "This contract does not compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    )
);

assert.equal(
  oceanMemoryTimeSeries
    .comparison,
  undefined
);

assert.equal(
  oceanMemoryTimeSeries
    .persistence,
  undefined
);

assert.equal(
  oceanMemoryTimeSeries
    .trend,
  undefined
);

assert.equal(
  oceanMemoryTimeSeries
    .species,
  undefined
);

assert.equal(
  oceanMemoryTimeSeries
    .guidance,
  undefined
);

console.log(
  "PASS Ocean Memory Time-Series Retrieval remains frozen, preservation-only, and scientifically neutral"
);


/**
 * ------------------------------------------------------------
 * Ocean Change From Time-Series v1.0
 * ------------------------------------------------------------
 */

const unavailableOceanChangeFromTimeSeries =
  buildOceanChangeFromTimeSeries({
    timeSeries:
      null
  });


assert.equal(
  unavailableOceanChangeFromTimeSeries.available,
  false
);

assert.equal(
  unavailableOceanChangeFromTimeSeries
    .analysisType,
  "ocean-change-from-time-series"
);

assert.equal(
  unavailableOceanChangeFromTimeSeries
    .responsibility,
  "Compare"
);

assert.equal(
  unavailableOceanChangeFromTimeSeries
    .comparison,
  null
);

assert.ok(
  unavailableOceanChangeFromTimeSeries
    .missingRequirements
    .includes(
      "governed-ocean-memory-time-series"
    )
);

console.log(
  "PASS Ocean Change From Time-Series remains unavailable without governed Time-Series input"
);


const oneSnapshotTimeSeries =
  buildOceanMemoryTimeSeries({
    historicalSnapshots: [
      historicalQueryEarlierBackfill
    ]
  });


const insufficientOceanChangeFromTimeSeries =
  buildOceanChangeFromTimeSeries({
    timeSeries:
      oneSnapshotTimeSeries
  });


assert.equal(
  insufficientOceanChangeFromTimeSeries.available,
  false
);

assert.equal(
  insufficientOceanChangeFromTimeSeries
    .source
    .sampleCount,
  1
);

assert.ok(
  insufficientOceanChangeFromTimeSeries
    .missingRequirements
    .includes(
      "two-or-more-chronological-ocean-memory-records"
    )
);

console.log(
  "PASS Ocean Change From Time-Series requires at least two governed chronological records"
);


const governedChangeTimeSeries =
  buildOceanMemoryTimeSeries({
    historicalSnapshots: [
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryLaterBackfill
    ]
  });


const oceanChangeFromTimeSeries =
  buildOceanChangeFromTimeSeries({
    timeSeries:
      governedChangeTimeSeries
  });


assert.equal(
  oceanChangeFromTimeSeries.available,
  true
);

assert.equal(
  oceanChangeFromTimeSeries
    .source
    .sampleCount,
  3
);

assert.equal(
  oceanChangeFromTimeSeries
    .source
    .previousSnapshotId,
  governedChangeTimeSeries
    .historicalSnapshots[1]
    .identity
    .snapshotId
);

assert.equal(
  oceanChangeFromTimeSeries
    .source
    .currentSnapshotId,
  governedChangeTimeSeries
    .historicalSnapshots[2]
    .identity
    .snapshotId
);

assert.equal(
  oceanChangeFromTimeSeries
    .comparison
    .contractVersion,
  "pelora-ocean-change-analysis-v1"
);

console.log(
  "PASS Ocean Change From Time-Series delegates the latest governed pair to Ocean Change Analysis"
);


const directLatestPairOceanChange =
  buildOceanChangeAnalysis({
    previousObservationSnapshot:
      governedChangeTimeSeries
        .historicalSnapshots[1]
        .snapshot
        .observation,

    currentObservationSnapshot:
      governedChangeTimeSeries
        .historicalSnapshots[2]
        .snapshot
        .observation,

    previousIntelligenceSnapshot:
      governedChangeTimeSeries
        .historicalSnapshots[1]
        .snapshot
        .intelligence,

    currentIntelligenceSnapshot:
      governedChangeTimeSeries
        .historicalSnapshots[2]
        .snapshot
        .intelligence
  });


assert.deepEqual(
  oceanChangeFromTimeSeries
    .comparison,
  directLatestPairOceanChange
);

console.log(
  "PASS Ocean Change From Time-Series preserves canonical Ocean Change Analysis behavior"
);


assert.equal(
  oceanChangeFromTimeSeries
    .source
    .retrievalType,
  "ocean-memory-time-series"
);

assert.equal(
  oceanChangeFromTimeSeries
    .source
    .contractVersion,
  "pelora-ocean-memory-time-series-v1"
);

assert.equal(
  oceanChangeFromTimeSeries
    .contractVersion,
  "pelora-ocean-change-from-time-series-v1"
);

console.log(
  "PASS Ocean Change From Time-Series preserves governed Time-Series provenance"
);


assert.equal(
  Object.isFrozen(
    oceanChangeFromTimeSeries
  ),
  true
);

assert.equal(
  Object.isFrozen(
    oceanChangeFromTimeSeries
      .source
  ),
  true
);

assert.equal(
  Object.isFrozen(
    oceanChangeFromTimeSeries
      .comparison
  ),
  true
);

assert.ok(
  oceanChangeFromTimeSeries
    .limitations
    .includes(
      "This contract does not retrieve external data, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    )
);

assert.equal(
  oceanChangeFromTimeSeries
    .persistence,
  undefined
);

assert.equal(
  oceanChangeFromTimeSeries
    .trend,
  undefined
);

assert.equal(
  oceanChangeFromTimeSeries
    .species,
  undefined
);

assert.equal(
  oceanChangeFromTimeSeries
    .guidance,
  undefined
);

console.log(
  "PASS Ocean Change From Time-Series remains frozen, Compare-only, and scientifically bounded"
);


/**
 * ------------------------------------------------------------
 * Ocean Evolution v1.0
 * ------------------------------------------------------------
 */

const unavailableOceanEvolution =
  buildOceanEvolution({
    oceanChange:
      null,

    oceanPersistence:
      null
  });


assert.equal(
  unavailableOceanEvolution.available,
  false
);

assert.equal(
  unavailableOceanEvolution
    .analysisType,
  "ocean-evolution"
);

assert.equal(
  unavailableOceanEvolution
    .responsibility,
  "Compare"
);

assert.equal(
  unavailableOceanEvolution
    .interpretation,
  "species-neutral-ocean-evolution"
);

assert.ok(
  unavailableOceanEvolution
    .missingRequirements
    .includes(
      "governed-ocean-persistence"
    )
);

console.log(
  "PASS Ocean Evolution remains unavailable without governed Ocean Persistence"
);


/**
 * ------------------------------------------------------------
 * Ocean Persistence Time-Series Integration v1.0
 * ------------------------------------------------------------
 */

const persistenceIntegrationHistoricalQuery =
  buildHistoricalSnapshotQuery({
    historicalSnapshots: [
      historicalQueryLaterBackfill,
      historicalQueryEarlierBackfill,
      historicalQueryMiddleBackfill,
      historicalQueryEarlierBackfill
    ]
  });


const persistenceIntegrationTimeSeries =
  buildOceanMemoryTimeSeries({
    historicalSnapshots:
      persistenceIntegrationHistoricalQuery
        .historicalSnapshots
  });


const persistenceFromHistoricalQuery =
  buildOceanPersistence({
    historicalSnapshots:
      persistenceIntegrationHistoricalQuery
        .historicalSnapshots
  });


const persistenceFromTimeSeries =
  buildOceanPersistence({
    historicalSnapshots:
      persistenceIntegrationTimeSeries
        .historicalSnapshots
  });


assert.equal(
  persistenceIntegrationTimeSeries.available,
  true
);

assert.equal(
  persistenceIntegrationTimeSeries
    .summary
    .sampleCount,
  3
);

assert.deepEqual(
  persistenceFromTimeSeries,
  persistenceFromHistoricalQuery
);

console.log(
  "PASS Ocean Persistence preserves governed behavior through Ocean Memory Time-Series Retrieval"
);

const oceanPersistenceFromGovernedTimeSeries =
  buildOceanPersistence({
    timeSeries:
      persistenceIntegrationTimeSeries
  });


assert.equal(
  oceanPersistenceFromGovernedTimeSeries
    .input
    .source,
  "ocean-memory-time-series"
);

assert.equal(
  oceanPersistenceFromGovernedTimeSeries
    .input
    .timeSeriesContractVersion,
  "pelora-ocean-memory-time-series-v1"
);

assert.deepEqual(
  oceanPersistenceFromGovernedTimeSeries,
  {
    ...persistenceFromTimeSeries,

    input: {
      source:
        "ocean-memory-time-series",

      timeSeriesContractVersion:
        "pelora-ocean-memory-time-series-v1"
    }
  }
);

console.log(
  "PASS Ocean Persistence reports canonical Ocean Memory Time-Series provenance"
);


const oceanPersistenceFromLegacyHistory =
  buildOceanPersistence({
    historicalSnapshots:
      persistenceIntegrationHistoricalQuery
        .historicalSnapshots
  });


assert.equal(
  oceanPersistenceFromLegacyHistory
    .input
    .source,
  "legacy-historical-snapshots"
);

assert.equal(
  oceanPersistenceFromLegacyHistory
    .input
    .timeSeriesContractVersion,
  null
);

assert.deepEqual(
  oceanPersistenceFromLegacyHistory,
  persistenceFromHistoricalQuery
);

console.log(
  "PASS Ocean Persistence preserves the legacy historicalSnapshots compatibility path"
);

const oceanEvolutionWithoutAssessedFeatures =
  buildOceanEvolution({
    oceanChange:
      oceanChangeFromTimeSeries,

    oceanPersistence:
      oceanPersistenceFromGovernedTimeSeries
  });


assert.equal(
  oceanEvolutionWithoutAssessedFeatures.available,
  false
);

assert.equal(
  oceanEvolutionWithoutAssessedFeatures
    .lifecycleSummary
    .assessedFeatureCount,
  0
);

assert.ok(
  oceanEvolutionWithoutAssessedFeatures
    .missingRequirements
    .includes(
      "one-or-more-assessed-persistence-features"
    )
);

console.log(
  "PASS Ocean Evolution refuses to claim evolution without an assessed feature lifecycle"
);

assert.equal(
  laterHistoricalBackfill.available,
  true
);

const persistenceChronologicalHistory =
  buildPersistenceEvidence({
    historicalSnapshots: [
      laterHistoricalBackfill,
      governedHistoricalBackfill
    ]
  });

assert.equal(
  persistenceChronologicalHistory.available,
  false
);

assert.equal(
  persistenceChronologicalHistory.classification,
  "temporal-analysis-pending"
);

assert.equal(
  persistenceChronologicalHistory.reason,
  "organization-history-insufficient"
);

assert.equal(
  persistenceChronologicalHistory
    .values
    .sampleCount,
  2
);

assert.equal(
  persistenceChronologicalHistory
    .values
    .firstObservedAt,
  "2026-06-15T11:00:00.000Z"
);

assert.equal(
  persistenceChronologicalHistory
    .values
    .lastObservedAt,
  "2026-06-16T11:00:00.000Z"
);

assert.equal(
  persistenceChronologicalHistory
    .values
    .durationHours,
  24
);

assert.equal(
  persistenceChronologicalHistory
    .values
    .observationWindowHours,
  24
);

assert.ok(
  persistenceChronologicalHistory
    .drivers
    .includes(
      "multiple-governed-historical-snapshots-available"
    )
);

assert.ok(
  persistenceChronologicalHistory
    .drivers
    .includes(
      "chronological-observation-window-established"
    )
);

console.log(
  "PASS Persistence Evidence v2 establishes a governed chronological observation window"
);


const persistenceWithInvalidRecords =
  buildPersistenceEvidence({
    historicalSnapshots: [
      null,
      {},
      unavailableHistoricalBackfill,
      governedHistoricalBackfill,
      laterHistoricalBackfill
    ]
  });

assert.equal(
  persistenceWithInvalidRecords.classification,
  "temporal-analysis-pending"
);

assert.equal(
  persistenceWithInvalidRecords
    .values
    .sampleCount,
  2
);

assert.equal(
  persistenceWithInvalidRecords
    .values
    .durationHours,
  24
);

console.log(
  "PASS Persistence Evidence v2 excludes invalid historical records"
);


assert.equal(
  persistenceChronologicalHistory
    .confidence
    .score,
  0
);

assert.equal(
  persistenceChronologicalHistory
    .values
    .lifecycleState,
  null
);

assert.equal(
  persistenceChronologicalHistory
    .values
    .multiSignalPersistence,
  false
);

assert.ok(
  persistenceChronologicalHistory
    .limitations
    .includes(
      "persistence-does-not-establish-prey-or-fish-presence"
    )
);

assert.equal(
  Object.hasOwn(
    persistenceChronologicalHistory,
    "species"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    persistenceChronologicalHistory,
    "captainNarrative"
  ),
  false
);

assert.equal(
  Object.isFrozen(
    persistenceChronologicalHistory
  ),
  true
);

console.log(
  "PASS Persistence Evidence v2 remains species-neutral before temporal lifecycle analysis"
);


/**
 * ------------------------------------------------------------
 * Ocean Persistence Engine Contract v1.0
 * ------------------------------------------------------------
 */

const oceanPersistenceNoHistory =
  buildOceanPersistence();

assert.equal(
  oceanPersistenceNoHistory.available,
  false
);

assert.equal(
  oceanPersistenceNoHistory.contractVersion,
  "pelora-ocean-persistence-v1"
);

assert.equal(
  oceanPersistenceNoHistory.responsibility,
  "Compare"
);

assert.equal(
  oceanPersistenceNoHistory.interpretation,
  "species-neutral-ocean-persistence"
);

assert.equal(
  oceanPersistenceNoHistory
    .compatibility
    .legacyContractVersion,
  "pelora-persistence-evidence-v2"
);

assert.equal(
  oceanPersistenceNoHistory
    .values
    .registeredFeatureCount,
  16
);

assert.equal(
  oceanPersistenceNoHistory
    .values
    .assessedFeatureCount,
  0
);

console.log(
  "PASS Ocean Persistence v1 establishes the canonical multi-feature contract"
);

assert.equal(
  Object.keys(
    oceanPersistenceNoHistory
      .featureContinuity
  ).length,
  Object.keys(
    oceanPersistenceNoHistory
      .featurePersistence
  ).length
);

assert.equal(
  oceanPersistenceNoHistory
    .continuitySummary
    .registeredContinuityCount,
  oceanPersistenceNoHistory
    .values
    .registeredFeatureCount
);

assert.equal(
  oceanPersistenceNoHistory
    .continuitySummary
    .assessedContinuityCount,
  0
);

assert.equal(
  oceanPersistenceNoHistory
    .continuitySummary
    .supportedContinuityCount,
  0
);

console.log(
  "PASS Ocean Persistence mirrors the full feature registry into Temporal Feature Continuity"
);


assert.equal(
  oceanPersistenceNoHistory
    .values
    .assessedFeatureCount,
  0
);

assert.equal(
  oceanPersistenceNoHistory
    .featurePersistence
    .seaSurfaceTemperature
    .available,
  false
);

assert.equal(
  oceanPersistenceNoHistory
    .featureContinuity
    .seaSurfaceTemperature
    .available,
  false
);

console.log(
  "PASS Ocean Persistence continuity integration does not alter persistence assessment semantics"
);

assert.equal(
  oceanPersistenceNoHistory
    .featurePersistence
    .seaSurfaceTemperature
    .available,
  false
);

assert.equal(
  oceanPersistenceNoHistory
    .featurePersistence
    .seaSurfaceTemperature
    .reason,
  "historical-sst-observations-unavailable"
);

assert.ok(
  oceanPersistenceNoHistory
    .featurePersistence
    .seaSurfaceTemperature
    .limitations
    .includes(
      "feature-absence-not-established"
    )
);

assert.equal(
  oceanPersistenceNoHistory
    .featurePersistence
    .productivity
    .featureFamily,
  "biological-ocean"
);

assert.equal(
  oceanPersistenceNoHistory
    .featurePersistence
    .salinity
    .featureFamily,
  "chemical-ocean"
);

assert.equal(
  oceanPersistenceNoHistory
    .featurePersistence
    .dissolvedOxygen
    .featureFamily,
  "chemical-ocean"
);

console.log(
  "PASS Ocean Persistence v1 registers future analyzers without claiming feature absence"
);


const oceanPersistenceChronologicalHistory =
  buildOceanPersistence({
    historicalSnapshots: [
      laterHistoricalBackfill,
      governedHistoricalBackfill
    ]
  });

assert.equal(
  oceanPersistenceChronologicalHistory
    .classification,
  persistenceChronologicalHistory
    .classification
);

assert.equal(
  oceanPersistenceChronologicalHistory
    .values
    .sampleCount,
  2
);

assert.equal(
  oceanPersistenceChronologicalHistory
    .values
    .durationHours,
  24
);

assert.equal(
  oceanPersistenceChronologicalHistory
    .featurePersistence
    .oceanOrganization
    .classification,
  persistenceChronologicalHistory
    .classification
);

assert.equal(
  oceanPersistenceChronologicalHistory
    .featurePersistence
    .oceanOrganization
    .values
    .firstObservedAt,
  "2026-06-15T11:00:00.000Z"
);

assert.equal(
  oceanPersistenceChronologicalHistory
    .featurePersistence
    .oceanOrganization
    .values
    .lastObservedAt,
  "2026-06-16T11:00:00.000Z"
);

assert.equal(
  oceanPersistenceChronologicalHistory
    .featurePersistence
    .seaSurfaceTemperature
    .available,
  false
);

console.log(
  "PASS Ocean Persistence v1 preserves governed Persistence Evidence v2 meaning"
);


assert.equal(
  Object.hasOwn(
    oceanPersistenceChronologicalHistory,
    "species"
  ),
  false
);

assert.equal(
  Object.hasOwn(
    oceanPersistenceChronologicalHistory,
    "captainNarrative"
  ),
  false
);

assert.equal(
  Object.isFrozen(
    oceanPersistenceChronologicalHistory
  ),
  true
);

assert.equal(
  Object.isFrozen(
    oceanPersistenceChronologicalHistory
      .featurePersistence
  ),
  true
);

assert.ok(
  oceanPersistenceChronologicalHistory
    .limitations
    .includes(
      "ocean-persistence-does-not-establish-habitat-quality-or-fishing-opportunity"
    )
);

console.log(
  "PASS Ocean Persistence v1 remains frozen, species-neutral, and non-prescriptive"
);

assert.deepEqual(
  OCEAN_PERSISTENCE_LIFECYCLE_STATES,
  [
    "emerging",
    "developing",
    "stable",
    "strengthening",
    "weakening",
    "fading"
  ]
);

assert.ok(
  OCEAN_PERSISTENCE_FEATURE_FAMILIES
    .includes(
      "physical-ocean"
    )
);

console.log(
  "PASS Feature Persistence v1 exposes governed lifecycle and family vocabularies"
);


const governedFeaturePersistence =
  buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "sea-surface-temperature",

    featureFamily:
      "physical-ocean",

    classification:
      "stable",

    lifecycleState:
      "stable",

    reason:
      "governed-temperature-history-assessed",

    values: {
      sampleCount:
        3,

      durationHours:
        48
    },

    confidence: {
      score:
        70,

      level:
        "High"
    },

    drivers: [
      "multiple-temperature-observations-available"
    ]
  });

assert.equal(
  governedFeaturePersistence.available,
  true
);

assert.equal(
  governedFeaturePersistence.lifecycleState,
  "stable"
);

assert.equal(
  governedFeaturePersistence.contractVersion,
  "pelora-feature-persistence-v1"
);

assert.equal(
  Object.isFrozen(
    governedFeaturePersistence
  ),
  true
);

console.log(
  "PASS Feature Persistence v1 builds a frozen governed feature contract"
);


const invalidLifecyclePersistence =
  buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "chlorophyll",

    featureFamily:
      "biological-ocean",

    classification:
      "unknown-state",

    lifecycleState:
      "accelerating"
  });

assert.equal(
  invalidLifecyclePersistence.available,
  false
);

assert.equal(
  invalidLifecyclePersistence.lifecycleState,
  null
);

assert.ok(
  invalidLifecyclePersistence
    .limitations
    .includes(
      "lifecycle-state-not-governed"
    )
);

console.log(
  "PASS Feature Persistence v1 rejects ungoverned lifecycle states"
);


/**
 * ------------------------------------------------------------
 * Temporal Feature Continuity v1.0
 * ------------------------------------------------------------
 */

const unavailableTemporalFeatureContinuity =
  buildTemporalFeatureContinuity({
    featurePersistence:
      null
  });


assert.equal(
  unavailableTemporalFeatureContinuity.available,
  false
);

assert.equal(
  unavailableTemporalFeatureContinuity
    .continuityType,
  "temporal-feature-continuity"
);

assert.equal(
  unavailableTemporalFeatureContinuity
    .responsibility,
  "Compare"
);

assert.ok(
  unavailableTemporalFeatureContinuity
    .missingRequirements
    .includes(
      "governed-feature-persistence"
    )
);

console.log(
  "PASS Temporal Feature Continuity remains unavailable without governed Feature Persistence"
);


const insufficientTemporalFeatureContinuity =
  buildTemporalFeatureContinuity({
    featurePersistence:
      buildFeaturePersistenceContract({
        available:
          true,

        featureType:
          "test-feature",

        featureFamily:
          "physical-ocean",

        classification:
          "test-persistence",

        lifecycleState:
          "stable",

        values: {
          sampleCount:
            1,

          firstObservedAt:
            "2026-08-01T12:00:00.000Z",

          lastObservedAt:
            "2026-08-01T12:00:00.000Z",

          durationHours:
            0
        },

        confidence: {
          score:
            0.8,

          level:
            "High"
        }
      })
  });


assert.equal(
  insufficientTemporalFeatureContinuity.available,
  false
);

assert.ok(
  insufficientTemporalFeatureContinuity
    .missingRequirements
    .includes(
      "two-or-more-chronological-feature-observations"
    )
);

console.log(
  "PASS Temporal Feature Continuity requires a governed chronological feature window"
);


const stableFeaturePersistenceForContinuity =
  buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "test-feature",

    featureFamily:
      "physical-ocean",

    classification:
      "persistent-feature",

    lifecycleState:
      "stable",

    values: {
      sampleCount:
        3,

      firstObservedAt:
        "2026-08-01T12:00:00.000Z",

      lastObservedAt:
        "2026-08-02T12:00:00.000Z",

      durationHours:
        24
    },

    confidence: {
      score:
        0.8,

      level:
        "High"
    }
  });


const stableTemporalFeatureContinuity =
  buildTemporalFeatureContinuity({
    featurePersistence:
      stableFeaturePersistenceForContinuity
  });


assert.equal(
  stableTemporalFeatureContinuity.available,
  true
);

assert.equal(
  stableTemporalFeatureContinuity
    .continuity
    .supported,
  true
);

assert.equal(
  stableTemporalFeatureContinuity
    .continuity
    .classification,
  "continuity-supported"
);

assert.equal(
  stableTemporalFeatureContinuity
    .continuity
    .lifecycleState,
  "stable"
);

console.log(
  "PASS Temporal Feature Continuity supports governed stable feature continuity"
);


const emergingFeaturePersistenceForContinuity =
  buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "test-feature",

    featureFamily:
      "physical-ocean",

    classification:
      "emerging-feature",

    lifecycleState:
      "emerging",

    values: {
      sampleCount:
        2,

      firstObservedAt:
        "2026-08-01T12:00:00.000Z",

      lastObservedAt:
        "2026-08-02T12:00:00.000Z",

      durationHours:
        24
    },

    confidence: {
      score:
        0.7,

      level:
        "Moderate"
    }
  });


const emergingTemporalFeatureContinuity =
  buildTemporalFeatureContinuity({
    featurePersistence:
      emergingFeaturePersistenceForContinuity
  });


assert.equal(
  emergingTemporalFeatureContinuity.available,
  true
);

assert.equal(
  emergingTemporalFeatureContinuity
    .continuity
    .supported,
  false
);

assert.equal(
  emergingTemporalFeatureContinuity
    .continuity
    .classification,
  "continuity-not-established"
);

console.log(
  "PASS Temporal Feature Continuity distinguishes assessment availability from supported continuity"
);


assert.equal(
  stableTemporalFeatureContinuity
    .spatialContext
    .featurePositionAvailable,
  false
);

assert.equal(
  stableTemporalFeatureContinuity
    .spatialContext
    .featureMovementNm,
  null
);

assert.equal(
  stableTemporalFeatureContinuity
    .spatialContext
    .movementDirectionDegrees,
  null
);

assert.equal(
  stableTemporalFeatureContinuity
    .spatialContext
    .movementSpeedKnots,
  null
);

assert.ok(
  stableTemporalFeatureContinuity
    .limitations
    .includes(
      "Observation-location coordinates must not be interpreted as feature position or feature movement."
    )
);

console.log(
  "PASS Temporal Feature Continuity refuses to infer spatial feature movement from observation locations"
);


assert.equal(
  stableTemporalFeatureContinuity
    .upstreamContracts
    .featurePersistence,
  "pelora-feature-persistence-v1"
);

assert.equal(
  stableTemporalFeatureContinuity
    .contractVersion,
  "pelora-temporal-feature-continuity-v1"
);

assert.equal(
  Object.isFrozen(
    stableTemporalFeatureContinuity
  ),
  true
);

assert.equal(
  Object.isFrozen(
    stableTemporalFeatureContinuity
      .continuity
  ),
  true
);

assert.equal(
  Object.isFrozen(
    stableTemporalFeatureContinuity
      .spatialContext
  ),
  true
);

assert.equal(
  stableTemporalFeatureContinuity
    .species,
  undefined
);

assert.equal(
  stableTemporalFeatureContinuity
    .opportunity,
  undefined
);

assert.equal(
  stableTemporalFeatureContinuity
    .guidance,
  undefined
);

console.log(
  "PASS Temporal Feature Continuity preserves provenance, immutability, and species-neutral boundaries"
);


/**
 * ------------------------------------------------------------
 * Governed Feature Position v1.0
 * ------------------------------------------------------------
 */

const unavailableGovernedFeaturePosition =
  buildGovernedFeaturePosition();


assert.equal(
  unavailableGovernedFeaturePosition.available,
  false
);

assert.equal(
  unavailableGovernedFeaturePosition
    .responsibility,
  "Preserve"
);

assert.ok(
  unavailableGovernedFeaturePosition
    .missingRequirements
    .includes(
      "valid-feature-latitude"
    )
);

assert.ok(
  unavailableGovernedFeaturePosition
    .missingRequirements
    .includes(
      "valid-feature-longitude"
    )
);

console.log(
  "PASS Governed Feature Position remains unavailable without explicit feature-position evidence"
);


const governedCurrentEdgePosition =
  buildGovernedFeaturePosition({
    featureType:
      "current-edge",

    featureFamily:
      "physical-ocean",

    positionType:
      "centroid",

    latitude:
      28.125,

    longitude:
      -87.45,

    observedAt:
      "2026-08-07T12:00:00.000Z",

    sourceType:
      "derived-feature-analysis",

    sourceContractVersion:
      "pelora-current-edge-v1"
  });


assert.equal(
  governedCurrentEdgePosition.available,
  true
);

assert.equal(
  governedCurrentEdgePosition
    .positionType,
  "centroid"
);

assert.equal(
  governedCurrentEdgePosition
    .feature
    .featureType,
  "current-edge"
);

assert.equal(
  governedCurrentEdgePosition
    .feature
    .featureFamily,
  "physical-ocean"
);

assert.equal(
  governedCurrentEdgePosition
    .position
    .latitude,
  28.125
);

assert.equal(
  governedCurrentEdgePosition
    .position
    .longitude,
  -87.45
);

console.log(
  "PASS Governed Feature Position preserves explicit governed feature coordinates"
);


const invalidGovernedFeaturePosition =
  buildGovernedFeaturePosition({
    featureType:
      "current-edge",

    featureFamily:
      "physical-ocean",

    positionType:
      "centroid",

    latitude:
      95,

    longitude:
      -190,

    observedAt:
      "2026-08-07T12:00:00.000Z",

    sourceType:
      "derived-feature-analysis",

    sourceContractVersion:
      "pelora-current-edge-v1"
  });


assert.equal(
  invalidGovernedFeaturePosition.available,
  false
);

assert.equal(
  invalidGovernedFeaturePosition
    .position
    .latitude,
  null
);

assert.equal(
  invalidGovernedFeaturePosition
    .position
    .longitude,
  null
);

console.log(
  "PASS Governed Feature Position rejects invalid feature coordinates"
);


const noFallbackGovernedFeaturePosition =
  buildGovernedFeaturePosition({
    featureType:
      "current-edge",

    featureFamily:
      "physical-ocean",

    positionType:
      "centroid",

    observedAt:
      "2026-08-07T12:00:00.000Z",

    sourceType:
      "derived-feature-analysis",

    sourceContractVersion:
      "pelora-current-edge-v1",

    requestedLatitude:
      28.125,

    requestedLongitude:
      -87.45
  });


assert.equal(
  noFallbackGovernedFeaturePosition.available,
  false
);

assert.equal(
  noFallbackGovernedFeaturePosition
    .position
    .latitude,
  null
);

assert.equal(
  noFallbackGovernedFeaturePosition
    .position
    .longitude,
  null
);

console.log(
  "PASS Governed Feature Position refuses observation or request-coordinate fallback"
);


assert.equal(
  governedCurrentEdgePosition
    .source
    .type,
  "derived-feature-analysis"
);

assert.equal(
  governedCurrentEdgePosition
    .source
    .contractVersion,
  "pelora-current-edge-v1"
);

assert.equal(
  governedCurrentEdgePosition
    .contractVersion,
  "pelora-governed-feature-position-v1"
);

assert.equal(
  Object.isFrozen(
    governedCurrentEdgePosition
  ),
  true
);

assert.equal(
  Object.isFrozen(
    governedCurrentEdgePosition
      .position
  ),
  true
);

assert.equal(
  governedCurrentEdgePosition
    .featureMovementNm,
  undefined
);

assert.equal(
  governedCurrentEdgePosition
    .movementDirectionDegrees,
  undefined
);

assert.equal(
  governedCurrentEdgePosition
    .movementSpeedKnots,
  undefined
);

assert.equal(
  governedCurrentEdgePosition
    .species,
  undefined
);

assert.equal(
  governedCurrentEdgePosition
    .opportunity,
  undefined
);

assert.equal(
  governedCurrentEdgePosition
    .guidance,
  undefined
);

console.log(
  "PASS Governed Feature Position preserves provenance, immutability, and no-movement boundaries"
);


/**
 * ------------------------------------------------------------
 * Sea Surface Temperature Persistence Analysis v1.0
 * ------------------------------------------------------------
 */

const sstPersistenceNoHistory =
  buildSeaSurfaceTemperaturePersistence();

assert.equal(
  sstPersistenceNoHistory.available,
  false
);

assert.equal(
  sstPersistenceNoHistory.classification,
  "unavailable"
);

assert.equal(
  sstPersistenceNoHistory
    .values
    .sampleCount,
  0
);

console.log(
  "PASS SST Persistence v1 remains unavailable without governed SST history"
);


const earlierSstObservationSnapshot = {
  ...historicalBackfillObservationSnapshot,

  observations: {
    sst: {
      temperatureFahrenheit:
        82
    }
  }
};

const earlierSstHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierSstObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-sst-test-location"
  });

const sstPersistenceSingleObservation =
  buildSeaSurfaceTemperaturePersistence({
    historicalSnapshots: [
      earlierSstHistoricalBackfill
    ]
  });

assert.equal(
  sstPersistenceSingleObservation.available,
  false
);

assert.equal(
  sstPersistenceSingleObservation.classification,
  "insufficient-history"
);

assert.equal(
  sstPersistenceSingleObservation
    .values
    .sampleCount,
  1
);

assert.equal(
  sstPersistenceSingleObservation
    .values
    .firstTemperatureFahrenheit,
  82
);

console.log(
  "PASS SST Persistence v1 requires two chronological SST observations"
);


const laterSstObservationSnapshot = {
  ...laterHistoricalObservationSnapshot,

  observations: {
    sst: {
      temperatureFahrenheit:
        84
    }
  }
};

const laterSstHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterSstObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-sst-test-location"
  });

const warmingSstPersistence =
  buildSeaSurfaceTemperaturePersistence({
    historicalSnapshots: [
      laterSstHistoricalBackfill,
      earlierSstHistoricalBackfill
    ]
  });

assert.equal(
  warmingSstPersistence.available,
  true
);

assert.equal(
  warmingSstPersistence.classification,
  "warming"
);

assert.equal(
  warmingSstPersistence.lifecycleState,
  "strengthening"
);

assert.equal(
  warmingSstPersistence
    .values
    .sampleCount,
  2
);

assert.equal(
  warmingSstPersistence
    .values
    .durationHours,
  24
);

assert.equal(
  warmingSstPersistence
    .values
    .firstTemperatureFahrenheit,
  82
);

assert.equal(
  warmingSstPersistence
    .values
    .lastTemperatureFahrenheit,
  84
);

assert.equal(
  warmingSstPersistence
    .values
    .temperatureChangeFahrenheit,
  2
);

assert.equal(
  warmingSstPersistence.contractVersion,
  "pelora-feature-persistence-v1"
);

console.log(
  "PASS SST Persistence v1 measures governed warming across Ocean Memory"
);


const oceanPersistenceWithSst =
  buildOceanPersistence({
    historicalSnapshots: [
      laterSstHistoricalBackfill,
      earlierSstHistoricalBackfill
    ]
  });

assert.equal(
  oceanPersistenceWithSst
    .featurePersistence
    .seaSurfaceTemperature
    .available,
  true
);

assert.equal(
  oceanPersistenceWithSst
    .featurePersistence
    .seaSurfaceTemperature
    .classification,
  "warming"
);

assert.equal(
  oceanPersistenceWithSst
    .values
    .assessedFeatureCount,
  1
);

console.log(
  "PASS Ocean Persistence v1 connects governed SST Persistence"
);

assert.equal(
  oceanPersistenceWithSst
    .featureContinuity
    .seaSurfaceTemperature
    .available,
  true
);

assert.equal(
  oceanPersistenceWithSst
    .continuitySummary
    .assessedContinuityCount,
  1
);

assert.equal(
  oceanPersistenceWithSst
    .continuitySummary
    .registeredContinuityCount,
  oceanPersistenceWithSst
    .values
    .registeredFeatureCount
);

assert.equal(
  oceanPersistenceWithSst
    .values
    .assessedFeatureCount,
  1
);

console.log(
  "PASS Ocean Persistence exposes governed SST continuity without changing assessedFeatureCount"
);

const sstEvolutionTimeSeries =
  buildOceanMemoryTimeSeries({
    historicalSnapshots: [
      earlierSstHistoricalBackfill,
      laterSstHistoricalBackfill
    ]
  });


const sstEvolutionChange =
  buildOceanChangeFromTimeSeries({
    timeSeries:
      sstEvolutionTimeSeries
  });


const governedOceanEvolution =
  buildOceanEvolution({
    oceanChange:
      sstEvolutionChange,

    oceanPersistence:
      oceanPersistenceWithSst
  });

  assert.equal(
  governedOceanEvolution.available,
  true
);

assert.equal(
  governedOceanEvolution
    .temporalWindow
    .sampleCount,
  oceanPersistenceWithSst
    .values
    .sampleCount
);

assert.equal(
  governedOceanEvolution
    .temporalWindow
    .firstObservedAt,
  oceanPersistenceWithSst
    .values
    .firstObservedAt
);

assert.equal(
  governedOceanEvolution
    .temporalWindow
    .lastObservedAt,
  oceanPersistenceWithSst
    .values
    .lastObservedAt
);

console.log(
  "PASS Ocean Evolution preserves the governed persistence observation window"
);


assert.equal(
  Object.keys(
    governedOceanEvolution
      .featureEvolution
  ).length,
  Object.keys(
    oceanPersistenceWithSst
      .featurePersistence
  ).length
);

for (
  const [
    featureKey,
    persistenceFeature
  ] of Object.entries(
    oceanPersistenceWithSst
      .featurePersistence
  )
) {
  const evolutionFeature =
    governedOceanEvolution
      .featureEvolution[
        featureKey
      ];

  assert.equal(
    evolutionFeature
      .featureType,
    persistenceFeature
      .featureType
  );

  assert.equal(
    evolutionFeature
      .featureFamily,
    persistenceFeature
      .featureFamily
  );

  assert.equal(
    evolutionFeature
      .lifecycleState,
    persistenceFeature
      .lifecycleState
  );

  assert.equal(
    evolutionFeature
      .persistenceClassification,
    persistenceFeature
      .classification
  );
}

console.log(
  "PASS Ocean Evolution dynamically inherits governed feature lifecycle states without inventing new states"
);


const governedLifecycleTotal =
  OCEAN_PERSISTENCE_LIFECYCLE_STATES
    .reduce(
      (
        total,
        lifecycleState
      ) =>
        total +
        governedOceanEvolution
          .lifecycleSummary[
            lifecycleState
          ],
      0
    );

assert.equal(
  governedLifecycleTotal +
    governedOceanEvolution
      .lifecycleSummary
      .unavailable,
  governedOceanEvolution
    .lifecycleSummary
    .registeredFeatureCount
);

assert.equal(
  governedOceanEvolution
    .lifecycleSummary
    .assessedFeatureCount,
  oceanPersistenceWithSst
    .values
    .assessedFeatureCount
);

console.log(
  "PASS Ocean Evolution summarizes the canonical lifecycle vocabulary across registered features"
);


assert.equal(
  governedOceanEvolution
    .changeContext
    .previousSnapshotId,
  sstEvolutionChange
    .source
    .previousSnapshotId
);

assert.equal(
  governedOceanEvolution
    .changeContext
    .currentSnapshotId,
  sstEvolutionChange
    .source
    .currentSnapshotId
);

assert.equal(
  governedOceanEvolution
    .changeContext
    .comparisonContractVersion,
  "pelora-ocean-change-analysis-v1"
);

console.log(
  "PASS Ocean Evolution preserves governed Ocean Change context"
);


assert.equal(
  governedOceanEvolution
    .upstreamContracts
    .oceanChange,
  "pelora-ocean-change-from-time-series-v1"
);

assert.equal(
  governedOceanEvolution
    .upstreamContracts
    .oceanPersistence,
  "pelora-ocean-persistence-v1"
);

assert.equal(
  governedOceanEvolution
    .upstreamContracts
    .timeSeries,
  "pelora-ocean-memory-time-series-v1"
);

assert.equal(
  governedOceanEvolution
    .contractVersion,
  "pelora-ocean-evolution-v1"
);

console.log(
  "PASS Ocean Evolution preserves governed temporal provenance"
);


assert.equal(
  Object.isFrozen(
    governedOceanEvolution
  ),
  true
);

assert.equal(
  Object.isFrozen(
    governedOceanEvolution
      .featureEvolution
  ),
  true
);

assert.equal(
  Object.isFrozen(
    governedOceanEvolution
      .lifecycleSummary
  ),
  true
);

assert.equal(
  Object.isFrozen(
    governedOceanEvolution
      .temporalWindow
  ),
  true
);

assert.ok(
  governedOceanEvolution
    .limitations
    .includes(
      "Ocean Evolution summarizes multiple feature trajectories and does not assign one lifecycle state to the entire ocean."
    )
);

assert.equal(
  governedOceanEvolution
    .species,
  undefined
);

assert.equal(
  governedOceanEvolution
    .guidance,
  undefined
);

assert.equal(
  governedOceanEvolution
    .opportunity,
  undefined
);

console.log(
  "PASS Ocean Evolution remains frozen, species-neutral, and non-prescriptive"
);

assert.equal(
  governedOceanEvolution
    .featureEvolution
    .seaSurfaceTemperature
    .continuity
    .available,
  oceanPersistenceWithSst
    .featureContinuity
    .seaSurfaceTemperature
    .available
);

assert.equal(
  governedOceanEvolution
    .featureEvolution
    .seaSurfaceTemperature
    .continuity
    .supported,
  oceanPersistenceWithSst
    .featureContinuity
    .seaSurfaceTemperature
    .continuity
    .supported
);

assert.equal(
  governedOceanEvolution
    .featureEvolution
    .seaSurfaceTemperature
    .continuity
    .classification,
  oceanPersistenceWithSst
    .featureContinuity
    .seaSurfaceTemperature
    .continuity
    .classification
);

assert.equal(
  governedOceanEvolution
    .featureEvolution
    .seaSurfaceTemperature
    .continuity
    .contractVersion,
  "pelora-temporal-feature-continuity-v1"
);

console.log(
  "PASS Ocean Evolution preserves governed Temporal Feature Continuity context"
);


assert.equal(
  governedOceanEvolution
    .featureEvolution
    .seaSurfaceTemperature
    .lifecycleState,
  oceanPersistenceWithSst
    .featurePersistence
    .seaSurfaceTemperature
    .lifecycleState
);

assert.equal(
  governedOceanEvolution
    .featureEvolution
    .seaSurfaceTemperature
    .persistenceClassification,
  oceanPersistenceWithSst
    .featurePersistence
    .seaSurfaceTemperature
    .classification
);

assert.equal(
  governedOceanEvolution
    .lifecycleSummary
    .assessedFeatureCount,
  oceanPersistenceWithSst
    .values
    .assessedFeatureCount
);

console.log(
  "PASS Ocean Evolution continuity context does not alter lifecycle or persistence semantics"
);


/**
 * ------------------------------------------------------------
 * Temporal Ocean Explainability v1.0
 * ------------------------------------------------------------
 */

const unavailableTemporalOceanExplainability =
  buildTemporalOceanExplainability({
    oceanEvolution:
      null
  });


assert.equal(
  unavailableTemporalOceanExplainability.available,
  false
);

assert.equal(
  unavailableTemporalOceanExplainability
    .explanationType,
  "temporal-ocean-explainability"
);

assert.equal(
  unavailableTemporalOceanExplainability
    .responsibility,
  "Explain"
);

assert.ok(
  unavailableTemporalOceanExplainability
    .missingRequirements
    .includes(
      "governed-ocean-evolution"
    )
);

console.log(
  "PASS Temporal Ocean Explainability remains unavailable without governed Ocean Evolution"
);


const temporalOceanExplainability =
  buildTemporalOceanExplainability({
    oceanEvolution:
      governedOceanEvolution
  });


assert.equal(
  temporalOceanExplainability.available,
  true
);

assert.equal(
  temporalOceanExplainability
    .interpretation,
  "species-neutral-temporal-ocean-explainability"
);

assert.equal(
  temporalOceanExplainability
    .temporalWindow
    .sampleCount,
  governedOceanEvolution
    .temporalWindow
    .sampleCount
);

console.log(
  "PASS Temporal Ocean Explainability preserves the governed temporal window"
);


assert.equal(
  Object.keys(
    temporalOceanExplainability
      .featureExplanations
  ).length,
  Object.keys(
    governedOceanEvolution
      .featureEvolution
  ).length
);


for (
  const [
    featureKey,
    evolutionFeature
  ] of Object.entries(
    governedOceanEvolution
      .featureEvolution
  )
) {
  const explainedFeature =
    temporalOceanExplainability
      .featureExplanations[
        featureKey
      ];

  assert.equal(
    explainedFeature
      .featureType,
    evolutionFeature
      .featureType
  );

  assert.equal(
    explainedFeature
      .featureFamily,
    evolutionFeature
      .featureFamily
  );

  assert.equal(
    explainedFeature
      .lifecycleState,
    evolutionFeature
      .lifecycleState
  );

  assert.equal(
    explainedFeature
      .persistenceClassification,
    evolutionFeature
      .persistenceClassification
  );
}

console.log(
  "PASS Temporal Ocean Explainability dynamically preserves governed feature evolution"
);

assert.equal(
  temporalOceanExplainability
    .featureExplanations
    .seaSurfaceTemperature
    .continuity
    .available,
  governedOceanEvolution
    .featureEvolution
    .seaSurfaceTemperature
    .continuity
    .available
);

assert.equal(
  temporalOceanExplainability
    .featureExplanations
    .seaSurfaceTemperature
    .continuity
    .supported,
  governedOceanEvolution
    .featureEvolution
    .seaSurfaceTemperature
    .continuity
    .supported
);

assert.equal(
  temporalOceanExplainability
    .featureExplanations
    .seaSurfaceTemperature
    .continuity
    .classification,
  governedOceanEvolution
    .featureEvolution
    .seaSurfaceTemperature
    .continuity
    .classification
);

assert.equal(
  temporalOceanExplainability
    .featureExplanations
    .seaSurfaceTemperature
    .continuity
    .contractVersion,
  "pelora-temporal-feature-continuity-v1"
);

console.log(
  "PASS Temporal Ocean Explainability preserves governed Temporal Feature Continuity context"
);

assert.equal(
  temporalOceanExplainability
    .featureExplanations
    .seaSurfaceTemperature
    .lifecycleState,
  governedOceanEvolution
    .featureEvolution
    .seaSurfaceTemperature
    .lifecycleState
);

assert.equal(
  temporalOceanExplainability
    .featureExplanations
    .seaSurfaceTemperature
    .physicalInterpretation,
  "The governed feature has strengthened across the observed temporal window."
);

assert.ok(
  temporalOceanExplainability
    .featureExplanations
    .seaSurfaceTemperature
    .evidenceBasis
    .includes(
      "governed-temporal-feature-continuity"
    )
);

assert.equal(
  temporalOceanExplainability
    .featureExplanations
    .seaSurfaceTemperature
    .featureMovementNm,
  undefined
);

console.log(
  "PASS Temporal Ocean Explainability uses continuity as evidence context without changing lifecycle interpretation or claiming movement"
);


const explainedSst =
  temporalOceanExplainability
    .featureExplanations
    .seaSurfaceTemperature;


assert.equal(
  explainedSst.available,
  true
);

assert.equal(
  explainedSst.lifecycleState,
  governedOceanEvolution
    .featureEvolution
    .seaSurfaceTemperature
    .lifecycleState
);

assert.equal(
  typeof explainedSst
    .physicalInterpretation,
  "string"
);

assert.ok(
  explainedSst
    .physicalInterpretation
    .length >
    0
);

assert.deepEqual(
  explainedSst
    .evidenceBasis,
  [
    "governed-ocean-evolution",
    "governed-feature-lifecycle",
    "governed-persistence-classification",
    "governed-temporal-feature-continuity"
  ]
);

console.log(
  "PASS Temporal Ocean Explainability translates governed lifecycle state into deterministic physical language"
);


assert.equal(
  temporalOceanExplainability
    .summary
    .assessedFeatureCount,
  governedOceanEvolution
    .lifecycleSummary
    .assessedFeatureCount
);

assert.equal(
  temporalOceanExplainability
    .summary
    .explainedFeatureCount,
  1
);

assert.equal(
  temporalOceanExplainability
    .summary
    .registeredFeatureCount,
  governedOceanEvolution
    .lifecycleSummary
    .registeredFeatureCount
);

console.log(
  "PASS Temporal Ocean Explainability summarizes explainable governed feature evolution"
);


assert.equal(
  temporalOceanExplainability
    .upstreamContracts
    .oceanEvolution,
  "pelora-ocean-evolution-v1"
);

assert.equal(
  temporalOceanExplainability
    .upstreamContracts
    .oceanPersistence,
  "pelora-ocean-persistence-v1"
);

assert.equal(
  temporalOceanExplainability
    .upstreamContracts
    .oceanChange,
  "pelora-ocean-change-from-time-series-v1"
);

assert.equal(
  temporalOceanExplainability
    .upstreamContracts
    .timeSeries,
  "pelora-ocean-memory-time-series-v1"
);

assert.equal(
  temporalOceanExplainability
    .contractVersion,
  "pelora-temporal-ocean-explainability-v1"
);

console.log(
  "PASS Temporal Ocean Explainability preserves governed temporal provenance"
);


assert.equal(
  Object.isFrozen(
    temporalOceanExplainability
  ),
  true
);

assert.equal(
  Object.isFrozen(
    temporalOceanExplainability
      .featureExplanations
  ),
  true
);

assert.equal(
  Object.isFrozen(
    temporalOceanExplainability
      .summary
  ),
  true
);

assert.equal(
  temporalOceanExplainability
    .species,
  undefined
);

assert.equal(
  temporalOceanExplainability
    .opportunity,
  undefined
);

assert.equal(
  temporalOceanExplainability
    .guidance,
  undefined
);

assert.ok(
  temporalOceanExplainability
    .limitations
    .includes(
      "Temporal Ocean Explainability does not infer physical causation beyond the governed upstream temporal contracts."
    )
);

console.log(
  "PASS Temporal Ocean Explainability remains frozen, Explain-only, species-neutral, and non-prescriptive"
);


/**
 * ------------------------------------------------------------
 * Current Persistence Analysis v1.0
 * ------------------------------------------------------------
 */

const currentPersistenceNoHistory =
  buildCurrentPersistence();

assert.equal(
  currentPersistenceNoHistory.available,
  false
);

assert.equal(
  currentPersistenceNoHistory.classification,
  "unavailable"
);

assert.equal(
  currentPersistenceNoHistory
    .values
    .sampleCount,
  0
);

console.log(
  "PASS Current Persistence v1 remains unavailable without governed current history"
);


const earlierCurrentObservationSnapshot = {
  ...historicalBackfillObservationSnapshot,

  observations: {
    currents: {
      speedKnots:
        1.0,

      directionDegrees:
        355
    }
  }
};

const earlierCurrentHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierCurrentObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-test-location"
  });

const currentPersistenceSingleObservation =
  buildCurrentPersistence({
    historicalSnapshots: [
      earlierCurrentHistoricalBackfill
    ]
  });

assert.equal(
  currentPersistenceSingleObservation.available,
  false
);

assert.equal(
  currentPersistenceSingleObservation.classification,
  "insufficient-history"
);

assert.equal(
  currentPersistenceSingleObservation
    .values
    .sampleCount,
  1
);

assert.equal(
  currentPersistenceSingleObservation
    .values
    .firstSpeedKnots,
  1
);

console.log(
  "PASS Current Persistence v1 requires two chronological current observations"
);


const laterCurrentObservationSnapshot = {
  ...laterHistoricalObservationSnapshot,

  observations: {
    currents: {
      speedKnots:
        1.5,

      directionDegrees:
        5
    }
  }
};

const laterCurrentHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterCurrentObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-test-location"
  });

const strengtheningCurrentPersistence =
  buildCurrentPersistence({
    historicalSnapshots: [
      laterCurrentHistoricalBackfill,
      earlierCurrentHistoricalBackfill
    ]
  });

assert.equal(
  strengtheningCurrentPersistence.available,
  true
);

assert.equal(
  strengtheningCurrentPersistence.classification,
  "strengthening-current-speed"
);

assert.equal(
  strengtheningCurrentPersistence.lifecycleState,
  "strengthening"
);

assert.equal(
  strengtheningCurrentPersistence
    .values
    .sampleCount,
  2
);

assert.equal(
  strengtheningCurrentPersistence
    .values
    .durationHours,
  24
);

assert.equal(
  strengtheningCurrentPersistence
    .values
    .firstSpeedKnots,
  1
);

assert.equal(
  strengtheningCurrentPersistence
    .values
    .lastSpeedKnots,
  1.5
);

assert.equal(
  strengtheningCurrentPersistence
    .values
    .speedChangeKnots,
  0.5
);

assert.equal(
  strengtheningCurrentPersistence
    .values
    .directionChangeDegrees,
  10
);

assert.equal(
  strengtheningCurrentPersistence
    .values
    .directionalStability,
  "stable"
);

console.log(
  "PASS Current Persistence v1 measures speed increase and circular direction stability"
);


const oceanPersistenceWithCurrent =
  buildOceanPersistence({
    historicalSnapshots: [
      laterCurrentHistoricalBackfill,
      earlierCurrentHistoricalBackfill
    ]
  });

assert.equal(
  oceanPersistenceWithCurrent
    .featurePersistence
    .current
    .available,
  true
);

assert.equal(
  oceanPersistenceWithCurrent
    .featurePersistence
    .current
    .classification,
  "strengthening-current-speed"
);

assert.equal(
  oceanPersistenceWithCurrent
    .values
    .assessedFeatureCount,
  1
);

console.log(
  "PASS Ocean Persistence v1 connects governed Current Persistence"
);

const stableLaterCurrentObservationSnapshot = {
  ...laterHistoricalObservationSnapshot,

  observations: {
    currents: {
      speedKnots:
        1.1,

      directionDegrees:
        2
    }
  }
};

const stableLaterCurrentHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      stableLaterCurrentObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-stable-test-location"
  });

const stableCurrentPersistence =
  buildCurrentPersistence({
    historicalSnapshots: [
      stableLaterCurrentHistoricalBackfill,
      earlierCurrentHistoricalBackfill
    ]
  });

assert.equal(
  stableCurrentPersistence.available,
  true
);

assert.equal(
  stableCurrentPersistence.classification,
  "stable-current-speed"
);

assert.equal(
  stableCurrentPersistence.lifecycleState,
  "stable"
);

assert.ok(
  Math.abs(
    stableCurrentPersistence
      .values
      .speedChangeKnots -
      0.1
  ) < 1e-9
);

assert.equal(
  stableCurrentPersistence
    .values
    .directionChangeDegrees,
  7
);

assert.equal(
  stableCurrentPersistence
    .values
    .directionalStability,
  "stable"
);

console.log(
  "PASS Current Persistence v1 preserves stable current speed and direction"
);


const weakeningEarlierCurrentObservationSnapshot = {
  ...historicalBackfillObservationSnapshot,

  observations: {
    currents: {
      speedKnots:
        1.5,

      directionDegrees:
        180
    }
  }
};

const weakeningEarlierCurrentHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      weakeningEarlierCurrentObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-weakening-test-location"
  });

const weakeningLaterCurrentObservationSnapshot = {
  ...laterHistoricalObservationSnapshot,

  observations: {
    currents: {
      speedKnots:
        1.0,

      directionDegrees:
        190
    }
  }
};

const weakeningLaterCurrentHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      weakeningLaterCurrentObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-weakening-test-location"
  });

const weakeningCurrentPersistence =
  buildCurrentPersistence({
    historicalSnapshots: [
      weakeningLaterCurrentHistoricalBackfill,
      weakeningEarlierCurrentHistoricalBackfill
    ]
  });

assert.equal(
  weakeningCurrentPersistence.available,
  true
);

assert.equal(
  weakeningCurrentPersistence.classification,
  "weakening-current-speed"
);

assert.equal(
  weakeningCurrentPersistence.lifecycleState,
  "weakening"
);

assert.equal(
  weakeningCurrentPersistence
    .values
    .speedChangeKnots,
  -0.5
);

assert.equal(
  weakeningCurrentPersistence
    .values
    .directionalStability,
  "stable"
);

console.log(
  "PASS Current Persistence v1 identifies weakening current speed"
);


const changingDirectionLaterObservationSnapshot = {
  ...laterHistoricalObservationSnapshot,

  observations: {
    currents: {
      speedKnots:
        1.1,

      directionDegrees:
        90
    }
  }
};

const changingDirectionLaterHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      changingDirectionLaterObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-direction-test-location"
  });

const changingDirectionCurrentPersistence =
  buildCurrentPersistence({
    historicalSnapshots: [
      changingDirectionLaterHistoricalBackfill,
      earlierCurrentHistoricalBackfill
    ]
  });

assert.equal(
  changingDirectionCurrentPersistence.available,
  true
);

assert.equal(
  changingDirectionCurrentPersistence.classification,
  "stable-current-speed"
);

assert.equal(
  changingDirectionCurrentPersistence.lifecycleState,
  "stable"
);

assert.equal(
  changingDirectionCurrentPersistence
    .values
    .directionChangeDegrees,
  95
);

assert.equal(
  changingDirectionCurrentPersistence
    .values
    .directionalStability,
  "changing"
);

assert.ok(
  changingDirectionCurrentPersistence
    .drivers
    .includes(
      "current-direction-changing"
    )
);

console.log(
  "PASS Current Persistence v1 distinguishes directional change from speed lifecycle"
);


const partialCurrentObservationSnapshot = {
  ...laterHistoricalObservationSnapshot,

  observations: {
    currents: {
      speedKnots:
        1.5
    }
  }
};

const partialCurrentHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      partialCurrentObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-partial-test-location"
  });

const filteredCurrentPersistence =
  buildCurrentPersistence({
    historicalSnapshots: [
      null,
      {},
      partialCurrentHistoricalBackfill,
      earlierCurrentHistoricalBackfill,
      earlierCurrentHistoricalBackfill
    ]
  });

assert.equal(
  filteredCurrentPersistence.available,
  false
);

assert.equal(
  filteredCurrentPersistence.classification,
  "insufficient-history"
);

assert.equal(
  filteredCurrentPersistence
    .values
    .sampleCount,
  1
);

assert.equal(
  filteredCurrentPersistence
    .values
    .firstSpeedKnots,
  1
);

assert.equal(
  filteredCurrentPersistence
    .values
    .firstDirectionDegrees,
  355
);

console.log(
  "PASS Current Persistence v1 excludes partial, invalid, and duplicate history"
);


/**
 * ------------------------------------------------------------
 * Current Edge Persistence Analysis v1.0
 * ------------------------------------------------------------
 */

const currentEdgePersistenceNoHistory =
  buildCurrentEdgePersistence();

assert.equal(
  currentEdgePersistenceNoHistory.available,
  false
);

assert.equal(
  currentEdgePersistenceNoHistory.classification,
  "unavailable"
);

assert.equal(
  currentEdgePersistenceNoHistory
    .values
    .sampleCount,
  0
);

console.log(
  "PASS Current Edge Persistence v1 remains unavailable without governed edge history"
);


const buildHistoricalCurrentEdgeSnapshot = ({
  baseObservationSnapshot,
  currentEdge,
  observedAt
}) => ({
  ...baseObservationSnapshot,

  observedAt,

  observations: {
    currents: {
      derived: {
        spatialAnalysis: {
          edge:
            currentEdge
        }
      }
    }
  }
});


const noEdgeContract = {
  available:
    true,

  currentEdgeDetected:
    false,

  edgeType:
    "no-edge-candidate",

  edgeState:
    "not-supported",

  edgeStrength:
    "none",

  contractVersion:
    "pelora-current-edge-v1"
};


const measurableEdgeContract = {
  available:
    true,

  currentEdgeDetected:
    true,

  edgeType:
    "current-edge-candidate",

  edgeState:
    "candidate",

  edgeStrength:
    "measurable",

  contractVersion:
    "pelora-current-edge-v1"
};


const pronouncedEdgeContract = {
  available:
    true,

  currentEdgeDetected:
    true,

  edgeType:
    "pronounced-current-edge-candidate",

  edgeState:
    "candidate",

  edgeStrength:
    "pronounced",

  contractVersion:
    "pelora-current-edge-v1"
};


const earlierNoEdgeObservationSnapshot =
  buildHistoricalCurrentEdgeSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    currentEdge:
      noEdgeContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterMeasurableEdgeObservationSnapshot =
  buildHistoricalCurrentEdgeSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    currentEdge:
      measurableEdgeContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierNoEdgeHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierNoEdgeObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-edge-test-location"
  });


const laterMeasurableEdgeHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterMeasurableEdgeObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-edge-test-location"
  });


const emergingCurrentEdgePersistence =
  buildCurrentEdgePersistence({
    historicalSnapshots: [
      laterMeasurableEdgeHistoricalBackfill,
      earlierNoEdgeHistoricalBackfill
    ]
  });

assert.equal(
  emergingCurrentEdgePersistence.available,
  true
);

assert.equal(
  emergingCurrentEdgePersistence.classification,
  "emerging-current-edge"
);

assert.equal(
  emergingCurrentEdgePersistence.lifecycleState,
  "emerging"
);

assert.equal(
  emergingCurrentEdgePersistence
    .values
    .firstEdgeDetected,
  false
);

assert.equal(
  emergingCurrentEdgePersistence
    .values
    .lastEdgeDetected,
  true
);

console.log(
  "PASS Current Edge Persistence v1 identifies an emerging current edge"
);


const earlierMeasurableEdgeObservationSnapshot =
  buildHistoricalCurrentEdgeSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    currentEdge:
      measurableEdgeContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterPronouncedEdgeObservationSnapshot =
  buildHistoricalCurrentEdgeSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    currentEdge:
      pronouncedEdgeContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierMeasurableEdgeHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierMeasurableEdgeObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-edge-strength-test-location"
  });


const laterPronouncedEdgeHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterPronouncedEdgeObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-edge-strength-test-location"
  });


const strengtheningCurrentEdgePersistence =
  buildCurrentEdgePersistence({
    historicalSnapshots: [
      laterPronouncedEdgeHistoricalBackfill,
      earlierMeasurableEdgeHistoricalBackfill
    ]
  });

assert.equal(
  strengtheningCurrentEdgePersistence.available,
  true
);

assert.equal(
  strengtheningCurrentEdgePersistence.classification,
  "strengthening-current-edge"
);

assert.equal(
  strengtheningCurrentEdgePersistence.lifecycleState,
  "strengthening"
);

assert.equal(
  strengtheningCurrentEdgePersistence
    .values
    .edgeStrengthChange,
  1
);

console.log(
  "PASS Current Edge Persistence v1 identifies strengthening edge support"
);


const fadingCurrentEdgePersistence =
  buildCurrentEdgePersistence({
    historicalSnapshots: [
      earlierNoEdgeHistoricalBackfill,
      laterMeasurableEdgeHistoricalBackfill
    ].reverse()
  });

assert.equal(
  fadingCurrentEdgePersistence.available,
  true
);

assert.equal(
  fadingCurrentEdgePersistence.classification,
  "emerging-current-edge"
);

console.log(
  "PASS Current Edge Persistence v1 sorts governed edge history chronologically"
);


const oceanPersistenceWithCurrentEdge =
  buildOceanPersistence({
    historicalSnapshots: [
      laterPronouncedEdgeHistoricalBackfill,
      earlierMeasurableEdgeHistoricalBackfill
    ]
  });

assert.equal(
  oceanPersistenceWithCurrentEdge
    .featurePersistence
    .currentEdge
    .available,
  true
);

assert.equal(
  oceanPersistenceWithCurrentEdge
    .featurePersistence
    .currentEdge
    .classification,
  "strengthening-current-edge"
);

assert.equal(
  oceanPersistenceWithCurrentEdge
    .values
    .assessedFeatureCount,
  1
);

console.log(
  "PASS Ocean Persistence v1 connects governed Current Edge Persistence"
);


/**
 * ------------------------------------------------------------
 * Current Shear Persistence Analysis v1.0
 * ------------------------------------------------------------
 */

const currentShearPersistenceNoHistory =
  buildCurrentShearPersistence();

assert.equal(
  currentShearPersistenceNoHistory.available,
  false
);

assert.equal(
  currentShearPersistenceNoHistory.classification,
  "unavailable"
);

assert.equal(
  currentShearPersistenceNoHistory
    .values
    .sampleCount,
  0
);

console.log(
  "PASS Current Shear Persistence v1 remains unavailable without governed shear history"
);


const buildHistoricalCurrentShearSnapshot = ({
  baseObservationSnapshot,
  currentShear,
  observedAt
}) => ({
  ...baseObservationSnapshot,

  observedAt,

  observations: {
    currents: {
      derived: {
        spatialAnalysis: {
          shear:
            currentShear
        }
      }
    }
  }
});


const noShearContract = {
  available:
    true,

  currentShearDetected:
    false,

  shearType:
    "no-shear-candidate",

  shearState:
    "not-supported",

  shearStrength:
    "none",

  evidence: {
    maximumTotalVectorGradientMetersPerSecondPerNauticalMile:
      0.005
  },

  contractVersion:
    "pelora-current-shear-v1"
};


const measurableShearContract = {
  available:
    true,

  currentShearDetected:
    true,

  shearType:
    "horizontal-shear-candidate",

  shearState:
    "candidate",

  shearStrength:
    "measurable",

  evidence: {
    maximumTotalVectorGradientMetersPerSecondPerNauticalMile:
      0.015
  },

  contractVersion:
    "pelora-current-shear-v1"
};


const pronouncedShearContract = {
  available:
    true,

  currentShearDetected:
    true,

  shearType:
    "pronounced-horizontal-shear-candidate",

  shearState:
    "candidate",

  shearStrength:
    "pronounced",

  evidence: {
    maximumTotalVectorGradientMetersPerSecondPerNauticalMile:
      0.025
  },

  contractVersion:
    "pelora-current-shear-v1"
};


const earlierNoShearObservationSnapshot =
  buildHistoricalCurrentShearSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    currentShear:
      noShearContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterMeasurableShearObservationSnapshot =
  buildHistoricalCurrentShearSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    currentShear:
      measurableShearContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierNoShearHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierNoShearObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-shear-test-location"
  });


const laterMeasurableShearHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterMeasurableShearObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-shear-test-location"
  });


const emergingCurrentShearPersistence =
  buildCurrentShearPersistence({
    historicalSnapshots: [
      laterMeasurableShearHistoricalBackfill,
      earlierNoShearHistoricalBackfill
    ]
  });

assert.equal(
  emergingCurrentShearPersistence.available,
  true
);

assert.equal(
  emergingCurrentShearPersistence.classification,
  "emerging-current-shear"
);

assert.equal(
  emergingCurrentShearPersistence.lifecycleState,
  "emerging"
);

assert.equal(
  emergingCurrentShearPersistence
    .values
    .firstShearDetected,
  false
);

assert.equal(
  emergingCurrentShearPersistence
    .values
    .lastShearDetected,
  true
);

console.log(
  "PASS Current Shear Persistence v1 identifies emerging current shear"
);


const earlierMeasurableShearObservationSnapshot =
  buildHistoricalCurrentShearSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    currentShear:
      measurableShearContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterPronouncedShearObservationSnapshot =
  buildHistoricalCurrentShearSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    currentShear:
      pronouncedShearContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierMeasurableShearHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierMeasurableShearObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-shear-strength-test-location"
  });


const laterPronouncedShearHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterPronouncedShearObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-shear-strength-test-location"
  });


const strengtheningCurrentShearPersistence =
  buildCurrentShearPersistence({
    historicalSnapshots: [
      laterPronouncedShearHistoricalBackfill,
      earlierMeasurableShearHistoricalBackfill
    ]
  });

assert.equal(
  strengtheningCurrentShearPersistence.available,
  true
);

assert.equal(
  strengtheningCurrentShearPersistence.classification,
  "strengthening-current-shear"
);

assert.equal(
  strengtheningCurrentShearPersistence.lifecycleState,
  "strengthening"
);

assert.equal(
  strengtheningCurrentShearPersistence
    .values
    .shearStrengthChange,
  1
);

assert.ok(
  Math.abs(
    strengtheningCurrentShearPersistence
      .values
      .maximumGradientChange -
      0.01
  ) < 1e-9
);

console.log(
  "PASS Current Shear Persistence v1 identifies strengthening shear and gradient change"
);


const oceanPersistenceWithCurrentShear =
  buildOceanPersistence({
    historicalSnapshots: [
      laterPronouncedShearHistoricalBackfill,
      earlierMeasurableShearHistoricalBackfill
    ]
  });

assert.equal(
  oceanPersistenceWithCurrentShear
    .featurePersistence
    .currentShear
    .available,
  true
);

assert.equal(
  oceanPersistenceWithCurrentShear
    .featurePersistence
    .currentShear
    .classification,
  "strengthening-current-shear"
);

assert.equal(
  oceanPersistenceWithCurrentShear
    .values
    .assessedFeatureCount,
  1
);

console.log(
  "PASS Ocean Persistence v1 connects governed Current Shear Persistence"
);


/**
 * ------------------------------------------------------------
 * Current Convergence Persistence Analysis v1.0
 * ------------------------------------------------------------
 */

const currentConvergencePersistenceNoHistory =
  buildCurrentConvergencePersistence();

assert.equal(
  currentConvergencePersistenceNoHistory.available,
  false
);

assert.equal(
  currentConvergencePersistenceNoHistory.classification,
  "unavailable"
);

assert.equal(
  currentConvergencePersistenceNoHistory
    .values
    .sampleCount,
  0
);

console.log(
  "PASS Current Convergence Persistence v1 remains unavailable without governed convergence history"
);


const buildHistoricalCurrentConvergenceSnapshot = ({
  baseObservationSnapshot,
  currentConvergence,
  observedAt
}) => ({
  ...baseObservationSnapshot,

  observedAt,

  observations: {
    currents: {
      derived: {
        spatialAnalysis: {
          convergence:
            currentConvergence
        }
      }
    }
  }
});


const noConvergenceContract = {
  available:
    true,

  convergenceType:
    "no-convergence-candidate",

  convergenceState:
    "not-supported",

  convergenceStrength:
    "none",

  evidence: {
    meanMeaningfulInwardMetersPerSecond:
      null,

    maximumInwardMetersPerSecond:
      0.02
  },

  contractVersion:
    "pelora-current-convergence-v1"
};


const measurableConvergenceContract = {
  available:
    true,

  convergenceType:
    "convergence-candidate",

  convergenceState:
    "candidate",

  convergenceStrength:
    "measurable",

  evidence: {
    meanMeaningfulInwardMetersPerSecond:
      0.08,

    maximumInwardMetersPerSecond:
      0.12
  },

  contractVersion:
    "pelora-current-convergence-v1"
};


const pronouncedConvergenceContract = {
  available:
    true,

  convergenceType:
    "pronounced-convergence-candidate",

  convergenceState:
    "candidate",

  convergenceStrength:
    "pronounced",

  evidence: {
    meanMeaningfulInwardMetersPerSecond:
      0.18,

    maximumInwardMetersPerSecond:
      0.22
  },

  contractVersion:
    "pelora-current-convergence-v1"
};


const earlierNoConvergenceObservationSnapshot =
  buildHistoricalCurrentConvergenceSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    currentConvergence:
      noConvergenceContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterMeasurableConvergenceObservationSnapshot =
  buildHistoricalCurrentConvergenceSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    currentConvergence:
      measurableConvergenceContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierNoConvergenceHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierNoConvergenceObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-convergence-test-location"
  });


const laterMeasurableConvergenceHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterMeasurableConvergenceObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-convergence-test-location"
  });


const emergingCurrentConvergencePersistence =
  buildCurrentConvergencePersistence({
    historicalSnapshots: [
      laterMeasurableConvergenceHistoricalBackfill,
      earlierNoConvergenceHistoricalBackfill
    ]
  });

assert.equal(
  emergingCurrentConvergencePersistence.available,
  true
);

assert.equal(
  emergingCurrentConvergencePersistence.classification,
  "emerging-current-convergence"
);

assert.equal(
  emergingCurrentConvergencePersistence.lifecycleState,
  "emerging"
);

assert.equal(
  emergingCurrentConvergencePersistence
    .values
    .firstConvergenceDetected,
  false
);

assert.equal(
  emergingCurrentConvergencePersistence
    .values
    .lastConvergenceDetected,
  true
);

console.log(
  "PASS Current Convergence Persistence v1 identifies emerging convergence"
);


const earlierMeasurableConvergenceObservationSnapshot =
  buildHistoricalCurrentConvergenceSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    currentConvergence:
      measurableConvergenceContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterPronouncedConvergenceObservationSnapshot =
  buildHistoricalCurrentConvergenceSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    currentConvergence:
      pronouncedConvergenceContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierMeasurableConvergenceHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierMeasurableConvergenceObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-convergence-strength-test-location"
  });


const laterPronouncedConvergenceHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterPronouncedConvergenceObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-current-convergence-strength-test-location"
  });


const strengtheningCurrentConvergencePersistence =
  buildCurrentConvergencePersistence({
    historicalSnapshots: [
      laterPronouncedConvergenceHistoricalBackfill,
      earlierMeasurableConvergenceHistoricalBackfill
    ]
  });

assert.equal(
  strengtheningCurrentConvergencePersistence.available,
  true
);

assert.equal(
  strengtheningCurrentConvergencePersistence.classification,
  "strengthening-current-convergence"
);

assert.equal(
  strengtheningCurrentConvergencePersistence.lifecycleState,
  "strengthening"
);

assert.equal(
  strengtheningCurrentConvergencePersistence
    .values
    .convergenceStrengthChange,
  1
);

assert.ok(
  Math.abs(
    strengtheningCurrentConvergencePersistence
      .values
      .meanInwardChangeMetersPerSecond -
      0.1
  ) < 1e-9
);

console.log(
  "PASS Current Convergence Persistence v1 identifies strengthening convergence and inward-flow change"
);


const oceanPersistenceWithCurrentConvergence =
  buildOceanPersistence({
    historicalSnapshots: [
      laterPronouncedConvergenceHistoricalBackfill,
      earlierMeasurableConvergenceHistoricalBackfill
    ]
  });

assert.equal(
  oceanPersistenceWithCurrentConvergence
    .featurePersistence
    .currentConvergence
    .available,
  true
);

assert.equal(
  oceanPersistenceWithCurrentConvergence
    .featurePersistence
    .currentConvergence
    .classification,
  "strengthening-current-convergence"
);

assert.equal(
  oceanPersistenceWithCurrentConvergence
    .values
    .assessedFeatureCount,
  1
);

console.log(
  "PASS Ocean Persistence v1 connects governed Current Convergence Persistence"
);


/**
 * ------------------------------------------------------------
 * Environmental Transition Persistence Analysis v1.0
 * ------------------------------------------------------------
 */

const environmentalTransitionPersistenceNoHistory =
  buildEnvironmentalTransitionPersistence();

assert.equal(
  environmentalTransitionPersistenceNoHistory.available,
  false
);

assert.equal(
  environmentalTransitionPersistenceNoHistory.classification,
  "unavailable"
);

assert.equal(
  environmentalTransitionPersistenceNoHistory
    .values
    .sampleCount,
  0
);

console.log(
  "PASS Environmental Transition Persistence v1 remains unavailable without governed transition history"
);


const buildHistoricalEnvironmentalTransitionSnapshot = ({
  baseObservationSnapshot,
  environmentalTransitionAnalysis,
  observedAt
}) => ({
  ...baseObservationSnapshot,

  observedAt,

  oceanPhysics: {
    ...(
      baseObservationSnapshot
        ?.oceanPhysics ??
      {}
    ),

    environmentalTransitionAnalysis
  }
});


const uniformEnvironmentalTransitionContract = {
  available:
    true,

  classification:
    "uniform-environmental-context",

  transitionType:
    "uniform",

  transitionState:
    "observed",

  transitionStrength:
    "none",

  evidence: {
    thermalTransitionSupported:
      false,

    hydrodynamicTransitionSupported:
      false,

    independentTransitionSignalCount:
      0
  },

  contractVersion:
    "pelora-environmental-transition-analysis-v1"
};


const measurableCombinedTransitionContract = {
  available:
    true,

  classification:
    "combined-environmental-transition-context",

  transitionType:
    "thermal-and-hydrodynamic",

  transitionState:
    "candidate-context",

  transitionStrength:
    "measurable",

  evidence: {
    thermalTransitionSupported:
      true,

    hydrodynamicTransitionSupported:
      true,

    independentTransitionSignalCount:
      2
  },

  contractVersion:
    "pelora-environmental-transition-analysis-v1"
};


const pronouncedMultiSignalTransitionContract = {
  available:
    true,

  classification:
    "multi-signal-environmental-transition-context",

  transitionType:
    "multi-signal",

  transitionState:
    "candidate-context",

  transitionStrength:
    "pronounced",

  evidence: {
    thermalTransitionSupported:
      true,

    hydrodynamicTransitionSupported:
      true,

    independentTransitionSignalCount:
      4
  },

  contractVersion:
    "pelora-environmental-transition-analysis-v1"
};


const earlierUniformEnvironmentalTransitionObservationSnapshot =
  buildHistoricalEnvironmentalTransitionSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    environmentalTransitionAnalysis:
      uniformEnvironmentalTransitionContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterMeasurableEnvironmentalTransitionObservationSnapshot =
  buildHistoricalEnvironmentalTransitionSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    environmentalTransitionAnalysis:
      measurableCombinedTransitionContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierUniformEnvironmentalTransitionHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierUniformEnvironmentalTransitionObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-environmental-transition-test-location"
  });


const laterMeasurableEnvironmentalTransitionHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterMeasurableEnvironmentalTransitionObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-environmental-transition-test-location"
  });


const emergingEnvironmentalTransitionPersistence =
  buildEnvironmentalTransitionPersistence({
    historicalSnapshots: [
      laterMeasurableEnvironmentalTransitionHistoricalBackfill,
      earlierUniformEnvironmentalTransitionHistoricalBackfill
    ]
  });

assert.equal(
  emergingEnvironmentalTransitionPersistence.available,
  true
);

assert.equal(
  emergingEnvironmentalTransitionPersistence.classification,
  "emerging-environmental-transition-context"
);

assert.equal(
  emergingEnvironmentalTransitionPersistence.lifecycleState,
  "emerging"
);

assert.equal(
  emergingEnvironmentalTransitionPersistence
    .values
    .firstTransitionContextSupported,
  false
);

assert.equal(
  emergingEnvironmentalTransitionPersistence
    .values
    .lastTransitionContextSupported,
  true
);

assert.equal(
  emergingEnvironmentalTransitionPersistence
    .values
    .transitionSignalCountChange,
  2
);

console.log(
  "PASS Environmental Transition Persistence v1 identifies emerging transition context"
);


const earlierMeasurableEnvironmentalTransitionObservationSnapshot =
  buildHistoricalEnvironmentalTransitionSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    environmentalTransitionAnalysis:
      measurableCombinedTransitionContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterPronouncedEnvironmentalTransitionObservationSnapshot =
  buildHistoricalEnvironmentalTransitionSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    environmentalTransitionAnalysis:
      pronouncedMultiSignalTransitionContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierMeasurableEnvironmentalTransitionHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierMeasurableEnvironmentalTransitionObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-environmental-transition-strength-test-location"
  });


const laterPronouncedEnvironmentalTransitionHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterPronouncedEnvironmentalTransitionObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-environmental-transition-strength-test-location"
  });


const strengtheningEnvironmentalTransitionPersistence =
  buildEnvironmentalTransitionPersistence({
    historicalSnapshots: [
      laterPronouncedEnvironmentalTransitionHistoricalBackfill,
      earlierMeasurableEnvironmentalTransitionHistoricalBackfill
    ]
  });

assert.equal(
  strengtheningEnvironmentalTransitionPersistence.available,
  true
);

assert.equal(
  strengtheningEnvironmentalTransitionPersistence.classification,
  "strengthening-environmental-transition-context"
);

assert.equal(
  strengtheningEnvironmentalTransitionPersistence.lifecycleState,
  "strengthening"
);

assert.equal(
  strengtheningEnvironmentalTransitionPersistence
    .values
    .transitionStrengthChange,
  1
);

assert.equal(
  strengtheningEnvironmentalTransitionPersistence
    .values
    .transitionSignalCountChange,
  2
);

assert.equal(
  strengtheningEnvironmentalTransitionPersistence
    .values
    .firstTransitionType,
  "thermal-and-hydrodynamic"
);

assert.equal(
  strengtheningEnvironmentalTransitionPersistence
    .values
    .lastTransitionType,
  "multi-signal"
);

console.log(
  "PASS Environmental Transition Persistence v1 identifies strengthening multi-signal context"
);


const oceanPersistenceWithEnvironmentalTransition =
  buildOceanPersistence({
    historicalSnapshots: [
      laterPronouncedEnvironmentalTransitionHistoricalBackfill,
      earlierMeasurableEnvironmentalTransitionHistoricalBackfill
    ]
  });

assert.equal(
  oceanPersistenceWithEnvironmentalTransition
    .featurePersistence
    .environmentalTransition
    .available,
  true
);

assert.equal(
  oceanPersistenceWithEnvironmentalTransition
    .featurePersistence
    .environmentalTransition
    .classification,
  "strengthening-environmental-transition-context"
);

assert.equal(
  oceanPersistenceWithEnvironmentalTransition
    .values
    .assessedFeatureCount,
  1
);

console.log(
  "PASS Ocean Persistence v1 connects governed Environmental Transition Persistence"
);


/**
 * ------------------------------------------------------------
 * Surface Water Character Persistence Analysis v1.0
 * ------------------------------------------------------------
 */

const surfaceWaterCharacterPersistenceNoHistory =
  buildSurfaceWaterCharacterPersistence();

assert.equal(
  surfaceWaterCharacterPersistenceNoHistory.available,
  false
);

assert.equal(
  surfaceWaterCharacterPersistenceNoHistory.classification,
  "unavailable"
);

assert.equal(
  surfaceWaterCharacterPersistenceNoHistory
    .values
    .sampleCount,
  0
);

console.log(
  "PASS Surface Water Character Persistence v1 remains unavailable without governed history"
);


const buildHistoricalSurfaceWaterCharacterSnapshot = ({
  baseObservationSnapshot,
  surfaceWaterCharacter,
  observedAt
}) => ({
  ...baseObservationSnapshot,

  observedAt,

  oceanPhysics: {
    ...(
      baseObservationSnapshot
        ?.oceanPhysics ??
      {}
    ),

    surfaceWaterCharacter
  }
});


const uniformSurfaceWaterCharacterContract = {
  available:
    true,

  classification:
    "uniform-thermal-surface-water-character",

  state:
    "observed",

  boundaryContext:
    "not-established",

  localCharacter: {
    temperatureAvailable:
      true,

    localTemperatureFahrenheit:
      82,

    temperatureBand:
      "warm",

    productivityAvailable:
      true,

    chlorophyllConcentrationMgM3:
      0.15,

    productivityClassification:
      "clear-blue-water",

    productivityFreshness:
      "current",

    clarityAvailable:
      true,

    clarityClassification:
      "clear-water"
  },

  spatialContext: {
    thermalCoverage:
      "sufficient",

    sufficientThermalCoverage:
      true,

    spatialTemperatureClassification:
      "uniform-water",

    thermalRangeFahrenheit:
      0.3,

    weakThermalTransition:
      false,

    moderateThermalTransition:
      false,

    strongThermalTransition:
      false,

    meaningfulThermalTransition:
      false,

    directionalThermalTransition:
      false,

    currentEdgeAvailable:
      true,

    currentEdgeDetected:
      false,

    currentEdgeType:
      "no-edge-candidate",

    currentEdgeStrength:
      "none"
  },

  contractVersion:
    "pelora-surface-water-character-v1"
};


const moderateBoundarySurfaceWaterCharacterContract = {
  available:
    true,

  classification:
    "surface-water-near-moderate-thermal-transition",

  state:
    "candidate-context",

  boundaryContext:
    "moderate-thermal-transition",

  localCharacter: {
    temperatureAvailable:
      true,

    localTemperatureFahrenheit:
      83,

    temperatureBand:
      "warm",

    productivityAvailable:
      true,

    chlorophyllConcentrationMgM3:
      0.2,

    productivityClassification:
      "clear-blue-water",

    productivityFreshness:
      "current",

    clarityAvailable:
      true,

    clarityClassification:
      "clear-water"
  },

  spatialContext: {
    thermalCoverage:
      "sufficient",

    sufficientThermalCoverage:
      true,

    spatialTemperatureClassification:
      "moderate-temperature-structure",

    thermalRangeFahrenheit:
      1.4,

    weakThermalTransition:
      false,

    moderateThermalTransition:
      true,

    strongThermalTransition:
      false,

    meaningfulThermalTransition:
      true,

    directionalThermalTransition:
      true,

    currentEdgeAvailable:
      true,

    currentEdgeDetected:
      false,

    currentEdgeType:
      "no-edge-candidate",

    currentEdgeStrength:
      "none"
  },

  contractVersion:
    "pelora-surface-water-character-v1"
};


const pronouncedCombinedSurfaceWaterCharacterContract = {
  available:
    true,

  classification:
    "combined-thermal-current-boundary-context",

  state:
    "candidate-context",

  boundaryContext:
    "pronounced-thermal-and-current-boundary",

  localCharacter: {
    temperatureAvailable:
      true,

    localTemperatureFahrenheit:
      84,

    temperatureBand:
      "warm",

    productivityAvailable:
      true,

    chlorophyllConcentrationMgM3:
      0.25,

    productivityClassification:
      "productive-blue-green-transition",

    productivityFreshness:
      "current",

    clarityAvailable:
      true,

    clarityClassification:
      "transitional-water"
  },

  spatialContext: {
    thermalCoverage:
      "sufficient",

    sufficientThermalCoverage:
      true,

    spatialTemperatureClassification:
      "strong-temperature-break-candidate",

    thermalRangeFahrenheit:
      3.2,

    weakThermalTransition:
      false,

    moderateThermalTransition:
      false,

    strongThermalTransition:
      true,

    meaningfulThermalTransition:
      true,

    directionalThermalTransition:
      true,

    currentEdgeAvailable:
      true,

    currentEdgeDetected:
      true,

    currentEdgeType:
      "pronounced-current-edge-candidate",

    currentEdgeStrength:
      "pronounced"
  },

  contractVersion:
    "pelora-surface-water-character-v1"
};


const earlierUniformSurfaceWaterCharacterObservationSnapshot =
  buildHistoricalSurfaceWaterCharacterSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    surfaceWaterCharacter:
      uniformSurfaceWaterCharacterContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterModerateSurfaceWaterCharacterObservationSnapshot =
  buildHistoricalSurfaceWaterCharacterSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    surfaceWaterCharacter:
      moderateBoundarySurfaceWaterCharacterContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierUniformSurfaceWaterCharacterHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierUniformSurfaceWaterCharacterObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-surface-water-character-test-location"
  });


const laterModerateSurfaceWaterCharacterHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterModerateSurfaceWaterCharacterObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-surface-water-character-test-location"
  });


const singleSurfaceWaterCharacterPersistence =
  buildSurfaceWaterCharacterPersistence({
    historicalSnapshots: [
      earlierUniformSurfaceWaterCharacterHistoricalBackfill
    ]
  });

assert.equal(
  singleSurfaceWaterCharacterPersistence.available,
  false
);

assert.equal(
  singleSurfaceWaterCharacterPersistence.classification,
  "insufficient-history"
);

assert.equal(
  singleSurfaceWaterCharacterPersistence
    .values
    .sampleCount,
  1
);

assert.equal(
  singleSurfaceWaterCharacterPersistence
    .values
    .firstBoundaryContext,
  "not-established"
);

console.log(
  "PASS Surface Water Character Persistence v1 requires two chronological contracts"
);


const emergingSurfaceWaterCharacterPersistence =
  buildSurfaceWaterCharacterPersistence({
    historicalSnapshots: [
      laterModerateSurfaceWaterCharacterHistoricalBackfill,
      earlierUniformSurfaceWaterCharacterHistoricalBackfill
    ]
  });

assert.equal(
  emergingSurfaceWaterCharacterPersistence.available,
  true
);

assert.equal(
  emergingSurfaceWaterCharacterPersistence.classification,
  "emerging-surface-water-boundary-context"
);

assert.equal(
  emergingSurfaceWaterCharacterPersistence.lifecycleState,
  "emerging"
);

assert.equal(
  emergingSurfaceWaterCharacterPersistence
    .values
    .sampleCount,
  2
);

assert.equal(
  emergingSurfaceWaterCharacterPersistence
    .values
    .durationHours,
  24
);

assert.equal(
  emergingSurfaceWaterCharacterPersistence
    .values
    .firstBoundaryContextSupported,
  false
);

assert.equal(
  emergingSurfaceWaterCharacterPersistence
    .values
    .lastBoundaryContextSupported,
  true
);

assert.equal(
  emergingSurfaceWaterCharacterPersistence
    .values
    .firstBoundaryContext,
  "not-established"
);

assert.equal(
  emergingSurfaceWaterCharacterPersistence
    .values
    .lastBoundaryContext,
  "moderate-thermal-transition"
);

assert.equal(
  emergingSurfaceWaterCharacterPersistence
    .values
    .boundaryStrengthChange,
  2
);

assert.equal(
  emergingSurfaceWaterCharacterPersistence
    .values
    .localTemperatureChangeFahrenheit,
  1
);

assert.ok(
  Math.abs(
    emergingSurfaceWaterCharacterPersistence
      .values
      .chlorophyllChangeMgM3 -
      0.05
  ) < 1e-9
);

assert.ok(
  Math.abs(
    emergingSurfaceWaterCharacterPersistence
      .values
      .thermalRangeChangeFahrenheit -
      1.1
  ) < 1e-9
);

console.log(
  "PASS Surface Water Character Persistence v1 identifies emerging boundary context"
);


const earlierModerateSurfaceWaterCharacterObservationSnapshot =
  buildHistoricalSurfaceWaterCharacterSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    surfaceWaterCharacter:
      moderateBoundarySurfaceWaterCharacterContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterPronouncedSurfaceWaterCharacterObservationSnapshot =
  buildHistoricalSurfaceWaterCharacterSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    surfaceWaterCharacter:
      pronouncedCombinedSurfaceWaterCharacterContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierModerateSurfaceWaterCharacterHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierModerateSurfaceWaterCharacterObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-surface-water-character-strength-test-location"
  });


const laterPronouncedSurfaceWaterCharacterHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterPronouncedSurfaceWaterCharacterObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-surface-water-character-strength-test-location"
  });


const strengtheningSurfaceWaterCharacterPersistence =
  buildSurfaceWaterCharacterPersistence({
    historicalSnapshots: [
      laterPronouncedSurfaceWaterCharacterHistoricalBackfill,
      earlierModerateSurfaceWaterCharacterHistoricalBackfill
    ]
  });

assert.equal(
  strengtheningSurfaceWaterCharacterPersistence.available,
  true
);

assert.equal(
  strengtheningSurfaceWaterCharacterPersistence.classification,
  "strengthening-surface-water-boundary-context"
);

assert.equal(
  strengtheningSurfaceWaterCharacterPersistence.lifecycleState,
  "strengthening"
);

assert.equal(
  strengtheningSurfaceWaterCharacterPersistence
    .values
    .boundaryStrengthChange,
  2
);

assert.equal(
  strengtheningSurfaceWaterCharacterPersistence
    .values
    .firstBoundaryContext,
  "moderate-thermal-transition"
);

assert.equal(
  strengtheningSurfaceWaterCharacterPersistence
    .values
    .lastBoundaryContext,
  "pronounced-thermal-and-current-boundary"
);

assert.equal(
  strengtheningSurfaceWaterCharacterPersistence
    .values
    .firstCurrentEdgeDetected,
  false
);

assert.equal(
  strengtheningSurfaceWaterCharacterPersistence
    .values
    .lastCurrentEdgeDetected,
  true
);

console.log(
  "PASS Surface Water Character Persistence v1 identifies strengthening combined boundary context"
);


const oceanPersistenceWithSurfaceWaterCharacter =
  buildOceanPersistence({
    historicalSnapshots: [
      laterPronouncedSurfaceWaterCharacterHistoricalBackfill,
      earlierModerateSurfaceWaterCharacterHistoricalBackfill
    ]
  });

assert.equal(
  oceanPersistenceWithSurfaceWaterCharacter
    .featurePersistence
    .surfaceWaterCharacter
    .available,
  true
);

assert.equal(
  oceanPersistenceWithSurfaceWaterCharacter
    .featurePersistence
    .surfaceWaterCharacter
    .classification,
  "strengthening-surface-water-boundary-context"
);

assert.equal(
  oceanPersistenceWithSurfaceWaterCharacter
    .values
    .assessedFeatureCount,
  1
);

console.log(
  "PASS Ocean Persistence v1 connects governed Surface Water Character Persistence"
);


/**
 * ------------------------------------------------------------
 * Water Mass Persistence Analysis v1.0
 * ------------------------------------------------------------
 */

const waterMassPersistenceNoHistory =
  buildWaterMassPersistence();

assert.equal(
  waterMassPersistenceNoHistory.available,
  false
);

assert.equal(
  waterMassPersistenceNoHistory.classification,
  "unavailable"
);

assert.equal(
  waterMassPersistenceNoHistory
    .values
    .sampleCount,
  0
);

console.log(
  "PASS Water Mass Persistence v1 remains unavailable without governed history"
);


const buildHistoricalWaterMassSnapshot = ({
  baseObservationSnapshot,
  waterMassAnalysis,
  observedAt
}) => ({
  ...baseObservationSnapshot,

  observedAt,

  oceanPhysics: {
    ...(
      baseObservationSnapshot
        ?.oceanPhysics ??
      {}
    ),

    waterMassAnalysis
  }
});


const uniformWaterMassContextContract = {
  available:
    true,

  classification:
    "uniform-surface-water-context",

  readinessState:
    "not-ready",

  waterMassDistinctionReady:
    false,

  distinctAdjacentWaterMassesEstablished:
    false,

  evidence: {
    surfaceCharacterAvailable:
      true,

    localCharacterVariables: [
      "temperature",
      "chlorophyll",
      "inferred-clarity"
    ],

    localCharacterVariableCount:
      3,

    spatialCharacterVariables:
      [],

    independentSpatialCharacterVariableCount:
      0,

    temperatureAvailable:
      true,

    temperatureCoverage:
      "sufficient",

    sufficientTemperatureCoverage:
      true,

    temperatureClassification:
      "uniform-water",

    spatialTemperatureClassification:
      "uniform-water",

    uniformThermalField:
      true,

    spatialThermalContrast:
      false,

    meaningfulSpatialThermalContrast:
      false,

    directionalThermalContrast:
      false,

    productivityAvailable:
      true,

    clarityAvailable:
      true,

    currentEdgeAvailable:
      true,

    currentEdgeDetected:
      false,

    currentEdgeType:
      "no-edge-candidate",

    currentEdgeStrength:
      "none",

    spatialChlorophyllAvailable:
      false,

    salinityAvailable:
      false,

    densityAvailable:
      false,

    verticalProfileAvailable:
      false,

    persistenceAvailable:
      false
  },

  missingRequirements: [
    "spatial-chlorophyll-structure",
    "spatial-salinity-structure",
    "density-structure",
    "vertical-water-column-profiles",
    "temporal-persistence",
    "second-independent-spatial-water-character-variable"
  ],

  contractVersion:
    "pelora-water-mass-analysis-v1"
};


const thermalContrastWaterMassContextContract = {
  available:
    true,

  classification:
    "single-variable-spatial-water-contrast",

  readinessState:
    "partially-ready",

  waterMassDistinctionReady:
    false,

  distinctAdjacentWaterMassesEstablished:
    false,

  evidence: {
    surfaceCharacterAvailable:
      true,

    localCharacterVariables: [
      "temperature",
      "chlorophyll",
      "inferred-clarity"
    ],

    localCharacterVariableCount:
      3,

    spatialCharacterVariables: [
      "temperature"
    ],

    independentSpatialCharacterVariableCount:
      1,

    temperatureAvailable:
      true,

    temperatureCoverage:
      "sufficient",

    sufficientTemperatureCoverage:
      true,

    temperatureClassification:
      "moderate-temperature-structure",

    spatialTemperatureClassification:
      "moderate-temperature-structure",

    uniformThermalField:
      false,

    spatialThermalContrast:
      true,

    meaningfulSpatialThermalContrast:
      true,

    directionalThermalContrast:
      true,

    productivityAvailable:
      true,

    clarityAvailable:
      true,

    currentEdgeAvailable:
      true,

    currentEdgeDetected:
      false,

    currentEdgeType:
      "no-edge-candidate",

    currentEdgeStrength:
      "none",

    spatialChlorophyllAvailable:
      false,

    salinityAvailable:
      false,

    densityAvailable:
      false,

    verticalProfileAvailable:
      false,

    persistenceAvailable:
      false
  },

  missingRequirements: [
    "spatial-chlorophyll-structure",
    "spatial-salinity-structure",
    "density-structure",
    "vertical-water-column-profiles",
    "temporal-persistence",
    "second-independent-spatial-water-character-variable"
  ],

  contractVersion:
    "pelora-water-mass-analysis-v1"
};


const combinedBoundaryWaterMassContextContract = {
  available:
    true,

  classification:
    "combined-boundary-context-without-water-mass-distinction",

  readinessState:
    "partially-ready",

  waterMassDistinctionReady:
    false,

  distinctAdjacentWaterMassesEstablished:
    false,

  evidence: {
    surfaceCharacterAvailable:
      true,

    localCharacterVariables: [
      "temperature",
      "chlorophyll",
      "inferred-clarity"
    ],

    localCharacterVariableCount:
      3,

    spatialCharacterVariables: [
      "temperature"
    ],

    independentSpatialCharacterVariableCount:
      1,

    temperatureAvailable:
      true,

    temperatureCoverage:
      "sufficient",

    sufficientTemperatureCoverage:
      true,

    temperatureClassification:
      "strong-temperature-break-candidate",

    spatialTemperatureClassification:
      "strong-temperature-break-candidate",

    uniformThermalField:
      false,

    spatialThermalContrast:
      true,

    meaningfulSpatialThermalContrast:
      true,

    directionalThermalContrast:
      true,

    productivityAvailable:
      true,

    clarityAvailable:
      true,

    currentEdgeAvailable:
      true,

    currentEdgeDetected:
      true,

    currentEdgeType:
      "pronounced-current-edge-candidate",

    currentEdgeStrength:
      "pronounced",

    spatialChlorophyllAvailable:
      false,

    salinityAvailable:
      false,

    densityAvailable:
      false,

    verticalProfileAvailable:
      false,

    persistenceAvailable:
      false
  },

  missingRequirements: [
    "spatial-chlorophyll-structure",
    "spatial-salinity-structure",
    "density-structure",
    "vertical-water-column-profiles",
    "temporal-persistence",
    "second-independent-spatial-water-character-variable"
  ],

  contractVersion:
    "pelora-water-mass-analysis-v1"
};


const earlierUniformWaterMassObservationSnapshot =
  buildHistoricalWaterMassSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    waterMassAnalysis:
      uniformWaterMassContextContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterThermalContrastWaterMassObservationSnapshot =
  buildHistoricalWaterMassSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    waterMassAnalysis:
      thermalContrastWaterMassContextContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierUniformWaterMassHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierUniformWaterMassObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-water-mass-test-location"
  });


const laterThermalContrastWaterMassHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterThermalContrastWaterMassObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-water-mass-test-location"
  });


const singleWaterMassPersistence =
  buildWaterMassPersistence({
    historicalSnapshots: [
      earlierUniformWaterMassHistoricalBackfill
    ]
  });

assert.equal(
  singleWaterMassPersistence.available,
  false
);

assert.equal(
  singleWaterMassPersistence.classification,
  "insufficient-history"
);

assert.equal(
  singleWaterMassPersistence
    .values
    .sampleCount,
  1
);

assert.equal(
  singleWaterMassPersistence
    .values
    .firstReadinessState,
  "not-ready"
);

console.log(
  "PASS Water Mass Persistence v1 requires two chronological contracts"
);


const strengtheningWaterMassPersistence =
  buildWaterMassPersistence({
    historicalSnapshots: [
      laterThermalContrastWaterMassHistoricalBackfill,
      earlierUniformWaterMassHistoricalBackfill
    ]
  });

assert.equal(
  strengtheningWaterMassPersistence.available,
  true
);

assert.equal(
  strengtheningWaterMassPersistence.classification,
  "strengthening-water-mass-distinction-context"
);

assert.equal(
  strengtheningWaterMassPersistence.lifecycleState,
  "strengthening"
);

assert.equal(
  strengtheningWaterMassPersistence
    .values
    .sampleCount,
  2
);

assert.equal(
  strengtheningWaterMassPersistence
    .values
    .durationHours,
  24
);

assert.equal(
  strengtheningWaterMassPersistence
    .values
    .firstReadinessState,
  "not-ready"
);

assert.equal(
  strengtheningWaterMassPersistence
    .values
    .lastReadinessState,
  "partially-ready"
);

assert.equal(
  strengtheningWaterMassPersistence
    .values
    .readinessChange,
  1
);

assert.equal(
  strengtheningWaterMassPersistence
    .values
    .firstIndependentSpatialCharacterVariableCount,
  0
);

assert.equal(
  strengtheningWaterMassPersistence
    .values
    .lastIndependentSpatialCharacterVariableCount,
  1
);

assert.equal(
  strengtheningWaterMassPersistence
    .values
    .spatialCharacterVariableCountChange,
  1
);

assert.equal(
  strengtheningWaterMassPersistence
    .values
    .firstSpatialThermalContrast,
  false
);

assert.equal(
  strengtheningWaterMassPersistence
    .values
    .lastSpatialThermalContrast,
  true
);

assert.equal(
  strengtheningWaterMassPersistence
    .values
    .firstWaterMassDistinctionReady,
  false
);

assert.equal(
  strengtheningWaterMassPersistence
    .values
    .lastWaterMassDistinctionReady,
  false
);

console.log(
  "PASS Water Mass Persistence v1 identifies strengthening distinction readiness"
);


const earlierThermalContrastWaterMassObservationSnapshot =
  buildHistoricalWaterMassSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    waterMassAnalysis:
      thermalContrastWaterMassContextContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterCombinedBoundaryWaterMassObservationSnapshot =
  buildHistoricalWaterMassSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    waterMassAnalysis:
      combinedBoundaryWaterMassContextContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierThermalContrastWaterMassHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierThermalContrastWaterMassObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-water-mass-boundary-test-location"
  });


const laterCombinedBoundaryWaterMassHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterCombinedBoundaryWaterMassObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-water-mass-boundary-test-location"
  });


const stableReadinessWaterMassPersistence =
  buildWaterMassPersistence({
    historicalSnapshots: [
      laterCombinedBoundaryWaterMassHistoricalBackfill,
      earlierThermalContrastWaterMassHistoricalBackfill
    ]
  });

assert.equal(
  stableReadinessWaterMassPersistence.available,
  true
);

assert.equal(
  stableReadinessWaterMassPersistence.classification,
  "stable-water-mass-distinction-context"
);

assert.equal(
  stableReadinessWaterMassPersistence.lifecycleState,
  "stable"
);

assert.equal(
  stableReadinessWaterMassPersistence
    .values
    .readinessChange,
  0
);

assert.equal(
  stableReadinessWaterMassPersistence
    .values
    .firstCurrentEdgeDetected,
  false
);

assert.equal(
  stableReadinessWaterMassPersistence
    .values
    .lastCurrentEdgeDetected,
  true
);

assert.equal(
  stableReadinessWaterMassPersistence
    .values
    .lastCurrentEdgeStrength,
  "pronounced"
);

assert.equal(
  stableReadinessWaterMassPersistence
    .values
    .lastDistinctAdjacentWaterMassesEstablished,
  false
);

console.log(
  "PASS Water Mass Persistence v1 preserves stronger boundary evidence without overstating readiness"
);


const oceanPersistenceWithWaterMass =
  buildOceanPersistence({
    historicalSnapshots: [
      laterThermalContrastWaterMassHistoricalBackfill,
      earlierUniformWaterMassHistoricalBackfill
    ]
  });

assert.equal(
  oceanPersistenceWithWaterMass
    .featurePersistence
    .waterMass
    .available,
  true
);

assert.equal(
  oceanPersistenceWithWaterMass
    .featurePersistence
    .waterMass
    .classification,
  "strengthening-water-mass-distinction-context"
);

assert.equal(
  oceanPersistenceWithWaterMass
    .featurePersistence
    .waterMass
    .featureType,
  "water-mass"
);

assert.equal(
  oceanPersistenceWithWaterMass
    .featurePersistence
    .waterMass
    .featureFamily,
  "integrated-ocean-physics"
);

assert.equal(
  oceanPersistenceWithWaterMass
    .values
    .assessedFeatureCount,
  1
);

console.log(
  "PASS Ocean Persistence v1 connects governed Water Mass Persistence"
);


/**
 * ------------------------------------------------------------
 * Mixing Zone Persistence Analysis v1.0
 * ------------------------------------------------------------
 */

const mixingZonePersistenceNoHistory =
  buildMixingZonePersistence();

assert.equal(
  mixingZonePersistenceNoHistory.available,
  false
);

assert.equal(
  mixingZonePersistenceNoHistory.classification,
  "unavailable"
);

assert.equal(
  mixingZonePersistenceNoHistory
    .values
    .sampleCount,
  0
);

console.log(
  "PASS Mixing Zone Persistence v1 remains unavailable without governed history"
);


const buildHistoricalMixingZoneSnapshot = ({
  baseObservationSnapshot,
  mixingZoneAnalysis,
  observedAt
}) => ({
  ...baseObservationSnapshot,

  observedAt,

  oceanPhysics: {
    ...(
      baseObservationSnapshot
        ?.oceanPhysics ??
      {}
    ),

    mixingZoneAnalysis
  }
});


const noMixingZoneContextContract = {
  available:
    true,

  classification:
    "no-mixing-zone-context",

  readinessState:
    "not-ready",

  interactionContext:
    "not-established",

  mixingZoneReady:
    false,

  mixingZoneDetected:
    false,

  evidence: {
    distinctAdjacentWaterMassesEstablished:
      false,

    waterMassDistinctionReady:
      false,

    spatialThermalContrast:
      false,

    meaningfulSpatialThermalContrast:
      false,

    directionalThermalContrast:
      false,

    currentEdgeDetected:
      false,

    convergenceDetected:
      false,

    shearDetected:
      false,

    hydrodynamicInteractionSignalCount:
      0,

    hydrodynamicInteractionSupported:
      false,

    combinedBoundaryContext:
      false,

    persistenceAvailable:
      false,

    verticalStructureAvailable:
      false,

    spatialSalinityAvailable:
      false,

    spatialChlorophyllAvailable:
      false
  },

  missingRequirements: [
    "distinct-adjacent-water-masses",
    "water-mass-distinction-readiness",
    "spatial-salinity-structure",
    "spatial-chlorophyll-structure",
    "vertical-water-column-structure",
    "temporal-persistence"
  ],

  contractVersion:
    "pelora-mixing-zone-analysis-v1"
};


const hydrodynamicMixingZoneContextContract = {
  available:
    true,

  classification:
    "hydrodynamic-boundary-context-without-water-mass-distinction",

  readinessState:
    "partially-ready",

  interactionContext:
    "hydrodynamic-boundary-only",

  mixingZoneReady:
    false,

  mixingZoneDetected:
    false,

  evidence: {
    distinctAdjacentWaterMassesEstablished:
      false,

    waterMassDistinctionReady:
      false,

    spatialThermalContrast:
      false,

    meaningfulSpatialThermalContrast:
      false,

    directionalThermalContrast:
      false,

    currentEdgeDetected:
      true,

    convergenceDetected:
      false,

    shearDetected:
      false,

    hydrodynamicInteractionSignalCount:
      1,

    hydrodynamicInteractionSupported:
      true,

    combinedBoundaryContext:
      false,

    persistenceAvailable:
      false,

    verticalStructureAvailable:
      false,

    spatialSalinityAvailable:
      false,

    spatialChlorophyllAvailable:
      false
  },

  missingRequirements: [
    "distinct-adjacent-water-masses",
    "water-mass-distinction-readiness",
    "spatial-salinity-structure",
    "spatial-chlorophyll-structure",
    "vertical-water-column-structure",
    "temporal-persistence"
  ],

  contractVersion:
    "pelora-mixing-zone-analysis-v1"
};


const combinedMixingZoneContextContract = {
  available:
    true,

  classification:
    "combined-boundary-interaction-context",

  readinessState:
    "partially-ready",

  interactionContext:
    "thermal-and-current-edge",

  mixingZoneReady:
    false,

  mixingZoneDetected:
    false,

  evidence: {
    distinctAdjacentWaterMassesEstablished:
      false,

    waterMassDistinctionReady:
      false,

    spatialThermalContrast:
      true,

    meaningfulSpatialThermalContrast:
      true,

    directionalThermalContrast:
      true,

    currentEdgeDetected:
      true,

    convergenceDetected:
      false,

    shearDetected:
      false,

    hydrodynamicInteractionSignalCount:
      1,

    hydrodynamicInteractionSupported:
      true,

    combinedBoundaryContext:
      true,

    persistenceAvailable:
      false,

    verticalStructureAvailable:
      false,

    spatialSalinityAvailable:
      false,

    spatialChlorophyllAvailable:
      false
  },

  missingRequirements: [
    "distinct-adjacent-water-masses",
    "water-mass-distinction-readiness",
    "spatial-salinity-structure",
    "spatial-chlorophyll-structure",
    "vertical-water-column-structure",
    "temporal-persistence"
  ],

  contractVersion:
    "pelora-mixing-zone-analysis-v1"
};


const multiSignalMixingZoneContextContract = {
  available:
    true,

  classification:
    "multi-signal-boundary-interaction-context",

  readinessState:
    "partially-ready",

  interactionContext:
    "thermal-and-multiple-current-signals",

  mixingZoneReady:
    false,

  mixingZoneDetected:
    false,

  evidence: {
    distinctAdjacentWaterMassesEstablished:
      false,

    waterMassDistinctionReady:
      false,

    spatialThermalContrast:
      true,

    meaningfulSpatialThermalContrast:
      true,

    directionalThermalContrast:
      true,

    currentEdgeDetected:
      true,

    convergenceDetected:
      true,

    shearDetected:
      true,

    hydrodynamicInteractionSignalCount:
      3,

    hydrodynamicInteractionSupported:
      true,

    combinedBoundaryContext:
      true,

    persistenceAvailable:
      false,

    verticalStructureAvailable:
      false,

    spatialSalinityAvailable:
      false,

    spatialChlorophyllAvailable:
      false
  },

  missingRequirements: [
    "distinct-adjacent-water-masses",
    "water-mass-distinction-readiness",
    "spatial-salinity-structure",
    "spatial-chlorophyll-structure",
    "vertical-water-column-structure",
    "temporal-persistence"
  ],

  contractVersion:
    "pelora-mixing-zone-analysis-v1"
};


const earlierNoMixingZoneObservationSnapshot =
  buildHistoricalMixingZoneSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    mixingZoneAnalysis:
      noMixingZoneContextContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterHydrodynamicMixingZoneObservationSnapshot =
  buildHistoricalMixingZoneSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    mixingZoneAnalysis:
      hydrodynamicMixingZoneContextContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierNoMixingZoneHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierNoMixingZoneObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-mixing-zone-test-location"
  });


const laterHydrodynamicMixingZoneHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterHydrodynamicMixingZoneObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-mixing-zone-test-location"
  });


const singleMixingZonePersistence =
  buildMixingZonePersistence({
    historicalSnapshots: [
      earlierNoMixingZoneHistoricalBackfill
    ]
  });

assert.equal(
  singleMixingZonePersistence.available,
  false
);

assert.equal(
  singleMixingZonePersistence.classification,
  "insufficient-history"
);

assert.equal(
  singleMixingZonePersistence
    .values
    .sampleCount,
  1
);

assert.equal(
  singleMixingZonePersistence
    .values
    .firstInteractionContext,
  "not-established"
);

console.log(
  "PASS Mixing Zone Persistence v1 requires two chronological contracts"
);


const emergingMixingZonePersistence =
  buildMixingZonePersistence({
    historicalSnapshots: [
      laterHydrodynamicMixingZoneHistoricalBackfill,
      earlierNoMixingZoneHistoricalBackfill
    ]
  });

assert.equal(
  emergingMixingZonePersistence.available,
  true
);

assert.equal(
  emergingMixingZonePersistence.classification,
  "emerging-mixing-zone-interaction-context"
);

assert.equal(
  emergingMixingZonePersistence.lifecycleState,
  "emerging"
);

assert.equal(
  emergingMixingZonePersistence
    .values
    .sampleCount,
  2
);

assert.equal(
  emergingMixingZonePersistence
    .values
    .durationHours,
  24
);

assert.equal(
  emergingMixingZonePersistence
    .values
    .firstHydrodynamicInteractionSupported,
  false
);

assert.equal(
  emergingMixingZonePersistence
    .values
    .lastHydrodynamicInteractionSupported,
  true
);

assert.equal(
  emergingMixingZonePersistence
    .values
    .firstHydrodynamicInteractionSignalCount,
  0
);

assert.equal(
  emergingMixingZonePersistence
    .values
    .lastHydrodynamicInteractionSignalCount,
  1
);

assert.equal(
  emergingMixingZonePersistence
    .values
    .hydrodynamicSignalCountChange,
  1
);

assert.equal(
  emergingMixingZonePersistence
    .values
    .firstInteractionContext,
  "not-established"
);

assert.equal(
  emergingMixingZonePersistence
    .values
    .lastInteractionContext,
  "hydrodynamic-boundary-only"
);

console.log(
  "PASS Mixing Zone Persistence v1 identifies emerging interaction context"
);


const earlierCombinedMixingZoneObservationSnapshot =
  buildHistoricalMixingZoneSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    mixingZoneAnalysis:
      combinedMixingZoneContextContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterMultiSignalMixingZoneObservationSnapshot =
  buildHistoricalMixingZoneSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    mixingZoneAnalysis:
      multiSignalMixingZoneContextContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierCombinedMixingZoneHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierCombinedMixingZoneObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-mixing-zone-strength-test-location"
  });


const laterMultiSignalMixingZoneHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterMultiSignalMixingZoneObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-mixing-zone-strength-test-location"
  });


const strengtheningMixingZonePersistence =
  buildMixingZonePersistence({
    historicalSnapshots: [
      laterMultiSignalMixingZoneHistoricalBackfill,
      earlierCombinedMixingZoneHistoricalBackfill
    ]
  });

assert.equal(
  strengtheningMixingZonePersistence.available,
  true
);

assert.equal(
  strengtheningMixingZonePersistence.classification,
  "strengthening-mixing-zone-interaction-context"
);

assert.equal(
  strengtheningMixingZonePersistence.lifecycleState,
  "strengthening"
);

assert.equal(
  strengtheningMixingZonePersistence
    .values
    .readinessChange,
  0
);

assert.equal(
  strengtheningMixingZonePersistence
    .values
    .interactionStrengthChange,
  1
);

assert.equal(
  strengtheningMixingZonePersistence
    .values
    .firstHydrodynamicInteractionSignalCount,
  1
);

assert.equal(
  strengtheningMixingZonePersistence
    .values
    .lastHydrodynamicInteractionSignalCount,
  3
);

assert.equal(
  strengtheningMixingZonePersistence
    .values
    .hydrodynamicSignalCountChange,
  2
);

assert.equal(
  strengtheningMixingZonePersistence
    .values
    .firstInteractionContext,
  "thermal-and-current-edge"
);

assert.equal(
  strengtheningMixingZonePersistence
    .values
    .lastInteractionContext,
  "thermal-and-multiple-current-signals"
);

assert.equal(
  strengtheningMixingZonePersistence
    .values
    .firstCombinedBoundaryContext,
  true
);

assert.equal(
  strengtheningMixingZonePersistence
    .values
    .lastCombinedBoundaryContext,
  true
);

assert.equal(
  strengtheningMixingZonePersistence
    .values
    .lastMixingZoneDetected,
  false
);

console.log(
  "PASS Mixing Zone Persistence v1 identifies strengthening multi-signal context"
);


const oceanPersistenceWithMixingZone =
  buildOceanPersistence({
    historicalSnapshots: [
      laterMultiSignalMixingZoneHistoricalBackfill,
      earlierCombinedMixingZoneHistoricalBackfill
    ]
  });

assert.equal(
  oceanPersistenceWithMixingZone
    .featurePersistence
    .mixingZone
    .available,
  true
);

assert.equal(
  oceanPersistenceWithMixingZone
    .featurePersistence
    .mixingZone
    .classification,
  "strengthening-mixing-zone-interaction-context"
);

assert.equal(
  oceanPersistenceWithMixingZone
    .featurePersistence
    .mixingZone
    .featureType,
  "mixing-zone"
);

assert.equal(
  oceanPersistenceWithMixingZone
    .featurePersistence
    .mixingZone
    .featureFamily,
  "integrated-ocean-physics"
);

assert.equal(
  oceanPersistenceWithMixingZone
    .values
    .assessedFeatureCount,
  1
);

console.log(
  "PASS Ocean Persistence v1 connects governed Mixing Zone Persistence"
);


/**
 * ------------------------------------------------------------
 * Ocean Front Persistence Analysis v1.0
 * ------------------------------------------------------------
 */

const oceanFrontPersistenceNoHistory =
  buildOceanFrontPersistence();

assert.equal(
  oceanFrontPersistenceNoHistory.available,
  false
);

assert.equal(
  oceanFrontPersistenceNoHistory.classification,
  "unavailable"
);

assert.equal(
  oceanFrontPersistenceNoHistory
    .values
    .sampleCount,
  0
);

console.log(
  "PASS Ocean Front Persistence v1 remains unavailable without governed history"
);


const buildHistoricalOceanFrontSnapshot = ({
  baseObservationSnapshot,
  oceanFrontAnalysis,
  observedAt
}) => ({
  ...baseObservationSnapshot,

  observedAt,

  oceanPhysics: {
    ...(
      baseObservationSnapshot
        ?.oceanPhysics ??
      {}
    ),

    oceanFrontAnalysis
  }
});


const noOceanFrontContextContract = {
  available:
    true,

  classification:
    "no-ocean-front-context",

  frontType:
    "none",

  frontState:
    "not-supported",

  frontStrength:
    "none",

  oceanFrontReady:
    false,

  oceanFrontDetected:
    false,

  evidence: {
    environmentalTransitionAvailable:
      true,

    environmentalTransitionClassification:
      "uniform-environmental-context",

    environmentalTransitionState:
      "observed",

    environmentalTransitionStrength:
      "none",

    thermalTransitionSupported:
      false,

    meaningfulThermalTransition:
      false,

    directionalThermalTransition:
      false,

    hydrodynamicTransitionSupported:
      false,

    hydrodynamicSignalCount:
      0,

    combinedThermalCurrentContext:
      false,

    multiSignalEnvironmentalContext:
      false,

    currentEdgeDetected:
      false,

    sufficientFrontEvidence:
      false,

    corroboratingFrontContext:
      false,

    distinctAdjacentWaterMassesEstablished:
      false,

    waterMassDistinctionReady:
      false,

    independentSpatialCharacterVariableCount:
      0,

    crossBoundaryWaterCharacterAvailable:
      false,

    mixingZoneDetected:
      false,

    mixingZoneReady:
      false,

    mixingInteractionContext:
      false,

    persistenceAvailable:
      false,

    fullWaterColumnStructureAvailable:
      false
  },

  missingRequirements: [
    "second-independent-spatial-water-character-variable",
    "distinct-adjacent-water-masses",
    "water-mass-distinction-readiness",
    "mixing-zone-readiness",
    "temporal-persistence",
    "full-water-column-structure"
  ],

  contractVersion:
    "pelora-ocean-front-analysis-v1"
};


const thermalOnlyOceanFrontContextContract = {
  available:
    true,

  classification:
    "thermal-boundary-without-front-support",

  frontType:
    "thermal-only",

  frontState:
    "incomplete-support",

  frontStrength:
    "measurable",

  oceanFrontReady:
    false,

  oceanFrontDetected:
    false,

  evidence: {
    environmentalTransitionAvailable:
      true,

    environmentalTransitionClassification:
      "thermal-environmental-transition-context",

    environmentalTransitionState:
      "candidate-context",

    environmentalTransitionStrength:
      "measurable",

    thermalTransitionSupported:
      true,

    meaningfulThermalTransition:
      true,

    directionalThermalTransition:
      true,

    hydrodynamicTransitionSupported:
      false,

    hydrodynamicSignalCount:
      0,

    combinedThermalCurrentContext:
      false,

    multiSignalEnvironmentalContext:
      false,

    currentEdgeDetected:
      false,

    sufficientFrontEvidence:
      false,

    corroboratingFrontContext:
      false,

    distinctAdjacentWaterMassesEstablished:
      false,

    waterMassDistinctionReady:
      false,

    independentSpatialCharacterVariableCount:
      1,

    crossBoundaryWaterCharacterAvailable:
      false,

    mixingZoneDetected:
      false,

    mixingZoneReady:
      false,

    mixingInteractionContext:
      false,

    persistenceAvailable:
      false,

    fullWaterColumnStructureAvailable:
      false
  },

  missingRequirements: [
    "second-independent-spatial-water-character-variable",
    "distinct-adjacent-water-masses",
    "water-mass-distinction-readiness",
    "mixing-zone-readiness",
    "temporal-persistence",
    "full-water-column-structure"
  ],

  contractVersion:
    "pelora-ocean-front-analysis-v1"
};


const measurableOceanFrontCandidateContract = {
  available:
    true,

  classification:
    "ocean-front-candidate-context",

  frontType:
    "thermal-current-boundary",

  frontState:
    "candidate-context",

  frontStrength:
    "measurable",

  oceanFrontReady:
    false,

  oceanFrontDetected:
    false,

  evidence: {
    environmentalTransitionAvailable:
      true,

    environmentalTransitionClassification:
      "combined-environmental-transition-context",

    environmentalTransitionState:
      "candidate-context",

    environmentalTransitionStrength:
      "measurable",

    thermalTransitionSupported:
      true,

    meaningfulThermalTransition:
      true,

    directionalThermalTransition:
      true,

    hydrodynamicTransitionSupported:
      true,

    hydrodynamicSignalCount:
      1,

    combinedThermalCurrentContext:
      true,

    multiSignalEnvironmentalContext:
      false,

    currentEdgeDetected:
      true,

    sufficientFrontEvidence:
      true,

    corroboratingFrontContext:
      false,

    distinctAdjacentWaterMassesEstablished:
      false,

    waterMassDistinctionReady:
      false,

    independentSpatialCharacterVariableCount:
      1,

    crossBoundaryWaterCharacterAvailable:
      false,

    mixingZoneDetected:
      false,

    mixingZoneReady:
      false,

    mixingInteractionContext:
      false,

    persistenceAvailable:
      false,

    fullWaterColumnStructureAvailable:
      false
  },

  missingRequirements: [
    "second-independent-spatial-water-character-variable",
    "distinct-adjacent-water-masses",
    "water-mass-distinction-readiness",
    "mixing-zone-readiness",
    "temporal-persistence",
    "full-water-column-structure"
  ],

  contractVersion:
    "pelora-ocean-front-analysis-v1"
};


const pronouncedMultiSignalOceanFrontContract = {
  available:
    true,

  classification:
    "multi-signal-ocean-front-candidate-context",

  frontType:
    "multi-signal-surface-boundary",

  frontState:
    "candidate-context",

  frontStrength:
    "pronounced",

  oceanFrontReady:
    false,

  oceanFrontDetected:
    false,

  evidence: {
    environmentalTransitionAvailable:
      true,

    environmentalTransitionClassification:
      "multi-signal-environmental-transition-context",

    environmentalTransitionState:
      "candidate-context",

    environmentalTransitionStrength:
      "pronounced",

    thermalTransitionSupported:
      true,

    meaningfulThermalTransition:
      true,

    directionalThermalTransition:
      true,

    hydrodynamicTransitionSupported:
      true,

    hydrodynamicSignalCount:
      3,

    combinedThermalCurrentContext:
      true,

    multiSignalEnvironmentalContext:
      true,

    currentEdgeDetected:
      true,

    sufficientFrontEvidence:
      true,

    corroboratingFrontContext:
      true,

    distinctAdjacentWaterMassesEstablished:
      false,

    waterMassDistinctionReady:
      false,

    independentSpatialCharacterVariableCount:
      1,

    crossBoundaryWaterCharacterAvailable:
      false,

    mixingZoneDetected:
      false,

    mixingZoneReady:
      false,

    mixingInteractionContext:
      true,

    persistenceAvailable:
      false,

    fullWaterColumnStructureAvailable:
      false
  },

  missingRequirements: [
    "second-independent-spatial-water-character-variable",
    "distinct-adjacent-water-masses",
    "water-mass-distinction-readiness",
    "mixing-zone-readiness",
    "temporal-persistence",
    "full-water-column-structure"
  ],

  contractVersion:
    "pelora-ocean-front-analysis-v1"
};


const earlierNoOceanFrontObservationSnapshot =
  buildHistoricalOceanFrontSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    oceanFrontAnalysis:
      noOceanFrontContextContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterThermalOnlyOceanFrontObservationSnapshot =
  buildHistoricalOceanFrontSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    oceanFrontAnalysis:
      thermalOnlyOceanFrontContextContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierNoOceanFrontHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierNoOceanFrontObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-ocean-front-test-location"
  });


const laterThermalOnlyOceanFrontHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterThermalOnlyOceanFrontObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-ocean-front-test-location"
  });


const singleOceanFrontPersistence =
  buildOceanFrontPersistence({
    historicalSnapshots: [
      earlierNoOceanFrontHistoricalBackfill
    ]
  });

assert.equal(
  singleOceanFrontPersistence.available,
  false
);

assert.equal(
  singleOceanFrontPersistence.classification,
  "insufficient-history"
);

assert.equal(
  singleOceanFrontPersistence
    .values
    .sampleCount,
  1
);

assert.equal(
  singleOceanFrontPersistence
    .values
    .firstFrontStrength,
  "none"
);

console.log(
  "PASS Ocean Front Persistence v1 requires two chronological contracts"
);


const emergingOceanFrontPersistence =
  buildOceanFrontPersistence({
    historicalSnapshots: [
      laterThermalOnlyOceanFrontHistoricalBackfill,
      earlierNoOceanFrontHistoricalBackfill
    ]
  });

assert.equal(
  emergingOceanFrontPersistence.available,
  true
);

assert.equal(
  emergingOceanFrontPersistence.classification,
  "emerging-ocean-front-context"
);

assert.equal(
  emergingOceanFrontPersistence.lifecycleState,
  "emerging"
);

assert.equal(
  emergingOceanFrontPersistence
    .values
    .sampleCount,
  2
);

assert.equal(
  emergingOceanFrontPersistence
    .values
    .durationHours,
  24
);

assert.equal(
  emergingOceanFrontPersistence
    .values
    .firstFrontContextSupported,
  false
);

assert.equal(
  emergingOceanFrontPersistence
    .values
    .lastFrontContextSupported,
  true
);

assert.equal(
  emergingOceanFrontPersistence
    .values
    .firstFrontType,
  "none"
);

assert.equal(
  emergingOceanFrontPersistence
    .values
    .lastFrontType,
  "thermal-only"
);

assert.equal(
  emergingOceanFrontPersistence
    .values
    .frontStrengthChange,
  2
);

assert.equal(
  emergingOceanFrontPersistence
    .values
    .lastOceanFrontDetected,
  false
);

console.log(
  "PASS Ocean Front Persistence v1 identifies emerging front context"
);


const earlierMeasurableOceanFrontObservationSnapshot =
  buildHistoricalOceanFrontSnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    oceanFrontAnalysis:
      measurableOceanFrontCandidateContract,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterPronouncedOceanFrontObservationSnapshot =
  buildHistoricalOceanFrontSnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    oceanFrontAnalysis:
      pronouncedMultiSignalOceanFrontContract,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierMeasurableOceanFrontHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierMeasurableOceanFrontObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-ocean-front-strength-test-location"
  });


const laterPronouncedOceanFrontHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterPronouncedOceanFrontObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-ocean-front-strength-test-location"
  });


const strengtheningOceanFrontPersistence =
  buildOceanFrontPersistence({
    historicalSnapshots: [
      laterPronouncedOceanFrontHistoricalBackfill,
      earlierMeasurableOceanFrontHistoricalBackfill
    ]
  });

assert.equal(
  strengtheningOceanFrontPersistence.available,
  true
);

assert.equal(
  strengtheningOceanFrontPersistence.classification,
  "strengthening-ocean-front-context"
);

assert.equal(
  strengtheningOceanFrontPersistence.lifecycleState,
  "strengthening"
);

assert.equal(
  strengtheningOceanFrontPersistence
    .values
    .frontStrengthChange,
  1
);

assert.equal(
  strengtheningOceanFrontPersistence
    .values
    .firstHydrodynamicSignalCount,
  1
);

assert.equal(
  strengtheningOceanFrontPersistence
    .values
    .lastHydrodynamicSignalCount,
  3
);

assert.equal(
  strengtheningOceanFrontPersistence
    .values
    .hydrodynamicSignalCountChange,
  2
);

assert.equal(
  strengtheningOceanFrontPersistence
    .values
    .firstFrontType,
  "thermal-current-boundary"
);

assert.equal(
  strengtheningOceanFrontPersistence
    .values
    .lastFrontType,
  "multi-signal-surface-boundary"
);

assert.equal(
  strengtheningOceanFrontPersistence
    .values
    .firstCorroboratingFrontContext,
  false
);

assert.equal(
  strengtheningOceanFrontPersistence
    .values
    .lastCorroboratingFrontContext,
  true
);

assert.equal(
  strengtheningOceanFrontPersistence
    .values
    .firstMixingInteractionContext,
  false
);

assert.equal(
  strengtheningOceanFrontPersistence
    .values
    .lastMixingInteractionContext,
  true
);

assert.equal(
  strengtheningOceanFrontPersistence
    .values
    .lastOceanFrontReady,
  false
);

assert.equal(
  strengtheningOceanFrontPersistence
    .values
    .lastOceanFrontDetected,
  false
);

console.log(
  "PASS Ocean Front Persistence v1 identifies strengthening multi-signal front context"
);


const oceanPersistenceWithOceanFront =
  buildOceanPersistence({
    historicalSnapshots: [
      laterPronouncedOceanFrontHistoricalBackfill,
      earlierMeasurableOceanFrontHistoricalBackfill
    ]
  });

assert.equal(
  oceanPersistenceWithOceanFront
    .featurePersistence
    .oceanFront
    .available,
  true
);

assert.equal(
  oceanPersistenceWithOceanFront
    .featurePersistence
    .oceanFront
    .classification,
  "strengthening-ocean-front-context"
);

assert.equal(
  oceanPersistenceWithOceanFront
    .featurePersistence
    .oceanFront
    .featureType,
  "ocean-front"
);

assert.equal(
  oceanPersistenceWithOceanFront
    .featurePersistence
    .oceanFront
    .featureFamily,
  "integrated-ocean-physics"
);

assert.equal(
  oceanPersistenceWithOceanFront
    .values
    .assessedFeatureCount,
  1
);

console.log(
  "PASS Ocean Persistence v1 connects governed Ocean Front Persistence"
);


/**
 * ------------------------------------------------------------
 * Productivity Persistence Analysis v1.0
 * ------------------------------------------------------------
 */

const productivityPersistenceNoHistory =
  buildProductivityPersistence();

assert.equal(
  productivityPersistenceNoHistory.available,
  false
);

assert.equal(
  productivityPersistenceNoHistory.classification,
  "unavailable"
);

assert.equal(
  productivityPersistenceNoHistory
    .values
    .sampleCount,
  0
);

assert.equal(
  productivityPersistenceNoHistory
    .featureType,
  "surface-productivity"
);

assert.equal(
  productivityPersistenceNoHistory
    .featureFamily,
  "biological-ocean"
);

console.log(
  "PASS Productivity Persistence v1 remains unavailable without governed history"
);


const buildHistoricalProductivitySnapshot = ({
  baseObservationSnapshot,
  productivityEvidence,
  observedAt
}) => ({
  ...baseObservationSnapshot,

  observedAt,

  evidence: {
    ...(
      baseObservationSnapshot
        ?.evidence ??
      {}
    ),

    groups: {
      ...(
        baseObservationSnapshot
          ?.evidence
          ?.groups ??
        {}
      ),

      productivity:
        productivityEvidence
    }
  }
});


const clearBlueProductivityEvidence = {
  available:
    true,

  classification:
    "clear-blue-water",

  headline:
    "Clear blue water is present.",

  detail:
    "Satellite observations indicate relatively clear offshore surface water.",

  values: {
    concentrationMgM3:
      0.12,

    productivityClassification:
      "clear-blue-water",

    observedAt:
      "2026-06-15T11:00:00.000Z",

    ageHours:
      4,

    freshness:
      "recent",

    units:
      "mg m^-3"
  },

  drivers: [
    "chlorophyll-available",
    "clear-blue-water",
    "observation-recent"
  ],

  limitations: [
    "surface-productivity-only",
    "satellite-observation",
    "single-time-snapshot",
    "does-not-confirm-water-column-productivity",
    "does-not-confirm-bait",
    "does-not-confirm-feeding",
    "does-not-establish-biological-productivity",
    "does-not-indicate-species-suitability"
  ],

  interpretation:
    "species-neutral-surface-productivity-evidence"
};


const transitionalProductivityEvidence = {
  available:
    true,

  classification:
    "productive-blue-green-transition",

  headline:
    "A productive blue-green transition is present.",

  detail:
    "Satellite observations indicate moderate surface chlorophyll consistent with transitional water.",

  values: {
    concentrationMgM3:
      0.32,

    productivityClassification:
      "productive-blue-green-transition",

    observedAt:
      "2026-06-16T11:00:00.000Z",

    ageHours:
      10,

    freshness:
      "recent",

    units:
      "mg m^-3"
  },

  drivers: [
    "chlorophyll-available",
    "productive-blue-green-transition",
    "observation-recent"
  ],

  limitations: [
    "surface-productivity-only",
    "satellite-observation",
    "single-time-snapshot",
    "does-not-confirm-water-column-productivity",
    "does-not-confirm-bait",
    "does-not-confirm-feeding",
    "does-not-establish-biological-productivity",
    "does-not-indicate-species-suitability"
  ],

  interpretation:
    "species-neutral-surface-productivity-evidence"
};


const greenWaterProductivityEvidence = {
  available:
    true,

  classification:
    "productive-green-water",

  headline:
    "Productive green water is present.",

  detail:
    "Satellite observations indicate elevated surface chlorophyll concentration.",

  values: {
    concentrationMgM3:
      0.75,

    productivityClassification:
      "productive-green-water",

    observedAt:
      "2026-06-15T11:00:00.000Z",

    ageHours:
      20,

    freshness:
      "aging",

    units:
      "mg m^-3"
  },

  drivers: [
    "chlorophyll-available",
    "productive-green-water",
    "observation-aging"
  ],

  limitations: [
    "surface-productivity-only",
    "satellite-observation",
    "single-time-snapshot",
    "does-not-confirm-water-column-productivity",
    "does-not-confirm-bait",
    "does-not-confirm-feeding",
    "does-not-establish-biological-productivity",
    "does-not-indicate-species-suitability",
    "satellite-observation-aging"
  ],

  interpretation:
    "species-neutral-surface-productivity-evidence"
};


const laterClearBlueProductivityEvidence = {
  available:
    true,

  classification:
    "clear-blue-water",

  headline:
    "Clear blue water is present.",

  detail:
    "Satellite observations indicate relatively clear offshore surface water.",

  values: {
    concentrationMgM3:
      0.16,

    productivityClassification:
      "clear-blue-water",

    observedAt:
      "2026-06-16T11:00:00.000Z",

    ageHours:
      50,

    freshness:
      "stale",

    units:
      "mg m^-3"
  },

  drivers: [
    "chlorophyll-available",
    "clear-blue-water",
    "observation-stale"
  ],

  limitations: [
    "surface-productivity-only",
    "satellite-observation",
    "single-time-snapshot",
    "does-not-confirm-water-column-productivity",
    "does-not-confirm-bait",
    "does-not-confirm-feeding",
    "does-not-establish-biological-productivity",
    "does-not-indicate-species-suitability",
    "satellite-observation-stale"
  ],

  interpretation:
    "species-neutral-surface-productivity-evidence"
};


const earlierClearBlueProductivityObservationSnapshot =
  buildHistoricalProductivitySnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    productivityEvidence:
      clearBlueProductivityEvidence,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterTransitionalProductivityObservationSnapshot =
  buildHistoricalProductivitySnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    productivityEvidence:
      transitionalProductivityEvidence,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierClearBlueProductivityHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierClearBlueProductivityObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-productivity-test-location"
  });


const laterTransitionalProductivityHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterTransitionalProductivityObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-productivity-test-location"
  });


const singleProductivityPersistence =
  buildProductivityPersistence({
    historicalSnapshots: [
      earlierClearBlueProductivityHistoricalBackfill
    ]
  });

assert.equal(
  singleProductivityPersistence.available,
  false
);

assert.equal(
  singleProductivityPersistence.classification,
  "insufficient-history"
);

assert.equal(
  singleProductivityPersistence
    .values
    .sampleCount,
  1
);

assert.equal(
  singleProductivityPersistence
    .values
    .firstClassification,
  "clear-blue-water"
);

assert.equal(
  singleProductivityPersistence
    .values
    .firstConcentrationMgM3,
  0.12
);

console.log(
  "PASS Productivity Persistence v1 requires two chronological contracts"
);


const increasingProductivityPersistence =
  buildProductivityPersistence({
    historicalSnapshots: [
      laterTransitionalProductivityHistoricalBackfill,
      earlierClearBlueProductivityHistoricalBackfill
    ]
  });

assert.equal(
  increasingProductivityPersistence.available,
  true
);

assert.equal(
  increasingProductivityPersistence.classification,
  "increasing-surface-productivity-context"
);

assert.equal(
  increasingProductivityPersistence.lifecycleState,
  "strengthening"
);

assert.equal(
  increasingProductivityPersistence
    .values
    .sampleCount,
  2
);

assert.equal(
  increasingProductivityPersistence
    .values
    .durationHours,
  24
);

assert.equal(
  increasingProductivityPersistence
    .values
    .firstClassification,
  "clear-blue-water"
);

assert.equal(
  increasingProductivityPersistence
    .values
    .lastClassification,
  "productive-blue-green-transition"
);

assert.equal(
  increasingProductivityPersistence
    .values
    .classificationChange,
  1
);

assert.equal(
  increasingProductivityPersistence
    .values
    .firstConcentrationMgM3,
  0.12
);

assert.equal(
  increasingProductivityPersistence
    .values
    .lastConcentrationMgM3,
  0.32
);

assert.equal(
  increasingProductivityPersistence
    .values
    .concentrationChangeMgM3,
  0.2
);

assert.equal(
  increasingProductivityPersistence
    .values
    .firstFreshness,
  "recent"
);

assert.equal(
  increasingProductivityPersistence
    .values
    .lastFreshness,
  "recent"
);

assert.equal(
  increasingProductivityPersistence
    .values
    .freshnessChange,
  0
);

assert.equal(
  increasingProductivityPersistence
    .values
    .sourceInterpretation,
  "species-neutral-surface-productivity-evidence"
);

console.log(
  "PASS Productivity Persistence v1 identifies increasing governed surface productivity"
);


const earlierGreenWaterProductivityObservationSnapshot =
  buildHistoricalProductivitySnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    productivityEvidence:
      greenWaterProductivityEvidence,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterClearBlueProductivityObservationSnapshot =
  buildHistoricalProductivitySnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    productivityEvidence:
      laterClearBlueProductivityEvidence,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierGreenWaterProductivityHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierGreenWaterProductivityObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-productivity-decrease-test-location"
  });


const laterClearBlueProductivityHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterClearBlueProductivityObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-productivity-decrease-test-location"
  });


const decreasingProductivityPersistence =
  buildProductivityPersistence({
    historicalSnapshots: [
      laterClearBlueProductivityHistoricalBackfill,
      earlierGreenWaterProductivityHistoricalBackfill
    ]
  });

assert.equal(
  decreasingProductivityPersistence.available,
  true
);

assert.equal(
  decreasingProductivityPersistence.classification,
  "decreasing-surface-productivity-context"
);

assert.equal(
  decreasingProductivityPersistence.lifecycleState,
  "weakening"
);

assert.equal(
  decreasingProductivityPersistence
    .values
    .classificationChange,
  -2
);

assert.equal(
  decreasingProductivityPersistence
    .values
    .firstConcentrationMgM3,
  0.75
);

assert.equal(
  decreasingProductivityPersistence
    .values
    .lastConcentrationMgM3,
  0.16
);

assert.equal(
  decreasingProductivityPersistence
    .values
    .concentrationChangeMgM3,
  -0.59
);

assert.equal(
  decreasingProductivityPersistence
    .values
    .firstFreshness,
  "aging"
);

assert.equal(
  decreasingProductivityPersistence
    .values
    .lastFreshness,
  "stale"
);

assert.equal(
  decreasingProductivityPersistence
    .values
    .freshnessChange,
  -1
);

assert.ok(
  decreasingProductivityPersistence
    .limitations
    .includes(
      "surface-productivity-persistence-does-not-confirm-bait-or-prey"
    )
);

console.log(
  "PASS Productivity Persistence v1 identifies decreasing productivity and preserves freshness change"
);


const oceanPersistenceWithProductivity =
  buildOceanPersistence({
    historicalSnapshots: [
      laterTransitionalProductivityHistoricalBackfill,
      earlierClearBlueProductivityHistoricalBackfill
    ]
  });

assert.equal(
  oceanPersistenceWithProductivity
    .featurePersistence
    .productivity
    .available,
  true
);

assert.equal(
  oceanPersistenceWithProductivity
    .featurePersistence
    .productivity
    .classification,
  "increasing-surface-productivity-context"
);

assert.equal(
  oceanPersistenceWithProductivity
    .featurePersistence
    .productivity
    .featureType,
  "surface-productivity"
);

assert.equal(
  oceanPersistenceWithProductivity
    .featurePersistence
    .productivity
    .featureFamily,
  "biological-ocean"
);

assert.equal(
  oceanPersistenceWithProductivity
    .values
    .assessedFeatureCount,
  1
);

console.log(
  "PASS Ocean Persistence v1 connects governed Productivity Persistence"
);


/**
 * ------------------------------------------------------------
 * Surface-Water Clarity Persistence Analysis v1.0
 * ------------------------------------------------------------
 */

const clarityPersistenceNoHistory =
  buildClarityPersistence();

assert.equal(
  clarityPersistenceNoHistory.available,
  false
);

assert.equal(
  clarityPersistenceNoHistory.classification,
  "unavailable"
);

assert.equal(
  clarityPersistenceNoHistory
    .values
    .sampleCount,
  0
);

assert.equal(
  clarityPersistenceNoHistory
    .featureType,
  "surface-water-clarity"
);

assert.equal(
  clarityPersistenceNoHistory
    .featureFamily,
  "physical-ocean"
);

console.log(
  "PASS Clarity Persistence v1 remains unavailable without governed history"
);


const buildHistoricalClaritySnapshot = ({
  baseObservationSnapshot,
  clarityEvidence,
  observedAt
}) => ({
  ...baseObservationSnapshot,

  observedAt,

  evidence: {
    ...(
      baseObservationSnapshot
        ?.evidence ??
      {}
    ),

    groups: {
      ...(
        baseObservationSnapshot
          ?.evidence
          ?.groups ??
        {}
      ),

      clarity:
        clarityEvidence
    }
  }
});


const transitionalClarityEvidence = {
  available:
    true,

  classification:
    "transitional-surface-water",

  headline:
    "Transitional blue-green surface water is indicated.",

  detail:
    "Moderate chlorophyll concentration suggests a transition between clearer blue water and more chlorophyll-influenced water.",

  values: {
    concentrationMgM3:
      0.32,

    waterClassification:
      "productive-blue-green-transition",

    observedAt:
      "2026-06-15T11:00:00.000Z",

    ageHours:
      10,

    freshness:
      "recent",

    units:
      "mg m^-3"
  },

  drivers: [
    "chlorophyll-available",
    "productive-blue-green-transition",
    "observation-recent"
  ],

  limitations: [
    "surface-water-clarity-inference-only",
    "satellite-observation",
    "single-time-snapshot",
    "does-not-directly-measure-visibility",
    "does-not-confirm-subsurface-clarity",
    "does-not-indicate-species-suitability"
  ],

  interpretation:
    "species-neutral-surface-water-clarity-evidence"
};


const clearBlueClarityEvidence = {
  available:
    true,

  classification:
    "clear-blue-surface-water",

  headline:
    "Clear blue surface water is indicated.",

  detail:
    "Low chlorophyll concentration suggests relatively clear offshore surface water.",

  values: {
    concentrationMgM3:
      0.12,

    waterClassification:
      "clear-blue-water",

    observedAt:
      "2026-06-16T11:00:00.000Z",

    ageHours:
      5,

    freshness:
      "recent",

    units:
      "mg m^-3"
  },

  drivers: [
    "chlorophyll-available",
    "clear-blue-water",
    "observation-recent"
  ],

  limitations: [
    "surface-water-clarity-inference-only",
    "satellite-observation",
    "single-time-snapshot",
    "does-not-directly-measure-visibility",
    "does-not-confirm-subsurface-clarity",
    "does-not-indicate-species-suitability"
  ],

  interpretation:
    "species-neutral-surface-water-clarity-evidence"
};


const veryClearClarityEvidence = {
  available:
    true,

  classification:
    "very-clear-surface-water",

  headline:
    "Very clear surface water is indicated.",

  detail:
    "Very low chlorophyll concentration suggests very clear surface water.",

  values: {
    concentrationMgM3:
      0.05,

    waterClassification:
      "very-clear-low-productivity",

    observedAt:
      "2026-06-15T11:00:00.000Z",

    ageHours:
      20,

    freshness:
      "aging",

    units:
      "mg m^-3"
  },

  drivers: [
    "chlorophyll-available",
    "very-clear-low-productivity",
    "observation-aging"
  ],

  limitations: [
    "surface-water-clarity-inference-only",
    "satellite-observation",
    "single-time-snapshot",
    "does-not-directly-measure-visibility",
    "does-not-confirm-subsurface-clarity",
    "does-not-indicate-species-suitability",
    "clarity-inference-based-on-aging-observation"
  ],

  interpretation:
    "species-neutral-surface-water-clarity-evidence"
};


const chlorophyllInfluencedClarityEvidence = {
  available:
    true,

  classification:
    "chlorophyll-influenced-surface-water",

  headline:
    "Chlorophyll-influenced green surface water is indicated.",

  detail:
    "Elevated chlorophyll concentration suggests greener, less optically clear surface water.",

  values: {
    concentrationMgM3:
      0.75,

    waterClassification:
      "productive-green-water",

    observedAt:
      "2026-06-16T11:00:00.000Z",

    ageHours:
      50,

    freshness:
      "stale",

    units:
      "mg m^-3"
  },

  drivers: [
    "chlorophyll-available",
    "productive-green-water",
    "observation-stale"
  ],

  limitations: [
    "surface-water-clarity-inference-only",
    "satellite-observation",
    "single-time-snapshot",
    "does-not-directly-measure-visibility",
    "does-not-confirm-subsurface-clarity",
    "does-not-indicate-species-suitability",
    "clarity-inference-based-on-stale-observation"
  ],

  interpretation:
    "species-neutral-surface-water-clarity-evidence"
};


const earlierTransitionalClarityObservationSnapshot =
  buildHistoricalClaritySnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    clarityEvidence:
      transitionalClarityEvidence,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterClearBlueClarityObservationSnapshot =
  buildHistoricalClaritySnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    clarityEvidence:
      clearBlueClarityEvidence,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierTransitionalClarityHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierTransitionalClarityObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-clarity-test-location"
  });


const laterClearBlueClarityHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterClearBlueClarityObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-clarity-test-location"
  });


const singleClarityPersistence =
  buildClarityPersistence({
    historicalSnapshots: [
      earlierTransitionalClarityHistoricalBackfill
    ]
  });

assert.equal(
  singleClarityPersistence.available,
  false
);

assert.equal(
  singleClarityPersistence.classification,
  "insufficient-history"
);

assert.equal(
  singleClarityPersistence
    .values
    .sampleCount,
  1
);

assert.equal(
  singleClarityPersistence
    .values
    .firstClassification,
  "transitional-surface-water"
);

assert.equal(
  singleClarityPersistence
    .values
    .firstConcentrationMgM3,
  0.32
);

console.log(
  "PASS Clarity Persistence v1 requires two chronological contracts"
);


const increasingClarityPersistence =
  buildClarityPersistence({
    historicalSnapshots: [
      laterClearBlueClarityHistoricalBackfill,
      earlierTransitionalClarityHistoricalBackfill
    ]
  });

assert.equal(
  increasingClarityPersistence.available,
  true
);

assert.equal(
  increasingClarityPersistence.classification,
  "increasing-surface-water-clarity-context"
);

assert.equal(
  increasingClarityPersistence.lifecycleState,
  "strengthening"
);

assert.equal(
  increasingClarityPersistence
    .values
    .sampleCount,
  2
);

assert.equal(
  increasingClarityPersistence
    .values
    .durationHours,
  24
);

assert.equal(
  increasingClarityPersistence
    .values
    .firstClassification,
  "transitional-surface-water"
);

assert.equal(
  increasingClarityPersistence
    .values
    .lastClassification,
  "clear-blue-surface-water"
);

assert.equal(
  increasingClarityPersistence
    .values
    .clarityRankChange,
  1
);

assert.equal(
  increasingClarityPersistence
    .values
    .firstWaterClassification,
  "productive-blue-green-transition"
);

assert.equal(
  increasingClarityPersistence
    .values
    .lastWaterClassification,
  "clear-blue-water"
);

assert.equal(
  increasingClarityPersistence
    .values
    .firstConcentrationMgM3,
  0.32
);

assert.equal(
  increasingClarityPersistence
    .values
    .lastConcentrationMgM3,
  0.12
);

assert.equal(
  increasingClarityPersistence
    .values
    .concentrationChangeMgM3,
  -0.2
);

assert.equal(
  increasingClarityPersistence
    .values
    .firstFreshness,
  "recent"
);

assert.equal(
  increasingClarityPersistence
    .values
    .lastFreshness,
  "recent"
);

assert.equal(
  increasingClarityPersistence
    .values
    .freshnessChange,
  0
);

assert.equal(
  increasingClarityPersistence
    .values
    .sourceInterpretation,
  "species-neutral-surface-water-clarity-evidence"
);

console.log(
  "PASS Clarity Persistence v1 identifies increasing governed surface-water clarity"
);


const earlierVeryClearClarityObservationSnapshot =
  buildHistoricalClaritySnapshot({
    baseObservationSnapshot:
      historicalBackfillObservationSnapshot,

    clarityEvidence:
      veryClearClarityEvidence,

    observedAt:
      "2026-06-15T11:00:00.000Z"
  });


const laterChlorophyllInfluencedClarityObservationSnapshot =
  buildHistoricalClaritySnapshot({
    baseObservationSnapshot:
      laterHistoricalObservationSnapshot,

    clarityEvidence:
      chlorophyllInfluencedClarityEvidence,

    observedAt:
      "2026-06-16T11:00:00.000Z"
  });


const earlierVeryClearClarityHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      earlierVeryClearClarityObservationSnapshot,

    intelligenceSnapshot:
      historicalBackfillIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:10:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-clarity-decrease-test-location"
  });


const laterChlorophyllInfluencedClarityHistoricalBackfill =
  buildHistoricalSnapshotBackfill({
    observationSnapshot:
      laterChlorophyllInfluencedClarityObservationSnapshot,

    intelligenceSnapshot:
      laterHistoricalIntelligenceSnapshot,

    storedAt:
      "2026-08-02T20:11:00.000Z",

    storageProvider:
      "pelora-test-historical-memory",

    region:
      "Northern Gulf of Mexico",

    subregion:
      "DeSoto Canyon",

    locationId:
      "historical-clarity-decrease-test-location"
  });


const decreasingClarityPersistence =
  buildClarityPersistence({
    historicalSnapshots: [
      laterChlorophyllInfluencedClarityHistoricalBackfill,
      earlierVeryClearClarityHistoricalBackfill
    ]
  });

assert.equal(
  decreasingClarityPersistence.available,
  true
);

assert.equal(
  decreasingClarityPersistence.classification,
  "decreasing-surface-water-clarity-context"
);

assert.equal(
  decreasingClarityPersistence.lifecycleState,
  "weakening"
);

assert.equal(
  decreasingClarityPersistence
    .values
    .clarityRankChange,
  -3
);

assert.equal(
  decreasingClarityPersistence
    .values
    .firstConcentrationMgM3,
  0.05
);

assert.equal(
  decreasingClarityPersistence
    .values
    .lastConcentrationMgM3,
  0.75
);

assert.equal(
  decreasingClarityPersistence
    .values
    .concentrationChangeMgM3,
  0.7
);

assert.equal(
  decreasingClarityPersistence
    .values
    .firstFreshness,
  "aging"
);

assert.equal(
  decreasingClarityPersistence
    .values
    .lastFreshness,
  "stale"
);

assert.equal(
  decreasingClarityPersistence
    .values
    .freshnessChange,
  -1
);

assert.ok(
  decreasingClarityPersistence
    .limitations
    .includes(
      "surface-water-clarity-persistence-is-not-a-direct-visibility-measurement"
    )
);

console.log(
  "PASS Clarity Persistence v1 identifies decreasing clarity and preserves freshness change"
);


const oceanPersistenceWithClarity =
  buildOceanPersistence({
    historicalSnapshots: [
      laterClearBlueClarityHistoricalBackfill,
      earlierTransitionalClarityHistoricalBackfill
    ]
  });

assert.equal(
  oceanPersistenceWithClarity
    .featurePersistence
    .clarity
    .available,
  true
);

assert.equal(
  oceanPersistenceWithClarity
    .featurePersistence
    .clarity
    .classification,
  "increasing-surface-water-clarity-context"
);

assert.equal(
  oceanPersistenceWithClarity
    .featurePersistence
    .clarity
    .featureType,
  "surface-water-clarity"
);

assert.equal(
  oceanPersistenceWithClarity
    .featurePersistence
    .clarity
    .featureFamily,
  "physical-ocean"
);

assert.equal(
  oceanPersistenceWithClarity
    .values
    .assessedFeatureCount,
  1
);

console.log(
  "PASS Ocean Persistence v1 connects governed Clarity Persistence"
);