# Task: Fishing Log species release-flag icons (approved refinement)
Do AFTER Task 0. Must not delay the beta critical path; avoid conflicting
edits with active work. Build on the newest integration candidate.

1. Audit: locate the Fishing Log species selector/results/release UI
   (frontend/src/components/FishingDayReportPanel.jsx, SavedFishingDayReports.jsx),
   existing assets and tests. On main there are 7 species keys (blueMarlin,
   whiteMarlin, sailfish, yellowfin, blackfin, wahoo, mahi), each with a
   `released` count; no flag icons exist yet. Reuse qualified work.
2. Visuals: original pennant/flag silhouettes (no checkmarks, emoji, trophies;
   no third-party artwork; no AI photos). Consistent size/stroke; legible on
   iPhone. Do not invent official tournament colors/symbols/rules. Draft
   designs (draft 3: triangular pennant with hoist band, real-flag conventions, Pelora styling) are in docs/design/release-flags/ (Option A uniform, Option B
   tinted). Founder must approve the mapping before finalizing.
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

## Design notes (draft 3)
- Real-world conventions found: the traditional release flag is a triangular
  pennant; species flags are bold fish silhouettes in contrasting colors
  (e.g. sailfish: white flag/blue fish; mahi: yellow flag/blue fish). Marlin
  color pairings vary by region. Colors here are PROPOSED, not official.
- Open conventions needing Founder decision: some regions fly a release flag
  upside down, others right side up. Do not invert fish until decided.
