// Offline scale diagnostics only. Generated checkerboard data is NOT ocean evidence.
import {createRequire} from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const {chromium} = require(process.argv[2] || 'playwright');
const browser = await chromium.launch({channel: 'msedge', headless: true, args: ['--disable-background-networking']});
const results = [];
try {
  for (const viewport of [{width: 800, height: 600}, {width: 390, height: 844}]) {
    const context = await browser.newContext({viewport, serviceWorkers: 'block'});
    await context.route('**/*', route => route.abort());
    const page = await context.newPage();
    await page.setContent(`<div id="map" style="position:fixed;inset:0"></div>`);
    await page.addScriptTag({content: fs.readFileSync(new URL('../../frontend/node_modules/maplibre-gl/dist/maplibre-gl.js', import.meta.url), 'utf8')});
    const measurements = await page.evaluate(async viewport => {
      const map = new maplibregl.Map({container: 'map', style: {version: 8, sources: {}, layers: [{id: 'bg', type: 'background', paint: {'background-color': '#101e29'}}]}, center: [2, 2], zoom: 5, attributionControl: false});
      await new Promise(r => map.once('load', r));
      const rows = [], elapsed = async operation => {
        const start = performance.now(); operation(); await new Promise(r => map.once('idle', r)); return performance.now() - start;
      };
      for (const n of [32,64,128,256]) {
        const start = performance.now(), values = [], missing = [], features = [];
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = n;
        const ctx = canvas.getContext('2d'), image = ctx.createImageData(n, n);
        for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
          const k = j * n + i, absent = k % 7 === 0, warm = (i + j) % 2;
          values.push(absent ? null : 280 + warm * 10); missing.push(absent ? 'provider-no-data' : null);
          image.data.set(absent ? [0,0,0,0] : warm ? [120,165,166,255] : [53,75,112,255], k * 4);
          if (!absent) {
            const w=i*4/n,e=(i+1)*4/n,s=j*4/n,t=(j+1)*4/n;
            features.push({type:'Feature',properties:{color:warm?'#78a5a6':'#354b70'},geometry:{type:'Polygon',coordinates:[[[w,s],[e,s],[e,t],[w,t],[w,s]]]}});
          }
        }
        const generatedMs = performance.now() - start;
        ctx.putImageData(image, 0, 0);
        const encodeStart = performance.now(), url = canvas.toDataURL('image/png'), encodeMs = performance.now() - encodeStart;
        const numericJsonBytes = new TextEncoder().encode(JSON.stringify({width:n,height:n,values,missing})).length;
        const geojson = {type:'FeatureCollection',features};
        const polygonJsonBytes = new TextEncoder().encode(JSON.stringify(geojson)).length;
        let worstTimerDelayMs = 0, last = performance.now();
        const timer = setInterval(() => {const now=performance.now();worstTimerDelayMs=Math.max(worstTimerDelayMs,now-last-16);last=now;},16);
        // Linear is a throughput-only control; NOT an approved missing-mask rendering method.
        const rasterMs = await elapsed(() => {
          map.addSource('raster',{type:'image',url,coordinates:[[0,4],[4,4],[4,0],[0,0]]});
          map.addLayer({id:'raster',type:'raster',source:'raster',paint:{'raster-resampling':'linear','raster-fade-duration':0}});
        });
        const rasterUpdateMs = await elapsed(() => map.getSource('raster').updateImage({url}));
        map.removeLayer('raster'); map.removeSource('raster');
        const polygonMs = await elapsed(() => {
          map.addSource('cells',{type:'geojson',data:geojson});
          map.addLayer({id:'cells',type:'fill',source:'cells',paint:{'fill-color':['get','color'],'fill-antialias':false}});
        });
        const polygonUpdateMs = await elapsed(() => map.getSource('cells').setData(geojson));
        clearInterval(timer); map.removeLayer('cells');map.removeSource('cells');
        rows.push({viewport,n,cells:n*n,features:features.length,numericJsonBytes,polygonJsonBytes,rgbaBytes:n*n*4,
          pngBytes:atob(url.split(',')[1]).length,generatedMs,encodeMs,rasterMs,rasterUpdateMs,polygonMs,polygonUpdateMs,worstTimerDelayMs});
      }
      map.remove(); return rows;
    }, viewport);
    results.push(...measurements); await context.close();
  }
} finally {
  await browser.close(); const output = new URL('../../dist/task11c-technical/', import.meta.url);
  fs.mkdirSync(output,{recursive:true});fs.writeFileSync(new URL('scaling-results.json',output),JSON.stringify(results,null,2));
}
console.log(JSON.stringify(results));
