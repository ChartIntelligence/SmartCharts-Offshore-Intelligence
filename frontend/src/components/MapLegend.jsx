import { useState } from "react";


function PlatformLegendIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="legend-location-svg"
      aria-hidden="true"
    >
      <path
        d="M19 15h26l5 12H14l5-12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M22 27 17 54M42 27l5 27M27 27l-2 27M37 27l2 27"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M14 54h36M20 43h24M25 15V8h14v7"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}


function FishingGroundLegendIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="legend-location-svg"
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="32"
        r="19"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
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
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}


function FadLegendIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="legend-location-svg"
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="16"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />

      <path
        d="M32 25v24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M23 49h18l-4 9H27l-4-9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M17 31c4-4 8-4 12 0M35 34c4-4 8-4 12 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}


function DrillShipLegendIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="legend-location-svg"
      aria-hidden="true"
    >
      <path
        d="M10 40h44l-7 12H18L10 40Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M20 40V24h24v16"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M27 24V12h10v12M32 12V4"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M15 56c5 3 9 3 14 0 5 3 9 3 14 0 5 3 9 3 14 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}


function ClusterLegendIcon() {
  return (
    <span
      className="legend-cluster-glyph"
      aria-hidden="true"
    >
      <span className="legend-cluster-tile legend-cluster-tile-back" />
      <span className="legend-cluster-tile legend-cluster-tile-middle" />
      <span className="legend-cluster-tile legend-cluster-tile-front" />
    </span>
  );
}


function OpportunityLegendIcon() {
  return (
    <span
      className="legend-opportunity-marker"
      aria-hidden="true"
    >
      <span className="legend-opportunity-core">
        1
      </span>
    </span>
  );
}


function MapLegend({ layers }) {

  const [isOpen, setIsOpen] = useState(false);


  const hasIntelligenceLayers =
    layers.sst ||
    layers.chlorophyll ||
    layers.currents ||
    layers.temperatureTransition ||
    layers.baitProbability;


  return (
    <div className="legend-control">

      <button
        type="button"
        className="legend-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="legend-info-icon">
          i
        </span>

        <span>
          Legend
        </span>
      </button>


      {isOpen && (
        <div className="map-legend">

          <div className="map-legend-header">

            <h3>
              Map Legend
            </h3>

            <button
              type="button"
              className="legend-close-button"
              aria-label="Close map legend"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>

          </div>


          {layers.locations && (
            <>
              <div className="legend-row">

                <span className="legend-location platform-legend">
                  <PlatformLegendIcon />
                </span>

                <span>
                  Offshore Platform
                </span>

              </div>


              <div className="legend-row">

                <span className="legend-location fishing-ground-legend">
                  <FishingGroundLegendIcon />
                </span>

                <span>
                  Fishing Ground
                </span>

              </div>


              <div className="legend-row">

                <span className="legend-location fad-legend">
                  <FadLegendIcon />
                </span>

                <span>
                  FAD
                </span>

              </div>


              <div className="legend-row">

                <span className="legend-location drillship-legend">
                  <DrillShipLegendIcon />
                </span>

                <span>
                  Drill Ship
                </span>

              </div>


              <div className="legend-row">

                <ClusterLegendIcon />

                <span>
                  Location Cluster
                </span>

              </div>
            </>
          )}


          {layers.sst && (
            <div className="legend-row">

              <span className="legend-swatch legend-sst" />

              <span>
                SST
              </span>

            </div>
          )}


          {layers.chlorophyll && (
            <div className="legend-row">

              <span className="legend-swatch legend-chlorophyll" />

              <span>
                Chlorophyll
              </span>

            </div>
          )}


          {layers.currents && (
            <div className="legend-row">

              <span className="legend-current-line" />

              <span>
                Current
              </span>

            </div>
          )}


          {layers.temperatureTransition && (
            <div className="legend-row">

              <span
                className="legend-temperature-break"
              />

              <span>
                Temperature Transition Evidence
              </span>

            </div>
          )}


          {layers.baitProbability && (
            <div className="legend-row">

              <span className="legend-swatch legend-bait" />

              <span>
                Bait Probability
              </span>

            </div>
          )}


          <div className="legend-row">

            <OpportunityLegendIcon />

            <span>
              Open Water Opportunity
            </span>

          </div>


        </div>
      )}

    </div>
  );
}


export default MapLegend;