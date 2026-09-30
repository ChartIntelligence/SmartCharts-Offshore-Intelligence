# Beta Safety & Captain State v1

**BETA_SAFETY_CAPTAIN_STATE_V1_READY_FOR_CHECKPOINT_REVIEW**

Repository baseline and final HEAD: `3e92184b1a0aad9bafa07c7d078e839eb388537c` on `codex/pelora-remote-setup`. Candidate is uncommitted. This is local safety/state qualification, not a deployment, new scientific authority, or beta readiness.

The [checkpointed Beta Command Board](Beta_Command_Board_Current_State_v1.md) is unchanged: **FOUNDING_CAPTAIN_BETA_NOT_READY_FOR_LOCKED_OPERATING_MODEL** and **EIGHT_COHERENT_BETA_PACKAGES_REMAIN**. This reduces bounded P1/P2 findings and the selected-state defect; it does not close release verification or the locked operating model.

## What changed

A captain can still see qualified raw current observations. The old Current Edge card can no longer turn a paused diagnostic into either an edge claim or a claim that no edge exists. Today prose now reports observations/co-location instead of saying currents are shaping or developing a feature. No replacement calculation, source-unavailable state, score reweighting or scientific threshold was introduced.

A selected Opportunity now follows its identity into the latest governed collection. A refresh updates its rank, score, confidence, signal, coordinates and supplied narrative/continuity content. It does not keep the old object. Species, captain and trip-context changes invalidate the previous selection; obsolete requests cannot restore it. A rank-only refresh does not recenter the map or collapse an expanded sheet. Identity/coordinate changes retain the existing desktop/mobile recenter behavior.

Saved Reports now hide former-owner rows immediately and discard obsolete load/delete completions. A late initial Auth lookup cannot overwrite a newer logout or sign-in. Approved access also requires an existing `founder` or `founding_captain` role; unknown/missing roles fail closed. No role or approval workflow was added.

## Claim-containment inventory

| Output/path | Authority and result |
|---|---|
| Today Current, selected Current and map vectors | Raw observations retained, including availability/freshness labels, finite u/v handling, source/time and exact capture. Source availability is not confused with interpretation qualification. |
| SelectedTarget Current Edge | Former positive/negative diagnostic claim suppressed in both Map and target panel; its formatters removed. |
| Today Ocean Brief | Removed current shaping/feature-creation claims and development/persistence implications drawn only from confidence or co-location. Observation wording replaces them. |
| Convergence, divergence, shear, edge, eddy and legacy Physics diagnostic trees | Numerical/diagnostic producers still exist and execute; this package is not a scientific restart or a blanket deletion. These trees are not directly rendered as qualified captain intelligence after the edge-card change. Current convergence detection authority remains unresolved. |
| Governed Opportunity authority | Existing raw-current/co-located-transition gates remain. Four diagnostic injection tests plus twelve synthetic default-runtime evaluations show unchanged habitat/opportunity/signal/narrative outputs across the tested advanced current changes. No eligibility is granted by those diagnostics. |
| Captain Narrative / full analysis | Current governed translation retains point-current/co-location context and explicit limitations. Tested positive prose does not assert convergence/divergence/shear/upwelling/downwelling/current edges. Persistence association remains fail closed. |
| Negative-conclusion adequacy | Current spatial gradient coverage is still used for adequacy of a negative conclusion. It is not a positive eligibility grant; removing it would weaken an existing evidence gate, so it remains. |
| Historical continuity / legacy UI | Historical fallback stays explicitly historical and cannot restore current selection/rank. No stored history was rewritten. Dormant static recommendation/score components are not the App-to-Dashboard UI path. Arbitrary old externally stored prose was not authenticated by this audit. |

Evidence: [current runtime](../backend/server.js), [convergence decision](Governed_Current_Convergence_Decision_v1.md), [failure-locality contract](Current_Vector_Failure_Locality_Contract_v1.md), [new authority attacks](../backend/tests/betaSafetyPhysicsAuthority.test.mjs), [Today](../frontend/src/components/TodayDashboard.jsx), [selected panel](../frontend/src/components/SelectedTarget.jsx). Advanced Physics, model/source equivalence, scientific temporal support, historical selection and future species remain unqualified/paused as before.

## Selection and navigation

The same-ID defect was reproduced by rendering the actual HEAD Dashboard with React and sending a new same-ID collection: it retained the old object. The candidate passes that reproduction with refreshed governed content. This is an offline reproduction, not a live incident claim.

The [Dashboard](../frontend/src/components/Dashboard.jsx) resolves selection from the newest authoritative mapped list, never by rank. Its existing absent-identity behavior is preserved: close selection, return to exploration, and do not automatically reselect an identity that later reappears. Governed-zero does not revive a historical object. Manual Places selection and Close also clear governed selection.

Tests cover Today → Map → Intelligence, rank/score/evidence/narrative/coordinate updates, supplied trend/continuity metadata, species/origin/range/principal changes, manual exploration, disappearance/reappearance and future no-reload updates. Mobile and desktop use the same state; both map offsets are tested. Physical-device/layout acceptance is still open. No four-hour publication machinery was built.

## Access and private data

| Boundary | Local finding | Remaining release limit |
|---|---|---|
| [App](../frontend/src/App.jsx) → [FoundingCaptainAccessGate](../frontend/src/components/FoundingCaptainAccessGate.jsx) | Direct `?app=1` enters the gate, not Dashboard. Approved founder/founding captain admitted; pending/revoked/invalid status, unknown/missing role, anonymous/missing credential and mismatched owner denied. | Actual deployment routing/Auth configuration unverified. |
| Startup and revalidation | Initial Auth/access determination renders the gate-owned splash. A same-principal approved workspace survives pending revalidation; denial/error removes it. This preserves the existing lifecycle contract. | Revocation is observed on authorization revalidation; no new real-time revocation service was implemented. |
| Auth initialization | Newer Auth events win over pending session/anonymous initialization. Initial rejection fails closed. | Production session/redirect/logout acceptance unverified. |
| Saved Reports | Owner-filtered query/delete; defensive row-owner check; trip date descending then creation descending retained. User change/logout/loading/failure/late-request races cannot render the previous owner's rows in tested boundaries. | **DEPLOYED_RLS_NOT_VERIFIED**. |
| Fishing Logs | Existing coordinates, trip time/date, species, outcome, observations and private owner payload preserved. Failed save keeps the draft; no retry discards its evidence envelope. Principal-keyed workspace remount clears prior captain drafts. | No new immutable Opportunity context or automatic historical pairing implemented; real storage recovery/device checks remain. |
| Ocean/history persistence | Browser helpers use explicit user filters. Backend history uses captain bearer/public-key requests and relies on RLS for row isolation; it does not elevate to a service role. Prior-user request results are masked at the consuming hook. | Local review does not prove isolation if deployed policies are wrong. |

**APPLICATION_OWNERSHIP_BOUNDARY_VERIFIED** is distinct from deployed security. Reviewed policies include [captain access](../supabase/migrations/20260810_captain_access_v1.sql), [report ownership](../supabase/migrations/20260801_fishing_day_reports_baseline_v1.sql), [snapshot ownership](../supabase/migrations/20260802_ocean_snapshots_v1.sql) and [privilege hardening](../supabase/migrations/20260925_client_privilege_hardening_v1.sql). None was applied. Production Auth, effective grants/RLS, recovered reports and phone acceptance remain required release checks.

## Exact candidate and hunk authority

All production changes are frontend-only. Backend/shared production, formulas, dependencies, migrations and existing scientific tests are unchanged.

| Production file | Hunk authority |
|---|---|
| [Dashboard.jsx](../frontend/src/components/Dashboard.jsx) | SELECTED_OPPORTUNITY_AUTHORITATIVE_REFRESH; SELECTED_OPPORTUNITY_INVALIDATION; FAILED_AUTHORITATIVE_REFRESH_SELECTION_INVALIDATION |
| [SavedFishingDayReports.jsx](../frontend/src/components/SavedFishingDayReports.jsx) | SAVED_REPORT_OWNER_STATE_PROTECTION |
| [SelectedTarget.jsx](../frontend/src/components/SelectedTarget.jsx) | UNQUALIFIED_SCIENTIFIC_CLAIM_CONTAINMENT; DOCUMENTARY_PERSISTENCE_CLAIM_CONTAINMENT; NAVIGATION_STATE_CORRECTNESS |
| [TodayDashboard.jsx](../frontend/src/components/TodayDashboard.jsx) | UNQUALIFIED_SCIENTIFIC_CLAIM_CONTAINMENT |
| [useCaptainAccess.js](../frontend/src/hooks/useCaptainAccess.js) | CAPTAIN_ACCESS_FAIL_CLOSED |
| [useDynamicOpportunities.js](../frontend/src/hooks/useDynamicOpportunities.js) | CAPTAIN_CONTEXT_RACE_PROTECTION |
| [useMapLibreOpportunitySelection.js](../frontend/src/hooks/useMapLibreOpportunitySelection.js) | SELECTED_OPPORTUNITY_AUTHORITATIVE_REFRESH; NAVIGATION_STATE_CORRECTNESS |
| [useSupabaseAuth.js](../frontend/src/hooks/useSupabaseAuth.js) | AUTH_LIFECYCLE_STATE_PROTECTION |

Tests: [new captain-state suite](../frontend/src/hooks/tests/betaSafetyCaptainState.test.js), [new Physics admission suite](../backend/tests/betaSafetyPhysicsAuthority.test.mjs), and [existing access lifecycle suite](../frontend/src/hooks/tests/captainAccessLifecycle.test.js). The existing suite's three approved fixtures gained the established role field; original behavioral assertions remain. Together with this report and its [JSON evidence](Beta_Safety_Captain_State_v1.json), candidate scope is **13 files, UNKNOWN = 0**.

## Verification

| Scope | Final result |
|---|---|
| New focused tests | **77/77**: 71 frontend state/access/presentation cases and 6 backend admission cases (including 12 synthetic runtime evaluations). |
| Existing access lifecycle | **14/14**, included in frontend totals below. |
| Full frontend replay | **22/22 scripts**; 159 node:test cases plus 12 assertion scripts without individual case totals. |
| Package replay | **28/28 scripts**, 442 node:test cases; includes the frontend replay, new backend suite and unchanged scalar/receipt dependencies. |
| Scalar/receipt dependencies | Scalar focused 41, adversarial 69, boundary 46; receipt focused 60, adversarial 61. Included in package totals. |
| Governed current-runtime/backend/shared profile | **88 intended / 88 started / 88 completed / 88 passed; 2,069 node:test cases and 50 explicit manual cases.** |
| Normalization critical | **65/65 across 7 scripts**, included in the 88-script profile. Historical availability and affected Opportunity governance suites are also included there. |
| Failures / skips / cancellations | **0** in final qualification. Frozen archival dispositions remain unchanged; excluded historical assertions are not counted as passing. |
| Network | **0 operational outbound attempts**, with denial preloads and matching 88 + 28 process lifecycle records. Synthetic transports only. |
| Static | 11 executable files parse; 36 relative module references resolve; JSON/report links checked; `git diff --check` clean. One pre-existing Today whitespace line is unchanged. |
| Preservation | 1,985/1,994 baseline tracked files byte-identical; the nine tracked changes are eight frontend production files and one fixture-only test change. All 177 protected artifacts, 20 historical suites, four governed backend hashes, dependency/lockfiles and 272 tag refs preserved. |

The initial isolated profile attempt lacked a retained `source.nc` fixture and was stopped. The fixture was copied from the prior qualified local checkout and its hash verified; the full 88-script run was restarted successfully. No environmental acquisition occurred. The baseline reproduction's ten expected failures are separate evidence, not final candidate failures. The final frontend replay follows the final UI edits; the 88-script backend/shared source closure is unchanged throughout. Do not add the overlapping dependency counts as unique coverage.

Receipts, exact executable hashes and detailed accounting are retained locally at:
`C:\Users\User\AppData\Local\Temp\pelora-refresh-fix-d12eea7a0eed438da3d09bd30e4db986`.

## Remaining gates and stop

Receipt Writer **DISABLED**; receipt migration **UNAPPLIED**; deployment **NOT QUALIFIED**. **POSTGRES_TLS_ENDPOINT_REQUIREMENTS_NEED_DEPLOYMENT_CONFIGURATION** remains open. Projection V3 remains quarantined/excluded. Ocean Physics, Convergence, 12B.6C and 9E-D remain paused. No new species, background Observe, shared history, four-hour publisher or nightly audit was implemented.

The corrected local candidate is ready for checkpoint review after the restarted adversarial pass. P1 still needs authorized live release/access/private-data verification, including effective policies/grants, Auth redirects/session behavior, recovered reports and real-device acceptance. The locked operating model remains incomplete. **LIVE_PRODUCTION_STATUS_NOT_ESTABLISHED_FROM_REPOSITORY**.

Tracked candidate edits remain unstaged. The two added tests and two package documents remain untracked alongside the unchanged excluded `supabase/.gitignore` and `supabase/config.toml`. No external services, providers, Auth, database or Supabase were accessed; no migration, writer enablement, staging, commit, tag, push or deployment occurred. Stop for human checkpoint review; no next implementation package started.

## Restarted review and preserved STOP history

The original Current Edge/shaping-claim containment and same-ID stale-object correction remain. A later review reproduced **Persistence: Developing** from documentary organization history. The next review stopped at **PERSISTENCE_AUTHORITY_SIGNAL_REQUIRED**: the consumed context has no affirmative qualified rendering authority. Human authorization then allowed neutral omission. SelectedTarget now omits its persistence tile/formatter and related fallback sentence, without deleting backend history or showing a negative conclusion. Five actual-builder lifecycle states and eight missing/malformed/diagnostic variants pass; raw **1.25 kt toward 090°** remains visible. **NO_CURRENT_QUALIFIED_PERSISTENCE_RENDERING_FIXTURE** remains true. **FUTURE_QUALIFIED_PERSISTENCE_AUTHORITY_REQUIRED_FOR_RENDERING** is deferred to separately governed shared-history/publication work.

That review then reproduced **LATENT_SELECTION_RESURRECTION_AFTER_FAILED_AUTHORITATIVE_REFRESH**. Dashboard hid X after request failure but retained its identity, so retry silently reopened it. The corrected existing selection owner clears intent only on active terminal failure with no authoritative collection (or existing successful absence/zero/context invalidation). Loading alone retains intent. Retry may restore collection X but cannot select it; explicit reselection works. No tombstone or duplicate selection state was added.

Fresh real-React tests cover changed-X retry, retry without X/later reappearance, successful refresh and zero, all four obsolete/current success/failure combinations, rapid A/B/C, context/logout, access role/owner/status matrix, pending/approved/revoked transitions, Auth initialization races, Saved Reports A/B/A and remount. **71/71 frontend focused/adversarial cases** pass; **14/14 existing access lifecycle cases** pass separately within the frontend total. A separate **1/1** actual Dashboard/hook diagnostic verifies Intelligence loses the selected-object linkage; normal default-top presentation after recovery remains unchanged. No claim of physical-device acceptance.

The final isolated replay is fresh: **28/28 package scripts, 442 node cases**, including **22 frontend scripts / 159 node cases plus 12 completion-only scripts**. The governed profile remains **88/88 scripts, 2,069 node cases plus 50 manual cases**, with zero failures/skips/cancellations and zero operational network attempts. Normalization **65/65** overlaps that profile. No production/test edits followed replay. This corrects local consumer/state defects only: **DEPLOYED_RLS_NOT_VERIFIED**, production Auth/recovered reports/device acceptance unverified, four-hour publishing/Continuous Observe/Nightly Audit incomplete, beta not ready.
