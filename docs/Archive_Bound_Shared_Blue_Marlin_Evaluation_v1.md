# Task 12B.6 — Archive-bound Blue Marlin diagnostic boundary

Baseline: `a20a9875b86eeb19d4447808c1db7269f4937661`.

**STOP: CURRENT_EVIDENCE_ADAPTER_QUALIFICATION_REQUIRED.** No shared evaluator, production adapter, new evaluator capability or scientific contract was implemented. Full scientific equivalence is NOT established. This records the task's input-reproduction stop condition, not a V3 defect or a newly blocking historical dependency.

## Dependency audit before implementation

The current composition in `backend/server.js` is candidate bathymetry/species eligibility, `assessOceanEvidence`, `assessOceanOpportunity`, `assessBlueMarlinHabitat`, `resolveOceanSignals`, `buildUnifiedSpeciesOpportunityInterpretationV1`, then `resolveUnifiedOpportunityRankingInputV1`. The companion JSON lists input classifications and exact consumer names. Current formulas remain authoritative.

`getOceanConditionsAtAssessment` constructs more than central SST/chlorophyll/current scalars. It obtains candidate and directional neighbor evidence, resolves chlorophyll source selection, and constructs source availability/provenance, represented times, spatial structures, coverage and data-quality layer states. Private spatial classification helpers participate in this composition. A scalar archive reader does not reproduce those inputs by itself.

SST temperature/spatial/feature evidence influences interpretation, habitat and negative-conclusion adequacy. Current vector values, times, source availability and spatial coverage influence current/organization interpretation and adequacy. Chlorophyll concentration, classification, DIRECT versus GAP_FILLED provenance, age and live-layer state remain governed inputs. Existing current-family policy must be reused, not replaced with archive presence or numeric availability. Missingness cannot become negative environmental evidence.

Candidate bathymetry uses candidate-bound water-mask elevation or repository static data. Structure evidence uses repository static catalogue context. These are shared static inputs, not historical observations or captain range. Blue Marlin profile, habitat rules and gate configuration are species configuration. Ranking permission is the existing gate; it is not a captain-facing rank and a finite score does not grant it.

Candidate identity and Opportunity identity must remain those of current governed construction. This diagnostic does not establish admitted shared Opportunity identity equivalence. Captain origin/range, candidate cap and final ranking are projection/outer selection concerns; provider acquisition, cache transport, Auth history retrieval and fallback are request concerns. No request fallback was invoked.

Governed assessment time remains required for age and adequacy. The existing moon algorithm accepts that instant. Moon is separately returned context; the audited habitat composition does not take moon phase as a direct scoring argument. This finding must not be expanded into a new lunar science claim.

Historical persistence remains documentary/nonblocking at the tested boundary. Changing it preserves complete tested habitat/interpretation/ranking-gate outputs and persistence score zero. This does not establish full temporal/narrative parity or permanently non-scoring history.

## Archive authority and exact missing mapping

Ocean Product Frame preserves scientific values, components, units, temporal support, missing reasons and provenance. Ocean Product Archive binds immutable frame identity, scientific-content digest, full-frame digest and receipt. Diagnostic storage is a volatile synthetic test double, not production durability or qualified provider evidence. Structural validity does not authenticate a provider.

Scalar Field Delivery implements source-index decimation for scalar display/delivery, not a scientifically qualified candidate neighborhood sampler. The existing environmental-sample primitive supports exact point layouts and rejects unsupported grid semantics. Neither is a substitute for the candidate-specific request reconstruction.

The missing qualification is an exact source-bound mapping from archive frames/receipts to candidate and directional samples, coordinate/orientation/coverage semantics, current units/components, represented support, source selection/availability/type, family quality/admissibility and layer failure states. It must bind the actual frames/revisions used and feed the existing scientific assemblers without copying formulas. Current private assemblers are interleaved with acquisition and need a separately demonstrated pure composition seam.

This does NOT prove Frame is incapable of carrying the evidence, or that a new archive/publication schema is needed. It proves central scalar equality alone is insufficient. No production selection manifest, nearest-neighbor rule, inferred metadata or provider-shaped cached interpretation was invented to close the gap.

## Controlled counterexamples

Synthetic frozen current inputs at `2026-09-24T01:00:00.000Z` use the existing internal request assessment contract. This is not a four-hour publication cycle fixture.

| Change | Observed result | Meaning |
|---|---|---|
| Remove SST/current spatial structures, retain central values | Candidate score 24 → 27; negative adequacy true → false | Spatial context is blocking; central values are insufficient |
| Retain all tested numeric samples/times, omit sample source metadata | Negative adequacy true → false | Source availability/provenance cannot be discarded |
| Chlorophyll live layer → unavailable with identical values | Surface-water adequacy true → false | Layer state cannot be inferred solely from scalar presence |
| Optional dataQuality.score 0 → 100 | Evidence confidence 76 → 86 | Optional quality input has authority; current route does not emit this optional score, so do not fabricate one |
| Change only historical persistence | Tested blocking composition identical, persistence score 0 | Nonblocking finding preserved |
| Repeat complete frozen current inputs with Date.now forbidden | Identical composition and explicit moon | Current explicit-time replay remains intact |

The deliberately incomplete projections are explained `MISMATCH` rows, not a successful current-versus-shared comparison and not equal complete scientific inputs. Final Blue Marlin confidence is not claimed to change merely because evidence confidence changes. The companion machine-readable matrix marks overall equivalence unqualified.

## Uncompleted acceptance work

No archive-bound evaluator contract/version was introduced. Full SST/chlorophyll/current interpretation, habitat/gate/score/confidence/ranking/negative-adequacy equivalence, shared candidate/Opportunity identity, all family status cases, captain/Auth/scheduled-wrapper equivalence, and shared output immutability remain unestablished. The archive test covers exact synthetic content and four integrity-corruption cases; it is not a complete adversarial archive suite.

No current-versus-shared performance comparison is meaningful because no shared implementation exists. No production latency claim is made. Existing V3 may bind future qualified inputs; no amendment is demonstrated, but this task has not proved V3 evaluator scientific consumption. Earlier V3 contract propagation tests remain distinct from consumption.

Next: qualify exact archive reconstruction and reuse the current family composition; then prove archive-bound equivalence and evaluator/configuration completeness, complete-universe/candidate-cap qualification, captain projection/ranking equivalence, and separately reviewed runtime migration. Richer temporal/narrative parity remains separate.

Runtime, V3, Task 12B.1, Task 11E and all existing scientific contracts/formulas remain unchanged. Task 9E-D remains paused. No provider/database/Auth/Supabase access or environmental acquisition. No frontend, storage, scheduler, commit/tag/push/deployment changes.

## Offline verification

All 36 backend/shared test scripts passed with the existing network-denying preload and synthetic/retained test inputs. Focused diagnostic: 14. Prior tasks: 12B.5 100; 12B.4 13; 12B.3 13; 12B.2 9; 12B.1 42; 12B diagnostic 9; 12A.2 87; 12A.1 75; publication v1 57; Task 11E 56; Frame 17; archive 36; scalar delivery 44; Task 11B scalar runtime 22. Opportunity/governance, ocean conditions, retained NOAA, adapter and numeric-integrity regressions also passed. Syntax, matrix JSON parsing, new-file whitespace and `git diff --check` passed. Logs/results and the exact unstaged new-file patch are ignored diagnostics under `.local/ocean-quarantine/task12b6/`. Passing diagnostics do not qualify the unimplemented evaluator.
