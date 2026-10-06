# CP-09B / P2 — Exact retained-input supply v1

**P2 EXACT RETAINED-INPUT SUPPLY MECHANICS QUALIFIED**

**ISOLATED CONTROLLED USE — SCIENTIFIC ADMISSION STILL GATED**

**CP-10 REMAINS BLOCKED**

Baseline: `73084ca3b065e83c6287dd7767556d5227aaedfc`, branch `codex/pelora-remote-setup`. Local and remote matched on entry. No entering tracked/staged changes; `supabase/.gitignore` and `supabase/config.toml` remain unrelated and untracked. Production, main, acquisition, Receipt Writer enablement, history selection and publisher integration were not changed.

## Implemented boundary

`backend/durableObserve/retainedInputSupply.mjs` supplies retention and exact-reference inspection. It never acquires, evaluates, ranks, writes publications, resolves captain history or creates observation authority.

| Function / contract | Implemented behavior |
|---|---|
| `sealRetainedInputRecord`, `validateRetainedInputRecord` / `pelora-retained-input-record-v1` | Descriptor-safe detached snapshot, exact source/transport references, native handoff/archive validation, immutable metadata, fixed `NOT_SCIENTIFICALLY_ADMITTED`. Types: `P1_EXACT_ARTIFACT`, `SCALAR_HANDOFF`, `CURRENT_HANDOFF`, `FRAME_ARCHIVE`, `STATIC_CONTEXT`, `REFERENCE_SET`. |
| `nativeRetainedArtifact` | Transport identity binds the existing native capture/reference or archive identity; it does not mint replacement evidence. Same native identity with different payload/context/metadata conflicts. Capture bytes and context bytes remain unchanged. |
| `createRetainedInputStore` | Narrow PostgreSQL retain/exact-read calls. Exact UTF-8 text/digest readback, identical duplicate reconciliation, immutable conflicts, actual database retention timestamp, authoritative read after uncertain ACK. No latest, nearest or revision preference. |
| `planControlledRetainedSupply`, `resolveControlledRetainedSupply` / `pelora-retained-input-reference-set-v1` | Explicit ordered reference set plus assessment/context/template; every embedded child matches an explicitly retrieved artifact. Candidate/static parent producer correspondence and exact original sample layout checked. Only controlled records can supply unchanged P1. Missing center/neighborhood support remains unresolved. |
| `sealExplicitRetainedSelection`, `resolveExplicitRetainedSelection` / `pelora-explicit-retained-input-selection-v1` | Explicit real-source-lane family/role/reference/static-parent selection. Existing candidate/static producers and exact sample coordinates are checked. Always unadmitted; returns per-input limits and no composition input. It supplies no selection or admission policy. |
| `readRetainedReferenceSet` | Exact persisted selection/binding document readback. Retained reference sets do not establish producer execution, authorization or cutoff possession. |
| `inspectRetainedSource` | Original native identity and source point plus a separate explicit-assessment age projection. Original handoff/capture text, recorded age/context and retention time are unchanged. Frame identity remains distinct from transport identity. |
| `resolveExactCurrentReaderSupply` | Uses only CP-07 `read_scope` and requires the explicitly selected observation ID. Native-cell evidence stays unresolved for P1 candidate/neighborhood correspondence; no coordinate relabeling or asserted Boolean correspondence. Bounded reader pages cannot prove an absent record is absent outside that page. |

Resolution states include `FOUND_VALIDATED`, `ABSENT`, `CONFLICT_OR_CORRUPT`, `READ_UNAVAILABLE`, `UNRESOLVED_SUPPLY`, `RETAINED_AUTHORITY_UNRESOLVED` and `OUTCOME_UNKNOWN`. `CONTROLLED_SUPPLY_READY` means exact resolution/binding readiness, not scientific admission; unchanged P1 remains the final controlled input/scientific validator. Missing rows are never synthetic provider failures, zero values, accepted no-data or governed-zero.

## Contracts reused and storage choice

The module reuses `exactJson` from `exactScientificEvidence.mjs`; `copy`, `keys`, `reference`, `freeze` from `shared/oceanPublication.mjs`; `decodeScalarHandoff`; `decodeNormalizedCurrentHandoff`; `readOceanArchiveV1`; `requireScientificAssessmentV1` and `reassessCurrentAgeV1`; and `createOceanStateReader`.

Static/spatial binding calls existing `resolveOpportunityCandidateBathymetryV1`, `evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1`, `BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE` and `retainedSpatialSampleLayoutV1`. A caller-supplied eligibility Boolean is rejected. No scientific formula or producer changed. The complete retrieved controlled input calls unchanged `composeRetainedBlueMarlinV1` only in qualification tests, comparing the entire output, including adequacy, exclusions, identities, delivery and evaluation state.

Existing Frame/archive serialization uses ordinary canonical JSON and can lose signed zero before archival. It is preserved as its own validated archive representation (`frameJson` and archive receipt), with no conversion into an exact scalar handoff. Scalar/current handoffs retain their original `captureText`, `contextText`, references and context using the existing signed-zero-preserving exact codec. No normalization implementation was copied.

There was no compatible concrete shared PostgreSQL backend for this heterogeneous exact P1 input set. The authorized minimal adapter is `backend/durableObserve/cp09bSupply.sql`: one schema, one immutable table and two routines. `record_text` stores exact UTF-8 transport text, not JSONB scientific numbers. SHA-256 checks cover exact text. JSONB is used only for routine envelopes/schema checks; source text is not rebuilt from JSONB. A native reference, supply transport reference, explicit selection/reference-set identity and assessment context remain separate.

`retained_at` is authoritative database insertion time and is unchanged on duplicates. Caller-provided acquisition/acceptance/receipt/support/revision metadata is retained as declared, not authenticated. Later bundle construction and assessment timestamps cannot become earlier possession timestamps. Unknown support/model/run/revision/lineage remains unknown. A legacy archive receipt is not a qualified historical Receipt Writer receipt. CURRENTS Receipt Writer admission/default-disabled behavior is unchanged; SST/chlorophyll receipts were not enabled.

## Privilege surface

Owner remains non-login `pelora_cp02_owner`; runtime remains existing `pelora_cp02_worker`, without superuser, CREATEDB, CREATEROLE, BYPASSRLS, replication, ownership or role membership. P2 adds schema `USAGE` and only:

- `cp09b_supply.retain(text,text,text)`
- `cp09b_supply.read_exact(text)`

Both are SECURITY DEFINER with `search_path=pg_catalog`, fully qualified protected objects, local-database/address/port guards, and no PUBLIC execution. Payload limit is 4 MiB. The worker has no direct SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER/MAINTAIN on the new table and cannot create/alter/replace schema/routines or disable immutability. The table uses existing nondeferred `cp02.immutable`.

The complete audited runtime EXECUTE allowlist is the two additions plus unchanged `cp02.worker(text,text,uuid,text,bytea)`, `cp03.lookup(text)`, `cp04.inspect(text,uuid)`, `cp04.worker(text,text,uuid,text,bytea)`, `cp06.lookup(text)`, `cp06.worker(text,uuid)`, `cp07.read_scope(text,text,timestamptz,timestamptz,timestamptz,integer)`, `cp08.lookup(text,timestamptz,text)`, `cp08.submit(text)`, `cp09.worker(text,text,uuid,text)`. Exact PostgreSQL signatures/body hashes are pinned in `retainedSupplyPrivilegeManifest.v1.json`. Full catalog verification passed for 26 protected tables and 26 required triggers. Older manifests and all existing protected routines remain unchanged.

The runtime retention routine is not a trusted scientific validator. A worker could retain a malformed unadmitted record through its narrow routine; read validation fails closed. There is no path from this table to accepted observation or publication authority. Owner/admin remains the migration trust boundary.

## Qualification and evidence

Actual environment: existing manual isolated PostgreSQL on `127.0.0.1:55432`, existing external credentials, Node 24.18.0, offline controlled inputs. No packages, credentials or grants outside the new narrow schema were added. Durable commands, outputs, source identities, log hashes/compressed logs, tested file fingerprints and limitations are in [CP09B_P2_Qualification_v1.json](qualification/CP09B_P2_Qualification_v1.json).

| Boundary | Result / accounting |
|---|---|
| Prior CP profile | **839/839**, including 160 sequential real PostgreSQL cases. Run once using `scripts/qualifyCP09Local.mjs`. |
| Existing P1 | **44/44**, unchanged independent checkpoint oracle and unavailable history. |
| New P2 final focused suite | **60/60**: 37 offline and 23 PostgreSQL cases, including the parent case. |
| Required combined boundary | **943/943 = 883 + 60**. |
| P1 directly affected profile | **535/535**, overlaps the preceding boundaries; not added to their total. Includes explicit assessment, captures/handoffs, Task 12B diagnostics, habitat/candidate/Opportunity governance, delivery and evaluation state. |
| Existing Frame/archive | **53/53**, separately reported affected suites. |
| Verification | Syntax, fresh-process network/implicit-clock denial, changed-code ESLint recommended rules, diff/whitespace and sensitive-content checks. No lint errors/warnings. |

P2 cases prove exact bytes/references; scalar/current signed zero; separate DIRECT/GAP lineage; producer-derived static parents; candidate/sample/context/time conflicts; no provider-cell relabeling; absent neighborhood support; no-valid-pixel versus absence; actual failures and quality metadata preservation; caller detachment; same-target differing content; conflicting identities; duplicates/concurrency; rollback; lost committed ACK; unknown outcome when readback is unavailable; unknown/late/missing receipt/support; original source bytes across later assessment; no acquisition/Auth transport/cache/queue; worker denials; and complete stored controlled input equality with direct P1, without forcing adequate/eligible/positive outcomes.

A narrow actual PostgreSQL restart verified **133 P2 artifacts** and exact restricted-worker readback before/after, with changed server start time. Existing CP restart suites were not repeated. Later final focused tests append additional controlled artifacts; the evidence identifies the exact 133 restart-tested records separately.

Final review expanded private-field rejection, clarified original Frame identity, and preserved read-outage/bounded-page uncertainty after the full profile. Behavioral refinements affected only the unwired new supply module and its new offline test; intended new files were also normalized to LF for commit. Final focused tests and lint used the exact normalized bytes; focused P2 was rerun (60/60), and changed-code lint passed. All existing scientific/CP-profile/P1 consumer bytes match the entering checkpoint, documented with fingerprints. No whole-profile rerun was needed for these isolated refinements. Worktree tested fingerprints and LF-normalized source fingerprints are distinct; evidence-document hashes are not implementation identities.

Historical inventory exclusions retain their recorded disposition. The exact-capture frozen-source checkpoint assertion remains excluded as historical inventory; the existing outside-profile `sourceNormalizationRegressionGovernance` inventory failure remains recorded in P1 evidence and is not described as a pass. No expected scientific results, old qualification records or historical inventories were rewritten.

All native handoff/archive examples, including those exercising the `RETAINED_SOURCE` inspection lane, are explicitly synthetic qualification bytes. That lane label is not real provider qualification. The existing accepted CURRENTS row exercised through CP-07 is local qualification evidence. No actual retained record was relabeled `CONTROLLED_FIXTURE` or fed to P1 to bypass its guard.

## Remaining dependencies and stop

D2 exact operational candidate/static/neighborhood correspondence; D3 provider/product/revision/model/run/temporal-support authority; and D6 qualified cutoff possession/missingness/receipt admission remain gated. Reference/digest validity and synthetic equivalence do not resolve them. CP-07 accepted no-data support remains absent; 72h presentation freshness and 96h live-age usability remain separate and do not grant Opportunity eligibility.

P1 keeps `CONTROLLED_FIXTURE` and explicit `UNAVAILABLE` history. Beta scope still requires historical continuity, persistence and Nightly Learn/Audit. P3 history selection/independence/span/gaps, P4 publisher integration, derivative/feature science, operational cohort/source policy and production readiness remain separate prerequisites. There is no new selector, scheduler, claim system, ranking engine or provider. Stop here; CP-10 and operational publishing remain blocked.
