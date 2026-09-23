import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import {browserPersistenceProject, persistenceRequestHeaders, canPersistOceanResponse} from "../persistenceEnvironment.js";
import {comparePersistenceEnvironments, normalizePersistenceProjectIdentity} from "../../../../shared/persistenceEnvironment.mjs";

const project = "https://captain-test.invalid";
const environment = {VITE_SUPABASE_URL:project};
const matched = comparePersistenceEnvironments({browserProject:project,backendProject:project,backendAvailable:true});
for (const value of [project,`${project}/`," HTTPS://CAPTAIN-TEST.INVALID:443/ "]) {
  assert.equal(normalizePersistenceProjectIdentity(value),project);
  assert.equal(browserPersistenceProject({VITE_SUPABASE_URL:value}),project);
}
for (const value of [null,undefined,"", " ","not-a-url","http://captain-test.invalid","https://user:credential@captain-test.invalid","https://captain-test.invalid/path","https://captain-test.invalid?token=private","https://captain-test.invalid#private"]) {
  assert.equal(normalizePersistenceProjectIdentity(value),null);
}
assert.deepEqual(persistenceRequestHeaders(environment),{"X-Pelora-Persistence-Project":project});
assert.deepEqual(persistenceRequestHeaders({}),{});
assert.equal(canPersistOceanResponse(matched,environment),true);
assert.equal(canPersistOceanResponse({...matched,backendProjectIdentity:"https://another.invalid"},environment),false);
assert.equal(canPersistOceanResponse(matched,{}),false);
for (const species of ["blue-marlin","yellowfin-tuna","blackfin-tuna","mahi","sailfish","white-marlin","wahoo"]) {
  assert.deepEqual(persistenceRequestHeaders({...environment,species}),persistenceRequestHeaders(environment));
}

const source = readFileSync(new URL("../../hooks/useOceanMemoryPersistence.js",import.meta.url),"utf8")
  .replace(/^import[\s\S]*?;\r?\n/gm,"").replace("export function","function");
const snapshot = {
  available:true,snapshotType:"ocean-memory",contractVersion:"pelora-ocean-snapshot-assembly-v1",
  identity:{snapshotId:"test-snapshot"},
  integrity:Object.fromEntries(["metadataAvailable","observationSnapshotAvailable","intelligenceSnapshotAvailable","observedAtConsistent","generatedAtConsistent","observationContractConsistent","intelligenceContractConsistent","immutable"].map(key=>[key,true]))
};
for (const contract of [matched, {...matched,state:"mismatched"}, {...matched,state:"unknown"}, null, {state:"matched"}, {...matched,backendProjectIdentity:"https://another.invalid"}]) {
  let effect;
  const calls=[];
  runInNewContext(source+'\nuseOceanMemoryPersistence({user:{id:"test-owner"},selectedLocation:{id:"test-place"},oceanSnapshot:snapshot,persistenceEnvironment:contract});',{
    useEffect:callback=>{effect=callback;},useRef:initial=>({current:initial}),
    canPersistOceanResponse:value=>canPersistOceanResponse(value,environment),
    saveOceanSnapshot:async value=>{calls.push(value);return {status:"created"};},
    snapshot,contract,console:{info:()=>{},error:()=>{}}
  });
  effect();
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(calls.length,contract===matched?1:0);
  if (calls.length) {
    assert.equal(calls[0].oceanSnapshot,snapshot,"Scientific snapshot is unchanged");
    assert.equal(calls[0].userId,"test-owner");
    assert.equal(calls[0].fishingDayReportId,undefined,"No report association added");
  }
}
console.log("PASS browser identity, species-neutral request context and actual automatic snapshot hook fail closed except for matching response acknowledgement");
