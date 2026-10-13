# PELORA-04 independent local QA guard review

Frontend candidate: `76dfe905fc08e21e2a25bf874d300d9ed91fdc65`, exact parent `8e1c225f575d25adc3506e166b4e2a5be48bc7f3`. Backend candidate: `53ad0d86787794a9ccf6f5acfc289fa8db9df351`, exact parent `49c6224ec4408079007800f882fb28dcfd77aee2`. Reviewed exact Git objects; independently executed exported snapshots in temporary directories. No application source, candidate branches or dependency layout changed.

## Scoped disposition

Frontend six-source mutation guard review and controlled execution: ACCEPTABLE within its stated boundary. Backend boundary controlled execution: PASS within tested routes and substitutions. COMBINED DATA-CONNECTED LAUNCH SAFETY: BLOCKED. No integrated frontend/backend candidate was supplied or tested. Earlier frontend Supabase initialization/Auth and standalone API resolver remain outside the workspace guard and require P01 qualification before launch. `resolvePeloraApiUrl` still permits its ordinary hosted default outside the Dashboard gate; `lib/supabase.js` initializes the client before Dashboard validation. These are explicitly inherited boundaries, not evidence of an observed production connection. No external connection or launch clearance is issued.

Raw `saveOceanSnapshot` rejects before row construction/client access; `insertReportWithTime` rejects before evidence construction/client access; `persistReport` rejects before mutation; automatic Ocean Memory returns before recording attempted IDs. Draft editing/local owner storage remains enabled. Invalid explicit QA project/API binding prevents DashboardWorkspace mount and shows an error. The helper matches P01 blob `72cd55ebd49aedf763c8b285e57ff4c63f7a37ac`. No API resolver, Auth, backend, P03, shared contracts, RLS, schema or manifest delta in the frontend packet. No material new P0/P1 observed in this bounded mutation review.

## Independent commands and actual results

Node `v24.18.0`. R is the already-installed `C:/Projects/Pelora-Agent-Worktrees/pelora-04-qa-release/frontend/node_modules`; no installation/copy. Frontend snapshot root: `C:/Users/User/AppData/Local/Temp/pelora04-guards-76dfe905`.

| Command (from snapshot root unless specified) | Actual result |
|---|---|
| `node frontend/src/hooks/tests/localQaReadOnlyGuard.test.js R` | Exit 0, 41/41; includes 29 inherited actual React continuity cases, not 41 unique new guard cases |
| `node frontend/src/hooks/tests/localQaSelectionCompatibility.test.js R` | Exit 0, 19/19 authority/race cases |
| `node frontend/src/hooks/tests/localQaReadOnly.static.mjs R` | Exit 0, six-source scoped ESLint, no reported errors/warnings; JSX consumed by actual-child harness |
| `node frontend/src/hooks/tests/localQaContractCompatibility.test.mjs R` | Exit 1; temporal 10/11, seven Ocean Memory row assertions PASS |
| Same contract command with `baseline` argument from exact clean P02 candidate checkout, read-only | Exit 1; independently reproduced identical parent temporal 10/11 and seven row assertions PASS |
| `node --test --test-isolation=none backend/tests/localQaLaunch.test.mjs` from `p01/` exact backend snapshot | Exit 0, 6/6 |
| `node actualRuntime.qa.mjs` | Exit 0, actual imported backend server exercised via ephemeral loopback HTTP and synthetic transport; shutdown verified |
| `node --check` for four frontend JS guard sources and two backend guard modules | All six exit 0 |
| Exact frontend, backend and shell delta `git diff --check`; QA working diff check | All exit 0 |

Excluded temporal assertion expects `setReport(createInitialReport())`; revision-aware completion predates this packet. Do not count it as passed or repair it here. Original backend test attempts hit sandbox process restriction, then incomplete temporary snapshot helper resolution; both are recorded harness/environment attempts, corrected without changing candidate bytes/assertions. Baseline Git child process also initially hit sandbox restriction and was rerun read-only with approved execution. Logs preserve actual failures. No root Temporal package installation/layout repair; existing frontend Temporal resolution is the dedicated test's explicit runtime binding.

Additional QA-only actual-runtime harness imports real `prepareQaServer` and real `server.js`, substituting only external fetch with synthetic Auth/access responses and provider 503 responses. Synthetic issuer/expiry/principal fixtures only; no real session/credentials. HTTP binds ephemeral `127.0.0.1`, supplies required Host, and is disposed. Health 200; Opportunities 503 disabled-persistence path; valid bathymetry field request 503; valid marine/ocean requests 502 for deliberately unavailable synthetic providers. Provider GETs reached the controlled port; all POST/PATCH/PUT/DELETE application probes returned 405. Manual redirect required on every outbound call. Guard restored and server no longer listening after disposal. Initial probe used wrong request parameter names and got 400; corrected only the QA harness, preserving both actual logs. No successful provider scientific payload qualification inferred.

Actual-runtime harness SHA256: `70158a6783f059189f6f0c7659030ed0992832028de12edf9f6e3f7c3de7b17c`. Logs: `guard.qa.log`, `selection.qa.log`, `lint.qa.log`, `contracts.qa.log`, `contracts.baseline.qa.log`, `backend.qa.log`, `actualRuntime.qa.log`, `actualRuntime.valid.qa.log` in the frontend snapshot root. Temporary evidence is local, not guaranteed retained indefinitely.

## Separate shell controlled qualification

Exact shell `8e1c225f575d25adc3506e166b4e2a5be48bc7f3`, parent `f4e9a55b5b246e980a2242822d6876a7807721fc`. Separate snapshot `C:/Users/User/AppData/Local/Temp/pelora04-shell-8e1c225`. Independently ran `shellNavigation.test.js`: 13/13, `persistentShellContinuity.test.js R`: 29/29, `persistentShellSelectionRegression.test.js R`: 19/19, all exit 0. Reviewed owned history, epoch cleanup, route precedence, responsive overlays/focus, universal dock and mission-editor hosting. Existing mission strip content retained; callback goes through navigation ownership rather than replacing/duplicating its controls. P03 field/flow/request/setup source paths compared against canonical preservation checkpoint unchanged.

Offline Edge `persistentMapShell.browser.qa.mjs R`: exit 0, actual shell/StartupFlow/mission hook/MapLibre component/setup/fields/camera PASS at 1000/390/320px. Dependency root `PELORA_BROWSER_TEST_NODE_MODULES` is the existing bundled Codex runtime. QA adaptation changes only two MapLibre asset references from root node_modules to R; no application bytes/assertions changed or dependencies copied. Harness fingerprint `6badcfe614abbee8fc8d6e1c1eaa65bf124ec92d83d9a15ed0fb8e0c5d0376c2`. External requests blocked; synthetic field/map/transport and unrelated marker-hook substitutions retained as documented by the original harness. Actual Dashboard/Intelligence/report children covered separately by controlled React suites; browser fixture is not a whole live authenticated application. Browser artifacts `C:/Users/User/AppData/Local/Temp/pelora-shell-browser-GX4kwq`; shell `browser.qa.log` and three suite logs preserved.

No overall source audit/full-suite/device acceptance inferred. Publication/materiality/history dependencies, permanent safe preview, live Auth callback/expiry/account switching, production services, native mobile interaction, actual scientific provider payloads, physical GPU/performance and founder visual acceptance remain pending. No server left running, source repair, commit, push, merge, deployment, migration or database mutation performed. Primary QA branch/HEAD preserved with prior matrix edit and untracked safety checklist; this report is an additional QA-only document.
