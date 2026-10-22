# STATUS

## 2026-10-20: GitHub-side branch audit (read-only, done from a phone session)
Environment: shallow fetch (depth 40) of all 47 GitHub branches. Nothing run,
built or tested; nothing on main or any codex/* branch was changed. Ancestry
questions that needed deeper history are marked UNKNOWN, not guessed.

### Confirmed
- The four newest qualified commits in HANDOFF.md are NOT on GitHub:
  7d53e2e4 (snapshot acknowledgment fix), f7ee570a (React hook successor),
  4e013d4e (full-App test), c6c7b25f (SDK probe). They exist only on the
  Founder's Windows machine. Back up C:\Projects before anything else.
- 09dfac11 and e24d679 (cited as the inspected/preview commits) ARE on GitHub,
  and 09dfac11 is an ancestor of codex/pelora-founder-https-preview-v1.
- main (851fde5, Sep 21) is far behind. Governance docs (AGENTS.md,
  docs/PELORA_*.md), backend/oceanState, backend/observe,
  backend/durableObserve and frontend/src/utils/peloraApi.js exist on the
  codex/* branches checked (qa-report-guard, founder-https-preview,
  coordination-bridge, governance-bootstrap, bath-d1a) but not on main.
- The Fishing Log files differ from main on the newest branches
  (FishingDayReportPanel.jsx: +69/-209; SavedFishingDayReports.jsx changed).
  The saved-report card header (date, boat, captain) is the same structure
  there, so the planned flag placement still fits.

### Not established (UNKNOWN)
- Whether main is an ancestor of the codex/* branches (shallow history).
- Which branch is the newest COHERENT candidate. Newest GitHub app-code branch
  is founder-https-preview-v1 (Oct 18), but HANDOFF.md says it is
  preview-specific and not a release candidate. codex/pelora-coordination-bridge-v1
  (Oct 19, docs commit) differs from it by 73 files in frontend/backend/
  supabase (+482/-3093); the reason is unknown.
- Retained Gulf bathymetry: branches have bathymetry code, tests, fixtures and
  one branding SVG, but a filename search found no stored Gulf grid/contour
  data asset. Consistent with HANDOFF.md open question 3; not proof.

## 2026-10-21: Local inventory (from Founder's `git worktree list` and `git status`)
Source: output pasted by the Founder; compared with GitHub branch heads. Nothing
was run on the PC by Claude. Backup of C:\Projects verified with a robocopy
dry run (188,713 files, 0 to copy, 0 mismatch, 0 failed; junctions excluded).

- 85 worktrees exist (84 parsed; one line in the paste was scrambled: the
  codex/pelora-control-plane-v1 entry, which is on GitHub).
- 40 worktree branches match GitHub exactly. 39 branches are LOCAL-ONLY (not on
  GitHub). 2 exist on both but at DIFFERENT commits (truthful-status-v1,
  unified-ui-amendment-v1): direction (ahead vs diverged) not yet checked.
- All four commits cited in HANDOFF.md as local-only exist locally on their
  own branches and are not on GitHub: snapshot-storage-correction (7d53e2e),
  snapshot-react-lifecycle (f7ee570), snapshot-full-app (4e013d4),
  snapshot-readonly-sdk-probe (c6c7b25).
- Local-only branches include the Gulf bathymetry retention work
  (pelora-03-gulf-bathymetry-retention-v1), provider readiness, historical SST,
  retained scalar review, species reference validator, enrollment/beta
  qualifying session, production-pair compatibility/coverage, and several
  unified-UI candidates. Which UI branch is the newest coherent candidate is
  still UNKNOWN (needs commit dates and ancestry from the full local history).
- Main checkout is on codex/pelora-05-nightly-audit-blueprint-v1 at the same
  commit as GitHub (aaabba4). It has UNTRACKED, uncommitted items that exist
  nowhere else: Temporal_Boundary_Validation_Manifest_v1.json/.md, docs/agents/,
  pelora_public_schema_audit.sql. Do not delete or clean them.
- 9 worktrees live OUTSIDE C:\Projects (8 under a .codex folder, 1 under
  Documents\Codex). Their commits are in the shared main .git (backed up); any
  uncommitted files inside them are not covered by the C:\Projects backup.
- 3 worktrees are detached HEAD (19a9afd twice, 14c8984 once).

### Needs Founder
- Back up C:\Projects first, then run Task 0 (read-only audit) on the PC to find
  local-only worktrees. Build the release-flag work on the newest integration
  candidate, not main.
