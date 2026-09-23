import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync, readdirSync} from "node:fs";
import {test} from "node:test";

const directory = new URL("../../supabase/migrations/", import.meta.url);
const migration = "20260924_ocean_snapshot_privileges_v1.sql";
const snapshots = "20260802_ocean_snapshots_v1.sql";
const read = name => readFileSync(new URL(name, directory), "utf8");
const normalize = sql => sql.replace(/--[^\n]*/g, "").replace(/\s+/g, " ").trim();

test("only SELECT and INSERT on ocean_snapshots are granted, only to authenticated", () => {
  // Exact executable inventory doubles as a static syntax check for this simple
  // migration. Extra recipients, privileges, DML, DDL, RLS changes, policies,
  // functions, triggers, indexes or species-specific objects cannot pass.
  const statements = normalize(read(migration)).split(";");
  assert.deepEqual(statements, [
    "grant select, insert on table public.ocean_snapshots to authenticated", ""
  ]);
});

test("approved historical migrations remain unchanged apart from line endings", () => {
  // SHA-256 values from checkpoint 491287413dc41c0eaa1a6888a6545660b3cd20ba.
  const expected = {
    "20260801_fishing_day_reports_baseline_v1.sql": "82dde938852ba7b3bab36250ab0b1d922af21ea283d5a377c4966ded9daa0a40",
    [snapshots]: "c2bba57b0b25521856ef855a134bb91c286d0d13a01f65595feb75012e978a7c",
    "20260914_fishing_location_capture_v1.sql": "6fcffb7fb46d20314297736a97dda6e9d9a6c03219de3870831e89d856328e88",
    "20260923_fishing_log_evidence_capture_v1.sql": "9a3422223e57e066a88251d12e8ff7dc04d177249ae935f6bab76e4b8bb95c3e"
  };
  for (const [name, digest] of Object.entries(expected)) {
    assert.equal(createHash("sha256").update(read(name).replace(/\r\n/g, "\n")).digest("hex"), digest, name);
  }
});

test("privilege migration follows the evidence column and known snapshot dependencies", () => {
  const names = readdirSync(directory).filter(name => name.endsWith(".sql")).sort();
  const chain = ["20260801_fishing_day_reports_baseline_v1.sql", snapshots,
    "20260914_fishing_location_capture_v1.sql", "20260923_fishing_log_evidence_capture_v1.sql", migration];
  const positions = chain.map(name => {
    assert.ok(names.includes(name), name);
    return names.indexOf(name);
  });
  assert.ok(positions.every((position, i) => i === 0 || positions[i - 1] < position));
});

test("historical RLS still defines exactly the owner SELECT and INSERT policies", () => {
  const sql = normalize(read(snapshots));
  assert.ok(sql.includes("alter table public.ocean_snapshots enable row level security;"));
  const policies = sql.split(";").map(statement => statement.trim())
    .filter(statement => /^create policy\b/.test(statement));
  assert.deepEqual(policies, [
    'create policy "Captains can read private ocean snapshots" on public.ocean_snapshots for select to authenticated using ( auth.uid() = user_id )',
    'create policy "Captains can create private ocean snapshots" on public.ocean_snapshots for insert to authenticated with check ( auth.uid() = user_id )'
  ]);
});
