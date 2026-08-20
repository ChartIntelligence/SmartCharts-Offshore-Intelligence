import { useEffect } from "react";


const OCEAN_FEATURE_SOURCE_ID =
  "pelora-ocean-features";


const emptyFeatureCollection = () => ({
  type:
    "FeatureCollection",

  features:
    []
});


function buildTemperatureTransitionFeatures(
  temperatureTransition
) {
  if (
    temperatureTransition
      ?.available !==
      true ||
    temperatureTransition
      ?.geometryStatus !==
      "evidence-footprint-only"
  ) {
    return [];
  }


  const samples =
    temperatureTransition
      ?.samplingFootprint
      ?.samples;


  if (
    !Array.isArray(samples)
  ) {
    return [];
  }


  return samples
    .filter(
      sample =>
        Number.isFinite(
          sample?.latitude
        ) &&
        Number.isFinite(
          sample?.longitude
        )
    )
    .map(
      sample => ({
        type:
          "Feature",

        geometry: {
          type:
            "Point",

          coordinates: [
            sample.longitude,
            sample.latitude
          ]
        },

        properties: {
          featureType:
            "temperature-transition",

          representation:
            "sampling-point",

          direction:
            sample.direction ??
            null,

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
            null,

          classification:
            temperatureTransition
              .classification ??
            null,

          geometryStatus:
            temperatureTransition
              .geometryStatus,

          confidenceLevel:
            temperatureTransition
              ?.confidence
              ?.level ??
            null,

          confidenceScore:
            Number.isFinite(
              temperatureTransition
                ?.confidence
                ?.score
            )
              ? temperatureTransition
                  .confidence
                  .score
              : null
        }
      })
    );
}


function buildOceanFeatureGeoJson(
  mapIntelligence
) {
  const temperatureFeatures =
    buildTemperatureTransitionFeatures(
      mapIntelligence
        ?.temperatureTransition
    );


  return {
    type:
      "FeatureCollection",

    features:
      temperatureFeatures
  };
}


export function useMapLibreOceanFeatures({
  mapRef,
  mapIntelligence
}) {
  useEffect(() => {
    const map =
      mapRef.current;


    if (!map) {
      return;
    }


    const updateOceanFeatureSource =
      () => {
        if (!mapRef.current) {
          return;
        }


        const geoJson =
          buildOceanFeatureGeoJson(
            mapIntelligence
          );


        const source =
          map.getSource(
            OCEAN_FEATURE_SOURCE_ID
          );


        if (
          source &&
          typeof source.setData ===
            "function"
        ) {
          source.setData(
            geoJson
          );
        } else {
          map.addSource(
            OCEAN_FEATURE_SOURCE_ID,
            {
              type:
                "geojson",

              data:
                geoJson ??
                emptyFeatureCollection()
            }
          );
        }


        if (
          !map.getLayer(
            "pelora-temperature-transition-samples"
          )
        ) {
          map.addLayer({
            id:
              "pelora-temperature-transition-samples",

            type:
              "circle",

            source:
              OCEAN_FEATURE_SOURCE_ID,

            filter: [
              "all",

              [
                "==",
                ["get", "featureType"],
                "temperature-transition"
              ],

              [
                "==",
                ["get", "representation"],
                "sampling-point"
              ]
            ],

            paint: {
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],

                4,
                5,

                8,
                8,

                12,
                11
              ],

              "circle-opacity":
                0.72,

              "circle-stroke-width":
                2,

              "circle-stroke-opacity":
                0.95
            }
          });
        }
      };


    if (
      map.isStyleLoaded()
    ) {
      updateOceanFeatureSource();
    } else {
      map.once(
        "load",
        updateOceanFeatureSource
      );
    }


    return () => {
      map.off(
        "load",
        updateOceanFeatureSource
      );
    };
  }, [
    mapRef,
    mapIntelligence
  ]);
}