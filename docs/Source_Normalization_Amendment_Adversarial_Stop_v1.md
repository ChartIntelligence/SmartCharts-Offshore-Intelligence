# Source normalization amendment adversarial STOP v1

**SOURCE_NORMALIZATION_AMENDMENT_SCOPE_INCOMPLETE**

Task 12B.7B final adversarial review, at branch `codex/pelora-remote-setup`, HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`. This is a falsification result, not implementation approval. The candidate and all earlier evidence remain unchanged.

## Counterexample and scope consequence

The candidate excludes two SST measurement routes from behavioral amendment, while requiring finite results after conversion. Its own SST compatibility caveat requires a separate scope decision if conversion overflow is demonstrated. That caveat is now triggered.

`backend/server.js:848`, `celsiusToFahrenheit`, validates that its input is a finite number, then evaluates `Number(((value * 9) / 5 + 32).toFixed(1))`. There is no result-finiteness guard. Both `getMarineConditions` and the directional SST point path use this conversion. The test enters those unchanged production paths through synthetic transport using the existing source-normalization fixture; it does not inject an Ocean Conditions callback or construct final scientific outputs.

| Route | Accepted JSON number | Celsius output | Fahrenheit output | Consequence |
|---|---|---|---|---|
| `marine:sea_surface_temperature` | `1e308` / `-1e308` | Same finite input | `Infinity` / `-Infinity` | Nonfinite converted leaf escapes parser |
| `sst:directional` | `1e308` / `-1e308` | Same finite input in four samples | `Infinity` / `-Infinity` in four samples | Sample source says available, but spatial aggregation excludes all four |

These are valid JSON numbers and finite JavaScript inputs, not JSON encodings of infinity. They are not plausible ocean temperatures. No assertion is made that a real provider emits them. The attack establishes a missing post-conversion guarantee at the parser boundary; it does not establish a species score impact or that nonfinite evidence passes downstream scientific gates. Directional `validNeighborCount` is zero, coverage is `insufficient`, and range is null. Existing downstream fail-closed filtering must be preserved.

The original 450-case matrix checks the Celsius leaf for these two SST routes and uses small finite values. Passing that matrix does not prove finiteness of the derived Fahrenheit leaf for all accepted finite inputs. The independently inspected Celsius-to-Fahrenheit dataflow supplies the counterexample; the amendment table was not used as executable truth.

## Controls and test meaning

The new four-test STOP suite covers both routes with positive and negative overflow inputs; ordinary 25°C → 77°F; null; missing; +0; literal -0; and computed -0. Celsius signs are preserved; the unchanged affine conversion legitimately maps either Celsius zero to 32°F. Existing synthetic JSON transport is used. No production normalizer, proposed helper, threshold, capture successor or formula is implemented.

Four STOP tests pass, meaning the omission is reproduced. The prior ten-test source normalization suite also passes, rerunning all 450 prior transport-state cases and its downstream comparisons under the network blocker. This is not a passing amendment qualification.

## Mandatory stop and unresolved review

The user's immediate STOP conditions apply: an unchanged SST route needs an explicit behavioral scope decision to satisfy the proposed finite-result contract. The 13-route amendment therefore cannot be declared minimal and complete. Do not silently add SST to it or replace shared helpers.

The full independent 25-route reconstruction, numeric-string provider compatibility decision, all unchanged-coordinate attacks, provider-fill decision, new capture-v2 compatibility attacks, cache/in-flight isolation qualification, publication binding and complete 450-case future expectation review are **not completed by this STOP review**. Prior candidate claims are not upgraded to qualified findings. The ten-test rerun preserves historical evidence; it does not resolve these design questions. Complete backend/shared regressions were not rerun after the mandated early STOP. No new source-normalization contract identifier is approved.

**Next gate: EXPLICIT SST POST-CONVERSION FINITENESS AMENDMENT SCOPE REVIEW, followed by renewed full adversarial amendment review.** Any future correction must preserve ordinary finite results, units, precision, signed Celsius zero, and existing fail-closed scientific consumers. This review neither chooses nor implements the correction.

## Preservation and boundaries

The companion JSON records SHA-256 before/after for all 95 pre-existing untracked files, including the candidate, failed artifacts and quarantined drafts. All remain byte-identical. Tracked production/index diffs are empty. Only this report, its companion JSON and the new STOP test are deliverable additions. Ignored local scratch evidence resides under `.local/ocean-quarantine/task12b7b-adversarial/`.

Task 12B.6C and Task 9E-D remain paused. Convergence/Ocean Physics remains separately paused; NOAA SME response is pending according to the supplied task context. No convergence/provider-question artifact was modified. No optionality, authority, freeze or projection-v3 work occurred. No provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment occurred.
