import assert from "node:assert/strict";
import { test } from "node:test";
import {
  celsiusToFahrenheit, getSeaSurfaceTemperaturePoint, getMarineConditions,
  getSstSpatialStructure, assessOceanEvidence
} from "../server.js";
import { buildMapEnvironmentalObservations } from "../../frontend/src/utils/mapEnvironmentalObservations.js";

const cases = [
  ["positive", 25, 77], ["negative", -1, 30.2], ["zero", 0, 32],
  ["existing rounding", 25.123, 77.2],
  ["null", null, null], ["undefined", undefined, null], ["blank", "", null],
  ["whitespace", " ", null], ["numeric zero string", "0", null],
  ["numeric string", "25", null], ["true", true, null], ["false", false, null],
  ["NaN", NaN, null], ["Infinity", Infinity, null], ["-Infinity", -Infinity, null],
  ["array", [], null], ["numeric array", [25], null], ["object", {}, null],
  ["boxed number", new Number(25), null]
];

for (const [index, [label, value, expected]] of cases.entries()) {
  test(`SST numeric integrity: ${label}`, async () => {
    assert.equal(celsiusToFahrenheit(value), expected);
    const originalFetch = globalThis.fetch;
    // Synthetic provider responses only. Unique coordinates isolate the point cache.
    const latitude = 27 + index * 0.01;
    let calls = 0;
    globalThis.fetch = async url => {
      calls++;
      const request = new URL(url);
      assert.ok(["marine-api.open-meteo.com", "api.open-meteo.com"].includes(request.hostname));
      return { ok: true, json: async () => ({
        latitude: Number(request.searchParams.get("latitude")),
        longitude: Number(request.searchParams.get("longitude")),
        current: { time: "2026-09-23T12:00", sea_surface_temperature: value }
      }) };
    };
    try {
      const point = await getSeaSurfaceTemperaturePoint(latitude, -88);
      const marine = await getMarineConditions(latitude, -88);
      for (const sst of [point, marine.sst]) {
        assert.equal(sst.temperatureCelsius, expected === null ? null : value);
        assert.equal(sst.temperatureFahrenheit, expected);
      }
      const spatial = await getSstSpatialStructure(latitude, -88, marine.sst.temperatureFahrenheit);
      assert.equal(spatial.validNeighborCount, expected === null ? 0 : 4);
      assert.equal(spatial.centerTemperatureAvailable, expected !== null);
      assert.equal(spatial.rangeFahrenheit, expected === null ? null : 0);
      assert.ok(spatial.samples.every(sample => sample.temperatureFahrenheit === expected));
      const sst = { ...point, derived: { spatialStructure: spatial } };
      const map = buildMapEnvironmentalObservations({ oceanData: { sst } });
      if (expected === null) {
        assert.equal(map.observations.length, 0, "missing SST cannot become a finite map observation");
      } else {
        assert.equal(map.observations.length, 5);
        assert.ok(map.observations.every(observation => observation.value === expected));
      }
      const evidence = assessOceanEvidence({ latitude, longitude: -88, sst });
      assert.equal(evidence.groups.temperature.values.temperatureFahrenheit, expected);
      assert.equal(evidence.groups.temperature.available, expected !== null);
      assert.ok(calls >= 7, "exercise both acquisition paths and four spatial neighbors");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
}
