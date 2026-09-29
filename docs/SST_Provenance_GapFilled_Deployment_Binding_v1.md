# Task 12B.7J — SST Consumer Provenance & Gap-Filled Deployment Binding v1

Verdict: **SST_SOURCE_EQUIVALENCE_AND_GAP_FILLED_PROVIDER_BINDING_REQUIRED**. Qualification only; no production implementation. This review preserves qualified temporal semantics but does not qualify either product for complete historical selection.

| Product | Preserved authority | Remaining result |
|---|---|---|
| Open-Meteo SST | Instant model-valid state | OPEN_METEO_SST_SOURCE_EQUIVALENCE_POLICY_REQUIRED |
| DIRECT chlorophyll | Daily mapped/composite | PROVIDER_CLARIFICATION_REQUIRED_FOR_EXACT_SUPPORT_BOUNDS |
| GAP_FILLED chlorophyll | Provider reconstruction; documented target day plus preceding 29 daily images | GAP_FILLED_PROVIDER_BINDING_REQUIRED; exact target bounds remain external |
| NOAA currents | Prior qualifications unchanged | PENDING_NOAA_SME; not reviewed |

## SST consumer provenance

The reconciled ledger binds ten active consumers to SST directly or through required parent facts. A binding does not mean every invocation consumes SST. None reads an exact model/run identifier. Existing mechanical value/time inputs do not establish that unknown underlying models are scientifically interchangeable. Conversely, the repository does not establish a universal exact-model-run requirement. The unresolved requirement is source equivalence for each scientific claim, not a convenient metadata choice.

| Consumer | Existing claim | Source |
|---|---|---|
| buildOceanChangeAnalysis | change between supplied comparable states | [server.js:16443](../backend/server.js#L16443) |
| buildOceanChangeFromTimeSeries | change for latest supplied pair | [server.js:21062](../backend/server.js#L21062) |
| buildPersistenceEvidence | organization persistence across snapshots | [server.js:22930](../backend/server.js#L22930) |
| buildSeaSurfaceTemperaturePersistence | thermal stability/change over represented span | [server.js:26462](../backend/server.js#L26462) |
| buildEnvironmentalTransitionPersistence | repetition/change of governed transition facts | [server.js:29368](../backend/server.js#L29368) |
| buildSurfaceWaterCharacterPersistence | persistence/change of water-character facts | [server.js:30075](../backend/server.js#L30075) |
| buildWaterMassPersistence | persistence of governed water-mass distinction facts | [server.js:30809](../backend/server.js#L30809) |
| buildMixingZonePersistence | persistence of supplied mixing-zone facts | [server.js:31540](../backend/server.js#L31540) |
| buildOceanFrontPersistence | persistence of supplied front facts | [server.js:32359](../backend/server.js#L32359) |
| buildTemporalFeatureContinuity | continuity from governed persistence and optional established movement | [server.js:26071](../backend/server.js#L26071) |

For every row: primary disposition **SOURCE_EQUIVALENCE_POLICY_REQUIRED**; competing same-support content additionally needs **REVISION_AUTHORITY_REQUIRED**. Exact-as-used reconstruction requires an exact evidence reference, but that is not a field read by these legacy consumer APIs. The JSON ledger records each input field, existing calculation description, output, downstream caller, identity assumption and provenance read. No temporal calculation was qualified here.

Trend/change: No repository source/model equivalence rule qualifies mixed underlying origins as comparable scientific state. Numeric calculability does not establish compatibility; no impact magnitude speculation.

Persistence: Governed fact continuity is required; repository does not establish whether changing model/run preserves it. Cannot substitute either universal same-model requirement or universal model agnosticism.

Spatial/feature continuity: Governed persistence/association/movement identity required. Exact model run not directly part of consumed continuity contract. Source coherence inherited; no feature/physics formula review. Payload paths bearing existing physics names are dependency labels only; their science was not reopened.

### Exact reference and controlled revision probes

Current v2 reference fields are kind, referenceId, contractVersion and sha256. Resolving that reference binds the capture: family, samples, Celsius/Fahrenheit, retained requested/resolved location, observedAt text, source family/classification/availability, optional coordinate/time provenance, capture/encoding versions, authority and lineage. The scientific digest binds family plus samples; capture identity also binds authority/lineage. Absent upstream model/run/initialization metadata is not recovered by hashing.

Actual parser → snapshot builders → row adapter probes demonstrate that different SST content at the same location, represented time, schema and capture mode produces the **same legacy snapshotId**, but different exact capture identities. Both adapted payloads preserve their different values. A changed capture cannot resolve under the original exact reference. Snapshot identity is therefore not exact SST revision authority. The identity basis is server.js:17381–17405; SST persistence deduplication by snapshotId is at 26579–26607. No selector or persistence calculation was invoked to establish this identity result.

Synthetic upstream model/run labels discarded by normalization do not change retained capture content. Unknown model/run does not prevent deterministic replay of retained facts; it does prevent this review from asserting scientific cross-source compatibility. Same-time content differences establish representable revisions, not a preferred revision or actual provider occurrence.

## GAP_FILLED deployment binding

Actual producer handoff: backend/server.js:2168, getGapFilledChlorophyllConditionsAtAssessment, via getGapFilledChlorophyllConditions. Pelora requests provider reconstruction; it does not implement DINEOF. Dataset: `nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily`. Configured endpoint (recorded from code; not requested): `https://coastwatch.pfeg.noaa.gov/erddap/griddap/nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily.json`. Query: `chlor_a[(last)][(0.0)][(latitude)][(longitude)]`.

| Retained source marker | Exact value |
|---|---|
| provider | NOAA NESDIS CoastWatch |
| platform | S-NPP + NOAA-20 VIIRS |
| dataset | nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily |
| variable | chlor_a |
| units | mg m^-3 |
| observationType | gap-filled-reconstruction |
| algorithm | DINEOF |
| resolutionKilometers | 9 |
| experimental | true |
| classification | satellite-derived-reconstruction |

Capture requires observationType=gap-filled-reconstruction, algorithm=DINEOF, resolutionKilometers=9 and experimental=true, together with governed source identity. Missing or wrong markers fail capture validation. These are locally assigned constants, including unavailable paths, not response-bound deployment attestations. Correspondence is **PRODUCT_FAMILY_BINDING_ONLY**.

The normalized point retains requested/resolved location, concentration, water classification, observedAt and source markers. It does not retain deployed algorithm/configuration version, processing event, input-window lineage, exact target bounds or receipt authority. Synthetic provider version/window fields are ignored; changing them leaves the normalized content unchanged. Inventing an algorithmVersion field inside the locked capture is rejected. A separate lineage reference can alter capture identity, but merely supplying a label does not establish trustworthy provider authority.

The preceding 29-day operational window is **provider-documented but not version-bound**. The prior collected documentation describes target daily image plus preceding 29 daily images, with no later daily images in that described configuration. Pelora neither computes this window nor records a response-specific attestation to it. This review cannot certify that every deployed/historical response uses that configuration. No new documentation was collected.

Provider row time becomes observedAt as exact retained text. This establishes the retained target coordinate, not exact UTC start/end support bounds. Target support and reconstruction input support remain separate. Exact target bounds still need provider clarification. The same target can hold distinct captured reconstructed content; actual late-input/reprocessing revision behavior is unresolved. No revision preference is selected.

Exact reconstructed content requires trustworthy receivedAt <= assessmentAt even for a backward-looking input window. Target time, local DINEOF markers and a nominal 29-day rule cannot substitute for possession authority. A later receipt cannot inherit eligibility from a different same-target revision.

### Active GAP_FILLED consumer requirements

| Consumer | Required governed fact |
|---|---|
| buildOceanChangeAnalysis | change between supplied comparable states |
| buildOceanChangeFromTimeSeries | change for latest supplied pair |
| buildPersistenceEvidence | organization persistence across snapshots |
| buildEnvironmentalTransitionPersistence | repetition/change of governed transition facts |
| buildSurfaceWaterCharacterPersistence | persistence/change of water-character facts |
| buildWaterMassPersistence | persistence of governed water-mass distinction facts |
| buildMixingZonePersistence | persistence of supplied mixing-zone facts |
| buildOceanFrontPersistence | persistence of supplied front facts |
| buildProductivityPersistence | persistence/change of interpreted productivity evidence |
| buildClarityPersistence | persistence/change of interpreted clarity evidence |
| buildTemporalFeatureContinuity | continuity from governed persistence and optional established movement |

All eleven bindings preserve reconstructed product/target identity, exact-as-used parent evidence and independent receipt authority. No consumer directly checks an algorithm version or reconstruction input window. The missing exact deployment binding is upstream authority required to substantiate the claimed reconstruction semantics, not an invented consumer API requirement. A provider-authorized immutable release/configuration correspondence, or equivalent governed binding, is required. DIRECT/GAP_FILLED equivalence remains unqualified.

## Preserved external questions and next gate

DIRECT question copied unchanged from prior review; **not sent**: For noaacwNPPVIIRSchlaDaily, define time relative to baseline_bounds: exact UTC start/end and endpoint convention, contribution window versus pixel acquisition, and immutable product/version rule that permits reconstruction. Resolve L3 title versus L2 processing_level; do not substitute L2 filename timing.

GAP_FILLED minimum binding question: Which immutable product release/configuration applies to nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily and establishes that a particular response uses the documented target-day plus preceding-29-day DINEOF configuration? How is that binding preserved across algorithm/input/reprocessing changes? Exact target UTC bounds remain a separate pending provider question. No provider was contacted.

SST next gate: establish source/model comparability authority for the ten mapped scientific claims, including whether unknown model/run can preserve their governed fact continuity. This review cannot choose between exact model identity and a qualified source-family equivalence rule. GAP_FILLED independently needs provider deployment binding and target-bound authority. Neither moves to complete selection yet. DIRECT bounds and NOAA SME remain external; do not redo their qualified portions.

## Scope and verification

New files only: this Markdown report, its JSON companion, backend/tests/sstProvenanceGapFilledBinding.test.js and backend/tests/fixtures/sstProvenanceGapFilledBindingFixture.mjs. The JSON includes exact per-consumer bindings, source hashes, test inventory and preservation manifest. The focused suite exercises existing parsers, capture/reference validation, snapshot construction and row adaptation with synthetic data. It does not implement a selector, issuer, resolver or scientific formula.

The 16 active / 2 documentary / 9 unwired inventory is unchanged. Current-only consumers are not requalified. No new web research, provider contact, environmental acquisition, database/Auth/Supabase access, production change, historical rewrite, or history-policy choice occurred. No lookback, gap, freshness, revision preference or full ordering policy is selected. Broad requested regressions may exercise existing temporal code; they do not constitute new arithmetic qualification.

Current-vector failure locality and historical availability-reference contracts remain qualified. Task 12B.6C and Task 9E-D remain PAUSED. Convergence/Ocean Physics remains quarantined and NOAA SME response pending. Numeric-string compatibility, provider-fill qualification and legacy SST coordinate fallback remain OPEN. Leave all work uncommitted: no staging, commit, tag, push or deployment.


Final verification: all **84 executed backend/shared regression scripts passed**, with network blocked. The focused SST provenance/deployment suite passed 16 tests; prior SST/chlorophyll support 13; prior product-support 23; selection policy 25, availability reference 25, active provenance 13, assessment cutoff 17 and temporal primitives 100. Frame/archive, normalization, Opportunity/governance and Task 11E suites are included in the JSON run list. The existing quarantined candidateSemanticProjectionV3.test.js remained excluded from execution, preserved and syntax-checked. All **161 JavaScript syntax checks** and **152 JSON parses** passed. Whitespace and git diff --check passed. All **155 protected artifacts remain byte-identical**; four new files only, 159 untracked total, tracked/staged diffs empty, expected branch/HEAD retained. No staging/commit/tag/push/deployment.
