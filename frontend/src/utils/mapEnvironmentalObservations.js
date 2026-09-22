// Presentation only: samples are not localized physical ocean features.
const validCoordinates = (latitude, longitude) =>
  Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
  Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;

const timestamp = value => typeof value === "string" &&
  Number.isFinite(Date.parse(value)) ? value : null;

function observationStatus(type, sample, layer, observedAt) {
  const upstream = layer?.state;
  const availability = sample.source?.availability;
  if (["unavailable", "degraded"].includes(upstream)) return upstream;
  if (["request-failed", "provider-unavailable", "provider-request-failed"].includes(availability)) return "degraded";
  if (["unavailable", "no-valid-pixel"].includes(availability)) return "unavailable";
  if (upstream === "stale") return "stale";
  // No governed SST age limit exists here. A finite model value is not "live".
  if (type === "sst" || !observedAt) return "unknown";
  const ageHours = sample.ageHours;
  if (!Number.isFinite(ageHours) || ageHours < 0) return "unknown";
  const maxAgeHours = type === "chlorophyll" ? 72 : 96;
  if (ageHours > maxAgeHours) return "stale";
  return upstream === "live" ? "current" : "unknown";
}

export function buildMapEnvironmentalObservations({
  oceanData = null,
  contextKey = null,
  requestStatus = "unavailable"
} = {}) {
  const observations = [];
  const unavailableReasons = [];
  const qualityLayers = oceanData?.dataQuality?.layers ?? {};

  function add(type, sample, { neighbor = false } = {}) {
    if (!sample) return;
    // Neighbor SST has legacy resolved-coordinate fallbacks used by science.
    // Only its separate provider-only metadata can authorize a map sample.
    const position = type === "sst" && neighbor ? sample.providerCoordinates : sample;
    const latitude = position?.resolvedLatitude;
    const longitude = position?.resolvedLongitude;
    const value = type === "sst" ? sample.temperatureFahrenheit
      : type === "chlorophyll" ? sample.concentrationMgM3 : sample.speedKnots;
    const source = sample.source;
    const components = type === "current" ? {
      eastwardMetersPerSecond: sample.eastwardMetersPerSecond,
      northwardMetersPerSecond: sample.northwardMetersPerSecond,
      directionDegrees: sample.directionDegrees,
      directionConvention: source?.directionConvention ?? null
    } : null;
    const reasons = [];
    if (!validCoordinates(latitude, longitude)) reasons.push("provider-coordinates-unavailable");
    if (!Number.isFinite(value)) reasons.push("value-unavailable");
    if (!source?.provider) reasons.push("provider-provenance-unavailable");
    if (type === "current" && (
      !Number.isFinite(components.eastwardMetersPerSecond) ||
      !Number.isFinite(components.northwardMetersPerSecond) ||
      !Number.isFinite(components.directionDegrees) ||
      components.directionConvention !== "degrees-toward"
    )) reasons.push("current-components-or-convention-unavailable");
    if (reasons.length) {
      unavailableReasons.push({ type, reasons });
      return;
    }
    const observedAt = timestamp(sample.observedAt);
    const layer = qualityLayers[type === "current" ? "currents" : type];
    const observationType = source.observationType ??
      (type === "chlorophyll" && source.classification === "satellite-observation"
        ? "direct-satellite" : source.classification ?? null);
    const dataset = source.dataset ?? null;
    const id = JSON.stringify([type, source.provider, dataset, observationType, latitude, longitude, observedAt]);
    if (observations.some(observation => observation.id === id)) return;
    observations.push({
      id, dataset, type, latitude, longitude, value,
      units: type === "sst" ? "degF" : type === "chlorophyll" ? "mg m^-3" : "knots",
      components, observedAt,
      source: { provider: source.provider, dataset, observationType },
      status: observationStatus(type, sample, layer, observedAt),
      quality: {
        upstreamState: layer?.state ?? null,
        upstreamReason: layer?.reason ?? null,
        ageHours: Number.isFinite(sample.ageHours) ? sample.ageHours : null,
        availability: source.availability ?? null
      },
      provenance: {
        coordinateSource: "provider-response",
        timestampSource: observedAt ? sample.timestampProvenance ?? "provider-observation-time" : null,
        classification: source.classification ?? null,
        platform: source.platform ?? null,
        algorithm: source.algorithm ?? null,
        experimental: source.experimental ?? null,
        resolutionKilometers: source.resolutionKilometers ?? null,
        sourceUnits: source.units ?? null
      }
    });
  }

  add("sst", oceanData?.sst);
  for (const sample of oceanData?.sst?.derived?.spatialStructure?.samples ?? []) {
    add("sst", sample, { neighbor: true });
  }
  add("chlorophyll", oceanData?.chlorophyll);
  add("current", oceanData?.currents);
  for (const sample of oceanData?.currents?.derived?.spatialAnalysis?.spatialStructure?.vectors ?? []) {
    add("current", sample);
  }
  if (!oceanData) unavailableReasons.push({ type: null, reasons: ["ocean-data-unavailable"] });
  return { contextKey, requestStatus, observations, unavailableReasons };
}
