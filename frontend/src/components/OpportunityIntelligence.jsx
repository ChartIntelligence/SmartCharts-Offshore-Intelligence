import { EVALUATION_MESSAGES } from "../utils/opportunityEvaluationState.js";
const INTELLIGENCE_SECTIONS = [
  {
    key: "thermalStructure",
    title: "Thermal Structure"
  },
  {
    key: "oceanMovement",
    title: "Ocean Movement"
  },
  {
    key: "waterColorAndWaterCharacter",
    title: "Water Color & Water Character"
  },
  {
    key: "productivityAndPreyContext",
    title: "Productivity & Prey Context"
  },
  {
    key: "structureInteraction",
    title: "Structure Context"
  },
  {
    key: "persistence",
    title: "Persistence"
  },
  {
    key: "speciesHabitatFit",
    title: "Species Habitat Fit"
  },
  {
    key: "evidenceAndConfidence",
    title: "Evidence & Confidence"
  }
];

function validateNarrativeDisplay(narrative) {
  const record = value => typeof value === "object" && value !== null && !Array.isArray(value);
  if (!record(narrative) || !record(narrative.sections)) {
    throw new TypeError("Invalid Intelligence narrative display structure");
  }
  for (const { key } of INTELLIGENCE_SECTIONS) {
    const section = narrative.sections[key];
    if (section == null) continue;
    if (!record(section)) throw new TypeError("Invalid Intelligence section display structure");
    // The v1 section translators emit string or null. Missing fields stay absent.
    for (const field of ["observed", "interpreted", "supported", "limited"]) {
      if (section[field] != null && typeof section[field] !== "string") {
        throw new TypeError("Invalid Intelligence statement display type");
      }
    }
  }
}


function formatState(state) {
  switch (state) {
    case "available":
      return "Available";

    case "unavailable":
      return "Unavailable";

    case "unresolved":
      return "Unresolved";

    case "not-established":
      return "Not Established";

    case "not-supported":
      return "Not Supported";

    default:
      return "Unknown";
  }
}


function NarrativeStatement({
  label,
  value
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="opportunity-intelligence-statement">
      <strong>
        {label}
      </strong>

      <p>
        {value}
      </p>
    </div>
  );
}


function OpportunityIntelligence({
  opportunity = null,
  opportunityState = "loading"
}) {
  const narrative =
    opportunity?.captainNarrative ??
    null;


  if (!["available", "partial"].includes(opportunityState)) {
    return (
      <section className="opportunity-intelligence">
        <p className="section-eyebrow">Governed Analysis</p>
        <h2>Opportunity Intelligence</h2>
        <p>{EVALUATION_MESSAGES[opportunityState] ?? EVALUATION_MESSAGES.unavailable}</p>
      </section>
    );
  }

  if (!opportunity) {
    return (
      <section className="opportunity-intelligence">
        <h2>
          Opportunity Intelligence
        </h2>

        <p>
          {opportunityState === "partial" ? EVALUATION_MESSAGES.partial :
            "Select a governed opportunity to read its supporting ocean evidence."}
        </p>
      </section>
    );
  }


  if (
    narrative == null ||
    narrative?.available !== true ||
    narrative?.sections == null
  ) {
    return (
      <section className="opportunity-intelligence">
        <p className="section-eyebrow">
          Governed Analysis
        </p>

        <h2>
          {opportunity?.name ??
            "Opportunity Intelligence"}
        </h2>

        <p>
          Detailed captain-facing intelligence
          is not currently available for this
          opportunity.
        </p>

        {narrative?.state && (
          <p>
            <strong>
              Intelligence State:
            </strong>{" "}
            {formatState(
              narrative.state
            )}
          </p>
        )}
      </section>
    );
  }


  validateNarrativeDisplay(narrative);

  return (
    <section className="opportunity-intelligence">

      <div className="opportunity-intelligence-header">

        <p className="section-eyebrow">
          Governed Analysis
        </p>

        <h2>
          {opportunity?.name ??
            "Opportunity Intelligence"}
        </h2>

        <p>
          Pelora&apos;s current interpretation
          of the ocean evidence supporting this
          opportunity.
        </p>

      </div>


      <div className="opportunity-intelligence-grid">

        {INTELLIGENCE_SECTIONS.map(
          ({ key, title }) => {
            const section =
              narrative
                ?.sections
                ?.[key] ??
              null;

            if (!section) {
              return (
                <article
                  className="opportunity-intelligence-card"
                  key={key}
                >
                  <h3>
                    {title}
                  </h3>

                  <p>
                    Intelligence for this section
                    is not currently available.
                  </p>
                </article>
              );
            }


            return (
              <article
                className="opportunity-intelligence-card"
                key={key}
              >

                <div className="opportunity-intelligence-card-header">

                  <h3>
                    {title}
                  </h3>

                  <span className="opportunity-intelligence-state">
                    {formatState(
                      section?.state
                    )}
                  </span>

                </div>


                <NarrativeStatement
                  label="Observed"
                  value={
                    section?.observed
                  }
                />


                <NarrativeStatement
                  label="Interpretation"
                  value={
                    section?.interpreted
                  }
                />


                <NarrativeStatement
                  label="What This Supports"
                  value={
                    section?.supported
                  }
                />


                <NarrativeStatement
                  label="Limitation"
                  value={
                    section?.limited
                  }
                />


                {!section?.observed &&
                  !section?.interpreted &&
                  !section?.supported &&
                  !section?.limited && (
                    <p>
                      This part of the ocean
                      picture is not sufficiently
                      resolved for a detailed
                      interpretation.
                    </p>
                  )}

              </article>
            );
          }
        )}

      </div>

    </section>
  );
}


export default OpportunityIntelligence;
