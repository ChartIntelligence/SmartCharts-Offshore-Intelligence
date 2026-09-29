# Evidence Checkpoint Plan Adversarial Review v1

**EVIDENCE_CHECKPOINT_PLAN_REQUIRES_REVISION**. The 14-step file partition is correct, but the plan is not safe to execute exactly as proposed. Required changes concern byte-preserving Git operations, self-contained authority annotations, repeatable offline setup and tag metadata. No science, authority or existing artifact was changed.

Reviewed exact inputs: [audit Markdown](Evidence_Stack_Preservation_Audit_v1.md) and [audit JSON](Evidence_Stack_Preservation_Audit_v1.json). Their SHA-256 identities and the complete original 14-group plan are retained in [this review’s JSON](Evidence_Checkpoint_Plan_Adversarial_Review_v1.json). Branch/HEAD remain `codex/pelora-remote-setup` / `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`.

## Required revisions — do not apply in this task

### R1 — CHECKPOINT BYTE PRESERVATION

Current core.autocrlf=true changes protected CRLF content under Git clean filtering. Mixed line endings mean either blanket LF or CRLF conversion changes hashes.

Required: Approve an explicit Git clean/checkout byte-preservation recipe, then compare proposed blob bytes and recreated checkout bytes to recorded SHA-256. Disable unintended normalization for these exact mixed-byte artifacts; do not rewrite existing files or choose a blanket LF/CRLF normalization.

### R2 — SELF-CONTAINED AUTHORITY ANNOTATIONS

Thirteen CP00–CP12 tag annotations promise exact classification/limitations in CP13, which does not exist at those intermediate checkpoints.

Required: Make each proposed commit/tag annotation self-contained. CP00 must explicitly say QUARANTINED, NONAUTHORITATIVE, NOT FOR RUNTIME USE and exclude its test. CP01/CP02/CP06 must name the nine failed artifacts and available withdrawal reports. Other groups must state their limited status and residual gates. CP13 remains last; do not move the final audit earlier to hide the forward dependency.

### R3 — REPEATABLE OFFLINE VERIFICATION

Ten tests require pre-created scratch output directories. The trusted network preload and full-regression retained source.nc are ignored assets absent from HEAD+groups.

Required: Adopt a precise setup/test manifest, byte-verified external preload, unconditional output-directory preparation, explicit V3 exclusion and retained-fixture availability checks. Do not claim a full clean-checkout PASS when source.nc or another required retained input is unavailable. Distinguish focused runnable closure from full-regression portability.

### R4 — TAG CONVENTION AND FINAL ANNOTATION

All proposed names are unique and collision-free but use evidence-stack-* rather than the established checkpoint-* namespace; CP13 has no explicit annotation body.

Required: Use the established checkpoint naming convention or obtain an explicit evidence-namespace decision; provide an explicit navigation-only CP13 annotation. Preserve/record wording is suitable; do not change it to qualify/establish.

The file sequence itself need not be redesigned on the evidence found here. The revised plan must be reviewed again before staging. Large-file recommendations below are explicit storage review items, not a new scientific blocker or an instruction to delete anything.

## Exact groups and membership

| Group | As-proposed group | Files | Review |
|---|---|---:|---|
| CP00 | quarantine | 3 | Membership correct; metadata/setup revisions required |
| CP01 | withdrawn-snapshot | 9 | Membership correct; metadata/setup revisions required |
| CP02 | snapshot-harness-and-withdrawal | 17 | Membership correct; metadata/setup revisions required |
| CP03 | provider-domain-diagnostics | 24 | Membership correct; metadata/setup revisions required |
| CP04 | qualified-astronomy-boundary | 5 | Membership correct; metadata/setup revisions required |
| CP05 | paused-physics-review-history | 29 | Membership correct; metadata/setup revisions required |
| CP06 | normalization-and-current-stop-chain | 23 | Membership correct; metadata/setup revisions required |
| CP07 | qualified-current-locality | 3 | Membership correct; metadata/setup revisions required |
| CP08 | temporal-arithmetic-boundary-evidence | 8 | Membership correct; metadata/setup revisions required |
| CP09 | historical-authority-stop-chain | 12 | Membership correct; metadata/setup revisions required |
| CP10 | qualified-availability-reference | 4 | Membership correct; metadata/setup revisions required |
| CP11 | product-authority-partial-evidence | 16 | Membership correct; metadata/setup revisions required |
| CP12 | current-open-review | 4 | Membership correct; metadata/setup revisions required |
| CP13 | final-audit | 2 | Membership correct; metadata/setup revisions required |

CP00–CP12 contain all **157 classified artifacts exactly once**. CP13 contains the **two audit files**, giving 159 planned files. `supabase/.gitignore` and `supabase/config.toml` are excluded from all groups. There are **zero omissions, duplicates or unintended files**. Both Supabase files are still protected in the 161-file before/after manifest. Exact membership is copied unchanged into `exactPlanAsReviewed`; no membership change has been applied or silently proposed.

## Authority attacks

All proposed commit messages use “preserve”; none improperly says “establish” or “qualify.” “Qualified astronomy boundary” names a bounded existing result; it must not imply astronomical accuracy or full provider qualification. Normative contracts are correctly isolated in **CP07** (current-vector locality) and **CP10** (availability reference). Their earlier evidence is available, and neither group includes a failed-qualification artifact. Earlier hash-guard dependencies on failed/quarantined files do not confer authority on those files.

STOP evidence is useful boundary evidence. CP06 and CP09’s STOP wording correctly avoids suggesting that a failed candidate was approved. Superseded artifacts remain historically useful: all **49** audit supersession targets exist, and the final CP13 mapping is understandable. Some targets are later than the original report by design; that chronological refinement is distinct from an executable forward dependency.

The annotation attack is different: **every CP00–CP12 annotation says exact classifications/limitations are recorded in the audit that does not appear until CP13**. This creates **13 metadata forward references**. Generic “no runtime authority promotion” is not a substitute for explicit failed/superseded scientific-authority labels. Inline the relevant scope and same-or-earlier withdrawal references in each tag/commit context; retain CP13 last.

| Failed artifact | Group | Available withdrawal context |
|---|---|---|
| [docs/Candidate_Semantic_Projection_v3_Proposed_Delta.json](Candidate_Semantic_Projection_v3_Proposed_Delta.json) | CP01 | [docs/Cache_Isolated_Snapshot_Producer_Qualification_v1.md](Cache_Isolated_Snapshot_Producer_Qualification_v1.md) |
| [docs/Candidate_Snapshot_Authority_Freeze_v1.json](Candidate_Snapshot_Authority_Freeze_v1.json) | CP01 | [docs/Cache_Isolated_Snapshot_Producer_Qualification_v1.md](Cache_Isolated_Snapshot_Producer_Qualification_v1.md) |
| [docs/Candidate_Snapshot_Branch_Optionality_Review_v1.json](Candidate_Snapshot_Branch_Optionality_Review_v1.json) | CP02 | [docs/Snapshot_Branch_Optionality_Adversarial_Stop_v1.json](Snapshot_Branch_Optionality_Adversarial_Stop_v1.json) |
| [docs/Candidate_Snapshot_Producer_Branches_v1.json](Candidate_Snapshot_Producer_Branches_v1.json) | CP01 | [docs/Cache_Isolated_Snapshot_Producer_Qualification_v1.md](Cache_Isolated_Snapshot_Producer_Qualification_v1.md) |
| [docs/Candidate_Snapshot_Producer_Scenarios_v1.json](Candidate_Snapshot_Producer_Scenarios_v1.json) | CP01 | [docs/Cache_Isolated_Snapshot_Producer_Qualification_v1.md](Cache_Isolated_Snapshot_Producer_Qualification_v1.md) |
| [docs/Candidate_Snapshot_Producer_Surface_v2.json](Candidate_Snapshot_Producer_Surface_v2.json) | CP01 | [docs/Cache_Isolated_Snapshot_Producer_Qualification_v1.md](Cache_Isolated_Snapshot_Producer_Qualification_v1.md) |
| [docs/Candidate_Snapshot_Producer_Surface_v4.json](Candidate_Snapshot_Producer_Surface_v4.json) | CP02 | [docs/Snapshot_Branch_Optionality_Adversarial_Stop_v1.json](Snapshot_Branch_Optionality_Adversarial_Stop_v1.json) |
| [docs/Source_Normalization_Amendment_Review_v1.json](Source_Normalization_Amendment_Review_v1.json) | CP06 | [docs/Source_Normalization_Amendment_Adversarial_Stop_v1.json](Source_Normalization_Amendment_Adversarial_Stop_v1.json) |
| [docs/Source_Normalization_Amendment_Review_v1.md](Source_Normalization_Amendment_Review_v1.md) | CP06 | [docs/Source_Normalization_Amendment_Adversarial_Stop_v1.json](Source_Normalization_Amendment_Adversarial_Stop_v1.json) |

All nine failed artifacts have same-checkpoint withdrawal/falsification context. That grouping is sound, but commit/tag context should identify these exact artifacts before CP13 exists. Historical `QUALIFIED`, `PASS` or `READY_TO_RESUME` text must remain unchanged and explicitly interpreted under the final withdrawal. No classification or authority was revised in this review.

### V3 quarantine

- [backend/candidateSemanticProjectionV3.mjs](../backend/candidateSemanticProjectionV3.mjs): `cc610ad547fac883c003219f143035101679a1f5adb6ccc0f10e14dd74adab0e` — matches protected hash.
- [backend/tests/candidateSemanticProjectionV3.test.js](../backend/tests/candidateSemanticProjectionV3.test.js): `98f097f673976161946d7d311661477e345bca0add4a2957b9d1527199fe16ab` — matches protected hash.
- [docs/Candidate_Semantic_Shapes_v3.json](Candidate_Semantic_Shapes_v3.json): `0987dfbd9eca48e10e283757381c1a87b67caceca961e3ca20ee79c4dcb4673c` — matches protected hash.

No V3 code/test was executed. CP00’s message/tag mention quarantine and its test plan is hash-only, but its annotation should expressly state **QUARANTINED / NONAUTHORITATIVE / NOT FOR RUNTIME USE**, identify the three paths and prohibit generic test discovery from executing the draft. The committed HEAD withdrawal report supplies additional historical context; it does not make the draft qualified.

## Twelve large artifacts

The 157 original evidence files total **61,688,018 bytes**; the twelve flagged files total **55,764,680 bytes**. Existing packed Git storage is approximately 59,927 KiB. No projected compression/delta ratio is asserted. No repository rule prohibiting these text files was found. Preserve original bytes; no compression, deletion or regeneration was performed.

| Artifact | Bytes / lines | Reproducibility role | Storage recommendation |
|---|---|---|---|
| [docs/Candidate_Snapshot_Branch_Optionality_Review_v1.json](Candidate_Snapshot_Branch_Optionality_Review_v1.json) | 1202660 / 25526 | YES_FOR_DIRECT_READ_OR_HASH_GUARDS | EXPLICIT_HUMAN_REVIEW_RECOMMENDED |
| [docs/Candidate_Snapshot_Producer_Branches_v2.json](Candidate_Snapshot_Producer_Branches_v2.json) | 1538714 / 41356 | YES_FOR_DIRECT_READ_OR_HASH_GUARDS | EXPLICIT_HUMAN_REVIEW_RECOMMENDED |
| [docs/Candidate_Snapshot_Producer_Scenarios_v2.json](Candidate_Snapshot_Producer_Scenarios_v2.json) | 1694866 / 31696 | YES_FOR_DIRECT_READ_OR_HASH_GUARDS | EXPLICIT_HUMAN_REVIEW_RECOMMENDED |
| [docs/Candidate_Snapshot_Producer_Surface_v2.json](Candidate_Snapshot_Producer_Surface_v2.json) | 12529383 / 350354 | YES_FOR_DIRECT_READ_OR_HASH_GUARDS | EXPLICIT_HUMAN_REVIEW_RECOMMENDED |
| [docs/Candidate_Snapshot_Producer_Surface_v3.json](Candidate_Snapshot_Producer_Surface_v3.json) | 16894855 / 563052 | YES_FOR_DIRECT_READ_OR_HASH_GUARDS | EXPLICIT_HUMAN_REVIEW_RECOMMENDED |
| [docs/Candidate_Snapshot_Producer_Surface_v4.json](Candidate_Snapshot_Producer_Surface_v4.json) | 9857821 / 1 | YES_FOR_DIRECT_READ_OR_HASH_GUARDS | EXPLICIT_HUMAN_REVIEW_RECOMMENDED |
| [docs/Consumer_Aware_History_Selection_v1.json](Consumer_Aware_History_Selection_v1.json) | 1459462 / 27007 | REQUIRED_FOR_PRESERVING_FULL_REPORT_EVIDENCE; no direct test import inferred | EXPLICIT_HUMAN_REVIEW_RECOMMENDED |
| [docs/Cross_Route_Finiteness_Atomicity_Resumed_v1.json](Cross_Route_Finiteness_Atomicity_Resumed_v1.json) | 566429 / 17192 | REQUIRED_FOR_PRESERVING_FULL_REPORT_EVIDENCE; no direct test import inferred | COMMIT_AS_PROPOSED |
| [docs/Default_Ocean_Provider_Return_Shapes_v1.json](Default_Ocean_Provider_Return_Shapes_v1.json) | 6050566 / 18785 | REQUIRED_FOR_PRESERVING_FULL_REPORT_EVIDENCE; no direct test import inferred | EXPLICIT_HUMAN_REVIEW_RECOMMENDED |
| [docs/Source_Normalization_Amendment_Review_v1.json](Source_Normalization_Amendment_Review_v1.json) | 539682 / 15034 | REQUIRED_FOR_PRESERVING_FULL_REPORT_EVIDENCE; no direct test import inferred | COMMIT_AS_PROPOSED |
| [docs/Source_Normalization_Boundary_v1.json](Source_Normalization_Boundary_v1.json) | 595527 / 17814 | REQUIRED_FOR_PRESERVING_FULL_REPORT_EVIDENCE; no direct test import inferred | COMMIT_AS_PROPOSED |
| [docs/Transitive_Producer_Boundary_Discovery_v1.json](Transitive_Producer_Boundary_Discovery_v1.json) | 2834715 / 60653 | YES_FOR_DIRECT_READ_OR_HASH_GUARDS | EXPLICIT_HUMAN_REVIEW_RECOMMENDED |

Nine files over 1 MB warrant explicit human review before committing. Three smaller, long diagnostic ledgers may be retained as proposed, subject to the overall plan revisions. This does not require a storage redesign: no artifact is classified DO_NOT_COMMIT_WITHOUT_STORAGE_DECISION. Machine-generated inventories and machine-readable ledgers contain curated diagnostic assertions; existing recipes do not prove byte-identical historical regeneration. Direct test/hash dependencies and report dependents are listed per artifact in JSON.

## Clean-checkout and ordering simulation

An exact HEAD Git archive was expanded into ignored temporary storage. The original files were then byte-copied into that copy in CP00–CP13 order. At each boundary, JS/MJS import closure was parsed transitively without executing modules, and local data references/Markdown links were checked. No Git worktree registration, index mutation, commit or tag was created. This is a content/dependency simulation, not a scientific test run.

| Boundary | Cumulative planned files | Missing imports/data | Broken Markdown links |
|---|---:|---:|---:|
| CP00 | 3 | 0 | 0 |
| CP01 | 12 | 0 | 0 |
| CP02 | 29 | 0 | 0 |
| CP03 | 53 | 0 | 0 |
| CP04 | 58 | 0 | 0 |
| CP05 | 87 | 0 | 0 |
| CP06 | 110 | 0 | 0 |
| CP07 | 113 | 0 | 0 |
| CP08 | 121 | 0 | 0 |
| CP09 | 133 | 0 | 0 |
| CP10 | 137 | 0 | 0 |
| CP11 | 153 | 0 | 0 |
| CP12 | 157 | 0 | 0 |
| CP13 | 159 | 0 | 0 |

**Zero file/import/Markdown forward dependencies** were found. Each adjacent swap would introduce documentary/hash/import ordering problems, or place the final audit before referenced evidence. Not every ordering constraint is an executable import: the JSON identifies the crossed edge kinds. The sequence is logically sound; the **13 tag-annotation forward references** remain a separate blocker. Four absent future v2 freeze/delta names remain intentional negative existence assertions, not files to add.

### Byte-preservation counterexample

`core.autocrlf=true` is active. Twenty-seven planned files contain CRLF and the set includes mixed line endings. Uniform LF conversion would change **27** hashes; uniform CRLF conversion would change **152**. Current tracked server source is LF in index and worktree. No `.gitattributes` rule was found establishing a protected byte representation.

For `docs/Candidate_Snapshot_Harness_v2_Preservation.json`, read-only `git hash-object --no-filters` yields `b419b414767290b9b6e05142e589d022b38b4910`; applying Git’s clean filter with `--path` yields `6e4bebf7b8c4082bbf93e7c236b797d2b1d5c999`. Neither command used `-w`. This proves that a default staging path can change protected bytes. It does not prove every checkout will fail.

The plan must specify and test a byte-preserving Git clean/checkout configuration, including comparing proposed blob bytes and recreated worktree bytes to the existing SHA-256 manifest. A blanket line-ending conversion is not acceptable. This review does not add attributes, alter Git config or stage files.

## Scratch prerequisites and network blocking

| Test | Output directory | Requirement with generation switches unset |
|---|---|---|
| [backend/tests/assessmentAstronomy.test.js](../backend/tests/assessmentAstronomy.test.js) | `.local/ocean-quarantine/task12b6s` | Optional only under `PELORA_WRITE_ASTRONOMY`; keep unset |
| [backend/tests/chlorophyllTemporalDerivedFiniteness.test.js](../backend/tests/chlorophyllTemporalDerivedFiniteness.test.js) | `.local/ocean-quarantine/chlorophyll-temporal` | REQUIRED: unconditional diagnostic write; no automatic mkdir |
| [backend/tests/consumerAwareHistoricalSelectionPolicy.test.js](../backend/tests/consumerAwareHistoricalSelectionPolicy.test.js) | `.local/ocean-quarantine/selection-policy` | REQUIRED: unconditional diagnostic write; no automatic mkdir |
| [backend/tests/consumerAwareHistorySelection.test.js](../backend/tests/consumerAwareHistorySelection.test.js) | `.local/ocean-quarantine/consumer-history` | REQUIRED: unconditional diagnostic write; no automatic mkdir |
| [backend/tests/convergenceContract.test.js](../backend/tests/convergenceContract.test.js) | `.local/ocean-quarantine/task12b6v` | Optional only under `PELORA_WRITE_CONVERGENCE`; keep unset |
| [backend/tests/convergenceDecision.test.js](../backend/tests/convergenceDecision.test.js) | `.local/ocean-quarantine/task12b6w` | Optional only under `PELORA_WRITE_CONVERGENCE_DECISION`; keep unset |
| [backend/tests/crossRouteFinitenessAtomicity.test.js](../backend/tests/crossRouteFinitenessAtomicity.test.js) | `.local/ocean-quarantine/task12b7d` | REQUIRED: unconditional diagnostic write; no automatic mkdir |
| [backend/tests/crossRouteFinitenessAtomicityResumed.test.js](../backend/tests/crossRouteFinitenessAtomicityResumed.test.js) | `.local/ocean-quarantine/task12b7dr` | REQUIRED: unconditional diagnostic write; no automatic mkdir |
| [backend/tests/currentVectorDerivedFiniteness.test.js](../backend/tests/currentVectorDerivedFiniteness.test.js) | `.local/ocean-quarantine/task12b7e` | REQUIRED: unconditional diagnostic write; no automatic mkdir |
| [backend/tests/currentVectorFailureContract.test.js](../backend/tests/currentVectorFailureContract.test.js) | `.local/ocean-quarantine/task12b7f` | REQUIRED: unconditional diagnostic write; no automatic mkdir |
| [backend/tests/currentVectorFailureLocalityContract.test.js](../backend/tests/currentVectorFailureLocalityContract.test.js) | `.local/ocean-quarantine/task12b7f-locality` | REQUIRED: unconditional diagnostic write; no automatic mkdir |
| [backend/tests/defaultProviderTransitive.test.js](../backend/tests/defaultProviderTransitive.test.js) | `.local/ocean-quarantine/task12b6q` | Optional only under `PELORA_WRITE_DEFAULT_REVIEW`; keep unset |
| [backend/tests/historyAssessmentCutoff.test.js](../backend/tests/historyAssessmentCutoff.test.js) | `.local/ocean-quarantine/history-cutoff` | REQUIRED: unconditional diagnostic write; no automatic mkdir |
| [backend/tests/oceanPhysicsBoundary.test.js](../backend/tests/oceanPhysicsBoundary.test.js) | `.local/ocean-quarantine/task12b6u` | Optional only under `PELORA_WRITE_OCEAN_PHYSICS`; keep unset |
| [backend/tests/oceanProviderBoundary.test.js](../backend/tests/oceanProviderBoundary.test.js) | `.local/ocean-quarantine/task12b6p` | Optional only under `PELORA_WRITE_PROVIDER_REVIEW`; keep unset |
| [backend/tests/revisedSemanticModel.test.js](../backend/tests/revisedSemanticModel.test.js) | `.local/ocean-quarantine/task12b6t` | Optional only under `PELORA_WRITE_REVISED_MODEL`; keep unset |
| [backend/tests/sourceNormalizationBoundary.test.js](../backend/tests/sourceNormalizationBoundary.test.js) | `.local/ocean-quarantine/task12b7a` | Optional only under `PELORA_WRITE_NORMALIZATION`; keep unset |
| [backend/tests/sstPostConversionFiniteness.test.js](../backend/tests/sstPostConversionFiniteness.test.js) | `.local/ocean-quarantine/task12b7c` | REQUIRED: unconditional diagnostic write; no automatic mkdir |
| [backend/tests/transitiveProducerBoundary.test.js](../backend/tests/transitiveProducerBoundary.test.js) | `.local/ocean-quarantine/task12b6o` | Optional only under `PELORA_WRITE_TRANSITIVE_STOP`; keep unset |

All nineteen paths are diagnostic outputs, not required historical input files. Ten are unconditional; nine are disabled generation paths. None of the reviewed tests creates its output parent directory. Mechanical writes to the fresh temporary copy failed with ENOENT before directory preparation, as expected. These were setup probes only, with no scientific calculation or fixture acquisition.

The current preload is `.local/ocean-quarantine/sst/noaa-geo-polar/task11d-20260922T120000Z-gulf/block-network.mjs`, SHA-256 `a7c4d834d772ce1ba06d853cc0dc9675ee80bcfb3848dd3de1b7ecf4d737d7ca`. Its JS is portable Node ESM; the historical invocation path is worktree-specific, and the harness runtime is environment-sensitive. Node v24.18.0 is the reviewed runtime. The preload mechanically denied **nine** fetch/TCP/TLS/HTTP(S) entry paths before transport. It is not an OS firewall and does not claim UDP/raw-DNS/subprocess coverage. Keep external network restrictions and forbid child-process transport bypasses.

### Proposed repeatable test invocation

The following procedure is **not executed or added to the repository**. Save/use it only in approved temporary tooling after plan revision. `ReviewJson` may point to an external preserved copy of this review JSON; it supplies the exact byte-encoded existing preload and test manifest. Run from a disposable checkout/copy with the correct reviewed bytes. Do not use `npm test` or blanket `node --test` discovery, which are not the prescribed suite/exclusion manifest.

```powershell
param(
  [Parameter(Mandatory=$true)][string]$CheckoutRoot,
  [Parameter(Mandatory=$true)][string]$ReviewJson,
  [Parameter(Mandatory=$true)][ValidatePattern('^CP(0[0-9]|1[0-3])$')][string]$GroupId,
  [switch]$FullRegression
)
$ErrorActionPreference = 'Stop'
$review = Get-Content -LiteralPath $ReviewJson -Raw | ConvertFrom-Json
$checkout = (Resolve-Path -LiteralPath $CheckoutRoot).Path
if ((node --version) -ne 'v24.18.0') { throw 'Reviewed Node runtime differs; review before execution' }
if ($GroupId -eq 'CP00') { throw 'CP00 is hash-only; never execute the V3 draft suite' }
$setupDirectory = Join-Path ([IO.Path]::GetTempPath()) ('pelora-evidence-verify-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $setupDirectory | Out-Null
$preload = Join-Path $setupDirectory 'block-network.mjs'
[IO.File]::WriteAllBytes($preload, [Convert]::FromBase64String($review.networkBlocking.portableBytesBase64))
if ((Get-FileHash -LiteralPath $preload -Algorithm SHA256).Hash.ToLowerInvariant() -ne $review.networkBlocking.sha256) { throw 'Preload hash mismatch' }
foreach ($flag in $review.networkBlocking.generationFlagsToUnset) {
  Remove-Item -LiteralPath ('Env:' + $flag) -ErrorAction SilentlyContinue
}
$env:PELORA_TEST_OCEAN_CONDITIONS = '1'
foreach ($entry in $review.scratch | Where-Object kind -eq 'UNCONDITIONAL_TEST_OUTPUT') {
  New-Item -ItemType Directory -Force -Path (Join-Path $checkout $entry.directory) | Out-Null
}
$plan = $review.testExecutionPlan | Where-Object group -eq $GroupId
$tests = @($plan.focused) + @($plan.dependencyAndCritical)
if ($FullRegression) {
  $retained = $review.networkBlocking.fullRegressionRetainedInput
  $retainedPath = Join-Path $checkout $retained.path
  if (-not (Test-Path -LiteralPath $retainedPath)) { throw 'Required retained offline source.nc is absent; do not acquire it' }
  if ((Get-FileHash -LiteralPath $retainedPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $retained.sha256) { throw 'Retained fixture hash mismatch' }
  $tests = @(Get-ChildItem -LiteralPath (Join-Path $checkout 'backend/tests'),(Join-Path $checkout 'shared') -Recurse -File |
    Where-Object { $_.Name -like '*.test.js' -and $_.Name -ne 'candidateSemanticProjectionV3.test.js' } |
    ForEach-Object { [IO.Path]::GetRelativePath($checkout,$_.FullName) })
}
Push-Location -LiteralPath $checkout
try {
  foreach ($testFile in $tests | Where-Object { $_ } | Sort-Object -Unique) {
    if ($testFile -match 'candidateSemanticProjectionV3') { throw 'Quarantined test selected' }
    if (-not (Test-Path -LiteralPath $testFile)) { throw ('Missing planned test: ' + $testFile) }
    & node --import $preload $testFile
    if ($LASTEXITCODE -ne 0) { throw ('Test failed: ' + $testFile) }
  }
} finally { Pop-Location }
# Recheck all evidence SHA-256 values and Git diffs after execution.
# Keep logs/preload in temporary storage; do not stage them or silently delete evidence.
```

The underlying invocation is `node --import <absolute-verified-preload-path> <one-explicit-test-file>`, with `PELORA_TEST_OCEAN_CONDITIONS=1`. Process-per-file execution avoids shared mock/cache state. New logs belong outside the protected evidence stack. Do not enable generation/freeze flags.

Full regression additionally requires retained offline fixture `.local/ocean-quarantine/sst/noaa-geo-polar/task11d-20260922T120000Z-gulf/source.nc` (853144 bytes), SHA-256 `26fe69f0e376322fd2e81ecb9375e5737ede4134cbd9711608ee9c2e2253a843`. If absent, fail the verification preflight; do not fetch environmental data or call the full run a PASS. This retained HEAD test dependency is distinct from empty scratch output directories.

## Minimum test plan and full milestones

These are future pre-checkpoint tests, not new science or tests executed in this review. File membership/hash/JSON/link/diff checks apply at every checkpoint.

| Group | Focused tests | Dependency/critical tests |
|---|---|---|
| CP00 | HASH ONLY; V3 excluded | None beyond shared mechanical checks |
| CP01 | `backend/tests/cacheIsolatedSnapshotProducer.test.js` | `backend/tests/candidateSnapshotProducerSurface.test.js` |
| CP02 | `backend/tests/snapshotBranchOptionality.test.js`, `backend/tests/snapshotBranchOptionalityAdversarial.test.js`, `backend/tests/snapshotProducerQualificationV2.test.js` | `backend/tests/cacheIsolatedSnapshotProducer.test.js` |
| CP03 | `backend/tests/defaultProviderSemanticReview.test.js`, `backend/tests/defaultProviderTransitive.test.js`, `backend/tests/oceanProviderBoundary.test.js`, `backend/tests/transitiveProducerBoundary.test.js` | `backend/tests/snapshotBranchOptionalityAdversarial.test.js` |
| CP04 | `backend/tests/assessmentAstronomy.test.js` | `backend/tests/scientificAssessment.test.js` |
| CP05 | `backend/tests/convergenceContract.test.js`, `backend/tests/convergenceDecision.test.js`, `backend/tests/oceanPhysicsBoundary.test.js`, `backend/tests/revisedSemanticModel.test.js` | `backend/tests/assessmentAstronomy.test.js` |
| CP06 | `backend/tests/crossRouteFinitenessAtomicity.test.js`, `backend/tests/currentVectorDerivedFiniteness.test.js`, `backend/tests/currentVectorFailureContract.test.js`, `backend/tests/sourceNormalizationAmendmentAdversarial.test.js`, `backend/tests/sourceNormalizationBoundary.test.js`, `backend/tests/sstPostConversionFiniteness.test.js` | `backend/tests/currentEvidenceCapture.test.js`, `backend/tests/exactScientificEvidence.test.js`, `backend/tests/exactMarineCapture.test.js` |
| CP07 | `backend/tests/currentVectorFailureLocalityContract.test.js` | `backend/tests/currentVectorDerivedFiniteness.test.js`, `backend/tests/currentVectorFailureContract.test.js`, `backend/tests/currentEvidenceCapture.test.js` |
| CP08 | `backend/tests/chlorophyllTemporalDerivedFiniteness.test.js`, `backend/tests/crossRouteFinitenessAtomicityResumed.test.js` | `backend/tests/currentVectorFailureLocalityContract.test.js`, `backend/tests/temporalEvidencePrimitives.test.js` |
| CP09 | `backend/tests/activeHistoricalTemporalProvenance.test.js`, `backend/tests/consumerAwareHistorySelection.test.js`, `backend/tests/historyAssessmentCutoff.test.js` | `backend/tests/chlorophyllTemporalDerivedFiniteness.test.js`, `backend/tests/temporalHistorySelection.test.js` |
| CP10 | `backend/tests/historicalAvailabilityReference.test.js` | `backend/tests/temporalEvidencePrimitives.test.js`, `backend/tests/exactScientificEvidence.test.js`, `backend/tests/exactMarineCapture.test.js` |
| CP11 | `backend/tests/activeProductTemporalSupport.test.js`, `backend/tests/consumerAwareHistoricalSelectionPolicy.test.js`, `backend/tests/remainingTemporalAuthority.test.js`, `backend/tests/sstChlorophyllTemporalSupport.test.js` | `backend/tests/historicalAvailabilityReference.test.js` |
| CP12 | `backend/tests/sstProvenanceGapFilledBinding.test.js` | `backend/tests/remainingTemporalAuthority.test.js` |
| CP13 | Audit document checks only | None beyond shared mechanical checks |

Full backend/shared runs are recommended at **CP10 (79 scripts)** and **CP12 immediately before CP13 (84 scripts)**, excluding quarantined V3. CP07 needs focused and exact-capture critical checks; it adds a normative contract, not a new production capture/science module. The CP12 run satisfies the final pre-audit milestone if nothing changes. CP13 then needs only mechanical document/inventory checks. No 80+ suite is run fourteen times. These are phase-specific counts at this HEAD, not permanent future counts.

## Tag and commit review

| Group | Exact proposed tag | Collision | Result |
|---|---|---|---|
| CP00 | `evidence-stack-v1-00-quarantine` | No | Unique; align namespace/annotation before execution |
| CP01 | `evidence-stack-v1-01-withdrawn-snapshot` | No | Unique; align namespace/annotation before execution |
| CP02 | `evidence-stack-v1-02-snapshot-harness-and-withdrawal` | No | Unique; align namespace/annotation before execution |
| CP03 | `evidence-stack-v1-03-provider-domain-diagnostics` | No | Unique; align namespace/annotation before execution |
| CP04 | `evidence-stack-v1-04-qualified-astronomy-boundary` | No | Unique; align namespace/annotation before execution |
| CP05 | `evidence-stack-v1-05-paused-physics-review-history` | No | Unique; align namespace/annotation before execution |
| CP06 | `evidence-stack-v1-06-normalization-and-current-stop-chain` | No | Unique; align namespace/annotation before execution |
| CP07 | `evidence-stack-v1-07-qualified-current-locality` | No | Unique; align namespace/annotation before execution |
| CP08 | `evidence-stack-v1-08-temporal-arithmetic-boundary-evidence` | No | Unique; align namespace/annotation before execution |
| CP09 | `evidence-stack-v1-09-historical-authority-stop-chain` | No | Unique; align namespace/annotation before execution |
| CP10 | `evidence-stack-v1-10-qualified-availability-reference` | No | Unique; align namespace/annotation before execution |
| CP11 | `evidence-stack-v1-11-product-authority-partial-evidence` | No | Unique; align namespace/annotation before execution |
| CP12 | `evidence-stack-v1-12-current-open-review` | No | Unique; align namespace/annotation before execution |
| CP13 | `evidence-stack-preservation-audit-v1` | No | Unique; align namespace/annotation before execution |

The repository’s dominant existing convention is `checkpoint-*`. Proposed `evidence-stack-*` names do not follow it. Prefixing the proposed names with `checkpoint-` is one possible revision, not an applied change; alternatively explicitly approve a separate evidence namespace. CP13 also needs an explicit annotated-tag body. None of these names is claimed reserved, and no tag was created.

Exact original commit messages are retained in JSON. Their preservation verbs are accurate. Revise annotation/context as required by R2, without changing artifact contents or claiming newly established scientific authority. For qualified normative CP07/CP10, state normative-only scope and explicitly disclaim runtime compliance/rollout.

## Final state and next action

**CP13 should remain LAST.** At that point all 157 described evidence artifacts are present. The final state can explain chronology, qualified/STOP/withdrawn/quarantined distinctions and current blockers. Reproducing focused tests still requires the explicit setup; full regressions need retained offline inputs, and a strict Git byte round trip has not yet been demonstrated.

Current science remains **SST_SOURCE_EQUIVALENCE_AND_GAP_FILLED_PROVIDER_BINDING_REQUIRED**. SST source/model-equivalence authority, DIRECT bounds, GAP_FILLED deployment/version/target support, NOAA SME clarification, remaining normalization gates, consumer history selection and temporal-derived finiteness remain unresolved at their existing boundaries. Task 12B.6C, Task 9E-D and convergence/Ocean Physics remain paused. The audit’s exact board is copied into JSON, without new authority.

Next action: revise the **plan metadata and execution procedure only** to resolve R1–R4, obtain explicit review of flagged large files, then repeat adversarial plan review. Do not execute or revise the current plan in this task. No deletion, compression, schema change, source normalization, temporal arithmetic or scientific qualification is authorized by this report.

All **161 original evidence/audit files**, including the two excluded Supabase files, are protected by before/after hashes. Only this Markdown and its JSON companion are new Git-visible files. Temporary copies/probes are ignored housekeeping outputs. Tracked/staged diffs remain empty; expected branch/HEAD remain unchanged. No scientific regression scripts or quarantined code executed; no provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment occurred. Leave this review UNCOMMITTED.


Final mechanical verification: 161/161 protected hashes match; original plan is unchanged; 14 groups cover 157 original artifacts plus two audit files exactly once. Zero missing imports or broken links in the sequential copy; 55 new review links resolve. JSON, whitespace, proposed setup syntax and git diff --check pass. File-level forward dependencies: 0; annotation-context forward references: 13. Only two new review files, 163 untracked total; tracked/staged diffs empty. No scientific regression or V3 execution occurred.
