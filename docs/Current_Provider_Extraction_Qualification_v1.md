# Current provider extraction qualification v1

**EXTRACTION PREREQUISITE QUALIFIED — REVIEWED REFACTOR DELTA**

HEAD remains `55596290561afdeaf3681afff383ab0e339aae2d`. Phase 2 remains **NOT QUALIFIED**; its worker is unimplemented and unstarted. This is a bounded extraction qualification, not full semantic composition equivalence. No worker, Phase 3, commit, push or deployment was started.

## Durable checkpoint evidence (archival pass)

The [evidence archive guide](Current_Provider_Extraction_Evidence_Archive_v1.md), [execution records and original ledgers](Current_Provider_Extraction_Evidence_Archive_v1.json), and [retained offline fixture inputs](Current_Provider_Extraction_Retained_Fixtures_v1.json) preserve the original replay commands/environment, harnesses, per-script receipts, failure comparisons, and all 21 final tested-byte identities locally. This is an evidence-only addition; no qualification suite was rerun. Original 23-file/documentation hashes remain historical. Statements below about HEAD, six changed paths, staging and no commit/push describe the completed qualification session before the separately authorized checkpoint, not the eventual checkpoint commit state.

## Authorized TIME correction

The permanent [selector regression](../backend/tests/currentProviderSelectorBinding.test.mjs) failed against the entering adapter: a timestamp getter validated a UTC timestamp, then emitted `(last)` for both variables. The pre-fix TAP receipt is retained.

[currentProviderRequest](../backend/currentProviderAdapter.mjs#L115) now reads mode once and, only for TIME, time once. Validation and both variable selectors use those retained primitives. Existing strict timestamp syntax/calendar checks are unchanged. No coercion, LATEST fallback, caller mutation/freezing or new authority flag was added. Invalid selectors and throwing accessors fail before transport. The acquisition composition has no subsequent selector reread. There is no separate selector metadata field to rewrite: URL selectors use retained values; response metadata remains provider-derived.

The only server change this pass removes the confirmed-unused `currentDirectionDegrees` import. The interactive delegate still passes actual `fetchJson` and literal `{mode:'LATEST'}`. The adapter parser, scientific helpers and acquisition composition are byte-preserved from the entering candidate. TIME is a separately authorized coordinate-selector capability; it does not establish provider revision or temporal-support authority.

## Qualification evidence

| Check | Current result |
|---|---|
| Exact pre-fix getter regression | Expected failure: 0/1; URL contained last |
| New binding controls | 29/29; queries and actual fake-transport arguments checked |
| Existing adapter | 48/48; original file unchanged |
| Exact baseline characterization | 40/40 reproduced unchanged; included in adapter tests |
| Existing analyzer | 17/17; original file unchanged |
| Correspondence / negative controls / ordinary selectors | 12/12, including all eight negative controls |
| Focused total | 106/106, overlapping rows above |
| Installed adapter + binding replay | 77/77 |
| Phase 1 | 105/105 on baseline and candidate |
| CURRENTS V3 | 14/14 on each side |
| Normalization runtime / adversarial / producer / transitive | 15/15, 13/13, 2/2, 10/10 on each side |
| Full current-script execution | 88/88 attempted and terminal receipts on each side; not an all-green claim |
| Baseline raw current profile after setup replay | 70 exit-zero, 18 nonzero; 2078/2124 node:test passes; 46 failures; 782 manual PASS records |
| Candidate raw current profile after setup replay | 70 exit-zero, 18 nonzero; 2075/2124 node:test passes; 49 failures; 782 manual PASS records |
| Isolated installation | Backend package and locked root dependencies pass; 42 root packages from local npm cache; no registry retrieval this pass |
| Operational network attempts | 0; fake transport and network-denial guard |

The 29 binding controls include the exact seven-read reproduction; changing mode/time getters; throwing second reads; invalid first values; throwing accessors and proxy traps; mutation during shape inspection; mutation after acquisition starts; frozen inputs; strict valid TIME and LATEST. No scientific expected results were changed.

A combined, process-shared 170-case run reproduced the same six failures on baseline and candidate: three historical current-locality assertions and three cache/fixture-order assertions. Fresh-process normalization suites pass as listed. Test overlap is not unique coverage.

## Failure-by-failure accounting

[Machine-readable report](Current_Provider_Extraction_Qualification_v1.json) retains every paired execution, exact assertion title and baseline/candidate diagnostic. Equal failure totals are not used as equivalence evidence.

- **A — reproduced baseline debt:** historical numeric/coercion/locality expectations and historical source inventories still fail at the recorded assertions. They were not repaired, skipped or relabelled green.
- **B — reviewed refactor deltas:** the obsolete source-closure test changes from the historical `50 !== 33` failure to the explicit correspondence contract. Four candidate-only assertions compare preserved historical test/fixture hashes: revisedSemanticModel, snapshotBranchOptionalityAdversarial, snapshotProducerQualificationV2 and sourceNormalizationRegressionGovernance. They identify the approved pre-existing source-closure/fixture adaptations. Source-hash and source-offset diagnostic changes in cacheIsolatedSnapshotProducer, exactScientificEvidence, revisedSemanticModel, snapshotBranchOptionalityAdversarial snapshotProducerQualificationV2 and archived transitiveProducerBoundary are recorded separately. Historical expected hashes/artifacts remain unchanged.
- **C — unexplained/behavioral regressions:** none demonstrated in completed bounded comparisons. The earlier TIME defect is corrected by this pass. Resource outcomes, if any, remain explicit in JSON and never become PASS.

Eight paired suites initially lacked ignored diagnostic output parent directories in the isolated trees; creating those temp directories resolved the setup errors. Initial isolated install replays omitted application/shared source directories; those copy omissions were corrected without repository edits. A Windows archive extraction warning affected tracked dependency executable symlinks; the controlled dependency copies/install supplied the required package tree. These setup failures remain in receipts.

## Archival resource controls

The unchanged snapshotBranchOptionality historical harness timed out at the same 180-second limit on both baseline and candidate (512 MiB V8 old-space setting). Neither produced a terminal TAP case count. These are observed timeouts, not claimed OOMs or passes. Archived transitiveProducerBoundary completed 8/10 on both sides: one frozen source-line assertion and one historical source-hash assertion, with their exact baseline/candidate values retained. The current producer and transitive replacement suites pass independently.

## Source correspondence and open obligations

[Raw graphs](Current_Provider_Extraction_Graphs_v1.json) retain baseline 154 functions / 50 callbacks and candidate 158 / 50, plus all 263/270 identifier/transport-reference edges. No node is subtracted or excluded. The four extra declarations remain: duplicated age helper; extracted request construction plus new TIME support; extracted parser; injected-transport acquisition composition. The five relocated helpers and parser tail retain their source proofs. Current declaration locations and hashes are recorded in the graph and JSON report.

The correction changes only the request declaration, source hashes/locations and its selector validation member-call expressions. Compared with the entering candidate, edges, callback identities/targets/binding hashes, unresolved targets and actual fetchJson transport binding are unchanged. Member-call obligations remain visible: 1,739 baseline / 1,747 candidate sites. There remain 33 known/closed callback records and 17 distinct out-of-allowlist imported callback bindings producing 47 unresolved invocation records. These are retained baseline obligations, not a complete semantic call graph.

Both `semanticGraphComplete` and `semanticBranchUniverseEstablished` remain false. The historical default-provider verdict remains `DEFAULT_PROVIDER_SEMANTIC_BRANCH_MODEL_UNRESOLVED`. Its nine obligations remain open: transport-result domain, SST spatial confidence, chlorophyll selection, current relations, marine quality, cache semantics, feature prerequisites, output boundary and static caller boundary. Extraction qualification does not qualify that broader scientific review or exhaustive member effects.

## Preservation and scope

This pass changes exactly six repository paths:

- `backend/currentProviderAdapter.mjs`
- `backend/server.js`
- `backend/tests/currentProviderSelectorBinding.test.mjs`
- `docs/Current_Provider_Extraction_Graphs_v1.json`
- `docs/Current_Provider_Extraction_Qualification_v1.md`
- `docs/Current_Provider_Extraction_Qualification_v1.json`

Runtime fingerprints:

| File | Before SHA-256 | After SHA-256 |
|---|---|---|
| backend/server.js | `8a1a771f584443cb4524f75f163ef9f6982472622eae66550bd24c30aec62846` | `bb4002849a6778926de07a5999fa9dc469f12bf2e259e5519e77728a736ee96d` |
| backend/currentProviderAdapter.mjs | `22e2e93d912d14254937e45cd72fda21cd15490d142d142bb9784c669ae932b1` | `58ee5e1c49e1e9b8eca714ba77f071bd1027a68f8987429d530280a552fd0534` |

All other entering tracked/untracked bytes are preserved, including the original 48 adapter tests, 17 analyzer tests, 40-case golden characterization, historical review/discovery artifacts and excluded Supabase files. Nothing is staged. Production services, Render, databases, migrations, Receipt Writer and main remain untouched.

Syntax checks pass for all 19 candidate JavaScript files; 95 actual relative imports resolve; JSON and whitespace checks pass. New runtime/test lint is clean. Full candidate lint retains only the two existing server unused-variable findings (compatible and temporalOceanExplainability); the extraction-added unused import is gone. Evidence directory: `C:/Users/User/AppData/Local/Temp/pelora-time-binding-50b202f705c747fc8e558ac87b17290f`.

**Next gate:** human review of this extraction-only correction and its baseline-relative receipts. Do not start the worker. Phase 2 remains NOT QUALIFIED.

---

## Historical interrupted qualification — preserved verbatim below

The following report records the earlier STOP, before the newly authorized correction. Its then-current hashes, runtime blocker, partial results and statements that no runtime correction was authorized are historical, superseded by the current qualification above.

# Current provider extraction qualification v1

**EXTRACTION PREREQUISITE NOT QUALIFIED**

Development HEAD remains `55596290561afdeaf3681afff383ab0e339aae2d`. Phase 2 remains NOT QUALIFIED. The worker was neither implemented nor started. This pass does not establish full semantic composition equivalence.

## Runtime blocker — explicit TIME selection

At [currentProviderRequest](../backend/currentProviderAdapter.mjs#L115), an enumerable getter-backed selector passes the existing two-key TIME shape and timestamp validation, then supplies a different value during URL construction:

```js
let reads = 0;
const selector = {
  mode: 'TIME',
  get time() {
    return ++reads <= 6 ? '2026-10-01T00:00:00.000Z' : 'last';
  }
};
currentProviderRequest(25, -90, selector);
```

Observed: seven reads; emitted query `u_current[(last)][(25)][(-90)],v_current[(last)][(25)][(-90)]`. The values validated are not necessarily the values used in the request. No provider was contacted. This is a new-capability adapter-boundary defect, not a claimed live incident or an interactive LATEST regression. Runtime files were left unchanged, and remaining test processes were stopped once this was demonstrated. No authority flag or caller-only restriction was invented to dismiss the reproduction.

## Four additional declarations

All identities below are qualified by `backend/currentProviderAdapter.mjs::`. Hashes cover the raw declaration source; the complete graph artifact also preserves full-module hashes and locations.

| Declaration | Classification | Line | SHA-256 |
|---|---|---:|---|
| getAgeHours | DUPLICATED_EXISTING_PURE_AGE_HELPER | 109 | `c00df6fe582fd01920c81c288452623331b7a15d19f427df69e79310f8e9f23c` |
| currentProviderRequest | EXTRACTED_URL_CONSTRUCTION_PLUS_NEW_EXPLICIT_TIME_SELECTOR | 115 | `35c10ba0446156db43dc73cdc2936f483928ecf3b7f60228f7786244dfdf76f9` |
| parseCurrentProviderResponse | EXTRACTED_EXISTING_INLINE_PARSER | 131 | `951cebd06c94f4a5facf828333f14e814f274d2b0e542691a837408faf38ccec` |
| acquireCurrentProviderPoint | ASSESSMENT_AND_INJECTED_TRANSPORT_DELEGATION | 303 | `ea3b350e0b10c054117b5bad1ce21cfc3bf6fae921d0c108181e8f2e60ea5b6d` |

- **getAgeHours:** Duplicate the existing pure server age helper in the adapter module; original server helper remains. Baseline: backend/server.js::getAgeHours. Inputs: timestamp and required scientific assessment. Outputs/errors: scientific age or the existing assessment validation error. Effects: No I/O; delegates to the same scientificAssessment module. Reachability: LATEST and TIME parser paths.
- **currentProviderRequest:** Extract URL construction and add the separately authorized explicit TIME selector. Baseline: URL/query block of backend/server.js::getCurrentConditionsPointAtAssessment; TIME validation has no baseline equivalent. Inputs: requested latitude/longitude and LATEST or TIME selector. Outputs/errors: URL or TypeError; newly demonstrated selector validation-to-use split is a blocker. Effects: URL construction and selector property reads; Object.keys, regex/date/string validation. No transport. Reachability: LATEST via the interactive delegate; TIME only via adapter API.
- **parseCurrentProviderResponse:** Extract the existing response parser body without scientific changes. Baseline: Tail beginning const columns = in backend/server.js::getCurrentConditionsPointAtAssessment. Inputs: payload, requested coordinates, scientific assessment. Outputs/errors: Same parsed scientific values, resolved/requested coordinates, provenance, availability and errors. Effects: Read table fields; no I/O; valueAt local binding preserved. Reachability: LATEST and TIME acquisitions.
- **acquireCurrentProviderPoint:** Compose existing assessment resolution, explicit per-call transport and extracted parser. Baseline: Assessment and await fetchJson blocks of backend/server.js::getCurrentConditionsPointAtAssessment. Inputs: coordinates, assessment, mandatory transport and selector. Outputs/errors: Parsed point; propagates transport/parser errors; rejects absent transport. Effects: One supplied transport invocation. Interactive binding is actual fetchJson; no global fallback. Reachability: Interactive LATEST; explicit adapter TIME with supplied transport.

The TIME selector is new. The interactive server delegate still explicitly passes `{mode:'LATEST'}` and actual `fetchJson`. The existing 40 exact baseline comparisons cover request URLs, values, requested/resolved coordinates, metadata, errors, signed zero and normalized CURRENTS capture serialization. They do not qualify all possible selector objects.

## Source and graph correspondence

[Complete raw baseline/candidate graphs and source proofs](Current_Provider_Extraction_Graphs_v1.json) retain 154/158 declarations and 50/50 callback records. Identifier/transport-reference edges are 263/270. These are not semantic-call-graph completeness counts.

Five helpers relocate from server to adapter: `metersPerSecondToKnots`, `currentDirectionDegrees`, `classifyCurrentStrength`, `currentCompassDirection`, `resolveProviderCoordinates`. Their declaration contents, and the duplicated `getAgeHours`, are identical after explicit CRLF-to-LF comparison. Raw fingerprints remain separately recorded. The parser tail from `const columns =` through the return/closing brace is unchanged after the same normalization. The dataset constant is moved unchanged.

The server point-acquisition function becomes a literal LATEST delegate. Seven outgoing identifier edges transfer to parser/acquisition owners, with fourteen added records for composition, duplicate age-helper references and transport binding. All caller/callee records are retained in the graph/JSON report. The injected fetchJson invocation is also represented as a derived closure-reference edge; these two graph records do not mean two transport calls.

Callbacks are compared by module-qualified owner, target, resolution and binding hash, not count. The parser's `valueAt` binding transfers with identical normalized content. The 33 pre-existing locally known/closed callback records and 17 distinct out-of-allowlist imported-target records remain visible. Those 17 produce 47 unresolved invocation records on each side. The imported names are `bindCenterSstSpatial`, `registerScalarPublication`, `roundFinite`, `decodeNormalizedOceanSnapshot`, `sourceNumber`, `sourceScaledNumber`, and `normalizationCacheKey`; none is newly introduced runtime debt. No zero-unresolved or exhaustive member-effect qualification is claimed.

Member-call sites are 1,739/1,747. After owner mapping, the old query join is replaced by selector-dependent join construction; eight member-call sites are added for selector shape, regex, date and string validation. Existing parser/helper call content remains bound. The accessor-backed selector defect demonstrates why this structural correspondence alone is insufficient to qualify those new effects.

## Refactor-aware test contract

The entire legacy source-closure assertion was reviewed, including its final historical JSON equality. The original historical files and original test at the baseline commit remain available unchanged; neither historical discovery nor review JSON was regenerated.

- The source-closure test now uses the narrowly versioned exact extraction correspondence. It retains deterministic discovery, production entry points, module identities, actual fetchJson binding, all callback/member records, unchanged helper/parser source proofs and both false completeness flags. Unknown source, edge, callback or effect deltas fail.
- The marine inventory still checks nine capture paths and consumer paths. Converter existence now requires the reviewed reachable declaration instead of a declaration physically in server.js.
- The analyzer exposes complete member-call records plus callback-binding/call hashes. It does not drop adapter nodes, subtract counts or pretend identifier references are semantic calls.
- Eight in-memory negative controls reject a missing helper, added dependency, added callback, redirected transport, changed interactive selector, lost no-valid-pixel handling, altered availability and same-count callback substitution.

## Results and limits

| Check | Result |
|---|---|
| Existing analyzer suite | 17/17 pass; file unchanged |
| Existing adapter suite | 48/48 pass; file unchanged |
| Exact baseline characterization | 40/40 reproduced against HEAD; included in adapter suite |
| New correspondence/negative-control/TIME tests | 12/12 pass before the additional accessor reproduction |
| Phase 1 | 105/105 on baseline and candidate |
| Focused Phase 1 + current V3 + normalization | 149/149; overlapping coverage |
| Normalization transitive current | 10/10 on baseline and candidate |
| Installed-dependency adapter replay | 48/48 pass |
| Supplemental test/fixture lint | Pass |
| Runtime syntax / defined backend checks / isolated import | Pass |

The initial unfiltered 88-script comparison started all 88 on each side: each had 58 exit-zero scripts, 29 nonzero scripts and one timeout. Baseline TAP counters: 2,002 tests, 1,939 pass, 63 fail. Candidate: 2,002 tests, 1,936 pass, 66 fail. Zero skipped/cancelled counters; timed-out suites have no terminal case totals. These are initial observations, not a final all-green profile. The two additional historical suites were run separately; one timed out and one reproduced its historical failures.

Paired replays resolved initial missing-package setup failures (four suites, 53 cases per side) and reproduced the marine inventory result after its contract change (151/152 each, solely the pre-existing null-coercion assertion). Existing local SST evidence was copied into isolated directories for legacy tests without acquiring data. Extended producer and retained-fixture replay was stopped on the runtime defect; see JSON for exactly completed versus interrupted records. No timeout is relabelled OOM or PASS.

Failure accounting:

- **A — reproduced baseline failures:** original source closure fails `50 !== 33`; historical numeric/coercion and frozen-source assertions remain explicitly recorded. Setup failures are distinguished from application failures.
- **B — reviewed refactor contract deltas:** the source-closure/marine-location changes above, plus exact historical fingerprint mismatches for the authorized test/fixture adaptations. Original preservation ledgers are unchanged; their failing assertions are not silently waived or regenerated.
- **C — new behavior:** TIME validation-to-request splitting is an extraction blocker. Incomplete extended runs also prevent claiming complete qualification.

Supplemental runtime lint retains two baseline unused-variable findings and adds an unused `currentDirectionDegrees` import at server.js:1. No runtime cleanup was performed.

The isolated backend-package install passed. The root offline lockfile install initially lacked cached xtend; a subsequent isolated lockfile install with lifecycle scripts disabled installed 42 packages successfully. Npm registry package retrieval occurred. Operational provider/database network attempts remained zero under the test denial guard.

## Remaining authority limits

The historical verdict remains `DEFAULT_PROVIDER_SEMANTIC_BRANCH_MODEL_UNRESOLVED`. The nine open obligations remain: transport-result domain, SST spatial confidence, chlorophyll selection, current relations, marine quality, cache semantics, feature prerequisites, output boundary and static caller boundary. Both semantic completeness flags remain false. No broader scientific review, member-effect universe or semantic branch universe is qualified.

## Preservation and changed scope

Runtime fingerprints unchanged from the start of this pass:

- `backend/currentProviderAdapter.mjs`: `22e2e93d912d14254937e45cd72fda21cd15490d142d142bb9784c669ae932b1`
- `backend/server.js`: `8a1a771f584443cb4524f75f163ef9f6982472622eae66550bd24c30aec62846`

Existing files changed during this pass only:

- `backend/tests/defaultProviderTransitive.test.js`
- `backend/tests/exactMarineCapture.test.js`
- `backend/tests/fixtures/moduleSourceClosureFixture.mjs`

New files in this pass:

- `backend/tests/currentProviderExtractionReview.test.mjs`
- `backend/tests/fixtures/currentProviderExtractionReview.mjs`
- `docs/Current_Provider_Extraction_Graphs_v1.json`
- `docs/Current_Provider_Extraction_Qualification_v1.md`
- `docs/Current_Provider_Extraction_Qualification_v1.json`

All other starting tracked/untracked file bytes, including the existing adapter tests, 17 analyzer tests, 40-case baseline, historical discovery/review JSON and excluded Supabase pair, remain unchanged. HEAD/ref state is unchanged and nothing is staged. Existing uncommitted extraction changes are preserved. Starting fingerprints and raw logs: `C:/Users/User/AppData/Local/Temp/pelora-extraction-review-907fe2674b2248eb91beb9ba3d23c935/`. [Machine-readable report](Current_Provider_Extraction_Qualification_v1.json).

Production, database, Render, main, Receipt Writer and migrations remain untouched. No commit, tag, push, worker implementation/startup or Phase 3 work occurred.

**Next gate:** human review of the selector validation-to-use defect. Runtime correction requires authorization. After correction, restart extraction-only qualification; do not begin the worker.
