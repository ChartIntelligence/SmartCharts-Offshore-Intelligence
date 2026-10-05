import {sourceNumber, sourceScaledNumber, roundFinite} from './sourceNormalization.mjs';
import {resolveScientificAssessmentV1, requireScientificAssessmentV1, scientificAgeHoursV1} from './scientificAssessment.mjs';

export const CURRENTS_DATASET = 'noaacwBLENDEDNRTcurrentsDaily';
// Pure scientific/provider helpers extracted verbatim from the established path.
export function metersPerSecondToKnots(value) {
  return sourceScaledNumber(value, 1.94384);
}

export function currentDirectionDegrees(
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

export function classifyCurrentStrength(
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

export function currentCompassDirection(
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

export function resolveProviderCoordinates(latitude, longitude) {
  return {
    resolvedLatitude: Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
      ? latitude : null,
    resolvedLongitude: Number.isFinite(longitude) && longitude >= -180 && longitude <= 360
      ? (longitude > 180 ? longitude - 360 : longitude) : null
  };
}

function getAgeHours(timestamp, assessment) {
  return scientificAgeHoursV1(timestamp, requireScientificAssessmentV1(assessment));
}

// Transport is mandatory and local to each call; this module never calls global fetch.
// TIME means an ERDDAP coordinate selector, not proof of a provider revision.
export function currentProviderRequest(latitude, longitude, selector = {mode:'LATEST'}) {
  // Retain the caller's primitive selector values before validation or URL use.
  const mode = selector?.mode;
  const selectedTime = mode === 'TIME' ? selector.time : undefined;
  let time;
  if (mode === 'LATEST' && Object.keys(selector).length === 1) time = 'last';
  else if (mode === 'TIME' && Object.keys(selector).length === 2 &&
    typeof selectedTime === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(selectedTime) &&
    Number.isFinite(Date.parse(selectedTime)) && new Date(selectedTime).toISOString() === (selectedTime.includes('.') ? selectedTime : selectedTime.replace('Z','.000Z'))) time = selectedTime;
  else throw new TypeError('Unsupported current provider-time selector');
  const query = [
    `u_current[(${time})][(${latitude})][(${longitude})]`,
    `v_current[(${time})][(${latitude})][(${longitude})]`
  ].join(',');
  const url = new URL(`https://coastwatch.noaa.gov/erddap/griddap/${CURRENTS_DATASET}.json`);
  url.search = `?${encodeURIComponent(query)}`;
  return url;
}

export function parseCurrentProviderResponse(payload, latitude, longitude, assessment) {
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
        null,

      resolvedLongitude:
        null,

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
    sourceNumber(
      valueAt("u_current")
    );

  const northward =
    sourceNumber(
      valueAt("v_current")
    );

  const observedAt =
    valueAt("time") ?? null;

  const ageHours =
    getAgeHours(observedAt, assessment);

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
    ...resolveProviderCoordinates(valueAt("latitude"), valueAt("longitude")),
    requestedLatitude:
      latitude,

    requestedLongitude:
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
        : roundFinite(eastward, 4),

    northwardMetersPerSecond:
      northward === null
        ? null
        : roundFinite(northward, 4),

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

export async function acquireCurrentProviderPoint(latitude, longitude, assessment, transport, selector = {mode:'LATEST'}) {
  assessment = resolveScientificAssessmentV1(assessment);
  if (typeof transport !== 'function') throw new TypeError('Explicit current provider transport required');
  const payload = await transport(currentProviderRequest(latitude, longitude, selector));
  return parseCurrentProviderResponse(payload, latitude, longitude, assessment);
}
