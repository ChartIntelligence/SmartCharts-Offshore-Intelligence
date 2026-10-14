# PELORA-05 seven-species scientific evidence plan v1

DOCUMENTATION CANDIDATE — NOT SPECIES QUALIFICATION, IMPLEMENTATION OR SOURCE ADMISSION.

## Scope, identity and ownership

Prepared October 14, 2026 (America/New_York). This is the bounded evidence-planning successor to PELORA-05's accepted scientific claim-boundary review of `c4bec910ad0500d333ef4d89bc727e38f9186c07`. It does not reopen that review, repeat FLOW review, change canon or authorize science/runtime implementation. PELORA-05 owns only this dedicated document. PELORA-01 retains shared canon, integration and runtime ownership; coordinate any later shared-document or code change through PELORA-00/01. No shared file is edited by this packet.

Candidate baseline: `c4bec910ad0500d333ef4d89bc727e38f9186c07`. The documentation branch is rooted at that exact commit without merging other implementation lineages. Its parent amendment, current science/privacy/release contracts and the already-reviewed source-science ledger are reused. The author's checkout remains an older separate lineage; missing files there are not regressions. No deployed source, database, private reports, provider response, email, external primary biology publication or new environmental dataset was accessed. External-request coverage is NOT VERIFIED. Biological relationships below are proposed questions, not new empirical findings.

## Canonical engine identities and evidence meaning

| Packet | Canonical target / existing mission ID | Existing evidence at the review baseline |
|---|---|---|
| SP-BM | Blue Marlin / blue-marlin | Existing governed Blue Marlin request/evaluation path and current startup availability. This does not qualify full historical/shared/operational beta science. |
| SP-YF | Yellowfin Tuna / yellowfin | Existing canonical target and disabled startup option; equivalent enabled governed engine not established. |
| SP-BF | Blackfin Tuna / blackfin | Same target-only boundary; no Yellowfin equivalence inferred. |
| SP-MA | Mahi / mahi | Same target-only boundary. |
| SP-SA | Sailfish / sailfish | Same target-only boundary. |
| SP-WM | White Marlin / white-marlin | Same target-only boundary; no Blue Marlin equivalence inferred. |
| SP-WA | Wahoo / wahoo | Same target-only boundary. |

The list is exactly the seven targets in the product-constitution beta addendum and `frontend/src/components/PeloraStartupFlow.jsx` SPECIES_OPTIONS at the candidate baseline. UI flags, report species counters, legacy spot scores and `preyEngine.js` heuristics do not establish qualified species science. Before a biological dossier is admitted, resolve common-name-to-taxonomic/stock/life-stage scope from authoritative evidence rather than guessing scientific names or transferring another species' profile.

For every engine distinguish: (a) measured/modelled/reconstructed environmental state; (b) species-specific habitat compatibility conditional on admitted inputs; (c) adequately supported environmental exclusion; (d) Opportunity eligibility through the governed gate; (e) ranking among eligible candidates. These are separate claims. Habitat compatibility never becomes verified fish presence, encounter probability, catch probability or guaranteed success. Insufficient evidence is not an adequate negative conclusion; a finite score cannot grant eligibility. No species-specific environmental threshold, confidence weight or rank formula is selected here.

## Reusable repository authority and source prerequisites

All paths below are at the candidate baseline unless a separate exact checkpoint is stated. These repository contracts were inspected or reused from the preceding fixed-reference reviews; references to external literature inside them remain recorded findings, not publications newly read in this mission.

| Evidence requirement | Existing source/contract and boundary | Evidence needed before species consumption |
|---|---|---|
| Thermal state and spatial context | Open-Meteo marine sea_surface_temperature; `getSeaSurfaceTemperaturePoint`, `getMarineConditions`, existing SST spatial composition in backend/server.js. P3 R1 and SST provenance/binding review. | Exact response/sample/run or approved source-equivalence authority; surface/model meaning; requested/resolved correspondence; represented support and uncertainty. A temperature value is not a qualified species thermal preference. |
| Current state/context | NOAA noaacwBLENDEDNRTcurrentsDaily; existing point/vector captures and current adapter; P3 R2, NOAA current metadata qualification v2. | Exact field/revision/time/sample roles and valid spatial scale. It is mapped geostrophic evidence, not total current. OI support, effective resolution and uncertainty remain unresolved as recorded. No new convergence/shear/trajectory admission. |
| DIRECT chlorophyll | NOAA noaacwNPPVIIRSchlaDaily; P3 R3 and remaining temporal-authority/binding reviews. | Exact support/processing/vintage, quality and no-pixel state; separate evidence for any productivity, optical or prey interpretation. |
| GAP_FILLED chlorophyll | NOAA nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily; P3 R4. | Reconstruction target/configuration/contributor/climatology authority and uncertainty, separately from DIRECT. No pooling, independent corroboration or equivalence by convenience. |
| Terrain/static candidate context | Candidate-bound water-mask elevation/static catalog evidence; `backend/bathymetryEvidence.js`, habitat eligibility and `docs/Governed_Places_v1.md`. Display ETOPO_2022_v1_60s is a separate field product. | Exact scientific parent/catalog/version/datum/sample and species-use rationale. A displayed contour, a famous Place or a static depth label is not automatically the candidate's admitted bathymetric parent. Nominal grid spacing is not observational resolution/accuracy. |
| Other context already returned | Existing wind/wave/swell/moon/context fields only where actually consumed under an existing contract. | Document whether descriptive, operational-access or biological evidence. Do not turn moon phase or incidental metadata into a new habitat/scoring feature. |
| Unrepresented biological/depth variables | No admitted prey census, species observation, subsurface temperature/oxygen profile or drifting-structure history is supplied by the scalar families above. | If a proposed species claim needs these, mark REQUIRED_REFERENCE_UNAVAILABLE and narrow/block that claim. This plan does not authorize a new provider or fabricate a proxy. |
| Temporal/history authority | P3 R5/R7/R10; explicit scientific assessment; P3-A cutoff/frozen-input boundary; R9 local derived-finiteness repair. | Approved consumer-specific support, comparability, gap/dependence/adequacy and exact spatial parents. Cutoff repair and arithmetic qualification do not establish those scientific policies. |
| Outcome/reference authority | Fishing capture/temporal/spatial/association-readiness contracts; owner history and governed observations. | Actual trip time/location and exact report revision; taxonomy, effort and observation method; explicit meaningful no-encounter affirmation; independently validated outcomes where the claim needs them. Default zeros and blank reports are not negative evidence. |

NOAA and Copernicus remain separate product authorities. No imported qualification, inferred support bounds, independent samples from repeated publication, source-age reset, missing-to-zero conversion or present-condition substitution is permitted.

## Per-engine evidence and validation packets

Each packet must produce a claim-to-input dependency table, primary-biological-evidence dossier, independent-reference specification, preregistered comparison/negative cases, uncertainty statement, proposed permitted wording and an admission decision for each claim. Existing qualified serialization/replay mechanics may be reused; biology/source equivalence may not. Quantitative acceptance criteria must be approved before held-out evaluation; no production parameters are chosen by this plan.

### SP-BM — Blue Marlin

- Proposed bounded target: validate the existing conditional thermal/current/surface-water/terrain habitat interpretation and its adequate-exclusion/eligibility meaning, not invent a new engine or claim universal habitat.
- Required existing parents: the exact species knowledge/profile and rule/configuration revision; complete SST/current/chlorophyll provenance, quality/layer states and required neighborhood structures; candidate-bound terrain/structure parent; explicit assessment and exact historical parents for temporal claims. Central scalar equality alone is insufficient.
- Biological/reference gap: identify the primary evidence and applicability behind each existing preference/rule, and independent taxon-confirmed matched habitat/use observations with observation uncertainty and effort/selection bias recorded. Existing numerical code is the software baseline, not independent validation. No such reference dataset was reviewed here.
- Experiment: first prove exact retained-input/current-composition equivalence under the existing governed producers and all availability states; then compare the declared habitat meaning with independently matched observations in held-out time/space/product conditions. Repeated same-source cycles count once as environmental support. Report environmentally adequate exclusion separately from lack of encounter.
- Negative cases: missing neighborhood with unchanged scalar; identical values but different unavailable source/layer state; DIRECT/reconstruction substitution; stale/future/late-possession parents; conflicting same-target revisions; unqualified static parent; finite derived overflow; valid habitat context without any reported fish. Existing Gulf 200 m candidate-search rule is not a fish-absence boundary and must not transfer to another species/region.
- Admission/priority gate: use this as the first exact-input reference packet because a governed producer exists. Do not equate a preserved request result or controlled retained composition with shared operational admission or complete beta qualification.

### SP-YF — Yellowfin Tuna

- Proposed bounded target: define and validate a Yellowfin-specific environmental habitat-context claim before building eligibility or ranking. Surface proxy suitability, any depth relevance and prey-related interpretation must be declared as separate hypotheses, not assumed biological facts.
- Required evidence: separately admitted thermal/current and DIRECT/GAP_FILLED context where justified; exact terrain/Place parent only if a primary species claim requires it. Obtain primary Yellowfin-specific biological/stock/life-stage and observation-method evidence. If the claim depends on subsurface conditions or prey availability, existing surface products cannot fill that requirement.
- Experiment/reference: prospectively specify the habitat quantity, then match independent taxon-confirmed observations and explicit species-targeted effort/no-encounter episodes to original trip support. Separate reporting/gear/access bias from the environmental association. Hold out dependent trips, source revisions and repeated field support by an approved design.
- Negative cases: a good Blue Marlin result with unknown Yellowfin evidence; legacy Yellowfin score or Place popularity with no admitted parents; high chlorophyll without independent productivity/prey authority; available surface data but a required depth variable missing; all-zero default species row.
- Admission/priority gate: Yellowfin identity and a species-specific evidence model must be approved before any numerical thresholds/engine enablement. Primary biology and suitable validation reference are currently UNREVIEWED/NOT ESTABLISHED; source admission remains independent.

### SP-BF — Blackfin Tuna

- Proposed bounded target: Blackfin-specific conditional habitat context; no inherited Yellowfin or generic tuna preference/eligibility.
- Required evidence: independent Blackfin biological scope, justified thermal/current/optical dependencies, and terrain/context only if the declared claim warrants it. Preserve exact effort, species identification and reporting uncertainty. No qualified prey-availability measurement is manufactured from tuna scores.
- Experiment/reference: matched Blackfin-specific observations/effort with an independent reference standard; evaluate misidentification and cross-species label leakage explicitly. Compare the declared Blackfin hypothesis, not copied Yellowfin outputs; any model comparison is a later controlled proposal, not authorization here.
- Negative cases: Yellowfin encounter relabeled Blackfin; shared tuna counter or second-hand report without scope; missing targeted effort; structural proximity presented as sufficient; same source/episode counted across multiple report revisions.
- Admission/priority gate: complete the independent species dossier and measurable endpoint before threshold or ranking discussion. No equivalent Blackfin governed pipeline/validation is established by its canonical label. Schedule this packet when its own references are adequate, not by transferring Yellowfin readiness.

### SP-MA — Mahi

- Proposed bounded target: independently define whether environmental context alone is the permitted claim, and whether any additional association with reported floating structure is justified. Structure relevance is a hypothesis, not a fact established by this plan.
- Required evidence: Mahi-specific biology/reference authority; admitted environmental parents; if structure context is required, exact object type/identity, observation time/location, positional uncertainty and fixed-versus-moving status. Static catalogs cannot establish the current position or continued existence of a moving object.
- Experiment/reference: independently matched species and environmental observations, stratified by the explicitly observed structure-context state versus unknown context. Do not infer structure absence from missing reports or infer movement from sequential nearby points. Any mobility claim requires an already governed association/reference, not new tracking.
- Negative cases: historic FAD/weed/object location presented as current; no timestamp; static Place substituted for moving structure; missing structure treated as species absence; reported encounter stages summed as separate fish; cloud-filled reconstruction portrayed as observed local productivity.
- Admission/priority gate: keep structure-dependent claims blocked where time/position authority is missing. A separately qualified environmental-only claim, if approved, cannot imply that the missing structure requirement was satisfied. No new feed or moving-feature algorithm is authorized.

### SP-SA — Sailfish

- Proposed bounded target: Sailfish-specific habitat-context meaning with separately justified terrain/depth and thermal/current dependencies; do not presume a shelf/coastal preference or particular season from the label.
- Required evidence: Sailfish taxonomic/stock/region/life-stage scope and primary biological basis; exact environmental and terrain/context parents for every proposed dependency. Resolve spatial support and environmental coverage near boundaries; no nearest valid offshore sample substitutes for a missing reported site.
- Experiment/reference: independent species-specific use/effort reference matched at actual time/location, with terrain-class and coverage sensitivity evaluated only after those classes are scientifically defined. Validate adequate exclusion separately from unobserved/unsupported habitat.
- Negative cases: applying Blue Marlin's Gulf candidate-depth boundary to Sailfish; tide/coastal/vertical effect asserted without data; generic billfish event treated as species-confirmed; coastal missing cells zero-filled; a regional seasonal story imposed as a global prior.
- Admission/priority gate: approve candidate-search meaning and reference applicability for Sailfish independently; unavailable required context blocks its dependent claim. No numerical depth/temperature/cadence criteria or new coastal provider is selected.

### SP-WM — White Marlin

- Proposed bounded target: a White-Marlin-specific conditional habitat interpretation, distinct from Blue Marlin compatibility and from general billfish observations.
- Required evidence: primary species/taxonomic/stock/life-stage scope; justified environmental/candidate/temporal dependencies; exact source revisions and uncertainty. Sharing serialization or environmental parents with Blue Marlin does not establish shared biological response.
- Experiment/reference: independently identified White Marlin reference observations with identification uncertainty and effort context retained; compare declared claims on held-out support, with an explicit check that outputs do not arise solely from label substitution into Blue Marlin configuration.
- Negative cases: ambiguous billfish identification; Blue Marlin positive treated as White Marlin validation; copied habitat threshold/rank; same event recorded under two species without reconciliation; sparse references presented as calibrated confidence; incomplete source support called adequate exclusion.
- Admission/priority gate: species-specific evidence and sufficient reference applicability must precede enablement. No shared marlin threshold or model-equivalence policy is approved. Common infrastructure may be qualified independently of biology.

### SP-WA — Wahoo

- Proposed bounded target: Wahoo-specific habitat context with any terrain/structure, seasonal, thermal or current relationship explicitly framed and validated, not inferred from canonical inclusion.
- Required evidence: independent primary Wahoo biological basis; admitted environmental parents; exact static/moving context if actually required; trip effort/method and identification authority. A named reef, contour or famous fishing location is context, not evidence of current suitability.
- Experiment/reference: validate the stated environmental quantity against independent Wahoo-specific reference observations/effort, retaining seasonal sampling, effort concentration and reporting bias. Assess added terrain/seasonal context only through a separately registered comparison, not an automatic score bonus.
- Negative cases: static-place reputation or catch density determines priority; unverified terrain datum/proximity; founder seasonal observation becomes a month switch; no reported catch treated as verified absence; stale optical/current data described as current habitat; duplicate trips inflate evidence count.
- Admission/priority gate: source/terrain correspondence, biological relevance and temporal applicability need separate decisions before any Wahoo-specific thresholds or rank. Seasonal hypotheses remain unapproved even if a software experiment runs successfully.

## Species-neutral core versus adapters

| Shared core responsibility | Explicit adapter/governance responsibility |
|---|---|
| Exact source/reference serialization, immutable as-used evidence, time/cutoff/possession accounting, missing/failure states and privacy scopes | Product-specific support/quality/version/revision, actual source comparability and valid spatial scale; no universal freshness rule |
| Candidate identity, declared-universe accounting, units/CRS interfaces and exact sample-role references | Region-specific geometry/datums/static-catalog correspondence, product coverage/masks and qualified candidate-search policy |
| Habitat/adequacy/eligibility/ranking permission interfaces | Species-specific biological scope, required-input dependencies, permitted habitat interpretation and adequate-exclusion criteria |
| Replay, lineage, dependency-aware audit counts, explicit unknowns | Claim-specific independence/gap/coverage/uncertainty policy; numerical decisions require validation |
| Publication mechanism and owner-safe projection | Explicit configured species/region/evaluator capabilities; existing Blue-Marlin-only checks remain blocking until a reviewed extension is qualified |

Do not strip existing Blue Marlin constraints to make the architecture appear generic. Record the exact species-specific seam and require a separately reviewed extension, preserving baseline species outputs. Gulf is deployment/validation region one; U.S. Atlantic and later regions require evidence-transfer checks, not duplicated regional engines or automatic qualification. No hardcoded Gulf-only month/coordinate/Place assumptions enter the shared core.

Each species adapter must declare region applicability, out-of-domain/unsupported outcomes, input-role/unit expectations and policy/version references. Seasonal timing must use explicit region/time basis and applicable biology; calendar month alone is not evidence. Dateline, timezone and hemisphere cases belong in later controlled interface qualification, not invented biological policies.

## Seasonal observations and governed Places

Create hypothesis dossiers only when the actual founder observation is available: exact wording/source, species, reported time/season, geographic scope, event/effort context, uncertainty and alternative explanations. No specific observation, month, numerical preference or causal relationship was provided to this packet; those fields remain UNKNOWN. Founder authority establishes product direction, not an empirical threshold.

Preregister a question, intended environmental/biological quantity, admissible references, dependence/bias treatment and held-out comparison before evaluating a seasonal hypothesis. A retrospective association is not prospective skill or a production rule. Do not use private reports globally without the approved anonymous-sharing boundary. Reported positive encounters and explicit meaningful no-encounter effort are distinct from empty/default reports.

Expanded Gulf Places require governed source geometry, identity, verification/CRS/status/date lineage and a separate species/context visibility rationale. Proposed visibility says which context a captain can inspect, not which fish are present or which candidate ranks higher. Unknown or unsupported context stays unknown; popularity and catch-report density cannot manufacture source verification, biological relevance or Opportunity eligibility.

## Common negative-case and admission matrix

| Evidence condition | Required outcome before any species-specific enablement |
|---|---|
| Unsupported species/adapter or unresolved taxonomic scope | Explicit unsupported/unresolved; no fallback to Blue Marlin or another tuna/billfish |
| Missing required source, no-pixel, invalid/late support or unknown exact-vintage possession | Distinct limitations; no fabricated environmental zero or current-condition substitution |
| Complete current state but insufficient admitted history | Current-only permissible meaning separately gated; no persistence/continuity claim or beta-scope reduction |
| Repeated assessment/publication of exact evidence | Additional decision records only; not independent observations/confidence |
| Same-target revision, overlapping or unknown-dependent support | Preserve exact references; no automatic latest-wins, pooling or independence assumption |
| Static terrain/Place exists but habitat evidence absent | Context only; no presence, eligibility or priority grant |
| Positive encounter/default zeros/explicit no-encounter | Distinct provenance/effort semantics; no catch probability or absolute absence claim |
| Nonfinite derived quantity | Existing local R9 rejection/dependent-unavailable meaning; no clipping, zero fallback or confidence salvage |
| Valid shaped payload or exact receipt | Mechanical integrity/possession only; not scientific confidence or source admission |
| Region, stock, life stage or product outside validated scope | Out-of-domain/unknown; no automatic global transfer |

Every engine's gate sequence is: G0 species/claim/region identity; G1 primary biological evidence and exact source/support authority; G2 controlled input/replay/negative-case correctness; G3 independent environmental/biological validation and uncertainty; G4 separately approved habitat/adequate-exclusion/eligibility policy; G5 shadow evaluation and independent QA; G6 separately authorized implementation/release. These labels are planning gates, not new runtime admission enums. No gate is deemed passed by this document. Ranking permission continues through existing governed eligibility; no score-only or shadow-output shortcut.

## Prioritization and bounded next packets

1. PELORA-05 with PELORA-00: freeze one claim/dependency/reference-availability dossier for each of the seven packets. Reuse the existing source-science ledger, verify actual consumer dependencies and mark every missing primary biological/reference input. No provider inquiry or dataset acquisition is implied.
2. Begin SP-BM exact-parent/current-composition qualification planning as the reference pathway, reusing the implemented explicit clock, P3-A and R9 rather than restarting repaired defects. Historical archive-bound STOP records identify prior scope limits; they are not automatic claims that later repairs are absent. PELORA-01 supplies the exact candidate implementation identity and existing evidence inventory before any new execution.
3. For the six targets, approve separate biological claim/reference protocols. Readiness order follows authoritative reference availability and ability to validate a bounded claim, not presumed fish abundance, popularity or a copied species score. Do not arbitrarily declare Yellowfin or any other target production-ready first. All seven remain locked beta requirements.
4. PELORA-04 independently reviews proposed protocols, fixture-to-oracle binding, source applicability, negative evidence and actual validation results. Any independent-reference absence yields BLOCKED/INCONCLUSIVE for the dependent claim, not a pass based on Pelora matching itself.
5. PELORA-00/scientific owner approves only supported claim/policy scope. PELORA-01 may then receive a separately authorized implementation packet; preserve all existing baseline behavior, privacy, source gates and quarantines. Physical-device/UI acceptance does not validate biology; science approval does not deploy anything.

Numeric parameters still requiring future evidence: species habitat-response limits, input ages/gaps/coverage adequacy, spatial correspondence tolerance, independent support/dependence treatment and confidence calibration. For each, first specify the quantity and reference uncertainty, evaluate sensitivity on independent held-out support, then seek approval of an interpretable acceptance criterion. No lookback, sample count, physical threshold, class boundary, confidence weight or ranking coefficient is set here.

## Nightly audit and shadow-learning interface

Use the existing accepted PELORA-05 nightly blueprint at `aaabba4b9f327e860b4401ef35454a27b7ee6ff4`, `docs/PELORA_05_Nightly_Audit_Beta_Blueprint_v1.md`, as design authority within its stated limits. Frozen report revisions, actual trip support, exact historical association and private/anonymous eligibility remain prerequisites. Durable Observe evidence, trustworthy possession for as-of claims, approved history selection and actual governed publications are separate dependencies; no new scheduler/schema or history framework is proposed.

Shadow results reference the versioned species hypothesis, original as-used inputs/evaluation, separately identified later evidence, coverage/uncertainty and privacy scope. Keep unknown/unpaired outcomes visible. They are human-review proposals, not a second production engine or automatic promotion mechanism. P05 review and explicit policy approval precede any scientific code/rule change; independent QA and implementation/release authorization remain additional gates. Nightly must never automatically rewrite production weights, habitat rules, confidence, gates or ranking. Captain-private observations do not become global training data from a consent boolean alone.

## Deliverable and verification limits

This single dedicated document is the only candidate change. No application imports/tests/builds/lint, new biological evidence collection, source acquisition, provider contact, package install, credential use, database/schema, scheduler/Receipt Writer enablement, UI/runtime edit, main merge or production action is part of this task. Existing frozen preview and source/experiment artifacts remain untouched. Documentation byte/scope checks and a documentation-only checkpoint are not scientific qualification.

SEVEN-SPECIES EVIDENCE PLAN READY FOR SCOPED SCIENTIFIC DOSSIERS

DOCUMENTATION ONLY — SEVEN QUALIFIED ENGINES NOT ESTABLISHED

Full history, persistence, continuity and Nightly Learn/Audit remain beta requirements. CP-10 remains blocked.
