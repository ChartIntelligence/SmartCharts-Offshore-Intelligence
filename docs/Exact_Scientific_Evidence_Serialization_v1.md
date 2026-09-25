# Versioned Exact Scientific Evidence Serialization & Content Identity v1

Verdict: **EXACT_EVIDENCE_SERIALIZATION_QUALIFIED**, scoped to the new current-evidence capture v2 and the narrow SST signed-zero compatibility proof. Qualification-only module; no runtime integration, durable resolver or production source qualification.

Baseline: `71c6c039c8d733c496c0a0c687c33a3eb45678c4`, `checkpoint-signed-zero-scientific-preservation-v1`. Locked decision: PRESERVE_SIGNED_ZERO for future exact evidence. Tasks 12B.6C and 9E-D remain paused.

## Amendment-scope audit, before implementation

The previous executed numeric audit and current source inspection established these scopes. A contract is not versioned merely because it contains numbers.

| Boundary | Classification | Action in this task |
| --- | --- | --- |
| Current evidence capture v1, its digest and content-reference helper | MUST_VERSION_FOR_EXACT_EVIDENCE | Separate current capture v2 and exact reference protocol implemented; v1 unchanged |
| Weather/marine quality capture v1 | MUST_VERSION_FOR_EXACT_EVIDENCE | Deferred: it preserves normalized speed/heights but its serialization loses sign. No v2 created here |
| Marine companion capture v1 | MUST_VERSION_FOR_EXACT_EVIDENCE | Deferred: exact six-field replay requires a successor and explicitly compatible quality-reference binding. No v2 created here |
| Environmental sample v1 | HISTORICAL_CANONICAL_CONTRACT | Frame-based v1 unchanged; future exact temporal view must compose an exact typed reference plus sample address, not invent another numeric codec |
| Future temporal view of exact capture | MUST_VERSION_FOR_EXACT_EVIDENCE | No new view implemented; cannot relabel old frame/sample identity as exact |
| Frame/archive/scalar v1 | HISTORICAL_CANONICAL_CONTRACT | No modification, migration, sign recovery or new archive |
| Archive/scalar provenance references | REFERENCE_ONLY_COMPATIBLE | May coexist as contextual bindings; cannot supply a lost original sign |
| Publication V3 captured references | REFERENCE_ONLY_COMPATIBLE | Existing four-field reference binds contractVersion and exact digest/ID; controlled publication proof passes |
| Generic publication reference checker | REFERENCE_ONLY_COMPATIBLE | Syntax validator only, not a semantic codec or resolver; exact consumers must dispatch and verify v2 explicitly |
| Semantic projection v1/v2 | NO_CHANGE_REQUIRED | Existing exact -0/+0 comparison preserved |
| Parsers, spatial/marine formulas, assessment | NO_CHANGE_REQUIRED | Existing algorithms reused; no source normalization or science change |

No archive or V3 amendment is required for an independently retained exact capture. An exact source reconstructed solely from canonical archived bytes remains impossible where sign was lost. That is not the source path qualified here. The new capture can reference a historical archive while retaining its independently supplied normalized evidence; a reference is not proof that those original signed values can be recovered from that archive.

## Representation evaluation

| Candidate | ±0 / ordering | Safety and schema | Inspectability / complexity / scalability |
| --- | --- | --- | --- |
| A. Versioned JSON with literal numeric `-0` | Exact finite Number round trip; sorted keys, preserved arrays | Native JSON.parse, no reviver; closed source schema; canonical read-back validation rejects duplicate/noncanonical text | Selected. Human-readable, directly supported by current Node; one sign-aware numeric case, ordinary JSON escaping/finite formatting; linear output encoding after validation, key sorting per object |
| B. Closed tagged finite number | Can preserve sign, with exact tag vocabulary | Needs numeric-position tag validation and collision discipline; arbitrary objects must not gain authority | More schema and decoder complexity, larger payload. Not selected |
| C. Deterministic binary encoding | Can preserve finite IEEE bits and signed zero | Requires explicit byte order/schema, finite-only validation and reference/version binding | Less inspectable; wider tooling and validation scope. Not selected |
| D. Sidecar paths identifying negative zeros | Can mark signs while main JSON collapses them | Requires validating unique pointers, numeric targets, array positions and content coherence | Introduces two representations of one fact and more tampering cases. Rejected as less coherent than A |

Selection follows exact fidelity, closed schema, no object revival, deterministic bytes and narrow scope. It is not a patch to global JSON.stringify. No string is a numeric tag. `"-0"` remains a string and is rejected at numeric positions; literal `-0` is a JSON number and round-trips through native JSON.parse.

## Contracts and exact bytes

- Capture: `pelora-governed-current-evidence-capture-v2`
- Serialization: `pelora-exact-scientific-json-v1`
- Digest domain: `pelora-exact-scientific-content-sha256-v1`
- Reference protocol: `pelora-exact-current-evidence-reference-v1`

The serialization mechanism is private to this closed capture profile. There is no exported arbitrary-object exact encoder. The module reuses `captureCurrentEvidenceV1` only as the unchanged in-memory source-schema validator, then discards its generated historical hashes/ID. It does not upgrade an accepted v1 record, read v1 serialized evidence under v2 semantics, or restore sign lost before input arrives. Both source authority statuses remain descriptive rather than authenticity claims.

Allowed source content is exactly the existing current-capture families and their reviewed fields: SST, direct chlorophyll, gap-filled chlorophyll and currents. Numeric authority covers their normalized values, requested/resolved/provider coordinates, and the fixed reconstruction resolution where present. Source times remain existing strings/null. HTTP metadata, counters, new quality objects, bathymetry, wind/wave/swell payloads and other unrelated fields cannot enter this schema. Encoding tests for other current families establish numeric mechanics only, not their candidate reconstruction.

Canonical encoding rules:

1. Validate own data properties, source profile and finite/null numeric positions before encoding.
2. Recursively sort object keys using current JavaScript string-key ordering; preserve array order and permitted duplicates. Sample role uniqueness remains the existing schema's rule.
3. Encode `Object.is(value,-0)` as the unquoted token `-0`; encode other finite numbers with the current JavaScript JSON number representation. No decimal rounding or unit conversion is introduced.
4. Encode strings with JSON.stringify escaping; booleans/null retain normal JSON syntax. No user tag vocabulary, eval, toJSON dispatch or reviver exists.
5. Require exact canonical text when reading: whitespace variants, duplicate keys, alternate zero/exponent spellings, overflow/underflow aliases and unknown fields are rejected, not silently normalized.

The finite wire numeric language is the canonical output of JSON.stringify for a finite JavaScript Number, plus `-0`. This is a Node/JavaScript versioned convention, not a universal cross-language canonical-JSON claim. MIN_VALUE, MAX_VALUE, both safe-integer bounds, decimals, scientific-notation-parsed inputs, rounded values and computed negative zero are exercised. String spellings do not receive numerical authority.

## Digest, identity and reference binding

Every digest hashes UTF-8 bytes of the exact canonical envelope:

`{digestVersion, serializationVersion, captureVersion, purpose, content}`

The fields are sorted by the same exact encoder. Purposes are distinct:

- `scientific-content`: `{family,samples}`; authority claims/audit lineage remain outside this digest, following the existing separation.
- `capture-identity`: complete capture content including contract/serialization/digest versions, source authority, lineage and scientific digest. ID is `cec2-` plus this SHA-256 digest.
- `pelora-exact-current-evidence-reference-v1`: complete validated capture, including its ID. This supplies the reference SHA-256.

The existing captured-reference wire shape remains `{kind,referenceId,contractVersion,sha256}`. `contractVersion` must be the exact capture v2 version; its definition fixes the serialization/digest/reference protocol versions. No extra ungoverned wire field is added. `validateCurrentCaptureReferenceV2(reference,capture)` requires the declared v2 contract and recomputes the exact reference. The generic V3 reference checker accepts typed syntax; it never interprets numerical payloads. Historical capture validators/readers reject v2 records, and v2 rejects v1 records/references. Even ordinary finite values have distinct v1/v2 identities.

Validation rebuilds all exact digests and the capture ID and compares exact canonical content. A change -0→+0, +0→-0, finite value, nested coordinate, sample order, lineage, digest, ID or declared version cannot reuse the old identity. Self-consistent newly constructed evidence is not authenticated source truth; hashes are integrity bindings, not signatures or provider qualification.

## Closed input, privacy and immutability

Unknown fields/families, arbitrary tagged objects, extra tag fields, numeric strings, undefined, nonfinite numbers, BigInt/functions/symbols, accessors, inherited/custom-prototype values, sparse arrays, hidden properties, cycles and prototype-pollution keys fail closed. Getters/setters are not invoked.

Private-label rejection includes existing dedicated labels and dotted/hyphenated/underscored sequences, provenance/reference text, email and UUID strings (including UUID followed by underscore). No arbitrary private metadata is stripped or revived. Fixed source profiles continue to reject fabricated provenance fields.

The first oversized-reference attack exposed slow regex rejection in an initial prototype. V2 now bounds strings/keys before scanning: existing IDs are at most 200 characters, observedAt is at most 64 under the reused schema, and all other accepted profile/digest strings are fixed shorter values. This retains the reviewed source vocabulary. Defensive nesting is capped at 32 and exact capture text at 1 MiB. These are explicit qualification input-safety bounds, not production throughput/storage budgets inferred from timing. V1 is unchanged.

Construction, validation, replay and reference outputs are detached/deeply frozen. Capture/replay requires no Auth, captain context, network, wall clock or random identity. Null, required missing key, optional absent field and ±0 remain distinct; required missing keys are rejected, optional absence is preserved without defaults. No new age authority is introduced.

## Relationships to existing systems

Temporal sample v1 remains frame-bound. A future exact temporal view should identify the exact capture reference plus existing sample role/component address and independently governed time support. No duplicate numeric encoding or temporal identity is created here.

Historical Frame/archive/scalar behavior remains canonical. Exact capture bytes can exist independently of those systems and bind their references documentarily. Scalar/raster/display output cannot authenticate exact source sign. No new storage or resolver is established. An exact archive-derived source path would require separate future authority; it is not silently supplied by current archive v1.

The controlled V3 test binds exact ±0 capture references under one cycle: publicationId remains the same cycle key, but evidenceSet/content digest changes. Publication JSON round-trip/validation preserves the typed reference. Altering its contractVersion without recomputing the publication fails. This proves reference compatibility only, not operational resolution or scheduler integration.

Weather/marine quality and companion v1 remain unchanged and retain their documented sign-collapsing serialization. Their future exact versions are necessary before claiming all-family exact replay, but creating them automatically here would exceed the narrow SST proof. No whole-candidate equivalence or readiness-to-resume claim is made.

## Narrow 12B.6C compatibility proof

Path A: synthetic literal transport `-0` → actual SST parser → actual current SST spatial assembler → existing root SST scientific projection v2.

Path B: independently parsed normalized points → new current capture v2 → exact serialization → validation/digest/ID/reference → replay → the same unchanged spatial assembler → the same projection v2.

The test-only adapter extracts the exact existing private assembler/helper bodies, replacing only the point-acquisition port with frozen replayed evidence, as in prior diagnostics. No alternative formulas are implemented. Path A derived objects and source working arrays are removed before B assembly. Replay runs with fetch and Date.now prohibited.

Result: **EXACT_MATCH**. The original negative-zero Celsius sample remains negative zero. The same fixture through historical current capture v1 still replays positive zero and yields the single expected MISMATCH at `/sst/derived/spatialStructure/samples/0/temperatureCelsius`. Both behaviors coexist under explicit versions. No comparator was weakened.

This is one root SST signed-zero compatibility proof, not a resumption of full Task 12B.6C: no chlorophyll/current candidate reconstruction, full provenance/static binding, complete scenario matrix or species evaluation is claimed.

## Size and performance diagnostic

For the two-point synthetic SST fixture with two signed-zero values, the recorded focused run (100 iterations) measured:

| Operation | Historical v1 | Exact v2 |
| --- | ---: | ---: |
| Serialized bytes | 1,631 | 1,751 |
| Serialization, mean ms | 0.46732 | 0.98129 |
| Read + replay, mean ms | 1.18681 | 2.85309 |

Byte increase: 120 bytes, approximately 7.36%, primarily version metadata plus explicit minus signs. Timings include schema/integrity validation and vary by desktop load; no production budget follows. The test emits fresh measurements on each run; the machine-readable matrix records this named focused-run snapshot.

## Verification, next gate and limits

Focused suite: **160/160 passed**. All **49 backend/shared test scripts passed with network blocked**, including signed-zero qualification (40), reconstruction diagnostic (17), projection v2 (100), projection v1 (113), all three existing capture suites, Frame/archive/scalar, temporal primitives, publication V1/V2/V3, all prior Task 12, Opportunity/governance and Task 11E. Syntax passed for **88 modules**; JSON parsing passed for **20 files**. Whitespace and git diff --check passed; no staged or tracked changes. Tests pin unchanged Git source blobs for parsers, three captures, both projections, spatial/marine server, assessment, Frame/archive/scalar, temporal primitive and publication. Ignored logs/diff are under `.local/ocean-quarantine/task12b6h/`.

Adversarial review is complete for the scoped current-v2 mechanism. Resumption decision: **ADDITIONAL_EXACT_CAPTURE_VERSION_REQUIRED**. Next gate: separately qualify exact weather/marine and companion successor versions before complete candidate reconstruction; checkpoint only on explicit instruction. Weather/marine and companion exact successors remain separately scoped work before whole-candidate exact replay. Task 12B.6C is not resumed here.

`UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains separate. A zero already normalized from raw null, or a sign already lost in historical storage, is not reconstructed or scientifically approved by exact encoding.

Only the new qualification module, tests, fixture and two documentation artifacts are added. No runtime migration, source parser change, scientific formula/threshold change, assessment/species change, candidate/Opportunity identity change, historical rewrite, archive/scalar/temporal/publication amendment, provider qualification or freshness-policy change. Task 9E-D remains paused. No provider/database/Auth/Supabase access, environmental acquisition, commit/tag/push/deployment. Leave uncommitted for adversarial review.

## Final adversarial review

**PASS for the reviewed current-capture v2 mechanism.** No implementation defect was demonstrated; no codec correction was made during this review. The focused suite grew from 115 to 160 tests. Existing implementation-stage string-bound correction remains intact.

Duplicate keys were attacked at every object boundary in all four current families, including source/provenance, references and objects inside arrays, with null, positive/negative zero, object and string substitutions. Native JSON parsing occurs internally; canonical byte comparison rejects duplicate wire records before any accepted capture is returned. This is not duplicate-preserving parsing and no last-value-wins record is accepted. Noncanonical numeric spellings, malformed Unicode escapes, comments, whitespace, trailing commas, string/tag disguises and nonfinite values fail closed. Ordinary finite values, null and signed zero retain their existing closed-schema meanings.

Domain/purpose omissions, alternate protocol versions, namespace/case/length changes, scalar-like IDs, wrong digest purposes and reference substitution fail. Validation recomputes content identity. All four signed-zero current-component combinations replay exactly without changing stored heading or asserting physical heading at zero speed. The actual-parser SST producer/replay proof remains EXACT_MATCH after removing Path A derived/source working objects; historical v1 retains its expected signed-zero mismatch.

**Weather/marine quality: V2_REQUIRED_BEFORE_COMPLETE_RECONSTRUCTION. Marine companion: V2_REQUIRED_BEFORE_COMPLETE_RECONSTRUCTION.** Nine independent tests start from actual synthetic marine parser output, deliberately set one normalized consumed value to -0, serialize/replay both existing captures, and invoke the same assessor and locked projection. Each demonstrates a scientific-projection -0/+0 difference at the exact paths listed in the JSON matrix. Some upstream unit converters erase raw negative zero; these tests qualify the normalized boundary, not universal transport-sign preservation. The quality capture carries speed/heights; the companion carries gust/directions/periods. Neither successor was implemented. These are expected historical limitations, not newly repaired defects.

V3 continues to bind the exact versioned reference: sign-only source changes alter publication content digest; tampering with an existing publication version, digest or ID fails. V3 generic references are opaque and do not authenticate the referenced source. The exact reference validator must additionally verify the actual capture. Constructing a fresh publication around an opaque reference does not establish provider authenticity or durable resolution. No publication-binding amendment was demonstrated within this reference-only scope. Archive/scalar identities cannot recover a lost sign; temporal exact-reference composition remains future work.

Accessor/inherited/prototype/private-label attacks remain rejected without getter invocation across construction, validation, serialization, replay and reference verification. Deep unknown nesting and oversized wire are rejected under the existing 32-level/1 MiB bounds; reviewed source strings are limited to 200 characters before privacy scanning. These are qualification safety bounds, not a production memory/throughput guarantee. Outputs remain detached, immutable and independent of clock, randomness and provider requests. No string revival, historical reinterpretation or new scientific formulas were introduced.

The JSON matrix records fresh review-run timings. The earlier benchmark table is the named implementation-run snapshot, not a production budget. All qualification limits above remain in force. Tasks 12B.6C and 9E-D remain paused.
