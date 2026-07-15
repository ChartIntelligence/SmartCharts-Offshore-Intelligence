import {
  useEffect,
  useState
} from "react";


export function useLiveMarineConditions(
  location
) {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);


  useEffect(() => {
    const coordinates =
      location?.coordinates ??
      location?.coords;

    const normalized =
      normalizeCoordinates(
        coordinates
      );

    if (!normalized) {
      setData(null);
      setError(
        "Location coordinates unavailable."
      );

      return;
    }

    const [
      longitude,
      latitude
    ] = normalized;

    const controller =
      new AbortController();


    async function loadConditions() {
      setLoading(true);
      setError(null);

     try {
  const response =
    await fetch(
      `/api/ocean?lat=${latitude}&lon=${longitude}&t=${Date.now()}`,
      {
        signal:
          controller.signal,

        cache: "no-store"
      }
    );

        if (!response.ok) {
          throw new Error(
            `Live-data request failed: ${response.status}`
          );
        }

        const result =
          await response.json();

        setData(result);
      } catch (requestError) {
        if (
          requestError.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "Unable to load marine conditions:",
          requestError
        );

        setData(null);

        setError(
          requestError.message ||
          "Unable to load marine conditions."
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }


    loadConditions();


    /*
     * Refresh every 15 minutes.
     */
    const refreshTimer =
  window.setInterval(
    loadConditions,
    5 * 60 * 1000
  );

  const retryTimer =
  window.setTimeout(
    loadConditions,
    5000
  );


    return () => {
      controller.abort();


      window.clearTimeout(
        retryTimer
      );

      window.clearInterval(
        refreshTimer
      );
    };
  }, [
    location?.id,
    location?.name
  ]);


  return {
    data,
    loading,
    error
  };
}


function normalizeCoordinates(
  coordinates
) {
  if (
    !Array.isArray(coordinates) ||
    coordinates.length < 2
  ) {
    return null;
  }

  const first =
    Number(coordinates[0]);

  const second =
    Number(coordinates[1]);

  if (
    !Number.isFinite(first) ||
    !Number.isFinite(second)
  ) {
    return null;
  }

  /*
   * Already stored as:
   * [longitude, latitude]
   */
  if (
    first >= -100 &&
    first <= -75 &&
    second >= 15 &&
    second <= 32
  ) {
    return [
      first,
      second
    ];
  }

  /*
   * Stored as:
   * [latitude, longitude]
   */
  if (
    first >= 15 &&
    first <= 32 &&
    second >= -100 &&
    second <= -75
  ) {
    return [
      second,
      first
    ];
  }

  return null;
}