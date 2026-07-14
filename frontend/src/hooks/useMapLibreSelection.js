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


    map.flyTo({
      center: [
        selectedSpot.coordinates[1],
        selectedSpot.coordinates[0]
      ],

      zoom: 10,

      duration: 1400,

      essential: true
    });

  }, [
    mapRef,
    selectedSpot
  ]);
}