# Continuous Observe CURRENTS v1 — Phase 1 contracts

Status: offline control-plane contracts only. No startup import, provider transport,
timer, persistent scheduler, database adapter, request integration, or Receipt Writer
integration. All manifests in tests are synthetic, including their density and cadence.

## APIs and trust boundary

- `backend/observe/canonical.mjs`: detached data admission, canonical serialization,
  domain-separated SHA-256, strict UTC and numeric primitives.
- `manifest.mjs`: `createManifest`, `validateManifest`, `readManifest`,
  `gridReference`, `samplingReference`, `manifestReference`.
- `activation.mjs`: `createActivation`, `validateActivation`, `resolveActivation`.
- `jobs.mjs`: `createJob`, `validateJob`, `authorizeJob`, `planJobs`.
- `provenance.mjs`: `createExecution`, `validateExecution`, `createBinding`,
  `validateBinding`, `attemptIdFor`.

All returned contracts are detached and deeply frozen. All object schemas use exact
field allowlists. Constructors validate content and compute identities; they are
not authorization minting APIs. `createJob` describes a structurally valid job;
only the planner/authorization validator checks activation.

The caller supplies `trustedState` containing the approved manifest reference and
the current activation digest/revision. It MUST come from future protected registry
composition, never an HTTP request, session, captain input, or self-asserted record.
Validation fails for mismatched manifest approval, stale activation revision/digest,
disabled/revoked state, or time outside activation/manifest validity.

Pure code cannot prove that a provider request happened, that a retention store
committed bytes, or that a fencing token owns a durable claim. Binding assurance is
explicitly `STRUCTURAL_CONSISTENCY_ONLY_REQUIRES_TRUSTED_EXECUTION_WITNESS`.
Later trusted execution/storage must establish these facts. No Phase 1 API grants
receipt authority or accepts an `authorized: true` assertion. Do not expose contract
constructors as request-handler authorization services.

## Manifest identity and scope

Contract: `pelora-continuous-observe-manifest-v1`.

Required fields cover ID/version, region, coverage/mask references, exact compatible
CURRENTS product, adapter reference, native grid descriptor/reference, sampling
set/reference, schedule, provider-time policy, bounded limits/retries, and effective
times. The fixture provides a complete executable schema example.

The current product profile is deliberately the existing qualified CURRENTS V3
NOAA CoastWatch `noaacwBLENDEDNRTcurrentsDaily` profile, not an extensible arbitrary
product admission. Region selection is generic. A different environmental product
requires qualification, not a new string in a manifest.

V1 grid support is regular provider-native latitude/longitude axes with integer
microdegree origin/positive step/dimensions. Cells supply indices and coordinates;
coordinates must equal the descriptor-derived point exactly. Longitude is
[-180,180); pole aliases are unsupported; latitude is strictly between the poles.
Non-regular grids or finer precision fail closed and need a qualified adapter/
descriptor extension. No real Gulf or Atlantic sampling plan is supplied.

Inclusion is `EXPLICIT_NATIVE_CELLS_V1`: only enumerated cells are eligible. Duplicate
keys or index pairs are rejected. Coverage/mask references bind approved immutable
artifacts, but Phase 1 does not fetch or scientifically validate those artifacts.
Registry approval must eventually certify the sampling set against those artifacts.

Canonical serialization recursively sorts object keys. Constructors sort cells by
key and retryable failures as sets. Validation of published objects requires their
canonical set ordering. Digests are SHA-256 of `domain + NUL + canonical JSON`.
Grid, sampling, manifest, activation, job, execution and binding identities use
distinct domains. Manifest digest excludes its own `digest` field. Equivalent
property/set ordering produces the same constructed manifest identity.

Data admission rejects accessors, custom prototypes, symbols, sparse arrays, cycles,
nonfinite/unsafe numbers, signed zero, and invalid Unicode. Numeric policy fields
are safe integers. Coordinates are exact integer-microdegree values. Wire admission
requires exact canonical serialization, rejecting duplicate keys, alternate numeric
spellings and whitespace. UTC strings use `YYYY-MM-DDTHH:mm:ss.sssZ` and must survive
date round-trip validation. There is no ambient wall clock.

An ID/version cannot be silently republished under the trusted reference: changed
content changes its digest and fails the existing approval. A persistent registry
must later enforce immutable publication/version uniqueness durably.

## Activation and scheduling semantics

Activation is separate from the manifest and has its own digest and positive
revision. `approvedAt <= effectiveAt`; ENABLED requires null stop time. DISABLED or
REVOKED carries a stop time and cannot authorize work, even if the job was generated
earlier. Historical inspection will need the appropriate archived trusted snapshot;
it must never use historical state to authorize current execution.

`planJobs` accepts exactly `{manifest, activation, trustedState, range, asOf}`;
`range` is `{from, until}` with inclusive start/exclusive end. The explicit `asOf`
is UTC. No interactive context, provider discovery, cache, environment, I/O, or
implicit default is consulted.

Windows start at `anchor + n * intervalMs`, n >= 0, and end one interval later.
Window starts must be within the requested range, manifest validity and activation,
and no later than asOf. Partial first windows are not retroactively authorized.
Effective-until is exclusive and clips the execution deadline.

Catch-up retains at most the latest `catchUpMaxWindows` scheduled slots relative to
asOf, limited also by `catchUpMaxAgeMs`, permitted execution delay and deadline.
The delay limit is inclusive; deadlines are exclusive. Deadlines may span intervals
to permit bounded overlap/catch-up. Timeout/wait budgets must fit the deadline;
delay must be smaller than the deadline. Retry backoffs and attempt counts are
bounded, but no retries are executed in Phase 1.

Jobs are ordered by window then cell key. Whole-plan job/queue capacity overflow
fails, rather than returning a misleading partially populated plan. Excluded old,
expired or late windows are explicitly described by the returned exclusion policy;
no completion or historical observation is fabricated. A persistent scheduler must
later journal missed windows. Re-enumerating identical inputs produces identical
plans and IDs; a later asOf legitimately excludes expired work.

Job identity is `coj1-` plus the digest of:

`{contractVersion, manifestDigest, cellKey, window:{start,end}}`

Provider time, attempt IDs, fences, activation revision and execution outcomes do
not enter logical job identity. Reapproval cannot change what an existing job means.

## Execution and external binding

The execution schema binds the job, exact manifest/cell, attempt ID/number, positive
fence, start/finish times, adapter, provider/dataset/grid, exact canonical request
coordinates/indices, selected provider time, returned coordinates/time, retained
response reference, normalization version and full exact evidence reference.

Attempt IDs are domain-separated digests of job ID, attempt number and fencing token,
not arbitrary strings supplied by an application. Other artifact references must
come from the approved registry/retention composition. A schema cannot prove the
absence of private meaning inside an otherwise valid approved artifact ID: trusted
manifest authorship and later retention adapters remain part of the privacy gate.

V1 admits exact native-cell resolution only, one fulfilled center capture, the
existing normalization lineage, and correctly bound recorded source metadata.
Capture/reference validation uses the existing CURRENTS V3 reader without changing
its format or scientific numeric semantics. Server request/response/normalization
times must be ordered and inside job authorization/deadline; selected provider time
cannot be later than response completion. Request duration is bounded.

FAILED attempts carry an explicit failure and no evidence/normalized payload;
they cannot create bindings. NORMALIZED means structurally normalized, not eligible,
fresh, scientifically confident, or receipted.

The binding links manifest, activation digest, job, execution digest, attempt/fence,
retained response and exact evidence reference. Changing any link is rejected even
after recomputing a binding digest, unless the entire validated context also changes.
No metadata is inserted into the capture or Receipt Writer envelope. Actual response
bytes, normalization execution, durable claim ownership and retention acknowledgment
remain Phase 2/later trusted-port obligations, not facts asserted by this validator.

## Qualification and next boundary

Tests exercise deterministic identity, strict schema/wire admission, activation,
forgeries, UTC boundaries/catch-up, exact capture binding, region neutrality, and all
listed captain-context independence cases. Imports are checked for forbidden
request/cache/network/timer/receipt dependencies. The production call graph does not
import these modules.

Phase 2 may add an isolated current acquisition worker with fake transport/storage
ports and scientific regression fixtures. It must qualify provider-time selection,
response retention, canonical native-cell mapping, normalization equivalence,
resource bounds, and privacy-safe composition. Protected durable registry, fencing,
execution witnesses and issuance remain separately gated. No production enablement,
receipt migration, real sampling density, or scheduler activation is authorized here.

## Local qualification checkpoint (2026-10-04)

New contract tests and the isolated backend-package install/import qualification
passed. The defined backend suite (`PELORA_TEST_OCEAN_CONDITIONS=1 node
backend/tests/oceanConditions.test.js`) completed with 719 PASS lines; `test:check`,
changed-file syntax checks and ESLint recommended rules passed.

An additional all-discovered backend run was NOT green: 2,615 tests, 2,566 passed,
49 failed. All 47 assertion failures were reproduced in an isolated copy of unchanged
tracked baseline files. Two historical test processes (`snapshotBranchOptionality`
and `snapshotProducerQualificationV2`) failed with memory-allocation errors; their
completion remains unqualified. No historical assertions or production code were
changed to obtain a pass.

The focused compatibility run had 178/180 passes; both failures are the reproduced
legacy SST overflow expectations in `sourceNormalizationAmendmentAdversarial`.
Current CURRENTS V3, current normalization runtime/adversarial, Receipt Writer and
receipt adversarial checks passed. The full run also passed the bounded current
producer regression (128 scenarios, 3,258 semantic paths).

Overall qualification remains NOT fully green. Commit and push are withheld; no
blanket baseline exception or historical-test repair is implied. Phase 2 has not begun.
