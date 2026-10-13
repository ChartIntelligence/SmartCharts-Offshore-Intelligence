# P02 narrow truthful status candidate

Founder directly authorized this bounded repair. Worktree C:\Projects\Pelora-Agent-Worktrees\pelora-02-truthful-status-v1; branch codex/pelora-02-truthful-status-v1. Base b0cd2b1c3b967644d3bb00b4b488addfe777b1e9. Frozen preview is NOT modified or integrated.

Starting source blobs: Dashboard e07faad7c7b4be5cc52688c39efbf1dfdbae3a24; TodayDashboard 9d5135b631464bcc3801e0babf33a7c5c621012e. Only these application paths changed. Dedicated evidence/tests are truthfulStatus.test.js, truthfulStatusCards.test.mjs, truthfulStatus.static.mjs and this file in frontend/src/hooks/tests.

Before: actual baseline Today renders unconditional Pelora Intelligence Online and engine operational even with unavailable Opportunity state; actual baseline ConditionCard renders Pending for terminal unavailable evidence. Profile hard-codes Tournament Alpha / Alpha Captain / Founding Access without an authoritative record supplied to this view.

After: omit global health assertion; Profile explicitly states account roles/status/subscription are not supplied. No inference from auth metadata or access approval. Condition/Reason cards distinguish loading from unavailable, retained refresh, stale and aging using existing state only. Marine loading/failure governs weather independently from Opportunity evaluation; no new freshness threshold, health authority or evaluation state.

Offline commands (from worktree root), runtime argument R = C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules:
- node frontend/src/hooks/tests/truthfulStatusCards.test.mjs R: 15/15, includes actual baseline reproduction and production Today/Condition/Reason rendering across five governed evaluation states.
- node frontend/src/hooks/tests/truthfulStatus.test.js R: 45/45 actual React reconciliation tests including two Profile principals, existing continuity, successful draft cleanup, account/session changes, QA write/configuration guards and caller reference handoff. Synthetic map host, controlled hook/service ports; no real transport.
- node frontend/src/hooks/tests/localQaSelectionCompatibility.test.js R: 19/19 including terminal authoritative invalidation and no latent reselection.
- node frontend/src/hooks/tests/truthfulStatus.static.mjs R: exact baseline/candidate finding comparison passes. Dashboard clean; Today has four inherited no-unused-vars errors: conditions, swell, structureDetail, score. Raw lint is not fully clean; no added findings. Do not broaden repair to those unrelated variables.
- git diff --check: pass.

Node 24.18.0, React/React DOM 19.2.7, rolldown 1.1.5, ESLint 10.7.0. Existing tooling referenced read-only; no dependency installation/copy/configuration.

Preservation: all P03 hooks/rendering/science, auth/gates, QA helper/write paths, draft persistence, shell/dock and mission source are unchanged from base; Dashboard delta confined to Profile presentation. Frozen preview checkout independently remains clean at b0cd2b1c3b967644d3bb00b4b488addfe777b1e9. No backend, database, API resolver, entitlement logic, publication adapter, production, service launch, merge or deployment.

Remaining: P04 independent combined review; actual browser/physical mobile visual QA and data-connected runtime are not qualified by these fixtures. Dynamic account labels require an authoritative account record contract; none is introduced. Review A publication adapter separately before any integration. Candidate identity is the commit containing this record, obtained with git rev-parse HEAD.
