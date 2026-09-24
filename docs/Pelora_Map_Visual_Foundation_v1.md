# Pelora Map Visual Foundation v1

Task 11A changes visual geography and stacking only. The foundation carries no SST,
chlorophyll, depth, current, habitat or fishing meaning. Missing data remains absent.

## Active-map audit

`MapLibreIntelligenceMap.jsx` invokes `useMapLibreSetup`, which previously loaded
`https://demotiles.maplibre.org/style.json` directly. The public style definition was
inspected on 2026-09-24; no environmental provider was queried. The style supplies:

- `maplibre` vector source at `https://demotiles.maplibre.org/tiles/tiles.json`;
- `countries` polygons, `centroids` country labels and decorative `geolines`;
- an inline `crimea` cartographic fill, retained with the same neutral land color;
- Open Sans Semibold glyphs at the existing MapLibre demo font endpoint;
- background, coastline, countries-fill/boundary/label and geolines/label layers.

The source has country labels, not coastal-city/state labels. No roads, neighborhoods
or POIs were present to remove. The new allowlist excludes decorative geolines and
unexpected urban layers; it does not manufacture labels or fishing-ground names.
Country outlines are also used by the upstream coastline layer: this is generalized
orientation geography, not a separate authoritative coastline/navigation source.
Source geometry, attribution, label names and glyph dependencies are preserved.
The visual language is locally owned; basemap delivery still depends on the existing
MapLibre demo infrastructure. No new basemap vendor or service SLA is selected here.

Pelora custom sources remain `smartcharts-locations`, `velion-structure-clusters`,
`pelora-fad-clusters`, environmental observations, temperature-transition samples,
`pelora-bathymetry-field` and `pelora-geostrophic-field`. Cluster radius 55/max zoom 7,
cluster counts and icons remain unchanged. Location and Opportunity hooks create DOM
markers separately. Selection hooks, close-to-explore and mobile peek/expanded sheet
logic are unchanged. Bathymetry/current viewport requests remain in the existing hook.

## Visual treatment and ordering

`peloraMapStyle.js` transforms the existing style before its first paint:

- land `#090e13`, ocean `#101e29`;
- thin light-neutral coastline `#cbd1d3` and subdued boundaries `#29343e`;
- country text `#a3b0b9` with dark halo, restrained size and normal label collision;
- no pastel country palette, decorative geolines or new environmental overlays.

The setup still creates one MapLibre instance. A guarded `styledata` listener restores
ordering after asynchronous layer additions; already-correct ordering is a no-op.
The old visibility hook no longer indiscriminately moves chlorophyll/clusters to top.
The order is background → relief → scalar/sample fields → light country-outline edge → opaque land cover →
coastline/boundaries/labels → currents → clustered Places → signals → future ranked
canvas targets → inspection. Land cover intentionally remains above raster fields so
coarse delivery coloration cannot redefine the land mass. Current/observation data,
paint definitions, value decoding, acquisition and scientific interpretation are unchanged.

Future layers can declare `metadata['pelora:visualSlot']`; this is a rendering slot,
not scientific eligibility. No absent future layer is created. Unknown application
layers retain stable ordering at the top pending explicit integration. Existing
Opportunity DOM markers remain above Place DOM markers via scoped z-index 35 vs 25;
the map's isolated stacking context keeps both below sibling application sheets.
Rank marker contents and eligibility/ranking logic are untouched. Cluster counts
remain counts and are not Opportunity ranks.

Controls use dark surfaces, 44px buttons, visible focus outlines and high-contrast
icons. Navigation occupies the existing top-right area below the compact layer control.
Attribution remains available. Existing legend, safe-area and mobile sheet rules are
retained. No shell redesign, new transitions, animation, map instance or DOM overlay
is added to production. Existing reduced-motion behavior is unchanged.

## Compatibility and limits

Current cyan arrows and existing bathymetry relief remain unchanged and contrast with
the dark neutral foundation. Future scalar colors have their own visual space; no
runtime scalar integration, SST palette, habitat color, contour generation or new
scientific visualization is implemented. Places, signals and numbered Opportunities
retain separate treatments. Catch/report/community density is not used.

The schema guard rejects an unexpected upstream style rather than guessing source
layers. It does not provide offline geographic tiles. This task does not improve
basemap availability or qualify geography for navigation. Layer sorting is over the
small style layer list on style updates, with no timer or animation loop. Production
mobile profiling remains future work.

## Verification and visual artifacts

Focused tests cover MapLibre style-spec validation, deterministic detached styling,
source/attribution preservation, clutter suppression, ordering and late insertions,
stable no-op behavior, DOM stacking, mobile CSS assumptions and active setup cleanup.
Existing frontend and backend/shared tests run with Node network entry points blocked.
The production build succeeds, retaining Vite's large-chunk advisory.

Original LAYOUT / STYLE-HARNESS ONLY artifacts (not geographic acceptance evidence):

- `task11a-desktop.png` (1440x900)
- `task11a-mobile.png` (390x844)
- `task11a-preview.mjs` (offline reproduction harness)

These use the actual MapLibre renderer, new style transformation and repository CSS,
but synthetic Gulf-shaped geometry and representative marker/sheet fixtures. They
are NOT live application, captain, environmental or authoritative coastline evidence.
Remote geographic glyph labels are omitted in the offline fixture and schema-tested
separately. All page requests are blocked; both renders had zero requested external
resources, no page errors and no horizontal overflow. Authenticated selection,
navigation, live country-label placement and real-device behavior were not exercised.
Copies of the harness artifacts are retained under ignored `dist/task11a-review/`.

No ocean contracts, providers, thresholds, eligibility, rank, confidence, persistence,
Fishing Logs, Auth, database, migrations or scientific payloads are changed. Task 9E-D
remains paused. No commit, tag, push or deployment belongs to this task.

## Founder final review: real geography and light edge

The earlier synthetic screenshots are **LAYOUT / STYLE-HARNESS ONLY**. Their hand-
specified polygons were deliberately coarse and caused the poor geographic appearance.
They are not evidence of coastline accuracy, Gulf/country/state shape, real-world label
placement or geographic fidelity, and must not be offered for geographic acceptance.

The revised outline uses actual existing country polygon geometry, not new points,
synthetic land or generated geography. Paint: `#cbd1d3`, opacity 0.7, blur 0. Full
centered stroke width interpolates linearly: zoom 0 = 1.5px, zoom 5 = 2px, zoom 10 =
2.4px, clamped outside those stops. It is drawn below opaque land, leaving approximately
0.75–1.2px of seaward edge; antialiasing and the separate thin boundary stroke affect
the final pixels. Opaque land covers shared inland country edges, avoiding bright
political borders masquerading as coastline. This is visual occlusion, not generation
of a new topological shoreline dataset. No glow, blur or brand-color change is added.
Ideal alpha-composited stroke contrast against ocean exceeds 3:1; actual antialiased
edge pixels are not a WCAG certification. Governed markers remain more prominent.

### Actual source and dependency inventory

Authoritative service/repository metadata inspected 2026-09-24:

- Style: https://demotiles.maplibre.org/style.json
- TileJSON: https://demotiles.maplibre.org/tiles/tiles.json
- Repository: https://github.com/maplibre/demotiles
- README: https://raw.githubusercontent.com/maplibre/demotiles/gh-pages/README.md
- Licence: https://raw.githubusercontent.com/maplibre/demotiles/gh-pages/LICENSE

The README identifies Natural Earth country polygons. The exact Natural Earth release,
original map scale and simplification tolerances are not established by these materials.
TileJSON identifies vector PBF tiles, zooms 0–6, EPSG:3857, generated by MapTiler Desktop
Pro 11.1. The countries layer supplies all named regional land/coast context: Florida,
the Panhandle, Louisiana/Texas/Mississippi/Alabama, Mexico/Yucatán, Cuba and Bahamas.
Those U.S. states are parts of country polygons, NOT separate state features. State
boundaries and state/city labels are absent. Country boundaries use the same polygon
edges; labels use `centroids` with NAME/ABBREV. Above zoom 6 MapLibre overzooms existing
tiles; display through style zoom 24 does not imply higher geographic detail. No
meter-level resolution, current shoreline date or navigational accuracy is established.

Runtime geographic resources remain style JSON, TileJSON, `/tiles/{z}/{x}/{y}.pbf`,
`/font/{fontstack}/{range}.pbf`, plus the inline geographic fill in style JSON. There
is no sprite URL, raster basemap or additional remote geographic asset in this style.
Pelora marker/current images remain locally generated. Unused decorative geolines
remain in upstream tiles but are not rendered.

Classification: **TEMPORARY_DEVELOPMENT_DEPENDENCY**, not BETA_ACCEPTABLE. The README
describes demos/hello-world/CI and GitHub Pages hosting, not a production serving
commitment. No traffic allowance, uptime commitment or service-change guarantee was
established. The repository BSD-3-Clause licence permits use/redistribution subject
to its notice/disclaimer/non-endorsement conditions; it is not a hosting SLA or blanket
qualification of every asset. TileJSON attribution is blank; preserving existing
MapLibre attribution alone does not settle upstream data/font attribution compliance.
These are production follow-up items; no provider is replaced or purchased here.

### Real-geometry render evidence

Ignored artifacts under `dist/task11a-review/`:

- `task11a-real-desktop.png`: 1440x900 Gulf view.
- `task11a-real-mobile.png`: 390x844 Gulf view.
- `task11a-real-north.png`: northern Gulf at zoom 6.
- `task11a-real-keys.png`: Keys at display zoom 8 (source remains max zoom 6).
- `task11a-real-yucatan.png`: Yucatán/western Cuba at zoom 6.
- Desktop/mobile JSON receipts enumerate all geographic URLs and render diagnostics.

These renders load the ACTUAL active geographic source, actual glyphs and the refined
style in MapLibre, with representative synthetic markers/sheet UI explicitly labelled.
No synthetic land geometry is used. They are geography/style review evidence, not
authenticated full-application or environmental evidence. Preview allowlist permits
only existing style, TileJSON, tile PBF and glyph paths on `demotiles.maplibre.org`;
all other browser requests are blocked. That is the only geographic rendering host.
Documentation research additionally used `github.com` and `raw.githubusercontent.com`.
No environmental, database or Auth request occurred.

Observed: Florida/Panhandle and the northern Gulf are recognizable; Texas coastal bends
and major embayments, Mississippi Delta outline, Yucatán and Cuba are recognizable.
Delta fingers, barriers and Keys are generalized; Keys appear as simplified angular
islands when overzoomed. Bahamas islands are present but no bank/depth meaning is
implied. No comparison with an authoritative high-resolution shoreline was performed,
so these are visual observations, not accuracy certification. The country-centroid
label model supplies no Gulf state/city orientation and some labels are abbreviated
or off-view. This is a real but limited world overview basemap.

Mobile land/ocean separation remains legible without a heavy outline; controls and
fixture bottom sheet render without horizontal overflow. Country glyphs load. Legend
CSS/text and application sheet interactions are unchanged and code-reviewed; the real-
geometry harness does not exercise the complete interactive legend or Auth-gated app.
Both previews recorded no page/map errors. Initial style load and forced reload each
reported `#101e29`, and all captured paint checks retained that background; no generic
demo background appeared. Tests additionally exercise effect cleanup/remount (including
the StrictMode pattern), transform idempotency and repeated late-layer insertions.
An unrelated future direct `setStyle` call must also use the Pelora transform; there
is no other active source-code caller today.

### Production-basemap follow-up (not Task 11B implementation)

Before choosing a provider, require geographically credible Gulf/U.S./Mexico/Cuba/
Bahamas coverage, adequate coastline detail across supported Pelora zooms, state and
country context, restrained offshore orientation labels, documented source lineage/
generalization, commercial-use and derivative-style rights, attribution compliance,
reliable production serving, bounded mobile payloads, MapLibre compatibility, full
style control and coverage beyond the Gulf. No catch/fishing semantics belong in it.
Candidate categories for later qualification are licensed production vector-tile
services or separately maintained/self-hosted open geographic vector tiles. Neither
is selected here. No account, payment, new dataset or replacement service is introduced.
