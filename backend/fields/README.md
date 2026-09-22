# Spatial field foundation

`GET /api/ocean/field?layer=bathymetry|currents&bbox=west,south,east,north&density=16&time=latest-available`

Optional `dataset` is a registry product ID (`etopo-2022-60s` or `noaa-geostrophic-daily`), not an upstream URL. Omitting it evaluates registered candidates independently. Selection is presentation-only: availability, freshness, valid-cell fraction, configured priority. No source averaging, fusion, Opportunity evaluation or persistence occurs. Candidate metadata and field identities remain separate; request a product explicitly to retrieve its payload.

- Coordinates: EPSG:4326, longitude [-180,180], latitude [-90,90], west < east and south < north. Cross-antimeridian viewports must be split by a future caller; this pass returns an explicit unsupported status. Provider 0–360 conversion and Greenwich splitting are handled by the ETOPO adapter.
- Density: integer target samples on the longest viewport axis; 4–48 bathymetry, 4–20 currents. Stride never increases native detail. Caps: 2,600 bathymetry cells, 500 vector cells, 2 MB upstream JSON, 500 KB field envelope, four in-flight acquisitions and 32 cached requests. Cache TTL five minutes; latest-time metadata TTL one minute.
- Currents: resolve provider time metadata, then request both components at that exact time. Reject mixed times, invalid positions and future valid times. Null pairs remain missing. Stale (>96h) latest-available fields may display with explicit status, independent of existing Opportunity evidence gates.
- Bathymetry: real ETOPO elevation grid, ascending coordinate axes and latitude-major values. Nulls never become zero. The browser makes a 512x512 georeferenced raster using decimated cells; land and missing values are transparent. Rendering represents delivered grid resolution, not native-detail reconstruction.
- Envelope: product/provider/version/type, processing level, native and delivered resolution, times, age/status, units/depth, coverage/no-data, quality flags/uncertainty (null when not supplied), provenance, candidate selection and dataset-specific payload. Provider-response coordinates are authoritative. Coverage fraction describes returned decimated cells, not all native pixels.
- Extension: add a registry product and adapter under its adapter key. Adapter output supplies independently acquired coordinate/value cells, valid time, retrieval time and stride. Additional datasets for these two field families do not require changing the route or viewport client. Other scientific payload families may add their own serializer/renderer rather than pretending to be u/v or elevations.

Frontend: 350ms move-end debounce; abort/invalidate on movement, toggles and unmount; refresh every five minutes. Sources survive viewport changes. No per-cell /api/ocean requests. `VITE_OCEAN_API_BASE` can point local verification at the local backend; default matches the existing ocean engine origin. No deployment changes are included.

Samples: normal captain mode suppresses v1.0A samples. Development builds only may enable them with `VITE_OCEAN_SAMPLE_QA=true`. Existing scientific provider metadata and sample tests are retained.

Verification: `node backend/tests/oceanFields.test.js`; `node frontend/src/utils/tests/oceanFields.test.js`; `node frontend/src/hooks/tests/useMapLibreOceanFields.test.js`. Existing backend and frontend regression suites also apply. Live provider availability is separate from parser/rendering test success.
