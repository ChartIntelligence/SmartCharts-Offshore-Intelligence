import assert from "node:assert/strict";
import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec";
import { buildMapEnvironmentalObservations } from "../mapEnvironmentalObservations.js";
import { buildMapObservationDisplay, observationLayerDefinitions, observationImages,
  observationInspection, observationTime, OBSERVATION_SOURCE } from "../mapObservationDisplay.js";

const time = "2026-09-21T10:00:00Z";
const now = Date.parse("2026-09-21T11:00:00Z");
const position = { resolvedLatitude: 45, resolvedLongitude: 140, observedAt: time, ageHours: 1 };
const current = { ...position, speedKnots: 1, eastwardMetersPerSecond: 0.3,
  northwardMetersPerSecond: 0.4, directionDegrees: 37,
  source: { provider: "NOAA CoastWatch", dataset: "currents", directionConvention: "degrees-toward",
    classification: "altimetry-derived-geostrophic-current", availability: "available" } };
const chlorophyll = { ...position, concentrationMgM3: 0.2, source: { provider: "NOAA CoastWatch",
  dataset: "direct", classification: "satellite-observation", availability: "available" } };
const sst = { ...position, temperatureFahrenheit: 77, timestampProvenance: "marine-current-block-valid-time",
  source: { provider: "Open-Meteo", classification: "forecast-model" } };
const data = { sst, chlorophyll, currents: current, dataQuality: { layers: {
  sst: { state: "live" }, chlorophyll: { state: "live" }, currents: { state: "live" }
} } };
const contract = buildMapEnvironmentalObservations({ oceanData: data, requestStatus: "ready" });
const normalizedSst = contract.observations.find(o => o.type === "sst");
assert.equal(normalizedSst.source.provider, "Open-Meteo");
assert.equal(normalizedSst.source.observationType, "forecast-model");
assert.equal(normalizedSst.provenance.classification, "forecast-model");
assert.equal(normalizedSst.provenance.coordinateSource, "provider-response");
assert.equal(normalizedSst.status, "unknown");
const display = buildMapObservationDisplay(contract, now);
assert.equal(buildMapObservationDisplay(contract, now + 365*24*3600000).counts.sst, 1,
  "No SST age threshold: provider model samples remain visible with unclassified freshness");
assert.deepEqual(display.counts, { sst: 1, chlorophyll: 1, current: 1 });
assert.equal(display.geoJson.features.length, 3);
for (const feature of display.geoJson.features) {
  assert.deepEqual(feature.geometry, { type: "Point", coordinates: [140,45] });
  for (const forbidden of ["rank", "centroid", "featurePosition", "geometry", "confidence", "place"]) {
    assert.equal(Object.hasOwn(feature.properties, forbidden), false);
  }
}
assert.equal(display.geoJson.features[0].properties.status, "unknown");
assert.match(display.geoJson.features[0].properties.statusLabel, /freshness not classified/);
assert.equal(display.geoJson.features[2].properties.directionDegrees,37);
assert.equal(observationTime("2026-09-21T10:00"),Date.parse(time));
assert.ok(Number.isNaN(observationTime(null)));
const reconstructed = { ...chlorophyll, source: { ...chlorophyll.source, dataset: "reconstruction",
  observationType: "gap-filled-reconstruction", algorithm: "DINEOF", experimental: true } };
const reconstructedDisplay = buildMapObservationDisplay(buildMapEnvironmentalObservations({
  oceanData: { ...data, chlorophyll: reconstructed }
}), now);
const reconstructionProperties = reconstructedDisplay.geoJson.features.find(f=>f.properties.type==="chlorophyll").properties;
assert.equal(reconstructionProperties.observationType,"gap-filled-reconstruction");
assert.ok(observationInspection(reconstructionProperties).includes("Experimental reconstruction"));
assert.ok(observationInspection(reconstructionProperties).includes("Reconstruction: DINEOF"));

for (const patch of [{latitude:null}, {longitude:181}, {value:null}, {observedAt:null},
  {provenance:{coordinateSource:"request-center"}}, {source:{provider:null}}]) {
  const rejected=buildMapObservationDisplay({observations:[{...contract.observations[0],...patch}]},now);
  assert.equal(rejected.geoJson.features.length,0);
  assert.equal(rejected.excluded.length,1);
}
for (const status of ["stale","degraded","unavailable","unknown"]) {
  assert.equal(buildMapObservationDisplay({observations:[{...contract.observations[2],status}]},now).counts.current,0);
}
assert.equal(buildMapObservationDisplay(contract,now+97*3600000).counts.current,0,"held responses expire on display clock");
assert.equal(buildMapObservationDisplay(contract,now+97*3600000).geoJson.features.find(f=>f.properties.type==="chlorophyll").properties.status,"stale");
assert.equal(buildMapObservationDisplay(contract,now-2*3600000).counts.current,0,"future arrows excluded");
const arrow=contract.observations[2];
const misaligned={...arrow,id:"older",latitude:46,observedAt:"2026-09-21T09:00:00Z"};
const otherProvider={...arrow,id:"z-provider",source:{...arrow.source,provider:"Other provider"}};
const aligned={...arrow,id:"aligned",latitude:47};
const subset=buildMapObservationDisplay({observations:[arrow,misaligned,aligned,otherProvider]},now);
assert.equal(subset.counts.current,2);
assert.equal(subset.excluded.length,2);
assert.equal(new Set(subset.geoJson.features.map(f=>f.properties.observedAt)).size,1);
assert.equal(buildMapObservationDisplay({observations:[arrow,arrow]},now).counts.current,1);
assert.equal(buildMapObservationDisplay({observations:[{...arrow,value:0}]},now).counts.current,0);
const noVector={...arrow,components:{...arrow.components,eastwardMetersPerSecond:null}};
assert.equal(buildMapObservationDisplay({observations:[noVector]},now).counts.current,0);
const wrongConvention={...arrow,components:{...arrow.components,directionConvention:"degrees-from"}};
assert.equal(buildMapObservationDisplay({observations:[wrongConvention]},now).counts.current,0);
assert.deepEqual(buildMapObservationDisplay(null,now).geoJson.features,[]);

const layers=observationLayerDefinitions({temperatureSamples:true,chlorophyll:true,currents:true});
assert.deepEqual(validateStyleMin({version:8,sources:{[OBSERVATION_SOURCE]:{type:"geojson",data:display.geoJson}},layers}),[]);
assert.deepEqual(layers[0].paint["circle-opacity"], ["case", ["==", ["get", "status"], "unknown"], 0.5, 1]);
assert.equal(layers[0].paint["circle-blur"],0);
assert.equal(layers[0].paint["circle-radius"],6);
assert.equal(layers[3].layout["icon-rotation-alignment"],"map");
assert.deepEqual(layers[3].layout["icon-rotate"],["get","directionDegrees"]);
assert.ok(layers[1].filter.flat(2).includes("direct-satellite"));
assert.ok(layers[2].filter.flat(2).includes("gap-filled-reconstruction"));
for (const layer of observationLayerDefinitions({})) assert.equal(layer.layout.visibility,"none");
for (const image of Object.values(observationImages())) {
  assert.equal(image.data.length,32*32*4);
  assert.ok(image.data.some(value=>value===255));
}
assert.equal(observationImages()["pelora-current-arrow"].data[(2*32+16)*4+3],255,"unrotated arrow points north");
const arrowImage = observationImages()["pelora-current-arrow"];
const opaque = (x,y) => arrowImage.data[(y*32+x)*4+3] === 255;
assert.ok(opaque(16,2) && opaque(8,12) && opaque(24,12), "north tip widens into arrowhead below");
assert.ok(opaque(16,28) && !opaque(8,28) && !opaque(24,28), "southern end is narrow shaft");
for (const [degrees,east,north] of [[0,0,1],[90,1,0],[180,0,-1],[270,-1,0]]) {
  const c = {...current, directionDegrees:degrees, eastwardMetersPerSecond:east, northwardMetersPerSecond:north};
  const rendered = buildMapObservationDisplay(buildMapEnvironmentalObservations({
    oceanData:{...data,currents:c}, requestStatus:"ready"
  }),now).geoJson.features.find(f=>f.properties.type==="current");
  assert.equal(rendered.properties.directionDegrees,degrees,"provider degrees-toward passes through unchanged");
  // Clockwise rotation of the image's north/up tip in screen coordinates.
  const radians = rendered.properties.directionDegrees*Math.PI/180;
  assert.ok(Math.abs(Math.sin(radians)-east)<1e-10);
  assert.ok(Math.abs(Math.cos(radians)-north)<1e-10);
}
const before=JSON.stringify(contract);buildMapObservationDisplay(contract,now);assert.equal(JSON.stringify(contract),before);
console.log("PASS observation GeoJSON, provider gates, sample identities, freshness, aligned current subset, inspection, symbols and MapLibre style validation");
