# Task 12B.6Q — default-provider transitive review

**STOP: DEFAULT_PROVIDER_SEMANTIC_BRANCH_MODEL_UNRESOLVED.**

This is a partial source/coverage review, not completed producer qualification. The named function closure and five bounded reachable-branch proofs are reproducible. The complete semantic graph, semantic branch universe, all default-domain reachability dispositions and branch-complete scenario coverage have **not** been established. Nine explicit review obligations remain in `Default_Provider_Transitive_Review_v1.json`. These are review obligations, not a claim that precisely nine individual branches remain.

No production defect has been demonstrated. No previously withdrawn qualification is restored. Passing this diagnostic is not `DEFAULT_PRODUCTION_PROVIDER_TRANSITIVE_BRANCHES_QUALIFIED`.

## Boundary and executable constraints

`backend/server.js::getOceanConditions` is module-private. `evaluateControlledGulfBlueMarlinV1AtAssessment` binds it explicitly for both governed candidate classes. The independent fixture invokes `evaluateUnifiedOpportunityOceanConditionsV1` without any provider override. This reaches the same default provider while preserving the class/coordinate/assessment checks. It does not prove upstream static candidate eligibility: the test supplies an explicitly eligible synthetic open-water candidate.

| Constraint | Enforcement / limitation |
|---|---|
| Present coordinates, coerced with `Number` | Caller checks null/undefined/blank values before conversion |
| Latitude 15–32 inclusive; longitude -100–-75 inclusive | `coordinatesAreValid` before provider invocation |
| Explicit assessment context/version/time | `scientificAssessment.mjs` validation and assessment wrapper |
| Candidate class | Governed open-water/physical-structure dispatch; only open-water executed here |
| Provider identity | Production orchestration's explicit private-function binding |
| Source values, availability, time and table contents | Transport/parser/assembler decisions; not fixed caller constants |
| Bearer token | Optional; this diagnostic supplies null and never accesses history services |
| Uniform temperatures, fixed current vector, fixed represented time | **Fixture-only**, never grounds an unreachable disposition |
| Fixed marine/weather values except rejection | **Fixture-only**; does not exhaust partial/quality combinations |

The inside case `[25,-90]` and corners `[15,-100]`, `[32,-75]` invoke actual synthetic default transport. `[14.999999,-90]`, `[32.000001,-90]`, `[25,-100.000001]`, `[25,-74.999999]` are rejected before any transport. This bounds candidate coordinates, not a new global scientific domain or all offset sample coordinates.

## Graph reconciliation

`Default_Provider_Transitive_Discovery_v2.json` is generated fresh from current production source. Prior graph/path registries are not generator inputs. It reproduces 154 named function nodes, 267 identifier-reference edges and 33 nested named bindings. The six imported scientific-assessment functions participate in the closure. Zero named identifier targets remain unresolved within that traversal.

This is an overapproximating **source-reference closure**, not a completed semantic call graph. Nested identifiers are traversed and the recorded edges are not assertions that every call is reachable. Local callback bindings are lexical or closed current callback bindings; `settleWithTiming` receives the caller closures, and default `retrieveOceanMemoryRows` uses its default fetch implementation. Arbitrary injected ocean-provider implementations are not included.

Source traversal also sees 1,770 member-call sites and 234 inline callback sites. These are **not semantic branch counts**. The artifact records representative unresolved semantic-effect obligations rather than promoting a syntax dump to a branch universe. In particular, callback filters in confidence/features and quality aggregation must be tied to executable domain constraints and scientific consequences.

The closure includes operations after `buildObservationSnapshot`, including history, persistence, relationship and legacy habitat construction. A full semantic slice must establish which of these affect the requested governed current snapshot/returned candidate surface. Null bearer-token execution does not prove authenticated-history branches unreachable. No Auth or database access was performed.

## Default-chain evidence

The new tests import production code and the two new fixtures only. They do not import failed qualification fixtures, old authority artifacts or quarantined v3. A synthetic transport allowlist prevents any other endpoint; the network blocker remains loaded. Coordinates and transport meaning come from explicit request coordinates and endpoint roles, never list position or request ordinal.

| Scenario / stable branch | Actual chain and consequence |
|---|---|
| Complete | Default evaluator → private provider → marine/chlorophyll/current/SST assemblies → evidence → available observation snapshot |
| `buildSurfaceWaterCharacterAnalysis::chlorophyll-concentration::nonfinite-null` | NOAA table `rows:[]` → parser `no-valid-pixel`, concentration null → caller-selected fallback source unavailable → productivity unavailable → snapshot available. V8 null alternative positive; finite control zero. Historical source line 11928 retained as metadata. |
| `getOceanConditionsAtAssessment::sst-spatial::rejected-assembly` | Future directional sample time → confidence assessment throws → settled SST assembly rejected → samples `[]`, coverage unavailable, orientation/confidence keys absent. Throw and fallback have positive coverage; baseline fallback zero. |
| `getSstSpatialStructureAtAssessment::directional-request::rejected` | Four synthetic directional request rejections → four null samples with request-failed sources → insufficient coverage; orientation/confidence structures remain present. Positive rejected-alternative coverage. |
| `getCurrentConditionsPointAtAssessment::table::empty` | Empty current table → parser no-valid-pixel branch → null speed and available outer snapshot. Positive parser branch coverage. |
| `getMarineConditions::weather::request-rejected` | Rejected synthetic weather request → provider-request-failed alternative → downstream wind layer degraded → snapshot available. Positive branch coverage. |

V8 coverage uses the narrowest containing source interval, including zero-count child overrides. A function invocation alone is not treated as branch proof. No direct downstream producer injection is used for these reachability claims.

Five specific semantic branch records are marked `REACHABLE_DEFAULT_DOMAIN`. This is not the total reachable branch count. No unreachable or operational-equivalent exclusion has been granted. The total semantic universe and individual further-review branch count remain **unknown**, not zero.

## Cache result

The SST/current point caches key requested coordinates rounded to four decimal places, use execution-clock TTL, retain finite evidence, and may share in-flight requests. Current evidence is reassessed against the explicit assessment context. The test changes only execution `Date.now` for cache hit/expiry; it leaves assessment and represented source time fixed. Production caching is untouched.

For one complete case, cold → warm changed 26 snapshot cache leaves (`status` and `ageSeconds`) plus `generatedAt`; all other observation-snapshot values compared exactly with `Object.is` leaf semantics. Warm execution made fewer requests. Expiry restored the cold request count and snapshot values except `generatedAt`. The raw difference list is retained in the JSON report, including operational timestamp values; it is not an authority inventory or deterministic digest.

An additional bounded test ran all six family cases across canonical order, reverse order, five seeded permutations, duplicate cases, subset then full, and same-process cold/warm repeats: 120 snapshots over ten execution lists. Every difference remained within the 27 exact operational paths (26 cache leaves plus generatedAt); all other leaves matched exactly. This is a direct comparison, not a stripped projection or an authority inventory.

No scientific cache mismatch was demonstrated in these cases. No broad equivalence claim follows for all cache states, rounded-coordinate collisions, concurrent in-flight sharing, represented times or failed acquisitions. Metadata was not stripped to manufacture a projection PASS.

## Work still required

1. Accepted default transport-result and normalization branches, including fulfilled missing/partial responses and error/timeout handling.
2. SST coverage/orientation/confidence thresholds, compound predicates, time and signed-zero states through the default chain.
3. Direct/gap-filled chlorophyll selection, missingness and freshness branches.
4. Current vector/spatial/relationship and temporal branches.
5. Partial weather/marine inputs and quality aggregation effects.
6. Cache identity, in-flight and all missing/failure-state equivalence.
7. Feature sample filtering, prerequisites, combinations and downstream consumption.
8. Exact semantic slice separating observation-snapshot production from subsequent history/species processing.
9. Upstream static/candidate construction constraints, independent of the fixture's eligibility flag.

Canonical/reverse/five-permutation/duplicate checks passed for the six-case subset above. Whole-universe qualification has not been run; no complete branch-covered universe exists yet. The six family cases, seven coordinate cases and three cache runs are bounded tests only. There is no new optionality count, requirement classification, producer path count, inventory digest or comparison against failed inventories. Prior 122-path/313-range conclusions are not reused.

## Preserved boundaries

`DEFAULT_PROVIDER_DOMAIN_QUALIFIABLE_SEPARATELY` remains valid as a provider-boundary finding. Arbitrary injected callbacks remain outside qualification. Leaf `available` means only non-nullish return, not scientific adequacy, eligibility, ranking or score validity. The previously demonstrated injected malformed/private/time/thenable behavior remains application-code boundary evidence. The manual 88/91 interpretation case is not an externally selectable production exploit. Exact-object replay proves pass-through fidelity only. Publication v3 does not bind provider implementation identity; no publication change is made.

No authority proposal, semantic freeze, projection v3, optionality authority or requirement authority was created. All 41 pre-existing untracked evidence/draft files are recorded with identical before/after hashes in `Default_Provider_Transitive_Preservation_v1.json`; this is a preservation manifest, **not** an authority freeze. Quarantined v3 was not imported, read as authority, modified or staged. The tests check manifest consistency without requiring those failed files as runtime dependencies.

Production producer/cache/parsers/normalization/captures/serializer/projections/assemblers/assessment/species/archive/scalar/publication/provider-qualification/freshness files remain unchanged. Task 12B.6C and Task 9E-D remain paused. `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains open and separate.

The next gate is **COMPLETE DEFAULT-PROVIDER SEMANTIC EFFECT AND BRANCH REACHABILITY REVIEW**, followed by adversarial review. This STOP does not authorize optionality, an authority proposal, a freeze or v3.

## Verification

Verification results are appended after the network-blocked regression run. All changes remain uncommitted. No provider/database/Auth/Supabase service was accessed; synthetic transport only. No environmental acquisition, staging, commit, tag, push or deployment.

Final verification: **12/12 focused tests; 60/60 network-blocked backend/shared scripts; 115 syntax modules; 46 JSON files; whitespace and `git diff --check` passed.** The final focused suite was rerun after test-only strengthening. Draft-v3 tests were excluded. Provider boundary 11, transitive STOP 10 and prior adversarial STOP 4 passed; all other discovered prior suites passed. These passes do not close the nine review obligations.

Exact new files (all untracked and unstaged):

- `backend/tests/defaultProviderTransitive.test.js`
- `backend/tests/fixtures/defaultProviderTransitiveFixture.mjs`
- `backend/tests/fixtures/defaultProviderGraphReview.mjs`
- `docs/Default_Provider_Transitive_Discovery_v2.json`
- `docs/Default_Provider_Transitive_Review_v1.json`
- `docs/Default_Provider_Transitive_Preservation_v1.json`
- `docs/Default_Provider_Transitive_Review_v1.md`

Final Git boundary: HEAD `c0d97f1f1281e99898b908af8dd9c8e1f81056d1`, branch `codex/pelora-remote-setup`; tracked and staged diffs empty. Historical untracked qualification stack and `supabase/.gitignore` / `supabase/config.toml` remain untouched. The complete per-file hashes are in the preservation manifest. No qualification-readiness claim is made.
