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
