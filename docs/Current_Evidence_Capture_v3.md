# Current evidence capture v3 — partial vectors

`pelora-governed-current-evidence-capture-v3` is a narrow, uncommitted successor for the `CURRENTS` family. It does not change capture v1/v2, normalization science, temporal eligibility, provider qualification or historical evidence. The human-controlled repair decision authorizes this successor; the earlier locality contract alone did not authorize changing capture admission.

The existing point retains source availability, finite-or-null u/v, heading and speed. One required Boolean, `speedDerivationFailed`, records whether speed derivation failed with retained valid source components. It is a processing assertion bound by the exact scientific-content digest and capture identity, not a provider measurement or a new availability enum.

| State | Required representation |
| --- | --- |
| Complete available current | Source available; finite u, v, heading and speed; failure Boolean false |
| Partial available current | Source available; finite u, v and heading; speed null; failure Boolean true |
| Unavailable source | Existing unavailable source label; nullable diagnostic components; null speed/heading; failure Boolean false |
| Only one component present | Cannot claim available source/vector; diagnostic component may survive under unavailable source |
| Nonfinite source or derived numeric value | Rejected, regardless of availability |

Null speed alone never authorizes a failure claim. The new live acquisition/capture boundary derives the Boolean from its own normalized parser result with finite components and unavailable speed. Capture validation checks the closed state relationship; it does not independently requalify the provider or historical source. A finite speed with failure true, partial available vector with failure false, missing Boolean, missing component in an available vector, or nonfinite heading is rejected.

All other source profile restrictions remain inherited from the frozen schema. Exact JSON/digest rules preserve signed zero. New `cec3-` identity and version domains prevent v2 reinterpretation. Validation, exact serialization, reference verification and replay detach/freeze data. Replay includes bound lineage references and does not repair nulls or recompute speed. Existing v1/v2 readers reject v3. Explicit version dispatch keeps historical versions readable without adding normalization provenance.

`captureNormalizedCurrentConditions` acquires and normalizes a new current point before capturing it. It binds `pelora-source-normalization-v1` through the existing captured-reference lineage shape. This is an in-process capture boundary, not a new HTTP endpoint, external database write or historical migration. The live observation-snapshot builder separately supplies this processing reference to its existing lineage, carried into snapshot metadata and storage payloads. Generic/historical snapshot calls default to no processing reference; missing historical provenance never defaults to v1.

Speed-required consumers must require finite speed. Component consumers may independently validate inputs and arithmetic; a valid projection does not establish valid speed, aggregate coverage, temporal authority or source qualification. Consumer controls exercise replay into the existing projection implementation, finite required groups, source-unavailable diagnostics, signed zero and lineage through storage construction. No capture consumer receives an implicit broad scientific authority upgrade.

Verification: `backend/tests/currentEvidenceCaptureV3.test.js`, both normalization runtime suites and the governed current-runtime profile. Capture and runtime changes remain subject to final adversarial review. No normative source contract or historical capture was rewritten.

## Final review boundary

The v3 state/serialization controls pass, but the candidate is not release-qualified. The acquisition/capture export is only invoked by tests; the current live snapshot JSON handoff has not been wired to the exact v3 envelope/reference/replay. Generic snapshot lineage preserves the processing marker but is not an exact capture reference, and ordinary JSON loses signed zero.

Unavailable v3 sources may retain finite diagnostic u/v. Passing those replayed diagnostics directly to the existing projection function can produce complete projection coverage because that consumer checks finite components rather than source eligibility. An explicit reviewed adapter boundary is required before that composition is used live. This does not prohibit independently validated recomputation from genuinely valid partial-current sources. Generic v3 lineage can be empty; only the new-normalized acquisition adapter currently enforces attaching its processing reference. No schema/production behavior was changed during this review.


## Authorized live handoff repair

The preceding final-review boundary is historical and is now addressed by the narrow human-authorized repair. Capture v3 itself is byte-unchanged. The actual /api/ocean handler encodes current fields in both canonical snapshot slots before ordinary JSON transport. The unchanged browser storage-row builder passes the envelope through as snapshot_payload; the backend row adapter validates and reconstructs it before scientific consumers receive current points. No database access is needed for this composition.

`pelora-normalized-current-handoff-v1` carries the exact v3 capture text/reference, exact existing context remainder and deterministic transport checksum. Primary center/cardinal fields are replaced by the capture, not copied into a competing scientific representation. The checksum is transport integrity, not a new scientific digest. Provider metadata remains RECORDED_NOT_REQUALIFIED. Processing lineage is separately bound. Newly normalized creation requires explicit `pelora-source-normalization-v1`; wrong/missing version or lineage fails closed. Generic v3 remains valid under its original optional-lineage semantics. Historical v1/v2 and unmarked historical snapshots are never relabelled.

Signed zero and partial/unavailable diagnostic states survive HTTP JSON, actual browser row construction and backend replay. Marked normalized raw-point replay is rejected. Projection requires explicitly available source evidence before checking finite components and independent arithmetic. Unavailable diagnostics cannot supply coverage; available partial vectors may independently produce finite projection facts. Existing speed-required consumers remain speed-required, and existing coverage thresholds are unchanged. The new composition is covered by currentEvidenceCaptureV3.test.js (14 cases), the runtime/adversarial suites and the complete fixed-copy 88-script release profile. Candidate remains uncommitted for human review.
