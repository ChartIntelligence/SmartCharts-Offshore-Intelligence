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
