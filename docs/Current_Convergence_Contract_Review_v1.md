# Task 12B.6V — Current convergence contract review

**Verdict: `CONVERGENCE_CONSUMERS_EXPECT_UNPRODUCED_FIELD`.**

Selected option **C**, restricted to the demonstrated unproduced nested field. Historical staleness and the scientifically intended repair are not proven. This remains a contract STOP: Ocean Physics qualification may **not** resume yet.

Scope is the current default production provider at HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`. No runtime fix, alias, formula, threshold or governance change was made. Arbitrary injected providers remain unqualified.

## Producer and meaning

`backend/server.js:5239`, `buildCurrentConvergenceAnalysis(vectorProjection)`, receives the result of `buildCurrentVectorProjectionAnalysis(currentSpatialStructure)`. `getOceanConditionsAtAssessment` constructs both, then directly assigns the result to `currents.derived.spatialAnalysis.convergence` (line 60571).

The producer requires `vectorProjection.sufficientCoverage === true` and at least three available projections whose signed radial, inward and outward components are finite. Meaningful inward evidence is **>=0.05 m/s**. Distributed support requires at least three meaningful inward samples and an opposing pair. Pronounced support additionally requires complete inward coverage, at least three strong samples and mean meaningful inward movement **>=0.15 m/s**. Means/maxima are rounded to four decimal places in the returned evidence; the predicates use the source values before output rounding.

These are candidate-support thresholds. Source comments and returned limitations explicitly exclude persistence, vertical transport, accumulation, prey concentration, habitat quality and biological significance. The precise supported meaning is **governed horizontal surface-convergence candidate within the sampled field**. The repository does not establish an additional confirmed-detection threshold between this producer and Ocean Physics.

The five producer classifications are `unavailable`, `no-convergence-candidate`, `localized-inward-flow`, `convergence-candidate`, and `pronounced-convergence-candidate`. Their state/strength pairs are respectively `insufficient-evidence/unknown`, `not-supported/none`, `incomplete-support/localized`, `candidate/measurable`, and `candidate/pronounced`.

`available` means the radial analysis has sufficient coverage; it does not mean that a candidate exists. No confidence field is produced. The complete return contains:

- `available` Boolean;
- `analysisType`, `convergenceType`, `convergenceState`, `convergenceStrength` strings;
- `evidence`: coverage, sufficient coverage, requested/valid counts, meaningful/strong inward and meaningful outward counts, inward direction list, opposing pair list, distributed/complete support Booleans, mean/max inward and max outward values (finite number or null where applicable);
- `thresholds`: meaningful/strong radial thresholds and minimum inward sample/pair counts;
- `interpretation` string and `limitations` string array;
- `upstreamContract` engine/version and `contractVersion: pelora-current-convergence-v1`.

The JSON records all 49 observed container/leaf paths across these states, types, complete state objects and roles. This is the convergence producer shape inventory, not snapshot optionality or projection authority.

## Field origin and intervening layers

Production does use the identifier `currentConvergenceDetected`, so the accurate finding is **not** that this name never exists anywhere.

| Production location | Behavior |
|---|---|
| `buildCurrentEdgeAnalysis:4921` | Reads nested convergence Boolean as optional corroboration; no state conjunct at this read |
| `buildMixingZoneAnalysis:12881` | Reads nested Boolean and candidate state |
| `buildEnvironmentalTransitionAnalysis:13388` | Reads nested Boolean and candidate state |
| `buildOceanOrganizationAnalysis:15062` | Reads nested Boolean and candidate state |
| `buildStructureEvidence:22230,22456` | Constructs a same-named field in structure **values**, initially false or from `evaluateCurrentInteraction` |
| `buildOpenWaterEvidence:22537,22682` | Reads a different top-level `current.convergenceDetected` and constructs a same-named field in open-water **values** |

No production construction, assignment or translator was found for **`spatialAnalysis.convergence.currentConvergenceDetected`**. The full production identifier-reference ledger is in the JSON. Backend/shared searches outside server found no additional production writer; semantic path registries that mention summary fields are not producers.

`buildCurrentEvidence` (11245) retains `currents.derived.spatialAnalysis` directly. It recognizes candidate state to describe/classify current evidence (11449 onward), but does not add the missing Boolean. The fallback single-point spatial object has `convergence: null`; it is not a promotion layer.

`evaluateCurrentInteraction` (22137) returns convergence false for both unavailable and single-point cases. `assessOceanEvidence` deliberately supplies only availability/time to the open-water builder (9519 onward), leaving spatial organization flags false. Neither output is fed back as the nested convergence contract.

Historical `buildCurrentConvergencePersistence` (28825) computes a **local** `convergenceDetected` from candidate state plus either candidate type. This is shorthand for recognizing historical candidate observations, not a second-stage confirmation or write back into current science. It requires governed history identity/time/version/availability for its own purpose.

## Consumer contract and diagnostics

All three Ocean Physics consumers require:

```js
currentConvergence?.currentConvergenceDetected === true &&
currentConvergence?.convergenceState === "candidate"
```

Optional chaining produces `undefined` when the field is missing. Strict equality rejects it. This is not Boolean coercion or a nullish default. Missing, false, null, numeric 1 and string `"true"` all yield the same non-detected result. Boolean true with the wrong state also fails. No independent provenance, persistence or confidence check is embedded in this particular predicate.

The controlled diagnostic first preserves an untouched production-generated object, then adds the field to a clone **only for direct consumer testing**. It is not runtime reachability or permission to promote a candidate.

| Isolated diagnostic | Missing / false / wrong type | Boolean true + candidate |
|---|---|---|
| Mixing | `no-mixing-zone-context` | `hydrodynamic-boundary-context-without-water-mass-distinction` |
| Transition | `uniform-environmental-context` | `hydrodynamic-transition-context` |
| Hydrodynamic count | 0 | 1 |
| Organization index | 1 | 2 |

Each consumer's evidence Boolean changes false→true. The organization index change is a corroborating context contribution, not a score or confidence claim. The separate recomposed `assessOceanEvidence`/snapshot diagnostic also updates dependent summaries and organization contributions; its **40 exact field differences** are retained in JSON. Those differences are explicitly synthetic substitutions, not outputs demonstrated reachable from production transport.

## Actual 0.06 m/s default-chain trace

Assessment is `2026-09-26T01:00:00Z`; represented current time is `2026-09-24T00:00:00Z`; candidate is `[25,-90]`. Uniform SST, other families and context remain controlled. The center current is `(u=0.5,v=0.2)` m/s; the four directional vectors are:

| Sample | Coordinates | u/v m/s | Toward direction |
|---|---|---|---:|
| North | 25.25, -90 | 0, -0.06 | 180° |
| East | 25, -89.72415552025937 | -0.06, 0 | 270° |
| South | 24.75, -90 | 0, 0.06 | 0° |
| West | 25, -90.27584447974063 | 0.06, 0 | 90° |

Magnitude is 0.06 m/s; reported rounded speed is 0.1 knots. Each radial projection has inward 0.06, outward zero, tangential zero, represented timestamp and age 49 hours. All four provide meaningful inward support and two opposing pairs. Result: available, candidate, measurable; no confidence or detected Boolean.

Synthetic transport table → `getCurrentConditionsPointAtAssessment` parser/normalizer → timestamp reassessment/cache wrapper → spatial directional structure → vector projection → convergence producer → `currents.derived.spatialAnalysis` → current evidence group → three consumer reads → snapshot is the actual executed path. JSON preserves intermediate vectors/projections and the production object at root, group and snapshot handoffs. Deep equality confirms exact carry-forward. No fixture adds/removes the detected field on this trace.

The transition result is convergence false, shear false, edge false, hydrodynamic count zero and uniform context. This does **not** prove that 0.06 m/s scientifically should remain undetected or should be promoted. The intended cross-contract interpretation is the unresolved decision.

## State, time, provenance and cache matrix

Fifteen accepted-chain cases cover empty, rejected, uniform non-convergent, candidate, pronounced candidate, partial coverage, missing represented time, future represented time, stale evidence and threshold neighborhoods.

| Case | Source/current evidence | Convergence result |
|---|---|---|
| Empty rows | `no-valid-pixel`, current group unavailable | unavailable |
| Rejected current transport | `provider-unavailable`, group unavailable | unavailable |
| Uniform vectors | available | localized inward flow; insufficient distributed support |
| Inward 0.06 | available | measurable candidate |
| Inward 0.2 | available | pronounced candidate |
| Two missing directions | center available, spatial coverage insufficient | unavailable |
| Missing timestamp | assessment reassessment rejects available untimed current; fallback unavailable | unavailable |
| Future timestamp | scientific age rejects future evidence; fallback unavailable | unavailable |
| 2020 timestamp | current group available, freshness stale | measurable candidate |
| 0.0499 / 0.05 / 0.0501 | finite complete support | none / measurable / measurable |
| 0.1499 / 0.15 / 0.1501 | finite complete support | measurable / pronounced / pronounced |

No detected-Boolean producer case E was fabricated. Insufficient coverage and stale evidence exercise actual quality-related limits; no arbitrary quality scalar was invented. Stale candidate support is observed current behavior, not an adequacy endorsement. Current availability, analysis availability and positive candidate support are separate states.

The geometry function itself reads neither represented time nor assessmentAt. Upstream parsing computes age under the explicit assessment context. `reassessCurrentAgeV1` validates retained provider time on cache hits, shared in-flight values and misses; `scientificAgeHoursV1` rejects future timestamps. No retrieval/generatedAt clock substitutes for assessment science.

The producer gates finite projection availability/coverage, not a source-name or provenance-quality score. It retains upstream contract identity and limitations. Consumers do not suppress an already produced true Boolean on provenance grounds: the required nested field never arrives.

Cold, warm and later-clock replay preserves exact convergence and physics objects; request counts are 13/4/13. In-flight reassessment is source-traced and preserved by prior regression coverage, not claimed as a new concurrent stress test. Inert captain/boat/origin/range/mission/Auth/Fishing Log/catch fields leave results identical. No real private data was used.

## Signals, association, species and scoring

Physics and observation snapshot are built **before** `assessOceanOpportunity` and `resolveOceanSignals` in default orchestration. Signal selection is not an intermediate confirmation stage. `buildGovernedOceanSignalFeatureAssociationV1` (38174) explicitly refuses to infer `current-supported-transition -> currentConvergence` from terminology and requires explicit identity provenance. It does not populate the missing field. Ocean Signals and Opportunities remain distinct.

Convergence geometry and its three consumers have no species or captain inputs and run before species interpretation. Current-family facts can separately affect downstream science, but no direct score/gate/ranking read of this nested Boolean was found. Similarly named relationship support and open-water fields are distinct paths; no score improvement, ranking exploit or complete transitive scoring equivalence is claimed. No extra species-scoring diagnostic was run.

Snapshot observations and current evidence preserve candidate type/state/strength without the missing Boolean. Ocean Physics contains its derived `convergenceDetected: false`. Other summary paths legitimately contain same-named false values; they must not be mistaken for nested candidate detection.

## Existing contract evidence and conclusion

Locked/current `oceanConditions.test.js` fixtures `buildEdgeConvergence` (16480), `buildMixingCurrent` (17705), transition-current (18080) and organization-current (19475) manually construct `currentConvergenceDetected` while using the same `pelora-current-convergence-v1` identity. These prove consumer expectations, not actual producer conformance. Historical tests instead construct candidate type/state/strength objects, matching the production/history reader shape.

This demonstrates a producer/consumer interface inconsistency. It does not determine whether a field should be added, consumers should interpret candidate state, or additional governance was intended. No separate executable confirmation stage was found. No formula defect or scientifically intended detection decision is asserted.

**Next gate: SEPARATELY REVIEWED CONVERGENCE PRODUCER–CONSUMER CONTRACT DECISION / AMENDMENT.** Resolve the versioned meaning and intended handoff before authorizing any runtime amendment or resuming Ocean Physics qualification. No implementation authorization is inferred.

Original nine remain `BLOCKING_UNRESOLVED`. Astronomy remains `QUALIFIED`. Ocean Physics remains unqualified. Tasks 12B.6C and 9E-D remain paused; `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` stays open. No revised model, optionality, requirement authority, proposal, freeze or v3 was created.

## Files and verification

Five new uncommitted files:

- `backend/tests/fixtures/convergenceContractFixture.mjs`
- `backend/tests/convergenceContract.test.js`
- `docs/Current_Convergence_Contract_Review_v1.json`
- `docs/Current_Convergence_Contract_Review_v1.md`
- `docs/Current_Convergence_Contract_Preservation_v1.json`

Focused final suite: **6 passed**, network-blocked. The state matrix asserts producer results; actual production traces are separated from diagnostic field substitution. Tests import only production and the new transport fixture, with no old authority oracle or borrowed final scientific shape.

All **68** prior protected files, including every failed artifact and quarantined v3 draft, retain before/after hashes in the preservation artifact. Production, formulas, thresholds, parsers, assessment, captures, serializers/projections, feature association, signal governance, species/ranking, archive/scalar/publication remain unchanged. No staging/commit/tag/push/deployment, real provider/database/Auth/Supabase access or environmental acquisition occurred.
The final diagnostic also asserts exact equality of evidence `confidence`, `summary`, and `environmentalOpportunityEvidence` after recomposition with the substituted Boolean. This supports the bounded separation described above; no score/ranking equivalence outside those compared outputs is inferred.
Historical source check: the producer's introduction commit `92ac47e` already emitted candidate type/state under `pelora-current-convergence-v1` without `currentConvergenceDetected`. Its function hash is recorded in the JSON. Identifier-history searches locate later consumer introductions (`a6683ed`, `693687b`, `668a762`, `6a2f2a4`), but do not establish a lost former producer field or an intended scientific conversion. Therefore “unproduced field” is the precise finding; “stale after a known producer removal” is not claimed.

Final regression: **65/65 backend/shared scripts passed**, network-blocked, including Ocean Physics STOP 6, revised-model STOP 7, astronomy 11, prior Task 12/projection/capture/snapshot/reconstruction/Opportunity/governance/Task 11E/Frame/archive/scalar/Task 11B coverage. Quarantined draft-v3 tests were excluded. The final strengthened convergence suite was rerun separately: **6/6 passed**. Script exit codes and log hashes are in the JSON; passing tests do not remove this contract STOP.

Static checks: **125 modules**, **56 JSON files**, no failures. New-file whitespace, tracked and staged `git diff --check` passed. Final preservation: **68/68 unchanged**. Tracked and staged diffs are empty; the five task files are new/untracked. There is no runtime amendment or staging action.
