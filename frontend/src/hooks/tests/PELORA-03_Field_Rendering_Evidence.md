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

## BATHYMETRIC CONTOURS v1.1 — natural geometry and zoom continuity (2026-10-11)

### Entering identity and accepted finding

Entering SHA `31d4e4de975ddc019d5f87378f2278d3a87c80b3`, branch `codex/pelora-03-living-ocean`, worktree `C:\Projects\Pelora-Agent-Worktrees\pelora-03-living-ocean`, clean on entry. Integrated QA reference `f78666a66e76e65ff53e5d2da767f9c8988db90c` is context, not a branch target. The founder rejected v1's staircase geometry and observed zoom/loading/drop-out in the authenticated integrated browser. Historical v1 developer passes above remain developer evidence, not founder acceptance. The explicit v1.1 authorization permits interpolation solely for locating contour crossings; no source/delivery/science policy is amended.

### Confirmed zoom root cause and controlled reproduction

`moveend` invokes acquisition. A changed bbox (or density identity) creates a new exact request context. The unchanged request helper deletes changed-context transport retention and immediately publishes loading/field:null before its 350 ms debounce. The entering hook then overwrites contour buffers with EMPTY_FIELD, hides contour layers and applies empty source data. Thus a valid static display disappears while the replacement is still pending. This is normally **data clearing**, not destruction of both layer lifetimes or recreation of every layer. Moveend/idle/style readiness still participate in acquisition/application; full-map event instrumentation in the founder browser was not performed here.

Controlled actual MapLibre/Edge baseline loads all relevant modules from the exact entering commit using read-only `git show`. The actual hook path receives the same synthetic static field, then a zoom replacement is held. All 20 sampled baseline frames: loading, major layer hidden, zero rendered major features. The baseline screenshot confirms absence of contours, not just a status assertion.

### Geometry comparison and selection

| Approach | Source support and visual consequence | Decision |
| --- | --- | --- |
| v1 nearest-cell threshold boundaries | No location interpolation; contours follow 90-degree midpoint cell edges and can stack multiple levels on the same edge | Rejected founder presentation; retained as before evidence only |
| Marching squares with linear edge crossings | Uses valid adjacent samples to locate each threshold on its source edge; piecewise straight segments connect crossings within one quad | Selected; conventional, deterministic, no extra smoothing |
| Fixed-diagonal marching triangles | Also deterministic, but selects a triangulation diagonal and can add directional bias inside each quad | Considered, not implemented; adds an unnecessary representation assumption |

The chosen implementation precomputes supported quads, then scans them for the unchanged provisional contour levels. Each quad requires four finite **negative** source samples. Null/nonnegative corners suppress that quad; there is no gap bridge, land bridge, inferred mask, extrapolation, spline, smoothing, pseudo-ridge or shaded relief. Quads outside declared bounds are omitted. A missing row/column gap larger than delivered spacing is not bridged (relative 1e-8 tolerance only for floating-point spacing comparisons; coordinates are not rounded/snapped).

For an edge with elevations za/zb and contour elevation L=-depthMeters, geometric crossing fraction is `(L-za)/(zb-za)`; the source elevations remain unchanged. Canonical ascending edge orientation gives adjoining quads identical endpoints. Two crossings form one segment. Four-crossing saddle cases use the determinant of source corner differences (asymptotic decision); exact ties keep deep diagonal regions disconnected. No center elevation is inserted into the scientific field. Shared exact-threshold segments are deduplicated, zero-length segments discarded, and degree-two endpoints joined. Quantized isolated vertices and duplicate-edge backtracking loops have dedicated assertions. Real closed contours supported by differing source samples are permitted; tiny unsupported loops are not synthesized by rounding/smoothing.

**Interpolation changes crossing LOCATION only.** Every segment remains inside one source quad, with endpoints on valid neighboring source edges, bounded by the actual source-coordinate envelope. A planar-fixture test evaluates every endpoint against the original sample plane and proves its elevation equals the configured level. Constituent segments cannot exceed a source-quad diagonal. ETOPO delivered/native spacing still limits interpretation; no new seafloor measurement or finer observational resolution is claimed. Source values, units, provenance, bounds, freshness and nearest-value acquisition/sampling are not changed.

### Display continuity and identity boundary

Bathymetry-only hook render state remembers the last successfully applied field and its image/contour buffer references. On a pending camera refresh, it may keep that static, null-validTime display only when the new viewport intersects its original bounds/sample footprint. Old geometry is never expanded into the newly exposed area. Partial overlap displays only the old supported geometry; it is not complete coverage of the new viewport. A disjoint viewport clears immediately.

The published field and `contextKey` remain those of the old display. `displayContextKey`, `requestedContextKey`, `refreshing:true` and `retainedForViewportTransition:true` explicitly distinguish that display from the pending request. It does not publish the predecessor as the new context. Static status remains static while that valid display persists; no camera-only loading flash, conversion or setData(EMPTY_FIELD) occurs. Exact-context request-cache semantics, cancellation, generation checks and transport-degradation contracts are **unchanged**; this is a bounded transient display buffer, not another request cache.

Both new derivatives are fully constructed before switching pending buffer references. Same-source accepted replacements update the existing image/GeoJSON source and layer objects, without a blank-first step. If geographic/style readiness delays application, the old applied field remains published until application. A later zoom superseding a converted-but-unapplied response restores the actual last-applied buffers; old metadata cannot be published over obsolete pending geometry. Matching source/edition/time identity uses productId/provider/dataset/productVersion/validTime/units/crs/providerUrl, excluding viewport-derived fieldId. A real identity change explicitly clears the old rendering before the new field applies. Malformed success, conversion/application rejection and unavailable changed-context replacement clear the display buffer and invalidate only matching affected-layer request retention. A later idle/style/transport failure cannot restore it. Disposal clears transient references and preserves existing teardown guards.

Actual candidate MapLibre/Edge checks: 20 held zoom-in frames remain static/visible with rendered major lines; 20 held zoom-out frames remain static with rendered major lines; all 30 sampled actual replacement frames keep rendered major lines. The existing source remains the same during ordinary replacement. Same synthetic field and camera views are used before/after. Five candidate regional major labels are placed; the shorter source-supported 200 m contour correctly has no label under the preserved minimum-length rule. No outgoing requests/page errors/map errors. These sampled controlled frames do not prove every animation frame on every GPU or the authenticated integrated app.

### Presentation and lifecycle preservation

Major/minor rules, restrained styling, label collision settings, relief hierarchy and hidden/internal raster are unchanged. Feet and intervals are **still provisional**; founder unit/interval acceptance is open and not locked by this candidate. Currents source/data/arrows and both independent layer effect dependencies/listeners/timers remain unchanged. Original sibling OFF/ON tests, reacquisition without movement, exact-context genuine degradation, malformed-success/JSON/body failure matrix, obsolete/disposed response rejection and texture adapter tests remain and pass. Additional static-zoom tests cover stale null completion after a newer accepted field, unapplied replacement supersession, source edition changes and disjoint clearing.

### Controlled fixture/evidence identities

Exact before/after field: `SYNTHETIC-CONTOURS-40x40-v1`, 1600 finite negative cells, .050-degree grid, [-91,26,-89,28], -5900..-50 m. Canonical fixture SHA256 remains `5a9f0bd3d6d28b6bc2220ca367f30a95c1a6b9aca4d30b59b5c27472bb80afdf`. It is an explicitly synthetic planar slope, not live ETOPO or claimed real seafloor. The same source plane yields staircase boundaries before and oblique linear-crossing contours after. All retained new artifacts are under `frontend/src/hooks/tests/fixtures/bathymetryContours-v11/`:

- `fixture.json`
- `before-staircase.png`, `after-marching-squares.png`
- `before-broad.png`, `after-broad.png`
- `before-zoom-loading.png`, `after-zoom-retained.png`
- `baseline-report.json`, `candidate-report.json`

Screenshots were visually inspected. Reports contain fixture scope, exact entering reference, frame observations and synthetic display/request identities. Empty synthetic geographic layers and local font fallback are controlled limitations; real coastlines/context markers and physical mobile are not represented. Candidate report/source fingerprints belong to the commit containing this section; full candidate SHA is reported after commit/push, not self-referenced here.

### Performance and memory evidence

Measured controlled desktop Node v24.18.0, no new package. Normal regional-size 1600-cell fixture: 13 lines plus five label points. Isolated generation medians roughly 3–4 ms; cold/GC outliers roughly 10–16 ms. Broader .25-degree Gulf fixture, also 1600 cells: 18 features, 327 vertices, 10,220 serialized bytes. 400-cell regional source subset: eight features, 81 vertices, 4,525 bytes. The subset uses exact original source indices/values, not an upsampled field.

Final alternating same-process original-source/candidate ESM run (30 per fixture): Gulf median 2.1643 ms before / 2.4220 ms after; regional 0.6840 ms before / 0.5986 ms after. Fifty alternating normal/regional regenerations: median 2.3829 ms, max 6.4235 ms. With `--expose-gc`, one retained Gulf result showed a process heap delta of 88,696 bytes. This is an observation, not peak allocation, total browser/GPU memory or a leak qualification. Serialized bytes are only another memory proxy; the internal raster/texture remains additional unchanged memory. Pending refreshes do zero contour regeneration in the hook regression. Concurrent runs showed normal/GC outliers up to about 25 ms; these are not hidden by the isolated median comparison.

The existing 6000-feature complexity guard now also bounds total generated constituent segments before expensive joining. Alternating 2600-cell pathological input fails closed rather than producing a dense field of tiny contours. Observed isolated rejection about 36–50 ms, with a concurrent-browser stress run up to 115 ms. No device timing guarantee; mobile performance and actual ETOPO complexity still require qualification. Initial unoptimized quad allocation and a misleading VM-realm comparison were replaced by supported-quad precomputation/range skipping and same-realm alternating ESM comparison. No favorable VM figures are presented as a production speedup.

### Actual validation commands/results

All PASS:

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

Controlled baseline/candidate browser comparison and preserved texture regression:

```powershell
$env:PELORA_BROWSER_TEST_NODE_MODULES='C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
$env:PELORA_CONTOUR_BASELINE='1'
$env:PELORA_CONTOUR_RENDER_OUTPUT=Join-Path $env:TEMP 'pelora03-contours-v11-baseline'
node frontend/src/hooks/tests/bathymetryContoursRender.test.mjs
$env:PELORA_CONTOUR_BASELINE='0'
$env:PELORA_CONTOUR_RENDER_OUTPUT=Join-Path $env:TEMP 'pelora03-contours-v11-candidate'
node frontend/src/hooks/tests/bathymetryContoursRender.test.mjs
$env:PELORA_TEXTURE_RENDER_OUTPUT=Join-Path $env:TEMP 'pelora03-contours-v11-texture'
node frontend/src/hooks/tests/bathymetryTextureRender.test.mjs
```

All three PASS, actual installed headless Edge/MapLibre 5.24.0, controlled fetch/body/image/render pipeline, external requests blocked. Internal raster regression still proves NEAREST minification (9728), no mipmaps, five same band colors, transparent nonnegative cells, image replacement and forced style recreation. Performance comparison extracted only the known entering presentation file via read-only `git show` to TEMP, set `PELORA_CONTOUR_BASELINE_PRESENTATION` to that .mjs, then ran `node --expose-gc frontend/src/utils/tests/bathymetryContours.test.js`. Optional baseline comparison does not require child-process privileges for ordinary utility assertions; an initial restricted Node `git` spawn was replaced by explicit read-only extraction.

Five affected JS/mjs files pass `node --check`; whitespace `git diff --check` passes. Scoped source/test/fixture diff inspected for unrelated/sensitive changes before explicit staging. No install/copy of dependencies/environment, real provider/Auth/database access, backend qualification or app build. Developer results do not establish independent QA.

### Remaining acceptance and stop

Later combined integration/QA must apply this P03 candidate onto the f78666a66e76e65ff53e5d2da767f9c8988db90c lineage before founder browser qualification. Required: actual ETOPO naturally readable structure at broad/regional/closer scales, zoom/pan/replacement continuity against real geographic loading, source/edition/failure boundaries, label/context/Opportunity collisions, provisional units/interval decisions, mobile CPU/memory/GPU and physical-device readability. No navigation-grade, new observational resolution, source admission, beta-ready or operational claim.

No source scientific values/provenance/time/bounds/native or delivered resolution changes, nearest-value sampling change, current behavior change, independent layer-lifetime change, texture repair change, backend/database/science-policy/production changes, merge or deployment. CP-10 and operational rollout remain blocked. Normal follow-up candidate commit/push only on P03, verify remote full SHA and clean tree, then stop.


## Bathymetry Detail + Map Intelligence Cleanup vNEXT — developer candidate (2026-10-11)

### Binding, authorization and preserved lineage

Human-confirmed starting integration: e8820d13d9f39df40274267c12a7ac23eeff6ce1, codex/pelora-ui-integration-contours-v11-metadata-v1. Its remote ref was checked unchanged before checkpointing. Source-only P03 5941ce99d6ecc0fc0f74194a0dffc4d0fba340f3 was not used as the starting point.

Managed worktree: C:\Users\User\.codex\worktrees\bathymetry-detail-vnext\pelora-03-living-ocean. Branch: codex/pelora-03-bathymetry-detail-vnext. Entering HEAD e8820d13d9f39df40274267c12a7ac23eeff6ce1, clean tracked/staged/untracked status. The original permanent P03 checkout and integration branch were preserved. No reset/rebase/merge/cherry-pick or session handoff. Governance router checkpoint remains 94cc8b41fbf1e440dc2a27618617704a93025782.

This current human request explicitly authorizes removal of the Bathymetry/Current disclosures. That narrow LayerControls.jsx presentation change supersedes the earlier packet's read-only ownership for this specific block; it does not authorize Dashboard, shell CSS, other agent work or governance changes. Root router/board/mission and existing state/scalar-delivery/runtime contracts apply. Legacy pelora-spatial-field-v1 remains distinct from governed scalar delivery; no scalar activation/source admission is added.

### Before/after and scientific boundary

Before: actual integration LayerControls contained collapsed field Source & Evidence Details, a technical formatter and raw metadata JSON. After: neither field disclosure nor raw provider/grid/count/version/contract/reason JSON is in the captain panel. Bathymetry caption no longer includes ETOPO. Governed Available/Loading/Stale/Unavailable/Degraded labels, age and active-layer logic are unchanged. Original field objects, metadata, freshness logic and the internal fieldStatusText diagnostic formatter survive. Tests snapshot internal state before/after interaction. No other disclosure/product block changed.

Before: 14 metric display levels, beginning at 100 m (about 328 ft), with a major 200 m (about 656 ft) and limited close detail. After: 176 unique FEET display levels, converted to contour thresholds by exact meters = feet * 0.3048 at the presentation boundary. Native source elevations, source/provider/time/value identity, units, sampling spacing and geography are untouched. This is more vertical isobath detail, NOT higher observational resolution.

Marching squares and linear edge-crossing geometry from v1.1 remain: interpolate crossing LOCATION between valid negative neighboring samples only; no interpolated new source depth, smoothing, spline, missing/nonnegative bridge, extrapolation or fabricated ridge/canyon. Source support, saddle resolution, deterministic joining and degenerate/duplicate-edge rejection remain tested. Existing nearest raster/value sampling and five raster bands are unchanged; raster remains hidden internal support.

### Exact interval and zoom strategy

Levels are the union of tiers; prior tier levels persist. All values below are feet, ranges inclusive:

| Minimum zoom | Display levels added |
|---|---|
| Broad (<6) | Major 100, 300, 600, 1000, 2000, 3000, 5000, 10000, 15000, 20000, 30000, 35000 |
| 6 | 50–300/50; 300–1000/100; 1000–6000/500; 6000–20000/1000 |
| 8 | 10–100/10; 100–300/25; 300–1000/50; 1000–3000/250; 3000–10000/500; 20000–36000/1000 |
| 10 | 5–100/5; 100–300/10; 300–1000/25; 1000–3000/100; 3000–10000/250; 10000–36000/500 |

Major classification: all broad explicit levels; below 100 ft, multiples of 20 ft plus 50 ft; 100–300 ft multiples of 100; 300–1000 ft also 500; 1000–6000 ft multiples of 1000; deeper multiples of 5000. Other levels are minor. Source-supported 5 ft is reachable at close zoom; absent shallow values do not produce a shallow contour.

Minor visibility additionally waits until the source quad's pixel support / elevation span predicts about 6 pixels between that interval. Per joined line, use the strictest constituent segment's minimum zoom, clamped to 22. This is a deterministic clutter guard, not bathymetry smoothing or scientific precision. It can defer an entire fine isobath where part crosses a steep slope; that is an explicit readability tradeoff.

MapLibre integer-zoom filters and step opacity reveal precomputed geometry. Unrevealed labels are filtered out of collision placement. Existing major/minor line color, width (.65 / 1.1), maximum opacity (.45 / .65), relief slot and hidden-raster behavior stay. Labels: feet only in captain use; one anchor on an existing vertex per sufficiently long joined MAJOR line, beginning zoom 5 and its level's own minimum zoom, 11 px, collision aware, no overlap/ignore-placement. No per-cell repeated labels. Contours remain below geographic/context layers, currents and ranked Opportunity presentation; no Opportunity/Signal/Place code edited.

### Continuity, transport and scalability

Independent effects, source/edition checks, actual displayed field/context identity, supported-footprint overlap retention and atomic replacement from v1.1 remain. A changed viewport acquires its exact request context and can keep the supported old static display pending; disjoint context or rejected/unavailable replacement clears under existing rules. It never labels a different source/time as current.

An identical healthy, already-applied static request context skips redundant camera-triggered bathymetry acquisition/conversion. Degraded static state remains eligible for a same-context camera retry and normal recovery. Currents continue their original acquisition behavior. Periodic refresh and load/style recovery explicitly force acquisition; enabled-layer startup still works without map movement. The exact request identity includes bbox/density; no new cross-context request cache. True context changes still request replacements. No provider-grid/backend/storage change.

All levels are preprocessed once per accepted field; binary-search quad-to-level indexing avoids every-level/every-quad scans. Per-quad support calculations are reused. Zoom density itself uses MapLibre filtering, without regenerating contours per animation frame. No general worker/cache/tiling framework or new dependency was added. Existing 6000 segment/feature guard is retained, plus a bounded 12000 quad-level assignment guard to avoid unbounded allocations. Complex valid terrain can fail presentation safely instead of creating an unusable map; source-specific cost still needs live QA.

### Measured developer evidence

Controlled planar Gulf fixture: 1600 cells, 123 features (115 lines / 8 label anchors), 2793 vertices, 87996 serialized GeoJSON bytes. Regional 400-cell subset: 30 features, 576 vertices, 25150 bytes. These are client derivatives; source/network payload/storage contract is unchanged. GC-observed one-result heap delta about 261056 bytes; not peak allocation/GPU memory.

Same-process alternating accepted-integration/candidate calls: Gulf median 2.05 -> 16.37 ms; regional .67 -> 3.47 ms. Separate 25-call normal run median 18.47 ms, max 38.94 ms. 50 alternating regenerations median 15.51 ms, max 33.45 ms. Increased detail costs CPU; no claim of cost parity. Adversarial 2600-cell checkerboard rejected in 6.70 ms. Desktop timings vary; no physical-device benchmark claim.

Controlled actual MapLibre 5.24.0 / headless Edge candidate: pending zoom-in 20 frames, real source replacement 30 frames and pending zoom-out 20 frames remain visible/static without blanking. Baseline integration also retains continuity, as expected; this packet does not claim to repair it again. Reports query tiled rendered features (duplicates possible), not unique contour count. Deep fixture broad rendered query 12 -> 14, regional candidate has 37 minor rendered query entries and 5 placed labels.

Shallow identical numerical fixture: eligible complete-source line counts at zoom 7/9/11 = 1 / 9 / 19, at both 1000 px and 390 px widths. Source-supported levels reach 5–95 ft; actual placed labels include 40/50/60 ft. Screenshots show visible line pixels and feet labels. Forty animated pan frames at each width never publish loading/hidden: desktop median 17.9 ms, max 18.7; phone-emulation median 18.2, max 19.4. This is the desktop GPU with phone layout, not physical mobile throughput.

Texture GPU regression: same five raster depth colors plus zero/positive transparency, NEAREST (9728), useMipmap false; replacement and style recreation pass. The controlled texture fixture is explicitly vNEXT: retain the seven original band values and first seven sample locations, but stop repeating extreme alternating bands across the other 35 columns (positive cells instead). Negative rectangles 165; total/finite cells 1386; native raster behavior unchanged. The original repeated-band fixture exceeded the unchanged 6000 contour guard with denser levels and correctly became unavailable; the guard was not disabled. Historical original-fixture evidence is preserved.

Actual React controls bundled from current worktree, unchanged CSS with ONLY external font import omitted in the offline harness: both toggles work independently, no details/pre/raw telemetry, internal JSON snapshot unchanged, desktop and 390 px layout fits, zero page/runtime/external-request errors. This is component layout qualification, not the full authenticated application.

### Commands and results

All execute from this worktree using Node v24.18.0. No installed package/.env directory copied or new install. Tracked MapLibre 5.24.0 and style spec; existing read-only React 19.2.7 / rolldown toolchain path C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules; bundled browser tools C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules. No other checkout is edited.

- node frontend/src/hooks/tests/useMapLibreOceanFields.test.js — PASS all original decoding/null/body-read/HTTP/provider-unavailable/malformed/canvas/source/addLayer/image-registration/style/idle/zero/sibling/abort/dispose/obsolete/toggle/texture/zoom continuity cases, plus unchanged-camera deduplication and forced-refresh assertions.
- node frontend/src/utils/tests/oceanFields.test.js — PASS original presentation, values/units/geometry/masks/five-band/texture/filter/teardown checks.
- node frontend/src/utils/tests/viewportFieldRequests.test.js — PASS original context/density/cache/per-layer invalidation/sibling/race/cancellation/provider/null/malformed-success checks; helper implementation unchanged.
- node --expose-gc frontend/src/utils/tests/bathymetryContours.test.js — PASS threshold/footprint/support/gaps/saddle/quantization/determinism/immutability plus 5–300 ft, four density tiers, actual MapLibre expressions/style and unrevealed-label collision filter. Performance baseline loaded from temporary .mjs extracted by git show e8820d1:frontend/src/utils/oceanFieldPresentation.js via PELORA_CONTOUR_BASELINE_PRESENTATION.
- node frontend/src/hooks/tests/mapMetadataCleanup.test.js C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules — PASS 19/19, actual JSX/SSR/freshness/metadata preservation.
- Set PELORA_BROWSER_TEST_NODE_MODULES to bundled path above; node frontend/src/hooks/tests/bathymetryContoursRender.test.mjs — PASS actual candidate GPU/continuity/shallow density/pan; PELORA_CONTOUR_BASELINE=1 — PASS accepted integration comparison. External routes denied; zero attempted external requests/map/page errors.
- Same browser env; node frontend/src/hooks/tests/bathymetryTextureRender.test.mjs — PASS production NEAREST/no-mipmap, 5 colors/transparency/replacement/style.
- Same browser env; node frontend/src/hooks/tests/mapIntelligenceCleanupRender.test.mjs C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules — PASS desktop/phone React interaction/immutable evidence/no disclosure/layout.
- node frontend/src/utils/tests/peloraMapStyle.test.js — PASS 12/12 hierarchy/style/mobile-sheet/Opportunity stacking regressions.
- node frontend/src/utils/tests/syntheticSstDisplay.test.js — PASS 12/12 existing isolated synthetic display regressions; no activation.
- node frontend/src/utils/tests/mapObservationDisplay.test.js; mapEnvironmentalObservations.test.js; mapRuntimeResponse.test.js; node frontend/src/hooks/tests/useMapLibreEnvironmentalObservations.test.js; node frontend/src/utils/tests/opportunityEvaluationState.test.js — PASS unchanged controlled context/observation/current/Opportunity contracts.
- node --loader <temporary file URL> frontend/src/hooks/tests/intelligenceRecovery.test.js — PASS 55/55 actual Dashboard/Today/Intelligence recovery. Temporary ESM resolver points react/react-dom/rolldown bare imports to the read-only toolchain.
- Same loader; intelligenceCaptainStateRegression.test.js — 66/71 PASS (Opportunity navigation/selection, mobile, state/race/privacy/access fixtures); five documentary backend-builder cases cannot resolve ../../../../backend/server.js from the existing data-URL replay wrapper (ERR_UNSUPPORTED_RESOLVE_REQUEST). No backend was run or modified. Both full attempt and frontend selection retry retain this harness limitation; no full-suite pass claim.
- node --check on all 8 affected JS/mjs and git diff --check — PASS before explicit scoped staging; JSX parsed by actual rolldown tests. No app build/provider/Auth/database/server/restart/production access.

### Artifacts, exact changes and qualification limits

New controlled artifacts under fixtures/bathymetryDetail-vNEXT: integration-report.json, integration-broad.png, candidate-report.json, deep-fixture.json, shallow-fixture.json, candidate-broad.png, candidate-regional.png, shallow-phone-z9.png, shallow-phone-z11.png, navigation-desktop.json, navigation-phone.json, texture-report.json, controls-report.json, controls-phone.png. JSON reports pin actual tested source SHA256 and fixture identities. Historical artifacts are untouched.

Implementation: components/LayerControls.jsx; hooks/useMapLibreOceanFields.js; utils/oceanFieldPresentation.js. Dedicated tests: hooks/tests/useMapLibreOceanFields.test.js, bathymetryContoursRender.test.mjs, bathymetryTextureRender.test.mjs, mapMetadataCleanup.test.js, mapIntelligenceCleanupRender.test.mjs (new); utils/tests/bathymetryContours.test.js. This evidence file is appended, not historically rewritten.

Remaining: founder visual acceptance on actual ETOPO shallow/mid/deep viewports with real base geography; full authenticated Opportunity/Signal/Place overlay interaction/collision and runtime console check; physical iOS/Android rendering, low-end CPU/heap/GPU/navigation cost; source-dependent complexity guard frequency and steep-slope minor deferral. Offline fixture/map/component passes are developer evidence, not independent QA, live-source admission, navigation-chart quality, physical-device acceptance or rollout qualification. Feet is now human-locked presentation; intervals/readability remain subject to visual acceptance.

No source science/provenance/evidence/freshness/privacy/ranking/Opportunity/governance policy changed. No database, production, merge or deployment. CP-10 and operational rollout remain blocked. Normal candidate checkpoint on this new P03 branch only; verify full remote SHA and clean tree, then stop for combined integration/QA.


## Current-flow point presentation v1 (2026-10-12)

Separate human-approved candidate from combined governance/continuity baseline 10150d5a8187e4ba52f62c0c747d919b30345b7d. Bathymetry source and history untouched. See [current-flow developer evidence](currentFlowPresentation.evidence.md) for exact scope, bounded point-glyph science boundary, tests/source identities, performance and inherited harness exclusions. This does not grant independent QA, integration, physical-mobile acceptance or deployment.

## QA-only field-request authentication repair — 2026-10-13 UTC

### Identity, authorization and ownership

Entering/source checkpoint: `63ce9882345a9b087f1d256ea95368c5fb826e03`; branch `codex/pelora-03-field-auth-transport-v1`; isolated root `C:/Users/User/.codex/worktrees/field-auth-transport-v1/pelora-03-living-ocean`. Entering staged, unstaged and untracked status was clean. This compatible successor includes accepted runtime `4ea104d68c9ded93ad8b016853d42691a3b582f5` and canonical `d5d40020b13de48838b93f4262072d7b57b13113`.

Direct human approval in P03 permits the exact QA-only request payload/destination and synthetic tests, and the separate scoped P02 coordination message. Earlier automatic approval rejections executed no write; work remained paused until direct approval here. The approved message was delivered to P02. Caller ownership remains P02: Dashboard's existing session is passed by reference through MapLibreIntelligenceMap, with no new Auth reader or sign-in flow. P02's separate dependency candidate is `bfbf65df803dc57ed04305b1d190dcf9c882c037`, parent `76dfe905`; it is not included or qualified by this P03 test record.

P01's staged assembly at `C:/Projects/Pelora-Agent-Worktrees/pelora-shell-local-qa-integration-v1` remains at `63ce9882345a9b087f1d256ea95368c5fb826e03` with its staged shell/read-only-guard changes and untracked integration records. P03 inspected status only and never edited/staged/committed that checkout. Original P03 checkout and unrelated files remain preserved.

### Baseline reproduction

P04's accepted finding is recorded at `00bef1d85bea62dc1468d722e02de7c3dc4a3ea6`. Before this repair, its controlled standalone startup/boundary replay confirmed both actual hook request adapters omit Authorization: two GET requests received 403 before authoritative Auth or the field handler (0 authority reads, 0 handler calls). A separate explicit synthetic authorized control returned 200 with two authority/access reads. This was injected authority, not a real Supabase connection.

The new adversarial hook suite also replayed the exact immutable entering hook extracted with `git show 63ce9882345a9b087f1d256ea95368c5fb826e03:frontend/src/hooks/useMapLibreOceanFields.js` to `TEMP/pelora03-auth-baseline-63ce988-hook.js`, without branch movement. With `PELORA_QA_AUTH_BASELINE_HOOK` set to that file, `node frontend/src/hooks/tests/useMapLibreOceanFields.test.js` failed as expected at the authenticated bathymetry acceptance assertion: actual unavailable versus required static. Sanitized counters: 2 requests, 0 authority calls, 0 handler calls, both layers unavailable. Unsetting that variable and running the current-source suite passed. Existing pre-auth regressions passed before the baseline stopped at that new assertion.

### Exact bounded implementation

New `qaFieldTransport.js` uses only a synchronous getter for the existing caller-supplied session reference. It does not call an SDK, retrieve a session, read browser storage, create a login/refresh flow, persist or log credentials, or mutate global fetch/default headers.

Explicit validated `VITE_PELORA_LOCAL_QA_READ_ONLY=1` activates the port. Existing localQaReadOnly validation requires approved project `https://vqzskzoizpomwzgbgdwl.supabase.co` and API `http://127.0.0.1:8787`. Final canonical URL must have the exact origin and `/api/ocean/field` path, no URL credentials/fragment/normalized alias, exactly one each of the existing layer/bbox/density/time parameters, finite ordered geographic bounds, supported layer, bounded integer density and latest-available time. Unknown/duplicate parameters, other origins/ports/paths, method overrides and bodies fail before dispatch. Only GET is sent, with a per-request Authorization Bearer access-token header, `redirect:error` and `credentials:omit`. Returned redirect/auth-denial responses from injected ports are also rejected. No provider, tile, imagery, analytics or hosted fallback receives this header.

Session and token must be nonanonymous, structurally parseable and unexpired; expected issuer is `https://vqzskzoizpomwzgbgdwl.supabase.co/auth/v1`, and subject equals the current session principal. These are defensive consistency checks ONLY; no client signature/authenticity/access authority is claimed. Unchanged backend Auth/user and captain-access verification still decide access. Synthetic authoritative denial with otherwise matching decoded claims remains 403 with no field handler call.

Each independent layer retains its existing request/cache/render lifetime. Current session is rechecked immediately before dispatch, after fetch/body decoding and at state publication. Captured identity is copied so same-object mutation is detected. Principal change/logout cancels generations, invalidates only matching layer context and clears that layer's display/retained buffers. A late old response cannot invalidate a newer context/principal or resurrect on idle/style/failure. HTTP 401/403 are authentication rejection, not eligibility for retained degraded rendering. Genuine transport/body/provider failure under a still-valid same principal preserves existing exact-context degradation. Same-owner credential update cancels/reacquires each enabled layer once, without map movement/remount/source recreation; identical credentials do not reacquire. Normal non-QA fetch remains the original URL plus `{signal}`, with no session inspection/header/redirect/cookie behavior change.

No edits to source values, contour thresholds/interpolation/geometry, sampling, source provenance, current trace algorithm, API resolver, SDK client, backend policy, UI/shell or scientific gates.

### Changed paths

- frontend/src/hooks/useMapLibreOceanFields.js
- frontend/src/utils/qaFieldTransport.js
- frontend/src/utils/tests/qaFieldTransport.test.js
- frontend/src/hooks/tests/qaFieldTransportFixtures.mjs
- frontend/src/hooks/tests/useMapLibreOceanFields.test.js
- frontend/src/hooks/tests/bathymetryTextureRender.test.mjs
- frontend/src/hooks/tests/bathymetryContoursRender.test.mjs
- frontend/src/hooks/tests/currentFlowRender.test.mjs
- frontend/src/hooks/tests/PELORA-03_Field_Rendering_Evidence.md

The three browser-harness additions supply useRef and the real transport in explicit controlled non-QA mode; original render assertions are retained. QA authentication is tested by the actual hook/request helper with explicit QA environment and the real pure QA HTTP boundary, using injected synthetic authority/data. The production data-connected server runtime is never imported or started.

### Commands/results and failure matrix

Node v24.18.0; existing tracked MapLibre 5.24.0 and already available browser/React test runtimes; no installs or dependency/environment copying.

- `node frontend/src/utils/tests/qaFieldTransport.test.js` — PASS exact per-request payload/destination and query checks; blocked target/method/body never dispatch; missing/malformed/expired/wrong issuer/subject/anonymous credentials; redirects, 401/403; pre-dispatch and post-await guards; logout/principal/refresh/cancel/disposal/same-object mutation; expiry during body-read failure; same-credential dedupe; normal mode unchanged; no SDK/storage/logging APIs; real loopback QA boundary missing-header 403 and synthetic authorized bathymetry/current GET 200 (4 authority/access reads, 2 field handlers); authoritative rejection with matching claims denies access.
- `node frontend/src/hooks/tests/useMapLibreOceanFields.test.js` — PASS original malformed null/invalid/empty success, genuine body failure, HTTP-error/provider-unavailable retention, zero versus missing, cancellation/context/race/cleanup, layer toggles, style-not-ready startup, map/canvas/source/image/trace application failure and affected-layer locality. New actual QA hook matrix passes authorized acquisition, same-token dedupe, same-owner refresh without movement/source recreation, auth-denial non-resurrection, malformed sibling isolation, logout/old body, changed principal/old malformed result, render-before-passive-effect guard, post-decoder/pre-publication microtask gap, later transport failure, valid recovery, newer viewport and disposal guards.
- `node frontend/src/utils/tests/oceanFields.test.js` — PASS unchanged scientific values/bands, transparency, geometry, nearest/no-mipmap texture behavior, layers/order and conversion validation.
- `node frontend/src/utils/tests/viewportFieldRequests.test.js` — PASS exact-context degradation/invalidation, sibling isolation, malformed-success, viewport/density/race/cancel/dispose.
- `node frontend/src/utils/tests/currentFlowPresentation.test.js` — PASS original point-trace freshness/animation/static/visibility/expiry/failure/disposal constraints.
- `node frontend/src/hooks/tests/captainContinuity.test.js <existing React runtime>` — 29/29 PASS; `captainContinuityRegression.test.js <same runtime>` — 19/19 PASS. Runtime argument: `C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules` (read-only resolution, no copying).
- `node frontend/src/hooks/tests/mapMetadataCleanup.test.js <same runtime>` — 20/20 PASS. An initial invocation used the nonexistent components/tests path and failed MODULE_NOT_FOUND; corrected to the actual hooks/tests path and rerun, no install.
- `node frontend/src/utils/tests/peloraMapStyle.test.js` — 12/12 PASS.
- `node frontend/src/hooks/tests/bathymetryTextureRender.test.mjs` — final-source PASS: 512x512, NEAREST 9728, useMipmap false; all five governed band samples plus transparent water samples; zero external requests/map errors. Output `TEMP/pelora03-texture-render-B4mMuW`.
- `node frontend/src/hooks/tests/bathymetryContoursRender.test.mjs` — final-source PASS geometry/detail and intersecting zoom continuity: 14 broad features, 37 regional minor features, 5 regional labels, 20 continuity frames. 1000/390px camera frames: median 18.1ms, max 21.6/18.9ms, no loading flash; detail zoom 7/9/11 retained static state, zero external requests. Output `TEMP/pelora03-contours-o8qP0n`.
- `node frontend/src/hooks/tests/currentFlowRender.test.mjs` — final-source PASS real MapLibre trace rendering, fresh animation, reduced-motion/stale/degraded fallback, malformed locality, style/idle/failure non-resurrection and image disposal. Output `TEMP/pelora-current-traces-hFDtGL`.

Browser commands use `PELORA_BROWSER_TEST_NODE_MODULES=C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules`, existing headless Edge, synthetic fields and blocked external routes. All eight affected JavaScript/module files pass `node --check`; unstaged and staged whitespace checks must pass before commit. Diff inspection includes explicit scoped staging and no unintended/sensitive content.

### Limits and next gate

Developer controlled passes are NOT independent P04 acceptance, live Auth, backend/database qualification, physical-device mobile, external source admission or launch authority. Exact combined P01 candidate must include separately approved P02 session handoff, then receive independent P04 delta review. No real token was retrieved/transmitted and no data-connected preview/provider/Auth/database/service was launched/contacted. CP-10/operational rollout remain blocked. No production/main merge/deployment/database mutation/migration/science-policy change.

Historical documentary-builder exclusions and old Intelligence import-stripping harness incompatibilities remain unchanged; this packet neither claims to close nor substitutes tests for them. Current focused captain/field suites listed above passed on this actual P03 working tree. Headless 390px render evidence is not physical mobile qualification.

Final tested SHA-256 source/fixture fingerprints (before evidence-only commit):

- frontend/src/hooks/useMapLibreOceanFields.js: `c212a13adc35abf008531301f5a9d185f66f0d2483c51209fe9b2f08818bad49`
- frontend/src/utils/qaFieldTransport.js: `04acfdca82d646ca09185804b6e067f677852b0efe54d1a6d018b5596fb8d5b0`
- frontend/src/hooks/tests/qaFieldTransportFixtures.mjs: `06258df0bfb947e990aa345139b9adf7b399c2c09a2933e8de9e9be622334a2a`
- frontend/src/utils/tests/qaFieldTransport.test.js: `2c55ffb1bd6fd2c0f54226d81d21a44098bfb3f848e8d87ef6ff7291e70a83ef`
- frontend/src/hooks/tests/useMapLibreOceanFields.test.js: `c33333e00800f13cca91c3ba0ca7b2f2b28c9e3201202bb85132341646666176`

## P04 deferred-application race repair — October 12, 2026 (America/New_York)

Original candidate `a7835851fb69b68ef4a1881633296347e5ad3595` was independently rejected by P04 at evidence commit `151359d358abe684edcf3bc8dd076a64646aacd0`. Earlier developer passes did not close the pending-style/idle race. This successor is on the same isolated `codex/pelora-03-field-auth-transport-v1` branch/root, entering clean at a7835851; no P02 caller/backend/P01 assembly edits or history rewrite.

Read P04's exact source/report and additional probe retained at `TEMP/pelora04-field-auth-a7835851/frontend/src/hooks/tests/useMapLibreOceanFields.idleProbe.qa.js`. Before changing implementation, appended the same acquired/converted-before-style-ready, render-null-before-passive-effects, idle-ready sequence to the dedicated hook test. Running `node frontend/src/hooks/tests/useMapLibreOceanFields.test.js` on a7835851 implementation failed as expected: `pending idle must not publish prior-owner current`. Both prior field buffers had been acquired while style was not ready. Existing eighteen grouped sections passed before the new failure. P04's recorded observation was old static bathymetry/stale currents and visible layers after logout; this is controlled environmental fixture evidence, not private-data exfiltration or live-browser qualification.

Confirmed root cause: apply/sync deferred map operations and queued status updaters lacked the render-time session/principal boundary checked by transport/onState. Waiting for passive cancellation was insufficient.

Narrow repair: the existing shared session ref now advances a principal revision synchronously during render on principal/anonymous changes. Existing per-layer transports capture that revision, including requests, body-error completion and application/publication authorization. Deferred apply/sync checks current owner revision plus valid current credentials before touching old render buffers and before success publication. Invalid authorization cancels requests/readiness callbacks, invalidates matching retained layer context and uses the existing affected-layer rejection/clearing path. Queued status updaters capture the publication revision; queued success additionally captures owner-bound application authorization. Old loading/null/success cannot clobber a later principal after delayed updater execution. Owner A-to-B-to-A cannot reuse the old revision even before passive effects. Valid same-owner token renewal remains authorized to retain static/current rendering; credential reconciliation before acquisition schedules once and avoids a style-event renewal blank.

Changed successor paths only:

- frontend/src/hooks/useMapLibreOceanFields.js
- frontend/src/utils/qaFieldTransport.js
- frontend/src/hooks/tests/useMapLibreOceanFields.test.js
- frontend/src/utils/tests/qaFieldTransport.test.js
- frontend/src/hooks/tests/PELORA-03_Field_Rendering_Evidence.md

No destination/header/method/issuer/backend-authority contract change. No SDK/storage/login/refresh flow, real token retrieval/transmission, provider/Auth/database connection, data-connected launch, scientific/source/presentation/geometry/sampling change, P02 caller or P01 staged-assembly mutation.

Developer validation on actual successor source:

- `node frontend/src/hooks/tests/useMapLibreOceanFields.test.js` — PASS original field/auth/lifecycle/race/malformed/style/continuity/current/zero/cleanup assertions plus P04 pending idle/logout; idle/style.load/readiness timer crossed with logout/new principal/owner roundtrip/valid same-owner renewal; delayed React success/loading updaters with stable callback identity across owner change. Old owner geometry is absent and field:null before passive cleanup; valid same-owner renewal remains visible and recovers. Rejection may remove layers/sources, consistent with existing clear/hide contract; tests accept absent or hidden layers rather than requiring an otherwise unnecessary retained hidden layer.
- `node frontend/src/utils/tests/qaFieldTransport.test.js` — PASS all existing exact payload/target/denial/backend authority/async/cookie/redirect/normal-mode controls plus captured application/publication revision, owner roundtrip, renewal, disposed capture and obsolete roundtrip body-error suppression. An added disposed-capture assertion initially found a nullable observed-identity access; fixed to handle null safely and rerun PASS. No tests were removed/weakened.
- `node frontend/src/utils/tests/viewportFieldRequests.test.js`, `node frontend/src/utils/tests/oceanFields.test.js`, `node frontend/src/utils/tests/currentFlowPresentation.test.js` — PASS unchanged dedicated request/presentation/current regression suites.
- Four affected JS files: `node --check` — PASS; scoped diff/whitespace checks — PASS before checkpoint.
- Existing headless MapLibre texture/contour/current render scripts rerun with synthetic fixtures and blocked external routes; final-source results appended below. Prior 29/19/20/12 broader captain/metadata/map suites remain source-scoped predecessor evidence; no new unrelated broader claims or exclusions closed.

Independent QA is still REQUIRED on the exact successor and final combined P02/P01 candidate, including P04's race and actual caller composition. This record does not mark P04 as passed. Live Auth, connected preview, founder/physical mobile/GPU/source qualification, CP-10 and rollout remain separate blocked/pending gates. No merge/deployment/production/database mutation or migration.

Final-source render validation: all three existing controlled MapLibre scripts PASS. Texture output `TEMP/pelora03-texture-render-zVOy8F`: 512x512, NEAREST 9728, useMipmap:false, original five color samples/transparency, 0 external requests/map errors. Contour output `TEMP/pelora03-contours-r2aVZe`: 14 broad features, 37 regional minor, 5 regional labels, 20 continuity frames; 1000/390px navigation medians 18.2/18.1ms, maxima 19.1/18.7ms, no loading flash; zoom 7/9/11 static, 0 external requests. Current output `TEMP/pelora-current-traces-9pQEy3`: PASS animation/static/malformed/style/idle/failure/disposal. Commands and existing runtime variable are unchanged from the preceding packet. Final hook sweep additionally verifies truthful QA OFF/ON both directions and sibling state/source identity. Disabled field effect retains publication authorization until its cleanup so queued OFF can publish truthfully; cleanup disposes its empty request/transport lifetime and prevents old queued OFF overriding a new lifetime.

Final successor tested SHA-256 fingerprints:

- frontend/src/hooks/useMapLibreOceanFields.js: `ca0323610ba821f46a7eb55353515ce2b2d05ef5dfeb86a052b888422b7c94d9`
- frontend/src/utils/qaFieldTransport.js: `d4453ec92dee8a9915af8aab615c197a92f378bd07a9ee05ab3f303469246ab6`
- frontend/src/hooks/tests/useMapLibreOceanFields.test.js: `ad7df88d98f8bc559b5e44ba52c70d84f54b18a79eb4ce6aa71e092fd1947712`
- frontend/src/utils/tests/qaFieldTransport.test.js: `b9a972d9bfb958f7040a453be7b725bdd185a61aa8070ace41f997c9dbe86911`

## P04 mutable-principal roundtrip repair

Entering clean successor `e818e612beb70902856223607dd928d5480c818a` on the same isolated `codex/pelora-03-field-auth-transport-v1` worktree. Independent P04 evidence `dd830c3115cc9c42d655d54bed56a124ef107cd5` confirms the prior logout/style fix, but rejects same-object A-to-B-to-A. No prior independent clearance is inferred.

Before repair, appended the exact synthetic session-object mutation sequence to the actual hook harness: valid bathymetry/current buffers acquired while style not ready; mutate the same user ID/token to B and render without effects; restore A in the same object and render; make style ready and fire idle. `node frontend/src/hooks/tests/useMapLibreOceanFields.test.js` failed on e818 implementation: `same-object A-B-A must obsolete prior current`, actual 1 rendered feature versus expected 0. The existing twenty-two grouped sections passed before this added failure. This reproduces P04's accepted residual P1 without real credentials or service connections.

Confirmed cause: previous identity was read from sessionRef.current, an alias of the incoming mutable session/user object. Mutation erased the previous identity before comparison. Repair copies only primitive session-present, string principal ID and tri-state anonymous flag into a fresh internal snapshot each render; comparisons never read the previous caller object. Every observed principal/anonymous/session-presence transition advances the existing monotonic revision, including return to A. The revision is also a passive reconciliation dependency, so a final A render still invalidates/reacquires after an intermediate B render even if only the final effects commit. Token-only updates are not owner transitions, preserving valid same-owner renewal. The copied snapshot contains no access token; existing approved session interface and transport/expiry/backend authority checks are unchanged.

Only three paths changed:

- frontend/src/hooks/useMapLibreOceanFields.js
- frontend/src/hooks/tests/useMapLibreOceanFields.test.js
- frontend/src/hooks/tests/PELORA-03_Field_Rendering_Evidence.md

The transport helper, request helper, P02 callers, backend/Auth policy, SDK/resolver, scientific values/provenance, bathymetry thresholds/geometry/nearest texture sampling, current-flow algorithm and P01 assembly are unchanged.

Validation on actual source:

- `node frontend/src/hooks/tests/useMapLibreOceanFields.test.js` — PASS original twenty-two grouped sections plus exact mutable A-B-A deferred field/render rejection; same-object principal, anonymous and malformed-identity roundtrips; final-render-only effect recovery exactly once per enabled layer without movement; old bathymetry success/current malformed body completions suppressed; later failure retains only newly accepted current; in-place token-only renewal preserves valid pending bathymetry/current display. Original logout/null/expiry/cancel/dispose/context/style/zero/field-failure/locality/continuity guards remain asserted.
- `node frontend/src/utils/tests/qaFieldTransport.test.js`, `node frontend/src/utils/tests/viewportFieldRequests.test.js`, `node frontend/src/utils/tests/oceanFields.test.js`, `node frontend/src/utils/tests/currentFlowPresentation.test.js` — PASS unchanged auth/request/science/presentation/current regressions, including synthetic actual QA HTTP boundary and normal-mode controls.
- Both affected JS files: `node --check` — PASS; whitespace and exact staged-scope/sensitive-content inspection before commit.
- One editing script mistakenly reassigned a const path after the hook write and stopped before LF normalization; the intended hook change was already saved. Corrected normalization in the subsequent test edit; tests/checks above passed. No unrelated file change or permission/control bypass.

All identity/token values used in execution are generated clearly synthetic fixtures; no tokens/session objects are logged, persisted or included as literal credentials in evidence. No real-token retrieval/transmission, provider/Auth/database/production connection, data-connected launch, new package, backend relaxation, merge or deployment. Prior live-browser/mobile/CP-10/launch and documentary-harness exclusions remain open. Independent P04 re-review of this exact successor and final P02/P01 combination is REQUIRED; developer passes do not qualify or integrate a failed candidate. Existing broader captain results remain predecessor evidence, not rerun/recertified here. Final controlled browser results follow below.

Final-source controlled render scripts PASS: `bathymetryTextureRender.test.mjs` output `TEMP/pelora03-texture-render-olXVpN` (512x512, NEAREST 9728, no mipmaps, original bands/transparency, zero external requests/map errors); `bathymetryContoursRender.test.mjs` output `TEMP/pelora03-contours-zkANPr` (14 broad features, 37 regional minor, 5 regional labels, 20 continuity frames; 1000/390px navigation medians 17.3/18.2ms, maxima 18.8/18.9ms, no loading flash, zero external requests); `currentFlowRender.test.mjs` output `TEMP/pelora-current-traces-heOrJx` (original animation/fallback/malformed/style/idle/failure/disposal assertions PASS). Existing headless Edge/runtime configuration and blocked external routes are unchanged. These are developer controlled GPU/viewport checks, not physical-device or independent QA clearance.

Final mutable-identity successor SHA-256 fingerprints:

- frontend/src/hooks/useMapLibreOceanFields.js: `55da4e51a0d5a30522230296d6469dc9df05d358fb85062f25419b97f7b27e3e`
- frontend/src/hooks/tests/useMapLibreOceanFields.test.js: `e32387b6fc60d7db41b3cd1267fffc4d9a453259d24c2fe1924034780b2f5026`


## BATH-D1A developer candidate — 2026-10-13

Direct founder approval in P03 authorizes only retention of already accepted ETOPO 2022-v1-60s coverage under Unified UI Amendment canonical checkpoint 79ba90b44c5ab1d18fb0055e1327e53b4da4ea49. Assigned isolated branch codex/pelora-03-bath-d1a-v1 starts at cleared code parent 1a011d1450a77893c5f02151b4f109e0cd0120a0 (parent 08e1e7373c07904ec0dfe0f0de76e241c9262bdd). FLOW-C1 is a separate candidate, not included here. Frozen preview b0cd2b1c3b967644d3bb00b4b488addfe777b1e9 and original P03 worktree remain untouched.

### Controlled before/after

The appended actual-hook fixture SYNTHETIC-BATH-D1A is a controlled 3x3 grid: axes [-89.9,-89.5,-89.1] / [27.1,27.5,27.9], depths [-50,-100,-200,-500,-700,-900,-1500,-1700,-2000] m, delivered spacing 0.4 degrees, stride24, native 1/60 degree. Source metadata matches the registered product identity solely to exercise the retention branch; it is not a provider capture or proof of source admission. Existing parsing, validation and successful map application establish accepted display buffers.

Pre-repair at1a011d the controlled intersecting-viewport request failure produced unavailable instead of the required degraded retained field (new assertion failed). After repair the original field reference, contours, coverage, edition, provenance and stride remain unchanged. The state preserves original contextKey/displayContextKey and separately records requestedContextKey plus retainedCoverageOnly. Intersecting means only original geometry remains visible; it does not claim full replacement coverage. Disjoint viewports report unavailable/field:null with empty hidden contour source while private accepted buffers may survive until return to their actual footprint.

Accepted registered static coverage no longer shares the five-minute live refresh TTL. Current polling/failure remains independent. Explicit camera/style requests remain subject to existing transport/race guards. A different source/edition is withheld from exact-context retention rather than admitted. OFF clears the lifetime and accepted buffers; ON uses normal acquisition. Malformed content, application rejection, auth denial, owner changes, disposal and obsolete response guards remain fail closed. An obsolete null body cannot erase newer accepted coverage; a disposed syntax body cannot resurrect rendering.

### Developer commands and results

All PASS on actual candidate working-tree contents:
- node frontend/src/hooks/tests/useMapLibreOceanFields.test.js
- node frontend/src/utils/tests/oceanFields.test.js
- node frontend/src/utils/tests/viewportFieldRequests.test.js
- node frontend/src/utils/tests/qaFieldTransport.test.js
- node frontend/src/utils/tests/currentFlowPresentation.test.js
- node frontend/src/utils/tests/bathymetryContours.test.js
- node frontend/src/hooks/tests/bathymetryContoursRender.test.mjs
- node frontend/src/hooks/tests/bathymetryTextureRender.test.mjs
- node frontend/src/hooks/tests/currentFlowRender.test.mjs

Browser scripts use existing bundled Playwright/sharp through PELORA_BROWSER_TEST_NODE_MODULES; headless Edge/MapLibre5.24.0, all external routes blocked. No packages installed. Hook/transport tests use synthetic tokens and injected transports; the ephemeral QA HTTP boundary uses synthetic authority only, not a data-connected runtime.

Controlled contour-render output: C:/Users/User/AppData/Local/Temp/pelora03-contours-p5gGml. The added SYNTHETIC-GPU-BATH-D1A 40x40/0.05-degree fixture proves the identical accepted field/source remain degraded and queried contours visible after zoom plus injected transport failure. bath-d1a-retained.png was inspected: contour lines and feet labels remain visible. Normal contour navigation40frames: desktop1000px median17.8ms/max19.4ms;390px median18.2ms/max19.1ms, no loading flash. Texture output pelora03-texture-render-VIxvMN proves NEAREST min filter9728, no mipmaps, five band colors and transparency,0 external requests/no map errors. Current output pelora-current-traces-b0Hk9C preserves point animation and static reduced-motion/stale/degraded behavior. These are controlled developer observations, not physical mobile qualification.

Node --check for all changed JavaScript/mjs and git diff --check / staged whitespace checks are required before checkpoint. Scoped diff inspected; no real tokens, session captures, captain data or unexpected product paths added.

### Exact tested source identities

- `frontend/src/hooks/useMapLibreOceanFields.js`: SHA-256 `69750816a473efbfee0bc6e0387ea65541004ddf73f1788056a78dcafc513d18`
- `frontend/src/hooks/tests/useMapLibreOceanFields.test.js`: SHA-256 `1c5d82b98219ae456df9096bb621e54e7bb0114f96246d2ea6b7cafff983950e`
- `frontend/src/hooks/tests/bathymetryContoursRender.test.mjs`: SHA-256 `d3e291c78bf7f2c0d6814839cd4086b6c1d858f22d51cd814cc3e199bcc26fb0`

### Limits

Retention is volatile within the existing enabled layer lifetime, not a durable provisioned regional numerical corpus or offline startup guarantee. No new coverage, source downloads, cache architecture, geometry, contour thresholds, native values, sampling, texture filter, current presentation, scientific/evidence policies or backend files changed. The original founder unavailable incident is not attributed to any cause without incident-linked evidence. Live founder browser, physical mobile/GPU variability, P02 combined placement and independent P04 qualification remain required. Developer passes are not QA clearance; CP-10/operational rollout remain blocked. No integration, merge, deployment or frozen-preview change.
