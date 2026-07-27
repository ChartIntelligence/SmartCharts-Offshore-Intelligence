import http from "node:http";
import { URL } from "node:url";


const PORT =
  Number(process.env.PORT) || 8787;


const DEFAULT_LATITUDE = 28.19;
const DEFAULT_LONGITUDE = -88.49;


/*
 * Convert meters per second to knots.
 */
function metersPerSecondToKnots(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Number(
    (number * 1.94384).toFixed(1)
  );
}


/*
 * Convert meters to feet.
 */
function metersToFeet(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Number(
    (number * 3.28084).toFixed(1)
  );
}


/*
 * Convert Celsius to Fahrenheit.
 */
function celsiusToFahrenheit(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Number(
    ((number * 9) / 5 + 32).toFixed(1)
  );
}


function safeNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}


function writeJson(
  response,
  statusCode,
  payload
) {
  response.writeHead(
    statusCode,
    {
      "Content-Type":
        "application/json",

      "Access-Control-Allow-Origin":
        "*",

      "Access-Control-Allow-Methods":
        "GET, OPTIONS",

      "Access-Control-Allow-Headers":
        "Content-Type",

      "Cache-Control":
        "no-store"
    }
  );

  response.end(
    JSON.stringify(
      payload,
      null,
      2
    )
  );
}


async function settleWithTiming(
  operation
) {
  const startedAt =
    performance.now();

  try {
    const value =
      await operation();

    return {
      status:
        "fulfilled",

      value,

      durationMilliseconds:
        Number(
          (
            performance.now() -
            startedAt
          ).toFixed(1)
        )
    };
  } catch (reason) {
    return {
      status:
        "rejected",

      reason,

      durationMilliseconds:
        Number(
          (
            performance.now() -
            startedAt
          ).toFixed(1)
        )
    };
  }
}


const DEFAULT_UPSTREAM_TIMEOUT_MS =
  4000;


async function fetchJson(
  url,
  {
    timeoutMilliseconds =
      DEFAULT_UPSTREAM_TIMEOUT_MS,

    provider =
      "upstream-provider"
  } = {}
) {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => {
        controller.abort();
      },
      timeoutMilliseconds
    );

  try {
    const response =
      await fetch(url, {
        headers: {
          Accept:
            "application/json",

          "User-Agent":
            "Pelora-Ocean-Intelligence/0.1 contact@peloraoffshore.com"
        },

        signal:
          controller.signal
      });

    if (!response.ok) {
      throw new Error(
        `${provider} request failed: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    if (
      error?.name ===
      "AbortError"
    ) {
      const timeoutError =
        new Error(
          `${provider} request timed out after ${timeoutMilliseconds} ms`
        );

      timeoutError.code =
        "UPSTREAM_TIMEOUT";

      timeoutError.provider =
        provider;

      timeoutError.timeoutMilliseconds =
        timeoutMilliseconds;

      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}


function getCoordinates(requestUrl) {
  const requestedLatitude =
    Number(
      requestUrl.searchParams.get("lat")
    );

  const requestedLongitude =
    Number(
      requestUrl.searchParams.get("lon")
    );

  const latitude =
    Number.isFinite(requestedLatitude)
      ? requestedLatitude
      : DEFAULT_LATITUDE;

  const longitude =
    Number.isFinite(requestedLongitude)
      ? requestedLongitude
      : DEFAULT_LONGITUDE;

  return {
    latitude,
    longitude
  };
}


function coordinatesAreValid(
  latitude,
  longitude
) {
  return (
    latitude >= 15 &&
    latitude <= 32 &&
    longitude >= -100 &&
    longitude <= -75
  );
}



const CHLOROPHYLL_DATASET =
  "noaacwNPPVIIRSchlaDaily";

const CHLOROPHYLL_MAX_LIVE_AGE_HOURS =
  72;


const CURRENTS_DATASET =
  "noaacwBLENDEDNRTcurrentsDaily";

const CURRENTS_MAX_LIVE_AGE_HOURS =
  96;


/*
 * Classify chlorophyll conservatively.
 *
 * These descriptions indicate broad water characteristics,
 * not fishing success or species presence.
 */
function classifyChlorophyll(value) {
  if (!Number.isFinite(value)) {
    return null;
  }

  if (value < 0.08) {
    return "very-clear-low-productivity";
  }

  if (value < 0.2) {
    return "clear-blue-water";
  }

  if (value < 0.5) {
    return "productive-blue-green-transition";
  }

  if (value < 1.0) {
    return "productive-green-water";
  }

  return "high-chlorophyll-coastal-or-bloom-influenced";
}


/**
 * Convert a single-point sea-surface temperature into
 * a broad operational temperature band.
 *
 * This does not identify a front, edge, break, habitat,
 * or species opportunity.
 */
function classifySeaSurfaceTemperature(
  temperatureFahrenheit
) {
  if (
    !Number.isFinite(
      temperatureFahrenheit
    )
  ) {
    return null;
  }

  if (temperatureFahrenheit < 68) {
    return "cool";
  }

  if (temperatureFahrenheit < 75) {
    return "mild";
  }

  if (temperatureFahrenheit < 80) {
    return "warm";
  }

  if (temperatureFahrenheit < 85) {
    return "very-warm";
  }

  return "hot";
}


function currentDirectionDegrees(
  eastward,
  northward
) {
  if (
    !Number.isFinite(eastward) ||
    !Number.isFinite(northward)
  ) {
    return null;
  }

  const degrees =
    Math.atan2(
      eastward,
      northward
    ) *
    (180 / Math.PI);

  return Number(
    (
      (degrees + 360) %
      360
    ).toFixed(0)
  );
}


/**
 * Convert current speed into broad operational bands.
 *
 * These bands describe current strength only. They do not
 * indicate habitat quality, fish presence, or fishing success.
 */
function classifyCurrentStrength(
  speedKnots
) {
  if (
    !Number.isFinite(
      speedKnots
    )
  ) {
    return null;
  }

  if (speedKnots < 0.25) {
    return "weak";
  }

  if (speedKnots < 0.75) {
    return "moderate";
  }

  if (speedKnots < 1.5) {
    return "strong";
  }

  return "very-strong";
}


/**
 * Convert degrees-toward into an eight-point compass heading.
 */
function currentCompassDirection(
  directionDegrees
) {
  if (
    !Number.isFinite(
      directionDegrees
    )
  ) {
    return null;
  }

  const normalized =
    (
      directionDegrees %
      360 +
      360
    ) %
    360;

  const directions = [
    "N",
    "NE",
    "E",
    "SE",
    "S",
    "SW",
    "W",
    "NW"
  ];

  const index =
    Math.round(
      normalized / 45
    ) % 8;

  return directions[index];
}


const SYNODIC_MONTH_DAYS =
  29.530588853;

const MOON_REFERENCE_NEW_MOON =
  new Date(
    "2000-01-06T18:14:00Z"
  );


function classifyMoonPhase(
  phaseFraction
) {
  if (
    !Number.isFinite(
      phaseFraction
    )
  ) {
    return null;
  }

  if (
    phaseFraction < 0.03125 ||
    phaseFraction >= 0.96875
  ) {
    return "new-moon";
  }

  if (phaseFraction < 0.21875) {
    return "waxing-crescent";
  }

  if (phaseFraction < 0.28125) {
    return "first-quarter";
  }

  if (phaseFraction < 0.46875) {
    return "waxing-gibbous";
  }

  if (phaseFraction < 0.53125) {
    return "full-moon";
  }

  if (phaseFraction < 0.71875) {
    return "waning-gibbous";
  }

  if (phaseFraction < 0.78125) {
    return "last-quarter";
  }

  return "waning-crescent";
}


function getMoonConditions(
  timestamp = new Date()
) {
  const date =
    timestamp instanceof Date
      ? timestamp
      : new Date(timestamp);

  const time =
    date.getTime();

  if (!Number.isFinite(time)) {
    return {
      phase: null,
      phaseFraction: null,
      illuminationPercent: null,
      observedAt: null,
      source: {
        provider:
          "Pelora",

        classification:
          "astronomical-calculation",

        accuracy:
          "approximate",

        availability:
          "invalid-time"
      }
    };
  }

  const daysSinceReference =
    (
      time -
      MOON_REFERENCE_NEW_MOON
        .getTime()
    ) /
    86400000;

  const lunarAgeDays =
    (
      (
        daysSinceReference %
        SYNODIC_MONTH_DAYS
      ) +
      SYNODIC_MONTH_DAYS
    ) %
    SYNODIC_MONTH_DAYS;

  const phaseFraction =
    lunarAgeDays /
    SYNODIC_MONTH_DAYS;

  const illumination =
    (
      1 -
      Math.cos(
        2 *
        Math.PI *
        phaseFraction
      )
    ) /
    2;

  return {
    phase:
      classifyMoonPhase(
        phaseFraction
      ),

    phaseFraction:
      Number(
        phaseFraction.toFixed(4)
      ),

    lunarAgeDays:
      Number(
        lunarAgeDays.toFixed(2)
      ),

    illuminationPercent:
      Number(
        (
          illumination *
          100
        ).toFixed(1)
      ),

    observedAt:
      date.toISOString(),

    source: {
      provider:
        "Pelora",

      classification:
        "astronomical-calculation",

      accuracy:
        "approximate",

      referenceEpoch:
        MOON_REFERENCE_NEW_MOON
          .toISOString(),

      availability:
        "available"
    }
  };
}


function getAgeHours(timestamp) {
  const time =
    new Date(timestamp).getTime();

  if (!Number.isFinite(time)) {
    return null;
  }

  return Number(
    (
      (Date.now() - time) /
      3600000
    ).toFixed(1)
  );
}


async function getChlorophyllConditions(
  latitude,
  longitude
) {
  const query =
    `chlor_a[(last)][(0.0)][(${latitude})][(${longitude})]`;

  const url =
    new URL(
      `https://coastwatch.noaa.gov/erddap/griddap/${CHLOROPHYLL_DATASET}.json`
    );

  url.search =
    `?${encodeURIComponent(query)}`;

  const payload =
    await fetchJson(url);

  const columns =
    payload?.table?.columnNames;

  const rows =
    payload?.table?.rows;

  if (
    !Array.isArray(columns) ||
    !Array.isArray(rows) ||
    rows.length === 0
  ) {
    return {
      concentrationMgM3: null,
      waterClassification: null,
      observedAt: null,
      ageHours: null,
      source: {
        provider: "NOAA CoastWatch",
        dataset: CHLOROPHYLL_DATASET,
        classification:
          "satellite-observation",
        availability:
          "no-valid-pixel"
      }
    };
  }

  const row =
    rows[0];

  const valueAt =
    (name) => {
      const index =
        columns.indexOf(name);

      return index >= 0
        ? row[index]
        : null;
    };

  const concentration =
    safeNumber(
      valueAt("chlor_a")
    );

  const observedAt =
    valueAt("time") ?? null;

  const ageHours =
    getAgeHours(observedAt);

  return {
    concentrationMgM3:
      concentration === null
        ? null
        : Number(
            concentration.toFixed(4)
          ),

    waterClassification:
      classifyChlorophyll(
        concentration
      ),

    observedAt,

    ageHours,

    source: {
      provider:
        "NOAA CoastWatch",

      platform:
        "Suomi-NPP VIIRS",

      dataset:
        CHLOROPHYLL_DATASET,

      variable:
        "chlor_a",

      units:
        "mg m^-3",

      classification:
        "satellite-observation",

      availability:
        concentration === null
          ? "no-valid-pixel"
          : "available"
    }
  };
}


async function getCurrentConditions(
  latitude,
  longitude
) {
  const query =
    [
      `u_current[(last)][(${latitude})][(${longitude})]`,
      `v_current[(last)][(${latitude})][(${longitude})]`
    ].join(",");

  const url =
    new URL(
      `https://coastwatch.noaa.gov/erddap/griddap/${CURRENTS_DATASET}.json`
    );

  url.search =
    `?${encodeURIComponent(query)}`;

  const payload =
    await fetchJson(url);

  const columns =
    payload?.table?.columnNames;

  const rows =
    payload?.table?.rows;

  if (
    !Array.isArray(columns) ||
    !Array.isArray(rows) ||
    rows.length === 0
  ) {
    return {
      speedKnots: null,
      directionDegrees: null,
      eastwardMetersPerSecond: null,
      northwardMetersPerSecond: null,
      observedAt: null,
      ageHours: null,
      source: {
        provider:
          "NOAA CoastWatch",

        dataset:
          CURRENTS_DATASET,

        classification:
          "altimetry-derived-geostrophic-current",

        availability:
          "no-valid-pixel"
      }
    };
  }

  const row =
    rows[0];

  const valueAt =
    (name) => {
      const index =
        columns.indexOf(name);

      return index >= 0
        ? row[index]
        : null;
    };

  const eastward =
    safeNumber(
      valueAt("u_current")
    );

  const northward =
    safeNumber(
      valueAt("v_current")
    );

  const observedAt =
    valueAt("time") ?? null;

  const ageHours =
    getAgeHours(observedAt);

  const hasVector =
    Number.isFinite(eastward) &&
    Number.isFinite(northward);

  const speedMetersPerSecond =
    hasVector
      ? Math.sqrt(
          eastward ** 2 +
          northward ** 2
        )
      : null;

  const speedKnots =
    metersPerSecondToKnots(
      speedMetersPerSecond
    );

  const directionDegrees =
    currentDirectionDegrees(
      eastward,
      northward
    );

  return {
    speedKnots,

    directionDegrees,

    derived: {
      strength:
        classifyCurrentStrength(
          speedKnots
        ),

      compassDirection:
        currentCompassDirection(
          directionDegrees
        ),

      interpretation:
        "operational-current-description",

      thresholdVersion:
        "pelora-current-strength-v1"
    },

    eastwardMetersPerSecond:
      eastward === null
        ? null
        : Number(
            eastward.toFixed(4)
          ),

    northwardMetersPerSecond:
      northward === null
        ? null
        : Number(
            northward.toFixed(4)
          ),

    observedAt,

    ageHours,

    source: {
      provider:
        "NOAA CoastWatch",

      dataset:
        CURRENTS_DATASET,

      variables: [
        "u_current",
        "v_current"
      ],

      units:
        "m/s",

      classification:
        "altimetry-derived-geostrophic-current",

      directionConvention:
        "degrees-toward",

      availability:
        hasVector
          ? "available"
          : "no-valid-pixel"
    }
  };
}


const SST_SPATIAL_SAMPLE_RADIUS_NM =
  15;

const SST_POINT_CACHE_TTL_MS =
  5 * 60 * 1000;

const sstPointCache =
  new Map();

const sstPointRequestsInFlight =
  new Map();


function createSstPointCacheKey(
  latitude,
  longitude
) {
  return [
    Number(latitude).toFixed(4),
    Number(longitude).toFixed(4)
  ].join(",");
}


function getCachedSstPoint(
  latitude,
  longitude
) {
  const key =
    createSstPointCacheKey(
      latitude,
      longitude
    );

  const cached =
    sstPointCache.get(key);

  if (!cached) {
    return null;
  }

  const ageMilliseconds =
    Date.now() -
    cached.cachedAt;

  if (
    ageMilliseconds >
    SST_POINT_CACHE_TTL_MS
  ) {
    sstPointCache.delete(key);
    return null;
  }

  return {
    ...cached.value,

    cache: {
      status:
        "hit",

      ageSeconds:
        Number(
          (
            ageMilliseconds /
            1000
          ).toFixed(1)
        ),

      ttlSeconds:
        SST_POINT_CACHE_TTL_MS /
        1000
    }
  };
}


function setCachedSstPoint(
  latitude,
  longitude,
  value
) {
  if (
    !Number.isFinite(
      value?.temperatureCelsius
    )
  ) {
    return;
  }

  const key =
    createSstPointCacheKey(
      latitude,
      longitude
    );

  sstPointCache.set(
    key,
    {
      cachedAt:
        Date.now(),

      value
    }
  );
}


/**
 * Build four nearby sampling points around a center location.
 *
 * Longitude spacing is adjusted for latitude so the east/west
 * samples remain approximately the requested nautical distance.
 */
function createSstSpatialSamplePoints(
  latitude,
  longitude
) {
  const latitudeOffset =
    SST_SPATIAL_SAMPLE_RADIUS_NM /
    60;

  const cosineLatitude =
    Math.cos(
      latitude *
      Math.PI /
      180
    );

  const longitudeOffset =
    Math.abs(cosineLatitude) >
    0.01
      ? SST_SPATIAL_SAMPLE_RADIUS_NM /
        (
          60 *
          cosineLatitude
        )
      : null;

  if (
    !Number.isFinite(
      longitudeOffset
    )
  ) {
    return [];
  }

  return [
    {
      direction: "north",
      latitude:
        latitude +
        latitudeOffset,
      longitude
    },
    {
      direction: "east",
      latitude,
      longitude:
        longitude +
        longitudeOffset
    },
    {
      direction: "south",
      latitude:
        latitude -
        latitudeOffset,
      longitude
    },
    {
      direction: "west",
      latitude,
      longitude:
        longitude -
        longitudeOffset
    }
  ];
}


/**
 * Request only the current sea-surface temperature for one point.
 */
async function getSeaSurfaceTemperaturePoint(
  latitude,
  longitude
) {
  const url =
    new URL(
      "https://marine-api.open-meteo.com/v1/marine"
    );

  url.searchParams.set(
    "latitude",
    String(latitude)
  );

  url.searchParams.set(
    "longitude",
    String(longitude)
  );

  url.searchParams.set(
    "cell_selection",
    "sea"
  );

  url.searchParams.set(
    "current",
    "sea_surface_temperature"
  );

  url.searchParams.set(
    "timezone",
    "UTC"
  );

  const payload =
    await fetchJson(url);

  const temperatureCelsius =
    safeNumber(
      payload?.current
        ?.sea_surface_temperature
    );

  return {
    requestedLatitude:
      latitude,

    requestedLongitude:
      longitude,

    resolvedLatitude:
      safeNumber(
        payload?.latitude
      ) ??
      latitude,

    resolvedLongitude:
      safeNumber(
        payload?.longitude
      ) ??
      longitude,

    temperatureCelsius,

    temperatureFahrenheit:
      celsiusToFahrenheit(
        temperatureCelsius
      ),

    observedAt:
      payload?.current?.time ??
      null,

    source: {
      provider:
        "Open-Meteo",

      classification:
        "forecast-model",

      availability:
        temperatureCelsius === null
          ? "unavailable"
          : "available"
    }
  };
}


/**
 * Classify a local SST range measured across nearby samples.
 *
 * This identifies spatial temperature structure only. It does
 * not prove persistence, biological importance, or a true front.
 */
function classifySstSpatialRange(
  rangeFahrenheit
) {
  if (
    !Number.isFinite(
      rangeFahrenheit
    )
  ) {
    return null;
  }

  if (rangeFahrenheit < 0.5) {
    return "uniform-water";
  }

  if (rangeFahrenheit < 1.0) {
    return "weak-temperature-transition";
  }

  if (rangeFahrenheit < 2.0) {
    return "moderate-temperature-transition";
  }

  return "strong-temperature-break-candidate";
}


/**
 * Describe the strongest directional SST difference between
 * opposite samples.
 *
 * This reports local temperature orientation only. It does not
 * confirm a persistent ocean front or biological significance.
 */
function deriveSstTransitionOrientation(
  samples
) {
  const temperatures =
    Object.fromEntries(
      samples
        .filter(
          sample =>
            Number.isFinite(
              sample
                .temperatureFahrenheit
            )
        )
        .map(
          sample => [
            sample.direction,
            sample
              .temperatureFahrenheit
          ]
        )
    );

  const eastWestAvailable =
    Number.isFinite(
      temperatures.east
    ) &&
    Number.isFinite(
      temperatures.west
    );

  const northSouthAvailable =
    Number.isFinite(
      temperatures.north
    ) &&
    Number.isFinite(
      temperatures.south
    );

  const eastWestDifferenceFahrenheit =
    eastWestAvailable
      ? Number(
          (
            temperatures.west -
            temperatures.east
          ).toFixed(1)
        )
      : null;

  const northSouthDifferenceFahrenheit =
    northSouthAvailable
      ? Number(
          (
            temperatures.north -
            temperatures.south
          ).toFixed(1)
        )
      : null;

  const candidates = [];

  if (
    Number.isFinite(
      eastWestDifferenceFahrenheit
    )
  ) {
    candidates.push({
      axis:
        "east-west",

      magnitudeFahrenheit:
        Math.abs(
          eastWestDifferenceFahrenheit
        ),

      warmSide:
        eastWestDifferenceFahrenheit >
        0
          ? "west"
          : "east",

      coolSide:
        eastWestDifferenceFahrenheit >
        0
          ? "east"
          : "west"
    });
  }

  if (
    Number.isFinite(
      northSouthDifferenceFahrenheit
    )
  ) {
    candidates.push({
      axis:
        "north-south",

      magnitudeFahrenheit:
        Math.abs(
          northSouthDifferenceFahrenheit
        ),

      warmSide:
        northSouthDifferenceFahrenheit >
        0
          ? "north"
          : "south",

      coolSide:
        northSouthDifferenceFahrenheit >
        0
          ? "south"
          : "north"
    });
  }

  const dominant =
    candidates.sort(
      (a, b) =>
        b.magnitudeFahrenheit -
        a.magnitudeFahrenheit
    )[0] ??
    null;

  const minimumDirectionalSignalFahrenheit =
    0.3;

  const hasClearOrientation =
    dominant !== null &&
    dominant.magnitudeFahrenheit >=
      minimumDirectionalSignalFahrenheit;

  return {
    classification:
      hasClearOrientation
        ? "directional-temperature-transition"
        : "no-clear-directional-transition",

    dominantAxis:
      hasClearOrientation
        ? dominant.axis
        : null,

    warmSide:
      hasClearOrientation
        ? dominant.warmSide
        : null,

    coolSide:
      hasClearOrientation
        ? dominant.coolSide
        : null,

    dominantDifferenceFahrenheit:
      hasClearOrientation
        ? Number(
            dominant
              .magnitudeFahrenheit
              .toFixed(1)
          )
        : null,

    eastWestDifferenceFahrenheit,

    northSouthDifferenceFahrenheit,

    minimumDirectionalSignalFahrenheit,

    interpretation:
      "local-directional-temperature-description",

    methodVersion:
      "pelora-sst-orientation-v1",

    limitations: [
      "four-point-directional-sampling",
      "forecast-model-samples",
      "single-time-snapshot",
      "does-not-confirm-persistence",
      "does-not-confirm-ocean-front",
      "does-not-indicate-species-suitability"
    ]
  };
}


/**
 * Assess confidence in the sampled directional SST structure.
 *
 * Confidence applies only to the local four-point temperature
 * pattern. It does not establish persistence, front identity,
 * or biological significance.
 */
function assessSstTransitionConfidence(
  {
    samples,
    sufficientCoverage,
    rangeFahrenheit,
    orientation
  }
) {
  const validSamples =
    samples.filter(
      sample =>
        Number.isFinite(
          sample
            .temperatureFahrenheit
        )
    );

  const expectedSampleCount = 4;

  const coverageRatio =
    expectedSampleCount > 0
      ? validSamples.length /
        expectedSampleCount
      : 0;

  const observationTimes =
    validSamples
      .map(
        sample =>
          Date.parse(
            sample.observedAt
          )
      )
      .filter(
        Number.isFinite
      );

  const newestObservationTime =
    observationTimes.length > 0
      ? Math.max(
          ...observationTimes
        )
      : null;

  const ageHours =
    Number.isFinite(
      newestObservationTime
    )
      ? Number(
          (
            (
              Date.now() -
              newestObservationTime
            ) /
            3600000
          ).toFixed(1)
        )
      : null;

  const eastWestMagnitude =
    Number.isFinite(
      orientation
        ?.eastWestDifferenceFahrenheit
    )
      ? Math.abs(
          orientation
            .eastWestDifferenceFahrenheit
        )
      : null;

  const northSouthMagnitude =
    Number.isFinite(
      orientation
        ?.northSouthDifferenceFahrenheit
    )
      ? Math.abs(
          orientation
            .northSouthDifferenceFahrenheit
        )
      : null;

  const directionalMagnitudes = [
    eastWestMagnitude,
    northSouthMagnitude
  ]
    .filter(
      Number.isFinite
    )
    .sort(
      (a, b) =>
        b - a
    );

  const dominantMagnitude =
    directionalMagnitudes[0] ??
    null;

  const secondaryMagnitude =
    directionalMagnitudes.length >= 2
      ? directionalMagnitudes[1]
      : null;

  const hasTwoAxisMeasurements =
    directionalMagnitudes.length >= 2;

  const axisSeparationFahrenheit =
    hasTwoAxisMeasurements &&
    Number.isFinite(
      dominantMagnitude
    ) &&
    Number.isFinite(
      secondaryMagnitude
    )
      ? Number(
          (
            dominantMagnitude -
            secondaryMagnitude
          ).toFixed(1)
        )
      : null;

  let score = 0;

  const reasons = [];

  if (
    sufficientCoverage &&
    coverageRatio === 1
  ) {
    score += 25;
    reasons.push(
      "complete-four-point-coverage"
    );
  } else if (
    coverageRatio >= 0.75
  ) {
    score += 15;
    reasons.push(
      "partial-but-sufficient-coverage"
    );
  } else {
    reasons.push(
      "insufficient-spatial-coverage"
    );
  }

  if (
    Number.isFinite(
      rangeFahrenheit
    )
  ) {
    if (
      rangeFahrenheit >= 2
    ) {
      score += 25;
      reasons.push(
        "strong-total-temperature-range"
      );
    } else if (
      rangeFahrenheit >= 1
    ) {
      score += 18;
      reasons.push(
        "moderate-total-temperature-range"
      );
    } else if (
      rangeFahrenheit >= 0.5
    ) {
      score += 8;
      reasons.push(
        "weak-total-temperature-range"
      );
    } else {
      reasons.push(
        "minimal-total-temperature-range"
      );
    }
  }

  if (
    orientation?.classification ===
    "directional-temperature-transition" &&
    Number.isFinite(
      dominantMagnitude
    )
  ) {
    if (
      dominantMagnitude >= 2
    ) {
      score += 25;
      reasons.push(
        "strong-directional-difference"
      );
    } else if (
      dominantMagnitude >= 1
    ) {
      score += 18;
      reasons.push(
        "moderate-directional-difference"
      );
    } else if (
      dominantMagnitude >= 0.3
    ) {
      score += 8;
      reasons.push(
        "weak-directional-difference"
      );
    }
  } else {
    reasons.push(
      "no-clear-directional-orientation"
    );
  }

  if (
    Number.isFinite(
      axisSeparationFahrenheit
    )
  ) {
    if (
      axisSeparationFahrenheit >= 1
    ) {
      score += 15;
      reasons.push(
        "clear-dominant-axis"
      );
    } else if (
      axisSeparationFahrenheit >= 0.5
    ) {
      score += 10;
      reasons.push(
        "moderately-distinct-axis"
      );
    } else if (
      axisSeparationFahrenheit >= 0.2
    ) {
      score += 5;
      reasons.push(
        "weak-axis-separation"
      );
    } else {
      reasons.push(
        "competing-directional-signals"
      );
    }
  } else {
    reasons.push(
      "single-axis-only"
    );
  }

  if (
    Number.isFinite(
      ageHours
    )
  ) {
    if (
      ageHours <= 3
    ) {
      score += 10;
      reasons.push(
        "recent-samples"
      );
    } else if (
      ageHours <= 12
    ) {
      score += 6;
      reasons.push(
        "same-day-samples"
      );
    } else if (
      ageHours <= 24
    ) {
      score += 3;
      reasons.push(
        "samples-within-24-hours"
      );
    } else {
      reasons.push(
        "stale-samples"
      );
    }
  } else {
    reasons.push(
      "sample-time-unavailable"
    );
  }

  const boundedScore =
    Math.max(
      0,
      Math.min(
        100,
        score
      )
    );

  let level =
    "low";

  if (
    boundedScore >= 75
  ) {
    level =
      "high";
  } else if (
    boundedScore >= 45
  ) {
    level =
      "moderate";
  }

  if (
    !sufficientCoverage ||
    orientation?.classification !==
      "directional-temperature-transition"
  ) {
    level =
      "low";
  } else if (
    coverageRatio < 1 ||
    !hasTwoAxisMeasurements
  ) {
    level =
      level === "high"
        ? "moderate"
        : level;
  }

  return {
    level,

    score:
      boundedScore,

    coverageRatio:
      Number(
        coverageRatio.toFixed(2)
      ),

    sampleAgeHours:
      ageHours,

    dominantDirectionalDifferenceFahrenheit:
      dominantMagnitude,

    secondaryDirectionalDifferenceFahrenheit:
      secondaryMagnitude,

    axisSeparationFahrenheit,

    reasons,

    interpretation:
      "confidence-in-local-directional-temperature-pattern",

    methodVersion:
      "pelora-sst-transition-confidence-v1",

    limitations: [
      "confidence-applies-only-to-sampled-temperature-pattern",
      "four-point-spatial-sampling",
      "forecast-model-samples",
      "single-time-snapshot",
      "does-not-confirm-persistence",
      "does-not-confirm-ocean-front",
      "does-not-indicate-species-suitability"
    ]
  };
}


async function getCachedSeaSurfaceTemperaturePoint(
  latitude,
  longitude
) {
  const cached =
    getCachedSstPoint(
      latitude,
      longitude
    );

  if (cached) {
    return cached;
  }

  const key =
    createSstPointCacheKey(
      latitude,
      longitude
    );

  const existingRequest =
    sstPointRequestsInFlight.get(
      key
    );

  if (existingRequest) {
    const sharedValue =
      await existingRequest;

    return {
      ...sharedValue,

      cache: {
        status:
          "shared-in-flight",

        ageSeconds:
          0,

        ttlSeconds:
          SST_POINT_CACHE_TTL_MS /
          1000
      }
    };
  }

  const request =
    getSeaSurfaceTemperaturePoint(
      latitude,
      longitude
    )
      .then(
        value => {
          setCachedSstPoint(
            latitude,
            longitude,
            value
          );

          return value;
        }
      )
      .finally(
        () => {
          sstPointRequestsInFlight.delete(
            key
          );
        }
      );

  sstPointRequestsInFlight.set(
    key,
    request
  );

  const value =
    await request;

  return {
    ...value,

    cache: {
      status:
        "miss",

      ageSeconds:
        0,

      ttlSeconds:
        SST_POINT_CACHE_TTL_MS /
        1000
    }
  };
}


async function getSstSpatialStructure(
  latitude,
  longitude,
  centerTemperatureFahrenheit
) {
  const samplePoints =
    createSstSpatialSamplePoints(
      latitude,
      longitude
    );

  const results =
    await Promise.allSettled(
      samplePoints.map(
        async (point) => ({
          direction:
            point.direction,

          ...await getCachedSeaSurfaceTemperaturePoint(
            point.latitude,
            point.longitude
          )
        })
      )
    );

  const samples =
    results.map(
      (result, index) => {
        if (
          result.status ===
          "fulfilled"
        ) {
          return result.value;
        }

        console.warn(
          `SST spatial sample failed (${samplePoints[index]?.direction ?? "unknown"}):`,
          result.reason
        );

        return {
          direction:
            samplePoints[index]
              ?.direction ??
            null,

          requestedLatitude:
            samplePoints[index]
              ?.latitude ??
            null,

          requestedLongitude:
            samplePoints[index]
              ?.longitude ??
            null,

          resolvedLatitude:
            null,

          resolvedLongitude:
            null,

          temperatureCelsius:
            null,

          temperatureFahrenheit:
            null,

          observedAt:
            null,

          source: {
            provider:
              "Open-Meteo",

            classification:
              "forecast-model",

            availability:
              "request-failed"
          },

          cache: {
            status:
              "not-cached",

            ageSeconds:
              null,

            ttlSeconds:
              SST_POINT_CACHE_TTL_MS /
              1000
          }
        };
      }
    );

  const validTemperatures = [
    centerTemperatureFahrenheit,
    ...samples.map(
      sample =>
        sample
          .temperatureFahrenheit
    )
  ].filter(
    Number.isFinite
  );

  const validNeighborCount =
    samples.filter(
      sample =>
        Number.isFinite(
          sample
            .temperatureFahrenheit
        )
    ).length;

  const centerTemperatureAvailable =
    Number.isFinite(
      centerTemperatureFahrenheit
    );

  const sufficientCoverage =
    validNeighborCount >= 3;

  const minimumFahrenheit =
    sufficientCoverage
      ? Math.min(
          ...validTemperatures
        )
      : null;

  const maximumFahrenheit =
    sufficientCoverage
      ? Math.max(
          ...validTemperatures
        )
      : null;

  const rangeFahrenheit =
    sufficientCoverage
      ? Number(
          (
            maximumFahrenheit -
            minimumFahrenheit
          ).toFixed(1)
        )
      : null;

  const orientation =
    deriveSstTransitionOrientation(
      samples
    );

  const confidence =
    assessSstTransitionConfidence({
      samples,
      sufficientCoverage,
      rangeFahrenheit,
      orientation
    });

  return {
    sampleRadiusNauticalMiles:
      SST_SPATIAL_SAMPLE_RADIUS_NM,

    validNeighborCount,

    expectedNeighborCount:
      samplePoints.length,

    centerTemperatureAvailable,

    minimumFahrenheit,

    maximumFahrenheit,

    rangeFahrenheit,

    classification:
      classifySstSpatialRange(
        rangeFahrenheit
      ),

    interpretation:
      "local-spatial-temperature-structure",

    thresholdVersion:
      "pelora-sst-spatial-range-v1",

    coverage:
      sufficientCoverage
        ? "sufficient"
        : "insufficient",

    orientation,

    confidence,

    samples,

    limitations: [
      "forecast-model-samples",
      "single-time-snapshot",
      "does-not-confirm-persistence",
      "does-not-confirm-ocean-front",
      "does-not-indicate-species-suitability"
    ]
  };
}


async function getMarineConditions(
  latitude,
  longitude
) {
  const weatherUrl =
    new URL(
      "https://api.open-meteo.com/v1/forecast"
    );

  weatherUrl.searchParams.set(
    "latitude",
    String(latitude)
  );

  weatherUrl.searchParams.set(
    "longitude",
    String(longitude)
  );

  weatherUrl.searchParams.set(
    "cell_selection",
    "sea"
  );

  weatherUrl.searchParams.set(
    "current",
    [
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m"
    ].join(",")
  );

  weatherUrl.searchParams.set(
    "wind_speed_unit",
    "ms"
  );

  weatherUrl.searchParams.set(
    "timezone",
    "UTC"
  );


  const marineUrl =
    new URL(
      "https://marine-api.open-meteo.com/v1/marine"
    );

  marineUrl.searchParams.set(
    "latitude",
    String(latitude)
  );

  marineUrl.searchParams.set(
    "longitude",
    String(longitude)
  );

  marineUrl.searchParams.set(
    "cell_selection",
    "sea"
  );

 marineUrl.searchParams.set(
  "current",
  [
    "wave_height",
    "wave_direction",
    "wave_period",
    "swell_wave_height",
    "swell_wave_direction",
    "swell_wave_period",
    "sea_surface_temperature"
  ].join(",")
);

  marineUrl.searchParams.set(
    "timezone",
    "UTC"
  );


  const marineConditionsStartedAt =
    performance.now();

  const [
    weatherResult,
    marineResult
  ] = await Promise.all([
    settleWithTiming(
      () =>
        fetchJson(
          weatherUrl,
          {
            timeoutMilliseconds:
              3000,

            provider:
              "Open-Meteo Weather API"
          }
        )
    ),

    settleWithTiming(
      () =>
        fetchJson(
          marineUrl,
          {
            timeoutMilliseconds:
              3000,

            provider:
              "Open-Meteo Marine API"
          }
        )
    )
  ]);


const weather =
  weatherResult.status === "fulfilled"
    ? weatherResult.value
    : null;


const marine =
  marineResult.status === "fulfilled"
    ? marineResult.value
    : null;


if (!weather && !marine) {
  throw new Error(
    "Both weather and marine data providers are temporarily unavailable."
  );
}


if (
  weatherResult.status === "rejected"
) {
  console.warn(
    "Weather data request failed:",
    weatherResult.reason
      ?.message ??
    weatherResult.reason
  );
}


if (
  marineResult.status === "rejected"
) {
  console.warn(
    "Marine data request failed:",
    marineResult.reason
      ?.message ??
    marineResult.reason
  );
}


  const wind =
    weather?.current ?? {};

  const waves =
    marine?.current ?? {};


  const windSpeedKnots =
    metersPerSecondToKnots(
      wind.wind_speed_10m
    );

  const windDirectionDegrees =
    safeNumber(
      wind.wind_direction_10m
    );

  const windGustKnots =
    metersPerSecondToKnots(
      wind.wind_gusts_10m
    );


  const windHasAnyValue =
    Number.isFinite(
      windSpeedKnots
    ) ||
    Number.isFinite(
      windDirectionDegrees
    ) ||
    Number.isFinite(
      windGustKnots
    );


  const windAvailability =
    windHasAnyValue
      ? "available"
      : weatherResult.status ===
        "rejected"
        ? "provider-request-failed"
        : weather?.current
          ? "provider-returned-null"
          : "provider-returned-no-current-data";


  return {
    location: {
      latitude,
      longitude
    },

    observedAt:
      wind.time ??
      waves.time ??
      null,

    retrievedAt:
      new Date().toISOString(),

   classification: {
  wind:
    weather
      ? "forecast-model"
      : "unavailable",

  waves:
    marine
      ? "forecast-model"
      : "unavailable"
},

    wind: {
      speedKnots:
        windSpeedKnots,

      directionDegrees:
        windDirectionDegrees,

      gustKnots:
        windGustKnots,

      source: {
        provider:
          "Open-Meteo Weather API",

        classification:
          "forecast-model",

        availability:
          windAvailability
      }
    },

    waves: {
      heightFeet:
        metersToFeet(
          waves.wave_height
        ),

      directionDegrees:
        safeNumber(
          waves.wave_direction
        ),

      periodSeconds:
        safeNumber(
          waves.wave_period
        )
    },

    swell: {
      heightFeet:
        metersToFeet(
          waves.swell_wave_height
        ),

      directionDegrees:
        safeNumber(
          waves.swell_wave_direction
        ),

      periodSeconds:
        safeNumber(
          waves.swell_wave_period
        )
    },


    sst: {
  temperatureFahrenheit:
    celsiusToFahrenheit(
      waves.sea_surface_temperature
    ),

  temperatureCelsius:
    safeNumber(
      waves.sea_surface_temperature
    )
},


    source: {
      provider:
        "Open-Meteo",

      weatherModel:
        weather?.current_units
          ? "Weather Forecast API"
          : null,

      marineModel:
        marine?.current_units
          ? "Marine Forecast API"
          : null
    },

    diagnostics: {
      timingsMilliseconds: {
        weatherApi:
          weatherResult
            .durationMilliseconds,

        marineApi:
          marineResult
            .durationMilliseconds,

        total:
          Number(
            (
              performance.now() -
              marineConditionsStartedAt
            ).toFixed(1)
          )
      },

      providerStatus: {
        weatherApi:
          weatherResult.status,

        marineApi:
          marineResult.status
      },

      providerErrors: {
        weatherApi:
          weatherResult.status ===
          "rejected"
            ? weatherResult.reason
                ?.message ??
              String(
                weatherResult.reason
              )
            : null,

        marineApi:
          marineResult.status ===
          "rejected"
            ? marineResult.reason
                ?.message ??
              String(
                marineResult.reason
              )
            : null
      }
    }
  };
}



export function buildAssessmentConfidence({
  wind,
  waves,
  swell,
  directionalInteraction,
  dataQuality
}) {
  let score = 1;

  const reasons = [];
  const limitations = [];

  const components = {
    wind: {
      available:
        Number.isFinite(
          wind?.speedKnots
        ),
      gustsAvailable:
        Number.isFinite(
          wind?.gustKnots
        ),
      directionAvailable:
        Number.isFinite(
          wind?.directionDegrees
        )
    },

    waves: {
      available:
        Number.isFinite(
          waves?.heightFeet
        ),
      periodAvailable:
        Number.isFinite(
          waves?.periodSeconds
        ),
      directionAvailable:
        Number.isFinite(
          waves?.directionDegrees
        )
    },

    swell: {
      available:
        Number.isFinite(
          swell?.heightFeet
        ),
      periodAvailable:
        Number.isFinite(
          swell?.periodSeconds
        ),
      directionAvailable:
        Number.isFinite(
          swell?.directionDegrees
        )
    }
  };


  if (
    components.wind.available
  ) {
    reasons.push(
      "Wind data is available."
    );
  } else {
    score -= 0.2;

    limitations.push(
      "Wind data is unavailable."
    );
  }


  if (
    components.waves.available
  ) {
    reasons.push(
      "Combined-wave data is available."
    );
  } else {
    score -= 0.2;

    limitations.push(
      "Combined-wave data is unavailable."
    );
  }


  if (
    components.swell.available
  ) {
    reasons.push(
      "Swell data is available."
    );
  } else {
    score -= 0.2;

    limitations.push(
      "Swell data is unavailable."
    );
  }


  if (
    components.wind.available &&
    !components.wind.gustsAvailable
  ) {
    score -= 0.05;

    limitations.push(
      "Wind-gust data is unavailable."
    );
  }


  const availableDirections = [
    components.wind
      .directionAvailable,

    components.waves
      .directionAvailable,

    components.swell
      .directionAvailable
  ].filter(Boolean).length;


  if (
    availableDirections >= 2 &&
    directionalInteraction
      ?.classification !==
        "unavailable"
  ) {
    reasons.push(
      "Directional interaction can be assessed from available marine components."
    );
  } else {
    score -= 0.1;

    limitations.push(
      "Directional interaction is incomplete because fewer than two directions are available."
    );
  }


  const dataQualityClassification =
    dataQuality?.overall
      ?.classification ??
    "unknown";

  const degradedDataQuality =
    [
      "degraded",
      "poor",
      "low",
      "unavailable"
    ].some(
      value =>
        String(
          dataQualityClassification
        )
          .toLowerCase()
          .includes(value)
    );


  if (
    degradedDataQuality
  ) {
    score -= 0.05;

    limitations.push(
      "The supporting data-quality assessment indicates degraded evidence."
    );
  } else if (
    dataQualityClassification !==
      "unknown"
  ) {
    reasons.push(
      "Supporting data quality has been assessed."
    );
  }


  score = Math.max(
    0,
    Math.min(
      1,
      Number(
        score.toFixed(2)
      )
    )
  );


  let level =
    "very-low";

  let label =
    "Very Low";


  if (
    score >= 0.95
  ) {
    level =
      "very-high";

    label =
      "Very High";
  } else if (
    score >= 0.8
  ) {
    level =
      "high";

    label =
      "High";
  } else if (
    score >= 0.6
  ) {
    level =
      "moderate";

    label =
      "Moderate";
  } else if (
    score >= 0.4
  ) {
    level =
      "low";

    label =
      "Low";
  }


  return {
    score,
    level,
    label,
    reasons,
    limitations,
    components,
    methodVersion:
      "pelora-assessment-confidence-v1.0"
  };
}


export function assessOceanConditions({
  wind,
  waves,
  swell,
  dataQuality
}) {
  const severityRank = {
    favorable: 0,
    "use-caution": 1,
    hazardous: 2
  };


  const normalizeDirection =
    directionDegrees => {
      if (
        !Number.isFinite(
          directionDegrees
        )
      ) {
        return null;
      }

      return (
        (
          directionDegrees %
          360
        ) +
        360
      ) %
      360;
    };


  const directionDifference =
    (
      firstDirection,
      secondDirection
    ) => {
      const first =
        normalizeDirection(
          firstDirection
        );

      const second =
        normalizeDirection(
          secondDirection
        );


      if (
        first === null ||
        second === null
      ) {
        return null;
      }


      const difference =
        Math.abs(
          first -
          second
        );


      return Math.min(
        difference,
        360 - difference
      );
    };


  const classifyDirectionalDifference =
    differenceDegrees => {
      if (
        !Number.isFinite(
          differenceDegrees
        )
      ) {
        return "unavailable";
      }

      if (
        differenceDegrees <= 30
      ) {
        return "aligned";
      }

      if (
        differenceDegrees >= 150
      ) {
        return "opposing";
      }

      if (
        differenceDegrees >= 60 &&
        differenceDegrees <= 120
      ) {
        return "crossing";
      }

      return "angled";
    };


  const classifyWavePeriod =
    periodSeconds => {
      if (
        !Number.isFinite(
          periodSeconds
        )
      ) {
        return "unknown";
      }

      if (
        periodSeconds < 5
      ) {
        return "very-short-period";
      }

      if (
        periodSeconds < 7
      ) {
        return "short-period";
      }

      if (
        periodSeconds < 10
      ) {
        return "moderate-period";
      }

      return "long-period";
    };


  const assessWind = () => {
    const speedKnots =
      Number.isFinite(
        wind?.speedKnots
      )
        ? wind.speedKnots
        : null;

    const gustKnots =
      Number.isFinite(
        wind?.gustKnots
      )
        ? wind.gustKnots
        : null;


    if (
      speedKnots === null &&
      gustKnots === null
    ) {
      return {
        classification:
          "unavailable",

        headline:
          "Wind assessment unavailable.",

        detail:
          "Pelora does not currently have a valid wind-speed or gust value.",

        values: {
          speedKnots,
          gustKnots
        }
      };
    }


    if (
      (
        speedKnots !== null &&
        speedKnots > 25
      ) ||
      (
        gustKnots !== null &&
        gustKnots > 30
      )
    ) {
      return {
        classification:
          "hazardous",

        headline:
          "Strong wind conditions detected.",

        detail:
          "Sustained wind or gusts exceed Pelora's initial high-impact threshold.",

        values: {
          speedKnots,
          gustKnots
        }
      };
    }


    if (
      (
        speedKnots !== null &&
        speedKnots > 15
      ) ||
      (
        gustKnots !== null &&
        gustKnots > 20
      )
    ) {
      return {
        classification:
          "use-caution",

        headline:
          "Wind may affect offshore comfort and handling.",

        detail:
          "Wind or gusts exceed Pelora's initial favorable-condition threshold.",

        values: {
          speedKnots,
          gustKnots
        }
      };
    }


    return {
      classification:
        "favorable",

      headline:
        "Wind impact is currently low.",

      detail:
        "Wind and gusts remain within Pelora's initial favorable-condition thresholds.",

      values: {
        speedKnots,
        gustKnots
      }
    };
  };


  const assessWaves = () => {
    const heightFeet =
      Number.isFinite(
        waves?.heightFeet
      )
        ? waves.heightFeet
        : null;

    const periodSeconds =
      Number.isFinite(
        waves?.periodSeconds
      )
        ? waves.periodSeconds
        : null;

    const periodClassification =
      classifyWavePeriod(
        periodSeconds
      );


    if (
      heightFeet === null
    ) {
      return {
        classification:
          "unavailable",

        headline:
          "Wave assessment unavailable.",

        detail:
          "Pelora does not currently have a valid combined wave-height value.",

        values: {
          heightFeet,
          periodSeconds,
          periodClassification
        }
      };
    }


    const hazardousByHeight =
      heightFeet > 6;

    const hazardousBySteepness =
      heightFeet > 5 &&
      periodSeconds !== null &&
      periodSeconds < 6;


    if (
      hazardousByHeight ||
      hazardousBySteepness
    ) {
      return {
        classification:
          "hazardous",

        headline:
          hazardousBySteepness
            ? "High, tightly spaced waves detected."
            : "High combined wave conditions detected.",

        detail:
          hazardousBySteepness
            ? "Wave height and short period indicate a potentially steep, high-impact sea state."
            : "Combined wave height exceeds Pelora's initial high-impact threshold.",

        values: {
          heightFeet,
          periodSeconds,
          periodClassification
        }
      };
    }


    const cautionByHeight =
      heightFeet > 3;

    const cautionByShortPeriod =
      heightFeet >= 2.5 &&
      periodSeconds !== null &&
      periodSeconds < 6;


    if (
      cautionByHeight ||
      cautionByShortPeriod
    ) {
      return {
        classification:
          "use-caution",

        headline:
          cautionByShortPeriod
            ? "Short-period chop may create a rougher ride."
            : "Combined wave conditions may affect offshore comfort.",

        detail:
          cautionByShortPeriod
            ? "The waves are tightly spaced relative to their height, which may increase vessel motion and reduce comfort."
            : "Combined wave height exceeds Pelora's initial favorable-condition threshold.",

        values: {
          heightFeet,
          periodSeconds,
          periodClassification
        }
      };
    }


    return {
      classification:
        "favorable",

      headline:
        periodClassification ===
        "long-period"
          ? "Combined waves are low and broadly spaced."
          : "Combined wave conditions are currently favorable.",

      detail:
        "Wave height and period remain within Pelora's initial favorable-condition thresholds.",

      values: {
        heightFeet,
        periodSeconds,
        periodClassification
      }
    };
  };


  const classifySwellPeriod =
    periodSeconds => {
      if (
        !Number.isFinite(
          periodSeconds
        )
      ) {
        return "unknown";
      }

      if (
        periodSeconds < 6
      ) {
        return "very-short-period";
      }

      if (
        periodSeconds < 9
      ) {
        return "short-period";
      }

      if (
        periodSeconds < 13
      ) {
        return "moderate-period";
      }

      return "long-period";
    };


  const assessSwell = () => {
    const heightFeet =
      Number.isFinite(
        swell?.heightFeet
      )
        ? swell.heightFeet
        : null;

    const periodSeconds =
      Number.isFinite(
        swell?.periodSeconds
      )
        ? swell.periodSeconds
        : null;

    const periodClassification =
      classifySwellPeriod(
        periodSeconds
      );


    if (
      heightFeet === null
    ) {
      return {
        classification:
          "unavailable",

        headline:
          "Swell assessment unavailable.",

        detail:
          "Pelora does not currently have a valid swell-height value.",

        values: {
          heightFeet,
          periodSeconds,
          periodClassification
        }
      };
    }


    const hazardousByHeight =
      heightFeet > 7;

    const hazardousBySteepness =
      heightFeet > 6 &&
      periodSeconds !== null &&
      periodSeconds < 8;


    if (
      hazardousByHeight ||
      hazardousBySteepness
    ) {
      return {
        classification:
          "hazardous",

        headline:
          hazardousBySteepness
            ? "High, tightly spaced swell detected."
            : "High swell conditions detected.",

        detail:
          hazardousBySteepness
            ? "Swell height and short period indicate a potentially steep, high-impact sea state."
            : "Swell height exceeds Pelora's initial high-impact threshold.",

        values: {
          heightFeet,
          periodSeconds,
          periodClassification
        }
      };
    }


    const cautionByHeight =
      heightFeet > 4;

    const cautionBySteepness =
      heightFeet >= 3.5 &&
      periodSeconds !== null &&
      periodSeconds < 7;


    if (
      cautionByHeight ||
      cautionBySteepness
    ) {
      return {
        classification:
          "use-caution",

        headline:
          cautionBySteepness
            ? "Tightly spaced swell may increase vessel motion."
            : "Swell height may affect offshore comfort.",

        detail:
          cautionBySteepness
            ? "The swell is relatively steep for its period, which may create a more abrupt ride."
            : "Swell height exceeds Pelora's initial favorable-condition threshold.",

        values: {
          heightFeet,
          periodSeconds,
          periodClassification
        }
      };
    }


    let headline =
      "Swell conditions are currently favorable.";


    let detail =
      "Swell height remains within Pelora's initial favorable-condition threshold.";


    if (
      periodClassification ===
      "long-period"
    ) {
      headline =
        "Swell is low and broadly spaced.";

      detail =
        "Swell height is low and the longer period indicates broadly spaced swell energy.";
    } else if (
      periodClassification ===
        "very-short-period" &&
      heightFeet < 3.5
    ) {
      headline =
        "Short-period swell remains low.";

      detail =
        "The swell period is short, but the swell height remains below Pelora's initial caution threshold.";
    }


    return {
      classification:
        "favorable",

      headline,

      detail,

      values: {
        heightFeet,
        periodSeconds,
        periodClassification
      }
    };
  };


  const assessDirectionalInteraction =
    () => {
      const windDirectionDegrees =
        Number.isFinite(
          wind?.directionDegrees
        )
          ? wind.directionDegrees
          : null;

      const waveDirectionDegrees =
        Number.isFinite(
          waves?.directionDegrees
        )
          ? waves.directionDegrees
          : null;

      const swellDirectionDegrees =
        Number.isFinite(
          swell?.directionDegrees
        )
          ? swell.directionDegrees
          : null;


      const windVsWavesDegrees =
        directionDifference(
          windDirectionDegrees,
          waveDirectionDegrees
        );

      const windVsSwellDegrees =
        directionDifference(
          windDirectionDegrees,
          swellDirectionDegrees
        );

      const wavesVsSwellDegrees =
        directionDifference(
          waveDirectionDegrees,
          swellDirectionDegrees
        );


      const comparisons = {
        windVsWaves: {
          differenceDegrees:
            windVsWavesDegrees,

          relationship:
            classifyDirectionalDifference(
              windVsWavesDegrees
            )
        },

        windVsSwell: {
          differenceDegrees:
            windVsSwellDegrees,

          relationship:
            classifyDirectionalDifference(
              windVsSwellDegrees
            )
        },

        wavesVsSwell: {
          differenceDegrees:
            wavesVsSwellDegrees,

          relationship:
            classifyDirectionalDifference(
              wavesVsSwellDegrees
            )
        }
      };


      const availableRelationships =
        Object.values(
          comparisons
        )
          .map(
            comparison =>
              comparison.relationship
          )
          .filter(
            relationship =>
              relationship !==
              "unavailable"
          );


      if (
        availableRelationships.length ===
        0
      ) {
        return {
          classification:
            "unavailable",

          headline:
            "Directional interaction is unavailable.",

          detail:
            "Pelora does not currently have enough valid direction data to compare wind, waves, and swell.",

          values: {
            windDirectionDegrees,
            waveDirectionDegrees,
            swellDirectionDegrees
          },

          comparisons
        };
      }


      const windRelationships = [
        comparisons
          .windVsWaves
          .relationship,

        comparisons
          .windVsSwell
          .relationship
      ].filter(
        relationship =>
          relationship !==
          "unavailable"
      );


      let classification =
        "mixed";

      let headline =
        "Marine directions are interacting at an angle.";

      let detail =
        "Wind, combined waves, and swell are not fully aligned or directly opposed.";


      if (
        windRelationships.includes(
          "opposing"
        )
      ) {
        classification =
          "opposing";

        headline =
          "Wind is opposing part of the sea state.";

        detail =
          "Opposing wind and sea directions may produce steeper or less organized conditions.";
      } else if (
        windRelationships.includes(
          "crossing"
        )
      ) {
        classification =
          "crossing";

        headline =
          "Crossing wind and sea directions are present.";

        detail =
          "Crossing directions may contribute to a less organized or more variable ride.";
      } else if (
        windRelationships.length > 0 &&
        windRelationships.every(
          relationship =>
            relationship ===
            "aligned"
        )
      ) {
        classification =
          "aligned";

        headline =
          "Wind and sea directions are broadly aligned.";

        detail =
          "Wind, combined waves, and swell are moving in a broadly consistent directional pattern.";
      } else if (
        windRelationships.length ===
          0 &&
        comparisons
          .wavesVsSwell
          .relationship ===
        "aligned"
      ) {
        classification =
          "aligned";

        headline =
          "Combined waves and swell are broadly aligned.";

        detail =
          "Wave and swell directions follow a consistent pattern. Wind direction is currently unavailable.";
      } else if (
        comparisons
          .wavesVsSwell
          .relationship ===
        "opposing"
      ) {
        classification =
          "mixed";

        headline =
          "Combined waves and swell are directionally mixed.";

        detail =
          "Wave and swell directions differ substantially, which may contribute to a less organized sea state.";
      }


      return {
        classification,

        headline,

        detail,

        values: {
          windDirectionDegrees,
          waveDirectionDegrees,
          swellDirectionDegrees
        },

        comparisons,

        interpretation:
          "directional-context-not-yet-applied-to-overall-classification"
      };
    };


  const directionalInteraction =
    assessDirectionalInteraction();


  const assessments = {
    wind:
      assessWind(),

    waves:
      assessWaves(),

    swell:
      assessSwell()
  };


  const assessSeaStateInteraction =
    () => {
      const windAssessment =
        assessments.wind;

      const waveAssessment =
        assessments.waves;

      const swellAssessment =
        assessments.swell;

      const directionClassification =
        directionalInteraction
          .classification;


      const availableComponentAssessments = [
        windAssessment,
        waveAssessment,
        swellAssessment
      ].filter(
        assessment =>
          assessment.classification !==
          "unavailable"
      );


      if (
        availableComponentAssessments.length ===
        0
      ) {
        return {
          classification:
            "unavailable",

          seaStateType:
            "unavailable",

          headline:
            "Sea-state interaction is unavailable.",

          detail:
            "Pelora does not currently have enough valid wind, wave, or swell information to interpret the combined sea state.",

          drivers: [],

          interpretation:
            "informational-not-yet-applied-to-overall-classification"
        };
      }


      const drivers = [];

      const wavePeriodClassification =
        waveAssessment.values
          ?.periodClassification ??
        "unknown";

      const swellPeriodClassification =
        swellAssessment.values
          ?.periodClassification ??
        "unknown";

      const hasShortPeriodWaves =
        wavePeriodClassification ===
          "very-short-period" ||
        wavePeriodClassification ===
          "short-period";

      const hasShortPeriodSwell =
        swellPeriodClassification ===
          "very-short-period" ||
        swellPeriodClassification ===
          "short-period";

      const hasHazardousComponent =
        availableComponentAssessments.some(
          assessment =>
            assessment.classification ===
            "hazardous"
        );

      const hasCautionComponent =
        availableComponentAssessments.some(
          assessment =>
            assessment.classification ===
            "use-caution"
        );


      if (
        hasShortPeriodWaves
      ) {
        drivers.push(
          "short-period-combined-waves"
        );
      }

      if (
        hasShortPeriodSwell
      ) {
        drivers.push(
          "short-period-swell"
        );
      }

      if (
        directionClassification ===
        "aligned"
      ) {
        drivers.push(
          "aligned-wind-wave-and-swell-directions"
        );
      }

      if (
        directionClassification ===
        "crossing"
      ) {
        drivers.push(
          "crossing-wind-and-sea-directions"
        );
      }

      if (
        directionClassification ===
        "opposing"
      ) {
        drivers.push(
          "opposing-wind-and-sea-directions"
        );
      }

      if (
        directionClassification ===
        "mixed"
      ) {
        drivers.push(
          "mixed-wave-and-swell-directions"
        );
      }


      if (
        hasHazardousComponent
      ) {
        return {
          classification:
            "hazardous",

          seaStateType:
            directionClassification ===
              "opposing"
              ? "high-impact-opposing-seas"
              : directionClassification ===
                  "crossing"
                ? "high-impact-crossing-seas"
                : "high-impact-seas",

          headline:
            "A high-impact combined sea state is present.",

          detail:
            directionClassification ===
              "opposing"
              ? "At least one marine condition is high-impact, and opposing wind and sea directions may further steepen or disorganize the sea state."
              : directionClassification ===
                  "crossing"
                ? "At least one marine condition is high-impact, and crossing directions may create a more confused ride."
                : "At least one wind, wave, or swell condition exceeds Pelora's initial high-impact threshold.",

          drivers,

          interpretation:
            "informational-not-yet-applied-to-overall-classification"
        };
      }


      if (
        directionClassification ===
          "opposing" &&
        hasCautionComponent
      ) {
        return {
          classification:
            "use-caution",

          seaStateType:
            "steep-opposing-seas",

          headline:
            "Opposing wind and sea conditions may steepen the ride.",

          detail:
            "A caution-level marine condition is interacting with opposing directions, which may create a steeper and less comfortable sea state.",

          drivers,

          interpretation:
            "informational-not-yet-applied-to-overall-classification"
        };
      }


      if (
        directionClassification ===
          "crossing" ||
        directionClassification ===
          "mixed"
      ) {
        return {
          classification:
            "use-caution",

          seaStateType:
            "confused-or-crossing-seas",

          headline:
            "The sea state may be directionally confused.",

          detail:
            "Crossing or mixed wind, wave, and swell directions may create irregular vessel motion even when individual measurements are moderate.",

          drivers,

          interpretation:
            "informational-not-yet-applied-to-overall-classification"
        };
      }


      if (
        hasShortPeriodWaves &&
        hasCautionComponent
      ) {
        return {
          classification:
            "use-caution",

          seaStateType:
            directionClassification ===
              "aligned"
              ? "organized-short-period-chop"
              : "short-period-chop",

          headline:
            directionClassification ===
              "aligned"
              ? "The sea is organized, but short-period chop is present."
              : "Short-period chop may create an abrupt ride.",

          detail:
            directionClassification ===
              "aligned"
              ? "Wind, waves, and swell are directionally aligned, but tightly spaced combined waves may still increase vessel motion and reduce comfort."
              : "Tightly spaced combined waves may create a rougher ride despite otherwise moderate marine conditions.",

          drivers,

          interpretation:
            "informational-not-yet-applied-to-overall-classification"
        };
      }


      if (
        hasCautionComponent
      ) {
        return {
          classification:
            "use-caution",

          seaStateType:
            directionClassification ===
              "aligned"
              ? "organized-moderate-seas"
              : "moderate-seas",

          headline:
            "The combined sea state warrants additional caution.",

          detail:
            directionClassification ===
              "aligned"
              ? "The directional pattern is organized, but at least one wind, wave, or swell condition exceeds Pelora's favorable threshold."
              : "At least one wind, wave, or swell condition exceeds Pelora's favorable threshold.",

          drivers,

          interpretation:
            "informational-not-yet-applied-to-overall-classification"
        };
      }


      return {
        classification:
          "favorable",

        seaStateType:
          directionClassification ===
            "aligned"
            ? "organized-low-seas"
            : "low-moderate-seas",

        headline:
          directionClassification ===
            "aligned"
            ? "The combined sea state is low and organized."
            : "The combined sea state is currently favorable.",

        detail:
          directionClassification ===
            "aligned"
            ? "Wind, waves, and swell remain within favorable thresholds and follow a broadly consistent directional pattern."
            : "Wind, waves, and swell remain within Pelora's initial favorable-condition thresholds.",

        drivers,

        interpretation:
          "informational-not-yet-applied-to-overall-classification"
      };
    };


  const seaStateInteraction =
    assessSeaStateInteraction();


  const availableAssessments =
    Object.entries(
      assessments
    ).filter(
      ([, assessment]) =>
        assessment.classification !==
        "unavailable"
    );


  const unavailableAssessmentNames =
    Object.entries(
      assessments
    )
      .filter(
        ([, assessment]) =>
          assessment.classification ===
          "unavailable"
      )
      .map(
        ([name]) =>
          name
      );


  let overallClassification =
    "unavailable";


  if (
    availableAssessments.length > 0
  ) {
    overallClassification =
      availableAssessments.reduce(
        (
          mostRestrictive,
          [, assessment]
        ) =>
          severityRank[
            assessment.classification
          ] >
          severityRank[
            mostRestrictive
          ]
            ? assessment.classification
            : mostRestrictive,
        "favorable"
      );
  }


  const headlineByClassification = {
    favorable:
      "Marine conditions are currently favorable.",

    "use-caution":
      "Some marine conditions warrant additional caution.",

    hazardous:
      "High-impact marine conditions are present.",

    unavailable:
      "Marine-condition assessment is unavailable."
  };


  const factorLabels = {
    wind:
      "wind",

    waves:
      "combined waves",

    swell:
      "swell"
  };


  const formatFactorList =
    factors => {
      const labels =
        factors.map(
          factor =>
            factorLabels[factor] ??
            factor
        );


      if (
        labels.length === 0
      ) {
        return "";
      }


      if (
        labels.length === 1
      ) {
        return labels[0];
      }


      if (
        labels.length === 2
      ) {
        return (
          labels[0] +
          " and " +
          labels[1]
        );
      }


      return (
        labels
          .slice(
            0,
            -1
          )
          .join(", ") +
        ", and " +
        labels[
          labels.length - 1
        ]
      );
    };


  const restrictiveFactors =
    availableAssessments
      .filter(
        ([, assessment]) =>
          assessment.classification ===
          overallClassification
      )
      .map(
        ([factor]) =>
          factor
      );


  const favorableFactors =
    availableAssessments
      .filter(
        ([, assessment]) =>
          assessment.classification ===
          "favorable"
      )
      .map(
        ([factor]) =>
          factor
      );


  let overallDetail =
    "Pelora does not currently have enough valid wind, wave, or swell information to assess marine conditions.";


  if (
    overallClassification ===
    "favorable"
  ) {
    overallDetail =
      "Wind, combined waves, and swell are within Pelora's initial favorable-condition thresholds.";
  }


  if (
    overallClassification ===
    "use-caution"
  ) {
    const waveAssessment =
      assessments.waves;

    const onlyWaveConcern =
      restrictiveFactors.length === 1 &&
      restrictiveFactors[0] ===
        "waves";

    const shortPeriodWaveConcern =
      onlyWaveConcern &&
      (
        waveAssessment.values
          ?.periodClassification ===
          "very-short-period" ||
        waveAssessment.values
          ?.periodClassification ===
          "short-period"
      );


    if (
      shortPeriodWaveConcern
    ) {
      overallDetail =
        "Short-period combined waves are the primary concern.";
    } else {
      overallDetail =
        formatFactorList(
          restrictiveFactors
        ) +
        (
          restrictiveFactors.length ===
          1
            ? " warrants additional caution."
            : " warrant additional caution."
        );
    }


    if (
      favorableFactors.length > 0
    ) {
      overallDetail +=
        " " +
        formatFactorList(
          favorableFactors
        )
          .replace(
            /^./,
            character =>
              character.toUpperCase()
          ) +
        (
          favorableFactors.length ===
          1
            ? " remains favorable."
            : " remain favorable."
        );
    }
  }


  if (
    overallClassification ===
    "hazardous"
  ) {
    overallDetail =
      formatFactorList(
        restrictiveFactors
      )
        .replace(
          /^./,
          character =>
            character.toUpperCase()
        ) +
      (
        restrictiveFactors.length ===
        1
          ? " is the primary high-impact concern."
          : " are the primary high-impact concerns."
      );


    if (
      favorableFactors.length > 0
    ) {
      overallDetail +=
        " " +
        formatFactorList(
          favorableFactors
        )
          .replace(
            /^./,
            character =>
              character.toUpperCase()
          ) +
        (
          favorableFactors.length ===
          1
            ? " remains favorable."
            : " remain favorable."
        );
    }
  }


  const seaStateCanDescribeOverall =
    seaStateInteraction &&
    seaStateInteraction.classification !==
      "unavailable" &&
    seaStateInteraction.headline &&
    seaStateInteraction.detail;


  if (
    seaStateCanDescribeOverall &&
    seaStateInteraction.classification ===
      overallClassification
  ) {
    overallDetail =
      seaStateInteraction.detail;
  }


  const evidence =
    availableAssessments.map(
      ([factor, assessment]) => ({
        factor,

        classification:
          assessment.classification,

        headline:
          assessment.headline
      })
    );


  const limitations = [
    "describes-conditions-not-a-go-or-no-go-command",
    "does-not-replace-official-marine-forecasts",
    "does-not-account-for-vessel-size-or-capability",
    "does-not-account-for-captain-experience",
    "does-not-yet-assess-thunderstorms-visibility-or-tides",
    "uses-initial-conservative-thresholds"
  ];


  if (
    unavailableAssessmentNames.length >
    0
  ) {
    limitations.push(
      "missing-" +
      unavailableAssessmentNames.join(
        "-and-"
      ) +
      "-assessment"
    );
  }


  const confidence =
    buildAssessmentConfidence({
      wind,
      waves,
      swell,
      directionalInteraction,
      dataQuality
    });


  return {
    overall: {
      classification:
        overallClassification,

      headline:
        headlineByClassification[
          overallClassification
        ],

      detail:
        overallDetail
    },

    assessments,

    directionalInteraction,

    seaStateInteraction,

    confidence,

    evidence,

    dataQualityClassification:
      dataQuality?.overall
        ?.classification ??
      "unknown",

    limitations,

    interpretation:
      "plain-language-marine-condition-assessment",

    methodVersion:
      "pelora-ocean-conditions-v1.7"
  };
}


/**
 * ------------------------------------------------------------
 * Ocean Evidence Engine
 * ------------------------------------------------------------
 *
 * Purpose:
 * Interpret the environmental evidence currently available
 * without estimating habitat suitability or fishing opportunity.
 *
 * Ocean Evidence answers:
 * "What evidence does the ocean currently provide?"
 *
 * Opportunity and species suitability are evaluated by later
 * Pelora engines.
 */
export function assessOceanEvidence({
  sst,
  chlorophyll,
  currents,
  dataQuality
}) {
  const temperature =
    buildTemperatureEvidence(sst);

  const current =
    buildCurrentEvidence(currents);

  const productivity =
    buildProductivityEvidence(
      chlorophyll
    );

  const clarity =
    buildClarityEvidence(
      chlorophyll
    );

  const structure =
    buildStructureEvidence();

  return {
    summary: {
      classification: null,
      headline: null,
      supportingGroupCount: 0,
      availableGroupCount: 0
    },

    groups: {
      temperature,
      current,
      productivity,
      clarity,
      structure
    },

    confidence: {
      score: 0,
      level: "Very Low",
      reasons: [],
      limitations: [],
      components: {},
      methodVersion:
        "pelora-ocean-evidence-confidence-v1"
    },

    limitations: [],

    methodVersion:
      "pelora-ocean-evidence-v1.0"
  };
}


function buildTemperatureEvidence(
  sst
) {
  return {};
}


function buildCurrentEvidence(
  currents
) {
  return {};
}


function buildProductivityEvidence(
  chlorophyll
) {
  return {};
}


function buildClarityEvidence(
  chlorophyll
) {
  return {};
}


function buildStructureEvidence() {
  return {
    available: false,

    reason:
      "structure-analysis-not-yet-implemented"
  };
}


async function getOceanConditions(
  latitude,
  longitude
) {
  const oceanRequestStartedAt =
    performance.now();

  const [
    marineResult,
    chlorophyllResult,
    currentsResult
  ] = await Promise.all([
    settleWithTiming(
      () =>
        getMarineConditions(
          latitude,
          longitude
        )
    ),

    settleWithTiming(
      () =>
        getChlorophyllConditions(
          latitude,
          longitude
        )
    ),

    settleWithTiming(
      () =>
        getCurrentConditions(
          latitude,
          longitude
        )
    )
  ]);

  const initialProviderPhaseMilliseconds =
    Number(
      (
        Math.max(
          marineResult
            .durationMilliseconds,
          chlorophyllResult
            .durationMilliseconds,
          currentsResult
            .durationMilliseconds
        )
      ).toFixed(1)
    );


  if (
    marineResult.status === "rejected"
  ) {
    throw marineResult.reason;
  }


  const marine =
    marineResult.value;


  const moon =
    getMoonConditions();


  const sstSpatialResult =
    await settleWithTiming(
      () =>
        getSstSpatialStructure(
          latitude,
          longitude,
          marine.sst
            ?.temperatureFahrenheit ??
          null
        )
    );

  const sstSpatial =
    sstSpatialResult.status ===
    "fulfilled"
      ? sstSpatialResult.value
      : {
          sampleRadiusNauticalMiles:
            SST_SPATIAL_SAMPLE_RADIUS_NM,

          validNeighborCount: 0,
          expectedNeighborCount: 4,
          minimumFahrenheit: null,
          maximumFahrenheit: null,
          rangeFahrenheit: null,
          classification: null,
          interpretation:
            "local-spatial-temperature-structure",
          thresholdVersion:
            "pelora-sst-spatial-range-v1",
          coverage:
            "unavailable",
          samples: [],
          limitations: [
            "spatial-sampling-unavailable",
            "does-not-confirm-ocean-front",
            "does-not-indicate-species-suitability"
          ]
        };

  if (
    sstSpatialResult.status ===
    "rejected"
  ) {
    console.warn(
      "SST spatial analysis failed:",
      sstSpatialResult.reason
    );
  }




  const chlorophyll =
    chlorophyllResult.status ===
    "fulfilled"
      ? chlorophyllResult.value
      : {
          concentrationMgM3: null,
          waterClassification: null,
          observedAt: null,
          ageHours: null,
          source: {
            provider:
              "NOAA CoastWatch",

            dataset:
              CHLOROPHYLL_DATASET,

            classification:
              "satellite-observation",

            availability:
              "provider-unavailable"
          }
        };


  const currents =
    currentsResult.status ===
    "fulfilled"
      ? currentsResult.value
      : {
          speedKnots: null,
          directionDegrees: null,
          eastwardMetersPerSecond: null,
          northwardMetersPerSecond: null,
          observedAt: null,
          ageHours: null,
          source: {
            provider:
              "NOAA CoastWatch",

            dataset:
              CURRENTS_DATASET,

            classification:
              "altimetry-derived-geostrophic-current",

            availability:
              "provider-unavailable"
          }
        };


  if (
    chlorophyllResult.status ===
    "rejected"
  ) {
    console.warn(
      "Chlorophyll data request failed:",
      chlorophyllResult.reason
    );
  }


  if (
    currentsResult.status ===
    "rejected"
  ) {
    console.warn(
      "Current data request failed:",
      currentsResult.reason
    );
  }


  const chlorophyllHasValue =
    Number.isFinite(
      chlorophyll
        .concentrationMgM3
    );


  const chlorophyllIsCurrent =
    chlorophyllHasValue &&
    Number.isFinite(
      chlorophyll.ageHours
    ) &&
    chlorophyll.ageHours <=
      CHLOROPHYLL_MAX_LIVE_AGE_HOURS;


  const currentsHaveValue =
    Number.isFinite(
      currents.speedKnots
    ) &&
    Number.isFinite(
      currents.directionDegrees
    );


  const currentsAreCurrent =
    currentsHaveValue &&
    Number.isFinite(
      currents.ageHours
    ) &&
    currents.ageHours <=
      CURRENTS_MAX_LIVE_AGE_HOURS;


  const weatherProviderStatus =
    marine.diagnostics
      ?.providerStatus
      ?.weatherApi ??
    "unknown";


  const marineProviderStatus =
    marine.diagnostics
      ?.providerStatus
      ?.marineApi ??
    "unknown";


  const dataQualityLayers = {
    wind: {
      state:
        Number.isFinite(
          marine.wind?.speedKnots
        )
          ? "live"
          : weatherProviderStatus ===
            "rejected"
            ? "degraded"
            : "unavailable",

      reason:
        Number.isFinite(
          marine.wind?.speedKnots
        )
          ? "current-model-value-available"
          : weatherProviderStatus ===
            "rejected"
            ? "weather-provider-request-failed"
            : "no-valid-wind-value",

      observedAt:
        marine.observedAt ??
        null,

      source:
        "Open-Meteo Weather API"
    },

    waves: {
      state:
        Number.isFinite(
          marine.waves?.heightFeet
        )
          ? "live"
          : marineProviderStatus ===
            "rejected"
            ? "degraded"
            : "unavailable",

      reason:
        Number.isFinite(
          marine.waves?.heightFeet
        )
          ? "current-model-value-available"
          : marineProviderStatus ===
            "rejected"
            ? "marine-provider-request-failed"
            : "no-valid-wave-value",

      observedAt:
        marine.observedAt ??
        null,

      source:
        "Open-Meteo Marine API"
    },

    swell: {
      state:
        Number.isFinite(
          marine.swell?.heightFeet
        )
          ? "live"
          : marineProviderStatus ===
            "rejected"
            ? "degraded"
            : "unavailable",

      reason:
        Number.isFinite(
          marine.swell?.heightFeet
        )
          ? "current-model-value-available"
          : marineProviderStatus ===
            "rejected"
            ? "marine-provider-request-failed"
            : "no-valid-swell-value",

      observedAt:
        marine.observedAt ??
        null,

      source:
        "Open-Meteo Marine API"
    },

    sst: {
      state:
        Number.isFinite(
          marine.sst
            ?.temperatureFahrenheit
        )
          ? "live"
          : marineProviderStatus ===
            "rejected"
            ? "degraded"
            : "unavailable",

      reason:
        Number.isFinite(
          marine.sst
            ?.temperatureFahrenheit
        )
          ? "current-model-value-available"
          : marineProviderStatus ===
            "rejected"
            ? "marine-provider-request-failed"
            : "no-valid-center-temperature",

      observedAt:
        marine.observedAt ??
        null,

      source:
        "Open-Meteo Marine API"
    },

    chlorophyll: {
      state:
        chlorophyllIsCurrent
          ? "live"
          : chlorophyllHasValue
            ? "stale"
            : chlorophyllResult.status ===
              "rejected"
              ? "degraded"
              : "unavailable",

      reason:
        chlorophyllIsCurrent
          ? "current-satellite-observation"
          : chlorophyllHasValue
            ? "observation-exceeds-live-age-limit"
            : chlorophyllResult.status ===
              "rejected"
              ? "chlorophyll-provider-request-failed"
              : chlorophyll.source
                  ?.availability ??
                "no-valid-chlorophyll-pixel",

      observedAt:
        chlorophyll.observedAt ??
        null,

      ageHours:
        chlorophyll.ageHours ??
        null,

      source:
        "NOAA CoastWatch"
    },

    currents: {
      state:
        currentsAreCurrent
          ? "live"
          : currentsHaveValue
            ? "stale"
            : currentsResult.status ===
              "rejected"
              ? "degraded"
              : "unavailable",

      reason:
        currentsAreCurrent
          ? "current-derived-observation"
          : currentsHaveValue
            ? "observation-exceeds-live-age-limit"
            : currentsResult.status ===
              "rejected"
              ? "currents-provider-request-failed"
              : currents.source
                  ?.availability ??
                "no-valid-current-value",

      observedAt:
        currents.observedAt ??
        null,

      ageHours:
        currents.ageHours ??
        null,

      source:
        "NOAA CoastWatch"
    },

    moon: {
      state:
        moon.source?.availability ===
        "available"
          ? "calculated"
          : "unavailable",

      reason:
        moon.source?.availability ===
        "available"
          ? "local-astronomical-calculation"
          : "moon-calculation-unavailable",

      observedAt:
        moon.observedAt ??
        null,

      source:
        "Pelora"
    }
  };


  const dataQualityStates =
    Object.values(
      dataQualityLayers
    ).map(
      layer =>
        layer.state
    );


  const coreOperationalLayerNames = [
    "wind",
    "waves",
    "swell",
    "sst"
  ];


  const supportingEvidenceLayerNames = [
    "chlorophyll",
    "currents",
    "moon"
  ];


  const coreOperationalLayers =
    coreOperationalLayerNames.map(
      name =>
        dataQualityLayers[name]
    );


  const supportingEvidenceLayers =
    supportingEvidenceLayerNames.map(
      name =>
        dataQualityLayers[name]
    );


  const coreAvailableCount =
    coreOperationalLayers.filter(
      layer =>
        [
          "live",
          "calculated"
        ].includes(
          layer.state
        )
    ).length;


  const supportingAvailableCount =
    supportingEvidenceLayers.filter(
      layer =>
        [
          "live",
          "calculated",
          "stale"
        ].includes(
          layer.state
        )
    ).length;


  const degradedLayerCount =
    dataQualityStates.filter(
      state =>
        state === "degraded"
    ).length;


  let overallClassification =
    "insufficient";


  let overallReason =
    "insufficient-core-operational-data";


  if (
    coreAvailableCount ===
      coreOperationalLayerNames.length &&
    supportingAvailableCount ===
      supportingEvidenceLayerNames.length &&
    degradedLayerCount === 0
  ) {
    overallClassification =
      "complete";

    overallReason =
      "all-core-and-supporting-layers-available";
  } else if (
    coreAvailableCount ===
      coreOperationalLayerNames.length &&
    degradedLayerCount === 0
  ) {
    overallClassification =
      "usable-with-gaps";

    overallReason =
      "all-core-layers-available-with-supporting-data-gaps";
  } else if (
    coreAvailableCount >= 2
  ) {
    overallClassification =
      "degraded";

    overallReason =
      "partial-core-operational-coverage";
  }


  const unavailableLayerNames =
    Object.entries(
      dataQualityLayers
    )
      .filter(
        ([, layer]) =>
          [
            "unavailable",
            "degraded"
          ].includes(
            layer.state
          )
      )
      .map(
        ([name]) =>
          name
      );


  const formatLayerName =
    name => {
      const labels = {
        wind:
          "wind",

        waves:
          "wave conditions",

        swell:
          "swell conditions",

        sst:
          "sea-surface temperature",

        chlorophyll:
          "chlorophyll imagery",

        currents:
          "current data",

        moon:
          "moon information"
      };

      return (
        labels[name] ??
        name
      );
    };


  const formatLayerList =
    names => {
      const labels =
        names.map(
          formatLayerName
        );

      if (
        labels.length === 0
      ) {
        return "";
      }

      if (
        labels.length === 1
      ) {
        return labels[0];
      }

      if (
        labels.length === 2
      ) {
        return (
          labels[0] +
          " and " +
          labels[1]
        );
      }

      return (
        labels
          .slice(
            0,
            -1
          )
          .join(
            ", "
          ) +
        ", and " +
        labels[
          labels.length -
          1
        ]
      );
    };


  const unavailableLayerList =
    formatLayerList(
      unavailableLayerNames
    );


  const capitalizedUnavailableLayerList =
    unavailableLayerList
      ? (
          unavailableLayerList
            .charAt(0)
            .toUpperCase() +
          unavailableLayerList.slice(1)
        )
      : "";


  let overallHeadline =
    "Ocean data is currently insufficient.";


  let overallDetail =
    "Pelora does not have enough current operational data to provide a dependable ocean assessment for this location.";


  if (
    overallClassification ===
    "complete"
  ) {
    overallHeadline =
      "Current ocean data is fully available.";

    overallDetail =
      "Core ocean conditions and supporting evidence are available for this location.";
  } else if (
    overallClassification ===
    "usable-with-gaps"
  ) {
    overallHeadline =
      "Core ocean conditions are available.";

    overallDetail =
      unavailableLayerNames.length > 0
        ? (
            capitalizedUnavailableLayerList +
            " is currently unavailable, but the remaining core ocean conditions are available."
          )
        : "Core ocean conditions are available, with minor supporting-data limitations.";
  } else if (
    overallClassification ===
    "degraded"
  ) {
    overallHeadline =
      "Some ocean conditions are unavailable.";

    overallDetail =
      unavailableLayerNames.length > 0
        ? (
            "Pelora is missing " +
            formatLayerList(
              unavailableLayerNames
            ) +
            ". Use the available information with additional caution."
          )
        : "Only partial core ocean-condition coverage is currently available.";
  }


  const dataQuality = {
    overall: {
      classification:
        overallClassification,

      reason:
        overallReason,

      headline:
        overallHeadline,

      detail:
        overallDetail,

      coreOperationalCoverage: {
        available:
          coreAvailableCount,

        total:
          coreOperationalLayerNames.length
      },

      supportingEvidenceCoverage: {
        available:
          supportingAvailableCount,

        total:
          supportingEvidenceLayerNames.length
      },

      interpretation:
        "overall-usability-of-current-ocean-inputs"
    },

    layers:
      dataQualityLayers,

    summary: {
      live:
        dataQualityStates.filter(
          state =>
            state === "live"
        ).length,

      calculated:
        dataQualityStates.filter(
          state =>
            state === "calculated"
        ).length,

      stale:
        dataQualityStates.filter(
          state =>
            state === "stale"
        ).length,

      degraded:
        degradedLayerCount,

      unavailable:
        dataQualityStates.filter(
          state =>
            state === "unavailable"
        ).length,

      total:
        dataQualityStates.length
    },

    interpretation:
      "availability-and-freshness-of-input-data",

    methodVersion:
      "pelora-data-quality-v2"
  };



  const oceanConditions =
    assessOceanConditions({
      wind:
        marine.wind,

      waves:
        marine.waves,

      swell:
        marine.swell,

      dataQuality
    });


  return {
    location:
      marine.location,

    observedAt:
      marine.observedAt,

    lastUpdated:
      marine.retrievedAt,

    status: {
      wind:
        Number.isFinite(
          marine.wind?.speedKnots
        )
          ? "live"
          : "unavailable",

      waves:
        Number.isFinite(
          marine.waves?.heightFeet
        )
          ? "live"
          : "unavailable",

      swell:
        Number.isFinite(
          marine.swell?.heightFeet
        )
          ? "live"
          : "unavailable",

      sst:
        Number.isFinite(
          marine.sst
            ?.temperatureFahrenheit
        )
          ? "live"
          : "unavailable",

      chlorophyll:
        chlorophyllIsCurrent
          ? "live"
          : chlorophyllHasValue
            ? "stale"
            : "unavailable",

      currents:
        currentsAreCurrent
          ? "live"
          : currentsHaveValue
            ? "stale"
            : "unavailable",

      moon:
        moon.source?.availability ===
        "available"
          ? "calculated"
          : "unavailable"
    },

    dataQuality,

    oceanConditions,

    wind:
      marine.wind,

    waves:
      marine.waves,

    swell:
      marine.swell,

    sst: {
      temperatureFahrenheit:
        marine.sst
          ?.temperatureFahrenheit ??
        null,

      temperatureCelsius:
        marine.sst
          ?.temperatureCelsius ??
        null,

      derived: {
        temperatureBand:
          classifySeaSurfaceTemperature(
            marine.sst
              ?.temperatureFahrenheit ??
            null
          ),

        interpretation:
          "single-point-temperature-description",

        thresholdVersion:
          "pelora-sst-band-v1",

        limitations: [
          "does-not-identify-fronts",
          "does-not-identify-temperature-breaks",
          "does-not-indicate-species-suitability"
        ],

        spatialStructure:
          sstSpatial
      },

      source: {
        provider:
          "Open-Meteo",

        classification:
          "forecast-model"
      }
    },

    chlorophyll,

    currents,

    moon,

    diagnostics: {
      timingsMilliseconds: {
        marine:
          marineResult
            .durationMilliseconds,

        weatherApi:
          marine.diagnostics
            ?.timingsMilliseconds
            ?.weatherApi ??
          null,

        marineApi:
          marine.diagnostics
            ?.timingsMilliseconds
            ?.marineApi ??
          null,

        chlorophyll:
          chlorophyllResult
            .durationMilliseconds,

        currents:
          currentsResult
            .durationMilliseconds,

        initialProviderPhase:
          initialProviderPhaseMilliseconds,

        sstSpatial:
          sstSpatialResult
            .durationMilliseconds,

        total:
          Number(
            (
              performance.now() -
              oceanRequestStartedAt
            ).toFixed(1)
          )
      },

      openMeteo: {
        providerStatus:
          marine.diagnostics
            ?.providerStatus ??
          {
            weatherApi:
              "unknown",

            marineApi:
              "unknown"
          },

        providerErrors:
          marine.diagnostics
            ?.providerErrors ??
          {
            weatherApi:
              null,

            marineApi:
              null
          }
      },

      executionOrder: [
        "marine-chlorophyll-currents-in-parallel",
        "weather-and-marine-apis-in-parallel",
        "sst-spatial-after-marine"
      ],

      purpose:
        "development-performance-diagnostics"
    },

    source: {
      marine:
        marine.source,

      chlorophyll:
        chlorophyll.source,

      currents:
        currents.source,

      moon:
        moon.source
    }
  };
}


const server =
  http.createServer(
    async (
      request,
      response
    ) => {
      try {
        if (
          request.method === "OPTIONS"
        ) {
          writeJson(
            response,
            204,
            {}
          );

          return;
        }


        const requestUrl =
          new URL(
            request.url,
            `http://${request.headers.host}`
          );


        if (
          request.method === "GET" &&
          requestUrl.pathname ===
            "/api/health"
        ) {
          writeJson(
            response,
            200,
            {
              status: "ok",

              service:
                "Velion Ocean Engine",

              time:
                new Date()
                  .toISOString()
            }
          );

          return;
        }


        if (
          request.method === "GET" &&
          requestUrl.pathname ===
            "/api/live/marine"
        ) {
          const {
            latitude,
            longitude
          } = getCoordinates(requestUrl);


          if (
            !coordinatesAreValid(
              latitude,
              longitude
            )
          ) {
            writeJson(
              response,
              400,
              {
                error:
                  "Coordinates must be within the Gulf region."
              }
            );

            return;
          }


          const conditions =
            await getMarineConditions(
              latitude,
              longitude
            );


          writeJson(
            response,
            200,
            conditions
          );

          return;
        }


        if (
          request.method === "GET" &&
          requestUrl.pathname ===
            "/api/ocean"
        ) {
          const {
            latitude,
            longitude
          } = getCoordinates(requestUrl);


          if (
            !coordinatesAreValid(
              latitude,
              longitude
            )
          ) {
            writeJson(
              response,
              400,
              {
                error:
                  "Coordinates must be within the Gulf region."
              }
            );

            return;
          }


          const oceanConditions =
            await getOceanConditions(
              latitude,
              longitude
            );


          writeJson(
            response,
            200,
            oceanConditions
          );

          return;
        }


        writeJson(
          response,
          404,
          {
            error: "Route not found"
          }
        );
      } catch (error) {
        console.error(
          "Velion API error:",
          error
        );

        writeJson(
          response,
          502,
          {
            error:
              "Unable to retrieve ocean conditions.",

            details:
              error instanceof Error
                ? error.message
                : "Unknown error"
          }
        );
      }
    }
  );


if (
  process.env
    .PELORA_TEST_OCEAN_CONDITIONS !==
  "1"
) {
  server.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `Velion Ocean Engine running on port ${PORT}`
      );

      console.log(
        `Health: http://localhost:${PORT}/api/health`
      );

      console.log(
        `Marine: http://localhost:${PORT}/api/live/marine`
      );

      console.log(
        `Ocean: http://localhost:${PORT}/api/ocean`
      );
    }
  );
}