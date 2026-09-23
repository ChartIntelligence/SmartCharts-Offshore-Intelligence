import {buildFishingLogTemporalEvidenceV1} from "./fishingLogTemporalEvidence.mjs";
import {buildFishingLocationSpatialEvidenceV1} from "./fishingLocationSpatialEvidence.mjs";

export const FISHING_LOG_EVIDENCE_CAPTURE_CONTRACT = "pelora-fishing-log-evidence-capture-v1";

const record = value => value !== null && typeof value === "object" && !Array.isArray(value);
const own = (value, key) => Object.hasOwn(value, key);
const temporalFields = ["quality"];
const locationFields = ["locationEntryId", "latitude", "longitude", "label", "source", "certainty"];

// Scalars only. Unsupported representations retain their invalid type, never
// become numeric evidence, and cannot carry arbitrary private payloads.
function encode(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) && !Object.is(value, -0)
    ? value : {representation: "number", value: String(Object.is(value, -0) ? "-0" : value)};
  return {representation: "invalid-type", value: Array.isArray(value) ? "array" : typeof value};
}

function decode(value) {
  if (!record(value)) return value;
  if (value.representation === "number") {
    return ({NaN: NaN, Infinity: Infinity, "-Infinity": -Infinity, "-0": -0})[value.value];
  }
  return value.value === "array" ? [] : value.value === "undefined" ? undefined : {};
}

function fields(input, names, transform) {
  return Object.fromEntries(names.filter(key => own(input, key)).map(key => [key, transform(input[key])]));
}

function temporalInput(value, transform) {
  const input = record(value) ? value : {};
  const output = fields(input, temporalFields, transform);
  for (const key of ["start", "end", "timeBasis"]) {
    if (own(input, key)) output[key] = fields(record(input[key]) ? input[key] : {},
      key === "timeBasis" ? ["type", "confirmation", "timeZone", "offset"] : ["date", "time"], transform);
  }
  return output;
}

function locationInput(value, transform) {
  const input = record(value) ? value : {};
  const output = fields(input, locationFields, transform);
  if (own(input, "accuracy")) {
    output.accuracy = record(input.accuracy) && !(transform === decode && own(input.accuracy, "representation"))
      ? fields(input.accuracy, ["value", "unit", "source", "kind"], transform)
      : transform(input.accuracy);
  }
  return output;
}

/** Source evidence only. No report validation, identity generation or storage. */
export function buildFishingLogEvidenceCaptureV1(value = {}) {
  const input = record(value) ? value : {};
  return {
    contractVersion: FISHING_LOG_EVIDENCE_CAPTURE_CONTRACT,
    temporal: {captainInput: temporalInput(input.temporal, encode)},
    locations: (Array.isArray(input.locations) ? input.locations : []).map(location => ({
      contractVersion: FISHING_LOG_EVIDENCE_CAPTURE_CONTRACT,
      ...locationInput(location, encode)
    }))
  };
}

function scalarValid(value) {
  if (value === null || ["string", "boolean"].includes(typeof value)) return true;
  if (typeof value === "number") return Number.isFinite(value) && !Object.is(value, -0);
  if (!record(value) || Object.keys(value).length !== 2) return false;
  return value.representation === "number" ? ["NaN", "Infinity", "-Infinity", "-0"].includes(value.value)
    : value.representation === "invalid-type" && ["undefined", "object", "array", "bigint", "symbol", "function"].includes(value.value);
}

function shape(value, allowed) {
  return record(value) && Object.keys(value).every(key => allowed.includes(key) && scalarValid(value[key]));
}

function captureState(value) {
  if (!record(value)) return "malformed";
  if (value.contractVersion !== FISHING_LOG_EVIDENCE_CAPTURE_CONTRACT) return "unsupported";
  if (!record(value.temporal) || !record(value.temporal.captainInput) || !Array.isArray(value.locations) ||
      Object.keys(value).some(key => !["contractVersion", "temporal", "locations"].includes(key)) ||
      Object.keys(value.temporal).some(key => key !== "captainInput")) return "malformed";
  const t = value.temporal.captainInput;
  if (Object.keys(t).some(key => !["start", "end", "timeBasis", "quality"].includes(key)) ||
      own(t, "quality") && !scalarValid(t.quality)) return "malformed";
  for (const key of ["start", "end", "timeBasis"]) {
    if (own(t, key) && !shape(t[key], key === "timeBasis"
      ? ["type", "confirmation", "timeZone", "offset"] : ["date", "time"])) return "malformed";
  }
  for (const l of value.locations) {
    if (!record(l)) return "malformed";
    if (l.contractVersion !== FISHING_LOG_EVIDENCE_CAPTURE_CONTRACT) return "unsupported";
    if (Object.keys(l).some(key => ![...locationFields, "accuracy", "contractVersion"].includes(key)) ||
        locationFields.some(key => own(l, key) && !scalarValid(l[key])) ||
        own(l, "accuracy") && !(scalarValid(l.accuracy) || shape(l.accuracy, ["value", "unit", "source", "kind"]))) return "malformed";
  }
  return "supported";
}

const copy = value => JSON.parse(JSON.stringify(value));

/** Compatibility values only, not a database payload or historical reconstruction. */
export function projectFishingLogLegacyFieldsV1(capture) {
  if (captureState(capture) !== "supported") return null;
  const t = capture.temporal.captainInput;
  const text = value => typeof value === "string" ? value : null;
  return {trip_date: text(t.start?.date), lines_in: text(t.start?.time), lines_out: text(t.end?.time)};
}

/** captureEvidence is an adapter argument, NOT a chosen PostgreSQL column name. */
export function normalizeFishingLogEvidenceV1(value = {}) {
  const input = record(value) ? value : {};
  const present = own(input, "captureEvidence") && input.captureEvidence != null;
  const state = present ? captureState(input.captureEvidence) : "legacy";
  if (state === "supported") return {state, capture: copy(input.captureEvidence), legacyFacts: null};
  return {state, capture: null, legacyFacts: {
    ...fields(input, ["trip_date", "lines_in", "lines_out"], encode),
    fishing_locations: (Array.isArray(input.fishing_locations) ? input.fishing_locations : [])
      .map(location => fields(record(location) ? location : {}, ["latitude", "longitude"], encode))
  }};
}

/** Explicit, nonpersisted interpretation under locked upstream versions only.
 * Outputs can be passed to Task 7D by a future caller; they are not write authority.
 */
export function interpretFishingLogEvidenceCaptureV1(capture) {
  const state = captureState(capture);
  if (state !== "supported") return {state, temporalEvidence: null, spatialEvidence: []};
  return {state, temporalEvidence: buildFishingLogTemporalEvidenceV1(temporalInput(capture.temporal.captainInput, decode)),
    spatialEvidence: capture.locations.map(location => buildFishingLocationSpatialEvidenceV1(locationInput(location, decode)))};
}
