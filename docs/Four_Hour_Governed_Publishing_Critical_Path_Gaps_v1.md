# Four-hour governed publishing critical-path gap analysis v1

Documentation only. Current branch baseline: fcec85f794125d6268fbf3223a5db76df57d4aeb, containing qualified memory/fake-port async worker composition. Worker unchanged. Continuous Observe is not operational here; durable Phase 3 implementation on this lineage waits for the real isolated PostgreSQL environment. Receipt Writer remains disabled. No runtime, schema, scheduler, migration, production or deployment work is authorized by this report.

## Evidence scope: branch absence is not implementation absence

Read current shared/oceanPublication.mjs, backend/oceanState/publicationWorker.mjs, backend/opportunityEvaluationState.js, relevant server producer declarations and docs/Four_Hour_Governed_Publication_v1.md. The last document is a historical Task 12A foundation audit, not a complete current inventory. Read later reusable module declarations and retained integration contracts through Git objects at dadec5dbca7d360f70f633413fb6a347dc24cac1. No checkouts moved or modules executed. Later CP qualification is existing historical evidence, not rerun or newly granted operational authority.

This branch starts from the async prerequisite/design lineage, not the later CP-02–CP-09 durable lineage. Neither automatic merge nor wholesale copying of that later lineage is proposed. Reuse must reconcile the now-approved async port signatures, acknowledgment/cleanup outcomes and exact upstream contracts before testing on real PostgreSQL. Missing below means absent or unqualified at the intended operational composition boundary, not necessarily unwritten anywhere in the repository.

## Locked publishing rules

Absolute UTC boundaries: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00. Scheduled boundary is the scientific assessment cutoff; start/freeze/finish/publication times remain actual distinct times. No cycle before approved configuration became effective. Explicit bounded missed-cycle/retry/concurrency policy; no silent skipping or relabeling request-time computations as scheduled assessments.

Server-controlled region/species/context and frozen selected cohort drive work, not app/user/session/viewport/report activity or private captain history. Blue Marlin-only governed producer limitation remains. Preserve exact candidate/Opportunity identity, rank/order/score/confidence/exclusions and evaluation state; no new ranking or adequacy logic.

Operational cycle lifecycle and scientific result remain separate. COMPLETED or an empty delivery cannot establish governed-zero. Available, partial (including zero delivered), unavailable and genuine producer-governed-zero retain their own meanings and selected-cohort scope, never complete regional/captain-range coverage. Current-cycle failure must not borrow previous success as current; latest successful history is a separately labelled lookup. Corrections/withdrawals are explicit append-only revisions, never automatic retry behavior.

72h display freshness and 96h live-age eligibility remain separate. Historical is explicit query context, not an automatic age bucket. Neither age rule grants Opportunity eligibility or historical possession. Source represented time is not proof of exact-vintage possession before cutoff. Missing/late receipts retain uncertainty. Publication does not refresh source age or expand acquisition scope.

## Reusable components and compatibility boundaries

| Component / producer | Existing responsibility | Reuse disposition |
|---|---|---|
| shared/oceanPublication.mjs: cycleV1/V2/V3, assessmentContextV2/V3, freezeEvidenceV1, freezeScientificHistoryV1 and publication validators | Versioned cycle/evidence/explicit assessment and history contracts | Reuse actual selected version; V2 is not V3 history authority. No reinterpretation of shell completion. |
| backend/oceanState/publicationWorker.mjs: runPublicationCycleV1/V2/V3 | Background port-driven claim/freeze/evaluate/create/readback/pointer state machine; CRASH_WINDOWS | Reusable foundation, not an operational scheduler. Existing claim/pointer ports do not themselves prove real transactional fencing or correct uncertain-commit handling. |
| backend/server.js: resolveUnifiedOpportunityRankingInputV1, rankUnifiedSpeciesOpportunitiesV1, buildUnifiedCaptainOpportunityDeliveryV1 | Existing eligibility/ranking/delivery | Preserve producers; do not invoke request-driven acquisition/auth/private-history wrappers as regional scheduler evaluation. |
| backend/opportunityEvaluationState.js: buildGovernedOpportunityEvaluationStateV1 | Available/governed-zero/partial/unavailable, counts/reasons and selected-cohort scope | Producer owns completeness; publication envelope binds rather than evaluates it. |
| Later publicationEnvelope.mjs: createRankedPublicationComposer, serializeRankedPublication, readRankedPublication | Exact ranked/evaluation/context/evidence preservation | CP-08 local/test trust boundary remains. Digest proves consistency, not trusted producer execution. |
| Later publicationStore.mjs: createPublicationStore | Immutable versions, exact lookup and revision authority | Existing isolated durable implementation to reconcile/requalify; do not build another store. |
| Later oceanStateReader.mjs: createOceanStateReader | Qualified bounded accepted CURRENTS reads and time/provenance separation | Dependent on compatible Phase 3 artifacts. Do not reach around its public boundary into protected tables. |
| Later publicationScheduler.mjs: utcBoundary, dueBoundaries, createPublisherLedger; localPublicationPublisher.mjs: createLocalFourHourPublisher | Effective-config absolute cycles, frozen inputs, managed publication ownership, default disabled | Existing CP-09 isolated mechanics; settings are local qualification policy, not approved operational cadence/retry policy. No activation here. |
| Later retainedInputSupply.mjs: resolveExplicitRetainedSelection/readRetainedReferenceSet and retainedBlueMarlinComposition.mjs: composeRetainedBlueMarlinV1 | Exact retained source supply and existing-science composition | P1 CONTROLLED_FIXTURE and P2 unadmitted limitations remain. Supply success is not scientific admission. |
| Later controlledRetainedPublication.mjs and controlledPublicationBinding.mjs | P4-A controlled supply→freeze→actual computation→publication | Reuse controlled integration evidence; explicit UNAVAILABLE history, not intended-beta/operational qualification. |

## Critical-path contracts still needed or not operationally qualified

1. Compatible durable observation authority behind the new async worker: DB-time claim/fence/lease, atomic terminal acceptance, immutable exact chains and uncertain/restart reconciliation. Later implementations are reuse candidates, not automatic compatibility proof.
2. Operational retained-source admission and exact spatial/product/run/revision/temporal support. SST/direct/gap-filled chlorophyll must retain distinct lineage; CURRENTS receipt admission cannot be generalized to them. Unknown authority cannot be replaced by Booleans/digests.
3. Shared environmental history selection and exact cutoff possession. Existing private history repair does not authorize borrowing captain history. Repeated publication of unchanged evidence is assessment continuity, not independent environmental samples. No new lookback, gap, pooling, interpolation or independence policy follows from publication cadence or row caps.
4. Producer-to-envelope common provenance: exact selected cohort/species/context/cycle/evidence actually consumed. Existing controlled adapter proves software wiring only; real-source adapter must retain original static parents, requested/resolved coordinates and native bytes. Do not attach plausible evidence after evaluation.
5. Operational configuration ownership/effective activation, bounded catch-up/deadline/resource policy and pause/revoke behavior. Separate publication ownership from observation ownership; final publication head and publisher fence transition must be atomic.
6. Captain delivery read boundary: exact-cycle versus labelled older success, withdrawal/current failure semantics, auth/privacy and actual frontend/backend consumption. Not authorized here; CP-10 remains blocked.
7. Nightly Learn/Audit and full historical continuity remain beta requirements. They are a separate later mission; current-evidence fixtures do not reduce beta scope.

## Phase 3 dependencies and work safe before it

Observation storage is upstream of accepted-source readers and trusted input freeze. Real PostgreSQL qualification is upstream of durable publication authority/restart/privilege claims. Source admission/history decisions are additionally upstream of operational scientific readiness; a correct scheduler cannot resolve them.

Safe now, with separate bounded authorization: pure contract fixtures for version/context/cohort/evidence mismatch, exact producer-result preservation, empty/partial/unavailable distinction, UTC arithmetic and explicit historical cutoff rejection; read-only signature reconciliation of later durable modules with the approved async port contract; targeted decision packages for genuinely unresolved source/history authority. Existing completed inventories and qualification reports should be reused, not recreated. No DB, acquisition, scheduler activation, new reader architecture or simulated operational claim is needed.

## Smallest next coding slice

Before PostgreSQL: if coding is separately authorized, add one pure offline publication-binding compatibility regression packet using existing shell versions, delivery/evaluation producers and frozen controlled inputs. Validate actual same-evaluation identity and unchanged order/values, reject cross-cycle/cohort/species/evidence joins, and preserve explicit history UNAVAILABLE. Reuse the later envelope/composition fixtures where compatible; do not implement a second evaluator/envelope/store or replace the worker. This can improve composition evidence independently of blocked durability and science, but cannot qualify operational publishing.

When PostgreSQL becomes available: first reconcile/reuse the existing durable claim/terminal acceptance design against fcec85f async ports under a bounded isolated compatibility mission. Characterize exact reference/acknowledgment/cleanup semantics, then qualify concurrency and uncertainty. Only afterward reconnect the existing reader/store/publisher path. Do not begin another scheduler or change worker behavior while waiting.

## Test and release gates

A. Pure compatibility: same controlled inputs/cutoff/history produce identical existing interpretation, adequacy, delivery and evaluation state; genuine zero/partial/unavailable; context/cohort/time/reference mutation and mismatch fail closed; source age never refreshed. Deterministic clock tests are not wall-clock deployment.

B. Real PostgreSQL observation authority: concurrent claims, monotonic fence, lease boundary/revoke/reclaim race, stale publish rejection, exact raw/capture/binding chains, rollback, lost ACK, database/process restart, immutable/direct-DML denial. Reuse historical tests where contracts match; reconcile differences explicitly.

C. Publication durability: six UTC boundaries/day rollover/effective config, bounded missed work and zero-user operation, competing publishers, immutable freeze/prepared bytes, stale finalization, uncertain commit exact lookup, current failure distinct from history, corrections/withdrawals, restricted procedures and bounded shutdown. No double counting overlapping suite totals.

D. Retained science: software equivalence separate from product science, source availability and production readiness. Exact-vintage possession, source support/spatial correspondence and shared history policies must independently qualify; no forced positive Opportunities/adequacy.

E. Release: separately authorized isolated end-to-end execution, actual read-side/privacy/auth acceptance and operational configuration review. Production schema/deploy, paid services, credentials/packages/system changes remain human gates. No production enablement, Receipt Writer enablement or full-beta readiness follows from local synthetic tests.

## Evidence and stop

Read-only source analysis only; no modules imported, fixtures/tests run, SQL/schema/ports changed, scheduler/provider/Receipt Writer started or production/deployment performed. The document is the sole changed file. Async checkpoint and other worktrees remain unchanged. Reuse requires exact version reconciliation; operational source/history science and real PostgreSQL are the principal remaining gates.
