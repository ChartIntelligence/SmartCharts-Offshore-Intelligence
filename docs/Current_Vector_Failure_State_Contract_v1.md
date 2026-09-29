# Current vector required representations and failure-state contract review v1

**CURRENT_VECTOR_FAILURE_STATE_REQUIRES_NEW_CONTRACT**

Secondary: **NEW_FAILURE_STATE_CONTRACT_REQUIRED**. This means a new normative definition of failure locality and allowed consumption is required; it does **not** establish that a new enum, field, capture version or formula is required.

Task 12B.7F; branch `codex/pelora-remote-setup`, HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`. Contract decision only. The repository does not support selecting whole-vector atomicity, derivation-local failure or a globally governed partial-vector state as the already established contract. No implementation is approved, and the prior cross-route STOP is not cleared.

## Scientific objects and authority

**A — Source components.** `u_current` and `v_current` are provider values normalized to `eastwardMetersPerSecond` and `northwardMetersPerSecond` in m/s. They are source-derived component evidence, not values reconstructed from speed. Normalization, rounding, source availability, provenance and assessment-time governance intervene before consumption. Finite acceptance does not independently establish physical plausibility, provider-fill qualification or complete source authority. Existing malformed-input findings remain open.

**B — Vector representations.** The point producer also calculates speed and direction. Available current capture v1/v2 requires all four numeric fields finite; speed-based scientific consumers likewise require speed and direction. Other consumers require only components. The schemas do not make speed/direction optional for every meaning of “available current.”

**C — Spatial derivations.** Cardinal projection, alignment, component differences, norms and gradients have separate input predicates, counts and outputs. Their validity is not equivalent to source availability. This separation follows executable consumers and capture scope, not merely object nesting.

**D — Higher-order interpretation.** Convergence/Ocean Physics is excluded. No conclusion about either is made. Existing species/history readers are mapped as boundaries without running or requalifying them.

The locked capture documentation, `Governed_Current_Product_Evidence_Capture_v1.md`, explicitly defines a **normalized point-source subset**, retains speed/direction/components, excludes operational derived descriptions and cache metadata, and leaves full reconstruction/source qualification unqualified. `Exact_Scientific_Evidence_Serialization_v1.md` establishes exact finite-number fidelity and signed-zero preservation; it does not decide every later derivation's validity.

## Required-representation ledger

Only the requested categories are used. These are descriptions of current requirements; they do not establish a universal new vector policy.

| Representation | Classification | Evidence / scope |
|---|---|---|
| u | `SOURCE_REQUIRED` | Finite eastward component required for a complete source vector, cache admission, component projection and available capture. An unavailable point may retain only the other component. |
| v | `SOURCE_REQUIRED` | Same northward requirement. |
| Speed | `DERIVED_REQUIRED_FOR_SPECIFIC_CONSUMER` | Required by available capture, speed-based current evidence, spatial aggregate validity and current quality; not required by component projection. Universal membership remains unresolved. |
| Direction | `DERIVED_REQUIRED_FOR_SPECIFIC_CONSUMER` | Required by available capture, current evidence/quality and directional comparisons. No heading-optional global contract exists. |
| Projection magnitude | `DERIVED_REQUIRED_FOR_SPECIFIC_CONSUMER` | Used as alignment denominator for positive norm; independently emitted scientific fact. Gradient does not require this field. Current finite-output admission is incomplete. |
| Radial/tangential projections | `DERIVED_REQUIRED_FOR_SPECIFIC_CONSUMER` | Gradient input predicates require finite projection values. No convergence semantics reviewed. |
| Component differences / total difference norm | `DERIVED_REQUIRED_FOR_SPECIFIC_CONSUMER` | Inputs to the corresponding spatial gradient facts. |
| Gradient values | `DERIVED_REQUIRED_FOR_SPECIFIC_CONSUMER` | Finite gradient quantities required by downstream shear admission; axes currently lack complete output-finiteness checks. |
| Aggregate maxima | `DERIVED_REQUIRED_FOR_SPECIFIC_CONSUMER` | Nullable summaries of admitted axis facts; their nullness does not erase retained axes. No universal optionality claim. |
| Strength/compass explanatory labels and method descriptions | `DOCUMENTARY` | Descriptive representations derived from speed/direction, not independent component measurements. This does not claim all readers ignore them. |
| Universal required vector set; component retention after required failure | `UNRESOLVED` | Capture, component and speed-based boundaries impose different requirements; no precedence rule resolves them. |

`speed = null` means no accepted normalized numeric speed. It has no emitted cause code establishing `VECTOR_INVALID`, `DERIVATION_FAILED` or `SPEED_UNAVAILABLE_ONLY` globally. Direction null likewise indicates no numeric direction; capture/consumer predicates determine their own admission. These nulls do not prescribe a whole-vector failure state.

## Consumer requirements and current behavior

Source locations and occurrence inventory are bound in the companion JSON, reusing the previous audit as discovery evidence and checking the current source predicates.

| Consumer | Requires | Null / nonfinite behavior |
|---|---|---|
| Point parser, `currentDirectionDegrees` | Finite u and v | Source availability follows components; nonfinite norm rejected by knots helper to null; heading computed separately. |
| `setCachedCurrentPoint` | Finite u and v | Retains a partial derived point; no speed requirement. |
| Current spatial aggregate | Finite u/v/speed/direction | Null speed/heading excluded from valid-vector counts; original finite fields remain in retained vectors. |
| Vector projection | Known cardinal role and finite u/v | Recomputes norm/projections independently; infinite magnitude can still be marked available. Null speed alone does not block it. |
| Gradient | Available projection, finite components/radial/tangential/coordinates, positive finite separation | Does not require finite projection norm. Can emit nonfinite deltas/ratios in available axes; guarded aggregate maxima become null. |
| Shear admission | Finite required axis gradients and coverage predicates | Nonfinite gradient axes excluded. No threshold or interpretation is amended. |
| `buildCurrentSpatialAnalysis`, `buildCurrentEvidence` | Finite speed/direction for current evidence | Null speed/heading means unavailable at this level; supplied spatialAnalysis may still be retained. |
| Strength/compass helpers | Respective finite speed/heading | Missing input gives unavailable/null description; no recomputation from u/v. |
| Current quality layer | Finite center speed/heading and existing age governance | Overflow-null center speed does not supply live quality. This layer does not inspect every spatial derivative. |
| Change/history/persistence readers | Governed speed/heading/time inputs | Existing finite guards and bounded direction normalization; no u/v reconstruction found. No history-policy qualification here. |
| Candidate negative-conclusion adequacy | Finite speed/heading/u/v plus source/time and other predicates | Component-only extreme does not satisfy finite-speed prerequisite. No eligibility/scoring execution or impact claim. |
| Existing species habitat reader | Normalized evidence speed/heading | Recorded as downstream boundary only. No species-specific contract or repair is selected. |
| Current capture v1/v2 | Finite-or-null fields; all four finite for source `available` | Available-source partial point rejected. Unavailable-state partial shape can be represented; that is not authorization to relabel source truth. |
| Snapshot representation | Container inputs | Structured clone preserves numeric values, including invalid derivatives; not numeric qualification. |
| Exact serialization, semantic v1/v2 strict copy, publication strict copy | Finite numeric content | Nonfinite content rejected. Later rejection does not validate upstream admission. |

No consumer is granted a new permission in this table. It does not claim complete scientific qualification of quarantined higher-order interpretation. The invariant gap is established without entering that interpretation.

## Partial validity and analogies

Current implementation already retains finite components while speed is null, and different consumers admit or reject them. This is evidence of **layered admission**, not a normative authorization of unrestricted partial validity. Available capture's all-four-finite rule is equally real evidence against treating speed as globally optional.

A controlled weather analogy has missing wind speed, valid gust/direction and wind source availability `available`. Independent fields can support partial family evidence. That does not prove that two representations of one vector have the same independence. SST has paired representations and different capture/projection predicates; its existing overflow behavior is a defect observation, not a precedent granting partial validity. Chlorophyll's single concentration and static evidence's separate spatial validity do not supply a matching current-vector failure contract. No analogy overrides direct current contracts.

## Missing source versus numeric failure

Actual parser controls demonstrate:

| Input condition | Normalized components | Speed | Direction | Source availability |
|---|---|---|---|---|
| Ordinary .5,.2 | .5,.2 | 1 knot | 68° | available |
| u absent | null,.2 | 0 | null | no-valid-pixel |
| v absent | .5,null | 0 | null | no-valid-pixel |
| Both absent | null,null | 0 | null | no-valid-pixel |
| Internal u = ±Infinity/NaN | null,.2 | 0 | null | no-valid-pixel |
| Finite u=1e200,v=1 | finite components | null | 90° | available |

The zero speed in missing-component cases is the already demonstrated null-magnitude conversion issue, **not** a newly approved meaning of missing current. Internal nonfinite controls are not representable JSON numeric values. Finite-source arithmetic failure is distinguishable in the full object from missing/nonfinite source input; null speed alone does not encode its cause. Do not equate derivation failure with provider-no-data or silently erase source components.

All four ±0 pairs remain source-available with zero speed and finite heading. Projection zero norm gives null alignment, not division-by-zero failure. Existing producer rounding loses some literal component -0 signs; that prior defect remains open. Exact serialization distinguishes -0 from +0. Future failure-state handling must not treat legitimate zero as numeric failure or canonicalize signed zero while correcting it.

## Availability, coverage and quality vocabulary

* Source `available`: both components finite. `no-valid-pixel`: empty/invalid-component numeric evidence in this parser; it is not a governed arithmetic-failure classification.
* Point/vector evidence `available`: finite speed and direction at the relevant consumer, with other consumer-specific conditions.
* Projection `available`: known axis and finite components admitted; derived norm finiteness is not independently checked. `complete` counts admitted projections, not guaranteed finite derived facts.
* Gradient axis `available`: eligible input pair and positive finite separation. `complete` counts admitted axis pairs; current code can retain invalid derived numerics.
* `insufficient`, `partial`, `unavailable` coverage: local count/coverage predicates; not universal source invalidity.
* Quality `live`, `stale`, `unavailable`, `degraded`: layer-specific values, age and provider outcomes. Overall `complete`, `usable-with-gaps`, `degraded`, `insufficient` aggregate core/supporting layers under existing formulas.
* Numeric null: absence of a numeric representation; no universal cause. Frame `invalid-observation` is a separate contract vocabulary, not automatically the parser's state.

A new controlled test uses ordinary center current with extreme neighboring components. The unchanged inline quality block reports current layer `live` and overall `complete`, while neighbor projection magnitudes are infinite. Companion quality inputs are controlled fixtures and actual marine parser output; this is an isolated quality-boundary test, not a full default evaluation. Source at `server.js:60927–60994` counts core wind/waves/swell/SST and supporting chlorophyll/currents/moon layers; it does not validate every spatial numeric result. Thus quality complete must not be promoted into universal derived validity. Changing what overall quality means would be a separate contract change.

## Candidate contracts: decision

**A — Whole-vector atomic:** matches some capture/evidence consumers. But automatically invalidating or rewriting finite components for every downstream failure is not established and could discard source evidence used independently elsewhere.

**B — Derivation-local failure:** matches the layered architecture and is a plausible future direction, but current capture and speed-based contracts do not permit declaring the entire current observation available with arbitrary missing derivatives. Existing projection continuation is not proof that its failure behavior was scientifically authorized.

**C — Explicit partial vector:** could make permitted consumers explicit, but no existing global partial-vector state or transition contract was found. Choosing its meaning now would author a new contract.

**Decision: `CURRENT_VECTOR_FAILURE_STATE_REQUIRES_NEW_CONTRACT`.** Repository evidence can establish the layer boundaries and contradictory requirements, but cannot select A/B/C as existing scientific authority. `NEW_FAILURE_STATE_CONTRACT_REQUIRED` concerns semantics and transition/admission rules. Existing null/availability states can encode some shapes, so a new enum is **not** demonstrated necessary; reusing those states requires an explicit meaning rather than accidental reinterpretation.

## Minimum future invariants supported by existing safeguards

1. Numeric source components admitted as numeric evidence must be finite; this does not settle source type/fill qualification.
2. Every numeric scientific result must be validated finite **before admission** at the boundary that derives it. Temporary overflowing intermediates may be rejected; no formula replacement is implied.
3. Downstream recomputation cannot bypass output validity merely because its inputs were finite or a previous consumer returned null.
4. A consumer must satisfy its own required representations. Source availability, projection coverage and aggregate quality cannot certify an unrelated failed derivative.
5. Preserve source truth and history; arithmetic failure is not provider missingness. Retention versus continued scientific use must be separately specified.
6. Preserve legitimate zero and exact signed zero at sign-preserving transformations; no truthiness validation, arbitrary cap or physical-range threshold.

These are review requirements, not implemented admission rules or a selected whole-vector policy. Architectural scope must include **upstream normalization plus derived-science finiteness and admission contracts**. Upstream speed guarding alone cannot close the demonstrated recomputation path.

## Capture, replay, history and publication

Capture responsibility does not end at u/v: the existing available CURRENTS schema includes speed and direction. Its pure finite normalized subset does not promise validity of every future calculation. Ordinary actual-parser output captures and replays exactly. Available-source partial output is rejected. A diagnostic unavailable-source partial shape is accepted; this does not license rewriting actual source availability. Earlier exact replay of that labelled diagnostic reproduces failed downstream derivation. Replay fidelity is correct relative to supplied accepted bytes, not proof of producer admissibility or downstream scientific validity.

Historical u/v and identities must remain as used. An old derived null or invalid/ambiguous derived result does not authorize reconstructing a different source observation or rewriting archives. Publication strict recursive copy and exact scientific serialization reject nonfinite numeric facts; current projection rejection is rechecked. Snapshot cloning can retain malformed derived facts before these later guards. No publication/capture/schema amendment is selected.

Source components, vector representations and spatial relationships can all be retained in current candidate containers. Speed-based evidence may become unavailable while retaining supplied spatial payload. Retention must not be confused with permission to use failed numeric facts. No species, confidence, eligibility or ranking consequence is established here.

## Proposed scope delta and next gate

Do not modify 12B.7D or the normalization candidate. The proposed review delta adds an explicit required-representation table **per consumer**, separates source retention from scientific admissibility, defines failure locality and state transitions, and verifies compatibility with available capture and quality meanings. Scope includes point speed/direction, projection norm/alignment and gradient/difference outputs. No new formula, state enum or runtime helper is approved.

**Next gate: EXPLICIT CURRENT-VECTOR FAILURE-LOCALITY CONTRACT AUTHORING AND APPROVAL.** The decision must state whether source components may remain consumable after a required derivation fails, by which consumers, and how that state differs from missing source and complete vector evidence. It must reconcile available capture and quality semantics. Another overflow probe cannot supply this missing normative decision. After approval, return to cross-route finiteness/atomicity review; no implementation or six-route resumption occurs now.

## Preservation and verification

The companion JSON records the representation ledger, consumer requirements, decision options, controls, exact verification results and before/after hashes for all 109 protected artifacts. The new focused suite has eight tests. Ignored execution evidence resides in `.local/ocean-quarantine/task12b7f/`. Only this report, its JSON and the new test are deliverable additions.

Task 12B.6C and Task 9E-D remain PAUSED. Numeric-string policy and provider-fill qualification remain OPEN; legacy SST coordinate fallback remains a separate open gate. Convergence/Ocean Physics remains paused; NOAA SME response remains pending per user context. No production changes, historical reinterpretation, provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment.

Final verification: **8/8 focused tests; 72/72 non-quarantined backend/shared regression scripts passed**, including prior 7E/7D/7C/7B/7A counts 20/7/6/4/10 (450 transport-state cases). Quarantined projection-v3 draft was excluded from execution and preserved. All 138 JS/MJS syntax checks and 70 JSON parses passed; new-file whitespace and repository-reference checks passed. The final test edit was rerun successfully. All 109 protected file hashes match. Tracked and staged diffs are empty; 112 untracked files comprise the original 109 plus these three additions. `git diff --check` passes. Exact additive diff and final status are retained in ignored `.local/ocean-quarantine/task12b7f/new-files.diff` and `git-status.txt`.
