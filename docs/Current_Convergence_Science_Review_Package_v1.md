# Current Convergence Scientific Review Package v1

Task 12B.6X. Repository revision `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`.

**Verdict preserved: CONVERGENCE_CONTRACT_DECISION_REQUIRES_SCIENCE_REVIEW.** This package prepares scientific review; it selects no contract, formula, threshold, implementation or literature. It concerns the current default production provider, not arbitrary injected callbacks.

## Exact scientific question

**What scientific statement, if any, may Pelora truthfully make from its existing horizontal radial-geometry candidate, and what evidence (if any) is necessary before that statement may be represented as `currentConvergenceDetected=true` or contribute convergence support to Ocean Physics?**

The [machine-readable companion](Current_Convergence_Science_Review_Package_v1.json) retains 33 evidence records from the prior V/W audits, including repeated controls/replays. These are not 33 independent experiments or live environmental observations. Source hashes bind the repository evidence used here; this is not an authority freeze.

## Existing algorithm and evidence requirements

Production chain: `getOceanConditionsAtAssessment` → `getCurrentSpatialStructureAtAssessment` → assessed current point acquisition/parser → `buildCurrentVectorProjectionAnalysis` → `buildCurrentConvergenceAnalysis` → current evidence and Ocean Physics → snapshot. See [server.js](../backend/server.js), particularly functions at lines 1343, 2345, 2642, 3424, 3503 and 5239.

The sample request layout is north/east/south/west at radius 15 nautical miles. Latitude offset is `15/60` degrees; longitude offset is `15/(60*cos(latitude*pi/180))` degrees, guarded by `abs(cos(latitude)) > 0.01`. At center `(25,-90)`, requested points are `(25.25,-90)`, `(25,-89.72415552025937)`, `(24.75,-90)`, `(25,-90.27584447974063)`. A separate center current is acquired but is not part of the convergence predicate. Requested coordinates do not prove distinct resolved source cells.

For eastward/northward components `(u,v)`, inward unit axes are N `(0,-1)`, E `(-1,0)`, S `(0,1)`, W `(1,0)`. Signed radial projection is `r=u*inwardEast+v*inwardNorth`; inward is `max(r,0)`, outward is `max(-r,0)`. Vector magnitude is `hypot(u,v)`. Tangential projection/alignment are produced separately; neither is a convergence gate.

**Projection fields passed to convergence are rounded with `Number(value.toFixed(4))`.** Thus thresholds apply to rounded projections, not raw provider components or speed in knots.

Let `V` be available projections with finite signed radial, inward and outward values; `M` those with inward ≥0.05 m/s; `S` those with inward ≥0.15 m/s; `O` those with outward ≥0.05 m/s. Let `P` be unique opposing direction pairs among `M`.

- Evaluable: upstream `sufficientCoverage === true` and `|V| ≥ 3`; projection sufficiency itself requires three valid projections.
- Candidate: evaluable, `|M| ≥ 3`, and `|P| ≥ 1`.
- Pronounced candidate: additionally `|V| ≥ 4`, `|M| = |V|`, `|O| = 0`, `|S| ≥ 3`, and finite mean inward across `M` ≥0.15 m/s.
- Other states: no meaningful inward support → `no-convergence-candidate`; some support without distributed support → `localized-inward-flow`; insufficient coverage → `unavailable`. Candidate state is `candidate`, with strength `measurable` or `pronounced`. These are existing labels, not a detection decision.

Returned means/maxima are rounded again after classification. There is no convergence confidence estimate, uncertainty test, magnitude-balance gate or cross-vector gradient gate. Availability means the analysis can be evaluated, not that a candidate exists.

Each available point must have finite components and usable represented time. [Assessment governance](../backend/scientificAssessment.mjs) rejects future and available-but-untimed evidence; cache hits/in-flight evidence are reassessed against explicit assessment time. Convergence does not enforce equal/compatible sample dates or an age cutoff. The default caller fixes the NOAA CoastWatch product and component variables; convergence does not compare provider release or quality consistency. Rejected requests are filtered before projection construction: its requested count describes retained vectors, so “complete” projection coverage need not mean all four original requests succeeded.

## Controlled evidence matrix

Assessment is `2026-09-26T01:00:00Z`; default represented time is `2026-09-24T00:00:00Z`; center is `(25,-90)`. Unless overridden, inward mode is N `(0,-0.06)`, E `(-0.06,0)`, S `(0,0.06)`, W `(0.06,0)` m/s. Center is `(0.5,0.2)`. Synthetic transport enters actual production assemblers; final candidate objects are not fabricated. Exact per-case inputs/results and V/W identifiers are retained in JSON.

| Already demonstrated case | Existing result |
|---|---|
| Complete inward 0.06 m/s | Available `convergence-candidate`, measurable; no produced detection Boolean |
| Complete inward 0.2 m/s | Pronounced candidate |
| Inward 0.0499 / 0.05 / 0.0501 m/s | No candidate / measurable / measurable |
| Inward 0.1499 / 0.15 / 0.1501 m/s | Measurable / pronounced / pronounced |
| One missing direction (east) | Candidate from remaining three |
| Two missing directions (east/west) | Insufficient/unavailable |
| Center missing, directions intact | Candidate despite unavailable current evidence group |
| Unequal inward N 0.06, E 1, S 0.06, W 0.2 | Candidate; meaningful inward mean 0.33; shear and edge also present |
| Mixed dates N Sep 24, E Sep 25, S Jan 1 2020, W Sep 26 | Candidate; no cross-sample time-coherence gate |
| Adjacent Sep 24/25 dates | Candidate; represented instants differ even within the freshness window |
| All represented dates Jan 1 2020 | Candidate remains emitted; does not establish current evidence |
| One future or untimed direction | That point rejects; remaining three can produce candidate |
| All future or all untimed | Unavailable/insufficient |
| Empty rows / rejected acquisition | Unavailable; source states distinguish no-valid-pixel/provider-unavailable |
| Uniform `(0.5,0.2)` vectors | Localized inward flow, not candidate |
| Strong inward 1 m/s | Pronounced candidate overlapping shear and edge |
| Shear arrangement N `(1,0)`, E `(0.1,0)`, S `(-1,0)`, W `(0.1,0)` | Localized inward flow, shear and edge; no convergence candidate |
| Cold, warm and later execution replay | Same retained convergence evidence |

Mixed-date/extreme-stale tests establish accepted-chain behavior, not that the live daily product normally supplies such combinations. No new environmental acquisition occurred.

## What the candidate supports—and what remains unestablished

It supports the narrow statement that accepted sampled horizontal vectors satisfy the existing inward radial support rule under the stated geometry and rounding. Strength labels describe that rule's magnitude/support conditions. Missingness, evaluability and candidate state are distinct.

It does **not establish** a simultaneous or persistent physical feature, vertical velocity/downwelling/upwelling, accumulation, coherence beyond sampled geometry, independent source agreement, calibrated confidence, biological effects, fish presence, habitat quality or catch probability. These are limits of this evidence, not newly imposed confirmation requirements. Persistence is not automatically required for every possible scientific claim.

The [dataset registry](../backend/fields/datasetRegistry.js) declares a 0.25-degree, daily, altimetry-derived geostrophic-current product. Exact temporal averaging/support, provider uncertainty and provider release are not established for this claim. [Archive documentation](Ocean_Product_Archive_Foundation_v1.md) cautions against treating a daily timestamp as an instantaneous observation. Cardinal labels determine projection axes; current candidate logic does not establish distinct grid-cell support, balanced magnitudes or temporal synchronization. Shear, edge and convergence reuse observations and can overlap; they are not independent confirmation.

## Producer/consumer mismatch: separate from scientific sufficiency

Production emits the rich convergence candidate object but does not populate its nested `currentConvergenceDetected`. No intermediate translator or second-stage confirmation threshold was found in the preceding audit. Other similarly named fields elsewhere do not populate this nested handoff.

Three consumers—`buildMixingZoneAnalysis`, `buildEnvironmentalTransitionAnalysis`, `buildOceanOrganizationAnalysis`—require both `currentConvergenceDetected === true` and `convergenceState === "candidate"`. Missing, false and wrong-type values do not satisfy strict Boolean equality. `buildCurrentEdgeAnalysis` also reads the Boolean as optional corroboration; it is not a translator.

**NON-PRODUCER DIAGNOSTIC EVIDENCE:** manually adding true to a clone after the actual runtime trace changes isolated consumer hydrodynamic signals 0→1, organization index 1→2, and uniform→hydrodynamic-transition context. This proves consumer sensitivity only. It does not prove producer reachability, scientific sufficiency, intended detection semantics or a scoring benefit. Recomposition retained equal confidence/summary/environmental Opportunity evidence in the recorded comparison.

Hydrodynamic counts combine edge/convergence/shear flags. Organization index is contextual corroboration, not a calibrated probability or fishing-quality measure. Snapshot representation retains candidate evidence alongside current false detection behavior. Internal narrative fields do not establish what a final captain-facing interface renders.

## Scientific reviewer questions and required answers

1. Define scientifically defensible meanings of candidate and detected, if detection is justified; distinguish sampled signature from physical feature.
2. Is the requested/resolved geometry and product resolution sufficient for that claim? State spatial limitations.
3. What represented-time relationship is defensible, considering adjacent/mixed dates, stale components and independently requested last values?
4. What do the existing rounded 0.05/0.15 m/s rules establish given known/unknown uncertainty, unequal magnitudes and opposing-pair support?
5. What claims remain defensible with three directions, absent center, failed requests or unavailable evidence?
6. How should overlap with shear/edge be explained without counting correlated evidence as independent confirmation?
7. Does the particular claim require persistence/continuity, or would that support a stronger claim? Justify either conclusion.
8. Can a scoped Boolean preserve uncertainty and unavailable/insufficient/candidate distinctions, or is a richer representation necessary?
9. What evidence may justify convergence support in hydrodynamic context and organization index, without implying an Ocean Signal or Opportunity?
10. What captain-facing wording is defensible for candidate, unavailable and any justified detected state?
11. Which conclusions are supported now, which remain uncertain, and what additional scientific validation, if any, is needed?
12. Provide explicit claim boundaries, examples/counterexamples and unresolved issues for a separate contract/versioning review before software work.

No answers are selected here. Prohibited assumptions include candidate=detected, horizontal convergence=downwelling, convergence=fish presence/Opportunity/catch probability, mandatory persistence without justification, or an arbitrary new threshold. Neither the opposite permanent candidate≠detected axiom nor manual substitution establishes a contract.

## Governance and blocked software gates

Evidence precedes conclusion; uncertainty/unavailability must not be upgraded. Stale evidence must not masquerade as current. Environmental interpretation stays species-neutral. [Publication governance](Four_Hour_Governed_Publication_v1.md) keeps Ocean Signals separate from Opportunities and distinguishes unavailable/partial/governed-zero outcomes. [Product vision](SmartCharts-Vision.md) supports captain judgment rather than replacing it. A false consumer default is not a measured absence finding.

Blocked sequence: scientific review → separately reviewed contract decision and versioning/backward-compatibility scope → any separately authorized amendment/validation → renewed Ocean Physics qualification → later model/authority gates. This packet authorizes none of those steps. No alias, new Boolean, threshold, formula, revised model, optionality/requirement authority, proposal, freeze or projection v3 is created.

Ocean Physics, Task 12B.6C and Task 9E-D remain paused. Original nine areas remain BLOCKING_UNRESOLVED; astronomy remains qualified; `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains open.

## Verification

Current source and retained cases were checked; network-blocked reruns passed convergence decision 5/5, convergence contract 6/6 and Ocean Physics boundary 6/6. These 17 diagnostics preserve the science-review STOP, not a detection qualification. No fresh full-regression claim is made for this documentation-only task. JSON/reference/hash and whitespace checks accompany final verification. Production and all 80 pre-existing untracked files remain unchanged. No web research, provider/database/Auth access, environmental acquisition, staging, commit, tag, push or deployment.
