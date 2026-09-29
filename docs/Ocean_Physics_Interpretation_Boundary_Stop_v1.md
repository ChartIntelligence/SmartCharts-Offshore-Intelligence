# Task 12B.6U — Ocean Physics interpretation boundary STOP

**Verdict: `OCEAN_PHYSICS_CONVERGENCE_CONTRACT_UNRESOLVED`.**

This is uncommitted diagnostic evidence for the current default production provider at HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`. It is not a qualified semantic area, revised overall model, producer authority, optionality contract or projection permission. The original nine areas remain `BLOCKING_UNRESOLVED`; assessment-derived astronomy remains qualified and unchanged. Arbitrary injected provider callbacks remain outside this review.

## Demonstrated blocking contract

The actual default chain, with candidate `[25,-90]`, assessment `2026-09-26T01:00:00Z`, represented source time `2026-09-24T00:00:00Z`, and uniform 25°C SST, accepts these synthetic directional current vectors in m/s:

| Direction | u | v |
|---|---:|---:|
| North | 0 | -0.06 |
| East | -0.06 | 0 |
| South | 0 | 0.06 |
| West | 0.06 | 0 |

`buildCurrentConvergenceAnalysis` (`backend/server.js:5239`) produces an available `convergence-candidate`, `convergenceState: "candidate"`, and measurable strength. Its `pelora-current-convergence-v1` return object has **no own `currentConvergenceDetected` property**. The current evidence group retains that object exactly.

Three interpretation consumers require:

```js
currentConvergence?.currentConvergenceDetected === true &&
currentConvergence?.convergenceState === "candidate"
```

They are `buildMixingZoneAnalysis` (line 12881), `buildEnvironmentalTransitionAnalysis` (line 13388), and `buildOceanOrganizationAnalysis` (line 15062). The low inward-vector witness avoids shear/edge support: the transition object reports all three detection flags false, hydrodynamic signal count zero, and `uniform-environmental-context`.

The candidate state and the missing detection Boolean are different contracts. This review does **not** infer that the candidate should count as verified detection, introduce an alias, change a formula, or claim a production exploit or species-score effect. The producer-to-consumer contract must be resolved before this area can be qualified. The original current-family area is not requalified by this finding.

## Preserved transition and isolation

The default evaluation entry is `evaluateUnifiedOpportunityOceanConditionsV1`, with its actual module-private default provider; the tests never supply `oceanConditionsProvider`. Synthetic transport passes through the existing parsers and assemblers, `getOceanConditionsAtAssessment`, `assessOceanEvidence`, and snapshot production.

At the same assessment instant, uniform directional SST of 25°C produces:

`/observationSnapshot/oceanPhysics/environmentalTransitionAnalysis/classification = uniform-environmental-context`

Changing only directional SST to north 28°C, south 24°C, east 27°C, west 25°C produces `thermal-transition-context`. Center SST remains 25°C. Precise block coverage at the thermal-classification assignment changes **0 → 1** under the source compound predicate. This is evidence for that branch arm, not exhaustive independent truth-combination coverage.

Astronomy, chlorophyll, wind, waves, swell and snapshot location compare exactly in the two runs. The fixture holds candidate, assessment, current transport, static inputs and wrappers fixed. Execution clocks differ to force cache expiry; operational cache/generation metadata are not claimed equal. Only synthetic allowlisted transport is used, behind the network blocker.

## Interpretation scope and producers

All eight reviewed functions are in `backend/server.js`. The machine artifact records their source hashes, parameters, reads, variable expressions, classifier literals and decision sites.

| Producer | Initial line | Role |
|---|---:|---|
| `buildSurfaceWaterCharacterAnalysis` | 11811 | Local temperature/productivity/clarity with thermal and current-edge context |
| `buildWaterMassAnalysis` | 12315 | Surface contrast and water-mass evidence readiness |
| `buildMixingZoneAnalysis` | 12807 | Thermal/hydrodynamic interaction context and readiness |
| `buildEnvironmentalTransitionAnalysis` | 13275 | Thermal, hydrodynamic and composed transition context |
| `buildOceanFrontAnalysis` | 13940 | Boundary corroboration and front-candidate context |
| `buildOceanPhysicsExplainabilitySummary` | 14446 | Stage summaries, readiness/detection aggregation and explanations |
| `buildOceanPhysicsExplainabilityLineage` | 14796 | Stage lineage, upstream contracts and warnings |
| `buildOceanOrganizationAnalysis` | 14992 | Weighted corroborating organization index and classification |

The five analyses and explainability live under snapshot `oceanPhysics`. Organization is a separate snapshot sibling, `oceanOrganization`; it is included because it consumes the same derived mechanisms. This is a proposed area boundary, not a completed overall semantic model.

Single-family thermal or hydrodynamic context is **family-derived composed** evidence. Rules combining thermal contrast with current edges/hydrodynamic signals are true cross-family rules. Organization combines thermal/current contributions and their derived context. It must not be interpreted as independent probabilistic evidence: several contributions are correlated.

Chlorophyll/productivity and inferred clarity support local character and availability. They do not establish spatial chlorophyll measurements across a boundary. Salinity, density, vertical profiles, temporal persistence and distinct-water-mass support are not established here; several readiness flags are constructed false. Candidate context does not confirm a front, mixing zone, water-mass identity, fish presence or habitat quality.

## Inputs, time, quality and missingness

The machine-readable family map identifies exact source reads. SST provides availability, classifications, coverage, range, local temperature, orientation and limitations. Currents provide organization/pattern/shear/convergence/edge facts. Productivity supplies concentration, classification and freshness; clarity is derived from chlorophyll, not independent spatial evidence.

Wind, waves, swell, astronomy, species configuration, captain context, history and static bathymetry/water-mask values are not direct inputs to these eight functions. Candidate location selects upstream sampled evidence, making the result local to the sampled field; location independence is demonstrated only when the semantic family facts are held identical. This is not a global Ocean State claim.

There is no direct `assessmentAt`, `Date`, fetch, captain or species-configuration read in the eight functions. They receive already assessed family facts. No new synchronization policy or temporal authority is introduced. Provenance/contracts/limitations are retained into explainability and lineage; quality-warning retention is not itself a numerical adequacy gate.

The 60 controlled scenarios combine six thermal states with nine current states, plus missing chlorophyll/all-missing, stale evidence, rejected weather and signed-zero transport cases. Missing inputs can remove support while other families retain context; all-missing is not equivalent to a complete uniform field. Exact per-scenario outputs are summarized in the machine artifact. The stale-combined case still produces strong context: this is observed current behavior, **not** a new freshness/adequacy endorsement or policy.

## Source vocabulary and coverage limits

The transition classifier literals derived from source are:

- `unavailable`
- `uniform-environmental-context`
- `thermal-transition-context`
- `hydrodynamic-transition-context`
- `combined-environmental-transition-context`
- `multi-signal-environmental-transition-context`

Other component vocabularies are recorded directly from their source assignments in the JSON. Source-defined labels are not automatically reachable in the default domain.

The audit records 133 `if`/ternary decision sites in eight functions, plus variable/member expressions for other defaults and short-circuits. This is **not** an exhaustive semantic branch count. Precise coverage retains executed consequent/alternate scenario IDs and rejects function-only coverage. Six consequent sites were unexecuted, including the combined-without-multisignal transition/front cases and readiness/detection summary cases. They remain pending; lack of execution is not proof of unreachability.

Organization thresholds are 1, 3, 5 and 8. Observed indices are 0, 1, 2, 3, 4, 6, 9 and 10. Complete below/exact/above threshold qualification and enforced branch exclusions are **not completed after the contract STOP**. No tolerance or formula was introduced.

## Snapshot, replay and mutation

The observed surface contains **1,087 concrete primitive leaf paths across 60 scenarios**, rooted in snapshot physics and organization. The artifact records observed types, strings and scenario membership. It does not infer absence, array bounds, authority or complete domain coverage. Per-leaf scientific/documentary/quality/provenance classifications remain `UNKNOWN` after STOP rather than being assigned from path names.

Every observed numeric leaf is finite. No negative-zero physics output was demonstrated, including the +/-0 transport probes. This neither proves sign canonicalization nor establishes new sign-sensitive authority.

Cold/warm replay makes 13/4 transport requests respectively and produces exactly equal complete physics/organization objects. Later execution with identical semantic family data at a second candidate location and inert synthetic captain/Auth/origin/range/boat/mission fields also produces exact equality. This is bounded replay evidence, not exhaustive order/permutation qualification.

Snapshot values equal the root producer values. `buildObservationSnapshot` copies via `structuredClone` and freezes the result; it does not recompute these physical interpretations. Mutating root classification and requirement arrays leaves the snapshot unchanged. Some root explanation arrays share upstream references, so raw root objects are not claimed universally immutable.

## Consumers and identity limits

Source discovery identifies snapshot construction/metadata, ocean change, persistence evidence, environmental-transition persistence, surface-water persistence, water-mass persistence, mixing-zone persistence, ocean-front persistence and default orchestration consumers. Their exact member reads are in the JSON. This scan is not an exhaustive alias/destructuring/transitive consumer proof.

The current producer runs before snapshot construction and species interpretation. No direct current species score, Minimum Opportunity Evidence Gate, habitat/ranking or confidence consumer of these component fields was established. Altered SST also changes ordinary temperature evidence, so any resulting score difference cannot be attributed to Ocean Physics without a separate causal proof. Historical consumers read retained physics/organization; their full transitive scientific impact remains unqualified.

Physics is retained in candidate evidence and snapshot content. No new identity is created here. Exact publication/Opportunity-identity participation and complete downstream influence remain unqualified after STOP. Publication and archive/scalar behavior are unchanged.

## Disposition and next gate

**Next gate: CONVERGENCE PRODUCER → OCEAN PHYSICS CONSUMER CONTRACT REVIEW.** Determine the intended enforced relationship between candidate convergence and the consumed Boolean. Any runtime contract amendment requires separate authorization. Then renew this area's branch, threshold, leaf-role and downstream-consumer review before claiming qualification or revising the overall model.

Original nine: `BLOCKING_UNRESOLVED`. Astronomy: qualified, unchanged. Tasks 12B.6C and 9E-D: paused. `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED`: open and separate. Injected providers: unqualified.

No revised semantic model, complete optionality, requirement authority, authority proposal, freeze or projection-v3 implementation was created. No production parser, normalization, formula, cache, snapshot, capture, serializer/digest, projection v1/v2, assembler, species science, archive/scalar/publication, provider qualification or freshness change was made.

## Verification and preservation

The six new focused tests pass under the existing network blocker. Their passing result preserves the STOP; it does not qualify this area. Full regression/static results are recorded below after completion.

The preservation JSON binds before/after SHA-256 for all **63** prior protected artifacts, including quarantined v3; all remain byte-identical. No protected file is imported as expected authority. The new suite imports production and its own fixture only. Supabase configuration files remain untouched and untracked.

New files only:

- `backend/tests/fixtures/oceanPhysicsBoundaryFixture.mjs`
- `backend/tests/oceanPhysicsBoundary.test.js`
- `docs/Ocean_Physics_Interpretation_Boundary_Stop_v1.json`
- `docs/Ocean_Physics_Interpretation_Boundary_Stop_v1.md`
- `docs/Ocean_Physics_Boundary_Preservation_v1.json`

No staging, commit, tag, push, deployment, provider/database/Auth/Supabase access or environmental acquisition occurred.

Final verification: **64/64 backend/shared scripts passed**, including new Ocean Physics 6, revised-model STOP 7, astronomy 11, semantic-review STOP 6, default-transitive 12, provider-boundary 11, transitive STOP 10 and prior adversarial STOP 4. The run includes all prior Task 12, locked projection v1/v2, exact-capture/snapshot/reconstruction, Opportunity/governance, Task 11E and Frame/archive/scalar/Task 11B suites. Quarantined draft-v3 tests were excluded. The machine artifact lists each script, exit code and log hash.

Syntax: **123 modules passed**. JSON: **54 files passed**, excluding quarantined v3 schema from inspection. New-file whitespace, `git diff --check` and staged diff check passed. Tracked and staged diffs are empty. Final preservation recheck: **63/63 unchanged**. All five Task 12B.6U deliverables are new/untracked; no existing tracked file changed. Existing historical artifacts and the two Supabase files remain untracked and untouched.
