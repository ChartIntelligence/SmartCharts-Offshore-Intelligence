# PELORA-02 — founder-authorized frontend local QA read-only guard

Isolated worktree C:/Projects/Pelora-Agent-Worktrees/pelora-02-local-qa-readonly-v1; branch codex/pelora-02-local-qa-readonly-v1. Exact parent 8e1c225f575d25adc3506e166b4e2a5be48bc7f3 (qualified shell/overlay candidate), canonical d5d40020 and accepted runtime4ea104d lineage. Both this initial checkout and separate shell checkout verified clean; no concurrent edits overwritten. Original P02 remains unchanged. Separate guarded implementation is founder authorized in this chat, after auto-review rejected coordination-only authorization. Approval permits six source files and dedicated tests/evidence; no launch/auth/API resolver changes. No duplicate agents.

Before: automatic Ocean Memory/saveOceanSnapshot and insertReportWithTime/report submit lacked explicit local QA write block. After: exact P01 helper checks VITE_PELORA_LOCAL_QA_READ_ONLY=1 and requires exact approved public Supabase URL plus http://127.0.0.1:8787 API override; missing/mismatched selected-QA configuration throws, never normal write fallback. Automatic effect skips QA/invalid mode before attempted IDs; both raw write helpers reject before row/evidence/client mutation. Report UI discloses read-only and disables save, and persistReport itself rejects independently of buttons. Error path retains exact local revision; no success callback/cleanup/saved-private claim. Form edits and automatic local account draft persistence remain enabled. Dashboard validates before any workspace acquisition effect may commit and shows configuration error instead of mounting unsafe workspace. Normal non-QA mode follows existing methods/evidence/selection/authority.

Helper exact P01 reference53ad0d86787794a9ccf6f5acfc289fa8db9df351; Git blob72cd55ebd49aedf763c8b285e57ff4c63f7a37ac, verified byte-identical. No modification of P01 helper/resolver/backend policy. New outer Dashboard gate is constant composition within principal-keyed shell; does not alter auth admission or authority invalidation.

Approved proposal SHA256: 4d73549a9c81efee053027732893afabbd9667a0ac8cd5d6721a5884fe6f4e0a. Its manually generated new-file header could not be applied directly on Windows; other five hunks applied after git apply --check, helper copied as exact Git bytes rather than retyped. Qualified six-source-file patch: C:/Users/User/AppData/Local/Temp/pelora-qualified-qa-guard-NYJgD2/source-guards.patch
SHA256: e58f868d89c443d36eda995478f3bdef3d64f5fe8442a7fbd85933f6b2766730

Exact staged source Git blobs:

```
100644 0bb11e652c2870b95588eea21de9c41e131e6506 0	frontend/src/components/Dashboard.jsx
100644 3ba83a4745b733cb5347e6aa907e9e76ce87fd02 0	frontend/src/components/FishingDayReportPanel.jsx
100644 4f235ef61c4324e4059b6d754089b7389ab22127 0	frontend/src/hooks/useOceanMemoryPersistence.js
100644 497bc1b214329af99666b9b8eeef3fcb65afed92 0	frontend/src/lib/oceanMemoryStorage.js
100644 2bfb0a7e991009b1b336731f8742782de679fbd2 0	frontend/src/utils/fishingLogTemporalCapture.js
100644 72cd55ebd49aedf763c8b285e57ff4c63f7a37ac 0	frontend/src/utils/localQaReadOnly.js
```

Dedicated files: localQaReadOnlyGuard.test.js, localQaReadOnlyAssertions.fixture.js, localQaSelectionCompatibility.test.js, localQaContractCompatibility.test.mjs, localQaReadOnly.static.mjs, this evidence. Existing suites/fixtures remain unchanged.

Controlled qualification from repository root; R=C:/Projects/Pelora-Agent-Worktrees/pelora-02-captain-experience/frontend/node_modules, read-only already installed dependencies; no package/env copy/install. Synthetic accounts/storage/client ports, no real service calls:
- node frontend/src/hooks/tests/localQaReadOnlyGuard.test.js R: 41/41 pass. Includes unchanged 29 actual React child continuity tests plus 12 QA policy/raw/automatic/UI cases. Actual exported helper invoked with explicit test environments; unchanged import-stripping host supports async exports. Direct actual saveOceanSnapshot/insertReportWithTime source rejects before clients; approved/missing/wrong-project/hosted/wrong-port config; normal raw snapshot result; actual automatic hook; actual Report partial draft bytes/submit error/no inserts/reload/account isolation; invalid Dashboard gate prevents acquisitions with honest error. Runtime mode injection lives only in test scope; production helpers receive no override from mutation callers.
- node frontend/src/hooks/tests/localQaSelectionCompatibility.test.js R: 19/19 original authority/race cases pass, non-QA policy binding false; all selection/science assertions retained.
- node frontend/src/hooks/tests/localQaReadOnly.static.mjs R: strict six-source scoped ESLint passes, zero errors/warnings, no repository config change.
- node frontend/src/hooks/tests/localQaContractCompatibility.test.mjs R: 10/11 temporal checks pass and all 7 Ocean Memory storage row-contract assertions pass. Single stale source-shape assertion expects setReport(createInitialReport()), already replaced by revision-safe continuity completion before this packet. Same command with baseline argument replays Report source from parent8e1c225 and reproduces exactly the same 10/11 result. Do not report this suite fully passed. Actual normal draft completion/newer revision/account guards are independently covered by the 29 unchanged React assertions; no unrelated test or code repair in this packet.
- git diff --check clean. Source reviewed scoped diff; no auth/API resolver/backend/P03/shared science/RLS/schema/manifest changes.

Limits: controlled source/React tests only; no browser/provider/auth/database/backend/preview launch, no migration, push, merge or production action. Configuration gate applies to authorized workspace acquisition; it does not modify earlier authentication/startup initialization or every standalone API resolver call, which remain P01 ownership. P01 backend read-only policy must be integrated and exact combined candidate independently reviewed by P04 before separately approved data-connected launch. QA helper is not database/RLS hardening or production permission. Existing inherited temporal assertion failure remains explicit. No developer PASS substitutes for independent acceptance, physical mobile, real-auth or operational-source qualification.
