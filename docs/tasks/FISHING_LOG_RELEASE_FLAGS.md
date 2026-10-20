# Task: Fishing Log species release-flag icons (approved refinement)
Do AFTER Task 0. Must not delay the beta critical path; avoid conflicting
edits with active work. Build on the newest integration candidate.

1. Audit: locate the Fishing Log species selector/results/release UI
   (frontend/src/components/FishingDayReportPanel.jsx, SavedFishingDayReports.jsx),
   existing assets and tests. On main there are 7 species keys (blueMarlin,
   whiteMarlin, sailfish, yellowfin, blackfin, wahoo, mahi), each with a
   `released` count; no flag icons exist yet. Reuse qualified work.
2. Visuals (FOUNDER DECISIONS, 2026-10-19): use the approved flag artwork in
   docs/design/release-flags/approved/ as supplied. Do not redraw, retrace,
   recolor, or "improve" the artwork. Species key mapping:
   blue_marlin->blueMarlin, white_marlin->whiteMarlin, sailfish->sailfish,
   yellowfin_tuna->yellowfin, blackfin_tuna->blackfin, mahi_mahi->mahi,
   wahoo->wahoo.
   - Placement: the flags appear as icons INSIDE the existing species bubbles
     (the `species-pill` elements in FishingDayReportPanel.jsx), not as
     separate pennants elsewhere.
   - Orientation: flags are shown RIGHT SIDE UP (not inverted), per Founder.
   - Transparent backgrounds: Founder APPROVED removing the backgrounds.
     Keep the originals untouched in approved/; write transparent derived
     PNGs (and small sizes for phone screens) to the frontend assets.
     CAUTION: the originals are raster on white. A one-click white removal
     will fail: each flag has a WHITE hoist sleeve (with grommets) that must
     be kept, and the white marlin flag is itself white on a white backdrop.
     Build a proper mask (flag outline incl. swallowtail notch), remove only
     the exterior backdrop, keep the stitched edges, and visually check every
     result on both dark and light backgrounds at phone size. Show the
     Founder the before/after for white marlin before finalizing.
3. Integration: show icons only for ACTUAL recorded releases (released > 0),
   not selected/target species. Do not confuse released with landed, lost,
   hookups, bites, sightings. No new report fields or migrations.
4. Accessibility: visible species/release labels + accessible descriptions;
   never color alone; verify small iPhone viewports and touch behavior.
5. Tests: species mapping, release-state correctness, saved-report
   compatibility, unknown/missing values, mobile rendering; run existing
   Fishing Log regression tests only.
6. Deliver: findings, exact changed files, preview, test commands/results,
   open visual decisions, commit SHA. No production deploy.

## Open decisions for Founder
- Should the flag icon show in every species bubble always, or only when that
  species has a recorded release (released > 0)? Until answered, default to
  the earlier approved rule: show it only for actually recorded releases;
  keep the plain bubble otherwise.
- Note: by tournament convention an upright flag can mean "harvested". Since
  the icons are species identity inside the bubble, the "Released" count and
  label (not the flag orientation) must carry release vs. landed meaning.
