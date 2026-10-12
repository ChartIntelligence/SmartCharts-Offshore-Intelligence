# Pelora release gates

Canonical release/status authority. Production changes require explicit release authorization; a commit, push or integration is not authorization.

## Status semantics

Record each status separately with exact artifact/commit, environment, evidence and limitations. Do not infer a later status from an earlier one.

| Status | Required meaning/evidence |
|---|---|
| designed | Proposed architecture/behavior exists |
| documented | Repository description exists |
| implemented | Corresponding code/artifact exists at a stated identity |
| tested | Named checks executed with results and scope |
| qualified | Defined acceptance gates satisfied within explicit limits |
| committed | Exact local Git commit recorded |
| pushed | Exact branch/commit verified on remote |
| integrated | Explicit combined candidate identity and integration evidence |
| persisted | Exact data durably retained/read back in a named environment |
| enabled | Explicit activation/configuration verified in a named environment |
| deployed | Authorized artifact installed in a named runtime |
| live | Actual runtime behavior verified, with observation time and scope |
| beta ready | Final human BETA READY decision after required gates |
| launch ready | Final human launch authorization after required gates |

## Human approval gates

Human approval remains required for production deployment; production DB migration/schema/grant/RLS changes; credentials/secrets; paid services; UAC/system installation; material changes to locked Pelora philosophy/science/privacy; final BETA READY decision; and final launch authorization. Existing mission/package gates remain in force. Permission for documentation commit/push does not authorize these actions.

## Release qualification

Before requesting final release approval, present the concrete candidate, exact identity and bounded qualification results. Require scientific source/history admission, independent Observe and durable Ocean State, fixed-slot publishing and latest-state consumption, Nightly Audit, captain continuity/draft recovery, founder/device QA, effective owner/RLS/least-privilege verification and failure/restart acceptance appropriate to the release scope. Use the [beta command board](Beta_Command_Board_Current_State_v1.md); missing evidence stays open.

Preserve existing gates and quarantines. Never weaken gates to make checks pass. Controlled/synthetic qualification does not prove provider science, deployed security, physical-device usability or production behavior. Historical test counts must retain failures/exclusions and must not be summed as unique coverage when overlapping.

Repository evidence does not establish live production status. Receipt Writer enablement, schema application, TLS deployment configuration and CP-10 remain separately gated. No release or beta readiness is granted by this governance bootstrap.

## PELORA-CONTROL readiness

Task queue entry → agent/worktree → AGENTS.md → relevant canonical docs → bounded execution → qualification → status/result.

A queue entry should carry task ID, governance categories, exact baseline/worktree/branch, bounded scope and owned files, dependencies, acceptance criteria and human gates. Reference canonical paths/contract versions rather than embedding giant prompts. The executor reads only relevant categories, stops conflicting work, records evidence and reports each status separately. Approval and deployment evidence must be explicit; the control plane cannot infer or mint them. This document defines the routing interface only; no Control Plane is implemented.
