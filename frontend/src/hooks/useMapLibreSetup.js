import { useEffect } from "react";
import maplibregl from "maplibre-gl";

export function useMapLibreSetup({
  containerRef,
  mapRef,
  geoJson,
  structureClusterGeoJson,
  fadClusterGeoJson,
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

            clusterMaxZoom: 7,

            clusterRadius: 55,
          }
        );
      }

            if (
        !map.getSource(
          "pelora-fad-clusters"
        )
      ) {
        map.addSource(
          "pelora-fad-clusters",
          {
            type: "geojson",

            data:
              fadClusterGeoJson ?? {
                type: "FeatureCollection",
                features: [],
              },

            cluster: true,

            clusterMaxZoom: 7,

            clusterRadius: 55,
          }
        );
      }

      /*
 * Use yesterday's UTC date because today's
 * satellite composite may still be incomplete.
 */


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


      const ensureClusterIcon = (
        name,
        fillColor,
        strokeColor
      ) => {
        if (map.hasImage(name)) {
          return;
        }

        const canvas =
          document.createElement("canvas");

        canvas.width = 28;
        canvas.height = 24;

        const context =
          canvas.getContext("2d");

        if (!context) {
          return;
        }

        context.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        context.lineWidth = 1.5;
        context.strokeStyle =
          strokeColor;
        context.fillStyle =
          fillColor;

        /*
         * Three offset tiles create a
         * clear "grouped locations" symbol.
         */
        context.fillRect(
          9,
          3,
          13,
          13
        );
        context.strokeRect(
          9,
          3,
          13,
          13
        );

        context.fillRect(
          6,
          6,
          13,
          13
        );
        context.strokeRect(
          6,
          6,
          13,
          13
        );

        context.fillRect(
          3,
          9,
          13,
          13
        );
        context.strokeRect(
          3,
          9,
          13,
          13
        );

        map.addImage(
          name,
          context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          ),
          {
            pixelRatio: 1,
          }
        );
      };

      ensureClusterIcon(
        "pelora-structure-cluster",
        "#294f61",
        "#d3e9f1"
      );

      ensureClusterIcon(
        "pelora-fad-cluster",
        "#365665",
        "#e8bd70"
      );


      if (
        !map.getLayer(
          "structure-clusters"
        )
      ) {
        map.addLayer({
          id: "structure-clusters",

          type: "symbol",

          maxzoom: 8,

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

            "icon-image":
              "pelora-structure-cluster",

            "icon-size":
              0.98,

            "icon-allow-overlap":
              true,
          },
        });
      }


      if (
        !map.getLayer(
          "structure-cluster-count"
        )
      ) {
        map.addLayer({
          id:
            "structure-cluster-count",

          type: "symbol",

          maxzoom: 8,

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

            "text-size":
              12,

            "text-anchor":
              "left",

            "text-offset": [
              1.1,
              0,
            ],

            "text-allow-overlap":
              true,
          },

          paint: {
            "text-color":
              "#e8f6fb",

            "text-halo-color":
              "rgba(4, 20, 29, 0.92)",

            "text-halo-width":
              1.5,
          },
        });
      }

      if (
        !map.getLayer(
          "fad-clusters"
        )
      ) {
        map.addLayer({
          id: "fad-clusters",

          type: "symbol",

          maxzoom: 8,

          source:
            "pelora-fad-clusters",

          filter: [
            "has",
            "point_count",
          ],

          layout: {
            visibility:
              layers.locations !== false
                ? "visible"
                : "none",

            "icon-image":
              "pelora-fad-cluster",

            "icon-size":
              0.98,

            "icon-allow-overlap":
              true,
          },
        });
      }


      if (
        !map.getLayer(
          "fad-cluster-count"
        )
      ) {
        map.addLayer({
          id:
            "fad-cluster-count",

          type:
            "symbol",

          maxzoom: 8,

          source:
            "pelora-fad-clusters",

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

            "text-size":
              12,

            "text-anchor":
              "left",

            "text-offset": [
              1.1,
              0,
            ],

            "text-allow-overlap":
              true,
          },

          paint: {
            "text-color":
              "#f6e5bd",

            "text-halo-color":
              "rgba(4, 20, 29, 0.92)",

            "text-halo-width":
              1.5,
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


        const handleFadClusterClick =
      async (event) => {
        const features =
          map.queryRenderedFeatures(
            event.point,
            {
              layers: [
                "fad-clusters",
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
            "pelora-fad-clusters"
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
              Math.min(
                zoom,
                10
              ),

            duration:
              550,
          });
        } catch (error) {
          console.error(
            "Unable to expand FAD cluster:",
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
      "click",
      "fad-clusters",
      handleFadClusterClick
    );

    map.on(
      "mouseenter",
      "fad-clusters",
      showClusterPointer
    );

    map.on(
      "mouseleave",
      "fad-clusters",
      hideClusterPointer
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

      map.off(
        "click",
        "fad-clusters",
        handleFadClusterClick
      );

      map.off(
        "mouseenter",
        "fad-clusters",
        showClusterPointer
      );

      map.off(
        "mouseleave",
        "fad-clusters",
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
    fadClusterGeoJson,
  ]);
}
