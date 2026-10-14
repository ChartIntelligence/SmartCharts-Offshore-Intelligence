import {useMapCameraContinuity} from '../hooks/useMapCameraContinuity.js';
import {
  useEffect,
  useMemo,
  useRef
} from "react";

import "maplibre-gl/dist/maplibre-gl.css";

import structures from "../data/gulfLocations";
import { useMapLibreOceanFields } from "../hooks/useMapLibreOceanFields.js";
import { sampleLayersForMode } from "../utils/oceanFieldPresentation.js";
import {useRetainedScalarReview} from '../hooks/useRetainedScalarReview.js';
import {useSyntheticSstReview} from "../hooks/useSyntheticSstReview.js";

import { buildMapGeoJson } from "../utils/mapLibreHelpers";

import { useMapLibreEnvironmentalObservations } from "../hooks/useMapLibreEnvironmentalObservations.js";
import { useMapLibreSetup } from "../hooks/useMapLibreSetup";
import { useMapLibreLayers } from "../hooks/useMapLibreLayers";
import { useMapLibreMarkers } from "../hooks/useMapLibreMarkers";
import { useMapLibreSelection } from "../hooks/useMapLibreSelection";
import {
  useMapLibreOceanFeatures
} from "../hooks/useMapLibreOceanFeatures";
import {
  useMapLibreOpenWaterOpportunities
} from "../hooks/useMapLibreOpenWaterOpportunities";
import {
  useMapLibreOpportunitySelection
} from "../hooks/useMapLibreOpportunitySelection";

function MapLibreIntelligenceMap({
  layers,
  selectedSpot,
  setSelectedSpot,
  mapIntelligence,
  observationDisplay,
  qaSamples = false,
  syntheticSstReview = null,
  historicalSstReview = null,
  onFieldStatus,
  session = null,
  selectedCurrentSample = null,
  onSelectCurrentSample,
  onCurrentSampleReadout,
  openWaterOpportunities = [],
  selectedOpportunity = null,
  setSelectedOpportunity,
  recenterRequest = 0,
  camera = null,
  onCameraChange,
  restoredSelectionId = null
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
    const clusterableStructures =
      structures.filter((spot) => {
        const category =
          String(
            spot.category || ""
          ).toLowerCase();

        const type =
          String(
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


  const fadClusterGeoJson = useMemo(() => {
    const activeFads =
      structures.filter((spot) => {
        const category =
          String(
            spot.category || ""
          ).toLowerCase();

        const type =
          String(
            spot.type || ""
          ).toLowerCase();

        return (
          spot.active !== false &&
          (
            category === "fad" ||
            type.includes(
              "fish aggregating device"
            )
          )
        );
      });

    return buildMapGeoJson(
      activeFads
    );
  }, []);


  useMapLibreSetup({
    containerRef,
    mapRef,
    geoJson,
    structureClusterGeoJson,
    fadClusterGeoJson,
    layers
  });

  useMapLibreLayers({
    mapRef,
    layers
  });

  useMapLibreOceanFeatures({
    mapRef,
    mapIntelligence,

    temperatureTransitionVisible:
      layers.temperatureTransition ===
      true
  });

  useMapLibreEnvironmentalObservations({ mapRef, observationDisplay, layers: sampleLayersForMode(layers, qaSamples) });
  useMapLibreOceanFields({ mapRef, bathymetry: layers.bathymetry, currentField: layers.currentField, onFieldStatus, session, selectedCurrentSample, onCurrentSampleReadout });
  // Explicit trusted review capability only; default null performs no retained work.
  useRetainedScalarReview({mapRef,review:historicalSstReview});
  useEffect(()=>{
    const map=mapRef.current;
    if(!map || !layers.currentField || !onSelectCurrentSample)return;
    const inspect=event=>{
      const target=event.originalEvent?.target;
      if(event.originalEvent?.defaultPrevented || target?.closest?.('.maplibregl-marker,.maplibregl-popup,button,a,input,select,textarea'))return;
      const feature=event.features?.find(item=>item.source==='pelora-geostrophic-field' &&
        item.layer?.id==='pelora-geostrophic-arrows' && item.geometry?.type==='Point');
      const props=feature?.properties;
      if(typeof props?.fieldId!=='string' || !props.fieldId || !Number.isSafeInteger(props.sampleIndex) || props.sampleIndex<0)return;
      // Other map interactions retain priority; never select a current behind a Place/sample.
      const hits=map.queryRenderedFeatures?.(event.point)??[];
      if(hits.some(item=>item.geometry?.type==='Point' && item.source!=='pelora-geostrophic-field'))return;
      onSelectCurrentSample({fieldId:props.fieldId,sampleIndex:props.sampleIndex});
    };
    map.on('click','pelora-geostrophic-arrows',inspect);
    return()=>map.off('click','pelora-geostrophic-arrows',inspect);
  },[mapRef,layers.currentField,onSelectCurrentSample]);
  useSyntheticSstReview({mapRef, review: syntheticSstReview});

  useMapLibreOpenWaterOpportunities({
    mapRef,

    opportunities:
      openWaterOpportunities,

    selectedOpportunity,

    setSelectedOpportunity
  });

  useMapLibreOpportunitySelection({
    mapRef,
    selectedOpportunity
  });

  useEffect(() => {
    if (!recenterRequest) {
      return;
    }

    const map = mapRef.current;

    const target =
      selectedOpportunity ??
      selectedSpot;

    const coordinates =
      target?.coordinates;

    if (
      !map ||
      !Array.isArray(coordinates) ||
      coordinates.length < 2
    ) {
      return;
    }

    const latitude =
      Number(coordinates[0]);

    const longitude =
      Number(coordinates[1]);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return;
    }

    const mobileViewport =
      window.matchMedia(
        "(max-width: 700px)"
      ).matches;

    map.flyTo({
      center: [
        longitude,
        latitude
      ],

      zoom: 7,

      offset: mobileViewport
        ? [0, -85]
        : [0, 0],

      duration: 900,

      essential: true
    });
  }, [
    recenterRequest,
    selectedOpportunity,
    selectedSpot
  ]);

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

  useMapCameraContinuity({mapRef,camera:qaSamples || syntheticSstReview ? null : camera,
    onCameraChange:qaSamples || syntheticSstReview ? undefined : onCameraChange,
    restoredSelectionId:qaSamples || syntheticSstReview ? null : restoredSelectionId,
    selectedIdentity:selectedOpportunity?.id ?? selectedSpot?.id ?? null});

  return (
    <>
      {historicalSstReview?.enabled===true && <style>{`.maplibre-map [data-retained-scalar-review] { bottom:calc(160px + env(safe-area-inset-bottom)) !important; }`}</style>}
      <div
        ref={containerRef}
        className="map maplibre-map"
        aria-label="Pelora offshore intelligence map"
      />
    </>
  );
}

export default MapLibreIntelligenceMap;
