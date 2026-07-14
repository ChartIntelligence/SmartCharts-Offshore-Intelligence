import { useEffect } from "react";
import maplibregl from "maplibre-gl";

export function useMapLibreSetup({
  containerRef,
  mapRef,
  geoJson,
  structureClusterGeoJson,
  layers,
}) {
  useEffect(() => {
    if (
      mapRef.current ||
      !containerRef.current
    ) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,

      style:
        "https://demotiles.maplibre.org/style.json",

      center: [-89, 27.5],

      zoom: 4.6,

      attributionControl: true,
    });

    /*
     * Set this immediately so React development mode
     * cannot create a second map during initialization.
     */
    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
      }),
      "top-right"
    );

    const initializeMap = () => {
      /*
       * Stop if this map was removed during a hot reload.
       */
      if (!mapRef.current) {
        return;
      }

      if (
        !map.getSource(
          "smartcharts-locations"
        )
      ) {
        map.addSource(
          "smartcharts-locations",
          {
            type: "geojson",
            data: geoJson,
          }
        );
      }

      if (
        !map.getSource(
          "velion-structure-clusters"
        )
      ) {
        map.addSource(
          "velion-structure-clusters",
          {
            type: "geojson",

            data:
              structureClusterGeoJson ?? {
                type: "FeatureCollection",
                features: [],
              },

            cluster: true,

            clusterMaxZoom: 8,

            clusterRadius: 55,
          }
        );
      }


      if (!map.getLayer("sst-overlay")) {
        map.addLayer({
          id: "sst-overlay",

          type: "circle",

          source: "smartcharts-locations",

          layout: {
            visibility:
              layers.sst
                ? "visible"
                : "none",
          },

          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],

              3,
              35,

              6,
              80,

              9,
              145,
            ],

            "circle-color": [
              "interpolate",
              ["linear"],
              ["coalesce", ["get", "sst"], 78],

              76,
              "#173f73",

              78,
              "#2468a2",

              79,
              "#2f91b7",

              80,
              "#45b8bd",

              81,
              "#78d2c4",

              82,
              "#d8e7a8",

              84,
              "#f1d27a",
            ],

            "circle-opacity":
              layers.sstOpacity ?? 0.24,

            "circle-blur": 0.6,

            "circle-stroke-width": 0,
          },
        });
      }


      if (
        !map.getLayer(
          "blue-marlin-heatmap"
        )
      ) {
        map.addLayer({
          id: "blue-marlin-heatmap",

          type: "heatmap",

          source: "smartcharts-locations",

          maxzoom: 10,

          layout: {
            visibility:
              layers.marlin
                ? "visible"
                : "none",
          },

          paint: {
            "heatmap-weight": [
              "interpolate",
              ["linear"],
              ["coalesce", ["get", "score"], 0],

              0,
              0,

              100,
              1,
            ],

            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],

              3,
              0.8,

              8,
              2.3,
            ],

            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],

              3,
              35,

              8,
              80,
            ],

            "heatmap-opacity":
              layers.marlinOpacity ?? 0.62,

            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],

              0,
              "rgba(255, 215, 0, 0)",

              0.18,
              "rgba(255, 210, 70, 0.2)",

              0.38,
              "rgba(255, 174, 35, 0.45)",

              0.58,
              "rgba(255, 113, 20, 0.68)",

              0.76,
              "rgba(235, 55, 18, 0.82)",

              0.9,
              "rgba(170, 20, 10, 0.92)",

              1,
              "rgba(85, 0, 0, 0.98)",
            ],
          },
        });
      }


      if (
        !map.getLayer(
          "yellowfin-activity"
        )
      ) {
        map.addLayer({
          id: "yellowfin-activity",

          type: "circle",

          source: "smartcharts-locations",

          filter: [
  "all",

  [
    "==",
    ["get", "category"],
    "intelligence_zone",
  ],

  [
    ">",
    [
      "coalesce",
      ["get", "yellowfin"],
      0,
    ],
    0,
  ],
],

          layout: {
            visibility:
              layers.yellowfin
                ? "visible"
                : "none",
          },

          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              [
                "coalesce",
                ["get", "yellowfin"],
                0,
              ],

              0,
              0,

              100,
              28,
            ],

            "circle-color": "#ffd700",

            "circle-opacity": 0.2,

            "circle-stroke-color":
              "#ffd700",

            "circle-stroke-width": 1,
          },
        });
      }



      if (
        !map.getLayer(
          "blackfin-activity"
        )
      ) {
        map.addLayer({
          id: "blackfin-activity",

          type: "circle",

          source: "smartcharts-locations",

          filter: [
  "all",

  [
    "==",
    ["get", "category"],
    "intelligence_zone",
  ],

  [
    ">",
    [
      "coalesce",
      ["get", "blackfin"],
      0,
    ],
    0,
  ],
],

          layout: {
            visibility:
              layers.blackfin
                ? "visible"
                : "none",
          },

          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              [
                "coalesce",
                ["get", "blackfin"],
                0,
              ],

              0,
              0,

              100,
              23,
            ],

            "circle-color": "#111111",

            "circle-opacity": 0.25,

            "circle-stroke-color":
              "#9aa7af",

            "circle-stroke-width": 1,
          },
        });
      }


      if (
        !map.getLayer(
          "structure-clusters"
        )
      ) {
        map.addLayer({
          id: "structure-clusters",

          type: "circle",

          source:
            "velion-structure-clusters",

          filter: [
            "has",
            "point_count",
          ],

          layout: {
            visibility:
              layers.locations !== false
                ? "visible"
                : "none",
          },

          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],

              "#183f59",

              10,
              "#175c78",

              30,
              "#137b91",

              75,
              "#0d9aaa",
            ],

            "circle-radius": [
              "step",
              ["get", "point_count"],

              17,

              10,
              21,

              30,
              26,

              75,
              32,
            ],

            "circle-stroke-color":
              "rgba(255, 255, 255, 0.85)",

            "circle-stroke-width": 2,

            "circle-opacity": 0.92,
          },
        });
      }


      if (
        !map.getLayer(
          "structure-cluster-count"
        )
      ) {
        map.addLayer({
          id: "structure-cluster-count",

          type: "symbol",

          source:
            "velion-structure-clusters",

          filter: [
            "has",
            "point_count",
          ],

          layout: {
            visibility:
              layers.locations !== false
                ? "visible"
                : "none",

            "text-field": [
              "get",
              "point_count_abbreviated",
            ],

            "text-size": 13,

            /*
             * Do not specify a custom font.
             * The demo style will use its
             * available default font.
             */
            "text-allow-overlap": true,
          },

          paint: {
            "text-color": "#ffffff",
          },
        });
      }
    };


    const handleClusterClick = async (
      event
    ) => {
      const features =
        map.queryRenderedFeatures(
          event.point,
          {
            layers: [
              "structure-clusters",
            ],
          }
        );

      const clusterFeature =
        features[0];

      if (!clusterFeature) {
        return;
      }

      const clusterId =
        clusterFeature.properties
          ?.cluster_id;

      const source =
        map.getSource(
          "velion-structure-clusters"
        );

      if (
        clusterId === undefined ||
        !source
      ) {
        return;
      }

      try {
        const zoom =
          await source
            .getClusterExpansionZoom(
              clusterId
            );

        map.easeTo({
          center:
            clusterFeature.geometry
              .coordinates,

          zoom:
            Math.min(zoom, 10),

          duration: 550,
        });
      } catch (error) {
        console.error(
          "Unable to expand structure cluster:",
          error
        );
      }
    };


    const showClusterPointer = () => {
      map.getCanvas().style.cursor =
        "pointer";
    };


    const hideClusterPointer = () => {
      map.getCanvas().style.cursor =
        "";
    };


    /*
     * `once` prevents repeated initialization
     * during hot reload.
     */
    map.once(
      "load",
      initializeMap
    );

    map.on(
      "click",
      "structure-clusters",
      handleClusterClick
    );

    map.on(
      "mouseenter",
      "structure-clusters",
      showClusterPointer
    );

    map.on(
      "mouseleave",
      "structure-clusters",
      hideClusterPointer
    );


    return () => {
      map.off(
        "load",
        initializeMap
      );

      map.off(
        "click",
        "structure-clusters",
        handleClusterClick
      );

      map.off(
        "mouseenter",
        "structure-clusters",
        showClusterPointer
      );

      map.off(
        "mouseleave",
        "structure-clusters",
        hideClusterPointer
      );

      map.remove();

      if (mapRef.current === map) {
        mapRef.current = null;
      }
    };
  }, [
    containerRef,
    mapRef,
    geoJson,
    structureClusterGeoJson,
  ]);
}