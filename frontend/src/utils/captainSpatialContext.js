const EARTH_RADIUS_NAUTICAL_MILES =
  3440.065;


export const CAPTAIN_SPATIAL_CONTEXT_VERSION =
  "pelora-captain-spatial-context-v1";


export const TRIP_ORIGIN_SOURCES = [
  "gps",
  "saved",
  "search",
  "manual"
];


export function nauticalMilesBetween(
  firstCoordinates,
  secondCoordinates
) {
  const first =
    normalizeLatLonCoordinates(
      firstCoordinates
    );

  const second =
    normalizeLatLonCoordinates(
      secondCoordinates
    );


  if (!first || !second) {
    return null;
  }


  const [
    firstLatitude,
    firstLongitude
  ] = first;

  const [
    secondLatitude,
    secondLongitude
  ] = second;


  const toRadians =
    degrees =>
      degrees * Math.PI / 180;


  const latitudeDifference =
    toRadians(
      secondLatitude -
      firstLatitude
    );

  const longitudeDifference =
    toRadians(
      secondLongitude -
      firstLongitude
    );


  const firstLatitudeRadians =
    toRadians(
      firstLatitude
    );

  const secondLatitudeRadians =
    toRadians(
      secondLatitude
    );


  const haversine =
    Math.sin(
      latitudeDifference / 2
    ) ** 2 +
    Math.cos(
      firstLatitudeRadians
    ) *
    Math.cos(
      secondLatitudeRadians
    ) *
    Math.sin(
      longitudeDifference / 2
    ) ** 2;


  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(haversine),
      Math.sqrt(
        1 - haversine
      )
    );


  return Number(
    (
      EARTH_RADIUS_NAUTICAL_MILES *
      angularDistance
    ).toFixed(1)
  );
}


export function normalizeTripOrigin(
  origin
) {
  if (
    !origin ||
    typeof origin !== "object"
  ) {
    return null;
  }


  const coordinates =
    normalizeLatLonCoordinates(
      origin.coordinates
    );


  if (!coordinates) {
    return null;
  }


  const source =
    TRIP_ORIGIN_SOURCES.includes(
      origin.source
    )
      ? origin.source
      : "manual";


  return {
    source,

    name:
      typeof origin.name === "string" &&
      origin.name.trim()
        ? origin.name.trim()
        : "Current Trip Origin",

    coordinates
  };
}


export function normalizeOperatingRangeNm(
  value
) {
  const range =
    Number(value);


  if (
    !Number.isFinite(range) ||
    range <= 0
  ) {
    return null;
  }


  return Number(
    range.toFixed(1)
  );
}


export function buildCaptainSpatialContext({
  origin = null,
  operatingRangeNm = null,
  explorationMode =
    "within-range"
} = {}) {
  const normalizedOrigin =
    normalizeTripOrigin(
      origin
    );

  const normalizedRange =
    normalizeOperatingRangeNm(
      operatingRangeNm
    );


  const entireGulf =
    explorationMode ===
      "entire-gulf";


  return {
    available:
      entireGulf ||
      Boolean(
        normalizedOrigin &&
        normalizedRange
      ),

    explorationMode:
      entireGulf
        ? "entire-gulf"
        : "within-range",

    origin:
      normalizedOrigin,

    operatingRangeNm:
      normalizedRange,

    contractVersion:
      CAPTAIN_SPATIAL_CONTEXT_VERSION
  };
}


export function buildOpportunityRangeContext({
  captainSpatialContext = null,
  opportunityCoordinates = null
} = {}) {
  const entireGulf =
    captainSpatialContext
      ?.explorationMode ===
    "entire-gulf";


  if (entireGulf) {
    return {
      available: true,
      distanceNm: null,
      withinSelectedRange: true,
      reason:
        "entire-gulf-exploration"
    };
  }


  const originCoordinates =
    captainSpatialContext
      ?.origin
      ?.coordinates;


  const operatingRangeNm =
    normalizeOperatingRangeNm(
      captainSpatialContext
        ?.operatingRangeNm
    );


  const distanceNm =
    nauticalMilesBetween(
      originCoordinates,
      opportunityCoordinates
    );


  if (
    !Number.isFinite(
      distanceNm
    ) ||
    !Number.isFinite(
      operatingRangeNm
    )
  ) {
    return {
      available: false,
      distanceNm: null,
      withinSelectedRange: null,
      reason:
        "range-context-insufficient"
    };
  }


  return {
    available: true,

    distanceNm,

    withinSelectedRange:
      distanceNm <=
      operatingRangeNm,

    reason:
      distanceNm <=
        operatingRangeNm
        ? "within-selected-range"
        : "outside-selected-range"
  };
}


function normalizeLatLonCoordinates(
  coordinates
) {
  if (
    !Array.isArray(
      coordinates
    ) ||
    coordinates.length < 2
  ) {
    return null;
  }


  const latitude =
    Number(
      coordinates[0]
    );

  const longitude =
    Number(
      coordinates[1]
    );


  if (
    !Number.isFinite(
      latitude
    ) ||
    !Number.isFinite(
      longitude
    ) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }


  return [
    latitude,
    longitude
  ];
}