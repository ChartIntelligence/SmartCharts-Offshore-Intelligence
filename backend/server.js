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
              8000,

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
              8000,

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
  console.error(
    "Both Open-Meteo provider requests failed:",
    {
      weatherError:
        weatherResult.status === "rejected"
          ? weatherResult.reason?.message ??
            weatherResult.reason
          : null,

      marineError:
        marineResult.status === "rejected"
          ? marineResult.reason?.message ??
            marineResult.reason
          : null,

      weatherDurationMilliseconds:
        weatherResult.durationMilliseconds ??
        null,

      marineDurationMilliseconds:
        marineResult.durationMilliseconds ??
        null
    }
  );

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

  const groups = {
    temperature,
    current,
    productivity,
    clarity,
    structure
  };

  const confidence =
    buildOceanEvidenceConfidence({
      groups,
      dataQuality
    });

  const summary =
    buildOceanEvidenceSummary({
      groups,
      confidence
    });

  const limitations = [
    ...new Set([
      ...confidence.limitations,

      ...Object.values(groups)
        .flatMap(
          group =>
            Array.isArray(
              group?.limitations
            )
              ? group.limitations
              : []
        )
    ])
  ];

  return {
    summary,

    groups,

    confidence,

    limitations,

    methodVersion:
      "pelora-ocean-evidence-v1.1"
  };
}


function buildOceanEvidenceConfidence({
  groups,
  dataQuality
}) {
  const groupEntries =
    Object.entries(
      groups ?? {}
    );

  const totalGroupCount =
    groupEntries.length;

  const availableGroups =
    groupEntries.filter(
      ([, group]) =>
        group?.available === true
    );

  const availableGroupCount =
    availableGroups.length;

  const unavailableGroups =
    groupEntries.filter(
      ([, group]) =>
        group?.available !== true
    );

  const unavailableGroupCount =
    unavailableGroups.length;

  const reasons = [];

  const limitations = [];

  /*
   * Coverage contributes up to 70 points.
   *
   * This intentionally treats unavailable evidence groups as
   * missing evidence rather than silently ignoring them.
   */
  const coverageRatio =
    totalGroupCount > 0
      ? availableGroupCount /
        totalGroupCount
      : 0;

  const coverageScore =
    Math.round(
      coverageRatio * 70
    );

  if (
    availableGroupCount ===
    totalGroupCount &&
    totalGroupCount > 0
  ) {
    reasons.push(
      "all-evidence-groups-available"
    );
  } else if (
    availableGroupCount >= 3
  ) {
    reasons.push(
      "multiple-evidence-groups-available"
    );
  } else if (
    availableGroupCount > 0
  ) {
    reasons.push(
      "limited-evidence-groups-available"
    );
  } else {
    limitations.push(
      "no-evidence-groups-available"
    );
  }

  for (
    const [
      groupName
    ] of unavailableGroups
  ) {
    limitations.push(
      `${groupName}-evidence-unavailable`
    );
  }

  /*
   * Observation freshness contributes up to 20 points.
   *
   * Only groups that expose a freshness value participate in
   * this component. Temperature evidence currently has no
   * observation-age field in the evidence contract.
   */
  const freshnessValues =
    availableGroups
      .map(
        ([, group]) =>
          group?.values
            ?.freshness
      )
      .filter(Boolean);

  let freshnessScore = 0;

  let recentCount = 0;
  let agingCount = 0;
  let staleCount = 0;
  let unknownFreshnessCount = 0;

  for (
    const freshness of
      freshnessValues
  ) {
    switch (freshness) {
      case "recent":
        recentCount += 1;
        break;

      case "aging":
        agingCount += 1;
        break;

      case "stale":
        staleCount += 1;
        break;

      default:
        unknownFreshnessCount += 1;
        break;
    }
  }

  if (
    freshnessValues.length > 0
  ) {
    const freshnessPoints =
      (
        recentCount * 1 +
        agingCount * 0.5 +
        staleCount * 0.1
      ) /
      freshnessValues.length;

    freshnessScore =
      Math.round(
        freshnessPoints * 20
      );

    if (
      recentCount ===
      freshnessValues.length
    ) {
      reasons.push(
        "available-timed-observations-recent"
      );
    } else if (
      recentCount > 0
    ) {
      reasons.push(
        "some-observations-recent"
      );
    }

    if (
      agingCount > 0
    ) {
      limitations.push(
        "one-or-more-observations-aging"
      );
    }

    if (
      staleCount > 0
    ) {
      limitations.push(
        "one-or-more-observations-stale"
      );
    }

    if (
      unknownFreshnessCount > 0
    ) {
      limitations.push(
        "one-or-more-observation-ages-unknown"
      );
    }
  } else {
    limitations.push(
      "observation-freshness-not-assessable"
    );
  }

  /*
   * Upstream data quality contributes up to 10 points.
   *
   * The helper accepts either a 0–1 or 0–100 quality score so
   * the evidence layer remains compatible with the existing
   * data-quality contract.
   */
  const rawDataQualityScore =
    Number.isFinite(
      dataQuality?.score
    )
      ? dataQuality.score
      : Number.isFinite(
          dataQuality?.summary
            ?.score
        )
        ? dataQuality.summary
            .score
        : Number.isFinite(
            dataQuality
              ?.confidence
              ?.score
          )
          ? dataQuality
              .confidence
              .score
          : null;

  let normalizedDataQualityScore =
    null;

  if (
    rawDataQualityScore !== null
  ) {
    normalizedDataQualityScore =
      rawDataQualityScore <= 1
        ? rawDataQualityScore *
          100
        : rawDataQualityScore;

    normalizedDataQualityScore =
      Math.max(
        0,
        Math.min(
          100,
          normalizedDataQualityScore
        )
      );
  }

  let dataQualityScore = 0;

  if (
    normalizedDataQualityScore !==
    null
  ) {
    dataQualityScore =
      Math.round(
        normalizedDataQualityScore *
          0.1
      );

    if (
      normalizedDataQualityScore >=
      80
    ) {
      reasons.push(
        "upstream-data-quality-strong"
      );
    } else if (
      normalizedDataQualityScore >=
      60
    ) {
      reasons.push(
        "upstream-data-quality-adequate"
      );
    } else {
      limitations.push(
        "upstream-data-quality-degraded"
      );
    }
  } else {
    /*
     * Unknown quality receives a neutral partial contribution,
     * but is explicitly disclosed as a limitation.
     */
    dataQualityScore = 5;

    limitations.push(
      "upstream-data-quality-score-unavailable"
    );
  }

  /*
   * Preserve the SST spatial-pattern confidence as a reason or
   * limitation without allowing it to dominate the entire
   * multi-group evidence confidence.
   */
  const temperatureConfidence =
    groups?.temperature
      ?.confidence;

  if (
    temperatureConfidence?.level
  ) {
    const normalizedLevel =
      String(
        temperatureConfidence.level
      )
        .trim()
        .toLowerCase()
        .replace(
          /\s+/g,
          "-"
        );

    reasons.push(
      `temperature-spatial-confidence-${normalizedLevel}`
    );
  }

  if (
    Array.isArray(
      temperatureConfidence
        ?.limitations
    )
  ) {
    limitations.push(
      ...temperatureConfidence
        .limitations.map(
          limitation =>
            `temperature-${limitation}`
        )
    );
  }

  const score =
    Math.max(
      0,
      Math.min(
        100,
        coverageScore +
          freshnessScore +
          dataQualityScore
      )
    );

  let level =
    "Very Low";

  if (score >= 80) {
    level = "High";
  } else if (score >= 60) {
    level = "Moderate";
  } else if (score >= 40) {
    level = "Low";
  }

  if (
    availableGroupCount === 0
  ) {
    level = "Very Low";
  }

  return {
    score,

    level,

    reasons: [
      ...new Set(reasons)
    ],

    limitations: [
      ...new Set(limitations)
    ],

    components: {
      coverage: {
        score:
          coverageScore,
        maximumScore: 70,
        ratio:
          Number(
            coverageRatio.toFixed(
              2
            )
          ),
        availableGroupCount,
        unavailableGroupCount,
        totalGroupCount
      },

      freshness: {
        score:
          freshnessScore,
        maximumScore: 20,
        recentCount,
        agingCount,
        staleCount,
        unknownCount:
          unknownFreshnessCount,
        assessedGroupCount:
          freshnessValues.length
      },

      dataQuality: {
        score:
          dataQualityScore,
        maximumScore: 10,
        upstreamScore:
          normalizedDataQualityScore
      }
    },

    methodVersion:
      "pelora-ocean-evidence-confidence-v1.0"
  };
}


function buildOceanEvidenceSummary({
  groups,
  confidence
}) {
  const groupEntries =
    Object.entries(
      groups ?? {}
    );

  const availableGroups =
    groupEntries.filter(
      ([, group]) =>
        group?.available === true
    );

  const availableGroupCount =
    availableGroups.length;

  const supportingGroups =
    availableGroups.filter(
      ([, group]) =>
        group?.classification &&
        group.classification !==
          "unavailable" &&
        group.classification !==
          "clarity-undetermined"
    );

  const supportingGroupCount =
    supportingGroups.length;

  const supportingGroupNames =
    supportingGroups.map(
      ([groupName]) =>
        groupName
    );

  let classification =
    "insufficient-evidence";

  let headline =
    "Ocean evidence is currently insufficient for a broad environmental assessment.";

  let detail =
    "Pelora does not currently have enough available environmental evidence groups to describe the surrounding ocean with confidence.";

  if (
    availableGroupCount >= 4
  ) {
    classification =
      "broad-environmental-evidence";

    headline =
      "Multiple environmental signals are available.";

    detail =
      "Pelora has broad species-neutral evidence describing temperature, water movement, surface productivity, and surface-water characteristics. These signals do not by themselves establish persistence, biological significance, fishing opportunity, habitat quality, or species suitability.";
  } else if (
    availableGroupCount === 3
  ) {
    classification =
      "moderate-environmental-evidence";

    headline =
      "Several environmental signals are available.";

    detail =
      "Pelora has several species-neutral environmental evidence groups available, but important parts of the surrounding ocean remain unobserved or unavailable.";
  } else if (
    availableGroupCount >= 1
  ) {
    classification =
      "limited-environmental-evidence";

    headline =
      "Limited environmental evidence is available.";

    detail =
      "Pelora can describe part of the current environment, but the evidence is too incomplete for a broad ocean assessment.";
  }

  if (
    confidence?.level ===
      "Very Low" &&
    availableGroupCount > 0
  ) {
    detail +=
      " Overall assessment confidence remains very low because coverage, freshness, or upstream data quality is limited.";
  } else if (
    confidence?.level ===
    "Low"
  ) {
    detail +=
      " Overall assessment confidence is low because one or more evidence dimensions are incomplete or degraded.";
  } else if (
    confidence?.level ===
    "Moderate"
  ) {
    detail +=
      " Overall assessment confidence is moderate.";
  } else if (
    confidence?.level ===
    "High"
  ) {
    detail +=
      " Overall assessment confidence is high for describing the observed environmental evidence.";
  }

  return {
    classification,

    headline,

    detail,

    supportingGroupCount,

    availableGroupCount,

    totalGroupCount:
      groupEntries.length,

    supportingGroups:
      supportingGroupNames,

    confidenceLevel:
      confidence?.level ??
      "Very Low",

    confidenceScore:
      confidence?.score ??
      0,

    interpretation:
      "species-neutral-ocean-evidence-summary"
  };
}


function buildTemperatureEvidence(
  sst
) {
  const temperatureFahrenheit =
    Number.isFinite(
      sst?.temperatureFahrenheit
    )
      ? sst.temperatureFahrenheit
      : null;

  const temperatureBand =
    sst?.derived
      ?.temperatureBand ??
    sst?.temperatureBand ??
    classifySeaSurfaceTemperature(
      temperatureFahrenheit
    );

  const spatialStructure =
    sst?.derived
      ?.spatialStructure ??
    sst?.spatialStructure ??
    null;

  const spatialClassification =
    spatialStructure
      ?.classification ??
    null;

  const spatialRangeFahrenheit =
    Number.isFinite(
      spatialStructure
        ?.rangeFahrenheit
    )
      ? spatialStructure
          .rangeFahrenheit
      : null;

  const coverage =
    spatialStructure
      ?.coverage ??
    "unavailable";

  const orientation =
    spatialStructure
      ?.orientation ??
    null;

  const confidence =
    spatialStructure
      ?.confidence ??
    null;

  const centerAvailable =
    temperatureFahrenheit !==
    null;

  const spatialAvailable =
    spatialClassification !==
      null &&
    coverage ===
      "sufficient";

  const available =
    centerAvailable ||
    spatialAvailable;

  const drivers = [];

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          spatialStructure
            ?.limitations
        )
          ? spatialStructure
              .limitations
          : []
      ),

      "single-time-snapshot",
      "does-not-confirm-persistence",
      "does-not-confirm-ocean-front",
      "does-not-establish-biological-significance",
      "does-not-indicate-species-suitability"
    ])
  ];

  if (
    centerAvailable
  ) {
    drivers.push(
      "center-temperature-available"
    );
  }

  if (
    spatialAvailable
  ) {
    drivers.push(
      spatialClassification
    );
  }

  if (
    orientation
      ?.classification ===
      "directional-temperature-transition"
  ) {
    drivers.push(
      "directional-temperature-transition"
    );
  }

  if (
    confidence?.level
  ) {
    drivers.push(
      `spatial-pattern-confidence-${confidence.level}`
    );
  }

  if (
    !available
  ) {
    return {
      available: false,

      classification:
        "unavailable",

      headline:
        "Temperature evidence is unavailable.",

      detail:
        "Pelora does not currently have a valid center temperature or sufficient local spatial temperature coverage.",

      values: {
        temperatureFahrenheit,
        temperatureBand,
        spatialRangeFahrenheit,
        spatialClassification,
        coverage
      },

      orientation,

      confidence,

      drivers,

      limitations: [
        "center-temperature-unavailable",
        "spatial-temperature-structure-unavailable",
        ...limitations
      ],

      interpretation:
        "species-neutral-temperature-structure-evidence"
    };
  }

  let classification =
    "temperature-only";

  let headline =
    "A center temperature observation is available.";

  let detail =
    "Pelora has a valid local temperature value, but sufficient spatial evidence is not currently available to describe nearby temperature structure.";

  if (
    spatialClassification ===
    "uniform-water"
  ) {
    classification =
      "uniform-water";

    headline =
      "Local temperatures are broadly uniform.";

    detail =
      "Nearby samples show little temperature variation within the current sampling radius.";
  } else if (
    spatialClassification ===
    "weak-temperature-transition"
  ) {
    classification =
      "weak-temperature-structure";

    headline =
      "A weak local temperature transition is present.";

    detail =
      "Nearby samples show limited temperature variation. This describes local structure only and does not confirm a persistent front.";
  } else if (
    spatialClassification ===
    "moderate-temperature-transition"
  ) {
    classification =
      "moderate-temperature-structure";

    headline =
      "A moderate local temperature transition is present.";

    detail =
      "Nearby samples show meaningful temperature variation within the current sampling radius. Persistence and biological importance are not yet established.";
  } else if (
    spatialClassification ===
    "strong-temperature-break-candidate"
  ) {
    classification =
      "strong-temperature-break-candidate";

    headline =
      "A strong local temperature-break candidate is present.";

    detail =
      "Nearby samples show a pronounced temperature range. This is a candidate spatial pattern, not confirmation of a persistent ocean front or habitat feature.";
  } else if (
    coverage !==
      "sufficient"
  ) {
    drivers.push(
      "insufficient-spatial-coverage"
    );
  }

  return {
    available: true,

    classification,

    headline,

    detail,

    values: {
      temperatureFahrenheit,
      temperatureBand,
      spatialRangeFahrenheit,
      spatialClassification,
      coverage,

      minimumFahrenheit:
        Number.isFinite(
          spatialStructure
            ?.minimumFahrenheit
        )
          ? spatialStructure
              .minimumFahrenheit
          : null,

      maximumFahrenheit:
        Number.isFinite(
          spatialStructure
            ?.maximumFahrenheit
        )
          ? spatialStructure
              .maximumFahrenheit
          : null,

      validNeighborCount:
        Number.isFinite(
          spatialStructure
            ?.validNeighborCount
        )
          ? spatialStructure
              .validNeighborCount
          : null,

      expectedNeighborCount:
        Number.isFinite(
          spatialStructure
            ?.expectedNeighborCount
        )
          ? spatialStructure
              .expectedNeighborCount
          : null,

      sampleRadiusNauticalMiles:
        Number.isFinite(
          spatialStructure
            ?.sampleRadiusNauticalMiles
        )
          ? spatialStructure
              .sampleRadiusNauticalMiles
          : null
    },

    orientation,

    confidence,

    drivers,

    limitations,

    interpretation:
      "species-neutral-temperature-structure-evidence"
  };
}


function buildCurrentEvidence(
  currents
) {
  const speedKnots =
    Number.isFinite(
      currents?.speedKnots
    )
      ? currents.speedKnots
      : null;

  const directionDegrees =
    Number.isFinite(
      currents?.directionDegrees
    )
      ? currents.directionDegrees
      : null;

  const strengthClassification =
    currents?.derived
      ?.strength ??
    classifyCurrentStrength(
      speedKnots
    );

  const compassDirection =
    currents?.derived
      ?.compassDirection ??
    currentCompassDirection(
      directionDegrees
    );

  const observedAt =
    currents?.observedAt ??
    null;

  const ageHours =
    Number.isFinite(
      currents?.ageHours
    )
      ? currents.ageHours
      : null;

  const sourceAvailability =
    currents?.source
      ?.availability ??
    null;

  const available =
    speedKnots !== null &&
    directionDegrees !== null;

  const drivers = [];

  const limitations = [
    "single-point-current-observation",
    "altimetry-derived-geostrophic-current",
    "does-not-measure-full-water-column-current",
    "does-not-confirm-current-convergence",
    "does-not-confirm-current-shear",
    "does-not-confirm-current-edge",
    "does-not-confirm-eddy-boundary",
    "does-not-confirm-current-organization",
    "does-not-confirm-persistence",
    "does-not-establish-biological-significance",
    "does-not-indicate-species-suitability"
  ];

  if (
    speedKnots !== null
  ) {
    drivers.push(
      "current-speed-available"
    );
  }

  if (
    directionDegrees !== null
  ) {
    drivers.push(
      "current-direction-available"
    );
  }

  if (
    strengthClassification
  ) {
    drivers.push(
      `current-strength-${strengthClassification}`
    );
  }

  if (
    compassDirection
  ) {
    drivers.push(
      `current-flow-toward-${compassDirection}`
    );
  }

  let freshness =
    "unknown";

  if (
    ageHours !== null
  ) {
    if (
      ageHours <= 24
    ) {
      freshness =
        "recent";
    } else if (
      ageHours <= 72
    ) {
      freshness =
        "aging";
    } else {
      freshness =
        "stale";
    }

    drivers.push(
      `observation-${freshness}`
    );
  } else {
    limitations.push(
      "observation-age-unavailable"
    );
  }

  if (
    !available
  ) {
    return {
      available: false,

      classification:
        "unavailable",

      headline:
        "Current evidence is unavailable.",

      detail:
        "Pelora does not currently have a complete current-speed and current-direction vector for this location.",

      values: {
        speedKnots,
        strengthClassification,
        directionDegrees,
        compassDirection,
        observedAt,
        ageHours,
        freshness,
        sourceAvailability
      },

      drivers,

      limitations: [
        "complete-current-vector-unavailable",
        ...limitations
      ],

      interpretation:
        "species-neutral-single-point-current-evidence"
    };
  }

  let classification =
    strengthClassification ??
    "current-observation";

  let headline =
    "A local current observation is available.";

  let detail =
    "Pelora has a single-point current-speed and direction observation. Spatial current structure cannot be determined from this observation alone.";

  if (
    strengthClassification ===
    "weak"
  ) {
    headline =
      "A weak local current is present.";

    detail =
      "The available observation indicates weak current flow at this point. It does not establish nearby convergence, shear, edges, or broader current organization.";
  } else if (
    strengthClassification ===
    "moderate"
  ) {
    headline =
      "A moderate local current is present.";

    detail =
      "The available observation indicates moderate current flow at this point. Spatial organization and persistence are not established.";
  } else if (
    strengthClassification ===
    "strong"
  ) {
    headline =
      "A strong local current is present.";

    detail =
      "The available observation indicates strong current flow at this point. A single observation cannot determine whether the flow forms an edge, convergence zone, shear zone, or persistent feature.";
  } else if (
    strengthClassification ===
    "very-strong"
  ) {
    headline =
      "A very strong local current is present.";

    detail =
      "The available observation indicates very strong current flow at this point. This describes current strength only and does not confirm spatial organization or biological importance.";
  }

  if (
    freshness ===
    "stale"
  ) {
    limitations.push(
      "current-observation-is-stale"
    );
  } else if (
    freshness ===
    "aging"
  ) {
    limitations.push(
      "current-observation-is-aging"
    );
  }

  return {
    available: true,

    classification,

    headline,

    detail,

    values: {
      speedKnots,
      strengthClassification,
      directionDegrees,
      compassDirection,
      directionConvention:
        currents?.source
          ?.directionConvention ??
        "degrees-toward",
      eastwardMetersPerSecond:
        Number.isFinite(
          currents?.eastwardMetersPerSecond
        )
          ? currents
              .eastwardMetersPerSecond
          : null,
      northwardMetersPerSecond:
        Number.isFinite(
          currents?.northwardMetersPerSecond
        )
          ? currents
              .northwardMetersPerSecond
          : null,
      observedAt,
      ageHours,
      freshness,
      sourceAvailability
    },

    drivers,

    limitations: [
      ...new Set(
        limitations
      )
    ],

    interpretation:
      "species-neutral-single-point-current-evidence"
  };
}


function buildProductivityEvidence(
  chlorophyll
) {
  const concentrationMgM3 =
    Number.isFinite(
      chlorophyll?.concentrationMgM3
    )
      ? chlorophyll.concentrationMgM3
      : null;

  const productivityClassification =
    chlorophyll?.waterClassification ??
    classifyChlorophyll(
      concentrationMgM3
    );

  const observedAt =
    chlorophyll?.observedAt ??
    null;

  const ageHours =
    Number.isFinite(
      chlorophyll?.ageHours
    )
      ? chlorophyll.ageHours
      : null;

  const available =
    concentrationMgM3 !== null;

  const drivers = [];

  const limitations = [
    "surface-productivity-only",
    "satellite-observation",
    "single-time-snapshot",
    "does-not-confirm-water-column-productivity",
    "does-not-confirm-bait",
    "does-not-confirm-feeding",
    "does-not-establish-biological-productivity",
    "does-not-indicate-species-suitability"
  ];

  if (available) {
    drivers.push(
      "chlorophyll-available"
    );
  }

  if (
    productivityClassification
  ) {
    drivers.push(
      productivityClassification
    );
  }

  let freshness =
    "unknown";

  if (
    ageHours !== null
  ) {
    if (
      ageHours <=
      CHLOROPHYLL_MAX_LIVE_AGE_HOURS
    ) {
      freshness =
        "recent";
    } else if (
      ageHours <=
      CHLOROPHYLL_MAX_LIVE_AGE_HOURS * 2
    ) {
      freshness =
        "aging";
    } else {
      freshness =
        "stale";
    }

    drivers.push(
      `observation-${freshness}`
    );
  } else {
    limitations.push(
      "observation-age-unavailable"
    );
  }

  if (!available) {
    return {
      available: false,

      classification:
        "unavailable",

      headline:
        "Surface productivity evidence is unavailable.",

      detail:
        "Pelora does not currently have a valid satellite chlorophyll observation for this location.",

      values: {
        concentrationMgM3,
        productivityClassification,
        observedAt,
        ageHours,
        freshness,
        sourceAvailability:
          chlorophyll?.source
            ?.availability ??
          null
      },

      drivers,

      limitations: [
        "satellite-observation-unavailable",
        ...limitations
      ],

      interpretation:
        "species-neutral-surface-productivity-evidence"
    };
  }

  let headline =
    "Surface productivity has been observed.";

  let detail =
    "The available chlorophyll concentration describes observed surface productivity only.";

  switch (
    productivityClassification
  ) {
    case "very-clear-low-productivity":
      headline =
        "Very clear, low-productivity water is present.";

      detail =
        "Satellite observations indicate very low surface chlorophyll concentration.";
      break;

    case "clear-blue-water":
      headline =
        "Clear blue water is present.";

      detail =
        "Satellite observations indicate relatively clear offshore surface water.";
      break;

    case "productive-blue-green-transition":
      headline =
        "A productive blue-green transition is present.";

      detail =
        "Satellite observations indicate moderate surface chlorophyll consistent with transitional water.";
      break;

    case "productive-green-water":
      headline =
        "Productive green water is present.";

      detail =
        "Satellite observations indicate elevated surface chlorophyll concentration.";
      break;

    case "high-chlorophyll-coastal-or-bloom-influenced":
      headline =
        "Very high surface chlorophyll is present.";

      detail =
        "Satellite observations indicate unusually high chlorophyll concentrations that may reflect coastal influence or bloom conditions.";
      break;
  }

  if (
    freshness === "aging"
  ) {
    limitations.push(
      "satellite-observation-aging"
    );
  }

  if (
    freshness === "stale"
  ) {
    limitations.push(
      "satellite-observation-stale"
    );
  }

  return {
    available: true,

    classification:
      productivityClassification,

    headline,

    detail,

    values: {
      concentrationMgM3,
      productivityClassification,
      observedAt,
      ageHours,
      freshness,
      units:
        chlorophyll?.source
          ?.units ??
        "mg m^-3"
    },

    drivers,

    limitations: [
      ...new Set(
        limitations
      )
    ],

    interpretation:
      "species-neutral-surface-productivity-evidence"
  };
}


function buildClarityEvidence(
  chlorophyll
) {
  const concentrationMgM3 =
    Number.isFinite(
      chlorophyll?.concentrationMgM3
    )
      ? chlorophyll.concentrationMgM3
      : null;

  const waterClassification =
    chlorophyll?.waterClassification ??
    classifyChlorophyll(
      concentrationMgM3
    );

  const observedAt =
    chlorophyll?.observedAt ??
    null;

  const ageHours =
    Number.isFinite(
      chlorophyll?.ageHours
    )
      ? chlorophyll.ageHours
      : null;

  const available =
    concentrationMgM3 !== null;

  const drivers = [];

  const limitations = [
    "clarity-inferred-from-surface-chlorophyll",
    "satellite-observation",
    "single-time-snapshot",
    "does-not-directly-measure-visibility",
    "does-not-measure-suspended-sediment",
    "does-not-measure-colored-dissolved-organic-matter",
    "does-not-describe-full-water-column-clarity",
    "does-not-establish-biological-significance",
    "does-not-indicate-species-suitability"
  ];

  if (available) {
    drivers.push(
      "chlorophyll-available"
    );
  }

  if (waterClassification) {
    drivers.push(
      waterClassification
    );
  }

  let freshness =
    "unknown";

  if (
    ageHours !== null
  ) {
    if (
      ageHours <=
      CHLOROPHYLL_MAX_LIVE_AGE_HOURS
    ) {
      freshness =
        "recent";
    } else if (
      ageHours <=
      CHLOROPHYLL_MAX_LIVE_AGE_HOURS * 2
    ) {
      freshness =
        "aging";
    } else {
      freshness =
        "stale";
    }

    drivers.push(
      `observation-${freshness}`
    );
  } else {
    limitations.push(
      "observation-age-unavailable"
    );
  }

  if (!available) {
    return {
      available: false,

      classification:
        "unavailable",

      headline:
        "Surface-water clarity evidence is unavailable.",

      detail:
        "Pelora does not currently have a valid chlorophyll observation from which to infer broad surface-water clarity characteristics.",

      values: {
        concentrationMgM3,
        waterClassification,
        observedAt,
        ageHours,
        freshness,
        sourceAvailability:
          chlorophyll?.source
            ?.availability ??
          null
      },

      drivers,

      limitations: [
        "chlorophyll-observation-unavailable",
        ...limitations
      ],

      interpretation:
        "species-neutral-surface-water-clarity-evidence"
    };
  }

  let classification =
    "clarity-undetermined";

  let headline =
    "Broad surface-water clarity characteristics are available.";

  let detail =
    "Pelora is inferring broad surface-water clarity from chlorophyll concentration. This is not a direct visibility measurement.";

  switch (
    waterClassification
  ) {
    case "very-clear-low-productivity":
      classification =
        "very-clear-surface-water";

      headline =
        "Very clear surface water is indicated.";

      detail =
        "Very low chlorophyll concentration suggests very clear surface water. Actual visibility may still be affected by sediment, dissolved material, weather, or subsurface conditions.";
      break;

    case "clear-blue-water":
      classification =
        "clear-surface-water";

      headline =
        "Clear blue surface water is indicated.";

      detail =
        "Low chlorophyll concentration suggests broadly clear blue surface water. This remains an indirect clarity estimate rather than a direct visibility measurement.";
      break;

    case "productive-blue-green-transition":
      classification =
        "transitional-surface-water";

      headline =
        "Transitional blue-green surface water is indicated.";

      detail =
        "Moderate chlorophyll concentration suggests a transition between clearer blue water and more chlorophyll-influenced water.";
      break;

    case "productive-green-water":
      classification =
        "chlorophyll-influenced-surface-water";

      headline =
        "Chlorophyll-influenced green surface water is indicated.";

      detail =
        "Elevated chlorophyll concentration suggests greener, less optically clear surface water. This does not directly measure underwater visibility.";
      break;

    case "high-chlorophyll-coastal-or-bloom-influenced":
      classification =
        "strongly-chlorophyll-influenced-surface-water";

      headline =
        "Strongly chlorophyll-influenced surface water is indicated.";

      detail =
        "Very high chlorophyll concentration suggests strongly green or bloom-influenced surface water, though sediment or coastal runoff may also affect apparent clarity.";
      break;
  }

  if (
    freshness === "aging"
  ) {
    limitations.push(
      "clarity-inference-based-on-aging-observation"
    );
  }

  if (
    freshness === "stale"
  ) {
    limitations.push(
      "clarity-inference-based-on-stale-observation"
    );
  }

  return {
    available: true,

    classification,

    headline,

    detail,

    values: {
      concentrationMgM3,
      waterClassification,
      observedAt,
      ageHours,
      freshness,
      units:
        chlorophyll?.source
          ?.units ??
        "mg m^-3"
    },

    drivers,

    limitations: [
      ...new Set(
        limitations
      )
    ],

    interpretation:
      "species-neutral-surface-water-clarity-evidence"
  };
}


function buildStructureEvidence() {
  return {
    available: false,

    reason:
      "structure-analysis-not-yet-implemented"
  };
}


/**
 * ------------------------------------------------------------
 * Ocean Opportunity Engine
 * ------------------------------------------------------------
 *
 * Purpose:
 * Identify species-neutral ocean-feature candidates supported
 * by the current Ocean Evidence assessment.
 *
 * Ocean Opportunity answers:
 * "Are the observed environmental signals organizing into a
 * potentially meaningful ocean feature?"
 *
 * This engine does not estimate fishing quality, habitat
 * suitability, bait, feeding activity, fish presence, or
 * species probability.
 */
export function assessOceanOpportunity({
  oceanEvidence
}) {
  const groups =
    oceanEvidence?.groups ??
    {};

  const temperature =
    groups.temperature ??
    {};

  const current =
    groups.current ??
    {};

  const productivity =
    groups.productivity ??
    {};

  const clarity =
    groups.clarity ??
    {};

  const evidenceConfidenceScore =
    Number.isFinite(
      oceanEvidence?.confidence
        ?.score
    )
      ? oceanEvidence.confidence
          .score
      : 0;

  const evidenceConfidenceLevel =
    oceanEvidence?.confidence
      ?.level ??
    "Very Low";

  const opportunities = [];

  const limitations = [
    "single-time-environmental-assessment",
    "does-not-confirm-feature-persistence",
    "does-not-establish-biological-significance",
    "does-not-identify-bait-or-feeding",
    "does-not-indicate-fishing-quality",
    "does-not-indicate-species-presence",
    "does-not-indicate-species-suitability"
  ];

  const temperatureTransitionClassifications =
    new Set([
      "weak-temperature-structure",
      "moderate-temperature-structure",
      "strong-temperature-break-candidate"
    ]);

  const temperatureTransitionPresent =
    temperature?.available ===
      true &&
    temperatureTransitionClassifications
      .has(
        temperature
          ?.classification
      );

  const meaningfulTemperatureTransition =
    temperature?.available ===
      true &&
    (
      temperature
        ?.classification ===
        "moderate-temperature-structure" ||
      temperature
        ?.classification ===
        "strong-temperature-break-candidate"
    );

  const currentAvailable =
    current?.available ===
    true;

  const productivityClassification =
    String(
      productivity
        ?.classification ??
      ""
    ).toLowerCase();

  const clarityClassification =
    String(
      clarity
        ?.classification ??
      ""
    ).toLowerCase();

  const productivityTransitionPresent =
    productivity?.available ===
      true &&
    (
      productivityClassification
        .includes(
          "transition"
        ) ||
      productivityClassification
        .includes(
          "boundary"
        )
    );

  const clarityTransitionPresent =
    clarity?.available ===
      true &&
    (
      clarityClassification
        .includes(
          "transition"
        ) ||
      clarityClassification
        .includes(
          "transitional"
        ) ||
      clarityClassification
        .includes(
          "boundary"
        )
    );

  /*
   * Productivity and clarity are currently derived from the
   * same surface-chlorophyll observation. They therefore count
   * as one supporting source family rather than two independent
   * signals.
   */
  const surfaceWaterTransitionPresent =
    productivityTransitionPresent ||
    clarityTransitionPresent;

  function confidenceLevel(
    score
  ) {
    if (score >= 80) {
      return "High";
    }

    if (score >= 60) {
      return "Moderate";
    }

    if (score >= 40) {
      return "Low";
    }

    return "Very Low";
  }

  function addOpportunity({
    type,
    classification,
    headline,
    detail,
    supportingEvidence,
    sourceFamilies,
    score,
    drivers,
    candidateLimitations
  }) {
    const boundedScore =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(score)
        )
      );

    opportunities.push({
      type,

      classification,

      headline,

      detail,

      supportingEvidence,

      sourceFamilies,

      confidence: {
        score:
          boundedScore,

        level:
          confidenceLevel(
            boundedScore
          ),

        reasons: [
          ...new Set(
            drivers
          )
        ],

        limitations: [
          ...new Set(
            candidateLimitations
          )
        ],

        methodVersion:
          "pelora-ocean-opportunity-candidate-confidence-v1.0"
      },

      drivers: [
        ...new Set(
          drivers
        )
      ],

      limitations: [
        ...new Set(
          candidateLimitations
        )
      ],

      interpretation:
        "species-neutral-ocean-feature-candidate"
    });
  }

  if (
    temperatureTransitionPresent
  ) {
    const strongCandidate =
      temperature
        ?.classification ===
        "strong-temperature-break-candidate";

    addOpportunity({
      type:
        "environmental-transition-zone",

      classification:
        strongCandidate
          ? "strong-temperature-transition-candidate"
          : "temperature-transition-candidate",

      headline:
        strongCandidate
          ? "A pronounced environmental transition candidate is present."
          : "An environmental transition candidate is present.",

      detail:
        "Local temperature samples indicate a spatial transition within the current sampling radius. This identifies a candidate environmental feature, not a confirmed persistent front.",

      supportingEvidence: [
        "temperature"
      ],

      sourceFamilies: [
        "spatial-temperature"
      ],

      score:
        Math.min(
          strongCandidate
            ? 78
            : 68,
          Math.max(
            35,
            evidenceConfidenceScore
          )
        ),

      drivers: [
        temperature
          ?.classification,
        temperature
          ?.orientation
          ?.classification,
        "local-spatial-temperature-variation"
      ].filter(Boolean),

      candidateLimitations: [
        "four-point-temperature-sampling",
        "single-time-snapshot",
        "does-not-confirm-ocean-front",
        "does-not-confirm-persistence",
        "does-not-establish-biological-significance"
      ]
    });
  }

  if (
    meaningfulTemperatureTransition &&
    currentAvailable
  ) {
    addOpportunity({
      type:
        "current-supported-transition-candidate",

      classification:
        "current-present-near-temperature-transition",

      headline:
        "Water movement is present near a temperature-transition candidate.",

      detail:
        "A local temperature transition and a valid current observation occur at the same location. This supports a current-influenced feature candidate, but single-point current data cannot confirm convergence, shear, an edge, or organized boundary flow.",

      supportingEvidence: [
        "temperature",
        "current"
      ],

      sourceFamilies: [
        "spatial-temperature",
        "single-point-current"
      ],

      score:
        Math.min(
          72,
          Math.max(
            40,
            evidenceConfidenceScore
          )
        ),

      drivers: [
        temperature
          ?.classification,
        current
           ?.values
           ?.strengthClassification
             ? `current-strength-${current.values.strengthClassification}`
            : null,
        "current-observation-co-located-with-temperature-transition"
      ].filter(Boolean),

      candidateLimitations: [
        "single-point-current-observation",
        "does-not-confirm-current-convergence",
        "does-not-confirm-current-shear",
        "does-not-confirm-current-edge",
        "does-not-confirm-eddy-boundary",
        "does-not-confirm-current-organization",
        "does-not-confirm-persistence"
      ]
    });
  }

  if (
    surfaceWaterTransitionPresent
  ) {
    const supportingEvidence = [];

    if (
      productivityTransitionPresent
    ) {
      supportingEvidence.push(
        "productivity"
      );
    }

    if (
      clarityTransitionPresent
    ) {
      supportingEvidence.push(
        "clarity"
      );
    }

    addOpportunity({
      type:
        "surface-water-boundary-candidate",

      classification:
        "chlorophyll-derived-surface-transition",

      headline:
        "A surface-water transition candidate is present.",

      detail:
        "Surface chlorophyll indicates a transition in broad surface-water character. Productivity and clarity interpretations share the same chlorophyll observation and are not treated as independent signals.",

      supportingEvidence,

      sourceFamilies: [
        "surface-chlorophyll"
      ],

      score:
        Math.min(
          65,
          Math.max(
            35,
            evidenceConfidenceScore -
              5
          )
        ),

      drivers: [
        productivityTransitionPresent
          ? productivity
              ?.classification
          : null,

        clarityTransitionPresent
          ? clarity
              ?.classification
          : null,

        "chlorophyll-derived-surface-water-transition"
      ].filter(Boolean),

      candidateLimitations: [
        "surface-chlorophyll-derived",
        "productivity-and-clarity-share-one-source-family",
        "not-direct-water-clarity",
        "not-full-water-column-observation",
        "does-not-confirm-biological-productivity",
        "does-not-confirm-persistence"
      ]
    });
  }

  if (
    meaningfulTemperatureTransition &&
    currentAvailable &&
    surfaceWaterTransitionPresent
  ) {
    addOpportunity({
      type:
        "multi-signal-feature-candidate",

      classification:
        "reinforcing-environmental-signals",

      headline:
        "Multiple environmental signals support a feature candidate.",

      detail:
        "Temperature structure, water movement, and chlorophyll-derived surface-water character reinforce the presence of a potentially organized environmental feature. The available observations do not yet establish persistence, biological importance, habitat value, or species suitability.",

      supportingEvidence: [
        "temperature",
        "current",
        ...(
          productivityTransitionPresent
            ? [
                "productivity"
              ]
            : []
        ),
        ...(
          clarityTransitionPresent
            ? [
                "clarity"
              ]
            : []
        )
      ],

      sourceFamilies: [
        "spatial-temperature",
        "single-point-current",
        "surface-chlorophyll"
      ],

      score:
        Math.min(
          78,
          Math.max(
            50,
            evidenceConfidenceScore
          )
        ),

      drivers: [
        "temperature-transition-present",
        "current-observation-present",
        "surface-water-transition-present",
        "multiple-source-families-reinforce-feature-candidate"
      ],

      candidateLimitations: [
        "single-time-assessment",
        "single-point-current-observation",
        "surface-chlorophyll-derived",
        "productivity-and-clarity-are-not-independent",
        "does-not-confirm-boundary-persistence",
        "does-not-confirm-current-organization",
        "does-not-establish-biological-significance"
      ]
    });
  }

  if (
    !temperatureTransitionPresent
  ) {
    limitations.push(
      "temperature-transition-not-established"
    );
  }

  if (
    !currentAvailable
  ) {
    limitations.push(
      "current-evidence-unavailable"
    );
  }

  if (
    !surfaceWaterTransitionPresent
  ) {
    limitations.push(
      "surface-water-transition-not-established"
    );
  }

  const opportunityCount =
    opportunities.length;

  let summaryClassification =
    "no-supported-feature-candidate";

  let summaryHeadline =
    "No ocean-feature candidate is currently supported.";

  let summaryDetail =
    "The available evidence does not currently combine into a defensible species-neutral ocean-feature candidate.";

  if (
    opportunityCount === 1
  ) {
    summaryClassification =
      "single-feature-candidate";

    summaryHeadline =
      "One ocean-feature candidate is supported.";

    summaryDetail =
      "One species-neutral environmental feature candidate is supported by the currently available evidence.";
  } else if (
    opportunityCount === 2
  ) {
    summaryClassification =
      "multiple-feature-candidates";

    summaryHeadline =
      "Multiple ocean-feature candidates are supported.";

    summaryDetail =
      "Several related species-neutral environmental feature candidates are supported by the currently available evidence.";
  } else if (
    opportunityCount >= 3
  ) {
    summaryClassification =
      "broad-feature-candidate-set";

    summaryHeadline =
      "A broad set of ocean-feature candidates is supported.";

    summaryDetail =
      "Multiple environmental source families support several related species-neutral ocean-feature candidates.";
  }

  let confidenceScore =
    opportunityCount > 0
      ? Math.min(
          evidenceConfidenceScore,
          Math.max(
            ...opportunities.map(
              opportunity =>
                opportunity
                  ?.confidence
                  ?.score ??
                0
            )
          )
        )
      : Math.min(
          evidenceConfidenceScore,
          35
        );

  confidenceScore =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          confidenceScore
        )
      )
    );

  const supportingEvidenceGroups = [
    ...new Set(
      opportunities.flatMap(
        opportunity =>
          opportunity
            .supportingEvidence ??
          []
      )
    )
  ];

  const sourceFamilies = [
    ...new Set(
      opportunities.flatMap(
        opportunity =>
          opportunity
            .sourceFamilies ??
          []
      )
    )
  ];

  const aggregatedLimitations = [
    ...new Set([
      ...limitations,

      ...(
        Array.isArray(
          oceanEvidence
            ?.limitations
        )
          ? oceanEvidence
              .limitations
          : []
      ),

      ...opportunities.flatMap(
        opportunity =>
          opportunity
            .limitations ??
          []
      )
    ])
  ];

  return {
    summary: {
      classification:
        summaryClassification,

      headline:
        summaryHeadline,

      detail:
        summaryDetail,

      opportunityCount,

      supportingEvidenceGroups,

      sourceFamilies,

      availableEvidenceGroupCount:
        oceanEvidence
          ?.summary
          ?.availableGroupCount ??
        0,

      confidenceLevel:
        confidenceLevel(
          confidenceScore
        ),

      confidenceScore,

      interpretation:
        "species-neutral-ocean-opportunity-summary"
    },

    opportunities,

    confidence: {
      score:
        confidenceScore,

      level:
        confidenceLevel(
          confidenceScore
        ),

      reasons: [
        opportunityCount > 0
          ? "one-or-more-feature-candidates-supported"
          : "no-feature-candidate-supported",

        `upstream-evidence-confidence-${String(
          evidenceConfidenceLevel
        )
          .trim()
          .toLowerCase()
          .replace(
            /\s+/g,
            "-"
          )}`
      ],

      limitations:
        aggregatedLimitations,

      components: {
        upstreamEvidence: {
          score:
            evidenceConfidenceScore,

          level:
            evidenceConfidenceLevel
        },

        featureCandidates: {
          count:
            opportunityCount,

          supportingEvidenceGroups,

          sourceFamilies
        }
      },

      methodVersion:
        "pelora-ocean-opportunity-confidence-v1.0"
    },

    limitations:
      aggregatedLimitations,

    interpretation:
      "species-neutral-ocean-opportunity-assessment",

    methodVersion:
      "pelora-ocean-opportunity-v1.0"
  };
}


/**
 * ------------------------------------------------------------
 * Blue Marlin Habitat Suitability Model
 * ------------------------------------------------------------
 *
 * Purpose:
 * Evaluate whether species-neutral environmental features form
 * a biologically plausible blue marlin habitat relationship.
 *
 * The model answers:
 * "Does the available environmental evidence support a
 * plausible blue marlin habitat opportunity?"
 *
 * This first model version does not confirm:
 * - blue marlin presence
 * - feeding activity
 * - prey or bait concentration
 * - feature persistence
 * - catch probability
 * - fishing success
 */
export function assessBlueMarlinHabitat({
  oceanOpportunity,
  oceanEvidence,
  dataQuality
}) {
  const opportunities =
    Array.isArray(
      oceanOpportunity
        ?.opportunities
    )
      ? oceanOpportunity.opportunities
      : [];

  const evidenceGroups =
    oceanEvidence?.groups ??
    {};

  const temperature =
    evidenceGroups.temperature ??
    {};

  const current =
    evidenceGroups.current ??
    {};

  const productivity =
    evidenceGroups.productivity ??
    {};

  const clarity =
    evidenceGroups.clarity ??
    {};

  const structure =
    evidenceGroups.structure ??
    {};

  const opportunityTypes =
    opportunities
      .map(
        opportunity =>
          opportunity?.type
      )
      .filter(Boolean);

  const hasOpportunityType =
    type =>
      opportunityTypes.includes(
        type
      );

  const hasTemperatureTransition =
    hasOpportunityType(
      "environmental-transition-zone"
    );

  const hasCurrentSupportedTransition =
    hasOpportunityType(
      "current-supported-transition-candidate"
    );

  const hasSurfaceWaterBoundary =
    hasOpportunityType(
      "surface-water-boundary-candidate"
    );

  const hasMultiSignalFeature =
    hasOpportunityType(
      "multi-signal-feature-candidate"
    );

  const upstreamConfidenceScore =
    Number.isFinite(
      oceanOpportunity
        ?.confidence
        ?.score
    )
      ? oceanOpportunity
          .confidence
          .score
      : 0;

  const upstreamConfidenceLevel =
    oceanOpportunity
      ?.confidence
      ?.level ??
    "Very Low";

  const positiveDrivers = [];

  const negativeDrivers = [];

  const limitations = [
    "preliminary-blue-marlin-habitat-assessment",
    "does-not-confirm-blue-marlin-presence",
    "does-not-confirm-feeding",
    "does-not-confirm-prey-or-bait-concentration",
    "does-not-estimate-catch-probability",
    "does-not-indicate-fishing-success"
  ];


  /*
   * Relationship Group 1:
   * Ocean Movement
   *
   * Current evidence is currently based on a single-point
   * speed-and-direction vector. The habitat model may interpret
   * current strength and its association with other measured
   * environmental evidence, but it must not claim convergence,
   * shear, an edge, an eddy boundary, spatial organization,
   * persistence, or biological concentration.
   */
  let oceanMovementScore = 0;

  let oceanMovementClassification =
    "unsupported";

  const currentStrengthClassification =
    current?.values
      ?.strengthClassification ??
    current?.classification ??
    null;

  const currentSpeedKnots =
    Number.isFinite(
      current?.values
        ?.speedKnots
    )
      ? current.values.speedKnots
      : null;

  const currentFreshness =
    current?.values
      ?.freshness ??
    "unknown";

  const currentSourceAvailability =
    current?.values
      ?.sourceAvailability ??
    null;

  const hasDetailedCurrentEvidence =
    current?.available === true &&
    current?.values &&
    (
      currentSpeedKnots !== null ||
      current?.values
        ?.directionDegrees !== null
    );

  if (
    current?.available
  ) {
    if (
      currentStrengthClassification ===
      "weak"
    ) {
      oceanMovementScore = 4;

      oceanMovementClassification =
        "weak-current-observation";
    } else if (
      currentStrengthClassification ===
      "moderate"
    ) {
      oceanMovementScore = 7;

      oceanMovementClassification =
        "moderate-current-observation";
    } else if (
      currentStrengthClassification ===
      "strong"
    ) {
      oceanMovementScore = 9;

      oceanMovementClassification =
        "strong-current-observation";
    } else if (
      currentStrengthClassification ===
      "very-strong"
    ) {
      oceanMovementScore = 10;

      oceanMovementClassification =
        "very-strong-current-observation";
    } else {
      oceanMovementScore = 6;

      oceanMovementClassification =
        "current-observation-with-strength-uncertainty";

      limitations.push(
        "current-strength-classification-unavailable"
      );
    }

    positiveDrivers.push(
      "local-current-observation"
    );

    if (
      currentStrengthClassification
    ) {
      positiveDrivers.push(
        `local-current-strength-${currentStrengthClassification}`
      );
    }

    if (
      currentSpeedKnots !== null
    ) {
      positiveDrivers.push(
        `observed-current-speed-${currentSpeedKnots.toFixed(2)}-knots`
      );
    }

    if (
      hasCurrentSupportedTransition
    ) {
      oceanMovementScore += 8;

      oceanMovementClassification =
        "current-associated-with-environmental-transition";

      positiveDrivers.push(
        "water-movement-near-environmental-transition"
      );
    }

    if (
      hasMultiSignalFeature
    ) {
      oceanMovementScore += 2;

      positiveDrivers.push(
        "current-associated-with-multi-signal-feature"
      );
    }

    oceanMovementScore =
      Math.min(
        20,
        oceanMovementScore
      );

    if (
      currentFreshness ===
        "aging" &&
      oceanMovementScore > 14
    ) {
      oceanMovementScore = 14;

      limitations.push(
        "ocean-movement-score-limited-by-aging-current-observation"
      );
    } else if (
      currentFreshness ===
        "stale" &&
      oceanMovementScore > 8
    ) {
      oceanMovementScore = 8;

      limitations.push(
        "ocean-movement-score-limited-by-stale-current-observation"
      );
    } else if (
      currentFreshness ===
        "unknown" &&
      hasDetailedCurrentEvidence &&
      oceanMovementScore > 18
    ) {
      oceanMovementScore = 18;

      limitations.push(
        "ocean-movement-score-limited-by-unknown-observation-age"
      );
    }

    if (
      currentSourceAvailability &&
      currentSourceAvailability !==
        "available"
    ) {
      oceanMovementScore =
        Math.min(
          oceanMovementScore,
          10
        );

      limitations.push(
        "ocean-movement-score-limited-by-current-source-availability"
      );
    }

    limitations.push(
      "current-organization-not-established"
    );

    limitations.push(
      "current-persistence-not-established"
    );
  } else if (
    (
      hasCurrentSupportedTransition ||
      hasMultiSignalFeature
    ) &&
    !current
  ) {
    /*
     * Conservative compatibility fallback for an upstream
     * opportunity result that does not include the detailed
     * Ocean Evidence current contract.
     */
    oceanMovementScore = 20;

    oceanMovementClassification =
      "current-influenced-feature-candidate";

    positiveDrivers.push(
      "water-movement-near-environmental-transition"
    );

    limitations.push(
      "detailed-current-evidence-unavailable"
    );
  } else {
    negativeDrivers.push(
      "ocean-movement-evidence-unavailable"
    );

    limitations.push(
      "current-evidence-unavailable"
    );
  }


  /*
   * Relationship Group 2:
   * Thermal Structure
   *
   * The Ocean Evidence layer measures the local temperature
   * pattern. The habitat model interprets the possible
   * biological relevance of that measured pattern.
   */
  let thermalStructureScore = 0;

  let thermalStructureClassification =
    "unsupported";

  const thermalEvidenceClassification =
    temperature?.classification ??
    "unavailable";

  const thermalSpatialClassification =
    temperature?.values
      ?.spatialClassification ??
    null;

  const thermalCoverage =
    temperature?.values
      ?.coverage ??
    "unavailable";

  const thermalRangeFahrenheit =
    Number.isFinite(
      temperature?.values
        ?.spatialRangeFahrenheit
    )
      ? temperature.values
          .spatialRangeFahrenheit
      : null;

  const thermalOrientationClassification =
    temperature?.orientation
      ?.classification ??
    null;

  const thermalPatternConfidenceScore =
    Number.isFinite(
      temperature?.confidence
        ?.score
    )
      ? temperature.confidence.score
      : null;

  const hasDirectionalThermalTransition =
    thermalOrientationClassification ===
      "directional-temperature-transition";

  if (
    thermalEvidenceClassification ===
      "strong-temperature-break-candidate"
  ) {
    thermalStructureScore = 23;

    thermalStructureClassification =
      "strong-directional-or-spatial-temperature-break-candidate";

    positiveDrivers.push(
      "strong-spatial-temperature-break-candidate"
    );
  } else if (
    thermalEvidenceClassification ===
      "moderate-temperature-structure"
  ) {
    thermalStructureScore = 22;

    thermalStructureClassification =
      "moderate-temperature-transition-supported";

    positiveDrivers.push(
      "moderate-spatial-temperature-transition"
    );
  } else if (
    thermalEvidenceClassification ===
      "weak-temperature-structure"
  ) {
    thermalStructureScore = 12;

    thermalStructureClassification =
      "weak-temperature-transition-supported";

    positiveDrivers.push(
      "weak-spatial-temperature-transition"
    );

    limitations.push(
      "thermal-transition-strength-is-limited"
    );
  } else if (
    thermalEvidenceClassification ===
      "uniform-water"
  ) {
    thermalStructureScore = 3;

    thermalStructureClassification =
      "uniform-local-temperature-field";

    negativeDrivers.push(
      "organized-temperature-transition-not-established"
    );
  } else if (
    thermalEvidenceClassification ===
      "temperature-only"
  ) {
    thermalStructureScore = 6;

    thermalStructureClassification =
      "temperature-observation-without-spatial-structure";

    negativeDrivers.push(
      "organized-temperature-transition-not-established"
    );

    limitations.push(
      "spatial-temperature-structure-unavailable"
    );
  } else if (
    temperature?.available &&
    (
      hasTemperatureTransition ||
      hasMultiSignalFeature
    )
  ) {
    /*
     * Conservative compatibility fallback for an upstream
     * opportunity whose detailed evidence classification is
     * not available.
     */
    thermalStructureScore = 16;

    thermalStructureClassification =
      "temperature-transition-indicated-by-upstream-opportunity";

    positiveDrivers.push(
      "upstream-temperature-transition-candidate"
    );

    limitations.push(
      "detailed-temperature-evidence-classification-unavailable"
    );
  } else if (
    temperature?.available
  ) {
    thermalStructureScore = 6;

    thermalStructureClassification =
      "temperature-observation-without-transition";

    negativeDrivers.push(
      "organized-temperature-transition-not-established"
    );
  } else {
    negativeDrivers.push(
      "temperature-evidence-unavailable"
    );

    limitations.push(
      "temperature-structure-unavailable"
    );
  }

  if (
    hasDirectionalThermalTransition &&
    thermalStructureScore > 0
  ) {
    thermalStructureScore =
      Math.min(
        25,
        thermalStructureScore + 2
      );

    positiveDrivers.push(
      "directional-temperature-transition"
    );
  }

  if (
    thermalCoverage !==
      "sufficient" &&
    thermalStructureScore > 10
  ) {
    thermalStructureScore = 10;

    limitations.push(
      "thermal-score-limited-by-incomplete-spatial-coverage"
    );
  }

  if (
    thermalPatternConfidenceScore !==
      null
  ) {
    let thermalConfidenceCap = 25;

    if (
      thermalPatternConfidenceScore < 40
    ) {
      thermalConfidenceCap = 14;
    } else if (
      thermalPatternConfidenceScore < 60
    ) {
      thermalConfidenceCap = 18;
    } else if (
      thermalPatternConfidenceScore < 80
    ) {
      thermalConfidenceCap = 22;
    }

    if (
      thermalStructureScore >
      thermalConfidenceCap
    ) {
      thermalStructureScore =
        thermalConfidenceCap;

      limitations.push(
        "thermal-score-capped-by-pattern-confidence"
      );
    }
  } else if (
    temperature?.available
  ) {
    limitations.push(
      "thermal-pattern-confidence-unavailable"
    );
  }

  if (
    thermalRangeFahrenheit !==
      null
  ) {
    positiveDrivers.push(
      `observed-temperature-range-${thermalRangeFahrenheit.toFixed(1)}f`
    );
  }

  if (
    thermalSpatialClassification
  ) {
    positiveDrivers.push(
      `thermal-pattern-${thermalSpatialClassification}`
    );
  }


  /*
   * Relationship Group 3:
   * Productivity and Prey Support
   *
   * Satellite chlorophyll describes surface-water character
   * only. It may support a cautious interpretation of the
   * productivity context around an environmental feature, but
   * it does not establish bait, prey aggregation, feeding,
   * water-column productivity, or blue marlin presence.
   */
  let productivityAndPreyScore = 0;

  let productivityAndPreyClassification =
    "unsupported";

  const productivityEvidenceClassification =
    productivity?.classification ??
    productivity?.values
      ?.productivityClassification ??
    null;

  const chlorophyllConcentrationMgM3 =
    Number.isFinite(
      productivity?.values
        ?.concentrationMgM3
    )
      ? productivity.values
          .concentrationMgM3
      : null;

  const productivityFreshness =
    productivity?.values
      ?.freshness ??
    "unknown";

  const hasDetailedProductivityEvidence =
    productivity?.available === true &&
    (
      productivityEvidenceClassification !==
        null ||
      chlorophyllConcentrationMgM3 !==
        null
    );

  if (
    productivity?.available
  ) {
    if (
      productivityEvidenceClassification ===
        "very-clear-low-productivity"
    ) {
      productivityAndPreyScore = 2;

      productivityAndPreyClassification =
        "very-clear-low-surface-productivity";

      negativeDrivers.push(
        "limited-surface-productivity-observed"
      );
    } else if (
      productivityEvidenceClassification ===
        "clear-blue-water"
    ) {
      productivityAndPreyScore = 5;

      productivityAndPreyClassification =
        "clear-blue-water-productivity-context";

      positiveDrivers.push(
        "clear-blue-surface-water"
      );
    } else if (
      productivityEvidenceClassification ===
        "productive-blue-green-transition"
    ) {
      productivityAndPreyScore = 10;

      productivityAndPreyClassification =
        "productive-blue-green-transition-observed";

      positiveDrivers.push(
        "productive-blue-green-surface-water"
      );
    } else if (
      productivityEvidenceClassification ===
        "productive-green-water"
    ) {
      productivityAndPreyScore = 8;

      productivityAndPreyClassification =
        "productive-green-water-observed";

      positiveDrivers.push(
        "elevated-surface-productivity"
      );
    } else if (
      productivityEvidenceClassification ===
        "high-chlorophyll-coastal-or-bloom-influenced"
    ) {
      productivityAndPreyScore = 3;

      productivityAndPreyClassification =
        "high-chlorophyll-water-with-context-uncertainty";

      negativeDrivers.push(
        "high-chlorophyll-context-may-reflect-coastal-or-bloom-influence"
      );

      limitations.push(
        "high-chlorophyll-does-not-automatically-indicate-blue-marlin-prey-support"
      );
    } else {
      productivityAndPreyScore = 4;

      productivityAndPreyClassification =
        "surface-productivity-observation-without-classification";

      limitations.push(
        "productivity-classification-unavailable"
      );
    }

    if (
      chlorophyllConcentrationMgM3 !==
        null
    ) {
      positiveDrivers.push(
        `observed-surface-chlorophyll-${chlorophyllConcentrationMgM3.toFixed(3)}-mg-m3`
      );
    }

    if (
      hasSurfaceWaterBoundary
    ) {
      productivityAndPreyScore += 6;

      productivityAndPreyClassification =
        "surface-productivity-associated-with-water-boundary";

      positiveDrivers.push(
        "chlorophyll-derived-surface-water-transition"
      );
    }

    if (
      hasMultiSignalFeature
    ) {
      productivityAndPreyScore += 2;

      positiveDrivers.push(
        "surface-productivity-associated-with-multi-signal-feature"
      );
    }

    productivityAndPreyScore =
      Math.min(
        20,
        productivityAndPreyScore
      );

    if (
      productivityFreshness ===
        "aging" &&
      productivityAndPreyScore > 14
    ) {
      productivityAndPreyScore = 14;

      limitations.push(
        "productivity-score-limited-by-aging-satellite-observation"
      );
    } else if (
      productivityFreshness ===
        "stale" &&
      productivityAndPreyScore > 8
    ) {
      productivityAndPreyScore = 8;

      limitations.push(
        "productivity-score-limited-by-stale-satellite-observation"
      );
    } else if (
      productivityFreshness ===
        "unknown" &&
      hasDetailedProductivityEvidence &&
      productivityAndPreyScore > 16
    ) {
      productivityAndPreyScore = 16;

      limitations.push(
        "productivity-score-limited-by-unknown-observation-age"
      );
    }

    limitations.push(
      "surface-productivity-does-not-confirm-prey"
    );

    limitations.push(
      "prey-support-not-established"
    );
  } else if (
    (
      hasSurfaceWaterBoundary ||
      hasMultiSignalFeature
    ) &&
    !productivity
  ) {
    /*
     * Conservative compatibility fallback for an upstream
     * opportunity whose detailed Ocean Evidence productivity
     * contract is not available.
     */
    productivityAndPreyScore = 10;

    productivityAndPreyClassification =
      "surface-productivity-context-present";

    positiveDrivers.push(
      "chlorophyll-derived-surface-water-transition"
    );

    limitations.push(
      "detailed-productivity-evidence-unavailable"
    );

    limitations.push(
      "surface-productivity-does-not-confirm-prey"
    );
  } else {
    negativeDrivers.push(
      "productivity-evidence-unavailable"
    );

    limitations.push(
      "prey-support-unavailable"
    );
  }


  /*
   * Relationship Group 4:
   * Structure Interaction
   */
  let structureInteractionScore = 0;

  let structureInteractionClassification =
    "unavailable";

  if (
    structure?.available
  ) {
    structureInteractionScore = 8;

    structureInteractionClassification =
      "structure-context-present";

    positiveDrivers.push(
      "structure-context-available"
    );
  } else {
    negativeDrivers.push(
      "structure-interaction-unavailable"
    );

    limitations.push(
      "bathymetric-interaction-not-assessed"
    );
  }


  /*
   * Relationship Group 5:
   * Water Character
   */
  let waterCharacterScore = 0;

  let waterCharacterClassification =
    "unsupported";

  if (
    hasSurfaceWaterBoundary
  ) {
    waterCharacterScore = 8;

    waterCharacterClassification =
      "surface-water-transition-supported";

    positiveDrivers.push(
      "surface-water-character-transition"
    );
  } else if (
    clarity?.available
  ) {
    waterCharacterScore = 3;

    waterCharacterClassification =
      "surface-water-character-observed";
  } else {
    limitations.push(
      "water-character-evidence-unavailable"
    );
  }


  /*
   * Relationship Group 6:
   * Persistence
   *
   * Persistence cannot be established from a single-time
   * environmental assessment.
   */
  const persistenceScore = 0;

  const persistenceClassification =
    "not-established";

  negativeDrivers.push(
    "feature-persistence-not-established"
  );

  limitations.push(
    "single-time-assessment",
    "historical-feature-tracking-not-yet-implemented"
  );


  const rawSuitabilityScore =
    oceanMovementScore +
    thermalStructureScore +
    productivityAndPreyScore +
    structureInteractionScore +
    waterCharacterScore +
    persistenceScore;

  /*
   * Habitat suitability cannot be more confident than the
   * species-neutral Opportunity assessment supporting it.
   */
  const confidenceAdjustedMaximum =
    Math.round(
      upstreamConfidenceScore
    );

  const suitabilityScore =
    Math.min(
      rawSuitabilityScore,
      confidenceAdjustedMaximum
    );

  let classification;

  let headline;

  let detail;

  if (
    opportunityTypes.length === 0
  ) {
    classification =
      "insufficient-habitat-evidence";

    headline =
      "No blue marlin habitat relationship is currently supported.";

    detail =
      "The available species-neutral assessment does not contain an organized environmental feature candidate that can support a preliminary blue marlin habitat interpretation.";
  } else if (
    suitabilityScore >= 55
  ) {
    classification =
      "moderate-preliminary-habitat-support";

    headline =
      "Multiple environmental relationships support a preliminary blue marlin habitat candidate.";

    detail =
      "The available environmental relationships provide moderate preliminary habitat support, but blue marlin presence, prey concentration, persistence, and fishing success remain unconfirmed.";
  } else if (
    suitabilityScore >= 30
  ) {
    classification =
      "limited-preliminary-habitat-support";

    headline =
      "A limited blue marlin habitat relationship is supported.";

    detail =
      "Some environmental relationships are consistent with a preliminary blue marlin habitat candidate, but important biological and persistence evidence remains unavailable.";
  } else {
    classification =
      "weak-preliminary-habitat-support";

    headline =
      "Only weak preliminary blue marlin habitat support is available.";

    detail =
      "One or more environmental signals are present, but the evidence is incomplete and does not yet support a strong habitat interpretation.";
  }

  const uniqueLimitations =
    [
      ...new Set(
        [
          ...limitations,

          ...(
            Array.isArray(
              oceanOpportunity
                ?.limitations
            )
              ? oceanOpportunity
                  .limitations
              : []
          )
        ]
          .filter(Boolean)
      )
    ];

  return {
    summary: {
      classification,

      headline,

      detail,

      suitabilityScore,

      rawSuitabilityScore,

      confidenceScore:
        upstreamConfidenceScore,

      confidenceLevel:
        upstreamConfidenceLevel,

      interpretation:
        "blue-marlin-habitat-suitability-summary"
    },

    relationshipGroups: {
      oceanMovement: {
        classification:
          oceanMovementClassification,

        score:
          oceanMovementScore,

        maximumScore:
          25
      },

      thermalStructure: {
        classification:
          thermalStructureClassification,

        score:
          thermalStructureScore,

        maximumScore:
          25
      },

      productivityAndPreySupport: {
        classification:
          productivityAndPreyClassification,

        score:
          productivityAndPreyScore,

        maximumScore:
          20
      },

      structureInteraction: {
        classification:
          structureInteractionClassification,

        score:
          structureInteractionScore,

        maximumScore:
          15
      },

      waterCharacter: {
        classification:
          waterCharacterClassification,

        score:
          waterCharacterScore,

        maximumScore:
          10
      },

      persistence: {
        classification:
          persistenceClassification,

        score:
          persistenceScore,

        maximumScore:
          5
      }
    },

    opportunityTypes,

    positiveDrivers:
      [
        ...new Set(
          positiveDrivers
            .filter(Boolean)
        )
      ],

    negativeDrivers:
      [
        ...new Set(
          negativeDrivers
            .filter(Boolean)
        )
      ],

    confidence: {
      score:
        upstreamConfidenceScore,

      level:
        upstreamConfidenceLevel,

      reasons: [
        "confidence-capped-by-ocean-opportunity",
        opportunityTypes.length > 0
          ? "species-neutral-feature-candidate-available"
          : "no-species-neutral-feature-candidate"
      ],

      limitations:
        uniqueLimitations,

      components: {
        upstreamOpportunity: {
          score:
            upstreamConfidenceScore,

          level:
            upstreamConfidenceLevel
        },

        rawHabitatAssessment: {
          score:
            rawSuitabilityScore
        },

        confidenceAdjustedSuitability: {
          score:
            suitabilityScore
        }
      },

      methodVersion:
        "pelora-blue-marlin-hsm-confidence-v1.0"
    },

    dataQualityContext: {
      available:
        Boolean(
          dataQuality
        ),

      score:
        Number.isFinite(
          dataQuality?.score
        )
          ? dataQuality.score
          : null,

      classification:
        dataQuality
          ?.classification ??
        null
    },

    limitations:
      uniqueLimitations,

    interpretation:
      "blue-marlin-habitat-suitability",

    methodVersion:
      "pelora-blue-marlin-hsm-v1.0"
  };
}


async function getOceanConditions(
  latitude,
  longitude
) {
  const oceanRequestStartedAt =
    performance.now();

  const marineResult =
    await settleWithTiming(
      () =>
        getMarineConditions(
          latitude,
          longitude
        )
    );

  const [
    chlorophyllResult,
    currentsResult
  ] = await Promise.all([
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
        marineResult
          .durationMilliseconds +
        Math.max(
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


    const sst = {
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
};


const oceanEvidence =
  assessOceanEvidence({
    sst,
    chlorophyll,
    currents,
    dataQuality
  });


  const oceanOpportunity =
  assessOceanOpportunity({
    oceanEvidence
  });


  const blueMarlinHabitat =
    assessBlueMarlinHabitat({
      oceanOpportunity,
      oceanEvidence,
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

    oceanEvidence,

    oceanOpportunity,

    blueMarlinHabitat,

    wind:
      marine.wind,

    waves:
      marine.waves,

    swell:
      marine.swell,

    sst,

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