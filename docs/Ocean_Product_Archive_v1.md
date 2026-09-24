# Immutable Ocean Product Archive Writer/Reader v1

Task 10F-D adds a provider-neutral Node module and synthetic tests only. There is no production storage implementation, filesystem archive, database, acquisition, service integration or consumer policy. Task 10B and the SST adapter remain unchanged. Task 9E-D remains paused.

## Authority and APIs

`shared/oceanProductArchive.mjs` exports:

- `OCEAN_PRODUCT_ARCHIVE_CONTRACT`: `pelora-ocean-product-archive-v1`.
- `OCEAN_PRODUCT_ARCHIVE_WRITER`: `pelora-ocean-product-archive-writer-v1`.
- `oceanArchiveIdentityV1(frame)`: validates through Task 10B and returns deterministic identities.
- `planOceanArchiveWriteV1(frame, intent)`: immutable, detached `VALIDATED_NOT_ARCHIVED` plan; no I/O.
- `writeOceanArchiveV1(port, frame, intent)`: asynchronous conditional create with explicit acknowledgement checking.
- `readOceanArchiveV1(port, {frameId, archiveId})`: exact read; exactly one lookup identifier is non-null.

Only the supplied port performs I/O. This module imports Node crypto and the locked frame contract; it has no provider SDK, network, database or filesystem dependency. No current runtime imports it.

Structural validity does not establish source qualification, scientific truth, freshness, map permission, historical association, learning eligibility or opportunity eligibility. The archive accepts descriptive Task 10B evidence including explicit unknowns. It cannot qualify a provider or bypass the SST adapter's qualification gate. NOAA Geo-Polar remains metadata-qualification incomplete; OSTIA NRT and REP remain provider-clarification required. None is integrated here.

## Identity layers and canonicalization

| Identity | Meaning |
| --- | --- |
| `frameId` | Caller-declared Task 10B identity; never generated from time, a URL or randomness |
| `contentDigest` | SHA-256 of canonical normalized frame with only top-level `frameId` omitted |
| `frameDigest` | SHA-256 of the exact stored UTF-8 canonical full-frame JSON, including `frameId` |
| `archiveId` | `opf-` plus SHA-256 of exact case-sensitive `frameId`; stable conditional-create key across this archive namespace |
| `receiptDigest` | SHA-256 of canonical receipt excluding this digest field |
| `rawEvidence[].sha256` | Caller-supplied checksum of external raw bytes; distinct from frame bytes and not verified without those bytes |
| `sourceRevision` | Optional explicit provider-revision reference, supplied by caller; never inferred from an acquisition date |
| `storageReference` | Bounded opaque locator reference resolved by the future storage adapter; not scientific identity |
| `writeId` | Caller-supplied original accepted write identity; not a per-retry replacement identity |

Canonicalization recursively sorts object keys and preserves every array's order. Numbers use JavaScript JSON serialization (including its treatment of negative zero); UTF-8 bytes are the hash input. This is a versioned JavaScript canonicalization, not a claim of universal cross-language canonical JSON. Task 10B supplies normalized timestamp semantics. Malformed/non-JSON values, sparse arrays, cycles, accessors and hidden/symbol properties are rejected before normalization; scientific schema validation is delegated to Task 10B rather than reimplemented.

Content identity is deliberately conservative: values, masks, coordinates, product identity, temporal metadata, provenance and lineage all participate. Different acquisitions with different Task 10B timestamps are different content even if their values happen to coincide. Only frame identity itself is excluded to support distinct declared identities sharing content. Supplementary raw/revision receipt bindings are separately sealed by `receiptDigest` and checked during idempotency. Equal content digests do not establish independent corroboration or permit automatic merging.

Hashes check deterministic integrity, not geography, provider authenticity, authorization or secret-freedom. A party able to replace both evidence and all hashes can forge a self-consistent record. The storage adapter must enforce immutability and access control; consumers retain exact receipt/digest references separately. This is not a signature system.

## Write intent and receipt

Every write requires exactly these intent fields:

```text
writeId: opaque reference
archivedAt: explicit UTC timestamp supplied by caller
storageReference: opaque reference
sourceRevision: opaque reference or null
rawEvidence: [{reference, sha256, availability: retained | reference-only}]
```

An empty raw list means no raw retention claim. Reference IDs are 1–200 ASCII letters/digits/dot/underscore/hyphen, starting alphanumeric. They are not URLs or filesystem paths; signed URLs/credentials belong nowhere in the contract. A future acquisition manifest can map a safe reference to permitted source metadata outside this shared evidence object. Raw availability is an upstream assertion, not proof supplied by this writer.

The receipt contains contract/writer versions, all archive/frame/content identities and hashes, `status`, `digestAlgorithm`, payload representation version, UTF-8 byte length, the original write intent, and exact copies of Task 10B `product`, `temporal`, `provenance`, and `lineage`. Provenance includes source record/checksum references and adapter/normalizer ID/version/steps. Source revision may remain null. No timestamp is inferred. `archivedAt` is the caller's explicit archive event timestamp, not a measured provider publication time or proof of the physical storage commit instant.

Receipt validation reconstructs every field from the stored Task 10B frame and validated intent. Missing/unknown fields, unsupported versions, mismatched summaries, byte counts, hashes, noncanonical JSON and malformed intent fail. This is stricter than simply trusting a stored checksum string.

## Atomic storage port

Future storage implementations must implement these exact async methods:

```text
createIfAbsent(archiveId, {receipt, frameJson})
  -> {outcome: created | exists, durable: boolean, record: {receipt, frameJson}}

readExact(archiveId)
  -> {status: found, durable: boolean, record: {receipt, frameJson}}
  |  {status: not-found}
```

Transport/unavailability failures throw. A malformed response is an integrity failure. Error text is not passed through to callers.

Conditional create must be atomic across processes/machines, with one immutable key binding. It stores canonical frame bytes and receipt together, or makes them atomically readable through an equivalent immutable commit protocol. It returns the existing winner on races; no last-write-wins, mutable replacement, per-process-only mutex, partial manifest publication or automatic repair is allowed. Reads must identify the exact key; inaccessible storage must throw rather than pretend evidence does not exist. A future adapter must resolve deterministic keys independently of a retry's proposed locator.

`durable:true` is an explicit infrastructure acknowledgement that both receipt and bytes satisfy that adapter's reviewed durability/read-after-write contract. Merely accepting work, uploading a chunk or writing a volatile cache is insufficient. The core validates the response but cannot prove physical durability. The in-memory test double SIMULATES acknowledgement; it does not establish real persistence.

The internal record submitted to the port contains a prospective ARCHIVED receipt so it can be committed atomically with bytes. Possession of that candidate is not acknowledgement. Public planning returns VALIDATED_NOT_ARCHIVED. Public write results expose an ARCHIVED receipt only after validating an affirmative durable acknowledgement. A false acknowledgement returns ARCHIVE_WRITE_PENDING with no successful receipt. Durable status must never be inferred from a record's embedded status alone.

Equivalent retries preserve the winner's original writeId, archivedAt and storageReference; they do not rewrite a receipt to the retry's values. Same frameId with different frame bytes, sourceRevision or raw-evidence binding returns ARCHIVE_COLLISION. Additional raw/revision evidence therefore requires a new declared frame identity rather than mutating accepted history. Different frame IDs coexist even with shared contentDigest, reported in each receipt. No automatic deduplication of declared identities is performed.

An exception after a possible commit returns ARCHIVE_WRITE_FAILED with outcome unknown, never a success claim. A later explicitly requested exact read or same-evidence conditional retry can resolve it; this module does not retry automatically. No overwrite/delete method is provided. Eventual retention/deletion policy remains separately governed.

## Read and failure semantics

Exact read verifies canonical bytes, Task 10B schema, requested key/frame identity, full-frame/content/receipt digests, byte length and all receipt summaries. It returns a detached deeply frozen validated frame and receipt. It never selects a newer revision, reconstructs missing bytes, repairs corruption or fills a missing cell.

| State | Meaning |
| --- | --- |
| VALIDATED_NOT_ARCHIVED | Valid plan, no persistence attempted |
| ARCHIVE_WRITE_PENDING | Storage responded but durability is not established |
| ARCHIVED | Valid evidence plus affirmative storage durability acknowledgement |
| ARCHIVE_WRITE_FAILED | Write transport/port failure; completion may be unknown |
| ARCHIVE_COLLISION | Existing frame identity has different evidence/bindings; nothing overwritten |
| ARCHIVE_READ_UNAVAILABLE | Storage failed or cannot establish durable read |
| ARCHIVE_NOT_FOUND | Port explicitly reports exact key absent |
| ARCHIVE_INTEGRITY_FAILURE | Corrupt/malformed/misdirected record or invalid acknowledgement |

Malformed caller input throws TypeError before storage access. Valid partial-cell missingness is preserved. No frame is fabricated on failure.

## Evidence representation and coexistence

The stored `frameJson` is the entire normalized Task 10B frame with its payload, not a relational-row storage recommendation. This wire contract keeps synthetic tests small; future large-object transport/chunking and size limits need infrastructure review while preserving exact canonical identity and atomic commit. A future implementation can separate relational/index metadata from immutable payload/object storage without selecting a vendor now.

Scalar SST/chlorophyll/SSH, vector currents, static bathymetry, and aligned multivariable uncertainty/masks use the existing Task 10B contract. No grid, unit, datum, value or mask is transformed. Zero stays zero; explicit missing reasons stay attached. Provider uncertainty remains provider evidence and is not reduced to opportunity confidence. Static support retains null observation time. Lineage and parent/source ordering are preserved; parents need not be fetched, and lack of shared ancestry does not establish independence.

An original NRT frame, a corrected NRT frame and a later REP frame receive distinct declared frame identities. Their nominal day may overlap. They coexist; none overwrites the original publication's environmental input. Stream/representation semantics remain in reviewed product/dataset identity and normalization/acquisition provenance, not inferred by this writer. Display derivatives require separate frames with appropriate DERIVED semantics/lineage supplied upstream; archiving cannot promote them into native source truth.

Raw provider bytes may be retained separately where permitted, with checksum/reference in the receipt. Normalized replay does not necessarily enable re-running provider normalization without the raw bytes. Neither normalized replay nor raw retention implies reproduction of the provider's assimilation system.

## Future consumers and deferred decisions

A future four-hour publication manifest must pin archiveId, frameId, frameDigest, receiptDigest and interpretation/selection versions actually used. On replay it compares the returned receipt to those pinned values. Later corrections are separate inputs; a mutable latest-qualified index, if introduced, remains outside immutable evidence. No scheduler, publication table, index or endpoint is implemented.

Historical reconstruction uses exact archived evidence after a separate selection decision. This API implements no nearest time, matching tolerance, nearest cell, interpolation, freshness or Fishing Log association. Nightly learning can reference private Fishing Log source evidence plus a separate association assessment plus exact archive receipts. Neither changed learning conclusions nor association revisions modify the environmental archive.

Dedicated captain IDs, private notes, catch, preferences, opportunity ranks and credentials are absent; unknown fields fail. Generic existing Task 10B strings cannot be proven secret-free by schema. Acquisition/adapter governance must prohibit private report coordinates, signed URLs and secrets inside generic metadata. No payload or exception body is logged. Safe observability may later use bounded public IDs, hashes and failure categories; no telemetry is implemented.

Deferred: storage provider, transactional durability implementation, retention duration, deletion rules, capacity/size limits, credentials, schema, provider qualification, raw retention/use rights, freshness, scientific association, confidence/independence weighting and all runtime consumers. No beta provider is chosen and no Gulf/species rule exists.

## Verification

Synthetic tests cover identity/digests, canonicalization, ordered arrays, concurrent conditional creation, collisions, duplicate acknowledgements, exact read, corruption, missing/unavailable storage, write failures, static/vector/scalar/multivariable evidence, raw references, privacy boundaries and immutable detached output. Network-blocked Task 10B, SST adapter, numeric-integrity and complete backend/shared regressions must also pass. These tests validate the port protocol, not any real storage durability guarantee.
