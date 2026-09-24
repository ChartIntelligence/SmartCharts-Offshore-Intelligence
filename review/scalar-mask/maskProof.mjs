// REJECTED EXPERIMENT: historical proof, not a selected presentation policy.
// Public raster APIs only. Browser requests intercepted locally; no external services.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {maskFixture} from './fixture.mjs';
import {guardedTile} from './maskTiles.mjs';
import {sstColor} from '../../frontend/src/utils/syntheticSstDisplay.js';
const {chromium}=createRequire(import.meta.url)(process.argv[2]||'playwright');
const output=new URL('../../dist/task11c2-review/',import.meta.url);fs.mkdirSync(output,{recursive:true});
const field=await maskFixture(),before=JSON.stringify(field),cache=new Map(),results=[],blocked=[],errors=[];
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-background-networking']});
try {
  const context=await browser.newContext({viewport:{width:1000,height:700},deviceScaleFactor:1,serviceWorkers:'block'});
  await context.route('**/*',async route=>{
    const m=/^https:\/\/pelora-mask\.invalid\/([012])\/([5-9])\/(\d+)\/(\d+)\.png$/.exec(route.request().url());
    if(!m){blocked.push(route.request().url());return route.abort();}
    const [guard,z,x,y]=m.slice(1).map(Number),key=m.slice(1).join('/');
    if(!cache.has(key))cache.set(key,guardedTile(field,z,x,y,guard));
    return route.fulfill({status:200,contentType:'image/png',headers:{'Access-Control-Allow-Origin':'*'},body:cache.get(key).png});
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.setContent('<style>body{margin:0;background:#101e29}#map{width:100vw;height:100vh}#label{position:absolute;top:4px;left:4px;right:4px;z-index:3;color:white;background:#090e13;font:13px sans-serif;padding:6px}</style><div id="map"></div><div id="label">SYNTHETIC TEST EVIDENCE</div>');
  await page.addScriptTag({content:fs.readFileSync(new URL('../../frontend/node_modules/maplibre-gl/dist/maplibre-gl.js',import.meta.url),'utf8')});
  await page.evaluate(async()=>{
    window.map=new maplibregl.Map({container:'map',center:[-88,26],zoom:6,style:{version:8,sources:{},layers:[{id:'ocean',type:'background',paint:{'background-color':'#101e29'}}]},attributionControl:false,renderWorldCopies:false,fadeDuration:0});
    window.mapErrors=[];map.on('error',e=>mapErrors.push(String(e.error)));await new Promise(r=>map.once('load',r));
    map.addSource('sst',{type:'raster',tiles:['https://pelora-mask.invalid/0/{z}/{x}/{y}.png'],tileSize:256,minzoom:5,maxzoom:9,bounds:[-92,23,-83,29]});
    map.addLayer({id:'sst',type:'raster',source:'sst',paint:{'raster-resampling':'nearest','raster-opacity':1,'raster-fade-duration':0}});
  });
  async function measure(guard,zoom,mobile=false) {
    await page.evaluate(({guard,zoom})=>{
      map.jumpTo({zoom,center:[-88,26]});map.getSource('sst').setTiles([`https://pelora-mask.invalid/${guard}/{z}/{x}/{y}.png`]);
      document.getElementById('label').textContent=`SYNTHETIC TEST EVIDENCE · guard ${guard}px · zoom ${zoom} · abstract mask fixture, no real geography`;
    },{guard,zoom});
    await page.waitForFunction(()=>map.loaded()&&map.areTilesLoaded());
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const png=await page.screenshot(),name=`${mobile?'mobile':'desktop'}-guard${guard}-zoom${zoom}`;
    fs.writeFileSync(new URL(`${name}.png`,output),png);
    const sample=await page.evaluate(async({data,grid,colors})=>{
      const image=new Image();image.src=data;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
      const bytes=ctx.getImageData(0,0,canvas.width,canvas.height).data;
      const index=(axis,v)=>{if(v<axis[0]||v>axis.at(-1))return -1;let i=0;while(i+1<axis.length&&v>=(axis[i]+axis[i+1])/2)i++;return i;};
      const columns=Array.from({length:canvas.width},(_,i)=>index(grid.axes.x,map.unproject([i+0.5,0]).lng));
      const rows=Array.from({length:canvas.height},(_,j)=>index(grid.axes.y,map.unproject([0,j+0.5]).lat));
      const count={},bad={},examples={},valid={pixels:0,background:0,mixedDisplay:0};
      for(let j=60;j<canvas.height;j++)for(let i=0;i<canvas.width;i++) {
        const cell=columns[i]<0||rows[j]<0?-1:rows[j]*grid.width+columns[i],reason=cell<0?'outside-coverage':grid.missing[cell];
        const o=(j*canvas.width+i)*4,isBackground=bytes[o]===16&&bytes[o+1]===30&&bytes[o+2]===41;
        if(reason){count[reason]=(count[reason]||0)+1;if(!isBackground){bad[reason]=(bad[reason]||0)+1;if(!examples[reason])examples[reason]={x:i,y:j,rgb:[...bytes.slice(o,o+3)],location:map.unproject([i+0.5,j+0.5]).toArray()};}}
        else {valid.pixels++;if(isBackground)valid.background++;else if(colors[cell].some((v,k)=>v!==bytes[o+k]))valid.mixedDisplay++;}
      }
      const seam=map.project([-87.1875,25.3]),seamPixels=[];
      if(seam.x>6&&seam.x<canvas.width-6&&seam.y>60&&seam.y<canvas.height)for(let dx=-5;dx<=5;dx++) {const o=(Math.floor(seam.y)*canvas.width+Math.floor(seam.x+dx))*4;seamPixels.push([...bytes.slice(o,o+3)]);}
      return {count,bad,examples,valid,seamPixels,errors:mapErrors};
    },{data:`data:image/png;base64,${png.toString('base64')}`,grid:field.grid,colors:field.grid.values.map(v=>v===null?null:sstColor(v).match(/\d+/g).map(Number))});
    results.push({name,guard,zoom,mobile,...sample});console.log(JSON.stringify({name,bad:sample.bad,suppressed:sample.valid.background}));
  }
  const zooms=[4.49,4.5,5.49,5.5,5.6,5.75,5.99,6,6.01,6.25,6.49,6.5,6.6,6.99,7.01];
  for(const guard of [0,1])for(const zoom of zooms)await measure(guard,zoom);
  let selected=results.filter(r=>r.guard===1).every(r=>Object.keys(r.bad).length===0)?1:null;
  if(selected===null){for(const zoom of zooms)await measure(2,zoom);if(results.filter(r=>r.guard===2).every(r=>Object.keys(r.bad).length===0))selected=2;}
  // If neither guard qualifies, repeat the strongest TESTED candidate diagnostically,
  // without selecting it or broadening the guard search.
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>map.resize());
  for(const zoom of [5.49,5.5,5.6,5.99,6.01,6.49,6.5])await measure(selected??2,zoom,true);
  const safe=selected!==null&&results.filter(r=>r.guard===selected).every(r=>Object.keys(r.bad).length===0);
  const tiles=[...cache].map(([key,t])=>({key,id:t.id,validPixels:t.validPixels,suppressedPixels:t.suppressedPixels,pngBytes:t.png.length}));
  const verdict=safe?'QUALIFIED_FOR_SYNTHETIC_RENDERER_CHECKPOINT':'MASK_SAFETY_UNRESOLVED';
  assert.equal(JSON.stringify(field),before);assert.deepEqual(blocked,[]);assert.deepEqual(errors,[]);
  for(const r of results){assert.deepEqual(r.errors,[]);for(const p of r.seamPixels)assert.notDeepEqual(p,[16,30,41]);}
  fs.writeFileSync(new URL('results.json',output),JSON.stringify({verdict,selected,fieldId:field.deliveryId,results,tiles,blocked,errors},null,2));
  // Presentation-only contact sheet from actual rendered screenshots; no new geography.
  const selectedForArtifact=selected??2;
  const images=[0,selectedForArtifact].map(g=>fs.readFileSync(new URL(`desktop-guard${g}-zoom6.5.png`,output)).toString('base64'));
  const sheet=await page.evaluate(async images=>{const c=document.createElement('canvas');c.width=2000;c.height=700;const ctx=c.getContext('2d');for(let i=0;i<images.length;i++){const im=new Image();im.src='data:image/png;base64,'+images[i];await im.decode();ctx.drawImage(im,i*1000,0);}return c.toDataURL('image/png').split(',')[1];},images);
  fs.writeFileSync(new URL('comparison.png',output),Buffer.from(sheet,'base64'));
  // Nearest-expanded screenshot crops expose single-pixel failure evidence, not new SST.
  const crop=await page.evaluate(async images=>{
    const c=document.createElement('canvas');c.width=1200;c.height=1050;const ctx=c.getContext('2d');ctx.fillStyle='#090e13';ctx.fillRect(0,0,c.width,c.height);ctx.imageSmoothingEnabled=false;
    const regions=[{label:'land edge',x:320,y:240},{label:'internal no-data hole',x:460,y:305},{label:'tile seam / unknown mask',x:595,y:230}];
    for(let col=0;col<2;col++){const im=new Image();im.src='data:image/png;base64,'+images[col];await im.decode();
      for(let row=0;row<regions.length;row++){const r=regions[row];ctx.drawImage(im,r.x,r.y,65,65,col*600,row*350+35,300,300);ctx.fillStyle='white';ctx.font='16px sans-serif';ctx.fillText(`SYNTHETIC TEST EVIDENCE | ${col?'2px guard (FAILED)':'no guard'} | ${r.label}`,col*600+4,row*350+22);}}
    return c.toDataURL('image/png').split(',')[1];
  },images);
  fs.writeFileSync(new URL('failure-closeups.png',output),Buffer.from(crop,'base64'));
  console.log(verdict,selected);
}finally{await browser.close();}
