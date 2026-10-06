# Pelora execution board v1

## Checkpoint and setup disposition

Source implementation baseline: `dadec5dbca7d360f70f633413fb6a347dc24cac1`, verified locally and remotely on `codex/pelora-remote-setup` in `C:\Users\User\.codex\worktrees\e89f\SmartCharts-Offshore-Intelligence`. R9 is complete. Source admission/full history selection remain unqualified; CP-10 remains blocked. See the original [R9 record](../CP09B_R9_Temporal_Derived_Finiteness_Repair_v1.md) and [P3 decision package](../CP09B_P3_Source_History_Policy_Decisions_v1.md).

The governance checkpoint is the documentation-only commit that first adds this board, root AGENTS.md and the two mission files. Resolve its full SHA with `git log -1 --format=%H -- docs/agents/EXECUTION_BOARD_v1.md` before implementation. It is distinct from the source baseline and is the common starting commit for all three new branches. Its creation does not rerun, extend or imply any qualification. The final setup response records the verified remote SHA; no self-referential commit hash is embedded here.

Setup only: no implementation, project execution, test/build/lint, database access, server/publisher start or deployment. No old PELORA_Team_Bootstrap_v1.zip/script was inspected or run. No credentials, private file contents or private session storage were accessed. No installed dependency directory/local environment file was copied. Normal Git checkout includes the baseline's tracked root node_modules files and tracked .env.example template; this is not proof of an installed/usable frontend environment.

## Established identities

| Identity | Responsibility / packet |
|---|---|
| PELORA-00 — Lead / Orchestrator | Scope, coordination, approvals and mission assignment. |
| PELORA-01 — Critical Path / Integration | Preserve critical-path checkpoint; integrate separately reviewed work. No new science mission in this setup. |
| PELORA-02 — Captain Experience | [Intelligence render validation/recovery](missions/PELORA-02_Intelligence_Recovery_v1.md). |
| PELORA-03 — Living Ocean | [Field rendering/state consistency](missions/PELORA-03_Field_Rendering_Consistency_v1.md). |
| PELORA-04 — QA & Release | Later independent acceptance/release review; no workspace or execution assigned now. |
| PELORA-05 — Science Review | Existing governance/science review; no workspace or new policy assigned now. |
| PELORA-06 — Red Team | Later adversarial review; no workspace or execution assigned now. |

## Permanent isolated workspaces

| Workspace | Branch | Permanent path | Starting identity |
|---|---|---|---|
| Governance | codex/pelora-team-governance | C:\Projects\Pelora-Agent-Worktrees\team-governance | Documentation checkpoint above. |
| PELORA-02 | codex/pelora-02-captain-experience | C:\Projects\Pelora-Agent-Worktrees\pelora-02-captain-experience | Same governance commit. |
| PELORA-03 | codex/pelora-03-living-ocean | C:\Projects\Pelora-Agent-Worktrees\pelora-03-living-ocean | Same governance commit. |

Both mission states: **READY_FOR_WORKSPACE_BINDING — IMPLEMENTATION NOT STARTED**. Git provisioning and normal pushes are authorized; moving an existing Codex session is not accomplished by these operations. Remaining binding step: register/open the exact permanent directories in the app and confirm that the intended existing agent session actually uses its assigned directory/branch/HEAD before resuming. [Official OpenAI worktree documentation](https://learn.chatgpt.com/docs/environments/git-worktrees) supports Hand off between Local and a chat's associated worktree and describes permanent worktrees as projects. It does not establish arbitrary retargeting of an existing chat to these manually created paths. Do not invoke Hand off blindly: its Git operations could move a protected checkout or return the chat to its old managed worktree. If the app cannot bind the intended existing session to this exact path, report that unresolved limitation to PELORA-00 rather than launch a duplicate. No session handoff/rebinding has been performed or verified. No QA/science/red-team worktrees are requested.

## Preservation and hooks

Repository/origin: ChartIntelligence/SmartCharts-Offshore-Intelligence, `https://github.com/ChartIntelligence/SmartCharts-Offshore-Intelligence.git`.

Original main checkout: `C:\Projects\SmartCharts-Offshore-Intelligence`, branch main, HEAD `851fde53c587afc8e572d4abd54b1a3553a753ee`. Preserve its untracked `pelora_public_schema_audit.sql`. Original critical-path checkout retains source HEAD/branch and untracked `supabase/.gitignore` and `supabase/config.toml`. These private/unrelated file contents are not setup inputs and must not be read/copied. No push/movement of main or codex/pelora-remote-setup is authorized by this task.

Before creation, the common Git hooks directory was inspected by filename: only inactive .sample files, no active post-checkout/commit/push hooks, no configured core.hooksPath or fsmonitor command. No tracked AGENTS.md, .gitattributes or .gitmodules was found; applicable ancestor AGENTS paths checked were absent. No Codex setup script is invoked by this manual Git worktree path. Global Git/Codex permissions/configuration remain unchanged. Existing instructions/canonical files are preserved. Stop on conflicting branch/path names or unexpected workspace/remote changes; preserve partial setup and report it.

## Ownership, evidence and environment

PELORA-02 may edit OpportunityIntelligence.jsx, a dedicated Intelligence recovery component/helper, narrowly necessary Dashboard.jsx mounting, and dedicated tests. PELORA-03 may edit useMapLibreOceanFields.js, necessary oceanFieldPresentation.js and dedicated tests. PELORA-03 must not edit Dashboard.jsx, LayerControls.jsx, MapLegend.jsx or shell CSS. Shared edits need a separately coordinated scope; neither branch automatically merges or rewrites the other.

Use existing [product vision](../SmartCharts-Vision.md), [captain state governance](../Beta_Safety_Captain_State_v1.md), [field delivery contract](../Ocean_Scalar_Field_Delivery_v1.md), [scalar runtime governance](../Governed_Scalar_Field_Runtime_v1.md) and current source contracts. The older [Beta command board](../Beta_Command_Board_Current_State_v1.md) is historical audit evidence, not a substitute for the current checkpoint. Do not reconstruct a short product canon or treat its older findings as current runtime proof.

Manifests/tooling were inspected only as text: frontend/package.json and package-lock.json, vite.config.js, eslint.config.js and relevant Node tests. Frontend has no test script, Vitest or Jest declaration. Existing tests use Node assert/test/vm; the captain-state harness imports React, React DOM and rolldown/utils. PELORA-03's hook harness uses a controlled map/canvas/transport VM; oceanFields.test.js additionally imports the MapLibre style validator. New checkouts have no frontend/node_modules or backend/node_modules and no local .env file. Root tracked dependencies are unverified and do not provide a certified complete frontend install.

Before future focused tests, verify the required Node runtime and exact manifest/lockfile dependency availability in that workspace. Any package installation requires bounded approval; do not copy another checkout's node_modules or .env. Controlled component/map tests must avoid real Auth, providers and databases. A browser-capable environment may be needed for actual component rendering; any new tooling requires approval. Inspect existing test seams before choosing it. Current setup does not claim these tests are runnable or passed.

Each implementation packet must retain baseline reproduction, candidate before/after results, commands, fixtures, exact file/commit identities, exclusions and limits. Test actual Intelligence children, not only a stub. Preserve all evaluation-state distinctions and field-context/race guarantees. Reported black screens and physical-device performance remain unverified until separately tested. Integration, rollout, beta readiness and CP-10 require separate authorization.
