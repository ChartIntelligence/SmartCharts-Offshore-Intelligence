import TodayDashboard from "./TodayDashboard";
import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { buildMapEnvironmentalObservations } from "../utils/mapEnvironmentalObservations.js";
import { buildMapObservationDisplay } from "../utils/mapObservationDisplay.js";

import LayerControls from "./LayerControls";
import { fieldStatusText, sampleLayersForMode } from "../utils/oceanFieldPresentation.js";
import MapLibreIntelligenceMap from "./MapLibreIntelligenceMap";
import MapLegend from "./MapLegend";
import TopOpportunity from "./TopOpportunity";
import OpportunityRanking from "./OpportunityRanking";
import OpportunityIntelligence from "./OpportunityIntelligence";
import HistoricalOpportunityContinuity
  from "./HistoricalOpportunityContinuity";
import SelectedTarget from "./SelectedTarget";
import LocationSearch from "./LocationSearch";
import FishingDayReportPanel from "./FishingDayReportPanel";
import SavedFishingDayReports from "./SavedFishingDayReports";

import structures from "../data/gulfLocations";

import {
  useLiveMarineConditions
} from "../hooks/useLiveMarineConditions";

import {
  useOceanMemoryPersistence
} from "../hooks/useOceanMemoryPersistence";

import {
  useDynamicOpportunities
} from "../hooks/useDynamicOpportunities";

import "../styles/dashboard.css";

import peloraHeaderLockup from "../assets/branding/pelora-header-lockup.png";

function Dashboard({
  session,
  user,
  authLoading,
  tripMission,
  captainSpatialContext,
  onEditTripMission
}) {
  const [activeTab, setActiveTab] =
    useState("today");

  const [layers, setLayers] = useState({
    marlin: true,
    yellowfin: true,
    blackfin: true,
    locations: true,

    bathymetry: true,
    currentField: true,
    temperatureSamples: false,
    chlorophyll: false,
    currents: false,
    temperatureTransition: false,
    baitProbability: false
  });

  const [selectedSpot, setSelectedSpot] =
    useState(null);

  const [
    selectedOpportunity,
    setSelectedOpportunity
  ] = useState(null);

  const [
    mapRecenterRequest,
    setMapRecenterRequest
  ] = useState(0);

  const handleSelectSpot =
    useCallback((spot) => {
      setSelectedSpot(spot);
      setSelectedOpportunity(null);
    }, []);

  const handleSelectOpportunity =
    useCallback((opportunity) => {
      setSelectedOpportunity(
        opportunity
      );

      setSelectedSpot(null);
    }, []);

  const handleCloseMapSelection =
    useCallback(() => {
      setSelectedOpportunity(null);
      setSelectedSpot(null);
    }, []);

  const navigateToTopZoneMap = useCallback(() => {
    setActiveTab("map");
  }, []);



  const [
    reportPanelOpen,
    setReportPanelOpen
  ] = useState(false);

  const [
    reportsRefreshToken,
    setReportsRefreshToken
  ] = useState(0);


// Selected location
const {
  requestStatus: selectedMarineRequestStatus,
  data: selectedMarineData,
  loading: selectedMarineLoading,
  error: selectedMarineError
} = useLiveMarineConditions(
  selectedSpot,
  session?.access_token ?? null
);

const {
  data: dynamicOpportunityData,
  loading: dynamicOpportunityLoading,
  error: dynamicOpportunityError
} = useDynamicOpportunities(
  tripMission?.selectedSpecies ??
    "blue-marlin",

  session?.access_token ?? null,

  captainSpatialContext
);


const captainNarratives =
  Array.isArray(
    dynamicOpportunityData
      ?.delivery
      ?.captainNarratives
  )
    ? dynamicOpportunityData
        .delivery
        .captainNarratives
    : [];


const captainNarrativeByOpportunityId =
  new Map(
    captainNarratives
      .filter(
        item =>
          item?.opportunityId != null
      )
      .map(
        item => [
          item.opportunityId,
          item?.narrative ?? null
        ]
      )
  );


const dynamicTopOpportunities =
  Array.isArray(
    dynamicOpportunityData
      ?.opportunities
  )
    ? dynamicOpportunityData
        .opportunities
        .map((opportunity) => {
          const location =
            opportunity?.location ?? {};

          const matchingLocation =
            structures.find(
              (spot) =>
                spot?.id ===
                location?.id
            ) ??
            null;

          return {
            ...(matchingLocation ?? {}),

            id:
              location?.id ??
              matchingLocation?.id ??
              null,

            name:
              Number.isFinite(
                opportunity?.rank
              )
                ? `Open Water Opportunity ${opportunity.rank}`
                : "Open Water Opportunity",

            region:
              location?.region ??
              matchingLocation?.region ??
              null,

            type:
              location?.type ??
              matchingLocation?.type ??
              null,

            coordinates:
              Array.isArray(
                location?.coordinates
              )
                ? [
                    ...location.coordinates
                  ]
                : matchingLocation
                    ?.coordinates ??
                  null,

            captainNarrative:
              location?.id != null
                ? captainNarrativeByOpportunityId
                    .get(location.id) ??
                  null
                : null,

            dynamicOpportunity: {
              rank:
                opportunity?.rank ??
                null,

              score:
                Number.isFinite(
                  opportunity?.score
                )
                  ? opportunity.score
                  : null,

              confidence:
                opportunity?.confidence ??
                null,

              pathway:
                opportunity?.pathway ??
                null,

              primarySignal:
                opportunity?.primarySignal ??
                null,

              observedAt:
                opportunity?.observedAt ??
                null,

              contractVersion:
                opportunity?.contractVersion ??
                null
            }
          };
        })
    : [];


const opportunityState =
  dynamicOpportunityLoading
    ? "loading"
    : dynamicOpportunityError
      ? "unavailable"
      : dynamicOpportunityData &&
          dynamicTopOpportunities.length > 0
        ? "available"
        : dynamicOpportunityData
          ? "governed-zero"
          : "loading";


const historicalFallback =
  opportunityState === "governed-zero" &&
  dynamicOpportunityData
    ?.historicalFallback
    ?.available === true
    ? dynamicOpportunityData
        .historicalFallback
    : null;


const displayedTopOpportunities =
  dynamicTopOpportunities;


const dynamicTopSpot =
  displayedTopOpportunities[0] ??
  null;


const selectedGovernedOpportunity =
  selectedOpportunity &&
  displayedTopOpportunities.some(
    opportunity =>
      opportunity?.id ===
      selectedOpportunity?.id
  )
    ? selectedOpportunity
    : null;


useEffect(() => {
  if (
    selectedOpportunity &&
    dynamicOpportunityData &&
    !selectedGovernedOpportunity
  ) {
    setSelectedOpportunity(null);
  }
}, [
  dynamicOpportunityData,
  selectedOpportunity,
  selectedGovernedOpportunity
]);


const activeOpportunity =
  opportunityState === "available"
    ? selectedGovernedOpportunity ??
      dynamicTopSpot
    : null;


// Active Ocean Brief opportunity
const {
  requestStatus: activeOpportunityMarineRequestStatus,
  data: activeOpportunityMarineData,
  loading: activeOpportunityMarineLoading,
  error: activeOpportunityMarineError
} = useLiveMarineConditions(
  activeOpportunity,
  session?.access_token ?? null
);


const mapSelectedTarget =
  selectedGovernedOpportunity ??
  selectedSpot;


const mapSelectedMarineData =
  selectedGovernedOpportunity
    ? activeOpportunityMarineData
    : selectedMarineData;


const mapSelectedMarineLoading =
  selectedGovernedOpportunity
    ? activeOpportunityMarineLoading
    : selectedMarineLoading;


const mapSelectedMarineError =
  selectedGovernedOpportunity
    ? activeOpportunityMarineError
    : selectedMarineError;


const [fieldStatus, setFieldStatus] = useState({});
const qaSamples = import.meta.env.DEV && import.meta.env.VITE_OCEAN_SAMPLE_QA === "true";
const [observationDisplayTime, setObservationDisplayTime] = useState(Date.now);
useEffect(() => {
  if (activeTab !== "map") return;
  setObservationDisplayTime(Date.now());
  const timer = window.setInterval(() => setObservationDisplayTime(Date.now()), 60000);
  return () => window.clearInterval(timer);
}, [activeTab]);

const mapObservationDisplay = useMemo(() => buildMapObservationDisplay(
  buildMapEnvironmentalObservations({
    oceanData: mapSelectedMarineData,
    requestStatus: selectedGovernedOpportunity ? activeOpportunityMarineRequestStatus : selectedMarineRequestStatus
  }),
  observationDisplayTime
), [mapSelectedMarineData, selectedGovernedOpportunity, activeOpportunityMarineRequestStatus,
  selectedMarineRequestStatus, observationDisplayTime]);

useOceanMemoryPersistence({
  user,

  selectedLocation:
    selectedSpot,

  oceanSnapshot:
    selectedMarineData
      ?.oceanSnapshot ??
    null
});


const handleReportSaved = () => {
  setReportsRefreshToken(
    (currentToken) =>
      currentToken + 1
  );
};


const captainContextOriginLabel =
  captainSpatialContext
    ?.origin
    ?.name ??
  "Trip Origin";


const captainContextRangeLabel =
  captainSpatialContext
    ?.explorationMode ===
      "entire-gulf"
    ? "Entire Gulf"
    : Number.isFinite(
        Number(
          captainSpatialContext
            ?.operatingRangeNm
        )
      )
      ? `${captainSpatialContext.operatingRangeNm} NM`
      : "Range";


const captainContextSpeciesLabels = {
  "blue-marlin": "Blue Marlin",
  yellowfin: "Yellowfin Tuna",
  blackfin: "Blackfin Tuna",
  mahi: "Mahi",
  sailfish: "Sailfish",
  "white-marlin": "White Marlin",
  wahoo: "Wahoo"
};


const captainContextSpeciesLabel =
  captainContextSpeciesLabels[
    tripMission
      ?.selectedSpecies
  ] ??
  "Target Species";


return (
  <div
    className={
      activeTab === "map"
        ? "dashboard dashboard-map-mode"
        : "dashboard"
    }
  >

    <header className="smartcharts-app-header">

<div className="pelora-header-brand">

<button
  type="button"
  className="pelora-logo-lockup"
  onClick={() =>
    setActiveTab("intelligence")
  }
  aria-label="Open Pelora Intelligence"
  title="Open Pelora Intelligence"
>
<img
  src={peloraHeaderLockup}
  alt="Pelora"
  className="pelora-header-lockup-image"
/>

<span className="pelora-logo-subtitle">
  OCEAN INTELLIGENCE
</span>
</button>

</div>

   <nav
     className="dashboard-tabs"
    aria-label="Pelora navigation"
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
        activeTab === "intelligence"
      }
      onClick={() =>
        setActiveTab("intelligence")
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


<button
  type="button"
  className={
    activeTab === "map" &&
    mapSelectedTarget
      ? "captain-context-control captain-context-control-map-hidden"
      : "captain-context-control"
  }
  onClick={onEditTripMission}
  aria-label="Change current trip mission"
>
  <span className="captain-context-control-label">
    Current Trip
  </span>

  <span className="captain-context-control-summary">
    <strong>
      {captainContextOriginLabel}
    </strong>

    <span aria-hidden="true">
      ·
    </span>

    <span>
      {captainContextRangeLabel}
    </span>

    <span aria-hidden="true">
      ·
    </span>

    <span>
      {captainContextSpeciesLabel}
    </span>
  </span>

  <span
    className="captain-context-control-chevron"
    aria-hidden="true"
  >
    ▾
  </span>
</button>


{activeTab === "today" && (
  <TodayDashboard
    topOpportunities={
      displayedTopOpportunities
    }
    activeOpportunity={
      activeOpportunity
    }
    opportunityState={
      opportunityState
    }
    historicalFallback={
      historicalFallback
    }
    setSelectedOpportunity={
      setSelectedOpportunity
    }
    setActiveTab={setActiveTab}
    navigateToTopZoneMap={navigateToTopZoneMap}
    setSelectedSpot={setSelectedSpot}
    setReportPanelOpen={
      setReportPanelOpen
    }
    liveMarineData={
      activeOpportunityMarineData
    }
    liveMarineLoading={
      activeOpportunityMarineLoading
    }
    liveMarineError={
      activeOpportunityMarineError
    }
  />
)}


      {activeTab === "map" && (
        <main className="dashboard-tab-content map-intelligence-workspace">



          <section className="map-area">




            <div className="map-wrapper">

              <LayerControls
                fieldStatus={fieldStatus}
                qaSamples={qaSamples}
                layers={layers}
                setLayers={setLayers}
                observationDisplay={mapObservationDisplay}
                transitionAvailable={mapSelectedMarineData?.mapIntelligence?.temperatureTransition?.available === true}
              />

              <MapLibreIntelligenceMap
                qaSamples={qaSamples}
                onFieldStatus={setFieldStatus}
                observationDisplay={mapObservationDisplay}
                layers={layers}
                selectedSpot={
                  selectedSpot
                }
                setSelectedSpot={
                  handleSelectSpot
                }
                mapIntelligence={
                  mapSelectedMarineData
                    ?.mapIntelligence ??
                  null
                }
                openWaterOpportunities={
                  dynamicTopOpportunities
                }

                selectedOpportunity={
                  selectedGovernedOpportunity
                }

                setSelectedOpportunity={
                  handleSelectOpportunity
                }

                recenterRequest={
                  mapRecenterRequest
                }
              />


              <LocationSearch
                structures={structures}
                selectedSpot={
                  selectedSpot
                }
                setSelectedSpot={
                  handleSelectSpot
                }
              />


              <button
                type="button"
                className="map-recenter-control"
                onClick={() =>
                  setMapRecenterRequest(
                    (current) => current + 1
                  )
                }
                aria-label="Recenter map"
              >
                Recenter
              </button>


              <div className="ocean-field-status" role="status">
                {layers.bathymetry && <div>{fieldStatusText("bathymetry", fieldStatus.bathymetry, observationDisplayTime)}</div>}
                {layers.currentField && <div>{fieldStatusText("currents", fieldStatus.currents, observationDisplayTime)}</div>}
              </div>
              <MapLegend
                observationDisplay={mapObservationDisplay}
                layers={sampleLayersForMode(layers, qaSamples)}
              />

              {!mapSelectedTarget && (
                <button
                  type="button"
                  className="map-report-shortcut map-workspace-report-shortcut"
                  onClick={() =>
                    setReportPanelOpen(true)
                  }
                >
                  + Log Fishing Day
                </button>
              )}

              {mapSelectedTarget && (
                <SelectedTarget
                  mapPanel
                  selectedSpot={
                    mapSelectedTarget
                  }
                  oceanData={
                    mapSelectedMarineData
                  }
                  oceanLoading={
                    mapSelectedMarineLoading
                  }
                  oceanError={
                    mapSelectedMarineError
                  }
                  onViewIntelligence={
                    selectedGovernedOpportunity
                      ? () =>
                          setActiveTab("intelligence")
                      : null
                  }
                  onClose={
                    handleCloseMapSelection
                  }
                />
              )}

            </div>

          </section>




        </main>
      )}


      {activeTab ===
        "intelligence" && (
        <main className="dashboard-tab-content">

          <section className="section-page-header">

            <p className="section-eyebrow">
              Pelora Analysis
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
              opportunities={
                displayedTopOpportunities
              }
              opportunityState={
                opportunityState
              }
            />

          </section>


          {opportunityState === "governed-zero" &&
            historicalFallback?.available === true && (
              <HistoricalOpportunityContinuity
                historicalFallback={
                  historicalFallback
                }
              />
            )}


          <section className="intelligence-analysis-section">

            <OpportunityIntelligence
              opportunity={
                activeOpportunity
              }
              opportunityState={
                opportunityState
              }
            />

          </section>


          <section className="ranking-section">

            <OpportunityRanking
              opportunities={
                displayedTopOpportunities
              }
              opportunityState={
                opportunityState
              }
              setSelectedOpportunity={
                handleSelectOpportunity
              }
              setActiveTab={setActiveTab}
            />

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
      Fishing logs are securely stored with your Pelora
      account. Captain identity is never shared.
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
                My Pelora
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
