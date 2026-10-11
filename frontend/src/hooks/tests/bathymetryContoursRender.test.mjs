import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PELORA_BROWSER_TEST_NODE_MODULES+'/playwright');
const output=process.env.PELORA_CONTOUR_RENDER_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'pelora03-contours-'));
fs.mkdirSync(output,{recursive:true});
const fixture={contractVersion:'pelora-spatial-field-v1',layer:'bathymetry',fieldId:'SYNTHETIC-CONTOURS-40x40-v1',
  provider:'SYNTHETIC TEST EVIDENCE',status:'static',validTime:null,freshness:{maxFreshAgeHours:null},bounds:[-91,26,-89,28],
  resolution:{deliveredDegrees:.05},coverage:{returnedCells:1600,validCells:1600},payloadType:'rectilinear-elevation-grid',
  payload:{type:'rectilinear-elevation-grid',positive:'up',order:'latitude-ascending-rows,longitude-ascending-columns',
    longitudes:Array.from({length:40},(_,i)=>-90.975+i*.05),latitudes:Array.from({length:40},(_,i)=>26.025+i*.05),
    values:Array.from({length:1600},(_,k)=>-50-Math.floor(k/40)*100-(k%40)*50)}};
fs.writeFileSync(output+'/fixture.json',JSON.stringify(fixture,null,2));
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-background-networking']});
try{
  const context=await browser.newContext({viewport:{width:1000,height:750},serviceWorkers:'block'});
  const denied=[];await context.route('**/*',r=>{denied.push(r.request().url());return r.abort();});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setContent('<div id="map" style="position:absolute;inset:0"></div>');
  await page.addStyleTag({content:fs.readFileSync(root+'/node_modules/maplibre-gl/dist/maplibre-gl.css','utf8')});
  await page.addScriptTag({content:fs.readFileSync(root+'/node_modules/maplibre-gl/dist/maplibre-gl.js','utf8')});
  for(const relative of ['utils/oceanFieldPresentation.js','utils/viewportFieldRequests.js','utils/peloraMapStyle.js','hooks/useMapLibreOceanFields.js']){
    await page.addScriptTag({content:fs.readFileSync(root+'/frontend/src/'+relative,'utf8').replace(/^import[\s\S]*?;\r?\n/gm,'').replace(/^export /gm,'')});
  }
  await page.evaluate(async field=>{
    globalThis.fixture=field;globalThis.states={};globalThis.cleanups=[];globalThis.fixtureRequests=0;globalThis.mapErrors=[];
    const empty={type:'FeatureCollection',features:[]};
    const style=createPeloraMapStyle({version:8,sources:{geography:{type:'geojson',data:empty}},layers:[
      {id:'background',type:'background'}, {id:'countries-fill',type:'fill',source:'geography'},
      {id:'coastline',type:'line',source:'geography'},{id:'countries-boundary',type:'line',source:'geography'},
      {id:'countries-label',type:'symbol',source:'geography',layout:{'text-field':''}}]});
    globalThis.map=new maplibregl.Map({container:'map',style,center:[-90,27],zoom:5,attributionControl:false});
    map.on('error',e=>mapErrors.push(e.error?.message));await new Promise(r=>map.once('load',r));
    let ordering=false;map.on('styledata',()=>{if(ordering)return;ordering=true;try{enforcePeloraLayerOrder(map);}finally{ordering=false;}});
    const nativeFetch=fetch;globalThis.fetch=async(url,options)=>typeof url==='string'&&url.startsWith('/api/ocean/field?')?
      (fixtureRequests++,{ok:true,text:async()=>JSON.stringify(fixture)}):nativeFetch(url,options);
    globalThis.resolvePeloraApiUrl=p=>p;globalThis.useEffect=fn=>{const cleanup=fn();if(cleanup)cleanups.push(cleanup);};
    useMapLibreOceanFields({mapRef:{current:map},bathymetry:true,currentField:false,onFieldStatus:fn=>{states=fn(states);}});
  },fixture);
  await page.waitForFunction(()=>states.bathymetry?.status==='static'&&map.isStyleLoaded());
  const idle=()=>page.evaluate(()=>new Promise(r=>{map.once('idle',r);map.triggerRepaint();}));
  await idle();
  await page.evaluate(()=>{for(const id of BATHYMETRY_CONTOUR_LAYERS)map.setLayoutProperty(id,'visibility','none');map.setLayoutProperty(FIELD_LAYER.bathymetry,'visibility','visible');map.fitBounds(fixture.bounds,{padding:40,duration:0});});
  await idle();await page.waitForFunction(()=>map.isStyleLoaded()&&states.bathymetry?.status==='static');
  await page.evaluate(()=>{for(const id of BATHYMETRY_CONTOUR_LAYERS)map.setLayoutProperty(id,'visibility','none');map.setLayoutProperty(FIELD_LAYER.bathymetry,'visibility','visible');});
  await idle();await page.screenshot({path:output+'/before-raster.png'});
  await page.evaluate(()=>{map.setLayoutProperty(FIELD_LAYER.bathymetry,'visibility','none');for(const id of BATHYMETRY_CONTOUR_LAYERS)map.setLayoutProperty(id,'visibility','visible');map.jumpTo({center:[-90,27],zoom:5});});
  await idle();await page.screenshot({path:output+'/after-broad.png'});
  const broad=await page.evaluate(()=>map.queryRenderedFeatures({layers:BATHYMETRY_CONTOUR_LAYERS.slice(1)}).map(f=>f.properties));
  await page.evaluate(()=>map.jumpTo({center:[-90,27],zoom:7}));await idle();await page.screenshot({path:output+'/after-regional.png'});
  const regional=await page.evaluate(()=>({labels:map.queryRenderedFeatures({layers:[BATHYMETRY_CONTOUR_LAYERS[2]]}).map(f=>f.properties),
    minor:map.queryRenderedFeatures({layers:[BATHYMETRY_CONTOUR_LAYERS[0]]}).map(f=>f.properties),
    raster:map.getLayoutProperty(FIELD_LAYER.bathymetry,'visibility'),status:states.bathymetry.status,order:map.getStyle().layers.map(l=>l.id)}));
  assert.ok(broad.length>0);assert.ok(regional.labels.length>0,'real placed major labels');assert.ok(regional.minor.length>0);
  assert.equal(regional.raster,'none');assert.equal(regional.status,'static');
  assert.ok(regional.labels.every(p=>p.major&&p.label.endsWith(' ft')));
  assert.equal(denied.length,0);assert.equal(errors.length,0);
  const mapErrors=await page.evaluate(()=>globalThis.mapErrors);assert.deepEqual(mapErrors,[]);
  const report={scope:'SYNTHETIC TEST EVIDENCE; empty geography, local fallback glyphs, headless desktop Edge; not mobile/authenticated qualification',
    fixtureSha256:crypto.createHash('sha256').update(JSON.stringify(fixture)).digest('hex'),broad,regional,denied,errors,mapErrors};
  fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify({result:'PASS real MapLibre contour lines/placed labels, broad/regional screenshots, hidden primary raster',output,broadFeatures:broad.length,regionalLabels:regional.labels.length,regionalMinor:regional.minor.length,network:denied.length}));
  await page.evaluate(()=>{cleanups.forEach(fn=>fn());map.remove();});await context.close();
}finally{await browser.close();}
