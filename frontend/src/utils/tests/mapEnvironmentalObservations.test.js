import assert from "node:assert/strict";
import { buildMapEnvironmentalObservations as build } from "../mapEnvironmentalObservations.js";
const time = "2026-09-21T10:00:00Z";
const base = { resolvedLatitude:45, resolvedLongitude:140, observedAt:time, ageHours:1 };
const direct = { ...base, concentrationMgM3:0.2, source:{provider:"NOAA CoastWatch",dataset:"direct",classification:"satellite-observation",availability:"available"} };
const reconstruction = { ...direct, source:{...direct.source,dataset:"reconstructed",observationType:"gap-filled-reconstruction",algorithm:"DINEOF",experimental:true,resolutionKilometers:9} };
const current = {...base,speedKnots:1,eastwardMetersPerSecond:0.3,northwardMetersPerSecond:0.4,directionDegrees:37,source:{provider:"NOAA CoastWatch",dataset:"currents",directionConvention:"degrees-toward",classification:"altimetry-derived-geostrophic-current"}};
const sst = {...base,temperatureFahrenheit:77,source:{provider:"Open-Meteo",classification:"forecast-model"}};
function single(type,sample,state="live") {
  const key=type==="current"?"currents":type;
  return build({oceanData:{[key]:sample,dataQuality:{layers:{[key]:{state}}}},requestStatus:"ready"});
}
assert.equal(single("sst",sst).observations[0].status,"unknown");
assert.equal(single("chlorophyll",direct).observations[0].latitude,45,"global coordinates accepted");
for(const value of [undefined,null,"",NaN,Infinity]) {
  assert.equal(single("sst",{...sst,temperatureFahrenheit:value}).observations.length,0);
}
assert.equal(single("sst",{...sst,temperatureFahrenheit:0}).observations[0].value,0,"real zero preserved");
for(const [lat,lon] of [[null,null],[91,0],[0,181],[-91,0],[0,-181],["45",140]]) {
  const result=single("chlorophyll",{...direct,resolvedLatitude:lat,resolvedLongitude:lon,requestedLatitude:28,requestedLongitude:-88});
  assert.equal(result.observations.length,0);
  assert.ok(result.unavailableReasons[0].reasons.includes("provider-coordinates-unavailable"));
}
const rebuilt=single("chlorophyll",reconstruction).observations[0];
assert.equal(rebuilt.source.observationType,"gap-filled-reconstruction");
assert.equal(rebuilt.provenance.algorithm,"DINEOF");assert.equal(rebuilt.provenance.experimental,true);
assert.equal(single("chlorophyll",direct).observations[0].source.observationType,"direct-satellite");
assert.deepEqual(single("current",current).observations[0].components,{eastwardMetersPerSecond:0.3,northwardMetersPerSecond:0.4,directionDegrees:37,directionConvention:"degrees-toward"});
for(const status of ["stale","degraded","unavailable"]) assert.equal(single("current",current,status).observations[0].status,status);
assert.equal(single("current",{...current,ageHours:97}).observations[0].status,"stale");
assert.equal(single("chlorophyll",{...direct,ageHours:73}).observations[0].status,"stale");
assert.equal(single("current",{...current,observedAt:null}).observations[0].status,"unknown");
assert.equal(single("current",{...current,eastwardMetersPerSecond:null}).observations.length,0);
assert.equal(single("current",{...current,source:{...current.source,directionConvention:"degrees-from"}}).observations.length,0);
const retained=build({requestStatus:"degraded",oceanData:{chlorophyll:direct,dataQuality:{layers:{chlorophyll:{state:"live"}}}}});
assert.equal(retained.requestStatus,"degraded");assert.equal(retained.observations[0].status,"current");
const fakePlace=build({oceanData:{location:{latitude:28,longitude:-88,name:"Place"},conditions:{sst:"80F"},rank:1}});
assert.equal(fakePlace.observations.length,0);
const noCoordinates=single("sst",{...sst,resolvedLatitude:null,resolvedLongitude:null,center:{latitude:28,longitude:-88},geometry:{type:"Point",coordinates:[-88,28]}});
assert.equal(noCoordinates.observations.length,0);
const neighbor={...sst,providerCoordinates:{resolvedLatitude:46,resolvedLongitude:141}};
const sampled=build({oceanData:{sst:{derived:{spatialStructure:{samples:[neighbor,neighbor]}}}}});
assert.equal(sampled.observations.length,1);assert.equal(sampled.observations[0].latitude,46);
assert.equal(build({oceanData:{sst:{derived:{spatialStructure:{samples:[sst]}}}}}).observations.length,0,"legacy SST fallback rejected");
for(const item of [rebuilt,...sampled.observations,single("current",current).observations[0]]) {
  for(const key of ["geometry","centroid","rank","featurePosition","place"]) assert.equal(Object.hasOwn(item,key),false);
  assert.notEqual(item.source.provider,"Place");
}
const missingTime=single("sst",{...sst,observedAt:"invalid"}).observations[0];
assert.equal(missingTime.observedAt,null);
assert.equal(missingTime.provenance.timestampSource,null);
const before=JSON.stringify(direct);single("chlorophyll",direct);assert.equal(JSON.stringify(direct),before,"input not mutated");
assert.equal(single("current",{...current,source:{...current.source,availability:"provider-unavailable"}}).observations[0].status,"degraded");
assert.equal(build().requestStatus,"unavailable");assert.ok(build().unavailableReasons.length);
console.log("PASS presentation adapter values, global positions, provenance, statuses, no inferred geometry or Place observations");


// Surrounding currents must pass exactly the same gates as center currents.
function surrounding(vectors, state = "live", center = {}) {
  return build({
    requestStatus: "ready",
    oceanData: {
      currents: {
        ...center,
        derived: { spatialAnalysis: { spatialStructure: { vectors } } }
      },
      dataQuality: { layers: { currents: { state } } }
    }
  });
}
const surroundingResult = surrounding([current]);
assert.equal(surroundingResult.observations.length, 1);
assert.deepEqual(surroundingResult.observations[0], single("current", current).observations[0],
  "surrounding sample preserves all center gates, timestamps, quality and provenance");
const requestedOnly = { ...current, resolvedLatitude: null, resolvedLongitude: null,
  requestedLatitude: 45, requestedLongitude: 140 };
assert.equal(surrounding([requestedOnly]).observations.length, 0);
assert.equal(surrounding([current, { ...current }]).observations.length, 1);
assert.equal(surrounding([current], "live", current).observations.length, 1,
  "center and surrounding identities also deduplicate");
for (const invalid of [
  { ...current, eastwardMetersPerSecond: null },
  { ...current, northwardMetersPerSecond: Infinity },
  { ...current, directionDegrees: NaN },
  { ...current, speedKnots: null },
  { ...current, source: { ...current.source, provider: null } },
  { ...current, source: { ...current.source, directionConvention: "degrees-from" } }
]) assert.equal(surrounding([invalid]).observations.length, 0);
for (const state of ["stale", "degraded", "unavailable"]) {
  assert.equal(surrounding([current], state).observations[0].status, state);
}
const decorated = { ...current, geometry: { type: "Point", coordinates: [140,45] },
  centroid: [140,45], featurePosition: { latitude:45, longitude:140 }, rank:1 };
const normalized = surrounding([decorated]).observations[0];
assert.deepEqual(normalized, surroundingResult.observations[0]);
for (const key of ["geometry", "centroid", "featurePosition", "rank"]) {
  assert.equal(Object.hasOwn(normalized, key), false);
}
console.log("PASS surrounding current observations: shared gates, provider positions only, deduplication, no feature geometry");
