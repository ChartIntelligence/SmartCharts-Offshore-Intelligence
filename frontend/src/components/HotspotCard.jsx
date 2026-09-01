function HotspotCard({ spot }) {
  return (
    <div className="hotspot-card">

      <h3>{spot.name}</h3>

      <p>
        <strong>Type:</strong>{" "}
        {spot.type ?? "Unavailable"}
      </p>

      {spot.region && (
        <p>
          <strong>Region:</strong>{" "}
          {spot.region}
        </p>
      )}

      <p>
        <strong>Yellowfin:</strong>{" "}
        {spot?.scores?.yellowfin ??
          "Unavailable"}
      </p>

      <p>
        <strong>Blackfin:</strong>{" "}
        {spot?.scores?.blackfin ??
          "Unavailable"}
      </p>

      <p>
        <strong>SST:</strong>{" "}
        {spot?.conditions?.sst ??
          "Unavailable"}
      </p>

      <p>
        <strong>Current:</strong>{" "}
        {spot?.conditions?.current ??
          "Unavailable"}
      </p>

      <p>
        <strong>Chlorophyll:</strong>{" "}
        {spot?.conditions
          ?.chlorophyll ??
          "Unavailable"}
      </p>

      {spot.recommendation && (
        <p className="recommendation">
          {spot.recommendation}
        </p>
      )}

    </div>
  );
}

export default HotspotCard;