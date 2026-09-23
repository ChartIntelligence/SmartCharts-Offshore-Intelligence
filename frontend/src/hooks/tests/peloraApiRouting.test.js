import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import {resolvePeloraApiUrl} from "../../utils/peloraApi.js";

const source = name => readFileSync(new URL(`../${name}.js`, import.meta.url), "utf8")
  .replace(/^import[\s\S]*?;\r?\n/gm, "").replace("export function", "function");
const opportunitySource = source("useDynamicOpportunities");
const oceanSource = source("useLiveMarineConditions");
const fieldSource = source("useMapLibreOceanFields");
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

function harness(code, invocation, environment, extras = {}) {
  let effect;
  const calls = [], slots = [], timers = [];
  const body = {opportunities:[], evaluationState:{contractVersion:"pelora-governed-opportunity-evaluation-state-v1",state:"partial"}};
  const context = {
    resolvePeloraApiUrl: path => resolvePeloraApiUrl(path, environment),
    AbortController, URLSearchParams, console,
    Date:{now:()=>123456},
    useState(initial) {
      const index = slots.length;
      slots.push(initial);
      return [initial, value => {slots[index] = typeof value === "function" ? value(slots[index]) : value;}];
    },
    useEffect(callback) {effect = callback;},
    window:{setInterval:(fn,ms)=>(timers.push(ms),1),setTimeout:(fn,ms)=>(timers.push(ms),2),clearInterval:()=>{},clearTimeout:()=>{}},
    fetch:async (url, options)=>{calls.push({url,options});return {ok:true,json:async()=>body};},
    ...extras
  };
  runInNewContext(code + "\n" + invocation, context);
  return {calls,slots,timers,body,cleanup:effect()};
}

for (const [environment, base] of [
  [{DEV:true}, ""],
  [{DEV:false}, "https://velion-ocean-engine.onrender.com"],
  [{DEV:true,VITE_PELORA_API_BASE:"https://selected.invalid/api/"}, "https://selected.invalid"],
  [{DEV:false,VITE_PELORA_API_BASE:"/gateway/"}, "/gateway"]
]) {
  for (const token of [null, "mock-captain-token"]) {
    for (const species of ["blue-marlin","yellowfin-tuna","blackfin-tuna","mahi","sailfish","white-marlin","wahoo"]) {
      const run = harness(opportunitySource,
        'useDynamicOpportunities(species, token, {explorationMode:"within-range",origin:{coordinates:[27,-90]},operatingRangeNm:100});',
        environment, {species,token});
      await tick();
      assert.equal(run.calls.length,1);
      const {url,options} = run.calls[0];
      assert.equal(url,`${base}/api/opportunities?species=${species}&explorationMode=within-range&originLatitude=27&originLongitude=-90&operatingRangeNm=100&t=123456`);
      assert.equal(options.headers.Authorization,token ? `Bearer ${token}` : undefined);
      assert.equal(options.cache,"no-store");
      assert.equal(options.signal.aborted,false);
      assert.equal(run.slots[0],run.body,"Response metadata is preserved verbatim");
      run.cleanup();
      assert.equal(options.signal.aborted,true);
    }
    const run = harness(oceanSource,'useLiveMarineConditions({coordinates:[-90,27]}, token);',environment,{token});
    await tick();
    const {url,options} = run.calls[0];
    assert.equal(url,`${base}/api/ocean?lat=27&lon=-90&t=123456`);
    assert.equal(options.headers.Authorization,token ? `Bearer ${token}` : undefined);
    assert.equal(options.cache,"no-store");
    assert.equal(run.slots[0].data,run.body);
    assert.deepEqual(run.timers,[900000,5000]);
    assert.equal(options.signal.aborted,false);
    run.cleanup();
    assert.equal(options.signal.aborted,true);
  }

  // Invoke the actual field request callback; do not render a map or acquire data.
  let request, disposed = false;
  const controller = new AbortController();
  const field = {contractVersion:"pelora-spatial-field-v1",layer:"currents"};
  const calls = [];
  const run = harness(fieldSource,
    'useMapLibreOceanFields({mapRef:{current:map},bathymetry:true,currentField:true,onFieldStatus:()=>{}});',environment,{
      EMPTY_FIELD:{features:[]},
      map:{off:()=>{},on:()=>{},once:()=>{},isStyleLoaded:()=>false},
      createViewportFieldRequests(options) {request=options.request;return {dispose:()=>{disposed=true;},cancel:()=>{}};},
      fetch:async (url,options)=>{calls.push({url,options});return {ok:true,json:async()=>field};}
    });
  assert.equal(await request("currents",{bbox:[-90,27,-89,28],currentDensity:8},controller.signal),field);
  assert.equal(calls[0].url,`${base}/api/ocean/field?layer=currents&bbox=-90%2C27%2C-89%2C28&density=8&time=latest-available`);
  assert.deepEqual(Object.keys(calls[0].options),["signal"],"Fields gain no bearer header or cache override");
  assert.equal(calls[0].options.signal,controller.signal);
  controller.abort();
  assert.equal(calls[0].options.signal.aborted,true);
  run.cleanup();
  assert.equal(disposed,true);
  assert.deepEqual(run.timers,[300000]);
}

// Supabase continues to own its configuration, independent of Pelora API routing.
const supabaseSource = readFileSync(new URL("../../lib/supabase.js",import.meta.url),"utf8");
assert.match(supabaseSource,/VITE_SUPABASE_URL/);
assert.match(supabaseSource,/VITE_SUPABASE_PUBLISHABLE_KEY/);
assert.doesNotMatch(supabaseSource,/resolvePeloraApiUrl|VITE_PELORA_API_BASE/);
for (const code of [opportunitySource,oceanSource,fieldSource]) {
  assert.doesNotMatch(code,/import\.meta\.env|onrender\.com|localhost|VITE_OCEAN_API_BASE/);
}
console.log("PASS actual hooks share routing across modes/overrides, preserve auth, queries, species, response metadata, cancellation and refresh; Supabase stays separate");
