# Captain-facing Map Metadata Cleanup v1

Authorized base: f78666a66e76e65ff53e5d2da767f9c8988db90c
Branch: codex/pelora-02-map-metadata-cleanup-v1
Worktree: C:\Projects\Pelora-Agent-Worktrees\pelora-02-map-metadata-cleanup-v1

Before editing: exact HEAD verified, clean status. Starting Git blobs:
- Dashboard.jsx: 573d9ac4c3d3b4e2796351f54f4b177b49ed52f6
- LayerControls.jsx: 7d2be1593a441eb7f1d7f3497805d9199da4dd73
- useMapLibreOceanFields.js: 8cf1aa5dccdcdcc50ca6e3b44e4a752ee10ea4ab
- oceanFieldPresentation.js: f1c25ee92b1ffea5d4f613f9a9bd95f1eb1be0dc

## Presentation delta

Before: Dashboard permanently displayed the full fieldStatusText telemetry over the map. Provider, dataset edition or UTC time, valid-cell ratio, raw grid resolution and internal static/latest-available states occupied the primary canvas. LayerControls showed technical field labels and raw transport status.

After: the canvas telemetry block is removed. Map Intelligence offers Bathymetry / Geostrophic Currents with concise status in its layer rows. Examples: Available; Latest available · 1h old; Stale · latest available · 65h old; Loading…; Loading… · Stale · latest available · 65h old; Degraded · Stale · latest available · 65h old; Unavailable; Error · unavailable; Off. Age and freshness consume existing validTime and maxFreshAgeHours with exactly the existing greater-than boundary, never a new science threshold. Declared stale state is retained. Dashboard supplies its existing map observation clock.

Each field row has a native collapsed Source & Evidence Details disclosure. This contains the unchanged full fieldStatusText output and readable JSON metadata: provider identity, dataset/version, observation time, freshness policy, coverage/counts, resolution, field identity, evidence state, reason and all other field-envelope metadata. Payload arrays are not duplicated into the disclosure; the entire original field object/payload remains untouched in existing state and diagnostics. No provenance or source contract is changed. QA sample controls remain unchanged. Chart-navigation and geostrophic-flow limitations remain visible.

## Files changed

- frontend/src/components/Dashboard.jsx
- frontend/src/components/LayerControls.jsx
- frontend/src/hooks/tests/mapMetadataCleanup.test.js
- frontend/src/hooks/tests/mapMetadataCleanup.evidence.md

No other source from the integration base changes. In particular, useMapLibreOceanFields.js and oceanFieldPresentation.js retain the starting blobs above. No contour/current rendering, acquisition, lifecycle, contracts, styles, dependencies or other packet edits. The original P02 branch/worktree at a8a17cbed53ba7f8c722d9c79eb962964e339577 remains clean and unchanged.

## Controlled verification

Command from candidate root:

    node frontend/src/hooks/tests/mapMetadataCleanup.test.js C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules

19/19 passed, zero failures/skips/cancellations. Tests exercise concise labels, existing freshness threshold equality, explicit stale, fresh latest-available, retained loading/degraded, unavailable/error/off, input immutability, unchanged full telemetry formatter, canvas removal, clock propagation, actual open LayerControls rendering with disclosure placement and preserved provider/time/version/count/grid/dataset/reason metadata, initial loading without unavailable, and JSX parsing of both changed components.

Runtime: Node v24.18.0; existing read-only React 19.2.7 / React DOM 19.2.7 / rolldown 1.1.5 from the earlier approved P02 install. No dependency installation/copying, environment/credential copying or system changes in either workspace. React server rendering uses a controlled open-state hook; no native browser event/layout claim. The test accepts an explicit existing node_modules path for repeatability and does not hardcode cross-workspace imports.

git diff --check passes. Final commit preserves P03 blobs and all source outside the four listed paths. Candidate commit SHA is reported separately to avoid self-reference in this record.

## Remaining QA / stop

Desktop/mobile browser QA still required: collapsed/open panel layout, long evidence JSON wrapping/scrolling, native disclosure keyboard/touch behavior, screen-reader announcements, overlap at small viewport sizes, and live age updates during pan/refresh/failure. No actual providers, Auth, databases, browser map runtime or physical devices exercised. No production, science/source qualification or release-readiness claim. No merge, deployment or push performed by this packet; candidate is for independent review/integration.
