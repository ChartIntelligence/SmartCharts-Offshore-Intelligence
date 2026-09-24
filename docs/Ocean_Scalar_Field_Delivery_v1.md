# Ocean Scalar Field Delivery v1

Contract: `pelora-ocean-scalar-field-delivery-v1`.
Implementation: `shared/oceanScalarFieldDelivery.mjs`.
Adapter: `pelora-ocean-scalar-field-delivery-adapter-v1`.

## Authority and source binding

This is a derivative boundary, not environmental source truth or consumer eligibility.
The conceptual path remains qualified evidence → Ocean Product Frame → immutable
Ocean Product archive → scalar delivery → future rendering. No provider is qualified
by this module. No runtime route, storage implementation or renderer is connected.

`deliverOceanScalarFieldV1(port, request, signal?)` calls the existing archive reader.
The injected port implements the archive's `readExact` contract, including its external
durability obligation. No independent copy of Task 10B validation or receipt validation
is introduced. Receipt/payload integrity is checked by the archive reader; the request
additionally pins `receiptDigest`. An archive ID alone cannot silently substitute a
different receipt. A checksum is integrity binding, not provider authentication.

The request has exactly these fields:

```js
{
  source: {archiveId, receiptDigest},
  variableId,
  bounds: [west, south, east, north],
  stride: {x, y},
  limits: {maxCells, maxPayloadBytes},
  generatedAt
}
```

All fields are explicit; positive safe integer strides and limits have no defaults.
`generatedAt` is a caller-supplied UTC timestamp, not observed environmental time.
Unknown fields, accessors, non-JSON values and malformed inputs fail closed. Request
data is copied before asynchronous reading. The port is an injected trust boundary,
not a choice of filesystem, database or cloud storage.

## Scientific field and exact geometry

The field carries archive/frame/receipt/content/full-frame identities; product,
evidence class and original temporal support; scalar variable/unit/positive direction;
source CRS, horizontal/vertical datum; native and source-delivered resolution;
requested/delivered bounds; row-major dimensions, explicit axes, values and missing
reasons; provider companion references; source lineage; delivery method/version.

Only rectilinear grids are supported. Task 10B validates finite ascending unique axes,
component sizes and missing/value alignment. Delivery additionally requires geographic
axes in [-180, 180] / [-90, 90], explicit CRS/datum pairs `EPSG:4326`/`WGS84`,
`EPSG:4269`/`NAD83`, or `EPSG:4267`/`NAD27`. This is representation support, not
scientific qualification. No datum is assumed or transformed. Other spellings/CRSs,
projected grids and 0–360 grids fail closed pending a separately reviewed extension.
Viewport bounds are expressed in the SAME source CRS; there is no map-CRS conversion.
No Gulf geometry is hardcoded. Antimeridian-crossing, unordered or zero-area requests
are rejected. Source axes must lie inside declared source bounds when supplied.

Coordinates represent samples. Delivered bounds are the envelope of selected sample
coordinates, not inferred cell edges or continuous footprint coverage. One selected
row/column is valid and can have degenerate delivered bounds. No cell-edge geometry
is invented. Vector payloads and components with vector axes are rejected. Scalar
components of a multivariable frame are selectable; vector delivery remains separate.

## Conservative decimation and resolution

The sole v1 method is `source-index-decimation`. Within inclusive requested bounds,
retain source x/y indices divisible by their requested strides, anchored at original
source index zero. Stride 1 clips without decimation. The global anchor is stable
across viewport/chunk requests. No nearest-cell extrapolation, aggregation, bilinear
interpolation, bicubic interpolation, upsampling or smoothing occurs. Empty selection
does not fabricate a grid. Each returned value/reason is copied from its exact index.

Native resolution and prior source resampling remain separate from delivered sample
spacing. Delivered x/y spacing is reported only when exactly uniform and at least two
samples exist on that axis; otherwise null, with explicit axes remaining authoritative.
There is no guessed rounding tolerance. Spacing is not effective scientific resolution.
Decimation can omit unsampled features; it does not summarize omitted cells. Future
renderers must not interpret a coarse grid as scientifically resolved detail.

## Missing, land and provider evidence

Numeric zero remains zero, null remains null with its Task 10B reason. Land,
cloud-obscuration, provider-no-data, outside-coverage, temporal-gap, invalid-observation
and other Task 10B reasons remain distinct. No interpolation crosses missing cells.
No default temperature, depth, score or opportunity-neutral placeholder is created.
Land styling is outside this field. Decimation preserves selected land cells; a
future renderer needs independently governed coastline/mask behavior rather than
interpolating scalar colors onto land or assuming omitted land samples are ocean.

Provider quality and all other component variable IDs are referenced through the
same exact archive receipt. Selected source indices identify alignment for companion
uncertainty/mask reads. They are references, not copied or averaged quality rasters;
cross-frame companion links remain accessible through preserved source lineage.
Provider-native ice/quality conditions remain provider evidence. No universal quality
score, confidence, independence or corroboration is inferred.

## Identity, immutability and caching

`deliveryId` is SHA-256 over recursively key-sorted canonical derivative content,
including exact source identity, variable, bounds, axes/values, transformation,
companion references and adapter version. Array order matters. Object insertion order
does not. Generated time and admission budgets are excluded from identity; changing
generated time changes serialized envelope bytes, not the scientific derivative.
JSON negative zero canonicalizes to zero consistently with Task 10B/archive semantics.
No random values, clock calls, device state or storage URL establishes identity.

Results are detached, recursively frozen and key-sorted for deterministic JSON
serialization. Identical requests/evidence, including supplied generated time, produce
identical bytes. An immutable derivative cache can key on delivery identity and retain
the first generation envelope; `latest-qualified` pointers are mutable and separate.
Display/color conversions or textures are later derivatives, never source evidence.

## Bounded delivery and cancellation

Cell count is checked before allocating values. Payload limit is the exact UTF-8 byte
length of canonical JSON for `field`, including metadata and identity. It excludes
the result wrapper, HTTP headers, transport compression and archive read bytes.
The byte check occurs after constructing the bounded-cell derivative; this is not a
streaming process-memory or upstream transfer cap. Future adapters must bound archive
reads and metadata sizes, transport envelopes and resource usage separately.

The optional caller AbortSignal is checked before and after the archive await. This
prevents an obsolete request from returning a field but does not abort an already
running port read (the locked port has no cancellation parameter). Synchronous
decimation is bounded by caller limits and does not yield. Future service/transport
cancellation and worker scheduling remain separate; no listeners or network are used.

Viewport bounds, stride and explicit budgets support small numeric viewport/chunk/tile
delivery. No full Gulf request, final production limit, binary format, compression
scheme, tile pyramid or cache infrastructure is selected. Future mobile profiling
must establish budgets; texture dimensions never establish scientific resolution.

## Failure states

| Status | Meaning |
| --- | --- |
| INVALID_REQUEST | Missing/unknown/malformed input fields |
| INVALID_BOUNDS | Unsupported geographic viewport, including antimeridian crossing |
| SOURCE_UNAVAILABLE | Exact evidence absent/unavailable/non-durable; archive reason retained |
| SOURCE_INTEGRITY_FAILURE | Archive validation or pinned receipt mismatch |
| UNSUPPORTED_SCALAR_COMPONENT | Unknown variable, vector payload or vector axis |
| UNSUPPORTED_GRID | Unsupported CRS/layout/coordinate domain or contradictory bounds |
| NO_DELIVERED_CELLS | No source samples selected; no invented coverage |
| DELIVERY_LIMIT_EXCEEDED | Caller cell or canonical field byte budget exceeded |
| DELIVERY_TRANSFORMATION_FAILURE | Derivative construction failed; no partial object returned |
| DELIVERY_CANCELLED | Caller cancelled before/after archive read |
| DELIVERED_PARTIAL | Valid field with missing cells, viewport beyond sample extent, or incomplete/unknown source coverage |
| DELIVERED | Complete selected samples, not a claim of continuous coverage or freshness |

Errors contain safe categories, not payloads or provider exception messages. A wholly
missing selected grid remains a valid partial field with explicit reasons.

## Product and future consumer compatibility

- SST: Kelvin ANALYSIS values preserved; Fahrenheit is future presentation only.
- Chlorophyll: DIRECT_OBSERVATION and RECONSTRUCTED remain distinct products/classes;
  age/stale/unavailable selection and the 72-hour selector are not implemented.
- Bathymetry: static support, product version and known vertical reference survive;
  no live observation time or navigation-grade claim is manufactured.
- SSH/SLA/ADT: scalar units and vertical references are preserved without eddy or
  fish inference. No altimetry product is acquired or qualified.
- Future inspection can expose value, units, product, class, time, missing state and
  native/delivered resolution. Freshness/eligibility must arrive separately.
- Future MapLibre consumes scientific fields or governed display derivatives. No
  colors, contours, map integration or opportunity interpretation belongs here.

## Privacy and deferred governance

No dedicated captain, Auth, Fishing Log, catch, species, rank or confidence fields
exist. Viewport geometry is transient delivery geometry, not private report evidence.
No persistence or telemetry occurs. Generic source strings remain an upstream
governance responsibility; these schemas cannot detect every embedded secret.
No provider preference, qualification override, thresholds, historical association,
learning behavior, storage provider, retention or publication scheduler is introduced.
Task 10B, the archive, SST adapter and runtime contracts remain unchanged.

## Final adversarial review

The reviewed implementation behavior is unchanged. Regression coverage includes a
5-column/3-row asymmetric field with independently recognizable values and all seven
tested missing reasons, receipt/frame swaps, unsupported receipts, foreign companion
injection, viewport edges, odd dimensions, byte limits and nested mutation attacks.

The exact inclusion rule is `west <= x[i] <= east && i % stride.x === 0`, and
`south <= y[j] <= north && j % stride.y === 0`. Values and reasons use source offset
`j * sourceWidth + i`; output traverses ascending y rows, then ascending x columns.
Requests must have positive geographic area, even when they select one row, column
or cell. Overlap with the sample envelope alone does not guarantee a selected sample.

Decimation is NOT endpoint-preserving: a last index is selected only if it satisfies
the global stride rule. For five columns and stride three, indices are [0, 3], not
[0, 3, 4]. Appending endpoints could produce unequal spacing, but v1 does not do so.
Nonuniform source axes can still yield irregular delivered axes; tested spacing is
then null for that axis, while exact axes remain available. Singleton spacing is
also null. Neither case is reported as a uniform scientific resolution.

Different requested bounds intentionally create different derivative identities
even if they select exactly the same cells and delivered bounds. The request geometry
is part of the derivative's declared provenance. Tests reconstruct the canonical
digest and verify that adapter version, transformation, actual axes/bounds and
selected indices all contribute. This does not add an alternate-method injection API.

Companions are derived solely from the validated source frame's component list and
are scoped to its exact receipt. Caller-supplied companion fields are rejected;
altering a stored companion without a new valid archive receipt fails integrity.
The contract does not validate arbitrary external companion links or authenticate
the scientific claims of a storage port capable of forging an entire valid record.

Cancellation before reading avoids the port call. Cancellation during a pending read
does not complete delivery until that read settles; the post-read/pre-transformation
check then returns cancellation without a field. There is no later asynchronous
checkpoint during synchronous transformation. Tests do not claim in-flight I/O abort.

UTF-8 limit tests include Unicode metadata, exact byte equality, one byte under the
required budget and oversized metadata. These remain canonical field JSON limits,
not network, source-read, decompressed-memory or GPU allocation limits.
