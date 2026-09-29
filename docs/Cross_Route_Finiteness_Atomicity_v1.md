# Cross-route finiteness and failure atomicity v1

**SOURCE_NORMALIZATION_FINITE_SCOPE_REMAINS_INCOMPLETE**

Task 12B.7D, review only. Baseline: `codex/pelora-remote-setup`, HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`. No runtime or contract amendment is approved.

## New mandatory STOP

The current u/v routes have another finite-input → nonfinite-output condition after the guarded speed calculation. With both transport components equal to `Number.MAX_VALUE` (`1.7976931348623157e308`), the actual point parser retains finite u/v, returns null speed, returns direction 45°, and labels the source available. Actual current spatial assembly retains those components with null speed. Its production vector-projection consumer admits them based on component finiteness and computes `Math.hypot(u,v)`, which is Infinity. It rounds and publishes that magnitude without a post-arithmetic guard.

The resulting vector-projection object reports `available: true`, `coverage: complete`, `validProjectionCount: 4`, and `failedProjectionCount: 0`. All four `/projections/{index}/vectorMagnitudeMetersPerSecond` leaves are Infinity. Exact scientific JSON rejects the object.

This is reproduced with synthetic JSON through `getCurrentSpatialStructure` → `buildCurrentVectorProjectionAnalysis`, the same internal handoff used at `backend/server.js:60508`. No final vector object is fabricated; production code supplies directions, sample locations, component normalization and spatial assembly. The new fixture mocks only NOAA transport and an operational cache clock. Scientific assessment stays `2026-09-24T01:00:00Z`, with represented evidence `2026-09-24T00:00:00Z`. No live provider access occurs. These extreme numbers are valid JSON/finite JS inputs, not plausible ocean currents or claimed provider observations.

The source anchors are `getCurrentConditionsPointAtAssessment` around 2432–2539; `getCurrentSpatialStructureAtAssessment` around 2698–2829; `buildCurrentVectorProjectionAnalysis` at 3503, component guards around 3525, magnitude at 3585, output rounding around 3747, and admission/coverage at 3814 onward. Stable function/field identities are authoritative; line numbers are navigation metadata.

Section 32's additional-route STOP applies. Current u/v are two already-reviewed transport routes feeding this newly demonstrated derived representation; this is not an invented twenty-sixth transport field. Do not silently add an atomicity policy or approve the scope. The six known routes' complete consumer/admission qualification is **not finished**, and PASS is not claimed.

## Twenty-five-route arithmetic coverage

The companion JSON contains every original route ID, transport and output path, six targeted input observations per route (150 cases), and a compact per-route arithmetic graph. This is targeted numeric-safety coverage, not an exhaustive input-space proof or replacement for the original 450 transport-state cases.

| Route group | Count | Arithmetic / guards | Result and boundary |
|---|---:|---|---|
| Center and directional SST | 2 | Actual finite Celsius guard; `Number(((value*9)/5+32).toFixed(1))`; no output guard | ±1e308 → ±Infinity Fahrenheit; finite Celsius retained. Directional coverage excludes nonfinite Fahrenheit. |
| Wind speed/gust | 2 | `Number`, finite guard, multiply 1.94384, one decimal; no output guard | ±1e308 → ±Infinity knots. Original source speed units are not retained as an alternate normalized measurement. |
| Wave/swell height | 2 | `Number`, finite guard, multiply 3.28084, one decimal; no output guard | ±1e308 → ±Infinity feet. Original meters are not retained as an alternate normalized measurement. |
| Wind/wave/swell directions | 3 | `safeNumber` at parser; assessor reduces each direction modulo 360 before differences | Tested ±MAX_VALUE stays finite through assessor. Bounded differences avoid subtraction overflow in this actual marine path. |
| Wave/swell periods | 2 | `safeNumber`; downstream comparisons, no parser unit conversion | Extreme finite values remain finite; no new physical-range qualification. |
| Direct/gap-filled chlorophyll | 2 | `safeNumber`, four-decimal rounding, classification comparisons | Extreme finite concentrations remain finite in parser output. Direct and gap-filled identity remains separate. Later complete consumer closure is not qualified. |
| Current u/v | 2 | `safeNumber`, component rounding; squared magnitude → sqrt → knots guard; atan2 heading | Speed overflow becomes null. Finite components and finite heading survive. Downstream hypot overflow escapes projection with available/complete state: new STOP. |
| Provider latitude/longitude for five paths | 10 | Actual finite number and coordinate bounds; longitude >180 subtracts 360 | Bounds precede wrapping, so accepted wrapping cannot overflow. Extreme out-of-bounds values become null. Legacy SST fallback remains a separate gate. |

The six known overflow routes were independently rerun. No NaN was observed in these targeted normalized/assessor outputs. That observation is not a proof that every later arithmetic consumer is NaN-safe. `getCircularDirectionDifference` subtracts finite inputs before modulo, but current headings from `atan2` are bounded; the marine assessor uses its separate bounded-before-subtraction helper. Do not substitute arbitrary huge heading inputs to claim a reachable current-heading defect.

## Measurement groups and provisional atomicity findings

| Group | Required/independent/derived roles | Disposition at this STOP |
|---|---|---|
| SST | Celsius and Fahrenheit are required together for source-available capture; reviewed candidate projection also requires paired missingness. Cache admission reads Celsius while spatial science filters Fahrenheit. | `FAILURE_ATOMICITY_UNRESOLVED`: accepting nonfinite Fahrenheit is invalid; complete failure-state/consumer agreement remains unqualified. |
| Wind speed | Knots is the retained numeric scientific representation, not a second independently consumed raw m/s leaf. Speed, gust and direction are independent fields under the existing any-finite availability predicate. | `INDEPENDENT_COMPONENTS`: this does not approve retaining nonfinite speed or settle arithmetic-invalid diagnostic vocabulary. |
| Wind gust | Knots is the retained numeric representation; gust can support assessor evidence independently of speed. | `INDEPENDENT_COMPONENTS`; the null→zero defect remains separate. |
| Wave/swell height | Feet is the retained required height representation. Period and direction are separate measurements; an invalid height need not erase their source truth. | `INDEPENDENT_COMPONENTS`; height-based assessment requires valid height. |
| Directions/periods | Independent finite normalized values. Marine direction relationships and period labels derive from them. | `INDEPENDENT_COMPONENTS` for the reviewed parser/assessor boundary; no universal downstream qualification. |
| Chlorophyll direct/gap | One numeric concentration each; water classification is a derived descriptive category, not another numeric unit representation. | `ATOMIC_REJECT` for a nonfinite required concentration under existing available-source capture rules; no new public failure vocabulary approved. |
| Current vector | u/v are independent components jointly required for vector projection; speed is a derived norm, direction an atan2 derivation. Speed-based consumers and component-based consumers have different admissions. | `FAILURE_ATOMICITY_UNRESOLVED`: the speed guard is valid locally, but does not establish finiteness of other derived representations. |
| Strict provider coordinates | Independent bounded latitude/longitude facts, without granting authority to legacy fallback fields. | `INDEPENDENT_COMPONENTS`; no coordinate amendment. |

Current direction is finite 45° for the extreme equal-components case; `atan2` and degree conversion remain bounded. Squaring and summing can overflow even when both components are finite. `Math.hypot` avoids premature squaring overflow but still returns Infinity when the true norm exceeds binary64 capacity. No formula replacement is proposed.

The candidate invariant—verify every required numeric representation after creation before accepting the measurement—is supported as a safety objective. Which derivatives are required for which current scientific group is **not settled** by a scalar speed guard or a generic capture schema. No universal atomic group or runtime helper is selected.

## Underflow, rounding and source truth

Tests exercise ±`Number.MIN_VALUE`, +0 and -0 through all 25 routes. Rounding small values can yield signed zero; square/sqrt current magnitude can underflow to zero while finite direction remains. This is not automatically a defect and establishes no minimum-magnitude threshold. Existing `Number(value.toFixed(...))` can lose literal -0, while rounding a small negative value can produce -0. Existing current literal signed-zero component loss is explicitly preserved as old evidence, not called a successful fix. The locked future requirement remains `PRESERVE_SIGNED_ZERO`.

Rounding does not repair already nonfinite arithmetic: `Infinity.toFixed(...)` returns text that `Number` restores to Infinity. No independent finite-before-rounding → nonfinite-after-rounding case was demonstrated in the tested routes. Availability must not be inferred from mere input finiteness, and missingness must not be inferred retrospectively from numeric failure. Null coercion, malformed transport, arithmetic overflow and ordinary zero remain separate dimensions.

## Bounded consumer/admission findings

* Wind availability (`server.js:7416` onward) uses any finite speed/direction/gust. A family can remain available because another legitimate field survives; the infinite field itself does not satisfy that predicate.
* Quality assembly (`server.js:60658` onward) requires finite wind speed or finite wave/swell height for the corresponding live state. Infinite converted values do not independently satisfy those checks.
* `assessOceanConditions` guards speed/gust/heights with `Number.isFinite`; targeted actual-parser overflow objects produce assessor outputs without nonfinite leaves. An assessment may still be supported by other legitimate inputs. This does not establish a species/ranking consequence.
* SST cache/source status can admit finite Celsius when Fahrenheit is infinite. Directional aggregation rejects nonfinite Fahrenheit. Default Ocean Conditions retains raw normalized SST leaves. The previously recorded partial-representation risk remains.
* Current spatial aggregate filters require finite speed/heading/components, but retains original vectors. Vector projection separately uses component guards and can admit them despite null speed. This newly demonstrated mismatch blocks scope qualification.
* No complete six-route consumer inventory is claimed after the mandatory new-route STOP. Remaining snapshot, candidate and scalar/publication path closure is unresolved rather than assumed protected.

## Capture, serialization and historical boundaries

Current capture v1/v2, weather/marine quality captures and marine companion captures operate on normalized evidence, not raw transport truth. Their finite-or-null validation and the exact scientific serializer reject nonfinite numeric content; relevant suites are rerun. A later rejection is defense-in-depth, not upstream qualification. The new projection object is directly demonstrated to fail exact serialization.

Current available SST capture requires both numeric representations finite. An unavailable capture can represent finite Celsius with null Fahrenheit, whereas reviewed candidate projection v2 requires paired missingness. Thus capture schema permissiveness alone cannot authorize a failure policy. No successor is created.

The current capture source schema likewise requires finite u, v, speed and direction for `availability: available` (`currentEvidenceCapture.mjs`, `sourcePoint`). A component-available runtime point with null speed cannot be admitted as an available capture merely because the vector-projection consumer accepts its components. This is evidence of differing admission boundaries, not proof of the intended future atomic group.

Frame numeric validation and archive recursive numeric validation reject nonfinite values at those contract boundaries. Publication strict-copy validation also rejects nonfinite numbers. This does not prove every producer/scalar adapter reaches those guards before retaining, transforming or dropping an invalid value. Complete runtime admission remains unresolved under STOP. No historical database was inspected, and no historical record is reinterpreted or rewritten.

## Verdict and next gate

**SOURCE_NORMALIZATION_FINITE_SCOPE_REMAINS_INCOMPLETE.** The new current u/v → projection-magnitude finding takes precedence over a failure-state-only verdict. It does not authorize a producer formula change, threshold, convergence interpretation, capture change or downstream consumer change.

**Next gate: CURRENT VECTOR DERIVED-REPRESENTATION FINITENESS AND ADMISSION SCOPE REVIEW**, followed by renewed cross-route failure-atomicity review. Resolve the magnitude/admission contract and then finish the six known routes' consumer closure. No amendment candidate delta is approved because PASS conditions failed.

Numeric-string policy and provider-fill qualification remain OPEN. Legacy SST coordinate fallback remains a separate gate. Task 12B.6C and Task 9E-D remain PAUSED. Convergence/Ocean Physics remains separately paused; NOAA SME response remains pending per user context. No convergence function or Ocean Physics consumer was invoked by the new focused counterexample.

## Verification and preservation

The new seven-test suite covers all 25 routes and the new projection STOP. The companion JSON records arithmetic pipelines, observations, regression results and before/after hashes for all 101 pre-existing untracked files. Full backend/shared regressions run network-blocked except the quarantined projection-v3 test; rerunning old tests is not requalification of their failed authority proposals.

Final verification: all 70 executed test scripts passed, including the new seven-test suite, prior 12B.7C six-test suite, 12B.7B four-test STOP, 12B.7A ten-test/450-case suite, exact captures/serialization, SST/spatial, marine/quality, Frame/archive/scalar, Opportunity/governance and Task 11E coverage. All 135 JavaScript/module syntax checks and 68 JSON parses passed. New-file whitespace and `git diff --check` passed. All 101 prior untracked files remain byte-identical; status contains 105 untracked files and empty tracked/staged diffs. The exact additive diff is retained in the ignored task directory.

Only the new focused test, its new fixture, and these two documents are deliverable additions. Ignored working evidence is under `.local/ocean-quarantine/task12b7d/`. No production, helper, parser, normalizer, cache, capture, serializer, Frame/archive/publication or scientific formula was modified. No provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment occurred.
