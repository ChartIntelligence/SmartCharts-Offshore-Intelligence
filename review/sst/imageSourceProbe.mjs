// HISTORICAL PRIVATE-API DIAGNOSTIC ONLY. Never import into an app or renderer.
// The diagnostic fix is rejected for production; bounded image source is DEFERRED.
// Offline diagnostic; optional Playwright module path is a CLI argument. No providers.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const require = createRequire(import.meta.url);
const {chromium} = require(process.argv[2] || 'playwright');
const output = new URL('../../dist/task11c-technical/', import.meta.url);
fs.mkdirSync(output, {recursive: true});
const browser = await chromium.launch({channel: 'msedge', headless: true, args: ['--disable-background-networking']});
const results = [];
try {
  const context = await browser.newContext({viewport: {width: 800, height: 600}, serviceWorkers: 'block'});
  await context.route('**/*', route => route.abort());
  const page = await context.newPage();
  await page.setContent('<html><body style="margin:0"><div id="map" style="width:800px;height:600px"></div></body></html>');
  await page.addScriptTag({content: fs.readFileSync(new URL('../../frontend/node_modules/maplibre-gl/dist/maplibre-gl.js', import.meta.url), 'utf8')});
  for (const variant of [{filter: 'nearest', size: 512}, {filter: 'linear', size: 512}, {filter: 'nearest', size: 513}, {filter: 'nearest', size: 512, diagnosticCorrection: true}]) {
    const result = await page.evaluate(async ({filter, size, diagnosticCorrection = false}) => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.scale(size / 512, size / 512);
      ctx.fillStyle = '#78a5a6'; ctx.fillRect(0, 0, 128, 257);
      ctx.fillStyle = '#88b1aa'; ctx.fillRect(384, 0, 128, 257);
      ctx.fillStyle = '#354b70'; ctx.fillRect(0, 257, 128, 255);
      ctx.fillStyle = '#3e6f8a'; ctx.fillRect(128, 257, 256, 255);
      const url = canvas.toDataURL('image/png'); const img = new Image(); img.src = url; await img.decode();
      const decoded = document.createElement('canvas'); decoded.width = decoded.height = size;
      const dc = decoded.getContext('2d'); dc.drawImage(img, 0, 0);
      const map = new maplibregl.Map({container: 'map', style: {version: 8, sources: {}, layers: [{id: 'background', type: 'background', paint: {'background-color': '#101e29'}}]},
        center: [-88, 26], zoom: 6, canvasContextAttributes: {preserveDrawingBuffer: true}, attributionControl: false});
      window.probeMap = map;
      const errors = []; map.on('error', e => errors.push(e.error.message));
      await new Promise(resolve => map.once('load', resolve));
      map.addSource('probe', {type: 'image', url, coordinates: [[-90,27],[-86,27],[-86,25],[-90,25]]});
      map.addLayer({id: 'probe', type: 'raster', source: 'probe', paint: {'raster-opacity': 1, 'raster-resampling': filter, 'raster-fade-duration': 0}});
      await new Promise(resolve => map.once('idle', resolve));
      const gl = map.getCanvas().getContext('webgl2');
      const source = map.getSource('probe');
      gl.bindTexture(gl.TEXTURE_2D, source.texture.texture);
      const beforeMinFilter = gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER);
      const useMipmap = source.texture.useMipmap;
      if (diagnosticCorrection) {
        // DIAGNOSTIC ONLY: private API intervention proves causality; never an application patch.
        const bind = source.texture.bind;
        source.texture.bind = function(...args) {
          bind.apply(this, args);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        };
        map.triggerRepaint(); await new Promise(resolve => map.once('idle', resolve));
      }
      const samples = [[-89.5,26.5],[-88,26.5],[-86.5,26.5],[-89.5,25.5],[-88,25.5],[-86.5,25.5]];
      const rendered = samples.map(ll => {const p = map.project(ll), pixel = new Uint8Array(4); gl.readPixels(Math.floor(p.x), 599-Math.floor(p.y), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel); return Array.from(pixel);});
      gl.bindTexture(gl.TEXTURE_2D, source.texture.texture);
      return {filter, size, diagnosticCorrection, beforeMinFilter, afterMinFilter: gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER), useMipmap, coordinates: source.coordinates, dimensions: [canvas.width, canvas.height],
        sourcePixels: [[64,64],[256,64],[448,64],[64,448],[256,448],[448,448]].map(([x,y])=>Array.from(dc.getImageData(Math.floor(x*size/512),Math.floor(y*size/512),1,1).data)),
        rendered, errors, glError: gl.getError(), renderer: gl.getParameter(gl.RENDERER), sourceLoaded: source.loaded(), imageType: source.image?.constructor?.name};
    }, variant);
    await page.screenshot({path: new URL(`${variant.filter}-${variant.size}-${!!variant.diagnosticCorrection}.png`, output).pathname.replace(/^\/(.:)/, '$1')});
    results.push(result);
    await page.evaluate(() => window.probeMap.remove());
  }
} finally {
  await browser.close();
  fs.writeFileSync(new URL('image-source-results.json', output), JSON.stringify(results, null, 2));
  fs.writeFileSync(new URL('diagnostic-environment.json', output), JSON.stringify({
    packageVersion: JSON.parse(fs.readFileSync(new URL('../../frontend/node_modules/maplibre-gl/package.json', import.meta.url), 'utf8')).version,
    bundleSha256: createHash('sha256').update(fs.readFileSync(new URL('../../frontend/node_modules/maplibre-gl/dist/maplibre-gl.js', import.meta.url))).digest('hex'),
    network: 'all browser requests blocked', intervention: 'private texture min-filter override in isolated diagnostic only',
  }, null, 2));
}
const expected = [[120,165,166,255],[16,30,41,255],[136,177,170,255],[53,75,112,255],[62,111,138,255],[16,30,41,255]];
assert.deepEqual(results.find(r => r.diagnosticCorrection).rendered, expected, 'diagnostic correction must restore all numeric/missing cell samples');
console.log(JSON.stringify(results));
