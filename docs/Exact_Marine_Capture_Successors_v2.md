# Exact Weather/Marine and Marine Companion Capture Successors v2

Verdict: **EXACT_MARINE_CAPTURE_SUCCESSORS_QUALIFIED** for the reviewed normalized evidence and existing assembler paths. Resumption decision: **TASK_12B_6C_READY_TO_RESUME_WITH_ALL_EXACT_CAPTURES**, subject to this task's adversarial review and explicit checkpoint. Task 12B.6C was not resumed. Complete candidate equivalence remains unestablished.

Baseline: `518c83daf942b22d2e657a3bb90e4aed2207fbea`, checkpoint `checkpoint-exact-scientific-evidence-serialization-v1`. Task 9E-D remains paused. All changes are uncommitted qualification work, with no runtime integration.

## Authorized extraction and historical preservation

Initial audit found the exact encoder and digest private inside `currentEvidenceCaptureV2.mjs`, with the digest's capture version hard-coded. Reusing that implementation while keeping its source byte-identical was impossible through its public closed current-capture API. The user explicitly authorized: **“Allow behavior-preserving shared extraction.”**

The original encoder, finite-number grammar, privacy/own-data checks, constants and digest envelope now reside in `backend/exactScientificEvidence.mjs`. The digest takes the capture-version domain as an explicit parameter. Current v2 passes the same constant as before and retains its exports and contract. There is one production encoder, no new representation, no tags, reviver or global patch. Internal codec ports require validated closed-schema content or fixed digest envelopes; they are not standalone evidence-schema authenticators.

Twenty-four golden records were recorded from the checkpoint before extraction, across all four current families and positive/negative zero, ordinary finite values and finite extremes. They pin serialized-byte SHA256, scientific digest, capture ID and exact reference, and verify replay values. All match after extraction. The existing 160-test exact-current suite remains unchanged and passes. Current-v2 source is therefore **changed only by the authorized extraction**, while its bytes/identities/behavior remain compatible. It is not claimed source-byte-identical.

Historical current v1, weather/marine v1 and companion v1 remain source-byte and behavior unchanged. Tests pin the historical marine Git blobs and reproduce their expected sign loss. No old identity is rewritten, rehashed or reinterpreted.

## Nine-value source audit

The complete machine-readable inventory is `Exact_Marine_Capture_Inventory_v2.json`. Audit preceded implementation. All producers are the unchanged `getMarineConditions` parser in `backend/server.js`.

| Family / normalized field | Units | Transport field / converter | Capture owner | Scientific consumer within oceanConditions |
| --- | --- | --- | --- | --- |
| wind.speedKnots | knots | wind_speed_10m / metersPerSecondToKnots | quality v2 | assessments.wind.values.speedKnots |
| wind.gustKnots | knots | wind_gusts_10m / metersPerSecondToKnots | companion v2 | assessments.wind.values.gustKnots |
| wind.directionDegrees | degrees | wind_direction_10m / safeNumber | companion v2 | directionalInteraction.values.windDirectionDegrees |
| waves.heightFeet | feet | wave_height / metersToFeet | quality v2 | assessments.waves.values.heightFeet |
| waves.directionDegrees | degrees | wave_direction / safeNumber | companion v2 | directionalInteraction.values.waveDirectionDegrees |
| waves.periodSeconds | seconds | wave_period / safeNumber | companion v2 | assessments.waves.values.periodSeconds |
| swell.heightFeet | feet | swell_wave_height / metersToFeet | quality v2 | assessments.swell.values.heightFeet |
| swell.directionDegrees | degrees | swell_wave_direction / safeNumber | companion v2 | directionalInteraction.values.swellDirectionDegrees |
| swell.periodSeconds | seconds | swell_wave_period / safeNumber | companion v2 | assessments.swell.values.periodSeconds |

All nine signs are scientifically visible to the locked semantic projection's exact comparison. Speed/heights feed both quality and marine assessment. The six companion values feed marine assessment; gust/direction also participate in wind provenance consistency. Retained source leaves are wind.source provider/classification/availability and source provider/weatherModel/marineModel. Exact quality binding preserves location, acquisition status and aggregate time. The companion does not introduce a duplicate authority for speed or height.

Tests start from actual same-product synthetic parser responses, then deliberately supply the controlled normalized signs. Some raw converters already erase sign or raw-null distinctions; no claim is made that every transport -0 survives those converters.

## Contracts, identity and exact references

| Role | Contract | Identity namespace | Exact reference protocol |
| --- | --- | --- | --- |
| Quality | pelora-weather-marine-quality-capture-v2 | wmq2- | pelora-exact-weather-marine-quality-reference-v1 |
| Companion | pelora-marine-assessor-companion-capture-v2 | mac2- | pelora-exact-marine-assessor-companion-reference-v1 |

Both use unchanged `pelora-exact-scientific-json-v1` and `pelora-exact-scientific-content-sha256-v1`. Canonical finite numeric JSON emits literal `-0`, sorts object keys, preserves array ordering, and uses native numeric parsing. Closed-schema validation precedes encoding; validated re-encoding must equal supplied wire bytes. Duplicate wire keys are parsed internally but cannot produce an accepted record because canonical byte equality fails. Strings are never revived.

SHA256 binds serialization version, digest version, capture contract version, purpose and exact content. Purposes are `scientific-content`, `capture-identity` and each exact-reference protocol. Scientific quality content comprises source, location and qualityInputs; scientific companion content comprises its exact qualityReference, marineInputs and source. Full capture identity additionally binds source authority/lineage where present. References hash the entire validated capture, including ID and digest. Reference fields remain kind/referenceId/contractVersion/sha256 for existing V3 compatibility; the capture version fixes its exact serialization/digest/reference protocol.

Validation rebuilds identities and compares exact bytes. No stored ID/digest is trusted alone. Wrong versions, sign/value changes, IDs, hash-purpose substitution, extra fields and altered arrays fail. Sign-only quality changes alter its reference and invalidate an old companion binding; an explicitly rebuilt companion acquires a different identity.

## Reusing source semantics without a cross-version bridge

Quality v2 delegates source-schema validation to the unchanged v1 constructor in memory and discards historical hashes/IDs. Companion v2 first validates quality v2 and its exact supplied reference. It then creates an internal v1-shaped quality/source validation adapter solely to invoke existing companion invariants, including speed OR gust OR direction wind availability, provider failure and consumed provenance consistency. The adapter is never serialized or exposed as an accepted historical binding. All historical IDs are discarded. External companion-v2-to-quality-v1 bindings fail closed.

No availability repair, default insertion, new quality rule, range restriction, unit conversion or marine formula is introduced. Numeric zero is finite evidence, null remains missing, required missing/undefined fails, and there is no optional metadata extension bag. Nonfinite values fail at all nine measurement positions and both location coordinates. Wave, swell, wind and foreign source payloads cannot substitute for one another.

## Producer/replay proof

Path A: actual synthetic same-product parser -> authoritative normalized evidence -> unchanged quality assembler / marine assessor -> locked scientific projection.

Path B: the same normalized source inputs -> quality v2 + companion v2 + current SST v2 -> exact serialization -> read/validate -> verify all three exact references -> replay -> the same quality assembler / marine assessor -> the same projection.

The harness also removes Path A derived outputs and mutable working source objects before reconstructing. Path B takes only frozen bytes/references and explicit supporting context. It does not borrow quality, oceanConditions, derived availability or lineage outputs. Non-target chlorophyll/current/moon support remains explicit fixture context, not a claim of full candidate reconstruction.

Results:

- All nine independent signed-zero cases: exact input replay and **EXACT_MATCH** scientific projection. Bytes, scientific digest, capture ID and typed reference distinguish each sign.
- Four mixed-sign configurations preserve signs independently across all nine positions.
- Eight independent quality-family availability combinations preserve complete tested output.
- Six one-at-a-time companion changes preserve complete tested oceanConditions.
- Complete, usable-with-gaps, degraded and insufficient quality outputs and lineage reconstruct exactly; fulfilled-missing, rejected and unavailable-family distinctions persist. Both-provider rejection remains unrepresentable.
- Six retained provenance/source leaves replay unchanged; contradictory wind availability fails closed.
- Null/zero/absence remain distinct; no added rounding for ordinary finite values or finite extremes.
- Clock/network/random traps pass during completed replay; no Auth or captain wrapper is required. Detached captures, references and replay are deeply immutable.

## Time, security and compatibility

Existing quality time remains weather-current time under nullish precedence, otherwise marine-current time. Malformed quality-time text retains its existing documentary value semantics; it acquires no represented-time or age authority. No scientific assessment, acquisition, retrieval or replay time substitutes for another. Task 12B.1 time science is unchanged.

Private labels, UUID/private sequences including underscore suffixes, provenance/metadata/lineage/reference attacks fail. Own-data descriptor checks reject accessors, inherited/custom prototypes, sparse arrays, cycles and conversion hooks without invoking getters. The existing depth/string/wire-size bounds are reused. Meaningful lineage ordering and duplicates remain visible; object-key insertion order does not affect canonical identity.

V3 binds both new exact references without amendment: sign-only reference changes alter publication content digest, and modifying a bound version/ID/digest invalidates the existing publication. Exact-reference validation additionally checks actual source content. Generic V3 references remain opaque; neither publication hashing nor a capture digest authenticates a provider. No durable resolver is established.

Historical canonical archive/scalar references coexist without recovering a lost sign. Archive, scalar, temporal primitive and projection v1/v2 contracts are unchanged. No species evaluator was run; no claim is made about effects on eligibility, score, confidence, ranking or Opportunity identity.

## Verification and limits

Implementation suite: **130 passed**; final adversarial suite: **152 passed**. Current-v2 extraction golden cases: **24 passed**. All **50 backend/shared scripts passed with network blocked**, including current exact (160), signed-zero (40), reconstruction diagnostic (17), projection v2 (100), projection v1 (113), historical quality (80), historical companion (108), historical current, Frame/archive/scalar, temporal primitives, publication V1/V2/V3, prior Task 12, Opportunity/governance and Task 11E. The final focused rerun includes direct normalized-source/provenance equality plus the added archive/location checks. Syntax passed for **94 modules**, JSON for **21 files**, and whitespace/git diff --check passed. Nothing is staged. Performance measurements for both captures are likewise recorded there: 20 synthetic iterations including validation cost, not production sizing or latency budgets.

No unexplained mismatch remains within this task's demonstrated normalized marine surface. This is not complete candidate equivalence, provider authenticity, production freshness, durable storage/resolution, scheduler deployment or all-species qualification.

Next gate: Task 12B.6I adversarial review, then explicit checkpoint. Only afterward separately resume Task 12B.6C with the three exact capture versions. Task 12B.6C was not resumed here; Task 9E-D remains paused. `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains separate and open.

No runtime routes were integrated or migrated. Parsers, historical captures, quality/marine/spatial formulas, projections, assessment and species science, candidate/Opportunity identity, provider qualification, freshness rules and archive/scalar/V3 are unchanged. The only predecessor source edit is the expressly authorized shared extraction. No provider/database/Auth/Supabase access, environmental acquisition, commit/tag/push/deployment occurred.

## Final adversarial review

**PASS for the qualified exact marine subset**, retaining `TASK_12B_6C_READY_TO_RESUME_WITH_ALL_EXACT_CAPTURES`. Task 12B.6C remains paused. No complete candidate/spatial reconstruction or production qualification follows.

One defect was demonstrated in the newly shared digest entry point: domain identifiers were not checked as primitives. Direct calls with object-valued domains could invoke a getter during encoding and return a digest. Two new tests failed before correction, and a direct probe recorded one getter call. Existing capture wrappers already used fixed strings, so no accepted capture mismatch or current-v2 behavior change was demonstrated.

Correction: the shared digest now validates `captureVersion` and `purpose` using the existing primitive identifier grammar before envelope encoding. It does not acquire a family registry or reference policy. Caller modules retain fixed family versions and purposes. Well-formed substituted domain strings yield different hashes; they cannot validate under a different family protocol. Serialization/digest version constants and canonical byte grammar remain unchanged. All 24 original goldens remain unedited and pass; the existing current-v2 suite still provides its 160 behavior/security checks.

Expanded review covers all six cross-family ID substitutions, wrong protocol-purpose digests, missing/extra/inherited/accessor reference fields, malformed namespace/hash forms, and quality binding changes in authority, lineage, ordering, time, location, acquisition and sign. Compatible explicit rebinding changes companion identity; silent substitution fails. Every one of the nine scientific numeric positions receives sign-conflicting duplicate-key attacks in both orders at its exact family object. Eight mixed-sign configurations now exercise independent signs. No sign restoration or comparison exception was added.

The machine inventory is reconciled against the tested normalized/capture/consumer paths and actual parser/converter names. Complete normalized inputs, six provenance/source leaves, quality/lineage, and oceanConditions continue to match. Finite, null/missing, family/schema, privacy/prototype, mutation, ordering and no-clock/network tests remain passing. Shared-module inspection confirms one production exact encoder and one parameterized digest envelope, with no family source schema or scientific interpretation moved into it. The small independent encoder in tests exists only to verify digest preimages; it is not a production codec.

V3 remains an opaque reference binder: a newly constructed publication may record arbitrary reference metadata, but changed family/version metadata changes publication content and cannot resolve through an incompatible exact typed validator. Altering an existing publication invalidates it. This demonstrates reference binding, not a durable resolver, provider authentication or family authorization by V3 itself. No version/family alias or binding amendment was demonstrated in that reviewed scope.

Historical v1 code, identities and sign-loss behavior remain unchanged. No claim of historical sign recovery, backfill or rehash is introduced. Exact semantic projections and all scientific formulas remain unchanged. The only correction during review is domain-parameter validation; no golden was rewritten to obtain PASS.

Final review verification: **152/152 focused tests**, **50/50 network-blocked backend/shared scripts**, **94 syntax modules**, **21 JSON files**, whitespace and `git diff --check` all passed. This includes the unchanged expected current exact (160), signed-zero (40), reconstruction diagnostic (17), projection v2 (100), projection v1 (113), historical quality (80) and companion (108) counts. Fresh diagnostic timing is recorded in the matrix. Nothing is staged or committed; Task 12B.6C and Task 9E-D remain paused.
