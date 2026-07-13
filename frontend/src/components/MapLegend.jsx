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


function MapLegend({ layers }) {

  const [isOpen, setIsOpen] = useState(false);


  const hasIntelligenceLayers =
    layers.marlin ||
    layers.yellowfin ||
    layers.blackfin ||
    layers.sst ||
    layers.chlorophyll ||
    layers.currents ||
    layers.temperatureBreaks ||
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
            </>
          )}


          {layers.marlin && (
            <div className="legend-row">

              <span className="legend-swatch legend-marlin" />

              <span>
                Blue Marlin Heatmap
              </span>

            </div>
          )}


          {layers.yellowfin && (
            <div className="legend-row">

              <span className="legend-swatch legend-yellowfin" />

              <span>
                Yellowfin
              </span>

            </div>
          )}


          {layers.blackfin && (
            <div className="legend-row">

              <span className="legend-swatch legend-blackfin" />

              <span>
                Blackfin
              </span>

            </div>
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


          {layers.temperatureBreaks && (
            <div className="legend-row">

              <span className="legend-temperature-break" />

              <span>
                Temperature Break
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


          {!layers.locations && !hasIntelligenceLayers && (
            <p className="legend-empty">
              No active map layers
            </p>
          )}

        </div>
      )}

    </div>
  );
}


export default MapLegend;