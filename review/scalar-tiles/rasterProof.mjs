// Offline browser proof: all tile URLs intercepted in memory, every other request blocked.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {governedFixture} from './fixture.mjs';
import {rasterTile,lonLat} from './presentationTiles.mjs';
const {chromium}=createRequire(import.meta.url)(process.argv[2] || 'playwright');
const output=new URL('../../dist/task11c1-review/',import.meta.url); fs.mkdirSync(output,{recursive:true});
const field=await governedFixture(), cache=new Map(), requests=[], blocked=[], errors=[], results=[];
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-background-networking']});
try {
  const context=await browser.newContext({viewport:{width:1000,height:700},deviceScaleFactor:1,serviceWorkers:'block'});
  await context.route('**/*',async route=>{
    const match=/^https:\/\/pelora-review\.invalid\/(a|b)\/7\/(\d+)\/(\d+)\.png$/.exec(route.request().url());
    if(!match) { blocked.push(route.request().url()); return route.abort(); }
    const x=Number(match[2]),y=Number(match[3]),key=`7/${x}/${y}`;
    if(!cache.has(key)) { const start=performance.now(); const tile=rasterTile(field,7,x,y); cache.set(key,{...tile,encodeMs:performance.now()-start}); }
    requests.push({namespace:match[1],key});
    await route.fulfill({status:200,contentType:'image/png',headers:{'Access-Control-Allow-Origin':'*'},body:cache.get(key).png});
  });
  const page=await context.newPage(); page.on('pageerror',e=>errors.push(e.message));
  await page.setContent('<style>body{margin:0;background:#101e29}#map{width:100vw;height:100vh}#notice{position:absolute;top:8px;left:8px;z-index:3;color:white;background:#090e13;padding:10px;font:14px sans-serif}</style><div id="map"></div><div id="notice">SYNTHETIC SST — TEST EVIDENCE · public raster tiles · no real geography</div>');
  await page.addScriptTag({content:fs.readFileSync(new URL('../../frontend/node_modules/maplibre-gl/dist/maplibre-gl.js',import.meta.url),'utf8')});
  let operationStarted=performance.now();
  await page.evaluate(async()=>{
    window.base=()=>({version:8,sources:{},layers:[{id:'ocean',type:'background',paint:{'background-color':'#101e29'}}]});
    window.map=new maplibregl.Map({container:'map',style:base(),center:[-88,26],zoom:6,attributionControl:false,renderWorldCopies:false,fadeDuration:0});
    window.mapErrors=[]; map.on('error',e=>mapErrors.push(String(e.error)));
    await new Promise(resolve=>map.once('load',resolve));
    window.addTiles=(ns='a')=>{map.addSource('sst',{type:'raster',tiles:[`https://pelora-review.invalid/${ns}/7/{x}/{y}.png`],tileSize:256,minzoom:7,maxzoom:7,bounds:[-92,23,-83,29]});map.addLayer({id:'sst',type:'raster',source:'sst',paint:{'raster-resampling':'nearest','raster-opacity':1,'raster-fade-duration':0}});};
    addTiles();
  });
  async function capture(name) {
    await page.waitForFunction(()=>map.loaded() && map.areTilesLoaded());
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const settledMs=performance.now()-operationStarted;
    const png=await page.screenshot(); fs.writeFileSync(new URL(`${name}.png`,output),png);
    const metrics=await page.evaluate(async data=>{
      const img=new Image();img.src=data;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
      const pixel=(x,y)=>Array.from(ctx.getImageData(Math.floor(x),Math.floor(y),1,1).data);
      const at=(lon,lat)=>{const p=map.project([lon,lat]);return p.x>=0&&p.y>=50&&p.x<c.width&&p.y<c.height?pixel(p.x,p.y):null;};
      const points={zero:[-89.5,25.5],ocean:[-88,25.5],noData:[-86.5,25.5],land:[-88,26.5],northwest:[-89.5,26.5],northeast:[-86.5,26.5],outside:[-85,26],empty:[-88,28]};
      const samples=Object.fromEntries(Object.entries(points).map(([k,p])=>[k,at(...p)]));
      const seam=map.project([-87.1875,25.5]);const seamPixels=[];
      if(seam.x>6&&seam.x<c.width-6&&seam.y>50&&seam.y<c.height) for(let dx=-5;dx<=5;dx++) seamPixels.push(pixel(seam.x+dx,seam.y));
      const boundary=map.project([-88,26]);const edgePixels=[];
      if(boundary.x>0&&boundary.x<c.width&&boundary.y>58&&boundary.y<c.height-8)for(let dy=-8;dy<=8;dy++)edgePixels.push(pixel(boundary.x,boundary.y+dy));
      const tileWidth=map.project([-87.1875,26]).x-map.project([-90,26]).x;
      return {zoom:map.getZoom(),tileScreenWidth:tileWidth,samples,seamPixels,edgePixels,errors:mapErrors};
    },`data:image/png;base64,${png.toString('base64')}`);
    results.push({name,settledMs,...metrics});
  }
  await capture('initial');
  for(const [name,zoom,center] of [['below-min-source-zoom',5.25,[-88,26]],['minification',5.6,[-88,26]],['magnification',7.25,[-88,26]],['pan',6,[-87,26]]]) {
    operationStarted=performance.now();
    await page.evaluate(({zoom,center})=>map.jumpTo({zoom,center}),{zoom,center}); await capture(name);
  }
  operationStarted=performance.now();await page.evaluate(()=>{map.jumpTo({zoom:6,center:[-88,26]});map.getSource('sst').setTiles(['https://pelora-review.invalid/b/7/{x}/{y}.png']);});await capture('replacement');
  operationStarted=performance.now();await page.evaluate(()=>{map.removeLayer('sst');map.removeSource('sst');addTiles('b');});await capture('source-layer-reload');
  operationStarted=performance.now();await page.evaluate(async()=>{const ready=new Promise(r=>map.once('style.load',r));map.setStyle(base(),{diff:false});await ready;addTiles();});await capture('style-reload');
  operationStarted=performance.now();await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{map.resize();map.jumpTo({zoom:5.5,center:[-88,26]});});await capture('mobile-width-desktop-engine');
  const background=[16,30,41,255],ocean=[62,111,138,255];
  for(const result of results.filter(r=>r.name!=='below-min-source-zoom')) {
    assert.deepEqual(result.samples.zero,[53,75,112,255]);assert.deepEqual(result.samples.ocean,ocean);
    assert.deepEqual(result.samples.land,background);assert.deepEqual(result.samples.noData,background);
    for(const pixel of result.seamPixels)assert.deepEqual(pixel,ocean);
    assert.deepEqual(result.errors,[]);
  }
  const blended=r=>r.edgePixels.filter(p=>JSON.stringify(p)!==JSON.stringify(background)&&JSON.stringify(p)!==JSON.stringify(ocean));
  assert.equal(blended(results.find(r=>r.name==='magnification')).length,0);
  assert.ok(requests.some(r=>r.namespace==='b'));assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);
  const qualification={rasterPlumbing:'DEMONSTRATED_LOCALLY',strictNearestMinification:blended(results.find(r=>r.name==='minification')).length?'NOT_SATISFIED':'NO_BLEND_OBSERVED',minificationBlendedPixels:blended(results.find(r=>r.name==='minification')),physicalIphone:'NOT_TESTED'};
  const tiles=[...cache].map(([key,t])=>({key,id:t.id,rgbaBytes:t.rgba.length,pngBytes:t.png.length,encodeMs:t.encodeMs,opaquePixels:t.rgba.filter((v,i)=>i%4===3&&v===255).length}));
  for(const [key,t] of cache) fs.writeFileSync(new URL(`tile-${key.replaceAll('/','-')}.png`,output),t.png);
  fs.writeFileSync(new URL('results.json',output),JSON.stringify({qualification,maplibre:'5.24.0',synthetic:true,fieldId:field.deliveryId,results,tiles,requests,blocked,errors,sharedBoundary:[lonLat(7,32,54,256,0),lonLat(7,33,54,0,0)]},null,2));
  console.log(JSON.stringify({captures:results.length,tiles:tiles.length,blocked,errors,results:results.map(({name,samples,tileScreenWidth})=>({name,samples,tileScreenWidth}))},null,2));
}finally{await browser.close();}
