# Task 12B.6C resumed — candidate evidence source sufficiency

Baseline: `3fde1486eb96e70c848cdbead6a8cc4beb10c540`. Both required capture checkpoints verified.

**Verdict: MISSING_GOVERNED_SOURCE. Complete candidate-evidence equivalence is not established.** No production assembler, resolver, candidate contract, evaluator or runtime integration was implemented. Both locked capture contracts remain unchanged.

## What the resumption resolved, and what it exposed

Task 12B.6D successfully closed the normalized **quality projection** gap. Its eight retained leaves reconstruct the tested current quality object exactly. The resumed audit does not invalidate that qualification or Task 12B.6B's 62-field point-source qualification.

The complete request candidate object also returns `wind`, `waves`, `swell`, and `oceanConditions`. Before species interpretation, the route invokes `assessOceanConditions({wind: marine.wind, waves: marine.waves, swell: marine.swell, dataQuality})`. That existing species-neutral marine assessor consumes more than speed/height availability:

| Uncaptured normalized input | Existing consumer |
| --- | --- |
| `wind.gustKnots` | Wind assessment and marine assessment confidence |
| `wind.directionDegrees` | Directional comparisons and marine assessment confidence |
| `waves.directionDegrees` | Directional comparisons and marine assessment confidence |
| `waves.periodSeconds` | Wave-period classification, sea-state interpretation and confidence |
| `swell.directionDegrees` | Directional comparisons and marine assessment confidence |
| `swell.periodSeconds` | Swell-period classification and confidence |

These are not Blue Marlin rules. The marine assessor's `confidence` belongs to `pelora-ocean-conditions-v1.7`, not species confidence. The current return and observation snapshot preserve the raw marine fields too. They cannot be dropped simply because a particular species-scoring call might not consume them.

`wind.source.availability` is another affected candidate field: the parser examines speed **or gust or direction**. With identical missing wind speed and identical captures/quality, a response with no gust/direction returns `provider-returned-null`, while one with gust/direction returns `available`. It cannot be reconstructed from captured speed alone.

## Controlled proof

The new diagnostic uses synthetic transport with the actual `getMarineConditions` parser. It captures the exact normalized SST and weather-quality projections; supporting chlorophyll/current captures are held fixed. Both source paths then use the exact current quality block and exported `assessOceanConditions`. No formula is copied and no species evaluator is used.

For each of the six missing inputs, changing only its transport source field produces:

1. Identical locked captures, including identity and source references.
2. Identical complete `dataQuality` objects.
3. Different complete `oceanConditions` objects from the current marine assessor.

The differences include wind assessment, directional relationships, wave/swell period classification, sea-state interpretation and associated evidence/explanation. They are recorded field by field in the JSON matrix. This is an explained **source-input insufficiency**, not a defect in the marine formulas and not an unexplained equivalence mismatch.

Replaying only the available weather projection into the assessor silently changes its result. Both strict capture schemas reject attempts to append these missing fields. A deterministic reconstruction from identical captures cannot reproduce two distinct valid current outputs. Static context, candidate geometry and assessment time cannot supply the lost measurements.

Complete normalized parser inputs, when separately retained in test memory, replay through the existing assessor with identical results and `Date.now`/network prohibited. This is a diagnostic control, not a new qualified capture or complete candidate replay proof.

## Field inventory and authority

`Candidate_Capture_Resumption_Field_Map_v1.json` retains current request return groups, outer candidate/static/assessment dependencies, a detailed fixture leaf inventory for the marine subobject, each controlled changed-field list and unresolved dimensions. Unexamined nested candidate contracts remain explicitly unresolved; the matrix does **not** claim universal leaf-level equivalence.

SST range/orientation/transition/feature structures still require exact directional samples and the same assemblers. Current vector organization/relationship/pattern/projection/gradient/shear/convergence/edge must likewise be reproduced without approximation. Chlorophyll selection retains DIRECT/GAP_FILLED, age and provenance distinctions. Complete assembly for these families was not qualified after this STOP. The earlier 24-to-27 spatial diagnostic remains a regression, not this task's acceptance criterion.

Candidate bathymetry/static structure remains the existing governed boundary, without an observation timestamp. No new candidate identity or matching by label, rank or nearby location is introduced. Candidate/location and assessment substitution tests for a future assembler remain open.

No explicit raw mask/uncertainty arrays are read by the demonstrated marine assessor; this diagnostic establishes no new mask blocker. Full current environmental mapping remains unresolved and must not be populated with invented defaults. Marine source model labels also depend on raw `current_units` presence; those provenance fields remain explicitly unresolved rather than treated as decorative or fabricated from fixed labels.

Temporal authority remains separate:

- Product sample/observation times retain their existing product-specific represented-time semantics.
- Scientific assessment uses the locked request/scheduled context; no new assembly context is introduced here.
- Root/core quality time remains weather-first nullish marine-current time, independently of SST time.
- `lastUpdated` and snapshot `generatedAt` originate in `marine.retrievedAt`. They are not observation time; full snapshot metadata identity/replay semantics remain explicit outstanding work.
- Request timings/cache and Auth diagnostics are outside shared science. Acquisition outcomes remain captured; no acquisition timestamp is invented.

The prior exact quality-time/lineage qualification is preserved, including documentary warning authority. Full candidate lineage/spatial/history parity remains unqualified. No species eligibility, score, confidence, ranking or Opportunity-identity effect is claimed or tested as acceptance.

## STOP and next gate

The STOP is complete candidate input sufficiency. It does not revoke `CANDIDATE_ASSEMBLY_READY_TO_RESUME` as permission to investigate this next gate; it reports the result of that investigation.

Next qualify same-product frozen coverage of the six marine inputs and their consumed provenance, through separately reviewed companion coverage or an explicitly authorized capture amendment. Do not silently extend either locked v1. Then resume complete candidate-object comparison using the same assemblers and exact source/candidate/location/assessment binding.

`UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains open. No converter is repaired or approved. A zero versus absent wave period remains distinct in the current parser but is absent from both captures. No additional coercion is introduced here.

Synthetic fixtures establish mechanics and the insufficiency counterexample only. No live source authenticity, provider reliability, production freshness, source interchangeability or durable resolution is qualified. Archive and V3 remain unchanged with prior reference-only compatibility; no new candidate payload is claimed compatible.

## Scope and verification

Only a diagnostic test, field map and this report are added. No candidate assembler means complete-object Auth/captain independence, immutability, replay, source binding and identity are not newly established. No optional downstream species evaluation was run.

Verification: all 41 backend/shared scripts passed with network blocked; the final focused rerun passed 12 tests, including the added provenance test. Both locked captures remain green (96 current-product and 80 weather/marine tests), alongside all prior Task 12, Opportunity/governance, Task 11E, Frame/archive/scalar/Task 11B suites. Syntax passed for 73 modules. The JSON validates 30 root/context groups, 89 marine fixture leaves and six controlled input comparisons. New-file whitespace and `git diff --check` passed. Logs, the focused rerun record and exact diff are ignored local artifacts under `.local/ocean-quarantine/task12b6c-resumed/`.

Runtime, archive, V3, both captures, Task 12B.1, Task 11E, scientific formulas/thresholds, provider qualification and existing identities remain unchanged. Task 9E-D remains paused. No provider/database/Auth/Supabase access, environmental acquisition, commit, tag, push or deployment.
