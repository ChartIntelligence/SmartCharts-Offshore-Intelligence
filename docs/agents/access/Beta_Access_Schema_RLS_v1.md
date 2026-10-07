# Pelora beta access schema/RLS v1 — candidate evidence

**PELORA BETA ACCESS SCHEMA/RLS v1 — CANDIDATE COMPLETE**

Baseline: `dadec5dbca7d360f70f633413fb6a347dc24cac1`. Branch: `codex/pelora-beta-access-schema-v1`. Worktree: `C:\Projects\Pelora-Agent-Worktrees\pelora-beta-access-schema-v1`. Existing repository/origin, baseline, free branch/path and inactive hook inventory were verified before checkout. This branch starts from the critical-path baseline, not governance or the UI candidate. No pre-existing instructions were replaced.

## Exact owned files and contract

- [Additive migration](../../../supabase/migrations/20261007_captain_entitlement_v1.sql): `pelora-captain-entitlement-v1`.
- [Dedicated tests](../../../backend/tests/betaAccessSchema.test.mjs).
- This report and [machine-readable evidence](Beta_Access_Schema_RLS_v1.json).

The migration is one BEGIN/COMMIT transaction. It refuses missing baseline objects, unsupported legacy roles/statuses, unexpected policy counts/roles, non-RLS/client-owned protected tables, existing custom access triggers or conflicting schema/constraint state. These guards are not a deployed catalog audit and do not authorize a production application.

Existing founder/founding rows map to founder_lifetime/founding_lifetime with null dates/expiry. Role, status, names and original creation/update values remain unchanged in the controlled baseline fixture. Pending/revoked rows are not approved by migration. Unknown historical approval/revocation actors/times remain null; migration audit events identify an unknown actor rather than fabricating approval history. The founding-role default is removed; beta provisioning names beta_captain/beta_trial explicitly.

New columns: entitlement_type, activated_at, starts_at, expires_at, start_policy_version, approved_at/by, revoked_at/by, revision and paid_grant_reference. The approved start policy is `first-redemption-utc-calendar-year-v1`. An approved unactivated beta is not entitled. First successful verified-recipient redemption atomically establishes its sole trial interval. UTC calendar-year addition is used, not 365 days: 2024-02-29 12:34:56Z expires 2025-02-28 12:34:56Z; an interval crossing a leap year may contain 366 days. Session timezone does not change this boundary. Validity is starts_at <= database clock_timestamp() < expires_at. Infinite/partial dates or unknown policy cannot confer access.

A trigger preserves an existing role and activated trial's original dates/policy. Lifetime constraints forbid expiry. Revocation overrides active entitlement; restore keeps the original dates, so an expired restored trial remains expired. Paid_subscription is a non-admitting compatibility slot/reference, not paid authority or a working payment grant. A later approved paid-grant contract/enforcement packet is required; this migration does not fabricate paid validity.

## Invitations, events and narrow database operations

pelora_access.invitations records UUID identity, canonical recipient email, founder inviter, actual issue/expiry, state, redeemed Auth user/time and request UUID. Each new invitation gets a seven-day UTC window. Resend is an audited request against the existing window, not a renewal; reinvite creates another invitation window but cannot reset an existing trial. Redemption binds the verified email from auth.users to auth.uid(), not a caller-provided recipient/user/role. A previously redeemed recipient cannot grant another Auth identity a second year. Changed email on an existing identity likewise does not reset its original trial.

pelora_access.events is append-only, with actor/target/invitation, action/time, request UUID, previous/new revision, constrained request arguments and original acknowledgement. It stores no bearer tokens, captain report content or Ocean Intelligence payload. Identical actor/request submissions replay their original acknowledgement; changed arguments fail. A replayed acknowledgement records the original operation, not current entitlement. Consumers must separately read authoritative current access; replay does not undo later revocation or imply a grace period. Audit revisions are database-controlled.

Authenticated EXECUTE allowlist (six functions only):

- owner_is_authenticated(uuid): same principal plus explicit non-anonymous authenticated claims.
- has_current_access(): the caller's current authoritative entitlement; paid compatibility returns false.
- invite_beta(text,uuid): current approved founder only; creates an approved beta invitation, without email delivery.
- resend_beta(uuid,uuid): founder only; does not extend the window or change entitlement.
- manage_beta(uuid,text,uuid): founder-only approve/revoke/restore of beta_trial records. Approval alone does not start time. Founder/founding targets and arbitrary actions are rejected.
- redeem_beta(uuid,uuid): verified matching recipient only; preserves existing lifetime accounts and original trial period.

All routines have fixed pg_catalog search paths and fully qualified protected objects. Mutation/entitlement routines are owned by migration authority and use SECURITY DEFINER; actor identity comes from Auth context. Fresh founder/target checks, row locks and advisory locks coordinate mutations/idempotency. Internal helpers/trigger functions and anniversary are not client-executable. No PUBLIC/anon execution, runtime object ownership, schema CREATE or direct invitation/event DML is granted. No service-role credential/handler, email operation or general founder data-reading authority exists. Real cross-connection contention is not qualified by this rollback-only fixture.

## Owner RLS and privilege matrix

Every policy retains owner identity through owner_is_authenticated(user_id); entitlement never replaces ownership. Non-anonymous owners may read their access record and retained reports/snapshots/history/observations after expiry/revocation. Authenticated report INSERT/UPDATE/DELETE additionally requires current entitlement. Snapshot/governed history/observation INSERT additionally requires current entitlement; their direct UPDATE/DELETE remain ungranted. PUBLIC/anon table grants are revoked; authenticated grants remain report CRUD, other retained tables SELECT/INSERT, captain_access SELECT only. RLS controls which granted operations succeed. Founder has no cross-owner report/history policy.

Expiry/revocation does not delete, rewrite or migrate captain-owned rows. This is database support for limited authenticated history/account read/export, not an implemented UI/export endpoint. Protected current Ocean Intelligence HTTP routes and access-status UI are not changed by this schema packet; their entitlement enforcement remains a required later packet. This candidate must not be treated as operational beta access.

## Actual validation

Existing Node v24.18.0 and pg client tooling from the existing critical-path checkout were used without copying/installing dependencies. Connection allowlist: existing manually running pelora_phase3_qualification cluster, 127.0.0.1:55432, existing administrator credential outside Git. No new credential, service-role use, package, database software, restart or production connection.

The fixture refuses occupied auth/pelora_access/captain_access namespaces. It constructs synthetic Auth users/claims and non-login runtime roles only inside a rollback transaction, applies the existing repository owner migrations, and exercises the new migration body. Only the outer BEGIN/COMMIT delimiters are replaced by the harness's explicit rollback boundary; all executable migration statements remain intact. Separate tests inject a late failure after DDL/data changes and prove complete rollback. The final rollback verifies the original namespace state is restored. No persistent Supabase-like objects/grants or captain rows were left in the qualification database.

Final commands (PowerShell environment settings):

    $env:PELORA_BETA_SCHEMA_LOCAL='1'
    $env:PELORA_EXISTING_PG_TOOLING='C:\Users\User\.codex\worktrees\e89f\SmartCharts-Offshore-Intelligence'
    node --test backend/tests/betaAccessSchema.test.mjs
    node --test backend/tests/clientPrivilegeHardening.test.js backend/tests/oceanSnapshotPrivileges.test.js
    node --check backend/tests/betaAccessSchema.test.mjs
    git diff --check

Results: **29/29 dedicated cases passed**, zero failures/skips; **16/16 existing migration/privilege regression cases passed**. Counts include the dedicated parent/static cases; they are not an application qualification total. Syntax and whitespace passed. The existing migrations remain unchanged. Focused iteration corrected a PL/pgSQL CASE parse ambiguity, fixture owner/schema-USAGE setup, and assertions recognizing genuine RLS/ownership denial messages; no denied permission was broadened to obtain a pass. An additional recipient-binding invariant and late-rollback/missing-principal cases were included on final tested bytes.

Covered: lifetime mapping and statuses; unactivated/invalid beta; first redemption and anniversary/leap/timezone rules; seven-day window and resend/reinvite; revoke/restore; expired restore/reinvite; wrong/anonymous/missing/unverified identity; no lifetime conversion/default creation; denied role/status/expiry/self-approval/direct DML; owner-required reads/writes across every retained table; data preservation; exact original trial dates; deterministic/idempotent audit and request conflicts; immutable audit; protected routines; paid compatibility denial; early/late migration rollback and activation rollback. No real Auth server, email, browser, frontend, payment, backend entitlement middleware or concurrent-process qualification is claimed.

## Deployed-state verification — still pending

**PRODUCTION MIGRATION NOT PERFORMED.** Repository migrations do not prove deployed state. A separately approved read-only catalog/ledger reconciliation must provide:

- information_schema.columns and pg_constraint definitions for captain_access and Auth user identity/verified-email fields;
- pg_class ownership/RLS flags, pg_policy names/commands/roles/expressions and pg_trigger definitions for the five affected tables;
- table/schema/function ACLs, role membership and migration-owner access to auth.users; no client-owned protected objects;
- migration ledger and ordered prerequisite reconciliation, including owner-table privilege hardening;
- sanitized aggregate role/status counts and mappings before/after; existing founders/founding rows must retain identities/statuses and null expiry;
- verification of trusted JWT subject/non-anonymous context, PostgREST schema exposure and function ownership/search paths in a non-production Supabase environment before any production proposal.

No production values or private captain records are needed in Git evidence. Unexpected state must stop application rather than be silently repaired. The migration intentionally fails on partial/conflicting state. Missing/incompatible beta contract denies new beta access; failed rollout must not fallback to legacy approval for beta. Existing lifetime source behavior remains unchanged if the migration rolls back. A partially deployed API/UI must keep beta ingress disabled until all authority boundaries are validated.

## Next packet and stop

Recommend the isolated access-service/API and authoritative backend entitlement enforcement contract next, with founder-only status inspection and controlled invitation/redemption APIs. Validate real non-production Supabase JWT/RLS behavior before UI or email integration. Email delivery/privileged Auth, new credentials, production migration/deployment and paid processing remain separate gates. PELORA-02 account-status/admin UI, combined UI candidate, source admission/science, CP-10 and production were not changed. No operational or beta-ready claim.
