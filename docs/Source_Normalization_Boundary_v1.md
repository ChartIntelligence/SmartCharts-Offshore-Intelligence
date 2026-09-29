# Upstream source normalization scientific boundary v1

Task 12B.7A. HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`; branch `codex/pelora-remote-setup`.

**UPSTREAM_NORMALIZATION_MULTIPLE_DEFECTS_DEMONSTRATED.** Accepted synthetic JSON missing/malformed values become usable numeric evidence in unchanged production parsers. No production fix is made. Next gate: **VERSIONED SOURCE NORMALIZATION AMENDMENT REVIEW**. This is not complete normalization qualification.

## Scope and reproducible evidence

The [test suite](../backend/tests/sourceNormalizationBoundary.test.js) uses [new synthetic transport fixtures](../backend/tests/fixtures/sourceNormalizationFixture.mjs) and actual exported default-path parsers. `fetch` returns synthetic payloads; a network-blocking preload denies sockets and unmocked HTTP. No injected `oceanConditionsProvider`, live acquisition, species scoring, database or Auth execution is used. Source inspection covers the six environmental `fetchJson` sites in server.js: direct chlorophyll, gap-filled chlorophyll, current points, directional SST, weather and marine. The test calls the same parsers through faithful internal boundaries retaining their validation. It does not fabricate final scientific objects to prove parser reachability.

The [JSON ledger](Source_Normalization_Boundary_v1.json) records **25 numeric source/path entries**: 15 measurement routes (including separate center/directional SST and direct/gap-filled chlorophyll) plus 10 returned-coordinate entries. It contains **450 field/state rows**, with 18 states per entry, and separate static-normalizer results. The static helpers are not additional live environmental acquisition paths. No scenario-count target was used.

All requested numeric states are explicit. JSON-representable values are round-tripped through JSON parsing; a literal `-0` is preserved in the synthetic wire. Missing keys/columns are actually omitted. Undefined, NaN and infinities supplied as JS values are **INTERNAL_ONLY**, not falsely described as raw JSON literals. Benign accessor/prototype tests are also internal-only. Malformed JSON syntax would reject in `response.json()` before scientific parsing; it is not represented as an accepted JSON payload. Numerical JSON exponent overflow is not separately qualified by this matrix.

## Normalizer inventory and exact sites

| Source/input | Actual conversion | Missingness and downstream use |
|---|---|---|
| Open-Meteo wind speed/gust | `metersPerSecondToKnots`, server.js:816-826; calls at 7399/7410 vicinity | `Number(value)` precedes finite check, multiplication by 1.94384 and one-decimal rounding. Null/blank/empty array/false become zero. |
| Open-Meteo wave/swell height | `metersToFeet`, server.js:832-842; calls in `getMarineConditions` | Same coercion, factor 3.28084; finite check occurs after coercion but before multiplication/rounding. |
| Wind/wave/swell directions and wave/swell periods | `safeNumber`, server.js:859-873 | Null, undefined and exact empty string return null before conversion. Whitespace, arrays and Boolean values still convert numerically. No physical-range validation is established here. |
| Center/directional SST | `celsiusToFahrenheit`, server.js:845-856; center 7527 onward, directional 6210 onward | Celsius requires an actual finite number. Fahrenheit is computed only after that check. No numeric-string/object coercion. |
| Direct/gap chlorophyll | `getChlorophyllConditionsAtAssessment` / `getGapFilledChlorophyllConditionsAtAssessment`, 2045/2169 | Named column lookup, first row, `safeNumber`, four-decimal rounding. Separate source/product metadata remain intact. |
| Current u/v | `getCurrentConditionsPointAtAssessment`, 2345 | `safeNumber` components, speed/direction from pre-rounded values, four-decimal component rounding. Missing-vector speed is passed through the permissive knots converter. |
| Returned provider coordinates | `resolveProviderCoordinates`, 2036 | Actual finite number and bounds required; longitude greater than 180 is wrapped. Null/malformed values do not become governed map coordinates. |
| Directional SST legacy location | 6222-6235 | Separate `safeNumber(...) ?? requestedCoordinate` legacy fields coexist with strict `providerCoordinates`. Do not confuse fallback coordinates with provider truth. Full legacy-location consumer qualification is not claimed. |
| Static elevation | `normalizeBathymetryElevationV1`, `normalizeEtopoWaterMaskObservationV1` | Finite numbers/nonblank numeric strings for candidate elevation; ETOPO requires number, then rounds. Null/whitespace/objects reject. Static science is not redesigned. |

Exact function/field locations and the per-field transport/output paths are machine-readable. Helpers are not interchangeable: prior gust findings cannot establish direction, period or SST behavior.

## Demonstrated normalization results

| Field group | Explicit null | Missing/undefined | Whitespace / empty array | Literal negative zero |
|---|---|---|---|---|
| Wind speed, gust, wave height, swell height | Numeric 0 | Null | Numeric 0 | Rounded to positive zero |
| Directions and periods | Null | Null | Numeric 0 | Preserved by `safeNumber` |
| Center/directional Celsius SST | Null | Null | Null | Preserved in Celsius; Fahrenheit is 32 |
| Direct/gap chlorophyll | Null | Null | Numeric 0 | Four-decimal round produces positive zero |
| Current u/v components | Null | Null | Numeric 0 | Four-decimal round produces positive zero |
| Strict provider coordinate leaves | Null | Null | Null | Preserved within bounds |

Numeric zero is real evidence: zero current components are valid; zero wind/height denotes calm/zero magnitude rather than missingness; zero direction is a direction; zero Celsius is a finite temperature. Period zero is accepted by the parser, but this audit does not approve its physical validity. Negative finite speed/height/concentration acceptance is recorded, not newly sanctioned science. Numeric strings are accepted by permissive helpers and rejected for SST/strict coordinates. Plain objects and malformed strings fail finite checks; singleton numeric arrays and false can become finite numbers. Input NaN/infinities are rejected by the tested finite guards. This does not qualify every possible finite-overflow arithmetic case.

Rounding follows initial validation; converters do not revalidate every computed arithmetic result. Original `-0` may be lost in upstream `toFixed` conversion even though a small negative value rounded to zero can produce computed `-0`. Locked exact-capture behavior is unchanged and does not restore signs already lost upstream. All four current component zero-sign combinations were tested; components normalize to positive zero, while pre-rounding direction behavior is retained in the ledger.

## Scientific consequences

**Defect 1: null-to-zero conversion.** A null wind-speed input yields `speedKnots: 0`; null wave/swell heights yield `heightFeet: 0`. Under identical valid provider times and fulfilled outcomes, unchanged quality assembly marks the corresponding layer `live`, whereas an omitted field produces `unavailable`. Real numeric zero and null-derived zero have identical quality and marine-assessor results. The exact quality block is exercised by the existing source-extraction fixture, with fixed supporting families; no formula is copied or changed.

**Gust is different.** With all other wind fields absent, null gust produces `gustKnots: 0`, wind source availability `available`, and an assessor wind classification `favorable`. Omitted gust instead leaves no usable wind values. The wind quality layer is speed-based: a gust alone does not make that layer live. Assessor confidence separately records gust availability. This narrower distinction prevents overstating gust's effect.

**Defect 2: malformed-to-number conversion.** Whitespace/empty arrays are accepted JSON values. In direct and gap chlorophyll they become concentration zero, survive finite-observation selection and produce `resolveChlorophyllObservation.available: true`; null concentration yields no selected observation. In current components, malformed values become zero, satisfy vector availability with the other finite component and enter unchanged current vector projection. The tests record those actual scientific consequences without running convergence or species interpretation.

**Current null component nuance.** Null u/v remains null and source availability stays `no-valid-pixel`. However `speedMetersPerSecond = null` is passed to the knots helper and becomes speed zero, with a calm strength description. This does not by itself satisfy the current quality predicate, which also requires a finite direction. Do not equate fabricated speed alone with a fully available vector. An empty current table follows a different early return with null speed.

**SST.** Missing/malformed SST does not become finite temperature in the tested paths. Directional assembly retains missing samples and changes coverage; zero Celsius remains usable temperature. No SST formula or capture was changed.

**Provider sentinels.** The previously recorded current metadata fill `-214748.3648` passes the current parser as finite input; no explicit sentinel filtering exists in the inspected path. This is a parser limitation conditional on a raw sentinel reaching JSON: no live response was acquired to prove ERDDAP exposes rather than replaces it. The same finite value was used adversarially for chlorophyll, but is **not** asserted to be that product's fill value. Exact chlorophyll fill conventions remain unqualified without additional metadata evidence. Empty table, missing column, explicit null and request rejection remain distinguishable paths; no-valid-pixel is not itself a defect.

Field-level normalized outputs, availability, full quality/assessor comparisons and current/chlorophyll effects are retained in JSON. No species score, ranking, catch or biological consequence is inferred. The demonstrated species-neutral consequences already meet the task's defect standard.

## Time, metadata and object boundary

Non-numeric transport fields also participate: weather/marine `current.time`, ERDDAP time column, table structure/column names, optional `current_units` presence and provider request outcome. Marine `observedAt` chooses wind time then wave time; SST retains marine time; current/chlorophyll derive age under explicit assessment. These are documented context, not independently qualified timestamp contracts. Existing assessment/capture regressions remain relevant. Request coordinates are caller values; returned provider coordinates undergo the separate strict filter.

`fetchJson` checks HTTP success then calls `response.json()`; it does not impose a numeric schema. Internal benign getters are invoked and inherited numbers are read by ordinary parser property access. These are internal-object findings, not claims about accessor-bearing JSON or arbitrary provider callback injection. Added private top-level metadata was not copied into normalized output. This is a relevant narrow privacy test, not complete privacy qualification.

## Capture, replay, archive and publication

[Current capture v2](../backend/currentEvidenceCaptureV2.mjs), [quality capture v2](../backend/weatherMarineQualityCaptureV2.mjs) and [companion capture v2](../backend/marineAssessorCompanionCaptureV2.mjs) preserve normalized scientific inputs under their locked schemas, not a raw transport transcript. V1 historical schemas likewise operate on normalized inputs. The exact marine round-trip test captures a parser-produced null-derived gust zero and reproduces the assessor output exactly. **REPLAY_EQUIVALENT != SOURCE_NORMALIZATION_QUALIFIED.**

Capture fixtures are qualification-only, not proof these capture modules are integrated into every live archive. Existing records containing only normalized zeros cannot reveal whether the origin was real zero, null, blank or another accepted coercion. No archive/database was read, so this is a demonstrated information-loss possibility, not an assertion that a particular historical record is defective. Raw transport retained separately might resolve an individual case; the normalized number alone cannot.

[Publication identity](../shared/oceanPublication.mjs) binds supplied scientific content, evidence references and evaluation context. It authenticates that content's identity, not an absent original transport distinction. [Archive](../shared/oceanProductArchive.mjs) and [scalar delivery](../shared/oceanScalarFieldDelivery.mjs) contracts must not silently reinterpret historical evidence after a future normalization change.

## Amendment boundary and outstanding limits

Next gate is a separately reviewed **VERSIONED SOURCE NORMALIZATION AMENDMENT REVIEW**. Minimal proposed requirements: identify missingness before numeric conversion; explicitly govern accepted numeric transport types; retain real zero and relevant signed zero; reject nonfinite inputs/results; preserve units, source availability and source-time semantics; address sentinel handling only with product-specific evidence. No shared helper, new range threshold or runtime policy is selected here.

Review versioning implications for current captures v1/v2, weather/marine quality v1/v2, companion v1/v2, candidate reconstruction fixtures/evaluator identity, archive/scalar replay and publication evidence identity. A schema need not automatically change when normalization changes, but changed scientific semantics require explicit provenance/version separation and compatibility review. Old captures must replay under their original semantics; no historical zero may be silently relabeled missing.

Blocking limits: normalization is not qualified; exact fill exposure/product conventions, exhaustive arithmetic overflow and legacy SST fallback-coordinate consumption are not closed. The requested state matrix is complete for the inventoried fields, not a proof over arbitrary JS objects or all finite magnitudes. `OTHER_REVIEW_REQUIRED` in the state taxonomy includes ordinary accepted finite/nonzero cases because the supplied classification list has no general finite-value category; row notes distinguish those from scientific defects. Zero magnitude preservation and sign preservation are recorded separately.

## Verification and preservation

The JSON records focused tests, backend/shared script results, syntax/JSON/whitespace checks and SHA-256 before/after hashes for all **89 pre-existing untracked files**. Only four new deliverables are created: two test files and these two reports. Tracked production and staged diffs remain empty. Quarantined projection-v3 tests are excluded from execution; draft artifacts are never imported. No convergence science/provider-question artifact is modified, and Ocean Physics qualification is not resumed.

Task 12B.6C and Task 9E-D remain PAUSED. NOAA response is pending externally, per user; this task neither contacted NOAA nor checked the response. Existing convergence/product uncertainty verdicts remain unchanged. `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` now has demonstrated defects requiring amendment review; it is not closed as qualified.

No environmental acquisition, provider/database/Auth/Supabase access, staging, commit, tag, push or deployment. Leave Task 12B.7A UNCOMMITTED for adversarial review.
