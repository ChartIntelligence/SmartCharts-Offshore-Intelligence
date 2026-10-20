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

## Saved report overview placement (FOUNDER REQUEST, 2026-10-19)
Also show the flags on each saved report's OVERVIEW card (the
`saved-report-card` > `saved-report-summary` area in SavedFishingDayReports.jsx,
which already renders the date, boat name and captain). Place the flags at the
top of the card next to the date, boat name and captain. Data is already on the
card: `report.speciesResults` (per-species counts incl. `released`), so no new
fields or migrations. Same artwork rules as above (approved PNGs, transparent
derived copies, upright, no state implied). Must stay compact on a small
iPhone card and not crowd the existing Trip Outcome / Hours / Areas / Total
Bites / Total Releases blocks, or the View Details / Delete buttons.
Old reports with missing/unknown species data must render exactly as before.

## Open decisions for Founder
- Which flags appear on a report card? Until answered, default to species
  with at least one recorded RELEASE on that trip (matches the card's Total
  Releases). Alternative: every species with any recorded activity.
- Optional idea (NOT approved, do not build): show an
  upside-down flag next to the Released count to mirror the real-world
  convention. Ask the Founder before adding anything like this.
