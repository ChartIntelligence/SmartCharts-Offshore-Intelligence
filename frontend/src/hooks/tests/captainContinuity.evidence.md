# PELORA-02 Captain Workspace Continuity + Fishing Draft Recovery v1

## Identity / authority

Worktree: C:\Projects\Pelora-Agent-Worktrees\pelora-02-captain-continuity-v1
Branch: codex/pelora-02-captain-continuity-v1
Exact accepted starting SHA: 789de11a6aedd50e6e3a8dcf366d4d662f4dc4f5
New checkout verified clean before editing. Original captain-experience checkout remains clean at a8a17cbed53ba7f8c722d9c79eb962964e339577; no source, branch, dependency or environment modification there. Its earlier approved test dependencies are used read-only, never copied. No duplicate agent/session was launched.

Human authority: continuity packet authorized in this chat; local isolated execution explicitly approved. The selection conflict was resolved by explicit Option 1 confirmation: preserve authoritative absence/zero/context/terminal-failure invalidation and forbid automatic reselection after terminal failure. Root router, execution board, prior mission/state governance and current state owners were inspected. Existing temporal/spatial capture remains read-only contract authority.

## Persistence model / storage

Browser localStorage keys:

    pelora.continuity.v1:<encodeURIComponent(authenticated user id)>:workspace
    pelora.continuity.v1:<encodeURIComponent(authenticated user id)>:mission
    pelora.continuity.v1:<encodeURIComponent(authenticated user id)>:fishing-draft

Versioned envelope: {version:'pelora-captain-continuity-v1',owner,revision,value}. Reads verify version, exact owner, bounded record size and consumer schema; unavailable/corrupt storage falls back to safe defaults and displays a recovery notice. Writes are synchronous on each form/state edit, without debounce, unload-only saving or provider calls. Write failures preserve in-memory edits and show a device-save warning. Per-record limit is 1,048,576 UTF-16 code units, a device-persistence guard only.

Workspace is the single React state owner for active destination (today/map/intelligence/reports/profile), enabled layer booleans, map camera (center/zoom/bearing), Place identity, context-bound Opportunity identity, sheet expansion and report-panel visibility. No token, permission, score, confidence, narrative, field payload or scientific Opportunity snapshot is serialized. Opportunity identity/context stays within the existing selection owner; no tombstones or competing selection state. Place restores from the current Places list; absent Place clears only its intent. Opportunity resolves exclusively from the current governed collection/context.

Current Trip uses the unchanged normalization/species/spatial mission contract under a per-account key. The old unowned pelora.tripMission.v1 record is deliberately not adopted or deleted: it cannot safely be attributed to any account. Captains may need to enter Current Trip once on upgrade.

Camera snapshots save after moveend and on pagehide/visibilitychange. A restored selection can resolve after loading; its saved camera is reapplied once after ordinary selection effects. Later explicit selections retain existing recentering behavior. Camera continuity is bypassed for founder QA sample/synthetic review modes. Field acquisition, field lifecycle, contours and selection-recenter hooks are untouched.

## Account isolation / selection governance

Existing authenticated approved-founder gate remains the access authority, including owner/role/status checks and principal-keyed workspace mounts. Stored UI state cannot grant admission. Anonymous/signed-out hooks read/write no account data. Owner changes rerender before former-owner children commit; stale handlers and unmounted/asynchronously completed saves cannot mutate the next account. Observed logout/account change/terminal access denial clears prior account selection intent while retaining its other workspace settings, mission and draft. Same-owner token renewal preserves work, subject to authoritative selection validity.

Loading retains intent and the sheet expansion. The sheet shows only a neutral Refreshing current governed evidence message while the current collection is unavailable during loading; stale evidence is not rendered or restored into the map. Successful same-ID refresh resolves fresh content. Successful absence, governed-zero, context invalidation and active terminal failure with no collection durably remove Opportunity intent. Later retry cannot resurrect it; explicit reselection remains required.

## Fishing draft lifecycle

The full existing form progress is saved automatically: report fields (including original date/time-basis fields and species counters), selected areas and entered locations, incomplete manual-location text/certainty, and area-search text. Partial inputs are retained without scientific coercion; submit still invokes the existing temporal/spatial evidence capture and original private report insertion envelope. Omission confirmation and isSaving are transient and never restored as permission to submit.

Close, tab changes, background refresh and app switching do not clear the draft. Reload/process restoration recovers it and the stored panel-open state. Successful save deletes only the exact submitted local revision and resets the in-memory form if still current. Edits made during an outstanding save and newer revisions from another instance remain. Failure preserves the draft; no retry drops its evidence envelope. A late account-A completion cannot clear account-B work or alert account B.

## Exact changed files / tested Git blob identities

| File | Candidate Git blob |
|---|---|
| frontend/src/utils/captainContinuity.js | 825080c7dabdb12a35e70a3ca0fcf301bd5cd109 |
| frontend/src/hooks/useCaptainContinuity.js | 57d127809556f81c82809003f4e209ca2e6941d8 |
| frontend/src/hooks/useMapCameraContinuity.js | 3b6ff4939e648c745e3b369e345297c4fb5d0b8b |
| frontend/src/hooks/useTripMission.js | d8318b60c7802df68e7bc6b913274192a18fd9f9 |
| frontend/src/components/Dashboard.jsx | d20e17b10827d8d55cebbee97f70688704f9733a |
| frontend/src/components/FishingDayReportPanel.jsx | 44407bc90043fc08c1b352d7ccc533b4411abb7b |
| frontend/src/components/FoundingCaptainAccessGate.jsx | 4743ef584d40ab6e24e45d138c56bc71bff44bdd |
| frontend/src/components/PeloraStartupFlow.jsx | 8846f7e4ade62795132513b3d68b541dd4c93ba3 |
| frontend/src/components/SelectedTarget.jsx | 6e3a339f311137932e9823578e41fa4c88e223c4 |
| frontend/src/components/MapLibreIntelligenceMap.jsx | 9481a7e0c48384fb28f8e745609bebc41e693057 |
| frontend/src/hooks/tests/captainContinuity.test.js | 3842b0bf3748ba969653f1b32bdc11102e65d0d9 |
| frontend/src/hooks/tests/captainContinuityRegression.test.js | 559e41ba18ed69ecf1adc37c5e52a75fb2d3158c |
| frontend/src/hooks/tests/captainContinuityProcess.test.js | cafcb9a476e466e8d2a6ff1ca45efd5584bf9a56 |
| frontend/src/hooks/tests/captainContinuity.evidence.md | This evidence record |

## Controlled qualification

Runtime: Node v24.18.0; existing React/React DOM 19.2.7, rolldown 1.1.5, @js-temporal/polyfill 0.5.1. These match the candidate committed lockfile. Tests accept the existing runtime path explicitly, with scoped Node resolution for the shared temporal contract; no installs, package/config changes, node_modules copies, .env or credentials. All account/storage/provider fixtures are synthetic.

From candidate repository root:

    node frontend/src/hooks/tests/captainContinuity.test.js C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules

29/29 passed; no failures/skips/cancellations. Actual React reconciliation of Dashboard, Today, Intelligence, SelectedTarget, Report, Saved Reports and the private access gate, using a minimal DOM host and controlled transports. Actual map component is rendered with its unrelated scientific/map-runtime hooks stubbed, to verify hook order and QA camera bypass. Checks include same-user remount/restart-byte recovery, desktop/mobile matchMedia branches, layers/camera/bearing/sheet, valid/absent Place, authoritative Opportunity lifecycle, partial form/location recovery, successful cleanup, submit failure, outstanding-save newer edits, cross-account stale handler/async completion, private/anonymous/denied/logout/reauth behavior, corruption/schema fallback, storage quota notice, credential/evidence exclusion, neutral loading sheet, independent Home/Map/Intelligence/Reports navigation, and no controlled render errors.

    node frontend/src/hooks/tests/captainContinuityRegression.test.js C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules

19/19 selected original captain-state assertions passed. Dedicated adapter leaves original suites untouched: adds actual continuity/recovery dependencies to their import-stripping VM; gives the synthetic Place fixture a current Places entry; clears the map spy on account-driven unmount while retaining navigation assertions. Includes terminal failure/retry non-resurrection, all four request success/failure races, loading-only refresh, governed-zero, rapid/context/logout, rank/evidence refresh, manual close, species/origin/range/principal invalidation and desktop/mobile recenter behavior. It does not count stubbed Intelligence as actual-child acceptance.

Two independent process invocations, synthetic disk-backed device-storage bytes:

    node frontend/src/hooks/tests/captainContinuityProcess.test.js save "$env:TEMP\pelora-continuity-synthetic-restart-v1.json" C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules
    node frontend/src/hooks/tests/captainContinuityProcess.test.js load "$env:TEMP\pelora-continuity-synthetic-restart-v1.json" C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules

Both passed. A fresh process restores the exact synthetic workspace and full partial draft generated by the actual report initializer, validated by the production schema; another account receives nothing. This is process-restart simulation, not a killed real browser or physical Photos application test.

Static: all ten affected executable production files parse with rolldown JSX transform. git diff --check clean. Strict scoped ESLint passes utility, persistence/camera/mission hooks, Report, access gate and map component. Full touched-file lint retains three react-hooks/set-state-in-effect findings in Dashboard observation clock, Startup flow and the SelectedTarget legacy fallback. Baseline replay confirms the same inherited patterns (five findings at baseline); no new lint finding remains. All touched files pass with only that rule disabled for this check; repository config is unchanged. Initial test seam/export/prototype issues and a misplaced camera-hook insertion were corrected before final replay, with actual map rerender tests added.

## Protected behavior / integration risks / remaining QA

All source outside the fourteen listed paths is unchanged from the accepted base. Protected blobs:
- backend/server.js: cc2c7d26c0a3e59e5c8d8a2ca89429f34edab1f7
- useDynamicOpportunities.js: ae8f5aa4da7e6aba0653afdb9bad0a67d88d790e
- useMapLibreOceanFields.js: fb54536a9170b79d774803a21f57539ed2bb83ce
- useMapLibreSetup.js: ef091e88c97a72ab307b01e49bccef530fa33f95
- oceanFieldPresentation.js: d478abcd287c1d4c063e9ac163244b4388e1aa29

No changes to bathymetry/current science, P03 contour logic, eligibility/ranking, background data authority, backend, shared scientific contracts, schemas, RLS, dependencies, styles or production. No real Auth/provider/database calls, migrations, merge or deployment.

Remaining founder/browser/mobile QA: real browser reload and forced process kill, iOS/Android Photos/background suspension, touch/keyboard/camera interaction, responsive layout/accessibility, device quota/private-mode/storage clearing, live auth expiry and cross-tab logout. MatchMedia/minimal DOM assertions are not physical mobile/layout acceptance. Startup/import-time Supabase configuration failures remain outside this packet; controlled navigation is not production black-screen qualification.

Persistence is device/origin/browser-profile local, not cloud/device synchronization or encryption. Clearing browser data/private-session teardown can remove drafts. Simultaneous tabs use last-write-wins for edits; revision checking prevents deleting a newer draft after an older save but does not merge edits. A crash after remote report insertion and before local cleanup can leave a recoverable submitted draft; schema/idempotency changes are outside scope, so captains should check Saved Reports before resubmitting uncertain outcomes. Large drafts or blocked storage show warnings and cannot be claimed durably saved. Existing lint findings and legacy mission reentry remain integration considerations.

Candidate commit and exact verified remote SHA are reported separately after the authorized single-branch push. Stop for independent review/integration; no merge/deployment or full beta readiness claim.
