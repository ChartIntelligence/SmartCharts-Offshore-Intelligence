# PELORA-04 independent QA-only field authentication review

Exact P03 candidate: `a7835851fb69b68ef4a1881633296347e5ad3595`, direct parent `63ce9882345a9b087f1d256ea95368c5fb826e03`. Separate reviewed P02 caller: `bfbf65df803dc57ed04305b1d190dcf9c882c037`, parent `76dfe905fc08e21e2a25bf874d300d9ed91fdc65`. P01 assembly is not modified or qualified by this report.

SOURCE REVIEW — CHANGES REQUIRED.

INDEPENDENT CONTROLLED EXECUTION — FAIL: an additional pending-style/idle result-application guard probe fails. Supplied focused scripts pass independently, but do not cover the failing event ordering. No P03 clearance or READY FOR LAUNCH APPROVAL.

## P1: pending idle applies old field buffers after render-time logout

The hook's request completion and `onState` publication check current credentials, but deferred `apply` / `sync` rendering does not. Reproduction on exact candidate source:

1. Use a synthetic approved QA session with both layers enabled and map style not ready.
2. Complete valid bathymetry/current responses. Buffers are converted; style application waits on idle. Both statuses are loading.
3. Render the actual hook with session null; current sessionRef becomes null. Do not run its passive sessionChanged effects yet.
4. Make the controlled map style ready and fire the already registered idle callbacks.
5. Old bathymetry/current buffers are applied and published: static bathymetry, stale currents, visible contour/current layers and one rendered current feature.

Actual observation:

```json
{"beforeBathymetry":"loading","beforeCurrents":"loading","afterBathymetry":"static","afterCurrents":"stale","bathymetryFieldPresent":true,"currentFieldPresent":true,"contourVisible":"visible","currentVisible":"visible","currentRenderedFeatures":1}
```

Additional independent assertion fails: `pending idle must not apply a prior principal buffer after render-time logout`, actual true versus expected false, exit 1. Cleanup then runs pending passive effects and releases all hook event listeners. This is a controlled actual-hook event-order defect, not a live-browser/privacy-exfiltration claim. It violates this packet's explicit requirement that a render-time principal/logout transition cannot apply or restore obsolete fields through a later style/idle callback. The shown field fixtures are synthetic environmental data; no private captain data was accessed.

Source evidence in exact hook blob: line12 assigns the latest session ref during render; line60 starts sync, which checks disposal/map identity before touching render buffers and publishing states; line109 starts deferred apply. Line153 `transport.canPublish()` protects onState but not the deferred rendering path. Session cancellation/clearing otherwise waits for the passive sessionChanged effect at line238. Full frontend logout may also unmount the authenticated workspace; that does not qualify the explicitly tested same-hook render-before-passive-effect boundary.

Proposed narrow repair boundary: P03 should guard every deferred field application/publication with current transport identity/credential validity and appropriate layer lifetime/generation, clear invalid retained/converted buffers without restoring them on later events, and add this pending-style race. Keep normal non-QA behavior, independent layer lifetimes, valid same-owner renewal/retention, exact viewport identity, malformed-success locality and backend authoritative verification unchanged. P04 implements no application repair.

## Scope and independently passing evidence

Exact-commit Git reads confirm nine intended paths: two application files, transport fixtures/tests, the existing focused hook test, three browser-test compatibility additions and P03 evidence. No backend/Auth policy, SDK, resolver, UI components, shared science, field presentation/values/geometry, current presentation, viewport helper, RLS, schema, manifests or lockfile delta. The P02 caller remains a separate source dependency, reviewed earlier with two independently passing actual caller cases; its token propagation is not transport authority.

The new transport restricts explicit QA to canonical loopback field GET with allowlisted parameters, per-request Authorization, redirect refusal and cookie omission. It inspects only the existing supplied session; decoded claims are defensive checks, not authoritative access. Actual backend verification remains unchanged. Normal-mode fetch retains its original signal-only options without inspecting credentials. These scoped positive properties do not cancel the deferred-application defect.

Snapshot: `C:/Users/User/AppData/Local/Temp/pelora04-field-auth-a7835851`, exported directly from exact candidate Git objects, Node `v24.18.0`. No candidate checkout/source edits, dependency copying/install, real credentials, browser storage access or external connection.

| Independent command from snapshot | Actual result |
|---|---|
| `node frontend/src/utils/tests/qaFieldTransport.test.js` | Exit 0; seven grouped PASS sections, not seven uniquely counted cases |
| `node frontend/src/hooks/tests/useMapLibreOceanFields.test.js` | Exit 0; eighteen grouped PASS sections, not eighteen uniquely counted cases |
| `node frontend/src/utils/tests/viewportFieldRequests.test.js` | Exit 0; three grouped PASS sections |
| `node frontend/src/hooks/tests/useMapLibreOceanFields.idleProbe.qa.js` | Exit 1; unchanged original assertions pass, added pending-idle/logout assertion fails |
| `git diff 63ce988 a7835851 --check` in primary QA repository | Exit 0 |

Transport script independently exercises actual requests against the real QA HTTP boundary with synthetic authority/access and data handlers: both layer GETs 200, four authority/access calls and two handler calls; missing header 403 with zero handler access; matching decoded claims with authoritative rejection denied. It also covers wrong targets/queries/method/body/issuer/principal/expiry/anonymous state, redirect/auth rejection, cookie omission, same-object mutation, refresh/cancel/dispose and late-completion containment. Hook script independently covers layer isolation, malformed/obsolete/disposed/body failure, authorized acquisition, owner changes/logout/renewal, post-decoder publication gap and recovery. These are synthetic controlled checks; no live identity or provider qualification.

The independent added probe reuses the committed VM map/canvas/effect/transport host and appends only the new sequence/assertion. Candidate hook, transport, request cache and presentation functions are unchanged. Map style/events, canvas image fixture and external response ports are substituted; no application logic reimplemented. The added probe uses synthetic response acquisition to isolate deferred application, while the preceding original authenticated tests exercise the real loopback boundary. No live SDK, production server or provider is contacted. The new hook delta justified rerunning its focused lifecycle/viewport checks; unchanged broader suites and browser render tests were not repeated. Qualification stops at this P1; final composed-caller execution, GPU/browser follow-up and exact combined review remain NOT TESTED.

## Source and evidence identities

| Exact candidate path | Git blob |
|---|---|
| `frontend/src/hooks/useMapLibreOceanFields.js` | `05809642d6749a9c47ec717b9120622a80481ace` |
| `frontend/src/utils/qaFieldTransport.js` | `301cf161b96acf1a44cb5b2e6cb46e0c0411c623` |
| `frontend/src/hooks/tests/useMapLibreOceanFields.test.js` | `bce17594e3ab850cf3514a0b054db514d1b74384` |
| `frontend/src/utils/tests/qaFieldTransport.test.js` | `364f410a7c6633303b726097a960653010699745` |

Actual logs `transport.qa.log`, `hook.qa.log`, `viewport.qa.log`, `idle-probe.qa.log` remain in the snapshot directory. Additional QA harness SHA256 `fa6eda1577275851db5a18f909404363ff0cac1aa0c01eead895fcdeda218423`; failing log SHA256 `bfe1fef850d387ce3cbec0b81beda914f06f5a883423505451de601c40c29601`. No reconstructed logs; local temporary evidence retention is not guaranteed indefinitely. A later read-only Git evidence command was mistakenly issued from the exported non-Git snapshot and failed; it was corrected in the primary QA repository without any source/test change.

Startup/API independent clearance at63ce988 and previous separate shell/frontend/caller results remain preserved. Routing harness baseline failure, temporal source-pattern baseline exclusion, root dependency limits and documentary harness exclusions remain excluded, not passed. Physical founder/device, live Auth/session, actual provider/GPU/source qualification, safe permanent preview and production/CP-10 remain separate pending gates. No connected launch, migration, database mutation, source repair, integration or deployment. Preserve prior uncommitted QA matrix/checklist and P01 staged work.
