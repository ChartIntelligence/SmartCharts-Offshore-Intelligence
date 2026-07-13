import {
  useMemo,
  useRef
} from "react";

import "maplibre-gl/dist/maplibre-gl.css";

import structures from "../data/gulfStructures.json";

import { buildMapGeoJson } from "../utils/mapLibreHelpers";

import { useMapLibreSetup } from "../hooks/useMapLibreSetup";
import { useMapLibreLayers } from "../hooks/useMapLibreLayers";
import { useMapLibreMarkers } from "../hooks/useMapLibreMarkers";
import { useMapLibreSelection } from "../hooks/useMapLibreSelection";


function MapLibreIntelligenceMap({
  layers,
  selectedSpot,
  setSelectedSpot
}) {

  const containerRef = useRef(null);
  const mapRef = useRef(null);

  const geoJson = useMemo(() => {
    return buildMapGeoJson(structures);
  }, []);


  useMapLibreSetup({
    containerRef,
    mapRef,
    geoJson,
    layers
  });


  useMapLibreLayers({
    mapRef,
    layers
  });


  useMapLibreMarkers({
    mapRef,
    structures,

    visible:
      layers.locations !== false,

    selectedSpot,
    setSelectedSpot,

    showScores:
      layers.locationScores === true
  });


  useMapLibreSelection({
    mapRef,
    selectedSpot
  });


  return (
    <div
      ref={containerRef}
      className="map maplibre-map"
      aria-label="SmartCharts offshore intelligence map"
    />
  );
}


export default MapLibreIntelligenceMap;