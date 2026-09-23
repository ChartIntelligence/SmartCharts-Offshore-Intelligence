import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import {buildFishingLogTemporalEvidenceV1 as build, FISHING_LOG_TEMPORAL_CONTRACT} from "../../shared/fishingLogTemporalEvidence.mjs";

const fixture = () => ({start: {date: "2024-01-15", time: "08:00"},
  end: {date: "2024-01-15", time: "16:00"},
  timeBasis: {type: "iana", confirmation: "captain-confirmed", timeZone: "America/Chicago"}});
const reason = (result, code) => assert.ok(result.reasons.some(item => item.code === code), code);

test("same-day historical named-zone interval preserves input and derives consistent offsets", () => {
  const input = fixture();
  const before = JSON.stringify(input);
  const result = build(input);
  assert.equal(result.contractVersion, "pelora-fishing-log-temporal-evidence-v1");
  assert.equal(result.readiness, "ready");
  assert.equal(result.quality, "bounded");
  assert.deepEqual(result.interval, {startInstant:"2024-01-15T14:00:00Z", endInstant:"2024-01-15T22:00:00Z"});
  assert.equal(result.resolved.start.offset, "-06:00");
  for (const endpoint of ["start", "end"]) {
    const local = input[endpoint];
    assert.equal(Date.parse(`${local.date}T${local.time}:00${result.resolved[endpoint].offset}`),
      Date.parse(result.resolved[endpoint].instant));
    assert.deepEqual(result.original[endpoint], local);
  }
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
  assert.deepEqual(build(input), result);
});

for (const [name, endDate, expectedEnd] of [
  ["overnight", "2024-01-16", "2024-01-16T10:00:00Z"],
  ["multi-day", "2024-01-19", "2024-01-19T10:00:00Z"]
]) test(`${name} needs explicit dates and has no maximum duration rule`, () => {
  const input = fixture(); input.start.time = "20:00";
  input.end = {date: endDate, time: "04:00"};
  assert.equal(build(input).interval.endInstant, expectedEnd);
});

test("missing and suggested zones never acquire a device timezone", () => {
  const input = fixture(); delete input.timeBasis;
  assert.equal(build(input).readiness, "insufficient");
  assert.equal(build(input).resolved.start, null);
  input.timeBasis = {...fixture().timeBasis, confirmation: "suggested"};
  assert.equal(build(input).readiness, "needs-clarification");
  reason(build(input), "time-basis-unconfirmed");
  assert.equal(build(input).derivation.confirmedTimeBasis, null);
});

test("invalid named zone, numeric zone disguised as IANA and conflicting bases fail closed", () => {
  for (const timeZone of ["Not/AZone", "+05:00", " America/Chicago ",
    "2024-01-01T00:00[America/Chicago]", "2024-01-01T00:00+05:00"]) {
    const input = fixture(); input.timeBasis.timeZone = timeZone;
    assert.equal(build(input).readiness, "needs-clarification");
    assert.equal(build(input).interval, null);
  }
  const input = fixture(); input.timeBasis.offset = "-06:00";
  reason(build(input), "time-basis-conflicting-fields");
});

test("fixed-offset accepted boundaries preserve explicit basis and absolute instants", () => {
  for (const [offset, instant] of [["+00:00","2024-01-15T08:00:00Z"],
    ["-05:00","2024-01-15T13:00:00Z"], ["+05:30","2024-01-15T02:30:00Z"],
    ["+14:00","2024-01-14T18:00:00Z"], ["-12:00","2024-01-15T20:00:00Z"]]) {
    const input = fixture();
    input.timeBasis = {type:"fixed-offset",confirmation:"captain-confirmed",offset};
    const result = build(input);
    assert.equal(result.readiness,"ready");
    assert.equal(result.resolved.start.instant,instant);
    assert.equal(result.resolved.start.offset,offset);
    assert.equal(result.original.timeBasis.offset,offset);
  }
});

test("ordinary malformed JSON types and empty legacy evidence return unresolved results", () => {
  for (const input of [null, false, 3, [], {}, {trip_date:null,lines_in:null,lines_out:null},
    {start:{date:3,time:[]},end:false,timeBasis:[]}]) {
    const result = build(input);
    assert.equal(result.readiness,"insufficient");
    assert.equal(result.interval,null);
    assert.deepEqual(JSON.parse(JSON.stringify(result)),result);
  }
});

test("fixed offset resolves even a clock time that would fall in a named-zone gap", () => {
  const input = fixture();
  input.start = {date:"2024-03-10",time:"02:30"};
  input.end = {date:"2024-03-10",time:"04:30"};
  input.timeBasis = {type:"fixed-offset",confirmation:"captain-confirmed",offset:"-06:00"};
  assert.equal(build(input).interval.startInstant, "2024-03-10T08:30:00Z");
  assert.equal(build(input).resolved.end.offset, "-06:00");
  assert.equal(build(input).derivation.timezoneDataSource, null);
  for (const offset of ["-00:00", "+24:00", "+01:60", "6", 6, "", null]) {
    input.timeBasis.offset = offset;
    assert.equal(build(input).interval, null);
    reason(build(input), "fixed-offset-invalid");
  }
});

for (const [date, time, code] of [
  ["2024-11-03", "01:30", "local-time-ambiguous"],
  ["2024-03-10", "02:30", "local-time-nonexistent"]
]) test(`${code} never returns the earlier/later or shifted instant`, () => {
  for (const endpoint of ["start", "end"]) {
    const input = fixture(); input[endpoint] = {date, time};
    const result = build(input);
    reason(result, code);
    assert.equal(result.resolved[endpoint], null);
    assert.equal(result.interval, null);
    assert.equal(result.readiness, "needs-clarification");
    assert.equal(result.quality, "insufficient");
  }
});

test("reversed and empty trip intervals are not ready; no rollover inferred", () => {
  for (const [time, code] of [["07:00", "interval-reversed"], ["08:00", "interval-empty"]]) {
    const input = fixture(); input.end.time = time;
    reason(build(input), code);
    assert.equal(build(input).interval, null);
  }
  const input = fixture(); input.start.time = "20:00"; input.end = {time:"04:00"};
  assert.equal(build(input).readiness, "insufficient");
  assert.equal(build(input).original.end.date, null);
});

test("legacy dates and clocks stay unresolved and are never mutated", () => {
  for (const input of [{trip_date:"2024-01-15"},
    {trip_date:"2024-01-15",lines_in:"08:00",lines_out:"16:00"},
    {trip_date:"2024-01-15",lines_in:"20:00",lines_out:"04:00"}]) {
    const before = JSON.stringify(input); const result = build(input);
    assert.equal(result.readiness, "insufficient");
    assert.equal(result.interval, null);
    assert.equal(result.original.end.date, null);
    assert.equal(JSON.stringify(input), before);
    assert.equal(result.original.legacy.trip_date, input.trip_date);
  }
});

test("approximation never becomes precise; explicit bounded and precise inputs retain quality", () => {
  for (const quality of ["approximate", "bounded", "precise"]) {
    const input = {...fixture(), quality}; const result = build(input);
    assert.equal(result.quality, quality);
    assert.equal(result.readiness, quality === "approximate" ? "needs-clarification" : "ready");
    if (quality === "approximate") assert.deepEqual(result.resolved, {start:null,end:null});
  }
});

test("invalid dates and clock normalization cannot invent valid temporal evidence", () => {
  for (const start of [{date:"2024-02-30",time:"08:00"},
    {date:"2024-01-15",time:"24:00"}, {date:"2024-01-15",time:"08:00:60"},
    {date:"2024-01-15",time:"08:00Z"}]) {
    assert.equal(build({...fixture(),start}).interval, null);
  }
  assert.equal(build(null).readiness, "insufficient");
  assert.equal(build({...fixture(),quality:"invented"}).interval, null);
});

test("unrelated species, identity, fishing effort and report validity are outside the contract", () => {
  const input = {...fixture(), species:"test-species",user_id:"private",hours_fished:1,reportValid:true};
  assert.deepEqual(build(input), build(fixture()));
  assert.equal(input.hours_fished, 1);
  assert.equal(input.reportValid, true);
  assert.equal(Object.hasOwn(build(input), "reportValid"), false);
  const source = readFileSync(new URL("../../shared/fishingLogTemporalEvidence.mjs",import.meta.url),"utf8");
  assert.doesNotMatch(source, /supabase|react|fetch\(|scoring|ranking|habitat|species/i);
});

test("provenance and exact installed dependency pin are verifiable", () => {
  const result = build(fixture());
  assert.equal(result.derivation.contractVersion, FISHING_LOG_TEMPORAL_CONTRACT);
  assert.equal(result.derivation.implementationVersion, "0.5.1");
  assert.equal(result.derivation.timezoneDataVersion, process.versions.tz ?? null);
  const root = new URL("../../", import.meta.url);
  const json = name => JSON.parse(readFileSync(new URL(name,root),"utf8"));
  assert.equal(json("package.json").dependencies["@js-temporal/polyfill"], "0.5.1");
  assert.equal(json("package-lock.json").packages[""].dependencies["@js-temporal/polyfill"], "0.5.1");
  assert.equal(json("package-lock.json").packages["node_modules/@js-temporal/polyfill"].version, "0.5.1");
  assert.equal(json("node_modules/@js-temporal/polyfill/package.json").version, "0.5.1");
});

test("browser-like runtime without Node metadata reports unknown tzdata", () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "process");
  let result;
  try {
    Object.defineProperty(globalThis, "process", {value:undefined, configurable:true});
    result = build(fixture());
  } finally {
    Object.defineProperty(globalThis, "process", descriptor);
  }
  assert.equal(result.readiness, "ready");
  assert.equal(result.derivation.runtime, null);
  assert.equal(result.derivation.icuVersion, null);
  assert.equal(result.derivation.timezoneDataVersion, null);
});
