# Task 12B.6O — transitive producer boundary review

**STOP: ACCEPTED_PROVIDER_OUTPUT_DOMAIN_UNRESOLVED.**

`TRANSITIVE_SNAPSHOT_PRODUCER_BRANCHES_QUALIFIED` is not established. This report
does not replace the previous STOP findings with a qualification. No new authority
proposal, authority freeze or projection v3 was created. Tasks 12B.6C and 9E-D
remain paused; `UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED` remains open.

## Accepted boundary and the new blocker

The exported species-neutral scientific composition boundary is
`evaluateUnifiedOpportunityOceanConditionsV1`, with open-water and physical-structure
leaf evaluators. Scientific assessment validation is separate from HTTP/Auth.
The unified evaluator selects candidates whose supplied `eligibility.eligible`
is exactly true and dispatches supported candidate classes. The leaf evaluators
reject absent/blank coordinates, apply `Number` coercion, and enforce latitude
15 through 32 and longitude -100 through -75. Tests exercise both edges and
immediately outside them. This is a code-enforced Gulf box, not a generic
nonpolar or global qualification. The supplied eligibility flag and candidate
identity are not authenticated by these checks.

The separate HTTP wrapper is `createPeloraServer`'s `GET /api/ocean` handler.
It calls `getCoordinates` (numeric query conversion with defaults for nonfinite
values), applies the same Gulf box, obtains operational persistence context, then
calls its provider, defaulting to `getOceanConditions`. Missing query parameters
convert to zero and consequently fail the Gulf box; they are not the nonfinite
default case. The wrapper is source-traced only here: no HTTP/Auth request was
made. Its clock-defaulted assessment differs from the explicit scientific context
used by the internal diagnostic. This wrapper and species-oriented orchestration
are additional entry paths, not silently covered by the server-local graph root.

The unified evaluator defaults `oceanConditionsProvider` to `getOceanConditions`.
Leaf evaluators instead default it to null and require a function. An explicitly
injected function's result is not shape-validated: `false`, `0`, an arbitrary
string and an object with an unreviewed snapshot descendant all return
`available: true`. Only null/undefined make that leaf unavailable. Executable tests
demonstrate this through the exported unified evaluator. This is an open callback
contract, not a demonstrated production-science defect. It prevents claiming that
every accepted callback shares the default producer's closed scientific domain.
No runtime validation or other behavior was changed to resolve it.

The machine-readable STOP report records each input constraint and its origin.
Constant chlorophyll .1, current .5/.2, weather/marine values, source times,
synthetic identity, explicit location and absent bearer/history are fixture choices.
They cannot prove production caller exclusions.

## Actual default execution evidence

Six stable controlled scenarios use the exported unified evaluator **without** a
provider override. All environmental requests receive synthetic transport at the
fetch boundary; an allowlist rejects any unexpected host. The network blocker
prevents real connections. Every scenario uses explicit 25,-90 coordinates and
the same explicit assessment. A test-only execution clock advances to expire
caches; source values, scenario meaning, coordinates and assessment never depend
on request order. The synthetic eligible candidate tests accepted internal input;
it does not establish species eligibility or static candidate authenticity.

The actual chain is:

`unified evaluator → assessment guard → candidate selection → bounded worker →
class-specific evaluator → default getOceanConditions → getOceanConditionsAtAssessment
→ parsers/current assemblers → assessOceanEvidence → buildObservationSnapshot`.

| Scenario | Actual consequence |
|---|---|
| finite-control | Finite productivity evidence; snapshot available. |
| empty-chlorophyll | NOAA `rows: []` accepted; raw parser `no-valid-pixel`, null concentration. Caller resolution normalizes final chlorophyll source to `unavailable`; productivity unavailable, snapshot available. |
| future-directional-sst | Future finite directional time reaches the confidence assessment check and throws. Caller catches rejected assembly and creates unavailable spatial state with `samples: []`, no orientation/confidence. Snapshot remains available. |
| rejected-directional-sst | Individual fetch rejections are handled by `Promise.allSettled`; four missing sample records remain, with orientation/confidence and insufficient coverage. This is distinct from outer assembly rejection. |
| empty-currents | Actual parser/caller returns missing current speed; snapshot remains available. |
| rejected-weather | Weather acquisition rejection yields degraded wind quality; snapshot remains available. |

V8 precise coverage confirms the chlorophyll null alternative at historical line
11928. Its stable semantic ID is
`backend/server.js::buildSurfaceWaterCharacterAnalysis::chlorophyll-concentration::nonfinite-null`.
The finite control has count zero; the empty-table case has positive count.
V8 omits child intervals equal to their parent count, so the test uses the narrowest
containing interval, honoring zero-count overrides. No production instrumentation
or extracted replacement assembler is used.

The outer SST fallback is positively covered through future directional transport,
not a direct downstream invocation or artificially thrown assembler. The unchanged
`assessSstTransitionConfidence` throws `SST evidence timestamp after scientific assessment`;
`settleWithTiming` returns rejected status; the actual caller constructs its fallback.
This resolves the known fallback's reachability, not every fallback in the system.

## Transitive discovery and limits

The new AST discovery records **159 server-local function nodes** and **5,122
syntactic decision candidates**. These are not 5,122 proven semantic branches.
All discovery candidates remain `REQUIRES_FURTHER_REVIEW`; no unreachable or
operational-equivalent conclusions were assigned. Stable discovery IDs bind
module, function, construct and normalized-source fingerprint, with offsets/lines
as metadata. The two demonstrated semantic branches also have explicit role IDs.

This conservative local reference graph includes the previously omitted caller,
but is expressly **not transitively complete**. Imported functions, member/dynamic
dispatch, nested-function scopes, early-return effects and injected callback
contracts require further review. The test-only parser is Acorn bundled in the
installed Node runtime; no package or production dependency changed. Repeated AST
generation reproduces the saved discovery exactly. This is source-discovery
determinism, not a qualified snapshot-inventory digest.

Observed current path: current point parsing/cache, assessment-relative reassessment,
spatial samples, organization/relationships/vector projection/gradient/shear/
convergence/edge assembly, current evidence and snapshot. Observed marine path:
weather/marine acquisition settlement and parsing, caller family quality, aggregate
quality, marine assessment and snapshot. Exact captures are not requalified here.

Static candidate source construction and `resolveOpportunityCandidateBathymetryV1`
exist upstream of the species-oriented orchestration; direct scientific evaluation
accepts a supplied candidate. Static authenticity/branch closure remains unqualified.
The runtime orchestrator's prior species eligibility step is not invoked or changed.

`buildObservationSnapshot` runs before `retrieveOceanMemoryRows`. With null bearer,
history retrieval exits without database/Auth access. Later history affects
persistence/intelligence, so complete semantic-surface separation cannot be inferred
merely from statement order. No Task 12B.2 selection policy was changed.

`buildGovernedEnvironmentalFeatureObservationV1` builds requirements in source check
order, derives availability from their length, gates canonical observation/reference
on availability, and deduplicates returned requirements with `Set`. This source fact
does not resolve their complete downstream semantic authority. The former four-path
classification was not reused.

## Work deliberately left unqualified after STOP

- Complete transitive semantic branch count, reachability and enforcement groups.
- Complete static, history, provenance and requirement consumer closure.
- Optionality requalification: no reuse of the old 122 conclusions.
- Branch-complete producer inventory, path count, digest and whole-inventory comparison.
- Canonical/reverse/five-permutation/duplicate invariance of a complete new inventory.
- Full cold/warm scientific equivalence. The bounded cache sanity test checks actual
  hits and equal directional temperatures only; it does not strip metadata and claim PASS.

No inventory/proposal/freeze was generated from this incomplete model. The new
full-chain findings show why previous successful-assembler inventories cannot be
carried forward automatically: final chlorophyll availability is normalized and
the rejected-assembly spatial shape is reachable.

## Preservation, verification and next gate

The preservation artifact records before/after SHA-256 for **all 29 pre-existing
untracked qualification/draft files**, including the prior 21 protected files.
Quarantined projection-v3 contents are not read as authority or imported; only their
bytes are hashed. Production, existing tests/fixtures/docs, captures, serializer,
projections v1/v2, assemblers, archive/scalar and publication V3 remain unchanged.

The new focused suite tests boundary enforcement, unvalidated callback results,
actual parser/caller execution, branch coverage, distinct fallback states, bounded
cache behavior, reproducible discovery and preservation. Network-blocked complete
regression results are recorded under `.local/ocean-quarantine/task12b6o/regressions/`.
Passing tests reproduce a STOP; they do not establish transitive qualification.

Final verification: **10/10 new focused tests; 58/58 network-blocked backend/shared
scripts**, including the prior four-test STOP diagnostic and locked regressions.
Syntax passed for **110** non-draft modules; JSON parsing passed for **40** non-draft
files. Whitespace and staged/unstaged diff checks passed. All **29** protected
before/after hashes match. Tracked production and the index have no changes;
the six new Task 12B.6O test/fixture/documentation files remain untracked.

Next gate: **REVIEW ACCEPTED PROVIDER BOUNDARY AND COMPLETE TRANSITIVE
DEFAULT-PRODUCER REACHABILITY**. Establish the proof domains for the built-in
provider and injected callbacks without silently narrowing accepted architecture;
close imported/dynamic calls and classify semantic consequences before resuming
optionality/requirements/inventory work. No authority proposal, freeze or v3 yet.

Everything remains uncommitted. No staging, commit, tag, push, deployment,
provider/database/Auth/Supabase access or environmental acquisition occurred.
