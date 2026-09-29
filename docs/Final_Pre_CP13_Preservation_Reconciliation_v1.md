# Final pre-CP13 preservation reconciliation v1

**FINAL_PRESERVATION_PLAN_AMENDMENT_REQUIRED**. Governance recommendation only. No checkpoint authorization or execution.

The smallest coherent sequence is one operational/governance preservation checkpoint, followed by original CP13 last. An explicit versioned amendment/supplement is required: execution-plan v2 requires CP13 to follow CP12 directly and expressly leaves four governance files untracked. Preserve v2 unchanged; do not silently override it. This review creates no revised execution plan and grants no artifact approval.

Starting/final HEAD: `3a7f3fc4f6c75020c8c23ec74879f3b5d44d565a`; branch `codex/pelora-remote-setup`. CP00-CP12 chain and annotated tags verified. Initial ordinary untracked count: 18; after this review pair: 20. Real index has no staged changes; tracked and staged diffs empty.

## Original CP13 and exact partition

Purpose/commit subject: **Preserve evidence-stack audit and authority navigation**.

Tag: `checkpoint-evidence-stack-preservation-audit-v1`.

Classification: two `OPERATIONAL_AUDIT` files. Authority: `NAVIGATION_METADATA_NOT_SCIENTIFIC_AUTHORITY`. No new normative contract; NOT A RUNTIME RELEASE. The companion JSON copies the exact original commit message, tag annotation and checkpoint definition directly from v2.

Original membership is exactly:

- `docs/Evidence_Stack_Preservation_Audit_v1.md` — SHA-256 `5c8eae93c0007e4233f72f41f6242cdb9a71a73e6e5ecf88cc74c032bd1c151c`. Human review guide to evidence inventory and authority navigation; OPERATIONAL_AUDIT, not scientific authority.
- `docs/Evidence_Stack_Preservation_Audit_v1.json` — SHA-256 `d79c83af3dc49b389cd6e4d5fccb824cc5b68becf444e16460cb3a91917e1365`. Detailed inventory, hash, classification and dependency ledger; OPERATIONAL_AUDIT, not scientific authority.

The requested binary partition is insufficient: **2 original CP13 + 4 plan-era exclusions + 10 post-plan files = 16**. No file is unclassified. Four files existed at plan freeze but are expressly in v2 `membership.operationalFilesNotAddedToCP13`:

- `docs/Evidence_Checkpoint_Execution_Plan_v2.md`
- `docs/Evidence_Checkpoint_Execution_Plan_v2.json`
- `docs/Evidence_Checkpoint_Plan_Adversarial_Review_v1.md`
- `docs/Evidence_Checkpoint_Plan_Adversarial_Review_v1.json`

Recommend preserving the plan pair as QUALIFIED_OPERATIONAL_EVIDENCE and the adversarial pair as SUPERSEDED_OPERATIONAL_EVIDENCE. The latter's actual verdict is EVIDENCE_CHECKPOINT_PLAN_REQUIRES_REVISION; v2 resolves execution-mechanics objections. Neither becomes scientific authority. Including them requires express revision of original exclusion rules.

The exact ten post-plan files are listed individually below. All ten have preservation/execution authority only; none is a scientific or normative contract.

## Five operational reviews

### A. CP01 whitespace exception

- `docs/CP01_Protected_Whitespace_Exception_Review_v1.md` — QUALIFIED_OPERATIONAL_EVIDENCE.
- `docs/CP01_Protected_Whitespace_Exception_Review_v1.json` — QUALIFIED_OPERATIONAL_EVIDENCE.

Created to resolve four protected CP01 CRLF findings without rewriting bytes or weakening Git settings. Verdict: **CP01_PROTECTED_WHITESPACE_EXCEPTION_QUALIFIED**. Current authority is the exact CP01-only path/line/category/hash/raw-output exception. It is not superseded for CP01. Its future-checkpoint inventory was planning only and was refined by B.

Value: **ESSENTIAL_FOR_REPRODUCIBILITY**. Exact preservation retains raw finding bytes, the acceptance algorithm and adversarial rejection evidence. Counts or checkpoint tags cannot reconstruct that qualification. Omission loses those precise acceptance predicates. This is a direct CP01 execution dependency and historical verifier derivation for B.

Disposition: **PRESERVE_BEFORE_CP13**, subject to amendment and review. It is current within its narrow operational scope, not merely historical narrative.

### B. CP02-CP08 whitespace baselines

- `docs/Future_Protected_Whitespace_Baselines_CP02_CP08_v1.md` — QUALIFIED_OPERATIONAL_EVIDENCE.
- `docs/Future_Protected_Whitespace_Baselines_CP02_CP08_v1.json` — QUALIFIED_OPERATIONAL_EVIDENCE.

Created to qualify separate protected baselines before CP02-CP08 execution. Verdict: **CP02_CP08_PROTECTED_WHITESPACE_BASELINES_QUALIFIED**. Current scope: seven exact baselines, 24 affected files, 18,389 findings. No CP09-CP13 exception. Membership counts and affected-file counts are independent.

Value: **ESSENTIAL_FOR_REPRODUCIBILITY**. Exact preservation retains checkpoint/path/line/category/hash/raw-output predicates, compressed findings, verifier and mutation evidence. Omission would make exact historical acceptance unreproducible from counts alone, especially CP06's 17,713 findings. Direct execution dependency for CP02-CP08. It refines A's future inventory without replacing CP01 scope.

Disposition: **PRESERVE_BEFORE_CP13**, subject to amendment and review. Current bounded operational authority; no blanket future waiver.

### C. Windows isolated-checkout boundary

- `docs/Windows_Isolated_Checkout_Boundary_Review_v1.md` — STOP_BOUNDARY_OPERATIONAL_EVIDENCE.
- `docs/Windows_Isolated_Checkout_Boundary_Review_v1.json` — STOP_BOUNDARY_OPERATIONAL_EVIDENCE.

Created after Windows tar failed on five historical Git mode-120000 node_modules entries. Actual overall verdict: **CP07_ISOLATED_CHECKOUT_ENVIRONMENT_UNRESOLVED**. It successfully demonstrated the extraction subset: temporary index, native checkout-index, core.autocrlf=false and core.symlinks=false; 1,897 committed files plus three CP07 files were byte-identical under explicit Windows symlink-target-text semantics. Missing polyfill then blocked full regression.

Value: **HIGH_AUDIT_VALUE**. E repeats the selected extraction mechanism, but omission loses the exact tar failure, five-entry modes/object/tracking history and alternative-method comparisons. Preserve exact diagnostic evidence even though the environment STOP is later resolved. The extraction result remains current and is used with E by CP07-CP12; the overall report does not become a complete-environment PASS.

Disposition: **PRESERVE_BEFORE_CP13**, subject to amendment and review. Preserve both the surviving extraction result and the overall historical STOP.

### D. Offline dependency closure

- `docs/Offline_Dependency_Closure_Qualification_v1.md` — STOP_BOUNDARY_OPERATIONAL_EVIDENCE.
- `docs/Offline_Dependency_Closure_Qualification_v1.json` — STOP_BOUNDARY_OPERATIONAL_EVIDENCE.

Created to distinguish undeclared dependency from isolated materialization gap. Actual verdict: **CP07_OFFLINE_DEPENDENCY_CLOSURE_UNRESOLVED**. It established declared/locked polyfill 0.5.1, jsbi 4.3.2, 28 cache-integrity matches and three additional retained-fixture identities. Its npm procedure attempted registry metadata access despite offline mode. Blocked access did not satisfy zero attempts.

Value: **HIGH_AUDIT_VALUE**. Preserve exact declaration/materialization diagnosis, first forbidden request, interruption boundary and fixture provenance. E repeats final identities but explicitly relies on this derivation. The earlier full rehearsal remains incomplete: 68/73 scripts and 1,636 completed node:test reports; no retroactive PASS.

Disposition: **PRESERVE_BEFORE_CP13**, subject to amendment and review. Historical-only as an executable procedure: the old npm command is superseded and must not be used as qualified authority. Declaration/cache/fixture findings remain supporting derivation for CP07-CP12 through E.

### E. Zero-network materialization

- `docs/Zero_Network_Offline_Materialization_v1.md` — QUALIFIED_OPERATIONAL_EVIDENCE.
- `docs/Zero_Network_Offline_Materialization_v1.json` — QUALIFIED_OPERATIONAL_EVIDENCE.

Created to eliminate the demonstrated npm update-notifier request. Verdict: **CP07_ZERO_NETWORK_ISOLATED_ENVIRONMENT_SUPPLEMENT_QUALIFIED**. Current authority is operational and version/input-bound: lockfile/SRI-authorized 28 packages; private config/cache; explicit notifier suppression; qualified lifecycle/audit/funding/bin handling; two absent packages/48-file overlay; eight fixtures; dual denial/attempt instrumentation; V3 exclusion.

Value: **ESSENTIAL_FOR_REPRODUCIBILITY**. Exact preservation retains npm controls, instrumented runner, package/overlay/fixture identities and complete rehearsal evidence. The qualification completed 73/73 scripts, 1,895 node:test cases plus 50 separately counted cases. It resolves C/D environment blockers without changing their earlier results. It is a direct operational execution dependency for CP07-CP12, including full milestones CP07/CP10/CP12.

Disposition: **PRESERVE_BEFORE_CP13**, subject to amendment and review. No automatic qualification for other tool versions, future checkpoints, science or runtime compliance. External offline assets remain necessary.

No pair is recommended for omission. Repetition in E does not preserve every earlier decision or failure boundary. One primary classification applies to each file; narrower surviving findings are described separately rather than silently relabeling STOP documents.

## CP00-CP12 dependency map

| Checkpoints | Direct operational dependency | Historical/superseded role |
|---|---|---|
| CP00 | None of A-E | Original plan/audit governance; V3 quarantined. |
| CP01 | A, CP01-only exception | B refines future inventory, not CP01 scope. |
| CP02-CP06 | B, exact checkpoint baselines | A verifier derivation; C-E not yet execution inputs. |
| CP07-CP08 | B + C extraction subset + E | D declaration/cache/extra-fixture derivation, not old command. |
| CP09-CP12 | C extraction subset + E | D historical derivation; ordinary whitespace clean, no B exception. |

CP02-CP06 successful receipts bind exact B hash `ab910a2c8e216a48c444268941b8a88267a8cf7d992e5e6f9c827585d9008e68`. CP07 binds C/E document hashes; CP07/08 precommit records confirm separate 2/2 and 3/3 whitespace counts. CP08/09 procedure-selection records specify unchanged qualified mechanisms with checkpoint selectors changed. CP10-CP12 validation binds 28 packages, 48 overlay files, eight fixtures and zero operational attempts. CP10/CP12 were full milestones; CP09/CP11 focused only.

Receipt paths/hashes, selected evidence and the verified full tag/commit chain are in JSON. CP01 exception scope and committed identity are established; a standalone successful CP01 receipt was not located, so its original runtime log is not claimed reverified. Operational dependency does not mean production code imports these reports. No tests were rerun in this review.

## Sequence and explicit amendment

**Option A subject to Option C** is recommended. Option B adds unnecessary checkpoints: self-contained metadata can preserve mixed current and STOP classes safely. Option D is disproved by original membership. A preservation-only supplement can leave v2 bytes unchanged, but it must expressly amend execution metadata. A purely mechanical supplement cannot change the parent or excluded-file rules silently.

Proposed pre-CP13 membership: all 14 existing non-CP13 governance/operational files in the ledger, plus these two reconciliation outputs: **16 proposed files**. If a separately authorized amendment file is later created, include its exact path/hash explicitly in the same group; it is not silently included now. Do not leave another unexplained governance file after the final audit.

Recommended sequence:

1. Human review of reconciliation and applicable artifact disposition.
2. Separately authorize a versioned preservation-only amendment/supplement, without editing protected v2.
3. Separately execute one explicitly enumerated operational/governance checkpoint.
4. Separately execute original CP13 last with amended parent/preflight and explicit historical audit context.

Required amendment deltas:

- Authorize the added checkpoint's exact membership, hashes, per-file classifications, metadata and verification.
- Change CP13 direct parent from verified CP12 to the verified new checkpoint, keeping CP12 as ancestor.
- Revise untracked/exclusion rules explicitly for the four plan-era exclusions, ten operational files, this review and any later amendment; keep Supabase excluded.
- Resolve the audit JSON size-review gap and record long-ledger dispositions.
- Preserve original CP13 two-file membership, protected bytes, purpose and tag; expressly attribute post-plan coverage to the supplement and final execution receipt.
- Approve exact hash/literal-reference/inventory verification for the docs-only addition. No scientific requalification or invented regression requirement.
- Bind final review/amendment hashes and account for every new governance artifact before execution.

Proposed commit subject: `Preserve checkpoint execution governance and operational qualification history`.

Proposed tag: `checkpoint-preservation-execution-operational-evidence-v1` (absent at review).

Proposed authority annotation, to be finalized with exact paths/hashes before execution:

```text
PRESERVATION ONLY. OPERATIONAL EXECUTION EVIDENCE AND GOVERNANCE.
NOT SCIENTIFIC AUTHORITY; NO NEW NORMATIVE CONTRACT; NOT A RUNTIME RELEASE.
CP01 exception and CP02-CP08 baselines retain only exact checkpoint/hash-bound scope.
Windows review remains STOP overall; only extraction findings survive.
Offline closure remains STOP; its old npm procedure is superseded, incomplete regression is not PASS.
Zero-network materialization retains only recorded operational qualification.
Execution-plan v2 is preserved unchanged; adversarial review is resolved plan-revision history.
Reconciliation recommendations require express approval of the exact versioned amendment.
List every included path, primary classification and approved SHA-256 in final metadata.
Audit pair excluded here; original CP13 remains last, with explicit historical audit context.
Supabase excluded; V3 quarantined; existing contract scopes unchanged; no evidence upgraded.
No science/runtime implementation, push or deployment.
```

The JSON contains the fuller proposed annotation. Neither annotation is execution-ready approval.

## Large-artifact review and whitespace

None of the 16 files appears in execution-plan v2 `largeArtifacts`. Absence is not explicit human approval. The adversarial review calls for explicit review of files over 1 MB and separately permits three smaller long ledgers; line count alone does not establish a mandatory human gate.

The **6,600,432-byte / 194,220-line audit JSON** needs an explicit exact-hash preservation/storage disposition before CP13 under the amended plan. This is a newly identified gap and recommendation based on the established size-review precedent, not a fabricated existing ledger entry. CP01, future-baseline and adversarial JSONs are long ledgers; record their dispositions in the amendment. No earlier checkpoint approval applies automatically; this review grants none.

Private temporary indexes and a private object store reproduced exact blobs for the 14 existing non-CP13 files and the two original CP13 files. Each group returned ordinary `git diff --cached --check` **exit 0, zero stdout bytes, zero stderr bytes, no findings**. Complete empty-output SHA-256: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. All 16 private exported blobs matched worktree/ledger hashes. No real index/object-store writes, normalization or exceptions. This was an authorized review simulation, not CP13 execution.

## CP13 integrity and reproduction limits

Original audit verdict: **EVIDENCE_STACK_READY_FOR_CHECKPOINT_PLANNING**, at baseline `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`. It is a frozen readiness inventory, not a newly performed completion audit. Alone it cannot truthfully cover subsequent checkpoint executions and operational qualifications.

Keep its two-file membership, protected hashes, original purpose and final position. An expressly approved prior supplement must supply the actual checkpoint sequence, operational classifications, receipt provenance and exclusions. That combined preservation state can truthfully navigate original evidence and later supplements. Audit v1 must never be described as newly updated. If CP13 content itself must report later events, separately approve a new audit version/membership/metadata revision; do not edit v1 automatically.

Original metadata says later operational reviews refine execution only, but that does not override its parent/untracked rules. V3 remains quarantined; both qualified contracts retain exact scopes; STOP/superseded/failed/current evidence retains classifications. No science or runtime authority is expanded.

Reports do not embed all retained environmental fixture bytes, verified npm cache or exact runtime binaries. Reproduction still needs separately maintained offline assets. TEMP receipt paths/hashes and selected results are recorded in JSON, not every underlying log. A Git checkout alone is not claimed to be a complete fresh-machine environment. No environmental reacquisition is authorized.

## Final desired state and preservation

After the separately approved full sequence, desired ordinary untracked files are only `supabase/.gitignore` and `supabase/config.toml`. Original CP13 includes neither. Both remain unchanged and excluded here; no service state inspected. Ignored fixtures/cache/node_modules are outside ordinary untracked counts.

All 175 protected files and 157 committed predecessor evidence files verified. CP00-CP12 annotated objects/targets and HEAD unchanged. Real index SHA-256: `d53e7ff98aff9a5dc2a6340e7c75f3670e880b066aa410a9de15d87c0dced432`; no staged changes. Tracked/staged diffs empty; Git configuration unchanged. Only the two requested reports are new repository files, left untracked.

No production/science change, tests, V3 execution, provider/database/Auth/Supabase access, environmental acquisition, real staging, commit, tag, push or deployment. **CP13 was NOT started. Stop for human review.**

## Exact 16-file byte ledger

Line counts count LF terminators plus any final unterminated line. All files have operational authority only. Classifications and size-review status also appear in JSON.

| Path | Bytes | Lines | SHA-256 | Partition |
|---|---:|---:|---|---|
| `docs/CP01_Protected_Whitespace_Exception_Review_v1.json` | 441205 | 19986 | `cf47206581d50ac19710f27eb41c8ee728fe3a54dcbb938aa18decb3bdc113e2` | POST_PLAN_OPERATIONAL |
| `docs/CP01_Protected_Whitespace_Exception_Review_v1.md` | 7525 | 74 | `c3bd2d59d4ba243bb69a394ecfd8c851ccdcd1127cd9024279d22d515cc1d54e` | POST_PLAN_OPERATIONAL |
| `docs/Evidence_Checkpoint_Execution_Plan_v2.json` | 485983 | 6144 | `85da306930d093ba7584d341e0834a380033821bdd142be8a44827322bd2df70` | PLAN_ERA_EXCLUDED_FROM_CP13 |
| `docs/Evidence_Checkpoint_Execution_Plan_v2.md` | 23016 | 244 | `ca793b02c20aac9d0c02abd38fadd1185dd9347d2f155645cf6c679ae7ee1dc9` | PLAN_ERA_EXCLUDED_FROM_CP13 |
| `docs/Evidence_Checkpoint_Plan_Adversarial_Review_v1.json` | 581378 | 13582 | `f6b87eed42ec291febd754cdc695c98e52253be467baa466251154da7713298e` | PLAN_ERA_EXCLUDED_FROM_CP13 |
| `docs/Evidence_Checkpoint_Plan_Adversarial_Review_v1.md` | 34206 | 279 | `ff3d32ace793868caca7aedaebd07f7ab9c9ea9a7597ea1ba58de9256d616574` | PLAN_ERA_EXCLUDED_FROM_CP13 |
| `docs/Evidence_Stack_Preservation_Audit_v1.json` | 6600432 | 194220 | `d79c83af3dc49b389cd6e4d5fccb824cc5b68becf444e16460cb3a91917e1365` | ORIGINAL_CP13 |
| `docs/Evidence_Stack_Preservation_Audit_v1.md` | 79786 | 731 | `5c8eae93c0007e4233f72f41f6242cdb9a71a73e6e5ecf88cc74c032bd1c151c` | ORIGINAL_CP13 |
| `docs/Future_Protected_Whitespace_Baselines_CP02_CP08_v1.json` | 783983 | 40618 | `ab910a2c8e216a48c444268941b8a88267a8cf7d992e5e6f9c827585d9008e68` | POST_PLAN_OPERATIONAL |
| `docs/Future_Protected_Whitespace_Baselines_CP02_CP08_v1.md` | 8704 | 99 | `b8c18c054f30eae23a7820cff3f13920c40865343532878d0e5df0f0ad8931ae` | POST_PLAN_OPERATIONAL |
| `docs/Offline_Dependency_Closure_Qualification_v1.json` | 65214 | 1255 | `32bb0e73b0b996ffd79737e5769e5db7bc3a0648dbf4804b17807edc0f2a4c41` | POST_PLAN_OPERATIONAL |
| `docs/Offline_Dependency_Closure_Qualification_v1.md` | 11930 | 114 | `db9d384c2efca61bafcc506c1bd7a124c44d746ca7ba3b059a4295de34adf9ca` | POST_PLAN_OPERATIONAL |
| `docs/Windows_Isolated_Checkout_Boundary_Review_v1.json` | 27347 | 537 | `64b8098cf1fe0abb6f4512be90c415b792c11d11e66f7665d2d63e8481183c76` | POST_PLAN_OPERATIONAL |
| `docs/Windows_Isolated_Checkout_Boundary_Review_v1.md` | 11901 | 115 | `21ffd6844fd30afa791c698f508fd321e127fa7a7e6ba7c9751f8f3694644683` | POST_PLAN_OPERATIONAL |
| `docs/Zero_Network_Offline_Materialization_v1.json` | 105751 | 2338 | `9422ab12d06e57f24eda2767cbbec2d942700320e3bd51dcee9a8b66db40c5af` | POST_PLAN_OPERATIONAL |
| `docs/Zero_Network_Offline_Materialization_v1.md` | 12848 | 127 | `d82aa845b436e44d5793858609dce21c3ba88f22e23beccc899167730da77aa6` | POST_PLAN_OPERATIONAL |
