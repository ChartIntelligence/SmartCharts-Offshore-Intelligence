# Task 12B.6S — Assessment-derived astronomy boundary

Verdict: **ASSESSMENT_DERIVED_ASTRONOMY_QUALIFIED** for the current DEFAULT production provider only, at HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`.

This qualifies astronomy's current semantic and temporal boundary. It does not certify astronomical accuracy, the complete default provider model, candidate equivalence, injected providers, species equivalence or projection authority. The original nine areas remain **BLOCKING_UNRESOLVED**. Their failed ledger is unchanged.

## Evidence and files

New files only:

- `backend/tests/assessmentAstronomy.test.js`
- `backend/tests/fixtures/assessmentAstronomyFixture.mjs`
- `docs/Assessment_Derived_Astronomy_Boundary_v1.json`
- `docs/Assessment_Derived_Astronomy_Boundary_v1.md`
- `docs/Assessment_Derived_Astronomy_Preservation_v1.json`

The boundary JSON contains the complete output inventory, source bindings, thirteen compact branch records, execution witnesses, exact transition instants, field-level differences and next-model requirements. The preservation JSON records SHA-256 before/after for all 53 pre-existing protected untracked artifacts, including failed qualification evidence and quarantined v3. It is preservation evidence, **not an authority freeze**.

## Entry and sole scientific clock

Production species orchestration explicitly binds module-private `getOceanConditions` for both candidate classes (`backend/server.js:59538–59548`). Unified evaluation defaults to the same function at line 59259. Its wrapper at 62282 resolves and installs the explicit assessment guard, then calls `getOceanConditionsAtAssessment` (60099). That function calls `getMoonConditions(assessment.assessmentAt)` at 60188. Astronomy takes one timestamp argument and two fixed private constants; it takes no environmental, candidate, geographic, captain or species inputs.

`backend/scientificAssessment.mjs` enforces a plain two-field context, supported contract version, valid four-digit-year UTC timestamp, and exact Date round trip. Seconds alone or exactly three fractional digits are allowed; output canonicalizes to milliseconds. A frozen validated context and active-context equality check prevent a different nested assessment instant. Missing outer context captures the clock once under existing Task 12B.1 behavior; missing nested context fails. Explicit malformed or null time does not default.

Tests reject ambiguous/date-only values, missing Z, offsets, unsupported precision, an impossible calendar date, text, Date objects, NaN and infinities **before any transport request**. Valid year 0000, year 9999, leap day and future assessment dates produce finite astronomy. Existing assessment governance permits future assessment dates; this review adds no new policy. The standalone exported astronomy helper outside an active assessment is not the qualified boundary. Its defensive invalid-time shape is not a default-provider output shape.

The calculation replays exactly with `Date.now`, `Date()` and no-argument `new Date()` prohibited. Default evaluations also replay with advancing execution clocks. Other provider operations still use clocks for cache/retrieval metadata; those clocks are not lunar authority. A request-style evaluation with omitted assessment records exactly one assessment clock capture, then propagates that same instant to astronomy. No execution, retrieval, quality, generatedAt, publication-completion or source represented time substitutes for it.

## Algorithm, fields and branches

The existing algorithm is unchanged: epoch `2000-01-06T18:14:00.000Z`, synodic period `29.530588853` days, normalized positive remainder, phase fraction, and cosine illumination. Classification uses the **unrounded** fraction; returned fraction, age and illumination round to four, two and one decimal places respectively.

The complete valid output is one object plus `source`, with ten leaves:

| Field | Role |
| --- | --- |
| `phase` | Snapshot scientific label; no direct phase-to-score read found |
| `phaseFraction` | Snapshot scientific number |
| `lunarAgeDays` | Snapshot scientific number |
| `illuminationPercent` | Snapshot scientific number |
| `observedAt` | Scientific assessment instant; consumed by quality and retained in snapshots |
| `source.provider` | `Pelora`, retained provenance |
| `source.classification` | `astronomical-calculation`, retained provenance |
| `source.accuracy` | `approximate`, retained method annotation; not a numeric score input |
| `source.referenceEpoch` | Fixed algorithm epoch, retained provenance |
| `source.availability` | `available`; consumed by quality and status |

The JSON classifies value/provenance retention as `SNAPSHOT_SCIENTIFIC`, and time/availability reads as `SCIENTIFIC_CONSUMED`. These descriptions grant no new projection permissions. There are no rise/set, position, location or timing-window fields. No valid default field is UNKNOWN or omitted from the inventory.

Eight reachable phase intervals are derived from source:

| Unrounded fraction | Phase |
| --- | --- |
| `< .03125` or `>= .96875` | new-moon |
| `[.03125, .21875)` | waxing-crescent |
| `[.21875, .28125)` | first-quarter |
| `[.28125, .46875)` | waxing-gibbous |
| `[.46875, .53125)` | full-moon |
| `[.53125, .71875)` | waning-gibbous |
| `[.71875, .78125)` | last-quarter |
| `[.78125, .96875)` | waning-crescent |

All eight return branches have positive V8 precise coverage from actual default evaluations. Twenty-four boundary evaluations exercise the millisecond before, the first millisecond on the next branch, and the millisecond after each transition. The ideal fractional thresholds are not exactly representable on the accepted millisecond grid in the chosen cycle; the test records that explicitly and introduces no tolerance. Three epoch cases exercise negative-remainder normalization, exact reference time and the following millisecond.

Four defensive paths are unreachable through executable default enforcement: undefined time, Date-object input, invalid Date result and nonfinite phase fraction. Invalid inputs are rejected upstream; finite four-digit-year Date values minus the fixed finite reference, divided by the positive finite constants, keep the calculation finite. Extreme accepted dates exercise this bound. The thirteenth record covers availability/time-to-quality/status construction: valid default astronomy always supplies available/populated time, so opposite missing/invalid paths require bypassing the default producer. This conclusion applies to astronomy only, not unrelated family states.

## Demonstrated cases and downstream effects

| Explicit assessment | Phase | Fraction | Age, days | Illumination |
| --- | --- | --- | --- | --- |
| `2026-09-26T01:00:00Z` | full-moon | 0.4804 | 14.19 | 99.6% |
| `2026-10-03T01:00:00Z` | waning-gibbous | 0.7175 | 21.19 | 60.1% |

These are the instants from the existing omitted-area diagnostic. Returned `observedAt` is the canonical `.000Z` form of each assessment.

The provider reads availability to build `dataQuality.layers.moon.state = calculated`, its reason, and `status.moon`. It copies astronomy time into the moon quality layer. Supporting-layer counts include calculated moon evidence; overall data quality is subsequently read by marine/evidence assessment and species relationship interpretation. This is an indirect scientific consumer, not merely a display label. However, changing phase or illumination leaves lunar availability calculated, so it does not itself change those counts. Raw moon fields are not passed to the marine/ocean evidence assessors or current blue-marlin interpreter. No direct phase/illumination-to-score dependency was found in the current path.

`buildObservationSnapshot` clones the complete moon object and quality into frozen content. `buildOceanSnapshot` retains that observation snapshot. Root `moon` and `source.moon` also retain the values/provenance. Human-readable “moon information” is a missing-layer explanation whose unavailable astronomy condition is unreachable under the valid default time contract.

With identical synthetic environmental transport values and source time `2026-09-01T00:00:00Z`, changing between the two assessments produces six astronomy differences in `observationSnapshot`: its five moon fact fields and `/dataQuality/layers/moon/observedAt`. The same six appear in the root value/quality and six in `oceanSnapshot.observation`, for eighteen retained astronomy differences. The JSON records every exact path and value.

Separately, 25 environmental age fields change by exactly 168 hours: two SST, nineteen current/vector and four chlorophyll/productivity/clarity fields. Those changes belong to existing assessment-relative freshness calculations, not lunar science. Both cases remain in the same stale categories. One `generatedAt` difference is retrieval/snapshot metadata. No unexplained observation-snapshot differences remain in this controlled comparison. This is not general qualification of the original cache/generatedAt review area.

## Independence, caching and mutation

Identical assessment produces exact moon equality across accepted candidate corners `(15,-100)` and `(32,-75)`, center `(25,-90)`, different IDs, reverse order and a duplicate. Synthetic captain/Auth/origin/range/boat/mission/species wrapper values are inert here; no Auth/provider/private service is contacted. Source inspection independently proves the sole timestamp input. These tests do not qualify arbitrary wrapper or injected-provider behavior.

Astronomy is species-neutral generation before the current species interpreter, and is independent of candidate identity, location and environmental values. Identical assessment facts are therefore shareable in principle; current architecture copies them into per-candidate evidence. No architecture relocation or additional species qualification is proposed.

There is no astronomy cache. The default function calls it afresh. Environmental cold/warm execution demonstrates 13 versus four synthetic transport requests with identical lunar facts; changing assessment on the warm cache still recomputes the waning-gibbous result with four requests. Cache timestamps do not become lunar time. Mutation of a returned root moon/source cannot change the frozen observation copy or later evaluations. Each calculation allocates a new object; the private epoch Date never escapes as an object.

## Identity, publication and request relationship

Moon facts participate in returned candidate evidence and snapshot **content**. The existing snapshot ID can stay the same while those facts change: the controlled comparison retains `pelora-snapshot-eb426f61`. Its current identity is based on location, represented time, capture mode and schema, not a complete content digest. This is a report of current behavior, not an identity amendment or new defect claim.

The publication worker passes `assessmentContextV3(cycle)` into its evaluation port. That context uses `pelora-scheduled-scientific-assessment-v1` and the scheduled instant. A real constructed scheduled context for `2026-09-26T00:00:00Z` produces identical default astronomy at later execution clocks. Publication binds assessment/evaluator/evidence/history identities; it does not automatically include the whole raw provider moon object or bind provider implementation identity. This test establishes context compatibility, not a deployed adapter/publication integration claim. Request-time outer capture and nested default astronomy share the same Task 12B.1 assessment, demonstrated separately.

## Next model and limits

Next gate: **EXPLICITLY REVISED DEFAULT-PROVIDER SEMANTIC REVIEW MODEL**.

The next model must explicitly start with the original nine unresolved areas plus `ASSESSMENT_DERIVED_ASTRONOMY`, then undergo a completeness audit before any resolution claim. The addition must include the assessment guard, `getMoonConditions`, `classifyMoonPhase`, fixed constants, phase interval decisions, availability-to-quality effects and the two snapshot copying functions. Its exact paths and dependencies are listed in the JSON. Astronomy observedAt is assessment-derived calculation time; it must not be equated with retained environmental sample time.

No blocking astronomy item remains in this bounded review. The original nine remain unresolved. No optionality, requirement authority, v3 proposal, authority freeze or v3 implementation was created. Arbitrary injected providers remain outside qualification. Production algorithms, context, provider, cache, parsers, captures, serialization, projections, assemblers, species science, archive/scalar, publication V3 and freshness are unchanged.

## Verification and preservation

Focused qualification: **11 tests pass**, synthetic transport only, with network blocker preloaded. Complete network-blocked backend/shared regression discovery passed **62 scripts, zero failures**, excluding the quarantined draft-v3 suite. The final astronomy rerun passed all 11 tests after adding its cache witness; the discovery run had exercised the initial ten. Syntax passed **119 modules** and JSON parsing passed **50 files**, excluding quarantined v3 implementation/test/schema. New-file whitespace, `git diff --check` and staged diff checks pass. Passing historical STOP diagnostics preserves those STOP findings; it does not restore their withdrawn claims.

All 53 protected artifacts have matching before/after SHA-256 values in the preservation JSON. Quarantined v3 hashes remain:

- implementation: `cc610ad547fac883c003219f143035101679a1f5adb6ccc0f10e14dd74adab0e`
- tests: `98f097f673976161946d7d311661477e345bca0add4a2957b9d1527199fe16ab`
- schema: `0987dfbd9eca48e10e283757381c1a87b67caceca961e3ca20ee79c4dcb4673c`

Task 12B.6C and Task 9E-D remain paused. `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains open. No staging, commit, tag, push or deployment. No provider/database/Auth/Supabase access or environmental acquisition.

Regression details: 12B.6R STOP **6**, 12B.6Q **12**, provider boundary **11**, transitive STOP **10**, prior adversarial STOP **4**, projection v1/v2 **113/100**, plus all other discovered Task 12, exact capture, snapshot, reconstruction, Opportunity/governance, Task 11E, Frame/archive/scalar/Task 11B suites. Per-script results are in the boundary JSON. HEAD and branch match preflight; tracked and staged diffs are empty. Git reports 60 untracked entries: the 53 preserved historical files, two pre-existing Supabase configuration files left untouched, and these five new deliverables.
