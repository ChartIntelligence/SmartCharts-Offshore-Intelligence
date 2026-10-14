# P02 Saved Reports local-QA deletion guard

Direct founder implementation authorization: isolated child of exact 71356135fe7aa945b52ea032d367e4f65dea5156, ONLY SavedFishingDayReports.jsx and reserved dedicated savedReportQaDeletion.test.js/evidence.md. Worktree C:/Projects/Pelora-Agent-Worktrees/pelora-02-qa-report-guard-v1; branch codex/pelora-02-qa-report-guard-v1. Created directly from base, verified clean before tests/edits; existing713 checkout preserved clean. No existing worktree reused or rebased. Root governance router, execution board and relevant privacy/release contracts read; the newer explicit scope controls this packet.

## Reproduction before repair

Starting SavedFishingDayReports.jsx Git blob ede49f447ff7f553ad0809d61b7927c085cddcae (same as4e1) had no QA guard on deletion. Actual component + native helpers compiled under React with synthetic nonempty report rows and fake SDK, never real report data. Initial18 fixtures ran BEFORE changing component source:6 pass/12 fail, including five QA/target cases and stale captured handlers. Fake delete was observed in explicitQA and invalid-target cases. This is a controlled frontend safety gap, not demonstrated production data loss or RLS bypass.

Reproducible FINAL test source supports --baseline: it obtains exact713 component via git show without modifying app files. Final25-case baseline replay exit1:7 pass/18 fail. Same final test file against candidate exit0:25 pass/0 fail. Extra fail conditions include malformed owner, stale/unmounted handler admission and owner-unavailable versus successful-empty status. Normal success/cancel/error and existing late-read filtering already passed baseline; those guarantees are preserved rather than counted as newly repaired backend security.

## Narrow repair

- Reuse unchanged assertLocalQaWriteAllowed at handler entry BEFORE window.confirm and again immediately before SDK mutation. Explicit localQA or missing/mismatched target fail closed with fixed deletion-specific status. No arbitrary thrown error is rendered and no successful delete is claimed. No delete confirmation, SDK from/delete call, row removal, expansion close or report record mutation occurs on these blocked paths. The same captured handler is invoked directly in tests; buttons are not the security boundary.
- Validate primitive nonblank owner IDs. Existing anonymous/authLoading predicates remain. A memoized owner token + committed layout-effect binding invalidates captured handlers after principal loss/change, A→B→A, reauthentication/loading and unmount. Check this binding before confirm, before SDK and after await; prior responses cannot remove/alert the new owner. This consumes existing owner/authLoading props; no session lookup, Auth flow, role/RLS or entitlement change.
- Report loading, unavailable/error and successful-empty states remain distinct. Missing current owner now explicitly unavailable, never a claim that their stored reports are empty. Valid normal-mode confirm/cancel, owner/id query filters, SDK error handling and target-row success removal preserved.
- Fixed blocked status is owner-token-bound and appears only with that owner's nonempty list. Source rows/private records remain unchanged. No layout redesign, report identity/schema/ownership mutation or draft-storage edit.

## Executed final checks

Node24.18.0. Existing frontend dependencies read-only at R=C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules; React/ReactDOM19.2.7, rolldown1.1.5, ESLint10.7.0. No install/copy or env/private credentials accessed.

1. node frontend/src/hooks/tests/savedReportQaDeletion.test.js R --baseline: expected exit1;25 tests,7 pass/18 fail, proving guarded paths absent in original.
2. node frontend/src/hooks/tests/savedReportQaDeletion.test.js R: exit0;25/25 PASS. Actual SavedFishingDayReports, normalize/ReportDetails/metrics/status children; minimal DOM host only, synthetic nonempty rows and injected fake SDK; actual unchanged QA helper called with process-local synthetic environment object. Tests cover validQA, missing/wrongURL and API, mode change during confirmation, expanded rows retained, immutable source input, normal owner/id filters and one-target deletion, cancellation, SDK error, late read owner filter, late delete success/error, owner loss/loading/anonymous/malformed IDs, A→B→A and unmount refusal, blocked-status masking, unavailable/empty/loading distinctions. flushSync models a committed owner transition inside the fake confirmation callback; it is not physical modal/Auth behavior evidence.
3. node frontend/src/hooks/tests/historicalSstIntegration.test.mjs R: exit0;84/84 PASS. Existing actual-child continuity/Profile/caller/QA/selection regressions under retained controlled host; overlaps earlier qualification and does not prove App/bootstrap/live Auth or native map/GPU behavior. Original harness/assertions unchanged.
4. Existing frontend ESLint config scoped to changed component, compared to exact713 via lintText: no new diagnostics. Three inherited errors remain unchanged (2 react-hooks/refs,1 react-hooks/set-state-in-effect); no globally clean lint claim. Temp dependency-resolved config only; no config edits.
5. node --check dedicated test: PASS. git diff/staged whitespace checks and reserved-scope checks: PASS. Protected Git blobs below unchanged.

Exact final logs C:/Users/User/AppData/Local/Temp/pelora-p02-report-guard-final-oKdCBX:

[
  {
    "name": "baseline.log",
    "sha256": "82a2ce709a53c31ef182958053e40a14b626a3c6f361e3c76e4f30b8273fb46f"
  },
  {
    "name": "candidate.log",
    "sha256": "071b51f45f203c5d28bb3548a7166fac4d68edbe92888c0e86dbc8c96cca2085"
  },
  {
    "name": "regression.log",
    "sha256": "0ddc2a0efc0e3b1f923f5706493f9eaa1ae9ee8587834c1a9646643e744d1749"
  }
]

## Exact tested bytes

[
  {
    "path": "frontend/src/components/SavedFishingDayReports.jsx",
    "sha256": "9eea1c89e5d6565a9bb4f4bdbda36216bed13d629b9202e88131e52e7a29c43e"
  },
  {
    "path": "frontend/src/hooks/tests/savedReportQaDeletion.test.js",
    "sha256": "5415f88dba77e1efc3604420fbdc88b7b9170c0e282b6a604cfdf88c3f34d753"
  }
]

## Protected unchanged sources

[
  {
    "path": "frontend/src/utils/localQaReadOnly.js",
    "blob": "72cd55ebd49aedf763c8b285e57ff4c63f7a37ac"
  },
  {
    "path": "frontend/src/components/FishingDayReportPanel.jsx",
    "blob": "3ba83a4745b733cb5347e6aa907e9e76ce87fd02"
  },
  {
    "path": "frontend/src/components/Dashboard.jsx",
    "blob": "5078867ba52496f37494f1bd846788688842a24d"
  },
  {
    "path": "frontend/src/components/CaptainProfile.jsx",
    "blob": "45ce9f879609f27d6a3aa0735e9055854ad38091"
  },
  {
    "path": "frontend/src/components/MapLibreIntelligenceMap.jsx",
    "blob": "5a1f4f59e5bc450682367464cd9604c853cab83e"
  },
  {
    "path": "frontend/src/hooks/useMapLibreOceanFields.js",
    "blob": "74d1a5bb93f1403b917980b364d4dbea9640c481"
  },
  {
    "path": "frontend/src/hooks/useCaptainAccess.js",
    "blob": "be305fa312985839b401b68e3c9516e419386318"
  }
]

## Remaining limits / review

Independent P04 exact candidate qualification pending. No browser/mobile-width/device/screenshot, real Supabase configuration/session/Auth/RLS verification or real report visibility/deletion performed. Minimum DOM/fixture success cannot qualify a supervised preview. Malformed QA target blocking does not supply secure environment values or authorization to connect. Existing normal-mode SDK error text/transport behavior is retained, not redesigned. User/session generation is derived from current supplied owner/authLoading transitions, not a newly introduced authentication authority. No real report records or owner values changed; normal deletion success exists only in fake SDK tests.

Three-path local packet only. No shared helper, database/schema/RLS/backend/auth/science/current/historical producer/Profile edits, main/frozen-preview modification, source push or deployment. No private reports, session tokens or environment file copied. Source publication and supervised preview remain separate gates. Route exact commit and this evidence through existing P01/P04 review packet; no release/beta-ready claim.
