# Governed SST Product Adapter v1

Pure normalization only. Task 10B remains unchanged. This module has no provider,
network, database, archive writer, map, publication, Fishing Log, learning or
opportunity integration. It contains no product registry entries or real samples.

## Authority and qualification

`shared/sstProductAdapter.mjs` exports `SST_ADAPTER_CONTRACT` =
`pelora-sst-product-adapter-v1` and `createSstProductAdapterV1(registry)`.
The latter returns a normalization function accepting one interpreted source
envelope and returning one immutable `pelora-ocean-product-frame-v1`.

The registry is an EXPLICIT TRUSTED CURRENT GOVERNANCE INPUT, not provider payload.
It contains contractVersion, registryId, registryVersion and qualifications. Each
qualification has qualificationId, qualificationVersion, status `QUALIFIED`, a
reviewReference, product identity/classification, streamId, representationId,
geographic grid interpretation, permitted temporal support kinds, providerScheme
and variable decoding definitions. Other statuses fail. Duplicate qualification
IDs fail; no product/dataset name authorizes itself.

Every source must reference the exact current registry and qualification versions.
Missing, unsupported, stale or mismatched references fail. Product/provider/dataset/
version, stream, representation and grid declarations must match the trusted profile.
The full profile is preserved deterministically in processing provenance, so a
changed profile is inspectable even if a caller improperly reuses its version.

The registry is detached at factory creation. The future registry owner must
version every material change and replace this boundary before processing after
revocation/supersession. This pure function cannot detect an externally revoked
snapshot, authenticate a reviewReference, or prevent a malicious caller from
fabricating a registry. Never accept registry content from an acquisition response.
No clock/expiry heuristic or scientific qualification decision is implemented.

Current real-provider status is unchanged:

| Product | Status |
|---|---|
| NOAA Geo-Polar | METADATA_QUALIFICATION_INCOMPLETE; not qualified |
| OSTIA NRT | PROVIDER_CLARIFICATION_REQUIRED |
| OSTIA REP | PROVIDER_CLARIFICATION_REQUIRED |

There is no real-provider qualification or preference. Tests use unmistakably
synthetic identities/reviews only. Source names cannot bypass the gate. Profile
evidenceClass is explicit, never inferred from processingLevel or L4 branding.
Supported SST classes: DIRECT_OBSERVATION, ANALYSIS, DERIVED, RECONSTRUCTED, FORECAST.

## Source envelope

All fields are required; unknown keys fail. Explicit null denotes permitted unknowns.
The focused test's `fixture()` is the complete executable synthetic example.

| Field | Meaning |
|---|---|
| contractVersion | Adapter envelope version |
| frameId | Supplied immutable reference; never generated here |
| qualification | registryId/version and qualificationId/version |
| identity | providerId, productId, datasetId, productVersion, streamId, representationId |
| grid | Exact qualification-bound geographic reference/resolution declarations |
| temporal | Unchanged Task 10B temporal envelope |
| source | Namespaced objectId, nullable revision/validator, receiptId, required SHA-256, nullable nominalTime |
| axes | longitude and latitude arrays, already ascending |
| dimensions | longitude/latitude counts |
| components | variableId, raw numeric/null values, aligned missing reasons |
| coverage | Explicit completeness and basis; not inferred from valid cells |
| lineage | Task 10B ancestry; sourceRecordIds must contain source.objectId |

`source.checksum` is `sha256:` plus 64 lowercase hex digits. The future acquisition
boundary must verify it against retained bytes. This module validates syntax only.
receiptId is a safe locator reference, not an embedded signed URL. revision and
validator are safe identifier references; preserve arbitrary native HTTP validators
in the external receipt and reference them here. Unknown product versions remain null.
The profile and source identity metadata survive in the frame provenance.

## Numeric decoding and units

Only actual finite JavaScript numbers establish numeric evidence. Strings, booleans,
undefined, NaN, infinities, arrays, boxed numbers and objects fail the whole envelope.
Null requires explicit missing evidence. There is no Number/parseFloat coercion.

Qualification defines each variable's role, meaning and encoding:

- `physical`: explicit K, degC or degF; scaleFactor/addOffset must be null.
- `packed`: explicit finite positive scaleFactor and finite addOffset, plus units.
- `fillValues`: exact finite sentinels in the SUPPLIED/raw representation domain.

Fill detection precedes unpacking and unit conversion. Physical inputs must use
physical-domain sentinel definitions, not raw-file sentinels. No packing is inferred.
No generic valid-range, habitat threshold or plausible-ocean-temperature range is
invented; product-specific qualification/preprocessing must establish additional
range requirements before using this boundary.

SST output is Kelvin: C + 273.15; (F - 32) * 5/9 + 273.15; K unchanged.
Uncertainty is a temperature DIFFERENCE: C and K unchanged, F * 5/9. A packing
offset is applied when explicitly specified; an absolute temperature offset is
never applied to uncertainty. Negative uncertainty and nonfinite decoded results
fail. Numeric zero survives (0 C becomes 273.15 K; 0 K stays zero; zero uncertainty
stays zero). No rounding occurs; normal floating-point arithmetic is preserved.

## Grid and reference semantics

Only already geographic, rectilinear grids with longitude/latitude in degrees are
supported. Qualification supplies an EPSG identifier, known horizontal datum and
explicit `-180:180` or `0:360` convention. Null/unknown reference declarations fail.
EPSG/datum compatibility and geographic meaning are reviewed registry facts, not
an embedded geodesy database. No WGS84 default or CRS transformation occurs.

Axes must be finite, ascending, unique and within the declared geographic ranges.
Duplicated wrap endpoints spanning 360 degrees fail. Values are row-major:
latitude rows, longitude columns. No sorting, shifting, wrapping or resampling is
performed. Dimensions and all component/missing counts must match exactly.
Bounds describe returned coordinate-center extent, not full cell footprints.

Native and delivered resolution remain separate explicit degree-valued metadata.
Different resolutions require a supplied resamplingMethod. This adapter does not
perform or certify that upstream resampling. Rectilinear does not imply regular:
it does not enforce a uniform-spacing tolerance or infer effective resolution.
Projected, descending, curvilinear and wrapped grids need a separately reviewed
interpretation step; they are not silently repaired.

## Missingness, land, ice and flags

Each missing cell retains a Task 10B reason. A qualified raw fill becomes
provider-no-data unless explicit missing/mask evidence supplies another reason.
Finite non-fill values with missing reasons fail rather than being silently erased.
Conflicting missing/mask reasons fail. Missing values never become zero.

Provider flags are aligned numeric components with unit `1`, not universal scores.
The qualification enumerates supported exact integer codes, their provider meaning,
and optional `sstMissingReason`. Unsupported codes fail. Bit combinations require
explicit reviewed entries; there is no implicit bit precedence or quality ranking.
Flag fill and missing evidence are preserved independently. Missing flags do not
prove water or completeness; consumer admissibility remains external.

The synthetic land code requires land missingness. The synthetic ice code maps
SST absence to `unknown` while preserving the native ice code/meaning. Task 10B has
no universal ice reason; ice is never relabeled as land. Other qualified products
could preserve a valid ice-associated SST with no missing reason. The profile,
not an invented universal ice rule, governs this interpretation. Analysis-fill,
quality and contributor codes can use the same explicit enumeration mechanism.

## Aligned uncertainty and lineage

Use Task 10B's existing MULTIVARIABLE frame: one SST component, optional aligned
uncertainty component, and optional aligned flag components. One envelope means
identical grid, temporal support, product, source representation and ancestry.
Component roles/meanings remain in the qualification snapshot in provenance.
`quality.uncertainty` stays null: an uncertainty raster is not a scalar summary.
Scalar mode is available when only SST is supplied.

Different time/grid/product uncertainty cannot be combined here; a future reviewed
companion-frame design would be needed. Co-components are not independent evidence.
Parent frame IDs and source ancestry remain intact for future SST -> gradient ->
Ocean Signal derivations. Missing common ancestry never proves independence.

## Time, immutability and replay

Instant, interval, composite-window, unknown and qualified forecast-valid-interval
support use the exact Task 10B model. No daily support window is inferred. Nominal
reference time remains provenance, not an observation timestamp. Provider publication,
acquisition and optional processing times remain separate supplied facts. Unknown
support stays unknown. Invalid/reversed intervals fail through Task 10B validation.

Output is detached and deeply frozen. Object-key insertion order does not affect
serialization. Cell, profile-variable and lineage-array order remain meaningful;
source components are matched by explicit variableId and emitted in profile order.
Only unordered provenance parameter keys are sorted. No clock/random/network/device
dependency exists. Same source/profile/IDs produce the same serialized frame.

Changed revision, checksum or interpretation remains distinguishable in provenance.
Frame IDs are supplied, not derived. This stateless adapter cannot police reuse of
an ID across calls; the future writer must reject ID/content collisions. Once used
by a publication, exact retained evidence stays immutable. Later NRT corrections
and REP are NEW evidence and never overwrite historical publication inputs.
Replay means Pelora input replay, not reproduction of a producer assimilation system.

## Privacy, failures and downstream boundaries

Dedicated captain, Fishing Log, catch, species, opportunity, rank and confidence
fields do not exist; unknown keys fail. Generic strings and safe IDs cannot prove
content is public or secret-free. Registry/acquisition owners must reject private
notes, credentials, signed URLs and inappropriate metadata before invoking this API.

Malformed envelopes, unsupported qualifications, identity/grid mismatches, invalid
numbers, unsupported packing/units/flags and contradictory missingness fail as a
whole. Valid partial-cell absence remains explicit. No failure fabricates a frame.

Structural output does NOT establish freshness, map/display/search eligibility,
candidate or opportunity eligibility, historical association, learning eligibility,
confidence, evidence independence or successful archive persistence. No freshness
threshold or provider selection is added. No current runtime imports this adapter.

## Verification

`backend/tests/sstProductAdapter.test.js` uses only tiny synthetic fixtures: analysis,
zero, fill, land, ice, aligned error, malformed numeric inputs, bad shapes, unknown
reference, unsupported/stale qualification, revisions and unknown temporal support.
Regression suites must run with network transport blocked and server test mode set.
Task 10B and existing runtime numeric-integrity behavior remain unchanged.
