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
        Accept: "application/json"
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
  const marine =
    await getMarineConditions(
      latitude,
      longitude
    );

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
    marine.sst?.temperatureFahrenheit
  )
    ? "live"
    : "unavailable",
      chlorophyll: "not-connected",
      currents: "not-connected",
      moon: "not-connected"
    },

    wind:
      marine.wind,

    waves:
      marine.waves,

    swell:
      marine.swell,

    sst: {
  temperatureFahrenheit:
    marine.sst?.temperatureFahrenheit ??
    null,

  temperatureCelsius:
    marine.sst?.temperatureCelsius ??
    null,

  source: {
    provider: "Open-Meteo",
    classification: "forecast-model"
  }
},

    chlorophyll: {
      concentrationMgM3: null,
      waterClassification: null,
      source: null
    },

    currents: {
      speedKnots: null,
      directionDegrees: null,
      source: null
    },

    moon: {
      phase: null,
      illuminationPercent: null
    },

    source: {
      marine:
        marine.source
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