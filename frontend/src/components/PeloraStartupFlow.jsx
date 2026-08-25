import {
  useEffect,
  useState
} from "react";

import Dashboard from "./Dashboard";

import {
  useTripMission
} from "../hooks/useTripMission";

import peloraWordmark
  from "../assets/branding/pelora-wordmark-web-cropped.png";

import "../styles/dashboard.css";



const SPECIES_OPTIONS = [
  {
    id: "blue-marlin",
    label: "Blue Marlin",
    available: true
  },
  {
    id: "yellowfin",
    label: "Yellowfin Tuna",
    available: false
  },
  {
    id: "blackfin",
    label: "Blackfin Tuna",
    available: false
  },
  {
    id: "mahi",
    label: "Mahi",
    available: false
  },
  {
    id: "sailfish",
    label: "Sailfish",
    available: false
  },
  {
    id: "white-marlin",
    label: "White Marlin",
    available: false
  },
  {
    id: "wahoo",
    label: "Wahoo",
    available: false
  }
];


function PeloraStartupFlow({
  session,
  user,
  authLoading
}) {
  const {
    tripMission,
    captainSpatialContext,
    missionReady,
    missionLoading,
    updateTripMission
  } = useTripMission();


  const [
    startupStep,
    setStartupStep
  ] = useState("loading");


  const [
    originName,
    setOriginName
  ] = useState(
    tripMission
      ?.origin
      ?.name ??
    ""
  );


  const [
    latitude,
    setLatitude
  ] = useState(
    tripMission
      ?.origin
      ?.coordinates
      ?.[0] ??
    ""
  );


  const [
    longitude,
    setLongitude
  ] = useState(
    tripMission
      ?.origin
      ?.coordinates
      ?.[1] ??
    ""
  );


  const [
    operatingRangeNm,
    setOperatingRangeNm
  ] = useState(
    tripMission
      ?.operatingRangeNm ??
    150
  );


  useEffect(() => {
    if (missionLoading) {
        return;
    }


    if (missionReady) {
        setStartupStep(
        "dashboard"
        );

        return;
    }


    setStartupStep(
        "mission"
    );
  }, [
    missionLoading,
    missionReady
  ]);


  if (
    missionLoading ||
    startupStep === "loading"
  ) {
    return (
      <main className="pelora-startup-screen">

        <section className="pelora-startup-splash">

          <img
            src={peloraWordmark}
            alt="Pelora"
            className="pelora-startup-wordmark"
          />

          <div
            className="pelora-startup-horizon"
            aria-hidden="true"
          >
            <span />
          </div>

          <p>
            OCEAN INTELLIGENCE
          </p>

          <p>
            The ocean is talking.
            Pelora helps you listen.
          </p>

        </section>

      </main>
    );
  }


  if (
    missionReady &&
    startupStep ===
      "dashboard"
  ) {
    return (
      <Dashboard
        session={session}
        user={user}
        authLoading={authLoading}
        tripMission={tripMission}
        captainSpatialContext={
          captainSpatialContext
        }
      />
    );
  }


  if (
    startupStep ===
      "species"
  ) {
    return (
      <main className="pelora-startup-screen">

        <section className="pelora-startup-panel">

          <p className="section-eyebrow">
            Trip Mission
          </p>

          <h1>
            What species would you like
            to target today?
          </h1>


          <div className="pelora-species-grid">

            {SPECIES_OPTIONS.map(
              species => (
                <button
                  key={species.id}
                  type="button"
                  disabled={
                    !species.available
                  }
                  onClick={() => {
                    updateTripMission({
                      selectedSpecies:
                        species.id
                    });

                    setStartupStep(
                      "dashboard"
                    );
                  }}
                >
                  <strong>
                    {species.label}
                  </strong>

                  {!species.available && (
                    <small>
                      Coming Soon
                    </small>
                  )}

                </button>
              )
            )}

          </div>


          <button
            type="button"
            onClick={() =>
              setStartupStep(
                "mission"
              )
            }
          >
            Back
          </button>

        </section>

      </main>
    );
  }


  return (
    <main className="pelora-startup-screen">

      <section className="pelora-startup-panel">

        <p className="section-eyebrow">
          Current Trip
        </p>

        <h1>
          Where are you fishing from?
        </h1>

        <p>
          Set the origin and operating
          range for this trip.
        </p>


        <label>
          Departure point

          <input
            type="text"
            value={originName}
            placeholder="Port St. Joe"
            onChange={event =>
              setOriginName(
                event.target.value
              )
            }
          />
        </label>


        <label>
          Latitude

          <input
            type="number"
            step="0.0001"
            value={latitude}
            onChange={event =>
              setLatitude(
                event.target.value
              )
            }
          />
        </label>


        <label>
          Longitude

          <input
            type="number"
            step="0.0001"
            value={longitude}
            onChange={event =>
              setLongitude(
                event.target.value
              )
            }
          />
        </label>


        <label>
          Operating range

          <input
            type="number"
            min="1"
            step="1"
            value={operatingRangeNm}
            onChange={event =>
              setOperatingRangeNm(
                event.target.value
              )
            }
          />

          <small>
            Nautical miles
          </small>
        </label>


        <button
          type="button"
          onClick={() => {
            updateTripMission({
              origin: {
                source:
                  "manual",

                name:
                  originName,

                coordinates: [
                  Number(
                    latitude
                  ),
                  Number(
                    longitude
                  )
                ]
              },

              operatingRangeNm:
                Number(
                  operatingRangeNm
                ),

              explorationMode:
                "within-range"
            });

            setStartupStep(
              "species"
            );
          }}
        >
          Continue
        </button>


        <button
          type="button"
          onClick={() => {
            updateTripMission({
              explorationMode:
                "entire-gulf"
            });

            setStartupStep(
              "species"
            );
          }}
        >
          Explore Entire Gulf
        </button>

      </section>

    </main>
  );
}


export default PeloraStartupFlow;