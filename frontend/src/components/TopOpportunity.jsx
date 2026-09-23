import { EVALUATION_MESSAGES } from "../utils/opportunityEvaluationState.js";
function TopOpportunity({
  opportunities = [],
  opportunityState = "loading"
}) {
  const best =
    Array.isArray(opportunities)
      ? opportunities[0] ?? null
      : null;

  const dynamicOpportunity =
    best?.dynamicOpportunity ?? null;


  if (!["available", "partial"].includes(opportunityState) || !(best && dynamicOpportunity)) {
    return (
      <div className="top-opportunity">
        <h2>Today&apos;s Best Opportunity</h2>
        <p>{EVALUATION_MESSAGES[opportunityState] ?? EVALUATION_MESSAGES.unavailable}</p>
      </div>
    );
  }

  const confidence =
    dynamicOpportunity?.confidence ?? null;


  return (
    <div className="top-opportunity">

      <h2>
        Today&apos;s Best Opportunity
      </h2>

      <h1>
        {best.name}
      </h1>

      <p>
        <strong>
          Blue Marlin Score:
        </strong>{" "}
        {Number.isFinite(
          dynamicOpportunity?.score
        )
          ? dynamicOpportunity.score
          : "Unavailable"}
      </p>

      <p>
        <strong>
          Confidence:
        </strong>{" "}
        {confidence?.level ??
          "Unavailable"}
      </p>

      {Number.isFinite(
        confidence?.score
      ) && (
        <p>
          <strong>
            Confidence Score:
          </strong>{" "}
          {confidence.score}%
        </p>
      )}

      {dynamicOpportunity
        ?.primarySignal && (
        <p>
          <strong>
            Primary Signal:
          </strong>{" "}
          {dynamicOpportunity
            .primarySignal
            ?.label ??
            dynamicOpportunity
              .primarySignal
              ?.type ??
            "Unavailable"}
        </p>
      )}

    </div>
  );
}


export default TopOpportunity;
