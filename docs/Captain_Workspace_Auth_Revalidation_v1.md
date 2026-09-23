# Captain Workspace Auth Revalidation v1

Previously, a replacement Supabase user object reran the access effect, which
cleared approval and showed loading UI. This unmounted the startup/Dashboard
subtree and could reset tabs and unsaved Fishing Log state during session recovery.

The access gate binds approval to the authenticated, non-anonymous principal ID.
A newly allocated session/user object triggers an access lookup without discarding
that same principal's existing approval while the request is pending. The current
session continues into PeloraStartupFlow and Dashboard; credentials are not frozen.

| Authorization state | Protected workspace |
| --- | --- |
| Initial lookup pending | Unavailable |
| Same approved principal, revalidation pending | Remains mounted |
| Same principal, approved result | Remains mounted |
| Lookup error (including rejected request) | Removed, existing error path |
| Pending/revoked/missing/non-approved result | Removed |
| Sign-out, missing credential, anonymous session | Removed immediately |
| Principal changes | Prior workspace removed; new authorization required |

Approval is checked against the current principal at render time, before effects
run. Lookup cleanup ignores superseded results. Returned records must belong to
the requested principal. The startup subtree is keyed by principal, not by session
or access-record object identity. The normal initial splash remains unchanged.

This is pending-request continuity, not an offline authorization cache. There is
no error grace period, retry policy, approval timeout, or persistent draft storage.
An actual failed access lookup is fail-closed even after prior approval. Existing
Supabase authentication, captain_access lookup and RLS remain authoritative.

## Verification boundary

The lifecycle tests run the actual gate and hook using React DOM reconciliation
with a minimal in-memory DOM host. A stateful startup/Dashboard fixture models tab
and modal ownership; the actual FishingDayReportPanel maintains the unsaved notes.
Its unrelated temporal-control presentation is stubbed. Tests assert mount counts,
Reports selection, open log, draft retention, refreshed session propagation, initial
blocking, denials/errors, principal isolation and stale response cancellation.
No database or provider is contacted. These are not physical-iPhone/browser-layout
tests; foreground recovery is represented by replacement session/user objects.

Mission-edit continuity, normal tab-child lifecycles, browser/process eviction,
full document reloads and error boundaries remain separate issues. This change
does not protect drafts after authorization ends or the document is destroyed.
No species logic, evidence contract, database schema, report persistence or
production telemetry is changed. Infrastructure remains species-neutral.

No deployment or migration is part of this work. The existing Task 8D deployment
restriction still applies until its evidence_capture migration is deliberately
applied and verified in the intended environment.
