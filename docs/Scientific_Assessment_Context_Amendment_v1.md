# Scientific Assessment Context Amendment v1 (Task 12A.1)

Status: contract foundation implemented for review; no Opportunity-science seam,
provider acquisition, scheduler, frontend integration or runtime migration.
Baseline: `1f69f79fbd6e02936e09e0fd727b0eb8b925d7e8`.

## Gap and explicit version advancement

Task 12A v1 records family assessments at the cycle cutoff and infrastructure
attempt times. Its evaluator receives only `{cycle, evidence}`. The worker input
`assessedAt` assesses the age of the previous publication for reporting; it is not
candidate scientific assessment time. None may silently substitute for that input.

New explicit entry points use:

- `pelora-governed-ocean-publication-v2`
- `pelora-ocean-publication-worker-v2`
- `pelora-scheduled-scientific-assessment-v1` (assessment input policy)

`cycleV2`, `publicationV2`, `validatePublicationV2`, and the worker's V2 exports are
opt-in. Existing V1 exports retain their schemas, generated identities, validation
and state-machine behavior. Shared internal validation/state-machine code avoids
forking eligibility, durability or CAS logic. No v1 record gains a fabricated
assessment field. V1 and V2 validators reject the other version. There is no
automatic conversion, mixed-version latest fallback, or runtime route switch.

## Four distinct times

| Concept | Field | Meaning |
| --- | --- | --- |
| Scheduled cycle | `cycle.scheduledAt` | Exact 00/04/08/12/16/20 UTC cycle |
| Family assessment | `evidence.entries[].assessedAt` | Family-specific qualification/admissibility/status assessment |
| Candidate scientific assessment | `evaluation.assessmentAt` | Age-dependent scientific interpretation of frozen evidence |
| Physical execution | `attempt.startedAt`, `attempt.endedAt` | Infrastructure execution, not scientific time |

Evidence represented time remains the time the environmental evidence represents.
Replay/read time is not scientific reassessment. Worker report/read `assessedAt`
continues to measure previous-publication age and is not renamed or overloaded.

For scheduled v2, intentionally:

`family assessedAt = evaluation.assessmentAt = cycle.scheduledAt`

Equality is this publication policy, not conceptual interchangeability. All
candidates use the same snapshot cutoff. Infrastructure delay must not age that
snapshot's original scientific conclusions. Other future publication types would
need separately governed semantics.

## Evaluator input and validation

The V2 worker supplies a detached, deeply frozen object:

```js
{
  cycle,
  evidence,
  assessment: {
    contractVersion: 'pelora-scheduled-scientific-assessment-v1',
    assessmentAt: cycle.scheduledAt
  }
}
```

The evaluator must return its explicit `assessmentAt` alongside the existing
`evaluatorVersion`, `evidenceSetId`, results and references. The worker validates
that time before accepting results and retains it as `evaluation.assessmentAt`.
It never silently stamps a missing or mismatched evaluator acknowledgement.

UTC strings permit whole seconds or exactly three fractional digits and normalize
to millisecond `Z` form. Missing, non-string, invalid calendar, offset, unsupported
precision, pre-cycle, post-cycle and substituted execution times fail closed.
Unknown/conflicting fields, private context, accessors and mutable Date inputs
remain rejected. Family assessment remains independently validated at the cutoff.

This proves the evaluator receives and acknowledges the context; it does not prove
an arbitrary injected evaluator internally uses it. The existing Blue Marlin
functions still use implicit clocks. Task 12B.1 must prove scientific equivalence
before a real evaluator can claim this new input contract.

## Evaluator/configuration identity

V2 requires `configuration.evaluatorVersion` to end with
`-explicit-assessment-v1`. This is an explicit opt-in identity convention: an old
implicit evaluator ID cannot be accidentally reused unchanged. Tests use
`synthetic-test-explicit-assessment-v1`; this is not an operational science version.
A future real evaluator must advance its registered ID and configuration version
when it implements the input seam. A suffix is an identity declaration, not proof
of scientific equivalence or provider qualification.

Contract version and evaluator identity enter deterministic cycle identity and
pointer namespaces. `evaluation.assessmentAt` enters scientific content digest and
full integrity digest. No wall clock, storage URL or captain identity enters these
identities. A changed assessment alone is invalid for the same cycle; a valid
changed assessment requires a different cycle and therefore a different identity.

## Delay, replay and accepted-record semantics

A 12:00 cycle with 12:07 start and 12:09 end records scientific assessment at 12:00.
Reconstruction on September 27 retains September 24 assessment. Different attempt
times can produce a different full-record integrity digest while preserving the
same scientific content digest and publication ID. Once accepted, retries reuse
the original accepted record, including original execution metadata; they do not
replace it with a newly executed copy. EXISTS/CREATED, conflict, durable readback,
claim and CAS semantics remain the Task 12A rules.

V1/V2 publications and latest-pointer namespaces are distinct. Latest verification
uses the explicitly selected version and exact accepted record. No automatic pointer
migration is implemented. Missing/corrupt/mismatched durability cannot advance latest.
Failed cycles retain the prior verified publication, with age assessed honestly.
Production storage, distributed claims/CAS, crash reconciliation and deployment
remain unestablished. Existing crash windows remain unchanged.

## Future-cycle boundary

The existing worker enforces `cycle.scheduledAt <= startedAt <= report assessedAt`
and execution end ordering. It rejects a cycle later than the supplied execution
start. These are trusted infrastructure timestamps, not a wall-clock attestation.
A caller supplying fabricated future execution timestamps is not prevented by a
pure contract. The future scheduler/worker host must truthfully capture execution
time and refuse invocation before the cycle is due. No clock-skew tolerance or
production scheduler is established here. Replay is allowed after the cutoff.

## Task 12B.1 prerequisite and clock inventory

The publication timestamp gap is resolved for explicit scheduled v2 semantics.
Task 12B.1 still must thread the context through existing scientific functions and
prove replay/equivalence without changing thresholds. Non-publication requests will
capture now once at a trusted outer boundary; scheduled evaluation will use its
cycle-bound instant. No request-time change is made by this amendment.

| Existing use | Classification / next work |
| --- | --- |
| `assessSstTransitionConfidence -> Date.now()` | Scientific assessment; demonstrated negative-adequacy dependency |
| `getAgeHours` in chlorophyll/current paths | Scientific ages where freshness affects interpretation |
| `getMoonConditions()` default | Astronomical evaluation time where state affects science |
| Cached current values with precomputed `ageHours` | Requires review for assessment-aware reuse |
| History/temporal context ages | Requires review; authentication-independent historical evidence remains a separate gate |
| Cache TTL | Cache/transport only |
| Retrieval/storage timestamps | Operational |
| Response/health timestamps | Operational/presentation |

No clocks, age calculations, thresholds, habitat, score, confidence, ranking,
eligibility, candidate/Opportunity identity, persistence or provider qualification
are changed. Narrative age alignment is future seam work; no Narrative Voice edit.
Captain projection remains deferred and cannot reassess a publication simply because
a captain opens the app. Shared assessment context contains no captain data.

## Verification

Focused offline tests cover valid v2, UTC/precision validation, missing and conflicting
assessment, immutable context, complete candidate delivery, family alignment,
execution delay, replay, identity, v1 isolation, evaluator opt-in, idempotency,
durability failures, exact latest reads, CAS conflicts and declared future-start
rejection. All existing v1 tests must continue passing. The Task 12B diagnostic
continues to demonstrate the unchanged Opportunity-science clock dependency; a
passing diagnostic does not mean Task 12B.1 has been implemented.

Task 9E-D remains paused. No provider/database/Auth/Supabase access, dependency
changes, commit/tag, push or deployment is part of this amendment.

Verified on the amendment worktree: 35 focused tests; all 57 Task 12A v1 tests;
9 Task 12B diagnostics; 56 SST worker tests; and all 29 backend/shared scripts
passed offline. The final focused run includes assessment-context accessor rejection.
An additional comparison with the checkpointed v1 implementation produced an exact
serialized v1 record/digest match. Syntax and tracked/new-file whitespace checks
passed. No frontend tests/build were needed because frontend files are untouched.

## Final adversarial review

The review demonstrated one correction: V2 accepted a dedicated `boat` field in
an evaluator interpretation and returned COMPLETED. Conversion discarded that
field, so this was not demonstrated persistence of private data; it violated the
required fail-closed rejection boundary. V2 now rejects it recursively before
writing. The V1 privacy predicate is unchanged to preserve checkpoint behavior.

Seventy-five focused tests cover the original 35 cases plus hostile schema,
sub-millisecond/offset/empty/ambiguous inputs, exact millisecond equality,
evaluator acknowledgement, deceptive evaluator IDs, caller mutation, delayed
replay, conflicts, durable readback, private fields and checkpoint compatibility.
The checkpoint-derived golden test hashes the complete serialized V1 record
(including evidence, evaluation and execution metadata), and separately checks
content/integrity digests, cycle ID and latest-pointer namespace. It also verifies
exact V1 durable write/readback and latest read. Golden values came from the
unchanged modules at `1f69f79fbd6e02936e09e0fd727b0eb8b925d7e8`.

The V2 acknowledgement schema is an own data-property `assessmentAt` on evaluator
output. Its policy version is fixed by the V2 worker/input contract; there is no
independently selectable output policy field. A purported output `contractVersion`
(correct or incorrect), nested alternate assessment or `assessedAt` in place of
`assessmentAt` is an unknown field and rejected. Accessors/inherited values fail
before they can supply the acknowledgement. The worker never manufactures a missing
acknowledgement or substitutes execution/family fields.

This is structural contract propagation and acknowledgement, not cryptographic
proof or proof that an evaluator actually used the time in its algorithms. A
trusted evaluator can echo an input without internally consuming it. Task 12B.1
must establish that scientific equivalence; this amendment does not claim to
prevent dishonest evaluator implementations. The original Task 12B implicit-clock
mismatch remains expected and tested.

Final review verification: 75 focused tests, 57 V1 tests, 9 historical diagnostic
tests and all 29 backend/shared scripts passed with the network-blocking preload.
Syntax and tracked/new-file whitespace checks passed. No frontend/build was run
because frontend and request runtime remain unchanged. Only the four amendment
files are modified/new; bootstrap files remain excluded and nothing is staged.
