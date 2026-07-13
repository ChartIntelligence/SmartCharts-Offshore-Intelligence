import { useEffect } from "react";
import maplibregl from "maplibre-gl";

export function useMapLibreSetup({
  containerRef,
  mapRef,
  geoJson,
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

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
      }),

      "top-right"
    );

    map.on("load", () => {
      map.addSource(
        "smartcharts-locations",
        {
          type: "geojson",
          data: geoJson,
        }
      );

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
            ["get", "sst"],

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
            ["get", "score"],

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

      map.addLayer({
        id: "yellowfin-activity",

        type: "circle",

        source: "smartcharts-locations",

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
            ["get", "yellowfin"],

            0,
            5,

            100,
            28,
          ],

          "circle-color": "#ffd700",

          "circle-opacity": 0.2,

          "circle-stroke-color": "#ffd700",

          "circle-stroke-width": 1,
        },
      });

      map.addLayer({
        id: "blackfin-activity",

        type: "circle",

        source: "smartcharts-locations",

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
            ["get", "blackfin"],

            0,
            5,

            100,
            23,
          ],

          "circle-color": "#111111",

          "circle-opacity": 0.25,

          "circle-stroke-color": "#9aa7af",

          "circle-stroke-width": 1,
        },
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [
    containerRef,
    geoJson,
    mapRef,
  ]);
}