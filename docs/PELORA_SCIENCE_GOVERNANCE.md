# Pelora science governance

Canonical science/evidence guardrails and contract router. This document does not replace existing governed Opportunity eligibility/ranking architecture, select unresolved thresholds or extend qualification.

## Locked evidence rules

- Evidence cannot manufacture eligibility. Numeric score alone cannot grant ranking permission.
- Confidence describes confidence in environmental evidence only. It does not mean fish presence, catch probability or success probability.
- Missing required evidence fails closed. Scientific uncertainty remains explicit.
- Historical or stale evidence must not masquerade as current evidence. Republishing cannot reset source age.
- Observation time, provider/valid time, acquisition time, receipt time, assessment time and publication time are distinct; a product timestamp alone does not prove observation support or Pelora possession.
- Multi-day persistence comes from governed environmental continuity, never repeated catch reports, popularity or repeated publication of the same observation.
- Do not fabricate fronts, convergence, shear, bathymetric structure, gap-filled detail or biological conclusions unsupported by validated evidence.

Freshness, live-age permission and consumer usability are separate. Preserve family-specific policy; do not invent one universal age limit. Adequate negative evidence differs from missing/unknown evidence.

## Three separate timescales

1. **Continuous Observe:** server-side environmental observation independent of captain sessions. Captain activity, coordinates, viewport, trip origin, species, Opportunities, Places, reports, searches, authentication state, sessions and active-user count must not define sampling scope or priority.
2. **Governed Publish:** six locked UTC slots: **00:00, 04:00, 08:00, 12:00, 16:00, 20:00**. The scheduled boundary is distinct from execution/publication time and source time. App launch/resume consumes the latest governed published state rather than initiating full shared discovery.
3. **Nightly Learn / Daily Evidence Audit:** separate from production ranking/publishing. It may accumulate evidence and hypotheses but must never automatically rewrite production weights, eligibility gates, confidence rules, habitat rules, ranking or predictions.

These are required operating rules, not assertions of operational wiring.

## Reuse existing authority

| Boundary | Contract / qualification source |
|---|---|
| Publication cadence, freeze and read semantics | [Four-hour publication](Four_Hour_Governed_Publication_v1.md), [CP-08 publication store](Continuous_Observe_CP08_Publication_Store_v1.md), [controlled P4-A](Continuous_Observe_CP09B_P4A_Controlled_Integration_v1.md) |
| Independent observation | [Observe phase 1](Continuous_Observe_Currents_Phase_1.md), [phase 2](Continuous_Observe_Currents_Phase_2.md), [Ocean State reader](../backend/durableObserve/CP07-OCEAN-STATE.md) |
| Existing evaluation and history separation | [Shared scientific boundary](Shared_Scientific_Evaluation_Boundary_v1.md), [immutable history context](Immutable_Scientific_History_Context_v1.md) |
| Explicit clocks and provenance | [Assessment time](Explicit_Scientific_Assessment_Time_v1.md), [temporal primitives](Governed_Temporal_Evidence_Primitives_v1.md), [P3-A cutoff/as-used boundary](CP09B_P3A_Explicit_Cutoff_As_Used_History_v1.md) |
| Open source/history authority | [P3 policy decisions](CP09B_P3_Source_History_Policy_Decisions_v1.md), [remaining SST/chlorophyll authority](Remaining_SST_Chlorophyll_Temporal_Authority_v1.md), [R9 repair](CP09B_R9_Temporal_Derived_Finiteness_Repair_v1.md) |
| Paused current interpretation | [Convergence decision](Governed_Current_Convergence_Decision_v1.md), [science review](Current_Convergence_Science_Review_Package_v1.md) |
| Scalar/bathymetry presentation | [Field delivery](Ocean_Scalar_Field_Delivery_v1.md), [scalar runtime](Governed_Scalar_Field_Runtime_v1.md) |

Existing executable eligibility/interpretation/delivery producers and their qualified contracts retain authority. Retention, a valid shape, controlled fixture success or a map overlay cannot grant scientific admission. P3 recommendations are not collectively approved. CP-10 remains blocked; Ocean Physics/Convergence, 12B.6C and 9E-D retain their recorded pause limits. Projection V3 remains quarantined. Any proposed reopening needs separate authorization and qualification.

## Multi-source mandate reconciliation — direction versus qualification

Founder mandate01a13f2a-e3f2-7812-b6ec-ea004f088b49 is canonical; no runtime, source admission or operational capability is added by its documentation. Reuse existing adapters/contracts, do not replace the architecture or restart completed research. The versioned registry must distinguish stable source/product identity, artifact/vintage/revision identity and assessment/selection identity. Unknown support, uncertainty, license, service availability or dependency lineage remains explicit unknown. A valid hash/metadata row is not scientific admission. Receipt/cutoff possession and source timestamps remain distinct.

| Existing source/interface | Reuse and exact limit |
|---|---|
| backend/fields/datasetRegistry.js FIELD_PRODUCTS / validateFieldRequest | Existing product-neutral request/adapter registry lists ETOPO2022 and NOAA geostrophic product. It has product versions/units/depth/grid/attribution; it does not supply all mandate fields or qualify additional products. priority/maxFreshAgeHours are existing technical/source-specific fields, not cross-product scientific compatibility or global freshness policy. |
| backend/fields/erddapAdapter.js createErddapAdapter / parseGridRows; fieldService.js buildField / selectField / createFieldService | Reuse bounded independent product fields, returned-grid coverage, native-stride/no-interpolation and provenance. Selecting an available field is not fusion; generic selection code is not a reviewed compatibility decision for arbitrary new providers. Viewport field delivery does not become acquisition authority for Continuous Observe. |
| backend/server.js getChlorophyllConditionsAtAssessment / getGapFilledChlorophyllConditionsAtAssessment / resolveChlorophyllObservation | Existing DIRECT/GAP_FILLED NOAA point inputs and governed selection remain distinct; no averaging. Reuse completed source recovery, not a new provider inventory. Sentinel3/Copernicus names in product direction do not implement/admit acquisition or pooling. |
| backend/observe/manifest.mjs manifest validation; qualified CURRENTS V3 contracts | Approved server manifests retain exact product/native-cell identity and captain-independent acquisition. Current manifest specifically pins the existing CURRENTS product; do not generalize it silently to new families/providers. |
| backend/durableObserve/oceanStateReader.mjs createOceanStateReader | Reuse qualified bounded accepted/live versus historical read/provenance contract; CURRENTS72h freshness and96h live age stay separate and are not transplanted to other products. Provider-neutral extension requires exact admitted inputs and versioned compatibility. |
| backend/durableObserve/retainedInputSupply.mjs resolveExplicitRetainedSelection / inspectRetainedSource; retainedBlueMarlinComposition.mjs composeRetainedBlueMarlinV1 | Exact references and retention/admission separation are reusable. Existing controlled-fixture/unavailable-history limits remain; stored input and adapter equivalence do not establish operational science. |
| docs/Operational_SST_Acquisition_Freshness_v1.md; docs/agents/architecture/P01_Living_Ocean_Source_Recovery_v1.md | Existing NOAA worker foundation/recovered exact historical frame and source limitations reused. SST freshness UNASSESSED and operational qualification unresolved; OSTIA candidate status does not establish interchangeability/fallback. |

Wind/waves/swell/salinity/tides/other categories remain in product scope; this bounded reconciliation makes no new claim that every category has a qualified retained adapter or that absent entries in the two-product field registry imply absence everywhere. P03 owns the existing provider-resilience inventory reservation; reuse its actual producer/consumer findings without duplicating it. Existing unknowns stay unknown.

Required independent compatibility review addresses physical variable/class, vertical and temporal support, native/effective resolution, requested/resolved spatial correspondence, units, uncertainty, vintage/receipt possession, quality/masks and license. Equal units, nominal grid size, timestamps, provider count or numeric agreement alone do not establish comparability/independence. Preserve same-target revisions and correlated upstream measurements/assimilation dependencies; disagreement is explicit, never averaged away or converted into fabricated confidence. No new numerical tolerances, fusion, clipping, interpolation, scoring, freshness thresholds or source preference are approved here.

P05 owns exact product/use compatibility and applicability review; P04 independently qualifies fallback/disagreement/missingness/provenance/recovery for exact implementations. Tests must cover stale/missing/invalid/conflicting support, correlated sources, unsupported compatibility, independent references and immutable as-used replay. These are future acceptance requirements, not executed tests. Operational acquisition, database/Receipt Writer, source admission, preview and production gates remain unchanged.

Compatibility, consumer-specific fallback, exact paired comparison and fusion require separate explicit reviewed decision references; none implies the others. A registry may initially contain metadata and decision references only. Registry membership never grants admission. Vertical quantity/depth/datum, vector direction, support/time/revision, uncertainty and shared source inputs remain explicit unknowns unless established. Reuse existing P3/P3-A as-used cutoff decisions and Nightly blueprint's original-as-used versus retrospective lanes; no historical evidence is rewritten. P03's existing coordination gate remains blocked, so no new inventory dispatch is authorized or relayed here.
