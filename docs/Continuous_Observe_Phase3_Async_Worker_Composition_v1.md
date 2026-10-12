# Phase 3 minimal Promise-aware worker composition amendment v1

PHASE 3 ASYNC WORKER COMPOSITION READY — memory/fake ports only. Durable PostgreSQL Phase 3 is NOT implemented or qualified. Receipt Writer remains disabled and out of scope.

Base/parent: 54aa99277a988c9d0f46a44472a43573f3b34a70; runtime baseline e65e85d04bb4e0a90e647583ff72854c4008fc29. Isolated branch codex/pelora-phase3-async-worker-v1, C:/Projects/Pelora-Agent-Worktrees/pelora-phase3-async-worker-v1. Original source/design checkouts preserved.

## Exact amendment

currentObservationWorker.mjs awaits claim/check, makes guard async, awaits every original guard boundary and rechecks local cancellation after the ownership await. Acceptance awaits results.accept(record,{handle,attempt},reportedRetainedAt); no caller callback grants acceptance. Exact acknowledged/reconciled record and finite ordered acceptance time are required. The fake result store is constructed with its trusted synchronous fake control authority; it checks current job/attempt/fence atomically within its own synchronous acceptance turn. This is not an async-authority database implementation.

If accept throws or reports anything other than ACKNOWLEDGED, the worker performs one readAccepted(jobId) lookup before taking further action. Matching committed bytes return ACCEPTED/reconciled. Missing/unreadable/conflicting outcomes return UNKNOWN, accepted:false (not affirmative rejection or proof of absence). A caller must inspect status; accepted:false on UNKNOWN means acceptance is not established to this caller, not that a transaction certainly failed. No acceptance replay occurs in this invocation. A known ACK with invalid payload likewise cannot become ACCEPTED.

Cancellation during an acceptance call does not manufacture rollback. Matching committed acceptance is returned even when the caller cancellation arrived after commit. Once acceptance starts, pending artifacts are not discarded automatically. Preaccept fake pending cleanup remains isolated from accepted records. Release receives matching attempt/fence; stale release cannot affect a successor. Cleanup is awaited; failures return cleanup:PENDING without erasing the known main outcome. Port calls must settle or enforce their own bounded transport/transaction deadlines; this packet does not implement DB timeouts, detached commit tracking or restart orchestration. A permanently hanging claim/check/accept/reconciliation/release port remains a future composition responsibility, not a qualified bounded DB path.

The original acknowledged result shape/scientific record is preserved for ordinary synchronous fake execution. Two explicitly authorized contract changes: acceptance time is validated as ordered authoritative port output rather than requiring equality with the caller's proposed time; ambiguous acceptance now returns UNKNOWN rather than definite REJECTED/STOPPED. Existing structural/scientific/reference validators and acquisition/privacy/job inputs are unchanged. Lease renewal has no new metadata in this fake state; future renewable lease payload separation still requires qualification.

memoryWorkerPorts.mjs changes only result-store composition/claim identity validation and conditional release. Existing claim/check/accept/release may remain synchronous and are consumed through await; legacy acceptance callback signature is intentionally replaced, not supported as durable authority. Test harness wires trusted fake control into the result store and increases deterministic microtask draining 80 to 200 for the extra awaits. No timers/scientific expectations were relaxed.

## Characterization and qualification

Commands from isolated workspace, Node v24.18.0:

    node --test backend/tests/continuousObserveContracts.test.mjs backend/tests/currentObservationWorker.test.mjs
    node --test backend/tests/asyncCurrentObservationWorker.test.mjs
    node --test backend/tests/continuousObserveContracts.test.mjs backend/tests/currentObservationWorker.test.mjs backend/tests/asyncCurrentObservationWorker.test.mjs
    node --check <each of the four changed JS/mjs files>
    git diff --check

Unchanged baseline: 184/184 PASS. Same original two suites after amendment: 184/184 PASS. Focused new suite: 15/15 PASS. Final combined profile: 199/199 PASS, zero failures/skips/cancellations. Syntax and whitespace PASS. The counts overlap; they are not summed into a larger total.

New cases: async-port exact equivalence with sync fake output; unsettled claim blocks acquisition; cancellation after async check; stale ownership; committed lost ACK by throw/UNCERTAIN/cancellation; missing/outage/conflicting reconciliation; delayed acceptance rejecting replacement ownership; awaited matching cleanup; cleanup failure preserving accepted state; failed discard explicit pending; stale release cannot revoke successor. Existing cases preserve revocation/new fence during acquisition, timeout/late completion, no-data, malformed raw/capture/reference, exact bytes, signed-zero-related scientific contracts, identity/privacy, and late pending write cleanup.

Actual command outputs retained locally: C:/Users/User/Documents/Codex/phase3-async-baseline.log, phase3-async-candidate.log, phase3-async-focused.log and phase3-async-final.log. They are offline fake-port evidence, not PostgreSQL or provider evidence.

Tested SHA-256:
- backend/observe/currentObservationWorker.mjs: 084629c07f2e586583c6ba53bc89a5e8aef141b8e78001502e31146f92162d04
- backend/observe/memoryWorkerPorts.mjs: 4309d45bb956be654724dfedd7eff3b39a3c62f36450fb24d8b744c4b4113c9a
- backend/tests/fixtures/currentObservationWorkerFixture.mjs: 330083a9d757060b308f21e4a26e2effd71600dedbb7bf526469121dd252a018
- backend/tests/asyncCurrentObservationWorker.test.mjs: 6d9cb7b6e79dae54378ae1742d130a51e64273b5d4d4238736cf3f1e5f842b44

## Limits and next gate

No DB ports, schema/migrations, distributed lease/terminal state, recovery scheduler, activation, Receipt Writer, provider calls, Supabase/Render/production config or deployment. Fake memory pending deletion is not permission to delete immutable durable evidence. Fake control can still issue new attempts after a previously accepted job; at-most-one fake result is preserved by its result store, but a PostgreSQL terminal/nonreclaimable job is not implemented here.

Next separately authorized work: implement isolated durable authority and atomic terminal acceptance with database-time leases, unique terminal job/index and least-privilege routines, then qualify claim/acceptance uncertainty, concurrent fencing, timing/revocation/rollback/restart, and immutable artifact reconciliation in real PostgreSQL. This packet qualifies only the minimal async worker composition prerequisite.
