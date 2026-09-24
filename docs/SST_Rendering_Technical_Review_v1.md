# Task 11C final technical review

**HISTORICAL DIAGNOSTIC RECORD.** The measurements below are retained, but its image-source
preference, strict rendered-mask acceptance criterion and proposed dependency-patch next
step are superseded by [Final Boundary](Scalar_Map_Renderer_v1_Final_Boundary.md).
Current direction: public raster tiles for presentation; governed numeric masks for
scientific coverage. Image source is DEFERRED. Never ship the private diagnostic fix.

## Verdict

Keep the six-cell grid-fill renderer as the exact scientific reference harness.
Do not promote dense polygons to an operational Gulf-scale rendering strategy.
Preferred first-real-product architecture is a bounded viewport presentation image
derived from governed numeric delivery, with inspection resolving original cells.
This path is **blocked on reliable nearest-only image filtering in the installed
MapLibre dependency**. No production raster workaround or dependency change is made.
No real SST, denser replacement of the six-cell field, or realistic ocean structures
were generated. Separate scale probes use labeled algorithmic checkerboards only.

## Demonstrated black-image cause

An isolated offline Edge page loads the installed MapLibre 5.24.0 bundle, with all
network requests blocked. There is no geographic style, application hook, React,
remote image, CORS request, or source update before the failure. One PNG image source
sits over a constant #101e29 background. Source coordinates are NW, NE, SE, SW:
[-90,27], [-86,27], [-86,25], [-90,25]. North is the top image row.

The 512x512 canvas is encoded as PNG/data URL and decoded by the browser. Six interior
samples are RGBA (120,165,166,255), (0,0,0,0), (136,177,170,255),
(53,75,112,255), (62,111,138,255), (0,0,0,0). Thus color generation, dimensions,
encoding, decoding and missing alpha are established independently of MapLibre.

| Probe | Actual minification filter | Result |
|---|---|---|
|512 square, nearest|9985: LINEAR_MIPMAP_NEAREST|All six samples opaque black|
|512 square, linear|9729: LINEAR|Colors correct; missing centers show background|
|513 square, nearest|9729: LINEAR|Colors correct; missing centers show background|
|512 square, diagnostic-only min-filter correction|9728: NEAREST|Colors correct; missing centers show background|

All four sources report loaded; image type is ImageBitmap; no map error or GL error
is reported. Image textures report `useMipmap=false`. In the installed source:

- `src/source/image_source.ts` constructs a texture without mipmaps and initially
  binds it LINEAR.
- `src/webgl/draw/draw_raster.ts` passes LINEAR_MIPMAP_NEAREST as the min-filter,
  even for the image texture.
- `src/webgl/texture.ts` changes both filters when magnification filter changes.
  Selecting nearest therefore installs a mipmap-requiring min-filter on this
  power-of-two texture without mipmap levels. The incomplete texture samples black.
- Its non-power-of-two fallback selects LINEAR; unchanged LINEAR binding also
  leaves the initial LINEAR min-filter in place due to filter caching.

Changing ONLY the texture min-filter to NEAREST inside the isolated diagnostic
restores all four expected colored samples and both background samples (16,30,41,255).
This is causal evidence of the installed dependency's texture/filter interaction,
not a hypothesis about generated pixels, winding, latitude, CORS or alpha conversion.
The failure occurs on initial load, so repeated source updates are not necessary.
Opacity is 1 in the isolation probe to remove blending ambiguity. Original review
opacity was 0.85; that is not the cause.

The diagnostic override uses private texture internals ONLY in the standalone probe.
It is not imported by the app or review renderer and is not an acceptable production
fix. No node_modules, package lock, dependency version or scientific contract changed.
The 513-pixel workaround is also rejected: it still minifies linearly and does not
prove nearest-only missing-mask preservation. No filtering default is weakened.
The receipt records installed bundle SHA-256; conclusions apply to that installation,
not every browser/version. Browser errors are not required for texture incompleteness.

## Rendering choices

|Path|Assessment|
|---|---|
|Bounded viewport image|Preferred narrow first integration after filter fix. Few resources, bounded decoded RGBA, updateable image source, cache by source/derivative + ramp/mask/projection/size/version. Transparent masks and cell inspection remain separate. Revalidate source updates, remounts, context loss and pan/zoom on corrected dependency.|
|Raster tiles|Likely expansion path: viewport loading, zoom-level caches and bounded individual objects. Requires tile schema, projection/edge/mask rules and serving infrastructure. Tile colors never replace numeric evidence; inspection needs matching numeric grid/tile identity. Not implemented or selected as first infrastructure.|
|Canvas/custom layer|Canvas can avoid PNG encoding but retains lifecycle/GPU responsibilities; built-in canvas shares raster machinery and is not established as a fix. A custom layer can explicitly control sampling but adds projection, context-loss, resource and lifecycle code. Too broad as a workaround here.|
|Dense polygons|Exact small-grid reference and debugging only. Feature count/geometry/worker overhead grows per valid cell. Measurements below argue against operational dense Gulf grids. Missing polygons are absent; inspection can link source indices.|

All candidates can preserve separate numeric truth and adapt to SST, chlorophyll,
SSH/SLA/ADT using product-specific display scales. None authorizes interpolation,
merging products, scientific interpretation or freshness selection. Image caching
must include presentation settings as well as immutable source/derivative identity.

## Masks, display interpolation, numeric lookup

Nearest magnification AND nearest minification are preferred initially. No mipmap
averaging or linear filtering through transparent/missing boundaries is accepted.
Valid pixels receive color; land/provider-no-data/unknown pixels remain alpha zero.
The diagnostic proves two transparent interior samples in source PNG and restored
rendered background. It does not establish all subpixel boundary behavior across
devices, zooms or a real shoreline. That remains required acceptance for the corrected
dependency. The existing cell-fill renderer creates no polygons for any missing reason.

Any eventual smoothing is DISPLAY interpolation only, separately reviewed for masks;
never feed rendered colors back into frames, Signals, Opportunities or inspection.
Map lookup must use exact archive/delivery identity, original grid axes/indices and
missing reason. A display footprint or palette-clipped pixel is not a measurement.
No full map-click lookup policy is implemented here.

## Synthetic scaling measurements

One run per size/viewport, isolated headless Edge on this desktop, all requests blocked.
Numeric payload is minimal JSON `{width,height,values,missing}` WITHOUT full provenance,
axes or archive envelope. Checkerboard alternates two arbitrary values, with every
seventh cell missing. It is not provider resolution or realistic ocean compressibility.
RGBA is one raw buffer only, excluding browser copies, GPU allocation, JS arrays,
workers and map resources. PNG compression is unusually favorable for checkerboards.

|Grid|Cells|Valid polygons|Numeric JSON B|GeoJSON B|RGBA B|PNG B|
|---|---:|---:|---:|---:|---:|---:|
|32x32|1,024|877|11,468|140,376|4,096|344|
|64x64|4,096|3,510|45,701|596,761|16,384|622|
|128x128|16,384|14,043|182,620|2,527,798|65,536|1,770|
|256x256|65,536|56,173|730,318|10,672,941|262,144|5,088|

Times below are milliseconds from operation through MapLibre idle (including scheduling,
workers and rendering), NOT isolated GPU upload or frames-per-second benchmarks.
Raster uses LINEAR solely as a functional throughput control, NOT an approved mask
strategy. Polygon update sends the same GeoJSON to setData; image update reuses PNG.

|Grid|800px image add/update|800px polygon add/update|390px image add/update|390px polygon add/update|Worst timer lateness desktop/390px|
|---|---:|---:|---:|---:|---:|
|32|317/315|335/317|321/303|322/302|24/10|
|64|310/311|354/300|306/305|355/551|39/31|
|128|309/317|763/709|318/308|734/615|132/123|
|256|317/309|1777/1917|307/306|1768/1880|427/424|

Combined array/feature generation ranged 1.7–20 ms at 800px and 1.7–35.2 ms at
390px. PNG encoding was 3.9–6.5 ms except the first cold 32px encoding (45.3 ms).
Raw receipts retain exact measurements. Timer lateness spans image and polygon
operations; it is not attributed to one operation. These single-run results are
directional, not statistical performance guarantees or production limits. A narrow
desktop viewport is NOT iPhone hardware. Real-device profiling is still required.

## Legend, palette, hierarchy and safety

Keep the detailed review legend. Future collapsed captain legend should show scalar,
class, useful displayed range, represented time/separate age assessment and source
resolution. Expanded view should expose provider/product, exact time, native/delivered
resolution, coverage, quality/missing information and provenance. No UI redesign here.

The provisional blue–teal–pale-sand ramp increases lightness at its stops, contrasts
with the dark ocean and retains numeric labels. It has no fishing-value semantics;
not certified perceptually uniform or accessibility-complete, and not locked for
production before real-product review. Existing geographic/coastline, currents,
Places, Signals, Opportunities and UI remain above the scalar layer; relief below.

Synthetic activation remains only the separate review dependency. No ordinary
runtime, query or environment shortcut is introduced. Task 11B and all four scientific
contracts remain unchanged. Task 9E-D stays paused.

## Reproduction and next checkpoint

Run the two standalone scripts with an installed Playwright module path as their
optional CLI argument: `node review/sst/imageSourceProbe.mjs <playwright-module>`
and `node review/sst/scalingProbe.mjs <playwright-module>`. Both block every browser
network request. Ignored receipts/screenshots are under `dist/task11c-technical/`.

Next: a separately scoped MapLibre dependency/filter correction checkpoint. Validate
a supported upstream fix or reviewed dependency patch, then rerun PNG decode, actual
GPU sample/mask edges, source updates, style reload, remount, context loss, zoom/pitch,
opaque land/coastline ordering and physical mobile tests. Only after that should the
bounded image renderer join a separately qualified real SST integration. Do not
ship the diagnostic private-API override, smooth missing cells, or choose dense
polygons to avoid resolving this blocker.
