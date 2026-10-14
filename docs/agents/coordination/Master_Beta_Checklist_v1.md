# Pelora master beta acceptance checklist v1

INTERNAL SANITIZED REQUIREMENT CHECKLIST — NOT A SECOND COMMAND BOARD OR NEW CANON. The [existing beta board](../../Beta_Command_Board_Current_State_v1.md) is the sole execution queue and authority for assignments. This checklist freezes requirement/evidence/gate reconciliation; it grants no source, science, service, migration, preview or production permissions.

## Status interpretation

COMPLETE applies only to the exact acceptance sentence, e.g. controlled mechanics/documentation; never automatically operational, preview, production or founder acceptance. IN_PROGRESS is evidenced unfinished work, not proof a session is running. NOT_STARTED means named closure lacks execution evidence. BLOCKED names a real prerequisite. NEEDS_REQUALIFICATION applies after changed/invalidated evidence, not merely unreviewed work. No completion percentage is calculated. Full dimensions/owners/tasks/SHAs/dependencies/gates in [machine-readable snapshot](Master_Beta_Checklist_v1.json).

Snapshot2026-10-14 America/New_York; no tests/build/device/Auth/DB/provider action for tracker. All original untracked artifacts/dependencies preserved; no private contents inspected. Current controlled4e1 is local code/evidence complete at scoped scope, NOT live/operational/preview/production/device/Beta complete.

## Requirements by ten categories

### Captain UX

| Stable ID | Acceptance | Status / owner | Exact evidence / dependency / beta blocker |
|---|---|---|---|
|UX.CONTROLLED|Exact integrated Today/Map/Intelligence/Profile navigation, owner/draft/signout and field lifecycle passes controlled independent QA with all exclusions retained.|COMPLETE / P01|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies none; approvals none; Beta blocker false|
|UX.LIVE|Real authenticated startup/returning mission/private Profile/report/navigation and valid governed selection verified without unintended writes.|BLOCKED / P04|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies SEC.PREVIEW, ACCESS.CONFIG; approvals G.PREVIEW, G.AUTH_ACTIONS; Beta blocker true|
|UX.FIELD_PLAN|Dedicated read-only field-test readiness document separates controlled/live/device evidence and measurements; owner reserved and reviewed.|NOT_STARTED / P02|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies MASTER_CHECKPOINT; approvals G.FIELD_MESSAGE; Beta blocker false|

### Living Ocean

| Stable ID | Acceptance | Status / owner | Exact evidence / dependency / beta blocker |
|---|---|---|---|
|LIVING.SOURCE_RECOVERY|Exact historical NOAA frame/archive/scalar/raw identity and current source contracts recovered without reacquisition.|COMPLETE / P01|`ea79e5a165aeb96cd93250441205da43352d74a2`; dependencies none; approvals none; Beta blocker false|
|LIVING.FIELDS_CONTROLLED|Qualified current sample traces/readout and existing ETOPO retained coverage/expiry/texture/contour behavior preserved in exact combined source.|COMPLETE / P03|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies none; approvals none; Beta blocker false|
|LIVING.OPERATIONAL_SCALAR|Actual admitted fresh SST/chlorophyll source observations, support/revision/coverage and independent map/mobile presentation—not old pilot or QA points.|BLOCKED / P03|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies LIVING.SOURCE_RECOVERY, SPEC.SOURCE_CONTRACT; approvals G.LIVING_COORD, G.SOURCE_ADMISSION; Beta blocker true|

### Seven species

| Stable ID | Acceptance | Status / owner | Exact evidence / dependency / beta blocker |
|---|---|---|---|
|SPEC.DOSSIER_BASE|Frozen seven-species primary claim/reference dossier/register exists with applicability and evidence gaps explicit.|COMPLETE / P05|`1e2b158531e5de1660ed324e32f27171bd7572dc`; dependencies none; approvals none; Beta blocker false|
|SPEC.VNEXT_RESEARCH|Expanded reproducible primary search/method screening and independent-reference applicability reviewed and checkpointed without score/policy invention.|IN_PROGRESS / P05|`1e2b158531e5de1660ed324e32f27171bd7572dc`; dependencies SPEC.DOSSIER_BASE; approvals none; Beta blocker true|
|SPEC.SOURCE_CONTRACT|Exact species-neutral interpretation contract/qualified relationship packets, source/time/depth/region applicability and negative scenarios independently reviewed.|BLOCKED / P01|`b2270987ffac63e4c4459bb71bdd282e6559b934`; dependencies SPEC.VNEXT_RESEARCH; approvals G.SCIENCE_POLICY; Beta blocker true|
|SPEC.SEVEN_ENGINES|All seven engines scientifically/source/contract qualified; Blue Marlin controlled software alone and six labels do not qualify other engines.|BLOCKED / P01|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies SPEC.SOURCE_CONTRACT, OBS.OPERATIONAL_HISTORY; approvals G.SCIENCE_POLICY, G.SHADOW_IMPLEMENTATION; Beta blocker true|

### Places / open water

| Stable ID | Acceptance | Status / owner | Exact evidence / dependency / beta blocker |
|---|---|---|---|
|PLACES.GOVERNED|Existing Place/Signal/Opportunity languages/static-parent identities and ranking permission remain distinct and tested at applicable scope.|IN_PROGRESS / P03|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies SPEC.SOURCE_CONTRACT; approvals none; Beta blocker true|
|PLACES.EXPANDED|Expanded governed Gulf Places/open-water species/context visibility validated without catch density or fabricated habitat/source coverage.|BLOCKED / P03|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies PLACES.GOVERNED, SPEC.SOURCE_CONTRACT; approvals G.SOURCE_ADMISSION; Beta blocker true|

### Observe / history

| Stable ID | Acceptance | Status / owner | Exact evidence / dependency / beta blocker |
|---|---|---|---|
|OBS.DURABLE_LOCAL|CP02 claims/fencing, CP03 immutable exact storage and CP05 explicit atomic consumed terminal transition retain their real local qualification.|COMPLETE / P01|`246f342eda17d34359166c401dddf9775e9150b4`; dependencies none; approvals none; Beta blocker false|
|OBS.OPERATIONAL_HISTORY|Approved independent scope/source admission, durable operational acquisition/recovery and exact as-used qualified history selection operate independently of captain activity.|BLOCKED / P01|`dadec5dbca7d360f70f633413fb6a347dc24cac1`; dependencies OBS.DURABLE_LOCAL, SPEC.SOURCE_CONTRACT; approvals G.PG_OPERATION, G.HISTORY_POLICY, G.SOURCE_ADMISSION; Beta blocker true|

### Four-hour publish

| Stable ID | Acceptance | Status / owner | Exact evidence / dependency / beta blocker |
|---|---|---|---|
|PUB.LOCAL_MECHANICS|Existing CP08/CP09/P4-A controlled stores/scheduling/fencing/recovery and result preservation qualified within recorded scopes.|COMPLETE / P01|`dadec5dbca7d360f70f633413fb6a347dc24cac1`; dependencies none; approvals none; Beta blocker false|
|PUB.OPERATIONAL|Six locked UTC cycles produce governed source/history/evaluation artifacts with exact cutoff, failed/partial/zero semantics, current captain read and truthful schedule authority.|BLOCKED / P01|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies OBS.OPERATIONAL_HISTORY, SPEC.SOURCE_CONTRACT; approvals G.PUBLICATION_SERVICE, G.SOURCE_ADMISSION; Beta blocker true|

### Nightly learn / audit

| Stable ID | Acceptance | Status / owner | Exact evidence / dependency / beta blocker |
|---|---|---|---|
|NIGHT.BLUEPRINT|Versioned nightly audit blueprint exists, reviewed only as design; exact remote identity independently read.|COMPLETE / P05|`aaabba4b9f327e860b4401ef35454a27b7ee6ff4`; dependencies none; approvals none; Beta blocker false|
|NIGHT.FIXTURE_PREP|Bounded historical-learning fixture preparation proposal follows canon/source/history/privacy; no learning execution or invented sample policy.|NOT_STARTED / P05|`1e2b158531e5de1660ed324e32f27171bd7572dc`; dependencies MASTER_CHECKPOINT, NIGHT.BLUEPRINT; approvals none; Beta blocker false|
|NIGHT.OPERATIONAL|Evidence audit/shadow learning actually runs on valid independently bound history/report support with human-reviewed proposals and no automatic production tuning.|BLOCKED / P01|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies NIGHT.BLUEPRINT, OBS.OPERATIONAL_HISTORY, PUB.OPERATIONAL; approvals G.HISTORY_POLICY, G.LEARNING_IMPLEMENTATION; Beta blocker true|

### Audience / enrollment / privacy

| Stable ID | Acceptance | Status / owner | Exact evidence / dependency / beta blocker |
|---|---|---|---|
|ACCESS.LEGACY_PROFILE|Qualified legacy owner-bound read/Profile/signout preserves owner isolation, readonly role, disabled Save and truthful drafts/ACK.|COMPLETE / P02|`4496a34cb1156629104d4b7ec90f6b4ae2b5d2b2`; dependencies none; approvals none; Beta blocker false|
|ACCESS.OFFLINE_CONTRACT|Exact v1.1 typed owner/generation/cursor/query/request/op correlation fixtures independently cleared before pure mobile prototype release.|BLOCKED / P01|`60bbacb22efb7ab4a0a8dde28becfdac9673dea4`; dependencies none; approvals G.ENROLL_REVIEW_MESSAGE; Beta blocker false|
|ACCESS.ENROLLMENT|25–30 applicants enrolled through verified capacity and server first-qualifying-login calendar term; Founder-only mobile admin, lifetime Founding and existing private data preserved.|BLOCKED / P01|`2f82b593ae4ffe871a1da9df44d51a521aaabfcd`; dependencies ACCESS.CONFIG, ACCESS.OFFLINE_CONTRACT; approvals G.CALENDAR_LOGIN_POLICY, G.MIGRATION_RLS, G.AUTH_ADMIN; Beta blocker true|
|ACCESS.CONFIG|Actual non-prod signup/SMTP/confirmation/invite/rate/redirect capability and deployed catalog reconciled via approved nonsecret readonly inspection.|BLOCKED / P01|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies ACCESS.LEGACY_PROFILE; approvals G.CONFIG_INSPECTION; Beta blocker true|

### Logs / feedback

| Stable ID | Acceptance | Status / owner | Exact evidence / dependency / beta blocker |
|---|---|---|---|
|LOGS.CONTROLLED|Existing private fishing draft success/failure/QA mutation suppression and report-read controls preserved with synthetic-port scope explicit.|COMPLETE / P02|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies none; approvals none; Beta blocker false|
|LOGS.LIVE_FEEDBACK|Real owner report/draft reload/eviction/recovery, truthful failure, structured field feedback and historical association validated; empty logs never absence evidence.|BLOCKED / P02|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies UX.FIELD_PLAN, UX.LIVE, OBS.OPERATIONAL_HISTORY; approvals G.LIVE_TEST; Beta blocker true|

### Security / QA / device / release

| Stable ID | Acceptance | Status / owner | Exact evidence / dependency / beta blocker |
|---|---|---|---|
|SEC.CONTROLLED_QA|Current exact controlled code/evidence closure accepted, failed histories/legacy harness/static exclusions remain explicit.|COMPLETE / P04|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies none; approvals none; Beta blocker false|
|SEC.SOURCE_PUSH|Exact new-branch nonforce source publication authorized, outgoing range checked then remote fullSHA verified, no denial workaround.|BLOCKED / P01|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies SEC.CONTROLLED_QA; approvals G.SOURCE_PUSH; Beta blocker true|
|SEC.PREVIEW|Separate exact supervised source/build/non-prod environment/asset/Auth sideeffects isolation approved and freshly qualified without replacingb0.|BLOCKED / P01|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies SEC.CONTROLLED_QA; approvals G.PREVIEW, G.AUTH_ACTIONS; Beta blocker true|
|SEC.DEVICE_FOUNDER|Actual phone/browser/GPU/navigation/battery/reload/field judgment meets independent/device/founder acceptance after approved preview.|NOT_STARTED / P04|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies SEC.PREVIEW, UX.FIELD_PLAN; approvals G.LIVE_TEST, G.FOUNDER_ACCEPTANCE; Beta blocker true|
|SEC.PRODUCTION|All mandatory operational/science/privacy/enrollment/device acceptance and explicit production release authority satisfied.|BLOCKED / P00|`4e1b49ba52c26089e24dd94f377109c13d8586b6`; dependencies SPEC.SEVEN_ENGINES, LIVING.OPERATIONAL_SCALAR, OBS.OPERATIONAL_HISTORY, PUB.OPERATIONAL, NIGHT.OPERATIONAL, ACCESS.ENROLLMENT, LOGS.LIVE_FEEDBACK, SEC.DEVICE_FOUNDER; approvals G.PRODUCTION; Beta blocker true|

## Reconciled identities and real limitations

- Current localapplication4e1b49ba52c26089e24dd94f377109c13d8586b6 clean; corrected documentation closure reuses495 exactruntime source. Remote candidate branch absent at latest check. Code contains consumer/Profile history; never upload via another branch to bypass exactsource gate.
- Enrollment latestLOCAL60bbacb22efb7ab4a0a8dde28becfdac9673dea4 is v1.1 with54 localchecks; originalad4c096 recorded48 finalchecks, earlier45 was intermediate. No independent P04 review dispatched/clearance due new-purpose rejection; P02 code not released. Cursor/query/request/operation correlations are implemented locally, not server authority.
- P05plan4d0d5e/dossiers1e2 exactfrozen docs do not qualify sevenengines. VNEXT24queries/6batches reported, screening/synthesis/search-log checkpoint unfinished. Nightly blueprintaaabba exactremote was freshly read matching local; no new push by this tracker. P05originalcheckout has10untracked, no tracked/staged changes; retain them. Actual originalcheckout branch is nightlyblueprint, not main—do not switch it.
- P03 recovery delivery toP01 now succeeded; do not retain old genericdelivery blocker. Distinct P01→P02 LivingOcean acknowledgment purpose still pending. Manifestcc0d876f hash verified;31artifacts/15sources counts are P03reported. September22T12Z is analysisreference, notobservation; freshnessUNASSESSED/supportUNKNOWN. Old frame not current and cannot substitute for operational SST/chl.
- Critical checkpointdadec5d on codex/pelora-remote-setup retains two unrelated untrackedSupabase files. CP02`8458c859eb4535631d8b47af9322e12790c0ad0f`, CP03`5ef987a74de774e857ddc2f12ea71f8c27df74eb`, CP05`246f342eda17d34359166c401dddf9775e9150b4` independently present; explicitatomic terminal transition supersedes historicaldeferred-check text. No restarting oldPhase2-only mission or Supabasedurability substitute.
- P04 workspace currently has1staged/1tracked and26untracked records atmetadata snapshot; not clean, not edited by P01. Counts only; no private contents or inferred QAcommit. Frozenb0cd2b1 sourceworkspace remainsclean/unchanged.

## Dependencies and active execution

Execution assignments, input references, reservations, output/P04/P05 gates and nextauthorized task are ONLY the board queue linked above. Existing owners/tasks unchanged; no duplicateagent or competingqueue. A_FIELD_TEST_READINESS and C_HISTORICAL_LEARNING_FIXTURES are queued documentation-preparation only, not actual test/learning runs. Their path reservations do not release execution before master checkpoint/actual binding/required communication permission. P05existingVNEXTresearch remains active independently; P01can finish authorized contracts/recovery/proposal work without granting blocked stages.

Human gates are exactsourcepush, separatepreview/Authsideeffects, specificdeniedmessages, actualconfig/catalog access, calendar/login policy and any migration/privilegedAuth/source/science/newinfrastructure or production action. No main/frozenpreview/Supabase/ReceiptWriter/sourceadmission/ranking change or Beta Ready claim.

## Additional existing-captain preview lane (Captain UX category)

StableID UX.FOUNDING_EARLY_PREVIEW: BLOCKED/P01, exact4e1candidate. Founder reports two existing productionFoundingCaptains with realreports; no account IDs/rows/reports inspected. Preserve lifetime/status/ownerRLS and workingapp availability. Isolatednonprodsynthetic/emptyreports cannot establish productionreportcontinuity; production-backedreadonly preview needs separateexplicitsecurity/target/session approval, never flipping the hardcoded QAguard to production. Beta blockerfalse for this optionalearly-preview milestone, while underlying privacy/live/device release requirements remain mandatory. Componentpath proposals/returnURL/privatefeedbackport need exactscope beforemount. Sole execution item Q.FOUNDING_PREVIEW onexistingboard, not a secondqueue.
