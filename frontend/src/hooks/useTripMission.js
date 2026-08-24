import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  buildCaptainSpatialContext
} from "../utils/captainSpatialContext";


const TRIP_MISSION_STORAGE_KEY =
  "pelora.tripMission.v1";


export const TRIP_MISSION_CONTRACT_VERSION =
  "pelora-trip-mission-v1";


const DEFAULT_TRIP_MISSION = {
  origin: null,

  operatingRangeNm: null,

  explorationMode:
    "within-range",

  selectedSpecies:
    "blue-marlin",

  contractVersion:
    TRIP_MISSION_CONTRACT_VERSION
};


export function useTripMission() {
  const [
    tripMission,
    setTripMission
  ] = useState(
    DEFAULT_TRIP_MISSION
  );


  const [
    missionLoading,
    setMissionLoading
  ] = useState(true);


  useEffect(() => {
    try {
      const storedValue =
        window.localStorage
          .getItem(
            TRIP_MISSION_STORAGE_KEY
          );


      if (!storedValue) {
        setTripMission(
          DEFAULT_TRIP_MISSION
        );

        return;
      }


      const parsed =
        JSON.parse(
          storedValue
        );


      setTripMission(
        normalizeTripMission(
          parsed
        )
      );
    } catch (error) {
      console.warn(
        "Pelora trip mission could not be restored:",
        error
      );

      setTripMission(
        DEFAULT_TRIP_MISSION
      );
    } finally {
      setMissionLoading(false);
    }
  }, []);


  useEffect(() => {
    if (missionLoading) {
      return;
    }


    try {
      window.localStorage
        .setItem(
          TRIP_MISSION_STORAGE_KEY,
          JSON.stringify(
            tripMission
          )
        );
    } catch (error) {
      console.warn(
        "Pelora trip mission could not be saved:",
        error
      );
    }
  }, [
    tripMission,
    missionLoading
  ]);


  const updateTripMission =
    useCallback(
      updates => {
        setTripMission(
          currentMission =>
            normalizeTripMission({
              ...currentMission,
              ...updates
            })
        );
      },
      []
    );


  const clearTripMission =
    useCallback(() => {
      setTripMission(
        DEFAULT_TRIP_MISSION
      );

      try {
        window.localStorage
          .removeItem(
            TRIP_MISSION_STORAGE_KEY
          );
      } catch (error) {
        console.warn(
          "Pelora trip mission could not be cleared:",
          error
        );
      }
    }, []);


  const captainSpatialContext =
    buildCaptainSpatialContext({
      origin:
        tripMission.origin,

      operatingRangeNm:
        tripMission
          .operatingRangeNm,

      explorationMode:
        tripMission
          .explorationMode
    });


  const missionReady =
    tripMission
      .explorationMode ===
      "entire-gulf" ||
    (
      captainSpatialContext
        .available === true &&
      Boolean(
        tripMission
          .selectedSpecies
      )
    );


  return {
    tripMission,

    captainSpatialContext,

    missionReady,

    missionLoading,

    updateTripMission,

    clearTripMission
  };
}


function normalizeTripMission(
  mission
) {
  const source =
    mission &&
    typeof mission ===
      "object"
      ? mission
      : {};


  const spatialContext =
    buildCaptainSpatialContext({
      origin:
        source.origin ?? null,

      operatingRangeNm:
        source
          .operatingRangeNm ??
        null,

      explorationMode:
        source
          .explorationMode ??
        "within-range"
    });


  return {
    origin:
      spatialContext.origin,

    operatingRangeNm:
      spatialContext
        .operatingRangeNm,

    explorationMode:
      spatialContext
        .explorationMode,

    selectedSpecies:
      normalizeSpecies(
        source.selectedSpecies
      ),

    contractVersion:
      TRIP_MISSION_CONTRACT_VERSION
  };
}


function normalizeSpecies(
  value
) {
  const supportedSpecies = [
    "blue-marlin",
    "yellowfin",
    "blackfin",
    "mahi",
    "sailfish",
    "white-marlin",
    "wahoo"
  ];


  return supportedSpecies
    .includes(value)
      ? value
      : "blue-marlin";
}