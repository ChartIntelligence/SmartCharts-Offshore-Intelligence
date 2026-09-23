export const FISHING_LOCATION_SPATIAL_CONTRACT = "pelora-fishing-location-spatial-evidence-v1";

const record = value => value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
const sources = new Set(["manual", "map-selection", "device-capture"]);
const certainties = new Set(["exact-as-reported", "approximate", "unknown"]);
const nonblank = value => typeof value === "string" && value.trim() !== "";

// Preserve scalar representations without copying arbitrary objects/private data
// into the contract or losing non-finite input distinctions during JSON encoding.
function originalScalar(value) {
  if (value === undefined) return {type: "missing"};
  if (value === null) return {type: "null", value: null};
  if (typeof value === "number") return {type: "number",
    value: Number.isFinite(value) && !Object.is(value, -0) ? value : Object.is(value, -0) ? "-0" : String(value)};
  if (["string", "boolean"].includes(typeof value)) return {type: typeof value, value};
  return {type: Array.isArray(value) ? "array" : typeof value};
}

function coordinate(value, name, limit, reasons) {
  let state = "valid";
  if (value === null || value === undefined) state = "missing";
  else if (typeof value !== "number" || !Number.isFinite(value)) state = "invalid-number";
  else if (value < -limit || value > limit) state = "out-of-range";
  if (state !== "valid") reasons.push({field: name, code: state});
  return {state, value: state === "valid" ? (Object.is(value, -0) ? 0 : value) : null};
}

function accuracyEvidence(value, reasons) {
  if (value === null || value === undefined) return {state: "unknown", value: null, unit: null, source: null, kind: null};
  const input = record(value);
  // A reported horizontal radius is metadata, not a guaranteed containment area,
  // matching tolerance or independently verified measurement.
  const valid = typeof input.value === "number" && Number.isFinite(input.value) && input.value >= 0 &&
    input.unit === "m" && input.kind === "horizontal-accuracy-radius" && nonblank(input.source);
  if (!valid) reasons.push({field: "accuracy", code: "accuracy-invalid"});
  return {state: valid ? "valid" : "invalid", value: valid ? (input.value === 0 ? 0 : input.value) : null,
    unit: valid ? "m" : null, source: nonblank(input.source) ? input.source : null,
    kind: valid ? input.kind : null};
}

/** WHERE evidence only. Does not validate, persist or mutate a Fishing Log. */
export function buildFishingLocationSpatialEvidenceV1(value = {}) {
  const input = record(value);
  const reasons = [];
  const latitude = coordinate(input.latitude, "latitude", 90, reasons);
  const longitude = coordinate(input.longitude, "longitude", 180, reasons);
  const coordinateValidity = latitude.state === "valid" && longitude.state === "valid" ? "valid" : "insufficient";
  const source = sources.has(input.source) ? input.source : "unknown";
  const certainty = certainties.has(input.certainty) ? input.certainty : "unknown";
  if (input.source != null && input.source !== "unknown" && !sources.has(input.source)) {
    reasons.push({field: "source", code: "source-unrecognized"});
  }
  if (input.certainty != null && !certainties.has(input.certainty)) {
    reasons.push({field: "certainty", code: "certainty-unrecognized"});
  }
  const accuracy = accuracyEvidence(input.accuracy, reasons);
  const locationEntryId = nonblank(input.locationEntryId) ? input.locationEntryId : null;
  if (input.locationEntryId != null && locationEntryId === null) reasons.push({field: "locationEntryId", code: "identity-invalid"});
  const quality = coordinateValidity !== "valid" ? "insufficient"
    : certainty === "approximate" ? "approximate"
    : accuracy.state === "valid" ? "bounded"
    : certainty === "exact-as-reported" ? "precise" : "unknown";
  const characterized = certainty !== "unknown" || accuracy.state === "valid";
  const readiness = coordinateValidity !== "valid" ? "insufficient"
    : source !== "unknown" && characterized ? "ready" : "needs-clarification";
  if (coordinateValidity === "valid" && source === "unknown") reasons.push({field: "source", code: "source-unknown"});
  if (coordinateValidity === "valid" && !characterized) reasons.push({field: "certainty", code: "characterization-unknown"});
  const rawAccuracy = record(input.accuracy);
  return {
    contractVersion: FISHING_LOCATION_SPATIAL_CONTRACT,
    locationEntryId,
    identityState: locationEntryId === null ? "absent" : "supplied",
    original: {
      latitude: originalScalar(input.latitude), longitude: originalScalar(input.longitude),
      source: originalScalar(input.source), certainty: originalScalar(input.certainty),
      locationEntryId: originalScalar(input.locationEntryId),
      accuracy: input.accuracy == null ? originalScalar(input.accuracy) : {
        inputType: Array.isArray(input.accuracy) ? "array" : typeof input.accuracy,
        value: originalScalar(rawAccuracy.value), unit: originalScalar(rawAccuracy.unit),
        source: originalScalar(rawAccuracy.source), kind: originalScalar(rawAccuracy.kind)
      }
    },
    coordinates: {validity: coordinateValidity, latitude, longitude},
    source, certainty, accuracy,
    label: typeof input.label === "string" ? input.label : null,
    quality, readiness, reasons,
    provenance: {
      contractVersion: FISHING_LOCATION_SPATIAL_CONTRACT,
      coordinateNormalization: "finite-numbers-only-signed-degrees-v1",
      longitudeConvention: "[-180,+180]-no-wrap",
      captureRecordedAt: typeof record(input.provenance).captureRecordedAt === "string"
        ? input.provenance.captureRecordedAt : null,
      captureTimeInterpretation: "opaque-recording-metadata-not-visit-time"
    }
  };
}
