# Task 12B.6C — Candidate assembly source sufficiency diagnostic

Baseline: `f94327ca4cd257ccfd424185d77c026b69efd421`.

**STOP: MISSING_GOVERNED_SOURCE. Complete candidate input equivalence is not established.** No candidate assembler, new evidence contract, resolver, or species evaluator was implemented. The locked `pelora-governed-current-evidence-capture-v1` remains unchanged and its qualified 62-field normalized point projection remains valid.

## Demonstrated missing input

The current `getOceanConditionsAtAssessment` builds `dataQuality` from more than SST, chlorophyll and current point evidence. Its inline `pelora-data-quality-v2` assembler consumes:

- `marine.wind.speedKnots`, `marine.waves.heightFeet`, `marine.swell.heightFeet`;
- `marine.diagnostics.providerStatus.weatherApi` and `.marineApi`;
- `marine.observedAt`, separately from `marine.sst.observedAt`;
- SST numeric availability, selected chlorophyll/current values and age, their settled outcomes, and explicit-time moon availability.

The first three groups are absent from the locked point capture. Static bathymetry, candidate identity and assessment time cannot supply them. They cannot be inferred from a successful SST capture.

The new diagnostic calls the **actual `getMarineConditions` and `getSeaSurfaceTemperaturePoint` parsers** with synthetic transport responses. It executes the exact current inline quality source block extracted from `server.js`, including existing freshness constants, without rewriting formulas or invoking the full route's later Auth/history/species operations. The baseline quality is produced by current code, not manually constructed. Supporting family inputs are explicitly synthetic existing point-shaped fixtures; this is a quality sufficiency proof, not a complete transport-to-candidate qualification.

| Controlled comparison | Same captured evidence | Different current output |
| --- | --- | --- |
| Present versus absent wind/waves/swell | Exact SST point and capture | Quality `complete` versus `insufficient` |
| Missing versus failed weather acquisition | Exact SST point and capture | Wind `unavailable` versus `degraded`, with different reasons |
| Weather aggregate time changed | Exact SST represented time and capture | `dataQuality.layers.sst.observedAt` changes |
| Quality supplied to existing neutral lineage builder | Same point evidence | `data-quality:insufficient` warning appears |

All other captures can remain identical because these changes do not alter chlorophyll/current responses. Thus the proposed input tuple admits multiple current candidate-quality outputs. A deterministic assembler cannot reproduce both without additional governed input. This is the task's quality/source-state STOP condition, not an unexplained scientific mismatch.

The lineage effect is documentary. **No species score, confidence, gate, ranking or negative-adequacy change is asserted by this diagnostic.** It does not overturn Task 12B.5's historical persistence classification. The requirement being blocked is faithful complete candidate-object reconstruction, not a newly demonstrated scoring dependency.

## Audit disposition

`Candidate_Capture_Assembly_Boundary_v1.json` carries all 24 prior groups, the source/derivation/consumer/authority map and comparison status. Previous `DERIVABLE_FROM_FROZEN_GOVERNED_SOURCE` classifications were conditional on complete frozen inputs; they did not prove that the point capture contained every such input. Groups 13, 19 and 24 now identify the concrete missing quality inputs/propagation. Other untested candidate paths remain `UNRESOLVED`, not claimed equivalent.

SST spatial assembly (`getSstSpatialStructureAtAssessment`) uses the central value and exact directional samples to derive coverage, min/max/range, orientation and transition confidence. Current spatial assembly preserves directional vectors and applies the existing organization, relationship, pattern, projection, gradient, shear, convergence and edge functions. These are reusable derivations, but complete capture-backed spatial assembly was **not qualified after the STOP**. No center-cell approximation or directional transposition was introduced.

Chlorophyll selection remains `resolveChlorophyllObservation` with existing direct/reconstruction markers, age and outcome semantics. Current water-mass/mixing code explicitly reports no spatial chlorophyll source; no new structure is fabricated. DIRECT and GAP_FILLED historical equivalence remains unestablished. Full mask/uncertainty mapping and optional quality-score mapping remain unresolved; the route does not emit the optional quality score supported by a downstream consumer.

Static candidate bathymetry and structure remain existing location-bound context. Moon remains derived from explicit assessment time. Candidate identity is not captain origin. Species habitat, Opportunity gates, score, confidence and ranking stay outside generic assembly. The full route mixes later history/species work, so it was not invoked as a generic assembler.

## Time, source authority and safety

`getMarineConditions.observedAt` currently chooses weather time before marine time. Its SST timestamp instead comes from the marine current block. The diagnostic preserves this distinction rather than silently replacing aggregate time with SST time. This does not qualify aggregate time as an independent SST observation time.

Zero wind is numeric availability in existing quality logic; missing wind remains missing. Source/capture presence does not upgrade unavailable layers. No quality default was added. Replay and the tested quality fragment run with `Date.now` and network calls forbidden, given explicit complete inputs. Operational parser retrieval metadata is not claimed wall-clock independent.

Synthetic transport proves mechanics and the missing-input counterexample. It does not establish provider authenticity, production source qualification, freshness, cross-product interchangeability or durable resolution. No NOAA substitution is made.

The existing capture's privacy/immutability validation remains authoritative. No new constructor exists, so this task does not claim candidate-level privacy, substitution resistance, identity, immutability, scheduled-context binding or Auth-wrapper equivalence. Those remain tests for a future assembler.

## Remaining gate

First qualify faithful same-product frozen capture of the missing weather/marine fields and outcomes consumed by current quality, including the separate aggregate-time semantics. This requires explicit source-capture scope qualification; these fields must not be smuggled into the locked point schema or invented from static context.

Then compare complete current and replayed candidate objects through the same existing spatial/quality assemblers, before species science. Preserve missing/unavailable states and all source provenance. Only after that may species-evaluator equivalence resume.

A future test-injected `readExact(captureReference)` port must return validated immutable content matching the exact reference, or fail closed. No latest/approximate substitution. Production storage and durability remain undecided. Existing archive and V3 reference-only compatibility from Task 12B.6B is unchanged; there is no new candidate result to claim V3-compatible. No contract defect or amendment is demonstrated.

## Validation and scope

Focused diagnostics cover actual parser equivalence, uncaptured quality/state/time sensitivity, actual lineage consumption, strict capture rejection of uncaptured fields, zero/missing distinction and network/clock-free replay. All 8 focused tests and all 39 backend/shared test scripts passed with the network-blocking preload. This includes capture 96, source boundary 7, prior archive boundary 14, temporal primitives 100, temporal selection/requirements 13/13, history 9, assessment 42, shared-science diagnostic 9, publication history/assessment/v1 87/75/57, worker 56, Frame 17, archive 36, scalar delivery 44, and Task 11B 22. Opportunity/governance and remaining backend/shared scripts also passed. Syntax passed for all 69 backend/shared JavaScript modules; the JSON parsed with 24 unique groups; tracked and new-file whitespace checks passed. Regression logs and the exact additions diff are local ignored diagnostics under `.local/ocean-quarantine/task12b6c/`.

Only this document, the machine-readable boundary matrix and the diagnostic test are added. Runtime, V3, archive, assessment-time science, Task 11E, scientific formulas/thresholds, identities and provider qualification remain unchanged. Task 9E-D remains paused. No database/Auth/Supabase/provider access, environmental acquisition, commit, tag, push or deployment.
