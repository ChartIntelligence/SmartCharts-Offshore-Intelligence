import {
  useEffect,
  useState
} from "react";


export function useLiveMarineConditions(
  location,
  accessToken = null
) {
  const coordinates = location?.coordinates ?? location?.coords;
  const normalized = normalizeCoordinates(coordinates);
  const longitude = normalized?.[0] ?? null;
  const latitude = normalized?.[1] ?? null;
  const contextKey = JSON.stringify([
    location?.id ?? null,
    location?.name ?? null,
    longitude,
    latitude
  ]);
  const [state, setState] = useState(null);

  useEffect(() => {
    const contextState = {
      contextKey,
      accessToken,
      data: null,
      loading: longitude !== null && latitude !== null,
      error: null
    };

    if (longitude === null || latitude === null) {
      setState({
        ...contextState,
        loading: false,
        error: "Location coordinates unavailable."
      });
      return;
    }

    // Retention is only valid within this exact selected context.
    setState(contextState);
    const controller = new AbortController();
    let latestRequest = 0;

    async function loadConditions() {
      const requestId = ++latestRequest;
      const isCurrent = () =>
        !controller.signal.aborted && requestId === latestRequest;

      if (!isCurrent()) return;
      setState(current => ({ ...current, loading: true, error: null }));

      try {
        const response = await fetch(
          `https://velion-ocean-engine.onrender.com/api/ocean?lat=${latitude}&lon=${longitude}&t=${Date.now()}`,
          {
            signal: controller.signal,
            cache: "no-store",
            headers:
              typeof accessToken === "string" && accessToken.trim() !== ""
                ? { Authorization: `Bearer ${accessToken}` }
                : {}
          }
        );

        if (!response.ok) {
          throw new Error(`Live-data request failed: ${response.status}`);
        }

        const data = await response.json();
        if (!isCurrent()) return;
        setState({ ...contextState, data, loading: false });
      } catch (requestError) {
        if (!isCurrent() || requestError.name === "AbortError") return;
        console.error("Unable to load marine conditions:", requestError);
        // Keep the last successful response only for this same context.
        setState(current => ({
          ...current,
          loading: false,
          error: requestError.message || "Live data temporarily unavailable."
        }));
      }
    }

    loadConditions();
    const refreshTimer = window.setInterval(loadConditions, 15 * 60 * 1000);
    const retryTimer = window.setTimeout(loadConditions, 5000);

    return () => {
      controller.abort();
      window.clearTimeout(retryTimer);
      window.clearInterval(refreshTimer);
    };
  }, [contextKey, longitude, latitude, accessToken]);

  // Hide old-context data immediately, including before effect cleanup runs.
  const current = state?.contextKey === contextKey &&
    state?.accessToken === accessToken ? state : null;

  return {
    requestStatus: current?.error ? "degraded" : current?.loading ? "loading" : current?.data ? "ready" : "unavailable",
    data: current?.data ?? null,
    loading: current?.loading ?? (longitude !== null && latitude !== null),
    error: current?.data ? null : current?.error ?? null
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