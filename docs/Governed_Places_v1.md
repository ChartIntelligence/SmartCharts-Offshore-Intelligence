# Pelora Governed Places v1

Task 10C audit and pure contract, starting at 24915f073bd87e1382b1d5eac307e1033a0915fa.
No existing dataset or runtime is changed. No catalog is published or verified by this task.
Public-source qualification was inspected on 2026-09-23; no external dataset was imported.

## Decision and limits

The descriptive contract can proceed without selecting scientific policy. Implementation:
`shared/governedPlace.mjs`; synthetic tests: `backend/tests/governedPlace.test.js`.
These are not imported by application runtime. Normalization means structural validation,
not geographic verification, authorization, freshness, navigational suitability or opportunity eligibility.
Eligibility entries record externally issued decisions and their policy references; this module does
not authenticate those references, evaluate policy or decide whether a historical decision is still valid.
Consumers must revalidate applicable policy, CRS readiness and temporal validity before use.
No unresolved source record is promoted by having a valid contract.

PLACES != OCEAN SIGNALS != OPPORTUNITIES. Source presence, fame, catches, report density,
community activity and popularity confer no verification, display priority, candidate priority,
confidence or rank. No current scoring, candidate budgeting or map behavior changes here.

## Repository inventory

All frontend data paths below are under `frontend/src/data/`. All coordinate arrays in these
legacy place artifacts are latitude, longitude, not the new contract's explicit x,y order.
None has governed aliases, source geometry, transformation lineage or a governed verification state.

| Artifact | Count/category/identity | Evidence and current use |
|---|---|---|
| boemPlatformsImported.json | 149 oil_platform; boem-area-block-complex IDs | BOEM source complex ID, area/block/district; hardcoded NAD27; importedAt, not source observation date; approximate GIS claim. Frontend map/search/Areas Fished through merged collection. Backend copy feeds candidates and nearest-structure context |
| fads.json | 8 FAD; okaloosa-fad-1..8 | Okaloosa County, converted DDM, verified:true and active:true claims; no CRS, source URL or verification/status date. Anchor/buoy movement note. Map/search/Areas Fished; backend candidates |
| drillShips.json | 3 drill_ship; named IDs | West Vela, Deepwater Atlas, Deepwater Titan; no source, datum or position time. Map/search/Areas Fished, not backend structure catalog |
| intelligenceZones.json | 4: 3 intelligence_zone, 1 oil_platform | Madison Swanson, Green Canyon, DeSoto Canyon, Thunder Horse. Names/slugs, coordinates, unsupported static environmental/species metadata; no provenance/date/CRS. Frontend uses |
| gulfStructures.json | 4 same records | Same values as intelligenceZones except public:true; removed by merge priority there. Also imported by legacy IntelligenceMap.jsx |
| fishingAreas.json | 0 | No active import found |
| oilPlatforms.json | 12 oil_platform | Curated IDs/names, BOEM complex ID, reportDate 2026-07-01, approximate coordinate claim, no datum. No active import found. Seven material identity conflicts below |
| gulfLocations.js | 168 input entries -> 160 | 146 oil_platform, 8 FAD, 3 drill_ship, 3 intelligence_zone. Name-based first-wins merge, not canonical identity resolution |
| backend/data/boemPlatformsImported.json | 149 | Byte-identical frontend copy |
| backend/data/fads.json | 8 | Byte-identical frontend copy |
| backend/server.js VERIFIED_STRUCTURES | 157 | Concatenates BOEM + FAD, active != false. No frontend name dedup. Variable name does not establish verification |
| scripts/source-data/boem-platform-locations/platloc.DAT | 7,306 nonblank rows | Raw local ASCII source; date/row status not carried through reliably. Source ZIP also present; importer reads DAT |
| scripts/source-data/florida-reef-locations.xlsx | 4,548 deployment-ID rows | One sheet, Florida Artificial Reef Deployments, heading May 7 2026. DeployID, county, deployment date/name, material, depth/relief, jurisdiction/coast, DD/DDM, location accuracy. No current import. Deployment events are not automatically distinct canonical places; CRS must be qualified |
| database/processed/structures.json | 0 | No runtime use found |
| database/processed/regions.json | 3 | MISSISSIPPI_CANYON, GREEN_CANYON, VIOSCA_KNOLL names/types only; no geometry/provenance; no runtime use found |
| database/schemas/structure_schema.json | template, not records | Legacy identity/location/status/species-relevance shape; not the governed contract |
| PeloraStartupFlow.jsx DEPARTURE_LOCATIONS | 9 ports | Port St. Joe, Panama City, Destin, Orange Beach, Venice, Grand Isle, Galveston, Freeport, Port Aransas. Mission origins, not fishing grounds; slug IDs, coordinates, no source/CRS |
| backend/data/gulf-water-mask-v1.json | 266 samples: 189 water, 77 land | Environmental sampling artifact, not Places; open-water candidate coverage remains independent |

The XLSX count uses populated deployment-ID cells, not the stale auto-filter extent.
No additional canonical named-place collection was found in the searched application/data/import paths.
Runtime environmental observations, generated open-water candidates and captain-private coordinate drafts
are deliberately not counted as shared Places.

## Duplication and conflicts (no automatic merge)

Madison Swanson, Green Canyon, DeSoto Canyon and Thunder Horse are duplicated across
intelligenceZones/gulfStructures. Frontend normalization strips punctuation and retains the first name.
Thunder Horse also occurs in BOEM: legacy [28.19,-88.49] versus BOEM
[28.19060986,-88.49558496], complex 1101. Curated record wins on frontend; backend uses BOEM.
CRS is absent on curated records, so coordinate differences cannot be interpreted as accuracy comparisons.

Distinct BOEM records named PLEM #2 / PLEM 2 (complexes 90315, 90312, 90319) collapse to one
frontend name. Production Mani (90207, 90235) likewise collapses despite different coordinates.
The backend retains them. Name-based dedup is not safe place identity.

Unused oilPlatforms conflicts with the imported BOEM artifact:

| Curated name | Its complex ID | Name attached to that ID in imported data / conflict |
|---|---|---|
| Devils Tower | 1101 | Thunder Horse; imported Devils Tower is 1175 |
| Gulfstar 1 | 2045 | Thunder Hawk; imported Gulfstar 1 is 2498 |
| Independence | 2089 | Imported Independence is 1766 with different coordinates |
| Mars | 70004 | Ursa; imported Mars is 24199 |
| Olympus | 24199 | Mars; imported Olympus is 2385 |
| Thunder Hawk | 1175 | Devils Tower; imported Thunder Hawk is 2045 |
| Ursa | 1766 | Independence; imported Ursa is 70004 |

Appomattox, Blind Faith, Medusa, Na Kika and Who Dat agree by complex ID and coordinates to
stored rounding. Agreement between two local artifacts is not independent authoritative verification.
FAD frontend/backend copies are identical, not independent corroboration. No automatic alias claim is
made between a BOEM leasing-area name (e.g. Green Canyon) and a physical canyon or fishing ground.

Current Okaloosa artifact positions (latitude, longitude; untransformed, not newly verified):
1: 29.528317, -87.043883; 2: 29.4557, -87.117267; 3: 29.389217, -87.1861;
4: 29.311517, -87.25915; 5: 29.4485, -86.881067; 6: 29.348117, -86.879133;
7: 29.248567, -86.88025; 8: 29.14745, -86.876867.
All lack per-record deployment/status observation dates and datum qualification.

## NAD27 audit

`scripts/parseBoemPlatforms.mjs` extracts trailing decimal longitude/latitude, reorders them,
adds datum:NAD27 and writes the frontend artifact. No transformation occurs. It restricts ten
area codes (AC, AT, DC, GB, GC, KC, LL, MC, VK, WR), filters labels, and deduplicates by
area/block/complex ID. It drops the structure-number component embedded before the area code;
complex ID alone may identify a group of connected structures. All retained records get active:true.
Thus 149 is a filtered artifact, not full Gulf coverage or verified operational status.

`buildMapGeoJson` swaps latitude/longitude into MapLibre longitude/latitude without datum conversion.
`useMapLibreMarkers` also uses Gulf-shaped axis heuristics, not transformation. Backend nearest-structure
and candidate paths consume the same numbers as geographic coordinates. Neither reconciles NAD27.

[BSEE platform metadata](https://www.data.boem.gov/Mapping/Files/platform_meta.html) explicitly describes
NAD27 geographic decimal degrees, complex plus structure identifiers, install/removal fields, monthly
updates and approximate non-navigation GIS use. The
[structure query](https://www.data.boem.gov/Platform/PlatformStructures/Default.aspx) exposes NadYearCd;
Hoover 183 and Perdido 2008 show code 27 with coordinates matching local DAT rows. This supports the
mismatch finding, but does not complete per-record verification of the imported snapshot.

NAD27 is not WGS84; relabeling is not transformation. Regional datum shifts can be on the order of
tens of metres; no offset or corrected point was calculated here. Actual offshore applicability and
uncertainty of a chosen transformation must be checked per coverage area. See
[NGS NADCON technical treatment](https://www.ngs.noaa.gov/PUBS_LIB/NGS50.pdf).
Consequences: displaced markers, nearest-feature distances and future association errors. All 149
records remain NEEDS DATUM/STATUS VERIFICATION. This branch stops before coordinate repair.

## DEPTH-NEUTRAL COVERAGE

Locked governance: there is no universal 200-foot minimum, maximum depth, or offshore-distance
requirement for catalog inclusion. Depth is environmental/spatial context, not catalog admission.
Source discovery must intentionally span relevant nearshore/shallow waters, shallow and mid-shelf,
outer shelf, shelf break, slope and deep Gulf; it must not begin at 200 ft or another numeric cutoff.
The same species-neutral architecture supports shallower and deeper regimes without redesign.
Seasonal shallow-water species behavior is one reason for this coverage principle; species habitat
and seasonality remain downstream governed interpretation, never Place admission rules.

Relevant public FADs, authoritative weather/ocean buoys, verified structures, reefs/features and other
named places may be proposed for future governed inclusion when verification permits. Neither every
buoy nor every FAD is automatically a fishing location. Existing OFFSHORE_STRUCTURE or another later
governed contextual category can represent useful buoy identity; no new type or ingestion is added here.
Buoy geographic/context identity is distinct from the environmental observations it produces.
Those observations belong in the Ocean Product/Evidence system, not arbitrary Place fields.

Future governed bathymetry may supply local depth, shelf/slope context, nearby depth transitions or
structural relief. Task 10B's descriptive product foundation and future qualified bathymetry products
provide the evidence path; structural frame validity alone does not qualify bathymetry. No such values
are calculated or stored in Task 10C, and unverified legacy depth descriptions must not become truth.

Shallow or deep catalog presence establishes no species/seasonal habitat eligibility, Ocean Signal,
Opportunity, candidate priority, rank, confidence or fishing value. Downstream systems retain authority
for environmental evidence, captain context, candidate/opportunity eligibility and ranking.
Catalog inclusion is not candidate eligibility; candidate eligibility is not ranking;
learning-context permission is not Fishing Log association. Catch/popularity never affects verification.

## Identity, geometry and revisions

`placeId` is supplied stable Pelora identity, independent of names, coordinates and array order.
`revisionId` identifies an immutable revision; corrections retain placeId and create a new revision.
Authority references are namespaced authorityId + datasetId + featureId. For platforms, qualify the
complex/structure tuple; do not use transient ArcGIS OBJECTID as durable identity without a source guarantee.
Pelora identity remains necessary across authority changes, aliases, multiple sources and local names.
No IDs are generated by these helpers. Catalog version belongs to future published catalog manifests;
source snapshot is per provenance record. Adapter version is recorded in transformation lineage where used;
future ingestion manifests must also record adapter/version for non-transforming imports.

Supported 2D geometries: Point, LineString, Polygon, MultiPolygon. Coordinates are x,y in the explicit
declared CRS; this is not implicitly RFC7946 WGS84 GeoJSON. No Z ordinates or CRS transformations.
Unknown CRS/datum stays null. Basic finite numbers, dimensions, ring closure and geographic bounds for
recognized geographic CRSs are checked. Topology, self-intersection, holes, antimeridian handling,
CRS/datum consistency, source authenticity and transformation accuracy require qualified adapters.

geometryMeaning separates feature-location, feature-extent, representative-location and observed-position.
A separate representativePoint has method and source reference and uses the main geometry's CRS.
It does not replace a polygon or assert full feature extent. Point-on-surface/interior correctness is not
computed. Unknown geometry may be retained for research with no representative point.
Transformation lineage retains original geometry/reference system, source reference, method,
implementation/version and verification reference; the main geometry is the supplied result, not computed.
Vertical datum is preserved if known; depth/structural interpretation is referenced through contextRefs,
not invented from the location. Unknown context remains absent as an empty reference list.

## Taxonomy and temporal identity

FISHING_GROUND, CANYON, RIDGE, LEDGE, BANK, SEAMOUNT_OR_HUMP, FAD, PLATFORM,
OFFSHORE_STRUCTURE, MARINE_AREA, OTHER_NAMED_PLACE, OBSERVATION_STATION, ARTIFICIAL_REEF, WRECK.
The last three types were explicitly approved for Task 10D; the v1 taxonomy is extended additively.
Older validators must be upgraded before reading these types; no existing record is reclassified.
These categories are region/species/depth independent and imply no ecological or fishing value.
OBSERVATION_STATION identifies a station, not its hardware, deployment or environmental measurements.
ARTIFICIAL_REEF identifies a reviewed feature/site, not automatically each material deployment.
WRECK identifies a wreck, with no implied habitat, access or opportunity eligibility.
Reef/wreck overlap requires identity review: one physical feature gets one stable identity when evidence
establishes sameness, otherwise competing records remain unresolved. No source or popularity wins by default.
The contract retains one reviewed primary placeType; alternate source classifications stay in ingestion
evidence/provenance until reviewed. No multi-type schema or automatic merge is introduced.

Temporal nature is STATIC_GEOGRAPHIC, FIXED_STRUCTURE or TIME_VARYING_STRUCTURE, independently of type.
Status is present/removed/unknown, with optional observedAt and validFrom/validTo. No implicit clock,
freshness duration or current-position inference. A drillship uses OFFSHORE_STRUCTURE plus time-varying
nature; its vessel identity and timestamped position must not become a static fishing-ground identity.
An anchored FAD site, a buoy deployment, and a drifting buoy are distinct source concepts. Future
qualification must decide the intended entity before assigning authority identity; redeployment is not
automatically a coordinate correction. A fixed site can survive device replacement; a mobile position
requires an observation time and separate current-use policy. Unknown times cannot establish current use.

## Names, verification and eligibility

Exact name normalization is NFC, trim, whitespace collapse and lowercase. Punctuation, accents and
abbreviations remain meaningful; alternate spellings require explicitly reviewed aliases. No fuzzy matching.
Canonical name and aliases participate equally; multiple matching placeIds return ambiguous, never first-win.
Optional explicit region scope can disambiguate. Research resolution does NOT authorize display or assert
a Fishing Log association. Future UI discovery can use fuzzy suggestions only with explicit selection.
The API's `not-found` result means identity remains unresolved; `ambiguous` retains all matching
placeIds. Duplicate names/aliases within one place do not create additional identities.

VERIFIED records assert a documented assessment against authoritative/reconciled authoritative evidence;
CORROBORATED assert a documented multi-source assessment short of full authoritative verification;
UNVERIFIED are discovery leads. Source presence alone changes none of these. Non-unverified records
require an assessment reference, timestamp and resolvable source evidence references. The contract cannot
prove that the referenced assessment occurred or that two sources are independent.

Display, candidateContext and learningContext have separate not-assessed/permitted/withheld decisions.
There are no defaults granting permission. Recorded decisions require policy and decision references;
UNVERIFIED and untimed TIME_VARYING_STRUCTURE records cannot carry permitted use.
VERIFIED does not automatically get any permission. CORROBORATED
can record explicit approval, but future display must provide governed qualification and policy checks.
Actual corroborated-display wording, temporal expiration rules, candidate category budgets and learning
association policy remain future approval decisions. None is implemented here.

Shared records have no captain/user ID, catch counts, private notes/labels, species, confidence or scoring.
Unknown keys fail. Generic strings cannot detect secrets/private prose: trusted ingestion must reject them.
Source locator IDs must not contain credentials, tokens, signed URLs or private-service references.

## Authoritative source qualification (not ingestion approval)

| Source | Scope, geometry/identity and delivery | Qualification limits |
|---|---|---|
| [GEBCO/IHO/NCEI gazetteer](https://www.gebco.net/data-products/undersea-feature-names) | Global named undersea features, SCUFN naming authority; spreadsheet/shapefile, REST/WFS. Point/line/area representations | Record-specific geometry and stable feature identifier need adapter qualification. Update snapshot/version must be pinned; do not assume all names are precise points. Requested attribution must be retained |
| [NCEI legacy feature service](https://gis.ngdc.noaa.gov/arcgis/rest/services/IHO/undersea_features/MapServer) | Point/line/polygon layers, service EPSG:4326; Gulf falls within global coverage | Individual layer metadata fetch failed during this audit; exact ID mapping and current endpoint migration remain unresolved. No record coordinates imported |
| [BOEM/BSEE portal](https://www.data.boem.gov/Main/Platform.aspx) | Federal Gulf platform/location/master/removed-structure data; ASCII and GIS, complex/structure IDs | NAD27, approximate GIS, status reconciliation required; filters must be explicit. Federal public-use metadata includes non-navigation disclaimer; no fishing-ground inference |
| [FWC reef downloads](https://myfwc.com/fishing/saltwater/artificial-reefs/locate/) and [GIS schema](https://gis.myfwc.com/mapping/rest/services/Open_Data/Artificial_Reef_Locations_in_Florida/MapServer/layers) | Florida deployment points, DeployID/date/accuracy; XLS, GIS, KML. Service spatial reference 6439 | Deployment != unique place; historical positions can be inaccurate/moved/buried. Local XLSX DD CRS must be qualified independently of service CRS. Retain source use constraints; no update SLA assumed |
| [Okaloosa official program](https://www.destinfwb.com/blog/fish-aggregating-devices-fads-acoustic-tagging-camera-monitoring/) | Official county tourism/natural-resources program describes 16 FADs, including eight added in 2025 | Repository has eight. Public brochure/program descriptions are not current per-buoy coordinate/status verification; datum, deployment ID and update cadence unresolved |
| [Alabama MRD](https://www.outdooralabama.com/saltwater-fishing/artificial-reefs) | Public reef waypoints, annual GPX/KMZ/XLS releases, offshore reef zones | Reefs are not evidence of an official offshore buoy-FAD program; qualify datum, waypoint identity and reuse terms per release |
| [Mississippi DMR](https://dmr.ms.gov/recreational-fishing/) | Official reef discovery path | Offshore FAD coordinate/status feed not established here; detailed schema, CRS, cadence and license remain unqualified |
| [Texas TPWD](https://tpwd.texas.gov/landwater/water/habitats/artificial_reef/) | Official artificial-reef program | No authoritative offshore FAD coordinate dataset qualified here; private network reports are not coordinate authority. Reef dataset/CRS/reuse qualification still needed |
| Louisiana LDWF | Official agency is the appropriate program authority | Attempted official artificial-reef endpoint did not resolve; current FAD coordinates/status/IDs not qualified. Do not treat historical deployment plans as operational records |
| [NOAA Fisheries marine areas](https://www.fisheries.noaa.gov/resource/map/madison-swanson-sites-steamboat-lumps-edges-fishery-management-areas-map-gis-data) | Madison-Swanson/Steamboat Lumps/Edges GIS area boundaries | Management area is not a seamount. GIS is illustrative; regulatory identity/geometry need separate provenance. No fishing-access permission inferred |
| [NOAA chart disposal-site service](https://encdirect.noaa.gov/arcgis/rest/services/NavigationChartData/OceanDisposalSites/MapServer) | Charted disposal-site geometry, not colloquial fishing-ground identity | Dataset/version, datum and exact feature match must be checked; names are not sufficient |

No bulk download, provider acquisition or community/private-service contact occurred. Search results
from community sources were not treated as coordinate truth. Public accessibility is not blanket license
approval; each future adapter must retain applicable attribution, use constraints and snapshot metadata.

## Named grounds and regional coverage

DeSoto Canyon and Lloyd's Ridge require exact gazetteer name/feature reconciliation (including De Soto,
Lloyd Ridge variants); BOEM leasing areas do not prove the undersea geometry. The Steps, The Spur and
Dumping Grounds remain unresolved local-name leads until authoritative charts/surveys or independently
reconciled evidence establishes what feature is meant. No coordinates were manufactured.
The Elbow is ambiguous: [NOAA's Keys Elbow area](https://floridakeys.noaa.gov/zones/spas/elbow.html)
must not silently become a West Florida offshore fishing ground. Madison Swanson requires explicit
management-area versus colloquial-ground identity. Representative points are acceptable only when
labeled as such and backed by source/assessment; do not fabricate polygons from vague names.

Future coverage ledger rows: Texas, Louisiana, Mississippi, Alabama, Florida Panhandle, West Florida
shelf, West Florida slope, deep central Gulf, eastern Gulf, plus explicitly scoped other Gulf waters.
For each: source snapshots, categories, verified count, corroborated count, unresolved leads,
datum-unresolved count, status/time unresolved count, geometry kind/meaning, last review and gaps.
No vanity spot-count target. Same ledger/adapter model extends to Atlantic, Caribbean and other regions.
This task does not claim geographically complete verified coverage in any subregion.

## Existing consumers and future integration

LocationSearch filters merged name/shortName/type/region by substring, limits 25, selects a whole legacy
object; no governed alias resolution. FishingDayReportPanel Areas Fished uses that same collection,
limits 12 initially/20 searched, toggles by ID OR name, stores id/name/category/region/priority.
It is catalog selection, not free-text place creation. Future capture should preserve captain-visible
text plus optional placeId/revision/catalog version; old report text must not be retrospectively resolved.
Task 8E private labels remain captain source evidence, never public aliases.

MapLibreIntelligenceMap uses gulfLocations through buildMapGeoJson and marker/cluster hooks. Structures
and FADs have distinct source/symbol paths; selection still relies on legacy names in places.
buildMapGeoJson also carries legacy scoreEngine/species score properties. New Places must not inherit
these as verification or ranking facts. Legacy IntelligenceMap/MarlinMarker/SpeciesLayer references
are not new governed catalog consumers. No styling or marker behavior is changed.

Backend VERIFIED_STRUCTURES feeds nearest-structure context and the unified candidate source universe;
open-water environmental candidates exist independently. Expanding current imported arrays WOULD affect
the source universe. Future integration therefore needs a reviewed optional candidate-context adapter,
not a direct catalog replacement. Display permission must never be treated as candidate permission.
No inspected place path requires Fishing Log counts/popularity for identity. This task does not claim
to have re-proved all opportunity scoring: legacy static scoring fields exist and must not cross over.

Future safeguards/tests: display-only insertion leaves candidate and ranking results unchanged;
aliases cannot increase candidate count; duplicated authority records fail; dense structures cannot
consume open-water allocation; explicit category/spatial budgeting is reviewed separately; same
environmental evidence produces unchanged rankings regardless of catch/popularity metadata.
No budget, distance threshold or scoring correction is selected here.

Possible learning context is a separately permitted reference, not proof a report occurred there.
Coordinate proximity, alias resemblance and selected text may propose an assessment; Tasks 7B/7C/7D
and a future association assessor must establish applicability. No automatic association or learning
eligibility follows from resolvePlaceAliasV1 or candidateContext permission.

## Storage, ingestion and migration plan

Use a reviewed versioned static catalog first; it is easy to diff, reproduce and deploy without adding
database state. A later indexed database can serve the same immutable IDs/revisions when justified by
scale/update needs. Neither catalog storage nor ingestion is implemented here.

Pipeline: qualified source adapter -> retained source snapshot/record -> CRS/datum interpretation ->
explicit tested transformation if required -> proposed record -> verification assessment -> conflict
review -> separately approved consumer decisions -> versioned catalog publication. No automated source
presence bypasses review. Preserve source/adapter versions and historical catalog revisions.

Conflicts: same authority ID with changed geometry creates a proposed revision, not a new place;
same name with different identity remains ambiguous; different names require evidence before aliasing;
coordinate disagreement is quarantined; removed structures need status revision; moved/redeployed FADs
require site/device/deployment identity review. Newest record does not automatically win.

Current migration classifications (not mutually exclusive):

- SAFE TO PROPOSE: records with a traceable source may enter review, never direct publication.
- NEEDS DATUM/STATUS VERIFICATION: all 149 BOEM records; eight FADs require datum/status/source reconciliation;
  4,548 reef deployments need release/CRS/event-versus-place qualification.
- DUPLICATE/CONFLICT: four repeated curated entries, Thunder Horse overlap, PLEM/Production Mani collisions,
  seven unused platform identity conflicts; hold until resolved.
- LEGACY DISPLAY ONLY: curated intelligence zones/structures and nine mission ports pending provenance.
- REJECT/RESEARCH: untimed drillship positions as current places; private/static species attraction metadata
  as governance evidence; empty artifacts and schema templates provide no verified places.

No existing record is certified publication-ready by this audit. Next checkpoints should qualify
source adapters and identity units, resolve BOEM datum/status, review a small catalog, then separately
integrate display/search and candidate context. Broad Gulf ingestion follows the same reviewable path.

## Verification boundary

Pure tests cover identity/corrections, aliases/ambiguity, geometry and representative points, CRS,
provenance/transform lineage, verification, time, independent eligibility decisions, authority conflicts,
privacy/species-field rejection, strict numeric integrity, deterministic serialization and deep freezing.
Serialization is not hashing, ID generation or archive publication. Catalog checks accept one current
revision per place; revision-history storage is future work. Geometry topology and external decision
authenticity are explicitly not claimed. No runtime integration, database, migration, provider or device
tests are required to validate these pure primitives.

Final addendum: 26 focused tests passed with `node backend/tests/governedPlace.test.js`;
all 16 backend/tests/*.test.js scripts passed with PELORA_TEST_OCEAN_CONDITIONS=1 and a throwing
global fetch stub installed before each test import. Module/test syntax checks passed. The ordinary
`node --test` child-process runner was denied by the local sandbox (spawn EPERM); direct execution
ran all node:test cases successfully without escalation. New-file whitespace checks passed.
Final review strengthened five adversarial test groups covering canonical/alias collisions,
authority namespaces, representation revisions, independent permissions and malformed nested metadata.
No contract implementation or existing runtime/data file changed during final review.
The depth-neutral addendum adds a source-boundary assertion and validates shallow-relevant types
without inventing a depth field. The contract implementation remains unchanged.
