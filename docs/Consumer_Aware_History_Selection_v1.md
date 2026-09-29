# Consumer-Aware Historical Payload Resolution & Selection Qualification v1

Task 12B.7F. **STOP — CONSUMER_AWARE_HISTORY_POLICY_REQUIRED**.

Exact blocker: **ASSESSMENT_CUTOFF_NOT_ENFORCED_AT_PRODUCTION_HISTORY_BOUNDARY**. Section 26 requires stopping qualification when future evidence can enter. This review therefore does not claim CONSUMER_AWARE_HISTORY_SELECTION_QUALIFIED or complete arithmetic/policy qualification for every active consumer.

HEAD c0d97f1f1281e99898b908af8dd9c8e1f81056d1; branch codex/pelora-remote-setup. No runtime, source normalization, storage, formula, capture or selector changes. Full evidence, 27-row requirements ledger, caller/source anchors and preservation hashes are in [the JSON report](Consumer_Aware_History_Selection_v1.json).

## Demonstrated cutoff failure

The default getOceanConditionsAtAssessment history handoff calls retrieveOceanMemoryRows with configured retrieval, normalized bearer token, latitude/longitude and maximumRows=48. It passes neither assessmentAt nor observedBefore. The subsequent buildHistoricalSnapshotQuery and buildOceanMemoryTimeSeries calls also receive no cutoff. This is verified against current source, not inferred from the low-level persistence interface alone.

The new test supplies synthetic historical source rows through the **same production transport/resolver/selection contracts**. The response contains observations at 2026-09-23T00:00:00Z and 2026-09-24T00:00:00Z, originally normalized under 2026-09-24T01:00:00Z. With a target assessment cutoff of 2026-09-23T12:00:00Z, the later observation survives row adaptation, history selection and time-series assembly. Productivity and clarity remain available. The generated retrieval URL uses order=observed_at.asc and limit=48 with no observed_at cutoff. The cutoff is deliberately recorded as a diagnostic comparison because the actual default handoff does not propagate it.

This is an implemented boundary admission failure. It does not assert an observed incident, actual database contents or that a provider produced extreme measurements. No live request, credentials, database or Auth service was used. The synthetic fetch implementation returns only local JSON and never opens a connection.

The smallest next gate is **assessment-cutoff contract review at the active environmental-history handoff**: bind the explicit assessment to selection and independently validate selected family represented support against it. Envelope time alone is insufficient where a consumer prefers family evidence time. Deterministic equal-time handling, unknown support and revision choice must remain explicit; do not invent a universal selector, latest-wins, gap or lookback policy.

## What changed about overflow reachability

The earlier diagnostic constructed only low-level history wrappers. This task instead uses:

1. Actual DIRECT/GAP_FILLED parsers with synthetic transport and finite endpoints.
2. Unchanged productivity/clarity leaf producers.
3. Actual buildObservationSnapshot, buildIntelligenceSnapshot, buildSnapshotMetadata and buildOceanSnapshot constructors. Intelligence uses an explicitly synthetic minimal documentary unavailable Opportunity object; no species/Ocean Physics science is fabricated or evaluated.
4. A JSON-roundtripped synthetic database response with matching row/payload identity, schema, contract and represented time.
5. retrieveOceanMemoryRows → buildOceanMemoryStorageRecordFromRow → buildHistoricalSnapshotQuery → buildOceanMemoryTimeSeries.
6. The actual productivity/clarity consumers using the selected time-series payloads, exactly as the production aggregator hands them off. The full aggregator is not executed because it enters quarantined science.

For **DIRECT independently** and **GAP_FILLED independently**, +1e308 followed by -1e308 survives this boundary and produces concentrationChangeMgM3=-Infinity, available=true and confidence=60/Moderate. Classification/lifecycle and dependency implications remain those established by the prior chlorophyll review.

Requested reachability classification: **PRODUCTION_REACHABLE**, specifically **conditional production resolver/selection-contract reachability given matching historical source rows**. This is not proof of provider occurrence, actual persisted rows, full default acquisition-to-storage reachability, or a qualified shared historical source. The synthetic intelligence input is not promoted to authentic historical scientific provenance. The newly demonstrated fact is that existing resolver/selection governance does not block this otherwise accepted row payload.

Controls show that missing bearer token prevents a transport call, row/payload ID mismatch is rejected, and repeated snapshot ID deduplicates. Those guards do not supply a missing assessment cutoff or derived-result finiteness guard.

## 27-consumer reconciliation

Classification means current production wiring, not scientific qualification. Source function bodies and caller lines are recorded in JSON. Exported functions exercised only by tests are classified DORMANT/UNWIRED, rather than being called production consumers. Quarantined feature entries are reconciled by wiring only; no convergence/Ocean Physics semantics were reopened.

| # | Consumer | Wiring classification | Caller / source line |
|---|---|---|---|
| 1 | buildOceanChangeAnalysis | ACTIVE_PRODUCTION_CONSUMER | buildOceanChangeFromTimeSeries:21148 |
| 2 | buildOceanChangeFromTimeSeries | ACTIVE_PRODUCTION_CONSUMER | getOceanConditionsAtAssessment:61435 |
| 3 | buildPersistenceEvidence | ACTIVE_PRODUCTION_CONSUMER | assessOceanEvidence:9600, buildOceanPersistence:34573, assessBlueMarlinHabitat:46572 |
| 4 | buildSeaSurfaceTemperaturePersistence | ACTIVE_PRODUCTION_CONSUMER | buildOceanPersistence:34579 |
| 5 | buildCurrentPersistence | ACTIVE_PRODUCTION_CONSUMER | buildOceanPersistence:34585 |
| 6 | buildCurrentEdgePersistence | ACTIVE_PRODUCTION_CONSUMER | buildOceanPersistence:34591 |
| 7 | buildCurrentShearPersistence | ACTIVE_PRODUCTION_CONSUMER | buildOceanPersistence:34597 |
| 8 | buildCurrentConvergencePersistence | ACTIVE_PRODUCTION_CONSUMER | buildOceanPersistence:34603 |
| 9 | buildEnvironmentalTransitionPersistence | ACTIVE_PRODUCTION_CONSUMER | buildOceanPersistence:34609 |
| 10 | buildSurfaceWaterCharacterPersistence | ACTIVE_PRODUCTION_CONSUMER | buildOceanPersistence:34615 |
| 11 | buildWaterMassPersistence | ACTIVE_PRODUCTION_CONSUMER | buildOceanPersistence:34621 |
| 12 | buildMixingZonePersistence | ACTIVE_PRODUCTION_CONSUMER | buildOceanPersistence:34627 |
| 13 | buildOceanFrontPersistence | ACTIVE_PRODUCTION_CONSUMER | buildOceanPersistence:34633 |
| 14 | buildProductivityPersistence | ACTIVE_PRODUCTION_CONSUMER | buildOceanPersistence:34639 |
| 15 | buildClarityPersistence | ACTIVE_PRODUCTION_CONSUMER | buildOceanPersistence:34645 |
| 16 | buildTemporalFeatureContinuity | ACTIVE_PRODUCTION_CONSUMER | buildOceanPersistence:34897 |
| 17 | buildGovernedOpportunityEvidenceAccumulationV1 | DORMANT/UNWIRED | No production call |
| 18 | buildGovernedOpportunityContinuityV1 | DORMANT/UNWIRED | No production call |
| 19 | buildGovernedOpportunityEvidenceCoherenceV1 | DORMANT/UNWIRED | No production call |
| 20 | buildGovernedOpportunityPersistenceV1 | DORMANT/UNWIRED | No production call |
| 21 | buildGovernedOpportunityMultiDayPersistenceIntelligenceV1 | DORMANT/UNWIRED | No production call |
| 22 | buildGovernedOpportunityTrendEvidenceV1 | DORMANT/UNWIRED | No production call |
| 23 | buildGovernedOpportunityTrendResolutionV1 | DORMANT/UNWIRED | No production call |
| 24 | buildGovernedFeatureAssociation | DORMANT/UNWIRED | No production call |
| 25 | buildGovernedFeatureMovement | DORMANT/UNWIRED | No production call |
| 26 | buildOceanEvolution | DOCUMENTARY_ONLY | getOceanConditionsAtAssessment:61447 |
| 27 | buildTemporalOceanExplainability | DOCUMENTARY_ONLY | getOceanConditionsAtAssessment:61455 |

There are **16 ACTIVE_PRODUCTION_CONSUMER**, **2 DOCUMENTARY_ONLY** wired consumers and **9 DORMANT/UNWIRED** exports. No wiring UNKNOWN is used. Policy unknowns remain explicit in each ledger row; the mandatory STOP prevents turning those into qualified contracts.

buildOceanChangeAnalysis compares the two observation/intelligence snapshots handed off by buildOceanChangeFromTimeSeries. SST/current persistence and feature-specific persistence are called by buildOceanPersistence. buildTemporalFeatureContinuity is applied to its feature entries. Evolution and temporal explainability are wired documentary consumers. The seven Opportunity accumulation/continuity/coherence/persistence/multiday/trend analyzers and two governed feature association/movement functions have no production call site in backend/shared; test invocation is not wiring.

## History entry points and classes

| Boundary | History class | Resolver result |
|---|---|---|
| getOceanConditionsAtAssessment → retrieveOceanMemoryRows | ENVIRONMENTAL_OBSERVATION_HISTORY with historical assessed intelligence | PARTIAL_RESOLVER: implemented captain-owned transport/row resolution, not qualified shared history selection |
| buildHistoricalSnapshotQuery → buildOceanMemoryTimeSeries | Environmental/feature input selection and retrieval metadata | PARTIAL_RESOLVER: shape/version/time/filter/order/ID checks; no default cutoff or consumer-specific admissibility |
| resolveAuthenticatedGovernedOpportunityFallbackV1 | OPPORTUNITY_DECISION_HISTORY / DOCUMENTARY_HISTORY | RESOLVER_EXISTS for its historical-decision purpose; not an environmental history resolver |
| Opportunity observation-row retrieval and unwired temporal analyzers | OPPORTUNITY_DECISION_HISTORY | NO_RESOLVER wired to those analyzers in production |
| Publication worker V3 history ports | ASSESSMENT_HISTORY / exact bound references | PARTIAL_RESOLVER: caller-supplied resolve/verify ports and frozen envelope, not a concrete shared interpreted-snapshot source |
| Frame/archive/exact capture references | Environmental source authority | PARTIAL_RESOLVER for this task: exact identity/support building blocks, not complete interpreted-history payload selection |
| Evolution/explainability | DOCUMENTARY_HISTORY | NOT_REQUIRED: consume already assembled upstream temporal facts |

The dynamic Opportunity fallback uses a separate authenticated history resolver, maximumRows=250 and evaluatedBefore=currentEvaluationTime, then historical captain-context compatibility. It preserves decisions without recalculating them or establishing current Opportunity/rank. Its cutoff must not be generalized to the environmental path, where the cutoff is absent. Rank, display appearance and exclusion are not environmental observation identity or negative ocean measurements.

Snapshot/retrieval/generated/stored timestamps are RETRIEVAL/SNAPSHOT_METADATA; they must not replace represented family times. STATIC_CONTEXT does not become repeated temporal observation. Observation, assessment and publication identity remain distinct.

## Existing selection versus unresolved science

**Identity/as-used evidence.** Legacy resolution checks matching row/payload snapshot IDs, version metadata and represented envelope times, then deduplicates snapshotId. It does not establish that a new snapshot ID is a new environmental observation or independently verify an immutable archive reference. Preserve original evidence and exact as-used identities. A later revision must not replace them silently. Repeated four-hour assessments/publications cannot multiply observational support.

**Qualified primitives.** pelora-environmental-evidence-sample-v1 binds a Frame/archive content identity and exact component/sample address. pelora-publication-candidate-assessment-v1 binds an assessment/publication projection. They are distinct authorities and neither is directly the interpreted snapshot shape accepted by these legacy consumers. Existing primitive schemas need no demonstrated amendment; a consumer-specific qualified adapter/resolver is still required. Exact capture v2 references should retain their existing exact encoding and digest authority; no new temporal v2 or duplicate numeric encoding is authored.

**Support/revision.** The active legacy consumers consume timestamps, not a qualified policy over instant, interval, composite, static and unknown support. Timestamp-only acceptance does not establish support compatibility. REVISION_POLICY_REQUIRED remains per consumer. No latest-wins or universal coherence rule is selected. The NOAA same-field convergence rule is not imported.

**Ordering/duplicates.** Selection sorts represented timestamps and deduplicates snapshot IDs. Equal-time ordering inherits supplied order; the database query orders only observed_at, so ties do not have a uniquely governed revision order. Exact duplicate IDs differ from same observation republished under different IDs. Equal-valued distinct observations are not duplicates. Sorting must not disguise unresolved identity/revision authority.

**Lookback/retention/gaps.** The environmental 48-row and decision 250-row limits are technical request bounds, not qualified scientific lookback or retention durations. No production retention duration is selected or measured. Missing evidence/no prior sample fails consumer minimum/availability gates; no forward-fill is introduced. Large gaps can remain calculable without being qualified. Retention, maximum gap and admissibility stay consumer-specific policy requirements where needed.

**Qualification/freshness.** Required endpoint finite-value and classification checks exist, but raw persistence does not reconstruct product qualification, exact provenance, revision or historical support admissibility. Recorded freshness-at-original-use is distinct from admissibility now. The cutoff defect blocks qualification even when all endpoint values are finite.

## Family-specific findings

**Chlorophyll.** DIRECT/GAP_FILLED lineage survives the snapshot and resolver payloads. A mixed direct/gap pair passes both temporal consumers when local classification predicates pass; they do not establish or enforce equivalence. The clarity-label mismatch affects consumer-local history filtering, independently of the resolver and arithmetic failure: clear-surface-water is emitted while clear-blue-surface-water is ranked. It is not automatically a normalization repair.

**SST/current.** Their temporal consumers are actively wired to the same environmental-history resolver. Prior extreme synthetic subtraction results are not promoted to default-provider reachability in this STOP review. Current-vector failure locality remains qualified; no convergence consequences are examined.

**Weather/marine.** Wind/wave/swell are carried in observation snapshots. No active historical numerical wind/wave/swell consumer was found in this 27-consumer path. buildOceanChangeAnalysis reads current, SST, organization, front classification and pathway fields, not historical wind/wave/swell arithmetic. Present snapshot fields are not automatically temporal science.

**Features.** Feature persistence consumes interpreted historical contracts, not just raw endpoints. Repeated labels alone do not establish same-feature identity or tracked continuity. The association/movement producers remain unwired; their availability as exports does not close the identity gap.

**Nightly/audit.** No dedicated Nightly Learn/Audit consumer was found wired into this matrix. Locked documents reserve immutable history for separately qualified audit/learning. No new nightly schedule, storage policy or coupling to request selection is established. All available backend/shared regression scripts are run; there is no dedicated nightly runtime qualification claimed.

## Temporal finiteness and amendment ownership

For the resolver-reachable chlorophyll contracts, retain **TEMPORAL_DERIVED_FINITE_CHECK_REQUIRED** and **TEMPORAL_DEPENDENT_RESULTS_FAIL_CLOSED**. Finite selected source evidence does not guarantee finite subtraction. Failed changes must not support classification/lifecycle/confidence/continuity; setting available=false alone cannot leave contradictory invalid fields or dependent authority populated. Existing states suffice, as previously qualified. Preserve independent valid observations, ±0 and exact capture semantics.

This adds reachable temporal-derived admission to the eventual amendment scope; it does not make capture or source parsing responsible for every later calculation. No physical range, chlorophyll formula change, source re-normalization or history deletion is justified by this diagnostic. SST/current extremes and other arithmetic remain bounded prior findings until their production input/admission paths receive separate review.

The per-consumer JSON ledger retains evidence class, minima, identity, support, order, cutoff, revision, product distinctions, gap/lookback/retention, output/arithmetic disposition and failure locality. Prior policy cells are explicitly carried as diagnostic requirements, not silently requalified. **Full temporal arithmetic review and consumer-specific selection qualification stop at the cutoff blocker.**

## Next gate and preserved boundaries

Primary verdict: **CONSUMER_AWARE_HISTORY_POLICY_REQUIRED**. Secondary blocker: **ASSESSMENT_CUTOFF_NOT_ENFORCED_AT_PRODUCTION_HISTORY_BOUNDARY**; shared historical source/admissibility/revision requirements remain open.

Next is the smallest cutoff contract review described above, before returning to complete consumer-aware selection or cross-route finiteness qualification. This is not permission to implement a filter, universal selector, resolver or retention policy.

Current-vector locality and prior chlorophyll temporal scope remain QUALIFIED. Tasks 12B.6C and 9E-D remain PAUSED. Numeric strings, provider fills and legacy SST coordinates remain OPEN. Convergence/Ocean Physics are untouched and paused; NOAA SME response remains pending externally.

## Sources

- [Default history handoff](../backend/server.js#L61377), [retrieval](../backend/server.js#L365), [row adapter](../backend/server.js#L18315), [query](../backend/server.js#L18952), [time series](../backend/server.js#L20780).
- [Productivity](../backend/server.js#L33194), [clarity](../backend/server.js#L33870), [Opportunity fallback](../backend/server.js#L57375).
- [Prior 27-consumer requirements](Temporal_History_Requirements_v1.json), [history semantics](Temporal_History_Selection_Semantics_v1.md), [historical payload boundary](Governed_Historical_Ocean_Snapshot_v1.md), [chlorophyll scope](Chlorophyll_Temporal_Derived_Finiteness_v1.md).
- [Temporal primitives](../backend/temporalEvidencePrimitives.mjs), [publication worker](../backend/oceanState/publicationWorker.mjs), [exact current capture](../backend/currentEvidenceCaptureV2.mjs).

## Verification and preservation

Seven focused diagnostic tests pass. All 76 network-blocked backend/shared test scripts pass, including chlorophyll temporal 19, temporal primitives 100, Task 12B.4 13 and Task 12B.3 13, source-normalization, captures, serialization, archive/publication and Opportunity/governance. No dedicated Nightly Learn/Audit runtime suite was present. The existing quarantined V3 semantic-projection test was excluded, not requalified. All 145 JavaScript syntax checks and 74 JSON parses pass. New-file whitespace, source/reference resolution and git diff --check pass.

All **123 pre-existing untracked artifacts are byte-identical**, with before/after SHA-256 pairs in JSON. Git has **127 untracked files: the protected 123 plus these four**. Tracked/staged diffs are empty; branch/HEAD unchanged. Exact additive diff and logs are ignored under .local/ocean-quarantine/consumer-history/.

No provider/database/Auth/Supabase access, environmental acquisition, runtime or storage changes, staging, commit, tag, push or deployment. Synthetic token/key strings never reached an external service. Left **UNCOMMITTED**. Passing diagnostics verify the STOP; they do not qualify selection or authorize implementation.
