# Current vector derived-representation finiteness and admission v1

**SOURCE_NORMALIZATION_FAILURE_STATE_CONTRACT_REQUIRED**

Task 12B.7E, review only; branch `codex/pelora-remote-setup`, HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`. The arithmetic/admission findings below do not establish an approved whole-vector failure state or authorize implementation. `CURRENT_VECTOR_DERIVED_REPRESENTATION_SCOPE_QUALIFIED` is not claimed.

## Counterexample and actual handoffs

Synthetic NOAA JSON supplies u = v = `1.7976931348623157e308` (`Number.MAX_VALUE`). Both remain finite normalized components. The actual point parser produces null `speedKnots`, direction 45°, source availability `available`, observedAt `2026-09-24T00:00:00Z`, and age one hour under explicit assessment `2026-09-24T01:00:00Z`. Provenance remains NOAA CoastWatch, `noaacwBLENDEDNRTcurrentsDaily`, `u_current`/`v_current`, m/s, `altimetry-derived-geostrophic-current`, degrees-toward.

Actual cardinal spatial acquisition at candidate 25,-90 retains four component vectors. Speed-based spatial validity excludes them because speed is null. `buildCurrentVectorProjectionAnalysis` independently accepts finite u/v and known cardinal axes: all four projections are marked available, projected magnitude is Infinity, coverage is complete, and validProjectionCount is four. Projection coverage counts admitted projections; it does not independently establish finite derived magnitude.

The new fixture runs transport → `getCurrentConditionsPoint` / `getCurrentSpatialStructure` → `buildCurrentVectorProjectionAnalysis` → `buildCurrentGradientAnalysis` → `buildCurrentShearAnalysis`. These are actual production functions at faithful internal boundaries. No scientific output is fabricated for the arithmetic tests, no convergence or Ocean Physics function is called, and no species evaluation runs. Synthetic transport requests are intercepted before network access. Operational clock changes isolate caches; scientific assessment time does not change.

These extreme values are valid JSON numbers and finite JS inputs, not plausible ocean currents or evidence that a real provider emitted them. No physical range, significance threshold or convergence conclusion follows.

## Normalized measurement contract

| Field | Role / units | Existing admission and missingness |
|---|---|---|
| `eastwardMetersPerSecond`, `northwardMetersPerSecond` | Source components, m/s; `safeNumber` then four-decimal rounding | Finite components drive point source availability and cache admission. Missing components are null. Existing malformed-input issues remain open. |
| `speedKnots` | Derived square–sum–sqrt, then ×1.94384 and one decimal | Converter rejects nonfinite magnitude to null. This does not invalidate retained finite components. Existing null-to-zero behavior for a missing intermediate is a separate earlier finding. |
| `directionDegrees` | Derived `atan2(u,v) * 180/π`, `(degrees+360)%360`, integer rounding; degrees-toward | Requires finite components. Quadrant outputs remain finite. Calculated before component rounding. |
| `derived.strength`, `derived.compassDirection` | Descriptive labels from normalized speed/heading | Finite checks; no independent source measurement. |
| `derived.interpretation`, `derived.thresholdVersion` | Documentary method identifiers | No numeric authority added. |
| Requested/resolved latitude/longitude | Sampling and provider coordinates, degrees | Requested default-domain geometry; provider coordinates separately finite/bounded or null. No coordinate-fallback amendment. |
| `observedAt`, `ageHours` | Represented time and explicit-assessment-relative age | Existing assessment governance; no retrieval-clock substitution. |
| `source` | Provider, dataset, variables, units, classification, direction convention, availability | `available` in the point parser means both components finite, not every derivative finite. |
| Cache metadata when cached | Operational status/age/TTL | Stored normalized object admitted by finite components; does not repair derived validity. |

The normalized point has no separate numeric uncertainty or scientific-confidence field. Current quality is assembled downstream from finite speed, finite direction and existing age policy. Optional cache metadata and derived descriptive labels are not substitutes for that admission.

## Arithmetic closure and direct component consumers

Repository searches for normalized component names, raw `u_current`/`v_current`, `Math.sqrt`, `Math.hypot`, `Math.atan2`, and source aliases identify the following current arithmetic sites. Other sqrt/atan2 sites are geographic distance/bearing calculations, not current-speed algorithms. The JSON carries source locations for every named component/speed/direction occurrence, including writers and excluded wind-name collisions.

| Consumer | Classification | Guard / admission |
|---|---|---|
| Point parser + `currentDirectionDegrees` | DERIVES_MAGNITUDE, DERIVES_DIRECTION | Components finite before square–sum–sqrt and atan2. Knots helper rejects nonfinite norm. Source availability remains component-based. |
| `setCachedCurrentPoint` | USES_COMPONENT_DIRECTLY | Both components finite; stores partial derived object. |
| `getCurrentSpatialStructureAtAssessment` | USES_COMPONENT_DIRECTLY | Retains finite components even with null speed. Aggregate valid vectors require finite speed, direction and components. |
| `buildCurrentVectorProjectionAnalysis` | DERIVES_MAGNITUDE, DERIVES_PROJECTION | Requires known cardinal axis and finite u/v. No finite guard on output hypot magnitude. |
| `buildCurrentGradientAnalysis` | DERIVES_DIFFERENCE, DERIVES_GRADIENT | Requires available projection, finite components/radial/tangential values and finite coordinates; requires positive finite axis separation. Does not require finite projection magnitude or validate every computed delta/gradient before axis admission. |
| `buildCurrentEvidence` | USES_COMPONENT_DIRECTLY | Speed+direction govern the evidence group's availability. Available branch copies finite components; unavailable branch can retain supplied spatialAnalysis. |
| `buildCandidateNegativeConclusionAdequacyV1AtAssessment` | USES_COMPONENT_DIRECTLY | Requires finite speed, direction and components in valid vectors plus other source/time predicates. Read-only inspection only; no species/gate execution or impact claim. |
| Current captures v1/v2 | USES_COMPONENT_DIRECTLY, structural validation | Available current source requires finite components, speed and direction. Nonfinite numeric leaves rejected under any availability. |
| Generic snapshot/copy/serialization boundaries | Representation and admission | Described below; these consume containers rather than calculate new vector physics. |

`getOceanConditionsAtAssessment` supplies fallback null fields and wires these objects; it does not add another u/v magnitude formula. `backend/fields/datasetRegistry.js` lists raw component variables for product metadata and is not a numeric derivation. No additional direct normalized u/v arithmetic consumer was found outside the named server functions. Convergence/edge/Ocean Physics interpretation remains explicitly outside this qualification; encountering their wiring is not permission to inspect their scientific rules.

## Speed and heading consumers

The JSON inventory retains every source occurrence and owner. Current speed/heading readers are point derived classifiers, spatial assembly, vector projection retention, gradient optional speed/heading differences, `buildCurrentSpatialAnalysis`, `buildCurrentEvidence`, `buildOceanChangeAnalysis`, `buildCurrentPersistence`, default quality assembly, candidate negative-conclusion adequacy, and the existing species habitat consumer. Wind/marine occurrences sharing the same property names are excluded from the current inventory. History/persistence and species readers are recorded without reopening their qualification or running scoring.

No downstream heading reconstruction from u/v was found beyond `currentDirectionDegrees`. Projection computes **alignment to a cardinal reference**, not a second source heading. Speed consumers can reject null speed while component consumers still admit the vector. This demonstrates different admission predicates, not an established choice between optional speed and a required coherent-vector contract.

## Projection, differences and denominators

Cardinal reference axes have 0/±1 east/north components. Signed radial and tangential projections are dot products against those axes. Inward/outward and absolute tangential values use max/abs. `Math.hypot(u,v)` supplies magnitude; positive magnitude gates alignment computation, with signed radial/magnitude clamped to [-1,1] before acos and degree conversion.

For a zero norm, alignment stays null: no 0/0 occurs. For infinite norm and finite radial value, division produces signed zero and alignment can be 90°, even though magnitude is invalid. This is not proof of a valid alignment measurement. Near-zero source components are rounded before downstream projection and can become zero; no minimum magnitude is invented.

Gradient compares north/south and east/west. It subtracts u/v, takes hypot of deltas, divides by positive finite separation, sums opposing radial projections, computes absolute radial/tangential differences, and divides those by separation. The tested actual default geometry has nonzero separation; fabricated zero-distance projections are not used as reachability evidence. The explicit invalid-separation branch protects zero/nonfinite separation.

Opposing MAX/-MAX components produce -Infinity component deltas and Infinity total difference/gradients; opposing radial sums can also overflow. Axis objects still report available, gradient coverage is complete and gradient availability true. The top-level maximum summaries use finite guards and become null. This does not sanitize the retained axis objects. The shear consumer filters finite gradient quantities before interpreting axes; its output is recorded without qualifying shear science or thresholds. Edge evaluation is not invoked because its production input wiring also includes quarantined convergence interpretation.

## Runtime boundary and controlled matrix

Fifteen uniform-field scenarios cover all four large-sign quadrants; extreme/ordinary; extreme/+0; extreme/-0; all four signed-zero pairs; positive and mixed-sign subnormals; `1e200,1` intermediate overflow; and ordinary `.5,.2`. An additional opposite-axis scenario exercises deltas. All transport, normalized, spatial, projection, gradient and shear outputs are recorded.

| Equal positive components x,x | Last finite norm input | Adjacent overflowing input |
|---|---|---|
| Existing square–sum–sqrt | `9.480751908109176e153` | `9.480751908109177e153` |
| Existing hypot | `1.271161006153646e308` | `1.2711610061536462e308` |

Binary64 bit patterns are recorded. These boundaries describe equal-component arithmetic, not all possible u/v pairs and not an ocean-current maximum. `1e200,1` illustrates intermediate square overflow despite a finitely representable conceptual norm: point speed is null while projection magnitude is finite. At MAX,MAX even hypot overflows because the norm exceeds representable range. No arithmetic is replaced.

No NaN appeared in the tested current-only paths. Under the reviewed finite-component/cardinal-axis constraints, squares are nonnegative, atan2 remains defined for signed zeros, alignment avoids a zero denominator, and gradient division requires finite positive separation. This argument does not extend to quarantined interpretation engines or arbitrary injected objects.

Subnormal squaring underflows to zero. Four-decimal component rounding can erase small source values and literal negative-zero signs; heading is calculated before rounding and can remain directional when later rounded components are zero. Computed rounding -0 and literal -0 are separately recorded. Existing signed-zero loss is not repaired or relabeled as correct. Future exact scientific evidence must preserve the locked signed-zero rule at sign-preserving transformations; no new precision or physical threshold is proposed.

## Availability, quality and candidate representation

Point availability/cache: finite components. Spatial aggregate validity: finite components **and** speed/heading. Projection availability/coverage: accepted component projections/known axes, then count. Gradient axis availability: admitted input projections and separation, then count. These are distinct executable meanings; `complete` does not independently guarantee finite outputs.

Default current quality requires finite speed/heading and age governance, so null speed does not independently produce live current quality. `buildCurrentEvidence` marks its top-level current group unavailable when speed is null but can retain spatialAnalysis. The source wiring stores projection and gradient under `currents.derived.spatialAnalysis` before evidence/snapshot construction. Consequently raw nonfinite derived fields can be retained in a species-neutral object before species interpretation; no complete-evaluation eligibility or ranking claim follows.

`buildObservationSnapshot` uses `structuredClone`, not a finite-number scrub. An isolated representation test with production-derived current values retains Infinity at `/observations/currents/derived/spatialAnalysis/vectorProjection/projections/*/vectorMagnitudeMetersPerSecond`. That probe supplies no complete oceanEvidence and its snapshot reports unavailable. It proves representation retention, not a full available production snapshot. Source wiring at `server.js:61345` passes the current object to this same observations slot.

## Capture, replay and downstream admission

* Current v1/v2 capture includes components, speed and direction, not the projection/gradient object. The actual available-source partial point with null speed is rejected by both contracts.
* Finite MAX components themselves are serializable exactly. A **diagnostic** unavailable-source capture with those components, null speed and finite direction is schema-valid in v2. Replaying it into component projection recreates Infinity. The source availability substitution is expressly non-producer diagnostic evidence; it does not establish production capture eligibility. Replay fidelity preserves the derivation failure and is not a replay defect.
* Exact scientific JSON rejects nonfinite derived magnitude. Semantic projection v1/v2 reject the retained snapshot at their strict-copy boundary. Quarantined v3 imports strict-copy machinery but is not executed or qualified; no v3 authority claim is made.
* Frame finite numeric validators, archive recursive numeric copy, scalar-delivery copy/archive read, and publication strict copy reject nonfinite content at their respective boundaries. Finite extreme components alone are not excluded by numeric finiteness. The full derived object is not a Frame payload schema and requires an adapter; no current adapter or database record is invented.
* Publication strict-copy rejection is directly tested against the retained snapshot. A later serializer/contract rejection does not validate upstream admission. No historical database was inspected and no record or identity is rewritten.

## Contract options and required decision

**A (components independently valid, derivatives optional):** runtime cache/projection behavior partially resembles this, but available capture and speed-based evidence admission do not establish a universal optional-derivative rule.

**B (components+speed+direction atomic):** available capture and speed-based evidence support this admission at their boundaries, but component-based runtime consumers do not enforce it. It cannot be declared the sole existing contract.

**C (retain components, validate each derivation):** appropriate as a candidate defense-in-depth requirement, but which failures invalidate whole-vector availability remains a design decision, not an already qualified repository rule.

The invariant “no scientific consumer may derive or admit a nonfinite numeric representation from finite components” is supported as a required safety objective by strict capture/serialization contracts. Enforcement must cover **both normalization and derived-science boundaries** to address the demonstrated bypass; a speed-only guard is insufficient. This does not choose a helper, formula, threshold or implementation architecture.

Component retention and failure-state semantics remain unresolved. Existing `available`, `unavailable`, `no-valid-pixel`, null and per-axis availability states serve different purposes. Frame's `invalid-observation` vocabulary does not automatically govern current parser/source states. The repository does not establish which state should represent finite source components with an invalid required derivative, or which derivatives must be required for every consumer. Do not relabel arithmetic failure as missing provider evidence.

**Next gate: CURRENT VECTOR REQUIRED-REPRESENTATION AND FAILURE-STATE CONTRACT REVIEW.** Define the required representations and per-consumer admissibility before returning to 12B.7D. The proposed scope delta is to include point norm/heading, projection norm/alignment, gradient deltas/norms/ratios, and their admission/coverage checks in a future review. Do not resume the six-route audit or amend its candidate now.

## Limits and preservation

This is a failure-state STOP, not PASS. Direct named u/v consumers and current arithmetic are inventoried, but universal candidate/runtime admission outside the reviewed internal chain is not claimed. Convergence/Ocean Physics and dependent edge interpretation remain excluded; no findings about their scientific acceptance are inferred. Full species, persistence and history qualification is not reopened.

Task 12B.6C and Task 9E-D remain paused. Numeric-string compatibility, provider-fill qualification and legacy SST coordinate fallback remain OPEN. NOAA convergence SME response remains pending per user context. All 105 prior untracked files are protected by before/after SHA-256 in the companion JSON. Only the new test, fixture and two reports are deliverable additions; ignored logs are in `.local/ocean-quarantine/task12b7e/`.

No production, normalizer, vector assembler, threshold, formula, capture, serializer, cache, Frame/archive/scalar or publication change. No historical reinterpretation. No provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment.

## Final verification

All 71 executed backend/shared test scripts passed under the network blocker, including the new 20-test suite, prior 12B.7D seven-test suite, 12B.7C six-test suite, 12B.7B four-test STOP, 12B.7A ten-test/450-case suite, exact current captures/serialization, current/spatial assemblers, Frame/archive/scalar, Opportunity/governance and Task 11E coverage. The quarantined projection-v3 test is explicitly excluded and remains byte-identical; no v3 qualification is implied.

All 137 JavaScript/module syntax checks and 69 JSON parses passed. New-file whitespace and `git diff --check` passed. All 105 prior untracked files remain byte-identical. Git has 109 untracked files, with empty tracked and staged diffs. The ignored task directory retains execution logs and the exact additive diff. These passing regressions do not clear the prior cross-route STOP or approve a current-vector failure-state policy.
