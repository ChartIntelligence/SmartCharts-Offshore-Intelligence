# Historical Environmental Assessment-Cutoff Contract v1

Task 12B.7F. Qualification only; uncommitted. Expected branch `codex/pelora-remote-setup`, HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`.

**STOP: ASSESSMENT_CUTOFF_REQUIRES_AVAILABILITY_METADATA.** Secondary: `ASSESSMENT_CUTOFF_TEMPORAL_AUTHORITY_UNRESOLVED`. The necessary no-future rules below are supported, but the complete active-product admission contract is not qualified. A timestamp comparison cannot supply missing product support, exact revision availability, or actual-used selection identity.

The [machine-readable report](Historical_Assessment_Cutoff_Contract_v1.json) contains the complete 16-consumer ledger, source locations, handoff, test evidence, contract review matrix, and preservation hashes. Its assertions distinguish proposed requirements from current enforcement. No runtime policy is implemented.

## Active handoff and consumer inventory

The current chain is historical source rows → `retrieveOceanMemoryRows` → `buildOceanMemoryStorageRecordFromRow` → `buildHistoricalSnapshotQuery` → `buildOceanMemoryTimeSeries` → change/persistence consumers. The request already has an assessment context, but this environmental-history branch does not pass `assessmentAt` or the retrieval helper's optional `observedBefore` bound.

The following 16 active consumers reconcile with the prior diagnostic. “Envelope” means snapshot metadata `time.observedAt`, falling back to observation `observedAt`. The JSON records each retrieval/adapter/selector/consumer relationship and downstream use.

| Consumer | Current temporal authority read |
|---|---|
| buildOceanChangeAnalysis | Previous/current observation timestamp, otherwise intelligence timestamp |
| buildOceanChangeFromTimeSeries | Last two selected snapshot payloads; downstream timestamp helper |
| buildPersistenceEvidence | Envelope |
| buildSeaSurfaceTemperaturePersistence | Envelope |
| buildCurrentPersistence | Envelope |
| buildCurrentEdgePersistence | Envelope |
| buildCurrentShearPersistence | Envelope |
| buildCurrentConvergencePersistence | Envelope; time plumbing only, interpretation quarantined |
| buildEnvironmentalTransitionPersistence | Envelope |
| buildSurfaceWaterCharacterPersistence | Envelope |
| buildWaterMassPersistence | Envelope |
| buildMixingZonePersistence | Envelope |
| buildOceanFrontPersistence | Envelope |
| buildProductivityPersistence | Family evidence observedAt when a string, otherwise envelope |
| buildClarityPersistence | Family evidence observedAt when a string, otherwise envelope |
| buildTemporalFeatureContinuity | Feature persistence firstObservedAt, lastObservedAt, durationHours |

The two documentary consumers remain `buildOceanEvolution` and `buildTemporalOceanExplainability`. Later documentary context must not become input to an earlier scientific replay. Exact original narrative remains unchanged; retrospective annotations require separate identity.

The nine unwired consumers remain outside qualification: governed Opportunity evidence accumulation, continuity, evidence coherence, persistence, multi-day persistence intelligence, trend evidence, trend resolution, governed feature association, and governed feature movement. Their exact function names remain in the JSON. No new policy was authored for them.

## Temporal authorities and necessary contract

Observation time identifies a provider event only when its meaning is authoritative. Represented time describes attributed evidence time. Support start/end describe an interval or composite's information support. A nominal product time may merely label an analysis. Publication time concerns availability of an exact product revision. Retrieval and archive/capture times concern operational receipt and preservation. Assessment time is the explicit scientific target. None may silently substitute for another.

Three obligations are separate:

1. Evidence must not represent information after the assessment.
2. The exact product revision must have adequate known-as-of availability authority for an as-used claim.
3. Replay must bind the exact actually-used selected evidence. Merely being eligible does not establish that evidence was used.

For authoritative instant support, time before or exactly equal to assessment passes the represented-time bound. After assessment fails, including one millisecond after; no tolerance is invented. Existing scientific-age validation enforces this relationship.

For a complete authoritative interval, support end at or before assessment is necessary. A straddling interval or entirely future support cannot be clipped or relabeled as an instant. This necessary condition is not a complete active-product policy: nominal timestamps and generic support fields do not establish all observation, reconstruction, or analysis inputs.

Composite and gap-filled products require their own contributor/support/causal-window and exact-vintage availability authority. DIRECT and GAP_FILLED chlorophyll remain distinct. No equivalence or fill policy is established. Static context does not create repeated observations or an elapsed observation span; exact as-used map/model vintage still matters.

| Case | Earlier as-used assessment | Retrospective use |
|---|---|---|
| Represented and available before assessment | Potentially eligible, subject to all other requirements and actual-used identity | Separate selection may consider it |
| Represented before, available only after | Cannot be inserted as knowledge available at the earlier assessment | May be considered only under explicit retrospective authority |
| Represented after assessment | Excluded | May be labeled later/outcome context, never backdated evidence |
| Later revision for earlier support | Must not replace the bound original; creates no elapsed observation time | Requires separately governed revision analysis |

Later retrieval does not prove that a product first became available later, nor does it prove earlier knowledge. Publication availability by itself also does not identify the actual-used selected set. No publication timestamp is fabricated.

## What current schemas establish

Ocean Product Frame preserves support kinds and bounds, observation time, nullable provider publication time, acquisition time, and provenance. It is structural representation, not consumer-specific as-of admission. Tests preserve before/equal/straddling/future intervals and composites through this boundary.

Existing publication evidence freezing checks representedAt against assessedAt. A controlled test also accepts a straddling interval/composite when representedAt equals assessment and supplied qualification flags pass. This demonstrates that the structural guard alone does not enforce full support cutoff. It is not evidence of an actual bad publication or a provider defect.

Current capture v1/v2 preserve normalized endpoint values, source metadata and observedAt. They do not supply provider publication availability or authoritative support intervals. An opaque lineage reference could bind other evidence, but no availability resolver is established by the capture schema. No capture successor is justified merely by this diagnostic.

Legacy generated/stored/retrieved timestamps cannot replace missing temporal authority. Older records may be `QUALIFIABLE_FOR_REPRESENTED_TIME_ONLY` where support is established. Where availability/support is unproven, they remain unqualified for scientific as-of admission. Mechanical exact replay remains possible and must preserve the original. Retrospective use is not automatically qualified either.

## Family consequences

SST's existing qualified synthetic temporal view is instant-only: at least two chronological observations, positive represented span, missing filtered, exact identity and competing-revision checks, and no future represented times. This does not authorize interpreting every legacy product envelope as instant support. No lookback is selected.

DIRECT and GAP_FILLED chlorophyll persistence read family evidence time preferentially. Their nominal dates do not prove complete support or exact revision availability. Their independent temporal subtraction defects and the separately documented clarity-label mismatch remain unchanged.

Current history uses envelope times with required speed/direction for its persistence consumer. Component identity and represented time remain distinct from cache refresh. Current-vector failure locality stays qualified. No convergence meaning is inspected or qualified.

Feature/signal results inherit temporal dependencies from their required observations. Labels alone do not establish continuity or identity. The active continuity consumer reads its upstream feature persistence window; unwired association/movement policies remain unwired.

Opportunity decision history is a separate authority. Publication V3 rejects a decision evaluated after its as-of assessment; the test also accepts the equal-time control. Existing private decision fallback supplies an evaluation cutoff. Rank is not environmental identity. No ranking amendment follows.

## Faithful counterexamples and cutoff limits

The focused suite supplies synthetic source rows through actual retrieval, adapter, selection, time-series and persistence code. A September 24 row survives a September 23 noon target and contributes to an available result. This is conditional contract reachability only: no provider occurrence, stored production leakage, database defect, or live acquisition is established.

A second attack keeps both row envelopes before the target but supplies a later productivity leaf timestamp. The actual adapter and selector admit it and the productivity consumer uses that future leaf. This is a deliberately inconsistent synthetic row, not a claim about stored corruption. It shows why an envelope-only retrieval filter is insufficient.

Both DIRECT and GAP_FILLED finite extreme endpoints precede the candidate represented-time cutoff yet still produce `-Infinity` through unchanged temporal arithmetic. Therefore the represented-only classification is `STILL_REACHABLE_AFTER_CUTOFF`; full as-of eligibility is `DEPENDS_ON_UNRESOLVED_POLICY`. A correct time bound does not repair arithmetic. Failed temporal facts and dependent results must fail closed, including removal of contradictory invalid numeric fields; source observations remain preserved.

Previously demonstrated low-level SST/current subtraction failures also survive the represented-only bound. Their default-production reachability remains unestablished. In particular, synthetic negative current speed is not default magnitude output. These controls must not be promoted into production defects.

## Enforcement responsibilities, replay and context

Retrieval filtering can reduce candidates but cannot own revision, support, causal-window or exact-as-used semantics. Adapters must preserve and validate temporal fact consistency without inventing missing authority. Consumer-aware selection must receive explicit validated assessmentAt and enforce the appropriate evidence-class requirements. Temporal primitives preserve facts and identities; consumers must independently validate required inputs and finite derived results. Non-database replay and frozen captures need the same semantic authority.

Missing or invalid assessment context must fail at the existing strict scientific boundary, or produce no qualified selection where an existing result contract supports that outcome. It must never silently use wall clock. This document does not introduce a new enum or selector API. The outer request may capture time once; internal selection must use that immutable context.

Task 12B.1 already captures one request assessment. Scheduled publication derives its explicit context from cycle.scheduledAt and supplies it to scientific history collection/evaluation. The environmental-history handoff loses the existing context; the clock source itself does not require redesign.

Fixed explicit context is unaffected by later execution time in the focused tests. Full replay determinism additionally requires the frozen exact selected references, assessment and selection/evaluator policy identity. Re-running a live query later is not equivalent. Later revisions or newly discovered older rows cannot silently enter as-used replay.

Nightly learning/audit may inspect later evidence under separately declared retrospective authority. It must not rewrite original as-used assessments. Four-hour publication cadence must not multiply observations. Shared cutoff rules do not import captain/private identity; existing private workflows retain their own boundaries.

## Review/versioning and next gate

Consumer-specific selector contracts and evaluator/configuration identity require review when cutoff becomes mandatory. Temporal primitive schemas already represent multiple support kinds but do not qualify admission; no automatic primitive successor is required. Capture schemas preserve source truth and are not expanded by this task. Candidate reconstruction, exact history references, archive/replay and publication bindings must preserve selected-set identity and policy interpretation. Direct duplication of a new label across every object is not justified. Any missing metadata extension/reference requires separate design review. Historical records remain immutable.

Blocking items are authoritative support/causal-window definitions for active products, exact revision availability evidence or explicit unknown status, exact as-used selection binding, and consumer-specific same-support revision handling. These prevent full cutoff qualification; they are not resolved by a universal SQL timestamp or lookback rule.

**Next gate: ACTIVE HISTORICAL TEMPORAL-PROVENANCE QUALIFICATION.** Identify authoritative support and exact revision availability evidence for each active payload, and define exact as-used reference/selection binding. Then return to consumer-aware history selection, temporal-derived finiteness, and cross-route normalization review, in that order. No implementation is authorized by this report.

Lookback, retention and gap/outage policy remain separate. Numeric-string compatibility, provider-fill qualification and legacy SST coordinate fallback remain OPEN. Current-vector failure locality and chlorophyll temporal diagnostic qualification remain unchanged. Tasks 12B.6C and 9E-D remain PAUSED; convergence/Ocean Physics remain untouched and NOAA SME clarification remains pending externally.

## Verification and preservation

Verification results are finalized below and in the JSON after the network-blocked regression run. Only the four task artifacts are additions. No provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment occurred.

Final verification: 17 focused tests passed; all 77 executed backend/shared regression scripts passed under the existing network blocker. Consumer-aware STOP: 7; chlorophyll temporal: 19; temporal primitives: 100. The existing quarantined `candidateSemanticProjectionV3.test.js` was not executed; it remained preserved and syntax-checked. Capture, archive/publication, Opportunity/governance, historical selection and Task 11E coverage is recorded by exact script in the JSON. All 147 JavaScript syntax checks and all 145 repository JSON parses passed. Four new files passed whitespace checks; `git diff --check` passed. The 127 protected files have identical before/after SHA-256 hashes. Tracked and staged diffs are empty; branch and HEAD match; 131 untracked files comprise 127 protected plus these four additions. No production change or prohibited access/action occurred.
