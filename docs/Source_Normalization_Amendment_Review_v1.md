# Versioned source normalization amendment review v1

Task 12B.7B; HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`; branch `codex/pelora-remote-setup`.

**SOURCE_NORMALIZATION_AMENDMENT_CANDIDATE_REQUIRES_ADVERSARIAL_REVIEW.** The entering defect verdict is retained. This document recommends a bounded contract, not an implemented normalizer, runtime release, capture amendment or scientific authority freeze. The next gate is adversarial review of this amendment candidate, followed by separately authorized implementation qualification. Production is unchanged.

## Evidence and scope

Primary evidence is [12B.7A](Source_Normalization_Boundary_v1.md), its [450-row ledger](Source_Normalization_Boundary_v1.json), and the unchanged [tests](../backend/tests/sourceNormalizationBoundary.test.js) and [fixture](../backend/tests/fixtures/sourceNormalizationFixture.mjs). Current converter, parser, quality, capture and cache source was reread. The [amendment ledger](Source_Normalization_Amendment_Review_v1.json) carries all 25 original route IDs and definitions, their current outcomes, proposed policies and all 450 future comparison cases. No source finding is inferred merely from a desired fix.

Thirteen measurement routes require amendment: nine weather/marine values, direct and gap-filled chlorophyll, and two current components. Two SST measurement routes require compatibility review only for demonstrated states. Ten strict provider-coordinate routes require no behavioral change. The legacy directional SST fallback outputs are a separate gate, not additional silently qualified routes. Static bathymetry normalization is outside the measurement amendment and must not change incidentally.

## Recommended scientific-number contract

**INVALID OR MISSING TRANSPORT MUST NOT GAIN SCIENTIFIC AUTHORITY THROUGH NUMERIC COERCION. VALID NUMERIC ZERO REMAINS EVIDENCE WHERE THE EXISTING FIELD CONTRACT PERMITS IT. PRESERVE_SIGNED_ZERO.**

Recommended primitive policy for the reviewed environmental JSON routes is **JSON_NUMBER_ONLY**: an own data field containing an actual finite number. No repository/provider contract reviewed here requires numeric strings. Existing `Number` acceptance is not sufficient authority for them. Thus numeric-string rejection is an explicit proposed compatibility change, not a claim that every historical numeric string was defective. If documented string support is established during review, specify that provider's lexical grammar and version the exception before implementation. Whitespace, empty strings, arrays, objects and booleans are never numbers for this contract. Do not change the separately documented static bathymetry numeric-string policy.

An internal ordinary-object entry must inspect own property descriptors without executing a getter, inherited value, `valueOf` or `toJSON`. This is a proposed defensive read boundary, not a claim that JSON carries accessors. Check array row indices and column mappings as well as object keys. No new general security subsystem is proposed.

Required order:

1. Establish own field presence and permissible source shape without coercion.
2. Recognize explicit null, absent/undefined and documented provider missing markers before arithmetic. Retain the transport reason in the acquisition/diagnostic evidence where available.
3. Apply the provider's approved primitive policy; no general JavaScript conversion.
4. Validate finiteness and any already-governed field domain. If a documented sentinel is numeric, recognize it before unit conversion; if textual, before any approved parsing.
5. Apply unchanged unit conversion and existing rounding precision.
6. Validate the computed result is finite; preserve legitimate literal and computed negative zero at sign-preserving transformations.
7. Supply the normalized numeric value or existing family null/unavailable outcome to unchanged science.

Do not add new physical ranges for speed, height, period or concentration. Their current finite checks do not establish scientifically approved minima/maxima. Coordinates already have explicit bounds/wrapping and SST has a strict numeric type guard. Direction normalization inside the assessor is downstream science, not permission to invent new parser limits.

Signed zero is preserved where the operation should preserve it: identity, positive scale and rounding. Preserve computed negative zero from a small negative value. Do not force Celsius `-0` to Fahrenheit `-0`: the existing affine formula correctly yields 32. Do not change current heading's signed-zero inputs or recompute it from rounded components; speed magnitude is nonnegative. Literal sign restoration during rounding is a versioned representation correction, not a new precision/formula. Finite-value results otherwise remain exact, not tolerance-equivalent.

## Family outcomes

| Family/field | Proposed normalized input semantics | Existing consumers retained |
|---|---|---|
| Wind speed/gust | Null, absent, undefined, disallowed primitive or nonfinite becomes null; finite numbers retain the knots factor 1.94384 and one decimal, with zero-sign preservation. | Wind source availability uses any valid speed/direction/gust; quality is speed-based. Gust alone must not make speed quality live. |
| Wind direction | Same strict input policy, degrees unchanged; real zero and signed zero retained. | Directional assessment; do not change angular formulas. |
| Wave/swell height | Same missing/type policy; meters-to-feet factor 3.28084 and one decimal unchanged. | Height-based live quality and marine assessment consume valid normalized height only. |
| Wave/swell direction and period | Same strict input policy; degrees/seconds unchanged. | Existing direction/period interpretation unchanged; accepting numeric zero does not newly validate its physical meaning for every period. |
| Center/directional SST | Preserve tested strict behavior and Celsius signed zero; Fahrenheit affine formula/precision unchanged. | Compatibility review only for matrix states. Post-conversion overflow must be tested; a discovered nonfinite result needs an explicit finite-result guard amendment, not silent shared-helper refactoring. |
| Direct chlorophyll | Reject malformed primitives before four-decimal normalization. Retain valid zero and sign. | Existing observation selection, source availability and quality operate on valid concentration. |
| Gap-filled chlorophyll | Same primitive rule but separate product/provenance and source outcome handling. | No DIRECT/GAP_FILLED equivalence or ranking change. |
| Current u/v | Each component must independently be a valid finite number; preserve signs and four-decimal component precision. | Existing pre-rounding speed/heading formulas, vector requirement and time governance remain. |
| Strict provider coordinates | No change to existing actual-number, geographic bounds and wrapping behavior. | No new source-location authority. |

Missing transport key and explicit null remain distinct input reasons. Both may map to an existing null numeric leaf because that means no numeric scientific evidence; neither maps to zero. The existing captures cannot independently preserve those raw reasons in a numeric leaf. Do not claim transport fidelity or add required capture keys to solve that distinction in this task.

For weather/marine, malformed values map to null, not a fabricated request failure. Existing fulfilled-with-no-values wind states remain `provider-returned-null` or `provider-returned-no-current-data` according to the actual block shape; provider rejection remains `provider-request-failed`. Existing quality maps missing speed/height to unavailable and request failures to degraded. Both provider requests failing still throws through existing behavior. Unchanged assessor must see missing as missing and real calm/zero height as zero; no threshold is changed. No new promise that the overall assessor will always say unavailable is made: remaining legitimate evidence can still support its existing output.

For chlorophyll/current, malformed scalar values map to null and the existing `no-valid-pixel` path. Empty table stays an empty-result path; rejected acquisition stays rejected and the caller retains its existing unavailable handling. Do not relabel a fulfilled malformed value as an HTTP error. Current availability requires both valid components. Chlorophyll finite-observation selection must never receive a number manufactured from a blank or array.

### Missing-vector derived speed

Current `hasVector=false` leads to a null intermediate magnitude, then the generic knots converter manufactures zero. This is not a meaningful zero-speed calculation. A local implementation may retain incidental scratch values only if they cannot escape as governed evidence. Recommended normalized `speedKnots` and heading are **null when the vector is invalid**, with existing unavailable source state; a partial valid component need not be erased. This needs a validity guard, not a new speed/heading formula. The existing direction-based quality guard already prevents some upgrades, but does not justify publishing zero speed/calm derived descriptors as source truth. Recompute dependent descriptors through their existing null paths and record the expected content difference.

### Fill values and legacy coordinates

**PROVIDER_FILL_QUALIFICATION_REQUIRED** remains for exact source-marker exposure, especially finite numeric markers. The demonstrated null/type amendment may proceed independently, explicitly without claiming complete product normalization qualification. Do not guess chlorophyll sentinels or assume a current sentinel reaches JSON. No future input is advertised as fully product-qualified until applicable fill semantics are cleared.

Legacy SST `resolvedLatitude/Longitude` uses permissive `safeNumber` with requested-coordinate fallback while `providerCoordinates` is strict. Source reads around server.js:11016 retain those legacy locations in spatial sample evidence, and reads around 24135 validate/use them in feature-related sample construction. Therefore this is **SEPARATE_GATE**, not proven operational/nonblocking science. The bounded measurement amendment can leave it unchanged only by avoiding global `safeNumber` replacement. Any implementation touching those paths stops for coordinate-authority review. The ten audited strict coordinate routes remain unchanged.

## Implementation structure and version boundary

Prefer **family-specific normalization using a shared primitive validation contract** (option B), without choosing or implementing a helper now. Universally safe work is own-data-property reading, explicit missingness, approved primitive type, finiteness and sign preservation. Family code owns units, rounding, domain rules, source markers, time and availability. A repository-wide change to `safeNumber`, `metersPerSecondToKnots` or `metersToFeet` is not the minimum safe scope: these helpers also have derived/internal callers. Audit the call graph and separate transport from internal arithmetic before selecting code structure.

Explicit normalization semantics versioning is required. Proposed review identifier: **`pelora-default-source-normalization-v1`**, the first explicit default-provider normalization contract, not a capture successor. It is a candidate identifier only. Legacy execution remains identified by its historical build/captured provenance; do not retroactively assign a new normalization version to unknown old records.

Bind one approved normalization descriptor/version to an evaluation's source acquisition plan before requests or cache lookups. The descriptor must enumerate family policies, unchanged SST/coordinate policies and algorithm build. Existing authority/lineage reference slots can bind a descriptor reference; publication configuration version/governance reference can bind the evaluation configuration. This is structurally possible, not already enforced. The implementation plan must prove mandatory version propagation and rejection of unversioned/mismatched live cache entries without inventing new capture authority statuses. Runtime capture integration remains separately governed.

No hidden module-wide toggle may switch semantics while an assessment is in flight. All parser results, shared promises and normalized caches used in one assessment must belong to its selected descriptor. Cold deployment/draining the old process generation is a possible atomic boundary; hot migration requires explicit versioned caches and in-flight isolation. Do not silently combine old wind with corrected waves. Unchanged families may share numerical semantics, but their membership in the versioned bundle must be explicit.

## Capture/schema and identity impact

| Contract | Schema compatibility | Semantic/version consequence |
|---|---|---|
| Current evidence capture v1/v2 | Numeric leaves accept null; required keys must still exist. `available` requires finite family values, so availability must change consistently with null outputs. | No successor required solely for corrected values. V1 historical wire cannot supply exact signed-zero authority; v2 is required for new exact-sign assertions. |
| Weather/marine quality v1/v2 | Null speed/height supported; provider-status consistency checks remain. | Corrected truth changes valid normalized input, not the capture algorithm. |
| Marine companion v1/v2 | Null gust/direction/period supported; availability must match any finite wind fields and the associated quality capture. | Rebuild the quality reference before companion capture; do not reuse the old reference. |
| Temporal primitives | No numeric-time policy change proposed. | Existing assessment/source-time contracts remain; no clock fallback or automatic version bump. |
| Candidate projections v1/v2 | No new path/shape authority proposed; comparison utilities do not authenticate normalization. | Retain locked definitions; corrected missingness may reveal an existing authority/shape limitation. Stop rather than broadening projections. |
| Archive/scalar/reconstruction | Existing valid values/states and exact capture references remain representable. | Old evidence replays as used. New normalized data gets new references where content differs; admission/provenance integration requires review. |
| Publication V3 | Existing configuration, governance/evaluator labels and evidence references can bind the changed semantics. | No schema amendment demonstrated necessary. Version binding must be explicit; keep the existing evaluator-version suffix rules. |

Current exact capture v2 delegates schema validation to v1 while preserving exact numeric serialization. A missing transport field should emit an existing required numeric key with null; literally removing a required capture key is **not** schema-compatible. Schema probes in the JSON use constructed normalized fixtures only to test representability; they are not a corrected parser or runtime-reachability proof.

When normalized payload changes from zero to null, scientific-content digest (where that contract exposes one), capture ID and reference digest change; dependent companion/publication identities change when those changed references/content are included. Companion v1 exposes capture/reference identity, not a separate scientific-content digest. Null and zero are distinct representations. Exact v2 also distinguishes signed zero. Publication's general JSON canonicalization is not independently an exact signed-zero encoder: sign-sensitive changes must be bound through exact capture references, not assumed protected by a direct numeric publication leaf.

For identical normalized values under two normalization versions, scientific-content digests may remain identical because they intentionally exclude source authority/lineage. Capture IDs/reference digests must differ when their bound normalization lineage differs; publication configuration/reference identity must also distinguish the approved version. Do not require gratuitous scientific-value differences to encode provenance. Do not claim those bindings already exist today.

## History, caches and rollback

**HISTORICAL_SOURCE_MISSINGNESS_AMBIGUOUS** applies to affected normalized-only records whose raw origin cannot be established. Zero alone cannot distinguish true zero from null/blank/array coercion. This is not a claim every old zero is false. No stored record was queried or rewritten. Historical publications retain the evidence and identities actually used; replay must not run old normalized data through a new transport normalizer.

Current point caches store normalized returns, not raw transport; in-flight maps share promises resolving those returns (server.js:2544 onward). SST point caches likewise store normalized points (6892 onward). Keys are coordinate-based and do not encode normalization version. Age reassessment does not repair old numeric coercion. The future migration must invalidate/isolate both stored entries and in-flight completions; merely clearing a map while an old request can refill it is insufficient. No cache is cleared now. No dedicated weather/chlorophyll cache was found in this default acquisition path; future upstream/downstream cache integration still needs version enforcement.

Persistence contracts can carry normalized evidence/references, although current capture modules are qualification-only and do not prove a live persistence route. Treat unknown-version persisted normalized data as historical/unqualified for corrected live acquisition, unless an explicit compatible provenance proof exists. Do not manufacture transport truth from it. Rollback restores the previous executable/configuration generation with its own cache namespace and preserves all old/new evidence IDs. A rollback must not relabel corrected captures as legacy or resume known defective science silently; operational release policy must govern that decision.

## Exact implementation qualification plan

Carry all **450** original state rows forward as immutable old-behavior goldens. Add a proposed-output expectation to each; do not replace the old fixture or make the old tests assert the corrected runtime. Add literal/computed `-0`, all current zero-sign pairs, JSON exponent overflow, finite conversion overflow, fill-policy fixtures once qualified, empty/rejected results, accessor/inheritance rejection, partial availability, concurrent versioned cache hits/misses and stale in-flight completion tests. No hypothetical new normalizer is implemented in this task.

Comparison categories:

- **EXPECTED_FIX:** demonstrated null/malformed coercions; invalid-vector derived numeric/descriptor output; proposed numeric-string rejection is explicitly labeled a new type-policy restriction; preservation of literal zero sign where old conversion lost it.
- **EXPECTED_UNCHANGED:** valid finite results, legitimate zero magnitude, already-preserved signed zero, strict SST/coordinates, units, precision, family source labels and existing source-time rules. For affine/magnitude operations compare the governed formula, not the input sign blindly.
- **EXPECTED_IDENTITY_CHANGE:** changed normalized payload and all dependent references. Same payload with different version lineage has different provenance identity, not necessarily a different scientific-value digest.
- **HISTORICAL_AMBIGUITY:** normalized-only old zeros; retain bytes/identity and explicit uncertainty.
- **BLOCKING_MISMATCH:** any unplanned scientific difference or absent version linkage.

Golden suites must separately retain direct/gap-filled provenance, null versus omitted transport, real zeros, unavailable/no-valid-pixel/rejected states, exact captures, reconstruction and as-used replay. Compare species-neutral quality/assessor effects first. No species thresholds or formulas may be changed to accommodate missing evidence. Existing full regressions must run network-blocked during implementation qualification.

Future implementation stops if valid zero becomes missing; exact sign is lost; units/precision/formulas or valid finite results unexpectedly change; missingness becomes usable; capture states cannot be represented; cache/in-flight generations mix; required normalization provenance is absent; historical bytes/IDs change; a shared-helper edit reaches unreviewed legacy coordinate paths; or species formulas must change merely to accept corrected missingness. Unqualified provider fills and new arithmetic edge findings cannot be silently called resolved.

## Decision and preservation

Recommend adversarial approval of the bounded strict-type/missingness contract and identity/migration plan before an implementation task. Proposed task scope: amend only the reviewed transport adapters plus necessary invalid-vector output guard and normalization-version/cache binding; preserve formulas and existing capture schemas; implement the complete expectation matrix and prove old/new evidence separation. SST overflow or legacy coordinate behavior requires an explicit scope decision if encountered. No runtime authorization is implied by this document.

All 93 pre-existing untracked artifacts are preserved by before/after SHA-256; tracked production and staging remain unchanged. Only these new review documents are deliverables. No normalization helper/parser/capture implementation was created. Convergence/provider questions and Ocean Physics remain untouched; NOAA response is pending externally per user. Task 12B.6C and Task 9E-D remain PAUSED. No provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment.

Verification: 10 constructed-input schema checks pass. Six network-blocked existing suites pass: normalization 10, exact marine 152, historical current capture 96, historical quality 80, historical companion 108, exact scientific evidence 160 (606 tests total). No complete backend rerun was needed for this documentation-only review; the prior run is not relabeled as a new one. JSON, reference, ledger-completeness, whitespace, preservation and Git checks are recorded in the accompanying ledger. Leave this amendment candidate uncommitted for adversarial review.
