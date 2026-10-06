# PELORA-02 Intelligence recovery — controlled evidence

Workspace: C:\Projects\Pelora-Agent-Worktrees\pelora-02-captain-experience
Branch: codex/pelora-02-captain-experience
Baseline/governance HEAD: 94cc8b41fbf1e440dc2a27618617704a93025782
Source implementation baseline inherited by governance: dadec5dbca7d360f70f633413fb6a347dc24cac1
Scope: frontend Intelligence narrative display validation and local recovery only.

## Contracts and behavior

Read AGENTS.md, execution board and PELORA-02 mission, product vision, captain-state governance, scalar delivery/runtime governance, backend/server.js translateCaptainOpportunityNarrativeV1 and its eight section translators, and actual Dashboard/TodayDashboard/SelectedTarget entry consumers. Backend is read-only. The narrative rules remain read-only, no evidence/ranking/score/confidence/rank/species-presence/catch-probability/missing-evidence creation.

The v1 section translators supply observed/interpreted/supported/limited as strings or null. Absent fields/sections remain absent. Strings are displayed unchanged; empty strings retain the existing omission behavior. The consumer rejects nonstring, non-null statement values and nonrecord section containers before rendering analysis. No object/array coercion, prose creation, scoring or identity changes. FormatState remains unchanged and never renders arbitrary state values as prose.

IntelligenceRecovery wraps only the actual OpportunityIntelligence child in Dashboard. Its own error state provides Retry Intelligence, Home and Map. A changed narrative reference, changed evaluation state, changed opportunity identity or reentry permits a new render. Explicit retry rereads same-reference corrected input. Dashboard is not remounted: selected identity/content, captain species/origin/range and a controlled Dashboard map-layer state marker survive failure/retry/navigation. Persistent invalid input remains a display failure, never governed-zero or a completed evaluation. Available, partial, governed-zero and unavailable retain existing messages/selection rules.

## Installation and exact environment

Authorized command, from frontend:

    npm ci --ignore-scripts --no-audit --no-fund

Result: added 186 packages; exit 0. Immediately afterward git status --porcelain=v1 --untracked-files=all was empty. No tracked/staged manifest/source changes. No lifecycle scripts, individual/new/global dependencies, node_modules copying, .env creation/copying or credentials.

Node v24.18.0; react 19.2.7; react-dom 19.2.7; rolldown 1.1.5. react, react-dom/client and rolldown/utils resolve to this frontend/node_modules. Unchanged Git blob identities: package.json c15dfc7ea6dbadf431c0b92ec587171891ecf642; package-lock.json b5217409e11fa4e3f0c421dd85d9301dd6b73dc2.

## Before / after

Before any application edit, dedicated test intelligenceRecovery.test.js mounted the unchanged actual OpportunityIntelligence in the existing minimal React DOM host. Synthetic opportunity ID synthetic-X; narrative.available true; thermalStructure.observed = {nested:'SYNTHETIC MALFORMED OBJECT'}; interpreted/supported null; limited 'Synthetic limitation.'. Command:

    node frontend/src/hooks/tests/intelligenceRecovery.test.js --baseline

Original controlled mount failed with exit 1: Objects are not valid as a React child (found: object with keys {nested}). This is a controlled failure, not confirmation of reported black-screen incidents.

The retained baseline mode now reads unchanged source from stdin, uses actual React server reconciliation and asserts that same failure:

    git show 94cc8b41fbf1e440dc2a27618617704a93025782:frontend/src/components/OpportunityIntelligence.jsx | node frontend/src/hooks/tests/intelligenceRecovery.test.js --baseline

Result: exit 0, BASELINE REPRODUCED. Original source blob f6d66dc53d5f3841307fe82166a50d44460ffa59. JSON fixture SHA256 aa3d7025d91e8cadd49e9f622e3504456f014dcaaa68a93c9892ca51b93ce0dc; retained directly in the dedicated test. Baseline mode never modifies application files or connects a service.

After: the same fixture produces Intelligence-scoped recovery, without rendering the nested value. Actual Dashboard, TodayDashboard, SelectedTarget and OpportunityIntelligence render in the controlled host. View All and Open Full Analysis invoke actual Today buttons; direct entry invokes actual Dashboard Intelligence button. Recovery Retry/Home/Map handlers are invoked through actual rendered React button props. Real React reconciliation verifies scoped failure and corrected-input recovery.

## Focused checks

From repository root:

    node --test --test-isolation=none frontend/src/hooks/tests/intelligenceRecovery.test.js

55/55 passed; zero failures/skips/cancellations. Includes all three entries, persistent-invalid retry, corrected same-reference retry, new same-ID narrative recovery, selection/species/origin/range/internal-layer retention, nested objects/arrays/numbers/booleans in all four statement fields, permitted/absent display values, section shape rejection, all eight actual section children and evaluation distinctions.

    node --test --test-isolation=none --test-name-pattern='Dashboard|request race|rapid A/B/C|rapid same-ID|removed identity|manual exploration|map selection|Opportunity hook' frontend/src/hooks/tests/intelligenceCaptainStateRegression.test.js

17/17 selected existing regression cases passed, zero failures. The dedicated adapter reads unchanged betaSafetyCaptainState.test.js and supplies the actual new boundary to its import-stripping VM harness in memory; original assertions/fixtures are unchanged. Existing Intelligence stubs are used only in this regression suite, never counted as actual-child acceptance. Other original cases are outside this focused selection.

From frontend:

    node node_modules/eslint/bin/eslint.js src/components/OpportunityIntelligence.jsx src/components/IntelligenceRecovery.jsx

Exit 0, no diagnostics. rolldown transformSync parses Dashboard.jsx, OpportunityIntelligence.jsx and IntelligenceRecovery.jsx with automatic JSX runtime; all pass. git diff --check passes.

Initial harness attempts exposed Component scope omission, resolved in the dedicated harness. Node default test subprocess spawning is denied (EPERM); --test-isolation=none runs the same tests in process. Node child-process Git baseline extraction is likewise denied; read-only Git shell output now supplies baseline source via stdin. Initial unadapted existing Dashboard harness could not resolve IntelligenceRecovery; adapter supplies it without editing the existing suite. Broader replay attempted 71 cases and passed 66; five documentary-backend cases could not resolve their relative dynamic import from the adapter data URL and are excluded from the focused replay. The separate unchanged captainAccessLifecycle.test.js could not resolve @js-temporal/polyfill from root shared/fishingLogTemporalEvidence.mjs; the installed frontend copy does not satisfy root resolution. No additional installation or dependency-layout change was made. These broader attempts are not passing qualification.

## Exact packet paths / tested candidate Git blobs

- frontend/src/components/Dashboard.jsx — Intelligence mounting only: 573d9ac4c3d3b4e2796351f54f4b177b49ed52f6
- frontend/src/components/OpportunityIntelligence.jsx — display validation: 11d34695cd53d3f5c550095b87ea3c6698ad259e
- frontend/src/components/IntelligenceRecovery.jsx — new local boundary: ccd0fed3ac66853f8721605c75341ffb405d3e9d
- frontend/src/hooks/tests/intelligenceRecovery.test.js — new actual-child acceptance: 3f2d583016948aed59619d59b1bd033215b294cf
- frontend/src/hooks/tests/intelligenceCaptainStateRegression.test.js — dedicated regression adapter: e3f9d3712d996233ffe8f5289596967cc1c4caa3
- frontend/src/hooks/tests/intelligenceRecovery.evidence.md — this evidence record.

## Limits / exclusions

Synthetic state/transports and minimal DOM host only. Map renderer, layer controls, rankings and unrelated shell children use controlled stubs; working Home navigation is verified through actual Today rendering, Map navigation through its controlled host and actual SelectedTarget. React button callbacks are exercised directly; native browser event dispatch, layout, physical devices, mobile performance, real providers, production recovery and reported live black screens are not qualified.

Startup/import-time Supabase configuration failure remains separate and untested; the boundary cannot catch failures before Dashboard imports/mounts. No Auth, entitlement, database, backend/science, map-hook, ranking, source-admission, history-policy, operational-source admission, CP-10, Receipt Writer, quarantine, production, deployment or beta-ready changes/claims. No real Auth/provider/database/production calls. No new packages beyond the approved committed lockfile install. No integration or other packet changes.

Final commit and verified remote SHA are reported in the completion response; this file records non-self-referential tested source/fixture identities. Remote check initially failed at sandbox proxy 127.0.0.1; use only the authorized branch for push/verification.
