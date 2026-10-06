# PELORA-02 — Intelligence render validation and recovery v1

**READY_FOR_WORKSPACE_BINDING — IMPLEMENTATION NOT STARTED**

Identity: PELORA-02 — Captain Experience. Coordination: PELORA-00 — Lead / Orchestrator; integration: PELORA-01 — Critical Path / Integration. Read [root router](../../../AGENTS.md) and [execution board](../EXECUTION_BOARD_v1.md). Source baseline is `dadec5dbca7d360f70f633413fb6a347dc24cac1`; starting HEAD is the separate documentation-only governance checkpoint described on the board.

Assigned branch: `codex/pelora-02-captain-experience`.
Assigned permanent directory: `C:\Projects\Pelora-Agent-Worktrees\pelora-02-captain-experience`.
An existing session must be explicitly bound/verified here before implementation. Workspace creation is not agent execution. Do not create a duplicate agent.

## Bounded objective and ownership

Reproduce malformed narrative rendering with controlled fixtures, validate only the existing narrative display contract's permitted types, and provide an Intelligence-scoped recovery path. Do not stringify arbitrary objects, coerce arbitrary values into prose or invent scientific interpretation. Inspect `translateCaptainOpportunityNarrativeV1` and its section translators in backend/server.js as read-only contract evidence (`pelora-captain-opportunity-narrative-v1`); preserve its read-only narrative rules. Resolve the exact allowed display types from those contracts before editing the frontend. No backend changes are assigned.

Owned source paths at baseline:

- `frontend/src/components/OpportunityIntelligence.jsx`: actual narrative children including NarrativeStatement and the section display.
- A narrowly scoped new Intelligence recovery component/helper, located with the existing frontend component/util convention; name the exact new path in implementation evidence.
- `frontend/src/components/Dashboard.jsx`: only the mounting/navigation changes necessary for that scoped recovery. Preserve Dashboard mission, species/range and selected-target state; do not remount/reset the whole Dashboard.
- Dedicated Intelligence tests under the existing frontend test conventions. An exact new test path must be recorded before edits.

Inspect read-only entry consumers in Dashboard.jsx, TodayDashboard.jsx and SelectedTarget.jsx. Exercise View All, Open Full Analysis and direct Intelligence entry through the actual OpportunityIntelligence children, not a stubbed replacement. Recovery must preserve mission/selection state and permit Home/Map navigation. Render available, partial, governed-zero and unavailable according to their existing governed distinctions; an error is not governed-zero or a complete evaluation.

Startup/import-time configuration failures are a separate issue. An Intelligence boundary is not proof that those failures are fixed or caught. No auth, entitlement, database, backend science, map-hook or broad shell/CSS changes. Do not change scoring/ranking/source admission, history policy, CP storage or Receipt Writer defaults.

## Controlled acceptance evidence

1. Before repair, capture the exact malformed narrative fixture and actual render failure or rejected display behavior under the unchanged source. Separate a controlled reproduction from reported black-screen incidents, which remain unverified.
2. Compare permitted display values, malformed nested objects/arrays or other contract-invalid values, absent narrative/sections and existing state distinctions. Invalid input must not create prose or alter scientific evidence/identity.
3. Prove scoped recovery and navigation via all three entry paths using actual children. Retain Dashboard mission/selection state and independently working Home/Map UI after failure/retry.
4. Record exact baseline/candidate/fixture identities, commands, before/after output, affected regression coverage and limits. Do not claim physical-device performance or real production recovery without separate testing.

## Test environment prerequisite

Read `frontend/package.json`, `frontend/package-lock.json`, `frontend/src/hooks/tests/betaSafetyCaptainState.test.js` and `captainAccessLifecycle.test.js` as existing tooling examples. Their React/React DOM/rolldown controlled host is useful infrastructure, but existing Dashboard child stubs do not satisfy actual Intelligence-child acceptance. There is no declared frontend test script or Vitest/Jest dependency. No tests/build/lint/project code are run in this setup.

Frontend dependencies are not installed in this new checkout. Tracked root node_modules files arrive through ordinary Git checkout and are not a verified complete React/JSX test environment. Verify exact required dependencies and Node availability locally; obtain bounded approval before any package installation or new tooling. Do not copy node_modules, .env, credentials or private fixtures. Use controlled transports and synthetic state only; no real Auth/database/provider connection.

## Stop boundary

This packet is frontend rendering/recovery only. Stop for a new P0/P1, genuine contract/science conflict or existing credential/package/system/production gate. Do not broaden into startup fixes, map changes, scientific implementation, operational publishing/source admission, CP-10 or deployment. Full beta scope and history/Nightly requirements remain. Review and integration are separate from implementation; do not merge another branch automatically.
