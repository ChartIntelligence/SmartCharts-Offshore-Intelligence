import { useState } from "react";


function LayerControls({ layers, setLayers }) {

  const [isOpen, setIsOpen] = useState(false);


  const toggleLayer = (layer) => {

    setLayers((currentLayers) => ({
      ...currentLayers,
      [layer]: !currentLayers[layer]
    }));

  };


  const toggleableLayerNames = [
  "locations",
  "marlin",
  "yellowfin",
  "blackfin",
  "sst",
  "chlorophyll",
  "currents",
  "temperatureBreaks",
  "baitProbability"
];

const activeLayerCount =
  toggleableLayerNames.filter(
    (layerName) => layers[layerName]
  ).length;


  return (
    <div className="layer-controls">

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

            {layers.chlorophyll && (

  <div className="layer-opacity-control">

    <div className="layer-opacity-label">

      <span>
        Chlorophyll Opacity
      </span>

      <strong>
        {Math.round(
          (layers.chlorophyllOpacity ?? 0.7) *
          100
        )}%
      </strong>

    </div>


    <input
      type="range"
      min="0"
      max="1"
      step="0.05"
      value={
        layers.chlorophyllOpacity ??
        0.7
      }
      onChange={(event) => {
        const opacity =
          Number(
            event.target.value
          );

        setLayers(
          (currentLayers) => ({
            ...currentLayers,
            chlorophyllOpacity:
              opacity
          })
        );
      }}
    />

  </div>

)}

          </div>


          <div className="layer-group">

            <h4>Species Intelligence</h4>

            <label>

              <input
                type="checkbox"
                checked={layers.marlin}
                onChange={() =>
                  toggleLayer("marlin")
                }
              />

              Blue Marlin Probability

            </label>


            <label>

              <input
                type="checkbox"
                checked={layers.yellowfin}
                onChange={() =>
                  toggleLayer("yellowfin")
                }
              />

              Yellowfin Activity

            </label>


            <label>

              <input
                type="checkbox"
                checked={layers.blackfin}
                onChange={() =>
                  toggleLayer("blackfin")
                }
              />

              Blackfin Activity

            </label>

          </div>


          <div className="layer-group">

            <h4>Ocean Intelligence</h4>

            <label>

              <input
                type="checkbox"
                checked={layers.sst}
                onChange={() =>
                  toggleLayer("sst")
                }
              />

              Sea Surface Temperature

            </label>

            {layers.sst && (

  <div className="layer-opacity-control">

    <div className="layer-opacity-label">

      <span>
        SST Opacity
      </span>

      <strong>
        {Math.round(layers.sstOpacity * 100)}%
      </strong>

    </div>


    <input
      type="range"
      min="0"
      max="1"
      step="0.05"
      value={layers.sstOpacity}
      onChange={(event) => {

        const opacity =
          Number(event.target.value);

        setLayers((currentLayers) => ({
          ...currentLayers,
          sstOpacity: opacity
        }));

      }}
    />

  </div>

)}


            <label>

              <input
                type="checkbox"
                checked={layers.chlorophyll}
                onChange={() =>
                  toggleLayer("chlorophyll")
                }
              />

              Chlorophyll

            </label>


            <label>

              <input
                type="checkbox"
                checked={layers.currents}
                onChange={() =>
                  toggleLayer("currents")
                }
              />

              Currents

            </label>


            <label>

              <input
                type="checkbox"
                checked={layers.temperatureBreaks}
                onChange={() =>
                  toggleLayer("temperatureBreaks")
                }
              />

              Temperature Breaks

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