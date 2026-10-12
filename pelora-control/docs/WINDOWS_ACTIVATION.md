# Windows activation and recovery

Start from the isolated control-plane checkout. Requires Node 22+, Git, an authenticated native Codex executable and a deliberately reviewed local Codex execution boundary. No dependency install, daemon, production credentials or service setup is required by this foundation. The caller's configured Codex model is retained.

1. Validate and test from the checkout root:

   ```powershell
   node pelora-control/scripts/control.mjs validate
   node --test pelora-control/tests/*.test.mjs
   node pelora-control/scripts/probe.mjs
   ```

   The probe only initializes the local protocol. It does not start a thread/turn or establish model entitlement/authentication.

2. Prepare a NEW dedicated task root, leaving existing agent roots untouched:

   ```powershell
   & ./pelora-control/scripts/bootstrap.ps1 -WorktreeRoot 'C:\Projects\Pelora-Control-Tasks'
   ```

   This writes ignored `.local/settings.json` with execution DISABLED. It refuses to overwrite existing settings. Use a native executable path through `-CodexExecutable` if `codex` is not on PATH; `.cmd` and `.bat` wrappers are refused. Do not copy another checkout's `.env`, dependencies or credentials.

3. Review local hooks/config/MCP capabilities and credential exposure. Codex task scope is a cooperation contract plus a workspace sandbox, not a per-file ACL. Inherited MCP or host permissions can exceed this boundary. Use a restricted Codex environment and do not enable unattended runs with production-mutating tools/credentials accessible. Existing user authentication may be reused without exposing it to Git or the queue. Any credential creation/rotation, paid setup, elevation or installation remains a separate human gate.

4. Place explicitly authorized tasks in `queue.json` using the schema/example. Confirm ownership against AGENTS.md/execution-board contracts. The sample is NOT an assignment. It references the baseline, so the control-plane files added after that baseline would not exist in a task's baseline worktree; scope the first mission to files actually present at the pinned baseline. Then set `localExecutionEnabled` to `true` in the ignored settings after the boundary review.

5. Start a bounded task:

   ```powershell
   node pelora-control/scripts/control.mjs status
   node pelora-control/scripts/control.mjs run <authorized-task-id>
   ```

   Independent `run` processes can dispatch disjoint tasks concurrently using the SAME status directory. The controller creates only the exact new branch/worktree, reads canonical governance, and binds the executor to that path. No existing branch is reused for a new run. Do not launch an external Codex task against one of these scopes outside the controller.

6. Review the SUBMITTED task. Create a non-private JSON review receipt in `.local/` with `attempt`, `commit`, independent `reviewer`, `evidence` (reference only), and `passed: true`. The trusted operator checks the stated tests/acceptance evidence and exact candidate before recording qualification:

   ```powershell
   node pelora-control/scripts/control.mjs qualify <task-id> pelora-control/.local/review.json
   node pelora-control/scripts/control.mjs verify-push <task-id>
   node pelora-control/scripts/control.mjs finish <task-id> pelora-control/.local/receipt.json COMPLETE
   ```

   `verify-push` reads the exact remote branch SHA; it performs no push. Routine commit/push may be performed by the bounded executor under task policy, or by the trusted operator using exact branch/scoped files and active-hook checks; the controller independently verifies the result. Tasks expecting READY_FOR_INTEGRATION use that disposition, not COMPLETE before review. An integration receipt must include `humanApprovalRef` and the actual combined `commit`; it records human-supplied evidence and does not perform a merge. No automatic push/merge/deploy command is provided.

## Interrupted execution

Inspect `.local/state/status.json` and the actual process/thread/worktree. A retained RUNNING state is not proof the process survives, and a timeout is not proof it stopped. Confirm the precise executor is stopped; do not retry on elapsed time alone.

For exact-thread resume, supply `.local/stopped.json` with the retained `attempt`, `executorStopped: true`, and a non-private `operatorRef`:

```powershell
node pelora-control/scripts/control.mjs allow-resume <task-id> pelora-control/.local/stopped.json
node pelora-control/scripts/control.mjs resume <task-id>
```

Resume reuses the same attempt, baseline, bound worktree and recorded thread. It does not waive blocked actions or approvals. Dirty partial changes remain in that task's isolated checkout for review.

To fence an abandoned attempt, `reconcile` requires the same stopped receipt and a verified pristine exact-baseline worktree. It clears the attempt and returns the task to QUEUED. A new run still refuses an existing branch/worktree: preserve/archive the old checkout under an explicit bounded operator recovery, or assign a new task ID/branch/worktree. Do not delete/reset automatically. If failure preceded worktree creation, inspect and reconcile the partial setup manually; v1 does not claim automatic cleanup of that window.

If `controller.lock` survives a process crash, verify its PID and all executors are stopped before removing ONLY that exact lock directory under the configured status directory. Preserve the snapshot and reconcile each retained attempt. Never treat lock age as authorization to remove it. Do not hand-edit active task state, move an existing agent checkout, or run a second state store to bypass a lock.

No local agent task was dispatched by the implementation mission. The exact next desktop action is step 2: run `bootstrap.ps1` from this checkout to prepare disabled settings, then complete steps 3–5 for an explicitly assigned first mission.
