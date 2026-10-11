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

## Successful-response JSON decoding repair — 2026-10-06

Entering workspace/root C:\Projects\Pelora-Agent-Worktrees\pelora-03-living-ocean, branch codex/pelora-03-living-ocean, full HEAD 7abfaf3b667a7ba5ac932fbe1c4617ce237a0ed7, clean tracked/staged/untracked status. PELORA-00 accepted the remaining PELORA-04 P1: response.json() mixed body reading and syntax parsing into the request-failure path. The earlier null-envelope source/assertion repair remains closed; this is a distinct decoder-stage defect.

### Pre-repair reproduction

Added a raw controlled response whose json() executes actual JSON.parse on the malformed string {"privateFixture": (and an empty-body variant). Ran node frontend/src/hooks/tests/useMapLibreOceanFields.test.js before the implementation edit. The first syntax case failed as expected: actual degraded versus required unavailable. It exercised the actual hook fetch/response.json/request-helper path with the recorded valid current already displayed, not a preclassified error. The initial assertion stopped at the first malformed string; both syntax and empty-body variants passed after repair. No network/service was involved. Baseline source identities are the unchanged full entering commit above and its tracked hook/test blobs.

### Bounded stage classification

The hook adapter now awaits response.text() once, outside the JSON.parse catch. A successful body-read exception is rethrown unchanged, even when named SyntaxError; the request helper retains valid same-context data under its existing failure contract. JSON.parse executes only after a completed read. Parsing exceptions for HTTP success return the existing unusable null result; helper generation/disposal checks run before malformed-success classification, exact-context cache deletion, or publication. The hook's existing rejection boundary converts that internal marker to unavailable/field:null and clears/hides only the affected layer. No direct decoder invalidation, alternate cache or lifecycle framework was added. HTTP error reads/parses use a generic Field request <status> fallback; a valid HTTP-error reason remains the existing provider reason. Raw malformed body text is never displayed.

### Response-failure matrix and actual results

| Controlled result | Required and observed developer result |
| --- | --- |
| HTTP 200 body {"privateFixture": | unavailable/field:null, empty/hidden currents, same sibling bathymetry source and valid field preserved; generic malformed-success reason |
| HTTP 200 empty body | same parse-rejection result, never degraded retention |
| HTTP-success JSON null and malformed envelopes | existing null and helper primitive/array/status tests retained and passing |
| HTTP-success body read throws SyntaxError("controlled body-stream failure") | degraded with the exact prior parsed field object and truthful stream-failure reason |
| Abort during pending body reading | no publication after cancellation; later genuine transport failure still retains the prior valid field |
| Older pending read resolves invalid syntax after newer density/context field succeeds | no publication; later newer-context transport failure retains the exact newer field object newer-decoding-context |
| Pending read resolves invalid syntax after disposal | no publication or renderer-buffer identity change; cleanup listeners remain removed |
| HTTP 502 non-JSON error page / HTTP 503 unreadable error body | valid previous field retained as degraded with HTTP status reason, not malformed-success |
| HTTP 400 valid JSON error reason | valid previous field retained as degraded with controlled HTTP rejection reason |
| Valid HTTP-success provider-unavailable | prior field retained as degraded with provider no data reason |
| Valid replacement after syntax rejection | normal recorded-field recovery with visible currents |

For each syntax/empty-body case, assertions run clear/unavailable -> deferred idle/style application -> further syntax rejection -> genuine transport failure -> still no predecessor/rejected-field restoration. Bathymetry remains visible and becomes legitimate degraded retention on that genuine failure. Successful body/deferred response fixtures assert one text read. The prior null, layer/source/image failures, canvas failures, zero/missing, retention, density/context identity, cancellation, late response and disposal assertions remain in the suites. Because explicit parsing creates new field objects, fixture equivalence checks compare serialized original values; transport-retention checks still require exact previously parsed object identity.

Final commands/results:
- node frontend/src/hooks/tests/useMapLibreOceanFields.test.js — PASS, including decoding matrix, original P1 null sequence, application failures, zero vectors and disposal.
- node frontend/src/utils/tests/oceanFields.test.js — PASS.
- node frontend/src/utils/tests/viewportFieldRequests.test.js — PASS.
- node --check for the six existing packet JavaScript paths — PASS.
- git diff --check — PASS.
Node remains v24.18.0; existing MapLibre style validator resolves version 24.10.0 and loads. No new dependencies or backend/database exercises. These scripts report assertion completion, not a node:test case total.

### Instruction reconciliation and identities

Narrowly amended docs/agents/missions/PELORA-03_Field_Rendering_Consistency_v1.md on this branch to make viewportFieldRequests.js and its dedicated test editable for the authorized invalidation/malformed-success mechanisms, remove the contradictory read-only test/helper designation, and record this repair's bounded acceptance. Initial setup disposition remains historical. No governance-branch or other-agent instruction changes.

Repaired candidate is the normal follow-up commit containing this section, parent 7abfaf3b667a7ba5ac932fbe1c4617ce237a0ed7. Changed files are the three fingerprinted paths below and this evidence record; the helper, presentation utility, and their two tests are unchanged in this decoding delta. Exact tested fixture identity remains recorded/bathy, fixed original timestamp/vector/viewport above; the newer context uses zoom 7 (current density 20) and fieldId newer-decoding-context.

Tested working-tree SHA-256 fingerprints:
- frontend/src/hooks/useMapLibreOceanFields.js: ae26f30fd93534d456fca6d6cae0c2c91b16a62adb7f220419937a47f04156fb
- frontend/src/hooks/tests/useMapLibreOceanFields.test.js: c001aa18547233be42be5819620004c3e419424f882079d2a8e9281181b392f1
- docs/agents/missions/PELORA-03_Field_Rendering_Consistency_v1.md: 58f91161771dcc11ba9060c44765ddba356d6ee003766984bc112094fb254f3c

Independent PELORA-04 delta review remains required. Browser/React, real body-stream implementations, mobile performance, GPU behavior and the reported device incident remain unverified. Developer passes are developer evidence only. No source admission, science, ranking, providers, Auth, database, backend qualification, integration, PR or deployment. CP-10 and operational rollout remain blocked.

## MAP FIELD ISOLATION + BATHYMETRY PRESENTATION v1 — entering evidence (2026-10-11)

Authorized worktree/branch: C:\Projects\Pelora-Agent-Worktrees\pelora-03-living-ocean / codex/pelora-03-living-ocean. Clean entering HEAD aabd800651b1c98e12b44b397139e811efc92cd5. Integration reference b48e06cad81717b95f0101d21430b48fd1805060 is context only, not a branch-movement target. Before implementation edits, git rev-parse <commit>:<path> verified:

| Path | Entering blob | Integration-reference blob | Result |
| --- | --- | --- | --- |
| frontend/src/hooks/useMapLibreOceanFields.js | 935a0038774b69b9efc1398ac8940aaa45e6ffdd | 935a0038774b69b9efc1398ac8940aaa45e6ffdd | equal |
| frontend/src/utils/oceanFieldPresentation.js | 9e7fd84048dfb7616438ced1ff6c0e30e90f678e | 9e7fd84048dfb7616438ced1ff6c0e30e90f678e | equal |
| frontend/src/utils/viewportFieldRequests.js | 0d34424c323293f56600ad22e01621bcca031d11 | 0d34424c323293f56600ad22e01621bcca031d11 | equal |

Later combined integration/QA must apply this P03 candidate onto the b48e06 lineage before browser qualification.

### Controlled source reproduction and candidate repair

Two diagnostic replays loaded the entering hook from git show aabd800651b1c98e12b44b397139e811efc92cd5:frontend/src/hooks/useMapLibreOceanFields.js into the updated controlled VM harness. The hook was extracted to TEMP/pelora03-lifecycle-aabd800-hook.js; the diagnostic module used the same import fixtures and changed only the hook source read. No baseline tracked file was edited. First replay failed the new assertion sibling state identity survives OFF: Currents OFF replaced valid static bathymetry with loading/field:null in the exact same context. A separate startup replay with isStyleLoaded false and no map event failed startup must acquire without movement/style event (0 requests, required 2). These expected baseline failures establish the shared-effect reset and conditional-startup dependency. They do not establish the precise browser A-versus-D stall path.

Candidate gives each enabled layer its own fixed-order custom hook/effect, request-helper instance, generation/cache, buffer, events, refresh interval and readiness timer. Dependencies include only its own toggle. A sibling toggle neither disposes nor schedules the other layer. OFF clears/hides only that layer and publishes off/field:null; ON immediately schedules acquisition for the exact existing viewport. Acquisition no longer depends on style readiness. Application still waits for readiness, with idle/style events and a guarded 100 ms retry so a subsequent moveend/zoom is not required. Each timer/request/event is cancelled on disposal; captured readiness/refresh callbacks cannot republish or reattach. Teardown shares the same local hiding/removal fallback as presentation rejection. The request helper and its context/generation/invalidation/decoding behavior are unchanged. A not-ready style with no field no longer converts an unavailable state into loading.

Confirmed presentation limitation in source: existing depth bands used dark colors close to the configured base ocean #101e29, blended at 0.65 opacity. Candidate changes only those five fixed-band colors and raster opacity to 0.85. The same thresholds (-4000/-2000/-1000/-200), sample footprints, 512-square canvas, Mercator positioning, clipping, transparent missing/non-negative cells and nearest resampling remain. No viewport normalization, interpolation, contours, ridges, relief derivatives, source-resolution change or invented structure. Tests measure each composited fixed band differs from the actual base water and real negative samples yield positive-area rectangles. This demonstrates a discernible render configuration, not human/browser acceptance. Source ordering and geometry review found no additional confirmed ordering/transform defect; actual absence versus imperceptibility in the reported browser remains uninstrumented.

### Exact acceptance and commands

The hook harness now models dependency-indexed React effect commits and independent multicast map event handlers/timers. It checks both OFF/ON directions: exact sibling state/source identity and transport counts unchanged, no sibling loading/reset, enabled layer success/visible application without movement. With style initially not ready, both requests initiate and the controlled readiness timer applies them once ready with no load/move event. Cleanup removes all request/readiness/interval/event resources; captured callbacks are inert. A visibility-operation teardown exception uses local removal without resetting the sibling. Original malformed-current/malformed-bathymetry, decoding matrix, body abort, obsolete/disposed response, style/idle non-resurrection, source/layer/image/canvas failure, valid degraded retention and zero/missing cases all still pass.

Focused final commands/results (all PASS):
- node frontend/src/hooks/tests/useMapLibreOceanFields.test.js
- node frontend/src/utils/tests/oceanFields.test.js
- node frontend/src/utils/tests/viewportFieldRequests.test.js
- node --check for the four changed JavaScript paths below
- git diff --check

Broader controlled regression commands/results (all PASS):
- node frontend/src/utils/tests/peloraMapStyle.test.js — 12/12 node:test cases
- node frontend/src/utils/tests/syntheticSstDisplay.test.js — 12/12 node:test cases; no new runtime activation
- node frontend/src/utils/tests/mapObservationDisplay.test.js — assertion completion
- node frontend/src/utils/tests/mapEnvironmentalObservations.test.js — assertion completion
- node frontend/src/utils/tests/mapRuntimeResponse.test.js — captured fixture assertion completion
- node frontend/src/hooks/tests/useMapLibreEnvironmentalObservations.test.js — controlled hook assertion completion

Nine distinct scripts total; only the two node:test scripts provide counted cases (24 passed), while the others use completion assertions. Do not invent a combined case count or treat these as operational-source evidence. Node v24.18.0 and existing MapLibre style validator 24.10.0 verified; no packages installed. The first whitespace check caught a trailing blank line introduced in entering evidence; corrected before final checks. No candidate JavaScript failure remains.

Test fixture identities: fixed recorded current and bathy fields retained above; lifecycle toggles use Gulf bbox [-90,27,-89,28], current density 12 and bathymetry density 48. Broader field harness retains its original changed-context/density fixtures. The bathymetry contrast fixture contains exact supplied depths [-5000,-3000,-1500,-500,-50,null,0,8], 4-by-2 ascending axes, unchanged resolution 1 degree and seven finite cells; only its five negative values are shaded. Color visibility checks are deterministic configuration assertions, not screenshot fitting or bathymetric science qualification.

Candidate source identity: the commit containing this section, directly descended from aabd800651b1c98e12b44b397139e811efc92cd5. Integration-reference blob equivalence was recorded before implementation above. Changed files are these four JavaScript paths plus this evidence record:
- frontend/src/hooks/useMapLibreOceanFields.js: SHA-256 a0d5af8c96b05efff0ff7f07e51b4a887fdad650e4f5fd2c064d162a15b9de0d
- frontend/src/utils/oceanFieldPresentation.js: SHA-256 bb295259c0f5749beed6c07dd071e089d5f2fe11c9c20c82945b76121d5cd3cb
- frontend/src/hooks/tests/useMapLibreOceanFields.test.js: SHA-256 182c132d54954296bf2a9f7f72240b94822170d01a1e68792fc3cbd49618bfdc
- frontend/src/utils/tests/oceanFields.test.js: SHA-256 114d50924bc835f33d62423d41002c8a26db687f5c8c10b4ae29791aaaea8e1f
- frontend/src/hooks/tests/PELORA-03_Field_Rendering_Evidence.md

No Dashboard, LayerControls, MapLegend, shell CSS, P02/integration files, backend, production, database, providers/Auth, source admission, ranking/publication or science-policy changes. No merge, deployment or independent QA claim. CP-10 and operational rollout remain blocked. Browser-only remaining validation: apply this candidate onto the b48e06 integration lineage, reproduce both layer-toggle directions without movement and profile actual style/source readiness, assess real ETOPO readability at Gulf/FAD zoom levels and inspect missing/land transparency and ordering. Real browser/React scheduling, body streams, mobile/GPU performance, scientific source qualification and exact manual-stall causality remain unverified. Candidate stops for combined integration/QA.

## BATHYMETRY TEXTURE SAMPLING REPAIR v1 — candidate evidence (2026-10-11)

Entering identity: C:\Projects\Pelora-Agent-Worktrees\pelora-03-living-ocean, codex/pelora-03-living-ocean, clean HEAD 98f3356834f2faed913798388cbab420897e8732. Integrated QA reference b98b3040d2f40102a3895e72b3bf82e4e03c8f6f. Implementation remains on P03 lineage; no merge/reset/rebase/cherry-pick, dependency upgrade or installation.

### Confirmed diagnosis and exact correction

Primary classification E: the correct bathymetry image is uploaded, but raster sampling requires absent mipmaps. In the installed MapLibre 5.24.0 image-source path, ImageSource.prepare creates a texture without useMipmap; Texture.update generates mipmaps only when that flag is true. Raster draw then binds LINEAR_MIPMAP_NEAREST for minification. For the 512-square power-of-two image, the library retains that mipmap-dependent filter. Actual decoded-image and GPU level-zero pixels were correct while the actual map footprint was black, including pixels that should have been transparent. Successful source/layer calls and static/valid status did not prove visible GPU output.

Exact production fix: installBathymetryTextureSampling in oceanFieldPresentation.js wraps only the active bathymetry image source's prepare method and that source texture's bind method. After MapLibre prepares a new texture, a nearest bind with useMipmap=false delegates with minFilter=NEAREST (9728), then enforces TEXTURE_MIN_FILTER=NEAREST for an already-cached nearest bind too. No mipmaps are created or required. Original texture creation/binding ownership remains MapLibre's. Linear requests and valid mipmapped textures are delegated unchanged. Previous texture/source methods are restored on replacement, rejection and teardown. Detached/disposed callbacks cannot reject current/newer state. Texture API/bind failures follow the existing affected-layer-only reject/invalidate/clear path.

The hook attaches this adapter only when applying bathymetry data to its image source; current source/texture behavior is untouched. The two fixed-order layer effects, own-toggle dependencies, exact request identities, generation/cancellation/retention mechanisms, acquisition/readiness retries, refresh interval and independent layer lifetimes are unchanged. No global class/prototype or node_modules file is patched. Source and texture method access is an intentionally narrow internal-API compatibility adapter qualified against MapLibre 5.24.0, not a general public texture configuration API; upgrades must requalify this seam. Unsupported API shape fails closed for bathymetry.

No public image-source minification option was found in the exact installed implementation. The adapter implements the proven correction rather than changing canvas size, palette, opacity, band thresholds or the declared nearest sampling. Scientific values, units, 512x512 presentation size, sample geometry, NW/NE/SE/SW corners, all five band colors, thresholds (-4000/-2000/-1000/-200), transparent zero/nonnegative/missing cells, opacity 0.85 and map-order contracts remain unchanged.

### Retained actual renderer regression

frontend/src/hooks/tests/bathymetryTextureRender.test.mjs runs existing local MapLibre with real canvas/image decoding/GPU texture and the actual hook in isolated headless Edge. The useEffect seam is controlled; this is not full React/authenticated-app acceptance. Only the field request is fixture-intercepted; native data-image decoding remains intact. Page external routing is blocked, service workers blocked, and final runs report zero page network requests, map errors or page errors. No real provider/Auth/database calls. Geographic layers are empty synthetic fixtures; actual land-mask/basemap/device validation remains separate.

The same synthetic fixture in both modes has 42x33 cells at .050 degrees, 1386 finite cells, 990 negative cells and 396 nonnegative cells, with 198 negative cells in each band. Canonical fixture SHA-256 a399fa53af713ac67dc084aee742dc2bd6d8e23b2c240e2ff43bfdf3543d091f. Negative depths range -5000 to -50. 71.428571% of source cells are eligible for shading. Canvas has 189440 nontransparent pixels (161280 fully opaque) and 72704 transparent pixels. Exact colors [32,78,114,255], [57,132,154,255], [96,166,173,255], [137,197,189,255], [201,217,189,255] are present. Loaded image/texture remains 512x512; geographic footprint [-91,26,-88.9,27.65] intersects the measured viewport with correct orientation, layer visibility/opacity/order.

BEFORE: exact entering hook extracted by git show 98f3356834f2faed913798388cbab420897e8732:frontend/src/hooks/useMapLibreOceanFields.js. Live MIN_FILTER=9985, useMipmap=false. All five band locations and two transparent-cell locations are RGB [2,4,6] (black footprint). Baseline mode asserts that original defect rather than counting changed pixels as success.

AFTER: candidate production adapter, with no diagnostic GL filter override. Live MIN_FILTER=9728 (NEAREST), useMipmap=false. Five screenshot sample RGB values are [[30,71,103],[51,117,137],[84,146,153],[119,172,167],[173,189,167]]. Zero/positive sample locations are base water [16,30,41]. A same-context image refresh and forced real style replacement (diff:false) both retain the exact five colors/transparency. The first test attempt used identical-style diffing, which correctly produced no style reload and timed out waiting for one; corrected only the test trigger to force recreation. No application workaround was added for that test issue.

Artifacts are retained locally:
- C:\Users\User\AppData\Local\Temp\pelora03-texture-repair-baseline: report.json, fixture.json, canvas.png, before-map.png, after-map.png
- C:\Users\User\AppData\Local\Temp\pelora03-texture-repair-candidate: same artifacts plus after-refresh.png and after-style-reload.png
The original diagnostic source-chain evidence remains under TEMP/pelora03-visible-render-98f3356. These fixtures are SYNTHETIC TEST EVIDENCE, not the founder's captured ETOPO response.

Reproduction commands (PowerShell):
1. git show 98f3356834f2faed913798388cbab420897e8732:frontend/src/hooks/useMapLibreOceanFields.js | Set-Content -Encoding utf8 (Join-Path $env:TEMP 'pelora03-texture-baseline-98f3356.js')
2. Set PELORA_BROWSER_TEST_NODE_MODULES to the existing bundled Node module directory returned by load_workspace_dependencies; optional PELORA_TEST_BROWSER_CHANNEL=msedge on Windows.
3. Set PELORA_TEXTURE_RENDER_MODE=baseline, PELORA_TEXTURE_BASELINE_HOOK to that extracted file and PELORA_TEXTURE_RENDER_OUTPUT to the baseline artifact directory; node frontend/src/hooks/tests/bathymetryTextureRender.test.mjs — PASS original-black reproduction.
4. Set PELORA_TEXTURE_RENDER_MODE=candidate and PELORA_TEXTURE_RENDER_OUTPUT to the candidate directory; run the same script — PASS five-color/transparency render, refreshed image and forced style recreation. Uses existing Playwright/sharp, no install. Starting an isolated browser process requires host sandbox approval; no signed-in profile is used.

### Focused and broader validation

All three focused scripts PASS:
- node frontend/src/hooks/tests/useMapLibreOceanFields.test.js
- node frontend/src/utils/tests/oceanFields.test.js
- node frontend/src/utils/tests/viewportFieldRequests.test.js

New assertions cover nearest minification without mipmaps, cached binding, new textures, restoring original methods, unaffected linear/mipmapped requests, unsupported API handling, texture-bind error locality/cache invalidation, detached callbacks, exact threshold edges, original values/geometry/opacity, and transparent zero/positive/null cells. Original two-direction OFF/ON isolation and no-movement acquisition, malformed success, body decoding/abort, obsolete/disposed requests and source/map failure assertions remain passing. The request helper is unchanged.

Broader regression scripts all PASS: peloraMapStyle.test.js (12 node:test cases), syntheticSstDisplay.test.js (12 node:test cases), mapObservationDisplay.test.js, mapEnvironmentalObservations.test.js, mapRuntimeResponse.test.js and useMapLibreEnvironmentalObservations.test.js. These are the existing controlled scripts in their hook/util test directories. The synthetic SST test is regression-only; no new activation. The six broader scripts provide 24 counted node:test cases plus completion-only assertion suites; no invented total. Syntax checks for all five changed JavaScript files and git diff --check PASS. Node v24.18.0, MapLibre 5.24.0, existing style validator 24.10.0.

Candidate is the commit containing this section, directly descended from entering 98f3356834f2faed913798388cbab420897e8732. Exact changed JavaScript file fingerprints (tested working-tree SHA-256):
- frontend/src/hooks/useMapLibreOceanFields.js: befbbbda099e6eef7de2f29018dc0dcd548168baf8fabaf64d0d3b7cfb369f49
- frontend/src/utils/oceanFieldPresentation.js: 5fa558470ff2618c72bbec60817aa8a4e8acaa4a984e381cb9482d81fc7a5f48
- frontend/src/hooks/tests/useMapLibreOceanFields.test.js: b63fc892d6f59029bc939c8137e8fd1588525a920bea44879123260d21b8491e
- frontend/src/utils/tests/oceanFields.test.js: 8462b3ab754c684d49fc103d29d7ecf70450817990cd9cc87729b79715934042
- frontend/src/hooks/tests/bathymetryTextureRender.test.mjs: d2a736f87be129677452a9e8613ead0c42f7c625885a48c0b85889c7511d84e7
- frontend/src/hooks/tests/PELORA-03_Field_Rendering_Evidence.md (evidence only)

### Remaining gate and stop

A valid-cell/data-success state remains distinct from proof of visible GPU output. This candidate adds controlled actual screenshot/color evidence for the repaired source/texture path; it does not redefine captain field statuses or claim source/science/operational qualification. Independent combined integration/QA must apply this P03 candidate onto the b98b3040 lineage and test the founder's actual field/viewport/geographic masks/browser/device/GPU, both toggle directions and texture replacement/style reload. React/authenticated-app acceptance, real ETOPO readability and other devices remain unverified. The internal MapLibre adapter requires library-upgrade requalification.

No scientific values, thresholds, geometry, nearest sampling, colors, opacity/order or independent field-lifetime repair changed. No Dashboard/LayerControls/MapLegend/shell CSS, backend, providers, Auth, database, ranking, source admission or science-policy changes; no merge, deployment or operational rollout. CP-10 remains blocked. Stop after normal P03 candidate commit/push and verified remote SHA.

## BATHYMETRIC CONTOURS v1 — developer candidate evidence (2026-10-11)

### Binding and authorization

Entering local and remote SHA: `e3f81e11b6132213e4533985c2bf1a1162070972`; clean worktree `C:\Projects\Pelora-Agent-Worktrees\pelora-03-living-ocean`, branch `codex/pelora-03-living-ocean`. Integrated reference `bd94c4a34b72c9d2ba39b6b224b82d1b5eff50d7` is QA context only; no branch movement/integration. The human contour mission supersedes the prior prohibition on adding contours for this presentation packet. Its acceptance update qualifies the existing lifecycle/texture repairs but leaves captain bathymetry UX open. This record does not rewrite historical evidence or claim independent QA of the new presentation.

Read root router, board, mission, product vision, field-delivery, scalar-runtime and captain-state contracts. The acquired legacy spatial field remains separate from governed scalar delivery/source admission. Read-only legacy field builder confirms explicit ascending sample axes, positive-up meters and native-grid stride/no interpolation; bathymetry maximum returned rectangular grid is 2600 cells. No backend execution/modification.

### Architecture and honest contour representation

Client-side GeoJSON is derived synchronously from the already acquired field inside the existing bathymetry-only presentation boundary. No backend, dependency, second cache, new acquisition or field-lifetime change. Each accepted replacement replaces the whole contour source; `fieldId` and depth level identify features, while the unchanged request helper/contextKey/generation checks control acceptance. Rejected conversions/applications clear the raster and all three contour layers/source and invalidate only exact-context bathymetry retention. Changed-context clearing also immediately hides contours, including style-not-ready states. Disposal cleans contour resources with the existing layer lifetime.

Contours are **approximate nearest-cell threshold boundaries**, not interpolated exact-depth locations. Adjacent finite negative-depth samples on opposite sides of a configured level produce their existing nearest-cell midpoint edge. Domain edges are clipped to field bounds. Missing/nonnegative neighbors produce no line; no coastline, gap bridge, extrapolation, marching-squares depth interpolation, smoothing, ridges, hillshade or continuous-resolution claim. Degree-two vertices join; ambiguous four-way junctions stay disconnected. Uniform fields may correctly produce no contour. Several levels can coincide across a steep coarse sample transition; this does not resolve their physical separation. Angular lines deliberately expose coarse source support and remain a founder/QA acceptance question.

Major source-meter levels: **200, 1000, 2000, 3000, 4000, 5000, 6000**, visible at all zooms. Regional minors: **500, 1500, 2500, 3500, 4500, 5500**, visible from zoom 6. **100 m** minor appears from zoom 8. No additional levels at higher zoom: magnification does not improve resolution. Major width 1.1 / opacity .65; minor width .65 / opacity .45. These are display levels, not changes to scientific values or the five preserved raster depth thresholds.

Recommend **feet as the sole displayed unit** for the mission's U.S. offshore audience, while generating levels in unchanged source meters. Recommendation was presented before implementation of labels; candidate feet are provisional for founder review, not a final unit-policy lock. Labels convert with exact international-foot factor .3048 and round displayed feet to integers; e.g. 1000 m -> 3,281 ft. No competing fathom labels or captain control added. No values/provenance change.

An initial real MapLibre line-label experiment rendered no labels because unsmoothed 90-degree turns failed line-following placement. Final labels use **one existing vertex anchor per sufficiently long joined major line** (length at least four delivered sample spacings), associated visually by an 0.8-em offset and dark halo. Zoom >=5; 11 px; collisions enabled; no overlap/ignore-placement override. No label per cell segment. All three layers declare the existing `relief` slot, below opaque land/geographic layers, currents, Places, Signals and Opportunities. Supporting styling is independently selected conventional semantics, not copied commercial styling. Active-layer insertion excludes its own contour labels to preserve current/context order.

The original raster remains **hidden/internal**, with its unchanged colors, five thresholds, geometry, nearest sampling, opacity .85 and production NEAREST/no-mipmap adapter. No optional tint in this candidate. Successful source calls remain configuration evidence, not proof of visible GPU output; the controlled visual test additionally proves actual lines/placed labels, and the preserved raster GPU test explicitly exposes only the internal raster for its original pixel assertions.

### Performance and pathological input

Normal synthetic 40x40 (1600-cell) slope fixture produces 13 joined lines plus six sparse label anchors. Desktop Node runs: median approximately 2.3–2.5 ms, max approximately 6–8 ms over 25 repetitions. Algorithm scans the bounded grid once per 14 levels and joins only generated edges; cost O(levels * cells + generated edges).

An alternating 52x50/2600-cell shallow/deep stress fixture initially produced 71,372 tiny features in 368.81 ms. A **6000-feature presentation allocation guard** now rejects the complete conversion in approximately 48–54 ms on this desktop, with affected-layer unavailable/field:null and no retained-data resurrection. No partial result, altered levels, source admission restriction or fabricated simplification. This guard bounds map feature load, not all input parsing/segment allocations or mobile execution time. Physical mobile CPU/GPU profiling and actual ETOPO complexity distributions remain required.

### Controlled visual fixture and source identities

Fixture `SYNTHETIC-CONTOURS-40x40-v1`; 1600 finite negative values; bounds [-91,26,-89,28]; ascending .050-degree axes; depth range -5900 to -50 m. Formula is an explicitly synthetic planar slope, not alleged real seafloor structure. Canonical JSON SHA256: `5a9f0bd3d6d28b6bc2220ca367f30a95c1a6b9aca4d30b59b5c27472bb80afdf`.

Retained dedicated fixture/evidence paths:

- `frontend/src/hooks/tests/fixtures/bathymetryContours-v1/fixture.json`
- `frontend/src/hooks/tests/fixtures/bathymetryContours-v1/before-raster.png` — same fixture using the qualified internal colored-cell raster, fitted view.
- `frontend/src/hooks/tests/fixtures/bathymetryContours-v1/after-broad.png` — zoom 5, major contours/sparse labels, no primary raster.
- `frontend/src/hooks/tests/fixtures/bathymetryContours-v1/after-regional.png` — zoom 7, major/minor lines and six placed major labels, no primary raster.

Actual MapLibre 5.24.0/headless installed Edge; actual production hook, canvas and source/layers; controlled field fetch; empty synthetic geography; local glyph fallback because fixture style has no remote glyph URL. Screenshots visually inspected. Broad query found 12 major/label feature instances; regional query found six placed labels and 15 minor feature instances (tile duplication and opacity-hidden feature queries are not distinct-visible-line counts). Evaluated style expressions separately prove minor opacity is zero below its zoom threshold. Zero external requests/page errors/map errors. Regional label strings are feet and associated with major contours. This fixture does not prove live geographic-mask or ranked-marker collision acceptance.

Preserved original GPU texture regression: all five bands retain screenshot RGB samples [30,71,103], [51,117,137], [84,146,153], [119,172,167], [173,189,167]; zero/positive pixels remain base water [16,30,41]. minFilter 9728 (NEAREST), useMipmap=false; unchanged 512x512 image and bounds. Same-context texture replacement and forced style recreation pass. Actual texture test only unhides the internal raster in the harness; no diagnostic GL override.

### Actual commands/results

Node v24.18.0; existing root MapLibre 5.24.0/style validator and bundled Playwright/sharp; installed Edge. No package/environment copying or installation. PASS:

```text
node frontend/src/hooks/tests/useMapLibreOceanFields.test.js
node frontend/src/utils/tests/oceanFields.test.js
node frontend/src/utils/tests/viewportFieldRequests.test.js
node frontend/src/utils/tests/bathymetryContours.test.js
node frontend/src/utils/tests/peloraMapStyle.test.js
node frontend/src/utils/tests/syntheticSstDisplay.test.js
node frontend/src/utils/tests/mapObservationDisplay.test.js
node frontend/src/utils/tests/mapEnvironmentalObservations.test.js
node frontend/src/utils/tests/mapRuntimeResponse.test.js
node frontend/src/hooks/tests/useMapLibreEnvironmentalObservations.test.js
```

New utility assertions cover negative-only levels, masks/no missing-cell bridges, exact configured depths, bounded coordinates, deterministic output/major-minor identity, unchanged input, evaluated zoom rules, label unit/vertex association, style validity/hierarchy/collision properties, and complexity rejection. Original hook/helper decoding/body/HTTP/provider/race/obsolete/dispose/zero/transport-retention tests remain; hook assertions now inspect visible contour layers in addition to hidden raster and clear all contours on rejection. Added contour-source failure and conversion-limit rejection/later-transport non-resurrection. Both independent OFF/ON lifecycle directions still pass without movement or sibling restart. Current conversion and transport behavior unchanged.

```powershell
$env:PELORA_BROWSER_TEST_NODE_MODULES='C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
$env:PELORA_CONTOUR_RENDER_OUTPUT=Join-Path $env:TEMP 'pelora03-contours-v1'
node frontend/src/hooks/tests/bathymetryContoursRender.test.mjs
$env:PELORA_TEXTURE_RENDER_OUTPUT=Join-Path $env:TEMP 'pelora03-contours-texture-regression'
node frontend/src/hooks/tests/bathymetryTextureRender.test.mjs
```

Both browser scripts PASS. Six affected JS/mjs files pass `node --check`; `git diff --check` passes. Full scoped diff inspected, including synthetic fixtures/screenshots; no unrelated/sensitive content. Initial expected harness updates (three sources instead of two and visible contours instead of raster), failed sharp-bend labels, and unguarded stress performance were repaired and rerun; none represent independent QA passes. Candidate is the normal commit containing this appended section, parent e3f81e11b6132213e4533985c2bf1a1162070972, with full SHA reported after push rather than a self-referential hash here.

Final hook hierarchy assertion also caught currents being inserted before late-arriving contours in the map mock without style-slot enforcement. Bathymetry sync now explicitly moves its three contour layers below an existing current layer; insertion skips its own field/contour layers. Final focused and surrounding scripts all rerun PASS after this ordering repair. Lifecycle dependencies and current source/data/arrow definitions remain unchanged.

### Remaining qualification and exclusions

Later combined integration/QA must apply this P03 candidate onto the bd94c4a34b72c9d2ba39b6b224b82d1b5eff50d7 lineage before authenticated founder-browser qualification. Required: real ETOPO field/viewport, coarse/angular contour readability and coincident levels, feet recommendation acceptance, labels against actual geographic/context/Opportunity overlays, repeated panning/style reload/toggle behavior, mobile CPU/GPU load and physical-device legibility. No full React/app build or live provider acquisition; developer results are not independent QA or beta/operational acceptance. MapLibre internal texture-adapter upgrade requalification still applies.

No lifecycle dependency/timer/request-helper change, current-field behavior change, scientific value/provenance/freshness/bounds/nearest-value-sampling change, or scientific raster-threshold change. No Dashboard/LayerControls/MapLegend/shell CSS, backend/database/Auth/provider/science-policy/ranking/source-admission/production edits or access. No merge/deployment; CP-10 and operational rollout remain blocked. Stop after candidate commit/push, clean tree and verified P03 remote SHA.
