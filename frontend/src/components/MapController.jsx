import { useMap } from "react-leaflet";
import { useEffect } from "react";


function MapController({ selectedSpot }) {

  const map = useMap();


  useEffect(() => {

    if(selectedSpot){

      map.flyTo(
        selectedSpot.coordinates,
        8,
        {
          duration:1.5
        }
      );

    }

  }, [selectedSpot, map]);


  return null;

}


export default MapController;