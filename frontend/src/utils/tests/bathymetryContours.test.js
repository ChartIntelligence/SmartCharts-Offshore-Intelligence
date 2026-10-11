import assert from "node:assert/strict";
import {performance} from "node:perf_hooks";
import {validateStyleMin,createExpression} from "@maplibre/maplibre-gl-style-spec";
import {bathymetryContours,bathymetryContourLayerDefinitions,bathymetryContourLabel,
  BATHYMETRY_CONTOUR_LEVELS,BATHYMETRY_CONTOUR_SOURCE} from "../oceanFieldPresentation.js";
import {orderPeloraLayers} from "../peloraMapStyle.js";
const fixture={contractVersion:"pelora-spatial-field-v1",layer:"bathymetry",fieldId:"SYNTHETIC-CONTOUR-v1",
  status:"static",validTime:null,freshness:{maxFreshAgeHours:null},bounds:[-91,26,-89,28],
  resolution:{deliveredDegrees:.05},coverage:{returnedCells:1600,validCells:1600},payloadType:"rectilinear-elevation-grid",
  payload:{type:"rectilinear-elevation-grid",positive:"up",order:"latitude-ascending-rows,longitude-ascending-columns",
    longitudes:Array.from({length:40},(_,i)=>-90.975+i*.05),latitudes:Array.from({length:40},(_,i)=>26.025+i*.05),
    values:Array.from({length:1600},(_,k)=>-50-Math.floor(k/40)*100-(k%40)*50)}};
const snapshot=JSON.stringify(fixture),geo=bathymetryContours(fixture);
assert.ok(geo.features.length>0);assert.deepEqual(bathymetryContours(fixture),geo);assert.equal(JSON.stringify(fixture),snapshot);
for(const feature of geo.features){
  const p=feature.properties;
  assert.ok(BATHYMETRY_CONTOUR_LEVELS.includes(p.depthMeters));
  assert.equal(p.major,p.depthMeters===200||p.depthMeters%1000===0);
  assert.equal(p.label,bathymetryContourLabel(p.depthMeters));assert.equal(p.fieldId,fixture.fieldId);
  const coordinates=feature.geometry.type==="Point"?[feature.geometry.coordinates]:feature.geometry.coordinates;
  for(const [x,y] of coordinates)assert.ok(x>=-91&&x<=-89&&y>=26&&y<=28);
}
const broad=geo.features.filter(f=>f.properties.minZoom<=4),regional=geo.features.filter(f=>f.properties.minZoom<=6),close=geo.features.filter(f=>f.properties.minZoom<=8);
assert.ok(broad.length<regional.length&&regional.length<close.length);
assert.ok(broad.every(f=>f.properties.major));
const tiny=values=>({...fixture,bounds:[0,0,2,2],resolution:{deliveredDegrees:1},coverage:{returnedCells:4,validCells:values.filter(Number.isFinite).length},payload:{...fixture.payload,longitudes:[.5,1.5],latitudes:[.5,1.5],values}});
for(const values of [[0,20,0,null],[-500,null,0,-4000],[-1000,-1000,-1000,-1000]])assert.equal(bathymetryContours(tiny(values)).features.length,0);
assert.throws(()=>bathymetryContours(tiny([-50,NaN,-4000,-4000])),/presentation/);
const edges=bathymetryContours(tiny([-50,-250,-50,-250]));
assert.ok(edges.features.every(f=>f.geometry.coordinates.every(([x])=>x===1)),"no interpolated depth location");
assert.ok(edges.features.every(f=>f.geometry.coordinates.length===3),"adjacent edges joined for sparse labeling");
const layers=bathymetryContourLayerDefinitions();
const opacity=createExpression(layers[0].paint["line-opacity"]);assert.equal(opacity.result,"success");
for(const [zoom,minZoom,expected] of [[4,6,0],[7,6,.45],[7,8,0],[8,8,.45]])
  assert.equal(opacity.value.evaluate({zoom},{properties:{minZoom}}),expected);
assert.deepEqual(validateStyleMin({version:8,sources:{[BATHYMETRY_CONTOUR_SOURCE]:{type:"geojson",data:geo}},layers}),[]);
assert.equal(layers[2].layout["symbol-placement"],"point");assert.equal(layers[2].layout["text-allow-overlap"],false);
assert.equal(layers[2].layout["text-ignore-placement"],false);
for(const label of geo.features.filter(f=>f.geometry.type==="Point")){
  const line=geo.features.find(f=>`${f.id}:label`===label.id);
  assert.ok(line.properties.major);assert.ok(line.geometry.coordinates.some(p=>JSON.stringify(p)===JSON.stringify(label.geometry.coordinates)));
}
const ordered=orderPeloraLayers([...layers,{id:"pelora-geostrophic-arrows"},{id:"structure-clusters"},{id:"countries-fill"}]);
assert.ok(ordered.indexOf(layers[2])<ordered.findIndex(l=>l.id==="countries-fill"));
assert.ok(ordered.indexOf(layers[2])<ordered.findIndex(l=>l.id==="pelora-geostrophic-arrows"));
const times=[];for(let i=0;i<25;i++){const start=performance.now();bathymetryContours(fixture);times.push(performance.now()-start);}
times.sort((a,b)=>a-b);
const worst={...fixture,bounds:[-91,26,-88.4,28.5],coverage:{returnedCells:2600,validCells:2600},payload:{...fixture.payload,
  longitudes:Array.from({length:52},(_,i)=>-90.975+i*.05),latitudes:Array.from({length:50},(_,i)=>26.025+i*.05),
  values:Array.from({length:2600},(_,k)=>(k%52+Math.floor(k/52))%2?-50:-6500)}};
const worstStart=performance.now();assert.throws(()=>bathymetryContours(worst),/presentation exceeds complexity limit/);const worstMs=performance.now()-worstStart;
console.log(`PASS deterministic source-only nearest-cell contours, masks/domain/identity/units, evaluated zoom/classes, style/order/collision; 1600 cells: median ${times[12].toFixed(2)} ms, max ${times.at(-1).toFixed(2)} ms; ${geo.features.filter(f=>f.geometry.type==="LineString").length} lines; adversarial 2600 cells rejected by 6000-feature presentation guard in ${worstMs.toFixed(2)} ms (desktop only)`);
