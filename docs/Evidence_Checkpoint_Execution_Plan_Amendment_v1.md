# Final preservation execution-plan amendment v1

**FINAL_PRESERVATION_AMENDMENT_READY_FOR_HUMAN_APPROVAL**

PLAN AUTHORING ONLY. This amendment is proposed, not approved for checkpoint execution. Classification: **OPERATIONAL_GOVERNANCE**. NAVIGATION / EXECUTION AUTHORITY ONLY upon express approval; NOT SCIENTIFIC AUTHORITY; NOT RUNTIME AUTHORITY.

This narrow amendment adds exactly one checkpoint, **CP12A**, without renumbering any historical checkpoint. It preserves execution-plan v2 and every existing artifact byte-identically. It does not edit original CP13 membership, protected audit bytes, purpose, authority, commit message or tag annotation.

Starting/final authoring HEAD is `3a7f3fc4f6c75020c8c23ec74879f3b5d44d565a`, branch `codex/pelora-remote-setup`. CP00-CP12 annotated chain is verified. Both CP12A and CP13 require later, separate execution authorization. No staging, checkpoint execution, scientific tests, commit or tag is authorized by this document.

The machine-readable amendment contains the exact membership ledger, protected baseline, verified predecessor chain, metadata templates, unchanged original CP13 metadata, approval record and execution conditions. Only the two amendment outputs are created by this authoring task.

## Exact starting partition

Initial ordinary untracked count: **20**, verified by exact paths, not count alone.

**originalCP13** (2 files):

- `docs/Evidence_Stack_Preservation_Audit_v1.md`
- `docs/Evidence_Stack_Preservation_Audit_v1.json`

**planEraGovernance** (4 files):

- `docs/Evidence_Checkpoint_Plan_Adversarial_Review_v1.md`
- `docs/Evidence_Checkpoint_Plan_Adversarial_Review_v1.json`
- `docs/Evidence_Checkpoint_Execution_Plan_v2.md`
- `docs/Evidence_Checkpoint_Execution_Plan_v2.json`

**postPlanOperational** (10 files):

- `docs/CP01_Protected_Whitespace_Exception_Review_v1.md`
- `docs/CP01_Protected_Whitespace_Exception_Review_v1.json`
- `docs/Future_Protected_Whitespace_Baselines_CP02_CP08_v1.md`
- `docs/Future_Protected_Whitespace_Baselines_CP02_CP08_v1.json`
- `docs/Windows_Isolated_Checkout_Boundary_Review_v1.md`
- `docs/Windows_Isolated_Checkout_Boundary_Review_v1.json`
- `docs/Offline_Dependency_Closure_Qualification_v1.md`
- `docs/Offline_Dependency_Closure_Qualification_v1.json`
- `docs/Zero_Network_Offline_Materialization_v1.md`
- `docs/Zero_Network_Offline_Materialization_v1.json`

**reconciliation** (2 files):

- `docs/Final_Pre_CP13_Preservation_Reconciliation_v1.md`
- `docs/Final_Pre_CP13_Preservation_Reconciliation_v1.json`

**excludedSupabase** (2 files):

- `supabase/.gitignore`
- `supabase/config.toml`

The four plan-era governance exclusions existed at plan freeze; they are not post-plan creations. The ten operational files were created during checkpoint execution. The reconciliation pair is explicitly **INCLUDE_AS_OPERATIONAL_GOVERNANCE_EVIDENCE**, because it explains why this amendment and new checkpoint exist. No input is omitted or silently reassigned to CP13.

## Narrow overrides and sequence

The only amended relationship is:

```text
CP12 3a7f3fc4f6c75020c8c23ec74879f3b5d44d565a
  -> CP12A <future verified commit and annotated tag target>
  -> CP13 <future final commit>
```

CP12A's direct parent is the fixed CP12 OID above. CP13's direct parent must equal the verified CP12A execution receipt and peeled tag `checkpoint-preservation-execution-operational-evidence-v1`; CP12A's own direct parent must still equal CP12. Do not assume arbitrary current HEAD. All earlier parent relationships and tags remain unchanged.

Explicitly replace only the final ordering/parent expectation, final membership disposition and untracked preflights, and supply execution-era operational context. This supersedes the original v2 exclusion of the plan/adversarial pairs for the final preservation sequence only. Preserve v2 as the unchanged historical plan; it continues to govern unaffected matters. No scientific, contract, dependency, runtime or evidence-status override.

## CP12A exact membership and classifications

CP12A has **18 files**: 4 plan-era governance + 10 operational + 2 reconciliation + 2 amendment files. Every entry below belongs to CP12A, including this Markdown and its JSON companion. The audit pair does not belong to CP12A.

All entries have navigation/execution preservation authority only, never scientific/normative-scientific/runtime authority. Qualified operational status is bounded by recorded versions, inputs, hashes and checkpoints. Reconciliation is explanatory governance; the amendment has execution authority only after explicit approval.

| Path | Classification | Bytes | Lines | SHA-256 / binding |
|---|---|---:|---:|---|
| `docs/CP01_Protected_Whitespace_Exception_Review_v1.json` | QUALIFIED_OPERATIONAL_EVIDENCE | 441205 | 19986 | `cf47206581d50ac19710f27eb41c8ee728fe3a54dcbb938aa18decb3bdc113e2` |
| `docs/CP01_Protected_Whitespace_Exception_Review_v1.md` | QUALIFIED_OPERATIONAL_EVIDENCE | 7525 | 74 | `c3bd2d59d4ba243bb69a394ecfd8c851ccdcd1127cd9024279d22d515cc1d54e` |
| `docs/Evidence_Checkpoint_Execution_Plan_v2.json` | QUALIFIED_OPERATIONAL_EVIDENCE | 485983 | 6144 | `85da306930d093ba7584d341e0834a380033821bdd142be8a44827322bd2df70` |
| `docs/Evidence_Checkpoint_Execution_Plan_v2.md` | QUALIFIED_OPERATIONAL_EVIDENCE | 23016 | 244 | `ca793b02c20aac9d0c02abd38fadd1185dd9347d2f155645cf6c679ae7ee1dc9` |
| `docs/Evidence_Checkpoint_Plan_Adversarial_Review_v1.json` | SUPERSEDED_OPERATIONAL_EVIDENCE | 581378 | 13582 | `f6b87eed42ec291febd754cdc695c98e52253be467baa466251154da7713298e` |
| `docs/Evidence_Checkpoint_Plan_Adversarial_Review_v1.md` | SUPERSEDED_OPERATIONAL_EVIDENCE | 34206 | 279 | `ff3d32ace793868caca7aedaebd07f7ab9c9ea9a7597ea1ba58de9256d616574` |
| `docs/Future_Protected_Whitespace_Baselines_CP02_CP08_v1.json` | QUALIFIED_OPERATIONAL_EVIDENCE | 783983 | 40618 | `ab910a2c8e216a48c444268941b8a88267a8cf7d992e5e6f9c827585d9008e68` |
| `docs/Future_Protected_Whitespace_Baselines_CP02_CP08_v1.md` | QUALIFIED_OPERATIONAL_EVIDENCE | 8704 | 99 | `b8c18c054f30eae23a7820cff3f13920c40865343532878d0e5df0f0ad8931ae` |
| `docs/Offline_Dependency_Closure_Qualification_v1.json` | STOP_BOUNDARY_OPERATIONAL_EVIDENCE | 65214 | 1255 | `32bb0e73b0b996ffd79737e5769e5db7bc3a0648dbf4804b17807edc0f2a4c41` |
| `docs/Offline_Dependency_Closure_Qualification_v1.md` | STOP_BOUNDARY_OPERATIONAL_EVIDENCE | 11930 | 114 | `db9d384c2efca61bafcc506c1bd7a124c44d746ca7ba3b059a4295de34adf9ca` |
| `docs/Windows_Isolated_Checkout_Boundary_Review_v1.json` | STOP_BOUNDARY_OPERATIONAL_EVIDENCE | 27347 | 537 | `64b8098cf1fe0abb6f4512be90c415b792c11d11e66f7665d2d63e8481183c76` |
| `docs/Windows_Isolated_Checkout_Boundary_Review_v1.md` | STOP_BOUNDARY_OPERATIONAL_EVIDENCE | 11901 | 115 | `21ffd6844fd30afa791c698f508fd321e127fa7a7e6ba7c9751f8f3694644683` |
| `docs/Zero_Network_Offline_Materialization_v1.json` | QUALIFIED_OPERATIONAL_EVIDENCE | 105751 | 2338 | `9422ab12d06e57f24eda2767cbbec2d942700320e3bd51dcee9a8b66db40c5af` |
| `docs/Zero_Network_Offline_Materialization_v1.md` | QUALIFIED_OPERATIONAL_EVIDENCE | 12848 | 127 | `d82aa845b436e44d5793858609dce21c3ba88f22e23beccc899167730da77aa6` |
| `docs/Final_Pre_CP13_Preservation_Reconciliation_v1.md` | OPERATIONAL_GOVERNANCE | 20977 | 199 | `a2086ddb25373f17a25a76c5c2387e596cf72359aca9610c128cdeff80753745` |
| `docs/Final_Pre_CP13_Preservation_Reconciliation_v1.json` | OPERATIONAL_GOVERNANCE | 52782 | 980 | `392b59ef9894ba52d400ef1998492c1b997ebfe4487dd365248781831911a632` |
| `docs/Evidence_Checkpoint_Execution_Plan_Amendment_v1.md` | OPERATIONAL_GOVERNANCE | Detached final measurement | Detached final measurement | `DETACHED_APPROVED_FINAL_DIGEST` |
| `docs/Evidence_Checkpoint_Execution_Plan_Amendment_v1.json` | OPERATIONAL_GOVERNANCE | Detached final measurement | Detached final measurement | `DETACHED_APPROVED_FINAL_DIGEST` |

Classification totals: 8 QUALIFIED_OPERATIONAL_EVIDENCE, 4 STOP_BOUNDARY_OPERATIONAL_EVIDENCE, 2 SUPERSEDED_OPERATIONAL_EVIDENCE and 4 OPERATIONAL_GOVERNANCE.

Authority distinctions remain mandatory:

- CP01 review qualifies only its four exact historical whitespace findings. CP02-CP08 review qualifies only its seven exact baselines. Neither grants a new exception for CP12A/CP13.
- Windows review retains its overall unresolved STOP verdict. Its extraction-only finding survives; it is not retroactively a complete-environment PASS.
- Offline dependency closure retains its unresolved STOP and incomplete regression. Its old npm procedure is superseded; declaration/cache/retained-fixture findings remain historical derivation.
- Zero-network materialization is the qualified recorded procedure. Current operational authority is limited to the demonstrated mechanism/tool/input scope. Preserving its embedded runner does not execute or newly qualify it.
- Adversarial review remains superseded/resolved plan-revision history. Execution-plan v2 is unchanged original governance, with only the final sequence expressly amended here.
- Reconciliation explains the change. It does not become a scientific contract, and its prior unapproved proposal is not rewritten to imply past approval.

## Non-circular self-preservation

Git can commit a plan describing its own membership. The circularity concerns embedding a file's final SHA-256 inside that same file, not Git tree semantics.

The two amendment entries intentionally have no embedded numeric self-size, line count or SHA-256. Their exact final values are provided in the **detached finalization receipt and authoring response** after both files are finalized. The JSON records that receipt's location. This is a local operational receipt outside the repository, not a third untracked plan artifact.

Human approval must bind those final digests. Later execution must compare worktree and staged blobs against the approved values; it must not compute fresh values and silently treat them as approved. If the digest binding is absent or differs, STOP. The Git commit tree additionally binds both exact amendment blobs. No self-rewriting, normalized-hash scheme or impossible self-hash is used.

The CP12A commit and tag templates have only two substitutions: `{{AMENDMENT_MD_SHA256}}` and `{{AMENDMENT_JSON_SHA256}}`. Replace them only with the approved 64-character lowercase hexadecimal final digests. No other text substitution or improvisation. The resulting metadata is deterministic and must be recorded verbatim in the external execution receipt. Both amendment files are committed in CP12A; none is stranded after CP13.

## CP12A proposed metadata

Exact commit subject:

```text
Preserve checkpoint execution governance and operational qualification history
```

Exact proposed annotated tag: `checkpoint-preservation-execution-operational-evidence-v1`. No collision exists at authoring; recheck immediately before execution. Never force or replace a tag.

The exact commit-message template is the subject, one blank line, then the following exact tag-annotation template. No other amendment to the body is authorized:

```text
CHECKPOINT PURPOSE: CP12A - Preserve checkpoint execution governance and operational qualification history. Preservation only.
AUTHORITY STATUS: NAVIGATION / EXECUTION GOVERNANCE ONLY; NOT SCIENTIFIC AUTHORITY; NOT RUNTIME AUTHORITY. No scientific qualification created by commit/tag.
NORMATIVE STATUS: No new scientific contract. Existing qualified contracts retain only their exact normative scopes.
RUNTIME STATUS: NOT A RUNTIME RELEASE. No production implementation, deployment or dependency change.
QUALIFIED OPERATIONAL EVIDENCE: CP01 whitespace exception, CP02-CP08 exact baselines and zero-network materialization retain only their recorded checkpoint/hash/tool/input scope. No future whitespace exception or blanket environmental qualification.
STOP OPERATIONAL EVIDENCE: Windows isolated-checkout review retains its overall unresolved verdict and extraction-only result. Offline dependency closure retains its unresolved verdict, prohibited attempted request and incomplete regression. Neither is retroactively PASS.
SUPERSEDED PROCEDURES: Offline closure's old npm command is superseded by Zero_Network_Offline_Materialization_v1. Adversarial plan review remains historical resolved plan-revision evidence.
GOVERNANCE: Execution-plan v2 is preserved byte-identically as the original historical plan. This separately approved amendment overrides only final ordering/parent, final membership disposition, untracked preflights and final operational context. Reconciliation explains why; it is not science.
SELF-PRESERVATION: Both amendment files belong to CP12A. Their exact final hashes are bound by the detached human-approved digest receipt and the Git tree, not circular embedded self-hashes.
PREDECESSOR: CP12, 3a7f3fc4f6c75020c8c23ec74879f3b5d44d565a. All CP00-CP12 history remains unchanged.
NEXT AND FINAL CHECKPOINT: CP13, exact original audit pair. Audit v1 remains historical PRE-EXECUTION preservation/navigation metadata. CP12A supplies execution-era context; audit v1 does not independently cover CP12A.
EXCLUSIONS: supabase/.gitignore and supabase/config.toml remain excluded. V3 implementation/suite remain quarantined and unexecuted. STOP, superseded, failed and current-open scientific evidence are not upgraded.
NO SCIENCE, runtime changes, provider/database/Auth/Supabase access, environmental acquisition, push or deployment. STOP after CP12A; CP13 requires separate execution authorization.
FILE CLASSIFICATIONS AND EXACT BYTE IDENTITIES:
docs/CP01_Protected_Whitespace_Exception_Review_v1.json | QUALIFIED_OPERATIONAL_EVIDENCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 cf47206581d50ac19710f27eb41c8ee728fe3a54dcbb938aa18decb3bdc113e2
docs/CP01_Protected_Whitespace_Exception_Review_v1.md | QUALIFIED_OPERATIONAL_EVIDENCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 c3bd2d59d4ba243bb69a394ecfd8c851ccdcd1127cd9024279d22d515cc1d54e
docs/Evidence_Checkpoint_Execution_Plan_v2.json | QUALIFIED_OPERATIONAL_EVIDENCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 85da306930d093ba7584d341e0834a380033821bdd142be8a44827322bd2df70
docs/Evidence_Checkpoint_Execution_Plan_v2.md | QUALIFIED_OPERATIONAL_EVIDENCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 ca793b02c20aac9d0c02abd38fadd1185dd9347d2f155645cf6c679ae7ee1dc9
docs/Evidence_Checkpoint_Plan_Adversarial_Review_v1.json | SUPERSEDED_OPERATIONAL_EVIDENCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 f6b87eed42ec291febd754cdc695c98e52253be467baa466251154da7713298e
docs/Evidence_Checkpoint_Plan_Adversarial_Review_v1.md | SUPERSEDED_OPERATIONAL_EVIDENCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 ff3d32ace793868caca7aedaebd07f7ab9c9ea9a7597ea1ba58de9256d616574
docs/Future_Protected_Whitespace_Baselines_CP02_CP08_v1.json | QUALIFIED_OPERATIONAL_EVIDENCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 ab910a2c8e216a48c444268941b8a88267a8cf7d992e5e6f9c827585d9008e68
docs/Future_Protected_Whitespace_Baselines_CP02_CP08_v1.md | QUALIFIED_OPERATIONAL_EVIDENCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 b8c18c054f30eae23a7820cff3f13920c40865343532878d0e5df0f0ad8931ae
docs/Offline_Dependency_Closure_Qualification_v1.json | STOP_BOUNDARY_OPERATIONAL_EVIDENCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 32bb0e73b0b996ffd79737e5769e5db7bc3a0648dbf4804b17807edc0f2a4c41
docs/Offline_Dependency_Closure_Qualification_v1.md | STOP_BOUNDARY_OPERATIONAL_EVIDENCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 db9d384c2efca61bafcc506c1bd7a124c44d746ca7ba3b059a4295de34adf9ca
docs/Windows_Isolated_Checkout_Boundary_Review_v1.json | STOP_BOUNDARY_OPERATIONAL_EVIDENCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 64b8098cf1fe0abb6f4512be90c415b792c11d11e66f7665d2d63e8481183c76
docs/Windows_Isolated_Checkout_Boundary_Review_v1.md | STOP_BOUNDARY_OPERATIONAL_EVIDENCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 21ffd6844fd30afa791c698f508fd321e127fa7a7e6ba7c9751f8f3694644683
docs/Zero_Network_Offline_Materialization_v1.json | QUALIFIED_OPERATIONAL_EVIDENCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 9422ab12d06e57f24eda2767cbbec2d942700320e3bd51dcee9a8b66db40c5af
docs/Zero_Network_Offline_Materialization_v1.md | QUALIFIED_OPERATIONAL_EVIDENCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 d82aa845b436e44d5793858609dce21c3ba88f22e23beccc899167730da77aa6
docs/Final_Pre_CP13_Preservation_Reconciliation_v1.md | OPERATIONAL_GOVERNANCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 a2086ddb25373f17a25a76c5c2387e596cf72359aca9610c128cdeff80753745
docs/Final_Pre_CP13_Preservation_Reconciliation_v1.json | OPERATIONAL_GOVERNANCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 392b59ef9894ba52d400ef1998492c1b997ebfe4487dd365248781831911a632
docs/Evidence_Checkpoint_Execution_Plan_Amendment_v1.md | OPERATIONAL_GOVERNANCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 {{AMENDMENT_MD_SHA256}}
docs/Evidence_Checkpoint_Execution_Plan_Amendment_v1.json | OPERATIONAL_GOVERNANCE | OPERATIONAL ONLY; NO SCIENTIFIC/RUNTIME AUTHORITY | SHA256 {{AMENDMENT_JSON_SHA256}}
```

## Original CP13 preserved

Exact original membership remains only:

- `docs/Evidence_Stack_Preservation_Audit_v1.md`
- `docs/Evidence_Stack_Preservation_Audit_v1.json`

Purpose/commit subject: **Preserve evidence-stack audit and authority navigation**.

Annotated tag: `checkpoint-evidence-stack-preservation-audit-v1`.

Classification: **OPERATIONAL_AUDIT**. Authority: **NAVIGATION_METADATA_NOT_SCIENTIFIC_AUTHORITY**. No new normative contract; NOT A RUNTIME RELEASE.

The JSON contains the exact unchanged original CP13 commit message and tag annotation copied from v2. Use those exact strings at execution. Only the parent/preflight and context rules above change. The original tag is absent at authoring and must remain absent until separately authorized CP13 execution.

Audit v1 remains historical **PRE-EXECUTION** preservation/navigation metadata. It does not independently audit CP12A or prove that later operational documents existed when audit v1 was created. CP12A supplies the missing execution-era governance/context. Together they allow final navigation without rewriting or retrospectively upgrading the old audit. CP13 remains FINAL.

## Exact human approval for CP13 audit JSON

Artifact: `docs/Evidence_Stack_Preservation_Audit_v1.json`.

Bytes: **6,600,432**. Lines: **194,220**.

SHA-256: `d79c83af3dc49b389cd6e4d5fccb824cc5b68becf444e16460cb3a91917e1365`.

This digest was retrieved from the reconciliation ledger and verified against existing bytes.

Human decision: **APPROVE_FOR_GIT_PRESERVATION_IN_CP13**.

Recorded disposition: **APPROVED_FOR_GIT_PRESERVATION_IN_CP13; HUMAN_REVIEW_SATISFIED**.

Exact existing artifact only. Approval is preservation-only: no scientific, normative-scientific or runtime authority; no updated post-execution audit; no approval of regenerated/modified successors or any other artifact. This authoring authorization does not execute CP13.

## CP12A large-artifact dispositions

None of the 16 pre-existing proposed CP12A files appears in v2's explicit-human-review ledger. All are below 1,000,000 bytes. The established review distinguished over-1-MB explicit-review candidates from smaller long ledgers; line count alone is not an automatic human gate.

Proposed disposition for the CP01, future-baseline and adversarial JSON long ledgers: **COMMIT_AS_PROPOSED**, subject to approval of this amendment. Their detailed sizes/lines/hashes are above. This is a proposed ledger disposition, not a grant of explicit large-artifact approval. No approval from an earlier checkpoint is borrowed.

Final detached measurements must also verify both new amendment files are below 1,000,000 bytes. If any final member triggers an existing explicit-review gate or crosses that size boundary, STOP and request the specific human decision before execution. Otherwise: **NO_UNSATISFIED_CP12A_LARGE_ARTIFACT_GATE_IDENTIFIED**. All checkpoint execution still requires approval.

## Verification plan: minimum sufficient static checks

No focused science suites, dependency suites, qualification replay or full regression is required for CP12A. These are immutable governance documents; storing embedded procedure source does not activate or modify it. No package manager, dependency materialization, Node test runner or environmental input acquisition is required. Do not execute embedded code or obsolete commands.

Use these exact requirements for later separately authorized execution:

1. Fresh branch/HEAD/annotated predecessor chain, zero real staged/unstaged tracked changes; no tag collision; exact state-specific untracked set. STOP any mismatch; never repair automatically.

2. Validate all 177 pre-existing protected hashes plus both amendment final hashes from approved detached receipt. Preserve node_modules, manifests, lockfiles and Git config; no normalization.

3. Validate exact checkpoint membership and classifications. Parse only member JSON with native ConvertFrom-Json or JSON.parse; never execute embedded code/commands/verifiers.

4. Inspect Markdown links and explicit JSON repository references literally. Use Test-Path, Get-FileHash, git cat-file/git rev-parse for exact paths and object IDs; preserve extensions. No heuristic parser, path rewriting or network URL resolution.

5. CP12A live navigation dependencies are its 18 members plus already committed evidence. Exactly two original CP13 audit files are declared deferred forward navigation targets: hash-check retained worktree copies now, keep unstaged, require committed resolution at CP13. Not a runtime dependency.

6. Absolute historical TEMP paths, old receipt paths, obsolete extraction commands, fixture paths and registry URLs in frozen reports are historical evidence, not automatic current execution dependencies. Do not re-run or fetch them. Preserve labels and distinguish missing historical external logs from missing required repository targets.

7. Cross-check CP00-CP12 tag OIDs, exact original plan CP13 metadata, amendment parent rule, pair A/B/C/D/E relationships and per-file authority. Verify CP12 full receipt hash and successful complete accounting without rerunning science.

8. For separately authorized execution only: require effective repository core.autocrlf=false, no unexpected file attributes; use v2 exact-file add with per-command core.autocrlf=false/core.safecrlf=false. Never write config to repair a mismatch.

9. Export staged members via native checkout-index with core.autocrlf=false/core.symlinks=false to a new contained temporary directory. Require worktree SHA256 = staged-export SHA256 = approved ledger/detached self hashes, and raw hash-object --no-filters OID = staged OID.

10. Require additions only, exact staged scope, ordinary git diff --cached --check exit 0 and no findings; no allowlist applies to CP12A or CP13.

11. Immediately before commit repeat HEAD/scope/byte/hash/authority/whitespace guards and state-specific exclusions. Disable hooks and signing per v2, write exact rendered message/tag body to UTF-8 no-BOM LF temporary files; no amend or extra files.

12. After commit verify exact parent, changed additions, blob OIDs/hashes and exact commit message. Create exact annotated unsigned tag without force; verify object type, peeled commit and exact body. Recheck protected bytes/diffs/untracked set.

13. Keep execution receipts outside repository so no extra untracked plan/receipt is created. Record actual commit/tag OIDs, rendered metadata hashes, approved input hashes, scope, whitespace/raw output and final exclusions. Clean only newly created contained temporary directories. STOP after each separately authorized checkpoint.

Use PowerShell native JSON parsing and literal Test-Path/Get-FileHash checks, plus Git object inspection. Do not create a heuristic reference parser, infer extensions, follow network links or execute a JavaScript artifact to inspect it. CP00 V3 implementation and suite stay unexecuted.

At CP12A, links from frozen governance documents to the two original audit files are explicitly declared **deferred forward navigation**. Verify the pending files' exact worktree hashes; do not stage them early. They are informational until final CP13, not runtime dependencies. At CP13, require committed resolution of those two paths. All other live required repository paths must resolve in the appropriate cumulative tree. Missing required paths STOP; historical external paths remain labeled provenance and do not authorize reconstruction or acquisition.

JSON path fields describing previous TEMP receipts, npm URLs, obsolete attempts or retained fixture locations are historical records, not an instruction to access them. Existing receipt hashes and operational dependency relationships are checked as recorded. No new references or authority are inferred from filenames.

## CP13 verification and CP12 regression carry-forward

Preserve original CP13 intent: exact membership/hash/blob/JSON/literal-link/whitespace/authority checks only. No new full regression for two audit documents if the recorded CP12 full run passed and no executable/test/dependency/runtime bytes changed through docs-only CP12A.

Verify the recorded CP12 receipt identity and complete successful accounting in the JSON. CP12 completed 84/84 intended scripts, with 2,078 node:test cases and 50 separately counted cases, zero failed/skipped tests and zero operational network attempts. This amendment does not rerun or requalify that evidence.

At CP13 additionally verify CP12A direct parent/tag/receipt, all 18 CP12A byte/classification proofs, the unchanged original audit pair and the supplied execution-era context. If the prior receipt cannot be validated or runtime/test/dependency bytes have changed, STOP for a reviewed verification decision; do not infer PASS or automatically start science tests.

Static checks need no scientific isolated test environment. Native staged-blob export uses the qualified checkout-index mechanics. If separately approved future scope truly requires executable verification, use only the existing qualified Windows and zero-network supplements, with exact fixture/integrity/zero-attempt guards. Do not use Windows tar, new npm flags or new extraction/reference helpers.

## Whitespace and byte preservation

CP12A and CP13 both require ordinary `git diff --cached --check` **exit 0, no findings**. No allowlist or exception exists. Authoring verifies proposed states using only private temporary indexes and a private object store with read-only Git alternates; native checkout-index export proves exact blob bytes. Raw outputs, statuses and final authoring measurements are in the detached receipt.

After approval, use v2 exact-file staging with `core.autocrlf=false` and `core.safecrlf=false`, no attributes/clean-filter conversion, exact staged export hashes, hooks/signing disabled and exact rendered metadata. A Git setting mismatch is STOP, not permission to repair configuration. Neither authoring simulation nor this prose stages the real index.

## Expected untracked state and exclusions

- After this amendment authoring: **22** ordinary untracked files (starting 20 plus the amendment pair).
- Before CP12A: exactly those 22.
- After CP12A / before CP13: exactly the two original audit files plus `supabase/.gitignore` and `supabase/config.toml` (**4**).
- After CP13: only `supabase/.gitignore` and `supabase/config.toml` (**2**).

Those two Supabase files are the only intentionally excluded ordinary untracked files. Their protected hashes remain unchanged. No service state is inspected. Ignored local caches, dependency trees and retained fixture data are not claimed to disappear. Execution receipts remain outside the repository; do not create another untracked-plan cycle.

## Preservation and stop rule

All 177 existing protected artifacts, CP00-CP12 evidence blobs/tags, original plan/audit bytes and existing worktree file bytes must remain unchanged during authoring. The real index and tracked/staged diffs remain unchanged/empty. Final detached receipt records exact postchecks and the two output hashes.

Any real mismatch stops execution without repair. Approval of this plan is not a command to execute both checkpoints. STOP after separately authorized CP12A; CP13 requires its own authorization and stays final.

No production/science/runtime modification, provider/database/Auth/Supabase access, environmental acquisition, real staging, commit, tag, push or deployment. **CP12A NOT executed. CP13 NOT started.** Leave this amendment pair uncommitted for human approval.
