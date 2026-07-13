import {
  MapContainer,
  TileLayer
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import structures from "../data/gulfStructures.json";
import MarlinMarker from "./MarlinMarker";
import SpeciesLayer from "./SpeciesLayer";
import MapController from "./MapController";
import OceanOverlay from "./OceanOverlay";
import MarlinHeatmap from "./MarlinHeatmap";


function IntelligenceMap({ layers, selectedSpot }) {

  return (
    <MapContainer
      center={[27.5, -89]}
      zoom={5}
      className="map"
    >

      <MapController
        selectedSpot={selectedSpot}
      />


      <TileLayer
        attribution="OpenStreetMap"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />


      {layers.sst && structures.map((spot) => (
        <OceanOverlay
          key={`${spot.name}-sst`}
          spot={spot}
          type="sst"
        />
      ))}


      {layers.chlorophyll && structures.map((spot) => (
        <OceanOverlay
          key={`${spot.name}-chlorophyll`}
          spot={spot}
          type="chlorophyll"
        />
      ))}


      {layers.currents && structures.map((spot) => (
        <OceanOverlay
          key={`${spot.name}-currents`}
          spot={spot}
          type="currents"
        />
      ))}


      {layers.temperatureBreaks && structures.map((spot) => (
        <OceanOverlay
          key={`${spot.name}-temperature-break`}
          spot={spot}
          type="temperatureBreaks"
        />
      ))}


      {layers.baitProbability && structures.map((spot) => (
        <OceanOverlay
          key={`${spot.name}-bait`}
          spot={spot}
          type="baitProbability"
        />
      ))}


      {layers.marlin && (
  <MarlinHeatmap
    structures={structures}
  />
)}


      {layers.yellowfin && structures.map((spot) => (
        <SpeciesLayer
          key={`${spot.name}-yellowfin`}
          spot={spot}
          species="yellowfin"
        />
      ))}


      {layers.blackfin && structures.map((spot) => (
        <SpeciesLayer
          key={`${spot.name}-blackfin`}
          spot={spot}
          species="blackfin"
        />
      ))}


      {layers.locations && structures.map((spot) => (
        <MarlinMarker
          key={spot.name}
          spot={spot}
          selectedSpot={selectedSpot}
          showScore={layers.marlin}
        />
      ))}

    </MapContainer>
  );
}


export default IntelligenceMap;