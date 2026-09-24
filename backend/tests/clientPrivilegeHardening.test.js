import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync, readdirSync} from "node:fs";
import {test} from "node:test";

const directory = new URL("../../supabase/migrations/", import.meta.url);
const migration = "20260925_client_privilege_hardening_v1.sql";
const read = name => readFileSync(new URL(name, directory), "utf8");
const sql = read(migration).replace(/--[^\n]*/g, "").replace(/\s+/g, " ").trim();
const statements = sql.split(";").map(value => value.trim());
const tables = ["fishing_day_reports", "ocean_snapshots", "captain_access",
  "early_access_signups", "governed_opportunity_history", "governed_opportunity_observation"];
const revoke = `revoke all privileges on table ${tables.map(name => `public.${name}`).join(", ")} from anon, authenticated restrict`;
const grants = statements.filter(value => value.startsWith("grant "));

test("exact executable SQL inventory contains only the approved transaction and ACL changes", () => {
  // Static inventory is not a PostgreSQL execution or proof of live effective ACLs.
  assert.deepEqual(statements, ["begin", revoke,
    "grant select, insert, update, delete on table public.fishing_day_reports to authenticated",
    "grant select, insert on table public.ocean_snapshots, public.governed_opportunity_history, public.governed_opportunity_observation to authenticated",
    "grant select on table public.captain_access to authenticated", "commit", ""]);
});

test("exact six-table allowlist is reset", () => {
  assert.deepEqual([...statements[1].matchAll(/public\.([a-z_]+)/g)].map(match => match[1]), tables);
  assert.deepEqual([...new Set([...sql.matchAll(/public\.([a-z_]+)/g)].map(match => match[1]))], tables);
});

test("REVOKE ALL targets only anon and authenticated", () => {
  assert.equal(statements[1], revoke);
  assert.match(statements[1], / from anon, authenticated restrict$/);
});

test("RESTRICT fails closed on dependent grants instead of cascading", () => {
  assert.match(statements[1], / restrict$/);
  assert.doesNotMatch(sql, /\bcascade\b/i);
});

test("authenticated grants exactly match the approved matrix", () => {
  const actual = Object.fromEntries(tables.map(name => [name, []]));
  for (const grant of grants) {
    const match = /^grant ([a-z, ]+) on table (public\.[a-z_,. ]+) to authenticated$/.exec(grant);
    assert.ok(match, grant);
    for (const table of match[2].split(", ")) {
      const name = table.replace(/^public\./, "");
      assert.ok(Object.hasOwn(actual, name));
      actual[name].push(...match[1].split(", "));
    }
  }
  assert.deepEqual(actual, {
    fishing_day_reports: ["select", "insert", "update", "delete"],
    ocean_snapshots: ["select", "insert"], captain_access: ["select"], early_access_signups: [],
    governed_opportunity_history: ["select", "insert"],
    governed_opportunity_observation: ["select", "insert"]
  });
});

test("no anon table grant exists", () => {
  assert.equal(grants.length, 3);
  for (const grant of grants) assert.match(grant, / to authenticated$/);
  assert.doesNotMatch(grants.join(";"), /\banon\b/);
});

test("no grant option is introduced", () => {
  assert.doesNotMatch(sql, /\bgrant option\b/i);
});

test("no policy, default, ownership, function, sequence, role, data or destructive operation", () => {
  assert.doesNotMatch(sql, /\b(?:alter|create|drop|truncate|cascade|repair|reset|call|execute|do)\b/i);
  assert.doesNotMatch(sql, /\b(?:policy|owner|function|sequence|role|default privileges)\b/i);
  assert.ok(statements.filter(Boolean).every(value => /^(?:begin$|commit$|revoke all privileges on table |grant )/.test(value)));
  assert.doesNotMatch(sql, /(?:^|;)\s*(?:insert|update|delete|merge|copy|select)\b/i);
});

test("PostgreSQL 17 ALL includes MAINTAIN and no client maintenance privilege is regranted", () => {
  // PG17 table ALL = SELECT INSERT UPDATE DELETE TRUNCATE REFERENCES TRIGGER MAINTAIN.
  assert.match(statements[1], /^revoke all privileges on table /);
  assert.doesNotMatch(grants.join(";"), /\b(?:maintain|truncate|references|trigger|all)\b/);
  const docs = readFileSync(new URL("../../docs/Client_Privilege_Hardening_v1.md", import.meta.url), "utf8");
  assert.match(docs, /PostgreSQL 17\.6/);
  assert.match(docs, /ALL[^\n]*MAINTAIN/);
});

test("all nine historical migration hashes remain unchanged apart from line endings", () => {
  // LF-normalized SHA-256 at e86f456327ccd66a4692cbd0adae74fe29b8040f.
  const expected = {
    "20260801_fishing_day_reports_baseline_v1.sql": "82dde938852ba7b3bab36250ab0b1d922af21ea283d5a377c4966ded9daa0a40",
    "20260802_ocean_snapshots_v1.sql": "c2bba57b0b25521856ef855a134bb91c286d0d13a01f65595feb75012e978a7c",
    "20260810_captain_access_v1.sql": "3309d1d733833e21a31a2c0667e6242c06c6b5cba8d4954b33f6ea2308b16759",
    "20260906_early_access_signups_v1.sql": "ef467d9128348e267fb4ea719c2e7c0b8a5cf4d12047f2b4be70f39652b51cca",
    "20260907_governed_opportunity_history_v1.sql": "e6528a65b99df4ddd26b904ac92d57ca7616aa76557974776782cde31db4c403",
    "20260912_governed_opportunity_observation_v1.sql": "cc993e8f42b31d47e46bd7e701155d22a4947511bd70527879e69e3616ae0fc4",
    "20260914_fishing_location_capture_v1.sql": "6fcffb7fb46d20314297736a97dda6e9d9a6c03219de3870831e89d856328e88",
    "20260923_fishing_log_evidence_capture_v1.sql": "9a3422223e57e066a88251d12e8ff7dc04d177249ae935f6bab76e4b8bb95c3e",
    "20260924_ocean_snapshot_privileges_v1.sql": "d94dbd626ab4448cf9ea2155479bc3f2f68744e58f2e392cb312aa4381edc4a1"
  };
  assert.equal(Object.keys(expected).length, 9);
  for (const [name, digest] of Object.entries(expected)) {
    assert.equal(createHash("sha256").update(read(name).replace(/\r\n/g, "\n")).digest("hex"), digest, name);
  }
});

test("migration sorts immediately after 20260924", () => {
  const names = readdirSync(directory).filter(name => name.endsWith(".sql")).sort();
  const previous = names.indexOf("20260924_ocean_snapshot_privileges_v1.sql");
  assert.ok(previous >= 0);
  assert.equal(names[previous + 1], migration);
});

test("transaction boundaries are exact and enclose all privilege changes", () => {
  assert.equal(statements[0], "begin");
  assert.deepEqual(statements.slice(-2), ["commit", ""]);
  assert.equal(statements.filter(value => value === "begin").length, 1);
  assert.equal(statements.filter(value => value === "commit").length, 1);
  assert.equal(statements.length, 7);
});
