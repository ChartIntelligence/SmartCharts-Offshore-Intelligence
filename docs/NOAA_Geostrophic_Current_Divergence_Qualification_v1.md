# NOAA Surface Geostrophic Velocity: Product Qualification v1

Task 12B.6Y, metadata-only follow-up, 2026-09-28. HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`; branch `codex/pelora-remote-setup`.

**CONVERGENCE_CANDIDATE_ONLY_SUPPORTED + PROVIDER_CLARIFICATION_REQUIRED + PRODUCT_UNCERTAINTY_QUALIFICATION_REQUIRED.** This qualifies bounded product facts and limitations, not an estimator or detection contract. **OCEAN_PHYSICS_REMAINS_PAUSED. NUMERIC PILOT: METADATA_SCIENCE_GAPS_FIRST.**

The five questions have separate results:

| Question | Result |
|---|---|
| Physical target | Mapped surface geostrophic velocity; not total surface velocity. Exact absolute/anomaly construction needs confirmation. |
| Resolved geometry | Regular geographic grid and extraction mechanism identified; effective physical resolution and statistical independence unresolved. |
| Temporal support | Nominal daily NRT fields identified; instantaneous/mean/composite interval not established. |
| Quality/uncertainty | Exposed validity metadata identified; product-specific vector and derivative error qualification incomplete. |
| Derivative meaning | Potential diagnostic of the mapped geostrophic field, conditional on geometry/support/error qualification; no total-current detection permission. |

Paragraph labels separate **FACT** (repository), **PROVIDER-DOCUMENTED BEHAVIOR**, **SCIENTIFIC INTERPRETATION**, **PELORA DESIGN CONSEQUENCE**, and **UNRESOLVED**. The [JSON ledger](NOAA_Geostrophic_Current_Divergence_Qualification_v1.json) records sources, claim levels, clarification questions and preservation hashes. Earlier science packages are unchanged.

## Physical target and exact identity

**FACT.** [server.js](../backend/server.js:2345) requests `u_current` and `v_current` at independently selected `last` time and requested coordinates from `https://coastwatch.noaa.gov/erddap/griddap/noaacwBLENDEDNRTcurrentsDaily.json`. This report accesses documentation/metadata only, not that value endpoint. Parser, sampling, cache and [assessment governance](../backend/scientificAssessment.mjs) were checked against current source.

**PROVIDER-DOCUMENTED BEHAVIOR — [P1: exact metadata](https://coastwatch.noaa.gov/erddap/info/noaacwBLENDEDNRTcurrentsDaily/index.html).** NOAA NESDIS CoastWatch identifies sea-surface geostrophic currents, altimetry, NRT, daily. Components are eastward/northward in m/s. Dimensions are time × latitude × longitude; geographic axes have 720 × 1440 positions, 0.25° spacing, latitude −89.875…89.875 and longitude −179.875…179.875. Time uses a Gregorian epoch coordinate; its axis is not evenly spaced. Variable comments identify MDT CNES/CLS 2013. Metadata names fill/missing −214748.3648 and time bounds, but exposes neither bound values nor a separate QC/uncertainty field. No numeric depth interval or science-release version is supplied. Library/template versions are not science revisions.

**PROVIDER-DOCUMENTED BEHAVIOR — [P2: NOAA product page](https://coastwatch.noaa.gov/cwn/products/sea-level-anomaly-and-geostrophic-currents-multi-mission-global-optimal-interpolation.html).** NOAA LSA uses multi-mission RADS altimetry and optimal interpolation, deriving geostrophic currents from mapped sea-level fields. The page describes f-plane equations and equatorial beta-plane treatment. It describes daily NRT rather than a total-current forecast. Its Level-3 prose/Level-4 listing and 3–5-hour input/12-hour latency descriptions are not a consistent precise processing/update contract.

**UNRESOLVED.** The MDT comment supports a mean-topography contribution, but neither generic standard names nor a page describing SLA alone establishes the endpoint's complete absolute-versus-anomaly formula. “Mapped surface geostrophic velocity” is established; “absolute geostrophic velocity with this exact reference/baseline” requires confirmation. No other NOAA product is substituted. Exact surface-depth support, release history and publication cadence remain open.

| Physics component | Classification and boundary (**SCIENTIFIC INTERPRETATION**, grounded in P1/P2) |
|---|---|
| Geostrophic balance / mapped sea-level gradient | INCLUDED as the product's defining derived component. |
| Mean dynamic topography | INCLUDED in derivation per metadata; exact anomaly/absolute assembly remains unresolved. |
| Ekman/wind-driven ageostrophic velocity | NOT_INCLUDED as a separate total-current component; wind-driven changes may affect the balanced height field. |
| Tidal, inertial and Stokes velocities | NOT_INCLUDED as separately resolved velocity contributions in the stated geostrophic derivation. This does not prove zero residual contamination. |
| Ageostrophic frontal circulation | NOT_INCLUDED as a resolved ageostrophic component. A geostrophic frontal signature is a different claim. |
| River/plume flow | NOT_ESTABLISHED as a specifically resolved flow; balanced height effects may enter, but plume advection cannot be claimed. |
| Other physical contributions/residuals | NOT_ESTABLISHED; do not convert lack of documentation into proof of perfect exclusion. |

## Theory: product derivative versus physical total-current divergence

**SCIENTIFIC INTERPRETATION.** Define A as divergence of the mapped geostrophic product, B as divergence of total surface-ocean velocity. **A is not B.** A diagnostic cannot recover omitted ageostrophic motion by differentiation.

For a local horizontal frame and constant g, write `u_g = −(g/f)∂η/∂y`, `v_g = (g/f)∂η/∂x`. With constant f and smooth η, mixed derivatives cancel: `∂u_g/∂x + ∂v_g/∂y = 0`. This is the ideal balance boundary, not an assertion that every discrete map is exactly nondivergent. [A2: Marshall & Plumb, chapter 7](https://weathertank.mit.edu/wp-content/uploads/2017/04/chap7.pdf)

**SCIENTIFIC INTERPRETATION — explicit derivation.** With f=f(y), beta=∂f/∂y, the same assumptions give `D_g = −(beta/f)v_g`. Thus variable f permits nonzero geostrophic divergence. [A4: Price, §3.1](https://ocw.mit.edu/courses/res-12-001-topics-in-fluid-dynamics-fall-2024/mitres_12_001_f24_essay3_pt4.pdf) discusses beta-induced divergence. In Pelora's 15–32°N domain f is nonzero and varies northward: the effect cannot be declared absent. Whether it is significant at the reviewed scale relative to mapping/discretization error is unresolved; no velocity values or significance calculation were performed. Do not apply this ideal relation as a new product estimator or assume NOAA uses precisely this discretization.

**SCIENTIFIC INTERPRETATION.** Geographic derivatives require metric-aware geometry. On a spherical surface, horizontal divergence is `[∂u/∂λ + ∂(v cosφ)/∂φ]/(a cosφ)` for east/north components; equivalently use a justified local physical-coordinate approximation with its error assessed. Angles must be radians in that expression; degrees are not interchangeable meter distances. This expression follows surface-flux geometry and selects no Pelora implementation. Nonzero mapped results can contain variable-f effects, mapping/discrete imbalance, metric errors, time mismatch or measurement/rounding error. They do not by themselves identify physical total-current convergence.

## Resolved geometry and spatial support

**PROVIDER-DOCUMENTED BEHAVIOR.** [P3: griddap documentation](https://coastwatch.noaa.gov/erddap/griddap/documentation.html) says parenthesized coordinate queries use the closest dimension value. This is grid extraction, not bilinear interpolation. Upstream optimal interpolation is a separate mapping operation.

**FACT.** `createCurrentSpatialSamplePoints` requests N/S at latitude ±15/60° and E/W at longitude ±15/(60 cos(latitude))°. Center is separate. At `(25,-90)`, points are N `(25.25,-90)`, S `(24.75,-90)`, E `(25,-89.72415552025937)`, W `(25,-90.27584447974063)`. The intended radius is approximately 15 nautical miles, not an exact geodesic. Components and projection outputs are rounded to four decimals. Cardinal labels, not a derivative fit to resolved positions, drive the existing candidate.

**SCIENTIFIC INTERPRETATION.** N/S radius is one grid interval; E/W radius is slightly more than one longitude interval in this domain. On the stated regular grid, consistent nearest-coordinate tie handling gives four distinct directional cells and a distinct center; this is a conditional geometric inference, not an observed provider response. Arbitrary nearby requests/candidates can share cells. Actual resolved coordinates, coordinate ties and masks still require validation before an estimator. Snapping changes distances and candidate-relative centering. The nominal five cells are not five statistically independent observations: mapped values can share altimeter inputs. Effective independent source count/covariance is unknown.

**UNRESOLVED. DERIVATIVE RESOLUTION = UNRESOLVED.** Grid spacing is known, effective spatial resolution and interpolation scales for this exact release are not. A stencil spanning native cells is numerically distinct, but not thereby physically resolving. [S1: Ballarotta et al.](https://doi.org/10.5194/os-15-1091-2019) demonstrates the grid/effective-resolution distinction for DUACS; its numerical scales must not be transferred here. No closer/wider spacing is recommended.

**UNRESOLVED.** The reviewed material does not establish an exact coastline mask algorithm, shelf/coastal error bound, wet-cell interpolation neighborhood or stencil validity across land. Missing/fill values are not a full coastal quality policy. A derivative must not silently bridge land or missing cells. NOAA's product figures distinguish land and missing/ice, but that does not supply a validated coastal derivative rule.

## Temporal support and current application behavior

**UNRESOLVED.** Daily publication/coordinate labels do not resolve whether a field is instantaneous, interval-mean or an analysis/composite with a broader temporal kernel. Provider time bounds/support, input observation window and field revision semantics require clarification. Keep source observation times, represented coordinate/support, publication time, application retrieval/cache time and assessmentAt separate. Neither metadata modification time nor cache age substitutes for represented time.

**FACT.** Pelora's independent `last` queries and five-minute cache are not an atomic frame acquisition. Cached values retain source timestamps and are reassessed under explicit assessment. [Existing convergence tests](../backend/tests/convergenceDecision.test.js) demonstrate mixed dates, including adjacent individually fresh dates, within one candidate. Future or untimed available points reject; a remaining three-direction candidate can survive. No fix or new experiment occurs here.

**PELORA DESIGN CONSEQUENCE. SAME_FIELD_REQUIRED** for an uninterpolated derivative of one mapped field: samples need common represented frame/support and consistent product revision. Equal timestamps alone do not prove equal support or revision. This is a scientific evidence requirement, not implemented runtime policy. A different temporally aligned estimate would require separate qualification; no allowable separation is chosen. **UNRESOLVED:** the provider meaning of that field's interval and the full operational temporal policy.

## Quality, uncertainty and derivatives

**UNRESOLVED.** Public metadata exposes validity/fill descriptors, not per-cell velocity covariance, mapping error, source counts or calibrated confidence. A service out-of-date indicator is operational health, not vector quality. Product documentation and targeted searches did not establish quantitative endpoint-specific velocity or derivative error statistics. This is a bounded negative finding, not proof none exist. No HF-radar, DUACS or other-product error value is borrowed.

**SCIENTIFIC INTERPRETATION.** Optimal mapping filters/combines evidence; its kernel and correlations matter to gradients. Derivatives emphasize spatial differences and have inverse-distance error sensitivity. [A3: NIST uncertainty propagation](https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-appendix-law-propagation-uncertainty) requires covariance as well as individual errors. A small nonzero result cannot be interpreted without mapped-component errors, correlations, effective support, geometry/time uncertainty, rounding and discretization sensitivity. No confidence formula or threshold is selected.

**SCIENTIFIC INTERPRETATION.** [S3: Fornberg](https://www.colorado.edu/amath/sites/default/files/attached-files/mathcomp_88_fd_formulas.pdf) establishes that node locations and stencil determine derivative approximation. For Pelora: opposing pairs can support both component derivatives without center; a missing direction removes the usual opposing-pair contribution. Center plus remaining samples may support a different one-sided construction, but no fallback is qualified. Three noncollinear vectors without center could fit an assumed affine field, not a model-free derivative. Missing an opposite pair leaves collinear support and cannot establish general 2-D divergence.

**SCIENTIFIC INTERPRETATION.** Unequal inward magnitudes do not invalidate geometry; quantitative sign depends on spatial differences. Three counted inward vectors need not outweigh an uncounted outward contribution. Shear, strain and convergence are non-exclusive diagnostics; independence of classifiers is not statistical independence. [S2: McWilliams, §5b](https://doi.org/10.1098/rspa.2016.0117) describes coexisting deformation/shear and ageostrophic convergence. Pelora's current edge is not automatically a density front.

**SCIENTIFIC INTERPRETATION.** [A1: continuity](https://weathertank.mit.edu/wp-content/uploads/2017/04/chap6.pdf) relates horizontal divergence to a vertical derivative, not uniquely to vertical velocity. Vertical structure/boundary conditions and appropriate velocity evidence are needed. No downwelling/upwelling follows from this surface product alone. **PELORA DESIGN CONSEQUENCE:** no fish presence, aggregation guarantee, catch probability or Opportunity eligibility follows from convergence alone; science remains species-neutral. Persistence is a distinct stability claim, not an automatic prerequisite for defining a present spatial derivative.

## Claim levels, consumer boundary and exact next evidence

| Claim level | Qualification result |
|---|---|
| Existing candidate | ONLY_QUALITATIVE_CANDIDATE_SUPPORTED: sampled geostrophic vectors meet the existing inward-geometry rule. |
| Mapped-field derivative | Conditional mathematical possibility, not a qualified scientific diagnostic; UNRESOLVED_PENDING_PROVIDER_INFORMATION. |
| Physical total-current convergence | Not established by this product or existing candidate. |
| State representation | Unavailable, insufficient, geometry candidate, assessed component diagnostic and physical detection are distinct claims; names/enums not approved. |
| Boolean | BOOLEAN_TOO_LOSSY alone: unknown/insufficient/negative evidence cannot all mean the same false state. |
| Ocean Physics today | NOT_YET_QUALIFIED. Existing consumers' Boolean-driven support is not qualified for weaker candidate context. |

**FACT.** Production still lacks the nested detection Boolean. Manual true substitution remains non-producer diagnostic evidence; it cannot authorize detection. Prior captured/published candidates must never be relabeled detected convergence.

**UNRESOLVED — exact provider clarification questions (no contact made):**

1. What current-science release and generating algorithm does this dataset ID serve? Is velocity absolute or anomalous; precisely how are SLA and MDT combined?
2. What physical surface/depth reference and geostrophic/variable-f equations and discrete operators are used?
3. What spatial/temporal optimal-interpolation kernels and effective resolving scales apply, particularly in the Gulf and coastal/shelf regions?
4. What does each time coordinate and `time_bnds` mean? What are the source observation window, revision policy and publication latency/cadence?
5. Which mask/QC/mapping-error/source-count fields exist, where are they documented, and which are exposed by this endpoint?
6. What component-error and spatial/cross-component covariance validation is available? Does any study validate derivatives at this product's supported scales?
7. What coastal/land/ice rules govern missing cells and mapping neighborhoods, and what stencil exclusions are justified?

**PELORA DESIGN CONSEQUENCE.** METADATA_SCIENCE_GAPS_FIRST. A later small value pilot could check extraction/frame provenance only after these material questions are addressed; a few numbers cannot establish resolution or significance. No pilot is authorized or specified here. Next gate is **provider-documentation/clarification review of physical construction, support and uncertainty**, followed by separate estimator science and contract review if justified. No NOAA contact, numeric acquisition, software amendment or Ocean Physics resumption.

## Verification and preserved boundaries

**FACT.** New documentation only. JSON, source classifications/URLs, local references, hashes and whitespace were checked; tracked/staged diffs remain empty. All 84 pre-existing untracked files, including prior packages and quarantined drafts, retain hashes recorded in the companion. No scientific tests/pilot were run in this metadata-only follow-up; prior tests were inspected, not newly claimed as execution proof.

Public NOAA documentation/metadata access occurred as requested; no provider **value API**, database, Auth or Supabase service access occurred. No environmental values acquired; no implementation, estimator, threshold, Boolean, alias, revised model, authority proposal/freeze/v3. Tasks 12B.6C/9E-D and Ocean Physics remain paused. `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains open. No staging/commit/tag/push/deployment. Original nine remain unresolved; astronomy remains qualified; injected providers remain unqualified.
