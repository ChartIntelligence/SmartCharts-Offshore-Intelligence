# Pelora Persistent Map Shell v1 — architecture proposal

**The ocean is the application.**

Status: designed/documented proposal only; runtime implementation not started. Architecture checkout: codex/pelora-02-persistent-map-shell-architecture-v1 at 73b498d7d298e11f006e9ac005c483bad408873f, verified clean. Subsequent founder amendment and P03 flow integration inspected at **4ea104d68c9ded93ad8b016853d42691a3b582f5**, the exact authorized implementation base. Implementation must use a separate worktree at that verified combined identity or a later explicitly verified P01 successor, never the earlier proposal checkout's runtime.

Authority: root AGENTS and [product constitution](../../PELORA_PRODUCT_CONSTITUTION.md), [science](../../PELORA_SCIENCE_GOVERNANCE.md), [privacy](../../PELORA_PRIVACY_AND_EVIDENCE_RULES.md), [release](../../PELORA_RELEASE_GATES.md), execution board; founder shell amendment and Current Flow integration at 4ea104d. Reviewed actual Dashboard, StartupFlow, gate, map/setup/camera owners, continuity validator, selection/invalidation, Reports/Profile and CSS. Also read Governed Places, map visual foundation, Auth revalidation and captain-state contracts. This proposal changes no scientific, access or release authority.

## 1. Desktop persistent map

One edge-to-edge map/container/mapRef at a stable React tree position inside the approved-owner shell. No route key, conditional Map mount, hidden/zero-size initialization or large header. Restrained existing Pelora mark floats against a readable quiet background; navigation/chrome overlays the map rather than consuming a header row or shrinking its canvas. Layers/legend/search/recenter and applicable selection sheets remain existing map tools, with cleaned concise status. No new map engine or icon package.

## 2. Mobile persistent map

Same map/state owner, not a second mobile implementation. Full dynamic viewport with safe-area-aware chrome. Bottom pill and sheet actions remain reachable above home indicators and the keyboard. Intentionally opened opaque sheets cover the map; it stays mounted at usable dimensions. Overlay scrolling never pans the map or leaks wheel/touch events. Orientation/actual viewport changes get one coalesced resize path; opening an overlay does not create synthetic movement, resize churn or recentering. Preserve reduced-motion behavior and P03 trace/contour/texture guards.

## 3. Collapsed / expanded navigation dock

Desktop: compact floating edge rail; expanded icons plus labels, collapsed labelled toggle/current-destination indication with minimal permanent width. Mobile: bottom pill expanding to Home, Intelligence, Reports, Profile only. No Map navigation button. Visible Close actions dismiss overlays back to the unchanged map. Accessible names, focus/pointer tooltips and aria-expanded/aria-controls; native button keyboard operation. Use the existing brand/palette and simple code-native icons, not competitor imitation. Dock collapse is UI preference, never a layer toggle.

## 4. Home overlay

Reuse TodayDashboard's actual Ocean Brief, evaluation messages, current opportunity actions and report entry. Desktop reading panel; mobile sheet. View Top Zone closes the overlay and invokes the existing explicit selection/recenter path. View All / Open Full Analysis replace the current overlay with Intelligence without remounting the map. Initial new workspace defaults to map; existing owned today restoration opens Home over it.

## 5. Intelligence overlay

Reuse actual TopOpportunity, OpportunityIntelligence, ranking and IntelligenceRecovery. Opening from a selected Opportunity leaves its current valid identity, camera, layers and selection sheet underneath. Dismissal changes only overlay visibility. Loading, partial, available, governed-zero and unavailable remain distinct; error recovery is local, never a complete/zero evaluation. Current authority still removes absent/zero/context/terminal-failure intent; no stale snapshot or retry/navigation resurrection. Place and Signal inspection never acquire Opportunity eligibility through this shell.

## 6. Reports overlay

Reuse SavedFishingDayReports and the existing private report panel, temporal/spatial capture and automatic account draft recovery. Navigation closes neither storage lifetime nor draft. Report editing is a nested modal above the current overlay/map; closing or Back preserves unsaved work. Successful completion retains exact-revision cleanup and newer-edit/account guards. No schema/RLS/backend changes or new sharing authority.

## 7. Profile overlay

Reuse existing account/status content, without claiming unimplemented profile editing or entitlements. Auth controls retain current gate semantics. Current Trip editing becomes a shell-owned editor overlay: StartupFlow's present onEditTripMission transition must no longer unmount Dashboard. Reuse mission normalization and species/origin/range contracts. For cold onboarding, the map can sit beneath mission entry, but no governed Opportunity request/output is enabled before the existing mission-ready conditions; missing context stays fail closed. Account/logout/terminal denial still destroys the authorized shell and releases its map resources.

## 8. State, history and accessibility contract

Dashboard/authorized shell remains the single owner of workspace navigation, camera, layers, Place identity, context-bound Opportunity identity and sheet state. Keep existing account-scoped workspace/mission/draft storage and validators; do not add unknown fields to strict workspace v1. Internally activeTab='map' means no overlay, 'today' means Home, and intelligence/reports/profile retain their meaning. Persist dockExpanded separately through a small validated account-scoped shell-ui record using the existing continuity service. No duplicated selection state/tombstones, credentials, rank/narrative or Signal science snapshots. Preserve existing map-owned Signal/pop-up inspection for its valid lifetime; do not invent a new persistent Signal contract.

History uses built-in APIs, not a new router dependency. Preserve ?app=1 and auth query parameters; use allowlisted #pelora[/home|intelligence|reports|profile] routes. History state carries only route/dialog intent and an ephemeral authorized-shell epoch, no private IDs or evidence. Opening an overlay from map adds one owned history entry; switching open overlays replaces that entry. Back closes to map and Forward restores the most recent overlay against current authoritative state. Close uses owned Back only when safe, otherwise replaces with map and never exits to an unrelated page. Nested report/mission dialogs get their own owned entry; Back/Escape closes the topmost surface first. Popstate reads/normalizes once and does not push state; repeated identical actions are no-ops. Unknown/foreign-epoch history cannot restore another owner's private state. Cold restoration normalizes owned storage/URL once; corrupt storage falls back with existing notices.

Desktop panels are labelled modeless regions; map remains reachable outside them. Mobile covering panels and nested editors use labelled dialog semantics, background inertness and bounded focus. Opening focuses the heading/first appropriate control; closing restores the invoking control or stable dock toggle. Escape closes only the topmost surface and does not clear governed selection. Hidden selection chrome is removed from focus/AT without resetting its state; no hidden-map tabindex traps. Fishing draft remains mounted in the owner shell even when its visual panel is closed.

### Tree and lifecycle invariants

    Approved principal-keyed workspace
      PersistentMapShell / existing Dashboard state owners
        MapSurface -> one MapLibreIntelligenceMap + stable mapRef
        OverlayHost -> Home | Intelligence | Reports | Profile | none
        EditorHost -> report / Current Trip
        Floating mark, navigation dock and map chrome

P03 lifecycle review received: keep mapRef, layer enabled flags and onFieldStatus identities stable; field effects depend on [mapRef,layer,enabled,onFieldStatus]. Route changes must not call setStyle, recreate sources, toggle fields, restart acquisitions, or synthesize pan/zoom. Only actual dimensions trigger coalesced resize. Overlay opening/closing is not selection recentering. Logout/account boundaries still cancel/release exactly once; obsolete/malformed/disposed guards survive. There must be one live map, including StrictMode cleanup/re-init safety, and zero map reconstructions across navigation. Existing display-age clock runs for the persistent surface independently of overlay route; source observation age/policy is unchanged.

### Proposed ownership / file plan

P02: Dashboard.jsx composition; PeloraStartupFlow.jsx mission-editor admission/hosting; new PersistentMapShell.jsx, PeloraNavigationDock.jsx, PeloraOverlayHost.jsx and a small shell history/UI-state helper; scoped persistent-map-shell.css; dedicated shell/history/accessibility/browser tests and evidence. Existing Today/Intelligence/Reports/Profile/report/SelectedTarget consumers change only where explicit overlay callbacks/semantics are needed. Preserve existing recovery/continuity ownership and source contracts.

P03: review only of map mounting, dimension and listener behavior. Do not edit useMapLibreOceanFields.js, oceanFieldPresentation.js, currentFlowPresentation.js, contour generation, setup/source/science contracts. Any indispensable MapLibreIntelligenceMap.jsx dimension seam is a separately bounded UI-only coordination item with unchanged protected blobs; do not silently broaden into field lifecycle repair.

P04: independent shell/layout/navigation/focus qualification after P02 implementation. P01 selects the latest combined baseline and integrates only separately reviewed candidates. No main merge or deployment in this packet.

### Acceptance / test plan

- Actual shell/children: Home → Intelligence → Reports → Profile → Close, repeated cycles, deep links, Back/Forward, reload and restored dialogs. Count constructor/live map/field requests/listeners; navigation must not restart acquisition or create loops. Map dimensions stay nonzero and camera center/zoom/bearing, layer refs/toggles, mission context and valid selection/sheet remain unchanged.
- Current authority: pending loading shell, fresh same-ID replacement, absence/zero/context change, terminal failure, obsolete completion and explicit reselection. Preserve all existing actual-child recovery and continuity regressions; dismissal never invalidates by itself or resurrects an invalidated identity.
- Privacy/drafts: approved/pending/denied/anonymous, sign-out/switch/re-auth, old history epochs, old asynchronous saves, partial drafts and exact successful cleanup. Unowned legacy storage remains unadopted; no real user examples.
- Offline browser 1000px desktop and 390px phone: dock sizes/safe areas, overlays/keyboard scrolling, focus return, Escape/topmost ordering, labels/tooltips, reduced motion and no console/map errors. Synthetic fixtures and blocked external routes; actual overlay/dock interaction plus existing P03 current-flow/contour/texture GPU suites with unchanged science blobs.
- Preservation: exact starting/ending identity, source/blob scope, syntax/scoped lint/whitespace, every named command/result/exclusion. No startup-black-screen or duplicate-map claim based on stub-only tests. API preview binding remains unresolved: no production defaults, backend launch or real Auth/provider/database calls. Physical phone/Photos suspension, real auth/RLS and founder visual/performance acceptance remain separate.

Implementation can proceed in a new isolated branch at verified 4ea104d or the verified P01 combined successor, following this concrete proposal and received P03 review. Routine layout choices require no additional founder permission. Genuine product/science/privacy conflicts stop the affected part. This docs commit is not implementation, deployment, source admission, CP-10, Receipt Writer enablement or beta readiness.
