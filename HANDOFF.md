Pelora — engineering handoff (2026-10-19)

Incoming engineer: Claude Code. BETA IS NOT READY. This is an evidence-bounded handoff based on the public GitHub repository ChartIntelligence/SmartCharts-Offshore-Intelligence (inspected primarily at 09dfac11ccbf992b8eea7dd36dfe1cd4e8ac7972), repository governance and founder/agent reports through October 19. The author did not execute code, tests or live services for this handoff. Many newer qualified changes are local-only Windows worktrees, not pushed to GitHub. “Reported” is not independently reproduced here; “unverified” means do not assume.

1. Overview and exact beta-complete definition

Pelora is an offshore Ocean Intelligence application for fishing captains: Understand → Discover → Investigate → Decide → Record → Learn. It interprets changing ocean conditions, distinguishes environmental Ocean Signals from governed fishing Opportunities, supports captain decisions, privately records fishing observations and learns from historical evidence. It is not a navigation chart, popularity heatmap or catch guarantee. Gulf of Mexico first; region-agnostic architecture for global expansion. Seven species: Blue Marlin, Yellowfin Tuna, Blackfin Tuna, Mahi, Sailfish, White Marlin, Wahoo.

Permanent production home: https://peloraoffshore.com — ONE evolving application. Preserve existing Founding Captain accounts, reports and lifetime access. Mission: “The ocean is talking. Pelora helps you listen.” Principle: “The ocean speaks first. Pelora translates. The captain decides.” Confidence refers to strength of evidence, not fish presence or catch probability.

Beta complete requires all of the following (not just passing isolated tests):

1. Integrated Today/Map/Intelligence workflow, persistent map and captain mission/context, clear Places vs Ocean Signals vs ranked Opportunities, correct loading/degraded/unavailable states, physical iPhone acceptance.
2. Durable, versioned Gulf bathymetry served from Pelora-controlled storage through provider outages and restarts, with honest coverage/resolution; no live-refresh dependency for stable contours.
3. Operational scientifically qualified SST, chlorophyll/water color, currents, wind/waves/swell with observation/validity times, freshness, provenance, uncertainty and qualified multi-source resilience.
4. Server-side 24/7 Continuous Observe independent of captain sessions, durable Ocean State and recovery.
5. Governed publication at 00/04/08/12/16/20 UTC, persistent multi-cycle/day feature identity, latest-published read on app open (no new discovery on open), legitimate governed-zero outcomes.
6. Scientifically qualified evidence and interpretation for all seven species, separate Signals/Opportunities, ranking only after evidence gate; no unsupported claims.
7. Owner-private Fishing Logs/Saved Reports with real read/write/retry/recovery and immutable historical ocean pairing; operational privacy-safe Nightly Learn / Daily Evidence Audit.
8. Founder/Founding Captain lifetime access protected; Founder-approved Beta Captain one free calendar year from server-proven first postapproval qualifying login, UTC, Feb 29 → Feb 28 anniversary in non-leap years.
9. Live SDK/Auth/RLS/API/storage, restart/durability, staging, rollback, actual captain/device acceptance, controlled integration into existing production services and explicit founder BETA READY authorization.

Do not silently redefine full beta as a reduced pilot. Any limited pilot requires separate founder approval.

2. Tech stack, architecture and file map

Verified at 09dfac11: JavaScript ES modules, Node.js backend, React 19, Vite 8, React DOM, MapLibre GL 5, Leaflet/react-leaflet, Supabase JS v2, @js-temporal/polyfill, ESLint. Frontend dependencies in frontend/package.json. Backend package.json defines scripts but no dependency list; verify runtime resolution. Node 24.18.0 was used for one isolated preview build, not proven production runtime. Supabase provides PostgreSQL/Auth/PostgREST; a separate local PostgreSQL 18.6 installation and durability qualification were blocked/unverified.

Reported production Render: frontend velion ([service-id redacted], recorded source 23d5daf…); backend velion-ocean-engine ([service-id redacted], recorded source 7e9d7b1…), both configured from main. Documentary ancestry: 7e9d7b1 → 23d5daf → 09dfac11 → e24d679. Actual live config/runtime/restoration unverified. Separate Render validation services are temporary staging, not a second Pelora product. Preview-specific e24d679 is NOT a production release candidate.

React browser → frontend/src/utils/peloraApi.js → Node backend/server.js /api/* (Vite dev proxy localhost:8787, documented production default https://velion-ocean-engine.onrender.com). Browser directly uses Supabase for Auth/access/reports; backend uses Supabase for governed memory/history. X-Pelora-Persistence-Project and matching backend acknowledgement are intended to fail closed for memory on project mismatch. Ocean source adapters → Observe workers → governed Ocean State/evidence → scientific interpretation → publication → UI. This complete operational chain is not yet qualified.

|Path                                                                                                                                                              |Purpose                                                                                                             |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
|`AGENTS.md`                                                                                                                                                       |Governance router; read first.                                                                                      |
|`docs/PELORA_PRODUCT_CONSTITUTION.md`, `PELORA_SCIENCE_GOVERNANCE.md`, `PELORA_PRIVACY_AND_EVIDENCE_RULES.md`, `PELORA_RELEASE_GATES.md`, `PELORA_DECISION_LOG.md`|Canonical product/science/privacy/release rules.                                                                    |
|`docs/Beta_Command_Board_Current_State_v1.md`, `docs/agents/EXECUTION_BOARD_v1.md`                                                                                |Historical beta critical path and owners; local master may be newer.                                                |
|`frontend/package.json`, `frontend/vite.config.js`                                                                                                                |Vite dependencies/scripts and `/api` development proxy.                                                             |
|`frontend/src/main.jsx`, `App.jsx`                                                                                                                                |StrictMode entry; `?app=1` captain gate, otherwise public landing.                                                  |
|`frontend/src/components/FoundingCaptainAccessGate.jsx`, `CaptainSignIn.jsx`, `CaptainProfile.jsx`                                                                |Auth/access/profile.                                                                                                |
|`frontend/src/components/Dashboard.jsx`, `TodayDashboard.jsx`, `PersistentMapShell.jsx`, `PeloraStartupFlow.jsx`                                                  |Captain workspace/startup.                                                                                          |
|`frontend/src/components/MapLibreIntelligenceMap.jsx`, `LayerControls.jsx`, `MapLegend.jsx`, `LocationSearch.jsx`, `SelectedTarget.jsx`                           |Map/layers/search/selection.                                                                                        |
|`frontend/src/components/FishingDayReportPanel.jsx`, `SavedFishingDayReports.jsx`                                                                                 |Fishing reports.                                                                                                    |
|`frontend/src/hooks/useSupabaseAuth.js`, `useCaptainAccess.js`, `useCaptainContinuity.js`                                                                         |Auth/access/continuity.                                                                                             |
|`frontend/src/hooks/useOceanMemoryPersistence.js`, `frontend/src/lib/oceanMemoryStorage.js`                                                                       |Snapshot storage; corrected successor exists in local worktree.                                                     |
|`frontend/src/hooks/useMapLibreOceanFields.js`, `frontend/src/utils/oceanFieldPresentation.js`                                                                    |Ocean fields/rendering.                                                                                             |
|`frontend/src/lib/supabase.js`, `frontend/src/utils/peloraApi.js`                                                                                                 |Supabase client, common API URL resolver.                                                                           |
|`backend/server.js`                                                                                                                                               |Main HTTP API/orchestration; complete route inventory unverified.                                                   |
|`backend/fields/{datasetRegistry.js,erddapAdapter.js,fieldService.js,scalarRuntime.js}`                                                                           |Spatial field catalog/acquisition; see `backend/fields/README.md`.                                                  |
|`backend/oceanState/{noaaNetcdf.mjs,noaaSstSource.mjs,sstWorker.mjs,publicationWorker.mjs}`                                                                       |NOAA SST and ocean-state worker.                                                                                    |
|`backend/currentProviderAdapter.mjs`, `currentEvidenceCapture*.mjs`, `sourceNormalization.mjs`, `scientificAssessment.mjs`                                        |Provider/evidence normalization.                                                                                    |
|`backend/observe/*`                                                                                                                                               |Observe worker/jobs/activation/provenance.                                                                          |
|`backend/durableObserve/*`                                                                                                                                        |PostgreSQL SQL, receipts, storage, scheduler, recovery and privilege manifests; existence does not prove activation.|
|`backend/tests/*`, `frontend/src/{hooks,utils,lib}/tests/*`                                                                                                       |Focused tests, often mocked.                                                                                        |
|`supabase/migrations/*`                                                                                                                                           |Reports, snapshots, access, history, RLS/grants; tracked SQL ≠ deployed state.                                      |
|`database/{processed,raw_data,schemas}/*`                                                                                                                         |Structures and schemas; not proof of durable Gulf bathymetry.                                                       |
|`docs/agents/*`, `docs/qualification/*`, `scripts/*`                                                                                                              |QA/coordination evidence and utilities.                                                                             |
|`node_modules/`                                                                                                                                                   |Appears tracked on `main`; dependency/reproducibility debt.                                                         |

3. Local setup, environment and tests

Reported Windows checkout: C:\Projects\SmartCharts-Offshore-Intelligence; newer worktrees: C:\Projects\Pelora-Agent-Worktrees. First inspect, do not reset/clean/merge: git status --short, git branch -avv, git worktree list, git log --all --oneline. Remote main at inspection was 851fde53c587afc8e572d4abd54b1a3553a753ee, not necessarily newest integrated code.

Source-defined commands (NOT executed for this handoff):

cd frontend
npm ci
npm run dev
# Separate terminal from repo root:
cd backend
npm run dev
# Backend dev = node --watch server.js; start = node server.js
npm test
npm run test:check
node tests/oceanFields.test.js
node tests/sstWorker.test.js
# Frontend terminal:
cd frontend
npm run lint
npm run build
node src/utils/tests/oceanFields.test.js
node src/hooks/tests/useMapLibreOceanFields.test.js

Vite prints its URL; /api proxy targets http://localhost:8787. Backend package dependency resolution, npm install success, full test runner, real provider access and PostgreSQL test prerequisites unverified. Inspect side effects before tests.

Known environment-variable names only: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_PELORA_API_BASE, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, VITE_OCEAN_SAMPLE_QA, PELORA_TEST_OCEAN_CONDITIONS. Preview-only: VITE_PELORA_FOUNDER_HTTPS_PREVIEW, VITE_PELORA_LOCAL_QA_READ_ONLY. Deprecated: VITE_OCEAN_API_BASE (frontend README says no longer read). NOT exhaustive: other provider/worker/PostgreSQL/Render variables are unverified; inventory process.env, import.meta.env, manifests and deployment settings by name only. Never include values or secrets.

4. External services, sources and status

|Service/source                                 |Purpose                                |Status/quirks                                                                                                                                                                              |
|-----------------------------------------------|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Render                                         |Production frontend/backend and staging|Existing production reported functional; validation backend exact rollback/config restoration unverified. Free-tier cold starts/shared quotas. Support pending.                            |
|Supabase Auth/Postgres/PostgREST               |Accounts, RLS, reports, snapshots      |NonProd `[project-ref redacted]` catalog 15 columns/7 constraints and owner grants checked; dashboard says “0 of 6 tables exposed”; effective authenticated REST unverified. Support pending.|
|NOAA OSPO `noaacwBLENDEDsstDaily` v1.0         |L4 blended SST                         |Historical pilot; operational temporal-support/freshness BLOCKED. NOAA inquiry sent 2026-10-19, pending.                                                                                   |
|NASA MUR SST                                   |Global alternative SST                 |Candidate, not admitted/operational.                                                                                                                                                       |
|Copernicus Marine physics                      |Currents/temperature/salinity          |Candidate/partial integration; operational status unverified.                                                                                                                              |
|Copernicus Ocean Colour, Sentinel-3, NOAA VIIRS|Chlorophyll/water color                |72h direct/gap-filled governance, multi-source operational resilience incomplete.                                                                                                          |
|NOAA CoastWatch currents                       |Sampled u/v currents                   |~0.25° samples, m/s, degrees-toward; **not** a continuous velocity surface.                                                                                                                |
|Open-Meteo Marine                              |SST/waves/currents alternative         |Nearest retained SST alternative per P03; P05 has NOT qualified operational use. Commercial terms/limits unverified.                                                                       |
|NOAA ETOPO/ERDDAP                              |Bathymetry grid                        |Adapter and short-lived cache; durable retained coverage/outage resilience OPEN.                                                                                                           |
|GEBCO                                          |Global bathymetry candidate            |Local installed dataset/coverage unverified.                                                                                                                                               |
|Wind/waves/swell providers                     |Marine conditions                      |Earlier reported live; exact current providers, quotas and live health unverified.                                                                                                         |
|Porkbun                                        |Domain/email                           |Founder owns peloraoffshore.com; preserve DNS.                                                                                                                                             |
|GitHub                                         |Source and coordination history        |Newest local qualified branches often unpushed.                                                                                                                                            |

Upstream provider rate limits are unverified. Pelora’s own field-service limits from backend/fields/README.md: density 4–48 bathymetry/4–20 currents; max 2,600 bathymetry cells, 500 vector cells, 2MB upstream JSON, 500KB envelope, four in-flight acquisitions, 32 cached requests, five-minute cache TTL and one-minute latest-time metadata TTL. Currents >96h may display stale with labeling. These are NOT provider quotas. Do not substitute chlorophyll 72h/current 96h as SST policy.

5. Current feature status

These are end-to-end beta capability statuses, not statements that no subcomponent has tests. “Broken” means the required operational behavior is blocked or demonstrably wrong; it does not necessarily mean the deployed site crashes.

|Feature                                          |Status           |Evidence / missing acceptance                                                                                 |
|-------------------------------------------------|-----------------|--------------------------------------------------------------------------------------------------------------|
|Existing production public site and captain entry|Done but untested|Founding Captains reportedly use it; not independently accessed for this handoff.                             |
|Founding Captain report owner isolation          |Partially built  |P04 accepted a scoped two-owner synthetic exercise; no general RLS/privacy certification.                     |
|Unified Today/Map/Intelligence UI                |Partially built  |Controlled App/navigation tests; live integration and device acceptance open.                                 |
|Mobile continuity                                |Partially built  |Reported synthetic 6/6 PASS; physical iPhone acceptance not done.                                             |
|Durable Gulf bathymetry                          |Partially built  |ETOPO field exists; durable retention and outage survival not qualified.                                      |
|Operational SST current-condition intelligence   |Broken           |NOAA L4 temporal support unqualified; no alternative admitted.                                                |
|Operational chlorophyll multi-source             |Partially built  |Governance exists; live fallback/resilience not qualified.                                                    |
|Currents/flow presentation                       |Partially built  |Sampled-vector contracts and UI work; operational qualification incomplete.                                   |
|Wind/waves/swell                                 |Done but untested|Previously reported live; current deployment/provider health unverified.                                      |
|Continuous Observe                               |Partially built  |Worker/durable modules exist; operational 24/7 loop incomplete.                                               |
|Four-hour governed publication                   |Partially built  |Contracts and controlled modules exist; live fixed slots/latest-published consumption incomplete.             |
|Ocean Signals and governed Opportunities         |Partially built  |Ranking/explainability/evidence architecture exists; live publication and scientific admission incomplete.    |
|Seven species intelligence                       |Partially built  |Blue Marlin most developed; equal seven-species operational qualification missing.                            |
|Nightly Learn / Daily Evidence Audit             |Not started      |Operational scheduled loop not demonstrated, though blueprints/components exist.                              |
|Fishing Logs / Saved Reports                     |Partially built  |Existing reports; successor live write/retry/recovery/owner transitions unqualified.                          |
|Snapshot persistence                             |Partially built  |Local correction reportedly P04 88/88, React 80/80, full-App synthetic 12/12; live SDK/durability unqualified.|
|Read-only SDK probe                              |Done and tested  |Reported P04 82/82 **offline**; live probe not run, composition blocked.                                      |
|Beta Captain entitlement                         |Partially built  |Resolver 31/31 offline; fresh postapproval session authority unproven; no live activation.                    |
|Production release/rollback                      |Partially built  |Source lineage known; runtime/config compatibility and exact restoration unqualified.                         |
|Physical founder/captain beta acceptance         |Not started      |No accepted full physical-iPhone beta run.                                                                    |
|Commercial pricing and paid conversion validation|Not started      |No verified paid conversion/willingness-to-pay evidence.                                                      |

6. Known bugs, roadblocks, attempts and hypotheses

1. Snapshot acknowledgment defect — demonstrated in controlled tests. Old helper accepted missing/mismatched returned row as created, conflicting duplicate as already-exists, uncertain commit without reconciliation, and late completions after owner/session changes. Fake-SDK characterization 43/43 reproduced; local correction 7d53e2e4f0e12092df3b8579c01b1f74fa5c0c47 reportedly P04 88/88; React f7ee570af51a05c8e5d08d948d91d55040a43a4f 80/80; full-App 4e013d4e68f1f16f575967a31fb307a48b74f9ec 12/12. Do not assume these local commits are in remote. No production data loss or false governed publication demonstrated.
2. SDK probe composition BLOCKED. Local c6c7b25f531a9369f750f1ba60e56ac458108038 passed 82/82 offline, but current Supabase SDK singleton lacks probe construction-time transport/Auth controls. P04 rejected composition. Need a session-owning adapter or supported alternative without token extraction or changing RLS; no live request attempted.
3. Data API exposure ambiguity. NonProd catalog matches mapper (15 columns, seven constraints, six indexes, RLS owner policies and authenticated SELECT/INSERT grants), yet Supabase dashboard says “0 of 6 tables exposed”. Could be dashboard semantics or an independent Data API restriction; cause unverified. Support response not guaranteed on Free plan. A tightly bounded real authenticated read-only test was proposed, but not executed.
4. NOAA SST operational freshness BLOCKED. Nominal analysis timestamp does not establish underlying observation windows, weighting, older-data handling, revision/publication timing or analysis_error meaning. P05 correctly blocked current-condition claim. An October 19 inquiry is pending; earlier NOAA correspondence was unanswered. Evaluate alternative qualified products rather than fabricate thresholds.
5. Bathymetry retention unverified. Existing ETOPO adapter/cache (field README says five-minute cache) does not establish durable stored Gulf contours or outage/restart resilience. Dedicated test/evidence path reservation was blocked by routine agent communication permission; no definitive PASS. Likely gap is persistent dataset/tiles and serving fallback, but this is a hypothesis until asset inspection.
6. Continuous Observe/PostgreSQL incomplete. Worker/SQL/recovery modules and bounded tests exist; local PostgreSQL installer was launched but final binary/cluster/transactions/restart/durability not qualified. Do not restart installer blindly. Receipt Writer enablement, historical migration, fixed-slot operational publishing and latest-published consumption remain unqualified.
7. Render rollback/restoration unresolved. Original backend source is recoverable but retained deployed artifact, runtime and config restoration are not proven. Render Support was contacted (transcript reference [redacted]); only general AI documentation received, service-specific answer pending. Alternative isolated backend would require a new hostname and newly qualified frontend binding; no paid service authorized.
8. Beta Auth authority blocked. Supabase Auth 2.197.0 documentation supports session correlation but not proven causal ordering of a fresh session after committed Founder approval, same-session success, and serialized current revocation state. P04 accepted the gated design, not implementation authority. Supabase inquiry submitted; no guaranteed response. Never substitute client timestamps/session refresh for proof.
9. Production integration is not release-qualified. Documentary audit established one source lineage, not that new frontend works against deployed backend, production Supabase, CORS, reports or real devices. Offline 44/44 and snapshot constraint replay 47/47 were bounded. Avoid blindly switching Render branches or deploying preview wrapper.
10. Coordination bottleneck. Six separate Codex conversations (Coordinator, P01–P05) can communicate directly, but automatic purpose-specific approval checks repeatedly blocked routine acknowledgment/report delivery. Founder spent excessive time copying prompts. GitHub bridge shares artifacts but does not directly message active agent sessions. New engineer should own integrated execution rather than reproduce the same approval loop.
11. Uncertain old/historical report evidence. Two early founding-captain reports were previously reassociated in Founding Captain work; original report preservation and RLS must be reverified before migration/release, without inspecting private content unnecessarily.
12. Other unverified runtime bugs: API wildcard CORS risk, anonymous bootstrap/OTP/logout/default session behavior, deployed schema/RLS mismatch, unknown downstream consumers of synthetic snapshots, and UI/GPU/mobile performance. These are open risks, not demonstrated production incidents.

7. Locked decisions and coding conventions

• ONE Pelora at PeloraOffshore.com. Validation URLs and worktrees are temporary. Protect captain accounts, reports and lifetime entitlements.
• Ocean speaks first; evidence confidence is not catch probability. Ocean Signals and Opportunities remain separate; zero ranked opportunities is legitimate. Numeric score never independently grants ranking.
• Fixed six-slot UTC publish; 24/7 Observe independent of captain sessions; Nightly Learn separate. Published objects persist through cycles and app reopen.
• Freshness per layer; stale labeled latest available with age, suppress unsupported current numerical claims; loading is not unavailable; unavailable must have reason. Chlorophyll 72h direct/gap-filled hierarchy is locked. Do not transfer its threshold to SST; currents have separate rules.
• Governed Places are species/context filtered for presentation, not deleted from catalog. Environmental observation buoys are infrastructure, not fishing opportunity markers. Rank numbers reserved for governed Top Opportunities.
• Fishing Logs private by default; optional anonymous sharing never reveals captain identity; no bait/lure/trolling-speed/presentation/photo collection. Historical ocean evidence immutable and backdating supported.
• Captains control origin/range/species; map exploration remains independent; one persistent mobile/desktop workspace. Preserve mission, drafts, map and selected Opportunity across navigation.
• Map flow from sampled NOAA u/v cannot be depicted as continuous measured trajectories. Label Currents, direction-toward and knots correctly.
• Code uses ES modules, React hooks, backend source/adapter boundaries, explicit provenance and fail-closed error states. API callers should use resolvePeloraApiUrl; no independent hardcoded backend origin. StrictMode cleanup and owner/session epochs matter.
• Governance: AGENTS.md routes to canonical docs. Status vocabulary designed/documented/implemented/tested/qualified/committed/pushed/integrated/deployed/live/beta ready are distinct. A PASS must state environment, exact SHA and limitations. No production merge/deploy, schema/RLS change, secret access, provider admission or scientific-policy change without human approval.

8. Technical debt and half-finished refactors

• Many branches/worktrees (84 were reported), local-only checkpoints, overlapping qualification docs and disconnected integration candidates. Need a read-only inventory and an explicit single integration candidate, not indiscriminate merges.
• node_modules/ appears tracked on remote main; dependency/lockfile hygiene and backend dependency declaration need review.
• Large backend/server.js mixes API/environmental concerns; provider extraction/Observe decomposition is partial. Avoid rewriting wholesale until behavior is characterized.
• Old preview-only wrappers and synthetic QA controls must not leak into production; static frontend builds bind environment values at build time.
• Multiple provider/capture adapter generations (V2/V3) and historical fixture code; map which is actually reachable before deleting or consolidating.
• Field service cache is short-lived; persistent bathymetry and durable environmental storage are separate missing requirements.
• PostgreSQL durability, publication receipt writer, source history selection, nightly audit and operational scheduling are incomplete despite many SQL files/tests.
• Current source documentation and local Master are out of sync with GitHub; status reports can be stale or overly optimistic.
• Real data-source licensing, provider quotas, observation support and per-region coverage need exact qualification.
• Existing README is sparse; reproducible end-to-end setup, env inventory and release scripts need validation.

9. Prioritized remaining work (rough engineering sizes, not dates)

|Order|Work                                                                                                           |Size        |Acceptance                                                                                                   |
|-----|---------------------------------------------------------------------------------------------------------------|------------|-------------------------------------------------------------------------------------------------------------|
|0    |**Recover/inventory local worktrees, source SHAs, Master and actual running services** without changing code   |Medium      |One verified source-of-truth integration map; no lost local commits.                                         |
|1    |**Retained Gulf bathymetry** audit and durable provider-outage fallback                                        |Medium–Large|Gulf coverage retained across restart/outage, truthful gaps, map demonstration.                              |
|2    |**One real scientifically supportable Gulf SST acquisition** (evaluate alternatives), then chlorophyll/currents|Large       |Real fields through existing backend with provenance/freshness and failure tests, P05 approval.              |
|3    |**Continuous Observe durable operational loop** and PostgreSQL/storage recovery                                |Large       |Server acquires/cache/retains independently of user, restarts safely.                                        |
|4    |**Four-hour governed publication/latest-state read** with persistence and multi-day continuity                 |Large       |Scheduled six UTC slots; app consumes latest without recompute; zero/unavailable truthful.                   |
|5    |**Seven species evidence and opportunity qualification**                                                       |Large       |Each species produces supported interpretation or governed zero; P05 scientific review.                      |
|6    |**Nightly Learn/Evidence Audit**                                                                               |Large       |Privacy-safe pairing to immutable history; scheduled and audited; no automatic score rewrite.                |
|7    |**Real NonProd SDK/Auth/RLS/API and snapshot/report write/retry/recovery**                                     |Medium–Large|Controlled QA owners, exact fixtures, bounded reads/writes and cleanup, P04; no private captain data.        |
|8    |**Founder/Founding/Beta access integration**                                                                   |Medium–Large|Existing lifetime access preserved; server-authoritative postapproval qualification and revocation.          |
|9    |**Full unified UI and physical mobile acceptance**                                                             |Medium–Large|Founder uses complete workflow on real iPhone, map/GPU/latency/continuity accepted.                          |
|10   |**Production integration/config/rollback/release**                                                             |Large       |Same existing PeloraOffshore.com services; exact artifact/config, safe rollback, explicit Founder BETA READY.|
|11   |**Beta business validation**                                                                                   |Medium      |Founder-defined pricing, onboarding, retention and willingness-to-pay measures; no guaranteed revenue.       |

Parallelize independent tracks; do not treat provider support email as global blocker. Never silently relax scientific, privacy or release gates. A test PASS is evidence, not a delivered capability.

10. Open questions requiring verification/founder input

1. Which local worktree/commit contains the latest coherent combined frontend, backend and scientific changes? Many newer P04-qualified commits were never pushed.
2. Exact current deployed production frontend/backend artifacts, Supabase project pairing, Render runtime/config and rollback path?
3. Which bathymetry grids/tiles are already physically retained? What Gulf coverage, resolution, licensing and restart/outage behavior?
4. Which source has sufficiently documented temporal support for operational SST? Which informational-only SST displays are acceptable pending that proof?
5. Are actual wind/waves/swell, chlorophyll and current data feeds healthy and commercially usable today? Provider quotas/licensing unknown.
6. How should Pelora establish fresh postapproval Beta Captain session proof if Supabase cannot guarantee it? Requires Founder approval of any revised authority model.
7. What exactly does Supabase Data API “0 of 6 tables exposed” mean in this project? Narrow real authenticated probe pending.
8. What are the complete runtime env-variable names, worker start commands, dependencies and test prerequisites? Not exhaustively verified in this handoff.
9. Which source-science, privacy and release contracts have newer local-only amendments than the remote governance docs?
10. What is the intended first Founder/captain acceptance window, and which actual captains will test? Do not assume their availability or access.

Incoming engineer’s first action

Audit before edits: inspect all local worktrees, compare them with GitHub, verify actual startup/config without secrets, inventory live and mocked paths, and produce a short contradiction/critical-path report. Then implement one working beta capability in an isolated branch with reproducible tests and a demonstration in the existing application. Do not create another Pelora product, reset worktrees, blindly merge local branches, access private captain reports or deploy without explicit authorization.

Handoff integrity: The author attempted to commit this file to the GitHub repository via the connected GitHub integration, but GitHub returned 403 Resource not accessible by integration. Thus this document is NOT committed in the repository by this handoff. The founder must copy it into the repo root and commit using a local authorized Git session (or grant a working write connection). This is a known delivery limitation, not a completed commit.