# Task 12B: Shared Scientific Evaluation Boundary v1

**STOP: UNRESOLVED_ASSESSMENT_TIME_DEPENDENCY. No adapter equivalence PASS.**

Audit baseline: `4b2d2f75e6cee08f038f3c35c01952b225626a83`,
`checkpoint-four-hour-governed-publication-v1`.

This task adds an offline diagnostic and dependency audit only. It does not add a
shared scientific adapter, captain publication projection, production clock override,
route, scheduler or migration. There are therefore no implemented adapter/projection
contract versions. Diagnostic output is `pelora-12b-boundary-diagnostic-v1`.

## Demonstrated stop condition

The unchanged `buildUnifiedSpeciesOpportunityInterpretationV1` calls
`buildCandidateNegativeConclusionAdequacyV1` (server.js:48632). Its thermal freshness
predicate calls the private `assessSstTransitionConfidence` (server.js:6492), which
computes age using **Date.now()** (server.js:6543), not an explicit frozen assessment.

The diagnostic freezes one existing catalog candidate with its governed bathymetric
eligibility and synthetic ocean inputs, including sample timestamps and age fields.
It invokes the existing interpretation twice while a scoped Node test mock supplies
two clocks. No input property changes; the mock is test-only and restored by node:test.

| Input/output | First call | Frozen-input replay |
| --- | --- | --- |
| Sample represented time | 2026-09-24T00:00:00Z | Same |
| Test clock | 2026-09-24T01:00:00Z | 2026-09-27T01:00:00Z |
| All supplied candidate/environmental inputs | Frozen | Byte/serialization-identical |
| Supplied sample ageHours | 1 | 1 |
| `negativeConclusionAdequacy.predicates.thermalStructure` | true | false |
| `negativeConclusionAdequacy.adequate` | true | false |
| Candidate/species/Opportunity/intelligence source | Exact baseline | EXACT_MATCH |

Input digest: `eeab512efb30ec4216bf60fa5bca19fbe2479a8bb128827c995395313a059c1c`.
The diagnostic emits JSON field classifications and before/after digests. The
negative-conclusion adequacy field is **MISMATCH**. It is never normalized away or
relabelled as presentation. This is a replay diagnostic of the existing function,
not a claim that a proposed adapter has already been implemented or compared.

Current request-time freshness changing with time is not necessarily a defect in
the request path. The problem is an implicit scientific input at the proposed frozen
publication boundary. Task 12A freezes family assessments at the cycle cutoff;
existing inner evaluation can reassess one family at execution wall time. An adapter
cannot claim deterministic scientific replay merely by forwarding frozen objects.
Scope-limited mocks prove the dependency; they are not a safe production solution.

Per Task 12B's mismatch/stop rules, adapter and projection implementation stopped.
No threshold, eligibility, score, confidence, persistence or scientific function was
modified. Dropping the adequacy field, rewriting sample timestamps, globally replacing
Date.now in an adapter, or copying the private confidence algorithm would conceal the
dependency rather than prove equivalence.

## Current dependency map and classification

All server functions below are in `backend/server.js`; frontend files are named
explicitly. Classifications describe responsibility, not production migration approval.

| Stage / exact implementation | Classification | Dependencies and disposition |
| --- | --- | --- |
| `useTripMission`, `normalizeTripMission`, `frontend/src/hooks/useTripMission.js` | CAPTAIN_PROJECTION | Remembered mission, selected species, origin/range, local storage; never shared publication data |
| `normalizeTripOrigin`, `buildCaptainSpatialContext`, `frontend/src/utils/captainSpatialContext.js` | CAPTAIN_PROJECTION | GPS/saved/search/manual origin and range; frontend distance rounds to 0.1 NM |
| `useDynamicOpportunities`, `frontend/src/hooks/useDynamicOpportunities.js` | REQUEST_WRAPPER / NON-SCIENTIFIC | Sends species, origin/range and bearer header on effect; not continuous observe |
| `createPeloraServer`, GET `/api/opportunities` (61882) | REQUEST_WRAPPER / NON-SCIENTIFIC | Blue Marlin-only request validation, Gulf request-origin validation, persistence request context, dispatch |
| `getDynamicBlueMarlinOpportunities` (59699) | MIXED / REQUIRES_SEPARATION | Runs evaluation, resolves authenticated identity, observation/history writes, historical fallback, response metadata |
| `buildUnifiedOpportunityCandidateSourceUniverseV1` (48122) | SHARED_SCIENTIFIC | Existing Gulf search grid plus verified structures; candidate identity only, no eligibility grant |
| `normalizeOpportunityCandidateV1` (47811), `buildUnifiedOpportunityCandidateUniverseV1` (47970) | SHARED_SCIENTIFIC | Normalization, class/subtype and deduplication of existing identities; no new sources |
| `filterUnifiedOpportunityCandidatesByCaptainContextV1` (48159), `filterGulfCandidatesByCaptainRangeV1` (59301) | CAPTAIN_PROJECTION | Relevance only; backend haversine distance and inclusive `distanceNm <= range` |
| `resolveOpportunityCandidateBathymetryV1`, `evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1` (41282), `BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE` (43537) | SHARED_SCIENTIFIC | Candidate geographic bathymetry and governed species habitat rule; no captain origin/range inputs |
| `GULF_EVALUATION_CONTROL_V1` (58220), `selectCaptainRangeStableGulfCandidatesV1` (58532), `selectDistributedGulfCandidatesV1` (58452) | MIXED / REQUIRES_SEPARATION | Computational pre-evaluation bound 12, concurrency 3; nearest context ordering or distributed catalog sampling; not environmental eligibility |
| `evaluateControlledGulfBlueMarlinV1` (59400), `evaluateGulfCandidatesV1` (58230) | MIXED / REQUIRES_SEPARATION | Range -> habitat eligibility -> context cap -> evaluation -> delivery; evaluates only selected cohort |
| `evaluateUnifiedOpenWaterOceanConditionsV1` (58862), `evaluateUnifiedPhysicalStructureOceanConditionsV1` (59040) | MIXED / REQUIRES_SEPARATION | Candidate lat/lon and bearer token forwarded to an injectable ocean provider; runtime passes getOceanConditions |
| `getOceanConditions` (60068), GET `/api/ocean` (62076) | MIXED / REQUIRES_SEPARATION | Environmental acquisition, quality/evidence interpretation, temporal memory retrieval and response assembly |
| `assessOceanEvidence`, spatial current/temperature evidence builders, `assessOceanOpportunity` (36554), `resolveOceanSignals` | SHARED_SCIENTIFIC with assessment-time qualification required | Scientific observations/interpretation; source status and freshness semantics cannot be replaced by a universal policy |
| `assessBlueMarlinHabitat` (45417), `buildRelationshipContext`, `assessRelationships`, `interpretBlueMarlinPathway`, opportunity-type resolution | SHARED_SCIENTIFIC | Candidate/species/environmental relationships, confidence inputs, suitability inputs; no origin/range input |
| `buildDynamicBlueMarlinOpportunity` (48487), `assessDynamicBlueMarlinOpportunityEligibilityV1` (48296) | SHARED_SCIENTIFIC | Existing organized-feature, classification, confidence and support-family gate; preserves governed score/confidence |
| `buildUnifiedSpeciesOpportunityInterpretationV1` (48683), `buildCandidateNegativeConclusionAdequacyV1` | MIXED / REQUIRES_SEPARATION for frozen replay | Per-candidate species interpretation is context-free, but negative sufficiency consumes implicit wall-clock freshness |
| `resolveUnifiedOpportunityRankingInputV1` (48848) | SHARED_SCIENTIFIC | Affirmative gate plus available interpretation/opportunity and finite score; score alone never permits rank |
| `rankUnifiedSpeciesOpportunitiesV1` (52539), `rankDynamicBlueMarlinOpportunities` (52476) | CAPTAIN_PROJECTION using SHARED GOVERNANCE | Rank already permitted relevant candidates by score then confidence; stable ties retain incoming order |
| `buildUnifiedOpportunityIntelligenceV1` (54578), scientific portions of `translateCaptainOpportunityNarrativeV1` (54285) | SHARED_SCIENTIFIC | Read-only governed evidence explanation; preserve exact facts and limitations |
| `presentUnifiedRankedOpportunitiesV1` (52677), `buildUnifiedCaptainOpportunityDeliveryV1` (54742), contextual narrative/distance | CAPTAIN_PROJECTION | Final relevant rank and display; no shared regional #1 or new scientific admission |
| `buildGovernedOpportunityObservationV1` (48981) and observation storage/capture | MIXED / REQUIRES_SEPARATION | Preserves scientific decision but may also hold captainContext; do not publish wholesale |
| `buildGovernedOpportunityEvidenceAccumulationV1` (49607), continuity (49998), coherence (50313), persistence (50813), multiday persistence (51223), trend evidence/resolution (51539/52154) | SHARED_SCIENTIFIC given qualified history | Stable candidate/species and chronological evidence; no rank/popularity continuity; history source itself must be qualified |
| `retrieveOceanMemoryRows` (364) -> historical query -> time series -> `buildOceanPersistence` (34539) | MIXED / REQUIRES_SEPARATION | Current retrieval requires configured store and bearer token, at candidate coordinates; authorization affects available history |
| `buildGovernedOpportunityHistoryRecordV1` (54833), `evaluateGovernedHistoricalCaptainContextCompatibilityV1` (55737), history persistence/retrieval/fallback | REQUEST_WRAPPER / NON-SCIENTIFIC plus immutable historical evidence | Historical decisions remain historical; context compatibility and session fallback are not current shared science |

In compact form:

```text
mission/origin/range/species -> request
  -> declared catalog -> range filter -> species habitat eligibility
  -> context-dependent cap -> candidate coordinate environmental provider
      -> current evidence + authenticated historical memory
      -> persistence context + environmental interpretation + species habitat
  -> minimum evidence gate -> ranking input -> relevant ranking -> explanation
  -> authenticated observations/history + historical fallback -> response
```

## What the audit proves about context

At this HEAD the existing catalog contains **295** candidates; **89** pass the
current species habitat check. Default evaluation selects **12**. The selection
cap therefore prevents many eligible catalog candidates from reaching scientific
evaluation. Different origins select different nearest cohorts. This is computational
selection plus captain relevance, not a scientific exclusion rule. It remains unchanged
in runtime. Future shared science must retain every declared pair; a delivery cap may
only bound a later projected view, with any change from legacy cohort selection tested.

No direct origin/range parameter enters the composed per-candidate habitat,
Opportunity eligibility or ranking-input functions. With the same clock and same
captured candidate/ocean inputs, three synthetic origins/ranges return identical
interpretation while inclusion changes `[true, true, false]`. Existing backend distance
semantics are inclusive at the exact boundary. Frontend rounded distance must not
be substituted into scientific/projection inclusion tests.

Ranking compares score descending, then confidence descending; complete ties preserve
input order. The nearest-distance preselection can therefore affect tied final order.
That is an expected projection difference, not permission to change score, confidence
or eligibility. A future projection must specify equivalent ordering before ranking.
No global rank should be stored as a captain's final rank identity.

Species remains scientific. Blue Marlin is the only supported path. Unsupported
species and unavailable habitat fail affirmative admission in the diagnostic.
An eligible score of zero remains rankable under the current ranking boundary; a
blocked score of 999 remains unranked. No thresholds were changed.

## History and continuity exception

The history dependency is not only the final fallback wrapper. `getOceanConditions`
retrieves authenticated Ocean Memory before it builds temporal context. The chain is
`retrieveOceanMemoryRows` -> historical snapshots -> time series -> `oceanPersistence`
-> `assessOceanOpportunity`. Thus a future shared evaluator needs a qualified shared
history source and exact historical references, not a captain bearer token.

Do not overstate the current scoring effect: `assessOceanOpportunity.persistenceContext`
explicitly declares itself documentary-only and non-scoring. `assessBlueMarlinHabitat`
currently sets its persistence score to zero while temporal evidence is unconnected.
This audit does **not** demonstrate a captain-token-dependent score change. It identifies
an authorization-dependent temporal/provenance input that cannot silently be dropped
when comparing the full interpreted evidence. No database access was performed.

Governed Opportunity continuity/persistence functions use candidate/species identity,
chronological observations and coherence. Their algorithms do not require captain
origin, but current observation/history retrieval may be context-owned. That source
qualification must be separated before sharing. Consecutive ranks or nearby coordinates
are not new continuity evidence. Historical fallback must remain outside shared evaluation.

## Equivalence results and limits

The diagnostic log emits machine-readable JSON. Its field matrix covers candidate,
species, complete speciesOpportunity (including gate, score/confidence, identity and
signal label), intelligenceSource and negativeConclusionAdequacy. It preserves the
mismatch rather than masking it with a successful test exit.

| Comparison | Classification |
| --- | --- |
| Existing injected local ocean callback vs direct interpretation, same clock | EXACT_MATCH for full interpretation |
| Same candidate/evidence, multiple origins/ranges, same clock | EXACT_MATCH scientific output |
| Inclusion and nearest capped cohort under different captain contexts | EXPECTED_PROJECTION_DIFFERENCE |
| Stable score/confidence ties under different input order | EXPECTED_PROJECTION_DIFFERENCE |
| Same frozen scientific inputs, later implicit clock | MISMATCH in negative-conclusion adequacy |
| Request headers, authenticated session and response formatting | NOT_COMPARABLE_NONSCIENTIFIC; not invoked |
| Full current-vs-proposed adapter, completed-publication projection | NOT RUN: implementation stopped |
| Archive-bound input verification, persistence-history equivalence and all family-state combinations | NOT QUALIFIED by this diagnostic |

The synthetic fixture models uniform observed water with sufficient negative-observation
inputs but no populated species habitat result. Zero positive Opportunities is not a
claim of no fish or poor fishing. The demonstrated change concerns sufficiency, not a
fabricated positive signal, front or Opportunity. This task establishes no new SST
freshness policy; Task 11E remains THRESHOLD_DECISION_REQUIRED.

## Intended contracts, not implementations

Shared evaluation should accept complete declared candidate/species scope plus exact
verified frozen environmental and historical references and an explicitly governed
assessment instant. It should return every result/exclusion with unchanged scientific
inputs, outputs, gate decisions and continuity references. No acquisition capability,
captain data or hidden clock should be required.

Future captain projection should validate exact completed publication integrity and
captured results, validate species/origin/range/configuration, apply the existing
relevance and ordering semantics, and rank only already permitted candidates. It may
bound final delivery, but cannot upgrade family status, score, confidence, eligibility,
identity or persistence. Zero within-range results must retain exclusion/range/availability
reasons. Projection must neither mutate nor persist captain context into publication.
This contract is only a design boundary here; no version is claimed as implemented.

## Required next gate

1. Govern the scientific assessment instant for shared evaluation/replay. Review a
   narrow explicit-time seam through the existing confidence/adequacy functions while
   preserving current request defaults and all thresholds. No such change was made here.
2. Qualify a shared immutable historical-evidence input independently of captain Auth;
   preserve documentary temporal context and existing continuity semantics exactly.
3. Build the archive/capture-verifying shared adapter and full current-vs-adapter matrix,
   including eligible and excluded environmental cases and complete family-status cases.
4. Prove complete-universe evaluation with no legacy pre-science cap; separately qualify
   captain projection, cap disposition, stable ties and bounded final ranking.
5. Integrate with immutable Task 12A publications only after those equivalence gates pass.

No global clock patch, algorithm copy, final freshness rule, production scheduler,
store, route/frontend switch or new species science is authorized by this diagnostic.
The existing runtime is unchanged. Runtime migration readiness is **NOT READY**.

## Verification and performance

Nine focused diagnostic tests pass, including a test that **asserts the STOP mismatch**.
This is not nine tests proving a finished adapter. Offline full backend/shared regression
is run separately. No external environmental/database/Auth request is needed by the test.

One desktop run of 100 single-candidate repetitions measured roughly 10 ms for captured
interpretation and 0.5 ms for relevance filtering. These are diagnostic seam timings,
not complete shared-science/publication-projection benchmarks, mobile acceptance,
latency promises or production budgets. The fixture and source timestamps remain intact.

Only `backend/tests/sharedScienceBoundary.test.js` and this document are added. Test logs
are ignored local artifacts. Task 12A, Task 11E, all locked scientific contracts and
frontend/runtime files remain unchanged. Task 9E-D remains paused. No provider,
database/Auth/Supabase access, commit, tag, push or deployment occurred.
