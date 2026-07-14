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
import SavedFishingDayReports from "./SavedFishingDayReports";

import structures from "../data/gulfLocations";

import "../styles/dashboard.css";


function Dashboard() {

  const [
    activeTab,
    setActiveTab
  ] = useState("map");


  const [
    layers,
    setLayers
  ] = useState({
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


  const [
    reportsRefreshToken,
    setReportsRefreshToken
  ] = useState(0);


  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <h1>
          SMARTCHARTS
        </h1>

        <p>
          Blue Marlin Intelligence Platform
        </p>


        <div className="dashboard-primary-actions">

          <button
            type="button"
            className="log-fishing-day-button"
            onClick={() =>
              setReportPanelOpen(true)
            }
          >
            Log Fishing Day
          </button>

        </div>

      </header>


      <nav
        className="dashboard-tabs"
        aria-label="SmartCharts sections"
      >

        <button
          type="button"
          className={
            activeTab === "map"
              ? "dashboard-tab active-dashboard-tab"
              : "dashboard-tab"
          }
          onClick={() =>
            setActiveTab("map")
          }
        >
          Map
        </button>


        <button
          type="button"
          className={
            activeTab === "profile"
              ? "dashboard-tab active-dashboard-tab"
              : "dashboard-tab"
          }
          onClick={() =>
            setActiveTab("profile")
          }
        >
          Profile
        </button>

      </nav>


      {activeTab === "map" && (
        <main className="dashboard-tab-content">

          <section className="top-section">

            <TopOpportunity
              structures={structures}
            />

          </section>


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


              <LocationSearch
                structures={structures}
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
              setSelectedSpot={
                setSelectedSpot
              }
            />

          </section>


          <section className="intel-section">

            <h2>
              Offshore Intelligence
            </h2>


            <div className="cards">

              {structures.map(
                (spot) => (

                  <HotspotCard
                    key={
                      spot.id ||
                      spot.name
                    }
                    spot={spot}
                  />

                )
              )}

            </div>

          </section>

        </main>
      )}


      {activeTab === "profile" && (
        <main className="dashboard-tab-content">

          <section className="captain-profile-card">

            <div>

              <p className="profile-eyebrow">
                SmartCharts Captain
              </p>

              <h2>
                Captain Profile
              </h2>

              <p>
                Manage fishing-day reports,
                account details and future
                Founding Captain benefits.
              </p>

            </div>


            <div className="founding-captain-badge">

              <span>
                Status
              </span>

              <strong>
                Alpha Captain
              </strong>

            </div>

          </section>


          <SavedFishingDayReports
            refreshToken={
              reportsRefreshToken
            }
          />

        </main>
      )}


      <FishingDayReportPanel
        isOpen={reportPanelOpen}
        onClose={() =>
          setReportPanelOpen(false)
        }
        onReportSaved={() => {
          setReportsRefreshToken(
            (current) =>
              current + 1
          );

          setActiveTab("profile");
        }}
        structures={structures}
      />

    </div>
  );
}


export default Dashboard;