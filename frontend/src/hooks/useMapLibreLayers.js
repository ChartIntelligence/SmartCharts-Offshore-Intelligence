import { useEffect } from "react";
import {enforcePeloraLayerOrder} from "../utils/peloraMapStyle.js";

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

      enforcePeloraLayerOrder(map);
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