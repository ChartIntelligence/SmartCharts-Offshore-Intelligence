# PELORA-05 Stage 4 source-backed species claim/reference dossiers v1

DOCUMENTATION CANDIDATE — NO NEW SPECIES ENGINE OR SCIENTIFIC ADMISSION.

Prepared October 14, 2026 (America/New_York). Parent planning checkpoint: `4d0d5e15be7d03a4e11232e1d388137b9987701b`, `PELORA_05_Seven_Species_Evidence_Plan_v1.md`. Reuse the accepted c4bec910 claim review and the existing R1–R10 source/history decisions; this packet adds actual biological-source research, not another inventory. PELORA-05 owns this document and its dedicated source-register companion. PELORA-01 retains shared canon and implementation ownership. Nothing here edits shared canon or authorizes engine/scoring/eligibility/confidence/ranking changes.

## Research boundary and provenance

Newly accessed evidence consists of seven primary research-paper records/texts and two official NOAA document notices, through public browser research only. No environmental arrays, tagging dataset, provider API, Auth, private reports, email, database, downloads service or paid access was used. Author-hosted Mahi PDF was read through the browser, not installed or imported as a dataset. Article text and metadata access do not establish rights, availability or suitability of the underlying individual-level data.

The companion `PELORA_05_Seven_Species_Source_Register_v1.json` records exact DOI/URL, year/version, inspected sections, access limitations, short evidence anchors and per-record citation fingerprints. These fingerprints identify our frozen citation records, NOT upstream webpage/PDF bytes. Upstream document SHA-256 is NOT ESTABLISHED because no exact binary archive was acquired. Git context-source blobs are separately fingerprinted. Retain this distinction when PELORA-04 checks references.

Only primary publisher/journal or author/institution-hosted original research is used for biological claims. Search aggregators, Wikipedia, ResearchGate mirrors, third-party summaries and sources merely cited by a paper are not treated as reviewed primary evidence. Failed/limited access is recorded rather than filled by a summary. Founder statements are not blended into literature evidence.

## Common interpretation boundary

For each dossier, empirical observations are conditional on its sampled fish, sites, dates, tag design and analytical method. The proposed Pelora questions, counterexamples and validation prerequisites below are P05 inferences/design, not tested Pelora findings. Numbers describe study samples, never production thresholds. Occupied water-column depth is NOT bottom depth; environmental exposure is NOT preference corrected for habitat availability, spawning confirmation, fish presence prediction, capture probability or a ranking score.

Telemetry sampling and longline/recreational catchability are distinct. Tag fixes within a fish are correlated; days, measurements and publications are not independent fish. Tag loss, geolocation error, capture/release effects, selective deployment sites, unknown maturity and unobserved environmental availability can limit transfer. No universal uncertainty weight or minimum sample size is chosen. A primary paper does not qualify Pelora's chosen NOAA/Open-Meteo product or interpolation semantics.

## SP-BM — Blue Marlin / blue-marlin

**Source S-BM:** Kraus and Rooker (2007), DOI [10.18785/gcr.1902.11](https://aquila.usm.edu/gcr/vol19/iss2/11/), journal-hosted abstract and citation. Full-paper link failed; methods/table details were not reviewed.

**Literature claim CL-BM-01:** Gulf of Mexico Atlantic Blue Marlin (study label Makaira nigricans) showed surface-associated use with thermocline-dependent multimodal depth behavior in 18 PAT deployments; only two recovered tags supplied fine-scale records. The abstract describes variation among fish, time of day and water-column structure. Deployment season, size, sex and maturity cannot be established from the inspected abstract. Thus this is regional tagged-fish evidence, not all-life-stage or year-round habitat validation. Its stated feeding/capture-knowledge limit also prevents treating depth use as catch prediction. [S-BM](https://aquila.usm.edu/gcr/vol19/iss2/11/)

**Proposed question H-BM-01:** Can a declared surface-context claim remain truthful when vertical habitat information is unavailable? Independently validate the missing-depth limitation before extending habitat meaning.

**Counterexample/negative case:** same SST but differing thermocline profiles; do not assert equal whole-habitat state or fish absence from a surface-only gate.

**Next evidence:** P05 needs full primary methods and an independent Gulf individual-level depth/temperature reference with size/season/capture metadata; P01 must identify the exact existing habitat-rule citations and parents. BLOCKED for operational rule validation, not a reason to change existing Blue Marlin rules here.

## SP-YF — Yellowfin Tuna / yellowfin

**Source S-YF:** Hoolihan et al. (2014), DOI [10.1080/19425120.2014.935900](https://academic.oup.com/mcf/article/6/1/211/7737340), publisher article text: Abstract, Methods/Table 1, Results/Discussion.

**Literature claim CL-YF-01:** Thirty-one PSAT deployments in the northern Gulf during 2008–2011 sampled recreationally caught Yellowfin (Thunnus albacares) near petroleum platforms. Deployment dates in Table 1 span May, July, August and November, not uniform year-round sampling. Depth use differed by diel period and included deep excursions; most horizontal movements were relatively local but some were long-distance. Maturity was not independently established in this review. Methods reconstruct distributions from summarized data and interpolate missing surface-temperature values, limiting direct transfer to raw fixes or Pelora's no-fill boundary. [S-YF](https://academic.oup.com/mcf/article/6/1/211/7737340)

**Proposed question H-YF-01:** Separate a surface environmental-context claim from complete vertical suitability and platform residency.

**Counterexamples/negative cases:** tagging near a platform does not demonstrate attraction versus available habitat; a retained regional track does not establish permanent residency. Study-side reconstruction does not authorize Pelora gap filling.

**Next evidence:** independent platform/non-platform effort or telemetry with availability controls, diel depth support and capture uncertainty. Freeze fish-level holdouts and separately evaluate source comparability before any Yellowfin habitat policy. BLOCKED for preference/eligibility calibration.

## SP-BF — Blackfin Tuna / blackfin

**Source S-BF:** Fenton, Ellis, Falterman and Kerstetter, online 2014 / volume 2015, DOI [10.1007/s10641-014-0347-3](https://link.springer.com/article/10.1007/s10641-014-0347-3); publisher and author-institution abstracts/citation. Full subscription text was not reviewed.

**Literature claim CL-BF-01:** Ten Blackfin (Thunnus atlanticus), 71.1–86.4 cm fork length, were tagged after recreational capture in the northern Gulf in April 2012; nine survived their deployments. The short records describe predominantly shallow exposure with occasional deeper use. This is a spring, size-selected feasibility/habitat-use sample, not an annual distribution or physiological tolerance experiment. Maturity/stock-wide applicability is unestablished. The abstract itself uses both 18- and 19-day duration descriptions; this dossier does not silently resolve that discrepancy. [S-BF](https://link.springer.com/article/10.1007/s10641-014-0347-3), [institutional record](https://nsuworks.nova.edu/occ_facarticles/485/)

**Proposed question H-BF-01:** Test a Blackfin-specific surface-context claim without importing Yellowfin preferences or treating sampled exposure as an exclusion limit.

**Counterexample/negative case:** occasional deeper use defeats an always-shallow interpretation; spring tagging cannot establish winter absence. Do not count a post-release death as no-encounter effort.

**Next evidence:** full methods, tag/body-size effects and seasonal/size coverage in an independent Blackfin reference. BLOCKED for year-round thermal/vertical eligibility policy and confidence calibration.

## SP-MA — Mahi / mahi

**Source S-MA:** Merten, Appeldoorn, Rivera and Hammond (2014), DOI [10.1007/s00227-014-2464-0](https://doi.org/10.1007/s00227-014-2464-0); [author-hosted paper](https://beyondourshores.org/wp-content/uploads/2017/06/Merten-et-al.-2014c-Marine-Biology-full-citation-details.pdf), Abstract, Methods, Results/Table 1, Discussion.

**Literature claim CL-MA-01:** Six adult male Coryphaena hippurus from the western central Atlantic were analyzed across 2005–2011, with release dates in April–June and short tracks totaling about 83 days. Surface use coexisted with deeper excursions and diel differences; two lunar-phase records gave contrasting relationships. This male/size/time-selected sample does not establish female, juvenile or winter behavior. Proposed prey/feeding explanations in the paper are interpretations, not direct feeding measurements from these tags. [S-MA](https://beyondourshores.org/wp-content/uploads/2017/06/Merten-et-al.-2014c-Marine-Biology-full-citation-details.pdf)

**Proposed question H-MA-01:** Can a surface-context statement remain correctly limited by sex, life stage and diel vertical uncertainty?

**Counterexamples/negative cases:** not always at the surface; no universal lunar bonus from two contrasting records. This study does not validate a particular live weed line, floating object or its position.

**Next evidence:** independent sex/size/season-balanced reference and, for object-dependent hypotheses, exact timed object/encounter observations with non-object comparison and position uncertainty. BLOCKED for object/season/lunar rules; no new tracking or feed authorized.

## SP-SA — Sailfish / sailfish

**Source S-SA:** Lam et al. (2016), DOI [10.1038/srep38163](https://www.nature.com/articles/srep38163), publisher full text: Abstract, Results/Table 1/Figures 2–6, Discussion, Environmental parameters.

**Literature claim CL-SA-01:** Thirty-four tags deployed off Isla Mujeres in January 2012 and April 2013/2014 sampled adult Atlantic sailfish (paper label Istiophorus platypterus). Shelf-associated use and dispersal connected western Atlantic areas; failed reports/premature shedding limited coverage. Migration onset was not explained by SST alone; one seasonal area-use association involved modeled net primary productivity rather than equivalent SST/chlorophyll effects. The model used SST/chlorophyll plus mixed-layer depth, productivity and sea-surface-height products. This is not validation of Pelora's different product set or Gulf-wide season gates. [S-SA](https://www.nature.com/articles/srep38163)

**Proposed question H-SA-01:** Evaluate regional/diel context and distinguish measured SST from unrepresented vertical/productivity covariates.

**Counterexample/negative case:** a simple warm-water migration trigger is insufficient; reported use in one shelf area does not require applying Blue Marlin's candidate-depth boundary.

**Next evidence:** independent region/year fish-level validation, geolocation/retention uncertainty and exact covariate provenance. BLOCKED for reconstructed regional seasonal suitability or transfer of the paper's fitted associations into Pelora.

## SP-WM — White Marlin / white-marlin

**Source S-WM:** Hoolihan et al. (2015), DOI [10.1093/icesjms/fsv082](https://academic.oup.com/icesjms/article/72/8/2364/2458701), publisher text: Abstract, Material and methods/Table 1, Discussion.

**Literature claim CL-WM-01:** Forty White Marlin were tagged during 2007–2012 near Maryland, North Carolina and Aruba; 28 yielded useful data. Deployments intentionally targeted anticipated fall migration. Northeastern releases moved south while Aruba releases remained in the Caribbean; surface-associated exposure did not exclude deep excursions. Light-based positions were corrected using SST and bathymetry. Title taxon Kajikia albida and the abstract's Kajika spelling are preserved as a source discrepancy, not a new taxonomic decision. Size was visually estimated; maturity/general life-stage coverage is unestablished here. [S-WM](https://academic.oup.com/icesjms/article/72/8/2364/2458701)

**Proposed question H-WM-01:** Validate region-conditioned thermal/vertical meaning without copying Blue Marlin response or fitting a global fall switch.

**Counterexample/negative case:** different release-region patterns defeat a universal calendar rule. SST used to estimate track position creates dependence if the same SST is later called independent habitat validation.

**Next evidence:** taxon/identification reconciliation, independent Gulf coverage and geolocation uncertainty with source-independent checks. BLOCKED for Gulf policy transfer and calibrated species comparison.

## SP-WA — Wahoo / wahoo

**Source S-WA:** Theisen and Baldwin (2012), DOI [10.1007/s00227-012-2010-x](https://link.springer.com/article/10.1007/s00227-012-2010-x), publisher Abstract/citation; full subscription methods not reviewed.

**Literature claim CL-WA-01:** Four Acanthocybium solandri tagged in 2006 near eastern Florida provided 198 combined tag-days. Most recorded time was in shallower water, but three fish regularly visited deeper than 200 m, and diel depth distributions differed. Deployment months, sex/maturity and handling/geolocation details were not resolved from the abstract. Four fish are not 198 independent animals or all-region/all-season evidence. [S-WA](https://link.springer.com/article/10.1007/s00227-012-2010-x)

**Proposed question H-WA-01:** Separate vertical exposure from bottom-depth/reef association and from a seasonal habitat preference.

**Counterexample/negative case:** sampled time above 200 m is not a requirement for a shallow seabed; deeper excursions invalidate a hard occupied-depth exclusion. No Place reputation or catch-density bonus follows.

**Next evidence:** full methods and independent Gulf seasonal fish-level reference, with terrain association evaluated against availability rather than asserted from tags. BLOCKED for terrain/thermal/seasonal policy or confidence calibration.

## Official habitat context, not a new boundary rule

**S-EFH17:** NOAA's [2017 Amendment 10 page](https://www.fisheries.noaa.gov/action/amendment-10-2006-consolidated-hms-fishery-management-plan-essential-fish-habitat) describes updating HMS habitat boundaries using species-dependent information/methods. **S-EFH24:** NOAA's [April 18, 2024 review notice](https://www.fisheries.noaa.gov/action/essential-fish-habitat-5-year-review) records that further habitat-description/designation updates were warranted and Amendment 17 was initiated. Only these notices were reviewed; their linked full assessments, spatial polygons and any later final designation were not adjudicated. Therefore a 2017 citation is not proof of current polygon authority or fine-scale habitat suitability. No fishing regulation advice, legal boundary update, source acquisition or alteration of the existing Blue Marlin candidate boundary is made here.

## Claim-to-input matrix and validation design (proposed P05 interpretation)

| Claim ID | Proposed Pelora quantity to validate | Required reference/input gap before an experiment can support it |
|---|---|---|
| CL-BM-01 / H-BM-01 | Limited surface-context compatibility versus whole-water-column claim | Full primary methods; independent matched vertical/thermal references; exact current Blue Marlin parent/configuration lineage |
| CL-YF-01 / H-YF-01 | Diel surface-context limitation; platform context versus residency | Depth and habitat-availability comparison outside selected capture sites; exact gear/effort and source-product support |
| CL-BF-01 / H-BF-01 | Blackfin-specific context outside a short spring size-selected sample | Full methods/duration clarification; independent other-season/size references; distinct taxonomy/effort |
| CL-MA-01 / H-MA-01 | Sex/life-stage/diel scope; any separately declared object association | Independent female/juvenile/season coverage; timed object/non-object evidence for object hypothesis |
| CL-SA-01 / H-SA-01 | Region/diel context conditional on actually represented covariates | Independent year/region tracks; correct product mapping; absent model covariates cannot be replaced by available SST/chlorophyll |
| CL-WM-01 / H-WM-01 | Region-conditioned species context, not uniform season or cross-marlin transfer | Gulf references and identification authority; SST/geolocation dependence accounting |
| CL-WA-01 / H-WA-01 | Vertical-use versus terrain/season inference | Full methods and independent Gulf seasonal sample with availability/terrain correspondence |

For all rows, the experiment is BLOCKED for operational biological-policy validation until references and scope are adequate and the validation protocol is independently approved. These statuses do not disable an existing qualified feature or create runtime admission enums. Literature-supported motivation is not engine qualification.

Before execution, freeze source-compatible represented support, trip or telemetry coordinates and uncertainty, exact dataset/run/revision/receipt authority, reference individuals/effort episodes and exclusion reasons. Use an independent reference not generated by Pelora's score or the same fitted paper; separate development from held-out fish, trips, seasons/regions and shared source/revision groups. Do not claim that nonoverlap proves independence. Data-access/permission/licensing and ethical reuse require a later approved acquisition step; no raw reference dataset has been acquired in this task.

Measured outcomes must correspond to the declared question: exposure/availability mismatch, habitat-context agreement and scope failures are different from encounter/catch outcomes. State reference error and false-support/false-exclusion consequences before proposing tolerances. Actual encounter validation needs species-confirmed events and explicit meaningful no-encounter effort, not empty/default reports; no-encounter is not verified absence. Acceptance criteria and uncertainty calibration need scientific approval before holdout evaluation. No numbers or confidence weights are chosen here.

Pelora input admission stays with R1–R5/R7/R10: Open-Meteo model-valid SST comparability, NOAA geostrophic current support/uncertainty, separate DIRECT and GAP_FILLED chlorophyll support/deployment, exact scientific terrain parents, cutoff possession and consumer-specific adequacy. The papers' different products/methods do not close those gaps. No chlorophyll-to-prey, current-to-aggregation, current derivative, observed physical trajectory or source-grid-to-independent-resolution qualification is granted. Receipt integrity and P3-A/R9 software qualification remain separate.

### Required retained payload bindings, before any biological validation

All seven packets require the same exact-parent envelope, not a value-only table: species/stock/life-stage claim and region scope; candidate/sample role and layout; requested and provider-resolved coordinates/CRS; original native values/components/units/quality/missing reason; product and exact run/revision or explicit unknown; represented target/support; actual acquisition/retention/receipt references; explicit assessment and cutoff; selector/configuration/interpreter versions; independent reference identity, uncertainty and dependence group. Present conditions cannot repair missing historical evidence. A native field or display-source ID is not automatically an admitted candidate-neighborhood parent.

| Species packet | Environmental/static payload requirements specific to the proposed question | Historical/reference binding required |
|---|---|---|
| SP-BM | Preserve existing SST spatial structures, current component/neighborhood lineage, selected chlorophyll source/layer state, candidate-bound bathymetry and exact existing knowledge/profile/rule revision. Do not project only central scalars. | Exact original Blue Marlin evaluation/eligibility/adequacy parents, original cutoff and frozen selected history; independently matched depth profiles if expanding the stated surface-context limitation. |
| SP-YF | Source-specific SST/current parents; distinct DIRECT/GAP_FILLED records where a declared optical quantity is tested; exact platform/context geometry/status if used; missing depth/availability reference stays explicit. | Independent fish/effort episode and actual time/location, platform versus available-habitat comparison scope; no historical residency inferred from one capture point. |
| SP-BF | Blackfin-specific reference identification; actual sampled size/season authority; independently admitted thermal/vertical context rather than copied tuna scores. | Exact Blackfin fish/episode and release/evaluation times; do not borrow Yellowfin history or count repeated report/tag fixes as individuals. |
| SP-MA | Sex/life-stage reference fields; exact environmental support and, only for the separate object hypothesis, time-stamped object geometry/status/uncertainty. | No static catalog-to-moving-object substitution; retain actual diel/episode intervals and independently verified object/non-object context. |
| SP-SA | Region/diel sample correspondence; exact product identities for represented covariates and explicit unavailable fields for the paper's unrepresented inputs. | Fish-level region/year and track uncertainty; no inferred occupancy between locations or transfer from shelf use to bottom-depth admission. |
| SP-WM | Taxon/identification authority, regional sample roles and independent environmental-product provenance; record the location estimator's own environmental inputs. | Preserve geolocation/SST/bathymetry dependencies; do not present a reused estimator input as an independent validation reference. |
| SP-WA | Water-column exposure distinct from exact seafloor/static terrain parent; source-specific environmental support and unknown size/maturity/season details. | Separate individuals from tag-days; independent Gulf reference with actual timing/coverage before a regional temporal/terrain claim. |

If these bindings fail, only a documentary source-literature comparison is possible, not a successful environmental or biological experiment. Source-integrity software checks and a frozen oracle can pass without a habitat claim passing. Missing primary methods, incomplete reference coverage and unknown product comparability are distinct gates, not numeric confidence penalties. P01's separate source-contract architecture mapping must reconcile actual consumer interfaces before an implementation packet; this document does not create an adapter/schema or assert that the existing interfaces already carry every required fact.

## Founder hypotheses, Places and architecture

Founder observations H-FOUNDER-{species} remain a separate unfilled registry: actual wording, location, season, effort, species identification and uncertainty are UNKNOWN until provided. A similar literature pattern is not confirmation of the unspecified observation. No month switch, score bonus, gate or rank policy follows from founder experience or the studies above. Register a falsifiable question, alternative explanations and independent reference before comparison; report contrary results as well as support.

Use a species-neutral core for provenance, immutable as-used clocks, missing states, private owner binding, units/CRS, declared candidate sets and replay. Keep species/stock/life-stage interpretation and regional sampling, source support, season/terrain applicability and taxonomic mapping in explicit versioned adapters. These seven studies do not establish globally transferable response curves. Do not remove existing Blue-Marlin-only guards merely to claim generic architecture.

Governed Gulf Places need exact geometry/datum/status/source identity; display/species-context visibility is not biological validation or Opportunity eligibility. Static object existence does not establish a moving feature's location. Terrain relations require an availability-based reference, not catch concentration or a contour on a map. No new Places import or source download is authorized.

## P04 independent review and next bounded work

PELORA-04 must independently check DOI/title/sections/access scopes and citation fingerprints; distinguish article text from abstract-only findings and author inference; inspect sampled individuals/dates and reference uncertainty; review taxon/stock/life-stage transfer and paired-geolocation dependencies; verify that no source claim became a numeric policy. Then review the proposed claim-specific protocol, real reference availability/permissions, dependence-aware validation and counterexamples before any execution/admission.

P05 next: obtain full-methods access or explicit limitations for S-BM/S-BF/S-WA through separately authorized research; reconcile taxonomic scope; specify one independently measurable habitat-context question per species with P04. P01 supplies exact existing engine/input/configuration identities and any later implemented repairs, avoiding obsolete STOP descriptions. P00 owns approval and implementation prioritization based on evidence readiness, not fishing popularity. Full methods alone cannot replace an independent validation dataset.

Nightly controlled shadow learning remains owner-private by default, retrospective at actual trip support and separated from production publication/ranking. Preserve immutable original assessments and separately identified later evidence, positive and explicit no-encounter semantics, unknown pairings and approved anonymous-sharing boundaries. No automatic weight/gate/habitat/confidence/rank update, scheduler/Receipt Writer activation or global learning from a consent boolean.

Only dedicated documentation/source-register artifacts are outputs. No runtime/application tests/imports, packages, providers, environmental arrays, database or schema changes. Git checkpoint/publication is documentation transport, not scientific execution or release. Original temporal manifests and frozen preview remain unchanged.

STAGE 4 SOURCE-BACKED DOSSIERS READY FOR INDEPENDENT SCIENTIFIC REVIEW

NO NEW SPECIES QUALIFICATION — NO SOURCE ADMISSION — CP-10 REMAINS BLOCKED.
