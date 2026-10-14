# P01 Non-Production enrollment server-operation proposal v1

PROPOSAL ONLY — NOT APPLY-READY. No SQL, migration, RLS/grant/Auth configuration, account/email, privileged service, production or database action executed. Founder authorization01a13c59 permits preparation for separate approval, not deployment. Target only Pelora Non-Production vqzskzoizpomwzgbgdwl; exact deployed catalog/config still must be confirmed independently.

## Pinned inputs and compatibility

Application4e1b49ba52c26089e24dd94f377109c13d8586b6 owner-read/Profile remains legacy founder/founding, entitlement NOT_SUPPLIED. Offline pure contract53ed84b96dba087b38b1e465dc0be9033c9798eb and unmounted UI0adc63a0ccb37605b1e3b3be815ca79e4223e823 have scoped P04 clearance; they are CONTROLLED_OFFLINE, not live routes/authorization. Never relabel their fixtures LIVE or mount them as a substitute for server authority.

Separate schema candidate25ce753f3f1b18a4f24645c6c5778f66ca8d6d60/20261007_captain_entitlement_v1.sql was inspected from Git, not applied here. Its constraint, has_current_access and redeem_beta use first-redemption-utc-calendar-year-v1. That directly conflicts with locked first-successful-qualifying-login start; applying25ce unchanged is prohibited. P01_Beta_Enrollment_Authority_Design_v2 remains the parent authority proposal; this packet specifies exact successor operation/readiness boundaries rather than repeats access discovery.

## Minimum proposed additive migration delta — not a migration file

Future owned supabase/migrations/YYYYMMDD_captain_enrollment_qualifying_login_v2.sql (date assigned only at authorized implementation) must first reconcile deployed source/ownership/policies/grants/functions/partial objects and abort on unexplained differences. Apply atomically in Non-Production only after exact candidate/tests/founder approval. If25ce not deployed, implement one reconciled additive migration; if partially/present, stop for versioned transition instead of blindly rerun/create/overwrite.

| Existing/candidate object | Exact required successor operation | Safety / abort condition |
|---|---|---|
|public.captain_access|Preserve user_id/display_name/boat_name/access_role/access_status/created/updated; map only existing founder->founder_lifetime and founding->founding_lifetime, all lifetime dates null; add qualified Beta metadata only through narrow routines|Never convert Founding roles, silently approve pending/revoked, usecreated_at as activation or delete data|
|entitlement compatibility constraint / anniversary|Replace first-redemption policy admissibility with an approved versioned qualifying-login rule and qualified proof reference; require complete Beta start/expiry/policy pairs, null notlifetime|UTC civil-year+Feb29 clamp in25ce is proposal, not confirmed business rule; no365-day substitute or incomplete beta acceptance|
|preserve_original_entitlement trigger|Preserve original start/expiry/policy once activated; lifetime immutable through Beta operations, revoke/restore clocks unchanged|Activated legacy beta row requires explicit term-preservation policy; never reset to make migration pass|
|pelora_access.invitations / events|Preserve seven-day business window/idempotency, no bearer token; separate recipient Auth binding and delivery states from grant/activation; append only action/revision/actor/request evidence|Email/provider acknowledgment is not approved grant/activation or exactly-once delivery|
|new narrowly scoped applications|Application workflow separate from early_access_signups marketing consent; minimal private enrollment details, revision/status|Do not convert marketing records into users/grants or copy report contents|
|redeem_beta|Invitation redemption may bind verified principal only; it must not write activated_at/starts_at/expires_at|Do not retain old publicly executable start-trigger path or patch policy label while keeping old behavior|
|activate_first_qualifying_login|Dedicated trusted proof boundary revalidates principal/grant/current status, locks access row, records first event once and term atomically, idempotent replay/conflict denial|No qualified proof adapter exists yet. Never accept client Boolean/time/Auth refresh as first qualifying event|
|has_current_access / owner predicates|Use current DB time, nonanonymous authenticated owner, approved role/type/policy+term; revalidate revocation/expiry on every protected operation|Entitlement always AND owner; no founder broad report access or cached capability authority|

Proposed application states SUBMITTED/UNDER_REVIEW/APPROVED/DECLINED/WITHDRAWN; invitation/grant/activation/delivery remain separate. Each real table/check/routine signature must be produced in a separately authorized implementation candidate; this document is not executable SQL or proof deployed state matches. No new generic entitlement ledger or scheduler is proposed.

## Exact server operation boundary

Future owned files backend/access/captainEnrollmentContract.mjs, enrollmentAuthority.mjs, enrollmentService.mjs and isolated route/test modules only after release. Existing frontend53/0adc contracts unchanged. A new trusted live DTO version must be independently qualified, with explicit translation to presentation; scoped offline validation is not server authority.

| Proposed route/operation | Authoritative decision / transaction | Forbidden client input or inference |
|---|---|---|
|GET /api/captain/enrollment|Verified nonanonymous principal, own row only; original source revision/readAt/term/limited-surface state|No supplied user_id may select another owner; missing Beta term denied current access, notlifetime|
|GET /api/founder/enrollment/capability|Server+DB current approved founder with approved assurance/reauth; exact admin revision|UIrole/JWT cached claim alone cannot grant privilege|
|GET /api/founder/enrollment/applications|Revalidate founder, minimal private contact/workflow rows, exact query/cursor/count semantics and revision boundary|No reports/private ocean history or fake exact totals from array lengths|
|POST approve/decline application|Fresh founder authority, lock target, expectedRevision, requestId+argument replay, append event and new revision atomically|No role/actor/start/expiry/policy/capability permission supplied by client|
|POST invite / resend|DB prepare idempotent recipient operation; outside transaction separately authorized Auth/email operation; short reconciliation commit|No live privileged SDK in browser; no blind resend after timeout or promise of exactly-once email|
|POST redeem/bind invitation|Trusted validated invited-principal correlation; 7-day business expiry using DBtime; no activation|Email/link possession alone not scientific/user-owner/grant authority; no trial reset|
|POST activate first qualifying login|Trusted event adapter proves qualifying login/principal and event vintage; DB lock/revalidation/idempotent first transition consumes proof/reference|Cannot derive first login from a new GET, JWTiat, refresh, created_at, deviceclock, existing preapproval session or arbitrary hash|
|POST revoke / restore|Current founder+expectedRevision, lock target, event/revision atomic; restore original dates only|No restart/pause/extendtrial or founder/founding creation through Beta command|
|GET operation status|Authenticated requester/target scope and exact request/operation identities|UNKNOWN remains unknown while unavailable; no fabricated definite failure/success or automatic new command|

No transaction spans Auth/email/network. Database-only commit and external delivery are separate outcomes. Timeout queries authoritative status first, then exact same-key retry only if permitted; argument conflict and concurrent target revision fail closed. Owner/session/transport replacement cancels presentation, not proof a server operation rolled back. Memory-only0adc resets on port generation, so future live durable reconciliation needs its own approved operation continuity contract before mounting.

## Privilege/RLS and data-preservation proposal

Reconcile auth.uid/auth.jwt helper ownership/search_path and effective role memberships/bypass before any routine delegation. Object owners separate from runtime. PUBLIC/anon cannot execute protected command routines; ordinary authenticated users only narrowly allowed own reads/application/redemption requests with authoritative checks. No direct INSERT/UPDATE/DELETE on role/grant/activation/events/invitations; no broad grants, function replacement or unsafe search_path. Trusted activation proof verifier cannot be replaceable or directly invocable by ordinary clients. Exact runtime role/service credential topology is a gate, not provisioned here. Existing service_role blanket bypass is not a safe substitute for founder authorization.

Private owner tables retain auth.uid()=user_id. Current paid-capability mutation predicates additionally require authoritative entitlement. Expired/revoked users retain only separately defined own authenticated account/history read/export policies, no current intelligence/report mutations, no deletion of stored data. Existing Founder/Founding lifetime/status/pending/revoked mappings unchanged. Founder enrollment administration does not grant broad captain report/history access. Export endpoint/public storage/link/retention design needs owner-scoped authorization; no new export surface assumed operational.

## Preflight, acceptance and genuine founder decisions

Use existing deployed-state plan read-only catalog transaction and privacy-safe aggregates; prior mobile10-row summary only establishes reported noBLOCKED, not full semantic reconciliation. Required evidence: exactcolumns/defaults/CHECKdefinitions/FKs; owner orphan and role/status aggregate; policy expressions/grants/effective privileges; routine owner/search_path/helper semantics; triggers/rules/dependencies/defaultACLs/migrationledger; partial25ce/entitlementobjects and any legacy activated Beta records. No identity/email/report/token output. Exact project target and read-only transaction need separate normal execution approval/tool capability; none used here.

Actual Non-Production Auth SMTP/signup/link/confirmation/provider/rate/reauth configuration remains unknown; public defaults are not actual values. No Supabase configuration connector or credentials used.25–30-person approval/delivery feasibility must include confirmation/reset/resend/retries/concurrent operation accounting; no quota number invented or new mail provider/pricing selected. Real Auth invitation and validated login event cannot be exercised without explicit Auth-action approval.

Before executable successor: Founder confirms authoritative calendar timezone/Feb29 anniversary rule; accepted login-event proof adapter and preapproval-session meaning; founder reauth/assurance requirement; approved Auth delivery method/config; explicit transition for already-activated old Beta records if any. These are precise product/security decisions. No value is chosen here. First-successful-qualifying-login, permanent Founder/Founding access, original-clock restore and no reinvite reset are already locked, not reopened.

Acceptance for future isolatedcandidate: legacy row/status/count unchanged; pending/revoked never silently approved; firstevent once, duplicate/retry/lostACK/revoke/login race; client actor/time/role/expiry ignored/rejected; founder self/nonfounder escalation refused; PUBLIC/defaultgrant denial; wrongowner/accountgen isolation; inactive/expiredbeta cannot mutate/current paid access but ownlimitedread preservesdata; rollback/no partialschema, audit append-onlyrevision determinism; no email token in DBlogs; actual cohortAuthcapacity measured separately. No test executed for this proposal and no full profile rerun. Ready for policy/deployed-state review, NOT migration/service authorization.
