# Pelora Control Plane v1

Small development controller: a trusted structured queue → exact Git worktree → canonical governance → bounded Codex turn → submitted result → independent qualification. No Pelora runtime code, science policy, migrations or release configuration changes.

Pinned accepted baseline: `10150d5a8187e4ba52f62c0c747d919b30345b7d`. It supersedes `789de11...`. No fallback, fetch substitution or latest-branch selection exists. The initial queue is deliberately empty: proposed beta-board work is not a mission assignment.

## Files and entry points

- `agents.json`: editable established lanes, including PELORA-01/02/03/04/05/06, PELORA-GOV and PELORA-CONTROL. Lane ceilings do not grant a mission or supersede the execution board.
- `queue.json`: trusted operator's versioned task assignments. `docs/example-task.json` is unqueued, unassigned and never dispatched automatically.
- `task.schema.json`: generated JSON Schema; `scripts/schema.mjs` is its source. `dispatcher/core.mjs` additionally checks registry ownership, scope safety, cross-field policies and dependency graph. Schema acceptance alone is not execution permission.
- `status.json`: empty tracked template. Actual task/attempt/thread/evidence/event counts live under ignored `.local/state/`, separate from all agent worktrees.
- `dispatcher/policy.mjs`: pinned baseline, canonical routes, action vocabulary and contract locks.
- `dispatcher/core.mjs`: pure validation, readiness, identity fencing, bounded statuses and receipts.
- `dispatcher/store.mjs`: local exclusive transaction lock and atomically replaced status snapshot.
- `dispatcher/git.mjs`: shell-free Git worktree provisioning and identity inspection.
- `dispatcher/adapters.mjs`: stdio app-server transport, local start/resume/interrupt boundary and Cloud port.
- `dispatcher/controller.mjs`: persists execution intent before side effects; retains locks through uncertain outcomes.
- `scripts/control.mjs`, `scripts/bootstrap.ps1`, `scripts/probe.mjs`: CLI, disabled Windows setup and protocol-only probe.
- `tests/`: synthetic core, adapter, controller, persistence and real temporary-Git tests.

Node 22+ and Git are the only foundation dependencies. There is no package installation.

```powershell
node pelora-control/scripts/control.mjs validate
node --test pelora-control/tests/*.test.mjs
```

## Task contract

Every task has version, ID, established owner, title, goal, full baseline SHA, repository, isolated worktree name and `codex/pelora-*` branch, local/cloud environment, dependencies, allowed files, protected files/contracts, governance categories, type, actions, required tests, commit/push/merge policies, approval requirements, stop conditions and expected final disposition. Scope syntax is an exact repository-relative file or a directory ending in `/**`. Traversal, absolute paths, environment/credential directories and dependency trees are refused. IDs, branches and worktrees must be unique.

Types are implementation, analysis, documentation, QA and integration. Analysis/QA are read-only. Three mandatory governance categories are release, decisions and ownership; AGENTS.md is always first. Other categories are product, science, privacy and beta. The worktree loader verifies the references at the task's exact baseline and packages their content digests; the executor reads those tracked canonical sources and relevant routed contracts. No duplicate governance bootstrap is needed at this baseline.

Commit/push permission is explicit per task. Integration/merge needs a human receipt. Tests are bounded commands/check identifiers, not commands executed by an untrusted result. Stop conditions and scope are passed verbatim to the assigned executor. Task edits after retention require a new ID; a saved digest prevents silently reassigning an in-flight mission.

## Concurrency and restart

All local and future Cloud executions MUST share one trusted status directory on one local disk. `controller.lock` serializes readiness/attempt reservations and snapshot updates. Overlapping write scopes, explicit protected files and shared protected contract locks prevent parallel writers. Read-only tasks do not acquire write locks. The initial inferred locks are deliberately conservative: frontend writers share Map Intelligence/Captain Logging locks; backend writers share Opportunity protection; Observe, migrations, release and canonical governance have additional locks. Narrow this policy only through a separately reviewed change.

RUNNING, WAITING_FOR_APPROVAL and QUALIFICATION_FAILED retain locks. A crash does not release them and never automatically retries an executor. Persisted intent comes before worktree creation or task dispatch. On uncertain start the operator inspects actual worktree/process/thread state before an explicit stopped-executor reconciliation or exact-thread resume. Never break a surviving controller's transaction lock. This is local coordination, not a distributed lease service or a defence against processes that bypass the controller.

## Approvals and evidence

Sensitive actions: production deployment; production migration/schema/grants/RLS; credentials/secrets; paid services; system installation/elevation; Render/Supabase production mutation; material locked-governance change; final beta-ready and launch-ready authorization. Writes covering canonical governance automatically need human review. Missing human gates reject the task; declared gates lead to WAITING_FOR_APPROVAL. Sensitive execution remains deliberately unsupported in v1, even if a queue author supplies an approval-looking field.

Local executor approval requests are declined, the turn is interrupted where possible and the task waits with its locks held. Unknown privileged server requests are refused. A stopped-executor recovery receipt does not authorize the sensitive action. No generic auto-approval or sandbox bypass flag exists. Routine host permission requests can still pause a local task; production-safe approval forwarding is a future boundary, not claimed here.

Results are untrusted. The controller verifies attempt, task digest, thread, baseline, branch, actual Git HEAD, baseline ancestry, clean worktree, allowed changed files and required PASS receipts. It stores selected receipt fields and method counts, not raw prompts/tool output, stderr or an arbitrary report object. Use synthetic, non-private reference-only evidence; this does not automatically redact private prose placed in a permitted receipt field. Results cannot grant their own qualification. An independent review receipt must be supplied through the trusted controller CLI; a reviewer name in JSON is not authenticated identity proof.

QUEUED → READY/BLOCKED → RUNNING → submitted evidence (still RUNNING) → explicit QUALIFIED → separately verified COMMITTED/PUSHED → explicit READY_FOR_INTEGRATION/INTEGRATED/READY_FOR_FOUNDER_QA/COMPLETE. WAITING_FOR_APPROVAL and QUALIFICATION_FAILED are explicit stop states. Only COMPLETE satisfies dependencies. Committed, pushed, integrated, deployed and live are never inferred from a prior state. There is no deployment/live/beta/launch command.

## Execution limits

Local app-server start/resume and event collection are implemented. Protocol handshake was exercised on Windows; agent-turn behavior is tested through an injected synthetic RPC, not claimed as a live model task. No Windows service or daemon was installed. Activation is disabled by default. Scope locks plus Git post-checks are coordination/acceptance controls; the Codex workspace sandbox is coarser than per-file ownership. Before activation, the operator must ensure the chosen Codex profile, hooks, MCP tools, credentials and environment cannot bypass the task's boundaries. The controller refuses active Git hooks/custom fsmonitor during provisioning, but it is not an OS security isolation system.

Cloud dispatch is interface-only. `CloudAdapter` accepts a future explicit port; no Cloud API authentication, environment provisioning or real Cloud task is wired. Its metadata port must inspect the actual Cloud repository, not reuse local Git inspection. Do not run two independent stores or invent Cloud/local equivalence.

See [Windows activation](docs/WINDOWS_ACTIVATION.md), [qualification evidence](docs/QUALIFICATION.md) and the [official Codex app-server documentation](https://learn.chatgpt.com/docs/app-server). The selected boundary follows the documented initialize → thread/start or thread/resume → turn/start lifecycle. The [non-interactive CLI documentation](https://learn.chatgpt.com/docs/non-interactive-mode) describes the alternative JSONL CLI boundary; v1 uses app-server for lifecycle control.
