# Historical Availability Runtime v1 — storage gate

**HISTORICAL_AVAILABILITY_STORAGE_CONTRACT_REVIEW_REQUIRED**

Starting/final HEAD: `5f8a084fb355df8ff654c3c6eb3034b60dbd15f9`; branch `codex/pelora-remote-setup`. The annotated source-normalization predecessor resolves to this HEAD. **No runtime implementation or test-source modification.** Only this document and its [JSON report](Historical_Availability_Runtime_v1.json) are created.

The human-authorized availability contract can be implemented only after its independent receipt authority exists. The [qualified contract](Historical_Availability_Reference_Contract_v1.md) expressly distinguishes exact metadata compatibility from production issuer, clock, durable storage and resolver qualification. This STOP follows the requested storage gate, not a request to reopen scientific policy.

## Live path at this HEAD

- **acquire/normalize:** backend/server.js; getOceanConditionsAtAssessment → getMarineConditions → getChlorophyllConditionsAtAssessment → getGapFilledChlorophyllConditionsAtAssessment → getCurrentConditionsPointAtAssessment. Existing source normalization v1 and explicit assessment context; no independent receipt issuance.
- **exact current capture and HTTP handoff:** backend/normalizedEvidenceCapture.mjs; encodeNormalizedOceanResponse → encodeNormalizedCurrentHandoff. Actual /api/ocean response encodes current center/cardinal evidence in capture v3 with exact reference and normalization lineage. Integrity/provenance does not authenticate a receipt event.
- **browser storage handoff:** frontend/src/hooks/useOceanMemoryPersistence.js; useOceanMemoryPersistence → saveOceanSnapshot → buildOceanSnapshotStorageRow. Browser calls existing insert into ocean_snapshots; snapshot_payload carries exact envelope. Duplicate handling keys on user_id + snapshot_id, not exact evidence revision.
- **history retrieval:** backend/server.js:368; retrieveOceanMemoryRows. Captain-owned REST row retrieval with optional represented-time/coordinate filters; live assembly call at 61312 requests maximumRows=48, no exact availability resolver.
- **row adaptation and exact reconstruction:** backend/server.js:18239; buildOceanMemoryStorageRecordFromRow → decodeNormalizedOceanSnapshot. Row timestamp shape/consistency plus exact v3 reconstruction. Storage available is not historical availability authority.
- **historical query and active consumers:** backend/server.js:61348; buildHistoricalSnapshotQuery → buildOceanMemoryTimeSeries → buildOceanChangeFromTimeSeries → buildOceanPersistence. Existing selection/dedup/time ordering feeds the 16 active consumer family. No new filter, selection or eligibility gate added.

The 16 active consumer names and current source locations are retained in the JSON. They cover change, SST/current/vector-feature persistence, water/transition/front/productivity/clarity persistence and feature continuity. No new availability result is wired into their scientific selection. Explicit assessment context exists in scientificAssessment.mjs; the legacy history query does not thereby acquire a trustworthy exact receipt filter.

## Receipt-authority findings

| Candidate | Why it does not establish the required receipt authority |
|---|---|
| observedAt / representedAt / provider or sample time | Represented environmental time is not a Pelora possession event. |
| marine.retrievedAt | Operational time is not automatically an independently governed completed exact-capture receipt. |
| generatedAt / generated_at | Can precede final exact handoff creation; must not backdate normalized content. |
| currentPointCache.cachedAt / sstPointCache.cachedAt | No durable independent witness; cannot establish replay authority or later capture creation time. |
| storage.storedAt argument | Frozen self-asserted timestamp is not event authentication. |
| row.created_at / stored_at -> storage.storedAt | Default is not enforced issuer authority. Ownership and row consistency do not authenticate receipt; legacy snapshot ID is not exact revision identity. No deployed service state was inspected. |
| SST acquisition completedAt | Useful raw binding with external clock/port guarantees; not active-history trusted normalized-content issuer. |
| archive archivedAt / worker processedAt | Hash and durable acknowledgement alone do not establish governed clock/event occurrence; no active-history receipt resolver is installed. |
| assessmentAt | The comparison cutoff must never become receipt authority. |

The checked-in ocean_snapshots schema defaults created_at to now(), but the current hardening migration grants authenticated users table-level INSERT; the owner RLS check does not bind an immutable exact-content receipt or prevent supplying created_at. The ordinary browser builder omits created_at, but that is not enforced receipt authority. The row adapter accepts any parseable created_at (or stored_at fallback). Its storage availability/immutable flags are storage representation semantics, not independent historical trust. No SQL, service query, provider request or Auth flow was executed; deployed state was not inspected.

The existing archive API validates exact Frame/receipt bindings and requires an external durable acknowledgement, but archivedAt is supplied in the write intent. NOAA raw acquisition accepts a supplied completedAt. These are useful building blocks with external trust requirements; neither supplies an active Ocean Memory availability issuer. Hash self-consistency alone cannot authenticate an event.

## Minimum review requirement

1. An independently governed server-controlled recorder observes completed possession/creation of the validated exact referenced content, after normalization/capture where that is the claimed evidence.
2. Its immutable authority witness binds the exact evidence reference, strict UTC event time, issuer, clock/event meaning and producer/normalization provenance; a claimant cannot rewrite or backdate it.
3. The witness and exact referenced evidence/dependency closure remain durably retrievable with append-only or equivalent governed integrity, and exact lookup verifies issuer authority independently of claimant metadata.
4. Approve the storage/write-access/clock/retention trust boundary before implementation. Existing JSON capacity alone does not establish this authority; no specific new table/column/crypto mechanism is selected here.

Do not invent a table, migration, signing system or new capture version here. Existing JSON payload capacity may carry reference metadata, but does not supply an independently resolvable trusted witness. A process-local map would not establish durable replay authority. Reusing existing storage still needs an approved authority/write-access/event contract; no particular database design is selected.

## Exact identity and narrow as-of meaning

Reuse validated exact references: current capture v3 for new current evidence, and each other existing qualified representation within its own domain. The full reference binds capture authority/lineage; the narrower scientific digest is insufficient for that closure. Same exact content/reference is stable; same represented time with changed u produces a different exact v3 reference. The legacy snapshot ID remains the same for that revision, so it is not an exact-revision substitute. No second scientific identity system is created.

The qualified logical record remains only contractVersion, evidenceReference, receivedAt and authorityReference. Its production issuer/resolver are **not implemented**. Future resolution must independently authenticate the exact immutable witness and compare receivedAt <= assessmentAt. It must never substitute representedAt, provider time, generatedAt, retrieval time or assessment time. Any trustworthy qualifying receipt suffices; earliest-ever is not required. Repeated receipts identify events, not additional observations.

New exact current handoff preserves pelora-source-normalization-v1 and signed zero. Historical unmarked evidence remains unmarked; no migration, relabelling or ambiguous-zero reinterpretation. Capture v3, historical v1/v2 and source normalization are unchanged.

## Bounded verification

Three offline scripts passed, **49 cases**: existing historical-availability contract 25; current capture-v3 14; temporary storage-gate diagnostics 10. Zero failures/skips/cancellations. Qualified private-index checkout and lockfile-bound offline materialization were reused; dual instrumentation recorded **zero operational network attempts**. Intentional denial calibration is separate.

Diagnostics reproduce: -1 ms/equality/+1 ms cutoff results with stipulated independent synthetic witnesses; missing/invalid receipts and wrong revisions rejected; self-consistent fabrication rejected without trusted resolution; repeated receipts preserve evidence identity; represented time does not decide possession; live row adaptation accepts backdated/future created_at; same-time changed content collides in legacy snapshot ID but not exact v3 identity; exact normalization lineage and -0 survive while historical provenance remains absent. These are contract/storage-boundary controls, **not production receipt qualification**.

No consumer eligibility, freshness, lookback, support, revision rank or species/scoring calculation was added or invoked by the new diagnostics. No full regression was required or run because implementation stopped before production changes. Retained test source/log hashes and reproduction inputs are in the JSON and execution receipts.

## Preserved limits and next gate

Open-Meteo SST source/model equivalence remains unresolved. DIRECT chlorophyll exact support bounds remain provider-dependent. GAP_FILLED family/29-day input knowledge does not establish exact deployment/target-bound authority. NOAA current temporal clarification remains pending. Availability would prove possession only, never scientific eligibility. Historical selection, temporal arithmetic, source normalization, current-vector locality, convergence/Ocean Physics, frontend, Supabase and Auth remain unchanged. Projection V3 stays quarantined; Ocean Physics, 12B.6C and 9E-D stay paused.

All 14 predecessor checkpoint files, 177 protected artifacts, 20 archived historical suites, 15,363 real dependency files and manifests/lockfiles remain unchanged. Tracked and staged diffs are empty. Supabase pair remains unchanged/untracked/excluded. The only new repository files are this MD/JSON pair.

**Next gate:** approve a concrete, independently trustworthy receipt-event/clock/storage/resolution contract before runtime issuer/resolver work. This does not authorize historical selection or product temporal-policy implementation. No commit, tag, push, deployment, external service access or environmental acquisition.

Final post-cleanup verification passed: HEAD/tag, all predecessor/protected bytes, historical suites, real dependencies, manifests/lockfiles, Git configuration and excluded Supabase bytes unchanged. Syntax, JSON, whitespace and literal-reference checks passed with zero actual missing dependencies. Temporary checkout, materialized dependencies and cache were removed; external execution receipts remain available.

## STORAGE CONTRACT REVIEW v1 — current review

**NEW_DURABLE_RECEIPT_STRUCTURE_REQUIRED**: a new **logical durable authority record** is required. This does **not** establish that a new physical table or column is necessary. Physical placement and enforcement remain for human approval. The preceding runtime STOP and its 49-case receipts are preserved as history. This section supplies the subsequent minimum logical contract review; production remains unchanged.

### Existing architecture and storage alternatives

The live path remains normalization/current exact capture → HTTP → browser row builder → captain INSERT into ocean_snapshots → backend row adaptation/current replay → historical query and 16 active consumers. No receipt issuer/resolver exists. Inspection is repository-only; no deployed policy or durability is asserted.

| Candidate | Disposition | Decisive boundary |
|---|---|---|
| public.ocean_snapshots | EXISTING_STRUCTURE_SEMANTICALLY_WRONG as independent witness unchanged | Caller-overridable created_at and revision-colliding snapshot key. Exact current payload does not authenticate an event. |
| Ocean Product Archive receipt/frame port | EXISTING_STRUCTURE_REQUIRES_NARROW_CONSTRAINT_CHANGE | Reusable atomic/exact-read pattern in Frame domain; caller archivedAt and injected durable port unqualified. |
| NOAA raw receipt/retention port | EXISTING_STRUCTURE_REQUIRES_NARROW_CONSTRAINT_CHANGE | Raw checksum binding exists; completedAt is supplied before acquisition, not sampled by that function at final completion. Cannot backdate later normalized capture. |
| Publication exact records/latest pointer | EXISTING_STRUCTURE_SEMANTICALLY_WRONG | Derived assessment identity/time is not upstream receipt proof. |
| governed_opportunity_history / governed_opportunity_observation | EXISTING_STRUCTURE_SEMANTICALLY_WRONG | Captain evaluation records, not environmental possession witnesses. |
| Fishing reports/access/signup records | NOT_RELEVANT | Private trip/access domains; not repurposed. |
| Cache/retrievedAt/generatedAt/storedAt | EXISTING_STRUCTURE_SEMANTICALLY_WRONG | Volatile or supplied metadata, no independent durable authority. |

No candidate is sufficient unchanged. Reusing ocean_snapshots physically would require a separately governed authority contract, trusted write path and revision-safe lookup; changing its timestamp default alone would not suffice. Its immutable scientific snapshot payload must not be silently reinterpreted. A logical witness can reference exact evidence without duplicating observations. No table name, migration or API is selected.

The checked-in table-level SELECT/INSERT grants and owner RLS permit old, future or copied-provider created_at. Normal row-builder omission is not enforcement. The adapter accepts parseable timestamps. Same-content timestamp changes create no scientific observation. Same-time changed content can collide under (user_id,snapshot_id); browser duplicate recovery returns the winner without exact revision validation. Ordinary UPDATE/DELETE grants are absent after hardening, but this cannot authenticate the initial INSERT. User deletion cascades and may remove proof. All statements concern checked-in policy, not deployed state.

### Clock and minimum shape

A **trusted backend completion clock is sufficient in principle**; a database clock is not mandatory. Both need governed issuer, event meaning, precision, accuracy and ordering. Sample after the claimed exact content has been successfully possessed/created and validated. Transaction-start/default time must not be assumed to establish later completed possession. Request start, provider/sample/represented time, assessmentAt, generatedAt and caller created_at are not substitutes. Unknown trust/order fails closed; no tolerance is invented.

Retain the qualified four-field record:

- contractVersion: pelora-historical-availability-reference-v1.
- evidenceReference: full existing validated immutable reference.
- receivedAt: strict explicit UTC completed-possession event.
- authorityReference: exact independently resolvable issuer/event/clock witness.

The authority target independently binds the exact reference and time under identified/versioned issuer/event/clock governance, retaining producer provenance where not already transitive. Its precise wire representation remains for implementation review. A supplied trusted flag or self-consistent hash is not event authentication.

A separate receipt UUID is unnecessary: authorityReference can identify the event/retry. Source/product identity, represented/provider time and capture version are already in validated evidence/reference. New current v3 also binds normalization lineage there; do not duplicate pelora-source-normalization-v1 in the availability record. Missing historical lineage remains missing. Freshness, eligibility, lookback, revision preference, score and confidence belong nowhere in this witness.

### Exact references by family

- **New CURRENTS:** currentCaptureReferenceV3, its validator and exact captureText. Live envelope exists; durable receipt authority does not. Full reference binds processing lineage and signed zero; scientificContentDigest alone is insufficient.
- **Historical captures:** retain original version-specific v1/v2 identity/readers; no upgrade.
- **SST, DIRECT and GAP_FILLED chlorophyll:** currentEvidenceCaptureV2 already supplies family-specific exact capture/reference mechanisms, verified synthetically. The live encoder replaces only CURRENTS: these other active legacy payloads have an **exact-reference integration gap**, not a demonstrated need for a new capture format. Future capture must occur at its true event boundary, never backdated. Do not expand v3's authorized scope to solve this.
- **Weather/marine quality and companion:** existing v2 exact references, with the companion's quality-reference dependency resolved.
- **Governed Frames/archive:** full validated Frame/archive identities; point samples additionally bind component/sample address. Do not substitute Frame JSON for exact capture signed-zero encoding. Raw checksums identify raw content only.
- **Arbitrary legacy snapshot/unversioned object:** EXACT_CONTENT_REFERENCE_GAP until exact original content and governed representation are independently established. Row UUID, same-time snapshot ID or a nested current envelope does not qualify the entire mixed snapshot. No new generic hash system is invented.

### Issuer, immutability and repeated receipts

The trusted issuer resolves/validates exact bytes and dependency closure, observes completed possession, samples its governed clock and durably publishes an immutable witness under protected write authority. Return success only after validated durable acknowledgement and resolvable closure. Receiving client bytes can establish possession now after actual validation; it does not authenticate the provider or the client's claimed earlier time.

One immutable accepted witness per exact reference is sufficient. Multiple events are allowed but do not add observations, persistence or evidence weight. Conditional retries return the accepted winner without rewriting time/reference/authority. First accepted is not earliest-ever and is not a revision preference. Exact lookup must compare full identity, not only the legacy key.

Protect exact reference, receivedAt, authority identity and issuer/event/clock/producer binding. Only trusted issuers may create independent witnesses. Deny ordinary UPDATE/DELETE/UPSERT/direct-insert bypasses in the authority domain. Owner RLS, Object.freeze and hashes are insufficient. Administrative retention must preserve integrity or explicitly remove proof; no role or credential design is selected.

### Atomicity, failure and retention

Require **atomic publication of a resolvable witness plus durable validated exact dependency closure**, not necessarily one database transaction. Existing archive ports already require atomic retention/readability. Evidence-first immutable persistence followed by conditional witness publication is also logically sufficient if no orphan success is exposed.

| Failure | Required behavior |
|---|---|
| Evidence stored; witness write fails | Evidence alone has no receipt authority. Retry an actual event; never guess/backdate lost time. |
| Witness prepared; evidence write fails | No published success. Pending/orphan witness cannot pass exact closure validation. |
| Duplicate retry/race | Return immutable exact winner; changed content is distinct or collision, never overwrite. |
| Crash before publication | No acknowledged success. |
| Commit succeeds, acknowledgement lost | Unknown outcome; exact lookup/retry can recover committed winner. |
| Evidence deleted, witness remains | May document a genuine past event, but cannot yield positive qualified availability without verifiable exact closure. |
| Witness deleted, evidence remains | No proof unless equivalent independent authority survives. Never recreate receipt from current presence. |

Receipt time measures completed possession, not necessarily commit time. Later persistence can preserve a genuine earlier independently recorded event, but cannot reconstruct lost receipt history. Retention duration, deletion implementation and administrative policy are not selected. Existing user-delete cascade must be included in later integrity review.

Legacy evidence remains AS_OF_AUTHORITY_UNKNOWN / NO_TRUSTWORTHY_RECEIPT. Neither present storage nor migration time proves prior availability. Present-day revalidation can issue only a present event. Legacy values/references and mechanical replay remain unchanged.

### Resolver and authority limits

Inputs are a validated exact reference, explicit assessmentAt and independently resolved immutable witness/policy/closure. Pass only if some trustworthy receivedAt <= assessmentAt. Distinguish these logical meanings:

- AVAILABLE_BY_ASSESSMENT: possession prerequisite only.
- NOT_RECEIVED_BY_ASSESSMENT: known trusted receipts are later; no pre-cutoff proof, **not** proof no earlier event ever existed.
- NO_TRUSTWORTHY_RECEIPT: absent/untrusted authority; inaccessible storage remains explicit unresolved/error, not factual absence.
- INVALID_REFERENCE: malformed/unsupported/mismatched identity or missing/corrupt required exact closure.

These are meaning labels for future API review, not an implemented enum; the qualified reject/Boolean oracle remains unchanged. No replay-time clock, latest lookup or provider call is needed. No scientificallyEligible, fresh, preferredRevision, lookback, support, score or rank output is authorized.

SST source/model equivalence, DIRECT support bounds, GAP_FILLED deployed algorithm/target authority and NOAA current support remain unresolved independently. Source normalization, capture v3, temporal arithmetic, selection, V3 quarantine and paused work remain unchanged.

### Tests and future authorization

**25/25 temporary synthetic cases passed**, one script, zero failures/skips/cancellations and **zero operational outbound attempts**, using the existing denial preload and independent attempt monitor. Cases cover spoof input, exact revisions, before/equal/after cutoff, repeat receipt, legacy absence, mismatch, evidence/witness failure, crash, uncertain acknowledgement, retry, simulated restart, mutation, missing closure and provenance. Actual v2/v3 capture implementations and the existing conceptual oracle were reused. The simulated commit image is **not deployed durability, clock or RLS qualification**. The previous 49-case receipts remain separate. No full regression or expensive historical harness was run; no repository test or production source was changed.

Future authorization must approve: logical witness/authority policy and eligible exact domains; concrete physical placement/persisted contract; trusted writer and all bypass restrictions; clock/event sampling and failure behavior; retained content/dependency/producer closure; immutable idempotent publication/resolution; retention/deletion integrity; and legacy fail-closed behavior. Live SST/chlorophyll exact binding, if selected, needs separately bounded authorization. Migration/deployment is not authorized here.

The JSON storageContractReview section records each candidate, family, attack, clock option, failure state, source hash and test receipt. **Stop for human review of this logical contract and the concrete storage/issuer enforcement plan.**

Final review verification: all 1,977 tracked files are byte-identical; all 177 protected artifacts, 20 historical suites, 15,363 real dependency files, manifests/lockfiles, Git configuration, predecessor HEAD/tag and excluded Supabase bytes are unchanged. Prior Markdown is retained verbatim and prior JSON fields are unchanged. JSON, temporary-test syntax, whitespace and literal references passed; zero missing dependencies and zero operational network attempts. Only this report pair changed, both remain untracked; staged/tracked diffs are empty. No production/storage/schema implementation, migration, provider/database/Auth/Supabase access, environmental acquisition, staging, commit, tag, push or deployment.

## CONCRETE STORAGE PLACEMENT REVIEW — latest review

**HISTORICAL_RECEIPT_STORAGE_DESIGN_READY_FOR_HUMAN_AUTHORIZATION**

This is a selected design proposal, not implementation or deployed-storage qualification. Previous STOP findings and tests above remain historical evidence. HEAD remains 5f8a084fb355df8ff654c3c6eb3034b60dbd15f9. No production, schema, migration, policy or credential changes were made.

### Placement decision

| Option | Result | Reason |
|---|---|---|
| A: existing snapshot/evaluation row | EXISTING_ROW_PLACEMENT_UNSAFE | Caller INSERT can spoof created_at; snapshot key is not exact revision; legacy duplicates and captain deletion make this unsuitable as independent authority. Adding nullable columns does not fix the trust/identity model. |
| B: separate append-only receipt structure | SEPARATE_RECEIPT_STRUCTURE_SAFE as proposed | Protected writer, exact revision key, immutable complete envelope and server-only resolution separate possession authority from scientific and captain row semantics. |
| C: existing reference/audit structure | NO_SUITABLE_STRUCTURE | Archive ports supply a reusable atomic/exact-read pattern, but no concrete trusted receipt store. Publication/evaluation records would be semantically overloaded. |

**Selected physical placement:** one new append-only relational receipt-envelope table in a non-client-exposed private schema in Pelora's existing PostgreSQL storage deployment. Physical names remain for authorized migration authoring; the placement is selected without choosing a new database/vendor. No changes to existing ocean_snapshots, capture contracts or scientific tables are proposed.

The row retains the four logical receipt fields plus the **existing exact capture wire text**, required bounded dependency/producer closure, and independently resolvable authority-target/policy bytes. This is storage of the same exact evidence representation, not a second scientific identity or new capture encoding. Current exact bytes otherwise reside in transient runtime or a captain-owned row subject to deletion. Co-retaining them here makes durable publication self-contained and avoids adding a second evidence-store relation for the initial bounded current family.

Do not retain the whole captain snapshot, HTTP context remainder, user/captain/boat/trip/Auth context. Capture coordinates remain governed environmental content and must not be exposed through a public enumeration endpoint. Required privacy validation remains binding.

### Checked-in map and option-A attacks

The detailed JSON map records columns, keys, defaults, FKs, writers/readers, mutation paths and policy for each candidate. ocean_snapshots has a UUID primary key, unique (user_id,snapshot_id), user-delete cascade and fishing-report SET NULL relation; created_at defaults to now(). Its browser writes and backend reads use captain-scoped permissions. Hardening grants ordinary SELECT/INSERT, not UPDATE/DELETE. The initial INSERT still permits a forged timestamp/content binding. Duplicate recovery uses the legacy snapshot key, not exact revision equality.

The two opportunity tables similarly use UUID keys, per-user evaluation uniqueness, user-delete cascade, caller-overridable created_at and owner SELECT/INSERT. They represent decisions, not source receipts. Archive records instead use immutable createIfAbsent/readExact contracts with caller archivedAt and injected durability; there is no concrete receipt-authority adapter. Publication/raw ports are separate abstractions, not reusable independent authority tables.

An evidence row can predate witness issuance. Embedding a later receipt would mutate the frozen row or require a broader write contract. Nullable legacy fields could distinguish absent witnesses but would not fix spoofing, exact-revision collisions or closure. Embedding authority inside scientific capture bytes would also change their identity. Separate placement avoids these changes.

### Contract, authority and clock

Retain **pelora-historical-availability-reference-v1** and its four fields: contractVersion, evidenceReference, receivedAt, authorityReference. This versions possession semantics only.

The authorityReference uses the existing captured-reference envelope to identify an immutable event target. Proposed target-format identifier: **pelora-historical-receipt-witness-v1**. The target binds evidenceReference, receivedAt and an immutable issuerPolicyReference. The policy identifies backend issuer implementation/version, completed-capture event, clock policy and restricted storage mechanism/version. Retain target and policy with the row. This is receipt processing authority, not provider/scientific provenance.

Avoid circular hashing: the event body contains no reference to itself; the availability record points to that body's exact reference. Hashes prove binding, not authenticity. A resolver accepts only a record independently read from the protected store under recognized issuer policy, never a caller-provided lookalike. No user, captain or provider identity belongs in receipt-authority identity.

**Selected clock: trusted backend UTC clock sampled once after successful exact capture and required closure validation.** Neither request time nor payload time is accepted. A database default is not selected: it would still need governed completion-event semantics, and transaction-start time cannot automatically prove later possession. A hybrid second timestamp is unnecessary; durable acknowledgement governs publication success, not replacement of receivedAt.

Operational clock source, precision and health must be qualified before enabling issuance. Unknown trust/order fails closed without an invented tolerance. No pre-crash timestamp is reconstructed after loss. A genuine new attempt without a committed winner records its actual new event; an existing winner keeps its original time.

### Trusted writer and immutable storage

The current backend Ocean Memory configuration explicitly rejects service-role access. **Preserve that boundary.** Select a separate dedicated backend-only storage adapter with a restricted non-owner database identity. Do not put a broad service-role key into the existing configuration or use captain credentials for issuing receipts.

Grant the proposed issuer only INSERT and exact SELECT on the new relation. No UPDATE, DELETE, TRUNCATE, ownership, DDL or privilege grants. Use a private, non-client-exposed schema and default-deny RLS/privileges for ordinary authenticated/anonymous users. No public arbitrary witness-create function or RPC. A server internal post-capture operation supplies trusted time and authority; neither comes from an HTTP caller.

The resolver needs only authorized server-side exact reads. User-facing SELECT is unnecessary. Database privileges, not API convention alone, enforce immutability. A mutation trigger is not required for this minimum when privilege enforcement is complete; no trigger is proposed. Later tests must verify inherited roles, bypasses and direct writes. Separate administrative retention authority is not ordinary issuer authority. Credential provisioning and connection implementation remain unapproved work.

### Keys, atomicity and retry

Use the full existing exact-reference tuple (kind, contractVersion, referenceId, sha256) as the conceptual unique evidence key in the dedicated receipt-v1 domain. Mechanical key projections must agree with the retained reference. No surrogate/random receipt ID is required. Also uniquely index the authority target's exact reference for independent lookup. Compare validated full bytes/closure on collisions, not merely one hash or legacy snapshot ID.

**Selected publication protocol: one atomic conditional insert of the entire receipt envelope.** Exact capture bytes, dependency closure, authority target/policy and the logical record become durable together. Validate the durable acknowledgement and accepted row before success. No witness-first protocol or outbox is needed. Dependency-first immutable storage is a valid alternative in principle but is not selected for this bounded initial design.

Same exact evidence, retries and concurrent receives return the immutable storage winner. Unique conditional insertion chooses one winner; it does not claim earliest-ever receipt. Do not overwrite its time. Same-time changed content has a distinct full reference. An uncertain response gives no success claim until exact read/retry verifies the committed winner. Failure before insert or rollback yields no witness. Crash after commit preserves the full envelope; crash before commit cannot create retrospective authority.

### Resolver, legacy and retention

Resolve by exact evidence tuple, validate receipt version, authority/policy and exact retained closure, then compare receivedAt <= explicit assessmentAt. The unique key yields one row; no extra chronological index is needed for v1. An exact authority index resolves the independent witness target. Do not add region/provider/species indexes or revision ordering.

Distinguish available prerequisite, known receipt later than cutoff, absent/untrusted legacy witness, invalid identity and inaccessible storage. A late known receipt does not prove that no earlier event ever existed. No scientificallyEligible, fresh, preferredRevision, temporal support or score output is authorized.

Legacy rows remain untouched and AS_OF_AUTHORITY_UNKNOWN. No backfill, nullable legacy columns or receipts derived from created_at. Unknown future versions fail closed rather than overwrite/reinterpret accepted v1 records.

Co-retain exact evidence and required closure with witness; do not FK authority to captain snapshots or auth users. Ordinary deletion is forbidden. If separately authorized retention deletion occurs, delete the entire envelope atomically. No residual witness or tombstone can claim resolvable evidence; absence becomes unavailable proof. No retention duration is chosen. Externalizing large payloads later requires separately reviewed immutable pin/reference integrity, not an implicit extension of v1.

### Family admission and provenance

| Family | Readiness | Initial issuance |
|---|---|---|
| New normalized CURRENT | REFERENCE_READY: live exact v3 envelope exists | Enable only after the new issuer/storage/clock implementation is authorized and qualified; require exact processing/source-metadata closure. |
| SST | LIVE_REFERENCE_INTEGRATION_REQUIRED; existing v2 capture mechanism | Deny until live reference integration qualifies. |
| DIRECT chlorophyll | LIVE_REFERENCE_INTEGRATION_REQUIRED; existing v2 mechanism | Deny. |
| GAP_FILLED chlorophyll | LIVE_REFERENCE_INTEGRATION_REQUIRED; existing v2 mechanism | Deny. |
| Weather/marine quality and companion source dependencies | Existing v2 references, live integration still required | Deny until typed adapter and dependency closure qualify. |
| Derived results used by the 16 active consumers | A source receipt does not prove a later derived result existed | No transitive derived receipt or new convergence work. |
| Arbitrary legacy objects | EXACT_REFERENCE_MISSING | No retrofit or generic digest substitution. |

Generic infrastructure with closed family/version/representation admission is safe; partial family support is explicit, never a generic whole-snapshot availability pass. Thus SST/chlorophyll gaps do not block the selected storage architecture.

Current v3's full reference already binds pelora-source-normalization-v1 lineage. Retain the matching processing descriptor and required recorded-source metadata closure; do not copy normalization version into receipt semantics or upgrade RECORDED_NOT_REQUALIFIED provider status. Historical missing provenance remains missing. Existing exact capture serialization preserves signed zero; numeric payload must not be parsed and reserialized through JSONB.

Infrastructure keys contain no Gulf coordinate/product/species/provider policy. The initial current-only adapter is a bounded capability, not a regional schema. Larger/different evidence domains require typed bounded admission, not presumed scientific compatibility.

### Minimum migration and implementation phases

Logical migration requirements only: one private append-only table; required four-field record; exact wire payload/closure/authority support columns; consistent unique exact-evidence and exact-authority keys; issuer-controlled timestamp; no user FK; protected INSERT/SELECT-only identity and default-deny client access; atomic publication and exact resolver checks; empty initial authority state with no backfill. **No SQL is written.**

1. Authorize the selected placement, clock and writer contract; then separately authorize migration/adapter/issuer/resolver work and synthetic tests. Default disabled until deployment guarantees are qualified.
2. Following separately authorized deployment/access/clock/durability checks, connect only new current-v3 captures. Expose availability as prerequisite metadata; keep captain storage and scientific selection unchanged.
3. Admit SST/chlorophyll and other families only after live exact-reference/closure integration qualifies. Unknown families deny. Product temporal science remains separate.

Future tests must cover trusted completion clock, caller/provider spoof, direct ordinary DB/API write rejection, immutability, concurrent/idempotent retry, changed revisions, before/equal/after cutoff, legacy absence, bad reference/authority/version, missing closure, rollback, crashes/unknown acknowledgement, deletion integrity, signed zero, normalization lineage, unsupported families, no scientific eligibility output, no-service-role predecessor preservation, and bounded payload/clock failures.

### Verification and risk boundary

Replayed **25/25 bounded logical contract cases**, one script, zero failures/skips/cancellations, **zero operational outbound attempts**. Existing denial preload and independent monitor were used. These controls do not test real database concurrency, grants, durability or clock health; those are future implementation/deployment gates. No full regression was run because production is unchanged.

The design separates provider/publication time from receipt, forbids receipt-based freshness/eligibility, preserves observation identity across retries, prohibits historical backfill, isolates the trusted writer from clients and contains no regional/provider science. All identified risks have explicit design controls; those controls still need implementation verification.

**Next gate:** human authorization of the selected private receipt-envelope placement and separate restricted backend issuer/clock contract. No implementation, migration or deployment is authorized by this review result.

Final placement-review checks passed: HEAD/tag and all 1,977 tracked files unchanged, including 177 protected artifacts and 20 historical suites; 15,363 real dependency files, manifests/lockfiles, Git configuration and excluded Supabase pair unchanged. Prior report findings remain intact. JSON, temporary-test syntax, whitespace and literal references passed with zero actual missing dependencies. Tracked/staged diffs are empty; only the two reports and excluded Supabase pair remain untracked. No production/schema/Supabase changes, SQL, migrations, external access, environmental acquisition, staging, commit, tag, push or deployment.

## IMPLEMENTATION ATTEMPT — WRITER AUTHORITY GATE (current result)

**HISTORICAL_RECEIPT_WRITER_AUTHORITY_REVIEW_REQUIRED**

The human authorization for a local storage/issuer/resolver candidate is recognized. The approved private receipt-envelope design is retained. Implementation stops under this task's explicit section 5: if the repository cannot express a suitably least-privileged writer without a broader credential/security decision, STOP. This is a new concrete writer integration boundary, not a request to reapprove the logical receipt semantics.

### Demonstrated infrastructure gap

- backend/server.js: buildBackendSupabaseConfiguration accepts public publishable-key/captain-token access and explicitly rejects SUPABASE_SERVICE_ROLE_KEY. retrieveOceanMemoryRows must preserve that restriction.
- backend/persistenceEnvironment.js and shared/persistenceEnvironment.mjs govern captain/project compatibility, not a restricted backend database identity.
- Root/backend manifests and lockfile contain no PostgreSQL driver or connection adapter. The Supabase JavaScript dependency is frontend-side. Production backend/shared and migrations contain no dedicated receipt principal, role membership or direct-PG connection contract.
- Existing migration grants address ordinary captain application access. The existing SECURITY DEFINER signup function is intentionally callable by signup clients, not a server-only trusted receipt issuer.
- The approved design requires a non-client-exposed private relation and a dedicated restricted non-owner writer. Neither the existing captain token nor an abstract createIfAbsent test port authenticates that writer.

No credentials, secret environment values, live database, Auth or service configuration were accessed. These findings concern checked-in infrastructure only. PostgreSQL can express the proposed least privilege; a missing driver alone is not the reason to stop. The unresolved part is the concrete connection/principal trust boundary, for which this task expressly requires review rather than an improvised fallback.

### Narrow decision required

Authorize a **separate backend-only direct PostgreSQL adapter**, with a selected locked driver, a dedicated non-owner/non-superuser/non-BYPASSRLS login and only the receipt INSERT/SELECT capability. Define its role membership so it cannot escalate to an owner or broader role. Specify separate secret injection/rotation, verified TLS/endpoint and connection/pooler behavior needed for exact role identity and durable atomic publication. Do not introduce a broad service-role key or change Ocean Memory's existing configuration.

This is a proposed next authorization, not configuration or credential provisioning performed here. No actual secret should be added to reports or supplied as evidence. Provisioning/deployment remains separately authorized work.

Rejected workarounds: broad service-role client; granting captain identities receipt authority; exposing the private schema; public SECURITY DEFINER witness construction; guessing new login/secret/TLS semantics; or labeling an injected fake storage port as an authenticated durable writer. None satisfies the approved trust model without the missing connection/security contract.

### Candidate status and verification

No migration candidate was written; migration path is **none** and static verdict is **NOT_CREATED_WRITER_AUTHORITY_GATE**. No production issuer, resolver, clock or authority constructor was implemented. No repository tests were changed. Approved fields, exact keys, indexes, append-only permissions, atomic envelope, idempotency and retention remain design requirements, not deployed or newly tested PostgreSQL enforcement.

Retained **25/25 synthetic contract controls passed**, one script, zero failures/skips/cancellations and **zero operational outbound network attempts**. They exercise logical cutoff/spoof/revision/retry/atomic-failure/provenance boundaries through the prior test-only model and existing exact capture modules. They do not establish a production writer or database enforcement. Source Normalization critical suites and the complete current-runtime regression were **not rerun after this early STOP**; predecessor byte preservation is reported separately and is not a fresh regression pass.

CURRENT-v3 remains the only proposed issuer family. No family is newly issued a witness in this task. SST, DIRECT and GAP_FILLED chlorophyll still require LIVE EXACT-REFERENCE INTEGRATION before admission. Legacy evidence remains AS_OF_AUTHORITY_UNKNOWN. Availability is not eligibility. Normalization, exact capture/provenance, signed zero, failure locality, diagnostics/admissibility and cache isolation are unchanged. No historical selection or scientific policy is modified; projection V3 and paused work remain untouched.

**Next gate:** approve the concrete restricted backend connection/principal/secret/TLS contract, then resume the already-authorized local migration and issuer/resolver candidate. No database/service access is needed to make that decision. No migration applied, no commit/tag/push/deployment.

Final writer-gate verification: HEAD/tag and all 1,977 tracked files unchanged; 177 protected artifacts, 20 historical suites, 15,363 real dependency files, manifests/lockfiles, Git configuration and excluded Supabase files unchanged. Prior findings preserved. JSON, temporary-test syntax, whitespace and literal-reference checks passed; zero actual missing dependencies or operational network attempts. Tracked/staged diffs are empty. Only the two reports were updated; the exact untracked set remains the reports plus supabase/.gitignore and supabase/config.toml. No production/migration hunk exists or remains unclassified. Deployed database qualification is explicitly not claimed.

## WRITER AUTHORITY & CONNECTION CONTRACT REVIEW — current result

**NEW_POSTGRES_DRIVER_DEPENDENCY_REQUIRED**

Separate deployment finding: **POSTGRES_TLS_ENDPOINT_REQUIREMENTS_NEED_DEPLOYMENT_CONFIGURATION**.

The dedicated non-owner PostgreSQL LOGIN architecture is now authorized for concrete review. The security/configuration design below is proposed; no dependency, role, policy SQL, secret, endpoint, production code or deployed authority is created. This review stops the implementation path as requested while completing the connection design. Earlier findings and approved receipt semantics remain intact.

### Existing access and driver decision

The backend is Node ESM using node:http and built-in fetch. Ocean Memory uses a Supabase HTTPS project origin, public publishable key and captain bearer token. Its configuration rejects SUPABASE_SERVICE_ROLE_KEY. The frontend alone declares @supabase/supabase-js; that client is not a dedicated database writer.

Root/backend/frontend manifests and both checked-in lockfiles contain no direct PostgreSQL driver or locked pg/pg-pool/pg-native/postgres/PostgreSQL client. Recursive package-manifest inspection of the present root/frontend node_modules found no such driver; backend/node_modules is absent. An installed transitive package would not constitute production authority anyway.

**No existing driver is ready.** A later dependency review can consider a direct Node PostgreSQL client such as pg (node-postgres), but no package/version is selected or qualified here. Pin a reviewed version and integrity-locked closure through the existing root manifest/lockfile ownership used by backend dependencies. Do not silently use a frontend transitive package or create a competing backend lockfile.

The chosen driver must demonstrate parameter binding, explicit verified TLS, bounded pooling/cancellation/close behavior and Node compatibility at its pinned version. There is no installed driver source against which TLS-option or connection-URL precedence can currently be verified. No registry/web/package acquisition occurred.

### Endpoint and secret configuration

Initial supported design: **direct PostgreSQL over verified TLS with a backend-owned pool**, targeting the intended writable database. No PostgreSQL host, port, CA, external pooler mode or trust configuration is established by checked-in files. Do not infer a database endpoint from the Supabase HTTPS URL or invent a hostname.

Session/transaction pooler modes remain unadmitted until their principal mapping, TLS peer, transaction pinning, session settings and prepared-statement behavior are qualified. Parameterized unnamed statements avoid unnecessary persistent prepared-statement state. Any explicit transaction must use one checked-out client through completion.

Proposed minimum inputs, not added to any environment file:

| Input | Meaning |
|---|---|
| PELORA_RECEIPT_WRITER_ENABLED | Server-only explicit opt-in; default false. |
| PELORA_RECEIPT_POSTGRES_URL | One server-only secret containing the approved endpoint/database/dedicated principal credential. |
| PELORA_RECEIPT_POSTGRES_CA_FILE | Optional deployment-mounted CA path, only where approved endpoint trust requires it. |

One URL is sufficient; no current convention requires split credential fields. Use deployment secret injection into backend environment, not a new dotenv loader, committed secret, browser/VITE setting, API payload, receipt or log. No actual value is chosen/read. Parse a strict explicit connection target; reject arbitrary query/options, SSL overrides, socket/multiple-host tricks and ambient PG* fallback. Construct the final driver TLS options from reviewed fields, rather than allowing raw URL settings to override them.

### Startup and TLS

Select **bounded subsystem unavailability**. Disabled means no pool or database contact. Enabled with missing/malformed/incomplete config, invalid TLS, authentication failure or insufficient privileges means receipt authority unavailable. The rest of Pelora may start, consistent with existing optional Ocean Memory behavior. Live-ocean health must not falsely imply receipt readiness. No fallback to anon, captain token, service role, ordinary Supabase client or an in-memory witness.

Require encrypted transport, certificate-chain validation and hostname verification against the approved endpoint. Configure rejectUnauthorized=true or the driver's equivalent explicitly; retain standard hostname verification. A permissive SSL mode or encryption alone is insufficient. No always-success identity callback, plaintext fallback or disabled certificate validation. Conflicting insecure global TLS settings must fail receipt configuration, not mutate global behavior.

Use approved Node trust or a deployment-supplied CA bundle where required; no certificate is embedded now. Actual endpoint/CA/hostname requirements remain a deployment input. Later tests must reject wrong host, untrusted/expired certificate, plaintext endpoint and URL options that override verification. No TLS handshake or database connection was attempted.

### Principal, privileges and PUBLIC leakage

Required future runtime role properties: LOGIN, NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOREPLICATION, NOBYPASSRLS and NOINHERIT. It must own no database, schema, table, function or application object. Prefer direct receipt grants and no membership in other application/admin roles. NOINHERIT alone does not prevent SET ROLE or remove PUBLIC privileges; escalation-capable memberships are forbidden.

Minimum application-object privileges:

- CONNECT to the intended database as required; no database CREATE or TEMP requirement.
- USAGE on the private receipt schema; no schema CREATE.
- INSERT and SELECT on the receipt envelope only.
- No UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, grant option, ownership or DDL authority.
- No sequence privileges: the approved full exact-reference composite key needs no generated sequence.
- No unrelated privileged application-function execution or captain-table access.

**Effective PUBLIC/default privileges require deployment verification.** Checked-in hardening primarily addresses anon/authenticated roles; it does not establish database PUBLIC TEMP/CONNECT, schema ACLs or all default privileges for a new login. A direct REVOKE on the new role or NOINHERIT cannot negate a grant applying to everyone through PUBLIC. The signup SECURITY DEFINER function does revoke PUBLIC EXECUTE, but grants it to anon/authenticated, which the receipt login must not inherit.

Require an authorized admin to verify effective permissions, memberships and default privileges before enablement. Unexpected TEMP/CREATE or unrelated application access is a blocking mismatch. Do not silently revoke PUBLIC rights globally and disrupt existing applications; any necessary broader ACL correction needs separate review. Ordinary catalog/builtin access needed for PostgreSQL operation is distinct from application/captain data authority.

### RLS, immutability and clock

Enable RLS on the new private relation. Ordinary PUBLIC/anon/authenticated roles have no grants or policies. Only the dedicated issuer/resolver receives targeted INSERT WITH CHECK and SELECT USING policies, together with the narrow privileges. Required envelope/version/shape constraints complement trusted application validation; a caller flag is not trust.

FORCE ROW LEVEL SECURITY is not required for this selected non-owner/NOBYPASSRLS runtime model. It is not selected as a minimum and cannot replace ownership separation or restrain a superuser. The migration/admin owner must never be the runtime credential. Database grants plus RLS and unique/shape constraints are sufficient for ordinary append-only enforcement; no mutation trigger or privileged writer function is required. Administrative retention remains separate whole-envelope deletion, not ordinary runtime authority.

Keep the approved backend UTC clock after successful exact capture/closure validation. Public request/configuration inputs cannot supply authoritative receivedAt. A clock seam belongs only to explicit internal tests. The database should reject null, invalid/infinite or representation-mismatched timestamps and require agreement with the authority target. Do not substitute database now(), infer receipt from created_at, or introduce an arbitrary server/database skew window. Trusted issuer compromise is not solved by a self-consistent hash and must not be disguised as caller-spoof resistance.

### Authority reference and credential rotation

Keep pelora-historical-availability-reference-v1 and the reviewed pelora-historical-receipt-witness-v1 target proposal. The target binds exact evidenceReference, receivedAt and the stable issuer-policy reference identifying mechanism/version, completion event and clock/storage enforcement policy. Retain that closure.

These identifiers and hashes identify/bind the witness; they do not authenticate it alone. The resolver must independently retrieve the protected stored record and recognize its issuer policy. No password, URL, database host, credential generation, captain, user, provider or species identity belongs in authorityReference.

Credential rotation replaces the server-injected secret and drains/replaces the bounded pool or restarts the process. It must not alter evidenceReference, receivedAt, contractVersion or authorityReference solely because a password changed. Bound old/new pool overlap within the global connection budget; never fall back to a retired or broad credential. No historical rewrite.

### Queries, transactions and retry

All evidence/reference, assessment time, version, authority and payload values must be bound parameters. Only fixed reviewed schema/table/query shapes may appear in source. No arbitrary SQL or caller-controlled identifiers. No SQL is written by this review.

The selected co-retained envelope is one atomic conditional insert; no update-on-conflict. Return success only after durable commit acknowledgement and accepted-envelope validation. Actual database durability settings must be qualified; do not relax commit durability. Unknown commit outcome is neither success nor proof of failure.

On a unique conflict, perform a separate exact read with a fresh committed snapshot after the winner becomes visible, validate bytes/closure and retain its receivedAt. Do not assume a same-statement snapshot/CTE necessarily sees a concurrent winner. A bounded unresolved race remains unavailable/unknown, never an overwrite. If explicit transactions are used, pin one connection until commit/rollback; do not issue transaction steps through independent pool calls.

No revision ordering or scientific selection is introduced. Resolver access stays an internal server function, never generic frontend SQL/table access. A lagging replica or alternate provider is not a fallback authority.

### Bounded pool and error handling

Proposed initial bounds for human approval: two clients per process; four-second connection/acquisition and statement bounds; one-second lock wait; five-second client operation, idle-transaction and shutdown bounds; thirty-second idle connection cleanup; at most sixteen pending operations. These are conservative bounded-operation proposals, not measured database SLA or approved deployment tuning. Existing four-second upstream timeout is local precedent only.

Use one lazy dedicated pool per process. No per-observation connection or sharing with Ocean Memory. Release clients in finally, roll back known open transactions and destroy poisoned/uncertain connections according to the pinned driver's contract. A client timeout does not prove cancellation or rollback. Bound shutdown on server close/SIGTERM/SIGINT/test teardown; module import itself must not open a pool or install lifecycle side effects. Set a finite deployment-wide role connection budget from replica count and rotation overlap rather than guessing one global number. No tuning-environment proliferation initially.

Connection, TLS, authentication and permission failures disable receipt authority. Validation rejects without writing. Unique conflict resolves the exact winner. Timeout, restart, failed transaction or unknown database error cannot produce success without verified durable state; exact read/retry may resolve ambiguity. No automatic unbounded retries, fallback witness or scientific eligibility.

Log only fixed operation/category and latency; optional non-secret reference digests require privacy-safe correlation. Never log raw driver error/message/cause/stack, connection fields, environment, SQL parameters, exact evidence or private coordinates. Existing /api/ocean handlers can echo error.message: the receipt adapter must sanitize before any exception reaches that boundary. No telemetry dependency is needed.

### Testing, ownership and next sequence

No connection test can qualify an absent driver/endpoint. This turn performed static dependency, lifecycle, ACL and reference review; **zero executable test cases**, no local database and no full regression. Repeating the prior synthetic receipt model would not prove TLS or login authority.

Future unit tests cover strict config, disabled startup, secret redaction, parameterization, cancellation/unknown outcomes, retry and shutdown. No checked-in ephemeral PostgreSQL harness was found; separately authorize one for actual permission/RLS/PUBLIC leakage, concurrency, rollback, local TLS and deletion-integrity tests. Fakes remain model evidence only. A later separately authorized deployment check verifies the real endpoint, role, TLS, clock and durability.

Migration/admin authority provisions objects and role grants. Runtime receives none of that ownership or schema-creation capability. Neither authority was exercised here.

Smallest sequence: approve/select/pin driver and lock closure; authorize unapplied private structure/role/policy migration and dedicated config contract; implement server-only verified-TLS pool; implement parameterized issuer/resolver adapter; admit only new current-v3; run authorized ephemeral permission/atomicity/TLS tests; run complete zero-network current-runtime regression with projection V3 excluded; separately authorize migration apply/provisioning/deployment verification before enablement.

Ocean Memory retains its public-key/captain-token path and service-role prohibition. No receipt credential, pool or expanded privilege is shared with it. Receipt storage remains availability-only; SST/chlorophyll admission, product temporal questions, historical selection and paused science remain unchanged.

**Next gate:** approve a specific driver/version and the proposed server-only connection contract. Supply and qualify endpoint TLS and effective deployment privileges before enabling issuance. This is not yet a READY verdict for an executable writer.

Final connection-review verification passed: HEAD/predecessor tag and all 1,977 tracked files unchanged, including 177 protected artifacts and 20 historical suites. All 15,363 real dependency files, manifests/lockfiles, Git configuration and excluded Supabase files are unchanged. Prior report findings remain intact. JSON, temporary verification-script syntax, whitespace and literal references passed; instrumented static verification recorded zero operational network attempts. No runtime tests/full regression were run. Tracked/staged diffs are empty; only the two reports and excluded Supabase pair remain untracked. No role/policy SQL, role creation, dependency, secret, production edit, external access, environmental acquisition, staging, commit, tag, push or deployment.


## PINNED DRIVER / OFFLINE ACQUISITION GATE

**Current verdict: POSTGRES_DRIVER_PACKAGE_ACQUISITION_AUTHORIZATION_REQUIRED.** Separate enablement gate: **POSTGRES_TLS_ENDPOINT_REQUIREMENTS_NEED_DEPLOYMENT_CONFIGURATION**. Earlier STOP/design findings above remain historical evidence; the latest human instruction authorizes exactly pg@8.23.0 and the disabled connection contract, but not network acquisition.

Branch and starting/final HEAD remain codex/pelora-remote-setup at 5f8a084fb355df8ff654c3c6eb3034b60dbd15f9. The verified local npm cache was inspected read-only with the retained network denial and attempt monitor. Its 246 indexed entries contain no pg metadata or tarball entry (nor pg-pool/pg-connection-string/pg-native/node-postgres entries). No locally verified pg@8.23.0 package is available. Unindexed bytes cannot establish an authorized package without the required integrity metadata.

Required acquisition: version metadata for **pg@8.23.0**, its authoritative dist.tarball and dist.integrity, and the required exact transitive package closure, all SRI-verified before use. No tarball URL, integrity or transitive version is guessed. Installed pg version/integrity are unavailable. Manifest, lockfile and transitive dependency delta: **none**. No npm acquisition/install was attempted.

Implementation stops before connection module, Pool, SQL/migration, issuer, resolver or tests. The newly approved logical authority is **pelora-receipt-writer-v1**; receipt semantics remain **pelora-historical-availability-reference-v1**. These are approved future requirements, not implemented runtime behavior. Disabled-by-default, explicit verified TLS, SSL-parameter rejection, optional local CA, sanitized errors, no fallback, parameterization, trusted backend clock, atomic publication and immutable retry winner still require implementation and tests after acquisition. Generic current-v3 admission remains conditional on exact provenance; SST/chlorophyll remain denied. Availability is not scientific eligibility.

Deployment remains separately blocked on endpoint/certificate trust, dedicated principal and effective PUBLIC/membership/default privileges, real TLS, PostgreSQL compatibility and durable enforcement. No receipt credential or service-role fallback was introduced. No endpoint was contacted.

Verification: zero focused/driver/runtime cases executed; full regression not run because no production/dependency/test changes occurred. Instrumented cache inspection recorded zero operational network attempts. JSON, temporary-script syntax, whitespace and existing report source-path checks passed. All 1,977 tracked files, 177 protected artifacts, 20 historical suites, 15,363 dependency files, manifests/lockfiles, Git configuration and both excluded Supabase files remain unchanged. Source-normalization checkpoint unchanged. Tracked/staged diffs empty; only these two reports and the excluded Supabase pair remain untracked.

Receipts: C:\Users\User\AppData\Local\Temp\pelora-receipt-driver-offline-5016ed28b6c44b819e6fce72b025b4f9. Initial preload invocation rejected a Windows path before running; the corrected file-URL invocation completed with zero attempts. This was a tooling invocation correction, not a package or runtime failure.

**Next gate:** explicitly authorize required npm package acquisition, or provide a verified offline cache. No production, test, migration, dependency or secret was added. No database/Supabase/Auth/provider access, environmental acquisition, staging, commit, tag, push or deployment.


## AUTHORIZED PACKAGE ACQUISITION / DISABLED WRITER CANDIDATE — STOP

**Current verdict: HISTORICAL_RECEIPT_WRITER_REQUIRES_CORRECTION.** Separate deployment gate remains POSTGRES_TLS_ENDPOINT_REQUIREMENTS_NEED_DEPLOYMENT_CONFIGURATION. All previous findings remain history.

Final delta review detected unrelated lockfile churn: top-level name changed from SmartCharts-Offshore-Intelligence to resolution because npm ran in the temporary resolution directory. Candidate manifest/lockfile CRLF also produces 422 git diff --check findings against LF committed blobs. The initial acceptance assertion checked all existing package records but omitted top-level metadata and the full Git byte diff. Candidate manifests and implementation were already copied/created before this was detected. Work stopped; no automatic repair or qualification claim.

### AUTHORIZED ACQUISITION NETWORK ACTIVITY

Official https://registry.npmjs.org/pg/8.23.0 returned HTTP 200 for pg@8.23.0. Tarball: https://registry.npmjs.org/pg/-/pg-8.23.0.tgz. SRI: sha512-Ip2EQCngowJLGOfCwkFhPXU7/ljlhn6Rxlmy4XYfL2Y+vyRM59+8uR2xqRWKdYmbXmxCFOAmKxBuSUCdF34qLg==. All 14 acquired tarballs were verified against package-manager SRI. Full resolved versions/integrities are retained in the JSON section. Existing 28 package records remain deep-equal; no unrelated package versions changed or packages disappeared. The new closure is:

- pg@8.23.0
- pg-cloudflare@1.4.0 (optional)
- pg-connection-string@2.14.0
- pg-int8@1.0.1
- pg-pool@3.14.0
- pg-protocol@1.16.0
- pg-types@2.2.0
- pgpass@1.0.5
- postgres-array@2.0.0
- postgres-bytea@1.0.1
- postgres-date@1.0.7
- postgres-interval@1.2.0
- split2@4.2.0
- xtend@4.0.2

Only successful external acquisition host: registry.npmjs.org. Exact registry paths are in the JSON/receipt. An initial inherited offline/proxy configuration caused ENOTCACHED and refused connections to the local refusal proxy 127.0.0.1:9; the acquisition process then cleared those transport settings. The registry guard blocked pg-native optional-peer metadata before transmission; npm --legacy-peer-deps suppressed native peer resolution. pg-int8 was initially denied by the allowlist, then admitted after pg-types metadata established the required dependency. No pg-native bytes were acquired/installed/loaded. pg-cloudflare is the declared optional dependency, not a change to runtime architecture.

### POST-ACQUISITION ZERO-NETWORK VERIFICATION

Network authorization ended after metadata/tarball acquisition. Using retained denial and attempt-monitor preloads, offline npm ci materialized 42 packages from SRI-addressed cached bytes. 138 newly installed package files match that materialization. No post-acquisition operational network attempts were recorded. No actual PostgreSQL Pool socket was opened.

Candidate files: package.json; package-lock.json; backend/historicalReceiptConnection.mjs; backend/historicalReceiptRuntime.mjs; backend/tests/historicalReceiptWriter.test.mjs; supabase/migrations/20260930_historical_receipt_envelope_v1.sql; and these existing two reports.

Connection candidate: server-only lazy factory, disabled by default, no disabled secret reads/Pool/driver load. Enabled URL requires credentials/database/DNS hostname and rejects all query options. Ambient PG settings/native forcing rejected. Explicit rejectUnauthorized:true, servername and ordinary postgres SSL negotiation; optional server-local CA; no connectionString TLS override, credential fallback or logged raw errors. Pool max 2, connect 4s, idle 30s, statement 4s, query 5s, lock 1s, idle transaction 5s; at most 16 pending operations and 5s close bound. These are conservative candidate bounds, not deployment SLAs. Fixed insert/read SQL uses parameter arrays. No real endpoint verification.

Receipt candidate: internal server module, not wired to live routes/startup or scientific consumers. Current-v3 live-shaped exact captures only; validate capture/reference, exact normalization lineage and recorded source metadata closure before trusted backend UTC sample. Logical authority identifier pelora-receipt-writer-v1 identifies issuer policy; the four-field record retains the previously reviewed exact authority-event reference, binding that policy/evidence/time. No identity is derived from credentials. Existing exact capture bytes/provenance are reused; no historical upgrade. SST/direct/gap chlorophyll and unresolved extra dependencies rejected. Complete, partial, signed-zero and unavailable diagnostic captures remain exact. Availability never grants eligibility.

Atomicity candidate: one conditional INSERT for entire envelope; duplicate uses a separate exact read and preserves accepted timestamp. Invalid/missing/corrupt/unconfirmed authority remains unknown. No receipt success before a validated accepted row. Model ports are not proof of durable storage. Resolver compares receivedAt <= assessmentAt only, with no scientific selection.

Migration candidate is UNAPPLIED and not native-PostgreSQL-qualified. Private pelora_receipts.receipt_envelopes, exact-reference primary key, unique authority target, co-retained envelope text and projection checks. Private schema/table revokes for PUBLIC/anon/authenticated/service_role plus ENABLE/FORCE RLS. No guessed runtime role, grants or policies: default deny until separately authorized targeted bootstrap. No ordinary mutation/delete; co-retention means no surviving witness without its required bytes. Full capture/digest validation stays in the issuer/resolver. No application/captain tables or excluded Supabase files modified.

Focused tests: **1 script, 60 tests passed, 0 failures/skips/cancellations** under denial/monitor. Tests exercise disabled operation, pg version/native absence, explicit Pool TLS config without sockets, URL/CA/error/no-fallback controls, parameterization/queue bounds, clock spoofing, family admission, exact signed-zero/provenance, cutoff, retry/concurrency model, failure/legacy behavior and limited SQL assertions. Mock failures are not real TLS/authentication tests. Full current-runtime regression and predecessor critical/logical replay were NOT RUN because the lockfile STOP was discovered. The new .test.mjs suite is an explicit adjunct, not an edit to the preserved 88-script normalization profile.

Static: new module/test syntax and manifest/report JSON pass; 14 native/literal imports resolve, zero missing dependencies. git diff --check FAILS with 422 manifest/lockfile CRLF findings. No suppression/repair. Protected 177 artifacts, 20 historical suites, all four normalization production files, 15,363 preexisting dependency files and excluded Supabase pair remain byte-identical. 1,975/1,977 tracked files unchanged; only two root manifests tracked-modified. Staged diff empty. HEAD remains 5f8a084fb355df8ff654c3c6eb3034b60dbd15f9.

Production/migration hunks are classified in JSON as receipt security/storage/issuer/resolver/clock/exact-reference/admission/atomicity/idempotency/immutability. Existing normalization/capture/science/selection/frontend/Auth/Ocean Memory code is untouched. Projection V3 and paused work remain untouched. No deployed enforcement or ready-for-review verdict is claimed.

**Next gate:** authorize narrow lockfile-name and manifest/lockfile line-ending correction, then complete zero-network regression and adversarial review using the acquired verified cache. Deployment additionally requires actual endpoint/CA/TLS, dedicated role/effective PUBLIC/default/membership privileges, PostgreSQL compatibility and durability verification. No database/Supabase/Auth/provider access, environmental acquisition, migration apply, staging, commit, tag, push or deployment.

Receipts: C:\Users\User\AppData\Local\Temp\pelora-pg-authorized-acquisition-e417df2e5dcb4db98dbd675407129f8e.


## PACKAGE REPAIR / OFFLINE QUALIFICATION — CURRENT RESULT

**HISTORICAL_RECEIPT_WRITER_V1_READY_FOR_ADVERSARIAL_REVIEW** — offline, disabled candidate only. **POSTGRES_TLS_ENDPOINT_REQUIREMENTS_NEED_DEPLOYMENT_CONFIGURATION** remains open. Earlier STOP findings are retained as history, not the current result.

HEAD remains 5f8a084fb355df8ff654c3c6eb3034b60dbd15f9. Committed HEAD package.json has no name/version/packageManager field; lockfileVersion is 3 and its name is SmartCharts-Offshore-Intelligence. The temporary resolution name was replaced with that exact committed value. Both committed package files use LF and a final newline; final candidate files now match those conventions. No .gitattributes or Git configuration change.

Only semantic dependency delta: exact pg:8.23.0 in root manifest/root lock declaration and 14 new pg-closure package records. All 28 preexisting package records, integrity values and resolved URLs are unchanged. Zero removed or unrelated changed records. All 14 previously acquired tarballs were reverified against the final lockfile; all 42 package tarballs were verified for fresh isolated offline materialization. No npm registry access/reacquisition. pg-native remains absent/unloaded. Optional pg-cloudflare@1.4.0 remains accurately recorded.

Package SHA-256 ledger (HEAD / pre-repair / final):

- package.json: 97d7f08b348389ee45567f6ac2e88f71d2909909b2b68ee29b1751bda28eee75 / 5b368f9590928c7e1c41107cdac2f83c019f17ce0870e57c60d1b3f2ed8e6bec / e8ee1b4f019a5f0cf37e8d7d98f6be3961b82a0ab23e8b9a50b3879e4982d410
- package-lock.json: b00cf38f559435efc580b426937dde1ac67f1c858b642f251e4e154db6814cf7 / 632a4bb35ce9bf370673d5d42361fdcd57e33f0584ceb1d8dc2bd73af143aa76 / 27cffdd61f2d97014ded0ce7c914794dcf6c16cde6882cd913cc9385ad3ef463

Receipt connection/runtime, focused test and migration bytes were not edited. Their exact pre/post repair hashes are in JSON and the retained implementation ledger. The prior STOP receipt did not include a separate hash ledger for these four untracked files; continuity is supported by the preceding code/report review and replay, while exact byte preservation is asserted for this repair interval. No stronger historical hash proof is invented.

### Offline test accounting

- Receipt writer: 1/1 script, 60/60 cases.
- Historical availability reference: 1/1 script, 25/25 cases.
- Source-normalization/capture/locality/governance critical replay: 7/7 scripts, 65/65 cases.
- Critical total: 9/9 scripts, 150/150 cases; no failures/skips/cancellations.
- Final complete current-runtime profile: 88 intended, 88 started, 88 completed, 88 passed; 2,069 node:test cases and 50 explicit manual cases passed; zero failures/skips/cancellations.
- Profile composition: 79 node:test scripts, 2 manual-case scripts, 7 completion-only scripts. New receipt .test.mjs is an explicit adjunct; preserved profile membership is unchanged. Distinct combined scope: 89 scripts, 2,129 node:test cases, 50 manual cases. Critical duplicates are not added again.

An initial full run completed 88 scripts with 87 passes: noaaSstDisplayScale failed because the temporary checkout omitted supplemental retained derivative fixtures. The base input plan had been copied, but the later zero-network supplement includes summary/field/archive bytes too. All eight supplement inputs were verified against their retained SHA-256 and copied locally; no code/test repair or acquisition. A second COMPLETE profile run passed. Both run receipts are preserved; the initial failure is not mislabeled as a pass.

Windows private-index checkout verified 1,977 committed blobs, compared 1,423 tracked dependency files with offline npm materialization, and overlaid final candidate/retained bytes. Network-denial and independent attempt monitoring covered materialization, critical replay and both full runs: ZERO operational network attempts. No database/Supabase/Auth/provider access or environmental acquisition.

### Unchanged candidate boundaries

Disabled mode creates no Pool, loads no driver, reads no receipt credential and fabricates no authority. Enabled candidate uses explicit verified TLS (rejectUnauthorized:true and hostname), rejects URL options/ambient PG credentials, reads optional local CA only, and has no fallback. Pool max 2; connect/statement 4s; query/idle transaction/close 5s; lock 1s; idle cleanup 30s; pending limit 16. Errors return fixed sanitized categories. Queries are fixed parameterized operations. Actual endpoint TLS has not been tested.

Issuer remains internal server composition only, not enabled or wired to live routes/startup. Trusted backend UTC clock follows exact current-v3/reference/dependency validation. pelora-historical-availability-reference-v1 remains receipt semantics; pelora-receipt-writer-v1 is the stable issuer policy identifier bound through the existing exact authority-event reference. No credential identity substitution. Current-v3 admits only the qualified normalization/source closure; SST/direct/gap chlorophyll stay denied. Exact bytes preserve normalization lineage, signed zero, complete/partial/unavailable diagnostic states. No historical relabeling.

Atomic conditional envelope publication and duplicate-winner semantics passed injected storage-contract tests. These prove offline behavior, not deployed durability/concurrency. Success requires validated accepted envelope; retries retain its timestamp. Resolver returns availability-only receivedAt <= assessmentAt; legacy/missing/corrupt authority remains AS_OF_AUTHORITY_UNKNOWN. No scientific eligibility, revision selection, temporal support, freshness, species, opportunity, ranking or confidence authority is introduced.

Migration remains unapplied: private co-retained receipt envelope, full exact-reference primary key, authority uniqueness, bounded exact text/projection checks, client/PUBLIC/service-role revokes and ENABLE/FORCE RLS. It intentionally grants no access to a guessed principal. Targeted least-privilege role/bootstrap/policies and effective PUBLIC/default/membership privileges require separate deployment approval/verification. No live SQL/parser/database qualification claimed.

### Preservation, static checks and next gate

All 14 normalization checkpoint files, 177 protected artifacts, 20 historical suites and 15,363 preexisting dependency files are unchanged. Historical dispositions remain 38 behavior + 10 frozen-source assertions. Git configuration and excluded Supabase pair unchanged. Existing source normalization/capture-v3/science/selection/frontend/Auth code untouched; projection V3 quarantined, Ocean Physics/12B.6C/9E-D paused.

Syntax, JSON, manifest/lock consistency and 14 native/literal import references pass with zero missing dependencies. git diff --check exits 0: all previous 422 package whitespace findings resolved. New implementation files have no whitespace findings. Package tracked diff is +150/-2 total; four new implementation/test/migration files contain 472 lines. The two existing untracked reports are updated. Eight candidate paths classified, UNKNOWN=0; excluded Supabase pair remains outside candidate. Staged diff empty.

**Next gate:** final adversarial review of the offline candidate. No offline qualification blocker remains. Keep disabled pending separately authorized endpoint/CA/TLS, dedicated principal/effective privileges, actual PostgreSQL enforcement, bootstrap and migration/deployment qualification. No staging, commit, tag, push, deployment or migration apply.

Receipts: C:\Users\User\AppData\Local\Temp\pelora-receipt-offline-qualification-9142fdb7943f416da2e4f4c8f5300afd.

## FINAL ADVERSARIAL RUNTIME & MIGRATION REVIEW — STOP

Current verdict: **HISTORICAL_RECEIPT_WRITER_V1_REQUIRES_CORRECTION**. Deployment gate remains **POSTGRES_TLS_ENDPOINT_REQUIREMENTS_NEED_DEPLOYMENT_CONFIGURATION**. This section supersedes the preceding READY finding as the current review outcome; prior qualification receipts remain historical evidence.

### Demonstrated configuration blocker (P2)

At backend/historicalReceiptConnection.mjs:29–36, raw.trim() only rejects leading/trailing whitespace. new URL(raw) silently removes embedded LF, CR and TAB before the hostname checks run. The decoded control-character checks apply to user/password/database, not the original URL. Thus postgresql://synthetic:synthetic@exam<LF|CR|TAB>ple.invalid/receipts is admitted as host example.invalid. Each of these malformed configurations constructed one injected Pool and issued one parameterized read instead of failing closed.

The guarded offline diagnostic ran **5/5 cases: 2 passed, 3 failed, 0 skipped/cancelled**. Controls: an ordinary hostname was accepted with rejectUnauthorized=true; a percent-encoded LF was rejected before Pool construction. This demonstrates configuration admission after silent rewriting, not a real connection, TLS downgrade or credential disclosure. Zero operational network attempts were recorded.

**Review stopped immediately after reproducing this blocker. No repair.** No repository test was added or changed; the diagnostic and observations are retained outside the repository. Focused/historical/normalization/full-profile suites were not rerun after STOP. Earlier 60 receipt, 25 historical, 65 normalization cases and 88-script/2,069-node/50-manual profile results remain prior receipts, not a new adversarial PASS.

### Scope and preservation

All eight entering candidate hashes matched the final offline ledger. Candidate classifications remain: package.json manifest, package-lock.json lockfile, backend/historicalReceiptConnection.mjs connection implementation, backend/historicalReceiptRuntime.mjs issuer/resolver implementation, backend/tests/historicalReceiptWriter.test.mjs offline test, supabase/migrations/20260930_historical_receipt_envelope_v1.sql unapplied migration, and these two implementation reports. UNKNOWN=0. Only these reports changed during review. Both excluded Supabase files remain untouched.

All production blocks map to the authorized connection/TLS/pool/issuer/resolver/clock/exact-reference/availability-only/sanitization/parameterized-operation purposes; mapping does not imply correctness. The malformed-URL admission fails qualification. Migration static observations and statement classifications are recorded in finalAdversarialReview in the JSON. Migration remains NOT APPLIED and NOT DEPLOYMENT QUALIFIED; its final checkpoint-preservation gate was not completed after the runtime STOP. No deployed privilege, RLS, immutability, transaction or durability enforcement is claimed.

Rechecked unchanged: 14 normalization checkpoint files, 177 protected artifacts, 20 historical suites and excluded Supabase pair. Package/lockfile bytes match retained qualified hashes; no pg resolution change or package acquisition occurred. Source normalization/capture-v3/scientific policy remains unchanged; projection V3 was not executed; Ocean Physics/12B.6C/9E-D remain paused. HEAD remains 5f8a084fb355df8ff654c3c6eb3034b60dbd15f9; staged diff empty.

### Next gate

Human authorization for narrow rejection of raw URL control characters, followed by resumed adversarial qualification. Real endpoint/CA/TLS, PostgreSQL compatibility, dedicated principal/NOINHERIT/non-owner/non-superuser/NOBYPASSRLS, effective PUBLIC/default/membership/schema/table privileges, actual RLS/immutability/concurrency/durability and clock health remain deployment gates.

Receipts: C:\Users\User\AppData\Local\Temp\pelora-receipt-final-adversarial-755d3377b5b84196a2793289f9c0ec80. No network/database/Supabase/Auth/provider access, environmental acquisition, migration application, staging, commit, tag, push or deployment.

Final non-executing checks: connection/runtime/test syntax 3/3 PASS; package/lock/report JSON 3/3 PASS; git diff --check exit 0, no findings. Native/literal reference replay stopped; SQL was not executed.

## RAW URL CONTROL CORRECTION AND RESUMED ADVERSARIAL QUALIFICATION

Current verdict: **HISTORICAL_RECEIPT_WRITER_V1_READY_FOR_CHECKPOINT_REVIEW**. Separate enablement gate: **POSTGRES_TLS_ENDPOINT_REQUIREMENTS_NEED_DEPLOYMENT_CONFIGURATION**. This section supersedes the preceding configuration STOP as the current outcome; prior STOP history and receipts remain preserved.

### Narrow correction and configuration boundaries

Only historicalReceiptConnection.mjs production bytes changed: an original-string ASCII C0/DEL check now runs before new URL(), with one explanatory comment. It uses the same U+0000–U+001F/U+007F set already rejected in decoded components. No stripping, rewriting, normalization or Unicode policy expansion; LF line endings remain unchanged. The 103-line file is now 104 lines. Old SHA-256 de123023cc30f3c97d8f59826bfe28a5f45a9be5dfc0472238f2632daa6d749b; corrected SHA-256 038302aaefc39e053887e2094b927c6e6942373ee512b5c067a01f08077d4384. Runtime, SQL, package files and existing tests remain byte-identical to review entry.

LF/CR/TAB now fail in all eight tested positions: scheme, username, password, hostname, port, database, query and fragment. All 33 C0/DEL values across those 8 positions fail before driver/Pool/query/CA activity. The original 5-case reproduction passes. Percent-encoded %0A/%0D/%09 follow unchanged host/component/query rejection rules; valid encoded credentials still decode exactly once and reach explicit pg fields. Ordinary space/NBSP/U+2003/U+2028 characterization preserves existing leading/trailing rejection, hostname rejection and embedded password acceptance. No separate control-policy question remains.

Disabled mode remains inert, including malformed ambient URL/CA/native/PG settings: no secret reads, Pool, connection or witness. Secret-bearing failures return fixed sanitized categories. No candidate logger forwards raw errors; external deployment logging is not qualified here. TLS remains explicit rejectUnauthorized=true with DNS servername; URL options (case/encoding/duplicates included) cannot override it. No connectionString reparsing, plaintext/native/Supabase/credential fallback or direct TLS negotiation.

CA read failures/empty or nonmarker content fail closed. Relative server-local CA path behavior is preserved. A PEM marker is not certificate qualification: malformed PEM is left to verified TLS, and a modeled TLS error fails closed. No universal CA file-size bound or actual trust-path claim is made. Pool limits remain max 2, connection/statement 4s, query/idle-transaction/close 5s, lock 1s, idle 30s, pending 16. Parallel calls share one Pool; failure/close cannot silently recreate authority.

### Receipt and migration adversarial result

Composed issuer → connection → fixed parameterized storage operations passed offline tests. Exact current-v3 capture/reference and normalization/source closure are validated before sampling the backend UTC clock. Caller receipt/authority fields and unsupported families/versions fail before clock/storage. CURRENT-v3 remains admitted; SST/direct/gap-filled chlorophyll remain denied. Signed +/-0, changed same-time content and partial-current state retain their existing exact identities.

One atomic conditional INSERT stores the entire exact evidence/dependency/witness envelope. There is no separate evidence insert followed by witness insert to leave a partial row. Modeled prepublication failure creates no row; uncertain acknowledgement returns unknown, and retry through a fresh connection retrieves the accepted winner without replacing its time. Eight concurrent modeled attempts produce one row. These are storage-port/composition tests, not PostgreSQL concurrency/durability proof. Resolver before/equal/after checks pass; missing/corrupt/wrong authority remains unknown. No scientific selection, freshness, eligibility, persistence weight, score/confidence/rank or live scientific-consumer wiring is introduced. Legacy remains AS_OF_AUTHORITY_UNKNOWN without backfill.

Migration disposition: **UNAPPLIED_DEPLOYMENT_GATED_MIGRATION**, statically qualified for checkpoint review, **NOT APPLIED / NOT DEPLOYMENT QUALIFIED**. Schema/table/constraints/indexes and explicit PUBLIC/anon/authenticated/service_role revokes were reviewed; ENABLE/FORCE RLS supplies default deny with no guessed-principal grants/policies. Named roles must exist when later applied. The exact-reference primary key serves the one-witness resolver; co-retention prevents a separately orphaned closure. SQL performs bounded text/mechanical-projection checks, not scientific digest validation. Ordinary append-only authority still requires the reviewed INSERT/SELECT-only principal and targeted policies. Owners/admins/BYPASSRLS and effective PUBLIC/default/inherited privileges must be independently qualified. No SQL parser/server was run. Statement-by-statement classifications are retained in the JSON section.

### Offline execution and preservation

- Receipt focused: 60/60 cases; historical availability: 25/25; normalization/capture/locality/governance critical: 65/65 across 7 scripts.
- New adversarial suite: 61/61 cases. Combined focused replay: 10 scripts, 211 cases, zero failures/skips/cancellations.
- Complete governed current profile: 88 intended/started/completed/passed; 2,069 node:test cases; 50 explicit manual cases; 79 node:test scripts, 2 manual scripts, 7 completion-only scripts.
- Distinct profile plus receipt/adversarial adjuncts: 90 scripts, 2,190 node:test cases, 50 manual cases. Critical duplicates are not counted twice. Membership unchanged; projection V3 excluded.
- Qualified denial preload plus independent attempt monitor: zero operational network attempts in all test phases and driver inspection. No npm acquisition.

The prior isolated checkout was copied into a new receipt directory; exact final production/test bytes were overlaid and verified against the worktree. Retained fixtures and offline dependency materialization were reused. A temporary verifier initially compared regenerated node_modules/.package-lock.json with the preserved worktree metadata; the comparison was corrected to the established isolation scope without changing any candidate/dependency bytes. A shell wrapper also treated unset LASTEXITCODE as failure after all 9 critical subprocesses exited 0; recorded process exits were checked and the full profile then ran once. Neither was a runtime/test failure.

pg remains exactly 8.23.0; all 14 acquired tarballs reverified offline against lockfile SRI. All 28 prior package records are unchanged; root metadata has only the authorized direct dependency. Optional pg-cloudflare remains recorded but unloaded in the Node branch; pg-native is absent/unloaded. Preserved: 177 protected artifacts, 20 historical suites, 14 normalization checkpoint files, 15,363 existing dependency files, Git configuration and excluded Supabase pair. Historical 48 dispositions remain 38+10. No normalization/capture/science/selection/frontend/Auth change; Ocean Physics/12B.6C/9E-D paused.

Syntax, JSON, whitespace and 20 native/literal dependency references pass. Candidate scope is 9 files, UNKNOWN=0: existing 8 candidate paths plus backend/tests/historicalReceiptWriterAdversarial.test.mjs. This task changes only the raw-validation file, adds that test and updates these two reports. Tracked package diff remains +150/-2; staged empty. HEAD remains 5f8a084fb355df8ff654c3c6eb3034b60dbd15f9.

### Next gate and limits

Human checkpoint review of the exact offline candidate. Keep disabled and unapplied. Deployment still requires actual endpoint/database/port, CA trust and real TLS, PostgreSQL compatibility, dedicated principal/NOINHERIT/non-owner/non-superuser/NOBYPASSRLS/no escalation, effective PUBLIC/default/schema/table privileges, targeted RLS, actual immutability/concurrency/durability, clock health and separate bootstrap/application/enablement authorization. No database/Supabase/Auth/provider access, environmental acquisition, migration application, staging, commit, tag, push or deployment.

Receipts: C:\Users\User\AppData\Local\Temp\pelora-receipt-control-review-56632738df3b4223af3ab54054db7255.
