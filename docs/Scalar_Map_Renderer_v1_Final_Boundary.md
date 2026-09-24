# Scalar Map Renderer v1 — Final Boundary

This document is the final Task 11C architecture decision. It supersedes earlier
image-source preferences and the strict pixel-authority acceptance criterion, not
their recorded measurements. No additional mask experimentation is authorized.

## Locked authority

Scientific authority is `pelora-ocean-scalar-field-delivery-v1`: exact numeric values,
missing reasons/masks, source identity and provenance. Raster RGB, alpha, blended
display color and screenshot pixels are NEVER scientific evidence or coverage.

The final architecture is:

`governed numeric evidence → immutable scalar derivative → deterministic presentation tile → MapLibre raster presentation`

Separately:

`inspection / Ocean Intelligence → governed numeric evidence and mask`

A future inspection at a geographic position must resolve its governed cell and
return that cell's value or missing reason (land, provider-no-data, unknown,
outside-coverage, etc.). It must report missing even if nearby GPU filtering gives
the displayed pixel a color contribution. The geographic lookup policy and full
map-click UI are not implemented by this finalization. No nearest-time selection,
gap filling or pixel-to-temperature inversion is introduced.

Raster presentation derivatives must not enter Ocean Signals, fronts/gradients,
Opportunities, eligibility, scoring, confidence, persistence of scientific evidence,
historical reconstruction, Fishing Log association or nightly learning. Those paths
use governed numeric evidence. Presentation caching is separate from scientific
persistence. Tests reject raster objects/bytes at frame, scalar request and review
numeric-response boundaries; schema rejection is not a sensitive-data detector or
a substitute for future consumer review.

## Renderer classifications

| Path | Final classification |
| --- | --- |
| Public MapLibre raster tiles | **SUPPORTED PRESENTATION ARCHITECTURE / PREFERRED SCALABLE DISPLAY PATH** |
| Bounded image source | **DEFERRED** — accepted 5.24.0 nearest/minification defect unresolved |
| Dense polygons | **REFERENCE / SMALL-GRID DEBUG ONLY** |
| 1px and 2px mask guards | **REJECTED EXPERIMENT — MASK_SAFETY_UNRESOLVED UNDER PIXEL-AUTHORITY CRITERION** |

**DISPLAY FILTERING AT SCIENTIFIC MASK BOUNDARIES IS NON-AUTHORITATIVE.**
Strict nearest minification and pixel-perfect scientific-mask preservation at
fractional zoom are not claimed. The public tile proof established initial loading,
source transparency, partial/empty tiles, adjacent tiles, pan/zoom, replacement,
style reload and deterministic identity. Its filtering limitation remains visible
in the receipts. No dependency upgrade, private texture fix or mask guard is selected.

Generated source tiles keep land, internal provider-no-data, unknown and outside
coverage transparent. Valid source pixels use exact governed cell values for color
mapping; numeric zero remains numeric. GPU minification can blend edge pixels.
These pixels do not establish observations, coverage, Signals or Opportunities.

Task 11A opaque geographic land and coastline remain above the scalar slot, followed
by currents, Places, Ocean Signals, governed Opportunities and application UI.
They provide geographic presentation context; they do not repair scientific masks.
Internal offshore holes are governed by numeric masks even without coastline context.

## Identity and cache

The existing proof's deterministic SHA-256 tile identity binds scalar derivative ID,
renderer version, ramp version, mask-presentation version, display/resampling policy,
projection, tile size and z/x/y. Current time, latest labels and storage URLs are not
scientific identity. Changes to algorithms require corresponding version changes.

`mutable qualified selector → exact immutable archive → immutable scalar derivative → immutable presentation-policy version → immutable tile`

Old tiles remain representations of their old policy and must not masquerade as new
ones. A future additive route may use
`/api/ocean/scalar-tile/{derivativeId}/{presentationPolicyId}/{z}/{x}/{y}.png`, resolving
only server-registered exact derivatives. No route, storage, provider, retention,
production budget or latest-qualified selector is implemented here.

## Cumulative source-scope audit

**A. Reusable foundation in application source, not an operational SST integration:**

- `frontend/src/components/MapLibreIntelligenceMap.jsx`: optional trusted review
  capability, default null; retains the existing map and ordinary behavior.
- `frontend/src/hooks/useSyntheticSstReview.js`: review-only lifecycle reachable
  only with explicit trusted capability; no normal acquisition or query/env toggle.
- `frontend/src/utils/syntheticSstDisplay.js`: strict synthetic parser, exact numeric
  handling, provisional display ramp and small-grid reference helpers. Its numeric/
  presentation separation and lifecycle are reusable patterns. Synthetic parser and
  polygon helpers are not a general production scalar renderer.

No new production raster renderer is being claimed. Tile generation below is a
review proof, not a hardened server implementation or selected storage system.

**B. Review harness and supported raster qualification:**

- `review/sst/index.html`
- `review/sst/review.css`
- `review/sst/review.jsx`
- `review/sst/serve.mjs`
- `review/scalar-tiles/fixture.mjs`
- `review/scalar-tiles/presentationTiles.mjs`
- `review/scalar-tiles/rasterProof.mjs`

The separate SST entry explicitly supplies the capability and simulated archived
fixture. Raster proof scripts use only public rendering APIs and offline synthetic
tiles. They do not modify the app's current renderer. All artifacts are synthetic
test evidence, not real Gulf conditions.

**C. Standalone historical diagnostics:**

- `review/sst/imageSourceProbe.mjs`: contains the historical private diagnostic
  override; no runtime import or production reachability. Never ship that fix.
- `review/sst/scalingProbe.mjs`: independent synthetic workload measurements.

**D. Qualification documentation:**

- `docs/SST_Scalar_Map_Renderer_v1.md` — reference renderer record.
- `docs/SST_Rendering_Technical_Review_v1.md` — historical diagnostic findings.
- `docs/Supported_Scalar_Raster_Delivery_Qualification_v1.md` — public raster proof.
- `docs/Conservative_Mask_Safe_Raster_Presentation_v1.md` — rejected guard evidence.
- This final boundary document — current governing architecture decision.

**E. Rejected experiment, isolated and not selected:**

- `review/scalar-mask/fixture.mjs`
- `review/scalar-mask/maskTiles.mjs`
- `review/scalar-mask/maskProof.mjs`

Neither production code nor the selected unguarded tile proof imports these files.
Historical results and algorithm tests remain useful evidence. No new browser mask
experiment is run in finalization. The guard code is not a runtime configuration.

**Regression files:**

- `frontend/src/utils/tests/syntheticSstDisplay.test.js`
- `frontend/src/utils/tests/scalarRasterTiles.test.js`
- `frontend/src/utils/tests/scalarMaskGuard.test.js`
- `frontend/src/utils/tests/scalarPresentationBoundary.test.js`

Bootstrap `supabase/.gitignore` and `supabase/config.toml` remain outside this scope.

## Synthetic safety, evidence and device gate

Ordinary Dashboard/main entry supplies no synthetic capability. The review hook
requires an explicit enabled review object with an own data-property request function.
Task 11B's trusted dependency gate remains byte-identical and rejects ordinary scalar
activation. No query/environment shortcut, synthetic fallback or provider access is
added. Rejected guards and diagnostic probes are not referenced by application or
backend source. Tests also check their absence from runtime source.

Retain the three distinct artifact categories: REFERENCE RENDERER (`dist/task11c-review`),
RASTER-TILE QUALIFICATION (`dist/task11c1-review`), and FAILED MASK-GUARD EXPERIMENT
(`dist/task11c2-review`). Diagnostic receipts remain under `dist/task11c-technical`.
Artifacts are ignored local evidence, not runtime assets. No claim of real Gulf
conditions, strict minification or physical-device acceptance is made.

Before beta acceptance of operational scalar rendering, require physical iPhone
Safari tests for SST tiles, transparency, fractional zoom, seams, sustained pan/zoom,
memory, orientation, background/resume and long sessions. No such test is performed
or claimed now. Basemap remains a temporary development dependency. No production
SST provider is selected or qualified by rendering success.

## Finalization scope

This pass changes documentation and isolation comments, and adds boundary regressions.
It changes no rendering algorithm, guard policy, UI, scientific contract, Task 11B,
provider, freshness, scoring, confidence, eligibility, ranking, persistence, learning,
Fishing Logs or Auth behavior. Task 9E-D remains paused. Leave all work uncommitted.

## Final verification

Network-blocked suites passed: final presentation boundary 6, reference 11C 12,
raster 11C.1 8, historical guard algorithm 11C.2 10, map 11A 12, runtime 11B 22,
scalar delivery 44, archive 36, frame 17, SST adapter 19, numeric integrity 19.
Complete backend/shared: 23 scripts; frontend: 21 scripts. Production build passes
with the existing large-chunk warning. JavaScript/JSX syntax, cumulative whitespace
and git diff checks pass. Four scientific contracts and all five Task 11B files
remain byte-identical to HEAD. Dependencies are unchanged from the existing worktree.
No mask browser experiment was rerun; historical artifacts are preserved.
