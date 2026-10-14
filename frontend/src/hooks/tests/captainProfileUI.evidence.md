# P02 owner-bound Profile UI candidate evidence

Base: 8e79ac3bbb63998bff29a64e3ebd49f9ec5d21be
Branch: codex/pelora-02-profile-ui-v1
Worktree: C:/Projects/Pelora-Agent-Worktrees/pelora-02-profile-ui-v1

Before: Profile contained an unconnected placeholder. After: the qualified owner-bound read DTO supplies captain/boat/email and legacy access type/status. Missing, loading, revalidating and unavailable states remain distinct. No subscription/activation/expiry authority is invented.

Captain/boat edit drafts are Dashboard memory only, persist across destination switches, clear on owner lifetime changes, and Cancel resets them. Save is disabled in normal and QA mode; no Profile write path exists. Fishing report durable storage and QA write guards are unchanged.

Sign-out invokes the existing SDK action once per admitted click. Owner/generation guards reject stale and concurrent callers before SDK execution. Late completions cannot affect a new owner lifetime. Success acknowledges the request only; the existing Auth listener/gate remains authoritative for session removal. SDK details are not rendered.

## Final controlled verification

- node frontend/src/hooks/tests/captainProfileUI.test.js C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules: 84/84 pass. Includes prior continuity, governed selection, QA guards, caller handoff and consumer epoch regressions plus Profile and actual access gate tests.
- node frontend/src/hooks/tests/captainProfileUI.static.mjs C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules: PASS no new findings; new CaptainProfile clean. One inherited Startup react-hooks/set-state-in-effect finding matches exact base.
- PELORA_BROWSER_TEST_NODE_MODULES=C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules; node frontend/src/hooks/tests/captainProfileUI.browser.test.mjs [same frontend runtime]: PASS 1000/390/320. Actual Gate/read hook/helper/Startup/Dashboard/Profile with synthetic Auth snapshot and SDK ports, native synthetic map. All external requests blocked. Zero page errors, external requests and write attempts. Owner A/B/A roundtrip, edit navigation/Cancel, disabled Save, failure retention, pending action and Auth-confirmed teardown exercised. Three map mounts across three owner lifetimes; no same-owner navigation remount.
- Browser captures/results: C:/Users/User/AppData/Local/Temp/pelora-p02-profile-ui-CmRljV (18 PNG, three result JSON). Inspected 320px editor: scrollable panel and dock remain visible.
- git diff --check: PASS. Protected source paths below byte-identical to base.

The initial unit invocation omitted its required runtime argument and failed before tests; corrected command passed 84/84. Test-host iterations resolved cross-realm projection and pending-promise fixture setup; no corresponding application authority was changed.

## Exclusions and review

Independent P04 qualification remains required. Synthetic Auth/SDK ports do not qualify real logout, remote authorization, RLS, operational providers, physical-device keyboard/app switching or production. No dependencies installed, real services contacted, database changes, science changes, stylesheet changes, preview replacement, integration or deployment. Profile edit drafts are not durable across reload, and saving intentionally remains disabled pending separate write authorization. Candidate is local only; no publication permission is inferred from any pending FLOW consumer push question.

## Protected byte identities

frontend/src/hooks/useCaptainAccess.js
frontend/src/utils/captainProfileRead.js
frontend/src/components/CaptainSignIn.jsx
frontend/src/hooks/useMapLibreOceanFields.js
frontend/src/utils/oceanFieldPresentation.js
frontend/src/utils/currentFlowPresentation.js
frontend/src/utils/localQaReadOnly.js

## Exact tested source identities

frontend/src/components/Dashboard.jsx SHA256 7ae7f969055a14e42978aadf9cf1a010a2bbcbf68e71759105680f1d57fc12f6
frontend/src/components/FoundingCaptainAccessGate.jsx SHA256 73f8a35ad697606bd0d6c4c3f66ae52cd17f479e559b0b9cd0ff8d588c5f5c86
frontend/src/components/PeloraStartupFlow.jsx SHA256 f841afd6e4d6c05f888d909adc663ced2364b1c1213a866b1468b38cde75e655
frontend/src/components/CaptainProfile.jsx SHA256 a0458f111f9213df5be2e48a4fae616ee0763fc8f9b23ed71123400061382873
frontend/src/hooks/tests/captainProfileUI.test.js SHA256 91127c94b2321651bd4df26ff2667b0c65b09188d04cd3945cafe81c5fc5d0f4
frontend/src/hooks/tests/captainProfileUIAssertions.fixture.js SHA256 d993d92cca5dab4f905b67d5f46f5f1949dd2a73f947cba3504bcd55041f21bd
frontend/src/hooks/tests/captainProfileUI.browser.test.mjs SHA256 1b996459435782f9f8bfbc63c347630da5edb8e9d7537e036697a5b743621ecf
frontend/src/hooks/tests/captainProfileUI.static.mjs SHA256 8ac9801b99efccac10861be901ccb868f63f5d83cffe60c1f06258a6adf48679
