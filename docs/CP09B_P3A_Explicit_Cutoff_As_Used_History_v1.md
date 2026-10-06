# CP-09B / P3-A — Explicit cutoff and exact as-used private history boundary v1

**P3-A EXPLICIT CUTOFF / AS-USED HISTORY BOUNDARY QUALIFIED**

**SOURCE ADMISSION AND FULL HISTORY SELECTION REMAIN UNQUALIFIED — CP-10 REMAINS BLOCKED**

Baseline `46370c74ff30eef27fee5735cd79be4852f17118`, branch `codex/pelora-remote-setup`, expected worktree and matching remote verified. Entering tracked/staged changes were empty; unrelated `supabase/.gitignore` and `supabase/config.toml` remain untracked and unchanged. This is bounded R6 and minimum-R7 implementation authorization. The [P3 policy package](CP09B_P3_Source_History_Policy_Decisions_v1.md) retains its original recommendation status; R1–R10 were not collectively approved.

## Active boundary and owned changes

[server.js](../backend/server.js) now calls `collectPrivateOceanHistoryAtAssessment` inside the actual `getOceanConditionsAtAssessment` handoff. Its mandatory explicit assessment reaches `retrieveOceanMemoryRows`, `buildOceanMemoryStorageRecordFromRow`, `buildHistoricalSnapshotQuery` and `buildOceanMemoryTimeSeries`. The internal assembler requires the existing assessment validator rather than capturing its own clock. The independently callable outer request boundary still establishes its one existing assessment.

Retrieval adds the assessment's inclusive `observedBefore` filter; returned records are independently validated even when controlled transports ignore that query. A malformed non-array response or corrupt native handoff decoding is invalid resolution, not successful empty history. Decoder failure is isolated from independently valid current evidence. Strict existing copying detaches rows/context/configuration before asynchronous use or scientific consumption. The original 48-row technical cap remains unchanged.

[privateHistoryBoundary.mjs](../backend/privateHistoryBoundary.mjs) introduces `pelora-private-as-used-history-boundary-v1` and `resolvePrivateHistoryBoundaryV1`, `replayPrivateHistoryBoundaryV1`, `privateHistoryBoundarySummaryV1`, plus a deliberately **controlled-only** `controlledHistoryAuthorityV1` comparison port. It imports existing strict `copy`/`freeze`, exact scientific serialization and scientific assessment validation; it has no acquisition, database, storage or ranking behavior.

The immutable private record preserves:

- returned parsed rows and original native reference/capture strings;
- inspected/excluded/unresolved identities and reasons, including conflicting duplicates;
- exact ordered inputs and exact-content digests for each direct history consumer;
- original private point context, explicit assessment, original row/source/revision payloads and actual selection construction time;
- retrieval outcome, resolution state, admission limitation and boundary version.

A new digest identifies the **inspected serialization**, not HTTP response bytes, original capture authenticity, trusted producer execution or historical possession. Native references are not replaced by the new boundary identity. The private record is not a shared-history publication artifact or new persistent ledger. Only the sanitized additive `diagnostics.oceanMemory.historyBoundary` summary is returned by the request assembler; it omits raw rows, owner identifiers, bearer tokens, credentials and coordinates.

`buildOceanPersistence` receives the boundary and routes its 13 existing leaf calls to their separately frozen arrays. `buildOceanChangeFromTimeSeries` receives its separately governed time series. Downstream change/evolution/continuity still compose the existing outputs; no formulas or algorithms were rewritten. AST/source comparison establishes **18 unchanged scientific function bodies** against baseline, using LF-normalized source for that comparison; exact file fingerprints are separately retained.

Five existing diagnostic test files received only source-anchor/assertion reconciliation to follow the new handoff. Their unassessed-helper, provenance and overflow examples remain. The new [31-case suite](../backend/tests/privateHistoryBoundary.test.mjs) calls the production collector and the actual request assembler, not only the new helper. [Qualification runner](../scripts/qualifyPrivateHistoryBoundary.mjs) isolates new diagnostic writes and can resume remaining components without repeating qualified database work.

## Time, resolution and admission

Envelope/row/observation represented times are checked independently. Productivity and clarity use their actual preferred leaf times; an earlier envelope cannot hide a later leaf. Change also checks its consumed intelligence time. This is a semantic field list, not recursive rejection of every timestamp. Later construction/retrieval/audit metadata does not automatically become a future environmental observation.

Controlled instant support passes its necessary time test before or exactly at cutoff; +1 millisecond fails. Complete controlled intervals/composites ending at cutoff pass that time test; straddling/future support does not. Unknown support/possession remains unresolved. These checks do not create operational scientific admission. No interval clipping, timestamp replacement, reconstructed bounds or source revision preference occurs.

The active legacy route has no qualified product-support/possession resolver. Its records therefore remain inspected but **unresolved/unadmitted**, even when their represented timestamps pass. Caller-supplied support/qualified Booleans or a new digest cannot open admission. The controlled comparison handle can supply fixture facts only; its record remains `NOT_OPERATIONALLY_ADMITTED`, and a controlled history record is rejected by the live private assembler before acquisition. P1/P4-A retain their original explicit shared UNAVAILABLE history and `sourceReference:null`.

Resolution distinguishes read/source failure, absent rows, malformed/conflicting binding, unresolved authority and possible technical-page truncation. Per-consumer state additionally records insufficient supplied support and controlled computation status. Source no-data remains a present record with its existing missing values, never fabricated concentration zero. AVAILABLE-empty is **not established** by this legacy HTTP/page boundary: there is no approved complete-scope resolver, and `completeScope:false` stays explicit. Two-input labels reflect existing computational prerequisites, not independent-sample or scientific adequacy policy; unchanged consumers retain their own usable-input/span gates.

Conflicting same-snapshot content invalidates the boundary before deduplication. Identical reuse is retained in inspection and supplied once. Different identities at the same target remain unresolved; no latest-wins or arbitrary equal-time revision choice is introduced. No timestamp/value-based independence or DIRECT/GAP pooling policy is implemented.

INVALID remains explicit in the boundary/diagnostics, with no historical inputs supplied. This private workflow already permits independent current-only evidence; its unchanged current consumers may proceed with unavailable temporal results and visible history limitations. Nothing claims complete historical evaluation or permits a separate history-required evaluation to treat INVALID as valid history.

Replay validates record/version/content/context/assessment and revalidates the exact retained original rows/selection. It never calls retrieval, substitutes a later row/revision or recollects receipts. Original construction/source times stay frozen; replay execution is reported separately. Replay payload possession is not a replacement for authentication or source authority. This remains an internal private composition input, with no new HTTP history/replay ingress, shared reader or persistent migration.

## Actual qualification and reconciliation

Detailed [qualification evidence](qualification/CP09B_P3A_Qualification_v1.json) records commands, component totals, test/source fingerprints, sanitized selected-input/replay identities and failures. Node 24.18.0; existing isolated PostgreSQL `127.0.0.1:55432`; existing external credentials; controlled offline source transports only.

| Coverage | Actual result / accounting |
|---|---|
| Baseline counterexamples | 2/2 reproduced at baseline: future row and earlier envelope/later productivity leaf. |
| Required existing boundary | 978/978 reconciled: 839 CP cases + 44 P1 + 60 P2 + 35 P4-A. |
| New P3-A boundary | 31/31; required combined boundary **1,009/1,009**. Parent-case accounting follows the existing profile. |
| Affected history/cutoff/provenance | 240/240; separately reported, not added to the required boundary. |
| Affected assessment/capture/scalar/Opportunity/governance | 535/535 including the overlapping 44 P1 cases. Legacy manual scripts also emitted 728 PASS lines; these are not added as independent Node test cases. |
| Sanitized replay evidence probe | 1/1 offline probe, separately reported, not a provider-science qualification. |
| Syntax/lint/whitespace | Passed; new modules have no lint issues. Server retains the same 14 baseline lint messages, with no introduced messages. |

Proven cases include actual private handoff and request assembler, query-filter bypass, before/equal/+1ms, future envelope and preferred family leaves, bounded/straddling/unknown support, unproven/late possession, explicit-context failure, present no-data versus absence, malformed/read-failed/truncated resolution, insufficient inputs, duplicates/conflicts/unresolved revisions, exact input/replay digests, caller mutation, signed zero/native payload preservation, new-process replay with a later clock, private/shared separation, identical permitted scientific outputs, and current-value preservation through rejected/corrupt/unavailable history.

Ordinary iteration failures are retained and explained, not counted as passes: initially frozen source fixtures needed detached test copies; duplicate inspection serialization needed explicit null metadata; five source-anchor checks needed to follow the authorized extraction. The first P4-A run had one failing child-config test and its parent (33/35): the evidence-preservation preload redirected the temporary write but not the child's read. Read routing was corrected; unchanged P4-A code then passed 35/35. Implementation/fixture fingerprints match across those component runs. Final review then added corrupt-native-decoder failure isolation and unavailable-input suppression, with regression assertions in the existing cases. The complete required and affected profiles passed again on those final implementation bytes. The last qualification-harness-only change made restart exclusion unconditional; syntax/lint and an emitted-argument probe with the flag absent verified it without additional database work.

**Execution deviations:** both full-profile attempts invoked the existing CP-04 real PostgreSQL restart subtest, contrary to this task's instruction not to repeat restart exercises. Both passed. The second attempt had an argument guard, but its enabling environment flag was absent after a qualification-script edit; the stub probe had initially set that flag itself and did not catch the omission. These are two execution errors, not new P3-A storage requirements. No further database work occurred after discovering the second. The final runner makes the exact-subtest exclusion unconditional, verified with a stubbed subprocess and the flag absent. Future skips are not passes and must be accounted for separately. No targeted P3-A restart test, new schema, grants, credentials or production action was introduced.

Reproduce focused behavior with `PELORA_P3A_LOCAL=1 node scripts/qualifyPrivateHistoryBoundary.mjs --focused`. Full/remaining component commands and exact run identities are in the JSON. The final runner excludes the already-qualified real-restart subcase, so a future full rerun has an explicitly reported omission rather than an invented all-executed total. Original policy/diagnostic reports remain unchanged; new diagnostic scratch writes are isolated from their existing files.

## Privileges, protected contracts and remaining limits

No new SQL objects/runtime procedures, direct table permissions, migrations or credentials. Existing restricted worker/owner separation remains; unchanged CP-05/P2/P4-A privilege-denial coverage passes. Protected CP storage, P1/P2/P4-A composition restrictions, capture/normalization, receipt defaults, scientific assessment contracts and publication modules match baseline fingerprints. Test P4-A configurations are disabled in their existing finally-cleanup, publishers are closed and children exit; no persistent publisher was started.

The private retrieval remains the existing publishable-key plus bearer/RLS path, with no service-role bypass or captain-history transfer into shared science. No frontend/API integration, operational acquisition, default Receipt Writer enablement, deployment or main change.

R1–R5/R8/R10 admission, product support/vintage, independence/window/gap, spatial/static correspondence, shared interpreted history and Nightly policy remain unresolved. R9 finite-derived arithmetic is untouched: its historical conditional counterexamples still reproduce in unassessed low-level transforms and controlled diagnostics; time checks do not fix overflow. Convergence/Ocean Physics and other quarantines remain closed. Raw low-level documentary transformations remain compatible; they are not themselves scientific-admission boundaries.

**SOURCE ADMISSION AND FULL HISTORY SELECTION REMAIN UNQUALIFIED.** Full temporal/narrative equivalence, historical continuity, persistence and Nightly Learn/Audit remain beta requirements. **CP-10 REMAINS BLOCKED.** Stop before R9 or any further mission.
