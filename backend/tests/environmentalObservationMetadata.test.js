import assert from "node:assert/strict";
import {
  getCurrentConditionsPoint, getCurrentSpatialStructure,
  getChlorophyllConditions, getGapFilledChlorophyllConditions,
  getMarineConditions, getSeaSurfaceTemperaturePoint,
  buildCurrentVectorProjectionAnalysis, buildCurrentGradientAnalysis,
  buildCurrentShearAnalysis, buildCurrentConvergenceAnalysis, buildCurrentEdgeAnalysis,
  resolveChlorophyllObservation
} from "../server.js";

const time = new Date().toISOString();
const originalFetch = globalThis.fetch;
function payload(columns, row) { return { table: { columnNames: columns, rows: [row] } }; }
function mock(data) { globalThis.fetch = async () => ({ ok: true, json: async () => data }); }
function scientificCurrent(value) {
  return {
    speed: value.speedKnots, direction: value.directionDegrees,
    u: value.eastwardMetersPerSecond, v: value.northwardMetersPerSecond,
    observedAt: value.observedAt, source: value.source, derived: value.derived
  };
}
try {
  mock(payload(["time", "latitude", "longitude", "u_current", "v_current"], [time, 27.9, 271.8, 0.3, 0.4]));
  const current = await getCurrentConditionsPoint(28, -88);
  assert.equal(current.requestedLatitude, 28);
  assert.equal(current.requestedLongitude, -88);
  assert.equal(current.resolvedLatitude, 27.9);
  assert.ok(Math.abs(current.resolvedLongitude - (-88.2)) < 1e-10);
  assert.equal(current.eastwardMetersPerSecond, 0.3);
  assert.equal(current.northwardMetersPerSecond, 0.4);
  assert.equal(current.source.directionConvention, "degrees-toward");
  mock(payload(["time", "u_current", "v_current"], [time, 0.3, 0.4]));
  const unresolved = await getCurrentConditionsPoint(28, -88);
  assert.equal(unresolved.resolvedLatitude, null);
  assert.equal(unresolved.resolvedLongitude, null);
  assert.deepEqual(scientificCurrent(unresolved), scientificCurrent(current));
  for (const [lat, lon] of [[null, null], ["", ""], [91, 361], [-91, -181]]) {
    mock(payload(["time", "latitude", "longitude", "u_current", "v_current"], [time, lat, lon, 0.3, 0.4]));
    const result = await getCurrentConditionsPoint(28, -88);
    assert.equal(result.resolvedLatitude, null);
    assert.equal(result.resolvedLongitude, null);
  }
  for (const [lon, expected] of [[-180,-180],[180,180],[360,0],[0,0]]) {
    mock(payload(["time", "latitude", "longitude", "u_current", "v_current"], [time, 0, lon, 0, 0]));
    const result = await getCurrentConditionsPoint(28, -88);
    assert.equal(result.resolvedLatitude, 0);
    assert.equal(result.resolvedLongitude, expected);
  }
  mock({ table: { columnNames: [], rows: [] } });
  const emptyCurrent = await getCurrentConditionsPoint(28, -88);
  assert.equal(emptyCurrent.resolvedLatitude, null);
  assert.equal(emptyCurrent.resolvedLongitude, null);

  mock(payload(["time", "u_current", "v_current"], [time, 0.3, 0.4]));
  const spatial = await getCurrentSpatialStructure(27.1234, -87.6543);
  assert.equal(spatial.validSampleCount, 4, "scientific numeric coverage remains unchanged");
  assert.ok(spatial.vectors.every(v => v.resolvedLatitude === null && v.resolvedLongitude === null));
  assert.ok(spatial.vectors.every(v => v.source.dataset === current.source.dataset));
  // Vary vectors to exercise real gradients; change ONLY resolved-coordinate metadata.
  const field = { ...spatial, vectors: spatial.vectors.map((v,i) => ({
    ...v, eastwardMetersPerSecond: [0.6,-0.5,-0.3,0.4][i],
    northwardMetersPerSecond: [-0.5,0.4,0.7,-0.2][i]
  })) };
  const substituted = { ...field, vectors: field.vectors.map(v => ({
    ...v, resolvedLatitude: v.requestedLatitude, resolvedLongitude: v.requestedLongitude
  })) };
  const actualProvider = { ...field, vectors: field.vectors.map(v => ({
    ...v, resolvedLatitude: v.requestedLatitude + 0.1, resolvedLongitude: v.requestedLongitude - 0.1
  })) };
  function analyses(input) {
    const projection = buildCurrentVectorProjectionAnalysis(input);
    const gradient = buildCurrentGradientAnalysis(projection);
    const shear = buildCurrentShearAnalysis(gradient);
    const convergence = buildCurrentConvergenceAnalysis(projection);
    const edge = buildCurrentEdgeAnalysis(gradient, shear, null, convergence);
    return { gradient, shear, convergence, edge };
  }
  assert.deepEqual(analyses(field), analyses(substituted));
  assert.deepEqual(analyses(field), analyses(actualProvider));

  const chlorophyll = [];
  for (const adapter of [getChlorophyllConditions, getGapFilledChlorophyllConditions]) {
    mock(payload(["chlor_a", "longitude", "time", "latitude"], [0.12345, 272.2, time, 27.8]));
    const result = await adapter(28, -88);
    chlorophyll.push(result);
    assert.equal(result.requestedLatitude, 28);
    assert.equal(result.resolvedLatitude, 27.8);
    assert.ok(Math.abs(result.resolvedLongitude + 87.8) < 1e-10);
    assert.equal(result.concentrationMgM3, 0.1235);
    assert.equal(result.observedAt, time);
    mock(payload(["chlor_a", "time"], [0.12345, time]));
    const nonSpatial = await adapter(28, -88);
    assert.equal(nonSpatial.resolvedLatitude, null);
    assert.equal(nonSpatial.resolvedLongitude, null);
    assert.equal(nonSpatial.concentrationMgM3, result.concentrationMgM3);
    assert.equal(nonSpatial.waterClassification, result.waterClassification);
    assert.deepEqual(nonSpatial.source, result.source);
    mock(payload(["chlor_a", "time", "latitude", "longitude"], [0.12345, time, 91, 361]));
    const invalid = await adapter(28, -88);
    assert.equal(invalid.resolvedLatitude, null);
    assert.equal(invalid.resolvedLongitude, null);
    assert.equal(invalid.concentrationMgM3, result.concentrationMgM3);
    mock({ table: { columnNames: [], rows: [] } });
    const empty = await adapter(28,-88);
    assert.equal(empty.resolvedLatitude,null);
    assert.equal(empty.resolvedLongitude,null);
  }
  assert.equal(chlorophyll[0].source.classification,"satellite-observation");
  assert.equal(chlorophyll[1].source.observationType,"gap-filled-reconstruction");
  assert.equal(chlorophyll[1].source.algorithm,"DINEOF");
  assert.equal(chlorophyll[1].source.experimental,true);
  assert.equal(resolveChlorophyllObservation({observations:chlorophyll}).selectedObservation.source.dataset,chlorophyll[0].source.dataset);

  const weatherTime = "2026-09-21T11:00";
  const marineTime = "2026-09-21T10:00";
  globalThis.fetch = async url => ({ok:true,json:async()=>String(url).includes("marine-api")
    ? {latitude:27.8,longitude:272.1,current:{time:marineTime,sea_surface_temperature:25,wave_height:1}}
    : {current:{time:weatherTime,wind_speed_10m:3}}});
  const marine = await getMarineConditions(28,-88);
  assert.equal(marine.observedAt,weatherTime,"legacy overall timestamp unchanged");
  assert.equal(marine.sst.observedAt,marineTime);
  assert.equal(marine.sst.timestampProvenance,"marine-current-block-valid-time");
  assert.equal(marine.sst.temperatureCelsius,25);
  assert.equal(marine.sst.temperatureFahrenheit,77);
  assert.equal(marine.sst.resolvedLatitude,27.8);
  mock({current:{sea_surface_temperature:25}});
  const noTime = await getMarineConditions(28,-88);
  assert.equal(noTime.sst.observedAt,null);
  assert.equal(noTime.sst.resolvedLatitude,null);
  const neighbor = await getSeaSurfaceTemperaturePoint(28,-88);
  assert.equal(neighbor.resolvedLatitude,28,"legacy scientific neighbor metadata unchanged");
  assert.equal(neighbor.providerCoordinates.resolvedLatitude,null,"no fallback map position");
  mock({latitude:27.8,longitude:272.1,current:{time:marineTime,sea_surface_temperature:25}});
  const validNeighbor = await getSeaSurfaceTemperaturePoint(28,-88);
  assert.equal(validNeighbor.providerCoordinates.resolvedLatitude,27.8);
  assert.equal(validNeighbor.observedAt,marineTime);
  console.log("PASS environmental provider metadata, timestamps, provenance, and unchanged current scientific analyses");
} finally {
  globalThis.fetch = originalFetch;
}
