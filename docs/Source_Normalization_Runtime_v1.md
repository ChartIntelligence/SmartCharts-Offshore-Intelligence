> Latest narrow repair: **SOURCE_NORMALIZATION_RUNTIME_V1_READY_FOR_CHECKPOINT_REVIEW**. See the live exact-handoff section; earlier verdicts below are historical.

> Latest review: **SOURCE_NORMALIZATION_RUNTIME_V1_REQUIRES_CORRECTION**. See the final adversarial section below; earlier readiness verdicts are historical.

> Latest controlled repair: **SOURCE_NORMALIZATION_RUNTIME_V1_READY_FOR_FINAL_ADVERSARIAL_REVIEW**; **CURRENT_RUNTIME_PROFILE_PASS**. Earlier implementation/adversarial findings are retained below as history.

> Latest adversarial review: **SOURCE_NORMALIZATION_IMPLEMENTATION_REQUIRES_CORRECTION**; **REGRESSION_REMAINS_RED**. Earlier implementation findings below are retained; see the appended ADVERSARIAL REVIEW.

# Source normalization runtime v1 — implementation review

**CAPTURE_SCHEMA_SUCCESSOR_REVIEW_REQUIRED**

The approved normalization-version decision is implemented. This uncommitted candidate is **not end-to-end qualified**: existing exact current capture contracts reject an available partial point, and the full regression did not pass. No capture successor was created.

Starting/final HEAD: `e85924db075f75fc2d5b493c13561af36e7981a4`, branch `codex/pelora-remote-setup`. No commit, tag, push or deployment.

## Prior STOP retained

The preceding diagnostic returned `NORMALIZATION_VERSION_BINDING_DECISION_REQUIRED` before code edits. Its findings remain valid: current and directional SST caches hold normalized values; cache hits bypass normalization; shared in-flight promises return those same interpreted results. Module-local cold caches do not establish process-independent version compatibility. The human has now selected explicit version-bound identities, resolving that decision without approving the earlier amendment wholesale. The JSON retains the prior cache, source, behavior, capture and verification findings and the original report digests. Historical tests and protected evidence remain unchanged.

## Changes and authority

- [server.js](../backend/server.js): guarded transport conversion, paired SST conversion validity, current derivation-local finiteness, truthful speed-required quality reason, and versioned current/SST cache keys.
- [sourceNormalization.mjs](../backend/sourceNormalization.mjs): stable `pelora-source-normalization-v1` processing identity, guarded numeric conversion/rounding, and an existing-shape capture lineage reference.
- [sourceNormalizationRuntime.test.js](../backend/tests/sourceNormalizationRuntime.test.js): focused runtime, consumer, cache/in-flight and capture assertions. No preserved test was edited.

The user-approved core invariants and [qualified current-vector locality contract](Current_Vector_Failure_Locality_Contract_v1.md) support the changes. The later [resumed cross-route review](Cross_Route_Finiteness_Atomicity_Resumed_v1.md) supplies the required SST C/F-pair boundary; failed earlier proposals are not adopted as authority. Units, formulas and rounding precision remain unchanged.

Null, undefined, absent fields and malformed structures remain unavailable instead of being coerced into measurements. Numeric +0/-0 survive sign-preserving normalization. Actual-number SST keeps its strict typing. Existing route-specific string acceptance, including legacy blank strings, is characterized and unchanged. Source finiteness does not authorize a nonfinite conversion or derivative.

Current u/v remain independently preserved when speed fails. A failed required projection or axis bundle is unavailable and omitted from valid coverage. Independently finite projection may still succeed from valid source components even when the original squared-speed calculation overflows. Optional speed/heading comparisons do not become new prerequisites. No new enum or convergence science was introduced.

## Cache and in-flight boundary

| Reviewed cache/path | Disposition | Result |
|---|---|---|
| Current point cache and in-flight map | VERSION_BOUND_REQUIRED | Same version-prefixed coordinate identity for lookup, write and shared promise |
| Directional SST point cache and in-flight map | VERSION_BOUND_REQUIRED | Same separation; no unversioned fallback or migration |
| Marine/center SST and direct/gap chlorophyll acquisition | UNAFFECTED | No dedicated normalized-result cache in these reviewed paths |
| Field service grid cache/in-flight and ERDDAP latest-time cache | UNAFFECTED | Separate pipeline/time lookup, not the changed 15-route result cache |

TTL remains 300 seconds; capacity, eviction and provider/fetch behavior remain unchanged. Tests seed old-version and unversioned entries/promises in the actual cache-function fixture, prove isolation, same-version reuse, exact expiry boundary and cold starts. No correctness reliance on process restart.

## Capture gate

Existing exact lineage references can carry processing version and descriptor digest: tested current capture identity changes while its scientific digest does not. Weather-quality and companion captures also accept that reference and corrected missingness. Historical captures are not relabelled. This is bounded **EXISTING_PROVENANCE_STRUCTURE_SUFFICIENT** evidence, not automatic production persistence integration; the reference is exported and no live exact-capture call site was added.

An available current point with valid u/v and null failed speed is still rejected by existing exact current capture contracts. Source availability must not be rewritten to evade that restriction. Consequently the requested faithful end-to-end partial-point capture requires **CAPTURE_SCHEMA_SUCCESSOR_REVIEW_REQUIRED**. No new field, schema, snapshot identity or successor was invented; legacy snapshot integration is not qualified by this patch.

## All 25 routes

Implementation status below means local code plus focused assertions, **not completed runtime qualification**. The JSON retains provider fields, parsers, conversions, representations, consumers and previous findings.

| Route | Disposition | Current boundary |
|---|---|---|
| `marine:wind_speed_10m` | IMPLEMENTED_PENDING_CAPTURE_AND_REGRESSION_REVIEW | Null/missing/malformed source rejected; knots conversion finite-checked; signed zero retained; speed-based quality cannot regain a rejected value. |
| `marine:wind_gusts_10m` | IMPLEMENTED_PENDING_CAPTURE_AND_REGRESSION_REVIEW | Null/missing/malformed gust rejected; finite knots required; null-only gust no longer supplies available wind to the assessor. |
| `marine:wind_direction_10m` | IMPLEMENTED_PENDING_CAPTURE_AND_REGRESSION_REVIEW | Malformed structures rejected while existing string policy remains; unavailable direction stays unavailable in directional comparisons. |
| `marine:wave_height` | IMPLEMENTED_PENDING_CAPTURE_AND_REGRESSION_REVIEW | Null/malformed height rejected; finite feet required; missing height stays unavailable to quality/assessment. |
| `marine:wave_direction` | IMPLEMENTED_PENDING_CAPTURE_AND_REGRESSION_REVIEW | Malformed direction rejected; immediate directional comparison matches the missing-value result. |
| `marine:wave_period` | IMPLEMENTED_PENDING_CAPTURE_AND_REGRESSION_REVIEW | Malformed period rejected; immediate quality/assessor results match missing input. |
| `marine:swell_wave_height` | IMPLEMENTED_PENDING_CAPTURE_AND_REGRESSION_REVIEW | Null/malformed height rejected; finite feet required; sibling fields retained. |
| `marine:swell_wave_direction` | IMPLEMENTED_PENDING_CAPTURE_AND_REGRESSION_REVIEW | Malformed direction rejected; immediate directional comparison matches missing input. |
| `marine:swell_wave_period` | IMPLEMENTED_PENDING_CAPTURE_AND_REGRESSION_REVIEW | Malformed period rejected; immediate quality/assessor results match missing input. |
| `marine:sea_surface_temperature` | IMPLEMENTED_PENDING_CAPTURE_AND_REGRESSION_REVIEW | Strict numeric input retained; failed Fahrenheit conversion rejects the required normalized C/F pair; other marine facts survive. |
| `direct:chlor_a` | IMPLEMENTED_PENDING_CAPTURE_AND_REGRESSION_REVIEW | Malformed structures rejected before rounding/selection; signed zero preserved; temporal persistence arithmetic unchanged. |
| `gap:chlor_a` | IMPLEMENTED_PENDING_CAPTURE_AND_REGRESSION_REVIEW | Same guarded numeric boundary in its separate gap-filled product; product/provenance authority unchanged. |
| `current:u_current` | IMPLEMENTED_PENDING_CAPTURE_AND_REGRESSION_REVIEW | Malformed u rejected; legitimate signed zero retained; valid u survives independent speed failure; projection/axis failure handled locally. |
| `current:v_current` | IMPLEMENTED_PENDING_CAPTURE_AND_REGRESSION_REVIEW | Malformed v rejected; legitimate signed zero retained; valid v survives independent speed failure; projection/axis failure handled locally. |
| `sst:directional` | IMPLEMENTED_PENDING_CAPTURE_AND_REGRESSION_REVIEW | Strict source typing retained; required normalized C/F pair unavailable after conversion overflow; version-bound cache/in-flight identity. |
| `marine:latitude` | ALREADY_COMPLIANT | Strict finite provider-coordinate leaf unchanged; no provider qualification or legacy fallback policy inferred. |
| `marine:longitude` | ALREADY_COMPLIANT | Strict finite provider-coordinate leaf unchanged; no provider qualification or legacy fallback policy inferred. |
| `direct:latitude` | ALREADY_COMPLIANT | Strict finite provider-coordinate leaf unchanged; no provider qualification or legacy fallback policy inferred. |
| `direct:longitude` | ALREADY_COMPLIANT | Strict finite provider-coordinate leaf unchanged; no provider qualification or legacy fallback policy inferred. |
| `gap:latitude` | ALREADY_COMPLIANT | Strict finite provider-coordinate leaf unchanged; no provider qualification or legacy fallback policy inferred. |
| `gap:longitude` | ALREADY_COMPLIANT | Strict finite provider-coordinate leaf unchanged; no provider qualification or legacy fallback policy inferred. |
| `current:latitude` | ALREADY_COMPLIANT | Strict finite provider-coordinate leaf unchanged; no provider qualification or legacy fallback policy inferred. |
| `current:longitude` | ALREADY_COMPLIANT | Strict finite provider-coordinate leaf unchanged; no provider qualification or legacy fallback policy inferred. |
| `sst:latitude` | ALREADY_COMPLIANT | Strict finite provider-coordinate leaf unchanged; no provider qualification or legacy fallback policy inferred. |
| `sst:longitude` | ALREADY_COMPLIANT | Strict finite provider-coordinate leaf unchanged; no provider qualification or legacy fallback policy inferred. |

## Verification

Focused suite: **13 passed, 0 failed, 0 skipped**. It covers missingness and malformed values across 15 measurement routes, signed zero, conversion overflow, unchanged strings, immediate marine quality/assessor equivalence to missing values, chlorophyll selection, current failure locality and capture limits.

Full isolated regression: **85 intended, 85 started, 85 processes exited, 84 completed normally, 65 passed scripts, 20 nonzero exits (including 1 abort)**. V3 is excluded. Completed node:test reports: **2033 passed, 48 failed, 0 skipped**; two separately counted manual suites report **50 cases passed**. Other custom scripts report PASS without an invented case count. Aborted output is not counted as a completed test suite. **Full regression FAILED.**

The JSON lists every intended result and failing test title. Failures include preserved assertions for former null-to-zero/nonfinite/signed-zero behavior, frozen source hashes/closure inventories/byte offsets, and a heap-allocation abort in snapshotBranchOptionality. They remain failures; preservation status does not turn them into a pass. No protected test or historical artifact was edited.

Isolation used a new private-index native checkout with 1,964 committed files verified, then exact runtime/test overlays. The approved private npm configuration suppressed update notifier, lifecycle scripts, audit and funding. All 28 cache packages matched committed integrity; 1,423 tracked dependency files matched, and only absent polyfill 0.5.1/jsbi 4.3.2 package content (48 files) was overlaid. Eight approved retained fixture inputs and approved scratch paths were verified. No provider acquisition occurred.

Approved denial SHA-256: `a7c4d834d772ce1ba06d853cc0dc9675ee80bcfb3848dd3de1b7ecf4d737d7ca`. Independent monitor SHA-256: `4ed0cd7cb728f0c1c2fae2afa70e3f0fe6ad2a339bf45da9de7e818dbc339e3a`. Materialization, closure, focused and full instrumentation recorded **0 operational network attempts**. Nine deliberate denial probes were separate calibration, all blocked. V3 was neither imported nor executed; the only remaining test references read its bytes for preservation checks.

Syntax checks passed for the two production files and new test. JSON parsing and literal evidence/source targets were checked; runtime imports were exercised natively. Tracked diff whitespace check is clean. One focused invocation failed at the Windows loader before test execution, then the corrected file-URL invocation passed. No claim of unbroken first-attempt success is made.

## Preservation and scope

24824 prior file-ledger entries were examined (server.js is the authorized change); **0 other mismatches**. All **177 protected hashes** match. **15363 real dependency files**, existing manifests/lockfiles and the excluded Supabase pair remain byte-identical. Git configuration and HEAD are unchanged; real index remains empty. Temporary execution environments were removed, with logs and receipts retained outside the repository at `C:\Users\User\AppData\Local\Temp\pelora-normalization-runtime-4ed338755f1847d4837d91dd3125bd96`.

No changes to species habitat science, opportunity gates, ranking/confidence formulas, convergence/Ocean Physics, historical/product temporal policy, frontend, Auth or Supabase. The complete prescribed regression includes historical scientific fixtures, but no new species qualification is claimed. Numeric strings, provider fills, SST coordinate fallbacks and chlorophyll temporal arithmetic remain open. 12B.6C and 9E-D remain paused.

Change scope: two production files (one new), one new focused test, and updates to this existing uncommitted documentation pair. The Supabase pair remains untracked and untouched. No staging, commit, tag, push, deployment, provider/database/Auth/Supabase access or environmental acquisition.

**Next gate:** adversarial review of the candidate, a separate exact partial-current capture successor decision, and approved treatment of frozen historical tests versus changed-runtime regression. Do not regenerate protected evidence or edit its tests to manufacture PASS. Stop for review.


## ADVERSARIAL REVIEW — 2026-09-29

Primary verdict: **SOURCE_NORMALIZATION_IMPLEMENTATION_REQUIRES_CORRECTION**. Separate regression verdict: **REGRESSION_REMAINS_RED**. The implementation findings above are retained as history, not replaced or requalified. This review changed no production, schema, serializer, protected test or historical evidence bytes.

### Confirmed implementation defect and provenance gap

**R1 — center SST rereads an unvalidated value.** Actual `getMarineConditions` computes Fahrenheit from one `sea_surface_temperature` getter read, then emits Celsius from another read without its own finiteness check. A synthetic response object returns 25 then Infinity: candidate output is 77 F and Infinity C; the frozen HEAD control emits 77 F and null C. This is a demonstrated internal parser-boundary regression. Native provider JSON cannot encode getters; no live provider exploit is claimed. Controlled repair should bind the source value once and validate the value emitted with the conversion. No repair was made. The new adversarial test intentionally remains failing.

**R2 — cache version is not persisted provenance.** `pelora-source-normalization-v1` isolates the reviewed current/directional SST caches and in-flight maps. The exported processing reference is optional and supplied by tests, not integrated into a live exact-capture persistence call site. Verdict: **CAPTURE_PROVENANCE_BINDING_REQUIRED**. Existing `lineageReferences` can bind processing version/digest, change capture identity and leave scientific-content digest unchanged. No new schema is demonstrated necessary for provenance alone. Historical evidence must not be relabelled.

Every changed production block was assessed separately:

| Block | Assessment | Authority / limitation |
| --- | --- | --- |
| Shared numeric helpers/import | WITHIN_AUTHORITY | Core missingness/type/finiteness and signed-zero requirements; route-specific strings unchanged |
| Source-normalization version, descriptor and reference | PARTIAL_IMPLEMENTATION | Cache identity approved; exported reference is not automatic capture/persistence binding |
| Current/SST cache key functions | WITHIN_AUTHORITY | Explicit human version decision; TTL/capacity/eviction/fetch/rejection cleanup unchanged |
| Knots/feet/Fahrenheit converters | WITHIN_AUTHORITY | Established units/formulas unchanged; empty-string and whitespace compatibility retained |
| Direct/gap chlorophyll parse and rounding | WITHIN_AUTHORITY | No finite sentinel policy, classification thresholds or temporal arithmetic changed |
| Current u/v parse and rounding | WITHIN_AUTHORITY_CAPTURE_BLOCKED | Qualified locality requires component preservation but explicitly retains all-four-finite available capture restriction |
| Current projection guard and rounding | WITHIN_AUTHORITY | Qualified required-group definition; copied nullable speed/heading remain optional |
| Current axis guard, rounding and summary rounding | WITHIN_AUTHORITY | Positive separation already rounded to two decimals by nauticalMilesBetween; added three-decimal positivity check is redundant, not a new effective threshold. Sub-resolution control retains invalid-axis-separation |
| Directional SST point pair | WITHIN_AUTHORITY | Later resumed cross-route boundary; separate coordinate fallback untouched |
| Marine wind/direction/period values and center SST pair | IMPLEMENTATION_INCOMPLETE | Stable ordinary JSON payloads match authority. Changing getter returns Infinity on second read and violates finite normalized C invariant; confirmed against frozen HEAD |
| Current inline quality reason | WITHIN_AUTHORITY | Locality contract explicitly requires truthful derived cause; no quality/confidence formula or enum change |

### Partial current: what is actually known

Reproduced source point: finite u = 1e200, finite v = 1, direction = 90, speedKnots = null, source.availability = available. The existing square/sum/sqrt speed derivation overflows. Component facts survive; speed-dependent spatial/evidence/quality groups fail closed. Independent Math.hypot-based projection and finite axis arithmetic may still succeed. Their validity does not prove source temporal/provider authority or complete aggregate coverage. There is no universal flag equating source-component, derived-speed and whole-observation availability.

### Existing capture expressibility and minimum successor boundary

Reviewed `pelora-governed-current-evidence-capture-v1` and `pelora-governed-current-evidence-capture-v2`, `currentEvidenceCapture.mjs`, `currentEvidenceCaptureV2.mjs`, exact serialization/reference/replay and immediate consumers. Although the closed CURRENTS profile permits nullable numeric fields generally, `source.availability=available` requires speed, heading, u and v all finite. V2 delegates to V1 admission before exact digest/serialization. Both reject the truthful available partial point.

| Representation | Validation | Semantic disposition |
| --- | --- | --- |
| FULFILLED, available, finite u/v, speed null | REJECTED | TRUTHFUL_SOURCE_STATE_NOT_ADMISSIBLE |
| unavailable/no-valid-pixel/provider-unavailable/request-failed with same u/v/speed | ACCEPTED | REJECTED_WORKAROUND: changes the source state; locality contract prohibits relabelling |
| Omit speed/add derivation field/change authority or lineage | REJECTED | Neither authority nor lineage overrides closed required-group validation |
| REJECTED with null point | ACCEPTED | REJECTED_WORKAROUND: loses independently valid source components and changes acquisition outcome |
| available with invented speed 0 | ACCEPTED | REJECTED_WORKAROUND: invents a valid derived measurement |

Verdict: **EXISTING_CAPTURE_SCHEMA_CANNOT_EXPRESS_PARTIAL_CURRENT**. For faithful partial-point persistence: **CAPTURE_VERSION_SUCCESSOR_REQUIRED_FOR_PARTIAL_POINT_PERSISTENCE**. The locality contract itself does not mandate persistence or a successor and retains existing capture restrictions. If partial persistence is required, minimum capability is retaining valid components while truthfully distinguishing failed/unavailable speed and binding the derivation cause. A new field is **not yet established necessary**; nullable-speed admission plus versioned semantics and a bound cause/reference are candidates, not an approved design. Relaxing validation under the same version would violate existing all-four-finite interpretation and old-reader compatibility.

| Consumer | Finding |
| --- | --- |
| currentEvidenceCapture*.mjs validators/serializers/replay/reference | Reject original partial shape; preserve accepted diagnostic nulls; validation and reference identity remain version-bound. |
| server.js current cache/spatial vectors | Cache retains finite u/v; speed-required validVectors requires speed/direction/u/v, so partial point is excluded from that coverage. |
| server.js buildCurrentVectorProjectionAnalysis/buildCurrentGradientAnalysis | Independent finite components may produce valid projection/axis despite missing speed; single projection does not imply complete aggregate coverage. Source/time governance remains caller responsibility. |
| server.js buildCurrentEvidence and inline quality | Speed/heading finite checks guard availability; quality rejects missing speed and has a truthful derived reason. |
| server.js historical speed comparison and current history filtering | Finite checks retain null/omit invalid speed rather than coerce to zero; no history policy change or historical requalification. |
| exact reconstruction fixtures and captured references | Validate capture/version/digest before replay. A future partial successor requires explicit reader/consumer admission; no automatic compatibility claimed. |

Accepted diagnostic unavailable-source shapes replay null speed without defaulting to zero, but cannot substitute for the original source-available state. Exact V2 preserves -0; historical canonical V1 wire loses it. Neither schema nor historical bytes were altered. A future successor needs explicit reader, identity, coverage and consumer admission review; validation success alone grants no scientific qualification.

### Regression failure triage

All 19 previously assertion-failing scripts reproduced all 48 first failing assertions/cases: **38 EXPECTED_OLD_BEHAVIOR_ASSERTION**, **10 EXPECTED_FROZEN_SOURCE_BOUNDARY_ASSERTION**. None of these 48 establishes a reason to revert the qualified fixes. This does not mean all assertions after each first thrown failure were reached or passed. The JSON contains every assertion title/location, expected/actual excerpt, responsible path, authority and disposition, with raw-log hashes. The separate newly added getter assertion is one REAL_IMPLEMENTATION_REGRESSION.

| Previously failing script | Failures | Classification |
| --- | --- | --- |
| backend/tests/cacheIsolatedSnapshotProducer.test.js | 2 | EXPECTED_FROZEN_SOURCE_BOUNDARY_ASSERTION |
| backend/tests/crossRouteFinitenessAtomicity.test.js | 3 | EXPECTED_OLD_BEHAVIOR_ASSERTION |
| backend/tests/crossRouteFinitenessAtomicityResumed.test.js | 2 | EXPECTED_OLD_BEHAVIOR_ASSERTION |
| backend/tests/currentVectorDerivedFiniteness.test.js | 7 | EXPECTED_OLD_BEHAVIOR_ASSERTION |
| backend/tests/currentVectorFailureContract.test.js | 3 | EXPECTED_OLD_BEHAVIOR_ASSERTION |
| backend/tests/currentVectorFailureLocalityContract.test.js | 3 | EXPECTED_OLD_BEHAVIOR_ASSERTION |
| backend/tests/defaultProviderTransitive.test.js | 1 | EXPECTED_FROZEN_SOURCE_BOUNDARY_ASSERTION |
| backend/tests/exactMarineCapture.test.js | 1 | EXPECTED_OLD_BEHAVIOR_ASSERTION |
| backend/tests/exactScientificEvidence.test.js | 1 | EXPECTED_FROZEN_SOURCE_BOUNDARY_ASSERTION |
| backend/tests/marineAssessorCompanionCapture.test.js | 1 | EXPECTED_OLD_BEHAVIOR_ASSERTION |
| backend/tests/revisedSemanticModel.test.js | 1 | EXPECTED_FROZEN_SOURCE_BOUNDARY_ASSERTION |
| backend/tests/signedZeroQualification.test.js | 4 | EXPECTED_OLD_BEHAVIOR_ASSERTION |
| backend/tests/snapshotBranchOptionalityAdversarial.test.js | 2 | EXPECTED_FROZEN_SOURCE_BOUNDARY_ASSERTION |
| backend/tests/snapshotProducerQualificationV2.test.js | 1 | EXPECTED_FROZEN_SOURCE_BOUNDARY_ASSERTION |
| backend/tests/sourceNormalizationAmendmentAdversarial.test.js | 2 | EXPECTED_OLD_BEHAVIOR_ASSERTION |
| backend/tests/sourceNormalizationBoundary.test.js | 6 | EXPECTED_OLD_BEHAVIOR_ASSERTION |
| backend/tests/sstPostConversionFiniteness.test.js | 4 | EXPECTED_OLD_BEHAVIOR_ASSERTION |
| backend/tests/transitiveProducerBoundary.test.js | 2 | EXPECTED_FROZEN_SOURCE_BOUNDARY_ASSERTION |
| backend/tests/weatherMarineQualityCapture.test.js | 2 | EXPECTED_OLD_BEHAVIOR_ASSERTION |

No protected test should be edited merely to get green. Frozen source digests, inventory counts and source positions are historical boundaries; old null coercion, nonfinite availability and signed-zero-loss assertions are historical defect characterizations. The locality suite mixes qualified normative controls with historical-violation controls: its three red cases describe defects that the candidate now rejects. Preserve the distinctions rather than excluding the whole suite.

Proposed governance, not enacted: keep immutable historical-characterization/source-boundary tests against a pinned historical implementation/fixture lane; add current-runtime/normative assertions alongside them in a current-runtime lane. Human approval is needed for that execution-governance change. No protected test was rewritten or automatically dropped.

### Independent heap investigation

`snapshotBranchOptionality.test.js` ran in a fresh isolated process before other review suites. It did not complete. Private committed memory reached **29,688,303,616 bytes**, peak working set **7,885,819,904 bytes**; the owned process was explicitly terminated for resource exhaustion (exit -1). No memory limit was raised. An initial observer Int32 overflow was corrected to Int64 while observing the same child, not by restarting it or increasing its limit. The original prior run had a natural heap abort; this review reproduces standalone resource exhaustion, not another natural abort.

Verdict: **ISOLATED_RESOURCE_EXHAUSTION_REPRODUCED_CAUSE_UNRESOLVED**. Preceding-script accumulation is not necessary. In-script retained rows/coverage/mock history and environment allocation pressure remain hypotheses. No completed same-resource historical control exists, so neither a normalization memory regression nor pre-existing behavior is established. Next step is bounded resource diagnosis with frozen/candidate controls, not higher memory limits.

### 25-route implementation audit

| Route | Review disposition | Scope |
| --- | --- | --- |
| marine:wind_speed_10m | IMPLEMENTATION_MATCHES_AUTHORITY | Core numeric boundary only; open string/fill/history policies unchanged |
| marine:wind_gusts_10m | IMPLEMENTATION_MATCHES_AUTHORITY | Core numeric boundary only; open string/fill/history policies unchanged |
| marine:wind_direction_10m | IMPLEMENTATION_MATCHES_AUTHORITY | Core numeric boundary only; open string/fill/history policies unchanged |
| marine:wave_height | IMPLEMENTATION_MATCHES_AUTHORITY | Core numeric boundary only; open string/fill/history policies unchanged |
| marine:wave_direction | IMPLEMENTATION_MATCHES_AUTHORITY | Core numeric boundary only; open string/fill/history policies unchanged |
| marine:wave_period | IMPLEMENTATION_MATCHES_AUTHORITY | Core numeric boundary only; open string/fill/history policies unchanged |
| marine:swell_wave_height | IMPLEMENTATION_MATCHES_AUTHORITY | Core numeric boundary only; open string/fill/history policies unchanged |
| marine:swell_wave_direction | IMPLEMENTATION_MATCHES_AUTHORITY | Core numeric boundary only; open string/fill/history policies unchanged |
| marine:swell_wave_period | IMPLEMENTATION_MATCHES_AUTHORITY | Core numeric boundary only; open string/fill/history policies unchanged |
| marine:sea_surface_temperature | IMPLEMENTATION_INCOMPLETE | Internal changing-getter failure; ordinary JSON route guards correct |
| direct:chlor_a | IMPLEMENTATION_MATCHES_AUTHORITY | Core numeric boundary only; open string/fill/history policies unchanged |
| gap:chlor_a | IMPLEMENTATION_MATCHES_AUTHORITY | Core numeric boundary only; open string/fill/history policies unchanged |
| current:u_current | BLOCKED_BY_CAPTURE | Qualified runtime source/derived locality supported; faithful available-partial capture not expressible |
| current:v_current | BLOCKED_BY_CAPTURE | Qualified runtime source/derived locality supported; faithful available-partial capture not expressible |
| sst:directional | IMPLEMENTATION_MATCHES_AUTHORITY | Core numeric boundary only; open string/fill/history policies unchanged |
| marine:latitude | ALREADY_COMPLIANT | Strict provider-coordinate leaf; legacy fallback policy remains outside scope |
| marine:longitude | ALREADY_COMPLIANT | Strict provider-coordinate leaf; legacy fallback policy remains outside scope |
| direct:latitude | ALREADY_COMPLIANT | Strict provider-coordinate leaf; legacy fallback policy remains outside scope |
| direct:longitude | ALREADY_COMPLIANT | Strict provider-coordinate leaf; legacy fallback policy remains outside scope |
| gap:latitude | ALREADY_COMPLIANT | Strict provider-coordinate leaf; legacy fallback policy remains outside scope |
| gap:longitude | ALREADY_COMPLIANT | Strict provider-coordinate leaf; legacy fallback policy remains outside scope |
| current:latitude | ALREADY_COMPLIANT | Strict provider-coordinate leaf; legacy fallback policy remains outside scope |
| current:longitude | ALREADY_COMPLIANT | Strict provider-coordinate leaf; legacy fallback policy remains outside scope |
| sst:latitude | ALREADY_COMPLIANT | Strict provider-coordinate leaf; legacy fallback policy remains outside scope |
| sst:longitude | ALREADY_COMPLIANT | Strict provider-coordinate leaf; legacy fallback policy remains outside scope |

Twelve measurement routes match qualified core authority; center SST is incomplete at the changing-getter boundary; two current-component routes implement locality but remain blocked for faithful available-partial capture; ten strict coordinate routes remain already compliant. Numeric strings remain route-specific/open, provider fill policy unchanged, coordinate fallbacks unchanged. Historical selection, chlorophyll temporal arithmetic and convergence/Ocean Physics remain outside this implementation authority.

### Cache, tests and zero-network accounting

Exact production cache functions exercised with old version/unversioned sentinels, old in-flight promises, same-version sharing, hit, strict greater-than 300-second expiry, refetch and independent cold cache. No old-entry fallback. TTL/capacity/eviction unchanged. Bounded 15 measurement-route search retained from implementation report; not a repository-wide cache redesign or persistence-provenance proof.

| Set (overlapping, do not add) | Scripts | Tests passed / failed / skipped |
| --- | --- | --- |
| Source-normalization focused | 1 | 13 / 0 / 0 |
| New adversarial | 1 | 9 / 1 / 0 |
| Capture/reconstruction | 8 | 628 / 5 / 0 |
| Current-vector locality | 1 | 8 / 3 / 0 |
| Previously assertion-failing set | 19 | 625 / 48 / 0 |
| Unique selected set | 25 | 780 / 49 / 0 |

Selected set: 25 intended, 25 started, 25 completed, 5 passed scripts, 20 failed scripts, 829 tests total. Independent heap script is additional: started, terminated, no completed report. Final counts use the final corrected new diagnostic run; two initial test-author mistakes (aggregate versus individual projection and provider-error wrapping) were corrected only in the new test. Initial/intermediate logs remain retained. No second complete 85-script run was attempted: the selected set is red and the independent heap test exceeded 29 GB private memory. The prior complete attempt remains FAILED, not a partial PASS.

Fresh qualified isolation used temporary Git index + native checkout-index, autocrlf=false and symlinks=false: 1,964 HEAD files verified, exact candidate overlays, 28 lockfile-authorized package integrities, 1,423 tracked dependency files, only 48 files for absent polyfill 0.5.1/jsbi 4.3.2 materialized, eight exact retained fixtures and approved scratch. Qualified offline npm configuration was unchanged. No real dependency installation was altered.

Operational attempt instrumentation recorded **0** requests across materialization, closure, heap, review, historical getter control and final adversarial run. Nine deliberate denial calibration probes were separately logged and denied; these are not provider requests. Denial SHA-256: `a7c4d834d772ce1ba06d853cc0dc9675ee80bcfb3848dd3de1b7ecf4d737d7ca`; independent monitor SHA-256: `4ed0cd7cb728f0c1c2fae2afa70e3f0fe6ad2a339bf45da9de7e818dbc339e3a`. No npm fetch/retry evidence. V3 implementation/suite never executed; static hashing of preserved quarantined bytes is not execution.

### Preservation, artifacts and next gate

Review-start/final HEAD: `e85924db075f75fc2d5b493c13561af36e7981a4`. Review preserved both production files, existing focused test, all 177 protected hashes, 15,363 real dependency files and excluded Supabase pair. Only new review test and these two report updates were made. Inherited server diff remains +77/-162; module and original focused test remain unmodified by review. Real index is empty. No scientific/runtime repair, schema/serializer change, history rewrite or historical-test edit occurred.

Raw receipts and logs: `C:\Users\User\AppData\Local\Temp\pelora-normalization-adversarial-3a8fc81ec3d24a1284a0cd53a67bf6d1`. Cleanup/final static-check outcome is recorded below and in JSON.

- Approve only the demonstrated center-SST stable-value/finiteness correction, with the new adversarial test kept as an acceptance gate.
- Decide whether partial-current persistence is required; if yes, separately approve a versioned minimal capture admission/cause/consumer contract before implementation.
- Approve explicit processing-reference binding at the relevant live persistence boundary; retain historical provenance unchanged.
- Approve distinct historical/current test execution governance and bounded heap diagnosis; do not rewrite preserved tests to get green.

No repair is authorized by this review itself. V3 stays quarantined; Ocean Physics, 12B.6C and 9E-D stay paused. No species/ranking/confidence/opportunity/frontend/Auth/Supabase changes, provider/database access, environmental acquisition, staging, commit, tag, push or deployment. Stop for human review.

Final review checks: production/module/both new tests pass syntax checks; JSON parses; tracked and new-file whitespace checks pass. One CRLF in the new diagnostic test was changed to LF after execution, with no semantic change. Native/literal imports resolved in completed scripts; no ERR_MODULE_NOT_FOUND. Git configuration and HEAD unchanged. Temporary review checkout/dependencies/cache removed; receipts, npm logs and test logs retained. Staged files: 0. Tracked diff: inherited server.js +77/-162. Untracked files: 7 (sourceNormalization.mjs, both runtime test files, both runtime reports, the two excluded Supabase files). No additional repository file was created.


## CONTROLLED REPAIR — 2026-09-29

**SOURCE_NORMALIZATION_RUNTIME_V1_READY_FOR_FINAL_ADVERSARIAL_REVIEW**

Capture: **CAPTURE_SUCCESSOR_READY_FOR_FINAL_ADVERSARIAL_REVIEW**. Regression: **CURRENT_RUNTIME_PROFILE_PASS**. Heap: **TEST_HARNESS_RESOURCE_DEFECT**. Earlier STOP/review findings above remain historical records. This section records the subsequent human-authorized repair; it does not rewrite the earlier evidence or claim a production release.

### SST correction

Center and directional SST retain the temperature property once. Validation and Celsius/Fahrenheit representations use that value. Getter tests cover finite-to-finite, finite-to-Infinity, Infinity-to-finite, null/undefined/nonfinite values, both zero signs and exactly one invocation. Ordinary values, numeric-string compatibility, formulas, rounding, units and coordinate fallbacks remain unchanged.

### Capture successor and provenance

Implemented **pelora-governed-current-evidence-capture-v3**, limited to CURRENTS. One required Boolean, **speedDerivationFailed**, distinguishes unavailable derived speed from source missingness. No new availability enum.

| State | Required representation |
| --- | --- |
| Full | Available source; finite u/v/heading/speed; Boolean false |
| Partial | Available source; finite u/v/heading; speed null; Boolean true |
| Unavailable | Existing unavailable label; diagnostic nullable components; null speed/heading; Boolean false |
| One component | Cannot claim available vector; retain only unavailable-source diagnostics |
| Nonfinite | Rejected |
| Signed zero | Retained by exact codec/digest/replay |

The live acquisition/capture API calls the existing current parser, then captures its newly normalized point and binds the processing reference. It infers failure from the known producer/version plus valid components and failed speed, never from null alone. V1/V2 remain unchanged and reject V3. Explicit historical readers never supply a missing normalization version. V3 replay retains exact null/component state and lineage; reference/digest tampering is rejected and captures are detached/frozen. Consumers still validate their own required finite group: independently valid component projection does not certify speed or complete aggregate coverage.

The existing live observation-snapshot path now supplies the same processing reference to its lineage. Metadata and storage construction carry it forward. Generic/historical calls default to absent provenance. This does not change provider identity, scientific formulas or historical identity. Exact signed-zero wire fidelity is guaranteed by the V3 exact codec, not by silently upgrading legacy JSON snapshot formats. No new HTTP endpoint, historical migration or external write occurred. See [Current evidence capture v3](Current_Evidence_Capture_v3.md).

### Regression governance

The deterministic profile is **backend/tests/sourceNormalizationRegressionProfile.v1.json**. It partitions all test scripts, names every archival assertion, binds historical test hashes and supplies a separate current four-module source inventory. It is runtime-verification governance, not new scientific authority.

All 48 prior failures retain explicit roles: **38 historical characterizations**, **10 frozen source/inventory boundaries**. No original test/hash was overwritten. Mixed suites keep their current controls; eight locality controls remain selected. Their three historical-defect assertions are replaced by current locality/overflow/quality tests. Every archival assertion has replacement coverage recorded in the manifest. Archival assertions are neither counted as current failures nor mislabeled as passing current behavior.

Two stateful historical scripts have whole-suite archival disposition: snapshotBranchOptionality.test.js and transitiveProducerBoundary.test.js. The latter's frozen-line case also initializes a later finite control; simply skipping it broke setup. A current successor preserves all ten behavior checks with independent setup and current-location/determinism checks instead of historical line/hash equality. Original bytes remain immutable. The bounded producer successor exercises all 128 scenarios, permutations, duplicate states, warm/cold reuse and coordinate fallbacks with current source/inventory digests.

### Bounded heap result

The exact old script is **snapshotBranchOptionality.test.js**. Frozen and candidate controls used identical denial/instrumentation and conservative 1 GB / 60-second limits; no memory limit was increased. Frozen full work crossed 1 GB at 39.24 seconds; candidate crossed it at 12.74 seconds. Neither termination is PASS.

Trace: candidate source drift fails the historical offset assertion before union is initialized; a later assertion compares a 3,258-entry inventory with undefined. The resulting Node diagnostic formatting grows excessively. Keeping comparisons/failures but replacing only temporary diagnostic formatting with compact errors lets that same candidate script finish in 13.19 seconds below 481484800 private bytes. It still fails historically. The frozen first-stage control passes in 17.70 seconds. No production normalization/cache memory regression is established. This is a demonstrated historical harness failure path triggered by expected source drift, plus memory-heavy historical fixture work; not a waiver or an increased heap limit.

### Current verification accounting

**88 intended / 88 started / 88 completed / 88 passed scripts. 2060 node:test cases passed, 0 failed, 0 skipped; plus 50 explicitly counted manual cases.** Other custom PASS lines are not inflated into case counts.

| Focused set (overlaps full profile) | Tests passed |
| --- | --- |
| backend/tests/currentEvidenceCaptureV3.test.js | 8 |
| backend/tests/sourceNormalizationCurrentProducer.test.js | 2 |
| backend/tests/sourceNormalizationRegressionGovernance.test.js | 3 |
| backend/tests/sourceNormalizationRuntime.test.js | 13 |
| backend/tests/sourceNormalizationRuntimeAdversarial.test.js | 12 |
| backend/tests/sourceNormalizationTransitiveCurrent.test.js | 10 |

Capture/reconstruction: **9 scripts / 636 passed / 0 failed**. Current locality: **8 passed**, with the three historical assertions explicitly archival.

Accounting combines the final full traversal with the explicitly added current transitive successor and bounded capture/governance follow-ups; every final-profile member completed successfully, counted once. The extra old transitive diagnostic failure is retained, not relabelled PASS. The initial profile run also recorded a Windows native exit (-1073741819) after 87 passing publication-history tests; the final rerun exited 0 with all 87 passing. Its isolated native-exit cause remains unexplained, with raw receipts retained. No code was changed to mask it.

### Route dispositions

| Route | Final bounded disposition |
| --- | --- |
| marine:wind_speed_10m | IMPLEMENTED_AND_QUALIFIED |
| marine:wind_gusts_10m | IMPLEMENTED_AND_QUALIFIED |
| marine:wind_direction_10m | IMPLEMENTED_AND_QUALIFIED |
| marine:wave_height | IMPLEMENTED_AND_QUALIFIED |
| marine:wave_direction | IMPLEMENTED_AND_QUALIFIED |
| marine:wave_period | IMPLEMENTED_AND_QUALIFIED |
| marine:swell_wave_height | IMPLEMENTED_AND_QUALIFIED |
| marine:swell_wave_direction | IMPLEMENTED_AND_QUALIFIED |
| marine:swell_wave_period | IMPLEMENTED_AND_QUALIFIED |
| marine:sea_surface_temperature | IMPLEMENTED_AND_QUALIFIED |
| direct:chlor_a | IMPLEMENTED_AND_QUALIFIED |
| gap:chlor_a | IMPLEMENTED_AND_QUALIFIED |
| current:u_current | IMPLEMENTED_AND_QUALIFIED |
| current:v_current | IMPLEMENTED_AND_QUALIFIED |
| sst:directional | IMPLEMENTED_AND_QUALIFIED |
| marine:latitude | ALREADY_COMPLIANT |
| marine:longitude | ALREADY_COMPLIANT |
| direct:latitude | ALREADY_COMPLIANT |
| direct:longitude | ALREADY_COMPLIANT |
| gap:latitude | ALREADY_COMPLIANT |
| gap:longitude | ALREADY_COMPLIANT |
| current:latitude | ALREADY_COMPLIANT |
| current:longitude | ALREADY_COMPLIANT |
| sst:latitude | ALREADY_COMPLIANT |
| sst:longitude | ALREADY_COMPLIANT |

These dispositions qualify only authorized core behavior. Numeric strings remain route-specific/open; no provider fill policy, coordinate fallback, historical selection or chlorophyll temporal policy was settled. Qualified locality preserves valid source components, rejects failed derived groups and permits only independently validated recomputation. Cache and in-flight generation separation, same-version reuse, strict 300-second expiry and cold-cache controls pass; no unversioned fallback.

### Preservation and limits

Starting/final HEAD: **e85924db075f75fc2d5b493c13561af36e7981a4**. Production files: backend/server.js, backend/sourceNormalization.mjs, backend/currentEvidenceCaptureV3.mjs, backend/normalizedEvidenceCapture.mjs. Inherited normalization helper remains byte-identical to the starting candidate. Server diff against HEAD is **+93/-166**. New capture modules and test/profile files remain untracked. No staging.

**177 protected artifact hashes, 20 archived suite hashes and 15,363 real dependency files are unchanged.** Historical capture v1/v2, manifests/lockfiles, Git configuration and the excluded Supabase pair are unchanged. The isolated production bytes match the final candidate.

Qualified Windows checkout-index and offline dependency materialization were reused: 28 integrity-authorized packages, only the two missing packages materialized, approved retained fixtures/scratch. Dual denial and instrumentation recorded **0 operational network attempts**. Nine intentional denied calibration probes are separate. No V3 projection implementation or suite executed; capture v3 is a different contract.

No species/ranking/confidence/opportunity, convergence/Ocean Physics, history-selection, chlorophyll temporal, frontend/Auth/Supabase changes. 12B.6C and 9E-D remain paused. No provider/database access or environmental acquisition. No commit/tag/push/deployment. Final adversarial review is the next gate; no release authority is claimed.

Receipts: C:\Users\User\AppData\Local\Temp\pelora-normalization-repair-2d653264e6594f638071c190ca9d99c0. Final static checks and cleanup are recorded below.

### Final static checks and cleanup

All 10 production/test JavaScript modules pass syntax checks. Report/profile JSON parses; tracked and added-file whitespace checks pass. Native imports are exercised by the current profile. The task checkout, isolated dependency tree and temporary cache were removed after byte verification; logs/receipts (including npm logs) remain in the task receipt directory. Earlier task environments were not changed. HEAD and Git configuration are unchanged, the index is unstaged, and the two Supabase files remain untouched.

The frozen V1/V2 semantic comparison utilities do not authorize the new processingReferences path: they retain it as unresolved and reject complete scientific equivalence. Literal call-site review found no live persistence caller. Their registries were not changed, and this implementation does not qualify that path as a scientific projection surface. A future comparison-registry review would be separate from capture/provenance fidelity.

## FINAL ADVERSARIAL RELEASE-BOUNDARY REVIEW

**SOURCE_NORMALIZATION_RUNTIME_V1_REQUIRES_CORRECTION**. Capture: **CAPTURE_V3_CONSUMER_CONTRACT_INCOMPLETE**. Current profile: **88/88 scripts passed**, but release coverage is incomplete. Heap: **TEST_HARNESS_RESOURCE_DEFECT_NONBLOCKING_FOR_RUNTIME**. Windows: **NONREPRODUCED_TRANSIENT_TEST_PROCESS_EXIT**.

Production and tests were not changed during this review. Starting/final HEAD: `e85924db075f75fc2d5b493c13561af36e7981a4`.

### R1 — Exact current capture/reference is not integrated into the live handoff

The live observation -> metadata -> ocean snapshot -> /api/ocean writeJson path carries a processingReferences marker, but neither calls captureNormalizedCurrentConditions nor serializes/references capture v3. Only the test calls that new acquisition export. The production writeJson function, invoked with a fake response without transport, loses -0; its normalized point contains no speedDerivationFailed and no cec3 reference. The exact content/reference/reconstruction requirement is therefore not established by the existing helper tests.

Existing generic JSON behavior is not a newly introduced scientific formula regression. In-memory structuredClone preserves -0. The missing exact handoff is a gap in completing the authorized successor integration; no actual database operation was performed.

Next gate: Identify the intended live exact capture/reference persistence handoff and implement/review its minimum integration, or obtain an explicit narrower scope decision. Prove partial state, -0 and processing version through that exact round trip. Do not silently change snapshot scientific identity.

### R2 — Unavailable diagnostic components can become complete projections if replay is fed directly to the generic consumer

A valid v3 unavailable-source state with finite diagnostic u/v, null speed/heading and failure=false is admitted. Four replayed cardinal samples sent to buildCurrentVectorProjectionAnalysis produce available=true, coverage=complete and validProjectionCount=4. The consumer checks finite components, not their source validity. The current v3 test covers unavailable single-component cases, not unavailable two-component diagnostics.

This reproduces a capture-consumer composition defect, not a demonstrated live provider path delivering this unavailable tuple: the present live producer labels two valid components available, and capture-v3 replay has no production caller. It must be reconciled before wiring that replay into live consumers. No claim that current live availability implies finite speed was found; speed-required live consumers explicitly test finiteness.

Next gate: Define and test the minimum adapter/eligibility boundary retaining diagnostic bytes without treating them as valid source evidence; independently valid partial vectors must still permit independently validated recomputation. Do not patch generic science in this review.

### R3 — Generic v3 admission does not require the normalization processing reference

A partial v3 capture with an empty lineageReferences array validates. Generic v3 shape validity alone therefore does not certify pelora-source-normalization-v1 provenance. The new-normalized helper supplies the exact reference, but only its optional in-process path proves binding.

Generic v3 may represent other recorded semantics; no global requirement or historical relabelling is invented. The live boundary claiming normalization v1 must enforce and round-trip its explicit reference.

Next gate: Bind and validate the processing reference at the actual new-normalized persistence boundary, retaining generic/historical semantics explicitly.

### Passing bounded controls

SST: 24 center/directional robustness cases, one semantic source read (zero when missing); throwing getters reject, inherited getters read once. Native JSON has no getters. Existing signed-zero/overflow suites also pass.

Capture: 720 state combinations, 19 admitted and 701 rejected, all matching the documented numeric/availability state table. Accessors, inheritance, sparse arrays, unknown siblings and missing failure flag rejected. All 30 input leaves attacked: 13 valid changes altered capture/reference identity, 17 invalid changes were rejected. Exact v3 wire preserves component/speed signed zero. V1/V2 unchanged and never default to v3 or normalization v1.

Cache: old/unversioned entries and promises isolated; same-version reuse, cold cache and strict 300-second expiry preserved. Both cache families clear rejected in-flight work and successfully retry.

Frozen projection V1/V2 use Candidate_Semantic_Surfaces_v1.json and reject `/observationSnapshot/lineage/processingReferences` as unresolved. No live server/persistence importer was found. **PROJECTION_REJECTION_EXPECTED_AND_NONBLOCKING**; registries unchanged. This is distinct from R1/R2.

### Production authority audit

All 56 server diff hunks are assigned to the semantic groups below; no unclassified production hunk. New-module function lists and exact hunk mapping are in JSON. The authority is narrower in scope than overall scientific qualification; failed earlier proposals were not treated as approval.

| Function/group | Old → new | Authority relationship |
|---|---|---|
| imports | No source-normalization or v3 acquisition integration → Import bounded numeric/version/provenance helpers and capture adapter | EXACT |
| metersPerSecondToKnots | Number coerces null/structures; finite precheck only; -0 rounding lost → Reject missing/malformed; preserve existing string rule; same factor/precision; finite result | EXACT |
| metersToFeet | Same coercion and scale-overflow exposure → Same factor/precision with finite and signed-zero guard | EXACT |
| celsiusToFahrenheit | Strict finite Celsius but conversion could overflow → Unchanged formula; nonfinite output null | EXACT |
| createCurrentPointCacheKey | Unversioned coordinate identity → Stable semantics prefix with existing coordinate rounding | EXACT |
| getChlorophyllConditionsAtAssessment | safeNumber admits malformed coercible structures; rounding loses -0 → Primitive numeric/string gate, finite rounding; no fill/temporal policy | EXACT |
| getGapFilledChlorophyllConditionsAtAssessment | Same malformed/rounding exposure → Same narrow primitive and rounding guard | EXACT |
| getCurrentConditionsPointAtAssessment | Coercible structures admitted; component -0 lost → Source u/v gate and sign-preserving rounding; speed formula and source availability rule retained | EXACT |
| buildCurrentVectorProjectionAnalysis | Nonfinite required derivatives could remain available → Independent finite validation; reject failed projection; finite rounding | EXACT |
| buildCurrentGradientAnalysis | Overflow differences/required axis arithmetic admitted → Required axis-group finiteness and existing separation boundary; unchanged equations and precision | EXACT |
| createSstPointCacheKey | Unversioned key → Same version prefix/coordinate formatting as current cache | EXACT |
| getSeaSurfaceTemperaturePoint | Finite check and conversion reread source property → One retained Celsius value; paired conversion unavailable on overflow | EXACT |
| getMarineConditions: wind direction | safeNumber accepted malformed structures → Primitive gate retains string compatibility | EXACT |
| getMarineConditions: center SST read | Fahrenheit and Celsius read separately → Retain source once for validation and both units | EXACT |
| getMarineConditions: wave/swell direction/period | safeNumber coerced malformed structures → Primitive gate; units/formulas unchanged | EXACT |
| getMarineConditions: center SST output | Separate Fahrenheit/Celsius expressions → Return retained paired values | EXACT |
| buildObservationSnapshot: parameter/validation | No processingReferences input → Optional existing-reference-shaped provenance; no default version | EXACT |
| buildObservationSnapshot: lineage | Only existing lineage fields → Clone explicit processing references only when present | EXACT |
| getOceanConditionsAtAssessment: current quality reason | Partial speed failure could report source availability as reason → Unavailable speed reason while source components survive | EXACT |
| getOceanConditionsAtAssessment: live snapshot call | No normalization provenance marker → Supply explicit normalization reference on new snapshots | BROADER_THAN_IMPLEMENTATION |
| captureNormalizedCurrentConditions | No capture-v3 acquisition export → Acquire new normalized point then capture with provenance; no production caller to persist/reconstruct it | BROADER_THAN_IMPLEMENTATION |

### Historical/current regression governance

The unchanged manifest partitions 91 scripts into 88 current, two archival harnesses and one quarantined projection-V3 suite. `snapshotBranchOptionality.test.js` retains frozen offset/inventory/resource evidence; current bounded producer controls replace its runtime scenarios. `transitiveProducerBoundary.test.js` retains its stateful frozen setup; the ten-case current successor replaces it. The V3 projection suite has no runtime replacement because it remains prohibited.

All **48 dispositions** remain: **38 historical-behavior + 10 frozen-source assertions**. Twenty archived suite hashes match. The two targeted archival controls reproduced `null !== 0` and frozen server-blob mismatch; these are expected failures, not current PASS. Literal per-assertion roles/replacements remain in the manifest and this JSON review. No exclusion was found to hide a specific old live contract without a replacement, but the new successor integration edges are missing from current coverage.

Current run: **88 intended, 88 started, 88 completed, 88 passed**. **2,060 node:test cases passed; zero failures/skips/cancellations. 50 manual cases** (23 display-scale + 27 retained NOAA pilot). Seven additional completion-only scripts: backend/tests/bathymetryEvidence.test.js, backend/tests/dynamicOpportunityFailure.test.js, backend/tests/environmentalObservationMetadata.test.js, backend/tests/oceanConditions.test.js, backend/tests/oceanFields.test.js, backend/tests/opportunityEvaluationState.test.js, backend/tests/persistenceEnvironment.test.js. Diagnostic probes are not added to these case counts.

### Resource and process boundaries

The original heap trace/controls remain persuasive: a failed historical offset assertion leaves union unset; formatting the later 3,258-entry comparison grows excessively. Compact diagnostic failure finishes below 482 MB; frozen first stage passes; full frozen work was also conservatively stopped. None of these failures was relabelled PASS. The current bounded producer control passes again; no production normalization/cache memory regression is established.

`oceanPublicationHistory.test.js` passed three times in this review (the full profile and two independent repeats), 87 assertions each. The prior native exit was not reproduced; its original cause remains unknown.

### Final 25-route ledger

| Route | Bounded final status |
|---|---|
| marine:wind_speed_10m | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:wind_gusts_10m | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:wind_direction_10m | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:wave_height | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:wave_direction | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:wave_period | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:swell_wave_height | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:swell_wave_direction | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:swell_wave_period | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:sea_surface_temperature | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| direct:chlor_a | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| gap:chlor_a | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| current:u_current | CAPTURE_BLOCKED |
| current:v_current | CAPTURE_BLOCKED |
| sst:directional | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:latitude | ALREADY_COMPLIANT |
| marine:longitude | ALREADY_COMPLIANT |
| direct:latitude | ALREADY_COMPLIANT |
| direct:longitude | ALREADY_COMPLIANT |
| gap:latitude | ALREADY_COMPLIANT |
| gap:longitude | ALREADY_COMPLIANT |
| current:latitude | ALREADY_COMPLIANT |
| current:longitude | ALREADY_COMPLIANT |
| sst:latitude | ALREADY_COMPLIANT |
| sst:longitude | ALREADY_COMPLIANT |

Core-only route results are not checkpoint qualification. String compatibility, finite provider fills, legacy SST fallbacks, historical/revision selection and chlorophyll temporal policy remain unchanged/open. No claim that every open-policy input now fails closed.

### Preservation, operations and next gate

Qualified checkout-index isolation reproduced 1,964 HEAD files; 28 lockfile/cache-authorized packages, 1,423 tracked dependency files and the two-package overlay were verified. Eight retained fixtures verified. Dual denial/instrumentation recorded zero operational attempts; nine separate calibration probes were intentionally denied. No external service/database was accessed.

177 protected artifacts, 20 archived suites and 15,363 real dependency files unchanged. Server remains +93/-166 vs HEAD; three new production modules, six candidate test files and the profile are unchanged from this review start. Only the two runtime reports and capture documentation were updated. Index empty; 15 untracked files including the two untouched Supabase exclusions.

Projection V3 remains quarantined; Ocean Physics/12B.6C/9E-D remain paused. No unauthorized science/runtime repair, commit, tag, push or deployment. The next gate is controlled repair authorization for the exact live handoff and consumer adapter, followed by fresh adversarial review. Receipts: `C:\Users\User\AppData\Local\Temp\pelora-normalization-final-review-ffd98382e2e74c9c92e081a33e6365ae`.

Final cleanup/check: this review's checkout, dependency tree and cache are removed; receipts/logs retained. Production, candidate tests/profile, original capture v1/v2, 177 protected artifacts, 15,363 real dependency files and Supabase pair rechecked unchanged after cleanup. Git config and HEAD unchanged; index unstaged. Syntax/JSON/whitespace checks passed. Only the three authorized documentation files changed during this review.


## Live exact-handoff and diagnostic admission repair

**SOURCE_NORMALIZATION_RUNTIME_V1_READY_FOR_CHECKPOINT_REVIEW** — uncommitted, for human checkpoint review. Starting/final HEAD: `e85924db075f75fc2d5b493c13561af36e7981a4`. Prior STOP findings above remain historical evidence; this section describes the repaired candidate.

The live path is normalized current acquisition → observation/ocean snapshot → actual /api/ocean handler → exact envelope before writeJson → unchanged browser buildOceanSnapshotStorageRow → JSON-compatible snapshot_payload → backend buildOceanMemoryStorageRecordFromRow → validated v3 reconstruction → scientific consumers. The former loss point was ordinary JSON.stringify of numeric source fields. The actual HTTP-handler and browser-row-builder composition is tested without any socket or database client.

The current point's primary source fields move into one v3 capture with center and present cardinal samples. The envelope carries exact capture text, its governed reference, an exact context remainder and a deterministic transport checksum. The checksum binds the remainder to the capture; it does not invent a scientific digest. Generic JSON now transports exact strings. The top-level currents display object remains unchanged; the actual persistence builder stores oceanSnapshot. Idempotent handoff validates existing envelopes. Marked normalized raw-point replay is rejected instead of silently falling back to lossy legacy JSON. Historical unmarked shapes remain historical.

New normalization-v1 creation requires the explicit semantics version and exactly matching processing lineage. Generic capture-v3 lineage remains optional under its existing contract. Provider metadata is separately recorded as RECORDED_NOT_REQUALIFIED, never promoted to provider qualification. v1/v2 implementation, schema, bytes and dispatch remain unchanged; no historical evidence defaults to normalization v1.

Projection admission now requires source.availability === available before finite u/v and independent arithmetic checks. Four unavailable diagnostic vectors yield zero valid projections and unavailable coverage. Mixed 0/1/2/3/4 admissible points yield unavailable/insufficient/insufficient/partial/complete coverage under existing thresholds. Available partial vectors retain u/v and may independently produce finite projections despite null speed. Diagnostics remain retained, but cannot supply gradient/shear/edge/convergence evidence. Missing-point controls preserve existing requested-set coverage terminology and the three-valid-projection availability threshold; no coverage science is redesigned.

Signed zero survives actual parser → capture → HTTP JSON → browser row → stored-row JSON → reconstruction → admitted projection. Complete, partial, unavailable diagnostic and invalid-vector states retain v3 semantics. Tampering, inherited envelopes, accessors, wrong/missing normalization identity, stale references and marked raw fallback fail closed. The original capture-v3 implementation itself was not modified in this repair.

### Verification

- Complete fixed-copy release profile: **88/88 scripts**, **2069/2069 node:test cases**, **50 explicit manual cases**, 7 completion-only scripts; zero failures/cancellations/skips among selected current assertions.
- Six candidate focused/current suites: **57 cases**; current-v3 suite 14 cases. Four explicit current capture/reconstruction suites: **279 cases**. These are subsets of the release total, not additional totals. Separate missing-point diagnostic: 5 cases.
- Cache isolation/coalescing/rejection cleanup/retry/cold start and 300-second expiry pass. SST changing/throwing getter and single-read controls pass.
- All 48 archival dispositions remain unchanged: 38 historical-behavior and 10 frozen-source boundaries. Twenty historical test hashes remain exact. Two targeted archival controls reproduce the expected null-versus-zero and old-source-blob failures; neither is labelled a runtime pass. No new exclusion was added.
- The preliminary broad run completed all 88 scripts; its only failure was the candidate source inventory detecting an in-progress adapter edit. The entire profile was rerun after freezing updated source/test bytes.
- Zero operational outbound attempts across materialization, dependency closure, focused checks, archival controls and both broad runs. Nine intentional denial-calibration probes are separately labelled. Qualified checkout-index extraction, 28 integrity-authorized packages and eight retained fixtures were reused without network acquisition.
- Existing bounded heap finding remains TEST_HARNESS_RESOURCE_DEFECT_NONBLOCKING_FOR_RUNTIME. No memory-limit increase or historical harness redesign. The Windows native exit did not recur.
- Syntax, native imports, JSON and tracked/untracked whitespace checks pass. 177 protected artifacts and 15363 real dependency files remain exact. Git configuration, manifests/lockfile and excluded Supabase files remain unchanged.

### Production authority and scope

This repair changes only server.js integration/admission and normalizedEvidenceCapture.mjs. The helper and capture-v3 implementations inherited from the candidate otherwise remain unchanged. Every repair hunk is classified against human decisions A–D in the JSON; the prior complete candidate authority audit remains preserved. No convergence formula, species/ranking/confidence/opportunity gate, history/temporal policy, frontend/Auth/Supabase or open normalization policy changed. V3 projection stays quarantined; Ocean Physics, 12B.6C and 9E-D stay paused.

### 25-route disposition

| Route | Current disposition |
|---|---|
| marine:wind_speed_10m | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:wind_gusts_10m | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:wind_direction_10m | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:wave_height | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:wave_direction | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:wave_period | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:swell_wave_height | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:swell_wave_direction | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:swell_wave_period | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:sea_surface_temperature | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| direct:chlor_a | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| gap:chlor_a | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| current:u_current | IMPLEMENTATION_MATCHES_AUTHORITY |
| current:v_current | IMPLEMENTATION_MATCHES_AUTHORITY |
| sst:directional | QUALIFIED_RUNTIME_V1_CORE_ONLY |
| marine:latitude | ALREADY_COMPLIANT |
| marine:longitude | ALREADY_COMPLIANT |
| direct:latitude | ALREADY_COMPLIANT |
| direct:longitude | ALREADY_COMPLIANT |
| gap:latitude | ALREADY_COMPLIANT |
| gap:longitude | ALREADY_COMPLIANT |
| current:latitude | ALREADY_COMPLIANT |
| current:longitude | ALREADY_COMPLIANT |
| sst:latitude | ALREADY_COMPLIANT |
| sst:longitude | ALREADY_COMPLIANT |

The 13 core routes retain bounded normalization qualification, ten strict coordinate routes remain compliant, and the two current-component routes now match authority through exact handoff and consumer admission. Numeric strings, fill values, SST coordinate fallbacks, history selection and chlorophyll temporal policy remain open and unchanged.

Full per-script counts, excluded-test governance, exact source/test hashes, consumer inventory and receipts are in the JSON liveHandoffRepair section and `C:\Users\User\AppData\Local\Temp\pelora-live-handoff-repair-54adf3e2a7e44a70a4e33651f811e37f`. Only backend/server.js is tracked-modified; 13 candidate files and the two excluded Supabase files remain untracked; index empty. No commit, tag, push, deployment, provider/database/Auth/Supabase access or environmental acquisition. Next gate: human/checkpoint review.

Temporary checkout, materialized dependencies and isolated cache were removed after verification; receipts remain in the execution directory. Final tracked diff: `backend/server.js +102/-170` relative to HEAD. The two production files changed by this repair are `backend/server.js` and `backend/normalizedEvidenceCapture.mjs`; the two other candidate production modules retain their starting bytes. No staged changes.
