# Remaining SST / Chlorophyll Temporal Authority v1

Task 12B.7I. **REMAINING_SST_CHLOROPHYLL_TEMPORAL_AUTHORITY_PARTIALLY_QUALIFIED.** Qualification only; no complete historical eligibility or implementation approval.

| Product | Preserved qualification | This review's disposition |
|---|---|---|
| Open-Meteo SST | INSTANT MODEL-VALID-STATE | OPEN_METEO_SST_CONSUMER_PROVENANCE_CONTRACT_REQUIRED; response-bound provenance remains missing |
| DIRECT chlorophyll | DAILY MAPPED/COMPOSITE | DIRECT_CHLOROPHYLL_PROVIDER_CLARIFICATION_REQUIRED for exact support bounds |
| GAP_FILLED chlorophyll | Provider reconstruction | Documented operational input window newly clarified; GAP_FILLED_PROVIDER_CLARIFICATION_REQUIRED for exact target bounds and deployment binding |
| NOAA currents | Existing externally pending result | PENDING_NOAA_SME; not reviewed |

The [machine-readable ledger](Remaining_SST_Chlorophyll_Temporal_Authority_v1.json) contains all 16 unchanged active-consumer bindings, source/code authorities, exact questions, preservation hashes and verification details. All earlier qualifications remain preserved. No product becomes fully history-qualified in this review.

## A. Open-Meteo: provenance and consumer contract

**PELORA CODE FACT.** `getSeaSurfaceTemperaturePoint` (`backend/server.js:6173`) requests `https://marine-api.open-meteo.com/v1/marine` with latitude, longitude, `cell_selection=sea`, `current=sea_surface_temperature`, `timezone=UTC`. `getMarineConditions` (`:7204`) requests the same variable alongside wave/swell fields. Neither selects a model/run, historical mode, initialization or revision. `timeformat` is omitted. Both preserve `current.time` as `observedAt`, temperature and broad forecast-model source classification. The point path preserves `marine-current-block-valid-time`; neither preserves an upstream model/run/release.

**PROVIDER FACT.** [Marine documentation](https://open-meteo.com/en/docs/marine-weather-api) identifies default Best Match selection. The [API schema](https://raw.githubusercontent.com/open-meteo/open-meteo/main/openapi/marine.yml) makes model choice optional and defaults time formatting to ISO8601. Its response properties do not establish exact model-run attribution. `generationtime_ms` is computation duration, not model initialization or receipt. No actual environmental response was acquired to make a stronger claim about live undocumented fields.

**PROVIDER IMPLEMENTATION FACT.** The [public controller](https://raw.githubusercontent.com/open-meteo/open-meteo/main/Sources/App/Controllers/ForecastapiController.swift), marine route and `marine_best_match` branch, selects automatic readers including `mfsst`. This narrows the family evidence; it does not prove a particular deployed response's provenance. General geographic Best Match behavior must not be inflated into proof that SST switches models geographically or blends all wave sources. Same-valid-time run replacement remains possible under the already reviewed run-dependent downloader. Actual model replacement in Pelora data is not demonstrated.

**NEW LIMIT CLARIFIED.** [Model-update documentation](https://open-meteo.com/en/docs/model-updates) separates initialization, conversion completion and API availability, and warns of server update differences. A later query for latest model status cannot authenticate the run that supplied an earlier value. No metadata API was queried.

**IDENTITY RESULT.** Synthetic inputs through the actual parser prove two different cases:

- Different run/model labels, equal scientific fields: identical normalized object and capture. Upstream attribution is lost.
- Same location/time, different temperatures: distinct exact scientific digests and references. Exact content is distinguished, but neither reference explains which run produced it.

This is not a collision of different captured numeric content. Existing Frame product-version fields and capture lineage references can distinguish authority when supplied; they cannot recover omitted facts. Tests establish structural compatibility only, not a trustworthy receipt issuer or provenance resolver. No capture successor or exact-model-selection mandate is demonstrated necessary.

**CONSUMER DECISION.** All ten SST-dependent active consumers remain `PROVENANCE_REQUIREMENT_UNRESOLVED`. Current code has value/time or inherited-feature requirements; absence of a model-run check does not qualify `VALUE_AND_VALID_TIME_ONLY`. Existing science does not choose among exact-run, stable-family or value/time-only requirements. The previously qualified synthetic SST view is restricted to direct-observation evidence and cannot be silently broadened to model output.

**VERDICT: OPEN_METEO_SST_CONSUMER_PROVENANCE_CONTRACT_REQUIRED.** Secondary: `OPEN_METEO_SST_REFERENCE_METADATA_REQUIRED` where exact upstream attribution is needed. Keep the instant model-valid-state result locked. Determine consumer authority before deciding whether a request or metadata change is warranted.

## B. DIRECT: exact support bounds

**EXACT PRODUCT.** NOAA CoastWatch `noaacwNPPVIIRSchlaDaily`, S-NPP VIIRS near-real-time global nominal 4km mapped chlorophyll. Production requests `chlor_a[(last)][(0.0)][(latitude)][(longitude)]` at `https://coastwatch.noaa.gov/erddap/griddap/noaacwNPPVIIRSchlaDaily.json` (`server.js:2045`). This is not the science-quality product or an L2 swath.

**AUTHORITATIVE DOCUMENTATION REVIEW.** The [NRT product description](https://coastwatch.noaa.gov/cwn/products/noaa-msl12-ocean-color-near-real-time-viirs-single-sensor-snpp-and-noaa-20.html) separates daily merged global mapped L3 from granules. [Exact endpoint attributes](https://coastwatch.noaa.gov/erddap/info/noaacwNPPVIIRSchlaDaily/index.html) name `baseline_bounds` but do not expose its values; the L3 title and L2 processing attribute disagree. Dataset-wide coverage describes the collection, not each sample. The linked ISO metadata request was unavailable and supplies no additional authority here.

The linked [VIIRS ATBD §1.2](https://www.star.nesdis.noaa.gov/sod/mecb/color/documents/ATBD_VIIRS_OC_v1.0_June2017_f2.pdf) scopes SDR-to-EDR algorithms. It did not establish this endpoint's UTC composite endpoints. Its 24-hour PAR definition is for a different quantity. The [science-quality filename documentation](https://oceanwatch.noaa.gov/cwn/products/noaa-msl12-ocean-color-science-quality-viirs-snpp.html) gives L2 acquisition-start naming, not an NRT L3 bounds rule. Neither is transferred to this path.

Targeted searches covered exact dataset, UTC day/start/end, nominal/noon labels, compositing, filenames and mapped-product construction. No located primary rule closes the endpoint's exact bounds. This records the research boundary, not a claim that no unpublished provider rule exists.

**BOUNDS: PROVIDER_CLARIFICATION_REQUIRED.** `observedAt` retains the product row coordinate only. No midnight-to-midnight interval, noon ±12 hours, pixel pass time or filename-derived interval is qualified. `CURRENT_METADATA=INSUFFICIENT`; retained fields do not bind immutable support metadata or a versioned reconstruction rule. Legacy support remains insufficient; no backfill.

All eleven DIRECT-dependent consumer bindings remain `PRODUCT_SUPPORT_UNRESOLVED`. Their timestamp-oriented inputs do not prove interval/composite scientific compatibility. Once bounds authority is established, `CONSUMER_SUPPORT_CONTRACT_REQUIRED` remains separate from lookback/gap/revision/freshness policy.

**VERDICT: DIRECT_CHLOROPHYLL_PROVIDER_CLARIFICATION_REQUIRED.** DAILY MAPPED/COMPOSITE stays qualified.

## C. GAP_FILLED: target and operational input authority

**EXACT PRODUCER.** `nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily` at the existing PFEG ERDDAP endpoint (`server.js:2168`). NOAA's ocean-color team reconstructs the product; CoastWatch converts/distributes it. Pelora fetches it and does not run DINEOF. Capture retains dataset/platform, `algorithm=DINEOF`, `observationType=gap-filled-reconstruction`, experimental status and reconstruction classification. It does not retain deployed algorithm version, contributing observations, window bounds or per-content generation authority.

**NEW PRIMARY AUTHORITY.** The [operational account by Liu and Wang](https://eos.org/science-updates/filling-the-gaps-in-ocean-maps), linked by the exact provider page, explicitly describes target-day plus preceding 29-day inputs. This qualifies the documented two-sensor NRT trailing-window configuration; it is not an invented consumer lookback. Current per-content deployment binding and exact UTC target bounds remain unresolved.

The [exact product page](https://coastwatch.noaa.gov/cwn/products/noaa-msl12-ocean-color-near-real-time-viirs-multi-sensor-snpp-noaa-20-chlorophyll-dineof.html) also identifies monthly climatology and merged daily inputs. Its MSL12 input-processing version is not a DINEOF release. [Endpoint metadata](https://coastwatch.pfeg.noaa.gov/erddap/info/nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily/index.html) leaves processing version unspecified. The prior CF interval-qualifier limitation remains locked: input sampling spacing does not define target cell bounds.

| Temporal/provenance fact | Result |
|---|---|
| Output target | Daily reconstructed image/state; UTC extent and coordinate anchor unqualified |
| Documented daily-input window | Target plus 29 preceding daily images; no later daily image in that described operational procedure |
| Current exact deployment | No immutable revision-to-configuration binding retained |
| Other source support | Climatology remains separate; not reduced to the trailing daily window |
| Weighting | DINEOF uses spatio-temporal structure; no fixed linear time weights asserted |
| Receipt | Independent content-bound authority; target time cannot prove possession |

The [2019 primary paper](https://repository.library.noaa.gov/view/noaa/45215/noaa_45215_DS1.pdf) is now available from NOAA's repository; it describes a study block and is not used as the operational alignment rule. The [2020 NOAA presentation](https://www.star.nesdis.noaa.gov/star/documents/NOCCG/2020/20200603_xiaomingLiu.pdf) corroborates multi-time processing. Neither supplies an immutable current deployment identifier.

**LOOKAHEAD/REVISION INTERPRETATION.** The newly located operational account does not justify claiming routine later-target daily inputs. It also does not prove when Pelora possessed an output. Processing, delayed source availability and revised inputs can separate target support from acquisition. Changed inputs/configuration may change a reconstruction; no actual revision occurrence, weighting policy or revision preference is claimed. Future eligibility still requires exact reconstructed content bound to trustworthy receipt by assessment.

Required authority must distinguish output reference, target support, input identities/support or a version-bound window rule, algorithm/configuration, climatology lineage and receipt. These are logical provenance requirements, not a storage/schema design. Equal concentration/time must not collapse DIRECT and GAP_FILLED.

All eleven GAP_FILLED-dependent bindings remain `PRODUCT_SUPPORT_UNRESOLVED`, followed by consumer support-contract review. The documented window does not close output bounds or establish DIRECT equivalence.

**VERDICT: GAP_FILLED_PROVIDER_CLARIFICATION_REQUIRED.** Secondary: `GAP_FILLED_REFERENCE_METADATA_REQUIRED`. Newly qualified sub-result: `DOCUMENTED_NRT_INPUT_WINDOW_QUALIFIED`; exact temporal authority is not fully qualified.

## Active consumer bindings

Each row is separately represented in JSON with module/function, source span/hash, input, output and downstream consumers. Product lists describe possible required parents, not a claim that every invocation requires every family. No NOAA-only consumer body was reviewed.

| Active consumer | Relevant product(s) | Requirement/compatibility result |
|---|---|---|
| buildOceanChangeAnalysis | SST, DIRECT, GAP_FILLED | SST provenance unresolved; chlorophyll support unresolved; actual parent subset applies |
| buildOceanChangeFromTimeSeries | SST, DIRECT, GAP_FILLED | Same inherited limits |
| buildPersistenceEvidence | SST, DIRECT, GAP_FILLED | Same inherited limits |
| buildSeaSurfaceTemperaturePersistence | SST | PROVENANCE_REQUIREMENT_UNRESOLVED; consumer model-state contract required |
| buildCurrentPersistence | NOAA current | PENDING_NOAA_SME; untouched |
| buildCurrentEdgePersistence | NOAA current | PENDING_NOAA_SME; untouched |
| buildCurrentShearPersistence | NOAA current | PENDING_NOAA_SME; untouched |
| buildCurrentConvergencePersistence | NOAA current | PENDING_NOAA_SME; untouched |
| buildEnvironmentalTransitionPersistence | SST, DIRECT, GAP_FILLED | SST provenance unresolved; chlorophyll support unresolved |
| buildSurfaceWaterCharacterPersistence | SST, DIRECT, GAP_FILLED | Same inherited limits |
| buildWaterMassPersistence | SST, DIRECT, GAP_FILLED | Same inherited limits |
| buildMixingZonePersistence | SST, DIRECT, GAP_FILLED | Same inherited limits |
| buildOceanFrontPersistence | SST, DIRECT, GAP_FILLED | Same inherited limits |
| buildProductivityPersistence | DIRECT, GAP_FILLED | Exact target support unresolved; no equivalence qualified |
| buildClarityPersistence | DIRECT, GAP_FILLED | Exact target support unresolved; no equivalence qualified |
| buildTemporalFeatureContinuity | SST, DIRECT, GAP_FILLED | Inherited authority plus existing feature-specific contract; no policy invented |

The two documentary and nine unwired consumers remain isolated. Reading input requirements and preserving existing mappings does not reopen temporal arithmetic, current science or convergence.

## Minimum remaining questions and next gate

1. **Open-Meteo:** what response-bound exact SST dataset/run/release identifier is available, and what authoritative source-selection guarantees apply? Separately, **Pelora science** must decide which provenance level each SST consumer needs and how model evidence fits its contract.
2. **DIRECT provider:** what are `time`/`baseline_bounds` semantics, exact UTC endpoints/inclusivity, contribution period and immutable product-version rule? Resolve the mapped-level metadata discrepancy.
3. **GAP_FILLED provider:** what are exact target support/anchor and the immutable binding of deployed revisions to the now-documented trailing input configuration, including climatology and delayed/revised inputs?

No provider was contacted. Next gate targets only those remaining authority/compatibility questions. Preserve the qualified operational-window result; do not repeat prior time/category reviews. NOAA remains externally pending. Consumer selection follows authority; arithmetic follows eligible selection. No implementation is authorized by this report.

## Verification and preservation

Four new files only: this report, its JSON ledger, `backend/tests/remainingTemporalAuthority.test.js`, and `backend/tests/fixtures/remainingTemporalAuthorityFixture.mjs`. Fourteen focused tests passed through actual parsers, exact captures/references and existing temporal primitives/receipt fixtures. Synthetic metadata proves retention/identity behavior, not live provider occurrence or production-history eligibility. No temporal consumer arithmetic runs in the focused suite.

All 151 pre-existing untracked artifacts were hashed before work. Final results are appended below and in JSON. Expected branch/HEAD remain binding. Task 12B.6C and Task 9E-D remain PAUSED; availability and current-vector contracts remain QUALIFIED; convergence/Ocean Physics and NOAA-current review remain untouched. Numeric-string/provider-fill/legacy-SST-coordinate gates remain OPEN. No environmental acquisition, provider messaging, database/Auth/Supabase access, runtime changes, history selector, history rewrite, staging, commit, tag, push or deployment. Leave UNCOMMITTED.

Final verification: all **83 executed backend/shared regression scripts passed**, with network blocked. The focused remaining-authority suite passed 14 tests; prior SST/chlorophyll support 13; prior product-support 23; selection policy 25, availability reference 25, active provenance 13, assessment cutoff 17 and temporal primitives 100. Frame/archive, normalization, Opportunity/governance and Task 11E suites are included in the JSON run list. The existing quarantined candidateSemanticProjectionV3.test.js remained excluded from execution, preserved and syntax-checked. All **159 JavaScript syntax checks** and **151 JSON parses** passed. Whitespace and git diff --check passed. All **151 protected artifacts remain byte-identical**; four new files only, 155 untracked total, tracked/staged diffs empty, expected branch/HEAD retained. No staging/commit/tag/push/deployment.
