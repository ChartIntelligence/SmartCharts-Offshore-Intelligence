import assert from "node:assert/strict";
import {validateStyleMin} from "@maplibre/maplibre-gl-style-spec";
import {currentFieldGeoJson,fieldViewport,fieldLayerDefinitions,FIELD_SOURCE,fieldInsertBefore,
  sampleLayersForMode,bathymetryRasterPlan,bathymetryImage,validateFieldPresentation,fieldStatusText} from "../oceanFieldPresentation.js";
import {createViewportFieldRequests} from "../viewportFieldRequests.js";
const field={status:"latest-available",freshness:{maxFreshAgeHours:96},contractVersion:"pelora-spatial-field-v1",layer:"currents",bounds:[139,-36,146,-34],resolution:{deliveredDegrees:1},coverage:{returnedCells:6,validCells:5},fieldId:"one-time",validTime:"2026-09-19T00:00:00Z",payloadType:"geostrophic-vector-grid",
  payload:{type:"geostrophic-vector-grid",coordinateOrder:"longitude,latitude,u,v",directionConvention:"degrees-toward",interpolation:"none",cells:[[140,-35,0,1],[141,-35,1,0],[142,-35,0,-1],[143,-35,-1,0],[144,-35,null,1],[145,-35,0,0]]}};
const geo=currentFieldGeoJson(field);
assert.deepEqual(geo.features.map(f=>f.properties.directionDegrees),[0,90,180,270]);
assert.deepEqual(geo.features[0].geometry.coordinates,[140,-35]);
assert.ok(geo.features.every(f=>f.properties.validTime===field.validTime));
const layers=fieldLayerDefinitions();
assert.deepEqual(validateStyleMin({version:8,sources:{[FIELD_SOURCE.bathymetry]:{type:"image",url:"test.png",coordinates:[[0,1],[1,1],[1,0],[0,0]]},[FIELD_SOURCE.currents]:{type:"geojson",data:geo}},layers}),[]);
assert.equal(layers[0].type,"raster");assert.equal(layers[1].layout["icon-rotation-alignment"],"map");
assert.equal(fieldInsertBefore({getStyle:()=>({layers:[{id:"ocean",type:"fill"},{id:"structure-clusters",type:"symbol"}]})}),"structure-clusters");
const active={temperatureSamples:true,chlorophyll:true,currents:true,locations:true};
assert.deepEqual(sampleLayersForMode(active),{temperatureSamples:false,chlorophyll:false,currents:false,locations:true});
assert.equal(sampleLayersForMode(active,true),active);
const bounds={getWest:()=>140,getEast:()=>150,getSouth:()=>-45,getNorth:()=>-35};
assert.deepEqual(fieldViewport(bounds,7).bbox,[140,-45,150,-35]);
assert.ok(fieldViewport(bounds,3).currentDensity<fieldViewport(bounds,7).currentDensity);
assert.throws(()=>fieldViewport({...bounds,getWest:()=>170,getEast:()=>190},5),/Dateline/);
const rasterField={status:"static",validTime:null,freshness:{maxFreshAgeHours:null},contractVersion:"pelora-spatial-field-v1",layer:"bathymetry",fieldId:"raster",coverage:{validCells:3,returnedCells:4},payloadType:"rectilinear-elevation-grid",bounds:[0,0,2,2],resolution:{deliveredDegrees:1},payload:{type:"rectilinear-elevation-grid",order:"latitude-ascending-rows,longitude-ascending-columns",positive:"up",longitudes:[0.5,1.5],latitudes:[0.5,1.5],values:[-100,-2000,null,5]}};
const raster=bathymetryRasterPlan(rasterField);
assert.deepEqual(raster.coordinates,[[0,2],[2,2],[2,0],[0,0]]);assert.equal(raster.rectangles.length,2,"land and missing cells transparent");
assert.ok(raster.rectangles[0].y>250,"southern row drawn in southern image half");
const statusField={...field,status:"latest-available",coverage:{validCells:4,returnedCells:6},resolution:{deliveredDegrees:.25},freshness:{maxFreshAgeHours:96}};
assert.match(fieldStatusText("currents",{field:statusField},Date.parse("2026-09-24T00:00:00Z")),/stale/);
assert.match(fieldStatusText("currents",{status:"unavailable",reason:"provider failed"}),/provider failed/);
let scheduled=null,network=0;const pending=[],states=[];
const requests=createViewportFieldRequests({setTimer:fn=>(scheduled=fn,1),clearTimer:()=>{scheduled=null;},request:(layer,viewport,signal)=>{network++;return new Promise(resolve=>pending.push({resolve,signal,viewport}));},onState:(layer,state)=>states.push(state)});
requests.schedule({bbox:[1]},["currents"]);requests.schedule({bbox:[2]},["currents"]);assert.equal(network,0);
let run=scheduled();assert.equal(network,1);
requests.schedule({bbox:[3]},["currents"]);assert.equal(pending[0].signal.aborted,true);
pending[0].resolve({status:"latest-available",fieldId:"obsolete"});await run;
assert.ok(!states.some(s=>s.field?.fieldId==="obsolete"));run=scheduled();pending[1].resolve({status:"latest-available",fieldId:"current"});await run;
assert.equal(states.at(-1).field.fieldId,"current");requests.dispose();assert.equal(pending[1].signal.aborted,true);
console.log("PASS field viewport debounce/cancel, global coordinates, QA hiding, raster masks/georeferencing, arrow semantics, layer style/order and field status");

for(const bad of [
  {...rasterField,payload:{...rasterField.payload,longitudes:[1.5,.5]}},
  {...rasterField,payload:{...rasterField.payload,latitudes:[.5,NaN]}},
  {...rasterField,payload:{...rasterField.payload,values:[-1]}},
  {...rasterField,payload:{...rasterField.payload,values:[-100,-2000,"bad",5]}},
  {...rasterField,payload:{...rasterField.payload,order:undefined}},
  {...rasterField,coverage:null},{...rasterField,bounds:[0,0,0,2]},
  {...rasterField,resolution:{deliveredDegrees:0}},
  {...rasterField,freshness:null},{...rasterField,validTime:"invalid"}
])assert.throws(()=>bathymetryRasterPlan(bad),/presentation/);
for(const bad of [
  {...field,payload:{...field.payload,cells:null}},
  {...field,payload:{...field.payload,cells:[[140,-35,0]]}},
  {...field,payload:{...field.payload,coordinateOrder:undefined}},
  {...field,payload:{...field.payload,cells:[[140,-35,Number.MAX_VALUE,Number.MAX_VALUE]]},coverage:{validCells:1,returnedCells:1}}
])assert.throws(()=>currentFieldGeoJson(bad),/presentation/);
assert.throws(()=>bathymetryImage(rasterField,{createElement:()=>({getContext:()=>null})}),/canvas unavailable/);
for(const stage of ["fillRect","toDataURL"]){
  assert.throws(()=>bathymetryImage(rasterField,{createElement:()=>({getContext:()=>({fillRect:()=>{if(stage==="fillRect")throw new Error("canvas draw");}}),toDataURL:()=>{throw new Error("canvas encode");}})}),/canvas/);
}
const zeros={...rasterField,payload:{...rasterField.payload,values:[0,0,null,0]}};
validateFieldPresentation(zeros,"bathymetry");assert.equal(bathymetryRasterPlan(zeros).rectangles.length,0);
assert.equal(zeros.payload.values[0],0);assert.equal(zeros.payload.values[2],null);
console.log("PASS malformed axes/cells/metadata, actual canvas context/draw/encode failures and zero versus null preservation");
