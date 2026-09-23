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

## Repository verification

From the repository root:

```powershell
node backend/tests/fishingDayReportSchema.test.js
```

These static tests check the canonical columns, constraints, policies, explicit
grants and ordered report dependencies without accessing a database. They do not
execute PostgreSQL, prove deployed privileges, or replace a future disposable
Supabase bootstrap and multi-user RLS execution test. No database is provisioned
or contacted by this verification.
