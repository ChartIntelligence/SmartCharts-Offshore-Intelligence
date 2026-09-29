# Task 12B.6M — new harness evidence, authority qualification incomplete

Verdict: **SNAPSHOT_PRODUCER_BRANCH_AUTHORITY_UNRESOLVED**.

This is an incomplete qualification, not the requested qualified verdict. No new authority proposal or pre-implementation freeze was created. No projection v3 was implemented or qualified. Task 12B.6C and Task 9E-D remain paused. `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains open.

## What is established

The new harness removes the three demonstrated harness defects within its controlled executions. Each scenario has a stable ID and explicit coordinates `(25, -91)`. Coordinates never depend on list position, request ordinal or preceding scenarios. Holding geography fixed isolates temperature/time branch changes; this is a nonpolar, fixed-location qualification domain, not global geographic qualification.

Transport responses are mapped by actual endpoint and exact requested coordinates to center/cardinal roles using the unchanged production sampler. Repeated semantic requests return the same configured evidence. Call counters are diagnostics, not scientific assignments. Unknown semantic requests reject. Test-only execution-clock advancement expires production caches between different scenarios. Source observation times and the explicit scientific assessment time remain separate from that clock.

Production point caching remains unchanged: its rounded-coordinate key, finite-temperature admission, expiry, hit and in-flight behavior are exercised, not patched. The old ordinal fixture could shift directional assignments when cached requests bypassed fetch calls. The new mapping does not consume an ordinal to select scientific values.

The baseline contains **125 scenarios and 252 snapshots**: 125 cold/warm pairs plus two concurrent requests. Exact scientific/feature comparisons pass for each pair. Reverse order, five seeded permutations, first/middle/last/multiple duplicates, warm-first, subset-then-full and repeated same-process runs reproduce the inventory. Seeds are 1, 7, 42, 1729 and 65537. The standalone focused run and later regression execution provide separate-process reproduction.

Inventory aggregation uses unique semantic scenario IDs. Identical duplicates cannot create absence; conflicting scientific evidence for the same ID rejects. The root is present in every valid controlled output. Presence is recorded as present in all reviewed states, absent in specified states, or never emitted in a requested subset. **Observed absence is not yet qualified producer optionality.** There are 3,136 paths present in every state and 122 paths requiring branch-specific optionality review.

Both historical omissions are reproduced through the unchanged producer:

- Center 25, directions `[25, 25, 26, 26.2]`: axis separation exactly 0.4°F and `weak-axis-separation`.
- Center 25, directions `[25, 25, null, 25.2]`: `/observationSnapshot/evidence/groups/temperature/drivers/3` is `spatial-pattern-confidence-low`.

Positive, negative and mixed zero scenarios retain source signs through the actual spatial producer and snapshot construction. Root/snapshot copying uses the existing `structuredClone` path. No JSON sign repair, alternate conversion or scientific formula was introduced.

## New files

1. `backend/tests/snapshotProducerQualificationV2.test.js`
2. `backend/tests/fixtures/snapshotProducerQualificationV2Fixture.mjs`
3. `backend/tests/fixtures/snapshotProducerInventoryV2.mjs`
4. `backend/tests/fixtures/snapshotProducerBranchAuditV2.mjs`
5. `docs/Candidate_Snapshot_Harness_v2_Preservation.json`
6. `docs/Candidate_Snapshot_Producer_Surface_v3.json`
7. `docs/Candidate_Snapshot_Producer_Branches_v2.json`
8. `docs/Candidate_Snapshot_Producer_Scenarios_v2.json`
9. This report.

All are uncommitted. The new surface artifact is explicitly `SOURCE_AUDIT_PENDING_NO_AUTHORITY`; its version number does not grant semantic authority.

## Source audit and its precise blocking boundary

The source evidence records 22 functions, 93 extracted `if` predicates and **698 V8 coverage ranges**. Of those ranges, 371 were exercised, 14 have bounded source exclusion explanations, and **313 lack completed reachability review**. These are runtime ranges (including defaults and short-circuit operands), not a certified total of semantic branch outcomes. Unexecuted does not mean unreachable.

The function list covers point/cache/sampling, spatial classification/orientation/confidence, feature construction, temperature evidence, downstream ocean physics/organization and snapshot copying. It is not yet a complete transitive source audit. In particular, the current range manifest does not separately audit `buildOceanEvidenceLineage` or the extracted central SST band classifier. The latter is executed unchanged, but execution alone does not close source-branch accounting.

Every exercised range has scenario IDs and exact source evidence in the new branch artifact. Unreviewed ranges retain their exact source text and IDs. The audit does not convert those ranges to exclusions to obtain a pass. Consequently total reachable/excluded semantic branch counts and zero-uncovered coverage are **not established**.

Threshold evidence covers 15 boundary rows: total range 0.5/1/2°F, directional magnitude 0.3/1/2°F, axis separation 0.2/0.5/1°F, confidence 45/75, ages 3/12/24 hours and neighbor count 3. Producer outputs bracket each reachable threshold and hit the exact value. A source-constrained over-approximation excludes exact score 45; actual producer scenarios yield 44 and 46, and 74/76 bracket the upper threshold. This helper audits branch contributions only and never supplies scientific output.

## Closed strings, requirements, reference and time findings

The actual confidence source contains 22 reason literals. The controlled producer emits 21; the future-dated reason is behind an earlier throwing future-evidence guard in the reviewed past/null-time domain. Five ordered stages are recorded: coverage, optional range, direction, axis separation and time. Exact emitted vocabulary and stage predicates are in the branch artifact. These are producer findings, **not proposed projection permissions**. No new privacy exemption is granted.

The ten emitted temperature drivers are:

- `center-temperature-available`
- `directional-temperature-transition`
- `insufficient-spatial-coverage`
- `moderate-temperature-transition`
- `spatial-pattern-confidence-high`
- `spatial-pattern-confidence-low`
- `spatial-pattern-confidence-moderate`
- `strong-temperature-break-candidate`
- `uniform-water`
- `weak-temperature-transition`

The feature source has twelve prerequisite checks. Four emit under the fixed caller contract: `sufficient-spatial-coverage`, `supported-temperature-transition-classification`, `at-least-three-valid-spatial-samples`, and `consistent-spatial-sample-observation-time`. The other eight have source explanations based on omitted overrides, fixed valid contracts, positive radius and unique cardinal sampling. Requirements follow producer check order and Set deduplication. Full adversarial exclusion/semantic-authority qualification remains incomplete.

An observation reference is produced only when requirements are empty. Otherwise it is null. Retained feature time is the unique normalized retained sample time, or null for zero/multiple such times, independently of availability. This work makes no reference authenticity claim and grants no new timestamp authority. Future finite evidence is rejected by the unchanged assembler in a dedicated test. No assessment/retrieval/acquisition substitution is used.

## Inventory and authority limitations

The new union contains **3,258 paths**. Its semantic digest is:

`21dddc3fddc351d473b6b2139efb9505f6bab6b44fad8124823469aa33df25f7`

The digest binds sorted path records, demonstrated shapes, signed-zero classes, string unions, meaningful primitive-array order and unique scenario presence sets. Operational cache values are excluded only at already-classified operational paths; their path/type/presence remain inventoried. Unknown values are not silently discarded. Generation time, process ID and execution order are not digest inputs. Stack and recursive enumerators agree.

Registry lookup identifies 2,721 scientific paths, 417 documentary paths, 48 operational paths, 67 retrieval/snapshot paths, one split container and **four unresolved authority paths**:

`/observationSnapshot/observations/sst/derived/governedEnvironmentalFeatureObservation/missingRequirements/0` through `/3`.

These counts are path-category lookup results, not proof that projection v2 accepts every demonstrated value shape. A complete v2 shape-coverage review and downstream semantic partition are still required. No future-v3 delta count is claimed.

Both historical inventories are read only after independent generation, for comparison. Relative to historical v1, the new inventory drops the artificial `/` wrapper and `oceanOrganization/organizationDrivers/2`, and includes `oceanOrganization/counterEvidence/5`; 101 string unions differ. Relative to failed v2, the path set matches and 29 string unions differ. Every path comparison retains old/new shapes and added/removed strings. The broad explanations in this comparison remain diagnostic: they do not prove every difference is a cache artifact or close the source-domain/optionality audit.

## Preservation and verification boundary

The preservation artifact records SHA-256 values for all nine failed qualification files and all three quarantined v3 files. The focused test recomputes every hash. These files are neither imported as authority nor modified. Historical files are read only for history, comparison and byte-preservation checks. Quarantined drafts are hashed only.

The new focused suite has 12 passing tests, including an independent regression-process reproduction of the generated evidence. All 55 network-blocked backend/shared scripts passed, including the prior 11-test STOP diagnostic and locked projection/capture suites. Syntax checks passed for 105 non-draft modules and JSON parsing for 33 non-draft files. New-file whitespace checks, `git diff --check` and staged diff checks passed. Draft-v3 tests were excluded. Passing tests establish the explicitly asserted harness properties and reproduce the unresolved gate; they do not establish complete producer authority. Regression logs and results are under `.local/ocean-quarantine/task12b6m/regressions/`.

No tracked production file changed. No snapshot producer, production cache, parser, capture, serializer/digest, projection v1/v2, assembler, assessment/species science, archive/scalar/publication V3, provider qualification or freshness behavior was changed. No new scientific identity or capture was created.

## Next gate

Complete the transitive source predicate audit, prove exclusions or exercise reachable outcomes, and map the 122 observed absence cases to producer branches. Then finish v2 value-shape coverage, downstream semantic classification and temporal/reference placement review. Only after zero blocking unresolved authority may a new proposed delta and freeze be created. This task does not authorize a qualified projection-v3 implementation or resumption of Task 12B.6C.

No provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment occurred.
