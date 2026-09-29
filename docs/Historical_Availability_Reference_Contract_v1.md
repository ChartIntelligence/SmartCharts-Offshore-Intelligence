# Exact Historical Availability-Reference Contract v1

Task 12B.7F. **EXACT_HISTORICAL_AVAILABILITY_REFERENCE_CONTRACT_QUALIFIED** at the normative contract and synthetic adversarial boundary only. **REFERENCE_METADATA_SUFFICIENT**; no demonstrated capture successor requirement.

This does not qualify current production receipt authority, durable storage, a resolver, active-product support or history selection. The [machine-readable contract](Historical_Availability_Reference_Contract_v1.json) includes the complete identity inventory, 16 active-consumer dispositions, attacks, trust requirements and preservation evidence.

## Four separate questions

What the evidence represents is governed by its source facts and temporal support. Which exact evidence it is is governed by existing immutable identity and validation. When Pelora possessed it is governed by a content-bound receipt witness. When science is assessed is the explicit assessmentAt context. None substitutes for another.

| Authority | Meaning and requirement |
|---|---|
| REPRESENTED_TIME | Source-defined environmental/product time; necessary where applicable, not availability proof |
| TEMPORAL_SUPPORT | Complete instant/window/composite/static meaning; independently required for scientific admissibility and unresolved for active legacy products |
| PROVIDER_PUBLICATION_TIME | Release of the exact product revision; supporting provenance, not automatically required for Pelora possession proof |
| PELORA_RECEIPT_TIME | Governed completed possession/creation of the exact referenced content; a trustworthy witness at or before assessment is required |
| ASSESSMENT_TIME | Explicit immutable target knowledge cutoff; never replaced by wall clock |
| RETRIEVAL/REPLAY_TIME | Current execution context; documentary for this predicate, not a replacement historical receipt |

## Minimum availability record

The reviewed contract identifier is `pelora-historical-availability-reference-v1`. Its logical closed record has four fields:

- `contractVersion`: this availability contract's version.
- `evidenceReference`: an existing validated exact immutable evidence reference.
- `receivedAt`: strict explicit UTC timestamp of completed possession of that exact content.
- `authorityReference`: exact immutable reference to an independently governed event/clock witness binding the evidence and receipt assertion.

Meaning: **At receivedAt, the governed Pelora authority witnessed possession of the exact content resolved by evidenceReference.**

Source/product/family identity comes from the validated evidence; do not copy competing identity fields into the receipt. The referenced authority carries issuer/event/clock and producer provenance necessary to establish the assertion. It is not a claimant-provided `trusted=true` flag. The availability record may itself use the existing four-field captured-reference envelope as metadata; this creates an identity for the metadata, not a duplicate environmental observation identity. Tests use existing canonical metadata hashing, not a new measurement encoder or cryptographic system.

## Existing exact identities

Current evidence v2 binds `captureId`, capture contract version and the domain-separated exact-reference digest through `currentCaptureReferenceV2` and its validator. Its narrower `scientificContentDigest` alone does not bind all capture authority/lineage. Use the full reference and validated content.

Weather/marine quality v2 and marine companion v2 expose corresponding exact reference validators. Companion also binds its quality reference; required dependency resolution remains binding. A receipt for companion metadata must not waive the quality dependency's identity or validity. The focused test constructs both through existing capture code and binds availability without changing either schema.

Environmental sample v1 already identifies `[frameId, frameDigest, componentIndex, sampleIndex]`. A validated possession witness for an entire exact Frame can establish possession of its contained source sample after verifying the address and digest. It does not prove that later interpretations or derived calculations existed at that time. No new numeric sample encoding or observation ID is introduced.

Ocean Product Frame/archive identity uses frameId, exact canonical frameDigest and contentDigest; contentDigest excludes frameId. Resolve the complete existing archive reference and receipt validation. Existing Frame serialization is not substituted for exact capture v2 signed-zero serialization. The contract binds each representation in its own existing domain.

Publication V3 binds evidence/history references and scientific content identity. It is not an observation or upstream receipt witness merely because its bytes are valid.

## Content binding and revisions

Source name, nominal time, filename, URL, family or request alone cannot establish availability of a particular revision. Tests create two captures with the same represented time and different scientific values: revision B cannot inherit A's receipt. Changing represented time also changes/rejects the old exact reference. Availability metadata supplies no represented-time override.

| Receipt ordering | Availability conclusion |
|---|---|
| A before assessment, B after, same support | A can prove possession; B's late receipt cannot inherit A's authority |
| B before assessment, A after | B can prove possession; “older/newer” labels do not decide availability |
| Both before | Both may pass possession; revision selection remains separate |
| Only a late receipt known | No pre-assessment possession established; do not infer or fabricate an earlier event |

A late receipt does not prove that no earlier receipt ever existed. It simply provides no pre-assessment witness. Same-support revisions do not create elapsed observation time. No latest-wins, first-wins or provider-preferred policy is selected.

Repeated receipts of the same exact content create additional availability events, not observations. A trustworthy receipt at 11:00 suffices for the possession condition at 14:00 even if first receipt at 10:30 cannot be established. Earliest-known receipt is **AUDIT_USEFUL**, **NOT_REQUIRED_FOR_AS_OF_ELIGIBILITY**.

## Event and clock authority

Request start does not prove completed possession. Response completion can witness exact raw bytes, but does not backdate normalized scientific content or a capture created later. Successful normalization/capture completion can witness the exact referenced scientific evidence. Archive completion can corroborate possession only under a trustworthy event model.

The existing SST acquisition code binds supplied completion time to candidate/checksum/bytes, and archive validation binds exact content to caller-supplied archive event metadata. These are building blocks with external clock/port guarantees. Archive plans expressly do not claim persistence; an archive timestamp is not automatically measured commit time or first receipt. No active-history availability issuer/resolver is established by this review.

The normative trust requirement is a server-controlled recorder that observes the event, binds exact content and time, and preserves issuer, clock/event meaning and producer provenance. Its immutable witness must be independently resolvable and protected against claimant rewriting or backdating, through append-only or equivalent governed integrity. This is a logical requirement, not a database choice or crypto design. Unknown clock accuracy, event ordering or trust cannot be replaced with an invented tolerance.

A self-consistent object and hash do not authenticate occurrence. The adversarial fixture uses a stipulated trusted witness map to test dependence on independent authority. An otherwise identical fabricated receipt fails when that witness is absent. This is not a production issuer, authentication mechanism or durable storage implementation.

Operational wall clock is legitimate when recording an actual receipt/completion event under that authority. Replay uses the immutable historical timestamp and explicit assessment; it must not consult current wall clock. The test replaces Date.now with a throwing function and still reproduces the availability result.

## Normalization and scientific content

Different normalized scientific content has a different exact reference and cannot inherit another content's receipt. A later normalization version must not backdate a newly produced scientific result to the original raw download. Raw receipt and normalized-content receipt are separate facts unless a separately qualified derivation establishes the claimed historical content.

If two versions produce identical exact content, content identity need not be duplicated merely to record producer version. The authority witness/lineage or evaluator configuration must preserve producer/normalization version when it is needed to explain how and when the content existed. Identical values do not prove a particular normalizer ran. No normalization amendment is implemented or version selected here.

## Conceptual predicate and failure behavior

The test-only availability predicate receives validated evidence/reference closure, an immutable availability record, independently resolved trusted witness/authority policy, and explicit assessmentAt. It validates closed shape, versions, identities, authority and strict UTC time, then tests `receivedAt <= assessmentAt`.

Before and equality pass the possession condition. After fails it. Malformed, missing, ambiguous, mismatched or untrusted authority is rejected rather than converted to a qualified Boolean. No tolerance is introduced. This predicate does not select history, choose revisions or decide support, freshness, quality, lookback, gaps, consumer requirements or derived finiteness.

Negative tests cover missing authority, post-assessment time, invalid/ambiguous time, digest/version/family mismatch, competing revision substitution, tampered receipt, self-consistent fabrication, private fields, inherited properties and accessors. Getters are rejected without invocation. Existing descriptor-safe privacy validation is reused only in qualification fixtures. Closed metadata contains no captain, boat, user, Auth or private Fishing Log context. Opaque identifiers and authority targets still require privacy governance; syntactic validity alone cannot detect concealed private meaning.

The evidence, record and witness must be immutable. Altering content reference, receipt time, bound source identity or contract version produces a distinct binding; it cannot mutate old history. Availability equality does not certify unrelated scientific validity. Zero and signed zero remain governed by exact evidence contracts.

## Composition and active-consumer requirements

All 16 active consumers are **REQUIRED_FOR_AS_OF_USE** for availability authority of their required historical source dependencies. Their complete names/source bindings are in the JSON; this does not assert every derived result existed at source receipt. A new recomputation requires its own valid dependencies and arithmetic. The two documentary and nine unwired consumers remain separate and are not promoted.

Instant, interval, composite and static representations can coexist with availability references. Their scientific support policy remains separate. **ACTIVE_HISTORY_TEMPORAL_SUPPORT_UNRESOLVED** remains open. Receipt metadata cannot turn a nominal daily timestamp into an instantaneous observation or remove future support.

DIRECT and GAP_FILLED chlorophyll finite endpoints independently can pass the conceptual possession condition with explicit synthetic trustworthy witnesses. That proves composition only. Actual legacy histories lack those qualified witnesses and support authority; full as-of eligibility and production reachability remain unqualified. The conditional temporal overflow finding is preserved without rerunning or changing its formulas. Direct/gap-filled equivalence remains unqualified.

For V3, the test appends an availability metadata reference to an evidence entry's existing `lineageReferences`, rebuilds and validates the publication, and observes a different content identity. **Schema compatibility is demonstrated.** V3 does not thereby resolve the reference, authenticate the event, or implement admission. No V3 amendment is required for opaque binding at this boundary.

## History, retention and future acquisition

Legacy evidence without trustworthy exact receipt authority remains **AS_OF_AUTHORITY_UNKNOWN**. Preserve its values, references and mechanical replay. Do not retroactively invent timestamps. Independently established later documentation of an earlier receipt may be linked as new evidence of authority, but a guess or reconstructed wall clock cannot repair the past.

The minimum future acquisition behavior is to record a content-bound availability witness after successful normalization/capture, under governed event and clock authority. Preserve raw acquisition witnesses separately and retain the exact dependency/producer binding. This review does not create storage, a capture successor, selector or production helper.

Resolver requirements are exact-identity lookup, immutable schema/digest/authority validation, deterministic offline replay and privacy-safe metadata. No latest lookup, provider, Auth or current clock is required during replay. Retention duration is not selected. Deleting all qualifying receipt/witness authority destroys strict as-of proof unless equivalent independently retained authority remains.

## Verdict and next gate

The availability-reference contract is qualified as a normative composition boundary with synthetic adversarial evidence. **REFERENCE_METADATA_SUFFICIENT** is supported; no numeric capture successor is necessary for the demonstrated cases. This is not operational deployment qualification.

Next: **CONSUMER-AWARE HISTORICAL SELECTION POLICY**, composing represented/support authority, exact availability authority and consumer-specific eligibility. Active support, consumer revision policy, operational issuer/clock/resolver qualification and legacy authority gaps remain explicit prerequisites. Then temporal-derived finiteness, then cross-route normalization review. Do not proceed directly to implementation.

Tasks 12B.6C and 9E-D remain paused. Current-vector failure locality remains qualified. Convergence/Ocean Physics remain untouched and paused; NOAA SME clarification is pending. Numeric-string compatibility, provider-fill qualification and legacy SST coordinate fallback remain open.

## Verification

The new suite has 25 passing tests. Final regression and preservation results are recorded below and in the JSON. Only four new artifacts are added; no production implementation, historical rewrite, provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment occurs.

Final verification: all 79 executed backend/shared regression scripts passed with network blocked. New contract suite: 25; prior active provenance: 13; cutoff: 17; consumer history: 7; chlorophyll temporal: 19; temporal primitives: 100. Exact captures, publication V3, Frame/archive/scalar and all other executed suites are listed in the JSON. Existing quarantined `candidateSemanticProjectionV3.test.js` remained excluded from execution and was syntax-checked and preserved. All 151 JavaScript syntax checks and 147 repository JSON parses passed; reference hashes, new-file whitespace and `git diff --check` passed. All 135 pre-existing untracked artifacts are byte-identical. Four new files only, 139 untracked total; tracked/staged diffs empty. Expected branch/HEAD preserved. No production implementation, storage/selection change, historical rewrite, provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment occurred.
