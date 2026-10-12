# Continuous Observe CURRENTS Phase 3 composition design v1

**PHASE 3 IS NOT IMPLEMENTED OR QUALIFIED.**

Disposition: PHASE 3 COMPOSITION DESIGN READY — proposal only. Receipt Writer remains Phase 4 and disabled; Historical Receipt migration is unapplied in this proposal. No Receipt Writer integration is authorized here.

Reference checkpoint: e65e85d04bb4e0a90e647583ff72854c4008fc29. This document evaluates that exact Phase 2 baseline, not later implementation or qualification on other branches. Its status statements describe this baseline/proposal and do not erase later historical evidence. Phase 1 contracts and Phase 2 isolated worker behavior remain authoritative within their qualified scope. In-memory simulation proves no distributed or PostgreSQL guarantee.

## Source boundary and recommendation

Reviewed backend/observe/currentObservationWorker.mjs, memoryWorkerPorts.mjs, provenance.mjs and their imported contracts at the reference checkpoint. The worker run method is already async, but control.claim, control.check, guard and results.accept are synchronous. Raw retention and pending result writes/readbacks are already awaited. Memory ports explicitly disclaim durability and distributed fencing. createExecution/createBinding and validateBinding establish structural consistency, not a trusted execution witness.

Use Promise-aware durable composition with PostgreSQL-controlled claims and terminal acceptance. A protected wrapper still has to await database authority at the worker's decision points. It cannot preserve the exact meaning of the current synchronous ports by returning a cached claim, Promise disguised as a state object, or provisional acceptance. A local capability may reject cancelled work early, but cannot confer CURRENT authority after revocation, expiry, reclaim, network delay or competing activity.

Do not hold an open database transaction during provider acquisition to simulate a synchronous capability. Do not report ACCEPTED and later publish through a wrapper. Do not serialize only in one process and call that distributed fencing. No synchronous database bridge or blocking busy wait is proposed.

## Minimum future API amendment (not implemented)

- state = snapshot(await control.claim(handle, startedAt)); attempt/fence are allocated or resolved authoritatively by the control composition, not by caller coordinates.
- async guard(): reject local stop, await control.check(handle, observedAt), then reject local stop again and validate unchanged authorization identity. Lease renewal metadata must be separated from immutable context/attempt identity so renewal does not silently mutate the scientific binding or break the existing identity comparison.
- Await guard at every existing pre/post operation check, including inside bounded, transport, raw-retention/readback, normalization-result handoff and pre-accept boundaries. Inspect every original synchronous guard call; changing its definition alone is insufficient.
- Await results.accept(record, expected claim identity). Remove the application authorization callback as final authority. Database must derive acceptance time and current lease validity; client retainedAt is a reported input, never the authority clock. An acknowledgment must expose the original exact immutable record and authoritative acceptance time. Existing retainedAt equality assumptions need explicit characterization and reconciled tests.
- Promise-aware control.release must match job/attempt/fence and cannot release a later claimant or terminal job. Pending cleanup cannot delete immutable or accepted artifacts. A local late completion must not publish after disposal. Cleanup failure must not replace a known committed acceptance with a false rejection.
- Add authoritative accepted-chain lookup plus operation reconciliation. Lost ACK, connection loss or cancellation while acceptance is in flight produces UNKNOWN/PENDING until committed state is resolved. The existing catch/finally behavior must be amended narrowly: network errors are not proof of transaction rollback. A stopped caller may still have a committed acceptance that must be reconciled.
- Port checks return validated data, not unexamined Promise objects. Tests may use existing synchronous fake values through await; this is compatibility of call shape, not fake-port durability qualification.

These changes are required if claim/check/accept become asynchronous, authority can change between awaits, durable acceptance can commit without caller acknowledgment, or cleanup becomes durable. Local-only fake ports retain their historical meaning. No runtime change is made by this document.

## Provisional records, keys and constraints

Names below are conceptual, PROVISIONAL until real PostgreSQL qualification. No DDL/migration is supplied.

| Record | Primary identity and relationships | Major constraints/responsibility |
|---|---|---|
| manifests | Existing manifest reference/digest and exact approved payload | Immutable identity/content; hash is consistency, not approval. Approved registry authority separate from worker. |
| activation_history | Manifest digest, distinct activation/revision identity, effective state/time | Append-only activation history with serialized current head; no retroactive worker authorization or caller activation Boolean. |
| jobs | Existing deterministic Phase 1 jobId; manifest/cell/window reference | Unique logical identity, immutable authorized job context; bounded retries/deadline, current attempt/fence and terminal reference are protected mutable control state. |
| attempts | Existing attempt identity algorithm; jobId, attempt number, fence | Unique (job, attempt number), unique (job, fence), immutable issuance context; lifecycle and lease controlled by routines. No silent attempt-ID algorithm change. |
| raw_responses | Existing responseReference and exact byte sequence | Immutable bytes, digest/length verification, actual provider/dataset metadata association. Same bytes may be reused; content identity does not establish acquisition time or provider authenticity. |
| evidence_captures | Existing CURRENTS V3 evidence reference plus exact captureText | Capture validators authoritative; byte/text exactness preserved separately from indexed fields. No reserialization into lossy JSONB or reconstruction on readback. |
| executions | Existing execution identity/digest and exact contract payload; job/attempt/fence | Immutable requested/received/normalized/finished times, selected provider time, requested/resolved coordinates, response/evidence references and actual source limitations. |
| bindings | Existing binding digest and exact payload; execution/manifest/activation references | Immutable native reference identities; one structural binding never becomes proof of trusted execution merely by storage. |
| accepted_observations | Unique logical jobId and distinct accepted-index identity | One accepted chain per job; references exact execution/binding/capture/raw chain, accepted DB time. Composite relationships prevent cross-job/attempt/fence joins. |
| receipt_state | Explicit absent/not-issued state or nullable reserved reference | No receipt authority, historical-possession claim, writing routine or writer permission. Future receipt linkage requires separate versioned authorization. |

Preserve logical job, attempt, raw response, evidence, execution, binding and observation identities separately. For immutable identities, identical repeat submission is idempotent; different bytes/content at the same identity is integrity failure. Reference FKs, uniqueness, not-null state-specific fields, finite ordered timestamps, positive fence/revision checks and terminal-state consistency support correctness. They do not replace authority validation. Exact scientific serialization must retain signed zero where native contracts do; ordinary JSONB numeric storage is not an exact capture representation.

The minimum mutable durable state is registry activation head, job/claim/lease state and bounded recovery state. No new scheduler, general ledger or publication framework is proposed. NO_DATA, failed, pending and cancelled attempts remain distinct from accepted intelligence; existing no-data semantics need characterization, not invention of accepted no-data observations.

## Claim/fence and revocation lifecycle

Every authority mutation uses consistent locking order: activation authority first, then logical job, then related attempt/artifact state. Revoke must acquire a conflicting activation lock; a final acceptance and revoke serialize so their authoritative ordering is explicit. No transaction upgrades a previously unlocked read into assumed authority.

Claim locks the authorized activation and job, rejects revoked/disabled scope, invalid window/deadline/budget and terminal state, allocates a new fence and distinct attempt, and stores the DB-time lease. Competing claims cannot both become current. A bigint fence increases per committed job claim; rollback may undo an unexposed allocation. Never reuse a successfully issued fence. If future requirements demand monotonicity across rolled-back issuance, choose a sequence explicitly and qualify that different contract. Bigint exhaustion fails closed; no unsafe JavaScript Number coercion or wraparound.

Check/renew reads or locks current authoritative state as needed. A successful check is true at its own transition, not a reservation for later acceptance. Renewal is compare-and-update for the matching current attempt/fence under DB-time deadline and lease rules. Lease validity is evaluated with clock_timestamp after locks are obtained, not transaction-start now(). Exact boundary: expiry equal to decision time is expired. Client clock remains scientific execution metadata, never lease authority.

Release affects only the matching current claim. Stale/revoked/expired claims cannot renew, release a replacement, or accept. Reclaim advances the fence and closes prior ownership. A terminal accepted job is not reclaimable. Revocation during acquisition triggers check failure and best-effort abort; an already-started request may finish, but cannot publish after lost authority. Do not claim revocation can undo bytes already sent externally.

## Short transaction boundaries

1. Claim transaction: activation/job serialization, attempt issuance and lease.
2. Check/renew transaction: authoritative comparison and optional lease update.
3. Revoke/release transaction: protected state transition with matching identities.
4. Raw/evidence/execution/binding retention transactions: immutable insert-or-compare, bounded byte sizes and exact readback. Intermediate artifacts are unaccepted.
5. Terminal acceptance transaction: current authority validation and accepted-index/job terminal transition together.

No transaction spans provider calls, waits/timers, normalization, scientific processing or external network activity. Candidate evidence is computed and validated before entering the final short transaction; durable routines still enforce all referential/content relationships. Database SQL is not presumed to reproduce JavaScript CURRENTS science. Trusted ingestion, artifact validators and runtime write surface must be qualified together before claiming a database routine accepts only valid captures.

## Atomic terminal acceptance

A narrow protected routine must lock authority in the common order; confirm manifest/activation; confirm current attempt/fence/claim ownership; obtain authoritative DB time and validate lease/deadline; confirm nonterminal job; validate exact immutable references and same-job/attempt chain; insert the unique accepted index; mark job/claim terminal and consumed; commit together. Rollback restores nonterminal ownership and publishes no accepted row.

Fencing is validated and consumed at this explicit terminal transition. It must not depend on deferred constraint/trigger timing or SET CONSTRAINTS remaining deferred. Acceptance can be valid at transition even if COMMIT acknowledgment arrives after the consumed lease expires; no later reclaim can overtake its locked terminal transition. A previously committed exact accepted chain can be resolved idempotently without granting an obsolete attempt new mutation authority. A competing different chain is rejected, never rewritten.

Locks, uniqueness and FK consistency must remain correct under caller transaction settings, RLS and client privileges. Avoid permitting arbitrary external transactions to invoke internal mutators out of order. Qualification must establish the actual callable routine surface and transaction ownership.

## Recovery and ambiguous outcomes

Before retrying an uncertain write, query authoritative committed state using exact operation identity/reference. A disconnected caller must not assume rollback. Use one-attempt operation identities and immutable inputs; do not generate a new evidence identity to conceal uncertainty.

| Interruption | Deterministic reconciliation |
|---|---|
| Before durable writes | Obtain current valid authority; retry bounded acquisition at most once per accepted logical job. |
| Raw write ACK lost | Read exact reference; compare bytes/length/digest and source association. Reuse matching content, retry absent content only under allowed current authority. |
| Evidence ACK lost | Read original capture/reference; validate exact capture. Never mint a replacement capture to reconcile. |
| Execution/binding ACK lost | Read original immutable payload and validate context/native references; conflicts fail closed. |
| Final acceptance ACK lost | Query unique accepted index and terminal state first. Exact matching chain returns prior acceptance; absence permits retry only with current authority; conflicting chain fails closed. |
| Database unavailable | UNKNOWN/PENDING; later reconcile. No fabricated ACCEPTED or definitive rollback/rejection. |
| Database/process restart | Rediscover persisted job/attempt states and exact artifacts; expired claim needs reclaim; terminal jobs resolve without reacquisition. |
| Stale completion after reclaim | Reject accepted publication regardless of intermediate retention; unaccepted artifacts stay out of accepted/current lookup. |

Cross-attempt recovery must preserve the old execution/binding identity. Reuse raw/capture where exact and valid, but do not relabel old binding as new claimant execution. If accepting an old immutable chain under a recovery claim is required, a separately explicit reconciliation authorization must bind current recovering claim to original producer attempt without changing native records. Until that compatibility contract is qualified, stop unresolved recovery rather than create inconsistent evidence. Pending/recoverable/accepted/integrity-failed are operational resolution states, not scientific completeness or freshness.

Actual retention/acceptance times remain actual. Neither old source time nor a digest proves earlier possession. No receipt means no invented historical receipt authority. Archived/unaccepted observations cannot masquerade as current intelligence.

## Least-privilege proposal

Runtime role is non-owner, non-superuser, no CREATEDB/CREATEROLE/REPLICATION/BYPASSRLS, no protected-schema CREATE, no arbitrary table DML, no UPDATE/DELETE on immutable artifacts and no trigger/routine replacement. Grant only reviewed runtime procedure execution and bounded read paths. PUBLIC execution revoked. Privileged routines use safe fixed search paths, qualified object names, trusted ownership and minimal authority. No captain/private application table access or Receipt Writer privileges. Migration/registry administration remains separate. No roles are provisioned here.

## Implementation order and real-PostgreSQL gates

First implement the minimal Promise-aware port/guard/cleanup/outcome amendment with independent characterization of every original Phase 1/2 boundary and fake-port compatibility. Then implement isolated registry/job/claim authority, immutable artifacts, atomic acceptance, reconciliation and restart recovery in dependency order. No production migration or operational activation follows from this proposal.

Required real PostgreSQL qualification (not executed):
- Two concurrent claims: one current owner, deterministic committed fence ordering.
- Reclaim/renew/release: new fence strictly advances; stale identities cannot alter successor state.
- Before/equal/after lease expiry using DB time, including lock wait crossing expiry and mismatched client clocks.
- Revocation during acquisition and acceptance racing revoke/reclaim: serialized valid terminal transition only.
- Duplicate immutable inserts: identical success; conflicting identity/content denied under concurrent submissions.
- Raw/capture/execution/binding exact roundtrip including native references and signed zero.
- Crash at each retention boundary and before/after acceptance; only accepted index is surfaced.
- Lost ACK for each write; authoritative query before replay; matching prior acceptance idempotent.
- Rollback of acceptance restores recoverable nonterminal state; SET CONSTRAINTS timing cannot change fencing correctness.
- Database restart persists claims/artifacts/accepted chain; process restart reconciles original identities without recollecting silently.
- Database unavailable keeps UNKNOWN/PENDING visible; cleanup failure does not rewrite known acceptance.
- Restricted-role direct DML/DDL/function replacement/admin denial, PUBLIC execution denial and trusted ingestion tamper checks.
- Server-controlled manifest/cell scope only; no captain/user/session/viewport/report coordinates reach acquisition or job authority.
- Existing Phase 1/2 suites pass or exact authorized async acknowledgment/cleanup semantic differences are explicitly reconciled.

## Unresolved implementation risks and checkpoint

Lease duration/renewal cadence and deadline interaction require approved bounded configuration, not invented defaults. Validate activation-lock contention/deadlock order, statement/lock timeouts, bigint transport, exact timestamp/serialization compatibility, outcome handling during cancellation, authority/reference validation inside permitted routines, cross-attempt recovery linkage and NO_DATA lifecycle. Garbage collection of immutable unaccepted artifacts is outside this design; do not erase recovery evidence to simplify storage.

Review performed against source only. No tests, fixtures, database connections, schema/migrations, role provisioning, provider calls, Supabase, Render, production, runtime edits or Phase 4 work occurred. This documentation commit does not extend any qualification. Existing source checkouts and unrelated files were preserved. Exact next step when PostgreSQL is available: separately authorize and characterize the Promise-aware worker composition amendment, then qualify the durable claim/terminal transition under real database concurrency before operational use.
