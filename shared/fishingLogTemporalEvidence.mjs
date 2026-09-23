import {Temporal} from "@js-temporal/polyfill";

export const FISHING_LOG_TEMPORAL_CONTRACT = "pelora-fishing-log-temporal-evidence-v1";

const text = value => typeof value === "string" ? value : null;
const record = value => value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
const qualities = new Set(["precise", "bounded", "approximate"]);

// This projection deliberately excludes report identity and all unrelated data.
function localInput(value) {
  const input = record(value);
  return {date: text(input.date), time: text(input.time)};
}

function parseLocal(input, endpoint, reasons) {
  if (!input.date || !input.time) {
    reasons.push({endpoint, code: "local-date-or-time-missing", kind: "missing"});
    return null;
  }
  // Reject annotations, embedded offsets, calendar overrides and leap-second
  // normalization. Inputs are ISO local dates and clock times, not instant strings.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) ||
      !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,9})?)?$/.test(input.time)) {
    reasons.push({endpoint, code: "local-date-or-time-invalid", kind: "clarification"});
    return null;
  }
  try {
    return Temporal.PlainDateTime.from(`${input.date}T${input.time}`, {overflow: "reject"});
  } catch {
    reasons.push({endpoint, code: "local-date-or-time-invalid", kind: "clarification"});
    return null;
  }
}

function resolveBasis(basis, reasons) {
  if (basis.confirmation !== "captain-confirmed") {
    reasons.push({endpoint: null, code: basis.confirmation === "suggested"
      ? "time-basis-unconfirmed" : "confirmed-time-basis-missing",
    kind: basis.confirmation === "suggested" ? "clarification" : "missing"});
    return null;
  }
  if ((basis.type === "iana" && basis.offset !== null) ||
      (basis.type === "fixed-offset" && basis.timeZone !== null)) {
    reasons.push({endpoint: null, code: "time-basis-conflicting-fields", kind: "clarification"});
    return null;
  }
  if (basis.type === "fixed-offset") {
    // Explicit ISO offset, not a numeric timezone guess or a zone abbreviation.
    if (!/^[+-](?:[01]\d|2[0-3]):[0-5]\d$/.test(basis.offset ?? "") || basis.offset === "-00:00") {
      reasons.push({endpoint: null, code: "fixed-offset-invalid", kind: "clarification"});
      return null;
    }
    return basis.offset;
  }
  if (basis.type === "iana" && basis.timeZone &&
      /^[A-Za-z][A-Za-z0-9._+-]*(?:\/[A-Za-z0-9._+-]+)*$/.test(basis.timeZone)) {
    try {
      // Accept identifier syntax only: Temporal also accepts annotated datetime
      // strings, which are not this contract's named-zone input. Temporal remains
      // authoritative for whether the identifier actually exists.
      Temporal.Instant.from("2000-01-01T00:00:00Z").toZonedDateTimeISO(basis.timeZone);
      return basis.timeZone;
    } catch { /* Invalid named zone remains unresolved. */ }
  }
  reasons.push({endpoint: null, code: "time-basis-invalid", kind: "clarification"});
  return null;
}

function resolveEndpoint(local, zone, endpoint, reasons) {
  if (!local || !zone) return null;
  try {
    const resolved = local.toZonedDateTime(zone, {disambiguation: "reject"});
    return {instant: resolved.toInstant().toString(), offset: resolved.offset};
  } catch {
    // Earlier/later are used ONLY to diagnose Temporal's rejection. Neither
    // diagnostic result can enter the returned resolved evidence.
    let code = "local-time-unresolvable";
    try {
      const earlier = local.toZonedDateTime(zone, {disambiguation: "earlier"});
      const later = local.toZonedDateTime(zone, {disambiguation: "later"});
      code = earlier.toPlainDateTime().equals(local) && later.toPlainDateTime().equals(local)
        ? "local-time-ambiguous" : "local-time-nonexistent";
    } catch { /* Keep the generic unresolved reason. */ }
    reasons.push({endpoint, code, kind: "clarification"});
    return null;
  }
}

/** Pure temporal evidence only; does not validate or mutate a Fishing Log. */
export function buildFishingLogTemporalEvidenceV1(value = {}) {
  const input = record(value);
  const legacy = !Object.hasOwn(input, "start") && !Object.hasOwn(input, "end") &&
    ["trip_date", "lines_in", "lines_out"].some(key => Object.hasOwn(input, key));
  const start = localInput(legacy ? {date: input.trip_date, time: input.lines_in} : input.start);
  const end = localInput(legacy ? {date: null, time: input.lines_out} : input.end);
  const sourceBasis = record(input.timeBasis);
  const timeBasis = {
    type: text(sourceBasis.type), confirmation: text(sourceBasis.confirmation),
    timeZone: text(sourceBasis.timeZone), offset: text(sourceBasis.offset)
  };
  const declaredQuality = input.quality === undefined ? "bounded" : text(input.quality);
  const reasons = [];
  const localStart = parseLocal(start, "start", reasons);
  const localEnd = parseLocal(end, "end", reasons);
  const zone = resolveBasis(timeBasis, reasons);
  if (!qualities.has(declaredQuality)) {
    reasons.push({endpoint: null, code: "quality-invalid", kind: "clarification"});
  }
  if (declaredQuality === "approximate") {
    reasons.push({endpoint: null, code: "approximate-time-needs-explicit-bounds", kind: "clarification"});
  }
  const canResolve = qualities.has(declaredQuality) && declaredQuality !== "approximate";
  const resolvedStart = canResolve ? resolveEndpoint(localStart, zone, "start", reasons) : null;
  const resolvedEnd = canResolve ? resolveEndpoint(localEnd, zone, "end", reasons) : null;
  if (resolvedStart && resolvedEnd) {
    const order = Temporal.Instant.compare(resolvedEnd.instant, resolvedStart.instant);
    if (order <= 0) reasons.push({endpoint: null,
      code: order === 0 ? "interval-empty" : "interval-reversed", kind: "clarification"});
  }
  const readiness = reasons.some(reason => reason.kind === "missing") ? "insufficient"
    : reasons.length ? "needs-clarification" : "ready";
  const versions = globalThis.process?.versions;
  return {
    contractVersion: FISHING_LOG_TEMPORAL_CONTRACT,
    original: {start, end, timeBasis, declaredQuality,
      legacy: legacy ? {trip_date: text(input.trip_date), lines_in: text(input.lines_in),
        lines_out: text(input.lines_out)} : null},
    // Independently resolved endpoints are diagnostics; only a ready interval
    // may be used for future assessment. A valid endpoint cannot repair the other.
    resolved: {start: resolvedStart, end: resolvedEnd},
    interval: readiness === "ready" ? {startInstant: resolvedStart.instant, endInstant: resolvedEnd.instant} : null,
    quality: declaredQuality === "approximate" ? "approximate"
      : readiness === "ready" ? declaredQuality : "insufficient",
    readiness,
    reasons,
    derivation: {
      contractVersion: FISHING_LOG_TEMPORAL_CONTRACT,
      implementation: "@js-temporal/polyfill", implementationVersion: "0.5.1",
      timeBasisType: timeBasis.type,
      confirmedTimeBasis: zone === null ? null : {type: timeBasis.type, value: zone},
      disambiguation: "reject",
      timezoneDataSource: timeBasis.type === "iana" ? "runtime-intl" : null,
      runtime: versions?.node ? `node-${versions.node}` : null,
      icuVersion: text(versions?.icu), timezoneDataVersion: text(versions?.tz)
    }
  };
}
