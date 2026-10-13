# Top Opportunities governed-publication read and viewed-identity proposal v1

Proposed contract: `pelora-captain-published-opportunity-read-v1` and private `pelora-rendered-publication-view-v1`. DESIGN/TEST PROPOSAL ONLY; neither implemented nor qualified. No API, database, scheduler, publisher, attention code, science or environment changes.

Frozen preview: exact reviewed implementation `b0cd2b1c3b967644d3bb00b4b488addfe777b1e9`, independent QA `3cf3a2eb7a1faa04c2523036305a8e928bb79f96`. Source/dependencies/launch unchanged; connected preview paused until founder desktop/evening temporary config and supervised session. Existing approval applies to that exact candidate, not this new work. No repeated missing-value request.

## Reused work and bounded inspection

- [Locked universal-dock/attention direction](PELORA_Persistent_Map_Workspace_Universal_Dock_Attention_v1.md): publication identity, quiet vs material attention, principal isolation, no UI-derived science.
- [CP-08](Continuous_Observe_CP08_Publication_Store_v1.md), [four-hour contract](Four_Hour_Governed_Publication_v1.md), [retained-source readiness](CP09_Retained_Source_Integration_Readiness_v1.md): reuse local foundations and recorded source/history limits, not another inventory.
- Existing separately checkpointed gap analysis `ea58125eaac28046fe4c62ccf615ae8345561d3e:docs/Four_Hour_Governed_Publishing_Critical_Path_Gaps_v1.md` and zero-replay design `4bb338bd7d68404716c287dd33d87961ff4f7fff:docs/Zero_Replay_Governed_Publication_Path_Design_v1.md` read as source evidence. Their isolated design/test lineage is not merged or promoted into current runtime.
- Current exact files: `backend/durableObserve/publicationEnvelope.mjs`, `publicationStore.mjs`, `oceanStateReader.mjs`; `frontend/src/hooks/useDynamicOpportunities.js`, `frontend/src/utils/captainContinuity.js`. Source inspection only; no consumers/tests/services executed.

## Existing capability versus precise gap

| Function / actual contract | Reusable fact | Gap / limit |
|---|---|---|
| `contextDescriptor/contextKey` in publicationEnvelope | Blue Marlin, explicit governed region/spatial reference, regional-selected-cohort or governed-mission-cohort; mission reference required where applicable | No qualified private-captain mission→approved publication-context resolver/API admission. Raw requested coordinates/Entire Gulf fallback cannot create scope. |
| `versionId`, `validateRankedPublication`, `serializeRankedPublication`, `readRankedPublication` | Context/cycle/revision identity; parent/action including correction/withdrawal; exact envelope, evidence/cohort, delivery and evaluation state | Existing v1 validator replays `buildGovernedOpportunityEvaluationStateV1`; composer also invokes upstream producers. This read path cannot be called zero-replay. No new evaluator or silently weakened v1 validation. |
| `createPublicationStore().read` | `current-cycle`, `exact-cycle`, `latest-successful-history`; currentCycleStatus/lifecycle/scientificState/historicalOnly/isCurrent; record and explicit sourceAgesAtRead | Internal query port/local qualification, not deployed captain API. Uses `cp08.lookup`; no table/client access authorized. No multiple-cycle timeline/list contract established. |
| `createOceanStateReader().read` | Qualified bounded accepted CURRENTS context, source age, historical query/cutoff/receipt references | Environmental history is not Opportunity/change history. Full source/history admission still gated; no fabricated continuity/timeline. |
| `useDynamicOpportunities` | Existing context/auth/race containment and governed evaluation UI consumers | Calls request-time `/api/opportunities` with `t=Date.now()`. No published cycle/revision witness. Must not relabel this response as publication or acknowledge fetch time; QA endpoint remains503. |
| `continuityOwner/readContinuity/writeContinuity` | Existing private owner-keyed version/schema/revision-aware local UI recovery | No publication-view schema/record yet. Storage is device/origin-local and unencrypted, not cross-device/server acknowledgment or authority. |
| Ranked envelope/store outputs | Original delivery, exclusions, evaluation reasons/counts, lifecycle and correction lineage | No material-update/comparison field or qualified producer reference. Upstream scientific strengthening/weakening/movement/persistence cannot be inferred by UI. |

## Smallest read-only boundary

A future P01-owned pure projection takes ONE exact validated store read result plus trusted request-admission context. It calls neither composer/submit/scheduler/evaluator/classifier/ranker nor acquisition directly. It preserves the existing reader's validator behavior without asserting zero replay. It must not obtain a result from `/api/opportunities`, add evidence references afterward, or create publication/observation/receipt authority.

Future HTTP wiring is a separate packet; proposed separate route `/api/published-opportunities` is a name proposal, not an existing route. Existing backend/frontend access gates remain authoritative, including revoked/expired/private-owner separation. Authentication identifies viewer, authorization admits requested governed context, and scientific/source admission remains independent. Map publication read must not grant paid/scientific permission through local shape/digest success.

Private principal is resolved server-side, never caller-selected `user_id`. Request supplies species, approved context reference and an explicit read mode. Server must resolve that reference under existing approved authority and compare returned contextKey/species/region/spatial-class references exactly. Unsupported/missing mapping returns explicit unresolved-context or unavailable; no nearest/context substitution, captain-coordinate scope expansion or mission default. Shared publication store never gains private captain/session/draft IDs or coordinates. Bearer/key values excluded from responses/storage/logs.

### Proposed preservation envelope (not implemented fields)

- `contractVersion`; response resolution (`RESOLVED`, `NO_RECORD`, `READ_UNAVAILABLE`, `UNRESOLVED_CONTEXT`, `INVALID_BINDING`); explicit qualification/operational-admission limits.
- Query context (`current`, `historical`); original store mode/currentCycle/requestedCycle/historicalOnly/isCurrent/currentCycleStatus. Preserve original public context descriptor, contextKey and species.
- Exact source publication reference: versionId, contentDigest, cycle.cycleId, scheduledAt, assessmentCutoff, revision,parentId,action,publicationAt and execution times. Reference absent means identity unknown, not a made-up completed cycle. No new scientific/artifact identity.
- Original lifecycle/reason and evaluationState object, selected-analysis-cohort scope/counts/reasons; exact original delivery/ranks/order/scores/confidence/exclusions/narratives and evidence/cohort/input references through immutable source envelope.
- Preserve `recordText`/exact native serialized envelope as an opaque text/reference when necessary. `exactJson` retains signed zero and standard `JSON.parse` of retained text preserves it; ordinary JSON stringify/deep-copy of parsed scientific payload must not silently lose it. Node crypto/server validators stay server-side; no copied scientific codec/ranker in UI. Browser typed projection does not mint authority.
- sourceAgesAtRead/readAt as separate read metadata; source, acquisition, acceptance, receipt, freeze and assessment times unchanged. Publication/read time never resets evidence age or proves pre-cutoff possession.
- Proposed optional `materialComparison`: only a future qualified upstream object bound to exact from/to publication/context/producer/qualification reference may be passed through unchanged. Current outputs lack it: explicitly `UNRESOLVED/NO_QUALIFIED_PRODUCER`, no invented Boolean/material reason. Do not silently add it inside strict v1 source envelope.

Invalid/corrupt binding fails closed; never downgrade INVALID to unavailable/empty to allow evaluation. A valid unavailable/failed record is not corrupt. Snapshot/detach validated inputs before async use; later mutation cannot change source/ref or view token.

## Operational, scientific and missingness outcomes

| Supplied authority | Captain presentation / identity behavior |
|---|---|
| Loading | Loading; no false Unavailable, new identity, acknowledgment or scientific conclusion. Retained previous view may stay explicitly labelled last-known/unconfirmed. |
| Completed available | Preserve existing ranked delivery and state exactly; selected cohort is not full regional/captain-range coverage. |
| Completed partial, including empty ranked list | Partial with original limitations/reasons; not zero. |
| Completed governed-zero | Only original governed-zero producer state plus its bound supporting scope; empty list/completed alone insufficient. |
| Completed unavailable | Unavailable, even if execution finished; no eligibility or fabricated ranking. |
| Running/delayed/failed/missing current | Display supplied lifecycle; no older successful record silently becomes current. A retained older picture is explicitly separate/historical/last-known. |
| Withdrawn/corrected/eligibility loss | Preserve explicit source lineage/action/reason and existing validity rules, including empty delivery. Loss remains communicable; UI must not derive a material classification from action alone. |
| Explicit historical lookup | Show selected cycle/time and historical context, explicit return-to-latest. Historical view never acknowledges current live identity. No automatic age bucket, intermediate movement or unsupported persistence. |
| No record/read unavailable/context unresolved/invalid | Distinct resolution and source authority limits; no source no-data, zero, empty history or publication identity fabricated. |

Local controlled CP-08/P4-A fixtures remain machine-labelled controlled/unadmitted. Absence of controlledQualification flag is not operational admission proof. An eventual operational reader needs explicit trusted ingestion/availability authority; this proposal does not approve source/history science or CP-10.

## Exact rendered/viewed identity and races

Private view key proposal: `(authenticated principal, exact governed contextKey, species, queryContext)`, with seen source token `(cycleId,scheduledAt,versionId,revision,parentId/action where supplied,contentDigest)`. These are source values, not a new scientific ID. Immutable same-version/different-digest conflict is INVALID, not a second valid publication. No raw private IDs in shared store/artifacts; view state remains existing owner-scoped local continuity. No new server ledger/schema or cross-device claim.

For current view, retain an exact seen source token per context using a narrow versioned continuity record, not Boolean/fetch timestamp. Historical view acknowledgment is isolated/session-scoped and must not overwrite live seen state; no new history-retention/window policy selected here.

Proposed state machine:

1. Request captures current principal/context generation and explicit query mode; late result after principal/context/logout cannot render or acknowledge. Never reset viewed state on every fetch/resume.
2. A successful valid authoritative response supplies immutable display snapshot A. New cycle/revision identity compared to private seen token may produce quiet unread; absent/unresolved identity has no fake new-publication indicator.
3. Only Top Opportunities actually open, document visible, correct context still authorized and successful committed render of snapshot A schedules acknowledgment of A. Define and test this observable rendering boundary; it is not proof that a person read every item. Dock expansion/collapse, hidden panel, pending/error or failed render never acknowledges.
4. Callback captures A, not a mutable latest pointer. If revision B arrives during open/render/ack, A acknowledgment cannot mark B seen. If A is no longer displayed/currently authorized at callback, cancel; if A was genuinely rendered earlier, storing A remains harmless and B stays unread. Async completion must check generation again.
5. Material pulse only when qualified upstream comparison explicitly establishes material update for exact A/context. Missing comparison→quiet new indicator with unresolved materiality. No score/array diff, cadence significance or UI thresholds. Reduced-motion static highlight; hidden animation pauses while unread state remains.
6. Private record corruption/storage failure shows explicit recovery limitation, not false server acknowledgment. Existing report/mission/workspace records and terminal selection tombstones untouched. A→B→A principal roundtrip is monotonic-generation guarded; no stale closure replay.

Viewed/unread state never changes rank, eligibility, confidence, evidence age, cycle generation, cadence or acquisition. Withdrawal may be the rendered record with no ranked rows and still be acknowledged only by exact visible snapshot.

## Minimum next packet and concrete tests (NOT RUN)

P01 packet: one pure read-result→preservation projection and narrow validated identity/view-token helper, proposed `backend/durableObserve/captainPublicationReadProjection.mjs` plus dedicated offline tests. Use actual validated existing publication fixtures/store read-shaped controlled ports; no DB, service/schema, evaluator, new publisher or production wiring. Preserve original record bytes/reference and separate resolution/lifecycle/science. Actual HTTP/principal→context admission and P02 UI/viewed storage are later bounded packets after authority dependencies resolved; no live attention now.

P04 acceptance proposals:

- Exact available delivery identities/exclusions/numeric values/signed-zero/confidence/order/rank/evidence/cutoff unchanged; counters on evaluator/classifier/ranker/submit/acquisition remain zero in the projection (existing v1 validation replay explicitly separate).
- Genuine upstream zero, partial with/without rows, unavailable, running/delayed/failed/missing/withdrawn/corrected/historical remain exact; completed/empty never mint zero.
- Cross-principal/context/species/cycle/cohort/evidence mismatch and same-version/conflicting bytes fail closed; no silent defaults or historical substitution.
- Fixture qualification flags and unknown admission preserved; digest alone cannot admit science. Late/missing receipts never gain possession; source age independent of read/publication clocks.
- Same immutable result produces deterministic projection/reference; caller mutation and newer revision cannot change frozen A. Failure/unresolved identity creates neither unread cycle nor acknowledgment.
- Actual P02 view seam: collapsed dock, failed load, hidden tab, render error, A→B arrival during open/ack, correction/withdrawal with empty rows, wrong context/principal, A→B→A logout, storage corruption/denial, reopen and reduced-motion/visibility transitions. Verify only exact successfully rendered A marked viewed; B stays unread.
- Unknown materiality produces quiet unread only; no material pulse, made-up movement, timeline, confidence or new analysis. Historical exact-cycle selection never marks live read seen.
- Existing shell/mission strip/draft/selection/access/lifecycle and private owner isolation regressions remain intact. No listener/loop or publication request during dock collapse alone.

No tests executed for this proposal. P02 presentation requirements reused read-only; P04 owns actual independent evidence/walkthrough/evening checklist. No duplicate edits or routine credentials request.

## Dependency disposition

READY TO REUSE: CP-08 context/cycle/revision/evidence/lifecycle objects, explicit read modes, governed upstream delivery/evaluation states, owner continuity utilities within their local limits.
PROJECTION QUALIFICATION REQUIRED: new pure preservation/view-token contract, browser source/reference fidelity, visible-render acknowledgment/race seam.
MISSING AUTHORITY/IMPLEMENTATION: approved captain→publication context admission, operational/trusted publication availability and frontend read API; exact current picture cannot be filled from request evaluation.
EXTERNALLY GOVERNED DEPENDENCIES: source/full-history scientific admission; qualified material comparison and supported history/change/explanation producer. No new thresholds/sample/lookback selected.
ZERO-REPLAY DEPENDENCY: separate accepted design requires additive preserved-result/envelope qualification before replacing v1 replay behavior; do not claim it implemented here.

These gaps block dependent published/attention/history capabilities, not independently approved shell work. Preview b0cd2b1 remains frozen/read-only with Opportunity503; this document does not extend its one-session approval, reconnect it or unlock operational publishing. Only daytime source/design documentation completed, local commit only; no network push, runtime edits, execution, DB, private environment, packages, production/main/deploy/admission.