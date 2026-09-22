// A variable maps to products, never to a permanent provider. Adapters return
// independent fields; selecting a field is not scientific fusion.
export const FIELD_PRODUCTS = Object.freeze([
  { id: "etopo-2022-60s", layer: "bathymetry", displayName: "Bathymetry", adapter: "erddap-grid",
    provider: "NOAA/NCEI", dataset: "ETOPO_2022_v1_60s", version: "2022-v1-60s",
    productType: "static-elevation-model", processingLevel: "compiled-global-relief",
    baseUrl: "https://oceanwatch.pifsc.noaa.gov/erddap", variables: ["z"],
    nativeBounds: [1/120, -90+1/120, 360-1/120, 90-1/120],
    nativeResolutionDegrees: 1/60, longitudeConvention: "0-360", units: "m",
    depth: null, uncertainty: null, priority: 0, maxCells: 2600, maxDensity: 48,
    attribution: "NOAA National Centers for Environmental Information, ETOPO 2022" },
  { id: "noaa-geostrophic-daily", layer: "currents", displayName: "Geostrophic Surface Currents", adapter: "erddap-grid",
    provider: "NOAA NESDIS CoastWatch", dataset: "noaacwBLENDEDNRTcurrentsDaily",
    version: "provider-version-not-specified", productType: "altimetry-derived-geostrophic-current",
    processingLevel: "gridded-derived-analysis", baseUrl: "https://coastwatch.noaa.gov/erddap",
    variables: ["u_current", "v_current"], nativeBounds: [-179.875,-89.875,179.875,89.875],
    nativeResolutionDegrees: 0.25,
    longitudeConvention: "-180-180", units: "m/s", depth: { reference: "surface", meters: null },
    uncertainty: null, priority: 0, maxCells: 500, maxDensity: 20, maxFreshAgeHours: 96,
    attribution: "NOAA NESDIS CoastWatch; altimetry-derived geostrophic surface currents" }
]);

export function validateFieldRequest(params, products = FIELD_PRODUCTS) {
  const fail = message => { const error = new Error(message); error.statusCode = 400; throw error; };
  const layer = params.get("layer");
  const candidates = products.filter(p => p.layer === layer && (!params.get("dataset") || p.id === params.get("dataset")));
  if (!candidates.length) fail("Unsupported layer or dataset product ID");
  const parts = (params.get("bbox") ?? "").split(",");
  if (parts.length !== 4 || parts.some(p => !p.trim())) fail("bbox requires west,south,east,north");
  const bounds = parts.map(Number);
  const [w,s,e,n] = bounds;
  if (!bounds.every(Number.isFinite) || w < -180 || e > 180 || w > 180 || e < -180 || s < -90 || n > 90 || s >= n)
    fail("Use global WGS84 longitude [-180,180], latitude [-90,90] bounds");
  if (w >= e) fail("Cross-antimeridian bounds must be split into separate requests; west must be less than east");
  const density = Number(params.get("density") ?? 16);
  if (!Number.isInteger(density) || density < 4 || density > Math.min(...candidates.map(p => p.maxDensity))) {
    fail("density exceeds this layer's bounded grid limit");
  }
  if ((params.get("time") ?? "latest-available") !== "latest-available") {
    fail("Only latest-available is supported");
  }
  if (params.toString().length > 1024) fail("Field request too large");
  return {layer, bounds, density, candidates, selection: params.has("dataset") ? "explicit-product" : "best-available"};
}
