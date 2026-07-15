import {
  useCallback,
  useEffect,
  useState
} from "react";

import { supabase } from "../lib/supabase";


function SavedFishingDayReports({
  refreshToken = 0,
  user,
  authLoading = false
}) {

  const [reports, setReports] =
    useState([]);

  const [expandedReportId, setExpandedReportId] =
    useState(null);


  const loadReports = useCallback(
  async () => {
    if (!user?.id) {
      setReports([]);
      return;
    }

    const {
      data,
      error
    } =
      await supabase
        .from(
          "fishing_day_reports"
        )
        .select("*")
        .order(
          "trip_date",
          {
            ascending: false
          }
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );

    if (error) {
      console.error(
        "Unable to load fishing reports:",
        error
      );

      return;
    }

    const normalizedReports =
      (data || []).map(
        normalizeSupabaseReport
      );

    setReports(
      normalizedReports
    );
  },
  [user?.id]
);


  useEffect(() => {
    loadReports();
  }, [
    loadReports,
    refreshToken
  ]);


 const deleteReport = async (
  reportId
) => {
  const confirmed =
    window.confirm(
      "Delete this fishing day report? This cannot be undone."
    );

  if (!confirmed) {
    return;
  }

  const {
    error
  } =
    await supabase
      .from(
        "fishing_day_reports"
      )
      .delete()
      .eq(
        "id",
        reportId
      );

  if (error) {
    console.error(
      "Unable to delete fishing report:",
      error
    );

    window.alert(
      `Report could not be deleted: ${error.message}`
    );

    return;
  }

  setReports(
    (currentReports) =>
      currentReports.filter(
        (report) =>
          report.id !== reportId
      )
  );

  if (
    expandedReportId === reportId
  ) {
    setExpandedReportId(null);
  }
};


  if (reports.length === 0) {
    return (
      <section className="saved-reports-section">

        <div className="saved-reports-header">

          <div>
            <p className="saved-reports-eyebrow">
              Captain Data
            </p>

            <h2>
              Saved Fishing Days
            </h2>
          </div>

        </div>


        <div className="empty-saved-reports">

          <h3>
            No reports saved yet
          </h3>

          <p>
            Submitted fishing-day reports will
            appear here for review.
          </p>

        </div>

      </section>
    );
  }


  return (
    <section className="saved-reports-section">

      <div className="saved-reports-header">

        <div>
          <p className="saved-reports-eyebrow">
            Captain Data
          </p>

          <h2>
            Saved Fishing Days
          </h2>

          <p>
            {reports.length} report
            {reports.length === 1
              ? ""
              : "s"} saved on this device.
          </p>
        </div>


        <button
          type="button"
          className="refresh-reports-button"
          onClick={loadReports}
        >
          Refresh
        </button>

      </div>


      <div className="saved-reports-list">

        {reports.map((report) => {

          const reportId =
            report.id ||
            `${report.date}-${report.boat}`;

          const expanded =
            expandedReportId ===
            reportId;

          const blueMarlin =
            report.speciesResults
              ?.blueMarlin || {};

          return (
            <article
              key={reportId}
              className="saved-report-card"
            >

              <div className="saved-report-summary">

                <div>

                  <p className="saved-report-date">
                    {formatDate(
                      report.date
                    )}
                  </p>

                  <h3>
                    {report.boat ||
                      "Unnamed Boat"}
                  </h3>

                  <p>
                    Captain:{" "}
                    <strong>
                      {report.captain ||
                        "Not entered"}
                    </strong>
                  </p>

                </div>


                <div className="saved-report-outcome">

                  <span>
                    Trip Outcome
                  </span>

                  <strong>
                    {report.tripOutcome ||
                      "Not rated"}
                  </strong>

                </div>

              </div>


              <div className="saved-report-highlights">

                <ReportMetric
                  label="Hours Fished"
                  value={
                    report.hoursFished ||
                    "—"
                  }
                />

                <ReportMetric
                  label="Areas"
                  value={
                    report.areasFished
                      ?.length || 0
                  }
                />

                <ReportMetric
                  label="Marlin Bites"
                  value={
                    blueMarlin.bites || 0
                  }
                />

                <ReportMetric
                  label="Marlin Releases"
                  value={
                    blueMarlin.released || 0
                  }
                />

              </div>


              <div className="saved-report-actions">

                <button
                  type="button"
                  className="view-report-button"
                  onClick={() =>
                    setExpandedReportId(
                      expanded
                        ? null
                        : reportId
                    )
                  }
                >
                  {expanded
                    ? "Hide Details"
                    : "View Details"}
                </button>


                <button
                  type="button"
                  className="delete-report-button"
                  onClick={() =>
                    deleteReport(reportId)
                  }
                >
                  Delete
                </button>

              </div>


              {expanded && (
                <ReportDetails
                  report={report}
                />
              )}

            </article>
          );
        })}

      </div>

    </section>
  );
}


function ReportDetails({
  report
}) {

  return (
    <div className="saved-report-details">

      <DetailSection title="Fishing Effort">

        <DetailRow
          label="Lines In"
          value={
            report.linesIn || "—"
          }
        />

        <DetailRow
          label="Lines Out"
          value={
            report.linesOut || "—"
          }
        />

        <DetailRow
          label="Hours Fished"
          value={
            report.hoursFished || "—"
          }
        />

        <DetailRow
          label="Miles Run"
          value={
            report.milesRun || "—"
          }
        />

      </DetailSection>


      <DetailSection title="Areas Fished">

        {report.areasFished?.length ? (
          <ol className="saved-report-area-list">

            {report.areasFished.map(
              (area) => (
                <li
                  key={
                    area.id ||
                    area.name
                  }
                >
                  {area.name}
                </li>
              )
            )}

          </ol>
        ) : (
          <p>No areas selected.</p>
        )}

      </DetailSection>


      <DetailSection title="Observed Activity">

        <DetailRow
          label="Bait"
          value={
            joinValues(
              report.baitObserved
            )
          }
        />

        <DetailRow
          label="Birds"
          value={
            joinValues(
              report.birdActivity
            )
          }
        />

        <DetailRow
          label="Water Color"
          value={
            report.waterColor ||
            "—"
          }
        />

        <DetailRow
          label="Weed"
          value={
            report.weedCondition ||
            "—"
          }
        />

        <DetailRow
          label="Floating Structure"
          value={
            joinValues(
              report.floatingStructure
            )
          }
        />

      </DetailSection>


      <DetailSection title="Species Results">

        <div className="saved-species-results">

          {Object.entries(
            report.speciesResults || {}
          ).map(([
            species,
            results
          ]) => {

            const hasActivity =
              Object.values(
                results || {}
              ).some(
                (value) =>
                  Number(value) > 0
              );

            if (!hasActivity) {
              return null;
            }

            return (
              <div
                key={species}
                className="saved-species-card"
              >

                <strong>
                  {formatSpeciesName(
                    species
                  )}
                </strong>

                <span>
                  Seen:{" "}
                  {results.sightings || 0}
                </span>

                <span>
                  Bites:{" "}
                  {results.bites || 0}
                </span>

                <span>
                  Hookups:{" "}
                  {results.hookups || 0}
                </span>

                <span>
                  Released:{" "}
                  {results.released || 0}
                </span>

                <span>
                  Landed:{" "}
                  {results.landed || 0}
                </span>

                <span>
                  Lost:{" "}
                  {results.lost || 0}
                </span>

              </div>
            );
          })}

        </div>

      </DetailSection>


      <DetailSection title="Report Information">

        <DetailRow
          label="Tournament"
          value={
            report.tournament ||
            "—"
          }
        />

        <DetailRow
          label="Source"
          value={
            formatSource(
              report.informationSource
            )
          }
        />

        <DetailRow
          label="Saved"
          value={
            formatDateTime(
              report.createdAt
            )
          }
        />

      </DetailSection>


      {report.notes && (
        <DetailSection title="Captain Notes">

          <p className="saved-report-notes">
            {report.notes}
          </p>

        </DetailSection>
      )}

    </div>
  );
}


function ReportMetric({
  label,
  value
}) {
  return (
    <div className="saved-report-metric">

      <span>{label}</span>

      <strong>{value}</strong>

    </div>
  );
}


function DetailSection({
  title,
  children
}) {
  return (
    <section className="saved-detail-section">

      <h4>{title}</h4>

      {children}

    </section>
  );
}


function DetailRow({
  label,
  value
}) {
  return (
    <div className="saved-detail-row">

      <span>{label}</span>

      <strong>{value}</strong>

    </div>
  );
}


function joinValues(values) {
  return Array.isArray(values) &&
    values.length
    ? values.join(", ")
    : "—";
}


function formatDate(value) {
  if (!value) {
    return "Date not entered";
  }

  const date =
    new Date(`${value}T12:00:00`);

  return date.toLocaleDateString(
    undefined,
    {
      month: "long",
      day: "numeric",
      year: "numeric"
    }
  );
}


function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleString();
}


function formatSource(value) {
  const labels = {
    firsthand:
      "Firsthand Observation",

    radio:
      "Radio Report",

    "dock-talk":
      "Dock Talk"
  };

  return labels[value] ||
    value ||
    "—";
}


function formatSpeciesName(value) {
  return String(value)
    .replace(
      /([a-z])([A-Z])/g,
      "$1 $2"
    )
    .replace(
      /^./,
      (character) =>
        character.toUpperCase()
    );
}


function normalizeSupabaseReport(
  row
) {
  return {
    id:
      row.id,

    date:
      row.trip_date,

    captain:
      row.captain_private,

    boat:
      row.boat_private,

    tournament:
      row.tournament_private,

    linesIn:
      row.lines_in,

    linesOut:
      row.lines_out,

    hoursFished:
      row.hours_fished,

    milesRun:
      row.miles_run,

    areasFished:
      row.areas_fished || [],

    baitObserved:
      row.bait_observed || [],

    birdActivity:
      row.bird_activity || [],

    waterColor:
      row.water_color,

    weedCondition:
      row.weed_condition,

    floatingStructure:
      row.floating_structure || [],

    speciesResults:
      row.species_results || {},

    tripOutcome:
      row.trip_outcome,

    informationSource:
      row.information_source,

    notes:
      row.notes_private,

    shareIntelligence:
      row.share_intelligence === true,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at
  };
}

export default SavedFishingDayReports;