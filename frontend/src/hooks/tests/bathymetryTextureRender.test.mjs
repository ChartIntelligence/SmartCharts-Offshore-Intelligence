import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const output=process.env.PELORA_TEXTURE_RENDER_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'pelora03-texture-render-'));
fs.mkdirSync(output,{recursive:true});
const baseline=process.env.PELORA_TEXTURE_RENDER_MODE==='baseline';
const hookPath=baseline?process.env.PELORA_TEXTURE_BASELINE_HOOK:root+'/frontend/src/hooks/useMapLibreOceanFields.js';
if(!hookPath)throw new Error('Baseline mode requires PELORA_TEXTURE_BASELINE_HOOK from git show 98f3356:<hook path>');
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PELORA_BROWSER_TEST_NODE_MODULES?process.env.PELORA_BROWSER_TEST_NODE_MODULES+'/playwright':'playwright');
const sharp=require(process.env.PELORA_BROWSER_TEST_NODE_MODULES?process.env.PELORA_BROWSER_TEST_NODE_MODULES+'/sharp':'sharp');
const presentation=await import(pathToFileURL(root+'/frontend/src/utils/oceanFieldPresentation.js'));
const bands=[-5000,-3000,-1500,-500,-50,0,50];
const field={contractVersion:'pelora-spatial-field-v1',layer:'bathymetry',fieldId:'SYNTHETIC-VISIBLE-RENDER-42x33-vNEXT',
  provider:'SYNTHETIC TEST EVIDENCE',status:'static',validTime:null,freshness:{maxFreshAgeHours:null},
  bounds:[-91,26,-88.9,27.65],resolution:{deliveredDegrees:.05},coverage:{returnedCells:1386,validCells:1386},
  payloadType:'rectilinear-elevation-grid',payload:{type:'rectilinear-elevation-grid',positive:'up',
    order:'latitude-ascending-rows,longitude-ascending-columns',
    longitudes:Array.from({length:42},(_,i)=>-90.975+i*.05),
    latitudes:Array.from({length:33},(_,j)=>26.025+j*.05),
    values:Array.from({length:1386},(_,index)=>bands[Math.min(index%42,6)])}};
fs.writeFileSync(output+'/fixture.json',JSON.stringify(field,null,2)+'\n');
const values=field.payload.values,negative=values.filter(v=>Number.isFinite(v)&&v<0);
const distribution={grid:[42,33],spacingDegrees:.05,total:values.length,finite:values.filter(Number.isFinite).length,
  negative:negative.length,nonnegative:values.filter(v=>Number.isFinite(v)&&v>=0).length,
  bands:{'z < -4000':0,'-4000 <= z < -2000':0,'-2000 <= z < -1000':0,'-1000 <= z < -200':0,'-200 <= z < 0':0},
  minNegative:Math.min(...negative),maxNegative:Math.max(...negative),shadedCellPercent:negative.length/values.length*100};
for(const v of negative)distribution.bands[Object.keys(distribution.bands)[v< -4000?0:v< -2000?1:v< -1000?2:v< -200?3:4]]++;
const browser=await chromium.launch({channel:process.env.PELORA_TEST_BROWSER_CHANNEL||(process.platform==='win32'?'msedge':undefined),headless:true,args:['--disable-background-networking']});
try{
const context=await browser.newContext({viewport:{width:900,height:700},serviceWorkers:'block'});
const denied=[];await context.route('**/*',route=>{denied.push(route.request().url());return route.abort();});
const page=await context.newPage();const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
await page.setContent('<!doctype html><html><body style="margin:0"><div id="map" style="width:900px;height:700px"></div></body></html>');
await page.addStyleTag({content:fs.readFileSync(root+'/node_modules/maplibre-gl/dist/maplibre-gl.css','utf8')});
await page.addScriptTag({content:fs.readFileSync(root+'/node_modules/maplibre-gl/dist/maplibre-gl.js','utf8')});
  await page.addScriptTag({content:'globalThis.useRef=value=>({current:value});globalThis.localQaReadOnly=()=>false;'+fs.readFileSync(root+'/frontend/src/utils/qaFieldTransport.js','utf8').replace(/^import[\s\S]*?;\r?\n/gm,'').replace(/^export /gm,'').replace('import.meta.env??{}','{}')});
await page.evaluate(fs.readFileSync(root+'/frontend/src/utils/oceanFieldPresentation.js','utf8').replace(/^export /gm,'')+'\nglobalThis.presentation={bathymetryImage,bathymetryRasterPlan,fieldLayerDefinitions,fieldInsertBefore,fieldViewport,validateFieldPresentation,currentFieldGeoJson,FIELD_SOURCE,FIELD_LAYER,EMPTY_FIELD,installBathymetryTextureSampling,BATHYMETRY_CONTOUR_SOURCE,BATHYMETRY_CONTOUR_LAYERS,bathymetryContours,bathymetryContourLayerDefinitions};');
await page.evaluate(fs.readFileSync(root+'/frontend/src/utils/peloraMapStyle.js','utf8').replace(/^export /gm,'')+'\nglobalThis.visual={createPeloraMapStyle,enforcePeloraLayerOrder,PELORA_MAP_COLORS};');
const canvasResult=await page.evaluate(async field=>{
  let canvas;
  const image=presentation.bathymetryImage(field,{createElement:()=>{canvas=document.createElement('canvas');return canvas;}});
  globalThis.fixture=field;globalThis.fixtureImage=image;
  const ctx=canvas.getContext('2d'),rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let nontransparent=0,opaque=0;const colors={},samples=[];
  for(let i=0;i<rgba.length;i+=4){if(rgba[i+3]>0)nontransparent++;if(rgba[i+3]===255)opaque++;
    if(rgba[i+3]>0){const color=[...rgba.slice(i,i+4)].join(',');colors[color]=(colors[color]||0)+1;}}
  const plan=presentation.bathymetryRasterPlan(field);
  for(const rect of plan.rectangles.filter((r,i)=>i<5)){
    const x=Math.floor(rect.x+rect.width/2),y=Math.floor(rect.y+rect.height/2);
    samples.push({x,y,depth:field.payload.values[plan.rectangles.indexOf(rect)],rgba:[...ctx.getImageData(x,y,1,1).data]});
  }
  const decoded=new Image();decoded.src=image.url;await decoded.decode();
  return {width:canvas.width,height:canvas.height,decodedWidth:decoded.width,decodedHeight:decoded.height,
    totalPixels:canvas.width*canvas.height,nontransparent,opaque,transparent:canvas.width*canvas.height-nontransparent,
    colors,samples,plannedColors:[...new Set(plan.rectangles.map(r=>r.color))],rectangles:plan.rectangles.length,
    coordinates:image.coordinates,url:image.url};
},field);
fs.writeFileSync(output+'/canvas.png',Buffer.from(canvasResult.url.split(',')[1],'base64'));
delete canvasResult.url;
assert.equal(canvasResult.width,512);assert.equal(canvasResult.decodedWidth,512);
assert.ok(canvasResult.nontransparent>0);assert.equal(canvasResult.rectangles,165);
assert.equal(canvasResult.plannedColors.length,5);
assert.ok(canvasResult.samples.every(s=>s.rgba[3]===255));
// A real MapLibre map and real image texture, with empty geographic fixture layers.
await page.evaluate(async()=>{
  const empty={type:'FeatureCollection',features:[]};
  const style=visual.createPeloraMapStyle({version:8,sources:{geography:{type:'geojson',data:empty}},layers:[
    {id:'background',type:'background',paint:{'background-color':'#101e29'}},
    {id:'countries-fill',type:'fill',source:'geography'},
    {id:'coastline',type:'line',source:'geography'},
    {id:'countries-boundary',type:'line',source:'geography'},
    {id:'countries-label',type:'symbol',source:'geography',layout:{'text-field':''}}]});
  globalThis.mapErrors=[];globalThis.map=new maplibregl.Map({container:'map',style,center:[-89.95,26.825],zoom:7,
    attributionControl:false,canvasContextAttributes:{preserveDrawingBuffer:true}});
  map.on('error',e=>mapErrors.push(e.error?.message));
  await new Promise(resolve=>map.once('load',resolve));
  map.fitBounds(fixture.bounds.slice(0,2).concat(fixture.bounds.slice(2)),{padding:35,duration:0});
  let ordering=false;map.on('styledata',()=>{if(ordering)return;ordering=true;try{visual.enforcePeloraLayerOrder(map);}finally{ordering=false;}});
});
await page.screenshot({path:output+'/before-map.png'});
// Exercise the unchanged actual hook with real map/canvas and controlled fetch.
await page.evaluate(fs.readFileSync(root+'/frontend/src/utils/viewportFieldRequests.js','utf8').replace(/^export /gm,'')+'\nglobalThis.createViewportFieldRequests=createViewportFieldRequests;');
await page.addScriptTag({content:fs.readFileSync(hookPath,'utf8')
  .replace(/^import[\s\S]*?;\r?\n/gm,'').replace(/^export /gm,'')+
  '\nglobalThis.runFieldHook=useMapLibreOceanFields;'});
await page.evaluate(()=>{
  Object.assign(globalThis,presentation);
  globalThis.useEffect=fn=>{const cleanup=fn();if(cleanup)globalThis.cleanups.push(cleanup);};
  globalThis.cleanups=[];globalThis.diagFieldStatus={};globalThis.fixtureRequests=0;
  globalThis.resolvePeloraApiUrl=path=>path;
  const nativeFetch=globalThis.fetch;
  globalThis.fetch=async(url,options)=>{
    if(typeof url==='string'&&url.startsWith('/api/ocean/field?')){fixtureRequests++;return {ok:true,text:async()=>JSON.stringify(fixture)};}
    return nativeFetch(url,options);
  };
  runFieldHook({mapRef:{current:map},bathymetry:true,currentField:false,onFieldStatus:update=>{diagFieldStatus=typeof update==='function'?update(diagFieldStatus):update;}});
});
try{await page.waitForFunction(()=>diagFieldStatus.bathymetry?.status==='static'&&map.isStyleLoaded(),null,{timeout:15000});}
catch(error){console.log('DIAGNOSTIC FAILURE SNAPSHOT',await page.evaluate(()=>({diagFieldStatus,mapErrors,styleLoaded:map.isStyleLoaded()})));throw error;}
await page.evaluate(()=>new Promise(resolve=>{map.once('idle',resolve);map.triggerRepaint();}));
// The captain view now uses contours. Explicitly expose the retained internal
// raster only in this texture regression, preserving its original pixel checks.
await page.evaluate(()=>{for(const id of globalThis.BATHYMETRY_CONTOUR_LAYERS||[])if(map.getLayer(id))map.setLayoutProperty(id,'visibility','none');
  map.setLayoutProperty(presentation.FIELD_LAYER.bathymetry,'visibility','visible');});
await page.evaluate(()=>new Promise(resolve=>{map.once('idle',resolve);map.triggerRepaint();}));
const application=await page.evaluate(()=>{
  const id=presentation.FIELD_SOURCE.bathymetry,layerId=presentation.FIELD_LAYER.bathymetry;
  const source=map.getSource(id),layer=map.getLayer(layerId),bounds=map.getBounds();
  const coords=source.serialize().coordinates;
  const gl=map.getCanvas().getContext('webgl2')||map.getCanvas().getContext('webgl');
  const ext=gl?.getExtension('WEBGL_debug_renderer_info');
  let loadedImagePixels;
  try{const imageCanvas=document.createElement('canvas');imageCanvas.width=512;imageCanvas.height=512;
    imageCanvas.getContext('2d').drawImage(source.image,0,0);loadedImagePixels=[...imageCanvas.getContext('2d').getImageData(6,504,1,1).data];}
  catch(error){loadedImagePixels={error:error.message,constructor:source.image?.constructor.name,keys:Object.keys(source.image||{})};}
  let textureReadback;
  try{const previous=gl.getParameter(gl.FRAMEBUFFER_BINDING),fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,source.texture.texture,0);
    const rgba=new Uint8Array(4);gl.readPixels(6,504,1,1,gl.RGBA,gl.UNSIGNED_BYTE,rgba);
    const previousTexture=gl.getParameter(gl.TEXTURE_BINDING_2D);gl.bindTexture(gl.TEXTURE_2D,source.texture.texture);
    textureReadback={framebufferStatus:gl.checkFramebufferStatus(gl.FRAMEBUFFER),rgba:[...rgba],glError:gl.getError(),textureKeys:Object.keys(source.texture),
      useMipmap:source.texture.useMipmap,minFilter:gl.getTexParameter(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER),magFilter:gl.getTexParameter(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER)};
    gl.bindTexture(gl.TEXTURE_2D,previousTexture);
    gl.bindFramebuffer(gl.FRAMEBUFFER,previous);gl.deleteFramebuffer(fb);
  }catch(error){textureReadback={error:error.message,textureKeys:Object.keys(source.texture||{})};}
  return {sourceId:id,sourceExists:!!source,sourceType:source.serialize().type,
    sourceImageDimensions:source.image?{width:source.image.width,height:source.image.height}:null,
    coordinates:coords,layerId,layerExists:!!layer,layerSource:layer.source,
    visibility:map.getLayoutProperty(layerId,'visibility'),rasterOpacity:map.getPaintProperty(layerId,'raster-opacity'),
    rasterResampling:map.getPaintProperty(layerId,'raster-resampling'),
    order:map.getStyle().layers.map(l=>({id:l.id,type:l.type})),
    viewport:[bounds.getWest(),bounds.getSouth(),bounds.getEast(),bounds.getNorth()],
    center:map.getCenter().toArray(),zoom:map.getZoom(),status:diagFieldStatus.bathymetry.status,
    currentsStatus:diagFieldStatus.currents.status,fixtureRequests,errors:mapErrors,
    renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unavailable',
    loadedImagePixels,textureReadback,livePaint:map.getStyle().layers.find(l=>l.id===layerId).paint,
    projectedSamples:fixture.payload.longitudes.slice(0,7).map(lon=>{const p=map.project([lon,26.825]);return {lon,point:[p.x,p.y]};}),
    geographicLayerScope:'empty synthetic geography; no actual coastline/land mask supplied'};
});
assert.ok(application.sourceExists&&application.layerExists);
assert.equal(application.layerSource,application.sourceId);assert.equal(application.visibility,'visible');
assert.equal(application.rasterOpacity,.85);assert.equal(application.rasterResampling,'nearest');
assert.equal(application.currentsStatus,'off');assert.equal(application.fixtureRequests,1);
assert.ok(application.coordinates.flat().every(Number.isFinite));
const [nw,ne,se,sw]=application.coordinates;
assert.ok(nw[0]<ne[0]&&sw[0]<se[0]&&nw[1]>sw[1]&&ne[1]>se[1]);
const footprint=[nw[0],sw[1],ne[0],nw[1]],v=application.viewport;
const intersection=[Math.max(footprint[0],v[0]),Math.max(footprint[1],v[1]),Math.min(footprint[2],v[2]),Math.min(footprint[3],v[3])];
assert.ok(intersection[0]<intersection[2]&&intersection[1]<intersection[3]);
const geography={footprint,intersection,nondegenerate:true,wrap:false,axesAscending:true,
  orientation:'ascending south-to-north rows mapped to north-up raster; NW NE SE SW corners',
  landCheck:'not established for live data; controlled geographic source is empty'};
await page.screenshot({path:output+'/after-map.png'});
const before=await sharp(output+'/before-map.png').removeAlpha().raw().toBuffer();
const after=await sharp(output+'/after-map.png').removeAlpha().raw().toBuffer();
let changed=0;for(let i=0;i<before.length;i+=3)if(Math.abs(before[i]-after[i])+Math.abs(before[i+1]-after[i+1])+Math.abs(before[i+2]-after[i+2])>20)changed++;
const renderedSamples=application.projectedSamples.map(s=>{const [x,y]=s.point.map(Math.floor),offset=(y*900+x)*3;return {...s,rgb:[...after.slice(offset,offset+3)]};});
assert.ok(changed>1000,'real screenshot must show substantial image contribution');
const expectedMin=baseline?9985:9728;
assert.equal(application.textureReadback.useMipmap,false);
assert.equal(application.textureReadback.minFilter,expectedMin);
if(baseline){
  assert.ok(renderedSamples.every(s=>s.rgb.every(channel=>channel<8)),"original source renders black");
}else{
  assert.equal(new Set(renderedSamples.slice(0,5).map(s=>s.rgb.join(','))).size,5,"five rendered depth bands");
  assert.ok(renderedSamples.slice(0,5).every(s=>s.rgb.reduce((sum,c)=>sum+c,0)>100),"opaque depth colors visible");
  assert.deepEqual(renderedSamples[5].rgb,[16,30,41],"zero cell remains transparent");
  assert.deepEqual(renderedSamples[6].rgb,[16,30,41],"positive cell remains transparent");
}
// Refresh the same image source and verify its newly created texture is repaired too.
if(!baseline){
  await page.evaluate(()=>map.fire('load'));
  await page.waitForFunction(()=>fixtureRequests===2&&diagFieldStatus.bathymetry?.status==='static'&&map.isStyleLoaded(),null,{timeout:15000});
  await page.evaluate(()=>{for(const id of globalThis.BATHYMETRY_CONTOUR_LAYERS||[])if(map.getLayer(id))map.setLayoutProperty(id,'visibility','none');map.setLayoutProperty(presentation.FIELD_LAYER.bathymetry,'visibility','visible');});
  await page.evaluate(()=>new Promise(resolve=>{map.once('idle',resolve);map.triggerRepaint();}));
  await page.screenshot({path:output+'/after-refresh.png'});
  const refreshed=await sharp(output+'/after-refresh.png').removeAlpha().raw().toBuffer();
  for(const sample of renderedSamples){const [x,y]=sample.point.map(Math.floor),i=(y*900+x)*3;
    assert.deepEqual([...refreshed.slice(i,i+3)],sample.rgb,"image replacement retains rendered colors/transparency");}
  await page.evaluate(()=>map.setStyle(map.getStyle(),{diff:false}));
  await page.waitForFunction(()=>fixtureRequests>=3&&diagFieldStatus.bathymetry?.status==='static'&&map.isStyleLoaded(),null,{timeout:15000});
  await page.evaluate(()=>{for(const id of globalThis.BATHYMETRY_CONTOUR_LAYERS||[])if(map.getLayer(id))map.setLayoutProperty(id,'visibility','none');map.setLayoutProperty(presentation.FIELD_LAYER.bathymetry,'visibility','visible');});
  await page.evaluate(()=>new Promise(resolve=>{map.once('idle',resolve);map.triggerRepaint();}));
  await page.screenshot({path:output+'/after-style-reload.png'});
  const reloaded=await sharp(output+'/after-style-reload.png').removeAlpha().raw().toBuffer();
  for(const sample of renderedSamples){const [x,y]=sample.point.map(Math.floor),i=(y*900+x)*3;
    assert.deepEqual([...reloaded.slice(i,i+3)],sample.rgb,"style recreation retains rendered colors/transparency");}
}
const report={result:baseline?'PASS original-black regression reproduced':'PASS production texture repair visibly renders bands/transparency',baselineHead:'98f3356834f2faed913798388cbab420897e8732',mode:baseline?'baseline':'candidate',hookSourceSha256:crypto.createHash('sha256').update(fs.readFileSync(hookPath)).digest('hex'),
  integratedReference:'b98b3040d2f40102a3895e72b3bf82e4e03c8f6f',fixtureScope:'SYNTHETIC TEST EVIDENCE; not the reported live response',
  fixtureSha256:crypto.createHash('sha256').update(JSON.stringify(field)).digest('hex'),
  distribution,canvas:canvasResult,application,geography,
  render:{changedScreenshotPixels:changed,totalScreenshotPixels:900*700,renderedSamples,
    proof:'actual headless Edge screenshot samples; production adapter only, no diagnostic GL filter override'},
  deniedNetworkRequests:denied,pageErrors};
assert.equal(denied.length,0);assert.equal(pageErrors.length,0);assert.equal(application.errors.length,0);
fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({result:report.result,mode:report.mode,output,sourceImageDimensions:application.sourceImageDimensions,minFilter:application.textureReadback.minFilter,useMipmap:application.textureReadback.useMipmap,samples:renderedSamples.map(s=>s.rgb),networkRequests:denied.length,mapErrors:application.errors},null,2));
await page.evaluate(()=>{cleanups.forEach(fn=>fn());map.remove();});
await context.close();
}finally{await browser.close();}
