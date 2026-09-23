export const FISHING_LOG_ASSOCIATION_READINESS_CONTRACT = "pelora-fishing-log-association-readiness-v1";

// Supported wire versions; importing evaluators would unnecessarily pull their
// implementations into a composer that must never reevaluate raw evidence.
const versions = {
  temporal: "pelora-fishing-log-temporal-evidence-v1",
  spatial: "pelora-fishing-location-spatial-evidence-v1"
};
const states = new Set(["ready", "needs-clarification", "insufficient"]);
const qualities = {
  temporal: new Set(["precise", "bounded", "approximate", "insufficient"]),
  spatial: new Set(["precise", "bounded", "approximate", "unknown", "insufficient"])
};
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const identifier = value => typeof value === "string" && value.trim() !== "" ? value : null;
const resolvedEndpoint = value => value === null || object(value) &&
  identifier(value.instant) !== null && identifier(value.offset) !== null;
const axis = value => object(value) && ["valid", "missing", "invalid-number", "out-of-range"].includes(value.state) &&
  (value.state === "valid" ? typeof value.value === "number" && Number.isFinite(value.value) : value.value === null);

function inspect(value, domain, reasons) {
  const fail = code => {
    reasons.push({domain, code: `${domain}-${code}`});
    return {contractVersion: null, readiness: "insufficient", quality: null, accepted: false};
  };
  if (value == null) return fail("contract-missing");
  if (!object(value)) return fail("contract-malformed");
  if (value.contractVersion !== versions[domain]) return fail("contract-version-unsupported");
  if (!states.has(value.readiness) || !qualities[domain].has(value.quality) ||
      !object(value.original) || !Array.isArray(value.reasons) ||
      !value.reasons.every(reason => object(reason) && identifier(reason.code))) return fail("contract-malformed");
  // Structural validation of evaluated outputs only. No time parsing, geographic
  // validation, quality classification or scientific sufficiency calculation.
  if (domain === "temporal") {
    if (!object(value.resolved) || !resolvedEndpoint(value.resolved.start) || !resolvedEndpoint(value.resolved.end) || !object(value.derivation) ||
        value.derivation.contractVersion !== versions.temporal ||
        (value.readiness === "ready" ? !object(value.interval) ||
          !identifier(value.interval.startInstant) || !identifier(value.interval.endInstant) ||
          value.interval.startInstant !== value.resolved.start?.instant ||
          value.interval.endInstant !== value.resolved.end?.instant
          : value.interval !== null)) return fail("contract-malformed");
  } else {
    if (!object(value.coordinates) || !axis(value.coordinates.latitude) || !axis(value.coordinates.longitude) ||
        !["valid", "insufficient"].includes(value.coordinates.validity) ||
        (value.coordinates.validity === "valid") !==
          (value.coordinates.latitude.state === "valid" && value.coordinates.longitude.state === "valid") ||
        !object(value.provenance) || value.provenance.contractVersion !== versions.spatial ||
        !["absent", "supplied"].includes(value.identityState) ||
        (value.identityState === "supplied" ? identifier(value.locationEntryId) === null : value.locationEntryId !== null) ||
        (value.readiness === "ready" && value.coordinates.validity !== "valid")) return fail("contract-malformed");
  }
  if (value.readiness !== "ready") reasons.push({domain, code: `${domain}-evidence-${value.readiness}`});
  return {contractVersion: versions[domain], readiness: value.readiness, quality: value.quality, accepted: true};
}

/** One report/location pair; no orchestration, assessment or write is performed. */
export function buildFishingLogAssociationReadinessV1(value = {}) {
  const input = object(value) ? value : {};
  const assessmentReasons = [];
  const temporal = inspect(input.temporalEvidence, "temporal", assessmentReasons);
  const spatial = inspect(input.spatialEvidence, "spatial", assessmentReasons);
  const readiness = [temporal.readiness, spatial.readiness];
  const assessmentReadiness = readiness.includes("insufficient") ? "insufficient"
    : readiness.includes("needs-clarification") ? "needs-clarification" : "ready";
  const reportId = identifier(input.reportId);
  const locationEntryId = spatial.accepted ? identifier(input.spatialEvidence.locationEntryId) : null;
  const referenceReasons = [];
  if (reportId === null) referenceReasons.push({domain: "identity", code: "report-id-missing"});
  if (locationEntryId === null) referenceReasons.push({domain: "identity", code: "location-entry-id-missing"});
  return {
    contractVersion: FISHING_LOG_ASSOCIATION_READINESS_CONTRACT,
    assessmentReadiness,
    assessmentScope: assessmentReadiness === "ready" ? "report-interval-at-reported-location" : null,
    upstream: {temporal, spatial},
    assessmentReasons,
    references: {reportId, reportIdentity: reportId === null ? "absent" : "present",
      locationEntryId, locationEntryIdentity: locationEntryId === null ? "absent" : "present"},
    // Identifiers only: not revision integrity, ownership verification or write permission.
    persistenceReferenceReadiness: referenceReasons.length ? "needs-clarification" : "ready",
    persistenceReferenceReasons: referenceReasons,
    persistenceEnvironmentCompatibility: "not-evaluated",
    persistencePrerequisiteReasons: [{domain: "environment", code: "persistence-environment-not-evaluated"}],
    persistenceRequirements: ["requires-compatible-persistence-environment-before-association-write"]
  };
}
