import { useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const INITIAL_SPECIES_RESULTS = {
  blueMarlin: {
    sightings: 0,
    bites: 0,
    hookups: 0,
    released: 0,
    landed: 0,
    lost: 0
  },

  whiteMarlin: {
    sightings: 0,
    bites: 0,
    hookups: 0,
    released: 0,
    landed: 0,
    lost: 0
  },

  sailfish: {
    sightings: 0,
    bites: 0,
    hookups: 0,
    released: 0,
    landed: 0,
    lost: 0
  },

  yellowfin: {
    sightings: 0,
    bites: 0,
    hookups: 0,
    released: 0,
    landed: 0,
    lost: 0
  },

  blackfin: {
    sightings: 0,
    bites: 0,
    hookups: 0,
    released: 0,
    landed: 0,
    lost: 0
  },

  wahoo: {
    sightings: 0,
    bites: 0,
    hookups: 0,
    released: 0,
    landed: 0,
    lost: 0
  },

  mahi: {
    sightings: 0,
    bites: 0,
    hookups: 0,
    released: 0,
    landed: 0,
    lost: 0
  }
};


const SPECIES_LABELS = {
  blueMarlin: "Blue Marlin",
  whiteMarlin: "White Marlin",
  sailfish: "Sailfish",
  yellowfin: "Yellowfin Tuna",
  blackfin: "Blackfin Tuna",
  wahoo: "Wahoo",
  mahi: "Mahi"
};


function createInitialReport() {
  return {
    captain: "",
    boat: "",
    tournament: "",
    date: new Date().toISOString().slice(0, 10),

    visibility: "private",
    shareIntelligence: false,

    linesIn: "",
    linesOut: "",
    hoursFished: "",
    milesRun: "",

    areasFished: [],

    baitObserved: [],
    birdActivity: [],
    waterColor: "",
    weedCondition: "",
    floatingStructure: [],

    speciesResults: structuredClone(
      INITIAL_SPECIES_RESULTS
    ),

    tripOutcome: "",
    informationSource: "firsthand",
    notes: ""
  };
}


function FishingDayReportPanel({
  isOpen,
  onClose,
  onReportSaved,
  structures = [],
  user
}) {

  const [report, setReport] = useState(
    createInitialReport
  );

  const [areaSearch, setAreaSearch] =
    useState("");

  const filteredStructures = useMemo(() => {
    const search =
      areaSearch.trim().toLowerCase();

    if (!search) {
      return structures.slice(0, 12);
    }

    return structures
      .filter((spot) => {
        return [
          spot.name,
          spot.shortName,
          spot.type,
          spot.region
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(search)
          );
      })
      .slice(0, 20);
  }, [
    areaSearch,
    structures
  ]);


  const updateField = (
    field,
    value
  ) => {
    setReport((current) => ({
      ...current,
      [field]: value
    }));
  };


  const toggleArrayValue = (
    field,
    value
  ) => {
    setReport((current) => {
      const values =
        current[field] || [];

      const exists =
        values.includes(value);

      return {
        ...current,
        [field]: exists
          ? values.filter(
              (item) => item !== value
            )
          : [...values, value]
      };
    });
  };


  const toggleArea = (spot) => {
    setReport((current) => {
      const exists =
        current.areasFished.some(
          (area) =>
            area.id === spot.id ||
            area.name === spot.name
        );

      return {
        ...current,

        areasFished: exists
          ? current.areasFished.filter(
              (area) =>
                area.id !== spot.id &&
                area.name !== spot.name
            )
          : [
              ...current.areasFished,
              {
                id:
                  spot.id ||
                  spot.name,
                name: spot.name,
                category: spot.category,
                region: spot.region,
                priority:
                  current.areasFished.length + 1
              }
            ]
      };
    });
  };


  const updateSpeciesResult = (
    species,
    field,
    value
  ) => {
    setReport((current) => ({
      ...current,

      speciesResults: {
        ...current.speciesResults,

        [species]: {
          ...current.speciesResults[species],

          [field]:
            Math.max(
              0,
              Number(value) || 0
            )
        }
      }
    }));
  };


  const saveReport = async (event) => {
  event.preventDefault();

  if (!user?.id) {
    window.alert(
      "Private storage is still initializing. Please try again in a moment."
    );

    return;
  }

  const reportRow = {
    user_id: user.id,

    trip_date: report.date,

    captain_private:
      report.captain,

    boat_private:
      report.boat,

    tournament_private:
      report.tournament || null,

    lines_in:
      report.linesIn || null,

    lines_out:
      report.linesOut || null,

    hours_fished:
      report.hoursFished === ""
        ? null
        : Number(report.hoursFished),

    miles_run:
      report.milesRun === ""
        ? null
        : Number(report.milesRun),

    areas_fished:
      report.areasFished,

    bait_observed:
      report.baitObserved,

    bird_activity:
      report.birdActivity,

    water_color:
      report.waterColor || null,

    weed_condition:
      report.weedCondition || null,

    floating_structure:
      report.floatingStructure,

    species_results:
      report.speciesResults,

    trip_outcome:
      report.tripOutcome || null,

    information_source:
      report.informationSource,

    notes_private:
      report.notes || null,

    share_intelligence:
      report.shareIntelligence === true
  };

  const {
    data: savedRows,
    error: saveError
  } =
    await supabase
      .from("fishing_day_reports")
      .insert(reportRow)
      .select();

  if (saveError) {
    console.error(
      "Unable to save fishing day:",
      saveError
    );

    window.alert(
      `Fishing day could not be saved: ${saveError.message}`
    );

    return;
  }

  const savedReport =
    savedRows?.[0] ?? null;

  onReportSaved?.(
    savedReport
  );

  setReport(
    createInitialReport()
  );

  setAreaSearch("");

  window.alert(
    "Fishing day saved privately to Velion."
  );

  onClose?.();
};


  if (!isOpen) {
    return null;
  }


  return (
    <div
      className="report-panel-backdrop"
      onMouseDown={onClose}
    >

      <aside
        className="fishing-report-panel"
        aria-label="Log fishing day"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        <header className="report-panel-header">

          <div>
            <p className="report-panel-eyebrow">
              SmartCharts Intelligence
            </p>

            <h2>
              Log Fishing Day
            </h2>

            <p>
              Record the day’s effort,
              locations, observations and
              results.
            </p>
          </div>


          <button
            type="button"
            className="report-panel-close"
            onClick={onClose}
            aria-label="Close report panel"
          >
            ×
          </button>

        </header>


        <form
          className="fishing-report-form"
          onSubmit={saveReport}
        >

          <ReportSection
            title="Boat Information"
          >

            <div className="report-form-grid">

              <ReportInput
                label="Captain"
                value={report.captain}
                required
                onChange={(value) =>
                  updateField(
                    "captain",
                    value
                  )
                }
              />

              <ReportInput
                label="Boat Name"
                value={report.boat}
                required
                onChange={(value) =>
                  updateField(
                    "boat",
                    value
                  )
                }
              />

              <ReportInput
                label="Tournament"
                value={report.tournament}
                onChange={(value) =>
                  updateField(
                    "tournament",
                    value
                  )
                }
              />

              <ReportInput
                label="Date"
                type="date"
                value={report.date}
                required
                onChange={(value) =>
                  updateField(
                    "date",
                    value
                  )
                }
              />

            </div>

          </ReportSection>


          <ReportSection
            title="Fishing Effort"
          >

            <div className="report-form-grid">

              <ReportInput
                label="Lines In"
                type="time"
                value={report.linesIn}
                onChange={(value) =>
                  updateField(
                    "linesIn",
                    value
                  )
                }
              />

              <ReportInput
                label="Lines Out"
                type="time"
                value={report.linesOut}
                onChange={(value) =>
                  updateField(
                    "linesOut",
                    value
                  )
                }
              />

              <ReportInput
                label="Hours Fished"
                type="number"
                min="0"
                step="0.25"
                value={report.hoursFished}
                onChange={(value) =>
                  updateField(
                    "hoursFished",
                    value
                  )
                }
              />

              <ReportInput
                label="Miles Run"
                type="number"
                min="0"
                step="1"
                value={report.milesRun}
                onChange={(value) =>
                  updateField(
                    "milesRun",
                    value
                  )
                }
              />

            </div>

          </ReportSection>


          <ReportSection
            title="Areas Fished"
          >

            <input
              className="report-search-input"
              type="search"
              placeholder="Search rigs, FADs or fishing areas"
              value={areaSearch}
              onChange={(event) =>
                setAreaSearch(
                  event.target.value
                )
              }
            />


            <div className="report-area-results">

              {filteredStructures.map(
                (spot) => {

                  const selected =
                    report.areasFished.some(
                      (area) =>
                        area.id === spot.id ||
                        area.name === spot.name
                    );

                  return (
                    <button
                      key={
                        spot.id ||
                        spot.name
                      }
                      type="button"
                      className={[
                        "report-area-option",

                        selected
                          ? "selected-report-area"
                          : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() =>
                        toggleArea(spot)
                      }
                    >

                      <strong>
                        {spot.name}
                      </strong>

                      <span>
                        {spot.type}
                      </span>

                    </button>
                  );
                }
              )}

            </div>


            {report.areasFished.length > 0 && (
              <div className="selected-report-areas">

                <h4>
                  Selected Areas
                </h4>

                {report.areasFished.map(
                  (area, index) => (
                    <div
                      key={
                        area.id ||
                        area.name
                      }
                      className="selected-report-area-row"
                    >

                      <span>
                        {index + 1}.
                      </span>

                      <strong>
                        {area.name}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          toggleArea(area)
                        }
                      >
                        Remove
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

          </ReportSection>


          <ReportSection
            title="Bait and Surface Activity"
          >

            <CheckboxGroup
              label="Bait Observed"
              values={[
                "Flying Fish",
                "Ballyhoo",
                "Hardtails",
                "Bonita",
                "Blackfin Tuna",
                "Yellowfin Tuna",
                "No Bait Observed"
              ]}
              selected={
                report.baitObserved
              }
              onToggle={(value) =>
                toggleArrayValue(
                  "baitObserved",
                  value
                )
              }
            />


            <CheckboxGroup
              label="Bird Activity"
              values={[
                "Frigate Birds",
                "Terns",
                "Gulls",
                "Scattered Birds",
                "No Bird Activity"
              ]}
              selected={
                report.birdActivity
              }
              onToggle={(value) =>
                toggleArrayValue(
                  "birdActivity",
                  value
                )
              }
            />


            <div className="report-form-grid">

              <ReportSelect
                label="Water Color"
                value={report.waterColor}
                options={[
                  "Blue",
                  "Blue-Green",
                  "Green",
                  "Mixed",
                  "Dirty"
                ]}
                onChange={(value) =>
                  updateField(
                    "waterColor",
                    value
                  )
                }
              />

              <ReportSelect
                label="Weed Condition"
                value={
                  report.weedCondition
                }
                options={[
                  "None",
                  "Scattered",
                  "Moderate",
                  "Heavy",
                  "Defined Weed Line"
                ]}
                onChange={(value) =>
                  updateField(
                    "weedCondition",
                    value
                  )
                }
              />

            </div>


            <CheckboxGroup
              label="Floating Structure"
              values={[
                "Logs",
                "Pallets",
                "Grass Mats",
                "Other Debris",
                "None"
              ]}
              selected={
                report.floatingStructure
              }
              onToggle={(value) =>
                toggleArrayValue(
                  "floatingStructure",
                  value
                )
              }
            />

          </ReportSection>


          <ReportSection
            title="Fish Activity"
          >

            <div className="species-report-table">

              <div className="species-report-header">

                <span>Species</span>
                <span>Seen</span>
                <span>Bites</span>
                <span>Hookups</span>
                <span>Released</span>
                <span>Landed</span>
                <span>Lost</span>

              </div>


              {Object.entries(
                SPECIES_LABELS
              ).map(
                ([
                  species,
                  label
                ]) => (

                  <div
                    key={species}
                    className="species-report-row"
                  >

                    <strong>
                      {label}
                    </strong>


                    {[
                      "sightings",
                      "bites",
                      "hookups",
                      "released",
                      "landed",
                      "lost"
                    ].map((field) => (
                      <input
                        key={field}
                        type="number"
                        min="0"
                        value={
                          report
                            .speciesResults[
                              species
                            ][field]
                        }
                        onChange={(event) =>
                          updateSpeciesResult(
                            species,
                            field,
                            event.target.value
                          )
                        }
                        aria-label={`${label} ${field}`}
                      />
                    ))}

                  </div>
                )
              )}

            </div>

          </ReportSection>


          <ReportSection
            title="Summary"
          >

            <div className="report-form-grid">

              <ReportSelect
                label="Trip Outcome"
                value={report.tripOutcome}
                options={[
                  "Excellent",
                  "Good",
                  "Average",
                  "Slow",
                  "Poor"
                ]}
                onChange={(value) =>
                  updateField(
                    "tripOutcome",
                    value
                  )
                }
              />

              <ReportSelect
                label="Information Source"
                value={
                  report.informationSource
                }
                options={[
                  {
                    value: "firsthand",
                    label:
                      "Firsthand Observation"
                  },
                  {
                    value: "radio",
                    label: "Radio Report"
                  },
                  {
                    value: "dock-talk",
                    label: "Dock Talk"
                  }
                ]}
                onChange={(value) =>
                  updateField(
                    "informationSource",
                    value
                  )
                }
              />

            </div>


            <label className="report-field">

              <span>
                Captain Notes
              </span>

              <textarea
                rows="6"
                value={report.notes}
                placeholder="Describe where activity occurred, current changes, bait concentrations or anything else that affected the day."
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value
                  )
                }
              />

            </label>

<div className="report-privacy-box">

  <strong>
    Private Captain Data
  </strong>

  <p>
    This full fishing log is private.
    Captain identity, boat identity and private
    notes are never shared.
  </p>

  <label>

    <input
      type="checkbox"
      checked={
        report.shareIntelligence
      }
      onChange={(event) =>
        updateField(
          "shareIntelligence",
          event.target.checked
        )
      }
    />

    <span>
      Contribute anonymous fishing intelligence
      to improve Velion.
    </span>

  </label>

  <small>
    Captain identity is never shared.
  </small>

</div>

          </ReportSection>


          <footer className="report-panel-footer">

            <button
              type="button"
              className="report-secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="report-submit-button"
            >
              Save Fishing Day
            </button>

          </footer>

        </form>

      </aside>

    </div>
  );
}


function ReportSection({
  title,
  children
}) {
  return (
    <section className="report-section">

      <h3>{title}</h3>

      {children}

    </section>
  );
}


function ReportInput({
  label,
  onChange,
  ...inputProps
}) {
  return (
    <label className="report-field">

      <span>{label}</span>

      <input
        {...inputProps}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />

    </label>
  );
} 


function ReportSelect({
  label,
  value,
  options,
  onChange
}) {
  return (
    <label className="report-field">

      <span>{label}</span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >

        <option value="">
          Select
        </option>

        {options.map((option) => {
          const normalized =
            typeof option === "string"
              ? {
                  value: option,
                  label: option
                }
              : option;

          return (
            <option
              key={normalized.value}
              value={normalized.value}
            >
              {normalized.label}
            </option>
          );
        })}

      </select>

    </label>
  );
}


function CheckboxGroup({
  label,
  values,
  selected,
  onToggle
}) {
  return (
    <div className="report-checkbox-group">

      <h4>{label}</h4>

      <div className="report-checkbox-options">

        {values.map((value) => (
          <label key={value}>

            <input
              type="checkbox"
              checked={
                selected.includes(value)
              }
              onChange={() =>
                onToggle(value)
              }
            />

            <span>{value}</span>

          </label>
        ))}

      </div>

    </div>
  );
}


export default FishingDayReportPanel;