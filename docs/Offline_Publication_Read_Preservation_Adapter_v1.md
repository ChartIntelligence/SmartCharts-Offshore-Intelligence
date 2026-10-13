# Offline publication-read preservation adapter v1 — candidate evidence

Candidate for P04 independent implementation review, not operational publication-read qualification. Implemented from proposal `814a9950c8dbfcd4ed12213101798c1e03ebba2c` (parent frozen preview `b0cd2b1c3b967644d3bb00b4b488addfe777b1e9`). Frozen preview unchanged; this isolated branch is not integrated into it.

P04 local contract review was read after verifying SHA256 `c1b6ee877dd679fe779db846b3247d3d782a72dc62ee04a8f807019f36c859ef`. That review is local/uncommitted evidence, not a new published QA checkpoint. It clears only a pure injected offline preservation adapter. Original proposal and governance are unchanged.

## Exact owned files and boundary

- `backend/durableObserve/captainPublicationReadProjection.mjs`: `createOfflinePublicationReadProjection({readValidated})`, wrapper contract `pelora-offline-publication-read-projection-v1`.
- `backend/tests/captainPublicationReadProjection.test.mjs`: passive controlled port doubles and 41 focused cases; no producer fixture import.
- This report only.

Closed requests carry explicit mode, scheduledAt or null, priorWitness or null, and an explicit `pelora-synthetic-publication-read-scope-v1` scope with `SYNTHETIC_SCOPE_ONLY` and existing public context descriptor. No principal identifier or authentication capability is minted. Null scope returns UNRESOLVED_CONTEXT without reading. Wrong/corrupt scope returns INVALID_BINDING.

The trusted composition dependency is an injected **already strictly validated** read port. It returns `{status:'VALIDATED',value:<existing store read>,recordText:string|null}` or the distinct closed INVALID_BINDING / READ_UNAVAILABLE outcomes. This is a dependency contract, not proof that an arbitrary typed object is authentic. No production port or caller-accessible API is supplied. Port implementations must validate native envelope/reference/producer consistency before returning VALIDATED, preserve their ingestion limitations, and snapshot source material appropriately. Unexpected port exceptions propagate; they never become benign missingness.

The projection detaches/freezes requests before awaiting and returned objects before consumption. Existing copy/exactJson preserve signed zero. Existing contextDescriptor/contextKey/versionId/byteHash, cycleV2 and reference functions perform mechanical checks; **readRankedPublication, serializeRankedPublication, composer, classifier, evaluator and ranker are not called**. Existing strict upstream validation may replay classification; it remains outside this projection and has not been replaced/weakened.

Mechanical checks cover closed source/store wrappers, requested slot/current boundary, context/species/region, existing cycle identity, assessment/execution/publication times, revision/action/parent, lifecycle/science aliases, activePublication identity-or-null, controlled flags, exact body digest, supplied native text, cohort/cycle/context binding and retained-input reference/content consistency. They supplement the trusted strict validator; they are not a replacement scientific validator or evidence-admission mechanism. Full inner result/delivery/classifier equivalence is not independently established here.

The full supplied record is preserved, not rebuilt from a selected field list. Source ages and underlying time/quality/receipt/support content pass through unchanged. Native text is labelled PORT_NATIVE_TEXT only when supplied and matching exact source serialization; otherwise DERIVED_EXACT_SERIALIZATION, not an independently retrieved historical log. Identity is the exact source cycle/slot/version/revision/parent/action/digest tuple. It is not a viewed acknowledgment or latest-transaction witness.

Explicit exact-cycle (even the current UTC slot) and successful-history requests remain historical presentation. Original store historicalOnly/isCurrent are separately retained. currentCycleStatus remains the second-query lifecycle string only: no newer revision identity, coherent multi-query snapshot, ACK or latest-authority inference. Missing current has no automatic historical fallback. Unavailable, failed, delayed, missing, partial and governed-zero remain distinct supplied states.

Operational admission is UNKNOWN when flags are absent, CONTROLLED_NOT_OPERATIONAL for explicitly controlled records. Material comparison is always UNRESOLVED/NO_QUALIFIED_PRODUCER; non-null comparison injection is rejected. No actual unread/pulse/view schema, render acknowledgment, principal admission or frontend consumption is implemented. Same-version conflict detection requires an explicit prior validated witness; unseen global conflicts require upstream authority and cannot be discovered by this one-result helper.

## Executed qualification — October 13, 2026

Environment: Windows PowerShell, existing Node `v24.18.0`; worktree `C:/Projects/Pelora-Agent-Worktrees/pelora-publication-read-adapter-v1`, branch `codex/pelora-publication-read-adapter-v1`. No package installation/dependency copying.

Commands actually executed:

```text
node --test backend/tests/captainPublicationReadProjection.test.mjs
node --check backend/durableObserve/captainPublicationReadProjection.mjs
node --check backend/tests/captainPublicationReadProjection.test.mjs
git diff --check
```

Final focused run: **41 tests, 41 pass, 0 fail, 0 skipped**. Earlier development runs each passed 34 cases; they overlap and are not additional unique coverage. Both syntax checks passed. Staged whitespace check passed after correcting mixed CR/LF endings in the new files only; the 41-case profile and both syntax checks passed again on final LF bytes. No historical whitespace repaired. No full qualification profile/build/consumer/browser suite was rerun for this isolated additive, unwired module. Project lint not run: this workspace has no installed lint dependencies; no installation authorized/attempted.

Tested working-file SHA256:

| File | SHA256 |
|---|---|
| adapter | `c995f9b24dd5f07f11c001163ca6346e6646f40a57d9e6b88e839b07f22d5476` |
| test + inline passive doubles | `26bbe09990a727d28c7adb1d3c169456797bef676b663aa2e7f12db19fafc242` |

These fingerprint exact tested source bytes, not this report and not scientific provider products. Final tested files use LF without BOM; commit identity separately pins retained source.

Exercised: supplied available/zero/partial/unavailable states; partial empty delivery; running/delayed/failed; missing current; explicit current-slot historical intent; old history with failed current; correction/withdrawal; native versus derived text and signed zero; unknown/controlled admission; absent scope; wrapper/context/species/cycle/alias/active-pointer/digest/qualification conflicts; malformed input reference, changed content under recomputed outer digest, cross-cohort/cross-cycle binding; explicitly propagated upstream invalid outcomes; unavailable transport versus unexpected exceptions; request/source mutation containment; deterministic replay/prior-witness conflict; unchanged source-time/unknown receipt/support; unresolved materiality rejection; no producer/submit/acquisition/database call sites in the adapter.

**Fixture limitation:** completed source bodies are passive synthetic port doubles, not actual executed producer outputs or strict CP-08 scientifically validated publications. They preserve opaque supplied values to test the injection/projection seam. Tests named upstream-invalid assert rejection propagation, not independent full-validator validation. Digest/reference tests exercise only the additional mechanical checks. No genuine real-source governed-zero, eligibility, adequacy, provider qualification or historical possession is claimed. Existing producer-executing ranked fixture was deliberately not imported. Strict real-envelope upstream validation and independent P04 review remain required before broader use.

## Remaining gates / state preservation

P04 must review this exact implementation and its injected-boundary/fixture limits independently. A qualified operational ingestion port, authorized captain-to-context resolver/API, full source/history admission, actual view acknowledgment and separately reviewed material comparison remain absent. No confidence, ranking, eligibility, temporal support, receipt possession, coverage or science rule is invented.

No existing tracked source, frontend, schema, migration, grant, config, Auth, provider, database, publisher, scheduler, private file, preview launch, walkthrough, main or production changed. No C temporal fixture execution: specification mismatch remains HOLD. No B implementation bundled. Candidate commit/push does not clear CP-10, operational publishing, beta readiness or founder acceptance.
