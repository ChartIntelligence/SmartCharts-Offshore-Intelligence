// Identical cameras per candidate; no environmental network access permitted.
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {startScaleReview} from './scaleReview.mjs';
import {DIRECTORY} from './pilot.mjs';
const {chromium}=createRequire(import.meta.url)(process.argv[2]||'playwright');
const {server,scales,stats}=await startScaleReview();
const output=`${DIRECTORY}scale-review/`;mkdirSync(output,{recursive:true});
const views=[['full-gulf',[[-98,18],[-80,31]]],['northern-gulf',[[-96,26],[-82,31]]],['eastern-gulf-desoto',[[-89.5,25],[-82,30.7]]],['central-western-gulf',[[-97,21],[-87,29]]],['mobile-width-gulf',[[-98,18],[-80,31]]]];
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-background-networking']});
const hosts=new Set(),blocked=[],errors=[],cameras=[];
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,serviceWorkers:'block'});
 await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin==='http://127.0.0.1:5192')return route.continue();if(u.protocol==='https:'&&u.hostname==='demotiles.maplibre.org'){hosts.add(u.hostname);return route.continue();}blocked.push(u.origin);return route.abort();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5192');
 await page.waitForFunction(()=>window.pilotReady,null,{timeout:60000});
 for(const scale of scales){
  await page.evaluate(id=>setCandidate(id),scale.id);
  for(const [name,bounds] of views){
   await page.setViewportSize(name.startsWith('mobile')?{width:390,height:844}:{width:1440,height:1000});
   await page.evaluate(bounds=>{map.resize();map.jumpTo({center:[-89,25],zoom:4,bearing:0,pitch:0,padding:0});map.fitBounds(bounds,{padding:{top:155,bottom:180,left:35,right:55},duration:0});},bounds);
   await page.waitForFunction(()=>map.loaded()&&map.areTilesLoaded(),null,{timeout:60000});
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   cameras.push({candidate:scale.id,view:name,...await page.evaluate(()=>({center:map.getCenter().toArray(),zoom:map.getZoom(),overflow:document.documentElement.scrollWidth>innerWidth}))});
   await page.screenshot({path:`${output}${scale.id}-${name}.png`});
  }
 }
 errors.push(...await page.evaluate(()=>mapErrors));
 writeFileSync(`${output}camera-check.json`,JSON.stringify(cameras,null,2));
 for(const [name] of views){const c=cameras.filter(c=>c.view===name);if(c.some(x=>x.zoom!==c[0].zoom||JSON.stringify(x.center)!==JSON.stringify(c[0].center)||x.overflow))throw Error('Incomparable cameras/overflow');}
 // Contact sheet made from actual screenshots, never generated geography or data.
 const sheet=await context.newPage();await sheet.setViewportSize({width:1440,height:1160});
 const images=scales.map(s=>`<section><h2>${s.label} · ${s.domainF.map(x=>x.toFixed(2)).join('–')}°F · ${s.clipping.percent.toFixed(2)}% clipped</h2><img src="data:image/png;base64,${readFileSync(`${output}${s.id}-full-gulf.png`).toString('base64')}"></section>`).join('');
 await sheet.setContent(`<style>body{margin:0;background:#090e13;color:white;font:13px system-ui}header{padding:14px}main{display:grid;grid-template-columns:1fr 1fr;gap:6px}section{min-width:0}h2{font-size:14px;margin:8px}img{width:100%;display:block}</style><header>PELORA · REAL NOAA SST ANALYSIS — PILOT EVIDENCE · Same frame / geography / provisional hues · 22 Sep 2026 12:00 UTC · Freshness UNASSESSED</header><main>${images}</main>`);
 await sheet.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));await sheet.screenshot({path:`${output}comparison-sheet.png`,fullPage:true});
 writeFileSync(`${output}visual-receipt.json`,JSON.stringify({geographicHosts:[...hosts],blocked,errors,cameras,scales,stats,physicalIphone:false},null,2));
 console.log(JSON.stringify({screenshots:20,comparisonSheet:1,geographicHosts:[...hosts],blocked,errors,output}));
 if(errors.length||blocked.length)throw Error('Visual review requests/errors');
}finally{await browser.close();await new Promise(r=>server.close(r));}
