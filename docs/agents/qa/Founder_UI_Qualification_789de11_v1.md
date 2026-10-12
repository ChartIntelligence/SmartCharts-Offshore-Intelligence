# PELORA-04 founder acceptance preparation evidence

Current founder physical/browser QA target: `f871e9db0979f1140bd12964a7824666af9466a4`.
Historical independently tested source: `789de11a6aedd50e6e3a8dcf366d4d662f4dc4f5`. Historical filename retained; those execution results are not new-candidate reruns.
QA workspace: `C:\Projects\Pelora-Agent-Worktrees\pelora-04-qa-release`.
Isolated documentation branch: `codex/pelora-04-founder-qa-package-v1`.
Checklist: [Founder UI acceptance](Founder_UI_Acceptance_789de11_v1.md).

## Confirmed preview prerequisite

Founder/operator confirmation: no verified approved non-production `VITE_PELORA_API_BASE`; backend existence and project binding are unverified. The frontend's approved non-production Supabase project is insufficient to identify a backend. Founder browser preview is BLOCKED pending explicit backend identification and verified non-production pairing, in addition to pending visual/device acceptance. No production fallback, repeated endpoint searches, backend launch/deployment, installs or new secrets are authorized. Offline exact-candidate QA can continue. This prerequisite update records no newly executed test or founder acceptance and does not retarget the checklist to an unqualified packet.

## Current continuity integration update

Read exact-commit `docs/agents/integration/PELORA_Captain_Continuity_Integration_v1.md`, `frontend/src/hooks/tests/captainContinuity.evidence.md` and `frontend/src/utils/captainContinuity.js` at the new target. Its parent is exactly the historical accepted bathymetry baseline above. The integration record identifies P02 source `a17e65c23600418c69294a8e2071636898bf4948`, fourteen matched delta paths and unchanged P03 application blobs. This documentation update does not alter or check out the new application source and does not independently rerun its tests.

Recorded integrator evidence for the new candidate: continuity 29/29, selected continuity regressions 19/19, separate synthetic save/load Node processes passed; controlled contour/texture renders passed with no outgoing requests/map errors. Recovery assertions pass 55/55 only with the new actual continuity dependencies injected into the original VM harness; the unadapted import-stripping test initially fails `useCaptainContinuity is not defined`. Do not transfer the historical direct 55/55 command result below to this candidate. Inherited lint findings, documentary backend-wrapper exclusions and physical acceptance limits remain recorded, not silently repaired or counted as passes.

Workspace continuity stores account-scoped UI intent, not tokens, permission or scientific snapshots. Camera captures center/zoom/bearing; active destination, layers, mission, sheet/report-panel intent and partial draft are restored only within authenticated authority. Opportunity identity is revalidated against the current governed collection; terminal invalidation durably clears it. Current Trip legacy unowned storage is not adopted. Failed submission retains the draft; successful submission clears only the submitted revision, preserving newer edits and other-account work.

Draft storage is device/origin/profile-local and unencrypted, not backup or device synchronization. Concurrent edits are last-write-wins. A crash after remote insertion but before local cleanup may retain a submitted draft; this supplies no server idempotency. Check Saved Reports before retrying an uncertain submission. Quota/corrupt/unavailable storage may prevent recovery and should expose a warning. No real submission, Auth expiry, account switch, browser termination or Photos switching was executed in this update.

The expanded checklist preserves rows 1–12 and adds C1–C13 for same destination, camera/layers/mission, valid-selection restoration and terminal non-resurrection, partial drafts and revision-aware submission, account isolation, reload/process/app switching, live reauthentication, reports after recovery and mobile layout/touch. Database writes/second-account fixtures/failure seams need separate authorization or provisioning; absent prerequisites remain NOT TESTED. Physical iPhone acceptance still requires the permanent Founder QA preview serving the exact new target. Integrated/automated qualification is not founder acceptance, BETA READY, production or deployment authorization.

## Source characterization

Read the candidate integration record, Dashboard, LayerControls, SelectedTarget, SavedFishingDayReports, FoundingCaptainAccessGate, contour presentation and mobile CSS. This is acceptance preparation, not another broad source/science audit. The accepted vNEXT integration intentionally removes Source & Evidence Details from field controls; internal field metadata remains untouched. No canvas raw telemetry/disclosure should be expected in this checklist.

Dashboard owns tabs and selected Opportunity context. Selection resolves against the current governed collection; mission/account changes, disappearance or terminal evaluation failure can clear it. Places are separate manual selections. IntelligenceRecovery wraps the analysis rather than the complete Dashboard. Map unmount/remount on navigation is legitimate. SelectedTarget starts in peek mode, expands with More Map Intelligence, collapses with Show Less and resets expansion on identity change; Open Full Analysis is a Today action, while selected-target Intelligence navigation is offered only when appropriate.

CSS includes <=700px sheet/control layouts and safe-area handling, distinct marker stacking and MapLibre control placement. Source intent is not proof against real label/marker overlap, iOS toolbar/keyboard occlusion or touch failures. MapLibre contour relief slots remain subordinate to geographic/context layers, currents and Opportunity markers. The new 176 display-level allocation and density rules add source-supported shallow detail without increasing source resolution. Static intersecting refresh may retain its original supported geometry/identity; disjoint contexts clear. Valid-cell status alone is not visible map qualification.

SavedFishingDayReports derives a nonanonymous owner from the current user, masks prior-owner rows, clears expansion on reload and filters rows by owner. Full populated-report UI/RLS behavior was not independently executed here. Access gate uses normal magic-link sign-in to the current origin; initial approval, pending refresh, denial and principal changes need the separately identified authentication checks.

## Qualification separation

**Recorded developer/integrator qualification:** `docs/agents/integration/PELORA_Bathymetry_vNEXT_Integration_v1.md` records its own source/hook/render passes, metadata 19/19, recovery 55/55 and broader captain replay 66/71 on both unchanged base and candidate. Those five documentary-backend failures are recorded harness exclusions, not passes or new candidate defects. No developer output is relabeled independent QA.

**Historical independent controlled PELORA-04 repeats on 789de11:** all following passing commands returned exit 0 using that QA workspace's existing frontend dependencies. Node v24.18.0; React/React DOM 19.2.7, rolldown 1.1.5, MapLibre 5.24.0. No installs, dependency copying, source/test modifications or live services. These were not rerun on f871e9db in this documentation update.

| Actual command | Result |
|---|---|
| `node frontend/src/hooks/tests/mapMetadataCleanup.test.js C:/Projects/Pelora-Agent-Worktrees/pelora-04-qa-release/frontend/node_modules` | 19/19 passed, including actual controls and JSX parsing; disclosures absent, internal state immutable. |
| `node frontend/src/hooks/tests/useMapLibreOceanFields.test.js` | Assertion-completion PASS: both toggle directions, no-movement recovery, static camera deduplication, intersecting continuity, disjoint clearing, malformed/obsolete/disposed rejection, texture failure locality and cleanup. No invented case count. |
| `node frontend/src/utils/tests/bathymetryContours.test.js` | Assertion-completion PASS: shallow source levels, geometry/support/units/zoom/collision and complexity guard. Concurrent desktop 1600-cell median 19.35 ms, max 32.93 ms; repeated regeneration median 15.78 ms, max 26.55 ms. Not a phone benchmark. |
| `node --test --test-isolation=none frontend/src/hooks/tests/intelligenceRecovery.test.js` | 55/55 passed. Actual analysis children and Dashboard entry/recovery behavior; synthetic DOM host, not physical events/layout. |
| `node --test --test-isolation=none --test-name-pattern="Dashboard\|request race\|rapid A/B/C\|rapid same-ID\|removed identity\|manual exploration\|map selection\|Opportunity hook" frontend/src/hooks/tests/intelligenceCaptainStateRegression.test.js` | 17/17 selected cases passed. Exact selection only, not full-suite qualification. |

**Historical independent desktop browser emulation on 789de11:** both existing scripts passed, exit 0. Set `PELORA_BROWSER_TEST_NODE_MODULES` to `C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules`, `PELORA_CONTOUR_BASELINE=0`, and `PELORA_CONTOUR_RENDER_OUTPUT` to the evidence directory below; then run:

```text
node frontend/src/hooks/tests/bathymetryContoursRender.test.mjs
node frontend/src/hooks/tests/mapIntelligenceCleanupRender.test.mjs C:/Projects/Pelora-Agent-Worktrees/pelora-04-qa-release/frontend/node_modules
```

Existing headless Edge, MapLibre 5.24.0 and bundled Playwright. Synthetic field transport, empty geography, offline routing/service-worker blocking; contour labels use local fallback glyphs. Controls test mounts real React with synthetic states and excludes external font imports. Neither mounts the entire authenticated app. No production/provider/Auth/database traffic.

Actual contour evidence: 14 broad queried features, five regional labels, 37 regional minor features; 20 sampled held-refresh continuity frames. Both 1000px and 390px widths had 40 sampled pan frames without a loading flash. Shallow eligible lines at zoom 7/9/11 were 1/9/19 in both widths. Zero external network attempts, map errors or page errors. Sampled desktop frames do not establish every frame or device performance.

Controls evidence: independent toggles, no disclosures/raw internal metadata, unchanged internal evidence; control bounds fit 1000px and 390px widths. No page errors/network attempts. This does not exercise bottom sheet, complete mobile control stacking, live collision geography, Safari/iPhone GPU or authenticated Saved Reports.

Actual generated reports/screenshots retained locally (not reconstructed):
- `C:/Users/User/AppData/Local/Temp/pelora04-founder-789de11-contours`
- `C:/Users/User/AppData/Local/Temp/pelora-vnext-controls-ou2itX`

## Failure/exclusion and remaining acceptance

Attempted `node --test --test-isolation=none frontend/src/hooks/tests/captainAccessLifecycle.test.js`: exit 1 before its cases execute, `ERR_MODULE_NOT_FOUND` for `@js-temporal/polyfill` from `shared/fishingLogTemporalEvidence.mjs`. Classified as the previously documented root dependency-resolution limitation, not evidence of a candidate behavior regression. No installation, loader workaround or dependency-layout change was made. Auth lifecycle execution remains BLOCKED in this environment; not counted as passed.

No candidate behavior regression was identified in the executed checks. Full 71-case captain replay was not rerun; its five recorded backend data-URL import cases remain excluded. Native events, complete authenticated app/startup, actual ETOPO shallow/mid/deep geography, reports content, label/marker collisions, full sheet/control stacking, live states and physical phone performance are NOT TESTED here. Browser emulation and developer evidence do not establish physical-device founder acceptance. Startup Supabase failure recovery, production, source admission and CP-10 remain separate.

No preview was deployed or launched for preparation or this update. Permanent preview availability is a prerequisite for founder execution, not a blocker to checklist readiness. The original two-document package was checkpointed at `f4fdb85f2e3dcf82bafcbc86709e3f90ad6a9a85`. This update changes only those two documents on the same isolated PELORA-04 branch, whose application source remains the historical baseline; the founder preview must instead be verified against f871e9db. Documentation-only commit/push is authorized. No application/test/dependency/existing-canon, merge, database/configuration or science-policy change.
