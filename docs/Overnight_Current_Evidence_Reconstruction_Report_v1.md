# Overnight Stage 1 report — Task 12B.6A

Starting HEAD: `943fffbf6a8fe2726f8e77143d1b42f83188f581`, branch `codex/pelora-remote-setup`, checkpoint `checkpoint-current-evidence-reconstruction-boundary-v1`.

**Stage 1 STOP: MISSING_GOVERNED_SOURCE.** No reconstruction adapter was implemented, no stage passed or was checkpointed, and Stages 2 and 3 were not started. The prior checkpoint remains intact. This report and its diagnostic test/source map remain uncommitted for review.

## Audit result

The generic boundary remains: immutable governed Ocean evidence → candidate current-evidence reconstruction → registered species evaluator → governed candidate result → publication. Blue Marlin is only the first qualification case. No species formulas belong in generic reconstruction. No unsupported species dispatch or science was implemented.

`Candidate_Current_Evidence_Source_Map_v1.json` inventories 24 grouped field/source dependencies. `comparison: null` means no reconstructed output exists and therefore no equivalence classification is claimed. A blocking missing group does not mean every individual member independently changes a score. The audit precedes any adapter implementation; it is not a successful field-by-field comparison.

The current assembly in `backend/server.js` is:

1. `getOceanConditionsAtAssessment` resolves one governed assessment; retrieves marine center data, direct/gap-filled chlorophyll, central current, and directional SST/current samples.
2. `getSstSpatialStructureAtAssessment` preserves requested/resolved positions and direction, classifies coverage and temperature range, invokes `deriveSstTransitionOrientation` and `assessSstTransitionConfidence`, and returns source-backed samples. Failure states are different from valid missing pixels.
3. `getCurrentSpatialStructureAtAssessment` builds directional vector payloads. Existing organization, relationship-context, spatial-pattern, vector-projection, gradient, shear, convergence and edge functions assemble `currents.derived.spatialAnalysis`.
4. Chlorophyll source-specific parsers and `resolveChlorophyllObservation` retain direct versus gap-filled/DINEOF identity and existing source-selection/freshness rules. No spatial chlorophyll payload is produced here; water-mass/mixing consumers explicitly retain `spatialChlorophyllAvailable = false`. Missing spatial chlorophyll is not permission to invent it.
5. `dataQualityLayers` combines values, family ages and fulfilled/rejected provider outcomes. Archive presence is not that outcome. Live, stale, degraded and unavailable are distinct. The request route does not emit the optional `dataQuality.score` supported by evidence confidence.
6. `assessOceanEvidence` derives temperature/current/productivity/clarity, surface-water, water-mass, mixing, transition, front, organization and static structure relationships. Opportunity/signals derive from those; repeated display labels cannot establish feature identity. Species habitat/gates/score remain outside this reconstruction task.

Candidate geometry and existing static bathymetry/catalogue context are shared inputs, not captain origin/range. Moon uses the governed assessment instant. History, Auth lookup and fallback remain outside the proposed adapter. Operational cache ages, retrieval time and response duration are not represented observation time. Uncertainty/masks/lineage must retain their source meaning; NOAA analysis error must not be substituted for scientific confidence.

## Concrete source boundary

The retained NOAA pilot and `backend/oceanState/noaaSstSource.mjs` preserve an L4 **ANALYSIS** product from `NOAA-NESDIS-OSPO`, not the current request's Open-Meteo forecast-model point evidence. They explicitly declare:

- `temporal.support.kind = unknown`
- `temporal.observationTime = null`
- provenance nominal time with reason `nominal-L4-time-known-exact-support-window-not-established`
- components `analysed_sst`, `analysis_error`, `mask`

The retained checksum is verified before diagnostic use. Existing profile validation and no new acquisition are used. This evidence is useful and its declared unknowns are valid; it is not scientifically disqualified in general. It cannot be relabeled as current Open-Meteo point evidence, promoted to instant support, or made to provide missing chlorophyll/current components.

The current transition-confidence consumer reads sample `observedAt`. With null represented time it returns null sample age and `sample-time-unavailable`. Substituting the retained nominal timestamp produces a numeric **37-hour age** at the diagnostic assessment instant. This is a deliberately invalid substitution demonstrating why nominal time is not a safe default, not an adapter proposal or a new scientific defect.

The existing exact sample primitive rejects rectilinear-grid input. Frame/scalar delivery can preserve arrays, axes, values, masks and digests, but no qualified mapping was found that establishes the request's directional sample source selection, requested/resolved positions and source outcomes from those retained arrays. Reusing the existing scientific assemblers is feasible only after that source/input authority is established; their private placement alone is not a STOP condition.

Repository searches of source adapters/archive writers found the product-specific retained NOAA SST foundation and synthetic archive fixtures, not a qualified frozen capture mapping for the request's Open-Meteo center/neighbors, direct/gap-filled chlorophyll selection, geostrophic current center/neighbors and relevant acquisition outcomes. This is a finding about available repository-qualified sources, not a claim that Ocean Product Frame cannot represent them or that no such evidence could exist externally.

## Why synthetic assembly alone cannot pass this gate

Synthetic evidence can qualify deterministic mechanics and should be used for later adapter tests. It cannot turn caller-assigned provider strings, represented timestamps, sample roles or failure states into established upstream source authority. Repackaging the already assembled `scientificAssessmentFixture` as an archive would demonstrate serialization, not source reconstruction. The earlier diagnostic already proves that omitting spatial/provenance/layer-state inputs changes science.

No provider qualification, timestamp interpretation, frame sampling rule, source substitution, current formula, freshness threshold or gate was invented to obtain a passing result. No V3 defect or amendment was demonstrated. No claim is made that nominal-time substitution always changes final species score; the new diagnostic proves the scientific age/input difference only.

## Decision/evidence needed before resuming

Qualify an immutable source-capture/mapping for the **same current request products**, with represented-time authority, exact center/directional sample identity and coordinate resolution, units/masks/quality, source provenance/revision and outcome states sufficient to reproduce existing family derivation. Then extract/compose the current assemblers without changing their science and perform true input-to-input equivalence.

If the intended authority instead changes from the existing model/point products to NOAA or another archive product, that is a separately governed source/scientific-equivalence decision. It cannot be silently treated as same-input reconstruction. The founder/governance decision is which source authority to qualify, not whether to weaken the test. No network, storage or provider approval is assumed.

After Stage 1 passes both equivalence and hostile review, checkpoint it before beginning registered species orchestration. The family status/spoofing/private-field/mutation matrix for a real adapter remains unexecuted because no adapter exists. Stage 2 evaluator equivalence and Stage 3 universe/cap audit remain untouched. Richer temporal/narrative parity remains separate; nonblocking historical persistence did not cause this STOP.

## Diagnostic review and preserved boundaries

Seven new offline tests verify retained source/time semantics, actual transition-confidence behavior without fabricated time, unsupported grid sampling, absent other-family components, clock independence of the missing-time result, and the explicit failed-stage matrix. They are STOP evidence, not implementation/adversarial-review PASS. Review explicitly distinguishes nominal/represented time, analysis/forecast source, source sufficiency/structural integrity, and calculable/mechanically representable/qualified evidence.

No existing runtime or contract files were modified. Publication V3, Task 12B.1, Task 11E, formulas, thresholds, identities, provider qualification and persistence science remain unchanged. Task 9E-D remains paused. No Captain C, unsupported species science, provider/environmental acquisition, database/Auth/Supabase access, captain projection, frontend migration, route switch, scheduler/storage selection, push or deployment. No commit or tag was created because Stage 1 did not pass. The pre-existing Supabase untracked files remain excluded.

## Final verification

All 37 backend/shared scripts passed with the existing network-denying preload. New diagnostic 7; prior 12B.6 diagnostic 14; 12B.5 100; 12B.4/12B.3 13/13; 12B.2 9; 12B.1 42; 12B diagnostic 9; 12A.2/12A.1/publication v1 87/75/57; Task 11E 56; Frame/archive/scalar delivery/Task 11B 17/36/44/22. Opportunity/governance and all other backend/shared regressions passed. Syntax, JSON, new-file whitespace and `git diff --check` passed. Logs and per-script exit codes are ignored under `.local/ocean-quarantine/task12b6a-overnight/`. Diagnostic PASS does not satisfy Stage 1 equivalence or authorize its checkpoint.
