# Task: Fishing Log species release-flag icons (approved refinement)
Do AFTER Task 0. Must not delay the beta critical path; avoid conflicting
edits with active work. Build on the newest integration candidate.

1. Audit: locate the Fishing Log species selector/results/release UI
   (frontend/src/components/FishingDayReportPanel.jsx, SavedFishingDayReports.jsx),
   existing assets and tests. On main there are 7 species keys (blueMarlin,
   whiteMarlin, sailfish, yellowfin, blackfin, wahoo, mahi), each with a
   `released` count; no flag icons exist yet. Reuse qualified work.
2. Visuals: use the Founder-approved flag artwork in
   docs/design/release-flags/approved/ EXACTLY as supplied (7 PNGs + README).
   Do not redraw, retrace, recolor, or "improve" them. Species key mapping:
   blue_marlin->blueMarlin, white_marlin->whiteMarlin, sailfish->sailfish,
   yellowfin_tuna->yellowfin, blackfin_tuna->blackfin, mahi_mahi->mahi,
   wahoo->wahoo. Known integration notes (from the asset README): they are
   raster PNGs on white backgrounds (not vector, not transparent) and are
   not yet optimized for small UI. Resize/compress copies for the UI without
   altering the artwork; keep the white marlin legible on the dark UI (e.g.
   show each flag in a consistent chip/card). Ask the Founder before any
   background removal or other edit to the artwork itself.
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

## Open decision
- Some regions fly a release flag upside down, others right side up. Keep the artwork as supplied until the Founder decides.
