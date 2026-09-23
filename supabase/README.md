# Supabase schema baseline

`20260801_fishing_day_reports_baseline_v1.sql` reconstructs the authoritative
Task 6A deployed catalog definition before the later `fishing_locations` addition.
It restores a missing dependency for fresh non-production environments; its date
establishes logical ordering, not a claim that this migration previously ran.
No production row data was used or copied.

Apply migrations in filename order in a separately approved fresh Supabase
environment. Supabase must already provide `auth.users`, `auth.uid()`, the
`authenticated` role and PostgreSQL's `gen_random_uuid()` function. The report
baseline precedes `20260802_ocean_snapshots_v1.sql`, whose foreign key references
reports. `20260914_fishing_location_capture_v1.sql` alone adds `fishing_locations`.

## Existing environments

Do not blindly apply this backdated migration to production or mark it applied.
The baseline deliberately uses plain `CREATE TABLE` inside a transaction: any
existing report table causes an error before policies or grants are changed,
even when its schema matches. It does not reconcile or rewrite existing tables.
Production migration-ledger reconciliation requires a separate reviewed procedure
that compares the deployed schema and ledger with the canonical ordered result.
Do not drop the table to make this migration run.

## Ownership and privileges

The four authenticated owner policies reproduce the deployed INSERT/SELECT/
UPDATE/DELETE rules. RLS is enabled, not forced. `share_intelligence` remains
report data; it creates no sharing policy. No new validation, timestamp trigger,
report immutability or species-specific persistence rules are introduced.

Explicit authenticated SELECT/INSERT/UPDATE/DELETE grants support existing report
operations, following the repository's explicit-grant convention. This migration
neither revokes privileges nor explicitly grants TRUNCATE, REFERENCES or TRIGGER.
Supabase/default privileges may still confer broader grants. Least-privilege
hardening is separate work; this baseline does not claim to remove those grants.

Report-to-snapshot same-owner integrity and a governed species-neutral association
table remain separate future work. The existing snapshot foreign key is unchanged.

## Fishing Log source-evidence storage (Task 8C)

`20260923_fishing_log_evidence_capture_v1.sql` adds one nullable JSONB column,
`public.fishing_day_reports.evidence_capture`. The name describes the shared
capture envelope without tying storage to a species or a particular interpretation.
The migration follows the report baseline, Ocean Snapshots and the later
`fishing_locations` addition. Those historical migrations are unchanged.

The field is intended to hold the SOURCE-ONLY
`pelora-fishing-log-evidence-capture-v1` envelope from
`shared/fishingLogEvidenceCapture.mjs`: original temporal/time-basis confirmation
facts and versioned location inputs, including supplied identities and explicit
characterization. Derived UTC instants, intervals, quality/readiness, Task 7D scope,
snapshot IDs and matching/association results are not part of this source envelope.

There is no default or backfill. Existing reports have SQL NULL after this additive
migration; NULL means no versioned envelope was captured, not an invalid report or
negative evidence. Do not synthesize envelopes from legacy fields or timestamps.
`trip_date`, `lines_in`, `lines_out` and `fishing_locations` remain unchanged. No
trigger synchronizes representations. Future runtime integration must intentionally
write the source envelope and compatibility projections through the shared contract;
this task changes neither report saves nor Saved Reports. Task 8B's `captureEvidence`
reader argument is not itself a database column; future adapters map this field to it.

Existing owner RLS, grants and `share_intelligence` semantics remain unchanged.
The evidence inherits the report's privacy; it is sensitive captain time/location
data. No additional access policy is introduced. The column adds no database-level
JSON shape/version check, index or scientific validation. The governed reader owns
version compatibility, so future versions are not prevented by a v1-only constraint.
Storage capability does not prove backend authorship, association or learning consent.

The migration uses plain ADD COLUMN so an unexpected existing column fails rather
than silently concealing schema drift. It has not been executed or deployed by
Task 8C. Existing production ledger reconciliation described above remains separate.
Ordered dependency tests cover known Fishing Log dependencies, not a verified full
project bootstrap. No disposable PostgreSQL execution was performed in this task.

## Explicit Ocean Snapshot privileges (Task 9B)

`20260924_ocean_snapshot_privileges_v1.sql` follows evidence-capture storage and
explicitly grants authenticated SELECT/INSERT on `public.ocean_snapshots`.
Browser insert/returned-row and duplicate/read paths, and backend snapshot reads,
require those operations. No supported client UPDATE/DELETE path requires a grant.
The historical snapshot migration and its owner RLS policies remain unchanged.
This additive migration does not revoke broader platform/default grants or prove
least privilege. It has not been executed by Task 9B.

See [Non-production bootstrap verification](Non_Production_Bootstrap_v1.md) for
target/link safety, required approval before migration execution, effective grant
inspection, synthetic two-user RLS checks, anonymous-Auth and captain_access
boundaries. No infrastructure has been provisioned. Do not use production data.

## Repository verification commands

From the repository root:

```powershell
node backend/tests/fishingDayReportSchema.test.js
node backend/tests/fishingLogEvidenceStorage.test.js
node backend/tests/fishingLogEvidenceCapture.test.js
node backend/tests/oceanSnapshotPrivileges.test.js
```

These static tests check the canonical columns, constraints, policies, explicit
grants and ordered report dependencies without accessing a database. They do not
execute PostgreSQL, prove deployed privileges, or replace a future disposable
Supabase bootstrap and multi-user RLS execution test. No database is provisioned
or contacted by this verification.
