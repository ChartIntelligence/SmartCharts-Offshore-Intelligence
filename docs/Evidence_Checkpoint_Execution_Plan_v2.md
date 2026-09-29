# Evidence Checkpoint Execution Plan v2

**EVIDENCE_CHECKPOINT_EXECUTION_PLAN_APPROVED**

Operational metadata only. No science is qualified, superseded or implemented. No real checkpoint was executed. CP00 requires a separate authorization.

The original CP00–CP13 membership and order are unchanged: 157 evidence artifacts plus two final audit files. The adversarial review and this plan remain outside CP13. Exact files, hashes, full commit messages, annotated tag bodies and per-checkpoint preflights are in the [execution ledger](Evidence_Checkpoint_Execution_Plan_v2.json).

## Byte preservation

System Git config supplies core.autocrlf=true; core.eol and core.safecrlf are unset. All159 paths have no applicable attributes. System LFS filters exist but do not apply. No real Git setting changed during this task. Git 2.55.0.windows.3, PowerShell 7.6.5, Node 24.18.0 were used.

132 LF-only, 7 CRLF-only, 20 mixed files. Current cleaning changes27 files; the JSON lists every path and original/clean/candidate/checkout SHA256. There is no intentional normalization.

Selected future procedure: repository-local core.autocrlf=false, plus per-command false during exact-path staging/export. No global/system config or attributes change. The repository-local setting also applies to linked worktrees and is explicitly part of future CP00 authorization. It must remain false for ordinary preservation checkouts. New clones need that local setting before their first checkout. An unrestricted checkout under true is not certified.

All159 candidate staged blobs matched protected bytes. In an isolated temporary repository, a temporary proof commit was created, all159 files replaced by sentinels, and ordinary git checkout restored all159 byte-identically with local autocrlf=false. Two attempted temporary clones failed at Git's sandboxed shell signal-pipe creation; clone execution is not the proof. No real index/object/ref/config was changed.

After staging, export exact staged paths to new scratch with checkout-index under false; compare SHA256 against ledger and worktree. After committing, verify each HEAD:path object ID equals its previously byte-verified staged ID, verify exact parent/path set, all protected hashes, clean index/worktree and annotated tag target/body. Any mismatch stops.

## Checkpoint metadata

Each commit and tag embeds its own classification, status, scope, exact file hashes and known superseder paths. Later references are informational: no CP13 lookup is necessary to learn that an artifact is withdrawn, superseded or quarantined. STOP means valid boundary evidence, not failed work or a qualified production contract. All nine failed artifacts are explicitly audit history only. The only normative pairs are CP07 current-vector locality and CP10 exact availability reference; neither implies runtime implementation.

| Group | Files | Final annotated tag | Commit subject |
|---|---:|---|---|
| CP00 | 3 | checkpoint-quarantined-candidate-semantic-projection-v3-draft-v1 | Preserve quarantined projection-v3 drafts; no runtime authority |
| CP01 | 9 | checkpoint-withdrawn-snapshot-qualification-evidence-v1 | Preserve withdrawn snapshot qualification evidence |
| CP02 | 17 | checkpoint-snapshot-harness-withdrawal-boundary-v1 | Document snapshot harness evidence and qualification withdrawal |
| CP03 | 24 | checkpoint-provider-domain-diagnostic-boundary-v1 | Preserve provider-domain diagnostic boundaries |
| CP04 | 5 | checkpoint-assessment-astronomy-boundary-v1 | Preserve qualified assessment-astronomy boundary evidence |
| CP05 | 29 | checkpoint-paused-ocean-physics-review-evidence-v1 | Preserve paused Ocean Physics review history without resuming science |
| CP06 | 23 | checkpoint-normalization-current-stop-boundary-v1 | Document normalization and current-vector STOP evidence |
| CP07 | 3 | checkpoint-current-vector-failure-locality-contract-v1 | Preserve qualified current-vector failure-locality contract |
| CP08 | 8 | checkpoint-temporal-arithmetic-stop-boundary-v1 | Preserve temporal-arithmetic STOP boundary evidence |
| CP09 | 12 | checkpoint-historical-authority-stop-boundary-v1 | Document historical temporal-authority STOP evidence |
| CP10 | 4 | checkpoint-exact-historical-availability-reference-contract-v1 | Preserve qualified exact historical availability-reference contract |
| CP11 | 16 | checkpoint-product-temporal-authority-partial-boundary-v1 | Preserve partial product temporal-authority evidence |
| CP12 | 4 | checkpoint-sst-source-equivalence-gap-filled-binding-boundary-v1 | Record current SST source-equivalence and gap-filled binding blockers |
| CP13 | 2 | checkpoint-evidence-stack-preservation-audit-v1 | Preserve evidence-stack audit and authority navigation |

All14 tags are unique and absent from existing tags. Full bodies—not merely subjects—are mandatory. CP00 states QUARANTINED DRAFT, NONAUTHORITATIVE, DO NOT EXECUTE PROJECTION V3, DO NOT USE FOR RUNTIME, and DO NOT TREAT PASSING DRAFT TESTS AS QUALIFICATION. Its three exact hashes are embedded in both annotations and the executable package's protected manifest.

## Scratch and offline setup

All ten scratch-dependent scripts passed in the cumulative HEAD-based copy with network denial. No V3 test executed. Parents must exist; tests generate evidence.json themselves and need no pre-existing file there. Outputs are diagnostic, not scientific inputs. Retain logs in isolated verification storage; do not delete or rewrite protected local evidence.

| Test | Required parent |
|---|---|
| backend/tests/chlorophyllTemporalDerivedFiniteness.test.js | .local/ocean-quarantine/chlorophyll-temporal |
| backend/tests/consumerAwareHistoricalSelectionPolicy.test.js | .local/ocean-quarantine/selection-policy |
| backend/tests/consumerAwareHistorySelection.test.js | .local/ocean-quarantine/consumer-history |
| backend/tests/crossRouteFinitenessAtomicity.test.js | .local/ocean-quarantine/task12b7d |
| backend/tests/crossRouteFinitenessAtomicityResumed.test.js | .local/ocean-quarantine/task12b7dr |
| backend/tests/currentVectorDerivedFiniteness.test.js | .local/ocean-quarantine/task12b7e |
| backend/tests/currentVectorFailureContract.test.js | .local/ocean-quarantine/task12b7f |
| backend/tests/currentVectorFailureLocalityContract.test.js | .local/ocean-quarantine/task12b7f-locality |
| backend/tests/historyAssessmentCutoff.test.js | .local/ocean-quarantine/history-cutoff |
| backend/tests/sstPostConversionFiniteness.test.js | .local/ocean-quarantine/task12b7c |

The preload is .local/ocean-quarantine/sst/noaa-geo-polar/task11d-20260922T120000Z-gulf/block-network.mjs, SHA256 a7c4d834d772ce1ba06d853cc0dc9675ee80bcfb3848dd3de1b7ecf4d737d7ca. Its exact base64 bytes are embedded in the JSON, allowing reconstruction outside a checkout. Windows --import must receive a file URL, not a C:\ path. Nine mocked network entry points were verified to throw before transport. This is not an OS firewall; maintain external network restrictions and do not bypass it through child processes/UDP/DNS.

Five retained full-regression inputs (paths, SHA256, consumers in JSON) are required in addition to HEAD and checkpoint fixtures. Missing inputs STOP verification; no download fallback. Copy existing verified files into the isolated checkout at the same relative paths, then rehash.

- .local/ocean-quarantine/sst/noaa-geo-polar/task11d-20260922T120000Z-gulf/source.nc — 853144 bytes; SHA256 26fe69f0e376322fd2e81ecb9375e5737ede4134cbd9711608ee9c2e2253a843
- .local/ocean-quarantine/sst/noaa-geo-polar/task11d-20260922T120000Z-gulf/acquisition.receipt.json — 2390 bytes; SHA256 b065c6885df60f7988133d754ed432d05a7e66b34c265f7dc92291a4088255ed
- .local/ocean-quarantine/sst/noaa-geo-polar/task11d-metadata/cmr.json — 13392 bytes; SHA256 d055d1b522818d305f6d92426e3345ab49a344834b10d1e71afa5a2c94f85e86
- .local/ocean-quarantine/sst/noaa-geo-polar/task11d-metadata/current.das — 8422 bytes; SHA256 628a3ffe7a8d36a38f5195db490e43fd62aab8196c5cc95f356c4f907335a26d
- .local/ocean-quarantine/sst/noaa-geo-polar/task11d-metadata/selected-time.json — 160 bytes; SHA256 557505e904193c8878823520a3277d7f1e37b23e34743f3648a455994e4bca0d

Thirty untracked supporting fixtures retain their original groups. Cumulative static import/link checks have zero missing imports, zero broken links and zero file-level forward dependencies. Full regressions run after CP07, CP10 and CP12; the unchanged CP12 run also covers pre-CP13. CP13 itself needs only document/hash checks. No full scientific regression was repeated in this planning task.

The following Windows procedure is plan text. Extract it from offlineProcedure in the JSON to temporary storage; it is not a new repository script.

~~~powershell
param(
  [Parameter(Mandatory=$true)][string]$CheckoutRoot,
  [Parameter(Mandatory=$true)][string]$PlanJson,
  [Parameter(Mandatory=$true)][ValidatePattern('^CP(0[0-9]|1[0-3])$')][string]$GroupId,
  [switch]$FullRegression
)
$ErrorActionPreference = 'Stop'
$plan = Get-Content -LiteralPath $PlanJson -Raw | ConvertFrom-Json
$checkout = (Resolve-Path -LiteralPath $CheckoutRoot).Path
if ((node --version) -ne 'v24.18.0') { throw 'Reviewed Node runtime differs; review before execution' }
if ($GroupId -eq 'CP00') { throw 'CP00 is hash-only; never execute the V3 draft suite' }
$setupDirectory = Join-Path ([IO.Path]::GetTempPath()) ('pelora-evidence-verify-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $setupDirectory | Out-Null
$preload = Join-Path $setupDirectory 'block-network.mjs'
[IO.File]::WriteAllBytes($preload, [Convert]::FromBase64String($plan.networkBlocking.portableBytesBase64))
if ((Get-FileHash -LiteralPath $preload -Algorithm SHA256).Hash.ToLowerInvariant() -ne $plan.networkBlocking.sha256) { throw 'Preload hash mismatch' }
foreach ($flag in $plan.networkBlocking.generationFlagsToUnset) {
  Remove-Item -LiteralPath ('Env:' + $flag) -ErrorAction SilentlyContinue
}
$env:PELORA_TEST_OCEAN_CONDITIONS = '1'
foreach ($entry in $plan.scratch | Where-Object kind -eq 'UNCONDITIONAL_TEST_OUTPUT') {
  New-Item -ItemType Directory -Force -Path (Join-Path $checkout $entry.directory) | Out-Null
}
$testPlan = $plan.testExecutionPlan | Where-Object group -eq $GroupId
$tests = @($testPlan.focused) + @($testPlan.dependencyAndCritical)
if ($FullRegression) {
  foreach ($retained in $plan.offlineRetainedInputs) {
    $retainedPath=Join-Path $checkout $retained.path
    if(-not(Test-Path -LiteralPath $retainedPath)){throw ('Missing retained offline input: '+$retained.path)}
    if((Get-FileHash -LiteralPath $retainedPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $retained.sha256){throw 'Retained input hash mismatch'}
  }
  $tests = @(Get-ChildItem -LiteralPath (Join-Path $checkout 'backend/tests'),(Join-Path $checkout 'shared') -Recurse -File |
    Where-Object { $_.Name -like '*.test.js' -and $_.Name -ne 'candidateSemanticProjectionV3.test.js' } |
    ForEach-Object { [IO.Path]::GetRelativePath($checkout,$_.FullName) })
}
Push-Location -LiteralPath $checkout
try {
  foreach ($testFile in $tests | Where-Object { $_ } | Sort-Object -Unique) {
    if ($testFile -match 'candidateSemanticProjectionV3') { throw 'Quarantined test selected' }
    if (-not (Test-Path -LiteralPath $testFile)) { throw ('Missing planned test: ' + $testFile) }
    & node --import ([Uri]::new($preload).AbsoluteUri) $testFile
    if ($LASTEXITCODE -ne 0) { throw ('Test failed: ' + $testFile) }
  }
} finally { Pop-Location }
# Recheck all protected SHA-256 values and Git diffs after execution. Prefer an isolated HEAD + cumulative groups copy; install no dependencies from network.
# Keep logs/preload in temporary storage; do not stage them or silently delete evidence.

~~~

## Large-artifact decisions

Nine items require explicit human review before their group; this is an execution precondition, not an implicit storage approval. Three are carried forward as COMMIT_AS_PROPOSED. No item was deleted, regenerated or rejected by size alone. Recipes do not prove byte-identical regeneration of historical failed evidence. Exact purpose/dependents/regenerability are in the JSON.

| Artifact | Group | Bytes | Lines | Disposition |
|---|---|---:|---:|---|
| docs/Candidate_Snapshot_Branch_Optionality_Review_v1.json | CP02 | 1202660 | 25526 | EXPLICIT_HUMAN_REVIEW_BEFORE_CHECKPOINT |
| docs/Candidate_Snapshot_Producer_Branches_v2.json | CP02 | 1538714 | 41356 | EXPLICIT_HUMAN_REVIEW_BEFORE_CHECKPOINT |
| docs/Candidate_Snapshot_Producer_Scenarios_v2.json | CP02 | 1694866 | 31696 | EXPLICIT_HUMAN_REVIEW_BEFORE_CHECKPOINT |
| docs/Candidate_Snapshot_Producer_Surface_v2.json | CP01 | 12529383 | 350354 | EXPLICIT_HUMAN_REVIEW_BEFORE_CHECKPOINT |
| docs/Candidate_Snapshot_Producer_Surface_v3.json | CP02 | 16894855 | 563052 | EXPLICIT_HUMAN_REVIEW_BEFORE_CHECKPOINT |
| docs/Candidate_Snapshot_Producer_Surface_v4.json | CP02 | 9857821 | 1 | EXPLICIT_HUMAN_REVIEW_BEFORE_CHECKPOINT |
| docs/Consumer_Aware_History_Selection_v1.json | CP09 | 1459462 | 27007 | EXPLICIT_HUMAN_REVIEW_BEFORE_CHECKPOINT |
| docs/Cross_Route_Finiteness_Atomicity_Resumed_v1.json | CP08 | 566429 | 17192 | COMMIT_AS_PROPOSED |
| docs/Default_Ocean_Provider_Return_Shapes_v1.json | CP03 | 6050566 | 18785 | EXPLICIT_HUMAN_REVIEW_BEFORE_CHECKPOINT |
| docs/Source_Normalization_Amendment_Review_v1.json | CP06 | 539682 | 15034 | COMMIT_AS_PROPOSED |
| docs/Source_Normalization_Boundary_v1.json | CP06 | 595527 | 17814 | COMMIT_AS_PROPOSED |
| docs/Transitive_Producer_Boundary_Discovery_v1.json | CP03 | 2834715 | 60653 | EXPLICIT_HUMAN_REVIEW_BEFORE_CHECKPOINT |

## CP00 only: future execution package

DO NOT RUN in this planning task. A later task must explicitly authorize CP00, including the repository-local checkout setting. All subsequent groups use their own exact files/messages/tags, and an exact parent OID from the previous verified execution receipt; no future SHA is invented. CP00 has no large-artifact approval prerequisite. Use configured Git author identity; absence is a STOP. Preserve this plan's hash in the execution receipt. The script stops after CP00 and does not authorize CP01.

~~~powershell
# PLAN ONLY. Run only in a later task explicitly authorizing CP00.
param([Parameter(Mandatory=$true)][string]$PlanPath)
$ErrorActionPreference='Stop'
$plan=Get-Content -LiteralPath $PlanPath -Raw|ConvertFrom-Json
$root=(Resolve-Path -LiteralPath $plan.repository.path).Path
Set-Location -LiteralPath $root
function G { $result=& git @args; if($LASTEXITCODE -ne 0){throw ('Git failed: '+($args -join ' '))}; return $result }
function SHA([string]$p){return (Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash.ToLowerInvariant()}
function SameSet($actual,$expected,$label){if(@(Compare-Object @($actual|Sort-Object) @($expected|Sort-Object)).Count){throw $label}}
if($plan.verdict -ne 'EVIDENCE_CHECKPOINT_EXECUTION_PLAN_APPROVED'){throw 'Unapproved plan'}
$g=$plan.checkpoints[0]
if($g.id -ne 'CP00'){throw 'Wrong checkpoint'}
if((G rev-parse HEAD) -ne $plan.repository.expectedHEAD){throw 'HEAD mismatch'}
if((G branch --show-current) -ne 'codex/pelora-remote-setup'){throw 'Branch mismatch'}
if(@(G diff --name-only).Count -or @(G diff --cached --name-only).Count){throw 'Tracked/index changes'}
SameSet @(G ls-files --others --exclude-standard) @($plan.preservation.before.path+$plan.filesCreated) 'Untracked scope mismatch'
foreach($f in $plan.preservation.before){if((SHA $f.path) -ne $f.sha256){throw ('Protected byte mismatch: '+$f.path)}}
if(@(G check-attr --all -- $g.files).Count){throw 'Unexpected attributes; do not improvise filtering'}
SameSet $g.files @('backend/candidateSemanticProjectionV3.mjs','backend/tests/candidateSemanticProjectionV3.test.js','docs/Candidate_Semantic_Shapes_v3.json') 'CP00 membership'
if(@(G tag --list $g.tagName).Count){throw 'Tag collision'}
# CP00 is hash-only. NEVER execute candidateSemanticProjectionV3.test.js.
# No real-index operation above this line. The following requires separate CP00 authorization.
# Mandatory repository-local checkout policy; affects this repository's linked worktrees.
# No global/system configuration is changed. This does not rewrite any file.
G config --local core.autocrlf false
if((G config --get core.autocrlf) -ne 'false'){throw 'Byte-preserving checkout setting not active'}
if(@(G diff --name-only).Count -or @(G diff --cached --name-only).Count){throw 'Checkout policy exposed tracked changes; STOP without repair'}
$scratch=Join-Path ([IO.Path]::GetTempPath()) ('pelora-cp00-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $scratch|Out-Null
$msg=Join-Path $scratch 'commit-message.txt'
$annotation=Join-Path $scratch 'tag-annotation.txt'
[IO.File]::WriteAllText($msg,$g.commitMessage+"`n",[Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText($annotation,$g.tagAnnotation+"`n",[Text.UTF8Encoding]::new($false))
G -c core.autocrlf=false -c core.safecrlf=false add -- $g.files
SameSet @(G diff --cached --name-only) $g.files 'Staged scope mismatch'
if(@(G diff --cached --name-only --diff-filter=A).Count -ne 3){throw 'Unexpected staged change type'}
$export=((Join-Path $scratch 'staged-bytes') -replace '\\','/')+'/'
G -c core.autocrlf=false checkout-index ('--prefix='+$export) -- $g.files
$objects=@{}
foreach($p in $g.files){
 $expected=($plan.preservation.before|Where-Object path -eq $p).sha256
 if((SHA $p) -ne $expected -or (SHA (Join-Path $export $p)) -ne $expected){throw ('Staged SHA256 mismatch '+$p)}
 $objects[$p]=G rev-parse (':'+$p)
 if((G hash-object --no-filters -- $p) -ne $objects[$p]){throw 'Raw blob identity mismatch'}
}
G diff --cached --check
$parent=G rev-parse HEAD
# Hooks/signing are disabled for this preservation operation; no hook may rewrite evidence.
$emptyHooks=Join-Path $scratch 'empty-hooks';New-Item -ItemType Directory $emptyHooks|Out-Null
G -c core.autocrlf=false -c commit.gpgsign=false -c ('core.hooksPath='+$emptyHooks) commit --file=$msg
$commit=G rev-parse HEAD
if((G rev-parse HEAD^) -ne $parent){throw 'Parent mismatch'}
SameSet @(G diff-tree --no-commit-id --name-only -r HEAD) $g.files 'Committed scope mismatch'
foreach($p in $g.files){if((G rev-parse ('HEAD:'+$p)) -ne $objects[$p]){throw 'Committed blob changed'}}
foreach($f in $plan.preservation.before){if((SHA $f.path) -ne $f.sha256){throw ('Post-commit protected mismatch '+$f.path)}}
if(@(G diff --name-only).Count -or @(G diff --cached --name-only).Count){throw 'Post-commit dirty state'}
# Annotated, unsigned checkpoint tag. Never force-replace an existing tag.
G -c tag.gpgsign=false tag --annotate $g.tagName --file=$annotation $commit
if((G cat-file -t ('refs/tags/'+$g.tagName)) -ne 'tag'){throw 'Not annotated'}
if((G rev-parse ('refs/tags/'+$g.tagName+'^{}')) -ne $commit){throw 'Wrong tag target'}
$tagObject=G rev-parse ('refs/tags/'+$g.tagName)
$tagBody=(G for-each-ref '--format=%(contents)' ('refs/tags/'+$g.tagName)) -join "`n"
if($tagBody.TrimEnd() -ne $g.tagAnnotation.TrimEnd()){throw 'Annotation mismatch'}
SameSet @(G ls-files --others --exclude-standard) @((@($plan.preservation.before.path)+@($plan.filesCreated))|Where-Object{$_ -notin $g.files}) 'Post-commit untracked scope'
@{checkpoint='CP00';parent=$parent;commit=$commit;tag=$g.tagName;tagObject=$tagObject;blobIds=$objects;protectedSHA256Verified=$true;planSHA256=(SHA $PlanPath);next='STOP; await separate CP01 authorization'}|ConvertTo-Json -Depth 8|Set-Content -LiteralPath (Join-Path $scratch 'execution-receipt.json')
G status --short
# STOP after CP00. Do not execute CP01, push, reset, normalize, delete, or repair automatically.

~~~

## CP13 complete annotation

~~~text
CHECKPOINT PURPOSE: CP13 — Preserve evidence-stack audit and authority navigation. Preservation only.
AUTHORITY STATUS: NAVIGATION_METADATA_NOT_SCIENTIFIC_AUTHORITY. No authority change by commit or tag.
CURRENT / SUPERSEDED / STOP / FAILED / QUARANTINED / QUALIFIED: per-file status below; historical PASS/QUALIFIED/READY_TO_RESUME wording does not override these preservation-time limitations.
NORMATIVE STATUS: No new normative contract. Evidence/fixtures/navigation only.
RUNTIME STATUS: NOT A RUNTIME RELEASE; no production implementation, integration or deployment authorized.
DO-NOT-USE: STOP is VALID BOUNDARY EVIDENCE, NOT A QUALIFIED PRODUCTION CONTRACT. FAILED artifacts preserve withdrawn/falsified audit history and are NOT approved scientific authority. Superseded findings are historical, not the current gate.
SUPERSEDED-BY: none for this preservation audit; later operational plan reviews refine execution only, not science.
docs/Evidence_Stack_Preservation_Audit_v1.md | OPERATIONAL NAVIGATION METADATA | NOT SCIENTIFIC AUTHORITY | SHA256 5c8eae93c0007e4233f72f41f6242cdb9a71a73e6e5ecf88cc74c032bd1c151c
docs/Evidence_Stack_Preservation_Audit_v1.json | OPERATIONAL NAVIGATION METADATA | NOT SCIENTIFIC AUTHORITY | SHA256 d79c83af3dc49b389cd6e4d5fccb824cc5b68becf444e16460cb3a91917e1365
CURRENT SCIENCE GATE AT PRESERVATION TIME: SST_SOURCE_EQUIVALENCE_AND_GAP_FILLED_PROVIDER_BINDING_REQUIRED. This is navigation, not a new qualification.
PAUSED/OPEN: Task12B.6C, Task9E-D, convergence/Ocean Physics paused; NOAA SME pending. Numeric-string, provider-fill, legacy SST coordinate fallback remain open. No lookback/revision/gap policy is established.
NEXT EVIDENCE GROUP: none; audit is last. Later paths are informational supersession context only; the status and limitations above are self-contained. No CP13 document is required to interpret this annotation.
~~~

CP13 remains last and contains exactly the two original audit files. Its description is navigation, not changed scientific authority. Later operational review/plan documents are not silently added.

## Preservation and limits

All163 pre-existing untracked files are protected by the before/after manifest, including the excluded Supabase pair. Only these two v2 documents are new untracked outputs. Ignored temporary proof repositories, logs and scripts are not checkpoint members. Tracked and staged diffs remain empty; the real index SHA256 remains 3f655cff0fb3f9ac6616b008e618b78bd13bbca10ca0b32af61882886c0cb921. Temporary proof commits were confined to the isolated byte repository and are not Pelora checkpoints.

The current scientific gate remains SST_SOURCE_EQUIVALENCE_AND_GAP_FILLED_PROVIDER_BINDING_REQUIRED. Task12B.6C and Task9E-D remain paused; convergence/Ocean Physics remain paused, NOAA pending, and normalization gates unchanged. No provider/database/Auth/Supabase access or environmental acquisition occurred.

Final verification: 163/163 protected SHA256 values match; real-index SHA256, HEAD and branch match. There are 165 untracked files, exactly two more than the baseline. The exact diff is two new v2 documents, no modified existing files, no tracked diff and no staged diff. Both future PowerShell command texts parse; the final portable CP07 invocation also passed in the isolated copy. The CP00 package was not executed.
