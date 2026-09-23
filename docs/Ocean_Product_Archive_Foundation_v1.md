# Pelora Ocean Product & Archive Foundation v1

Task 10B. Repository-only descriptive contract. No provider, storage, scheduler,
map, publication, Fishing Log or opportunity runtime integration is included.
No source qualification, scientific threshold, retention duration or database
technology is approved by this document. No migration has been created or run.

## Decision and boundary

The common envelope can be defined without scientific policy: it preserves facts,
explicit unknowns and lineage. Structural validity is NOT scientific validity,
freshness, completeness, consumer eligibility, association or reproducibility.
Unknown metadata is representable so adapters need not fabricate it. A qualified
consumer must separately reject unresolved metadata essential to its operation.

Implementation: `shared/oceanProductFrame.mjs`; synthetic tests:
`backend/tests/oceanProductFrame.test.js`. No existing runtime imports this module.
All below storage/consumer/assessment interfaces are architecture, not implemented
services. The only executable APIs normalize/serialize a frame and inspect ancestry.

## Current product inventory (repository evidence only)

Sources inspected: backend/server.js, backend/fields/{datasetRegistry,erddapAdapter,
fieldService}.js, backend/bathymetryEvidence.js, backend/data/gulf-water-mask-v1.json,
shared evidence contracts and existing snapshot/history builders. No provider contacted.

| Current identity/path | Provider/dataset | Variables and units | Native space/time | Acquisition, evidence time, cache, consumers |
|---|---|---|---|---|
| SST: getSeaSurfaceTemperaturePoint; getMarineConditions.sst | Open-Meteo Marine API; underlying model/dataset/version not pinned | sea_surface_temperature, C; display conversion F | Native resolution and support window unspecified | Current block point query; provider current.time is model valid time, not direct measurement time. Five-minute SST spatial-point cache; marine bundle has no equivalent persistent archive. Ocean assessment, SST spatial structure, QA map samples |
| Direct chlorophyll: CHLOROPHYLL_DATASET | NOAA CoastWatch / noaacwNPPVIIRSchlaDaily | chlor_a, mg m^-3 | Daily product name; exact composite window and native resolution not established by adapter | ERDDAP last point/pixel; returned time, resolved coordinates, age, platform/dataset. No dedicated durable cache. Productivity/water-character interpretation and QA samples |
| Reconstructed chlorophyll: CHLOROPHYLL_GAP_FILLED_DATASET | NOAA NESDIS CoastWatch / nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily | chlor_a, mg m^-3 | Code declares 9 km; daily product name, exact temporal support unspecified | Last point query; returned time; DINEOF, S-NPP + NOAA-20, experimental, reconstruction metadata; no dedicated durable cache. Same downstream consumers |
| Current point/spatial and noaa-geostrophic-daily field | NOAA CoastWatch / noaacwBLENDEDNRTcurrentsDaily | u_current/v_current m/s; derived knots and toward-direction | Field registry 0.25 degree; daily product, exact averaging support unspecified | Last point or metadata-selected latest grid; provider time; five-minute point/field cache. Field latest-time metadata cache one minute. Current gradients/shear/convergence, ocean interpretation, map arrows |
| Wind: getMarineConditions.wind | Open-Meteo Weather Forecast API; model/version unresolved | wind_speed_10m, wind_gusts_10m m/s -> knots; wind_direction_10m degrees | Not pinned in code | Current model block; wind.time; on-demand with timeout/failure diagnostics; marine/ocean assessment |
| Waves: getMarineConditions.waves | Open-Meteo Marine API; model/version unresolved | wave_height m -> ft, wave_direction degrees, wave_period seconds | Not pinned in code | Current block waves.time; on-demand; marine/ocean assessment |
| Swell: getMarineConditions.swell | Same Marine API | swell_wave_height m -> ft, swell_wave_direction degrees, swell_wave_period seconds | Not pinned in code | Same current block; on-demand; marine/ocean assessment |
| etopo-2022-60s field | NOAA/NCEI / ETOPO_2022_v1_60s / 2022-v1-60s | z, m, positive up | 1/60 degree, static | ERDDAP bounded stride grid; no live validTime; five-minute cache; map depth shading |
| gulf-water-mask-v1 artifact | ETOPO-derived checked-in artifact | elevation m, water/land/unknown | Delivered 1-degree sample lattice; underlying sampled ETOPO cells 60 arc-second; static | Local artifact, not live acquisition; candidate water/land evidence. Not continuous high-detail bathymetry |
| Moon: getMoonConditions | Pelora astronomical calculation | phase fraction, lunar age days, illumination percent, phase label | No spatial grid; requested calculation instant | Reference epoch/synodic calculation, approximate; current code defaults calculation time to now. Archive adapter must supply the explicit calculation time and algorithm version |

No additional active direct salinity, measured visibility, raw SSH/SLA/ADT or eddy
provider product was established. Water color/clarity, fronts, water masses,
mixing, current organization and related Ocean Signals are downstream derived
interpretations, not independent new observations. Altimetry-derived currents
already exist; raw altimetry acquisition does not.

Publication/update time is not retained consistently by these adapters. Most
products have no pinned provider release/version. Provider quality flags are not
consistently ingested; field providerFlags is null and uncertainty is unknown.
Do not infer such metadata from an endpoint name or HTTP success.

The marine bundle's aggregate observedAt selects wind.time then waves.time; this
cannot become a common timestamp for every variable. SST has its own marine valid
time. Future adapters must preserve family-specific times before bundling.

Current history: owner-scoped Ocean Snapshots, opportunity observations/history
and retrieval builders exist. They are selected application records, not a
complete immutable environmental product archive. Field requests support only
latest-available. No general historical provider reconstruction is wired.

## Identity

`contractVersion`: pelora-ocean-product-frame-v1.
`productId`: registry-controlled scientific product identity, never display name.
`providerId`: stable organization identity; endpoint host is not identity.
`datasetId`: provider's product/dataset identifier, null when unestablished.
`productVersion`: declared scientific release, null when unknown (not a made-up v1).
`family`: species-neutral variable family. `processingLevel` preserves provider
classification; null means unknown. A scientific algorithm/grid/reconstruction
change requires a new product release or identity, not a silent metadata edit.
URL/label changes do not change identity. Product aliases and release qualification
belong in a future reviewed registry, not heuristic normalization.

`frameId` identifies one immutable captured/processed frame. This module accepts
the caller's identifier, never creates one. Future archive writer must enforce
ID/content uniqueness and idempotency; deterministic serialization alone is not
an archive ID or storage integrity guarantee. Corrected/reprocessed values create
a new frame and lineage; never overwrite old evidence.

## Time and temporal support

`temporal.support` represents when the ocean values apply, with exclusive shapes:

- instant: `{kind:'instant', at: UTC timestamp}`
- interval: `{kind:'interval', start, end}`
- composite-window: `{kind:'composite-window', start, end}`
- forecast-valid-interval: `{kind:'forecast-valid-interval', start, end}`
- static: `{kind:'static'}`
- unknown: `{kind:'unknown', reason: metadata-gap-code}`

Interval end must be later than start. These bounds describe support; they do not
choose temporal matching tolerance or invent intra-window variation. Boundary
inclusion and averaging/compositing specifics remain product-adapter semantics.
Do not infer a midnight-to-midnight window merely from a daily dataset name.
An unknown support can coexist with a reported provider observationTime; it does
not promote a daily timestamp to an instantaneous measurement.

`observationTime`: optional explicit provider observation timestamp; not model
valid time relabeled as observation. `forecastIssuedAt`: optional model run/issue
time, distinct from valid support. `providerPublishedAt`: optional provider release
time. `acquiredAt`: required supplied acquisition time. `processedAt`: optional
time of Pelora transformation. Null stays null; no current-time fallback.

UTC ISO timestamps require seconds and optional three-digit milliseconds;
adapters must explicitly convert known timezone conventions. Normalization only
canonicalizes formatting; it does not infer timezone. Forecast valid time may
follow acquisition. Static products have no live observation time.

`analysisAsOf` belongs to an analysis-use manifest, not the frame. `archivedAt`
belongs to a durable storage receipt, not evidence support. No redundant
`validTime` is needed in addition to support. Acquisition and archive retries
must not refresh evidence age.

## Space, CRS and payload

`spatial` records CRS, horizontal datum, vertical datum (all nullable), x/y order,
bounds and their meaning, native/delivered resolution with units, resampling method,
coverage completeness/basis, and land-mask availability. Requested private report
bounds are not provider coverage. No default WGS84, NAD27 conversion or vertical
datum compatibility is inferred. Existing field EPSG:4326 is an output assertion;
source geodesy/vertical reference must still be qualified for scientific use.

Payload adapters share an envelope, not an identical quantity:

- kinds: scalar, two-component vector, multivariable (e.g. wave height/period).
- layouts: points (explicit x/y pairs) or rectilinear grid (ascending x/y axes).
- grid order: y ascending rows, x ascending columns.
- components: variableId, unit, axis, positiveDirection, numeric/null values and
  aligned missing-reason arrays.
- vectorBasis: east-north, grid-relative or unknown; non-vectors use null.

Different support, units, release or geodesy must not be hidden inside a combined
component array. Heterogeneous times need separate frames. Native resolution is
not pixel size. Resampling needs an explicit processing step. Bounds are envelopes,
not exact coverage polygons. Per-cell reasons cover holes. Polygon/curvilinear/3D
payloads and tiled/blob references need a reviewed future payload version; v1
rejects unsupported shapes rather than flattening them misleadingly. Geographic
wrap uses split frames; no single wrapped bbox is silently normalized.

Validation checks dimensions, finite coordinate pairs, ascending unique grid axes,
component counts and aligned value/missing arrays. It does not establish CRS-specific
coordinate ranges, bounds containment, grid-spacing/resolution agreement, datum
compatibility, vector sign correctness or the truth of declared coverage. Point
coordinates may repeat; they are not automatically independent observations.
These checks require qualified adapters. Classification and product identifiers
are supplied declarations, not a registry lookup or detection of mislabeled data.
Adapters must reject inappropriate private/species content even inside permitted
text/parameter fields; string syntax cannot establish semantic safety.

## Evidence class, quality and missing data

Classes: DIRECT_OBSERVATION, ANALYSIS, DERIVED, RECONSTRUCTED, STATIC_MODEL,
FORECAST. These do not rank trustworthiness. Direct satellite retrieval is not an
in-situ measurement; retain processingLevel and algorithm. Gap-filled chlorophyll
remains RECONSTRUCTED. Geostrophic currents remain DERIVED. Forecast-model SST
must not become DIRECT_OBSERVATION. Static bathymetry remains STATIC_MODEL.

Each null value requires one supplied missing reason: provider-no-data, land,
outside-coverage, cloud-obscuration, acquisition-failure, temporal-gap,
invalid-observation, unresolved-processing or unknown. A valid numeric value has
null missing reason. Zero is data. NaN, infinities, strings and booleans are rejected
as values, never coerced. An adapter may turn provider sentinel/invalid data into
null only with an explicit reason and processing record. Missing current components
remain distinguishable; a consumer cannot use an incomplete vector as complete.
Do not claim cloud or land when the provider only establishes unspecified no-data.

Whole-request failures belong in acquisition results, not invented all-zero or
fabricated missing-cell frames. Coverage fractions must name their denominator:
returned decimated cells is not all native pixels or requested ocean area.

Quality preserves a provider scheme, scheme-specific aggregate flags and optional
explicit uncertainty/value/unit/meaning. No common confidence number, opportunity
confidence or ranking exists. Per-pixel quality extensions need a qualified payload
adapter/version; do not reduce such masks into a misleading aggregate good/bad flag.

## Provenance and lineage

Sources retain provider/dataset, source record ID, safe locator ID and optional
checksum. Locator IDs refer to a future credential-free registry; never embed
signed URLs, access tokens or credentials. Adapter ID/version and ordered processing
steps retain operation/version and typed parameters. Arbitrary unknown keys are
rejected. Registry-controlled text/parameters must contain environmental metadata
only: schema validation is not a sensitive-text detector or authentication boundary.

Lineage stores parent frame IDs and namespaced source-record IDs plus explicit
complete/partial/unknown status. Two derivatives can share ancestors. The helper
walks supplied frames, detects cycles/duplicate IDs, reports unresolved parents,
and identifies common references. No common reference means NOT ESTABLISHED,
never independent. Incomplete provider ancestry must remain incomplete even if
all Pelora parent frames are available. A matching source ID must name the same
provider/dataset/release/record, not merely the same variable.

Cycle detection covers ancestry reachable from the two requested frame IDs, not
unrelated subgraphs in the supplied collection. Shared unresolved parent references
can establish declared shared ancestry while the result remains incomplete; they do
not verify the parent's content or scientific independence. Product-release support
requires future registry qualification; only unsupported contract/payload versions
are rejected by this pure reader.

Future example: altimetry frame -> geostrophic vector frame -> shear/convergence
frame -> Ocean Signal -> Opportunity. Shared ancestry prevents treating these as
independent corroboration; weighting rules remain downstream policy. Slots for
SLA/SSHA/ADT and ocean structure require their own units/reference surface and
product qualification. No new altimetry provider is selected or contacted here.

## Freshness and consumer contract (design only)

Freshness is an assessment AT a supplied evaluation time, not mutable frame truth.
Separate sidecar references frameId, evaluatedAt, ruleId/version, age basis,
age, classification and reasons. Unknown age is not zero. An archive load does not
make a stale frame fresh. Static uses static status, not age since download.

Existing rules remain unchanged: chlorophyll <=72h direct preferred, <=72h
reconstructed next, older direct then older reconstructed, otherwise unavailable.
Current field/point source declares 96h. These are not universal thresholds, nor
automatic permission for every consumer. SST/wind/wave/swell lack a common pinned
freshness rule in current acquisition metadata. Map allowance of stale evidence is
not opportunity-analysis permission. Future rule implementations must reuse locked
rules rather than translating the descriptive evidence classes into trust scores.

Common request design: purpose (MAP, OPPORTUNITY_ANALYSIS,
HISTORICAL_RECONSTRUCTION, LEARNING_AUDIT), product/release selection, spatial
support, requested evidence time/window, delivery resolution and versioned
consumer-policy reference. No caller-supplied threshold bypass. Return frame
references/values, explicit gaps, and a separate suitability result (eligible,
ineligible or unresolved) with policy/reasons. This module implements no selector
or eligibility engine; purpose never alters source values.

- Map: scalar/vector/static frames, display resampling lineage, age/coverage and
  source provenance. Rendered pixels are derivatives, not new native observations.
- Four-hour analysis: freeze a manifest of exact frame IDs, source times, selection
  and freshness assessments, product/adapter/policy versions and analysisAsOf.
  Products need not share a timestamp. Publication timing is not evidence timing.
- Historical report assessor: request interval/location coverage and receive
  supported frames plus gaps. Retrieval does not establish association, dwell time,
  precision, nearest-cell validity or a matching threshold.
- Nightly audit: reference immutable captain source, separately governed
  association, environmental frames, established place context, explicit outcomes
  and audit versions. Never rewrite archived evidence. No catch/popularity/species
  information enters shared environmental frames.
- Publication reproducibility: archive exact consumed normalized values and all
  computational dependencies, configuration, versions and selection manifests.
  Unknown source version may still permit replay of captured values, but not a
  claim of regenerating original provider production.

## Archive versus cache; storage and retention decisions

Archive unit is an immutable product frame. Archive normalized values actually
used, masks, support, processing and provenance. Retain raw payload too when
permitted and useful for reprocessing; retain its digest/reference. Durable external
references alone are insufficient if a provider can revise/remove data. Without
raw data, replay of normalized interpretation is possible; re-running an earlier
normalization step may not be. Licensing/redistribution/source-retention qualification
is pending and must precede durable acquisition decisions.

Recommend relational metadata/indexes/manifests plus immutable object storage for
large normalized/raw payloads; compact frames may be inline. Tiles are versioned
display derivatives referencing source frames, not replacements. No technology,
bucket, migration or deployment chosen. Region bounds partition retrieval/indexing;
the contract contains no Gulf/species-specific rules.

Five-minute point/field caches, one-minute latest metadata and in-flight deduplication
remain disposable caches. A cache hit is not durable retention or an archive receipt.
Archive write failure prevents a claim of reproducible published/learning evidence;
map-only ephemeral display can be handled separately with explicit persistence state.

Retention policy still needs: allowed backdating horizon, provider revision/late
arrival handling, publication audit horizon, learning reproducibility horizon,
raw versus normalized retention, deletion and cost/licensing limits. No duration
or indefinite-retention promise is invented. Frames referenced by retained artifacts
must not be silently expired; deletion must preserve honest unavailable-reference
status and obey the approved retention/dependency policy.

## Failure and diagnostics

Provider unavailable -> failed acquisition, no invented frame. Invalid payload ->
reject with bounded reason. Missing timestamp/support -> explicit unknown and
unresolved for consumers that require time, never acquisition-time substitution.
Unknown provider release -> preserve null and defer qualification; unsupported
contract/payload version -> reject without coercion. Partial coverage -> preserve
mask/gaps, never complete-area claims. Processing failure -> no successful derived
frame. Archive write/read failure -> explicit durable-evidence failure, not zero.

Diagnostics may contain product/provider/frame IDs, public regional tile/coverage
IDs, evidence time, duration, status, failure category and scoped missing fraction.
Do not log private request coordinates, report notes/contents, captain IDs, emails,
tokens, headers or signed URLs. Frame bounds themselves must describe approved
environmental acquisition; private report-location requests belong in a separate
owner-private association boundary, not shared provenance or logs.

## Integration and versioning

Reusable unchanged: existing field request guards, provider acquisition, Task 3
bathymetry integrity helpers, chlorophyll selection, Task 2 states, evidence gates,
Tasks 7B/7C/7D/8B and persistence pairing. They are not replaced by this contract.

Future adapters map point products and field products into frames, capture separate
weather/marine times, record unit conversions/rounding/stride, and qualify missing
model/grid/datum metadata. SST is currently acquired through both marine bundles
and spatial points; currents through points and grids. Consolidation belongs to
a later adapter integration, not a broad server refactor in 10B.

Existing pelora-spatial-field-v1 and Ocean Snapshot envelopes remain compatibility
boundaries. Do not relabel them as immutable frames or overwrite private history.
New archive receipts, manifests, selectors and worker/storage authority need
separate implementation reviews. No current consumer changes in this checkpoint.

Strict v1 readers reject unsupported contract versions. Future readers dispatch
by explicit version; old bytes remain readable by old readers. Upgrades create
new representations/frames with lineage. This validator freezes a detached clone;
storage immutability, access controls and payload-size limits remain writer/transport
responsibilities. No custom classes, functions, arbitrary extension objects or
unknown fields are accepted. Deterministic serialization preserves array order;
it is not a cross-language cryptographic canonicalization specification.

## Verification

Run `node backend/tests/oceanProductFrame.test.js` and syntax-check the module/test.
Tests are pure and synthetic; no imports of runtime provider or database clients.
No provider/storage implementation or scientific policy is exercised or certified.
