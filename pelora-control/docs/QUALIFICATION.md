# Control-plane foundation qualification

Implementation mission: PELORA-CONTROL — BUILD PELORA CONTROL PLANE v1, recovered from the original authorized task brief. The local baseline update supersedes the earlier Cloud baseline. Exact reproduction baseline: `10150d5a8187e4ba52f62c0c747d919b30345b7d`. Isolated branch: `codex/pelora-control-plane-v1`. Parent checkout and existing agent worktrees are excluded from implementation writes.

Before: no `pelora-control/` at the accepted baseline; canonical governance explicitly defined routing only. After: versioned queue/schema/registry, dispatcher state/lock/result core, atomic local store, exact Git boundary, local app-server lifecycle adapter, explicit Cloud port and Windows disabled bootstrap exist under this dedicated directory. Canonical governance and all runtime code remain unchanged.

Validation commands:

```powershell
node pelora-control/scripts/schema.mjs
node pelora-control/scripts/control.mjs validate
node --test pelora-control/tests/*.test.mjs
node pelora-control/scripts/probe.mjs
git diff --check
```

The final suite passed **41/41** with zero failures/skips: synthetic core/adapter/controller/store fixtures plus a real temporary Git repository/worktree round trip. The earlier 31/31 core and 39/39 expanded runs overlap this final suite and must not be added as unique coverage. The final scope checks also refuse nested worktree targets and out-of-scope partial changes on resume; canonical governance writes cannot omit a human review gate; unrelated result/review fields are excluded from saved evidence.

Coverage includes valid/invalid tasks; unknown owner; wrong exact baseline; safe paths; unknown/cyclic/unmet dependencies; duplicate target rejection; overlapping write scopes; protected contracts; safe parallel/read-only scopes; sensitive gates; blocked production actions; submission/independent qualification; stale result/qualification; branch/SHA/ancestry mismatch; scope and dirty-worktree rejection; test receipts; separate Git/status transitions; reload/restart lock retention; rollback; stopped-executor resume; RPC approval denial, timeout/disconnect; Cloud interface limitation; and source-checkout preservation during real Git provisioning.

The sandbox initially blocked Node test-worker spawn with EPERM; the authorized rerun outside that process restriction passed. No dependencies were installed. The installed native CLI reported `codex-cli 0.162.0-alpha.17.2`. A REAL app-server initialize/initialized handshake returned `initialized: true`, `platformFamily: windows`, `platformOs: windows`. No thread, model turn, Cloud job, production action or environment credential inspection was performed by that probe.

Qualification limits: bounded local development mechanics only. Adapter task turns/resume/approval paths use synthetic RPC; there is no end-to-end live model task qualification, unattended Windows service, Cloud API integration, distributed lock guarantee, authenticated reviewer identity, per-file OS write confinement or automated privacy-redaction assurance. Required test receipts remain claims until the trusted operator independently verifies their named evidence. No real provider, Auth, captain data, production database, Render/Supabase mutation, migration, deployment or release readiness was exercised. CP-10, paused science, quarantined projections, Receipt Writer and beta/founder gates remain unchanged.

Official source checks on 2026-10-12: [Codex app-server](https://learn.chatgpt.com/docs/app-server) for initialize/thread/turn/resume/approval lifecycle; [non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode) for the optional CLI JSONL/structured-result boundary. Local CLI help was inspected for installed-version availability. Cloud API availability is not inferred from documentation or the local handshake.
