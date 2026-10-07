import assert from "node:assert/strict";
import {createViewportFieldRequests} from "../viewportFieldRequests.js";
import {fieldStatusText} from "../oceanFieldPresentation.js";
let scheduled;
const pending=[],states=[];
const controller=createViewportFieldRequests({
  setTimer:fn=>(scheduled=fn,1),clearTimer:()=>{scheduled=null;},
  request:(layer,viewport,signal)=>new Promise((resolve,reject)=>pending.push({layer,viewport,signal,resolve,reject})),
  onState:(layer,state)=>states.push({layer,...state})
});
const a={bbox:[-90,27,-89,28],currentDensity:12,bathymetryDensity:48};
const b={...a,bbox:[140,-40,141,-39]};
const first={fieldId:"first",status:"latest-available",validTime:"2026-09-19T00:00:00Z",ageHours:72,
  provider:"NOAA",dataset:"current-grid",provenance:{coordinates:"provider-response",source:"original"},
  freshness:{maxFreshAgeHours:96},coverage:{validCells:1,returnedCells:2},resolution:{deliveredDegrees:.25}};
const original=JSON.stringify(first);
controller.schedule(a,["currents"]);
assert.equal(states.at(-1).status,"loading");assert.equal(states.at(-1).field,null);
let run=scheduled();pending.at(-1).resolve(first);await run;
assert.equal(states.at(-1).field,first,"initial success");
controller.schedule({...a},["currents"]);
assert.equal(states.at(-1).status,"loading");assert.equal(states.at(-1).field,first,"refresh retains original field while updating");
run=scheduled();const second={...first,fieldId:"second",validTime:"2026-09-20T00:00:00Z"};pending.at(-1).resolve(second);await run;
assert.equal(states.at(-1).field,second,"refresh success replaces field");
controller.schedule(a,["currents"]);run=scheduled();pending.at(-1).reject(new Error("Provider timed out"));await run;
const degraded=states.at(-1);
assert.equal(degraded.status,"degraded");assert.equal(degraded.field,second);assert.equal(degraded.reason,"Provider timed out");
assert.equal(degraded.field.provenance,first.provenance);
assert.equal(degraded.field.ageHours,first.ageHours);
assert.equal(degraded.field.provider,first.provider);assert.equal(degraded.field.dataset,first.dataset);
assert.equal(degraded.field.coverage,first.coverage);
const text=fieldStatusText("currents",degraded,Date.parse("2026-09-24T00:00:00Z"));
assert.match(text,/degraded; retained field/);assert.match(text,/2026-09-20 00:00 UTC/);assert.match(text,/96h old/);assert.match(text,/Provider timed out/);
assert.equal(JSON.stringify(first),original,"field metadata never mutated");
controller.schedule(a,["currents"]);run=scheduled();pending.at(-1).resolve({status:"unavailable",reason:"No valid cells"});await run;
assert.equal(states.at(-1).status,"degraded");assert.equal(states.at(-1).field,second);
assert.match(states.at(-1).reason,/No valid cells/);
// Start another refresh, then change viewport before it completes.
controller.schedule(a,["currents"]);const oldRun=scheduled();const oldRequest=pending.at(-1);
controller.schedule(b,["currents"]);
assert.equal(oldRequest.signal.aborted,true);assert.equal(states.at(-1).field,null,"new viewport clears old field before debounce");
assert.notEqual(states.at(-1).contextKey,degraded.contextKey);
oldRequest.resolve(first);await oldRun;assert.equal(states.at(-1).field,null,"late old viewport response ignored");
run=scheduled();pending.at(-1).reject(new Error("New viewport unavailable"));await run;
assert.equal(states.at(-1).status,"unavailable");assert.equal(states.at(-1).field,null);
controller.schedule(b,["currents"]);run=scheduled();pending.at(-1).resolve(first);await run;
controller.schedule({...b,currentDensity:20},["currents"]);
assert.equal(states.at(-1).field,null,"density is part of field context");
const cancelledTimer=scheduled();const cancelledRequest=pending.at(-1);const stateCount=states.length;
controller.cancel();assert.equal(cancelledRequest.signal.aborted,true);cancelledRequest.resolve(second);await cancelledTimer;
assert.equal(states.length,stateCount,"cancelled response cannot publish");
controller.schedule(b,["currents"]);const queued=scheduled;controller.dispose();await queued();
assert.equal(pending.at(-1),cancelledRequest,"disposed queued callback cannot issue a request");
console.log("PASS initial/refresh success, retained degraded failure, unchanged provenance/time, viewport/density identity, late-response rejection and cancellation");

// Presentation invalidation is silent, exact-context and independent per layer.
let next;
const emitted=[],queue=[];
const invalidation=createViewportFieldRequests({setTimer:fn=>(next=fn,1),clearTimer:()=>{},
  request:(layer)=>new Promise((resolve,reject)=>queue.push({layer,resolve,reject})),
  onState:(layer,state)=>emitted.push({layer,...state})});
const keyA=JSON.stringify(a),keyB=JSON.stringify(b);
const sibling={...first,fieldId:"sibling"};
async function settle(viewport,fail=false){
  invalidation.schedule(viewport,["currents","bathymetry"]);const execution=next();
  for(const item of queue.splice(0))fail?item.reject(new Error("transport")):item.resolve(item.layer==="currents"?first:sibling);
  await execution;
}
await settle(a);
const count=emitted.length,unchanged=JSON.stringify(first);
invalidation.invalidate("currents",keyA);invalidation.invalidate("currents",keyA);
invalidation.invalidate("missing",keyA);
assert.equal(emitted.length,count,"invalidation never publishes");
assert.equal(JSON.stringify(first),unchanged,"invalidation never mutates field");
await settle(a,true);
assert.equal(emitted.at(-2).field,null);assert.equal(emitted.at(-2).status,"unavailable");
assert.equal(emitted.at(-1).field,sibling);assert.equal(emitted.at(-1).status,"degraded");
await settle(b);invalidation.invalidate("currents",keyA);
await settle(b,true);
assert.equal(emitted.at(-2).field,first,"old context cannot clear new context");
assert.equal(emitted.at(-2).status,"degraded");
invalidation.invalidate("currents",keyB);await settle(b,true);
assert.equal(emitted.at(-2).field,null,"matching new context removed");
assert.equal(emitted.at(-1).field,sibling,"sibling retained");
invalidation.dispose();invalidation.invalidate("currents",keyB);
console.log("PASS exact-context per-layer invalidation, stale-context safety, idempotence, silent/nonmutating invalidation and no rejected-field retention");

// Successful unusable envelopes are distinct from transport/provider failures.
let malformedTimer;
const malformedStates=[],malformedQueue=[];
const malformed=createViewportFieldRequests({setTimer:fn=>(malformedTimer=fn,1),clearTimer:()=>{},
  request:layer=>new Promise((resolve,reject)=>malformedQueue.push({layer,resolve,reject})),
  onState:(layer,state)=>malformedStates.push({layer,...state})});
async function malformedRun(viewport,value,fail=false){
  malformed.schedule(viewport,["currents","bathymetry"]);const execution=malformedTimer();
  for(const item of malformedQueue.splice(0))fail?item.reject(new Error("genuine transport")):item.resolve(item.layer==="currents"?value:sibling);
  await execution;
}
for(const unusable of [null,undefined,false,0,"bad",[],{}, {status:"unknown"}]){
  await malformedRun(a,first);await malformedRun(a,unusable);
  assert.equal(malformedStates.at(-2).status,"malformed-success");
  assert.equal(malformedStates.at(-2).field,null);
  assert.equal(malformedStates.at(-2).contextKey,keyA);
  assert.equal(malformedStates.at(-1).field,sibling);
  await malformedRun(a,null,true);
  assert.equal(malformedStates.at(-2).status,"unavailable");assert.equal(malformedStates.at(-2).field,null);
  assert.equal(malformedStates.at(-1).status,"degraded");assert.equal(malformedStates.at(-1).field,sibling);
}
await malformedRun(a,first);await malformedRun(a,{status:"unavailable",reason:"provider unavailable"});
assert.equal(malformedStates.at(-2).status,"degraded");assert.equal(malformedStates.at(-2).field,first);
malformed.schedule(a,["currents"]);const obsoleteNull=malformedTimer(),obsolete=malformedQueue.pop();
await malformedRun(b,second);const beforeLate=malformedStates.length;
obsolete.resolve(null);await obsoleteNull;assert.equal(malformedStates.length,beforeLate);
await malformedRun(b,null,true);assert.equal(malformedStates.at(-2).field,second);
assert.equal(malformedStates.at(-2).status,"degraded","obsolete malformed success cannot invalidate newer retention");
malformed.dispose();
console.log("PASS malformed-success envelope classification, null/primitives/arrays/status, sibling locality, provider retention and obsolete-null protection");
