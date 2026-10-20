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
3. Integration (FOUNDER DECISION, 2026-10-19): the flag is part of each
   species' identity and is ALWAYS shown in that species' bubble, upright.
   It does NOT indicate state. Founder's flag convention: upside down =
   released, right side up = harvested; the bubble icons are upright purely
   as species identity, so never use the icon or its orientation to imply
   released or harvested. Release/landed/lost/hookup/bite/sighting meaning
   stays in the existing labeled fields and counts. Do not confuse released
   with landed, lost, hookups, bites, sightings. No new report fields or
   migrations. Preserve saved-report rendering and historical records.
4. Accessibility: visible species/release labels + accessible descriptions;
   never color alone; verify small iPhone viewports and touch behavior.
5. Tests: species mapping, release-state correctness, saved-report
   compatibility, unknown/missing values, mobile rendering; run existing
   Fishing Log regression tests only.
6. Deliver: findings, exact changed files, preview, test commands/results,
   open visual decisions, commit SHA. No production deploy.

## Saved report overview flags (FOUNDER DECISIONS, 2026-10-19)
Show flags on each saved report's OVERVIEW card (`saved-report-card` >
`saved-report-summary` in SavedFishingDayReports.jsx), at the top next to the
date, boat name and captain. Data already on the card: `report.speciesResults`
(per species: sightings, bites, hookups, released, landed, lost). No new
fields or migrations. Old reports with missing/unknown species data render
exactly as before.

Rules (flags "fly" by real convention HERE):
- A species gets a flag ONLY if it has at least one release or one harvest.
  Species with only sightings, bites, hookups or lost fish get no flag.
- RELEASED fish: the flag flies UPSIDE DOWN. HARVESTED fish: RIGHT SIDE UP.
- Harvested = the `landed` count. CONFIRMED by Founder 2026-10-19: landed
  means harvested (kept); releases are counted separately.
- If a species has several fish of one kind, show ONE flag with a count
  (for example x3). Show the number only when it is more than 1.
- A species with both releases and harvests shows two flags (one upside
  down with its release count, one upright with its harvest count).
- Upside down = flip the approved artwork vertically (hoist stays on the
  left, fish belly-up) via CSS/transform on a derived copy; never edit or
  redraw the artwork. Show the Founder a preview of one inverted flag on a
  real card before finalizing, in case a 180-degree rotation is preferred.
- Orientation must never be the only signal: each flag needs an accessible
  label (for example "Blue Marlin, 3 released" / "Sailfish, 1 harvested") and
  the count must be visible text. Do not confuse released, landed, raised,
  missed or observed fish.
- Keep it compact on a small iPhone card; do not crowd the Trip Outcome /
  Hours / Areas / Total Bites / Total Releases blocks or the View Details /
  Delete buttons.

Species bubbles in the Fishing Log form (item 3 above) are a different use:
there the flag is upright species identity and implies no state.

## Open decisions for Founder
- None pending. (`landed` = harvested was confirmed by the Founder.)
