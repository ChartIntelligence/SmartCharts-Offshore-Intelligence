# Active Historical Temporal-Provenance Qualification v1

Task 12B.7F. Qualification only. **STOP: ACTIVE_HISTORY_REQUIRES_AVAILABILITY_CAPTURE.** Secondary findings: `ACTIVE_HISTORY_TEMPORAL_SUPPORT_UNRESOLVED` and `ACTIVE_HISTORY_REVISION_AUTHORITY_UNRESOLVED`.

The active historical handoff does not establish that Pelora possessed each exact source revision by the target assessment. Nominal dates, row creation times, schema versions and exact digests cannot fill that gap. Existing archive and acquisition contracts provide useful building blocks; their existence does not prove that the active legacy history records carry their authority.

The [machine-readable ledger](Active_Historical_Temporal_Provenance_v1.json) records all 16 consumers, source locations, temporal fields, provenance limitations, arithmetic, metadata candidates, attacks, minimum requirements and protected hashes. No production implementation or new enum is introduced.

## Active scope

The locked inventory remains 16 active, two documentary and nine unwired. Only the 16 active history consumers are qualified here. The two documentary consumers cannot confer scientific as-of eligibility. The nine unwired consumers remain outside active beta qualification; no new policy was authored for them.

| Active consumer | Inputs/purpose after selection |
|---|---|
| buildOceanChangeAnalysis | Explicit previous/current snapshot pair; elapsed time, SST/current/organization changes |
| buildOceanChangeFromTimeSeries | Last two selected records; delegates change arithmetic |
| buildPersistenceEvidence | Historical organization/feature evidence, duration and organization-index change |
| buildSeaSurfaceTemperaturePersistence | SST Fahrenheit endpoints, duration, change and confidence |
| buildCurrentPersistence | Speed/direction endpoints, duration, wrapped heading difference and confidence |
| buildCurrentEdgePersistence | Existing edge facts, strength change and confidence |
| buildCurrentShearPersistence | Existing shear facts, strength/gradient changes and confidence |
| buildCurrentConvergencePersistence | Locked temporal handoff only; no convergence arithmetic or interpretation reopened |
| buildEnvironmentalTransitionPersistence | Existing transition facts, strength/signal-count changes |
| buildSurfaceWaterCharacterPersistence | Existing boundary, temperature, chlorophyll and thermal-range facts |
| buildWaterMassPersistence | Existing readiness/variable-count facts |
| buildMixingZonePersistence | Existing readiness/interaction/signal-count facts |
| buildOceanFrontPersistence | Existing front-strength/signal-count facts |
| buildProductivityPersistence | Chlorophyll-derived classification, concentration and freshness differences |
| buildClarityPersistence | Chlorophyll-derived clarity rank, concentration and freshness differences |
| buildTemporalFeatureContinuity | Inherited feature first/last times and duration |

SST, DIRECT chlorophyll, GAP_FILLED chlorophyll, currents, and their derived feature/signal layers feed this scope. Opportunity decision history is not another environmental family among these 16. No separate raw wind/wave/swell temporal family is added. Feature dependencies retain their own source authority; their labels are not observations.

Most consumers read snapshot metadata `time.observedAt`, falling back to observation `observedAt`. Productivity and clarity prefer their family evidence `values.observedAt`. Change analysis reads observation/intelligence snapshot timestamps; continuity inherits upstream feature windows. None of these reads establishes provider publication or exact revision receipt. Existing schema/producer contract versions do not establish provider revision availability.

For exact historical replay, all consumers must retain the actual-used selected set. For a new historical comparison, admissible observations may be considered only under a future consumer-specific selection contract. The current functions' ability to compute does not decide that selection preference.

## Support and represented time

The final support classification for each active legacy family is **UNKNOWN**, not an inferred instant. Point/envelope `observedAt` supplies a timestamp but not necessarily full information support. Derived feature support depends on its required parents, not merely the feature's first/last detection window.

The bounded NOAA SST archive adapter explicitly uses unknown support, with the reason that nominal L4 time is known but exact support is not established. Its observation time is null. The qualified synthetic SST instant view is a separate, explicit fixture contract; it cannot promote default product timestamps to instant support.

DIRECT and GAP_FILLED chlorophyll remain separate. Daily nominal time does not establish a complete observation/compositing/reconstruction window. No DIRECT/GAP_FILLED equivalence, fill policy or causal window is invented. Current nominal time likewise does not resolve full source support; no convergence metadata interpretation is reopened.

Frame can represent instant, interval, composite-window, forecast-valid interval, static or unknown support. Representation capability is not admission policy. A test preserves a composite with observation time before assessment but support end after assessment. Represented-time comparison alone passes the former and misses the latter. No support clipping or timestamp flattening is allowed by this review.

## Availability candidates and their authority

| Existing field | Classification and limit |
|---|---|
| Point/envelope observedAt; row observed_at | Source represented/nominal assertion only to the extent its product meaning is established; not release time |
| Frame temporal.providerPublishedAt | Nullable provider release assertion; not populated/consumed with demonstrated authority in these active history paths |
| Frame temporal.acquiredAt | Required supplied acquisition assertion, content-digest bound; not independently measured first receipt |
| Raw receipt.completedAt; SST worker accepted.acquiredAt | Exact bytes/candidate-bound acquisition assertion with external trusted clock and retention requirements; not wired into the active legacy handoff |
| Archive receipt.archivedAt | Caller-supplied archive event assertion bound to receipt, not measured commit time or proof of first availability |
| Row created_at or stored_at → storage.storedAt | Operational storage metadata parsed by adapter; no source receipt authority or as-of predicate |
| Snapshot generatedAt | Snapshot construction time, not provider publication |
| Retrieval request.retrievedAt | Operational retrieval context, not first receipt |
| SST/current cache cachedAt | In-memory insertion time from Date.now; TTL/age reporting, not durable exact-revision receipt history |
| Discovery discoveredAt/responseValidator | Discovery-response metadata, not selected product revision/publication authority |
| Frame processedAt | Optional transformation time |
| Pelora publication lifecycle time | Output lifecycle; not source observation/provider availability |
| assessmentAt/cycle.scheduledAt | Explicit target scientific cutoff, never replaced by any of the above |

No authority is inferred merely from a field name. The current active handoff has `PELORA_AVAILABILITY_TIME_NOT_RECORDED` **as a qualified exact-source/revision receipt binding**. This does not claim that all repository timestamps are absent.

The SST worker's existing capability is narrower and useful: a raw receipt binds checksum, byte count, candidate identity and supplied completion time; the normalizer binds Frame acquisition to that receipt. The worker requires external ports to retain exact bytes and the first acquisition receipt, checks durable acknowledgements, and reads the exact archive back. Those ports and clock assertions remain external guarantees. The bounded pilot profile is not silently promoted to an active history resolver. No acquisition was performed here.

An archive plan explicitly returns `VALIDATED_NOT_ARCHIVED`. An archive receipt preserves caller event time and exact content, but the contract explicitly disclaims proving physical commit time. A trusted contemporaneous record could prove possession no later than its event; a timestamp assertion alone cannot. Neither establishes first-ever receipt. Cache insertion can describe that process instance at insertion, but is neither durable history nor necessarily the first acquisition of those bytes.

The repository SQL gives `ocean_snapshots.created_at` a database `now()` default; the normal frontend serializer omits that field. This can describe normal row insertion under trusted execution. It is not an enforced source-acquisition clock: INSERT accepts supplied columns, and no exact provider receipt is added. The schema explicitly permits historical backfill/reprocessed records; `observed_at` may be original trip time and `generated_at` assembly/reconstruction time. These source comments further prohibit elevating every row timestamp to provider observation or availability authority. This is a code/schema finding only, not a database-state or security-defect claim.

## Identity is not availability

`pelora-environmental-evidence-sample-v1` binds frame ID, exact frame digest, component and sample address. It preserves temporal/provenance assertions, but does not authenticate their external truth. Capture v1/v2 preserve exact normalized evidence and references; they do not prove every subsequent temporal operation or missing availability fact.

Frame product version, source record/checksum and lineage, content/frame digests, and nullable archive `sourceRevision` can distinguish content/vintages. Product version may describe a product schema rather than a revision of one observation. None establishes a latest/first/provider-preferred ordering.

Two different exact revisions can have identical represented support. A later-released revision cannot silently replace the original as-used evidence. Active legacy metadata does not prove each revision's availability history: `REVISION_AVAILABILITY_UNRESOLVED`.

The same exact observation can be retrieved or archived again without becoming a new observation. Tests show identical Frame identity with different archive-event intents. Conversely, changing `acquiredAt` inside the Frame changes its exact digest and sample identity; identity does bind that assertion. Neither fact proves a trustworthy availability timeline. A new Pelora publication is not a new environmental observation.

## Actual handoff and adversarial results

The tested chain is actual `retrieveOceanMemoryRows` → `buildOceanMemoryStorageRecordFromRow` → `buildHistoricalSnapshotQuery` → `buildOceanMemoryTimeSeries` → productivity/clarity consumers. Only the source transport response is synthetic. The test injects no replacement selector or simplified temporal consumer. No provider, database, Auth or Supabase service was contacted.

The future represented-row counterexample remains: a later row reaches an available temporal result for an earlier target assessment. This proves conditional contract reachability, not actual stored leakage or provider occurrence.

A new controlled attack gives both rows nominal times before the target and `created_at` after it. The adapter retains the late storage time and the actual selector still admits both rows. This demonstrates absence of a storage-time as-of predicate, not proof that storage time is authoritative first source receipt.

A separate Frame test supplies explicit provider publication and acquisition after the target. The primitive preserves both, and the explicitly synthetic instant SST view still admits based on represented time. That fixture is not a production resolver: the result proves representability and insufficiency of that represented-only view, not a wired production Frame history path.

DIRECT and GAP_FILLED extreme chlorophyll histories independently retain finite endpoints and produce `-Infinity`, available, confidence score 60 through the resolver. They lack complete support, exact revision availability and trusted source-receipt authority. They are **AS_OF_AUTHORITY_UNKNOWN**: arithmetic failure is real conditionally, but eligible production-history reachability is not established. The prior synthetic SST/current subtraction histories remain equally unqualified; their default-provider reachability is not newly established. Arithmetic, classification and clarity-label mismatch are not changed here.

## Minimum proof standard

The proposed phrase “does not require Pelora to assume knowledge” is directionally compatible with governance but too vague without the following facts:

1. Bind the exact source product/revision/content and admissible source facts using existing exact references/checksums and adapter identity where applicable.
2. Establish authoritative complete support compatible with explicit assessmentAt. Unknown support cannot silently become instant.
3. Establish, through trustworthy event/clock provenance, that Pelora possessed those exact bytes/evidence no later than assessmentAt. Bind the witness to the same content/revision. A generic row timestamp does not suffice without that authority.
4. Preserve applicable source/quality requirements. Finite or timely evidence is not automatically admissible science.
5. For as-used replay additionally bind the original selected set and assessment/policy identity. Eligibility does not prove actual use.

A trustworthy possession-by-time witness can suffice; first-ever `firstSeenAt` is not intrinsically required. Provider publication time is useful where authoritative, but earlier public release alone does not prove Pelora possessed the evidence. Conversely, trustworthy earlier receipt can establish possession without knowing the first provider release time. Receipt alone still does not establish support compatibility. Conflicting assertions require review rather than choosing the convenient timestamp.

If required as-of authority cannot be established, evidence must not be used **as though known at that assessment**. Preserve original evidence unchanged as unqualified/documentary where appropriate. Mechanical exact replay of what was recorded remains distinct from qualifying its scientific as-of admissibility. No deletion, guessed backfill or new enum is required.

For all five active family groupings, current coverage is: represented support **PARTIAL**, qualified availability time **MISSING**, revision identity **PARTIAL**, and governed exact source identity **PARTIAL**. Snapshot identity/schema versions are real, but do not automatically bind all provider evidence. The detailed family ledger separates these limitations from richer archive/primitive capabilities.

## Minimum future metadata and compatibility

Result: **REFERENCE_METADATA_REQUIRED**. Review a provenance reference/manifest that binds existing acquiredAt/completedAt-style trusted receipt evidence to exact source/capture revision identity, support authority, clock/event semantics and assessment selected-set identity. Preserve providerPublishedAt only when known and authoritative; preserve explicit unknown otherwise. Do not fabricate firstSeenAt, support bounds or provider revision ordering.

An exact numeric capture successor is not inherently required. Existing captures can remain immutable while separately bound reference metadata supplies historical authority. Whether the current reference envelope can bind the necessary manifest needs explicit contract review; a successor is warranted only for a demonstrated incompatibility. No metadata or capture implementation is made here.

Legacy rows are **AS_OF_AUTHORITY_UNKNOWN** by default where required proof is absent. A row may be **PARTIALLY_QUALIFIABLE** when represented time/content is known but support/receipt authority is missing. **AS_OF_QUALIFIABLE** requires independent full proof; this task newly qualifies no stored production record. Existing records and IDs remain unchanged.

Future enforcement belongs at the consumer-aware historical admission boundary, with retrieval as a coarse filter and adapters preserving/validating facts. Derived consumers still need finite-result admission. This is not a universal selector, retention horizon, lookback, gap/outage policy or revision preference.

Nightly learning must distinguish as-used evaluation from retrospective analysis before pairing captain logs with environmental evidence. Later evidence cannot silently rewrite knowledge available at an earlier assessment. No nightly implementation is performed. Four-hour publication cadence remains separate from observation, provider release, acquisition and scientific assessment, even if timestamps sometimes coincide. No private captain fields are added to shared Ocean authority.

## Next gate and preserved boundaries

**EXACT HISTORICAL AVAILABILITY-REFERENCE CONTRACT REVIEW**: define the trustworthy receipt-to-exact-revision/support binding, clock/event authority and explicit unknown handling. Then resume consumer-aware selection qualification, temporal derived-finiteness, and cross-route normalization review. No implementation yet.

Current-vector failure locality and chlorophyll temporal diagnostic boundaries remain qualified. Tasks 12B.6C and 9E-D remain paused. Convergence/Ocean Physics are untouched and separately paused; NOAA SME clarification remains pending. Numeric-string compatibility, provider-fill qualification and legacy SST coordinate fallback remain open.

## Verification

The focused suite has 13 passing tests. Final regression, syntax, JSON and preservation results are recorded below and in the JSON. All pre-existing untracked artifacts are protected; only the four new task files are additions. No production change, environmental acquisition, service/database access, staging, commit, tag, push or deployment is authorized or performed.

Final verification: all 78 executed backend/shared regression scripts passed with network blocked, including new 13, prior assessment-cutoff 17, consumer-history 7, chlorophyll temporal 19 and temporal primitives 100. Exact capture, prior normalization, Frame/archive/scalar, publication V3, Opportunity/governance, Task 11E and related history/fishing-log diagnostics are recorded by script in the JSON. No dedicated nightly runtime qualification is claimed. Existing quarantined `candidateSemanticProjectionV3.test.js` was excluded from execution and remained preserved and syntax-checked. All 149 JavaScript syntax checks and 146 repository JSON parses passed; whitespace, reference hashes and `git diff --check` passed. All 131 prior untracked artifacts remain byte-identical. Only four new files were added: 135 untracked total, no tracked or staged changes. Branch and HEAD remain as requested. No production implementation, historical rewrite, service access, environmental acquisition, staging, commit, tag, push or deployment occurred.
