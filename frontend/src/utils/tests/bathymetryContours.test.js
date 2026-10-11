import assert from "node:assert/strict";
import {performance} from "node:perf_hooks";
import {pathToFileURL} from "node:url";
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
assert.equal(bathymetryContours({...tiny([-50,-250,-50,-250]),resolution:{deliveredDegrees:.1}}).features.length,0,
  "an absent row/column larger than declared delivered spacing cannot be bridged");
for(const f of edges.features){const expected=.5+(f.properties.depthMeters-50)/200;
  assert.ok(f.geometry.coordinates.every(([x])=>x===expected),"linear edge crossing, not a midpoint lattice");
  assert.equal(f.geometry.coordinates.length,2,"one supported quad segment");}
// Every endpoint on the planar fixture evaluates to its original-sample level;
// every constituent segment is confined to a single source quad diagonal.
for(const f of geo.features.filter(f=>f.geometry.type==="LineString")){
  for(const [x,y] of f.geometry.coordinates){const z=-50-(y-26.025)/.05*100-(x+90.975)/.05*50;
    assert.ok(Math.abs(z+f.properties.depthMeters)<1e-8);}
  f.geometry.coordinates.slice(1).forEach((p,i)=>assert.ok(Math.hypot(p[0]-f.geometry.coordinates[i][0],p[1]-f.geometry.coordinates[i][1])<=Math.SQRT2*.05+1e-12));
}
const hole={...tiny([-50,-250,-50,-250]),coverage:{returnedCells:9,validCells:8},payload:{...tiny([]).payload,
  longitudes:[.5,1,1.5],latitudes:[.5,1,1.5],values:[-50,-250,-50,-250,null,-250,-50,-250,-50]}};
assert.equal(bathymetryContours(hole).features.length,0,"no quad crosses a missing center");
const quantized={...hole,coverage:{returnedCells:9,validCells:9},payload:{...hole.payload,values:[-50,-50,-50,-50,-100,-50,-50,-50,-50]}};
assert.equal(bathymetryContours(quantized).features.length,0,"threshold at an isolated vertex creates no zero-length micro-loop");
const ridge={...quantized,payload:{...quantized.payload,values:[-50,-50,-50,-100,-100,-100,-50,-50,-50]}};
const ridgeLines=bathymetryContours(ridge).features.filter(f=>f.geometry.type==="LineString");
assert.equal(ridgeLines.length,1);assert.equal(ridgeLines[0].geometry.coordinates.length,3);
assert.notDeepEqual(ridgeLines[0].geometry.coordinates[0],ridgeLines[0].geometry.coordinates.at(-1),"duplicate exact-threshold edges cannot form a backtracking micro-loop");
for(const f of bathymetryContours(tiny([-50,-250,-250,-50])).features){
  assert.ok(f.geometry.coordinates.every(p=>p.every(Number.isFinite)));assert.notDeepEqual(f.geometry.coordinates[0],f.geometry.coordinates.at(-1));}
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
console.log(`PASS deterministic marching squares, exact planar thresholds, supported segments/masks/quantized vertices/saddles/identity, evaluated zoom/classes, style/order/collision; 1600 cells: median ${times[12].toFixed(2)} ms, max ${times.at(-1).toFixed(2)} ms; ${geo.features.filter(f=>f.geometry.type==="LineString").length} lines; adversarial 2600 cells rejected by 6000-feature presentation guard in ${worstMs.toFixed(2)} ms (desktop only)`);
const broadFixture={...fixture,fieldId:"SYNTHETIC-GULF-SCALE-v11",bounds:[-95,20,-85,30],resolution:{deliveredDegrees:.25},
  payload:{...fixture.payload,longitudes:Array.from({length:40},(_,i)=>-94.875+i*.25),latitudes:Array.from({length:40},(_,i)=>20.125+i*.25)}};
const regionalFixture={...fixture,fieldId:"SYNTHETIC-REGIONAL-SOURCE-SUBSET-v11",bounds:[-90.5,26.5,-89.5,27.5],coverage:{returnedCells:400,validCells:400},payload:{...fixture.payload,
  longitudes:fixture.payload.longitudes.slice(10,30),latitudes:fixture.payload.latitudes.slice(10,30),
  values:Array.from({length:400},(_,k)=>fixture.payload.values[(10+Math.floor(k/20))*40+10+k%20])}};
function measure(field){const start=performance.now(),result=bathymetryContours(field);return {milliseconds:performance.now()-start,
  cells:field.payload.values.length,features:result.features.length,vertices:result.features.reduce((n,f)=>n+(f.geometry.type==="Point"?1:f.geometry.coordinates.length),0),
  serializedBytes:Buffer.byteLength(JSON.stringify(result))};}
const gulf=measure(broadFixture),regionalPerf=measure(regionalFixture),zoomTimes=[];
for(let i=0;i<50;i++)zoomTimes.push(measure(i%2?fixture:regionalFixture).milliseconds);
zoomTimes.sort((a,b)=>a-b);
console.log(JSON.stringify({scope:"controlled desktop, serialized size is not total heap/GPU memory",gulf,regional:regionalPerf,
  repeated50Regenerations:{medianMs:zoomTimes[25],maxMs:zoomTimes.at(-1)}}));
const baselineModule=process.env.PELORA_CONTOUR_BASELINE_PRESENTATION?await import(pathToFileURL(process.env.PELORA_CONTOUR_BASELINE_PRESENTATION)):null;
const comparisons=[];if(baselineModule)for(const [name,field] of [["gulf",broadFixture],["regional",regionalFixture]]){
  const before=[],after=[];
  for(let i=0;i<30;i++){let start=performance.now();baselineModule.bathymetryContours(field);before.push(performance.now()-start);
    start=performance.now();bathymetryContours(field);after.push(performance.now()-start);}
  before.sort((a,b)=>a-b);after.sort((a,b)=>a-b);comparisons.push({name,beforeMedianMs:before[15],afterMedianMs:after[15]});
}
globalThis.gc?.();const heapBefore=process.memoryUsage().heapUsed;const heapResult=bathymetryContours(broadFixture);globalThis.gc?.();
const heapDelta=process.memoryUsage().heapUsed-heapBefore;
assert.ok(heapResult.features.length>0);
console.log(JSON.stringify({comparisonScope:"same desktop process, alternating original-source/candidate ESM calls; not a certified device benchmark",comparisons,
  heap:{gcAvailable:typeof globalThis.gc==='function',oneResultHeapDeltaBytes:heapDelta,scope:"process heap observation; not peak allocation or browser/GPU memory"}}));
