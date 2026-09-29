# Task 12B.6R — semantic-effect review STOP

**DEFAULT_PROVIDER_SEMANTIC_MODEL_INCOMPLETE**

The review found a governed semantic decision outside the exact nine-area ledger: assessment-derived lunar calculation and phase classification. Task sections 2 and 28 explicitly require STOP when a genuinely new area is found. This report does not add a tenth ledger area or claim that the original nine were resolved. The finding concerns the completeness of the review model, not a defect in lunar science, source acquisition or runtime behavior.

The source graph already contained the lunar functions. What was missing was a semantic review area for their calculations and branch decisions. A named-node inventory is not a complete semantic review model.

## Exact original nine areas

The following descriptions were extracted verbatim from the 12B.6Q report before new implementation/testing. The JSON ledger also preserves each corresponding machine-readable stated limitation, source-function list, graph-node references, unresolved question, potential consequence, current evidence and tests still needed.

- **SEMANTIC_REVIEW_01** — Accepted default transport-result and normalization branches, including fulfilled missing/partial responses and error/timeout handling.
  Disposition: **BLOCKING_UNRESOLVED**; not requalified after new-area STOP.

- **SEMANTIC_REVIEW_02** — SST coverage/orientation/confidence thresholds, compound predicates, time and signed-zero states through the default chain.
  Disposition: **BLOCKING_UNRESOLVED**; not requalified after new-area STOP.

- **SEMANTIC_REVIEW_03** — Direct/gap-filled chlorophyll selection, missingness and freshness branches.
  Disposition: **BLOCKING_UNRESOLVED**; not requalified after new-area STOP.

- **SEMANTIC_REVIEW_04** — Current vector/spatial/relationship and temporal branches.
  Disposition: **BLOCKING_UNRESOLVED**; not requalified after new-area STOP.

- **SEMANTIC_REVIEW_05** — Partial weather/marine inputs and quality aggregation effects.
  Disposition: **BLOCKING_UNRESOLVED**; not requalified after new-area STOP.

- **SEMANTIC_REVIEW_06** — Cache identity, in-flight and all missing/failure-state equivalence.
  Disposition: **BLOCKING_UNRESOLVED**; not requalified after new-area STOP.

- **SEMANTIC_REVIEW_07** — Feature sample filtering, prerequisites, combinations and downstream consumption.
  Disposition: **BLOCKING_UNRESOLVED**; not requalified after new-area STOP.

- **SEMANTIC_REVIEW_08** — Exact semantic slice separating observation-snapshot production from subsequent history/species processing.
  Disposition: **BLOCKING_UNRESOLVED**; not requalified after new-area STOP.

- **SEMANTIC_REVIEW_09** — Upstream static/candidate construction constraints, independent of the fixture's eligibility flag.
  Disposition: **BLOCKING_UNRESOLVED**; not requalified after new-area STOP.

Area disposition counts: SEMANTIC_REACHABLE **0**; SEMANTIC_UNREACHABLE_ENFORCED **0**; OPERATIONAL_EQUIVALENT **0**; OUTSIDE_DEFAULT_DOMAIN **0**; BLOCKING_UNRESOLVED **9**. These are area counts, not branch counts. The five earlier positive-coverage fallback branches remain bounded evidence.

## Demonstrated new semantic chain

The test enters the exported unified evaluator with no provider override. The production default binding and class/coordinate/assessment enforcement remain intact. Environmental transport is synthetic, with explicit coordinates [25,-90] and fixed response values/time. No downstream snapshot, lunar object or injected provider callback is fabricated.

Executable chain:

1. Accepted explicit scientific assessment context.
2. Private default getOceanConditions → getOceanConditionsAtAssessment.
3. getMoonConditions(assessment.assessmentAt).
4. Local reference-epoch/synodic-month calculation → phaseFraction and illumination.
5. classifyMoonPhase applies numeric threshold branches.
6. Default provider supplies moon to buildObservationSnapshot.
7. structuredClone retains it at /observationSnapshot/observations/moon.

The same request identities and synthetic source responses produced:

| Explicit assessmentAt | Producer phase | phaseFraction | lunarAgeDays | illuminationPercent |
|---|---|---:|---:|---:|
| 2026-09-26T01:00:00Z | full-moon | 0.4804 | 14.19 | 99.6 |
| 2026-10-03T01:00:00Z | waning-gibbous | 0.7175 | 21.19 | 60.1 |

These are exact current-producer outputs, not a claim about independently validated astronomical accuracy. The classifier uses the internal unrounded phase fraction; the table reports the rounded public output. These two cases do not qualify all lunar thresholds or their boundaries. Other assessment-sensitive source ages can also change between the two evaluations; the test does not claim to isolate the entire candidate output to a single lunar difference.

V8 precise coverage proves the full-moon return executes in the first case and not the second; the waning-gibbous return executes in the second and not the first. Source predicates are phaseFraction < 0.53125 after the earlier exclusions, and phaseFraction < 0.71875 after the full-moon exclusion. Stable branch IDs bind function and phase role, not line numbers.

The root and snapshot moon objects are deeply equal but distinct objects. The governed changed fields are phase, phaseFraction, lunarAgeDays, illuminationPercent and observedAt at the root moon path and corresponding snapshot path. The locked existing semantic registry classifies root moon fields as currentOceanScientificEvidence. Reading that existing category does not grant new snapshot alias/projection permission.

Moon source availability stays available, and the moon quality state remains calculated. Thus this is not merely a missing/partial weather-input or aggregate-quality branch. It is not dead output or documentary explanation: the default provider returns it and the observation snapshot preserves it as an observed family. No score, eligibility or species-impact claim is made; no extra species interpreter was invoked.

## Why it is not silently absorbed by the nine

- SEMANTIC_REVIEW_01: No transport, HTTP result, parser or source-response normalization supplies the lunar phase; it is calculated locally from assessmentAt.
- SEMANTIC_REVIEW_02: The decision is not SST acquisition, spatial structure, confidence or temperature.
- SEMANTIC_REVIEW_03: The decision is not chlorophyll selection, productivity or freshness.
- SEMANTIC_REVIEW_04: The decision is not a current vector, relationship or current timestamp.
- SEMANTIC_REVIEW_05: The numeric lunar phase and phase-label thresholds vary while moon availability stays available/calculated. Partial weather/marine input and quality aggregation do not describe these astronomical calculations.
- SEMANTIC_REVIEW_06: The lunar calculation has no point-cache or in-flight evidence dependency.
- SEMANTIC_REVIEW_07: It does not use the governed temperature-transition feature sample/prerequisite builder.
- SEMANTIC_REVIEW_08: It occurs before observation-snapshot construction, not in the separation of that snapshot from subsequent history/species processing.
- SEMANTIC_REVIEW_09: It is time-varying astronomical evidence, not upstream static/candidate construction or eligibility.

In particular, SEMANTIC_REVIEW_05 names partial weather/marine inputs and quality aggregation, not the phase/illumination calculations of a separately produced astronomical family. SEMANTIC_REVIEW_08 names the separation of observation-snapshot production from subsequent history/species processing; it is not a catch-all authorization to absorb every omitted pre-snapshot scientific producer. Reinterpreting either description now would silently expand the ledger.

## Preserved evidence and limits

The existing 12B.6Q default binding, coordinate enforcement, 154 named nodes, 267 reference edges, 33 nested bindings, five fallback proofs and 120 bounded operational comparisons are preserved. None is promoted to completeness.

The required 12B.6Q suite reruns all five fallbacks and the 120 comparisons. Empty chlorophyll remains rows:[] → parser concentration null/no-valid-pixel → final source unavailable → productivity unavailable → snapshot available. Whole SST assembly rejection remains distinct from four rejected directional requests. No production fallback was changed.

The new lunar scenarios also run canonical order, reverse order, duplicates and same-process cold/warm pairs: 16 outputs in that focused invariance test. Lunar evidence remains exactly equal for the same explicit assessment despite changing execution clocks/cache states. The assessment is never substituted with retrieval/generatedAt time. This is bounded lunar invariance, not whole-model determinism or an authority inventory.

The 33 nested bindings and imported targets outside this demonstrated chain were not independently requalified after STOP. No newly unresolved dynamic implementation target was demonstrated. Absence of such a finding is not a complete dynamic-target qualification.

No unreachable branch was newly certified. There are therefore no new unreachability claims whose missing counterexample search is hidden as proof. The invalid-time and remaining lunar threshold branches have not been exhaustively qualified by the two-case diagnostic.

## Cache and generatedAt caution

The 12B.6Q comparison excluded only its exact 26 cache leaves and generatedAt. The rerun preserves that bounded result. It does not establish that every downstream generatedAt use is operational.

Source reads found getMarineConditions.retrievedAt feeding observationSnapshot.generatedAt; buildSnapshotMetadata retains/validates it, and buildOceanSnapshot checks generated-time consistency as part of snapshot availability. snapshotTimestampMilliseconds also contains an observedAt → generatedAt fallback used by buildOceanChangeAnalysis to calculate chronological order/duration. The default/history reachability of that fallback was not requalified after the new-area STOP. A direct helper call would not prove default runtime reachability, so no such claim is made. No generatedAt-to-science substitution was demonstrated in the new default lunar scenarios.

## Work not qualified after STOP

All nine original areas remain unresolved as complete areas: SST, chlorophyll, current, weather/marine, cache, feature prerequisite, transport, output-boundary and static-caller conclusions are not requalified wholesale. Existing bounded evidence survives. No complete semantic branch model, optionality qualification, requirement authority, producer inventory, proposed v3 delta, authority freeze or projection v3 was created.

The next gate is **ADVERSARIAL REVIEW OF THE OMITTED ASSESSMENT-DERIVED ASTRONOMY AREA**, then an explicit revised semantic-review model before restarting area completion. No tenth area was silently appended in this task. Task 12B.6C and Task 9E-D remain paused. UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED remains open and separate.

## Files and preservation

New files, all untracked and unstaged:

- backend/tests/defaultProviderSemanticReview.test.js
- backend/tests/fixtures/defaultProviderSemanticReviewFixture.mjs
- docs/Default_Provider_Semantic_Review_v1.json
- docs/Default_Provider_Semantic_Review_v1.md
- docs/Default_Provider_Semantic_Review_Preservation_v1.json

All 48 pre-existing protected evidence/draft files retain before/after SHA-256 hashes, including the seven Task 12B.6Q files. The preservation manifest is a hash audit, not an authority freeze. No failed artifact or quarantined projection draft is imported as authority. Existing Q files are read only as the expressly required diagnostic source for the ledger.

Production provider, parsers, normalization, fallbacks, cache, captures, serializer/digest, projections v1/v2, assemblers, assessment/species science, archive/scalar/publication, provider qualification and freshness rules remain unchanged. DEFAULT_PROVIDER_DOMAIN_QUALIFIABLE_SEPARATELY remains the locked provider-boundary finding. This STOP concerns the review model, not that binding. The injected-provider seam remains outside qualification.

No provider/database/Auth/Supabase service access, environmental acquisition, staging, commit, tag, push or deployment occurred. Synthetic transport only. Verification results follow after regression completion.

Final verification: **6/6 new focused tests; 61/61 network-blocked backend/shared scripts; 117 syntax modules; 48 JSON files; whitespace and git diff --check passed.** The required 12B.6Q 12, provider-boundary 11, transitive STOP 10 and prior adversarial STOP 4 tests passed. Quarantined draft-v3 tests were excluded. All 48 protected hashes remained identical. Passing diagnostics preserve the STOP; they do not qualify the nine areas or lunar science.

Git remains on codex/pelora-remote-setup at c0d97f1f1281e99898b908af8dd9c8e1f81056d1. Tracked and staged diffs are empty. The five new review files and historical untracked stack remain unstaged/uncommitted; Supabase files remain untouched. Verification logs are under the ignored .local/ocean-quarantine/task12b6r directory.
