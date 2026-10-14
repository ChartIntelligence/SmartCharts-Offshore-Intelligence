import {createQaFieldTransport} from "../../utils/qaFieldTransport.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {resolvePeloraApiUrl} from "../../utils/peloraApi.js";
import * as flowPresentation from "../../utils/currentFlowPresentation.js";
import * as presentation from "../../utils/oceanFieldPresentation.js";
import {observationImages} from "../../utils/mapObservationDisplay.js";
import {createViewportFieldRequests} from "../../utils/viewportFieldRequests.js";
let styleLoaded=false,state={};
const refSlots=[];let refCursor=0;
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
const context=vm.createContext({...presentation,...flowPresentation,observationImages,resolvePeloraApiUrl,URLSearchParams,
  createQaFieldTransport:options=>createQaFieldTransport({...options,fetchPort:(...args)=>context.fetch(...args)}),
  useRef:value=>{const i=refCursor++;return refSlots[i]??(refSlots[i]={current:value});},
  useEffect:(fn,deps)=>{effectFns.push({fn,deps,index:effectCursor++});},window:{setInterval:fn=>{const id=++timerId;refreshTimers.set(id,fn);return id;},clearInterval:id=>refreshTimers.delete(id),setTimeout:fn=>{const id=++timerId;readyTimers.set(id,fn);return id;},clearTimeout:id=>readyTimers.delete(id)},
  bathymetryImage:()=>({url:"data:image/png;base64,test",coordinates:[[-90,28],[-89,28],[-89,27],[-90,27]]}),
  createViewportFieldRequests:options=>createViewportFieldRequests({...options,setTimer:fn=>{const id=++timerId;timers.set(id,fn);return id;},clearTimer:id=>timers.delete(id)}),
  fetch:async url=>{requests++;return{ok:true,text:async()=>JSON.stringify(url.includes("layer=bathymetry")?bathy:current)};}
});
const source=fs.readFileSync(process.env.PELORA_QA_AUTH_BASELINE_HOOK??new URL("../useMapLibreOceanFields.js",import.meta.url),"utf8")
  .replace(/^import[\s\S]*?;\r?\n/gm,"").replace("export function","function");
vm.runInContext(source,context);
const renderHook=context.useMapLibreOceanFields;context.useMapLibreOceanFields=props=>{effectCursor=0;refCursor=0;renderHook(props);};
const props={mapRef:{current:map},bathymetry:true,currentField:true,onFieldStatus:update=>{state=typeof update==="function"?update(state):update;}};
context.useMapLibreOceanFields(props);let cleanup=effect();assert.equal(requests,0);
styleLoaded=true;events.get("load")();await scheduled();
assert.equal(requests,2);assert.equal(sourceAdds,3);assert.equal(state.currents.field.validTime,current.validTime);
assert.equal(sources.get(presentation.FIELD_SOURCE.currents).data.features.length,1);
assert.ok(layers.findIndex(l=>l.id===presentation.FIELD_LAYER.bathymetry)<layers.findIndex(l=>l.id===presentation.FIELD_LAYER.currents));
assert.ok(layers.findIndex(l=>l.id===presentation.FIELD_LAYER.currents)<layers.findIndex(l=>l.id==="structure-clusters"));
for(const id of presentation.BATHYMETRY_CONTOUR_LAYERS)assert.ok(layers.findIndex(l=>l.id===id)<layers.findIndex(l=>l.id===presentation.FIELD_LAYER.currents));
events.get("moveend")();await scheduled();assert.equal(sourceAdds,3,"viewport changes reuse sources");
const retainedCurrent=state.currents.field,retainedBathy=state.bathymetry.field;
// Same-viewport failures must retain both rendered layers and original metadata.
context.fetch=async()=>{throw new Error("temporary provider timeout");};
[...refreshTimers.values()].forEach(fn=>fn());
assert.equal(state.currents.status,"loading");assert.equal(state.currents.field,retainedCurrent);
assert.equal(sources.get(presentation.FIELD_SOURCE.currents).data.features.length,1);
assert.equal(map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility,"visible");
await scheduled();
assert.equal(state.currents.status,"degraded");assert.equal(state.currents.field,retainedCurrent);
assert.equal(state.bathymetry.status,"degraded");assert.equal(state.bathymetry.field,retainedBathy);
assert.match(state.currents.reason,/timeout/);
assert.equal(map.getLayer(presentation.FIELD_LAYER.currents).layout.visibility,"visible");
assert.equal(map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility,"visible");
// Rejection must clear rendering and cache without affecting the sibling.
const originalCanvas=context.bathymetryImage;
const transport=(badLayer,bad)=>async url=>({ok:true,text:async()=>JSON.stringify(url.includes("layer=bathymetry")?(badLayer==="bathymetry"?bad:bathy):(badLayer==="currents"?bad:current))});
async function refresh(){[...refreshTimers.values()].forEach(fn=>fn());await scheduled();}
async function restore(){context.bathymetryImage=originalCanvas;context.fetch=transport();await refresh();
  assert.equal(JSON.stringify(state.currents.field),JSON.stringify(current));assert.equal(JSON.stringify(state.bathymetry.field),JSON.stringify(bathy));}
function absent(layer){assert.equal(state[layer].status,"unavailable");assert.equal(state[layer].field,null);
  assert.ok(!map.getLayer(presentation.FIELD_LAYER[layer])||map.getLayer(presentation.FIELD_LAYER[layer]).layout.visibility==="none");
  if(layer==="currents")assert.equal(sources.get(presentation.FIELD_SOURCE.currents)?.data.features.length??0,0);
  else {for(const id of presentation.BATHYMETRY_CONTOUR_LAYERS)assert.ok(!map.getLayer(id)||map.getLayer(id).layout.visibility==="none");
    assert.equal(sources.get(presentation.BATHYMETRY_CONTOUR_SOURCE)?.data.features.length??0,0);}}
// Actual syntax decoding at the hook request boundary, not a fake parse error.
const rawResponse=(body,ok=true,status=200)=>{let reads=0;return {ok,status,
  json:async()=>JSON.parse(body),text:async()=>{assert.equal(++reads,1,"body consumed once");return body;}};};
for(const body of ['{"privateFixture":',""]){
  await restore();const siblingSource=sources.get(presentation.FIELD_SOURCE.bathymetry);
  context.fetch=async url=>url.includes("layer=bathymetry")?rawResponse(JSON.stringify(bathy)):rawResponse(body);
  await refresh();absent("currents");assert.equal(state.bathymetry.field.fieldId,bathy.fieldId);
  assert.equal(sources.get(presentation.FIELD_SOURCE.bathymetry),siblingSource);
  assert.equal(map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility,"visible");
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
assert.equal(map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility,"visible");
// Exercise deferred sync before any further request settles.
styleLoaded=false;events.get("style.load")();const nullIdle=events.get("idle");
assert.equal(state.currents.field,null);styleLoaded=true;nullIdle();
assert.equal(sources.get(presentation.FIELD_SOURCE.currents).data.features.length,0);
await scheduled();absent("currents");
context.fetch=async()=>{throw new Error("genuine transport after null");};
events.get("style.load")();await scheduled();absent("currents");
assert.match(state.currents.reason,/genuine transport/);
assert.equal(JSON.stringify(state.bathymetry.field),JSON.stringify(bathy));assert.equal(state.bathymetry.status,"degraded");
assert.equal(map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility,"visible");
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
  assert.equal(map.getLayer((sibling==="bathymetry"?presentation.BATHYMETRY_CONTOUR_LAYERS[1]:presentation.FIELD_LAYER[sibling])).layout.visibility,"visible");
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
await refresh();absent("currents");assert.equal(map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility,"visible");
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
await refresh();absent("currents");assert.equal(map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility,"visible");
map.setLayoutProperty=layoutSetter;
// A style rebuild and addSource failure affect only the rejected layer.
await restore();sources.clear();for(const id of Object.values(presentation.FIELD_LAYER))map.removeLayer(id);
const addSource=map.addSource;map.addSource=(id,data)=>{if(id===presentation.FIELD_SOURCE.currents)throw new Error("addSource failed");addSource(id,data);};
events.get("style.load")();await scheduled();absent("currents");
assert.equal(map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility,"visible");map.addSource=addSource;
// Direct layer-creation and arrow-image registration failures stay local.
await restore();const layerAdder=map.addLayer;
map.removeLayer(presentation.FIELD_LAYER.currents);
map.addLayer=(definition,before)=>{if(definition.id===presentation.FIELD_LAYER.currents)throw new Error("addLayer failed");layerAdder(definition,before);};
await refresh();absent("currents");assert.equal(JSON.stringify(state.bathymetry.field),JSON.stringify(bathy));
assert.equal(map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility,"visible");
map.addLayer=layerAdder;
await restore();const imageAdder=map.addImage;images.delete("pelora-field-current-arrow");
map.addImage=()=>{throw new Error("arrow image registration failed");};
await refresh();absent("currents");assert.equal(JSON.stringify(state.bathymetry.field),JSON.stringify(bathy));
assert.equal(map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility,"visible");
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
assert.equal(map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility,"none");
await scheduled();assert.equal(state.currents.status,"unavailable");
styleLoaded=false;events.get("moveend")();const disposedIdle=events.get("idle"),disposedRequest=scheduled;
cleanup();assert.equal(events.size,0);const disposedState=state;disposedIdle();await disposedRequest();assert.equal(state,disposedState);styleLoaded=true;
context.useMapLibreOceanFields({...props,bathymetry:false,currentField:false});cleanup=effect();
assert.ok(!map.getLayer(presentation.FIELD_LAYER.bathymetry)||map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility==="none");
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
  assert.equal(map.getLayer((enabledLayer==="bathymetry"?presentation.BATHYMETRY_CONTOUR_LAYERS[1]:presentation.FIELD_LAYER[enabledLayer])).layout.visibility,"visible");
}
cleanup();styleLoaded=false;
commitProps({});await scheduled();assert.equal(state.currents.status,"loading");assert.equal(state.bathymetry.status,"loading");
assert.ok(readyTimers.size>0,"style readiness has its own retry without movement");
styleLoaded=true;const capturedRefreshes=[...refreshTimers.values()];
const readinessCallbacks=[...readyTimers.values()];readyTimers.clear();readinessCallbacks.forEach(fn=>fn());
assert.equal(state.currents.status,current.status);assert.equal(state.bathymetry.status,bathy.status);
assert.equal(map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility,"visible");
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
context.fetch=transport();commitProps({});await scheduled();
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"none","internal raster is not captain presentation");
const contourSibling=state.currents;
const contourSource=sources.get(presentation.BATHYMETRY_CONTOUR_SOURCE);
contourSource.setData=()=>{throw new Error("controlled contour source failure");};
const contourAdder=map.addSource;
map.addSource=(id,data)=>{if(id===presentation.BATHYMETRY_CONTOUR_SOURCE)throw new Error("controlled contour source failure");contourAdder(id,data);};
await refresh();absent("bathymetry");assert.equal(JSON.stringify(state.currents.field),JSON.stringify(contourSibling.field));
context.fetch=async()=>{throw new Error("transport after contour rejection");};
events.get("style.load")();await scheduled();absent("bathymetry");map.addSource=contourAdder;cleanup();assert.equal(events.size,0);
console.log("PASS hidden retained raster, contour failure clearing/invalidation and sibling preservation");
context.fetch=transport();commitProps({});await scheduled();
const contourConverter=context.bathymetryContours;
context.bathymetryContours=()=>{throw new Error("Bathymetry contour presentation exceeds complexity limit");};
await refresh();absent("bathymetry");assert.equal(state.currents.field.fieldId,current.fieldId);
context.bathymetryContours=contourConverter;context.fetch=async()=>{throw new Error("transport after complexity rejection");};
events.get("style.load")();await scheduled();absent("bathymetry");cleanup();
console.log("PASS contour conversion/complexity rejection is fail-closed and cannot restore rejected bathymetry");

// Static display continuity is not changed-context request-cache retention.
const continuous={...bathy,fieldId:"SYNTHETIC-STATIC-CONTINUITY",provider:"SYNTHETIC TEST EVIDENCE",dataset:"controlled-static-v1",
  coverage:{returnedCells:9,validCells:9},resolution:{deliveredDegrees:.3},
  payload:{...bathy.payload,longitudes:[-89.9,-89.6,-89.3],latitudes:[27.1,27.4,27.7],values:[-50,-500,-1500,-500,-1500,-2500,-1500,-2500,-3500]}};
context.fetch=transport("bathymetry",continuous);commitProps({});await scheduled();
// Identical static camera context avoids bathymetry transport/conversion; currents refresh normally.
let bathyReads=0,currentReads=0;context.fetch=async url=>{if(url.includes("layer=bathymetry"))bathyReads++;else currentReads++;
  return rawResponse(JSON.stringify(url.includes("layer=bathymetry")?continuous:current));};
const unchangedState=state.bathymetry,unchangedData=sources.get(presentation.BATHYMETRY_CONTOUR_SOURCE).data;
events.get("moveend")();await scheduled();assert.equal(bathyReads,0);assert.equal(currentReads,1);
assert.equal(state.bathymetry,unchangedState);assert.equal(sources.get(presentation.BATHYMETRY_CONTOUR_SOURCE).data,unchangedData);
[...refreshTimers.values()].forEach(fn=>fn());await scheduled();assert.equal(bathyReads,1,"periodic refresh remains eligible");
assert.equal(currentReads,2);
context.fetch=async()=>{throw new Error("controlled periodic failure");};[...refreshTimers.values()].forEach(fn=>fn());await scheduled();
assert.equal(state.bathymetry.status,"degraded");context.fetch=transport("bathymetry",continuous);
events.get("moveend")();await scheduled();assert.equal(state.bathymetry.status,"static","camera may recover degraded static state in the same context");
console.log("PASS exact-context static camera deduplication with independent current and forced periodic refresh");
const displaySource=sources.get(presentation.BATHYMETRY_CONTOUR_SOURCE),displayData=displaySource.data;
const displayContext=state.bathymetry.contextKey,displayField=state.bathymetry.field,displayLayer=map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]);
let conversionCalls=0;context.bathymetryContours=field=>{conversionCalls++;return contourConverter(field);};
map.getBounds=()=>({getWest:()=>-89.85,getEast:()=>-89.35,getSouth:()=>27.15,getNorth:()=>27.65});
events.get("movestart")();events.get("moveend")();
assert.equal(state.bathymetry.status,"static");assert.equal(state.bathymetry.field,displayField);
assert.equal(state.bathymetry.contextKey,displayContext);assert.notEqual(state.bathymetry.requestedContextKey,displayContext);
assert.equal(state.bathymetry.displayContextKey,displayContext);assert.equal(state.bathymetry.refreshing,true);
assert.equal(displaySource.data,displayData);assert.equal(displayLayer.layout.visibility,"visible");assert.equal(conversionCalls,0);
let releaseZoom;context.fetch=async url=>url.includes("layer=bathymetry")?await new Promise(resolve=>{releaseZoom=resolve;}):rawResponse(JSON.stringify(current));
const zoomPending=scheduled();await Promise.resolve();assert.equal(displaySource.data,displayData);assert.equal(displayLayer.layout.visibility,"visible");
releaseZoom(rawResponse(JSON.stringify({...continuous,fieldId:"SYNTHETIC-STATIC-REPLACEMENT"})));await zoomPending;
assert.equal(sources.get(presentation.BATHYMETRY_CONTOUR_SOURCE),displaySource);assert.equal(map.getLayer(displayLayer.id),displayLayer);
assert.equal(state.bathymetry.field.fieldId,"SYNTHETIC-STATIC-REPLACEMENT");assert.equal(state.bathymetry.refreshing,undefined);
assert.equal(conversionCalls,1);assert.notEqual(displaySource.data,displayData);
const staticPending=[];context.fetch=async url=>url.includes("layer=bathymetry")?await new Promise(resolve=>staticPending.push(resolve)):rawResponse(JSON.stringify(current));
map.getBounds=()=>({getWest:()=>-89.8,getEast:()=>-89.4,getSouth:()=>27.2,getNorth:()=>27.6});
events.get("moveend")();const obsoleteStatic=scheduled();await Promise.resolve();
map.getBounds=()=>({getWest:()=>-89.75,getEast:()=>-89.45,getSouth:()=>27.25,getNorth:()=>27.55});
events.get("moveend")();const currentStatic=scheduled();await Promise.resolve();
staticPending[1](rawResponse(JSON.stringify({...continuous,fieldId:"SYNTHETIC-NEWER-STATIC"})));await currentStatic;
const newerStaticState=state.bathymetry,newerStaticData=displaySource.data;
staticPending[0](rawResponse('null'));await obsoleteStatic;
assert.equal(state.bathymetry,newerStaticState);assert.equal(displaySource.data,newerStaticData);
assert.equal(newerStaticState.field.fieldId,"SYNTHETIC-NEWER-STATIC");
// Geographic/style readiness during a zoom replacement must not publish a
// loading flash or claim the unapplied new field as already displayed.
styleLoaded=false;map.getBounds=()=>({getWest:()=>-89.7,getEast:()=>-89.5,getSouth:()=>27.3,getNorth:()=>27.5});
context.fetch=transport("bathymetry",{...continuous,fieldId:"SYNTHETIC-STYLE-PENDING"});
events.get("moveend")();await scheduled();assert.equal(state.bathymetry.status,"static");
assert.equal(state.bathymetry.field.fieldId,"SYNTHETIC-NEWER-STATIC");assert.equal(displaySource.data,newerStaticData);
styleLoaded=true;events.get("idle")();assert.equal(state.bathymetry.field.fieldId,"SYNTHETIC-STYLE-PENDING");
const appliedBeforeSupersede=displaySource.data;
styleLoaded=false;map.getBounds=()=>({getWest:()=>-89.68,getEast:()=>-89.52,getSouth:()=>27.32,getNorth:()=>27.48});
context.fetch=transport("bathymetry",{...continuous,fieldId:"SYNTHETIC-CONVERTED-NOT-APPLIED"});events.get("moveend")();await scheduled();
map.getBounds=()=>({getWest:()=>-89.66,getEast:()=>-89.54,getSouth:()=>27.34,getNorth:()=>27.46});
context.fetch=transport("bathymetry",{...continuous,fieldId:"SYNTHETIC-AFTER-SUPERSEDE"});events.get("moveend")();
styleLoaded=true;events.get("idle")();assert.equal(displaySource.data,appliedBeforeSupersede);
assert.equal(state.bathymetry.field.fieldId,"SYNTHETIC-STYLE-PENDING","unapplied obsolete geometry cannot masquerade as the displayed field");
await scheduled();assert.equal(state.bathymetry.field.fieldId,"SYNTHETIC-AFTER-SUPERSEDE");
const beforeEdition=sources.get(presentation.BATHYMETRY_CONTOUR_SOURCE);
styleLoaded=false;context.fetch=transport("bathymetry",{...continuous,fieldId:"SYNTHETIC-NEW-EDITION",productVersion:"controlled-edition-2"});
[...refreshTimers.values()].forEach(fn=>fn());await scheduled();assert.equal(state.bathymetry.status,"loading");
assert.equal(state.bathymetry.field.fieldId,"SYNTHETIC-NEW-EDITION");assert.equal(sources.get(presentation.BATHYMETRY_CONTOUR_SOURCE),undefined,
  "source/edition identity change clears the old display instead of relabeling its GPU geometry");
styleLoaded=true;events.get("idle")();assert.notEqual(sources.get(presentation.BATHYMETRY_CONTOUR_SOURCE),beforeEdition);
assert.equal(state.bathymetry.status,"static");
// An overlapping zoom-out keeps only old source-supported geometry pending.
map.getBounds=()=>({getWest:()=>-90.1,getEast:()=>-89.1,getSouth:()=>26.9,getNorth:()=>27.9});
context.fetch=async()=>{throw new Error("new-context transport unavailable");};events.get("moveend")();
assert.equal(state.bathymetry.status,"static");assert.equal(state.bathymetry.refreshing,true);
await scheduled();absent("bathymetry");assert.equal(sources.get(presentation.BATHYMETRY_CONTOUR_SOURCE).data.features.length,0);
// Rejection must also erase the display-retention buffer, not only helper cache.
context.fetch=transport("bathymetry",continuous);events.get("moveend")();await scheduled();
map.getBounds=()=>({getWest:()=>-89.8,getEast:()=>-89.4,getSouth:()=>27.2,getNorth:()=>27.6});
context.fetch=transport("bathymetry",null);events.get("moveend")();assert.equal(state.bathymetry.status,"static");await scheduled();absent("bathymetry");
context.fetch=async()=>{throw new Error("after rejected zoom replacement");};events.get("moveend")();await scheduled();absent("bathymetry");
context.fetch=transport("bathymetry",continuous);events.get("moveend")();await scheduled();
map.getBounds=()=>({getWest:()=>140,getEast:()=>141,getSouth:()=>-40,getNorth:()=>-39});events.get("moveend")();
assert.equal(state.bathymetry.field,null);assert.equal(displayLayer.layout.visibility,"none");
cleanup();context.bathymetryContours=contourConverter;
console.log("PASS zoom-in/out display continuity, explicit original/display/request context identity, no loading conversion, same-source atomic replacement, disjoint clearing and rejection/failure non-resurrection");

// A synchronous animation rejection must not let the interrupted sync restore its old data.
map.getBounds=()=>({getWest:()=>-90,getEast:()=>-89,getSouth:()=>27,getNorth:()=>28});
context.fetch=transport();const originalTraceFactory=context.createCurrentTraceImage;
let lateTraceFailure;
context.createCurrentTraceImage=options=>{lateTraceFailure=options.onFailure;return {
  image:{width:32,height:32,data:new Uint8Array(4096)},
  setState(next){if(next?.field)options.onFailure(new Error("controlled trace setup rejection"),next.field);},clear(){},dispose(){}};};
commitProps({});await scheduled();absent("currents");assert.equal(state.bathymetry.status,"static");
assert.equal(sources.get(presentation.FIELD_SOURCE.currents).data.features.length,0);
cleanup();context.createCurrentTraceImage=originalTraceFactory;context.fetch=transport();commitProps({});await scheduled();
const recoveredTraceState=state.currents;lateTraceFailure(new Error("detached old trace failure"),current);
assert.equal(state.currents,recoveredTraceState,"disposed renderer callback cannot reject a new field lifetime");
assert.equal(sources.get(presentation.FIELD_SOURCE.currents).data.features.length,1);cleanup();
console.log("PASS synchronous trace rejection cannot restore rejected rendering and detached trace failure cannot invalidate a new layer lifetime");

images.delete(flowPresentation.CURRENT_TRACE_IMAGE);const traceAdder=map.addImage;
map.addImage=(id,image)=>{if(id===flowPresentation.CURRENT_TRACE_IMAGE)throw new Error("controlled trace image registration");traceAdder(id,image);};
context.fetch=transport();commitProps({});await scheduled();absent("currents");assert.equal(state.bathymetry.status,"static");
cleanup();map.addImage=traceAdder;
console.log("PASS trace image registration failure remains current-only and fail-closed");
import {environment as qaEnvironment,syntheticSession,syntheticBoundary,deferred as qaDeferred} from './qaFieldTransportFixtures.mjs';

// Actual hook + request helper + real QA HTTP boundary, all authority/data synthetic.
map.getBounds=()=>({getWest:()=>-90,getEast:()=>-89,getSouth:()=>27,getNorth:()=>28});styleLoaded=true;
context.resolvePeloraApiUrl=path=>resolvePeloraApiUrl(path,qaEnvironment);
context.createQaFieldTransport=options=>createQaFieldTransport({...options,environment:qaEnvironment,fetchPort:(...args)=>context.fetch(...args)});
const qaBoundary=await syntheticBoundary(layer=>layer==='bathymetry'?bathy:current);
let qaSession=syntheticSession();qaBoundary.setExpected(qaSession);
const qaFetch=(...args)=>qaBoundary.fetchPort(...args);context.fetch=qaFetch;
function qaCommit(next={}){commitProps({session:qaSession,...next});}
try{
  qaCommit();await scheduled();
  if(process.env.PELORA_QA_AUTH_BASELINE_HOOK)console.log('BASELINE QA boundary '+JSON.stringify({...qaBoundary.counts,bathymetry:state.bathymetry.status,currents:state.currents.status}));
  assert.equal(state.bathymetry.status,'static');assert.equal(state.currents.status,'stale');
  assert.equal(qaBoundary.counts.requests,2);assert.equal(qaBoundary.counts.authority,4);assert.equal(qaBoundary.counts.handler,2);
  const sourceIdentity=sources.get(presentation.FIELD_SOURCE.bathymetry),contourIdentity=sources.get(presentation.BATHYMETRY_CONTOUR_SOURCE),currentIdentity=sources.get(presentation.FIELD_SOURCE.currents);
  const adds=sourceAdds,acquisitions=qaBoundary.counts.requests,qaPriorBathy=state.bathymetry.field;
  qaSession={...qaSession,user:{...qaSession.user}};qaCommit();await scheduled();assert.equal(qaBoundary.counts.requests,acquisitions,'same credentials do not reacquire');
  qaSession=syntheticSession({claims:{exp:Math.floor(Date.now()/1000)+7200}});qaBoundary.setExpected(qaSession);
  qaCommit();assert.equal(state.bathymetry.field,qaPriorBathy);assert.equal(map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility,'visible');
  await scheduled();assert.equal(qaBoundary.counts.requests,acquisitions+2,'credential refresh acquires each enabled layer once without movement');
  assert.equal(sourceAdds,adds);assert.equal(sources.get(presentation.FIELD_SOURCE.bathymetry),sourceIdentity);
  assert.equal(sources.get(presentation.BATHYMETRY_CONTOUR_SOURCE),contourIdentity);assert.equal(sources.get(presentation.FIELD_SOURCE.currents),currentIdentity);
  context.fetch=async(url,options)=>url.includes('layer=currents')?{ok:false,status:403,text:async()=>{throw new Error('auth body must not be read');}}:qaFetch(url,options);
  await refresh();absent('currents');assert.equal(state.bathymetry.status,'static');assert.equal(sources.get(presentation.FIELD_SOURCE.bathymetry),sourceIdentity);
  events.get('style.load')();await scheduled();absent('currents');
  context.fetch=async()=>{throw new Error('controlled genuine transport after auth rejection');};await refresh();absent('currents');assert.equal(state.bathymetry.status,'degraded');
  context.fetch=qaFetch;await refresh();assert.equal(state.currents.status,'stale');
  for(const badLayer of ['currents','bathymetry']){
    const sibling=badLayer==='currents'?'bathymetry':'currents';const siblingBefore=sources.get(presentation.FIELD_SOURCE[sibling]);
    context.fetch=async(url,options)=>url.includes('layer='+badLayer)?rawResponse('null'):qaFetch(url,options);
    await refresh();absent(badLayer);assert.ok(state[sibling].field);assert.equal(sources.get(presentation.FIELD_SOURCE[sibling]),siblingBefore);
    context.fetch=qaFetch;await refresh();
  }
  console.log('PASS actual hook authenticated bathymetry/current GET through QA backend, refresh without remount/movement, same-credential dedupe, auth-denial and malformed-success locality');
  const pending=qaDeferred(),reading=qaDeferred();
  context.fetch=async(url,options)=>url.includes('layer=currents')?{ok:true,status:200,text:async()=>{reading.resolve();return pending.promise;}}:qaFetch(url,options);
  [...refreshTimers.values()].forEach(fn=>fn());const oldPrincipalRead=scheduled();await reading.promise;
  qaSession=null;qaCommit();absent('currents');absent('bathymetry');await scheduled();
  const afterLogout=state;pending.resolve(JSON.stringify(current));await oldPrincipalRead;assert.equal(state,afterLogout,'late old-owner body cannot publish after logout');
  events.get('style.load')();await scheduled();absent('currents');absent('bathymetry');
  context.fetch=async()=>{throw new Error('signed-out transport must not dispatch');};await refresh();absent('currents');absent('bathymetry');
  qaSession=syntheticSession();qaBoundary.setExpected(qaSession);context.fetch=qaFetch;qaCommit();await scheduled();assert.equal(state.currents.status,'stale');assert.equal(state.bathymetry.status,'static');
  const principalPending=qaDeferred(),principalReading=qaDeferred();
  context.fetch=async url=>url.includes('layer=currents')?{ok:true,status:200,text:async()=>{principalReading.resolve();return principalPending.promise;}}:rawResponse(JSON.stringify(bathy));
  [...refreshTimers.values()].forEach(fn=>fn());const oldOwnerRequest=scheduled();await principalReading.promise;
  qaSession=syntheticSession({id:'SYNTHETIC-OWNER-B'});context.fetch=transport('currents',{...current,fieldId:'SYNTHETIC-NEW-OWNER-FIELD'});
  qaCommit();assert.equal(state.currents.field,null);assert.equal(state.bathymetry.field,null);await scheduled();const newOwnerState=state,newOwnerCurrent=state.currents.field;
  principalPending.resolve('null');await oldOwnerRequest;assert.equal(state,newOwnerState,'old malformed completion cannot invalidate new owner');
  context.fetch=async()=>{throw new Error('new owner transport');};await refresh();assert.equal(state.currents.field,newOwnerCurrent);assert.equal(state.currents.status,'degraded');
  // Credential changes after render but before passive effects still guard completions.
  const preEffect=qaDeferred(),preEffectReading=qaDeferred();context.fetch=async url=>url.includes('layer=currents')?{ok:true,status:200,text:async()=>{preEffectReading.resolve();return preEffect.promise;}}:rawResponse(JSON.stringify(bathy));
  [...refreshTimers.values()].forEach(fn=>fn());const preEffectRequest=scheduled();await preEffectReading.promise;
  context.useMapLibreOceanFields({...props,session:null});const beforeEffectState=state;preEffect.resolve(JSON.stringify(current));await preEffectRequest;
  assert.equal(state,beforeEffectState,'render-time principal ref guards before passive effects');cleanup=effect();absent('currents');absent('bathymetry');
  // Obsolete viewport and disposed responses must not clear newer credentials/cache.
  qaSession=syntheticSession();context.fetch=transport();qaCommit();await scheduled();
  const obsoletePending=qaDeferred(),obsoleteReading=qaDeferred();context.fetch=async url=>url.includes('layer=currents')?{ok:true,status:200,text:async()=>{obsoleteReading.resolve();return obsoletePending.promise;}}:rawResponse(JSON.stringify(bathy));
  events.get('moveend')();const obsoleteRequest=scheduled();await obsoleteReading.promise;
  map.getZoom=()=>7;context.fetch=transport('currents',{...current,fieldId:'SYNTHETIC-QA-NEW-CONTEXT'});events.get('moveend')();await scheduled();const newerQaState=state;
  obsoletePending.resolve('null');await obsoleteRequest;assert.equal(state,newerQaState);
  const disposePending=qaDeferred(),disposeReading=qaDeferred();context.fetch=async url=>url.includes('layer=currents')?{ok:true,status:200,text:async()=>{disposeReading.resolve();return disposePending.promise;}}:rawResponse(JSON.stringify(bathy));
  events.get('moveend')();const disposeRequest=scheduled();await disposeReading.promise;cleanup();const qaDisposedState=state;
  disposePending.resolve('null');await disposeRequest;assert.equal(state,qaDisposedState);assert.equal(events.size,0);
  console.log('PASS actual QA hook logout/principal clear + late-body/malformed non-resurrection, render-before-effect guard, normal authorized recovery, newer viewport and disposal guards');
}finally{cleanup();await qaBoundary.close();}

// Simulate the exact microtask gap after decoding but before helper cache/state publication.
const standardRequestFactory=context.createViewportFieldRequests;let publishGap=false;
context.createViewportFieldRequests=options=>standardRequestFactory({...options,request:async(...args)=>{
  const result=await options.request(...args);
  if(publishGap&&args[0]==="currents"){publishGap=false;context.useMapLibreOceanFields({...props,session:null});}
  return result;
}});
qaSession=syntheticSession();map.getZoom=()=>5;context.fetch=transport();qaCommit();await scheduled();
publishGap=true;[...refreshTimers.values()].forEach(fn=>fn());await scheduled();absent("currents");
cleanup=effect();absent("bathymetry");absent("currents");
context.fetch=async()=>{throw new Error("after publication boundary");};events.get("style.load")();await scheduled();absent("currents");absent("bathymetry");
cleanup();context.createViewportFieldRequests=standardRequestFactory;
console.log("PASS render-time principal change in post-decoder/pre-publication microtask gap cannot cache/display or later restore old-owner data");

// P04 exact race: decoded buffers await style, logout render precedes passive cleanup.
qaSession=syntheticSession();styleLoaded=false;context.fetch=transport();qaCommit();await scheduled();
assert.ok(state.bathymetry.field&&state.currents.field);
context.useMapLibreOceanFields({...props,session:null});
try{
 styleLoaded=true;events.get('idle')();
 assert.ok(!state.currents.field,'pending idle must not publish prior-owner current');
 assert.ok(!state.bathymetry.field,'pending idle must not publish prior-owner bathymetry');
 absent('currents');absent('bathymetry');
}finally{cleanup=effect();cleanup();assert.equal(events.size,0);}
console.log('PASS P04 pending-style idle/logout baseline regression repaired for both layers');
for(const trigger of ['idle','style.load','readiness timer'])for(const transition of ['logout','principal','owner roundtrip','renewal']){
 qaSession=syntheticSession();styleLoaded=false;context.fetch=transport();qaCommit();await scheduled();
 assert.ok(state.bathymetry.field&&state.currents.field);
 const priorBathy=state.bathymetry.field,priorCurrent=state.currents.field;
 if(transition==='logout')context.useMapLibreOceanFields({...props,session:null});
 if(transition==='principal'){qaSession=syntheticSession({id:'SYNTHETIC-OWNER-B'});context.useMapLibreOceanFields({...props,session:qaSession});}
 if(transition==='owner roundtrip'){context.useMapLibreOceanFields({...props,session:null});context.useMapLibreOceanFields({...props,session:qaSession});}
 if(transition==='renewal'){qaSession=syntheticSession({claims:{exp:Math.floor(Date.now()/1000)+7200}});context.useMapLibreOceanFields({...props,session:qaSession});}
 styleLoaded=true;
 if(trigger==='readiness timer'){const callbacks=[...readyTimers.values()];readyTimers.clear();callbacks.forEach(fn=>fn());}
 else events.get(trigger)?.();
 if(transition==='renewal'){
  assert.equal(state.bathymetry.field,priorBathy);assert.equal(state.currents.field,priorCurrent);
  assert.equal(map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility,'visible');
  assert.equal(map.getLayer(presentation.FIELD_LAYER.currents).layout.visibility,'visible');
 }else{
  assert.equal(sources.get(presentation.FIELD_SOURCE.currents)?.data.features.length??0,0);
  assert.ok(!map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1])||map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility==='none');
  assert.equal(state.currents.field,null);assert.equal(state.bathymetry.field,null);
 }
 cleanup=effect();await scheduled();
 if(transition==='logout'){absent('currents');absent('bathymetry');}
 else {assert.ok(state.currents.field&&state.bathymetry.field);}
 cleanup();assert.equal(events.size,0);assert.equal(readyTimers.size,0);
}
console.log('PASS idle/style.load/readiness timer deny logout/principal/owner-roundtrip buffers before effects and preserve valid same-owner renewal/recovery');
// Queued React state updaters are themselves owner-bound, even after transport reconciliation.
qaSession=syntheticSession();styleLoaded=true;context.fetch=transport();const queued=[],queuedPublisher=update=>queued.push(update);
qaCommit({onFieldStatus:queuedPublisher});await scheduled();
const oldPublications=[...queued];queued.length=0;
qaSession=syntheticSession({id:'SYNTHETIC-OWNER-B'});context.useMapLibreOceanFields({...props,session:qaSession,onFieldStatus:queuedPublisher});cleanup=effect();await scheduled();
for(const update of queued)state=update(state);const newOwnerPublication=state;
for(const update of oldPublications){const result=update(state);assert.equal(result,state,'old-owner queued success/loading must not replace new owner');state=result;}
assert.equal(state,newOwnerPublication);cleanup();
console.log('PASS delayed success-state updater cannot publish an old owner after reconciliation to a new owner');
// Off publication is truthful even when React queues it; sibling lifetimes are untouched.
qaSession=syntheticSession();context.fetch=transport();qaCommit();await scheduled();
const qaToggleBathyState=state.bathymetry,qaToggleBathySource=sources.get(presentation.FIELD_SOURCE.bathymetry);
qaCommit({currentField:false});assert.equal(state.currents.status,'off');assert.equal(state.currents.field,null);
assert.equal(state.bathymetry,qaToggleBathyState);assert.equal(sources.get(presentation.FIELD_SOURCE.bathymetry),qaToggleBathySource);
qaCommit();await scheduled();const qaToggleCurrentState=state.currents,qaToggleCurrentSource=sources.get(presentation.FIELD_SOURCE.currents);
qaCommit({bathymetry:false});assert.equal(state.bathymetry.status,'off');assert.equal(state.currents,qaToggleCurrentState);assert.equal(sources.get(presentation.FIELD_SOURCE.currents),qaToggleCurrentSource);
qaCommit();await scheduled();assert.equal(state.bathymetry.status,'static');cleanup();
console.log('PASS QA OFF publishes truthfully with queued-owner guards and both ON/OFF directions preserve sibling lifetime');

// P04 exact residual: same caller object mutates A -> B -> A before passive effects.
qaSession=syntheticSession();styleLoaded=false;context.fetch=transport();qaCommit();await scheduled();
const mutableOwner=qaSession,originalMutableToken=qaSession.access_token,originalMutableId=qaSession.user.id;
const mutableReplacement=syntheticSession({id:'SYNTHETIC-MUTABLE-OWNER-B'});
mutableOwner.user.id=mutableReplacement.user.id;mutableOwner.access_token=mutableReplacement.access_token;
context.useMapLibreOceanFields({...props,session:mutableOwner});
mutableOwner.user.id=originalMutableId;mutableOwner.access_token=originalMutableToken;
context.useMapLibreOceanFields({...props,session:mutableOwner});
try{
 styleLoaded=true;events.get('idle')();
 assert.equal(sources.get(presentation.FIELD_SOURCE.currents)?.data.features.length??0,0,'same-object A-B-A must obsolete prior current');
 absent('currents');absent('bathymetry');
}finally{cleanup=effect();cleanup();assert.equal(events.size,0);}
console.log('PASS P04 exact same-object A-B-A deferred bathymetry/current buffers are rejected');
for(const mutation of ['principal','anonymous','invalid identity']){
 qaSession=syntheticSession();styleLoaded=false;context.fetch=transport();qaCommit();await scheduled();
 const reusedSession=qaSession,oldUser=qaSession.user,oldId=oldUser.id,oldToken=qaSession.access_token;
 if(mutation==='principal'){const replacement=syntheticSession({id:'SYNTHETIC-MUTABLE-B'});reusedSession.user.id=replacement.user.id;reusedSession.access_token=replacement.access_token;}
 if(mutation==='anonymous')reusedSession.user.is_anonymous=true;
 if(mutation==='invalid identity')reusedSession.user={id:7,is_anonymous:null};
 context.useMapLibreOceanFields({...props,session:reusedSession});
 // Only the final render's effects are committed, as in a batched intermediate render.
 effectFns=[];reusedSession.user=oldUser;oldUser.id=oldId;oldUser.is_anonymous=false;reusedSession.access_token=oldToken;
 context.useMapLibreOceanFields({...props,session:reusedSession});
 styleLoaded=true;events.get('idle')();absent('currents');absent('bathymetry');
 let recoveredCalls=0;context.fetch=async url=>{recoveredCalls++;return rawResponse(JSON.stringify(url.includes('layer=bathymetry')?{...bathy,fieldId:'SYNTHETIC-MUTABLE-RECOVERY-BATHY'}:{...current,fieldId:'SYNTHETIC-MUTABLE-RECOVERY-CURRENT'}));};
 cleanup=effect();await scheduled();assert.equal(recoveredCalls,2,'revision effect reacquires each layer once without movement');
 assert.equal(state.bathymetry.field.fieldId,'SYNTHETIC-MUTABLE-RECOVERY-BATHY');assert.equal(state.currents.field.fieldId,'SYNTHETIC-MUTABLE-RECOVERY-CURRENT');cleanup();
}
// Both old body reads must remain obsolete after the same caller object returns to A.
qaSession=syntheticSession();styleLoaded=true;context.fetch=transport();qaCommit();await scheduled();
const mutableReads={bathymetry:qaDeferred(),currents:qaDeferred()},mutableStarted={bathymetry:qaDeferred(),currents:qaDeferred()};
context.fetch=async url=>{const layer=url.includes('layer=bathymetry')?'bathymetry':'currents';return {ok:true,status:200,text:()=>{mutableStarted[layer].resolve();return mutableReads[layer].promise;}};};
[...refreshTimers.values()].forEach(fn=>fn());const mutablePending=scheduled();await Promise.all(Object.values(mutableStarted).map(d=>d.promise));
const originalMutableBodyId=qaSession.user.id,originalMutableBodyToken=qaSession.access_token,mutableBodyB=syntheticSession({id:'SYNTHETIC-BODY-OWNER-B'});
qaSession.user.id=mutableBodyB.user.id;qaSession.access_token=mutableBodyB.access_token;context.useMapLibreOceanFields({...props,session:qaSession});
qaSession.user.id=originalMutableBodyId;qaSession.access_token=originalMutableBodyToken;context.useMapLibreOceanFields({...props,session:qaSession});
const beforeMutableCompletion=state;mutableReads.bathymetry.resolve(JSON.stringify({...bathy,fieldId:'SYNTHETIC-OLD-BODY-BATHY'}));mutableReads.currents.resolve('null');await mutablePending;
assert.equal(state,beforeMutableCompletion,'old success/malformed bodies publish nothing after mutable owner roundtrip');
context.fetch=transport('currents',{...current,fieldId:'SYNTHETIC-NEW-MUTABLE-BODY-CURRENT'});cleanup=effect();await scheduled();
const currentAfterMutable=state.currents.field;context.fetch=async()=>{throw new Error('synthetic transport after mutable recovery');};await refresh();
assert.equal(state.currents.field,currentAfterMutable);assert.equal(state.currents.status,'degraded');cleanup();
// Token-only in-place renewal has no owner transition and preserves pending valid display.
qaSession=syntheticSession();styleLoaded=false;context.fetch=transport();qaCommit();await scheduled();
const renewalBathy=state.bathymetry.field,renewalCurrent=state.currents.field;
qaSession.access_token=syntheticSession({claims:{exp:Math.floor(Date.now()/1000)+7200}}).access_token;
context.useMapLibreOceanFields({...props,session:qaSession});styleLoaded=true;events.get('idle')();
assert.equal(state.bathymetry.field,renewalBathy);assert.equal(state.currents.field,renewalCurrent);
cleanup=effect();await scheduled();assert.ok(state.currents.field&&state.bathymetry.field);cleanup();
console.log('PASS immutable owner/anonymous/invalid tuple roundtrip, final-effect recovery, old bathymetry/current responses, newest-cache retention and in-place same-owner renewal');

// Exact producer ports use native cells; no UI, cursor or nearest-neighbor inference.
qaSession=syntheticSession();styleLoaded=true;context.fetch=transport();let readings=[];
const readoutPort=value=>readings.push(value);
qaCommit({onCurrentSampleReadout:readoutPort});await scheduled();
const readoutFieldId=state.currents.field.fieldId,bathyBeforeSelection=state.bathymetry.field;
qaCommit({onCurrentSampleReadout:readoutPort,selectedCurrentSample:{fieldId:readoutFieldId,sampleIndex:0}});
assert.equal(readings.at(-1).sample.fieldId,readoutFieldId);assert.equal(readings.at(-1).sample.sampleIndex,0);
assert.deepEqual([...readings.at(-1).sample.coordinates],current.payload.cells[0].slice(0,2));
assert.equal(readings.at(-1).sample.units,'kt');assert.equal(readings.at(-1).sample.freshnessStatus,'stale');
const selectionSource=sources.get(presentation.FIELD_SOURCE.currents);assert.equal(selectionSource.data.features[0].properties.sampleIndex,0);
assert.equal(state.bathymetry.field,bathyBeforeSelection);
context.fetch=async()=>{throw new Error('SYNTHETIC selected sample refresh failure');};await refresh();
assert.equal(readings.at(-1).status,'degraded');assert.equal(readings.at(-1).sample.fieldId,readoutFieldId);
context.fetch=transport();await refresh();assert.equal(readings.at(-1).sample,null,'new field object invalidates selection');
qaCommit({onCurrentSampleReadout:readoutPort,selectedCurrentSample:null});
qaCommit({onCurrentSampleReadout:readoutPort,selectedCurrentSample:{fieldId:readoutFieldId,sampleIndex:0}});assert(readings.at(-1).sample);
qaCommit({currentField:false,onCurrentSampleReadout:readoutPort,selectedCurrentSample:{fieldId:readoutFieldId,sampleIndex:0}});
assert.equal(readings.at(-1).status,'off');assert.equal(readings.at(-1).sample,null);
qaCommit({currentField:true,onCurrentSampleReadout:readoutPort,selectedCurrentSample:{fieldId:readoutFieldId,sampleIndex:0}});await scheduled();assert.equal(readings.at(-1).sample,null);
qaCommit({onCurrentSampleReadout:readoutPort,selectedCurrentSample:null});qaCommit({onCurrentSampleReadout:readoutPort,selectedCurrentSample:{fieldId:readoutFieldId,sampleIndex:0}});assert(readings.at(-1).sample);
qaSession=syntheticSession({id:'SYNTHETIC-READOUT-NEW-OWNER'});qaCommit({onCurrentSampleReadout:readoutPort,selectedCurrentSample:{fieldId:readoutFieldId,sampleIndex:0}});await scheduled();assert.equal(readings.at(-1).sample,null,'same field ID under different owner cannot revive');
cleanup();assert.equal(readings.at(-1).sample,null,'disposal clears readout');
console.log('PASS actual hook exact sample ports, retained request status, replacement/OFF/owner/disposal invalidation, no sibling remount or inferred selection');

const zeroProducer={...current,fieldId:'SYNTHETIC-READOUT-ZERO',coverage:{returnedCells:2,validCells:1},payload:{...current.payload,cells:[[-89.875,27.125,0,0],[-89.625,27.375,null,null]]}};
qaSession=syntheticSession();context.fetch=transport('currents',zeroProducer);qaCommit({onCurrentSampleReadout:readoutPort});await scheduled();
qaCommit({onCurrentSampleReadout:readoutPort,selectedCurrentSample:{fieldId:zeroProducer.fieldId,sampleIndex:0}});assert.equal(readings.at(-1).sample.speedKnots,0);assert.equal(readings.at(-1).sample.directionDegrees,null);assert(readings.at(-1).sample.isZeroVector);assert.equal(sources.get(presentation.FIELD_SOURCE.currents).data.features.length,0);
qaCommit({onCurrentSampleReadout:readoutPort,selectedCurrentSample:{fieldId:zeroProducer.fieldId,sampleIndex:1}});assert.equal(readings.at(-1).sample,null,'missing velocity is not zero');
qaCommit({onCurrentSampleReadout:readoutPort,selectedCurrentSample:{fieldId:zeroProducer.fieldId,sampleIndex:0}});assert(readings.at(-1).sample);
const priorReadoutOwner=qaSession.user.id,priorReadoutToken=qaSession.access_token,otherReadoutOwner=syntheticSession({id:'SYNTHETIC-READOUT-ROUNDTRIP'});
qaSession.user.id=otherReadoutOwner.user.id;qaSession.access_token=otherReadoutOwner.access_token;context.useMapLibreOceanFields({...props,session:qaSession,onCurrentSampleReadout:readoutPort,selectedCurrentSample:{fieldId:zeroProducer.fieldId,sampleIndex:0}});
qaSession.user.id=priorReadoutOwner;qaSession.access_token=priorReadoutToken;context.useMapLibreOceanFields({...props,session:qaSession,onCurrentSampleReadout:readoutPort,selectedCurrentSample:{fieldId:zeroProducer.fieldId,sampleIndex:0}});
events.get('style.load')();assert.equal(readings.at(-1).sample,null,'pre-effect mutable owner roundtrip denies readout publication');cleanup=effect();await scheduled();assert.equal(readings.at(-1).sample,null);cleanup();
console.log('PASS actual zero versus missing readout without fabricated arrow and pre-effect mutable-owner roundtrip non-resurrection');
