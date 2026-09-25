# Task 12B.6E — Marine assessor companion evidence

Baseline: `8d9d7ce3e0642f5fdc3a19ea9e45ac8ebbbc6b74`.

**CANDIDATE_ASSEMBLY_READY_TO_RESUME**, for controlled Task 12B.6C input-equivalence work only. Complete candidate reconstruction and species-evaluator equivalence remain unestablished.

Contract: `pelora-marine-assessor-companion-capture-v1`.

## Audited source boundary

The actual `getMarineConditions` parser in `backend/server.js` receives Open-Meteo Weather Forecast API and Marine Forecast API responses. The companion retains the missing normalized fields without acquiring data or changing science:

| Normalized field | Transport field | Existing converter | Units | Existing use |
| --- | --- | --- | --- | --- |
| wind.gustKnots | wind_gusts_10m | metersPerSecondToKnots | knots | Wind assessment, marine assessment confidence, source availability |
| wind.directionDegrees | wind_direction_10m | safeNumber | degrees | Directional relationships, marine confidence, source availability |
| waves.directionDegrees | wave_direction | safeNumber | degrees | Directional relationships and marine confidence |
| waves.periodSeconds | wave_period | safeNumber | seconds | Period classification, sea state and marine confidence |
| swell.directionDegrees | swell_wave_direction | safeNumber | degrees | Directional relationships and marine confidence |
| swell.periodSeconds | swell_wave_period | safeNumber | seconds | Period classification and marine confidence |

These fields have named family roles, not a temporal sequence. No new range thresholds are introduced. Finite normalized numbers (including zero, negative values and directions outside one rotation) are preserved; the unchanged assessor remains responsible for its interpretation. Malformed/nonfinite normalized values fail validation.

Audit precedes implementation: `getMarineConditions`, `buildAssessmentConfidence`, `assessOceanConditions`, the route's exact quality block, both locked captures and the previous six controlled counterexamples were inspected. The machine-readable companion matrix records converters, products, units, missingness, provenance, availability, temporal disposition and consumers.

## Composition and provenance

Every companion binds an exact `pelora-weather-marine-quality-capture-v1` reference (identity, contract and digest). Construction, validation and replay require that exact valid capture. Location, speed, heights, quality time and acquisition outcomes are reused through that reference, not copied into a second source schema. Wrong references or changed quality captures fail closed.

Only six additional provenance leaves are retained: `wind.source.provider`, `classification`, `availability`, and root `source.provider`, `weatherModel`, `marineModel`. Wind availability records the parser's speed-or-gust-or-direction decision and its missing-current/acquisition outcomes. Model labels preserve actual `current_units` presence; they are not filled from assumed product labels. Root source is returned as candidate `source.marine`; the marine assessor does not turn those labels into a new scoring rule. Raw provider errors, timing diagnostics, arbitrary metadata and full transport responses are excluded.

The fixture composes normalized SST and supporting chlorophyll/current evidence through unchanged `pelora-governed-current-evidence-capture-v1`. The exact existing inline quality assembler is invoked through the already reviewed test harness. The same exported `assessOceanConditions` consumes the current and replay paths. No scientific formulas are copied into the companion. This is test composition, not a production candidate resolver or a claim that independent captures authenticate one another.

## Qualification results

The six missing values and six retained source leaves round-trip exactly, including null and zero. Complete tested quality objects and complete `oceanConditions` objects compare with strict deep equality, including meaningful array order. The six one-at-a-time changes still alter current marine output, and each corresponding companion replay reproduces that altered output exactly. All eight speed/height availability combinations, failed weather/marine acquisition, missing current block and missing speed with surviving gust/direction are exercised.

Family tags, exact keys, finite/null types, product profiles, immutable references and digest validation reject structural substitution and tampering. Swapped waves/swell payloads retain their original family tags and fail closed. A malicious producer who rewrites values, tags and digests consistently is **not authenticated by this contract**; cross-product truth still requires upstream governance. No serialization contract can prove the physical origin of an arbitrary scalar.

Source identity is not source qualification. Capture validity is not provider authenticity. Authority remains the source authority recorded by the referenced quality capture. Synthetic transports prove mechanics, not live reliability, production freshness, source qualification or product interchangeability. No NOAA replacement is made.

## Null, time and replay boundaries

`UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains open. `metersPerSecondToKnots` can convert transport null to normalized zero; `safeNumber` preserves transport null as null for the five direction/period fields. The companion never converts null to zero and cannot recover information already lost upstream. No converter correction or scientific approval occurs here.

The normalized wind/waves/swell objects expose no separate represented timestamps. The companion does not invent them. Referenced aggregate `observedAt` retains weather-first nullish marine-current precedence and remains **quality time**, not scientific age authority. Invalid/future quality-time text is preserved without creating age. SST's supported time provenance and assessment-relative age remain governed by the unchanged current capture/Task 12B.1. Retrieval time is operational and outside this companion.

Replay under a later execution clock, with `Date.now` and network forbidden, reproduces the tested inputs and marine result. No Auth, captain, request fallback or species configuration enters the constructor. Synthetic wrapper context is deliberately outside the pure boundary.

## Integrity and privacy

One content identity binds the version, exact quality reference, six fields, retained provenance and audit lineage references. There is no redundant scientific digest. Canonical object keys do not affect identity; meaningful values and lineage-array ordering do. Outputs and replay are detached and deeply frozen.

The companion uses the reviewed strict descriptor/own-property and private-label protections. Ordinary/nested keys, structured reference strings (dotted, hyphenated and underscored), metadata-shaped additions, email/UUID content, inherited values and accessors are rejected. Getters are not executed. Unknown fields are rejected rather than stripped. These checks detect dedicated private content; they are not a general natural-language privacy classifier.

## References, limitations and next gate

Existing archive raw-evidence references and V3 captured references bind the companion identity/digest in tests. Compatibility is **reference-only**. Capture bytes are not Ocean Product Frames or archive payloads; no archive/V3 amendment, production storage or durable resolver is introduced.

No Blue Marlin eligibility, score, confidence, ranking or Opportunity-identity effect/non-effect is asserted. Marine assessment confidence is existing species-neutral output and is compared only as part of `oceanConditions`. Broader SST/chlorophyll/current spatial reconstruction, masks/uncertainty, candidate/source binding, retrieval/snapshot semantics and complete candidate parity remain open.

Next: resume Task 12B.6C complete candidate-object comparison with all three captures, governed static context and unchanged assemblers. Stop at any remaining missing source. Do not jump directly to species score/ranking equivalence.

## Verification and scope

### Final adversarial review

The 84-test implementation baseline was expanded by 24 hostile tests. **One defect was demonstrated by two failing tests:** construction accepted recorded wind availability that contradicted its complete normalized value surface. A finite speed/gust/direction could be labeled `provider-returned-null` or `provider-returned-no-current-data`; an all-null wind could claim `available`.

The correction is validation only: require recorded `available` to agree with the existing parser's `windHasAnyValue` predicate over bound speed and companion gust/direction. Reject contradictory input; never rewrite provenance. Existing acquisition-failure checks remain. No availability aggregation, marine formula, threshold or locked capture changed. The companion stores no duplicate wind speed or independently derived availability state.

All 108 focused tests now pass. Expanded attacks cover exact quality-reference identity/digest/location/time/value/authority/lineage binding, malformed/fabricated references, all directed family substitutions, direction/period tampering, actual-parser range/missing boundaries, six provenance-leaf removal/substitution, unused metadata, quality-envelope getters/setters, private reference text, inherited/sparse/nonenumerable values and mutation of parser/input/envelope/lineage data. Both original six controlled assessor comparisons and all eight partial-family combinations remain exact.

Recomputed self-consistent fabricated inputs are explicitly not authenticated. A producer that deliberately relabels scalar values or units consistently cannot be identified by content hashing alone; this remains source qualification, not an equivalence claim. The upstream gust null-to-zero issue remains unresolved and unchanged. No 12B.6C reconstruction or species evaluator was run in this review.

The pre-correction failures and post-correction offline logs are retained in ignored `.local/ocean-quarantine/task12b6e-review/`. Final review verification: all 42 backend/shared scripts passed with network blocked; all 108 focused tests passed. Syntax passed for 76 modules. JSON, whitespace and diff checks passed. Both locked captures and all existing tracked files remain unchanged.

Original implementation baseline: 84 focused tests passed. All 42 backend/shared scripts passed with network blocked, including both locked captures, all prior Task 12, Opportunity/governance, Task 11E and Frame/archive/scalar/Task 11B. Syntax passed for 76 modules; JSON, whitespace and diff checks passed. Results are recorded in the machine-readable matrix and ignored `.local/ocean-quarantine/task12b6e/` logs. No frontend/build changes are needed.

Only the companion module, its synthetic fixture, focused tests, field matrix and this report are added. Existing runtime, both locked captures, V3, archive, Task 12B.1, Task 11E, scientific formulas/thresholds and identities remain unchanged. Task 9E-D remains paused. No provider/database/Auth/Supabase access, environmental acquisition, commit, tag, push or deployment.
