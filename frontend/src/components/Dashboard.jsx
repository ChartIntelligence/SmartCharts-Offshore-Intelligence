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
  const [activeTab, setActiveTab] =
    useState("map");

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

  const [selectedSpot, setSelectedSpot] =
    useState(null);

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

      <header className="smartcharts-app-header">

        <div className="smartcharts-brand">

          <div className="smartcharts-brand-row">

            <h1>
              SMARTCHARTS
            </h1>

            <span className="smartcharts-version-badge">
              Tournament Alpha
            </span>

          </div>

          <p>
            Blue Marlin Intelligence Platform
          </p>

        </div>


        <nav
          className="dashboard-tabs"
          aria-label="SmartCharts navigation"
        >

          <DashboardTab
            label="Map"
            active={
              activeTab === "map"
            }
            onClick={() =>
              setActiveTab("map")
            }
          />

          <DashboardTab
            label="Intelligence"
            active={
              activeTab ===
              "intelligence"
            }
            onClick={() =>
              setActiveTab(
                "intelligence"
              )
            }
          />

          <DashboardTab
            label="Reports"
            active={
              activeTab === "reports"
            }
            onClick={() =>
              setActiveTab("reports")
            }
          />

          <DashboardTab
            label="Profile"
            active={
              activeTab === "profile"
            }
            onClick={() =>
              setActiveTab("profile")
            }
          />

        </nav>

      </header>


      {activeTab === "map" && (
        <main className="dashboard-tab-content">

          <section className="map-screen-header">

            <div>

              <p className="section-eyebrow">
                Live Offshore View
              </p>

              <h2>
                Gulf Intelligence Map
              </h2>

              <p>
                Explore fishing areas,
                platforms, FADs and
                environmental layers.
              </p>

            </div>


            <button
              type="button"
              className="map-report-shortcut"
              onClick={() =>
                setReportPanelOpen(true)
              }
            >
              + Log Fishing Day
            </button>

          </section>


          <section className="map-area">

            <LayerControls
              layers={layers}
              setLayers={setLayers}
            />


            <div className="map-wrapper">

              <MapLibreIntelligenceMap
                layers={layers}
                selectedSpot={
                  selectedSpot
                }
                setSelectedSpot={
                  setSelectedSpot
                }
              />


              <LocationSearch
                structures={structures}
                selectedSpot={
                  selectedSpot
                }
                setSelectedSpot={
                  setSelectedSpot
                }
              />


              <MapLegend
                layers={layers}
              />

            </div>

          </section>


          <SelectedTarget
            selectedSpot={selectedSpot}
          />

        </main>
      )}


      {activeTab ===
        "intelligence" && (
        <main className="dashboard-tab-content">

          <section className="section-page-header">

            <p className="section-eyebrow">
              SmartCharts Analysis
            </p>

            <h2>
              Offshore Intelligence
            </h2>

            <p>
              Review recommended zones,
              opportunity rankings and
              environmental reasoning.
            </p>

          </section>


          <section className="top-section">

            <TopOpportunity
              structures={structures}
            />

          </section>


          <section className="ranking-section">

            <OpportunityRanking
              structures={structures}
              setSelectedSpot={(spot) => {
                setSelectedSpot(spot);
                setActiveTab("map");
              }}
            />

          </section>


          <section className="intel-section">

            <h2>
              Location Intelligence
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


      {activeTab === "reports" && (
        <main className="dashboard-tab-content">

          <section className="reports-page-header">

            <div>

              <p className="section-eyebrow">
                Captain Data
              </p>

              <h2>
                Fishing Reports
              </h2>

              <p>
                Log fishing effort,
                environmental observations
                and tournament results.
              </p>

            </div>


            <button
              type="button"
              className="log-fishing-day-button"
              onClick={() =>
                setReportPanelOpen(true)
              }
            >
              + Log Fishing Day
            </button>

          </section>


          <SavedFishingDayReports
            refreshToken={
              reportsRefreshToken
            }
          />

        </main>
      )}


      {activeTab === "profile" && (
        <main className="dashboard-tab-content">

          <section className="captain-dashboard-card">

            <div className="captain-dashboard-main">

              <p className="section-eyebrow">
                My SmartCharts
              </p>

              <h2>
                Captain Dashboard
              </h2>

              <p>
                Manage your account,
                captain information and
                Founding Captain status.
              </p>

            </div>


            <div className="captain-status-grid">

              <ProfileStatus
                label="Program"
                value="Tournament Alpha"
              />

              <ProfileStatus
                label="Status"
                value="Alpha Captain"
              />

              <ProfileStatus
                label="Subscription"
                value="Founding Access"
              />

            </div>

          </section>


          <section className="profile-information-card">

            <h3>
              Captain Information
            </h3>

            <p>
              Captain and boat details will
              be connected to the login
              system before public launch.
            </p>

          </section>

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

          setActiveTab("reports");
        }}
        structures={structures}
      />

    </div>
  );
}


function DashboardTab({
  label,
  active,
  onClick
}) {
  return (
    <button
      type="button"
      className={[
        "dashboard-tab",
        active
          ? "active-dashboard-tab"
          : ""
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
    >
      {label}
    </button>
  );
}


function ProfileStatus({
  label,
  value
}) {
  return (
    <div className="profile-status-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


export default Dashboard;