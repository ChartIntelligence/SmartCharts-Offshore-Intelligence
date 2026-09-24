// Explicit local review launcher. No production imports, env loading, provider fetches or Auth.
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {buildPilot} from './pilot.mjs';
import {pilotTile} from './tiles.mjs';
export async function startReview(port = 5191) {
  const pilot = await buildPilot(new Date().toISOString());
  const assets = new Map([
    ['/', [new URL('./index.html', import.meta.url), 'text/html']],
    ['/maplibre.js', [new URL('../../frontend/node_modules/maplibre-gl/dist/maplibre-gl.js', import.meta.url), 'text/javascript']],
    ['/maplibre.css', [new URL('../../frontend/node_modules/maplibre-gl/dist/maplibre-gl.css', import.meta.url), 'text/css']],
    ['/style.mjs', [new URL('../../frontend/src/utils/peloraMapStyle.js', import.meta.url), 'text/javascript']],
  ]);
  const cache = new Map();
  const server = createServer((req, res) => {
    const path = new URL(req.url, 'http://127.0.0.1').pathname;
    if (req.method !== 'GET') { res.writeHead(405); return res.end(); }
    const asset = assets.get(path);
    if (asset) { res.writeHead(200, {'Content-Type': asset[1]}); return res.end(readFileSync(asset[0])); }
    if (path === '/pilot') {
      const {field, summary} = pilot;
      res.writeHead(200, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
      return res.end(JSON.stringify({notice: summary.notice, nominalTime: summary.nominalTime, acquiredAt: summary.acquisition.completedAt,
        ageAtAcquisitionHours: summary.evidenceAgeAtAcquisitionHours, freshness: summary.freshness,
        product: field.product, deliveryId: field.deliveryId, stats: summary.stats.analysed_sst,
        tileTemplate: `/tiles/${field.deliveryId}/{z}/{x}/{y}.png`}));
    }
    const tile = /^\/tiles\/(osfd-[a-f0-9]{64})\/([0-9]+)\/([0-9]+)\/([0-9]+)\.png$/.exec(path);
    if (tile && tile[1] === pilot.field.deliveryId) {
      const [z, x, y] = tile.slice(2).map(Number);
      if (z < 3 || z > 7 || x >= 2 ** z || y >= 2 ** z) { res.writeHead(400); return res.end(); }
      try {
        if (!cache.has(path)) {
          if (cache.size >= 128) cache.delete(cache.keys().next().value);
          const rendered = pilotTile(pilot.field, z, x, y);
          cache.set(path, {png: rendered.png, id: rendered.id});
        }
        const t = cache.get(path);
        res.writeHead(200, {'Content-Type': 'image/png', 'Cache-Control': 'private,max-age=3600', ETag: `"${t.id}"`});
        return res.end(t.png);
      } catch { res.writeHead(500); return res.end('Pilot tile unavailable'); }
    }
    res.writeHead(404); res.end('Not found');
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return {server, pilot};
}
if (process.argv[1] && import.meta.url === new URL(`file:///${process.argv[1].replaceAll('\\', '/')}`).href) {
  await startReview(); console.log('REAL NOAA SST PILOT REVIEW ONLY: http://127.0.0.1:5191');
}
