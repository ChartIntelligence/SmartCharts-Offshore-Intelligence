import {useCaptainContinuity} from './useCaptainContinuity.js';
import {
  useCallback,
  useMemo,
} from "react";

import {
  buildCaptainSpatialContext
} from "../utils/captainSpatialContext";


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


export function useTripMission(user) {
  const {value:tripMission,setValue:setTripMission,error:missionPersistenceError} = useCaptainContinuity(user,'mission',()=>DEFAULT_TRIP_MISSION,
    value => value?.contractVersion === TRIP_MISSION_CONTRACT_VERSION &&
      JSON.stringify(normalizeTripMission(value)) === JSON.stringify(value));
  const missionLoading = false;

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
      [setTripMission]
    );


  const clearTripMission =
    useCallback(() => {
      setTripMission(
        DEFAULT_TRIP_MISSION
      );

    }, [setTripMission]);


  const captainSpatialContext =
    useMemo(
      () =>
        buildCaptainSpatialContext({
          origin:
            tripMission.origin,

          operatingRangeNm:
            tripMission
              .operatingRangeNm,

          explorationMode:
            tripMission
              .explorationMode
        }),
      [
        tripMission.origin,
        tripMission
          .operatingRangeNm,
        tripMission
          .explorationMode
      ]
    );


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
    missionPersistenceError,

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
