# Chlorophyll Temporal Derived-Finiteness & Dependency-Admission Scope v1

Task 12B.7F. **CHLOROPHYLL_TEMPORAL_DERIVED_FINITENESS_SCOPE_QUALIFIED**, bounded to arithmetic and admission scope. **PRODUCTION_REACHABILITY_UNESTABLISHED**. No production-history, species score/confidence, eligibility, ranking or Opportunity impact is established.

Repository HEAD: c0d97f1f1281e99898b908af8dd9c8e1f81056d1; branch codex/pelora-remote-setup. New diagnostic artifacts only. Full encoded counterexamples, dependency matrix, source anchors and preservation hashes are in [the JSON report](Chlorophyll_Temporal_Derived_Finiteness_v1.json). Diagnostic nonfinite/signed-zero tags in that report are not a production serialization format.

## Three separate authorities

**A — Endpoint evidence.** Actual default direct and gap-filled parsers, exercised with synthetic NOAA-shaped transport, return finite concentration, classification, coordinates, represented time and distinct source metadata. Direct uses noaacwNPPVIIRSchlaDaily; gap-filled uses nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily with reconstruction/DINEOF/experimental lineage. Endpoint numeric/schema acceptance does not qualify physical plausibility, provider fills or historical use.

**B — Historical admissibility.** The diagnostic manually wraps unchanged productivity/clarity leaf outputs in snapshot.available, a synthetic snapshotId, metadata.time.observedAt and observation.evidence.groups. These satisfy the low-level consumer's predicates, not storage, environmental identity, revision or selection authority. The same stripped wrappers are rejected by buildHistoricalSnapshotQuery because required storage availability/version authority is absent.

**C — Temporal science.** Accepted observations are sorted chronologically, deduplicated by snapshotId and compared first-to-last. Endpoint acceptance cannot validate later subtraction, lifecycle, continuity or confidence.

## Exact counterexamples

DIRECT and GAP_FILLED independently reproduce the following; their scientific equivalence remains unqualified.

| Endpoint | First | Last |
|---|---|---|
| Concentration, mg/m³ | 1e308 | -1e308 |
| Represented time | 2026-09-23T00:00:00Z | 2026-09-24T00:00:00Z |
| Recorded age at assessment | 25 hours | 1 hour |
| Water classification | high-chlorophyll-coastal-or-bloom-influenced | very-clear-low-productivity |
| Productivity rank | 4 | 0 |
| Clarity rank | 0 | 4 |

Assessment is 2026-09-24T01:00:00Z. Both capture v1/v2 accept each finite endpoint. Synthetic IDs are numeric-diagnostic-0/1. The complete wrapper, endpoint provenance and downstream objects are recorded in JSON.

The unchanged calculation is `lastObservation.concentrationMgM3 - firstObservation.concentrationMgM3`: **-1e308 - 1e308 = -Infinity**. There is no nonfinite endpoint or preceding nonfinite intermediate. `Number(concentrationChangeMgM3.toFixed(4))` preserves the infinity: toFixed returns the string "-Infinity". Reversing endpoint signs yields +Infinity; equal extreme endpoints yield zero. This is subtraction overflow, not division by zero, logarithms, underflow or a rate.

Both feature results report available=true, sampleCount=2, durationHours=24 and confidence 60 / Moderate. This is low-level persistence confidence, not a species-confidence consequence. Productivity reports decreasing-surface-productivity-context / weakening; clarity reports increasing-surface-water-clarity-context / strengthening. Numeric probes do not establish an ocean concentration range.

## Actual formulas and admission

Productivity consumes both concentration and interpreted productivity class. It subtracts endpoint ranks and concentrations, then tests concentrationChange >0.02 OR classificationChange >0; otherwise the corresponding decreasing condition; otherwise stable. Existing branch order and tolerance are unchanged.

Clarity consumes interpreted clarity class, waterClassification, concentration and recorded freshness. Its lifecycle uses clarityRankChange only. Concentration change is still calculated and included in the returned full result, although it does not determine clarity classification. A valid rank comparison therefore does not make the nonfinite full tuple valid.

Both calculate duration `(lastTimestamp-firstTimestamp)/(1000*60*60)`, freshness-rank change, and confidence `Math.min(80,40+sampleCount*10)`. High is >=70, Moderate >=50, otherwise Low. Freshness ranks are unknown=0, stale=1, aging=2, recent=3. These bounded rank/count operations do not cause the demonstrated infinity. buildFeaturePersistenceContract validates feature metadata/lifecycle and spreads values without a recursive finiteness check. This explains available=true.

Persistence here means first/last chronological interpreted context comparison with sample-count confidence. It does not measure continuous observation, gap-free duration, a concentration rate or classification agreement across every intermediate sample.

## Time, value, identity and provenance attacks

- Both consumers require parseable represented timestamps, two accepted snapshot-ID-distinct observations and a positive finite span. Family evidence observedAt takes precedence over envelope time. Reversing input order is sorted to the same result.
- Equal times yield insufficient-history with change=null. One millisecond is calculable, producing 2.7777777777777776e-7 hours. No minimum separation is invented. Concentration change is not divided by time. A 58,992-hour gap and future-dated synthetic evidence remain calculable, not thereby historically admissible.
- There is no assessmentAt/cutoff argument or qualified history age/gap rule. Recorded stale/unknown freshness is admitted. Fresh at original assessment does not mean admissible now.
- Same snapshotId deduplicates. Distinct IDs at the same support plus a later point increase sampleCount from 2 to 3 and confidence from 60 to 70. A same-support pair alone fails for zero duration. Revision precedence and environmental observation identity remain upstream policy; repeated publication is not repeated observation.
- DIRECT/DIRECT, GAP_FILLED/GAP_FILLED and mixed pairs pass when their classification gates pass. No family-equivalence test is performed by these consumers. Mixed scientific equivalence remains UNQUALIFIED.
- Ordinary equal, increasing and decreasing values, zeros and subnormals were tested. Null/missing/nonfinite concentration excludes a record. Zero is not failure. No physical chlorophyll range is introduced.
- Existing source four-decimal rounding maps literal -0 to +0; negative subnormal rounds to -0. Exact capture v2 preserves a literal normalized -0 and differentiates its identity from +0. This review records existing source/rounding behavior, without canonicalizing signs or changing precision. Future signed-zero preservation remains binding.
- An ordinary control exposed a separate mismatch: clarity leaf emits **clear-surface-water** for concentration .1, while persistence ranks **clear-blue-surface-water**. Both .1 endpoints are excluded by clarity; productivity accepts them. This classification-vocabulary compatibility finding is separate from numeric overflow and needs separate review. No repair or classification change is authorized.

## Synthetic versus production history

The synthetic wrapper object, available=true assertion and numeric-diagnostic IDs are SYNTHETIC_ONLY. Endpoint fields, copied represented times and verbatim leaf output shapes are PRODUCTION_DERIVABLE; their extreme values remain synthetic. Existence of real database records, selected shared payloads and revision winners is UNKNOWN external/policy evidence. It is not an unidentified consumer.

Read-only source trace: getOceanConditionsAtAssessment calls retrieveOceanMemoryRows with configured retrieval and normalized bearer token for captain-owned Ocean Memory, exact location, observed_at ascending and maximumRows=48. It supplies no observedAfter/observedBefore. Row adaptation checks matching identity, schema/contract and time metadata. HistoricalSnapshotQuery requires storage/snapshot availability, nonempty versions and valid time, applies optional filters and sorts/deduplicates. OceanMemoryTimeSeries then passes selected history to OceanPersistence and the two leaf consumers.

This implemented authenticated request path is not a qualified shared historical selector. No database/Auth/Supabase access occurred. No full synthetic storage record was promoted as proof a production record exists. Rejecting the stripped wrapper does not prove all production representations of the condition are impossible. The exact result is **PRODUCTION_REACHABILITY_UNESTABLISHED**, not CURRENTLY_PRODUCTION_REACHABLE or enforced production unreachability.

EnvironmentalObservationV1 can represent both finite endpoints through separate synthetic direct/reconstructed Frames with sample address, represented support and lineage. This proves representability only. Passing these primitives directly to persistence gives unavailable: they are not interpreted snapshot-history adapters. Publication V3 freezes/binds history references but does not reconstruct the missing shared payloads or supply consumer-aware selection. Preserve CONSUMER_AWARE_POLICY_REQUIRED and HISTORY_SELECTION_POLICY_REQUIRED. No history window, retention, gap, revision winner or mixed-family policy is invented.

## Dependency inventory and required locality

| Consumer/result | Dependency disposition | Boundary |
|---|---|---|
| Endpoint source facts; single-time productivity/clarity leaves | INDEPENDENT | Temporal failure does not rewrite concentration, source identity or its original classification; own freshness/provenance gates remain binding. |
| Productivity delta, combined classification/lifecycle/reason | MUST_FAIL_WITH_DERIVATION | Existing combined formula cannot treat infinite change as valid; no unreviewed rank-only fallback. |
| Clarity rank/lifecycle calculation in isolation | INDEPENDENT | Bounded rank calculation is finite and independent of concentration subtraction; cannot certify the current full tuple containing failed delta. |
| Full productivity/clarity feature tuple | MUST_FAIL_WITH_DERIVATION | Returned required numeric content may not contain nonfinite change and claim available science. |
| buildTemporalFeatureContinuity | MUST_FAIL_WITH_DERIVATION | Its time/lifecycle gates do not validate concentration change. Failed dependent lifecycle/confidence must not establish usable continuity. |
| buildOceanPersistence featurePersistence/featureContinuity, assessedFeatureCount and continuitySummary | MUST_FAIL_WITH_DERIVATION | Do not count failed feature/continuity as successfully assessed. Top-level legacy availability/confidence comes from separate persistenceEvidence, not these concentrations. |
| buildOceanEvolution featureEvolution/lifecycleSummary; buildTemporalOceanExplainability summaries | MUST_FAIL_WITH_DERIVATION | Forwarded finite labels and confidence can depend on invalid upstream arithmetic. Serialization alone cannot validate them. |
| buildGovernedOceanSignalFeatureAssociationV1 | MUST_FAIL_WITH_DERIVATION | Generic consumer admits persistence metadata; separate identity gate currently remains unresolved, so no actual association or downstream impact is claimed. |
| buildGovernedEnvironmentalDirectionEvidenceV1 | MUST_FAIL_WITH_DERIVATION | Requires established association and matching feature lifecycle; it does not independently check concentration delta. No reachable direction consequence is claimed. |
| assessOceanOpportunity.persistenceContext and snapshot/returned diagnostic wrappers | DOCUMENTARY | Explicit persistence context does not change Opportunity scoring. No species, eligibility or ranking result tested. |
| Semantic projection, exact serialization, Frame/archive/publication numeric body validation | MUST_FAIL_WITH_DERIVATION | Strict copy/finite-number boundaries reject nonfinite bodies; opaque references are not payload-science validation. |

Only the two persistence functions directly calculate/read concentrationChangeMgM3 in production source. Other consumers above use their feature contract, labels, lifecycle, counts or confidence. No relevant direct delta consumer remains unidentified in the searched backend/shared scope.

The chlorophyll-specific basis for locality is separation of finite endpoint leaves and temporal feature contracts, plus existing insufficient-history outputs that retain endpoints while declining temporal conclusions. Current-vector locality remains qualified and unchanged; it is not imported wholesale.

**Required future invariant:** every temporal numeric derivation must be finite before that fact or any dependent result is admitted. Source validation and temporal-result validation are separate. Preserve valid endpoint evidence and independent finite facts under their own requirements. A later arithmetic failure does not rewrite source truth. A finite clarity rank cannot certify a whole tuple containing -Infinity; no alternate rank-only contract is approved here.

Existing fields can represent failure: available=false, classification=unavailable, lifecycleState=null, nullable concentration change, confidence 0/Unavailable, reason and limitations. A diagnostic-only construction retains endpoints and causes continuity to fail closed. **No new enum is required.** The reason must distinguish arithmetic invalidity from provider missingness; no-history/provider-missing reasons would be misleading. No production failure adapter is implemented.

Flipping available alone is insufficient: continuityAssessmentAvailable tests governed type, chronology and lifecycle even when persistenceAvailable=false. Failed dependent lifecycle and unsupported confidence must also be withheld. The existing failed clarity tuple yields continuity-supported from strengthening; productivity weakening yields continuity-not-established but an available assessment. This demonstrates shared low-level admission, not species impact.

## Capture, replay, projection, archive and publication

Current capture v1/v2 stores normalized concentration, waterClassification, observedAt, coordinates and exact source/family metadata. It does not store the later temporal result; age-at-assessment is not an endpoint capture field. Accepting finite extreme endpoints is not a capture defect. No successor/schema relaxation is required for this diagnostic.

Identical endpoint/leaf/history inputs reproduce the same failure deterministically: **REPLAY_PRESERVES_DERIVED_FAILURE**; **REPLAY_EQUIVALENCE != DERIVED_SCIENCE_VALIDITY**. Preserve old source records and identities. Historical derived outputs, if any, retain their as-used evidence and limitations; this task asserts no contents of real historical stores.

Projection v1/v2 strict copy rejects nonfinite content before surface partitioning, including documentary or unknown fields. Quarantined v3 also calls strict copy by source inspection; no v3 test or requalification is claimed. Exact scientific serialization rejects nonfinite numbers. Frame/archive finite validation rejects nonfinite bodies. Publication copy rejects nonfinite content; opaque references cannot authenticate the scientific validity of unresolved payloads. Finite labels/counts based on failed arithmetic need dependency validation even if serializable.

Legacy structuredClone/deepFreeze and Ocean Memory metadata validation are not recursive finiteness guards. No qualified end-to-end archive/publication/history write path carrying this temporal result was demonstrated. Synthetic feature/continuity admission is not proof of governed current-candidate admission. Opportunity persistenceContext is documentary. Focused tests do not execute the full aggregator, Ocean Physics or species evaluation.

## Sibling audit and amendment ownership

The chlorophyll functions duplicate subtraction/rounding; no shared subtraction helper exists. The common feature wrapper spreads values. Bounded rank/freshness differences and valid Date spans remain finite. Finite subtraction produces finite or either infinity, not NaN. There is no concentration log/ratio or elapsed-time denominator; no finite-input NaN was observed in these scoped calculations.

The same first/last subtraction pattern exists in SST temperatureChangeFahrenheit and current speedChangeKnots. Synthetic +/-1e308 low-level histories reproduce -Infinity there too. These are input-contract diagnostics, not proof the SST Celsius converter emits those Fahrenheit endpoints or the magnitude converter emits negative speed. Carry those repeated sites into temporal-derived safety review; do not generalize to uninspected feature formulas or convergence.

Classification: **SOURCE_NORMALIZATION_INPUTS_VALID_BUT_TEMPORAL_DERIVATION_INVALID**. Correction ownership: **TEMPORAL_DERIVED_SCIENCE_AMENDMENT**, with **HISTORY_SELECTION_POLICY_FIRST** for production admission. Existing parser defects remain separate. The cross-route delta must distinguish source type/missingness, endpoint conversions and downstream temporal finiteness/dependency propagation. Checking a source once cannot qualify every later derivation; rejecting a valid endpoint solely because a later relationship fails is also unsupported.

## Verdict and next gate

**CHLOROPHYLL_TEMPORAL_DERIVED_FINITENESS_SCOPE_QUALIFIED**, limited to the diagnosed arithmetic/admission/dependency boundary. The explicitly unestablished item is governed production historical reachability, for which this task permits a history-policy prerequisite result.

Next: **CONSUMER_AWARE_POLICY_REQUIRED / HISTORY_SELECTION_POLICY_REQUIRED** — qualify shared payload resolution and chlorophyll environmental identity, represented support, revisions, admissibility/cutoff/gaps and DIRECT/GAP_FILLED treatment. Then return to cross-route finiteness review with this temporal-derived scope and bounded sibling findings. The clarity-label mismatch requires separate compatibility review. No implementation is authorized by this scope verdict.

Numeric-string compatibility, provider-fill and legacy SST-coordinate fallback remain OPEN. Current-vector failure locality remains QUALIFIED. Tasks 12B.6C and 9E-D remain PAUSED; convergence/Ocean Physics untouched and paused; NOAA SME response pending externally.

## Source anchors

- [Direct parser](../backend/server.js#L2045), [gap-filled parser](../backend/server.js#L2168), [productivity leaf](../backend/server.js#L11566), [clarity leaf](../backend/server.js#L21655).
- [Productivity persistence](../backend/server.js#L33194), [clarity persistence](../backend/server.js#L33870), [feature wrapper](../backend/server.js#L23787), [continuity](../backend/server.js#L26071).
- [History query](../backend/server.js#L18952), [time series](../backend/server.js#L20780), [production handoff](../backend/server.js#L61421).
- [History policy](Temporal_History_Selection_Semantics_v1.md), [shared-history source limits](Immutable_Scientific_History_Context_v1.md), [temporal primitives](Governed_Temporal_Evidence_Primitives_v1.md).
- [Capture v1](../backend/currentEvidenceCapture.mjs), [capture v2](../backend/currentEvidenceCaptureV2.mjs), [exact serialization](../backend/exactScientificEvidence.mjs), [publication](../shared/oceanPublication.mjs).

Symbol-level line ranges and SHA-256 hashes, additional consumer sources, locked source reports and all protected artifacts are recorded in JSON. Sources are local repository contracts; no external acquisition.

## Verification and preservation

Passed: 19 focused tests; all 75 network-blocked backend/shared test scripts; 143 JavaScript syntax checks; 73 JSON parses. The final failure-shape test was added during the broader run and the completed 19-test focused suite was then rerun successfully. Required prior counts retained: resumed cross-route 11; locality 11; failure-state 8; current-derived 20; prior cross-route 7; SST 6; normalization 10 with its 450-case matrix; temporal primitives 100; temporal history 13; exact scientific evidence 160; Task 11E 56. Capture, scalar/Frame/archive, chlorophyll, Opportunity/governance and historical diagnostics are included in the full pass.

The existing quarantined candidateSemanticProjectionV3 test was excluded from execution, not requalified. Its source syntax and preservation hashes remain checked. Logs and the exact additive diff are ignored under .local/ocean-quarantine/chlorophyll-temporal/.

All **119 pre-existing untracked artifacts remain byte-identical**, with before/after SHA-256 pairs in JSON. Git now has **123 untracked files: 119 protected plus these four new artifacts**. Tracked and staged diffs are empty; branch/HEAD unchanged. New-file whitespace, reference resolution and git diff --check pass. No production edits, provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment. Left UNCOMMITTED.
