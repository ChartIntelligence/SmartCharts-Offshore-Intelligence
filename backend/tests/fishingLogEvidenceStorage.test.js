import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync, readdirSync} from "node:fs";
import {test} from "node:test";
import {buildFishingLogEvidenceCaptureV1, normalizeFishingLogEvidenceV1} from "../../shared/fishingLogEvidenceCapture.mjs";

const directory = new URL("../../supabase/migrations/", import.meta.url);
const baseline = "20260801_fishing_day_reports_baseline_v1.sql";
const snapshots = "20260802_ocean_snapshots_v1.sql";
const locations = "20260914_fishing_location_capture_v1.sql";
const evidence = "20260923_fishing_log_evidence_capture_v1.sql";
const read = name => readFileSync(new URL(name, directory), "utf8");
const normalize = sql => sql.replace(/--[^\n]*/g, "").replace(/\s+/g, " ").trim();
const sql = normalize(read(evidence));

test("storage migration adds exactly one nullable JSONB column with no default or other operation", () => {
  // Exact statement allowlist is also the static syntax check: no data writes,
  // indexes, triggers, generated columns, constraints, policies or grants allowed.
  assert.equal(sql, "alter table public.fishing_day_reports add column evidence_capture jsonb null;");
  assert.equal(sql.split(";").filter(value => value.trim()).length, 1);
  assert.doesNotMatch(sql, /\b(default|update|delete|truncate|insert|create|drop|rename|check|references|generated|grant|revoke|policy|owner|index|trigger)\b/i);
});

test("historical report and location migrations remain byte-equivalent apart from line endings", () => {
  // Pinned to the approved pre-Task-8C checkpoint, not a newly reconstructed schema.
  const expected = {
    [baseline]: "82dde938852ba7b3bab36250ab0b1d922af21ea283d5a377c4966ded9daa0a40",
    [locations]: "6fcffb7fb46d20314297736a97dda6e9d9a6c03219de3870831e89d856328e88"
  };
  for (const [name, digest] of Object.entries(expected)) {
    assert.equal(createHash("sha256").update(read(name).replace(/\r\n/g, "\n")).digest("hex"), digest);
  }
  const original = normalize(read(baseline));
  for (const column of ["trip_date date not null", "lines_in time without time zone null", "lines_out time without time zone null"]) {
    assert.ok(original.includes(column));
  }
  assert.doesNotMatch(original, /evidence_capture|fishing_locations/);
  assert.equal(normalize(read(locations)), "alter table public.fishing_day_reports add column if not exists fishing_locations jsonb default '[]'::jsonb;");
});

test("known Fishing Log dependencies precede source-evidence storage in fresh migration order", () => {
  const names = readdirSync(directory).filter(name => name.endsWith(".sql")).sort();
  const positions = [baseline, snapshots, locations, evidence].map(name => {
    assert.ok(names.includes(name), `${name} must exist`);
    return names.indexOf(name);
  });
  assert.ok(positions.every((position, i) => i === 0 || positions[i - 1] < position));
  assert.match(normalize(read(snapshots)), /references public\.fishing_day_reports\(id\)/);
  assert.deepEqual(names.filter(name => /add column(?: if not exists)? evidence_capture\b/.test(normalize(read(name)))), [evidence]);
});

test("one JSON value holds a source-only Task 8B envelope; NULL remains legacy absence", () => {
  const capture = buildFishingLogEvidenceCaptureV1({
    temporal: {start:{date:"2026-09-22",time:"20:00"},end:{date:"2026-09-23",time:"04:00"},
      quality:"bounded",timeBasis:{type:"iana",timeZone:"America/Chicago",confirmation:"captain-confirmed"}},
    locations: [{locationEntryId:"entry-a",latitude:29.5,longitude:-86.2,label:"Recorded position",
      source:"manual",certainty:"approximate"}]
  });
  // Fixture only: no runtime save adapter, database client or INSERT is involved.
  const proposedField = JSON.parse(JSON.stringify({evidence_capture:capture}));
  assert.equal(proposedField.evidence_capture.contractVersion, "pelora-fishing-log-evidence-capture-v1");
  assert.deepEqual(normalizeFishingLogEvidenceV1({captureEvidence:proposedField.evidence_capture}).capture, capture);
  assert.deepEqual(Object.keys(capture), ["contractVersion", "temporal", "locations"]);
  assert.deepEqual(Object.keys(capture.temporal), ["captainInput"]);
  assert.deepEqual(Object.keys(capture.locations[0]), ["contractVersion", "locationEntryId", "latitude", "longitude", "label", "source", "certainty"]);
  assert.equal(capture.temporal.captainInput.end.date, "2026-09-23");
  const legacy = {trip_date:"2026-09-22",lines_in:"20:00",lines_out:"04:00",fishing_locations:[]};
  assert.deepEqual(normalizeFishingLogEvidenceV1({...legacy,captureEvidence:null}),
    {state:"legacy",capture:null,legacyFacts:legacy});
});
