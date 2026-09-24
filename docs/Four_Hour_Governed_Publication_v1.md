# Four-Hour Governed Publication Foundation v1

Status: repository-only foundation, synthetic tests, no runtime migration. Task 12A.

Contracts: `pelora-governed-ocean-publication-v1` and
`pelora-ocean-publication-worker-v1`.

## Current architecture audit

Audited at `aac0adfd57f5a39d32ca7c758308549585be7bef`. No existing scientific,
server, persistence or frontend file is changed by this task.

The current request path is not already a scheduled publication engine:

1. `buildUnifiedOpportunityCandidateSourceUniverseV1` assembles normalized,
   deduplicated stable candidate identities from governed open-water, location
   and physical-structure sources.
2. `evaluateControlledGulfBlueMarlinV1` applies
   `filterUnifiedOpportunityCandidatesByCaptainContextV1`, then
   `evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1`. Captain range
   filtering therefore precedes habitat eligibility in the current flow.
3. It filters eligible candidates and applies a context-dependent evaluation
   selection/cap: `selectCaptainRangeStableGulfCandidatesV1` for within-range
   and `selectDistributedGulfCandidatesV1` for Entire Gulf. This is not the
   final species ranking, but can discard candidates before expensive analysis.
4. `evaluateGulfCandidatesV1` invokes
   `evaluateUnifiedPhysicalStructureOceanConditionsV1` or
   `evaluateUnifiedOpenWaterOceanConditionsV1`. These invoke `getOceanConditions`;
   provider acquisition and environmental interpretation are currently coupled.
5. `buildUnifiedSpeciesOpportunityInterpretationV1` supplies the governed species
   opportunity and negative-conclusion adequacy. Bathymetric/spatial evidence,
   species habitat eligibility and the Minimum Opportunity Evidence Gate remain
   in the existing logic; Task 12A introduces none of these rules.
6. `resolveUnifiedOpportunityRankingInputV1` requires an available interpretation,
   available species opportunity, `eligibility.eligibleForRanking === true` and
   finite governed score. `rankUnifiedSpeciesOpportunitiesV1` invokes the existing
   species ranking. Only Blue Marlin has that governed pathway today.
7. `buildUnifiedOpportunityIntelligenceV1`, ranked presentation and
   `buildUnifiedCaptainOpportunityDeliveryV1` build the request's explanatory and
   captain-facing result. Shared publication eligibility is not a final captain rank.
8. `getDynamicBlueMarlinOpportunities` also resolves authenticated context,
   captures governed observations/history and consults historical fallback.
   `buildGovernedOpportunityObservationV1` and historical records can contain
   captain context. They must not be copied wholesale into shared publications.

Existing continuity, evidence accumulation/coherence, persistence, multiday
persistence and trend contracts remain authoritative. They operate over
chronological observations and stable candidate/species identities. A new cycle
must not create a new Opportunity identity where those contracts establish
continuity. The new shell preserves supplied Opportunity IDs and immutable
continuity references; it does not run or replace continuity science.

`useDynamicOpportunities` runs a request effect when species/context changes;
app mounting can initiate that request. `/api/ocean` still serves request-driven
environmental evaluation. `/api/ocean/field` remains the separate current,
bathymetry and explicitly injected scalar delivery boundary. MapLibre field
hooks use viewport requests; they do not maintain Ocean State. Ocean Memory
snapshot assembly, `useOceanMemoryPersistence`, authenticated historical storage
and backend request caches are not shared four-hour publications. No existing
four-hour background publication scheduler was found. Task 11E's SST worker is
an isolated foundation and remains unchanged.

| Responsibility | Current boundary | Task 12A boundary |
| --- | --- | --- |
| Provider acquisition | `getOceanConditions`, provider adapters; isolated SST worker | Excluded entirely |
| Environmental interpretation | Candidate ocean evaluation and existing governed evidence analyses | Trusted evaluator over verified frozen captures only |
| Opportunity eligibility | Habitat eligibility, evidence gate, species interpretation | Preserve existing evaluations; call existing ranking-input gate |
| Ranking | Existing species ranking, context-selected candidate cohort | Deferred captain projection; no global Top-N |
| Captain projection | Origin/range/species/mission and contextual cohort selection | Separate future read-side adapter |
| Presentation | Ranked presentation, Dashboard/MapLibre | Unchanged |

## Three timescales and integration boundary

Continuous observe maintains immutable qualified environmental evidence without
app launch, login, map movement or requests. Four-hour governed analysis/publish
consumes that evidence. Nightly learn/audit references immutable history separately.
No acquisition or learning operation exists in this publication worker.

This foundation does **not** call the current request wrapper as a scheduled job.
That would mix acquisition and authenticated history into shared execution.
Before runtime migration, a reviewed science adapter must evaluate retained
environmental evidence across the complete declared candidate universe, independent
of private captain context. It must preserve all existing scientific inputs,
eligibility order, continuity and ranking semantics. If equivalence cannot be
established, integration must stop rather than reorder science.

The shell and test ports establish orchestration and identity, not a qualified
production shared-evaluation adapter. The only reused server function is the
existing pure ranking-input resolver. Importing it does not invoke the request
wrapper or listen on a port. No server/startup file imports this worker.

## Cycle, evidence and publication identity

`cycleV1` accepts only explicit UTC 00/04/08/12/16/20-hour boundaries. No clock,
random ID, provider publication time or local timezone chooses a cycle.
The cycle hash includes contract version, scheduled UTC time, region ID/version,
analysis configuration ID/version/governance reference, evaluator version,
candidate-universe configuration version, configured families and configured
species. The returned evaluator version must match the configured version.
The governance reference must identify the registered interpretation rules; this
shell cannot certify the contents of an opaque registry reference. Region is opaque;
the contract contains no Gulf geometry.

The candidate-universe reference and complete candidate-ID list are frozen cycle
content. Changing that capture under the same schedule/configuration is a conflict,
not a newly independent cycle. IDs are sorted; no Top-N is applied. The latest
pointer namespace is region/configuration-specific, not candidate-list-specific.

`freezeEvidenceV1` requires one explicit entry for every configured family:
AVAILABLE, STALE, UNAVAILABLE or ERROR, with reason; product/provider/class;
represented time and support; qualification and admissibility policy/status;
cycle-time assessment and age; exact reference; quality and lineage references.
Families may have different policies. STALE does not itself grant or forbid
admissibility; the registered family policy supplies that assessment. No family
inherits SST thresholds. SST's unresolved admission cannot be represented as
ADMISSIBLE merely because it is scientifically valid. Missing families do not
implicitly abort evaluation or become available.

Archive references contain archive ID, frame ID, receipt digest and scientific
content digest. The archive-ID/frame relationship is checked. Captured evidence
without the archive contract uses an opaque immutable capture ID, contract version
and SHA-256. Neither permits provider URLs, storage locators or `latest` pointers
as scientific identity. Registered evidence verification must resolve exact retained
objects, verify their digests/metadata and family admission at the cycle cutoff.
The shell cannot independently establish scientific truth from a claimed digest.

All evidence assessment times equal the scheduled cycle cutoff. Execution start,
end and later read assessment are separate. Evidence must not be future-dated at
that cutoff; age must equal the exact nonnegative difference. Static/unknown-time
evidence may retain null represented time and null age. No timestamp is fabricated.
Provider publication time is not inferred. A product-specific capture preserves
additional exact provenance and temporal semantics through its immutable reference.

Frozen entries are detached/deeply immutable and deterministically hashed. Later
provider updates cannot change them. The verifier must attest the exact evidence
set ID. It also must verify candidate-universe and evaluation captures and their
governance/version binding through the trusted adapter; arbitrary client callbacks
are not an authority boundary.

A completed publication contains the cycle, evidence set and references, every
candidate/species result including exclusions and gate reasons, Opportunity and
continuity references, signal references, evaluator version, lineage, attempt ID,
actual start/end, COMPLETED status, scientific content digest and full integrity
digest. Exact immutable evaluation captures retain the full governed result needed
for later projection; private context is not stored in this shell. This is a
reference-bearing result contract, not a new scoring schema.

The worker computes gate results using `resolveUnifiedOpportunityRankingInputV1`;
an input score alone never grants permission. Direct contract/writer calls validate
structure and integrity, not scientific authenticity. Those ports must remain
trusted server-side boundaries, never endpoints for client-asserted gate results.

All configured candidate/species pairs are required, including excluded candidates.
Zero eligible Opportunities is a valid completed result; Ocean Signals remain
separate. COMPLETED describes worker completion, not a scientifically adequate
negative conclusion or complete family coverage. Existing negative-conclusion
adequacy/evaluation-state contracts must still distinguish unavailable evidence,
partial evaluation and governed zero in later captain projection. No rank is
assigned by the publication shell. Supported-species configuration
is explicit: today exactly Blue Marlin. Empty and duplicate species configurations
fail closed rather than producing vacuously complete results. Yellowfin, Blackfin,
Mahi, Sailfish, White Marlin and Wahoo remain intended future directions, rejected
until existing governed pathways support them. This does not invent species science.

`publicationId` is derived from the cycle ID. Scientific `contentDigest` excludes
execution attempt/time but includes all governed frozen content. `integrityDigest`
also binds execution metadata. Same content retried accepts the original complete
record, including its original attempt times. JSON object-key order is irrelevant;
ordered evidence lists remain ordered. Finite JSON numbers only; JSON's zero/-zero
equivalence is serialization behavior, not a new scientific interpretation. Exact
shape validation rejects private/unknown fields, accessors, sparse arrays and cycles.
Opaque references still require upstream governance; this is not a sensitive-text detector.
Dedicated captain/account/mission context in an evaluator interpretation is rejected
recursively, rather than silently stripped from an already context-influenced result.

## Worker and storage ports

`runPublicationCycleV1` accepts explicit cycle, attempt ID, start and assessment
times. Dependencies must be own data-property functions, supplied by trusted server
composition. It returns status, last completed publication verified at iteration
start and its age at the new assessment, current accepted publication if any, stage
and reconciliation flag. A failed CAS can coexist with a durable new publication;
it does not mean the latest pointer advanced. Errors do not expose exception text.

Sequence: verify previous pointer/readback; inspect exact cycle object; claim if
unaccepted; collect and freeze evidence; verify evidence; evaluate; validate;
conditional write; exact durable readback; monotonic pointer CAS; durable pointer
readback; report. Accepted-cycle retries reuse the accepted evaluation after exact
cycle/evidence comparison, then may reconcile a missing pointer.

| Port | Required obligation |
| --- | --- |
| `collectEvidence(cycle)` | Read retained captures only, return all family entries at explicit cutoff; no acquisition |
| `verifyEvidence(evidence)` | Verify exact registered retained evidence/metadata/admission; return VERIFIED plus exact set ID |
| `evaluate({cycle,evidence})` | Existing governed science over the complete universe, immutable captures, no provider/private context |
| `finishedAt()` | Explicit actual UTC completion time; never supplies evidence time |
| `claim({cycleId,attemptId})` | Atomic external cycle claim, return matching ACQUIRED or HELD; no automatic takeover |
| `createIfAbsent(id,record)` | Atomic immutable creation; CREATED/EXISTS, durable acknowledgement and exact accepted record |
| `readExact(id)` | FOUND + durable + exact record, or NOT_FOUND; digest validation mandatory |
| `readLatest(key)` | Versioned exact pointer snapshot, or explicit null target |
| `compareAndSet({key,expected,target})` | Atomically compare full prior snapshot/version; ADVANCED durable new snapshot or CONFLICT |

The test Map simulates these acknowledgements. It is not durable storage or a
distributed lock/CAS. No production store, acquisition ledger, scheduler, leases,
automatic retry or coordination implementation is supplied. External implementations
must enforce atomicity; `durable: true` cannot turn process memory into durable storage.

CREATED acknowledgements must match the submitted full record, including execution
metadata. Only EXISTS may return the original accepted attempt for identical content.
Idempotent writes compare content, preserve the originally accepted attempt and
verify exact durable readback. Different accepted evidence/configuration under one
cycle returns SAME_CYCLE_EVIDENCE_CONFLICT or SAME_CYCLE_CONFIGURATION_CONFLICT.
Different completed content at conditional write returns PUBLICATION_CONFLICT.
An unaccepted held cycle returns CLAIM_HELD_RECONCILIATION_REQUIRED: retry-before-
acceptance must reconcile the frozen set rather than silently select newer evidence.
There is no automatic revision winner.

The latest pointer must match exact publication/cycle/content/integrity/time and
namespace. An older target cannot replace a newer one. A matching target no-ops;
an external CAS race returns POINTER_CONFLICT. False, malformed or mismatched
acknowledgements/readbacks never report successful completion. Failure retains the
previous verified record and increasing age; if the prior pointer cannot be verified,
the report does not invent its existence. Reads reject an assessment earlier than
the recorded evaluation end. The report uses the detached normalized assessment
time, not the caller's mutable input object. Previous means verified at iteration start,
not a claim that no other worker has since advanced external state.

## Crash reconciliation

| Window | Required reconciliation, not implemented automatically |
| --- | --- |
| After/during claim | Claim may remain or outcome may be uncertain; inspect durable ledger, no expiry/takeover assumption |
| After evidence freeze | Recover the exact set and universe; never choose whatever is latest now |
| During evaluation | Reconcile frozen captures and evaluator/config version before repeating |
| After evaluation, before write | Revalidate preserved result; conditional create only |
| After write, before durable readback | Read exact object and validate content/integrity; no pointer success yet |
| After durable publication, before CAS | Exact accepted retry can attempt CAS; original execution/evidence remains unchanged |
| During CAS | External result may be uncertain; reconcile pointer version/target and durable publication |

`stage` reports the current external operation group, not a transactional journal.
WRITE includes the writer's first durable readback; READBACK is the worker's final
exact check before pointer use. Exceptions return CYCLE_FAILED with stage, never
implicit rollback. Claim, freeze/evaluation, write/readback and CAS recovery remain
infrastructure gates. No process-local idempotency claim substitutes for them.

## Captain read path and scientific ordering

Future path: app launch -> `readLatestPublicationV1` -> verified immutable shared
publication/captures -> captain projection -> Today/Map/Intelligence. The reader
only reads and verifies; it does not evaluate or acquire. The current UI is not wired.

Projection must preserve current origin, optional GPS, Entire Gulf/numeric-NM range,
species and remembered mission semantics. None belongs in shared publication. Range
filtering over shared geographic candidates is cheap; it does not authorize moving
eligibility, contextual selection or species ranking ahead of their current order.
Keep the complete candidate universe and exact pre-context evaluation captures,
then apply the current range -> species eligibility -> context-specific cohort
selection -> governed interpretation/ranking/delivery semantics using those captures.
Proving this substitution produces equivalent results is a later integration gate.
Do not globally rank Top 12 and then range-filter: nearby candidates may have been lost.
No captain projection implementation, new rank policy or historical comparison UI
is added here.

Publication identity and Opportunity identity are separate. Later cycles can retain
the same governed Opportunity/continuity references. Historical publication and
evaluation captures cannot be mutated by later rank changes, provider revisions,
app requests or nightly learning. Historical context/private observations remain
separately governed rather than copied into shared data.

## Family freshness and SST reuse

00Z, 04Z and 08Z may reference the same exact SST archive receipt. Their publication
IDs and assessment ages differ; source represented time does not. No acquisition
port exists in this worker. Real NOAA operational qualification remains NOT
ESTABLISHED and SST freshness remains THRESHOLD_DECISION_REQUIRED; tests use explicit
synthetic-only admissibility, never a real freshness threshold.

Chlorophyll can later retain its separate direct-preferred/gap-filled 72-hour
governance, older direct stale, older gap-filled lower-priority stale and unavailable
states through its own policy/capture. This task neither executes nor changes that
selector. Current, wind, waves, swell, bathymetry, moon and altimetry likewise retain
their own validity/admissibility and support semantics. No universal age rule exists.

SST presentation remains complete-frame outward-rounded whole-F zero-clipping,
independent of viewport; multi-frame comparison needs a shared absolute domain.
Absolute and relative thermal structure have no universal fishing value. No display
pixels, color, species thresholds or warm/cool score enters this worker. Scientific
consumers use governed numeric evidence, never raster pixels.

## Verification and limits

Focused offline tests cover cycle identity, evidence freeze, receipt reuse through
the actual archive contract, incomplete families, zero Opportunities, existing gate,
complete-universe enforcement, privacy, immutability, idempotency/conflicts, claims,
durable writer/readback, CAS races, old-publication preservation, crash boundaries
and app/acquisition independence. Full backend/shared regressions are required.

The synthetic 1,000-candidate fixture measured approximately 681 KB canonical
publication JSON, 0.59 seconds for the test worker including repeated validation/
cloning/readbacks, and 10 ms serialization on this desktop. This is neither a
production budget nor mobile acceptance. Scientific evaluation, actual external
storage and captain projection were not benchmarked. Exact full evaluation captures
are referenced rather than duplicated; their sizes/read costs are additional.

No provider, database/Auth/Supabase access, scheduler deployment, dependency change,
frontend integration or production storage selection is part of Task 12A. Task 9E-D
remains paused. New work stays uncommitted for review.

## Final adversarial review

Six defects were reproduced against the original uncommitted implementation:

1. Empty species scope could complete vacuously. It now fails closed; only the
   currently governed Blue Marlin pathway is accepted.
2. Evaluator version was not pinned in cycle configuration. It is now explicitly
   bound and checked; candidate-universe configuration version is also explicit in
   cycle identity. The frozen universe capture remains content, so a changed capture
   under the same configuration/cycle still conflicts. Interpretation rules remain
   bound through the registered governance reference and evaluator version.
3. Failure reporting read the caller's mutable assessment-time property. Reports
   now retain the detached, normalized timestamp used to calculate the age.
4. Evaluator interpretations could carry captain context that was silently stripped.
   Dedicated private/context fields now fail closed before publication construction.
5. A CREATED acknowledgement could substitute another execution attempt while
   retaining the scientific content digest. CREATED must now match the full submitted
   record. EXISTS retains the intended original-attempt idempotency semantics.
6. Latest reads could report completion at an assessment time before evaluation ended.
   Such reads now fail closed without unverified fallback or regeneration.

The 57 focused tests include all six reproductions plus cadence/version/region
attacks, candidate omission/duplication, score-only admission, low eligible score,
partial-family states, private/unknown fields, changed scientific content, corrupt
durability/readback, newer-cycle CAS races, uncertain writes/CAS, leap-day age math,
immutable nested records, receipt reuse and pathological sparse input. Regressions
run with network calls blocked. No freshness threshold or science rule was changed.

Completeness is exact set accounting: declared candidates times configured species
equals admitted results plus explicit gate-excluded/unavailable results, with no
duplicate pair. Failed malformed evaluation cannot become COMPLETED. This proves
the complete **declared** universe, not the upstream completeness or independence
of that declaration. Registered universe/evaluator qualification remains essential;
the existing request-driven context-filtered path is not a qualified source for it.

`publicationId` is the immutable cycle object key, not sufficient scientific identity
alone. Exact identity includes `contentDigest` and `integrityDigest`. Meaningful
changes under that key conflict rather than overwriting. Changing a governed config
version defines a different cycle identity/namespace, not an unlabelled retry.
Execution-only retries keep the original scientific digest and accepted record.

Zero eligible results retain their reasons: adequate scientific exclusion is not
interchangeable with insufficient/unavailable evidence. Unsupported species reject
the cycle rather than becoming a zero-Opportunity scientific conclusion. No shared
rank numbers are produced. Future captain projection and nightly learning must only
read these immutable records; neither may rewrite them.

The earlier 680,831-byte / approximately 581-ms / 9.5-ms diagnostic remains historical,
not a limit or SLA. Explicit version fields and strict acknowledgement validation add
small payload/work differences. Sparse billions-length arrays and oversized opaque
IDs fail validation; this is not general production resource budgeting. Future
captain delivery must project a bounded response rather than blindly ship the full
shared publication. Production memory, storage, ledger, coordination, scheduler,
read-delivery budgets and physical-device qualification remain unestablished.
