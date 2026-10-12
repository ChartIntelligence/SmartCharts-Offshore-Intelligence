# Controlled same-evaluation publication-binding regressions v1

PRE-PHASE-3 PUBLICATION BINDING READY — isolated controlled compatibility only.

Authorized baseline dadec5dbca7d360f70f633413fb6a347dc24cac1. Branch codex/pelora-controlled-publication-binding-v1, C:/Projects/Pelora-Agent-Worktrees/pelora-controlled-publication-binding-v1. This is NOT a new general backend baseline, async-worker integration, durable Phase 3 qualification, source admission or production approval. No merge into ea58125/fcec85f/main or any other lineage.

## Actual reused contracts and comparison boundary

Unchanged backend/tests/fixtures/rankedPublicationFixture.mjs executes existing buildUnifiedSpeciesOpportunityInterpretationV1 under explicit assessment with synthetic upstream source/adequacy decisions. Its supplied adequacy flags are existing controlled fixtures, not derived or qualified environmental adequacy. The new tests never turn these into provider evidence. createRankedPublicationComposer uses existing buildUnifiedCaptainOpportunityDeliveryV1 (existing ranking) and buildGovernedOpportunityEvaluationStateV1. Envelope validateRankedPublication/serializeRankedPublication/readRankedPublication preserve exact producer payloads and native binding fields.

Important existing contract limitation: composer builds delivery/ranking from supplied interpretations; validator replays the pure evaluation-state classifier. The tests verify exact equality to the existing producer oracle and preserved original interpretations/results; they do NOT prove a zero-producer-replay path. No environmental computation is repeated by publication readback and no new evaluator/ranker is added. Eliminating this required pure delivery/classifier replay would be a runtime contract change and is outside this packet. A literal requirement of no pure replay whatsoever remains unsupported by this contract; qualification here means no changed or recomputed source-scientific interpretations and exact governed-result equality.

Producer identity/binding includes cycleId, contextKey, assessmentCutoff, cohortReference and evidenceSetId. Deterministic complete bytes require fixed actual execution/publication clock inputs; real later publication timestamps intentionally change envelope content. versionId addresses context/cycle/revision, NOT content. Different evidence can preserve versionId but must change producer binding/contentDigest; immutable storage conflict rejection remains a separately qualified contract, not tested by this offline packet.

## New coverage

backend/tests/sameEvaluationPublicationBinding.test.mjs, 11 cases:
- Exact original fulfilled/rejected interpretations, candidates, delivery/ranking, score/confidence/order, selected cohort, context/species/cycle/evidence preserved through readback; compares existing direct delivery/evaluation-state producer outputs.
- Genuine fixture producer governed-zero remains zero. Partial-zero, unavailable and empty cohort retain upstream state; forged zero rejected.
- Re-signed outer digest does not admit changed ordering, score/confidence, invented Opportunity ID/evidence binding, or contradicted ranking permission. No new eligibility is minted by binding alone.
- Fixed supplied clock/inputs produce identical serialized output.
- Changed context/evidence produces distinct binding; reuse of prior binding rejected. Does not promise changed version address where its contract does not require one.
- Original assessment cutoff, 80h evidence age/source time, stale/live dimensions and unknown receipt authority remain unchanged by later publication time.
- Supplied evaluation invoked once during composition; readback/validation does not invoke it again. Existing pure producer/classifier behavior remains as described above.
- P4 controlledQualification remains NOT_SCIENTIFICALLY_ADMITTED, history UNAVAILABLE/sourceReference null, operationalPublishing false and betaReady false.

Existing publicationEnvelope tests additionally exercise failed/delayed/running lifecycle, missing state, cross-species/cycle/cohort/reference mismatch, late evidence and immutable caller-mutation separation. Existing gates PELORA_CP08_LOCAL=1 and PELORA_TEST_OCEAN_CONDITIONS=1 remain unchanged. No gate is loosened. Private/captain identity exclusion remains enforced by unchanged envelope privacy validation.

## Actual commands/results

Node v24.18.0; existing tracked dependencies only, no install or copies. Process-local test gates only:

    $env:PELORA_CP08_LOCAL='1'
    $env:PELORA_TEST_OCEAN_CONDITIONS='1'
    node --test backend/tests/sameEvaluationPublicationBinding.test.mjs
    node --test backend/tests/sameEvaluationPublicationBinding.test.mjs backend/tests/publicationEnvelope.test.mjs backend/tests/oceanPublication.test.js backend/tests/oceanPublicationAssessment.test.js backend/tests/oceanPublicationHistory.test.js backend/tests/opportunityEvaluationState.test.js
    node --check backend/tests/sameEvaluationPublicationBinding.test.mjs
    git diff --check

Focused 11/11 PASS. Final combined 237/237 PASS, zero failures/skips/cancellations; overlaps included, not additive. Syntax/whitespace PASS. Some existing scripts use completion assertions alongside node:test counts; totals are the actual Node runner output, not a science/readiness inventory. Local output logs: C:/Users/User/Documents/Codex/same-evaluation-binding.log and same-evaluation-binding-combined.log.

Tested new-file SHA-256: eaec8d746974e415a9541aa8428c5783b8b0b07c0a00f7ae66281922e40227e9.

## Lineage and operational limits

All existing runtime, source, fixture, science, schema/migration and package blobs remain unchanged at dadec5d. Only this report and the new test are checkpointed. Tests use supplied synthetic upstream decisions; digest validity is not trusted producer execution or scientific admission. No providers/Auth/database/store/Receipt Writer/scheduler/deployment calls are part of these suites. No full PostgreSQL profile rerun or operational-source qualification claimed.

The async worker at fcec85f has new await/accept/reconcile/cleanup signatures absent from this lineage. Existing later storage/composition modules cannot be treated as automatically compatible with it. No signature reconciliation, merge or runtime amendment is performed here. Phase 3 waits for the isolated real PostgreSQL environment and separate compatibility authorization. Source admission and full shared history selection remain unresolved; no current-only beta scope reduction or CP-10 authorization.

Exact next dependency: separately authorize durable-authority compatibility with the qualified async worker when PostgreSQL is available. For publishing, retain existing controlled contracts until product/spatial/temporal/receipt/history admission and actual operational configuration qualify. Stop after this isolated test/documentation checkpoint.
