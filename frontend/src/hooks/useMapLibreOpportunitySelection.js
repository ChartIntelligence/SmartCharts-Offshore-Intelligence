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


    map.flyTo({
      center: [
        longitude,
        latitude
      ],

      zoom: 8,

      duration: 1400,

      essential: true
    });
  }, [
    mapRef,
    selectedOpportunity
  ]);
}