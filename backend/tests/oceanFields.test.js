import assert from "node:assert/strict";
import {FIELD_PRODUCTS,validateFieldRequest} from "../fields/datasetRegistry.js";
import {parseGridRows,createErddapAdapter,readProviderJson} from "../fields/erddapAdapter.js";
import {buildField,createFieldService,selectField} from "../fields/fieldService.js";
const params = (extra={}) => new URLSearchParams({layer:"currents",bbox:"140,-45,150,-35",density:"12",...extra});
assert.deepEqual(validateFieldRequest(params()).bounds,[140,-45,150,-35]);
assert.deepEqual(validateFieldRequest(params({bbox:"-180,-90,180,90"})).bounds,[-180,-90,180,90]);
for(const extra of [{layer:"sst"},{dataset:"invented"},{bbox:"170,-10,-170,10"},{bbox:"-181,0,0,10"},{bbox:"0,-91,1,1"},{bbox:"0,0,1,91"},{bbox:"0,2,1,1"},{bbox:"0,,1,2"},{bbox:"0,0,Infinity,2"},{density:"100000"},{density:"0"},{density:"1.5"},{time:"tomorrow"}])
  assert.throws(()=>validateFieldRequest(params(extra)),e=>e.statusCode===400);
assert.throws(()=>validateFieldRequest(params({extra:"a".repeat(1025)})),/large/);
const bathy=FIELD_PRODUCTS[0],current=FIELD_PRODUCTS[1];
const time="2026-09-19T00:00:00Z",now=Date.parse("2026-09-22T00:00:00Z");
const table={columnNames:["time","latitude","longitude","u_current","v_current"],rows:[
  [time,27.125,-89.875,-0.291,0.948],[time,27.375,-89.875,null,0.2],[time,27.125,-89.625,-214748.3648,0.1]]};
const cells=parseGridRows(current,[table],time);
assert.deepEqual(cells[0],[-89.875,27.125,-0.291,0.948]);
assert.deepEqual(cells[1].slice(2),[null,null]);assert.deepEqual(cells[2].slice(2),[null,null]);
assert.throws(()=>parseGridRows(current,[{...table,rows:[["2026-09-18T00:00:00Z",0,0,1,1]]}],time),/Mixed/);
assert.throws(()=>parseGridRows(current,[table],time,2),/limit/);
assert.throws(()=>parseGridRows(current,[{columnNames:["latitude"],rows:[]}],time),/columns/);
const elevations=parseGridRows(bathy,[{columnNames:["latitude","longitude","z"],rows:[[27.008333,270.008333,-2374.9363],[28,271,-99999],[27,271,0]]}],null);
assert.ok(Math.abs(elevations[0][0]+89.991667)<1e-8);assert.equal(elevations[1][2],null);assert.equal(elevations[2][2],0);
const request=validateFieldRequest(params());
const acquired={cells,validTime:time,stride:2,retrievedAt:new Date(now).toISOString()};
const field=buildField(current,request,acquired,now);
assert.equal(field.status,"latest-available");assert.equal(field.ageHours,72);assert.equal(field.coverage.missingCells,2);
assert.equal(field.productType,"altimetry-derived-geostrophic-current");assert.equal(field.provenance.fusion,false);
assert.equal(buildField(current,request,acquired,now+48*3600000).status,"stale");
assert.throws(()=>buildField(current,request,acquired,Date.parse(time)-1000),/future/);
const b=buildField(bathy,request,{cells:elevations,validTime:null,stride:30,retrievedAt:new Date(now).toISOString()},now);
assert.equal(b.status,"static");assert.equal(b.ageHours,null);assert.equal(b.payload.order,"latitude-ascending-rows,longitude-ascending-columns");
assert.equal(b.payload.values.filter(v=>v===0).length,1);
let calls=0;const service=createFieldService({now:()=>now,adapters:{"erddap-grid":async()=>{calls++;return acquired;}}});
await Promise.all([service(params()),service(params())]);assert.equal(calls,1,"in-flight deduplication");await service(params());assert.equal(calls,1,"bounded cache reused");
const alternate={...current,id:"another-product",provider:"Independent provider",priority:1};
const chosen=selectField([{product:current,field:{...field,status:"stale"}},{product:alternate,field:{...field,productId:alternate.id}}],"best-available");
assert.equal(chosen.selection.selectedProductId,alternate.id);assert.equal(chosen.selection.candidates.length,2);assert.equal(chosen.selection.fusion,false);
const explicit=validateFieldRequest(params({dataset:current.id}));assert.equal(explicit.selection,"explicit-product");
const urls=[];const adapter=createErddapAdapter(async url=>{urls.push(decodeURIComponent(url));return url.includes('/info/')?{table:{rows:[["attribute","NC_GLOBAL","time_coverage_end","String",time]]}}:{table};});
await adapter(current,request);
assert.ok(urls[1].includes(`[(${time})]`));assert.ok(!urls[1].includes("[(last)]"));assert.ok(urls[1].includes("u_current")&&urls[1].includes("v_current"));
await assert.rejects(()=>readProviderJson("test",async()=>new Response("x".repeat(2_000_001))),/2 MB/);
console.log("PASS field global validation, bounds/density/byte caps, provider grids, no-data, time coherence, metadata, multi-product selection and cache");

// Exercise validation through the service entry point, before any provider work.
for (const product of FIELD_PRODUCTS) {
  let providerCalls = 0;
  const validateThroughService = createFieldService({
    products: [product], now: () => now,
    adapters: {"erddap-grid": async () => {
      providerCalls++;
      return product.layer === "bathymetry"
        ? {cells: elevations, validTime: null, stride: 1, retrievedAt: new Date(now).toISOString()}
        : acquired;
    }}
  });
  for (const density of [3, product.maxDensity + 1, 4.5]) {
    await assert.rejects(
      () => validateThroughService(params({layer: product.layer, density: String(density)})),
      error => error.statusCode === 400 && /density/.test(error.message)
    );
  }
  await assert.rejects(
    () => validateThroughService(params({layer: product.layer, density: "3", time: "unsupported"})),
    error => error.statusCode === 400 && /density/.test(error.message)
  );
  await assert.rejects(
    () => validateThroughService(params({layer: product.layer, density: "4", time: "unsupported"})),
    error => error.statusCode === 400 && /Only latest-available/.test(error.message)
  );
  assert.equal(providerCalls, 0, "invalid requests must not acquire provider data");
  for (const density of [4, product.maxDensity]) {
    const selected = await validateThroughService(params({layer: product.layer, density: String(density)}));
    assert.equal(selected.productId, product.id);
    assert.equal(selected.selection.selectedProductId, product.id);
  }
}

const failedProduct = {...current, id: "failed-product", provider: "Unavailable test provider"};
// A large unselected field must not be serialized as the response. Its independent
// candidate metadata is retained, while the selected payload alone is returned.
const largeAlternative = {...current, id: "large-alternative", priority: 2, displayName: "x".repeat(500001)};
const integrationService = createFieldService({
  products: [current, failedProduct, largeAlternative], now: () => now,
  adapters: {"erddap-grid": async product => {
    if (product.id === failedProduct.id) throw new Error("recorded provider failure");
    return acquired;
  }}
});
const selectedResponse = await integrationService(params());
assert.equal(selectedResponse.productId, current.id);
assert.equal(selectedResponse.fieldId, field.fieldId);
assert.deepEqual(selectedResponse.payload, field.payload);
assert.equal(selectedResponse.selection.mode, "best-available");
assert.equal(selectedResponse.selection.fusion, false);
assert.equal(selectedResponse.selection.candidates.length, 3);
const failure = selectedResponse.selection.candidates.find(candidate => candidate.productId === failedProduct.id);
assert.equal(failure.status, "unavailable");
assert.equal(failure.reason, "recorded provider failure");
assert.equal(failure.provider, failedProduct.provider);
assert.equal(failure.fieldId, null);
assert.ok(Buffer.byteLength(JSON.stringify(selectedResponse)) < 500000);
assert.ok(Buffer.byteLength(JSON.stringify(buildField(largeAlternative, request, acquired, now))) > 500000);
await assert.rejects(
  () => integrationService(params({dataset: largeAlternative.id})),
  /Field payload exceeds mobile limit/
);
const explicitResponse = await integrationService(params({dataset: current.id}));
assert.equal(explicitResponse.selection.mode, "explicit-product");
assert.equal(explicitResponse.selection.candidates.length, 1);
// Candidate failure metadata is part of the selected serialized response too.
const oversizedFailureService = createFieldService({
  products: [current, failedProduct], now: () => now,
  adapters: {"erddap-grid": async product => {
    if (product.id === failedProduct.id) throw new Error("x".repeat(500001));
    return acquired;
  }}
});
await assert.rejects(() => oversizedFailureService(params()), /Field payload exceeds mobile limit/);
console.log("PASS service integration: selected response, complete-response byte limit, failed candidates, independent density/time validation");
