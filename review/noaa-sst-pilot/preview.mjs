// Dedicated browser context. Allow only local review + existing geographic basemap.
import {createRequire} from 'node:module';
import {mkdirSync, writeFileSync} from 'node:fs';
import {startReview} from './serve.mjs';
import {DIRECTORY} from './pilot.mjs';
const {chromium} = createRequire(import.meta.url)(process.argv[2] || 'playwright');
const {server} = await startReview();
const output = `${DIRECTORY}screenshots/`; mkdirSync(output, {recursive: true});
const browser = await chromium.launch({channel: 'msedge', headless: true, args: ['--disable-background-networking']});
const hosts = new Set(), blocked = [], errors = [];
try {
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, deviceScaleFactor: 1, serviceWorkers: 'block'});
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === 'http://127.0.0.1:5191') return route.continue();
    if (url.protocol === 'https:' && url.hostname === 'demotiles.maplibre.org') { hosts.add(url.hostname); return route.continue(); }
    blocked.push(url.origin); return route.abort();
  });
  const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5191');
  await page.waitForFunction(() => window.pilotReady, {timeout: 60000});
  async function capture(name, bounds) {
    await page.evaluate(bounds => {map.fitBounds(bounds,{padding:{top:155,bottom:180,left:35,right:55},duration:0});},bounds);
    await page.waitForFunction(() => map.loaded() && map.areTilesLoaded(), {timeout: 60000});
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.screenshot({path: `${output}${name}.png`});
  }
  await capture('full-gulf', [[-98,18],[-80,31]]);
  await capture('northern-gulf', [[-96,26],[-82,31]]);
  await capture('eastern-gulf-desoto', [[-89.5,25],[-82,30.7]]);
  await capture('central-western-gulf', [[-97,21],[-87,29]]);
  await page.setViewportSize({width:390,height:844}); await page.evaluate(()=>map.resize());
  await capture('mobile-width-gulf', [[-98,18],[-80,31]]);
  await page.setViewportSize({width:1440,height:1000}); await page.evaluate(()=>map.resize());
  await page.click('#toggle'); await capture('sst-off', [[-98,18],[-80,31]]);
  errors.push(...await page.evaluate(()=>mapErrors));
  writeFileSync(`${output}receipt.json`,JSON.stringify({geographicHosts:[...hosts],blocked,errors,physicalIphone:false},null,2));
  console.log(JSON.stringify({output,geographicHosts:[...hosts],blocked,errors}));
  if(errors.length || blocked.length) throw Error('Review rendering errors');
} finally { await browser.close(); await new Promise(r=>server.close(r)); }
