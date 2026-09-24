# Task 11D.1 — Real SST visual scale qualification v1

## Verdict

**Founder visual review PASSED. Candidate C is the approved pilot direction:**
full retained-frame min/max, rounded outward to whole °F, **82–89°F** for this
frame, internally classified as **FRAME-ADAPTIVE SCALE**. This reveals substantially
more of the retained temperature variation without clipping either tail. It is
not an operational scale, permanent corporate palette or source-status upgrade.

## Locked Relative Thermal Context Rule

Pelora interprets SST using both absolute temperature and relative thermal structure.
Absolute SST establishes the thermal state of the water mass. Relative thermal
structure — including warmer and cooler pockets, gradients, transitions and
relationships to surrounding water — provides additional environmental evidence.

Relative warmth or coolness has NO universal fishing value. Its relevance depends
on species, season, surrounding water mass and other governed environmental evidence.
A cooler feature within very warm water is not inherently negative. A warmer
feature within cooler water is not inherently positive. The Ocean layer describes
the thermal environment first; species intelligence interprets its relevance later.
No SST color itself establishes habitat quality, fish presence, catch probability,
Opportunity, rank or confidence. This rule implements no species intelligence,
gradient/front analysis or Opportunity behavior in this checkpoint.

## Locked display-domain policy

**COMPLETE-FRAME OUTWARD-ROUNDED ZERO-CLIPPING SST DISPLAY DOMAIN**:

1. Scientific qualification, provider validity, masks, quality evidence and numeric
   integrity determine valid governed cells before display scaling.
2. Use ALL valid cells in the complete governed frame, never only the viewport.
3. Find the valid minimum and maximum, convert those endpoints to °F, floor the
   lower endpoint and ceiling the upper endpoint to whole °F.
4. Use that outward-rounded presentation domain with zero valid-cell clipping.

82–89°F is the output for this retained frame, NOT a permanent SST range or threshold.
Hotter future valid frames expand the domain upward; cooler frames expand it downward.
Example semantics only (not encoded thresholds): 79.6–90.4°F → 79–91°F;
74.2–84.7°F → 74–85°F; 88.1–92.3°F → 88–93°F.

Display scaling never decides scientific validity. A suspicious extreme cannot
be discarded to make an attractive map; an invalid, fill or masked cell cannot
stretch the domain. Pan, zoom, opening a sheet or changing viewport cannot change
the domain for the same governed frame or change an identical temperature's color.

**Temporal Comparison Rule:** a single governed analysis may use the complete-frame
domain. Multi-frame/date comparisons MUST use one shared absolute domain: floor
the minimum valid °F across all compared governed frames and ceiling the maximum.
The same color then has the same temperature meaning throughout the comparison.
Historical comparison UI and scientific selection policy are not implemented here.

Captain-facing collapsed direction is conceptually `SST · Analysis`, the actual
domain (for this frame `82–89°F`), and `Sep 22 · 0.05°`. Captains need not interpret
the internal phrase FRAME-ADAPTIVE SCALE. Expanded evidence may explain product,
complete-frame domain, exact represented time, resolution, freshness, quality and
provenance. The existing comparison harness retains diagnostic labels; this
checkpoint does not redesign captain UI. The pilot is never called LIVE, CURRENT
or FRESH; freshness stays UNASSESSED.

Founder dispositions are locked: A REJECTED (85.19% clipping); B VALID COMPARISON
CONCEPT but too broad/flat for this single-frame presentation; C APPROVED PILOT
VISUAL DIRECTION (0% clipping); D NOT DEFAULT (3.85% clipping). Palette remains
PROVISIONAL, with no good/bad fishing semantics.

The straight rectangular pilot edge is an ACQUISITION / COVERAGE BOUNDARY, not a
thermal transition, front, water-mass boundary, Ocean Signal or Opportunity.
Operational presentation must preserve coverage semantics and never interpret
acquisition edges as environmental structure.

REAL NOAA PILOT EVIDENCE CHAIN: PASS. VISUAL PILOT: PASS using Candidate C policy.
NOAA OPERATIONAL QUALIFICATION, provider reliability, production cadence,
fallback/resilience and historical completeness: NOT ESTABLISHED. Freshness:
UNASSESSED. Temporal support: UNKNOWN. One successful acquisition changes none
of those operational boundaries.

Scientific authority remains **governed numeric grid + governed mask**. Raster
pixels are presentation only. Numeric inspection, Ocean Signals, gradient/front
science, Opportunities, eligibility, scoring, confidence, scientific persistence,
reconstruction, Fishing Log association and learning consume governed numeric
evidence, never raster presentation. Deterministic presentation identity retains
the scalar derivative, renderer, palette/ramp, domain-policy version, exact Kelvin
endpoints, mask/display policy and XYZ; current time is not immutable identity.

Only the retained NOAA Geo-Polar ANALYSIS at 2026-09-22T12:00:00Z is used.
No environmental request was made. Source NetCDF, numeric arrays, axes, masks,
uncertainty, nominal time, frame identity, archive record/receipt, scalar derivative
and scientific digests remain unchanged. Task 11D's original files/artifacts are
preserved. This task adds separate comparison utilities, tests and documentation.

## Distribution

Complete **retained Gulf frame** means all 93600 cells in the acquired bounded
subset, not the global provider grid and not the current viewport. Statistics use
the 71896 finite valid cells, excluding 21704 missing land cells. Each valid cell
has equal weight; this is not an area-weighted ocean mean. Percentiles use
Hyndman–Fan type 7, h=(n−1)p and linear rank interpolation. Standard deviation is
population standard deviation. Fahrenheit standard deviation is a temperature
difference (×1.8), with no absolute-temperature offset.

| Statistic | Kelvin | °F |
|---|---:|---:|
| Minimum | 301.140015 | 82.382026 |
| Maximum | 304.519989 | 88.465980 |
| Mean | 303.574274 | 86.763694 |
| Median | 303.619995 | 86.845991 |
| Standard deviation | 0.439626 | 0.791327 |
| p01 | 301.940002 | 83.822004 |
| p02 | 302.489990 | 84.811982 |
| p05 | 302.859985 | 85.477974 |
| p10 | 303.040009 | 85.802015 |
| p25 | 303.350006 | 86.360011 |
| p50 | 303.619995 | 86.845991 |
| p75 | 303.880005 | 87.314009 |
| p90 | 304.059998 | 87.637996 |
| p95 | 304.170013 | 87.836024 |
| p98 | 304.260010 | 87.998018 |
| p99 | 304.299988 | 88.069978 |

Histogram bins are lower-inclusive / upper-exclusive (last bin includes its upper
edge). Full-precision values and counts are in `scale-review/distribution.json`.

| °F bin | Valid cells |
|---|---:|
| 82–83 | 277 |
| 83–84 | 512 |
| 84–85 | 954 |
| 85–86 | 8905 |
| 86–87 | 30863 |
| 87–88 | 29050 |
| 88–89 | 1335 |

The coarse histogram is concentrated at 86–88°F with a longer, smaller cool tail.
Mean below median is consistent with that shape. No biological interpretation,
habitat threshold, front/gradient metric or significance test is inferred.

## Four controlled candidates

All use the same existing hues, geographic cameras, scalar samples and mask policy.
Only the display domain changes. Clipping means strictly below/above endpoints;
values equal to an endpoint receive its endpoint color but are not counted as clipped.

| Candidate | Display domain °F | Kelvin endpoints | Low / high clipped | Total |
|---|---|---|---:|---:|
| A: current control, fixed absolute | 32–86 | 273.15–303.15 | 0 / 61248 | 85.189718% |
| B: broader fixed absolute | 70–95 | 294.26111111111106–308.15 | 0 / 0 | 0% |
| C: full-frame min/max, outward-rounded | 82–89 | 300.92777777777775–304.81666666666666 | 0 / 0 | 0% |
| D: full-frame p02–p98 | 84.81198242187504–87.99801757812504 | 302.489990234375–304.260009765625 | 1430 / 1335 | 3.845833% |

A reproduces the old color mapping for every retained finite value; it is the
known failure control. B is a warm-water absolute visualization candidate with
headroom on both sides of this frame, not a universal valid SST range or habitat
criterion. C uses floor(min°F), ceil(max°F) from the complete retained derivative.
D retains exact percentile Kelvin endpoints, not rounded legend values. Ties mean
its clipped fraction is not exactly 4%; 1526 cells are at or above its upper
endpoint, of which 1335 are strictly above it.

No histogram equalization, sharpening, spatial interpolation, averaging or mask
fill is introduced. Quantile interpolation is a distribution statistic only;
no new environmental sample is produced.

## Recommendation and temporal meaning

Founder approved **C's policy, yielding 82–89°F for this v1 pilot frame**. It improves discrimination
while retaining the cool and warm extremes. B remains the honest cross-date
comparison candidate, but visibly compresses within-frame contrasts. D produces
stronger contrast but collapses extreme values together; it is not preferred
simply because it looks more dramatic.

A fixed absolute scale makes the same temperature the same color across frames.
An adaptive frame scale can make the same color mean different temperatures on
different dates. Preserve captain understanding through the explicit scale-class
label, numeric °F ticks, represented analysis time, exact numeric inspection and
presentation-domain metadata pinned to the derivative. Future cross-date comparison
must use the shared absolute domain required by the locked Temporal Comparison Rule.
No normal captain modes or temporal comparison UI are implemented here.

There is no viewport-auto contrast. Domains are computed once from the verified
complete retained field before any tile request. Pan/zoom only selects geographic
tiles. The comparison selector exists only in the dedicated loopback review harness.

## Palette and visible result

Hues remain **unchanged and provisional**: `#354b70 → #427f96 → #91b7ad → #e4cd92`.
Relative sRGB luminance at the anchors increases approximately
0.06959 → 0.18539 → 0.42904 → 0.62232. This supports an ordered dark-to-light
progression; it does not establish perceptual uniformity or color-vision accessibility.
No rainbow/jet or fishing-value semantics are added.

Actual geographic screenshots show:

- Full Gulf: C separates broad lighter warm areas from cooler blue/teal patches
  and bands that A largely hides; B shows them more faintly, D more strongly.
- Northern Gulf: cooler blue/teal regions across the central/eastern portion are
  distinguishable from lighter patches toward the western/northwestern portion.
- Eastern Gulf/DeSoto view: a broad cooler central area and lighter areas nearer
  western Florida are distinguishable. This is visible temperature variation,
  not a named front or a causal interpretation of canyon effects.
- Central/western Gulf: lighter southern/interior areas and cooler bands/patches,
  including near northern Yucatán, are visible. Some transitions look angular;
  they are displayed as supplied rather than smoothed or assigned physical meaning.
- Mobile-width: C retains broad color differences, readable scale-class/time/range
  information and controls without horizontal overflow. It is a desktop-engine
  viewport test, not physical iPhone Safari acceptance.

No eddies, convergence, fronts, habitat or Opportunities are identified. Existing
land and coastline remain legible and unchanged. Layer ordering remains below
geographic context and existing governed overlays. These isolated screenshots do
not contain Opportunity/Place/current fixtures, so their dense-overlay contrast is
not newly qualified by this task; no marker behavior/style was changed.

## Honest legend and inspection

Every candidate shows SST, ANALYSIS, NOAA Geo-Polar, 22 Sep 2026 12:00 UTC,
numeric °F display range, 0.05° native grid, freshness UNASSESSED and unknown support.
Adaptive candidates are explicitly labeled FRAME-ADAPTIVE SCALE; fixed ones
ABSOLUTE SCALE. The legend reports clipping. Displayed ticks round to two decimals;
identity/statistics retain exact endpoints.

Source land/no-data remains transparent. Fractional/minified GPU display filtering
remains non-authoritative, exactly as in Task 11C. No guard experiment is reopened.
`inspectCell` reads the governed cell index directly and returns exact Kelvin,
derived Fahrenheit and its original missing reason. It accepts no color or display
domain. A visually clipped cell therefore still returns its exact numeric value.
No map-click spatial-association policy or downstream intelligence is introduced.

## Deterministic presentation identity and isolation

Each tile identity includes the exact scalar derivative, renderer
`pelora-pilot-display-domain-v1`, palette `sst-review-ramp-v1`, display-domain policy,
actual Kelvin endpoints, complete derivative reference, missing-alpha policy,
resampling/projection/tile size and XYZ. No clock, viewport range or latest pointer.
Changing domain/policy changes identity. The review route disables HTTP caching and
serves only four precomputed registered candidates; its in-memory cache is bounded.
Future persistent caching must use the complete deterministic presentation identity.

`scaleReview.mjs` reads the retained source checksum, validates the existing archive
through the locked reader, rederives the scalar in memory with its original inputs,
and compares it exactly with saved `field.json`. It does not call the archive writer
or rewrite scientific artifacts. Production server, routes and app remain untouched.

## Artifacts and reproduction

`node review/noaa-sst-pilot/scaleReview.mjs` starts the explicit review-only local
server at `http://127.0.0.1:5192`. No environmental acquisition occurs. The normal
Pelora entry point cannot enable it through a query, environment flag or fallback.

All artifacts are ignored under:
`.local/ocean-quarantine/sst/noaa-geo-polar/task11d-20260922T120000Z-gulf/scale-review/`.

For **each** prefix `control`, `fixed`, `frame`, `robust`, there are five PNGs:

1. `{prefix}-full-gulf.png`
2. `{prefix}-northern-gulf.png`
3. `{prefix}-eastern-gulf-desoto.png`
4. `{prefix}-central-western-gulf.png`
5. `{prefix}-mobile-width-gulf.png`

`comparison-sheet.png` places the four actual full-Gulf screenshots side by side.
`visual-receipt.json` records policies, counts, cameras, hosts and browser results.
`camera-check.json` proves exact equal centers/zooms for matching views across all
candidates. The first camera check caught inherited camera-state differences; the
final harness resets camera state before each identical fit. Final checks pass.
No substitute synthetic geography is used. External host contacted for screenshots:
**demotiles.maplibre.org** only. Zero browser errors and zero unexpected requests.

## Verification and scope

23 focused display-scale tests pass: deterministic domains/statistics, Kelvin/°F,
type-7 percentiles, difference-unit deviation, clipping/ties, no viewport selection,
exact control colors, identity, exact clipped inspection, land/no-data, transparency,
immutability, hotter/cooler future-frame domains and no scientific payload mutation.

Complete offline backend/shared: **25 scripts**; frontend: **21 scripts**, all pass.
Retained pilot 27; SST adapter 19; frame 17; archive 36; scalar 44; 11B 22; numeric
integrity 19; 11A 12; 11C 12; raster 8; historical mask 10; final boundary 6.
Production build passes with the existing large-chunk warning. Network APIs are
blocked during regressions. New JavaScript syntax and whitespace/Git checks pass.

New files only:

- `review/noaa-sst-pilot/scales.mjs`
- `review/noaa-sst-pilot/scaleReview.mjs`
- `review/noaa-sst-pilot/scale.html`
- `review/noaa-sst-pilot/scalePreview.mjs`
- `backend/tests/noaaSstDisplayScale.test.js`
- `docs/Real_SST_Visual_Scale_Qualification_v1.md`

Source/archive/scalar/receipt hashes are checked against the pre-task inventory.
Four scientific contracts and Task 11B remain unchanged; Task 11C's scientific /
presentation boundary is unchanged. NOAA remains PILOT-ONLY, freshness UNASSESSED,
support UNKNOWN. No reliability/cadence/fallback/historical-completeness upgrade.
Task 9E-D remains paused. No environmental reacquisition, database/Auth/Supabase
access, dependencies changed, commit, tag, push or deployment. Leave everything
unchanged in scientific behavior; checkpointing is authorized only after final verification.
