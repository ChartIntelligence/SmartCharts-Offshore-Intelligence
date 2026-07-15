import TodayDashboard from "./TodayDashboard";
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
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import {
  useLiveMarineConditions
} from "../hooks/useLiveMarineConditions";

import "../styles/dashboard.css";




function Dashboard() {
  const [activeTab, setActiveTab] =
    useState("today");

  const [layers, setLayers] = useState({
    marlin: true,
    yellowfin: true,
    blackfin: true,
    locations: true,

    sst: false,
    sstOpacity: 0.32,

    chlorophyll: false,
    chlorophyllOpacity: 0.7,
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

  const rankedLocations = [...structures]
  .filter((spot) => {
    const score =
      spot?.scores?.blueMarlin ??
      spot?.blueMarlinScore;

    return Number.isFinite(
      Number(score)
    );
  })
  .sort((first, second) => {
    const firstScore =
      Number(
        first?.scores?.blueMarlin ??
        first?.blueMarlinScore ??
        0
      );

    const secondScore =
      Number(
        second?.scores?.blueMarlin ??
        second?.blueMarlinScore ??
        0
      );

    return secondScore - firstScore;
  });


const topSpot =
  rankedLocations[0] ?? null;


const topScore =
  Number(
    topSpot?.scores?.blueMarlin ??
    topSpot?.blueMarlinScore ??
    0
  );


const topConfidence =
  topSpot
    ? Math.min(
        96,
        Math.max(
          55,
          Math.round(
            topScore * 0.96
          )
        )
      )
    : 0;

// Selected location
const {
  data: selectedMarineData,
  loading: selectedMarineLoading,
  error: selectedMarineError
} = useLiveMarineConditions(
  selectedSpot
);

// Top opportunity
const {
  data: topSpotMarineData,
  loading: topSpotMarineLoading,
  error: topSpotMarineError
} = useLiveMarineConditions(
  topSpot
);


// Captain authentication
const {
  user,
  loading: authLoading
} = useSupabaseAuth();


const handleReportSaved = () => {
  setReportsRefreshToken(
    (currentToken) =>
      currentToken + 1
  );
};


  return (
    <div className="dashboard">

      <header className="smartcharts-app-header">

        <div className="smartcharts-brand">

          <div className="smartcharts-brand-row">

            <h1>
              VELION
            </h1>

            <span className="smartcharts-version-badge">
              Founding Captain Alpha
            </span>

          </div>

          <p>
            Offshore Intelligence Platform
          </p>

        </div>


        <nav
          className="dashboard-tabs"
          aria-label="Velion navigation"
        >

          <DashboardTab
            label="Home"
            active={
              activeTab === "today"
            }
            onClick={() =>
              setActiveTab("today")
            }
          />

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


      {activeTab === "today" && (
  <TodayDashboard
    topSpot={topSpot}
    topScore={topScore}
    topConfidence={topConfidence}
    setActiveTab={setActiveTab}
    setSelectedSpot={setSelectedSpot}
    setReportPanelOpen={
      setReportPanelOpen
    }
      liveMarineData={topSpotMarineData}
  liveMarineLoading={topSpotMarineLoading}
  liveMarineError={topSpotMarineError}
  />
)}


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
  oceanData={selectedMarineData}
  oceanLoading={selectedMarineLoading}
  oceanError={selectedMarineError}
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

              {rankedLocations
                .filter((spot) => {
                  return (
                    spot.category ===
                      "intelligence_zone" ||
                    Boolean(
                      spot?.scores?.blueMarlin
                    )
                  );
                })
                .slice(0, 12)
                .map((spot) => (

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


          <section className="captain-sign-in signed-in">

  <div>

    <strong>
      Private Captain Storage
    </strong>

    <p>
      Fishing logs are securely stored for this
      device. Captain identity is never shared.
    </p>

  </div>

</section>


<SavedFishingDayReports
  refreshToken={reportsRefreshToken}
  user={user}
  authLoading={authLoading}
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
  onReportSaved={
    handleReportSaved
  }
  structures={structures}
  user={user}
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