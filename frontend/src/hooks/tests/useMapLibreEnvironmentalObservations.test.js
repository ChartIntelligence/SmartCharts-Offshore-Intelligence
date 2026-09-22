import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import * as presentation from "../../utils/mapObservationDisplay.js";

let effect;
const sources = new Map(), layers = new Map(), images = new Set(), events = new Map();
let additions = 0, updates = 0, popupRemovals = 0;
const map = {
  isStyleLoaded: () => true,
  getSource: id => sources.get(id),
  addSource(id, source) { additions++; sources.set(id, {data:source.data,setData(data){updates++;this.data=data;}}); },
  hasImage: id => images.has(id), addImage: id => images.add(id),
  getLayer: id => layers.get(id), addLayer: layer => layers.set(layer.id,layer),
  setLayoutProperty(id,key,value){ layers.get(id).layout[key]=value; },
  on(name,callback){events.set(name,callback);},
  once(name,callback){events.set(name,callback);},
  off(name,callback){if(events.get(name)===callback)events.delete(name);},
  queryRenderedFeatures: () => []
};
const context = vm.createContext({ ...presentation,
  useEffect: fn => { effect=fn; },
  maplibregl: { Popup: class {
    setLngLat(){return this;} setDOMContent(){return this;} addTo(){return this;}
    remove(){popupRemovals++;}
  } },
  document: {createElement:()=>({appendChild(){},className:"",textContent:""})}
});
const source=fs.readFileSync(new URL("../useMapLibreEnvironmentalObservations.js",import.meta.url),"utf8")
  .replace(/^import[\s\S]*?;\r?\n/gm,"").replace("export function","function");
vm.runInContext(source,context);
const mapRef={current:map};
const first={geoJson:{type:"FeatureCollection",features:[]}};
const toggle={temperatureSamples:true,chlorophyll:true,currents:true};
context.useMapLibreEnvironmentalObservations({mapRef,observationDisplay:first,layers:toggle});
let cleanup=effect();
assert.equal(additions,1);assert.equal(layers.size,4);assert.equal(images.size,3);
assert.equal(events.size,3);
cleanup();assert.equal(events.size,0);
const next={geoJson:{type:"FeatureCollection",features:[{type:"Feature",geometry:{type:"Point",coordinates:[140,45]},properties:{}}]}};
context.useMapLibreEnvironmentalObservations({mapRef,observationDisplay:next,layers:{...toggle,currents:false}});
cleanup=effect();
assert.equal(additions,1,"source reused across context/toggle updates");
assert.equal(updates,1);assert.equal(sources.get(presentation.OBSERVATION_SOURCE).data,next.geoJson);
assert.equal(layers.get("pelora-current-observations").layout.visibility,"none");
// A style reload recreates only missing source/layers/images from current data.
sources.clear();layers.clear();images.clear();events.get("style.load")();
assert.equal(additions,2);assert.equal(layers.size,4);assert.equal(images.size,3);
assert.equal(sources.get(presentation.OBSERVATION_SOURCE).data,next.geoJson);
cleanup();
context.useMapLibreEnvironmentalObservations({mapRef,observationDisplay:first,layers:toggle});
cleanup=effect();
assert.equal(sources.get(presentation.OBSERVATION_SOURCE).data.features.length,0,"cleared selection clears old sample geometry");
cleanup();assert.equal(events.size,0);assert.equal(popupRemovals,0);
console.log("PASS MapLibre observation source reuse, setData, visibility, style reload, cleared-context data and listener cleanup");

map.isStyleLoaded = () => false;
context.useMapLibreEnvironmentalObservations({mapRef,observationDisplay:next,layers:toggle});
cleanup=effect();
assert.equal(sources.get(presentation.OBSERVATION_SOURCE).data.features.length,0);
assert.ok(events.has("idle"),"post-load source activity must not strand the update");
events.get("idle")();
assert.equal(sources.get(presentation.OBSERVATION_SOURCE).data,next.geoJson);
cleanup();
assert.equal(events.size,0);
console.log("PASS update deferred by source loading is applied at idle without another style.load");
