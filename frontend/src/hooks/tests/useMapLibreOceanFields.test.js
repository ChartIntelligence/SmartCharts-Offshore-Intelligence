import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import * as presentation from "../../utils/oceanFieldPresentation.js";
import {observationImages} from "../../utils/mapObservationDisplay.js";
import {createViewportFieldRequests} from "../../utils/viewportFieldRequests.js";
let effect,scheduled,styleLoaded=false,state={};let requests=0,sourceAdds=0;
const sources=new Map(),images=new Set(),events=new Map();
const layers=[{id:"ocean",type:"fill"},{id:"structure-clusters",type:"symbol"},{id:"pelora-ranked-targets",type:"symbol"}];
const map={getStyle:()=>({layers}),isStyleLoaded:()=>styleLoaded,getSource:id=>sources.get(id),
  addSource(id,s){sourceAdds++;sources.set(id,{...s,setData(data){this.data=data;},updateImage(image){Object.assign(this,image);}});},
  getLayer:id=>layers.find(l=>l.id===id),addLayer(l,before){const i=layers.findIndex(v=>v.id===before);layers.splice(i<0?layers.length:i,0,l);},
  moveLayer(id,before){const i=layers.findIndex(l=>l.id===id),[l]=layers.splice(i,1);layers.splice(layers.findIndex(v=>v.id===before),0,l);},
  setLayoutProperty(id,k,v){const l=layers.find(l=>l.id===id);l.layout={...l.layout,[k]:v};},
  hasImage:id=>images.has(id),addImage:id=>images.add(id),
  on(n,fn){events.set(n,fn);},once(n,fn){events.set(n,fn);},off(n,fn){if(events.get(n)===fn)events.delete(n);},
  getBounds:()=>({getWest:()=>-90,getEast:()=>-89,getSouth:()=>27,getNorth:()=>28}),getZoom:()=>5};
const current={contractVersion:"pelora-spatial-field-v1",layer:"currents",fieldId:"recorded",status:"stale",validTime:"2026-09-19T00:00:00Z",coverage:{validCells:1},payloadType:"geostrophic-vector-grid",payload:{cells:[[-89.875,27.125,-0.291,0.948]]}};
const bathy={contractVersion:"pelora-spatial-field-v1",layer:"bathymetry",status:"static",coverage:{validCells:1}};
const context=vm.createContext({...presentation,observationImages,apiBase:"http://test",URLSearchParams,
  useEffect:fn=>{effect=fn;},window:{setInterval:()=>1,clearInterval:()=>{}},
  bathymetryImage:()=>({url:"data:image/png;base64,test",coordinates:[[-90,28],[-89,28],[-89,27],[-90,27]]}),
  createViewportFieldRequests:options=>createViewportFieldRequests({...options,setTimer:fn=>(scheduled=fn,1),clearTimer:()=>{scheduled=null;}}),
  fetch:async url=>{requests++;return{ok:true,json:async()=>url.includes("layer=bathymetry")?bathy:current};}
});
const source=fs.readFileSync(new URL("../useMapLibreOceanFields.js",import.meta.url),"utf8")
  .replace(/^import[\s\S]*?;\r?\n/gm,"").replace("export function","function").replace("import.meta.env.VITE_OCEAN_API_BASE","apiBase");
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
// A new viewport must immediately stop representing the retained data as its field.
map.getBounds=()=>({getWest:()=>140,getEast:()=>141,getSouth:()=>-40,getNorth:()=>-39});
events.get("moveend")();
assert.equal(state.currents.field,null);assert.equal(state.bathymetry.field,null);
assert.equal(map.getLayer(presentation.FIELD_LAYER.currents).layout.visibility,"none");
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"none");
await scheduled();assert.equal(state.currents.status,"unavailable");
cleanup();assert.equal(events.size,0);
context.useMapLibreOceanFields({...props,bathymetry:false,currentField:false});cleanup=effect();
assert.equal(map.getLayer(presentation.FIELD_LAYER.bathymetry).layout.visibility,"none");
assert.equal(map.getLayer(presentation.FIELD_LAYER.currents).layout.visibility,"none");cleanup();
console.log("PASS actual field hook style load, viewport requests, image/vector sources, layer order, reuse, toggles and cleanup");
