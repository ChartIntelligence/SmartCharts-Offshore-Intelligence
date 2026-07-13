import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { calculateBlueMarlinScore } from "../utils/scoreEngine";


function getScoreColor(score) {
  if (score >= 90) {
    return "#ff4d4d";
  }

  if (score >= 75) {
    return "#ff8c42";
  }

  if (score >= 60) {
    return "#ffd166";
  }

  return "#9ec9df";
}


function getLocationType(spot) {
  if (
    spot.category === "structure" ||
    spot.type === "Deepwater Platform"
  ) {
    return "platform";
  }

  return "fishing-ground";
}


function getLocationLabel(spot) {
  return getLocationType(spot) === "platform"
    ? "Offshore Platform"
    : "Fishing Ground";
}


function getLocationSvg(spot) {
  if (getLocationType(spot) === "platform") {
    return `
      <svg
        viewBox="0 0 64 64"
        class="location-svg"
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

  return `
    <svg
      viewBox="0 0 64 64"
      class="location-svg"
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


function MarlinMarker({
  spot,
  selectedSpot,
  showScore
}) {
  const marlinScore =
    calculateBlueMarlinScore(spot).total;

  const isSelected =
    selectedSpot?.name === spot.name;

  const scoreColor =
    getScoreColor(marlinScore);

  const markerSize =
    isSelected ? 58 : 46;

  const locationType =
    getLocationType(spot);

  const locationSvg =
    getLocationSvg(spot);


  const markerHtml = showScore
    ? `
      <div
        class="${
          isSelected
            ? "marker-circle selected-marker"
            : "marker-circle"
        }"
        style="
          width:${markerSize}px;
          height:${markerSize}px;
          background:${scoreColor};
          box-shadow:${
            isSelected
              ? "0 0 12px #ffffff, 0 0 30px #ff8c42"
              : `0 0 15px ${scoreColor}`
          };
        "
      >
        ${marlinScore}
      </div>
    `
    : `
      <div
        class="${
          isSelected
            ? `location-icon ${locationType} selected-location-icon`
            : `location-icon ${locationType}`
        }"
      >
        ${locationSvg}
      </div>
    `;


  const icon = L.divIcon({
    className: "smart-marker",

    iconSize: [
      markerSize,
      markerSize
    ],

    iconAnchor: [
      markerSize / 2,
      markerSize / 2
    ],

    popupAnchor: [
      0,
      -(markerSize / 2)
    ],

    html: markerHtml
  });


  return (
    <Marker
      position={spot.coordinates}
      icon={icon}
    >
      <Popup>

        <strong>{spot.name}</strong>

        <br />

        Type: {getLocationLabel(spot)}

        <br />

        Structure: {spot.type}

        <br />

        Blue Marlin: {marlinScore}

        <br />

        Yellowfin: {spot.scores.yellowfin}

        <br />

        Blackfin: {spot.scores.blackfin}

        <br />

        Current: {spot.conditions.current}

      </Popup>
    </Marker>
  );
}


export default MarlinMarker;