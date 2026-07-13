import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

export function useMapLibreMarkers({
  mapRef,
  structures = [],
  visible = true,
  selectedSpot,
  setSelectedSpot,
  showScores = false,
}) {
  const markersRef = useRef([]);

  useEffect(() => {
    const map = mapRef?.current;

    if (!map) {
      return;
    }

    const removeMarkers = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };

    const createMarkers = () => {
      removeMarkers();

      if (!visible || !Array.isArray(structures)) {
        return;
      }

      structures.forEach((spot) => {
        const coordinates =
          spot.coordinates ??
          spot.coords;

        const normalized = normalizeCoordinates(
          coordinates,
          spot.name
        );

        if (!normalized) {
          return;
        }

        const [longitude, latitude] = normalized;

       const isPlatform =
  spot.category === "structure" ||
  spot.category === "oil_platform" ||
  String(spot.type || "")
    .toLowerCase()
    .includes("platform") ||
  String(spot.type || "")
    .toLowerCase()
    .includes("rig") ||
  String(spot.type || "")
    .toLowerCase()
    .includes("drillship");

const isFad =
  spot.category === "fad" ||
  String(spot.type || "")
    .toLowerCase()
    .includes("fish aggregating device");

const isSelected =
  selectedSpot?.name === spot.name;

const markerAnchor =
  document.createElement("div");

markerAnchor.className =
  "smartcharts-marker-anchor";

const markerButton =
  document.createElement("button");

markerButton.type = "button";

const markerClass = isFad
  ? "fad-marker"
  : isPlatform
    ? "platform-marker"
    : "fishing-ground-marker";

markerButton.className = [
  "maplibre-location-marker",
  markerClass,
  isSelected
    ? "selected-maplibre-marker"
    : "",
]
  .filter(Boolean)
  .join(" ");

        markerButton.setAttribute(
          "aria-label",
          `Select ${spot.name || "offshore location"}`
        );

        markerButton.title =
          spot.name || "Offshore location";

        if (showScores) {
          const score =
            spot.scores?.blueMarlin ??
            spot.scores?.blueMarlinScore ??
            spot.blueMarlinScore ??
            0;

          markerButton.classList.add(
            "maplibre-score-marker"
          );

          markerButton.textContent =
            String(Math.round(Number(score) || 0));
        } else {
markerButton.innerHTML = isFad
  ? createFadSvg()
  : isPlatform
    ? createPlatformSvg()
    : createFishingGroundSvg();
        }

        markerButton.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            event.stopPropagation();

            setSelectedSpot?.(spot);
          }
        );

        markerAnchor.appendChild(markerButton);

        const popup = new maplibregl.Popup({
          offset: 28,
          closeButton: true,
          closeOnClick: false,
        }).setHTML(`
          <div class="smartcharts-popup">
            <strong>${escapeHtml(
              spot.name || "Offshore location"
            )}</strong>
            <p>${escapeHtml(
              spot.type || "Offshore location"
            )}</p>
          </div>
        `);

        const marker = new maplibregl.Marker({
          element: markerAnchor,
          anchor: "center",
        })
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    };

    if (map.loaded()) {
      createMarkers();
    } else {
      map.once("load", createMarkers);
    }

    return () => {
      map.off("load", createMarkers);
      removeMarkers();
    };
  }, [
    mapRef,
    structures,
    visible,
    selectedSpot?.name,
    setSelectedSpot,
    showScores,
  ]);
}

function normalizeCoordinates(
  coordinates,
  locationName = ""
) {
  if (
    !Array.isArray(coordinates) ||
    coordinates.length < 2
  ) {
    console.warn(
      `Missing coordinates for ${locationName}:`,
      coordinates
    );

    return null;
  }

  const first = Number(coordinates[0]);
  const second = Number(coordinates[1]);

  if (
    !Number.isFinite(first) ||
    !Number.isFinite(second)
  ) {
    console.warn(
      `Invalid coordinates for ${locationName}:`,
      coordinates
    );

    return null;
  }

  /*
   * Gulf longitude is normally negative,
   * roughly -100 to -75.
   *
   * Gulf latitude is normally positive,
   * roughly 15 to 32.
   */

  const firstLooksLikeLongitude =
    first >= -100 && first <= -75;

  const secondLooksLikeLatitude =
    second >= 15 && second <= 32;

  if (
    firstLooksLikeLongitude &&
    secondLooksLikeLatitude
  ) {
    // Already [longitude, latitude]
    return [first, second];
  }

  const firstLooksLikeLatitude =
    first >= 15 && first <= 32;

  const secondLooksLikeLongitude =
    second >= -100 && second <= -75;

  if (
    firstLooksLikeLatitude &&
    secondLooksLikeLongitude
  ) {
    // Stored as [latitude, longitude]
    return [second, first];
  }

  console.warn(
    `Coordinates for ${locationName} do not look like Gulf coordinates:`,
    coordinates
  );

  return null;
}

function createFishingGroundSvg() {
  return `
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="32"
        r="19"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
      />

      <circle
        cx="32"
        cy="32"
        r="5"
        fill="currentColor"
      />

      <path
        d="M32 6v12M32 46v12M6 32h12M46 32h12"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />

      <path
        d="M23 35c5-8 14-8 19-1-5 7-14 8-19 1Zm19-1 7-5v10l-7-5Z"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

function createPlatformSvg() {
  return `
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <path
        d="M19 15h26l5 12H14l5-12Z"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linejoin="round"
      />

      <path
        d="M22 27 17 54M42 27l5 27M27 27l-2 27M37 27l2 27"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />

      <path
        d="M14 54h36M20 43h24M25 15V8h14v7"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />

      <path
        d="M32 8V3"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>
  `;
}

function createFadSvg() {
  return `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle
        cx="32"
        cy="16"
        r="9"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
      />

      <path
        d="M32 25v24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />

      <path
        d="M23 49h18l-4 9H27l-4-9Z"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linejoin="round"
      />

      <path
        d="M17 31c4-4 8-4 12 0M35 34c4-4 8-4 12 0"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
      />
    </svg>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}