# Scientific History Binding Amendment v1 — Task 12A.2

Contract amendment only. No history sourcing, internal history interpretation, production storage, runtime migration or persistence science is implemented.

## Versions and compatibility

New publication: pelora-governed-ocean-publication-v3. New worker: pelora-ocean-publication-worker-v3. Shared history: pelora-shared-scientific-history-v1. V3 evaluator identity must end in -explicit-assessment-history-v1; explicit-assessment-only identities cannot claim this capability. This is opt-in contract capability, not demonstrated internal history consumption.

V1 and v2 constructors/validators retain their schemas and meaning. Complete-record golden hashes generated from checkpoint 8e5c946c34d44c35498e056e80e3b869e9084206 verify old serialization content, digests, cycle/evidence/evaluation/attempt fields. Version-specific cycle IDs, publication IDs and latest-pointer keys cannot collide. Cross-version validation fails. Historical publications do not gain inferred history.

## Explicit scientific input

V3 evaluator input is detached/frozen {cycle, evidence, assessment, history}. Scheduled assessment policy remains pelora-scheduled-scientific-assessment-v1. History asOf equals evaluation.assessmentAt equals cycle.scheduledAt, with UTC normalization and no tolerance. Execution timestamps and later replay do not define historical scientific time.

History input exact fields: contractVersion, state, asOf, reason, sourceReference, entries. Constructor adds contentDigest and historyId (osh- plus SHA-256 of canonical scientific history content). State, cutoff, reason, source provenance and all entries participate. AVAILABLE requires a governed captured/archive source reference even with zero entries: this binds the successful resolution, not a fabricated historical observation. UNAVAILABLE or INVALID has no entries; sourceReference may be null or an exact resolution/provenance reference. Unknown fields/accessors/inherited values fail closed through the existing strict copier/schema validation.

AVAILABLE with [] means successfully resolved, no qualifying entries. UNAVAILABLE means source could not be established; it remains explicit input and must be acknowledged. The contract does not decide its scientific consequence or make it a negative observation. Existing ranking/evidence gates remain authoritative. INVALID is representable as a state descriptor (malformed/private raw material is rejected, never retained). It blocks evaluation/completion/pointer advancement; there is no degraded-science policy. It cannot silently become AVAILABLE-empty.

## Minimal entry envelope

Each entry contains candidateId, species, representedAt, evaluatedAt, evaluationReference, opportunityId (nullable), continuityReference (nullable). Candidate identity must belong to the declared governed universe; species must be Blue Marlin. Both timestamps are explicit UTC, representedAt <= evaluatedAt <= cutoff. A future entry rejects the whole context; nothing is silently dropped. Exact-boundary entries are allowed; no new strictly-prior scientific rule is introduced.

The reviewed existing paths use candidate/species identity, chronological observations and governed continuity/evaluation artifacts. This envelope binds those artifacts by reference rather than copying database rows or inventing feature/persistence payloads. EvaluationReference must resolve later to sufficient immutable governed science; referenced payload qualification and scientific sufficiency remain Task 12B.2. Opportunity/continuity IDs do not grant eligibility or create persistence. No label/rank/approximate-coordinate matching exists.

Input order is normalized: evaluatedAt then candidate/species/evaluation reference. The same unordered entry set yields identical history identity. Duplicate candidate/species/evaluation-reference identity rejects, including conflicting duplicates; distinct evidence revisions require distinct governed references. No averaging or historical synthesis.

Dedicated private fields are rejected at context/entry/reference level: no user/captain IDs, email, boat, origin/range, logs/catch, lure/bait, private coordinates, Auth/session/token or mission. Opaque identifiers and referenced payloads still require upstream privacy governance; syntax/digests alone cannot prove source safety.

## Worker verification, acceptance and retry

V3 adds collectScientificHistory({cycle,assessment}) and verifyScientificHistory(history) ports. These are pure injected contracts, not production sources. Verification must return exact {status: VERIFIED, historyId, historyState}. Only verified AVAILABLE/UNAVAILABLE contexts reach evaluate. The evaluator returns exact historyId and historyState alongside existing assessment acknowledgement. Missing/wrong/accessor acknowledgements fail before write. ACKNOWLEDGEMENT PROVES CONTRACT PROPAGATION ONLY; Task 12B.2 must prove internal scientific consumption.

The publication embeds the entire frozen history at publication.history. Evaluation binds its historyId/historyState. History participates in contentDigest/integrityDigest. Same-cycle changed history returns SAME_CYCLE_HISTORY_CONFLICT; no overwrite or automatic winner. Identical accepted retry reuses original scientific and execution metadata. Evidence/universe/configuration conflict rules remain unchanged. AVAILABLE-empty versus UNAVAILABLE is a meaningful conflict too.

Durability acknowledgement, exact readback, complete-record validation, pointer CAS and latest-read verification all reconstruct and validate history. Missing/corrupt/substituted history prevents acceptance or latest advancement. Earlier verified publication remains available under existing failure reporting. Publication ID remains cycle-based; changed history within the cycle changes content digest and requires reconciliation rather than pretending to be a new independent accepted record.

Crash windows remain unresolved external reconciliation: after claim; history/evidence freeze; evaluation; write; readback; CAS. Reconciliation must retain the exact frozen history plus evidence and configuration; it cannot collect newer history and call it the original retry. No production ledger, distributed lock, durable store, CAS, scheduler or recovery workflow is claimed.

## Boundaries retained

Prior publications can be exact referenced artifacts, but references alone do not prove sufficient historical fields. Captain-owned governed_opportunity_history and governed_opportunity_observation tables are NOT automatically shared sources. No database read, migration or storage choice. Request/session fallback and prior captain responses remain outside shared scientific history.

No change to continuity, persistence, movement, strengthening/weakening, eligibility, score, confidence, ranking permission, candidate/Opportunity identity, environmental thresholds or provider qualification. No frontend or Opportunity function changes. Task 9E-D remains paused. Subsequent gates: Task 12B.2 source/consumption qualification, archive-bound evaluator equivalence, complete-universe/cap qualification, captain projection/ranking equivalence and separately reviewed runtime migration.

## Verification

42 focused history-binding tests passed, including checkpoint-derived v1/v2 full-record and serialized-byte golden hashes. All 32 backend/shared scripts passed under the network-blocking preload; the focused suite was rerun after adding final tests. Task 12A.1: 75; v1: 57; Task 12B.2 diagnostic: 5; assessment science: 42; replay diagnostic: 9; SST worker: 56. Opportunity/governance, archive/frame/scalar and retained-pilot regressions passed. No provider/network access. Logs retained in ignored .local/ocean-quarantine/task12a2/. Syntax and whitespace checks passed. No commit/tag/push/deployment.

## Task 12A.2 final adversarial review

Preflight reconciliation: actual HEAD is 8e5c946c34d44c35498e056e80e3b869e9084206 (Document shared scientific history boundary), whose parent is the requested older 6a3b9838ae4abf23ddc632693fd565ea39e737f0. The two Task 12B.2 diagnostic files are committed at HEAD and unchanged, not missing or omitted from the four-file amendment scope. No diagnostic file was staged, rewritten or recreated. Task 12A.2 remains exactly publication module, worker module, focused history test, and this amendment document.

Adversarial findings: no implementation defect demonstrated; contract/worker behavior required no correction. Added regressions reject malformed/inherited/accessor history and acknowledgement schemas, unsupported timestamps and future entries (including +1ms), semantic/conflicting duplicates, private reference fields, deceptive evaluator identities, missing/corrupt/substituted durable history, noncanonical readback ordering, and cross-version latest records. Exact cutoff and -1ms entries remain valid. INVALID after a successful earlier cycle retains the previous verified publication and truthful increasing age. AVAILABLE-empty and explicitly acknowledged UNAVAILABLE both may complete; INVALID cannot invoke evaluation or advance latest.

V1/v2 complete-record and serialized-byte checkpoint goldens remain passing. Existing version-specific worker durability/latest regressions remain authoritative. Meaningful history changes change content identity or fail validation; incidental key/input ordering does not. Same exact reference identity cannot be counted twice for one candidate/species. Different full governed evidence references can represent distinct revisions; opaque referenceId strings alone are not scientific revision qualification. Unsupported extra publication/signal/feature fields reject rather than acquire invented meaning.

History acknowledgement uses identity/state, not a redundant entry-count or cutoff field. Identity binds the complete validated history digest including cutoff/count/content. Extra or substituted acknowledgement fields reject. Correct acknowledgement does not prove evaluator internal consumption. Reference syntax and verification-port acknowledgement likewise do not demonstrate privacy of opaque payloads, source authenticity, scientific adequacy, Auth-independent evaluation, or replay equivalence inside Opportunity science. Those remain Task 12B.2 gates. Captain-owned history tables remain unqualified as shared sources.

Final review verification: 87 focused tests and all 32 backend/shared scripts pass with network-blocking preload. Task 12A.1 75, v1 57, history diagnostic 5, explicit assessment 42, replay diagnostic 9, SST worker 56; Opportunity/governance, Frame/archive/scalar/runtime and retained-pilot suites pass. Syntax/whitespace/diff checks pass. Logs: ignored .local/ocean-quarantine/task12a2-review/. No source qualification or internal scientific-history consumption/replay PASS is inferred.
