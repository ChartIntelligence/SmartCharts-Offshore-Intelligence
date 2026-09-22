// Rendering policy only. These points locate provider samples, never ocean features.
export const OBSERVATION_SOURCE = "pelora-environmental-observations";
export const OBSERVATION_LAYERS = ["pelora-sst-samples", "pelora-chlorophyll-direct", "pelora-chlorophyll-reconstructed", "pelora-current-observations"];
export const OBSERVATION_CONTROLS = [
  { key: "temperatureSamples", type: "sst", label: "Temperature Samples" },
  { key: "chlorophyll", type: "chlorophyll", label: "Chlorophyll Samples" },
  { key: "currents", type: "current", label: "Current Observations" }
];

// Existing adapters request UTC. Interpret offset-free provider valid times as UTC.
export function observationTime(value) {
  if (typeof value !== "string" || !value.trim()) return NaN;
  const utc = /^\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d(\.\d+)?)?$/.test(value) ? value + "Z" : value;
  return Date.parse(utc);
}

export function buildMapObservationDisplay(contract, now = Date.now()) {
  const excluded = [...(contract?.unavailableReasons ?? [])];
  const counts = { sst: 0, chlorophyll: 0, current: 0 };
  const candidates = [];
  const seen = new Set();
  for (const observation of contract?.observations ?? []) {
    const o = observation;
    let reason = null;
    const time = observationTime(o.observedAt);
    const age = (now - time) / 3600000;
    if (!Object.hasOwn(counts, o.type)) reason = "unsupported-observation";
    else if (!Number.isFinite(o.latitude) || Math.abs(o.latitude) > 90 ||
      !Number.isFinite(o.longitude) || Math.abs(o.longitude) > 180 ||
      o.provenance?.coordinateSource !== "provider-response") reason = "provider-position-unavailable";
    else if (!Number.isFinite(o.value)) reason = "value-unavailable";
    else if (typeof o.source?.provider !== "string" || !o.source.provider.trim()) reason = "provider-unavailable";
    else if (!Number.isFinite(time)) reason = "valid-time-unavailable";
    else if (["degraded", "unavailable"].includes(o.status)) reason = o.status;
    else if (o.type === "sst" && o.source.observationType !== "forecast-model") reason = "model-provenance-unavailable";
    else if (o.type === "chlorophyll" && !["direct-satellite", "gap-filled-reconstruction"].includes(o.source.observationType)) reason = "chlorophyll-provenance-unavailable";
    let status = o.status;
    if (o.type === "chlorophyll" && age > 72) status = "stale";
    if (o.type === "chlorophyll" && (age < 0 || !["current", "stale"].includes(status))) reason ??= "freshness-unavailable";
    if (o.type === "current") {
      const c = o.components;
      if (!Number.isFinite(c?.eastwardMetersPerSecond) || !Number.isFinite(c?.northwardMetersPerSecond) ||
        !Number.isFinite(c?.directionDegrees) || c.directionDegrees < 0 || c.directionDegrees >= 360 ||
        c.directionConvention !== "degrees-toward" || o.value <= 0 ||
        Math.hypot(c.eastwardMetersPerSecond, c.northwardMetersPerSecond) === 0) reason ??= "directional-vector-unavailable";
      if (!o.dataset) reason ??= "dataset-unavailable";
      if (status !== "current" || age < 0 || age > 96) reason ??= "current-observation-not-current";
    }
    if (reason) { excluded.push({ type: o.type, reasons: [reason] }); continue; }
    if (seen.has(o.id)) continue;
    seen.add(o.id);
    candidates.push({ ...o, status, time });
  }
  // One timestamp/provider/dataset cohort, selected deterministically from freshest data.
  const currentCandidates = candidates.filter(o => o.type === "current")
    .sort((a,b) => b.time - a.time || a.id.localeCompare(b.id));
  const currentGroup = currentCandidates[0];
  const features = [];
  for (const o of candidates) {
    if (o.type === "current" && (o.time !== currentGroup.time || o.dataset !== currentGroup.dataset || o.source.provider !== currentGroup.source.provider)) {
      excluded.push({ type: "current", reasons: ["different-provider-dataset-or-valid-time"] });
      continue;
    }
    counts[o.type]++;
    const statusLabel = o.type === "sst" ? (o.status === "stale" ? "Historical model sample" : "Model sample; freshness not classified")
      : o.status === "stale" ? "Historical / stale observation" : "Latest eligible observation";
    features.push({
      type: "Feature", id: o.id,
      geometry: { type: "Point", coordinates: [o.longitude, o.latitude] },
      properties: {
        observationId: o.id, type: o.type, dataset: o.dataset,
        value: o.value, units: o.units, observedAt: o.observedAt,
        provider: o.source.provider, observationType: o.source.observationType,
        status: o.status, statusLabel,
        timestampSource: o.provenance.timestampSource,
        qualitySummary: o.quality?.upstreamReason ?? "",
        algorithm: o.provenance.algorithm ?? "",
        experimental: o.provenance.experimental === true,
        directionDegrees: o.type === "current" ? o.components.directionDegrees : null,
        speedKnots: o.type === "current" ? o.value : null
      }
    });
  }
  return { ...contract, geoJson: { type: "FeatureCollection", features }, counts, excluded,
    currentObservedAt: currentGroup?.observedAt ?? null };
}

export function observationLayerDefinitions(layers) {
  const visibility = key => ({ visibility: layers[key] ? "visible" : "none" });
  const filter = type => ["==", ["get", "type"], type];
  return [
    { id: OBSERVATION_LAYERS[0], type: "circle", source: OBSERVATION_SOURCE, filter: filter("sst"),
      layout: visibility("temperatureSamples"), paint: {
        "circle-opacity": ["case", ["==", ["get", "status"], "unknown"], 0.5, 1],
        "circle-radius": 6, "circle-blur": 0, "circle-stroke-width": 2, "circle-stroke-color": "#fff",
        "circle-color": ["case", ["==", ["get", "status"], "stale"], "#94a3b8",
          ["step", ["get", "value"], "#729dcc", 70, "#77bcbc", 80, "#dfb774", 86, "#d88f76"]]
      } },
    { id: OBSERVATION_LAYERS[1], type: "circle", source: OBSERVATION_SOURCE,
      filter: ["all", filter("chlorophyll"), ["==", ["get", "observationType"], "direct-satellite"]],
      layout: visibility("chlorophyll"), paint: { "circle-radius": 11, "circle-opacity": 0,
        "circle-stroke-width": 3, "circle-stroke-color": ["case", ["==", ["get", "status"], "stale"], "#94a3b8", "#5dd7a0"] } },
    { id: OBSERVATION_LAYERS[2], type: "symbol", source: OBSERVATION_SOURCE,
      filter: ["all", filter("chlorophyll"), ["==", ["get", "observationType"], "gap-filled-reconstruction"]],
      layout: { ...visibility("chlorophyll"), "icon-image": ["case", ["==", ["get", "status"], "stale"], "pelora-chl-history", "pelora-chl-reconstructed"],
        "icon-allow-overlap": true, "icon-ignore-placement": true } },
    { id: OBSERVATION_LAYERS[3], type: "symbol", source: OBSERVATION_SOURCE, filter: filter("current"),
      layout: { ...visibility("currents"), "icon-image": "pelora-current-arrow", "icon-rotate": ["get", "directionDegrees"],
        "icon-rotation-alignment": "map", "icon-pitch-alignment": "map",
        "icon-size": ["step", ["get", "speedKnots"], 0.7, 1, 0.9, 2, 1.1],
        "icon-allow-overlap": true, "icon-ignore-placement": true } }
  ];
}

export function observationImages() {
  const image = (kind, color) => {
    const data = new Uint8Array(32 * 32 * 4);
    for (let y=0;y<32;y++) for (let x=0;x<32;x++) {
      const distance = Math.abs(x-16) + Math.abs(y-16);
      const inside = kind === "diamond" ? distance >= 12 && distance <= 15
        : (y >= 2 && y <= 14 && Math.abs(x-16) <= (y-2)*0.8) || (y >= 12 && y <= 29 && x >= 14 && x <= 18);
      if (inside) data.set([...color,255], (y*32+x)*4);
    }
    return { width:32, height:32, data };
  };
  return { "pelora-current-arrow": image("arrow", [90,201,238]),
    "pelora-chl-reconstructed": image("diamond", [93,215,160]),
    "pelora-chl-history": image("diamond", [148,163,184]) };
}

export function observationInspection(properties) {
  const p = properties;
  const title = p.type === "sst" ? "Temperature sample" : p.type === "current" ? "Current observation"
    : p.observationType === "gap-filled-reconstruction" ? "Reconstructed chlorophyll sample" : "Direct satellite chlorophyll sample";
  return [title, p.value + " " + p.units,
    p.type === "current" ? "Toward " + p.directionDegrees + "°; discrete sample" : "Discrete provider sample",
    p.provider, p.dataset ? "Dataset: " + p.dataset : null,
    "Valid / observation time: " + new Date(observationTime(p.observedAt)).toUTCString(),
    p.statusLabel, p.timestampSource === "marine-current-block-valid-time" ? "Shared marine model valid time" : null,
    p.algorithm ? "Reconstruction: " + p.algorithm : null,
    p.experimental ? "Experimental reconstruction" : null,
    p.qualitySummary || null].filter(Boolean);
}
