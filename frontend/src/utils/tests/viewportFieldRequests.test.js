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
