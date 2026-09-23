# Governed Gulf Places Ingestion & Verification Pipeline v1

Task 10D, starting checkpoint 98315b1c4610f5096780376d14b3c3c19edfaee3.
Repository-only offline tooling; real adapters, acquisition, transformations and active publication are absent.
Approved taxonomy additions: OBSERVATION_STATION, ARTIFICIAL_REEF, WRECK. No other Task 10C semantics changed.

## Decision and supported workflow

Remaining scientific decisions can stay explicit blockers rather than invented rules. Implemented:
source registry validation, adapter-result/proposal validation, deterministic conflict/review queue,
approval-bound offline catalog build, and a local-input/stdout-only CLI. Tiny synthetic records only.
No geographic grouping radius, universal depth rule, source-priority ranking, freshness duration or
species/candidate policy is selected. This is governance tooling for trusted offline reviewers, not an
authentication system: it cannot prove a referenced review happened or that supplied source claims are true.

The pipeline is authoritative source -> retained raw record -> interpreted proposal -> CRS/status/identity
assessment -> conflict review -> explicit verification -> offline catalog artifact. Transformations are a
future separately qualified step. Active catalog publication is a further authorized operation, not a CLI mode.

## Legacy importer audit and reuse

`scripts/parseBoemPlatforms.mjs` reads the existing local DAT and writes directly to the frontend artifact.
It extracts trailing decimal coordinates, converts with Number, cleans labels, assigns an area/block/complex
ID, drops structure-number identity, filters ten areas and selected labels, and retains the last duplicate ID.
It supplies active:true, hardcoded NAD27, current importedAt and legacy species scores. Sorted JSON is produced,
but clock-dependent timestamps and source loss prevent a reproducible governed artifact. It does not transform.
Reusable ideas: line parsing and source-field extraction after layout qualification. Do not reuse admission
filters, status claims, ID dropping, score fields, direct output destination or last-wins deduplication.

No FAD, oilPlatforms, curated Gulf grounds or reef workbook generator was found among repository scripts.
Their artifacts are inputs for research, not reproducible verified sources. gulfLocations.js strips punctuation
and first-wins by name; it is not safe reconciliation. Backend BOEM/FAD copies are independently stored.
Environmental water-mask/splash scripts do not constitute place ingestion and remain untouched.

## Executable interfaces

`scripts/places/pipeline.mjs` exports normalizeSourceRegistry, buildVerificationQueue,
buildReviewedCatalog, serializePlaceArtifact and digestPlaceArtifact.
`scripts/places/cli.mjs` reads explicitly supplied local JSON and prints JSON only:

```powershell
node scripts/places/cli.mjs queue <review-input.json>
node scripts/places/cli.mjs build <review-input.json> <approval.json>
```

Paths are operator-supplied local files. No default source file, network access, output file or active catalog
path exists. Do not redirect stdout into frontend/backend runtime artifacts. No real inputs are included.
The executable input example is the fixture factory in `backend/tests/placeIngestion.test.js`.

Input has exactly registry, records, existing. Existing is the reviewed baseline catalog, never modified.
Registry: registryVersion and sources. Each source includes sourceId, authorityId, datasetId, snapshot,
regionIds, featureTypes, crs, horizontalDatum, updateCadence, statusSemantics, adapterId, adapterVersion,
qualificationRef. Qualification is per dataset purpose/type/jurisdiction; no universal authority ordering.
Null qualificationRef keeps proposals blocked. Cadence may remain unknown; it does not invent freshness.

Adapter result: proposalId, sourceId, sourceRecordRef, entityKind (feature/deployment/station-position),
rawRecord, proposedPlace, reviews (datumRef/statusRef/identityRef). IDs are supplied stable reservations,
not generated from names/coordinates. A valid proposedPlace uses Task 10C with UNVERIFIED state,
no verification assessment and all permissions not-assessed; adapters cannot grant them.
The source namespace/snapshot/locator must match proposal provenance. Source CRS/datum must match the
original geometry reference system, including original transformation input if supplied.

Raw record is a detached finite JSON value preserved in the offline queue, with a SHA-256 digest of canonical
JSON. This is NOT a checksum of original file bytes. A future acquisition manifest must separately preserve
file checksum, source release, safe locator and adapter/version. Dates/geometry/status are not silently filled.
SourceDate is source text, retrievedAt is acquisition metadata; neither proves position observation time.
Large source payloads need an approved local/archive reference strategy, not automatic copies into Git.
No secrets, signed URLs or captain information belong in source metadata. Adapters must select station metadata,
not fetch or embed station environmental measurements. Generic raw strings require trusted-input review.

## States, gates and conflicts

Queue states: PROPOSED (one or more issues), CONFLICT, READY_FOR_VERIFICATION. None means VERIFIED.
Issues are composable: NEEDS_SOURCE_QUALIFICATION, NEEDS_DATUM_RECONCILIATION,
NEEDS_STATUS_VERIFICATION, NEEDS_IDENTITY_RECONCILIATION. Malformed input throws a validation error and
produces no successful queue; it is rejected input rather than a silently dropped row.

Datum readiness requires supplied geometry, CRS, horizontal datum, units and datum review reference.
Supplied transformation lineage additionally needs verificationRef and known source CRS, horizontal datum
and units; a known target cannot conceal an unresolved source reference system. No transformation code exists.
Known NAD27 can remain NAD27 in an offline record; it is not WGS84 map geometry. A map consumer must use a
separately reviewed target representation. The 149 BOEM positions are neither transformed nor approved here.
Status readiness requires explicit status and review; mobile positions additionally require observedAt.
Time alone does not prove current validity. No age cutoff is invented.
Identity review is always explicit, including reef site versus deployment and station versus hardware.

Conflict objects preserve both full place representations and their proposal/existing references. Exact
authority namespace collisions, name/alias overlaps, exact geometry overlaps and shared Pelora identity
produce review leads. Linked records report differing geometry, CRS, name, type and temporal/status evidence.
No proximity comparison or fuzzy matching exists. Differently located, differently named records without
shared IDs cannot automatically be recognized as the same feature: human/source reconciliation is required.
Exact geometry/name overlap is a possible identity conflict, not a merge. Same IDs with changed evidence
produce a proposed revision with the immutable prior record. One current proposal cannot reuse its prior revisionId.
Multiple proposals for the same place must be reconciled before building a catalog; no latest/first-wins rule.

Review queue includes raw evidence, normalized proposal, source qualification, checksums, previous revision,
all blockers, conflicts and recommended review action. Ordering and digests are deterministic. Array order
within source evidence remains meaningful; no arbitrary sorting of geometry or raw arrays occurs.
Sources sort by sourceId, proposals by proposalId, baseline/build records by placeId and conflicts by
conflictId, using string comparison. Object keys serialize canonically; evidence arrays retain their order.
SHA-256 digests bind review content, not geographic truth, reviewer authenticity or scientific qualification.

## Explicit offline catalog build

Approval includes catalogVersion, exact queueDigest and decisions. Each decision binds proposalId,
proposalDigest, decisionRef, conflictReviews (conflictId/decisionRef) and approvedPlace. Changed source,
registry, prior catalog, reviews or proposed facts invalidates previous approval. Every selected proposal
must have no issues; every attached conflict requires a recorded review. Duplicate authority/place identities
still fail Task 10C catalog validation even when a reviewer supplied conflict references.

approvedPlace may change verification and independently reviewed permissions only. Any geometry, classification,
identity or name correction must first regenerate the proposal/queue and receive fresh approval. This preserves
one physical feature identity without silently manufacturing same-feature evidence. Unselected proposals remain
pending; selected revisions replace the matching baseline identity; other reviewed baseline records remain intact.
Existing baseline records must be reviewed (not UNVERIFIED). Same-name distinct places may coexist after explicit
conflict review, with alias resolution remaining ambiguous. The build is conflict-reviewed, not proof that unknown
physical duplicates cannot exist. Input baseline trust and review authenticity remain operator responsibilities.

Output includes contractVersion, supplied catalogVersion, queueDigest, registryVersion, complete approved decisions
and stable placeId-sorted records. Retain the exact queue/input alongside the build to replay provenance.
No persistence, signed authorization, source acquisition, scientific verification or active publication is claimed.

## Approved identity boundaries

One physical feature has one governed identity when evidence establishes sameness. Wreck/reef source overlap,
renames and multiple descriptions do not automatically create or merge places. Task 10C retains one reviewed
primary classification; alternate descriptions remain raw/provenance evidence. Uncertain sameness requires review.

An ARTIFICIAL_REEF site is distinct from deployment/material events. Preserve all contributing deployment records;
group only by authoritative site evidence or explicit reviewed identity mapping. The present one-record proposal
interface can retain a JSON collection of contributing records and multiple provenance entries; a real FWC adapter
must perform approved site reconciliation before proposing that aggregation. There is no distance grouping threshold.

OBSERVATION_STATION is station identity, independent of hull/hardware and deployment/location/status history.
Future station adapters need stable station references plus dated deployment evidence, not one new place per
measurement or an assumption that every station is a fixed buoy. Measurements belong to Ocean Product evidence.
WRECK implies neither fishing value nor access permission. No added type grants any consumer permission.

## Depth, enrichment, presentation and candidate firewall

Ingest broadly, verify rigorously, present intelligently. 30/60/100-ft and absent-depth synthetic raw records
have identical admission behavior. No depth field is added to the Place. Raw source depth is retained as source
evidence only, not automatically promoted to governed bathymetric truth. No shallow-water or offshore-distance cutoff.

Future enrichment: qualified Place geometry + qualified/versioned Ocean Product bathymetry -> separately versioned
context reference (depth, shelf/slope, transition, relief). No enrichment is calculated here and Task 10B validation
alone does not qualify a bathymetry product. Current legacy depth strings are not scientific context.

Future presentation adapter (design only): Place/revision + Captain Context + versioned presentation rules + optional
qualified context -> defaultVisible/searchable/manualLayerVisible + reasons/rule references. Unknown policy cannot
grant access. Mission suppression may affect defaultVisible without erasing searchable/manual visibility where permitted.
A shallow station can provide useful environmental context without being species habitat. No species rule is implemented.

Catalog -> separately governed candidate-context adapter -> Unified Candidate Universe. Neither admission nor default
visibility changes candidates, budgets, rank, confidence, marker identity or Opportunity eligibility. Future tests must
prove display-only expansion and dense structures do not crowd out independent open-water candidates. No budget or scoring
change here. Learning-context permission still does not establish Fishing Log association.

## Authoritative source ledger (metadata research, no datasets acquired)

Research date 2026-09-23. Available means a source route exists, not adapter or record approval. No real source is
marked qualified by this implementation. Scales are source-described or existing local counts, not a new census.
Public availability does not establish unrestricted redistribution; terms, release, CRS and IDs must be pinned per adapter.

| Source/authority | Region/type; identity/geometry/scale | Dates, CRS, delivery, use and adapter status |
|---|---|---|
| [GEBCO/IHO/NCEI](https://www.gebco.net/data-products/undersea-feature-names) | Global undersea features including Gulf; naming authority SCUFN; mixed point/line/area. Gulf count and durable ID mapping unqualified | REST/WFS, spreadsheet/shapefile; legacy service EPSG:4326 does not qualify every new endpoint. Retain required attribution, source release and representative-point meaning. Medium adapter complexity; qualification pending |
| [BOEM/BSEE](https://www.data.boem.gov/Mapping/Files/platform_meta.html) | Federal Gulf fixed structures; complex + structure ID. Existing DAT 7,306 rows, filtered artifact 149 | NAD27, monthly GIS metadata, install/removal status; approximate/non-navigation, federal public-use terms. ASCII/GIS. High reconciliation complexity; datum, structure ID and status blockers |
| [FWC reef schema](https://gis.myfwc.com/mapping/rest/services/Open_Data/Artificial_Reef_Locations_in_Florida/MapServer/12) | Florida coast, deployment points; DeployID, material and site descriptions; service describes 4,442+ deployments, local workbook 4,548 | Service EPSG:6439; local DD workbook datum independently unresolved. Service snapshot May 2025 versus local heading May 2026. JSON/GeoJSON/PBF/XLS/GIS. High site/event reconciliation complexity; check reuse constraints and location accuracy |
| [FWC program](https://myfwc.com/fishing/saltwater/artificial-reefs/locate/) | Official statewide artificial-reef discovery route | Materials can move, degrade or become buried; source presence is not present-day verification. Local workbook attribution is consistent with official format but original acquisition/checksum is not documented |
| [Alabama MRD](https://www.outdooralabama.com/saltwater-fishing/artificial-reefs) | Public reefs from inshore to offshore, named zones and waypoint releases; exact record count not fetched | GPX/KMZ/XLS annual releases including 2025. CRS/ID stability/date semantics and reuse terms need release inspection. Medium/high reconciliation; no FAD feed established by a reef list |
| [Mississippi DMR](https://dmr.ms.gov/artificial-reef/) | Inshore reefs, 15 described offshore permitted sites; site != deployment | Coordinate/GPX/map routes and GIS services. Site and deployment IDs/CRS/status cadence require qualification. Public access, reuse terms unverified; medium complexity |
| [Louisiana LDWF](https://www.wlf.louisiana.gov/page/artificial-reefs) | Inshore/nearshore/offshore reef programs; indexed official page lists 33 inshore reefs and an FAD map link | PDF/KML routes. Nearshore program explicitly includes coastline to 100-ft contour. Direct page fetch 403; indexed official text available. CRS, release, FAD status and terms unresolved; medium/high complexity |
| [Texas TPWD](https://tpwd.texas.gov/landwater/water/habitats/artificial_reef/) | State/federal reef sites; page describes nine nearshore sites and intentionally sunk vessels | Interactive GIS route, not a fetched dataset. Stable site IDs/CRS/status and redistribution terms pending. Medium/high complexity; site/ship/material distinctions needed |
| [Okaloosa official program](https://www.destinfwb.com/blog/fish-aggregating-devices-fads-acoustic-tagging-camera-monitoring/) | Previous Task 10C authoritative finding: 16 FADs including 2025 expansion; local artifact contains eight | Current per-buoy source IDs, datum, anchor/device identity, deployment/redeployment history and status feed remain unqualified. No new coordinate retrieval; medium/high adapter complexity |
| [NDBC guide](https://www.ndbc.noaa.gov/docs/ndbc_web_data_guide.pdf) and [active-station FAQ](https://www.ndbc.noaa.gov/faq/activestations.shtml) | Station ID, owner, program, latitude/longitude, current deployment metadata; Gulf subset count not fetched | XML station metadata/active-list routes, not observation ingestion. Signed degrees alone do not establish datum. Active reporting flags do not prove every instrument works. Direct FAQ 403, official indexed guide available. Datum/status/history semantics and reuse terms pending; medium adapter complexity |
| [NOAA Fisheries areas](https://www.fisheries.noaa.gov/resource/map/madison-swanson-sites-steamboat-lumps-edges-fishery-management-areas-map-gis-data) | Madison-Swanson, Steamboat Lumps, Edges managed areas, polygon identity | Shapefile/KMZ download route; legal area identity must be reconciled with authoritative descriptions. GIS illustrative, not permission to fish. CRS/release/terms must be inspected before importing; manageable small pilot |

No official public FAD coordinate/status feed was established for Alabama, Mississippi or Texas in this audit.
That is an unresolved research result, not a claim no FADs exist. Louisiana's official indexed FAD map route is
an improvement over Task 10C's failed page access, but it is not deployment/status verification. FADs can move;
anchor site, device and redeployment history need separate source interpretation. No private/community feed contacted.

## Named-ground research queue

| Lead | State | Required work |
|---|---|---|
| Madison Swanson | OFFICIAL AREA FOUND | Preserve management-area identity; do not infer seamount/colloquial ground equivalence |
| Steamboat Lumps, Edges | OFFICIAL AREA FOUND | Small NOAA polygon candidates; regulatory-area versus physical feature remains explicit |
| DeSoto/De Soto Canyon | CORROBORATION NEEDED | Reconcile exact gazetteer feature/geometry; BOEM lease-area name is insufficient |
| Lloyd's Ridge / Lloyd Ridge | CORROBORATION NEEDED | Verify name, feature ID and representative versus extent geometry |
| The Steps, The Spur | COLLOQUIAL / UNRESOLVED | Official chart/survey/name reconciliation; no remembered coordinates |
| The Elbow | COLLOQUIAL / UNRESOLVED | Keys official Elbow area is not automatically the West Florida fishing-ground name |
| Dumping Grounds | COLLOQUIAL / UNRESOLVED | Resolve which charted disposal area, if any; broad name is ambiguous |
| Green Canyon, Mississippi Canyon, Viosca Knoll | CORROBORATION NEEDED | Lease blocks/regions and physical features must not be conflated |

## Regional coverage ledger

A = authoritative source route available; P = partial/reconciliation required; U = not established;
N = not yet researched for that jurisdiction. None means catalog publication-ready.

| Region | Named features/areas | Structures | Reefs/wrecks | FAD | Stations |
|---|---|---|---|---|---|
| Texas | P GEBCO | P BOEM | A TPWD | U | P NDBC |
| Louisiana | P GEBCO | P BOEM | A LDWF route | P indexed official map | P NDBC |
| Mississippi | P GEBCO | P BOEM | A DMR | U | P NDBC |
| Alabama | P GEBCO | P BOEM | A MRD | U | P NDBC |
| Florida Panhandle | P GEBCO/NOAA | P BOEM scope | A FWC | P Okaloosa | P NDBC |
| West Florida shelf | A NOAA areas; P GEBCO | U | A FWC | U | P NDBC |
| West Florida slope | P GEBCO | U | P FWC coverage | U | P NDBC |
| Deep central Gulf | P GEBCO | P BOEM federal scope | U | U | P NDBC |
| Eastern Gulf | P GEBCO/NOAA | U | P FWC jurisdiction | U | P NDBC |
| Other Gulf waters | P global gazetteer | N national sources | N | N | N national/network scope |

Research deliberately includes shallow stations, reefs and shelf structures. Source-route coverage is not
verified geographic completeness. National jurisdiction qualification is needed before expanding beyond U.S. sources.
Metrics: reviewed record/revision counts by state/category/region, datum/status-resolved percentage with explicit
denominator, conflicts and unresolved leads, source release coverage, and mobile age distribution. Stale counts
require a separately approved freshness rule; this task invents none. Raw counts are not catalog quality scores.

## Current records: documented assessment, no migration

BOEM 149: SAFE_TO_PROPOSE as research evidence plus NEEDS_DATUM_RECONCILIATION and NEEDS_STATUS_VERIFICATION;
PLEM/Production Mani and curated Thunder Horse overlaps add CONFLICT. Backend copies are not corroboration.
FAD eight: SAFE_TO_PROPOSE with NEEDS_STATUS_VERIFICATION and datum/source-identity review; not complete coverage.
Drillships three: RESEARCH_REQUIRED; untimed positions cannot establish current location.
Intelligence zones/gulfStructures four each: LEGACY_DISPLAY_ONLY, duplicate/type/provenance CONFLICT review.
oilPlatforms twelve: seven known name/complex-ID conflicts; remainder still require authoritative verification.
FWC workbook 4,548 deployments: source evidence SAFE_TO_PROPOSE; site grouping, CRS and status RESEARCH_REQUIRED.
No deployment is directly admitted as a Place. Nine departure ports: LEGACY_DISPLAY_ONLY pending source review.
Empty fishingAreas/processed structures and three geometry-free regions provide no publishable place records.
The reviewed Task 10C inventory remains the source for exact counts/conflicts; no source file was changed.

## First real batch and download boundary

Recommend a small NOAA marine-area pilot: Madison-Swanson, Steamboat Lumps and Edges, after dataset CRS,
release and feature identity qualification. This gives a bounded authoritative area set, tests polygon versus
representative-point behavior and resolves a known semantic confusion without BOEM transformation or mass reef grouping.
It is a context catalog pilot, not a recommendation to fish within any managed area.

This pilot exercises area semantics but only modestly advances broad named fishing-location coverage.
A complementary small official artificial-reef site batch would better exercise shallow point features,
site identity, deployment multiplicity and status. Prefer two or three FWC sites only after source-level
site identity, datum, date/status and public-use terms are established. The existing workbook is evidence
for qualification, not an approved ready-to-import catalog. If authoritative grouping is absent, stop for
identity review; do not group by distance. A small NDBC station subset offers stable station-identity testing
but advances environmental context rather than named fishing-ground coverage. Neither alternative is an
acquisition authorization. Keep the NOAA pilot for bounded geometry verification; qualify the reef batch
alongside it for practical captain coverage rather than treating three management areas as that goal.

No download is required for the synthetic pipeline. Before a real pilot, stop for acquisition approval:
source = NOAA Fisheries linked GIS package; expected size = not established (must inspect package metadata first,
not guess); terms = retain NOAA source/disclaimers, verify redistribution; purpose = preserve exact official area
geometry/identity; outputs = retained raw snapshot/checksum, proposals and review queue, never active catalog.
Also establish source CRS/datum and confirm the package contains only public, non-sensitive source data.
If that source fails qualification, do not substitute remembered or community coordinates.

Then qualify a small station metadata subset, a reviewed FWC site with multiple deployments, and BOEM
complex/structure identities. Each acquisition/transformation needs its own bounded review. No current-source
adapter is operational yet; this task supplies the offline framework and synthetic proof only.

## Verification performed

Task 10C: 26 tests passed, including the three approved types with no automatic permission.
Task 10D: 22 synthetic tests passed, including stale approvals after proposal/source/blocker/conflict/prior-revision
changes, deployment duplication and unresolved transformation-source metadata. The final review reproduced
and closed a datum-readiness gap: known target metadata previously concealed unknown source metadata.
Complete backend/shared suite: 17 scripts passed with network
fetches disabled before test imports. Module, test and CLI syntax checks passed; the CLI was not run
against real inputs. Missing/malformed CLI input was checked for non-success exit behavior without output files.
Tests exercise the queue/build functions directly. Tracked/new-file whitespace
checks passed. Source artifacts and runtime modules remain unchanged; source counts and duplicate
frontend/backend copies were rechecked. No real dataset, database or environmental provider was accessed.
Public authoritative metadata research was performed; it is not dataset acquisition or source approval.
