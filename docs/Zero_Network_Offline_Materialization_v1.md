# Zero-network offline materialization v1

**CP07_ZERO_NETWORK_ISOLATED_ENVIRONMENT_SUPPLEMENT_QUALIFIED**

Operational qualification only. No scientific, contract, runtime or checkpoint authority changed. **CP07 is not committed; CP08 was not started.**

## Previous request: demonstrated cause

Installed npm **11.16.0** calls updateNotifier(npm) asynchronously from lib/cli/entry.js after starting the selected command. Its lib/cli/update-notifier.js requests pacote.manifest(`npm@*`, options with cache:false) when notification is enabled and the last-check marker is stale/absent. The prior request for registry.npmjs.org/npm was this npm-version metadata path, not one of the 28 locked dependency tarballs. The source explicitly returns before that work when **update-notifier=false**. Audit and funding were already disabled and do not explain that npm-package request.

The successful candidate sets **--update-notifier=false** explicitly and in a temporary npmrc. CI was absent and no update-check marker was created: success does not depend on CI detection or a coincidentally fresh marker. Source file hashes are recorded in JSON. No npm/Git/global/system configuration changed.

## Selected procedure

**Lockfile-governed npm ci**, private verified cache, isolated configuration, disabled notifier/scripts/audit/funding/bin generation, approved denial preload and a separate attempt monitor:

```text
node --import <approved-denial-URL> --import <attempt-monitor-URL> <npm>/bin/npm-cli.js ci --offline --ignore-scripts --no-audit --no-fund --update-notifier=false --bin-links=false --userconfig <temporary-user.npmrc> --globalconfig <temporary-empty-global.npmrc> --cache <private-cache>
```

Temporary user npmrc:

```ini
offline=true
update-notifier=false
audit=false
fund=false
ignore-scripts=true
bin-links=false
```

The package-manager child shell clears inherited NPM_CONFIG_* and NODE_OPTIONS, then supplies explicit temporary user/global configuration. The real registry identity is retained; localhost, invalid or fake registry endpoints were not used. Real HOME and global configuration were not changed.

All **28 cache tarballs** matched committed root lockfile integrity. @js-temporal/polyfill remains **0.5.1**, jsbi **4.3.2**. No declaration issue was reopened or amended. npm ci and npm ls both completed with **zero attempts**, confirmed before regression began.

Native checkout reconstructs all **1,897 HEAD blobs**. All **1,423 tracked package-content files** match the verified ci output. Five historical Git symlink-text stubs and historical hidden install metadata remain exactly as committed. Only the two absent locked packages, **48 files**, are overlaid from verified materialization. No tracked file is overwritten. The JSON retains the exact package paths/SRI identities and overlay hashes.

This procedure is LOCKFILE_BOUND, INTEGRITY_VERIFIED, ZERO_NETWORK_ATTEMPT, DETERMINISTIC for the recorded tool/input versions, TEMPORARY_ENVIRONMENT_ONLY, REAL_WORKTREE_SAFE, WINDOWS_COMPATIBLE and SUFFICIENT_FOR_CP07.

## Alternative methods, lifecycle scripts and bins

| Method | Result |
|---|---|
| npm with explicit notifier suppression and private config/cache | Selected and rehearsed successfully; avoids the demonstrated startup request. |
| Package-manager-free cache extraction | Evaluated, not selected or qualified. Would need equivalent exact scoped/nested layout, extraction safety, integrity, executable metadata and bin handling. No custom npm emulation introduced. |
| Existing node_modules snapshot | Blind copy/junction rejected. A filtered snapshot could require per-file cache/lock proof, but was not selected or used as source. Presence/version alone is insufficient. |

No locked dependency has a required preinstall/install/postinstall hook or binding.gyp native-install input. Three packages have prepare/build commands: polyfill, maplibre-gl-style-spec and maplibre-gl. Their published tarballs already contain the built files required by this regression; all tests pass with scripts disabled. This conclusion is bounded to these versions and CP07, not future source builds.

The existing five .bin entries retain native Windows core.symlinks=false target-text representation. Package CLI target files remain present and byte-verified. Polyfill/jsbi define no new bins. CP07 executes Node test files directly and needs no generated Windows shims. bin-links=false is therefore sufficient for CP07; this does not claim arbitrary npm CLI compatibility.

## Zero-attempt evidence

| Phase | Instrumented loads/exits | Attempt log entries |
|---|---:|---:|
| materialize | 1/1 | 0 |
| closure | 1/1 | 0 |
| resolution | 1/1 | 0 |
| focused | 4/4 | 0 |
| full | 73/73 | 0 |

Approved unchanged preload: `C:\Users\User\AppData\Local\Temp\pelora-zero-network-e7dc2f3216d44775b261f93c993e02c2\block-network.mjs`

SHA-256: `a7c4d834d772ce1ba06d853cc0dc9675ee80bcfb3848dd3de1b7ecf4d737d7ca`

Attempt monitor SHA-256: `4ed0cd7cb728f0c1c2fae2afa70e3f0fe6ad2a339bf45da9de7e818dbc339e3a`. Its complete source is in JSON. It imports the approved preload first, then records/denies calls through HTTP(S), agents, sockets/TLS, DNS callback/promise/Resolver APIs, UDP send/connect, fetch/WebSocket and child-process APIs; undici/HTTP diagnostic channels provide additional detection. Builtin named exports are synchronized.

Nine intentional, in-process denial calibration probes were logged separately. They were all denied before transport. They are **not** execution traffic and are not hidden inside the zero-count materialization/regression logs. No request targeted a fake registry to manufacture success.

Independent postchecks inspected complete npm logs: cache hits only, no HTTP fetch, retry or update attempt. Every instrumented execution process reported zero attempts. No package lifecycle scripts, child-process escape or remote Git operation ran. Process-level instrumentation and existing network restrictions are not represented as an OS packet trace or a proof against arbitrary malicious native bypasses; none was used or observed.

## Fresh CP07 construction and fixtures

The established private-index checkout-index mechanism was reused without requalification: autocrlf=false, symlinks=false. All committed blobs and the three CP07 files were verified before and after tests. Real index, refs and Git configuration were not changed.

Eight retained inputs were copied exactly: the plan's original five plus the three path/hash/authority-bound inputs from Offline_Dependency_Closure_Qualification_v1. No substitute, regeneration or environmental acquisition occurred. Required scratch directories were created only inside the fresh temporary checkout; generation flags were cleared.

V3 was excluded before discovery/execution by exact filename plus explicit guard. Only current HEAD plus CP07 test files were present; no CP08+ tests were overlaid.

## Complete result accounting

| Run | Intended | Started | Completed | Passed scripts | Failed scripts |
|---|---:|---:|---:|---:|---:|
| Focused/dependency | 4 | 4 | 4 | 4 | 0 |
| Full cumulative backend/shared | 73 | 73 | 73 | 73 | 0 |

Focused: **135 node:test cases passed**, including **11 current-vector locality cases**.

Full: **1895 node:test cases passed** across 64 framework-reporting scripts; **50 explicitly counted hand-written cases** passed. Other scripts emitted **732 PASS checkpoints**; 0 scripts use script-only assertions. These units are reported separately rather than inventing a uniform assertion count. **0 reported test failures, 0 skipped tests, 0 failed scripts.** Full per-script results/log hashes/count types are in JSON.

Exactly one deliberate suite exclusion: backend/tests/candidateSemanticProjectionV3.test.js. No V3 implementation execution. No ERR_MODULE_NOT_FOUND, no dependency fallback, no attempted network operation. The previous incomplete 68/73 result is not relabeled; this is a new complete rehearsal.

## Exact repeatable operational sequence

1. Fresh preflight: exact branch/HEAD, predecessor tags, empty real index/diffs, protected ledger and real package hashes. Require unchanged committed root manifest/lock and reviewed tool versions.

2. Use a fresh temporary root outside repository ancestors. Verify each of the 28 lockfile SRI digests against local cache bytes; copy only those content blobs to private _cacache/content-v2 locations. STOP on missing/inconsistent package input.

3. Write approved denial preload from plan base64; require its protected SHA256. Write the attempt monitor source from this JSON; verify its SHA256. Calibrate denied APIs in separate probe logs; all execution logs must begin empty.

4. In the package-manager child shell only, remove inherited NPM_CONFIG_* and NODE_OPTIONS. Use explicit --userconfig with reviewed temporary npmrc and --globalconfig with an empty temporary file; do not change real configuration. Keep true registry identity, not a fake registry.

5. Copy exact root package.json/package-lock.json into fresh dependencies directory. Run selected command, with PELORA_DENIAL_PRELOAD_URL, PELORA_ATTEMPT_LOG, PELORA_LIFECYCLE_LOG and PELORA_ATTEMPT_PHASE pointing inside this temporary root. Require exit 0 and zero logged attempts. Inspect complete npm debug logs BEFORE starting regression; reject any fetch/retry/update/audit attempt regardless of exit.

6. Run npm ls --all --json --offline --update-notifier=false with same temporary configs/cache and both imports; require no missing/invalid dependency and zero attempts. Validate all installed package versions and metadata against lock.

7. Build fresh HEAD via private GIT_INDEX_FILE/read-tree and checkout-index --all --prefix, autocrlf=false and symlinks=false. Restore original GIT_INDEX_FILE in finally. Verify complete path/mode/blob inventory; no real refs/index/object writes.

8. Compare all 1423 tracked package-content files with verified ci output. Retain five historical .bin target-text files and historical hidden .package-lock.json exactly as committed; exclude those six only from package-install comparison, not Git byte proof. STOP on any other difference. Add only absent lock-authorized polyfill/jsbi package directories (48 files); verify exact overlay manifest.

9. Overlay exact three CP07 files and require approved ledger hashes. Copy only the eight retained inputs in this JSON, each hash-bound to original plan/prior review. No acquisition/regeneration or copying of unrelated untracked evidence.

10. Check dependency resolution inside isolated checkout, no ancestor/junction fallback. Execute recorded instrumented runner: same plan focused/dependency list and cumulative full discovery, generation-flag clearing, scratch setup and V3 exclusion. Each process must load denial/monitor, emit start/exit receipt, exit 0 and leave attempt log empty. Require all 73 full scripts complete.

11. Review all process receipts, attempt logs and npm debug logs. Rehash committed tree, CP07/package/fixture overlays, protected real artifacts and real node_modules. Verify unchanged config/index/HEAD/tags, then remove only fresh contained temporary environments. STOP before CP07 execution.

The JSON includes the complete instrumented runner. It retains the approved plan's test selection, scratch/runtime/fixture checks and flags, adding per-process receipts and fail-on-attempt enforcement. It does not edit test or scientific code. Any future package/source/config/tool mismatch or attempted request must STOP; no online fallback is allowed.

## Preservation, cleanup and applicability

Starting/final HEAD: **02326627671eb290027cfef63e448109e6ad02e2**, branch codex/pelora-remote-setup. **173 protected artifacts** and **1,487 real node_modules files** unchanged. CP00–CP06 committed evidence/tags intact. Three CP07 protected files unchanged. Manifests/lockfiles/configuration unchanged. Real index, tracked diff and staged diff empty. **65 untracked files** after the two review outputs; Supabase pair remains excluded/untracked.

Only this task's temporary checkout, package directory, private cache and private index were removed after absolute containment and reparse-point checks. Operational logs remain outside Git; previous task scratch and real installations were not cleaned.

The extraction plus this zero-attempt materialization is a **narrow operational supplement to execution-plan v2**. Scientific authority and original isolated-verification invariants remain unchanged; no v3 rewrite is required for this exact bounded mechanism. Future CP08–CP13 applicability is technical planning only, subject to separately bound inputs/gates and authorization.

No production/science change, provider/database/Auth/Supabase access, environmental acquisition, commit, tag, push or deployment. **CP07 not committed; CP08 not started.**
