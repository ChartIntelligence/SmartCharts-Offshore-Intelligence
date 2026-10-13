# PELORA-04 independent initial Auth / API boundary review

Exact successor: `63ce9882345a9b087f1d256ea95368c5fb826e03`. Its direct parent is `351009a802c74405d8919da6f629d0da497b44d2`, the implementation commit whose parent is reviewed backend `53ad0d86787794a9ccf6f5acfc289fa8db9df351`. The final successor adds only routing-exclusion documentation. Do not describe 53ad0d8 as its direct parent. Backend policy/server and shared QA helper blobs remain unchanged.

## Separate dispositions

INITIAL SUPABASE CONFIGURATION / STANDALONE API TARGET VALIDATION — INDEPENDENT CONTROLLED PASS. Actual Supabase module invokes validation before createClient. Explicit QA refuses missing/wrong project/API target and unsupported private key class without invoking the SDK. Resolver constructs the exact loopback `/api` path and retains query strings; explicit QA cannot select hosted/relative/dev fallback. Normal non-QA resolver/client behavior remains intact in synthetic controls. Key-class checks are not proof of provider authenticity; backend still requires pinned issuer/expiry plus authoritative Auth verification and the dedicated approved owner.

FULL COMBINED LOCAL QA / FOUNDER MAP QUALIFICATION — BLOCKED. A P1 integration compatibility defect is confirmed below. No exact integrated frontend/backend candidate has been supplied to this review; prior scoped shell/frontend results remain separate. This record supersedes the earlier report's missing startup/API-validation prerequisite only. It does not issue launch approval.

## Confirmed P1: field request and QA Auth boundary disagree

`frontend/src/hooks/useMapLibreOceanFields.js:120` calls `fetch(resolvePeloraApiUrl(...), {signal})` without Authorization for both bathymetry and currents. `MapLibreIntelligenceMap` supplies no session/token to this hook. Unchanged `backend/localQaServer.mjs:16` requires `authorizeQaCaptain` for every non-health route, including `/api/ocean/field`; missing Authorization is rejected before remote Auth or application handler invocation. Browser Supabase authentication does not automatically attach bearer headers to this independent cross-port fetch.

Independent controlled reproduction executes the actual field hook request callbacks with the exact successor resolver, then dispatches them to the real QA HTTP boundary on ephemeral loopback. Both request URLs resolve to the required API origin, both options contain only signal, and both reject with `Field request 403`. Authoritative Auth transport calls: zero; application handler calls: zero. Explicit synthetic authorized control on the same boundary returns 200, with two synthetic authority reads and one handler call. Thus authenticated frontend map acquisition cannot presently satisfy this backend contract. This is a local QA integration blocker for required map-field founder acceptance, not evidence of a production regression or unsafe write. Do not weaken access guards or fix application code in P04. P01/P02 must coordinate the bounded request/route authentication contract, provide an exact repaired candidate and obtain independent clearance.

## Independent commands / evidence

Exact-commit exported snapshot: `C:/Users/User/AppData/Local/Temp/pelora04-startup-63ce988`; Node `v24.18.0`. No package install, dependency copy, source edits, environment files, real tokens, Auth/project/provider/database connections or data-connected launch.

| Command from snapshot root | Actual result |
|---|---|
| `node --test --test-isolation=none backend/tests/localQaLaunch.test.mjs` | Exit 0, 6/6; synthetic transports and loopback only |
| `node --test --test-isolation=none frontend/src/utils/tests/localQaStartup.test.js` | Exit 0, 2/2; actual module body with injected SDK port |
| `node frontend/src/utils/tests/peloraApi.test.js` | Exit 0, grouped normal resolver compatibility assertions PASS |
| `node frontend/src/utils/tests/persistenceEnvironment.test.js` | Exit 0, grouped browser persistence compatibility assertions PASS |
| `node backend/tests/persistenceEnvironment.test.js` | Exit 0, grouped actual backend persistence orchestration assertions PASS, synthetic transport including ordinary-mode positive writes |
| `node independentStartupBoundary.qa.mjs` | Exit 0, additional boundary probes and confirmed field-auth incompatibility assertions |
| `node frontend/src/hooks/tests/peloraApiRouting.test.js` | Exit 1, `TypeError: requests.invalidate is not a function` |
| Same routing command in exact exported `d5d40020` baseline | Exit 1, independently reproduced identical harness error |

The six backend cases, two startup cases and three grouped compatibility scripts correspond to the reported eleven entries; do not infer eleven unique exhaustive cases. Ordinary-mode synthetic persistence writes prove compatibility and never reach a service. Routing script and field-hook Git blobs are identical in successor and canonical baseline; excluded harness failure is not PASS. Existing temporal 10/11 and broader root dependency/harness exclusions remain visible in the prior independent report; no Temporal/environment repair here.

Additional SDK probes use 14 invalid project/API/key configurations with zero SDK calls. Synthetic publishable-key, legacy anon-JWT-class and normal-mode controls invoke three SDK calls. Actual Supabase source is read unchanged, imports bound to the pure validator and synthetic createClient; no real SDK networking. Field diagnostic substitutes map readiness/primitives, effect host and cache scheduler only to capture and directly execute the actual request callback; it does not qualify field rendering or lifecycle here. Real QA boundary uses synthetic authoritative Auth responses and synthetic handler only; no real session or private data. Server and hook cleanup complete; no listener remains. No prohibited outbound transport occurred.

Source identities:

| Path | Exact Git blob |
|---|---|
| `frontend/src/lib/supabase.js` | `6ee03ee78c5f69d8f7cafa7ef58641bee1f6ec2b` |
| `frontend/src/utils/localQaStartup.js` | `bac2e44f1205db62cecce85fa8424e57affd9a60` |
| `frontend/src/utils/peloraApi.js` | `4ea4528f4be3cb74f69759e5f29c94bccc27d8eb` |
| `frontend/src/utils/localQaReadOnly.js` | `72cd55ebd49aedf763c8b285e57ff4c63f7a37ac` |
| `backend/localQaPolicy.mjs` | `4abfba5873be34d9cc80d6f2b3df23489db2d828` |
| `backend/localQaServer.mjs` | `2c3e98a6ce2cc20df36cf56cc1bf16d72ef7e323` |

Real output logs are `startup.qa.log`, `api.qa.log`, `frontend-persistence.qa.log`, `backend-persistence.qa.log`, `backend.qa.log`, `routing.qa.log`, `independent-boundary.qa.log` in the snapshot root. Baseline log is `C:/Users/User/AppData/Local/Temp/pelora04-routing-baseline-d5d40020/routing.baseline.qa.log`. QA-only harness SHA256: `fbc10d44f191eefa7b8c6ea67ac5079f8dfaae9459b38355a0202808a68d9174`. Temporary logs are preserved locally, not reconstructed or guaranteed permanent.

Pending: exact combined candidate and field-auth compatibility repair/decision; fresh process-configured build and artifact binding; one later explicit founder launch approval; live Auth/redirect/expiry/account switching; provider availability/scientific admission; permanent preview and founder/physical-device acceptance. Opportunities still intentionally return 503; read-only mode still cannot qualify report submission. No production/main/critical-path merge, migration, deployment, BETA READY, source admission or CP-10 claim.

## Separately reviewed P02 caller successor

Exact caller candidate `bfbf65df803dc57ed04305b1d190dcf9c882c037`, direct parent `76dfe905fc08e21e2a25bf874d300d9ed91fdc65`: independent scoped source review ACCEPTABLE. Only application delta is Dashboard forwarding its existing session and MapLibreIntelligenceMap accepting optional null session and passing it to the field hook. Dashboard blob `e07faad7c7b4be5cc52688c39efbf1dfdbae3a24`; map blob `b252d34b488f8235aadb840d39fce5ceec129665`. No SDK retrieval/refresh, token storage/logging, API/Auth/backend/field transport or science change. The parent hook does not consume this argument; this handoff alone does not repair authenticated acquisition.

Independently ran only the two new cases, leaving unchanged baseline checks unexecuted while awaiting P03: `node --test-name-pattern="Dashboard forwards exact current session|actual map forwards same reference" frontend/src/hooks/tests/fieldSessionCaller.test.js R` from exact exported snapshot `C:/Users/User/AppData/Local/Temp/pelora04-caller-bfbf65df`. Exit 0, 2/2. Actual caller reconciliation preserves exact current reference for renewal/principal change/null, with no synthetic session markers in DOM/owner storage. Actual map caller uses a substituted field-hook observation port and setup lifetime sentinel: one setup/teardown, unchanged mapRef/enabled flags/status callback, zero retrieval/refresh/serialization/fetch/log probes. These are caller assertions, not real MapLibre lifetime or authenticated-transport qualification. Real output `caller.qa.log` preserved in that directory. Exact delta whitespace check passed. No source repair, external connection or launch; wait for exact committed P03 transport candidate and fingerprinted combined assembly.
