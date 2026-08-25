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


const DEPARTURE_LOCATIONS = [
  {
    id: "port-st-joe-fl",
    name: "Port St. Joe, FL",
    coordinates: [
      29.8119,
      -85.3027
    ]
  },
  {
    id: "panama-city-fl",
    name: "Panama City, FL",
    coordinates: [
      30.1595,
      -85.6598
    ]
  },
  {
    id: "destin-fl",
    name: "Destin, FL",
    coordinates: [
      30.3935,
      -86.4958
    ]
  },
  {
    id: "orange-beach-al",
    name: "Orange Beach, AL",
    coordinates: [
      30.2944,
      -87.5736
    ]
  },
  {
    id: "venice-la",
    name: "Venice, LA",
    coordinates: [
      29.2769,
      -89.3534
    ]
  },
  {
    id: "grand-isle-la",
    name: "Grand Isle, LA",
    coordinates: [
      29.2366,
      -89.9873
    ]
  },
  {
    id: "galveston-tx",
    name: "Galveston, TX",
    coordinates: [
      29.3013,
      -94.7977
    ]
  },
  {
    id: "freeport-tx",
    name: "Freeport, TX",
    coordinates: [
      28.9541,
      -95.3597
    ]
  },
  {
    id: "port-aransas-tx",
    name: "Port Aransas, TX",
    coordinates: [
      27.8339,
      -97.0611
    ]
  }
];


const OPERATING_RANGE_OPTIONS = [
  75,
  100,
  150,
  200,
  300
];



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


  const [
    locationLoading,
    setLocationLoading
  ] = useState(false);


  const [
    locationError,
    setLocationError
  ] = useState("");


  const useCurrentLocation = () => {
    setLocationError("");


    if (
      !navigator.geolocation
    ) {
      setLocationError(
        "Location services are not available in this browser."
      );

      return;
    }


    setLocationLoading(true);


    navigator.geolocation
      .getCurrentPosition(
        position => {
          const nextLatitude =
            Number(
              position
                .coords
                .latitude
                .toFixed(5)
            );

          const nextLongitude =
            Number(
              position
                .coords
                .longitude
                .toFixed(5)
            );


          setOriginName(
            "Current Location"
          );

          setLatitude(
            nextLatitude
          );

          setLongitude(
            nextLongitude
          );

          setLocationLoading(false);
        },

        error => {
          console.warn(
            "Pelora location request failed:",
            error
          );

          setLocationError(
            "Pelora could not access your location. Choose a departure area instead."
          );

          setLocationLoading(false);
        },

        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 300000
        }
      );
  };


  useEffect(() => {
    if (missionLoading) {
      return;
    }


    if (
      startupStep !==
        "loading"
    ) {
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
    missionReady,
    startupStep
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
          Set today&apos;s departure area and
          how far Pelora should look for
          relevant opportunities.
        </p>


        <div className="pelora-mission-origin-actions">

          <button
            type="button"
            className="pelora-mission-primary-action"
            disabled={locationLoading}
            onClick={useCurrentLocation}
          >
            <strong>
              {locationLoading
                ? "Locating..."
                : "Use My Location"}
            </strong>

            <small>
              Use your current position as
              this trip&apos;s origin.
            </small>
          </button>

        </div>


        {locationError && (
          <p className="pelora-mission-error">
            {locationError}
          </p>
        )}


        <div className="pelora-mission-divider">
          <span>
            or choose a departure area
          </span>
        </div>


        <label>
          Departure area

          <select
            value={
              DEPARTURE_LOCATIONS
                .find(
                  location =>
                    location.name ===
                    originName
                )
                ?.id ??
              ""
            }
            onChange={event => {
              const selectedLocation =
                DEPARTURE_LOCATIONS.find(
                  location =>
                    location.id ===
                    event.target.value
                );


              if (!selectedLocation) {
                setOriginName("");
                setLatitude("");
                setLongitude("");

                return;
              }


              setOriginName(
                selectedLocation.name
              );

              setLatitude(
                selectedLocation
                  .coordinates[0]
              );

              setLongitude(
                selectedLocation
                  .coordinates[1]
              );

              setLocationError("");
            }}
          >
            <option value="">
              Choose a departure area
            </option>

            {DEPARTURE_LOCATIONS.map(
              location => (
                <option
                  key={location.id}
                  value={location.id}
                >
                  {location.name}
                </option>
              )
            )}

          </select>
        </label>


        <div className="pelora-mission-range">

          <div className="pelora-mission-range-header">

            <div>

              <span>
                Operating Range
              </span>

              <strong>
                {operatingRangeNm} nautical miles
              </strong>

            </div>

          </div>


          <div className="pelora-range-options">

            {OPERATING_RANGE_OPTIONS.map(
              range => (
                <button
                  key={range}
                  type="button"
                  className={
                    Number(
                      operatingRangeNm
                    ) === range
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setOperatingRangeNm(
                      range
                    )
                  }
                >
                  {range} nm
                </button>
              )
            )}

          </div>

        </div>


        <button
          type="button"
          disabled={
            !originName ||
            !Number.isFinite(
              Number(latitude)
            ) ||
            !Number.isFinite(
              Number(longitude)
            )
          }
          onClick={() => {
            updateTripMission({
              origin: {
                source:
                  originName ===
                    "Current Location"
                    ? "gps"
                    : "saved",

                name:
                  originName,

                coordinates: [
                  Number(latitude),
                  Number(longitude)
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