# Explicit Scientific Assessment Time v1 — Task 12B.1

Status: explicit-time input seam implemented; offline equivalence evidence only.
No shared evaluator adapter, captain projection, provider acquisition, scheduler or
publication-runtime migration is established. Baseline checkpoint:
`40d6ca42400e8dd5ed6c75619ca602766528fb6e`.

## Contract and time boundaries

`backend/scientificAssessment.mjs` validates detached, frozen two-field contexts:
`{contractVersion, assessmentAt}`. General internal request contexts use
`pelora-scientific-assessment-v1`; checkpointed
`pelora-scheduled-scientific-assessment-v1` contexts are accepted unchanged in meaning.
UTC whole seconds or exactly three fractional digits normalize to millisecond Z.
Wrong versions, private/unknown fields, accessors, unsupported objects and malformed
instants fail. Required internal scientific helpers reject a missing context.

The implementation capability ID is
`pelora-blue-marlin-explicit-assessment-v1`. It satisfies Task 12A.1's opt-in suffix;
it does not register a completed shared scientific adapter. Existing interpretation
output schemas, candidate IDs and Opportunity IDs remain unchanged. The caller's
explicit evaluator/configuration identity and the publication's recorded assessment
must identify use of this capability; historical implicit outputs gain no inferred
provenance and are not migrated. No publication contract is modified.

Evidence time means what evidence represents. Assessment time means when science
evaluates it. Cycle time is a scheduled snapshot cutoff. Execution/retrieval/storage
and later replay times are operational. Scheduled callers supply the locked cycle
context; a general internal context does not invent future-cycle policy.

## Capture once and explicit propagation

`evaluateControlledGulfBlueMarlinV1` captures once before candidate selection/loop
when called without an internal context. It forwards that context to both candidate
provider wrappers, `getOceanConditions` and final species interpretation.
`evaluateUnifiedOpportunityOceanConditionsV1` likewise captures once for its batch.
Standalone ocean/provider/interpretation entry points preserve direct-call defaults
by capturing once at their own boundary; nested calls always forward the context.
Validation/detachment may produce separate immutable objects containing the same
instant; no downstream scientific helper rereads the clock once context is present.

Private/internal injection is not an HTTP feature. No query, body, header,
environment or frontend selector was added. Existing request routes construct
known internal options and do not forward client assessment fields. Arbitrary future
assessment is not offered to clients. Internal future instants are deterministic
test/replay inputs, not a new production future-assessment policy. Scheduled-host
truthful execution timestamp requirements remain Task 12A.1's unchanged boundary.

## Final clock inventory

| Use | Classification | Disposition |
| --- | --- | --- |
| SST transition confidence and negative-observation adequacy | SCIENTIFIC_ASSESSMENT_TIME | Uses explicit context; all sample assessments share one instant |
| `getAgeHours` in direct/gap-filled chlorophyll and current decoding | SCIENTIFIC_ASSESSMENT_TIME | Uses assessment minus provider timestamp; original one-decimal rounding retained |
| `getMoonConditions` | SCIENTIFIC_ASSESSMENT_TIME | Existing astronomical algorithm receives assessment timestamp; implicit default removed from private runtime usage |
| Current cached/in-flight `ageHours` | SCIENTIFIC_ASSESSMENT_TIME | Recomputed per caller from retained `observedAt`, never reused as a source fact |
| Current/SST cache TTL, insertion and hit age | CACHE/TRANSPORT_ONLY | Unchanged wall clock; not scientific assessment |
| Marine retrieval timestamp | OPERATIONAL_TIMESTAMP_ONLY | Unchanged |
| History/observation storedAt and evaluation completion timestamp | OPERATIONAL_TIMESTAMP_ONLY / historical event metadata | Unchanged; not substituted for injected science time |
| Response generatedAt and health time | OPERATIONAL_TIMESTAMP_ONLY | Unchanged |
| Continuity, persistence, historical time series | Explicit evidence/event-time arithmetic | No hidden now found in reviewed scientific functions; unchanged |
| Narrative freshness/age labels | PRESENTATION_ONLY consuming scientific fields | No independent narrative clock; age-derived labels use existing assessed inputs |
| Authentication-dependent history availability | UNRESOLVED sourcing gate | Not solved and not accessed |

The fixed astronomical epoch and Date constructors parsing supplied timestamps are
not implicit current-time reads. No TTL or retrieval timestamps were repurposed.

## Family and cache behavior

SST retains its exact confidence/negative-adequacy formula, thresholds and rounding.
Only the subtraction's assessment operand changes from Date.now to context time.
Chlorophyll direct/reconstructed selection, age rules and quality semantics remain
unchanged. Current source vectors, provider timestamps, scalar values and source
identity remain unchanged; cache hits and shared in-flight responses recompute age
for each caller. The shared cache may retain an old convenience age field, but every
scientific return is assessed from its timestamp. TTLs and acquisition URLs/queries
are unchanged. No interpreted Opportunity result cache was introduced.

Missing/unparseable source timestamps yield unknown age. Available cached current
with no usable underlying timestamp throws an explicit error: that subpath cannot
claim assessment equivalence or fabricate an age. Valid retained/mocked current
responses contain the timestamp needed for recomputation. No live cache/provider
qualification is claimed. Future source timestamps are rejected before age rounding/classification. No future-observation tolerance or family freshness threshold is introduced.

Frozen ocean inputs that already contain governed interpreted family states are
not silently rebuilt or overwritten by the final species interpretation function.
Those upstream assessments must be constructed/bound consistently to the same
context by the future archive-bound evaluator. Direct final interpretation still
consumes its supplied family states. This task fixes the demonstrated hidden SST
clock and the actual upstream request age/moon paths; it does not qualify arbitrary
preinterpreted payloads or replace the future full frozen-evidence adapter.

## History and persistence

Current historical retrieval remains authenticated. Time-series change/persistence
uses the supplied historical event sequence, not a new Date.now inside those
algorithms. Observation/history capture and request fallback keep their existing
execution/event timestamps. No historical rows are relabelled, no persistence score
or identity changes, and no Auth-independent history store is implemented.
Nightly learning and publication migration remain separate.

## Equivalence evidence and limits

The original diagnostic fixture is unchanged scientifically. Checkpointed implicit
output at Sep 24 01:00 has SHA-256
`4474b759ddd3e981ee95a3ee4c9b9319816877ca6f4f1478bfbeb62345f41135`.
New explicit output at the same instant matches the full serialized interpretation.
The same explicit context under a Sep 27 execution clock is EXACT_MATCH, including
negative adequacy, identity and ranking input. Explicit Sep 27 reassessment changes
thermal/overall adequacy as before: EXPECTED_ASSESSMENT_TIME_DIFFERENCE.

A second checkpoint fixture preserves score 41, confidence 64 and its failed gate
exactly (full output digest
`d0ab89dfff546738366eade0010580aeecdb8294401a147ae7865e350e33e910`).
No score formula or gate was changed. Existing Opportunity/governance regressions
remain authoritative for other eligible/excluded scientific cases. These fixtures
do not establish complete archive-bound evaluator equivalence for all family states.

The focused log emits a machine-readable field matrix. No replay MISMATCH is
normalized away. The historical Task 12B diagnostic now labels distinct default
request captures as EXPECTED_ASSESSMENT_TIME_DIFFERENCE, rather than incorrectly
claiming explicit replay is still blocked. The original checkpoint preserves the
historical STOP evidence; new goldens compare against that actual old implementation.
Provider-options regression assertions now expect the explicit internal context;
scientific result assertions remain unchanged.

Tests cover changing clocks, multiple candidates, multiple origins/ranges, direct
and gap-filled chlorophyll, cached/in-flight/spatial current ages, moon time,
malformed contexts, unknown timestamp refusal, private/client boundary checks,
publication-context compatibility and unsupported species. Synthetic transport
stubs return local values; no environmental network request is made.

## Remaining Task 12B gates

1. Authentication-independent immutable history qualification.
2. Full archive-bound candidate/evidence adapter, including all eligible/excluded
   and family-status cases, with upstream assessment identity verification.
3. Complete declared-universe evaluation and candidate-cap disposition.
4. Captain projection/ranking equivalence, including stable ties.
5. Separate runtime migration review after these gates pass.

Task 9E-D remains paused. No scientific thresholds, habitat/eligibility rules,
score/confidence formulas, ranking permission, persistence science, candidate or
Opportunity identity, provider qualification, frontend, publication contracts or
locked ocean scientific contracts are changed. No acquisition, database/Auth/
Supabase access, commit, tag, push or deployment is part of this task.

## Verification

Final verification: 28 focused tests, 9 historical diagnostics, 75 publication-v2
assessment tests, 57 publication-v1 tests, and all 30 backend/shared scripts passed
after affected-suite reruns. The initial full run failed the old internal provider
options assertions; those now pin/expect the assessment context and the complete
Opportunity/governance script passes. No scientific assertion was removed. SST
worker 56, retained NOAA 27, SST adapter 19, numeric integrity 19, frame 17,
archive 36, scalar delivery 44 and scalar runtime 22 all passed offline.
Syntax and tracked/new-file whitespace checks passed. No frontend build was needed.

## Final adversarial review corrections

Four demonstrated defects were corrected within this seam:

1. An explicitly assessed batch could invoke a nested interpretation without its
   context and silently capture the later wall clock. The test produced false
   negative-conclusion adequacy inside the Sep 24 batch when execution was Sep 27.
   Trusted boundaries now establish an AsyncLocalStorage consistency guard. Context
   is still passed explicitly; the guard NEVER supplies missing time. Nested missing,
   inconsistent instant or changed policy fails closed. Root requests remain isolated
   across asynchronous concurrency. The guard is not a scheduler or global clock patch.
2. Future current evidence produced age -72 and the existing classifier labelled it
   recent. Source times after assessment are now rejected at the age-input boundary
   before classifier access. SST also rejects raw future time before one-decimal
   rounding could turn a small negative age into zero. This intentionally tightens
   invalid-input handling; it does not change any valid-age freshness threshold,
   scoring/confidence formula, or astronomical calculation.

3. Moon accepted a different explicit timestamp while an assessment was active.
   It now validates consistency with the active instant before running the unchanged
   astronomical algorithm. Standalone explicit astronomical calculations remain possible.

Actual HTTP-style request tests invoke the server's request listener without sockets.
Query aliases, duplicate parameters, headers, cookies, bodies and an environment
value cannot choose time. Provider stubs receive known internal options only, and
recorded outbound URLs/options contain no assessment context. Tests cover health,
ocean validation, legacy field errors/disabled mode, and field cancellation. No
provider or database is contacted. Existing full ocean-condition/field suites
cover the remaining ordinary marine/SST/chlorophyll behavior.

A three-candidate multi-family diagnostic uses the scheduled context in actual SST
confidence, direct/gap-filled chlorophyll decode, current cache decode and moon
calculation. Execution-clock advances leave every age at one hour and moon time at
the supplied instant. A machine-readable capture is emitted. This is consumption
proof for these paths, not full archive-bound candidate-universe equivalence.

The history source-inspection diagnostic now follows the renamed internal
getOceanConditionsAtAssessment implementation behind the guarded boundary. Its
scientific assertions remain unchanged. Re-audit found no new hidden scientific
clock in history/persistence/continuity or narrative; sourcing remains unresolved.

Cache inventory: current/SST point values and in-flight promises hold environmental
source observations; current age is a derived convenience field recomputed on return.
Cache insertion, TTL and hit age are operational. SST structure/confidence and
Opportunity interpretation are recomputed, not cached across assessment instants.
No cache key includes assessment unnecessarily.

The fourth attack demonstrated an outer options assessment getter executing before context validation. Trusted object-option boundaries now inspect the own data descriptor and reject accessor or inherited assessment properties without invoking the getter.

Final adversarial verification: 42 focused tests pass; all 30 backend/shared scripts pass after the documented source-anchor correction and affected-suite reruns. Task 12B diagnostic: 9; publication v1: 57; assessment amendment: 75; SST worker: 56; retained NOAA pilot: 27; SST adapter: 19; numeric integrity: 19; Ocean Product Frame: 17; archive: 36; scalar delivery: 44; scalar runtime: 22. Network-blocking preload was applied to every regression process; provider responses and HTTP request listeners used in tests are local fixtures, with no socket/provider access. Final-results and detailed logs are retained under ignored .local/ocean-quarantine/task12b1-adversarial/. No unexplained equivalence MISMATCH remains in the tested cases. Full archive-bound evaluator equivalence and broader Task 12B gates remain unproven.
