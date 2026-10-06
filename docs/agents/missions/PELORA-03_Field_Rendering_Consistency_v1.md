# PELORA-03 — Field rendering/state consistency v1

**READY_FOR_WORKSPACE_BINDING — IMPLEMENTATION NOT STARTED**

Identity: PELORA-03 — Living Ocean. Coordination: PELORA-00 — Lead / Orchestrator; integration: PELORA-01 — Critical Path / Integration. Read [root router](../../../AGENTS.md) and [execution board](../EXECUTION_BOARD_v1.md). Source baseline is `dadec5dbca7d360f70f633413fb6a347dc24cac1`; starting HEAD is the separate documentation-only governance checkpoint described on the board.

Assigned branch: `codex/pelora-03-living-ocean`.
Assigned permanent directory: `C:\Projects\Pelora-Agent-Worktrees\pelora-03-living-ocean`.
Explicit binding of the intended existing session must be verified before implementation. No agent is launched or rebound by this setup; do not create a duplicate.

## Bounded objective and ownership

Reproduce a valid rendered field followed by a malformed replacement. Validate the existing presentation shape before conversion/application. On conversion, canvas, map-source or application failure, safely clear/hide only the affected field and keep its reported state truthful. Rejected data must not remain in retained buffers or later idle/style callbacks so that it can reappear as valid rendering.

Owned paths at source baseline:

- `frontend/src/hooks/useMapLibreOceanFields.js`.
- `frontend/src/utils/oceanFieldPresentation.js`, only where presentation validation/conversion requires it.
- Dedicated tests in existing hook/util test directories; record their exact paths before edits.

Read-only supporting contracts: `frontend/src/utils/viewportFieldRequests.js`, `frontend/src/hooks/tests/useMapLibreOceanFields.test.js`, `frontend/src/utils/tests/oceanFields.test.js`, [field delivery](../../Ocean_Scalar_Field_Delivery_v1.md), [scalar runtime governance](../../Governed_Scalar_Field_Runtime_v1.md) and [captain state governance](../../Beta_Safety_Captain_State_v1.md). Inspect each actual baseline contract rather than substituting a new scientific schema.

Do not edit Dashboard.jsx, LayerControls.jsx, MapLegend.jsx or shell CSS in this packet. No shared captain-control changes, new acquisition, source admission, SST/chlorophyll activation, current derivatives, science thresholds, ranking/gates, backend/database, CP storage or default Receipt Writer changes. Presentation validity does not establish source science/admission.

## Required before/after qualification

- Controlled baseline valid-field then malformed-replacement sequence, with exact source/state/render buffer identities and the observed mismatch or failure.
- Malformed axes/cells and required shape metadata, canvas conversion failure, source update/application failure and style reload/idle callbacks.
- A rejected layer cannot be resurrected by delayed callbacks. Preserve disposal/cleanup and late-response rejection; stale context must not become current.
- Unaffected bathymetry/current layer remains intact when its sibling fails. Clear/hide the failed layer without describing the old rejected field as successfully applied.
- Preserve legitimate exact-context degraded retention on transport failure when the retained data remains valid. Do not conflate invalid replacement data/application failure with that permitted retention.
- Zero-valued data is not missing data. A valid zero vector may produce no directional arrow under the existing presentation semantics; this must not be relabeled as absent/corrupt source or silently alter scientific values.
- Record actual before/after commands/results, fixtures and baseline/candidate fingerprints. Controlled map/canvas tests do not verify physical-device performance or a reported real black-screen incident.

## Test environment prerequisite

Existing tests are text-inspected only in setup. The hook suite uses Node assert/vm with controlled map, scheduling, canvas and transport seams. The utility suite additionally imports `@maplibre/maplibre-gl-style-spec`; verify its exact lockfile/runtime resolution before execution. There is no declared frontend test script or Vitest/Jest dependency. Root tracked dependency files are not proof of a complete installed frontend environment; frontend/node_modules is absent.

Before future focused tests, verify the required Node runtime and dependency availability in this exact workspace. Any new package/install requires bounded approval. Do not copy another checkout's node_modules, .env or credentials. No tests/build/lint/project execution, providers, Auth, database, server or publisher is permitted during this provisioning task.

## Stop boundary

Implement only this presentation/state packet after workspace binding and the required environment gate. Preserve full beta/history scope and quarantined science. Stop for a new P0/P1, contract/science conflict or existing human gate. No operational source admission, scientific history selection, Nightly Learn/Audit, CP-10, production or deployment. Integration requires a separately reviewed checkpoint; no automatic merge/rebase/reset of another workspace.
