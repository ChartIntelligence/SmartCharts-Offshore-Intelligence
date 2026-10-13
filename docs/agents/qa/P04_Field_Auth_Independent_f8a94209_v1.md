# PELORA-04 immutable principal successor qualification

Exact P03 source: `f8a94209e5d4e68b3d1526229f72e8470189d1af`, direct parent `e818e612beb70902856223607dd928d5480c818a`. Separate P02 caller: `bfbf65df803dc57ed04305b1d190dcf9c882c037`, parent `76dfe905fc08e21e2a25bf874d300d9ed91fdc65`. Prior failure checkpoints `151359d358abe684edcf3bc8dd076a64646aacd0` and `dd830c3115cc9c42d655d54bed56a124ef107cd5` and their original probes/logs remain preserved.

P03 QA SOURCE REVIEW — ACCEPTABLE within this bounded repair.

P03 INDEPENDENT CONTROLLED EXECUTION — PASS within named checks, with an explicit inherited QA-probe layer-shape exclusion below. Both previously reported unsafe-application findings are corrected in the controlled reproductions. No remaining P0/P1 observed in this scope.

TEMPORARY EXACT-SOURCE CALLER COMPOSITION — PASS. This is a QA-only source composition, not a committed P01 integration candidate or full combined-candidate clearance. Final exact P01 candidate/fingerprints/build review and one later founder launch approval remain required. No data-connected launch authorized.

## Source/delta review

Only three paths changed from e818e612: field hook, its dedicated focused test and P03 evidence. Runtime delta copies primitive session-presence, validated string principal ID and tri-state anonymous identity into a new internal snapshot each render, compares that copied prior identity rather than the mutable supplied object, and includes the existing monotonic principal revision in passive reconciliation dependencies. Every observed A-to-B-to-A transition advances the boundary even with the same object. The copied identity contains no access token. Same-owner token renewal does not change owner epoch, retaining valid display and permitting normal credential reconciliation.

Transport helper, backend authoritative verification/policy, SDK/API resolver, P02 components, scientific/source values, field geometry/thresholds/nearest sampling, current presentation, request-cache helper, shared/RLS/schema, package manifest and lockfile unchanged. No added SDK/storage/Auth reader, logging or global headers. Normal-mode transport retains signal-only fetch semantics. The previously reviewed deferred application/publication guards now receive a reliable render-time identity epoch.

## Preserved probes and independent focused execution

Exact exported snapshot: `C:/Users/User/AppData/Local/Temp/pelora04-field-auth-f8a94209`; Node v24.18.0. All external transports synthetic; HTTP fixture servers bind ephemeral loopback and are closed after tests. No private storage/session, real credential or external provider/Auth/database access.

| Command from snapshot root | Actual result |
|---|---|
| `node frontend/src/hooks/tests/useMapLibreOceanFields.ownerRoundtrip.qa.js` | Exit 0; preserved residual-P1 probe unchanged |
| `node frontend/src/hooks/tests/useMapLibreOceanFields.idleProbe.qa.js` | Exit 1 only on old assertion requiring a retained hidden contour layer; removed layer gives undefined |
| `node frontend/src/hooks/tests/useMapLibreOceanFields.idleProbe.corrected.qa.js` | Exit 0; already preserved corrected probe unchanged, accepts absent/hidden plus strict null fields and zero rendered features |
| `node frontend/src/hooks/tests/useMapLibreOceanFields.test.js` | Exit 0; twenty-four grouped PASS sections |
| `node frontend/src/utils/tests/qaFieldTransport.test.js` | Exit 0; nine grouped PASS sections |
| `node frontend/src/utils/tests/viewportFieldRequests.test.js` | Exit 0; three grouped PASS sections |
| `node --check` for changed hook and focused test | Both exit 0 |
| Exact successor `git diff e818e612 f8a94209 --check` | Exit 0 |

Grouped sections overlap and are not unique-case counts or full-suite acceptance. Old unsafe logout application is absent even in the unchanged shape-failing probe: both statuses unavailable, both fields null, current hidden/zero features and contours removed. The separate contract-correct probe is the earlier independently documented bounded harness correction; no committed candidate tests/assertions or probe history modified for this successor.

The exact mutable-object probe SHA256 remains `174af941d317ec51e2e15a1ccef4298e09cfe665d46ee3c884c0faec8db03ba0`. Its final observation is both fields null/unavailable, current hidden and zero rendered features; old bathymetry/current buffers do not reappear. Final output log SHA256 `8abe0bf38306fe8c1c6905dcf1318a423921f16edc24959eaad4777f29a641d1`.

Focused candidate assertions independently cover both layers across idle/style.load/readiness timer, logout/null, principal/anonymous/invalid identity and mutable-object roundtrips, queued owner-bound statuses, final-render-only reconciliation, same-owner token renewal, old successful/malformed body completions, latest-cache retention after failure, exact viewport/generation changes, cancellation/disposal, layer-local malformed rejection, independent OFF/ON and normal-mode controls. Transport checks exercise the real QA HTTP/Auth/access boundary with synthetic authority/data: both layers accepted, missing header/invalid target/issuer/principal/expiry/anonymous/auth rejection denied; redirect refusal, cookies omitted and no unrelated target receives credentials. Decoded claims remain defensive only; synthetic authoritative rejection overrides matching claims. No science/provider authenticity or live SDK behavior inferred.

## Necessary actual caller composition

QA-only snapshot `C:/Users/User/AppData/Local/Temp/pelora04-caller-transport-f8-bfbf` starts with exact bfbf65df source and overlays only exact P01 backend/startup/API and P03 hook/helper/fixture objects from f8a94209. No candidate checkout/application source edited and no integration branch created. Fingerprints verified against approved source Git blobs, not a reimplementation of the repairs.

R is the existing read-only `C:/Projects/Pelora-Agent-Worktrees/pelora-04-qa-release/frontend/node_modules`; no install/copy or root dependency layout repair.

- `node --test-name-pattern="Dashboard forwards exact current session|actual map forwards same reference" frontend/src/hooks/tests/fieldSessionCaller.test.js R`: exit 0, 2/2 necessary caller handoff cases. No rerun/recertification of all forty-three cases.
- `node --test-name-pattern="P04 actual Dashboard caller" frontend/src/hooks/tests/p04CallerTransport.qa.js R`: corrected harness exit 0, 1/1 additional actual Dashboard/map caller/field-hook/backend boundary lifecycle.

Actual production Dashboard, MapLibreIntelligenceMap, field hook, request cache, QA transport and backend Auth/access boundary execute together. Initial invalid synthetic token reaches no handler. Valid synthetic session acquires bathymetry and currents through four authority/access reads and two handlers. Intelligence/Reports/Top Opportunities navigation adds no field request or map setup. Same-owner renewal preserves bathymetry source identity and performs one reacquisition per layer, for final totals eight authority/access reads and four field handlers. Logout clears both fields without a new handler call. Controlled map setup/teardown exactly 1/1, listeners/timers cleared, zero real external calls, zero uncaught React errors; synthetic token absent from DOM and owned in-memory continuity storage.

Substitutions: minimal controlled React DOM, map/GPU primitives/setup port, canvas image fixture, external authority/field handlers, debounce scheduling and unrelated feature/marker/data hooks. Actual caller/transport/field/state/publication logic is preserved. Controlled setup counts are not native MapLibre/GPU qualification. The first additional composition attempt failed because the inherited import-stripping host omitted the real captainFieldStatus dependency, newly reached when actual field statuses rendered. Bound that exact existing helper in QA scope and reran; no application or assertion change. Both real logs retained (`caller-transport.qa.log` failure, `caller-transport.corrected.qa.log` success).

## Source / harness identities and retained output

| Exact composed source | Git blob |
|---|---|
| Dashboard from bfbf65df | `e07faad7c7b4be5cc52688c39efbf1dfdbae3a24` |
| MapLibreIntelligenceMap from bfbf65df | `b252d34b488f8235aadb840d39fce5ceec129665` |
| Field hook from f8a94209 | `4d5b7a07617ba61b644841fa4a6c6bc5b1390d05` |
| Unchanged transport from f8a94209 | `5bb95d39931fd0392d008ad63316bdca237dc49e` |
| Focused field test from f8a94209 | `f2a932b20c4aa850d12c618f0785033f6739e3bb` |

Composition wrapper SHA256 `7d323b3d67c90227f40d20caaf6c290d174e3b3c94c7636e384dcad0f3d544e7`; additional fixture `1e62085979e14138eb47ca64fc4f918cd44039120bac3e8c3cf81a0e4d7349dd`; successful composition log `e1221e7eaef1c3dd5b0cf7f8f938c50db311ca0fec372e4a443987ed3e4842f8`. No secret/client configuration values in this report or Git; all session fixtures generated synthetically.

Original exact-logout probe SHA256 `fa6eda1577275851db5a18f909404363ff0cac1aa0c01eead895fcdeda218423`; corrected-logout probe `4afe8928d2bfcf8e315506711c80fc3140cefee49a560da99c95fabb01bb08d9`. Focused snapshot logs: `transport.qa.log`, `hook.qa.log`, `viewport.qa.log`, `exact-roundtrip.qa.log`, `exact-logout.qa.log`, `corrected-logout.qa.log`. Composition logs include `caller.qa.log`. Actual output preserved, not reconstructed; temporary retention is not guaranteed indefinitely.

## Limits / next gate

This independently clears the isolated P03 repair and necessary controlled source handoff, not the final integration. P01 must provide exact assembled SHA and source identities for final review. No connected build/preview/server launch or founder approval packet ready merely from these tests. GPU/browser scripts and unchanged broader suites were not repeated; source-scoped predecessor evidence is retained separately. Physical founder/mobile, native browser/Auth/cookie/session callbacks, actual provider/source/GPU/performance, permanent preview and report submission remain unqualified. Startup/API scoped clearance is preserved; temporal/routing/root-dependency/documentary harness exclusions remain excluded, not passed. No production/main merge/deployment, database change/migration, operational science admission, BETA READY or CP-10. Preserve prior unstaged matrix and untracked safety checklist/P01 assembly.
