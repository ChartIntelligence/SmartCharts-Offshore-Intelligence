# CP-05 atomic terminal acceptance and least privilege

Scope: isolated `pelora_phase3_qualification` PostgreSQL only. Receipt Writer is disabled. No provider configuration, production, publishing, frontend or science-contract change.

## Authoritative transition

Old unsafe assumption: deferred transaction-end validation remained authoritative until COMMIT. A caller could force the constraint immediate and then commit after lease expiry.

New authoritative rule: PostgreSQL validates and consumes the current fenced claim at an explicit atomic terminal-acceptance transition. `cp02.worker('accept', ...)` delegates to private `cp02.accept_terminal(text,uuid,text)`. The routine locks the authoritative registry and job ownership in the existing global order, then the attempt; checks current job, activation, ownership, attempt, fence, lease using database time, staged immutable references and CP-04 reconciliation; reads fresh time immediately before consuming the claim. It records `ownership.consumed_at` and `released=true`, inserts acceptance, and synchronously creates the CP-03 observation index in the same transaction.

There is no deferred fencing trigger or transaction-end lease check. `cp02.fenced_commit()` and its constraint trigger are removed. An ordinary trigger prohibits subsequent mutation of consumed ownership. Accepted jobs cannot be reclaimed. Matching accepted retries return the original acknowledgement without another transition. Post-accept `check` is a consistency/cancellation guard, not a renewable claim.

Until COMMIT, competing claim/reclaim waits on the same authority locks and accepted lookup cannot see uncommitted artifacts. COMMIT makes the accepted chain and consumption visible together. ROLLBACK restores the prior claim and removes the acceptance/index; immutable intermediate records remain available under CP-04 recovery. Delayed COMMIT after a valid transition is intentional: the lease has already been consumed. An expired claim at the transition is rejected regardless of constraint timing.

For legacy accepted chains, the upgrade validates matching ownership/attempt/fence and backfills consumption from the originally recorded acceptance decision time. It does not invent historical COMMIT times or retroactively assert the old implementation was safe. Exact raw, evidence, binding and observation records remain unchanged, including the retained synthetic P1 reproduction.

## Runtime privileges

Worker `pelora_cp02_worker` is a login role without SUPERUSER, CREATEDB, CREATEROLE, BYPASSRLS, REPLICATION, INHERIT or role memberships. It owns no protected objects. It has CONNECT only to the qualification database, no CREATE/TEMP, and USAGE on `cp02`, `cp03`, `cp04`. Its only application EXECUTE grants are:

- `cp02.worker(text,text,uuid,text,bytea)`
- `cp03.lookup(text)`
- `cp04.inspect(text,uuid)`
- `cp04.worker(text,text,uuid,text,bytea)`

No direct protected-table SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER or MAINTAIN; no sequence rights; no internal-function execution. Privileged routines use fully qualified objects and `search_path=pg_catalog`. The worker cannot alter routines, triggers, constraints, schemas or role authority. PUBLIC execution is revoked from application routines, and owner/admin default privileges deny future PUBLIC/worker grants. The local large-object write/read/file routine surface is denied as unnecessary. Ordinary PostgreSQL built-ins remain available; these four are the application entry points, not an assertion that all built-ins are denied.

`workerPrivilegeManifest.v1.json` pins application signatures, source-body hashes, owners, safe paths, triggers, role attributes and denied privileges. `verifyWorkerPrivileges` fails closed on drift. `cp04.validate_acceptance` also applies existing recovery checkpoint/replay rules to the legacy CP-02 staging/acceptance entry point, so it cannot bypass recovery continuity.

## Qualification and limits

The prior CP-02 test requiring rejection solely because COMMIT occurs after lease expiry is explicitly reconciled: valid atomic consumption commits successfully even after that former lease expires. All other prior contracts remain. CP-05 tests cover immediate/deferred/named constraint timing, expired/stale attempts, competing COMMIT/ROLLBACK reclaim, cancellation rollback, idempotent retry, future-object defaults, forbidden direct mutation/escalation, prepared requests/reconnect, hostile session settings and manifest drift. Full CP-01–CP-04 qualification and a separate real restart verify persistence of exact accepted and pending chains and privileges.

A worker can hold an open transaction and delay competing work after a valid transition; this is an availability limitation, not permission to reclaim an uncommitted consumed claim. No scheduling or automatic timeout architecture is introduced. Migration/admin authority remains a trust root. Qualification uses local synthetic data and does not authorize production rollout or Receipt Writer. CP-06 requires its own mission; it is not started here.
