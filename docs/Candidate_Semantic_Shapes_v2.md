# Candidate Semantic Projection Legitimate Missing/Partial Shapes v2

Task 12B.6F.1. Baseline: 8d666533c9250ef1a0c1c4c01c2e83844e5b0bf7.

**Verdict: LEGITIMATE_SCIENTIFIC_SHAPES_QUALIFIED for the explicitly reviewed root SST spatial branch.**

New semantic contract: pelora-candidate-semantic-projection-v2.
The checkpointed pelora-candidate-semantic-projection-v1 module, registry, accepted behavior and stored records are unchanged. This is an additive, unwired utility, not a runtime migration. The v2 engine is version-isolated from v1; it reads the locked v1 path registry and applies an explicit amendment. No evidence identity or digest is created.

## Source authority and exact scope

Authority is actual getSeaSurfaceTemperaturePoint -> getSstSpatialStructureAtAssessment, including deriveSstTransitionOrientation and assessSstTransitionConfidence in unchanged backend/server.js. Tests use the actual parser/cache/spatial assembler with synthetic same-product transport, not manually fabricated baselines.

V2 adds null only at the following exact root paths. All entries have prefix /sst/derived/spatialStructure/. Existing populated primitive types remain governed by v1.

| Original affected pattern | Populated shape | Legitimate null condition |
| --- | --- | --- |
| classification | string | Fewer than three finite directional neighbors |
| minimumFahrenheit | number | Fewer than three finite directional neighbors |
| maximumFahrenheit | number | Fewer than three finite directional neighbors |
| rangeFahrenheit | number | Fewer than three finite directional neighbors |
| orientation/coolSide | string | Existing orientation classification has no clear transition |
| orientation/warmSide | string | Existing orientation classification has no clear transition |
| orientation/dominantAxis | string | Existing orientation classification has no clear transition |
| orientation/dominantDifferenceFahrenheit | number | Existing orientation classification has no clear transition |
| orientation/eastWestDifferenceFahrenheit | number | Either east or west finite sample absent |
| orientation/northSouthDifferenceFahrenheit | number | Either north or south finite sample absent |
| confidence/axisSeparationFahrenheit | number | Fewer than two opposite-pair measurements |
| confidence/dominantDirectionalDifferenceFahrenheit | number | No opposite-pair measurement |
| confidence/secondaryDirectionalDifferenceFahrenheit | number | Fewer than two opposite-pair measurements |
| confidence/sampleAgeHours | number | No finite-temperature sample has a parseable time |
| samples/*/temperatureCelsius | number | Parser receives nonfinite/missing temperature |
| samples/*/temperatureFahrenheit | number | Existing converter receives missing Celsius |

Two narrow additional findings were necessary for the requested controlled cases:

1. Missing represented time: actual parser emits samples/*/observedAt = null. V1 only admits string at that exact root path. V2 explicitly qualifies this **17th prerequisite null pattern**, rather than hiding the missing-time case or granting general nullability.
2. Uniform/zero samples: existing confidence reasons include minimal-total-temperature-range. Existing weak/moderate branches also produce weak-total-temperature-range and moderate-total-temperature-range. V1's private range-label filter rejects these strings. V2 permits only these three exact existing strings at /sst/derived/spatialStructure/confidence/reasons/*. Other paths and appended private labels remain rejected. The root confidence-reason array is now restricted to the unchanged assembler vocabulary: lookalikes cannot evade the exception through generic string admission. No privacy substring bypass is introduced.

No snapshot alias, sibling family, arbitrary descendant or all-scientific-null rule is added. Unknown or unqualified copied shapes remain unresolved; full composite reconstruction is not qualified by this root-branch amendment.

## Coherence boundary

When the root SST spatial branch is supplied, v2 requires its complete reviewed four-direction shape and an explicit governed assessment context. A missing key is not null. Four samples must retain north/east/south/west roles and order.

Read-only consistency checks enforce:

- Both temperature representations are missing together, with corresponding parser source availability.
- Finite neighbor counts, coverage and range/classification missingness agree.
- Opposite-pair availability agrees with axis-difference missingness.
- Clear/no-clear orientation agrees with axis/side/dominant-difference missingness; populated sides must be distinct, opposite and consistent with the available dominant axis.
- Populated classification uses the existing assembler vocabulary; bounds must be ordered and range nonnegative.
- Confidence difference missingness agrees with the number of available opposite pairs.
- Age presence agrees with parseable times among finite samples; future finite sample times and negative age fail.
- Timestamp provenance retains the reviewed current-parser marker.

These checks reject the demonstrated impossible mixed missing/populated states. They do not recalculate Celsius/Fahrenheit conversion, numerical ranges, orientation strength, confidence scores or scientific age. Numeric derived correctness remains the existing assembler's authority and must be proved in subsequent reconstruction equivalence. A forged but shape-coherent object does not become authenticated evidence. This utility is not a scientific formula validator.

Partial evidence does not mean all derived facts must be null: two opposite finite neighbors can produce a directional relationship while total coverage remains insufficient; three finite neighbors produce range facts while one axis remains unavailable. All 16 directional availability masks are exercised.

## Time semantics

Actual confidence logic considers times only from finite-temperature samples. Missing or Date.parse-invalid time is ignored; when none remain, age is null. The missing-time and malformed-time fixtures preserve that current behavior and supplied text. They do not grant observation-time authority or weaken the stricter current-capture age helper.

A valid future timestamp among finite samples is rejected by the actual unchanged assembler and by v2 coherence checks. Unsupported timestamp-provenance markers are rejected at this reviewed parser-output boundary. Assessment time is explicit; no clock, retrieval time or quality time substitutes for represented time.

## Guards and preservation

V2 retains exact reviewed paths, unresolved unknown descendants, two-sided comparison, sparse-array rejection, descriptor/prototype safety and scientific privacy. Only exact null values at the amended paths move from unresolved to their existing scientific authority. No authority category is changed.

Missing, undefined, NaN, Infinity, wrong primitive/container, empty object and empty array do not gain null permission. Scientific comparison preserves -0 versus 0 and missing/value differences. Outputs are detached, deeply immutable and deterministic under incidental object-key reordering. Projection and comparison make no provider or Auth request and require no Date.now.

V1 compatibility is checked both behaviorally and by byte digests of its module and registry. These digests are test/audit code-file checks, not new Ocean evidence identities.

## Controlled results

- All 16 directional availability combinations self-compare EXACT_MATCH.
- Populated, all-missing, one/multiple missing, center-present/directional-missing and directional-present/center-missing cases pass.
- Uniform and valid numeric-zero cases pass; zero remains a number.
- Missing and malformed represented-time cases preserve actual null-age output.
- Future finite evidence is rejected by the actual assembler.
- Malformed shapes and impossible missingness combinations fail closed.
- Unknown descendants, unsupported provenance, sparse arrays and private/accessor attacks fail.
- Populated scientific entries match v1 exactly; v1 missing-state comparison still rejects its original 22 unresolved paths.
- Clock/network-prohibited projection remains deterministic and immutable.

Initial fixture failures exposed cache-coordinate collisions between scenarios; test locations were separated, preserving the actual cache behavior. No runtime/cache algorithm changed.

## Qualification limit and next gate

This qualifies semantic shapes only. No capture-derived spatial reconstruction, complete candidate evidence equivalence, species equivalence or provider qualification is established. No species evaluator was run.

**Task 12B.6C may resume using v2 for the qualified shapes**, subject to exact remaining path coverage, capture-derived spatial/provenance/static reconstruction and candidate/assessment binding. Snapshot aliases and other producer states are not automatically admitted by this amendment. Task 12B.6C was not resumed here.

UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED remains open. No converter repair or scientific approval occurred. Broader masks/uncertainty and production/durable source resolution remain outside this task.

## Verification and status

Original focused baseline: 64 tests. Final adversarial focused suite: 100 passed. Full network-blocked regression: 46/46 backend/shared scripts passed, including v1 projection 113, reconstruction diagnostic 10, all three captures, all prior Task 12 suites, Opportunity/governance, Task 11E, Frame/archive/scalar/Task 11B. Syntax: 83 modules passed. JSON: 17 files parsed. Whitespace and git diff --check passed. Final review logs and cumulative diff are ignored under .local/ocean-quarantine/task12b6f1-review/.

Only four new files are added: backend/candidateSemanticProjectionV2.mjs, backend/tests/candidateSemanticProjectionV2.test.js, docs/Candidate_Semantic_Shapes_v2.json and this report.

Source parsers, all captures, v1 projection, spatial/marine formulas, thresholds, assessment science, species science, archive, V3 and runtime routes remain unchanged. Task 9E-D remains paused. No provider/database/Auth/Supabase access or environmental acquisition. No commit, tag, push or deployment. Leave uncommitted for adversarial review.

## Final adversarial review

**ADVERSARIAL VERDICT: PASS for the explicitly qualified root SST scientific shapes.**

Seven demonstrated defects were corrected in v2 only:

1. Axis/side labels could contradict one another.
2. Warm and cool sides could be identical.
3. Populated classification could use an invented label.
4. Range could be negative.
5. Minimum could exceed maximum.
6. A suffix such as minimal-total-temperature-rangeX evaded the private-label matcher and entered as an ordinary confidence string.
7. A recognizable UUID followed by underscore evaded the word-boundary privacy match.

Corrections are structural orientation/classification/bounds checks, the exact existing confidence-reason vocabulary at the root branch, and hex-boundary UUID matching. They do not compute spatial values. V1 was not patched or reinterpreted.

The machine-readable v1ToV2AuthorityDelta records all broadenings and restrictions: exactly 17 path-specific null additions and three exact path-bound public strings; no new path names or authority-category reassignment. All stronger root sibling/coherence checks and UUID privacy tightening are explicit restrictions. The availabilityMatrix is generated from actual parser/assembler outputs for all 16 masks and records neighbor count, opposite pairs, orientation, confidence null pattern, sample null pattern, observation-time shapes and comparison result.

Active attacks cover populated and partial null contradictions; axis independence; selective confidence nulls; Celsius/Fahrenheit missing-pair contradictions; observedAt shapes and accessors; future and malformed/ambiguous/offset/high-precision timestamps; exact reason case/spacing/prefix/suffix/punctuation; reference/nested privacy; unknown fields on both inputs; sparse/extra arrays; signed zero within spatial fields; ordering; mutation; and projection-version confusion. Known v1 records are never upgraded in place. A projected record cannot be passed back as an unversioned raw composite without unresolved fields.

### Numerical and temporal authority limits

Review deliberately changed a finite range, a finite conversion pair, a directional difference and a finite age while keeping shapes coherent. These remain shape-admissible and compare MISMATCH against the unchanged producer result. Projection cannot determine numerical truth by self-comparing a fabricated input; it is not an authenticity or formula validator. Nonnegative range and ordered bounds are structural constraints, not a recomputed max-minus-min or classification rule.

Actual assembler tests confirm Date.parse-compatible ambiguous, offset and extra-precision timestamp text can produce finite age; malformed text produces null age when no parseable finite-sample time remains. This records existing behavior only, not new scientific-time qualification. Valid future timestamps in finite samples fail. Times attached solely to missing-temperature samples do not supply age authority. Named acquisition/retrieval/assessment fields injected into source samples remain unresolved. Plausible timestamp text relabeled by a caller cannot be authenticated from text alone; comparison still detects changed text. Task 12B.1 and capture age validation remain unchanged.

No broader current reconstruction, provider qualification or species claim follows. Task 12B.6C may resume using v2 for these root shapes after review; unreviewed snapshot aliases remain blocked.
