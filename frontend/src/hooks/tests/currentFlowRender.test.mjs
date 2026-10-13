import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const require=createRequire(import.meta.url),{chromium}=require(process.env.PELORA_BROWSER_TEST_NODE_MODULES+'/playwright'),sharp=require(process.env.PELORA_BROWSER_TEST_NODE_MODULES+'/sharp');
const output=fs.mkdtempSync(path.join(os.tmpdir(),'pelora-current-traces-'));
const current={contractVersion:'pelora-spatial-field-v1',layer:'currents',fieldId:'SYNTHETIC-CURRENT-TRACE-v1',
 provider:'SYNTHETIC TEST EVIDENCE',units:'m/s',status:'latest-available',validTime:new Date().toISOString(),freshness:{maxFreshAgeHours:96},
 bounds:[-90.5,26.5,-89,28],resolution:{deliveredDegrees:.5},coverage:{returnedCells:4,validCells:3},payloadType:'geostrophic-vector-grid',
 payload:{type:'geostrophic-vector-grid',coordinateOrder:'longitude,latitude,u,v',directionConvention:'degrees-toward',interpolation:'none',cells:[[-90,27,1,0],[-89.5,27,0,1],[-90,27.5,null,null],[-89.5,27.5,0,0]]}};
const bathy={...current,layer:'bathymetry',fieldId:'SYNTHETIC-TRACE-SIBLING',status:'static',validTime:null,freshness:{maxFreshAgeHours:null},coverage:{returnedCells:9,validCells:9},
 payloadType:'rectilinear-elevation-grid',payload:{type:'rectilinear-elevation-grid',positive:'up',order:'latitude-ascending-rows,longitude-ascending-columns',longitudes:[-90.25,-89.75,-89.25],latitudes:[26.75,27.25,27.75],values:[-50,-500,-1500,-500,-1500,-2500,-1500,-2500,-3500]}};
fs.writeFileSync(output+'/fixture.json',JSON.stringify({current,bathy},null,2));
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-background-networking']});
try{
 const context=await browser.newContext({viewport:{width:1000,height:750},serviceWorkers:'block'}),denied=[];
 await context.route('**/*',r=>{denied.push(r.request().url());return r.abort();});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setContent('<div id="map" style="position:absolute;inset:0"></div>');
 await page.addStyleTag({content:fs.readFileSync(root+'/node_modules/maplibre-gl/dist/maplibre-gl.css','utf8')});
 await page.addScriptTag({content:fs.readFileSync(root+'/node_modules/maplibre-gl/dist/maplibre-gl.js','utf8')});
  await page.addScriptTag({content:'globalThis.useRef=value=>({current:value});globalThis.localQaReadOnly=()=>false;'+fs.readFileSync(root+'/frontend/src/utils/qaFieldTransport.js','utf8').replace(/^import[\s\S]*?;\r?\n/gm,'').replace(/^export /gm,'').replace('import.meta.env??{}','{}')});
 const hashes={};
 for(const relative of ['utils/oceanFieldPresentation.js','utils/currentFlowPresentation.js','utils/viewportFieldRequests.js','utils/mapObservationDisplay.js','hooks/useMapLibreOceanFields.js']){
  const source=fs.readFileSync(root+'/frontend/src/'+relative,'utf8');hashes[relative]=crypto.createHash('sha256').update(source).digest('hex');
  await page.addScriptTag({content:source.replace(/^import[\s\S]*?;\r?\n/gm,'').replace(/^export /gm,'')});
 }
 await page.evaluate(async({current,bathy})=>{
  globalThis.currentFixture=current;globalThis.bathyFixture=bathy;globalThis.mode='valid';globalThis.states={};globalThis.cleanups=[];globalThis.mapErrors=[];globalThis.renders=0;
  globalThis.useEffect=fn=>{const cleanup=fn();if(cleanup)cleanups.push(cleanup);};globalThis.resolvePeloraApiUrl=p=>p;
  const native=fetch;globalThis.fetch=async(url,options)=>{
   if(typeof url==='string'&&url.startsWith('/api/ocean/field?')){
    if(url.includes('layer=bathymetry'))return {ok:true,text:async()=>JSON.stringify(bathyFixture)};
    if(mode==='failure')throw new Error('controlled transport failure');
    return {ok:true,text:async()=>mode==='malformed'?'null':JSON.stringify(currentFixture)};
   }return native(url,options);
  };
  const original=createCurrentTraceImage;globalThis.createCurrentTraceImage=options=>{
   const c=original(options);globalThis.trace=c;const render=c.image.render;c.image.render=()=>{const updated=render();if(updated)renders++;return updated;};return c;
  };
  globalThis.map=new maplibregl.Map({container:'map',style:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#101e29'}}]},center:[-89.75,27.25],zoom:7,attributionControl:false});
  map.on('error',e=>mapErrors.push(e.error?.message));await new Promise(r=>map.once('load',r));
  useMapLibreOceanFields({mapRef:{current:map},bathymetry:true,currentField:true,onFieldStatus:fn=>states=fn(states)});
 },{current,bathy});
 await page.waitForFunction(()=>states.currents?.status==='latest-available'&&states.bathymetry?.status==='static'&&renders>=2);
 await page.waitForFunction(()=>map.queryRenderedFeatures({layers:[FIELD_LAYER.currents]}).length>=2);
 const fresh=await page.evaluate(()=>({animating:trace.isAnimating(),features:map.getStyle().sources[FIELD_SOURCE.currents].data,
  count:map.queryRenderedFeatures({layers:[FIELD_LAYER.currents]}).length,image:map.getLayoutProperty(FIELD_LAYER.currents,'icon-image'),pixels:[...trace.image.data]}));
 // MapLibre may serialize source data; inspect actual worker-rendered point positions separately.
 const positions=await page.evaluate(()=>map.queryRenderedFeatures({layers:[FIELD_LAYER.currents]}).map(f=>f.geometry.coordinates));
 assert(fresh.animating);assert.equal(fresh.image,'pelora-field-current-trace');assert.ok(positions.length>=2);
 for(const p of positions)assert.ok(current.payload.cells.filter(c=>Number.isFinite(c[2])&&Number.isFinite(c[3])&&Math.hypot(c[2],c[3])>0).some(c=>Math.abs(c[0]-p[0])<.001&&Math.abs(c[1]-p[1])<.001));
 const submitted=typeof fresh.features==='string'?JSON.parse(fresh.features):fresh.features;
 assert.deepEqual(submitted.features.map(f=>f.geometry.coordinates),[[-90,27],[-89.5,27]]);
 await page.evaluate(()=>map.setLayoutProperty(FIELD_LAYER.currents,'icon-image','pelora-field-current-arrow'));
 await page.screenshot({path:output+'/before-arrows.png'});
 await page.evaluate(()=>map.setLayoutProperty(FIELD_LAYER.currents,'icon-image',CURRENT_TRACE_IMAGE));
 await page.screenshot({path:output+'/fresh.png'});
 const before=await page.evaluate(()=>renders);await page.waitForFunction(n=>renders>=n+2,before);assert.notDeepEqual(await page.evaluate(()=>[...trace.image.data]),fresh.pixels);
 await page.screenshot({path:output+'/fresh-next.png'});
 const firstPixels=await sharp(output+'/fresh.png').raw().toBuffer(),nextPixels=await sharp(output+'/fresh-next.png').raw().toBuffer();
 let changedPixels=0;for(let i=0;i<firstPixels.length;i++)if(firstPixels[i]!==nextPixels[i])changedPixels++;
 assert.ok(changedPixels>0,'pulse changes real rendered screenshot pixels');
 const frameBudget=[];
 await page.evaluate(()=>{currentFixture={...currentFixture,fieldId:'SYNTHETIC-500-TRACE-BUDGET',resolution:{deliveredDegrees:.025},coverage:{returnedCells:500,validCells:500},
  payload:{...currentFixture.payload,cells:Array.from({length:500},(_,k)=>[-90.05+(k%25)*.025,27.0+Math.floor(k/25)*.025,.5,.2])}};map.fire('load');});
 await page.waitForFunction(()=>states.currents.field?.fieldId==='SYNTHETIC-500-TRACE-BUDGET'&&trace.isAnimating());
 for(const width of [1000,390]){await page.setViewportSize({width,height:750});await page.evaluate(()=>map.resize());
  frameBudget.push(await page.evaluate(async()=>{const before=renders,samples=[];let last=performance.now();
   for(let i=0;i<40;i++){await new Promise(r=>requestAnimationFrame(r));const now=performance.now();samples.push(now-last);last=now;}
   return {width:innerWidth,frames:40,imageUpdates:renders-before,medianFrameMs:samples.sort((a,b)=>a-b)[20],maxFrameMs:Math.max(...samples),sourceCells:states.currents.field.coverage.returnedCells};}));
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!trace.isAnimating());await page.screenshot({path:output+'/reduced-motion.png'});
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>trace.isAnimating());
 await page.evaluate(()=>{currentFixture={...currentFixture,status:'stale',validTime:'2020-01-01T00:00:00Z'};map.fire('load');});
 await page.waitForFunction(()=>states.currents.status==='stale'&&!trace.isAnimating());
 const retainedTime=await page.evaluate(()=>states.currents.field.validTime);
 await page.evaluate(()=>{mode='failure';map.fire('load');});await page.waitForFunction(()=>states.currents.status==='degraded');
 assert.equal(await page.evaluate(()=>states.currents.field.validTime),retainedTime);assert.equal(await page.evaluate(()=>trace.isAnimating()),false);
 await page.evaluate(()=>{mode='valid';currentFixture={...currentFixture,fieldId:'SYNTHETIC-VALID-ZERO-TRACE',status:'latest-available',validTime:new Date().toISOString(),
  payload:{...currentFixture.payload,cells:currentFixture.payload.cells.map(c=>[c[0],c[1],0,0])}};map.fire('load');});
 await page.waitForFunction(()=>states.currents.field?.fieldId==='SYNTHETIC-VALID-ZERO-TRACE'&&states.currents.status==='latest-available'&&!trace.isAnimating());
 assert.equal(await page.evaluate(()=>states.currents.status),'latest-available');
 assert.equal(await page.evaluate(()=>map.getLayoutProperty(FIELD_LAYER.currents,'visibility')),'none');
 await page.evaluate(()=>{globalThis.sibling=states.bathymetry.field;mode='malformed';map.fire('load');});
 await page.waitForFunction(()=>states.currents.status==='unavailable'&&states.currents.field===null);
 assert.equal(await page.evaluate(()=>map.queryRenderedFeatures({layers:[FIELD_LAYER.currents]}).length),0);
 assert.equal(await page.evaluate(()=>states.bathymetry.field.fieldId),bathy.fieldId);
 await page.evaluate(()=>{map.fire('idle');map.fire('style.load');});await page.waitForFunction(()=>states.currents.status==='unavailable');
 await page.evaluate(()=>{mode='failure';map.fire('load');});await page.waitForFunction(()=>states.currents.status==='unavailable');assert.equal(await page.evaluate(()=>trace.isAnimating()),false);
 await page.evaluate(()=>{cleanups.forEach(fn=>fn());});assert.equal(await page.evaluate(()=>trace.isAnimating()),false);assert.equal(await page.evaluate(()=>map.hasImage(CURRENT_TRACE_IMAGE)),false);
 assert.deepEqual(errors,[]);assert.deepEqual(denied,[]);assert.deepEqual(await page.evaluate(()=>mapErrors),[]);
 const report={scope:'Controlled offline MapLibre 5.24.0/headless Edge; not physical-device/live-source QA',hashes,fixtureSha256:crypto.createHash('sha256').update(JSON.stringify({current,bathy})).digest('hex'),positions,changedPixels,frameBudget,animation:'shared 32x32 point glyph; <=12.5fps; no geographic displacement',reducedMotion:true,staleStatic:true,degradedIdentityPreserved:true,malformedCleared:true,siblingPreserved:true,nonResurrection:true,disposed:true,zeroRemainsAvailableWithoutAnimation:true,errors,denied};
 fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({result:'PASS actual current trace rendering, fresh animation, reduced motion/stale/degraded fallback, malformed locality, style/idle/failure non-resurrection and image disposal',output}));
 await page.evaluate(()=>map.remove());await context.close();
}finally{await browser.close();}
