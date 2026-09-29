# Task 12B.6T — revised semantic-model completeness STOP

**REVISED_SEMANTIC_MODEL_INCOMPLETE**

Independent source inspection and an actual default-path counterexample identify another candidate area: **CROSS_FAMILY_OCEAN_PHYSICS_INTERPRETATION**. Its status is **NEW_AREA_REQUIRES_REVIEW**, not approved or qualified. No completed semantic review model candidate or model freeze was created.

This is a qualification-model defect, not a production science defect. Astronomy remains qualified for the default provider. The original nine remain **BLOCKING_UNRESOLVED**. Their files and definitions were not modified.

## Exact starting areas

The following descriptions are preserved verbatim from Task 12B.6Q. The JSON copies the complete Task 12B.6R records, including IDs, original IDs, source functions, graph nodes, questions, limitations and dispositions. Each record has a content hash; the original artifacts have exact file-hash references. No old definition was broadened to absorb the new subsystem.

| ID | Exact original description | Status |
| --- | --- | --- |
| SEMANTIC_REVIEW_01 | Accepted default transport-result and normalization branches, including fulfilled missing/partial responses and error/timeout handling. | BLOCKING_UNRESOLVED |
| SEMANTIC_REVIEW_02 | SST coverage/orientation/confidence thresholds, compound predicates, time and signed-zero states through the default chain. | BLOCKING_UNRESOLVED |
| SEMANTIC_REVIEW_03 | Direct/gap-filled chlorophyll selection, missingness and freshness branches. | BLOCKING_UNRESOLVED |
| SEMANTIC_REVIEW_04 | Current vector/spatial/relationship and temporal branches. | BLOCKING_UNRESOLVED |
| SEMANTIC_REVIEW_05 | Partial weather/marine inputs and quality aggregation effects. | BLOCKING_UNRESOLVED |
| SEMANTIC_REVIEW_06 | Cache identity, in-flight and all missing/failure-state equivalence. | BLOCKING_UNRESOLVED |
| SEMANTIC_REVIEW_07 | Feature sample filtering, prerequisites, combinations and downstream consumption. | BLOCKING_UNRESOLVED |
| SEMANTIC_REVIEW_08 | Exact semantic slice separating observation-snapshot production from subsequent history/species processing. | BLOCKING_UNRESOLVED |
| SEMANTIC_REVIEW_09 | Upstream static/candidate construction constraints, independent of the fixture's eligibility flag. | BLOCKING_UNRESOLVED |
| ASSESSMENT_DERIVED_ASTRONOMY | Assessment-derived lunar phase/age/illumination and time/provenance retention in DEFAULT provider plus availability-to-quality effects. | QUALIFIED |

Astronomy's ten output leaves, eight phase labels, qualified branch evidence, explicit assessment clock, scheduled/request contexts and exact six snapshot changes are referenced from Task 12B.6S. The astronomy suite is rerun as a regression, not reconstructed or broadened here. Arbitrary injected provider outputs remain unqualified.

## Demonstrated missing subsystem

The current chain is:

`getOceanConditionsAtAssessment` → `assessOceanEvidence` → family evidence → surface-water character → water-mass analysis → mixing-zone analysis → environmental transition → ocean-front/organization/explainability → `buildObservationSnapshot`.

These stages run before history and species interpretation. `buildObservationSnapshot` retains them under `oceanPhysics`, `oceanOrganization` and physics lineage. The functions contain independent predicates that combine temperature, current, productivity and clarity evidence. They are not just transport normalization, a single family's interpretation, or snapshot copying.

The witnessed predicate is in `buildEnvironmentalTransitionAnalysis`:

`thermalTransitionSupported && !hydrodynamicTransitionSupported`

Both scenarios enter `evaluateUnifiedOpportunityOceanConditionsV1` with **no provider override**, candidate `[25,-90]`, explicit assessment `2026-09-26T01:00:00Z`, source time `2026-09-24T00:00:00Z`, and null bearer token. Synthetic transport responses are keyed by endpoint and requested coordinates, never request ordinal. The center remains 25°C. All non-SST source evidence is fixed.

| Scenario | Directional SST, °C | Snapshot interpretation | Exact branch coverage |
| --- | --- | --- | --- |
| Uniform | north/south/east/west all 25 | uniform-environmental-context | 0 |
| Thermal | north 28, south 24, east 27, west 25 | thermal-transition-context | 1 |

The exact changed governed path is:

`/observationSnapshot/oceanPhysics/environmentalTransitionAnalysis/classification`

Root evidence carries the same interpretation. Both snapshots remain available. Astronomy is exactly unchanged. Each run performs thirteen synthetic requests; no external acquisition occurs. V8 precise coverage uses the narrowest containing interval, including zero-count alternatives, so mere function invocation is not misreported as branch coverage.

The locked `Candidate_Semantic_Surfaces_v1.json` already classifies this exact snapshot path and its root evidence counterpart as `currentOceanScientificEvidence` (lines 4141 and 4744 at this revision). No new authority is being granted. These facts remain separate from established evidence-group confidence: `assessOceanEvidence` passes `groups` and `dataQuality` to confidence, while carrying the physics analyses separately. The witness establishes a governed interpretation change, not a new scoring or eligibility claim.

This is a bounded counterexample to model completeness, not exhaustive qualification of the new subsystem. Its nine identified nodes include the assembler and eight analysis/lineage functions listed in the JSON. No new branch is silently adopted as qualified authority.

## Why existing definitions do not own it

SST area 02 owns thermal coverage/orientation/confidence; chlorophyll area 03 owns source selection/missingness/freshness; current area 04 owns vector/spatial/current relationships. Their outputs feed the combined interpretation, but qualifying those inputs does not qualify the separate water-mass/mixing/front rules. Marine quality area 05 concerns a different aggregation and consequence. Feature area 07 concerns sample selection and prerequisites, not these upstream physics interpretations.

Area 08 determines which current versus historical/species outputs are in scope. It can locate these stages inside current science, but treating it as “all other scientific algorithms” would materially broaden its exact definition. Area 09 covers static/candidate constraints, not dynamic cross-family interpretation. Astronomy has a separate authority and producer and does not change in the witness.

The distinction follows different producers, compound branch logic, combined authority inputs, downstream stage consumers and replay requirements. It does not follow file boundaries: these functions already appear in the same server file and the previously observed graph.

## Graph reconciliation and honest coverage limit

A fresh source traversal reproduces **154 named nodes, 267 identifier-reference edges and 33 nested named bindings**, with matching node source hashes. Six imported scientific-assessment functions are included. There are no named additions/removals within this bounded closure. This is not proof that the reference closure is the complete semantic graph.

Ownership triage is explicit and has no duplicate primary assignments:

- **91 nodes:** provisional scope ownership under the starting ten areas; this resolves no branch or original obligation.
- **9 nodes:** unassigned to those areas and associated only with the new, unapproved candidate subsystem.
- **54 nodes:** not reviewed after the STOP; no completeness or exclusion is claimed.

For the 33 nested bindings: **21** receive provisional parent-area ownership, **1** belongs to the new candidate (`normalizeStage` in physics explainability), and **11** remain unreviewed after STOP. Lexical targets and the bounded acquisition/history callback bindings are recorded. Zero unresolved *named* targets does not establish zero unresolved semantic member/inline/dynamic effects. The final semantic-node count and total unassigned semantic-node count remain unestablished; they are not reported as zero.

The machine record contains every named node/edge/binding and its triage state. It does not falsely approve the 54 remaining nodes by assigning everything left over to area 08. Additional missing areas may still be found in a later completeness audit.

## Temporal and cross-cutting map

The same explicit assessment has two distinct effects in the preserved astronomy experiment:

- **6 astronomy changes:** qualified ASSESSMENT_DERIVED_ASTRONOMY.
- **25 environmental-age changes:** SST 2 → area 02; chlorophyll/productivity/clarity 4 → area 03; current/vector 19 → area 04.

The original time/freshness definitions adequately name those environmental-age effects as review obligations. They remain unresolved; sharing assessmentAt does not merge them with astronomy.

The JSON inventories scientific assessment time, represented environmental time, family/source time, quality time, retained feature observation time, retrieval/generatedAt, cache execution time and publication time. Each has producer/consumer, role and proposed owner references. Quality and feature times carry their source authority; they are not new clocks. Scheduled publication supplies its scheduled assessment while attempt timestamps remain separate. No timestamp contract changes.

Cache is cross-cutting operational behavior with the original area 06 equivalence questions still open. generatedAt is retrieval/snapshot metadata with complete consumer slicing left to area 08. Bounded comparisons do not become a general exclusion for every cache state or time consumer.

## Other ownership and boundary findings

- The five established fallbacks retain owners: acquisition area 01 plus the relevant SST 02, chlorophyll 03, current 04 or marine 05 area. This does not exhaust their branches.
- Candidate/location/static inputs provisionally belong to area 09, with spatial 02/04 and snapshot 08 relationships. `buildStructureEvidence` reads location/nearest structure and current interaction. Upstream water-mask/bathymetry/eligibility enforcement is not newly proved; synthetic eligibility remains a fixture assumption.
- Feature requirements, references, retained observedAt and availability belong to the unchanged area 07 obligation. No requirement classification or optionality is derived.
- Snapshot construction is not pure copying: it validates finite location, checks evidence object shape, computes availability, selects null/default representations and then clones/freezes. Area 08 can own these representation decisions. It cannot absorb independent pre-snapshot physics formulas.
- Family provenance has family-area ownership and snapshot retention relationships. Cross-family physics lineage is a candidate-area gap, not automatically documentary warning text. The JSON records orphan paths rather than claiming zero orphan science.
- Provider evidence, assessment context, represented time, static context, candidate/location and governed references have forward ownership mappings. Combined physics effects expose the missing owner; reference authenticity is not inferred.
- Injected providers are `OUTSIDE_CURRENT_DEFAULT_PROVIDER_MODEL`; `DEFAULT_PROVIDER_DOMAIN_QUALIFIABLE_SEPARATELY` is preserved.
- Species interpretation is `DOWNSTREAM_OUTSIDE_CURRENT_MODEL`. Blue Marlin is not an area.
- History is outside current-evidence qualification except retained documentary context and area 08's current/history separation. No history-selection policy was reopened.

## Next gate and unchanged scope

Next gate: **QUALIFY CROSS-FAMILY OCEAN-PHYSICS INTERPRETATION SEMANTIC BOUNDARY**, then explicitly revise the model and repeat completeness auditing. Do not resolve the original nine against this incomplete model.

No approved model candidate, model freeze, optionality qualification, requirement authority, projection proposal, authority freeze or projection v3 was created. Production behavior and science remain unchanged. All **58** pre-existing protected artifacts, including astronomy evidence and quarantined drafts, retain before/after hashes in the preservation JSON.

New files only: `backend/tests/revisedSemanticModel.test.js`, `backend/tests/fixtures/revisedSemanticModelFixture.mjs`, this Markdown report, `docs/Revised_Default_Provider_Model_Stop_v1.json`, and `docs/Revised_Default_Provider_Model_Preservation_v1.json`.

Focused STOP diagnostics: **7 tests pass**. Final verification: **63 network-blocked backend/shared scripts passed**, excluding quarantined draft-v3 tests; **121 syntax modules** and **52 JSON files** passed. Discovery ran the initial five model tests; the final focused rerun passed all seven after artifact/preservation and representative-path assertions. New-file whitespace, `git diff --check` and staged checks pass. Passing tests preserve the STOP, not model completeness.

Task 12B.6C and Task 9E-D remain paused. `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains open. No provider/database/Auth/Supabase service access, environmental acquisition, staging, commit, tag, push or deployment. All new work remains uncommitted.

Regression witnesses: astronomy **11**, 12B.6R STOP **6**, 12B.6Q **12**, provider boundary **11**, transitive STOP **10**, prior adversarial STOP **4**, projections v1/v2 **113/100**. Every other discovered backend/shared test script, including prior Task 12, exact captures, snapshot/reconstruction, Opportunity/governance, Task 11E and Frame/archive/scalar suites, passed. The JSON records every script. HEAD remains `c0d97f1f1281e99898b908af8dd9c8e1f81056d1` on `codex/pelora-remote-setup`; tracked and staged diffs are empty. Git has 65 untracked entries: 58 protected historical artifacts, two pre-existing Supabase configuration files left untouched, and these five new files.
