# P02 Unified UI-1 then UI-2 candidate

Direct human execution confirmation received. Canonical docs checkpoint: 79ba90b44c5ab1d18fb0055e1327e53b4da4ea49. Exact clean CODE parent: 1a011d1450a77893c5f02151b4f109e0cd0120a0; distinct frozen preview b0cd2b1c3b967644d3bb00b4b488addfe777b1e9. Worktree C:/Projects/Pelora-Agent-Worktrees/pelora-02-unified-ui-v1, branch codex/pelora-02-unified-ui-v1. UI-1 component/browser pass preceded UI-2 application. Candidate identity is the commit containing this record, not an invented self-reference.

## Exact changed application paths / tested blobs

frontend/src/components/Dashboard.jsx 1e60fb3227a932d4f9e25dab2cde5ac4174780f4
frontend/src/components/LayerControls.jsx 6d4cc8a167697e83349d1424d8054882a8662b73
frontend/src/components/LocationSearch.jsx 580793f941dbe6dd10eab3b3b7dca3f3266bb813
frontend/src/components/MapLegend.jsx d6982cec1fd12ff5070485492222c27cd1fc03ed
frontend/src/components/PeloraStartupFlow.jsx 015c7cac4b2909f69f9fca7c41967a90c5d433df
frontend/src/components/PersistentMapShell.jsx 85eb99c4b66d54d886779bffc264ec5e4136773e
frontend/src/components/TodayDashboard.jsx 34d0087ac305e7465276e412ea85be21313bb05c
frontend/src/styles/dashboard.css 4ee75da122b58576dd340152362d8adb793d77b3
frontend/src/styles/persistentMapShell.css ae717adcb04e82f6f8819eb6dba625572e312b7d

Dedicated changed paths: frontend/src/hooks/tests/unifiedUI.browser.test.mjs, unifiedUI.static.mjs, unifiedUICards.test.mjs, unifiedUIContinuity.test.js, unifiedUI.evidence.md (all in the same directory). No existing tests changed.

## Requirement dispositions

- Top Opportunities → geographically contextual Ocean Evidence → compact expandable Ocean Brief: implemented, actual component rendered and browser observed. List/state first; terminal/QA states omit recommendation-shaped featured cards and selection prompts; existing identity/rank/score/evidence values retained. Per-row View on map/Open analysis maintain exact selected object. Governed historical fallback preserved as explicitly historical.
- Accessible outer panel headings: screen-reader-only focus target, visible Close retained; focus/Escape/Back/Forward tested. Dock display names exact Top Opportunities / Opportunity Analysis / My Reports / Profile; internal route IDs unchanged; inline stroke SVGs. Analysis no longer duplicates ranked list.
- Single Collapse/up, Expand/down: persisted existing account-scoped dock boolean; no navigation or tool/warning hiding. Shared expanded-tool ownership in Dashboard; existing Search query stays mounted in its component and survives tool switching. Layer toggles/camera/valid selection unchanged.
- Responsive placement: ResizeObserver measures chrome/dock dimensions; safe areas reserved; Search beside protected desktop dock, Map Intelligence upper-right, narrow shared tool sheet above measured dock. Actual search/dock overlap, on-screen control placement, dock-label containment, no horizontal Top panel overflow checked at 1000/390/320. Long synthetic QA notice used.
- Brand: existing approved header lockup unchanged, centered larger, genuine alpha and no background/blend. Inspected asset 971x455 with 327421 fully transparent pixels. Setup uses existing cropped transparent wordmark. No asset generation.
- Initial setup: Dashboard/native map not mounted until existing governed mission context plus supported species and completed step admission. No hidden/zero-sized duplicate map workaround. Returning mission skips setup; established editor preserves existing map. First setup summary navigates once only when workspace is on map and no restored report is open; returning mission does not set this flag. Actual restored report draft precedence tested.
- Existing mission-strip JSX and Profile block checked byte-for-byte against code parent: unchanged. UI-3 not implemented. No Profile read/write/auth flow introduced.
- Legend captain naming uses Currents and traces/static markers; bathymetry explanation uses contour/depth-label language. Exact major/minor units/levels and selected-sample speed UI remain dependent on agreed P03/P05 FLOW-C1/depth presentation contract. No conversion/interpolation/render or bathymetry behavior changed.
- Countdown inactive/not implemented; secure Profile writes/read seam and unsupported current-flow behavior excluded. P01/P03 own their respective contracts. Not blockers for this UI1/2 candidate.

## Commands and actual results

From worktree root, R=C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules (existing tooling referenced read-only):
- node frontend/src/hooks/tests/unifiedUICards.test.mjs R: 19/19. Actual baseline1a renders Brief before Top and empty featured recommendation; successor reverses order/removes empty card. Actual baseline startup renders Dashboard during initial loading; successor does not. Also existing actual status fixtures.
- node frontend/src/hooks/tests/unifiedUIContinuity.test.js R: 49/49. Actual React reconciliation/children, QA write/config guards, sessions, drafts, owner isolation, startup admission/remount and first-summary precedence, exact Opportunity action reference.
- node frontend/src/hooks/tests/localQaSelectionCompatibility.test.js R: 19/19, no latent selection resurrection/authoritative invalidation preserved.
- node frontend/src/hooks/tests/unifiedUI.static.mjs R: PASS baseline diagnostic comparison, NO introduced errors. Raw lint retains SIX inherited findings: Today conditions/swell/structureDetail/score no-unused-vars; LayerControls Date.now default purity; Startup synchronous effect state. Base/candidate rule/message/severity counts compared, shifted react-hooks code excerpts excluded. Dashboard/shell/Search/Legend clean. This is not a globally clean lint claim.
- PELORA_BROWSER_TEST_NODE_MODULES=C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules; node frontend/src/hooks/tests/unifiedUI.browser.test.mjs R: three widths PASS. Native MapLibre setup/field lifecycle plus actual shell, tools, Today, startup; synthetic dataset/transport callbacks, all external routes blocked, zero page errors/denied external requests. Navigation/reduced motion, keyboard focus, camera/layer/listener continuity, draft textarea retention, no map before admission/one map after verified.
- git diff --check: PASS; reserved-path check and unchanged mission/Profile blocks: PASS.

Node24.18.0 React/React DOM19.2.7 rolldown1.1.5 ESLint10.7.0; existing Edge/Playwright only. No installation or dependency/configuration/credential copy.

## Failures corrected and evidence limits

Initial navigation adapter assumed old Focus controls; updated only new dedicated adapter. Startup minimal-DOM adapter initially missed nested Blue Marlin label; captured actual button handler. Browser discovered inherited static-position/negative brand placement and narrow evidence overflow/dock label wrapping: source fixes and coordinate/containment assertions now pass. These are controlled repair iterations, not hidden failures or live preview changes.

Final screenshot directory: C:/Users/User/AppData/Local/Temp/pelora-unified-browser-SFGEra. Exact PNG SHA256 manifest: C:/Users/User/AppData/Local/Temp/pelora-unified-browser-SFGEra/screenshot-identities.json. Screenshots include shell, destination interactions, initial Trip/Species at each width. Actual shell/Today/tools/startup/native map; Dashboard bridge supplies synthetic mission and fixture-only Analysis/Reports/Profile content and draft textarea. These screenshots DO NOT qualify full authenticated Dashboard destination contents or production field delivery. Actual Profile/report/intelligence children are tested separately by the reconciliation harness; P04 independent full-app browser review remains required. Desktop/narrow screenshot inspection performed; physical iPhone, real Photos switching/GPS/session/network, connected provider operation and touch/performance acceptance remain unqualified.

All application changes confined to nine reserved paths. P03 hooks/science/acquisition, eligibility/ranking contracts, auth/gates, QA helper/write paths, report persistence, schema/RLS unchanged. Original B/source and frozen preview worktrees separately verified clean at exact identities. No UI3/countdown/science enhancement, service launch, preview replacement, integration, main/production merge, deploy, migration or real mutation. Founder visual acceptance remains OPEN. Candidate requires independent P04 qualification before integration.
