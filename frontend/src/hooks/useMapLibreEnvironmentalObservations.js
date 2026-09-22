import { useEffect } from "react";
import maplibregl from "maplibre-gl";
import { OBSERVATION_SOURCE, OBSERVATION_LAYERS, observationLayerDefinitions,
  observationImages, observationInspection } from "../utils/mapObservationDisplay.js";

export function useMapLibreEnvironmentalObservations({ mapRef, observationDisplay, layers }) {
  const { temperatureSamples, chlorophyll, currents } = layers;
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let popup = null;
    const sync = () => {
      if (mapRef.current !== map) return;
      const data = observationDisplay.geoJson;
      if (map.getSource(OBSERVATION_SOURCE)) map.getSource(OBSERVATION_SOURCE).setData(data);
      else map.addSource(OBSERVATION_SOURCE, { type: "geojson", data });
      for (const [id, image] of Object.entries(observationImages())) {
        if (!map.hasImage(id)) map.addImage(id, image);
      }
      for (const layer of observationLayerDefinitions({ temperatureSamples, chlorophyll, currents })) {
        if (!map.getLayer(layer.id)) map.addLayer(layer);
        else map.setLayoutProperty(layer.id, "visibility", layer.layout.visibility);
      }
    };
    const inspect = event => {
      const ids = OBSERVATION_LAYERS.filter(id => map.getLayer(id));
      if (!ids.length) return;
      const { x, y } = event.point;
      const features = map.queryRenderedFeatures([[x-5,y-5],[x+5,y+5]], { layers: ids });
      if (!features.length) return;
      const content = document.createElement("div");
      content.className = "environmental-observation-inspection";
      const seen = new Set();
      for (const feature of features) {
        const p = feature.properties;
        if (seen.has(p.observationId)) continue;
        seen.add(p.observationId);
        const section = document.createElement("section");
        observationInspection(p).forEach((text,index) => {
          const line = document.createElement(index === 0 ? "strong" : "p");
          line.textContent = text;
          section.appendChild(line);
        });
        content.appendChild(section);
      }
      popup?.remove();
      popup = new maplibregl.Popup({ maxWidth: "280px", offset: 18 })
        .setLngLat(features[0].geometry.coordinates).setDOMContent(content).addTo(map);
    };
    if (map.isStyleLoaded()) sync();
    // Source loading can temporarily make isStyleLoaded false after load fired.
    else map.once("idle", sync);
    map.on("load", sync);
    map.on("style.load", sync);
    map.on("click", inspect);
    return () => {
      map.off("idle", sync);
      map.off("load", sync);
      map.off("style.load", sync);
      map.off("click", inspect);
      popup?.remove();
    };
  }, [mapRef, observationDisplay, temperatureSamples, chlorophyll, currents]);
}
