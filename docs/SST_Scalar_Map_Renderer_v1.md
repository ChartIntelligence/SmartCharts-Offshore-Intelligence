# Task 11C: Synthetic governed SST visual review

**REFERENCE RENDERER — SMALL-GRID DEBUG ONLY.** Final architecture and authority:
[Scalar Map Renderer v1 — Final Boundary](Scalar_Map_Renderer_v1_Final_Boundary.md).
Supported raster tiles are the preferred scalable display path; this six-cell
polygon harness remains unchanged. No image-source preference below is current policy.

Final technical findings, measured filter defect, scalability and next checkpoint:
[SST Rendering Technical Review v1](SST_Rendering_Technical_Review_v1.md).

This is a review-only display derivative, not operational SST or provider qualification.
Task 9E-D stays paused. Task 11A coastline styling and Task 11B remain unchanged.

## Entry and authority

Run `node review/sst/serve.mjs` explicitly, then open `http://127.0.0.1:5188`.
This separate loopback-only Vite root imports the ACTIVE MapLibreIntelligenceMap,
not a second map implementation. It reads no environment files or credentials.
The review page's CSP permits only local resources and the existing geographic host,
including when opened manually outside the screenshot runner.
The normal frontend entry and Dashboard supply no synthetic capability, query switch,
environment switch, automatic fallback, controls or legend. Production server
construction still disables scalar mode. The optional map prop is a trusted review
dependency; it is not populated from client URL parameters.

The launcher constructs the unchanged Task 11B synthetic frame, writes it through
the archive contract into a simulated in-memory port, pins the receipt, and calls
the unchanged scalar runtime. Simulated durable acknowledgements are test machinery,
not evidence of production persistence. The review endpoint has no environmental,
Auth or database path. The six Kelvin values/missing reasons, source identity,
represented interval and source resolutions are unchanged.

## Rendering and lifecycle

The dedicated hook uses the existing debounced/cancelable viewport request controller.
Requests contain the exact registered synthetic selector, viewport bounds and stride 1.
Old replies are rejected by generation; move start hides the old view. A same-context
failed refresh may retain its exact derivative with degraded status, per the existing
controller. Toggle off disposes requests and removes its source/layer. Style reload
recreates only the source/layer; the map instance is not rebuilt. StrictMode cleanup
checks the map reference before accessing a removed map.

The parser accepts synthetic ANALYSIS temperature/K rectilinear delivery only, with
explicit WGS84/EPSG:4326 and archive/digest identifiers. It rejects malformed axes,
dimensions, nonnumeric values, contradictory missing states, vectors and real-provider
labels. Browser checks are structural; cryptographic archive verification remains in
the runtime. Parsed output is detached/frozen. No scientific values are coerced,
rounded, converted, interpolated or written back.

An image-source implementation produced a black rectangle in the isolated browser
despite correct canvas RGBA pixels. The final review uses direct MapLibre GeoJSON
cell fills, avoiding that texture path. It reuses one source via setData, with at most
four rendered polygons for this fixture. No raster/texture workaround or dependency
patch is shipped. Production texture delivery and the image-source issue remain
separate follow-up work; this is not a production-sized grid performance claim.

Cells extend to adjacent sample midpoints and are clipped to the delivered sample
extent. These are DISPLAY footprints, not newly established provider pixel bounds.
Singleton axes have no inferred area and render no shading. The 3-by-2 fixture covers
only longitude -90 to -86, latitude 25 to 27. No Gulf-wide field is fabricated.
Only numeric cells create polygons. Land, provider-no-data and all other supported
missing reasons are absent/transparent. Fill antialiasing is off; there is no spatial
smoothing or bridging across absent cells. The sparse grid is visibly blocky.

## Provisional palette and presentation

Continuous numeric color ramp, linearly interpolated in display RGB only:

| Kelvin | Fahrenheit | Color |
|---|---|---|
|273.15|32|#354b70|
|283.15|50|#427f96|
|293.15|68|#91b7ad|
|303.15|86|#e4cd92|

Fill opacity is 0.85. Colors outside the display domain clip to its endpoints;
source values do not clip. The artificial 0 K fixture cell remains zero and its
expanded table shows -459.67°F, explicitly described as non-ocean test evidence.
This ramp is provisional, not a species/habitat/fishing-value scale. No final
production palette is selected. The numeric legend prevents reliance on color alone.

The separate review UI shows SST, SYNTHETIC TEST EVIDENCE, ANALYSIS, represented
Sep 1–2 2026 interval, coverage, resolutions and an expandable exact cell table.
The table exposes underlying Kelvin and Fahrenheit, axes and derivative/frame identity.
Map-click inspection is deferred; no pixel values are used for numeric inspection.
One primary scalar is active. Chlorophyll and altimetry controls are not implemented.

## Visual hierarchy and limitations

The scalar metadata slot places fills above relief and below coastline/opaque land,
currents, Places, Signals and Opportunities. Approved coastline remains #cbd1d3,
opacity 0.7, no blur, and the existing 1.5/2/2.4 px zoom behavior. Opaque geographic
land covers scalar styling landward of the coastline. The fixture itself is offshore:
screenshots cannot establish shoreline-mask alignment or coastal SST scientific fidelity.

Existing Places are visible without altered identity. A labeled synthetic rank-marker
contrast fixture uses the existing Opportunity renderer; it has no real eligibility,
score or environmental interpretation. No new Opportunity evaluation is performed.
Currents/bathymetry are off to avoid provider requests; their ordering is tested,
not claimed as a live-data visual assessment. No Ocean Signal evidence is invented.

Desktop and 390px mobile review renders use actual generalized Task 11A geography.
The review legend stays above the map and scrolls on mobile; no horizontal overflow
was observed. This is a dedicated review overlay, not a full Auth-gated Dashboard
bottom-sheet or physical-iPhone performance certification. The six-cell test cannot
establish production mobile budgets. No animation loop is added.

## Artifacts and safeguards

Ignored artifacts: `dist/task11c-review/desktop-sst-on.png`, `desktop-sst-off.png`,
`mobile-sst-on.png`, `coastline-closeup.png`, with browser receipts.
Desktop-on also includes the synthetic marker contrast fixture. These are visual
review evidence only, not real SST. Capture requests allow only localhost and the
existing style, tiles and glyph paths on `demotiles.maplibre.org`. An unrelated
Google Fonts request from existing CSS is blocked. No generated geography is used.
The basemap remains TEMPORARY_DEVELOPMENT_DEPENDENCY, not beta-qualified.

Tests exercise the exact archive/runtime chain, parser, strict numbers, zero,
missing/land transparency, deterministic footprints, layer ordering, toggle cleanup,
stale replies and normal-entry isolation. No locked scientific contract or Task 11B
enablement change is needed. No provider, database, Auth, scientific policy,
ranking, persistence, learning or Fishing Log integration belongs to this pass.
