import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {resolvePeloraApiUrl} from "../../utils/peloraApi.js";
import * as presentation from "../../utils/oceanFieldPresentation.js";
import {observationImages} from "../../utils/mapObservationDisplay.js";
import {createViewportFieldRequests} from "../../utils/viewportFieldRequests.js";
let styleLoaded=false,state={};
let effectFns=[],effectSlots=[],effectCursor=0;const timers=new Map(),readyTimers=new Map(),refreshTimers=new Map();let timerId=0;
const scheduled=async()=>{const callbacks=[...timers.values()];timers.clear();await Promise.all(callbacks.map(fn=>fn()));};
const effect=()=>{for(const {fn,deps,index} of effectFns){const old=effectSlots[index];
  if(!old||deps.some((dep,i)=>dep!==old.deps[i])){old?.cleanup?.();effectSlots[index]={deps,cleanup:fn()};}}
  effectFns=[];return()=>{effectSlots.forEach(slot=>slot?.cleanup?.());effectSlots=[];};};let requests=0,sourceAdds=0;
const sources=new Map(),images=new Set(),events=new Map();
function eventHandlers(n){if(!events.has(n)){const handlers=new Set();const emit=()=>{for(const fn of [...handlers])fn();};emit.handlers=handlers;events.set(n,emit);}return events.get(n).handlers;}
const layers=[{id:"ocean",type:"fill"},{id:"structure-clusters",type:"symbol"},{id:"pelora-ranked-targets",type:"symbol"}];
const map={getStyle:()=>({layers}),isStyleLoaded:()=>styleLoaded,getSource:id=>sources.get(id),
  addSource(id,s){sourceAdds++;sources.set(id,{...s,prepare(){},setData(data){this.data=data;},updateImage(image){Object.assign(this,image);}});},
  removeSource:id=>sources.delete(id),removeLayer:id=>{const i=layers.findIndex(l=>l.id===id);if(i>=0)layers.splice(i,1);},
  getLayer:id=>layers.find(l=>l.id===id),addLayer(l,before){const i=layers.findIndex(v=>v.id===before);layers.splice(i<0?layers.length:i,0,l);},
  moveLayer(id,before){const i=layers.findIndex(l=>l.id===id),[l]=layers.splice(i,1);layers.splice(layers.findIndex(v=>v.id===before),0,l);},
  setLayoutProperty(id,k,v){const l=layers.find(l=>l.id===id);l.layout={...l.layout,[k]:v};},
  hasImage:id=>images.has(id),addImage:id=>images.add(id),
  on(n,fn){eventHandlers(n).add(fn);},once(n,fn){eventHandlers(n).add(fn);},off(n,fn){const handlers=events.get(n)?.handlers;handlers?.delete(fn);if(handlers?.size===0)events.delete(n);},
  getBounds:()=>({getWest:()=>-90,getEast:()=>-89,getSouth:()=>27,getNorth:()=>28}),getZoom:()=>5};
const current={freshness:{maxFreshAgeHours:96},contractVersion:"pelora-spatial-field-v1",layer:"currents",fieldId:"recorded",status:"stale",validTime:"2026-09-19T00:00:00Z",bounds:[-90,27,-89,28],resolution:{deliveredDegrees:.25},coverage:{validCells:1,returnedCells:1},payloadType:"geostrophic-vector-grid",payload:{type:"geostrophic-vector-grid",coordinateOrder:"longitude,latitude,u,v",directionConvention:"degrees-toward",interpolation:"none",cells:[[-89.875,27.125,-0.291,0.948]]}};
const bathy={validTime:null,freshness:{maxFreshAgeHours:null},contractVersion:"pelora-spatial-field-v1",layer:"bathymetry",fieldId:"bathy",status:"static",bounds:[-90,27,-89,28],resolution:{deliveredDegrees:1},coverage:{validCells:1,returnedCells:1},payloadType:"rectilinear-elevation-grid",payload:{type:"rectilinear-elevation-grid",order:"latitude-ascending-rows,longitude-ascending-columns",positive:"up",longitudes:[-89.5],latitudes:[27.5],values:[-100]}};
const context=vm.createContext({...presentation,observationImages,resolvePeloraApiUrl,URLSearchParams,
  useEffect:(fn,deps)=>{effectFns.push({fn,deps,index:effectCursor++});},window:{setInterval:fn=>{const id=++timerId;refreshTimers.set(id,fn);return id;},clearInterval:id=>refreshTimers.delete(id),setTimeout:fn=>{const id=++timerId;readyTimers.set(id,fn);return id;},clearTimeout:id=>readyTimers.delete(id)},
  bathymetryImage:()=>({url:"data:image/png;base64,test",coordinates:[[-90,28],[-89,28],[-89,27],[-90,27]]}),
  createViewportFieldRequests:options=>createViewportFieldRequests({...options,setTimer:fn=>{const id=++timerId;timers.set(id,fn);return id;},clearTimer:id=>timers.delete(id)}),
  fetch:async url=>{requests++;return{ok:true,text:async()=>JSON.stringify(url.includes("layer=bathymetry")?bathy:current)};}
});
const source=fs.readFileSync(new URL("../useMapLibreOceanFields.js",import.meta.url),"utf8")
  .replace(/^import[\s\S]*?;\r?\n/gm,"").replace("export function","function");
vm.runInContext(source,context);
const renderHook=context.useMapLibreOceanFields;context.useMapLibreOceanFields=props=>{effectCursor=0;renderHook(props);};
const props={mapRef:{current:map},bathymetry:true,currentField:true,onFieldStatus:update=>{state=typeof update==="function"?update(state):update;}};
context.useMapLibreOceanFields(props);let cleanup=effect();assert.equal(requests,0);
styleLoaded=true;events.get("load")();await scheduled();
assert.equal(requests,2);assert.equal(sourceAdds,2);assert.equal(state.currents.field.validTime,current.validTime);
assert.equal(sources.get(presentation.FIELD_SOURCE.currents).data.features.length,1);
assert.ok(layers.findIndex(l=>l.id===presentation.FIELD_LAYER.bathymetry)<layers.findIndex(l=>l.id===presentation.FIELD_LAYER.currents));
assert.ok(layers.findIndex(l=>l.id===presentation.FIELD_LAYER.currents)<layers.findIndex(l=>l.id==="structure-clusters"));
events.get("moveend")();await scheduled();assert.equal(sourceAdds,2,"viewport changes reuse sources");
const retainedCurrent=state.currents.field,retainedBathy=state.bathymetry.field;
// Same-viewport failures must retain both rendered layers and original metadata.
context.fetch=async()=>{throw new Error("temporary provider timeout");};
events.get("moveend")();
assert.equal(state.currents.status,"loading");assert.equal(state.currents.field,retainedCurrent);
assert.equal(sources.get(presentation.FIELD_SOURCE.currents).data.features.length,1);
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");
await scheduled();
assert.equal(state.currents.status,"degraded");assert.equal(state.currents.field,retainedCurrent);
assert.equal(state.bathymetry.status,"degraded");assert.equal(state.bathymetry.field,retainedBathy);
assert.match(state.currents.reason,/timeout/);
assert.equal(map.getLayer(presentation.FIELD_LAYER.currents).layout.visibility,"visible");
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");
// Rejection must clear rendering and cache without affecting the sibling.
const originalCanvas=context.bathymetryImage;
const transport=(badLayer,bad)=>async url=>({ok:true,text:async()=>JSON.stringify(url.includes("layer=bathymetry")?(badLayer==="bathymetry"?bad:bathy):(badLayer==="currents"?bad:current))});
async function refresh(){events.get("moveend")();await scheduled();}
async function restore(){context.bathymetryImage=originalCanvas;context.fetch=transport();await refresh();
  assert.equal(JSON.stringify(state.currents.field),JSON.stringify(current));assert.equal(JSON.stringify(state.bathymetry.field),JSON.stringify(bathy));}
function absent(layer){assert.equal(state[layer].status,"unavailable");assert.equal(state[layer].field,null);
  assert.ok(!map.getLayer(presentation.FIELD_LAYER[layer])||map.getLayer(presentation.FIELD_LAYER[layer]).layout.visibility==="none");
  if(layer==="currents")assert.equal(sources.get(presentation.FIELD_SOURCE.currents)?.data.features.length??0,0);}
// Actual syntax decoding at the hook request boundary, not a fake parse error.
const rawResponse=(body,ok=true,status=200)=>{let reads=0;return {ok,status,
  json:async()=>JSON.parse(body),text:async()=>{assert.equal(++reads,1,"body consumed once");return body;}};};
for(const body of ['{"privateFixture":',""]){
  await restore();const siblingSource=sources.get(presentation.FIELD_SOURCE.bathymetry);
  context.fetch=async url=>url.includes("layer=bathymetry")?rawResponse(JSON.stringify(bathy)):rawResponse(body);
  await refresh();absent("currents");assert.equal(state.bathymetry.field.fieldId,bathy.fieldId);
  assert.equal(sources.get(presentation.FIELD_SOURCE.bathymetry),siblingSource);
  assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");
  assert.equal(state.currents.reason,"Malformed successful field response");
  assert.ok(!state.currents.reason.includes("privateFixture"));
  styleLoaded=false;events.get("style.load")();const syntaxIdle=events.get("idle");
  styleLoaded=true;syntaxIdle();assert.equal(sources.get(presentation.FIELD_SOURCE.currents).data.features.length,0);
  await scheduled();absent("currents");
  context.fetch=async()=>{throw new Error("transport after invalid JSON");};
  events.get("style.load")();await scheduled();absent("currents");
  assert.equal(state.bathymetry.status,"degraded");assert.equal(state.bathymetry.field.fieldId,bathy.fieldId);
  await restore();assert.equal(state.currents.field.fieldId,current.fieldId);
  assert.equal(map.getLayer(presentation.FIELD_LAYER.currents).layout.visibility,"visible");
}
// Read errors are not parse errors, including misleading error names.
await restore();const priorReadField=state.currents.field;
context.fetch=async url=>url.includes("layer=bathymetry")?rawResponse(JSON.stringify(bathy)):
  {ok:true,text:async()=>{throw new SyntaxError("controlled body-stream failure");}};
await refresh();assert.equal(state.currents.status,"degraded");assert.equal(state.currents.field,priorReadField);
assert.equal(state.currents.reason,"controlled body-stream failure");
// HTTP errors retain valid data whether their body is JSON, non-JSON, or unreadable.
for(const response of [rawResponse("<error-page>",false,502),
  {ok:false,status:503,text:async()=>{throw new SyntaxError("unreadable error body");}},
  rawResponse(JSON.stringify({reason:"controlled HTTP rejection"}),false,400)]){
  await restore();const prior=state.currents.field;
  context.fetch=async url=>url.includes("layer=bathymetry")?rawResponse(JSON.stringify(bathy)):response;
  await refresh();assert.equal(state.currents.status,"degraded");assert.equal(state.currents.field,prior);
  assert.equal(state.currents.reason,response.status===400?"controlled HTTP rejection":"Field request "+response.status);
}
await restore();const providerPrior=state.currents.field;
context.fetch=async url=>rawResponse(JSON.stringify(url.includes("layer=bathymetry")?bathy:{status:"unavailable",reason:"provider no data"}));
await refresh();assert.equal(state.currents.status,"degraded");assert.equal(state.currents.field,providerPrior);
assert.equal(state.currents.reason,"provider no data");
function deferredBody(abortable=false){
  let resolve,reject,started;
  let reads=0;const body=new Promise((yes,no)=>{resolve=yes;reject=no;});const reading=new Promise(yes=>{started=yes;});
  context.fetch=async(url,{signal})=>url.includes("layer=bathymetry")?rawResponse(JSON.stringify(bathy)):
    {ok:true,text:()=>{assert.equal(++reads,1,"deferred body consumed once");started();if(abortable)signal.addEventListener("abort",()=>{const error=new Error("body read aborted");error.name="AbortError";reject(error);},{once:true});return body;}};
  return {reading,resolve,reject};
}
await restore();let pendingBody=deferredBody(true);events.get("moveend")();let pendingRead=scheduled();await pendingBody.reading;
events.get("movestart")();const afterAbort=state;await pendingRead;assert.equal(state,afterAbort,"abort publishes nothing after cancellation");
context.fetch=async()=>{throw new Error("transport after body abort");};await refresh();
assert.equal(state.currents.status,"degraded");assert.equal(state.currents.field,afterAbort.currents.field,"body abort does not invalidate prior retention");
await restore();pendingBody=deferredBody();events.get("moveend")();pendingRead=scheduled();await pendingBody.reading;
const originalZoom=map.getZoom;map.getZoom=()=>7;
const newer={...current,fieldId:"newer-decoding-context"};context.fetch=transport("currents",newer);await refresh();
const newerState=state,newerField=state.currents.field;
pendingBody.resolve('{"obsoleteFixture":');await pendingRead;
assert.equal(state,newerState,"obsolete parse completion publishes nothing");
context.fetch=async()=>{throw new Error("new context transport");};await refresh();
assert.equal(state.currents.status,"degraded");assert.equal(state.currents.field,newerField,"obsolete syntax result cannot erase newer retention");
map.getZoom=originalZoom;await restore();
console.log("PASS decoding matrix: invalid/empty JSON, read failure, HTTP error bodies, provider-unavailable, body abort, obsolete syntax and recovery");
// PELORA-04 P1: HTTP-success JSON null is rejection, never degraded retention.
await restore();assert.equal(map.getLayer(presentation.FIELD_LAYER.currents).layout.visibility,"visible");
const nullSibling=sources.get(presentation.FIELD_SOURCE.bathymetry);
context.fetch=transport("currents",null);await refresh();absent("currents");
assert.equal(JSON.stringify(state.bathymetry.field),JSON.stringify(bathy));assert.equal(sources.get(presentation.FIELD_SOURCE.bathymetry),nullSibling);
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");
// Exercise deferred sync before any further request settles.
styleLoaded=false;events.get("style.load")();const nullIdle=events.get("idle");
assert.equal(state.currents.field,null);styleLoaded=true;nullIdle();
assert.equal(sources.get(presentation.FIELD_SOURCE.currents).data.features.length,0);
await scheduled();absent("currents");
context.fetch=async()=>{throw new Error("genuine transport after null");};
events.get("style.load")();await scheduled();absent("currents");
assert.match(state.currents.reason,/genuine transport/);
assert.equal(JSON.stringify(state.bathymetry.field),JSON.stringify(bathy));assert.equal(state.bathymetry.status,"degraded");
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");
console.log("PASS PELORA-04 P1 valid render -> HTTP-success null -> clear/unavailable -> idle/style -> transport failure without resurrection");
for(const [layer,bad] of [
  ["currents",{...current,contractVersion:"unsupported"}],
  ["currents",{...current,layer:"bathymetry"}],
  ["currents",{...current,fieldId:"rejected-cells-null",payload:{...current.payload,cells:null}}],
  ["currents",{...current,payload:{...current.payload,cells:[[0,0,"bad",1]]}}],
  ["bathymetry",{...bathy,payload:{...bathy.payload,longitudes:[-89.5,-89.5],values:[-100,-200]}}],
  ["bathymetry",{...bathy,payload:{...bathy.payload,values:[]}}],
  ["bathymetry",{...bathy,resolution:null}]
]){
  await restore();const sibling=layer==="currents"?"bathymetry":"currents";
  context.fetch=transport(layer,bad);await refresh();absent(layer);
  assert.equal(map.getLayer(presentation.FIELD_LAYER[sibling]).layout.visibility,"visible");
  context.fetch=async()=>{throw new Error("controlled transport");};
  events.get("style.load")();assert.equal(state[layer].field,null);await scheduled();absent(layer);
  assert.equal(state[sibling].status,"degraded");
}
// Canvas failure after a valid image must also discard the retained entry.
await restore();context.bathymetryImage=()=>{throw new Error("controlled canvas");};
await refresh();absent("bathymetry");assert.equal(JSON.stringify(state.currents.field),JSON.stringify(current));
context.bathymetryImage=originalCanvas;
context.fetch=async()=>{throw new Error("controlled transport");};await refresh();absent("bathymetry");
// Persistent source failures, including clearing through a failing source.
const sourceAdder=map.addSource;
await restore();map.addSource=(id,data)=>{if(id===presentation.FIELD_SOURCE.currents)throw new Error("current source unavailable");sourceAdder(id,data);};sources.get(presentation.FIELD_SOURCE.currents).setData=()=>{throw new Error("setData failed");};
await refresh();absent("currents");assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");
map.addSource=sourceAdder;await restore();map.addSource=(id,data)=>{if(id===presentation.FIELD_SOURCE.bathymetry)throw new Error("bathy source unavailable");sourceAdder(id,data);};sources.get(presentation.FIELD_SOURCE.bathymetry).updateImage=()=>{throw new Error("updateImage failed");};
await refresh();absent("bathymetry");assert.equal(map.getLayer(presentation.FIELD_LAYER.currents).layout.visibility,"visible");
map.addSource=sourceAdder;
// Idle application rejects the pending field, then style recreation cannot resurrect it.
await restore();styleLoaded=false;await refresh();assert.equal(state.currents.status,"loading");
const idle=events.get("idle");sources.get(presentation.FIELD_SOURCE.currents).setData=()=>{throw new Error("idle source failed");};
styleLoaded=true;idle();absent("currents");
context.fetch=async()=>{throw new Error("controlled transport");};
events.get("style.load")();await scheduled();absent("currents");
// Layout failure removes the affected layer when hiding also fails.
await restore();const layoutSetter=map.setLayoutProperty;
map.setLayoutProperty=(id,key,value)=>{if(id===presentation.FIELD_LAYER.currents)throw new Error("layout failed");layoutSetter(id,key,value);};
await refresh();absent("currents");assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");
map.setLayoutProperty=layoutSetter;
// A style rebuild and addSource failure affect only the rejected layer.
await restore();sources.clear();for(const id of Object.values(presentation.FIELD_LAYER))map.removeLayer(id);
const addSource=map.addSource;map.addSource=(id,data)=>{if(id===presentation.FIELD_SOURCE.currents)throw new Error("addSource failed");addSource(id,data);};
events.get("style.load")();await scheduled();absent("currents");
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");map.addSource=addSource;
// Direct layer-creation and arrow-image registration failures stay local.
await restore();const layerAdder=map.addLayer;
map.removeLayer(presentation.FIELD_LAYER.currents);
map.addLayer=(definition,before)=>{if(definition.id===presentation.FIELD_LAYER.currents)throw new Error("addLayer failed");layerAdder(definition,before);};
await refresh();absent("currents");assert.equal(JSON.stringify(state.bathymetry.field),JSON.stringify(bathy));
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");
map.addLayer=layerAdder;
await restore();const imageAdder=map.addImage;images.delete("pelora-field-current-arrow");
map.addImage=()=>{throw new Error("arrow image registration failed");};
await refresh();absent("currents");assert.equal(JSON.stringify(state.bathymetry.field),JSON.stringify(bathy));
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");
map.addImage=imageAdder;
console.log("PASS direct addLayer and arrow-image registration failure locality");
// Valid zeros retain source identity and success even when no arrow is drawn.
await restore();const zero={...current,fieldId:"zero",payload:{...current.payload,cells:[[-89.5,27.5,0,0]]}};
context.fetch=transport("currents",zero);await refresh();assert.equal(JSON.stringify(state.currents.field),JSON.stringify(zero));
assert.equal(state.currents.status,"stale");assert.equal(sources.get(presentation.FIELD_SOURCE.currents).data.features.length,0);
await restore();
console.log("PASS malformed replacement, canvas/source failures, style/idle rejection, cache invalidation, sibling locality and valid zero vectors");
context.fetch=async()=>{throw new Error("temporary provider timeout");};
// A new viewport must immediately stop representing the retained data as its field.
map.getBounds=()=>({getWest:()=>140,getEast:()=>141,getSouth:()=>-40,getNorth:()=>-39});
events.get("moveend")();
assert.equal(state.currents.field,null);assert.equal(state.bathymetry.field,null);
assert.equal(map.getLayer(presentation.FIELD_LAYER.currents).layout.visibility,"none");
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"none");
await scheduled();assert.equal(state.currents.status,"unavailable");
styleLoaded=false;events.get("moveend")();const disposedIdle=events.get("idle"),disposedRequest=scheduled;
cleanup();assert.equal(events.size,0);const disposedState=state;disposedIdle();await disposedRequest();assert.equal(state,disposedState);styleLoaded=true;
context.useMapLibreOceanFields({...props,bathymetry:false,currentField:false});cleanup=effect();
assert.ok(!map.getLayer(presentation.FIELD_LAYER.bathymetry)||map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility==="none");
assert.ok(!map.getLayer(presentation.FIELD_LAYER.currents)||map.getLayer(presentation.FIELD_LAYER.currents).layout.visibility==="none");cleanup();
console.log("PASS actual field hook style load, viewport requests, image/vector sources, layer order, reuse, toggles and cleanup");

// Disposal during body reading suppresses the eventual syntax-failure result.
context.useMapLibreOceanFields(props);cleanup=effect();context.fetch=transport();await scheduled();
pendingBody=deferredBody();events.get("moveend")();pendingRead=scheduled();await pendingBody.reading;
cleanup();const disposedSyntaxState=state;const disposedBuffer=sources.get(presentation.FIELD_SOURCE.currents).data;
pendingBody.resolve('{"disposedFixture":');await pendingRead;
assert.equal(state,disposedSyntaxState);assert.equal(sources.get(presentation.FIELD_SOURCE.currents).data,disposedBuffer);
assert.equal(events.size,0);
console.log("PASS disposed body-read syntax completion publishes nothing and preserves renderer identity");

// Toggle commits rerun only the changed layer's effect, as React dependencies do.
map.getBounds=()=>({getWest:()=>-90,getEast:()=>-89,getSouth:()=>27,getNorth:()=>28});
const calls=[];context.fetch=async url=>{calls.push(url.includes("layer=bathymetry")?"bathymetry":"currents");return rawResponse(JSON.stringify(url.includes("layer=bathymetry")?bathy:current));};
function commitProps(next){context.useMapLibreOceanFields({...props,...next});cleanup=effect();}
commitProps({});await scheduled();
for(const [offKey,sibling] of [["currentField","bathymetry"],["bathymetry","currents"]]){
  const preservedState=state[sibling],preservedSource=sources.get(presentation.FIELD_SOURCE[sibling]),preservedCalls=calls.filter(layer=>layer===sibling).length;
  commitProps({[offKey]:false});
  assert.equal(state[sibling],preservedState,"sibling state identity survives OFF");
  assert.equal(sources.get(presentation.FIELD_SOURCE[sibling]),preservedSource);
  assert.equal(timers.size,0,"OFF does not schedule sibling acquisition");
  commitProps({[offKey]:true});assert.equal(state[sibling],preservedState,"sibling state identity survives ON");
  await scheduled();assert.equal(state[sibling],preservedState);
  assert.equal(calls.filter(layer=>layer===sibling).length,preservedCalls,"no sibling transport caused by toggle");
  const enabledLayer=offKey==="bathymetry"?"bathymetry":"currents";
  assert.equal(state[enabledLayer].field.fieldId,enabledLayer==="bathymetry"?bathy.fieldId:current.fieldId);
  assert.equal(map.getLayer(presentation.FIELD_LAYER[enabledLayer]).layout.visibility,"visible");
}
cleanup();styleLoaded=false;
commitProps({});await scheduled();assert.equal(state.currents.status,"loading");assert.equal(state.bathymetry.status,"loading");
assert.ok(readyTimers.size>0,"style readiness has its own retry without movement");
styleLoaded=true;const capturedRefreshes=[...refreshTimers.values()];
const readinessCallbacks=[...readyTimers.values()];readyTimers.clear();readinessCallbacks.forEach(fn=>fn());
assert.equal(state.currents.status,current.status);assert.equal(state.bathymetry.status,bathy.status);
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");
cleanup();assert.equal(timers.size,0);assert.equal(readyTimers.size,0);assert.equal(refreshTimers.size,0);assert.equal(events.size,0);
const teardownState=state;readinessCallbacks.forEach(fn=>fn());capturedRefreshes.forEach(fn=>fn());
assert.equal(state,teardownState);assert.equal(timers.size,0);assert.equal(events.size,0,"captured readiness/refresh callbacks do not reattach after teardown");
console.log("PASS independent OFF/ON lifetimes, exact sibling state/source/cache preservation and startup acquisition/application without map movement");

commitProps({});await scheduled();const safeSiblingState=state.bathymetry;
const teardownLayout=map.setLayoutProperty;
map.setLayoutProperty=(id,key,value)=>{if(id===presentation.FIELD_LAYER.currents)throw new Error("teardown layout failure");teardownLayout(id,key,value);};
assert.doesNotThrow(()=>commitProps({currentField:false}));
assert.equal(state.bathymetry,safeSiblingState);assert.equal(state.currents.status,"off");
assert.ok(!map.getLayer(presentation.FIELD_LAYER.currents),"teardown removes a layer whose visibility update fails");
map.setLayoutProperty=teardownLayout;cleanup();assert.equal(events.size,0);assert.equal(refreshTimers.size,0);
console.log("PASS affected-layer teardown fallback without sibling reset or leaked lifecycle resources");

// A texture-binding failure follows the existing bathymetry-only rejection path.
commitProps({});await scheduled();const samplingSibling=state.currents;
const failingSamplerSource=sources.get(presentation.FIELD_SOURCE.bathymetry);
failingSamplerSource.texture={useMipmap:false,context:{gl:{NEAREST:9728,TEXTURE_2D:3553,TEXTURE_MIN_FILTER:10241,texParameteri(){}}},bind(){throw new Error("controlled texture binding failure");}};
failingSamplerSource.prepare();const staleBind=failingSamplerSource.texture.bind;
staleBind.call(failingSamplerSource.texture,9728,33071,9985);
absent("bathymetry");assert.equal(state.currents,samplingSibling);assert.match(state.bathymetry.reason,/texture binding/);
context.fetch=async()=>{throw new Error("transport after sampling failure");};await refresh();absent("bathymetry");
const afterSamplingFailure=state;staleBind.call(failingSamplerSource.texture,9728,33071,9985);
assert.equal(state,afterSamplingFailure,"detached texture callback cannot reject a later context");
cleanup();assert.equal(events.size,0);
console.log("PASS texture failure clears only bathymetry cache/rendering, preserves currents, and rejects detached callbacks");
