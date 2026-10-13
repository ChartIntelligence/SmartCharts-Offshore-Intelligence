# Temporal Boundary Validation Manifest v1.1 corrigendum

PELORA-05 — authorized versioned specification correction; pre-execution only.

The original manifest is immutable. This successor changes only chlorophyll evidence interpretation input labels and associated explanatory/version/identity/mapping metadata. It does not change the implementation, independent oracle, scientific decisions or execution permissions.

## Exact baselines and finding

- Original frozen artifacts: `629030bcf47d6de2af9c3ecf9b0e22882ffc67ea`, `docs/agents/science/Temporal_Boundary_Validation_Manifest_v1.md` and `.json`.
- Original Markdown SHA-256: `582761b223319f0f5a52fc9cb2866ac46b5b17578c33db1a3acf1af188c67680` (18,753 bytes).
- Original JSON SHA-256: `fcc0376049b3a268932b50704e815d9f801233e4acd4e2b5042c208451f281b4` (926,695 bytes).
- Implementation under test: `dadec5dbca7d360f70f633413fb6a347dc24cac1`. This is the historical experiment target only, not the current application base or an integration authorization.

The generic `interpretation:"supported"` mismatch was discovered by read-only source inspection before execution. It is not an executed consumer failure, a passing rejection case, or R9 coverage. Recorded earlier R9 regressions remain related coverage, not equivalent execution of these exact fixtures and lanes.

## Pinned consumer predicates, inspected before correction

At the implementation SHA above, `backend/server.js` has these exact predicates inside each consumer's valid-record filter:

| Function / source lines | Required predicate | Fixture arms |
|---|---|---|
| `buildProductivityPersistence`, 33126–33127 | `interpretation === "species-neutral-surface-productivity-evidence"` | PD, PG |
| `buildClarityPersistence`, 33826–33827 | `interpretation === "species-neutral-surface-water-clarity-evidence"` | CD, CG |

The surrounding filters also require available snapshot, nonblank snapshot ID, valid time, available evidence, recognized classification/freshness ranks and finite concentration. These checks precede the R9 derived-arithmetic rejection. This correction only satisfies the interpretation predicate; it does not relax the other predicates or prove that a future harness reaches arithmetic.

## Authorized change and complete affected inventory

| Scope | Old input | Corrected input | Fixtures / record occurrences |
|---|---|---|---|
| PD, PG (all fifteen classes) | `supported` | `species-neutral-surface-productivity-evidence` | 30 / 58 |
| CD, CG (all fifteen classes) | `supported` | `species-neutral-surface-water-clarity-evidence` | 30 / 58 |
| SST, CUR | No interpretation-label change | Unchanged | 30 / 58 |

Total actual interpretation corrections: **60 fixtures / 116 records**. In the first execution subset: **24 fixtures / 44 records**. The four chlorophyll overflow fixtures are a subset of the affected inventory, not the complete correction scope. Both lane definitions share each fixture's retained records; there are not 232 independent corrected source observations.

Preserved exactly: numeric endpoint values and extreme decimal encodings, units, product/family, classifications, waterClassification, freshness/age, target/support, possession/cutoff, coordinates/roles, authority unknowns, all independent raw arithmetic and R9 expectations, lane expected outcomes, scientific-status annotations, operational_admission=false, 90-fixture inventory, six arms, fifteen classes, and the six-class 36-fixture subset. No other label normalization or compatibility repair is authorized.

## Successor artifacts and exact bytes

| Artifact | SHA-256 | Bytes |
|---|---|---:|
| [Manifest v1.1](Temporal_Boundary_Validation_Manifest_v1_1.md) | `e5ab8c5063e8d347d903c07c92d9dfdb4493296a72cae318ded2fb5bf4e49676` | 21,568 |
| [Companion v1.1](Temporal_Boundary_Validation_Manifest_v1_1.json) | `8b7edcf2f0e0408e4283cb1aa0a64fd8671c69b5922aef78a71ccf469e68512f` | 2,305,643 |
| [Full machine-readable diff](Temporal_Boundary_Validation_Manifest_v1_1_Diff.json) | `6c607cacc6377585bbe901d3292cbb81247526cce13935d4493c1cefccc8bd6c` | 1,913,901 |

The machine diff records 116 explicit old-to-new interpretation changes and a full JSON-pointer difference inventory, including version/explanatory/identity additions. It binds both old hashes and both corrected manifest hashes. Neither artifact contains its own hash. This corrigendum's hash is reported externally with the checkpoint.

All artifacts use UTF-8 without BOM, LF and a final newline. JSON is the frozen pretty-serialized bytes; reserialization must not be assumed byte-identical. No Pelora code supplied expected values.

## Input identity and original fixture mapping

Every original experiment `TBV1-{arm}-{class}` maps explicitly to `TBV1_1-{arm}-{class}`. The companion contains all 90 original/corrected fixture mappings, 174 record mappings and separate synthetic parent-reference mappings. All submitted-row and lane-reference identities follow that mapping; repeated exact reuse still repeats the same mapped identity. No source/product equivalence is inferred from the mapping.

Each fixture has two corrected input references: CONTROLLED and SOURCE_AUTHORITY. Each reference includes the exact compact `canonical_input_json`, UTF-8 byte length and SHA-256, plus original fixture identity. The hashed bytes have no BOM or terminal newline. Hash the contained string's exact UTF-8 bytes rather than reserializing its parsed object. These 180 references bind manifest inputs and lane authority selection; they are not native provider captures or executable consumer rows. The first subset enumerates 72 references for 36 unique fixtures with two lanes, not 72 independent observations.

The later harness must retain its exact projection to the pinned consumer/row/controlled-authority structures, synthetic snapshot/reference mapping, actually consumed serialized inputs and generated native capture references where applicable. It may supply required existing structural wrappers under PELORA-04 review; it may not translate corrected labels again, replace classifications, coerce scientific values, synthesize provider authority or treat impossible native-capture passage as proven. The negative extreme inputs remain intentionally nonphysical low-level software cases.

## First packet: unchanged subset under versioned mapping

Only classes 01-REUSE, 03-REVISION, 07-SUPPORT-MISSING, 08-POSSESSION-UNPROVEN, 09-LATE-POSSESSION and 15-R9-OVERFLOW, across SST/CUR/PD/PG/CD/CG. The explicit 36 IDs and both lane-reference lists are in the corrected companion. Ordinary increase/decrease cases remain excluded from this packet.

| Class | Controlled lane | Source-authority lane |
|---|---|---|
| 01 | Exact duplicate once; insufficient distinct history; A0/A1 assessments remain distinct | Missing operational authority; duplicate inspection remains |
| 03 | Same-target revision selection unresolved; no latest-wins | Unadmitted; same-target reason may take precedence over missing-authority reason |
| 07 | UNKNOWN_TEMPORAL_SUPPORT | UNKNOWN_SUPPORT_AND_EXACT_VINTAGE_POSSESSION |
| 08 | UNPROVEN_EXACT_VINTAGE_POSSESSION | UNKNOWN_SUPPORT_AND_EXACT_VINTAGE_POSSESSION |
| 09 | EXACT_VINTAGE_POSSESSED_AFTER_CUTOFF | UNKNOWN_SUPPORT_AND_EXACT_VINTAGE_POSSESSION |
| 15 | Pinned consumer's local R9 null/unavailable tuple, only after valid controlled inputs reach arithmetic | No selected operational history; R9 need not be reached |

Independent oracle remains elementary subtraction and circular geometry: 2°F SST difference, 1-knot speed difference, 20° unsigned circular separation, mathematical 0.3 mg m⁻³ chlorophyll difference with the original binary64 representation note, and 2M overflow to a null exposed failed delta. Same-target revisions have zero represented duration; ordinary selected pairs six hours. No scientific tolerance is added. R9 applies only to the four already-qualified persistence consumers; finite documentary siblings do not certify the failed tuple.

## Verification performed and independent gate still required

Artifact serialization/inspection only: original local Git blobs matched both frozen hashes; corrected companion embeds the exact corrected Markdown; all 174 records were checked against original values/authority with only the authorized interpretation changes and identity metadata; all original per-fixture oracles and existing lane outcomes remained equal; all 180 input-reference hashes/lengths and lane bindings verified; subset maps exactly back to the original 36 IDs. This is not an application test or execution of the temporal experiment.

PELORA-04 must independently verify the authorized full diff and preserved oracle, exact fixture/capture/row/lane binding, required consumer validity predicates, actual R9 reachability, missing/late-authority rejection and reason precedence. A successful import or rejection alone is not evidence that arithmetic ran. It must inspect the harness's dependency/import closure, existing installed tooling and enforced outbound-network denial before clearance. No application server, publication, database, provider, credentials, installation or quarantined consumer invocation is allowed.

PELORA-01 owns harness and execution only after publication A, checkpointed corrected artifacts and PELORA-04 clearance. Any additional incompatibility is a separate finding; do not silently broaden this correction. A new science/numeric expectation or relaxed admission decision requires stopping for explicit review.

No source admission, source comparability, independence, ocean accuracy, interval persistence, confidence calibration, production change or CP-10 clearance follows from this correction. Current main checkout and unrelated untracked files are preserved. No test or application execution, service, network acquisition, database access, package install or provider outreach occurred.

TEMPORAL MANIFEST v1.1 CORRECTION READY FOR INDEPENDENT REVIEW

NOT EXECUTED — NO NEW SCIENTIFIC ADMISSION

CP-10 remains blocked.
