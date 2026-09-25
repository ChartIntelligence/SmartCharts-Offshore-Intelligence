# Immutable Scientific History Context — Task 12B.2 diagnostic

Verdict: STOP at publication binding. Task 12A.2 amendment required before implementing the shared history seam. This is not scientific-equivalence PASS. No history contract/version or runtime adapter is established.

## Dependency audit (completed before editing)

| Stage / exact source | Classification | Finding |
|---|---|---|
| server.js getOceanConditionsAtAssessment -> retrieveOceanMemoryRows | MIXED: shared-scientific potential / captain-owned sourcing | normalizedBearerToken controls retrieval, candidate latitude/longitude selects memory, maximumRows 48. No observedBefore assessment cutoff is passed by this caller. |
| buildOceanMemoryStorageRecordFromRow -> buildHistoricalSnapshotQuery -> buildOceanMemoryTimeSeries | SHARED_SCIENTIFIC_HISTORY only after source qualification | Adapts available rows to snapshots/time series. The runtime converts absent rows to []; retrieval availability remains separate metadata, but the downstream series does not itself establish a complete negative observation. |
| buildOceanChangeFromTimeSeries -> buildOceanPersistence -> buildOceanEvolution -> buildTemporalOceanExplainability | SHARED_SCIENTIFIC_HISTORY / narrative facts | Uses historical snapshots and chronological evidence. These calculations precede assessOceanOpportunity. Preserve algorithms and source timestamps. |
| assessOceanOpportunity persistenceContext | DOCUMENTARY_ONLY in reviewed Blue Marlin scoring path | Carries lifecycle/sample/window/confidence/provenance context. Blue Marlin persistenceScore remains explicitly zero. No token-dependent score change demonstrated. |
| governed_opportunity_history and governed_opportunity_observation | CAPTAIN_PRIVATE_HISTORY storage ownership, with preserved governed artifacts | Local migrations require user_id referencing auth.users, owner-scoped uniqueness and RLS. History stores historical admitted decisions; observations preserve candidate/species evidence. Governed payloads do not make owner-scoped rows a shared source. |
| buildGovernedOpportunityEvidenceAccumulationV1; continuity, coherence, persistence, multiday persistence and trend functions | SHARED_SCIENTIFIC_HISTORY given qualified inputs | Candidate/species identity and chronological evidence remain authoritative. No inference from rank/popularity. No new continuity computation is implemented. |
| getDynamicBlueMarlinOpportunities -> captureGovernedOpportunityHistoryV1 / authenticated historical fallback | REQUEST_FALLBACK / documentary historical decisions | Capture is downstream of governed delivery. Historical fallback is context-compatible historical continuity, not current eligibility/rank. It does not recalculate historical score/confidence. |
| Fishing Logs/catches/private trip information | CAPTAIN_PRIVATE_HISTORY | Excluded from proposed shared history; separate governed learning boundary. |
| retrieval/storage timestamps | DOCUMENTARY_ONLY / operational | Not scientific cutoff. No additional hidden scientific clock demonstrated by this audit. |
| prior immutable publication continuityReference/evaluationReference/lineageReferences | shared provenance potential; reconstruction UNRESOLVED | Exact references are preserved, but referenced payload availability, historical content, cutoff and privacy are not established by those references alone. |

Dependency map: request token -> candidate Ocean Memory retrieval -> adapted historical snapshots -> time series -> change/persistence/evolution -> temporal explainability and Ocean Opportunity interpretation -> Blue Marlin habitat/interpretation. Separately, delivered decisions -> owner-scoped capture; failed/zero delivery -> historical fallback. The latter cannot become current shared science.

Authentication changes sourcing: retrieveOceanMemoryRows requires configured retrieval and bearer token before invoking its injected transport. No token yields unavailable retrieval; an authenticated synthetic fixture can return rows. Existing ocean-condition tests exercise both branches offline. This demonstrates history availability dependence, not defective current science or token-dependent score. The current request's spatial selection and 48-row bound are not a complete regional historical universe.

## Exact publication gap

V2 evaluation keys permit evaluatorVersion, evidenceSetId, candidateResults, signalReferences, lineageReferences and assessmentAt. No explicit frozen history input exists. Worker evaluate receives cycle/evidence/assessment only. Its accepted-record retry compares environmental evidenceSetId and reuses the old publication without verifying an input history identity.

Important limitation of this finding: captured lineage references CAN bind a history digest cryptographically, and changing that digest changes contentDigest. It would be inaccurate to say v2 cannot store a digest. However, no reviewed contract declares a particular lineage reference to be the complete historical input, verifies its payload/cutoff/privacy, delivers that frozen history to evaluation, or compares that input on retry. A digest of future/private fixture content is structurally acceptable as opaque lineage; this is not a v2 defect because opaque payload governance is upstream. Treating lineage/configuration/environmental-family fields as a complete history input would introduce ungoverned semantics.

Task 12A.2 must define an explicit history input/reference and required verification before evaluation; immutable content binding and evaluator acknowledgement; exact asOf alignment with assessmentAt; candidate/species binding; chronology/duplicate handling; future-entry rejection without tolerance; empty versus unavailable versus invalid semantics; and retry/conflict/readback rules. Preserve all accepted v1/v2 records and choose explicit compatible versioning. Do not silently overload configuration or environmental evidence.

## Deferred history design requirements, not an implemented contract

The eventual history context must be detached, deeply immutable and provenance-bound, Blue Marlin-only, with governed candidate/Opportunity/feature identities and exact historical time/support. Include only fields actually required by existing algorithms. No captain IDs, Auth/session/token, email, boat, origin/range, logs, catch, lure/bait or private coordinates. Opaque references still require upstream review. Empty qualifying history must not fabricate continuity; unavailable and invalid must remain distinguishable until governed policy determines their use. Historical entries cannot exceed assessmentAt; history must not introduce another now.

Same frozen evidence, history, assessment and evaluator must replay identically across Auth state and later mutations. That new-seam equivalence is NOT yet tested or claimed. Different history may change existing temporal/documentary outputs; no new persistence or scoring authority is granted. Existing tests preserve score/confidence/ranking semantics, but do not prove all history combinations equivalent.

Remaining gates: Task 12A.2 binding amendment; authentication-independent immutable history source/input qualification; archive-bound evaluator equivalence; complete universe/candidate-cap qualification; captain projection/ranking equivalence; separately reviewed runtime migration.

Scope: diagnostic tests and this document only. No server/publication/scientific contract changes, no storage selection, no Auth/database/provider access. Local SQL source inspection only. Task 9E-D remains paused. No commit/tag/push/deployment.

## Verification

Five focused diagnostic tests pass. All 31 backend/shared scripts pass with the network-blocking preload, including Task 12B.1 (42), Task 12B diagnostic (9), Task 12A.1 (75), publication v1 (57), SST worker (56), Ocean Product Frame (17), archive (36), scalar delivery (44), Task 11B (22), and Opportunity/governance/ocean-condition regressions. Logs are ignored under .local/ocean-quarantine/task12b2-diagnostic/. These are diagnostic and regression results, not new-history-seam equivalence proof. Frontend remains untouched.

## Resumed after V3 checkpoint — Task 12B.2 source qualification

Baseline f9a57f482b20f6dac66dc979a08383b289f95411. The earlier STOP above is retained as historical diagnostic evidence about V2. V3 now supplies the required freeze, cutoff, identity, verification, propagation and retry binding. The old diagnostic output TASK_12A_2_REQUIRED describes the tested V2 limitation, not a new request to amend V3.

Current verdict: STOP — SHARED_SNAPSHOT_PAYLOAD_REQUIRED and SHARED_LOOKBACK_SELECTION_UNQUALIFIED. No history adapter or history-aware scientific evaluator implemented. No new V3 schema defect demonstrated. Binding references is sufficient contract capability; their actual resolved scientific payloads and source selection are not yet qualified.

### Source order and sufficiency

A. Prior immutable publications: contract-valid V3 fixtures preserve cycle/region/evaluator/assessment, candidate/species, gate/reasons, Opportunity ID, environmental references/states, continuity/evaluation/signal/lineage references and bound history. They do not embed the actual historical observation/intelligence snapshots used by current temporal functions. No resolver from those referenced payloads to qualified shared historical snapshots has been established. These fixtures prove shape/binding, not real source availability.

B. Existing feature continuity/persistence artifacts: buildTemporalFeatureContinuity consumes pelora-feature-persistence-v1 with feature type/family, lifecycle, chronological sample count/window, confidence and optional governed movement. These artifacts are computed from snapshot histories in buildOceanPersistence; the request path does not establish an independent immutable shared artifact archive or qualified resolver. A continuityReference alone cannot recreate its payload. Existing synthetic algorithm fixtures establish behavior, not a production shared source.

C. Other environmental history: observation/intelligence/Ocean Snapshot constructors and Historical Snapshot Query provide reusable scientific representations. Current Ocean Memory retrieval is authenticated and candidate-location scoped. A retained SST frame or scalar derivative is environmental evidence, not the historical multi-family interpreted snapshot series required by current science. Neither private memory nor unrelated fixtures are promoted to a qualified shared series. No provider/archive acquisition or live store search was performed.

### CURRENT_REQUIRED_HISTORY_FIELDS versus AVAILABLE_SHARED_PUBLICATION_FIELDS

| Consumer / required semantics | Publication supply | Classification |
|---|---|---|
| buildHistoricalSnapshotQuery/buildOceanMemoryTimeSeries: valid snapshot identity, available snapshot, represented time, schema/provenance, chronological selected records | cycle/assessment are available; snapshot payload/time cannot be inferred from cycle time | INSUFFICIENT_FOR_CURRENT_SCIENCE |
| buildOceanChangeFromTimeSeries: last two chronological observation AND intelligence snapshots | evaluationReference/lineage only; no snapshot bodies | INSUFFICIENT_FOR_CURRENT_SCIENCE |
| buildPersistenceEvidence: observed timestamps, identity, available oceanOrganization and organizationIndex | not embedded | INSUFFICIENT_FOR_CURRENT_SCIENCE |
| buildSeaSurfaceTemperaturePersistence: snapshot ID, represented observation time, finite temperatureFahrenheit per observation | SST evidence reference does not contain candidate historical interpreted samples | INSUFFICIENT_FOR_CURRENT_SCIENCE |
| current/edge/shear/convergence and other feature persistence analyzers: chronological feature payloads, valid feature contracts, availability/classification/strength and evidence values | optional continuity/signal/evaluation references only | INSUFFICIENT_FOR_CURRENT_SCIENCE |
| buildTemporalFeatureContinuity: governed feature persistence type/family/lifecycle, sample count/time window/confidence and movement contract where used | continuityReference can bind, not resolve those fields | INSUFFICIENT_FOR_CURRENT_SCIENCE |
| buildOceanEvolution/temporal explainability: already governed change/persistence outputs and their reasons | not reconstructed by a bare reference | INSUFFICIENT_FOR_CURRENT_SCIENCE |
| candidate/species and prior gate/reasons/Opportunity ID | preserved exactly | SUFFICIENT_SHARED_HISTORY_INPUT for identity/decision provenance only, not environmental history |
| publication/cycle/region/assessment and immutable identity | preserved | DERIVABLE_FROM_IMMUTABLE_PUBLICATION; do not substitute cycle for represented observation time |
| prior exclusions | gate reasons preserved | DOCUMENTARY_ONLY until a specific consumer qualifies their relevance; insufficient/unavailable does not become negative observation |
| prior rank | absent from shared candidate result | NOT_SCIENTIFIC_HISTORY; no rank continuity |
| prior score/confidence | absent as numeric fields in shared candidate result | NOT_SCIENTIFIC_HISTORY for the demonstrated temporal snapshot consumers; referenced interpretation may contain them but no need to copy them is established |

Prior Opportunity accumulation/continuity/coherence/persistence/trend functions require their governed candidate/species observation and temporal evidence artifacts; a gate boolean and prior appearance cannot replace those payloads. No new science or matching rule is introduced. The reviewed current Blue Marlin persistenceContext remains documentary/non-scoring, with persistenceScore explicitly zero. No token-dependent score/confidence/ranking change is demonstrated. Negative-conclusion adequacy still consumes governed current interpretation and assessment context; this task does not establish an additional historical negative-observation source. Narrative temporal facts depend on actual change/evolution outputs; fallback prose is not such evidence.

### Lookback and cutoff

Current getOceanConditionsAtAssessment requests candidate-location Ocean Memory with maximumRows 48 and bearer token, without passing observedAfter/observedBefore. Time-series/query helpers support bounds; change selects the last two supplied chronological snapshots; feature analyzers use available chronological samples with existing minimum-evidence rules. The request transport cap is not a governed regional scientific lookback. No cycles/days/count window is selected here. Qualified source-selection semantics and replayable membership are required before equivalence.

V3 cutoff remains exactly assessmentAt; future entries reject and exact cutoff is permitted. Those contract tests pass. This does not qualify how a source resolver selects historical snapshots or distinguishes represented time, evaluation time and later retrieval. No new clock/tolerance.

### Unimplemented proofs and retained boundaries

AVAILABLE-empty, acknowledged UNAVAILABLE, INVALID blocking, immutability and identity remain verified V3 contract behavior. They are not new scientific-consumption results. Auth/no-Auth/scheduled equivalence, changed-history effects, scientific replay and mutation isolation inside a history-consuming evaluator remain NOT ESTABLISHED. The diagnostic matrix marks payload absence NOT_COMPARABLE_NONSCIENTIFIC, not EXACT_MATCH or an unexplained scientific MISMATCH. A synthetic SST snapshot series is used only to show the existing function requires payloads; it is not manufactured qualified history.

Region/species/candidate/time/source provenance must be verified when resolving history artifacts. Dedicated privacy rejection at V3 schema level does not prove opaque references safe. Captain-owned history/observation tables, Fishing Logs/catches and request fallback remain excluded. Current runtime fallback remains intact; future shared science consumes explicit history while outer request UX may independently display historical fallback.

Exact missing evidence: immutable, integrity-verifiable shared observation/intelligence/feature payloads corresponding to evaluation/continuity references, including required represented times, numeric/feature values, missing/quality/provenance semantics, governed candidate/region/species association, and a qualified cutoff-bounded selection manifest/window. A pure payload resolver could later feed existing algorithms without altering V3, but implementing one without these qualified inputs would claim unsupported equivalence.

Remaining gates: qualify shared payload source and history selection; implement explicit history consumption and Auth-independent/replay equivalence; complete archive-bound evaluator equivalence; complete-universe/candidate-cap qualification; captain projection/ranking equivalence; separately reviewed runtime migration. Archive-bound readiness is NOT established. No runtime/publication/assessment/scientific contract changes. Task 9E-D remains paused.

Resumed verification: 9 focused diagnostic tests and all 32 backend/shared scripts pass with network-blocking preload. V3 87, assessment amendment 75, publication v1 57, assessment science 42, replay diagnostic 9, SST worker 56; Opportunity/governance, Frame/archive/scalar and Task 11B pass. Logs: ignored .local/ocean-quarantine/task12b2-resumed/. Syntax/whitespace/diff checks pass. No provider/database/Auth/Supabase access, environmental acquisition, commit/tag/push/deployment. These results do not establish scientific-history consumption equivalence.
