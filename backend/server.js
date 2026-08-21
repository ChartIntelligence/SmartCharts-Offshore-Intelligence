import http from "node:http";
import {
  URL,
  pathToFileURL
} from "node:url";


import boemPlatforms
  from "./data/boemPlatformsImported.json"
  with { type: "json" };

import fads
  from "./data/fads.json"
  with { type: "json" };


  /* -----------------------------
   Verified Structure Catalog
------------------------------ */

const VERIFIED_STRUCTURES = [
  ...boemPlatforms,
  ...fads
].filter(
  structure => structure.active !== false
);


const PORT =
  Number(process.env.PORT) || 8787;


/**
 * ------------------------------------------------------------
 * Backend Supabase Configuration v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Normalize the public Supabase REST configuration used for
 * authenticated Ocean Memory retrieval.
 *
 * This contract never accepts or exposes a service-role key.
 * Missing configuration must not interrupt live ocean data.
 */
export function buildBackendSupabaseConfiguration({
  environment = process.env
} = {}) {
  const rawUrl =
    typeof environment
      ?.SUPABASE_URL ===
      "string"
      ? environment
          .SUPABASE_URL
          .trim()
      : "";

  const rawPublishableKey =
    typeof environment
      ?.SUPABASE_PUBLISHABLE_KEY ===
      "string"
      ? environment
          .SUPABASE_PUBLISHABLE_KEY
          .trim()
      : "";

  let normalizedUrl =
    null;

  try {
    const parsedUrl =
      new URL(
        rawUrl
      );

    const validProtocol =
      parsedUrl.protocol ===
        "https:";

    const validHostname =
      typeof parsedUrl.hostname ===
        "string" &&
      parsedUrl.hostname
        .trim()
        .length >
        0;

    if (
      validProtocol &&
      validHostname
    ) {
      normalizedUrl =
        parsedUrl.origin;
    }
  } catch {
    normalizedUrl =
      null;
  }

  const publishableKeyAvailable =
    rawPublishableKey.length >
      0;

  const serviceRoleConfigured =
    typeof environment
      ?.SUPABASE_SERVICE_ROLE_KEY ===
      "string" &&
    environment
      .SUPABASE_SERVICE_ROLE_KEY
      .trim()
      .length >
      0;

  const available =
    typeof normalizedUrl ===
      "string" &&
    publishableKeyAvailable &&
    !serviceRoleConfigured;

  const missingRequirements = [
    typeof normalizedUrl !==
      "string"
      ? "supabase-url"
      : null,

    !publishableKeyAvailable
      ? "supabase-publishable-key"
      : null,

    serviceRoleConfigured
      ? "remove-service-role-key-from-ocean-memory-runtime"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...missingRequirements,

      "Backend Supabase Configuration supports authenticated REST access with a public publishable key only.",

      "Captain authorization must be supplied separately through a user bearer token.",

      "Missing or invalid Supabase configuration must not interrupt live ocean-condition delivery.",

      "This contract does not query Supabase, validate a captain session, expose credentials, bypass Row Level Security, or support service-role access."
    ])
  ];

  return deepFreezeSnapshotValue({
    available,

    configurationType:
      "backend-supabase-configuration",

    responsibility:
      "preserve",

    restUrl:
      available
        ? `${normalizedUrl}/rest/v1`
        : null,

    projectUrl:
      available
        ? normalizedUrl
        : null,

    publishableKeyAvailable,

    serviceRoleConfigured,

    credentials: {
      publishableKey:
        available
          ? rawPublishableKey
          : null,

      serviceRoleKey:
        null
    },

    diagnostics: {
      urlConfigured:
        rawUrl.length >
          0,

      urlValid:
        typeof normalizedUrl ===
          "string",

      publishableKeyConfigured:
        publishableKeyAvailable,

      serviceRoleRejected:
        serviceRoleConfigured
    },

    missingRequirements,

    limitations,

    contractVersion:
      "pelora-backend-supabase-configuration-v1"
  });
}


/**
 * ------------------------------------------------------------
 * Backend Ocean Memory Retrieval v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Retrieve captain-owned Ocean Snapshot rows through the
 * Supabase REST API while preserving Row Level Security.
 *
 * This function must use a public publishable key and the
 * captain's bearer token. It must never use service-role access.
 */
export async function retrieveOceanMemoryRows({
  configuration = null,
  bearerToken = null,
  latitude = null,
  longitude = null,
  observedAfter = null,
  observedBefore = null,
  maximumRows = 48,
  fetchImplementation = fetch
} = {}) {
  const configurationAvailable =
    configuration
      ?.available ===
    true;

  const restUrl =
    typeof configuration
      ?.restUrl ===
      "string"
      ? configuration.restUrl
          .trim() ||
        null
      : null;

  const publishableKey =
    typeof configuration
      ?.credentials
      ?.publishableKey ===
      "string"
      ? configuration
          .credentials
          .publishableKey
          .trim() ||
        null
      : null;

  const normalizedBearerToken =
    typeof bearerToken ===
      "string"
      ? bearerToken.trim() ||
        null
      : null;

  const validLatitude =
    Number.isFinite(
      latitude
    );

  const validLongitude =
    Number.isFinite(
      longitude
    );

  const resolvedObservedAfter =
    typeof observedAfter ===
      "string" &&
    Number.isFinite(
      Date.parse(
        observedAfter
      )
    )
      ? observedAfter
      : null;

  const resolvedObservedBefore =
    typeof observedBefore ===
      "string" &&
    Number.isFinite(
      Date.parse(
        observedBefore
      )
    )
      ? observedBefore
      : null;

  const observedAfterTimestamp =
    resolvedObservedAfter
      ? Date.parse(
          resolvedObservedAfter
        )
      : null;

  const observedBeforeTimestamp =
    resolvedObservedBefore
      ? Date.parse(
          resolvedObservedBefore
        )
      : null;

  const validObservedWindow =
    observedAfterTimestamp ===
      null ||
    observedBeforeTimestamp ===
      null ||
    observedAfterTimestamp <=
      observedBeforeTimestamp;

  const resolvedMaximumRows =
    Number.isInteger(
      maximumRows
    ) &&
    maximumRows >
      0
      ? Math.min(
          maximumRows,
          250
        )
      : null;

  const validFetchImplementation =
    typeof fetchImplementation ===
      "function";

  const missingRequirements = [
    !configurationAvailable
      ? "available-backend-supabase-configuration"
      : null,

    typeof restUrl !==
      "string"
      ? "supabase-rest-url"
      : null,

    typeof publishableKey !==
      "string"
      ? "supabase-publishable-key"
      : null,

    typeof normalizedBearerToken !==
      "string"
      ? "captain-bearer-token"
      : null,

    !validObservedWindow
      ? "valid-observed-time-window"
      : null,

    resolvedMaximumRows ===
      null
      ? "valid-maximum-row-limit"
      : null,

    !validFetchImplementation
      ? "fetch-implementation"
      : null
  ].filter(Boolean);

  const requestReady =
    missingRequirements.length ===
      0;

  const limitations = [
    ...new Set([
      ...missingRequirements,

      !validLatitude ||
      !validLongitude
        ? "exact-coordinate-filter-not-applied"
        : null,

      resolvedObservedAfter ===
        null &&
      observedAfter !==
        null
        ? "invalid-observed-after-filter"
        : null,

      resolvedObservedBefore ===
        null &&
      observedBefore !==
        null
        ? "invalid-observed-before-filter"
        : null,

      "Backend Ocean Memory Retrieval reads captain-owned Ocean Snapshot rows through Supabase REST.",

      "Row Level Security remains responsible for ownership enforcement.",

      "This contract does not adapt database rows, compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    ].filter(Boolean))
  ];

  if (!requestReady) {
    return deepFreezeSnapshotValue({
      available:
        false,

      retrievalType:
        "backend-ocean-memory-row-retrieval",

      responsibility:
        "preserve",

      requestPerformed:
        false,

      request: {
        coordinateFilterApplied:
          false,

        latitude:
          validLatitude
            ? latitude
            : null,

        longitude:
          validLongitude
            ? longitude
            : null,

        observedAfter:
          resolvedObservedAfter,

        observedBefore:
          resolvedObservedBefore,

        maximumRows:
          resolvedMaximumRows
      },

      rows: [],

      summary: {
        returnedRowCount:
          0,

        httpStatus:
          null,

        responseOk:
          false
      },

      missingRequirements,

      limitations,

      contractVersion:
        "pelora-backend-ocean-memory-retrieval-v1"
    });
  }

  const queryUrl =
    new URL(
      `${restUrl}/ocean_snapshots`
    );

  queryUrl.searchParams.set(
    "select",
    "*"
  );

  if (
    validLatitude &&
    validLongitude
  ) {
    queryUrl.searchParams.set(
      "latitude",
      `eq.${latitude}`
    );

    queryUrl.searchParams.set(
      "longitude",
      `eq.${longitude}`
    );
  }

  if (
    resolvedObservedAfter
  ) {
    queryUrl.searchParams.set(
      "observed_at",
      `gte.${resolvedObservedAfter}`
    );
  }

  if (
    resolvedObservedBefore
  ) {
    queryUrl.searchParams.append(
      "observed_at",
      `lte.${resolvedObservedBefore}`
    );
  }

  queryUrl.searchParams.set(
    "order",
    "observed_at.asc"
  );

  queryUrl.searchParams.set(
    "limit",
    String(
      resolvedMaximumRows
    )
  );

  let response =
    null;

  let responseRows = [];

  try {
    response =
      await fetchImplementation(
        queryUrl.toString(),
        {
          method:
            "GET",

          headers: {
            apikey:
              publishableKey,

            Authorization:
              `Bearer ${normalizedBearerToken}`,

            Accept:
              "application/json"
          },

          cache:
            "no-store"
        }
      );

    if (
      response?.ok ===
      true
    ) {
      const parsedBody =
        await response.json();

      responseRows =
        Array.isArray(
          parsedBody
        )
          ? parsedBody
          : [];
    }
  } catch {
    response =
      null;

    responseRows = [];
  }

  const responseOk =
    response?.ok ===
    true;

  const httpStatus =
    Number.isInteger(
      response?.status
    )
      ? response.status
      : null;

  const available =
    responseOk;

  const responseLimitations = [
    ...limitations,

    !response
      ? "supabase-request-failed"
      : null,

    response &&
    !responseOk
      ? "supabase-response-not-successful"
      : null,

    responseOk &&
    responseRows.length ===
      0
      ? "no-ocean-memory-rows-returned"
      : null
  ].filter(Boolean);

  return deepFreezeSnapshotValue({
    available,

    retrievalType:
      "backend-ocean-memory-row-retrieval",

    responsibility:
      "preserve",

    requestPerformed:
      true,

    request: {
      coordinateFilterApplied:
        validLatitude &&
        validLongitude,

      latitude:
        validLatitude
          ? latitude
          : null,

      longitude:
        validLongitude
          ? longitude
          : null,

      observedAfter:
        resolvedObservedAfter,

      observedBefore:
        resolvedObservedBefore,

      maximumRows:
        resolvedMaximumRows
    },

    rows:
      cloneSnapshotValue(
        responseRows
      ),

    summary: {
      returnedRowCount:
        responseRows.length,

      httpStatus,

      responseOk
    },

    missingRequirements,

    limitations: [
      ...new Set(
        responseLimitations
      )
    ],

    contractVersion:
      "pelora-backend-ocean-memory-retrieval-v1"
  });
}

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


function nauticalMilesBetween(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const radians = degrees =>
    degrees * Math.PI / 180;

  const earthRadiusNm = 3440.065;

  const dLat =
    radians(lat2 - lat1);

  const dLon =
    radians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(lat1)) *
    Math.cos(radians(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return Number(
    (earthRadiusNm * c).toFixed(2)
  );
}


function initialBearingDegrees(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const radians =
    degrees =>
      degrees *
      Math.PI /
      180;

  const degrees =
    radiansValue =>
      radiansValue *
      180 /
      Math.PI;

  const phi1 =
    radians(lat1);

  const phi2 =
    radians(lat2);

  const deltaLongitude =
    radians(
      lon2 -
      lon1
    );

  const y =
    Math.sin(
      deltaLongitude
    ) *
    Math.cos(
      phi2
    );

  const x =
    Math.cos(
      phi1
    ) *
    Math.sin(
      phi2
    ) -
    Math.sin(
      phi1
    ) *
    Math.cos(
      phi2
    ) *
    Math.cos(
      deltaLongitude
    );

  const bearing =
    degrees(
      Math.atan2(
        y,
        x
      )
    );

  return Number(
    (
      (
        bearing +
        360
      ) %
      360
    ).toFixed(2)
  );
}


export function kilometersBetween(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const distanceNm =
    nauticalMilesBetween(
      lat1,
      lon1,
      lat2,
      lon2
    );

  return Number.isFinite(
    distanceNm
  )
    ? Number(
        (
          distanceNm *
          1.852
        ).toFixed(2)
      )
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
        "Content-Type, Authorization",

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

const CHLOROPHYLL_GAP_FILLED_DATASET =
  "nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily";


const CURRENTS_DATASET =
  "noaacwBLENDEDNRTcurrentsDaily";

const CURRENTS_MAX_LIVE_AGE_HOURS =
  96;

const CURRENT_SPATIAL_SAMPLE_RADIUS_NM =
  15;

const CURRENT_POINT_CACHE_TTL_MS =
  5 * 60 * 1000;

const currentPointCache =
  new Map();

const currentPointRequestsInFlight =
  new Map();


function createCurrentPointCacheKey(
  latitude,
  longitude
) {
  return [
    Number(latitude).toFixed(4),
    Number(longitude).toFixed(4)
  ].join(",");
}


function getCachedCurrentPoint(
  latitude,
  longitude
) {
  const key =
    createCurrentPointCacheKey(
      latitude,
      longitude
    );

  const cached =
    currentPointCache.get(key);

  if (!cached) {
    return null;
  }

  const ageMilliseconds =
    Date.now() -
    cached.cachedAt;

  if (
    ageMilliseconds >
    CURRENT_POINT_CACHE_TTL_MS
  ) {
    currentPointCache.delete(key);
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
        CURRENT_POINT_CACHE_TTL_MS /
        1000
    }
  };
}


function setCachedCurrentPoint(
  latitude,
  longitude,
  value
) {
  const hasVector =
    Number.isFinite(
      value?.eastwardMetersPerSecond
    ) &&
    Number.isFinite(
      value?.northwardMetersPerSecond
    );

  if (!hasVector) {
    return;
  }

  const key =
    createCurrentPointCacheKey(
      latitude,
      longitude
    );

  currentPointCache.set(
    key,
    {
      cachedAt:
        Date.now(),

      value
    }
  );
}


/**
 * Build four nearby current sampling points around a center location.
 *
 * Longitude spacing is adjusted for latitude so the east and west
 * samples remain approximately the requested nautical distance.
 */
function createCurrentSpatialSamplePoints(
  latitude,
  longitude
) {
  const latitudeOffset =
    CURRENT_SPATIAL_SAMPLE_RADIUS_NM /
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
      ? CURRENT_SPATIAL_SAMPLE_RADIUS_NM /
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
      direction:
        "north",

      latitude:
        latitude +
        latitudeOffset,

      longitude
    },

    {
      direction:
        "east",

      latitude,

      longitude:
        longitude +
        longitudeOffset
    },

    {
      direction:
        "south",

      latitude:
        latitude -
        latitudeOffset,

      longitude
    },

    {
      direction:
        "west",

      latitude,

      longitude:
        longitude -
        longitudeOffset
    }
  ];
}


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


function getCircularDirectionDifference(
  firstDegrees,
  secondDegrees
) {
  if (
    !Number.isFinite(
      firstDegrees
    ) ||
    !Number.isFinite(
      secondDegrees
    )
  ) {
    return null;
  }

  const rawDifference =
    Math.abs(
      firstDegrees -
      secondDegrees
    ) % 360;

  return Math.min(
    rawDifference,
    360 -
    rawDifference
  );
}


function classifyCurrentSpatialVariation({
  speedRangeKnots,
  maximumDirectionDifferenceDegrees,
  sufficientCoverage
} = {}) {
  if (!sufficientCoverage) {
    return "insufficient-spatial-current-data";
  }

  const hasSpeedRange =
    Number.isFinite(
      speedRangeKnots
    );

  const hasDirectionRange =
    Number.isFinite(
      maximumDirectionDifferenceDegrees
    );

  if (
    !hasSpeedRange ||
    !hasDirectionRange
  ) {
    return "insufficient-spatial-current-data";
  }

  if (
    speedRangeKnots < 0.25 &&
    maximumDirectionDifferenceDegrees < 20
  ) {
    return "uniform-current-field";
  }

  if (
    speedRangeKnots < 0.5 &&
    maximumDirectionDifferenceDegrees < 45
  ) {
    return "variable-current-field";
  }

  if (
    speedRangeKnots < 1.0 &&
    maximumDirectionDifferenceDegrees < 90
  ) {
    return "organized-current-variation";
  }

  return "high-current-variation";
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


export function resolveChlorophyllObservation({
  observations = []
} = {}) {
  const providersConsidered =
    Array.isArray(observations)
      ? observations
          .map(
            observation =>
              observation?.source?.provider
          )
          .filter(Boolean)
      : [];


  const validObservations =
    Array.isArray(observations)
      ? observations
          .filter(
            observation =>
              observation &&
              typeof observation ===
                "object" &&
              Number.isFinite(
                observation
                  .concentrationMgM3
              )
          )
      : [];


  if (
    validObservations.length === 0
  ) {
    return {
      available: false,

      classification:
        "unavailable",

      selectedObservation: null,

      providersConsidered,

      selectionReason:
        "no-valid-provider-observation",

      limitations: [
        "no-valid-chlorophyll-observation",
        "multi-source-resolution-does-not-average-provider-values"
      ],

      methodVersion:
        "pelora-chlorophyll-resolution-v1.0"
    };
  }


  const observationQualityRank =
  observation => {
    const ageHours =
      Number.isFinite(
        observation?.ageHours
      )
        ? observation.ageHours
        : Number.POSITIVE_INFINITY;

    const observationType =
      observation
        ?.source
        ?.observationType ??
      "direct-satellite";

    const isCurrent =
      ageHours <=
      CHLOROPHYLL_MAX_LIVE_AGE_HOURS;

    if (
      isCurrent &&
      observationType ===
        "direct-satellite"
    ) {
      return 0;
    }

    if (
      isCurrent &&
      observationType ===
        "gap-filled-reconstruction"
    ) {
      return 1;
    }

    if (
      !isCurrent &&
      observationType ===
        "direct-satellite"
    ) {
      return 2;
    }

    if (
      !isCurrent &&
      observationType ===
        "gap-filled-reconstruction"
    ) {
      return 3;
    }

    return 4;
  };


const rankedObservations =
  [...validObservations]
    .sort(
      (a, b) => {
        const qualityDifference =
          observationQualityRank(a) -
          observationQualityRank(b);

        if (
          qualityDifference !== 0
        ) {
          return qualityDifference;
        }

        return (
          (
            Number.isFinite(
              a?.ageHours
            )
              ? a.ageHours
              : Number.POSITIVE_INFINITY
          ) -
          (
            Number.isFinite(
              b?.ageHours
            )
              ? b.ageHours
              : Number.POSITIVE_INFINITY
          )
        );
      }
    );


  const selectedObservation =
    rankedObservations[0];


  return {
    available: true,

    classification:
      "valid-observation-selected",

    selectedObservation: {
      ...selectedObservation,

      source: {
        ...(
          selectedObservation
            ?.source ??
          {}
        )
      }
    },

    providersConsidered,

    selectionReason:
      "freshest-valid-observation",

    limitations: [
      "multi-source-resolution-does-not-average-provider-values",
      "selection-is-based-on-validity-and-observation-freshness"
    ],

    methodVersion:
      "pelora-chlorophyll-resolution-v1.0"
  };
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


async function getGapFilledChlorophyllConditions(
  latitude,
  longitude
) {
  const query =
    `chlor_a[(last)][(0.0)][(${latitude})][(${longitude})]`;

  const url =
    new URL(
      `https://coastwatch.pfeg.noaa.gov/erddap/griddap/${CHLOROPHYLL_GAP_FILLED_DATASET}.json`
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

      waterClassification:
        null,

      observedAt:
        null,

      ageHours:
        null,

      source: {
        provider:
          "NOAA NESDIS CoastWatch",

        platform:
          "S-NPP + NOAA-20 VIIRS",

        dataset:
          CHLOROPHYLL_GAP_FILLED_DATASET,

        variable:
          "chlor_a",

        units:
          "mg m^-3",

        observationType:
          "gap-filled-reconstruction",

        algorithm:
          "DINEOF",

        resolutionKilometers:
          9,

        experimental:
          true,

        classification:
          "satellite-derived-reconstruction",

        availability:
          "no-valid-pixel"
      }
    };
  }


  const row =
    rows[0];


  const valueAt =
    name => {
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
    valueAt("time") ??
    null;


  const ageHours =
    getAgeHours(
      observedAt
    );


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
        "NOAA NESDIS CoastWatch",

      platform:
        "S-NPP + NOAA-20 VIIRS",

      dataset:
        CHLOROPHYLL_GAP_FILLED_DATASET,

      variable:
        "chlor_a",

      units:
        "mg m^-3",

      observationType:
        "gap-filled-reconstruction",

      algorithm:
        "DINEOF",

      resolutionKilometers:
        9,

      experimental:
        true,

      classification:
        "satellite-derived-reconstruction",

      availability:
        concentration === null
          ? "no-valid-pixel"
          : "available"
    }
  };
}


async function getCurrentConditionsPoint(
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
      requestedLatitude:
        latitude,

      requestedLongitude:
        longitude,

      resolvedLatitude:
        latitude,

      resolvedLongitude:
        longitude,

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
    requestedLatitude:
      latitude,

    requestedLongitude:
      longitude,

    resolvedLatitude:
      latitude,

    resolvedLongitude:
      longitude,

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


async function getCachedCurrentConditionsPoint(
  latitude,
  longitude
) {
  const cached =
    getCachedCurrentPoint(
      latitude,
      longitude
    );

  if (cached) {
    return cached;
  }

  const key =
    createCurrentPointCacheKey(
      latitude,
      longitude
    );

  const inFlight =
    currentPointRequestsInFlight.get(
      key
    );

  if (inFlight) {
    const value =
      await inFlight;

    return {
      ...value,

      cache: {
        status:
          "shared",

        ageSeconds:
          0,

        ttlSeconds:
          CURRENT_POINT_CACHE_TTL_MS /
          1000
      }
    };
  }

  const request =
    getCurrentConditionsPoint(
      latitude,
      longitude
    )
      .then(
        value => {
          setCachedCurrentPoint(
            latitude,
            longitude,
            value
          );

          return value;
        }
      )
      .finally(
        () => {
          currentPointRequestsInFlight
            .delete(key);
        }
      );

  currentPointRequestsInFlight.set(
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
        CURRENT_POINT_CACHE_TTL_MS /
        1000
    }
  };
}


async function getCurrentSpatialStructure(
  latitude,
  longitude
) {
  const samplePoints =
    createCurrentSpatialSamplePoints(
      latitude,
      longitude
    );

  if (samplePoints.length === 0) {
    return {
      available:
        false,

      observationType:
        "spatial-current-sampling",

      coverage:
        "unavailable",

      requestedSampleCount:
        0,

      validSampleCount:
        0,

      failedSampleCount:
        0,

      sufficientCoverage:
        false,

      sampleRadiusNauticalMiles:
        CURRENT_SPATIAL_SAMPLE_RADIUS_NM,

      vectors:
        [],

      measurements: {
        minimumSpeedKnots:
          null,

        maximumSpeedKnots:
          null,

        speedRangeKnots:
          null,

        maximumDirectionDifferenceDegrees:
          null,

        spatialVariation:
          "insufficient-spatial-current-data"
      },

      limitations: [
        "Current spatial sample points could not be created."
      ]
    };
  }

  const results =
    await Promise.allSettled(
      samplePoints.map(
        async samplePoint => {
          const current =
            await getCachedCurrentConditionsPoint(
              samplePoint.latitude,
              samplePoint.longitude
            );

          return {
            ...samplePoint,
            current
          };
        }
      )
    );

  const vectors =
    results
      .filter(
        result =>
          result.status ===
          "fulfilled"
      )
      .map(
        result => {
          const sample =
            result.value;

          return {
            direction:
              sample.direction,

            requestedLatitude:
              sample.latitude,

            requestedLongitude:
              sample.longitude,

            resolvedLatitude:
              sample.current
                ?.resolvedLatitude ??
              sample.latitude,

            resolvedLongitude:
              sample.current
                ?.resolvedLongitude ??
              sample.longitude,

            speedKnots:
              Number.isFinite(
                sample.current
                  ?.speedKnots
              )
                ? sample.current
                    .speedKnots
                : null,

            directionDegrees:
              Number.isFinite(
                sample.current
                  ?.directionDegrees
              )
                ? sample.current
                    .directionDegrees
                : null,

            eastwardMetersPerSecond:
              Number.isFinite(
                sample.current
                  ?.eastwardMetersPerSecond
              )
                ? sample.current
                    .eastwardMetersPerSecond
                : null,

            northwardMetersPerSecond:
              Number.isFinite(
                sample.current
                  ?.northwardMetersPerSecond
              )
                ? sample.current
                    .northwardMetersPerSecond
                : null,

            observedAt:
              sample.current
                ?.observedAt ??
              null,

            ageHours:
              Number.isFinite(
                sample.current
                  ?.ageHours
              )
                ? sample.current
                    .ageHours
                : null,

            cache:
              sample.current
                ?.cache ??
              null
          };
        }
      );

  const validVectors =
    vectors.filter(
      vector =>
        Number.isFinite(
          vector.speedKnots
        ) &&
        Number.isFinite(
          vector.directionDegrees
        ) &&
        Number.isFinite(
          vector.eastwardMetersPerSecond
        ) &&
        Number.isFinite(
          vector.northwardMetersPerSecond
        )
    );

  const speeds =
    validVectors.map(
      vector =>
        vector.speedKnots
    );

  const minimumSpeedKnots =
    speeds.length > 0
      ? Math.min(...speeds)
      : null;

  const maximumSpeedKnots =
    speeds.length > 0
      ? Math.max(...speeds)
      : null;

  const speedRangeKnots =
    Number.isFinite(
      minimumSpeedKnots
    ) &&
    Number.isFinite(
      maximumSpeedKnots
    )
      ? Number(
          (
            maximumSpeedKnots -
            minimumSpeedKnots
          ).toFixed(3)
        )
      : null;

  let maximumDirectionDifferenceDegrees =
    null;

  for (
    let firstIndex = 0;
    firstIndex <
    validVectors.length;
    firstIndex += 1
  ) {
    for (
      let secondIndex =
        firstIndex + 1;
      secondIndex <
      validVectors.length;
      secondIndex += 1
    ) {
      const difference =
        getCircularDirectionDifference(
          validVectors[firstIndex]
            .directionDegrees,
          validVectors[secondIndex]
            .directionDegrees
        );

      if (
        Number.isFinite(
          difference
        ) &&
        (
          maximumDirectionDifferenceDegrees ===
            null ||
          difference >
            maximumDirectionDifferenceDegrees
        )
      ) {
        maximumDirectionDifferenceDegrees =
          difference;
      }
    }
  }

  const requestedSampleCount =
    samplePoints.length;

  const validSampleCount =
    validVectors.length;

  const failedSampleCount =
    requestedSampleCount -
    validSampleCount;

  const sufficientCoverage =
    validSampleCount >= 3;

  const coverage =
    validSampleCount ===
    requestedSampleCount
      ? "complete"
      : sufficientCoverage
        ? "partial"
        : validSampleCount > 0
          ? "insufficient"
          : "unavailable";

  const limitations =
    [];

  if (!sufficientCoverage) {
    limitations.push(
      "Fewer than three valid surrounding current vectors were available."
    );
  }

  if (
    failedSampleCount > 0
  ) {
    limitations.push(
      `${failedSampleCount} surrounding current sample${
        failedSampleCount === 1
          ? ""
          : "s"
      } did not produce a valid vector.`
    );
  }

  return {
    available:
      sufficientCoverage,

    observationType:
      "spatial-current-sampling",

    coverage,

    requestedSampleCount,

    validSampleCount,

    failedSampleCount,

    sufficientCoverage,

    sampleRadiusNauticalMiles:
      CURRENT_SPATIAL_SAMPLE_RADIUS_NM,

    vectors,

    measurements: {
      minimumSpeedKnots:
        Number.isFinite(
          minimumSpeedKnots
        )
          ? Number(
              minimumSpeedKnots
                .toFixed(3)
            )
          : null,

      maximumSpeedKnots:
        Number.isFinite(
          maximumSpeedKnots
        )
          ? Number(
              maximumSpeedKnots
                .toFixed(3)
            )
          : null,

      speedRangeKnots,

      maximumDirectionDifferenceDegrees,

      spatialVariation:
        classifyCurrentSpatialVariation({
          speedRangeKnots,
          maximumDirectionDifferenceDegrees,
          sufficientCoverage
        })
    },

    limitations
  };
}


function buildCurrentOrganizationAnalysis(
  spatialStructure
) {
  const measurements =
    spatialStructure
      ?.measurements ??
    {};

  const sufficientCoverage =
    spatialStructure
      ?.sufficientCoverage ===
    true;

  const speedRangeKnots =
    Number.isFinite(
      measurements
        ?.speedRangeKnots
    )
      ? measurements
          .speedRangeKnots
      : null;

  const maximumDirectionDifferenceDegrees =
    Number.isFinite(
      measurements
        ?.maximumDirectionDifferenceDegrees
    )
      ? measurements
          .maximumDirectionDifferenceDegrees
      : null;

  const spatialVariation =
    measurements
      ?.spatialVariation ??
    "insufficient-spatial-current-data";

  if (
    !sufficientCoverage ||
    !Number.isFinite(
      speedRangeKnots
    ) ||
    !Number.isFinite(
      maximumDirectionDifferenceDegrees
    )
  ) {
    return {
      available:
        false,

      classification:
        "unavailable",

      organizationLevel:
        "insufficient-evidence",

      evidence: {
        sufficientCoverage,

        speedRangeKnots,

        maximumDirectionDifferenceDegrees,

        spatialVariation
      },

      interpretation:
        "Current organization cannot be evaluated from the available spatial measurements.",

      limitations: [
        "At least three valid surrounding current vectors are required.",
        "Current organization does not establish convergence, shear, an edge, an eddy, or biological significance."
      ],

      thresholdVersion:
        "pelora-current-organization-v1"
    };
  }

  let classification =
    "highly-variable-current-field";

  let organizationLevel =
    "low";

  let interpretation =
    "Large speed or directional differences were measured across the surrounding current field.";

  if (
    spatialVariation ===
    "uniform-current-field"
  ) {
    classification =
      "uniform-current-field";

    organizationLevel =
      "high";

    interpretation =
      "Current speed and direction remain consistent across the surrounding sample field.";
  } else if (
    spatialVariation ===
    "variable-current-field"
  ) {
    classification =
      "weakly-variable-current-field";

    organizationLevel =
      "moderate";

    interpretation =
      "Modest current variation is present, but the surrounding flow remains broadly consistent.";
  } else if (
    spatialVariation ===
    "organized-current-variation"
  ) {
    classification =
      "organized-current-transition";

    organizationLevel =
      "moderate";

    interpretation =
      "A structured change in current speed or direction is present across the surrounding sample field.";
  }

  const limitations =
    [
      "This result describes spatial current organization only.",
      "It does not establish convergence, divergence, shear, a current edge, an eddy boundary, persistence, fish presence, or habitat quality."
    ];

  if (
    spatialStructure
      ?.coverage !==
    "complete"
  ) {
    limitations.push(
      "Organization was evaluated with partial spatial coverage."
    );
  }

  return {
    available:
      true,

    classification,

    organizationLevel,

    evidence: {
      sufficientCoverage,

      coverage:
        spatialStructure
          ?.coverage ??
        "unknown",

      requestedSampleCount:
        spatialStructure
          ?.requestedSampleCount ??
        null,

      validSampleCount:
        spatialStructure
          ?.validSampleCount ??
        null,

      speedRangeKnots,

      maximumDirectionDifferenceDegrees,

      spatialVariation
    },

    interpretation,

    limitations,

    thresholdVersion:
      "pelora-current-organization-v1"
  };
}


function buildCurrentRelationshipContext(
  organizationAnalysis
) {
  const available =
    organizationAnalysis
      ?.available ===
    true;

  const classification =
    organizationAnalysis
      ?.classification ??
    "unavailable";

  const organizationLevel =
    organizationAnalysis
      ?.organizationLevel ??
    "insufficient-evidence";

  const evidence =
    organizationAnalysis
      ?.evidence ??
    {};

  if (!available) {
    return {
      available:
        false,

      relationshipType:
        "unavailable",

      relationshipState:
        "insufficient-evidence",

      organizationLevel:
        "insufficient-evidence",

      evidence: {
        organizationAvailable:
          false,

        organizationClassification:
          classification,

        spatialVariation:
          evidence
            ?.spatialVariation ??
          "insufficient-spatial-current-data",

        coverage:
          evidence
            ?.coverage ??
          "unknown",

        validSampleCount:
          evidence
            ?.validSampleCount ??
          null
      },

      interpretation:
        "A current-field relationship cannot be described because spatial organization evidence is unavailable.",

      limitations: [
        "Current Relationship Context requires a valid Current Organization result.",
        "No convergence, divergence, shear, edge, eddy, persistence, habitat, or biological relationship is inferred."
      ],

      contractVersion:
        "pelora-current-relationship-context-v1"
    };
  }

  let relationshipType =
    "variable-flow-relationship";

  let relationshipState =
    "observed";

  let interpretation =
    "The surrounding current vectors show substantial variation, but the specific physical relationship has not been resolved.";

  if (
    classification ===
    "uniform-current-field"
  ) {
    relationshipType =
      "coherent-flow-field";

    relationshipState =
      "observed";

    interpretation =
      "The surrounding current vectors describe a coherent flow field with limited spatial variation.";
  } else if (
    classification ===
    "weakly-variable-current-field"
  ) {
    relationshipType =
      "broadly-coherent-flow-field";

    relationshipState =
      "observed";

    interpretation =
      "The surrounding current vectors remain broadly coherent while showing modest spatial variation.";
  } else if (
    classification ===
    "organized-current-transition"
  ) {
    relationshipType =
      "organized-flow-transition";

    relationshipState =
      "candidate";

    interpretation =
      "The surrounding current vectors describe an organized spatial transition whose physical mechanism has not yet been determined.";
  } else if (
    classification ===
    "highly-variable-current-field"
  ) {
    relationshipType =
      "complex-variable-flow-field";

    relationshipState =
      "unresolved";

    interpretation =
      "The surrounding current vectors describe a complex variable flow field that requires additional spatial analysis.";
  }

  const inheritedLimitations =
    Array.isArray(
      organizationAnalysis
        ?.limitations
    )
      ? organizationAnalysis
          .limitations
      : [];

  const limitations =
    [
      ...new Set([
        ...inheritedLimitations,

        "This contract describes the relationship among surrounding current observations only.",

        "An organized flow transition is not proof of convergence, divergence, shear, a current edge, or an eddy boundary.",

        "No persistence, prey concentration, fish presence, habitat quality, or species suitability is inferred."
      ])
    ];

  return {
    available:
      true,

    relationshipType,

    relationshipState,

    organizationLevel,

    evidence: {
      organizationAvailable:
        true,

      organizationClassification:
        classification,

      spatialVariation:
        evidence
          ?.spatialVariation ??
        null,

      coverage:
        evidence
          ?.coverage ??
        "unknown",

      requestedSampleCount:
        evidence
          ?.requestedSampleCount ??
        null,

      validSampleCount:
        evidence
          ?.validSampleCount ??
        null,

      speedRangeKnots:
        Number.isFinite(
          evidence
            ?.speedRangeKnots
        )
          ? evidence
              .speedRangeKnots
          : null,

      maximumDirectionDifferenceDegrees:
        Number.isFinite(
          evidence
            ?.maximumDirectionDifferenceDegrees
        )
          ? evidence
              .maximumDirectionDifferenceDegrees
          : null
    },

    interpretation,

    limitations,

    upstreamContract: {
      engine:
        "current-organization",

      version:
        organizationAnalysis
          ?.thresholdVersion ??
        null
    },

    contractVersion:
      "pelora-current-relationship-context-v1"
  };
}


function getCurrentProjectionAxes(
  sampleDirection
) {
  /*
   * Each inward axis points from the surrounding sample
   * toward the center of the spatial sampling field.
   *
   * The tangential axis is oriented clockwise around the
   * center point:
   *
   * north sample -> east
   * east sample  -> south
   * south sample -> west
   * west sample  -> north
   */
  const axes = {
    north: {
      inwardEast:
        0,

      inwardNorth:
        -1,

      clockwiseTangentialEast:
        1,

      clockwiseTangentialNorth:
        0
    },

    east: {
      inwardEast:
        -1,

      inwardNorth:
        0,

      clockwiseTangentialEast:
        0,

      clockwiseTangentialNorth:
        -1
    },

    south: {
      inwardEast:
        0,

      inwardNorth:
        1,

      clockwiseTangentialEast:
        -1,

      clockwiseTangentialNorth:
        0
    },

    west: {
      inwardEast:
        1,

      inwardNorth:
        0,

      clockwiseTangentialEast:
        0,

      clockwiseTangentialNorth:
        1
    }
  };

  return axes[
    sampleDirection
  ] ?? null;
}


function buildCurrentVectorProjectionAnalysis(
  spatialStructure
) {
  const vectors =
    Array.isArray(
      spatialStructure
        ?.vectors
    )
      ? spatialStructure
          .vectors
      : [];

  const projectedVectors =
    vectors.map(
      vector => {
        const axes =
          getCurrentProjectionAxes(
            vector
              ?.direction
          );

        const eastwardMetersPerSecond =
          Number.isFinite(
            vector
              ?.eastwardMetersPerSecond
          )
            ? vector
                .eastwardMetersPerSecond
            : null;

        const northwardMetersPerSecond =
          Number.isFinite(
            vector
              ?.northwardMetersPerSecond
          )
            ? vector
                .northwardMetersPerSecond
            : null;

        if (
          !axes ||
          !Number.isFinite(
            eastwardMetersPerSecond
          ) ||
          !Number.isFinite(
            northwardMetersPerSecond
          )
        ) {
          return {
            sampleDirection:
              vector
                ?.direction ??
              "unknown",

            available:
              false,

            requestedLatitude:
              Number.isFinite(
                vector
                  ?.requestedLatitude
              )
                ? vector
                    .requestedLatitude
                : null,

            requestedLongitude:
              Number.isFinite(
                vector
                  ?.requestedLongitude
              )
                ? vector
                    .requestedLongitude
                : null,

            reason:
              !axes
                ? "unsupported-sample-direction"
                : "missing-current-vector-components"
          };
        }

        const vectorMagnitudeMetersPerSecond =
          Math.hypot(
            eastwardMetersPerSecond,
            northwardMetersPerSecond
          );

        /*
         * Positive signed radial values point toward the
         * center. Negative values point away from it.
         */
        const signedRadialMetersPerSecond =
          (
            eastwardMetersPerSecond *
            axes.inwardEast
          ) +
          (
            northwardMetersPerSecond *
            axes.inwardNorth
          );

        /*
         * Positive signed tangential values move clockwise
         * around the center. Negative values move
         * counterclockwise.
         */
        const signedTangentialMetersPerSecond =
          (
            eastwardMetersPerSecond *
            axes
              .clockwiseTangentialEast
          ) +
          (
            northwardMetersPerSecond *
            axes
              .clockwiseTangentialNorth
          );

        const inwardMetersPerSecond =
          Math.max(
            signedRadialMetersPerSecond,
            0
          );

        const outwardMetersPerSecond =
          Math.max(
            -signedRadialMetersPerSecond,
            0
          );

        const absoluteTangentialMetersPerSecond =
          Math.abs(
            signedTangentialMetersPerSecond
          );

        let inwardAlignmentDegrees =
          null;

        if (
          vectorMagnitudeMetersPerSecond >
          0
        ) {
          const normalizedProjection =
            Math.max(
              -1,
              Math.min(
                1,
                signedRadialMetersPerSecond /
                vectorMagnitudeMetersPerSecond
              )
            );

          inwardAlignmentDegrees =
            Math.acos(
              normalizedProjection
            ) *
            (
              180 /
              Math.PI
            );
        }

        return {
          sampleDirection:
            vector.direction,

          available:
            true,

          requestedLatitude:
            Number.isFinite(
              vector
                ?.requestedLatitude
            )
              ? vector
                  .requestedLatitude
              : null,

          requestedLongitude:
            Number.isFinite(
              vector
                ?.requestedLongitude
            )
              ? vector
                  .requestedLongitude
              : null,

          resolvedLatitude:
            Number.isFinite(
              vector
                ?.resolvedLatitude
            )
              ? vector
                  .resolvedLatitude
              : null,

          resolvedLongitude:
            Number.isFinite(
              vector
                ?.resolvedLongitude
            )
              ? vector
                  .resolvedLongitude
              : null,

          speedKnots:
            Number.isFinite(
              vector
                ?.speedKnots
            )
              ? vector
                  .speedKnots
              : null,

          directionDegrees:
            Number.isFinite(
              vector
                ?.directionDegrees
            )
              ? vector
                  .directionDegrees
              : null,

          eastwardMetersPerSecond:
            Number(
              eastwardMetersPerSecond
                .toFixed(4)
            ),

          northwardMetersPerSecond:
            Number(
              northwardMetersPerSecond
                .toFixed(4)
            ),

          vectorMagnitudeMetersPerSecond:
            Number(
              vectorMagnitudeMetersPerSecond
                .toFixed(4)
            ),

          signedRadialMetersPerSecond:
            Number(
              signedRadialMetersPerSecond
                .toFixed(4)
            ),

          inwardMetersPerSecond:
            Number(
              inwardMetersPerSecond
                .toFixed(4)
            ),

          outwardMetersPerSecond:
            Number(
              outwardMetersPerSecond
                .toFixed(4)
            ),

          signedClockwiseTangentialMetersPerSecond:
            Number(
              signedTangentialMetersPerSecond
                .toFixed(4)
            ),

          absoluteTangentialMetersPerSecond:
            Number(
              absoluteTangentialMetersPerSecond
                .toFixed(4)
            ),

          inwardAlignmentDegrees:
            Number.isFinite(
              inwardAlignmentDegrees
            )
              ? Number(
                  inwardAlignmentDegrees
                    .toFixed(1)
                )
              : null,

          observedAt:
            vector
              ?.observedAt ??
            null,

          ageHours:
            Number.isFinite(
              vector
                ?.ageHours
            )
              ? vector
                  .ageHours
              : null
        };
      }
    );

  const validProjections =
    projectedVectors.filter(
      projection =>
        projection
          ?.available ===
        true
    );

  const requestedProjectionCount =
    vectors.length;

  const validProjectionCount =
    validProjections.length;

  const failedProjectionCount =
    requestedProjectionCount -
    validProjectionCount;

  const sufficientCoverage =
    validProjectionCount >=
    3;

  const coverage =
    requestedProjectionCount > 0 &&
    validProjectionCount ===
      requestedProjectionCount
      ? "complete"
      : sufficientCoverage
        ? "partial"
        : validProjectionCount > 0
          ? "insufficient"
          : "unavailable";

  const limitations =
    [];

  if (!sufficientCoverage) {
    limitations.push(
      "Fewer than three valid current-vector projections were available."
    );
  }

  if (
    failedProjectionCount > 0
  ) {
    limitations.push(
      `${failedProjectionCount} current vector projection${
        failedProjectionCount === 1
          ? ""
          : "s"
      } could not be calculated.`
    );
  }

  limitations.push(
    "Vector projections describe mathematical movement relative to the center of the sampling field only.",

    "Positive radial movement is inward and negative radial movement is outward.",

    "Positive tangential movement is clockwise and negative tangential movement is counterclockwise.",

    "No convergence, divergence, shear, current edge, rotation, eddy, persistence, habitat, or biological significance is inferred."
  );

  return {
    available:
      sufficientCoverage,

    analysisType:
      "current-vector-projection",

    coverage,

    requestedProjectionCount,

    validProjectionCount,

    failedProjectionCount,

    sufficientCoverage,

    sampleRadiusNauticalMiles:
      Number.isFinite(
        spatialStructure
          ?.sampleRadiusNauticalMiles
      )
        ? spatialStructure
            .sampleRadiusNauticalMiles
        : null,

    projections:
      projectedVectors,

    interpretation:
      sufficientCoverage
        ? "Current vectors were projected into radial and tangential movement relative to the center of the spatial sample."
        : "The available current vectors were insufficient for a complete spatial projection analysis.",

    limitations: [
      ...new Set(
        limitations
      )
    ],

    upstreamContract: {
      engine:
        "current-spatial-structure",

      version:
        spatialStructure
          ?.contractVersion ??
        spatialStructure
          ?.thresholdVersion ??
        null
    },

    contractVersion:
      "pelora-current-vector-projection-v1"
  };
}


function getOpposingCurrentSampleDirection(
  sampleDirection
) {
  const opposingDirections = {
    north:
      "south",

    east:
      "west",

    south:
      "north",

    west:
      "east"
  };

  return opposingDirections[
    sampleDirection
  ] ?? null;
}


export function buildCurrentGradientAnalysis(
  vectorProjection
) {
  const projections =
    Array.isArray(
      vectorProjection
        ?.projections
    )
      ? vectorProjection
          .projections
      : [];

  const validProjections =
    projections.filter(
      projection =>
        projection
          ?.available ===
          true &&
        typeof projection
          ?.sampleDirection ===
          "string" &&
        Number.isFinite(
          projection
            ?.eastwardMetersPerSecond
        ) &&
        Number.isFinite(
          projection
            ?.northwardMetersPerSecond
        ) &&
        Number.isFinite(
          projection
            ?.signedRadialMetersPerSecond
        ) &&
        Number.isFinite(
          projection
            ?.signedClockwiseTangentialMetersPerSecond
        ) &&
        Number.isFinite(
          projection
            ?.requestedLatitude
        ) &&
        Number.isFinite(
          projection
            ?.requestedLongitude
        )
    );

  const projectionsByDirection =
    new Map(
      validProjections.map(
        projection => [
          projection
            .sampleDirection,
          projection
        ]
      )
    );

  const requestedAxisPairs = [
    {
      axis:
        "north-south",

      firstDirection:
        "north",

      secondDirection:
        "south"
    },

    {
      axis:
        "east-west",

      firstDirection:
        "east",

      secondDirection:
        "west"
    }
  ];

  const axisComparisons =
    requestedAxisPairs.map(
      ({
        axis,
        firstDirection,
        secondDirection
      }) => {
        const firstProjection =
          projectionsByDirection.get(
            firstDirection
          );

        const secondProjection =
          projectionsByDirection.get(
            secondDirection
          );

        if (
          !firstProjection ||
          !secondProjection
        ) {
          return {
            axis,

            available:
              false,

            firstDirection,

            secondDirection,

            reason:
              "missing-opposing-projection"
          };
        }

        const separationNauticalMiles =
          nauticalMilesBetween(
            firstProjection
              .requestedLatitude,
            firstProjection
              .requestedLongitude,
            secondProjection
              .requestedLatitude,
            secondProjection
              .requestedLongitude
          );

        if (
          !Number.isFinite(
            separationNauticalMiles
          ) ||
          separationNauticalMiles <=
            0
        ) {
          return {
            axis,

            available:
              false,

            firstDirection,

            secondDirection,

            reason:
              "invalid-axis-separation"
          };
        }

        const eastwardDifferenceMetersPerSecond =
          secondProjection
            .eastwardMetersPerSecond -
          firstProjection
            .eastwardMetersPerSecond;

        const northwardDifferenceMetersPerSecond =
          secondProjection
            .northwardMetersPerSecond -
          firstProjection
            .northwardMetersPerSecond;

        const totalVectorDifferenceMetersPerSecond =
          Math.hypot(
            eastwardDifferenceMetersPerSecond,
            northwardDifferenceMetersPerSecond
          );

        const totalVectorGradientMetersPerSecondPerNauticalMile =
          totalVectorDifferenceMetersPerSecond /
          separationNauticalMiles;

        const opposingRadialSumMetersPerSecond =
          firstProjection
            .signedRadialMetersPerSecond +
          secondProjection
            .signedRadialMetersPerSecond;

        const radialAsymmetryMetersPerSecond =
          Math.abs(
            firstProjection
              .signedRadialMetersPerSecond -
            secondProjection
              .signedRadialMetersPerSecond
          );

        const radialAsymmetryGradientMetersPerSecondPerNauticalMile =
          radialAsymmetryMetersPerSecond /
          separationNauticalMiles;

        const tangentialDifferenceMetersPerSecond =
          Math.abs(
            firstProjection
              .signedClockwiseTangentialMetersPerSecond -
            secondProjection
              .signedClockwiseTangentialMetersPerSecond
          );

        const tangentialGradientMetersPerSecondPerNauticalMile =
          tangentialDifferenceMetersPerSecond /
          separationNauticalMiles;

        const speedDifferenceKnots =
          Number.isFinite(
            firstProjection
              ?.speedKnots
          ) &&
          Number.isFinite(
            secondProjection
              ?.speedKnots
          )
            ? Math.abs(
                firstProjection
                  .speedKnots -
                secondProjection
                  .speedKnots
              )
            : null;

        const directionDifferenceDegrees =
          Number.isFinite(
            firstProjection
              ?.directionDegrees
          ) &&
          Number.isFinite(
            secondProjection
              ?.directionDegrees
          )
            ? getCircularDirectionDifference(
                firstProjection
                  .directionDegrees,
                secondProjection
                  .directionDegrees
              )
            : null;

        return {
          axis,

          available:
            true,

          firstDirection,

          secondDirection,

          separationNauticalMiles:
            Number(
              separationNauticalMiles
                .toFixed(3)
            ),

          eastwardDifferenceMetersPerSecond:
            Number(
              eastwardDifferenceMetersPerSecond
                .toFixed(4)
            ),

          northwardDifferenceMetersPerSecond:
            Number(
              northwardDifferenceMetersPerSecond
                .toFixed(4)
            ),

          totalVectorDifferenceMetersPerSecond:
            Number(
              totalVectorDifferenceMetersPerSecond
                .toFixed(4)
            ),

          totalVectorGradientMetersPerSecondPerNauticalMile:
            Number(
              totalVectorGradientMetersPerSecondPerNauticalMile
                .toFixed(5)
            ),

          opposingRadialSumMetersPerSecond:
            Number(
              opposingRadialSumMetersPerSecond
                .toFixed(4)
            ),

          radialAsymmetryMetersPerSecond:
            Number(
              radialAsymmetryMetersPerSecond
                .toFixed(4)
            ),

          radialAsymmetryGradientMetersPerSecondPerNauticalMile:
            Number(
              radialAsymmetryGradientMetersPerSecondPerNauticalMile
                .toFixed(5)
            ),

          tangentialDifferenceMetersPerSecond:
            Number(
              tangentialDifferenceMetersPerSecond
                .toFixed(4)
            ),

          tangentialGradientMetersPerSecondPerNauticalMile:
            Number(
              tangentialGradientMetersPerSecondPerNauticalMile
                .toFixed(5)
            ),

          speedDifferenceKnots:
            Number.isFinite(
              speedDifferenceKnots
            )
              ? Number(
                  speedDifferenceKnots
                    .toFixed(3)
                )
              : null,

          directionDifferenceDegrees:
            Number.isFinite(
              directionDifferenceDegrees
            )
              ? Number(
                  directionDifferenceDegrees
                    .toFixed(1)
                )
              : null
        };
      }
    );

  const validAxisComparisons =
    axisComparisons.filter(
      comparison =>
        comparison
          ?.available ===
        true
    );

  const validAxisCount =
    validAxisComparisons.length;

  const sufficientCoverage =
    vectorProjection
      ?.sufficientCoverage ===
      true &&
    validAxisCount >=
      1;

  const coverage =
    validAxisCount ===
      requestedAxisPairs.length
      ? "complete"
      : validAxisCount ===
          1
        ? "partial"
        : "unavailable";

  const maximumTotalVectorGradient =
    validAxisCount > 0
      ? Math.max(
          ...validAxisComparisons.map(
            comparison =>
              comparison
                .totalVectorGradientMetersPerSecondPerNauticalMile
          )
        )
      : null;

  const maximumRadialAsymmetryGradient =
    validAxisCount > 0
      ? Math.max(
          ...validAxisComparisons.map(
            comparison =>
              comparison
                .radialAsymmetryGradientMetersPerSecondPerNauticalMile
          )
        )
      : null;

  const maximumTangentialGradient =
    validAxisCount > 0
      ? Math.max(
          ...validAxisComparisons.map(
            comparison =>
              comparison
                .tangentialGradientMetersPerSecondPerNauticalMile
          )
        )
      : null;

  const inheritedLimitations =
    Array.isArray(
      vectorProjection
        ?.limitations
    )
      ? vectorProjection
          .limitations
      : [];

  const limitations =
    [
      ...new Set([
        ...inheritedLimitations,

        "Gradient values are finite-difference measurements across the north-south and east-west opposing sample axes.",

        "The analysis describes horizontal surface-current variation within the sampled radius only.",

        "Radial asymmetry, opposing radial support, tangential change, and total vector change are reported separately.",

        "This engine measures current gradients but does not classify convergence, divergence, shear, a current edge, rotation, an eddy boundary, persistence, habitat quality, prey concentration, fish presence, or biological significance."
      ])
    ];

  return {
    available:
      sufficientCoverage,

    analysisType:
      "current-gradient-analysis",

    coverage,

    requestedAxisCount:
      requestedAxisPairs.length,

    validAxisCount,

    failedAxisCount:
      requestedAxisPairs.length -
      validAxisCount,

    sufficientCoverage,

    sampleRadiusNauticalMiles:
      Number.isFinite(
        vectorProjection
          ?.sampleRadiusNauticalMiles
      )
        ? vectorProjection
            .sampleRadiusNauticalMiles
        : null,

    axisComparisons,

    measurements: {
      maximumTotalVectorGradientMetersPerSecondPerNauticalMile:
        Number.isFinite(
          maximumTotalVectorGradient
        )
          ? Number(
              maximumTotalVectorGradient
                .toFixed(5)
            )
          : null,

      maximumRadialAsymmetryGradientMetersPerSecondPerNauticalMile:
        Number.isFinite(
          maximumRadialAsymmetryGradient
        )
          ? Number(
              maximumRadialAsymmetryGradient
                .toFixed(5)
            )
          : null,

      maximumTangentialGradientMetersPerSecondPerNauticalMile:
        Number.isFinite(
          maximumTangentialGradient
        )
          ? Number(
              maximumTangentialGradient
                .toFixed(5)
            )
          : null
    },

    interpretation:
      sufficientCoverage
        ? "Opposing current samples were compared to measure radial, tangential, and total horizontal velocity change across the spatial field."
        : "Opposing current samples were insufficient for Current Gradient Analysis.",

    limitations,

    upstreamContract: {
      engine:
        "current-vector-projection",

      version:
        vectorProjection
          ?.contractVersion ??
        null
    },

    contractVersion:
      "pelora-current-gradient-v1"
  };
}


export function buildCurrentShearAnalysis(
  currentGradient
) {
  const axisComparisons =
    Array.isArray(
      currentGradient
        ?.axisComparisons
    )
      ? currentGradient
          .axisComparisons
      : [];

  const validAxisComparisons =
    axisComparisons.filter(
      comparison =>
        comparison
          ?.available ===
          true &&
        typeof comparison
          ?.axis ===
          "string" &&
        Number.isFinite(
          comparison
            ?.totalVectorGradientMetersPerSecondPerNauticalMile
        ) &&
        Number.isFinite(
          comparison
            ?.tangentialGradientMetersPerSecondPerNauticalMile
        ) &&
        Number.isFinite(
          comparison
            ?.radialAsymmetryGradientMetersPerSecondPerNauticalMile
        )
    );

  /*
   * These thresholds identify meaningful horizontal
   * surface-current velocity change across an opposing
   * spatial-sampling axis.
   *
   * They do not establish a current edge, front,
   * turbulence, persistence, prey concentration,
   * habitat quality, or biological use.
   */
  const meaningfulTotalVectorGradientMetersPerSecondPerNauticalMile =
    0.01;

  const strongTotalVectorGradientMetersPerSecondPerNauticalMile =
    0.02;

  const meaningfulAxisComparisons =
    validAxisComparisons.filter(
      comparison =>
        comparison
          .totalVectorGradientMetersPerSecondPerNauticalMile >=
        meaningfulTotalVectorGradientMetersPerSecondPerNauticalMile
    );

  const strongAxisComparisons =
    validAxisComparisons.filter(
      comparison =>
        comparison
          .totalVectorGradientMetersPerSecondPerNauticalMile >=
        strongTotalVectorGradientMetersPerSecondPerNauticalMile
    );

  const completeAxisCoverage =
    currentGradient
      ?.coverage ===
      "complete" &&
    validAxisComparisons.length >=
      2;

  const sufficientCoverage =
    currentGradient
      ?.available ===
      true &&
    currentGradient
      ?.sufficientCoverage ===
      true &&
    validAxisComparisons.length >=
      1;

  const meaningfulAxisCount =
    meaningfulAxisComparisons.length;

  const strongAxisCount =
    strongAxisComparisons.length;

  const supportingAxes =
    meaningfulAxisComparisons.map(
      comparison =>
        comparison.axis
    );

  const maximumTotalVectorGradient =
    validAxisComparisons.length > 0
      ? Math.max(
          ...validAxisComparisons.map(
            comparison =>
              comparison
                .totalVectorGradientMetersPerSecondPerNauticalMile
          )
        )
      : null;

  const maximumTangentialGradient =
    validAxisComparisons.length > 0
      ? Math.max(
          ...validAxisComparisons.map(
            comparison =>
              comparison
                .tangentialGradientMetersPerSecondPerNauticalMile
          )
        )
      : null;

  const maximumRadialAsymmetryGradient =
    validAxisComparisons.length > 0
      ? Math.max(
          ...validAxisComparisons.map(
            comparison =>
              comparison
                .radialAsymmetryGradientMetersPerSecondPerNauticalMile
          )
        )
      : null;

  let available =
    sufficientCoverage;

  let currentShearDetected =
    false;

  let shearType =
    "unavailable";

  let shearState =
    "insufficient-evidence";

  let shearStrength =
    "unknown";

  let interpretation =
    "Horizontal current shear cannot be evaluated from the available Current Gradient Analysis.";

  if (sufficientCoverage) {
    shearType =
      "no-shear-candidate";

    shearState =
      "not-supported";

    shearStrength =
      "none";

    interpretation =
      "The available opposing-axis measurements do not show a sufficiently strong horizontal velocity gradient to support a current-shear candidate.";

    if (
      meaningfulAxisCount >
        0 &&
      !completeAxisCoverage
    ) {
      shearType =
        "localized-horizontal-velocity-change";

      shearState =
        "incomplete-support";

      shearStrength =
        strongAxisCount > 0
          ? "strong-localized"
          : "localized";

      interpretation =
        "Meaningful horizontal velocity change is present on an available opposing axis, but complete two-axis coverage is unavailable.";
    } else if (
      completeAxisCoverage &&
      (
        strongAxisCount >=
          1 ||
        meaningfulAxisCount >=
          2
      )
    ) {
      currentShearDetected =
        true;

      shearType =
        "pronounced-horizontal-shear-candidate";

      shearState =
        "candidate";

      shearStrength =
        "pronounced";

      interpretation =
        strongAxisCount >=
          1
          ? "At least one opposing axis shows a strong horizontal velocity gradient with complete two-axis spatial coverage."
          : "Both opposing axes show meaningful horizontal velocity gradients across the sampled current field.";
    } else if (
      completeAxisCoverage &&
      meaningfulAxisCount ===
        1
    ) {
      currentShearDetected =
        true;

      shearType =
        "horizontal-shear-candidate";

      shearState =
        "candidate";

      shearStrength =
        "measurable";

      interpretation =
        "One opposing axis shows a meaningful horizontal velocity gradient while complete two-axis spatial coverage is available.";
    }
  }

  const inheritedLimitations =
    Array.isArray(
      currentGradient
        ?.limitations
    )
      ? currentGradient
          .limitations
      : [];

  const limitations =
    [
      ...new Set([
        ...inheritedLimitations,

        "Current Shear Analysis consumes finite-difference measurements from Current Gradient Analysis.",

        "A shear candidate requires complete north-south and east-west gradient coverage.",

        "Partial coverage may identify localized horizontal velocity change but does not support a shear candidate.",

        "This engine evaluates horizontal surface-current shear only; vertical shear and subsurface structure are unavailable.",

        "A current-shear candidate is not proof of a current edge, front, convergence zone, eddy boundary, turbulence, persistence, prey concentration, habitat quality, fish presence, or biological significance."
      ])
    ];

  return {
    available,

    analysisType:
      "current-shear-analysis",

    currentShearDetected,

    shearType,

    shearState,

    shearStrength,

    evidence: {
      gradientAvailable:
        currentGradient
          ?.available ===
        true,

      gradientCoverage:
        currentGradient
          ?.coverage ??
        "unknown",

      sufficientCoverage,

      completeAxisCoverage,

      requestedAxisCount:
        currentGradient
          ?.requestedAxisCount ??
        null,

      validAxisCount:
        validAxisComparisons.length,

      meaningfulAxisCount,

      strongAxisCount,

      supportingAxes,

      maximumTotalVectorGradientMetersPerSecondPerNauticalMile:
        Number.isFinite(
          maximumTotalVectorGradient
        )
          ? Number(
              maximumTotalVectorGradient
                .toFixed(5)
            )
          : null,

      maximumTangentialGradientMetersPerSecondPerNauticalMile:
        Number.isFinite(
          maximumTangentialGradient
        )
          ? Number(
              maximumTangentialGradient
                .toFixed(5)
            )
          : null,

      maximumRadialAsymmetryGradientMetersPerSecondPerNauticalMile:
        Number.isFinite(
          maximumRadialAsymmetryGradient
        )
          ? Number(
              maximumRadialAsymmetryGradient
                .toFixed(5)
            )
          : null,

      axisSupport:
        validAxisComparisons.map(
          comparison => ({
            axis:
              comparison.axis,

            totalVectorGradientMetersPerSecondPerNauticalMile:
              comparison
                .totalVectorGradientMetersPerSecondPerNauticalMile,

            tangentialGradientMetersPerSecondPerNauticalMile:
              comparison
                .tangentialGradientMetersPerSecondPerNauticalMile,

            radialAsymmetryGradientMetersPerSecondPerNauticalMile:
              comparison
                .radialAsymmetryGradientMetersPerSecondPerNauticalMile,

            meaningful:
              comparison
                .totalVectorGradientMetersPerSecondPerNauticalMile >=
              meaningfulTotalVectorGradientMetersPerSecondPerNauticalMile,

            strong:
              comparison
                .totalVectorGradientMetersPerSecondPerNauticalMile >=
              strongTotalVectorGradientMetersPerSecondPerNauticalMile
          })
        )
    },

    thresholds: {
      meaningfulTotalVectorGradientMetersPerSecondPerNauticalMile,

      strongTotalVectorGradientMetersPerSecondPerNauticalMile,

      minimumCompleteAxisCount:
        2,

      minimumMeaningfulAxesForCandidate:
        1,

      minimumMeaningfulAxesForPronounced:
        2,

      minimumStrongAxesForPronounced:
        1
    },

    interpretation,

    limitations,

    upstreamContract: {
      engine:
        "current-gradient-analysis",

      version:
        currentGradient
          ?.contractVersion ??
        null
    },

    contractVersion:
      "pelora-current-shear-v1"
  };
}


export function buildCurrentEdgeAnalysis(
  currentGradient,
  currentShear,
  currentSpatialPattern,
  currentConvergence
) {
  const gradientAvailable =
    currentGradient
      ?.available ===
    true;

  const shearAvailable =
    currentShear
      ?.available ===
    true;

  const patternAvailable =
    currentSpatialPattern
      ?.available ===
    true;

  const completeAxisCoverage =
    currentShear
      ?.evidence
      ?.completeAxisCoverage ===
    true;

  const patternState =
    currentSpatialPattern
      ?.patternState ??
    "insufficient-evidence";

  const patternType =
    currentSpatialPattern
      ?.patternType ??
    "unavailable";

  const dominantVariation =
    currentSpatialPattern
      ?.dominantVariation ??
    "unknown";

  const transitionPatternSupported =
    patternState ===
      "candidate" &&
    [
      "speed",
      "direction",
      "mixed"
    ].includes(
      dominantVariation
    );

  const pronouncedTransitionPattern =
    typeof patternType ===
      "string" &&
    patternType.startsWith(
      "pronounced-"
    );

  const shearCandidateSupported =
    currentShear
      ?.currentShearDetected ===
    true &&
    currentShear
      ?.shearState ===
    "candidate";

  const pronouncedShearSupported =
    currentShear
      ?.shearStrength ===
    "pronounced";

  const localizedVelocityChange =
    currentShear
      ?.shearType ===
    "localized-horizontal-velocity-change";

  const convergenceCandidateSupported =
    currentConvergence
      ?.currentConvergenceDetected ===
    true;

  const sufficientEvidence =
    gradientAvailable &&
    shearAvailable &&
    patternAvailable;

  let available =
    sufficientEvidence;

  let currentEdgeDetected =
    false;

  let edgeType =
    "unavailable";

  let edgeState =
    "insufficient-evidence";

  let edgeStrength =
    "unknown";

  let interpretation =
    "A current edge cannot be evaluated from the available spatial-current evidence.";

  if (sufficientEvidence) {
    edgeType =
      "no-edge-candidate";

    edgeState =
      "not-supported";

    edgeStrength =
      "none";

    interpretation =
      "The available spatial-current measurements do not provide corroborating transition and shear evidence for a current-edge candidate.";

    if (
      transitionPatternSupported &&
      localizedVelocityChange &&
      !completeAxisCoverage
    ) {
      edgeType =
        "localized-current-transition";

      edgeState =
        "incomplete-support";

      edgeStrength =
        pronouncedTransitionPattern
          ? "strong-localized"
          : "localized";

      interpretation =
        "A measurable current transition and localized horizontal velocity change are present, but complete two-axis gradient coverage is unavailable.";
    } else if (
      transitionPatternSupported &&
      shearCandidateSupported &&
      completeAxisCoverage
    ) {
      currentEdgeDetected =
        true;

      edgeType =
        (
          pronouncedTransitionPattern ||
          pronouncedShearSupported
        )
          ? "pronounced-current-edge-candidate"
          : "current-edge-candidate";

      edgeState =
        "candidate";

      edgeStrength =
        (
          pronouncedTransitionPattern ||
          pronouncedShearSupported
        )
          ? "pronounced"
          : "measurable";

      interpretation =
        convergenceCandidateSupported
          ? "A spatial current transition is corroborated by horizontal shear with complete two-axis coverage. Convergent flow is also present within the sampled field."
          : "A spatial current transition is corroborated by horizontal shear with complete two-axis coverage.";
    }
  }

  const inheritedLimitations = [
    ...(
      Array.isArray(
        currentGradient
          ?.limitations
      )
        ? currentGradient
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        currentShear
          ?.limitations
      )
        ? currentShear
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        currentSpatialPattern
          ?.limitations
      )
        ? currentSpatialPattern
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        currentConvergence
          ?.limitations
      )
        ? currentConvergence
            .limitations
        : []
    )
  ];

  const limitations = [
    ...new Set([
      ...inheritedLimitations,

      "Current Edge Analysis requires a measurable spatial transition corroborated by horizontal current-shear evidence.",

      "A current-edge candidate requires complete north-south and east-west gradient coverage.",

      "Convergence may support the interpretation but is not required because current edges may exist without convergent surface flow.",

      "This analysis describes a surface-current boundary candidate within the sampled radius only.",

      "No water-mass identity, thermal front, productivity boundary, persistence, prey concentration, habitat quality, fish presence, or biological significance is inferred."
    ])
  ];

  return {
    available,

    analysisType:
      "current-edge-analysis",

    currentEdgeDetected,

    edgeType,

    edgeState,

    edgeStrength,

    dominantTransition:
      transitionPatternSupported
        ? dominantVariation
        : "none",

    evidence: {
      gradientAvailable,

      shearAvailable,

      patternAvailable,

      completeAxisCoverage,

      transitionPatternSupported,

      pronouncedTransitionPattern,

      shearCandidateSupported,

      pronouncedShearSupported,

      localizedVelocityChange,

      convergenceAvailable:
        currentConvergence
          ?.available ===
        true,

      convergenceCandidateSupported,

      patternType,

      patternState,

      dominantVariation,

      gradientCoverage:
        currentGradient
          ?.coverage ??
        "unknown",

      supportingAxes:
        Array.isArray(
          currentShear
            ?.evidence
            ?.supportingAxes
        )
          ? currentShear
              .evidence
              .supportingAxes
          : [],

      maximumTotalVectorGradientMetersPerSecondPerNauticalMile:
        Number.isFinite(
          currentShear
            ?.evidence
            ?.maximumTotalVectorGradientMetersPerSecondPerNauticalMile
        )
          ? currentShear
              .evidence
              .maximumTotalVectorGradientMetersPerSecondPerNauticalMile
          : null,

      speedRangeKnots:
        Number.isFinite(
          currentSpatialPattern
            ?.evidence
            ?.speedRangeKnots
        )
          ? currentSpatialPattern
              .evidence
              .speedRangeKnots
          : null,

      maximumDirectionDifferenceDegrees:
        Number.isFinite(
          currentSpatialPattern
            ?.evidence
            ?.maximumDirectionDifferenceDegrees
        )
          ? currentSpatialPattern
              .evidence
              .maximumDirectionDifferenceDegrees
          : null
    },

    thresholds: {
      requiresTransitionPattern:
        true,

      requiresShearCandidate:
        true,

      requiresCompleteAxisCoverage:
        true,

      convergenceRequired:
        false
    },

    interpretation,

    limitations,

    upstreamContracts: [
      {
        engine:
          "current-gradient-analysis",

        version:
          currentGradient
            ?.contractVersion ??
          null
      },

      {
        engine:
          "current-shear-analysis",

        version:
          currentShear
            ?.contractVersion ??
          null
      },

      {
        engine:
          "current-spatial-pattern-analysis",

        version:
          currentSpatialPattern
            ?.contractVersion ??
          currentSpatialPattern
            ?.thresholdVersion ??
          null
      },

      {
        engine:
          "current-convergence-analysis",

        version:
          currentConvergence
            ?.contractVersion ??
          null
      }
    ],

    contractVersion:
      "pelora-current-edge-v1"
  };
}


function buildCurrentConvergenceAnalysis(
  vectorProjection
) {
  const projections =
    Array.isArray(
      vectorProjection
        ?.projections
    )
      ? vectorProjection
          .projections
      : [];

  const validProjections =
    projections.filter(
      projection =>
        projection
          ?.available ===
          true &&
        Number.isFinite(
          projection
            ?.signedRadialMetersPerSecond
        ) &&
        Number.isFinite(
          projection
            ?.inwardMetersPerSecond
        ) &&
        Number.isFinite(
          projection
            ?.outwardMetersPerSecond
        )
    );

  const sufficientCoverage =
    vectorProjection
      ?.sufficientCoverage ===
      true &&
    validProjections.length >=
      3;

  /*
   * These thresholds identify meaningful radial evidence
   * within the current spatial sampling field.
   *
   * They do not establish persistence, vertical transport,
   * prey concentration, habitat quality, or biological use.
   */
  const meaningfulRadialThresholdMetersPerSecond =
    0.05;

  const strongRadialThresholdMetersPerSecond =
    0.15;

  const meaningfulInwardProjections =
    validProjections.filter(
      projection =>
        projection
          .inwardMetersPerSecond >=
        meaningfulRadialThresholdMetersPerSecond
    );

  const strongInwardProjections =
    validProjections.filter(
      projection =>
        projection
          .inwardMetersPerSecond >=
        strongRadialThresholdMetersPerSecond
    );

  const meaningfulOutwardProjections =
    validProjections.filter(
      projection =>
        projection
          .outwardMetersPerSecond >=
        meaningfulRadialThresholdMetersPerSecond
    );

  const meaningfulInwardDirections =
    new Set(
      meaningfulInwardProjections.map(
        projection =>
          projection
            .sampleDirection
      )
    );

  const opposingInwardPairs =
    [];

  for (
    const sampleDirection of
    meaningfulInwardDirections
  ) {
    const opposingDirection =
      getOpposingCurrentSampleDirection(
        sampleDirection
      );

    if (
      opposingDirection &&
      meaningfulInwardDirections.has(
        opposingDirection
      )
    ) {
      const pair =
        [
          sampleDirection,
          opposingDirection
        ].sort().join("-");

      if (
        !opposingInwardPairs.includes(
          pair
        )
      ) {
        opposingInwardPairs.push(
          pair
        );
      }
    }
  }

  const inwardValues =
    meaningfulInwardProjections.map(
      projection =>
        projection
          .inwardMetersPerSecond
    );

  const meanMeaningfulInwardMetersPerSecond =
    inwardValues.length > 0
      ? inwardValues.reduce(
          (
            total,
            value
          ) =>
            total + value,
          0
        ) /
        inwardValues.length
      : null;

  const maximumInwardMetersPerSecond =
    validProjections.length > 0
      ? Math.max(
          ...validProjections.map(
            projection =>
              projection
                .inwardMetersPerSecond
          )
        )
      : null;

  const maximumOutwardMetersPerSecond =
    validProjections.length > 0
      ? Math.max(
          ...validProjections.map(
            projection =>
              projection
                .outwardMetersPerSecond
          )
        )
      : null;

  const distributedInwardSupport =
    meaningfulInwardProjections.length >=
      3 &&
    opposingInwardPairs.length >=
      1;

  const completeInwardSupport =
    validProjections.length >=
      4 &&
    meaningfulInwardProjections.length ===
      validProjections.length &&
    meaningfulOutwardProjections.length ===
      0;

  let available =
    sufficientCoverage;

  let convergenceType =
    "unavailable";

  let convergenceState =
    "insufficient-evidence";

  let convergenceStrength =
    "unknown";

  let interpretation =
    "Convergence cannot be evaluated from the available current-vector projections.";

  if (sufficientCoverage) {
    convergenceType =
      "no-convergence-candidate";

    convergenceState =
      "not-supported";

    convergenceStrength =
      "none";

    interpretation =
      "The available radial current projections do not provide spatially distributed support for a convergence candidate.";

    if (
      distributedInwardSupport
    ) {
      convergenceType =
        completeInwardSupport &&
        strongInwardProjections.length >=
          3 &&
        Number.isFinite(
          meanMeaningfulInwardMetersPerSecond
        ) &&
        meanMeaningfulInwardMetersPerSecond >=
          strongRadialThresholdMetersPerSecond
          ? "pronounced-convergence-candidate"
          : "convergence-candidate";

      convergenceState =
        "candidate";

      convergenceStrength =
        convergenceType ===
          "pronounced-convergence-candidate"
          ? "pronounced"
          : "measurable";

      interpretation =
        convergenceType ===
          "pronounced-convergence-candidate"
          ? "Current vectors from all available sides show strong inward radial movement toward the center of the spatial sample."
          : "Multiple current vectors, including at least one opposing pair, show meaningful inward radial movement toward the center of the spatial sample.";
    } else if (
      meaningfulInwardProjections.length >
      0
    ) {
      convergenceType =
        "localized-inward-flow";

      convergenceState =
        "incomplete-support";

      convergenceStrength =
        "localized";

      interpretation =
        "Inward radial movement is present in part of the sampling field, but it is not distributed broadly enough to support a convergence candidate.";
    }
  }

  const inheritedLimitations =
    Array.isArray(
      vectorProjection
        ?.limitations
    )
      ? vectorProjection
          .limitations
      : [];

  const limitations =
    [
      ...new Set([
        ...inheritedLimitations,

        "Convergence requires meaningful inward radial movement from at least three sampled sides and support from at least one opposing pair.",

        "A single inward current vector or inward movement confined to one side of the sample field is not classified as convergence.",

        "This analysis describes horizontal surface-current geometry within the sampled radius only.",

        "No divergence classification is produced by this engine.",

        "No vertical motion, water-mass accumulation, current edge, shear, rotation, eddy, persistence, prey concentration, habitat quality, or biological significance is inferred."
      ])
    ];

  return {
    available,

    analysisType:
      "current-convergence-analysis",

    convergenceType,

    convergenceState,

    convergenceStrength,

    evidence: {
      coverage:
        vectorProjection
          ?.coverage ??
        "unknown",

      sufficientCoverage,

      requestedProjectionCount:
        vectorProjection
          ?.requestedProjectionCount ??
        null,

      validProjectionCount:
        validProjections.length,

      meaningfulInwardCount:
        meaningfulInwardProjections.length,

      strongInwardCount:
        strongInwardProjections.length,

      meaningfulOutwardCount:
        meaningfulOutwardProjections.length,

      meaningfulInwardDirections:
        [
          ...meaningfulInwardDirections
        ],

      opposingInwardPairs,

      distributedInwardSupport,

      completeInwardSupport,

      meanMeaningfulInwardMetersPerSecond:
        Number.isFinite(
          meanMeaningfulInwardMetersPerSecond
        )
          ? Number(
              meanMeaningfulInwardMetersPerSecond
                .toFixed(4)
            )
          : null,

      maximumInwardMetersPerSecond:
        Number.isFinite(
          maximumInwardMetersPerSecond
        )
          ? Number(
              maximumInwardMetersPerSecond
                .toFixed(4)
            )
          : null,

      maximumOutwardMetersPerSecond:
        Number.isFinite(
          maximumOutwardMetersPerSecond
        )
          ? Number(
              maximumOutwardMetersPerSecond
                .toFixed(4)
            )
          : null
    },

    thresholds: {
      meaningfulRadialMetersPerSecond:
        meaningfulRadialThresholdMetersPerSecond,

      strongRadialMetersPerSecond:
        strongRadialThresholdMetersPerSecond,

      minimumMeaningfulInwardSamples:
        3,

      minimumOpposingInwardPairs:
        1
    },

    interpretation,

    limitations,

    upstreamContract: {
      engine:
        "current-vector-projection",

      version:
        vectorProjection
          ?.contractVersion ??
        null
    },

    contractVersion:
      "pelora-current-convergence-v1"
  };
}


function buildCurrentSpatialPatternAnalysis(
  spatialStructure,
  relationshipContext
) {
  const measurements =
    spatialStructure
      ?.measurements ??
    {};

  const relationshipAvailable =
    relationshipContext
      ?.available ===
    true;

  const sufficientCoverage =
    spatialStructure
      ?.sufficientCoverage ===
    true;

  const speedRangeKnots =
    Number.isFinite(
      measurements
        ?.speedRangeKnots
    )
      ? measurements
          .speedRangeKnots
      : null;

  const maximumDirectionDifferenceDegrees =
    Number.isFinite(
      measurements
        ?.maximumDirectionDifferenceDegrees
    )
      ? measurements
          .maximumDirectionDifferenceDegrees
      : null;

  const spatialVariation =
    measurements
      ?.spatialVariation ??
    "insufficient-spatial-current-data";

  const relationshipType =
    relationshipContext
      ?.relationshipType ??
    "unavailable";

  if (
    !relationshipAvailable ||
    !sufficientCoverage ||
    !Number.isFinite(
      speedRangeKnots
    ) ||
    !Number.isFinite(
      maximumDirectionDifferenceDegrees
    )
  ) {
    return {
      available:
        false,

      patternType:
        "unavailable",

      patternState:
        "insufficient-evidence",

      dominantVariation:
        "unknown",

      evidence: {
        relationshipAvailable,

        sufficientCoverage,

        relationshipType,

        spatialVariation,

        speedRangeKnots,

        maximumDirectionDifferenceDegrees,

        coverage:
          spatialStructure
            ?.coverage ??
          "unknown",

        validSampleCount:
          spatialStructure
            ?.validSampleCount ??
          null
      },

      interpretation:
        "A current spatial pattern cannot be classified from the available measurements.",

      limitations: [
        "Current Spatial Pattern Analysis requires sufficient spatial measurements and an available Current Relationship Context.",
        "No convergence, divergence, shear, edge, rotation, radial flow, eddy, persistence, habitat, or biological significance is inferred."
      ],

      thresholdVersion:
        "pelora-current-spatial-pattern-v1"
    };
  }

  /*
   * These thresholds describe which measured property contributes
   * most strongly to spatial variation.
   *
   * They do not establish the physical mechanism creating the
   * variation.
   */
  const meaningfulSpeedVariation =
    speedRangeKnots >=
    0.5;

  const strongSpeedVariation =
    speedRangeKnots >=
    1.0;

  const meaningfulDirectionVariation =
    maximumDirectionDifferenceDegrees >=
    30;

  const strongDirectionVariation =
    maximumDirectionDifferenceDegrees >=
    60;

  let patternType =
    "unresolved-variable-pattern";

  let patternState =
    "unresolved";

  let dominantVariation =
    "mixed-or-uncertain";

  let interpretation =
    "Spatial current variation is present, but its dominant measured pattern remains unresolved.";

  if (
    spatialVariation ===
      "uniform-current-field" ||
    (
      !meaningfulSpeedVariation &&
      !meaningfulDirectionVariation
    )
  ) {
    patternType =
      "uniform-flow-pattern";

    patternState =
      "observed";

    dominantVariation =
      "none";

    interpretation =
      "Current speed and direction remain broadly uniform across the surrounding sample field.";
  } else if (
    meaningfulSpeedVariation &&
    !meaningfulDirectionVariation
  ) {
    patternType =
      strongSpeedVariation
        ? "pronounced-speed-transition-pattern"
        : "speed-transition-pattern";

    patternState =
      "candidate";

    dominantVariation =
      "speed";

    interpretation =
      "The surrounding current field shows a measurable speed transition without a comparably strong directional transition.";
  } else if (
    !meaningfulSpeedVariation &&
    meaningfulDirectionVariation
  ) {
    patternType =
      strongDirectionVariation
        ? "pronounced-directional-transition-pattern"
        : "directional-transition-pattern";

    patternState =
      "candidate";

    dominantVariation =
      "direction";

    interpretation =
      "The surrounding current field shows a measurable directional transition without a comparably strong speed transition.";
  } else if (
    meaningfulSpeedVariation &&
    meaningfulDirectionVariation
  ) {
    patternType =
      (
        strongSpeedVariation ||
        strongDirectionVariation
      )
        ? "pronounced-mixed-transition-pattern"
        : "mixed-transition-pattern";

    patternState =
      "candidate";

    dominantVariation =
      "mixed";

    interpretation =
      "The surrounding current field shows combined spatial changes in current speed and direction.";
  }

  const inheritedLimitations =
    [
      ...(
        Array.isArray(
          spatialStructure
            ?.limitations
        )
          ? spatialStructure
              .limitations
          : []
      ),

      ...(
        Array.isArray(
          relationshipContext
            ?.limitations
        )
          ? relationshipContext
              .limitations
          : []
      )
    ];

  const limitations =
    [
      ...new Set([
        ...inheritedLimitations,

        "This result classifies the dominant measured form of spatial current variation only.",

        "The current sampling geometry has not yet been used to establish vector rotation, radial flow, convergence, divergence, or shear.",

        "A speed or directional transition is not proof of a current edge or eddy boundary.",

        "No persistence, prey concentration, fish presence, habitat quality, or species suitability is inferred."
      ])
    ];

  return {
    available:
      true,

    patternType,

    patternState,

    dominantVariation,

    evidence: {
      relationshipAvailable:
        true,

      relationshipType,

      relationshipState:
        relationshipContext
          ?.relationshipState ??
        null,

      organizationLevel:
        relationshipContext
          ?.organizationLevel ??
        null,

      sufficientCoverage,

      coverage:
        spatialStructure
          ?.coverage ??
        "unknown",

      requestedSampleCount:
        spatialStructure
          ?.requestedSampleCount ??
        null,

      validSampleCount:
        spatialStructure
          ?.validSampleCount ??
        null,

      spatialVariation,

      speedRangeKnots,

      maximumDirectionDifferenceDegrees,

      meaningfulSpeedVariation,

      strongSpeedVariation,

      meaningfulDirectionVariation,

      strongDirectionVariation
    },

    interpretation,

    limitations,

    upstreamContracts: [
      {
        engine:
          "current-spatial-structure",

        version:
          spatialStructure
            ?.contractVersion ??
          spatialStructure
            ?.thresholdVersion ??
          null
      },

      {
        engine:
          "current-relationship-context",

        version:
          relationshipContext
            ?.contractVersion ??
          null
      }
    ],

    thresholdVersion:
      "pelora-current-spatial-pattern-v1"
  };
}


async function getCurrentConditions(
  latitude,
  longitude
) {
  return getCachedCurrentConditionsPoint(
    latitude,
    longitude
  );
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
      ageHours < 0
    ) {
      reasons.push(
        "future-dated-sample-time"
      );
    } else if (
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

      ...(
        Number.isFinite(
          ageHours
        ) &&
        ageHours < 0
          ? [
              "future-dated-sample-time"
            ]
          : []
      ),

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
  latitude,
  longitude,
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

  const surfaceWaterCharacter =
    buildSurfaceWaterCharacterAnalysis({
      temperature,
      productivity,
      clarity,
      current
    });

  const waterMassAnalysis =
    buildWaterMassAnalysis({
      surfaceWaterCharacter,
      temperature,
      productivity,
      clarity,
      current
    });

  const mixingZoneAnalysis =
    buildMixingZoneAnalysis({
      waterMassAnalysis,
      surfaceWaterCharacter,
      temperature,
      current
    });

  const environmentalTransitionAnalysis =
    buildEnvironmentalTransitionAnalysis({
      surfaceWaterCharacter,
      waterMassAnalysis,
      mixingZoneAnalysis,
      temperature,
      current
    });

  const oceanFrontAnalysis =
    buildOceanFrontAnalysis({
      environmentalTransitionAnalysis,
      waterMassAnalysis,
      mixingZoneAnalysis,
      temperature,
      current
    });

  const oceanPhysicsExplainability =
    buildOceanPhysicsExplainabilitySummary({
      surfaceWaterCharacter,
      waterMassAnalysis,
      mixingZoneAnalysis,
      environmentalTransitionAnalysis,
      oceanFrontAnalysis
    });

  const oceanOrganization =
    buildOceanOrganizationAnalysis({
      current,
      temperature,
      surfaceWaterCharacter,
      waterMassAnalysis,
      mixingZoneAnalysis,
      environmentalTransitionAnalysis,
      oceanFrontAnalysis
    });

  const structure =
    buildStructureEvidence({
      latitude,
      longitude,
      current
    });

  /*
   * Open-water evidence currently receives only availability
   * and observation metadata from the connected evidence
   * groups.
   *
   * Spatial organization flags intentionally remain false.
   * Single-point observations cannot establish convergence,
   * shear, current edges, eddy boundaries, thermal boundaries,
   * productivity boundaries, or water-mass interaction.
   */
  const openWater =
    buildOpenWaterEvidence({
      current: {
        available:
          current?.available === true,

        observedAt:
          current?.values
            ?.observedAt ??
          current?.observedAt ??
          null,

        ageHours:
          current?.values
            ?.ageHours ??
          current?.ageHours ??
          null,

        freshness:
          current?.values
            ?.freshness ??
          current?.freshness ??
          "unknown"
      },

      thermal: {
        available:
          temperature?.available === true,

        observedAt:
          temperature?.values
            ?.observedAt ??
          temperature?.observedAt ??
          null,

        ageHours:
          temperature?.values
            ?.ageHours ??
          temperature?.ageHours ??
          null,

        freshness:
          temperature?.values
            ?.freshness ??
          temperature?.freshness ??
          "unknown"
      },

      productivity: {
        available:
          productivity?.available === true,

        observedAt:
          productivity?.values
            ?.observedAt ??
          productivity?.observedAt ??
          null,

        ageHours:
          productivity?.values
            ?.ageHours ??
          productivity?.ageHours ??
          null,

        freshness:
          productivity?.values
            ?.freshness ??
          productivity?.freshness ??
          "unknown"
      }
    });

  const persistence =
    buildPersistenceEvidence();

  const environmentalOpportunity =
    buildEnvironmentalOpportunityEvidence({
      structureEvidence:
        structure,

      openWaterEvidence:
        openWater,

      persistenceEvidence:
        persistence
    });

  /*
   * Keep the established evidence groups unchanged so this
   * contract integration cannot alter existing confidence,
   * summary, opportunity, or species-model behavior.
   */
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

  const environmentalOpportunityEvidence = {
    openWater,
    persistence,
    combined:
      environmentalOpportunity
  };

  const lineage =
    buildOceanEvidenceLineage({
      groups,

      environmentalOpportunityEvidence,

      limitations,

      dataQuality
    });

  const oceanPhysicsExplainabilityLineage =
    buildOceanPhysicsExplainabilityLineage({
      oceanEvidenceLineage:
        lineage,

      oceanPhysicsExplainability,

      surfaceWaterCharacter,

      waterMassAnalysis,

      mixingZoneAnalysis,

      environmentalTransitionAnalysis,

      oceanFrontAnalysis
    });

  const oceanPhysicsExplainabilityWithLineage = {
    ...oceanPhysicsExplainability,

    lineage:
      oceanPhysicsExplainabilityLineage
  };

  return {
    summary,

    groups,

    /*
     * Surface Water Character remains separate from established
     * evidence groups so it cannot alter confidence, summaries,
     * opportunity scoring, or species-model behavior.
     */
    surfaceWaterCharacter,

    /*
     * Water Mass Analysis remains a readiness and boundary-context
     * contract. It cannot alter evidence-group confidence, summaries,
     * opportunity scoring, or species-model behavior.
     */
    waterMassAnalysis,

    /*
     * Mixing Zone Analysis remains a readiness and interaction-
     * context contract. It cannot alter established evidence
     * confidence, summaries, scoring, or species-model behavior.
     */
    mixingZoneAnalysis,

    /*
     * Environmental Transition Analysis remains a scientific
     * synthesis contract. It cannot alter established evidence
     * confidence, summaries, opportunity scoring, species models,
     * or captain-facing language.
     */
    environmentalTransitionAnalysis,

    /*
     * Ocean Front Analysis remains a scientific readiness and
     * candidate-context contract. It cannot alter established
     * evidence confidence, summaries, opportunity scoring,
     * species models, or captain-facing language.
     */
    oceanFrontAnalysis,

    /*
     * Ocean Physics Explainability provides a normalized downstream
     * integration contract without changing any authoritative engine.
     */
    oceanPhysicsExplainability:
      oceanPhysicsExplainabilityWithLineage,

    /*
     * Ocean Organization synthesizes the governed physics layer.
     * It does not alter confidence, opportunity scoring, species
     * models, or captain-facing language.
     */
    oceanOrganization,

    /*
     * Environmental opportunity pathways remain separate from
     * the established evidence groups until their contribution
     * to confidence and scoring is scientifically governed.
     */
    environmentalOpportunityEvidence,

    confidence,

    limitations,

    /*
     * Lineage documents how this evidence contract was assembled.
     * It cannot alter any established evidence or model behavior.
     */
    lineage,

    methodVersion:
      "pelora-ocean-evidence-v2.0"
  };
}




/**
 * Build the governed lineage record for Ocean Evidence.
 *
 * This function documents the observation-to-evidence path.
 * It does not alter evidence, confidence, scoring, summaries,
 * classifications, or biological interpretation.
 */
export function buildOceanEvidenceLineage({
  groups,
  environmentalOpportunityEvidence,
  limitations,
  dataQuality
} = {}) {
  const observationAvailability = {
    temperature:
      groups?.temperature?.available ===
      true,

    currents:
      groups?.current?.available ===
      true,

    chlorophyll:
      (
        groups?.productivity
          ?.available === true ||
        groups?.clarity
          ?.available === true
      )
  };

  const observationsUsed =
    Object.entries(
      observationAvailability
    )
      .filter(
        ([, available]) =>
          available === true
      )
      .map(
        ([observation]) =>
          observation
      );

  const observationsUnavailable =
    Object.entries(
      observationAvailability
    )
      .filter(
        ([, available]) =>
          available !== true
      )
      .map(
        ([observation]) =>
          observation
      );

  /*
   * Evidence contracts are recorded as produced even when they
   * conservatively report unavailable or insufficient evidence.
   *
   * This distinguishes:
   *
   * - an evidence contract that was evaluated and returned
   * - an observation that was unavailable
   */
  const evidenceProduced = [
    "temperature-evidence",
    "current-evidence",
    "productivity-evidence",
    "clarity-evidence",
    "structure-evidence",
    "open-water-evidence",
    "persistence-evidence",
    "environmental-opportunity-evidence"
  ];

  const inheritedWarnings = [];

  const dataQualityClassification =
    dataQuality?.overall
      ?.classification ??
    dataQuality?.classification ??
    null;

  if (
    typeof dataQualityClassification ===
      "string" &&
    ![
      "complete",
      "good",
      "high",
      "available"
    ].includes(
      dataQualityClassification
        .toLowerCase()
    )
  ) {
    inheritedWarnings.push(
      `data-quality:${dataQualityClassification}`
    );
  }

  if (
    environmentalOpportunityEvidence
      ?.openWater
      ?.available !== true
  ) {
    inheritedWarnings.push(
      "open-water-evidence-unavailable"
    );
  }

  if (
    environmentalOpportunityEvidence
      ?.persistence
      ?.available !== true
  ) {
    inheritedWarnings.push(
      "persistence-evidence-unavailable"
    );
  }

  const dataQualityMethodVersion =
    (
      typeof dataQuality
        ?.methodVersion ===
        "string" &&
      dataQuality
        .methodVersion
        .trim()
        .length > 0
    )
      ? dataQuality.methodVersion
      : "pelora-data-quality-contract-unversioned";

  return {
    upstream: [
      {
        engine:
          "data-assessment",

        methodVersion:
          dataQualityMethodVersion
      }
    ],

    observationsUsed,

    observationsUnavailable,

    evidenceProduced,

    inheritedLimitations: [
      ...new Set(
        Array.isArray(
          limitations
        )
          ? limitations.filter(
              limitation =>
                typeof limitation ===
                  "string" &&
                limitation
                  .trim()
                  .length > 0
            )
          : []
      )
    ],

    inheritedWarnings: [
      ...new Set(
        inheritedWarnings
      )
    ],

    producedBy:
      "ocean-evidence",

    components: {
      groupsProduced:
        Object.keys(
          groups ?? {}
        ),

      environmentalOpportunityContractsProduced:
        Object.keys(
          environmentalOpportunityEvidence ??
          {}
        )
    },

    methodVersion:
      "pelora-ocean-evidence-lineage-v1.0"
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


export function buildTemperatureTransitionMapFeature({
  latitude = null,
  longitude = null,
  temperatureEvidence = null,
  spatialStructure = null
} = {}) {
  const validCenter =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const temperatureAvailable =
    temperatureEvidence
      ?.available ===
    true;

  const spatialClassification =
    temperatureEvidence
      ?.values
      ?.spatialClassification ??
    null;

  const transitionSupported =
    [
      "weak-temperature-transition",
      "moderate-temperature-transition",
      "strong-temperature-break-candidate"
    ].includes(
      spatialClassification
    );

  const sufficientCoverage =
    temperatureEvidence
      ?.values
      ?.coverage ===
    "sufficient";

  const samples =
    Array.isArray(
      spatialStructure?.samples
    )
      ? spatialStructure.samples
          .filter(
            sample =>
              Number.isFinite(
                sample?.requestedLatitude
              ) &&
              Number.isFinite(
                sample?.requestedLongitude
              )
          )
          .map(
            sample => ({
              direction:
                sample.direction ??
                null,

              latitude:
                sample.requestedLatitude,

              longitude:
                sample.requestedLongitude,

              resolvedLatitude:
                Number.isFinite(
                  sample?.resolvedLatitude
                )
                  ? sample.resolvedLatitude
                  : null,

              resolvedLongitude:
                Number.isFinite(
                  sample?.resolvedLongitude
                )
                  ? sample.resolvedLongitude
                  : null,

              temperatureFahrenheit:
                Number.isFinite(
                  sample
                    ?.temperatureFahrenheit
                )
                  ? sample
                      .temperatureFahrenheit
                  : null,

              observedAt:
                sample.observedAt ??
                null
            })
          )
      : [];

  const available =
    validCenter &&
    temperatureAvailable &&
    transitionSupported &&
    sufficientCoverage &&
    samples.length >= 3;

  const limitations = [
    "local-sampling-evidence-footprint-only",
    "does-not-resolve-exact-temperature-boundary",
    "does-not-confirm-ocean-front",
    "does-not-confirm-persistence",
    "does-not-establish-biological-significance",
    "map-visualization-must-not-exceed-evidence-certainty"
  ];

  if (!validCenter) {
    limitations.push(
      "valid-center-coordinate-unavailable"
    );
  }

  if (!transitionSupported) {
    limitations.push(
      "temperature-transition-not-supported"
    );
  }

  if (!sufficientCoverage) {
    limitations.push(
      "sufficient-spatial-temperature-coverage-unavailable"
    );
  }

  if (samples.length < 3) {
    limitations.push(
      "insufficient-geographic-sample-footprint"
    );
  }

  return {
    available,

    featureType:
      "temperature-transition",

    classification:
      available
        ? "local-temperature-transition-evidence-footprint"
        : "unavailable",

    center:
      validCenter
        ? {
            latitude,
            longitude
          }
        : null,

    samplingFootprint: {
      radiusNauticalMiles:
        Number.isFinite(
          temperatureEvidence
            ?.values
            ?.sampleRadiusNauticalMiles
        )
          ? temperatureEvidence
              .values
              .sampleRadiusNauticalMiles
          : null,

      sampleCount:
        samples.length,

      samples
    },

    orientation:
      temperatureEvidence
        ?.orientation ??
      null,

    confidence:
      temperatureEvidence
        ?.confidence ??
      null,

    geometry:
      null,

    geometryStatus:
      available
        ? "evidence-footprint-only"
        : "unavailable",

    limitations: [
      ...new Set(
        limitations
      )
    ],

    interpretation:
      "governed-map-safe-temperature-transition-feature",

    contractVersion:
      "pelora-temperature-transition-map-feature-v1"
  };
}


/**
 * ------------------------------------------------------------
 * Current Spatial Analysis Contract v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Describe whether Pelora possesses sufficient spatial current
 * observations to evaluate relationships between neighboring
 * current vectors.
 *
 * This contract intentionally performs no scientific analysis.
 * It only describes the availability and quality of spatial
 * current observations.
 *
 * Future engines may evaluate:
 *
 * - current convergence
 * - current divergence
 * - current shear
 * - current edges
 * - eddy boundaries
 * - persistent current organization
 *
 * Until those engines exist, every detection remains unavailable.
 */
function buildCurrentSpatialAnalysis(
  current
) {

  const hasVector =
    Number.isFinite(
      current?.speedKnots
    ) &&
    Number.isFinite(
      current?.directionDegrees
    );

  if (!hasVector) {
    return {
      available: false,

      observationType:
        "unavailable",

      coverage:
        "unavailable",

      sampleCount: 0,

      vectors: [],

      convergence: null,

      shear: null,

      edge: null,

      eddyBoundary: null,

      confidence: null
    };
  }

  return {
    available: false,

    observationType:
      "single-point",

    coverage:
      "insufficient",

    sampleCount: 1,

    vectors: [],

    convergence: null,

    shear: null,

    edge: null,

    eddyBoundary: null,

    confidence: null
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

   const spatialAnalysis =
    currents?.derived
      ?.spatialAnalysis ??
    buildCurrentSpatialAnalysis(
      currents
    );

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

      spatialAnalysis,

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

  const formattedSpeedKnots =
    Number.isFinite(
      speedKnots
    )
      ? Number(
          speedKnots
            .toFixed(1)
        )
      : null;

  const directionDescription =
    compassDirection
      ? ` toward ${compassDirection}`
      : "";

  let headline =
    formattedSpeedKnots !== null
      ? `Current is moving${directionDescription} at ${formattedSpeedKnots} knots.`
      : "A local current observation is available.";

  let detail =
    "This direct observation describes current speed and direction at the selected point.";

  const convergence =
    spatialAnalysis
      ?.convergence ??
    null;

  if (
    convergence
      ?.available ===
      true &&
    convergence
      ?.convergenceState ===
      "candidate"
  ) {
    classification =
      convergence
        ?.convergenceType ??
      classification;

    if (
      convergence
        ?.convergenceType ===
        "pronounced-convergence-candidate"
    ) {
      detail =
        "Surrounding current vectors show pronounced inward flow from opposing sides, supporting a pronounced convergence candidate. This describes horizontal surface-current geometry only and does not confirm persistence, prey concentration, habitat quality, or fish presence.";
    } else {
      detail =
        "Surrounding current vectors show meaningful inward flow from opposing sides, supporting a measurable convergence candidate. This describes horizontal surface-current geometry only and does not confirm persistence, prey concentration, habitat quality, or fish presence.";
    }
  } else if (
    convergence
      ?.convergenceState ===
      "incomplete-support"
  ) {
    detail =
      "Localized inward flow is present in part of the surrounding current field, but the evidence is not distributed broadly enough to support a convergence candidate.";
  } else if (
    spatialAnalysis
      ?.available ===
      true
  ) {
    detail =
      "The surrounding current field was evaluated, but distributed inward flow was not sufficient to support a convergence candidate.";
  } else {
    detail =
      "Spatial current structure could not be established from the available surrounding observations.";
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

    spatialAnalysis,

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

  const sourceProvider =
    chlorophyll?.source
      ?.provider ??
    null;

  const observationType =
    chlorophyll?.source
      ?.observationType ??
    "direct-satellite";

  const available =
    concentrationMgM3 !== null;

  const drivers = [];

  const limitations = [
    "surface-productivity-only",
    observationType ===
      "gap-filled-reconstruction"
      ? "gap-filled-satellite-derived-reconstruction"
      : "satellite-observation",
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
        sourceProvider,
        observationType,
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
      sourceProvider,
      observationType,
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


export function buildSurfaceWaterCharacterAnalysis({
  temperature = null,
  productivity = null,
  clarity = null,
  current = null
} = {}) {
  const temperatureAvailable =
    temperature
      ?.available ===
    true;

  const productivityAvailable =
    productivity
      ?.available ===
    true;

  const clarityAvailable =
    clarity
      ?.available ===
    true;

  const currentEdge =
    current
      ?.spatialAnalysis
      ?.edge ??
    null;

  const currentEdgeAvailable =
    currentEdge
      ?.available ===
    true;

  const currentEdgeDetected =
    currentEdge
      ?.currentEdgeDetected ===
    true &&
    currentEdge
      ?.edgeState ===
    "candidate";

  const temperatureClassification =
    temperature
      ?.classification ??
    "unavailable";

  const spatialTemperatureClassification =
    temperature
      ?.values
      ?.spatialClassification ??
    null;

  const thermalCoverage =
    temperature
      ?.values
      ?.coverage ??
    "unavailable";

  const thermalRangeFahrenheit =
    Number.isFinite(
      temperature
        ?.values
        ?.spatialRangeFahrenheit
    )
      ? temperature
          .values
          .spatialRangeFahrenheit
      : null;

  const orientation =
    temperature
      ?.orientation ??
    null;

  const directionalThermalTransition =
    orientation
      ?.classification ===
    "directional-temperature-transition";

  const localTemperatureFahrenheit =
    Number.isFinite(
      temperature
        ?.values
        ?.temperatureFahrenheit
    )
      ? temperature
          .values
          .temperatureFahrenheit
      : null;

  const temperatureBand =
    temperature
      ?.values
      ?.temperatureBand ??
    null;

  const productivityClassification =
    productivity
      ?.classification ??
    productivity
      ?.values
      ?.productivityClassification ??
    null;

  const clarityClassification =
    clarity
      ?.classification ??
    null;

  const chlorophyllConcentrationMgM3 =
    Number.isFinite(
      productivity
        ?.values
        ?.concentrationMgM3
    )
      ? productivity
          .values
          .concentrationMgM3
      : null;

  const productivityFreshness =
    productivity
      ?.values
      ?.freshness ??
    "unknown";

  const anyLocalObservationAvailable =
    temperatureAvailable ||
    productivityAvailable ||
    clarityAvailable;

  const sufficientThermalCoverage =
    thermalCoverage ===
    "sufficient";

  const weakThermalTransition =
    temperatureClassification ===
    "weak-temperature-structure";

  const moderateThermalTransition =
    temperatureClassification ===
    "moderate-temperature-structure";

  const strongThermalTransition =
    temperatureClassification ===
    "strong-temperature-break-candidate";

  const meaningfulThermalTransition =
    moderateThermalTransition ||
    strongThermalTransition;

  const uniformThermalField =
    temperatureClassification ===
    "uniform-water" ||
    spatialTemperatureClassification ===
    "uniform-water";

  let available =
    anyLocalObservationAvailable;

  let classification =
    "unavailable";

  let state =
    "insufficient-evidence";

  let boundaryContext =
    "unavailable";

  let headline =
    "Surface-water character cannot be described from the available observations.";

  let detail =
    "Pelora does not currently have sufficient temperature, chlorophyll, or inferred clarity evidence for this location.";

  if (available) {
    classification =
      "single-observation-surface-water-character";

    state =
      "observed";

    boundaryContext =
      "not-established";

    headline =
      "Local surface-water character is available.";

    detail =
      "Available temperature and surface chlorophyll observations describe conditions at the selected location, but they do not establish distinct adjacent water masses.";

    if (
      uniformThermalField &&
      sufficientThermalCoverage
    ) {
      classification =
        "uniform-thermal-surface-water-character";

      state =
        "observed";

      headline =
        "Local surface water lies within a broadly uniform thermal field.";

      detail =
        "Nearby temperature samples remain broadly uniform. Chlorophyll and inferred clarity describe the selected point only.";
    } else if (
      weakThermalTransition &&
      sufficientThermalCoverage
    ) {
      classification =
        "surface-water-near-weak-thermal-transition";

      state =
        "candidate-context";

      boundaryContext =
        "weak-thermal-transition";

      headline =
        "Local surface water lies near a weak thermal transition.";

      detail =
        "Nearby samples show limited temperature change. The local chlorophyll observation describes the selected point and does not establish conditions on both sides of the transition.";
    } else if (
      moderateThermalTransition &&
      sufficientThermalCoverage
    ) {
      classification =
        currentEdgeDetected
          ? "combined-thermal-current-boundary-context"
          : "surface-water-near-moderate-thermal-transition";

      state =
        "candidate-context";

      boundaryContext =
        currentEdgeDetected
          ? "thermal-and-current-boundary"
          : "moderate-thermal-transition";

      headline =
        currentEdgeDetected
          ? "Thermal and current evidence describe a combined boundary context."
          : "Local surface water lies near a moderate thermal transition.";

      detail =
        currentEdgeDetected
          ? "A meaningful temperature transition and a current-edge candidate occur within the sampled area. This supports a combined surface-boundary context but does not identify distinct water masses."
          : "Nearby samples show meaningful temperature variation. Chlorophyll and clarity remain local observations rather than spatial measurements across the boundary.";
    } else if (
      strongThermalTransition &&
      sufficientThermalCoverage
    ) {
      classification =
        currentEdgeDetected
          ? "combined-thermal-current-boundary-context"
          : "surface-water-near-strong-thermal-break-candidate";

      state =
        "candidate-context";

      boundaryContext =
        currentEdgeDetected
          ? "pronounced-thermal-and-current-boundary"
          : "strong-thermal-break-candidate";

      headline =
        currentEdgeDetected
          ? "Pronounced thermal and current evidence describe a combined boundary context."
          : "Local surface water lies near a strong thermal-break candidate.";

      detail =
        currentEdgeDetected
          ? "A pronounced temperature transition and a current-edge candidate occur within the sampled area. Adjacent water-mass identity and persistence remain unverified."
          : "Nearby samples show a pronounced temperature range. This remains a local surface-pattern candidate rather than a confirmed front or water-mass boundary.";
    } else if (
      currentEdgeDetected
    ) {
      classification =
        "surface-water-character-near-current-edge";

      state =
        "candidate-context";

      boundaryContext =
        "current-edge";

      headline =
        "Local surface-water character lies near a current-edge candidate.";

      detail =
        "Current evidence supports a hydrodynamic boundary candidate, while temperature and chlorophyll describe the selected location. Distinct water characteristics on both sides have not been established.";
    }
  }

  const inheritedLimitations = [
    ...(
      Array.isArray(
        temperature
          ?.limitations
      )
        ? temperature
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        productivity
          ?.limitations
      )
        ? productivity
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        clarity
          ?.limitations
      )
        ? clarity
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        currentEdge
          ?.limitations
      )
        ? currentEdge
            .limitations
        : []
    )
  ];

  const limitations = [
    ...new Set([
      ...inheritedLimitations,

      "Surface Water Character Analysis describes local surface observations and available thermal-boundary context only.",

      "Chlorophyll and inferred clarity currently describe the selected point and do not establish spatial conditions on both sides of a boundary.",

      "Salinity, density, dissolved oxygen, subsurface temperature, vertical profiles, and full water-column structure are unavailable.",

      "No named or regional oceanographic water mass is assigned.",

      "No distinct adjacent water masses, mixing zone, current front, ocean front, origin, persistence, prey concentration, habitat quality, fish presence, or biological significance is confirmed."
    ])
  ];

  return {
    available,

    analysisType:
      "surface-water-character-analysis",

    classification,

    state,

    boundaryContext,

    localCharacter: {
      temperatureAvailable,

      localTemperatureFahrenheit,

      temperatureBand,

      productivityAvailable,

      chlorophyllConcentrationMgM3,

      productivityClassification,

      productivityFreshness,

      clarityAvailable,

      clarityClassification
    },

    spatialContext: {
      thermalCoverage,

      sufficientThermalCoverage,

      spatialTemperatureClassification,

      thermalRangeFahrenheit,

      weakThermalTransition,

      moderateThermalTransition,

      strongThermalTransition,

      meaningfulThermalTransition,

      directionalThermalTransition,

      orientation: {
        classification:
          orientation
            ?.classification ??
          null,

        dominantAxis:
          orientation
            ?.dominantAxis ??
          null,

        warmSide:
          orientation
            ?.warmSide ??
          null,

        coolSide:
          orientation
            ?.coolSide ??
          null,

        dominantDifferenceFahrenheit:
          Number.isFinite(
            orientation
              ?.dominantDifferenceFahrenheit
          )
            ? orientation
                .dominantDifferenceFahrenheit
            : null
      },

      currentEdgeAvailable,

      currentEdgeDetected,

      currentEdgeType:
        currentEdge
          ?.edgeType ??
        null,

      currentEdgeStrength:
        currentEdge
          ?.edgeStrength ??
        null
    },

    headline,

    detail,

    limitations,

    upstreamContracts: [
      {
        engine:
          "temperature-evidence",

        version:
          temperature
            ?.interpretation ??
          null
      },

      {
        engine:
          "surface-productivity-evidence",

        version:
          productivity
            ?.interpretation ??
          null
      },

      {
        engine:
          "surface-water-clarity-evidence",

        version:
          clarity
            ?.interpretation ??
          null
      },

      {
        engine:
          "current-edge-analysis",

        version:
          currentEdge
            ?.contractVersion ??
          null
      }
    ],

    contractVersion:
      "pelora-surface-water-character-v1"
  };
}


export function buildWaterMassAnalysis({
  surfaceWaterCharacter = null,
  temperature = null,
  productivity = null,
  clarity = null,
  current = null
} = {}) {
  const surfaceCharacterAvailable =
    surfaceWaterCharacter
      ?.available ===
    true;

  const temperatureAvailable =
    temperature
      ?.available ===
    true;

  const productivityAvailable =
    productivity
      ?.available ===
    true;

  const clarityAvailable =
    clarity
      ?.available ===
    true;

  const temperatureCoverage =
    temperature
      ?.values
      ?.coverage ??
    "unavailable";

  const temperatureClassification =
    temperature
      ?.classification ??
    "unavailable";

  const spatialTemperatureClassification =
    temperature
      ?.values
      ?.spatialClassification ??
    null;

  const sufficientTemperatureCoverage =
    temperatureCoverage ===
    "sufficient";

  const uniformThermalField =
    sufficientTemperatureCoverage &&
    (
      temperatureClassification ===
        "uniform-water" ||
      spatialTemperatureClassification ===
        "uniform-water"
    );

  const thermalTransitionClassifications =
    new Set([
      "weak-temperature-structure",
      "moderate-temperature-structure",
      "strong-temperature-break-candidate"
    ]);

  const spatialThermalContrast =
    sufficientTemperatureCoverage &&
    thermalTransitionClassifications.has(
      temperatureClassification
    );

  const meaningfulSpatialThermalContrast =
    sufficientTemperatureCoverage &&
    (
      temperatureClassification ===
        "moderate-temperature-structure" ||
      temperatureClassification ===
        "strong-temperature-break-candidate"
    );

  const directionalThermalContrast =
    temperature
      ?.orientation
      ?.classification ===
    "directional-temperature-transition";

  const currentEdge =
    current
      ?.spatialAnalysis
      ?.edge ??
    null;

  const currentEdgeAvailable =
    currentEdge
      ?.available ===
    true;

  const currentEdgeDetected =
    currentEdge
      ?.currentEdgeDetected ===
    true &&
    currentEdge
      ?.edgeState ===
    "candidate";

  /*
   * Current v1 data availability:
   *
   * - Temperature has spatial sampling.
   * - Current has spatial boundary analysis.
   * - Chlorophyll and clarity describe the selected point only.
   * - Salinity and water-column profiles are unavailable.
   *
   * Therefore, Pelora currently has at most one direct spatial
   * water-character variable: temperature.
   */
  const spatialCharacterVariables = [
    spatialThermalContrast
      ? "temperature"
      : null
  ].filter(Boolean);

  const localCharacterVariables = [
    temperatureAvailable
      ? "temperature"
      : null,

    productivityAvailable
      ? "chlorophyll"
      : null,

    clarityAvailable
      ? "inferred-clarity"
      : null
  ].filter(Boolean);

  const independentSpatialCharacterVariableCount =
    spatialCharacterVariables.length;

  const localCharacterVariableCount =
    localCharacterVariables.length;

  const salinityAvailable =
    false;

  const spatialChlorophyllAvailable =
    false;

  const verticalProfileAvailable =
    false;

  const densityAvailable =
    false;

  const persistenceAvailable =
    false;

  const distinctAdjacentWaterMassesEstablished =
    false;

  const waterMassDistinctionReady =
    independentSpatialCharacterVariableCount >=
      2 &&
    salinityAvailable ===
      true;

  let available =
    surfaceCharacterAvailable;

  let classification =
    "unavailable";

  let readinessState =
    "insufficient-evidence";

  let headline =
    "Water-mass evidence is unavailable.";

  let detail =
    "Pelora does not currently have enough surface-water evidence to evaluate whether adjacent waters are distinguishable.";

  if (available) {
    classification =
      "local-surface-character-only";

    readinessState =
      "not-ready";

    headline =
      "Local surface-water character is available.";

    detail =
      "Temperature, chlorophyll, and inferred clarity may describe the selected location, but adjacent water masses cannot be distinguished from local observations alone.";

    if (
      uniformThermalField
    ) {
      classification =
        "uniform-surface-water-context";

      readinessState =
        "not-ready";

      headline =
        "The sampled surface water is thermally uniform.";

      detail =
        "Nearby temperatures remain broadly uniform. Local chlorophyll and clarity observations do not establish separate adjacent water masses.";
    } else if (
      spatialThermalContrast &&
      !currentEdgeDetected
    ) {
      classification =
        "single-variable-spatial-water-contrast";

      readinessState =
        "partially-ready";

      headline =
        "A temperature-based surface-water contrast is present.";

      detail =
        "Spatial temperature evidence indicates changing surface-water character, but temperature is currently the only direct spatial water-character variable. Distinct adjacent water masses are not established.";
    } else if (
      currentEdgeDetected &&
      !spatialThermalContrast
    ) {
      classification =
        "hydrodynamic-boundary-with-local-water-character";

      readinessState =
        "partially-ready";

      headline =
        "A current boundary is present beside locally observed water character.";

      detail =
        "Current evidence supports a hydrodynamic boundary candidate, but spatial temperature, chlorophyll, or salinity evidence does not yet distinguish the water on both sides.";
    } else if (
      spatialThermalContrast &&
      currentEdgeDetected
    ) {
      classification =
        "combined-boundary-context-without-water-mass-distinction";

      readinessState =
        "partially-ready";

      headline =
        "Thermal and current evidence describe a combined surface boundary.";

      detail =
        meaningfulSpatialThermalContrast
          ? "A meaningful temperature contrast and current-edge candidate occur within the sampled area. This supports a combined boundary context, but a second independent spatial water-character variable is still required to distinguish adjacent water masses."
          : "A limited temperature contrast and current-edge candidate occur within the sampled area. Distinct adjacent water masses remain unverified.";
    }
  }

  const missingRequirements = [
    !spatialChlorophyllAvailable
      ? "spatial-chlorophyll-structure"
      : null,

    !salinityAvailable
      ? "spatial-salinity-structure"
      : null,

    !densityAvailable
      ? "density-structure"
      : null,

    !verticalProfileAvailable
      ? "vertical-water-column-profiles"
      : null,

    !persistenceAvailable
      ? "temporal-persistence"
      : null,

    independentSpatialCharacterVariableCount <
      2
      ? "second-independent-spatial-water-character-variable"
      : null
  ].filter(Boolean);

  const inheritedLimitations = [
    ...(
      Array.isArray(
        surfaceWaterCharacter
          ?.limitations
      )
        ? surfaceWaterCharacter
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        temperature
          ?.limitations
      )
        ? temperature
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        productivity
          ?.limitations
      )
        ? productivity
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        clarity
          ?.limitations
      )
        ? clarity
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        currentEdge
          ?.limitations
      )
        ? currentEdge
            .limitations
        : []
    )
  ];

  const limitations = [
    ...new Set([
      ...inheritedLimitations,

      "Water Mass Analysis v1 evaluates evidence readiness and surface-boundary context only.",

      "Temperature is currently the only direct spatial water-character variable.",

      "Chlorophyll and inferred clarity currently describe the selected point rather than both sides of a boundary.",

      "Salinity, density, dissolved oxygen, subsurface temperature, vertical profiles, and full water-column structure are unavailable.",

      "Current boundaries describe flow organization and do not independently identify water masses.",

      "No named water mass, water-mass origin, mixing zone, current front, ocean front, persistence, habitat quality, prey concentration, fish presence, or biological significance is inferred."
    ])
  ];

  return {
    available,

    analysisType:
      "water-mass-analysis",

    classification,

    readinessState,

    waterMassDistinctionReady,

    distinctAdjacentWaterMassesEstablished,

    evidence: {
      surfaceCharacterAvailable,

      localCharacterVariables,

      localCharacterVariableCount,

      spatialCharacterVariables,

      independentSpatialCharacterVariableCount,

      temperatureAvailable,

      temperatureCoverage,

      sufficientTemperatureCoverage,

      temperatureClassification,

      spatialTemperatureClassification,

      uniformThermalField,

      spatialThermalContrast,

      meaningfulSpatialThermalContrast,

      directionalThermalContrast,

      productivityAvailable,

      clarityAvailable,

      currentEdgeAvailable,

      currentEdgeDetected,

      currentEdgeType:
        currentEdge
          ?.edgeType ??
        null,

      currentEdgeStrength:
        currentEdge
          ?.edgeStrength ??
        null,

      spatialChlorophyllAvailable,

      salinityAvailable,

      densityAvailable,

      verticalProfileAvailable,

      persistenceAvailable
    },

    missingRequirements,

    headline,

    detail,

    limitations,

    upstreamContracts: [
      {
        engine:
          "surface-water-character-analysis",

        version:
          surfaceWaterCharacter
            ?.contractVersion ??
          null
      },

      {
        engine:
          "temperature-evidence",

        version:
          temperature
            ?.interpretation ??
          null
      },

      {
        engine:
          "surface-productivity-evidence",

        version:
          productivity
            ?.interpretation ??
          null
      },

      {
        engine:
          "surface-water-clarity-evidence",

        version:
          clarity
            ?.interpretation ??
          null
      },

      {
        engine:
          "current-edge-analysis",

        version:
          currentEdge
            ?.contractVersion ??
          null
      }
    ],

    contractVersion:
      "pelora-water-mass-analysis-v1"
  };
}


export function buildMixingZoneAnalysis({
  waterMassAnalysis = null,
  surfaceWaterCharacter = null,
  temperature = null,
  current = null
} = {}) {
  const waterMassAnalysisAvailable =
    waterMassAnalysis
      ?.available ===
    true;

  const surfaceCharacterAvailable =
    surfaceWaterCharacter
      ?.available ===
    true;

  const distinctAdjacentWaterMassesEstablished =
    waterMassAnalysis
      ?.distinctAdjacentWaterMassesEstablished ===
    true;

  const waterMassDistinctionReady =
    waterMassAnalysis
      ?.waterMassDistinctionReady ===
    true;

  const spatialThermalContrast =
    waterMassAnalysis
      ?.evidence
      ?.spatialThermalContrast ===
    true;

  const meaningfulSpatialThermalContrast =
    waterMassAnalysis
      ?.evidence
      ?.meaningfulSpatialThermalContrast ===
    true;

  const directionalThermalContrast =
    waterMassAnalysis
      ?.evidence
      ?.directionalThermalContrast ===
    true;

  const currentSpatialAnalysis =
    current
      ?.spatialAnalysis ??
    null;

  const currentEdge =
    currentSpatialAnalysis
      ?.edge ??
    null;

  const currentConvergence =
    currentSpatialAnalysis
      ?.convergence ??
    null;

  const currentShear =
    currentSpatialAnalysis
      ?.shear ??
    null;

  const currentEdgeDetected =
    currentEdge
      ?.currentEdgeDetected ===
    true &&
    currentEdge
      ?.edgeState ===
    "candidate";

  const convergenceDetected =
    currentConvergence
      ?.currentConvergenceDetected ===
    true &&
    currentConvergence
      ?.convergenceState ===
    "candidate";

  const shearDetected =
    currentShear
      ?.currentShearDetected ===
    true &&
    currentShear
      ?.shearState ===
    "candidate";

  const hydrodynamicInteractionSignalCount =
    [
      currentEdgeDetected,
      convergenceDetected,
      shearDetected
    ].filter(Boolean).length;

  const hydrodynamicInteractionSupported =
    hydrodynamicInteractionSignalCount >
    0;

  const combinedBoundaryContext =
    spatialThermalContrast &&
    currentEdgeDetected;

  /*
   * A verified mixing-zone interpretation requires:
   *
   * - distinct adjacent water masses,
   * - spatial evidence describing their characteristics,
   * - hydrodynamic evidence supporting interaction,
   * - and sufficient persistence or repeated observations.
   *
   * Current v1 evidence does not satisfy those requirements.
   */
  const persistenceAvailable =
    false;

  const verticalStructureAvailable =
    false;

  const spatialSalinityAvailable =
    false;

  const spatialChlorophyllAvailable =
    false;

  const mixingZoneReady =
    distinctAdjacentWaterMassesEstablished &&
    waterMassDistinctionReady &&
    hydrodynamicInteractionSupported &&
    persistenceAvailable;

  const mixingZoneDetected =
    false;

  let available =
    waterMassAnalysisAvailable ||
    surfaceCharacterAvailable;

  let classification =
    "unavailable";

  let readinessState =
    "insufficient-evidence";

  let interactionContext =
    "unavailable";

  let headline =
    "Mixing-zone evidence is unavailable.";

  let detail =
    "Pelora does not currently have enough water-character or boundary evidence to evaluate possible water interaction.";

  if (available) {
    classification =
      "no-mixing-zone-context";

    readinessState =
      "not-ready";

    interactionContext =
      "not-established";

    headline =
      "A mixing zone is not established.";

    detail =
      "Available surface observations do not currently provide combined water-character and hydrodynamic interaction evidence.";

    if (
      spatialThermalContrast &&
      !hydrodynamicInteractionSupported
    ) {
      classification =
        "thermal-boundary-context-without-mixing-evidence";

      readinessState =
        "partially-ready";

      interactionContext =
        "thermal-boundary-only";

      headline =
        "A thermal boundary is present without verified mixing evidence.";

      detail =
        "Spatial temperature observations describe changing surface-water character, but current evidence does not establish interaction between distinct waters.";
    } else if (
      hydrodynamicInteractionSupported &&
      !spatialThermalContrast
    ) {
      classification =
        "hydrodynamic-boundary-context-without-water-mass-distinction";

      readinessState =
        "partially-ready";

      interactionContext =
        "hydrodynamic-boundary-only";

      headline =
        "Hydrodynamic interaction signals are present without water-mass distinction.";

      detail =
        "Current edge, shear, or convergence evidence describes surface-flow organization, but adjacent water characteristics have not been independently distinguished.";
    } else if (
      combinedBoundaryContext
    ) {
      classification =
        hydrodynamicInteractionSignalCount >=
          2
          ? "multi-signal-boundary-interaction-context"
          : "combined-boundary-interaction-context";

      readinessState =
        "partially-ready";

      interactionContext =
        hydrodynamicInteractionSignalCount >=
          2
          ? "thermal-and-multiple-current-signals"
          : "thermal-and-current-edge";

      headline =
        hydrodynamicInteractionSignalCount >=
          2
          ? "Multiple boundary signals describe possible surface-water interaction context."
          : "Thermal and current-edge evidence describe possible surface-water interaction context.";

      detail =
        meaningfulSpatialThermalContrast
          ? "A meaningful thermal contrast coincides with organized current behavior. This supports an interaction context, but distinct adjacent water masses, persistence, and full mixing have not been established."
          : "A limited thermal contrast coincides with organized current behavior. The evidence remains insufficient to identify a mixing zone.";
    }
  }

  const missingRequirements = [
    !distinctAdjacentWaterMassesEstablished
      ? "distinct-adjacent-water-masses"
      : null,

    !waterMassDistinctionReady
      ? "water-mass-distinction-readiness"
      : null,

    !spatialSalinityAvailable
      ? "spatial-salinity-structure"
      : null,

    !spatialChlorophyllAvailable
      ? "spatial-chlorophyll-structure"
      : null,

    !verticalStructureAvailable
      ? "vertical-water-column-structure"
      : null,

    !persistenceAvailable
      ? "temporal-persistence"
      : null
  ].filter(Boolean);

  const inheritedLimitations = [
    ...(
      Array.isArray(
        waterMassAnalysis
          ?.limitations
      )
        ? waterMassAnalysis
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        surfaceWaterCharacter
          ?.limitations
      )
        ? surfaceWaterCharacter
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        temperature
          ?.limitations
      )
        ? temperature
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        currentEdge
          ?.limitations
      )
        ? currentEdge
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        currentConvergence
          ?.limitations
      )
        ? currentConvergence
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        currentShear
          ?.limitations
      )
        ? currentShear
            .limitations
        : []
    )
  ];

  const limitations = [
    ...new Set([
      ...inheritedLimitations,

      "Mixing Zone Analysis v1 evaluates evidence readiness and possible surface interaction context only.",

      "Current edge, convergence, and shear describe horizontal surface-flow organization but do not independently confirm mixing.",

      "A thermal boundary does not independently establish two distinct water masses or active mixing.",

      "Salinity, density, spatial chlorophyll, vertical profiles, turbulence, exchange rates, and full water-column structure are unavailable.",

      "No mixing zone, water-mass exchange, current front, ocean front, persistence, prey concentration, habitat quality, fish presence, or biological significance is confirmed."
    ])
  ];

  return {
    available,

    analysisType:
      "mixing-zone-analysis",

    classification,

    readinessState,

    interactionContext,

    mixingZoneReady,

    mixingZoneDetected,

    evidence: {
      waterMassAnalysisAvailable,

      surfaceCharacterAvailable,

      distinctAdjacentWaterMassesEstablished,

      waterMassDistinctionReady,

      spatialThermalContrast,

      meaningfulSpatialThermalContrast,

      directionalThermalContrast,

      currentEdgeDetected,

      convergenceDetected,

      shearDetected,

      hydrodynamicInteractionSignalCount,

      hydrodynamicInteractionSupported,

      combinedBoundaryContext,

      persistenceAvailable,

      verticalStructureAvailable,

      spatialSalinityAvailable,

      spatialChlorophyllAvailable
    },

    missingRequirements,

    headline,

    detail,

    limitations,

    upstreamContracts: [
      {
        engine:
          "water-mass-analysis",

        version:
          waterMassAnalysis
            ?.contractVersion ??
          null
      },

      {
        engine:
          "surface-water-character-analysis",

        version:
          surfaceWaterCharacter
            ?.contractVersion ??
          null
      },

      {
        engine:
          "temperature-evidence",

        version:
          temperature
            ?.interpretation ??
          null
      },

      {
        engine:
          "current-edge-analysis",

        version:
          currentEdge
            ?.contractVersion ??
          null
      },

      {
        engine:
          "current-convergence-analysis",

        version:
          currentConvergence
            ?.contractVersion ??
          null
      },

      {
        engine:
          "current-shear-analysis",

        version:
          currentShear
            ?.contractVersion ??
          null
      }
    ],

    contractVersion:
      "pelora-mixing-zone-analysis-v1"
  };
}


export function buildEnvironmentalTransitionAnalysis({
  surfaceWaterCharacter = null,
  waterMassAnalysis = null,
  mixingZoneAnalysis = null,
  temperature = null,
  current = null
} = {}) {
  const surfaceCharacterAvailable =
    surfaceWaterCharacter
      ?.available ===
    true;

  const waterMassAnalysisAvailable =
    waterMassAnalysis
      ?.available ===
    true;

  const mixingZoneAnalysisAvailable =
    mixingZoneAnalysis
      ?.available ===
    true;

  const temperatureAvailable =
    temperature
      ?.available ===
    true;

  const temperatureClassification =
    temperature
      ?.classification ??
    "unavailable";

  const thermalCoverage =
    temperature
      ?.values
      ?.coverage ??
    "unavailable";

  const sufficientThermalCoverage =
    thermalCoverage ===
    "sufficient";

  const weakThermalTransition =
    sufficientThermalCoverage &&
    temperatureClassification ===
      "weak-temperature-structure";

  const moderateThermalTransition =
    sufficientThermalCoverage &&
    temperatureClassification ===
      "moderate-temperature-structure";

  const strongThermalTransition =
    sufficientThermalCoverage &&
    temperatureClassification ===
      "strong-temperature-break-candidate";

  const thermalTransitionSupported =
    weakThermalTransition ||
    moderateThermalTransition ||
    strongThermalTransition;

  const meaningfulThermalTransition =
    moderateThermalTransition ||
    strongThermalTransition;

  const directionalThermalTransition =
    temperature
      ?.orientation
      ?.classification ===
    "directional-temperature-transition";

  const uniformThermalField =
    sufficientThermalCoverage &&
    (
      temperatureClassification ===
        "uniform-water" ||
      temperature
        ?.values
        ?.spatialClassification ===
        "uniform-water"
    );

  const currentSpatialAnalysis =
    current
      ?.spatialAnalysis ??
    null;

  const currentEdge =
    currentSpatialAnalysis
      ?.edge ??
    null;

  const currentConvergence =
    currentSpatialAnalysis
      ?.convergence ??
    null;

  const currentShear =
    currentSpatialAnalysis
      ?.shear ??
    null;

  const currentEdgeDetected =
    currentEdge
      ?.currentEdgeDetected ===
    true &&
    currentEdge
      ?.edgeState ===
    "candidate";

  const convergenceDetected =
    currentConvergence
      ?.currentConvergenceDetected ===
    true &&
    currentConvergence
      ?.convergenceState ===
    "candidate";

  const shearDetected =
    currentShear
      ?.currentShearDetected ===
    true &&
    currentShear
      ?.shearState ===
    "candidate";

  const hydrodynamicSignalCount =
    [
      currentEdgeDetected,
      convergenceDetected,
      shearDetected
    ].filter(Boolean).length;

  const hydrodynamicTransitionSupported =
    hydrodynamicSignalCount >
    0;

  const multipleHydrodynamicSignals =
    hydrodynamicSignalCount >=
    2;

  const waterMassBoundaryContext =
    waterMassAnalysis
      ?.classification ===
      "combined-boundary-context-without-water-mass-distinction" ||
    waterMassAnalysis
      ?.classification ===
      "single-variable-spatial-water-contrast" ||
    waterMassAnalysis
      ?.classification ===
      "hydrodynamic-boundary-with-local-water-character";

  const mixingInteractionContext =
    [
      "combined-boundary-interaction-context",
      "multi-signal-boundary-interaction-context"
    ].includes(
      mixingZoneAnalysis
        ?.classification
    );

  const independentTransitionSignalCount =
    [
      thermalTransitionSupported,
      currentEdgeDetected,
      convergenceDetected,
      shearDetected,
      waterMassBoundaryContext,
      mixingInteractionContext
    ].filter(Boolean).length;

  const combinedThermalCurrentContext =
    thermalTransitionSupported &&
    hydrodynamicTransitionSupported;

  const multiSignalContext =
    combinedThermalCurrentContext &&
    (
      multipleHydrodynamicSignals ||
      waterMassBoundaryContext ||
      mixingInteractionContext
    );

  /*
   * A verified environmental transition requires more than a
   * single-time surface snapshot. Current v1 evidence can describe
   * transition context, but cannot establish persistence, complete
   * cross-boundary water character, or full water-column structure.
   */
  const persistenceAvailable =
    false;

  const secondSpatialWaterCharacterVariableAvailable =
    waterMassAnalysis
      ?.evidence
      ?.independentSpatialCharacterVariableCount >=
    2;

  const fullWaterColumnStructureAvailable =
    false;

  const environmentalTransitionReady =
    meaningfulThermalTransition &&
    hydrodynamicTransitionSupported &&
    secondSpatialWaterCharacterVariableAvailable &&
    persistenceAvailable;

  const environmentalTransitionDetected =
    false;

  const oceanFrontDetected =
    false;

  const available =
    surfaceCharacterAvailable ||
    waterMassAnalysisAvailable ||
    mixingZoneAnalysisAvailable ||
    temperatureAvailable ||
    hydrodynamicTransitionSupported;

  let classification =
    "unavailable";

  let transitionState =
    "insufficient-evidence";

  let transitionStrength =
    "unknown";

  let transitionType =
    "unavailable";

  let headline =
    "Environmental-transition evidence is unavailable.";

  let detail =
    "Pelora does not currently have enough environmental evidence to describe a transition.";

  if (available) {
    classification =
      "uniform-environmental-context";

    transitionState =
      "not-supported";

    transitionStrength =
      "none";

    transitionType =
      "uniform-or-unresolved";

    headline =
      "No organized environmental transition is established.";

    detail =
      "The available observations do not currently show corroborating thermal and current changes within the sampled area.";

    if (
      uniformThermalField &&
      !hydrodynamicTransitionSupported
    ) {
      classification =
        "uniform-environmental-context";

      transitionState =
        "observed";

      transitionStrength =
        "none";

      transitionType =
        "uniform";

      headline =
        "The sampled environment remains broadly uniform.";

      detail =
        "Nearby temperatures remain broadly uniform, and current evidence does not support an organized boundary.";
    } else if (
      thermalTransitionSupported &&
      !hydrodynamicTransitionSupported
    ) {
      classification =
        "thermal-transition-context";

      transitionState =
        "candidate-context";

      transitionStrength =
        strongThermalTransition
          ? "pronounced"
          : moderateThermalTransition
            ? "measurable"
            : "weak";

      transitionType =
        "thermal";

      headline =
        "A temperature-based environmental transition is present.";

      detail =
        meaningfulThermalTransition
          ? "Nearby temperature observations show meaningful spatial change, but current evidence does not yet corroborate the same boundary."
          : "Nearby temperature observations show limited spatial change without supporting hydrodynamic evidence.";
    } else if (
      hydrodynamicTransitionSupported &&
      !thermalTransitionSupported
    ) {
      classification =
        "hydrodynamic-transition-context";

      transitionState =
        "candidate-context";

      transitionStrength =
        multipleHydrodynamicSignals
          ? "pronounced"
          : "measurable";

      transitionType =
        "hydrodynamic";

      headline =
        "An organized current transition is present.";

      detail =
        multipleHydrodynamicSignals
          ? "Multiple current signals describe organized surface-flow change, but spatial water-character evidence does not yet corroborate the boundary."
          : "Current evidence describes an organized surface-flow boundary, but matching thermal or other spatial water-character evidence is not established.";
    } else if (
      combinedThermalCurrentContext &&
      !multiSignalContext
    ) {
      classification =
        "combined-environmental-transition-context";

      transitionState =
        "candidate-context";

      transitionStrength =
        (
          strongThermalTransition ||
          currentEdge
            ?.edgeStrength ===
          "pronounced"
        )
          ? "pronounced"
          : "measurable";

      transitionType =
        "thermal-and-hydrodynamic";

      headline =
        "Temperature and current evidence describe the same broad transition context.";

      detail =
        "Spatial temperature change coincides with organized current behavior. This supports a combined environmental-transition context but does not establish persistence or a verified ocean front.";
    } else if (
      multiSignalContext
    ) {
      classification =
        "multi-signal-environmental-transition-context";

      transitionState =
        "candidate-context";

      transitionStrength =
        (
          strongThermalTransition ||
          multipleHydrodynamicSignals
        )
          ? "pronounced"
          : "measurable";

      transitionType =
        "multi-signal";

      headline =
        "Several independent signals describe an organized environmental transition context.";

      detail =
        "Thermal change, organized current behavior, and upstream boundary or interaction evidence occur within the sampled area. The evidence remains a single-time surface interpretation rather than a verified persistent ocean front.";
    }
  }

  const missingRequirements = [
    !secondSpatialWaterCharacterVariableAvailable
      ? "second-independent-spatial-water-character-variable"
      : null,

    !persistenceAvailable
      ? "temporal-persistence"
      : null,

    !fullWaterColumnStructureAvailable
      ? "full-water-column-structure"
      : null,

    waterMassAnalysis
      ?.distinctAdjacentWaterMassesEstablished !==
      true
      ? "distinct-adjacent-water-masses"
      : null,

    mixingZoneAnalysis
      ?.mixingZoneDetected !==
      true
      ? "verified-mixing-zone"
      : null
  ].filter(Boolean);

  const inheritedLimitations = [
    ...(
      Array.isArray(
        surfaceWaterCharacter
          ?.limitations
      )
        ? surfaceWaterCharacter
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        waterMassAnalysis
          ?.limitations
      )
        ? waterMassAnalysis
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        mixingZoneAnalysis
          ?.limitations
      )
        ? mixingZoneAnalysis
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        temperature
          ?.limitations
      )
        ? temperature
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        currentEdge
          ?.limitations
      )
        ? currentEdge
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        currentConvergence
          ?.limitations
      )
        ? currentConvergence
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        currentShear
          ?.limitations
      )
        ? currentShear
            .limitations
        : []
    )
  ];

  const limitations = [
    ...new Set([
      ...inheritedLimitations,

      "Environmental Transition Analysis v1 synthesizes governed surface evidence without changing upstream scientific classifications.",

      "Coincident thermal and current signals describe environmental-transition context but do not independently establish persistence or a complete cross-boundary water-mass difference.",

      "Spatial chlorophyll, salinity, density, vertical profiles, subsurface temperature, and full water-column structure are unavailable.",

      "The internal headline and detail are scientific summaries and are not the final captain-facing narrative.",

      "No verified environmental transition, mixing zone, current front, ocean front, prey concentration, habitat quality, fish presence, or biological significance is confirmed."
    ])
  ];

  return {
    available,

    analysisType:
      "environmental-transition-analysis",

    classification,

    transitionType,

    transitionState,

    transitionStrength,

    environmentalTransitionReady,

    environmentalTransitionDetected,

    oceanFrontDetected,

    evidence: {
      surfaceCharacterAvailable,

      waterMassAnalysisAvailable,

      mixingZoneAnalysisAvailable,

      temperatureAvailable,

      thermalCoverage,

      sufficientThermalCoverage,

      temperatureClassification,

      uniformThermalField,

      weakThermalTransition,

      moderateThermalTransition,

      strongThermalTransition,

      thermalTransitionSupported,

      meaningfulThermalTransition,

      directionalThermalTransition,

      currentEdgeDetected,

      convergenceDetected,

      shearDetected,

      hydrodynamicSignalCount,

      hydrodynamicTransitionSupported,

      multipleHydrodynamicSignals,

      waterMassBoundaryContext,

      mixingInteractionContext,

      independentTransitionSignalCount,

      combinedThermalCurrentContext,

      multiSignalContext,

      secondSpatialWaterCharacterVariableAvailable,

      persistenceAvailable,

      fullWaterColumnStructureAvailable
    },

    missingRequirements,

    headline,

    detail,

    limitations,

    upstreamContracts: [
      {
        engine:
          "surface-water-character-analysis",

        version:
          surfaceWaterCharacter
            ?.contractVersion ??
          null
      },

      {
        engine:
          "water-mass-analysis",

        version:
          waterMassAnalysis
            ?.contractVersion ??
          null
      },

      {
        engine:
          "mixing-zone-analysis",

        version:
          mixingZoneAnalysis
            ?.contractVersion ??
          null
      },

      {
        engine:
          "temperature-evidence",

        version:
          temperature
            ?.interpretation ??
          null
      },

      {
        engine:
          "current-edge-analysis",

        version:
          currentEdge
            ?.contractVersion ??
          null
      },

      {
        engine:
          "current-convergence-analysis",

        version:
          currentConvergence
            ?.contractVersion ??
          null
      },

      {
        engine:
          "current-shear-analysis",

        version:
          currentShear
            ?.contractVersion ??
          null
      }
    ],

    contractVersion:
      "pelora-environmental-transition-analysis-v1"
  };
}


export function buildOceanFrontAnalysis({
  environmentalTransitionAnalysis = null,
  waterMassAnalysis = null,
  mixingZoneAnalysis = null,
  temperature = null,
  current = null
} = {}) {
  const environmentalTransitionAvailable =
    environmentalTransitionAnalysis
      ?.available ===
    true;

  const environmentalTransitionClassification =
    environmentalTransitionAnalysis
      ?.classification ??
    "unavailable";

  const environmentalTransitionState =
    environmentalTransitionAnalysis
      ?.transitionState ??
    "insufficient-evidence";

  const environmentalTransitionStrength =
    environmentalTransitionAnalysis
      ?.transitionStrength ??
    "unknown";

  const thermalTransitionSupported =
    environmentalTransitionAnalysis
      ?.evidence
      ?.thermalTransitionSupported ===
    true;

  const meaningfulThermalTransition =
    environmentalTransitionAnalysis
      ?.evidence
      ?.meaningfulThermalTransition ===
    true;

  const directionalThermalTransition =
    environmentalTransitionAnalysis
      ?.evidence
      ?.directionalThermalTransition ===
    true;

  const hydrodynamicTransitionSupported =
    environmentalTransitionAnalysis
      ?.evidence
      ?.hydrodynamicTransitionSupported ===
    true;

  const hydrodynamicSignalCount =
    Number.isFinite(
      environmentalTransitionAnalysis
        ?.evidence
        ?.hydrodynamicSignalCount
    )
      ? environmentalTransitionAnalysis
          .evidence
          .hydrodynamicSignalCount
      : 0;

  const combinedThermalCurrentContext =
    environmentalTransitionAnalysis
      ?.evidence
      ?.combinedThermalCurrentContext ===
    true;

  const multiSignalEnvironmentalContext =
    environmentalTransitionClassification ===
      "multi-signal-environmental-transition-context";

  const currentEdgeDetected =
    environmentalTransitionAnalysis
      ?.evidence
      ?.currentEdgeDetected ===
    true;

  const distinctAdjacentWaterMassesEstablished =
    waterMassAnalysis
      ?.distinctAdjacentWaterMassesEstablished ===
    true;

  const waterMassDistinctionReady =
    waterMassAnalysis
      ?.waterMassDistinctionReady ===
    true;

  const independentSpatialCharacterVariableCount =
    Number.isFinite(
      waterMassAnalysis
        ?.evidence
        ?.independentSpatialCharacterVariableCount
    )
      ? waterMassAnalysis
          .evidence
          .independentSpatialCharacterVariableCount
      : 0;

  const mixingZoneDetected =
    mixingZoneAnalysis
      ?.mixingZoneDetected ===
    true;

  const mixingZoneReady =
    mixingZoneAnalysis
      ?.mixingZoneReady ===
    true;

  const mixingInteractionContext =
    [
      "combined-boundary-interaction-context",
      "multi-signal-boundary-interaction-context"
    ].includes(
      mixingZoneAnalysis
        ?.classification
    );

  const persistenceAvailable =
    false;

  const crossBoundaryWaterCharacterAvailable =
    independentSpatialCharacterVariableCount >=
    2;

  const fullWaterColumnStructureAvailable =
    false;

  const sufficientFrontEvidence =
    meaningfulThermalTransition &&
    hydrodynamicTransitionSupported &&
    currentEdgeDetected;

  const corroboratingFrontContext =
    sufficientFrontEvidence &&
    (
      hydrodynamicSignalCount >=
        2 ||
      mixingInteractionContext ||
      multiSignalEnvironmentalContext
    );

  const oceanFrontReady =
    sufficientFrontEvidence &&
    crossBoundaryWaterCharacterAvailable &&
    distinctAdjacentWaterMassesEstablished &&
    waterMassDistinctionReady &&
    mixingZoneReady &&
    persistenceAvailable;

  const oceanFrontDetected =
    false;

  const available =
    environmentalTransitionAvailable ||
    thermalTransitionSupported ||
    hydrodynamicTransitionSupported;

  let classification =
    "unavailable";

  let frontState =
    "insufficient-evidence";

  let frontStrength =
    "unknown";

  let frontType =
    "unavailable";

  let headline =
    "Ocean-front evidence is unavailable.";

  let detail =
    "Pelora does not currently have enough environmental evidence to evaluate an ocean-front context.";

  if (available) {
    classification =
      "no-ocean-front-context";

    frontState =
      "not-supported";

    frontStrength =
      "none";

    frontType =
      "none";

    headline =
      "An ocean-front context is not established.";

    detail =
      "The available observations do not show a corroborated thermal and current boundary.";

    if (
      thermalTransitionSupported &&
      !hydrodynamicTransitionSupported
    ) {
      classification =
        "thermal-boundary-without-front-support";

      frontState =
        "incomplete-support";

      frontStrength =
        meaningfulThermalTransition
          ? "measurable"
          : "weak";

      frontType =
        "thermal-only";

      headline =
        "A temperature boundary is present without enough current support.";

      detail =
        "Nearby temperatures change across the sampled area, but organized current evidence does not yet support the same boundary.";
    } else if (
      hydrodynamicTransitionSupported &&
      !thermalTransitionSupported
    ) {
      classification =
        "current-boundary-without-front-support";

      frontState =
        "incomplete-support";

      frontStrength =
        hydrodynamicSignalCount >=
          2
          ? "pronounced"
          : "measurable";

      frontType =
        "hydrodynamic-only";

      headline =
        "An organized current boundary is present without enough water-character support.";

      detail =
        "Current evidence shows an organized boundary, but matching spatial temperature or other water-character evidence is not established.";
    } else if (
      sufficientFrontEvidence &&
      !corroboratingFrontContext
    ) {
      classification =
        "ocean-front-candidate-context";

      frontState =
        "candidate-context";

      frontStrength =
        (
          environmentalTransitionStrength ===
            "pronounced"
        )
          ? "pronounced"
          : "measurable";

      frontType =
        "thermal-current-boundary";

      headline =
        "Temperature and current evidence describe an ocean-front candidate context.";

      detail =
        "A meaningful temperature transition coincides with a current-edge candidate. Distinct adjacent water masses and persistence remain unverified.";
    } else if (
      corroboratingFrontContext
    ) {
      classification =
        "multi-signal-ocean-front-candidate-context";

      frontState =
        "candidate-context";

      frontStrength =
        (
          environmentalTransitionStrength ===
            "pronounced" ||
          hydrodynamicSignalCount >=
            2
        )
          ? "pronounced"
          : "measurable";

      frontType =
        "multi-signal-surface-boundary";

      headline =
        "Several independent signals describe a strong ocean-front candidate context.";

      detail =
        "Thermal change, an organized current boundary, and additional interaction evidence occur within the sampled area. The evidence remains insufficient to verify a persistent ocean front.";
    }
  }

  const missingRequirements = [
    !crossBoundaryWaterCharacterAvailable
      ? "second-independent-spatial-water-character-variable"
      : null,

    !distinctAdjacentWaterMassesEstablished
      ? "distinct-adjacent-water-masses"
      : null,

    !waterMassDistinctionReady
      ? "water-mass-distinction-readiness"
      : null,

    !mixingZoneDetected
      ? "verified-mixing-zone"
      : null,

    !persistenceAvailable
      ? "temporal-persistence"
      : null,

    !fullWaterColumnStructureAvailable
      ? "full-water-column-structure"
      : null
  ].filter(Boolean);

  const inheritedLimitations = [
    ...(
      Array.isArray(
        environmentalTransitionAnalysis
          ?.limitations
      )
        ? environmentalTransitionAnalysis
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        waterMassAnalysis
          ?.limitations
      )
        ? waterMassAnalysis
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        mixingZoneAnalysis
          ?.limitations
      )
        ? mixingZoneAnalysis
            .limitations
        : []
    ),

    ...(
      Array.isArray(
        temperature
          ?.limitations
      )
        ? temperature
            .limitations
        : []
    )
  ];

  const limitations = [
    ...new Set([
      ...inheritedLimitations,

      "Ocean Front Analysis v1 evaluates ocean-front readiness and candidate context only.",

      "Coincident temperature and current boundaries do not independently confirm a persistent ocean front.",

      "A verified ocean front requires distinct cross-boundary water characteristics and temporal persistence.",

      "Spatial chlorophyll, salinity, density, subsurface temperature, vertical profiles, and full water-column structure are unavailable.",

      "The internal headline and detail are scientific summaries and are not captain-facing narrative.",

      "No verified ocean front, water-mass exchange, persistence, prey concentration, habitat quality, fish presence, fishing quality, or biological significance is confirmed."
    ])
  ];

  return {
    available,

    analysisType:
      "ocean-front-analysis",

    classification,

    frontType,

    frontState,

    frontStrength,

    oceanFrontReady,

    oceanFrontDetected,

    evidence: {
      environmentalTransitionAvailable,

      environmentalTransitionClassification,

      environmentalTransitionState,

      environmentalTransitionStrength,

      thermalTransitionSupported,

      meaningfulThermalTransition,

      directionalThermalTransition,

      hydrodynamicTransitionSupported,

      hydrodynamicSignalCount,

      combinedThermalCurrentContext,

      multiSignalEnvironmentalContext,

      currentEdgeDetected,

      sufficientFrontEvidence,

      corroboratingFrontContext,

      distinctAdjacentWaterMassesEstablished,

      waterMassDistinctionReady,

      independentSpatialCharacterVariableCount,

      crossBoundaryWaterCharacterAvailable,

      mixingZoneDetected,

      mixingZoneReady,

      mixingInteractionContext,

      persistenceAvailable,

      fullWaterColumnStructureAvailable
    },

    missingRequirements,

    headline,

    detail,

    limitations,

    upstreamContracts: [
      {
        engine:
          "environmental-transition-analysis",

        version:
          environmentalTransitionAnalysis
            ?.contractVersion ??
          null
      },

      {
        engine:
          "water-mass-analysis",

        version:
          waterMassAnalysis
            ?.contractVersion ??
          null
      },

      {
        engine:
          "mixing-zone-analysis",

        version:
          mixingZoneAnalysis
            ?.contractVersion ??
          null
      },

      {
        engine:
          "temperature-evidence",

        version:
          temperature
            ?.interpretation ??
          null
      }
    ],

    contractVersion:
      "pelora-ocean-front-analysis-v1"
  };
}


export function buildOceanPhysicsExplainabilitySummary({
  surfaceWaterCharacter = null,
  waterMassAnalysis = null,
  mixingZoneAnalysis = null,
  environmentalTransitionAnalysis = null,
  oceanFrontAnalysis = null
} = {}) {
  const normalizeStage = ({
    stage,
    contract,
    state = null,
    ready = null,
    detected = null
  }) => ({
    stage,

    available:
      contract
        ?.available ===
      true,

    analysisType:
      contract
        ?.analysisType ??
      null,

    classification:
      contract
        ?.classification ??
      "unavailable",

    state,

    ready:
      typeof ready ===
        "boolean"
        ? ready
        : null,

    detected:
      typeof detected ===
        "boolean"
        ? detected
        : null,

    missingRequirements:
      Array.isArray(
        contract
          ?.missingRequirements
      )
        ? contract
            .missingRequirements
        : [],

    contractVersion:
      contract
        ?.contractVersion ??
      contract
        ?.thresholdVersion ??
      contract
        ?.methodVersion ??
      null
  });

  const stages = [
    normalizeStage({
      stage:
        "surface-water-character",

      contract:
        surfaceWaterCharacter,

      state:
        surfaceWaterCharacter
          ?.state ??
        null
    }),

    normalizeStage({
      stage:
        "water-mass",

      contract:
        waterMassAnalysis,

      state:
        waterMassAnalysis
          ?.readinessState ??
        null,

      ready:
        waterMassAnalysis
          ?.waterMassDistinctionReady,

      detected:
        waterMassAnalysis
          ?.distinctAdjacentWaterMassesEstablished
    }),

    normalizeStage({
      stage:
        "mixing-zone",

      contract:
        mixingZoneAnalysis,

      state:
        mixingZoneAnalysis
          ?.readinessState ??
        null,

      ready:
        mixingZoneAnalysis
          ?.mixingZoneReady,

      detected:
        mixingZoneAnalysis
          ?.mixingZoneDetected
    }),

    normalizeStage({
      stage:
        "environmental-transition",

      contract:
        environmentalTransitionAnalysis,

      state:
        environmentalTransitionAnalysis
          ?.transitionState ??
        null,

      ready:
        environmentalTransitionAnalysis
          ?.environmentalTransitionReady,

      detected:
        environmentalTransitionAnalysis
          ?.environmentalTransitionDetected
    }),

    normalizeStage({
      stage:
        "ocean-front",

      contract:
        oceanFrontAnalysis,

      state:
        oceanFrontAnalysis
          ?.frontState ??
        null,

      ready:
        oceanFrontAnalysis
          ?.oceanFrontReady,

      detected:
        oceanFrontAnalysis
          ?.oceanFrontDetected
    })
  ];

  const availableStages =
    stages.filter(
      stage =>
        stage.available
    );

  const stageOrder = [
    "surface-water-character",
    "water-mass",
    "mixing-zone",
    "environmental-transition",
    "ocean-front"
  ];

  const highestSupportedStage =
    [...availableStages]
      .sort(
        (a, b) =>
          stageOrder.indexOf(
            b.stage
          ) -
          stageOrder.indexOf(
            a.stage
          )
      )[0]
      ?.stage ??
    "unavailable";

  const readiness = {
    waterMass:
      waterMassAnalysis
        ?.waterMassDistinctionReady ===
      true,

    mixingZone:
      mixingZoneAnalysis
        ?.mixingZoneReady ===
      true,

    environmentalTransition:
      environmentalTransitionAnalysis
        ?.environmentalTransitionReady ===
      true,

    oceanFront:
      oceanFrontAnalysis
        ?.oceanFrontReady ===
      true
  };

  const detections = {
    distinctAdjacentWaterMasses:
      waterMassAnalysis
        ?.distinctAdjacentWaterMassesEstablished ===
      true,

    mixingZone:
      mixingZoneAnalysis
        ?.mixingZoneDetected ===
      true,

    environmentalTransition:
      environmentalTransitionAnalysis
        ?.environmentalTransitionDetected ===
      true,

    oceanFront:
      oceanFrontAnalysis
        ?.oceanFrontDetected ===
      true
  };

  const missingRequirements = [
    ...new Set(
      stages.flatMap(
        stage =>
          stage
            .missingRequirements
      )
    )
  ];

  const inheritedLimitations = [
    surfaceWaterCharacter,
    waterMassAnalysis,
    mixingZoneAnalysis,
    environmentalTransitionAnalysis,
    oceanFrontAnalysis
  ].flatMap(
    contract =>
      Array.isArray(
        contract
          ?.limitations
      )
        ? contract
            .limitations
        : []
  );

  const limitations = [
    ...new Set([
      ...inheritedLimitations,

      "Ocean Physics Explainability Summary normalizes existing scientific contracts without changing their classifications, readiness, detections, evidence, or limitations.",

      "The original engine contracts remain authoritative.",

      "This summary is intended for downstream explainability and Captain Experience translation, not direct scientific inference.",

      "No captain-facing narrative is generated by this contract."
    ])
  ];

  let summaryState =
    "unavailable";

  if (
    availableStages.length >
    0
  ) {
    summaryState =
      Object.values(
        detections
      ).some(Boolean)
        ? "verified-detection-present"
        : Object.values(
            readiness
          ).some(Boolean)
          ? "readiness-present"
          : "candidate-or-observational-context";
  }

  return {
    available:
      availableStages.length >
      0,

    layerType:
      "ocean-physics-explainability",

    summaryState,

    highestSupportedStage,

    stages,

    readiness,

    detections,

    missingRequirements,

    limitations,

    contractVersions:
      Object.fromEntries(
        stages.map(
          stage => [
            stage.stage,
            stage.contractVersion
          ]
        )
      ),

    contractVersion:
      "pelora-ocean-physics-explainability-v1"
  };
}


/**
 * ------------------------------------------------------------
 * Ocean Physics Explainability Lineage v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Preserve the governed observation-to-explainability path used
 * by the normalized Ocean Physics Explainability Summary.
 *
 * Ocean Evidence is the authoritative upstream observation and
 * evidence trace. The individual physics contracts remain visible
 * through documentary components and contract versions.
 *
 * This lineage is documentary only. It does not alter scientific
 * classifications, readiness, detections, confidence, scoring,
 * missing requirements, or captain-facing language.
 */
export function buildOceanPhysicsExplainabilityLineage({
  oceanEvidenceLineage = null,
  oceanPhysicsExplainability = null,
  surfaceWaterCharacter = null,
  waterMassAnalysis = null,
  mixingZoneAnalysis = null,
  environmentalTransitionAnalysis = null,
  oceanFrontAnalysis = null
} = {}) {
  const stages =
    Array.isArray(
      oceanPhysicsExplainability
        ?.stages
    )
      ? oceanPhysicsExplainability
          .stages
      : [];

  const availableStages =
    stages
      .filter(
        stage =>
          stage
            ?.available ===
          true
      )
      .map(
        stage =>
          stage.stage
      );

  const unavailableStages =
    stages
      .filter(
        stage =>
          stage
            ?.available !==
          true
      )
      .map(
        stage =>
          stage.stage
      );

  const contractVersions = {
    surfaceWaterCharacter:
      surfaceWaterCharacter
        ?.contractVersion ??
      null,

    waterMassAnalysis:
      waterMassAnalysis
        ?.contractVersion ??
      null,

    mixingZoneAnalysis:
      mixingZoneAnalysis
        ?.contractVersion ??
      null,

    environmentalTransitionAnalysis:
      environmentalTransitionAnalysis
        ?.contractVersion ??
      null,

    oceanFrontAnalysis:
      oceanFrontAnalysis
        ?.contractVersion ??
      null,

    explainabilitySummary:
      oceanPhysicsExplainability
        ?.contractVersion ??
      null
  };

  const missingContractVersions =
    Object.entries(
      contractVersions
    )
      .filter(
        ([, version]) =>
          typeof version !==
            "string" ||
          version.trim().length ===
            0
      )
      .map(
        ([contract]) =>
          "contract-version-unavailable:" + contract
      );

  const inheritedWarnings = [
    ...(
      oceanEvidenceLineage
        ? []
        : [
            "primary-upstream-lineage-unavailable"
          ]
    ),

    ...missingContractVersions
  ];

  return propagateEvidenceLineage({
    primaryUpstreamLineage:
      oceanEvidenceLineage,

    producedBy:
      "ocean-physics-explainability",

    methodVersion:
      "pelora-ocean-physics-explainability-lineage-v1.0",

    evidenceProduced: [
      "ocean-physics-explainability-summary"
    ],

    inheritedLimitations:
      Array.isArray(
        oceanPhysicsExplainability
          ?.limitations
      )
        ? oceanPhysicsExplainability
            .limitations
        : [],

    inheritedWarnings,

    components: {
      summaryState:
        oceanPhysicsExplainability
          ?.summaryState ??
        "unavailable",

      highestSupportedStage:
        oceanPhysicsExplainability
          ?.highestSupportedStage ??
        "unavailable",

      availableStages,

      unavailableStages,

      stageCount:
        stages.length,

      readiness: {
        ...(
          oceanPhysicsExplainability
            ?.readiness ??
          {}
        )
      },

      detections: {
        ...(
          oceanPhysicsExplainability
            ?.detections ??
          {}
        )
      },

      missingRequirements:
        Array.isArray(
          oceanPhysicsExplainability
            ?.missingRequirements
        )
          ? [
              ...oceanPhysicsExplainability
                .missingRequirements
            ]
          : [],

      contractVersions
    }
  });
}


/**
 * ------------------------------------------------------------
 * Ocean Organization Analysis v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Synthesize governed physical-ocean contracts into one
 * species-neutral description of environmental organization.
 *
 * This engine does not detect a new physical feature. It records
 * how many independent physical observations and synthesis
 * contracts agree that the sampled ocean is organized.
 *
 * It does not evaluate habitat, fishing opportunity, species
 * suitability, prey, fish presence, or catch probability.
 */
export function buildOceanOrganizationAnalysis({
  current = null,
  temperature = null,
  surfaceWaterCharacter = null,
  waterMassAnalysis = null,
  mixingZoneAnalysis = null,
  environmentalTransitionAnalysis = null,
  oceanFrontAnalysis = null
} = {}) {
  const currentSpatialAnalysis =
    current
      ?.spatialAnalysis ??
    null;

  const currentOrganization =
    currentSpatialAnalysis
      ?.organization ??
    null;

  const currentPattern =
    currentSpatialAnalysis
      ?.spatialPattern ??
    null;

  const currentShear =
    currentSpatialAnalysis
      ?.shear ??
    null;

  const currentConvergence =
    currentSpatialAnalysis
      ?.convergence ??
    null;

  const currentEdge =
    currentSpatialAnalysis
      ?.edge ??
    null;

  const currentOrganizationAvailable =
    currentOrganization
      ?.available ===
    true;

  const currentFieldUniform =
    currentOrganization
      ?.classification ===
      "uniform-current-field" ||
    currentPattern
      ?.patternType ===
      "uniform-flow-pattern";

  const currentVariationObserved =
    currentOrganization
      ?.classification ===
      "organized-current-transition" ||
    currentPattern
      ?.patternState ===
      "candidate";

  const shearDetected =
    currentShear
      ?.currentShearDetected ===
    true &&
    currentShear
      ?.shearState ===
    "candidate";

  const convergenceDetected =
    currentConvergence
      ?.currentConvergenceDetected ===
    true &&
    currentConvergence
      ?.convergenceState ===
    "candidate";

  const currentEdgeDetected =
    currentEdge
      ?.currentEdgeDetected ===
    true &&
    currentEdge
      ?.edgeState ===
    "candidate";

  const sufficientThermalCoverage =
    temperature
      ?.values
      ?.coverage ===
    "sufficient";

  const temperatureClassification =
    temperature
      ?.classification ??
    "unavailable";

  const uniformThermalField =
    sufficientThermalCoverage &&
    (
      temperatureClassification ===
        "uniform-water" ||
      temperature
        ?.values
        ?.spatialClassification ===
        "uniform-water"
    );

  const meaningfulThermalTransition =
    sufficientThermalCoverage &&
    [
      "moderate-temperature-structure",
      "strong-temperature-break-candidate"
    ].includes(
      temperatureClassification
    );

  const pronouncedThermalTransition =
    sufficientThermalCoverage &&
    temperatureClassification ===
      "strong-temperature-break-candidate";

  const surfaceBoundaryContext =
    [
      "thermal-boundary-context",
      "current-boundary-context",
      "combined-thermal-current-boundary-context"
    ].includes(
      surfaceWaterCharacter
        ?.classification
    );

  const waterMassBoundaryContext =
    [
      "single-variable-spatial-water-contrast",
      "hydrodynamic-boundary-with-local-water-character",
      "combined-boundary-context-without-water-mass-distinction"
    ].includes(
      waterMassAnalysis
        ?.classification
    );

  const mixingInteractionContext =
    [
      "combined-boundary-interaction-context",
      "multi-signal-boundary-interaction-context"
    ].includes(
      mixingZoneAnalysis
        ?.classification
    );

  const environmentalTransitionContext =
    [
      "combined-environmental-transition-context",
      "multi-signal-environmental-transition-context"
    ].includes(
      environmentalTransitionAnalysis
        ?.classification
    );

  const oceanFrontCandidateContext =
    [
      "ocean-front-candidate-context",
      "multi-signal-ocean-front-candidate-context"
    ].includes(
      oceanFrontAnalysis
        ?.classification
    );

  /*
   * The index is transparent and additive.
   *
   * Direct physical measurements receive one point each.
   * Higher synthesis contracts receive one point each because
   * they represent corroboration across upstream evidence.
   *
   * This is an organization index only. It is not confidence,
   * habitat suitability, fishing quality, or probability.
   */
  const weightedSignals = [
    {
      driver:
        "organized-current-variation",

      supported:
        currentVariationObserved,

      weight:
        1
    },

    {
      driver:
        "current-shear",

      supported:
        shearDetected,

      weight:
        1
    },

    {
      driver:
        "current-convergence",

      supported:
        convergenceDetected,

      weight:
        1
    },

    {
      driver:
        "current-edge",

      supported:
        currentEdgeDetected,

      weight:
        1
    },

    {
      driver:
        "meaningful-thermal-transition",

      supported:
        meaningfulThermalTransition,

      weight:
        pronouncedThermalTransition
          ? 2
          : 1
    },

    {
      driver:
        "surface-water-boundary-context",

      supported:
        surfaceBoundaryContext,

      weight:
        1
    },

    {
      driver:
        "water-mass-boundary-context",

      supported:
        waterMassBoundaryContext,

      weight:
        1
    },

    {
      driver:
        "mixing-interaction-context",

      supported:
        mixingInteractionContext,

      weight:
        1
    },

    {
      driver:
        "environmental-transition-context",

      supported:
        environmentalTransitionContext,

      weight:
        1
    },

    {
      driver:
        "ocean-front-candidate-context",

      supported:
        oceanFrontCandidateContext,

      weight:
        1
    }
  ];

  const supportedSignals =
    weightedSignals.filter(
      signal =>
        signal.supported
    );

  const organizationDrivers =
    supportedSignals.map(
      signal =>
        signal.driver
    );

  const organizationSignalCount =
    organizationDrivers.length;

  const organizationIndex =
    supportedSignals.reduce(
      (
        total,
        signal
      ) =>
        total +
        signal.weight,
      0
    );

  const counterEvidence = [
    currentFieldUniform
      ? "uniform-current-field"
      : null,

    uniformThermalField
      ? "uniform-temperature-field"
      : null,

    waterMassAnalysis
      ?.distinctAdjacentWaterMassesEstablished !==
      true
      ? "distinct-water-masses-not-established"
      : null,

    mixingZoneAnalysis
      ?.mixingZoneDetected !==
      true
      ? "mixing-zone-not-established"
      : null,

    environmentalTransitionAnalysis
      ?.environmentalTransitionDetected !==
      true
      ? "verified-environmental-transition-not-established"
      : null,

    oceanFrontAnalysis
      ?.oceanFrontDetected !==
      true
      ? "verified-ocean-front-not-established"
      : null
  ].filter(Boolean);

  const available =
    currentOrganizationAvailable ||
    temperature
      ?.available ===
    true ||
    surfaceWaterCharacter
      ?.available ===
    true ||
    waterMassAnalysis
      ?.available ===
    true ||
    mixingZoneAnalysis
      ?.available ===
    true ||
    environmentalTransitionAnalysis
      ?.available ===
    true ||
    oceanFrontAnalysis
      ?.available ===
    true;

  let classification =
    "unavailable";

  let organizationLevel =
    "unavailable";

  let organizationState =
    "insufficient-evidence";

  let interpretation =
    "Ocean organization cannot be evaluated from the available physical evidence.";

  if (available) {
    classification =
      "uniform-or-unresolved-ocean";

    organizationLevel =
      "uniform";

    organizationState =
      "observed";

    interpretation =
      "The available physical observations remain broadly uniform or do not yet agree on an organized environmental pattern.";

    if (
      organizationIndex >=
      8
    ) {
      classification =
        "highly-organized-ocean-context";

      organizationLevel =
        "highly-organized";

      organizationState =
        "strong-candidate-context";

      interpretation =
        "Many independent physical signals agree that the sampled ocean is strongly organized.";
    } else if (
      organizationIndex >=
      5
    ) {
      classification =
        "organized-ocean-context";

      organizationLevel =
        "organized";

      organizationState =
        "candidate-context";

      interpretation =
        "Several independent physical signals agree that the sampled ocean is organized.";
    } else if (
      organizationIndex >=
      3
    ) {
      classification =
        "developing-ocean-organization";

      organizationLevel =
        "developing-organization";

      organizationState =
        "candidate-context";

      interpretation =
        "Multiple physical observations indicate developing environmental organization.";
    } else if (
      organizationIndex >=
      1
    ) {
      classification =
        "limited-ocean-organization";

      organizationLevel =
        "limited-organization";

      organizationState =
        "limited-support";

      interpretation =
        "One or more physical signals suggest localized organization, but broader agreement remains limited.";
    }
  }

  const inheritedLimitations = [
    currentOrganization,
    currentPattern,
    currentShear,
    currentConvergence,
    currentEdge,
    temperature,
    surfaceWaterCharacter,
    waterMassAnalysis,
    mixingZoneAnalysis,
    environmentalTransitionAnalysis,
    oceanFrontAnalysis
  ].flatMap(
    contract =>
      Array.isArray(
        contract
          ?.limitations
      )
        ? contract
            .limitations
        : []
  );

  const limitations = [
    ...new Set([
      ...inheritedLimitations,

      "Ocean Organization Analysis synthesizes existing physical evidence and does not detect a new ocean feature.",

      "The organization index is a transparent evidence index, not confidence, habitat suitability, fishing quality, or probability.",

      "Higher-level boundary contracts may share upstream observations; the index describes corroborating contract support and must not be treated as fully independent statistical evidence.",

      "Temporal stability and persistence are not evaluated.",

      "No prey concentration, fish presence, habitat quality, species suitability, catch probability, or fishing recommendation is inferred."
    ])
  ];

  return {
    available,

    analysisType:
      "ocean-organization-analysis",

    classification,

    organizationLevel,

    organizationState,

    organizationIndex,

    organizationSignalCount,

    organizationDrivers,

    counterEvidence,

    evidence: {
      currentOrganizationAvailable,

      currentFieldUniform,

      currentVariationObserved,

      shearDetected,

      convergenceDetected,

      currentEdgeDetected,

      sufficientThermalCoverage,

      uniformThermalField,

      meaningfulThermalTransition,

      pronouncedThermalTransition,

      surfaceBoundaryContext,

      waterMassBoundaryContext,

      mixingInteractionContext,

      environmentalTransitionContext,

      oceanFrontCandidateContext,

      weightedSignals:
        weightedSignals.map(
          signal => ({
            driver:
              signal.driver,

            supported:
              signal.supported,

            weight:
              signal.weight
          })
        )
    },

    interpretation,

    limitations,

    upstreamContracts: [
      {
        engine:
          "current-organization-analysis",

        version:
          currentOrganization
            ?.thresholdVersion ??
          currentOrganization
            ?.contractVersion ??
          null
      },

      {
        engine:
          "current-shear-analysis",

        version:
          currentShear
            ?.contractVersion ??
          null
      },

      {
        engine:
          "current-convergence-analysis",

        version:
          currentConvergence
            ?.contractVersion ??
          null
      },

      {
        engine:
          "current-edge-analysis",

        version:
          currentEdge
            ?.contractVersion ??
          null
      },

      {
        engine:
          "surface-water-character-analysis",

        version:
          surfaceWaterCharacter
            ?.contractVersion ??
          null
      },

      {
        engine:
          "water-mass-analysis",

        version:
          waterMassAnalysis
            ?.contractVersion ??
          null
      },

      {
        engine:
          "mixing-zone-analysis",

        version:
          mixingZoneAnalysis
            ?.contractVersion ??
          null
      },

      {
        engine:
          "environmental-transition-analysis",

        version:
          environmentalTransitionAnalysis
            ?.contractVersion ??
          null
      },

      {
        engine:
          "ocean-front-analysis",

        version:
          oceanFrontAnalysis
            ?.contractVersion ??
          null
      }
    ],

    contractVersion:
      "pelora-ocean-organization-v1"
  };
}


/**
 * ------------------------------------------------------------
 * Observation Snapshot Contract v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Preserve an immutable copy of the governed observations,
 * evidence, physical-ocean contracts, organization, confidence,
 * data quality, and lineage available at one place and time.
 *
 * This contract does not compare observations, infer trends,
 * calculate persistence, create opportunity, perform biological
 * reasoning, or generate captain-facing language.
 */

function cloneSnapshotValue(
  value
) {
  if (
    value === undefined
  ) {
    return null;
  }

  return structuredClone(
    value
  );
}


function deepFreezeSnapshotValue(
  value
) {
  if (
    value === null ||
    typeof value !==
      "object" ||
    Object.isFrozen(
      value
    )
  ) {
    return value;
  }

  Object.freeze(
    value
  );

  for (
    const child of
    Object.values(
      value
    )
  ) {
    deepFreezeSnapshotValue(
      child
    );
  }

  return value;
}


export function buildObservationSnapshot({
  location = null,
  observedAt = null,
  generatedAt = null,
  observations = null,
  oceanEvidence = null,
  dataQuality = null
} = {}) {
  const latitude =
    Number.isFinite(
      location?.latitude
    )
      ? location.latitude
      : null;

  const longitude =
    Number.isFinite(
      location?.longitude
    )
      ? location.longitude
      : null;

  const validLocation =
    latitude !== null &&
    longitude !== null;

  const evidenceAvailable =
    oceanEvidence !== null &&
    typeof oceanEvidence ===
      "object" &&
    !Array.isArray(
      oceanEvidence
    );

  const available =
    validLocation &&
    evidenceAvailable;

  const groups =
    oceanEvidence
      ?.groups ??
    {};

  const oceanPhysics = {
    surfaceWaterCharacter:
      oceanEvidence
        ?.surfaceWaterCharacter ??
      null,

    waterMassAnalysis:
      oceanEvidence
        ?.waterMassAnalysis ??
      null,

    mixingZoneAnalysis:
      oceanEvidence
        ?.mixingZoneAnalysis ??
      null,

    environmentalTransitionAnalysis:
      oceanEvidence
        ?.environmentalTransitionAnalysis ??
      null,

    oceanFrontAnalysis:
      oceanEvidence
        ?.oceanFrontAnalysis ??
      null,

    explainability:
      oceanEvidence
        ?.oceanPhysicsExplainability ??
      null
  };

  const oceanOrganization =
    oceanEvidence
      ?.oceanOrganization ??
    null;

  const contractVersions = {
    oceanEvidence:
      oceanEvidence
        ?.methodVersion ??
      null,

    temperatureEvidence:
      groups
        ?.temperature
        ?.interpretation ??
      null,

    currentEvidence:
      groups
        ?.current
        ?.interpretation ??
      null,

    productivityEvidence:
      groups
        ?.productivity
        ?.interpretation ??
      null,

    clarityEvidence:
      groups
        ?.clarity
        ?.interpretation ??
      null,

    structureEvidence:
      groups
        ?.structure
        ?.methodVersion ??
      groups
        ?.structure
        ?.interpretation ??
      null,

    surfaceWaterCharacter:
      oceanPhysics
        .surfaceWaterCharacter
        ?.contractVersion ??
      null,

    waterMassAnalysis:
      oceanPhysics
        .waterMassAnalysis
        ?.contractVersion ??
      null,

    mixingZoneAnalysis:
      oceanPhysics
        .mixingZoneAnalysis
        ?.contractVersion ??
      null,

    environmentalTransitionAnalysis:
      oceanPhysics
        .environmentalTransitionAnalysis
        ?.contractVersion ??
      null,

    oceanFrontAnalysis:
      oceanPhysics
        .oceanFrontAnalysis
        ?.contractVersion ??
      null,

    oceanPhysicsExplainability:
      oceanPhysics
        .explainability
        ?.contractVersion ??
      null,

    oceanPhysicsExplainabilityLineage:
      oceanPhysics
        .explainability
        ?.lineage
        ?.methodVersion ??
      null,

    oceanOrganization:
      oceanOrganization
        ?.contractVersion ??
      null,

    oceanEvidenceLineage:
      oceanEvidence
        ?.lineage
        ?.methodVersion ??
      null,

    dataQuality:
      dataQuality
        ?.methodVersion ??
      null
  };

  const missingContractVersions =
    Object.entries(
      contractVersions
    )
      .filter(
        ([, version]) =>
          typeof version !==
            "string" ||
          version.trim().length ===
            0
      )
      .map(
        ([contract]) =>
          "contract-version-unavailable:" +
          contract
      );

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          oceanEvidence
            ?.limitations
        )
          ? oceanEvidence
              .limitations
          : []
      ),

      ...missingContractVersions,

      ...(
        validLocation
          ? []
          : [
              "snapshot-location-unavailable"
            ]
      ),

      ...(
        evidenceAvailable
          ? []
          : [
              "ocean-evidence-unavailable"
            ]
      ),

      "Observation Snapshot preserves governed inputs without modifying their scientific meaning.",

      "This contract does not create snapshot identity or storage metadata.",

      "This contract does not compare observations, calculate persistence, infer trends, create opportunity, perform biological reasoning, or generate captain guidance."
    ])
  ];

  const snapshot = {
    available,

    snapshotType:
      "observation",

    responsibility:
      "preserve",

    location: {
      latitude,

      longitude,

      name:
        typeof location?.name ===
          "string"
          ? location.name
          : null
    },

    observedAt:
      typeof observedAt ===
        "string"
        ? observedAt
        : null,

    generatedAt:
      typeof generatedAt ===
        "string"
        ? generatedAt
        : null,

    observations:
      cloneSnapshotValue(
        observations ?? {}
      ),

    evidence: {
      summary:
        cloneSnapshotValue(
          oceanEvidence
            ?.summary ??
          null
        ),

      groups:
        cloneSnapshotValue(
          groups
        )
    },

    oceanPhysics:
      cloneSnapshotValue(
        oceanPhysics
      ),

    oceanOrganization:
      cloneSnapshotValue(
        oceanOrganization
      ),

    confidence:
      cloneSnapshotValue(
        oceanEvidence
          ?.confidence ??
        null
      ),

    dataQuality:
      cloneSnapshotValue(
        dataQuality
      ),

    lineage: {
      oceanEvidence:
        cloneSnapshotValue(
          oceanEvidence
            ?.lineage ??
          null
        ),

      oceanPhysicsExplainability:
        cloneSnapshotValue(
          oceanPhysics
            .explainability
            ?.lineage ??
          null
        )
    },

    contractVersions:
      cloneSnapshotValue(
        contractVersions
      ),

    limitations,

    contractVersion:
      "pelora-observation-snapshot-v1"
  };

  return deepFreezeSnapshotValue(
    snapshot
  );
}


/**
 * ------------------------------------------------------------
 * Intelligence Snapshot Contract v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Preserve an immutable copy of Pelora's governed,
 * species-neutral scientific interpretations at one place and
 * time.
 *
 * This contract preserves existing outputs only. It does not
 * create opportunity, alter confidence, compare snapshots,
 * calculate persistence, perform species reasoning, or generate
 * captain-facing language.
 */
export function buildIntelligenceSnapshot({
  observedAt = null,
  generatedAt = null,
  oceanOpportunity = null,
  relationshipContext = null,
  relationshipAssessment = null,
  oceanPhysicsExplainability = null,
  oceanOrganization = null
} = {}) {
  const opportunityAvailable =
    oceanOpportunity !== null &&
    typeof oceanOpportunity ===
      "object" &&
    !Array.isArray(
      oceanOpportunity
    );

  const relationshipContextAvailable =
    relationshipContext !== null &&
    typeof relationshipContext ===
      "object" &&
    !Array.isArray(
      relationshipContext
    );

  const relationshipAssessmentAvailable =
    relationshipAssessment !== null &&
    typeof relationshipAssessment ===
      "object" &&
    !Array.isArray(
      relationshipAssessment
    );

  const explainabilityAvailable =
    oceanPhysicsExplainability !== null &&
    typeof oceanPhysicsExplainability ===
      "object" &&
    !Array.isArray(
      oceanPhysicsExplainability
    );

  const organizationAvailable =
    oceanOrganization !== null &&
    typeof oceanOrganization ===
      "object" &&
    !Array.isArray(
      oceanOrganization
    );

  const available =
    opportunityAvailable ||
    relationshipContextAvailable ||
    relationshipAssessmentAvailable ||
    explainabilityAvailable ||
    organizationAvailable;

  const contractVersions = {
    oceanOpportunity:
      oceanOpportunity
        ?.methodVersion ??
      oceanOpportunity
        ?.contractVersion ??
      null,

    oceanOpportunityLineage:
      oceanOpportunity
        ?.lineage
        ?.methodVersion ??
      null,

    relationshipContext:
      relationshipContext
        ?.methodVersion ??
      relationshipContext
        ?.contractVersion ??
      null,

    relationshipContextLineage:
      relationshipContext
        ?.lineage
        ?.methodVersion ??
      null,

    relationshipAssessment:
      relationshipAssessment
        ?.methodVersion ??
      relationshipAssessment
        ?.contractVersion ??
      null,

    relationshipAssessmentLineage:
      relationshipAssessment
        ?.lineage
        ?.methodVersion ??
      null,

    oceanPhysicsExplainability:
      oceanPhysicsExplainability
        ?.contractVersion ??
      null,

    oceanPhysicsExplainabilityLineage:
      oceanPhysicsExplainability
        ?.lineage
        ?.methodVersion ??
      null,

    oceanOrganization:
      oceanOrganization
        ?.contractVersion ??
      null
  };

  const missingContractVersions =
    Object.entries(
      contractVersions
    )
      .filter(
        ([, version]) =>
          typeof version !==
            "string" ||
          version.trim().length ===
            0
      )
      .map(
        ([contract]) =>
          "contract-version-unavailable:" +
          contract
      );

  const inheritedLimitations = [
    oceanOpportunity,
    relationshipContext,
    relationshipAssessment,
    oceanPhysicsExplainability,
    oceanOrganization
  ].flatMap(
    contract =>
      Array.isArray(
        contract
          ?.limitations
      )
        ? contract
            .limitations
        : []
  );

  const limitations = [
    ...new Set([
      ...inheritedLimitations,

      ...missingContractVersions,

      ...(
        opportunityAvailable
          ? []
          : [
              "ocean-opportunity-unavailable"
            ]
      ),

      ...(
        relationshipContextAvailable
          ? []
          : [
              "relationship-context-unavailable"
            ]
      ),

      ...(
        relationshipAssessmentAvailable
          ? []
          : [
              "relationship-assessment-unavailable"
            ]
      ),

      "Intelligence Snapshot preserves governed scientific interpretations without modifying their meaning.",

      "This contract does not preserve raw observations or duplicate Ocean Evidence groups.",

      "This contract does not compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    ])
  ];

  const snapshot = {
    available,

    snapshotType:
      "intelligence",

    responsibility:
      "preserve",

    observedAt:
      typeof observedAt ===
        "string"
        ? observedAt
        : null,

    generatedAt:
      typeof generatedAt ===
        "string"
        ? generatedAt
        : null,

    oceanOpportunity:
      cloneSnapshotValue(
        oceanOpportunity
      ),

    relationshipContext:
      cloneSnapshotValue(
        relationshipContext
      ),

    relationshipAssessment:
      cloneSnapshotValue(
        relationshipAssessment
      ),

    oceanPhysicsExplainability:
      cloneSnapshotValue(
        oceanPhysicsExplainability
      ),

    oceanOrganization:
      cloneSnapshotValue(
        oceanOrganization
      ),

    lineage: {
      oceanOpportunity:
        cloneSnapshotValue(
          oceanOpportunity
            ?.lineage ??
          null
        ),

      relationshipContext:
        cloneSnapshotValue(
          relationshipContext
            ?.lineage ??
          null
        ),

      relationshipAssessment:
        cloneSnapshotValue(
          relationshipAssessment
            ?.lineage ??
          null
        ),

      oceanPhysicsExplainability:
        cloneSnapshotValue(
          oceanPhysicsExplainability
            ?.lineage ??
          null
        )
    },

    contractVersions:
      cloneSnapshotValue(
        contractVersions
      ),

    limitations,

    contractVersion:
      "pelora-intelligence-snapshot-v1"
  };

  return deepFreezeSnapshotValue(
    snapshot
  );
}


/**
 * ------------------------------------------------------------
 * Ocean Change Analysis v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Compare two governed Pelora snapshot pairs and describe
 * measurable differences between them.
 *
 * This contract does not modify either snapshot, create new
 * observations, calculate persistence, infer a long-term trend,
 * estimate opportunity quality, perform species reasoning, or
 * generate captain-facing guidance.
 */

function angularDifferenceDegrees(
  firstDirection,
  secondDirection
) {
  if (
    !Number.isFinite(
      firstDirection
    ) ||
    !Number.isFinite(
      secondDirection
    )
  ) {
    return null;
  }

  const rawDifference =
    Math.abs(
      secondDirection -
      firstDirection
    ) %
    360;

  return Math.min(
    rawDifference,
    360 -
      rawDifference
  );
}


function snapshotTimestampMilliseconds(
  snapshot
) {
  const timestamp =
    snapshot
      ?.observedAt ??
    snapshot
      ?.generatedAt ??
    null;

  if (
    typeof timestamp !==
    "string"
  ) {
    return null;
  }

  const parsed =
    Date.parse(
      timestamp
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : null;
}


export function buildOceanChangeAnalysis({
  previousObservationSnapshot = null,
  currentObservationSnapshot = null,
  previousIntelligenceSnapshot = null,
  currentIntelligenceSnapshot = null
} = {}) {
  const previousObservationAvailable =
    previousObservationSnapshot
      ?.available ===
    true;

  const currentObservationAvailable =
    currentObservationSnapshot
      ?.available ===
    true;

  const previousIntelligenceAvailable =
    previousIntelligenceSnapshot
      ?.available ===
    true;

  const currentIntelligenceAvailable =
    currentIntelligenceSnapshot
      ?.available ===
    true;

  const previousTimestampMilliseconds =
    snapshotTimestampMilliseconds(
      previousObservationSnapshot ??
      previousIntelligenceSnapshot
    );

  const currentTimestampMilliseconds =
    snapshotTimestampMilliseconds(
      currentObservationSnapshot ??
      currentIntelligenceSnapshot
    );

  const timestampsAvailable =
    Number.isFinite(
      previousTimestampMilliseconds
    ) &&
    Number.isFinite(
      currentTimestampMilliseconds
    );

  const chronologicalOrderValid =
    timestampsAvailable &&
    currentTimestampMilliseconds >
      previousTimestampMilliseconds;

  const durationHours =
    chronologicalOrderValid
      ? (
          currentTimestampMilliseconds -
          previousTimestampMilliseconds
        ) /
        3600000
      : null;

  const previousLocation =
    previousObservationSnapshot
      ?.location ??
    null;

  const currentLocation =
    currentObservationSnapshot
      ?.location ??
    null;

  const locationDifferenceLatitude =
    Number.isFinite(
      previousLocation
        ?.latitude
    ) &&
    Number.isFinite(
      currentLocation
        ?.latitude
    )
      ? Math.abs(
          currentLocation.latitude -
          previousLocation.latitude
        )
      : null;

  const locationDifferenceLongitude =
    Number.isFinite(
      previousLocation
        ?.longitude
    ) &&
    Number.isFinite(
      currentLocation
        ?.longitude
    )
      ? Math.abs(
          currentLocation.longitude -
          previousLocation.longitude
        )
      : null;

  /*
   * v1 requires effectively identical snapshot coordinates.
   * Movement-aware feature comparison belongs to a later engine.
   */
  const comparableLocation =
    Number.isFinite(
      locationDifferenceLatitude
    ) &&
    Number.isFinite(
      locationDifferenceLongitude
    ) &&
    locationDifferenceLatitude <=
      0.0001 &&
    locationDifferenceLongitude <=
      0.0001;

  const previousCurrent =
    previousObservationSnapshot
      ?.observations
      ?.currents ??
    null;

  const currentCurrent =
    currentObservationSnapshot
      ?.observations
      ?.currents ??
    null;

  const previousCurrentSpeedKnots =
    Number.isFinite(
      previousCurrent
        ?.speedKnots
    )
      ? previousCurrent.speedKnots
      : null;

  const currentCurrentSpeedKnots =
    Number.isFinite(
      currentCurrent
        ?.speedKnots
    )
      ? currentCurrent.speedKnots
      : null;

  const currentSpeedChangeKnots =
    previousCurrentSpeedKnots !==
      null &&
    currentCurrentSpeedKnots !==
      null
      ? currentCurrentSpeedKnots -
        previousCurrentSpeedKnots
      : null;

  const currentDirectionChangeDegrees =
    angularDifferenceDegrees(
      previousCurrent
        ?.directionDegrees,
      currentCurrent
        ?.directionDegrees
    );

  const previousTemperatureFahrenheit =
    Number.isFinite(
      previousObservationSnapshot
        ?.observations
        ?.sst
        ?.temperatureFahrenheit
    )
      ? previousObservationSnapshot
          .observations
          .sst
          .temperatureFahrenheit
      : null;

  const currentTemperatureFahrenheit =
    Number.isFinite(
      currentObservationSnapshot
        ?.observations
        ?.sst
        ?.temperatureFahrenheit
    )
      ? currentObservationSnapshot
          .observations
          .sst
          .temperatureFahrenheit
      : null;

  const temperatureChangeFahrenheit =
    previousTemperatureFahrenheit !==
      null &&
    currentTemperatureFahrenheit !==
      null
      ? currentTemperatureFahrenheit -
        previousTemperatureFahrenheit
      : null;

  const previousOrganization =
    previousIntelligenceSnapshot
      ?.oceanOrganization ??
    previousObservationSnapshot
      ?.oceanOrganization ??
    null;

  const currentOrganization =
    currentIntelligenceSnapshot
      ?.oceanOrganization ??
    currentObservationSnapshot
      ?.oceanOrganization ??
    null;

  const previousOrganizationIndex =
    Number.isFinite(
      previousOrganization
        ?.organizationIndex
    )
      ? previousOrganization
          .organizationIndex
      : null;

  const currentOrganizationIndex =
    Number.isFinite(
      currentOrganization
        ?.organizationIndex
    )
      ? currentOrganization
          .organizationIndex
      : null;

  const organizationIndexChange =
    previousOrganizationIndex !==
      null &&
    currentOrganizationIndex !==
      null
      ? currentOrganizationIndex -
        previousOrganizationIndex
      : null;

  const previousOrganizationLevel =
    previousOrganization
      ?.organizationLevel ??
    null;

  const currentOrganizationLevel =
    currentOrganization
      ?.organizationLevel ??
    null;

  const previousOceanFrontClassification =
    previousObservationSnapshot
      ?.oceanPhysics
      ?.oceanFrontAnalysis
      ?.classification ??
    null;

  const currentOceanFrontClassification =
    currentObservationSnapshot
      ?.oceanPhysics
      ?.oceanFrontAnalysis
      ?.classification ??
    null;

  const previousPathway =
    previousIntelligenceSnapshot
      ?.oceanOpportunity
      ?.pathwayClassification
      ?.classification ??
    null;

  const currentPathway =
    currentIntelligenceSnapshot
      ?.oceanOpportunity
      ?.pathwayClassification
      ?.classification ??
    null;

  const changes = [];

  if (
    Number.isFinite(
      currentSpeedChangeKnots
    ) &&
    Math.abs(
      currentSpeedChangeKnots
    ) >=
      0.1
  ) {
    changes.push({
      dimension:
        "current-speed",

      state:
        currentSpeedChangeKnots >
        0
          ? "increased"
          : "decreased",

      previousValue:
        previousCurrentSpeedKnots,

      currentValue:
        currentCurrentSpeedKnots,

      difference:
        currentSpeedChangeKnots,

      units:
        "knots"
    });
  }

  if (
    Number.isFinite(
      currentDirectionChangeDegrees
    ) &&
    currentDirectionChangeDegrees >=
      10
  ) {
    changes.push({
      dimension:
        "current-direction",

      state:
        "shifted",

      previousValue:
        previousCurrent
          ?.directionDegrees ??
        null,

      currentValue:
        currentCurrent
          ?.directionDegrees ??
        null,

      difference:
        currentDirectionChangeDegrees,

      units:
        "degrees"
    });
  }

  if (
    Number.isFinite(
      temperatureChangeFahrenheit
    ) &&
    Math.abs(
      temperatureChangeFahrenheit
    ) >=
      0.2
  ) {
    changes.push({
      dimension:
        "surface-temperature",

      state:
        temperatureChangeFahrenheit >
        0
          ? "increased"
          : "decreased",

      previousValue:
        previousTemperatureFahrenheit,

      currentValue:
        currentTemperatureFahrenheit,

      difference:
        temperatureChangeFahrenheit,

      units:
        "degrees-fahrenheit"
    });
  }

  if (
    Number.isFinite(
      organizationIndexChange
    ) &&
    organizationIndexChange !==
      0
  ) {
    changes.push({
      dimension:
        "ocean-organization-index",

      state:
        organizationIndexChange >
        0
          ? "increased"
          : "decreased",

      previousValue:
        previousOrganizationIndex,

      currentValue:
        currentOrganizationIndex,

      difference:
        organizationIndexChange,

      units:
        "organization-index"
    });
  }

  if (
    typeof previousOrganizationLevel ===
      "string" &&
    typeof currentOrganizationLevel ===
      "string" &&
    previousOrganizationLevel !==
      currentOrganizationLevel
  ) {
    changes.push({
      dimension:
        "ocean-organization-level",

      state:
        "changed",

      previousValue:
        previousOrganizationLevel,

      currentValue:
        currentOrganizationLevel,

      difference:
        null,

      units:
        null
    });
  }

  if (
    typeof previousOceanFrontClassification ===
      "string" &&
    typeof currentOceanFrontClassification ===
      "string" &&
    previousOceanFrontClassification !==
      currentOceanFrontClassification
  ) {
    changes.push({
      dimension:
        "ocean-front-context",

      state:
        "changed",

      previousValue:
        previousOceanFrontClassification,

      currentValue:
        currentOceanFrontClassification,

      difference:
        null,

      units:
        null
    });
  }

  if (
    typeof previousPathway ===
      "string" &&
    typeof currentPathway ===
      "string" &&
    previousPathway !==
      currentPathway
  ) {
    changes.push({
      dimension:
        "opportunity-pathway",

      state:
        "changed",

      previousValue:
        previousPathway,

      currentValue:
        currentPathway,

      difference:
        null,

      units:
        null
    });
  }

  const available =
    previousObservationAvailable &&
    currentObservationAvailable &&
    chronologicalOrderValid &&
    comparableLocation;

  let changeState =
    "insufficient-comparison-evidence";

  let changeClassification =
    "unavailable";

  let interpretation =
    "Ocean change cannot be evaluated from the supplied snapshots.";

  if (available) {
    if (
      changes.length ===
      0
    ) {
      changeState =
        "no-meaningful-change-detected";

      changeClassification =
        "stable-between-two-observations";

      interpretation =
        "No measured difference exceeded the governed v1 change thresholds between these two snapshots.";
    } else {
      changeState =
        "change-detected";

      changeClassification =
        "measurable-ocean-change";

      interpretation =
        "One or more governed ocean-state dimensions changed between the two supplied snapshots.";
    }
  }

  const missingRequirements = [
    !previousObservationAvailable
      ? "previous-observation-snapshot"
      : null,

    !currentObservationAvailable
      ? "current-observation-snapshot"
      : null,

    !timestampsAvailable
      ? "comparable-observation-timestamps"
      : null,

    timestampsAvailable &&
    !chronologicalOrderValid
      ? "current-snapshot-must-follow-previous-snapshot"
      : null,

    previousObservationAvailable &&
    currentObservationAvailable &&
    !comparableLocation
      ? "matching-snapshot-location"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          previousObservationSnapshot
            ?.limitations
        )
          ? previousObservationSnapshot
              .limitations
          : []
      ),

      ...(
        Array.isArray(
          currentObservationSnapshot
            ?.limitations
        )
          ? currentObservationSnapshot
              .limitations
          : []
      ),

      ...(
        Array.isArray(
          previousIntelligenceSnapshot
            ?.limitations
        )
          ? previousIntelligenceSnapshot
              .limitations
          : []
      ),

      ...(
        Array.isArray(
          currentIntelligenceSnapshot
            ?.limitations
        )
          ? currentIntelligenceSnapshot
              .limitations
          : []
      ),

      ...missingRequirements,

      "Ocean Change Analysis compares exactly two governed snapshot states.",

      "A two-snapshot comparison does not establish persistence, a long-term trend, a feature lifecycle, or forecast continuity.",

      "Snapshot locations must match within the governed v1 coordinate tolerance.",

      "Classification changes describe contract differences and do not independently confirm physical feature formation or dissipation.",

      "No prey concentration, fish presence, habitat quality, species suitability, fishing quality, catch probability, or captain recommendation is inferred."
    ])
  ];

  const result = {
    available,

    analysisType:
      "ocean-change-analysis",

    responsibility:
      "compare",

    changeClassification,

    changeState,

    meaningfulChangeDetected:
      available &&
      changes.length >
        0,

    comparison: {
      previousObservedAt:
        previousObservationSnapshot
          ?.observedAt ??
        previousIntelligenceSnapshot
          ?.observedAt ??
        null,

      currentObservedAt:
        currentObservationSnapshot
          ?.observedAt ??
        currentIntelligenceSnapshot
          ?.observedAt ??
        null,

      durationHours,

      comparableLocation,

      locationToleranceDegrees:
        0.0001,

      previousLocation:
        cloneSnapshotValue(
          previousLocation
        ),

      currentLocation:
        cloneSnapshotValue(
          currentLocation
        )
    },

    changes:
      cloneSnapshotValue(
        changes
      ),

    evidence: {
      previousObservationAvailable,

      currentObservationAvailable,

      previousIntelligenceAvailable,

      currentIntelligenceAvailable,

      timestampsAvailable,

      chronologicalOrderValid,

      comparableLocation,

      currentSpeedChangeKnots,

      currentDirectionChangeDegrees,

      temperatureChangeFahrenheit,

      organizationIndexChange,

      previousOrganizationLevel,

      currentOrganizationLevel,

      previousOceanFrontClassification,

      currentOceanFrontClassification,

      previousPathway,

      currentPathway
    },

    missingRequirements,

    interpretation,

    limitations,

    upstreamContracts: {
      previousObservationSnapshot:
        previousObservationSnapshot
          ?.contractVersion ??
        null,

      currentObservationSnapshot:
        currentObservationSnapshot
          ?.contractVersion ??
        null,

      previousIntelligenceSnapshot:
        previousIntelligenceSnapshot
          ?.contractVersion ??
        null,

      currentIntelligenceSnapshot:
        currentIntelligenceSnapshot
          ?.contractVersion ??
        null
    },

    contractVersion:
      "pelora-ocean-change-analysis-v1"
  };

  return deepFreezeSnapshotValue(
    result
  );
}


/**
 * ------------------------------------------------------------
 * Snapshot Metadata Contract v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Provide the authoritative identity, provenance, timestamps,
 * availability, lifecycle state, version manifest, and lineage
 * references for one canonical Pelora Ocean Memory Snapshot.
 *
 * Snapshot Metadata performs no scientific reasoning and does
 * not modify the Observation Snapshot or Intelligence Snapshot.
 */

function normalizeSnapshotIdentityPart(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "unavailable";
  }

  return String(
    value
  )
    .trim()
    .toLowerCase();
}


function deterministicSnapshotHash(
  value
) {
  let hash =
    2166136261;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash ^=
      value.charCodeAt(
        index
      );

    hash =
      Math.imul(
        hash,
        16777619
      );
  }

  return (
    hash >>>
    0
  )
    .toString(
      16
    )
    .padStart(
      8,
      "0"
    );
}


export function buildSnapshotMetadata({
  observationSnapshot = null,
  intelligenceSnapshot = null,
  captureMode = "live",
  sourceType = "live-observation",
  lifecycleState = "live",
  reconstructionStatus = "not-applicable",
  region = null,
  subregion = null,
  locationId = null
} = {}) {
  const observationSnapshotAvailable =
    observationSnapshot
      ?.available ===
    true;

  const intelligenceSnapshotAvailable =
    intelligenceSnapshot
      ?.available ===
    true;

  const observedAt =
    observationSnapshot
      ?.observedAt ??
    intelligenceSnapshot
      ?.observedAt ??
    null;

  const generatedAt =
    observationSnapshot
      ?.generatedAt ??
    intelligenceSnapshot
      ?.generatedAt ??
    null;

  const latitude =
    Number.isFinite(
      observationSnapshot
        ?.location
        ?.latitude
    )
      ? observationSnapshot
          .location
          .latitude
      : null;

  const longitude =
    Number.isFinite(
      observationSnapshot
        ?.location
        ?.longitude
    )
      ? observationSnapshot
          .location
          .longitude
      : null;

  const locationName =
    typeof observationSnapshot
      ?.location
      ?.name ===
      "string"
      ? observationSnapshot
          .location
          .name
      : null;

  const validLocation =
    latitude !==
      null &&
    longitude !==
      null;

  const validObservedAt =
    typeof observedAt ===
      "string" &&
    Number.isFinite(
      Date.parse(
        observedAt
      )
    );

  const validGeneratedAt =
    typeof generatedAt ===
      "string" &&
    Number.isFinite(
      Date.parse(
        generatedAt
      )
    );

  const normalizedCaptureMode =
    [
      "live",
      "historical-backfill",
      "reprocessed",
      "simulation"
    ].includes(
      captureMode
    )
      ? captureMode
      : "unknown";

  const normalizedLifecycleState =
    [
      "live",
      "historical-backfill",
      "reprocessed",
      "archived",
      "deprecated"
    ].includes(
      lifecycleState
    )
      ? lifecycleState
      : "unknown";

  const historicalBackfill =
    normalizedCaptureMode ===
      "historical-backfill";

  const snapshotSchemaVersion =
    "pelora-ocean-memory-snapshot-schema-v1";

  const identityBasis = [
    snapshotSchemaVersion,
    normalizeSnapshotIdentityPart(
      latitude
    ),
    normalizeSnapshotIdentityPart(
      longitude
    ),
    normalizeSnapshotIdentityPart(
      observedAt
    ),
    normalizeSnapshotIdentityPart(
      normalizedCaptureMode
    )
  ].join(
    "|"
  );

  const snapshotId =
    "pelora-snapshot-" +
    deterministicSnapshotHash(
      identityBasis
    );

  const engineVersions = {
    oceanEvidence:
      observationSnapshot
        ?.contractVersions
        ?.oceanEvidence ??
      null,

    surfaceWaterCharacter:
      observationSnapshot
        ?.contractVersions
        ?.surfaceWaterCharacter ??
      null,

    waterMassAnalysis:
      observationSnapshot
        ?.contractVersions
        ?.waterMassAnalysis ??
      null,

    mixingZoneAnalysis:
      observationSnapshot
        ?.contractVersions
        ?.mixingZoneAnalysis ??
      null,

    environmentalTransitionAnalysis:
      observationSnapshot
        ?.contractVersions
        ?.environmentalTransitionAnalysis ??
      null,

    oceanFrontAnalysis:
      observationSnapshot
        ?.contractVersions
        ?.oceanFrontAnalysis ??
      null,

    oceanPhysicsExplainability:
      observationSnapshot
        ?.contractVersions
        ?.oceanPhysicsExplainability ??
      intelligenceSnapshot
        ?.contractVersions
        ?.oceanPhysicsExplainability ??
      null,

    oceanOrganization:
      observationSnapshot
        ?.contractVersions
        ?.oceanOrganization ??
      intelligenceSnapshot
        ?.contractVersions
        ?.oceanOrganization ??
      null,

    oceanOpportunity:
      intelligenceSnapshot
        ?.contractVersions
        ?.oceanOpportunity ??
      null,

    relationshipContext:
      intelligenceSnapshot
        ?.contractVersions
        ?.relationshipContext ??
      null,

    relationshipAssessment:
      intelligenceSnapshot
        ?.contractVersions
        ?.relationshipAssessment ??
      null,

    dataQuality:
      observationSnapshot
        ?.contractVersions
        ?.dataQuality ??
      null
  };

  const contractVersions = {
    observationSnapshot:
      observationSnapshot
        ?.contractVersion ??
      null,

    intelligenceSnapshot:
      intelligenceSnapshot
        ?.contractVersion ??
      null,

    oceanEvidenceLineage:
      observationSnapshot
        ?.contractVersions
        ?.oceanEvidenceLineage ??
      null,

    oceanPhysicsExplainabilityLineage:
      observationSnapshot
        ?.contractVersions
        ?.oceanPhysicsExplainabilityLineage ??
      intelligenceSnapshot
        ?.contractVersions
        ?.oceanPhysicsExplainabilityLineage ??
      null,

    oceanOpportunityLineage:
      intelligenceSnapshot
        ?.contractVersions
        ?.oceanOpportunityLineage ??
      null,

    relationshipContextLineage:
      intelligenceSnapshot
        ?.contractVersions
        ?.relationshipContextLineage ??
      null,

    relationshipAssessmentLineage:
      intelligenceSnapshot
        ?.contractVersions
        ?.relationshipAssessmentLineage ??
      null,

    snapshotMetadata:
      "pelora-snapshot-metadata-v1"
  };

  const versionManifest = {
    engineVersions:
      cloneSnapshotValue(
        engineVersions
      ),

    contractVersions:
      cloneSnapshotValue(
        contractVersions
      ),

    snapshotSchemaVersion,

    manifestVersion:
      "pelora-version-manifest-v1"
  };

  const availableContractCount =
    [
      observationSnapshotAvailable,
      intelligenceSnapshotAvailable
    ].filter(Boolean).length;

  let availabilityClassification =
    "unavailable";

  if (
    availableContractCount ===
    2
  ) {
    availabilityClassification =
      "complete";
  } else if (
    availableContractCount ===
    1
  ) {
    availabilityClassification =
      "partial";
  }

  const available =
    validLocation &&
    validObservedAt &&
    observationSnapshotAvailable;

  const missingRequirements = [
    !observationSnapshotAvailable
      ? "observation-snapshot"
      : null,

    !intelligenceSnapshotAvailable
      ? "intelligence-snapshot"
      : null,

    !validLocation
      ? "snapshot-location"
      : null,

    !validObservedAt
      ? "valid-observed-at"
      : null,

    !validGeneratedAt
      ? "valid-generated-at"
      : null
  ].filter(Boolean);

  const missingEngineVersions =
    Object.entries(
      engineVersions
    )
      .filter(
        ([, version]) =>
          typeof version !==
            "string" ||
          version.trim().length ===
            0
      )
      .map(
        ([engine]) =>
          "engine-version-unavailable:" +
          engine
      );

  const missingContractVersions =
    Object.entries(
      contractVersions
    )
      .filter(
        ([, version]) =>
          typeof version !==
            "string" ||
          version.trim().length ===
            0
      )
      .map(
        ([contract]) =>
          "contract-version-unavailable:" +
          contract
      );

  const limitations = [
    ...new Set([
      ...missingRequirements,
      ...missingEngineVersions,
      ...missingContractVersions,

      "Snapshot Metadata identifies and documents a snapshot but does not modify preserved observations or intelligence.",

      "The deterministic snapshot ID is based on location, observed time, capture mode, and snapshot schema version.",

      "Snapshot Metadata does not evaluate scientific evidence, compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    ])
  ];

  const metadata = {
    available,

    metadataType:
      "snapshot-metadata",

    responsibility:
      "preserve",

    identity: {
      snapshotId,

      snapshotSchemaVersion,

      identityStrategy:
        "deterministic-location-time-capture-schema-v1"
    },

    time: {
      observedAt:
        validObservedAt
          ? observedAt
          : null,

      generatedAt:
        validGeneratedAt
          ? generatedAt
          : null
    },

    location: {
      latitude,

      longitude,

      name:
        locationName,

      region:
        typeof region ===
          "string"
          ? region
          : null,

      subregion:
        typeof subregion ===
          "string"
          ? subregion
          : null,

      locationId:
        typeof locationId ===
          "string"
          ? locationId
          : null
    },

    provenance: {
      captureMode:
        normalizedCaptureMode,

      sourceType:
        typeof sourceType ===
          "string"
          ? sourceType
          : "unknown",

      historicalBackfill,

      reconstructionStatus:
        typeof reconstructionStatus ===
          "string"
          ? reconstructionStatus
          : "unknown"
    },

    availability: {
      classification:
        availabilityClassification,

      observationSnapshotAvailable,

      intelligenceSnapshotAvailable,

      validLocation,

      validObservedAt,

      validGeneratedAt
    },

    versionManifest:
      cloneSnapshotValue(
        versionManifest
      ),

    lineageReferences: {
      observationSnapshot:
        cloneSnapshotValue(
          observationSnapshot
            ?.lineage ??
          null
        ),

      intelligenceSnapshot:
        cloneSnapshotValue(
          intelligenceSnapshot
            ?.lineage ??
          null
        )
    },

    lifecycleState:
      normalizedLifecycleState,

    missingRequirements,

    limitations,

    contractVersion:
      "pelora-snapshot-metadata-v1"
  };

  return deepFreezeSnapshotValue(
    metadata
  );
}


/**
 * ------------------------------------------------------------
 * Ocean Snapshot Assembly v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Compose Snapshot Metadata, Observation Snapshot, and
 * Intelligence Snapshot into one immutable canonical Ocean
 * Memory record.
 *
 * This contract does not alter, recompute, compare, persist,
 * interpret, score, or summarize any contained contract.
 */
export function buildOceanSnapshot({
  snapshotMetadata = null,
  observationSnapshot = null,
  intelligenceSnapshot = null
} = {}) {
  const metadataAvailable =
    snapshotMetadata
      ?.available ===
    true;

  const observationSnapshotAvailable =
    observationSnapshot
      ?.available ===
    true;

  const intelligenceSnapshotAvailable =
    intelligenceSnapshot
      ?.available ===
    true;

  const snapshotId =
    snapshotMetadata
      ?.identity
      ?.snapshotId ??
    null;

  const snapshotSchemaVersion =
    snapshotMetadata
      ?.identity
      ?.snapshotSchemaVersion ??
    snapshotMetadata
      ?.versionManifest
      ?.snapshotSchemaVersion ??
    null;

  const metadataObservedAt =
    snapshotMetadata
      ?.time
      ?.observedAt ??
    null;

  const observationObservedAt =
    observationSnapshot
      ?.observedAt ??
    null;

  const intelligenceObservedAt =
    intelligenceSnapshot
      ?.observedAt ??
    null;

  const metadataGeneratedAt =
    snapshotMetadata
      ?.time
      ?.generatedAt ??
    null;

  const observationGeneratedAt =
    observationSnapshot
      ?.generatedAt ??
    null;

  const intelligenceGeneratedAt =
    intelligenceSnapshot
      ?.generatedAt ??
    null;

  const observedAtValues =
    [
      metadataObservedAt,
      observationObservedAt,
      intelligenceObservedAt
    ].filter(
      value =>
        typeof value ===
          "string"
    );

  const generatedAtValues =
    [
      metadataGeneratedAt,
      observationGeneratedAt,
      intelligenceGeneratedAt
    ].filter(
      value =>
        typeof value ===
          "string"
    );

  const observedAtConsistent =
    observedAtValues.length >
      0 &&
    new Set(
      observedAtValues
    ).size ===
      1;

  const generatedAtConsistent =
    generatedAtValues.length >
      0 &&
    new Set(
      generatedAtValues
    ).size ===
      1;

  const metadataObservationContractVersion =
    snapshotMetadata
      ?.versionManifest
      ?.contractVersions
      ?.observationSnapshot ??
    null;

  const metadataIntelligenceContractVersion =
    snapshotMetadata
      ?.versionManifest
      ?.contractVersions
      ?.intelligenceSnapshot ??
    null;

  const observationContractVersion =
    observationSnapshot
      ?.contractVersion ??
    null;

  const intelligenceContractVersion =
    intelligenceSnapshot
      ?.contractVersion ??
    null;

  const observationContractConsistent =
    typeof observationContractVersion ===
      "string" &&
    metadataObservationContractVersion ===
      observationContractVersion;

  const intelligenceContractConsistent =
    typeof intelligenceContractVersion ===
      "string" &&
    metadataIntelligenceContractVersion ===
      intelligenceContractVersion;

  const requiredContractsAvailable =
    metadataAvailable &&
    observationSnapshotAvailable;

  const available =
    requiredContractsAvailable &&
    typeof snapshotId ===
      "string" &&
    snapshotId.trim().length >
      0 &&
    typeof snapshotSchemaVersion ===
      "string" &&
    snapshotSchemaVersion.trim().length >
      0 &&
    observedAtConsistent &&
    generatedAtConsistent &&
    observationContractConsistent &&
    (
      !intelligenceSnapshotAvailable ||
      intelligenceContractConsistent
    );

  const missingRequirements = [
    !metadataAvailable
      ? "snapshot-metadata"
      : null,

    !observationSnapshotAvailable
      ? "observation-snapshot"
      : null,

    !intelligenceSnapshotAvailable
      ? "intelligence-snapshot"
      : null,

    typeof snapshotId !==
      "string" ||
    snapshotId.trim().length ===
      0
      ? "snapshot-id"
      : null,

    typeof snapshotSchemaVersion !==
      "string" ||
    snapshotSchemaVersion.trim().length ===
      0
      ? "snapshot-schema-version"
      : null,

    !observedAtConsistent
      ? "consistent-observed-at"
      : null,

    !generatedAtConsistent
      ? "consistent-generated-at"
      : null,

    !observationContractConsistent
      ? "observation-contract-version-consistency"
      : null,

    intelligenceSnapshotAvailable &&
    !intelligenceContractConsistent
      ? "intelligence-contract-version-consistency"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          snapshotMetadata
            ?.limitations
        )
          ? snapshotMetadata
              .limitations
          : []
      ),

      ...(
        Array.isArray(
          observationSnapshot
            ?.limitations
        )
          ? observationSnapshot
              .limitations
          : []
      ),

      ...(
        Array.isArray(
          intelligenceSnapshot
            ?.limitations
        )
          ? intelligenceSnapshot
              .limitations
          : []
      ),

      ...missingRequirements,

      "Ocean Snapshot Assembly composes governed contracts without modifying their contents.",

      "The assembled snapshot is an immutable record, not a storage operation.",

      "This contract does not compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    ])
  ];

  const oceanSnapshot = {
    available,

    snapshotType:
      "ocean-memory",

    responsibility:
      "preserve",

    identity: {
      snapshotId,

      snapshotSchemaVersion
    },

    metadata:
      cloneSnapshotValue(
        snapshotMetadata
      ),

    observation:
      cloneSnapshotValue(
        observationSnapshot
      ),

    intelligence:
      cloneSnapshotValue(
        intelligenceSnapshot
      ),

    integrity: {
      metadataAvailable,

      observationSnapshotAvailable,

      intelligenceSnapshotAvailable,

      observedAtConsistent,

      generatedAtConsistent,

      observationContractConsistent,

      intelligenceContractConsistent,

      immutable:
        true
    },

    missingRequirements,

    limitations,

    contractVersion:
      "pelora-ocean-snapshot-assembly-v1"
  };

  return deepFreezeSnapshotValue(
    oceanSnapshot
  );
}


/**
 * ------------------------------------------------------------
 * Ocean Memory Storage Contract v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Accept one valid canonical Ocean Snapshot and produce an
 * immutable governed storage record and storage receipt.
 *
 * This contract does not write to a database, retrieve records,
 * compare snapshots, calculate persistence, infer trends,
 * perform species reasoning, or generate captain guidance.
 */
export function buildOceanMemoryStorage({
  oceanSnapshot = null,
  storedAt = null,
  storageProvider = "in-memory-contract"
} = {}) {
  const snapshotAvailable =
    oceanSnapshot
      ?.available ===
    true;

  const snapshotId =
    oceanSnapshot
      ?.identity
      ?.snapshotId ??
    null;

  const snapshotSchemaVersion =
    oceanSnapshot
      ?.identity
      ?.snapshotSchemaVersion ??
    null;

  const snapshotContractVersion =
    oceanSnapshot
      ?.contractVersion ??
    null;

  const resolvedStoredAt =
    typeof storedAt ===
      "string" &&
    storedAt.trim().length >
      0
      ? storedAt
      : null;

  const validStorageProvider =
    typeof storageProvider ===
      "string" &&
    storageProvider.trim().length >
      0;

  const available =
    snapshotAvailable &&
    typeof snapshotId ===
      "string" &&
    snapshotId.trim().length >
      0 &&
    typeof snapshotSchemaVersion ===
      "string" &&
    snapshotSchemaVersion.trim().length >
      0 &&
    typeof snapshotContractVersion ===
      "string" &&
    snapshotContractVersion.trim().length >
      0 &&
    typeof resolvedStoredAt ===
      "string" &&
    validStorageProvider;

  const missingRequirements = [
    !snapshotAvailable
      ? "canonical-ocean-snapshot"
      : null,

    typeof snapshotId !==
      "string" ||
    snapshotId.trim().length ===
      0
      ? "snapshot-id"
      : null,

    typeof snapshotSchemaVersion !==
      "string" ||
    snapshotSchemaVersion.trim().length ===
      0
      ? "snapshot-schema-version"
      : null,

    typeof snapshotContractVersion !==
      "string" ||
    snapshotContractVersion.trim().length ===
      0
      ? "snapshot-contract-version"
      : null,

    typeof resolvedStoredAt !==
      "string"
      ? "stored-at"
      : null,

    !validStorageProvider
      ? "storage-provider"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          oceanSnapshot
            ?.limitations
        )
          ? oceanSnapshot
              .limitations
          : []
      ),

      ...missingRequirements,

      "Ocean Memory Storage preserves the canonical Ocean Snapshot without modifying its scientific contents.",

      "This contract produces a governed storage record but does not perform an external database write.",

      "This contract does not retrieve snapshots, compare ocean states, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    ])
  ];

  const storageRecord = {
    available,

    storageType:
      "ocean-memory-record",

    responsibility:
      "preserve",

    identity: {
      snapshotId,

      snapshotSchemaVersion
    },

    storage: {
      storedAt:
        resolvedStoredAt,

      storageProvider:
        validStorageProvider
          ? storageProvider.trim()
          : null,

      immutable:
        true,

      externalWritePerformed:
        false
    },

    governedVersions: {
      oceanSnapshot:
        snapshotContractVersion,

      storageContract:
        "pelora-ocean-memory-storage-v1"
    },

    snapshot:
      cloneSnapshotValue(
        oceanSnapshot
      ),

    missingRequirements,

    limitations,

    contractVersion:
      "pelora-ocean-memory-storage-v1"
  };

  return deepFreezeSnapshotValue(
    storageRecord
  );
}


/**
 * ------------------------------------------------------------
 * Ocean Memory Storage Row Adapter v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Convert one externally stored ocean_snapshots database row
 * into the governed Ocean Memory storage-record shape consumed
 * by Snapshot Retrieval and Historical Snapshot Query.
 *
 * This contract does not query a database, alter the canonical
 * Ocean Snapshot, compare snapshots, calculate persistence,
 * infer trends, perform species reasoning, or generate guidance.
 */
export function buildOceanMemoryStorageRecordFromRow({
  row = null
} = {}) {
  const snapshotId =
    typeof row
      ?.snapshot_id ===
      "string"
      ? row.snapshot_id.trim() ||
        null
      : null;

  const userId =
    typeof row
      ?.user_id ===
      "string"
      ? row.user_id.trim() ||
        null
      : null;

  const observedAt =
    typeof row
      ?.observed_at ===
      "string" &&
    Number.isFinite(
      Date.parse(
        row.observed_at
      )
    )
      ? row.observed_at
      : null;

  const storedAtSource =
    row
      ?.created_at ??
    row
      ?.stored_at ??
    null;

  const storedAt =
    typeof storedAtSource ===
      "string" &&
    Number.isFinite(
      Date.parse(
        storedAtSource
      )
    )
      ? storedAtSource
      : null;

  const snapshotSchemaVersion =
    typeof row
      ?.snapshot_schema_version ===
      "string"
      ? row
          .snapshot_schema_version
          .trim() ||
        null
      : null;

  const snapshotContractVersion =
    typeof row
      ?.snapshot_contract_version ===
      "string"
      ? row
          .snapshot_contract_version
          .trim() ||
        null
      : null;

  const snapshotPayload =
    row
      ?.snapshot_payload &&
    typeof row
      .snapshot_payload ===
      "object" &&
    !Array.isArray(
      row.snapshot_payload
    )
      ? row.snapshot_payload
      : null;

  const payloadAvailable =
    snapshotPayload
      ?.available ===
    true;

  const payloadSnapshotId =
    snapshotPayload
      ?.identity
      ?.snapshotId ??
    null;

  const payloadSchemaVersion =
    snapshotPayload
      ?.identity
      ?.snapshotSchemaVersion ??
    null;

  const payloadContractVersion =
    snapshotPayload
      ?.contractVersion ??
    null;

  const payloadObservedAt =
    snapshotPayload
      ?.metadata
      ?.time
      ?.observedAt ??
    snapshotPayload
      ?.observation
      ?.observedAt ??
    null;

  const snapshotIdConsistent =
    typeof snapshotId ===
      "string" &&
    typeof payloadSnapshotId ===
      "string" &&
    snapshotId ===
      payloadSnapshotId;

  const snapshotSchemaVersionConsistent =
    typeof snapshotSchemaVersion ===
      "string" &&
    typeof payloadSchemaVersion ===
      "string" &&
    snapshotSchemaVersion ===
      payloadSchemaVersion;

  const snapshotContractVersionConsistent =
    typeof snapshotContractVersion ===
      "string" &&
    typeof payloadContractVersion ===
      "string" &&
    snapshotContractVersion ===
      payloadContractVersion;

  const observedAtConsistent =
    typeof observedAt ===
      "string" &&
    typeof payloadObservedAt ===
      "string" &&
    Number.isFinite(
      Date.parse(
        payloadObservedAt
      )
    ) &&
    Date.parse(
      observedAt
    ) ===
      Date.parse(
        payloadObservedAt
      );

  const available =
    typeof snapshotId ===
      "string" &&
    typeof userId ===
      "string" &&
    typeof observedAt ===
      "string" &&
    typeof storedAt ===
      "string" &&
    typeof snapshotSchemaVersion ===
      "string" &&
    typeof snapshotContractVersion ===
      "string" &&
    payloadAvailable &&
    snapshotIdConsistent &&
    snapshotSchemaVersionConsistent &&
    snapshotContractVersionConsistent &&
    observedAtConsistent;

  const missingRequirements = [
    typeof snapshotId !==
      "string"
      ? "database-snapshot-id"
      : null,

    typeof userId !==
      "string"
      ? "database-user-id"
      : null,

    typeof observedAt !==
      "string"
      ? "database-observed-at"
      : null,

    typeof storedAt !==
      "string"
      ? "database-created-at"
      : null,

    typeof snapshotSchemaVersion !==
      "string"
      ? "database-snapshot-schema-version"
      : null,

    typeof snapshotContractVersion !==
      "string"
      ? "database-snapshot-contract-version"
      : null,

    !snapshotPayload
      ? "database-snapshot-payload"
      : null,

    snapshotPayload &&
    !payloadAvailable
      ? "available-canonical-ocean-snapshot"
      : null,

    snapshotPayload &&
    !snapshotIdConsistent
      ? "snapshot-id-consistency"
      : null,

    snapshotPayload &&
    !snapshotSchemaVersionConsistent
      ? "snapshot-schema-version-consistency"
      : null,

    snapshotPayload &&
    !snapshotContractVersionConsistent
      ? "snapshot-contract-version-consistency"
      : null,

    snapshotPayload &&
    !observedAtConsistent
      ? "snapshot-observed-at-consistency"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...missingRequirements,

      "Ocean Memory Storage Row Adapter preserves one externally stored canonical Ocean Snapshot.",

      "The database row remains authoritative for ownership and external storage provenance.",

      "The canonical snapshot payload remains authoritative for scientific contracts and internal snapshot content.",

      "This contract does not query a database, authorize access, compare snapshots, calculate persistence, infer trends, perform opportunity or species reasoning, or generate captain guidance."
    ])
  ];

  const storageRecord = {
    available,

    storageType:
      "ocean-memory-storage-record",

    responsibility:
      "preserve",

    identity: {
      snapshotId,

      snapshotSchemaVersion,

      userId
    },

    storage: {
      storedAt,

      storageProvider:
        "supabase-ocean-snapshots",

      immutable:
        true,

      externalWritePerformed:
        true
    },

    governedVersions: {
      oceanSnapshot:
        snapshotContractVersion
    },

    snapshot:
      available
        ? cloneSnapshotValue(
            snapshotPayload
          )
        : null,

    databaseReference: {
      rowId:
        row
          ?.id ??
        null,

      fishingDayReportId:
        row
          ?.fishing_day_report_id ??
        null,

      observedAt,

      generatedAt:
        row
          ?.generated_at ??
        null,

      latitude:
        Number.isFinite(
          row
            ?.latitude
        )
          ? row.latitude
          : null,

      longitude:
        Number.isFinite(
          row
            ?.longitude
        )
          ? row.longitude
          : null,

      captureMode:
        row
          ?.capture_mode ??
        null,

      lifecycleState:
        row
          ?.lifecycle_state ??
        null,

      availabilityClassification:
        row
          ?.availability_classification ??
        null
    },

    integrity: {
      payloadAvailable,

      snapshotIdConsistent,

      snapshotSchemaVersionConsistent,

      snapshotContractVersionConsistent,

      observedAtConsistent
    },

    missingRequirements,

    limitations,

    contractVersion:
      "pelora-ocean-memory-storage-v1"
  };

  return deepFreezeSnapshotValue(
    storageRecord
  );
}


/**
 * ------------------------------------------------------------
 * Ocean Snapshot Retrieval Contract v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Retrieve one canonical Ocean Snapshot from a governed Ocean
 * Memory storage record without modifying the stored record or
 * the contained scientific contracts.
 *
 * This contract does not search external storage, compare
 * snapshots, calculate persistence, infer trends, perform
 * species reasoning, or generate captain guidance.
 */
export function buildOceanSnapshotRetrieval({
  storageRecord = null,
  requestedSnapshotId = null,
  retrievedAt = null
} = {}) {
  const storageRecordAvailable =
    storageRecord
      ?.available ===
    true;

  const storedSnapshotAvailable =
    storageRecord
      ?.snapshot
      ?.available ===
    true;

  const storedSnapshotId =
    storageRecord
      ?.identity
      ?.snapshotId ??
    storageRecord
      ?.snapshot
      ?.identity
      ?.snapshotId ??
    null;

  const storedSnapshotSchemaVersion =
    storageRecord
      ?.identity
      ?.snapshotSchemaVersion ??
    storageRecord
      ?.snapshot
      ?.identity
      ?.snapshotSchemaVersion ??
    null;

  const storageContractVersion =
    storageRecord
      ?.contractVersion ??
    null;

  const storedSnapshotContractVersion =
    storageRecord
      ?.governedVersions
      ?.oceanSnapshot ??
    storageRecord
      ?.snapshot
      ?.contractVersion ??
    null;

  const resolvedRequestedSnapshotId =
    typeof requestedSnapshotId ===
      "string" &&
    requestedSnapshotId.trim().length >
      0
      ? requestedSnapshotId.trim()
      : null;

  const resolvedRetrievedAt =
    typeof retrievedAt ===
      "string" &&
    retrievedAt.trim().length >
      0
      ? retrievedAt
      : null;

  const snapshotIdMatches =
    typeof storedSnapshotId ===
      "string" &&
    typeof resolvedRequestedSnapshotId ===
      "string" &&
    storedSnapshotId ===
      resolvedRequestedSnapshotId;

  const available =
    storageRecordAvailable &&
    storedSnapshotAvailable &&
    snapshotIdMatches &&
    typeof storedSnapshotSchemaVersion ===
      "string" &&
    storedSnapshotSchemaVersion.trim().length >
      0 &&
    typeof storageContractVersion ===
      "string" &&
    storageContractVersion.trim().length >
      0 &&
    typeof storedSnapshotContractVersion ===
      "string" &&
    storedSnapshotContractVersion.trim().length >
      0 &&
    typeof resolvedRetrievedAt ===
      "string";

  const missingRequirements = [
    !storageRecordAvailable
      ? "governed-storage-record"
      : null,

    !storedSnapshotAvailable
      ? "stored-ocean-snapshot"
      : null,

    typeof resolvedRequestedSnapshotId !==
      "string"
      ? "requested-snapshot-id"
      : null,

    typeof storedSnapshotId !==
      "string" ||
    storedSnapshotId.trim().length ===
      0
      ? "stored-snapshot-id"
      : null,

    typeof resolvedRequestedSnapshotId ===
      "string" &&
    typeof storedSnapshotId ===
      "string" &&
    !snapshotIdMatches
      ? "snapshot-id-match"
      : null,

    typeof storedSnapshotSchemaVersion !==
      "string" ||
    storedSnapshotSchemaVersion.trim().length ===
      0
      ? "snapshot-schema-version"
      : null,

    typeof storageContractVersion !==
      "string" ||
    storageContractVersion.trim().length ===
      0
      ? "storage-contract-version"
      : null,

    typeof storedSnapshotContractVersion !==
      "string" ||
    storedSnapshotContractVersion.trim().length ===
      0
      ? "snapshot-contract-version"
      : null,

    typeof resolvedRetrievedAt !==
      "string"
      ? "retrieved-at"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          storageRecord
            ?.limitations
        )
          ? storageRecord
              .limitations
          : []
      ),

      ...missingRequirements,

      "Ocean Snapshot Retrieval returns a preserved copy of the stored canonical Ocean Snapshot.",

      "This contract does not search, query, or read from an external database.",

      "This contract does not compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    ])
  ];

  const retrievalRecord = {
    available,

    retrievalType:
      "ocean-snapshot-retrieval",

    responsibility:
      "preserve",

    request: {
      requestedSnapshotId:
        resolvedRequestedSnapshotId,

      retrievedAt:
        resolvedRetrievedAt
    },

    identity: {
      snapshotId:
        storedSnapshotId,

      snapshotSchemaVersion:
        storedSnapshotSchemaVersion
    },

    provenance: {
      storageProvider:
        storageRecord
          ?.storage
          ?.storageProvider ??
        null,

      storedAt:
        storageRecord
          ?.storage
          ?.storedAt ??
        null,

      storageContractVersion,

      oceanSnapshotContractVersion:
        storedSnapshotContractVersion
    },

    snapshot:
      available
        ? cloneSnapshotValue(
            storageRecord.snapshot
          )
        : null,

    missingRequirements,

    limitations,

    contractVersion:
      "pelora-ocean-snapshot-retrieval-v1"
  };

  return deepFreezeSnapshotValue(
    retrievalRecord
  );
}


/**
 * ------------------------------------------------------------
 * Historical Snapshot Query Layer v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Select and return governed historical Ocean Memory records
 * from a supplied collection for downstream persistence
 * analysis.
 *
 * This contract does not compare snapshots, calculate
 * persistence, infer trends, perform opportunity or species
 * reasoning, alter scientific contracts, or query an external
 * database.
 */
export function buildHistoricalSnapshotQuery({
  historicalSnapshots = [],
  location = null,
  radiusKm = null,
  observedAfter = null,
  observedBefore = null,
  maximumSnapshots = null,
  snapshotSchemaVersion = null
} = {}) {
  const snapshotsInput =
    Array.isArray(
      historicalSnapshots
    )
      ? historicalSnapshots
      : [];

  const requestedLocationId =
    typeof location ===
      "string"
      ? location.trim() ||
        null
      : typeof location
          ?.locationId ===
          "string"
        ? location.locationId
            .trim() ||
          null
        : typeof location
            ?.id ===
            "string"
          ? location.id
              .trim() ||
            null
          : null;

  const requestedRadiusKm =
    Number.isFinite(
      radiusKm
    ) &&
    radiusKm >=
      0
      ? radiusKm
      : null;

       const requestedLatitude =
    Number.isFinite(
      location?.latitude
    )
      ? location.latitude
      : null;

  const requestedLongitude =
    Number.isFinite(
      location?.longitude
    )
      ? location.longitude
      : null;

  const radiusFilterRequested =
    requestedRadiusKm !==
      null;

  const radiusFilterApplied =
    radiusFilterRequested &&
    requestedLatitude !==
      null &&
    requestedLongitude !==
      null;

  const resolvedObservedAfter =
    typeof observedAfter ===
      "string" &&
    Number.isFinite(
      Date.parse(
        observedAfter
      )
    )
      ? observedAfter
      : null;

  const resolvedObservedBefore =
    typeof observedBefore ===
      "string" &&
    Number.isFinite(
      Date.parse(
        observedBefore
      )
    )
      ? observedBefore
      : null;

  const observedAfterTimestamp =
    resolvedObservedAfter
      ? Date.parse(
          resolvedObservedAfter
        )
      : null;

  const observedBeforeTimestamp =
    resolvedObservedBefore
      ? Date.parse(
          resolvedObservedBefore
        )
      : null;

  const validTimeWindow =
    observedAfterTimestamp ===
      null ||
    observedBeforeTimestamp ===
      null ||
    observedAfterTimestamp <=
      observedBeforeTimestamp;

  const resolvedMaximumSnapshots =
    Number.isInteger(
      maximumSnapshots
    ) &&
    maximumSnapshots >
      0
      ? maximumSnapshots
      : null;

  const requestedSnapshotSchemaVersion =
    typeof snapshotSchemaVersion ===
      "string" &&
    snapshotSchemaVersion
      .trim()
      .length >
      0
      ? snapshotSchemaVersion
          .trim()
      : null;

  const normalizedRecords =
    snapshotsInput
      .map(record => {
        const storageRecord =
          record
            ?.storageRecord ??
          (
            record
              ?.snapshot
              ?.available ===
            true
              ? record
              : null
          );

        const oceanSnapshot =
          storageRecord
            ?.snapshot ??
          record
            ?.oceanSnapshot ??
          null;

        const storageRecordAvailable =
          storageRecord
            ?.available ===
          true;

        const snapshotAvailable =
          oceanSnapshot
            ?.available ===
          true;

        const snapshotId =
          storageRecord
            ?.identity
            ?.snapshotId ??
          oceanSnapshot
            ?.identity
            ?.snapshotId ??
          null;

        const storedLocationId =
          oceanSnapshot
            ?.metadata
            ?.location
            ?.locationId ??
          oceanSnapshot
            ?.metadata
            ?.identity
            ?.locationId ??
          oceanSnapshot
            ?.identity
            ?.locationId ??
          oceanSnapshot
            ?.observation
            ?.location
            ?.locationId ??
          oceanSnapshot
            ?.observation
            ?.location
            ?.id ??
          null;

                  const storedLatitude =
          oceanSnapshot
            ?.metadata
            ?.location
            ?.latitude ??
          oceanSnapshot
            ?.observation
            ?.location
            ?.latitude ??
          null;

        const storedLongitude =
          oceanSnapshot
            ?.metadata
            ?.location
            ?.longitude ??
          oceanSnapshot
            ?.observation
            ?.location
            ?.longitude ??
          null;

        const validStoredCoordinates =
          Number.isFinite(
            storedLatitude
          ) &&
          Number.isFinite(
            storedLongitude
          );

        const distanceKm =
          radiusFilterApplied &&
          validStoredCoordinates
            ? kilometersBetween(
                requestedLatitude,
                requestedLongitude,
                storedLatitude,
                storedLongitude
              )
            : null;

        const radiusMatches =
          !radiusFilterApplied ||
          (
            Number.isFinite(
              distanceKm
            ) &&
            distanceKm <=
              requestedRadiusKm
          );

        const observedAt =
          oceanSnapshot
            ?.metadata
            ?.time
            ?.observedAt ??
          oceanSnapshot
            ?.observation
            ?.observedAt ??
          null;

        const observedAtTimestamp =
          typeof observedAt ===
            "string"
            ? Date.parse(
                observedAt
              )
            : Number.NaN;

        const validObservedAt =
          Number.isFinite(
            observedAtTimestamp
          );

        const storedSnapshotSchemaVersion =
          storageRecord
            ?.identity
            ?.snapshotSchemaVersion ??
          oceanSnapshot
            ?.identity
            ?.snapshotSchemaVersion ??
          null;

        const storageContractVersion =
          storageRecord
            ?.contractVersion ??
          null;

        const oceanSnapshotContractVersion =
          storageRecord
            ?.governedVersions
            ?.oceanSnapshot ??
          oceanSnapshot
            ?.contractVersion ??
          null;

        const locationMatches =
          requestedLocationId ===
            null ||
          (
            typeof storedLocationId ===
              "string" &&
            storedLocationId ===
              requestedLocationId
          );

        const afterBoundaryMatches =
          observedAfterTimestamp ===
            null ||
          (
            validObservedAt &&
            observedAtTimestamp >=
              observedAfterTimestamp
          );

        const beforeBoundaryMatches =
          observedBeforeTimestamp ===
            null ||
          (
            validObservedAt &&
            observedAtTimestamp <=
              observedBeforeTimestamp
          );

        const schemaVersionMatches =
          requestedSnapshotSchemaVersion ===
            null ||
          storedSnapshotSchemaVersion ===
            requestedSnapshotSchemaVersion;

        const governedRecordValid =
          storageRecordAvailable &&
          snapshotAvailable &&
          typeof snapshotId ===
            "string" &&
          snapshotId.trim().length >
            0 &&
          validObservedAt &&
          typeof storedSnapshotSchemaVersion ===
            "string" &&
          storedSnapshotSchemaVersion
            .trim()
            .length >
            0 &&
          typeof storageContractVersion ===
            "string" &&
          storageContractVersion
            .trim()
            .length >
            0 &&
          typeof oceanSnapshotContractVersion ===
            "string" &&
          oceanSnapshotContractVersion
            .trim()
            .length >
            0;

        return {
          storageRecord,

          oceanSnapshot,

          snapshotId:
            typeof snapshotId ===
              "string"
              ? snapshotId.trim()
              : null,

          locationId:
            typeof storedLocationId ===
              "string"
              ? storedLocationId
              : null,

          observedAt:
            validObservedAt
              ? observedAt
              : null,

          observedAtTimestamp:
            validObservedAt
              ? observedAtTimestamp
              : null,

          snapshotSchemaVersion:
            storedSnapshotSchemaVersion,

          storageContractVersion,

          oceanSnapshotContractVersion,

          governedRecordValid,

          locationMatches,

          storedLatitude,

          storedLatitude,

          storedLongitude,

          distanceKm,

          radiusMatches,

          afterBoundaryMatches,

          beforeBoundaryMatches,

          schemaVersionMatches,

          selected:
            governedRecordValid &&
            locationMatches &&
            radiusMatches &&
            afterBoundaryMatches &&
            beforeBoundaryMatches &&
            schemaVersionMatches
        };
      });

  const rejectedRecordCount =
    normalizedRecords.filter(
      record =>
        !record.governedRecordValid
    ).length;

  const locationExcludedCount =
    normalizedRecords.filter(
      record =>
        record.governedRecordValid &&
        !record.locationMatches
    ).length;

      const radiusExcludedCount =
    normalizedRecords.filter(
      record =>
        record.governedRecordValid &&
        record.locationMatches &&
        radiusFilterApplied &&
        !record.radiusMatches
    ).length;

    const timeExcludedCount =
    normalizedRecords.filter(
      record =>
        record.governedRecordValid &&
        record.locationMatches &&
        record.radiusMatches &&
        (
          !record.afterBoundaryMatches ||
          !record.beforeBoundaryMatches
        )
    ).length;

  const schemaExcludedCount =
    normalizedRecords.filter(
      record =>
        record.governedRecordValid &&
        record.locationMatches &&
        record.radiusMatches &&
        record.afterBoundaryMatches &&
        record.beforeBoundaryMatches &&
        !record.schemaVersionMatches
    ).length;

  const selectedRecords =
    validTimeWindow
      ? normalizedRecords
          .filter(
            record =>
              record.selected
          )
          .sort(
            (
              firstRecord,
              secondRecord
            ) =>
              firstRecord
                .observedAtTimestamp -
              secondRecord
                .observedAtTimestamp
          )
      : [];

  const uniqueRecords = [];

  const seenSnapshotIds =
    new Set();

  let duplicateRecordCount =
    0;

  for (
    const record of
      selectedRecords
  ) {
    if (
      seenSnapshotIds.has(
        record.snapshotId
      )
    ) {
      duplicateRecordCount +=
        1;

      continue;
    }

    seenSnapshotIds.add(
      record.snapshotId
    );

    uniqueRecords.push(
      record
    );
  }

  const resultRecords =
    resolvedMaximumSnapshots !==
      null
      ? uniqueRecords.slice(
          Math.max(
            0,
            uniqueRecords.length -
              resolvedMaximumSnapshots
          )
        )
      : uniqueRecords;

  const results =
    resultRecords.map(
      record =>
        cloneSnapshotValue(
          record.storageRecord
        )
    );

  const available =
    validTimeWindow &&
    results.length >
      0;

  const missingRequirements = [
    !Array.isArray(
      historicalSnapshots
    )
      ? "historical-snapshot-collection"
      : null,

    snapshotsInput.length ===
      0
      ? "one-or-more-historical-storage-records"
      : null,

    !validTimeWindow
      ? "valid-observed-time-window"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...missingRequirements,

      radiusFilterRequested &&
      !radiusFilterApplied
        ? "geographic-radius-filter-requires-valid-center-coordinates"
        : null,

      requestedLocationId ===
        null
        ? "location-filter-not-applied"
        : null,

      resolvedObservedAfter ===
        null &&
      observedAfter !==
        null
        ? "invalid-observed-after-filter-ignored"
        : null,

      resolvedObservedBefore ===
        null &&
      observedBefore !==
        null
        ? "invalid-observed-before-filter-ignored"
        : null,

      resolvedMaximumSnapshots ===
        null &&
      maximumSnapshots !==
        null
        ? "invalid-maximum-snapshot-limit-ignored"
        : null,

      requestedSnapshotSchemaVersion ===
        null &&
      snapshotSchemaVersion !==
        null
        ? "invalid-snapshot-schema-version-filter-ignored"
        : null,

      "Historical Snapshot Query returns preserved governed storage records from a supplied collection only.",

      "This contract does not query, search, or read from an external database.",

      "This contract calculates great-circle distance from the requested center and applies inclusive geographic-radius filtering when valid coordinates and radius are supplied.",

      "This contract does not compare snapshots, calculate persistence, infer trends, alter scientific contracts, perform opportunity or species reasoning, or generate captain guidance."
    ].filter(Boolean))
  ];

  const firstObservedAt =
    resultRecords.length >
      0
      ? resultRecords[0]
          .observedAt
      : null;

  const lastObservedAt =
    resultRecords.length >
      0
      ? resultRecords[
          resultRecords.length -
            1
        ].observedAt
      : null;

  return deepFreezeSnapshotValue({
    available,

    queryType:
      "historical-snapshot-query",

    responsibility:
      "preserve",

    query: {
      locationId:
        requestedLocationId,

      radiusKm:
        requestedRadiusKm,

      radiusFilterApplied,

      centerLatitude:
        requestedLatitude,

      centerLongitude:
        requestedLongitude,

      observedAfter:
        resolvedObservedAfter,

      observedBefore:
        resolvedObservedBefore,

      maximumSnapshots:
        resolvedMaximumSnapshots,

      snapshotSchemaVersion:
        requestedSnapshotSchemaVersion
    },

    summary: {
      inputRecordCount:
        snapshotsInput.length,

      validGovernedRecordCount:
        normalizedRecords.filter(
          record =>
            record.governedRecordValid
        ).length,

      rejectedRecordCount,

      locationExcludedCount,

      radiusExcludedCount,

      timeExcludedCount,

      schemaExcludedCount,

      duplicateRecordCount,

      matchingRecordCount:
        uniqueRecords.length,

      returnedRecordCount:
        results.length,

      resultLimitApplied:
        resolvedMaximumSnapshots !==
          null &&
        uniqueRecords.length >
          results.length,

      firstObservedAt,

      lastObservedAt
    },

    results,

    historicalSnapshots:
      results,

    missingRequirements,

    limitations,

    contractVersion:
      "pelora-historical-snapshot-query-v1"
  });
}


/**
 * ------------------------------------------------------------
 * Latest Ocean Snapshot Query v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Return the newest governed Ocean Memory record from a
 * Historical Snapshot Query result.
 *
 * This contract does not normalize raw database rows, compare
 * snapshots, calculate persistence, infer trends, perform
 * species reasoning, or generate captain guidance.
 */
export function buildLatestOceanSnapshotQuery({
  historicalSnapshots = [],
  location = null,
  observedAfter = null,
  observedBefore = null,
  snapshotSchemaVersion = null
} = {}) {
  const historicalSnapshotQuery =
    buildHistoricalSnapshotQuery({
      historicalSnapshots,
      location,
      observedAfter,
      observedBefore,
      maximumSnapshots:
        1,
      snapshotSchemaVersion
    });

  const latestRecord =
    Array.isArray(
      historicalSnapshotQuery
        ?.historicalSnapshots
    ) &&
    historicalSnapshotQuery
      .historicalSnapshots
      .length >
      0
      ? historicalSnapshotQuery
          .historicalSnapshots[0]
      : null;

  const available =
    historicalSnapshotQuery
      ?.available ===
      true &&
    latestRecord !==
      null;

  const missingRequirements = [
    ...(
      Array.isArray(
        historicalSnapshotQuery
          ?.missingRequirements
      )
        ? historicalSnapshotQuery
            .missingRequirements
        : []
    ),

    latestRecord ===
      null
      ? "latest-governed-ocean-snapshot"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          historicalSnapshotQuery
            ?.limitations
        )
          ? historicalSnapshotQuery
              .limitations
          : []
      ),

      "Latest Ocean Snapshot Query returns only the newest governed Ocean Memory record.",

      "This contract does not normalize raw database rows, compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    ])
  ];

  return deepFreezeSnapshotValue({
    available,

    queryType:
      "latest-ocean-snapshot",

    responsibility:
      "preserve",

    latestSnapshot:
      available
        ? cloneSnapshotValue(
            latestRecord
          )
        : null,

    historicalSnapshot:
      available
        ? cloneSnapshotValue(
            latestRecord
          )
        : null,

    snapshot:
      available
        ? cloneSnapshotValue(
            latestRecord
          )
        : null,

    sourceQuery: {
      available:
        historicalSnapshotQuery
          ?.available ===
        true,

      returnedRecordCount:
        historicalSnapshotQuery
          ?.summary
          ?.returnedRecordCount ??
        0,

      firstObservedAt:
        historicalSnapshotQuery
          ?.summary
          ?.firstObservedAt ??
        null,

      lastObservedAt:
        historicalSnapshotQuery
          ?.summary
          ?.lastObservedAt ??
        null,

      contractVersion:
        historicalSnapshotQuery
          ?.contractVersion ??
        null
    },

    missingRequirements,

    limitations,

    contractVersion:
      "pelora-latest-ocean-snapshot-query-v1"
  });
}


/**
 * ------------------------------------------------------------
 * Previous Ocean Snapshot Query v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Return the governed Ocean Memory record immediately before
 * a supplied observation timestamp.
 *
 * This contract does not normalize raw database rows, compare
 * snapshots, calculate persistence, infer trends, perform
 * species reasoning, or generate captain guidance.
 */
export function buildPreviousOceanSnapshotQuery({
  historicalSnapshots = [],
  beforeObservedAt = null,
  location = null,
  snapshotSchemaVersion = null
} = {}) {
  const resolvedBeforeObservedAt =
    typeof beforeObservedAt ===
      "string" &&
    Number.isFinite(
      Date.parse(
        beforeObservedAt
      )
    )
      ? beforeObservedAt
      : null;

  const beforeObservedTimestamp =
    resolvedBeforeObservedAt
      ? Date.parse(
          resolvedBeforeObservedAt
        )
      : null;

  const historicalSnapshotQuery =
    buildHistoricalSnapshotQuery({
      historicalSnapshots,
      location,

      observedBefore:
        resolvedBeforeObservedAt,

      snapshotSchemaVersion
    });

  const eligibleRecords =
    Array.isArray(
      historicalSnapshotQuery
        ?.historicalSnapshots
    )
      ? historicalSnapshotQuery
          .historicalSnapshots
          .filter(record => {
            const observedAt =
              record
                ?.snapshot
                ?.metadata
                ?.time
                ?.observedAt ??
              null;

            const observedTimestamp =
              typeof observedAt ===
                "string"
                ? Date.parse(
                    observedAt
                  )
                : Number.NaN;

            return (
              beforeObservedTimestamp !==
                null &&
              Number.isFinite(
                observedTimestamp
              ) &&
              observedTimestamp <
                beforeObservedTimestamp
            );
          })
      : [];

  const previousRecord =
    eligibleRecords.length >
      0
      ? eligibleRecords[
          eligibleRecords.length -
            1
        ]
      : null;

  const available =
    resolvedBeforeObservedAt !==
      null &&
    historicalSnapshotQuery
      ?.available ===
      true &&
    previousRecord !==
      null;

  const missingRequirements = [
    resolvedBeforeObservedAt ===
      null
      ? "valid-before-observed-at"
      : null,

    ...(
      Array.isArray(
        historicalSnapshotQuery
          ?.missingRequirements
      )
        ? historicalSnapshotQuery
            .missingRequirements
        : []
    ),

    previousRecord ===
      null
      ? "previous-governed-ocean-snapshot"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          historicalSnapshotQuery
            ?.limitations
        )
          ? historicalSnapshotQuery
              .limitations
          : []
      ),

      "Previous Ocean Snapshot Query returns only the newest governed record strictly before the supplied observation timestamp.",

      "This contract does not normalize raw database rows, compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    ])
  ];

  return deepFreezeSnapshotValue({
    available,

    queryType:
      "previous-ocean-snapshot",

    responsibility:
      "preserve",

    request: {
      beforeObservedAt:
        resolvedBeforeObservedAt,

      locationRequested:
        location !==
          null,

      snapshotSchemaVersion:
        typeof snapshotSchemaVersion ===
          "string"
          ? snapshotSchemaVersion
              .trim() ||
            null
          : null
    },

    previousSnapshot:
      available
        ? cloneSnapshotValue(
            previousRecord
          )
        : null,

    historicalSnapshot:
      available
        ? cloneSnapshotValue(
            previousRecord
          )
        : null,

    snapshot:
      available
        ? cloneSnapshotValue(
            previousRecord
          )
        : null,

    sourceQuery: {
      available:
        historicalSnapshotQuery
          ?.available ===
        true,

      returnedRecordCount:
        historicalSnapshotQuery
          ?.summary
          ?.returnedRecordCount ??
        0,

      eligibleRecordCount:
        eligibleRecords.length,

      firstObservedAt:
        historicalSnapshotQuery
          ?.summary
          ?.firstObservedAt ??
        null,

      lastObservedAt:
        historicalSnapshotQuery
          ?.summary
          ?.lastObservedAt ??
        null,

      contractVersion:
        historicalSnapshotQuery
          ?.contractVersion ??
        null
    },

    missingRequirements: [
      ...new Set(
        missingRequirements
      )
    ],

    limitations,

    contractVersion:
      "pelora-previous-ocean-snapshot-query-v1"
  });
}


/**
 * ------------------------------------------------------------
 * Ocean Snapshot By ID Query v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Return one governed Ocean Memory record matching an exact
 * supplied snapshot identifier.
 *
 * This contract does not normalize raw database rows, compare
 * snapshots, calculate persistence, infer trends, perform
 * species reasoning, or generate captain guidance.
 */
export function buildOceanSnapshotByIdQuery({
  historicalSnapshots = [],
  snapshotId = null,
  location = null,
  snapshotSchemaVersion = null
} = {}) {
  const requestedSnapshotId =
    typeof snapshotId ===
      "string"
      ? snapshotId.trim() ||
        null
      : null;

  const historicalSnapshotQuery =
    buildHistoricalSnapshotQuery({
      historicalSnapshots,
      location,
      snapshotSchemaVersion
    });

  const matchingRecord =
    requestedSnapshotId !==
      null &&
    Array.isArray(
      historicalSnapshotQuery
        ?.historicalSnapshots
    )
      ? historicalSnapshotQuery
          .historicalSnapshots
          .find(record =>
            record
              ?.identity
              ?.snapshotId ===
            requestedSnapshotId
          ) ??
        null
      : null;

  const available =
    requestedSnapshotId !==
      null &&
    historicalSnapshotQuery
      ?.available ===
      true &&
    matchingRecord !==
      null;

  const missingRequirements = [
    requestedSnapshotId ===
      null
      ? "valid-snapshot-id"
      : null,

    ...(
      Array.isArray(
        historicalSnapshotQuery
          ?.missingRequirements
      )
        ? historicalSnapshotQuery
            .missingRequirements
        : []
    ),

    matchingRecord ===
      null
      ? "matching-governed-ocean-snapshot"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          historicalSnapshotQuery
            ?.limitations
        )
          ? historicalSnapshotQuery
              .limitations
          : []
      ),

      "Ocean Snapshot By ID Query returns only the governed Ocean Memory record matching the supplied snapshot identifier.",

      "This contract does not normalize raw database rows, compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    ])
  ];

  return deepFreezeSnapshotValue({
    available,

    queryType:
      "ocean-snapshot-by-id",

    responsibility:
      "preserve",

    request: {
      snapshotId:
        requestedSnapshotId,

      locationRequested:
        location !==
          null,

      snapshotSchemaVersion:
        typeof snapshotSchemaVersion ===
          "string"
          ? snapshotSchemaVersion
              .trim() ||
            null
          : null
    },

    matchingSnapshot:
      available
        ? cloneSnapshotValue(
            matchingRecord
          )
        : null,

    historicalSnapshot:
      available
        ? cloneSnapshotValue(
            matchingRecord
          )
        : null,

    snapshot:
      available
        ? cloneSnapshotValue(
            matchingRecord
          )
        : null,

    sourceQuery: {
      available:
        historicalSnapshotQuery
          ?.available ===
        true,

      returnedRecordCount:
        historicalSnapshotQuery
          ?.summary
          ?.returnedRecordCount ??
        0,

      contractVersion:
        historicalSnapshotQuery
          ?.contractVersion ??
        null
    },

    missingRequirements: [
      ...new Set(
        missingRequirements
      )
    ],

    limitations,

    contractVersion:
      "pelora-ocean-snapshot-by-id-query-v1"
  });
}


/**
 * ------------------------------------------------------------
 * Historical Ocean Snapshot Window Query v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Return governed Ocean Memory records observed within a
 * supplied chronological time window.
 *
 * This contract does not normalize raw database rows, compare
 * snapshots, calculate persistence, infer trends, perform
 * species reasoning, or generate captain guidance.
 */
export function buildHistoricalOceanSnapshotWindowQuery({
  historicalSnapshots = [],
  observedAfter = null,
  observedBefore = null,
  location = null,
  maximumSnapshots = null,
  snapshotSchemaVersion = null
} = {}) {
  const resolvedObservedAfter =
    typeof observedAfter ===
      "string" &&
    Number.isFinite(
      Date.parse(
        observedAfter
      )
    )
      ? observedAfter
      : null;

  const resolvedObservedBefore =
    typeof observedBefore ===
      "string" &&
    Number.isFinite(
      Date.parse(
        observedBefore
      )
    )
      ? observedBefore
      : null;

  const observedAfterTimestamp =
    resolvedObservedAfter
      ? Date.parse(
          resolvedObservedAfter
        )
      : null;

  const observedBeforeTimestamp =
    resolvedObservedBefore
      ? Date.parse(
          resolvedObservedBefore
        )
      : null;

  const validTimeWindow =
    observedAfterTimestamp !==
      null &&
    observedBeforeTimestamp !==
      null &&
    observedAfterTimestamp <=
      observedBeforeTimestamp;

  const historicalSnapshotQuery =
    buildHistoricalSnapshotQuery({
      historicalSnapshots,

      observedAfter:
        validTimeWindow
          ? resolvedObservedAfter
          : null,

      observedBefore:
        validTimeWindow
          ? resolvedObservedBefore
          : null,

      location,
      maximumSnapshots,
      snapshotSchemaVersion
    });

  const windowSnapshots =
    validTimeWindow &&
    Array.isArray(
      historicalSnapshotQuery
        ?.historicalSnapshots
    )
      ? historicalSnapshotQuery
          .historicalSnapshots
      : [];

  const available =
    validTimeWindow &&
    historicalSnapshotQuery
      ?.available ===
      true &&
    windowSnapshots.length >
      0;

  const missingRequirements = [
    resolvedObservedAfter ===
      null
      ? "valid-observed-after"
      : null,

    resolvedObservedBefore ===
      null
      ? "valid-observed-before"
      : null,

    resolvedObservedAfter !==
      null &&
    resolvedObservedBefore !==
      null &&
    !validTimeWindow
      ? "valid-observed-time-window"
      : null,

    ...(
      Array.isArray(
        historicalSnapshotQuery
          ?.missingRequirements
      )
        ? historicalSnapshotQuery
            .missingRequirements
        : []
    ),

    windowSnapshots.length ===
      0
      ? "governed-ocean-snapshots-within-window"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          historicalSnapshotQuery
            ?.limitations
        )
          ? historicalSnapshotQuery
              .limitations
          : []
      ),

      "Historical Ocean Snapshot Window Query returns only governed Ocean Memory records observed within the supplied inclusive time window.",

      "This contract does not normalize raw database rows, compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    ])
  ];

  return deepFreezeSnapshotValue({
    available,

    queryType:
      "historical-ocean-snapshot-window",

    responsibility:
      "preserve",

    request: {
      observedAfter:
        resolvedObservedAfter,

      observedBefore:
        resolvedObservedBefore,

      validTimeWindow,

      locationRequested:
        location !==
          null,

      maximumSnapshots:
        Number.isInteger(
          maximumSnapshots
        ) &&
        maximumSnapshots >
          0
          ? maximumSnapshots
          : null,

      snapshotSchemaVersion:
        typeof snapshotSchemaVersion ===
          "string"
          ? snapshotSchemaVersion
              .trim() ||
            null
          : null
    },

    snapshots:
      available
        ? cloneSnapshotValue(
            windowSnapshots
          )
        : [],

    historicalSnapshots:
      available
        ? cloneSnapshotValue(
            windowSnapshots
          )
        : [],

    sourceQuery: {
      available:
        historicalSnapshotQuery
          ?.available ===
        true,

      inputRecordCount:
        historicalSnapshotQuery
          ?.summary
          ?.inputRecordCount ??
        0,

      returnedRecordCount:
        historicalSnapshotQuery
          ?.summary
          ?.returnedRecordCount ??
        0,

      firstObservedAt:
        historicalSnapshotQuery
          ?.summary
          ?.firstObservedAt ??
        null,

      lastObservedAt:
        historicalSnapshotQuery
          ?.summary
          ?.lastObservedAt ??
        null,

      contractVersion:
        historicalSnapshotQuery
          ?.contractVersion ??
        null
    },

    missingRequirements: [
      ...new Set(
        missingRequirements
      )
    ],

    limitations,

    contractVersion:
      "pelora-historical-ocean-snapshot-window-query-v1"
  });
}


/**
 * ------------------------------------------------------------
 * Nearby Ocean History Query v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Return governed Ocean Memory records within a supplied
 * geographic radius of a requested center location.
 *
 * This contract delegates spatial filtering to the governed
 * Historical Snapshot Query and does not duplicate distance
 * calculations.
 *
 * This contract does not compare snapshots, calculate
 * persistence, infer trends, perform species reasoning, or
 * generate captain guidance.
 */
export function buildNearbyOceanHistoryQuery({
  historicalSnapshots = [],
  location = null,
  radiusKm = null,
  observedAfter = null,
  observedBefore = null,
  maximumSnapshots = null,
  snapshotSchemaVersion = null
} = {}) {
  const validCenter =
    Number.isFinite(
      location?.latitude
    ) &&
    Number.isFinite(
      location?.longitude
    );

  const validRadius =
    Number.isFinite(
      radiusKm
    ) &&
    radiusKm >=
      0;

  const historicalSnapshotQuery =
    buildHistoricalSnapshotQuery({
      historicalSnapshots,
      location,
      radiusKm:
        validRadius
          ? radiusKm
          : null,
      observedAfter,
      observedBefore,
      maximumSnapshots,
      snapshotSchemaVersion
    });

  const nearbySnapshots =
    validCenter &&
    validRadius &&
    historicalSnapshotQuery
      ?.query
      ?.radiusFilterApplied ===
      true &&
    Array.isArray(
      historicalSnapshotQuery
        ?.historicalSnapshots
    )
      ? historicalSnapshotQuery
          .historicalSnapshots
      : [];

  const available =
    validCenter &&
    validRadius &&
    historicalSnapshotQuery
      ?.available ===
      true &&
    nearbySnapshots.length >
      0;

  const missingRequirements = [
    !validCenter
      ? "valid-center-coordinates"
      : null,

    !validRadius
      ? "valid-radius-km"
      : null,

    ...(
      Array.isArray(
        historicalSnapshotQuery
          ?.missingRequirements
      )
        ? historicalSnapshotQuery
            .missingRequirements
        : []
    ),

    nearbySnapshots.length ===
      0
      ? "governed-ocean-snapshots-within-radius"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          historicalSnapshotQuery
            ?.limitations
        )
          ? historicalSnapshotQuery
              .limitations
          : []
      ),

      "Nearby Ocean History Query returns only governed Ocean Memory records within the supplied inclusive geographic radius.",

      "This contract delegates geographic distance calculation and radius filtering to Historical Snapshot Query.",

      "This contract does not compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    ])
  ];

  return deepFreezeSnapshotValue({
    available,

    queryType:
      "nearby-ocean-history",

    responsibility:
      "preserve",

    request: {
      centerLatitude:
        validCenter
          ? location.latitude
          : null,

      centerLongitude:
        validCenter
          ? location.longitude
          : null,

      radiusKm:
        validRadius
          ? radiusKm
          : null,

      observedAfter:
        typeof observedAfter ===
          "string"
          ? observedAfter
          : null,

      observedBefore:
        typeof observedBefore ===
          "string"
          ? observedBefore
          : null,

      maximumSnapshots:
        Number.isInteger(
          maximumSnapshots
        ) &&
        maximumSnapshots >
          0
          ? maximumSnapshots
          : null,

      snapshotSchemaVersion:
        typeof snapshotSchemaVersion ===
          "string"
          ? snapshotSchemaVersion
              .trim() ||
            null
          : null
    },

    snapshots:
      available
        ? cloneSnapshotValue(
            nearbySnapshots
          )
        : [],

    historicalSnapshots:
      available
        ? cloneSnapshotValue(
            nearbySnapshots
          )
        : [],

    sourceQuery: {
      available:
        historicalSnapshotQuery
          ?.available ===
        true,

      radiusFilterApplied:
        historicalSnapshotQuery
          ?.query
          ?.radiusFilterApplied ===
        true,

      radiusExcludedCount:
        historicalSnapshotQuery
          ?.summary
          ?.radiusExcludedCount ??
        0,

      returnedRecordCount:
        historicalSnapshotQuery
          ?.summary
          ?.returnedRecordCount ??
        0,

      firstObservedAt:
        historicalSnapshotQuery
          ?.summary
          ?.firstObservedAt ??
        null,

      lastObservedAt:
        historicalSnapshotQuery
          ?.summary
          ?.lastObservedAt ??
        null,

      contractVersion:
        historicalSnapshotQuery
          ?.contractVersion ??
        null
    },

    missingRequirements: [
      ...new Set(
        missingRequirements
      )
    ],

    limitations,

    contractVersion:
      "pelora-nearby-ocean-history-query-v1"
  });
}


/**
 * ------------------------------------------------------------
 * Ocean Memory Time-Series Retrieval v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Return a governed chronological Ocean Memory series prepared
 * for downstream temporal analysis.
 *
 * This contract delegates record validation, filtering,
 * deduplication, and chronological ordering to Historical
 * Snapshot Query.
 *
 * This contract does not compare snapshots, calculate
 * persistence, infer trends, perform species reasoning, or
 * generate captain guidance.
 */
export function buildOceanMemoryTimeSeries({
  historicalSnapshots = [],
  location = null,
  radiusKm = null,
  observedAfter = null,
  observedBefore = null,
  maximumSnapshots = null,
  snapshotSchemaVersion = null
} = {}) {
  const historicalSnapshotQuery =
    buildHistoricalSnapshotQuery({
      historicalSnapshots,
      location,
      radiusKm,
      observedAfter,
      observedBefore,
      maximumSnapshots,
      snapshotSchemaVersion
    });

  const timeSeries =
    Array.isArray(
      historicalSnapshotQuery
        ?.historicalSnapshots
    )
      ? historicalSnapshotQuery
          .historicalSnapshots
      : [];

  const sampleCount =
    timeSeries.length;

  const firstSnapshot =
    sampleCount >
      0
      ? timeSeries[0]
      : null;

  const lastSnapshot =
    sampleCount >
      0
      ? timeSeries[
          sampleCount - 1
        ]
      : null;

  const firstObservedAt =
    firstSnapshot
      ?.snapshot
      ?.metadata
      ?.time
      ?.observedAt ??
    null;

  const lastObservedAt =
    lastSnapshot
      ?.snapshot
      ?.metadata
      ?.time
      ?.observedAt ??
    null;

  const firstObservedTimestamp =
    typeof firstObservedAt ===
      "string"
      ? Date.parse(
          firstObservedAt
        )
      : Number.NaN;

  const lastObservedTimestamp =
    typeof lastObservedAt ===
      "string"
      ? Date.parse(
          lastObservedAt
        )
      : Number.NaN;

  const durationHours =
    Number.isFinite(
      firstObservedTimestamp
    ) &&
    Number.isFinite(
      lastObservedTimestamp
    )
      ? Number(
          (
            (
              lastObservedTimestamp -
              firstObservedTimestamp
            ) /
            (
              1000 *
              60 *
              60
            )
          ).toFixed(2)
        )
      : null;

  const available =
    historicalSnapshotQuery
      ?.available ===
      true &&
    sampleCount >
      0;

  const missingRequirements = [
    ...(
      Array.isArray(
        historicalSnapshotQuery
          ?.missingRequirements
      )
        ? historicalSnapshotQuery
            .missingRequirements
        : []
    ),

    sampleCount ===
      0
      ? "governed-ocean-memory-time-series"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          historicalSnapshotQuery
            ?.limitations
        )
          ? historicalSnapshotQuery
              .limitations
          : []
      ),

      "Ocean Memory Time-Series Retrieval returns governed chronological Ocean Memory records prepared for downstream temporal analysis.",

      "This contract delegates validation, filtering, deduplication, and chronological ordering to Historical Snapshot Query.",

      "This contract does not compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    ])
  ];

  return deepFreezeSnapshotValue({
    available,

    retrievalType:
      "ocean-memory-time-series",

    responsibility:
      "preserve",

    request: {
      locationRequested:
        location !==
          null,

      radiusKm:
        Number.isFinite(
          radiusKm
        ) &&
        radiusKm >=
          0
          ? radiusKm
          : null,

      observedAfter:
        typeof observedAfter ===
          "string"
          ? observedAfter
          : null,

      observedBefore:
        typeof observedBefore ===
          "string"
          ? observedBefore
          : null,

      maximumSnapshots:
        Number.isInteger(
          maximumSnapshots
        ) &&
        maximumSnapshots >
          0
          ? maximumSnapshots
          : null,

      snapshotSchemaVersion:
        typeof snapshotSchemaVersion ===
          "string"
          ? snapshotSchemaVersion
              .trim() ||
            null
          : null
    },

    summary: {
      sampleCount,

      firstObservedAt,

      lastObservedAt,

      durationHours
    },

    timeSeries:
      available
        ? cloneSnapshotValue(
            timeSeries
          )
        : [],

    historicalSnapshots:
      available
        ? cloneSnapshotValue(
            timeSeries
          )
        : [],

    sourceQuery: {
      available:
        historicalSnapshotQuery
          ?.available ===
        true,

      returnedRecordCount:
        historicalSnapshotQuery
          ?.summary
          ?.returnedRecordCount ??
        0,

      duplicateRecordCount:
        historicalSnapshotQuery
          ?.summary
          ?.duplicateRecordCount ??
        0,

      radiusFilterApplied:
        historicalSnapshotQuery
          ?.query
          ?.radiusFilterApplied ===
        true,

      contractVersion:
        historicalSnapshotQuery
          ?.contractVersion ??
        null
    },

    missingRequirements: [
      ...new Set(
        missingRequirements
      )
    ],

    limitations,

    contractVersion:
      "pelora-ocean-memory-time-series-v1"
  });
}


/**
 * ------------------------------------------------------------
 * Ocean Change From Time-Series v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Resolve the latest two governed Ocean Memory records from a
 * supplied Time-Series contract and compare them using the
 * canonical Ocean Change Analysis.
 *
 * This contract does not retrieve external data, calculate
 * persistence, infer trends, perform species reasoning, or
 * generate captain guidance.
 */
export function buildOceanChangeFromTimeSeries({
  timeSeries = null
} = {}) {
  const governedTimeSeriesAvailable =
    timeSeries
      ?.available ===
      true &&
    timeSeries
      ?.retrievalType ===
      "ocean-memory-time-series" &&
    Array.isArray(
      timeSeries
        ?.historicalSnapshots
    );

  const historicalSnapshots =
    governedTimeSeriesAvailable
      ? timeSeries
          .historicalSnapshots
      : [];

  const sampleCount =
    historicalSnapshots.length;

  const previousRecord =
    sampleCount >=
      2
      ? historicalSnapshots[
          sampleCount - 2
        ]
      : null;

  const currentRecord =
    sampleCount >=
      2
      ? historicalSnapshots[
          sampleCount - 1
        ]
      : null;

  const previousOceanSnapshot =
    previousRecord
      ?.snapshot ??
    null;

  const currentOceanSnapshot =
    currentRecord
      ?.snapshot ??
    null;

  const previousObservationSnapshot =
    previousOceanSnapshot
      ?.observation ??
    null;

  const currentObservationSnapshot =
    currentOceanSnapshot
      ?.observation ??
    null;

  const previousIntelligenceSnapshot =
    previousOceanSnapshot
      ?.intelligence ??
    null;

  const currentIntelligenceSnapshot =
    currentOceanSnapshot
      ?.intelligence ??
    null;

  const comparisonInputsAvailable =
    previousObservationSnapshot
      ?.available ===
      true &&
    currentObservationSnapshot
      ?.available ===
      true &&
    previousIntelligenceSnapshot
      ?.available ===
      true &&
    currentIntelligenceSnapshot
      ?.available ===
      true;

  const oceanChangeAnalysis =
    comparisonInputsAvailable
      ? buildOceanChangeAnalysis({
          previousObservationSnapshot,
          currentObservationSnapshot,
          previousIntelligenceSnapshot,
          currentIntelligenceSnapshot
        })
      : null;

  const available =
    governedTimeSeriesAvailable &&
    sampleCount >=
      2 &&
    comparisonInputsAvailable &&
    oceanChangeAnalysis
      ?.available ===
      true;

  const missingRequirements = [
    !governedTimeSeriesAvailable
      ? "governed-ocean-memory-time-series"
      : null,

    governedTimeSeriesAvailable &&
    sampleCount <
      2
      ? "two-or-more-chronological-ocean-memory-records"
      : null,

    sampleCount >=
      2 &&
    previousObservationSnapshot
      ?.available !==
      true
      ? "previous-observation-snapshot"
      : null,

    sampleCount >=
      2 &&
    currentObservationSnapshot
      ?.available !==
      true
      ? "current-observation-snapshot"
      : null,

    sampleCount >=
      2 &&
    previousIntelligenceSnapshot
      ?.available !==
      true
      ? "previous-intelligence-snapshot"
      : null,

    sampleCount >=
      2 &&
    currentIntelligenceSnapshot
      ?.available !==
      true
      ? "current-intelligence-snapshot"
      : null,

    comparisonInputsAvailable &&
    oceanChangeAnalysis
      ?.available !==
      true
      ? "available-ocean-change-analysis"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          timeSeries
            ?.limitations
        )
          ? timeSeries
              .limitations
          : []
      ),

      ...(
        Array.isArray(
          oceanChangeAnalysis
            ?.limitations
        )
          ? oceanChangeAnalysis
              .limitations
          : []
      ),

      "Ocean Change From Time-Series compares only the latest two governed chronological Ocean Memory records.",

      "Scientific comparison is delegated to Ocean Change Analysis.",

      "This contract does not retrieve external data, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    ])
  ];

  return deepFreezeSnapshotValue({
    available,

    analysisType:
      "ocean-change-from-time-series",

    responsibility:
      "Compare",

    source: {
      retrievalType:
        timeSeries
          ?.retrievalType ??
        null,

      contractVersion:
        timeSeries
          ?.contractVersion ??
        null,

      sampleCount,

      previousSnapshotId:
        previousRecord
          ?.identity
          ?.snapshotId ??
        previousOceanSnapshot
          ?.identity
          ?.snapshotId ??
        null,

      currentSnapshotId:
        currentRecord
          ?.identity
          ?.snapshotId ??
        currentOceanSnapshot
          ?.identity
          ?.snapshotId ??
        null
    },

    comparison:
      available
        ? cloneSnapshotValue(
            oceanChangeAnalysis
          )
        : null,

    missingRequirements: [
      ...new Set(
        missingRequirements
      )
    ],

    limitations,

    contractVersion:
      "pelora-ocean-change-from-time-series-v1"
  });
}


/**
 * ------------------------------------------------------------
 * Historical Snapshot Backfill Contract v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Assemble and preserve one historical Ocean Memory record from
 * governed archived Observation and Intelligence Snapshots.
 *
 * The original observed time remains authoritative. The later
 * generated and stored times document reconstruction provenance.
 *
 * This contract does not compare snapshots, calculate
 * persistence, infer trends, perform species reasoning, or
 * generate captain guidance.
 */
export function buildHistoricalSnapshotBackfill({
  observationSnapshot = null,
  intelligenceSnapshot = null,
  storedAt = null,
  storageProvider = "historical-backfill-contract",
  region = null,
  subregion = null,
  locationId = null
} = {}) {
  const observationSnapshotAvailable =
    observationSnapshot
      ?.available ===
    true;

  const intelligenceSnapshotAvailable =
    intelligenceSnapshot
      ?.available ===
    true;

  const observedAt =
    observationSnapshot
      ?.observedAt ??
    null;

  const generatedAt =
    observationSnapshot
      ?.generatedAt ??
    intelligenceSnapshot
      ?.generatedAt ??
    null;

  const validObservedAt =
    typeof observedAt ===
      "string" &&
    Number.isFinite(
      Date.parse(
        observedAt
      )
    );

  const validGeneratedAt =
    typeof generatedAt ===
      "string" &&
    Number.isFinite(
      Date.parse(
        generatedAt
      )
    );

  const historicalTimeOrderValid =
    validObservedAt &&
    validGeneratedAt &&
    Date.parse(
      generatedAt
    ) >=
      Date.parse(
        observedAt
      );

  const snapshotMetadata =
    buildSnapshotMetadata({
      observationSnapshot,

      intelligenceSnapshot,

      captureMode:
        "historical-backfill",

      sourceType:
        "archived-observation",

      lifecycleState:
        "historical-backfill",

      reconstructionStatus:
        historicalTimeOrderValid
          ? "completed"
          : "invalid-time-order",

      region,

      subregion,

      locationId
    });

  const oceanSnapshot =
    buildOceanSnapshot({
      snapshotMetadata,

      observationSnapshot,

      intelligenceSnapshot
    });

  const storageRecord =
    buildOceanMemoryStorage({
      oceanSnapshot:

        historicalTimeOrderValid
          ? oceanSnapshot
          : null,

      storedAt,

      storageProvider
    });

  const available =
    observationSnapshotAvailable &&
    historicalTimeOrderValid &&
    snapshotMetadata
      ?.available ===
    true &&
    oceanSnapshot
      ?.available ===
    true &&
    storageRecord
      ?.available ===
    true;

  const missingRequirements = [
    !observationSnapshotAvailable
      ? "archived-observation-snapshot"
      : null,

    !intelligenceSnapshotAvailable
      ? "historical-intelligence-snapshot"
      : null,

    !validObservedAt
      ? "valid-historical-observed-at"
      : null,

    !validGeneratedAt
      ? "valid-backfill-generated-at"
      : null,

    validObservedAt &&
    validGeneratedAt &&
    !historicalTimeOrderValid
      ? "generated-at-not-before-observed-at"
      : null,

    snapshotMetadata
      ?.available !==
      true
      ? "historical-snapshot-metadata"
      : null,

    oceanSnapshot
      ?.available !==
      true
      ? "historical-ocean-snapshot"
      : null,

    storageRecord
      ?.available !==
      true
      ? "historical-storage-record"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          snapshotMetadata
            ?.limitations
        )
          ? snapshotMetadata
              .limitations
          : []
      ),

      ...(
        Array.isArray(
          oceanSnapshot
            ?.limitations
        )
          ? oceanSnapshot
              .limitations
          : []
      ),

      ...(
        Array.isArray(
          storageRecord
            ?.limitations
        )
          ? storageRecord
              .limitations
          : []
      ),

      ...missingRequirements,

      "Historical Snapshot Backfill preserves archived observations without changing their original observed time.",

      "Generated and stored timestamps describe when Pelora reconstructed and preserved the historical record.",

      "Historical reconstruction quality remains limited by the availability and quality of the archived source observations.",

      "This contract does not compare snapshots, calculate persistence, infer trends, perform species reasoning, or generate captain guidance."
    ])
  ];

  const backfillRecord = {
    available,

    backfillType:
      "historical-ocean-snapshot",

    responsibility:
      "preserve",

    time: {
      observedAt:
        validObservedAt
          ? observedAt
          : null,

      generatedAt:
        validGeneratedAt
          ? generatedAt
          : null,

      storedAt:
        storageRecord
          ?.storage
          ?.storedAt ??
        null,

      historicalTimeOrderValid
    },

    provenance: {
      captureMode:
        snapshotMetadata
          ?.provenance
          ?.captureMode ??
        null,

      sourceType:
        snapshotMetadata
          ?.provenance
          ?.sourceType ??
        null,

      historicalBackfill:
        snapshotMetadata
          ?.provenance
          ?.historicalBackfill ===
        true,

      reconstructionStatus:
        snapshotMetadata
          ?.provenance
          ?.reconstructionStatus ??
        null,

      storageProvider:
        storageRecord
          ?.storage
          ?.storageProvider ??
        null
    },

    identity:
      cloneSnapshotValue(
        oceanSnapshot
          ?.identity ??
        null
      ),

    snapshotMetadata:
      cloneSnapshotValue(
        snapshotMetadata
      ),

    oceanSnapshot:
      available
        ? cloneSnapshotValue(
            oceanSnapshot
          )
        : null,

    storageRecord:
      available
        ? cloneSnapshotValue(
            storageRecord
          )
        : null,

    governedVersions: {
      snapshotMetadata:
        snapshotMetadata
          ?.contractVersion ??
        null,

      oceanSnapshot:
        oceanSnapshot
          ?.contractVersion ??
        null,

      oceanMemoryStorage:
        storageRecord
          ?.contractVersion ??
        null,

      historicalBackfill:
        "pelora-historical-snapshot-backfill-v1"
    },

    missingRequirements,

    limitations,

    contractVersion:
      "pelora-historical-snapshot-backfill-v1"
  };

  return deepFreezeSnapshotValue(
    backfillRecord
  );
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

  const sourceProvider =
    chlorophyll?.source
      ?.provider ??
    null;

  const observationType =
    chlorophyll?.source
      ?.observationType ??
    "direct-satellite";

  const available =
    concentrationMgM3 !== null;

  const drivers = [];

  const limitations = [
    "clarity-inferred-from-surface-chlorophyll",
    observationType ===
      "gap-filled-reconstruction"
      ? "gap-filled-satellite-derived-reconstruction"
      : "satellite-observation",
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
        sourceProvider,
        observationType,
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
      sourceProvider,
      observationType,
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


function findNearestStructure(
  latitude,
  longitude
) {
  let nearest = null;

  for (const structure of VERIFIED_STRUCTURES) {

    const [lat, lon] =
      structure.coordinates;

    const distance =
      nauticalMilesBetween(
        latitude,
        longitude,
        lat,
        lon
      );

    if (
      !nearest ||
      distance < nearest.distanceNm
    ) {
      nearest = {
        structure,
        distanceNm: distance
      };
    }
  }

  return nearest;
}


/**
 * ------------------------------------------------------------
 * Structure Evidence Contract v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Describe species-neutral relationships between mapped
 * seafloor or fixed offshore structure and observed ocean
 * conditions.
 *
 * This evidence group may eventually describe:
 *
 * - continental shelf edges
 * - canyon walls and canyon heads
 * - escarpments
 * - banks and ridges
 * - seamounts or isolated highs
 * - sharp bathymetric gradients
 * - offshore platforms
 * - fixed FADs
 * - other verified fixed offshore structures
 *
 * Structure presence alone does not establish:
 *
 * - current interaction
 * - thermal interaction
 * - convergence
 * - upwelling
 * - bait or prey concentration
 * - feeding activity
 * - fish presence
 * - habitat quality
 * - fishing quality
 *
 * Higher-value interaction classifications must eventually
 * require spatial evidence that an observed ocean feature is
 * genuinely associated with the mapped structure.
 *
 * Canonical future classifications:
 *
 * unavailable
 *   Structure analysis has not been performed.
 *
 * structure-location-known
 *   A verified structure exists near the assessment location,
 *   but environmental interaction has not been established.
 *
 * recognized-offshore-structure
 *   A known offshore structure type has been identified with
 *   sufficient location and source confidence.
 *
 * structure-near-environmental-transition
 *   A verified structure lies near a detected environmental
 *   transition, but causal interaction is not established.
 *
 * current-bathymetry-interaction
 *   Current evidence is spatially associated with bathymetric
 *   or fixed structure.
 *
 * thermal-bathymetry-interaction
 *   Thermal organization is spatially associated with
 *   bathymetric or fixed structure.
 *
 * multi-signal-structure-interaction
 *   Multiple independent environmental signals are spatially
 *   associated with the same verified structure.
 *
 * Canonical future feature types:
 *
 * continental-shelf-edge
 * canyon
 * escarpment
 * bank
 * ridge
 * seamount
 * isolated-bathymetric-high
 * sharp-bathymetric-gradient
 * offshore-platform
 * fixed-fad
 * other-verified-fixed-structure
 *
 * Canonical future values:
 *
 * featureType
 * featureName
 * featureSource
 * nearestStructureDistanceNm
 * depthFeet
 * depthChangeFeet
 * analysisRadiusNm
 * bathymetricGradient
 * currentInteraction
 * thermalInteraction
 * productivityInteraction
 * multiSignalInteraction
 * observedAt
 * ageHours
 * freshness
 *
 * Canonical future confidence object:
 *
 * score
 * level
 * limitations
 *
 * The contract is intentionally returned in an unavailable
 * state until Pelora connects verified structure data and
 * spatial interaction analysis.
 */
function buildStructureMetadata({
  structure,
  distanceNm
}) {
  const sourceAgency =
    structure.source?.agency ??
    "Unknown";

  const influenceRadiusMeters =
    safeNumber(
      structure.influenceRadius
    );

  const analysisRadiusNm =
    influenceRadiusMeters === null
      ? null
      : Number(
          (
            influenceRadiusMeters /
            1852
          ).toFixed(2)
        );

  const depthMatch =
    typeof structure.depth === "string"
      ? structure.depth.match(
          /([\d,.]+)\s*ft/i
        )
      : null;

  const depthFeet =
    depthMatch
      ? safeNumber(
          depthMatch[1].replace(
            /,/g,
            ""
          )
        )
      : null;

  return {
    featureType:
      structure.type ??
      structure.category ??
      "Offshore Structure",

    featureName:
      structure.name ??
      structure.shortName ??
      "Unnamed Structure",

    featureSource:
      sourceAgency,

    nearestStructureDistanceNm:
      distanceNm,

    depthFeet,

    depthChangeFeet: null,

    analysisRadiusNm,

    bathymetricGradient: null,

    observedAt:
      structure.source?.reportDate ??
      structure.source?.importedAt ??
      null,

    ageHours: null,

    freshness:
      "verified-static"
  };
}


function evaluateCurrentInteraction(
  current
) {
  if (!current?.available) {
    return {
      currentInteraction: false,
      classification:
        "unavailable",
      convergenceDetected: false,
      shearDetected: false,
      currentEdgeDetected: false,
      eddyBoundaryDetected: false
    };
  }

  return {
    currentInteraction: false,
    classification:
      "single-point-current-only",
    convergenceDetected: false,
    shearDetected: false,
    currentEdgeDetected: false,
    eddyBoundaryDetected: false
  };
}


function evaluateThermalInteraction() {
  return {
    thermalInteraction: false
  };
}


function evaluateProductivityInteraction() {
  return {
    productivityInteraction: false
  };
}


function buildStructureConfidence({
  structure,
  featureSource
}) {
  const sourceVerified =
    structure.source?.verified === true ||
    featureSource === "BOEM";

  return {
    score:
      sourceVerified
        ? 95
        : 80,

    level:
      sourceVerified
        ? "High"
        : "Moderate",

    limitations: [
      "location-may-be-approximate",
      "nearest-structure-only",
      "structure-presence-does-not-confirm-biological-activity"
    ]
  };
}


function buildStructureEvidence({
  latitude,
  longitude,
current
}) {
  const validLatitude =
    safeNumber(latitude);

  const validLongitude =
    safeNumber(longitude);

  const unavailableValues = {
    featureType: null,
    featureName: null,
    featureSource: null,
    nearestStructureDistanceNm:
      null,
    depthFeet: null,
    depthChangeFeet: null,
    analysisRadiusNm: null,
    bathymetricGradient: null,
    currentInteraction: false,
    currentInteractionClassification:
      "unavailable",
    currentConvergenceDetected: false,
    currentShearDetected: false,
    currentEdgeDetected: false,
    eddyBoundaryDetected: false,
    thermalInteraction: false,
    productivityInteraction: false,
    multiSignalInteraction: false,
    observedAt: null,
    ageHours: null,
    freshness: null
  };

  if (
    validLatitude === null ||
    validLongitude === null
  ) {
    return {
      available: false,

      classification:
        "unavailable",

      headline:
        "Structure interaction unavailable",

      detail:
        "A valid analysis location was not available.",

      reason:
        "invalid-analysis-location",

      interpretation:
        "species-neutral-structure-evidence",

      values:
        unavailableValues,

      confidence: {
        score: 0,
        level: "Unavailable",
        limitations: [
          "invalid-analysis-location"
        ]
      },

      limitations: [
        "invalid-analysis-location",
        "does-not-evaluate-bathymetry",
        "does-not-evaluate-current-interaction",
        "does-not-establish-fish-presence"
      ]
    };
  }

  const nearest =
    findNearestStructure(
      validLatitude,
      validLongitude
    );

  if (!nearest?.structure) {
    return {
      available: false,

      classification:
        "unavailable",

      headline:
        "Structure interaction unavailable",

      detail:
        "No verified offshore structure was available for spatial analysis.",

      reason:
        "verified-structure-catalog-empty",

      interpretation:
        "species-neutral-structure-evidence",

      values:
        unavailableValues,

      confidence: {
        score: 0,
        level: "Unavailable",
        limitations: [
          "verified-structure-catalog-empty"
        ]
      },

      limitations: [
        "verified-structure-catalog-empty",
        "does-not-evaluate-bathymetry",
        "does-not-evaluate-current-interaction",
        "does-not-establish-fish-presence"
      ]
    };
  }

  const structure =
    nearest.structure;

  const distanceNm =
    nearest.distanceNm;

  const metadata =
    buildStructureMetadata({
      structure,
      distanceNm
    });

  const currentInteraction =
    evaluateCurrentInteraction(
      current
    );

  const thermalInteraction =
    evaluateThermalInteraction();

  const productivityInteraction =
    evaluateProductivityInteraction();

  const multiSignalInteraction =
    currentInteraction
      .currentInteraction === true &&
    (
      thermalInteraction
        .thermalInteraction === true ||
      productivityInteraction
        .productivityInteraction === true
    );

  const confidence =
    buildStructureConfidence({
      structure,
      featureSource:
        metadata.featureSource
    });

  return {
    available: true,

    classification:
      "verified-structure-proximity",

    headline:
      "Verified offshore structure identified",

    detail:
      `${metadata.featureName} is the nearest verified structure, approximately ${distanceNm} nautical miles from the analysis location.`,

    reason:
      "nearest-verified-structure-identified",

    interpretation:
      "species-neutral-structure-evidence",

    values: {
      ...metadata,

      currentInteraction:
        currentInteraction
          .currentInteraction,

      currentInteractionClassification:
        currentInteraction
          .classification,

      currentConvergenceDetected:
        currentInteraction
          .convergenceDetected,

      currentShearDetected:
        currentInteraction
          .shearDetected,

      currentEdgeDetected:
        currentInteraction
          .currentEdgeDetected,

      eddyBoundaryDetected:
        currentInteraction
          .eddyBoundaryDetected,

      thermalInteraction:
        thermalInteraction
          .thermalInteraction,

      productivityInteraction:
        productivityInteraction
          .productivityInteraction,

      multiSignalInteraction
    },

    confidence,

    limitations: [
      "nearest-structure-only",
      "location-may-be-approximate",
      "does-not-evaluate-bathymetry",
      "does-not-evaluate-current-interaction",
      "does-not-evaluate-thermal-interaction",
      "does-not-evaluate-productivity-interaction",
      "does-not-establish-fish-presence",
      "does-not-indicate-species-suitability"
    ]
  };
}


/**
 * ------------------------------------------------------------
 * Open-Water Organization Evidence Contract v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Provide a stable, species-neutral contract for describing
 * environmental organization that may exist independently of
 * physical structure.
 *
 * Open-water opportunity may be supported by verified current
 * convergence, current shear, current edges, eddy boundaries,
 * thermal boundaries, productivity boundaries, or interacting
 * water masses.
 *
 * Physical structure is not required. The absence of nearby
 * structure must remain neutral unless a later species-specific
 * model explicitly requires it.
 */
export function buildOpenWaterEvidence({
  current = null,
  thermal = null,
  productivity = null
} = {}) {
  const currentAvailable =
    current?.available === true;

  const thermalAvailable =
    thermal?.available === true;

  const productivityAvailable =
    productivity?.available === true;

  /*
   * A single current observation can describe local current
   * speed and direction, but cannot establish spatial
   * convergence, shear, an edge, or an eddy boundary.
   */
  const currentConvergenceDetected =
    current?.convergenceDetected === true;

  const currentShearDetected =
    current?.shearDetected === true;

  const currentEdgeDetected =
    current?.currentEdgeDetected === true;

  const eddyBoundaryDetected =
    current?.eddyBoundaryDetected === true;

  const thermalBoundaryDetected =
    thermal?.boundaryDetected === true;

  const productivityBoundaryDetected =
    productivity?.boundaryDetected === true;

  const waterMassInteractionDetected =
    thermal?.waterMassInteractionDetected === true ||
    productivity?.waterMassInteractionDetected === true;

  const organizationSignals = [
    currentConvergenceDetected,
    currentShearDetected,
    currentEdgeDetected,
    eddyBoundaryDetected,
    thermalBoundaryDetected,
    productivityBoundaryDetected,
    waterMassInteractionDetected
  ];

  const organizationSignalCount =
    organizationSignals.filter(Boolean).length;

  const available =
    currentAvailable ||
    thermalAvailable ||
    productivityAvailable;

  const organized =
    organizationSignalCount > 0;

  let classification;
  let headline;
  let detail;
  let reason;

  if (!available) {
    classification =
      "unavailable";

    headline =
      "Open-water organization unavailable";

    detail =
      "Spatial current, thermal-boundary, productivity-boundary, and water-mass interaction evidence has not yet been connected.";

    reason =
      "open-water-spatial-analysis-not-yet-connected";
  } else if (!organized) {
    classification =
      "observations-available-no-verified-organization";

    headline =
      "No open-water organization has been verified";

    detail =
      "Available observations do not currently establish convergence, shear, an eddy boundary, a thermal boundary, a productivity boundary, or interacting water masses.";

    reason =
      "no-verified-open-water-organization";
  } else if (
    organizationSignalCount >= 2
  ) {
    classification =
      "multi-signal-open-water-organization";

    headline =
      "Multiple open-water organization signals identified";

    detail =
      "Multiple independent environmental signals support a species-neutral open-water organization candidate.";

    reason =
      "multiple-open-water-signals-identified";
  } else {
    classification =
      "single-signal-open-water-organization";

    headline =
      "Open-water organization signal identified";

    detail =
      "One verified environmental signal supports a species-neutral open-water organization candidate.";

    reason =
      "single-open-water-signal-identified";
  }

  const limitations = [];

  if (!currentAvailable) {
    limitations.push(
      "spatial-current-analysis-unavailable"
    );
  }

  if (!thermalAvailable) {
    limitations.push(
      "thermal-boundary-analysis-unavailable"
    );
  }

  if (!productivityAvailable) {
    limitations.push(
      "productivity-boundary-analysis-unavailable"
    );
  }

  limitations.push(
    "single-point-observations-do-not-establish-spatial-organization",
    "open-water-organization-does-not-establish-prey-concentration",
    "open-water-organization-does-not-establish-fish-presence",
    "does-not-indicate-species-suitability"
  );

  return {
    available,

    classification,

    headline,

    detail,

    reason,

    interpretation:
      "species-neutral-open-water-organization-evidence",

    values: {
      organized,
      organizationSignalCount,

      currentConvergenceDetected,
      currentShearDetected,
      currentEdgeDetected,
      eddyBoundaryDetected,

      thermalBoundaryDetected,
      productivityBoundaryDetected,
      waterMassInteractionDetected,

      structureRequired: false,

      observedAt:
        current?.observedAt ??
        thermal?.observedAt ??
        productivity?.observedAt ??
        null,

      ageHours:
        current?.ageHours ??
        thermal?.ageHours ??
        productivity?.ageHours ??
        null,

      freshness:
        current?.freshness ??
        thermal?.freshness ??
        productivity?.freshness ??
        "unknown"
    },

    confidence: {
      score:
        !available
          ? 0
          : organizationSignalCount >= 2
            ? 80
            : organized
              ? 65
              : 40,

      level:
        !available
          ? "Unavailable"
          : organizationSignalCount >= 2
            ? "High"
            : organized
              ? "Moderate"
              : "Limited",

      limitations
    },

    drivers: [
      currentConvergenceDetected
        ? "current-convergence"
        : null,

      currentShearDetected
        ? "current-shear"
        : null,

      currentEdgeDetected
        ? "current-edge"
        : null,

      eddyBoundaryDetected
        ? "eddy-boundary"
        : null,

      thermalBoundaryDetected
        ? "thermal-boundary"
        : null,

      productivityBoundaryDetected
        ? "productivity-boundary"
        : null,

      waterMassInteractionDetected
        ? "water-mass-interaction"
        : null
    ].filter(Boolean),

    limitations
  };
}


/**
 * ------------------------------------------------------------
 * Environmental Opportunity Evidence Contract v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Combine independent, species-neutral evidence pathways
 * without making physical structure a prerequisite.
 *
 * Structure evidence, open-water organization evidence, and
 * persistence evidence remain independently inspectable.
 */
export function buildEnvironmentalOpportunityEvidence({
  structureEvidence = null,
  openWaterEvidence = null,
  persistenceEvidence = null
} = {}) {
  const structureAvailable =
    structureEvidence?.available === true;

  const openWaterAvailable =
    openWaterEvidence?.available === true;

  const openWaterOrganized =
    openWaterEvidence
      ?.values
      ?.organized === true;

  const persistenceAvailable =
    persistenceEvidence?.available === true;

  let classification;
  let headline;
  let detail;

  if (
    structureAvailable &&
    openWaterOrganized
  ) {
    classification =
      "structure-and-open-water-evidence";

    headline =
      "Structure and open-water evidence are both present";

    detail =
      "A verified structure is nearby and independent environmental organization is also supported.";
  } else if (openWaterOrganized) {
    classification =
      "open-water-evidence";

    headline =
      "Open-water opportunity evidence is present";

    detail =
      "Environmental organization is supported without requiring nearby physical structure.";
  } else if (structureAvailable) {
    classification =
      "structure-evidence";

    headline =
      "Structure evidence is present";

    detail =
      "A verified offshore structure is nearby, but open-water environmental organization has not been established.";
  } else {
    classification =
      "insufficient-environmental-opportunity-evidence";

    headline =
      "Environmental opportunity evidence remains limited";

    detail =
      "Neither verified nearby structure nor verified open-water organization currently supports an opportunity pathway.";
  }

  const available =
    structureAvailable ||
    openWaterAvailable ||
    persistenceAvailable;

  return {
    available,

    classification,

    headline,

    detail,

    interpretation:
      "species-neutral-environmental-opportunity-evidence",

    pathways: {
      structureAssociated: {
        available:
          structureAvailable,

        evidence:
          structureEvidence
      },

      openWater: {
        available:
          openWaterAvailable,

        organized:
          openWaterOrganized,

        evidence:
          openWaterEvidence
      },

      persistence: {
        available:
          persistenceAvailable,

        evidence:
          persistenceEvidence
      }
    },

    rules: {
      structureRequired: false,
      missingStructureIsNegative: false,
      structureAbsenceTreatment:
        "neutral",
      speciesSpecificRequirementsDeferred:
        true
    },

    limitations: [
      "does-not-establish-prey-concentration",
      "does-not-establish-fish-presence",
      "does-not-indicate-species-suitability",
      "species-specific-interpretation-not-applied"
    ]
  };
}


/**
 * ------------------------------------------------------------
 * Persistence Evidence Contract v2.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Evaluate whether a governed environmental feature remains
 * organized through time using chronological Ocean Memory
 * records.
 *
 * The default no-history behavior remains compatible with the
 * original Persistence Evidence v1.0 contract.
 *
 * This contract is species-neutral. It does not establish prey
 * concentration, fish presence, habitat quality, fishing
 * quality, species probability, or captain guidance.
 */
export function buildPersistenceEvidence({
  historicalSnapshots = []
} = {}) {
  const snapshotsInput =
    Array.isArray(
      historicalSnapshots
    )
      ? historicalSnapshots
      : [];

  const normalizedSnapshots =
    snapshotsInput
      .map(record => {
        const oceanSnapshot =
          record
            ?.storageRecord
            ?.snapshot ??
          record
            ?.snapshot ??
          record
            ?.oceanSnapshot ??
          null;

        const available =
          oceanSnapshot
            ?.available ===
          true;

        const snapshotId =
          oceanSnapshot
            ?.identity
            ?.snapshotId ??
          null;

        const observedAt =
          oceanSnapshot
            ?.metadata
            ?.time
            ?.observedAt ??
          oceanSnapshot
            ?.observation
            ?.observedAt ??
          null;

        const oceanOrganization =
          oceanSnapshot
            ?.observation
            ?.oceanOrganization ??
          oceanSnapshot
            ?.intelligence
            ?.oceanOrganization ??
          null;

        const organizationAvailable =
          oceanOrganization
            ?.available ===
          true;

        const organizationIndex =
          Number.isFinite(
            oceanOrganization
              ?.organizationIndex
          )
            ? oceanOrganization
                .organizationIndex
            : null;

        const organizationLevel =
          typeof oceanOrganization
            ?.organizationLevel ===
            "string"
            ? oceanOrganization
                .organizationLevel
            : null;

        const organizationState =
          typeof oceanOrganization
            ?.organizationState ===
            "string"
            ? oceanOrganization
                .organizationState
            : null;

        const organizationSignalCount =
          Number.isFinite(
            oceanOrganization
              ?.organizationSignalCount
          )
            ? oceanOrganization
                .organizationSignalCount
            : null;

        const validOrganization =
          organizationAvailable &&
          organizationIndex !==
            null;

        const observedAtTimestamp =
          typeof observedAt ===
            "string"
            ? Date.parse(
                observedAt
              )
            : Number.NaN;

        const validObservedAt =
          Number.isFinite(
            observedAtTimestamp
          );

        return {
          record,

          oceanSnapshot,

          available,

          snapshotId,

          observedAt:
            validObservedAt
              ? observedAt
              : null,

          observedAtTimestamp:
            validObservedAt
              ? observedAtTimestamp
              : null,

          oceanOrganization,

          organizationAvailable,

          organizationIndex,

          organizationLevel,

          organizationState,

          organizationSignalCount,

          validOrganization,

          valid:
            available &&
            typeof snapshotId ===
              "string" &&
            snapshotId.trim().length >
              0 &&
            validObservedAt
        };
      })
      .filter(
        snapshot =>
          snapshot.valid
      )
      .sort(
        (
          firstSnapshot,
          secondSnapshot
        ) =>
          firstSnapshot
            .observedAtTimestamp -
          secondSnapshot
            .observedAtTimestamp
      );

  const uniqueSnapshots = [];

  const seenSnapshotIds =
    new Set();

  for (
    const snapshot of
      normalizedSnapshots
  ) {
    if (
      seenSnapshotIds.has(
        snapshot.snapshotId
      )
    ) {
      continue;
    }

    seenSnapshotIds.add(
      snapshot.snapshotId
    );

    uniqueSnapshots.push(
      snapshot
    );
  }

  const sampleCount =
    uniqueSnapshots.length;

  const firstSnapshot =
    sampleCount >
      0
      ? uniqueSnapshots[0]
      : null;

  const lastSnapshot =
    sampleCount >
      0
      ? uniqueSnapshots[
          sampleCount - 1
        ]
      : null;

  const firstObservedAt =
    firstSnapshot
      ?.observedAt ??
    null;

  const lastObservedAt =
    lastSnapshot
      ?.observedAt ??
    null;

  const durationHours =
    firstSnapshot &&
    lastSnapshot
      ? (
          lastSnapshot
            .observedAtTimestamp -
          firstSnapshot
            .observedAtTimestamp
        ) /
        (
          1000 *
          60 *
          60
        )
      : null;

  const chronologicalHistoryAvailable =
    sampleCount >=
      2 &&
    Number.isFinite(
      durationHours
    ) &&
    durationHours >
      0;

  if (
    sampleCount ===
    0
  ) {
    return deepFreezeSnapshotValue({
      available:
        false,

      classification:
        "unavailable",

      headline:
        "Feature persistence unavailable",

      detail:
        "Repeated observations have not yet been analyzed to determine whether this environmental feature is developing, stable, persistent, or fading.",

      reason:
        "persistence-analysis-not-yet-implemented",

      values: {
        lifecycleState:
          null,

        observationWindowHours:
          null,

        sampleCount:
          null,

        firstObservedAt:
          null,

        lastObservedAt:
          null,

        durationHours:
          null,

        temporalAgreement:
          null,

        featureMovementNm:
          null,

        temperatureStability:
          null,

        currentStability:
          null,

        productivityConsistency:
          null,

        multiSignalPersistence:
          false,

        observedAt:
          null,

        ageHours:
          null,

        freshness:
          "unknown"
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable",

        limitations: [
          "historical-observations-not-connected",
          "temporal-feature-comparison-not-assessed"
        ]
      },

      drivers:
        [],

      limitations: [
        "historical-observations-not-connected",
        "repeated-observations-not-assessed",
        "feature-duration-not-established",
        "feature-movement-not-assessed",
        "forecast-continuity-not-assessed",
        "single-time-observation-does-not-establish-persistence",
        "persistence-does-not-establish-prey-or-fish-presence"
      ],

      interpretation:
        "species-neutral-persistence-evidence",

      contractVersion:
        "pelora-persistence-evidence-v2"
    });
  }

  if (
    !chronologicalHistoryAvailable
  ) {
    return deepFreezeSnapshotValue({
      available:
        false,

      classification:
        "insufficient-history",

      headline:
        "More historical observations are required",

      detail:
        "At least two distinct chronological Ocean Memory snapshots are required before Pelora can evaluate environmental persistence.",

      reason:
        "insufficient-chronological-history",

      values: {
        lifecycleState:
          null,

        observationWindowHours:
          durationHours,

        sampleCount,

        firstObservedAt,

        lastObservedAt,

        durationHours,

        temporalAgreement:
          null,

        featureMovementNm:
          null,

        temperatureStability:
          null,

        currentStability:
          null,

        productivityConsistency:
          null,

        multiSignalPersistence:
          false,

        observedAt:
          lastObservedAt,

        ageHours:
          null,

        freshness:
          "unknown"
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable",

        limitations: [
          "minimum-two-chronological-snapshots-required",
          "temporal-feature-comparison-not-assessed"
        ]
      },

      drivers: [
        "governed-historical-snapshot-available"
      ],

      limitations: [
        "minimum-two-chronological-snapshots-required",
        "feature-duration-not-established",
        "feature-movement-not-assessed",
        "temporal-agreement-not-assessed",
        "forecast-continuity-not-assessed",
        "single-time-observation-does-not-establish-persistence",
        "persistence-does-not-establish-prey-or-fish-presence"
      ],

      interpretation:
        "species-neutral-persistence-evidence",

      contractVersion:
        "pelora-persistence-evidence-v2"
    });
  }

  const organizationSnapshots =
  uniqueSnapshots.filter(
    snapshot =>
      snapshot
        .validOrganization
  );

const organizationSampleCount =
  organizationSnapshots.length;

const firstOrganizationSnapshot =
  organizationSampleCount >
    0
    ? organizationSnapshots[0]
    : null;

const lastOrganizationSnapshot =
  organizationSampleCount >
    0
    ? organizationSnapshots[
        organizationSampleCount - 1
      ]
    : null;

const firstOrganizationIndex =
  firstOrganizationSnapshot
    ?.organizationIndex ??
  null;

const lastOrganizationIndex =
  lastOrganizationSnapshot
    ?.organizationIndex ??
  null;

const organizationIndexChange =
  firstOrganizationIndex !==
    null &&
  lastOrganizationIndex !==
    null
    ? lastOrganizationIndex -
      firstOrganizationIndex
    : null;

const organizationHistoryAvailable =
  organizationSampleCount >=
    2 &&
  firstOrganizationSnapshot
    ?.observedAtTimestamp !==
  lastOrganizationSnapshot
    ?.observedAtTimestamp;

if (
  !organizationHistoryAvailable
) {
  return deepFreezeSnapshotValue({
    available:
      false,

    classification:
      "temporal-analysis-pending",

    headline:
      "Historical observations are ready for temporal comparison",

    detail:
      "Multiple chronological Ocean Memory snapshots are available, but at least two snapshots with governed Ocean Organization evidence are required for lifecycle classification.",

    reason:
      "organization-history-insufficient",

    values: {
      lifecycleState:
        null,

      observationWindowHours:
        durationHours,

      sampleCount,

      organizationSampleCount,

      firstObservedAt,

      lastObservedAt,

      durationHours,

      temporalAgreement:
        null,

      organizationIndexStart:
        firstOrganizationIndex,

      organizationIndexEnd:
        lastOrganizationIndex,

      organizationIndexChange,

      featureMovementNm:
        null,

      temperatureStability:
        null,

      currentStability:
        null,

      productivityConsistency:
        null,

      multiSignalPersistence:
        false,

      observedAt:
        lastObservedAt,

      ageHours:
        null,

      freshness:
        "unknown"
    },

    confidence: {
      score:
        0,

      level:
        "Unavailable",

      limitations: [
        "minimum-two-organization-snapshots-required",
        "lifecycle-classification-not-assessed"
      ]
    },

    drivers: [
      "multiple-governed-historical-snapshots-available",
      "chronological-observation-window-established"
    ],

    limitations: [
      "minimum-two-organization-snapshots-required",
      "feature-movement-not-assessed",
      "temperature-stability-not-assessed",
      "current-stability-not-assessed",
      "productivity-consistency-not-assessed",
      "forecast-continuity-not-assessed",
      "persistence-does-not-establish-prey-or-fish-presence"
    ],

    interpretation:
      "species-neutral-persistence-evidence",

    contractVersion:
      "pelora-persistence-evidence-v2"
  });
}

let classification =
  "stable";

let lifecycleState =
  "stable";

let headline =
  "Ocean organization remained broadly stable";

let detail =
  "The governed Ocean Organization index remained within a narrow range across the observation window.";

const firstOrganized =
  firstOrganizationIndex >=
    3;

const lastOrganized =
  lastOrganizationIndex >=
    3;

if (
  !firstOrganized &&
  lastOrganized
) {
  classification =
    "developing";

  lifecycleState =
    "developing";

  headline =
    "Ocean organization developed during the observation window";

  detail =
    "The governed Ocean Organization index progressed from limited or uniform evidence into developing or stronger organization.";
} else if (
  firstOrganized &&
  lastOrganizationIndex ===
    0
) {
  classification =
    "fading";

  lifecycleState =
    "fading";

  headline =
    "Previously organized ocean context faded";

  detail =
    "Earlier governed organization evidence declined to a uniform Ocean Organization index by the end of the observation window.";
} else if (
  organizationIndexChange >=
    2
) {
  classification =
    "strengthening";

  lifecycleState =
    "strengthening";

  headline =
    "Ocean organization strengthened";

  detail =
    "The governed Ocean Organization index increased meaningfully across the observation window.";
} else if (
  organizationIndexChange <=
    -2
) {
  classification =
    "weakening";

  lifecycleState =
    "weakening";

  headline =
    "Ocean organization weakened";

  detail =
    "The governed Ocean Organization index decreased meaningfully across the observation window.";
}

const temporalAgreement =
  organizationSampleCount ===
    2
    ? (
        Math.abs(
          organizationIndexChange
        ) <=
        1
          ? "high"
          : "changing"
      )
    : "multi-snapshot";

const multiSignalPersistence =
  firstOrganized &&
  lastOrganized;

const confidenceScore =
  Math.min(
    80,
    40 +
    (
      organizationSampleCount *
      10
    )
  );

const confidenceLevel =
  confidenceScore >=
    70
    ? "High"
    : confidenceScore >=
        50
      ? "Moderate"
      : "Low";

return deepFreezeSnapshotValue({
  available:
    true,

  classification,

  headline,

  detail,

  reason:
    "governed-ocean-organization-history-assessed",

  values: {
    lifecycleState,

    observationWindowHours:
      durationHours,

    sampleCount,

    organizationSampleCount,

    firstObservedAt,

    lastObservedAt,

    durationHours,

    temporalAgreement,

    organizationIndexStart:
      firstOrganizationIndex,

    organizationIndexEnd:
      lastOrganizationIndex,

    organizationIndexChange,

    featureMovementNm:
      null,

    temperatureStability:
      null,

    currentStability:
      null,

    productivityConsistency:
      null,

    multiSignalPersistence,

    observedAt:
      lastObservedAt,

    ageHours:
      null,

    freshness:
      "unknown"
  },

  confidence: {
    score:
      confidenceScore,

    level:
      confidenceLevel,

    limitations: [
      "confidence-derived-from-governed-organization-history",
      "feature-movement-not-assessed",
      "forecast-continuity-not-assessed"
    ]
  },

  drivers: [
    "multiple-governed-historical-snapshots-available",
    "chronological-observation-window-established",
    "governed-ocean-organization-history-available",
    `organization-lifecycle-${lifecycleState}`
  ],

  limitations: [
    "organization-index-comparison-does-not-confirm-feature-identity-across-space",
    "feature-movement-not-assessed",
    "temperature-stability-not-independently-assessed",
    "current-stability-not-independently-assessed",
    "productivity-consistency-not-assessed",
    "forecast-continuity-not-assessed",
    "persistence-does-not-establish-prey-or-fish-presence",
    "persistence-does-not-establish-habitat-quality-or-fishing-opportunity"
  ],

  interpretation:
    "species-neutral-persistence-evidence",

  contractVersion:
    "pelora-persistence-evidence-v2"
 });

}


/**
 * ------------------------------------------------------------
 * Feature Persistence Contract v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Provide one governed contract shape for every environmental
 * feature evaluated by the Ocean Persistence Engine.
 */

export const OCEAN_PERSISTENCE_LIFECYCLE_STATES =
  Object.freeze([
    "emerging",
    "developing",
    "stable",
    "strengthening",
    "weakening",
    "fading"
  ]);

export const OCEAN_PERSISTENCE_FEATURE_FAMILIES =
  Object.freeze([
    "physical-ocean",
    "biological-ocean",
    "chemical-ocean",
    "integrated-ocean-physics"
  ]);

export function buildFeaturePersistenceContract({
  available = false,
  featureType = null,
  featureFamily = null,
  classification = "not-assessed",
  lifecycleState = null,
  reason = "feature-persistence-analyzer-not-connected",
  values = {},
  confidence = {},
  drivers = [],
  limitations = []
} = {}) {
  const validFeatureType =
    typeof featureType ===
      "string" &&
    featureType.trim().length >
      0;

  const validFeatureFamily =
    OCEAN_PERSISTENCE_FEATURE_FAMILIES
      .includes(
        featureFamily
      );

  const validLifecycleState =
    lifecycleState ===
      null ||
    OCEAN_PERSISTENCE_LIFECYCLE_STATES
      .includes(
        lifecycleState
      );

  const contractAvailable =
    available ===
      true &&
    validFeatureType &&
    validFeatureFamily &&
    validLifecycleState;

  const normalizedLimitations = [
    ...(
      Array.isArray(
        limitations
      )
        ? limitations
        : []
    )
  ];

  if (
    !validFeatureType
  ) {
    normalizedLimitations.push(
      "feature-type-missing-or-invalid"
    );
  }

  if (
    !validFeatureFamily
  ) {
    normalizedLimitations.push(
      "feature-family-missing-or-invalid"
    );
  }

  if (
    !validLifecycleState
  ) {
    normalizedLimitations.push(
      "lifecycle-state-not-governed"
    );
  }

  return deepFreezeSnapshotValue({
    available:
      contractAvailable,

    featureType:
      validFeatureType
        ? featureType
        : null,

    featureFamily:
      validFeatureFamily
        ? featureFamily
        : null,

    classification:
      typeof classification ===
        "string"
        ? classification
        : "not-assessed",

    lifecycleState:
      validLifecycleState
        ? lifecycleState
        : null,

    reason:
      typeof reason ===
        "string"
        ? reason
        : "feature-persistence-contract-invalid",

    values: {
      ...(
        values &&
        typeof values ===
          "object" &&
        !Array.isArray(
          values
        )
          ? values
          : {}
      )
    },

    confidence: {
      score:
        Number.isFinite(
          confidence
            ?.score
        )
          ? confidence
              .score
          : 0,

      level:
        typeof confidence
          ?.level ===
          "string"
          ? confidence
              .level
          : "Unavailable"
    },

    drivers: [
      ...(
        Array.isArray(
          drivers
        )
          ? drivers
          : []
      )
    ],

    limitations: [
      ...new Set(
        normalizedLimitations
      )
    ],

    responsibility:
      "Compare",

    interpretation:
      "species-neutral-feature-persistence",

    contractVersion:
      "pelora-feature-persistence-v1"
  });
}


export const GOVERNED_FEATURE_POSITION_TYPES =
  Object.freeze([
    "point",
    "centroid"
  ]);

export const GOVERNED_FEATURE_POSITION_SOURCES =
  Object.freeze([
    "derived-feature-analysis",
    "preserved-feature-geometry"
  ]);


  /**
 * ------------------------------------------------------------
 * Governed Feature Position v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Preserve.
 *
 * Purpose:
 * Preserve an explicit governed position for one ocean feature.
 *
 * Feature position must originate from governed feature-analysis
 * evidence or preserved feature geometry. Observation, request,
 * query-center, and snapshot coordinates must not be used as
 * fallback feature positions.
 *
 * This contract preserves position only. It does not compare
 * positions, calculate displacement, infer movement, establish
 * spatial feature identity, calculate opportunity, perform
 * species reasoning, or generate captain guidance.
 */
export function buildGovernedFeaturePosition({
  featureType = null,
  featureFamily = null,
  positionType = null,
  latitude = null,
  longitude = null,
  observedAt = null,
  sourceType = null,
  sourceContractVersion = null
} = {}) {

    const validFeatureType =
    typeof featureType ===
      "string" &&
    featureType
      .trim()
      .length >
      0;

  const validFeatureFamily =
    OCEAN_PERSISTENCE_FEATURE_FAMILIES
      .includes(
        featureFamily
      );

  const validPositionType =
    GOVERNED_FEATURE_POSITION_TYPES
      .includes(
        positionType
      );

  const validLatitude =
    Number.isFinite(
      latitude
    ) &&
    latitude >=
      -90 &&
    latitude <=
      90;

  const validLongitude =
    Number.isFinite(
      longitude
    ) &&
    longitude >=
      -180 &&
    longitude <=
      180;

  const validObservedAt =
    typeof observedAt ===
      "string" &&
    Number.isFinite(
      Date.parse(
        observedAt
      )
    );

  const validSourceType =
    GOVERNED_FEATURE_POSITION_SOURCES
      .includes(
        sourceType
      );

  const validSourceContractVersion =
    typeof sourceContractVersion ===
      "string" &&
    sourceContractVersion
      .trim()
      .length >
      0;

  const available =
    validFeatureType &&
    validFeatureFamily &&
    validPositionType &&
    validLatitude &&
    validLongitude &&
    validObservedAt &&
    validSourceType &&
    validSourceContractVersion;

  const missingRequirements = [
    !validFeatureType
      ? "governed-feature-type"
      : null,

    !validFeatureFamily
      ? "governed-feature-family"
      : null,

    !validPositionType
      ? "governed-feature-position-type"
      : null,

    !validLatitude
      ? "valid-feature-latitude"
      : null,

    !validLongitude
      ? "valid-feature-longitude"
      : null,

    !validObservedAt
      ? "valid-feature-position-observed-at"
      : null,

    !validSourceType
      ? "governed-feature-position-source"
      : null,

    !validSourceContractVersion
      ? "feature-position-source-contract-version"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...missingRequirements,

      "Governed Feature Position preserves explicit feature-position evidence only.",

      "Observation, request, query-center, and snapshot coordinates are not valid fallback feature positions.",

      "Governed Feature Position does not establish that the same spatial feature is represented across multiple observations.",

      "This contract does not calculate displacement, movement direction, movement speed, opportunity, habitat suitability, species probability, or captain guidance."
    ])
  ];

  return deepFreezeSnapshotValue({
    available,

    positionType:
      validPositionType
        ? positionType
        : null,

    responsibility:
      "Preserve",

    feature: {
      featureType:
        validFeatureType
          ? featureType
          : null,

      featureFamily:
        validFeatureFamily
          ? featureFamily
          : null
    },

    position: {
      latitude:
        validLatitude
          ? latitude
          : null,

      longitude:
        validLongitude
          ? longitude
          : null
    },

    observedAt:
      validObservedAt
        ? observedAt
        : null,

    source: {
      type:
        validSourceType
          ? sourceType
          : null,

      contractVersion:
        validSourceContractVersion
          ? sourceContractVersion
          : null
    },

    missingRequirements: [
      ...new Set(
        missingRequirements
      )
    ],

    limitations,

    contractVersion:
      "pelora-governed-feature-position-v1"
  });
}


export const GOVERNED_FEATURE_ASSOCIATION_EVIDENCE_CLASSIFICATIONS =
  Object.freeze([
    "association-supported",
    "association-not-supported",
    "insufficient-evidence"
  ]);

export const GOVERNED_FEATURE_ASSOCIATION_EVIDENCE_SIGNALS =
  Object.freeze([
    "temporal-continuity",
    "spatial-plausibility",
    "feature-state-consistency"
  ]);


/**
 * ------------------------------------------------------------
 * Governed Feature Association v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Evaluate whether two chronological Governed Feature Position
 * records are compatible for later spatial feature association.
 *
 * Matching feature type, family, and valid chronology establish
 * compatibility only. They do not independently establish that
 * both positions represent the same physical ocean feature.
 *
 * This contract does not calculate displacement, movement
 * direction, movement speed, opportunity, habitat suitability,
 * species probability, or captain guidance.
 */
export function buildGovernedFeatureAssociation({
  previousFeaturePosition = null,
  currentFeaturePosition = null
} = {}) {

    const previousAvailable =
    previousFeaturePosition
      ?.available ===
      true &&
    previousFeaturePosition
      ?.contractVersion ===
      "pelora-governed-feature-position-v1";

  const currentAvailable =
    currentFeaturePosition
      ?.available ===
      true &&
    currentFeaturePosition
      ?.contractVersion ===
      "pelora-governed-feature-position-v1";

  const previousObservedAt =
    typeof previousFeaturePosition
      ?.observedAt ===
      "string"
      ? previousFeaturePosition
          .observedAt
      : null;

  const currentObservedAt =
    typeof currentFeaturePosition
      ?.observedAt ===
      "string"
      ? currentFeaturePosition
          .observedAt
      : null;

  const previousObservedTimestamp =
    previousObservedAt !==
      null
      ? Date.parse(
          previousObservedAt
        )
      : Number.NaN;

  const currentObservedTimestamp =
    currentObservedAt !==
      null
      ? Date.parse(
          currentObservedAt
        )
      : Number.NaN;

  const chronological =
    Number.isFinite(
      previousObservedTimestamp
    ) &&
    Number.isFinite(
      currentObservedTimestamp
    ) &&
    currentObservedTimestamp >
      previousObservedTimestamp;

  const sameFeatureType =
    previousAvailable &&
    currentAvailable &&
    previousFeaturePosition
      ?.feature
      ?.featureType ===
    currentFeaturePosition
      ?.feature
      ?.featureType;

  const sameFeatureFamily =
    previousAvailable &&
    currentAvailable &&
    previousFeaturePosition
      ?.feature
      ?.featureFamily ===
    currentFeaturePosition
      ?.feature
      ?.featureFamily;

  const compatible =
    previousAvailable &&
    currentAvailable &&
    chronological &&
    sameFeatureType &&
    sameFeatureFamily;

  const compatibility =
    !previousAvailable ||
    !currentAvailable
      ? "unknown"
      : sameFeatureType &&
        sameFeatureFamily
        ? "compatible"
        : "incompatible";

  const classification =
    !previousAvailable ||
    !currentAvailable
      ? "insufficient-evidence"
      : !chronological
        ? "insufficient-evidence"
        : !sameFeatureType ||
          !sameFeatureFamily
          ? "not-associated"
          : "insufficient-evidence";

  const available =
    previousAvailable &&
    currentAvailable &&
    chronological;

  const missingRequirements = [
    !previousAvailable
      ? "previous-governed-feature-position"
      : null,

    !currentAvailable
      ? "current-governed-feature-position"
      : null,

    previousAvailable &&
    currentAvailable &&
    !chronological
      ? "current-feature-position-must-follow-previous-feature-position"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          previousFeaturePosition
            ?.limitations
        )
          ? previousFeaturePosition
              .limitations
          : []
      ),

      ...(
        Array.isArray(
          currentFeaturePosition
            ?.limitations
        )
          ? currentFeaturePosition
              .limitations
          : []
      ),

      ...missingRequirements,

      "Governed Feature Association evaluates compatibility between two chronological Governed Feature Position records.",

      "Matching feature type and family establish compatibility only and do not independently establish same-feature identity.",

      "A compatible pair remains insufficient evidence for association until explicit governed association evidence is available.",

      "This contract does not calculate displacement, movement direction, movement speed, opportunity, habitat suitability, species probability, or captain guidance."
    ])
  ];

  return deepFreezeSnapshotValue({
    available,

    associationType:
      "governed-feature-association",

    responsibility:
      "Compare",

    compatibility,

    classification,

    associated:
      classification ===
      "associated",

    identity: {
      sameFeatureType,

      sameFeatureFamily
    },

    chronology: {
      chronological,

      previousObservedAt,

      currentObservedAt
    },

    previousFeaturePosition:
      previousAvailable
        ? cloneSnapshotValue(
            previousFeaturePosition
          )
        : null,

    currentFeaturePosition:
      currentAvailable
        ? cloneSnapshotValue(
            currentFeaturePosition
          )
        : null,

    upstreamContracts: {
      previousFeaturePosition:
        previousFeaturePosition
          ?.contractVersion ??
        null,

      currentFeaturePosition:
        currentFeaturePosition
          ?.contractVersion ??
        null
    },

    missingRequirements: [
      ...new Set(
        missingRequirements
      )
    ],

    limitations,

    contractVersion:
      "pelora-governed-feature-association-v1"
  });
}


/**
 * ------------------------------------------------------------
 * Governed Feature Association Evidence v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Evaluate.
 *
 * Purpose:
 * Evaluate explicit governed evidence relevant to whether two
 * compatible chronological feature positions may represent the
 * same physical ocean feature.
 *
 * No single evidence signal independently establishes spatial
 * feature identity. Association support requires multiple
 * governed evidence dimensions.
 *
 * This contract does not calculate displacement, movement
 * direction, movement speed, opportunity, habitat suitability,
 * species probability, or captain guidance.
 */
export function buildGovernedFeatureAssociationEvidence({
  featureAssociation = null,
  temporalContinuity = null,
  spatialPlausibility = null,
  featureStateConsistency = null
} = {}) {

    const associationAvailable =
      featureAssociation
        ?.available ===
        true &&
      featureAssociation
        ?.contractVersion ===
        "pelora-governed-feature-association-v1" &&
      featureAssociation
        ?.compatibility ===
        "compatible";

    const temporalContinuityAvailable =
      temporalContinuity
        ?.available ===
        true &&
      temporalContinuity
        ?.contractVersion ===
        "pelora-temporal-feature-continuity-v1";

    const temporalContinuitySupported =
      temporalContinuityAvailable &&
      temporalContinuity
        ?.continuity
        ?.supported ===
        true;

    const spatialPlausibilityAvailable =
      spatialPlausibility
        ?.available ===
        true &&
      spatialPlausibility
        ?.supported ===
        true;

    const featureStateConsistencyAvailable =
      featureStateConsistency
        ?.available ===
        true &&
      featureStateConsistency
        ?.supported ===
        true;

    const supportedSignals = [
      temporalContinuitySupported
        ? "temporal-continuity"
        : null,

      spatialPlausibilityAvailable
        ? "spatial-plausibility"
        : null,

      featureStateConsistencyAvailable
        ? "feature-state-consistency"
        : null
    ].filter(Boolean);

    const supportedSignalCount =
      supportedSignals.length;

    const associationSupported =
      associationAvailable &&
      temporalContinuitySupported &&
      supportedSignalCount >=
        2;

    const classification =
    !associationAvailable
      ? "insufficient-evidence"
      : associationSupported
        ? "association-supported"
        : supportedSignalCount ===
            0
          ? "insufficient-evidence"
          : "association-not-supported";

    const available =
      associationAvailable;

    const missingRequirements = [
      !associationAvailable
        ? "compatible-governed-feature-association"
        : null,

      associationAvailable &&
      !temporalContinuityAvailable
        ? "governed-temporal-feature-continuity"
        : null,

      associationAvailable &&
      temporalContinuityAvailable &&
      supportedSignalCount <
        2
        ? "two-or-more-independent-association-evidence-signals"
        : null
    ].filter(Boolean);

    const limitations = [
      ...new Set([
        ...(
          Array.isArray(
            featureAssociation
              ?.limitations
          )
            ? featureAssociation
                .limitations
            : []
        ),

        ...(
          Array.isArray(
            temporalContinuity
              ?.limitations
          )
            ? temporalContinuity
                .limitations
            : []
        ),

        ...missingRequirements,

        "Governed Feature Association Evidence evaluates multiple independent evidence dimensions for same-feature identity.",

        "No single evidence signal independently establishes spatial feature identity.",

        "Association support requires governed Temporal Feature Continuity plus at least one additional independent supported evidence signal.",

        "Spatial plausibility does not independently establish that two positions represent the same physical ocean feature.",

        "Feature-state consistency does not independently establish that two positions represent the same physical ocean feature.",

        "This contract does not calculate displacement, movement direction, movement speed, opportunity, habitat suitability, species probability, or captain guidance."
      ])
    ];

    return deepFreezeSnapshotValue({
      available,

      evidenceType:
        "governed-feature-association-evidence",

      responsibility:
        "Evaluate",

      classification,

      associationSupported,

      signals: {
        temporalContinuity: {
          available:
            temporalContinuityAvailable,

          supported:
            temporalContinuitySupported
        },

        spatialPlausibility: {
          available:
            spatialPlausibility
              ?.available ===
              true,

          supported:
            spatialPlausibilityAvailable
        },

        featureStateConsistency: {
          available:
            featureStateConsistency
              ?.available ===
              true,

          supported:
            featureStateConsistencyAvailable
        }
      },

      evidenceSummary: {
        supportedSignals: [
          ...supportedSignals
        ],

        supportedSignalCount,

        requiredSignalCount:
          2,

        temporalContinuityRequired:
          true
      },

      upstreamContracts: {
        featureAssociation:
          featureAssociation
            ?.contractVersion ??
          null,

        temporalContinuity:
          temporalContinuity
            ?.contractVersion ??
          null,

        spatialPlausibility:
          spatialPlausibility
            ?.contractVersion ??
          null,

        featureStateConsistency:
          featureStateConsistency
            ?.contractVersion ??
          null
      },

      missingRequirements: [
        ...new Set(
          missingRequirements
        )
      ],

      limitations,

      contractVersion:
        "pelora-governed-feature-association-evidence-v1"
    });
}


export const GOVERNED_FEATURE_ASSOCIATION_RESOLUTION_CLASSIFICATIONS =
  Object.freeze([
    "associated",
    "not-associated",
    "insufficient-evidence"
  ]);


/**
 * ------------------------------------------------------------
 * Governed Feature Association Resolution v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Resolve governed feature association by combining a compatible
 * Governed Feature Association assessment with explicit Governed
 * Feature Association Evidence.
 *
 * Association is established only when the upstream association
 * is compatible and the governed evidence contract explicitly
 * supports same-feature identity.
 *
 * This contract does not calculate displacement, movement
 * direction, movement speed, opportunity, habitat suitability,
 * species probability, or captain guidance.
 */
export function buildGovernedFeatureAssociationResolution({
  featureAssociation = null,
  associationEvidence = null
} = {}) {

  const associationAvailable =
    featureAssociation
      ?.available ===
      true &&
    featureAssociation
      ?.contractVersion ===
      "pelora-governed-feature-association-v1";

  const evidenceAvailable =
    associationEvidence
      ?.available ===
      true &&
    associationEvidence
      ?.contractVersion ===
      "pelora-governed-feature-association-evidence-v1";

  const associationCompatible =
    associationAvailable &&
    featureAssociation
      ?.compatibility ===
      "compatible";

  const evidenceSupportsAssociation =
    evidenceAvailable &&
    associationEvidence
      ?.associationSupported ===
      true &&
    associationEvidence
      ?.classification ===
      "association-supported";

  const evidenceReferencesAssociation =
    evidenceAvailable &&
    associationEvidence
      ?.upstreamContracts
      ?.featureAssociation ===
      featureAssociation
        ?.contractVersion;

  const associated =
    associationCompatible &&
    evidenceSupportsAssociation &&
    evidenceReferencesAssociation;

  const classification =
    !associationAvailable ||
    !evidenceAvailable
      ? "insufficient-evidence"
      : !associationCompatible
        ? "not-associated"
        : associated
          ? "associated"
          : "insufficient-evidence";

  const available =
    associationAvailable &&
    evidenceAvailable;

  const missingRequirements = [
    !associationAvailable
      ? "governed-feature-association"
      : null,

    associationAvailable &&
    !evidenceAvailable
      ? "governed-feature-association-evidence"
      : null,

    associationAvailable &&
    evidenceAvailable &&
    associationCompatible &&
    !evidenceSupportsAssociation
      ? "association-supporting-evidence"
      : null,

    associationAvailable &&
    evidenceAvailable &&
    associationCompatible &&
    evidenceSupportsAssociation &&
    !evidenceReferencesAssociation
      ? "association-evidence-provenance-binding"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          featureAssociation
            ?.limitations
        )
          ? featureAssociation
              .limitations
          : []
      ),

      ...(
        Array.isArray(
          associationEvidence
            ?.limitations
        )
          ? associationEvidence
              .limitations
          : []
      ),

      ...missingRequirements,

      "Governed Feature Association Resolution combines compatibility and explicit governed association evidence into one final association state.",

      "Association Resolution does not independently calculate or infer same-feature identity beyond its governed upstream contracts.",

      "Association Evidence v1 currently binds to the Governed Feature Association contract version rather than a unique association-instance identifier.",

      "Association Resolution does not calculate displacement, movement direction, movement speed, opportunity, habitat suitability, species probability, or captain guidance."
    ])
  ];

  return deepFreezeSnapshotValue({
    available,

    resolutionType:
      "governed-feature-association-resolution",

    responsibility:
      "Compare",

    classification,

    associated,

    compatibility:
      associationAvailable
        ? featureAssociation
            .compatibility
        : "unknown",

    evidence: {
      available:
        evidenceAvailable,

      associationSupported:
        evidenceSupportsAssociation,

      referencesAssociation:
        evidenceReferencesAssociation,

      classification:
        associationEvidence
          ?.classification ??
        "insufficient-evidence"
    },

    featurePositions: {
      previous:
        associationAvailable
          ? cloneSnapshotValue(
              featureAssociation
                .previousFeaturePosition
            )
          : null,

      current:
        associationAvailable
          ? cloneSnapshotValue(
              featureAssociation
                .currentFeaturePosition
            )
          : null
    },

    upstreamContracts: {
      featureAssociation:
        featureAssociation
          ?.contractVersion ??
        null,

      associationEvidence:
        associationEvidence
          ?.contractVersion ??
        null
    },

    missingRequirements: [
      ...new Set(
        missingRequirements
      )
    ],

    limitations,

    contractVersion:
      "pelora-governed-feature-association-resolution-v1"
  });
}


/**
 * ------------------------------------------------------------
 * Governed Feature Movement v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Measure geometric displacement between two explicit governed
 * feature positions only after Governed Feature Association
 * Resolution establishes that they represent the same feature.
 *
 * Movement is reported as measured displacement, elapsed time,
 * initial bearing, and average movement speed.
 *
 * This contract does not interpret movement as advancing,
 * retreating, strengthening, weakening, opportunity, habitat
 * suitability, species probability, or captain guidance.
 */
export function buildGovernedFeatureMovement({
  associationResolution = null
} = {}) {

  const resolutionAvailable =
    associationResolution
      ?.available ===
      true &&
    associationResolution
      ?.contractVersion ===
      "pelora-governed-feature-association-resolution-v1";

  const associationEstablished =
    resolutionAvailable &&
    associationResolution
      ?.associated ===
      true &&
    associationResolution
      ?.classification ===
      "associated";

  const previousFeaturePosition =
    associationEstablished
      ? associationResolution
          ?.featurePositions
          ?.previous ??
        null
      : null;

  const currentFeaturePosition =
    associationEstablished
      ? associationResolution
          ?.featurePositions
          ?.current ??
        null
      : null;

  const previousPositionAvailable =
    previousFeaturePosition
      ?.available ===
      true &&
    previousFeaturePosition
      ?.contractVersion ===
      "pelora-governed-feature-position-v1";

  const currentPositionAvailable =
    currentFeaturePosition
      ?.available ===
      true &&
    currentFeaturePosition
      ?.contractVersion ===
      "pelora-governed-feature-position-v1";

  const previousLatitude =
    Number.isFinite(
      previousFeaturePosition
        ?.position
        ?.latitude
    )
      ? previousFeaturePosition
          .position
          .latitude
      : null;

  const previousLongitude =
    Number.isFinite(
      previousFeaturePosition
        ?.position
        ?.longitude
    )
      ? previousFeaturePosition
          .position
          .longitude
      : null;

  const currentLatitude =
    Number.isFinite(
      currentFeaturePosition
        ?.position
        ?.latitude
    )
      ? currentFeaturePosition
          .position
          .latitude
      : null;

  const currentLongitude =
    Number.isFinite(
      currentFeaturePosition
        ?.position
        ?.longitude
    )
      ? currentFeaturePosition
          .position
          .longitude
      : null;

  const previousObservedAt =
    typeof previousFeaturePosition
      ?.observedAt ===
      "string"
      ? previousFeaturePosition
          .observedAt
      : null;

  const currentObservedAt =
    typeof currentFeaturePosition
      ?.observedAt ===
      "string"
      ? currentFeaturePosition
          .observedAt
      : null;

  const previousObservedTimestamp =
    previousObservedAt !==
      null
      ? Date.parse(
          previousObservedAt
        )
      : Number.NaN;

  const currentObservedTimestamp =
    currentObservedAt !==
      null
      ? Date.parse(
          currentObservedAt
        )
      : Number.NaN;

  const chronological =
    Number.isFinite(
      previousObservedTimestamp
    ) &&
    Number.isFinite(
      currentObservedTimestamp
    ) &&
    currentObservedTimestamp >
      previousObservedTimestamp;

  const movementInputsAvailable =
    resolutionAvailable &&
    associationEstablished &&
    previousPositionAvailable &&
    currentPositionAvailable &&
    previousLatitude !==
      null &&
    previousLongitude !==
      null &&
    currentLatitude !==
      null &&
    currentLongitude !==
      null &&
    chronological;

  const featureMovementNm =
    movementInputsAvailable
      ? nauticalMilesBetween(
          previousLatitude,
          previousLongitude,
          currentLatitude,
          currentLongitude
        )
      : null;

  const movementDirectionDegrees =
    movementInputsAvailable &&
    Number.isFinite(
      featureMovementNm
    ) &&
    featureMovementNm >
      0
      ? initialBearingDegrees(
          previousLatitude,
          previousLongitude,
          currentLatitude,
          currentLongitude
        )
      : null;

  const elapsedHours =
    movementInputsAvailable
      ? Number(
          (
            (
              currentObservedTimestamp -
              previousObservedTimestamp
            ) /
            (
              1000 *
              60 *
              60
            )
          ).toFixed(2)
        )
      : null;

  const movementSpeedKnots =
    movementInputsAvailable &&
    Number.isFinite(
      featureMovementNm
    ) &&
    Number.isFinite(
      elapsedHours
    ) &&
    elapsedHours >
      0
      ? Number(
          (
            featureMovementNm /
            elapsedHours
          ).toFixed(2)
        )
      : null;

  const available =
    movementInputsAvailable &&
    Number.isFinite(
      featureMovementNm
    ) &&
    Number.isFinite(
      elapsedHours
    ) &&
    Number.isFinite(
      movementSpeedKnots
    );

  const missingRequirements = [
    !resolutionAvailable
      ? "governed-feature-association-resolution"
      : null,

    resolutionAvailable &&
    !associationEstablished
      ? "resolved-associated-feature"
      : null,

    associationEstablished &&
    !previousPositionAvailable
      ? "previous-governed-feature-position"
      : null,

    associationEstablished &&
    !currentPositionAvailable
      ? "current-governed-feature-position"
      : null,

    associationEstablished &&
    previousPositionAvailable &&
    currentPositionAvailable &&
    !chronological
      ? "current-feature-position-must-follow-previous-feature-position"
      : null,

    movementInputsAvailable &&
    !Number.isFinite(
      featureMovementNm
    )
      ? "calculable-feature-displacement"
      : null,

    movementInputsAvailable &&
    !Number.isFinite(
      elapsedHours
    )
      ? "calculable-feature-elapsed-time"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          associationResolution
            ?.limitations
        )
          ? associationResolution
              .limitations
          : []
      ),

      ...missingRequirements,

      "Governed Feature Movement measures geometric displacement only after governed same-feature association has been resolved.",

      "Feature movement is calculated from explicit governed feature positions and must not be substituted with observation, request, query-center, or snapshot coordinates.",

      "Movement direction is the initial great-circle bearing from the previous governed feature position to the current governed feature position.",

      "Movement speed is average displacement divided by elapsed observation time and does not represent instantaneous physical velocity.",

      "This contract does not interpret movement as advancing, retreating, strengthening, weakening, opportunity, habitat suitability, species probability, or captain guidance."
    ])
  ];

  return deepFreezeSnapshotValue({
    available,

    movementType:
      "governed-feature-movement",

    responsibility:
      "Compare",

    feature: {
      featureType:
        previousPositionAvailable
          ? previousFeaturePosition
              ?.feature
              ?.featureType ??
            null
          : null,

      featureFamily:
        previousPositionAvailable
          ? previousFeaturePosition
              ?.feature
              ?.featureFamily ??
            null
          : null
    },

    movement: {
      featureMovementNm,

      movementDirectionDegrees,

      elapsedHours,

      movementSpeedKnots
    },

    positions: {
      previous:
        previousPositionAvailable
          ? cloneSnapshotValue(
              previousFeaturePosition
            )
          : null,

      current:
        currentPositionAvailable
          ? cloneSnapshotValue(
              currentFeaturePosition
            )
          : null
    },

    association: {
      established:
        associationEstablished,

      classification:
        associationResolution
          ?.classification ??
        "insufficient-evidence"
    },

    upstreamContracts: {
      associationResolution:
        associationResolution
          ?.contractVersion ??
        null,

      previousFeaturePosition:
        previousFeaturePosition
          ?.contractVersion ??
        null,

      currentFeaturePosition:
        currentFeaturePosition
          ?.contractVersion ??
        null
    },

    missingRequirements: [
      ...new Set(
        missingRequirements
      )
    ],

    limitations,

    contractVersion:
      "pelora-governed-feature-movement-v1"
  });
}


/**
 * ------------------------------------------------------------
 * Temporal Feature Continuity v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Evaluate whether one governed feature-persistence contract
 * supports temporal continuity of the observed feature context.
 *
 * Temporal continuity does not establish spatial feature
 * identity or feature movement. Observation-location changes
 * must not be interpreted as movement of the ocean feature.
 *
 * This contract does not calculate feature displacement,
 * movement direction, opportunity, habitat suitability,
 * species probability, or captain guidance.
 */
export function buildTemporalFeatureContinuity({
  featurePersistence = null,
  featureMovement = null
} = {}) {

    const governedFeaturePersistenceAvailable =
    featurePersistence
      ?.contractVersion ===
      "pelora-feature-persistence-v1" &&
    typeof featurePersistence
      ?.featureType ===
      "string" &&
    featurePersistence
      .featureType
      .trim()
      .length >
      0 &&
    OCEAN_PERSISTENCE_FEATURE_FAMILIES
      .includes(
        featurePersistence
          ?.featureFamily
      );

  const lifecycleState =
    OCEAN_PERSISTENCE_LIFECYCLE_STATES
      .includes(
        featurePersistence
          ?.lifecycleState
      )
      ? featurePersistence
          .lifecycleState
      : null;

  const persistenceAvailable =
    governedFeaturePersistenceAvailable &&
    featurePersistence
      ?.available ===
      true;

  const temporalSampleCount =
    Number.isFinite(
      featurePersistence
        ?.values
        ?.sampleCount
    )
      ? featurePersistence
          .values
          .sampleCount
      : null;

  const firstObservedAt =
    typeof featurePersistence
      ?.values
      ?.firstObservedAt ===
      "string"
      ? featurePersistence
          .values
          .firstObservedAt
      : null;

  const lastObservedAt =
    typeof featurePersistence
      ?.values
      ?.lastObservedAt ===
      "string"
      ? featurePersistence
          .values
          .lastObservedAt
      : null;

  const durationHours =
    Number.isFinite(
      featurePersistence
        ?.values
        ?.durationHours
    )
      ? featurePersistence
          .values
          .durationHours
      : null;

    const chronologicalWindowAvailable =
    temporalSampleCount !==
      null &&
    temporalSampleCount >=
      2 &&
    firstObservedAt !==
      null &&
    lastObservedAt !==
      null &&
    durationHours !==
      null &&
    durationHours >
      0;

  const continuityAssessmentAvailable =
    governedFeaturePersistenceAvailable &&
    chronologicalWindowAvailable &&
    lifecycleState !==
      null;

  const continuitySupported =
    continuityAssessmentAvailable &&
    persistenceAvailable &&
    [
      "developing",
      "stable",
      "strengthening"
    ].includes(
      lifecycleState
    );

  const continuityClassification =
    !continuityAssessmentAvailable
      ? "unavailable"
      : continuitySupported
        ? "continuity-supported"
        : [
            "emerging",
            "weakening",
            "fading"
          ].includes(
            lifecycleState
          )
          ? "continuity-not-established"
          : "continuity-unresolved";

    const governedFeatureMovementAvailable =
      featureMovement
        ?.available ===
        true &&
      featureMovement
        ?.contractVersion ===
        "pelora-governed-feature-movement-v1" &&
      featureMovement
        ?.association
        ?.established ===
        true &&
      featureMovement
        ?.association
        ?.classification ===
        "associated";

    const movementFeatureMatches =
      governedFeatureMovementAvailable &&
      featureMovement
        ?.feature
        ?.featureType ===
        featurePersistence
          ?.featureType &&
      featureMovement
        ?.feature
        ?.featureFamily ===
        featurePersistence
          ?.featureFamily;

    const governedMovementUsable =
      governedFeatureMovementAvailable &&
      movementFeatureMatches;

    const spatialContext = {
      featurePositionAvailable:
        governedMovementUsable,

      featureMovementNm:
        governedMovementUsable &&
        Number.isFinite(
          featureMovement
            ?.movement
            ?.featureMovementNm
        )
          ? featureMovement
              .movement
              .featureMovementNm
          : null,

      movementDirectionDegrees:
        governedMovementUsable &&
        Number.isFinite(
          featureMovement
            ?.movement
            ?.movementDirectionDegrees
        )
          ? featureMovement
              .movement
              .movementDirectionDegrees
          : null,

      movementSpeedKnots:
        governedMovementUsable &&
        Number.isFinite(
          featureMovement
            ?.movement
            ?.movementSpeedKnots
        )
          ? featureMovement
              .movement
              .movementSpeedKnots
          : null
    };

  const available =
    continuityAssessmentAvailable;

  const missingRequirements = [
    !governedFeaturePersistenceAvailable
      ? "governed-feature-persistence"
      : null,

    governedFeaturePersistenceAvailable &&
    !chronologicalWindowAvailable
      ? "two-or-more-chronological-feature-observations"
      : null,

    governedFeaturePersistenceAvailable &&
    chronologicalWindowAvailable &&
    lifecycleState ===
      null
      ? "governed-feature-lifecycle-state"
      : null
  ].filter(Boolean);

  const evidenceBasis = [
  governedFeaturePersistenceAvailable
    ? "governed-feature-persistence"
    : null,

  chronologicalWindowAvailable
    ? "governed-chronological-feature-window"
    : null,

  lifecycleState !==
    null
    ? "governed-feature-lifecycle"
    : null,

  governedMovementUsable
    ? "governed-feature-movement"
    : null
].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          featurePersistence
            ?.limitations
        )
          ? featurePersistence
              .limitations
          : []
      ),

      ...missingRequirements,

      "Temporal Feature Continuity evaluates temporal continuity from governed feature-persistence evidence only.",

      "Temporal Feature Continuity does not establish that observations represent the same spatially tracked ocean feature.",

      "Observation-location coordinates must not be interpreted as feature position or feature movement.",

      "Feature movement is reported only when supplied through a valid Governed Feature Movement contract with resolved same-feature association.",

      "Absence of Governed Feature Movement does not make Temporal Feature Continuity unavailable.",

      "Temporal Feature Continuity does not independently calculate feature position, displacement, movement direction, or movement speed.",

      "This contract does not calculate displacement, movement direction, opportunity, habitat suitability, species probability, or captain guidance."
    ])
  ];

  return deepFreezeSnapshotValue({
    available,

    continuityType:
      "temporal-feature-continuity",

    responsibility:
      "Compare",

    feature: {
      featureType:
        governedFeaturePersistenceAvailable
          ? featurePersistence
              .featureType
          : null,

      featureFamily:
        governedFeaturePersistenceAvailable
          ? featurePersistence
              .featureFamily
          : null
    },

    continuity: {
      supported:
        continuitySupported,

      classification:
        continuityClassification,

      lifecycleState,

      persistenceClassification:
        typeof featurePersistence
          ?.classification ===
          "string"
          ? featurePersistence
              .classification
          : "not-assessed",

      temporalSampleCount,

      firstObservedAt,

      lastObservedAt,

      durationHours
    },

    spatialContext,

    confidence: {
      score:
        Number.isFinite(
          featurePersistence
            ?.confidence
            ?.score
        )
          ? featurePersistence
              .confidence
              .score
          : 0,

      level:
        typeof featurePersistence
          ?.confidence
          ?.level ===
          "string"
          ? featurePersistence
              .confidence
              .level
          : "Unavailable"
    },

    evidenceBasis,

    upstreamContracts: {
      featurePersistence:
        featurePersistence
          ?.contractVersion ??
        null,

      featureMovement:
        featureMovement
          ?.contractVersion ??
        null
    },

    missingRequirements: [
      ...new Set(
        missingRequirements
      )
    ],

    limitations,

    contractVersion:
      "pelora-temporal-feature-continuity-v1"
  });
}



/**
 * ------------------------------------------------------------
 * Sea Surface Temperature Persistence Analysis v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Compare governed historical sea-surface temperature
 * observations across Ocean Memory snapshots.
 *
 * This first version assesses only raw temperature continuity and
 * change. It does not classify temperature fronts, warm tongues,
 * cold intrusions, water masses, habitat, species opportunity, or
 * fishing quality.
 */
export function buildSeaSurfaceTemperaturePersistence({
  historicalSnapshots = []
} = {}) {
  const snapshotsInput =
    Array.isArray(
      historicalSnapshots
    )
      ? historicalSnapshots
      : [];

  const normalizedObservations =
    snapshotsInput
      .map(record => {
        const oceanSnapshot =
          record
            ?.storageRecord
            ?.snapshot ??
          record
            ?.snapshot ??
          record
            ?.oceanSnapshot ??
          null;

        const snapshotAvailable =
          oceanSnapshot
            ?.available ===
          true;

        const snapshotId =
          oceanSnapshot
            ?.identity
            ?.snapshotId ??
          null;

        const observedAt =
          oceanSnapshot
            ?.metadata
            ?.time
            ?.observedAt ??
          oceanSnapshot
            ?.observation
            ?.observedAt ??
          null;

        const temperatureFahrenheit =
          Number.isFinite(
            oceanSnapshot
              ?.observation
              ?.observations
              ?.sst
              ?.temperatureFahrenheit
          )
            ? oceanSnapshot
                .observation
                .observations
                .sst
                .temperatureFahrenheit
            : null;

        const observedAtTimestamp =
          typeof observedAt ===
            "string"
            ? Date.parse(
                observedAt
              )
            : Number.NaN;

        const validObservedAt =
          Number.isFinite(
            observedAtTimestamp
          );

        return {
          snapshotId,

          observedAt:
            validObservedAt
              ? observedAt
              : null,

          observedAtTimestamp:
            validObservedAt
              ? observedAtTimestamp
              : null,

          temperatureFahrenheit,

          valid:
            snapshotAvailable &&
            typeof snapshotId ===
              "string" &&
            snapshotId.trim().length >
              0 &&
            validObservedAt &&
            temperatureFahrenheit !==
              null
        };
      })
      .filter(
        observation =>
          observation.valid
      )
      .sort(
        (
          firstObservation,
          secondObservation
        ) =>
          firstObservation
            .observedAtTimestamp -
          secondObservation
            .observedAtTimestamp
      );

  const uniqueObservations = [];

  const seenSnapshotIds =
    new Set();

  for (
    const observation of
      normalizedObservations
  ) {
    if (
      seenSnapshotIds.has(
        observation.snapshotId
      )
    ) {
      continue;
    }

    seenSnapshotIds.add(
      observation.snapshotId
    );

    uniqueObservations.push(
      observation
    );
  }

  const sampleCount =
    uniqueObservations.length;

  const firstObservation =
    sampleCount >
      0
      ? uniqueObservations[0]
      : null;

  const lastObservation =
    sampleCount >
      0
      ? uniqueObservations[
          sampleCount - 1
        ]
      : null;

  const firstObservedAt =
    firstObservation
      ?.observedAt ??
    null;

  const lastObservedAt =
    lastObservation
      ?.observedAt ??
    null;

  const durationHours =
    firstObservation &&
    lastObservation
      ? (
          lastObservation
            .observedAtTimestamp -
          firstObservation
            .observedAtTimestamp
        ) /
        (
          1000 *
          60 *
          60
        )
      : null;

  const firstTemperatureFahrenheit =
    firstObservation
      ?.temperatureFahrenheit ??
    null;

  const lastTemperatureFahrenheit =
    lastObservation
      ?.temperatureFahrenheit ??
    null;

  const temperatureChangeFahrenheit =
    firstTemperatureFahrenheit !==
      null &&
    lastTemperatureFahrenheit !==
      null
      ? lastTemperatureFahrenheit -
        firstTemperatureFahrenheit
      : null;

  if (
    sampleCount ===
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "sea-surface-temperature",

      featureFamily:
        "physical-ocean",

      classification:
        "unavailable",

      lifecycleState:
        null,

      reason:
        "historical-sst-observations-unavailable",

      values: {
        sampleCount:
          0,

        firstObservedAt:
          null,

        lastObservedAt:
          null,

        durationHours:
          null,

        firstTemperatureFahrenheit:
          null,

        lastTemperatureFahrenheit:
          null,

        temperatureChangeFahrenheit:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      limitations: [
        "historical-sst-observations-unavailable",
        "temperature-persistence-not-assessed",
        "temperature-front-persistence-not-assessed",
        "feature-absence-not-established"
      ]
    });
  }

  if (
    sampleCount <
      2 ||
    !Number.isFinite(
      durationHours
    ) ||
    durationHours <=
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "sea-surface-temperature",

      featureFamily:
        "physical-ocean",

      classification:
        "insufficient-history",

      lifecycleState:
        null,

      reason:
        "minimum-two-chronological-sst-observations-required",

      values: {
        sampleCount,

        firstObservedAt,

        lastObservedAt,

        durationHours,

        firstTemperatureFahrenheit,

        lastTemperatureFahrenheit,

        temperatureChangeFahrenheit
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      drivers: [
        "governed-historical-sst-observation-available"
      ],

      limitations: [
        "minimum-two-chronological-sst-observations-required",
        "temperature-persistence-not-assessed",
        "temperature-front-persistence-not-assessed"
      ]
    });
  }

  const absoluteTemperatureChange =
    Math.abs(
      temperatureChangeFahrenheit
    );

  let classification =
    "stable-temperature";

  let lifecycleState =
    "stable";

  let reason =
    "governed-sst-history-remained-within-stability-threshold";

  if (
    temperatureChangeFahrenheit >=
      1
  ) {
    classification =
      "warming";

    lifecycleState =
      "strengthening";

    reason =
      "governed-sst-history-shows-measurable-warming";
  } else if (
    temperatureChangeFahrenheit <=
      -1
  ) {
    classification =
      "cooling";

    lifecycleState =
      "weakening";

    reason =
      "governed-sst-history-shows-measurable-cooling";
  }

  const confidenceScore =
    Math.min(
      80,
      40 +
      (
        sampleCount *
        10
      )
    );

  const confidenceLevel =
    confidenceScore >=
      70
      ? "High"
      : confidenceScore >=
          50
        ? "Moderate"
        : "Low";

  return buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "sea-surface-temperature",

    featureFamily:
      "physical-ocean",

    classification,

    lifecycleState,

    reason,

    values: {
      sampleCount,

      firstObservedAt,

      lastObservedAt,

      durationHours,

      firstTemperatureFahrenheit,

      lastTemperatureFahrenheit,

      temperatureChangeFahrenheit,

      absoluteTemperatureChangeFahrenheit:
        absoluteTemperatureChange,

      stabilityThresholdFahrenheit:
        1
    },

    confidence: {
      score:
        confidenceScore,

      level:
        confidenceLevel
    },

    drivers: [
      "multiple-governed-historical-sst-observations-available",
      "chronological-sst-observation-window-established",
      `sst-lifecycle-${lifecycleState}`
    ],

    limitations: [
      "raw-temperature-change-does-not-establish-temperature-front-persistence",
      "temperature-change-does-not-establish-water-mass-identity",
      "sst-persistence-does-not-establish-habitat-quality-or-fishing-opportunity"
    ]
  });
}


/**
 * ------------------------------------------------------------
 * Current Persistence Analysis v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Compare governed historical current-speed and current-direction
 * observations across Ocean Memory snapshots.
 *
 * This first version assesses only direct current observations.
 * It does not assess current edges, shear, convergence, eddies,
 * feature movement, habitat, species opportunity, or fishing
 * quality.
 */
export function buildCurrentPersistence({
  historicalSnapshots = []
} = {}) {
  const snapshotsInput =
    Array.isArray(
      historicalSnapshots
    )
      ? historicalSnapshots
      : [];

  const normalizeDirectionDegrees =
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

  const calculateDirectionDifference =
    (
      firstDirection,
      secondDirection
    ) => {
      if (
        !Number.isFinite(
          firstDirection
        ) ||
        !Number.isFinite(
          secondDirection
        )
      ) {
        return null;
      }

      const directDifference =
        Math.abs(
          secondDirection -
          firstDirection
        );

      return Math.min(
        directDifference,
        360 -
        directDifference
      );
    };

  const normalizedObservations =
    snapshotsInput
      .map(record => {
        const oceanSnapshot =
          record
            ?.storageRecord
            ?.snapshot ??
          record
            ?.snapshot ??
          record
            ?.oceanSnapshot ??
          null;

        const snapshotAvailable =
          oceanSnapshot
            ?.available ===
          true;

        const snapshotId =
          oceanSnapshot
            ?.identity
            ?.snapshotId ??
          null;

        const observedAt =
          oceanSnapshot
            ?.metadata
            ?.time
            ?.observedAt ??
          oceanSnapshot
            ?.observation
            ?.observedAt ??
          null;

        const speedKnots =
          Number.isFinite(
            oceanSnapshot
              ?.observation
              ?.observations
              ?.currents
              ?.speedKnots
          )
            ? oceanSnapshot
                .observation
                .observations
                .currents
                .speedKnots
            : null;

        const directionDegrees =
          normalizeDirectionDegrees(
            oceanSnapshot
              ?.observation
              ?.observations
              ?.currents
              ?.directionDegrees
          );

        const observedAtTimestamp =
          typeof observedAt ===
            "string"
            ? Date.parse(
                observedAt
              )
            : Number.NaN;

        const validObservedAt =
          Number.isFinite(
            observedAtTimestamp
          );

        return {
          snapshotId,

          observedAt:
            validObservedAt
              ? observedAt
              : null,

          observedAtTimestamp:
            validObservedAt
              ? observedAtTimestamp
              : null,

          speedKnots,

          directionDegrees,

          valid:
            snapshotAvailable &&
            typeof snapshotId ===
              "string" &&
            snapshotId.trim().length >
              0 &&
            validObservedAt &&
            speedKnots !==
              null &&
            directionDegrees !==
              null
        };
      })
      .filter(
        observation =>
          observation.valid
      )
      .sort(
        (
          firstObservation,
          secondObservation
        ) =>
          firstObservation
            .observedAtTimestamp -
          secondObservation
            .observedAtTimestamp
      );

  const uniqueObservations = [];

  const seenSnapshotIds =
    new Set();

  for (
    const observation of
      normalizedObservations
  ) {
    if (
      seenSnapshotIds.has(
        observation.snapshotId
      )
    ) {
      continue;
    }

    seenSnapshotIds.add(
      observation.snapshotId
    );

    uniqueObservations.push(
      observation
    );
  }

  const sampleCount =
    uniqueObservations.length;

  const firstObservation =
    sampleCount >
      0
      ? uniqueObservations[0]
      : null;

  const lastObservation =
    sampleCount >
      0
      ? uniqueObservations[
          sampleCount - 1
        ]
      : null;

  const firstObservedAt =
    firstObservation
      ?.observedAt ??
    null;

  const lastObservedAt =
    lastObservation
      ?.observedAt ??
    null;

  const durationHours =
    firstObservation &&
    lastObservation
      ? (
          lastObservation
            .observedAtTimestamp -
          firstObservation
            .observedAtTimestamp
        ) /
        (
          1000 *
          60 *
          60
        )
      : null;

  const firstSpeedKnots =
    firstObservation
      ?.speedKnots ??
    null;

  const lastSpeedKnots =
    lastObservation
      ?.speedKnots ??
    null;

  const speedChangeKnots =
    firstSpeedKnots !==
      null &&
    lastSpeedKnots !==
      null
      ? lastSpeedKnots -
        firstSpeedKnots
      : null;

  const firstDirectionDegrees =
    firstObservation
      ?.directionDegrees ??
    null;

  const lastDirectionDegrees =
    lastObservation
      ?.directionDegrees ??
    null;

  const directionChangeDegrees =
    calculateDirectionDifference(
      firstDirectionDegrees,
      lastDirectionDegrees
    );

  if (
    sampleCount ===
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "current",

      featureFamily:
        "physical-ocean",

      classification:
        "unavailable",

      lifecycleState:
        null,

      reason:
        "historical-current-observations-unavailable",

      values: {
        sampleCount:
          0,

        firstObservedAt:
          null,

        lastObservedAt:
          null,

        durationHours:
          null,

        firstSpeedKnots:
          null,

        lastSpeedKnots:
          null,

        speedChangeKnots:
          null,

        firstDirectionDegrees:
          null,

        lastDirectionDegrees:
          null,

        directionChangeDegrees:
          null,

        directionalStability:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      limitations: [
        "historical-current-observations-unavailable",
        "current-persistence-not-assessed",
        "current-edge-persistence-not-assessed",
        "current-shear-persistence-not-assessed",
        "current-convergence-persistence-not-assessed",
        "feature-absence-not-established"
      ]
    });
  }

  if (
    sampleCount <
      2 ||
    !Number.isFinite(
      durationHours
    ) ||
    durationHours <=
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "current",

      featureFamily:
        "physical-ocean",

      classification:
        "insufficient-history",

      lifecycleState:
        null,

      reason:
        "minimum-two-chronological-current-observations-required",

      values: {
        sampleCount,

        firstObservedAt,

        lastObservedAt,

        durationHours,

        firstSpeedKnots,

        lastSpeedKnots,

        speedChangeKnots,

        firstDirectionDegrees,

        lastDirectionDegrees,

        directionChangeDegrees,

        directionalStability:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      drivers: [
        "governed-historical-current-observation-available"
      ],

      limitations: [
        "minimum-two-chronological-current-observations-required",
        "current-persistence-not-assessed",
        "current-edge-persistence-not-assessed",
        "current-shear-persistence-not-assessed",
        "current-convergence-persistence-not-assessed"
      ]
    });
  }

  const speedChangeThresholdKnots =
    0.25;

  const directionStabilityThresholdDegrees =
    15;

  let classification =
    "stable-current-speed";

  let lifecycleState =
    "stable";

  let reason =
    "governed-current-speed-history-remained-within-stability-threshold";

  if (
    speedChangeKnots >=
      speedChangeThresholdKnots
  ) {
    classification =
      "strengthening-current-speed";

    lifecycleState =
      "strengthening";

    reason =
      "governed-current-speed-history-increased";
  } else if (
    speedChangeKnots <=
      -speedChangeThresholdKnots
  ) {
    classification =
      "weakening-current-speed";

    lifecycleState =
      "weakening";

    reason =
      "governed-current-speed-history-decreased";
  }

  const directionalStability =
    directionChangeDegrees <=
      directionStabilityThresholdDegrees
      ? "stable"
      : "changing";

  const confidenceScore =
    Math.min(
      80,
      40 +
      (
        sampleCount *
        10
      )
    );

  const confidenceLevel =
    confidenceScore >=
      70
      ? "High"
      : confidenceScore >=
          50
        ? "Moderate"
        : "Low";

  return buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "current",

    featureFamily:
      "physical-ocean",

    classification,

    lifecycleState,

    reason,

    values: {
      sampleCount,

      firstObservedAt,

      lastObservedAt,

      durationHours,

      firstSpeedKnots,

      lastSpeedKnots,

      speedChangeKnots,

      absoluteSpeedChangeKnots:
        Math.abs(
          speedChangeKnots
        ),

      firstDirectionDegrees,

      lastDirectionDegrees,

      directionChangeDegrees,

      directionalStability,

      speedChangeThresholdKnots,

      directionStabilityThresholdDegrees,

      thresholdVersion:
        "pelora-current-persistence-threshold-v1"
    },

    confidence: {
      score:
        confidenceScore,

      level:
        confidenceLevel
    },

    drivers: [
      "multiple-governed-historical-current-observations-available",
      "chronological-current-observation-window-established",
      `current-speed-lifecycle-${lifecycleState}`,
      `current-direction-${directionalStability}`
    ],

    limitations: [
      "current-speed-change-does-not-establish-current-edge-persistence",
      "current-direction-change-does-not-establish-current-shear",
      "current-direction-change-does-not-establish-current-convergence",
      "current-feature-movement-not-assessed",
      "current-persistence-does-not-establish-habitat-quality-or-fishing-opportunity"
    ]
  });
}


/**
 * ------------------------------------------------------------
 * Current Edge Persistence Analysis v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Compare governed Current Edge Analysis contracts across
 * chronological Ocean Memory snapshots.
 *
 * This version evaluates edge support and edge-strength evolution.
 * It does not assess edge movement, geometry, habitat, species
 * opportunity, prey concentration, or fishing quality.
 */
export function buildCurrentEdgePersistence({
  historicalSnapshots = []
} = {}) {
  const snapshotsInput =
    Array.isArray(
      historicalSnapshots
    )
      ? historicalSnapshots
      : [];

  const edgeStrengthRank = {
    none: 0,
    localized: 1,
    "strong-localized": 2,
    measurable: 3,
    pronounced: 4
  };

  const normalizedObservations =
    snapshotsInput
      .map(record => {
        const oceanSnapshot =
          record
            ?.storageRecord
            ?.snapshot ??
          record
            ?.snapshot ??
          record
            ?.oceanSnapshot ??
          null;

        const edge =
          oceanSnapshot
            ?.observation
            ?.observations
            ?.currents
            ?.derived
            ?.spatialAnalysis
            ?.edge ??
          null;

        const snapshotAvailable =
          oceanSnapshot
            ?.available ===
          true;

        const snapshotId =
          oceanSnapshot
            ?.identity
            ?.snapshotId ??
          null;

        const observedAt =
          oceanSnapshot
            ?.metadata
            ?.time
            ?.observedAt ??
          oceanSnapshot
            ?.observation
            ?.observedAt ??
          null;

        const observedAtTimestamp =
          typeof observedAt ===
            "string"
            ? Date.parse(
                observedAt
              )
            : Number.NaN;

        const validObservedAt =
          Number.isFinite(
            observedAtTimestamp
          );

        const contractVersion =
          edge
            ?.contractVersion ??
          null;

        const edgeAvailable =
          edge
            ?.available ===
          true;

        const currentEdgeDetected =
          edge
            ?.currentEdgeDetected ===
          true;

        const edgeType =
          typeof edge
            ?.edgeType ===
            "string"
            ? edge.edgeType
            : null;

        const edgeState =
          typeof edge
            ?.edgeState ===
            "string"
            ? edge.edgeState
            : null;

        const edgeStrength =
          typeof edge
            ?.edgeStrength ===
            "string"
            ? edge.edgeStrength
            : null;

        const strengthRank =
          Object.hasOwn(
            edgeStrengthRank,
            edgeStrength
          )
            ? edgeStrengthRank[
                edgeStrength
              ]
            : null;

        return {
          snapshotId,

          observedAt:
            validObservedAt
              ? observedAt
              : null,

          observedAtTimestamp:
            validObservedAt
              ? observedAtTimestamp
              : null,

          contractVersion,

          edgeAvailable,

          currentEdgeDetected,

          edgeType,

          edgeState,

          edgeStrength,

          strengthRank,

          valid:
            snapshotAvailable &&
            typeof snapshotId ===
              "string" &&
            snapshotId.trim().length >
              0 &&
            validObservedAt &&
            contractVersion ===
              "pelora-current-edge-v1" &&
            edgeAvailable &&
            strengthRank !==
              null
        };
      })
      .filter(
        observation =>
          observation.valid
      )
      .sort(
        (
          firstObservation,
          secondObservation
        ) =>
          firstObservation
            .observedAtTimestamp -
          secondObservation
            .observedAtTimestamp
      );

  const uniqueObservations = [];

  const seenSnapshotIds =
    new Set();

  for (
    const observation of
      normalizedObservations
  ) {
    if (
      seenSnapshotIds.has(
        observation.snapshotId
      )
    ) {
      continue;
    }

    seenSnapshotIds.add(
      observation.snapshotId
    );

    uniqueObservations.push(
      observation
    );
  }

  const sampleCount =
    uniqueObservations.length;

  const firstObservation =
    sampleCount > 0
      ? uniqueObservations[0]
      : null;

  const lastObservation =
    sampleCount > 0
      ? uniqueObservations[
          sampleCount - 1
        ]
      : null;

  const firstObservedAt =
    firstObservation
      ?.observedAt ??
    null;

  const lastObservedAt =
    lastObservation
      ?.observedAt ??
    null;

  const durationHours =
    firstObservation &&
    lastObservation
      ? (
          lastObservation
            .observedAtTimestamp -
          firstObservation
            .observedAtTimestamp
        ) /
        (
          1000 *
          60 *
          60
        )
      : null;

  if (
    sampleCount ===
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "current-edge",

      featureFamily:
        "physical-ocean",

      classification:
        "unavailable",

      lifecycleState:
        null,

      reason:
        "historical-current-edge-contracts-unavailable",

      values: {
        sampleCount:
          0,

        firstObservedAt:
          null,

        lastObservedAt:
          null,

        durationHours:
          null,

        firstEdgeDetected:
          null,

        lastEdgeDetected:
          null,

        firstEdgeStrength:
          null,

        lastEdgeStrength:
          null,

        edgeStrengthChange:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      limitations: [
        "historical-current-edge-contracts-unavailable",
        "current-edge-persistence-not-assessed",
        "current-edge-movement-not-assessed",
        "feature-absence-not-established"
      ]
    });
  }

  if (
    sampleCount <
      2 ||
    !Number.isFinite(
      durationHours
    ) ||
    durationHours <=
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "current-edge",

      featureFamily:
        "physical-ocean",

      classification:
        "insufficient-history",

      lifecycleState:
        null,

      reason:
        "minimum-two-chronological-current-edge-contracts-required",

      values: {
        sampleCount,

        firstObservedAt,

        lastObservedAt,

        durationHours,

        firstEdgeDetected:
          firstObservation
            ?.currentEdgeDetected ??
          null,

        lastEdgeDetected:
          lastObservation
            ?.currentEdgeDetected ??
          null,

        firstEdgeStrength:
          firstObservation
            ?.edgeStrength ??
          null,

        lastEdgeStrength:
          lastObservation
            ?.edgeStrength ??
          null,

        edgeStrengthChange:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      drivers: [
        "governed-historical-current-edge-contract-available"
      ],

      limitations: [
        "minimum-two-chronological-current-edge-contracts-required",
        "current-edge-persistence-not-assessed",
        "current-edge-movement-not-assessed"
      ]
    });
  }

  const firstEdgeDetected =
    firstObservation
      .currentEdgeDetected;

  const lastEdgeDetected =
    lastObservation
      .currentEdgeDetected;

  const firstEdgeStrength =
    firstObservation
      .edgeStrength;

  const lastEdgeStrength =
    lastObservation
      .edgeStrength;

  const edgeStrengthChange =
    lastObservation
      .strengthRank -
    firstObservation
      .strengthRank;

  let classification =
    "stable-current-edge";

  let lifecycleState =
    "stable";

  let reason =
    "governed-current-edge-strength-remained-stable";

  if (
    !firstEdgeDetected &&
    lastEdgeDetected
  ) {
    classification =
      "emerging-current-edge";

    lifecycleState =
      "emerging";

    reason =
      "governed-current-edge-candidate-developed";
  } else if (
    firstEdgeDetected &&
    !lastEdgeDetected
  ) {
    classification =
      "fading-current-edge";

    lifecycleState =
      "fading";

    reason =
      "governed-current-edge-candidate-no-longer-supported";
  } else if (
    edgeStrengthChange >
      0
  ) {
    classification =
      "strengthening-current-edge";

    lifecycleState =
      "strengthening";

    reason =
      "governed-current-edge-strength-increased";
  } else if (
    edgeStrengthChange <
      0
  ) {
    classification =
      "weakening-current-edge";

    lifecycleState =
      "weakening";

    reason =
      "governed-current-edge-strength-decreased";
  }

  const confidenceScore =
    Math.min(
      80,
      40 +
      (
        sampleCount *
        10
      )
    );

  const confidenceLevel =
    confidenceScore >=
      70
      ? "High"
      : confidenceScore >=
          50
        ? "Moderate"
        : "Low";

  return buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "current-edge",

    featureFamily:
      "physical-ocean",

    classification,

    lifecycleState,

    reason,

    values: {
      sampleCount,

      firstObservedAt,

      lastObservedAt,

      durationHours,

      firstEdgeDetected,

      lastEdgeDetected,

      firstEdgeType:
        firstObservation
          .edgeType,

      lastEdgeType:
        lastObservation
          .edgeType,

      firstEdgeState:
        firstObservation
          .edgeState,

      lastEdgeState:
        lastObservation
          .edgeState,

      firstEdgeStrength,

      lastEdgeStrength,

      edgeStrengthChange,

      sourceContractVersion:
        "pelora-current-edge-v1"
    },

    confidence: {
      score:
        confidenceScore,

      level:
        confidenceLevel
    },

    drivers: [
      "multiple-governed-historical-current-edge-contracts-available",
      "chronological-current-edge-observation-window-established",
      `current-edge-lifecycle-${lifecycleState}`
    ],

    limitations: [
      "current-edge-identity-across-space-is-not-confirmed",
      "current-edge-movement-not-assessed",
      "current-edge-geometry-not-preserved",
      "current-edge-persistence-does-not-establish-habitat-quality-or-fishing-opportunity"
    ]
  });
}


export function buildCurrentShearPersistence({
  historicalSnapshots = []
} = {}) {
  const snapshotsInput =
    Array.isArray(
      historicalSnapshots
    )
      ? historicalSnapshots
      : [];

  const shearStrengthRank = {
    none: 0,
    localized: 1,
    "strong-localized": 2,
    measurable: 3,
    pronounced: 4
  };

  const normalizedObservations =
    snapshotsInput
      .map(record => {
        const oceanSnapshot =
          record
            ?.storageRecord
            ?.snapshot ??
          record
            ?.snapshot ??
          record
            ?.oceanSnapshot ??
          null;

        const shear =
          oceanSnapshot
            ?.observation
            ?.observations
            ?.currents
            ?.derived
            ?.spatialAnalysis
            ?.shear ??
          null;

        const snapshotAvailable =
          oceanSnapshot
            ?.available ===
          true;

        const snapshotId =
          oceanSnapshot
            ?.identity
            ?.snapshotId ??
          null;

        const observedAt =
          oceanSnapshot
            ?.metadata
            ?.time
            ?.observedAt ??
          oceanSnapshot
            ?.observation
            ?.observedAt ??
          null;

        const observedAtTimestamp =
          typeof observedAt ===
            "string"
            ? Date.parse(
                observedAt
              )
            : Number.NaN;

        const validObservedAt =
          Number.isFinite(
            observedAtTimestamp
          );

        const contractVersion =
          shear
            ?.contractVersion ??
          null;

        const shearAvailable =
          shear
            ?.available ===
          true;

        const currentShearDetected =
          shear
            ?.currentShearDetected ===
          true;

        const shearType =
          typeof shear
            ?.shearType ===
            "string"
            ? shear.shearType
            : null;

        const shearState =
          typeof shear
            ?.shearState ===
            "string"
            ? shear.shearState
            : null;

        const shearStrength =
          typeof shear
            ?.shearStrength ===
            "string"
            ? shear.shearStrength
            : null;

        const strengthRank =
          Object.hasOwn(
            shearStrengthRank,
            shearStrength
          )
            ? shearStrengthRank[
                shearStrength
              ]
            : null;

        const maximumTotalVectorGradient =
          Number.isFinite(
            shear
              ?.evidence
              ?.maximumTotalVectorGradientMetersPerSecondPerNauticalMile
          )
            ? shear
                .evidence
                .maximumTotalVectorGradientMetersPerSecondPerNauticalMile
            : null;

        return {
          snapshotId,

          observedAt:
            validObservedAt
              ? observedAt
              : null,

          observedAtTimestamp:
            validObservedAt
              ? observedAtTimestamp
              : null,

          contractVersion,

          shearAvailable,

          currentShearDetected,

          shearType,

          shearState,

          shearStrength,

          strengthRank,

          maximumTotalVectorGradient,

          valid:
            snapshotAvailable &&
            typeof snapshotId ===
              "string" &&
            snapshotId.trim().length >
              0 &&
            validObservedAt &&
            contractVersion ===
              "pelora-current-shear-v1" &&
            shearAvailable &&
            strengthRank !==
              null
        };
      })
      .filter(
        observation =>
          observation.valid
      )
      .sort(
        (
          firstObservation,
          secondObservation
        ) =>
          firstObservation
            .observedAtTimestamp -
          secondObservation
            .observedAtTimestamp
      );

  const uniqueObservations = [];

  const seenSnapshotIds =
    new Set();

  for (
    const observation of
      normalizedObservations
  ) {
    if (
      seenSnapshotIds.has(
        observation.snapshotId
      )
    ) {
      continue;
    }

    seenSnapshotIds.add(
      observation.snapshotId
    );

    uniqueObservations.push(
      observation
    );
  }

  const sampleCount =
    uniqueObservations.length;

  const firstObservation =
    sampleCount > 0
      ? uniqueObservations[0]
      : null;

  const lastObservation =
    sampleCount > 0
      ? uniqueObservations[
          sampleCount - 1
        ]
      : null;

  const firstObservedAt =
    firstObservation
      ?.observedAt ??
    null;

  const lastObservedAt =
    lastObservation
      ?.observedAt ??
    null;

  const durationHours =
    firstObservation &&
    lastObservation
      ? (
          lastObservation
            .observedAtTimestamp -
          firstObservation
            .observedAtTimestamp
        ) /
        (
          1000 *
          60 *
          60
        )
      : null;

  if (
    sampleCount ===
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "current-shear",

      featureFamily:
        "physical-ocean",

      classification:
        "unavailable",

      lifecycleState:
        null,

      reason:
        "historical-current-shear-contracts-unavailable",

      values: {
        sampleCount:
          0,

        firstObservedAt:
          null,

        lastObservedAt:
          null,

        durationHours:
          null,

        firstShearDetected:
          null,

        lastShearDetected:
          null,

        firstShearStrength:
          null,

        lastShearStrength:
          null,

        shearStrengthChange:
          null,

        maximumGradientChange:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      limitations: [
        "historical-current-shear-contracts-unavailable",
        "current-shear-persistence-not-assessed",
        "current-shear-movement-not-assessed",
        "feature-absence-not-established"
      ]
    });
  }

  if (
    sampleCount <
      2 ||
    !Number.isFinite(
      durationHours
    ) ||
    durationHours <=
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "current-shear",

      featureFamily:
        "physical-ocean",

      classification:
        "insufficient-history",

      lifecycleState:
        null,

      reason:
        "minimum-two-chronological-current-shear-contracts-required",

      values: {
        sampleCount,

        firstObservedAt,

        lastObservedAt,

        durationHours,

        firstShearDetected:
          firstObservation
            ?.currentShearDetected ??
          null,

        lastShearDetected:
          lastObservation
            ?.currentShearDetected ??
          null,

        firstShearStrength:
          firstObservation
            ?.shearStrength ??
          null,

        lastShearStrength:
          lastObservation
            ?.shearStrength ??
          null,

        shearStrengthChange:
          null,

        maximumGradientChange:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      drivers: [
        "governed-historical-current-shear-contract-available"
      ],

      limitations: [
        "minimum-two-chronological-current-shear-contracts-required",
        "current-shear-persistence-not-assessed",
        "current-shear-movement-not-assessed"
      ]
    });
  }

  const firstShearDetected =
    firstObservation
      .currentShearDetected;

  const lastShearDetected =
    lastObservation
      .currentShearDetected;

  const firstShearStrength =
    firstObservation
      .shearStrength;

  const lastShearStrength =
    lastObservation
      .shearStrength;

  const shearStrengthChange =
    lastObservation
      .strengthRank -
    firstObservation
      .strengthRank;

  const maximumGradientChange =
    firstObservation
      .maximumTotalVectorGradient !==
      null &&
    lastObservation
      .maximumTotalVectorGradient !==
      null
      ? lastObservation
          .maximumTotalVectorGradient -
        firstObservation
          .maximumTotalVectorGradient
      : null;

  let classification =
    "stable-current-shear";

  let lifecycleState =
    "stable";

  let reason =
    "governed-current-shear-strength-remained-stable";

  if (
    !firstShearDetected &&
    lastShearDetected
  ) {
    classification =
      "emerging-current-shear";

    lifecycleState =
      "emerging";

    reason =
      "governed-current-shear-candidate-developed";
  } else if (
    firstShearDetected &&
    !lastShearDetected
  ) {
    classification =
      "fading-current-shear";

    lifecycleState =
      "fading";

    reason =
      "governed-current-shear-candidate-no-longer-supported";
  } else if (
    shearStrengthChange >
      0
  ) {
    classification =
      "strengthening-current-shear";

    lifecycleState =
      "strengthening";

    reason =
      "governed-current-shear-strength-increased";
  } else if (
    shearStrengthChange <
      0
  ) {
    classification =
      "weakening-current-shear";

    lifecycleState =
      "weakening";

    reason =
      "governed-current-shear-strength-decreased";
  }

  const confidenceScore =
    Math.min(
      80,
      40 +
      (
        sampleCount *
        10
      )
    );

  const confidenceLevel =
    confidenceScore >=
      70
      ? "High"
      : confidenceScore >=
          50
        ? "Moderate"
        : "Low";

  return buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "current-shear",

    featureFamily:
      "physical-ocean",

    classification,

    lifecycleState,

    reason,

    values: {
      sampleCount,

      firstObservedAt,

      lastObservedAt,

      durationHours,

      firstShearDetected,

      lastShearDetected,

      firstShearType:
        firstObservation
          .shearType,

      lastShearType:
        lastObservation
          .shearType,

      firstShearState:
        firstObservation
          .shearState,

      lastShearState:
        lastObservation
          .shearState,

      firstShearStrength,

      lastShearStrength,

      shearStrengthChange,

      firstMaximumTotalVectorGradientMetersPerSecondPerNauticalMile:
        firstObservation
          .maximumTotalVectorGradient,

      lastMaximumTotalVectorGradientMetersPerSecondPerNauticalMile:
        lastObservation
          .maximumTotalVectorGradient,

      maximumGradientChange,

      sourceContractVersion:
        "pelora-current-shear-v1"
    },

    confidence: {
      score:
        confidenceScore,

      level:
        confidenceLevel
    },

    drivers: [
      "multiple-governed-historical-current-shear-contracts-available",
      "chronological-current-shear-observation-window-established",
      `current-shear-lifecycle-${lifecycleState}`
    ],

    limitations: [
      "current-shear-identity-across-space-is-not-confirmed",
      "current-shear-movement-not-assessed",
      "current-shear-geometry-not-preserved",
      "current-shear-persistence-does-not-establish-current-edge-persistence",
      "current-shear-persistence-does-not-establish-habitat-quality-or-fishing-opportunity"
    ]
  });
}


export function buildCurrentConvergencePersistence({
  historicalSnapshots = []
} = {}) {
  const snapshotsInput =
    Array.isArray(
      historicalSnapshots
    )
      ? historicalSnapshots
      : [];

  const convergenceStrengthRank = {
    none: 0,
    localized: 1,
    measurable: 2,
    pronounced: 3
  };

  const normalizedObservations =
    snapshotsInput
      .map(record => {
        const oceanSnapshot =
          record
            ?.storageRecord
            ?.snapshot ??
          record
            ?.snapshot ??
          record
            ?.oceanSnapshot ??
          null;

        const convergence =
          oceanSnapshot
            ?.observation
            ?.observations
            ?.currents
            ?.derived
            ?.spatialAnalysis
            ?.convergence ??
          null;

        const snapshotAvailable =
          oceanSnapshot
            ?.available ===
          true;

        const snapshotId =
          oceanSnapshot
            ?.identity
            ?.snapshotId ??
          null;

        const observedAt =
          oceanSnapshot
            ?.metadata
            ?.time
            ?.observedAt ??
          oceanSnapshot
            ?.observation
            ?.observedAt ??
          null;

        const observedAtTimestamp =
          typeof observedAt ===
            "string"
            ? Date.parse(
                observedAt
              )
            : Number.NaN;

        const validObservedAt =
          Number.isFinite(
            observedAtTimestamp
          );

        const contractVersion =
          convergence
            ?.contractVersion ??
          null;

        const convergenceAvailable =
          convergence
            ?.available ===
          true;

        const convergenceType =
          typeof convergence
            ?.convergenceType ===
            "string"
            ? convergence
                .convergenceType
            : null;

        const convergenceState =
          typeof convergence
            ?.convergenceState ===
            "string"
            ? convergence
                .convergenceState
            : null;

        const convergenceStrength =
          typeof convergence
            ?.convergenceStrength ===
            "string"
            ? convergence
                .convergenceStrength
            : null;

        const strengthRank =
          Object.hasOwn(
            convergenceStrengthRank,
            convergenceStrength
          )
            ? convergenceStrengthRank[
                convergenceStrength
              ]
            : null;

        const convergenceDetected =
          convergenceState ===
            "candidate" &&
          [
            "convergence-candidate",
            "pronounced-convergence-candidate"
          ].includes(
            convergenceType
          );

        const meanMeaningfulInwardMetersPerSecond =
          Number.isFinite(
            convergence
              ?.evidence
              ?.meanMeaningfulInwardMetersPerSecond
          )
            ? convergence
                .evidence
                .meanMeaningfulInwardMetersPerSecond
            : null;

        const maximumInwardMetersPerSecond =
          Number.isFinite(
            convergence
              ?.evidence
              ?.maximumInwardMetersPerSecond
          )
            ? convergence
                .evidence
                .maximumInwardMetersPerSecond
            : null;

        return {
          snapshotId,

          observedAt:
            validObservedAt
              ? observedAt
              : null,

          observedAtTimestamp:
            validObservedAt
              ? observedAtTimestamp
              : null,

          contractVersion,

          convergenceAvailable,

          convergenceDetected,

          convergenceType,

          convergenceState,

          convergenceStrength,

          strengthRank,

          meanMeaningfulInwardMetersPerSecond,

          maximumInwardMetersPerSecond,

          valid:
            snapshotAvailable &&
            typeof snapshotId ===
              "string" &&
            snapshotId.trim().length >
              0 &&
            validObservedAt &&
            contractVersion ===
              "pelora-current-convergence-v1" &&
            convergenceAvailable &&
            strengthRank !==
              null
        };
      })
      .filter(
        observation =>
          observation.valid
      )
      .sort(
        (
          firstObservation,
          secondObservation
        ) =>
          firstObservation
            .observedAtTimestamp -
          secondObservation
            .observedAtTimestamp
      );

  const uniqueObservations = [];

  const seenSnapshotIds =
    new Set();

  for (
    const observation of
      normalizedObservations
  ) {
    if (
      seenSnapshotIds.has(
        observation.snapshotId
      )
    ) {
      continue;
    }

    seenSnapshotIds.add(
      observation.snapshotId
    );

    uniqueObservations.push(
      observation
    );
  }

  const sampleCount =
    uniqueObservations.length;

  const firstObservation =
    sampleCount > 0
      ? uniqueObservations[0]
      : null;

  const lastObservation =
    sampleCount > 0
      ? uniqueObservations[
          sampleCount - 1
        ]
      : null;

  const firstObservedAt =
    firstObservation
      ?.observedAt ??
    null;

  const lastObservedAt =
    lastObservation
      ?.observedAt ??
    null;

  const durationHours =
    firstObservation &&
    lastObservation
      ? (
          lastObservation
            .observedAtTimestamp -
          firstObservation
            .observedAtTimestamp
        ) /
        (
          1000 *
          60 *
          60
        )
      : null;

  if (
    sampleCount ===
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "current-convergence",

      featureFamily:
        "physical-ocean",

      classification:
        "unavailable",

      lifecycleState:
        null,

      reason:
        "historical-current-convergence-contracts-unavailable",

      values: {
        sampleCount:
          0,

        firstObservedAt:
          null,

        lastObservedAt:
          null,

        durationHours:
          null,

        firstConvergenceDetected:
          null,

        lastConvergenceDetected:
          null,

        firstConvergenceStrength:
          null,

        lastConvergenceStrength:
          null,

        convergenceStrengthChange:
          null,

        meanInwardChangeMetersPerSecond:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      limitations: [
        "historical-current-convergence-contracts-unavailable",
        "current-convergence-persistence-not-assessed",
        "current-convergence-movement-not-assessed",
        "feature-absence-not-established"
      ]
    });
  }

  if (
    sampleCount <
      2 ||
    !Number.isFinite(
      durationHours
    ) ||
    durationHours <=
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "current-convergence",

      featureFamily:
        "physical-ocean",

      classification:
        "insufficient-history",

      lifecycleState:
        null,

      reason:
        "minimum-two-chronological-current-convergence-contracts-required",

      values: {
        sampleCount,

        firstObservedAt,

        lastObservedAt,

        durationHours,

        firstConvergenceDetected:
          firstObservation
            ?.convergenceDetected ??
          null,

        lastConvergenceDetected:
          lastObservation
            ?.convergenceDetected ??
          null,

        firstConvergenceStrength:
          firstObservation
            ?.convergenceStrength ??
          null,

        lastConvergenceStrength:
          lastObservation
            ?.convergenceStrength ??
          null,

        convergenceStrengthChange:
          null,

        meanInwardChangeMetersPerSecond:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      drivers: [
        "governed-historical-current-convergence-contract-available"
      ],

      limitations: [
        "minimum-two-chronological-current-convergence-contracts-required",
        "current-convergence-persistence-not-assessed",
        "current-convergence-movement-not-assessed"
      ]
    });
  }

  const firstConvergenceDetected =
    firstObservation
      .convergenceDetected;

  const lastConvergenceDetected =
    lastObservation
      .convergenceDetected;

  const firstConvergenceStrength =
    firstObservation
      .convergenceStrength;

  const lastConvergenceStrength =
    lastObservation
      .convergenceStrength;

  const convergenceStrengthChange =
    lastObservation
      .strengthRank -
    firstObservation
      .strengthRank;

  const meanInwardChangeMetersPerSecond =
    firstObservation
      .meanMeaningfulInwardMetersPerSecond !==
      null &&
    lastObservation
      .meanMeaningfulInwardMetersPerSecond !==
      null
      ? lastObservation
          .meanMeaningfulInwardMetersPerSecond -
        firstObservation
          .meanMeaningfulInwardMetersPerSecond
      : null;

  let classification =
    "stable-current-convergence";

  let lifecycleState =
    "stable";

  let reason =
    "governed-current-convergence-strength-remained-stable";

  if (
    !firstConvergenceDetected &&
    lastConvergenceDetected
  ) {
    classification =
      "emerging-current-convergence";

    lifecycleState =
      "emerging";

    reason =
      "governed-current-convergence-candidate-developed";
  } else if (
    firstConvergenceDetected &&
    !lastConvergenceDetected
  ) {
    classification =
      "fading-current-convergence";

    lifecycleState =
      "fading";

    reason =
      "governed-current-convergence-candidate-no-longer-supported";
  } else if (
    convergenceStrengthChange >
      0
  ) {
    classification =
      "strengthening-current-convergence";

    lifecycleState =
      "strengthening";

    reason =
      "governed-current-convergence-strength-increased";
  } else if (
    convergenceStrengthChange <
      0
  ) {
    classification =
      "weakening-current-convergence";

    lifecycleState =
      "weakening";

    reason =
      "governed-current-convergence-strength-decreased";
  }

  const confidenceScore =
    Math.min(
      80,
      40 +
      (
        sampleCount *
        10
      )
    );

  const confidenceLevel =
    confidenceScore >=
      70
      ? "High"
      : confidenceScore >=
          50
        ? "Moderate"
        : "Low";

  return buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "current-convergence",

    featureFamily:
      "physical-ocean",

    classification,

    lifecycleState,

    reason,

    values: {
      sampleCount,

      firstObservedAt,

      lastObservedAt,

      durationHours,

      firstConvergenceDetected,

      lastConvergenceDetected,

      firstConvergenceType:
        firstObservation
          .convergenceType,

      lastConvergenceType:
        lastObservation
          .convergenceType,

      firstConvergenceState:
        firstObservation
          .convergenceState,

      lastConvergenceState:
        lastObservation
          .convergenceState,

      firstConvergenceStrength,

      lastConvergenceStrength,

      convergenceStrengthChange,

      firstMeanMeaningfulInwardMetersPerSecond:
        firstObservation
          .meanMeaningfulInwardMetersPerSecond,

      lastMeanMeaningfulInwardMetersPerSecond:
        lastObservation
          .meanMeaningfulInwardMetersPerSecond,

      meanInwardChangeMetersPerSecond,

      firstMaximumInwardMetersPerSecond:
        firstObservation
          .maximumInwardMetersPerSecond,

      lastMaximumInwardMetersPerSecond:
        lastObservation
          .maximumInwardMetersPerSecond,

      sourceContractVersion:
        "pelora-current-convergence-v1"
    },

    confidence: {
      score:
        confidenceScore,

      level:
        confidenceLevel
    },

    drivers: [
      "multiple-governed-historical-current-convergence-contracts-available",
      "chronological-current-convergence-observation-window-established",
      `current-convergence-lifecycle-${lifecycleState}`
    ],

    limitations: [
      "current-convergence-identity-across-space-is-not-confirmed",
      "current-convergence-movement-not-assessed",
      "current-convergence-geometry-not-preserved",
      "current-convergence-does-not-establish-vertical-motion",
      "current-convergence-persistence-does-not-establish-habitat-quality-or-fishing-opportunity"
    ]
  });
}


/**
 * ------------------------------------------------------------
 * Environmental Transition Persistence Analysis v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Compare governed Environmental Transition Analysis contracts
 * across chronological Ocean Memory snapshots.
 *
 * This version evaluates persistence of environmental-transition
 * context. It does not confirm a verified environmental
 * transition, ocean front, habitat, species opportunity, prey
 * concentration, or fishing quality.
 */
export function buildEnvironmentalTransitionPersistence({
  historicalSnapshots = []
} = {}) {
  const snapshotsInput =
    Array.isArray(
      historicalSnapshots
    )
      ? historicalSnapshots
      : [];

  const transitionStrengthRank = {
    none: 0,
    weak: 1,
    measurable: 2,
    pronounced: 3
  };

  const normalizedObservations =
    snapshotsInput
      .map(record => {
        const oceanSnapshot =
          record
            ?.storageRecord
            ?.snapshot ??
          record
            ?.snapshot ??
          record
            ?.oceanSnapshot ??
          null;

        const environmentalTransition =
          oceanSnapshot
            ?.observation
            ?.oceanPhysics
            ?.environmentalTransitionAnalysis ??
          null;

        const snapshotAvailable =
          oceanSnapshot
            ?.available ===
          true;

        const snapshotId =
          oceanSnapshot
            ?.identity
            ?.snapshotId ??
          null;

        const observedAt =
          oceanSnapshot
            ?.metadata
            ?.time
            ?.observedAt ??
          oceanSnapshot
            ?.observation
            ?.observedAt ??
          null;

        const observedAtTimestamp =
          typeof observedAt ===
            "string"
            ? Date.parse(
                observedAt
              )
            : Number.NaN;

        const validObservedAt =
          Number.isFinite(
            observedAtTimestamp
          );

        const contractVersion =
          environmentalTransition
            ?.contractVersion ??
          null;

        const transitionAvailable =
          environmentalTransition
            ?.available ===
          true;

        const classification =
          typeof environmentalTransition
            ?.classification ===
            "string"
            ? environmentalTransition
                .classification
            : null;

        const transitionType =
          typeof environmentalTransition
            ?.transitionType ===
            "string"
            ? environmentalTransition
                .transitionType
            : null;

        const transitionState =
          typeof environmentalTransition
            ?.transitionState ===
            "string"
            ? environmentalTransition
                .transitionState
            : null;

        const transitionStrength =
          typeof environmentalTransition
            ?.transitionStrength ===
            "string"
            ? environmentalTransition
                .transitionStrength
            : null;

        const strengthRank =
          Object.hasOwn(
            transitionStrengthRank,
            transitionStrength
          )
            ? transitionStrengthRank[
                transitionStrength
              ]
            : null;

        const transitionContextSupported =
          transitionState ===
            "candidate-context" &&
          [
            "thermal",
            "hydrodynamic",
            "thermal-and-hydrodynamic",
            "multi-signal"
          ].includes(
            transitionType
          );

        const thermalTransitionSupported =
          environmentalTransition
            ?.evidence
            ?.thermalTransitionSupported ===
          true;

        const hydrodynamicTransitionSupported =
          environmentalTransition
            ?.evidence
            ?.hydrodynamicTransitionSupported ===
          true;

        const independentTransitionSignalCount =
          Number.isFinite(
            environmentalTransition
              ?.evidence
              ?.independentTransitionSignalCount
          )
            ? environmentalTransition
                .evidence
                .independentTransitionSignalCount
            : null;

        return {
          snapshotId,

          observedAt:
            validObservedAt
              ? observedAt
              : null,

          observedAtTimestamp:
            validObservedAt
              ? observedAtTimestamp
              : null,

          contractVersion,

          transitionAvailable,

          classification,

          transitionType,

          transitionState,

          transitionStrength,

          strengthRank,

          transitionContextSupported,

          thermalTransitionSupported,

          hydrodynamicTransitionSupported,

          independentTransitionSignalCount,

          valid:
            snapshotAvailable &&
            typeof snapshotId ===
              "string" &&
            snapshotId.trim().length >
              0 &&
            validObservedAt &&
            contractVersion ===
              "pelora-environmental-transition-analysis-v1" &&
            transitionAvailable &&
            strengthRank !==
              null
        };
      })
      .filter(
        observation =>
          observation.valid
      )
      .sort(
        (
          firstObservation,
          secondObservation
        ) =>
          firstObservation
            .observedAtTimestamp -
          secondObservation
            .observedAtTimestamp
      );

  const uniqueObservations = [];

  const seenSnapshotIds =
    new Set();

  for (
    const observation of
      normalizedObservations
  ) {
    if (
      seenSnapshotIds.has(
        observation.snapshotId
      )
    ) {
      continue;
    }

    seenSnapshotIds.add(
      observation.snapshotId
    );

    uniqueObservations.push(
      observation
    );
  }

  const sampleCount =
    uniqueObservations.length;

  const firstObservation =
    sampleCount > 0
      ? uniqueObservations[0]
      : null;

  const lastObservation =
    sampleCount > 0
      ? uniqueObservations[
          sampleCount - 1
        ]
      : null;

  const firstObservedAt =
    firstObservation
      ?.observedAt ??
    null;

  const lastObservedAt =
    lastObservation
      ?.observedAt ??
    null;

  const durationHours =
    firstObservation &&
    lastObservation
      ? (
          lastObservation
            .observedAtTimestamp -
          firstObservation
            .observedAtTimestamp
        ) /
        (
          1000 *
          60 *
          60
        )
      : null;

  if (
    sampleCount ===
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "environmental-transition",

      featureFamily:
        "integrated-ocean-physics",

      classification:
        "unavailable",

      lifecycleState:
        null,

      reason:
        "historical-environmental-transition-contracts-unavailable",

      values: {
        sampleCount:
          0,

        firstObservedAt:
          null,

        lastObservedAt:
          null,

        durationHours:
          null,

        firstTransitionContextSupported:
          null,

        lastTransitionContextSupported:
          null,

        firstTransitionStrength:
          null,

        lastTransitionStrength:
          null,

        transitionStrengthChange:
          null,

        firstIndependentTransitionSignalCount:
          null,

        lastIndependentTransitionSignalCount:
          null,

        transitionSignalCountChange:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      limitations: [
        "historical-environmental-transition-contracts-unavailable",
        "environmental-transition-persistence-not-assessed",
        "transition-identity-across-space-not-established",
        "feature-absence-not-established"
      ]
    });
  }

  if (
    sampleCount <
      2 ||
    !Number.isFinite(
      durationHours
    ) ||
    durationHours <=
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "environmental-transition",

      featureFamily:
        "integrated-ocean-physics",

      classification:
        "insufficient-history",

      lifecycleState:
        null,

      reason:
        "minimum-two-chronological-environmental-transition-contracts-required",

      values: {
        sampleCount,

        firstObservedAt,

        lastObservedAt,

        durationHours,

        firstTransitionContextSupported:
          firstObservation
            ?.transitionContextSupported ??
          null,

        lastTransitionContextSupported:
          lastObservation
            ?.transitionContextSupported ??
          null,

        firstTransitionStrength:
          firstObservation
            ?.transitionStrength ??
          null,

        lastTransitionStrength:
          lastObservation
            ?.transitionStrength ??
          null,

        transitionStrengthChange:
          null,

        firstIndependentTransitionSignalCount:
          firstObservation
            ?.independentTransitionSignalCount ??
          null,

        lastIndependentTransitionSignalCount:
          lastObservation
            ?.independentTransitionSignalCount ??
          null,

        transitionSignalCountChange:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      drivers: [
        "governed-historical-environmental-transition-contract-available"
      ],

      limitations: [
        "minimum-two-chronological-environmental-transition-contracts-required",
        "environmental-transition-persistence-not-assessed",
        "transition-identity-across-space-not-established"
      ]
    });
  }

  const firstTransitionContextSupported =
    firstObservation
      .transitionContextSupported;

  const lastTransitionContextSupported =
    lastObservation
      .transitionContextSupported;

  const firstTransitionStrength =
    firstObservation
      .transitionStrength;

  const lastTransitionStrength =
    lastObservation
      .transitionStrength;

  const transitionStrengthChange =
    lastObservation
      .strengthRank -
    firstObservation
      .strengthRank;

  const transitionSignalCountChange =
    firstObservation
      .independentTransitionSignalCount !==
      null &&
    lastObservation
      .independentTransitionSignalCount !==
      null
      ? lastObservation
          .independentTransitionSignalCount -
        firstObservation
          .independentTransitionSignalCount
      : null;

  let classification =
    "stable-environmental-transition-context";

  let lifecycleState =
    "stable";

  let reason =
    "governed-environmental-transition-context-remained-stable";

  if (
    !firstTransitionContextSupported &&
    lastTransitionContextSupported
  ) {
    classification =
      "emerging-environmental-transition-context";

    lifecycleState =
      "emerging";

    reason =
      "governed-environmental-transition-context-developed";
  } else if (
    firstTransitionContextSupported &&
    !lastTransitionContextSupported
  ) {
    classification =
      "fading-environmental-transition-context";

    lifecycleState =
      "fading";

    reason =
      "governed-environmental-transition-context-no-longer-supported";
  } else if (
    transitionStrengthChange >
      0
  ) {
    classification =
      "strengthening-environmental-transition-context";

    lifecycleState =
      "strengthening";

    reason =
      "governed-environmental-transition-strength-increased";
  } else if (
    transitionStrengthChange <
      0
  ) {
    classification =
      "weakening-environmental-transition-context";

    lifecycleState =
      "weakening";

    reason =
      "governed-environmental-transition-strength-decreased";
  }

  const confidenceScore =
    Math.min(
      80,
      40 +
      (
        sampleCount *
        10
      )
    );

  const confidenceLevel =
    confidenceScore >=
      70
      ? "High"
      : confidenceScore >=
          50
        ? "Moderate"
        : "Low";

  return buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "environmental-transition",

    featureFamily:
      "integrated-ocean-physics",

    classification,

    lifecycleState,

    reason,

    values: {
      sampleCount,

      firstObservedAt,

      lastObservedAt,

      durationHours,

      firstTransitionContextSupported,

      lastTransitionContextSupported,

      firstClassification:
        firstObservation
          .classification,

      lastClassification:
        lastObservation
          .classification,

      firstTransitionType:
        firstObservation
          .transitionType,

      lastTransitionType:
        lastObservation
          .transitionType,

      firstTransitionState:
        firstObservation
          .transitionState,

      lastTransitionState:
        lastObservation
          .transitionState,

      firstTransitionStrength,

      lastTransitionStrength,

      transitionStrengthChange,

      firstThermalTransitionSupported:
        firstObservation
          .thermalTransitionSupported,

      lastThermalTransitionSupported:
        lastObservation
          .thermalTransitionSupported,

      firstHydrodynamicTransitionSupported:
        firstObservation
          .hydrodynamicTransitionSupported,

      lastHydrodynamicTransitionSupported:
        lastObservation
          .hydrodynamicTransitionSupported,

      firstIndependentTransitionSignalCount:
        firstObservation
          .independentTransitionSignalCount,

      lastIndependentTransitionSignalCount:
        lastObservation
          .independentTransitionSignalCount,

      transitionSignalCountChange,

      sourceContractVersion:
        "pelora-environmental-transition-analysis-v1"
    },

    confidence: {
      score:
        confidenceScore,

      level:
        confidenceLevel
    },

    drivers: [
      "multiple-governed-historical-environmental-transition-contracts-available",
      "chronological-environmental-transition-observation-window-established",
      `environmental-transition-lifecycle-${lifecycleState}`
    ],

    limitations: [
      "environmental-transition-context-persistence-does-not-confirm-a-verified-transition",
      "environmental-transition-identity-across-space-is-not-confirmed",
      "environmental-transition-movement-not-assessed",
      "full-water-column-structure-not-assessed",
      "environmental-transition-persistence-does-not-establish-an-ocean-front",
      "environmental-transition-persistence-does-not-establish-habitat-quality-or-fishing-opportunity"
    ]
  });
}


/**
 * ------------------------------------------------------------
 * Surface Water Character Persistence Analysis v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Compare governed Surface Water Character Analysis contracts
 * across chronological Ocean Memory snapshots.
 *
 * This version evaluates persistence of local surface-water
 * context and boundary context. It does not establish a named
 * water mass, distinct adjacent water masses, a mixing zone,
 * an ocean front, habitat, species opportunity, prey
 * concentration, or fishing quality.
 */
export function buildSurfaceWaterCharacterPersistence({
  historicalSnapshots = []
} = {}) {
  const snapshotsInput =
    Array.isArray(
      historicalSnapshots
    )
      ? historicalSnapshots
      : [];

  const boundaryStrengthRank = {
    unavailable: 0,
    "not-established": 0,
    "weak-thermal-transition": 1,
    "moderate-thermal-transition": 2,
    "strong-thermal-break-candidate": 3,
    "current-edge": 2,
    "thermal-and-current-boundary": 3,
    "pronounced-thermal-and-current-boundary": 4
  };

  const normalizedObservations =
    snapshotsInput
      .map(record => {
        const oceanSnapshot =
          record
            ?.storageRecord
            ?.snapshot ??
          record
            ?.snapshot ??
          record
            ?.oceanSnapshot ??
          null;

        const surfaceWaterCharacter =
          oceanSnapshot
            ?.observation
            ?.oceanPhysics
            ?.surfaceWaterCharacter ??
          null;

        const snapshotAvailable =
          oceanSnapshot
            ?.available ===
          true;

        const snapshotId =
          oceanSnapshot
            ?.identity
            ?.snapshotId ??
          null;

        const observedAt =
          oceanSnapshot
            ?.metadata
            ?.time
            ?.observedAt ??
          oceanSnapshot
            ?.observation
            ?.observedAt ??
          null;

        const observedAtTimestamp =
          typeof observedAt ===
            "string"
            ? Date.parse(
                observedAt
              )
            : Number.NaN;

        const validObservedAt =
          Number.isFinite(
            observedAtTimestamp
          );

        const contractVersion =
          surfaceWaterCharacter
            ?.contractVersion ??
          null;

        const characterAvailable =
          surfaceWaterCharacter
            ?.available ===
          true;

        const classification =
          typeof surfaceWaterCharacter
            ?.classification ===
            "string"
            ? surfaceWaterCharacter
                .classification
            : null;

        const state =
          typeof surfaceWaterCharacter
            ?.state ===
            "string"
            ? surfaceWaterCharacter
                .state
            : null;

        const boundaryContext =
          typeof surfaceWaterCharacter
            ?.boundaryContext ===
            "string"
            ? surfaceWaterCharacter
                .boundaryContext
            : null;

        const boundaryStrength =
          Object.hasOwn(
            boundaryStrengthRank,
            boundaryContext
          )
            ? boundaryStrengthRank[
                boundaryContext
              ]
            : null;

        const boundaryContextSupported =
          state ===
            "candidate-context" &&
          boundaryContext !==
            "not-established";

        const localTemperatureFahrenheit =
          Number.isFinite(
            surfaceWaterCharacter
              ?.localCharacter
              ?.localTemperatureFahrenheit
          )
            ? surfaceWaterCharacter
                .localCharacter
                .localTemperatureFahrenheit
            : null;

        const chlorophyllConcentrationMgM3 =
          Number.isFinite(
            surfaceWaterCharacter
              ?.localCharacter
              ?.chlorophyllConcentrationMgM3
          )
            ? surfaceWaterCharacter
                .localCharacter
                .chlorophyllConcentrationMgM3
            : null;

        const thermalRangeFahrenheit =
          Number.isFinite(
            surfaceWaterCharacter
              ?.spatialContext
              ?.thermalRangeFahrenheit
          )
            ? surfaceWaterCharacter
                .spatialContext
                .thermalRangeFahrenheit
            : null;

        const currentEdgeDetected =
          surfaceWaterCharacter
            ?.spatialContext
            ?.currentEdgeDetected ===
          true;

        return {
          snapshotId,

          observedAt:
            validObservedAt
              ? observedAt
              : null,

          observedAtTimestamp:
            validObservedAt
              ? observedAtTimestamp
              : null,

          contractVersion,

          characterAvailable,

          classification,

          state,

          boundaryContext,

          boundaryStrength,

          boundaryContextSupported,

          localTemperatureFahrenheit,

          chlorophyllConcentrationMgM3,

          thermalRangeFahrenheit,

          currentEdgeDetected,

          valid:
            snapshotAvailable &&
            typeof snapshotId ===
              "string" &&
            snapshotId.trim().length >
              0 &&
            validObservedAt &&
            contractVersion ===
              "pelora-surface-water-character-v1" &&
            characterAvailable &&
            boundaryStrength !==
              null
        };
      })
      .filter(
        observation =>
          observation.valid
      )
      .sort(
        (
          firstObservation,
          secondObservation
        ) =>
          firstObservation
            .observedAtTimestamp -
          secondObservation
            .observedAtTimestamp
      );

  const uniqueObservations = [];
  const seenSnapshotIds =
    new Set();

  for (
    const observation of
      normalizedObservations
  ) {
    if (
      seenSnapshotIds.has(
        observation.snapshotId
      )
    ) {
      continue;
    }

    seenSnapshotIds.add(
      observation.snapshotId
    );

    uniqueObservations.push(
      observation
    );
  }

  const sampleCount =
    uniqueObservations.length;

  const firstObservation =
    sampleCount > 0
      ? uniqueObservations[0]
      : null;

  const lastObservation =
    sampleCount > 0
      ? uniqueObservations[
          sampleCount - 1
        ]
      : null;

  const firstObservedAt =
    firstObservation
      ?.observedAt ??
    null;

  const lastObservedAt =
    lastObservation
      ?.observedAt ??
    null;

  const durationHours =
    firstObservation &&
    lastObservation
      ? (
          lastObservation
            .observedAtTimestamp -
          firstObservation
            .observedAtTimestamp
        ) /
        (
          1000 *
          60 *
          60
        )
      : null;

  if (
    sampleCount ===
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "surface-water-character",

      featureFamily:
        "integrated-ocean-physics",

      classification:
        "unavailable",

      lifecycleState:
        null,

      reason:
        "historical-surface-water-character-contracts-unavailable",

      values: {
        sampleCount:
          0,

        firstObservedAt:
          null,

        lastObservedAt:
          null,

        durationHours:
          null,

        firstBoundaryContextSupported:
          null,

        lastBoundaryContextSupported:
          null,

        firstBoundaryContext:
          null,

        lastBoundaryContext:
          null,

        boundaryStrengthChange:
          null,

        localTemperatureChangeFahrenheit:
          null,

        chlorophyllChangeMgM3:
          null,

        thermalRangeChangeFahrenheit:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      limitations: [
        "historical-surface-water-character-contracts-unavailable",
        "surface-water-character-persistence-not-assessed",
        "water-mass-identity-not-established",
        "feature-absence-not-established"
      ]
    });
  }

  if (
    sampleCount <
      2 ||
    !Number.isFinite(
      durationHours
    ) ||
    durationHours <=
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "surface-water-character",

      featureFamily:
        "integrated-ocean-physics",

      classification:
        "insufficient-history",

      lifecycleState:
        null,

      reason:
        "minimum-two-chronological-surface-water-character-contracts-required",

      values: {
        sampleCount,

        firstObservedAt,

        lastObservedAt,

        durationHours,

        firstBoundaryContextSupported:
          firstObservation
            ?.boundaryContextSupported ??
          null,

        lastBoundaryContextSupported:
          lastObservation
            ?.boundaryContextSupported ??
          null,

        firstBoundaryContext:
          firstObservation
            ?.boundaryContext ??
          null,

        lastBoundaryContext:
          lastObservation
            ?.boundaryContext ??
          null,

        boundaryStrengthChange:
          null,

        localTemperatureChangeFahrenheit:
          null,

        chlorophyllChangeMgM3:
          null,

        thermalRangeChangeFahrenheit:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      drivers: [
        "governed-historical-surface-water-character-contract-available"
      ],

      limitations: [
        "minimum-two-chronological-surface-water-character-contracts-required",
        "surface-water-character-persistence-not-assessed",
        "water-mass-identity-not-established"
      ]
    });
  }

  const firstBoundaryContextSupported =
    firstObservation
      .boundaryContextSupported;

  const lastBoundaryContextSupported =
    lastObservation
      .boundaryContextSupported;

  const boundaryStrengthChange =
    lastObservation
      .boundaryStrength -
    firstObservation
      .boundaryStrength;

  const localTemperatureChangeFahrenheit =
    firstObservation
      .localTemperatureFahrenheit !==
      null &&
    lastObservation
      .localTemperatureFahrenheit !==
      null
      ? lastObservation
          .localTemperatureFahrenheit -
        firstObservation
          .localTemperatureFahrenheit
      : null;

  const chlorophyllChangeMgM3 =
    firstObservation
      .chlorophyllConcentrationMgM3 !==
      null &&
    lastObservation
      .chlorophyllConcentrationMgM3 !==
      null
      ? lastObservation
          .chlorophyllConcentrationMgM3 -
        firstObservation
          .chlorophyllConcentrationMgM3
      : null;

  const thermalRangeChangeFahrenheit =
    firstObservation
      .thermalRangeFahrenheit !==
      null &&
    lastObservation
      .thermalRangeFahrenheit !==
      null
      ? lastObservation
          .thermalRangeFahrenheit -
        firstObservation
          .thermalRangeFahrenheit
      : null;

  let classification =
    "stable-surface-water-character-context";

  let lifecycleState =
    "stable";

  let reason =
    "governed-surface-water-character-context-remained-stable";

  if (
    !firstBoundaryContextSupported &&
    lastBoundaryContextSupported
  ) {
    classification =
      "emerging-surface-water-boundary-context";

    lifecycleState =
      "emerging";

    reason =
      "governed-surface-water-boundary-context-developed";
  } else if (
    firstBoundaryContextSupported &&
    !lastBoundaryContextSupported
  ) {
    classification =
      "fading-surface-water-boundary-context";

    lifecycleState =
      "fading";

    reason =
      "governed-surface-water-boundary-context-no-longer-supported";
  } else if (
    boundaryStrengthChange >
      0
  ) {
    classification =
      "strengthening-surface-water-boundary-context";

    lifecycleState =
      "strengthening";

    reason =
      "governed-surface-water-boundary-strength-increased";
  } else if (
    boundaryStrengthChange <
      0
  ) {
    classification =
      "weakening-surface-water-boundary-context";

    lifecycleState =
      "weakening";

    reason =
      "governed-surface-water-boundary-strength-decreased";
  }

  const confidenceScore =
    Math.min(
      80,
      40 +
      (
        sampleCount *
        10
      )
    );

  const confidenceLevel =
    confidenceScore >=
      70
      ? "High"
      : confidenceScore >=
          50
        ? "Moderate"
        : "Low";

  return buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "surface-water-character",

    featureFamily:
      "integrated-ocean-physics",

    classification,

    lifecycleState,

    reason,

    values: {
      sampleCount,

      firstObservedAt,

      lastObservedAt,

      durationHours,

      firstBoundaryContextSupported,

      lastBoundaryContextSupported,

      firstClassification:
        firstObservation
          .classification,

      lastClassification:
        lastObservation
          .classification,

      firstState:
        firstObservation
          .state,

      lastState:
        lastObservation
          .state,

      firstBoundaryContext:
        firstObservation
          .boundaryContext,

      lastBoundaryContext:
        lastObservation
          .boundaryContext,

      boundaryStrengthChange,

      firstLocalTemperatureFahrenheit:
        firstObservation
          .localTemperatureFahrenheit,

      lastLocalTemperatureFahrenheit:
        lastObservation
          .localTemperatureFahrenheit,

      localTemperatureChangeFahrenheit,

      firstChlorophyllConcentrationMgM3:
        firstObservation
          .chlorophyllConcentrationMgM3,

      lastChlorophyllConcentrationMgM3:
        lastObservation
          .chlorophyllConcentrationMgM3,

      chlorophyllChangeMgM3,

      firstThermalRangeFahrenheit:
        firstObservation
          .thermalRangeFahrenheit,

      lastThermalRangeFahrenheit:
        lastObservation
          .thermalRangeFahrenheit,

      thermalRangeChangeFahrenheit,

      firstCurrentEdgeDetected:
        firstObservation
          .currentEdgeDetected,

      lastCurrentEdgeDetected:
        lastObservation
          .currentEdgeDetected,

      sourceContractVersion:
        "pelora-surface-water-character-v1"
    },

    confidence: {
      score:
        confidenceScore,

      level:
        confidenceLevel
    },

    drivers: [
      "multiple-governed-historical-surface-water-character-contracts-available",
      "chronological-surface-water-character-observation-window-established",
      `surface-water-character-lifecycle-${lifecycleState}`
    ],

    limitations: [
      "surface-water-character-persistence-does-not-establish-a-named-water-mass",
      "surface-water-character-identity-across-space-is-not-confirmed",
      "distinct-adjacent-water-masses-not-established",
      "surface-water-character-movement-not-assessed",
      "full-water-column-structure-not-assessed",
      "surface-water-character-persistence-does-not-establish-habitat-quality-or-fishing-opportunity"
    ]
  });
}


/**
 * ------------------------------------------------------------
 * Water Mass Persistence Analysis v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Compare governed Water Mass Analysis contracts across
 * chronological Ocean Memory snapshots.
 *
 * This version evaluates persistence of water-mass distinction
 * readiness and surface-boundary context. It does not establish
 * a named water mass, origin, verified adjacent water masses,
 * mixing zone, ocean front, habitat, prey concentration, fish
 * presence, or fishing quality.
 */
export function buildWaterMassPersistence({
  historicalSnapshots = []
} = {}) {
  const snapshotsInput =
    Array.isArray(
      historicalSnapshots
    )
      ? historicalSnapshots
      : [];

  const readinessRank = {
    "insufficient-evidence": 0,
    "not-ready": 1,
    "partially-ready": 2,
    ready: 3
  };

  const normalizedObservations =
    snapshotsInput
      .map(record => {
        const oceanSnapshot =
          record
            ?.storageRecord
            ?.snapshot ??
          record
            ?.snapshot ??
          record
            ?.oceanSnapshot ??
          null;

        const waterMassAnalysis =
          oceanSnapshot
            ?.observation
            ?.oceanPhysics
            ?.waterMassAnalysis ??
          null;

        const snapshotAvailable =
          oceanSnapshot
            ?.available ===
          true;

        const snapshotId =
          oceanSnapshot
            ?.identity
            ?.snapshotId ??
          null;

        const observedAt =
          oceanSnapshot
            ?.metadata
            ?.time
            ?.observedAt ??
          oceanSnapshot
            ?.observation
            ?.observedAt ??
          null;

        const observedAtTimestamp =
          typeof observedAt ===
            "string"
            ? Date.parse(
                observedAt
              )
            : Number.NaN;

        const validObservedAt =
          Number.isFinite(
            observedAtTimestamp
          );

        const contractVersion =
          waterMassAnalysis
            ?.contractVersion ??
          null;

        const analysisAvailable =
          waterMassAnalysis
            ?.available ===
          true;

        const classification =
          typeof waterMassAnalysis
            ?.classification ===
            "string"
            ? waterMassAnalysis
                .classification
            : null;

        const readinessState =
          typeof waterMassAnalysis
            ?.readinessState ===
            "string"
            ? waterMassAnalysis
                .readinessState
            : null;

        const readinessScore =
          Object.hasOwn(
            readinessRank,
            readinessState
          )
            ? readinessRank[
                readinessState
              ]
            : null;

        const waterMassDistinctionReady =
          waterMassAnalysis
            ?.waterMassDistinctionReady ===
          true;

        const distinctAdjacentWaterMassesEstablished =
          waterMassAnalysis
            ?.distinctAdjacentWaterMassesEstablished ===
          true;

        const independentSpatialCharacterVariableCount =
          Number.isFinite(
            waterMassAnalysis
              ?.evidence
              ?.independentSpatialCharacterVariableCount
          )
            ? waterMassAnalysis
                .evidence
                .independentSpatialCharacterVariableCount
            : null;

        const spatialThermalContrast =
          waterMassAnalysis
            ?.evidence
            ?.spatialThermalContrast ===
          true;

        const meaningfulSpatialThermalContrast =
          waterMassAnalysis
            ?.evidence
            ?.meaningfulSpatialThermalContrast ===
          true;

        const currentEdgeDetected =
          waterMassAnalysis
            ?.evidence
            ?.currentEdgeDetected ===
          true;

        const currentEdgeStrength =
          typeof waterMassAnalysis
            ?.evidence
            ?.currentEdgeStrength ===
            "string"
            ? waterMassAnalysis
                .evidence
                .currentEdgeStrength
            : null;

        const missingRequirements =
          Array.isArray(
            waterMassAnalysis
              ?.missingRequirements
          )
            ? [
                ...waterMassAnalysis
                  .missingRequirements
              ]
            : [];

        return {
          snapshotId,

          observedAt:
            validObservedAt
              ? observedAt
              : null,

          observedAtTimestamp:
            validObservedAt
              ? observedAtTimestamp
              : null,

          contractVersion,

          analysisAvailable,

          classification,

          readinessState,

          readinessScore,

          waterMassDistinctionReady,

          distinctAdjacentWaterMassesEstablished,

          independentSpatialCharacterVariableCount,

          spatialThermalContrast,

          meaningfulSpatialThermalContrast,

          currentEdgeDetected,

          currentEdgeStrength,

          missingRequirements,

          valid:
            snapshotAvailable &&
            typeof snapshotId ===
              "string" &&
            snapshotId.trim().length >
              0 &&
            validObservedAt &&
            contractVersion ===
              "pelora-water-mass-analysis-v1" &&
            analysisAvailable &&
            readinessScore !==
              null
        };
      })
      .filter(
        observation =>
          observation.valid
      )
      .sort(
        (
          firstObservation,
          secondObservation
        ) =>
          firstObservation
            .observedAtTimestamp -
          secondObservation
            .observedAtTimestamp
      );

  const uniqueObservations = [];
  const seenSnapshotIds =
    new Set();

  for (
    const observation of
      normalizedObservations
  ) {
    if (
      seenSnapshotIds.has(
        observation.snapshotId
      )
    ) {
      continue;
    }

    seenSnapshotIds.add(
      observation.snapshotId
    );

    uniqueObservations.push(
      observation
    );
  }

  const sampleCount =
    uniqueObservations.length;

  const firstObservation =
    sampleCount > 0
      ? uniqueObservations[0]
      : null;

  const lastObservation =
    sampleCount > 0
      ? uniqueObservations[
          sampleCount - 1
        ]
      : null;

  const firstObservedAt =
    firstObservation
      ?.observedAt ??
    null;

  const lastObservedAt =
    lastObservation
      ?.observedAt ??
    null;

  const durationHours =
    firstObservation &&
    lastObservation
      ? (
          lastObservation
            .observedAtTimestamp -
          firstObservation
            .observedAtTimestamp
        ) /
        (
          1000 *
          60 *
          60
        )
      : null;

  if (
    sampleCount ===
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "water-mass",

      featureFamily:
        "integrated-ocean-physics",

      classification:
        "unavailable",

      lifecycleState:
        null,

      reason:
        "historical-water-mass-contracts-unavailable",

      values: {
        sampleCount:
          0,

        firstObservedAt:
          null,

        lastObservedAt:
          null,

        durationHours:
          null,

        firstReadinessState:
          null,

        lastReadinessState:
          null,

        readinessChange:
          null,

        firstIndependentSpatialCharacterVariableCount:
          null,

        lastIndependentSpatialCharacterVariableCount:
          null,

        spatialCharacterVariableCountChange:
          null,

        firstWaterMassDistinctionReady:
          null,

        lastWaterMassDistinctionReady:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      limitations: [
        "historical-water-mass-contracts-unavailable",
        "water-mass-persistence-not-assessed",
        "water-mass-identity-not-established",
        "feature-absence-not-established"
      ]
    });
  }

  if (
    sampleCount <
      2 ||
    !Number.isFinite(
      durationHours
    ) ||
    durationHours <=
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "water-mass",

      featureFamily:
        "integrated-ocean-physics",

      classification:
        "insufficient-history",

      lifecycleState:
        null,

      reason:
        "minimum-two-chronological-water-mass-contracts-required",

      values: {
        sampleCount,

        firstObservedAt,

        lastObservedAt,

        durationHours,

        firstReadinessState:
          firstObservation
            ?.readinessState ??
          null,

        lastReadinessState:
          lastObservation
            ?.readinessState ??
          null,

        readinessChange:
          null,

        firstIndependentSpatialCharacterVariableCount:
          firstObservation
            ?.independentSpatialCharacterVariableCount ??
          null,

        lastIndependentSpatialCharacterVariableCount:
          lastObservation
            ?.independentSpatialCharacterVariableCount ??
          null,

        spatialCharacterVariableCountChange:
          null,

        firstWaterMassDistinctionReady:
          firstObservation
            ?.waterMassDistinctionReady ??
          null,

        lastWaterMassDistinctionReady:
          lastObservation
            ?.waterMassDistinctionReady ??
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      drivers: [
        "governed-historical-water-mass-contract-available"
      ],

      limitations: [
        "minimum-two-chronological-water-mass-contracts-required",
        "water-mass-persistence-not-assessed",
        "water-mass-identity-not-established"
      ]
    });
  }

  const readinessChange =
    lastObservation
      .readinessScore -
    firstObservation
      .readinessScore;

  const spatialCharacterVariableCountChange =
    firstObservation
      .independentSpatialCharacterVariableCount !==
      null &&
    lastObservation
      .independentSpatialCharacterVariableCount !==
      null
      ? lastObservation
          .independentSpatialCharacterVariableCount -
        firstObservation
          .independentSpatialCharacterVariableCount
      : null;

  let classification =
    "stable-water-mass-distinction-context";

  let lifecycleState =
    "stable";

  let reason =
    "governed-water-mass-readiness-remained-stable";

  if (
    !firstObservation
      .waterMassDistinctionReady &&
    lastObservation
      .waterMassDistinctionReady
  ) {
    classification =
      "emerging-water-mass-distinction-readiness";

    lifecycleState =
      "emerging";

    reason =
      "governed-water-mass-distinction-readiness-developed";
  } else if (
    firstObservation
      .waterMassDistinctionReady &&
    !lastObservation
      .waterMassDistinctionReady
  ) {
    classification =
      "fading-water-mass-distinction-readiness";

    lifecycleState =
      "fading";

    reason =
      "governed-water-mass-distinction-readiness-no-longer-supported";
  } else if (
    readinessChange >
      0
  ) {
    classification =
      "strengthening-water-mass-distinction-context";

    lifecycleState =
      "strengthening";

    reason =
      "governed-water-mass-readiness-increased";
  } else if (
    readinessChange <
      0
  ) {
    classification =
      "weakening-water-mass-distinction-context";

    lifecycleState =
      "weakening";

    reason =
      "governed-water-mass-readiness-decreased";
  }

  const confidenceScore =
    Math.min(
      80,
      40 +
      (
        sampleCount *
        10
      )
    );

  const confidenceLevel =
    confidenceScore >=
      70
      ? "High"
      : confidenceScore >=
          50
        ? "Moderate"
        : "Low";

  return buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "water-mass",

    featureFamily:
      "integrated-ocean-physics",

    classification,

    lifecycleState,

    reason,

    values: {
      sampleCount,

      firstObservedAt,

      lastObservedAt,

      durationHours,

      firstClassification:
        firstObservation
          .classification,

      lastClassification:
        lastObservation
          .classification,

      firstReadinessState:
        firstObservation
          .readinessState,

      lastReadinessState:
        lastObservation
          .readinessState,

      readinessChange,

      firstWaterMassDistinctionReady:
        firstObservation
          .waterMassDistinctionReady,

      lastWaterMassDistinctionReady:
        lastObservation
          .waterMassDistinctionReady,

      firstDistinctAdjacentWaterMassesEstablished:
        firstObservation
          .distinctAdjacentWaterMassesEstablished,

      lastDistinctAdjacentWaterMassesEstablished:
        lastObservation
          .distinctAdjacentWaterMassesEstablished,

      firstIndependentSpatialCharacterVariableCount:
        firstObservation
          .independentSpatialCharacterVariableCount,

      lastIndependentSpatialCharacterVariableCount:
        lastObservation
          .independentSpatialCharacterVariableCount,

      spatialCharacterVariableCountChange,

      firstSpatialThermalContrast:
        firstObservation
          .spatialThermalContrast,

      lastSpatialThermalContrast:
        lastObservation
          .spatialThermalContrast,

      firstMeaningfulSpatialThermalContrast:
        firstObservation
          .meaningfulSpatialThermalContrast,

      lastMeaningfulSpatialThermalContrast:
        lastObservation
          .meaningfulSpatialThermalContrast,

      firstCurrentEdgeDetected:
        firstObservation
          .currentEdgeDetected,

      lastCurrentEdgeDetected:
        lastObservation
          .currentEdgeDetected,

      firstCurrentEdgeStrength:
        firstObservation
          .currentEdgeStrength,

      lastCurrentEdgeStrength:
        lastObservation
          .currentEdgeStrength,

      firstMissingRequirements:
        firstObservation
          .missingRequirements,

      lastMissingRequirements:
        lastObservation
          .missingRequirements,

      sourceContractVersion:
        "pelora-water-mass-analysis-v1"
    },

    confidence: {
      score:
        confidenceScore,

      level:
        confidenceLevel
    },

    drivers: [
      "multiple-governed-historical-water-mass-contracts-available",
      "chronological-water-mass-observation-window-established",
      `water-mass-lifecycle-${lifecycleState}`
    ],

    limitations: [
      "water-mass-persistence-does-not-establish-a-named-water-mass",
      "water-mass-identity-across-space-is-not-confirmed",
      "distinct-adjacent-water-masses-remain-governed-by-upstream-contracts",
      "water-mass-origin-not-assessed",
      "vertical-water-column-structure-not-assessed",
      "water-mass-persistence-does-not-establish-habitat-quality-or-fishing-opportunity"
    ]
  });
}


/**
 * ------------------------------------------------------------
 * Mixing Zone Persistence Analysis v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Compare governed Mixing Zone Analysis contracts across
 * chronological Ocean Memory snapshots.
 *
 * This version evaluates persistence of mixing-zone interaction
 * context and readiness. It does not establish a verified mixing
 * zone, distinct adjacent water masses, vertical mixing, ocean
 * front, habitat, prey concentration, fish presence, or fishing
 * quality.
 */
export function buildMixingZonePersistence({
  historicalSnapshots = []
} = {}) {
  const snapshotsInput =
    Array.isArray(
      historicalSnapshots
    )
      ? historicalSnapshots
      : [];

  const readinessRank = {
    "insufficient-evidence": 0,
    "not-ready": 1,
    "partially-ready": 2,
    ready: 3
  };

  const interactionStrengthRank = {
    unavailable: 0,
    "not-established": 0,
    "thermal-boundary-only": 1,
    "hydrodynamic-boundary-only": 1,
    "thermal-and-current-edge": 2,
    "thermal-and-multiple-current-signals": 3
  };

  const normalizedObservations =
    snapshotsInput
      .map(record => {
        const oceanSnapshot =
          record
            ?.storageRecord
            ?.snapshot ??
          record
            ?.snapshot ??
          record
            ?.oceanSnapshot ??
          null;

        const mixingZoneAnalysis =
          oceanSnapshot
            ?.observation
            ?.oceanPhysics
            ?.mixingZoneAnalysis ??
          null;

        const snapshotAvailable =
          oceanSnapshot
            ?.available ===
          true;

        const snapshotId =
          oceanSnapshot
            ?.identity
            ?.snapshotId ??
          null;

        const observedAt =
          oceanSnapshot
            ?.metadata
            ?.time
            ?.observedAt ??
          oceanSnapshot
            ?.observation
            ?.observedAt ??
          null;

        const observedAtTimestamp =
          typeof observedAt ===
            "string"
            ? Date.parse(
                observedAt
              )
            : Number.NaN;

        const validObservedAt =
          Number.isFinite(
            observedAtTimestamp
          );

        const contractVersion =
          mixingZoneAnalysis
            ?.contractVersion ??
          null;

        const analysisAvailable =
          mixingZoneAnalysis
            ?.available ===
          true;

        const classification =
          typeof mixingZoneAnalysis
            ?.classification ===
            "string"
            ? mixingZoneAnalysis
                .classification
            : null;

        const readinessState =
          typeof mixingZoneAnalysis
            ?.readinessState ===
            "string"
            ? mixingZoneAnalysis
                .readinessState
            : null;

        const readinessScore =
          Object.hasOwn(
            readinessRank,
            readinessState
          )
            ? readinessRank[
                readinessState
              ]
            : null;

        const interactionContext =
          typeof mixingZoneAnalysis
            ?.interactionContext ===
            "string"
            ? mixingZoneAnalysis
                .interactionContext
            : null;

        const interactionStrength =
          Object.hasOwn(
            interactionStrengthRank,
            interactionContext
          )
            ? interactionStrengthRank[
                interactionContext
              ]
            : null;

        const mixingZoneReady =
          mixingZoneAnalysis
            ?.mixingZoneReady ===
          true;

        const mixingZoneDetected =
          mixingZoneAnalysis
            ?.mixingZoneDetected ===
          true;

        const distinctAdjacentWaterMassesEstablished =
          mixingZoneAnalysis
            ?.evidence
            ?.distinctAdjacentWaterMassesEstablished ===
          true;

        const waterMassDistinctionReady =
          mixingZoneAnalysis
            ?.evidence
            ?.waterMassDistinctionReady ===
          true;

        const spatialThermalContrast =
          mixingZoneAnalysis
            ?.evidence
            ?.spatialThermalContrast ===
          true;

        const meaningfulSpatialThermalContrast =
          mixingZoneAnalysis
            ?.evidence
            ?.meaningfulSpatialThermalContrast ===
          true;

        const hydrodynamicInteractionSignalCount =
          Number.isFinite(
            mixingZoneAnalysis
              ?.evidence
              ?.hydrodynamicInteractionSignalCount
          )
            ? mixingZoneAnalysis
                .evidence
                .hydrodynamicInteractionSignalCount
            : null;

        const hydrodynamicInteractionSupported =
          mixingZoneAnalysis
            ?.evidence
            ?.hydrodynamicInteractionSupported ===
          true;

        const combinedBoundaryContext =
          mixingZoneAnalysis
            ?.evidence
            ?.combinedBoundaryContext ===
          true;

        const missingRequirements =
          Array.isArray(
            mixingZoneAnalysis
              ?.missingRequirements
          )
            ? [
                ...mixingZoneAnalysis
                  .missingRequirements
              ]
            : [];

        return {
          snapshotId,

          observedAt:
            validObservedAt
              ? observedAt
              : null,

          observedAtTimestamp:
            validObservedAt
              ? observedAtTimestamp
              : null,

          contractVersion,

          analysisAvailable,

          classification,

          readinessState,

          readinessScore,

          interactionContext,

          interactionStrength,

          mixingZoneReady,

          mixingZoneDetected,

          distinctAdjacentWaterMassesEstablished,

          waterMassDistinctionReady,

          spatialThermalContrast,

          meaningfulSpatialThermalContrast,

          hydrodynamicInteractionSignalCount,

          hydrodynamicInteractionSupported,

          combinedBoundaryContext,

          missingRequirements,

          valid:
            snapshotAvailable &&
            typeof snapshotId ===
              "string" &&
            snapshotId.trim().length >
              0 &&
            validObservedAt &&
            contractVersion ===
              "pelora-mixing-zone-analysis-v1" &&
            analysisAvailable &&
            readinessScore !==
              null &&
            interactionStrength !==
              null
        };
      })
      .filter(
        observation =>
          observation.valid
      )
      .sort(
        (
          firstObservation,
          secondObservation
        ) =>
          firstObservation
            .observedAtTimestamp -
          secondObservation
            .observedAtTimestamp
      );

  const uniqueObservations = [];

  const seenSnapshotIds =
    new Set();

  for (
    const observation of
      normalizedObservations
  ) {
    if (
      seenSnapshotIds.has(
        observation.snapshotId
      )
    ) {
      continue;
    }

    seenSnapshotIds.add(
      observation.snapshotId
    );

    uniqueObservations.push(
      observation
    );
  }

  const sampleCount =
    uniqueObservations.length;

  const firstObservation =
    sampleCount > 0
      ? uniqueObservations[0]
      : null;

  const lastObservation =
    sampleCount > 0
      ? uniqueObservations[
          sampleCount - 1
        ]
      : null;

  const firstObservedAt =
    firstObservation
      ?.observedAt ??
    null;

  const lastObservedAt =
    lastObservation
      ?.observedAt ??
    null;

  const durationHours =
    firstObservation &&
    lastObservation
      ? (
          lastObservation
            .observedAtTimestamp -
          firstObservation
            .observedAtTimestamp
        ) /
        (
          1000 *
          60 *
          60
        )
      : null;

  if (
    sampleCount ===
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "mixing-zone",

      featureFamily:
        "integrated-ocean-physics",

      classification:
        "unavailable",

      lifecycleState:
        null,

      reason:
        "historical-mixing-zone-contracts-unavailable",

      values: {
        sampleCount:
          0,

        firstObservedAt:
          null,

        lastObservedAt:
          null,

        durationHours:
          null,

        firstReadinessState:
          null,

        lastReadinessState:
          null,

        readinessChange:
          null,

        firstInteractionContext:
          null,

        lastInteractionContext:
          null,

        interactionStrengthChange:
          null,

        firstHydrodynamicInteractionSignalCount:
          null,

        lastHydrodynamicInteractionSignalCount:
          null,

        hydrodynamicSignalCountChange:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      limitations: [
        "historical-mixing-zone-contracts-unavailable",
        "mixing-zone-persistence-not-assessed",
        "mixing-zone-identity-not-established",
        "feature-absence-not-established"
      ]
    });
  }

  if (
    sampleCount <
      2 ||
    !Number.isFinite(
      durationHours
    ) ||
    durationHours <=
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "mixing-zone",

      featureFamily:
        "integrated-ocean-physics",

      classification:
        "insufficient-history",

      lifecycleState:
        null,

      reason:
        "minimum-two-chronological-mixing-zone-contracts-required",

      values: {
        sampleCount,

        firstObservedAt,

        lastObservedAt,

        durationHours,

        firstReadinessState:
          firstObservation
            ?.readinessState ??
          null,

        lastReadinessState:
          lastObservation
            ?.readinessState ??
          null,

        readinessChange:
          null,

        firstInteractionContext:
          firstObservation
            ?.interactionContext ??
          null,

        lastInteractionContext:
          lastObservation
            ?.interactionContext ??
          null,

        interactionStrengthChange:
          null,

        firstHydrodynamicInteractionSignalCount:
          firstObservation
            ?.hydrodynamicInteractionSignalCount ??
          null,

        lastHydrodynamicInteractionSignalCount:
          lastObservation
            ?.hydrodynamicInteractionSignalCount ??
          null,

        hydrodynamicSignalCountChange:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      drivers: [
        "governed-historical-mixing-zone-contract-available"
      ],

      limitations: [
        "minimum-two-chronological-mixing-zone-contracts-required",
        "mixing-zone-persistence-not-assessed",
        "mixing-zone-identity-not-established"
      ]
    });
  }

  const readinessChange =
    lastObservation
      .readinessScore -
    firstObservation
      .readinessScore;

  const interactionStrengthChange =
    lastObservation
      .interactionStrength -
    firstObservation
      .interactionStrength;

  const hydrodynamicSignalCountChange =
    firstObservation
      .hydrodynamicInteractionSignalCount !==
      null &&
    lastObservation
      .hydrodynamicInteractionSignalCount !==
      null
      ? lastObservation
          .hydrodynamicInteractionSignalCount -
        firstObservation
          .hydrodynamicInteractionSignalCount
      : null;

  let classification =
    "stable-mixing-zone-interaction-context";

  let lifecycleState =
    "stable";

  let reason =
    "governed-mixing-zone-interaction-context-remained-stable";

  if (
    !firstObservation
      .hydrodynamicInteractionSupported &&
    lastObservation
      .hydrodynamicInteractionSupported
  ) {
    classification =
      "emerging-mixing-zone-interaction-context";

    lifecycleState =
      "emerging";

    reason =
      "governed-mixing-zone-interaction-context-developed";
  } else if (
    firstObservation
      .hydrodynamicInteractionSupported &&
    !lastObservation
      .hydrodynamicInteractionSupported
  ) {
    classification =
      "fading-mixing-zone-interaction-context";

    lifecycleState =
      "fading";

    reason =
      "governed-mixing-zone-interaction-context-no-longer-supported";
  } else if (
    readinessChange >
      0 ||
    interactionStrengthChange >
      0
  ) {
    classification =
      "strengthening-mixing-zone-interaction-context";

    lifecycleState =
      "strengthening";

    reason =
      "governed-mixing-zone-interaction-evidence-increased";
  } else if (
    readinessChange <
      0 ||
    interactionStrengthChange <
      0
  ) {
    classification =
      "weakening-mixing-zone-interaction-context";

    lifecycleState =
      "weakening";

    reason =
      "governed-mixing-zone-interaction-evidence-decreased";
  }

  const confidenceScore =
    Math.min(
      80,
      40 +
      (
        sampleCount *
        10
      )
    );

  const confidenceLevel =
    confidenceScore >=
      70
      ? "High"
      : confidenceScore >=
          50
        ? "Moderate"
        : "Low";

  return buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "mixing-zone",

    featureFamily:
      "integrated-ocean-physics",

    classification,

    lifecycleState,

    reason,

    values: {
      sampleCount,

      firstObservedAt,

      lastObservedAt,

      durationHours,

      firstClassification:
        firstObservation
          .classification,

      lastClassification:
        lastObservation
          .classification,

      firstReadinessState:
        firstObservation
          .readinessState,

      lastReadinessState:
        lastObservation
          .readinessState,

      readinessChange,

      firstInteractionContext:
        firstObservation
          .interactionContext,

      lastInteractionContext:
        lastObservation
          .interactionContext,

      interactionStrengthChange,

      firstMixingZoneReady:
        firstObservation
          .mixingZoneReady,

      lastMixingZoneReady:
        lastObservation
          .mixingZoneReady,

      firstMixingZoneDetected:
        firstObservation
          .mixingZoneDetected,

      lastMixingZoneDetected:
        lastObservation
          .mixingZoneDetected,

      firstDistinctAdjacentWaterMassesEstablished:
        firstObservation
          .distinctAdjacentWaterMassesEstablished,

      lastDistinctAdjacentWaterMassesEstablished:
        lastObservation
          .distinctAdjacentWaterMassesEstablished,

      firstWaterMassDistinctionReady:
        firstObservation
          .waterMassDistinctionReady,

      lastWaterMassDistinctionReady:
        lastObservation
          .waterMassDistinctionReady,

      firstSpatialThermalContrast:
        firstObservation
          .spatialThermalContrast,

      lastSpatialThermalContrast:
        lastObservation
          .spatialThermalContrast,

      firstMeaningfulSpatialThermalContrast:
        firstObservation
          .meaningfulSpatialThermalContrast,

      lastMeaningfulSpatialThermalContrast:
        lastObservation
          .meaningfulSpatialThermalContrast,

      firstHydrodynamicInteractionSignalCount:
        firstObservation
          .hydrodynamicInteractionSignalCount,

      lastHydrodynamicInteractionSignalCount:
        lastObservation
          .hydrodynamicInteractionSignalCount,

      hydrodynamicSignalCountChange,

      firstHydrodynamicInteractionSupported:
        firstObservation
          .hydrodynamicInteractionSupported,

      lastHydrodynamicInteractionSupported:
        lastObservation
          .hydrodynamicInteractionSupported,

      firstCombinedBoundaryContext:
        firstObservation
          .combinedBoundaryContext,

      lastCombinedBoundaryContext:
        lastObservation
          .combinedBoundaryContext,

      firstMissingRequirements:
        firstObservation
          .missingRequirements,

      lastMissingRequirements:
        lastObservation
          .missingRequirements,

      sourceContractVersion:
        "pelora-mixing-zone-analysis-v1"
    },

    confidence: {
      score:
        confidenceScore,

      level:
        confidenceLevel
    },

    drivers: [
      "multiple-governed-historical-mixing-zone-contracts-available",
      "chronological-mixing-zone-observation-window-established",
      `mixing-zone-lifecycle-${lifecycleState}`
    ],

    limitations: [
      "mixing-zone-persistence-does-not-confirm-a-verified-mixing-zone",
      "mixing-zone-identity-across-space-is-not-confirmed",
      "distinct-adjacent-water-masses-remain-governed-by-upstream-contracts",
      "vertical-mixing-and-water-column-structure-not-assessed",
      "mixing-zone-movement-not-assessed",
      "mixing-zone-persistence-does-not-establish-an-ocean-front",
      "mixing-zone-persistence-does-not-establish-habitat-quality-or-fishing-opportunity"
    ]
  });
}


/**
 * ------------------------------------------------------------
 * Ocean Front Persistence Analysis v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Compare governed Ocean Front Analysis contracts across
 * chronological Ocean Memory snapshots.
 *
 * This version evaluates persistence of ocean-front candidate
 * context. It does not establish a verified ocean front,
 * water-mass identity, full water-column structure, habitat,
 * prey concentration, fish presence, or fishing quality.
 */
export function buildOceanFrontPersistence({
  historicalSnapshots = []
} = {}) {
  const snapshotsInput =
    Array.isArray(
      historicalSnapshots
    )
      ? historicalSnapshots
      : [];

  const frontStrengthRank = {
    unknown: 0,
    none: 0,
    weak: 1,
    measurable: 2,
    pronounced: 3
  };

  const normalizedObservations =
    snapshotsInput
      .map(record => {
        const oceanSnapshot =
          record
            ?.storageRecord
            ?.snapshot ??
          record
            ?.snapshot ??
          record
            ?.oceanSnapshot ??
          null;

        const oceanFrontAnalysis =
          oceanSnapshot
            ?.observation
            ?.oceanPhysics
            ?.oceanFrontAnalysis ??
          null;

        const snapshotAvailable =
          oceanSnapshot
            ?.available ===
          true;

        const snapshotId =
          oceanSnapshot
            ?.identity
            ?.snapshotId ??
          null;

        const observedAt =
          oceanSnapshot
            ?.metadata
            ?.time
            ?.observedAt ??
          oceanSnapshot
            ?.observation
            ?.observedAt ??
          null;

        const observedAtTimestamp =
          typeof observedAt ===
            "string"
            ? Date.parse(
                observedAt
              )
            : Number.NaN;

        const validObservedAt =
          Number.isFinite(
            observedAtTimestamp
          );

        const contractVersion =
          oceanFrontAnalysis
            ?.contractVersion ??
          null;

        const analysisAvailable =
          oceanFrontAnalysis
            ?.available ===
          true;

        const classification =
          typeof oceanFrontAnalysis
            ?.classification ===
            "string"
            ? oceanFrontAnalysis
                .classification
            : null;

        const frontType =
          typeof oceanFrontAnalysis
            ?.frontType ===
            "string"
            ? oceanFrontAnalysis
                .frontType
            : null;

        const frontState =
          typeof oceanFrontAnalysis
            ?.frontState ===
            "string"
            ? oceanFrontAnalysis
                .frontState
            : null;

        const frontStrength =
          typeof oceanFrontAnalysis
            ?.frontStrength ===
            "string"
            ? oceanFrontAnalysis
                .frontStrength
            : null;

        const strengthRank =
          Object.hasOwn(
            frontStrengthRank,
            frontStrength
          )
            ? frontStrengthRank[
                frontStrength
              ]
            : null;

        const frontContextSupported =
          [
            "candidate-context",
            "incomplete-support"
          ].includes(
            frontState
          ) &&
          frontType !==
            "none" &&
          frontType !==
            "unavailable";

        const oceanFrontReady =
          oceanFrontAnalysis
            ?.oceanFrontReady ===
          true;

        const oceanFrontDetected =
          oceanFrontAnalysis
            ?.oceanFrontDetected ===
          true;

        const sufficientFrontEvidence =
          oceanFrontAnalysis
            ?.evidence
            ?.sufficientFrontEvidence ===
          true;

        const corroboratingFrontContext =
          oceanFrontAnalysis
            ?.evidence
            ?.corroboratingFrontContext ===
          true;

        const hydrodynamicSignalCount =
          Number.isFinite(
            oceanFrontAnalysis
              ?.evidence
              ?.hydrodynamicSignalCount
          )
            ? oceanFrontAnalysis
                .evidence
                .hydrodynamicSignalCount
            : null;

        const mixingInteractionContext =
          oceanFrontAnalysis
            ?.evidence
            ?.mixingInteractionContext ===
          true;

        const crossBoundaryWaterCharacterAvailable =
          oceanFrontAnalysis
            ?.evidence
            ?.crossBoundaryWaterCharacterAvailable ===
          true;

        const distinctAdjacentWaterMassesEstablished =
          oceanFrontAnalysis
            ?.evidence
            ?.distinctAdjacentWaterMassesEstablished ===
          true;

        const waterMassDistinctionReady =
          oceanFrontAnalysis
            ?.evidence
            ?.waterMassDistinctionReady ===
          true;

        const mixingZoneReady =
          oceanFrontAnalysis
            ?.evidence
            ?.mixingZoneReady ===
          true;

        const missingRequirements =
          Array.isArray(
            oceanFrontAnalysis
              ?.missingRequirements
          )
            ? [
                ...oceanFrontAnalysis
                  .missingRequirements
              ]
            : [];

        return {
          snapshotId,

          observedAt:
            validObservedAt
              ? observedAt
              : null,

          observedAtTimestamp:
            validObservedAt
              ? observedAtTimestamp
              : null,

          contractVersion,

          analysisAvailable,

          classification,

          frontType,

          frontState,

          frontStrength,

          strengthRank,

          frontContextSupported,

          oceanFrontReady,

          oceanFrontDetected,

          sufficientFrontEvidence,

          corroboratingFrontContext,

          hydrodynamicSignalCount,

          mixingInteractionContext,

          crossBoundaryWaterCharacterAvailable,

          distinctAdjacentWaterMassesEstablished,

          waterMassDistinctionReady,

          mixingZoneReady,

          missingRequirements,

          valid:
            snapshotAvailable &&
            typeof snapshotId ===
              "string" &&
            snapshotId.trim().length >
              0 &&
            validObservedAt &&
            contractVersion ===
              "pelora-ocean-front-analysis-v1" &&
            analysisAvailable &&
            strengthRank !==
              null
        };
      })
      .filter(
        observation =>
          observation.valid
      )
      .sort(
        (
          firstObservation,
          secondObservation
        ) =>
          firstObservation
            .observedAtTimestamp -
          secondObservation
            .observedAtTimestamp
      );

  const uniqueObservations = [];

  const seenSnapshotIds =
    new Set();

  for (
    const observation of
      normalizedObservations
  ) {
    if (
      seenSnapshotIds.has(
        observation.snapshotId
      )
    ) {
      continue;
    }

    seenSnapshotIds.add(
      observation.snapshotId
    );

    uniqueObservations.push(
      observation
    );
  }

  const sampleCount =
    uniqueObservations.length;

  const firstObservation =
    sampleCount > 0
      ? uniqueObservations[0]
      : null;

  const lastObservation =
    sampleCount > 0
      ? uniqueObservations[
          sampleCount - 1
        ]
      : null;

  const firstObservedAt =
    firstObservation
      ?.observedAt ??
    null;

  const lastObservedAt =
    lastObservation
      ?.observedAt ??
    null;

  const durationHours =
    firstObservation &&
    lastObservation
      ? (
          lastObservation
            .observedAtTimestamp -
          firstObservation
            .observedAtTimestamp
        ) /
        (
          1000 *
          60 *
          60
        )
      : null;

  if (
    sampleCount ===
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "ocean-front",

      featureFamily:
        "integrated-ocean-physics",

      classification:
        "unavailable",

      lifecycleState:
        null,

      reason:
        "historical-ocean-front-contracts-unavailable",

      values: {
        sampleCount:
          0,

        firstObservedAt:
          null,

        lastObservedAt:
          null,

        durationHours:
          null,

        firstFrontContextSupported:
          null,

        lastFrontContextSupported:
          null,

        firstFrontStrength:
          null,

        lastFrontStrength:
          null,

        frontStrengthChange:
          null,

        firstHydrodynamicSignalCount:
          null,

        lastHydrodynamicSignalCount:
          null,

        hydrodynamicSignalCountChange:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      limitations: [
        "historical-ocean-front-contracts-unavailable",
        "ocean-front-persistence-not-assessed",
        "ocean-front-identity-not-established",
        "feature-absence-not-established"
      ]
    });
  }

  if (
    sampleCount <
      2 ||
    !Number.isFinite(
      durationHours
    ) ||
    durationHours <=
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "ocean-front",

      featureFamily:
        "integrated-ocean-physics",

      classification:
        "insufficient-history",

      lifecycleState:
        null,

      reason:
        "minimum-two-chronological-ocean-front-contracts-required",

      values: {
        sampleCount,

        firstObservedAt,

        lastObservedAt,

        durationHours,

        firstFrontContextSupported:
          firstObservation
            ?.frontContextSupported ??
          null,

        lastFrontContextSupported:
          lastObservation
            ?.frontContextSupported ??
          null,

        firstFrontStrength:
          firstObservation
            ?.frontStrength ??
          null,

        lastFrontStrength:
          lastObservation
            ?.frontStrength ??
          null,

        frontStrengthChange:
          null,

        firstHydrodynamicSignalCount:
          firstObservation
            ?.hydrodynamicSignalCount ??
          null,

        lastHydrodynamicSignalCount:
          lastObservation
            ?.hydrodynamicSignalCount ??
          null,

        hydrodynamicSignalCountChange:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      drivers: [
        "governed-historical-ocean-front-contract-available"
      ],

      limitations: [
        "minimum-two-chronological-ocean-front-contracts-required",
        "ocean-front-persistence-not-assessed",
        "ocean-front-identity-not-established"
      ]
    });
  }

  const firstFrontContextSupported =
    firstObservation
      .frontContextSupported;

  const lastFrontContextSupported =
    lastObservation
      .frontContextSupported;

  const frontStrengthChange =
    lastObservation
      .strengthRank -
    firstObservation
      .strengthRank;

  const hydrodynamicSignalCountChange =
    firstObservation
      .hydrodynamicSignalCount !==
      null &&
    lastObservation
      .hydrodynamicSignalCount !==
      null
      ? lastObservation
          .hydrodynamicSignalCount -
        firstObservation
          .hydrodynamicSignalCount
      : null;

  let classification =
    "stable-ocean-front-context";

  let lifecycleState =
    "stable";

  let reason =
    "governed-ocean-front-context-remained-stable";

  if (
    !firstFrontContextSupported &&
    lastFrontContextSupported
  ) {
    classification =
      "emerging-ocean-front-context";

    lifecycleState =
      "emerging";

    reason =
      "governed-ocean-front-context-developed";
  } else if (
    firstFrontContextSupported &&
    !lastFrontContextSupported
  ) {
    classification =
      "fading-ocean-front-context";

    lifecycleState =
      "fading";

    reason =
      "governed-ocean-front-context-no-longer-supported";
  } else if (
    frontStrengthChange >
      0
  ) {
    classification =
      "strengthening-ocean-front-context";

    lifecycleState =
      "strengthening";

    reason =
      "governed-ocean-front-strength-increased";
  } else if (
    frontStrengthChange <
      0
  ) {
    classification =
      "weakening-ocean-front-context";

    lifecycleState =
      "weakening";

    reason =
      "governed-ocean-front-strength-decreased";
  }

  const confidenceScore =
    Math.min(
      80,
      40 +
      (
        sampleCount *
        10
      )
    );

  const confidenceLevel =
    confidenceScore >=
      70
      ? "High"
      : confidenceScore >=
          50
        ? "Moderate"
        : "Low";

  return buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "ocean-front",

    featureFamily:
      "integrated-ocean-physics",

    classification,

    lifecycleState,

    reason,

    values: {
      sampleCount,

      firstObservedAt,

      lastObservedAt,

      durationHours,

      firstFrontContextSupported,

      lastFrontContextSupported,

      firstClassification:
        firstObservation
          .classification,

      lastClassification:
        lastObservation
          .classification,

      firstFrontType:
        firstObservation
          .frontType,

      lastFrontType:
        lastObservation
          .frontType,

      firstFrontState:
        firstObservation
          .frontState,

      lastFrontState:
        lastObservation
          .frontState,

      firstFrontStrength:
        firstObservation
          .frontStrength,

      lastFrontStrength:
        lastObservation
          .frontStrength,

      frontStrengthChange,

      firstOceanFrontReady:
        firstObservation
          .oceanFrontReady,

      lastOceanFrontReady:
        lastObservation
          .oceanFrontReady,

      firstOceanFrontDetected:
        firstObservation
          .oceanFrontDetected,

      lastOceanFrontDetected:
        lastObservation
          .oceanFrontDetected,

      firstSufficientFrontEvidence:
        firstObservation
          .sufficientFrontEvidence,

      lastSufficientFrontEvidence:
        lastObservation
          .sufficientFrontEvidence,

      firstCorroboratingFrontContext:
        firstObservation
          .corroboratingFrontContext,

      lastCorroboratingFrontContext:
        lastObservation
          .corroboratingFrontContext,

      firstHydrodynamicSignalCount:
        firstObservation
          .hydrodynamicSignalCount,

      lastHydrodynamicSignalCount:
        lastObservation
          .hydrodynamicSignalCount,

      hydrodynamicSignalCountChange,

      firstMixingInteractionContext:
        firstObservation
          .mixingInteractionContext,

      lastMixingInteractionContext:
        lastObservation
          .mixingInteractionContext,

      firstCrossBoundaryWaterCharacterAvailable:
        firstObservation
          .crossBoundaryWaterCharacterAvailable,

      lastCrossBoundaryWaterCharacterAvailable:
        lastObservation
          .crossBoundaryWaterCharacterAvailable,

      firstDistinctAdjacentWaterMassesEstablished:
        firstObservation
          .distinctAdjacentWaterMassesEstablished,

      lastDistinctAdjacentWaterMassesEstablished:
        lastObservation
          .distinctAdjacentWaterMassesEstablished,

      firstWaterMassDistinctionReady:
        firstObservation
          .waterMassDistinctionReady,

      lastWaterMassDistinctionReady:
        lastObservation
          .waterMassDistinctionReady,

      firstMixingZoneReady:
        firstObservation
          .mixingZoneReady,

      lastMixingZoneReady:
        lastObservation
          .mixingZoneReady,

      firstMissingRequirements:
        firstObservation
          .missingRequirements,

      lastMissingRequirements:
        lastObservation
          .missingRequirements,

      sourceContractVersion:
        "pelora-ocean-front-analysis-v1"
    },

    confidence: {
      score:
        confidenceScore,

      level:
        confidenceLevel
    },

    drivers: [
      "multiple-governed-historical-ocean-front-contracts-available",
      "chronological-ocean-front-observation-window-established",
      `ocean-front-lifecycle-${lifecycleState}`
    ],

    limitations: [
      "ocean-front-persistence-does-not-confirm-a-verified-ocean-front",
      "ocean-front-identity-across-space-is-not-confirmed",
      "cross-boundary-water-mass-identity-remains-governed-by-upstream-contracts",
      "full-water-column-structure-not-assessed",
      "ocean-front-movement-not-assessed",
      "ocean-front-persistence-does-not-establish-habitat-quality-or-fishing-opportunity"
    ]
  });
}


/**
 * ------------------------------------------------------------
 * Productivity Persistence Analysis v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Compare governed Surface Productivity Evidence contracts
 * across chronological Ocean Memory snapshots.
 *
 * This version evaluates persistence of observed surface
 * productivity context derived from satellite chlorophyll.
 * It does not establish full water-column productivity, bait,
 * prey concentration, feeding activity, habitat quality,
 * species presence, or fishing opportunity.
 */
export function buildProductivityPersistence({
  historicalSnapshots = []
} = {}) {
  const snapshotsInput =
    Array.isArray(
      historicalSnapshots
    )
      ? historicalSnapshots
      : [];

  const productivityRank = {
    "very-clear-low-productivity": 0,
    "clear-blue-water": 1,
    "productive-blue-green-transition": 2,
    "productive-green-water": 3,
    "high-chlorophyll-coastal-or-bloom-influenced": 4
  };

  const freshnessRank = {
    unknown: 0,
    stale: 1,
    aging: 2,
    recent: 3
  };

  const normalizedObservations =
    snapshotsInput
      .map(record => {
        const oceanSnapshot =
          record
            ?.storageRecord
            ?.snapshot ??
          record
            ?.snapshot ??
          record
            ?.oceanSnapshot ??
          null;

        const productivityEvidence =
          oceanSnapshot
            ?.observation
            ?.evidence
            ?.groups
            ?.productivity ??
          null;

        const snapshotAvailable =
          oceanSnapshot
            ?.available ===
          true;

        const snapshotId =
          oceanSnapshot
            ?.identity
            ?.snapshotId ??
          null;

        const snapshotObservedAt =
          oceanSnapshot
            ?.metadata
            ?.time
            ?.observedAt ??
          oceanSnapshot
            ?.observation
            ?.observedAt ??
          null;

        const evidenceObservedAt =
          productivityEvidence
            ?.values
            ?.observedAt ??
          null;

        const observedAt =
          typeof evidenceObservedAt ===
            "string"
            ? evidenceObservedAt
            : snapshotObservedAt;

        const observedAtTimestamp =
          typeof observedAt ===
            "string"
            ? Date.parse(
                observedAt
              )
            : Number.NaN;

        const validObservedAt =
          Number.isFinite(
            observedAtTimestamp
          );

        const interpretation =
          productivityEvidence
            ?.interpretation ??
          null;

        const evidenceAvailable =
          productivityEvidence
            ?.available ===
          true;

        const classification =
          typeof productivityEvidence
            ?.classification ===
            "string"
            ? productivityEvidence
                .classification
            : null;

        const productivityClassification =
          typeof productivityEvidence
            ?.values
            ?.productivityClassification ===
            "string"
            ? productivityEvidence
                .values
                .productivityClassification
            : classification;

        const classificationRank =
          Object.hasOwn(
            productivityRank,
            productivityClassification
          )
            ? productivityRank[
                productivityClassification
              ]
            : null;

        const concentrationMgM3 =
          Number.isFinite(
            productivityEvidence
              ?.values
              ?.concentrationMgM3
          )
            ? productivityEvidence
                .values
                .concentrationMgM3
            : null;

        const ageHours =
          Number.isFinite(
            productivityEvidence
              ?.values
              ?.ageHours
          )
            ? productivityEvidence
                .values
                .ageHours
            : null;

        const freshness =
          typeof productivityEvidence
            ?.values
            ?.freshness ===
            "string"
            ? productivityEvidence
                .values
                .freshness
            : "unknown";

        const freshnessScore =
          Object.hasOwn(
            freshnessRank,
            freshness
          )
            ? freshnessRank[
                freshness
              ]
            : null;

        return {
          snapshotId,

          observedAt:
            validObservedAt
              ? observedAt
              : null,

          observedAtTimestamp:
            validObservedAt
              ? observedAtTimestamp
              : null,

          interpretation,

          evidenceAvailable,

          classification,

          productivityClassification,

          classificationRank,

          concentrationMgM3,

          ageHours,

          freshness,

          freshnessScore,

          valid:
            snapshotAvailable &&
            typeof snapshotId ===
              "string" &&
            snapshotId.trim().length >
              0 &&
            validObservedAt &&
            interpretation ===
              "species-neutral-surface-productivity-evidence" &&
            evidenceAvailable &&
            classificationRank !==
              null &&
            concentrationMgM3 !==
              null &&
            freshnessScore !==
              null
        };
      })
      .filter(
        observation =>
          observation.valid
      )
      .sort(
        (
          firstObservation,
          secondObservation
        ) =>
          firstObservation
            .observedAtTimestamp -
          secondObservation
            .observedAtTimestamp
      );

  const uniqueObservations = [];

  const seenSnapshotIds =
    new Set();

  for (
    const observation of
      normalizedObservations
  ) {
    if (
      seenSnapshotIds.has(
        observation.snapshotId
      )
    ) {
      continue;
    }

    seenSnapshotIds.add(
      observation.snapshotId
    );

    uniqueObservations.push(
      observation
    );
  }

  const sampleCount =
    uniqueObservations.length;

  const firstObservation =
    sampleCount > 0
      ? uniqueObservations[0]
      : null;

  const lastObservation =
    sampleCount > 0
      ? uniqueObservations[
          sampleCount - 1
        ]
      : null;

  const firstObservedAt =
    firstObservation
      ?.observedAt ??
    null;

  const lastObservedAt =
    lastObservation
      ?.observedAt ??
    null;

  const durationHours =
    firstObservation &&
    lastObservation
      ? (
          lastObservation
            .observedAtTimestamp -
          firstObservation
            .observedAtTimestamp
        ) /
        (
          1000 *
          60 *
          60
        )
      : null;

  if (
    sampleCount ===
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "surface-productivity",

      featureFamily:
        "biological-ocean",

      classification:
        "unavailable",

      lifecycleState:
        null,

      reason:
        "historical-productivity-evidence-unavailable",

      values: {
        sampleCount:
          0,

        firstObservedAt:
          null,

        lastObservedAt:
          null,

        durationHours:
          null,

        firstClassification:
          null,

        lastClassification:
          null,

        classificationChange:
          null,

        firstConcentrationMgM3:
          null,

        lastConcentrationMgM3:
          null,

        concentrationChangeMgM3:
          null,

        firstFreshness:
          null,

        lastFreshness:
          null,

        freshnessChange:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      limitations: [
        "historical-productivity-evidence-unavailable",
        "surface-productivity-persistence-not-assessed",
        "surface-productivity-absence-not-established",
        "feature-absence-not-established"
      ]
    });
  }

  if (
    sampleCount <
      2 ||
    !Number.isFinite(
      durationHours
    ) ||
    durationHours <=
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "surface-productivity",

      featureFamily:
        "biological-ocean",

      classification:
        "insufficient-history",

      lifecycleState:
        null,

      reason:
        "minimum-two-chronological-productivity-contracts-required",

      values: {
        sampleCount,

        firstObservedAt,

        lastObservedAt,

        durationHours,

        firstClassification:
          firstObservation
            ?.productivityClassification ??
          null,

        lastClassification:
          lastObservation
            ?.productivityClassification ??
          null,

        classificationChange:
          null,

        firstConcentrationMgM3:
          firstObservation
            ?.concentrationMgM3 ??
          null,

        lastConcentrationMgM3:
          lastObservation
            ?.concentrationMgM3 ??
          null,

        concentrationChangeMgM3:
          null,

        firstFreshness:
          firstObservation
            ?.freshness ??
          null,

        lastFreshness:
          lastObservation
            ?.freshness ??
          null,

        freshnessChange:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      drivers: [
        "governed-historical-productivity-evidence-available"
      ],

      limitations: [
        "minimum-two-chronological-productivity-contracts-required",
        "surface-productivity-persistence-not-assessed",
        "surface-productivity-absence-not-established"
      ]
    });
  }

  const classificationChange =
    lastObservation
      .classificationRank -
    firstObservation
      .classificationRank;

  const concentrationChangeMgM3 =
    lastObservation
      .concentrationMgM3 -
    firstObservation
      .concentrationMgM3;

  const freshnessChange =
    lastObservation
      .freshnessScore -
    firstObservation
      .freshnessScore;

  let classification =
    "stable-surface-productivity-context";

  let lifecycleState =
    "stable";

  let reason =
    "governed-surface-productivity-context-remained-stable";

  const concentrationToleranceMgM3 =
    0.02;

  if (
    concentrationChangeMgM3 >
      concentrationToleranceMgM3 ||
    classificationChange >
      0
  ) {
    classification =
      "increasing-surface-productivity-context";

    lifecycleState =
      "strengthening";

    reason =
      "governed-surface-productivity-increased";
  } else if (
    concentrationChangeMgM3 <
      -concentrationToleranceMgM3 ||
    classificationChange <
      0
  ) {
    classification =
      "decreasing-surface-productivity-context";

    lifecycleState =
      "weakening";

    reason =
      "governed-surface-productivity-decreased";
  }

  const confidenceScore =
    Math.min(
      80,
      40 +
      (
        sampleCount *
        10
      )
    );

  const confidenceLevel =
    confidenceScore >=
      70
      ? "High"
      : confidenceScore >=
          50
        ? "Moderate"
        : "Low";

  return buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "surface-productivity",

    featureFamily:
      "biological-ocean",

    classification,

    lifecycleState,

    reason,

    values: {
      sampleCount,

      firstObservedAt,

      lastObservedAt,

      durationHours,

      firstClassification:
        firstObservation
          .productivityClassification,

      lastClassification:
        lastObservation
          .productivityClassification,

      classificationChange,

      firstConcentrationMgM3:
        firstObservation
          .concentrationMgM3,

      lastConcentrationMgM3:
        lastObservation
          .concentrationMgM3,

      concentrationChangeMgM3:
        Number(
          concentrationChangeMgM3
            .toFixed(4)
        ),

      firstFreshness:
        firstObservation
          .freshness,

      lastFreshness:
        lastObservation
          .freshness,

      freshnessChange:
        freshnessChange,

      firstAgeHours:
        firstObservation
          .ageHours,

      lastAgeHours:
        lastObservation
          .ageHours,

      sourceInterpretation:
        "species-neutral-surface-productivity-evidence"
    },

    confidence: {
      score:
        confidenceScore,

      level:
        confidenceLevel
    },

    drivers: [
      "multiple-governed-historical-productivity-contracts-available",
      "chronological-productivity-observation-window-established",
      `surface-productivity-lifecycle-${lifecycleState}`
    ],

    limitations: [
      "surface-productivity-persistence-is-derived-from-satellite-chlorophyll",
      "surface-productivity-persistence-does-not-establish-full-water-column-productivity",
      "surface-productivity-persistence-does-not-confirm-bait-or-prey",
      "surface-productivity-persistence-does-not-confirm-feeding-activity",
      "surface-productivity-persistence-does-not-establish-habitat-quality-or-fishing-opportunity",
      "high-chlorophyll-values-may-reflect-coastal-bloom-or-sediment-influence"
    ]
  });
}


/**
 * ------------------------------------------------------------
 * Surface-Water Clarity Persistence Analysis v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Compare governed Surface-Water Clarity Evidence contracts
 * across chronological Ocean Memory snapshots.
 *
 * This version evaluates persistence of broad surface-water
 * clarity context inferred from satellite chlorophyll. It does
 * not directly measure visibility, subsurface clarity, turbidity,
 * water-column structure, habitat quality, fish presence, or
 * fishing opportunity.
 */
export function buildClarityPersistence({
  historicalSnapshots = []
} = {}) {
  const snapshotsInput =
    Array.isArray(
      historicalSnapshots
    )
      ? historicalSnapshots
      : [];

  const clarityRank = {
    "very-clear-surface-water": 4,
    "clear-blue-surface-water": 3,
    "transitional-surface-water": 2,
    "chlorophyll-influenced-surface-water": 1,
    "strongly-chlorophyll-influenced-surface-water": 0,
    "clarity-undetermined": 0
  };

  const freshnessRank = {
    unknown: 0,
    stale: 1,
    aging: 2,
    recent: 3
  };

  const normalizedObservations =
    snapshotsInput
      .map(record => {
        const oceanSnapshot =
          record
            ?.storageRecord
            ?.snapshot ??
          record
            ?.snapshot ??
          record
            ?.oceanSnapshot ??
          null;

        const clarityEvidence =
          oceanSnapshot
            ?.observation
            ?.evidence
            ?.groups
            ?.clarity ??
          null;

        const snapshotAvailable =
          oceanSnapshot
            ?.available ===
          true;

        const snapshotId =
          oceanSnapshot
            ?.identity
            ?.snapshotId ??
          null;

        const snapshotObservedAt =
          oceanSnapshot
            ?.metadata
            ?.time
            ?.observedAt ??
          oceanSnapshot
            ?.observation
            ?.observedAt ??
          null;

        const evidenceObservedAt =
          clarityEvidence
            ?.values
            ?.observedAt ??
          null;

        const observedAt =
          typeof evidenceObservedAt ===
            "string"
            ? evidenceObservedAt
            : snapshotObservedAt;

        const observedAtTimestamp =
          typeof observedAt ===
            "string"
            ? Date.parse(
                observedAt
              )
            : Number.NaN;

        const validObservedAt =
          Number.isFinite(
            observedAtTimestamp
          );

        const interpretation =
          clarityEvidence
            ?.interpretation ??
          null;

        const evidenceAvailable =
          clarityEvidence
            ?.available ===
          true;

        const classification =
          typeof clarityEvidence
            ?.classification ===
            "string"
            ? clarityEvidence
                .classification
            : null;

        const classificationRank =
          Object.hasOwn(
            clarityRank,
            classification
          )
            ? clarityRank[
                classification
              ]
            : null;

        const waterClassification =
          typeof clarityEvidence
            ?.values
            ?.waterClassification ===
            "string"
            ? clarityEvidence
                .values
                .waterClassification
            : null;

        const concentrationMgM3 =
          Number.isFinite(
            clarityEvidence
              ?.values
              ?.concentrationMgM3
          )
            ? clarityEvidence
                .values
                .concentrationMgM3
            : null;

        const ageHours =
          Number.isFinite(
            clarityEvidence
              ?.values
              ?.ageHours
          )
            ? clarityEvidence
                .values
                .ageHours
            : null;

        const freshness =
          typeof clarityEvidence
            ?.values
            ?.freshness ===
            "string"
            ? clarityEvidence
                .values
                .freshness
            : "unknown";

        const freshnessScore =
          Object.hasOwn(
            freshnessRank,
            freshness
          )
            ? freshnessRank[
                freshness
              ]
            : null;

        return {
          snapshotId,

          observedAt:
            validObservedAt
              ? observedAt
              : null,

          observedAtTimestamp:
            validObservedAt
              ? observedAtTimestamp
              : null,

          interpretation,

          evidenceAvailable,

          classification,

          classificationRank,

          waterClassification,

          concentrationMgM3,

          ageHours,

          freshness,

          freshnessScore,

          valid:
            snapshotAvailable &&
            typeof snapshotId ===
              "string" &&
            snapshotId.trim().length >
              0 &&
            validObservedAt &&
            interpretation ===
              "species-neutral-surface-water-clarity-evidence" &&
            evidenceAvailable &&
            classificationRank !==
              null &&
            concentrationMgM3 !==
              null &&
            freshnessScore !==
              null
        };
      })
      .filter(
        observation =>
          observation.valid
      )
      .sort(
        (
          firstObservation,
          secondObservation
        ) =>
          firstObservation
            .observedAtTimestamp -
          secondObservation
            .observedAtTimestamp
      );

  const uniqueObservations = [];

  const seenSnapshotIds =
    new Set();

  for (
    const observation of
      normalizedObservations
  ) {
    if (
      seenSnapshotIds.has(
        observation.snapshotId
      )
    ) {
      continue;
    }

    seenSnapshotIds.add(
      observation.snapshotId
    );

    uniqueObservations.push(
      observation
    );
  }

  const sampleCount =
    uniqueObservations.length;

  const firstObservation =
    sampleCount > 0
      ? uniqueObservations[0]
      : null;

  const lastObservation =
    sampleCount > 0
      ? uniqueObservations[
          sampleCount - 1
        ]
      : null;

  const firstObservedAt =
    firstObservation
      ?.observedAt ??
    null;

  const lastObservedAt =
    lastObservation
      ?.observedAt ??
    null;

  const durationHours =
    firstObservation &&
    lastObservation
      ? (
          lastObservation
            .observedAtTimestamp -
          firstObservation
            .observedAtTimestamp
        ) /
        (
          1000 *
          60 *
          60
        )
      : null;

  if (
    sampleCount ===
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "surface-water-clarity",

      featureFamily:
        "physical-ocean",

      classification:
        "unavailable",

      lifecycleState:
        null,

      reason:
        "historical-clarity-evidence-unavailable",

      values: {
        sampleCount:
          0,

        firstObservedAt:
          null,

        lastObservedAt:
          null,

        durationHours:
          null,

        firstClassification:
          null,

        lastClassification:
          null,

        clarityRankChange:
          null,

        firstConcentrationMgM3:
          null,

        lastConcentrationMgM3:
          null,

        concentrationChangeMgM3:
          null,

        firstFreshness:
          null,

        lastFreshness:
          null,

        freshnessChange:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      limitations: [
        "historical-clarity-evidence-unavailable",
        "surface-water-clarity-persistence-not-assessed",
        "surface-water-clarity-absence-not-established",
        "feature-absence-not-established"
      ]
    });
  }

  if (
    sampleCount <
      2 ||
    !Number.isFinite(
      durationHours
    ) ||
    durationHours <=
      0
  ) {
    return buildFeaturePersistenceContract({
      available:
        false,

      featureType:
        "surface-water-clarity",

      featureFamily:
        "physical-ocean",

      classification:
        "insufficient-history",

      lifecycleState:
        null,

      reason:
        "minimum-two-chronological-clarity-contracts-required",

      values: {
        sampleCount,

        firstObservedAt,

        lastObservedAt,

        durationHours,

        firstClassification:
          firstObservation
            ?.classification ??
          null,

        lastClassification:
          lastObservation
            ?.classification ??
          null,

        clarityRankChange:
          null,

        firstConcentrationMgM3:
          firstObservation
            ?.concentrationMgM3 ??
          null,

        lastConcentrationMgM3:
          lastObservation
            ?.concentrationMgM3 ??
          null,

        concentrationChangeMgM3:
          null,

        firstFreshness:
          firstObservation
            ?.freshness ??
          null,

        lastFreshness:
          lastObservation
            ?.freshness ??
          null,

        freshnessChange:
          null
      },

      confidence: {
        score:
          0,

        level:
          "Unavailable"
      },

      drivers: [
        "governed-historical-clarity-evidence-available"
      ],

      limitations: [
        "minimum-two-chronological-clarity-contracts-required",
        "surface-water-clarity-persistence-not-assessed",
        "surface-water-clarity-absence-not-established"
      ]
    });
  }

  const clarityRankChange =
    lastObservation
      .classificationRank -
    firstObservation
      .classificationRank;

  const concentrationChangeMgM3 =
    lastObservation
      .concentrationMgM3 -
    firstObservation
      .concentrationMgM3;

  const freshnessChange =
    lastObservation
      .freshnessScore -
    firstObservation
      .freshnessScore;

  let classification =
    "stable-surface-water-clarity-context";

  let lifecycleState =
    "stable";

  let reason =
    "governed-surface-water-clarity-context-remained-stable";

  if (
    clarityRankChange >
      0
  ) {
    classification =
      "increasing-surface-water-clarity-context";

    lifecycleState =
      "strengthening";

    reason =
      "governed-surface-water-clarity-increased";
  } else if (
    clarityRankChange <
      0
  ) {
    classification =
      "decreasing-surface-water-clarity-context";

    lifecycleState =
      "weakening";

    reason =
      "governed-surface-water-clarity-decreased";
  }

  const confidenceScore =
    Math.min(
      80,
      40 +
      (
        sampleCount *
        10
      )
    );

  const confidenceLevel =
    confidenceScore >=
      70
      ? "High"
      : confidenceScore >=
          50
        ? "Moderate"
        : "Low";

  return buildFeaturePersistenceContract({
    available:
      true,

    featureType:
      "surface-water-clarity",

    featureFamily:
      "physical-ocean",

    classification,

    lifecycleState,

    reason,

    values: {
      sampleCount,

      firstObservedAt,

      lastObservedAt,

      durationHours,

      firstClassification:
        firstObservation
          .classification,

      lastClassification:
        lastObservation
          .classification,

      clarityRankChange,

      firstWaterClassification:
        firstObservation
          .waterClassification,

      lastWaterClassification:
        lastObservation
          .waterClassification,

      firstConcentrationMgM3:
        firstObservation
          .concentrationMgM3,

      lastConcentrationMgM3:
        lastObservation
          .concentrationMgM3,

      concentrationChangeMgM3:
        Number(
          concentrationChangeMgM3
            .toFixed(4)
        ),

      firstFreshness:
        firstObservation
          .freshness,

      lastFreshness:
        lastObservation
          .freshness,

      freshnessChange,

      firstAgeHours:
        firstObservation
          .ageHours,

      lastAgeHours:
        lastObservation
          .ageHours,

      sourceInterpretation:
        "species-neutral-surface-water-clarity-evidence"
    },

    confidence: {
      score:
        confidenceScore,

      level:
        confidenceLevel
    },

    drivers: [
      "multiple-governed-historical-clarity-contracts-available",
      "chronological-clarity-observation-window-established",
      `surface-water-clarity-lifecycle-${lifecycleState}`
    ],

    limitations: [
      "surface-water-clarity-persistence-is-inferred-from-satellite-chlorophyll",
      "surface-water-clarity-persistence-is-not-a-direct-visibility-measurement",
      "surface-water-clarity-persistence-does-not-establish-subsurface-clarity",
      "surface-water-clarity-persistence-does-not-assess-sediment-or-dissolved-material-directly",
      "surface-water-clarity-persistence-does-not-establish-habitat-quality-or-fishing-opportunity"
    ]
  });
}


/**
 * ------------------------------------------------------------
 * Ocean Persistence Engine Contract v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Provide the canonical, extensible contract for measuring how
 * governed ocean features evolve through time.
 *
 * Persistence Evidence v2 remains the compatibility contract for
 * existing downstream consumers. This engine wraps that governed
 * result without changing its scientific meaning.
 *
 * Feature-specific analyzers will be connected incrementally.
 * An unavailable feature entry means the analyzer is not yet
 * connected; it does not mean the ocean feature is absent.
 *
 * This contract is species-neutral. It does not establish prey
 * concentration, fish presence, habitat quality, fishing quality,
 * species probability, or captain guidance.
 */
export function buildOceanPersistence({
  historicalSnapshots = [],
  timeSeries = null,
  featureMovement = {}
} = {}) {
  const governedTimeSeriesAvailable =
    timeSeries
      ?.available ===
      true &&
    Array.isArray(
      timeSeries
        ?.historicalSnapshots
    );

  const resolvedHistoricalSnapshots =
    governedTimeSeriesAvailable
      ? timeSeries
          .historicalSnapshots
      : historicalSnapshots;

  const persistenceEvidence =
    buildPersistenceEvidence({
      historicalSnapshots:
        resolvedHistoricalSnapshots
    });

  const seaSurfaceTemperature =
    buildSeaSurfaceTemperaturePersistence({
      historicalSnapshots:
        resolvedHistoricalSnapshots
    });

  const current =
    buildCurrentPersistence({
      historicalSnapshots:
        resolvedHistoricalSnapshots
    });

  const currentEdge =
    buildCurrentEdgePersistence({
      historicalSnapshots:
        resolvedHistoricalSnapshots
    });

  const currentShear =
    buildCurrentShearPersistence({
      historicalSnapshots:
        resolvedHistoricalSnapshots
    });

  const currentConvergence =
    buildCurrentConvergencePersistence({
      historicalSnapshots:
        resolvedHistoricalSnapshots
    });

  const environmentalTransition =
    buildEnvironmentalTransitionPersistence({
      historicalSnapshots:
        resolvedHistoricalSnapshots
    });

  const surfaceWaterCharacter =
    buildSurfaceWaterCharacterPersistence({
      historicalSnapshots:
        resolvedHistoricalSnapshots
    });

  const waterMass =
    buildWaterMassPersistence({
      historicalSnapshots:
        resolvedHistoricalSnapshots
    });

  const mixingZone =
    buildMixingZonePersistence({
      historicalSnapshots:
        resolvedHistoricalSnapshots
    });

  const oceanFront =
    buildOceanFrontPersistence({
      historicalSnapshots:
        resolvedHistoricalSnapshots
    });

  const productivity =
    buildProductivityPersistence({
      historicalSnapshots:
        resolvedHistoricalSnapshots
    });

  const clarity =
    buildClarityPersistence({
      historicalSnapshots:
        resolvedHistoricalSnapshots
    });

 const buildUnavailableFeature = ({
  featureType,
  featureFamily
}) =>
  buildFeaturePersistenceContract({
    available:
      false,

    featureType,

    featureFamily,

    classification:
      "not-assessed",

    lifecycleState:
      null,

    reason:
      "feature-persistence-analyzer-not-connected",

    values: {
      sampleCount:
        persistenceEvidence
          ?.values
          ?.sampleCount ??
        null,

      firstObservedAt:
        persistenceEvidence
          ?.values
          ?.firstObservedAt ??
        null,

      lastObservedAt:
        persistenceEvidence
          ?.values
          ?.lastObservedAt ??
        null,

      durationHours:
        persistenceEvidence
          ?.values
          ?.durationHours ??
        null
    },

    confidence: {
      score:
        0,

      level:
        "Unavailable"
    },

    limitations: [
      "feature-persistence-analyzer-not-connected",
      "feature-absence-not-established"
    ]
  });

  const organizationAvailable =
    persistenceEvidence
      ?.available ===
    true;

  const oceanOrganization = {
    available:
      organizationAvailable,

    featureType:
      "ocean-organization",

    featureFamily:
      "integrated-ocean-physics",

    classification:
      persistenceEvidence
        ?.classification ??
      "unavailable",

    lifecycleState:
      persistenceEvidence
        ?.values
        ?.lifecycleState ??
      null,

    reason:
      persistenceEvidence
        ?.reason ??
      "persistence-evidence-unavailable",

    values: {
      sampleCount:
        persistenceEvidence
          ?.values
          ?.organizationSampleCount ??
        persistenceEvidence
          ?.values
          ?.sampleCount ??
        null,

      firstObservedAt:
        persistenceEvidence
          ?.values
          ?.firstObservedAt ??
        null,

      lastObservedAt:
        persistenceEvidence
          ?.values
          ?.lastObservedAt ??
        null,

      durationHours:
        persistenceEvidence
          ?.values
          ?.durationHours ??
        null,

      indexStart:
        persistenceEvidence
          ?.values
          ?.organizationIndexStart ??
        null,

      indexEnd:
        persistenceEvidence
          ?.values
          ?.organizationIndexEnd ??
        null,

      indexChange:
        persistenceEvidence
          ?.values
          ?.organizationIndexChange ??
        null,

      temporalAgreement:
        persistenceEvidence
          ?.values
          ?.temporalAgreement ??
        null
    },

    confidence: {
      score:
        persistenceEvidence
          ?.confidence
          ?.score ??
        0,

      level:
        persistenceEvidence
          ?.confidence
          ?.level ??
        "Unavailable"
    },

    limitations: [
      ...(
        Array.isArray(
          persistenceEvidence
            ?.limitations
        )
          ? persistenceEvidence
              .limitations
          : []
      )
    ]
  };

  const featurePersistence = {
    oceanOrganization,

    seaSurfaceTemperature,

    temperatureFront:
      buildUnavailableFeature({
        featureType:
          "temperature-front",

        featureFamily:
          "physical-ocean"
      }),

    current,

    currentEdge,

    currentShear,

    currentConvergence,

    environmentalTransition,

    surfaceWaterCharacter,

    waterMass,

    mixingZone,

    oceanFront,

    productivity,

    clarity,

    salinity:
      buildUnavailableFeature({
        featureType:
          "salinity",

        featureFamily:
          "chemical-ocean"
      }),

    dissolvedOxygen:
      buildUnavailableFeature({
        featureType:
          "dissolved-oxygen",

        featureFamily:
          "chemical-ocean"
      })
  };

    const governedFeatureMovement =
      featureMovement &&
      typeof featureMovement ===
        "object" &&
      !Array.isArray(
        featureMovement
      )
        ? featureMovement
        : {};

    const featureContinuity =
    Object.fromEntries(
      Object.entries(
        featurePersistence
      ).map(
        ([
          featureKey,
          feature
        ]) => [
          featureKey,
          buildTemporalFeatureContinuity({
            featurePersistence:
              feature,

            featureMovement:
              governedFeatureMovement[
                featureKey
              ] ??
              null
          })
        ]
      )
    );

  const assessedContinuityCount =
    Object.values(
      featureContinuity
    ).filter(
      continuity =>
        continuity.available ===
        true
    ).length;

  const supportedContinuityCount =
    Object.values(
      featureContinuity
    ).filter(
      continuity =>
        continuity
          ?.continuity
          ?.supported ===
        true
    ).length;

  const movementAvailableCount =
    Object.values(
      featureContinuity
    ).filter(
      continuity =>
        continuity
          ?.spatialContext
          ?.featurePositionAvailable ===
        true
    ).length;

  const assessedFeatureCount =
    Object.values(
      featurePersistence
    ).filter(
      feature =>
        feature.available ===
        true
    ).length;

  return deepFreezeSnapshotValue({
    available:
      persistenceEvidence
        ?.available ===
      true,

    classification:
      persistenceEvidence
        ?.classification ??
      "unavailable",

    headline:
      persistenceEvidence
        ?.headline ??
      "Ocean persistence unavailable",

    detail:
      persistenceEvidence
        ?.detail ??
      "Governed historical observations are not yet sufficient for ocean persistence analysis.",

    reason:
      persistenceEvidence
        ?.reason ??
      "ocean-persistence-unavailable",

    values: {
      lifecycleState:
        persistenceEvidence
          ?.values
          ?.lifecycleState ??
        null,

      observationWindowHours:
        persistenceEvidence
          ?.values
          ?.observationWindowHours ??
        null,

      sampleCount:
        persistenceEvidence
          ?.values
          ?.sampleCount ??
        null,

      firstObservedAt:
        persistenceEvidence
          ?.values
          ?.firstObservedAt ??
        null,

      lastObservedAt:
        persistenceEvidence
          ?.values
          ?.lastObservedAt ??
        null,

      durationHours:
        persistenceEvidence
          ?.values
          ?.durationHours ??
        null,

      assessedFeatureCount,

      registeredFeatureCount:
        Object.keys(
          featurePersistence
        ).length
    },

    featurePersistence,

    featureContinuity,

    continuitySummary: {
      assessedContinuityCount,

      supportedContinuityCount,

      movementAvailableCount,

      registeredContinuityCount:
        Object.keys(
          featureContinuity
        ).length
    },

    confidence: {
      score:
        persistenceEvidence
          ?.confidence
          ?.score ??
        0,

      level:
        persistenceEvidence
          ?.confidence
          ?.level ??
        "Unavailable",

      limitations: [
        ...(
          Array.isArray(
            persistenceEvidence
              ?.confidence
              ?.limitations
          )
            ? persistenceEvidence
                .confidence
                .limitations
            : []
        )
      ]
    },

    drivers: [
      ...(
        Array.isArray(
          persistenceEvidence
            ?.drivers
        )
          ? persistenceEvidence
              .drivers
          : []
      )
    ],

    limitations: [
      ...new Set([
        ...(
          Array.isArray(
            persistenceEvidence
              ?.limitations
          )
            ? persistenceEvidence
                .limitations
            : []
        ),

        "feature-specific-persistence-analyzers-are-being-connected-incrementally",
        "unavailable-feature-analysis-does-not-establish-feature-absence",
        "ocean-persistence-does-not-establish-prey-or-fish-presence",
        "ocean-persistence-does-not-establish-habitat-quality-or-fishing-opportunity"
      ])
    ],

    input: {
      source:
        governedTimeSeriesAvailable
          ? "ocean-memory-time-series"
          : "legacy-historical-snapshots",

      timeSeriesContractVersion:
        governedTimeSeriesAvailable
          ? timeSeries
              ?.contractVersion ??
            null
          : null,

      featureMovementSupplied:
        Object.keys(
          governedFeatureMovement
        ).length >
        0
    },

    compatibility: {
      legacyContract:
        "persistence-evidence",

      legacyContractVersion:
        persistenceEvidence
          ?.contractVersion ??
        "pelora-persistence-evidence-v2"
    },

    responsibility:
      "Compare",

    interpretation:
      "species-neutral-ocean-persistence",

    contractVersion:
      "pelora-ocean-persistence-v1"
  });
}


/**
 * ------------------------------------------------------------
 * Ocean Evolution v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Compare.
 *
 * Purpose:
 * Assemble a species-neutral temporal interpretation from
 * governed Ocean Change and Ocean Persistence contracts.
 *
 * Ocean Evolution describes how governed ocean features are
 * evolving through time without recalculating scientific
 * observations or persistence analyses.
 *
 * Feature lifecycle states remain governed by the canonical
 * Ocean Persistence lifecycle vocabulary.
 *
 * This contract does not retrieve external data, recalculate
 * ocean change, calculate feature persistence, establish prey
 * or fish presence, determine habitat quality or fishing
 * opportunity, perform species reasoning, or generate captain
 * guidance.
 */
export function buildOceanEvolution({
  oceanChange = null,
  oceanPersistence = null
} = {}) {
  const oceanChangeAvailable =
    oceanChange
      ?.available ===
      true &&
    oceanChange
      ?.contractVersion ===
      "pelora-ocean-change-from-time-series-v1";

  const oceanPersistenceAvailable =
    oceanPersistence
      ?.contractVersion ===
      "pelora-ocean-persistence-v1" &&
    oceanPersistence
      ?.featurePersistence &&
    typeof oceanPersistence
      .featurePersistence ===
      "object";

  const featurePersistence =
    oceanPersistenceAvailable &&
    oceanPersistence
      ?.featurePersistence &&
    typeof oceanPersistence
      .featurePersistence ===
      "object"
      ? oceanPersistence
          .featurePersistence
      : {};

  const featureEntries =
    Object.entries(
      featurePersistence
    );

  const featureContinuity =
    oceanPersistence
      ?.featureContinuity &&
    typeof oceanPersistence
      .featureContinuity ===
      "object"
      ? oceanPersistence
          .featureContinuity
      : {};

  const featureEvolution =
    Object.fromEntries(
      featureEntries.map(
        ([
          featureKey,
          featureContract
        ]) => {
          const continuityContract =
            featureContinuity[
              featureKey
            ] ??
            null;

          return [
            featureKey,
            {
            available:
              featureContract
                ?.available ===
              true,

            featureType:
              featureContract
                ?.featureType ??
              null,

            featureFamily:
              featureContract
                ?.featureFamily ??
              null,

            lifecycleState:
              OCEAN_PERSISTENCE_LIFECYCLE_STATES
                .includes(
                  featureContract
                    ?.lifecycleState
                )
                ? featureContract
                    .lifecycleState
                : null,

            persistenceClassification:
              featureContract
                ?.classification ??
              "not-assessed",

            reason:
              featureContract
                ?.reason ??
              null,

            continuity: {
              available:
                continuityContract
                  ?.available ===
                true,

              supported:
                continuityContract
                  ?.continuity
                  ?.supported ===
                true,

              classification:
                continuityContract
                  ?.continuity
                  ?.classification ??
                "unavailable",

              contractVersion:
                continuityContract
                  ?.contractVersion ??
                null
            },

            spatialContext: {
              featurePositionAvailable:
                continuityContract
                  ?.spatialContext
                  ?.featurePositionAvailable ===
                true,

              featureMovementNm:
                Number.isFinite(
                  continuityContract
                    ?.spatialContext
                    ?.featureMovementNm
                )
                  ? continuityContract
                      .spatialContext
                      .featureMovementNm
                  : null,

              movementDirectionDegrees:
                Number.isFinite(
                  continuityContract
                    ?.spatialContext
                    ?.movementDirectionDegrees
                )
                  ? continuityContract
                      .spatialContext
                      .movementDirectionDegrees
                  : null,

              movementSpeedKnots:
                Number.isFinite(
                  continuityContract
                    ?.spatialContext
                    ?.movementSpeedKnots
                )
                  ? continuityContract
                      .spatialContext
                      .movementSpeedKnots
                  : null
            },

            confidence: {
              score:
                Number.isFinite(
                  featureContract
                    ?.confidence
                    ?.score
                )
                  ? featureContract
                      .confidence
                      .score
                  : 0,

              level:
                typeof featureContract
                  ?.confidence
                  ?.level ===
                  "string"
                  ? featureContract
                      .confidence
                      .level
                  : "Unavailable"
              }
            }
          ];
        }
      )
    );

  const lifecycleSummary =
    Object.fromEntries(
      [
        ...OCEAN_PERSISTENCE_LIFECYCLE_STATES,
        "unavailable"
      ].map(
        lifecycleState => [
          lifecycleState,
          0
        ]
      )
    );

  for (
    const feature of
      Object.values(
        featureEvolution
      )
  ) {
    if (
      feature.available &&
      OCEAN_PERSISTENCE_LIFECYCLE_STATES
        .includes(
          feature.lifecycleState
        )
    ) {
      lifecycleSummary[
        feature.lifecycleState
      ] +=
        1;
    } else {
      lifecycleSummary
        .unavailable +=
        1;
    }
  }

  lifecycleSummary.assessedFeatureCount =
    Object.values(
      featureEvolution
    ).filter(
      feature =>
        feature.available
    ).length;

  lifecycleSummary.registeredFeatureCount =
    Object.keys(
      featureEvolution
    ).length;

  const movementSummary = {
    movementAvailableCount:
      Object.values(
        featureEvolution
      ).filter(
        feature =>
          feature
            ?.spatialContext
            ?.featurePositionAvailable ===
          true
      ).length,

    registeredFeatureCount:
      Object.keys(
        featureEvolution
      ).length
  };

  const temporalWindow = {
    sampleCount:
      oceanPersistence
        ?.values
        ?.sampleCount ??
      null,

    firstObservedAt:
      oceanPersistence
        ?.values
        ?.firstObservedAt ??
      null,

    lastObservedAt:
      oceanPersistence
        ?.values
        ?.lastObservedAt ??
      null,

    durationHours:
      oceanPersistence
        ?.values
        ?.durationHours ??
      null
  };

  const changeContext =
    oceanChangeAvailable
      ? {
          previousSnapshotId:
            oceanChange
              ?.source
              ?.previousSnapshotId ??
            null,

          currentSnapshotId:
            oceanChange
              ?.source
              ?.currentSnapshotId ??
            null,

          comparisonContractVersion:
            oceanChange
              ?.comparison
              ?.contractVersion ??
            null
        }
      : null;

  const available =
    oceanPersistenceAvailable &&
    lifecycleSummary
      .assessedFeatureCount >
      0;

  const missingRequirements = [
    !oceanPersistenceAvailable
      ? "governed-ocean-persistence"
      : null,

    lifecycleSummary
      .assessedFeatureCount ===
      0
      ? "one-or-more-assessed-persistence-features"
      : null
  ].filter(Boolean);

  const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          oceanPersistence
            ?.limitations
        )
          ? oceanPersistence
              .limitations
          : []
      ),

      ...(
        Array.isArray(
          oceanChange
            ?.limitations
        )
          ? oceanChange
              .limitations
          : []
      ),

      ...missingRequirements,

      !oceanChangeAvailable
        ? "governed-ocean-change-context-unavailable"
        : null,

      "Ocean Evolution inherits lifecycle states from governed feature-persistence contracts and does not independently assign feature lifecycle states.",

      "Ocean Evolution summarizes multiple feature trajectories and does not assign one lifecycle state to the entire ocean.",

      "Ocean Evolution preserves governed feature movement only as spatial context inherited through Temporal Feature Continuity.",

      "Governed feature movement does not independently alter lifecycle state, persistence classification, Ocean Evolution availability, or confidence.",

      "This contract does not retrieve external data, recalculate ocean change, calculate feature persistence, establish prey or fish presence, determine habitat quality or fishing opportunity, perform species reasoning, or generate captain guidance."
    ].filter(Boolean))
  ];
  return deepFreezeSnapshotValue({
    available,

    analysisType:
      "ocean-evolution",

    responsibility:
      "Compare",

    interpretation:
      "species-neutral-ocean-evolution",

    temporalWindow,

    featureEvolution:
      cloneSnapshotValue(
        featureEvolution
      ),

    lifecycleSummary: {
      ...lifecycleSummary
    },

    movementSummary: {
      ...movementSummary
    },

    changeContext:
      changeContext
        ? cloneSnapshotValue(
            changeContext
          )
        : null,

    confidence: {
      score:
        Number.isFinite(
          oceanPersistence
            ?.confidence
            ?.score
        )
          ? oceanPersistence
              .confidence
              .score
          : 0,

      level:
        typeof oceanPersistence
          ?.confidence
          ?.level ===
          "string"
          ? oceanPersistence
              .confidence
              .level
          : "Unavailable"
    },

    drivers: [
      ...(
        Array.isArray(
          oceanPersistence
            ?.drivers
        )
          ? oceanPersistence
              .drivers
          : []
      )
    ],

    upstreamContracts: {
      oceanChange:
        oceanChange
          ?.contractVersion ??
        null,

      oceanChangeAnalysis:
        oceanChange
          ?.comparison
          ?.contractVersion ??
        null,

      oceanPersistence:
        oceanPersistence
          ?.contractVersion ??
        null,

      timeSeries:
        oceanPersistence
          ?.input
          ?.timeSeriesContractVersion ??
        oceanChange
          ?.source
          ?.contractVersion ??
        null
    },

    missingRequirements: [
      ...new Set(
        missingRequirements
      )
    ],

    limitations,

    contractVersion:
      "pelora-ocean-evolution-v1"
  });
}


/**
 * ------------------------------------------------------------
 * Temporal Ocean Explainability v1.0
 * ------------------------------------------------------------
 *
 * Responsibility:
 * Explain.
 *
 * Purpose:
 * Translate governed Ocean Evolution into deterministic,
 * species-neutral physical explanations of temporal ocean
 * behavior.
 *
 * This contract explains what governed feature evolution means
 * physically without recalculating Ocean Change, Persistence,
 * lifecycle state, opportunity, habitat suitability, species
 * reasoning, or captain guidance.
 */
export function buildTemporalOceanExplainability({
  oceanEvolution = null
} = {}) {

    const oceanEvolutionAvailable =
    oceanEvolution
      ?.available ===
      true &&
    oceanEvolution
      ?.contractVersion ===
      "pelora-ocean-evolution-v1" &&
    oceanEvolution
      ?.featureEvolution &&
    typeof oceanEvolution
      .featureEvolution ===
      "object";

  const featureEvolution =
    oceanEvolutionAvailable
      ? oceanEvolution
          .featureEvolution
      : {};

  const featureEntries =
    Object.entries(
      featureEvolution
    );

    const lifecycleInterpretations = {
    emerging:
      "The governed feature has newly developed within the observed temporal window.",

    developing:
      "The governed feature is developing across the observed temporal window.",

    stable:
      "The governed feature has remained comparatively stable across the observed temporal window.",

    strengthening:
      "The governed feature has strengthened across the observed temporal window.",

    weakening:
      "The governed feature has weakened across the observed temporal window.",

    fading:
      "The governed feature is no longer supported as strongly as it was earlier in the observed temporal window."
  };

  const featureExplanations =
    Object.fromEntries(
      featureEntries.map(
        ([
          featureKey,
          feature
        ]) => {
          const lifecycleState =
            OCEAN_PERSISTENCE_LIFECYCLE_STATES
              .includes(
                feature
                  ?.lifecycleState
              )
              ? feature
                  .lifecycleState
              : null;

          const explanationAvailable =
            feature
              ?.available ===
              true &&
            lifecycleState !==
              null;

          const featureMovementNm =
            Number.isFinite(
              feature
                ?.spatialContext
                ?.featureMovementNm
            )
              ? feature
                  .spatialContext
                  .featureMovementNm
              : null;

          const movementDirectionDegrees =
            Number.isFinite(
              feature
                ?.spatialContext
                ?.movementDirectionDegrees
            )
              ? feature
                  .spatialContext
                  .movementDirectionDegrees
              : null;

          const movementSpeedKnots =
            Number.isFinite(
              feature
                ?.spatialContext
                ?.movementSpeedKnots
            )
              ? feature
                  .spatialContext
                  .movementSpeedKnots
              : null;

          const movementAvailable =
            feature
              ?.spatialContext
              ?.featurePositionAvailable ===
              true &&
            Number.isFinite(
              featureMovementNm
            ) &&
            Number.isFinite(
              movementSpeedKnots
            );

          const movementInterpretation =
            movementAvailable
              ? featureMovementNm === 0
                ? "The governed feature remained spatially stationary across the observed temporal window."
                : Number.isFinite(
                    movementDirectionDegrees
                  )
                  ? `The governed feature moved ${featureMovementNm} nautical miles toward ${movementDirectionDegrees}° at an average movement rate of ${movementSpeedKnots} knots across the observed temporal window.`
                  : `The governed feature moved ${featureMovementNm} nautical miles at an average movement rate of ${movementSpeedKnots} knots across the observed temporal window.`
              : null;

          return [
            featureKey,
            {
              available:
                explanationAvailable,

              featureType:
                feature
                  ?.featureType ??
                null,

              featureFamily:
                feature
                  ?.featureFamily ??
                null,

              lifecycleState,

              persistenceClassification:
                feature
                  ?.persistenceClassification ??
                "not-assessed",

              continuity: {
                available:
                  feature
                    ?.continuity
                    ?.available ===
                  true,

                supported:
                  feature
                    ?.continuity
                    ?.supported ===
                  true,

                classification:
                  feature
                    ?.continuity
                    ?.classification ??
                  "unavailable",

                contractVersion:
                  feature
                    ?.continuity
                    ?.contractVersion ??
                  null
              },

              spatialContext: {
                featurePositionAvailable:
                  feature
                    ?.spatialContext
                    ?.featurePositionAvailable ===
                  true,

                featureMovementNm:
                  Number.isFinite(
                    feature
                      ?.spatialContext
                      ?.featureMovementNm
                  )
                    ? feature
                        .spatialContext
                        .featureMovementNm
                    : null,

                movementDirectionDegrees:
                  Number.isFinite(
                    feature
                      ?.spatialContext
                      ?.movementDirectionDegrees
                  )
                    ? feature
                        .spatialContext
                        .movementDirectionDegrees
                    : null,

                movementSpeedKnots:
                  Number.isFinite(
                    feature
                      ?.spatialContext
                      ?.movementSpeedKnots
                  )
                    ? feature
                        .spatialContext
                        .movementSpeedKnots
                    : null
              },

              physicalInterpretation:
                explanationAvailable
                  ? lifecycleInterpretations[
                      lifecycleState
                    ]
                  : null,

              movementInterpretation,

              evidenceBasis:
                explanationAvailable
                  ? [
                      "governed-ocean-evolution",
                      "governed-feature-lifecycle",
                      "governed-persistence-classification",

                      feature
                        ?.continuity
                        ?.available ===
                      true
                        ? "governed-temporal-feature-continuity"
                        : null,

                      feature
                        ?.spatialContext
                        ?.featurePositionAvailable ===
                      true
                        ? "governed-feature-movement-context"
                        : null
                    ].filter(Boolean)
                  : [],

              confidence: {
                score:
                  Number.isFinite(
                    feature
                      ?.confidence
                      ?.score
                  )
                    ? feature
                        .confidence
                        .score
                    : 0,

                level:
                  typeof feature
                    ?.confidence
                    ?.level ===
                    "string"
                    ? feature
                        .confidence
                        .level
                    : "Unavailable"
              }
            }
          ];
        }
      )
    );

      const explainedFeatures =
    Object.values(
      featureExplanations
    ).filter(
      feature =>
        feature.available ===
        true
    );

  const explainedFeatureCount =
    explainedFeatures.length;

  const temporalWindow = {
    sampleCount:
      oceanEvolution
        ?.temporalWindow
        ?.sampleCount ??
      null,

    firstObservedAt:
      oceanEvolution
        ?.temporalWindow
        ?.firstObservedAt ??
      null,

    lastObservedAt:
      oceanEvolution
        ?.temporalWindow
        ?.lastObservedAt ??
      null,

    durationHours:
      oceanEvolution
        ?.temporalWindow
        ?.durationHours ??
      null
  };

  const lifecycleCounts =
    Object.fromEntries(
      OCEAN_PERSISTENCE_LIFECYCLE_STATES
        .map(
          lifecycleState => [
            lifecycleState,
            explainedFeatures.filter(
              feature =>
                feature
                  .lifecycleState ===
                lifecycleState
            ).length
          ]
        )
    );

  const available =
    oceanEvolutionAvailable &&
    explainedFeatureCount >
      0;

  const missingRequirements = [
    !oceanEvolutionAvailable
      ? "governed-ocean-evolution"
      : null,

    oceanEvolutionAvailable &&
    explainedFeatureCount ===
      0
      ? "one-or-more-explainable-feature-evolution-records"
      : null
  ].filter(Boolean);

    const limitations = [
    ...new Set([
      ...(
        Array.isArray(
          oceanEvolution
            ?.limitations
        )
          ? oceanEvolution
              .limitations
          : []
      ),

      ...missingRequirements,

      "Temporal Ocean Explainability translates governed lifecycle states into deterministic physical language without changing the underlying lifecycle state or persistence classification.",

      "Temporal Ocean Explainability preserves governed feature movement as physical spatial context without changing lifecycle state, persistence classification, availability, or confidence.",

      "Governed feature movement describes observed feature displacement and does not independently establish why the feature moved.",

      "Movement interpretation translates governed displacement, bearing, and average movement rate only; it does not infer physical causation, biological response, habitat quality, fishing opportunity, or captain guidance.",

      "Temporal Ocean Explainability does not infer physical causation beyond the governed upstream temporal contracts.",

      "Temporal Ocean Explainability does not establish prey or fish presence, habitat quality, fishing opportunity, species probability, or captain guidance."
    ])
  ];

  return deepFreezeSnapshotValue({
    available,

    explanationType:
      "temporal-ocean-explainability",

    responsibility:
      "Explain",

    interpretation:
      "species-neutral-temporal-ocean-explainability",

    temporalWindow,

    featureExplanations:
      cloneSnapshotValue(
        featureExplanations
      ),

    summary: {
      assessedFeatureCount:
        oceanEvolution
          ?.lifecycleSummary
          ?.assessedFeatureCount ??
        0,

      explainedFeatureCount,

      registeredFeatureCount:
        oceanEvolution
          ?.lifecycleSummary
          ?.registeredFeatureCount ??
        Object.keys(
          featureExplanations
        ).length,

      lifecycleCounts: {
        ...lifecycleCounts
      }
    },

    changeContext:
      oceanEvolution
        ?.changeContext
        ? cloneSnapshotValue(
            oceanEvolution
              .changeContext
          )
        : null,

    confidence: {
      score:
        Number.isFinite(
          oceanEvolution
            ?.confidence
            ?.score
        )
          ? oceanEvolution
              .confidence
              .score
          : 0,

      level:
        typeof oceanEvolution
          ?.confidence
          ?.level ===
          "string"
          ? oceanEvolution
              .confidence
              .level
          : "Unavailable"
    },

    upstreamContracts: {
      oceanEvolution:
        oceanEvolution
          ?.contractVersion ??
        null,

      oceanPersistence:
        oceanEvolution
          ?.upstreamContracts
          ?.oceanPersistence ??
        null,

      oceanChange:
        oceanEvolution
          ?.upstreamContracts
          ?.oceanChange ??
        null,

      oceanChangeAnalysis:
        oceanEvolution
          ?.upstreamContracts
          ?.oceanChangeAnalysis ??
        null,

      timeSeries:
        oceanEvolution
          ?.upstreamContracts
          ?.timeSeries ??
        null
    },

    missingRequirements: [
      ...new Set(
        missingRequirements
      )
    ],

    limitations,

    contractVersion:
      "pelora-temporal-ocean-explainability-v1"
  });
}


/**
 * ------------------------------------------------------------
 * Opportunity Classification Engine v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Normalize species-neutral environmental opportunity evidence
 * into a stable pathway classification.
 *
 * This engine answers:
 * "What kind of environmental opportunity pathway is currently
 * supported?"
 *
 * It does not establish biological significance, prey
 * concentration, fish presence, fishing quality, habitat
 * suitability, or species probability.
 *
 * Physical structure is one possible pathway. It is never a
 * universal prerequisite. Missing structure remains neutral.
 */
export function classifyOceanOpportunity({
  environmentalOpportunityEvidence = null,
  featureCandidates = []
} = {}) {
  const combinedEvidence =
    environmentalOpportunityEvidence
      ?.combined ??
    environmentalOpportunityEvidence ??
    {};

  const pathways =
    combinedEvidence?.pathways ??
    {};

  const structureAvailable =
    pathways
      ?.structureAssociated
      ?.available === true;

  const openWaterAvailable =
    pathways
      ?.openWater
      ?.available === true;

  const openWaterOrganized =
    pathways
      ?.openWater
      ?.organized === true;

  const persistenceAvailable =
    pathways
      ?.persistence
      ?.available === true;

  const candidates =
    Array.isArray(
      featureCandidates
    )
      ? featureCandidates
      : [];

  const featureCandidateCount =
    candidates.length;

  const environmentalFeatureSupported =
    featureCandidateCount > 0;

  let classification;
  let pathway;
  let headline;
  let detail;
  let reason;

  if (
    structureAvailable &&
    openWaterOrganized
  ) {
    classification =
      "combined";

    pathway =
      "structure-and-open-water";

    headline =
      "Combined environmental opportunity pathway";

    detail =
      "Verified structure evidence and independently supported open-water organization are both present.";

    reason =
      "structure-and-open-water-evidence-supported";
  } else if (
    openWaterOrganized
  ) {
    classification =
      "open-water";

    pathway =
      "environmental-organization";

    headline =
      "Open-water environmental opportunity pathway";

    detail =
      "Environmental organization is supported without requiring nearby physical structure.";

    reason =
      "open-water-organization-supported";
  } else if (
    structureAvailable
  ) {
    classification =
      "structure-associated";

    pathway =
      "physical-structure";

    headline =
      "Structure-associated environmental opportunity pathway";

    detail =
      "Verified physical structure evidence is present. Open-water organization has not been independently established.";

    reason =
      "structure-evidence-supported";
  } else if (
    environmentalFeatureSupported
  ) {
    classification =
      "environmental-feature-unclassified";

    pathway =
      "observed-feature-candidate";

    headline =
      "Environmental feature candidate remains unclassified";

    detail =
      "One or more environmental feature candidates are supported, but current evidence does not yet establish a structure-associated, open-water, or combined pathway.";

    reason =
      "feature-candidate-supported-without-verified-pathway";
  } else {
    classification =
      "insufficient-evidence";

    pathway =
      "unresolved";

    headline =
      "Opportunity pathway cannot yet be classified";

    detail =
      "The available evidence does not currently support a defensible structure-associated, open-water, combined, or other environmental feature pathway.";

    reason =
      "insufficient-opportunity-pathway-evidence";
  }

  const supportingPathways = [
    structureAvailable
      ? "structure-associated"
      : null,

    openWaterOrganized
      ? "open-water"
      : null,

    persistenceAvailable
      ? "persistence"
      : null,

    environmentalFeatureSupported
      ? "environmental-feature-candidate"
      : null
  ].filter(Boolean);

  const sourceOpportunityTypes = [
    ...new Set(
      candidates
        .map(
          candidate =>
            candidate?.type
        )
        .filter(Boolean)
    )
  ];

  const supportingEvidenceGroups = [
    ...new Set(
      candidates.flatMap(
        candidate =>
          Array.isArray(
            candidate
              ?.supportingEvidence
          )
            ? candidate
                .supportingEvidence
            : []
      )
    )
  ];

  const sourceFamilies = [
    ...new Set(
      candidates.flatMap(
        candidate =>
          Array.isArray(
            candidate
              ?.sourceFamilies
          )
            ? candidate
                .sourceFamilies
            : []
      )
    )
  ];

  const limitations = [
    "species-neutral-classification",
    "does-not-establish-biological-significance",
    "does-not-establish-prey-concentration",
    "does-not-establish-fish-presence",
    "does-not-indicate-fishing-quality",
    "does-not-indicate-habitat-suitability",
    "does-not-indicate-species-probability"
  ];

  if (!openWaterOrganized) {
    limitations.push(
      "open-water-organization-not-established"
    );
  }

  if (!persistenceAvailable) {
    limitations.push(
      "persistence-not-established"
    );
  }

  return {
    available:
      classification !==
      "insufficient-evidence",

    classification,

    pathway,

    headline,

    detail,

    reason,

    interpretation:
      "species-neutral-opportunity-pathway-classification",

    evidence: {
      structureAvailable,
      openWaterAvailable,
      openWaterOrganized,
      persistenceAvailable,
      environmentalFeatureSupported,
      featureCandidateCount
    },

    supportingPathways,

    sourceOpportunityTypes,

    supportingEvidenceGroups,

    sourceFamilies,

    rules: {
      structureRequired: false,
      missingStructureIsNegative: false,
      structureAbsenceTreatment:
        "neutral",
      classificationIsSpeciesNeutral:
        true,
      classificationChangesScores:
        false,
      biologicalInferenceAllowed:
        false
    },

    limitations,

    methodVersion:
      "pelora-opportunity-classification-v1.0"
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


/**
 * Build the governed lineage record for Ocean Opportunity.
 *
 * This extends Ocean Evidence lineage and records the additional
 * feature-candidate and pathway-classification products created
 * by the Ocean Opportunity Engine.
 */
export function buildOceanOpportunityLineage({
  oceanEvidence = null,
  opportunities = [],
  pathwayClassification = null,
  limitations = []
} = {}) {
  const candidateCount =
    Array.isArray(
      opportunities
    )
      ? opportunities.length
      : 0;

  const warnings = [];

  if (candidateCount === 0) {
    warnings.push(
      "no-ocean-feature-candidates-produced"
    );
  }

  if (
    pathwayClassification
      ?.available !== true
  ) {
    warnings.push(
      "opportunity-pathway-unresolved"
    );
  }

  return propagateEvidenceLineage({
    upstreamLineage:
      oceanEvidence?.lineage ??
      null,

    producedBy:
      "ocean-opportunity",

    methodVersion:
      "pelora-ocean-opportunity-lineage-v1.0",

    evidenceProduced: [
      "ocean-feature-candidate-assessment",
      "opportunity-pathway-classification"
    ],

    inheritedLimitations:
      Array.isArray(
        limitations
      )
        ? limitations
        : [],

    inheritedWarnings:
      warnings,

    components: {
      featureCandidateCount:
        candidateCount,

      featureCandidateTypes: [
        ...new Set(
          (
            Array.isArray(
              opportunities
            )
              ? opportunities
              : []
          )
            .map(
              opportunity =>
                opportunity?.type
            )
            .filter(Boolean)
        )
      ],

      pathwayClassification:
        pathwayClassification
          ?.classification ??
        "insufficient-evidence",

      pathway:
        pathwayClassification
          ?.pathway ??
        "unresolved"
    }
  });
}


export function assessOceanOpportunity({
  oceanEvidence,
  oceanPersistence = null
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

    const persistenceAvailable =
    oceanPersistence
      ?.available ===
    true;

  const persistenceContext = {
    available:
      persistenceAvailable,

    classification:
      oceanPersistence
        ?.classification ??
      "unavailable",

    lifecycleState:
      oceanPersistence
        ?.values
        ?.lifecycleState ??
      null,

    sampleCount:
      oceanPersistence
        ?.values
        ?.sampleCount ??
      null,

    observationWindowHours:
      oceanPersistence
        ?.values
        ?.observationWindowHours ??
      null,

    assessedFeatureCount:
      oceanPersistence
        ?.values
        ?.assessedFeatureCount ??
      0,

    registeredFeatureCount:
      oceanPersistence
        ?.values
        ?.registeredFeatureCount ??
      null,

    confidence: {
      score:
        oceanPersistence
          ?.confidence
          ?.score ??
        0,

      level:
        oceanPersistence
          ?.confidence
          ?.level ??
        "Unavailable"
    },

    interpretation:
      oceanPersistence
        ?.interpretation ??
      "species-neutral-ocean-persistence-unavailable",

    contractVersion:
      oceanPersistence
        ?.contractVersion ??
      null,

    limitations: [
      ...(
        Array.isArray(
          oceanPersistence
            ?.limitations
        )
          ? oceanPersistence
              .limitations
          : [
              "ocean-persistence-not-supplied"
            ]
      ),

      "persistence-context-is-documentary-only",
      "persistence-context-does-not-change-opportunity-scoring",
      "persistence-context-does-not-establish-biological-significance"
    ]
  };

  const pathwayClassification =
    classifyOceanOpportunity({
      environmentalOpportunityEvidence:
        oceanEvidence
          ?.environmentalOpportunityEvidence ??
        null,

      featureCandidates:
        opportunities
    });

  const lineage =
    buildOceanOpportunityLineage({
      oceanEvidence,

      opportunities,

      pathwayClassification,

      limitations:
        aggregatedLimitations
    });

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

    pathwayClassification,

    persistenceContext,

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

    /*
     * Lineage extends the upstream Ocean Evidence trace.
     * It cannot change opportunity behavior.
     */
    lineage,

    methodVersion:
      "pelora-ocean-opportunity-v1.1"
  };
}


/**
 * ------------------------------------------------------------
 * Ocean Signal Selection Lineage v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Document how Pelora selected the primary
 * species-neutral Ocean Signal from governed
 * Ocean Opportunity candidates.
 *
 * Ocean Opportunity is the primary direct parent.
 *
 * This lineage is documentary only. It does not:
 *
 * - create ocean features
 * - change opportunity confidence
 * - change signal confidence
 * - change candidate ordering
 * - change primary-signal selection
 * - establish biological significance
 * - indicate fishing quality
 * - confirm species presence
 */
export function buildOceanSignalSelectionLineage({
  oceanOpportunity = null,
  available = false,
  classification = "unavailable",
  primarySignal = null,
  supportingSignals = [],
  limitations = []
} = {}) {
  return propagateEvidenceLineage({
    primaryUpstreamLineage:
      oceanOpportunity?.lineage ??
      null,

    producedBy:
      "ocean-signal-selection",

    methodVersion:
      "pelora-ocean-signal-selection-lineage-v1.0",

    evidenceProduced: [
      "species-neutral-ocean-signal-selection"
    ],

    inheritedLimitations:
      Array.isArray(limitations)
        ? limitations
        : [],

    inheritedWarnings:
      oceanOpportunity?.lineage
        ? []
        : [
            "primary-upstream-lineage-unavailable"
          ],

    components: {
      available:
        available === true,

      classification,

      primarySignalType:
        primarySignal?.signalType ??
        null,

      supportingSignalTypes:
        Array.isArray(
          supportingSignals
        )
          ? supportingSignals
              .map(
                signal =>
                  signal?.signalType
              )
              .filter(Boolean)
          : [],

      supportingSignalCount:
        Array.isArray(
          supportingSignals
        )
          ? supportingSignals.length
          : 0
    }
  });
}


export function resolveOceanSignals({
  oceanOpportunity = null
} = {}) {
  if (
    !oceanOpportunity ||
    typeof oceanOpportunity !== "object"
  ) {
      const limitations = [
        "ocean-opportunity-unavailable",
        "does-not-establish-biological-significance",
        "does-not-indicate-fishing-quality",
        "does-not-confirm-species-presence"
      ];


      const lineage =
        buildOceanSignalSelectionLineage({
          oceanOpportunity,

          available: false,

          classification:
            "unavailable",

          primarySignal: null,

          supportingSignals: [],

          limitations
        });


      return {
        available: false,

        classification:
          "unavailable",

        primarySignal: null,

        supportingSignals: [],

        confidence: {
          score: 0,
          level: "Unavailable"
        },

        limitations,

        lineage,

        interpretation:
          "species-neutral-ocean-signal-selection",

        methodVersion:
          "pelora-ocean-signal-selection-v1.0"
      };
   }


  const opportunities =
    Array.isArray(
      oceanOpportunity.opportunities
    )
      ? oceanOpportunity.opportunities
      : [];


  function buildSignal(
    opportunity
  ) {
    if (
      !opportunity ||
      typeof opportunity !== "object"
    ) {
      return null;
    }


    let signalType = null;
    let label = null;


    if (
      opportunity.type ===
      "environmental-transition-zone"
    ) {
      signalType =
        "temperature-transition";

      label =
        opportunity.classification ===
        "strong-temperature-transition-candidate"
          ? "Strong Temperature Transition"
          : "Temperature Transition";
    }


    if (
      opportunity.type ===
      "current-supported-transition-candidate"
    ) {
      signalType =
        "current-supported-transition";

      label =
        "Current-Supported Transition";
    }


    if (
      opportunity.type ===
      "surface-water-boundary-candidate"
    ) {
      signalType =
        "surface-water-transition";

      label =
        "Surface-Water Transition";
    }


    if (
      opportunity.type ===
      "multi-signal-feature-candidate"
    ) {
      signalType =
        "multi-signal-support";

      label =
        "Multiple Signals Reinforce This Feature";
    }


    if (!signalType) {
      return null;
    }


    return {
      signalType,

      label,

      sourceOpportunityType:
        opportunity.type,

      sourceClassification:
        opportunity.classification ??
        null,

      supportingEvidence:
        Array.isArray(
          opportunity.supportingEvidence
        )
          ? [
              ...opportunity
                .supportingEvidence
            ]
          : [],

      sourceFamilies:
        Array.isArray(
          opportunity.sourceFamilies
        )
          ? [
              ...opportunity
                .sourceFamilies
            ]
          : [],

      confidence: {
        score:
          Number.isFinite(
            opportunity
              ?.confidence
              ?.score
          )
            ? opportunity
                .confidence
                .score
            : 0,

        level:
          opportunity
            ?.confidence
            ?.level ??
          "Unavailable"
      },

      limitations:
        Array.isArray(
          opportunity.limitations
        )
          ? [
              ...opportunity.limitations
            ]
          : []
    };
  }


  const signals =
    opportunities
      .map(
        opportunity =>
          buildSignal(
            opportunity
          )
      )
      .filter(Boolean);


  /*
   * Composite reinforcement is supporting
   * context only. It cannot replace a
   * concrete physical ocean feature as the
   * primary Ocean Signal.
   */
  const featureSignals =
    signals.filter(
      signal =>
        signal.signalType !==
        "multi-signal-support"
    );


  const rankedFeatureSignals =
    [...featureSignals]
      .sort(
        (a, b) =>
          (
            Number.isFinite(
              b?.confidence?.score
            )
              ? b.confidence.score
              : 0
          ) -
          (
            Number.isFinite(
              a?.confidence?.score
            )
              ? a.confidence.score
              : 0
          )
      );


  const primarySignal =
    rankedFeatureSignals[0] ??
    null;


  const supportingSignals =
    signals.filter(
      signal =>
        signal !== primarySignal
    );


  if (!primarySignal) {
    const classification =
      supportingSignals.length > 0
        ? "supporting-signals-only"
        : "no-supported-signal";


    const limitations = [
      "primary-ocean-signal-not-established",
      "does-not-establish-biological-significance",
      "does-not-indicate-fishing-quality",
      "does-not-confirm-species-presence"
    ];


    const lineage =
      buildOceanSignalSelectionLineage({
        oceanOpportunity,

        available: false,

        classification,

        primarySignal: null,

        supportingSignals,

        limitations
      });


    return {
      available: false,

      classification,

      primarySignal: null,

      supportingSignals,

      confidence: {
        score:
          oceanOpportunity
            ?.confidence
            ?.score ??
          0,

        level:
          oceanOpportunity
            ?.confidence
            ?.level ??
          "Unavailable"
      },

      persistenceContext:
        oceanOpportunity
          ?.persistenceContext ??
        null,

      limitations,

      lineage,

      interpretation:
        "species-neutral-ocean-signal-selection",

      methodVersion:
        "pelora-ocean-signal-selection-v1.0"
    };
  }


   const limitations = [
    "species-neutral-signal-selection",
    "signal-selection-does-not-establish-biological-significance",
    "signal-selection-does-not-indicate-fishing-quality",
    "signal-selection-does-not-confirm-species-presence",
    "persistence-context-does-not-change-signal-selection"
  ];


  const lineage =
    buildOceanSignalSelectionLineage({
      oceanOpportunity,

      available: true,

      classification:
        "primary-signal-selected",

      primarySignal,

      supportingSignals,

      limitations
    });


  return {
    available: true,

    classification:
      "primary-signal-selected",

    primarySignal,

    supportingSignals,

    confidence: {
      score:
        primarySignal
          ?.confidence
          ?.score ??
        0,

      level:
        primarySignal
          ?.confidence
          ?.level ??
        "Unavailable"
    },

    persistenceContext:
      oceanOpportunity
        ?.persistenceContext ??
      null,

    limitations,

    lineage,

    interpretation:
      "species-neutral-ocean-signal-selection",

    methodVersion:
      "pelora-ocean-signal-selection-v1.0"
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
/**
 * ------------------------------------------------------------
 * Relationship Context Lineage v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Preserve the governed evidence trace used to construct the
 * species-neutral Relationship Context contract.
 *
 * Ocean Opportunity is the primary inherited reasoning chain.
 * Ocean Evidence remains visible as a secondary direct dependency.
 *
 * This lineage is documentary only. It does not alter relationship
 * support, pathway classification, confidence, biological
 * interpretation, or habitat scoring.
 */
export function buildRelationshipContextLineage({
  oceanOpportunity = null,
  oceanEvidence = null,
  pathway =
    "insufficient-evidence",
  environmentType =
    "unresolved",
  supportedRelationships = [],
  unavailableRelationships = [],
  unresolvedRelationships = [],
  limitations = []
} = {}) {
  return propagateEvidenceLineage({
    primaryUpstreamLineage:
      oceanOpportunity
        ?.lineage ??
      null,

    upstreamLineages: [
      oceanEvidence
        ?.lineage ??
      null
    ],

    producedBy:
      "relationship-context",

    methodVersion:
      "pelora-relationship-context-lineage-v1.0",

    evidenceProduced: [
      "relationship-context"
    ],

    inheritedLimitations:
      Array.isArray(
        limitations
      )
        ? limitations
        : [],

    inheritedWarnings:
      oceanOpportunity?.lineage
        ? []
        : [
            "primary-upstream-lineage-unavailable"
          ],

    components: {
      pathway,

      environmentType,

      supportedRelationships:
        Array.isArray(
          supportedRelationships
        )
          ? [
              ...supportedRelationships
            ]
          : [],

      unavailableRelationships:
        Array.isArray(
          unavailableRelationships
        )
          ? [
              ...unavailableRelationships
            ]
          : [],

      unresolvedRelationships:
        Array.isArray(
          unresolvedRelationships
        )
          ? [
              ...unresolvedRelationships
            ]
          : []
    }
  });
}


/**
 * ------------------------------------------------------------
 * Relationship Context Engine v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Translate species-neutral Ocean Evidence and Opportunity
 * Classification into a normalized relationship context that
 * can be consumed by multiple Habitat Suitability Models.
 *
 * This engine answers:
 * "Which environmental relationships are currently supported,
 * unavailable, or unresolved?"
 *
 * It does not score habitat, infer biological significance,
 * establish prey concentration, establish fish presence, or
 * modify any species model.
 */
export function buildRelationshipContext({
  oceanOpportunity = null,
  oceanEvidence = null
} = {}) {
  const groups =
    oceanEvidence?.groups ??
    {};

  const pathwayClassification =
    oceanOpportunity
      ?.pathwayClassification ??
    {};

  const pathwayEvidence =
    pathwayClassification
      ?.evidence ??
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

  const structure =
    groups.structure ??
    {};

  const pathway =
    pathwayClassification
      ?.classification ??
    "insufficient-evidence";

  const environmentType =
    pathwayClassification
      ?.pathway ??
    "unresolved";

  const structureSupported =
    pathwayEvidence
      ?.structureAvailable === true ||
    structure?.available === true;

  const openWaterSupported =
    pathwayEvidence
      ?.openWaterOrganized === true;

  const persistenceSupported =
    pathwayEvidence
      ?.persistenceAvailable === true;

  const thermalStructureSupported =
    temperature?.available === true;

  const oceanMovementSupported =
    current?.available === true;

  const productivitySupported =
    productivity?.available === true;

  const waterCharacterSupported =
    clarity?.available === true;

  const structureInteractionSupported =
    structureSupported;

  const relationshipSupport = {
    thermalStructure: {
      supported:
        thermalStructureSupported,

      status:
        thermalStructureSupported
          ? "supported"
          : "unavailable",

      source:
        thermalStructureSupported
          ? "ocean-evidence-temperature"
          : null
    },

    oceanMovement: {
      supported:
        oceanMovementSupported,

      status:
        oceanMovementSupported
          ? "supported"
          : "unavailable",

      source:
        oceanMovementSupported
          ? "ocean-evidence-current"
          : null
    },

    productivity: {
      supported:
        productivitySupported,

      status:
        productivitySupported
          ? "supported"
          : "unavailable",

      source:
        productivitySupported
          ? "ocean-evidence-productivity"
          : null
    },

    structureInteraction: {
      supported:
        structureInteractionSupported,

      status:
        structureInteractionSupported
          ? "supported"
          : "unavailable",

      source:
        structureInteractionSupported
          ? "structure-evidence"
          : null
    },

    waterCharacter: {
      supported:
        waterCharacterSupported,

      status:
        waterCharacterSupported
          ? "supported"
          : "unavailable",

      source:
        waterCharacterSupported
          ? "ocean-evidence-clarity"
          : null
    },

    openWaterOrganization: {
      supported:
        openWaterSupported,

      status:
        openWaterSupported
          ? "supported"
          : "unresolved",

      source:
        openWaterSupported
          ? "opportunity-pathway-classification"
          : null
    },

    persistence: {
      supported:
        persistenceSupported,

      status:
        persistenceSupported
          ? "supported"
          : "unresolved",

      source:
        persistenceSupported
          ? "persistence-evidence"
          : null
    }
  };

  const supportedRelationships =
    Object.entries(
      relationshipSupport
    )
      .filter(
        ([
          ,
          relationship
        ]) =>
          relationship
            ?.supported === true
      )
      .map(
        ([
          name
        ]) =>
          name
      );

  const unavailableRelationships =
    Object.entries(
      relationshipSupport
    )
      .filter(
        ([
          ,
          relationship
        ]) =>
          relationship
            ?.status ===
          "unavailable"
      )
      .map(
        ([
          name
        ]) =>
          name
      );

  const unresolvedRelationships =
    Object.entries(
      relationshipSupport
    )
      .filter(
        ([
          ,
          relationship
        ]) =>
          relationship
            ?.status ===
          "unresolved"
      )
      .map(
        ([
          name
        ]) =>
          name
      );

  const available =
    supportedRelationships
      .length > 0;

  const limitations = [
    "species-neutral-relationship-context",
    "relationship-support-is-not-habitat-suitability",
    "does-not-establish-biological-significance",
    "does-not-establish-prey-concentration",
    "does-not-establish-fish-presence",
    "does-not-indicate-fishing-quality",
    "does-not-indicate-species-probability",
    "does-not-change-species-model-scores"
  ];

  if (!openWaterSupported) {
    limitations.push(
      "open-water-organization-not-established"
    );
  }

  if (!persistenceSupported) {
    limitations.push(
      "persistence-not-established"
    );
  }

  const lineage =
    buildRelationshipContextLineage({
      oceanOpportunity,

      oceanEvidence,

      pathway,

      environmentType,

      supportedRelationships,

      unavailableRelationships,

      unresolvedRelationships,

      limitations
    });


  return {
    available,

    pathway,

    environmentType,

    interpretation:
      "species-neutral-relationship-context",

    relationshipSupport,

    supportedRelationships,

    unavailableRelationships,

    unresolvedRelationships,

    summary: {
      supportedCount:
        supportedRelationships.length,

      unavailableCount:
        unavailableRelationships.length,

      unresolvedCount:
        unresolvedRelationships.length
    },

    rules: {
      structureRequired: false,
      missingStructureIsNegative: false,
      structureAbsenceTreatment:
        "neutral",
      contextIsSpeciesNeutral: true,
      contextChangesScores: false,
      biologicalInferenceAllowed: false
    },

    limitations,

    lineage,

    methodVersion:
      "pelora-relationship-context-v1.0"
  };
}


/**
 * ------------------------------------------------------------
 * Relationship Assessment Lineage v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Preserve the governed evidence trace used to produce the
 * canonical species-neutral relationship assessment.
 *
 * Relationship Context is the primary upstream reasoning chain.
 * Ocean Opportunity and Ocean Evidence remain visible as
 * secondary direct dependencies.
 *
 * The lineage records compact assessment outputs only. It does
 * not duplicate the full confidence contract or alter support,
 * confidence, scores, classifications, or biological reasoning.
 */
export function buildRelationshipAssessmentLineage({
  relationshipContext = null,
  oceanOpportunity = null,
  oceanEvidence = null,
  pathway =
    "insufficient-evidence",
  environmentType =
    "unresolved",
  supportedCount = 0,
  unavailableCount = 0,
  unresolvedCount = 0,
  assessedCount = 0,
  overallConfidence = 0,
  limitations = []
} = {}) {
  return propagateEvidenceLineage({
    primaryUpstreamLineage:
      relationshipContext
        ?.lineage ??
      null,

    upstreamLineages: [
      oceanOpportunity
        ?.lineage ??
      null,

      oceanEvidence
        ?.lineage ??
      null
    ],

    producedBy:
      "relationship-assessment",

    methodVersion:
      "pelora-relationship-assessment-lineage-v1.0",

    evidenceProduced: [
      "relationship-support-assessment",
      "relationship-confidence-assessment"
    ],

    inheritedLimitations:
      Array.isArray(
        limitations
      )
        ? limitations
        : [],

    inheritedWarnings:
      relationshipContext?.lineage
        ? []
        : [
            "primary-upstream-lineage-unavailable"
          ],

    components: {
      pathway,

      environmentType,

      supportedCount:
        Number.isFinite(
          supportedCount
        )
          ? supportedCount
          : 0,

      unavailableCount:
        Number.isFinite(
          unavailableCount
        )
          ? unavailableCount
          : 0,

      unresolvedCount:
        Number.isFinite(
          unresolvedCount
        )
          ? unresolvedCount
          : 0,

      assessedCount:
        Number.isFinite(
          assessedCount
        )
          ? assessedCount
          : 0,

      overallConfidence:
        Number.isFinite(
          overallConfidence
        )
          ? overallConfidence
          : 0
    }
  });
}


/**
 * ------------------------------------------------------------
 * Relationship Assessment Engine v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Create one canonical, species-neutral assessment contract
 * containing:
 *
 * - environmental relationship support
 * - confidence in that relationship support
 * - canonical Species Knowledge Framework aliases
 * - explicit limitations and governance rules
 *
 * Relationship support and relationship confidence remain
 * separate concepts.
 *
 * This engine does not:
 * - infer biological significance
 * - infer species presence
 * - alter habitat scores
 * - alter model confidence
 * - alter opportunity-type resolution
 */
export function assessRelationships({
  relationshipContext = null,
  oceanEvidence = null,
  oceanOpportunity = null,
  dataQuality = null
} = {}) {
  const context =
    relationshipContext &&
    typeof relationshipContext ===
      "object"
      ? relationshipContext
      : buildRelationshipContext({
          oceanOpportunity,
          oceanEvidence
        });

  const relationshipSupport =
    context?.relationshipSupport ??
    {};

  const canonicalRelationshipAliases = {
    thermalStructure:
      "thermalStructure",

    oceanMovement:
      "oceanMovement",

    productivity:
      "productivityAndPreySupport",

    waterCharacter:
      "waterCharacter",

    structureInteraction:
      "structureInteraction",

    persistence:
      "persistence",

    openWaterOrganization:
      "openWaterOrganization"
  };

  const confidenceLevelForValue = (
    value
  ) => {
    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      return "insufficient";
    }

    if (value < 0.3) {
      return "low";
    }

    if (value < 0.55) {
      return "limited";
    }

    if (value < 0.75) {
      return "moderate";
    }

    return "high";
  };

  const rawDataQualityScore =
    Number.isFinite(
      dataQuality?.score
    )
      ? dataQuality.score
      : null;

  const normalizedDataQuality =
    rawDataQualityScore === null
      ? null
      : Math.max(
          0,
          Math.min(
            1,
            rawDataQualityScore > 1
              ? rawDataQualityScore / 100
              : rawDataQualityScore
          )
        );

  const relationships = {};

  for (
    const [
      relationshipName,
      support
    ]
    of Object.entries(
      relationshipSupport
    )
  ) {
    const status =
      support?.status ??
      "unresolved";

    const supported =
      support?.supported ===
      true;

    let confidenceValue = 0.2;

    const positiveDrivers = [];
    const negativeDrivers = [];
    const limitations = [];

    if (supported) {
      confidenceValue = 0.65;

      positiveDrivers.push(
        "relationship-supported-by-environmental-evidence"
      );
    } else if (
      status === "unavailable"
    ) {
      confidenceValue = 0.1;

      negativeDrivers.push(
        "relationship-evidence-unavailable"
      );

      limitations.push(
        "relationship-cannot-be-assessed-from-current-evidence"
      );
    } else {
      confidenceValue = 0.25;

      negativeDrivers.push(
        "relationship-support-unresolved"
      );

      limitations.push(
        "relationship-support-remains-unresolved"
      );
    }

    if (support?.source) {
      confidenceValue += 0.05;

      positiveDrivers.push(
        `relationship-source-${support.source}`
      );
    } else {
      limitations.push(
        "relationship-source-not-established"
      );
    }

    if (
      normalizedDataQuality !== null
    ) {
      confidenceValue =
        Math.min(
          confidenceValue,
          normalizedDataQuality
        );

      if (
        normalizedDataQuality <
        0.55
      ) {
        limitations.push(
          "relationship-confidence-limited-by-data-quality"
        );
      }
    } else {
      limitations.push(
        "data-quality-score-unavailable"
      );
    }

    confidenceValue =
      Number(
        Math.max(
          0,
          Math.min(
            1,
            confidenceValue
          )
        ).toFixed(2)
      );

    relationships[
      relationshipName
    ] = {
      relationship:
        relationshipName,

      canonicalRelationship:
        canonicalRelationshipAliases[
          relationshipName
        ] ??
        relationshipName,

      supported,

      supportStatus:
        status,

      source:
        support?.source ??
        null,

      confidence: {
        value:
          confidenceValue,

        level:
          confidenceLevelForValue(
            confidenceValue
          )
      },

      positiveDrivers: [
        ...new Set(
          positiveDrivers
        )
      ],

      negativeDrivers: [
        ...new Set(
          negativeDrivers
        )
      ],

      limitations: [
        ...new Set(
          limitations
        )
      ]
    };
  }

  const confidenceValues =
    Object.values(
      relationships
    )
      .map(
        relationship =>
          relationship
            ?.confidence
            ?.value
      )
      .filter(
        value =>
          Number.isFinite(value)
      );

  const overallConfidenceValue =
    confidenceValues.length > 0
      ? Number(
          (
            confidenceValues.reduce(
              (
                total,
                value
              ) =>
                total + value,
              0
            ) /
            confidenceValues.length
          ).toFixed(2)
        )
      : 0;

  const supportedCount =
    Object.values(
      relationships
    )
      .filter(
        relationship =>
          relationship
            ?.supported === true
      )
      .length;

  const unavailableCount =
    Object.values(
      relationships
    )
      .filter(
        relationship =>
          relationship
            ?.supportStatus ===
          "unavailable"
      )
      .length;

  const unresolvedCount =
    Object.values(
      relationships
    )
      .filter(
        relationship =>
          relationship
            ?.supportStatus ===
          "unresolved"
      )
      .length;

  const limitations = [
    "species-neutral-relationship-assessment",
    "relationship-confidence-is-not-biological-confidence",
    "relationship-confidence-is-not-species-probability",
    "relationship-confidence-does-not-confirm-fish-presence",
    "relationship-confidence-does-not-estimate-catch-probability",
    "relationship-assessment-does-not-change-habitat-scores",
    "relationship-assessment-does-not-change-model-confidence",
    "relationship-assessment-does-not-change-opportunity-resolution"
  ];

  if (
    unresolvedCount > 0
  ) {
    limitations.push(
      "one-or-more-relationships-remain-unresolved"
    );
  }

  if (
    unavailableCount > 0
  ) {
    limitations.push(
      "one-or-more-relationship-evidence-groups-are-unavailable"
    );
  }

  if (
    normalizedDataQuality ===
    null
  ) {
    limitations.push(
      "overall-data-quality-score-unavailable"
    );
  }

  const assessmentLimitations = [
    ...new Set(
      [
        ...limitations,

        ...(
          Array.isArray(
            context?.limitations
          )
            ? context.limitations
            : []
        )
      ]
    )
  ];


  const lineage =
    buildRelationshipAssessmentLineage({
      relationshipContext:
        context,

      oceanOpportunity,

      oceanEvidence,

      pathway:
        context?.pathway ??
        "insufficient-evidence",

      environmentType:
        context?.environmentType ??
        "unresolved",

      supportedCount,

      unavailableCount,

      unresolvedCount,

      assessedCount:
        confidenceValues.length,

      overallConfidence:
        overallConfidenceValue,

      limitations:
        assessmentLimitations
    });


  return {
    available:
      context?.available === true,

    pathway:
      context?.pathway ??
      "insufficient-evidence",

    environmentType:
      context?.environmentType ??
      "unresolved",

    relationshipContext:
      context,

    relationshipSupport,

    relationshipConfidence: {
      overall: {
        value:
          overallConfidenceValue,

        level:
          confidenceLevelForValue(
            overallConfidenceValue
          )
      },

      relationships,

      summary: {
        assessedCount:
          confidenceValues.length,

        supportedCount,

        unavailableCount,

        unresolvedCount
      },

      dataQualityContext: {
        available:
          normalizedDataQuality !==
          null,

        score:
          rawDataQualityScore,

        normalizedScore:
          normalizedDataQuality
      }
    },

    rules: {
      contextIsSpeciesNeutral:
        true,

      confidenceIsSpeciesNeutral:
        true,

      biologicalInferenceAllowed:
        false,

      changesHabitatScores:
        false,

      changesModelConfidence:
        false,

      changesOpportunityResolution:
        false,

      confirmsSpeciesPresence:
        false,

      estimatesCatchProbability:
        false
    },

    limitations:
      assessmentLimitations,

    lineage,

    interpretation:
      "species-neutral-relationship-assessment",

    methodVersion:
      "pelora-relationship-assessment-engine-v1.0"
  };
}


/**
 * ------------------------------------------------------------
 * Blue Marlin Habitat Suitability Model
 * ------------------------------------------------------------
 */
/**
 * ------------------------------------------------------------
 * Blue Marlin Pathway Lineage v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Preserve the governed evidence trace used to translate a
 * species-neutral relationship assessment into a conservative
 * Blue Marlin pathway interpretation.
 *
 * Relationship Assessment is the primary upstream reasoning
 * chain. Relationship Context remains visible as a secondary
 * direct dependency.
 *
 * This lineage is documentary only. It does not alter pathway
 * classification, plausible opportunity types, habitat scores,
 * confidence, biological interpretation, or opportunity-type
 * resolution.
 */
export function buildBlueMarlinPathwayLineage({
  relationshipAssessment = null,
  relationshipContext = null,
  classification =
    "insufficient-blue-marlin-pathway-evidence",
  pathway =
    "insufficient-evidence",
  environmentType =
    "unresolved",
  plausibleOpportunityTypes = [],
  supportedRelationships = [],
  limitations = []
} = {}) {
  return propagateEvidenceLineage({
    primaryUpstreamLineage:
      relationshipAssessment
        ?.lineage ??
      null,

    upstreamLineages: [
      relationshipContext
        ?.lineage ??
      null
    ],

    producedBy:
      "species-pathway",

    methodVersion:
      "pelora-blue-marlin-pathway-lineage-v1.0",

    evidenceProduced: [
      "blue-marlin-pathway-interpretation"
    ],

    inheritedLimitations:
      Array.isArray(
        limitations
      )
        ? limitations
        : [],

    inheritedWarnings:
      relationshipAssessment?.lineage
        ? []
        : [
            "primary-upstream-lineage-unavailable"
          ],

    components: {
      species:
        "blue-marlin",

      classification,

      pathway,

      environmentType,

      plausibleOpportunityTypes:
        Array.isArray(
          plausibleOpportunityTypes
        )
          ? [
              ...plausibleOpportunityTypes
            ]
          : [],

      supportedRelationships:
        Array.isArray(
          supportedRelationships
        )
          ? [
              ...supportedRelationships
            ]
          : []
    }
  });
}


/**
 * ------------------------------------------------------------
 * Blue Marlin Pathway Interpretation v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Translate species-neutral environmental relationship context
 * into conservative Blue Marlin opportunity interpretations.
 *
 * This engine identifies biologically plausible opportunity
 * types that may be consistent with the observed environmental
 * pathway.
 *
 * It does not confirm:
 * - Blue Marlin presence
 * - feeding
 * - prey concentration
 * - persistence
 * - catch probability
 * - fishing success
 *
 * It does not modify habitat scores or confidence.
 */
export function interpretBlueMarlinPathway({
  relationshipAssessment = null,
  relationshipContext = null
} = {}) {
  const context =
    relationshipContext ??
    relationshipAssessment
      ?.relationshipContext ??
    null;

  const pathway =
    context
      ?.pathway ??
    relationshipAssessment
      ?.pathway ??
    "insufficient-evidence";

  const environmentType =
    context
      ?.environmentType ??
    relationshipAssessment
      ?.environmentType ??
    "unresolved";

  const relationshipSupport =
    relationshipAssessment
      ?.relationshipSupport ??
    context
      ?.relationshipSupport ??
    {};

  const openWaterSupported =
    relationshipSupport
      ?.openWaterOrganization
      ?.supported === true;

  const structureSupported =
    relationshipSupport
      ?.structureInteraction
      ?.supported === true;

  const persistenceSupported =
    relationshipSupport
      ?.persistence
      ?.supported === true;

  let classification =
    "insufficient-blue-marlin-pathway-evidence";

  let plausibleOpportunityTypes = [];

  let interpretation =
    "The available environmental evidence does not yet support a Blue Marlin pathway interpretation.";

  const positiveDrivers = [];

  const limitations = [
    "blue-marlin-pathway-interpretation-is-preliminary",
    "does-not-confirm-blue-marlin-presence",
    "does-not-confirm-feeding",
    "does-not-confirm-prey-concentration",
    "does-not-estimate-catch-probability",
    "does-not-indicate-fishing-success",
    "does-not-change-habitat-scores",
    "does-not-change-model-confidence"
  ];

  if (
    pathway === "open-water" &&
    openWaterSupported
  ) {
    classification =
      "open-water-blue-marlin-opportunity-context";

    plausibleOpportunityTypes = [
      "current-convergence-feeding-pocket",
      "feeding-corridor",
      "eddy-edge-opportunity",
      "productive-water-boundary",
      "open-water-prey-aggregation"
    ];

    interpretation =
      "The environmental pathway is consistent with one or more open-water Blue Marlin opportunity types, but the specific feature and its biological use remain unconfirmed.";

    positiveDrivers.push(
      "species-neutral-open-water-organization-supported"
    );
  } else if (
    pathway === "structure-associated" &&
    structureSupported
  ) {
    classification =
      "structure-associated-blue-marlin-opportunity-context";

    plausibleOpportunityTypes = [
      "bathymetric-interaction-zone"
    ];

    interpretation =
      "The environmental pathway is consistent with a possible Blue Marlin bathymetric interaction zone, but structure interaction, prey response, and fish use remain unconfirmed.";

    positiveDrivers.push(
      "species-neutral-structure-association-supported"
    );
  } else if (
    pathway === "combined" &&
    openWaterSupported &&
    structureSupported
  ) {
    classification =
      "combined-blue-marlin-opportunity-context";

    plausibleOpportunityTypes = [
      "bathymetric-interaction-zone",
      "current-convergence-feeding-pocket",
      "feeding-corridor",
      "eddy-edge-opportunity",
      "productive-water-boundary",
      "open-water-prey-aggregation"
    ];

    interpretation =
      "The environmental pathway is consistent with a possible structure-enhanced open-water Blue Marlin opportunity, but the feature type, prey response, persistence, and biological use remain unconfirmed.";

    positiveDrivers.push(
      "species-neutral-open-water-organization-supported",
      "species-neutral-structure-association-supported"
    );
  } else if (
    pathway ===
      "environmental-feature-unclassified"
  ) {
    classification =
      "unclassified-blue-marlin-environmental-feature-context";

    interpretation =
      "An environmental feature candidate is present, but its pathway is not sufficiently resolved to identify a plausible Blue Marlin opportunity type.";

    limitations.push(
      "environmental-pathway-not-resolved"
    );
  } else {
    limitations.push(
      "environmental-opportunity-pathway-not-established"
    );
  }

  if (!persistenceSupported) {
    limitations.push(
      "feature-persistence-not-established"
    );
  }

  const pathwayLimitations = [
    ...new Set(
      limitations
        .filter(Boolean)
    )
  ];


  const supportedRelationships = [
    ...(
      openWaterSupported
        ? [
            "openWaterOrganization"
          ]
        : []
    ),

    ...(
      structureSupported
        ? [
            "structureInteraction"
          ]
        : []
    ),

    ...(
      persistenceSupported
        ? [
            "persistence"
          ]
        : []
    )
  ];


  const lineage =
    buildBlueMarlinPathwayLineage({
      relationshipAssessment,

      relationshipContext:
        context,

      classification,

      pathway,

      environmentType,

      plausibleOpportunityTypes,

      supportedRelationships,

      limitations:
        pathwayLimitations
    });


  return {
    available:
      plausibleOpportunityTypes
        .length > 0,

    species:
      "blue-marlin",

    environmentalPathway:
      pathway,

    environmentType,

    classification,

    plausibleOpportunityTypes,

    confirmedOpportunityType:
      null,

    relationshipSupport: {
      openWaterOrganization:
        openWaterSupported,

      structureInteraction:
        structureSupported,

      persistence:
        persistenceSupported
    },

    positiveDrivers,

    limitations:
      pathwayLimitations,

    lineage,

    interpretation,

    rules: {
      speciesSpecificInterpretation:
        true,

      biologicalInferenceAllowed:
        false,

      confirmedOpportunityTypeAllowed:
        false,

      changesHabitatScores:
        false,

      changesConfidence:
        false,

      structureRequired:
        false
    },

    methodVersion:
      "pelora-blue-marlin-pathway-interpretation-v1.0"
  };
}


/**
 * ------------------------------------------------------------
 * Blue Marlin Opportunity Type Resolution v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Rank biologically plausible Blue Marlin opportunity types
 * using species-neutral environmental evidence and the
 * Blue Marlin pathway interpretation.
 *
 * This engine may identify a leading candidate when the
 * available evidence differentiates one opportunity type
 * from the others.
 *
 * It does not:
 * - confirm an opportunity type
 * - confirm Blue Marlin presence
 * - confirm feeding
 * - confirm prey concentration
 * - estimate catch probability
 * - modify habitat scores
 * - modify confidence
 */
/**
 * ------------------------------------------------------------
 * Blue Marlin Opportunity Type Knowledge Profile v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Store Blue Marlin-specific opportunity-type relationships
 * separately from the generic resolution engine.
 *
 * The profile contains interpretation weights only.
 *
 * It does not:
 * - confirm biological activity
 * - confirm fish presence
 * - change habitat scoring
 * - change model confidence
 */
/**
 * ------------------------------------------------------------
 * Species Knowledge Framework v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Define the governed vocabulary and validation rules used by
 * Pelora species knowledge profiles.
 *
 * The framework separates:
 *
 * - species-neutral environmental evidence
 * - species-specific ecological interpretation
 * - generic software resolution mechanics
 *
 * Importance levels express relative ecological relevance.
 * Numeric values remain an internal resolver implementation
 * detail and are not presented as scientific measurements.
 */


/**
 * Governed relationship-importance vocabulary.
 *
 * unavailable:
 * The relationship is not used by this species profile.
 *
 * supporting:
 * The signal may strengthen an interpretation but should not
 * independently establish the opportunity type.
 *
 * moderate:
 * The relationship is meaningful but normally requires other
 * supporting evidence.
 *
 * strong:
 * The relationship is a major component of the opportunity.
 *
 * critical:
 * The opportunity type should rarely be interpreted without
 * this relationship.
 */
export const SPECIES_RELATIONSHIP_IMPORTANCE = {
  unavailable:
    0,

  supporting:
    1,

  moderate:
    2,

  strong:
    3,

  critical:
    5
};


/**
 * Canonical Pelora species knowledge-profile schema.
 *
 * Profiles may contain additional governed fields in future
 * versions, but every profile must preserve this foundation.
 */
/**
 * ------------------------------------------------------------
 * Species Knowledge Provenance and Governance v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Record why Pelora holds a species relationship, how mature
 * the supporting knowledge is, where it applies, and what
 * review remains necessary.
 *
 * Provenance describes knowledge governance only.
 *
 * It does not:
 * - prove biological behavior
 * - confirm fish presence
 * - confirm feeding
 * - change habitat scores
 * - change model confidence
 */
export const SPECIES_KNOWLEDGE_PROVENANCE = {
  allowedEvidenceStatuses: [
    "hypothesis",
    "provisional",
    "reviewed",
    "validated"
  ],

  allowedSourceTypes: [
    "expert-knowledge",
    "peer-reviewed-research",
    "government-dataset",
    "observational-study",
    "captain-observation",
    "pelora-derived-hypothesis",
    "mixed-evidence"
  ],

  allowedRegionalScopes: [
    "global",
    "ocean-basin",
    "regional",
    "local",
    "unknown"
  ],

  allowedSeasonalScopes: [
    "year-round",
    "seasonal",
    "event-dependent",
    "unknown"
  ],

  requiredFields: [
    "rationale",
    "evidenceStatus",
    "sourceType",
    "references",
    "reviewedBy",
    "lastReviewedAt",
    "regionalScope",
    "seasonalScope",
    "limitations"
  ],

  methodVersion:
    "pelora-species-knowledge-provenance-v1.0"
};


/**
 * Validate an individual knowledge-provenance record.
 *
 * Empty references and review history are allowed while a
 * relationship remains provisional, but they must be disclosed.
 */
export function validateKnowledgeProvenance(
  provenance,
  {
    path = "knowledge-provenance"
  } = {}
) {
  const errors = [];

  const warnings = [];

  if (
    !provenance ||
    typeof provenance !== "object" ||
    Array.isArray(provenance)
  ) {
    return {
      valid:
        false,

      errors: [
        `${path}:provenance-must-be-an-object`
      ],

      warnings: [],

      methodVersion:
        "pelora-knowledge-provenance-validation-v1.0"
    };
  }

  for (
    const field
    of SPECIES_KNOWLEDGE_PROVENANCE
      .requiredFields
  ) {
    if (
      !Object.prototype.hasOwnProperty.call(
        provenance,
        field
      )
    ) {
      errors.push(
        `${path}:missing-provenance-field:${field}`
      );
    }
  }

  if (
    typeof provenance.rationale !== "string" ||
    provenance.rationale.trim().length < 20
  ) {
    errors.push(
      `${path}:rationale-must-be-descriptive`
    );
  }

  if (
    !SPECIES_KNOWLEDGE_PROVENANCE
      .allowedEvidenceStatuses
      .includes(
        provenance.evidenceStatus
      )
  ) {
    errors.push(
      `${path}:invalid-evidence-status`
    );
  }

  if (
    !SPECIES_KNOWLEDGE_PROVENANCE
      .allowedSourceTypes
      .includes(
        provenance.sourceType
      )
  ) {
    errors.push(
      `${path}:invalid-source-type`
    );
  }

  if (
    !SPECIES_KNOWLEDGE_PROVENANCE
      .allowedRegionalScopes
      .includes(
        provenance.regionalScope
      )
  ) {
    errors.push(
      `${path}:invalid-regional-scope`
    );
  }

  if (
    !SPECIES_KNOWLEDGE_PROVENANCE
      .allowedSeasonalScopes
      .includes(
        provenance.seasonalScope
      )
  ) {
    errors.push(
      `${path}:invalid-seasonal-scope`
    );
  }

  for (
    const arrayField
    of [
      "references",
      "reviewedBy",
      "limitations"
    ]
  ) {
    if (
      !Array.isArray(
        provenance[arrayField]
      )
    ) {
      errors.push(
        `${path}:${arrayField}-must-be-an-array`
      );
    }
  }

  if (
    provenance.lastReviewedAt !== null &&
    (
      typeof provenance.lastReviewedAt !==
        "string" ||
      Number.isNaN(
        Date.parse(
          provenance.lastReviewedAt
        )
      )
    )
  ) {
    errors.push(
      `${path}:last-reviewed-at-must-be-null-or-iso-date`
    );
  }

  if (
    (
      provenance.evidenceStatus ===
        "reviewed" ||
      provenance.evidenceStatus ===
        "validated"
    ) &&
    (
      !Array.isArray(
        provenance.reviewedBy
      ) ||
      provenance.reviewedBy.length === 0
    )
  ) {
    errors.push(
      `${path}:reviewed-status-requires-reviewer`
    );
  }

  if (
    provenance.evidenceStatus ===
      "validated" &&
    (
      !Array.isArray(
        provenance.references
      ) ||
      provenance.references.length === 0
    )
  ) {
    errors.push(
      `${path}:validated-status-requires-reference`
    );
  }

  if (
    Array.isArray(
      provenance.references
    ) &&
    provenance.references.length === 0
  ) {
    warnings.push(
      `${path}:no-scientific-references-recorded`
    );
  }

  if (
    Array.isArray(
      provenance.reviewedBy
    ) &&
    provenance.reviewedBy.length === 0
  ) {
    warnings.push(
      `${path}:not-yet-formally-reviewed`
    );
  }

  if (
    provenance.regionalScope ===
      "global" &&
    provenance.evidenceStatus ===
      "hypothesis"
  ) {
    warnings.push(
      `${path}:global-scope-hypothesis-requires-caution`
    );
  }

  return {
    valid:
      errors.length === 0,

    evidenceStatus:
      provenance.evidenceStatus ??
      null,

    sourceType:
      provenance.sourceType ??
      null,

    regionalScope:
      provenance.regionalScope ??
      null,

    seasonalScope:
      provenance.seasonalScope ??
      null,

    errors: [
      ...new Set(errors)
    ],

    warnings: [
      ...new Set(warnings)
    ],

    methodVersion:
      "pelora-knowledge-provenance-validation-v1.0"
  };
}


export const SPECIES_KNOWLEDGE_FRAMEWORK = {
  requiredProfileFields: [
    "species",
    "commonName",
    "scientificName",
    "knowledgeStatus",
    "habitatPurpose",
    "knowledgeProvenance",
    "relationshipGroups",
    "opportunityTypes",
    "confidencePolicy",
    "rules",
    "methodVersion"
  ],

  allowedKnowledgeStatuses: [
    "provisional",
    "reviewed",
    "validated"
  ],

  allowedImportanceLevels:
    Object.keys(
      SPECIES_RELATIONSHIP_IMPORTANCE
    ),

  requiredRelationshipGroups: [
    "oceanMovement",
    "thermalStructure",
    "productivityAndPreySupport",
    "waterCharacter",
    "structureInteraction",
    "persistence"
  ],

  requiredRules: {
    biologicalInferenceAllowed:
      false,

    confirmedTypeAllowed:
      false,

    changesHabitatScores:
      false
  },

  provenanceRequired:
    true,

  relationshipProvenanceRequired:
    true,

  opportunityTypeProvenanceRequired:
    true,

  methodVersion:
    "pelora-species-knowledge-framework-v1.1"
};



/**
 * ------------------------------------------------------------
 * Confidence Governance Framework v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Define the canonical language, scales, propagation rules,
 * validation requirements, and scientific safeguards governing
 * confidence throughout Pelora.
 *
 * Confidence describes support for observations or interpretations.
 *
 * It does not:
 * - estimate catch probability
 * - confirm fish presence
 * - confirm feeding
 * - prove biological behavior
 * - modify an existing confidence score
 * - modify habitat or opportunity scoring
 */
export const CONFIDENCE_DOMAINS = {
  data:
    "data",

  evidence:
    "evidence",

  opportunity:
    "opportunity",

  relationship:
    "relationship",

  model:
    "model"
};


export const CONFIDENCE_LEVELS = [
  "Unavailable",
  "Very Low",
  "Low",
  "Moderate",
  "High",
  "Very High"
];


export const CONFIDENCE_SCALES = {
  normalized: {
    minimum: 0,
    maximum: 1
  },

  percentage: {
    minimum: 0,
    maximum: 100
  }
};


export const CONFIDENCE_GOVERNANCE_RULES = {
  confidenceMayPropagate:
    true,

  confidenceMayDecrease:
    true,

  confidenceMayIncreaseOnlyWithIndependentEvidence:
    true,

  missingEvidenceReducesConfidenceNotSuitability:
    true,

  environmentalConfidenceIsNotBiologicalConfidence:
    true,

  confidenceIsNotCatchProbability:
    true,

  changesExistingConfidenceScores:
    false,

  changesHabitatScores:
    false,

  changesOpportunityScores:
    false
};


export const CONFIDENCE_GOVERNANCE_FRAMEWORK = {
  domains:
    Object.values(
      CONFIDENCE_DOMAINS
    ),

  levels:
    CONFIDENCE_LEVELS,

  scales:
    CONFIDENCE_SCALES,

  requiredFields: [
    "domain",
    "score",
    "scale",
    "level",
    "reasons",
    "limitations",
    "methodVersion"
  ],

  optionalFields: [
    "derivedFrom",
    "components"
  ],

  independentEvidenceReason:
    "independent-evidence-added",

  rules:
    CONFIDENCE_GOVERNANCE_RULES,

  methodVersion:
    "pelora-confidence-governance-framework-v1.0"
};


/**
 * Convert either of Pelora's governed confidence scales into
 * a common normalized value without changing the source score.
 */
export function normalizeConfidenceScore(
  score,
  scale
) {
  if (
    !Number.isFinite(score) ||
    !Object.prototype.hasOwnProperty.call(
      CONFIDENCE_SCALES,
      scale
    )
  ) {
    return null;
  }

  const scaleDefinition =
    CONFIDENCE_SCALES[
      scale
    ];

  if (
    score <
      scaleDefinition.minimum ||
    score >
      scaleDefinition.maximum
  ) {
    return null;
  }

  if (
    scale ===
      "percentage"
  ) {
    return Number(
      (
        score / 100
      ).toFixed(4)
    );
  }

  return Number(
    score.toFixed(4)
  );
}


/**
 * Resolve Pelora's canonical confidence label from a governed
 * confidence score and scale.
 */
export function confidenceLevelForScore(
  score,
  scale
) {
  const normalizedScore =
    normalizeConfidenceScore(
      score,
      scale
    );

  if (
    normalizedScore === null ||
    normalizedScore === 0
  ) {
    return "Unavailable";
  }

  if (
    normalizedScore < 0.2
  ) {
    return "Very Low";
  }

  if (
    normalizedScore < 0.4
  ) {
    return "Low";
  }

  if (
    normalizedScore < 0.7
  ) {
    return "Moderate";
  }

  if (
    normalizedScore < 0.9
  ) {
    return "High";
  }

  return "Very High";
}


/**
 * Validate a confidence contract against Pelora's governed
 * vocabulary and propagation safeguards.
 *
 * Validation is observational only. It does not rewrite,
 * increase, decrease, or otherwise modify confidence.
 */
export function validateConfidenceContract(
  confidence,
  {
    path =
      "confidence"
  } = {}
) {
  const errors = [];
  const warnings = [];

  if (
    !confidence ||
    typeof confidence !==
      "object" ||
    Array.isArray(
      confidence
    )
  ) {
    return {
      valid:
        false,

      errors: [
        `${path}:confidence-must-be-an-object`
      ],

      warnings: [],

      normalizedScore:
        null,

      canonicalLevel:
        null,

      methodVersion:
        "pelora-confidence-contract-validation-v1.0"
    };
  }

  for (
    const field
    of CONFIDENCE_GOVERNANCE_FRAMEWORK
      .requiredFields
  ) {
    if (
      !Object.prototype.hasOwnProperty.call(
        confidence,
        field
      )
    ) {
      errors.push(
        `${path}:missing-confidence-field:${field}`
      );
    }
  }

  if (
    !CONFIDENCE_GOVERNANCE_FRAMEWORK
      .domains
      .includes(
        confidence.domain
      )
  ) {
    errors.push(
      `${path}:invalid-confidence-domain`
    );
  }

  if (
    !Object.prototype.hasOwnProperty.call(
      CONFIDENCE_SCALES,
      confidence.scale
    )
  ) {
    errors.push(
      `${path}:invalid-confidence-scale`
    );
  }

  if (
    !Number.isFinite(
      confidence.score
    )
  ) {
    errors.push(
      `${path}:confidence-score-must-be-finite`
    );
  }

  const normalizedScore =
    normalizeConfidenceScore(
      confidence.score,
      confidence.scale
    );

  if (
    Number.isFinite(
      confidence.score
    ) &&
    Object.prototype.hasOwnProperty.call(
      CONFIDENCE_SCALES,
      confidence.scale
    ) &&
    normalizedScore === null
  ) {
    errors.push(
      `${path}:confidence-score-outside-declared-scale`
    );
  }

  const canonicalLevel =
    normalizedScore === null
      ? null
      : confidenceLevelForScore(
          confidence.score,
          confidence.scale
        );

  if (
    !CONFIDENCE_LEVELS.includes(
      confidence.level
    )
  ) {
    errors.push(
      `${path}:invalid-confidence-level`
    );
  } else if (
    canonicalLevel !== null &&
    confidence.level !==
      canonicalLevel
  ) {
    errors.push(
      `${path}:confidence-level-does-not-match-score`
    );
  }

  if (
    !Array.isArray(
      confidence.reasons
    )
  ) {
    errors.push(
      `${path}:reasons-must-be-an-array`
    );
  }

  if (
    !Array.isArray(
      confidence.limitations
    )
  ) {
    errors.push(
      `${path}:limitations-must-be-an-array`
    );
  }

  if (
    typeof confidence.methodVersion !==
      "string" ||
    confidence.methodVersion
      .trim()
      .length === 0
  ) {
    errors.push(
      `${path}:method-version-required`
    );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      confidence,
      "components"
    ) &&
    (
      !confidence.components ||
      typeof confidence.components !==
        "object" ||
      Array.isArray(
        confidence.components
      )
    )
  ) {
    errors.push(
      `${path}:components-must-be-an-object`
    );
  }

  const derivedFrom =
    confidence.derivedFrom;

  if (
    derivedFrom !== undefined &&
    !Array.isArray(
      derivedFrom
    )
  ) {
    errors.push(
      `${path}:derived-from-must-be-an-array`
    );
  }

  const validParentScores = [];

  if (
    Array.isArray(
      derivedFrom
    )
  ) {
    derivedFrom.forEach(
      (
        parent,
        index
      ) => {
        const parentPath =
          `${path}:derived-from:${index}`;

        if (
          !parent ||
          typeof parent !==
            "object" ||
          Array.isArray(
            parent
          )
        ) {
          errors.push(
            `${parentPath}:must-be-an-object`
          );

          return;
        }

        if (
          !CONFIDENCE_GOVERNANCE_FRAMEWORK
            .domains
            .includes(
              parent.domain
            )
        ) {
          errors.push(
            `${parentPath}:invalid-confidence-domain`
          );
        }

        if (
          !Object.prototype.hasOwnProperty.call(
            CONFIDENCE_SCALES,
            parent.scale
          )
        ) {
          errors.push(
            `${parentPath}:invalid-confidence-scale`
          );
        }

        const parentNormalizedScore =
          normalizeConfidenceScore(
            parent.score,
            parent.scale
          );

        if (
          parentNormalizedScore ===
            null
        ) {
          errors.push(
            `${parentPath}:invalid-confidence-score`
          );
        } else {
          validParentScores.push(
            parentNormalizedScore
          );
        }
      }
    );
  }

  if (
    normalizedScore !== null &&
    validParentScores.length > 0
  ) {
    const highestParentScore =
      Math.max(
        ...validParentScores
      );

    const hasIndependentEvidenceDisclosure =
      Array.isArray(
        confidence.reasons
      ) &&
      confidence.reasons.includes(
        CONFIDENCE_GOVERNANCE_FRAMEWORK
          .independentEvidenceReason
      );

    if (
      normalizedScore >
        highestParentScore &&
      !hasIndependentEvidenceDisclosure
    ) {
      errors.push(
        `${path}:unexplained-confidence-increase`
      );
    }

    if (
      normalizedScore >
        highestParentScore &&
      hasIndependentEvidenceDisclosure
    ) {
      warnings.push(
        `${path}:confidence-increase-requires-independent-evidence-review`
      );
    }
  }

  if (
    Array.isArray(
      confidence.reasons
    ) &&
    confidence.reasons.length === 0
  ) {
    warnings.push(
      `${path}:no-confidence-reasons-recorded`
    );
  }

  if (
    Array.isArray(
      confidence.limitations
    ) &&
    confidence.limitations.length === 0
  ) {
    warnings.push(
      `${path}:no-confidence-limitations-recorded`
    );
  }

  return {
    valid:
      errors.length === 0,

    domain:
      confidence.domain ??
      null,

    scale:
      confidence.scale ??
      null,

    normalizedScore,

    canonicalLevel,

    errors: [
      ...new Set(
        errors
      )
    ],

    warnings: [
      ...new Set(
        warnings
      )
    ],

    methodVersion:
      "pelora-confidence-contract-validation-v1.0"
  };
}



/**
 * ------------------------------------------------------------
 * Evidence Lineage and Traceability Framework v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Record how a Pelora conclusion was produced, which upstream
 * contracts contributed to it, which evidence was used, which
 * evidence was unavailable, and which limitations or warnings
 * propagated through the reasoning chain.
 *
 * Lineage is documentation only.
 *
 * It does not:
 * - alter evidence
 * - alter confidence
 * - alter opportunity classification
 * - alter habitat suitability
 * - infer biological behavior
 * - confirm fish presence
 * - confirm feeding
 */
export const LINEAGE_ENGINE_TYPES = [
  "data-assessment",
  "ocean-evidence",
  "environmental-opportunity",
  "ocean-opportunity",
  "ocean-signal-selection",
  "relationship-context",
  "relationship-assessment",
  "species-pathway",
  "opportunity-type",
  "habitat-suitability",
  "ocean-physics-explainability"
];


export const LINEAGE_GOVERNANCE_RULES = {
  lineageMayExplainReasoning:
    true,

  lineageMayChangeReasoning:
    false,

  lineageMayChangeConfidence:
    false,

  lineageMayChangeScores:
    false,

  lineageMayInferBiology:
    false,

  missingEvidenceMustRemainVisible:
    true,

  inheritedLimitationsMustRemainVisible:
    true,

  upstreamMethodVersionsMustBePreserved:
    true
};


export const EVIDENCE_LINEAGE_FRAMEWORK = {
  requiredFields: [
    "upstream",
    "observationsUsed",
    "observationsUnavailable",
    "evidenceProduced",
    "inheritedLimitations",
    "inheritedWarnings",
    "producedBy",
    "methodVersion"
  ],

  optionalFields: [
    "traceId",
    "components"
  ],

  allowedProducedBy:
    LINEAGE_ENGINE_TYPES,

  requiredUpstreamFields: [
    "engine",
    "methodVersion"
  ],

  rules:
    LINEAGE_GOVERNANCE_RULES,

  methodVersion:
    "pelora-evidence-lineage-framework-v1.1"
};


/**
 * Validate a governed upstream lineage reference.
 */
export function validateLineageUpstreamReference(
  reference,
  {
    path =
      "lineage:upstream"
  } = {}
) {
  const errors = [];
  const warnings = [];

  if (
    !reference ||
    typeof reference !==
      "object" ||
    Array.isArray(
      reference
    )
  ) {
    return {
      valid:
        false,

      errors: [
        `${path}:reference-must-be-an-object`
      ],

      warnings: [],

      methodVersion:
        "pelora-lineage-upstream-validation-v1.0"
    };
  }

  for (
    const field
    of EVIDENCE_LINEAGE_FRAMEWORK
      .requiredUpstreamFields
  ) {
    if (
      !Object.prototype.hasOwnProperty.call(
        reference,
        field
      )
    ) {
      errors.push(
        `${path}:missing-upstream-field:${field}`
      );
    }
  }

  if (
    !LINEAGE_ENGINE_TYPES.includes(
      reference.engine
    )
  ) {
    errors.push(
      `${path}:invalid-upstream-engine`
    );
  }

  if (
    typeof reference.methodVersion !==
      "string" ||
    reference.methodVersion
      .trim()
      .length === 0
  ) {
    errors.push(
      `${path}:upstream-method-version-required`
    );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      reference,
      "traceId"
    ) &&
    (
      typeof reference.traceId !==
        "string" ||
      reference.traceId
        .trim()
        .length === 0
    )
  ) {
    errors.push(
      `${path}:trace-id-must-be-a-nonempty-string`
    );
  }

  return {
    valid:
      errors.length === 0,

    engine:
      reference.engine ??
      null,

    methodVersion:
      reference.methodVersion ??
      null,

    errors: [
      ...new Set(
        errors
      )
    ],

    warnings: [
      ...new Set(
        warnings
      )
    ],

    validationMethodVersion:
      "pelora-lineage-upstream-validation-v1.0"
  };
}




/**
 * ------------------------------------------------------------
 * Lineage Propagation Framework v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Extend a valid upstream lineage contract through a downstream
 * engine without reconstructing, rewriting, or changing the
 * scientific reasoning already recorded upstream.
 *
 * Propagation is documentary only.
 *
 * It may:
 * - preserve upstream observation records
 * - preserve unavailable observations
 * - preserve inherited limitations and warnings
 * - append newly produced evidence
 * - record the immediate upstream engine and method version
 *
 * It may not:
 * - alter evidence
 * - alter confidence
 * - alter scores
 * - alter classifications
 * - infer biology
 * - silently trust malformed lineage
 */

export const LINEAGE_PROPAGATION_FRAMEWORK = {
  requiredUpstreamFields: [
    "producedBy",
    "methodVersion",
    "observationsUsed",
    "observationsUnavailable",
    "evidenceProduced",
    "inheritedLimitations",
    "inheritedWarnings"
  ],

  rules: {
    upstreamValidationRequired:
      true,

    observationsRemainImmutable:
      true,

    unavailableObservationsRemainVisible:
      true,

    producedEvidenceMayBeAppended:
      true,

    inheritedLimitationsRemainVisible:
      true,

    inheritedWarningsRemainVisible:
      true,

    malformedUpstreamLineageMayNotBeTrusted:
      true,

    changesEvidence:
      false,

    changesConfidence:
      false,

    changesScores:
      false,

    changesClassifications:
      false,

    biologicalInferenceAllowed:
      false
  },

  methodVersion:
    "pelora-lineage-propagation-framework-v2.0"
};


/**
 * Create a stable immediate-upstream reference from a valid
 * lineage contract.
 */
export function buildLineageUpstreamReference(
  lineage
) {
  const validation =
    validateEvidenceLineage(
      lineage
    );

  if (!validation.valid) {
    return null;
  }

  return {
    engine:
      lineage.producedBy,

    methodVersion:
      lineage.methodVersion,

    ...(
      typeof lineage.traceId ===
        "string" &&
      lineage.traceId
        .trim()
        .length > 0
        ? {
            traceId:
              lineage.traceId
          }
        : {}
    )
  };
}


/**
 * Propagate a governed lineage contract into a downstream
 * scientific engine.
 *
 * Invalid or absent upstream lineage is not copied. Instead, the
 * downstream record remains valid and explicitly discloses the
 * missing or invalid upstream trace.
 */
export function propagateEvidenceLineage({
  upstreamLineage = null,
  upstreamLineages = [],
  primaryUpstreamLineage = null,
  producedBy,
  methodVersion,
  evidenceProduced = [],
  inheritedLimitations = [],
  inheritedWarnings = [],
  components = null,
  traceId = null
} = {}) {
  const propagationWarnings = [];

  /*
   * Preserve the original single-upstream API while supporting
   * governed multi-parent lineage.
   *
   * Ordering establishes documentary priority only:
   *
   * 1. Explicit primary upstream lineage
   * 2. Legacy upstreamLineage argument
   * 3. Additional upstreamLineages
   *
   * Ordering does not change scientific reasoning.
   */
  const candidates = [];

  if (primaryUpstreamLineage) {
    candidates.push({
      lineage:
        primaryUpstreamLineage,

      role:
        "primary",

      path:
        "primaryUpstreamLineage"
    });
  }

  if (upstreamLineage) {
    candidates.push({
      lineage:
        upstreamLineage,

      role:
        primaryUpstreamLineage
          ? "secondary"
          : "primary",

      path:
        "upstreamLineage"
    });
  }

  if (
    upstreamLineages !== null &&
    upstreamLineages !== undefined &&
    !Array.isArray(
      upstreamLineages
    )
  ) {
    propagationWarnings.push(
      "upstream-lineages-must-be-an-array"
    );
  }

  if (
    Array.isArray(
      upstreamLineages
    )
  ) {
    upstreamLineages.forEach(
      (
        lineage,
        index
      ) => {
        if (!lineage) {
          propagationWarnings.push(
            `secondary-upstream-lineage-unavailable:${index}`
          );

          return;
        }

        candidates.push({
          lineage,

          role:
            candidates.length === 0
              ? "primary"
              : "secondary",

          path:
            `upstreamLineages:${index}`
        });
      }
    );
  }

  if (candidates.length === 0) {
    propagationWarnings.push(
      "upstream-lineage-unavailable"
    );
  }

  const upstreamReferences = [];

  const observationsUsed = [];
  const observationsUnavailable = [];
  const upstreamEvidenceProduced = [];
  const upstreamLimitations = [];
  const upstreamWarnings = [];

  const acceptedReferenceKeys =
    new Set();

  for (
    const candidate
    of candidates
  ) {
    const validation =
      validateEvidenceLineage(
        candidate.lineage,
        {
          path:
            candidate.path
        }
      );

    if (!validation.valid) {
      propagationWarnings.push(
        "upstream-lineage-invalid"
      );

      if (
        candidate.role ===
        "primary"
      ) {
        propagationWarnings.push(
          "primary-upstream-lineage-invalid"
        );
      } else {
        propagationWarnings.push(
          "secondary-upstream-lineage-invalid"
        );
      }

      propagationWarnings.push(
        ...validation.errors.map(
          error =>
            `upstream-validation:${error}`
        )
      );

      continue;
    }

    const reference =
      buildLineageUpstreamReference(
        candidate.lineage
      );

    if (!reference) {
      propagationWarnings.push(
        "upstream-reference-unavailable"
      );

      continue;
    }

    const referenceKey =
      [
        reference.engine,
        reference.methodVersion,
        reference.traceId ??
          ""
      ].join("|");

    if (
      acceptedReferenceKeys.has(
        referenceKey
      )
    ) {
      propagationWarnings.push(
        "duplicate-upstream-lineage-ignored"
      );

      continue;
    }

    acceptedReferenceKeys.add(
      referenceKey
    );

    upstreamReferences.push(
      reference
    );

    if (
      Array.isArray(
        candidate.lineage
          .observationsUsed
      )
    ) {
      observationsUsed.push(
        ...candidate.lineage
          .observationsUsed
      );
    }

    if (
      Array.isArray(
        candidate.lineage
          .observationsUnavailable
      )
    ) {
      observationsUnavailable.push(
        ...candidate.lineage
          .observationsUnavailable
      );
    }

    if (
      Array.isArray(
        candidate.lineage
          .evidenceProduced
      )
    ) {
      upstreamEvidenceProduced.push(
        ...candidate.lineage
          .evidenceProduced
      );
    }

    if (
      Array.isArray(
        candidate.lineage
          .inheritedLimitations
      )
    ) {
      upstreamLimitations.push(
        ...candidate.lineage
          .inheritedLimitations
      );
    }

    if (
      Array.isArray(
        candidate.lineage
          .inheritedWarnings
      )
    ) {
      upstreamWarnings.push(
        ...candidate.lineage
          .inheritedWarnings
      );
    }
  }

  const cleanUniqueStrings = (
    values
  ) => [
    ...new Set(
      values.filter(
        value =>
          typeof value ===
            "string" &&
          value.trim().length >
            0
      )
    )
  ];

  const lineage = {
    upstream:
      upstreamReferences,

    observationsUsed:
      cleanUniqueStrings(
        observationsUsed
      ),

    observationsUnavailable:
      cleanUniqueStrings(
        observationsUnavailable
      ),

    evidenceProduced:
      cleanUniqueStrings([
        ...upstreamEvidenceProduced,

        ...(
          Array.isArray(
            evidenceProduced
          )
            ? evidenceProduced
            : []
        )
      ]),

    inheritedLimitations:
      cleanUniqueStrings([
        ...upstreamLimitations,

        ...(
          Array.isArray(
            inheritedLimitations
          )
            ? inheritedLimitations
            : []
        )
      ]),

    inheritedWarnings:
      cleanUniqueStrings([
        ...upstreamWarnings,
        ...propagationWarnings,

        ...(
          Array.isArray(
            inheritedWarnings
          )
            ? inheritedWarnings
            : []
        )
      ]),

    producedBy,

    methodVersion
  };

  if (
    components &&
    typeof components ===
      "object" &&
    !Array.isArray(
      components
    )
  ) {
    lineage.components =
      components;
  }

  if (
    typeof traceId ===
      "string" &&
    traceId.trim().length >
      0
  ) {
    lineage.traceId =
      traceId;
  }

  return lineage;
}


/**
 * Validate an Evidence Lineage and Traceability contract.
 *
 * Validation is observational only. It does not modify the
 * conclusion, upstream contracts, evidence, confidence, or
 * scientific interpretation.
 */
export function validateEvidenceLineage(
  lineage,
  {
    path =
      "lineage"
  } = {}
) {
  const errors = [];
  const warnings = [];

  if (
    !lineage ||
    typeof lineage !==
      "object" ||
    Array.isArray(
      lineage
    )
  ) {
    return {
      valid:
        false,

      errors: [
        `${path}:lineage-must-be-an-object`
      ],

      warnings: [],

      methodVersion:
        "pelora-evidence-lineage-validation-v1.0"
    };
  }

  for (
    const field
    of EVIDENCE_LINEAGE_FRAMEWORK
      .requiredFields
  ) {
    if (
      !Object.prototype.hasOwnProperty.call(
        lineage,
        field
      )
    ) {
      errors.push(
        `${path}:missing-lineage-field:${field}`
      );
    }
  }

  const arrayFields = [
    "upstream",
    "observationsUsed",
    "observationsUnavailable",
    "evidenceProduced",
    "inheritedLimitations",
    "inheritedWarnings"
  ];

  for (
    const field
    of arrayFields
  ) {
    if (
      !Array.isArray(
        lineage[field]
      )
    ) {
      errors.push(
        `${path}:${field}-must-be-an-array`
      );
    }
  }

  if (
    !LINEAGE_ENGINE_TYPES.includes(
      lineage.producedBy
    )
  ) {
    errors.push(
      `${path}:invalid-produced-by`
    );
  }

  if (
    typeof lineage.methodVersion !==
      "string" ||
    lineage.methodVersion
      .trim()
      .length === 0
  ) {
    errors.push(
      `${path}:method-version-required`
    );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      lineage,
      "traceId"
    ) &&
    (
      typeof lineage.traceId !==
        "string" ||
      lineage.traceId
        .trim()
        .length === 0
    )
  ) {
    errors.push(
      `${path}:trace-id-must-be-a-nonempty-string`
    );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      lineage,
      "components"
    ) &&
    (
      !lineage.components ||
      typeof lineage.components !==
        "object" ||
      Array.isArray(
        lineage.components
      )
    )
  ) {
    errors.push(
      `${path}:components-must-be-an-object`
    );
  }

  if (
    Array.isArray(
      lineage.upstream
    )
  ) {
    lineage.upstream.forEach(
      (
        reference,
        index
      ) => {
        const validation =
          validateLineageUpstreamReference(
            reference,
            {
              path:
                `${path}:upstream:${index}`
            }
          );

        errors.push(
          ...validation.errors
        );

        warnings.push(
          ...validation.warnings
        );
      }
    );
  }

  for (
    const field
    of [
      "observationsUsed",
      "observationsUnavailable",
      "evidenceProduced",
      "inheritedLimitations",
      "inheritedWarnings"
    ]
  ) {
    if (
      Array.isArray(
        lineage[field]
      )
    ) {
      lineage[field].forEach(
        (
          value,
          index
        ) => {
          if (
            typeof value !==
              "string" ||
            value.trim().length ===
              0
          ) {
            errors.push(
              `${path}:${field}:${index}:must-be-a-nonempty-string`
            );
          }
        }
      );
    }
  }

  if (
    Array.isArray(
      lineage.upstream
    ) &&
    lineage.upstream.length === 0
  ) {
    warnings.push(
      `${path}:no-upstream-contracts-recorded`
    );
  }

  if (
    Array.isArray(
      lineage.observationsUsed
    ) &&
    lineage.observationsUsed.length ===
      0
  ) {
    warnings.push(
      `${path}:no-used-observations-recorded`
    );
  }

  if (
    Array.isArray(
      lineage.observationsUnavailable
    ) &&
    lineage.observationsUnavailable.length ===
      0
  ) {
    warnings.push(
      `${path}:no-unavailable-observations-recorded`
    );
  }

  if (
    Array.isArray(
      lineage.evidenceProduced
    ) &&
    lineage.evidenceProduced.length ===
      0
  ) {
    warnings.push(
      `${path}:no-produced-evidence-recorded`
    );
  }

  return {
    valid:
      errors.length === 0,

    producedBy:
      lineage.producedBy ??
      null,

    upstreamCount:
      Array.isArray(
        lineage.upstream
      )
        ? lineage.upstream.length
        : 0,

    observationsUsedCount:
      Array.isArray(
        lineage.observationsUsed
      )
        ? lineage.observationsUsed.length
        : 0,

    observationsUnavailableCount:
      Array.isArray(
        lineage.observationsUnavailable
      )
        ? lineage.observationsUnavailable.length
        : 0,

    evidenceProducedCount:
      Array.isArray(
        lineage.evidenceProduced
      )
        ? lineage.evidenceProduced.length
        : 0,

    inheritedLimitationCount:
      Array.isArray(
        lineage.inheritedLimitations
      )
        ? lineage.inheritedLimitations.length
        : 0,

    inheritedWarningCount:
      Array.isArray(
        lineage.inheritedWarnings
      )
        ? lineage.inheritedWarnings.length
        : 0,

    errors: [
      ...new Set(
        errors
      )
    ],

    warnings: [
      ...new Set(
        warnings
      )
    ],

    methodVersion:
      "pelora-evidence-lineage-validation-v1.0"
  };
}


/**
 * Convert a governed relationship-importance label into the
 * internal value used by the generic resolver.
 */
export function resolveRelationshipImportance(
  importance
) {
  if (
    typeof importance === "number" &&
    Number.isFinite(importance)
  ) {
    /*
     * Temporary backward compatibility for profiles created
     * before Species Knowledge Framework v1.0.
     *
     * New and updated profiles should use governed labels.
     */
    return importance;
  }

  return (
    SPECIES_RELATIONSHIP_IMPORTANCE[
      importance
    ] ??
    0
  );
}


/**
 * Validate a species knowledge profile before it is used by a
 * species model or opportunity resolver.
 *
 * Validation is structural. It does not certify the underlying
 * biological relationships as scientifically proven.
 */
export function validateSpeciesKnowledgeProfile(
  profile
) {
  const errors = [];

  const warnings = [];

  if (
    !profile ||
    typeof profile !== "object" ||
    Array.isArray(profile)
  ) {
    return {
      valid:
        false,

      errors: [
        "species-profile-must-be-an-object"
      ],

      warnings: [],

      methodVersion:
        "pelora-species-knowledge-profile-validation-v1.0"
    };
  }

  for (
    const field
    of SPECIES_KNOWLEDGE_FRAMEWORK
      .requiredProfileFields
  ) {
    if (
      profile[field] === undefined ||
      profile[field] === null
    ) {
      errors.push(
        `missing-required-profile-field:${field}`
      );
    }
  }

  if (
    profile.knowledgeStatus &&
    !SPECIES_KNOWLEDGE_FRAMEWORK
      .allowedKnowledgeStatuses
      .includes(
        profile.knowledgeStatus
      )
  ) {
    errors.push(
      "invalid-knowledge-status"
    );
  }

  const profileProvenanceValidation =
    validateKnowledgeProvenance(
      profile.knowledgeProvenance,
      {
        path:
          "profile"
      }
    );

  errors.push(
    ...profileProvenanceValidation
      .errors
  );

  warnings.push(
    ...profileProvenanceValidation
      .warnings
  );

  if (
    profile.relationshipGroups &&
    typeof profile.relationshipGroups ===
      "object"
  ) {
    for (
      const group
      of SPECIES_KNOWLEDGE_FRAMEWORK
        .requiredRelationshipGroups
    ) {
      const relationshipGroup =
        profile.relationshipGroups[
          group
        ];

      if (!relationshipGroup) {
        errors.push(
          `missing-relationship-group:${group}`
        );

        continue;
      }

      const relationshipProvenanceValidation =
        validateKnowledgeProvenance(
          relationshipGroup
            .provenance,
          {
            path:
              `relationship-group:${group}`
          }
        );

      errors.push(
        ...relationshipProvenanceValidation
          .errors
      );

      warnings.push(
        ...relationshipProvenanceValidation
          .warnings
      );
    }
  }

  const opportunityTypes =
    profile.opportunityTypes;

  if (
    opportunityTypes &&
    typeof opportunityTypes ===
      "object"
  ) {
    for (
      const [
        opportunityType,
        opportunityProfile
      ]
      of Object.entries(
        opportunityTypes
      )
    ) {
      if (
        !opportunityProfile ||
        typeof opportunityProfile !==
          "object"
      ) {
        errors.push(
          `invalid-opportunity-type:${opportunityType}`
        );

        continue;
      }

      const opportunityProvenanceValidation =
        validateKnowledgeProvenance(
          opportunityProfile
            .provenance,
          {
            path:
              `opportunity-type:${opportunityType}`
          }
        );

      errors.push(
        ...opportunityProvenanceValidation
          .errors
      );

      warnings.push(
        ...opportunityProvenanceValidation
          .warnings
      );

      if (
        !opportunityProfile.signals ||
        typeof opportunityProfile.signals !==
          "object"
      ) {
        errors.push(
          `missing-opportunity-signals:${opportunityType}`
        );

        continue;
      }

      for (
        const [
          signalName,
          importance
        ]
        of Object.entries(
          opportunityProfile.signals
        )
      ) {
        const validLabel =
          typeof importance === "string" &&
          SPECIES_KNOWLEDGE_FRAMEWORK
            .allowedImportanceLevels
            .includes(
              importance
            );

        const legacyNumber =
          typeof importance === "number" &&
          Number.isFinite(importance);

        if (
          !validLabel &&
          !legacyNumber
        ) {
          errors.push(
            `invalid-relationship-importance:${opportunityType}:${signalName}`
          );
        }

        if (legacyNumber) {
          warnings.push(
            `legacy-numeric-importance:${opportunityType}:${signalName}`
          );
        }
      }
    }
  }

  const requiredRules =
    SPECIES_KNOWLEDGE_FRAMEWORK
      .requiredRules;

  for (
    const [
      ruleName,
      requiredValue
    ]
    of Object.entries(
      requiredRules
    )
  ) {
    if (
      profile
        ?.rules
        ?.[ruleName] !==
      requiredValue
    ) {
      errors.push(
        `invalid-required-rule:${ruleName}`
      );
    }
  }

  if (
    profile
      ?.rules
      ?.confirmedTypeAllowed ===
    true
  ) {
    errors.push(
      "confirmed-opportunity-types-are-not-allowed"
    );
  }

  return {
    valid:
      errors.length === 0,

    species:
      profile.species ??
      null,

    knowledgeStatus:
      profile.knowledgeStatus ??
      null,

    errors: [
      ...new Set(errors)
    ],

    warnings: [
      ...new Set(warnings)
    ],

    methodVersion:
      "pelora-species-knowledge-profile-validation-v1.0"
  };
}


export const BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE = {
  species:
    "blue-marlin",

  commonName:
    "Blue Marlin",

  scientificName:
    "Makaira nigricans",

  knowledgeStatus:
    "provisional",

  habitatPurpose:
    "Identify where the ocean is creating a persistent, biologically plausible feeding opportunity for Blue Marlin without inferring fish presence or fishing success.",

  knowledgeProvenance: {
    rationale:
      "The Blue Marlin profile organizes environmental relationships believed to support persistent pelagic feeding opportunity while preserving uncertainty and avoiding claims of fish presence.",

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
      "formal-literature-review-not-yet-attached",
      "regional-and-seasonal-relationships-require-future-validation",
      "environmental-support-does-not-confirm-blue-marlin-presence"
    ]
  },

  relationshipGroups: {
    oceanMovement: {
      purpose:
        "Evaluate whether current organization may create movement corridors, convergence, retention, or directional feeding opportunity.",

      required:
        false,

      provenance: {
        rationale:
          "Organized currents, convergence, shear, and directional flow may create movement corridors or concentrate pelagic feeding opportunity, but single-point current observations cannot establish those spatial processes.",

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
          "formal-scientific-review-not-yet-recorded",
          "regional-variation-requires-future-validation"
        ]
      }
    },

    thermalStructure: {
      purpose:
        "Evaluate temperature boundaries and organized thermal transitions that may help define pelagic habitat.",

      required:
        false,

      provenance: {
        rationale:
          "Thermal transitions may help define water-mass boundaries and organized pelagic habitat, but temperature alone does not establish prey concentration or Blue Marlin presence.",

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
          "formal-scientific-review-not-yet-recorded",
          "regional-variation-requires-future-validation"
        ]
      }
    },

    productivityAndPreySupport: {
      purpose:
        "Evaluate environmental productivity that may support prey availability without confirming prey concentration.",

      required:
        false,

      provenance: {
        rationale:
          "Surface productivity may support the lower food web and increase prey plausibility, but chlorophyll observations do not directly confirm bait or feeding activity.",

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
          "formal-scientific-review-not-yet-recorded",
          "regional-variation-requires-future-validation"
        ]
      }
    },

    waterCharacter: {
      purpose:
        "Evaluate water-mass character and transitions without treating water color as direct biological proof.",

      required:
        false,

      provenance: {
        rationale:
          "Water-mass character and water-color transitions may help describe habitat boundaries, but clarity and color remain environmental context rather than direct biological proof.",

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
          "formal-scientific-review-not-yet-recorded",
          "regional-variation-requires-future-validation"
        ]
      }
    },

    structureInteraction: {
      purpose:
        "Evaluate bathymetric or physical structure association independently from open-water opportunity.",

      required:
        false,

      provenance: {
        rationale:
          "Bathymetric and physical structures may organize currents or create recurring habitat relationships, but proximity does not prove current interaction, prey retention, or fish use.",

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
          "formal-scientific-review-not-yet-recorded",
          "regional-variation-requires-future-validation"
        ]
      }
    },

    persistence: {
      purpose:
        "Evaluate whether an environmental feature remains organized long enough to create a plausible recurring opportunity.",

      required:
        false,

      provenance: {
        rationale:
          "A feature that remains organized through time is more biologically plausible than a brief observation, but verified temporal persistence is not yet fully connected.",

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
          "formal-scientific-review-not-yet-recorded",
          "regional-variation-requires-future-validation"
        ]
      }
    }
  },

  leadingCandidateThreshold:
    4,

  moderateConfidenceThreshold:
    8,

  opportunityTypes: {
    "feeding-corridor": {
      provenance: {
        rationale:
          "A feeding corridor is considered plausible where organized current and thermal structure may create directional movement and repeated access to feeding opportunity.",

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
          "formal-scientific-review-not-yet-recorded",
          "environmental-opportunity-does-not-confirm-fish-presence",
          "regional-and-seasonal-expression-may-vary"
        ]
      },

      signals: {
        openWaterOrganization:
          "moderate",

        organizedCurrent:
          "strong",

        thermalBoundary:
          "moderate",

        multiSignalSupport:
          "supporting"
      },

      missingEvidence: {
        openWaterOrganization:
          "open-water-organization-not-established",

        organizedCurrent:
          "organized-current-support-unavailable",

        thermalBoundary:
          "thermal-boundary-not-established"
      },

      limitations: []
    },


    "current-convergence-feeding-pocket": {
      provenance: {
        rationale:
          "A convergence feeding pocket is considered plausible where verified converging flow may retain or concentrate environmental and prey-supporting features within a localized area.",

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
          "formal-scientific-review-not-yet-recorded",
          "environmental-opportunity-does-not-confirm-fish-presence",
          "regional-and-seasonal-expression-may-vary"
        ]
      },

      signals: {
        openWaterOrganization:
          "moderate",

        currentSupport:
          "moderate",

        currentConvergence:
          "critical"
      },

      missingEvidence: {
        openWaterOrganization:
          "open-water-organization-not-established",

        currentSupport:
          "current-support-unavailable",

        currentConvergence:
          "current-convergence-not-established"
      },

      limitations: []
    },


    "eddy-edge-opportunity": {
      provenance: {
        rationale:
          "An eddy-edge opportunity is considered plausible where a verified eddy boundary creates organized current, thermal, or productivity contrast along a persistent pelagic edge.",

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
          "formal-scientific-review-not-yet-recorded",
          "environmental-opportunity-does-not-confirm-fish-presence",
          "regional-and-seasonal-expression-may-vary"
        ]
      },

      signals: {
        openWaterOrganization:
          "supporting",

        eddyBoundary:
          "critical",

        thermalBoundary:
          "supporting"
      },

      missingEvidence: {
        eddyBoundary:
          "eddy-boundary-not-established"
      },

      limitations: []
    },


    "productive-water-boundary": {
      provenance: {
        rationale:
          "A productive-water boundary is considered plausible where productivity, water character, and thermal evidence describe an organized transition between adjacent water masses.",

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
          "formal-scientific-review-not-yet-recorded",
          "environmental-opportunity-does-not-confirm-fish-presence",
          "regional-and-seasonal-expression-may-vary"
        ]
      },

      signals: {
        productivityBoundary:
          "critical",

        thermalBoundary:
          "moderate",

        currentSupport:
          "supporting",

        multiSignalSupport:
          "supporting"
      },

      missingEvidence: {
        productivityBoundary:
          "productivity-boundary-not-established"
      },

      limitations: []
    },


    "open-water-prey-aggregation": {
      provenance: {
        rationale:
          "Open-water prey aggregation remains a cautious environmental interpretation where productivity, current organization, and persistence could support concentration, without confirming prey.",

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
          "formal-scientific-review-not-yet-recorded",
          "environmental-opportunity-does-not-confirm-fish-presence",
          "regional-and-seasonal-expression-may-vary"
        ]
      },

      signals: {
        openWaterOrganization:
          "moderate",

        productivityBoundary:
          "strong",

        currentSupport:
          "moderate",

        persistence:
          "moderate"
      },

      missingEvidence: {
        openWaterOrganization:
          "open-water-organization-not-established",

        productivityBoundary:
          "productive-water-support-unavailable",

        persistence:
          "feature-persistence-not-established"
      },

      limitations: [
        "environmental-evidence-does-not-confirm-prey-aggregation"
      ]
    },


    "bathymetric-interaction-zone": {
      provenance: {
        rationale:
          "A bathymetric interaction zone is considered plausible where verified structure and current evidence support physical interaction that may organize a recurring offshore feature.",

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
          "formal-scientific-review-not-yet-recorded",
          "environmental-opportunity-does-not-confirm-fish-presence",
          "regional-and-seasonal-expression-may-vary"
        ]
      },

      signals: {
        structureAssociation:
          "strong",

        currentSupport:
          "moderate",

        verifiedStructureInteraction:
          "strong"
      },

      missingEvidence: {
        structureAssociation:
          "structure-association-not-established",

        currentSupport:
          "current-support-unavailable",

        verifiedStructureInteraction:
          "current-structure-interaction-not-verified"
      },

      limitations: []
    }
  },

  confidencePolicy: {
    leadingCandidateRequiresDifferentiation:
      true,

    leadingCandidateThreshold:
      4,

    moderateConfidenceThreshold:
      8,

    unresolvedTiesRemainUnresolved:
      true,

    missingPersistenceMustBeDisclosed:
      true
  },

  rules: {
    biologicalInferenceAllowed:
      false,

    confirmedTypeAllowed:
      false,

    changesHabitatScores:
      false,

    changesConfidence:
      false,

    structureRequired:
      false
  },

  methodVersion:
    "pelora-blue-marlin-species-knowledge-profile-v1.1"
};


/**
 * ------------------------------------------------------------
 * Opportunity Type Resolution Lineage v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Preserve the governed evidence trace used to rank plausible
 * species opportunity-type candidates.
 *
 * Species Pathway Interpretation is the primary upstream
 * reasoning chain. Earlier environmental and relationship
 * stages remain visible through inherited lineage.
 *
 * This lineage is documentary only. It does not alter candidate
 * scores, ordering, confidence, ambiguity handling, knowledge
 * provenance, habitat scoring, or biological interpretation.
 */
export function buildOpportunityTypeResolutionLineage({
  speciesPathwayInterpretation = null,
  species =
    "unknown-species",
  available =
    false,
  classification =
    "insufficient-opportunity-type-evidence",
  confidence =
    "insufficient",
  leadingCandidate =
    null,
  candidateTypes = [],
  rankedCandidates = [],
  limitations = []
} = {}) {
  return propagateEvidenceLineage({
    primaryUpstreamLineage:
      speciesPathwayInterpretation
        ?.lineage ??
      null,

    producedBy:
      "opportunity-type",

    methodVersion:
      "pelora-opportunity-type-resolution-lineage-v1.0",

    evidenceProduced: [
      "species-opportunity-type-resolution"
    ],

    inheritedLimitations:
      Array.isArray(
        limitations
      )
        ? limitations
        : [],

    inheritedWarnings:
      speciesPathwayInterpretation
        ?.lineage
        ? []
        : [
            "primary-upstream-lineage-unavailable"
          ],

    components: {
      species,

      available:
        available === true,

      classification,

      confidence,

      leadingCandidate:
        typeof leadingCandidate ===
          "string"
          ? leadingCandidate
          : null,

      candidateCount:
        Array.isArray(
          candidateTypes
        )
          ? candidateTypes.length
          : 0,

      rankedCandidateTypes:
        Array.isArray(
          rankedCandidates
        )
          ? rankedCandidates
              .map(
                candidate =>
                  candidate?.type
              )
              .filter(Boolean)
          : []
    }
  });
}


/**
 * ------------------------------------------------------------
 * Generic Species Opportunity Type Resolver v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Rank species opportunity types using:
 *
 * - a species knowledge profile
 * - species-neutral environmental evidence
 * - relationship context
 * - pathway interpretation
 *
 * The resolver itself contains no species-specific weights.
 */
export function resolveSpeciesOpportunityType({
  speciesProfile = null,
  speciesPathwayInterpretation = null,
  relationshipContext = null,
  oceanEvidence = null,
  oceanOpportunity = null
} = {}) {
  const profileValidation =
    validateSpeciesKnowledgeProfile(
      speciesProfile
    );

  if (!profileValidation.valid) {
    const invalidSpecies =
      speciesProfile
        ?.species ??
      "unknown-species";

    const invalidPathway =
      speciesPathwayInterpretation
        ?.environmentalPathway ??
      relationshipContext
        ?.pathway ??
      "insufficient-evidence";

    const invalidLimitations = [
      "species-knowledge-profile-invalid",
      "does-not-confirm-species-presence",
      "does-not-confirm-feeding",
      "does-not-estimate-catch-probability",
      "does-not-change-habitat-scores",
      "does-not-change-model-confidence"
    ];

    const lineage =
      buildOpportunityTypeResolutionLineage({
        speciesPathwayInterpretation,

        species:
          invalidSpecies,

        available:
          false,

        classification:
          "species-knowledge-profile-invalid",

        confidence:
          "insufficient",

        leadingCandidate:
          null,

        candidateTypes: [],

        rankedCandidates: [],

        limitations:
          invalidLimitations
      });

    return {
      available:
        false,

      species:
        invalidSpecies,

      environmentalPathway:
        invalidPathway,

      resolvedType:
        null,

      confirmedType:
        null,

      leadingCandidate:
        null,

      candidateTypes: [],

      rankedCandidates: [],

      evidenceFor: [],

      evidenceMissing: [
        "valid-species-knowledge-profile-required"
      ],

      confidence:
        "insufficient",

      classification:
        "species-knowledge-profile-invalid",

      summary:
        "Opportunity-type resolution is unavailable because the species knowledge profile is incomplete or invalid.",

      limitations:
        invalidLimitations,

      lineage,

      evidenceSignals: {},

      profileValidation,

      rules: {
        rankingAllowed:
          false,

        leadingCandidateAllowed:
          false,

        confirmedTypeAllowed:
          false,

        biologicalInferenceAllowed:
          false,

        changesHabitatScores:
          false,

        changesConfidence:
          false,

        structureRequired:
          false
      },

      knowledgeProfile: {
        species:
          speciesProfile
            ?.species ??
          null,

        methodVersion:
          speciesProfile
            ?.methodVersion ??
          null
      },

      methodVersion:
        "pelora-species-opportunity-type-resolution-v1.2"
    };
  }

  const species =
    speciesProfile
      ?.species ??
    "unknown-species";

  const profileTypes =
    speciesProfile
      ?.opportunityTypes ??
    {};

  const plausibleTypes =
    Array.isArray(
      speciesPathwayInterpretation
        ?.plausibleOpportunityTypes
    )
      ? [
          ...speciesPathwayInterpretation
            .plausibleOpportunityTypes
        ]
      : [];

  const pathway =
    speciesPathwayInterpretation
      ?.environmentalPathway ??
    relationshipContext
      ?.pathway ??
    "insufficient-evidence";

  const relationshipSupport =
    relationshipContext
      ?.relationshipSupport ??
    {};

  const groups =
    oceanEvidence
      ?.groups ??
    {};

  const opportunityTypes =
    Array.isArray(
      oceanOpportunity
        ?.opportunities
    )
      ? oceanOpportunity
          .opportunities
          .map(
            opportunity =>
              opportunity
                ?.type
          )
          .filter(Boolean)
      : [];

  const current =
    groups
      ?.current ??
    null;

  const temperature =
    groups
      ?.temperature ??
    null;

  const productivity =
    groups
      ?.productivity ??
    null;

  const clarity =
    groups
      ?.clarity ??
    null;

  const structure =
    groups
      ?.structure ??
    null;

  const currentClassification =
    current
      ?.classification ??
    null;

  const currentStrength =
    current
      ?.values
      ?.strengthClassification ??
    null;

  const temperatureClassification =
    temperature
      ?.classification ??
    null;

  const transitionStrength =
    temperature
      ?.values
      ?.transitionStrength ??
    null;

  const productivityClassification =
    productivity
      ?.classification ??
    null;

  const productivityWaterClassification =
    productivity
      ?.values
      ?.waterClassification ??
    null;

  const clarityClassification =
    clarity
      ?.classification ??
    null;

  const clarityWaterClassification =
    clarity
      ?.values
      ?.waterClassification ??
    null;


  /*
   * Species-neutral environmental signal extraction.
   *
   * These signals describe what the environmental evidence
   * supports. Species profiles decide how much each signal
   * matters for each opportunity type.
   */
  const signals = {
    openWaterOrganization:
      relationshipSupport
        ?.openWaterOrganization
        ?.supported === true,

    structureAssociation:
      structure
        ?.available === true ||
      relationshipSupport
        ?.structureInteraction
        ?.supported === true,

    persistence:
      relationshipSupport
        ?.persistence
        ?.supported === true,

    verifiedStructureInteraction:
      relationshipSupport
        ?.structureInteraction
        ?.interactionVerified === true,

    currentConvergence:
      relationshipSupport
        ?.currentConvergence
        ?.supported === true,

    eddyBoundary:
      relationshipSupport
        ?.eddyBoundary
        ?.supported === true,

    currentSupport:
      current
        ?.available === true &&
      (
        currentClassification ===
          "moderate" ||
        currentClassification ===
          "strong" ||
        currentClassification ===
          "very-strong" ||
        currentStrength ===
          "moderate" ||
        currentStrength ===
          "strong" ||
        currentStrength ===
          "very-strong" ||
        opportunityTypes.includes(
          "current-supported-transition-candidate"
        )
      ),

    organizedCurrent:
      current
        ?.available === true &&
      (
        currentClassification ===
          "moderate" ||
        currentClassification ===
          "strong" ||
        currentClassification ===
          "very-strong" ||
        currentStrength ===
          "moderate" ||
        currentStrength ===
          "strong" ||
        currentStrength ===
          "very-strong"
      ) &&
      (
        relationshipSupport
          ?.openWaterOrganization
          ?.supported === true ||
        opportunityTypes.includes(
          "current-supported-transition-candidate"
        )
      ),

    thermalBoundary:
      temperature
        ?.available === true &&
      (
        temperatureClassification
          ?.includes(
            "temperature-transition"
          ) ||
        transitionStrength ===
          "weak" ||
        transitionStrength ===
          "moderate" ||
        transitionStrength ===
          "strong"
      ),

    strongThermalBoundary:
      temperature
        ?.available === true &&
      transitionStrength ===
        "strong",

    productivityBoundary:
      productivity
        ?.available === true &&
      (
        productivityClassification ===
          "productive-surface-water" ||
        productivityClassification ===
          "productive-water-transition" ||
        productivityWaterClassification ===
          "productive-blue-green-transition" ||
        clarityClassification ===
          "transitional-surface-water" ||
        clarityWaterClassification ===
          "productive-blue-green-transition" ||
        opportunityTypes.includes(
          "surface-water-boundary-candidate"
        )
      ),

    multiSignalSupport:
      opportunityTypes.includes(
        "multi-signal-feature-candidate"
      )
  };


  const evidenceLabels = {
    openWaterOrganization:
      "open-water-organization-supported",

    structureAssociation:
      "structure-association-supported",

    persistence:
      "feature-persistence-supported",

    verifiedStructureInteraction:
      "current-structure-interaction-verified",

    currentConvergence:
      "current-convergence-supported",

    eddyBoundary:
      "eddy-boundary-supported",

    currentSupport:
      "current-support-available",

    organizedCurrent:
      "organized-current-support",

    thermalBoundary:
      "thermal-boundary-support",

    strongThermalBoundary:
      "strong-thermal-boundary-support",

    productivityBoundary:
      "productivity-or-water-character-boundary-supported",

    multiSignalSupport:
      "multi-signal-environmental-support"
  };


  const rankedCandidates =
    plausibleTypes
      .filter(
        type =>
          profileTypes[type]
      )
      .map(type => {
        const typeProfile =
          profileTypes[type];

        const signalWeights =
          typeProfile
            ?.signals ??
          {};

        const missingEvidenceRules =
          typeProfile
            ?.missingEvidence ??
          {};

        let supportScore = 0;

        const evidenceFor = [];

        const evidenceMissing = [];

        for (
          const [
            signalName,
            weight
          ]
          of Object.entries(
            signalWeights
          )
        ) {
          if (
            signals[signalName] === true
          ) {
            supportScore +=
              resolveRelationshipImportance(
                weight
              );

            evidenceFor.push(
              evidenceLabels[
                signalName
              ] ??
              `${signalName}-supported`
            );
          } else if (
            missingEvidenceRules[
              signalName
            ]
          ) {
            evidenceMissing.push(
              missingEvidenceRules[
                signalName
              ]
            );
          }
        }

        return {
          type,

          supportScore,

          evidenceFor: [
            ...new Set(
              evidenceFor
                .filter(Boolean)
            )
          ],

          evidenceMissing: [
            ...new Set(
              evidenceMissing
                .filter(Boolean)
            )
          ],

          limitations: [
            ...new Set(
              (
                typeProfile
                  ?.limitations ??
                []
              )
                .filter(Boolean)
            )
          ]
        };
      })
      .sort(
        (
          first,
          second
        ) =>
          second.supportScore -
          first.supportScore ||
          first.type.localeCompare(
            second.type
          )
      );


  const firstCandidate =
    rankedCandidates[0] ??
    null;

  const secondCandidate =
    rankedCandidates[1] ??
    null;

  const leadingCandidateThreshold =
    Number(
      speciesProfile
        ?.leadingCandidateThreshold
    ) || 4;

  const moderateConfidenceThreshold =
    Number(
      speciesProfile
        ?.moderateConfidenceThreshold
    ) || 8;

  const leadingCandidateIsDifferentiated =
    Boolean(
      firstCandidate &&
      firstCandidate.supportScore >=
        leadingCandidateThreshold &&
      (
        !secondCandidate ||
        firstCandidate.supportScore >
          secondCandidate.supportScore
      )
    );

  const leadingCandidate =
    leadingCandidateIsDifferentiated
      ? firstCandidate.type
      : null;

  let confidence =
    "insufficient";

  if (
    leadingCandidate &&
    firstCandidate.supportScore >=
      moderateConfidenceThreshold
  ) {
    confidence =
      "moderate";
  } else if (
    leadingCandidate
  ) {
    confidence =
      "limited";
  } else if (
    rankedCandidates.length > 0 &&
    firstCandidate
      ?.supportScore > 0
  ) {
    confidence =
      "weak";
  }


  let classification =
    "insufficient-opportunity-type-evidence";

  let summary =
    `The available evidence does not differentiate a ${species} opportunity type.`;

  if (
    leadingCandidate &&
    confidence === "moderate"
  ) {
    classification =
      "moderate-leading-opportunity-type-candidate";

    summary =
      `The available evidence most strongly supports ${leadingCandidate} as a preliminary ${species} opportunity-type candidate, but the interpretation remains unconfirmed.`;
  } else if (
    leadingCandidate &&
    confidence === "limited"
  ) {
    classification =
      "limited-leading-opportunity-type-candidate";

    summary =
      `The available evidence provides limited support for ${leadingCandidate} as the leading ${species} opportunity-type candidate, but important evidence remains unavailable.`;
  } else if (
    rankedCandidates.length > 0
  ) {
    classification =
      "multiple-unresolved-opportunity-type-candidates";

    summary =
      `Multiple ${species} opportunity types remain plausible, and the available evidence does not yet distinguish one clearly.`;
  }


  const limitations = [
    "opportunity-type-resolution-is-preliminary",
    "resolved-type-is-not-confirmed",
    `does-not-confirm-${species}-presence`,
    "does-not-confirm-feeding",
    "does-not-confirm-prey-concentration",
    "does-not-estimate-catch-probability",
    "does-not-indicate-fishing-success",
    "does-not-change-habitat-scores",
    "does-not-change-model-confidence"
  ];

  if (!signals.persistence) {
    limitations.push(
      "feature-persistence-not-established"
    );
  }

  if (
    pathway ===
      "insufficient-evidence"
  ) {
    limitations.push(
      "environmental-pathway-not-established"
    );
  }


  const available =
    rankedCandidates
      .length > 0;

  const candidateTypes =
    rankedCandidates.map(
      candidate =>
        candidate.type
    );

  const resolutionLimitations = [
    ...new Set(
      limitations
        .filter(Boolean)
    )
  ];

  const lineage =
    buildOpportunityTypeResolutionLineage({
      speciesPathwayInterpretation,

      species,

      available,

      classification,

      confidence,

      leadingCandidate,

      candidateTypes,

      rankedCandidates,

      limitations:
        resolutionLimitations
    });


  return {
    available,

    species,

    environmentalPathway:
      pathway,

    resolvedType:
      null,

    confirmedType:
      null,

    leadingCandidate,

    candidateTypes,

    rankedCandidates,

    evidenceFor:
      firstCandidate
        ?.evidenceFor ??
      [],

    evidenceMissing:
      firstCandidate
        ?.evidenceMissing ??
      [],

    confidence,

    classification,

    summary,

    limitations:
      resolutionLimitations,

    lineage,

    evidenceSignals:
      signals,

    rules: {
      rankingAllowed:
        true,

      leadingCandidateAllowed:
        true,

      confirmedTypeAllowed:
        false,

      biologicalInferenceAllowed:
        false,

      changesHabitatScores:
        false,

      changesConfidence:
        false,

      structureRequired:
        false
    },

    knowledgeProfile: {
      species:
        speciesProfile
          ?.species ??
        null,

      commonName:
        speciesProfile
          ?.commonName ??
        null,

      scientificName:
        speciesProfile
          ?.scientificName ??
        null,

      knowledgeStatus:
        speciesProfile
          ?.knowledgeStatus ??
        null,

      methodVersion:
        speciesProfile
          ?.methodVersion ??
        null,

      provenance: {
        evidenceStatus:
          speciesProfile
            ?.knowledgeProvenance
            ?.evidenceStatus ??
          null,

        sourceType:
          speciesProfile
            ?.knowledgeProvenance
            ?.sourceType ??
          null,

        regionalScope:
          speciesProfile
            ?.knowledgeProvenance
            ?.regionalScope ??
          null,

        seasonalScope:
          speciesProfile
            ?.knowledgeProvenance
            ?.seasonalScope ??
          null,

        referenceCount:
          Array.isArray(
            speciesProfile
              ?.knowledgeProvenance
              ?.references
          )
            ? speciesProfile
                .knowledgeProvenance
                .references
                .length
            : 0,

        reviewerCount:
          Array.isArray(
            speciesProfile
              ?.knowledgeProvenance
              ?.reviewedBy
          )
            ? speciesProfile
                .knowledgeProvenance
                .reviewedBy
                .length
            : 0
      }
    },

    profileValidation,

    methodVersion:
      "pelora-species-opportunity-type-resolution-v1.2"
  };
}


/**
 * ------------------------------------------------------------
 * Blue Marlin Opportunity Type Resolution v1.1
 * ------------------------------------------------------------
 *
 * Species wrapper around the generic opportunity resolver.
 */
export function resolveBlueMarlinOpportunityType({
  speciesPathwayInterpretation = null,
  relationshipContext = null,
  oceanEvidence = null,
  oceanOpportunity = null
} = {}) {
  const resolution =
    resolveSpeciesOpportunityType({
      speciesProfile:
        BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE,

      speciesPathwayInterpretation,

      relationshipContext,

      oceanEvidence,

      oceanOpportunity
    });

  return {
    ...resolution,

    methodVersion:
      "pelora-blue-marlin-opportunity-type-resolution-v1.3"
  };
}


/**
 * ------------------------------------------------------------
 * Blue Marlin Habitat Suitability Lineage v1.0
 * ------------------------------------------------------------
 *
 * Purpose:
 * Document how the final Blue Marlin habitat-suitability
 * assessment was produced.
 *
 * Opportunity Type Resolution is the primary direct parent.
 * Earlier observations, evidence, opportunity, relationship,
 * and species-pathway stages remain visible through inherited
 * lineage.
 *
 * This lineage is documentary only. It does not:
 *
 * - change habitat scores
 * - change confidence
 * - change classifications
 * - change relationship-group scores
 * - change candidate rankings
 * - confirm Blue Marlin presence
 * - confirm feeding
 * - estimate catch probability
 */
export function buildBlueMarlinHabitatLineage({
  opportunityTypeResolution = null,

  classification =
    "insufficient-habitat-evidence",

  suitabilityScore =
    0,

  rawSuitabilityScore =
    0,

  confidenceScore =
    0,

  confidenceLevel =
    "Very Low",

  relationshipGroups = {},

  leadingOpportunityCandidate =
    null,

  limitations = []
} = {}) {
  const relationshipGroupSummary =
    Object.fromEntries(
      Object.entries(
        relationshipGroups ?? {}
      ).map(
        ([
          groupName,
          group
        ]) => [
          groupName,

          {
            classification:
              group?.classification ??
              null,

            score:
              Number.isFinite(
                group?.score
              )
                ? group.score
                : 0,

            maximumScore:
              Number.isFinite(
                group?.maximumScore
              )
                ? group.maximumScore
                : null
          }
        ]
      )
    );

  return propagateEvidenceLineage({
    upstreamLineage:
      opportunityTypeResolution
        ?.lineage ??
      null,

    producedBy:
      "habitat-suitability",

    methodVersion:
      "pelora-blue-marlin-hsm-lineage-v1.0",

    evidenceProduced: [
      "blue-marlin-habitat-suitability-assessment"
    ],

    inheritedLimitations:
      Array.isArray(
        limitations
      )
        ? limitations
        : [],

    components: {
      species:
        "blue-marlin",

      classification,

      rawSuitabilityScore:
        Number.isFinite(
          rawSuitabilityScore
        )
          ? rawSuitabilityScore
          : 0,

      suitabilityScore:
        Number.isFinite(
          suitabilityScore
        )
          ? suitabilityScore
          : 0,

      confidenceScore:
        Number.isFinite(
          confidenceScore
        )
          ? confidenceScore
          : 0,

      confidenceLevel,

      maximumSuitabilityScore:
        100,

      leadingOpportunityCandidate:
        typeof leadingOpportunityCandidate ===
          "string"
          ? leadingOpportunityCandidate
          : null,

      relationshipGroups:
        relationshipGroupSummary
    }
  });
}


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

  const relationshipContext =
    buildRelationshipContext({
      oceanOpportunity,
      oceanEvidence
    });

  const relationshipAssessment =
    assessRelationships({
      relationshipContext,
      oceanOpportunity,
      oceanEvidence,
      dataQuality
    });

  const speciesPathwayInterpretation =
    interpretBlueMarlinPathway({
      relationshipAssessment,

      relationshipContext:
        relationshipAssessment
          .relationshipContext
    });

  const opportunityTypeResolution =
    resolveBlueMarlinOpportunityType({
      speciesPathwayInterpretation,
      relationshipContext,
      oceanEvidence,
      oceanOpportunity
    });

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
   *
   * Chlorophyll-derived clarity evidence describes broad
   * surface-water character only. It does not directly measure
   * underwater visibility, full-water-column clarity, prey,
   * blue marlin presence, or fishing quality.
   *
   * This relationship group is intentionally weighted below
   * Thermal Structure and Ocean Movement so that the same
   * chlorophyll observation does not dominate both productivity
   * and water-character scoring.
   */
  let waterCharacterScore = 0;

  let waterCharacterClassification =
    "unsupported";

  const clarityEvidenceClassification =
    clarity?.classification ??
    null;

  const clarityWaterClassification =
    clarity?.values
      ?.waterClassification ??
    null;

  const clarityFreshness =
    clarity?.values
      ?.freshness ??
    "unknown";

  const clarityConcentrationMgM3 =
    Number.isFinite(
      clarity?.values
        ?.concentrationMgM3
    )
      ? clarity.values
          .concentrationMgM3
      : null;

  const hasDetailedClarityEvidence =
    clarity?.available === true &&
    (
      clarityEvidenceClassification !==
        null ||
      clarityWaterClassification !==
        null ||
      clarityConcentrationMgM3 !==
        null
    );

  if (
    clarity?.available
  ) {
    if (
      clarityEvidenceClassification ===
        "very-clear-surface-water" ||
      clarityWaterClassification ===
        "very-clear-low-productivity"
    ) {
      waterCharacterScore = 5;

      waterCharacterClassification =
        "very-clear-surface-water-observed";

      positiveDrivers.push(
        "very-clear-surface-water-character"
      );
    } else if (
      clarityEvidenceClassification ===
        "clear-surface-water" ||
      clarityWaterClassification ===
        "clear-blue-water"
    ) {
      waterCharacterScore = 7;

      waterCharacterClassification =
        "clear-blue-surface-water-observed";

      positiveDrivers.push(
        "clear-blue-surface-water-character"
      );
    } else if (
      clarityEvidenceClassification ===
        "transitional-surface-water" ||
      clarityWaterClassification ===
        "productive-blue-green-transition"
    ) {
      waterCharacterScore = 6;

      waterCharacterClassification =
        "transitional-surface-water-observed";

      positiveDrivers.push(
        "blue-green-surface-water-character"
      );
    } else if (
      clarityEvidenceClassification ===
        "chlorophyll-influenced-surface-water" ||
      clarityWaterClassification ===
        "productive-green-water"
    ) {
      waterCharacterScore = 3;

      waterCharacterClassification =
        "chlorophyll-influenced-surface-water-observed";

      negativeDrivers.push(
        "reduced-surface-water-clarity-inferred"
      );
    } else if (
      clarityEvidenceClassification ===
        "strongly-chlorophyll-influenced-surface-water" ||
      clarityWaterClassification ===
        "high-chlorophyll-coastal-or-bloom-influenced"
    ) {
      waterCharacterScore = 1;

      waterCharacterClassification =
        "strongly-chlorophyll-influenced-water-with-context-uncertainty";

      negativeDrivers.push(
        "strongly-chlorophyll-influenced-surface-water"
      );

      limitations.push(
        "high-chlorophyll-water-may-reflect-coastal-bloom-or-sediment-influence"
      );
    } else {
      waterCharacterScore = 2;

      waterCharacterClassification =
        "surface-water-character-observed-without-classification";

      limitations.push(
        "water-character-classification-unavailable"
      );
    }

    if (
      clarityConcentrationMgM3 !==
        null
    ) {
      positiveDrivers.push(
        `water-character-derived-from-${clarityConcentrationMgM3.toFixed(3)}-mg-m3-surface-chlorophyll`
      );
    }

    if (
      hasSurfaceWaterBoundary
    ) {
      waterCharacterScore += 3;

      waterCharacterClassification =
        "surface-water-character-transition-supported";

      positiveDrivers.push(
        "surface-water-character-transition"
      );
    }

    waterCharacterScore =
      Math.min(
        10,
        waterCharacterScore
      );

    if (
      clarityFreshness ===
        "aging" &&
      waterCharacterScore > 7
    ) {
      waterCharacterScore = 7;

      limitations.push(
        "water-character-score-limited-by-aging-satellite-observation"
      );
    } else if (
      clarityFreshness ===
        "stale" &&
      waterCharacterScore > 4
    ) {
      waterCharacterScore = 4;

      limitations.push(
        "water-character-score-limited-by-stale-satellite-observation"
      );
    } else if (
      clarityFreshness ===
        "unknown" &&
      hasDetailedClarityEvidence &&
      waterCharacterScore > 9
    ) {
      waterCharacterScore = 9;

      limitations.push(
        "water-character-score-limited-by-unknown-observation-age"
      );
    }

    limitations.push(
      "surface-water-character-does-not-directly-measure-visibility"
    );

    limitations.push(
      "surface-water-character-does-not-establish-blue-marlin-habitat"
    );
  } else if (
    hasSurfaceWaterBoundary &&
    !clarity
  ) {
    /*
     * Compatibility fallback for an upstream opportunity that
     * identifies a chlorophyll-derived water boundary but does
     * not include the detailed clarity evidence contract.
     */
    waterCharacterScore = 8;

    waterCharacterClassification =
      "surface-water-transition-supported";

    positiveDrivers.push(
      "surface-water-character-transition"
    );

    limitations.push(
      "detailed-water-character-evidence-unavailable"
    );

    limitations.push(
      "surface-water-character-does-not-directly-measure-visibility"
    );
  } else {
    negativeDrivers.push(
      "water-character-evidence-unavailable"
    );

    limitations.push(
      "water-character-evidence-unavailable"
    );
  }


  /*
   * Relationship Group 6:
   * Persistence
   *
   * Persistence Evidence Contract v1.0 currently remains
   * unavailable because only a single-time environmental
   * assessment is connected.
   */
  const persistenceEvidence =
    buildPersistenceEvidence();

  /*
   * Species-neutral persistence evidence does not contribute
   * to blue marlin habitat suitability until verified temporal
   * analysis is available.
   */
  const persistenceScore = 0;

  if (
    persistenceEvidence
      ?.available !== true
  ) {
    negativeDrivers.push(
      "feature-persistence-not-established"
    );
  }

  limitations.push(
    ...(
      Array.isArray(
        persistenceEvidence
          ?.limitations
      )
        ? persistenceEvidence
            .limitations
        : []
    )
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

  const habitatRelationshipGroups = {
    oceanMovement: {
      classification:
        oceanMovementClassification,

      score:
        oceanMovementScore,

      maximumScore:
        20
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
        persistenceEvidence
          ?.classification ??
        "unavailable",

      score:
        persistenceScore,

      maximumScore:
        5
    }
  };

  const lineage =
    buildBlueMarlinHabitatLineage({
      opportunityTypeResolution,

      classification,

      suitabilityScore,

      rawSuitabilityScore,

      confidenceScore:
        upstreamConfidenceScore,

      confidenceLevel:
        upstreamConfidenceLevel,

      relationshipGroups:
        habitatRelationshipGroups,

      leadingOpportunityCandidate:
        opportunityTypeResolution
          ?.leadingCandidate ??
        null,

      limitations:
        uniqueLimitations
    });

  return {
    lineage,

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

          /*
           * Current implemented maximum.
           * Five additional design points are reserved for future
           * current-organization evidence such as convergence,
           * eddy boundaries, bathymetric interaction, and persistence.
           */

        maximumScore:
          20
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
        ...persistenceEvidence,

        score:
          persistenceScore,

        maximumScore:
          5
      }
    },

    /*
     * Canonical species-neutral relationship assessment.
     *
     * This field combines environmental relationship support
     * with confidence in that support. It is explanatory only
     * and does not modify habitat scores, model confidence, or
     * opportunity-type resolution.
     */
    relationshipAssessment,

    /*
     * Legacy species-neutral environmental relationship context.
     *
     * Preserved for backward compatibility during Relationship
     * Assessment Engine v1.0. New consumers should prefer
     * relationshipAssessment.relationshipContext.
     *
     * This field is explanatory only. It does not contribute
     * points, modify relationship-group scores, alter confidence,
     * or establish biological significance.
     */
    relationshipContext,

    /*
     * Blue Marlin-specific interpretation of the species-neutral
     * environmental pathway.
     *
     * This field is explanatory only and contributes no points.
     */
    speciesPathwayInterpretation,

    /*
     * Ranked Blue Marlin opportunity-type candidates.
     *
     * This field is explanatory only. It does not confirm an
     * opportunity type and contributes no habitat points.
     */
    opportunityTypeResolution,

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
      "pelora-blue-marlin-hsm-v1.7"
  };
}

const DYNAMIC_OPPORTUNITY_CANDIDATES_V1 = [
  {
    id:
      "madison-swanson",

    name:
      "Madison Swanson",

    category:
      "intelligence_zone",

    type:
      "Seamount",

    region:
      "West Florida",

    coordinates: [
      29.1917,
      -85.7333
    ]
  },

  {
    id:
      "green-canyon",

    name:
      "Green Canyon",

    category:
      "intelligence_zone",

    type:
      "Deepwater Structure",

    region:
      "Northern Gulf",

    coordinates: [
      27.65,
      -91.35
    ]
  },

  {
    id:
      "thunder-horse",

    name:
      "Thunder Horse",

    category:
      "oil_platform",

    type:
      "Deepwater Platform",

    region:
      "Mississippi Canyon",

    coordinates: [
      28.19,
      -88.49
    ]
  },

  {
    id:
      "desoto-canyon",

    name:
      "DeSoto Canyon",

    category:
      "intelligence_zone",

    type:
      "Canyon System",

    region:
      "Eastern Gulf",

    coordinates: [
      29.0,
      -87.5
    ]
  }
];


export function buildDynamicBlueMarlinOpportunity({
  location = null,
  oceanConditions = null
} = {}) {
  const score =
    oceanConditions
      ?.blueMarlinHabitat
      ?.confidence
      ?.components
      ?.confidenceAdjustedSuitability
      ?.score;

  const confidenceScore =
    oceanConditions
      ?.blueMarlinHabitat
      ?.confidence
      ?.score;

  const confidenceLevel =
    oceanConditions
      ?.blueMarlinHabitat
      ?.confidence
      ?.level ??
    null;

  const pathway =
    oceanConditions
      ?.oceanOpportunity
      ?.pathwayClassification
      ?.classification ??
    null;

  const primarySignal =
    oceanConditions
      ?.oceanSignals
      ?.primarySignal ??
    null;


  const available =
    Number.isFinite(score);


  return {
    available,

    species:
      "blue-marlin",

    location: {
      id:
        location?.id ??
        null,

      name:
        location?.name ??
        null,

      region:
        location?.region ??
        null,

      type:
        location?.type ??
        null,

      coordinates:
        Array.isArray(
          location?.coordinates
        )
          ? [
              ...location.coordinates
            ]
          : null
    },

    score:
      available
        ? score
        : null,

    confidence: {
      score:
        Number.isFinite(
          confidenceScore
        )
          ? confidenceScore
          : null,

      level:
        confidenceLevel
    },

    pathway,

    primarySignal: {
      type:
        primarySignal
          ?.signalType ??
        null,

      label:
        primarySignal
          ?.label ??
        null
    },

    observedAt:
      oceanConditions
        ?.observedAt ??
      null,

    limitations: [
      ...new Set(
        Array.isArray(
          oceanConditions
            ?.blueMarlinHabitat
            ?.limitations
        )
          ? oceanConditions
              .blueMarlinHabitat
              .limitations
          : []
      )
    ],

    interpretation:
      "governed-blue-marlin-location-opportunity",

    contractVersion:
      "pelora-dynamic-blue-marlin-opportunity-v1"
  };
}


export function rankDynamicBlueMarlinOpportunities(
  opportunities = []
) {
  return (
    Array.isArray(opportunities)
      ? opportunities
      : []
  )
    .filter(
      opportunity =>
        opportunity?.available ===
          true &&
        Number.isFinite(
          opportunity?.score
        )
    )
    .sort(
      (a, b) => {
        const scoreDifference =
          b.score -
          a.score;

        if (
          scoreDifference !== 0
        ) {
          return scoreDifference;
        }


        const confidenceA =
          Number.isFinite(
            a?.confidence?.score
          )
            ? a.confidence.score
            : -1;

        const confidenceB =
          Number.isFinite(
            b?.confidence?.score
          )
            ? b.confidence.score
            : -1;


        return (
          confidenceB -
          confidenceA
        );
      }
    )
    .map(
      (opportunity, index) => ({
        ...opportunity,

        rank:
          index + 1
      })
    );
}


async function getDynamicBlueMarlinOpportunities({
  bearerToken = null
} = {}) {
  const evaluations =
    await Promise.allSettled(
      DYNAMIC_OPPORTUNITY_CANDIDATES_V1
        .map(
          async location => {
            const [
              latitude,
              longitude
            ] =
              location.coordinates;


            const oceanConditions =
              await getOceanConditions(
                latitude,
                longitude,
                {
                  bearerToken
                }
              );


            return (
              buildDynamicBlueMarlinOpportunity({
                location,
                oceanConditions
              })
            );
          }
        )
    );


  const opportunities =
    evaluations
      .filter(
        result =>
          result.status ===
          "fulfilled"
      )
      .map(
        result =>
          result.value
      );


  const rankedOpportunities =
    rankDynamicBlueMarlinOpportunities(
      opportunities
    );


  const failedCandidateCount =
    evaluations.filter(
      result =>
        result.status ===
        "rejected"
    ).length;


  return {
    available:
      rankedOpportunities.length >
      0,

    species:
      "blue-marlin",

    generatedAt:
      new Date().toISOString(),

    candidateCount:
      DYNAMIC_OPPORTUNITY_CANDIDATES_V1
        .length,

    evaluatedCandidateCount:
      opportunities.length,

    failedCandidateCount,

    opportunities:
      rankedOpportunities,

    limitations: [
      "candidate-set-limited-to-curated-v1-locations",
      "does-not-scan-continuous-open-water-grid",
      "does-not-confirm-blue-marlin-presence",
      "does-not-estimate-catch-probability"
    ],

    interpretation:
      "dynamic-governed-blue-marlin-opportunity-ranking",

    contractVersion:
      "pelora-dynamic-blue-marlin-opportunities-v1"
  };
}


async function getOceanConditions(
  latitude,
  longitude,
  {
    bearerToken = null
  } = {}
) {

  const normalizedBearerToken =
    typeof bearerToken ===
      "string" &&
    bearerToken.trim() !==
      ""
      ? bearerToken.trim()
      : null;

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
    gapFilledChlorophyllResult,
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
        getGapFilledChlorophyllConditions(
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
          gapFilledChlorophyllResult
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




  const currentSpatialResult =
    await settleWithTiming(
      () =>
        getCurrentSpatialStructure(
          latitude,
          longitude
        )
    );


  const currentSpatialStructure =
    currentSpatialResult.status ===
    "fulfilled"
      ? currentSpatialResult.value
      : {
          available:
            false,

          observationType:
            "spatial-current-sampling",

          coverage:
            "unavailable",

          requestedSampleCount:
            4,

          validSampleCount:
            0,

          failedSampleCount:
            4,

          sufficientCoverage:
            false,

          sampleRadiusNauticalMiles:
            CURRENT_SPATIAL_SAMPLE_RADIUS_NM,

          vectors:
            [],

          measurements: {
            minimumSpeedKnots:
              null,

            maximumSpeedKnots:
              null,

            speedRangeKnots:
              null,

            maximumDirectionDifferenceDegrees:
              null,

            spatialVariation:
              "insufficient-spatial-current-data"
          },

          limitations: [
            "Spatial current sampling was unavailable."
          ]
        };


  if (
    currentSpatialResult.status ===
    "rejected"
  ) {
    console.warn(
      "Current spatial analysis failed:",
      currentSpatialResult.reason
    );
  }

  const directChlorophyllObservation =
    chlorophyllResult.status ===
    "fulfilled"
      ? chlorophyllResult.value
      : {
          concentrationMgM3: null,

          waterClassification:
            null,

          observedAt:
            null,

          ageHours:
            null,

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

            observationType:
              "direct-satellite",

            classification:
              "satellite-observation",

            availability:
              "provider-unavailable"
          }
        };


  const gapFilledChlorophyllObservation =
    gapFilledChlorophyllResult.status ===
    "fulfilled"
      ? gapFilledChlorophyllResult.value
      : {
          concentrationMgM3: null,

          waterClassification:
            null,

          observedAt:
            null,

          ageHours:
            null,

          source: {
            provider:
              "NOAA NESDIS CoastWatch",

            platform:
              "S-NPP + NOAA-20 VIIRS",

            dataset:
              CHLOROPHYLL_GAP_FILLED_DATASET,

            variable:
              "chlor_a",

            units:
              "mg m^-3",

            observationType:
              "gap-filled-reconstruction",

            algorithm:
              "DINEOF",

            resolutionKilometers:
              9,

            experimental:
              true,

            classification:
              "satellite-derived-reconstruction",

            availability:
              "provider-unavailable"
          }
        };


  const chlorophyllResolution =
    resolveChlorophyllObservation({
      observations: [
        directChlorophyllObservation,
        gapFilledChlorophyllObservation
      ]
    });


  const chlorophyll =
    chlorophyllResolution
      .selectedObservation ??
    {
      concentrationMgM3: null,

      waterClassification:
        null,

      observedAt:
        null,

      ageHours:
        null,

      source: {
        provider:
          null,

        classification:
          "chlorophyll-unavailable",

        availability:
          "unavailable"
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


           const currentOrganization =
    buildCurrentOrganizationAnalysis(
      currentSpatialStructure
    );


  const currentRelationshipContext =
    buildCurrentRelationshipContext(
      currentOrganization
    );


  const currentSpatialPattern =
    buildCurrentSpatialPatternAnalysis(
      currentSpatialStructure,
      currentRelationshipContext
    );


  const currentVectorProjection =
    buildCurrentVectorProjectionAnalysis(
      currentSpatialStructure
    );


  const currentGradient =
    buildCurrentGradientAnalysis(
      currentVectorProjection
    );


    const currentShear =
  buildCurrentShearAnalysis(
    currentGradient
  );


  const currentConvergence =
    buildCurrentConvergenceAnalysis(
      currentVectorProjection
    );




  const currentEdge =
    buildCurrentEdgeAnalysis(
      currentGradient,
      currentShear,
      currentSpatialPattern,
      currentConvergence
    );
currents.derived = {
    ...(
      currents
        ?.derived ??
      {}
    ),

    spatialAnalysis: {
      available:
        currentSpatialStructure
          ?.available ===
        true,

      spatialStructure:
        currentSpatialStructure,

      organization:
        currentOrganization,

      relationshipContext:
        currentRelationshipContext,

      spatialPattern:
        currentSpatialPattern,

      vectorProjection:
        currentVectorProjection,

      gradient:
        currentGradient,

      convergence:
        currentConvergence,

      edge:
        currentEdge,

      shear:
        currentShear,

      eddyBoundary:
        null,

      contractVersion:
        "pelora-current-spatial-analysis-v1"
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
            : (
                chlorophyllResult.status ===
                  "rejected" &&
                gapFilledChlorophyllResult.status ===
                  "rejected"
              )
              ? "degraded"
              : "unavailable",

      reason:
        chlorophyllIsCurrent
          ? chlorophyll.source
              ?.observationType ===
            "gap-filled-reconstruction"
            ? "current-gap-filled-reconstruction"
            : "current-satellite-observation"
          : chlorophyllHasValue
            ? "observation-exceeds-live-age-limit"
            : (
                chlorophyllResult.status ===
                  "rejected" &&
                gapFilledChlorophyllResult.status ===
                  "rejected"
              )
              ? "chlorophyll-providers-request-failed"
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
        chlorophyll.source
          ?.provider ??
        null,

      observationType:
        chlorophyll.source
          ?.observationType ??
        null
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
    latitude:
      marine.location.latitude,

    longitude:
      marine.location.longitude,

    sst,
    chlorophyll,
    currents,
    dataQuality
  });

const temperatureTransitionMapFeature =
  buildTemperatureTransitionMapFeature({
    latitude:
      marine.location.latitude,

    longitude:
      marine.location.longitude,

    temperatureEvidence:
      oceanEvidence
        ?.groups
        ?.temperature ??
      null,

    spatialStructure:
      sstSpatial
  });

const observationSnapshot =
  buildObservationSnapshot({
    location:
      marine.location,

    observedAt:
      marine.observedAt,

    generatedAt:
      marine.retrievedAt,

    observations: {
      wind:
        marine.wind,

      waves:
        marine.waves,

      swell:
        marine.swell,

      sst,

      chlorophyll,

      currents,

      moon
    },

    oceanEvidence,

    dataQuality
  });


    const backendSupabaseConfiguration =
    buildBackendSupabaseConfiguration();


  const oceanMemoryRowRetrieval =
    await retrieveOceanMemoryRows({
      configuration:
        backendSupabaseConfiguration,

      bearerToken:
        normalizedBearerToken,

      latitude,
      longitude,

      maximumRows:
        48
    });


      const adaptedHistoricalStorageRecords =
    Array.isArray(
      oceanMemoryRowRetrieval
        ?.rows
    )
      ? oceanMemoryRowRetrieval
          .rows
          .map(row =>
            buildOceanMemoryStorageRecordFromRow({
              row
            })
          )
          .filter(
            storageRecord =>
              storageRecord
                ?.available ===
              true
          )
      : [];


  const historicalSnapshotQuery =
  buildHistoricalSnapshotQuery({
    historicalSnapshots:
      adaptedHistoricalStorageRecords
  });

  const oceanMemoryTimeSeries =
    buildOceanMemoryTimeSeries({
      historicalSnapshots:
        historicalSnapshotQuery
          .historicalSnapshots
    });

  const oceanChangeFromTimeSeries =
    buildOceanChangeFromTimeSeries({
      timeSeries:
        oceanMemoryTimeSeries
    });

  const oceanPersistence =
    buildOceanPersistence({
      timeSeries:
        oceanMemoryTimeSeries
    });

  const oceanEvolution =
    buildOceanEvolution({
     oceanChange:
      oceanChangeFromTimeSeries,

    oceanPersistence
  });

  const temporalOceanExplainability =
    buildTemporalOceanExplainability({
      oceanEvolution
    });

  const oceanOpportunity =
    assessOceanOpportunity({
      oceanEvidence,
      oceanPersistence
    });

  const oceanSignals =
    resolveOceanSignals({
      oceanOpportunity
    });

  /*
   * These contracts are species-neutral even though they were
   * first consumed by the Blue Marlin HSM. Assemble them once
   * here so Ocean Memory does not depend on species internals.
   */
  const relationshipContext =
    buildRelationshipContext({
      oceanOpportunity,
      oceanEvidence
    });

  const relationshipAssessment =
    assessRelationships({
      relationshipContext,
      oceanOpportunity,
      oceanEvidence,
      dataQuality
    });

  const intelligenceSnapshot =
    buildIntelligenceSnapshot({
      observedAt:
        marine.observedAt,

      generatedAt:
        marine.retrievedAt,

      oceanOpportunity,

      relationshipContext,

      relationshipAssessment,

      oceanPhysicsExplainability:
        oceanEvidence
          ?.oceanPhysicsExplainability ??
        null,

      oceanOrganization:
        oceanEvidence
          ?.oceanOrganization ??
        null
    });

  const snapshotMetadata =
    buildSnapshotMetadata({
      observationSnapshot,

      intelligenceSnapshot,

      captureMode:
        "live",

      sourceType:
        "live-observation",

      lifecycleState:
        "live",

      reconstructionStatus:
        "not-applicable"
    });

  const oceanSnapshot =
    buildOceanSnapshot({
      snapshotMetadata,

      observationSnapshot,

      intelligenceSnapshot
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

    mapIntelligence: {
      temperatureTransition:
        temperatureTransitionMapFeature
    },

    /*
     * Observation Snapshot preserves the governed state of the
     * ocean at this place and time. It performs no comparison,
     * opportunity reasoning, biological reasoning, or guidance.
     */
    observationSnapshot,

    /*
     * Intelligence Snapshot preserves governed species-neutral
     * interpretation contracts without comparison, species
     * reasoning, or captain-facing guidance.
     */
    intelligenceSnapshot,

    /*
     * Snapshot Metadata is the authoritative identity and
     * provenance contract for the current Ocean Memory state.
     */
    snapshotMetadata,

    /*
     * Ocean Snapshot is the canonical immutable Ocean Memory
     * record for the current place and time.
     */
    oceanSnapshot,

    oceanOpportunity,

    oceanSignals,

    relationshipContext,

    relationshipAssessment,

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
  oceanMemory: {
    configured:
      backendSupabaseConfiguration
        .available,

    authenticated:
      normalizedBearerToken !==
        null,

    requestPerformed:
      oceanMemoryRowRetrieval
        .requestPerformed,

    responseOk:
      oceanMemoryRowRetrieval
        .summary
        .responseOk,

    returnedRowCount:
      oceanMemoryRowRetrieval
        .summary
        .returnedRowCount,

    validStorageRecordCount:
      adaptedHistoricalStorageRecords
        .length,

    historicalSnapshotCount:
      historicalSnapshotQuery
        .summary
        .returnedRecordCount,

    persistenceAvailable:
      oceanPersistence
        .available ===
      true
  },

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
            "/api/opportunities"
        ) {
          const species =
            requestUrl
              .searchParams
              .get("species");


          if (
            species !==
            "blue-marlin"
          ) {
            writeJson(
              response,
              400,
              {
                error:
                  "Dynamic opportunity ranking currently supports species=blue-marlin only.",

                supportedSpecies: [
                  "blue-marlin"
                ]
              }
            );

            return;
          }


          const authorizationHeader =
            request.headers
              .authorization ??
            null;


          const bearerToken =
            typeof authorizationHeader ===
              "string" &&
            authorizationHeader
              .startsWith(
                "Bearer "
              )
              ? authorizationHeader
                  .slice(
                    "Bearer ".length
                  )
                  .trim() ||
                null
              : null;


          const opportunities =
            await getDynamicBlueMarlinOpportunities({
              bearerToken
            });


          writeJson(
            response,
            200,
            opportunities
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

                    const authorizationHeader =
            request.headers
              .authorization ??
            null;

          const bearerToken =
            typeof authorizationHeader ===
              "string" &&
            authorizationHeader
              .startsWith(
                "Bearer "
              )
              ? authorizationHeader
                  .slice(
                    "Bearer ".length
                  )
                  .trim() ||
                null
              : null;


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
              longitude,
              {
                bearerToken
              }
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


const isDirectExecution =
  Boolean(process.argv[1]) &&
  import.meta.url ===
    pathToFileURL(
      process.argv[1]
    ).href;


if (
  isDirectExecution &&
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
