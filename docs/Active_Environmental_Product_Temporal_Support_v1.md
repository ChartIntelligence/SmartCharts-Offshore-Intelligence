# Active Environmental Product Temporal-Support Authority Qualification v1

Task 12B.7G. **STOP: ACTIVE_PRODUCT_TEMPORAL_SUPPORT_AUTHORITY_REQUIRED.** No active product has sufficient preserved authority to establish its exact support, and active consumer compatibility remains unqualified. `ACTIVE_ENVIRONMENTAL_TEMPORAL_SUPPORT_AUTHORITY_QUALIFIED` is not established.

This is a product-by-product result, not a blanket failure caused by NOAA currents. SST and both chlorophyll source paths were reviewed independently. Their blockers differ. The exact availability-reference and current-vector failure-locality contracts remain qualified.

The [machine-readable report](Active_Environmental_Product_Temporal_Support_v1.json) contains the four product records, all 16 consumer bindings, source locations/hashes, exact documentation questions, validation results and artifact preservation hashes. No source values were acquired and no provider documentation was fetched. Repository source, existing contracts and preserved provider-review evidence were used.

## Active product results

| Active source path | Exact identity currently established | Support / bounds | Disposition |
|---|---|---|---|
| SST | Open-Meteo Marine `current=sea_surface_temperature`; underlying dataset/model/release **not pinned** | UNKNOWN; no authoritative start/end | PRODUCT_IDENTITY_AND_TEMPORAL_DOCUMENTATION_REQUIRED |
| DIRECT chlorophyll | NOAA CoastWatch `noaacwNPPVIIRSchlaDaily`, `chlor_a`; release unpinned | UNKNOWN; daily label does not prove instant or composite | QUALIFIED_PRODUCT_TEMPORAL_DOCUMENTATION_REQUIRED |
| GAP_FILLED chlorophyll | NOAA NESDIS CoastWatch `nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily`, `chlor_a`; release unpinned | UNKNOWN; target support versus DINEOF input window unresolved | QUALIFIED_RECONSTRUCTION_TEMPORAL_DOCUMENTATION_REQUIRED |
| Currents | NOAA CoastWatch `noaacwBLENDEDNRTcurrentsDaily`, `u_current/v_current`; scientific release unpinned | UNKNOWN; `time_bnds` name does not establish values or meaning | PROVIDER_TEMPORAL_CLARIFICATION_REQUIRED |

These are four active source paths, not four fully identified product versions. No processing version is invented. All four also require later metadata-preservation and consumer-compatibility review. None is assigned INSTANT, INTERVAL or COMPOSITE merely from a parser, source classification or product name.

Sufficient temporal-support authority is **NONE** for each path. This does not erase partial authority: source code and locked Pelora contracts establish retained fields and product labels; the preserved NOAA review establishes provider coordinate metadata. No qualified product documentation or exact source-file metadata in the reviewed active evidence supplies the missing support meaning/bounds. This is a repository-evidence limitation, not a claim that providers have no documentation.

The default SST source is proven by `getSeaSurfaceTemperaturePoint` (`backend/server.js:6173`), `getMarineConditions` (`:7204`, SST result `:7526`), and the capture source profile (`backend/currentEvidenceCapture.mjs:6`). The former preserves `timestampProvenance: marine-current-block-valid-time`; both use provider `current.time`. That is model valid-time evidence, not qualified instantaneous ocean observation support. Dataset/model identity cannot be recovered from the provider name alone.

OSTIA NRT/REP qualification is not transferred to this source. The NOAA Geo-Polar source remains a separate pilot/worker foundation, not the default historical SST product. Its existing source module explicitly retains unknown support. Neither pilot nor OSTIA was subjected to a new product-science review. Their existing qualification boundaries remain unchanged.

The DIRECT and GAP_FILLED parsers separately copy ERDDAP row `time` to `observedAt` (`server.js:2056` and `:2179` source paths). The gap-filled point additionally retains DINEOF, experimental reconstruction, platform and resolution markers. Those markers establish distinct source identity; they do not establish a temporal kernel or permission to treat DIRECT and reconstructed observations equivalently. Age/freshness calculated from the row timestamp cannot establish support.

The current parser uses the same NOAA dataset identified in the pending provider review (`server.js:2359`). The preserved temporal section of `NOAA_Geostrophic_Current_Metadata_Qualification_v2.md:39` records that `time:bounds=time_bnds` is named but its values/header and meaning were not established. The already pending provider question covers the missing authority. No new NOAA contact, same-field policy or convergence interpretation occurred.

## Temporal authorities remain distinct

| Fact | Meaning and limitation |
|---|---|
| REPRESENTED_TIME | Reported observation, valid or nominal coordinate according to its source contract; cannot supply unknown support by itself |
| SUPPORT_TYPE | Provider/qualified-contract meaning: instant, interval, composite, static, or explicitly unknown |
| SUPPORT_START / SUPPORT_END | Actual product-defined boundaries, with separate endpoint/averaging semantics; never a fabricated window around nominal time |
| PROVIDER_PUBLICATION_TIME | Provider release event; neither environmental support nor Pelora possession |
| PELORA_RECEIVED_AT | Trustworthy exact-content possession event under the qualified availability contract |
| ASSESSMENT_AT | Explicit target assessment authority; not a source observation or receipt |
| RETRIEVAL_TIME / CACHE_TIME | Operational events; not environmental ordering or support |

“Daily” does not choose among daily mean, composite, instantaneous analysis, target reconstruction or midnight observation. Update cadence, a filename, nominal timestamp or freshness label supplies no missing bounds. The current `time_bnds` attribute name is not a temporal definition; lack of retained bounds does not prove that a provider has none.

For composites the unresolved question is whether support denotes the effective output compositing window, all contributing inputs or another provider-defined interval. For gap filling the target reconstruction support and the multi-time input window must remain distinct. No active product was classified by analogy. Product overlap is **UNKNOWN** for all four paths; synthetic overlapping composites are representable, which is not provider evidence or an overlap-selection policy.

## Sixteen active consumer bindings

All functions below reside in `backend/server.js`. Exact prior source anchors and input contracts are retained in the JSON. The family binding is a dependency inventory: a cross-family consumer need not require every possible product on every invocation.

| Consumer | Source products or inherited dependency | Current support compatibility |
|---|---|---|
| buildOceanChangeAnalysis | SST/current facts and governed cross-family organization/feature parents | UNKNOWN |
| buildOceanChangeFromTimeSeries | Same products through change-analysis handoff | UNKNOWN |
| buildPersistenceEvidence | Governed organization history; possible SST, DIRECT/GAP_FILLED chlorophyll and current parents | UNKNOWN |
| buildSeaSurfaceTemperaturePersistence | Open-Meteo SST | UNKNOWN |
| buildCurrentPersistence | NOAA NRT current vector history | UNKNOWN |
| buildCurrentEdgePersistence | NOAA current-derived edge history | UNKNOWN |
| buildCurrentShearPersistence | NOAA current-derived shear history | UNKNOWN |
| buildCurrentConvergencePersistence | Locked NOAA-current temporal handoff only; no new interpretation or focused execution | UNKNOWN |
| buildEnvironmentalTransitionPersistence | Governed transition parents from the active cross-family product set | UNKNOWN |
| buildSurfaceWaterCharacterPersistence | Governed character parents, including SST and distinct chlorophyll sources | UNKNOWN |
| buildWaterMassPersistence | Governed water-mass parents from the active product set | UNKNOWN |
| buildMixingZonePersistence | Governed mixing-feature parents from the active product set | UNKNOWN |
| buildOceanFrontPersistence | Governed front parents from the active product set | UNKNOWN |
| buildProductivityPersistence | DIRECT or GAP_FILLED chlorophyll interpretation, separately identified | UNKNOWN |
| buildClarityPersistence | DIRECT or GAP_FILLED chlorophyll interpretation, separately identified | UNKNOWN |
| buildTemporalFeatureContinuity | Existing persistence/lifecycle/window and optional governed movement; inherits actual feature parents | UNKNOWN |

Every active consumer therefore has **CONSUMER_SUPPORT_COMPATIBILITY_REQUIRED** in addition to its product blocker. Timestamp arithmetic is not authority to declare INSTANT_ONLY, INTERVAL_ACCEPTED or COMPOSITE_ACCEPTED. The existing test-only qualified SST view is INSTANT_ONLY; the active legacy functions do not acquire that qualification by sharing a family name. No active consumer is classified SUPPORT_AGNOSTIC_DOCUMENTARY to bypass a missing scientific requirement.

Current handoff remains source abstraction/retrieval (`retrieveOceanMemoryRows:365`) → row adapter (`buildOceanMemoryStorageRecordFromRow:18315`) → selector (`buildHistoricalSnapshotQuery:18952`) → time series (`buildOceanMemoryTimeSeries:20780`) → active consumer. Snapshot timestamp metadata and interpreted family `observedAt` survive; authoritative source support is not generally supplied. No selector or query was changed.

The inventory remains **16 ACTIVE / 2 DOCUMENTARY / 9 UNWIRED**. Derived water-character/front/feature facts do not introduce independent provider products. No raw weather/wave/swell history is added because a capture exists. Bathymetry and water-mask static context do not become repeated environmental observations. Opportunity decisions remain assessment/publication history, not environmental observations. Documentary and unwired consumers were not promoted.

## Representation and identity findings

Existing Ocean Product Frame support can represent instant, interval, composite-window, forecast-valid-interval, static and unknown. The temporal evidence sample primitive preserves the exact Frame support and binds the sample to the existing frame digest/address. Structural acceptance does not authenticate supplied provider semantics.

The new tests preserve each of the five requested support kinds through the actual Frame/sample boundary. They show that changing support changes exact sample identity and invalidates validation against the original sample. Same-time distinct revisions remain distinct identities. Revisions describe different content, not a new elapsed observation span; no revision preference is chosen.

Current capture v1/v2 preserves normalized point `observedAt` and source identity but does not contain a support field. The tests confirm that both capture versions accept the legitimate existing point schema and reject an injected support field. This is an existing-schema fact, **not** a conclusion that a capture successor is required. Determine authoritative product support first, then review the minimum content-bound preservation mechanism. No numeric encoding or identity is duplicated.

The locked synthetic SST qualification view rejects interval, composite, static and unknown support. It is not broadened to forecast-model SST. A controlled Frame with nominal/observation time before assessment and interval end after assessment is structurally representable but rejected by that instant-only view. This demonstrates why a nominal-time comparison cannot establish support eligibility; it is not a new interval cutoff or selector.

Receipt/publication changes do not turn unknown support into an instant. Availability remains independently governed. No first-receipt, revision, freshness, lookback, gap or complete ordering policy was added.

## Validation and reconstruction

Existing Frame validation requires explicit UTC calendar timestamps with seconds and optional three-digit milliseconds. Ambiguous local time and invalid dates fail. Existing interval/composite bounds require **start < end**, not equality; the task's example `start <= end` does not override the stricter contract. Instant support has only its instant coordinate. Static support has no interval, and `observationTime`/`forecastIssuedAt` must be null. Unknown has an explicit reason. Accessors are rejected by the sample boundary without invocation.

Validation of shape/bounds does not establish provider endpoint inclusion, averaging or reconstruction meaning. Those require the missing product authority. No actual product supplies a qualified represented instant/start/end for later ordering in this review; only reported coordinates are retained today. Receipt order cannot substitute.

| Product | Legacy active normalized/history record disposition | Exact reconstruction from retained metadata |
|---|---|---|
| Open-Meteo SST | LEGACY_SUPPORT_INSUFFICIENT | Underlying model/release and support not retained |
| DIRECT chlorophyll | LEGACY_SUPPORT_INSUFFICIENT | Row time/dataset/platform cannot reconstruct an unqualified compositing window |
| GAP_FILLED chlorophyll | LEGACY_SUPPORT_INSUFFICIENT | DINEOF marker and nominal time cannot reconstruct target support or input window |
| NOAA currents | LEGACY_SUPPORT_INSUFFICIENT | Reported time and bounds name cannot supply missing bounds semantics/content |

This describes source contracts and active handoff, not a production database census. An individual record with independently preserved immutable authoritative metadata would need its own qualification. None is asserted here. No deterministic exact-support reconstruction is established from the retained legacy fields alone. Nothing is backfilled, migrated or rewritten.

## Exact unresolved documentation questions and next gate

1. **Open-Meteo SST:** identify the actual underlying model/product/version selected by the current Marine API request. What does this variable's `current.time` mean scientifically? Supply the authoritative valid-instant/interval/composite definition and exact bounds/endpoint convention, and how that identity is bound to returned content. API cadence is insufficient.
2. **DIRECT chlorophyll:** for `noaacwNPPVIIRSchlaDaily` and its processing release, is each `chlor_a` value a pixel acquisition, daily composite or another support? What are the authoritative per-pixel/product bounds and nominal-time meaning? Which preserved metadata proves them?
3. **GAP_FILLED chlorophyll:** for `nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily`, distinguish target reconstruction support from contributing multi-time input/reconstruction window and weighting. What exact metadata/specification binds these meanings to the release? Do not inherit DIRECT semantics.
4. **NOAA currents:** use the already pending question about `time`/`time_bnds`, bound dimensions/units/endpoint convention, target support and input temporal window. Await the response; do not contact NOAA again.

Then review **active consumer support compatibility** against only the resulting qualified product facts. A product that later qualifies need not be re-reviewed because another remains blocked. Here, qualified active products = none; four independently reviewed unresolved paths remain. Existing restricted primitive and availability qualifications are preserved as progress.

Only after product support and consumer compatibility qualify should work return to consumer-aware historical selection for revision, lookback, gaps, freshness and legacy authority. Temporal arithmetic and cross-route normalization remain later gates.

## Preservation and verification

Four new task artifacts only: this report, its JSON ledger, `backend/tests/activeProductTemporalSupport.test.js`, and `backend/tests/fixtures/activeProductTemporalSupportFixture.mjs`. Focused tests: **23 passed**, using existing validators and synthetic metadata. No temporal subtraction/persistence arithmetic was newly qualified.

Task 12B.6C and Task 9E-D remain PAUSED. Convergence/Ocean Physics remain untouched and separately paused; the NOAA SME response remains pending. Numeric-string compatibility, provider-fill qualification and legacy SST-coordinate fallback remain OPEN. No provider/database/Auth/Supabase access, environmental acquisition, metadata-schema/capture/Frame/archive change, staging, commit, tag, push or deployment occurred. Leave Task 12B.7G UNCOMMITTED.

Final verification: all **81 executed backend/shared regression scripts passed**, with network blocked. The focused support suite passed 23 tests; selection policy 25, availability reference 25, active provenance 13, assessment cutoff 17 and temporal primitives 100. Frame/archive, normalization, Opportunity/governance and Task 11E suites are included in the JSON run list. The existing quarantined candidateSemanticProjectionV3.test.js remained excluded from execution, preserved and syntax-checked. All **155 JavaScript syntax checks** and **149 JSON parses** passed. Whitespace and git diff --check passed. All **143 protected artifacts remain byte-identical**; four new files only, 147 untracked total, tracked/staged diffs empty, expected branch/HEAD retained. No staging/commit/tag/push/deployment.
