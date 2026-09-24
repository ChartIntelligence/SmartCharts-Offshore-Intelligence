# Task 11C.2 — Conservative Mask-Safe Raster Presentation v1

**REJECTED EXPERIMENT — MASK_SAFETY_UNRESOLVED UNDER PIXEL-AUTHORITY CRITERION.**
Neither 1px nor 2px is selected. This historical failure record does not block raster
presentation under the [Final Boundary](Scalar_Map_Renderer_v1_Final_Boundary.md).
Its former stop/acceptance criterion is superseded; measurements remain unchanged.
No further guard experiments or operational guard behavior are authorized.

**Qualification: MASK_SAFETY_UNRESOLVED. No guard policy selected.**

The supported raster path was tested with 0-, 1- and 2-pixel transparent guards. One pixel reduced unsupported display coverage but failed; two pixels were evaluated only for diagnosis and also failed. Policy tuning stopped. No larger guard, private API, WebGL patch, dependency change, polygon fallback or scientific modification was introduced.

## Scope and reproducibility

Repository HEAD remains `bf005c63826d327d8ae16d206301f683377f8302` on `codex/pelora-remote-setup`. Existing uncommitted 11C/11C.1 files remain unchanged. The accepted image-source and nearest-minification findings were not re-investigated.

New review-only files:

- `review/scalar-mask/fixture.mjs`
- `review/scalar-mask/maskTiles.mjs`
- `review/scalar-mask/maskProof.mjs`
- `frontend/src/utils/tests/scalarMaskGuard.test.js`
- This document.

The new 9×5 computational fixture has distinct synthetic frame/product/dataset/source identities, a land region, an internal provider-no-data hole, an unknown-missing region crossing an XYZ tile boundary, valid cells, and numeric zero. It is not a refinement of the six-cell reference, real geography, or simulated Gulf conditions. The existing frame validator, archive writer/reader, scalar delivery, Task 11B runtime and synthetic response parser establish its governed numeric identity. In-memory durable acknowledgements are test simulations only.

Run the browser proof with an already available Playwright module:

`node review/scalar-mask/maskProof.mjs <existing-playwright-module-path>`

The script intercepts `https://pelora-mask.invalid/` tile requests in memory and aborts every other request. No host is contacted for tiles. It loads the installed MapLibre 5.24.0 bundle and uses public raster source/layer, camera and `setTiles` APIs. No GL calls. PNG screenshot decoding uses a separate Canvas 2D context. Browser/map errors and unmatched network requests were zero.

## Exact presentation policy

For guard radius g, each 256×256 tile samples a `(256 + 2g)²` source-mask halo on the same global XYZ pixel-center lattice. Neighboring tiles are not assumed missing. A central valid pixel remains opaque only when all source-mask samples in its Chebyshev-radius-g square are valid. Every missing reason, including outside coverage, suppresses display alpha. Transparent output is RGBA zero.

Valid output colors come from the unchanged Kelvin value of the central governed source cell and the existing display ramp. No neighboring temperature is averaged. The guard controls presentation visibility only; scientific masks, values, archive receipts, delivery identity, numeric inspection and downstream interpretation are untouched.

Source footprints retain the earlier midpoint/axis-endpoint-clipping convention. This is a sampled presentation mask, not an analytical proof that every subpixel missing feature is captured. Narrow holes below the presentation sampling scale remain an additional unqualified case.

Halo tests independently generate both adjacent tiles and compare their edge alpha against the global source mask. Valid regions at tile edges remain opaque; missing context across the edge participates in the guard. There is no unconditional tile-border erosion or added transparent seam.

## Actual pixel measurement

Desktop viewport 1000×700, device pixel ratio 1, pitch/bearing zero. Fifteen zooms:

`4.49, 4.5, 5.49, 5.5, 5.6, 5.75, 5.99, 6, 6.01, 6.25, 6.49, 6.5, 6.6, 6.99, 7.01`.

For every screenshot pixel below the notice area, the public `map.unproject` result at that pixel center is compared to the original governed grid's display footprint. Any non-background RGB whose center falls inside land, provider-no-data, unknown or outside coverage is counted as unsupported coverage. This strict test includes near-edge missing interiors, not just the centers of the holes. The holes' deep interiors remain transparent; failures do not mean the whole hole was filled.

| Guard | Desktop views failing | Unsupported pixel observations summed across views | Result |
| --- | ---: | ---: | --- |
| 0 | 14 / 15 | 9,699 | Baseline fails |
| 1 | 5 / 15 | 2,011 | Reduced bleed, insufficient |
| 2 | 2 / 15 | 384 | Diagnostic only, insufficient |

Counts are observations across screenshots, not unique scientific cells or a physical area measurement.

Two-pixel failures:

- Zoom 5.5: 256 outside-coverage pixel centers retain color. Example RGB `[17,31,42]` versus background `[16,30,41]` at longitude -89.9809693, latitude 24.9973286, below the covered southern endpoint 25°.
- Zoom 6.5: 64 provider-no-data and 64 unknown-missing pixel centers retain color. Provider-no-data example RGB `[23,41,52]` at longitude -88.2447080, latitude 26.2476091, inside the internal hole. Unknown example RGB `[21,37,47]` at longitude -87.2425706, latitude 26.7481818.

The 2-pixel guard removed land-interior failures in these desktop views but did not establish general mask safety. The offshore internal hole failure is not concealed by a coastline.

The valid seam sample crosses -87.1875° longitude at latitude 25.3°. No artificial transparent seam appeared for any tested policy/view where visible. Raw tile tests also exercise the unknown-missing region across this boundary. Passing seam tests does not negate failures at scientific mask edges.

Valid-valid transitions retain exact source-cell colors in the generated PNG; the browser may mix colors during minification. `valid.mixedDisplay` in the measurements records discrepancies from the pixel-center cell color, including rasterization/filtering effects. They never alter numeric evidence or feed inspection.

## Valid display coverage suppressed

Counts compare unique generated tiles for each XYZ level. They measure valid presentation pixel centers removed, not scientific values or geodesic area. Both guarded policies start with the same baseline valid counts.

| Tile z | Baseline valid pixels | 1px removed | 1px fraction | 2px removed | 2px fraction |
| --- | ---: | ---: | ---: | ---: | ---: |
| 5 | 3,748 | 380 | 10.14% | 768 | 20.49% |
| 6 | 15,059 | 762 | 5.06% | 1,532 | 10.17% |
| 7 | 60,610 | 1,524 | 2.51% | 3,056 | 5.04% |
| 8 | 241,569 | 3,040 | 1.26% | 6,088 | 2.52% |

No policy is declared acceptable: residual false coverage remains, and coarse-level suppression is substantial in this boundary-heavy fixture. No larger radius was attempted merely to obtain a passing result.

Fully empty tiles remain entirely transparent for all three guards. Partial tiles show only valid source-selected colors subject to suppression at the encoded-PNG stage. The actual rendered residuals above prevent extending that claim to all filtered display pixels. Zero remains numeric evidence and retains its clamped display-ramp color where not suppressed.

## Overview and zoom pyramid

The proof serves synthetic levels 5–9. Each requested level is generated directly from exact source-cell selection on that level's presentation pixel grid; it does not average temperatures or shrink a higher-level PNG. Actual tested camera views requested levels 5–8. Guard width is in presentation pixels at each level, so its geographic footprint changes with zoom and is reflected in XYZ identity.

This bounded pyramid reduces the need for severe shrinking of a single high-resolution texture. It does not eliminate fractional-zoom minification or its observed mask leakage. No production overview policy is qualified. Arbitrarily small missing regions, pitched/globe views, alternate pixel ratios, transition frames and other devices remain unproven. No broad production pyramid implementation was added.

## Identity, cache and scientific separation

Tile SHA-256 identity binds exact scalar derivative, renderer version, ramp version, mask-policy version, guard width, halo convention, resampling/overview policy, projection, size and XYZ. Tests prove policy changes create different identities while key ordering and repeated generation do not. Current time is absent.

`immutable scalar derivative → immutable presentation-policy version → immutable tile` remains the cache model. The review URL's guard component selects fixed test policies; it is not a production selector. A future production namespace must pin the complete policy identity. Old policy tiles cannot be served as new policy output.

Raster pixels remain presentation only. Neither suppressed nor blended display pixels may feed numeric inspection, Ocean Signals, Opportunities, score, confidence or learning. Original scientific values and masks are unchanged before/after generation and browser execution. Nothing is imported into the normal app or server from this proof.

## Artifacts and mobile

Ignored artifacts under `dist/task11c2-review/`:

- `results.json`: full pixel counts, failure examples, identities and suppression measurements.
- `comparison.png`: actual no-guard / 2px diagnostic screenshots at zoom 6.5. No selected policy exists.
- `failure-closeups.png`: nearest-expanded screenshot crops showing land edge, offshore hole and tile-boundary/unknown region. These magnify captured pixels; they create no geography or SST.
- `desktop-guard0-zoom6.5.png`, `desktop-guard1-zoom6.5.png`, `desktop-guard2-zoom6.5.png`: individual comparisons.
- `mobile-guard2-zoom6.5.png`: 390×844 desktop-engine diagnostic.
- Remaining per-policy/per-zoom screenshots and logs.

The strongest tested policy was repeated at mobile width for seven zooms without selecting it. The same failures remain at zoom 5.5 (256 outside-coverage pixels) and 6.5 (64 provider-no-data + 64 unknown). Five other tested mobile views had no counted unsupported pixels. This is not physical iPhone acceptance.

Task 11A coastline/land styling is unchanged. No coastline was drawn over the mask test; no real-geography coastal compatibility claim is made. The guard must stand on its own and presently fails. Actual Safari/device-pixel-ratio, mask transparency, tile seams, pan/zoom, memory, orientation and background/resume testing remains a later required gate only after an adequate presentation policy exists.

## Verification and stop

10 focused mask tests pass (algorithm/identity/integrity, not visual qualification). Existing 11C.1 8, 11C 12, 11A 12, 11B 22, scalar 44, archive 36, frame 17, SST adapter 19 and numeric integrity 19 pass. Complete backend/shared: 23 scripts; frontend: 20 scripts. Suites/build use a network-denying Node preload. Production build passes with the existing large-chunk warning. Browser proof completed 52 captures and explicitly returned `MASK_SAFETY_UNRESOLVED`.

No further policy tuning or renderer fallback is authorized by this result. Stop at this failure evidence. All work remains uncommitted. Four scientific contracts, Task 11B, Task 11A and previous 11C/11C.1 files remain unchanged. Task 9E-D remains paused. No environmental-provider/database/Auth access, dependency modification, commit, tag, push or deployment.
