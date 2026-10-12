# PELORA-04 founder acceptance preparation evidence

Target/tested HEAD: `789de11a6aedd50e6e3a8dcf366d4d662f4dc4f5`.
QA workspace: `C:\Projects\Pelora-Agent-Worktrees\pelora-04-qa-release`.
Isolated documentation branch: `codex/pelora-04-founder-qa-package-v1`.
Checklist: [Founder UI acceptance](Founder_UI_Acceptance_789de11_v1.md).

## Source characterization

Read the candidate integration record, Dashboard, LayerControls, SelectedTarget, SavedFishingDayReports, FoundingCaptainAccessGate, contour presentation and mobile CSS. This is acceptance preparation, not another broad source/science audit. The accepted vNEXT integration intentionally removes Source & Evidence Details from field controls; internal field metadata remains untouched. No canvas raw telemetry/disclosure should be expected in this checklist.

Dashboard owns tabs and selected Opportunity context. Selection resolves against the current governed collection; mission/account changes, disappearance or terminal evaluation failure can clear it. Places are separate manual selections. IntelligenceRecovery wraps the analysis rather than the complete Dashboard. Map unmount/remount on navigation is legitimate. SelectedTarget starts in peek mode, expands with More Map Intelligence, collapses with Show Less and resets expansion on identity change; Open Full Analysis is a Today action, while selected-target Intelligence navigation is offered only when appropriate.

CSS includes <=700px sheet/control layouts and safe-area handling, distinct marker stacking and MapLibre control placement. Source intent is not proof against real label/marker overlap, iOS toolbar/keyboard occlusion or touch failures. MapLibre contour relief slots remain subordinate to geographic/context layers, currents and Opportunity markers. The new 176 display-level allocation and density rules add source-supported shallow detail without increasing source resolution. Static intersecting refresh may retain its original supported geometry/identity; disjoint contexts clear. Valid-cell status alone is not visible map qualification.

SavedFishingDayReports derives a nonanonymous owner from the current user, masks prior-owner rows, clears expansion on reload and filters rows by owner. Full populated-report UI/RLS behavior was not independently executed here. Access gate uses normal magic-link sign-in to the current origin; initial approval, pending refresh, denial and principal changes need the separately identified authentication checks.

## Qualification separation

**Recorded developer/integrator qualification:** `docs/agents/integration/PELORA_Bathymetry_vNEXT_Integration_v1.md` records its own source/hook/render passes, metadata 19/19, recovery 55/55 and broader captain replay 66/71 on both unchanged base and candidate. Those five documentary-backend failures are recorded harness exclusions, not passes or new candidate defects. No developer output is relabeled independent QA.

**Independent controlled PELORA-04 repeats:** all following passing commands returned exit 0 using the current QA workspace's existing frontend dependencies. Node v24.18.0; React/React DOM 19.2.7, rolldown 1.1.5, MapLibre 5.24.0. No installs, dependency copying, source/test modifications or live services.

| Actual command | Result |
|---|---|
| `node frontend/src/hooks/tests/mapMetadataCleanup.test.js C:/Projects/Pelora-Agent-Worktrees/pelora-04-qa-release/frontend/node_modules` | 19/19 passed, including actual controls and JSX parsing; disclosures absent, internal state immutable. |
| `node frontend/src/hooks/tests/useMapLibreOceanFields.test.js` | Assertion-completion PASS: both toggle directions, no-movement recovery, static camera deduplication, intersecting continuity, disjoint clearing, malformed/obsolete/disposed rejection, texture failure locality and cleanup. No invented case count. |
| `node frontend/src/utils/tests/bathymetryContours.test.js` | Assertion-completion PASS: shallow source levels, geometry/support/units/zoom/collision and complexity guard. Concurrent desktop 1600-cell median 19.35 ms, max 32.93 ms; repeated regeneration median 15.78 ms, max 26.55 ms. Not a phone benchmark. |
| `node --test --test-isolation=none frontend/src/hooks/tests/intelligenceRecovery.test.js` | 55/55 passed. Actual analysis children and Dashboard entry/recovery behavior; synthetic DOM host, not physical events/layout. |
| `node --test --test-isolation=none --test-name-pattern="Dashboard\|request race\|rapid A/B/C\|rapid same-ID\|removed identity\|manual exploration\|map selection\|Opportunity hook" frontend/src/hooks/tests/intelligenceCaptainStateRegression.test.js` | 17/17 selected cases passed. Exact selection only, not full-suite qualification. |

**Independent desktop browser emulation:** both existing scripts passed, exit 0. Set `PELORA_BROWSER_TEST_NODE_MODULES` to `C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules`, `PELORA_CONTOUR_BASELINE=0`, and `PELORA_CONTOUR_RENDER_OUTPUT` to the evidence directory below; then run:

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

No preview was deployed or launched for this preparation task. Permanent preview availability is a prerequisite for founder execution, not a blocker to checklist readiness. Only documentation is added on this branch; application/test files and HEAD remain the accepted candidate. No commit/push, merge, database/configuration or science-policy change.
