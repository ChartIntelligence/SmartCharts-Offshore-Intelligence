# Cross-route finiteness and failure atomicity — resumed v1

**SOURCE_NORMALIZATION_FINITE_SCOPE_REMAINS_INCOMPLETE**

Secondary finding: **CHLOROPHYLL_TEMPORAL_DERIVED_FINITENESS_REVIEW_REQUIRED**.

Task 12B.7D-R; HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`, branch `codex/pelora-remote-setup`. Qualification only. The qualified current-vector failure-locality contract is applied unchanged. It is **not** the remaining blocker.

## New bounded counterexample

Actual direct and gap-filled point parsers accept finite concentration endpoints `1e308` and `-1e308`. Their unchanged productivity and clarity leaf producers retain finite concentration and report available. With two chronological synthetic historical containers carrying those production-generated leaf facts, both `buildProductivityPersistence` and `buildClarityPersistence` calculate:

`last.concentrationMgM3 - first.concentrationMgM3 = -Infinity`

The resulting persistence contract still reports `available: true` and contains nonfinite `values.concentrationChangeMgM3`. Productivity is classified as decreasing context; clarity as increasing clarity context. `buildFeaturePersistenceContract` spreads `values` without recursively validating their numeric finiteness. Exact serialization rejects the resulting object later.

Each actual normalized concentration endpoint separately passes current capture v1 and v2 under synthetic source authority. This reinforces the distinction between finite source capture and finite downstream relationship science; it does not demonstrate production historical ingestion. Existing persistence no-history/insufficient-history branches can retain endpoint values while returning unavailable, but neither branch defines the cause or admission rule for failed subtraction with two chronological observations. That remaining boundary must not be disguised as missing history.

Source: `backend/server.js:33194`, `33683`, `33745`, `33870`, `34360`, and `23787`. The fixture executes verbatim leaf functions extracted from current source, with extraction hashes recorded. It does not call `assessOceanEvidence`, whose broader chain enters quarantined Ocean Physics. Historical containers are explicitly synthetic adapters, **not** acquired historical records or proof of default history/database/publication admission. No history-selection policy, species score, eligibility, ranking or convergence consequence is established.

This is a newly demonstrated consumer-arithmetic extension of the finite-input/nonfinite-output problem. The existing point classification alone cannot close it. The permitted relationship-failure state, all consumers of that temporal result, and default historical admission must be reviewed before a complete cross-route PASS. The current-vector contract must not silently be applied as a new chlorophyll temporal contract. No physical concentration range is invented.

## 25-route reconciliation

The JSON carries every original field/route, source path, parser, arithmetic graph, prior missingness finding and new numeric probes. All 25 received nine targeted controls: ±1e308, ±MAX_VALUE, ±MIN_VALUE, ±0 and ordinary 2 (225 route/state observations).

| Routes | Count | Final review disposition |
|---|---:|---|
| Marine SST; directional SST | 2 | POST_CONVERSION_FINITE_CHECK_REQUIRED |
| Wind speed/gust; wave/swell height | 4 | POST_CONVERSION_FINITE_CHECK_REQUIRED |
| Wind/wave/swell direction; wave/swell period | 5 | SAFE_FOR_FINITE_ACCEPTED_INPUT for reviewed marine arithmetic; source type/missingness defects remain separate |
| Direct/gap-filled chlorophyll | 2 | OTHER_REVIEW_REQUIRED: point rounding/classification safe, newly demonstrated temporal differences not qualified |
| Current u/v | 2 | DERIVED_RESULT_FINITE_CHECK_REQUIRED under the qualified locality contract; point norm-to-speed guard already fails closed |
| Latitude/longitude for marine/direct/gap/current/directional SST | 10 | FAILS_CLOSED_ALREADY at reviewed provider-coordinate normalizer; legacy fallback remains separate |

Thus 23 routes have a closed disposition at the reviewed boundary; two are explicitly blocked. This is not the requested complete-scope PASS. No route is omitted, and no previous failed artifact is overwritten.

## Arithmetic sites and guards

* `safeNumber` (`server.js:859`) preserves explicit null/undefined/empty string, otherwise coerces then checks finite. Its whitespace/array/boolean and numeric-string behavior is not qualified by arithmetic safety.
* `metersPerSecondToKnots` (`816`) coerces, checks input finite, multiplies by 1.94384, applies `toFixed(1)` and Number. No post-product finite check. Used separately for wind speed/gust and derived current speed.
* `metersToFeet` (`832`) similarly multiplies by 3.28084 and rounds to one decimal without output finite validation.
* `celsiusToFahrenheit` (`848`) requires an actual finite number, calculates `((C * 9) / 5 + 32)`, then one-decimal rounding. Multiplication can overflow before division. Both SST routes retain finite C with nonfinite F.
* Direct/gap chlorophyll (`2045`, `2168`) uses finite normalized concentration and `Number(toFixed(4))`; immediate classifications are comparisons, not amplifying arithmetic. Temporal concentration subtraction (`33683`, `34360`) is the newly open extension.
* Current (`2345`, `1493`, `3503`, `3947`) uses square/sum/sqrt, knots, atan2, modulo, rounding, hypot, projections, differences and separation division. Apply the existing detailed current ledger and qualified locality contract; no new whole-vector decision.
* Marine directions (`7861` onward) are independently reduced modulo 360 **before** subtraction. Opposing ±MAX_VALUE inputs produce finite comparisons. Current headings are bounded by the existing atan2/heading calculation before circular differences. No new direction range is introduced.
* Periods have no unit scaling: finite values feed threshold comparisons and assessor descriptions. No finite-input nonfinite result observed in these paths.
* `resolveProviderCoordinates` (`2036`) validates finite numeric geographic bounds before longitude wrap (`>180 ? value-360 : value`). Latitude is retained. These bounded operations are numerically safe; they do not qualify fallback authority.
* SST spatial admission (`6988`) filters finite Fahrenheit before counts/min/max/range; orientation (`6305`) guards opposing input differences and candidate magnitudes. Confidence (`6498`) uses guarded facts and bounded score/count arithmetic. The actual conversion's finite output magnitude is bounded by its earlier `C*9` step, so opposite accepted default outputs do not overflow the later Fahrenheit range subtraction. Mixed ±1e307 Celsius transport was exercised through actual directional assembly and produced finite derived values with sufficient coverage. This is a numeric bound, not an ocean-temperature validity range.

`toFixed` is decimal formatting, not a numeric safety guard: it can pass Infinity through to Number. No multiply-by-precision rounding helper is substituted. Underflow/rounding to zero is not automatically invalid. Existing literal -0 losses in rounded marine/current/chlorophyll representations remain visible; computed negative rounded zero can survive. Celsius ±0 remains signed with Fahrenheit 32. Exact v2 serialization preserves the sign it receives. No canonicalization or formula change occurs here.

No finite-input NaN was observed in the 225 probes, opposed marine-direction case, SST spatial extrema, or current controls. This is bounded to reviewed producers and accepted default transport geometry, not a theorem about arbitrary injected histories/coordinates. The new chlorophyll result is -Infinity, not NaN.

## Six conversion-route consumer/admission inventory

The JSON includes source occurrence indices and consumer classes. Occurrence search distinguishes production definitions/readers from fixtures and documentary copies. Quarantined projection-v3 drafts are not authority.

| Route | Scientific reads / representation boundaries | Current admission and required amendment |
|---|---|---|
| SST A: marine center | `classifySeaSurfaceTemperature`, `buildTemperatureEvidence`, center argument to spatial assembly, quality/status assembly, temperature transition feature/observation, change/persistence and candidate-adequacy readers; snapshot/capture/projection copies | Fahrenheit finite checks refuse overflow for numeric evidence; C may remain finite in returned/cached/copied objects. Paired representation must validate before accepted normalized sample construction. Higher-order interpretation is not executed. |
| SST B: directional | `setCachedSstPoint` reads C; spatial range/orientation/confidence read F; temperature map/feature footprint, change/history and adequacy read retained sample facts; exact capture and semantic projection | Cache currently admits finite C even with invalid F. Spatial valid-neighbor count becomes zero for overflow; raw samples retain nonfinite F and source available. Capture/projection reject invalid numerics. |
| Wind speed | `buildAssessmentConfidence`; `assessOceanConditions` wind and combined marine results; inline quality and response status; snapshot, quality capture and companion reconstruction | Assessor/confidence/quality use finite knots. Overflow is excluded; other wind fields can independently keep source family available. Null→0 can falsely satisfy speed/quality predicates. |
| Wind gust | Same marine assessor/confidence; any-finite wind source availability; companion capture/replay | Gust independent of speed. Overflow does not satisfy gust requirement; valid speed/direction may survive. Null gust can become valid-looking zero. Gust alone is not the inline wind quality speed predicate. |
| Wave height | Marine assessor/confidence/sea-state interaction; inline wave quality/status; quality capture and snapshot | Height must be finite to support height-dependent results. Valid direction/period remain independent. No normalized source-meter duplicate is retained. |
| Swell height | Marine assessor/confidence/sea-state interaction; inline swell quality/status; quality capture and snapshot | Same measurement-local converted-height rule, separately verified. Swell-specific thresholds remain unchanged. |

SST downstream occurrence inventory additionally records `buildSurfaceWaterCharacterAnalysis` as a quarantined interpretation boundary, not a requalification of its semantics. Broad downstream/candidate interpretation closure is not claimed by this STOP. The requested complete transitive consumer qualification is **not asserted**; the machine-readable inventory explicitly distinguishes reviewed admission, representation-only boundaries, and interpretation/history boundaries not requalified. There are no silent exclusions or full-closure PASS claims.

## Measurement groups and failure locality

**SST:** `REQUIRED_PAIRED_REPRESENTATIONS` for the normalized sample contract. Semantic projection v2 explicitly checks finite-or-null C/F and paired missingness (`backend/candidateSemanticProjectionV2.mjs:106–110`); available capture requires both finite. No independent default scientific Celsius-only consumer was found beyond caching/source-state/copying. A retained raw C is not authorization to publish an accepted paired sample with invalid F. Future conversion failure must not masquerade as provider missingness; failed representation and source provenance need truthful separation in the versioned amendment. This does not import current-vector partial validity into SST.

**Wind speed/gust:** Each transport m/s measurement is converted to knots; the original m/s is not retained in the normalized marine object. A failed knots representation cannot support speed/gust consumers. Speed, gust and direction are independently assessed; one invalid member does not erase unrelated valid members. Source wind availability is any-finite across these members and must not certify the failed member.

**Wave/swell heights:** Each normalized feet value is the required scientific representation of its height measurement. Failed conversion blocks height-dependent assessment/quality. Direction and period are independent family measurements with their own requirements. No height source value is silently substituted into a feet consumer.

**Directions/periods:** Retained finite primitive plus the assessor's bounded direction normalization/comparisons. Missing/invalid direction cannot support relationships; absent period may leave valid height assessment with period uncertainty under existing behavior. Existing finite validation/type coercion and future type-policy choices remain separate.

**Current:** Preserve admissible u/v source facts; speed null blocks speed-required results, not independently finite heading/projection. Invalid required projection/axis facts and dependent results fail; independent recomputation must validate all required intermediates, outputs, source/time/provenance and local coverage. Supplemental speed/heading differences remain optional for component gradients. Exact current capture's stricter all-four-finite available-state requirement remains binding. No redecision or change to the qualified contract.

**Chlorophyll:** Immediate source concentration and categorical leaf science are understood; new temporal concentration differences require further failure-locality/admission review. Do not silently discard the endpoint observations or approve the nonfinite relationship. The current-vector contract is not automatic authority for this temporal family.

## Availability, quality and assessor consequences

All four null-coercion routes still produce zero and can satisfy applicable finite-value predicates. The existing gust-only favorable-wind finding remains locked; it is not generalized into a speed-based quality claim. Legitimate numeric zero stays usable under current field contracts. Missing and overflow values do not become zero in the same way.

Controlled overflow probes produced no nonfinite marine-assessor or quality output. Speed/height-dependent quality does not classify Infinity as live. Other valid measurements can keep family/aggregate evidence available; this does not prove the failed measurement valid. The JSON records each null/zero/missing/overflow assessor result and complete/usable-with-gaps/degraded/insufficient layer consequences rather than claiming every family follows one rule. No species evaluation is used for severity.

SST's overflow samples remain source available by C-nullness and can be cached, but spatial coverage is insufficient and F-based temperature evidence unavailable. Current projection/gradient positive availability/coverage with bad numerics remains a documented future amendment target under the qualified locality contract. Newly tested chlorophyll persistence can report available with a nonfinite change; no default stored-history or ranking consequence is inferred.

## Two separate amendment invariants

1. **Source admission:** Missing or invalid transport must not gain numeric scientific authority through coercion. Numeric-string and provider-fill qualification are still open.
2. **Derived admission:** Every required numeric representation must be finite before it or dependent science is admitted. Required intermediate failure cannot be hidden by a finite final result. Valid independent source evidence may survive only under the family's established source/consumer contracts.

The recomputation wording is consistent with the qualified current-vector contract only when it includes dependency-specific validity and complete required arithmetic—not just a finite final scalar. These principles are supported requirements, not an approval of the incomplete full amendment.

## Captures, identities, replay and history

| Contract | Result |
|---|---|
| Current capture v1 | SCHEMA_COMPATIBLE for coherent finite/null normalized states; historical semantics immutable. Available source still requires all required fields finite. |
| Current capture v2 | Same schema restriction; exact signed-zero/null fidelity. No successor inherently required by the demonstrated corrected shapes. |
| Weather/marine quality v1/v2 | SCHEMA_COMPATIBLE for corrected null speed/height and existing provider status. Shape compatibility does not qualify source normalization. |
| Marine companion v1/v2 | SCHEMA_COMPATIBLE for corrected gust/direction/period states with coherent referenced quality and wind availability. No relaxation of source-state checks. |
| Normalization semantics | VERSION_BINDING_REQUIRED independently of capture schema. Exact wire placement/configuration completeness remains review work; no new fields inserted. |

Tests construct labelled corrected-shape diagnostics, not a corrected normalizer. They show null versus zero changes exact content and identity where content differs; replay reconstructs those normalized values. Existing schemas reject nonfinite content. v1 does not become signed-zero authority; v2 preserves exact signs. An available partial current point still cannot bypass capture validation by relabelling source availability.

Historical captured zero may have come from valid zero or prior null/malformed coercion: **HISTORICAL_AMBIGUITY_PRESERVED**. Replay must not rerun a new normalizer against old normalized evidence. Old bytes/digests/IDs and as-used scientific results stay unchanged. Frame, archive/scalar and publication strict numeric boundaries reject nonfinite content at their governed entry; earlier object retention does not establish successful publication or database admission.

Different corrected numeric content naturally changes exact content/reference identity. Unchanged finite content need not be numerically altered just to identify a new normalizer. The normalization method must be attributable through governed source/evaluator configuration and provenance identity; duplicate labels on every capture/Frame/publication are not automatically necessary. No publication/schema successor is approved. Exact binding location is a later configuration/version review, not something the current content hash can infer from transport missingness it never captured.

## Cache and in-flight isolation

* `currentPointCache` and `currentPointRequestsInFlight`: coordinate key `Number(latitude).toFixed(4),Number(longitude).toFixed(4)`; five-minute cache; normalized point stored if components finite, including possible speed null. In-flight promise can later populate the same cache. Assessment-relative age is recomputed separately; this does not correct old normalization.
* `sstPointCache` and `sstPointRequestsInFlight`: same coordinate-key pattern and five-minute TTL; normalized C/F point stored after finite-C admission, even when F failed. In-flight completion can populate a new consumer's cache namespace if not isolated.
* `getMarineConditions`, direct chlorophyll and gap-filled chlorophyll paths have no corresponding normalized point cache/dedup map in this default candidate path. One assessment still must not mix normalizer generations across its concurrent acquisitions.
* Scalar field service has separate product/bounds/density cache/in-flight and adapter metadata caches. It serves a separate field endpoint, not these default-provider 25 point routes. Do not amend it merely because its name is cache; review separately if a future shared helper actually changes its normalization.

Minimum requirement: bind the normalization generation at assessment execution and isolate affected cache **and in-flight** entries, or use a drained cold-process generation with no late old fills. Rollback must use its own generation. Existing keys have no normalization version. No cache was cleared or changed.

## Proposed amendment delta and gate

The JSON supplies A–I: source validation; post-conversion checks; derived-result checks; family dependency/locality; signed zero; availability/quality; normalization identity; cache/in-flight generation isolation; historical compatibility. It is a **partial proposed delta**, not an approved complete amendment. The six original overflow routes and all prior null/malformed defects remain in scope, with current derived recomputation requirements included.

New blocking work: qualify chlorophyll temporal concentration-change arithmetic, its dependent result admission/failure locality, and its actual historical integration boundary. Finish transitive consumer closure before claiming complete cross-route scope. No history-selection, scientific threshold, physical range or source-equivalence policy is reopened by the present diagnostic.

**Exact next gate: CHLOROPHYLL TEMPORAL DERIVED-FINITENESS AND DEPENDENCY-ADMISSION SCOPE REVIEW**, then resume cross-route completion. The requested complete-amendment adversarial gate is not reached. Numeric-string and provider-fill policy must be resolved before implementation can safely pass; SST coordinate fallback stays separate unless the amendment touches that boundary, in which case its qualification becomes a prerequisite. None is silently closed here.

An adversarial amendment review may inspect a candidate while those gates are open, but it must not return a complete readiness-for-implementation PASS until numeric-string compatibility and applicable provider-fill handling are resolved or explicitly qualified nonblocking per route. The separate coordinate-fallback gate may remain outside a strictly measurement-only amendment; any change to coordinate handling makes that gate a prerequisite as well. A numeric-safety PASS alone would not qualify full source normalization.

Task 12B.6C and Task 9E-D remain PAUSED. Convergence/Ocean Physics remains paused and untouched; NOAA SME response remains pending. No production changes, provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment. All work remains uncommitted.

## Final verification and preservation

11/11 resumed focused tests passed (225 targeted route/state probes), including the final capture-endpoint assertions. All **74 non-quarantined backend/shared regression scripts passed**. Prior focused counts were 11/8/20/7/6/4/10, retaining the 450-state normalization audit. Quarantined projection-v3 draft tests were excluded; their files were preserved. All 141 JS/MJS syntax checks and 72 JSON parses passed, along with source-reference, new-file whitespace and `git diff --check` checks. Final edited tests were syntax-checked and rerun. All **115 pre-existing untracked artifacts remain byte-identical**. No tracked or staged changes; 119 untracked files comprise the prior 115 plus four deliverables. Exact additive diff and Git status are recorded in ignored `.local/ocean-quarantine/task12b7dr/new-files.diff` and `git-status.txt`. The successful tests reproduce a STOP; they do not imply complete numeric-scope qualification.
