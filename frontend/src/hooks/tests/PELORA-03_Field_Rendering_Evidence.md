# PELORA-03 controlled field rendering evidence

Date: 2026-10-06. Workspace: C:\Projects\Pelora-Agent-Worktrees\pelora-03-living-ocean.
Branch: codex/pelora-03-living-ocean.
Baseline/governance HEAD: 94cc8b41fbf1e440dc2a27618617704a93025782.
Source baseline: dadec5dbca7d360f70f633413fb6a347dc24cac1.
Original candidate identity: 8b946ca2706741eb37069b43e793ebef6323c67d; original executable SHA-256 fingerprints below.
PELORA-00 explicitly extended ownership to viewportFieldRequests.js and its dedicated tests for context-checked per-layer invalidation only.

## Environment and controlled scope

Node v24.18.0. The required @maplibre/maplibre-gl-style-spec resolves from this workspace's tracked root node_modules; its version is 24.10.0, matching frontend/package-lock.json, and validateStyleMin loads successfully. frontend/node_modules is absent; React 19.2.7 is not installed. The existing hook harness supplies a VM useEffect seam, controlled fetch/map/canvas/timers and requires no React installation. No packages installed or copied. No real provider/Auth/database/production requests, credentials, build, full-app runtime or physical device tests.

Read original field delivery, scalar runtime, captain state, product vision and backend/fields/fieldService.js legacy shape contracts. Scalar delivery remains a separate contract and is not activated here.

## Baseline reproduction, before edits

All three existing focused scripts listed below passed at baseline. A controlled in-memory variant of useMapLibreOceanFields.test.js replaced the fixture transport after its first valid render; no baseline files were edited.

Fixture identity: current fieldId recorded, validTime 2026-09-19T00:00:00Z, vector [-89.875,27.125,-0.291,0.948], same viewport [-90,27,-89,28], densities 12/48. Replacement fieldId rejected-cells-null preserved the other fixture properties but used payload:{cells:null}. Bathymetry fixture remained unchanged.

Observed assertions passed:
- After moveend loading, capture the currents source data object; after awaiting replacement, state.currents.status is unavailable, but that exact source data object remains attached and its JSON still identifies recorded. Both layer visibilities are visible.
- style.load reapplies that same retained render buffer while the malformed response remains rejected.
- A later same-context controlled transport exception republishes the helper's cached malformed response: the hook's reason is a flatMap conversion error instead of transport degradation.

The first probe captured the source object before loading and failed its reference-equality assertion because loading legitimately reconverts retained valid data. The corrected probe captured it after loading; all three reproduction observations then passed. This probe failure is not a candidate test failure.

Baseline implementation SHA-256:
- useMapLibreOceanFields.js: e85ad749c5b2cfc69be22ba10d1b53e3863e7e47b6d0b3f20e337cb3feb8a58a
- oceanFieldPresentation.js: b909a2340fd8eda2a29710c3a7b3296acb960e6bfad1e994db7be781d791bd89
- viewportFieldRequests.js: 6e1f08fe4e6477468777f47f46a0df4280879f36734de2a73045fb6c0bd390e7

## Original candidate repair and developer acceptance

Presentation checks the existing legacy axes, cell dimensions/types, row/component order, bounds, resolution, coverage counts and metadata consumed for field status before conversion. Null remains missing, finite zero remains zero; a valid zero vector produces no arrow and keeps its source/status identity. No scientific value coercion, threshold, derivation, source admission or policy is added.

The helper invalidate(layer,contextKey) silently deletes only that layer's matching cached context, without field mutation or sibling invalidation. Hook failures clear the affected retained display buffer, hide/clear the map layer/source (with removal fallback), invalidate its cached context, and publish unavailable with field:null. Deferred application is loading until successful map application. Idle/style callbacks use the current cleared buffers and cannot restore rejected data. Each layer's map application has its own failure boundary.

Focused commands, all PASS in final replay:
- node frontend/src/hooks/tests/useMapLibreOceanFields.test.js
- node frontend/src/utils/tests/oceanFields.test.js
- node frontend/src/utils/tests/viewportFieldRequests.test.js
- node --check for each of the six JS paths below
- git diff --check

The scripts use assertions and completion messages, not node:test case counts; no invented case total is reported.

Hook acceptance covers valid render then malformed cells/axes/values/metadata, canvas conversion exception, source setData/updateImage/addSource failures, layout failure, true style source/layer recreation, pending idle failure, later style/transport failure, cross-layer locality in both directions, zero vector identity, changed-context clearing and captured callbacks after disposal. Utilities additionally exercise actual canvas context, fillRect and toDataURL failure seams, ascending/finite axes and zero/null bathymetry. Helper tests cover silent/nonmutating exact-context invalidation, wrong context, repeated/no-entry invalidation, sibling retention, later transport without rejected data, valid degraded/provider-unavailable retention, density/context identity, debounce/cancel, late responses and disposal.

Original candidate executable fingerprints (SHA-256 of tested working-tree bytes):
- frontend/src/hooks/useMapLibreOceanFields.js: 56f95760b7786090764119db9fbd865b3229e8f4f3dcc3f02c598b2b09748ff2
- frontend/src/utils/oceanFieldPresentation.js: 0fdc17dc70548c559e5594712841947b27332953dbe4a37ae68f8e198e7c3b0b
- frontend/src/utils/viewportFieldRequests.js: 8bcba6157becd2dd4cc9a30943c505de3a5bbe8f57bd59e231edfbf3706d36f7
- frontend/src/hooks/tests/useMapLibreOceanFields.test.js: f6ba4cc0f3318a4f4ba3bf8d15fefaafb60aecbdf3123f08bd132e36d34ef080
- frontend/src/utils/tests/oceanFields.test.js: f51f54b4da642904f37b04aa970c5e434b81bdc9fbc40651c1210406610a1ac6
- frontend/src/utils/tests/viewportFieldRequests.test.js: 9c2c5503e72d3f7d6ce50e1ebb09cabfb2d942e0b998b08c2b0fd541f1c68553

## Limits and exclusions

Controlled fixtures do not qualify environmental sources, physical-device/mobile performance, GPU behavior or the reported real black-screen incident. Map operations that all fail during teardown cannot guarantee physical removal; the retained application buffers/cache are still cleared and unavailable is reported. Real browser/React rendering and full frontend build remain unverified. No Dashboard.jsx, LayerControls.jsx, MapLegend.jsx, shell CSS, backend, acquisition, SST/chlorophyll, derivatives, ranking, science/admission or publication changes. No source/history admission, CP-10, beta-ready claim, Receipt Writer enablement, quarantined-science reopening, integration, deployment or production qualification.

## PELORA-04 P1 finding and authorized QA repair

PELORA-04 identified and PELORA-00 accepted an integration blocker in original candidate 8b946ca2706741eb37069b43e793ebef6323c67d: a successful JSON null response throws at field.status inside the helper, is misclassified as transport failure, and republishes the prior field as degraded. Prior developer passes did not cover this response envelope.

Before changing implementation, added the exact hook sequence and helper malformed-success test and ran:
- node frontend/src/hooks/tests/useMapLibreOceanFields.test.js: expected regression failure, actual degraded versus required unavailable after HTTP-success null.
- node frontend/src/utils/tests/viewportFieldRequests.test.js: expected regression failure, actual degraded versus required malformed-success.
These establish reproduction on the original implementation; they are not passing repair results.

Repaired candidate identity: the commit containing this QA repair section, with original candidate as its parent. The helper performs a minimal usable-envelope/status check after the unchanged generation/disposal guard and before reading field.status or caching. Null, undefined, primitives, arrays, missing status and unsupported status are explicitly classified malformed-success. Only the matching layer/context retained entry is deleted; the emitted marker carries field:null and the exact contextKey. Full field shape validation stays in the presentation layer. The hook routes that marker through its existing rejection path: invalidate, clear/hide the affected renderer, and publish unavailable with field:null. No lifecycle redesign or global disabling of degradation. Provider status unavailable still follows its existing refresh-failure retention path.

Exact added hook sequence: valid recorded currents visibly rendered alongside bathymetry -> successful fixture HTTP response with json() returning null for currents -> unavailable/field:null, empty GeoJSON and hidden currents, same bathymetry source object/field still visible -> deferred idle and style.load application -> no currents resurrection -> later genuine transport exception -> currents unavailable/field:null and still empty/hidden; bathymetry retains its original valid field as degraded. The helper additionally tests eight unusable successful envelope variants and proves that a later genuine transport failure cannot republish their predecessor, siblings remain retained, provider-unavailable retains valid prior data, and an obsolete null response cannot invalidate a newer context. Direct addLayer and arrow-image registration exception injections pass in the existing controlled hook harness.

Final repair developer validation: all three focused scripts listed above PASS, including the added adversarial cases; node --check for all six JS packet paths PASS; git diff --check PASS. No additional packages or environment changes. Unchanged utility checks include actual canvas failure seams and zero/missing preservation. Existing retention/context/cancellation/late-response/disposal checks still pass. These are developer tests, not independent QA acceptance; stop for PELORA-04 re-review after normal branch push and remote SHA verification.

Exact files changed by QA repair:
- frontend/src/hooks/useMapLibreOceanFields.js
- frontend/src/utils/viewportFieldRequests.js
- frontend/src/hooks/tests/useMapLibreOceanFields.test.js
- frontend/src/utils/tests/viewportFieldRequests.test.js
- frontend/src/hooks/tests/PELORA-03_Field_Rendering_Evidence.md

Repaired executable SHA-256 fingerprints:
- frontend/src/hooks/useMapLibreOceanFields.js: f3437be89a11093eb4d2c544c5d8ce031522cfae993d3e1b383d7d0d7002dc19
- frontend/src/utils/viewportFieldRequests.js: efb6c023bed2ee6b136aa172c0c406a77d2dc566b896e0f73edbcef364f95be0
- frontend/src/hooks/tests/useMapLibreOceanFields.test.js: f72813f366e4ba4b0c3300ef300a9ff897252a5ba0755d5cd5793ba48fca86ed
- frontend/src/utils/tests/viewportFieldRequests.test.js: ac98719a15136da398a10fe01458f75db1b68bb80d19a1245edfcebaba4bca35

Browser/React rendering, mobile/device performance, actual GPU/style implementation behavior, and the reported physical black-screen incident remain unverified. No environmental-source, integration, beta, production or independent QA qualification is inferred. Original exclusions above remain in force.
