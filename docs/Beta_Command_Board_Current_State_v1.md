# Pelora beta command board — canonical critical path

Canonical beta board, consolidated at its existing location. Status snapshot is bounded to repository baseline **789de11a6aedd50e6e3a8dcf366d4d662f4dc4f5**. Branches/worktrees outside that baseline are not integrated evidence. **BETA NOT READY; LIVE PRODUCTION STATUS NOT ESTABLISHED FROM REPOSITORY.**

Governance: [product](PELORA_PRODUCT_CONSTITUTION.md), [science](PELORA_SCIENCE_GOVERNANCE.md), [privacy](PELORA_PRIVACY_AND_EVIDENCE_RULES.md), [release](PELORA_RELEASE_GATES.md), [decisions/conflicts](PELORA_DECISION_LOG.md).

## October 12, 2026 map-packet coordination snapshot

This additive snapshot supersedes the implementation routing baseline above, not the recorded historical qualification limits. Current accepted combined baseline: **10150d5a8187e4ba52f62c0c747d919b30345b7d**. Founder/device acceptance and BETA READY remain ungranted.

Verified ancestry: `e8820d13d9f39df40274267c12a7ac23eeff6ce1` → `789de11a6aedd50e6e3a8dcf366d4d662f4dc4f5` (bathymetry vNEXT) → `f871e9db0979f1140bd12964a7824666af9466a4` (Captain Continuity) → `10150d5a8187e4ba52f62c0c747d919b30345b7d` (governance). All 24 paths in P03's `e8820d13` → `19a9afdbacf305b616368f25b9609f675ce35891` delta have exact matching Git blobs at the accepted baseline. Do not reapply that delta or replace continuity with an older map checkout.

[Continuity integration evidence](agents/integration/PELORA_Captain_Continuity_Integration_v1.md) records controlled qualification; real authenticated saves, device/process recovery and founder QA remain open. P04's `4df8fdce2bc869a93c72a746bf502a8519c966e4` is a QA-documentation checkpoint targeting `f871e9db`, not an implementation successor. Governance source `a45110113ad903335bc8e36ef1d6540d89b47b2c` is already applied at `10150d5a`.

| Packet / reported state | Owned paths and dependencies | Integration / remaining gate |
|---|---|---|
| P02 narrow map caption repair — IN PROGRESS | `frontend/src/components/MapLegend.jsx`, focused metadata tests/evidence. Removes residual ETOPO/decimated-grid caption; internal provenance and rendering remain unchanged. Reports 20 focused checks and offline desktop/phone-width controls checks; exact committed repair not yet collected. | Based on latest combined lineage. Independent P04 clearance and exact-delta checks required before integration. |
| P04 independent combined QA — PASS within controlled limits | Exact combined target `10150d5a`; 29/29 continuity, 19/19 selected regressions, process recovery, 55/55 Intelligence recovery with actual continuity dependencies injected into unchanged harness; 13 parsing checks. Geometry/lifecycle/request/metadata/GPU successor checks reused only where exact blobs match. | Full successor replay remains 66/71; five documentary-builder import failures excluded, not passes. Desktop contour median 21.13 ms / maximum 76.30 ms does not qualify phone performance. Preview dependency setup/hosting and physical device/auth/live-provider QA remain separate. New P02 repair and later flow are not covered. |
| P03 sampled-vector flow presentation — IN PROGRESS | `frontend/src/hooks/useMapLibreOceanFields.js`, `frontend/src/utils/oceanFieldPresentation.js`, focused rendering/qualification tests. Preserve `interpolation:none`; short traces anchored to actual samples, no integrated paths or unsupported intermediate velocities. | No qualified flow candidate collected. Independent QA, combined lifecycle/texture/continuity/current regressions and founder visual judgment required. Stale/reduced-motion presentation must retain its stated limits. |
| P01 assembly/status — preparation only | This canonical board and decision log; isolated `codex/pelora-map-packets-integration-v1` from `10150d5a`. | No new application delta integrated in this snapshot. Await exact cleared P02 repair, then separately cleared P03 flow; run combined checks/build without moving existing branches. |

Reports of ongoing work do not establish completed qualification. No production, main merge, source-admission, science/ranking, Receipt Writer, CP-10 or beta authorization follows from this snapshot. Founder visual acceptance remains the final presentation gate; production/operational gates remain independent.

## Status vocabulary

**DONE / QUALIFIED** means the named bounded artifact meets its recorded acceptance scope. **IN PROGRESS** means recorded partial implementation/qualification, without implying an active session. **BLOCKED** means an unresolved prerequisite prevents closure. **WAITING FOR FOUNDER QA** means a candidate exists but human/device acceptance remains. **NOT STARTED** means the reviewed repository has no evidenced implementation of that named operational closure; it is not a claim about external work.

## Dependency-aware tracks

| Track / bounded status | Evidence at baseline | Prerequisites and remaining closure |
|---|---|---|
| Continuous Observe / durable Ocean State — **IN PROGRESS**; local CP-05–08 foundations **DONE / QUALIFIED** | [Evidence index](qualification/CP05_CP08_Local_Evidence_Index_v1.md), [CP-07](../backend/durableObserve/CP07-OCEAN-STATE.md), [Observe contracts](Continuous_Observe_Currents_Phase_1.md) | Approved independent manifests/source admission, operational scheduler/store/activation, restart/retention and privileges. Captain requests cannot select shared scope. Operational closure not established. |
| Six-slot governed publishing — **BLOCKED**; controlled P4-A **DONE / QUALIFIED** | [Four-hour contract](Four_Hour_Governed_Publication_v1.md), [CP-08](Continuous_Observe_CP08_Publication_Store_v1.md), [P4-A](Continuous_Observe_CP09B_P4A_Controlled_Integration_v1.md), [R9](CP09B_R9_Temporal_Derived_Finiteness_Repair_v1.md) | Source admission/full historical selection (CP-10 blocked), qualified independent Observe, operational composition, latest-published captain read/projection, failure/restart/retention acceptance. Fixed slots are 00/04/08/12/16/20 UTC; scheduler/live wiring not proved. |
| Captain continuity/draft protection — **IN PROGRESS**; bounded owner/refresh safety **DONE / QUALIFIED** | [Auth revalidation](Captain_Workspace_Auth_Revalidation_v1.md), [captain safety](Beta_Safety_Captain_State_v1.md), [combined vNEXT evidence](agents/integration/PELORA_Bathymetry_vNEXT_Integration_v1.md) | Full reload/process eviction, real save/recovery and device QA; published-state integration; five later replay assertions unqualified due to harness imports. No claim of cloud trip continuity. |
| Living Ocean fields/bathymetry — **WAITING FOR FOUNDER QA** | [Combined vNEXT integration](agents/integration/PELORA_Bathymetry_vNEXT_Integration_v1.md) | Real ETOPO geography/readability, Place/Signal/Opportunity dominance, physical iOS/Android performance, complexity guards. Controlled rendering qualification is not source-science admission. |
| Nightly Learn / Daily Evidence Audit operational loop — **NOT STARTED** | Historical audit below; [P3 decisions](CP09B_P3_Source_History_Policy_Decisions_v1.md), [association readiness](Fishing_Log_Association_Readiness_v1.md) | Qualified retained history/provenance, owner/approved anonymous-sharing boundary, governed pairing, scheduled audit and reviewed outputs. Ingredients exist; no operational loop evidenced. Never auto-rewrite production science/ranking. |
| Founder QA — **WAITING FOR FOUNDER QA** | [Combined candidate remaining QA](agents/integration/PELORA_Bathymetry_vNEXT_Integration_v1.md) | Authenticated end-to-end Today/Map/Intelligence/Reports, real geography, physical phones, console and failure/recovery evidence. |
| Security / RLS / least privilege — **BLOCKED** for release closure; local application safety **DONE / QUALIFIED** | [Captain safety](Beta_Safety_Captain_State_v1.md), [client privilege hardening](Client_Privilege_Hardening_v1.md) | Authorized environment verification of effective grants/RLS, two-owner isolation, Auth redirects/revocation, stored report recovery and TLS configuration. Tracked migration does not prove application. |
| Release qualification — **BLOCKED** | [Release gates](PELORA_RELEASE_GATES.md), [R9](CP09B_R9_Temporal_Derived_Finiteness_Repair_v1.md), [vNEXT integration](agents/integration/PELORA_Bathymetry_vNEXT_Integration_v1.md) | All required operating/science/privacy/device dependencies above plus explicit production authorization and final human BETA READY decision. No deployment/launch authorization exists in this bootstrap. |

## Critical path and next bounded queue entries

Independent Observe/source authority → durable retained evidence and qualified history → governed publication → latest-state captain consumption → integrated failure/recovery/device/privacy qualification → final human beta decision. Nightly Audit depends on governed evidence and privacy; Living Ocean/founder QA and security work may progress independently within authorized scope, but join before beta closure.

Next queue proposals (not implementation authorization): resolve P3/provider science decisions; qualify operational Observe composition; repair the five replay harness assertions and replay the exact candidate; execute founder QA; qualify latest-state delivery after source/history admission; define the privacy-safe nightly audit. Each entry must name its exact contract, dependency, owned files and acceptance evidence. See [PELORA-CONTROL routing](PELORA_RELEASE_GATES.md#pelora-control-readiness).

Update this board only from exact implementation/qualification or approval evidence. Retain superseded reports as history, link successor records, and never turn a design or a remote branch into a DONE claim.

## Historical audit retained below

The original audit below remains evidence at its stated 30b9957 checkpoint. Its missing-foundation findings, selected-object defect and package counts are historical, not current checklist authority. The table above and successor references govern this baseline. No original audit text or evidence counts are rewritten.

# Pelora Beta Command Board — current repository / captain experience v1

Audit baseline: `30b99575e6390d371cc2f526d68e5ae64e8fe014`, branch `codex/pelora-remote-setup`. Read-only source audit; only these two new reports are authorized outputs. No service, provider, database, Auth or live-site access occurred.

**Verdict: FOUNDING_CAPTAIN_BETA_NOT_READY_FOR_LOCKED_OPERATING_MODEL.**

Pelora contains a substantial private, request-time Blue Marlin application. The repository also contains tested foundations for background publication, exact evidence and historical authority. Those are different levels of completion. The locked four-hour, persistent, session-independent operating model is not assembled into the running application. Nightly auditing is also not operational.

**LIVE_PRODUCTION_STATUS_NOT_ESTABLISHED_FROM_REPOSITORY.** Everything below describes what this checkout implements or would expose if deployed with the required configuration and schemas. It does not establish what PeloraOffshore.com currently runs. A configured endpoint, a checkpoint tag and a passing local test are not deployment proof.

## What a captain would encounter in this build

The bare URL opens the public landing page. The private application is selected by `?app=1`; an approved, non-anonymous authenticated captain passes the access gate and startup flow. [App entry](../frontend/src/App.jsx), [access gate](../frontend/src/components/FoundingCaptainAccessGate.jsx), [access lifecycle](../frontend/src/hooks/useCaptainAccess.js).

| Surface | Implementation / runtime / UI | Captain experience and remaining limit | Primary beta disposition |
|---|---|---|---|
| Private access / sign-in | All wired | Magic-link sign-in; own `captain_access` approval; pending/revoked/error denied. Real redirects, role setup and deployed policies need verification. | A: release/access/privacy acceptance |
| Startup / Captain Context | All wired | Loading/startup, origin/GPS or departure selection, range and species context. Local mission state is not a cloud trip record. | A: device/session acceptance |
| Species selection | Wired, deliberately restricted | Blue Marlin enabled. Six other requested targets are unavailable in startup; their log labels do not constitute engines. | Blue Marlin acceptance A; other engines C |
| Today/Home / Top Opportunities | All wired to request-time API | Context-dependent evaluation, ranked cards, status handling, View Top Zone and Full Analysis. No latest published four-hour snapshot reader. | A: published-cycle integration |
| Map workspace | All wired | Full-screen responsive map, selected-target sheet, explore/close flow, context, ranked opportunities, Places, environmental overlays. Device acceptance remains. | A: workflow acceptance |
| Places | Wired | Static/catalog structure and FAD locations, symbols and clusters; a Place is not automatically a governed Opportunity. | Existing component; A: release acceptance |
| Ocean Signals | Limited runtime/UI integration | Four mapped candidate signal types; not the full future signal catalog. Raw/derived current diagnostics do not establish qualified Ocean Physics. | A: exposed-claim containment; future science B |
| Opportunity details / Open Full Analysis / Intelligence | All wired | Selected opportunity and captain narrative, evidence and conditional continuity context. Same-ID refresh can retain old selected details. | A: refresh/navigation acceptance and correction |
| Fishing Logs | UI and owner-storage calls wired | Date/time, explicit coordinates, species outcomes, observations, private notes and sharing preference. No automatic immutable opportunity/ocean pairing. | A: schema/privacy/save acceptance and nightly scope |
| Saved Reports / historical reports | UI and owner-storage calls wired | Owner-filtered list ordered by trip date then creation time, report details, deletion and species visuals. Historical log listing is not reconstructed historical ocean intelligence. | A: persistence/recovery acceptance |
| Navigation / mobile | Implemented responsive flows | Today, Map, Intelligence, Reports, Profile; map sheet and safe-area CSS. Repository tests do not prove physical-phone usability or live release. | A: end-to-end device acceptance |

Evidence: [startup](../frontend/src/components/PeloraStartupFlow.jsx), [Dashboard](../frontend/src/components/Dashboard.jsx), [Today](../frontend/src/components/TodayDashboard.jsx), [selected target](../frontend/src/components/SelectedTarget.jsx), [Intelligence](../frontend/src/components/OpportunityIntelligence.jsx), [map controls](../frontend/src/components/LayerControls.jsx), [spatial log controls](../frontend/src/components/FishingLogSpatialControls.jsx), [Saved Reports](../frontend/src/components/SavedFishingDayReports.jsx).

### Concrete captain-workflow findings

* **Coordinates entry is already implemented.** The log editor accepts latitude/longitude, validates and adds/removes explicit locations. The backlog should become deployed-schema and device acceptance, not a new coordinates implementation task. Time basis and backdating are also explicit; missing time is not invented.
* Log submission writes an `evidence_capture` envelope with legacy projections. The existing report warns that the column must be verified before deployment. Failure does not silently retry a lossy legacy save. Owner CRUD/RLS intent exists in migrations; actual database application, two-user isolation and recovered captain rows are unverified. [Spatial integration](../docs/Fishing_Log_Spatial_Capture_Integration_v1.md), [temporal integration](../docs/Fishing_Log_Temporal_Capture_Integration_v1.md), [schema](../supabase/migrations/20260923_fishing_log_evidence_capture_v1.sql).
* The dashboard opens the fishing-log panel without supplying the selected Opportunity or ocean snapshot. A saved log is not an immutable “what Pelora showed me then” analysis bundle. Historical association-readiness helpers exist, but an operational pairing workflow does not. Saved Reports renders legacy report fields; storing the envelope does not mean its full exact authority is displayed.
* The selected-opportunity expression in `Dashboard.jsx:298` keeps the old selected object when its ID still exists in refreshed results. A bounded offline probe extracted this actual expression: **2/2 assertions**, zero network attempts. Same-ID refresh returned the old rank/narrative object; absent ID correctly rejected it. This is a static reproduction of a potential stale-details problem, not a live-site or full-browser reproduction. No repair was made.
* Same-principal Auth refresh preserves the captain workspace and draft in the qualified lifecycle tests. Full reload/process eviction and auth termination are different cases. Mission preferences use local storage, not a user-scoped cloud record; shared-device transitions need acceptance. [Auth lifecycle report](../docs/Captain_Workspace_Auth_Revalidation_v1.md), [mission storage](../frontend/src/hooks/useTripMission.js).
* Anonymous-sharing consent is a stored preference, not proof that an anonymization, sharing or learning pipeline exists. Logs remain editable/deletable under owner CRUD; they are not immutable records merely because exact context infrastructure exists elsewhere.

## The four-hour Top Opportunity system

**Required for the stated Founding Captain beta model: yes.** This follows the locked experience requested for this audit and the repository publication contract. Shipping only the present request-driven application would be a deliberate product-scope reduction, not completion of the locked system.

| Element | Exact status | What exists / what is missing |
|---|---|---|
| A. Governed candidate generation | WIRED | Existing Blue Marlin request evaluation; not a qualified shared background cohort. |
| B. Evidence gates | WIRED | Current candidate/evidence gates run before ranking. |
| C. Opportunity eligibility | WIRED | Explicit eligibility/interpretation gate. |
| D. Ranking | WIRED | Request-time ranked result and UI rank identity. |
| E. Persistent opportunity identity | IMPLEMENTED | Stable identity and authenticated history/storage mechanisms; not proof of deployed recurring published identity. |
| F. Continuity comparison | PARTIAL | Historical continuity functions and displays; no fully qualified shared publication-history input. |
| G. Multi-cycle persistence | PARTIAL | Persistence/history analysis exists; repeated scheduled evaluations are not automatically independent scientific observations. |
| H. Scheduled four-hour trigger | MISSING | UTC slot validation exists; no operational scheduler invokes it. |
| I. Execution independent of sessions | PARTIAL | Callable worker exists; production ports, scheduling and composition are absent. |
| J. Atomic snapshot publication | IMPLEMENTED | Offline claim/freeze/create/readback/CAS model; no deployed atomicity proof. |
| K. Persistent published-snapshot storage | MISSING | Abstract storage ports exist; concrete operational published store is not wired. |
| L. Latest-published resolver | IMPLEMENTED | Pointer-validating worker reader; no corresponding captain API integration. |
| M. Frontend published-snapshot consumption | MISSING | Hook still requests `/api/opportunities`. |
| N. Launch/resume behavior for published cycles | MISSING | No published-cycle read/refresh lifecycle; existing app launch requests are not this behavior. |
| O. Historical cycle retention | PARTIAL | Publication/history contracts; no operational retention store and policy. |
| P. Strengthening/weakening/movement | PARTIAL | Conditional continuity/trend machinery; shared sampling and feature movement authority remain unqualified. |

The worker recognizes **00:00, 04:00, 08:00, 12:00, 16:00 and 20:00 UTC**. That is cadence validation, not a timer. The worker is a callable module, not a startup service. The browser's opportunity hook does not read it. [Worker](../backend/oceanState/publicationWorker.mjs), [publication contract](../shared/oceanPublication.mjs), [browser request](../frontend/src/hooks/useDynamicOpportunities.js), [four-hour foundation](../docs/Four_Hour_Governed_Publication_v1.md).

The smallest honest completion package crosses several boundaries: qualified shared frozen analysis and history; real durable publication ports and scheduler; latest-snapshot API; captain origin/range/species projection; frontend launch/resume consumption; failure/restart/retention acceptance. A cron wrapper around the current captain-context request route is insufficient: candidate limits, spatial selection and authenticated captain history are not the same thing as a shared publication cohort. **The explicit scientific clock seam already exists**; it should not be listed again as wholly missing. Shared history selection and science equivalence remain open. [Clock amendment](../docs/Explicit_Scientific_Assessment_Time_v1.md), [history binding](../docs/Scientific_History_Binding_Amendment_v1.md), [history policy limit](../docs/Governed_Historical_Ocean_Snapshot_v1.md).

### Observe and nightly operations

**Continuous 24/7 Observe: not operationally wired.** Weather/marine/chlorophyll/current requests and version-bound in-memory caches exist. Browser polling is session-dependent. A separate SST acquisition worker and archive-port foundation exist, but no regular production scheduler/store composition was found. Cache is not a durable environmental archive. [SST worker](../backend/oceanState/sstWorker.mjs), [archive contract](../shared/oceanProductArchive.mjs), [SST operational limits](../docs/Operational_SST_Acquisition_Freshness_v1.md).

**Nightly Learn / Daily Evidence Audit: contract and ingredient level, not an operational loop.** Logs and selected-place ocean history can be stored; association-readiness helpers exist. No scheduled nightly worker, governed historical log/ocean pairing, opportunity/outcome comparison, learning-output publication or nightly privacy audit was found. The health endpoint is not a nightly auditor. An initial nightly package should report qualified/unknown/unpaired evidence and system health without silently changing ranking. The user-defined locked nightly model remains beta work; deferring it requires an explicit scope decision. Automatic learned scoring and anonymous publication can remain future work.

## Environmental evidence: what is actually connected

“Acquisition wired” here means reachable source code, not a provider call made or production service verified by this audit.

| Source | Adapter / acquisition / normalization | Freshness and UI / engine use | Limit / disposition |
|---|---|---|---|
| Wind | Open-Meteo weather request wired; local parsing/conversion | Marine conditions and travel context; provider-time/quality handling | Real endpoint reliability and labels need release acceptance; not species proof. |
| Waves / swell | Open-Meteo marine request wired | Height/direction/period in marine/travel UI/context | Request-time behavior, not 24/7 persistence. |
| SST | Center and directional marine acquisition; v1 numeric normalization | Center/thermal context in opportunities; normal transition/context presentation | Source/model equivalence, temporal support, model/run attribution and historical comparability remain open. |
| Chlorophyll / water color | DIRECT and GAP_FILLED NOAA CoastWatch request paths; v1 normalization | Selected product, age/source/quality and opportunity water-color/productivity context | Exact temporal support and GAP_FILLED deployed algorithm/target authority unresolved. |
| Currents | NOAA geostrophic u/v adapter; vector normalization and local failure handling | Point/context plus normal map field arrows; derived legacy diagnostics also run | NOAA clarification/uncertainty and Ocean Physics interpretation remain open. |
| Moon | Local astronomical calculation | Marine/species context | No live-provider proof is needed for the calculation itself; deployed behavior still unverified. |
| Bathymetry | ETOPO map field adapter; parsed/decimated field | Normal bathymetry overlay; existing structure/depth habitat facts are a separate path | Overlay is not a navigation chart or new habitat-science qualification. |
| Tides | No governed runtime feed found | Explicit analysis limitations | C: future scope unless separately required. |
| Radar | No operational integration found | References/roadmap are not a feed | C. |
| Sargassum | No operational feed found | Manual weed observations are not acquisition | C. |

Evidence: [server provider and resolver code](../backend/server.js), [map dataset registry](../backend/fields/datasetRegistry.js), [field presentation](../frontend/src/utils/oceanFieldPresentation.js), [map field hook](../frontend/src/hooks/useMapLibreOceanFields.js).

Chlorophyll's runtime selection follows the locked order: DIRECT at most 72 hours old; then GAP_FILLED at most 72 hours; then older DIRECT; then older GAP_FILLED; otherwise unavailable. Product lineage and age survive selection. This is existing freshness governance, not resolution of exact scientific support bounds. No averaging or family substitution is authorized by reference readiness.

## Backend capability versus visible product

| Capability | Backend implemented / runtime wired | UI consumes it / captain-visible effect | Persistence / enablement limit |
|---|---|---|---|
| Source Normalization v1 | Yes / provider, conversion, current/SST cache and handoff paths | Indirectly; safer missingness/finiteness/zero handling, no new screen expected | Normalized memory caches; receipt not implied. |
| CURRENT-v3 exact capture/reference | Yes / current response and snapshot codec paths | Metadata round-trip; no new visible UI expected | Captain ocean snapshot path conditional; issuer admits CURRENT-v3 only but is disabled/uncomposed. |
| CENTER SST exact reference | Yes / governed center tuple, v2 adapter and publication | Metadata identity, no badge or eligibility boost | Conditional captain snapshot persistence; ready for future issuer per observation, not currently admitted. |
| Directional SST | Acquisition and existing v2 codec capability | Directional context is consumed | No separate live exact-reference registration was found; do not transfer center readiness to directions. |
| DIRECT chlorophyll reference | Yes / scalar handoff | Product identity metadata, no new screen expected | Conditional persistence; future-issuer reference-ready, not admitted. |
| GAP_FILLED chlorophyll reference | Yes / separate marker-preserving handoff | Product identity metadata, no new screen expected | Same limits; deployed reconstruction science not newly authenticated. |
| Historical receipt writer/resolver | Yes / no server composition found | Not wired to captain UI | Disabled by default; migration recorded UNAPPLIED; deployment NOT QUALIFIED. |
| Publication worker/latest reader | Yes / explicit callable foundation | Not consumed by current opportunity hook | Injected storage contracts, no operational publish service. |
| Continuity / captain narrative | Yes / request evaluator | Yes; Intelligence/cards show conditional explanations | Needs appropriate captain history; not a finished recurring shared history service. |
| Log evidence envelope / readiness helpers | Capture UI yes; association helpers not operational pairing | Coordinates/time controls visible; no complete historical-pairing presentation | Report column deployment and owner policies require verification. |
| Future-family extensibility audit | Documentation only | No visible UI effect expected | No salinity/altimetry runtime, provider or science created. |

Evidence: [normalization](../backend/sourceNormalization.mjs), [capture codec](../backend/normalizedEvidenceCapture.mjs), [scalar handoff](../backend/scalarEvidenceHandoff.mjs), [receipt runtime](../backend/historicalReceiptRuntime.mjs), [receipt connection](../backend/historicalReceiptConnection.mjs), [receipt migration](../supabase/migrations/20260930_historical_receipt_envelope_v1.sql), [ocean memory hook](../frontend/src/hooks/useOceanMemoryPersistence.js).

Receipt authority remains possession of exact evidence by trusted receipt time, never eligibility/freshness/ranking. The writer can remain disabled during beta **if no beta claim requires qualified historical as-of receipt authority**. If the selected historical design does require it, deployment qualification becomes an explicit dependency. This audit does not turn missing witnesses into availability. Normalization, scalar identity and the current-vector failure-locality contract are preserved, not reopened.

## Signals, species and explainability

| Signal | Repository state |
|---|---|
| Temperature Transitions | Mapped candidate signal and thermal explanation exist; limited supported context, not unrestricted front science. |
| Current Edges | Lower-level edge diagnostics exist; no independently qualified full Ocean Signal established. |
| Convergence | Legacy calculation/candidate context runs; governed detection/interpretation remains paused/unresolved. |
| Shear | Legacy diagnostic path exists; full qualified signal not established. |
| Upwelling / Downwelling | No qualified runtime signal implementation found. |
| Water-Mass Transitions | Partial contextual analysis; absent salinity prevents claiming actual qualified water-mass identification. |
| Mixing Zones | Partial descriptive/current context, not a qualified independent mixing-zone signal. |
| Productivity Gradients | Chlorophyll productivity context exists; a qualified spatial gradient signal was not established. |
| Environmental Transitions | Limited candidate mapping exists. |

The actual Ocean Signal resolver maps four candidate types to temperature-transition, current-supported-transition, surface-water-transition and multi-signal-support. Terminology elsewhere does not establish another implemented signal. **Paused research is not a blanket runtime switch:** current convergence/shear/edge and legacy Ocean Physics summary functions are called. Before beta, audit and contain exposed claims under existing authority; do not resume paused science or silently promote diagnostic candidates. [Convergence decision](../docs/Governed_Current_Convergence_Decision_v1.md), [NOAA limits](../docs/NOAA_Geostrophic_Current_Metadata_Qualification_v2.md).

Blue Marlin has candidate generation, habitat eligibility, evidence gates, ranking, narrative, Today/Map/Intelligence wiring. Yellowfin Tuna, Blackfin Tuna, Mahi, Sailfish, White Marlin and Wahoo do not have equivalent enabled governed pipelines. Startup disables them and the opportunity API rejects unsupported species. Species log categories or legacy map assets are not evidence of full support. The existing opportunity architecture is Blue-Marlin-specific in several candidate, interpretation and publication checks; other species require explicit family/science work, not merely enabling buttons.

Unified Opportunity Intelligence/Captain Narrative is visible: thermal, ocean movement, water color, productivity, structure, persistence, species habitat and evidence confidence sections. Provenance and continuity are conditional on actual inputs. Strengthening, weakening, persistence and movement are not guaranteed simply because two cycles exist; movement needs feature association and history selection remains governed.

## Release evidence, safety and command board

Repository build/start scripts, Vite configuration, the configured Render API default and Supabase migrations describe intended deployment. No first-party release workflow/receipt establishes that these checkpoint commits are on PeloraOffshore.com. Historical database/catalog notes are not proof that later migrations or the current release were deployed. Do not connect to the live site to fill that gap in this audit. [API configuration](../frontend/src/utils/peloraApi.js), [database cautions](../supabase/README.md), [non-production bootstrap](../supabase/Non_Production_Bootstrap_v1.md).

Fail-closed boundaries already help: unsupported species/families are denied; governed-zero differs from unavailable/loading; malformed exact authority is refused; receipt writer defaults inert; captain access requires own approval. They do not replace deployment/privacy testing. Backend environment routes are not uniformly protected by the frontend approval gate; owner bearer checks and database RLS are separate from `captain_access`. Verify intended service access and abuse controls, without asserting a demonstrated cross-user leak. Required public configuration can fail startup; missing report schema can fail saves. Those are release gates, not proof of a currently broken production site.

Buckets: **A** must finish before the locked Founding Captain beta; **B** may remain disabled/paused; **C** future/post-beta. Existing qualified components can be reused without claiming the whole release is already beta-ready.

| Order / package | Current state / captain impact | What remains | Bucket / dependency |
|---|---|---|---|
| 1. Release, access and data safety | UI/storage calls exist; deployed config/schema/policies unknown | Verify exact build/config, sign-in/approval/redirects, intended backend access, report migration, owner isolation, two-user CRUD and recovered reports | A; deployment authorization required |
| 2. Scientific claim containment | Raw evidence gates exist; some paused-science legacy derivations still run | Review exposed current/Physics/Signal/freshness claims and fail closed where authority is absent | A; human scope decision, no automatic science restart |
| 3. Independent Observe / evidence persistence | Request acquisition/cache plus isolated worker/archive foundations | Operational refresh, durable qualified evidence, retry/health/retention independent of sessions | A; 1–2 |
| 4. Shared frozen analysis and history qualification | Clock/worker/history contracts exist; shared cohort/history science incomplete | Qualify shared candidate/evidence inputs, cutoff/history selection and continuity meaning; keep captain-private history separated | A; 2–3; explicit authorization around paused gates |
| 5. Four-hour durable publisher | Worker and latest-pointer model exist | Scheduler, concrete claim/store/CAS ports, recovery, cycle retention, latest API and operational acceptance | A; 1, 3–4 |
| 6. Published-cycle captain experience | Current UI uses on-demand evaluation | Read-side origin/range/species projection, latest snapshot consumption, stable rank identity, launch/resume and late/unavailable handling | A; 4–5; do not adopt quarantined Projection V3 implicitly |
| 7. Nightly evidence/outcome audit | Logs and association ingredients only | Scheduled privacy-preserving qualified pairing/audit, unknown/unpaired handling, health and review outputs; no automatic scoring change | A under locked nightly scope; 1, 3–5 |
| 8. Captain/mobile acceptance and targeted fixes | Responsive UI/tests exist; stale selected-object risk reproduced | Authorized refresh correction; real-phone keyboard/sheets/navigation/reload/shared-device and save/history acceptance against exact release | A; integrate through 1–7, final end-to-end last |

**Shortest evidence-supported path:** establish safe deployed prerequisites and claim boundaries first; then Observe → qualified shared analysis/history → durable four-hour publication → captain consumption; add the locked nightly audit and complete real-device/data-safety acceptance. Work may overlap, but downstream UI cannot truthfully claim independent published cycles before the publisher exists. Approximately **eight coherent packages** remain; this is not eight minor fixes and not a launch-date estimate.

| Remaining item | Single primary bucket | Why |
|---|---|---|
| Historical receipt deployment/family admission | B | Can remain inert with authority unknown; becomes a dependency only if beta explicitly promises that authority. |
| New Ocean Physics/convergence qualification and unqualified signals | B | Keep paused; contain existing exposed claims in package 2. |
| Real SST raster/worker pilot beyond authorized Observe needs | B | Review foundation is not a required new captain feature; no silent pilot enablement. |
| Projection V3, 12B.6C, 9E-D | B | Quarantined/paused; no automatic restart or use to bypass current projection qualification. |
| Other six species engines | C | Current target selection is explicitly Blue Marlin only. |
| Salinity, altimetry, generic extension refactoring | C | Architectural audit only, not current captain features. |
| New tides/radar/sargassum feeds | C | No locked implemented feed to finish in this scope. |
| Automatic learned scoring and anonymous sharing publication | C | Separate privacy/science authority beyond a nightly read-only evidence audit. |

## Verification and limits

Only the two new command-board documents are outputs. The companion JSON records the nine status dimensions independently, source references, all sixteen publication elements, source/species/signal matrices, work packages and verification facts. No full regression was run: production and tests are unchanged. The bounded selector probe executed two assertions with an outbound-denial monitor and recorded zero operational network attempts. No provider, environmental acquisition, database, Supabase service, Auth or live-site access occurred.

Static completion checks: JSON parse; repository path/line and Markdown link resolution; `git diff --check`; report trailing-whitespace check; all 1,992 baseline tracked-file hashes; unchanged HEAD/branch and checkpoint tags; empty staged diff; unchanged excluded Supabase pair. The new documents are intentionally untracked. Receipt writer remains repository-disabled/uncomposed, migration recorded unapplied, and deployment unqualified; no live environment was inspected. `POSTGRES_TLS_ENDPOINT_REQUIREMENTS_NEED_DEPLOYMENT_CONFIGURATION` remains open. Projection V3 remains quarantined; Ocean Physics, Convergence, 12B.6C and 9E-D remain paused as governed work. No next implementation task has started.

## Founder summary

**A. What is already built:** A private Blue Marlin app with context selection, marine evidence, map exploration, ranked request-time opportunities, explanations, logs and saved reports. Important normalization and exact-evidence safeguards are also built.

**B. What a captain can actually use:** In this build, with the correct deployed setup, an approved captain can explore current request-driven advice, open analysis, enter coordinates and trip outcomes, and review saved logs. This audit cannot tell you which build the live website serves.

**C. What is built but not live/wired:** The four-hour worker and latest-reader foundations are not a scheduled production service or the UI's data source. Receipt authority is disabled. Exact references mostly improve correctness behind the scenes; audit checkpoints do not change screens.

**D. What must be finished before beta:** Verify access and private data storage, contain unqualified claims, assemble independent observation and governed shared history, finish scheduled durable publishing and its captain UI, complete the locked nightly evidence audit, and pass real-device/end-to-end acceptance. Fix the demonstrated stale selected-details behavior through a separately authorized change.

**E. What we can safely ignore until after beta:** Additional species engines, salinity/altimetry, new optional feeds, automatic learned scoring and speculative architecture cleanup. Receipt deployment and paused science can remain disabled/unqualified as long as beta does not promise their authority and current exposed claims are contained.

**F. Approximate remaining work:** Eight coherent packages for the stated operating model. There is no evidence-supported launch date here. A smaller request-time beta is a possible founder decision, but would change the locked promise rather than complete it.
