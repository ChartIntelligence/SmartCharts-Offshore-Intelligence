import assert from "node:assert/strict";
import fs from "node:fs";
import {buildMapEnvironmentalObservations} from "../mapEnvironmentalObservations.js";
import {buildMapObservationDisplay} from "../mapObservationDisplay.js";
// Unauthenticated GET /api/ocean?lat=28&lon=-89, captured 2026-09-22 UTC.
// Only response environmental fields retained; provider failures are intentional.
const oceanData=JSON.parse(fs.readFileSync(new URL("./fixtures/ocean-runtime.json",import.meta.url)));
const contract=buildMapEnvironmentalObservations({oceanData,requestStatus:"ready"});
const display=buildMapObservationDisplay(contract,Date.parse("2026-09-22T01:35:00Z"));
assert.deepEqual(display.counts,{sst:5,chlorophyll:0,current:0});
assert.equal(display.geoJson.features.length,5);
assert.ok(contract.observations.every(o=>o.source.observationType==="forecast-model"));
assert.ok(contract.observations.every(o=>o.provenance.coordinateSource==="provider-response"));
assert.equal(oceanData.dataQuality.layers.currents.reason,"currents-provider-request-failed");
assert.equal(oceanData.dataQuality.layers.chlorophyll.reason,"chlorophyll-providers-request-failed");
assert.ok(display.excluded.some(o=>o.type==="current"));
assert.ok(display.excluded.some(o=>o.type==="chlorophyll"));
console.log("PASS captured API response: 5 SST samples, 0 unavailable currents, 0 unavailable chlorophyll");
