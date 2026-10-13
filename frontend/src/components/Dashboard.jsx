import {localQaReadOnly} from '../utils/localQaReadOnly.js';
import {useShellNavigation} from '../hooks/useShellNavigation.js';
import {captainFieldStatus} from '../utils/captainFieldStatus.js';
import PersistentMapShell from './PersistentMapShell.jsx';
import {useCaptainContinuity} from '../hooks/useCaptainContinuity.js';
import {validateWorkspace} from '../utils/captainContinuity.js';
import { interpretOpportunityEvaluation } from "../utils/opportunityEvaluationState.js";
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
import { sampleLayersForMode } from "../utils/oceanFieldPresentation.js";
import MapLibreIntelligenceMap from "./MapLibreIntelligenceMap";
import MapLegend from "./MapLegend";
import TopOpportunity from "./TopOpportunity";
import OpportunityRanking from "./OpportunityRanking";
import OpportunityIntelligence from "./OpportunityIntelligence";
import IntelligenceRecovery from "./IntelligenceRecovery";
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

function DashboardWorkspace({
  session,
  user,
  authLoading,
  tripMission,
  captainSpatialContext,
  onEditTripMission,
  missionPersistenceError,
  missionEditor = null,
  onCloseMissionEditor,
  missionAdmitted = true,
  qaReadOnly = false
}) {
  const {value:workspace,setValue:setWorkspace,error:workspaceError} = useCaptainContinuity(user,'workspace',()=>({
    activeTab:'map', layers:{marlin:true,yellowfin:true,blackfin:true,locations:true,bathymetry:true,currentField:true,
      temperatureSamples:false,chlorophyll:false,currents:false,temperatureTransition:false,baitProbability:false},
    selectedSpotId:null,opportunitySelection:null,mapCamera:null,sheetExpanded:false,reportPanelOpen:false
  }),validateWorkspace);
  const activeTab = workspace.activeTab;
  const applyNavigation=useCallback(next=>{
    setWorkspace(current=>({...current,activeTab:next.tab,reportPanelOpen:next.report}));
    if(!next.mission && missionEditor && onCloseMissionEditor)onCloseMissionEditor();
    if(next.mission && !missionEditor && onEditTripMission)onEditTripMission();
  },[setWorkspace,missionEditor,onCloseMissionEditor,onEditTripMission]);
  const navigation=useShellNavigation({tab:activeTab,report:workspace.reportPanelOpen,mission:Boolean(missionEditor)},applyNavigation);
  const setActiveTab = navigation.navigate;
  const layers = workspace.layers;
  const setLayers = useCallback(update=>setWorkspace(current=>({...current,layers:typeof update==='function'?update(current.layers):update})),[setWorkspace]);
  const selectedSpot = structures.find(spot=>spot.id===workspace.selectedSpotId) ?? null;
  const setSelectedSpot = useCallback(spot=>setWorkspace(current=>({...current,selectedSpotId:spot?.id ?? null,opportunitySelection:spot?null:current.opportunitySelection,
    sheetExpanded:(spot?.id ?? null)===current.selectedSpotId?current.sheetExpanded:false})),[setWorkspace]);
  useEffect(()=>{
    if (workspace.selectedSpotId && !selectedSpot) setSelectedSpot(null);
  },[workspace.selectedSpotId,selectedSpot,setSelectedSpot]);
  const opportunitySelection = workspace.opportunitySelection;
  const setOpportunitySelection = useCallback(selection=>setWorkspace(current=>({...current,opportunitySelection:selection,selectedSpotId:selection?null:current.selectedSpotId,
    sheetExpanded:selection?.opportunity?.id===current.opportunitySelection?.opportunity?.id?current.sheetExpanded:false})),[setWorkspace]);
  const setMapCamera = useCallback(mapCamera=>setWorkspace(current=>({...current,mapCamera})),[setWorkspace]);
  const setSheetExpanded = useCallback(update=>setWorkspace(current=>({...current,sheetExpanded:typeof update==='function'?update(current.sheetExpanded):update})),[setWorkspace]);

  // Selection belongs to a governed context, not a rank or an old result object.
  const opportunityContext = JSON.stringify([
    user?.id ?? null,
    tripMission?.selectedSpecies ?? "blue-marlin",
    captainSpatialContext ?? null
  ]);
  const selectedOpportunity = opportunitySelection?.context === opportunityContext
    ? opportunitySelection.opportunity : null;
  const setSelectedOpportunity = useCallback(opportunity => {
    setOpportunitySelection(opportunity ? {context: opportunityContext, opportunity:{id:opportunity.id}} : null);
  }, [opportunityContext,setOpportunitySelection]);
  useEffect(() => {
    if (opportunitySelection && opportunitySelection.context !== opportunityContext) setOpportunitySelection(null);
  }, [opportunityContext,opportunitySelection,setOpportunitySelection]);

  const [
    mapRecenterRequest,
    setMapRecenterRequest
  ] = useState(0);

  const handleSelectSpot =
    useCallback((spot) => {
      setSelectedSpot(spot);
      setSelectedOpportunity(null);
    }, [setSelectedOpportunity,setSelectedSpot]);

  const handleSelectOpportunity =
    useCallback((opportunity) => {
      setSelectedOpportunity(
        opportunity
      );

      setSelectedSpot(null);
    }, [setSelectedOpportunity,setSelectedSpot]);

  const handleCloseMapSelection =
    useCallback(() => {
      setSelectedOpportunity(null);
      setSelectedSpot(null);
    }, [setSelectedOpportunity,setSelectedSpot]);

  const navigateToTopZoneMap = useCallback(() => {
    setActiveTab("map");
  }, [setActiveTab]);



  const reportPanelOpen = workspace.reportPanelOpen;
  const setReportPanelOpen = navigation.report;

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
  missionAdmitted ? (tripMission?.selectedSpecies ?? "blue-marlin") : null,

  session?.access_token ?? null,

  captainSpatialContext
);


const evaluationView = interpretOpportunityEvaluation({
  data: dynamicOpportunityData, loading: dynamicOpportunityLoading, error: dynamicOpportunityError
});

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
    evaluationView
      ?.opportunities
  )
    ? evaluationView.opportunities
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


const opportunityState = evaluationView.state;

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
  selectedOpportunity
    ? displayedTopOpportunities.find(
    opportunity =>
      opportunity?.id ===
      selectedOpportunity?.id
  ) ?? null
    : null;


useEffect(() => {
  if (
    selectedOpportunity &&
    (
      (dynamicOpportunityData && !selectedGovernedOpportunity) ||
      (!dynamicOpportunityLoading && dynamicOpportunityError && !dynamicOpportunityData)
    )
  ) {
    // Only the active hook result can invalidate intent. Loading preserves it;
    // a terminal failure clears it so a later retry cannot silently reselect.
    setSelectedOpportunity(null);
  }
}, [
  dynamicOpportunityData,
  dynamicOpportunityLoading,
  dynamicOpportunityError,
  selectedOpportunity,
  selectedGovernedOpportunity,
  setSelectedOpportunity
]);


const activeOpportunity =
  ["available", "partial"].includes(opportunityState)
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
  selectedGovernedOpportunity ?? selectedSpot ??
  (selectedOpportunity && dynamicOpportunityLoading
    ? {id:selectedOpportunity.id,awaitingAuthoritative:true}
    : null);


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
  const timer = window.setInterval(() => setObservationDisplayTime(Date.now()), 60000);
  return () => window.clearInterval(timer);
}, []);

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

  persistenceEnvironment: selectedMarineData?.persistenceEnvironment ?? null,

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


return <PersistentMapShell
 user={user} activeTab={activeTab} onNavigate={setActiveTab}
 brand={<img src={peloraHeaderLockup} alt="Pelora" />}
 mission={<button
  type="button"
  className={
    activeTab === "map" &&
    mapSelectedTarget
      ? "captain-context-control captain-context-control-map-hidden"
      : "captain-context-control"
  }
  onClick={()=>navigation.mission(true)}
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
</button>}
 warnings={<>{qaReadOnly&&<p>Local QA is read-only: automatic snapshots and report saving are disabled. Drafts remain on this device.</p>}<span className="pelora-field-warnings">{Object.entries(fieldStatus).filter(([key])=>layers[key==='currents'?'currentField':key]).map(([key,state])=><span key={key}>{key==='currents'?'Geostrophic Currents':'Bathymetry'} · {captainFieldStatus(state,observationDisplayTime)} </span>)}</span>{(workspaceError || missionPersistenceError)&&<p>{workspaceError || missionPersistenceError}</p>}<p>{evaluationView.narrative}{evaluationView.scopeNarrative&&<> {evaluationView.scopeNarrative}</>}</p></>}
 map={
        <main className="dashboard-tab-content map-intelligence-workspace">



          <section className="map-area">




            <div className="map-wrapper">

              <LayerControls
                fieldStatus={fieldStatus}
                observationTime={observationDisplayTime}
                qaSamples={qaSamples}
                layers={layers}
                setLayers={setLayers}
                observationDisplay={mapObservationDisplay}
                transitionAvailable={mapSelectedMarineData?.mapIntelligence?.temperatureTransition?.available === true}
              />

              <MapLibreIntelligenceMap
                session={session}
                camera={workspace.mapCamera}
                onCameraChange={setMapCamera}
                restoredSelectionId={selectedOpportunity?.id ?? selectedSpot?.id ?? null}
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
                  expanded={workspace.sheetExpanded}
                  onExpandedChange={setSheetExpanded}
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
      }
 overlay={<>      {activeTab === "today" && (
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

            <IntelligenceRecovery
              key={activeOpportunity?.id ?? "no-opportunity"}
              narrative={activeOpportunity?.captainNarrative}
              opportunityState={opportunityState}
              onHome={() => setActiveTab("today")}
              onMap={() => setActiveTab("map")}
            >
              <OpportunityIntelligence
                opportunity={
                  activeOpportunity
                }
                opportunityState={
                  opportunityState
                }
              />
            </IntelligenceRecovery>

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
                Review captain information.
              </p>

            </div>


            <p>Account roles, status and subscription details are not supplied to this view.</p>


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


</>}
 missionEditor={missionEditor} onMissionClose={onCloseMissionEditor?()=>navigation.mission(false):undefined}
 reportOpen={reportPanelOpen} onReportClose={()=>setReportPanelOpen(false)} report={      <FishingDayReportPanel
  key={user?.id ?? "no-captain"}
  isOpen={reportPanelOpen}
  onClose={() =>
    setReportPanelOpen(false)
  }
  onReportSaved={
    handleReportSaved
  }
  structures={structures}
  user={user}
/>}
/>;
}


// Validate explicit QA binding before any workspace acquisition effect may commit.
function Dashboard(props){
 let qaReadOnly;
 try{qaReadOnly=localQaReadOnly();}
 catch(error){return <section role="alert"><h1>Local QA configuration unavailable</h1><p>{error.message}</p></section>;}
 return <DashboardWorkspace {...props} qaReadOnly={qaReadOnly}/>;
}
export default Dashboard;
