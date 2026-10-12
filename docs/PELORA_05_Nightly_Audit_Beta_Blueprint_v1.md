# PELORA-05 Nightly Learn / Daily Evidence Audit beta blueprint v1

DESIGN ONLY — proposed implementation and scientific criteria; no runtime, schema, admission, deployment or automated learning authorization.

The blueprint is ready for implementation planning. Operational Nightly Learn/Audit is not ready: durable source admission, complete historical selection, privacy qualification and operational publication remain dependencies. CP-10 remains blocked. Nightly is an independent retrospective evidence/audit workflow, never a live ranking or four-hour publication worker.

## Review identity and limits

Reviewed 12 October 2026 through local Git object reads. Checkout entering this mission was main at `851fde53c587afc8e572d4abd54b1a3553a753ee`, an older checkout; absence there is not a regression in later implementations. The documentation branch starts from that unchanged main commit. This report reviews the following separate committed lineages; it does not integrate them or claim a combined runtime exists:

| Reference | Material personally inspected / significance |
|---|---|
| `dadec5dbca7d360f70f633413fb6a347dc24cac1` | Fishing evidence capture/readiness/temporal integration; report component; report/history/observation/evidence-capture migrations; CP-06 receipt architecture; Continuous Observe Phase 2; CP-09 local publisher; four-hour foundation; privilege hardening. Source-science R1–R10 and P3-A/R9 conclusions from the prior PELORA-05 review remain binding. |
| `fcec85f794125d6268fbf3223a5db76df57d4aeb` | `docs/Continuous_Observe_Phase3_Async_Worker_Composition_v1.md`: Promise-aware memory/fake composition, not durable PostgreSQL Phase 3. |
| `913c5518327ccd53516d28da20e1bef593006b21` | `docs/Controlled_Same_Evaluation_Publication_Binding_v1.md`: controlled same-evaluation binding, not operational publishing or a general new baseline. |
| `94cc8b41fbf1e440dc2a27618617704a93025782` | AGENTS router and execution board: ownership, isolation and no automatic source admission/CP-10. |

These are repository findings, not freshly reviewed provider documents or email replies. External-request coverage NOT VERIFIED; NOAA/Copernicus remain separate authorities and existing pending inquiries are not duplicated. No live database, effective privileges, deployed schema, production service or operational evidence was inspected. Recorded qualification results are not rerun results. Existing temporal manifest artifacts and unrelated untracked SQL are not this commit's inputs or outputs.

## Existing support and exact gaps

| Area | Repository support | Boundary still required |
|---|---|---|
| Fishing day reports | Owner CRUD/RLS intent; private captain/boat/tournament/notes, effort, species results, information source and `share_intelligence` default false. Component initializes sightings/bites/hookups/releases/landings/losses to zero. | Default zero is not an explicit meaningful negative. Reports are mutable/deletable, not immutable inputs merely because a UUID exists. Deployment/owner isolation unverified. |
| `evidence_capture` | Source-only `pelora-fishing-log-evidence-capture-v1`; explicit local dates, time basis/confirmation, locations; migration adds nullable jsonb without backfill. UI insert carries capture and errors do not retry a lossy save. | Schema application must be verified. Legacy projections cannot reconstruct end date/timezone. No outcome, effort episode, visit time or immutable revision authority is supplied by this envelope. |
| Historical association | `buildFishingLogAssociationReadinessV1` composes governed temporal/spatial readiness; preserves supplied report/location references. | Identity presence is not ownership/revision authentication. No application callers or snapshot selection. A ready interval-at-location does not prove continuous occupancy, route or exact visit. |
| Governed Opportunity history | Private SELECT/INSERT, deterministic captain-owned history identity, original evaluation time/payload; ranked/presented outcomes only. | Does not prove captain saw/fished that Opportunity, or become shared regional science. Preserve original decisions rather than recomputing. |
| Governed observations | Private SELECT/INSERT for candidate/species evaluations, including evaluations not ranked. | Observation counts are evaluation counts, not encounter or independent environmental counts. Record exclusions/unavailable explicitly. |
| Persistence | Existing family consumers; P3-A exact cutoff/frozen private inputs; subsequent R9 local nonfinite rejection. | Source support/possession resolver and full R1–R5/R7/R10 policy remain unqualified. Different cycles do not establish independent support. No new movement inference. |
| Receipt Writer / CP-06 | Exact retained chain, database receipt time, immutable witness reuse and job links; least-privilege local architecture. | Disabled-by-default/isolated qualification is not deployment. Receipt proves linked evidence possession at witnessed time, not earlier trip-time availability or scientific adequacy. |
| Continuous Observe | Qualified isolated components; raw/capture exact references and local durable CP contracts. Phase 3 async branch has memory/fake ports only. | Approved sampling/retention, durable operational composition, health/coverage and source admission; all families separately qualified. |
| Four-hour publication | CP-08/09 local durable mechanics, controlled retained composition and later same-evaluation binding. | Operational shared evidence/history, governed publisher activation and historical reader. Pure producer/classifier replay still exists in binding contract; do not promise zero replay. |
| Privacy/RLS | Owner policies, grants and client-hardening design distinguish private tables from shared publication inputs. | Actual deployed RLS/ACL/inheritance/BYPASSRLS/service roles must be qualified. Consent boolean is not an approved anonymous-sharing pipeline. |

## Report and outcome eligibility

Separate saveability, private retrospective audit eligibility, environmental pairing eligibility, and anonymous-learning eligibility. A report can be saved and privately audited for missing fields while remaining ineligible for environmental comparison or shared learning.

For a proposed paired private analysis require authenticated owner authorization; exact captured report revision; supported evidence_capture interpretation; explicit resolved/bounded trip interval; sufficient reported location facts for the claim; species/outcome provenance; and separately eligible historical parents. Approximate/bounded facts remain approximate/bounded. Contradictory time, malformed capture, unsupported version, ownership conflict or unverifiable revision cannot be upgraded by readiness flags. Legacy reports may enter a private completeness audit; do not manufacture enriched time/location or outcomes.

Positive encounter semantics: preserve reported sightings, bites, hookups, releases, landings and losses as distinct captain-reported events/counts. Do not sum all stages into unique fish: one encounter can traverse multiple stages. Require explicit species, first-hand versus second-hand source, reported interval/location precision and duplicate/event linkage where available. An event is reported evidence, not independently verified fish presence, catch probability or proof that Pelora caused success. Unknown species remains unknown; an other-species report does not enable a new species engine.

Meaningful no-encounter semantics: require an explicit captain affirmation of no encounter for a specified species/outcome category during actual fishing effort, with stated effort interval, method/target and location scope adequate to that claim. Zero default counters, blank report, no landed fish, unfilled species row or hours_fished alone cannot supply this affirmation. Failure to hook fish does not prove no sightings/bites. Vessel transit, aborted effort and missing outcome stay distinct. Existing UI does not establish this complete negative-evidence contract: design its smallest outcome/effort extension separately, preserving unknown and explicit zero. No numerical minimum hours, count or distance is selected here.

## Private versus anonymous-learning eligibility

Private lane: owner-scoped read/analysis, no public output or cross-captain aggregation. Default private applies even when source metadata is otherwise complete. Background access requires a separately approved narrowly scoped owner-authority mechanism; never use a global service-role scan as a shortcut around owner RLS.

Anonymous lane: disabled until the approved sharing boundary is identified/versioned and implemented. `share_intelligence=true` is only a recorded preference, not sufficient authorization to export raw records. Require scope-specific valid consent at input freeze and release, exact consent version, opt-out/revocation semantics, approved field projection and reidentification review. Exclude direct identifiers, boat/tournament/private notes/free text, precise sensitive trajectories, owner tokens and private history payloads. Pseudonymous IDs alone are not anonymity. Spatial/time coarsening and release cohort rules require privacy approval; no numbers are invented here.

Retain private provenance mappings only in the protected owner domain. Shared artifacts use approved non-reversible release references. A privileged worker/schema validator cannot prove a privileged approver did not hide private meaning in an opaque ID. Consent absence, ambiguity or withdrawal fails closed for sharing; private report saveability is unaffected. Cross-owner hypothesis analysis waits for this gate.

## Historical lookup and trip matching

Use the report's actual governed trip time/location, not creation time, upload time, analysis time, device clock suggestion or present conditions. Resolve local time with the existing temporal interpreter and retain its version, confirmation, DST/ambiguity outcome and original inputs. Use each accepted location entry's exact source/certainty/accuracy; array order is not route order. No midpoint visit, occupancy or proximity tolerance is invented.

Lookup only retained immutable environmental captures/frames whose represented support and sample geometry can be matched under an approved source-specific association policy. Retain requested versus resolved coordinates and actual sample roles. Search success must report declared scope, covered support, gaps, source no-pixel, failure and truncation; absence of rows is not proven complete-empty coverage. No nearest/current/latest substitution, interpolation, clipping, inferred daily bounds or ungoverned archive reconstruction.

Maintain two explicit views: (1) original as-used assessment evidence with possession by its original assessment cutoff, and (2) separately identified retrospective trip evidence possessed by the nightly cutoff, including later revisions. Later evidence may describe the trip retrospectively under approved support/validity policy; it must never be portrayed as available to Pelora or the captain during the trip. Receipt Writer does not retroactively create earlier possession. Unknown receipt remains unknown.

Opportunity association is optional and independent of environmental pairing. Require exact published/evaluation reference, species/candidate/opportunity, original cutoff/context and actual trip correspondence. Stable identity or nearest candidate alone does not prove association. Keep original ranking context/rank and any captain-view evidence separate; a shared four-hour output does not prove it was delivered or viewed. If no original decision exists, mark decision comparison unpaired rather than regenerate a historical recommendation.

## Exact association identity and immutable input set

Proposed association envelope contains owner-domain scope; exact report revision/canonical content reference; location entry and effort/event episode references; original temporal/spatial capture and interpreter versions; historical lookup policy and resolution reference; exact environmental product/sample/revision/support/quality references; receipt references or explicit unknown; optional original publication/history/observation references; association version and limitations. Its content digest binds these exact parents, not just report UUID, trip date or candidate ID. No persistence write contract is approved here.

Nightly job identity binds explicit UTC cutoff, prior cutoff/window policy, analysis/hypothesis versions, authorized privacy scope and configuration reference. Proposed report intake interval is `(previous approved cutoff, current cutoff]` over trustworthy report revision-availability/change authority; this is intake timing, not trip timing. Execution time may be later. Scheduler hour, lookback/catch-up horizon, latency budget and retention remain approval decisions. `updated_at` alone is not an immutable revision/change ledger.

Freeze the exact selected revisions, exclusions and lookup outcomes before analysis; no reread of mutable reports or live pointer during computation. Detach data from owner edits; hash exact canonical encoding and preserve native parents. Include late arrival, changed/deleted reports and consent changes as explicit correction/tombstone events under an approved retention/privacy policy. Retries reuse the frozen set; conflicting content under the same job conflicts. A late report enters a later revision/audit, never rewrites the original night silently. Revocation/deletion must prevent release and govern purge/restricted retention without pretending immutable retained bytes cease to be personal data. Policy for audit integrity versus erasure is a privacy/legal gate, not permission to keep deleted reports forever.

## Hypothesis registry, counts and uncertainty

Version each proposed hypothesis with owner, falsifiable question, intended quantity, species/scope, allowed source families, required effort/outcome semantics, inclusion/exclusion, endpoint/unit, confounders, validation design and approval state. Begin with descriptive private pairing/completeness and explicitly registered retrospective comparisons; do not train a ranker. Productivity, visibility, habitat suitability and fish outcomes are distinct endpoints. Unsupported hypotheses remain blocked rather than relabeled validated.

Report separate counts for submitted reports, exact report revisions, effort episodes, reported positive events by category, explicit no-encounter episodes, unknown/empty outcomes, paired/unpaired episodes, unique exact source parents, reused sources, same-target revisions, overlap/dependence groups and missing exclusions. Do not sum encounter stages or multiply samples by publication cadence. Equal values are not automatic duplicates; different IDs/dates/nonoverlap do not prove independence. Selection/reporting bias, inaccurate recollection, fishing method/effort, source quality and unpaired missingness must be stated. Do not treat excluded reports as zeros or produce catch-probability estimates from anecdotal counts.

No default confidence weights, sample minima, gap tolerance, production thresholds or p-value policy. Before an inferential hypothesis, scientific review approves target, independent reference, dependence-aware holdout, uncertainty/error model, acceptance criteria and intended claim. PELORA-04 independently checks evidence; controlled software success alone cannot admit the source. Result confidence must distinguish data coverage, report certainty, source validity and hypothesis support; missing authority is not a low numeric scientific confidence.

## Environmental/context dimensions

Every paired family retains provider/product/version, direct/model/reconstructed nature, source support, contributor/revision lineage, raw quality/missing/failure, represented age at original assessment, acquisition/receipt time and present audit age separately. NOAA/Copernicus and DIRECT/GAP_FILLED stay separate. An unavailable family never borrows another family's receipt or freshness permission. NRT versus delayed/reprocessed evidence remains explicit. Nominal grid spacing is not independent observational resolution.

Persistence context may use only exact admitted historical parents under approved temporal policy. R9 unavailable/null derivations remain unavailable and cannot support confidence/narrative. Movement requires an already governed exact feature-association reference; do not infer motion from changing IDs, nearby points or labels. Terrain uses exact bathymetry/structure catalog version, datum/units, resolved sample and uncertainty; repeated static context is not repeated observation. Convergence, shear/gradient, vorticity, upwelling/downwelling and Ocean Physics quarantines stay closed. Missing salinity or unsupported water-mass claims remain missing; this blueprint adds no new signal/provider.

## Daily provider/system/provenance audit

Read durable status/capture records only; no nightly source acquisition implied. Separate scheduled jobs, attempted jobs, accepted jobs, immutable unique evidence, missing/no-pixel, outages, timeout/UNKNOWN acceptance, receipt unknown/late, archive corruption, conflicting revisions and incomplete coverage. Measure observed acquisition lag, represented-age distributions, reuse, family/cell coverage and revision differences; alert thresholds need approved operational budgets rather than invented science rules.

Audit exact raw/capture/reference/receipt/dependency links, support and coordinate correspondence, timestamps/clock anomalies, original cutoff exclusions, immutable publication binding, missing slots, readback/conflict/withdrawal and privacy projection/consent decisions. Hash integrity does not authenticate omitted upstream facts or confer science. Metadata drift triggers review, not automatic parser/rule repair. Provider failure is separate from report absence and environmental no-data. Emit proposed investigation items routed through PELORA-00, not provider emails or automated production changes.

## Immutable/versioned output and failure states

Proposed output binds nightly job/window/cutoff, frozen input-set digest, owner/privacy release scope, policy/evaluator/hypothesis versions, execution timestamps, exact association parents, counts/coverage, findings/uncertainty, exclusions, audit issues and supersession/withdrawal links. Keep owner-private result and any approved anonymous release separate. Append corrected versions; never mutate original report evidence, source capture, publication or scientific rule. Atomic immutable write/readback and deterministic idempotency need a separately authorized storage contract; no schema is introduced here.

| Outcome | Required behavior |
|---|---|
| Missing report outcome / default zeros | Unknown encounter status; no negative evidence |
| Unresolved trip interval/location | Private completeness finding; no invented historical pairing |
| Missing historical capture | Unpaired/missing; present conditions forbidden |
| No-pixel/observed missing source | Preserve present no-data record; not environmental zero |
| Unknown support/revision/possession | Distinct unresolved authority and prospective/retrospective limitation |
| Read outage / bounded truncation | Coverage unavailable/incomplete; not successful empty scope |
| Corrupt/conflicting reference | Invalid; dependent pairing/output excluded or failed explicitly |
| R9 nonfinite derivation | Unavailable dependent fact; original finite documentary facts retained |
| Partial permitted families | Explicit partial result; no complete-science claim |
| Missing/withdrawn sharing permission | No anonymous release; private path separately governed |
| Uncertain output commit | UNKNOWN; reconcile exact persisted content before retry/release |

These are proposed audit dispositions, not new operational admission enums. Successful job execution is not successful science; no-report nights can produce a system audit only when intake scope is proven complete. Unknown intake is not a zero-report conclusion.

## Dependency and governance gates

| Dependency | What must wait | What may proceed separately |
|---|---|---|
| Continuous Observe durable evidence | Genuine environmental trip association, coverage/persistence, recurring provider audit | Design and offline synthetic exact-identity/privacy/unknown-state qualification; report completeness audit without ocean claims |
| Receipt Writer or separately approved possession authority | Claims about exact evidence available by original decision cutoff; source-family-specific as-of authority | Retrospective comparisons only under approved retained-vintage authority, explicitly unable to claim prior possession; unknown receipts stay unknown |
| Four-hour governed publication | Auditing actual historical published decision/eligibility/rank and recurring decision continuity | Private report-to-environment pairing does not require a publication, but cannot evaluate an absent original recommendation |
| Approved anonymous sharing boundary | Every global/anonymous learning release | Owner-private audit with approved private processing authority |
| R1–R5/R7/R10 science decisions | Product comparability, full history adequacy, spatial/support/payload admission and inferential claims | Controlled software cases; not source admission |

No receipt dependency is silently waived: PELORA-00/scientific governance must choose prospective or explicitly retrospective claim scope and acceptable possession authority. Receipt Writer deployment itself must not enable learning/ranking. Reuse approved CP storage/readback/fencing precedents only after composition review; branch documentation is not operational integration.

Implementation packets, each separately authorized:

1. PELORA-00 freezes private/anonymous policy, nightly intake/retention/window and outcome/effort semantics; PELORA-05 registers bounded scientific hypotheses. Approve minimal report revision and explicit negative-evidence capture requirements before schema design.
2. Assigned report/privacy owner designs authenticated revision snapshotting, owner-only nightly access, consent/revocation/deletion and exact report/location/effort binding. PELORA-04 qualifies two-owner/anon denial, grants/RLS/privileged-worker leakage, edited/deleted/withdrawn records and output projection; deployment claims require actual environment evidence.
3. PELORA-01 coordinates durable Observe, family admission and possession/archive resolver, separately from report processing. Qualify missing/corrupt/late/revised/no-pixel/gap inputs and exact cutoff replay with no live fallback.
4. Assigned nightly implementation owner builds freeze/associate/compare/audit/append-only output worker with no production-rule writer permission. PELORA-04 checks deterministic replay, retries/conflicts/uncertain commits, failure-locality, source reuse counts and unchanged original publication/ranking. PELORA-06 may receive a separately authorized adversarial packet.
5. Scientific owner reviews actual independent validation evidence before permitted hypothesis claims; privacy owner approves anonymous release separately. Founder/PELORA-00 approves operational scheduler and release. Full Nightly Learn/Audit remains beta scope; incomplete dependencies do not justify silently reducing scope.

Permanent separation: nightly has no capability to update production weights, evidence gates, habitat rules, confidence, ranking or four-hour published records. Findings are versioned proposals for human review. Any future accepted rule change requires its own scientific validation, implementation, QA and release authorization.

## Verification and disposition

Only this Markdown blueprint is a mission output. No runtime/schema changes, application execution, tests/build/lint, source acquisition, network/database operations, provider outreach, installs or production actions. Documentation whitespace and exact staged-file/commit scope are verified separately from software/scientific qualification. Prior manifest/SQL remain untouched; main ref remains unchanged. No claim of deployed privacy, learning, operational source admission, beta readiness or CP-10 completion.

PELORA-05 NIGHTLY AUDIT BLUEPRINT READY

DESIGN ONLY — IMPLEMENTATION AND SCIENTIFIC ADMISSION NOT AUTHORIZED BY THIS DOCUMENT

CP-10 remains blocked.
