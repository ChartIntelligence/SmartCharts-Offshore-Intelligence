# CP-09B Packet P1 — pure retained Blue Marlin composition v1

**P1 CURRENT-EVIDENCE SOFTWARE COMPOSITION QUALIFIED**

**CONTROLLED INPUTS ONLY — NOT OPERATIONAL SCIENCE OR BETA READINESS**

**CP-10 REMAINS BLOCKED**

Baseline: `234fef5203fab91df3f0132cada6d9ab7726e065`, verified branch `codex/pelora-remote-setup` in the authorized worktree. Origin/development remote matched the baseline before checkpointing. Only P1 implementation, focused tests, extraction-compatible fixtures and this qualification record changed. The unrelated Supabase pair and local evidence were preserved. No P2/P3/P4 implementation, publisher wiring, schema/grant/credential/package changes, restart exercise, frontend/main/production change or default Receipt Writer enablement occurred.

## Owned implementation and reused components

[retainedBlueMarlinComposition.mjs](../backend/durableObserve/retainedBlueMarlinComposition.mjs) exports `composeRetainedBlueMarlinV1()` and versioned input/output identifiers. It accepts descriptor-safe retained artifacts, explicit assessment/context, an ordered candidate cohort and **explicitly unavailable history**. It snapshots before reading scientific fields, validates exact content references, conflicting reference identities, candidate/static-parent/context/time/sample bindings and source shapes, and freezes output plus exact `inputsUsed` references/content/purposes. A digest establishes consistency, not producer execution or scientific authority.

The only shared production edit is [server.js](../backend/server.js):

| Pure seam | Existing path delegation / preservation |
|---|---|
| `buildCurrentSpatialStructureFromRetainedSamplesV1()` | `getCurrentSpatialStructureAtAssessment()` delegates its existing settled-sample assembly; vectors, counts, coverage, measurements and classifications retain the original body. |
| `buildSstSpatialStructureFromRetainedSamplesV1()` | `getSstSpatialStructureAtAssessment()` delegates existing sample assembly and classification. Warning logging remains in the acquisition caller; the pure helper does not log. |
| `buildCurrentDerivedFromRetainedSpatialV1()` | `getOceanConditionsAtAssessment()` delegates its original organization/relationship/pattern/vector/gradient/shear/convergence/edge composition in unchanged order; assignment becomes return. |
| `buildSstConditionsFromRetainedSpatialV1()` | The same request path delegates its original center SST/derived-context object assembly. |
| `retainedSpatialSampleLayoutV1()` | Exposes the existing SST/current sample-point producers without another radius, tolerance or layout algorithm. |

Scientific bodies remain one implementation. There is no general server cleanup or formula change. Existing SST source omission/presentation semantics are preserved; supplied source metadata remains traceable in retained inputs rather than silently upgrading output authority.

The adapter reuses `decodeScalarHandoff()`, `decodeNormalizedCurrentHandoff()`, explicit assessment/age helpers, static bathymetry and species-eligibility producers, environmental feature/evidence assembly, chlorophyll selection, Ocean Opportunity/signals, relationships, Blue Marlin habitat, candidate interpretation, negative adequacy and ranking-input permission. It calls **the existing** `buildUnifiedCaptainOpportunityDeliveryV1()` and `buildGovernedOpportunityEvaluationStateV1()`. No ranker, adequacy flag, eligibility Boolean, quality score, source normalization or receipt authority is invented.

Five existing fixture harnesses now locate the same moved SST body/helper: `cacheIsolatedSnapshotFixture.mjs`, `candidateSemanticFixture.mjs`, `exactCurrentEvidenceFixture.mjs`, `snapshotProducerQualificationV2Fixture.mjs`, and `snapshotProducerSurfaceFixture.mjs`. `sourceDeclarationFixture.mjs` distinguishes the retained column-zero object terminator `};` from a function terminator. These are mechanical compatibility repairs; scientific assertions, historical reports, quarantined algorithms and historical source inventories remain unchanged.

New files: the adapter; [focused suite](../backend/tests/retainedBlueMarlinComposition.test.mjs); `retainedBlueMarlinFixture.mjs`, `retainedBlueMarlinBaseline.mjs`, `retainedBlueMarlinReplay.mjs` under `backend/tests/fixtures`; and [qualification runner](../scripts/qualifyRetainedBlueMarlinP1.mjs). Exact paths/fingerprints (including catalog/water-mask/bathymetry parents), commands/results and actual compressed logs are in [CP09B_P1_Qualification_v1.json](qualification/CP09B_P1_Qualification_v1.json).

## Independent comparison boundary

Before editing, the unchanged checkpoint's explicit-assessment and Task 12B.6 suites passed **56/56**. The reproducible runner archives that immutable Git commit into ignored qualification scratch. A separate baseline module retains all original scientific implementations and dependencies, exposing the original acquisition-free calculation blocks. It does not import the candidate server implementation. Four body fingerprints prove unchanged calculations: current samples; SST samples except warning relocation; current derived context except assignment-to-return; and SST center assembly. Baseline server SHA-256: `bb4002849a6778926de07a5999fa9dc469f12bf2e259e5519e77728a736ee96d`. Candidate server: `c960d63bf07226cfa1b605c30cf900f5bdcc5a6003ac73129ccb5f452a0a7f69`.

Under identical controlled normalized/capture-handoff inputs and explicit assessment, baseline and candidate compare full supplied environmental evidence/groups and spatial structures; habitat score/confidence/eligibility; relationship context/assessment; candidate identity/interpretation; negative adequacy predicates/reasons; ranking permission/exclusions; existing delivery and evaluation-state counts/reasons/cohort scope. The declared narrative/provenance subset is existing Ocean Opportunity/signals, environmental/habitat limitations, relationships, explicit unavailable-history state and source metadata/used references. Full observation/intelligence snapshot, temporal narrative, persistence/continuity and Nightly Learn/Audit equivalence are **not** claimed.

History is exactly `{state: "UNAVAILABLE", reason: "shared-scientific-history-unavailable-for-p1", sourceReference: null}`. No AVAILABLE-empty context or history entries are created. Current-evidence science receives no persistence input (`oceanPersistence: null`); the resolution outcome is retained separately. This neither treats failed resolution as empty history nor demonstrates that history is irrelevant elsewhere. Cycle V2 is not relabeled as the V3 history contract. Beta scope remains unchanged.

Preserved inputs include exact static/catalog parents and producer-derived eligibility, requested versus provider-resolved coordinates, center/directional SST, center/neighborhood current vectors and failures, both chlorophyll alternatives and actual selection lineage, layer-quality states, source times/units/revisions/support declarations and limitations. Existing scalar/current handoff decoders verify original references; controlled normalized-point artifacts are expressly fixture-only. Signed zero survives exact retention and current handoff decoding. Missing values stay null or explicit rejected samples and reach existing unavailable/inadequate outcomes. Mismatched/corrupt bindings fail closed. No nearest-cell replacement, interpolation or invented spatial coverage occurs.

The complete controlled fixture produces genuine **governed-zero**, with adequacy and eligibility derived by existing functions; no positive Opportunity is fabricated. Existing Task 12B.6's intentionally incomplete scalar/spatial and metadata counterexamples still pass unchanged as diagnostic findings. New cases prove the full adapter retains those inputs rather than relabeling the incomplete projections as equivalent.

## Results and reproducibility

| Actual run | Result / accounting |
|---|---|
| `node --test backend/tests/retainedBlueMarlinComposition.test.mjs` | **44/44**, including final exact bytes after LF normalization. |
| `node scripts/qualifyRetainedBlueMarlinP1.mjs` | **535/535 reported current Node tests across 14 affected suites**, includes P1 and overlaps the prior profile. Explicit assessment, captures/exact serialization, scalar handoffs, Task 12B.6, habitat/candidate/Opportunity governance, delivery/state and envelope regressions included. |
| `PELORA_CP09_LOCAL=1 node scripts/qualifyCP09Local.mjs .local/ocean-quarantine/cp09b-p1/full-profile` | **839/839**, one final full run; **160 PostgreSQL cases** included. Existing isolated credentials and synthetic qualification paths only; no new DDL/grants/reset/restart/deployment. |
| Syntax / changed-code lint / whitespace | 13 JavaScript files syntax-checked; existing ESLint recommended rules with Node globals, server changed lines only: no errors; `git diff --check` passed. |
| Import/clock/transport replay | Two fresh processes produce identical exact bytes with pre-import fetch/HTTP/HTTPS/net/TLS/listener and `Date.now` denial. Adapter has no acquisition/Auth/cache/query/publication/timer ports. |

Primary qualification count is **883/883 = prior 839 + new 44**, with zero failures/skips/cancellations in that boundary. Do not add the overlapping 535 again. The legacy ocean-conditions script reports one Node test and 719 explicit PASS lines; subsidiary manual scripts overlap it and are not counted as additional distinct Node cases. The final nested-role guards were followed by the 44-case focused and 535-case affected reruns. The completed 839-profile shared-science and existing-consumer dependencies remained byte-identical; that unrelated profile was not repeated for an unwired adapter validation guard. Assessment boundary cases include 72/73/96/97 hours, missing/partial/failed support, different availability/quality at equal values, DIRECT versus GAP_FILLED, static/sample/nested-role/context/time mismatch, corrupt references, mutation, repeated replay and explicit history unavailable.

Baseline failure accounting is retained, not manufactured green:

- `exactScientificEvidence.test.js`'s frozen-source assertion already fails at the unchanged checkpoint: historical expected server Git blob `6094841c70d8e1c6a0062ec1e71f3704964cd6d2`, entering baseline `420175ff2529eff58c28f8ee2e3889951b7d45a8`. Its existing manifest role is FROZEN_SOURCE_INVENTORY. The affected runner excludes exactly that already-classified assertion; **159 current capture cases pass**. It is not counted as a passing historical assertion.
- The extra normalization governance inventory probe reports **2 passed / 1 failed**, outside the required 839 profile: its protected hash for `defaultProviderTransitive.test.js` differs from the byte-identical baseline/candidate file. Its current server inventory also predates the entering baseline. The old inventory/profile is preserved byte-for-byte; this packet records fresh tested fingerprints separately and does not reopen historical ledger debt.

No new runtime scientific defect was observed. Qualification log copies are integrity-bound gzip records; a credential-shaped adversarial-title log remains local-only with command/result and original fingerprint retained, so pattern-bearing values are not copied into Git. The three catalog/water-mask JSON files retain their entering CRLF checkout bytes; the LF Git-archive counterparts have separate fingerprints and exact scientific JSON equality was verified. Reports have no self-hash; document bytes are separate from tested implementation/fixture fingerprints. Draft setup failures (fixture source boundary, runner escaping, missing existing local envelope opt-in) were resolved without changing science or weakening assertions.

## Remaining dependency and stop

This completes **software composition A only** under controlled inputs. It does not establish provider/product science B, operational retained-source availability/scheduling C, production readiness D or beta readiness. Receipt Writer remains disabled by default. Existing derivative/feature-science quarantines and D3–D8 authority questions are unchanged.

The next implementation dependency is separately authorized **P2**, supplying exact approved retained environmental neighborhoods and static context through qualified bounded read contracts, with applicable source/product/support/possession decisions resolved. **P3 shared history selection/resolution and full temporal/narrative qualification remain required for the beta plan**, including persistence, continuity and Nightly Learn/Audit. P4 publication integration also remains separately gated. No further packet or CP-10 is started.
