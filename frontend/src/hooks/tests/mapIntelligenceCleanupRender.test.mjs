import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const runtime=process.argv[2];if(!runtime)throw new Error('Pass an existing read-only frontend node_modules path');
const {rolldown}=await import(pathToFileURL(runtime+'/rolldown/dist/index.mjs'));
const require=createRequire(import.meta.url),{chromium}=require(process.env.PELORA_BROWSER_TEST_NODE_MODULES+'/playwright');
const output=fs.mkdtempSync(path.join(os.tmpdir(),'pelora-vnext-controls-'));
const entry=`import React from ${JSON.stringify(runtime+'/react/index.js')};
import {createRoot} from ${JSON.stringify(runtime+'/react-dom/client.js')};
import Controls from ${JSON.stringify(root+'/frontend/src/components/LayerControls.jsx')};
const field={status:'static',validTime:null,provider:'SYNTHETIC INTERNAL PROVIDER',productVersion:'internal-version',
 freshness:{maxFreshAgeHours:null},coverage:{validCells:199,returnedCells:238},resolution:{deliveredDegrees:.05},payload:{values:[1,null]}};
window.internal={bathymetry:{status:'static',field},currents:{status:'degraded',field,reason:'INTERNAL FAILURE'}};
window.snapshot=JSON.stringify(window.internal);
function Harness(){const [layers,setLayers]=React.useState({locations:true,bathymetry:true,currentField:true,temperatureTransition:false,bait:false});
 window.harnessLayers=layers;return React.createElement(Controls,{layers,setLayers,fieldStatus:window.internal});}
createRoot(document.getElementById('controls')).render(React.createElement(Harness));`;
fs.writeFileSync(output+'/entry.jsx',entry);
const bundle=await rolldown({input:output+'/entry.jsx',resolve:{alias:{react:runtime+'/react'}},transform:{jsx:{runtime:'automatic'}}});
const built=await bundle.generate({format:'iife'});await bundle.close();
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-background-networking']});
try{const context=await browser.newContext({serviceWorkers:'block'}),denied=[];await context.route('**/*',r=>{denied.push(r.request().url());return r.abort();});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setContent('<div class="dashboard-map"><div id="controls"></div></div>');
 for(const css of ['index.css','App.css','styles/dashboard.css'])await page.addStyleTag({content:fs.readFileSync(root+'/frontend/src/'+css,'utf8').replace(/^@import[^;]*;/gm,'')});
 await page.addScriptTag({content:built.output[0].code});await page.getByRole('button',{name:/Map Intelligence/}).click();
 const measurements=[];
 for(const width of [1000,390]){await page.setViewportSize({width,height:844});
  assert.equal(await page.locator('details,pre').count(),0);assert.ok(!(await page.locator('body').innerText()).includes('Source & Evidence Details'));
  assert.ok(!(await page.locator('body').innerText()).includes('INTERNAL'));
  await page.getByRole('checkbox',{name:/^Bathymetry/}).uncheck();
  assert.equal(await page.evaluate(()=>harnessLayers.bathymetry),false);assert.equal(await page.evaluate(()=>harnessLayers.currentField),true);
  await page.getByRole('checkbox',{name:/^Bathymetry/}).check();
  await page.getByRole('checkbox',{name:/^Geostrophic/}).uncheck();
  assert.equal(await page.evaluate(()=>harnessLayers.currentField),false);assert.equal(await page.evaluate(()=>harnessLayers.bathymetry),true);
  await page.getByRole('checkbox',{name:/^Geostrophic/}).check();
  assert.equal(await page.evaluate(()=>JSON.stringify(internal)===snapshot),true);
  const bounds=await page.locator('.layer-controls').boundingBox();assert.ok(bounds.width<=width&&bounds.x>=0&&bounds.x+bounds.width<=width+1);
  measurements.push({width,bounds});await page.screenshot({path:output+'/controls-'+width+'.png'});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(denied,[]);const report={scope:'Controlled offline React UI, phone viewport emulation; external font import excluded; not authenticated/physical-device QA',
  result:'PASS actual React controls, independent toggle interaction, no disclosures, immutable internal evidence, desktop/phone layout',
  sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/frontend/src/components/LayerControls.jsx')).digest('hex'),output,measurements,errors,denied};
 fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 await context.close();
}finally{await browser.close();}
