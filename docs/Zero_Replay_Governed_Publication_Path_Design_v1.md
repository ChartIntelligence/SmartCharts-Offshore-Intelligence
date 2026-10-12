# Zero-replay governed publication path design v1

**ZERO-REPLAY PUBLICATION DESIGN READY — proposal only; NOT IMPLEMENTED OR QUALIFIED.**

Reference baseline: 913c5518327ccd53516d28da20e1bef593006b21, isolated ranked-publication compatibility lineage. This is not the general async-worker baseline or approval to integrate it. No scheduler, DB/schema/migration, Receipt Writer, production, merge or scientific changes.

## Decision and current boundary

Four-hour publication must consume an already-produced immutable governed result. The upstream trusted evaluation execution owns scientific interpretation, adequacy, eligibility, ranking, confidence, delivery, evaluation-state classification and source selection. Publication owns exact preservation, context/cycle binding, operational lifecycle/revision and governed retrieval, not a second scientific decision.

Current backend/durableObserve/publicationEnvelope.mjs createRankedPublicationComposer invokes buildUnifiedCaptainOpportunityDeliveryV1 from supplied interpretations and buildGovernedOpportunityEvaluationStateV1. Its fields validator also replays the evaluation-state classifier. Those contracts remain unchanged. docs/Controlled_Same_Evaluation_Publication_Binding_v1.md proves equal results under that existing controlled path, not zero replay. controlledPublicationBinding.mjs validateControlledComposition already checks exact equality to retained output.delivery/output.evaluationState; this preservation seam is reusable, but the existing enclosing envelope still replays. No validator may be advertised as zero replay merely because evaluation acquisition is absent.

Use an additive, explicitly versioned upstream-result and preservation envelope path. Do not silently change v1 semantics or weaken its replay validation. Proposed names: pelora-governed-evaluation-result-v1 and pelora-preserved-ranked-publication-envelope-v1. Names/fields remain provisional until the separate implementation/qualification packet.

## Authoritative artifact required before publication

An upstream governed-result artifact must be emitted by the trusted evaluation completion boundary only after the existing producers finish. It must retain their actual outputs from that same execution, not reconstruct them later or accept arbitrary finished caller objects. No network request wrapper or captain history may supply shared authority.

Required fields or validated exact immutable references:

| Dimension | Must exist upstream |
|---|---|
| Contract/producer | Artifact version; actual evaluator, ranking, delivery, evaluation-state and policy versions; declared qualification scope and limitations. |
| Execution authority | Distinct evaluation execution/attempt identity, governed authorization/configuration reference and protected completion/admission reference. Digest alone is not a trusted execution witness. |
| Cycle/context | Existing cycle identity, scheduled UTC boundary, explicit scientific assessment/cutoff; species (current Blue Marlin limitation), approved region/context descriptor, effective configuration identity. |
| Cohort | Exact frozen selected candidate universe/reference, original candidate identity/order/static parents and actual selected-analysis scope; no assertion of unsampled regional coverage. |
| Inputs actually used | Frozen evidence-set identity; exact native raw/capture/binding/accepted-observation references and per-candidate usage; original source/product/revision, represented/support time, acquisition/retention/acceptance and receipt availability at cutoff. Unknown stays unknown. |
| Scientific outputs | Exact candidate interpretation/results, failures, adequacy/eligibility/ranking permission/exclusion records as actually emitted; no missing predicates invented. |
| Ranked delivery | Original Opportunity identities, exact order/ranks, score/confidence payloads, exclusions and all other producer contract fields. Preserve native numeric serialization including signed zero where supported. |
| Evaluation state | Original available/governed-zero/partial/unavailable object, counts/reasons/completeness-support references and selected-cohort scope. |
| History | Actual supplied history resolution/selection reference and limitations. Controlled P1/P4-A retains explicit UNAVAILABLE/sourceReference null; not empty or qualified shared history. |
| Times | Actual source/assessment/freeze/evaluation start/finish/artifact creation/retention times separately. No backdating artifact construction to assessment. |

Exact artifact bytes and identity are immutable. Creation/retention does not itself confer scientific admission. Required fields missing or binding conflicting means publication stops or records a genuine operational failure; it cannot repair producer output. An unavailable producer result may be valid and publishable as unavailable; invalid/corrupt producer artifacts are a different condition.

## States without inference

| Operational dimension | Upstream scientific dimension | Preservation rule |
|---|---|---|
| completed | available | Preserve exact delivery/state; do not fill, reorder or truncate. |
| completed | governed-zero | Require genuine upstream governed-zero artifact and supporting cohort/adequacy evidence with consistent empty delivery. Empty delivery or COMPLETED alone never qualifies zero. |
| completed | partial | Preserve original results/counts/reasons, including zero delivered Opportunities. No promotion to zero or available. |
| completed | unavailable | Preserve unavailable even when execution completed; missing source is not a negative environmental observation. |
| running/delayed/incomplete | no finalized scientific result, unless a distinct upstream partial-result artifact exists | Record operational state without inventing a finished producer bundle. Keep any partial artifact explicitly nonfinal under its own contract. |
| failed | no finalized result or explicitly identified prior produced artifact | Record failure and exact references if available; never label older history as this cycle's successful result. |
| correction/withdrawal | explicit revision/lifecycle action | Append lineage with parent/expected active revision. Ordinary retry cannot correct, withdraw or resurrect. |

AVAILABLE-empty history and empty ranked delivery are unrelated concepts. Counts are consistency checks, not proof of evaluation execution or completeness. Historical query context is explicit, not inferred from age. 72h freshness and 96h live-age remain separate and neither grants eligibility or possession.

## Preservation without recomputation

At ingest, detach exact upstream bytes before asynchronous work. Validate artifact shape/version, exact content digest, native reference syntax, approved registry/authority association, same-cycle/context/species/cohort/evidence relationships and state-specific required fields. Cross-field checks may compare already-emitted values, membership and counts, but must not calculate their scientific meaning or generate replacements.

The preservation envelope stores the exact result-artifact reference plus preserved producer bytes (inline or through immutable readback). It adds actual publication execution/time, operational lifecycle and revision linkage. Publication does not call evaluator, classifier, ranker, confidence or eligibility functions, including during serialize/read/validation. A preservation validator must have no transitive import or fallback invoking these producers. Hashing original bytes and comparing immutable references is allowed; serializing a numeric payload through lossy JSONB is not.

Exact readback verifies envelope and referenced upstream byte identity. Unrecognized/invalid authority fails closed, even with correct digests. Controlled fixture provenance must remain machine-readable and cannot be upgraded to operational authority by successful preservation.

Stable upstream result identity is content/reference and execution-bound according to its new contract. Stable publication binding binds that result to cycle/context/cohort/evidence. Changing any of those must not reuse the prior binding. Existing version addresses are context/cycle/revision, so same address with different content is a conflict, not automatic new revision. Actual later publication time may change envelope bytes while upstream scientific bytes and assessed age remain frozen. If consumers report current age, use a separate read-time field, not rewrite the assessment result.

## What Phase 3 and later durable composition must supply

Observation Phase 3 supplies immutable exact accepted chains, authoritative acceptance time, accepted-only lookup, current fence/terminal guarantees, uncertain-write/restart reconciliation and least-privilege read/write procedures. Raw/evidence/pending artifacts alone cannot become accepted intelligence. Phase 3 does not produce ranked evaluation state, grant product/history admission, create receipts or select a scientific cohort.

A later separately authorized evaluation-completion boundary must durably retain the upstream result artifact and its trusted execution association. Existing publication freeze/store/ownership components should be reused after signature/version reconciliation; no new general ledger is proposed. Publisher attempt/fence remains separate from observation claims. Final preserved-publication head and completion transition must serialize atomically with publisher ownership, not an application-side cached check.

Uncertain upstream retention or publication outcome: query committed exact identity first; matching bytes reuse; conflict fail closed; unavailable DB UNKNOWN/PENDING. No blind new revision, recollection of newer evidence or producer replay to make reconciliation succeed. Receipt Writer remains disabled and outside this design. Missing receipt cannot be replaced by provider source timestamps as proof of cutoff possession.

## Compatibility with current controlled contract

Old v1 envelopes continue their existing composer/replay path and retain all readers/regression expectations. Proposed zero-replay path is opt-in under a distinct contract/version, not an optional skipValidation flag. If store readers use a version discriminator, additive support must be separately qualified; never feed new bytes to a v1 validator that necessarily replays.

P1 output already retains evaluations, delivery, evaluationState, inputsUsed, explicit assessment/context/history and limitations. P4-A's retained input bundle and candidate correspondence provide useful comparison material. A narrow future adapter may preserve those already-produced fields into the new upstream-result artifact, with execution authority still explicitly controlled/unadmitted. It must not relabel actual retained records as CONTROLLED_FIXTURE or remove local/test gates.

A one-time comparison oracle in qualification may independently invoke existing producers under identical inputs to verify equality. That test oracle is not a runtime publication dependency and must be reported separately. A production preservation validator cannot use that test replay as hidden authority.

No scientific completeness, positive Opportunity, confidence, eligibility, source possession, provenance correction, source revision preference, fallback evidence, history sampling or continuity rule may be derived inside publication. Missing upstream information is not permission to infer it from arrays, timestamps, prior ranks or receipts.

## Smallest future implementation slice after Phase 3

Separately authorize a pure, offline upstream-result capture/preservation adapter plus versioned preservation validator/readback, using already-emitted controlled P1 outputs. Add no scheduler/storage activation. Capture the original delivery/state once at the upstream completion seam; bind/validate/serialize/read only exact detached bytes afterward. Instrument evaluator/classifier/ranker to throw if invoked after capture, including transitive serializer/reader paths.

Acceptance tests: exact original results/ranks/scores/confidence/exclusions/identity; genuine zero/partial-zero/unavailable/failure/delayed distinctions; corrupt/missing authority and cross-cohort/species/cycle/evidence rejection; deterministic identity with explicit clock semantics; mutation detachment; original cutoff/source age/receipt limitations; zero post-capture producer invocations; legacy v1 regression unchanged; controlled scope retained. No scientific expected results may be rewritten to obtain a pass.

Only after this pure slice qualifies should a separate packet connect the existing durable store and fenced finalization to the new version. Real PostgreSQL restart/rollback/lost ACK/privilege tests and source/history admission remain independent gates. Full beta continuity and Nightly Learn/Audit are not waived.

## Risks and stop

Trusted execution attestation/registry boundary, exact native serialization, version coexistence, completeness-support reference shape and authoritative producer-time semantics need implementation qualification. A compromised trusted producer can emit consistently hashed invalid science; publication cannot solve that by hashing or replay. Producer scientific qualification and ingestion authority remain essential.

Documentation review only. No runtime edits, imports/test execution, schema/migration/DB connections, provider calls, Receipt Writer, scheduler, production, merge or scientific changes. Existing source/qualification artifacts untouched. Stop after isolated documentation commit.
