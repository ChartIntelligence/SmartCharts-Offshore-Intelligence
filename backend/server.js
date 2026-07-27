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


async function fetchJson(url) {
  const response =
    await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent":
         "Pelora-Ocean-Intelligence/0.1 contact@peloraoffshore.com"
      }
    });

  if (!response.ok) {
    throw new Error(
      `Upstream request failed: ${response.status}`
    );
  }

  return response.json();
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


  const [
  weatherResult,
  marineResult
] = await Promise.allSettled([
  fetchJson(weatherUrl),
  fetchJson(marineUrl)
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
  );
}


if (
  marineResult.status === "rejected"
) {
  console.warn(
    "Marine data request failed:",
    marineResult.reason
  );
}


  const wind =
    weather?.current ?? {};

  const waves =
    marine?.current ?? {};


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
        metersPerSecondToKnots(
          wind.wind_speed_10m
        ),

      directionDegrees:
        safeNumber(
          wind.wind_direction_10m
        ),

      gustKnots:
        metersPerSecondToKnots(
          wind.wind_gusts_10m
        )
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
      provider: "Open-Meteo",

      weatherModel:
        weather?.current_units
          ? "Weather Forecast API"
          : null,

      marineModel:
        marine?.current_units
          ? "Marine Forecast API"
          : null
    }
  };
}


async function getOceanConditions(
  latitude,
  longitude
) {
  const [
    marineResult,
    chlorophyllResult,
    currentsResult
  ] = await Promise.allSettled([
    getMarineConditions(
      latitude,
      longitude
    ),

    getChlorophyllConditions(
      latitude,
      longitude
    ),

    getCurrentConditions(
      latitude,
      longitude
    )
  ]);


  if (
    marineResult.status === "rejected"
  ) {
    throw marineResult.reason;
  }


  const marine =
    marineResult.value;


  const moon =
    getMoonConditions();




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