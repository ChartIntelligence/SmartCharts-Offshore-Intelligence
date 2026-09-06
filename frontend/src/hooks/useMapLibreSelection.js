import { useEffect } from "react";


export function useMapLibreSelection({
  mapRef,
  selectedSpot
}) {

  useEffect(() => {

    const map = mapRef.current;

    if (!map || !selectedSpot) {
      return;
    }


    map.easeTo({
      center: [
        selectedSpot.coordinates[1],
        selectedSpot.coordinates[0]
      ],

      duration: 450,

      essential: true
    });

  }, [
    mapRef,
    selectedSpot
  ]);
}