# Governed Temporal Evidence Primitives v1 — Task 12B.5

Verdict: NARROW_PRIMITIVES_QUALIFIED_FOR_SYNTHETIC_AS_USED_INPUTS. Consumer-aware selection remains required. This is not a production source resolver, a universal observation identity, or completed Task 12B equivalence. The previous 27-consumer inventory and STOP findings remain intact.

## Current Blue Marlin dependency audit

The audited path is `getOceanConditionsAtAssessment` → current `assessOceanEvidence` → `assessOceanOpportunity` → `resolveOceanSignals` / `assessBlueMarlinHabitat` → `buildUnifiedSpeciesOpportunityInterpretationV1AtAssessment` → ranking input. The authenticated Ocean Memory branch separately composes time series → change/persistence → evolution → temporal explainability. Only the composed `oceanPersistence` enters `assessOceanOpportunity`, in its explicitly documentary `persistenceContext`. Signal output carries that context separately from its selected current signal.

`assessOceanOpportunity` builds pathway classification from current environmental Opportunity evidence and current feature candidates, not the documentary persistence context. `buildRelationshipContext` can read `pathwayClassification.evidence.persistenceAvailable`; this is not authority to inject historical persistence into that field. The current composition does not promote historical `persistenceContext` into that pathway evidence. `assessBlueMarlinHabitat` calls `buildPersistenceEvidence()` without historical inputs and sets `persistenceScore = 0`.

The real composition test replaces absent persistence with synthetic available/high-confidence/100-sample persistence. Documentary output changes; the complete habitat object, complete candidate interpretation and ranking gate remain identical. Habitat persistence score is zero. This establishes the tested current boundary, not all possible future history effects or a claim that persistence is irrelevant.

Candidate negative-conclusion adequacy consumes current spatial SST/current evidence, represented timestamps, provenance, chlorophyll quality and explicit scientific assessment time. It does not query historical sequences. These current evidence/time requirements remain SCIENTIFIC_BLOCKING; temporal history is not a substitute for them.

| Temporal input | Current effect | Blocking classification | Primitive now required? | Selection required before current blocking-output equivalence? |
|---|---|---|---|---|
| Current evidence represented times + assessmentAt | Eligibility/gates/score/confidence/negative adequacy through current evidence governance | SCIENTIFIC_BLOCKING | Existing assessment contract; sample representation qualified narrowly here | No historical lookback; archive-to-current-evidence equivalence remains required |
| Historical SST/current/chlorophyll feature persistence, summarized as persistenceContext | Persistence classification/context and temporal explanation | DOCUMENTARY_ONLY at Blue Marlin scoring boundary | No for blocking outputs; SST test view exercises future representation | Not demonstrated as a blocker; production temporal views remain unqualified |
| Change/evolution/temporal explainability | Temporal facts and narrative | SCIENTIFIC_NONBLOCKING | Observation + intelligence pair needed for future full temporal replay; not supplied by reference alone | Not for current blocking outputs; required for full temporal parity |
| Historical feature association/movement | Continuity/movement facts where separately composed | SCIENTIFIC_NONBLOCKING | Deferred; no label-based association | Not demonstrated as blocking; separate qualification remains |
| Governed Opportunity observation/accumulation/continuity/trend | Prior decision relationships, persistence/trend documentation | SCIENTIFIC_NONBLOCKING | Publication candidate assessment reference view can preserve exact decision authority | Not for current blocking outputs; decision selection remains consumer-specific |
| Captain-owned history / previous-response substitution | Request fallback | REQUEST_FALLBACK_ONLY | Excluded | Outside shared scientific evaluation |

No historical sequence was demonstrated to block eligibility, Minimum Opportunity Evidence Gate, score, confidence, ranking permission or negative adequacy in this current path. This does not prove complete archive-bound or complete-universe equivalence. No token-dependent score/confidence/ranking effect is asserted. Narrative and continuity parity are separate deliverables, not silently discarded.

## Environmental evidence sample primitive

`pelora-environmental-evidence-sample-v1` is deliberately narrower than a global environmental observation contract. Construction requires an existing valid point-layout Ocean Product Frame and exact component/sample indices. Grid sampling is deferred to the existing scalar/archive adapter boundary; this primitive rejects grids rather than inventing a sampler. It derives the existing archive/frame digests, product, temporal support, environmental location, exact value/unit/missing reason, quality, provenance and lineage. These fields preserve value authority, support and exact sample location without copying massive source arrays into the result. Validation against the frame recomputes every derived field; caller-asserted values cannot override evidence.

The observation ID is a deterministic tuple of existing frameId/frameDigest/componentIndex/sampleIndex, not another cryptographic digest layer. It identifies exact as-used frame evidence. Frame acquisition metadata remains distinct inside the source temporal metadata and is not used as represented time. Existing frame digests include source metadata; independently re-created frames/aliases are NOT thereby proven independent observations. Semantic alias resolution and immutable frame-ID qualification remain upstream. No source durability, provider qualification or general observation equivalence is claimed by this constructor.

Distinct provider revisions can be preserved through distinct governed frame identities/product versions/provenance, while retaining the same represented support. The test view refuses competing same-time revisions rather than choosing one. It cannot manufacture elapsed time from a correction. An as-used sequence must explicitly supply its chosen evidence. Production revision precedence remains unresolved.

Existing Frame instant/interval/composite-window/static/unknown/forecast support is retained verbatim. No reduction to a universal timestamp. The SST qualification view accepts only the synthetic instant/direct/degF/one-exact-location case; it rejects other support and family semantics. Static context is representable but not an SST temporal sample. This does not qualify NOAA daily or interval products as instant observations.

## Scientific assessment primitive

`pelora-publication-candidate-assessment-v1` is a narrow scheduled assessment view of a **validated completed V3 publication**, bound to a declared Blue Marlin candidate. It retains the scheduled assessment context, exact publication content identity, evaluator/configuration references, evidence-set/history identities and candidate result. Gate and decision references are preserved exactly. Score/confidence and observation/intelligence payloads are not fabricated where V3 stores only references.

Its identity is a tuple of publicationId/contentDigest/candidate/species. It does not introduce a new publication primitive or hash the publication again. Execution metadata is validated but excluded from this derived scientific identity. It is not a new standalone request-time assessment evaluator; Task 12B.1 remains authoritative. General request result capture and result resolution remain outside this narrow view.

One exact observation supports three distinct synthetic V3 assessments at 00/04/08Z without producing three environmental samples. Publication cadence is not observation cadence. Equal 84°F values at three distinct legitimate represented instants remain three observations. Prior exclusion stays a gate reason, not a negative observation; rank is absent from both primitives and is not continuity identity.

## SST qualification and equivalence

The test-only `sstQualificationView` validates source-backed records, rejects future evidence and incompatible locations/support, deduplicates exact sample IDs, refuses ambiguous same-time inputs, sorts by represented time, and preserves missing values. It does not fetch, window, forward-fill or interpolate. It does not claim historical admissibility: synthetic fixtures are explicitly supplied as qualified as-used test material. Real admissibility and source selection remain future gates.

Primitive-backed input and direct checkpoint-compatible snapshot input produce EXACT_MATCH in the existing SST persistence function. Three equal-valued represented observations retain sampleCount 3 and confidence 70. Missing SST remains null/unavailable and is filtered by existing science. Repeated assessment of one sample yields one sample, not extra support. Revised same-support evidence remains distinguishable without additional elapsed time.

DIRECT/GAP_FILLED chlorophyll sequence equivalence is deferred. Historical current speed/direction sequence policy is deferred. Current chlorophyll/current assessment governance remains required and unchanged. Historical feature continuity cannot be inferred from labels or approximate coordinates. Change still requires real observation and intelligence snapshots; neither new reference view supplies missing intelligence payload.

## V3 binding, privacy and replay

V3's existing captured-reference shape can bind the exact assessment view (contractVersion plus SHA-256) in `history.entries[].evaluationReference`, with exact candidate/species/evaluatedAt and separately justified representedAt. The synthetic instant case is tested. No V4 amendment is demonstrated. This is binding capability, not source sufficiency or a resolver. Interval/static history must not be assigned a fabricated represented instant to fit this example. Such future consumer-specific use requires separate qualification.

Construction copies data before validation, rejects inherited/accessor properties without invoking getters, and deeply freezes results. Strict schemas plus dedicated private-field rejection prevent captain context entering the records. Opaque reference contents still need upstream privacy/provenance governance. Synthetic references are explicitly synthetic. Environmental sample coordinates are governed evidence coordinates, never captain trip coordinates.

No Auth/session dependency, network call, database, storage port or implicit clock exists in the constructors. Replay from the same frozen sources is deterministic; later caller mutation cannot change a result. Source validation does not establish production history availability. Captain-owned tables remain excluded, and current authenticated retrieval/fallback is untouched.

## Remaining gates

For the first shared Blue Marlin blocking outputs: qualify full frozen archive evidence conversion, evaluator/configuration completeness, candidate universe/cap, captain projection/ranking separation and reviewed runtime migration. A universal history window is not demonstrated as a prerequisite for those outputs. Before claiming complete temporal/continuity/narrative parity: qualify consumer-specific shared source identity, as-used revisions, historical admissibility, support, gaps/lookback and resolver completeness. No retention/storage policy selected.

No routes, formulas, thresholds, continuity identities, candidate/Opportunity identities, provider qualification, publication contracts or assessment science changed. Task 9E-D remains paused. No provider/database/Auth/Supabase access or environmental acquisition. No commit/tag/push/deployment.

## Verification

Network-blocked regression: all 35 backend/shared test scripts passed. Task 12B.5 focused: 34; Task 12B.4: 13; Task 12B.3: 13; Task 12B.2 diagnostic: 9; Task 12B.1: 42; Task 12B diagnostic: 9; Task 12A.2: 87; Task 12A.1: 75; publication v1: 57; Task 11E: 56; Ocean Product Frame: 17; archive: 36; scalar delivery: 44; Task 11B/scalar runtime: 22. Opportunity/governance and ocean-condition regressions passed. New module/helper/test syntax, JSON and whitespace checks passed. No frontend build required.

The machine-readable qualification/equivalence inventory is `Blue_Marlin_Temporal_Primitives_v1.json`. It records zero unexplained MISMATCH, with unresolved production policies retained. Two versus three legitimate SST observations preserve existing feature confidence 60 versus 70 (EXPECTED_HISTORY_DIFFERENCE), not a demonstrated final Blue Marlin scoring change. The Blue Marlin comparison preserves nonzero habitat suitability 24 and confidence 35 alongside identical full habitat/interpretation/gate outputs.

## Final adversarial review

One demonstrated defect was corrected: a private `captain_id` could pass through a valid Frame provenance parameter encoded as `{name, value}` rather than as an object key. Dedicated private names are now rejected in provenance parameter names and quality flag identifiers as well as object keys. Case/underscore/spacing aliases are normalized for this privacy check. Opaque source identifiers are not interpreted as authenticated or privacy-safe merely because they pass a syntax check. No scientific formula changed.

The expanded focused suite contains 100 passing cases. Source-backed sample validation rejects altered source IDs/digests, product/component/unit, support, revision, provenance, lineage and address. Asymmetric point/component samples preserve exact x/y and source indexing. Asymmetric 2-by-3 grids are rejected, not sampled or transposed. Missing reasons (including land) remain missing; numeric zero survives; NaN/Infinity and malformed masks fail. Unsupported family/component/unit/evidence class and non-instant support cannot enter the tested SST view. Supplied irregular/240-hour gaps remain calculable equivalence fixtures, not production gap qualification.

Authority has a precise limit: Frame validation is structural/content validation, not provider authentication. A self-consistent newly fabricated Frame is new **unqualified** input; it cannot validate as the original as-used sample. Likewise V3 integrity is not a signature establishing trusted authorship. The caller must obtain exact source authority from a separately governed resolver. Neither constructor accepts an arbitrary scalar as a frame nor grants source qualification/admissibility. This task does not claim to distinguish a fabricated self-consistent source from an authentic provider record without that missing trust boundary.

Valid V1/V2 records and corrupted/incomplete V3 records are rejected by the assessment view. Candidate/species/gate/score/confidence/time/history/evidence substitutions fail. A newly valid, intentionally rebuilt governed decision has distinct scientific identity; a valid change only to execution timestamps leaves the derived assessment view identical. This preserves the distinction between changing scientific authority and overriding an existing accepted record.

Mutation/accessor/inheritance/key-order attacks pass. The actual Blue Marlin persistence-context composition still changes documentary context only, with full habitat/interpretation/gate equality and the reviewed 24/35/0 values. No extrapolation to future species, future scoring, qualified history sourcing or complete temporal replay is warranted. Current evidence and assessment time remain blocking.

Final review regression: all 35 backend/shared scripts passed again with the network guard enabled, including 100 focused tests and the unchanged prerequisite suite counts listed above. Syntax, JSON, new-file whitespace and `git diff --check` passed. The final scope remains the same five uncommitted Task 12B.5 files; no runtime/publication/science file was changed.
