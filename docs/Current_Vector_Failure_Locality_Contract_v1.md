# Current vector failure-locality contract v1

**CURRENT_VECTOR_FAILURE_LOCALITY_CONTRACT_QUALIFIED** — normative contract qualification only; not runtime compliance, implementation approval, or full source qualification.

Task 12B.7F. HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`; branch `codex/pelora-remote-setup`.

## Decision and scope

Adopt **derivation-local failure with consumer-specific required groups**. Valid normalized source evidence is retained without upgrading its authority. A failed numeric derivation invalidates that fact and results requiring it. It does not retrospectively change the components into provider missingness. This is a newly authored normative decision, not a claim that prior source code already enforced it.

A preserved component is not unconditionally usable. Every consumer must independently meet its source, time, provenance, quality, required-representation and output-validity conditions. Existing complete-vector capture predicates remain binding. No physical maximum, formula, threshold, enum, parser, capture or runtime change is authorized.

## Source and derived authority

The point producer is `getCurrentConditionsPointAtAssessment` (`backend/server.js:2345`). Provider `u_current`/`v_current` become normalized `eastwardMetersPerSecond`/`northwardMetersPerSecond` in m/s after current conversion and rounding. Provider time becomes `observedAt`. Provider coordinate fields, where supplied and validated, support resolved coordinates; requested coordinates are Pelora request geometry. Fallback-resolved coordinates are not promoted to independent provider facts. Provider/dataset/variable/unit/classification metadata describe provenance; source `availability` is Pelora's assessment of the response, not an independent provider measurement. `ageHours` is assessment-relative and must not replace represented time. Cache metadata is operational.

Speed, heading, strength and compass descriptions are Pelora-derived. Projection norm, radial/tangential components, inward/outward magnitudes, alignment, opposing differences, gradients, axis maxima, counts, coverage and availability are also derived. The present null speed does not encode whether the cause was absence or failed arithmetic. A future consumer must retain the cause at its result/exclusion boundary; it must not infer a cause from null alone.

## Required groups and failure locality

| Fact/group | Producer and consumer requirements | Normative failure disposition |
|---|---|---|
| u/v source pair | Point normalizer; caches, spatial components, capture | Invalid/missing components fail consumers requiring them. Valid components are preserved after later failure; preservation is not unconditional use permission. |
| Speed in knots | Square/sum/sqrt then knots conversion; speed-based evidence, quality, available capture | Speed unavailable on failed required arithmetic. These consumers fail their own speed prerequisite. Direction and components are not automatically invalidated. |
| Heading | `currentDirectionDegrees`, atan2 and heading conversion; evidence, capture, directional readers | Failure is local to heading and consumers requiring it. Keep valid components/speed where independently permitted. Zero is not failure; retain existing heading convention. |
| Projection bundle | `buildCurrentVectorProjectionAnalysis`; magnitude, radial/tangential and alignment facts | A nonfinite required member prevents this existing bundle from claiming available. Norm-dependent alignment is invalid when norm fails even if a later division yields a finite number. Do not count the failed bundle as valid derived coverage. |
| Independent radial/tangential fact | Cardinal dot products; a consumer may need only these | May be recomputed from admissible components with its own complete finite checks and governance. Do not silently salvage it through an invalid available bundle. No new split result is implemented here. |
| Axis difference/gradient bundle | `buildCurrentGradientAnalysis`; finite projections/coordinates and positive finite separation; shear admission | Required delta, norm, ratio or other emitted scientific numeric failure invalidates that axis result and dependent uses. Other axes/source observations are not automatically invalidated. |
| Supplemental speed/heading differences | Axis `speedDifferenceKnots` and `directionDifferenceDegrees` have independent finite-input/output guards | Existing nullable supplementary comparisons are not prerequisites for component gradients. Their absence/failure blocks consumers requiring those comparisons, not an otherwise valid component-gradient axis. |
| Aggregate maxima/counts/coverage | Projection and gradient summaries | Recompute only from valid required members, validating arithmetic again. Existing minimum counts remain unchanged. Complete requires all requested members required for that result to be valid; partial/unavailable follow existing count semantics. |
| Strength/compass descriptions | Finite speed/heading helpers | No claim based on a failed underlying fact. These labels cannot restore numeric authority. |
| Quality and current evidence | Center speed/heading/age predicates; supplied spatial payload retained separately | A failed required value cannot satisfy that consumer. Quality complete about other layers is not a validity certificate for every spatial fact. No quality formula broadening. |

The projection bundle's nullable alignment at legitimate zero norm is an existing non-applicable result, not failed arithmetic. Nullable optional/documentary fields need not invalidate unrelated required facts. Every emitted numeric scientific field must be finite if emitted as a usable number; a required null blocks the result. At current bundle granularity, absent per-field validity cannot be used to claim a whole bundle available while required fields failed.

Exact required projection numerics are its finite components, `vectorMagnitudeMetersPerSecond`, `signedRadialMetersPerSecond`, `inwardMetersPerSecond`, `outwardMetersPerSecond`, `signedClockwiseTangentialMetersPerSecond`, `absoluteTangentialMetersPerSecond`, and alignment when norm is positive. Copied nullable speed/heading do not become new projection prerequisites. Coordinate requirements remain consumer-specific: axis construction needs finite coordinates and positive finite separation even when a cardinal projection does not. Required axis numerics are separation, eastward/northward/total differences, total gradient, opposing radial sum, radial asymmetry and its gradient, tangential difference and gradient. Supplemental speed/heading comparisons remain nullable under their existing separate guards (`server.js:4155–4274`). Counts and maxima must be finite after aggregate calculation; a null maximum is not a usable measurement or a certificate that retained axes are valid.

For the failed-speed case specifically: the source pair remains retained and source availability is not rewritten; finite heading remains a separately valid numeric derivation subject to its own governance; speed is unavailable. A **complete speed-and-heading vector result** is unavailable because speed is required. A container retaining these fields has no universal all-science-valid status. Component-based consumers may proceed only under their independently satisfied requirements. This is local failure, not blanket approval of a partial vector.

## Dependency graph and recomputation

Source u/v → speed → speed-requiring evidence/quality/capture.

Source u/v → heading → heading-requiring evidence/directional readers/capture.

Source u/v + cardinal geometry → projection norm and dot products → alignment and projection bundle → eligible axis inputs.

Eligible opposing components/projections + positive finite spatial separation → deltas → delta norm/ratios → axis bundle → finite-axis summaries and current spatial consumers.

Counts depend on **admitted valid results**, not merely source presence. Time/provenance/source gates constrain every applicable edge. Higher-order convergence/Ocean Physics is not entered.

A consumer may independently recompute from preserved source facts only if it validates all required inputs, intermediate prerequisites and final scientific outputs for its own computation. A finite final number is insufficient if it resulted from an invalid required intermediate (for example, finite alignment after division by infinite norm). Temporary overflow that is detected and rejected is permitted; no algorithm replacement is prescribed. Recalculation must not inherit validity from source availability or from a sibling result. A consumer requiring speed cannot substitute projection magnitude or silently switch units/algorithms under this contract.

## Normative clauses

1. **SOURCE PRESERVATION:** Retain accepted source evidence and provenance as used; do not manufacture missingness or overwrite history because a later operation failed. Retention does not bypass any schema or admission predicate.
2. **DERIVED-FACT LOCALITY:** A failed fact is unavailable for scientific use. Invalidate its required derived group at the existing result granularity; do not automatically poison unrelated source facts or families.
3. **DEPENDENCY PROPAGATION:** A required failed dependency prevents a dependent result from being admitted. An alternative derivation is allowed only through independently governed and validated computation.
4. **INDEPENDENT RECOMPUTATION:** Recheck required source/geometry/time/provenance conditions and complete arithmetic validity. No inherited scientific authority from mere presence.
5. **FINITE-RESULT REQUIREMENT:** No nonfinite numeric fact may be admitted. Required intermediate facts must also be valid; validating only a final rounded number is insufficient.
6. **AVAILABILITY LOCALITY:** Source availability, derived-fact availability and consumer-result availability are separate conceptual meanings, not new production enums. An available source cannot certify a failed derived result.
7. **COVERAGE LOCALITY:** Presence counts may be retained as presence evidence. Derived coverage counts only valid required members. Existing minimum coverage thresholds are unchanged.
8. **QUALITY LOCALITY:** A failed prerequisite cannot satisfy or improve the quality of a consumer requiring it. Existing quality scopes remain unchanged; complete quality is not universal derived validity.
9. **COMPLETE:** All requirements for that particular result must pass. Unrelated optional derivations are not new prerequisites.
10. **SIGNED ZERO:** Preserve legitimate ±0 under the exact evidence contract. Zero is not a numeric failure. Existing producer rounding loss is not excused or repaired by this contract.
11. **MISSINGNESS:** Distinguish source null/missing, valid zero and arithmetic failure. Existing acquisition/missing-source states must not be relabelled to hide failed derivation.
12. **TEMPORAL/PROVENANCE:** Finite arithmetic is not sufficient authority. Existing represented-time, freshness, future-evidence rejection, source and quality rules continue to apply. No new synchronisation policy is authored.
13. **REPLAY:** REPLAY_EQUIVALENCE != DERIVED_SCIENCE_VALIDITY. Deterministic reproduction of invalid derived output is not successful science.
14. **HISTORY:** Preserve historical source and derived evidence as used, including its version and limitations. Do not retrospectively certify invalid/ambiguous outputs under this contract.
15. **SPECIES NEUTRALITY:** Apply before species interpretation without species-specific exceptions. No biological, score, eligibility, confidence or ranking implication is established.

## Existing vocabulary and reason mechanisms

Existing projection failures already return `available: false` and `reason` (`server.js:3557–3581`); axis failures use the same structure for missing opposing projection or invalid separation (`4053–4095`). Existing aggregates distinguish partial/unavailable coverage; numeric fields permit null at applicable evidence/capture boundaries. These structures can express local failure without a new status enum. An arithmetic failure must use a truthful derived-result reason/exclusion identifying the failed fact/operation, rather than reusing `missing-current-vector-components` when components exist. This defines required reason semantics, not a new literal error vocabulary or captain-facing copy.

The normalized point/capture source profile is closed and must not receive an invented field. Its null speed alone is insufficient as a cause report. Preserve causality in the existing derived consumer reason/exclusion context during a future amendment. Exact wiring and reason text require implementation review; no new enum is demonstrated necessary. **EXISTING_STATE_VOCABULARY_SUFFICIENT; NO_NEW_ENUM_REQUIRED.** Existing structures are sufficient for this contract's states, not a claim that every current producer already emits the required explanation.

An actual inline-quality control exposes a specific reporting gap: failed speed yields current layer `unavailable`, but its existing source-state fallback emits reason `available` (`server.js:60829`). That reason is not an arithmetic-failure explanation. Future reason mapping must distinguish retained source status from failed required derived speed. The same unchanged quality block classifies a controlled 145-hour ordinary observation as stale; this probe does not choose or alter the existing age limit.

## Adversarial findings and compatibility reconciliation

* Finite `(1e200,1)` produces speed null, finite heading and finite projection magnitude. This is an actual independent derivation control. Component preservation is meaningful; speed-requiring results still fail. Finiteness alone does not grant physical or source qualification.
* `(MAX_VALUE,MAX_VALUE)` produces source available and null speed while projection magnitude is Infinity and current coverage complete. Normative result: failed projection bundle unavailable, excluded from valid coverage; preserve source components. Current output violates the new contract.
* Opposing extremes produce nonfinite deltas/gradients despite admitted pairs. Those axes and dependent summaries/consumers must fail closed. Source vectors and any independent finite facts are not automatically deleted.
* Multiple failures propagate only along required dependencies. A finite heading cannot rescue speed or gradient. Likewise projection's finite norm at 1e200 does not replace failed normalized knots for speed consumers.
* Missing/null components fail their source prerequisites. Internal nonfinite inputs are not JSON numeric transport. Existing null-derived-speed-to-zero behavior remains an open normalization defect, never legitimized here.
* All four ±0 pairs remain available in the observed source path; zero projection norm legitimately has null alignment. Exact serialization preserves signs even where existing normalization rounding does not.
* Current age reassessment rejects future evidence and distinguishes age without replacing represented time. A retained stale observation does not become live because a recomputation is finite. No stale duration is invented.
* Prior controlled quality evidence can be complete with an ordinary center and bad neighbor projection. This does not contradict locality: that quality block checks its own center/core/supporting prerequisites, not every spatial result. A consumer requiring the failed projection cannot borrow that quality label.

Contradiction search reviewed source/capture validators, exact serializer, prior current-vector reviews, point/spatial/quality consumers and capture regression contracts. No universal locked rule was found requiring every derived failure to erase source components or granting every finite component unconditional usability. Available capture's all-four-finite requirement is reconciled as a **capture-specific required group**, not overridden. Current source/component continuation versus speed rejection describes consumer-specific admission, not a global guarantee. Existing nonfinite admission is a demonstrated behavior to amend, not a locked authority to preserve.

## Capture, replay, publication and history

Current capture v1/v2 includes components, speed and direction; `source.available` requires all four finite. Therefore **not every preserved component-only point is capturable as available under existing schemas**. Do not change source availability to get it through validation. Where normalized evidence already satisfies capture requirements, later derived failure does not retroactively invalidate the capture; captures do not certify every later operation. This contract does not require a successor, nor approve a new route for capturing rejected partial points. Any future requirement to persist those points must undergo separate compatibility review.

Prior unavailable-state capture substitution was diagnostic only. Exact replay may reproduce downstream failure from an accepted diagnostic shape, without qualifying a production source. Historical capture/Frame/archive identities remain immutable. Nonfinite publication scientific content is rejected by exact serializer and strict publication copy. Earlier snapshot retention is not publication admission. No database/history scan, rewriting or migration occurs.

## Next gate and exclusions

**CROSS-ROUTE POST-CONVERSION FINITENESS & FAILURE-ATOMICITY REVIEW**, using this normative current-vector boundary. Proposed delta: preserve source truth; require consumer-specific complete finite groups; propagate dependency failure; independently validate recomputation; count valid derived coverage; preserve local reasons; reconcile available capture and quality scope. Eventual amendment scope includes upstream validation **and derived-science admission**, not just normalized speed.

No blocking contradiction remains for this normative locality contract. Runtime violations remain unfixed. Implementation mapping/tests, numeric-string compatibility, provider-fill qualification and legacy SST coordinate fallback remain open; partial-point persistence is not approved. Task 12B.6C and Task 9E-D remain PAUSED. Convergence/Ocean Physics remains paused; NOAA SME response remains pending. Finite current-vector facts do not qualify convergence science.

Verification and preservation results are recorded in the companion JSON. Only this report, its JSON and the new test are created. No production changes, provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment.

## Final verification

11/11 focused tests passed, including the final optional-comparison refinement. All **73 non-quarantined backend/shared regression scripts passed**; prior required focused counts were 8/20/7/6/4/10, with 450 transport cases retained. The quarantined projection-v3 draft was excluded. All 139 JS/MJS syntax checks and 71 JSON parses passed. Repository references and new-file whitespace checks passed; `git diff --check` passed. All 112 pre-existing untracked artifacts are byte-identical. No tracked or staged changes; 115 untracked files comprise the original 112 and these three additions. Exact additive diff and Git status are retained in ignored `.local/ocean-quarantine/task12b7f-locality/new-files.diff` and `git-status.txt`. Everything remains uncommitted.
