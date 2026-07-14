import { useState } from "react";

import LayerControls from "./LayerControls";
import MapLibreIntelligenceMap from "./MapLibreIntelligenceMap";
import HotspotCard from "./HotspotCard";
import MapLegend from "./MapLegend";
import TopOpportunity from "./TopOpportunity";
import OpportunityRanking from "./OpportunityRanking";
import SelectedTarget from "./SelectedTarget";
import LocationSearch from "./LocationSearch";
import FishingDayReportPanel from "./FishingDayReportPanel";

import structures from "../data/gulfLocations";

import "../styles/dashboard.css";


function Dashboard() {

  const [layers, setLayers] = useState({
    marlin: true,
    yellowfin: true,
    blackfin: true,
    locations: true,

    sst: false,
    sstOpacity: 0.32,

    chlorophyll: false,
    currents: false,
    temperatureBreaks: false,
    baitProbability: false
  });


  const [
    selectedSpot,
    setSelectedSpot
  ] = useState(null);


  const [
    reportPanelOpen,
    setReportPanelOpen
  ] = useState(false);


  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <h1>SMARTCHARTS</h1>

        <p>
          Blue Marlin Intelligence Platform
        </p>

        <button
          type="button"
          className="log-fishing-day-button"
          onClick={() =>
            setReportPanelOpen(true)
          }
        >
          Log Fishing Day
        </button>

      </header>


      <section className="top-section">

        <TopOpportunity
          structures={structures}
        />

      </section>


      <LocationSearch
        structures={structures}
        selectedSpot={selectedSpot}
        setSelectedSpot={setSelectedSpot}
      />


      <section className="map-area">

        <LayerControls
          layers={layers}
          setLayers={setLayers}
        />


        <div className="map-wrapper">

          <MapLibreIntelligenceMap
            layers={layers}
            selectedSpot={selectedSpot}
            setSelectedSpot={setSelectedSpot}
          />

          <MapLegend
            layers={layers}
          />

        </div>

      </section>


      <SelectedTarget
        selectedSpot={selectedSpot}
      />


      <section className="ranking-section">

        <OpportunityRanking
          structures={structures}
          setSelectedSpot={setSelectedSpot}
        />

      </section>


      <section className="intel-section">

        <h2>
          Offshore Intelligence
        </h2>


        <div className="cards">

          {structures.map((spot) => (

            <HotspotCard
              key={
                spot.id ||
                spot.name
              }
              spot={spot}
            />

          ))}

        </div>

      </section>


      <FishingDayReportPanel
        isOpen={reportPanelOpen}
        onClose={() =>
          setReportPanelOpen(false)
        }
        structures={structures}
      />

    </div>
  );
}


export default Dashboard;