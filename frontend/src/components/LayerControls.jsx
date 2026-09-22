import { useState } from "react";
import { FIELD_CONTROLS } from "../utils/oceanFieldPresentation.js";
import { OBSERVATION_CONTROLS } from "../utils/mapObservationDisplay.js";


function LayerControls({ layers, setLayers, observationDisplay, fieldStatus, qaSamples = false, transitionAvailable = false }) {

  const [isOpen, setIsOpen] = useState(false);


  const toggleLayer = (layer) => {

    setLayers((currentLayers) => ({
      ...currentLayers,
      [layer]: !currentLayers[layer]
    }));

  };


  const activeLayerCount = Number(layers.locations) +
    Number(layers.temperatureTransition && transitionAvailable) +
    FIELD_CONTROLS.filter(({key}) => layers[key] && fieldStatus?.[key === "currentField" ? "currents" : key]?.field?.coverage.validCells > 0).length +
    (qaSamples ? OBSERVATION_CONTROLS.filter(({key,type}) => layers[key] && observationDisplay?.counts[type] > 0).length : 0);



  return (
    <div className={isOpen ? "layer-controls is-open" : "layer-controls"}>

      <button
        type="button"
        className="layer-controls-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >

        <span>

          <strong>
            Map Intelligence
          </strong>

          <small>
            {activeLayerCount} active layers
          </small>

        </span>


        <span
          className={
            isOpen
              ? "layer-toggle-arrow open"
              : "layer-toggle-arrow"
          }
          aria-hidden="true"
        >
          ▾
        </span>

      </button>


      {isOpen && (

        <div className="layer-controls-content">

          <div className="layer-group">

            <h4>Locations</h4>

            <label>

              <input
                type="checkbox"
                checked={layers.locations}
                onChange={() =>
                  toggleLayer("locations")
                }
              />

              Location Icons

            </label>



          </div>


          <div className="layer-group">

            <h4>Ocean Intelligence</h4>

            {FIELD_CONTROLS.map(({key,label}) => <label key={key}>
              <input type="checkbox" checked={!!layers[key]} onChange={() => toggleLayer(key)} />
              <span>{label}<small className="observation-layer-note">Viewport field · {!layers[key] ? "off" : fieldStatus?.[key === "currentField" ? "currents" : key]?.status ?? "loading"}</small></span>
            </label>)}
            <p className="observation-layer-note">Bathymetry: decimated ETOPO elevation shading, not a navigation chart. Arrows: geostrophic surface flow only.</p>
            {qaSamples && <>
            <p className="observation-layer-note">QA provider samples only; no continuous coverage.</p>
            {OBSERVATION_CONTROLS.map(({ key, type, label }) => (
              <label key={key}>
                <input type="checkbox" checked={layers[key]} onChange={() => toggleLayer(key)} />
                <span>{label}<small className="observation-layer-note">
                  {observationDisplay?.counts[type] ?? 0} eligible samples
                </small></span>
              </label>
            ))}
            <p className="observation-layer-note">
              {observationDisplay?.requestStatus === "loading" ? "Loading provider samples…" :
                observationDisplay?.requestStatus === "degraded" ? "Refresh failed; retained samples keep their own timestamps and status." :
                observationDisplay?.requestStatus === "unavailable" ? "Select a Place or Opportunity to request ocean observations." :
                "Tap a sample to inspect its source, value and time."}
            </p>
            <p className="observation-layer-note">
              {observationDisplay?.counts.current > 0 ?
                "Current arrows share one provider, dataset and valid time. Unmeasured water is not covered." :
                "No eligible time-aligned current arrows are available."}
              {observationDisplay?.excluded.length > 0 && " Some samples are excluded by position, provenance, value, freshness or time-alignment requirements."}
            </p>
            </>}

            <label>

              <input
                type="checkbox"
                checked={
                  layers.temperatureTransition
                }
                onChange={() =>
                  toggleLayer(
                    "temperatureTransition"
                  )
                }
              />

              Temperature Transition Sampling Evidence

            </label>


            <label>

              <input
                type="checkbox"
                checked={layers.baitProbability}
                onChange={() =>
                  toggleLayer("baitProbability")
                }
              />

              Bait Probability

            </label>

          </div>

        </div>

      )}

    </div>
  );
}


export default LayerControls;