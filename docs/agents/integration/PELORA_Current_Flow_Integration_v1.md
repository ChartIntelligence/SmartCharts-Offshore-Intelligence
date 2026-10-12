# PELORA Current Flow Integration v1

Base: 73b498d7d298e11f006e9ac005c483bad408873f. Exact P03 source: 14c89840cfeb40134f5ad47864699b47749fdd6f (parent10150d5a). Independent clearance: P04 QA-only a7584a0bf77a932127dc09041090ed97ec57c93d; no P0/P1/P2 reported. New combined candidate remains controlled-use/founder-QA only.

Applied `git cherry-pick --no-commit` of exact P03 source after independent clearance. No conflict, semantic edit or overlap with accepted caption/board changes. All 13 changed source/test/fixture/evidence paths match P03 Git blobs. Other application blobs remain identical to base, including Captain Continuity and MapLegend caption repair. Production delta is useMapLibreOceanFields.js plus new currentFlowPresentation.js. Existing scientific vector conversion, sample positions, values, timestamps/provenance, bathymetry geometry/texture, independent lifetimes and fail-closed guards remain intact. Rendering pulses indicate sampled direction, not speed, transport or interpolation; stale/degraded/reduced-motion/hidden states use static display.

## Fresh combined checks

From C:/Projects/Pelora-Agent-Worktrees/pelora-map-packets-integration-v1, Node v24.18.0. Existing read-only P02 frontend/node_modules used for React/rolldown; existing bundled Codex dependency root for Playwright/sharp. No install/copy/private environment reads.

- `node --test frontend/src/utils/tests/currentFlowPresentation.test.js frontend/src/hooks/tests/useMapLibreOceanFields.test.js frontend/src/utils/tests/oceanFields.test.js frontend/src/utils/tests/bathymetryContours.test.js frontend/src/utils/tests/viewportFieldRequests.test.js`: all five script entries pass their grouped assertions. Grouped assertions are not inflated into unique test counts.
- `node frontend/src/hooks/tests/mapMetadataCleanup.test.js R`:20/20, including exact newly repaired open legend.
- `node frontend/src/hooks/tests/captainContinuity.test.js R`:29/29.
- `node frontend/src/hooks/tests/captainContinuityRegression.test.js R`:19/19.
- Continuity-aware unchanged intelligenceRecovery.test.js replay with actual useCaptainContinuity/validateWorkspace injected into its import-stripping Dashboard scope:55/55 on this workspace. Temporary external runner resolves original test URL against this exact integration workspace; mechanism preserved from continuity integration. No assertion or repository test source weakened.
- Current-flow, contour and texture Edge GPU scripts run with PELORA_BROWSER_TEST_NODE_MODULES pointing to bundled runtime. Controlled synthetic inputs only; requests blocked. Exact command names: currentFlowRender.test.mjs, bathymetryContoursRender.test.mjs, bathymetryTextureRender.test.mjs under frontend/src/hooks/tests.
- `node --check` all five changed/new JS/mjs:PASS; staged whitespace:PASS; exact scope/blob verification:PASS.

Developer legacy harness result12/55 (43 unbound useCaptainContinuity failures), reproduced at unchanged10150d5a, remains historical failed harness evidence. Dependency-aware55/55 is a separate adapter replay, not documentary conversion of those failures into passes. Five documentary-builder data-URL replay exclusions in broader66/71 remain unqualified. No full scientific/profile/database suite rerun; no science/storage change.

## Scope and next gate

This checkpoint also records founder-approved Persistent Map Shell v1 direction in constitution/decision log/board, not runtime implementation. P02 proposal precedes isolated implementation; P04 independently qualifies shell. Founder real-source/physical-device/layout/performance and authenticated workflows remain pending. Preview API/project binding unresolved; no build/serve using production default, backend launch, provider/Auth/database request, main merge or deployment. No packages/secrets.

Final SHA/remote are reported after commit; no self-hashing report. Reproducible P03 fixtures and native report remain exact in hooks/tests/fixtures/currentFlow-v1. No new source admission, trajectories, convergence or operational readiness implied.
GPU results: all three PASS; zero external requests/map errors. Current trace output pelora-current-traces-yinjzx; contours pelora03-contours-CQwouD; texture pelora03-texture-render-zE51Li under temporary output directory. Controlled phone-width contour navigation sampled maximum43.8ms vs median16.6ms; no physical-device performance certification.
