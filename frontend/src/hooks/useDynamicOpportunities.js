import {
  useEffect,
  useState
} from "react";
import { resolvePeloraApiUrl } from "../utils/peloraApi.js";
import { persistenceRequestHeaders } from "../utils/persistenceEnvironment.js";


export function useDynamicOpportunities(
  species = "blue-marlin",
  accessToken = null,
  captainSpatialContext = null
) {
  const requestKey = JSON.stringify([species, accessToken, captainSpatialContext]);
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(Boolean(species));

  const [error, setError] =
    useState(null);
  const [resultKey, setResultKey] = useState(null);


  useEffect(() => {
    setResultKey(requestKey);
    if (!species) {
      setData(null);
      setLoading(false);
      setError(null);

      return;
    }


    const controller =
      new AbortController();


    async function loadOpportunities() {
      setLoading(true);
      setError(null);
      setData(null);


      try {
        const headers = persistenceRequestHeaders();

        if (accessToken) {
          headers.Authorization =
            `Bearer ${accessToken}`;
        }


        const searchParams =
          new URLSearchParams();


        searchParams.set(
          "species",
          species
        );


        const explorationMode =
          captainSpatialContext
            ?.explorationMode ===
            "within-range"
            ? "within-range"
            : "entire-gulf";


        searchParams.set(
          "explorationMode",
          explorationMode
        );


        if (
          explorationMode ===
            "within-range"
        ) {
          const originCoordinates =
            captainSpatialContext
              ?.origin
              ?.coordinates;

          const operatingRangeNm =
            captainSpatialContext
              ?.operatingRangeNm;


          if (
            Array.isArray(
              originCoordinates
            ) &&
            originCoordinates.length >= 2 &&
            Number.isFinite(
              Number(
                originCoordinates[0]
              )
            ) &&
            Number.isFinite(
              Number(
                originCoordinates[1]
              )
            ) &&
            Number.isFinite(
              Number(
                operatingRangeNm
              )
            ) &&
            Number(
              operatingRangeNm
            ) > 0
          ) {
            searchParams.set(
              "originLatitude",
              String(
                originCoordinates[0]
              )
            );

            searchParams.set(
              "originLongitude",
              String(
                originCoordinates[1]
              )
            );

            searchParams.set(
              "operatingRangeNm",
              String(
                operatingRangeNm
              )
            );
          }
        }


        searchParams.set(
          "t",
          String(
            Date.now()
          )
        );


        const response =
          await fetch(
            resolvePeloraApiUrl(`/api/opportunities?${searchParams.toString()}`),
            {
              signal:
                controller.signal,

              cache:
                "no-store",

              headers
            }
          );


        const result = await response.json();
        const governedUnavailable = result?.evaluationState?.contractVersion ===
          "pelora-governed-opportunity-evaluation-state-v1" && result.evaluationState.state === "unavailable";
        if (!response.ok && !governedUnavailable) {
          throw new Error(
            `Opportunity request failed with status ${response.status}`
          );
        }





        if (
          !Array.isArray(
            result?.opportunities
          )
        ) {
          throw new Error(
            "Dynamic opportunity data is unavailable"
          );
        }


        if (!controller.signal.aborted) setData(result);
      } catch (requestError) {
        if (
          controller.signal.aborted || requestError?.name ===
          "AbortError"
        ) {
          return;
        }


        console.error(
          "Pelora dynamic opportunity request failed:",
          requestError
        );

        setData(null);

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to retrieve opportunities"
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }


    loadOpportunities();


    return () => {
      controller.abort();
    };
  }, [
    species,
    accessToken,
    captainSpatialContext,
    requestKey
  ]);


  return {
    data: resultKey === requestKey ? data : null,
    loading: resultKey === requestKey ? loading : Boolean(species),
    error: resultKey === requestKey ? error : null
  };
}
