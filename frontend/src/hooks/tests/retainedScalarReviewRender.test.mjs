import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {candidateScales,scalePolicy,scaleTile} from '../../../../review/noaa-sst-pilot/scales.mjs';
import {tileIdentity} from '../../../../review/scalar-tiles/presentationTiles.mjs';
import {RETAINED_SST} from '../../utils/retainedScalarReviewLayer.js';
const directory=process.env.PELORA_RETAINED_SST_DIRECTORY;
if(!directory)throw Error('Explicit already-retained SST artifact directory required; no download or synthetic substitute');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const raw=fs.readFileSync(path.join(directory,'source.nc')),fieldBytes=fs.readFileSync(path.join(directory,'field.json'));
assert.equal(hash(raw),RETAINED_SST.sourceSha256);assert.equal(hash(fieldBytes),'4d8aeaa3d060d11351678ccefb195dcaa0ce20fc61f63b4f2cb77f6e20614228');
const field=JSON.parse(fieldBytes),immutableBefore=hash(JSON.stringify(field));
const scale=candidateScales(field).find(s=>s.id==='frame'),policy=scalePolicy(scale);
assert.deepEqual(scale.domainF,[82,89]);assert.equal(scale.clipping.total,0);
const artifact={contractVersion:'pelora-retained-scalar-review-v1',deliveryId:field.deliveryId,source:field.source,product:field.product,scalar:{variableId:field.scalar.variableId,unit:field.scalar.unit},nominalAnalysisTime:'2026-09-22T12:00:00Z',observationTime:field.temporal.observationTime,support:'UNKNOWN',freshness:'UNASSESSED',bounds:field.spatial.deliveredBounds,nativeDegrees:field.spatial.nativeResolution.x,dimensions:[field.grid.width,field.grid.height],policy};
const require=createRequire(import.meta.url),{chromium}=require(process.env.PELORA_BROWSER_TEST_NODE_MODULES+'/playwright'),sharp=require(process.env.PELORA_BROWSER_TEST_NODE_MODULES+'/sharp');
const output=fs.mkdtempSync(path.join(os.tmpdir(),'pelora-retained-scalar-')),cache=new Map(),generationMs=[],tiles=[];
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-background-networking']});
try{
 const context=await browser.newContext({viewport:{width:1000,height:750},serviceWorkers:'block'}),denied=[],errors=[];await context.route('**/*',r=>{denied.push(r.request().url());return r.abort();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.exposeFunction('readRetainedTile',({z,x,y})=>{const key=z+'/'+x+'/'+y;if(!cache.has(key)){const started=performance.now(),tile=scaleTile(field,scale,z,x,y);generationMs.push(performance.now()-started);if(cache.size>=128)cache.delete(cache.keys().next().value);cache.set(key,tile);}const tile=cache.get(key);tiles.push({z,x,y,id:tile.id});return {id:tile.id,data:[...tile.png]};});
 await page.exposeFunction('verifyRetainedTile',({coordinates,id,data})=>{const key=coordinates.z+'/'+coordinates.x+'/'+coordinates.y;const tile=cache.get(key);return !!tile&&tileIdentity(field.deliveryId,coordinates.z,coordinates.x,coordinates.y,policy)===id&&hash(Buffer.from(data))===hash(tile.png);});
 await page.setContent('<style>body{margin:0}#map{position:absolute;inset:0}</style><div id="map"></div>');
 await page.addStyleTag({content:fs.readFileSync('node_modules/maplibre-gl/dist/maplibre-gl.css','utf8')});await page.addScriptTag({content:fs.readFileSync('node_modules/maplibre-gl/dist/maplibre-gl.js','utf8')});
 const sourceHashes={};for(const file of ['frontend/src/utils/peloraMapStyle.js','frontend/src/utils/retainedScalarReviewLayer.js','frontend/src/hooks/useRetainedScalarReview.js']){const source=fs.readFileSync(file,'utf8');sourceHashes[file]=hash(source);await page.addScriptTag({content:source.replace(/^import[\s\S]*?;\r?\n/gm,'').replace(/^export /gm,'')});}
 await page.evaluate(async artifact=>{
  globalThis.artifact=artifact;globalThis.clock=1000;globalThis.mode='valid';globalThis.states=[];globalThis.mapErrors=[];globalThis.artifactReads=0;globalThis.owner={authorized:true,ownerKey:'SYNTHETIC-REVIEW-OWNER',revision:1,expiresAt:20000};
  globalThis.base=()=>({version:8,sources:{'review-opportunity':{type:'geojson',data:{type:'FeatureCollection',features:[{type:'Feature',geometry:{type:'Point',coordinates:[-90,27]},properties:{id:'SYNTHETIC-SIBLING'}}]}}},layers:[{id:'background',type:'background',paint:{'background-color':'#101e29'}},{id:'review-opportunity',type:'circle',source:'review-opportunity',metadata:{'pelora:visualSlot':'opportunities'},paint:{'circle-radius':7,'circle-color':'#fff'}}]});
  globalThis.map=new maplibregl.Map({container:'map',style:base(),center:[-89,25],zoom:5,renderWorldCopies:false,attributionControl:false});map.on('error',e=>mapErrors.push(e.error?.message));await new Promise(r=>map.once('load',r));
  globalThis.cleanups=[];globalThis.useRef=value=>({current:value});globalThis.useEffect=fn=>{const cleanup=fn();if(cleanup)cleanups.push(cleanup);};
  globalThis.review={enabled:true,getArtifact:async()=>{artifactReads++;return mode==='valid'?artifact:null;},readTile:async({coordinates})=>{const tile=await readRetainedTile(coordinates);return {id:tile.id,data:new Uint8Array(tile.data)};},verifyTile:({coordinates,tile})=>verifyRetainedTile({coordinates,id:tile.id,data:[...tile.data]}),protocolPort:{addProtocol:(s,fn)=>maplibregl.addProtocol(s,fn),removeProtocol:s=>maplibregl.removeProtocol(s)},getAuthority:()=>owner,now:()=>clock,onState:state=>states.push(state),onController:c=>globalThis.controller=c,setTimer:fn=>{globalThis.heartbeat=fn;return 1;},clearTimer:()=>globalThis.heartbeat=null};
  useRetainedScalarReview({mapRef:{current:map},review});await controller.ready;
 },artifact);
 const idle=()=>page.evaluate(()=>map.loaded()&&map.areTilesLoaded()?Promise.resolve():new Promise(r=>map.once('idle',r)));
 await idle();await page.waitForFunction(()=>states.at(-1).status==='historical-review'&&map.areTilesLoaded());
 assert.equal(await page.evaluate(()=>map.getPaintProperty(controller.layerId,'raster-resampling')),'nearest');
 const observations=[];for(const width of [1000,390]){
  await page.setViewportSize({width,height:750});await page.evaluate(()=>{map.resize();map.fitBounds([[-98,18],[-80,31]],{duration:0,padding:20});});await idle();
  const imagePath=output+'/historical-'+width+'.png';await page.screenshot({path:imagePath});const {data,info}=await sharp(imagePath).removeAlpha().raw().toBuffer({resolveWithObject:true});let colored=0;for(let y=20;y<info.height-120;y++)for(let x=20;x<info.width-20;x++){const i=(y*info.width+x)*3;if(data[i]!==16||data[i+1]!==30||data[i+2]!==41)colored++;}assert(colored>1000,'actual GPU output contains retained scalar colors');
  const before=await page.evaluate(()=>({reads:artifactReads,source:controller.sourceId,domain:states.at(-1).field.policy.displayDomainK}));
  for(const zoom of [6,5,6]){await page.evaluate(zoom=>map.jumpTo({zoom}),zoom);await idle();assert.equal(await page.evaluate(()=>states.at(-1).status),'historical-review');}
  const after=await page.evaluate(()=>({reads:artifactReads,source:controller.sourceId,domain:states.at(-1).field.policy.displayDomainK,notice:document.querySelector('[data-retained-scalar-review]').textContent,overflow:document.documentElement.scrollWidth>innerWidth}));assert.equal(after.reads,before.reads);assert.equal(after.source,before.source);assert.deepEqual(after.domain,before.domain);assert(!after.overflow);assert(after.notice.includes('HISTORICAL')&&after.notice.includes('82–89°F')&&after.notice.includes('unassessed'));observations.push({width,coloredPixels:colored,artifactReads:after.reads,notice:after.notice});
 }
 await page.evaluate(()=>map.setStyle(base()));await idle();await page.waitForFunction(()=>map.getLayer(controller.layerId)&&map.areTilesLoaded());assert.equal(await page.evaluate(()=>states.at(-1).status),'historical-review');
 await page.evaluate(async()=>{mode='malformed';await controller.refresh();});assert.equal(await page.evaluate(()=>states.at(-1).status),'unavailable');assert.equal(await page.evaluate(()=>map.getSource(controller.sourceId)!=null),false);assert(await page.evaluate(()=>!!map.getLayer('review-opportunity')));
 await page.evaluate(()=>{map.fire('idle');map.fire('style.load');});assert.equal(await page.evaluate(()=>states.at(-1).field),null);
 await page.evaluate(async()=>{mode='valid';await controller.refresh();});await idle();assert.equal(await page.evaluate(()=>states.at(-1).status),'historical-review');
 await page.evaluate(()=>{clock=20001;heartbeat();});assert.equal(await page.evaluate(()=>states.at(-1).field),null);assert.equal(await page.evaluate(()=>map.getSource(controller.sourceId)!=null),false);assert(await page.evaluate(()=>!!map.getLayer('review-opportunity')));
 await page.evaluate(()=>cleanups.forEach(fn=>fn()));assert.equal(await page.evaluate(()=>document.querySelector('[data-retained-scalar-review]')),null);
 assert.deepEqual(errors,[]);assert.deepEqual(denied,[]);assert.deepEqual(await page.evaluate(()=>mapErrors),[]);assert.equal(hash(JSON.stringify(field)),immutableBefore);assert.equal(hash(fs.readFileSync(path.join(directory,'field.json'))),hash(fieldBytes));
 const sample=scaleTile(field,scale,5,8,13),decoded=await sharp(sample.png).ensureAlpha().raw().toBuffer();let transparent=0,opaque=0;const colors=new Set();for(let i=0;i<decoded.length;i+=4){if(decoded[i+3]===0)transparent++;else{opaque++;colors.add(decoded.subarray(i,i+3).toString('hex'));}}assert(transparent>0&&opaque>0&&colors.size>10);
 const report={scope:'Controlled retained historical NOAA evidence, offline headless Edge/MapLibre5.24.0, not operational or physical-device QA',sourceHashes,sourceSha256:hash(raw),fieldSha256:hash(fieldBytes),deliveryId:field.deliveryId,policy,domainF:scale.domainF,clipping:scale.clipping,observations,tileRequests:tiles.length,uniqueCachedTiles:cache.size,cacheHostLimit:128,tileGenerationMs:{max:Math.max(...generationMs),median:[...generationMs].sort((a,b)=>a-b)[Math.floor(generationMs.length/2)]},sample:{z:5,x:8,y:13,id:sample.id,transparent,opaque,colors:colors.size},states:'historical/unassessed; malformed and expiry unavailable; OFF disposed',errors,externalRequests:denied,immutableScientificField:true};
 fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({result:'PASS retained scalar actual raster, historical labels, pan/zoom policy continuity, style reload, malformed/expiry locality and OFF disposal',output,observations,sample:report.sample,tileGenerationMs:report.tileGenerationMs}));await page.evaluate(()=>map.remove());await context.close();
}finally{await browser.close();}
