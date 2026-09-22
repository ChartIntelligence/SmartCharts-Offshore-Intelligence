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

      /*
       * Layer visibility
       */

      setVisibility(
        "structure-clusters",
        layers.locations !== false
      );

      setVisibility(
        "structure-cluster-count",
        layers.locations !== false
      );

      setVisibility(
        "fad-clusters",
        layers.locations !== false
      );

      setVisibility(
        "fad-cluster-count",
        layers.locations !== false
      );

      /*
       * Keep ocean evidence beneath
       * location and cluster context.
       */

      if (
        map.getLayer(
          "chlorophyll-raster"
        )
      ) {
        map.moveLayer(
          "chlorophyll-raster"
        );
      }

      if (
        map.getLayer(
          "structure-clusters"
        )
      ) {
        map.moveLayer(
          "structure-clusters"
        );
      }

      if (
        map.getLayer(
          "structure-cluster-count"
        )
      ) {
        map.moveLayer(
          "structure-cluster-count"
        );
      }

      if (
        map.getLayer(
          "fad-clusters"
        )
      ) {
        map.moveLayer(
          "fad-clusters"
        );
      }

      if (
        map.getLayer(
          "fad-cluster-count"
        )
      ) {
        map.moveLayer(
          "fad-cluster-count"
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
    layers.locations,
  ]);
}