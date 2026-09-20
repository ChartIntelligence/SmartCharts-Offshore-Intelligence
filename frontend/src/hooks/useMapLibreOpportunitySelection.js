import {
  useEffect
} from "react";


export function useMapLibreOpportunitySelection({
  mapRef,
  selectedOpportunity
}) {
  useEffect(() => {
    const map =
      mapRef?.current;

    const coordinates =
      selectedOpportunity
        ?.coordinates;


    if (
      !map ||
      !Array.isArray(
        coordinates
      ) ||
      coordinates.length < 2
    ) {
      return;
    }


    const latitude =
      Number(
        coordinates[0]
      );

    const longitude =
      Number(
        coordinates[1]
      );


    if (
      !Number.isFinite(
        latitude
      ) ||
      !Number.isFinite(
        longitude
      )
    ) {
      return;
    }


    const mobileViewport =
       window.matchMedia(
        "(max-width: 700px)"
      ).matches;

    map.flyTo({
      center: [
      longitude,
      latitude
    ],

    zoom: 7,

    offset: mobileViewport
      ? [0, -85]
      : [0, 0],

    duration: 1400,

    essential: true
  });
  }, [
    mapRef,
    selectedOpportunity
  ]);
}
