# Task 11E — SST Ocean State worker foundation v1

## Verdict and authority

Repository-only worker foundation; **NOAA OPERATIONAL QUALIFICATION NOT ESTABLISHED**.
Freshness is **UNASSESSED / THRESHOLD_DECISION_REQUIRED**. No new environmental
acquisition, metadata request, scheduler, server route, database, deployment or
normal-startup integration is performed. Task 9E-D remains paused. OSTIA remains
a future resilience candidate; no fallback or evidence-independence claim exists.

Contract: `pelora-sst-ocean-state-worker-v1`; source boundary:
`pelora-noaa-sst-source-v1`. Ports must be explicitly injected by trusted server
code. There is no environment switch, browser trigger, timer or default transport.
This is not a continuously running operational service.

## Audit at b5f07dffa6bdedb1b0b6d1bfd804e72bd4c67144

- `review/noaa-sst-pilot/acquire.py`: one-shot manual TLS-byte-bounded acquisition,
  pinned index/checksum/time/destination. Its socket budget is useful precedent;
  its manual filesystem/time/one-frame responsibilities are not a production worker.
- `pilot.mjs`: reviewed physical encoding, exact geometry and adapter qualification
  are reusable knowledge. Its fixed checksum/date and local exclusive-create/fsync
  archive are review-only. No production module imports review code.
- `netcdf.mjs`: narrow NetCDF-3 parser, no record-variable support. An isolated
  copy in `backend/oceanState/noaaNetcdf.mjs` avoids coupling a future worker to a
  review harness. It remains deliberately limited; unfamiliar representations fail.
- SST adapter validates explicit qualification and supplies the locked product
  frame. Archive handles immutable identity/collisions/durability acknowledgement.
  Scalar delivery still reads exact archived evidence. None is changed.
- Task 11B remains an additive, disabled-by-default **synthetic** runtime branch.
  This worker does not enable it or expose NOAA through it.
- `backend/fields/datasetRegistry.js` / `fieldService.js`: current/bathymetry cache
  and display selection are request-oriented; the current product's 96-hour rule
  is not an SST policy. `server.js` observation freshness rules, including 72-hour
  classifications, are not automatically applicable to this L4 product.
- Existing Ocean Memory observation/intelligence snapshots and persistence pair
  gates are separate consumers, not this immutable archive or a latest SST catalog.
  Server startup constructs the HTTP server and conditionally listens. No governed
  NOAA background maintenance/four-hour publication worker was found to extend.

New scope only: three backend foundation modules, one focused test file and this
document. Task 11D, 11A–11C, all four scientific contracts and dependencies remain
unchanged.

## Source and qualification

Exactly NOAA/NESDIS/OSPO `Geo_Polar_Blended_Night-OSPO-L4-GLOB-v1.0`, version 1.0,
GDS 2.0, SST / ANALYSIS / L4, distributed by NOAA OceanWatch ERDDAP
`noaacwBLENDEDsstDaily` at `oceanwatch.pifsc.noaa.gov`. No mirrors, day/night variant,
reanalysis substitution or alternate representation is selected.

The adapter profile remains the reviewed **Task 11D pilot-only** registry, pinned
by canonical SHA-256 `1a340319a1ba613a57d829c0d2671de91511847732760c8c0e8cf97ba3efb839`.
This does not extend operational authority to every future frame. Before a worker
can download, an explicit authorization callback must approve that candidate and
the pinned profile. Before a pointer can advance, a separate assessment must
admit the exact archive receipt under an identified reviewed policy. Tests use
`synthetic-test-admission-only-v1`; it is not a shipping freshness rule.

## Discovery is separate and side-effect free

`parseDiscovery` consumes supplied bytes and response metadata; it neither acquires
values nor writes storage. It verifies a single returned UTC time coordinate,
source locator, response size and schema, and records SHA-256, body bytes,
discovery time and optional **response** validator. No date arithmetic or assumed
consecutive indices is used. Empty time rows produce NO_CANDIDATE.

The exported future request manifest is:

```text
GET https://oceanwatch.pifsc.noaa.gov/erddap/griddap/noaacwBLENDEDsstDaily.json?time%5Blast%5D
Maximum accepted body: 4096 bytes
Retries: 0; redirects: 0; time coordinate only
```

**This request was not executed in Task 11E.** A future transport must bound actual
transfer, retain exact discovery bytes/receipt, and expose errors without retry or
source substitution. The pure parser's body limit alone is not a wire-transfer cap.
HTTP Date/Last-Modified/ETag on a generated discovery response are never promoted
to selected-object revision or provider publication time. Both provider timestamps
remain null. A future verified object revision needs a separate qualification.

Candidate comparison returns NO_CANDIDATE, SAME_AS_QUALIFIED, NEW_CANDIDATE,
SOURCE_REGRESSION, AMBIGUOUS_REVISION or DISCOVERY_FAILURE. SAME_AS_QUALIFIED requires
matching non-null qualified revision identity. Same nominal time without a revision
is AMBIGUOUS_REVISION, not proof that the provider's bytes are unchanged. The worker
reports REVISION_REVIEW_REQUIRED and does not redownload. Daily progress may be
discovered, but retrospective in-place corrections are not detectable from this
one-coordinate endpoint. That is an explicit operational qualification gap.

## Acquisition and normalization boundary

NEW_CANDIDATE only, after explicit authorization and an atomic one-attempt claim:
request NetCDF-3 physical values for analysed_sst, analysis_error and mask, plus
required axes/time. Gulf bounds −98..−80, 18..31 map explicitly to 262..280°E.
Fixed qualified spatial indices are latitude 2160:2419 and longitude 5240:5599,
stride one. The time coordinate selector comes from discovery, not a fabricated
calendar/index relation. Because ERDDAP coordinate selection can select nearest,
the returned decoded time MUST equal the advertised time exactly.

`acquireBounded` requests no redirects/retries, identity encoding, and a 4 MiB
ceiling. It checks response authority/status, Content-Length when supplied, pulls
at most the remaining budget, hashes exact bytes, requires complete-body state,
and closes on failure. No real network transport is implemented or invoked here.
**Injected transport must enforce the actual transfer ceiling below buffering,
prefetch and TLS. Accepted-body accounting is not proof of bounded socket I/O.**
The retained pilot's socket implementation is a precedent, not automatic runtime
qualification of this port. No hidden pagination, global fallback or variable expansion.

Raw storage must conditionally retain exact bytes and first receipt, acknowledging
checksum, byte count and receipt identity. Normalized evidence is a distinct object.
Raw-retention failure stops archive qualification. Partial/uncertain attempts are
not silently retried. Accurate acquisition/processing/assessment times are supplied
explicitly by the caller for the recorded iteration; no clock is fabricated. Future
live orchestration must capture actual completion times at the relevant boundaries.

Validation pins product/version/GDS, exactly 1×260×360, Float32 center axes, physical
packing/fill conventions, exact returned time, foundation SST meaning and error SD
meaning. Provider valid ranges are pinned (SST 271.15–313.15 K in served Float32,
error 0–5 temperature-difference degrees). Fill is detected before transformation.
Only established Gulf mask 1=water and 2=land are accepted; unfamiliar masks require
review. Finite SST on land fails. The adapter preserves missingness, Kelvin SST,
aligned uncertainty in K without an absolute offset, mask, provenance and lineage.
WGS84/EPSG:4326 mapping remains the explicit Task 11D qualification. Longitude minus
360 is a declared delivery representation, not regridding.

## Identity, revisions, idempotency and concurrency

An advertised candidate key includes exact product/distribution/time/revision.
Without revision it is a conservative **one-attempt coordinate key**, not a claim
of immutable provider bytes. Raw SHA-256 then identifies acquired bytes. The frame
ID binds raw checksum and any supplied reviewed revision; the archive separately verifies scientific-content digest,
full-frame digest and receipt digest. Acquisition provenance affects normalized
content under the locked contract: therefore retries MUST reuse the first retained
receipt/frame, never regenerate timestamps to pretend to refresh it.

`state.claim` requires an external atomic persistent create-if-absent. At most one
attempt per key is permitted, including failures. No process-local mutex is presented
as distributed safety. A crashed or uncertain claimed operation requires separate
operator reconciliation; no automatic lease expiration/reacquisition exists here.
Completed candidates can be reassessed/reused without another download.

Archive writes use the unchanged conditional-create boundary; pending, malformed,
failed or colliding acknowledgements cannot advance the pointer. Reuse reads and
checks the exact archive receipt, frame/content digests, nominal time, revision,
raw checksum and derived display domain. Source and normalized identities are not
interchangeable. State/raw/archive ports have no production implementation here.

Same-time changed revision/checksum remains review-required. `revisionRelationship`
records original/proposed frame references and never selects a winner. Tests archive
two in-memory revisions and reread the original. An already-bound publication stays
bound to the original. Automatic same-time acquisition/qualification is intentionally
blocked; a future separately authorized revision workflow must retain both.

## Freshness evidence and decision

No live metadata observations were added. First-party **retained** sources, observed
2026-09-24 in Task 11D:

- [NOAA distribution metadata](https://oceanwatch.pifsc.noaa.gov/erddap/griddap/noaacwBLENDEDsstDaily.das):
  DOCUMENTED daily foundation-SST map; 2002–2016 reanalysis versus 2017 onward NRT.
  This is rolling documentation captured locally, not a new availability check.
- [PO.DAAC product catalog](https://podaac.jpl.nasa.gov/dataset/Geo_Polar_Blended_Night-OSPO-L4-GLOB-v1.0)
  and retained CMR collection C2036877745-POCLOUD: product 1.0 spatial/identity context.
- OBSERVED retained latest-time JSON: 160 bytes, SHA-256
  `557505e904193c8878823520a3277d7f1e37b23e34743f3648a455994e4bca0d`,
  discovery receipt time 2026-09-24T15:54:43.2338868Z, advertised
  2026-09-22T12:00:00Z. Independent selected coordinate at index 8730 agrees.
  This is roughly 51.912 hours of discovery lag, not publication latency.
- OBSERVED retained value acquisition completed 2026-09-24T16:00:17.581975Z:
  52.00488361 hours acquisition lag. One frame only.
- UNKNOWN: present newest coordinate, repeated advancement, typical/p95 lag,
  correction frequency, availability/SLA and complete temporal coverage. A daily
  product description is not proof of consecutive daily coordinates or serving SLA.

Freshness computes evidence age = assessment − nominal time; separately discovery
lag and acquisition lag. None is provider-publication latency. A subsequent worker
run increases age while preserving original acquisition and nominal timestamps.
Future nominal coordinates fail discovery qualification.

**Policy proposal: THRESHOLD_DECISION_REQUIRED.** Future AVAILABLE/CURRENT-ENOUGH,
AGING, STALE and UNAVAILABLE decisions must be product- and consumer-specific.
Do not copy chlorophyll 72h or current 96h. To choose hours, collect a governed series
of bounded discoveries spanning ordinary days, weekends and outages, record actual
advancement/gaps and lag distribution, and review intended SST use with four-hour
publication reuse. A numeric threshold is not defensible from one observation.
Until approved, assess returns THRESHOLD_DECISION_REQUIRED and no pointer advances.

## Mutable pointer and failure truth

`latest-qualified-sst` is a mutable versioned catalog pointer to exact immutable
archive/frame/content/receipt identity, original discovery/acquisition/processing
times, explicit admission assessment and separate presentation domain. It is not
scientific identity. `compareAndSet(expectedVersion,value)` requires an externally
atomic durable acknowledgement of the exact value/version. Conflicts report failure;
they do not overwrite another worker's result or claim acceptance.

Failure statuses include discovery/acquisition/validation failure, archive statuses,
state unavailable, already attempted, revision review required, threshold decision
required/inadmissible, pointer conflict and sanitized worker failure. An uncertain
storage mutation requires reconciliation; an acknowledgement failure cannot claim
success. Reports retain the last verified pointer and its age as read at iteration
start, alongside the failure. They do not assert it remains admissible or relabel it
as newly observed. Concurrent updates may have advanced the external pointer since
that snapshot; a conflict does not roll it back. No payload/errors/secrets are logged.

## Timescales, display and consumers

CONTINUOUS OBSERVE discovers/acquires provider evidence independently of captains.
FOUR-HOUR GOVERNED PUBLISH can pin the same admissible archive receipt repeatedly;
it neither triggers six SST downloads nor fabricates six analyses daily. A later
NIGHTLY LEARN/AUDIT references the exact environmental evidence used/available,
separately from private report evidence and association policy. None is implemented.

Scheduling contract: a future approved background scheduler supplies iteration ID,
actual boundary times, trusted ports and explicit authorization/admission policy.
Run one iteration, record its deterministic outcome, and apply separately reviewed
backoff/reconciliation policy. No scheduler frequency, storage vendor, retention,
deletion, retry cadence or cloud infrastructure is selected.

`completeFrameDomain` consumes already-validated complete-frame Kelvin cells and
missing reasons. It computes floor(min °F) and ceil(max °F), then exact presentation
Kelvin endpoints: no fixed 82–89, viewport input, clipping or scientific transform.
A constant whole-degree domain is explicitly marked constant, never divided by zero
here; later presentation must handle it without inventing scientific range. Domain
identity remains separate from science; final tiles additionally key by immutable
scalar derivative, renderer/ramp, mask/display policy and XYZ per Task 11D.

Relative Thermal Context Rule remains locked: absolute state plus relative structure,
no universal warm/cool fishing value, species meaning deferred. Date comparisons
must share one absolute domain across compared frames. Raster pixels never enter
numeric inspection, Signals, gradients/front science, Opportunities, eligibility,
scoring, confidence, persistence, historical reconstruction, Fishing Log association
or learning. No private/species/catch fields or opportunity logic are introduced.

## Remaining operational gates

Observed cadence/revision detection; approved product-specific admissibility/freshness;
production qualification/terms/reliability; independently verified actual-transfer
transport; accurate live boundary timestamps; durable raw/archive/ledger/CAS ports;
crash reconciliation; scheduler/monitoring deployment and outage policy; production
retention/storage choices and physical mobile/basemap gates remain separate work.
An existing pilot receipt would need an explicit, validated catalog import that
preserves its original frame/receipt/time; this module does not silently reidentify it.
OSTIA qualification/resilience and cross-source lineage remain unresolved separately.

## Verification

Focused tests use retained NOAA bytes only, plus explicitly synthetic in-memory
mutations for future coordinates/revisions. No mutated artifact is written to the
retained evidence archive. Port fakes model atomic outcomes; their durable flag is
a test assertion, not a production storage claim. Regression commands use the
existing network-denial preloader. Frontend/build are unaffected; no frontend edit.

Final offline results: 36 worker tests; 27 retained NOAA pilot; 23 display-scale;
19 SST adapter; 19 numeric integrity; 17 frame; 36 archive; 44 scalar delivery;
22 Task 11B. All 26 backend/shared scripts passed. Focused frontend regressions:
12 Task 11A, 12 Task 11C, 8 raster, 10 historical mask, 6 final presentation boundary.
No full frontend suite/build rerun was needed because no frontend/dependency file
changed. New-module syntax, new-file whitespace and tracked Git diff checks passed.
Six retained scientific artifact hashes were reverified unchanged.

## Final adversarial review (supersedes initial verification above)

Review of the existing implementation, not a new worker implementation. No live
qualification or new environmental evidence was obtained. Contract remains
`pelora-sst-ocean-state-worker-v1`. Changes remain within the five Task 11E files.

### Demonstrated defects and narrow corrections

1. An unknown discovery status with a candidate returned NEW_CANDIDATE. Unknown,
   malformed and contradictory status/candidate combinations now resolve to
   DISCOVERY_FAILURE. They cannot trigger acquisition.
2. Freshness returned −24 hours for assessment before nominal time. All negative
   evidence/discovery/acquisition lags now fail. UTC/calendar checks reject malformed
   dates and unsupported submillisecond precision instead of silently truncating an
   exact source coordinate. With a verified old pointer but an invalid earlier
   assessment, the worker reports INVALID_ASSESSMENT_TIME, retains its reference,
   returns no negative age, and performs no discovery/acquisition.
3. Configuration inherited through a prototype enabled the worker, and a getter
   could supply authorization. The configuration now requires exact own data
   properties before destructuring. Authorization responses still require the exact
   profile digest and literal boolean true. No environment/request enablement exists.
4. The pure discovery parser accepted a future coordinate and extra value-bearing
   JSON keys. Both now fail at the parser boundary (not merely the worker).
   Duplicate/multiple/out-of-order rows fail because this single-latest-coordinate
   response permits at most one row. This does not inspect or certify the full axis.
5. Coordinate units and time/axis dimension declarations were not checked. Radians,
   scalar-time declarations and incorrect axis dimension references now fail the
   product-specific validation boundary, alongside existing exact centers/order.
6. Acquisition manifest did not expose provider/profile/convention or explicitly
   name the body acceptance budget. Those are now pinned fields. `maxTransferBytes`
   remains a requested transport obligation; `bodyAcceptanceCeiling` names what the
   local routine can enforce. Neither is a demonstrated production socket cap.
7. A stored pointer with its admission assessment removed still passed validation.
   Exact snapshot fields and mandatory receipt-bound admission are now required.
   Stored temporal ordering and archive write-time binding are checked as well.
8. A valid write acknowledgement followed by failed readback could advance the
   pointer. Exact durable archive readback is now required before ledger completion
   or assessment. Missing/corrupt readback leaves the old pointer untouched.
9. Reported transport retries/redirects were ignored. Injected discovery/acquisition
   responses must now explicitly report zero for both; missing, nonzero and malformed
   counts fail. Acquisition receipts copy validated reported counts. These are
   trusted-port assertions, not independent packet-level proof. No live port exists.

Regression failure evidence was captured before corrections in the ignored
`task11e-adversarial` verification directory. Decoder behavior itself did not require
expansion: hostile offsets, truncation, endian tags, duplicate variables, huge
dimensions, wrong types and unsupported records already failed closed. Scientific
NaN/Infinity, missing/extra variables, packing/fill drift, uncertainty alignment and
unexpected masks fail at decoding or the subsequent source-validation layer.

### Crash-state matrix — recovery is not implemented

| Crash window | Possible retained state | Next automatic iteration | Required recovery |
|---|---|---|---|
| A: after claim, before acquisition | Persistent CLAIMED, no bytes | ACQUISITION_ALREADY_ATTEMPTED; no download | Operator proves acquisition never started before separately authorizing reconciliation |
| B: after acquisition, before validation | CLAIMED; bytes may exist only in memory or raw storage | No automatic download | Locate/check exact retained bytes and first receipt; otherwise outcome is uncertain |
| C: after validation, before archive | CLAIMED; raw bytes/receipt may be durable, normalized frame may be lost | No automatic download | Revalidate retained raw evidence with the original receipt; explicit reconciliation |
| D: after archive, before pointer | If ledger incomplete: CLAIMED and possible orphan archive; if complete: exact accepted record | CLAIMED requires reconciliation; COMPLETE may be reread/reassessed without acquisition | Verify raw/archive/ledger identity before repairing an incomplete record; no automatic repair |
| E: during pointer CAS | Pointer may or may not have advanced; response may be lost | Next iteration reads and validates pointer; no last-write-wins retry | Reconcile durable version/receipt and CAS outcome; a failed acknowledgement never claims success |

No automatic lease expiry, retry, repair or resume-acquisition routine was added.
External atomic claims, durable completion, raw retention and CAS are contractual
obligations demonstrated by in-memory outcome tests only. They are not production
implementations of a ledger, distributed lock, store or scheduler.

### Adversarial conclusions

Discovery parsing has no acquisition, archive, state or Opportunity capability.
The worker's separate discovery transport is given only the immutable time-only
manifest. A malicious injected JavaScript transport could ignore it; no API can
prove arbitrary trusted code has no side effects. Actual transport restrictions,
bounded I/O and receipt retention still require qualification before deployment.

Same nominal time without a selected-object revision remains AMBIGUOUS_REVISION.
A changed HTTP discovery validator is not silently promoted to object revision.
Exact completed evidence is reused from its ledger/archive, with unchanged times.
Changed raw bytes or supplied reviewed revision identity yield distinct frames;
no revision automatically wins. Archive collisions fail rather than overwrite.

Validity is not admissibility. THRESHOLD_DECISION_REQUIRED still prevents pointer
advancement. Test-only admission does not establish an SST freshness policy. CAS
conflicts (including a concurrently installed identical target) report conflict,
not a successful overwrite; the next iteration must reread state. Malformed CAS
acknowledgements report failure/outcome uncertainty. Where the old pointer can be
verified, reports preserve it with age at the new assessment time. If its own
archive cannot be verified, STATE_UNAVAILABLE does not expose it as qualified and
does not erase it from external storage.

Three separate four-hour publication references can pin one unchanged receipt;
tests confirm one acquisition and one frame while age increases. Publication
implementation remains deferred. Frontend, server routes, login, map movement,
Fishing Logs and Opportunity inspection do not import or invoke the worker.

Complete-frame outward rounding remains separate from scientific validation.
Hotter/cooler domains, numeric zero, missing cells and immutable source values are
covered. There is no viewport input and no warm/cool fishing value, species,
habitat, confidence or Opportunity calculation. Unknown dedicated fields fail at
the input boundary; generic trusted strings are not a sensitive-data detector.

Freshness: **THRESHOLD_DECISION_REQUIRED**. NOAA operational qualification:
**NOT ESTABLISHED**. All previously listed production, cadence, revision,
admissibility, transport and infrastructure gates remain. Task 9E-D stays paused.

Final review verification: **56 focused tests passed** (36 prior plus 20 adversarial
tests, with multiple hostile cases inside matrix tests). All **26 backend/shared
scripts** passed, including retained pilot 27, display scale 23, adapter 19, numeric
integrity 19, frame 17, archive 36, scalar 44 and Task 11B 22. Focused frontend:
Task 11A 12, Task 11C 12, raster 8, historical mask 10, presentation boundary 6.
All ran with the network-denial preloader. Syntax, whitespace and Git diff checks
passed. No tracked existing file or retained scientific evidence changed.
