# SST and Chlorophyll Temporal-Support Authority v1

Task 12B.7H. **ACTIVE_SST_CHLOROPHYLL_TEMPORAL_SUPPORT_PARTIALLY_QUALIFIED.** This is not complete historical eligibility or implementation approval.

| Product | Qualified result | Remaining boundary |
|---|---|---|
| Open-Meteo SST | API variable represents an instantaneous model-valid state | Exact response model/run/release is not retained; historical provenance and consumer model-evidence compatibility remain open |
| DIRECT chlorophyll | Satellite-derived daily mapped/composite product category | Exact support bounds and nominal-time anchor unresolved |
| GAP_FILLED chlorophyll | Provider-produced daily reconstructed analysis; target, inputs and receipt are distinct | Exact target bounds and deployed reconstruction-window/version authority unresolved |
| NOAA currents | Unchanged: NOAA_CURRENT_TEMPORAL_SUPPORT_PENDING | Not researched or requalified |

The [JSON evidence ledger](SST_Chlorophyll_Temporal_Support_Authority_v1.json) records exact paths, source URLs and authority classes, all 16 consumer bindings, metadata/legacy dispositions, questions, test results and protected hashes. Source statements below are distinguished from Pelora code facts and interpretation. Documentation was reviewed on 2026-09-28; web-cache snapshots and public `main` source are not immutable historical provider releases.

## Open-Meteo SST

**PELORA CODE FACT.** `getSeaSurfaceTemperaturePoint` (`backend/server.js:6173`) calls `https://marine-api.open-meteo.com/v1/marine` with requested latitude/longitude, `cell_selection=sea`, `current=sea_surface_temperature`, and `timezone=UTC`. `getMarineConditions` (`:7204`) uses the same endpoint, adding wave and swell variables to `current`. Neither sets `models`, a run, historical mode or a source version. Default temperature units apply. Both take `current.time` as `observedAt`; the spatial point additionally retains `marine-current-block-valid-time` provenance. Coordinates, normalized temperature and forecast-model source classification survive; model/run/support/interval metadata does not.

**PROVIDER FACT.** The [Marine API variable table](https://open-meteo.com/en/docs/marine-weather-api) classifies SST as **Instant**. Its documentation describes model-based current conditions, automatic Best Match selection, and a global MeteoFrance SST source with six-hourly source steps and daily updates. This establishes an API model-valid instant, not a six-hour or 15-minute average. General automatic selection is location-sensitive; it does not prove that SST blends every wave model.

**PROVIDER IMPLEMENTATION EVIDENCE.** The [MeteoFrance downloader](https://raw.githubusercontent.com/open-meteo/open-meteo/main/Sources/App/MfWave/MfWaveDownload.swift) maps `thetao` to SST, reads the first depth plane and builds run-dependent forecast/hindcast locators under `GLOBAL_ANALYSISFORECAST_PHY_001_024`, dataset `cmems_mod_glo_phy-thetao_anfc_0.083deg_PT6H-i_202406`. The [SST variable definition](https://raw.githubusercontent.com/open-meteo/open-meteo/main/Sources/App/MfWave/MfWaveVariable.swift) uses Hermite interpolation. These are public-code facts, not proof that this revision supplied any Pelora response. No source environmental file was requested.

**IDENTITY RESULT: AUTOMATIC_SOURCE_NOT_PRESERVED.** The [API schema](https://github.com/open-meteo/open-meteo/blob/main/openapi/marine.yml) does not establish an exact per-value upstream scientific run/release reference. Pelora's actual parsers discard such metadata even when a synthetic response includes it. Provider family knowledge is therefore stronger than before, but exact response lineage is not preserved.

**SCIENTIFIC INTERPRETATION.** These records may be described as model-state environmental evidence samples. They must not be relabeled as direct satellite/provider measurements. Separate valid times describe modeled states; they do not establish independent observational support. Source update cadence is not support duration or a historical retrieval window.

**REVISION POSSIBILITY.** The public downloader distinguishes runs and forecast/hindcast replacement. Different content at the same valid time is therefore possible. Automatic provider selection can also change without a retained per-response identity. This is not a demonstrated actual revision in Pelora data and does not select a revision preference. Exact normalized-content identity distinguishes changed bytes, not the missing upstream run.

**VERDICT: SST_INSTANT_MODEL_STATE_SUPPORT_QUALIFIED_WITH_IDENTITY_LIMIT.** The narrow API-variable support meaning is qualified. Exact historical product/run qualification is not. `REFERENCE_METADATA_REQUIRED` remains for that provenance; no capture/reference implementation is proposed. Existing legacy evidence is **MIXED** in authority: the valid-time marker permits its documented model-time reading, while missing run/release and then-applicable provider semantics must not be backfilled from today's documentation.

## DIRECT chlorophyll

**PELORA CODE FACT.** `getChlorophyllConditionsAtAssessment` (`server.js:2045`) queries NOAA CoastWatch `noaacwNPPVIIRSchlaDaily.json` for `chlor_a[(last)][(0.0)][(latitude)][(longitude)]`. It consumes the gridded row's `time`, latitude, longitude and concentration. It does not request pixel acquisition time, bounds, quality flags or source-file/release metadata. The `last` coordinate request is not historical selection qualification.

**PROVIDER FACT.** [Exact endpoint metadata](https://coastwatch.noaa.gov/erddap/info/noaacwNPPVIIRSchlaDaily/index.html) identifies S-NPP VIIRS, nominal global 4km daily L3, while `processing_level` says L2. It names `baseline_bounds` on the time coordinate without exposing the bounds variable. NOAA's [single-sensor product documentation](https://oceanwatch.noaa.gov/cwn/products/noaa-msl12-ocean-color-near-real-time-viirs-single-sensor-snpp-and-noaa-20.html) distinguishes mapped/composite L3 products from L2 swaths. This supports a satellite-derived daily composite category, not an instantaneous pass-time interpretation.

**UNRESOLVED.** Noon-like coordinate labels do not establish center/start/end or exact UTC bounds. Dataset-wide `time_coverage_start/end` span the collection and are not per-record support. No deterministic midnight-to-midnight or nominal-time ±12-hour reconstruction is qualified. The L2/L3 metadata discrepancy needs clarification rather than silently choosing a stronger meaning.

**QUALITY/TIME LIMIT.** Valid pixels and masking determine which source measurements contribute; they do not transform a product coordinate into an individual pass time. No exact per-pixel time or quality contribution is retained by this path. This review does not qualify cloud/mask/quality policy. Missing `cell_methods` also does not justify imposing a CF default instantaneous interpretation over contradictory compositing evidence.

**VERDICT: DIRECT_CHLOROPHYLL_PROVIDER_CLARIFICATION_REQUIRED.** Current metadata is **INSUFFICIENT** for exact support; legacy active records are **LEGACY_SUPPORT_INSUFFICIENT** from retained fields alone. The daily mapped/composite category is preserved as partial progress. No historical values or records were inspected or rewritten.

## GAP_FILLED chlorophyll

**PELORA CODE FACT.** `getGapFilledChlorophyllConditionsAtAssessment` (`server.js:2168`) queries `https://coastwatch.pfeg.noaa.gov/erddap/griddap/nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily.json`. Pelora does not run DINEOF. It retains concentration, product coordinate, source dataset/platform and reconstruction/DINEOF/experimental markers, but no input-window identities, creation/receipt event, target bounds or deployed algorithm version.

**PROVIDER FACT.** The [exact NRT product documentation](https://coastwatch.noaa.gov/cwn/products/noaa-msl12-ocean-color-near-real-time-viirs-multi-sensor-snpp-noaa-20-chlorophyll-dineof.html) assigns NOAA's ocean-color team the reconstruction and CoastWatch the distribution. It describes L4 DINEOF using merged VIIRS daily inputs and climatology, OCI, and roughly 24–48-hour latency. Its MSL12 v1.3 statement concerns inputs; it is not an exact deployed DINEOF release identifier. The [endpoint metadata](https://coastwatch.pfeg.noaa.gov/erddap/info/nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily/index.html) instead labels processing L3 Mapped, with version unspecified. Preserve that discrepancy.

Three authorities must remain separate:

| Authority | Established fact | Unresolved fact |
|---|---|---|
| TARGET_TIME / SUPPORT | Daily reconstructed product coordinate is returned as `time` | Exact target cell extent/anchor and endpoint convention |
| INPUT_SUPPORT | Multi-time merged daily source evidence and climatology participate | Exact input identities, causal alignment, maximum deployed window and climatology vintage for this revision |
| GENERATION / RECEIPT | Provider creates reconstruction; Pelora later receives exact content | A dataset-level `date_created` does not authenticate the creation/receipt history of every sample |

**CF CAUTION.** The endpoint's `time:mean(interval:1 day)` is not sufficient to derive a one-day output cell. [CF 1.6 §7.3.2](https://cfconventions.org/Data/cf-conventions/cf-conventions-1.6/build/cf-conventions.html) defines the parenthetical interval as original data spacing. Cell bounds still establish extent. Thus the preliminary shorthand “daily mean” must not become a fabricated 24-hour support interval, nor a DINEOF input-window rule.

**ALGORITHM EVIDENCE AND LIMIT.** [Liu and Wang 2019](https://www.mdpi.com/2072-4292/11/2/178), cited by the exact provider page, describes a 30-day merged 9km sequence and reconstruction within that block. A [NOAA 2020 presentation](https://www.star.nesdis.noaa.gov/star/documents/NOCCG/2020/20200603_xiaomingLiu.pdf) describes routine 30-day inputs and full daily reconstruction with climatology fallback. These establish multi-time dependence; they do not bind every operational target to a specific release-dependent causal window. Direct access to the paper later returned HTTP 429; the available indexed passage and official provider citation were used with this limit recorded.

The [2022 multi-satellite study](https://repository.library.noaa.gov/view/noaa/64502/noaa_64502_DS1.pdf) explicitly describes prior 29 days plus a target and output of the last day. That newer study is not automatically the exact two-sensor NRT endpoint's deployed contract. No backward-only window, maximum window, future-input rule or history lookback is imported from it.

**LOOKAHEAD RESULT.** Target-labelled content can become available only after the target; published processing latency supports this risk independently of whether any future-to-target inputs are used. The study block allows multi-time dependence, but this review does not claim every operational output uses later observations. A trustworthy receipt must bind the exact reconstructed content before an as-of assessment can use it. Target time alone is insufficient. No actual future leakage or environmental occurrence is claimed.

**VERDICT: GAP_FILLED_ALGORITHM_AUTHORITY_REQUIRED.** The provider-produced reconstructed category is established. Exact target bounds, deployed input-window alignment and revision lineage remain unresolved. Current metadata is **INSUFFICIENT**; legacy support is **LEGACY_SUPPORT_INSUFFICIENT**. Target support, once authoritative, describes represented science; input window and generation/receipt remain separate provenance. Full ordering is not decided.

DIRECT and GAP_FILLED remain different products even with equal concentration and time. Neither category is silently promoted to independent direct observations. The new exact-capture tests preserve their separation.

## Temporal primitives and active consumers

No new support enum is demonstrated necessary. Existing Frames/samples can express an instant with a FORECAST/ANALYSIS evidence class, or a composite/interval with authoritative bounds. Unknown remains unknown until authority exists. Source/reconstruction provenance is not replaced by the target support field. A hypothetical correctly bounded composite proves structural representation only.

The locked SST qualification view is narrower: it requires direct-observation evidence. The new test proves it rejects a FORECAST Frame despite instant support. Therefore instantaneous model semantics do not approve that consumer view or justify changing the primitive.

All 16 locked consumers remain bound in the JSON:

| Consumer(s) | Limited result |
|---|---|
| buildSeaSurfaceTemperaturePersistence | CONSUMER_SUPPORT_CONTRACT_REQUIRED for model-state evidence; source API instant meaning qualified |
| buildProductivityPersistence; buildClarityPersistence | PRODUCT_SUPPORT_UNRESOLVED for exact DIRECT/GAP_FILLED support |
| buildCurrentPersistence; buildCurrentEdgePersistence; buildCurrentShearPersistence; buildCurrentConvergencePersistence | PENDING_NOAA_TEMPORAL_AUTHORITY; no requalification |
| buildOceanChangeAnalysis; buildOceanChangeFromTimeSeries; buildPersistenceEvidence | Required cross-family parent subset inherits SST compatibility/chlorophyll unresolved/NOAA pending status |
| buildEnvironmentalTransitionPersistence; buildSurfaceWaterCharacterPersistence; buildWaterMassPersistence; buildMixingZonePersistence; buildOceanFrontPersistence; buildTemporalFeatureContinuity | Same dependency-specific inheritance; no blanket claim every execution requires every product |

The two documentary and nine unwired consumers stay outside active qualification. No lookback, revision preference, gaps, freshness or continuity policy is selected. No persistence/subtraction/overflow calculation was newly qualified.

## Remaining questions and next gate

1. **SST provenance:** how can a Best Match SST response bind the exact upstream dataset/release, run and interpolation/deployment version? What source-selection/fallback guarantees apply across location/date, and what returned metadata proves them? Preserve the now-established API instant/model-state semantics.
2. **DIRECT support:** define `time` relative to `baseline_bounds`, exact UTC endpoints/inclusivity, pixel acquisition contributions and immutable processing identity. Resolve L3 title versus L2 attribute. Is there a documented versioned reconstruction rule for bounds?
3. **GAP_FILLED authority:** specify this exact NRT deployment's target cell/coordinate anchor, DINEOF version, per-target input window and whether later-to-target inputs may participate; bind climatology/input lineage. Clarify the cell-method qualifier and L4/L3 metadata distinction. Do not substitute a different science-quality or three-sensor release.

Questions were prepared, not sent. Next work targets these remaining authority/compatibility gaps only. Consumer-aware history selection follows after they close; temporal arithmetic remains later. NOAA-current clarification remains externally pending and was not researched.

## Verification and preservation

New files only: this report, its JSON ledger, `backend/tests/sstChlorophyllTemporalSupport.test.js`, and `backend/tests/fixtures/sstChlorophyllTemporalSupportFixture.mjs`. The 13 focused tests exercise actual parser requests and retention, exact capture identity, existing Frame/sample validation, the restricted SST view and the already qualified test-only receipt boundary. Documentation collection preceded the network-blocked regression run. Synthetic metadata is not a real provider response or production reachability demonstration.

Historical availability-reference and current-vector failure-locality contracts remain QUALIFIED. Task 12B.6C and Task 9E-D remain PAUSED. Convergence/Ocean Physics remain quarantined. Numeric-string compatibility, provider-fill and legacy SST-coordinate gates remain unchanged. No environmental acquisition, provider contact, database/Auth/Supabase access, production change, history selector, metadata schema, capture/reference/archive change, storage/resolver implementation or scientific formula change occurred. Leave UNCOMMITTED; no staging, commit, tag, push or deployment.

Final verification: all **82 executed backend/shared regression scripts passed**, with network blocked. The focused SST/chlorophyll suite passed 13 tests; prior product-support 23; selection policy 25, availability reference 25, active provenance 13, assessment cutoff 17 and temporal primitives 100. Frame/archive, normalization, Opportunity/governance and Task 11E suites are included in the JSON run list. The existing quarantined candidateSemanticProjectionV3.test.js remained excluded from execution, preserved and syntax-checked. All **157 JavaScript syntax checks** and **150 JSON parses** passed. Whitespace and git diff --check passed. All **147 protected artifacts remain byte-identical**; four new files only, 151 untracked total, tracked/staged diffs empty, expected branch/HEAD retained. No staging/commit/tag/push/deployment.
