import assert from "node:assert/strict";
import {PELORA_MAP_COLORS} from "../peloraMapStyle.js";
import {validateStyleMin} from "@maplibre/maplibre-gl-style-spec";
import {currentFieldGeoJson,fieldViewport,fieldLayerDefinitions,FIELD_SOURCE,fieldInsertBefore,
  sampleLayersForMode,bathymetryRasterPlan,bathymetryImage,validateFieldPresentation,fieldStatusText,installBathymetryTextureSampling} from "../oceanFieldPresentation.js";
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

// Fixed real-depth bands must contrast with the actual configured base water.
const relief={...rasterField,bounds:[0,0,4,2],coverage:{validCells:7,returnedCells:8},
  payload:{...rasterField.payload,longitudes:[.5,1.5,2.5,3.5],values:[-5000,-3000,-1500,-500,-50,null,0,8]}};
const reliefSnapshot=JSON.stringify(relief),reliefPlan=bathymetryRasterPlan(relief);
assert.equal(reliefPlan.rectangles.length,5,"only supplied negative depths receive color");
assert.equal(new Set(reliefPlan.rectangles.map(r=>r.color)).size,5,"existing depth bands stay distinguishable");
const rgb=hex=>[1,3,5].map(offset=>parseInt(hex.slice(offset,offset+2),16));
const baseWater=rgb(PELORA_MAP_COLORS.ocean),opacity=fieldLayerDefinitions()[0].paint["raster-opacity"];
for(const rect of reliefPlan.rectangles){
  const composite=rgb(rect.color).map((value,i)=>value*opacity+baseWater[i]*(1-opacity));
  assert.ok(composite.reduce((sum,value,i)=>sum+Math.abs(value-baseWater[i]),0)>60,"rendered depth band distinctly differs from base water");
  assert.ok(rect.width>0&&rect.height>0,"non-empty sample footprint");
}
assert.equal(fieldLayerDefinitions()[0].paint["raster-resampling"],"nearest");
assert.equal(JSON.stringify(relief),reliefSnapshot,"no values or resolution changed for presentation");
console.log("PASS non-empty, base-water-distinct fixed bathymetry bands with nearest sampling and unchanged scientific data");

// Texture compatibility fix is local, nearest-only, and reapplied to replacement textures.
const textureWrites=[],bindCalls=[],samplingFailures=[];
const textureGl={NEAREST:9728,LINEAR:9729,TEXTURE_2D:3553,TEXTURE_MIN_FILTER:10241,LINEAR_MIPMAP_NEAREST:9985,
  texParameteri:(...args)=>textureWrites.push(args)};
function testTexture(id,mipmaps=false){return {id,useMipmap:mipmaps,context:{gl:textureGl},
  bind(filter,wrap,minFilter){bindCalls.push({id:this.id,filter,wrap,minFilter});return this.id;}};}
const textureSource={type:"image",prepare(){return "prepared";}};
const prepareBefore=textureSource.prepare;
const releaseTextureSampling=installBathymetryTextureSampling(textureSource,error=>samplingFailures.push(error));
assert.equal(textureSource.prepare(),"prepared","preparation without an image is safe");
const firstTexture=testTexture("first"),firstBind=firstTexture.bind;textureSource.texture=firstTexture;
textureSource.prepare();assert.equal(firstTexture.bind(textureGl.NEAREST,33071,9985),"first");
assert.equal(bindCalls.at(-1).minFilter,9728);assert.deepEqual(textureWrites.at(-1),[3553,10241,9728]);
firstTexture.bind(textureGl.NEAREST,33071,9985);assert.equal(textureWrites.length,2,"cached nearest bind still enforces complete sampling");
const newTexture=testTexture("replacement"),replacementBind=newTexture.bind;textureSource.texture=newTexture;
textureSource.prepare();assert.equal(firstTexture.bind,firstBind,"replaced texture wrapper restored");
newTexture.bind(textureGl.NEAREST,33071,9985);assert.equal(bindCalls.at(-1).minFilter,9728);
newTexture.useMipmap=true;const writeCount=textureWrites.length;
newTexture.bind(textureGl.NEAREST,33071,9985);assert.equal(bindCalls.at(-1).minFilter,9985);
assert.equal(textureWrites.length,writeCount,"valid mipmapped textures retain their contract");
newTexture.useMipmap=false;newTexture.bind(textureGl.LINEAR,33071,9729);
assert.equal(bindCalls.at(-1).minFilter,9729);assert.equal(textureWrites.length,writeCount);
releaseTextureSampling();releaseTextureSampling();assert.equal(textureSource.prepare,prepareBefore);
assert.equal(newTexture.bind,replacementBind);assert.equal(samplingFailures.length,0);
assert.throws(()=>installBathymetryTextureSampling({type:"geojson",prepare(){}},()=>{}),/API unavailable/);
const badSource={type:"image",prepare(){},texture:{bind(){},useMipmap:false}};
const releaseBad=installBathymetryTextureSampling(badSource,error=>samplingFailures.push(error));badSource.prepare();
assert.match(samplingFailures.at(-1).message,/API unavailable/);releaseBad();
console.log("PASS non-mipmapped nearest bathymetry binding, replacement textures, existing/mipmapped cache behavior, local API guards and teardown restoration");

const thresholdFixture={...rasterField,bounds:[0,0,4,3],coverage:{validCells:11,returnedCells:12},payload:{...rasterField.payload,
  longitudes:[.5,1.5,2.5,3.5],latitudes:[.5,1.5,2.5],values:[-4001,-4000,-2001,-2000,-1001,-1000,-201,-200,-1,0,10,null]}};
const thresholdSnapshot=JSON.stringify(thresholdFixture),thresholdPlan=bathymetryRasterPlan(thresholdFixture);
assert.deepEqual(thresholdPlan.rectangles.map(r=>r.color),["#204e72","#39849a","#39849a","#60a6ad","#60a6ad","#89c5bd","#89c5bd","#c9d9bd","#c9d9bd"]);
assert.deepEqual(thresholdPlan.coordinates,[[0,3],[4,3],[4,0],[0,0]]);
assert.equal(JSON.stringify(thresholdFixture),thresholdSnapshot);
assert.equal(fieldLayerDefinitions()[0].paint["raster-opacity"],.85);
console.log("PASS unchanged exact depth boundaries, transparent zero/positive/null cells, source values, north-up bounds and opacity");
