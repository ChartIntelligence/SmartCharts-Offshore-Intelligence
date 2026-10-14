import fs from "node:fs";
// Reuse the verbatim original controlled hook harness, retaining its regressions.
// The baseline selector changes hook bytes only; the clock is the transport's supported now port.
const harnessUrl=new URL("./useMapLibreOceanFields.test.js",import.meta.url);
const original=fs.readFileSync(harnessUrl,"utf8");
if(!original.includes("// BATH-D1A baseline:"))throw new Error("Expected controlled harness boundary");
let harness=original.split("// BATH-D1A baseline:")[0];
harness=harness.replace(/from (["'])(\.[^"']+)\1/g,(_,quote,relative)=>"from "+JSON.stringify(new URL(relative,harnessUrl).href));
harness=harness.replace('new URL("../useMapLibreOceanFields.js",import.meta.url)','new URL('+JSON.stringify(new URL("../useMapLibreOceanFields.js",harnessUrl).href)+')');
harness='let expiryClock=null;\n'+harness.replace('createQaFieldTransport({...options,environment:qaEnvironment,','createQaFieldTransport({...options,now:()=>expiryClock??Date.now(),environment:qaEnvironment,');
harness+=`
expiryClock=Date.now();
qaSession=syntheticSession({claims:{exp:Math.floor(expiryClock/1000)+5}});
const expiryFixture={...bathy,fieldId:'SYNTHETIC-BATH-D1A-EXPIRY',provider:'NOAA/NCEI',dataset:'ETOPO_2022_v1_60s',productId:'etopo-2022-60s',productVersion:'2022-v1-60s',units:'m',crs:'EPSG:4326',provenance:{providerUrl:'https://oceanwatch.pifsc.noaa.gov/erddap',attribution:'SYNTHETIC TEST EVIDENCE'},resolution:{nativeDegrees:1/60,deliveredDegrees:.4,stride:24},coverage:{validCells:9,returnedCells:9},payload:{...bathy.payload,longitudes:[-89.9,-89.5,-89.1],latitudes:[27.1,27.5,27.9],values:[-50,-100,-200,-500,-700,-900,-1500,-1700,-2000]}};
map.getBounds=()=>({getWest:()=>-90,getEast:()=>-89,getSouth:()=>27,getNorth:()=>28});map.getZoom=()=>5;styleLoaded=true;
context.fetch=transport('bathymetry',expiryFixture);qaCommit();await scheduled();
assert.equal(state.bathymetry.status,'static');assert.equal(state.bathymetry.field.fieldId,expiryFixture.fieldId);
assert.equal(map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1]).layout.visibility,'visible');
const unchangedSession=qaSession;let expiredRequests=0;
context.fetch=async()=>{expiredRequests++;throw new Error('synthetic expired request must not dispatch');};
expiryClock+=10000;[...refreshTimers.values()].forEach(fn=>fn());await scheduled();
assert.equal(qaSession,unchangedSession,'only the injected clock changed, with no movement/render/session update');
console.log('EXPIRY OBSERVATION '+JSON.stringify({bathymetry:state.bathymetry.status,bathymetryField:!!state.bathymetry.field,contourVisibility:map.getLayer(presentation.BATHYMETRY_CONTOUR_LAYERS[1])?.layout.visibility??'absent',currents:state.currents.status,currentField:!!state.currents.field,expiredRequests}));
try{absent('currents');absent('bathymetry');assert.equal(expiredRequests,0,'expired authority cannot fetch');}
finally{cleanup();}
console.log('PASS accepted static TTL exemption retains authorization heartbeat: no-movement expiry clears both layers without dispatch');
`;
try{await import('data:text/javascript;base64,'+Buffer.from(harness).toString('base64'));}
catch(error){console.error(error.name+': '+error.message);process.exitCode=1;}
