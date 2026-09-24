# Task 11D — NOAA Geo-Polar bounded Gulf SST evidence pilot

## Verdict and scope

**End-to-end retained-evidence pilot PASSED; founder visual review PASSED using
the Candidate C policy established in Task 11D.1.**
This is REAL NOAA SST ANALYSIS — PILOT EVIDENCE, not operational/beta SST.
The scientific chain works without changing any locked contract:

NOAA ERDDAP NetCDF subset → explicit pilot qualification → existing SST adapter
→ Ocean Product Frame → immutable local review archive → scalar delivery
→ checkpointed raster presentation policy → dedicated MapLibre review.

The provisional display ramp saturates at 303.15 K (86°F). Much of this warm
frame exceeds that endpoint. The screenshots therefore show relatively little
temperature contrast. They prove real-evidence rendering, **not adequate visual
discrimination of Gulf thermal structure**. No values, palette endpoints, masks,
coastline styling or scientific interpolation were changed to improve appearance.
These are the historical Task 11D control screenshots. Task 11D.1 subsequently
qualified and the founder approved the complete-frame outward-rounded zero-clipping
policy without changing palette hues or scientific evidence. See
[the locked display policy and Relative Thermal Context Rule](Real_SST_Visual_Scale_Qualification_v1.md).
82–89°F is its output for this frame, not a permanent SST threshold. The rectangular
acquisition edge is a coverage boundary, never an environmental transition or Signal.

Preflight: repository e89f, branch `codex/pelora-remote-setup`, HEAD
`0526ddfb7d6e92749fee75579a336d4dc419bacf`, tag
`checkpoint-scalar-map-renderer-foundation-v1`; tracked checkout clean.
Only existing `supabase/.gitignore` and `supabase/config.toml` were untracked.
Prior NOAA metadata hashes were checked. Quarantine remains ignored.

## Authoritative evidence consulted, 2026-09-24

| Category | First-party source | Observed version / meaning |
|---|---|---|
| Product catalog | https://podaac.jpl.nasa.gov/dataset/Geo_Polar_Blended_Night-OSPO-L4-GLOB-v1.0 | Product 1.0, GDS 2, L4; ACTIVE; release 2015-03-11; rolling catalog |
| Machine-readable collection | https://cmr.earthdata.nasa.gov/search/concepts/C2036877745-POCLOUD.umm_json | Product 1.0; explicit WGS84 datum and ellipsoid; retained exact response and SHA-256 |
| Current distribution metadata | https://oceanwatch.pifsc.noaa.gov/erddap/griddap/noaacwBLENDEDsstDaily.das | ERDDAP 2.22; 2026-09-24 capture; product 1.0 / GDS 2.0 / L4 |
| Distribution structure | https://oceanwatch.pifsc.noaa.gov/erddap/griddap/noaacwBLENDEDsstDaily.dds | 8731 time coordinates; 3600 latitude / 7200 longitude |
| Returned latest coordinate | https://oceanwatch.pifsc.noaa.gov/erddap/griddap/noaacwBLENDEDsstDaily.json?time%5Blast%5D | Actual returned coordinate, not date arithmetic |
| Pinned coordinate | https://oceanwatch.pifsc.noaa.gov/erddap/griddap/noaacwBLENDEDsstDaily.json?time%5B8730%5D | Same actual coordinate at selected index |
| Latitude subset | https://oceanwatch.pifsc.noaa.gov/erddap/griddap/noaacwBLENDEDsstDaily.json?latitude%5B2160%3A1%3A2419%5D | 260 coordinates |
| Longitude subset | https://oceanwatch.pifsc.noaa.gov/erddap/griddap/noaacwBLENDEDsstDaily.json?longitude%5B5240%3A1%3A5599%5D | 360 coordinates |
| Use/citation | https://podaac.jpl.nasa.gov/CitingPODAAC | Rolling guidance: unrestricted open sharing; acknowledge creators using product citation |
| Scientific format | https://www.ncei.noaa.gov/erddap/griddap/documentation.html | Rolling documentation: `.nc` is NetCDF-3 with scientific metadata; index projection constraints |
| GDS background | https://ghrsst.org/resources/ghrsst-project-documents/ | Current document index; newer GDS versions are not applied retroactively |
| Applicable historical specification | https://ecsinfo.gsfc.nasa.gov/projects/ECS/repos/uvg/raw/input/GDS20r5.pdf?at=366e40b2ecafe8df2fbd31182fa7039f9e90ab23 | GDS 2.0 revision 5, 2012-10-09; example metadata is not independent product-specific proof |

The PO.DAAC legacy ISO endpoint and archive-hosted GDS PDF were unavailable to
the research tool. The exact subset `.ncHeader` request timed out without an
environmental payload. A separate HEAD request succeeded. No authentication,
credential request, provider contact message or alternate product was used.

FACT: NOAA/NESDIS/OSPO produces the product. CoastWatch ERDDAP is the distribution.
PO.DAAC identifies DOI **10.5067/GHGPN-4FO02**. Citation: Office of Satellite
Products and Operations (2015), GHRSST Level 4 NOAA/OSPO Global Nighttime Sea
Surface Foundation Temperature, version 1.0, PO.DAAC, accessed 2026-09-24.
Retained NOAA metadata says use is free and open and acknowledges NOAA/NESDIS.
This supports this retained-evidence evaluation; it is not a production legal review.

### Reconciliation, not silent metadata merging

- PO.DAAC prose says 0.054° while its spatial table, CMR and ERDDAP say 0.05°.
  Actual returned axes confirm approximately 0.05° spacing, with Float32 rounding.
  The pilot uses 0.05° nominal native resolution and preserves the exact axes.
- PO.DAAC catalog begins in 2014; NOAA distribution includes 2002 onward.
  NOAA explicitly distinguishes 2002–2016 reanalysis from 2017 onward NRT.
  This selected 2026 coordinate is in the latter portion; no historical identity
  equivalence is inferred for the entire collection.
- Native/catalog time units use the 1981 epoch; this ERDDAP representation uses
  Unix seconds, Gregorian. The actual acquired coordinate is decoded using its
  own declared epoch. Neither an observation timestamp nor a support interval is
  invented from the nominal L4 reference time.
- Native/catalog uncertainty uses Kelvin; ERDDAP uses degree_C. These are
  temperature **differences**, so the adapter preserves the magnitude in K with
  no absolute-temperature offset. This is provider standard-deviation evidence,
  never Pelora confidence.
- Served Float32 SST/error values are physical, with no scale/add-offset fields.
  The exact Float32 fill encodings are tested before numeric normalization.

## Spatial and temporal qualification

FACT: CMR `ResolutionAndCoordinateSystem.GeodeticModel.HorizontalDatumName` is
`World Geodetic System 1984`; `EllipsoidName` is `WGS 84`; semimajor axis is
6378137 m. CMR describes a regular cylindrical latitude/longitude 0.05° grid.
This is stronger than the landing page's ellipsoid statement alone.

QUALIFICATION MAPPING: geographic WGS84 coordinates map to the existing
`EPSG:4326` / `WGS84` contract pair; Pelora's explicit `coordinateOrder: x,y`
means longitude then latitude. This is not a projection transformation and is
not an assertion of navigation-grade precision or a particular WGS84 realization.

Requested Gulf bounds: west −98, east −80, south 18, north 31 degrees.
Source convention maps these to 262–280°E. Selected centers are approximately
262.025–279.975°E and 18.025–30.975°N. The normalized pilot representation explicitly
subtracts 360 from each source longitude, preserving order and all array indices.
The original coordinates remain in immutable source bytes. No silent wrapping or
regridding occurs. Nominal native/delivered resolution is 0.05°; exact scalar
spacing is null when Float32 axis differences are nonuniform, as required by 10F-E.

Nominal analysis: **2026-09-22T12:00:00Z**, index **8730**, independently returned
by both `last` and the index query. Support window: **unknown**, not fabricated
as a 24-hour interval. `observationTime`, `providerPublishedAt`, source revision
and validator are null. Aggregate `date_created` and generated HTTP Last-Modified
are not promoted to a selected-frame publication/revision timestamp.

Acquisition completed **2026-09-24T16:00:17.581975Z**; age then **52.00488361 hours**.
Operational freshness is **UNASSESSED**. This timestamp is not called current/live.

## Bounded acquisition and receipts

One GET, no retries, no redirects, no authentication. Request:

```text
https://oceanwatch.pifsc.noaa.gov/erddap/griddap/noaacwBLENDEDsstDaily.nc?analysed_sst[8730][2160:1:2419][5240:1:5599],analysis_error[8730][2160:1:2419][5240:1:5599],mask[8730][2160:1:2419][5240:1:5599]
```

The receipt retains the exact percent-encoded URL, final URL, status, headers and
timestamps. Variables: analysed_sst, analysis_error, mask, required time/axes.
No sea_ice_fraction. NetCDF-3, HTTP 200, identity content encoding, chunked body;
Content-Length and ETag absent. Expected arrays: 93600 × (4 + 4 + 1) = 842400 bytes;
coordinate arrays add 2488 bytes before metadata and alignment.

Exact body: **853144 bytes**. Received TLS socket bytes, including TLS/HTTP
overhead: **871583**. Both are below **4194304 bytes**. The acquisition uses
bounded socket receives beneath TLS MemoryBIO decoding; no unconstrained HTTP
body buffer or automatic download/truncation. The socket counter does not claim
to measure Ethernet/TCP packet overhead. Cap/failure leaves unusable diagnostic
bytes and a failed receipt, never a silently accepted scientific object.

Raw SHA-256:
`26fe69f0e376322fd2e81ecb9375e5737ede4134cbd9711608ee9c2e2253a843`

Ignored quarantine:
`.local/ocean-quarantine/sst/noaa-geo-polar/task11d-20260922T120000Z-gulf/`.
Metadata and receipts are in sibling `task11d-metadata/`. No source bytes or
environmental arrays enter Git. Acquisition code refuses an existing destination;
running tests, the harness or build never repeats provider acquisition.

## Scientific sanity and governance

360 longitude columns × 260 latitude rows, both ascending; offset `j * 360 + i`.
93600 cells: 71896 water and 21704 land; no ice/combined mask codes observed.
All 21704 SST missing cells are land; no additional missing water cells occurred.
All land SST/error values match declared fills. All finite values fit provider ranges.

| Retained field | Minimum | Median | Maximum | Missing |
|---|---:|---:|---:|---:|
| SST, K | 301.1400146484375 | 303.6199951171875 | 304.5199890136719 | 21704 |
| Analysis error, K difference | 0.03999999910593033 | 0.05999999865889549 | 0.44999998807907104 | 21704 |

Mask semantics retain provider values 1 water / 2 land / 4 ice. This selected
pilot accepts only the observed unambiguous 1/2 codes; a new combination or ice
occurrence stops for review rather than inventing combined-bit behavior.
Fill SST becomes explicit land or provider-no-data, never zero. The aligned mask
and error remain components of the same frame, linked by the scalar companion
references. Shared ancestry does not become independent corroboration.

Registry: `task11d-pilot-only`, version 1; qualification
`noaa-geo-polar-task11d-pilot`, version 1. The wrapper pins the exact source checksum,
time, dimensions, product and served encoding. It grants no approval to other NOAA
products, dates or distributions. Family SST; evidence ANALYSIS; processing L4.

## Immutable identity and storage

Frame ID:
`noaa-geo-polar-20260922-gulf-26fe69f0e376322fd2e81ecb9375e5737ede4134cbd9711608ee9c2e2253a843`

Archive ID:
`opf-b01cd11c68de5bab89d2ac29d44ea04302f59ff57b417bf39f8f9c65aad08286`

Scientific-content digest:
`c59c222c11fb85afe32d046c3c75e81fdcaaa330ac790917d1ec77cd123c8fbf`

Full-frame digest:
`544ef9db863f21b1286807680967c4782a0643cad8444222763728c3a68d4790`

Receipt digest:
`08a6a4286c5e43b04f601ddf2370e5054bf35a7ccf0276ccbc1ae25d5d936bb7`

Scalar derivative:
`osfd-7d3e484c466a91558b51ee1940e599003ae9136febb663ad010a8aab12c81820`

Archive status ARCHIVED means this local review port completed exclusive create,
file fsync and exact readback verified by the existing archive contract. Storage
is **PILOT / NON-PRODUCTION STORAGE**: no production resilience, directory crash
durability, replication, retention or backup guarantee. Existing objects are never
overwritten. Partial writes fail integrity; they are not repaired silently.

Scalar delivery retains all source samples (stride 1). Its 8 MiB local JSON guard
is not the acquisition ceiling or a production/mobile budget. Numeric inspection
and all future intelligence must use this numeric field/mask, never raster pixels.

## Presentation and review isolation

`node review/noaa-sst-pilot/serve.mjs` is an explicit loopback-only review launcher,
not an ordinary Pelora startup route. It validates the retained evidence chain
before serving a single registered derivative. Clients cannot select an archive,
filesystem path, provider URL or arbitrary source values. The small tile cache is
presentation-only and bounded to 128 entries. No Task 11B enablement change.

Raster policy reuses checkpointed pixel-center cell selection and provisional
color mapping. Namespace includes scalar derivative, renderer, ramp, missing-alpha
policy, resampling/projection, tile size and z/x/y. No timestamps/latest strings.
Tiles have alpha zero for source missing/land/outside coverage, no mask guard and
no scientific averaging. Nearest magnification is requested through public APIs;
fractional/minified display filtering remains non-authoritative. Pixels never feed
inspection, fronts, Signals, Opportunities, scoring, learning or historical evidence.

Actual Task 11A style/geometry is reused without modification. Land/coastline sit
above the scalar field. Basemap remains TEMPORARY_DEVELOPMENT_DEPENDENCY, generalized
Natural Earth-derived geometry, not navigation-grade or beta-qualified.

Six PNGs plus a geographic-host receipt are retained under `screenshots/`:
`full-gulf`, `northern-gulf`, `eastern-gulf-desoto`, `central-western-gulf`,
`mobile-width-gulf`, `sst-off`. External geography host: **demotiles.maplibre.org**
only. No environmental HTTP calls occur during rendering. Mobile-width desktop
engine proof is not physical iPhone acceptance; Safari/device testing remains required.

## Verification and boundaries

Offline retained-pilot tests cover byte identity/cap, source qualification, explicit
datum, actual coordinate, dimensions, packing/fill/type rejection, masks, adapter,
archive/scalar binding, uncertainty differences, axis mapping, immutability,
presentation identity/transparency and review isolation. Absent local evidence
fails clearly; tests never auto-download or substitute synthetic NOAA evidence.

All pre-existing scientific contracts, Task 11A/11B/11C tracked source, dependencies,
runtime routes and application controls remain unchanged. No fronts or Opportunities
were derived. One acquisition establishes no production availability/resilience.
OSTIA remains a future resilience candidate. Task 9E-D stays paused. No database,
Auth, Supabase, credentials, commit, tag, push or deployment.

Final verification: pilot 27; SST adapter 19; frame 17; archive 36; scalar delivery
44; runtime 11B 22; numeric integrity 19; map 11A 12; renderer 11C 12; raster
qualification 8; historical guard algorithms 10; presentation boundary 6, all pass.
Complete backend/shared: 24 scripts including this pilot; frontend: 21 scripts,
all pass with network APIs blocked. Production build passes with the existing
large-chunk warning. JavaScript/Python syntax, new-file whitespace and Git diff
checks pass. Four scientific contracts and five Task 11B files are raw-byte
identical to HEAD. All other existing tracked files have a clean Git diff; no
tracked file was edited in this task. Acquisition and screenshot receipts remain
separate from the offline regression logs.
