# Current Ocean Scientific Reconstruction Boundary v1

**Verdict: SEMANTIC_PROJECTION_SHAPE_REVIEW_REQUIRED — STOP.**

Baseline: 53b288120f764ec299d50cc8e83fff351e6d66dc, checkpoint-candidate-semantic-projection-v1.
No candidate reconstruction implementation or new contract was created. All four locked contracts remain unchanged.

## Demonstrated boundary

The actual current Open-Meteo SST point parser accepts explicit transport null as normalized missing SST. The unchanged spatial assembler, with four missing directional samples, returns insufficient coverage and null spatial measurements, orientation facts and confidence facts.

The locked semantic registry admits only populated primitive types at 16 corresponding scientific path patterns. Projection therefore reports 22 concrete unresolved paths (two temperature fields repeated across four samples). The two-sided guard refuses even a comparison of this current object with itself. This is correct fail-closed behavior outside its reviewed shape corpus, but it blocks the new missing/partial-state reconstruction qualification.

A one-finite-neighbor case independently demonstrates the same class of boundary: insufficient coverage legitimately yields null range. A four-finite-neighbor control remains within the old reviewed boundary and self-compares EXACT_MATCH. That control is not a reconstructed-path acceptance test.

No current-product measurement gap, capture-authority conflict, scientific formula defect, or species effect was demonstrated. The normalized missing directional points serialize and replay exactly through the existing current-evidence capture.

## Exact blocking paths

All patterns below begin with /sst/derived/spatialStructure/:

- classification
- minimumFahrenheit
- maximumFahrenheit
- rangeFahrenheit
- orientation/coolSide
- orientation/warmSide
- orientation/dominantAxis
- orientation/dominantDifferenceFahrenheit
- orientation/eastWestDifferenceFahrenheit
- orientation/northSouthDifferenceFahrenheit
- confidence/axisSeparationFahrenheit
- confidence/dominantDirectionalDifferenceFahrenheit
- confidence/secondaryDirectionalDifferenceFahrenheit
- confidence/sampleAgeHours
- samples/*/temperatureCelsius
- samples/*/temperatureFahrenheit

Every demonstrated value is null. All paths already have scientific authority in the locked registry; their null shape is unreviewed. The diagnostic neither demotes these paths nor edits the registry.

Actual producers and consumers:

| Boundary | Existing function | Authority |
| --- | --- | --- |
| Transport to normalized source | getSeaSurfaceTemperaturePoint, server.js:6173 | Exact same-product directional point evidence; missing remains null |
| Samples to spatial structure | getSstSpatialStructureAtAssessment, server.js:6988 | Existing coverage/minimum/maximum/range logic |
| Directional relationships | deriveSstTransitionOrientation, server.js:6305 | Existing orientation logic |
| Spatial confidence facts | assessSstTransitionConfidence, server.js:6498 | Existing coverage/represented-time/assessment logic |
| Candidate Ocean evidence | buildTemperatureEvidence, server.js:10530 | Reads SST spatial evidence before species interpretation |
| Comparison guard | candidateSemanticProjection.mjs | Retains unresolved shapes and refuses equivalence |

## Scope and dependency accounting

The machine-readable map inventories all **5,835 scientific registry paths** from the locked projection. It traces the 16 demonstrated blocking patterns. The remaining 5,819 paths are explicitly marked NOT_REQUALIFIED_AFTER_STOP / UNRESOLVED for this new reconstruction audit, not falsely claimed as traced or as newly missing source evidence. This is an incomplete qualification preserved at a mandatory stop, not a complete scientific dependency-map PASS.

Path A for the diagnostic is synthetic transport through the actual parser, existing cache wrapper and existing spatial assembler at an explicit assessment context. No spatial algorithm is reproduced in test code.

The only Path B work completed is capture, serialization, validation and replay of those normalized directional points. No derived spatial object is copied to a reconstructed path. Complete quality/marine/spatial/candidate assembly is not implemented after the locked-registry barrier.

No new companion, resolver, storage port or scientific identity is created.

## Results and uncompleted work

| Requested area | Result |
| --- | --- |
| SST normalized missing source capture | EXACT_MATCH; source availability and nulls preserved |
| SST spatial missing-state projection | STOP: 22 concrete unresolved paths / 16 registry patterns |
| Partial SST spatial state | Same blocking shape class |
| Populated SST spatial control | Existing reviewed projection passes; self-comparison only |
| Three-capture composition and marine/chlorophyll/current reconstruction | Prior qualifications intact; complete new reconstruction not attempted after STOP |
| Candidate/location binding | Test sample coordinates preserved; governed candidate identity attacks and complete binding not qualified |
| Assessment binding | Same explicit assessment supplied to diagnostic; complete candidate binding not qualified |
| Static water-mask/bathymetry reconstruction | Not requalified; no temporal/static substitution |
| Scientific provenance | Exact captured SST point source preserved; full candidate provenance reconstruction not qualified |
| Quality/state and all 16 requested scenarios | Missing/partial SST states investigated; full requested matrix blocked, not reported as passing |
| Projection attacks | Locked guard rejects legitimate unreviewed null shapes; changed reviewed spatial values and -0/0 remain distinguishable |
| History/retrieval/captain/Auth isolation | Locked 12B.6F regressions retained; no new reconstructed candidate isolation claim |
| Later-clock behavior | Normalized capture replay runs with Date.now and fetch prohibited; full candidate later-clock replay not qualified |
| Immutability | Captured/replayed points deeply frozen; mutation rejected |
| Species evaluation | Not run; no eligibility/score/confidence/rank/identity claim |
| Masks/uncertainty | No expanded raw array consumption demonstrated; broader mapping remains unresolved |
| Archive/V3 | Unchanged; no new reference compatibility or durable-resolution claim |

Quality time is not replaced by represented or assessment time. The null sampleAgeHours result is an unavailable derived fact, not fabricated age. No source age is repaired or invented.

UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED remains open. The SST null case exercised here preserves null in its actual parser; it does not repair or approve the separately demonstrated marine converter behavior.

Synthetic fixtures prove this source/shape diagnostic and replay mechanics only. They do not qualify provider authenticity, operational freshness/reliability, product interchangeability or production sources.

## Next gate

Separately review legitimate missing/partial spatial shape coverage in pelora-candidate-semantic-projection-v1, based on actual current producer/consumer states. Do not broadly permit arbitrary nulls or weaken unknown-field handling. This task does not amend that locked contract.

After that review, resume Task 12B.6C capture-derived scientific reconstruction, including complete spatial/provenance/static context and exact candidate/assessment binding. No new capture is justified by the present finding. Unified species-evaluator qualification remains blocked until candidate scientific evidence equivalence is established.

## Verification

Focused diagnostic: 10 tests passed with network blocked.
Full network-blocked regression: 45/45 backend/shared scripts passed, including semantic projection 113, complete-object diagnostic 10, companion 108, weather/marine 80, current capture 96, temporal primitives 100 and all prior Task 12, Opportunity/governance, Task 11E, Frame/archive/scalar/Task 11B suites. Syntax: 81 modules passed. JSON: 16 files parsed. Whitespace and git diff --check passed. No frontend change or build required. Logs are ignored under .local/ocean-quarantine/task12b6c-scientific/.

Only the diagnostic test and two report/map files are added. Source parsers, three captures, semantic projection, spatial/marine science, habitat, eligibility, gate, score, confidence, ranking, persistence, candidate/Opportunity identity, provider qualification, freshness and assessment science are unchanged. Runtime, frontend, V3/archive, Task 12B.1 and Task 11E are unchanged.

Task 9E-D remains paused. No provider/database/Auth/Supabase access, environmental acquisition, commit, tag, push or deployment. Work is uncommitted for adversarial review.
