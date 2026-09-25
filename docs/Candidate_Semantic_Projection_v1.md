# Task 12B.6F — Candidate Evidence Semantic Projection v1

Verdict: **SEMANTIC_SURFACES_QUALIFIED**, within the closed reviewed-path and controlled-case scope below. This is semantic projection qualification, **not complete candidate reconstruction or scientific source qualification**.

Baseline: `44e8a2f761e6972b6574b52281bb166261e11b3c` / `checkpoint-candidate-assembly-semantics-boundary-v1`.

## Deliverables and comparison boundary

- `backend/candidateSemanticProjection.mjs`: pure read-only projection and guarded scientific-surface accessor.
- `backend/tests/fixtures/candidateSemanticFixture.mjs`: controlled actual parser/assembler corpus, including explicitly supplied spatial auxiliary facts.
- `backend/tests/candidateSemanticProjection.test.js`: semantic isolation, input preservation and hostile-input checks.
- `docs/Candidate_Semantic_Surfaces_v1.json`: group audit, source/consumer anchors, temporal/provenance authorities and executable closed path registry.
- This report.

Utility version: `pelora-candidate-semantic-projection-v1`. This is not another capture contract, candidate identity, Opportunity identity, source authenticator or production integration.

`projectCandidateSemanticSurfacesV1(composite)` partitions exact source JSON-pointer/value entries into six surfaces. It retains every container and leaf in `coverage`. All surfaces use exact reviewed descendant paths, container kinds and primitive types; there are no opaque non-scientific subtrees. Unknown subtrees are retained whole in `unresolved`. A lossless reassembly test proves no input content was dropped. Source aliases already duplicated in snapshots remain separately visible at their original paths; projection does not create additional copies as authorities.

`requireCurrentScientificSurfaceV1(composite)` refuses extraction whenever any path, container kind or primitive type is unresolved, in any surface. It also rejects empty scientific surfaces. `compareCandidateScientificSurfacesV1(current, reconstructed)` independently guards both inputs and compares all supplied scientific paths with exact value semantics, including signed zero. Missing-on-one-side fields produce `MISMATCH`; no field intersection or partial comparison is used. Callers cannot supply classification rules. A missing field is not fabricated; this is not a validator that asserts every required candidate field exists. The result explicitly scopes itself to `SUPPLIED_REVIEWED_CURRENT_SCIENTIFIC_SURFACE` and sets `completeCandidateReconstruction: false`. Full candidate assembly remains a separate gate.

## Coverage and source audit

All **30 request/context groups plus 16 spatial/evidence derivation groups: 46/46 accounted (100%)**. One further nested persistence-authority distinction is explicitly documented. The executable registry now has **7,510 reviewed paths**, recalculated from the actual corpus, including intermediate containers and wildcard array paths; these are not 7,510 independent measurements. All 5,920 original paths remain, with zero primary-authority changes. The 1,590 additions expose previously opaque descendants and explicit controlled wrapper shapes. It covers the controlled actual-assembler corpus, not every hypothetical extension of those objects. A new field or unreviewed branch remains unresolved and blocks scientific comparison until reviewed.

The source map retains exact producer/consumer anchors from the previous inventory. Re-tracing additionally examined the current request return, `assessOceanEvidence`, `buildTemperatureEvidence`, `buildCurrentEvidence`, `buildPersistenceEvidence`, `assessOceanOpportunity`, `resolveOceanSignals`, `buildRelationshipContext`, `assessRelationships`, snapshot builders, and the lineage governance framework. Static candidate identity/coordinates and bathymetry remain scientific context; captain selection remains outside it.

| Surface | Included authority | Important boundary |
| --- | --- | --- |
| Current Ocean scientific evidence | Source values, consumed source provenance, represented time, assessment context, quality/state, marine conditions, current spatial interpretation, static context, species-neutral relationships | No species result, captain wrapper, retrieval-time substitution or capture-existence upgrade |
| Documentary/history | Explicit `persistenceContext`, governed lineage, inherited warnings and limitations within lineage; snapshot copies | Preserves documentary content and meaningful ordering; does not manufacture history |
| Retrieval/snapshot metadata | `lastUpdated`, snapshot `generatedAt`, record identity/lifecycle/version/provenance, snapshot envelope integrity | Describes recording and preservation, not environmental observation time |
| Operational/request | Diagnostics, cache diagnostics, delivery status, explicitly separate captain wrapper | Retained outside shared science; operational success cannot upgrade quality |
| Species interpretation/output | Existing `blueMarlinHabitat` output boundary | Controlled synthetic output changes are tested; no species evaluator is invoked |
| Unresolved | Unknown paths, unreviewed container kinds or primitive types in any surface | Exact subtree preserved; guarded comparison throws |

Snapshots, Ocean evidence/Opportunity/signals/relationships, and spatial source objects are explicitly CROSS_CUTTING where applicable. They cannot be classified wholesale as historical records or species results. In particular, species-neutral Ocean Opportunity and relationship confidence remain scientific inputs; a generic filter for names such as `score` or `confidence` would discard them incorrectly. No scoring or confidence formula was introduced or changed.

An additional distinction matters: `assessOceanEvidence` currently calls `buildPersistenceEvidence()` **without history**, then passes its unavailable-pathway facts into `buildEnvironmentalOpportunityEvidence`. Those facts are retained conservatively within the current scientific surface because current pathway/relationship code reads them. They are not the supplied-history `oceanOpportunity.persistenceContext`. Historical support field names do not create current observations. The locked non-scoring/persistence-score-zero finding remains limited to the tested current Blue Marlin boundary.

## Temporal, provenance and documentary authority

The machine-readable time map is expanded alongside the reviewed descendants. It distinguishes timestamps, derived durations and metadata validity booleans. Wave/swell period is a physical measurement, not a timestamp. Age is a derived duration, not a new observation time.

- SST/chlorophyll/current source time and spatial sample time retain product-specific represented-time semantics.
- Explicit assessment context and its derived scientific facts remain scientific assessment authority.
- Root marine `observedAt` and weather/marine quality-layer time retain existing quality-time semantics, including weather-first/marine fallback. Snapshot root `observedAt` copies that time; it does not authenticate a different environmental timestamp.
- Snapshot `generatedAt`, `lastUpdated` and metadata recording time remain retrieval/snapshot authority.
- Spatial cache age/TTL remain operational. Publication or acquisition time is not substituted for source time.
- Current empty persistence-support fields preserve their historical-support meaning and absence; no timestamps are invented.

Scientifically consumed source metadata, observation references and observation provenance remain scientific. Governed lineage is documentary/explainability: `LINEAGE_GOVERNANCE_RULES` expressly disallow changes to reasoning, confidence and scores. Warning prose stays intact outside the scientific surface; its underlying quality/source facts remain scientific. Arbitrary metadata does not acquire source qualification from projection.

Re-inspection of actual current producers/consumers found `candidate.waterMask.elevationMeters`, `water`, sample coordinates/offset and source consumed by `resolveOpportunityCandidateBathymetryV1`; the static mask is also used by candidate grid construction. Resolved static facts stay scientific. No raw provider mask/uncertainty-array read was found in the inspected current point/marine-assessor paths. This is a scoped source-code finding, not an inference from fixtures or a system-wide claim. Species-side uncertainty classification/narrative strings also exist and remain downstream species output. Broader mask/uncertainty mapping remains unresolved; injected unknown arrays block comparison rather than receiving fabricated mappings.

## Controlled comparisons

Path A: actual synthetic transport parsers/converters → existing quality/marine/Ocean evidence, Opportunity, relationship and snapshot assemblers → projection.

Path B: the same normalized point and marine inputs → the three unchanged captures → replay → the same assemblers and explicit auxiliary facts → projection.

The point-source fixture uses the existing capture fixture's explicit synthetic attribution on both paths. This is not a production provenance claim. The controlled missing chlorophyll/current objects do not stand in for complete spatial reconstruction. A separate spatial corpus uses actual synthetic source parsers and unchanged spatial assemblers; its frozen spatial objects are supplied explicitly to both sides to qualify classification, **not to claim capture-derived reconstruction**. Test-only extraction invokes the unchanged private organization/relationship/pattern function bodies; no alternative algorithm is implemented.

| Test | Scientific surface | Other surface |
| --- | --- | --- |
| Seven parser/replay cases: complete, partial, rejected weather, rejected marine, fulfilled missing, numeric zero, changed marine directions/period | EXACT_MATCH | Source values and existing state preserved |
| Different supplied history | EXACT_MATCH | Documentary history changes |
| Different explicit recording time | EXACT_MATCH | Retrieval metadata changes |
| Different synthetic captain/Auth wrapper | EXACT_MATCH | Operational context changes |
| Different synthetic species output | EXACT_MATCH | Species output changes |
| Identical explicit spatial auxiliary facts | EXACT_MATCH | No spatial reconstruction claim |
| Changed scientific value, source provider, quality, quality time, assessment or spatial sample | Difference remains visible | No field demotion to obtain equality |
| Changed lineage warnings/order | EXACT_MATCH | Documentary content/order changes exactly |

Zero unexplained scientific-surface mismatches were observed in these controlled comparisons. Full SST/chlorophyll/current spatial capture-reconstruction equivalence remains unqualified. No species score, eligibility, ranking, confidence or Opportunity-identity effect/non-effect is established by this task.

## Safety and preservation

Projection never computes science, converts numeric values, fills missing data, or resolves external references. Null, numeric zero, empty containers and meaningful array order survive. `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains open; existing converter coercion is neither repaired nor approved.

Own data properties are required. Accessors, setters, inherited object/array prototypes, prototype-pollution keys, functions and hostile `toJSON`/`valueOf` values are rejected without invoking getters. Scientific private-label/reference-text attacks are rejected. Unknown private fields remain visibly unresolved and cannot enter a comparison. Explicit reviewed captain context is retained in its operational surface rather than silently stripped; new wrapper fields also require review. Documentary/operational surfaces are not public exports and may retain supplied private content at reviewed paths; this utility is not a sanitization/export endpoint.

Exact existing public limitation prose and the existing SST range-version identifiers are distinguished from dedicated private labels. There is no substring-based exemption for appended private content. Outputs are detached, deeply frozen and structurally deterministic under incidental object-key ordering. No new digest or identity is needed.

Network and implicit `Date.now` are prohibited during the controlled replay check. The projector imports its fixed manifest, existing pure publication data helpers and the Node exact-comparison utility; it has no provider, Auth, captain-history or request fallback dependency.

All three capture contracts remain unchanged. Archive and Publication V3 remain unchanged. The projection adds no reference type and makes no new persistence/durable-resolution claim; existing source/reference boundaries remain intact. Reference compatibility is not proof of future evaluator consumption.

## Next gate and verification

After review passes: **checkpoint Task 12B.6F first**, then resume Task 12B.6C scientific-input equivalence using only the governed CURRENT_OCEAN_SCIENTIFIC_EVIDENCE surface. Prove remaining spatial/provenance/static candidate reconstruction before unified archive-bound species evaluator qualification, with Blue Marlin the first species case. None of those next steps is implemented by this review.

The original implementation baseline was 45 focused tests and 5,920 reviewed paths. Final adversarial verification: **113/113 focused tests PASS; 44/44 backend/shared scripts PASS**, with network blocked. Syntax checks passed for 80 modules; 15 JSON files parsed; whitespace and Git diff checks passed. All 43 existing scripts are unchanged. No frontend/build run is needed because the frontend is untouched.

The required regression includes complete-object diagnostic 10, companion capture 108, weather/marine capture 80, current capture 96, source boundary 7, prior candidate diagnostics 8/12, archive-bound diagnostic 14, temporal primitives 100, temporal history selection 13, explicit assessment 42, scientific history/shared-boundary diagnostics 9/9, publication v1/assessment/history 57/75/87, Frame 17, archive 36, scalar delivery 44 and scalar runtime 22, plus Opportunity/governance, Task 11E and all remaining backend/shared scripts. Review logs and the final cumulative diff are in ignored `.local/ocean-quarantine/task12b6f-review/` artifacts.

## Final adversarial review

**ADVERSARIAL VERDICT: PASS — SEMANTIC_SURFACES_QUALIFIED for the reviewed boundary.** Coverage is 46/46 groups and 7,510/7,510 registered paths; the controlled corpus has zero blocking unresolved paths and zero unexplained scientific-surface mismatches.

Demonstrated defects and corrections:

1. Unknown fields such as `currentSst` inside history, lineage, recording metadata, diagnostics or species-output containers were silently accepted under an opaque ancestor and `complete` remained true. Every surface now descends through exact reviewed paths. Unknowns are retained unresolved and both comparison inputs fail closed.
2. Non-scientific containers bypassed shape checks (`snapshotMetadata: 17` was accepted). Container-kind checks now apply uniformly, and reviewed primitive types prevent scalar/object and measurement/time laundering. This is structural validation, not a new scientific range or source-quality policy.
3. The old guard only extracted one surface and accepted an empty scientific result. The new two-sided guard rejects unresolved or empty science, detects missing/value/provenance/spatial/static differences and does not claim complete candidate reconstruction.
4. An initial draft of the new comparison used JSON canonicalization and collapsed `-0` into `0`. A controlled component test demonstrated the loss; exact deep comparison now preserves that distinction. This correction did not alter any locked capture or scientific formula.

No prior authority assignment was changed to hide a mismatch. Review attacks cover scientific demotion into unknown and already-known downstream slots, non-scientific promotion, lookalikes, cross-cutting snapshots/relationships, consumed provenance, independent quality/assessment/represented/recording times, all six recording fields, history/captain/Auth/species isolation, static evidence, arrays/duplicates/sparsity, missing/null/empty shapes, private labels, descriptors/prototypes, mutation, key ordering and explicit guard failures. Source values at declared paths are not authenticated by this utility: it cannot infer secret caller intent when valid-looking scalar values are supplied under false labels. Missing or changed scientific fields relative to the baseline are detected, and new aliases remain unresolved.

Historical snapshots, prior Opportunity decisions, change/evolution records, acquisition/publication timestamps and other structures not present in the reviewed current boundary are **not automatically classified documentary**. Injecting them at unreviewed paths blocks comparison. The qualified history-isolation claim remains limited to actual supplied-history persistence and reviewed lineage paths.

The spatial fixture limitation remains unchanged: identical explicit spatial auxiliary facts on both paths qualify semantic separation, not capture-derived spatial reconstruction. No species evaluator was run. Complete candidate reconstruction and production source qualification remain unqualified.

Science guard: existing source parsers, three captures, spatial/marine formulas, habitat, eligibility, evidence gate, score, confidence, ranking permission, persistence, candidate/Opportunity identity, provider qualification, freshness thresholds and assessment-time science are unchanged. Existing runtime routes are unchanged. Task 9E-D remains paused. No provider/database/Auth/Supabase access, environmental acquisition, commit, tag, push or deployment.
