# Task 12B.6J: snapshot shape authority boundary

Baseline: `10ae54e634684771149fa5a728528cbb1a31977f`, checkpoint `checkpoint-candidate-snapshot-shape-boundary-v1`.

**Verdict: SNAPSHOT_SEMANTIC_AUTHORITY_UNRESOLVED. No semantic projection v3 was created.**

Task 12B.6C and Task 9E-D remain paused. This is a producer-correspondence and proposed-delta audit, not candidate reconstruction or a new semantic qualification PASS.

## Why implementation stopped

The requested maximum amendment covers the 16 snapshot spatial null patterns and the three feature-observation path groups represented by the original 28 unresolved concrete paths. Before implementing an amendment, actual current producer scenarios demonstrate two additional authority requirements:

1. `/observationSnapshot/observations/sst/derived/spatialStructure/confidence/reasons/*` needs a separately reviewed, path-specific privacy exception for the actual string `minimal-total-temperature-range`. Uniform, positive-zero, and mixed negative/positive-zero producer outputs contain that string. V2 explicitly permits it at the root confidence-reason path only; projection of the snapshot throws `Private scientific content`. This is not a new field-name permission: it is a new privacy authority at a different path. Allowing only the 28 original shapes cannot cure this rejection. No general `range` exception is justified.
2. `/observationSnapshot/observations/sst/derived/spatialStructure/samples/{0,1,2,3}/observedAt` needs path-specific null authority for the required missing-time scenario. These four concrete paths are absent from the original 28. They correspond to the separately reviewed 17th root prerequisite, not one of the 16 spatial patterns and not the feature-observation `observedAt`.

The task explicitly requires STOP if implementation needs broader authority. No v3 utility, alias fallback, privacy exception, timestamp substitution, or predecessor amendment was implemented. The machine-readable proposed v2-to-v3 delta is marked `applied: false`; additional required authority is recorded separately, not silently added to it.

## Producer architecture and spatial correspondence

`getOceanConditionsAtAssessment` calls `getSstSpatialStructure` and `buildGovernedEnvironmentalFeatureObservationV1`, places their outputs in the SST object, then supplies that object to `buildObservationSnapshot` as `observations.sst`.

`buildObservationSnapshot` passes the supplied observations object to `cloneSnapshotValue`. For a supplied object, that helper calls `structuredClone`. It neither calculates spatial facts nor inserts leaf defaults. Its whole-input undefined handling does not explain these supplied scientific leaves. The snapshot carries both existing spatial and feature-observation outputs exactly, including legitimate nulls and signed zero.

Tests use synthetic same-product transport through the actual SST parser and unchanged spatial assembler. They call the actual feature and snapshot producers. The test inspects the emitted SST observations branch; it does not claim all other snapshot inputs or aliases have been qualified.

All 22 original spatial null leaves correspond exactly to root facts. The JSON lists all 16 root-to-snapshot pattern mappings and all 28 original concrete paths. Under `spatialStructure/`, those mappings cover classification; minimum, maximum and range; six orientation fields; four confidence fields; and Celsius/Fahrenheit sample values. There is no scientific recomputation, time substitution, missing-to-zero conversion, or default insertion in the snapshot clone.

One-at-a-time controlled mutations of finite/null values, orientation labels, directional differences, sample time, and signed zero survive exactly in the corresponding snapshot spatial object. Mutations are used to establish cloning only; fabricated combinations are not thereby accepted as valid science. Source mutation after snapshot construction does not alter the detached snapshot. These are producer tests, not a v3 validator or complete immutability qualification.

## Feature observation: separate source authority

`buildGovernedEnvironmentalFeatureObservationV1` independently constructs the feature-observation object. Snapshot cloning is faithful, but these fields are not aliases of root spatial leaves.

The builder filters spatial samples by valid role, requested/resolved coordinates, finite Fahrenheit, parseable observation time, and usable source identity/availability. It normalizes retained times with `new Date(...).toISOString()` and sorts retained samples by governed direction order. This is existing producer behavior, not new v3 time validation or scientific authentication of permissive `Date.parse` inputs.

**missingRequirements.** Fixed conditional checks produce an ordered list. Its length controls `available` and whether observation identity is constructed. The returned `Set` expansion removes duplicates while retaining check order. Empty array differs from missing key. The four strings exercised in these controlled valid-source scenarios are:

- `sufficient-spatial-coverage`
- `supported-temperature-transition-classification`
- `at-least-three-valid-spatial-samples`
- `consistent-spatial-sample-observation-time`

The whole producer also contains checks for supported feature type/family/observation type, governed spatial structure, source type/contract, sampling radius, and unique sample directions. Those additional strings are not automatically authorized by this four-string audit. A future validator must use an explicit closed vocabulary and producer-valid order/subsets; arbitrary string arrays are not justified.

This is scientific prerequisite state at the producer boundary, with explainability content. `buildTemperatureEvidence` consumes the resulting availability/identity authority and observation provenance; no direct read of requirement-string content was demonstrated in that inspected consumer. The locked registry already classifies the parent requirement array as current scientific evidence. Nothing was demoted, promoted, or partitioned differently to obtain equality. Direct independent scientific authority for arbitrary requirement prose is not established.

**observationReference.** The producer emits null when `available` is false. Otherwise it emits the existing `pelora-observation-v1:<64 lowercase hex>` identifier from SHA256 of its existing canonical observation JSON. This is not an exact-capture reference and is not replaced by a new reference system. The inspected `buildTemperatureEvidence` consumer checks contract/type/feature/authority/availability and reference syntax before exposing observation provenance. This audit does not claim that syntax authenticates an altered digest. Cryptographic/reference substitution attacks and any v3 validation remain unqualified after STOP; no reference content is recomputed by new code.

**observedAt.** This is represented environmental time of the retained feature sampling footprint. It is populated when exactly one distinct normalized time remains and null when zero or multiple distinct times remain. It is not assessment, acquisition, retrieval, or publication time. It can be populated even when feature observation availability is false. Therefore `missingRequirements.length > 0` must not imply null time.

Demonstrated coherence states:

| Producer case | Available | Requirements | Reference | Feature time |
| --- | --- | --- | --- | --- |
| Populated supported transition | true | empty | existing identifier | represented time |
| All spatial evidence missing | false | four reviewed requirements | null | null |
| Partial directional evidence | false | first three reviewed requirements | null | represented time |
| Uniform / zero temperatures | false | unsupported transition classification | null | represented time |
| Missing sample times | false | insufficient valid samples and inconsistent time | null | null |

No structural validator was created after STOP. Malformed, future, ambiguous, offset, precision, substituted-time, corrupt-reference, wrong-family, missing-key and impossible mixed-state acceptance/rejection are not newly qualified. Task 12B.1 remains authoritative; this audit grants no new temporal authority.

## Accounting and comparison status

Every original path has one disposition in the JSON: `UNRESOLVED`, with producer correspondence `EXACT_MATCH` and an explicit reason that no versioned authority was granted after the scope STOP. This distinguishes faithful producer correspondence from completed guarded semantic qualification. There are exactly 28 entries; no original path is dropped.

The seven actual producer cases all pass root spatial self-comparison and preserve snapshot spatial/feature correspondence. Under unchanged v2, the populated snapshot branch is accepted; missing has 28 unresolved paths; partial has 15; missing-time has nine; uniform and both zero cases are rejected by the snapshot confidence-reason privacy boundary. These are not seven v3 PASS results.

Unknown descendants and accessor input remain blocked by unchanged v2; hostile getters are not invoked by the tested guard. Two-sided comparison, shape validation, signed-zero distinction, privacy, and sparse-array policies remain untouched. Comprehensive v3 attacks, v3 projection immutability/determinism, reference/time validation, and complete snapshot qualification were not run because v3 was not created. Existing v1/v2 regression coverage remains separate.

## Preservation, limits, and next gate

The report records SHA256 file-integrity hashes for v1/v2 implementations and their registries. Git content hashes match HEAD. No files in those locked layers were modified. These are integrity checks, not new scientific identities.

No scientific calculations, missing-requirement derivation, observation-reference construction, timestamps, or spatial formulas were added to a projection. No snapshot producer defect or signed-zero loss was demonstrated. No serializer/capture amendment is justified by this diagnostic.

**Next gate:** separately authorize and review the exact additional snapshot confidence-reason privacy authority and sample `observedAt` null shapes, alongside the proposed original 28-path amendment. Then re-enter narrow snapshot semantic qualification, including closed requirement vocabulary, feature-reference/time coherence, and adversarial validation. Do not automatically inherit any root authority. Only after that qualification may Task 12B.6C resume. `TASK_12B_6C_READY_TO_RESUME_WITH_PROJECTION_V3` is not established.

Complete candidate evidence equivalence, chlorophyll/current reconstruction, marine integration, provenance/static reconstruction, durable resolution, species equivalence, and provider qualification remain unestablished by this task. `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` stays open. Task 9E-D stays paused.

Only the diagnostic test and JSON/Markdown report are new. Runtime, snapshot producer, parsers, exact and historical captures, shared serializer/digest, v1/v2 projections and registries, spatial/quality/marine assemblers, assessment science/Task 12B.1, Task 11E, species science, identities, archive/scalar/publication V3, provider qualification, and freshness rules are unchanged. No provider/database/Auth/Supabase access, environmental acquisition, frontend work, commit, tag, push, or deployment. Existing untracked Supabase files are untouched.

## Verification

All 52 backend/shared scripts passed under the existing fetch/net/tls/http/https network traps. Focused diagnostic: 18/18; checkpointed snapshot boundary: 18/18; projection v2: 100/100; projection v1: 113/113; exact marine: 152/152; exact current: 160/160; signed-zero qualification: 40/40; prior reconstruction: 17/17; historical quality: 80/80; historical companion: 108/108. All other Task 12, Opportunity/governance, Task 11E, Frame/archive/scalar/Task 11B, temporal and publication scripts in the complete backend/shared inventory passed. A passing diagnostic establishes the STOP evidence, not snapshot semantic qualification.

Syntax checks passed for 96 modules and JSON parsing for 23 files. Whitespace, `git diff --check`, and explicit no-index checks of new files passed. V1/v2 implementation and registry Git hashes match HEAD and recorded byte hashes remain unchanged. Tracked and staged diffs are empty. The three new diagnostic files remain untracked/uncommitted; pre-existing Supabase files remain untouched. Logs and the per-script exit manifest are ignored under `.local/ocean-quarantine/snapshot-shape-authority/`. No frontend/build check was needed.
