# Continuous Observe CURRENTS v1 — Phase 2 isolated worker

**PHASE 2 QUALIFIED — ISOLATED WORKER QUALIFICATION ONLY.** This worker has no production entry point. A qualified result is ISOLATED WORKER QUALIFICATION ONLY, not operational Continuous Observe or beta readiness.

## API and controlled boundaries

`createCurrentObservationWorker({control, policy, transport, responses, results, clock, timers}).run(handle, signal)` executes one attempt. The handle is opaque: the fake control plane issues it from a private WeakMap after validating a Phase 1 job. Passing a job object, an authorization boolean, a valid digest or a cloned handle cannot obtain execution ownership. All ports are privileged composition inputs, not request payloads. The optional signal only cancels work.

`createMemoryControl` supplies claim/check/release and test-only issue/updateActivation methods. These model protected approval and monotonically increasing fencing within one process. Revocation, expiry, duplicate execution and stale fencing fail closed. State is rechecked after asynchronous boundaries and synchronously at result acceptance. No constructor/digest proves production authorization. Trusted future registry composition must approve manifest artifact meaning and privacy; arbitrary private meaning in an approved artifact ID cannot be disproved by schema validation.

`createMemoryTimePolicy` selects an explicit canonical UTC time for the approved policy reference. Failure, wrong reference, malformed/accessor/proxy input and elapsed wait budget cannot become LATEST. Job identity remains the Phase 1 manifest/cell/scheduled-window identity, independent of discovered provider time. Coordinates come only from the authorized job. Interactive server code remains unchanged and uses LATEST.

`createMemoryResponseStore` acknowledges and reads exact synthetic response bytes. `createMemoryResultStore` has pending writes, readback, discard, and synchronous compare-and-accept. A write alone is not success. An uncertain write acknowledgment requires exact readback reconciliation; missing/corrupt readback cannot be accepted. The fake store admits at most one result per logical job. This is not durable exactly-once, distributed concurrency, crash recovery, production fencing, or persistent retry orchestration.

The clock and timer ports are injected; no ambient clock, global transport or timer starts on import. Each attempt has an overall job deadline plus bounded policy/acquisition/storage waits. Cancellation invalidates the running attempt; late continuations cannot accept evidence. Pending result writes completing after cancellation are discarded. Tests check timer/listener cleanup. Rate limits, cadence, queue orchestration, durable recovery and multi-worker coordination remain future work, not assurances of this one-attempt API.

## Scientific components reused unchanged

- [Shared provider adapter](../backend/currentProviderAdapter.mjs): TIME URL construction, response parsing, finite u/v handling, coordinate normalization, strength/direction helpers and current-vector failure locality.
- [Normalized handoff](../backend/normalizedEvidenceCapture.mjs): existing recorded-source metadata authority, normalization lineage and center-only capture.
- [CURRENTS V3](../backend/currentEvidenceCaptureV3.mjs): existing serialization, exact reference and readback validation.
- [Scientific assessment](../backend/scientificAssessment.mjs): explicit request assessment clock; no wall-clock fallback.
- Phase 1 manifest/activation/job/execution/binding validators in `backend/observe`: unchanged and still structural consistency contracts.

No parser is copied, no science formula or missingness rule changes, and no worker provenance is inserted into qualified capture bytes. Tests compare worker serialization/reference to the unchanged adapter/handoff for the same authorized inputs and assessment, including signed zero and finite-vector derived overflow.

## Acquisition, exact bytes and metadata basis

The actual transport argument is the URL produced by the shared TIME adapter from authorized job coordinates and the selected policy time. Request size is bounded. The controlled transport envelope identifies the allowlisted provider/dataset and status. Raw Uint8Array/Buffer input is copied using intrinsic typed-array operations; accessors, proxies and shared-memory mutation cannot replace its byte meaning. Response size is bounded before copying. UTF-8 and table shape are checked operationally, while all numeric interpretation stays in the adapter.

The raw-response reference SHA-256 hashes the retained bytes, including original whitespace. Parsing uses the read-back bytes after exact digest/content reconciliation. No object reserialization is described as original response bytes. The capture and returned record are detached/frozen. Corrupt response, capture/reference or result readback fails before acceptance.

Provider/dataset/grid binding in Phase 1 response provenance is explicitly request/adapter-established metadata, NOT independently provider-reported grid or revision evidence. Returned time and resolved coordinates come from the parsed response. Exact-cell/time validators reject discrepancies without tolerance/interpolation. Existing adapter longitude normalization is reused. Canonical UTC milliseconds in Phase 1 metadata preserve the instant; the qualified capture keeps the adapter's observation-time value. Revision is NOT_REPORTED.

Scheduled window, selected provider time, attempt start, request/assessment, received, raw-retained, normalized, finished and acknowledged result-retention times remain distinct fields. The injected clock cannot regress. No trusted historical-possession or receipt claim is created.

`NO_DATA` means the unchanged adapter returned `no-valid-pixel`, including missing vector components or a valid empty table; it produces no accepted usable observation or binding. It is not a global scientific conclusion about the ocean. Malformed table/UTF-8/envelope, wrong cell/time, failed transport and reference/retention failures produce operational rejection/stopping outcomes. These are separate from Phase 1's strict NORMALIZED/FAILED vocabulary; no diagnostic failure fabricates a Phase 1 execution record.

## Privacy, isolation and authority limits

There is no captain-coordinate, user/session, species, viewport, report, Place, trip, app-activity or interactive-cache input to `run`. Identical controlled jobs produce identical requests and accepted records with zero active users or poisoned app/cache composition fields. No captain identifiers enter retained provenance. Both existing synthetic Gulf and synthetic second-region fixtures pass without regional worker branches.

Synthetic density, cadence, grid and fake policy fixtures do not qualify any real sampling plan, provider-time policy, provider limits or deployment. All ports are fake/in-memory. Receipt Writer remains disabled, migration unapplied, and the PostgreSQL deployment gate remains open. No server route, database adapter, persistent scheduler, receipt integration, frontend change, Phase 3 or production enablement is included.

## Qualification and durable evidence

Immediate comparison baseline: `ad6c883c0324dcc313b5e7e720a554d11cd04679`. Historical pre-extraction reference remains `55596290561afdeaf3681afff383ab0e339aae2d`. The extraction was reused, not reopened.

[Phase 2 machine report](Continuous_Observe_Currents_Phase_2.json) contains the final disposition and individual comparison accounting. [Phase 2 evidence](Continuous_Observe_Currents_Phase_2_Evidence_v1.json) retains commands/environment, harness preparation, source/test fingerprints and original receipts. It references the [extraction archive](Current_Provider_Extraction_Evidence_Archive_v1.md) and [retained offline inputs](Current_Provider_Extraction_Retained_Fixtures_v1.json) instead of duplicating them.

Recorded environment: Windows 10.0.19045.0, PowerShell 7.6.5, Node v24.18.0, npm 11.16.0. Paired scripts use the archived network-denial setup, 512 MiB old-space, 180-second per-script bound and fresh process per script with `--test-isolation=none`. Exact invocations and temporal overlap are preserved in the evidence. Isolated npm installs use the existing local cache with offline/ignore-scripts/no-audit/no-fund; dependency installation is distinct from provider acquisition.

New worker tests must all pass. Shared suites are compared individually, including assertion details and resource outcomes. Historical assertion failures and the four previously reviewed extraction preservation-ledger mismatches remain explicit baseline debt at this checkpoint. The obsolete pre-extraction source-closure failure remains superseded, not silently resurrected or relabelled. Paired archival timeouts are neither pass nor OOM. Focused, installed and broad totals overlap and are not unique coverage. Both semantic-completeness flags remain false and all nine broader provider-review obligations stay open.

Code/fixture fingerprints describe actual tested bytes. Reports/evidence document those runs afterward; they do not contain self-hashes or a predicted commit SHA. All pre-existing tracked bytes, existing checkpoint tags and excluded Supabase files must remain unchanged through final verification. Only the explicit Phase 2 files may be committed.

## Final recorded results

- New worker: 79/79; isolated installed replay: 79/79 (same cases).
- Phase 1: 105/105 on each side. Adapter: 48/48 (includes unchanged 40 exact comparisons); TIME selector: 29/29; analyzer: 17/17; correspondence/negative controls: 12/12 on each side.
- CURRENTS V3: 14/14; normalization runtime/adversarial/producer/transitive: 15/15, 13/13, 2/2, 10/10 on each side.
- Current profile baseline: {"intended":88,"started":88,"processReceipts":88,"exitZero":70,"assertionOrOtherNonzero":17,"resourceLimited":1,"tests":2112,"pass":2065,"fail":47,"manualPassRecords":0,"skipped":0,"cancelled":0}.
- Current profile candidate: {"intended":88,"started":88,"processReceipts":88,"exitZero":70,"assertionOrOtherNonzero":17,"resourceLimited":1,"tests":2112,"pass":2065,"fail":47,"manualPassRecords":0,"skipped":0,"cancelled":0}.
- All 95 paired scripts reconciled individually: no new assertion titles, changed assertion details or unexplained result differences. This is NOT an all-green profile.
- Resource outcomes: [{"file":"backend/tests/snapshotProducerQualificationV2.test.js","side":"baseline","error":"ETIMEDOUT","oom":false},{"file":"backend/tests/snapshotProducerQualificationV2.test.js","side":"candidate","error":"ETIMEDOUT","oom":false},{"file":"backend/tests/snapshotBranchOptionality.test.js","side":"baseline","error":"ETIMEDOUT","oom":false},{"file":"backend/tests/snapshotBranchOptionality.test.js","side":"candidate","error":"ETIMEDOUT","oom":false}]. Timeouts are not OOM or passes; affected case completion remains unqualified.
- Five new source/test files pass syntax and lint. Isolated offline install, import and backend test:check pass. Zero operational network attempts recorded.
- All 2024 entering file fingerprints remain unchanged. The worker is not imported by production entry points.

The qualified conclusion concerns the isolated worker and its new tests, with bounded no-regression evidence against the immediate baseline. It does not complete the historical failed/resource-limited suites or broader provider review.
