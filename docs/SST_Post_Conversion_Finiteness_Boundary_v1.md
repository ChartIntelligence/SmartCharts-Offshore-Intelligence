# SST post-conversion finiteness boundary v1

**SOURCE_NORMALIZATION_AMENDMENT_SCOPE_STILL_INCOMPLETE** — Task 12B.7C. Review only, no implementation. Baseline branch `codex/pelora-remote-setup`, HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`.

The two SST routes reproduce finite-input/nonfinite-output behavior. Four of the other thirteen amendment routes independently reproduce it. The mandatory scope-expansion STOP applies. This report does not approve a fifteen-route amendment or silently amend the old candidate.

## SST routes and exact arithmetic

| Stable route | Production path and input | Normalized output | Availability / consumer |
|---|---|---|---|
| `marine:sea_surface_temperature` | `getMarineConditions`; Open-Meteo Marine `current.sea_surface_temperature` | `sst.temperatureCelsius`, `sst.temperatureFahrenheit` | Center return has no SST-specific source availability field. Default Ocean Conditions retains both leaves. |
| `sst:directional` | `getSeaSurfaceTemperaturePoint` through `getSstSpatialStructureAtAssessment`; same provider/field | `samples[].temperatureCelsius`, `samples[].temperatureFahrenheit` | Point availability uses Celsius nullness; spatial assembly separately checks finite Fahrenheit. |

Source anchors: `backend/server.js:848` (`celsiusToFahrenheit`), 6210–6260 (directional input/return), 7087–7130 (aggregation), 7520–7540 (center return), 61259 onward (default Ocean Conditions retention). Line numbers are navigation metadata; function/field identities define the reviewed routes.

The unchanged conversion is `Number(((value * 9) / 5 + 32).toFixed(1))`. Its guard rejects non-number/nonfinite input. Multiplication precedes division; one-decimal rounding follows arithmetic. There is no output-finiteness check. Center construction computes Fahrenheit and separately checks Celsius; directional construction first checks Celsius, then computes Fahrenheit. Both admit finite Celsius alongside infinite Fahrenheit into returned objects.

Synthetic JSON `1e308` produces finite Celsius `1e308` and Fahrenheit `Infinity`; `-1e308` produces `-Infinity`, through both actual parser chains. This is not a claim that real providers emit those temperatures. They are numeric-safety attacks, not physically valid temperature examples. No physical SST range or provider fill marker is inferred.

The directional result retains four source-available sample objects, but `Number.isFinite(sample.temperatureFahrenheit)` excludes all four from `validNeighborCount`. Coverage is insufficient, range is null. No usable-evidence, species-score or ranking impact is established.

## Binary64 boundary and controls

A deterministic binary search of ordered positive finite binary64 encodings finds adjacent inputs:

| Input | Binary64 bits | Existing conversion |
|---|---|---|
| `1.997436816513684e307` | `7fbc71c71c71c71b` | finite `3.595386269724631e307` |
| `1.9974368165136842e307` | `7fbc71c71c71c71c` | `Infinity` |

Negating those inputs gives the corresponding finite/negative-infinite boundary. These are arithmetic limits of the exact current operation order, not scientific acceptance thresholds. Reordering arithmetic to avoid overflow would change the formula implementation and is not proposed here.

Both actual routes retain 25°C → 77°F and 25.123°C → 77.2°F, with four valid directional neighbors. Celsius +0 and literal/computed -0 preserve their signs; both correctly convert to +32°F. Exact scientific serialization distinguishes the Celsius signs. Null, missing, numeric string, whitespace, array, object and internal NaN/±Infinity produce null Celsius/Fahrenheit in the tested routes. JSON cannot carry NaN/Infinity; those tests are explicitly internal-only. Numeric-string compatibility remains a separate open review.

## Atomicity and future contract boundary

Input finiteness does not imply output finiteness. A candidate future rule is: **every accepted numeric scientific representation must be finite after unchanged conversion and rounding, before availability/object publication**. This is validity governance, not new temperature science.

Do not add coercive parsing to SST: its current actual-number guard is already stricter than other families. Candidate order is existing transport shape/missingness handling → actual finite numeric input → unchanged arithmetic/rounding → finite output check → coherent accepted/unavailable representation and availability.

Atomicity is not identical across all schemas. Current evidence captures v1/v2 require both SST numeric fields finite when source availability is `available`. Both reject infinite Fahrenheit under any availability. They permit finite Celsius plus null Fahrenheit when availability is `unavailable`; the new tests verify that schema fact using explicitly constructed capture inputs, not claimed production outputs. Both-null unavailable is also representable. However, `candidateSemanticProjectionV2.mjs:106–110` requires paired missingness in its reviewed directional sample surface. Therefore capture permissiveness alone cannot authorize partial accepted SST or prove candidate compatibility. Paired nulls are a compatible candidate failure shape for that surface, but the precise future diagnostic treatment remains unapproved under this STOP.

An arithmetic-overflow rejection is not evidence that the provider returned null. Preserve that cause in review/diagnostic evidence; do not invent a public error enum or retrospectively relabel raw transport. Existing numeric null/unavailable shapes can represent lack of accepted numeric evidence. No capture successor is demonstrated necessary solely for paired nulls and consistent unavailable state; complete end-to-end compatibility remains to be reviewed.

## Partial-representation and consumer findings

| Consumer/boundary | Classification and evidence |
|---|---|
| `setCachedSstPoint`, server.js:6066 onward | `COULD_CONSUME_FINITE_CELSIUS_WITH_NONFINITE_FAHRENHEIT`: cache admission checks Celsius only and stores the normalized point. |
| Directional source status, server.js:6257 | `COULD_CONSUME_FINITE_CELSIUS_WITH_NONFINITE_FAHRENHEIT`: Celsius nullness determines point availability. |
| Directional aggregation, server.js:7087 onward | `PROTECTED_FROM_NONFINITE`: Fahrenheit finite filters determine coverage and aggregates. |
| Default Ocean Conditions SST construction, server.js:61259 onward | `COULD_CONSUME_NONFINITE` as representation/retention: nullish fallback retains Infinity. This is not proof of numerical scientific use. |
| Candidate projection v2 reviewed sample surface | `PROTECTED_FROM_NONFINITE`: finite-or-null checks plus paired missingness. |
| Current capture v1/v2 | `PROTECTED_FROM_NONFINITE`: rejection demonstrated; capture is a later qualification-only boundary, not parser validation. |
| Exact scientific JSON, `exactScientificEvidence.mjs:49` | `PROTECTED_FROM_NONFINITE`: rejects both infinities; preserves signed zero. |
| Frame numeric schema, `shared/oceanProductFrame.mjs:8`; archive copy, `shared/oceanProductArchive.mjs:21` | Reject nonfinite at their respective admission boundaries. Their presence does not establish that all runtime paths reach them before retaining malformed values. |
| All remaining SST readers, scalar adapters and runtime admission paths | `UNKNOWN` in this stopped scope review; no universal protection claim. |

This is a bounded inventory, not the requested complete consumer qualification. Scope expansion was demonstrated before that qualification could pass. Historical records valid under the reviewed rejecting capture/archive contracts cannot directly contain Infinity as an accepted number. No production database was inspected; whether bypasses or lossy JSON conversion ever occurred historically is unresolved. Do not rewrite records or infer raw transport from stored null/zero.

## Other thirteen routes: targeted arithmetic audit

All thirteen proposed measurement routes were exercised with positive and negative finite `1e308` via actual parsers and synthetic transport.

| Routes | Arithmetic | Result |
|---|---|---|
| Wind speed, wind gust | `Number((number * 1.94384).toFixed(1))`, server.js:816 | ±Infinity escapes converter into normalized knots. |
| Wave height, swell height | `Number((number * 3.28084).toFixed(1))`, server.js:832 | ±Infinity escapes converter into normalized feet. |
| Five wind/wave/swell direction or period routes | `safeNumber`; no parser unit arithmetic | Extreme finite number remains finite; no new range qualification. |
| Direct and gap-filled chlorophyll | `safeNumber`, four-decimal `toFixed`/Number | Extreme finite number remains finite. Product identity/availability science unchanged and not requalified. |
| Current u/v | Component rounding remains finite; `sqrt(u**2 + v**2)` overflows internally | Subsequent knots input guard rejects Infinity and returns null speed. Component-based source remains available; this is a partial derived-output state requiring explicit review, not an escaping nonfinite speed. |

For these paths `toFixed` passes an already infinite arithmetic result through as text that `Number` restores to Infinity. No independent rounding-only finite-to-infinite result was demonstrated. Extreme finite four-decimal rounding remains finite in the tested cases. Do not substitute `Math.hypot`, change thresholds, or alter formulas here.

Six demonstrated escaping routes are now enumerated: two SST routes plus wind speed, wind gust, wave height and swell height. Current magnitude overflow is separately recorded as guarded internal arithmetic. No additional chlorophyll/current convergence interpretation was performed.

## STOP, proposed scope review and unresolved items

No candidate-ledger delta is approved: section 29's SST-only pass condition was not met. The next review must explicitly address post-arithmetic/result validity across the six demonstrated routes and the current partial derived-output state, then return to full amendment adversarial review. Do not silently grow the old thirteen-route proposal.

**Next gate: CROSS-ROUTE POST-CONVERSION FINITENESS AND FAILURE-ATOMICITY AMENDMENT SCOPE REVIEW.**

Remaining blockers include complete SST consumer/admission mapping, failure atomicity and diagnostics, complete capture/candidate compatibility, numeric-string compatibility, provider-fill qualification and the separate legacy coordinate fallback gate. No implementation is authorized by this report.

## Verification and preservation

The companion JSON records exact test executions/results, numeric observations and SHA-256 before/after for all 98 pre-existing untracked artifacts. The new six-test suite is STOP evidence, not approval. Existing four-test STOP and ten-test/450-case normalization suites are rerun network-blocked, together with backend/shared regression scripts. The quarantined projection-v3 test is excluded and remains byte-identical; this is an explicit regression exception, not v3 qualification. Syntax, JSON and whitespace checks are recorded in the companion artifact.

Final verification: all 69 executed backend/shared test scripts exited successfully under the network blocker, including SST numeric/parser/spatial coverage, exact current capture v2 and exact serialization, Frame/archive/scalar, Opportunity/governance and earlier qualification/STOP suites. All 133 JavaScript/module syntax checks and 67 JSON parses passed. New-file whitespace and `git diff --check` passed. Git status has 101 untracked files (98 preserved plus three additions), with empty tracked and staged diffs.

Only the new test and these two reports are deliverable additions. Ignored logs reside in `.local/ocean-quarantine/task12b7c/`. Production, parsers, helpers, formulas, caches, captures, exact serializer, Frame, archive and publication remain unchanged. No historical evidence is reinterpreted. Original evidence, failed artifacts and quarantined drafts remain byte-identical.

Task 12B.6C and Task 9E-D remain paused. Convergence/Ocean Physics remains separately paused; NOAA SME response remains pending per supplied context. Numeric-string policy, provider fill and legacy coordinates remain open. No provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment occurred.
