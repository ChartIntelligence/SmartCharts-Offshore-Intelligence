# Windows isolated-checkout boundary review v1

**CP07_ISOLATED_CHECKOUT_ENVIRONMENT_UNRESOLVED**

Operational preservation review only. No science, contract, runtime or protected-content change. CP07 is not committed. CP08 was not started.

## Outcome

Native Git temporary-index extraction succeeds and preserves all **1,897 HEAD blobs**, including all five tracked symlink-target blobs, plus the **three exact CP07 files**. Every file was compared to its blob before testing and rehashed after testing. The private index retains original Git modes. This is the repository's existing Windows checkout semantics under `core.symlinks=false`, not POSIX symlink execution equivalence.

The overall environment remains unresolved: the four focused/dependency scripts pass **135 tests**, including the **11-test current-vector locality suite**. Full regression passes **846 tests in 27 scripts**, then `backend/tests/fishingLogAssociationReadiness.test.js` cannot start because **@js-temporal/polyfill is missing**. This is an environment dependency failure, not a scientific assertion failure. No full-regression PASS is claimed and no missing test was skipped to obtain a PASS.

## Exact extraction boundary

Starting/final HEAD: `02326627671eb290027cfef63e448109e6ad02e2`; branch: `codex/pelora-remote-setup`.

Reproduction: `tar -xf <fresh temporary>/head.tar -C <fresh temporary>/tar-reproduction`, exit **1**, using **bsdtar 3.5.2 / libarchive 3.5.2**. Git archive preserves the five mode-120000 entries as symlinks; tar tries to create native links. An independent Windows symbolic-link probe reports **Administrator privilege required for this operation**. Tar itself emits only “Can't create”; its underlying Win32 error code is unavailable, so privilege failure is corroborating evidence rather than an invented tar error code. Complete stderr and exact command paths are retained in the companion JSON.

| Tracked path | Git mode/type | Blob OID | Exact target text |
|---|---|---|---|
| `node_modules/.bin/gl-style-format` | `120000` blob | `19aa0ce5a981311f80c31bf8db3bf31f415d964c` | `../@maplibre/maplibre-gl-style-spec/dist/gl-style-format.mjs` |
| `node_modules/.bin/gl-style-migrate` | `120000` blob | `44b7db22f8552223e3c6c632beb6437786171417` | `../@maplibre/maplibre-gl-style-spec/dist/gl-style-migrate.mjs` |
| `node_modules/.bin/gl-style-validate` | `120000` blob | `4e451f290e5fbcad7b4f1c2964ed1e2b2b8b4733` | `../@maplibre/maplibre-gl-style-spec/dist/gl-style-validate.mjs` |
| `node_modules/.bin/pbf` | `120000` blob | `d43572fbc5786c403a3e7fc902b3fbe4c1fd3773` | `../pbf/bin/pbf` |
| `node_modules/@maplibre/vt-pbf/node_modules/.bin/pbf` | `120000` blob | `d43572fbc5786c403a3e7fc902b3fbe4c1fd3773` | `../pbf/bin/pbf` |

All five exist in the real worktree as ordinary files containing target text, with no reparse/symlink/junction representation. They are not Windows executable shims. All first appeared in commit `e2b792b859e26e4f815fefa3a6a72e4cd89ecbf6` (2026-07-13), before CP00. There are **1,429 tracked node_modules paths**. The existing `node_modules/` ignore rule does not untrack historical entries. No ignore rule, installation, mode or tracked status was changed.

No direct reference to the five CLI paths was found in backend/shared/package.json. Direct Node test invocation does not require their execution; all five were nevertheless retained. Their absence was never accepted as a complete-tree reconstruction.

## Original invariants and alternatives

The v2 plan requires a cumulative HEAD-plus-group copy, exact evidence bytes, no later untracked evidence, isolated scratch, five retained offline inputs, network denial, and V3 exclusion. It recommends isolated copies and already uses native checkout-index for byte proof; tar is an extraction implementation, not scientific authority. The failed attempt used archive to get an exact HEAD inventory without unrelated untracked files.

| Candidate | Assessment |
|---|---|
| git worktree add --detach | Native checkout supports symlinks=false and full tree; excludes untracked and supports CP07 overlay/offline tests, but registers a linked worktree in real Git metadata. Not selected or rehearsed; cleanup would require registered worktree removal. |
| local git clone --no-local --no-checkout then checkout | Can use identical native settings and overlay without real index changes or network remote. Extra object copy and hooks/config surface; prior plan recorded sandbox clone issues. Not selected/rehearsed; delete only fresh clone after containment check. |
| temporary-index read-tree plus checkout-index --all --prefix | SELECTED/REHEARSED. Full Git blob bytes, index modes retained, existing Windows symlink policy, no real-index/ref/config mutation; overlay exact three files; isolated scratch/offline setup. Remove only fresh output/temp index after verified containment. |
| archive with another extractor | Not selected/rehearsed. A native-symlink extractor would still depend on OS permissions; target-text emulation adds custom semantics needing proof. Must not drop symlinks. |
| direct cat-file reconstruction | Can preserve blobs and mode manifest, but requires custom path/mode/symlink handling; less direct than native checkout. Not selected/rehearsed. |
| git restore --worktree with alternate work-tree/index | Possible native alternative, but checkout-index gives explicit new-prefix output and simpler scope. Not selected/rehearsed. |

Only the selected method was empirically qualified for extraction. The other candidates are engineering evaluations, not unperformed byte-proof claims. Native checkout-index is preferred because it uses Git's Windows representation and avoids linked-worktree registration, repository configuration changes, new refs/objects, and clone overhead.

## Dependency boundary

No package installation occurred. The reconstructed tree includes every tracked dependency file. However, declared **@js-temporal/polyfill 0.5.1** is installed locally but ignored/untracked, as is its local **jsbi 4.3.2** dependency. The plan's five retained offline inputs cover environmental fixtures, not this package closure. This rehearsal was outside repository ancestors so it could not silently resolve packages from the real worktree. An isolated checkout placed below the real repository could mask this omission through Node ancestor resolution.

The next operational gate must explicitly define and hash-bind offline dependency provisioning and its closure, then repeat the required full rehearsal. No network install, unreviewed package copying, or external storage choice was made. The extraction-only change can be a narrow supplement; **the complete CP07 supplement is not qualified yet**, and a v3 decision is deferred until the dependency invariant is explicit.

## Rehearsal and preservation

- Used the plan's exact offlineProcedure and generation-flag clearing; prepared its scratch directories only inside the isolated copy.
- Copied exactly five pre-existing hash-verified retained inputs; no environmental acquisition.
- Network preload: `C:\Users\User\AppData\Local\Temp\pelora-windows-checkout-review-572207cfd96943e695d8529380629bd6\block-network.mjs`.
- Preload SHA-256: `a7c4d834d772ce1ba06d853cc0dc9675ee80bcfb3848dd3de1b7ecf4d737d7ca`.
- Nine transport probes threw before transport. The preload is not an OS firewall and does not claim arbitrary UDP/DNS/subprocess coverage; no bypass was used.
- Quarantined V3 suite excluded by filename and explicit guard. Other references to V3 are hash checks, not imports/execution. No CP08+ files/tests were overlaid or run.
- Focused suites: currentEvidenceCapture **96**, currentVectorDerivedFiniteness **20**, currentVectorFailureContract **8**, currentVectorFailureLocalityContract **11**.
- Full log SHA-256: `33ee1e40334b918e5353a1c17838211a60a3878a37651dcde782e38fdb68cc25`; incomplete run exit **1**. Exact discovered tests and counts are in JSON.
- Exact CP07 overlay hashes are in JSON and match the approved ledger.
- All **169 protected files** unchanged; all **110 committed protected predecessor files** match HEAD. CP00–CP06 annotated tags preserved.
- Exact three CP07 additions unstaged first. Final real index and tracked/staged diffs empty; HEAD unchanged.
- **61 untracked files** after creating these two reports; Supabase pair remains excluded from checkpoints.
- Fresh tar/native-checkout directories, archive and temporary index removed after containment and reparse-point checks. Temporary diagnostic receipts/logs remain outside Git; prior task scratch and repository evidence were not touched.

## Reproducible extraction procedure

This procedure records the successful extraction mechanics. It does **not** authorize CP07 or claim full verification can currently pass.

```powershell
# Extraction-only procedure rehearsed successfully; full environment NOT yet qualified.
# Run from the real repository. Fresh $scratch must be outside any ancestor node_modules.
$ErrorActionPreference='Stop'
$head='02326627671eb290027cfef63e448109e6ad02e2'
$plan=Get-Content docs/Evidence_Checkpoint_Execution_Plan_v2.json -Raw|ConvertFrom-Json
$group=$plan.checkpoints|Where-Object id -eq CP07
# Assert exact branch/HEAD, empty real index/diff, protected ledger and predecessor tags first.
$scratch=Join-Path $env:TEMP ('pelora-checkout-'+[Guid]::NewGuid().ToString('N'))
$checkout=Join-Path $scratch 'checkout'
New-Item -ItemType Directory $checkout|Out-Null
$oldIndex=$env:GIT_INDEX_FILE
try {
  $env:GIT_INDEX_FILE=Join-Path $scratch 'private.index'
  git read-tree $head
  if($LASTEXITCODE){throw 'read-tree'}
  git -c core.autocrlf=false -c core.symlinks=false checkout-index --all ('--prefix='+$checkout.Replace('\','/')+'/')
  if($LASTEXITCODE){throw 'checkout-index'}
  # Compare private index mode/path/OID inventory with git ls-tree -rz $head.
  # Compare EVERY exported file byte-for-byte with git cat-file blob <OID>.
  # Refuse missing/extra committed paths, unexpected modes or any byte mismatch.
} finally {
  if($null -eq $oldIndex){Remove-Item Env:GIT_INDEX_FILE -ErrorAction SilentlyContinue}
  else {$env:GIT_INDEX_FILE=$oldIndex}
}
# Only after complete blob proof, overlay exact $group.files via ReadAllBytes/WriteAllBytes.
# SHA256 each source and destination against approved preservation ledger (values in this review).
# Copy only the five plan.offlineRetainedInputs after verifying their hashes; rehash destinations.
# Extract plan.offlineProcedure verbatim to temporary offline.ps1.
# The rehearsal used these exact calls; the second currently STOPS on missing polyfill:
# & $offline -CheckoutRoot $checkout -PlanJson $absolutePlan -GroupId CP07
# & $offline -CheckoutRoot $checkout -PlanJson $absolutePlan -GroupId CP07 -FullRegression
# No npm install, package copying, NODE_PATH/ancestor fallback or baseline relaxation.
# Rehash all committed/overlay/protected files and real index after tests.
# Cleanup only this freshly created environment after absolute-path/reparse-point checks.
```

## Decision and next action

**Review and hash-bind a deterministic offline dependency closure for the required cumulative regression (starting with declared @js-temporal/polyfill 0.5.1 and its jsbi dependency), without borrowing untracked ancestor packages or network installation; then separately rehearse full verification. No CP07 execution authorization inferred.**

The method is a candidate for future CP08–CP13, subject to separately approved parents, membership, dependencies and verification. No future use is authorized here.

CP07 remains QUALIFIED_NORMATIVE_CONTRACT_ONLY for current-vector failure locality—not runtime compliance or complete source qualification. No authority expanded. Production and science unchanged. No provider/database/Auth/Supabase access, environmental acquisition, staging at task end, commit, tag, push or deployment.
