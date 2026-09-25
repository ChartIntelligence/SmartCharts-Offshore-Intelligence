# Task 12B.6B — Governed current-product evidence capture

Baseline: `af83f03f165e3bd23024e47e8a0d11e0a6f95c53`.

**PASS for the implemented normalized point-source capture/replay subset. Full candidate reconstruction, source qualification and shared evaluation remain unqualified.** This task does not reopen the prior source-authority finding: synthetic mechanics cannot supply production source authority.

## Audit and boundary

The companion `Current_Product_Capture_Matrix_v1.json` classifies all 24 prior groups, preserving source/consumer references. It distinguishes existing contracts, required capture, deterministic derivations, request-only information, species configuration, captain projection and unresolved inputs. No group is silently promoted to qualified live evidence.

The implemented boundary is the species-neutral source projection of the normalized current point returns from `getSeaSurfaceTemperaturePoint`, `getChlorophyllConditions`, `getGapFilledChlorophyllConditions` and `getCurrentConditionsPoint`. The actual functions are exercised with synthetic transport responses. Projection explicitly excludes `ageHours`, current operational `derived` descriptions and cache metadata. No full candidate assembler or species evaluator is invoked as the acceptance criterion.

SST captures Celsius/Fahrenheit values, original timestamp text and timestamp provenance, requested/resolved coordinates, separate provider coordinates when supplied, and source provider/classification/availability. Chlorophyll captures concentration, already classified water character, represented timestamp text and exact permitted direct or gap-filled source metadata. Water classification is a preserved existing neutral derivation, not recomputed by a new formula. Current capture retains speed, direction, east/north components, original timestamp text, coordinates and exact source variable/unit/direction convention metadata. Units are explicit source metadata where emitted and encoded by existing numeric field names otherwise. Unknown family or payload fields fail closed.

Current source identity values are constrained to the audited products. Direct source absence of `observationType` stays absent; gap-filled DINEOF identity remains explicit. Optional fields remain absent rather than gaining defaults. Source revision is not emitted by these current point returns; no revision is invented. Exact upstream source/capture provenance may be bound by governed references, but their resolution and qualification remain outside this pure module.

## Contract and authority

`pelora-governed-current-evidence-capture-v1` has one tagged family per capture: `SST`, `CHLOROPHYLL_DIRECT`, `CHLOROPHYLL_GAP_FILLED`, or `CURRENTS`. Each sample has a unique explicit role (center/north/east/south/west), fulfilled/rejected outcome and a source point or null. There is no requirement that a capture contain a complete candidate neighborhood: completeness is a future assembler responsibility. Rejected acquisition has null payload and no copied exception text. Fulfilled missing pixels retain the original nulls and availability metadata.

Source identity, source-authority reference, capture identity and scientific-content digest are separate. `SYNTHETIC_FIXTURE` and `RECORDED_NOT_REQUALIFIED` are provenance declarations, never provider authentication or new qualification decisions. A caller can construct a self-consistent object; it still cannot authenticate a provider. The module has no public route, environment variable, client field, registry qualification mutation or production integration.

`scientificContentDigest` binds contract, tagged family, sample ordering, outcomes and complete retained point content including scientific source metadata. `captureId` additionally binds source-authority declaration and audit lineage references. Changing lineage/authority changes capture identity even when point science stays identical. The captured-reference SHA-256 binds the entire canonical record. No random value, request ID, captain ID or execution clock is an identity input. Source observation timestamps remain meaningful content, not capture execution time.

## Spatial, static and quality limits

Directional source samples retain asymmetric coordinates, values, roles and array order. Repeating a role fails; reordering distinct roles changes content identity. This preserves assembler inputs, not a newly inferred spatial structure. Derived SST orientation/coverage/confidence, current gradients/edges/organization, surface-water relationships and full family layer state still require the same existing assemblers in the next reconstruction task. Supplying invented `derived` spatial output to this source schema fails.

Bathymetry and static structure remain in their existing candidate/static contracts. Tests reuse `resolveOpportunityCandidateBathymetryV1`; no bathymetry capture schema or fabricated static timestamp is added. Source coordinates are environmental sample coordinates, not captain origin.

Source availability and acquisition outcome are captured independently of storage. Valid numeric zero remains numeric, null remains null, and an available source with missing numeric components fails validation. No capture success upgrades scientific quality. Full data-quality layers (live/stale/degraded/unavailable) are not in this point-source subset: they must be derived from frozen family outcomes, values and existing freshness rules. Arbitrary quality fields/flags are rejected, not interpreted as good quality.

The current point products do not supply a governed land mask/uncertainty array in this shape. Such fields are not fabricated or silently stripped. Ocean Product Frame continues to preserve its own qualified missing reasons, uncertainty and masks; replaying them through current-product point semantics requires separate mapping. An invented land mask is rejected and no land cell becomes zero. This is an explicit unresolved subset, not blanket qualification of land/mask handling by the new capture.

## Time and reassessment

Capture preserves supplied timestamp text exactly, including missing/ambiguous/malformed text as documentary source input; it never labels that text a qualified instant. The age view requires explicit governed assessment context, a valid strict UTC timestamp and a fulfilled sample. Missing, malformed, timezone-ambiguous and future evidence cannot produce a valid age. Capturing such records for audit is distinct from admitting them scientifically.

For valid UTC samples, `captureSampleAgeV1` invokes the existing `scientificAgeHoursV1`, without a new formula or clock fallback. One-hour and later 25-hour reassessments are tested, as is operation inside an active assessment guard. `ageHours` is rejected as stored source truth. Operational cache TTL/retrieval/execution times are excluded. No NOAA nominal time, support interval or product substitution is introduced.

## Privacy, validation and immutability

Construction clones only ordinary own data properties, rejecting inherited objects, custom array prototypes, accessors, symbols, cycles, sparse/non-data arrays and nonfinite numbers. Unknown top-level/nested fields, species outputs and private keys fail closed. Dedicated private names in metadata/quality-flag patterns are checked; these metadata structures are not admitted as arbitrary extensibility. Email/UUID-shaped values are rejected. Opaque governed references still require upstream privacy/provenance governance; the module cannot recognize every private fact hidden inside an opaque identifier.

Outputs and replay payloads are detached and deeply frozen. Canonical JSON sorts object keys while preserving array order. Reads require canonical bytes, verified identity/digests and exact schema; duplicate keys, noncanonical serialization and substitutions fail. No generic JSON bag of interpreted species results is accepted.

## Archive and V3 composition

Ocean Product Archive remains a Frame archive. The new capture is NOT a Frame and cannot be submitted as one. Its `rawEvidence` reference metadata can bind the capture identity/SHA as `reference-only`; the test proves reference compatibility, not archive storage or durable readback of capture bytes. No capture writer, storage backend, alternate archive semantics or resolver is implemented. Exact capture bytes must eventually be retained and resolved separately under reviewed infrastructure.

V3's existing `captured` reference can bind the canonical capture in frozen evidence. A synthetic V3 publication test verifies that binding without changing V3. This is input-reference propagation only: it does not establish source authenticity, provider qualification, history consumption, candidate reconstruction, cross-product equivalence or species scientific equivalence. No archive/V3 amendment was demonstrated for the reference composition used here.

## Equivalence and remaining work

Four parser-to-capture tests use the actual current normalization functions with synthetic transport. Every retained source leaf is compared exactly; their field-level results are included in the machine-readable matrix. Valid UTC ages are derived-equivalent. No meaningful field mismatch is normalized away. Omitted current operational derivations are explicitly unresolved; cache fields are non-scientific request-only. There are zero unexplained mismatches in the tested source projection, not a claim of full request payload equivalence.

Synthetic fixtures prove representation, same-product-shaped parsing, strict validation, identity, immutability, input replay and failure behavior only. They do not prove live provider reliability, represented-time authority of actual data, provider authenticity, production freshness, cross-product interchangeability or operational source capture. Tests mock transport exclusively; replay itself performs no requests and requires no Auth.

Next gate: qualify/integrate frozen capture of the SAME current request-product source projections and acquisition outcomes, then reuse/extract existing neutral assemblers for candidate input-to-input equivalence. Preserve missing/ambiguous temporal authority as unresolved. Source qualification, complete spatial/quality reconstruction, production reference resolution and static evidence binding must be reviewed before full shared species evaluation. Historical chlorophyll/current sequence equivalence, lookback and storage policy remain outside scope.

No existing runtime, request route, frontend, provider qualification, species/scientific formulas, thresholds, identities, V3, archive, Task 12B.1 or Task 11E files changed. Task 9E-D remains paused. No database/Auth/Supabase access, new environmental acquisition, source replacement, scheduler/storage selection, commit/tag/push/deployment.

## Verification

51 focused tests pass. All 38 backend/shared scripts pass with the network-denying preload, including source boundary 7, prior reconstruction diagnostic 14, 12B.5 100, 12B.4/12B.3 13/13, 12B.2 9, 12B.1 42, 12B diagnostic 9, 12A.2/12A.1/publication v1 87/75/57, Task 11E 56, Frame/archive/scalar delivery/Task 11B 17/36/44/22 and Opportunity/governance regressions. Syntax, JSON and whitespace/diff checks pass. Ignored detailed logs and the exact new-file diff are under `.local/ocean-quarantine/task12b6b-capture/`.

Validation work corrected the test harness's V3 attempt lookup before completion. Inherited/accessor/array-prototype, private metadata, nonfinite values, swapped source/component metadata, mutation, canonical duplicate-key and digest-substitution attacks are covered. No scientific defect required a formula or threshold change. This is ready for adversarial review, not a claim that production source authority or complete candidate reconstruction has passed.

## Final adversarial review

Two capture-boundary validation defects were demonstrated and corrected without altering current science:

1. Removing reconstruction markers from a gap-filled point still allowed capture. The current gap-filled path supplies observation type, algorithm, resolution and experimental markers even for its no-valid-pixel result. All four markers are now required and their existing values validated. Direct and gap-filled source identities remain separate.
2. The age view previously produced a numeric SST age after removal of `timestampProvenance`. It now requires the existing `marine-current-block-valid-time` marker before computing SST sample age. Capture may still preserve absent/null provenance for audit, but cannot derive SST age from it. This is capture-age validation, not a change to the locked assessment formula.

The expanded review covers family/product/metadata swaps, missing markers, every retained vector component/coordinate, directional reversal/removal, zero/null/unsupported missing reasons, unsupported quality channels, nested private data, prototype keys, getter/setter boundaries, digest tampering, future/invalid time, reassessment, and deep replay immutability. A test-harness expectation was corrected: reversing a one-element frozen array is a no-op, so a real array write is used to test immutability.

The four actual-parser synthetic-response comparisons still preserve all 62 retained leaves exactly. The 24-group counts remain 3 existing, 7 capture-required, 7 derivable, 2 operational, 1 species, 1 captain and 3 unresolved. No classifications were promoted by this review. Full quality layers, mask/uncertainty mapping, candidate spatial derivation, ambiguous temporal authority and durable resolution remain open.

Timestamp substitution inside an existing capture fails integrity validation; new acquisition/retrieval/assessment/nominal-time fields are rejected. A newly fabricated, internally consistent record bearing a permitted time/provenance label can still be constructed and remains unqualified: this serializer has no provider-authentication oracle. The marker requirement does not establish real represented-time authority. Source-qualification and synthetic-fixture limitations remain prominent and unchanged.

Archive remains reference-only and V3 compatibility remains reference propagation only. No source resolver, complete candidate reconstruction, species evaluator, production storage or runtime integration was added. The next gate remains actual same-product capture integration/reference resolution plus existing candidate spatial/quality/state reconstruction.

Final review verification: 96 focused tests pass; all 38 backend/shared scripts pass with the network-denying preload (the final focused rerun includes the added asymmetric current-vector case). All requested prior Task 12, Opportunity/governance, Task 11E, Frame/archive/scalar/Task 11B regressions pass. Syntax, JSON, new-file whitespace and diff checks pass. Fresh parser outputs again produce 62 EXACT_MATCH retained-field comparisons. Logs are ignored under `.local/ocean-quarantine/task12b6b-review/`. Task remains uncommitted for review.
