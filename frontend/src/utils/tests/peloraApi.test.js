import assert from "node:assert/strict";
import {resolvePeloraApiUrl} from "../peloraApi.js";

const hosted = "https://velion-ocean-engine.onrender.com";
const endpoints = ["opportunities", "ocean", "ocean/field"];
for (const [environment, base] of [
  [{DEV:true}, ""],
  [{DEV:false}, hosted],
  [{DEV:true,VITE_PELORA_API_BASE:"https://test.invalid/"}, "https://test.invalid"],
  [{DEV:false,VITE_PELORA_API_BASE:"https://test.invalid/api///"}, "https://test.invalid"],
  [{DEV:false,VITE_PELORA_API_BASE:"/"}, ""],
  [{DEV:false,VITE_PELORA_API_BASE:"/api/"}, ""],
  [{DEV:true,VITE_PELORA_API_BASE:"/gateway/api/"}, "/gateway"],
  [{DEV:true,VITE_PELORA_API_BASE:""}, ""],
  [{DEV:false,VITE_PELORA_API_BASE:"   "}, hosted],
  [{DEV:true,VITE_OCEAN_API_BASE:"https://ignored.invalid"}, ""]
]) {
  for (const endpoint of endpoints) {
    for (const path of [endpoint, `/${endpoint}`, `api/${endpoint}`, `/api/${endpoint}`]) {
      const query = "?species=yellowfin-tuna&bbox=-90%2C27%2C-89%2C28&text=a+b%26c";
      assert.equal(resolvePeloraApiUrl(path + query, environment), `${base}/api/${endpoint}${query}`);
    }
  }
}
for (const base of ["//external.invalid", "https://test.invalid/?x=1", "https://test.invalid/#hash", "ftp://test.invalid", "https://user:password@test.invalid"]) {
  assert.throws(() => resolvePeloraApiUrl("/api/ocean", {VITE_PELORA_API_BASE:base}), TypeError);
}
for (const path of ["/api/api/ocean", "https://external.invalid/api/ocean", "/api/../ocean"]) {
  assert.throws(() => resolvePeloraApiUrl(path, {DEV:true}), TypeError);
}
console.log("PASS Pelora API defaults, shared override, relative bases, slash normalization, query preservation and invalid configuration");
