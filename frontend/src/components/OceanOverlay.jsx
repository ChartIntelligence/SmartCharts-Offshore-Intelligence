import {
  Circle,
  CircleMarker,
  Polyline,
  Tooltip
} from "react-leaflet";


function getCurrentEndpoint(spot) {

  const [latitude, longitude] = spot.coordinates;

  const current =
    spot.conditions.current.toLowerCase();

  if (current.includes("northeast")) {
    return [latitude + 0.15, longitude + 0.15];
  }

  if (current.includes("northwest")) {
    return [latitude + 0.15, longitude - 0.15];
  }

  if (current.includes("southeast")) {
    return [latitude - 0.15, longitude + 0.15];
  }

  if (current.includes("southwest")) {
    return [latitude - 0.15, longitude - 0.15];
  }

  return [latitude + 0.12, longitude];
}


function getSstColor(sstValue) {

  if (sstValue >= 81) {
    return "#ff4d4d";
  }

  if (sstValue >= 79) {
    return "#ff8c42";
  }

  if (sstValue >= 77) {
    return "#ffd166";
  }

  return "#4da6ff";
}


function OceanOverlay({ spot, type }) {

  const sstValue = parseFloat(spot.conditions.sst);


  if (type === "sst") {

    const color = getSstColor(sstValue);

    return (
      <Circle
        center={spot.coordinates}
        radius={18000}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: 0.2,
          weight: 1
        }}
      >
        <Tooltip>
          SST: {spot.conditions.sst}
        </Tooltip>
      </Circle>
    );
  }


  if (type === "chlorophyll") {

    const isHigh =
      spot.conditions.chlorophyll === "High";

    const color =
      isHigh ? "#25c97b" : "#80d8a8";

    return (
      <Circle
        center={spot.coordinates}
        radius={14500}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: 0.18,
          weight: 2
        }}
      >
        <Tooltip>
          Chlorophyll: {spot.conditions.chlorophyll}
        </Tooltip>
      </Circle>
    );
  }


  if (type === "currents") {

    const endpoint = getCurrentEndpoint(spot);

    return (
      <>
        <Polyline
          positions={[
            spot.coordinates,
            endpoint
          ]}
          pathOptions={{
            color: "#48c6ef",
            weight: 4,
            opacity: 0.9
          }}
        />

        <CircleMarker
          center={endpoint}
          radius={5}
          pathOptions={{
            color: "#48c6ef",
            fillColor: "#48c6ef",
            fillOpacity: 1
          }}
        >
          <Tooltip>
            Current: {spot.conditions.current}
          </Tooltip>
        </CircleMarker>
      </>
    );
  }


  if (type === "temperatureBreaks") {

    return (
      <Circle
        center={spot.coordinates}
        radius={22000}
        pathOptions={{
          color: "#f5fbff",
          fillOpacity: 0,
          weight: 3,
          dashArray: "8 8"
        }}
      >
        <Tooltip>
          Potential temperature-break zone
        </Tooltip>
      </Circle>
    );
  }


  if (type === "baitProbability") {

    const baitScore = Math.round(
      (
        spot.scores.yellowfin +
        spot.scores.blackfin
      ) / 2
    );

    return (
      <Circle
        center={spot.coordinates}
        radius={baitScore * 140}
        pathOptions={{
          color: "#b86cff",
          fillColor: "#b86cff",
          fillOpacity: 0.18,
          weight: 2
        }}
      >
        <Tooltip>
          Bait probability: {baitScore}/100
        </Tooltip>
      </Circle>
    );
  }


  return null;
}


export default OceanOverlay;