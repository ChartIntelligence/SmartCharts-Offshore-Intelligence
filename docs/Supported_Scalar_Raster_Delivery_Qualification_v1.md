# Task 11C.1 — Supported Scalar Raster Delivery Qualification

**RASTER-TILE QUALIFICATION RECORD.** Final classification is **SUPPORTED PRESENTATION
ARCHITECTURE / PREFERRED SCALABLE DISPLAY PATH** under the
[Final Boundary](Scalar_Map_Renderer_v1_Final_Boundary.md). The strict pixel-authority
criterion and blocking next step below are historical, not current acceptance policy.
Fractional-zoom display filtering is non-authoritative; strict nearest minification
and pixel-perfect scientific-mask preservation are NOT claimed.

Review date: 2026-09-24. Installed MapLibre: 5.24.0. Synthetic evidence only.

**Verdict: public raster-tile rendering demonstrated; strict nearest/minification and mask-edge qualification NOT satisfied.** This is a new raster-tile experiment, not a repetition of the accepted image-source diagnosis. No existing Task 11C source or reference fixture was changed. No operational renderer is enabled.

## Evidence categories and upstream research

| Finding | Classification | Evidence |
| --- | --- | --- |
| Raster sources, raster layers, nearest magnification and setTiles are public APIs | DOCUMENTED | Official sources/layers/API links below |
| Exact accepted 5.24.0 image-source black/minification issue already reported upstream | UNRESOLVED | No matching report confirmed in targeted official repository searches. Absence from search is not proof of absence. |
| Related issue #7244 was fixed by PR #7247, released in 5.20.1 | DOCUMENTED | These concern ignored nearest settings in 5.20.0; they do not establish a fix for the later image-source mipmap defect. |
| Newer released version exists | DOCUMENTED | Official release list showed v6.11.1, released September 23, 2026. |
| A newer release fixes the exact accepted image-source defect | UNRESOLVED | No exact fix/release reference established. Attempts to retrieve the newer tagged draw_raster source through the research tool failed. No newer dependency was installed or tested. |
| Public paint setting configures non-mipmap nearest minification | Not documented; UNRESOLVED as a possible alternative API | The current style specification expressly describes nearest as a magnification/overscaling filter. No separate minification or mipmap switch was found. |
| Installed raster tile path generates mipmaps and binds LINEAR_MIPMAP_NEAREST | DEMONSTRATED LOCALLY (source inspection) | Installed source/raster_tile_source.ts:199–204 and webgl/draw/draw_raster.ts:114. No edits or private GL calls. |
| Upgrade will solve the exact defect | UNRESOLVED | A blind upgrade is not supported by the findings. Any proposal needs a specific upstream fix and an isolated migration/rendering test. |
| Public raster tiles can avoid the black image texture yet still mix mask edges during minification | DEMONSTRATED LOCALLY | Browser screenshots and pixel samples described below. |

Official sources consulted (rolling documentation observed on review date unless versioned):

- [Raster source specification](https://maplibre.org/maplibre-style-spec/sources/#raster) — source configuration.
- [Raster resampling specification](https://maplibre.org/maplibre-style-spec/layers/#raster-resampling) — magnification behavior; recommends generic `resampling`.
- [RasterTileSource API](https://maplibre.org/maplibre-gl-js/docs/API/classes/RasterTileSource/) — public `setTiles`, lifecycle, source zoom behavior. Rolling docs are not proof every newer method exists in 5.24.0.
- [Issue #7244](https://github.com/maplibre/maplibre-gl-js/issues/7244) — nearest ignored in 5.20.0.
- [PR #7247](https://github.com/maplibre/maplibre-gl-js/pull/7247) — merged March 12, 2026.
- [Release 5.20.1](https://github.com/maplibre/maplibre-gl-js/releases/tag/v5.20.1) — March 13, 2026; related fix.
- [Official release list](https://github.com/maplibre/maplibre-gl-js/releases) and [6.11.1](https://github.com/maplibre/maplibre-gl-js/releases/tag/v6.11.1) — newer released version, not an established solution to this defect.
- [Official repository introduction](https://github.com/maplibre/maplibre-gl-js/blob/main/docs/index.md) — rolling v6 ESM/worker migration direction, another reason not to treat a major upgrade as a drop-in fix.

No issue was filed and no maintainer/provider was contacted. Research used official MapLibre/GitHub pages only for conclusions.

## Actual proof and scientific boundary

`review/scalar-tiles/fixture.mjs` takes the unchanged six-cell synthetic frame through the existing archive writer, simulated atomic in-memory archive port, Task 11B runtime, and existing scalar response parser. Its archive acknowledgement is a TEST simulation, not production durability.

`presentationTiles.mjs` maps exact scalar cells to presentation colors and encodes lossless RGBA PNG tiles. `rasterProof.mjs` uses public `addSource({type:'raster'})`, `addLayer({type:'raster'})`, `raster-resampling: nearest`, fade duration zero, `setTiles`, remove/add, and `setStyle`. No WebGL calls, patches, dependency edits, live services or production routes. Screenshot pixels are read through an ordinary 2D canvas after screenshot decoding, never through private MapLibre state.

All browser tile requests are intercepted in memory at `https://pelora-review.invalid/`; every other request is aborted. That hostname is not contacted. There were no unmatched requests or browser/map errors. Background is Pelora #101e29. This isolated proof contains no geographic polygons and makes no coastline-accuracy claim. It is not an application-shell or founder geographic preview.

Scientific values remain Kelvin, including the deliberately nonphysical zero used for integrity testing. No science is interpolated. Source-cell display footprints use adjacent-axis midpoints, clipped to the original axis endpoints; ties belong east/north. Every Web Mercator tile pixel center resolves to exactly one source cell or outside coverage. This is presentation resampling of the cell footprint, not a new environmental observation. The six source values, missing reasons, axes and archive identities remain unchanged.

**RASTER PIXELS ARE NOT SCIENTIFIC EVIDENCE.** Inspection must query `pelora-ocean-scalar-field-delivery-v1` and its governed cells. Raster colors must never feed Ocean Signals, Opportunities, score, confidence or learning. Display coordinate reprojection does not change the scientific frame CRS.

## Rendered results

Artifacts are ignored under `dist/task11c1-review/`. `results.json` records measurements, requests, identities, pixel samples and qualification. PNGs are actual headless Edge screenshots, not generated geography.

| Scenario | DEMONSTRATED LOCALLY |
| --- | --- |
| Initial load | Four valid colored cell footprints; land and provider-no-data transparent. |
| Magnification | At ~609 screen pixels per 256-pixel tile, sampled colors stay exact; tested mask boundary contains only source color/background. |
| Minification | At ~194 screen pixels per tile, interiors remain correct, but a boundary pixel is [40,72,92], neither ocean [62,111,138] nor background [16,30,41]. Strict nearest/mask-edge requirement FAILS. |
| Mobile-width desktop engine | 390×844 screenshot; ~181 pixels per tile. Boundary blend [42,76,96]. Not a physical iPhone result. |
| Land/no-data interiors | Both reveal [16,30,41]; zero renders [53,75,112], not missing. |
| Fully empty tiles | Valid transparent PNGs; rendered empty region reveals background. |
| Partial coverage | Pixels outside bounded evidence remain alpha zero; no Gulf-wide coverage invented. |
| Adjacent tiles | 7/32/54 and 7/33/54 meet exactly at -87.1875°. Sampled seam is uniformly [62,111,138]; no observed seam or tile-border alpha bleed. |
| Pan/zoom | Public camera updates render correctly within declared source zoom availability. |
| Below source minimum | At zoom 5.25 the z7-only source disappears. This is recorded availability behavior, not mistaken for successful minification. A future pyramid must provide required zooms. |
| Tile replacement | Public setTiles requests namespace b and re-renders the same immutable PNG content. This tests URL replacement, not changed environmental evidence. |
| Source/layer reload and style reload | Both preserve expected pixel samples. |

The seam tests compare matching source-index pixels across both tile borders and assert all six source cells are represented. A cell whose footprint crosses the boundary is tessellated across two presentation tiles; the scientific array is neither duplicated nor omitted. At coarser presentation scales a small scientific footprint may have no pixel center: a raster is not a lossless scientific archive.

The minified mixed pixel is **DISPLAY interpolation**, not scientific interpolation. It nevertheless prevents claiming strict no-bleed mask behavior. The official magnification setting cannot be represented as a demonstrated minification control. No workaround hides this result.

## Identity and cache design

Implemented SHA-256 `spt-…` identity covers canonical ordered metadata: exact scalar derivative ID, renderer version, ramp version, mask policy, resampling policy, projection, pixel size and z/x/y. Object-key order is irrelevant. Every input change is tested to change identity. Time/latest labels are excluded. The immutable derivative already binds exact archived source content; changed evidence yields a new derivative and namespace. Renderer/ramp algorithm changes require corresponding version increments. PNG bytes can additionally be hashed for transport/storage integrity; their hash is distinct from scientific content identity.

The proof's a/b URL aliases deliberately serve identical immutable tiles to test public URL replacement. They are not the proposed production identity scheme. Utilities are review-only and accept the internally validated fixture; they are not a hardened public input API.

Future architecture, not implemented:

`mutable latest-qualified selector → exact immutable archive → immutable scalar derivative → immutable presentation tile`.

Recommend a separate additive route such as `/api/ocean/scalar-tile/{derivativeId}/{presentationPolicyId}/{z}/{x}/{y}.png`. Policy ID pins renderer/ramp/mask/projection/resampling versions. Existing `/api/ocean/field` numeric and legacy contracts remain unchanged. Resolve only server-registered exact derivatives, validate integer XYZ and bounded zooms, and reject unknown identities. Clients cannot submit archive locators, provider URLs, paths or scientific arrays. A tile response would carry immutable cache headers and a PNG checksum/ETag. Do not cache failures as successful empty scientific evidence. A legitimately all-missing tile may be transparent with separate derivative coverage metadata.

This route is a design recommendation only. No route, storage, retention, latest selection, production budgets or provider qualification was implemented.

## Scale and performance

Current proof requested 12 distinct z7 tiles over its lifecycle: two nonempty, ten deliberately empty coverage neighbors. Each tile is 256×256, 262,144 raw RGBA bytes. All 12 total 3,145,728 raw bytes and 5,888 encoded PNG bytes; the two nonempty PNGs are 1,357 and 1,191 bytes. Empty PNGs are 334 bytes. Those exceptionally small encodings reflect the coarse synthetic fixture, not a production bandwidth estimate.

GPU mipmaps imply approximately 4/3 base texture storage: about 4 MiB for 12 tiles before browser copies, decoding buffers, tile cache, worker/driver overhead and the rest of the map. This is an estimate, not measured browser/iPhone memory. The proof also keeps an Int32 source-index array per tile for diagnostics; production need not retain it.

One local run: initial settle ~700 ms, minification ~260 ms, magnification ~230 ms, pan ~241 ms, URL replacement ~105 ms, source/layer reload ~347 ms, style reload ~365 ms. Timings include automation, local PNG generation and scheduling, exclude screenshot encoding, and are not isolated GPU timings or stable performance budgets.

Previously measured desktop polygon workload, retained without rerunning the accepted experiment:

| Synthetic grid | Valid polygon features | GeoJSON bytes | Initial/update ms |
| --- | ---: | ---: | ---: |
| 32×32 | 877 | 140,376 | 335 / 317 |
| 64×64 | 3,510 | 596,761 | 354 / 300 |
| 128×128 | 14,043 | 2,527,798 | 763 / 709 |
| 256×256 | 56,173 | 10,672,941 | 1,777 / 1,917 |

These are different workloads, not an apples-to-apples speedup benchmark. Raster object count follows visible tile coverage rather than one feature per scientific cell (INFERRED architectural advantage). Dense-grid tile generation, pyramid policy, server caching and physical mobile memory still need qualification. The review rasterizer's simple linear axis lookup is not a production scaling claim.

## Final classifications and next gate

- **Image source: DEFERRED.** Accepted image-source defect remains; no confirmed released fix. It is no longer the preferred qualified path.
- **Raster tile: PUBLIC_API_PROOF_PASSED / STRICT_NEAREST_MASK_QUALIFICATION_INCOMPLETE.** Supported plumbing and nearest magnification work. Minification fails the stricter no-mixing requirement. Do not approve operational use under that requirement yet.
- **Dense polygons: REFERENCE / SMALL-GRID DEBUG ONLY.** Existing six-cell renderer remains unchanged.

Next task should qualify a documented supported minification/mask solution or obtain upstream clarification before selecting a release upgrade. A separately reviewed public custom-layer experiment is another possible route; no private state patch is proposed. Do not acquire real SST to resolve a renderer defect.

Physical iPhone gate: actual Safari on supported devices, exact-zero/valid/missing pixels, transparent-tile and mask edges, adjacent seams across integer/fractional zoom and device pixel ratios, sustained pan/zoom, tile eviction/replacement, memory pressure, portrait/landscape, background/resume and context restoration. Record hardware/OS, responsiveness and memory where available; agree acceptance budgets separately. A 390px desktop viewport is not acceptance.

## Verification and safeguards

Eight new unit regressions pass; browser proof pixel/lifecycle assertions pass while explicitly recording the qualification failure. Existing 11C 12, 11A 12, 11B 22, scalar delivery 44, archive 36, frame 17, SST adapter 19, numeric integrity 19 all pass. Complete backend/shared: 23 scripts. Frontend: 19 scripts. Network-denying Node preload used for suites/build; browser tiles intercepted, other requests blocked. Production build passes with existing large-chunk warning.

Only new 11C.1 files: this document; `review/scalar-tiles/fixture.mjs`, `presentationTiles.mjs`, `rasterProof.mjs`; `frontend/src/utils/tests/scalarRasterTiles.test.js`. Existing 11C files remain byte-identical to the beginning of this task. Task 11B enablement and four scientific contracts unchanged. No dependency installation/update/edit, environmental/provider/database/Auth access, runtime integration, commit, tag, push or deployment. Task 9E-D remains paused.
