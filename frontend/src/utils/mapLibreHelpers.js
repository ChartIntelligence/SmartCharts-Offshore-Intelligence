import { calculateBlueMarlinScore } from "./scoreEngine";


export function isPlatform(spot) {
  return (
    spot.category === "structure" ||
    spot.type === "Deepwater Platform"
  );
}


export function getScoreColor(score) {
  if (score >= 90) {
    return "#f03e3e";
  }

  if (score >= 75) {
    return "#ff922b";
  }

  if (score >= 60) {
    return "#ffd43b";
  }

  return "#2f9e44";
}


export function createFishingGroundSvg() {
  return `
    <svg viewBox="0 0 64 64" aria-hidden="true">
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


export function createPlatformSvg() {
  return `
    <svg viewBox="0 0 64 64" aria-hidden="true">
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


export function buildMapGeoJson(structures = []) {
  return {
    type: "FeatureCollection",

    features: structures
      .filter((spot) => {
        return (
          spot.active !== false &&
          Array.isArray(spot.coordinates) &&
          spot.coordinates.length === 2
        );
      })
      .map((spot) => {
        const score =
          calculateBlueMarlinScore(spot).total;

        const currentText =
          spot.conditions?.current?.toLowerCase() || "";

        const [latitude, longitude] =
          spot.coordinates;

        return {
          type: "Feature",

          geometry: {
            type: "Point",

            coordinates: [
              longitude,
              latitude
            ]
          },

          properties: {
            id:
              spot.id ||
              spot.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, ""),

            name: spot.name,

            shortName:
              spot.shortName ||
              spot.name,

            type: spot.type,
            region: spot.region,
            category: spot.category,
            depth: spot.depth,

            score,

            blueMarlin:
              spot.scores?.blueMarlin ?? score,

            yellowfin:
              spot.scores?.yellowfin ?? 0,

            blackfin:
              spot.scores?.blackfin ?? 0,

            sst:
              parseFloat(
                spot.conditions?.sst
              ) || 0,

            chlorophyll:
              spot.conditions?.chlorophyll === "High"
                ? 90
                : spot.conditions?.chlorophyll === "Moderate"
                  ? 65
                  : 35,

            currentStrength:
              currentText.includes("strong")
                ? 90
                : currentText.includes("moderate")
                  ? 60
                  : 30,

            currentLabel:
              spot.conditions?.current ||
              "Unknown",

            influenceRadius:
              spot.influenceRadius ?? 3000
          }
        };
      })
  };
}