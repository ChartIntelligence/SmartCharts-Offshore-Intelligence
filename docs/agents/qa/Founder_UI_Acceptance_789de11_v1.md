# Founder UI acceptance package

Target source: `789de11a6aedd50e6e3a8dcf366d4d662f4dc4f5`.
PELORA-04 documentation branch: `codex/pelora-04-founder-qa-package-v1`.
Disposition: checklist prepared; authenticated and physical-device acceptance pending.

## Session setup and evidence

Begin when the permanent non-production preview is available and its operator confirms the exact source SHA above. Record preview URL, date/time/timezone, device model, iOS version, browser/version, orientation and viewport width. Use the already approved dedicated non-production QA account. Record species/origin/range, selected Opportunity ID (sanitized), tested viewport/zoom, field state and loaded source spacing where observable. Do not expose private captain data, magic links, OTPs, cookies, tokens or headers.

Redeem sign-in links in the same device/browser that opened the preview. A desktop localhost URL is not an iPhone-accessible preview. No LAN/public exposure, deployment or redirect configuration change is part of this package. Do not create/edit/delete reports or change account/access/database state. Use only existing authorized non-production reports; absent fixtures are NOT TESTED, not permission to manufacture records.

Run the checklist in portrait first, then repeat stacking/navigation in landscape. Emulation targets 390px and optionally 375px/430px; physical acceptance records the actual phone dimensions. Use PASS / FAIL / BLOCKED / NOT TESTED for each row, with a short observation and sanitized screenshot reference. Capture a failure before reload. Stop a material black-screen, inaccessible-control or cross-account-data failure; report it without repair.

## Founder checklist

| # | Check and sequence | Acceptance / record |
|---|---|---|
| 1 | Shallow bathymetry: Currents OFF, Bathymetry ON; inspect an available shelf/coastal field at broad, regional and close scale. | Supported shallow contours become useful as zoom increases; labels are legible and do not imply new measurements. Current display tiers may include 5–300 ft levels, but eligible lines depend on source support and spacing. Uniform/missing data can legitimately yield no lines. Record viewport, units and interval preference. |
| 2 | Mid-depth bathymetry: repeat across shelf break/slope with valid data. | Material depth variation is readable; major lines dominate; minors remain calm. No obvious lattice, checkerboard, extra smoothing or invented ridges. Record depth range and source-support limits. |
| 3 | Deep offshore: inspect a valid basin/offshore viewport at broad and closer scale. | Sparse useful structure; water does not become a black raster footprint. Magnification adds display eligibility, not observational resolution. No claim of navigation-chart accuracy. |
| 4 | Contour/Opportunity collisions: select a safely available Opportunity, inspect nearby labels/markers at multiple zooms. | Opportunity identity, marker and tap target remain clear; contour labels neither obscure nor intercept them. Check bottom-sheet name matches selection. Record crowding, feet/interval preference and overlap screenshots. |
| 5 | Current-field interaction: both valid; Currents OFF, wait >10s without movement, ON, wait >10s; then repeat Bathymetry OFF/ON. | Enabled sibling does not reset/loading or vanish; re-enabled layer acquires/applies without pan/zoom. Record actual elapsed time and field state. External data unavailability is distinguished from lifecycle failure. |
| 6 | Places / Ocean Signals / Opportunities: inspect each independently, then together with contours. | Semantic distinctions and map hierarchy remain clear; selecting a Place does not invent an Opportunity. Context markers/signals remain dominant over contours. Old current-arrow styling is OPEN / OUT OF SCOPE, not a packet failure by itself. |
| 7 | Pan/zoom continuity: repeat slow/fast zoom in/out and short intersecting pans, then one distant disjoint move. | Supported intersecting bathymetry remains during refresh, without a blank-first drop-out; old geometry is not stretched into new areas. Disjoint viewport may legitimately clear. Replacement and field-status transitions remain coherent. |
| 8 | Phone performance and control stacking: pan/zoom, open Map Intelligence, select marker, expand/collapse sheet, rotate phone and return. | No sustained freeze, runaway reconstruction, blocked map controls, page horizontal overflow or hidden close/action buttons. Check safe area, browser toolbar changes, scrolling and touch targets. Record observed delays, session duration and device heat; no formal performance claim. |
| 9 | Navigation: Today → Map → Intelligence → Reports → Today → Map; repeat with a selected Opportunity. Use More Map Intelligence / Show Less and Open Full Analysis where offered. | No black screen; sheet expansion/close works; full analysis identifies the selection. Normal tabs preserve mission/selection. Closing selection or changing species/origin/range/account can legitimately clear it. Do not require the same map instance or sheet expansion state after reentry. |
| 10 | Saved Reports: open Reports, inspect empty/loading/error or an existing owner report, expand/collapse and return to Map. | Owner-scoped content only; states remain explicit and readable. No save/edit/delete action. No existing approved fixture means populated-report acceptance NOT TESTED. Reports is the navigation label for Saved Reports. |
| 11 | Authentication: observe normal approved-account sign-in and startup. If a safe sign-out control exists, test sign-out/reentry last. | Initial Auth/access loading does not expose a prior workspace; approved user reaches Dashboard; sign-out removes private workspace. Same-principal refresh can retain it while pending, but denial/account change must not retain old data. Pending/revoked/second-account tests require separately provisioned states; do not modify them here. |
| 12 | Runtime and governed states: observe loading, latest-available, stale, unavailable and degraded when naturally present; inspect console if tooling exists. | Map Intelligence uses concise states; no raw provider/version/grid/valid-cell block or field disclosure is expected in this accepted candidate. Degraded retains truthful older evidence; unavailable is not governed-zero. Record uncaught errors, failed resources, MapLibre errors, repeating requests or loops with secrets removed. Missing state/console access is NOT TESTED. |

Intelligence recovery injection is permitted only through an existing safe seam. Without one, malformed-narrative live recovery is NOT TESTED; controlled tests do not qualify startup Supabase failure. Do not alter source or production data to create failures.

## Qualification levels and decision

1. **Automated developer/integrator qualification:** the candidate's `PELORA_Bathymetry_vNEXT_Integration_v1.md` records synthetic source/hook/render tests. Treat these as recorded qualification, not founder observation. See the accompanying PELORA-04 execution record for independent repeats and exclusions.
2. **Browser emulation:** offline headless desktop Edge/MapLibre with synthetic fields, empty geography and 390px viewport can check rendering and controls. It does not establish full authenticated navigation, real ETOPO geography, iOS touch/Safari behavior, phone CPU/GPU/memory or thermal performance.
3. **Physical-device founder acceptance:** all relevant rows need actual observations on the permanent non-production preview. This package contains no physical-mobile PASS. Missing fixtures, unavailable sources and unobservable errors remain explicitly pending.

Founder result template: `source SHA / preview / device+iOS+browser / mission context / rows 1–12 dispositions / units+interval decision / findings with reproduction and screenshots / exclusions / overall acceptance or remaining blockers`.

Keep any candidate defect separate from preview/service availability, fixture absence or tooling limits. Do not declare complete acceptance while a required row is blocked or untested. Package readiness authorizes no production, deployment, beta claim, main/critical-path integration, science-policy change or CP-10.
