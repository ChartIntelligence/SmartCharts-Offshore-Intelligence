# Signed-Zero Scientific Serialization / Content-Identity Qualification v1

Verdict: **PRESERVE_SIGNED_ZERO** for exact current scientific evidence content and its future serialization/identity boundary. This is a qualification decision for review, not a contract amendment or a claim that every physical zero has a different meaning.

Baseline: `550cc709c5914ce71bead2165a9cbe180c4228f7`, `checkpoint-signed-zero-serialization-boundary-v1`.

No production contract, parser, formula, identity or comparison was modified. Existing archive/scalar v1 records retain their explicitly documented canonical-JSON semantics. No historical zero acquires a recoverable sign. Task 12B.6C remains paused.

## Why preserve at the exact evidence boundary

The decision does not follow merely from JSON behavior or IEEE observability. The locked semantic projection explicitly requires exact value comparison including signed zero (`Candidate_Semantic_Projection_v1.md`). The source captures qualify replay of normalized evidence, not a new numerical interpretation. Actual current science also distinguishes a controlled sign change: `getCurrentConditionsPoint` calls `currentDirectionDegrees` before rounding vector components. With literal synthetic transport `u_current=0`, changing only `v_current=0` to `v_current=-0` changes `/directionDegrees` from 0 to 180 and `/derived/compassDirection` from N to S. All four zero sign combinations produce headings `[0,180,0,180]` for `[(0,0),(0,-0),(-0,0),(-0,-0)]`.

Both speeds are zero and both returned components are subsequently rounded to positive zero. This does **not** authenticate the physical direction of stationary water, establish provider frequency, or establish a species-score effect. It demonstrates a current producer-output distinction that a blanket pre-calculation zero normalization would change. Nonzero-axis controls do not show the same heading difference. The parser's rounding is not repaired.

The current capture already retains the parser's normalized `directionDegrees` separately. Thus this raw-vector counterexample does not, by itself, prove that canonicalizing a component only after the parser would change that retained heading. The prospective capture decision also relies on the independently locked exact evidence-content requirement and the demonstrated loss of retained SST/marine values. Raw-parser meaning and normalized-capture fidelity are not conflated.

For the original SST case, -0 Celsius and +0 Celsius both convert to 32 Fahrenheit; the controlled orientation outputs agree. Physical temperature equivalence therefore coexists with **different exact source evidence content**. These are separate authorities. Nine retained marine-assessor value paths also preserve different signs while the remaining tested interpretation agrees. Exact differences are listed in the JSON matrix rather than hidden by JSON comparison.

CANONICALIZE_SIGNED_ZERO across scientific evidence is not qualified: no universal current-science equivalence or permission to weaken the locked exact surface has been demonstrated. The explicit archive/scalar canonicalization precedent is valid within those versions, not permission to silently extend that equivalence to every scientific producer. PRESERVE here is prospective for exact evidence fidelity; it is not a retroactive assertion that archive v1 promised bit-exact IEEE fidelity.

## Complete inspected numeric boundary inventory

The machine-readable inventory distinguishes absent capabilities from tested equality. `serializedEqual`/`digestEqual` refer to records differing only by zero sign at the stated path. Frame IDs, archive IDs and publication IDs have different authority from content digests.

| Boundary | In memory | Serialization / identity | Validation / replay |
| --- | --- | --- | --- |
| Publication `copy` / `canonical` / `hash` | Copy retains -0, rejects nonfinite/hostile objects | Sorted JSON collapses sign; SHA-256 input is identical | Generic canonical is not a validator; contract callers validate first |
| Ocean Product Frame v1 | Finite scalar/vector values, coordinates, numeric flags, uncertainty and numeric provenance parameters admit -0 | Serializer collapses sign; frame itself has no content-ID generator | Normalization preserves sign; JSON round trip loses it |
| Archive v1 | Frame normalization preserves sign before storage | Content/frame/receipt digests use canonical bytes; zero-only records collide. Archive ID hashes the caller's frame ID | Write/read via simulated port returns +0; sign-only repeat is idempotent, not collision error |
| Scalar delivery v1 | Receives +0 from archive | Same delivered bytes and derivative ID | Decimation preserves canonical archived values; no new signed-zero fidelity |
| Current capture v1 | Constructor and direct replay preserve -0 | Serialized bytes, scientific digest, capture ID and reference hash collapse sign | Sign substitution passes validation; serialized replay yields +0 |
| Weather/marine quality capture v1 | Same, tested independently for wind/wave/swell | Same zero-sign collision | Same direct-versus-serialized replay distinction |
| Marine companion capture v1 | Same, tested for all six retained fields | Capture ID/reference digest and bound quality-reference semantics use canonical JSON | Same zero-sign substitution/serialized replay behavior; no distinct scientificContentDigest field |
| Environmental sample v1 | Exact frame/component/sample view retains -0 | Observation ID embeds frame digest and sample indices; same ID for either sign | Validator compares canonical records and regenerates from supplied frame: original frame restores -0; JSON-reloaded frame gives +0 |
| Publication V1/V2/V3 | Embedded numeric `ageHours=-0` accepted by equality against computed zero | Same evidenceSetId/content/integrity digest; same publication ID | Validation accepts JSON-reloaded +0. Raw measurements/scores are not arbitrary inline payloads here |
| Semantic projection v1/v2 | Both preserve sign | No scientific digest/identity or standalone record serializer | Both return MISMATCH for -0/+0. General JSON encoding is not a qualified projection replay |
| Bathymetry/static normalization | Direct normalization and resolved elevation preserve -0 | No identity created by normalizer | ETOPO ingestion rounds literal -0 to +0; water/depth decisions agree in tested case |
| Fishing location/log precedent | Original scalar representation can preserve sign as an explicit string/tag | Scoped log serialization preserves original representation; normalized coordinates explicitly canonicalize zero | Separate captain/log contracts; not adopted into shared Ocean evidence |

Archive authority is explicit in `Ocean_Product_Archive_v1.md`: `contentDigest` hashes canonical content excluding frameId; `frameDigest` hashes stored canonical full-frame bytes; `archiveId` hashes caller frameId; receipt digest seals receipt bindings. Its documented JavaScript JSON treatment of negative zero and existing signed-zero test agree. Frame serializer comments explicitly disclaim being an identity algorithm. Scalar documentation explicitly canonicalizes negative zero consistently with archive/frame serialization. These are **semantically canonical serialized content**, not exact original IEEE numeric state.

Current/quality capture scientific digests hash selected normalized scientific content, while capture IDs additionally bind source authority/lineage. Companion hashes its whole content and immutable quality reference. Their tested sign collision conflicts with prospective exact replay, not with SHA-256 correctness. Publication IDs are cycle keys, not per-value IDs; same-cycle content digest equality for a sign-only embedded age change is the ambiguity. Referenced sample hashes inherit the upstream collision without publication carrying the measurement itself. No publication scorer was run.

## Parser origins, synthetic transport only

Tests feed literal JSON through the actual existing exported parsers. No provider request is made.

| Family / path | Literal -0 | Small negative that rounds to zero | Missing/null |
| --- | --- | --- | --- |
| SST temperatureCelsius | Retained -0 | Not rounded at this field | Null retained |
| SST temperatureFahrenheit | 32 | Existing conversion/rounding | Null retained |
| Direct and gap-filled chlorophyll concentration | Becomes +0 via toFixed(4) | -0.00001 becomes -0 | Null retained |
| Current components | Literal -0 becomes +0 after direction calculation | -0.00001 becomes -0 at four decimals | Component null retained; current converter still makes missing speed zero |
| Wind speed/gust, wave/swell heights | Literal -0 becomes +0 through conversion/toFixed | -0.00001 becomes -0 | Existing converters may produce +0; separate unresolved normalization issue |
| Wind/wave/swell direction and wave/swell period | Retained by safeNumber | Existing finite value retained | Null retained |
| Static bathymetry | Direct normalization retains -0 | ETOPO rounding may produce -0 | Invalid/missing remains null |

Computed -0 is a real normalized-input possibility even where literal -0 is rounded away. Source capture cannot infer whether normalized zero arose from literal zero, a rounded small value, or already-erased raw null. Captures do not authenticate arbitrary normalized fixtures. The collision tests intentionally isolate contract acceptance from actual provider qualification.

## Scientific-effect audit and limits

Source searches covered `Object.is`, `Math.sign`, `atan2`, reciprocals, sign/finite tests, rounding, classification, gradients, orientation, confidence, availability, quality and identity paths in backend/shared. The three server atan2 sites are geographic destination calculations and current direction; the current direction function is the demonstrated directional counterexample. No `Math.sign` or `Object.is(-0)` branch was found in server science. Geographic formulas were inspected, not globally requalified by this task.

`currentDirectionDegrees` normalizes atan2 degrees through `(degrees+360)%360` and decimal rounding; it is not a newly introduced formula. Current direction and compass reach current spatial samples and current-flow descriptors; the request quality block tests finite speed/direction and age. The tested zero directions are both finite, so that availability predicate does not distinguish their sign origin.

Actual exported `buildCurrentVectorProjectionAnalysis` and `buildCurrentGradientAnalysis` produce exact-equal results for all four controlled zero-component sign combinations. These functions use dot products, hypot, absolute differences, bounded divisions and zero-threshold branches; this does not establish equality for all possible finite vector inputs. SST orientation uses rounded opposing Fahrenheit differences, absolute magnitudes and a 0.3 signal threshold. Tested ±0 Celsius does not change that result. `Math.min` can preserve -0, `Math.max` can choose +0, and a small negative rounded with toFixed can produce -0; numerical representation effects must not be generalized into physical effects.

The actual marine assessor differs only at these nine retained paths in the tested all-zero pair:

- `/assessments/wind/values/speedKnots` and `/assessments/wind/values/gustKnots`
- `/assessments/waves/values/heightFeet` and `/assessments/waves/values/periodSeconds`
- `/assessments/swell/values/heightFeet` and `/assessments/swell/values/periodSeconds`
- `/directionalInteraction/values/windDirectionDegrees`, `/waveDirectionDegrees`, `/swellDirectionDegrees`

All nine differ only by Object.is sign. The quality assembler agrees for independently changed zero speed/heights. No changed classification, confidence, quality or lineage wording was demonstrated by those controlled marine cases. No new sign-dependent source/provenance label is introduced. Source fidelity includes a retained normalized sign when present, but does not imply that sign encodes authenticated provider intent.

Strict equality and ordinary <, >, finite and null checks do not distinguish signed zeros. `1/-0` and `1/+0` differ technically, but no reciprocal-of-zero scientific effect was demonstrated; this audit does not promote that language fact into a Pelora science claim. Null/missing remains distinct from both zeros; frame missing masks are enumerated strings, not numeric arrays that accept -0. Nonfinite input rejection remains unchanged.

Candidate IDs and Opportunity identities are not minted here. No effect or non-effect on species habitat, eligibility, gate, score, confidence, ranking or persistence is established. Those downstream contracts were inspected for direct sign branches and included in regressions; no species evaluator was used as acceptance. The audit is not a proof of universal whole-program numerical equivalence.

Specific inspected downstream boundaries include `buildUnifiedOpportunityCandidateSourceUniverseV1` (existing grid/structure candidate identities), `evaluateSpeciesCandidateHabitatEligibilityV1` (normalized bathymetry and governed depth rules), `assessBlueMarlinHabitat` (relationship/evidence interpretation), and `resolveUnifiedOpportunityRankingInputV1` (availability, explicit eligibility and finite score). None supplies authority to normalize incoming source zeros globally. A finite score test accepting both zeros is not proof that every upstream scientific input transformation yields the same species output.

## Canonicalization precedent and historical compatibility

There is no single existing global zero policy. Examples have explicit scopes:

- Archive/frame/scalar canonical key ordering preserves array order but canonical JSON loses zero sign.
- Existing parsers deliberately convert units and round decimal fields; some conversions erase literal sign, others create -0 through rounding. Longitude/direction normalization is likewise a particular producer operation, not a generic numeric policy.
- Frame timestamps normalize explicit UTC spellings; missingness/nonfinite validation remains distinct from numeric canonicalization.
- Fishing location retains original scalar text while canonicalizing normalized coordinate zero; Fishing Log capture encodes original -0 with a dedicated tag. Its permission to document invalid raw representations is **not** permission to admit NaN/Infinity or arbitrary tags in Ocean captures.
- The scientific projection intentionally removed a JSON-based comparison because it erased -0. It remains exact and unchanged.

Historical captures/frames serialized as +0 cannot reveal whether their original value was -0. Existing IDs/digests remain valid under their original contract. Do not relabel them as exact-sign records, recover a sign from value presence, recompute historical identity under a new policy, or migrate archived bytes in place. Source requalification would require separately available original evidence.

## Proposed narrow versioned design, not implemented

The minimum demonstrated repair boundary is the **current-evidence capture serialization + validation + scientific digest + capture ID/reference hash + read/replay** chain, as a separately reviewed version. Weather/marine quality and companion show the same issue, so a claim of exact signed-zero whole-candidate replay would also need their versioned successors and compatible explicit binding. Changing only transport while retaining old hash/validation equality would leave collisions.

Evaluate these alternatives in the amendment gate:

| Option | Qualification considerations |
| --- | --- |
| Versioned canonical JSON emitting the valid numeric token `-0` | Narrowest candidate: ordinary JSON.parse preserves the token; strict own-data finite validation first; deterministic key ordering; existing finite formatting for other numbers; versioned hash domain; no global JSON patch. Must qualify exact reader reserialization and all numeric paths before selection. |
| Versioned tagged numeric form | Can preserve sign, but requires a closed exact tag grammar at allowed numeric paths; cannot admit arbitrary objects, forged metadata, NaN/Infinity, aliases or tags in unknown fields. Existing log tags are not reusable authority. |
| Versioned binary canonicalization | Can preserve IEEE sign, but expands byte-order/schema/tooling scope; must forbid nonfinite encodings and maintain explicit readable/source references. Not needed merely because binary exists. |

No option is implemented or finally selected by this qualification. A future version needs immutable domain separation, distinct ±0 bytes/digests/IDs, deterministic ordering, exact sign substitution detection, private/accessor/prototype rejection, preserved null/missing distinction and legacy readers/IDs unchanged. Test-only JSON sign labels in this report are documentary descriptions, not an encoding proposal in production.

Frame/archive/scalar v1 must remain unchanged. Their canonicalization is already intentional. An exact-sign archive-backed source path would require a separately reviewed representation/adapter version; it cannot be claimed through current canonical v1. Temporal sample views would need to bind that new frame/representation authority if used there. Publication V1/V2/V3 remain unchanged: references must name the right future contract/digest; an exact embedded-age policy, if required, needs its own versioned scope rather than rehashing accepted publications. Neither semantic projection version requires weakening. Parsers, spatial/marine science and assessment formulas require no repair for this decision.

The rejected blanket canonicalization option would require explicit producer/capture/frame/archive/comparison policy alignment and proof that changing zero signs before current direction calculations is intended. That proof is absent. Normalizing only the comparator would conceal source loss; normalizing only constructors would change their source-fidelity promise.

## Next gate and qualification limit

Next gate: **VERSIONED SIGNED-ZERO-PRESERVING EXACT-EVIDENCE SERIALIZATION / IDENTITY AMENDMENT REVIEW**. Review the above scope and representation before implementation. Do not resume Task 12B.6C until a compatible qualified serialization path is available. No new environmental capture family is justified.

This task establishes audited technical behavior and a prospective exact-evidence fidelity decision, not a live-provider frequency/quality finding, durable storage qualification, production deployment, complete candidate reconstruction or species equivalence. `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains separate: raw null-to-zero conversion is not signed-zero serialization.

## Verification and unchanged boundaries

Focused tests: **40/40 passed**. All **48 backend/shared scripts passed with network blocked**, including the reconstruction diagnostic (17), projection v2 (100), projection v1 (113), all three captures, Frame/archive/scalar, temporal primitives, publication V1/V2/V3, all prior Task 12 suites, Opportunity/governance and Task 11E. Syntax passed for **85 modules**; JSON parsing passed for **19 files**. Whitespace and git diff --check passed; no tracked or staged changes. The matrix has **44 executed collision/parser rows across 14 inspected boundary groups**. Ignored logs are under `.local/ocean-quarantine/task12b6g/`; no diagnostic artifacts are staged.

Only the qualification test, this report and its JSON matrix are added. Runtime, parsers, all three captures, projections v1/v2, spatial/marine formulas, scientific assessment, habitat, eligibility/gates, score, confidence, ranking, persistence, candidate/Opportunity identity, archive, V3, provider qualification and freshness rules remain unchanged. Privacy/accessor checks remain enforced; no proposed numeric encoding was enabled.

Task 12B.6C and Task 9E-D remain paused. No provider/database/Auth/Supabase access, environmental acquisition, frontend change, scheduler/storage selection, commit/tag/push/deployment. Leave uncommitted for review.
