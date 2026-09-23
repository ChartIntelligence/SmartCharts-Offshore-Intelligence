# Non-production bootstrap verification plan v1

Task 9B is repository-only. No project, linkage, Auth setting, database object or
test row was created or changed remotely. The new migration has not been executed.
Static verification is not proof of a successful Supabase bootstrap.

## Snapshot privilege contract

`20260924_ocean_snapshot_privileges_v1.sql` explicitly grants authenticated SELECT
and INSERT on `public.ocean_snapshots`. These are required by
`frontend/src/lib/oceanMemoryStorage.js`: insert with returned rows, duplicate
recovery by SELECT, and snapshot reads. Backend snapshot retrieval in
`backend/server.js` also reads rows. There is no supported client UPDATE or DELETE.

The historical `20260802_ocean_snapshots_v1.sql` remains the source of truth for
table shape and owner SELECT/INSERT RLS policies. The new migration supplies the
required table privileges without depending on platform-default grants. Table
privileges permit an operation; RLS determines which rows the caller may access.

This is additive, not privilege hardening. It grants nothing to anon or any
administrative role, revokes nothing, changes no policies, and does not remove
broader inherited/default privileges. Effective UPDATE/DELETE and other grants
must still be inspected. Do not infer least privilege from this migration alone.
No species-specific privilege, association rule or runtime behavior is added.

## Target and command safety (future Tasks 9C/9D only)

Use a separately approved non-production project, independent Auth/database, and
synthetic users/data only. Never copy real captain accounts, access rows, Fishing
Logs, notes, snapshots, history or observations. Do not reconstruct undocumented
production schema manually as a bootstrap workaround.

The original checkout has previously been linked to production. `db push --linked`
acts on the currently linked project. A worktree name or CLI profile is not proof
of the target. Do not assume this worktree is linked to non-production. Do not
overwrite, repair or copy production linkage, including `supabase/.temp`.

Task 9C must deliberately select/pin or record the Supabase CLI version and review
its command help. Task 9B installs no CLI and chooses no arbitrary version. Use a
dedicated non-production CLI working directory and record the approved project
reference, hostname and organization without credentials. A profile identifies
management credentials; it does not substitute for project-target verification.

Future sequence, not authorization to execute now:

1. Obtain approval for project creation/cost and the independent project identity.
2. Establish CLI configuration/link only in the approved non-production directory.
   Verify its project reference against the approved identity and Dashboard before
   linking and again before every mutating command. Stop on any mismatch.
3. Inspect migration status with `migration list --linked` in that verified directory.
4. Run `db push --linked --dry-run`. This previews the list; it does not execute or
   validate the SQL. Manually review every planned migration and its contents.
5. Obtain explicit approval for the actual migration application, naming the target
   and reviewed list. Recheck directory, link and project identity immediately
   before `db push --linked`. Apply only to the verified non-production target.
6. Inspect `migration list --linked` afterward and compare the ledger to the ordered
   repository files. Do not repair a ledger just to hide a failure.
7. Inspect schema objects and effective privileges as described below.
8. With separately authorized synthetic Auth identities, run the two-user RLS tests
   using ordinary client JWTs/public keys, not privileged administrative clients.
9. Only after verification passes, configure application runtime with this project's
   URL/public key on both frontend and backend. Verify Task 5B reports `matched`
   and independently verify that the matched project is non-production.

Do not put service-role credentials into Pelora runtime. Administrative test-user
and access-row provisioning is separate from ordinary client authorization tests.
Do not expose credentials in commands, logs or committed verification records.

## Ordered schema acceptance

Apply the entire checked-in migration chain, not just a selected subset:

1. `20260801_fishing_day_reports_baseline_v1.sql`
2. `20260802_ocean_snapshots_v1.sql`
3. `20260810_captain_access_v1.sql`
4. `20260906_early_access_signups_v1.sql`
5. `20260907_governed_opportunity_history_v1.sql`
6. `20260912_governed_opportunity_observation_v1.sql`
7. `20260914_fishing_location_capture_v1.sql`
8. `20260923_fishing_log_evidence_capture_v1.sql`
9. `20260924_ocean_snapshot_privileges_v1.sql`

Verify Supabase supplies auth.users, auth.uid(), authenticated/anon roles, public
schema access, PL/pgSQL and UUID support. Generic PostgreSQL alone is insufficient.
Verify public.fishing_day_reports, public.ocean_snapshots, public.captain_access,
public.early_access_signups, public.governed_opportunity_history and
public.governed_opportunity_observation, plus `public.join_early_access(text, text)`,
exist. Verify constraints, indexes
and foreign keys against migrations. Verify the 23 report baseline columns plus
nullable JSONB fishing_locations and evidence_capture: 25 columns in this chain.
The former has the legacy empty-array default; evidence_capture has no default.
NULL evidence_capture means no versioned envelope, not invalid/negative evidence.

## Effective privilege inspection

Record metadata/results, not tokens or private row contents. Compare repository
statements and the migration ledger with actual catalog state; effective privilege
alone does not establish whether a grant came from Pelora or platform defaults.

| Category | Future SQL/catalog inspection |
| --- | --- |
| Tables | information_schema.table_privileges; pg_class.relacl; has_table_privilege for anon/authenticated and SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER |
| Defaults/inheritance | pg_default_acl, object owners, role membership and PUBLIC grants; note the role that created each object |
| Schema | pg_namespace.nspacl and has_schema_privilege for public USAGE/CREATE |
| Functions | pg_proc owner, prosecdef, proconfig/search_path, proacl; has_function_privilege for join_early_access EXECUTE |
| Sequences | Identity sequence ownership/ACL and has_sequence_privilege; verify the signup function owner can use its sequence without opening direct client access |
| RLS | pg_class.relrowsecurity/relforcerowsecurity; pg_policies commands, roles, USING and WITH CHECK expressions |

Confirm authenticated has snapshot SELECT and INSERT, backed by the explicit new
migration. Inspect UPDATE/DELETE separately: an existing table grant may coexist
with no permitting RLS policy. Test that neither operation can change snapshot
rows. RLS is enabled, not forced; owner/admin bypass is not a client test.
Broad grants such as TRUNCATE are not made safe merely by owner RLS. Record any
unexpected privilege for separate review; do not silently harden or waive it.

## Synthetic authorization matrix

Provision approved synthetic Captains A and B, plus a synthetic C for pending,
revoked and missing-access cases. Use dedicated test email addresses only.

| Object | Required ordinary-client verification |
| --- | --- |
| ocean_snapshots | A inserts and reads A's snapshot; B cannot read it or INSERT claiming A's user_id. UPDATE/DELETE by either user must not modify it. Use no report association in this test. |
| fishing_day_reports | A creates/reads/updates/deletes A's report. B cannot read/update/delete it or INSERT as A. A cannot transfer ownership to B. |
| captain_access | Each captain reads only their own row; neither can insert/update/delete approval or self-approve. Provision approval administratively in this test project only. |
| governed_opportunity_history | Owner SELECT/INSERT succeeds; cross-owner read/spoofed INSERT fails; UPDATE/DELETE must not modify rows. |
| governed_opportunity_observation | Same owner SELECT/INSERT and isolation expectations as history. |
| early_access_signups | Direct table access denied for anon/authenticated; join_early_access works with a synthetic email, handles duplicates and rejects invalid input. |

For SELECT denial, check no private rows are returned. For UPDATE/DELETE denial,
check row counts and unchanged fixture state; a zero-row response is not permission
to modify the row. Use controlled contract-compatible fixtures without live provider
acquisition. Keep cleanup/rebuild operations separate and explicitly non-production.

Supabase anonymous Auth users may use PostgreSQL role authenticated. This differs
from unauthenticated requests using anon. Test both independently. An authenticated
anonymous user can satisfy an owner policy with their own auth.uid(); Task 9B does
not change that policy or promise database rejection based on anonymous status.

FoundingCaptainAccessGate controls workspace access. Current report/snapshot/history
owner RLS does not automatically consult captain_access approval. Verify pending,
revoked, missing and anonymous sessions cannot enter the workspace, while recording
their actual direct API behavior separately. Denying direct database rights based
on access status would require a separate governance/security decision.

## Runtime acceptance after database verification

Pair frontend/backend non-production URL/public-key configuration; keep secrets out
of Git and do not copy production env files. Configure test Auth/redirect/mail
settings only under a separate approved task. Validate one atomic Fishing Log
INSERT with legacy temporal projections, coordinate-only fishing_locations and
Task 8B source-only evidence_capture. Verify original temporal inputs/confirmation,
enriched manual location facts and supplied IDs survive. No derived UTC/readiness,
quality or association conclusions belong in the source envelope. Reload Saved
Reports, verify legacy NULL-envelope fixtures remain readable, and test owner delete.

Then verify snapshot persistence, history/observation writes/reads and controlled
fallback behavior. Preserve the existing report-association ownership limitation
as separate work; this grant does not fix association integrity. HTTPS phone testing
is needed to verify successful crypto.randomUUID capture; HTTP LAN may omit IDs.

If bootstrap fails, record the failing migration and metadata, review a repository
correction, and rebuild only a disposable non-production target under separate
approval. No production reset, ledger repair or manual schema workaround is supplied.

## Repository-only verification

Run `node backend/tests/oceanSnapshotPrivileges.test.js`, the existing report schema
and evidence-storage tests, and the backend/shared suite. The new tests enforce the
exact grant statement, ordering, historical hashes and historical owner policies.
They do not execute SQL or establish effective live permissions. Database execution
and synthetic two-user RLS verification remain pending.
