import {
  useEffect,
  useState
} from "react";


const OPPORTUNITY_API_URL =
  "https://velion-ocean-engine.onrender.com/api/opportunities";


export function useDynamicOpportunities(
  species = "blue-marlin",
  accessToken = null
) {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);


  useEffect(() => {
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


      try {
        const headers = {};

        if (accessToken) {
          headers.Authorization =
            `Bearer ${accessToken}`;
        }


        const response =
          await fetch(
            `${OPPORTUNITY_API_URL}?species=${encodeURIComponent(
              species
            )}&t=${Date.now()}`,
            {
              signal:
                controller.signal,

              cache:
                "no-store",

              headers
            }
          );


        if (!response.ok) {
          throw new Error(
            `Opportunity request failed with status ${response.status}`
          );
        }


        const result =
          await response.json();


        if (
          result?.available !== true ||
          !Array.isArray(
            result?.opportunities
          )
        ) {
          throw new Error(
            "Dynamic opportunity data is unavailable"
          );
        }


        setData(result);
      } catch (requestError) {
        if (
          requestError?.name ===
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
    accessToken
  ]);


  return {
    data,
    loading,
    error
  };
}