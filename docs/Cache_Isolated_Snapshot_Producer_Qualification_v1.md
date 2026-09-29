# Task 12B.6L — cache-isolated snapshot producer authority proposal

## Final adversarial review — STOP

**SNAPSHOT_PRODUCER_SURFACE_INCOMPLETE**. The entering qualification claim is withdrawn. The authority proposal/freeze is not approved for checkpoint as qualified authority. No projection v3 is qualified or implemented from this freeze. Task 12B.6C and Task 9E-D remain paused.

Three qualification defects are demonstrated without changing the current producer:

1. **Scenario-order dependency remains.** `isolatedProducerCorpus` assigns `latitude = 30 + index` from execution order. Reversing the same 45 scenarios changes 84 of 90 feature-observation records. For `direction-mask-15`, the north requested latitude changes from 45.25 to 59.25; the observation reference changes with the scientific sampling footprint. This is a fixture input-assignment defect, not a demonstrated production-cache defect. Coordinate-based transport dispatch removed fetch-ordinal temperature assignment but did not remove scenario-ordinal scientific location assignment.
2. **The recorded producer value union is incomplete.** Valid transport temperatures `[25, 25, null, 25.2]` Celsius with center 25, valid retained UTC time and the unchanged nonpolar caller produce three finite neighbors and low confidence. `buildTemperatureEvidence` emits `spatial-pattern-confidence-low` at `/observationSnapshot/evidence/groups/temperature/drivers/3`. None of the 90 baseline snapshots records that value at that path. The source branch `if (confidence?.level)` emits a level-dependent driver after earlier conditional drivers; the branch catalogue covers final confidence labels and temperature classifications but has no driver-emission row. Coverage of those labels alone does not establish complete context-dependent array membership/vocabulary. This is a newly demonstrated producer-surface outcome, not a new environmental source or serializer gap.
3. **Duplicate case labels fabricate optional absence.** The enumerator compares a Set of `name/cacheRun` labels with the raw row count. Adding one identical row creates 91 rows but only 90 distinct case labels, so even `/observationSnapshot` is incorrectly marked `ABSENT`, although it exists in every row. This is an inventory-accounting defect. No producer object was changed to demonstrate it.

The additional probe is diagnostic only: it is **not** added to the frozen scenario matrix, branch matrix, inventory or proposed authority. No semantic permissions are expanded. The fixture and all frozen files are retained byte-for-byte to preserve the failed proposal and its evidence; correcting and requalifying the complete surface is the next task, not an implicit repair to the frozen authority during this STOP review.

Independent stack-based enumeration reproduces the fixed-order 45 scenarios / 90 snapshots / 3,258 paths and inventory digest `0f6b06cd02d2917db2fee6ac327c166b866167790d1870e3b24596ecc285f559`. The existing three same-process fixed-order runs also reproduce that digest. **Fixed-order reproducibility is not order independence or branch completeness.** The recorded 100 outcomes (87 labelled exercised, 13 excluded) and 57 proposed entries remain counts of the failed artifacts; they are not independently certified complete by this review.

The reversed-order digest is `5fecc7a6e28c0ef1ee3483ef9b8522cc27d087d17a202ab1de7bfe65fcdba0e8`; two union records change while 84 raw feature records differ. The partial-case confidence score is 33; its ordered drivers are `center-temperature-available`, `uniform-water`, `directional-temperature-transition`, `spatial-pattern-confidence-low`. Both cold and warm producer runs emit the missing per-path vocabulary member.

This is a missing value at an existing path, not a demonstrated need for a new projection permission. No inference is made that the 57-entry delta must grow. Its completeness/minimality must be reassessed against a corrected producer audit before approval.

The inventory digest binds JSON-encoded sorted path records, their demonstrated shapes, numeric sign classes, string unions, scenario/cache-run case labels and existing authority labels. It does not bind exact finite nonzero numeric values or the joint set of whole ordered-array sequences. It also includes operational cache metadata and cold/warm case labels. It is therefore a full harness inventory audit digest, **not** a cache-state-independent scientific-content digest. Meaningful array positions are represented by concrete indices; per-index unions alone do not authenticate possible joint sequences. The new scenario demonstrates why that distinction matters.

All four freeze reference hashes and all seven source/harness hashes still match. Flipping one byte in an in-memory copy of each referenced artifact is detected. Byte integrity proves that the failed proposal has not changed; it does not prove completeness. The valid chronology claim remains limited to this unimplemented proposal existing before any future qualified v3 implementation. No committed or signed historical ordering is claimed.

Review changes are limited to STOP assertions in `backend/tests/cacheIsolatedSnapshotProducer.test.js` and this report. The three quarantined draft files are hash-checked only and remain unmodified/unexecuted. The proposed delta and frozen authority files were not expanded or silently re-frozen.

After STOP, complete branch/exclusion certification, minimality and semantic approval of all 57 entries, privacy/reference/time attack qualification, and zero-blocking-unresolved certification are **NOT ESTABLISHED BY THIS REVIEW**. The unchanged locked v1/v2 guards and prior scientific findings are not invalidated. Reference placement remains distinct from upstream reference authenticity. No readiness to implement v3 or resume reconstruction follows from passing the diagnostic tests.

**Exact next gate:** repair test-only scenario identity/location assignment; audit conditional driver membership and other actual producer outcomes from source; cover the newly demonstrated valid scenario; independently regenerate the surface under reordered/subset/duplicate/cold/warm runs; create a new explicitly reviewable authority proposal/freeze. Stop for adversarial review and checkpoint before any fresh v3 implementation. Do not patch production caching or expand semantic authority here.

Verification results for this review are recorded below after the historical report.

## Historical pre-review report — qualification claims withdrawn

The following records the entering proposal and prior verification only. Its completeness/readiness assertions are superseded by the STOP above.

Verdict: **SNAPSHOT_PRODUCER_SURFACE_QUALIFIED_FOR_AUTHORITY_REVIEW**, limited to the explicit reviewed domain below. This is a pre-implementation proposal requiring adversarial review. No projection v3 is implemented or qualified by this task. Task 12B.6C and Task 9E-D remain paused.

Baseline: `c0d97f1f1281e99898b908af8dd9c8e1f81056d1` / `checkpoint-snapshot-producer-surface-completeness-boundary-v1`.

## Domain and source audit

The reviewed domain uses nonpolar candidate coordinates with four distinct cardinal sampling points; finite-or-null SST; valid UTC or null sample time; explicit directional request rejection; valid provider/location metadata; unchanged default feature contracts; explicit assessmentAt; and fixed producer-derived non-SST auxiliary inputs. This is not a universal branch-coverage claim for the entire server, other environmental families, arbitrary malformed provider data, polar geography or corrupt direct function calls. The source branch matrix states exclusions explicitly.

The source audit covers `getSeaSurfaceTemperaturePoint`, SST point caching, `createSstSpatialSamplePoints`, `getSstSpatialStructureAtAssessment`, `classifySstSpatialRange`, `deriveSstTransitionOrientation`, `assessSstTransitionConfidence`, `classifySeaSurfaceTemperature`, `buildGovernedEnvironmentalFeatureObservationV1`, `buildTemperatureEvidence`, `buildObservationSnapshot` and `cloneSnapshotValue`. The proposal preserves existing v2 authority for fixed auxiliary content; it does not introduce non-SST scientific interpretation or change any producer.

The matrix records **100 reviewed branch outcomes: 87 reachable/exercised, 13 unreachable in this domain, zero reachable uncovered**. The unreachable outcomes are the future-time reason after an earlier throwing guard; eight invalid feature-contract/radius/duplicate-direction checks impossible under the unchanged caller; malformed snapshot wrapper; structuredClone fallback; polar sampling; and concurrent duplicate-point in-flight joining. Each row records its source function, condition, affected paths and exercising scenario IDs or exclusion reason. These are audited outcomes, not a claim that the entire 62,000-line server has only 100 branches.

## Cache defect and harness correction

`backend/server.js` stores SST points in module-local `sstPointCache`, keyed by latitude/longitude rounded to four decimals, with a five-minute TTL. Only finite Celsius observations are stored. A hit bypasses fetch and returns the retained value with operational cache metadata; missing and rejected samples are fetched again. The historical fixture's `n++` selected directional temperatures by fetch ordinal, so cache hits changed the meaning assigned to subsequent fetches. The prior 73-record drift is retained in the unchanged STOP diagnostic and historical inventory.

The new fixture selects center/north/east/south/west data from the requested coordinates relative to the scenario center, never request ordinal. Its fixed auxiliary transport adapter also replaces the older fixture's ordinal response callback with deterministic endpoint/coordinate responses. Actual parsers and assemblers still execute. No production reset hook or cache edit was added.

A test-only execution clock stays constant within each enumeration and advances one day between enumerations, beyond the production cache TTL. Each scenario runs cold then warm. Missing/rejected samples are allowed to fetch again. Scientific assessment time remains the explicit 2026-09-24T01:00:00Z context; execution time is not scientific time. Full inventory includes both operational cache states. Scientific/feature comparison excludes only leaves already classified operational by the locked v1 registry; no output is rewritten or normalized away. The two raw producer snapshots remain separately inventoried.

## Scenarios and reproducibility

**45 scenarios / 90 cold-warm snapshots** cover all directional availability masks; all/center missing; uniform temperatures; positive/negative/mixed signed zero; missing and partially missing sample times; inconsistent times; five center-temperature bands; range and directional-confidence cases; all four dominant sides; each of four directional request failures; and recent/same-day/within-24h/stale sample ages.

The weak-axis scenario is exactly **[25, 25, 26, 26.2] Celsius**, center 26, and emits **0.4 Fahrenheit** separation and `weak-axis-separation` through the unchanged parser/assembler/producer.

All three same-process inventories and a separate fresh-process verification produce:

`0f6b06cd02d2917db2fee6ac327c166b866167790d1870e3b24596ecc285f559`

This is the audit inventory SHA-256, not a new Ocean scientific identity. Repeated runs additionally compare actual scientific leaf values and feature records, not only counts or shapes. The fully populated warm case makes only the uncached center request. Signed zero remains exact in the producer and comparisons.

The new inventory contains **3,258 producer paths**. The old 3,259 count included an artificial outer `/` wrapper; the new inventory starts at the actual `/observationSnapshot` object. It retains containers, concrete indices, array patterns, observed primitive/string shapes, optional absence and numeric sign classes. Scenario evidence retains ordered confidence/requirement arrays. Old/new comparison records identify the omitted branch, operational cache artifacts, unchanged paths and other explained coverage/fixed-auxiliary differences. The historical failed inventory is not rewritten.

## Vocabulary and semantic proposal

The source emits **21 reachable confidence reasons**. A 22nd source literal, `future-dated-sample-time`, is unreachable after the earlier finite-future-time rejection. The complete source-derived vocabulary is recorded in the branch matrix and proposal, including `weak-axis-separation`.

Confidence ordering is a five-stage producer rule, not a frozen list of observed combinations: coverage; optional finite total range; direction; axis separation; age/time availability. Each stage uses the actual source thresholds/conditions and emits at most one distinct reason. This preserves order and excludes duplicates without making a future projection recompute confidence. Numeric correctness and causal authenticity remain producer responsibilities.

The feature producer has 12 ordered missing-requirement checks. Four can emit in the reviewed caller domain: sufficient coverage, supported temperature classification, at least three retained valid samples, and one consistent retained sample time. Eight reject malformed API/contract arguments excluded from this domain. The producer removes duplicates with Set while retaining check order; empty differs from absent. Requirements govern feature availability, so they retain scientific-state authority. They are not arbitrary prose.

Observation references are null when unavailable and use the existing producer reference family when available. The proposal grants only shape/placement/preservation/comparison authority. It does not authenticate digest content or introduce a resolver. Feature observedAt is the single distinct normalized retained environmental sample time; zero or multiple retained times produce null. Unavailable observations can retain a populated time. No assessment, retrieval, quality or acquisition time substitutes for represented time; no age calculation is introduced.

The proposal contains **57 exact concrete paths**, not permissive wildcard grants. The newly exercised rejection branches expose null resolved coordinates/cache age at each sample index in addition to the historical shapes. Each entry records source mapping, branch/scenario evidence, new shapes/exact strings, semantic surface and downstream role. Existing wildcard notation is descriptive only; exact entry paths bound the proposed permissions. Four reviewed sample slots do not authorize a fifth.

Coverage relative to locked v2 is derived by joining inventory paths to proposal entries and retaining the existing surface classification:

| Classification | Paths |
|---|---:|
| ALREADY_QUALIFIED_V2 (scientific) | 2,672 |
| DOCUMENTARY_ALREADY_QUALIFIED (non-scientific coverage bucket) | 528 |
| CROSS_CUTTING_ALREADY_QUALIFIED | 1 |
| NEW_AUTHORITY_REQUIRED | 57 |
| UNRESOLVED_AUTHORITY / INVALID | 0 |

The non-scientific bucket includes documentary, recording and operational paths; the inventory's `authority` field preserves their distinct existing surfaces. Four requirement-element paths have no old registry entry; their proposed scientific authority is grounded in the feature producer's prerequisite/availability use. No existing path is demoted to make comparison pass.

## Freeze and quarantine

`Candidate_Snapshot_Authority_Freeze_v1.json` binds exact bytes of the new inventory, branch matrix, scenario matrix and proposed delta, plus the production source, locked v1/v2 implementations/registries and harness/audit sources. The test recomputes every digest and rebuilds the artifacts for exact comparison. Creation uses exclusive writes; normal runs cannot rewrite the proposal. The freeze grants no authority and must be adversarially reviewed/checkpointed before any future v3 implementation.

A first preflight manifest attempt failed its round-trip test because ordinary JSON erased negative-zero scenario literals. That rejected attempt was moved to ignored diagnostics before implementation; it is not the successful freeze. The successful manifest uses explicit `NEGATIVE_ZERO` scenario-description labels and binds the exact fixture bytes that construct literal -0 transport. No scientific value or comparison is canonicalized, and no serializer contract was changed. Unlike the earlier historical artifact, this task ends with no implementation created from its successful freeze; a later checkpoint can provide durable ordering evidence. No signed or committed chronology is claimed for these currently uncommitted files.

Draft quarantine SHA-256 values, identical before and after:

| Unqualified draft | SHA-256 |
|---|---|
| backend/candidateSemanticProjectionV3.mjs | cc610ad547fac883c003219f143035101679a1f5adb6ccc0f10e14dd74adab0e |
| backend/tests/candidateSemanticProjectionV3.test.js | 98f097f673976161946d7d311661477e345bca0add4a2957b9d1527199fe16ab |
| docs/Candidate_Semantic_Shapes_v3.json | 0987dfbd9eca48e10e283757381c1a87b67caceca961e3ca20ee79c4dcb4673c |

Only byte hashing touches those drafts. They were not imported, parsed as authority, edited, staged or executed. Draft-v3 tests are excluded from regression discovery. The old STOP diagnostic remains unchanged and still reproduces its historical defects.

## Next gate and limitations

**Adversarial review of the cache-isolated producer branch inventory and frozen future-v3 authority proposal. STOP before projection implementation.** After review/checkpoint, a separate task may implement an explicitly versioned projection. Task 12B.6C is not ready to resume from this proposal alone.

No candidate reconstruction, species evaluation, provider authenticity, production freshness, durable resolution or all-species qualification is established. `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains open. Production caching, producers/parsers, exact captures/serializer, projections v1/v2, scientific assemblers/assessment, archive/scalar/publication V3 and scientific contracts remain unchanged. No provider/database/Auth/Supabase access or environmental acquisition occurred. No commit/tag/push/deployment was performed.

## Verification

Focused qualification: six tests, including three same-process enumerations, a separate cold-process verification, full raw scientific equality, source-branch coverage and freeze digest reproduction. Complete regression and static-check results are appended after completion. Unqualified draft-v3 tests are excluded, not interpreted as authority.

Final verification: **54/54 network-blocked backend/shared scripts passed** with draft-v3 tests excluded. New qualification 6/6; prior STOP 6/6; v1/v2 113/100; both snapshot diagnostics 18/18; exact marine/current 152/160; signed-zero 40; prior reconstruction 17; historical quality/companion 80/108. Syntax checks passed for **101 non-draft modules**, and **29 non-draft JSON files** parsed. Repository-configured whitespace checks and `git diff --check` passed. The successful freeze and its referenced files remained unchanged throughout cold-process verification and the regression run. All work remains uncommitted and unstaged.

## Final adversarial verification

**54/54 network-blocked backend/shared scripts passed**, excluding quarantined draft-v3 tests. The final focused suite passes **11/11**, including five added independent-enumeration/STOP/freeze-integrity tests. Prior STOP 6; v1/v2 113/100; snapshot diagnostics 18/18; exact marine/current 152/160; signed-zero 40; reconstruction 17; historical quality/companion 80/108 all pass. Passing diagnostics preserve the demonstrated failures and do not qualify the proposal.

Syntax: **101 non-draft modules** passed; **29 non-draft JSON files** parsed. Whitespace, `git diff --check` and staged diff checks pass. HEAD remains `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`; its required checkpoint resolves to that commit. No tracked production changes or staged changes exist. All three quarantined draft hashes match the preflight values above. All four freeze artifact hashes and seven frozen source/harness hashes remain unchanged. Review changes affect only this report and `backend/tests/cacheIsolatedSnapshotProducer.test.js`; the other qualification artifacts, drafts and unrelated Supabase files remain unstaged and unmodified by this review.

Regression logs: `.local/ocean-quarantine/task12b6l/adversarial-regressions/`. No provider/database/Auth/Supabase access, environmental acquisition, commit, tag, push or deployment occurred. Runtime/science, production cache, captures/serializer, projections v1/v2, assemblers, archive/scalar/publication V3, Task 12B.1 and Task 11E remain unchanged. Task 12B.6C and Task 9E-D remain paused; `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains open.
