import assert from "node:assert/strict";
import {readFileSync, readdirSync} from "node:fs";
import {test} from "node:test";

const migrations = new URL("../../supabase/migrations/", import.meta.url);
const baseline = "20260801_fishing_day_reports_baseline_v1.sql";
const ocean = "20260802_ocean_snapshots_v1.sql";
const locations = "20260914_fishing_location_capture_v1.sql";
const read = name => readFileSync(new URL(name, migrations), "utf8");
const normalize = sql => sql.replace(/--[^\n]*/g, "").replace(/\s+/g, " ").trim();
const sql = normalize(read(baseline));
const statements = sql.split(";").map(value => value.trim()).filter(Boolean);

// Independent schema expectation transcribed from the authoritative Task 6A
// catalog metadata. No captain rows or database connection are involved.
const columns = [
  "id uuid not null default gen_random_uuid()",
  "user_id uuid not null",
  "trip_date date not null",
  "captain_private text null",
  "boat_private text null",
  "tournament_private text null",
  "lines_in time without time zone null",
  "lines_out time without time zone null",
  "hours_fished numeric null",
  "miles_run numeric null",
  "areas_fished jsonb null default '[]'::jsonb",
  "bait_observed jsonb null default '[]'::jsonb",
  "bird_activity jsonb null default '[]'::jsonb",
  "water_color text null",
  "weed_condition text null",
  "floating_structure jsonb null default '[]'::jsonb",
  "species_results jsonb null default '{}'::jsonb",
  "trip_outcome text null",
  "information_source text null",
  "notes_private text null",
  "share_intelligence boolean null default false",
  "created_at timestamptz null default now()",
  "updated_at timestamptz null default now()"
];

test("canonical table has exactly the 23 pre-location columns and deployed keys", () => {
  const table = statements[1].match(/^create table public\.fishing_day_reports \((.*)\)$/);
  assert.ok(table, "Plain CREATE TABLE must reject an existing table");
  assert.deepEqual(table[1].split(",").map(value => value.trim()), [
    ...columns,
    "constraint fishing_day_reports_pkey primary key (id)",
    "constraint fishing_day_reports_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade"
  ]);
});

test("exact owner policies enable private CRUD without a sharing policy", () => {
  assert.equal(statements[2], "alter table public.fishing_day_reports enable row level security");
  const expected = [
    ["create", "insert", "with check (auth.uid() = user_id)"],
    ["read", "select", "using (auth.uid() = user_id)"],
    ["update", "update", "using (auth.uid() = user_id) with check (auth.uid() = user_id)"],
    ["delete", "delete", "using (auth.uid() = user_id)"]
  ].map(([verb, command, predicate]) =>
    `create policy "Captains can ${verb} their own reports" on public.fishing_day_reports for ${command} to authenticated ${predicate}`);
  assert.deepEqual(statements.slice(3, 7), expected);
});

test("transaction contains only baseline DDL and minimal explicit CRUD grant", () => {
  assert.equal(statements.length, 9, "No unrelated indexes, triggers, policies or data writes");
  assert.equal(statements[0], "begin");
  assert.equal(statements[7], "grant select, insert, update, delete on public.fishing_day_reports to authenticated");
  assert.equal(statements[8], "commit");
  assert.doesNotMatch(sql, /if not exists|\bdrop\b|\brevoke\b|\btruncate\b/i);
});

test("ordered migrations establish reports before snapshot FK and location addition", () => {
  const names = readdirSync(migrations).filter(name => name.endsWith(".sql")).sort();
  assert.ok(names.indexOf(baseline) < names.indexOf(ocean));
  assert.ok(names.indexOf(ocean) < names.indexOf(locations));
  let reportsCreated = false;
  for (const name of names) {
    const migration = normalize(read(name));
    if (/create table (?:if not exists )?public\.fishing_day_reports\s*\(/i.test(migration)) {
      assert.equal(name, baseline, "Only the baseline owns report creation");
      reportsCreated = true;
    }
    if (/references public\.fishing_day_reports|alter table public\.fishing_day_reports/i.test(migration)) {
      assert.ok(reportsCreated, `${name} requires an earlier report definition`);
    }
  }
  assert.match(normalize(read(ocean)), /fishing_day_report_id uuid null references public\.fishing_day_reports\(id\) on delete set null/);
});

test("later migration alone adds nullable fishing_locations with the deployed default", () => {
  assert.doesNotMatch(sql, /fishing_locations/);
  assert.equal(normalize(read(locations)),
    "alter table public.fishing_day_reports add column if not exists fishing_locations jsonb default '[]'::jsonb;");
  assert.equal(columns.length + 1, 24, "Ordered result has all 24 deployed columns");
});

test("shared schema keeps species as JSON data, with no species-specific architecture", () => {
  assert.ok(columns.includes("species_results jsonb null default '{}'::jsonb"));
  assert.doesNotMatch(sql, /marlin|tuna|mahi|sailfish|wahoo|habitat|scoring|ranking/i);
});
