

function SelectedTarget({
  selectedSpot,
  oceanData,
  oceanLoading,
  oceanError
}) {

  if (!selectedSpot) {
    return (
      <div className="selected-target empty-target">

        <p className="selected-label">
          Selected Location
        </p>

        <h2 className="selected-target-name">
          No Location Selected
        </h2>

        <p>
          Select a location on the map or in the rankings
          to view its Pelora Intelligence Report.
        </p>

      </div>
    );
  }

    const isDrillShip =
  selectedSpot.category === "drill_ship";

const reportedPosition =
  selectedSpot.position?.reportedAt;

const positionFreshness =
  selectedSpot.position?.freshness;

  return (
    <div className="selected-target">

      <div className="selected-target-header">

        <div>

          <p className="selected-label">
            PELORA INTELLIGENCE REPORT
          </p>

          <h2 className="selected-target-name">
            {selectedSpot.name ||
              "Unnamed Location"}
          </h2>

          <p className="selected-region">
            {selectedSpot.type ||
              "Offshore Location"}

            {selectedSpot.region
              ? ` • ${selectedSpot.region}`
              : ""}
          </p>

        </div>


        <div className="selected-score">

          <span>
            Ocean Signal
          </span>

          <strong>
            {formatOceanSignal(
              oceanData?.oceanSignals
            )}
          </strong>

        </div>

      </div>


     <div className="selected-target-grid">

  {isDrillShip && (
    <div>
      <span>Position Status</span>

      <strong>
        {formatPositionStatus(
          positionFreshness
        )}
      </strong>
    </div>
  )}

  {isDrillShip && (
    <div>
      <span>Position Updated</span>

      <strong>
        {reportedPosition
          ? new Date(
              reportedPosition
            ).toLocaleString()
          : "Timestamp unavailable"}
      </strong>
    </div>
  )}

  <div>
    <span>Evidence Confidence</span>

    <strong>
      {formatEvidenceConfidence(
        oceanData?.oceanSignals
      )}
    </strong>
  </div>

        <div>
          <span>Depth</span>

          <strong>
            {selectedSpot.depth ??
              "Not available"}
          </strong>
        </div>


        <div>
  <span>Sea Surface Temp</span>

  <strong>
    {formatTemperature(
      oceanData?.sst?.temperatureFahrenheit
    )}
  </strong>
</div>


        <div>
          <span>Current</span>

          <strong>
            {formatCurrent(
              oceanData?.currents
            )}
          </strong>

          <small>
            {formatObservationStatus(
              oceanData?.dataQuality?.layers?.currents
            )}
          </small>
        </div>


        <div>
          <span>Current Edge</span>

          <strong>
            {formatCurrentEdge(
              oceanData
                ?.currents
                ?.derived
                ?.spatialAnalysis
                ?.edge
            )}
          </strong>

          <small>
            {formatCurrentEdgeDetail(
              oceanData
                ?.currents
                ?.derived
                ?.spatialAnalysis
                ?.edge
            )}
          </small>
        </div>


        <div>
          <span>Water Color</span>

          <strong>
            {formatWaterColor(
              oceanData?.chlorophyll,
              oceanData?.dataQuality?.layers?.chlorophyll
            )}
          </strong>

          <small>
            {formatObservationStatus(
              oceanData?.dataQuality?.layers?.chlorophyll
            )}
          </small>
        </div>

<div>
  <span>Environment</span>

  <strong>
    {formatEnvironment(
      oceanData?.oceanOpportunity
    )}
  </strong>
</div>

        <div>
          <span>Persistence</span>

          <strong>
            {formatPersistence(
              oceanData?.oceanOpportunity
            )}
          </strong>
        </div>

      </div>


<div className="selected-live-conditions">

  <h3>
    Live Ocean Conditions
  </h3>

  {oceanLoading && (
    <p>
      Loading live conditions...
    </p>
  )}

  {oceanError && (
    <p>
      Live conditions unavailable: {oceanError}
    </p>
  )}

  {!oceanLoading &&
    !oceanError &&
    oceanData && (
      <div className="selected-target-grid">

        <div>
          <span>Sea State</span>

          <strong>
            {formatSeaState(
              oceanData?.oceanConditions
            )}
          </strong>

          <small>
            {formatSeaStateStatus(
              oceanData?.oceanConditions
            )}
          </small>
        </div>


        <div>
          <span>Swell</span>

          <strong>
            {formatGovernedSwell(
              oceanData?.oceanConditions
            )}
          </strong>

          <small>
            {formatSwellContext(
              oceanData?.oceanConditions
            )}
          </small>
        </div>


        <div>
          <span>Wind</span>

          <strong>
            {formatGovernedWind(
              oceanData?.oceanConditions
            )}
          </strong>

          <small>
            {formatWindSeaContext(
              oceanData?.oceanConditions
            )}
          </small>
        </div>


        <div>
          <span>Ride Context</span>

          <strong>
            {formatRideContext(
              oceanData?.oceanConditions
            )}
          </strong>

          <small>
            {formatRideContextDetail(
              oceanData?.oceanConditions
            )}
          </small>
        </div>


        <div>
          <span>Conditions Updated</span>

          <strong>
            {formatUpdatedTime(
              oceanData.lastUpdated
            )}
          </strong>
        </div>

      </div>
    )}

</div>


      <div className="selected-recommendation">

        <h3>
          Pelora Interpretation
        </h3>

        <p>
          {buildPeloraInterpretation(
            oceanData?.oceanSignals,
            oceanData?.oceanOpportunity
          )}
        </p>

      </div>

    </div>
  );
}


function formatPositionStatus(value) {
  const labels = {
    current: "Current",
    recent: "Recently Reported",
    stale: "Needs Verification",
    "unverified-time": "Timestamp Unavailable",
    "recent-location-unverified":
      "Exact Position Unverified"
  };

  return (
    labels[value] ||
    "Verify Before Navigation"
  );
}

function formatUpdatedTime(value) {
  if (!value) {
    return "Unavailable";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unavailable";
  }

  return date.toLocaleString();
}

function formatTemperature(value) {
  return Number.isFinite(value)
    ? `${value}°F`
    : "Waiting for live data";
}

function formatCurrent(current) {
  if (
    !current ||
    !Number.isFinite(
      current.speedKnots
    )
  ) {
    return "Unavailable";
  }

  const direction =
    Number.isFinite(
      current.directionDegrees
    )
      ? ` toward ${String(
          Math.round(
            current.directionDegrees
          )
        ).padStart(3, "0")}°`
      : "";

  return `${current.speedKnots} kt${direction}`;
}


function formatWaterColor(
  chlorophyll,
  layer
) {
  if (
    layer?.state === "stale"
  ) {
    return "Current Observation Unavailable";
  }

  if (
    !chlorophyll?.waterClassification
  ) {
    return "Unavailable";
  }

  return formatClassification(
    chlorophyll.waterClassification
  );
}


function formatObservationStatus(layer) {
  if (!layer) {
    return "Status unavailable";
  }

  if (
    layer.state === "stale"
  ) {
    const age =
      formatObservationAge(
        layer.ageHours
      );

    return age
      ? `Latest observation ${age} ago`
      : "Latest observation is stale";
  }

  if (
    layer.state === "live"
  ) {
    const age =
      formatObservationAge(
        layer.ageHours
      );

    return age
      ? `Latest available · observed ${age} ago`
      : "Latest available";
  }

  const labels = {
    degraded: "Degraded",
    unavailable: "",
    calculated: "Calculated"
  };

  return (
    labels[layer.state] ??
    "Status unavailable"
  );
}


function formatObservationAge(
  ageHours
) {
  if (
    !Number.isFinite(
      ageHours
    )
  ) {
    return "";
  }

  if (ageHours < 24) {
    return `${Math.round(
      ageHours
    )} hr`;
  }

  const days =
    Math.round(
      ageHours / 24
    );

  return `${days} day${
    days === 1
      ? ""
      : "s"
  }`;
}


function formatClassification(
  value
) {
  if (!value) {
    return "";
  }

  return String(value)
    .split("-")
    .map((word) =>
      word.charAt(0).toUpperCase() +
      word.slice(1)
    )
    .join(" ");
}


function formatCurrentEdge(edge) {
  if (
    !edge?.available ||
    edge.currentEdgeDetected !== true
  ) {
    return "No Edge Signal";
  }

  if (
    edge.edgeStrength === "pronounced"
  ) {
    return "Strong Edge Signal";
  }

  return "Edge Signal";
}


function formatCurrentEdgeDetail(edge) {
  if (!edge?.available) {
    return "Current edge analysis unavailable";
  }

  if (
    edge.currentEdgeDetected !== true
  ) {
    return "No clear current edge identified here.";
  }

  if (
    edge.edgeStrength === "pronounced"
  ) {
    return "Pelora sees a strong change in current speed and direction across this area.";
  }

  return "Pelora sees a change in current conditions across this area.";
}


function formatSeaState(conditions) {
  const waves =
    conditions?.assessments?.waves?.values;

  if (
    !Number.isFinite(
      waves?.heightFeet
    )
  ) {
    return "Unavailable";
  }

  const period =
    Number.isFinite(
      waves.periodSeconds
    )
      ? ` at ${waves.periodSeconds} sec`
      : "";

  return `${waves.heightFeet} ft${period}`;
}


function formatSeaStateStatus(conditions) {
  const interaction =
    conditions?.seaStateInteraction;

  if (!interaction) {
    return "Sea-state assessment unavailable";
  }

  if (
    interaction.classification ===
    "use-caution"
  ) {
    return "Use Caution · Crossing seas";
  }

  return (
    interaction.headline ||
    "Sea state assessed"
  );
}


function formatGovernedSwell(conditions) {
  const swell =
    conditions?.assessments?.swell?.values;

  if (
    !Number.isFinite(
      swell?.heightFeet
    )
  ) {
    return "Unavailable";
  }

  const period =
    Number.isFinite(
      swell.periodSeconds
    )
      ? ` at ${swell.periodSeconds} sec`
      : "";

  return `${swell.heightFeet} ft${period}`;
}


function formatSwellContext(conditions) {
  const swell =
    conditions?.assessments?.swell;

  return (
    swell?.headline ||
    "Swell assessment unavailable"
  );
}


function formatGovernedWind(conditions) {
  const wind =
    conditions?.assessments?.wind?.values;

  return Number.isFinite(
    wind?.speedKnots
  )
    ? `${wind.speedKnots} kt`
    : "Unavailable";
}


function formatWindSeaContext(conditions) {
  const interaction =
    conditions?.directionalInteraction;

  if (
    interaction?.classification ===
    "crossing"
  ) {
    return "Crossing the sea direction";
  }

  return (
    interaction?.headline ||
    "Directional context unavailable"
  );
}


function formatRideContext(conditions) {
  const interaction =
    conditions?.seaStateInteraction;

  if (
    interaction?.seaStateType ===
    "confused-or-crossing-seas"
  ) {
    return "Directionally Confused";
  }

  return (
    interaction?.headline ||
    "Normal Sea Pattern"
  );
}


function formatRideContextDetail(
  conditions
) {
  const interaction =
    conditions?.seaStateInteraction;

  if (
    interaction?.classification ===
    "use-caution"
  ) {
    return "Crossing wind and seas may create irregular vessel motion.";
  }

  return (
    interaction?.detail ||
    "No additional ride concerns identified."
  );
}


function formatOceanSignal(oceanSignals) {
  if (
    oceanSignals?.available !== true ||
    !oceanSignals?.primarySignal
  ) {
    return "No Clear Ocean Signal";
  }

  return (
    oceanSignals.primarySignal.label ||
    "Ocean Signal"
  );
}


function formatEvidenceConfidence(
  oceanSignals
) {
  return (
    oceanSignals?.confidence?.level ||
    "Unavailable"
  );
}


function formatEnvironment(opportunity) {
  const pathway =
    opportunity
      ?.pathwayClassification
      ?.classification;

  if (
    pathway === "structure-associated"
  ) {
    return "Structure Associated";
  }

  if (
    pathway === "open-water"
  ) {
    return "Open Water";
  }

  if (
    pathway ===
    "combined-structure-and-open-water"
  ) {
    return "Structure + Open Water";
  }

  return pathway
    ? formatClassification(pathway)
    : "Unresolved";
}


function formatPersistence(opportunity) {
  const persistence =
    opportunity?.persistenceContext;

  if (
    !persistence ||
    persistence.available !== true
  ) {
    return "Not Yet Established";
  }

  if (persistence.lifecycleState) {
    return formatClassification(
      persistence.lifecycleState
    );
  }

  return "Available";
}

function buildPeloraInterpretation(
  oceanSignals,
  opportunity
) {
  const primary =
    oceanSignals?.primarySignal;

  const pathway =
    opportunity
      ?.pathwayClassification
      ?.classification;

  const persistence =
    opportunity?.persistenceContext;

  if (
    oceanSignals?.available !== true ||
    !primary
  ) {
    return (
      "Pelora does not currently see a clear " +
      "ocean feature signal at this location."
    );
  }

  const parts = [];

  if (
    primary.signalType ===
    "temperature-transition"
  ) {
    parts.push(
      "Pelora sees a temperature transition in this area."
    );
  } else if (
    primary.signalType ===
    "current-supported-transition"
  ) {
    parts.push(
      "Pelora sees a transition in this area with current support."
    );
  } else if (
    primary.signalType ===
    "surface-water-transition"
  ) {
    parts.push(
      "Pelora sees a change in surface-water conditions in this area."
    );
  } else {
    parts.push(
      "Pelora sees an environmental feature signal in this area."
    );
  }

  if (
    pathway === "structure-associated"
  ) {
    parts.push(
      "The signal is occurring near verified offshore structure."
    );
  } else if (
    pathway === "open-water"
  ) {
    parts.push(
      "The signal is occurring in an open-water setting."
    );
  } else if (
    pathway ===
    "combined-structure-and-open-water"
  ) {
    parts.push(
      "The signal is occurring where offshore structure and open-water conditions overlap."
    );
  }

  if (
    !persistence ||
    persistence.available !== true
  ) {
    parts.push(
      "Persistence has not yet been established."
    );
  }

  return parts.join(" ");
}

export default SelectedTarget;
