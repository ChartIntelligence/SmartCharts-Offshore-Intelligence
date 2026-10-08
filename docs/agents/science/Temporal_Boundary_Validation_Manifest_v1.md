# TEMPORAL BOUNDARY VALIDATION MANIFEST v1

**Experiment:** EXACT REUSE vs SAME-TARGET REVISION BOUNDARY EXPERIMENT v1  
**Reference:** `dadec5dbca7d360f70f633413fb6a347dc24cac1`  
**Author:** PELORA-05  
**Disposition:** Frozen draft specification in this session; not saved, executed or scientifically admitted.

Read-only inspection confirmed the checkpoint’s R9 rejection fields and private-history boundary reasons. External findings remain previously recorded findings. **Provider-response coverage: NOT VERIFIED.**

## 1. Frozen manifest conventions

The tables below define **90 fixtures**: six arms × fifteen classes. Expansion is mechanical; executors must not choose substitute values, identities or authorities.

Experiment ID:

`TBV1-{arm}-{class}`

Each record identity:

`TBV1-{arm}-{class}-{record}`

These are **synthetic fixture identifiers**, not fabricated provider-issued references or SHA-256 digests. Provider-native identifiers and exact deployed processing revisions are `NOT ESTABLISHED`. Actual capture references must be generated and recorded during separately authorized execution.

DIRECT and GAP_FILLED have different arm prefixes, record identities, capture identities and source lineage. They must never be pooled or substituted.

### Arm definitions

| Arm | Product/family identity | Intended consumer | Retained quantity |
|---|---|---|---|
| `SST` | Open-Meteo `/v1/marine`, `sea_surface_temperature`; response-bound model/run `UNKNOWN` | `buildSeaSurfaceTemperaturePersistence` | `temperatureFahrenheit`, °F |
| `CUR` | NOAA `noaacwBLENDEDNRTcurrentsDaily`; mapped geostrophic current | `buildCurrentPersistence` | `speedKnots`, knots; `directionDegrees`, degrees |
| `PD` | NOAA DIRECT `noaacwNPPVIIRSchlaDaily` | `buildProductivityPersistence` | `concentrationMgM3`, mg m⁻³ |
| `PG` | NOAA GAP_FILLED `nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily` | `buildProductivityPersistence` | `concentrationMgM3`, mg m⁻³ |
| `CD` | NOAA DIRECT `noaacwNPPVIIRSchlaDaily` | `buildClarityPersistence` | `concentrationMgM3`, mg m⁻³ |
| `CG` | NOAA GAP_FILLED `nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily` | `buildClarityPersistence` | `concentrationMgM3`, mg m⁻³ |

Current fixtures supply speed/direction directly to the qualified consumer boundary. They do not invent native `u/v` provenance. SST fixtures supply °F directly; native °C is `NOT SUPPLIED`, not reconstructed.

For chlorophyll arms, freeze documentary labels to exercise arithmetic without selecting new class boundaries:

- Productivity: `productive-blue-green-transition`
- Clarity: `transitional-surface-water`
- Clarity `waterClassification`: `CONTROLLED_FIXTURE_LABEL`
- Evidence `interpretation`: `supported`
- Evidence and snapshot availability: `true`
- Freshness: `recent`
- Age: calculated from each record’s represented target to the original cutoff below

These labels are controlled inputs, not classifications scientifically inferred from fixture concentrations. Consequently productivity-rank, clarity-rank and freshness-rank differences are **zero** wherever two usable endpoints are compared.

### Common authority envelope

| Field | Frozen value |
|---|---|
| Classification | `CONTROLLED_FIXTURE_ONLY_NOT_SOURCE_ADMISSION` |
| Private context | `PRIVATE_CURRENT_WORKFLOW_ONLY` |
| Requested/resolved coordinates | Both latitude `25`, longitude `-90` |
| Sample role | `center`; no neighborhood or derivative |
| Provider correspondence | `NOT ESTABLISHED`; coordinate equality is synthetic |
| Original cutoff `A0` | `2026-10-06T12:00:00Z` |
| Repeated assessment `A1` | `2026-10-06T16:00:00Z` |
| Target `T0` | `2026-10-06T00:00:00Z` |
| Target `T1` | `2026-10-06T06:00:00Z` |
| Target `T2` | `2026-10-06T10:00:00Z` |
| Gap target `TG` | `2026-10-01T00:00:00Z` |
| Default synthetic possession | `2026-10-06T11:00:00Z` |
| Late synthetic possession | `2026-10-06T13:00:00Z` |
| Provider support/configuration/revision | `UNKNOWN` or `NOT ESTABLISHED` |
| Actual receipt authority | `NOT ESTABLISHED` |
| Actual independence | `UNKNOWN` |
| Operational admission | Never asserted |

A controlled support/possession fact supplied through the existing fixture-only comparison port tests a **necessary software check**. It does not establish provider support or actual possession.

Every fixture has two distinct observations:

1. **Controlled lane:** explicitly supplied synthetic authority exercises the boundary.
2. **Source-authority lane:** no controlled authority is supplied; absent operational authority must remain unresolved/unadmitted.

The executor must preserve this distinction in results.

## 2. Frozen fixture classes

Values `L`, `H` and `M` are defined in the oracle table. Unless overridden, use records `r0/r1`, targets `T0/T1`, revision labels `fixture-r1/fixture-r1`, synthetic instant supports at those targets, default possession and cutoff `A0`.

| Class | Frozen records and overrides |
|---|---|
| `01-REUSE` | One record `r0`, target `T0`, value `L`; submit the exact same source at `A0` and `A1`. Within each history also submit the identical row twice. No new native source identity. |
| `02-EQUAL-DISTINCT` | Distinct `r0/r1`, targets `T0/T1`, both value `L`; distinct synthetic parent references. Genuine distinctness exists only in the fixture definition. |
| `03-REVISION` | Distinct `r0/r1`, both target `T0`; values `L/H`; revisions `fixture-r1/fixture-r2`; same synthetic support. |
| `04-DIFFERENT-TARGETS` | Distinct records at `T0/T1`, values `L/H`. |
| `05-OVERLAP` | Values `L/H`; composite-window fixture supports `[2026-10-05T18:00Z,T1]` and `[T0,A0]`. These overlap for six hours. They are not asserted provider bounds. |
| `06-DEPENDENCE-UNKNOWN` | Values `L/H`, synthetic nonoverlapping instant supports; contributor relation and statistical dependence explicitly `UNKNOWN`. |
| `07-SUPPORT-MISSING` | Values `L/H`; controlled support `{kind:"unknown"}` for both. |
| `08-POSSESSION-UNPROVEN` | Values `L/H`; valid synthetic supports; `possessedAt:null`, controlled parent references retained. |
| `09-LATE-POSSESSION` | Values `L/H`; both possessed at `13:00Z`; assessment remains `A0`. |
| `10-INSUFFICIENT` | Only `r0`, target `T0`, value `L`; no second endpoint. |
| `11-GAP-OUTAGE` | `r0` at `TG`, `r1` at `T1`, values `L/H`; retrieval succeeds but intermediate coverage is unknown. Recorded outage has unknown bounds; no fill/interpolation. |
| `12-INCREASE` | Ordinary finite `L→H`, targets `T0/T1`. |
| `13-DECREASE` | Ordinary finite `H→L`, targets `T0/T1`. |
| `14-NO-CHANGE` | Three distinct records at `T0/T1/T2`, all value `L`. Dependence remains unknown. |
| `15-R9-OVERFLOW` | Finite synthetic endpoints `−M→+M`, targets `T0/T1`. Current directions remain `350°→10°`. Deliberately nonphysical adversarial inputs; no provider occurrence asserted. |

In class 01, freeze the original source values, target and original assessed fields across assessments. Report present age separately; repeated assessment must not manufacture additional environmental support.

For GAP_FILLED fixtures, contributor identities, climatology vintage and response-bound DINEOF configuration remain `UNKNOWN`. Synthetic identities do not supply them.

## 3. Independent arithmetic oracle

The oracle is elementary subtraction and circular-angle geometry, specified independently of Pelora.

Let:

`M = 1.7976931348623157e308`

This is a finite binary64 endpoint. Mathematical `(+M)−(−M)=2M`; binary64 subtraction overflows to positive infinity. **Expected exposed derived result after R9: null, not infinity.**

| Arm | `L` | `H` | Increase `H−L` | Decrease `L−H` | Equal-value difference |
|---|---:|---:|---:|---:|---:|
| SST | 80 °F | 82 °F | +2 °F | −2 °F | 0 °F |
| CUR speed | 1 knot | 2 knots | +1 knot | −1 knot | 0 knots |
| PD, PG, CD, CG | 0.2 mg m⁻³ | 0.5 mg m⁻³ | +0.3 mg m⁻³ mathematically | −0.3 mg m⁻³ mathematically | 0 mg m⁻³ |

For binary64 chlorophyll subtraction, expect the represented result `0.3` or `−0.3`; execution must document representation handling rather than introduce a scientific tolerance.

Current directions:

- `L`: 350°
- `H`: 10°
- Increase/decrease fixture circular separation:  
  `min(|10−350|,360−|10−350|)=20°`
- Equal/no-change fixtures: 0°
- This quantity is unsigned angular separation, not a signed rotation or vector-magnitude change.

Durations:

| Class | Expected represented duration |
|---|---:|
| 01 | One distinct source; no two-source duration |
| 02, 04–09, 12, 13, 15 | 6 hours |
| 03 | 0 hours; revision comparison only |
| 10 | No two-source duration |
| 11 | 126 hours |
| 14 | 10 hours |

Class 03’s raw value difference equals the increase oracle, but **no temporal endpoint selection or environmental-change result is permitted**.

Classes 07–09 retain a raw documentary difference, but the temporal consumer receives no eligible pair through the boundary.

### R9-specific expected output

For class 15, all six arms must locally produce:

- `available:false`
- `classification:"unavailable"`
- `lifecycleState:null`
- `reason:"nonfinite-temporal-derivation"`
- Failed delta field `null`
- Confidence `{score:0,level:"Unavailable"}` as unavailable-contract representation
- `nonfinite-derived-{field}` limitation
- `dependent-temporal-classification-confidence-continuity-not-established`

Failed fields:

| Arm | Failed field |
|---|---|
| SST | `temperatureChangeFahrenheit` |
| CUR | `speedChangeKnots` |
| PD, PG, CD, CG | `concentrationChangeMgM3` |

Original finite endpoints and six-hour duration remain documentary facts. CUR’s 20° separation remains finite. Chlorophyll rank/freshness differences remain zero. These siblings cannot certify the rejected tuple.

This assertion applies only to the four R9-qualified persistence functions. It does not assert new rejection behavior in other change functions.

## 4. Acceptance matrix

This is a machine-readable-style expansion table. `{arm}` expands over exactly `SST,CUR,PD,PG,CD,CG`; each row therefore defines six experiment IDs.

`RAW_DOC` means raw retained-source comparison only. `DOC` means finite consumer arithmetic may be checked, without accepting its scientific classifications or confidence.

All rows have **environmental-change permission = NO**, **interval-persistence permission = NO**, and **scientific confidence permission = NO**.

| Experiment ID | Fixture class | Expected software result | Expected temporal eligibility | Expected claim level | Required limitation | Scientific status |
|---|---|---|---|---|---|---|
| `TBV1-{arm}-01-REUSE` | Exact reuse | Duplicate supplied once; one-source history insufficient; assessments remain distinct | Controlled insufficient; operational unadmitted | Same-source reuse statement | `EXACT_DUPLICATE_REUSE`; no new environmental support | `CONTROLLED_SOFTWARE_ONLY`, `NOT_ADMITTED` |
| `TBV1-{arm}-02-EQUAL-DISTINCT` | Distinct equal records | Preserve both; delta 0; duration 6h | Controlled necessary checks pass only | `DOC` | Distinct records do not prove independence/persistence | `TEMPORAL_POLICY_UNRESOLVED`, `NOT_ADMITTED` |
| `TBV1-{arm}-03-REVISION` | Same-target revision | Both selections unresolved; no latest-wins | Unresolved | `RAW_DOC`, revision comparison | `SAME_TARGET_REVISION_SELECTION_UNRESOLVED` | `SOURCE_COMPARABILITY_UNRESOLVED`, `NOT_ADMITTED` |
| `TBV1-{arm}-04-DIFFERENT-TARGETS` | Different targets | Increase oracle; 6h | Controlled necessary checks pass only | `DOC` | Support/source comparability not admitted | `SOURCE_COMPARABILITY_UNRESOLVED`, `ENVIRONMENTAL_VALIDATION_BLOCKED` |
| `TBV1-{arm}-05-OVERLAP` | Overlapping support | Arithmetic unchanged; overlap retained in manifest | Controlled necessary checks may pass; dependence unresolved | `DOC` | No implemented overlap-based scientific admission rule assumed | `TEMPORAL_POLICY_UNRESOLVED`, `NOT_ADMITTED` |
| `TBV1-{arm}-06-DEPENDENCE-UNKNOWN` | Unknown dependence | Increase oracle; no independence inference | Scientific adequacy unresolved | `DOC` | Nonoverlap is not independence | `TEMPORAL_POLICY_UNRESOLVED`, `NOT_ADMITTED` |
| `TBV1-{arm}-07-SUPPORT-MISSING` | Missing support | No eligible inputs through boundary | Unresolved | `RAW_DOC` | `UNKNOWN_TEMPORAL_SUPPORT` | `NOT_ADMITTED` |
| `TBV1-{arm}-08-POSSESSION-UNPROVEN` | Unproven possession | No eligible inputs through boundary | Unresolved | `RAW_DOC` | `UNPROVEN_EXACT_VINTAGE_POSSESSION` | `NOT_ADMITTED` |
| `TBV1-{arm}-09-LATE-POSSESSION` | Late possession | No eligible inputs at A0 | Excluded from prospective assessment | `RAW_DOC`, retrospective label only | `EXACT_VINTAGE_POSSESSED_AFTER_CUTOFF` | `NOT_ADMITTED` |
| `TBV1-{arm}-10-INSUFFICIENT` | One input | Insufficient; no invented second value | Controlled insufficient | Single-source statement | Computational insufficiency; not governed empty | `CONTROLLED_SOFTWARE_ONLY`, `NOT_ADMITTED` |
| `TBV1-{arm}-11-GAP-OUTAGE` | Gap/outage | Increase oracle and 126h documentary span; no fill | Gap adequacy unresolved | `DOC` | Endpoint span is not continuous coverage | `TEMPORAL_POLICY_UNRESOLVED`, `NOT_ADMITTED` |
| `TBV1-{arm}-12-INCREASE` | Ordinary increase | Increase oracle; 6h | Controlled necessary checks pass only | `DOC` | Finite arithmetic is not environmental validity | `CONTROLLED_SOFTWARE_ONLY`, `ENVIRONMENTAL_VALIDATION_BLOCKED` |
| `TBV1-{arm}-13-DECREASE` | Ordinary decrease | Decrease oracle; 6h | Controlled necessary checks pass only | `DOC` | Finite arithmetic is not environmental validity | `CONTROLLED_SOFTWARE_ONLY`, `ENVIRONMENTAL_VALIDATION_BLOCKED` |
| `TBV1-{arm}-14-NO-CHANGE` | Three equal endpoints | Delta 0; 10h; preserve distinct records | Interval adequacy unresolved | `DOC` | Agreement at sampled targets is not interval persistence | `TEMPORAL_POLICY_UNRESOLVED`, `NOT_ADMITTED` |
| `TBV1-{arm}-15-R9-OVERFLOW` | Non-finite derivation | Exact local R9 unavailable/null semantics | Failed derived tuple | Endpoint facts only | `nonfinite-temporal-derivation` | `CONTROLLED_SOFTWARE_ONLY`, `NOT_ADMITTED` |

For every source-authority-lane case without controlled authority, expect `UNKNOWN_SUPPORT_AND_EXACT_VINTAGE_POSSESSION`, no selected operational history and existing `NOT_OPERATIONALLY_ADMITTED`.

The scientific-status labels above are review annotations, **not new runtime admission states**.

A finite consumer’s existing classification/confidence may be recorded for comparison, but is not approved by this matrix. Exact finite confidence scores are deliberately not an oracle here.

## 5. Wording matrix

These examples define boundaries for eventual wording checks; they do not authorize publication.

| Claim level | Allowed documentary example | Prohibited without additional evidence |
|---|---|---|
| SST difference | “The two retained model SST values differ by 2°F.” | “The water warmed by 2°F.” |
| Current difference | “The retained mapped geostrophic speeds differ by 1 knot; their directions are 20° apart.” | “Current conditions strengthened.” |
| Productivity DIRECT | “The two retained DIRECT chlorophyll values differ by 0.3 mg m⁻³.” | “Ocean productivity increased.” |
| Productivity GAP_FILLED | “The two retained reconstructed chlorophyll values differ by 0.3 mg m⁻³.” | “Independent satellite observations confirm increased productivity.” |
| Clarity DIRECT | “The retained DIRECT chlorophyll values changed; actual visibility was not evaluated.” | “The water became clearer.” |
| Clarity GAP_FILLED | “The reconstructed chlorophyll values changed; actual visibility was not evaluated.” | “Observed clarity improved.” |
| Same-target revision | “Two retained revisions for the same represented target contain different values.” | “Conditions changed between these revisions.” |
| Equal endpoints | “The retained values agree at the sampled targets.” | “This condition persisted throughout the interval.” |
| Exact reuse | “Both assessments used the same retained source record.” | “Two observations confirmed persistence.” |
| Missing authority | “Temporal interpretation is unavailable because source support or cutoff possession is unresolved.” | “Stable conditions” or an environmental confidence percentage |
| R9 failure | “The temporal difference could not be represented as a finite result.” | Reporting infinity, zero change, or supported continuity |

No wording may imply fish presence, aggregation, catch probability or validated habitat response.

## 6. Unresolved dependencies

- **R1–R4:** exact product/run/revision comparability and represented support; GAP_FILLED contributor/configuration/climatology authority.
- **R5:** production lookback, gap tolerance, support adequacy, dependence treatment and confidence meaning.
- **R7:** complete-scope resolution; successful bounded retrieval is not complete history.
- **R10:** operational source/sample correspondence beyond synthetic coordinate equality.
- Independent environmental references and claim-specific validation remain unavailable to this mission.
- Provider replies and existing inquiry coverage remain **NOT VERIFIED**.

Later numerical decisions require authoritative support/lineage, suitable independent reference series and held-out evaluation across coverage/dependence conditions. Fixture spans and values above are software inputs, not proposed production settings.

## 7. Smallest isolated execution packet

**Recommended owner:** PELORA-00 assigns an offline software-execution agent; PELORA-05 owns expected scientific boundaries; **PELORA-04 independently checks evidence**.

First execute only classes **01, 03, 07, 08, 09 and 15** across all six arms: **36 fixtures**, with controlled and source-authority lanes reported separately.

Prerequisites:

- Separate execution authorization and checkpoint pinning.
- Immutable fixture expansion, input references and oracle recorded before execution.
- Offline harness using existing boundary and four persistence consumers.
- No provider, database, publication scheduler, application server or quarantined consumer invocation.
- Explicit accounting for any scratch writes and child processes before approval.
- Complete outputs and selected-input identities retained for PELORA-04.

This packet could establish reuse/revision handling, missing/late-authority exclusion and local R9 failure propagation. It could not establish source comparability, independence, ocean skill, interval persistence, confidence calibration or operational admission.

**TEMPORAL BOUNDARY VALIDATION MANIFEST v1 — DRAFT COMPLETE**  
**NOT EXECUTED — NO NEW SCIENTIFIC ADMISSION**

**CP-10 remains blocked.**
