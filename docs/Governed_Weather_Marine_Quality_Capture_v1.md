# Task 12B.6D — Governed weather/marine quality input capture

Baseline: `ad15d3604d32dbed475010d16f281ae37c86b5fd`.

**PASS for the normalized quality-input capture/replay subset. CANDIDATE_ASSEMBLY_READY_TO_RESUME means controlled input-equivalence qualification may resume, not that complete candidate reconstruction or production source qualification has passed.**

The companion contract is `pelora-weather-marine-quality-capture-v1`. The locked `pelora-governed-current-evidence-capture-v1` is unchanged. No runtime route, provider parser, quality formula, threshold, species science, archive or publication contract was changed.

## Audit and narrow boundary

`Weather_Marine_Quality_Capture_Matrix_v1.json` records the audit completed before implementation, input roles, source disposition, consumers, equivalence results and unresolved areas. Current source authority is `getMarineConditions` and the inline quality block in `getOceanConditionsAtAssessment`; neither is replaced.

The new record carries only the missing normalized inputs plus source/audit binding:

| Field | Existing meaning / consumer |
| --- | --- |
| `location.latitude/longitude` | Requested location returned by the marine parser; binds the projection, not a captain origin or candidate identity |
| `qualityInputs.wind.speedKnots` | Existing normalized knots; finite value controls the wind layer's availability |
| `qualityInputs.waves.heightFeet` | Existing normalized wave height in feet; independent wave layer |
| `qualityInputs.swell.heightFeet` | Existing normalized swell height in feet; independent swell layer |
| `qualityInputs.observedAt` | Parser-selected aggregate time text, preserved exactly |
| `qualityInputs.diagnostics.providerStatus.weatherApi/marineApi` | Exact normalized `fulfilled` or `rejected` acquisition outcome |
| `source` | Fixed current Open-Meteo weather/marine product identity profile; no product replacement |
| `sourceAuthority`, `lineageReferences` | Exact governed references and explicit synthetic/unrequalified status; no provider authentication claim |

There are eight reconstructed input leaves including location. All are EXACT_MATCH across the tested parser projections. Units are explicit in existing field names. Wind direction/gust and wave/swell direction/period are not consumed by this quality block and are deliberately not duplicated. They may matter to other marine/operational interpretation, which this task does not qualify. Retrieval time, durations and error prose are also excluded; the latter may contain private transport details.

The shell is not a full marine response, candidate object, environmental frame or species conclusion. It accepts no score, confidence, eligibility, ranking, assessment time, age, quality flags or warning prose. No arbitrary metadata extension channel is provided.

## Exact existing quality semantics

The qualified input boundary is the **normalized current parser return**, not raw provider transport. The test harness obtains real parser returns from synthetic transport, projects their quality inputs, captures/serializes/validates/replays them and compares the projection exactly. Supporting SST uses the existing current capture; chlorophyll/current inputs use existing capture fixtures and age helpers, and moon uses the existing explicit-time algorithm.

Only after input equality is checked does the harness execute the **exact current inline quality source block** twice. It extracts the block and existing constants from `server.js`; no formulas are copied into the capture or approximated. This is a test-only qualification technique, not runtime source evaluation. Production extraction/integration is deferred. The full request route is not invoked because it continues into Auth, history and species work.

The output comparison covers the entire quality object, including all layers, reasons, timestamps, summaries, coverage counts, headline and detail. No ordering or prose differences are normalized away.

- Finite wind/wave/swell values produce `live` layers. Missing values with rejected relevant acquisition produce `degraded`; fulfilled missing values produce `unavailable`.
- Partial family success is preserved independently. No new majority rule is introduced.
- Existing aggregate categories are `complete`, `usable-with-gaps`, `degraded`, `insufficient`. **There is no aggregate `unavailable` category** in this assembler; that is a layer state.
- Both provider requests rejected causes the current parser to throw. The new constructor rejects a fabricated normalized result for that combination. A fulfilled response with all absent values is representable and produces `insufficient`.
- Unknown measurement quality is not upgraded to good quality. This existing object describes availability/freshness, not independently authenticated measurement accuracy. Capture durability has no role in quality.

### Upstream null coercion discovered during qualification

`metersPerSecondToKnots` and `metersToFeet` use `Number(value)`. Consequently explicit transport `null` becomes numeric zero upstream, while an absent value becomes normalized `null`. Tests prove both behaviors. Initial test expectations that raw null meant normalized missing were corrected; current-versus-replay equality did not fail.

**The capture does not repair, endorse or erase this behavior.** Normalized null remains null and normalized zero remains zero. The original transport-null versus real-zero distinction is already lost at this boundary. Recovering it or changing the converters requires separate source-normalization review before production qualification. This is not a newly introduced formula or a claim that null-derived zero is valid Ocean evidence.

## Aggregate time and age

The existing rule is `weather.current.time ?? marine.current.time ?? null`. It is weather-first nullish precedence, not newest time, oldest time, acquisition time, retrieval time, assembly time, assessment time or publication time. The parser-selected text is carried to the wind, wave, swell and SST quality layers. There is no separate single `quality.timestamp` field.

SST's own represented/sample time comes from the marine current block and can differ. The companion capture does not overwrite it. The new capture records normalized aggregate text rather than claiming to authenticate the underlying timestamp selection; upstream source qualification remains necessary.

Null, empty, malformed, ambiguous and future aggregate strings are preserved exactly where the current parser returns them. Existing quality logic can still mark a numeric wind value `live`; that is its availability behavior, **not a demonstrated valid age or freshness assessment**. No age helper is supplied for aggregate time. No tolerance or new freshness policy is added.

SST/chlorophyll/current age remains governed by existing represented-time semantics and explicit assessment context. It is not stored in this capture. At a later assessment, supporting family age/state may legitimately change through existing helpers; raw capture identity remains unchanged. At the same explicit inputs, tests prohibit both implicit `new Date()` and `Date.now`, and quality/lineage replay is identical. Parser operational `retrievedAt` is outside that replay boundary.

## Lineage authority

The exact `buildOceanEvidenceLineage` function reconstructs warnings from underlying facts:

| Warning | Fact | Reviewed authority |
| --- | --- | --- |
| `data-quality:<classification>` | Current quality classification | DOCUMENTARY_AUDIT |
| `open-water-evidence-unavailable` | Downstream open-water evidence availability | DOCUMENTARY_AUDIT |
| `persistence-evidence-unavailable` | Downstream persistence evidence availability | DOCUMENTARY_AUDIT |

Its source comments and position after evidence/confidence construction establish documentary lineage at this boundary; this function does not feed those warning strings back into scoring. Existing ordering, deduplication and exact content remain unchanged. Other lineage fields retain the original group/limitation facts. Open-water and persistence facts are supplied separately in tests and are not invented by weather capture. No complete temporal/narrative parity or species-output effect is claimed.

## Validation, identity and privacy

Construction and every object-consuming public boundary require plain own data properties. Accessors, inherited properties, prototype substitutions, symbols, cycles, coercion hooks, unknown fields and nonfinite values fail closed. Private keys, metadata/flag/lineage channels, known private identifier strings, emails and UUIDs are rejected rather than stripped. Opaque references still require upstream governance; syntax/digest checks cannot prove that an arbitrary encoded identifier is safe or authentic.

Finite numeric values and explicit normalized null are distinct; missing required fields fail closed. Contradictory rejected-provider numeric payloads fail closed. The supported outcome vocabulary is the parser's `fulfilled`/`rejected`; the quality block's defensive `unknown` fallback is not invented as a qualified parser outcome.

Scientific content identity binds contract, configured source identity, location and normalized quality inputs. The capture ID additionally binds source-authority status and lineage references. These digests distinguish exact content and its audit envelope, not a new observation identity. Object-key order is canonical; lineage array order is preserved and bound. Outputs are detached and deeply frozen. Mutation, forged digest and noncanonical serialization fail validation. No clock, random ID, request, captain or Auth input enters identity.

## Composition and reference limits

Replay returns the small marine quality-input projection. It composes with SST/chlorophyll/current capture without duplicating their source schemas, revision/provenance rules or age semantics. Exact cross-capture candidate/location selection still belongs to future candidate assembly; this capture alone does not authorize arbitrary mixed inputs.

Archive compatibility is **REFERENCE-ONLY**: an existing archive intent can carry the capture reference, but capture bytes are not a Frame or archive payload. Publication V3 can freeze the exact capture reference in the tested case. This is reference compatibility, not evaluator consumption, cross-family authority, durable resolution or production storage. Neither contract changed.

Capture validity is not provider authenticity; source identity is not source qualification. Synthetic transport establishes mechanics, failure behavior and replay only, not live reliability, operational freshness, source interchangeability or deployment.

## Resumption and remaining work

Task 12B.6C may resume **controlled normalized-input candidate assembly qualification** using this companion capture and current-evidence-capture v1. The previously demonstrated missing weather/marine quality projection is now reproducible for the tested subset. No complete candidate assembler or resolver is implemented here.

Next: compare complete current and replayed candidate objects through unchanged spatial/quality assemblers, with exact source/location/assessment binding, before species evaluation. Full spatial structures, masks/uncertainty, complete operational marine interpretation, production capture integration, durable references and source qualification remain unresolved. The raw-null conversion issue requires separate review before production source qualification.

Runtime, current capture v1, archive, V3, Task 12B.1, Task 11E, scientific formulas/thresholds, provider qualification and identities remain unchanged. Task 9E-D remains paused. No provider/database/Auth/Supabase access, environmental acquisition, commit, tag, push or deployment.

## Verification

The implementation baseline passed 54 focused tests and all 40 backend/shared scripts with the network-blocking preload. Prior diagnostic/capture counts: 12B.6C 8, 12B.6B 96, source boundary 7, archive boundary 14, temporal primitives 100, temporal selection/requirements 13/13, history 9, assessment 42, shared-science diagnostic 9; publication history/assessment/v1 87/75/57; Task 11E 56; Frame/archive/scalar delivery/Task 11B 17/36/44/22. Syntax passed for all 72 backend/shared JavaScript modules. Baseline logs are under `.local/ocean-quarantine/task12b6d/`.

## Separate final adversarial review

The adversarial pass expands the focused suite from 54 to 80 tests. It actively tests all eight wind/wave/swell availability combinations; normalized null versus numeric zero in every family; transport null/zero aliasing; family swaps; acquisition outcome tampering; both time-precedence directions; later execution clocks and explicit reassessment; exact lineage warnings; delimited private references; nested hostile descriptors/prototypes; mutation; current-capture composition; and species/product substitution. Existing archive/V3 reference-only tests rerun unchanged.

**One capture defect was demonstrated and corrected:** private labels embedded in reference strings (for example `synthetic.captain_id.synthetic-17`) escaped the whole-string privacy check. Four tests failed before correction. Hyphen/underscore variants also reproduced the gap. The correction rejects recognizable private-label token sequences in text/reference values, preserving the existing strict schema and non-invoking descriptor checks. This does not authenticate arbitrary opaque or encoded references; upstream provenance governance remains necessary.

**UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED** remains unresolved. The capture itself never converts normalized null to zero. Actual parser tests show transport null and real numeric zero already collapse to the same normalized projection before capture; an absent field remains distinguishable. No upstream converter, scientific formula or quality threshold was changed.

Wave and swell have the same value shape: swapping their unequal values invalidates the old identity, while a newly authored swapped record has a different identity. Structural validation cannot authenticate the original source claim. Wind/height schema substitution fails closed. Independently valid current/weather captures still require exact source/location binding in Task 12B.6C; this review does not implement or claim that missing assembler responsibility.

Final focused result: **80/80 passed**, eight retained input leaves EXACT_MATCH, complete tested same-assembler outputs EXACT_MATCH, zero unexplained mismatch. All 40 backend/shared scripts passed again with network blocked after the correction; syntax passed for 72 modules, and JSON/whitespace/diff checks passed. Lineage remains documentary at the reviewed boundary and is reconstructed exactly. Quality time remains parser-selected text, separate from scientific age; no later wall-clock dependency was found. Species neutrality is preserved.

Resumption remains **CANDIDATE_ASSEMBLY_READY_TO_RESUME for controlled normalized-input qualification only**. Production source qualification, the upstream null coercion review, complete candidate reconstruction and durable reference resolution remain open. Review logs and the cumulative diff are under `.local/ocean-quarantine/task12b6d-review/`. All five task files remain uncommitted.
