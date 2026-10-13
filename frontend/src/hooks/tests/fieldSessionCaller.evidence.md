# PELORA-02 — field-session caller handoff

Direct founder authorization in this chat approves only Dashboard/MapLibreIntelligenceMap session handoff and minimal dedicated synthetic tests/evidence. P03 owns field hook/transport/security; no P03 source edited. Coordinator-proposed/approved implementation parent:76dfe905fc08e21e2a25bf874d300d9ed91fdc65, preserving qualified QA guards and shell8e1c225 lineage. New isolated worktree C:/Projects/Pelora-Agent-Worktrees/pelora-02-field-session-caller-v1, branch codex/pelora-02-field-session-caller-v1. Verified exact parent and clean checkout before applying; old guard and shell worktrees remained clean at76dfe905 and8e1c225. No staged/unstaged work overwritten; P01 assembly untouched. No overlapping shell edits or duplicate agents.

Exact application paths:
- C:/Projects/Pelora-Agent-Worktrees/pelora-02-field-session-caller-v1/frontend/src/components/Dashboard.jsx
- C:/Projects/Pelora-Agent-Worktrees/pelora-02-field-session-caller-v1/frontend/src/components/MapLibreIntelligenceMap.jsx

Dashboard passes its existing supplied session object to its existing map component; map's optional session defaults null and is forwarded directly to useMapLibreOceanFields. Three added lines/one replaced hook-call line only; no extra application files. Existing mapRef/enabled flags/status callback, UI state, lifecycle, selection authority, QA write guards/drafts and normal transport remain unchanged. No new SDK call/getSession/refresh/auth flow, logging, serialization, DOM/storage exposure, cache or network call. Current session/principal/null is supplied on every render; no old session held by caller.

Exact blobs:
| Application | Parent | Candidate source |
|---|---|---|
| Dashboard.jsx | 0bb11e652c2870b95588eea21de9c41e131e6506 | e07faad7c7b4be5cc52688c39efbf1dfdbae3a24 |
| MapLibreIntelligenceMap.jsx | 9481a7e0c48384fb28f8e745609bebc41e693057 | b252d34b488f8235aadb840d39fce5ceec129665 |

Founder-approved proposal path C:/Users/User/AppData/Local/Temp/pelora-field-session-wiring-r3dcuK/caller-session-wiring.patch; SHA256 a0bea0aba91b75d709aece9d5c1ef4e05383353bf692991d1dc0a441b9dec429; git apply --check passed. Qualified Git source-only patch C:/Users/User/AppData/Local/Temp/pelora-qualified-field-caller-K0r0jf/caller-source.patch
SHA256 b3e39625575ab907997d9683b11fa457e6274529ccd75a8a556b4556b598d017

Dedicated files: fieldSessionCaller.test.js, fieldSessionCallerAssertions.fixture.js, fieldSessionCaller.static.mjs, this evidence. Existing test/application sources otherwise untouched.

Synthetic verification, repository root; R=C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules, existing read-only tooling:
- node frontend/src/hooks/tests/fieldSessionCaller.test.js R:43/43 pass. Existing actual-child41 QA/continuity assertions unchanged plus2 actual Dashboard/map caller cases. Strict same-reference identity, same-owner renewal, other principal, null/default sign-out; no session marker in DOM/owned storage; sentinel retrieval/refresh/toJSON and console/fetch probes remain zero. Actual MapLibreIntelligenceMap hook invocation captured at test port; same mapRef/status callback/layer flags and one setup lifetime, one teardown. P03 transport not exercised or qualified by this port.
- node frontend/src/hooks/tests/localQaSelectionCompatibility.test.js R:19/19 authority/race assertions pass; no dropped assertions, terminal-failure/retry non-resurrection retained.
- node frontend/src/hooks/tests/fieldSessionCaller.static.mjs R: strict scoped ESLint zero errors/warnings. Exact equality versus parent with only the approved three replacements; proves no hidden transport/auth/persistence delta.
- PELORA_BROWSER_TEST_NODE_MODULES=C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules; node frontend/src/hooks/tests/persistentMapShell.browser.test.mjs R: PASS1000/390/320px. Existing offline synthetic actual-map/setup/field/camera + shell/startup checks retain camera, dimensions, map/request/listener counts through nav/history/mission/editor, draft retention, mandatory onboarding, dock/focus/reduced motion and principal teardown. No external requests/page errors, no real credentials. Browser fixture does not qualify authenticated transport; its synthetic field responses remain controlled. Artifacts C:/Users/User/AppData/Local/Temp/pelora-shell-browser-KW9rMU.
- git diff --check clean. No package/env copy/install, new dependencies, credentials, API resolver/backend auth/shared science/RLS/P03 hook changes. Earlier guard inherited temporal source-pattern assertion remains known baseline issue; this caller packet does not touch temporal/report source.

Dependency: P03 requested an optional session interface from its isolated field-transport checkout, baseline63ce9882345a9b087f1d256ea95368c5fb826e03. That committed baseline hook does not yet consume session; this JavaScript additive prop is inert there. Need P03's separately authorized exact transport/security candidate and P04 independent combined review to qualify authenticated acquisition, issuer/principal/expiry checks, exact destination/redirect restrictions and async/logout cancellation. Caller propagation is not authorization for requests or token transmission. No real session retrieval/token, service connection, backend/preview/data-connected launch, DB mutation, migration, push, merge, deployment or production action. Physical device/founder and operational-source qualification remain separate.
