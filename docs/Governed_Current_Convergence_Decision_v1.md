# Task 12B.6W — Governed current convergence contract decision

**Verdict: `CONVERGENCE_CONTRACT_DECISION_REQUIRES_SCIENCE_REVIEW`.**

No amendment option is selected. Repository evidence defines a reproducible **horizontal radial-geometry candidate**, but does not settle what the nested `currentConvergenceDetected = true` must claim, or which temporal/quality/representativeness conditions that claim requires. Neither candidate==detected nor candidate!=detected is adopted as a new scientific rule.

This is a contract-decision review of the current default provider at HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`. Ocean Physics remains paused. No producer, consumer, alias, formula, threshold, model or authority implementation occurred.

## Current candidate science

`buildCurrentConvergenceAnalysis` (`backend/server.js:5239`) consumes `buildCurrentVectorProjectionAnalysis` (3503), built from the current directional sampling structure. The default provider uses NOAA CoastWatch `noaacwBLENDEDNRTcurrentsDaily`, with `u_current`/`v_current` in m/s and a declared altimetry-derived geostrophic-current source.

For each requested cardinal sample, the projection computes:

```text
signed radial = u * inwardEast + v * inwardNorth
inward = max(signed radial, 0)
outward = max(-signed radial, 0)
```

The convergence producer requires sufficient coverage and at least three available, finite signed-radial/inward/outward projections. A candidate requires at least three inward values **>=0.05 m/s** and at least one opposing pair. Pronounced candidate support additionally requires complete inward coverage, at least three values **>=0.15 m/s**, and mean meaningful inward movement **>=0.15 m/s**. These are unchanged candidate thresholds, not newly established detection thresholds.

The producer emits availability, type/state/strength, counts and radial magnitudes, threshold metadata, interpretation, limitations, upstream contract and `pelora-current-convergence-v1`. It has no confidence estimate or detected Boolean. Strength is qualitative magnitude/support classification, not probability.

The supported statement is: **the accepted directional samples satisfy the existing meaningful inward radial-geometry rule within the requested sampling field**. Source limitations explicitly disallow inference of vertical motion, accumulation, current edge/shear/rotation/eddy identity, persistence, prey concentration, habitat or biological significance from this producer alone. Current convergence is not automatically an Ocean Signal, physical-feature identity or Opportunity.

Temporal coherence, source agreement, noise discrimination and spatial coherence beyond the sampled geometry are not established by this predicate. Their absence from the candidate algorithm is a limitation of what can be asserted, not an invented requirement that every eventual detection must use persistence or a new numeric cutoff.

## Geometry and data resolution

`createCurrentSpatialSamplePoints` (1343) requests four cardinal samples at a **15 nm nominal radius**. Latitude offset is 15/60=0.25 degrees; longitude offset is `15/(60*cos(latitude))`. At candidate `[25,-90]`, north/south are 25.25/24.75 latitude and east/west are -89.72415552025937/-90.27584447974063 longitude. Requested opposing points span approximately 30 nm. The center current is separately acquired and does not enter convergence radial geometry.

Projection axes use requested direction labels. Resolved provider coordinates are retained, but the convergence function does not establish unique resolved cells, field-scale divergence, or a continuous spatial feature from those metadata. The geometry is sampled radial support, not a numerical vertical-motion estimate.

`backend/fields/datasetRegistry.js` declares **0.25-degree** native resolution for the matching gridded current product. `docs/Ocean_Product_Archive_Foundation_v1.md:32` records that the exact averaging/support window is unspecified; its temporal guidance explicitly warns against treating a daily product timestamp as an instantaneous measurement. Provider uncertainty/version/quality information is not established merely by the endpoint/product name. The field registry is repository metadata, not a new validation of source resolution, noise or 0.06 m/s detectability.

No external oceanography or provider metadata was fetched. The old archive document's unrelated astronomy clock statement was not used; current astronomy qualification remains unchanged.

## New default-chain probes

The five focused tests contain **18 executions**, including replay cases. They use synthetic transport through the actual default evaluation/parser/cache/spatial/projection/convergence path. No injected Ocean Conditions provider, manually promoted convergence object, or new final scientific shape is used.

Assessment is fixed at `2026-09-26T01:00:00Z`; ordinary represented time is `2026-09-24T00:00:00Z`. The baseline inward components are north `(0,-0.06)`, east `(-0.06,0)`, south `(0,0.06)`, west `(0.06,0)` m/s. Their magnitudes are 0.06 m/s, reported rounded speeds 0.1 knots and directions toward 180°, 270°, 0°, 90°. Existing threshold 0.05 is exceeded. This proves candidate-rule satisfaction, not scientific intent to detect.

| Controlled case | Production convergence state |
|---|---|
| All four inward vectors | candidate |
| East missing | candidate: three remaining directions and north/south pair |
| East and west missing | insufficient evidence |
| Center current missing | candidate; center current evidence group unavailable |
| Current transport rejected | insufficient evidence |
| North timestamp in future | sample rejected; remaining three support candidate |
| North timestamp missing | sample rejected; remaining three support candidate |
| All current timestamps future | insufficient evidence |
| All current timestamps missing | insufficient evidence |
| Four different accepted represented times | candidate |
| Unequal inward magnitudes 0.06, 1, 0.06, 0.2 | candidate; mean meaningful inward 0.33 |
| Strong inward vectors 1 m/s | pronounced candidate, also shear/edge candidates |
| Shear-oriented vectors | shear/edge candidates, only localized inward flow |

The heterogeneous-time case uses north `2026-09-24T00:00:00Z`, east `2026-09-25T00:00:00Z`, south `2020-01-01T00:00:00Z`, west `2026-09-26T00:00:00Z`. All pass individual nonfuture time handling; **no cross-vector equality, compatibility-window or freshness gate is applied by convergence**. This is an accepted synthetic-chain counterexample, not a claim that the live provider was observed returning it.

`scientificAgeHoursV1` rejects future timestamps. `reassessCurrentAgeV1` rejects available untimed current evidence and reassesses retained timestamps on cache/in-flight paths. Rejected individual samples do not necessarily reject the entire spatial analysis. This preserves explicit assessment authority without asserting temporal simultaneity. Cold/warm/later-clock candidate output is exact under identical inputs.

Default source/product identity is caller-constructed from the same endpoint/dataset; no alternate source was injected. The convergence function does not compare product releases, per-sample quality flags or provenance compatibility. It inherits limitations and contract metadata. No quantitative uncertainty, confidence or independent quality-consistency gate was discovered.

## Coherence and other structures

The rule tests inward magnitude floors, sample count and an opposing pair. It does not require pairwise magnitude balance or low variance; the unequal-magnitude case proves that. Both complete opposing pairs are unnecessary. Pronounced strength uses stronger support counts and mean, not a second-stage confirmed feature.

Gradient, shear, convergence and current edge are separate classifiers. Convergence does not consume shear/gradient/edge output. Low inward flow can produce convergence candidate without shear/edge; strong inward flow can satisfy all three; shear/edge can exist without a convergence candidate. These are overlapping measured structures, not a mutually exclusive oceanographic taxonomy.

No reviewed convergence path derives downwelling, upwelling or vertical velocity. Contract language must not imply those. Current candidate calculation uses one assembled sample set. Historical convergence persistence is a separate later reader; it is not a required confirmation stage for the current candidate. This review does not introduce a persistence requirement for transient detection.

## Existing terminology and governance

Repository searches found no unique existing definition resolving the nested detected Boolean. The producer's candidate terminology and limitations are explicit. Ocean Physics tests manually provide the Boolean with candidate state, but that is not proof of a production promotion rule. Historical persistence uses a local `convergenceDetected` shorthand based on candidate type/state; it does not modify the current contract.

`resolveOceanSignals` executes after current physics and snapshot construction. It selects supported feature signals and does not allow composite reinforcement to replace a concrete primary physical signal. `buildGovernedOceanSignalFeatureAssociationV1` explicitly refuses to infer `current-supported-transition -> currentConvergence` from names/source families; association requires explicit identity evidence. Neither is an intervening candidate-to-detection mechanism.

The archive architecture describes derived current organization/Ocean Signals separately from raw source observations. Publication permits zero Opportunities while retaining Ocean Signals. These distinctions do not supply a convergence confirmation rule. Feature identity/continuity may become relevant to a future claim, but no automatic association or Opportunity requirement is imposed here.

## Options and structural risks

| Option | Evidence and decision | False-positive risk | False-negative risk |
|---|---|---|---|
| A: candidate is detection | **Not established.** Candidate rule is governed, but the intended detected claim is undefined. | Heterogeneous/stale sample geometry could become an unqualified simultaneous-feature label. | Existing thresholds/coverage still miss weaker or undersampled structures. |
| B: second-stage governance | **Not established.** No confirmation gate or required confirmation evidence exists on this handoff. | A nominal stage might simply re-label the same correlated evidence. | Invented persistence/confidence requirements could suppress legitimate transient evidence. |
| C: consume candidate state | **Plausible contextual design, not selected.** Downstream outputs describe candidate context, but accepted temporal/quality scope is unsettled. | Supporting geometry may be mistaken for detected or independent evidence. | Restrictive handling can suppress supported geometry; the candidate rule still has sampling limits. |
| D: ignore for now | **Current effective hold, not a final scientific definition.** No upgrade is authorized. | “Uniform” or false can be misread as positive evidence of absence. | Demonstrated candidate contributes no convergence support. |
| E: retain rich evidence pending decision | **Review posture only.** Preserve candidate facts and limitations without inventing a detector. | Downstream readers may still overinterpret an unscoped label. | Support remains inactive until the scientific handoff is reviewed. |

Fail-closed means uncertain/unavailable evidence must not be upgraded. It does not mean erasing candidate evidence or asserting that non-detected equals physically absent. No unsupported probability, confidence, threshold or source agreement is invented. Shared science stays species-neutral, and correlated context counts remain distinct from Ocean Signal governance and Opportunity eligibility.

## Boolean, consumers and explainability

A Boolean is not inherently incompatible with Pelora if its predicate and scope are explicit and rich state remains available. By itself it collapses unavailable, insufficient, not-supported and candidate-but-unconfirmed states. The repository currently retains these distinctions in type/state/strength/evidence. This review introduces no new enum and does not select a Boolean model amendment.

The three consumers syntactically require Boolean true plus candidate state. Their outputs concern supporting hydrodynamic/candidate context, not verified persistent fronts or mixing. One hydrodynamic signal is one satisfied support condition among convergence, shear and edge; it is not a published Ocean Signal, independent measurement or probability.

Organization index 1→2 in the prior isolated diagnostic is one additive support contribution. Source comments define the index as transparent corroboration, explicitly not confidence, habitat suitability, fishing quality or probability. Shared upstream ancestry makes terms correlated.

`hydrodynamic-transition-context` has `transitionState: candidate-context`. Its explanations describe organized current behavior without verifying a persistent front, mixing zone or biological consequence. This makes option C conceivable, but does not establish which temporally/qualitatively mixed candidate evidence should support that claim.

Producer and consumers are species-neutral. Prior V diagnostic left evidence confidence, summary and environmental Opportunity evidence unchanged; no direct nested-Boolean score/gate/ranking reader was found. No blanket transitive score-equivalence or new species interpretation is claimed.

Current snapshots retain candidate type/state/strength/evidence and scope limitations. Unavailable yields insufficient-evidence explanations, not measured absence. There is no production detected-Boolean example to advertise. Internal Ocean Physics headline/detail are explicitly not final captain-facing narrative, so this review makes no UI-display promise. A future captain explanation must not silently upgrade candidate context; no UI is designed here.

## Decision, versioning and compatibility

**Repository evidence is insufficient to select A, B, C or D as the scientifically correct new contract.** The immediate scientific review must define the exact claim represented by true, its temporal/spatial/quality sufficiency, and whether Ocean Physics should consume bounded candidate support instead. It must distinguish a sampled geometric signature from a simultaneous physical feature and avoid requiring persistence unless justified by the chosen claim.

The minimum future code amendment cannot be fixed before that decision. It may be a scoped consumer contract, producer/state-model successor or separately defined governance layer. No alias, additional threshold or new Boolean is authorized.

Conditional version impact:

- Producer meaning/shape change requires review of a successor to `pelora-current-convergence-v1`; old records retain old semantics.
- New candidate contribution requires review/versioning of affected `pelora-mixing-zone-analysis-v1`, `pelora-environmental-transition-analysis-v1`, `pelora-ocean-organization-v1`, and derived front/explainability contracts where their outputs change.
- Adding the nested Boolean also affects `pelora-current-edge-v1`'s existing read; it cannot be treated as a harmless field addition.
- Changed derived snapshot content requires evaluator/identity/replay compatibility review. No automatic serializer, projection, archive or publication change is prescribed here.

Historical snapshots and candidate records must not be rewritten or backfilled as detected. Historical type/state readers and future replays need explicit versioned interpretation if an amendment is approved.

**Ocean Physics resumption: AFTER SCIENCE REVIEW AND ANY SEPARATELY APPROVED CONTRACT AMENDMENT.** Next gate is a scoped scientific definition/evidence-sufficiency review, before selecting an implementation contract. No Ocean Physics resumption occurs in this task.

## Preservation and verification

Five new files only: `backend/tests/convergenceDecision.test.js`, `backend/tests/fixtures/convergenceDecisionFixture.mjs`, `docs/Governed_Current_Convergence_Decision_v1.json`, this report, and `docs/Governed_Current_Convergence_Preservation_v1.json`.

Focused decision suite: **5 passed**, network-blocked. The JSON contains 18 execution records, complete candidate outputs, geometry/time evidence and option assessments. All **73** prior protected files are hashed before/after and unchanged, including quarantined v3 and all prior failed/STOP artifacts.

Original nine remain `BLOCKING_UNRESOLVED`; astronomy remains `QUALIFIED`; Ocean Physics and Tasks 12B.6C/9E-D remain paused. `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains open. No runtime, threshold, alias, formula, producer/consumer, signal/feature governance, assessment, parser, capture, serializer/projection, species/ranking, archive/scalar/publication change occurred.

No revised model, optionality qualification, requirement authority, proposal, freeze or v3 was created. No real provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment occurred.

The temporal probe also passed with only two adjacent represented dates (September 24/25, both inside the existing 96-hour live-age label). The extreme 2020 skew is an adversarial accepted-transport case, not an assertion that a real latest-product batch returns that combination. Each point requests `(last)` independently and cache entries are point-keyed; the producer does not bind a common product frame. These tests establish implementation behavior, not observed provider timing or new source qualification.

Final verification: **66/66 backend/shared scripts passed**, network-blocked, including prior convergence review 6, Ocean Physics STOP 6, astronomy 11 and all prior Task 12, Opportunity/governance, Task 11E, Frame/archive/scalar/Task 11B suites. The final strengthened decision suite passed **5/5 tests / 18 executions**. Quarantined draft-v3 tests were excluded. Script results and log hashes are recorded in JSON. Passing regression does not choose a scientific detection contract.

Static verification: **127 modules and 58 JSON files passed**. New-file whitespace and tracked/staged `git diff --check` passed. Final protected hashes: **73/73 unchanged**. Tracked/staged diffs remain empty. Five Task 12B.6W files are new and untracked; all work remains uncommitted.
