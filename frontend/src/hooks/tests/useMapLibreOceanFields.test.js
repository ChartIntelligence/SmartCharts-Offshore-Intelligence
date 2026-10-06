import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {resolvePeloraApiUrl} from "../../utils/peloraApi.js";
import * as presentation from "../../utils/oceanFieldPresentation.js";
import {observationImages} from "../../utils/mapObservationDisplay.js";
import {createViewportFieldRequests} from "../../utils/viewportFieldRequests.js";
let effect,scheduled,styleLoaded=false,state={};let requests=0,sourceAdds=0;
const sources=new Map(),images=new Set(),events=new Map();
const layers=[{id:"ocean",type:"fill"},{id:"structure-clusters",type:"symbol"},{id:"pelora-ranked-targets",type:"symbol"}];
const map={getStyle:()=>({layers}),isStyleLoaded:()=>styleLoaded,getSource:id=>sources.get(id),
  addSource(id,s){sourceAdds++;sources.set(id,{...s,setData(data){this.data=data;},updateImage(image){Object.assign(this,image);}});},
  removeSource:id=>sources.delete(id),removeLayer:id=>{const i=layers.findIndex(l=>l.id===id);if(i>=0)layers.splice(i,1);},
  getLayer:id=>layers.find(l=>l.id===id),addLayer(l,before){const i=layers.findIndex(v=>v.id===before);layers.splice(i<0?layers.length:i,0,l);},
  moveLayer(id,before){const i=layers.findIndex(l=>l.id===id),[l]=layers.splice(i,1);layers.splice(layers.findIndex(v=>v.id===before),0,l);},
  setLayoutProperty(id,k,v){const l=layers.find(l=>l.id===id);l.layout={...l.layout,[k]:v};},
  hasImage:id=>images.has(id),addImage:id=>images.add(id),
  on(n,fn){events.set(n,fn);},once(n,fn){events.set(n,fn);},off(n,fn){if(events.get(n)===fn)events.delete(n);},
  getBounds:()=>({getWest:()=>-90,getEast:()=>-89,getSouth:()=>27,getNorth:()=>28}),getZoom:()=>5};
const current={freshness:{maxFreshAgeHours:96},contractVersion:"pelora-spatial-field-v1",layer:"currents",fieldId:"recorded",status:"stale",validTime:"2026-09-19T00:00:00Z",bounds:[-90,27,-89,28],resolution:{deliveredDegrees:.25},coverage:{validCells:1,returnedCells:1},payloadType:"geostrophic-vector-grid",payload:{type:"geostrophic-vector-grid",coordinateOrder:"longitude,latitude,u,v",directionConvention:"degrees-toward",interpolation:"none",cells:[[-89.875,27.125,-0.291,0.948]]}};
const bathy={validTime:null,freshness:{maxFreshAgeHours:null},contractVersion:"pelora-spatial-field-v1",layer:"bathymetry",fieldId:"bathy",status:"static",bounds:[-90,27,-89,28],resolution:{deliveredDegrees:1},coverage:{validCells:1,returnedCells:1},payloadType:"rectilinear-elevation-grid",payload:{type:"rectilinear-elevation-grid",order:"latitude-ascending-rows,longitude-ascending-columns",positive:"up",longitudes:[-89.5],latitudes:[27.5],values:[-100]}};
const context=vm.createContext({...presentation,observationImages,resolvePeloraApiUrl,URLSearchParams,
  useEffect:fn=>{effect=fn;},window:{setInterval:()=>1,clearInterval:()=>{}},
  bathymetryImage:()=>({url:"data:image/png;base64,test",coordinates:[[-90,28],[-89,28],[-89,27],[-90,27]]}),
  createViewportFieldRequests:options=>createViewportFieldRequests({...options,setTimer:fn=>(scheduled=fn,1),clearTimer:()=>{scheduled=null;}}),
  fetch:async url=>{requests++;return{ok:true,json:async()=>url.includes("layer=bathymetry")?bathy:current};}
});
const source=fs.readFileSync(new URL("../useMapLibreOceanFields.js",import.meta.url),"utf8")
  .replace(/^import[\s\S]*?;\r?\n/gm,"").replace("export function","function");
vm.runInContext(source,context);
const props={mapRef:{current:map},bathymetry:true,currentField:true,onFieldStatus:update=>{state=typeof update==="function"?update(state):update;}};
context.useMapLibreOceanFields(props);let cleanup=effect();assert.equal(requests,0);
styleLoaded=true;events.get("load")();await scheduled();
assert.equal(requests,2);assert.equal(sourceAdds,2);assert.equal(state.currents.field.validTime,current.validTime);
assert.equal(sources.get(presentation.FIELD_SOURCE.currents).data.features.length,1);
assert.ok(layers.findIndex(l=>l.id===presentation.FIELD_LAYER.bathymetry)<layers.findIndex(l=>l.id===presentation.FIELD_LAYER.currents));
assert.ok(layers.findIndex(l=>l.id===presentation.FIELD_LAYER.currents)<layers.findIndex(l=>l.id==="structure-clusters"));
events.get("moveend")();await scheduled();assert.equal(sourceAdds,2,"viewport changes reuse sources");
// Same-viewport failures must retain both rendered layers and original metadata.
context.fetch=async()=>{throw new Error("temporary provider timeout");};
events.get("moveend")();
assert.equal(state.currents.status,"loading");assert.equal(state.currents.field,current);
assert.equal(sources.get(presentation.FIELD_SOURCE.currents).data.features.length,1);
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");
await scheduled();
assert.equal(state.currents.status,"degraded");assert.equal(state.currents.field,current);
assert.equal(state.bathymetry.status,"degraded");assert.equal(state.bathymetry.field,bathy);
assert.match(state.currents.reason,/timeout/);
assert.equal(map.getLayer(presentation.FIELD_LAYER.currents).layout.visibility,"visible");
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");
// Rejection must clear rendering and cache without affecting the sibling.
const originalCanvas=context.bathymetryImage;
const transport=(badLayer,bad)=>async url=>({ok:true,json:async()=>url.includes("layer=bathymetry")?(badLayer==="bathymetry"?bad:bathy):(badLayer==="currents"?bad:current)});
async function refresh(){events.get("moveend")();await scheduled();}
async function restore(){context.bathymetryImage=originalCanvas;context.fetch=transport();await refresh();
  assert.equal(state.currents.field,current);assert.equal(state.bathymetry.field,bathy);}
function absent(layer){assert.equal(state[layer].status,"unavailable");assert.equal(state[layer].field,null);
  assert.ok(!map.getLayer(presentation.FIELD_LAYER[layer])||map.getLayer(presentation.FIELD_LAYER[layer]).layout.visibility==="none");
  if(layer==="currents")assert.equal(sources.get(presentation.FIELD_SOURCE.currents)?.data.features.length??0,0);}
// PELORA-04 P1: HTTP-success JSON null is rejection, never degraded retention.
await restore();assert.equal(map.getLayer(presentation.FIELD_LAYER.currents).layout.visibility,"visible");
const nullSibling=sources.get(presentation.FIELD_SOURCE.bathymetry);
context.fetch=transport("currents",null);await refresh();absent("currents");
assert.equal(state.bathymetry.field,bathy);assert.equal(sources.get(presentation.FIELD_SOURCE.bathymetry),nullSibling);
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");
// Exercise deferred sync before any further request settles.
styleLoaded=false;events.get("style.load")();const nullIdle=events.get("idle");
assert.equal(state.currents.field,null);styleLoaded=true;nullIdle();
assert.equal(sources.get(presentation.FIELD_SOURCE.currents).data.features.length,0);
await scheduled();absent("currents");
context.fetch=async()=>{throw new Error("genuine transport after null");};
events.get("style.load")();await scheduled();absent("currents");
assert.match(state.currents.reason,/genuine transport/);
assert.equal(state.bathymetry.field,bathy);assert.equal(state.bathymetry.status,"degraded");
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
await refresh();absent("bathymetry");assert.equal(state.currents.field,current);
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
await refresh();absent("currents");assert.equal(state.bathymetry.field,bathy);
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");
map.addLayer=layerAdder;
await restore();const imageAdder=map.addImage;images.delete("pelora-field-current-arrow");
map.addImage=()=>{throw new Error("arrow image registration failed");};
await refresh();absent("currents");assert.equal(state.bathymetry.field,bathy);
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"visible");
map.addImage=imageAdder;
console.log("PASS direct addLayer and arrow-image registration failure locality");
// Valid zeros retain source identity and success even when no arrow is drawn.
await restore();const zero={...current,fieldId:"zero",payload:{...current.payload,cells:[[-89.5,27.5,0,0]]}};
context.fetch=transport("currents",zero);await refresh();assert.equal(state.currents.field,zero);
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
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"none");
assert.equal(map.getLayer(presentation.FIELD_LAYER.currents).layout.visibility,"none");cleanup();
console.log("PASS actual field hook style load, viewport requests, image/vector sources, layer order, reuse, toggles and cleanup");
