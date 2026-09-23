import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import {buildFishingLocationSpatialEvidenceV1 as build} from "../../shared/fishingLocationSpatialEvidence.mjs";

const legacy = () => ({latitude:29.5,longitude:-86.2});
const fixture = () => ({...legacy(),source:"manual",certainty:"exact-as-reported"});
const radius = () => ({value:12,unit:"m",source:"explicit-device-reading",kind:"horizontal-accuracy-radius"});

test("valid legacy coordinates remain useful, unknown and awaiting clarification", () => {
  const input = legacy(); const before = structuredClone(input); const result = build(input);
  assert.equal(result.coordinates.validity,"valid");
  assert.equal(result.coordinates.latitude.value,29.5);
  assert.equal(result.coordinates.longitude.value,-86.2);
  assert.equal(result.source,"unknown"); assert.equal(result.certainty,"unknown");
  assert.equal(result.quality,"unknown"); assert.equal(result.readiness,"needs-clarification");
  assert.equal(result.accuracy.state,"unknown"); assert.equal(result.locationEntryId,null);
  assert.deepEqual(input,before);
});

test("geographic boundaries are inclusive and longitudes never wrap", () => {
  for (const latitude of [-90,0,90]) for (const longitude of [-180,0,180]) {
    const result = build({...fixture(),latitude,longitude});
    assert.equal(result.readiness,"ready");
    assert.equal(result.coordinates.latitude.value,latitude);
    assert.equal(result.coordinates.longitude.value,longitude);
  }
  for (const [field,values] of [["latitude",[-91,91]], ["longitude",[-181,181,360]]]) {
    for (const value of values) {
      const result = build({...fixture(),[field]:value});
      assert.equal(result.coordinates[field].state,"out-of-range");
      assert.equal(result.quality,"insufficient"); assert.equal(result.readiness,"insufficient");
    }
  }
});

test("coordinates validate independently without numeric coercion", () => {
  for (const field of ["latitude","longitude"]) for (const value of
    [null,undefined,NaN,Infinity,-Infinity,""," ","29.5",false,true,{},[],[29.5]]) {
    const result = build({...fixture(),[field]:value});
    assert.equal(result.coordinates[field].value,null);
    assert.equal(result.coordinates[field === "latitude" ? "longitude" : "latitude"].state,"valid");
    assert.equal(result.readiness,"insufficient");
    assert.deepEqual(JSON.parse(JSON.stringify(result)),result);
  }
  assert.equal(build({}).readiness,"insufficient");
  assert.equal(build(null).readiness,"insufficient");
  const zero = build({...fixture(),latitude:-0});
  assert.equal(zero.coordinates.latitude.value,0);
  assert.deepEqual(zero.original.latitude,{type:"number",value:"-0"});
});

test("source never manufactures certainty and certainty never manufactures provenance", () => {
  for (const source of ["manual","map-selection","device-capture"]) {
    assert.equal(build({...fixture(),source}).readiness,"ready");
    const unknown = build({...legacy(),source});
    assert.equal(unknown.quality,"unknown"); assert.equal(unknown.readiness,"needs-clarification");
    assert.equal(unknown.accuracy.value,null);
  }
  for (const source of [undefined,"unknown","invented"]) {
    const result = build({...fixture(),source});
    assert.equal(result.quality,"precise"); assert.equal(result.readiness,"needs-clarification");
  }
  assert.equal(build({...fixture(),certainty:"invented"}).quality,"unknown");
});

test("quality and readiness retain explicit approximation and reported accuracy independently", () => {
  assert.equal(build(fixture()).quality,"precise");
  const approximateOnly = build({...fixture(),certainty:"approximate"});
  assert.equal(approximateOnly.quality,"approximate");
  assert.equal(approximateOnly.readiness,"ready");
  const exactWithAccuracy = build({...fixture(),accuracy:radius()});
  assert.equal(exactWithAccuracy.quality,"bounded");
  assert.equal(exactWithAccuracy.readiness,"ready");
  const bounded = build({...legacy(),source:"device-capture",accuracy:radius()});
  assert.equal(bounded.quality,"bounded"); assert.equal(bounded.readiness,"ready");
  assert.equal(bounded.certainty,"unknown","An explicit radius characterizes uncertainty without inventing certainty text");
  assert.deepEqual(bounded.accuracy,{state:"valid",...radius()});
  const approximate = build({...fixture(),certainty:"approximate",accuracy:radius()});
  assert.equal(approximate.quality,"approximate"); assert.equal(approximate.readiness,"ready");
  assert.equal(approximate.accuracy.state,"valid");
  assert.equal(build({...legacy(),accuracy:radius()}).readiness,"needs-clarification");
});

test("invalid accuracy does not destroy independently characterized coordinates", () => {
  for (const accuracy of [false,[],{}, {...radius(),value:-1}, {...radius(),value:NaN},
    {...radius(),value:Infinity}, {...radius(),value:"12"}, {...radius(),unit:"feet"},
    {...radius(),source:""}, {...radius(),kind:undefined}]) {
    const result = build({...fixture(),accuracy});
    assert.equal(result.accuracy.state,"invalid"); assert.equal(result.coordinates.validity,"valid");
    assert.equal(result.quality,"precise"); assert.equal(result.readiness,"ready");
    assert.deepEqual(JSON.parse(JSON.stringify(result)),result);
  }
  assert.equal(build({...fixture(),accuracy:{...radius(),value:0}}).accuracy.value,0);
  assert.equal(build({...fixture(),latitude:29.123456789}).accuracy.value,null);
});

test("identity and labels are metadata, not coordinates, scientific quality or ordering", () => {
  const a = build({...fixture(),locationEntryId:"entry-a",label:"Morning stop"});
  const b = build({...fixture(),locationEntryId:"entry-b",label:"Rig pass"});
  assert.notEqual(a.locationEntryId,b.locationEntryId);
  assert.deepEqual(a.coordinates,b.coordinates);
  assert.equal(a.label,"Morning stop"); assert.equal(a.readiness,b.readiness);
  assert.equal(build(fixture()).locationEntryId,null);
  assert.equal(build(fixture()).readiness,"ready");
  assert.deepEqual(build({...fixture(),arrayIndex:5,priority:1}),build(fixture()));
  for (const label of ["", "   ", "Morning stop"]) {
    assert.deepEqual(build({...fixture(),label}), {...build(fixture()),label});
  }
});

test("deterministic serializable private projection has no temporal or species interpretation", () => {
  const input = {...fixture(),species:"fixture-species",user_id:"private",catchResults:{count:9},
    trip_date:"2026-09-22",timeZone:"America/Chicago",visitTime:"08:00",reportValid:true};
  assert.deepEqual(build(input),build(fixture()));
  assert.equal(input.reportValid,true); assert.equal(Object.hasOwn(build(input),"reportValid"),false);
  const result = build({...fixture(),provenance:{captureRecordedAt:"unparsed captain-supplied text"}});
  assert.equal(result.provenance.captureRecordedAt,"unparsed captain-supplied text");
  assert.equal(result.provenance.captureTimeInterpretation,"opaque-recording-metadata-not-visit-time");
  assert.deepEqual(build(fixture()),build(fixture()));
  assert.deepEqual(JSON.parse(JSON.stringify(result)),result);
  const source = readFileSync(new URL("../../shared/fishingLocationSpatialEvidence.mjs",import.meta.url),"utf8");
  assert.doesNotMatch(source,/\bimport\b|console\.|Date\(|Math.random|supabase|geolocation|Temporal|species|scoring|ranking|habitat/);
});
