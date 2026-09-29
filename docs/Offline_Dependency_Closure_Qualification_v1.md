# Offline dependency closure qualification v1

**CP07_OFFLINE_DEPENDENCY_CLOSURE_UNRESOLVED**

Operational review only. The declaration and cache-integrity findings are sound, but **the materialization procedure is not approved**. CP07 is not committed; CP08 was not started.

## Mandatory STOP

npm exited 0 and installed all 28 locked packages from cache, but its detailed debug log contains:

```text
12 http fetch GET https://registry.npmjs.org/npm attempt 1 failed with undefined
```

This is an attempted request for npm's own registry metadata despite offline mode, likely an update check. It is distinct from the 28 cache hits. The attempt is logged as failed with the byte-verified network blocker active; no successful external response is demonstrated. **The user's rule prohibits the attempt itself**, so exit 0 and successful extraction do not qualify the procedure.

This was discovered on detailed log inspection after rehearsal had started. The active isolated regression was stopped at sstWorker.test.js. No flag changes, retry or alternate materialization occurred after discovery. The later “Please continue” message was used to finish this STOP report and cleanup, not to waive the rule.

Debug log SHA-256: `1ccc3401369272dc784643cffcbfb695363948ca10ef8d09c606a155588f6e15`.

## Declaration and importing code

**DECLARED_DIRECT_DEPENDENCY**: committed root package.json pins @js-temporal/polyfill to **0.5.1**; root package-lock.json v3 agrees and supplies resolved URL and SHA-512 integrity. jsbi is declared transitively as ^4.3.0 and locked to **4.3.2**. No declaration amendment is required.

All committed literal references:

- `HEAD:backend/tests/fishingLogTemporalEvidence.test.js:175:  assert.equal(json("package.json").dependencies["@js-temporal/polyfill"], "0.5.1");`
- `HEAD:backend/tests/fishingLogTemporalEvidence.test.js:176:  assert.equal(json("package-lock.json").packages[""].dependencies["@js-temporal/polyfill"], "0.5.1");`
- `HEAD:backend/tests/fishingLogTemporalEvidence.test.js:177:  assert.equal(json("package-lock.json").packages["node_modules/@js-temporal/polyfill"].version, "0.5.1");`
- `HEAD:backend/tests/fishingLogTemporalEvidence.test.js:178:  assert.equal(json("node_modules/@js-temporal/polyfill/package.json").version, "0.5.1");`
- `HEAD:docs/Fishing_Log_Temporal_Evidence_v1.md:75:The root manifest pins `@js-temporal/polyfill` to exactly `0.5.1`. Only the shared`
- `HEAD:package-lock.json:8:        "@js-temporal/polyfill": "0.5.1",`
- `HEAD:package-lock.json:12:    "node_modules/@js-temporal/polyfill": {`
- `HEAD:package-lock.json:14:      "resolved": "https://registry.npmjs.org/@js-temporal/polyfill/-/polyfill-0.5.1.tgz",`
- `HEAD:package.json:3:    "@js-temporal/polyfill": "0.5.1",`
- `HEAD:shared/fishingLogTemporalEvidence.mjs:1:import {Temporal} from "@js-temporal/polyfill";`
- `HEAD:shared/fishingLogTemporalEvidence.mjs:138:      implementation: "@js-temporal/polyfill", implementationVersion: "0.5.1",`

The sole direct package import is static in shared/fishingLogTemporalEvidence.mjs. The temporal-evidence, association-readiness and evidence-capture tests reach it during the CP07 full regression. The implementation/import predates CP00: commit bf7596ccbde6c229bd77e15c09d517efa532eb55, 2026-09-22.

Current frontend source reaches it through Dashboard → FishingDayReportPanel / FishingLogTemporalControls → utils/fishingLogTemporalCapture → shared/fishingLogEvidenceCapture → shared/fishingLogTemporalEvidence. This records static reachability, not live deployment. No backend/server import was found. Older documentation describing no integration is historical. No frontend build or test was run here.

Root, backend and frontend manifests/locks and tracked package manifests were inspected. No tracked npm-shrinkwrap exists. The package is not a dev dependency, lockfile-only entry or undeclared import.

## Local installation and tracking

Installed path: `C:\Users\User\.codex\worktrees\e89f\SmartCharts-Offshore-Intelligence\node_modules\@js-temporal\polyfill`, version **0.5.1**, root resolution. The package and jsbi are ignored/untracked. Their **48 local files** match the materialization from verified lock-bound cache contents. Local presence/version alone was not used as authority.

There are **1,429 historically tracked node_modules paths** despite the node_modules/ ignore rule. checkout-index correctly reproduces only tracked files. The five historical symlink-target entries and the old hidden node_modules/.package-lock.json remain untouched. The hidden lock lacks these later packages; **root package-lock.json** is authoritative for the declared dependency closure. A source checkout is not an installed execution environment.

## Offline sources and integrity

All **28 packages** in the committed root lock are available in the existing npm content cache. Each complete tarball was hashed against its committed SRI before being copied into a fresh private cache. The real cache was not used as a writable npm cache.

| Package | Version | Committed integrity |
|---|---|---|
| node_modules/@js-temporal/polyfill | 0.5.1 | `sha512-hloP58zRVCRSpgDxmqCWJNlizAlUgJFqG2ypq79DCvyv9tHjRYMDOcPFjzfl/A1/YxDvRCZz8wvZvmapQnKwFQ==` |
| node_modules/jsbi | 4.3.2 | `sha512-9fqMSQbhJykSeii05nxKl4m6Eqn2P6rOlYiS+C5Dr/HPIU/7yZxu5qzbs40tgaFORiw2Amd0mirjxatXYMkIew==` |

The JSON contains all 28 source identities/cache locations, installed metadata hashes and the exact 48-file overlay. Package integrity was established; this is not a vulnerability/security or scientific audit. Existing node_modules and previous scratch were not trusted as installation authority. No package was downloaded.

## Candidate methods

| Method | Determinism / lock binding | Network / real-worktree / portability | Disposition |
|---|---|---|---|
| npm ci --offline, verified private cache | Exact manifest/lock; 28 package identities matched | Preload active; real tree untouched; Windows Node24.18.0/npm11.16.0 | **Not qualified: prohibited metadata request attempt** |
| npm install --offline | Can alter resolution/lock; weaker than ci | Temp-only possible; not rehearsed | Not selected |
| Direct exact cache extraction | SRI-bound identity possible; must prove complete closure/extraction | No transport needed; temp-only possible | Candidate for a separate review, not qualified |
| Copy complete real node_modules | Local state alone is not lock authority | No install, but contamination risk | Rejected |
| Junction/symlink to real tree | Shared mutable state and fallback | Windows portability/isolation problems | Rejected |
| Fresh network installation | Outside allowed boundary | Prohibited | Not attempted |

Candidate invocation actually rehearsed, **not an approved future command**:

```text
node --import <approved-block-network-file-URL> <npm>/bin/npm-cli.js ci --offline --ignore-scripts --no-audit --no-fund --bin-links=false --cache <fresh-private-cache>
```

It ran in a separate temporary dependency directory containing exact committed root manifests. Lifecycle scripts, audit, funding and bin links were disabled. npm ls --all --json --offline subsequently passed, but that does not override the network-attempt STOP.

## Isolated construction and retained fixtures

The locked extraction mechanism was reused: private Git index, read-tree, checkout-index, autocrlf=false, symlinks=false. **1,897 committed files** matched Git blobs, plus all three CP07 files matched their protected SHA-256. **1,423 tracked package-content files** matched the package-manager result. Only the two absent packages (**48 files**) were added from that verified result. No tracked .bin entry, hidden lock, production file or manifest was overwritten. ESM/CommonJS resolution remained inside the temporary checkout; no ancestor fallback or junction was used.

The first package-complete run exposed an independent retained-fixture omission at noaaSstDisplayScale.test.js. Three existing files were statically required by committed scaleReview.mjs; their archive/receipt/frame/derivative identities matched the committed pilot report. They were copied unchanged, with no regeneration or acquisition, before the subsequent full rehearsal. This was before the network-attempt discovery. It does not grant an approved execution supplement.

| Retained input | Bytes | SHA-256 |
|---|---:|---|
| .local/ocean-quarantine/sst/noaa-geo-polar/task11d-20260922T120000Z-gulf/summary.json | 8922 | `fc0ef8e66ea9cd3b181980fbbd8040da6ddb445e850a9b5294f51285e4e837bf` |
| .local/ocean-quarantine/sst/noaa-geo-polar/task11d-20260922T120000Z-gulf/field.json | 3225021 | `4d8aeaa3d060d11351678ccefb195dcaa0ce20fc61f63b4f2cb77f6e20614228` |
| .local/ocean-quarantine/sst/noaa-geo-polar/task11d-20260922T120000Z-gulf/archive/opf-b01cd11c68de5bab89d2ac29d44ea04302f59ff57b417bf39f8f9c65aad08286.json | 4962882 | `ff8b3395b525877b86f64285e488c53ff87432468217b8dfb851d3b0ee1682ee` |

The original five inputs and three additional inputs remained byte-identical. Their identity authority and exact manifests are recorded in JSON. Scratch setup and runner otherwise came verbatim from execution-plan v2.

## Test and network results

- Focused/dependency: **4 scripts, 135 tests passed**, locality **11**.
- Full run scheduled **73 non-quarantined scripts**. **68 scripts completed before interruption**; script 69 (sstWorker.test.js) was stopped; **4 scripts not started**.
- Completed framework reports: **59 node:test scripts, 1,636 tests passed**, reported failures/skips/cancellations **0**. Hand-written PASS markers are a different unit and are not added to this total. The run exit is **1 from deliberate interruption**, not a full PASS or evidence of a scientific assertion failure.
- No ERR_MODULE_NOT_FOUND remained in the repeated full run. Complete dependency/test closure is nevertheless **not qualified**, because the mandatory operational STOP prevented completion.
- V3 excluded by exact filename and explicit runner guard; no V3 implementation execution, no CP08+ tests.
- Preload SHA-256: `a7c4d834d772ce1ba06d853cc0dc9675ee80bcfb3848dd3de1b7ecf4d737d7ca`; `C:\Users\User\AppData\Local\Temp\pelora-offline-closure-b033449e5e384a05bad11b2b358570a5\block-network.mjs`.
- Nine transport probes threw before transport. The preload is not an OS firewall and does not claim arbitrary UDP/DNS/subprocess coverage. The failed npm metadata attempt must remain visible; do not report “no network attempted.”
- Full interrupted log SHA-256: `06e316053deaeb364747494714d3933ebc56fd2c901fdf06eb9bfde5b0a563b0`.

## Preservation and next gate

HEAD unchanged: **02326627671eb290027cfef63e448109e6ad02e2**. Real index, tracked diff and staged diff empty. All **171 pre-existing protected artifacts**, **1,487 real node_modules files**, committed predecessor evidence and CP00–CP06 tags unchanged. Root/backend/frontend package manifests and lockfiles unchanged. **63 untracked files** after these two reports, including the unchanged excluded Supabase pair.

Only this task's temporary checkout, dependency directory, private cache and private index were removed after containment/reparse-point checks. Operational logs remain outside Git. Real node_modules/cache and older task environments were not cleaned or changed.

**Separately authorize a no-attempt materialization rehearsal. Review npm metadata/update-check behavior or evaluate direct extraction from the already-SRI-verified cache. Do not treat suggested flags or alternate methods as qualified. Require zero attempted network, then complete all 73 cumulative non-quarantined scripts.**

No sufficient-supplement or v3 verdict is issued yet. Future CP08–CP13 applicability is planning only. No production/science/contract change, provider/database/Auth/Supabase access, environmental acquisition, staging at task end, commit, tag, push or deployment. **CP07 not committed; CP08 not started.**
