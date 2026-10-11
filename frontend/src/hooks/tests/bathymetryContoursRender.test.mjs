import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const require=createRequire(import.meta.url);
const baseline=process.env.PELORA_CONTOUR_BASELINE==='1';
const entering='e8820d13d9f39df40274267c12a7ac23eeff6ce1';
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
  const sourceSha256={};
  await page.setContent('<div id="map" style="position:absolute;inset:0"></div>');
  await page.addStyleTag({content:fs.readFileSync(root+'/node_modules/maplibre-gl/dist/maplibre-gl.css','utf8')});
  await page.addScriptTag({content:fs.readFileSync(root+'/node_modules/maplibre-gl/dist/maplibre-gl.js','utf8')});
  for(const relative of ['utils/oceanFieldPresentation.js','utils/viewportFieldRequests.js','utils/peloraMapStyle.js','hooks/useMapLibreOceanFields.js']){
    const source=baseline?execFileSync('git',['show',`${entering}:frontend/src/${relative}`],{cwd:root,encoding:'utf8'}):fs.readFileSync(root+'/frontend/src/'+relative,'utf8');
    sourceSha256[relative]=crypto.createHash('sha256').update(source).digest('hex');
    await page.addScriptTag({content:source.replace(/^import[\s\S]*?;\r?\n/gm,'').replace(/^export /gm,'')});
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
    globalThis.holdResponses=false;globalThis.pendingReplies=[];
    const nativeFetch=fetch;globalThis.fetch=async(url,options)=>{
      if(typeof url==='string'&&url.startsWith('/api/ocean/field?')){
        fixtureRequests++;if(holdResponses)return await new Promise(resolve=>pendingReplies.push(resolve));
        return {ok:true,text:async()=>JSON.stringify(fixture)};
      }return nativeFetch(url,options);
    };
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
  await page.evaluate(()=>{globalThis.beforeZoomSource=map.getSource(BATHYMETRY_CONTOUR_SOURCE);holdResponses=true;map.jumpTo({center:[-90,27],zoom:7});});
  await page.waitForFunction(()=>pendingReplies.length>0);await idle();await page.screenshot({path:output+'/during-zoom-refresh.png'});
  const continuity=await page.evaluate(async()=>{
    const frames=[];for(let i=0;i<20;i++){await new Promise(r=>requestAnimationFrame(r));frames.push({status:states.bathymetry.status,
      visible:map.getLayoutProperty(BATHYMETRY_CONTOUR_LAYERS[1],'visibility'),lines:map.queryRenderedFeatures({layers:[BATHYMETRY_CONTOUR_LAYERS[1]]}).length});}
    return {frames,sameSource:map.getSource(BATHYMETRY_CONTOUR_SOURCE)===beforeZoomSource,displayContextKey:states.bathymetry.displayContextKey,
      contextKey:states.bathymetry.contextKey,requestedContextKey:states.bathymetry.requestedContextKey};
  });
  {assert.ok(continuity.frames.every(f=>f.status==='static'&&f.visible==='visible'&&f.lines>0),'pending zoom refresh keeps GPU contour presentation');
    assert.equal(continuity.contextKey,continuity.displayContextKey);assert.notEqual(continuity.contextKey,continuity.requestedContextKey);}
  await page.evaluate(()=>{holdResponses=false;pendingReplies.splice(0).forEach(resolve=>resolve({ok:true,text:async()=>JSON.stringify(fixture)}));});
  const replacementFrames=await page.evaluate(async()=>{const frames=[];
    for(let i=0;i<30;i++){await new Promise(r=>requestAnimationFrame(r));frames.push(map.queryRenderedFeatures({layers:[BATHYMETRY_CONTOUR_LAYERS[1]]}).length);}return frames;});
  if(!baseline)assert.ok(replacementFrames.every(n=>n>0),'contours survive actual source-data replacement frames');
  await page.waitForFunction(()=>states.bathymetry?.status==='static'&&!states.bathymetry.refreshing&&map.isStyleLoaded());
  await idle();await page.screenshot({path:output+'/after-regional.png'});
  const regional=await page.evaluate(()=>({labels:map.queryRenderedFeatures({layers:[BATHYMETRY_CONTOUR_LAYERS[2]]}).map(f=>f.properties),
    minor:map.queryRenderedFeatures({layers:[BATHYMETRY_CONTOUR_LAYERS[0]]}).map(f=>f.properties),
    raster:map.getLayoutProperty(FIELD_LAYER.bathymetry,'visibility'),status:states.bathymetry.status,order:map.getStyle().layers.map(l=>l.id)}));
  assert.ok(broad.length>0);assert.ok(regional.labels.length>0,'real placed major labels');assert.ok(regional.minor.length>0);
  assert.equal(regional.raster,'none');assert.equal(regional.status,'static');
  assert.ok(regional.labels.every(p=>p.major&&p.label.endsWith(' ft')));
  let zoomOutFrames=[];
  if(!baseline){
    await page.evaluate(()=>{holdResponses=true;map.jumpTo({center:[-90,27],zoom:6});});await page.waitForFunction(()=>pendingReplies.length>0);await idle();
    await page.screenshot({path:output+'/during-zoom-out-refresh.png'});
    zoomOutFrames=await page.evaluate(async()=>{const frames=[];for(let i=0;i<20;i++){await new Promise(r=>requestAnimationFrame(r));
      frames.push({status:states.bathymetry.status,lines:map.queryRenderedFeatures({layers:[BATHYMETRY_CONTOUR_LAYERS[1]]}).length});}return frames;});
    assert.ok(zoomOutFrames.every(f=>f.status==='static'&&f.lines>0));
    await page.evaluate(()=>{holdResponses=false;pendingReplies.splice(0).forEach(resolve=>resolve({ok:true,text:async()=>JSON.stringify(fixture)}));});
    await page.waitForFunction(()=>!states.bathymetry.refreshing&&map.isStyleLoaded());await idle();
  }
  // Same source support; shallow synthetic depths are an explicit fixture, not a provider substitute.
  const shallowFixture={...fixture,fieldId:'SYNTHETIC-SHALLOW-40x40-vNEXT',payload:{...fixture.payload,
    values:Array.from({length:1600},(_,k)=>-.1-Math.floor(k/40)*.5-(k%40)*.25)}};
  fs.writeFileSync(output+'/shallow-fixture.json',JSON.stringify(shallowFixture,null,2));
  await page.evaluate(field=>{fixture=field;map.fire('load');},shallowFixture);
  await page.waitForFunction(()=>states.bathymetry?.field?.fieldId==='SYNTHETIC-SHALLOW-40x40-vNEXT'&&map.isStyleLoaded());
  const detailFrames=[];
  if(!baseline)for(const width of [1000,390]){
    await page.setViewportSize({width,height:width===390?844:750});await page.evaluate(()=>map.resize());
    for(const zoom of [7,9,11]){
      await page.evaluate(z=>map.jumpTo({center:[-90,27],zoom:z}),zoom);
      await page.waitForFunction(()=>!states.bathymetry.refreshing&&map.isStyleLoaded());await idle();
      const detail=await page.evaluate(async()=>{
        const data=bathymetryContours(fixture);
        const lines=data.features.filter(f=>f.geometry.type==='LineString'&&f.properties.minZoom<=map.getZoom());
        const placed=map.queryRenderedFeatures({layers:BATHYMETRY_CONTOUR_LAYERS}).filter(f=>f.properties.minZoom<=map.getZoom());
        const elapsed=[];let last=performance.now();for(let i=0;i<30;i++){await new Promise(r=>requestAnimationFrame(r));let now=performance.now();elapsed.push(now-last);last=now;}
        return {zoom:map.getZoom(),eligibleLines:lines.length,placedFeatures:placed.length,feet:lines.map(f=>f.properties.depthFeet),
          placedLabels:placed.filter(f=>f.geometry.type==='Point').map(f=>f.properties.label),maxFrameMs:Math.max(...elapsed),
          medianFrameMs:elapsed.sort((a,b)=>a-b)[15],status:states.bathymetry.status};
      });detail.width=width;detailFrames.push(detail);
      assert.ok(detail.eligibleLines>0&&detail.placedFeatures>0);assert.equal(detail.status,'static');
      assert.ok(detail.placedLabels.every(label=>label.endsWith(' ft')));
      await page.screenshot({path:output+'/shallow-'+width+'-z'+zoom+'.png'});
    }
    const navigation=await page.evaluate(async()=>{
      holdResponses=true;const samples=[];let last=performance.now();
      map.easeTo({center:[-89.99,27.005],duration:500});
      for(let i=0;i<40;i++){await new Promise(r=>requestAnimationFrame(r));const now=performance.now();
        samples.push({ms:now-last,status:states.bathymetry.status,visible:map.getLayoutProperty(BATHYMETRY_CONTOUR_LAYERS[1],'visibility')});last=now;}
      holdResponses=false;pendingReplies.splice(0).forEach(resolve=>resolve({ok:true,text:async()=>JSON.stringify(fixture)}));return samples;
    });
    assert.ok(navigation.every(frame=>frame.status==='static'&&frame.visible==='visible'));
    fs.writeFileSync(output+'/navigation-'+width+'.json',JSON.stringify(navigation,null,2));
    console.log(JSON.stringify({navigationWidth:width,frames:navigation.length,maxFrameMs:Math.max(...navigation.map(f=>f.ms)),
      medianFrameMs:navigation.map(f=>f.ms).sort((a,b)=>a-b)[20],noLoadingFlash:true}));
    const tiers=detailFrames.filter(f=>f.width===width);assert.ok(tiers[0].eligibleLines<tiers[1].eligibleLines&&tiers[1].eligibleLines<tiers[2].eligibleLines);
  }
  assert.equal(denied.length,0);assert.equal(errors.length,0);
  const mapErrors=await page.evaluate(()=>globalThis.mapErrors);assert.deepEqual(mapErrors,[]);
  const report={scope:'SYNTHETIC TEST EVIDENCE; empty geography, local fallback glyphs, headless desktop Edge plus 390px phone emulation; not physical-mobile/authenticated qualification',
    entering,baseline,sourceSha256,fixtureSha256:crypto.createHash('sha256').update(JSON.stringify(fixture)).digest('hex'),broad,regional,continuity,replacementFrames,zoomOutFrames,detailFrames,shallowFixtureSha256:crypto.createHash("sha256").update(JSON.stringify(shallowFixture)).digest("hex"),denied,errors,mapErrors};
  fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify({result:'PASS marching-square geometry and zoom continuity',output,broadFeatures:broad.length,regionalLabels:regional.labels.length,regionalMinor:regional.minor.length,continuityFrames:continuity.frames.length,detailFrames,network:denied.length}));
  await page.evaluate(()=>{cleanups.forEach(fn=>fn());map.remove();});await context.close();
}finally{await browser.close();}
