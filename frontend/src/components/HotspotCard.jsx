import { calculateBlueMarlinScore } from "../utils/scoreEngine";

function HotspotCard({ spot }) {

  const marlinScore = calculateBlueMarlinScore(spot);

  return (
    <div className="hotspot-card">

      <h2>{marlinScore.total}</h2>

      <h3>{spot.name}</h3>

      <p>
        <strong>Type:</strong> {spot.type}
      </p>

      {spot.region && (
        <p>
          <strong>Region:</strong> {spot.region}
        </p>
      )}

      <p>
        <strong>Yellowfin:</strong> {spot.scores.yellowfin}
      </p>

      <p>
        <strong>Blackfin:</strong> {spot.scores.blackfin}
      </p>

      <p>
        <strong>SST:</strong> {spot.conditions.sst}
      </p>

      <p>
        <strong>Current:</strong> {spot.conditions.current}
      </p>

      <p>
        <strong>Chlorophyll:</strong> {spot.conditions.chlorophyll}
      </p>

      <p className="recommendation">
        {spot.recommendation}
      </p>

    </div>
  );
}

export default HotspotCard;