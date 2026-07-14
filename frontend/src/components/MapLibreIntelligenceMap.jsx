import {
  useMemo,
  useRef
} from "react";

import "maplibre-gl/dist/maplibre-gl.css";

import structures from "../data/gulfLocations";

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

  /*
   * All locations remain available to the intelligence overlays.
   */
  const geoJson = useMemo(() => {
    return buildMapGeoJson(structures);
  }, []);

  /*
   * Only ordinary oil platforms and structures are clustered.
   * Important fishing zones, FADs and drillships retain their icons.
   */
  const structureClusterGeoJson = useMemo(() => {
    const clusterableStructures = structures.filter((spot) => {
      const category = String(
        spot.category || ""
      ).toLowerCase();

      const type = String(
        spot.type || ""
      ).toLowerCase();

      return (
        category === "structure" ||
        category === "oil_platform" ||
        type.includes("platform") ||
        type.includes("rig")
      );
    });

    return buildMapGeoJson(
      clusterableStructures
    );
  }, []);

  useMapLibreSetup({
    containerRef,
    mapRef,
    geoJson,
    structureClusterGeoJson,
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
      aria-label="Velion offshore intelligence map"
    />
  );
}

export default MapLibreIntelligenceMap;