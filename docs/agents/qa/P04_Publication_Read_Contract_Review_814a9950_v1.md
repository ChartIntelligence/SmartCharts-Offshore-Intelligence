# PELORA-04 A — Publication-read proposal scoped contract review v1

Disposition: **CONTRACT REVIEW ACCEPTABLE FOR A PURE OFFLINE PRESERVATION ADAPTER ONLY**, subject to the required implementation constraints below. No adapter implementation or execution qualified here. No live publication, API, attention, account-admission, history-service or operational authorization inferred.

Review date: October 13, 2026 (America/New_York). Sequential queue: A contract reviewed first; B separate P02 status-presentation candidate pending; C temporal harness plus P05 oracle binding must be reviewed before any execution. No parallel checkout edits, completed qualification reruns or walkthrough regeneration.

## Exact identities and method

Proposal checkpoint exists locally: `814a9950c8dbfcd4ed12213101798c1e03ebba2c`, direct parent `b0cd2b1c3b967644d3bb00b4b488addfe777b1e9`. Its sole delta adds `docs/Top_Opportunities_Publication_Read_Contract_Proposal_v1.md`, Git blob `f6bee2254b6c4b2d194f749a2f48a48b83ecc4af`. Exact Git bytes SHA256 `e6324fa1eed74765015ee02d5a89206318302e98c3df34056059541cb4a6dbd2` match the existing `outputs/daytime-review/Top_Opportunities_Publication_Read_Contract_Proposal_v1.md` copy. Local presence independently verified; no remote-presence or proposal-push claim made.

Frozen preview candidate remains `b0cd2b1c3b967644d3bb00b4b488addfe777b1e9`; independent QA `3cf3a2eb7a1faa04c2523036305a8e928bb79f96`; separate daytime evidence checkpoint `f77eed29c36bfd65281ff8411bb795dd901482c6`. None is replaced by this review. QA work is on `codex/pelora-04-founder-qa-package-v1` in `C:/Projects/Pelora-Agent-Worktrees/pelora-04-qa-release`; existing matrix edit and untracked launch-safety document preserved. No branch transition.

Source review used commit-qualified Git reads at proposal checkpoint; no code imported/executed:

| Source | Exact Git blob | Evidence |
|---|---|---|
| `backend/durableObserve/publicationEnvelope.mjs` | `ef0e61c6055f99e1238db792d7270a352e46f200` | contextDescriptor line 39; versionId line 44; fields lines 45–70; structural classifier replay lines 60–61; readRankedPublication line 73 |
| `backend/durableObserve/publicationStore.mjs` | `f8bc4cca07122997e4902afddfd9ab3066d67276` | decoded line 5; read lines 13–23; current lookup is a second separate query; qualification is conditional |
| `shared/oceanPublication.mjs` | `9ab13d6c770b587ad305994f598db2e6434bfe14` | copy/freeze, exact-schema keys, UTC/cycle/reference/evidence binding |
| `backend/exactScientificEvidence.mjs` | `8e6e998fb21fd98b9096692c3920e664ef4266d0` | exactJson line 48 preserves signed zero |
| `backend/opportunityEvaluationState.js` | `934f8d8f95ffbecc815426ee8b94ccda7d0a6d3e` | upstream classifier owns available/partial/governed-zero/unavailable; selected-analysis-cohort, no established spatial coverage |
| `backend/durableObserve/controlledPublicationBinding.mjs` | `4c9a9e5186335520f0edc35398841cc7d4539824` | referenced strict controlled qualification boundary; no operational authority inferred |
| `frontend/src/hooks/useDynamicOpportunities.js` | `ae8f5aa4da7e6aba0653afdb9bad0a67d88d790e` | request-time `/api/opportunities` and Date.now; not published identity |
| `frontend/src/utils/captainContinuity.js` | `825080c7dabdb12a35e70a3ca0fcf301bd5cd109` | owner-keyed local version/revision records, no publication-view schema or server acknowledgement |

Read original CP-08 preservation/store contract and existing publicationEnvelope tests/ranked fixture source as documentary evidence only. Their recorded qualification was not rerun or promoted. The ranked fixture builder imports backend/server.js and executes producers; it is not a passive preserved-result fixture and must not be imported during this no-server/no-producer projection packet. Prefer existing serialized fixture bytes or a strictly injected, already validated record boundary. Any unavoidable execution prerequisite must be reported before broadening scope.

Canonical authority: `d5d40020b13de48838b93f4262072d7b57b13113:docs/PELORA_Persistent_Map_Workspace_Universal_Dock_Attention_v1.md`, contract `pelora-persistent-map-workspace-universal-dock-attention-v1`; exact amendment review already recorded. Top Opportunities replaces Home; mission strip remains excluded. Quiet unread needs an authoritative publication identity; only a qualified upstream material update can pulse. Missing dependent contracts do not block unrelated shell work.

## Classification of every proposed field and identity

A = authoritative available **within the existing validated local contract**, not operationally admitted. M = mechanically derivable/wrapper metadata, no new scientific interpretation. U = unresolved/not operational. Nested source content is preserved opaquely, not reconstructed into new authority. A field may be A in a valid source record and absent/null for legitimate noncompleted/missing outcomes; absence must remain explicit.

| Proposed field / group | Class | Exact origin and restriction |
|---|---|---|
| Projection `contractVersion` | M | New versioned wrapper identifier; never impersonate the strict source contract |
| Response `resolution`: RESOLVED / NO_RECORD / READ_UNAVAILABLE / UNRESOLVED_CONTEXT / INVALID_BINDING | M / U | New adapter outcome vocabulary, not returned by store. Derive from explicit trusted port outcome, missing record or failed binding; context admission remains U. A failed validation is INVALID, not benign unavailable/zero |
| Qualification / operational-admission limits | A / U | Source `controlledQualification`, store `qualification` and `operationalPublication:false` when supplied are A. Missing flag is UNKNOWN, never true. Operational admission/trusted ingestion capability remains U |
| `queryContext` current/historical | M | Explicit admitted request mode. Only current-cycle is current presentation mode; explicit exact-cycle/history remains historical even if its time equals current boundary |
| `mode`, `requestedCycle`, `currentCycle`, `historicalOnly`, `isCurrent`, `currentCycleStatus` | A | Store.read output; preserve original values and validate internal consistency. Requested/current slot alone is not publication identity. Do not use isCurrent alone to erase explicit historical intent |
| Original public `context` descriptor, `contextKey`, `species`, region id/version, spatialClass/spatialReference, missionReference | A / U | contextDescriptor/contextKey and source envelope. Trusted private mission/principal-to-public-context resolver is U. No raw coordinates/default/nearest substitution; null regional missionReference is legitimate |
| `versionId`, `contentDigest` | A | Exact envelope identity/byte integrity, not producer or ingestion authentication |
| `cycle.cycleId`, `scheduledAt`, `assessmentCutoff` | A | Original validated cycle/cutoff, not request clock. Preserve complete cycle/configuration as source; no scheduler created |
| `revision`, `parentId`, `action` | A | Exact ORIGINAL/STATUS/CORRECTION/WITHDRAWAL lineage; parent null only original. No deriving materiality from action |
| `publicationAt`, execution `startedAt`/`finishedAt` | A | Original timestamps; finishedAt may be null. Completion is lifecycle only, not zero, freshness or possession proof |
| `lifecycle`, `reason` | A | Source envelope lifecycle/reason; store missing when no record. Keep running/delayed/failed/withdrawn separate from science |
| `evaluationState` including state/contract/scope/counts/reason/establishesSpatialCoverage | A | Exact original producerBundle state. Do not recompute it; no global/regional coverage extrapolation. Noncompleted records have no producerBundle |
| selected cohort scope/counts/reasons | A | evaluationState plus producerBundle searchCounts/candidates/results; preserve as original source, not region coverage |
| `delivery`, Opportunities, rank/order/score/confidence/exclusions/narratives | A | Original delivery/ranking/presentation bytes. No rerank, normalize, filter, infer confidence or restore unavailable rows |
| Evidence/cohort/input references, candidates/results, producer versions/text/digest, evidenceFreeze | A | Original producerBundle binding/cohort/evidenceSetId/input references and complete retained records; no new reference inserted or receipt promoted |
| `record` / immutable native envelope reference | A | Validated frozen store.record, null for missing. Preserve original full envelope, not a fabricated abbreviated authoritative record |
| `recordText` / exact serialized envelope | M | cp08 lookup internally has text but store.read does NOT expose it. Preserve supplied original text when trusted port includes it; otherwise exact serialization of validated record is a byte-equivalent derived representation, not an independently retrieved original log |
| `sourceAgesAtRead`, `readAt` | A | Store-calculated metadata, distinct from original source/acquisition/acceptance/receipt/freeze/assessment/publication times. Do not clamp/refresh original evidence or imply possession |
| Proposed `materialComparison` and from/to/context/producer/qualification references | U | No current field/qualified producer. Fixed unresolved NO_QUALIFIED_PRODUCER wrapper only; do not inject into strict v1 envelope. Future non-null pass-through is not cleared without separate contract review |
| Private view key `(principal,contextKey,species,queryContext)` | M / U | Composition of trusted viewer plus exact context/mode; no private ID in shared publication. Trusted viewer/context admission and new local view schema are U |
| Seen token `(cycleId,scheduledAt,versionId,revision,parentId,action,contentDigest)` | M | Exact source tuple only. Null if no valid record; never from requested slot/readAt/Date.now. Does not by itself establish completed usable/current/operational picture or actual viewing |
| Same-version/conflicting-byte check | M | Requires explicitly supplied prior validated witness; not possible to detect unseen global conflicts from one result. No implicit ledger/table/history added |
| Principal/context generation and captured immutable snapshot | M | Local race containment protocol; no scientific authority or private shared-store field. Required detach/freeze before asynchronous use |
| Quiet unread / material pulse / reduced-motion and visibility state | U for execution | Canonical UI behavior, not store fields. No live attention implementation in this packet; materiality unresolved means no pulse. No record/no trusted publication identity means no fabricated unread cycle |
| Rendered/viewed acknowledgement, seen continuity record/recovery limitation | U for execution | New actual-child render/lifecycle/owner storage protocol not yet implemented or tested. Separate P02 packet; no route-mount/dock-action/failed-load acknowledgement; history cannot mark live seen |
| Historical time/cycle selection, return-to-latest | A / M / U | Existing exact/history read mode A; explicit request/display marker M. Authorized captain history API/timeline/retention U; no interpolation or fallback |
| What-changed/movement/strength/persistence explanation | U | Requires qualified upstream scientific comparison/history; no arrays, score deltas, source-age or cadence inference |
| Loading, retained previous view / last-known-unconfirmed | M / U | Consumer request state/display label, not stored publication science. Preserve retained object only with explicit unconfirmed/history distinction; real consumer implementation pending |

No proposed science field is classified as mechanically inferable from empty arrays, operation completion, digest success, time since read or UI selection. Fields omitted from a noncompleted envelope must remain absent/null, not filled with a surrogate completed producer result.

## Negative-case contract requirements (not executed)

| Case | Required pure-adapter result / refusal |
|---|---|
| Current lookup missing, older success available elsewhere | NO_RECORD/missing current, no source token, no active current picture. Do not call successful-history as automatic fallback. Explicit historical request separate |
| Partial with positive rows or no rows | Preserve partial and original reasons/counts/scope; never zero merely because delivery is empty |
| Completed unavailable / empty unresolved cohort | Preserve unavailable; execution completion/record presence not zero, operational admission or useful active picture |
| Running/delayed/failed | Preserve lifecycle; producerBundle null, scientificState null, no fabricated delivery/evaluationState. Token may describe valid source lifecycle record but is not usable-current/ack authority |
| Bound upstream governed-zero | Preserve only original validated governed-zero and exact supporting cohort/scope; no new negative scientific conclusion |
| Context/species/region/spatial/mission/cohort/cycle/evidence mismatch | INVALID_BINDING or typed rejection, no projection authority, no silent substitution. UNRESOLVED_CONTEXT reserved for legitimately absent admission mapping, not concealed corrupt returned data |
| Read transport/query failure vs invalid source | Explicit READ_UNAVAILABLE for real port unavailability only; malformed/digest/ref/shape mismatch fails INVALID_BINDING, no empty current/history. Do not catch all exceptions as benign unavailable |
| Missing materiality | Fixed unresolved NO_QUALIFIED_PRODUCER; no material Boolean, classification, movement narrative or pulse. A quiet indicator still requires separately trusted current publication identity/view contract |
| Correction/withdrawal, including empty delivery | Exact version/parent/action/reason preserved. Withdrawn has no active result; older completed version cannot revive it. Correction can preserve source zero/partial/unavailable distinctions. Action alone not material |
| Historical exact-cycle at current boundary | Keep original store historicalOnly/isCurrent fields, but explicit historical queryContext prevents current presentation/ack; two dimensions must not be collapsed |
| Historical success with failed/delayed/missing current | historicalOnly remains true, selected source separate from supplied currentCycleStatus; historical result never silently becomes current |
| Malformed references, wrong content bytes, recomputed outer digest | Existing strict reader binding validation required, not just outer hash. Reject inconsistent inner cohort/evidence/delivery/state/producer text. Digest consistency cannot establish genuine producer execution |
| Same version and differing digest/text | Reject against supplied immutable prior witness. Source can detect conflicts in its qualified ledger; pure one-result helper cannot promise global conflict discovery without witness |
| Mutation / revision arrival / A-B-A principal generation | Freeze exact A before async boundary; late callback/result cannot become B or revive old principal state. No current-pointer acknowledgement; actual UI execution remains later |
| Missing/late receipts or unavailable source support | Preserve receipt status/time/support/admission exactly; no granting pre-cutoff possession from provider time, readAt or publicationAt |
| Numeric fidelity including -0 | Preserve original record text/reference; use existing server exact codec if needed. Ordinary JSON.stringify is not equivalent. No copied scientific browser codec or automatic numeric coercion |
| Controlled flag absent | UNKNOWN/unadmitted, never operational true. Explicit controlled flag remains controlled false-operational. Auth/paid access cannot replace science/source admission |

## Required narrow implementation boundary / remaining gaps

1. Pure function or injected read-only port over one trusted validated store result and explicit synthetic admitted-context input. No query/table/service/server launch, composer, submit, scheduler, acquisition, classifier/evaluator/ranker invocation in the adapter. No importing producer-executing fixture helpers to make the packet pass containment. Existing store validation replay must remain explicitly outside projection counters; calling readRankedPublication/serializeRankedPublication also performs replay and must not be counted as zero evaluator execution.
2. Precisely pin closed input/output schema and failure tags before tests. Validate wrapper/source agreement: mode, slot, time, context, science alias, activePublication identity/null and qualification must be consistent, not caller assertions. A typed store-shaped object alone is not authenticated. Shared source envelope stays byte-identical and strict; wrapper-only resolution/materiality marker stays outside it.
3. Preserve original/native text if supplied; explicitly label derived exact bytes if not. Store.read currently returns parsed record, not recordText. Preserve signed-zero without JSON deep-copy. No application or upstream validator weakening to add projection fields.
4. Preserve two independent queries' limits: currentCycleStatus is lifecycle-only from the second lookup; it provides no newer revision token or transactional snapshot proof. Project exact returned record A. Do not claim latest authoritative revision B or acknowledgement from a status string/clock. Transactional captain read authority is a later contract.
5. No implicit private owner selection or scope resolution. Trusted principal-to-public-context admission remains missing; only explicitly synthetic scoped binding accepted offline. No public HTTP route, private schema/ledger, live attention or frozen preview wiring.
6. Future materialComparison non-null contract, operational ingestion/availability authority, authorized captain read API, view-record schema/render acknowledgement and history service remain separately blocked. The pure preservation/token helper may be developed only within these limits; field availability does not clear operational consumption.

No P0/P1 discovered in the documentation-only preservation direction. The above are concrete implementation acceptance conditions, not evidence of runtime defects. General runtime/operational acceptance remains BLOCKED by named missing authority; the pure injected offline preservation boundary is acceptable. No new science definition, eligibility, rank, confidence, materiality or possession rule approved.

## Queue / verification / production limits

B: await separate exact P02 candidate for loading/unavailable/partial/governed-zero/stale/refresh-failure/account-contract presentation review; no implementation bundled into A.

C: await P05 oracle review plus exact P01 harness candidate and review containment/oracle binding BEFORE execution. Pin manifest `629030bcf47d6de2af9c3ecf9b0e22882ffc67ea`, implementation `dadec5dbca7d360f70f633413fb6a347dc24cac1`, IDs `01-REUSE`, `03-REVISION`, `07-SUPPORT-MISSING`, `08-POSSESSION-UNPROVEN`, `09-LATE-POSSESSION`, `15-R9-OVERFLOW`, families SST/CUR/PD/PG/CD/CG. Thirty-six fixtures with two separately reported lanes are not 72 independent observations. No execution, equivalent reruns, oracle edits or fixture expected-result changes here. Outbound deny and no provider/database/server/quarantined path are prerequisites, not assumed from fixture labels.

Executed checks in this review: local object/parent/sole-doc-delta verification; exact Git-byte/output SHA256 comparison; commit-qualified source/document/test text reads; documentation whitespace check. No application/test imports, producer calls, runtime suite, Auth, provider, database, package install, configuration query, server, build, browser capture or launch. No walkthrough artifact touched. Frozen application candidate remains exact and clean; launch remains paused. No main/critical-path merge, deployment, operational-source admission, production, beta-ready or CP-10 permission.
