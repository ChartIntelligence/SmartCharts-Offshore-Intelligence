import { useEffect } from "react";

export function useMapLibreLayers({
  mapRef,
  layers,
}) {
  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const updateLayers = () => {
      const setVisibility = (
        layerId,
        visible
      ) => {
        if (!map.getLayer(layerId)) {
          return;
        }

        map.setLayoutProperty(
          layerId,
          "visibility",
          visible ? "visible" : "none"
        );
      };

      const setPaintProperty = (
        layerId,
        property,
        value
      ) => {
        if (!map.getLayer(layerId)) {
          return;
        }

        map.setPaintProperty(
          layerId,
          property,
          value
        );
      };

      /*
       * Layer visibility
       */

      setVisibility(
        "sst-overlay",
        layers.sst
      );

      setVisibility(
        "blue-marlin-heatmap",
        layers.marlin
      );

      setVisibility(
        "yellowfin-activity",
        layers.yellowfin
      );

      setVisibility(
        "blackfin-activity",
        layers.blackfin
      );

      setVisibility(
  "structure-clusters",
  layers.locations !== false
);

setVisibility(
  "structure-cluster-count",
  layers.locations !== false
);

      /*
       * SST styling
       */

      setPaintProperty(
        "sst-overlay",
        "circle-opacity",
        layers.sstOpacity ?? 0.28
      );

      /*
       * Blue marlin heatmap styling
       */

      setPaintProperty(
        "blue-marlin-heatmap",
        "heatmap-opacity",
        layers.marlinOpacity ?? 0.62
      );

      /*
       * Keep the intelligence layers in the correct order.
       *
       * SST remains underneath.
       * Marlin probability remains above SST.
       * Tuna activity remains above both.
       */

      if (
        map.getLayer("sst-overlay") &&
        map.getLayer("blue-marlin-heatmap")
      ) {
        map.moveLayer(
          "blue-marlin-heatmap"
        );
      }

      if (
        map.getLayer("yellowfin-activity")
      ) {
        map.moveLayer(
          "yellowfin-activity"
        );
      }

      if (
        map.getLayer("blackfin-activity")
      ) {
        map.moveLayer(
          "blackfin-activity"
        );
      }

      if (
  map.getLayer("structure-clusters")
) {
  map.moveLayer(
    "structure-clusters"
  );
}

if (
  map.getLayer("structure-cluster-count")
) {
  map.moveLayer(
    "structure-cluster-count"
  );
}
    };

    if (map.isStyleLoaded()) {
      updateLayers();
    } else {
      map.once(
        "load",
        updateLayers
      );
    }

    return () => {
      map.off(
        "load",
        updateLayers
      );
    };
  }, [
    mapRef,
    layers.sst,
    layers.sstOpacity,
    layers.marlin,
    layers.marlinOpacity,
    layers.yellowfin,
    layers.blackfin,
    layers.locations,
  ]);
}