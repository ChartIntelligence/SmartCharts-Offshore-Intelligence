# Task 12B.6N — branch reachability and optionality review

## Final adversarial review — qualification withdrawn

**STOP: CALLER_CONTRACT_EXCLUSION_NOT_ENFORCED.** The earlier `SNAPSHOT_PRODUCER_BRANCH_AUTHORITY_QUALIFIED` claim below is withdrawn. No projection v3, authority proposal or freeze is qualified. Task 12B.6C remains paused.

The actual chlorophyll parser accepts an empty table as fulfilled missing evidence (`concentrationMgM3: null`, `source.availability: no-valid-pixel`). Passing that actual parser output through the unchanged assemblers produces a valid snapshot and executes `buildSurfaceWaterCharacterAnalysis:232417:232423` at server line 11928 (`: null` for chlorophyll concentration). Test-only V8 coverage proves execution in `fulfilled-no-valid-chlorophyll-pixel` and its absence in the finite-chlorophyll control. The original matrix calls this `UNREACHABLE_CALLER_CONTRACT`.

The stated fixed-auxiliary experiment excludes that case by definition, but its finite chlorophyll restriction originates in `auxiliaryTransport`, not production validation. It cannot support a production caller-contract exclusion. This is a qualification-scope defect, not a parser/science defect. Uniform u=.5/v=.2, chlorophyll .1 and other fixed marine values similarly originate in test fixtures; they require explicit fixture-only attribution rather than assumed production enforcement. This review does not assert that every one of the 269 exclusions is false.

A second structural defect is demonstrated: **SNAPSHOT_PRODUCER_BRANCH_INVENTORY_INCOMPLETE**. The function allowlist used for V8 source-range extraction omits `getOceanConditionsAtAssessment`. Its actual rejected-SST-assembly fallback constructs `samples: []` without orientation/confidence, but the 313-range set and extracted predicate list do not include that caller. Therefore 313 unexecuted ranges from selected functions cannot establish complete transitive caller/producer branch coverage. This review does not claim to have proved that fallback reachable for every restricted fixture input; its reachability itself remains unreviewed. The earlier successful-output harness never executes the real request function.

The new adversarial suite reproduces these defects and verifies all 21 protected hashes. Its executable chlorophyll fixture-domain predicate accepts the control and rejects the production-valid counterexample. The separate STOP JSON records the other stated domain constraints, their provenance, exclusion-group counts and exact source evidence; a complete code-enforced production-domain definition remains unqualified after STOP. Historical range/inventory artifacts remain unchanged as failed qualification evidence; they are not approved authority. Existing focused tests can still pass because they assert the restricted experiment and its own exclusions. Their PASS does not override this STOP.

Final adversarial verification: 4 STOP tests passed; all 57 network-blocked backend/shared scripts passed, including the existing 10-test focused suite, Harness v2, prior 11-test STOP suite and locked regressions. Syntax passed for 108 non-draft modules; JSON parsing passed for 37 non-draft files. Whitespace and staged/unstaged diff checks passed. All 21 protected hashes remain unchanged. Logs are in `.local/ocean-quarantine/task12b6n-adversarial/`. Production, historical inventories and quarantined drafts are unchanged. No staging, commit, tag, push, deployment, provider/database/Auth/Supabase access or environmental acquisition occurred.

After STOP, the 40 impossible-state proofs, operational/filter exclusions, all 122 optionality conclusions and four requirement semantic classifications are **NOT REQUALIFIED AFTER STOP**. Prior deterministic inventory and producer-correspondence findings are retained as bounded evidence. The prior inventory digest/path count does not establish caller-contract completeness. No authority has been expanded to absorb the counterexample.

Next gate: **CALLER-DOMAIN ENFORCEMENT AND TRANSITIVE PRODUCER BRANCH REQUALIFICATION**. Separate code-enforced caller invariants from fixture restrictions, audit the actual request caller and its fallbacks, then establish the intended domain before revisiting coverage/optionality. Do not create a proposal, freeze or projection v3 from this failed qualification.

The remainder of this report records the prior, now-withdrawn qualification and its historical verification.

## Scope and result

**SNAPSHOT_PRODUCER_BRANCH_AUTHORITY_QUALIFIED**, bounded to the reviewed Harness v2 caller domain: explicit nonpolar location 25,-91; finite/null SST samples, past UTC/null sample time and directional rejection; fixed producer-derived current/chlorophyll/marine auxiliary inputs; explicit assessment context. Three additional transport cases omit provider latitude, longitude or both. This is not a claim about all regions, all provider payloads, independently varying non-SST families, or every public assembler caller.

No projection permission is added. No authority proposal or freeze is created. No projection v3 is implemented or qualified. Task 12B.6C and Task 9E-D remain paused; `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains open.

## Files and preservation

New files:

- `backend/tests/fixtures/snapshotBranchReachabilityReview.mjs`
- `backend/tests/snapshotBranchOptionality.test.js`
- `docs/Candidate_Snapshot_Branch_Optionality_Review_v1.json`
- `docs/Candidate_Snapshot_Producer_Surface_v4.json`
- `docs/Candidate_Snapshot_Branch_Review_Preservation_v1.json`
- This report.

Harness v2 is reused without edits. The response adapter in the new fixture wraps its semantic-keyed synthetic response only for the three explicit coordinate-omission cases. It does not replace sampling, parsing, scientific assembly, cache behavior or assessment context. The nine Task 12B.6M files, nine failed qualification files and three quarantined v3 files retain their hashes. Before/after hashes are recorded in the new preservation artifact. The quarantined files are hashed, not imported or consulted as authority.

## Harness invariants and scenario coverage

The original 12-test harness suite was rerun before branch work and passed: canonical, reverse, five seeded permutations, duplicates, cold/warm, subset/full and repeated-process behavior remain deterministic. Explicit coordinates and semantic transport role mapping do not depend on request ordinal or list index. Operational clock advancement controls only cache expiry.

The new suite runs **128 scenarios / 256 cold-warm snapshots**, then reverse order, seeds 1/7/42/1729/65537, first/middle/last/multiple duplicates, warm-first, subset-then-full and same-process repetition. It compares per-scenario semantic leaves as well as inventory digests. The three new permanent IDs are `provider-coordinate-fallback-latitude`, `provider-coordinate-fallback-longitude` and `provider-coordinate-fallback-both`.

The original 125-state inventory still reproduces its digest when those three cases are excluded. Its 252-snapshot baseline included two extra concurrent executions; the new 256 count is simply 128 cold/warm pairs and does not relabel those original concurrent executions.

## All 313 source ranges

A source range is a V8 function/block/short-circuit coverage interval, identified by producer name and source start/end offsets. It is not necessarily a distinct scientific branch: a nullish fallback, callback or later Boolean operand may have its own interval. Each review entry preserves the exact source expression, preceding predicate context, source line, ID, caller prerequisites, consequence, exclusion/counterexample reasoning and exercising scenarios where reachable. Source text is checked against current `backend/server.js`.

| Disposition | Count |
|---|---:|
| REACHABLE_REVIEWED_DOMAIN | 2 |
| UNREACHABLE_CALLER_CONTRACT | 269 |
| UNREACHABLE_IMPOSSIBLE_STATE | 40 |
| UNREACHABLE_UPSTREAM_VALIDATION | 1 |
| NON_SEMANTIC_OPERATIONAL_BRANCH | 1 |
| UNREACHABLE_NONPOLAR_DOMAIN | 0 |
| NOT_PRODUCER_OUTPUT_BRANCH | 0 |
| REQUIRES_FURTHER_REVIEW | 0 |

These counts dispose of the specified 313 previously unresolved ranges, not all possible branches of the application. The earlier 371 exercised ranges and 14 documented exclusions remain preserved in the Task 12B.6M evidence. The two newly reached ranges have positive test-only V8 coverage and explicit scenario IDs. The new suite also rejects any purportedly unreachable reviewed range with positive execution coverage.

The two reachable ranges are requested-coordinate fallbacks at server lines 6225 and 6231. The one upstream exclusion is line 24219: the feature filter requires `source.availability === "available"` before the map's nullish availability fallback. The operational range at line 7027 is the console-warning direction fallback, not returned scientific output.

Caller exclusions are deliberately narrower than global unreachability. The current caller always supplies assembled spatial/feature/evidence objects, required version labels, dense sample arrays, finite neighbor counts and radius 15. Unavailable observations preserve those objects. Fixed finite chlorophyll and uniform current preserve the auxiliary schemas and analysis availability. Changing SST cannot create a current edge/shear/convergence signal. Tests assert these premises across every scenario.

Impossible-state exclusions follow actual source constants and dependencies: at most one independent spatial water-character variable, no salinity/density/vertical/persistence evidence, and no verified adjacent water masses/mixing/front detection. An organization index of 5 or 8 is impossible here: thermal weight is at most 2, surface boundary at most 1 and water-mass boundary at most 1; all other fixed-domain weights are zero. Tests assert the bound of 4.

No exclusion relies solely on absence from observed outputs. The matrix records the source/caller reason and the attempted counterexample class. No invalid partial final snapshot is treated as a legitimate producer input.

## Numeric, compound, enum, return and failure review

The preserved threshold audit exercises total range 0.5/1/2°F; directional magnitude 0.3/1/2°F; axis separation 0.2/0.5/1°F; confidence thresholds 45/75; sample ages 3/12/24 hours; and neighbor count 3. It uses actual producer floating-point results without epsilon. Exact confidence 45 is excluded by the source-constrained score contribution analysis; actual scenarios bracket it at 44/46. Other reachable boundaries have exact/below/above scenarios.

Compound current/thermal branches cannot acquire hydrodynamic truth from thermal variation alone in this fixed-current domain. Later readiness operands are blocked by source-fixed false prerequisites. Later availability OR operands are short-circuited by populated fixed auxiliary analyses. Enum/classification variants are produced by the unchanged spatial classifiers; no arbitrary labels are admitted.

The temperature-unavailable early return genuinely omits five extended value keys. Feature unavailability instead retains its object, requirement list and possibly observedAt, while its observationReference becomes null. A rejected directional acquisition creates a scientific missing sample with absent provider metadata. A future finite observation throws under unchanged assessment-time science and is not inventoried as a successful snapshot. The warning text itself is operational.

## Drivers and confidence reasons

Both historical omissions remain asserted:

- `[25,25,26,26.2]`, center 25: axis separation 0.4°F and `weak-axis-separation`.
- `[25,25,null,25.2]`, center 25: `spatial-pattern-confidence-low` at `/observationSnapshot/evidence/groups/temperature/drivers/3`.

Index 3 is scenario-specific. Ordered pushes for center availability, spatial classification, directional orientation and confidence precede the possible insufficient-coverage append. Confidence occurs at multiple indexes in legitimate scenarios; no arbitrary index authority is inferred.

Reachable temperature driver vocabulary:
`center-temperature-available`, `directional-temperature-transition`, `insufficient-spatial-coverage`, `moderate-temperature-transition`, `spatial-pattern-confidence-high`, `spatial-pattern-confidence-low`, `spatial-pattern-confidence-moderate`, `strong-temperature-break-candidate`, `uniform-water`, `weak-temperature-transition`.

Confidence reasons follow five ordered mutually exclusive stages:

1. Coverage: `complete-four-point-coverage`, `partial-but-sufficient-coverage`, `insufficient-spatial-coverage`.
2. Finite total range, otherwise omitted: `strong-total-temperature-range`, `moderate-total-temperature-range`, `weak-total-temperature-range`, `minimal-total-temperature-range`.
3. Direction: `strong-directional-difference`, `moderate-directional-difference`, `weak-directional-difference`, `no-clear-directional-orientation`.
4. Axis: `clear-dominant-axis`, `moderately-distinct-axis`, `weak-axis-separation`, `competing-directional-signals`, `single-axis-only`.
5. Time: `recent-samples`, `same-day-samples`, `samples-within-24-hours`, `stale-samples`, `sample-time-unavailable`.

All 21 are produced. `future-dated-sample-time` cannot be emitted after the earlier finite-future guard throws. Stage ordering and dependencies govern combinations; this review does not grant an arbitrary reason-string array or privacy exception.

## Four requirement paths

The four exact paths are `/observationSnapshot/observations/sst/derived/governedEnvironmentalFeatureObservation/missingRequirements/0`, `/1`, `/2`, and `/3` (full paths are individually recorded in the machine-readable review).

Disposition: **SCIENTIFIC_STATE**, as producer prerequisite-failure state. The producer uses `missingRequirements.length === 0` to establish availability; `buildTemperatureEvidence` then consumes availability and governed reference fields to establish scientific observation provenance. This does not alter the locked semantic registry or implement projection authority.

The twelve source checks have four reachable failures in this caller, in exact check order:

1. `sufficient-spatial-coverage`
2. `supported-temperature-transition-classification`
3. `at-least-three-valid-spatial-samples`
4. `consistent-spatial-sample-observation-time`

The other eight concern defaulted type/family/source/contracts, valid spatial object/radius and unique cardinal directions. The unchanged caller satisfies them independently of SST measurements. The list always exists, can be empty and is never null/absent. Each check pushes its distinct token once; final Set deduplication preserves order. Reachable combinations and per-index vocabulary/scenario evidence are recorded, not generalized to arbitrary combinations.

Reference authority remains shape/placement/comparison only. This work does not authenticate reference contents. Feature observedAt is the unique normalized retained sample time, or null when none/multiple remain; availability does not imply timestamp presence or absence. There is no substitution of assessment, retrieval or acquisition time.

## All 122 optionality paths

The machine-readable review individually identifies every path, controlling producer/rule, source location, present/absent scenario sets and present shapes:

- 5 object keys: extended temperature values appear only in the available return branch; present null differs from omitted key.
- 16 object keys/descendants: spatial sample provider metadata is omitted only by rejected-acquisition construction; nested absence follows the absent parent.
- 101 array members/descendants: dense filtered samples, ordered requirements, confidence reasons, drivers, supporting groups, lineage lists, conditional character variables and deduplicated inherited limitations. Index presence follows the actual ordered producer list, not wildcard inheritance.

For unique semantic scenario universe S, presence of path p is the set P(p) of IDs whose actual snapshot owns that path. Always-present means P(p)=S; state-absent means S minus P(p); never-emitted means P(p) is empty. BRANCH_OPTIONAL additionally requires the source predicate/list rule recorded here. Record multiplicity never appears in that calculation.

Duplicate present and absent scenarios are added for every optional path and tested together; inventory and presence sets remain identical. Reverse/permutation tests retain the same result. A subset cannot certify global optionality. No sparse arrays are produced, and no missing key is equated with null. This qualifies presence semantics, not new semantic-projection permissions.

## Expanded inventory

Final inventory: **128 scenarios, 3,258 paths**, digest:

`edf48996a02fe8a66fdeca84b802eeb541e5e58cd5dc3517230f2f20390d7a52`

The new version is `Candidate_Snapshot_Producer_Surface_v4.json`; prior inventories are untouched. All path names remain the same, but eight existing `spatialStructure/samples/{0,1,2,3}/providerCoordinates/resolved{Latitude,Longitude}` leaves gain demonstrated NULL alongside NUMBER. Actual parser `resolveProviderCoordinates` retains raw provider absence; legacy resolvedLatitude/Longitude separately fall back to requested coordinates. No missing provider fact is fabricated. The initial test incorrectly expected complete equality to the populated-coordinate baseline; it was corrected to assert this exact documented difference, retaining all other comparisons.

The digest binds the same independent inventory representation used by Harness v2: sorted path/type/value-shape/string/ordered-array records and unique scenario presence sets. It retains signed-zero classes and meaningful array order, excludes only already-classified operational cache values, and contains no generation clock/process/order metadata. The original 125-state digest is still `21dddc3fddc351d473b6b2139efb9505f6bab6b44fad8124823469aa33df25f7`.

## Verification and next gate

Verification passed: 10 new focused tests, the original 12 harness tests, and all 56 backend/shared scripts including the new suite, with network blocked. The prior STOP diagnostic remains 11; locked v1/v2 projections, snapshot diagnostics, exact/historical captures, signed-zero, Task 12, Opportunity/governance, Task 11E and Frame/archive/scalar regressions pass. Syntax checks passed for 107 non-draft modules and JSON checks for 36 non-draft files. Whitespace and staged/unstaged diff checks pass. The final 128-state optionality metadata was independently regenerated after clarifying its lineage-copy descriptions. Tests verify actual branch execution, fixed-caller proof premises, source byte correspondence, requirement linkage, optionality, deterministic attacks and protected-file hashes. No scientific formula or reference authentication is reimplemented. Logs are in `.local/ocean-quarantine/task12b6n/`.

Next gate: **ADVERSARIAL REVIEW OF BRANCH REACHABILITY & OPTIONALITY**. Only after review/checkpoint may a separate task create an authority proposal/freeze. Complete candidate equivalence, provider qualification and species equivalence remain unestablished.

Production, caches, parsers, exact/historical captures, serializer/digest, projections v1/v2, assemblers, assessment/species science, archive/scalar/publication V3 and freshness rules remain unchanged. No provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment occurred.
