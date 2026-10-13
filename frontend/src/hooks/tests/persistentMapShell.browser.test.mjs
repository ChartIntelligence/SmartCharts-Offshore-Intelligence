import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const runtime=path.resolve(process.argv[2]);
const require=createRequire(runtime+'/package.json');
const {chromium}=createRequire(import.meta.url)(process.env.PELORA_BROWSER_TEST_NODE_MODULES+'/playwright');
const {rolldown}=await import(pathToFileURL(runtime+'/rolldown/dist/index.mjs'));
const {transformSync}=await import(pathToFileURL(runtime+'/rolldown/dist/utils-index.mjs'));
const output=fs.mkdtempSync(path.join(os.tmpdir(),'pelora-shell-browser-'));
const source=p=>fs.readFileSync(root+'/frontend/src/'+p,'utf8');
const factory=(p,name)=>transformSync(p,source(p).replace(/^import\s[\s\S]*?;\s*/gm,'').replace(/export default \w+;/g,'').replace(/export (function|const) /g,'$1 ').replace(/import\.meta\.env/g,'({DEV:false})'),{jsx:{runtime:'classic'}}).code+'\nreturn '+name+';';
const temp=output+'/react-entry.mjs';
fs.writeFileSync(temp,'import React from '+JSON.stringify(runtime+'/react/index.js')+';import * as Client from '+JSON.stringify(runtime+'/react-dom/client.js')+';globalThis.React=React;globalThis.ReactDOM=Client;');
const build=await rolldown({input:temp,platform:'browser'}),bundle=await build.generate({format:'iife'});await build.close();
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-background-networking']});
try {
 for(const width of [1000,390,320]){
 const context=await browser.newContext({viewport:{width,height:800},serviceWorkers:'block'}),page=await context.newPage(),errors=[],denied=[];
 await context.route('**/*',route=>{denied.push(route.request().url());return route.abort();});page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://pelora-fixture.test/**',route=>route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));await page.goto('http://pelora-fixture.test/?app=1');
 await page.addStyleTag({content:fs.readFileSync(root+'/node_modules/maplibre-gl/dist/maplibre-gl.css','utf8')});
 for(const p of ['styles/dashboard.css','styles/persistentMapShell.css'])await page.addStyleTag({content:source(p).replace(/@import[^;]+;/g,'')});
 await page.addScriptTag({content:fs.readFileSync(root+'/node_modules/maplibre-gl/dist/maplibre-gl.js','utf8')});await page.addScriptTag({content:bundle.output[0].code});
 const codes={};for(const [p,n] of [['utils/captainContinuity.js','({continuityOwner,readContinuity,writeContinuity,clearContinuityRevision,validateCamera})'],['hooks/useCaptainContinuity.js','useCaptainContinuity'],['utils/shellNavigation.js','({createShellNavigation})'],['hooks/useShellNavigation.js','useShellNavigation'],['hooks/useTripMission.js','useTripMission'],['components/PeloraStartupFlow.jsx','PeloraStartupFlow'],['components/PersistentMapShell.jsx','({PersistentMapShell,ShellOverlay})'],['hooks/useMapLibreSetup.js','useMapLibreSetup'],['hooks/useMapCameraContinuity.js','useMapCameraContinuity'],['components/MapLibreIntelligenceMap.jsx','MapLibreIntelligenceMap']])codes[n]=factory(p,n);
 for(const p of ['utils/captainSpatialContext.js','utils/oceanFieldPresentation.js','utils/currentFlowPresentation.js','utils/viewportFieldRequests.js','utils/mapObservationDisplay.js','utils/peloraMapStyle.js','utils/localQaReadOnly.js','utils/qaFieldTransport.js','hooks/useMapLibreOceanFields.js'])await page.addScriptTag({content:source(p).replace(/^import[\s\S]*?;\r?\n/gm,'').replace(/^export /gm,'').replace(/import\.meta\.env/g,'({DEV:false})')});
 await page.evaluate(codes=>{
 globalThis.counts={created:0,removed:0,requests:0,styles:0};globalThis.states={};
 const Native=maplibregl.Map;
 class ControlledMap extends Native{constructor(options){super(options);counts.created++;globalThis.map=this;}setStyle(){counts.styles++;return super.setStyle({version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#101e29'}}]});}remove(){counts.removed++;return super.remove();}}
 const react={React,...React};Object.assign(globalThis,{useEffect:React.useEffect,useRef:React.useRef});const noop=()=>{};
 const load=(name,scope)=>new Function(...Object.keys(scope),codes[name])(...Object.values(scope));
 const persistence=load('({continuityOwner,readContinuity,writeContinuity,clearContinuityRevision,validateCamera})',{});
 const useCaptainContinuity=load('useCaptainContinuity',{...react,...persistence});
 const navPort=load('({createShellNavigation})',{});const useShellNavigation=load('useShellNavigation',{...react,...navPort});
 const useTripMission=load('useTripMission',{...react,useCaptainContinuity,buildCaptainSpatialContext});
 const shell=load('({PersistentMapShell,ShellOverlay})',{...react,useCaptainContinuity});
 const useMapLibreSetup=load('useMapLibreSetup',{...react,maplibregl:{...maplibregl,Map:ControlledMap},PELORA_BASEMAP_URL,createPeloraMapStyle,enforcePeloraLayerOrder});
 const useMapCameraContinuity=load('useMapCameraContinuity',{...react,...persistence});
 const MapComponent=load('MapLibreIntelligenceMap',{...react,structures:[],buildMapGeoJson:()=>({type:'FeatureCollection',features:[]}),useMapLibreSetup,useMapCameraContinuity,useMapLibreOceanFields,sampleLayersForMode,useSyntheticSstReview:noop,useMapLibreLayers:noop,useMapLibreMarkers:noop,useMapLibreSelection:noop,useMapLibreOceanFeatures:noop,useMapLibreOpenWaterOpportunities:noop,useMapLibreOpportunitySelection:noop,useMapLibreEnvironmentalObservations:noop});
 const nativeFetch=fetch;globalThis.fetch=async(url,...rest)=>{if(typeof url==='string'&&url.startsWith('/api/ocean/field?')){counts.requests++;throw Error('Controlled unavailable field');}return nativeFetch(url,...rest);};globalThis.resolvePeloraApiUrl=p=>p;
 const layers={bathymetry:true,currentField:true,locations:true};const field=fn=>{states=fn(states);};const select=noop;
 function Workspace({owner,missionEditor,onCloseMissionEditor,onEditTripMission,missionAdmitted}){const [activeTab,setActiveTab]=React.useState('map'),[reportOpen,setReportOpen]=React.useState(false),[camera,setCamera]=React.useState(null);globalThis.camera=camera;globalThis.admitted=missionAdmitted;const navigation=useShellNavigation({tab:activeTab,report:reportOpen,mission:Boolean(missionEditor)},next=>{setActiveTab(next.tab);setReportOpen(next.report);if(next.mission&&!missionEditor)onEditTripMission?.();if(!next.mission&&missionEditor)onCloseMissionEditor?.();});globalThis.navigate=navigation.navigate;
 return React.createElement(shell.PersistentMapShell,{user:{id:owner},activeTab,onNavigate:navigation.navigate,missionEditor,onMissionClose:onCloseMissionEditor?()=>navigation.mission(false):undefined,brand:React.createElement('span',null,'Pelora'),mission:React.createElement('button',{'aria-label':'Change current trip mission',onClick:()=>navigation.mission(true)},'Current Trip · Synthetic'),warnings:React.createElement('p',null,'Current evidence unavailable'),map:React.createElement('div',{className:'map-wrapper'},React.createElement(MapComponent,{layers,onFieldStatus:field,setSelectedSpot:select,setSelectedOpportunity:select,onCameraChange:setCamera,camera})),overlay:React.createElement('div',null,React.createElement('p',null,'Fixture '+activeTab),React.createElement('button',{onClick:()=>navigation.report(true)},'Log fishing day')),reportOpen,onReportClose:()=>navigation.report(false),report:React.createElement('textarea',{'aria-label':'Synthetic draft',defaultValue:'partial draft'})});}
 const Dashboard=props=>React.createElement(Workspace,{...props,owner:props.user.id});const Startup=load('PeloraStartupFlow',{...react,Dashboard,useTripMission,peloraWordmark:''});persistence.writeContinuity(localStorage,'A','mission',{origin:null,operatingRangeNm:null,explorationMode:'entire-gulf',selectedSpecies:'blue-marlin',contractVersion:'pelora-trip-mission-v1'});
 globalThis.root=ReactDOM.createRoot(document.getElementById('root'));globalThis.renderOwner=owner=>root.render(React.createElement(Startup,{key:owner,user:{id:owner},session:{access_token:'synthetic-'+owner}}));renderOwner('A');
 },codes);
 await page.waitForFunction(()=>counts.created===1&&map.loaded()&&counts.requests>=2,{},{timeout:10000}).catch(async e=>{console.log(JSON.stringify({errors,debug:await page.evaluate(()=>({counts:globalThis.counts,states:globalThis.states,text:document.body.textContent,loaded:globalThis.map?.loaded()}))}));throw e;});
 await page.waitForFunction(()=>{if(globalThis.lastRequests!==counts.requests){globalThis.lastRequests=counts.requests;globalThis.stableSince=performance.now();}return performance.now()-stableSince>600;});
 const priorCameraRequests=await page.evaluate(()=>counts.requests);await page.evaluate(()=>map.jumpTo({center:[-91,26],zoom:6,bearing:32}));await page.waitForFunction(n=>counts.requests>n,priorCameraRequests);await page.waitForFunction(()=>{if(lastRequests!==counts.requests){lastRequests=counts.requests;stableSince=performance.now();}return performance.now()-stableSince>600;});
 const original=await page.evaluate(()=>{return {counts:{...counts},canvas:map.getCanvas().getBoundingClientRect().toJSON(),events:Object.fromEntries(Object.entries(map._listeners??{}).map(([k,v])=>[k,v.length]))};});
 assert.equal(original.canvas.width,width);assert.equal(original.canvas.height,800);
 for(let k=0;k<3;k++)for(const name of ['Top Opportunities','Intelligence','Reports','Profile']){
  await page.getByRole('button',{name,exact:true}).click();await page.getByRole(width<=700?'dialog':'region',{name,exact:true}).waitFor();
  assert(await page.getByRole('navigation',{name:'Pelora navigation'}).isVisible());assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-shell-heading')),true);if(width<=700)assert.equal(await page.locator('.pelora-map-surface').getAttribute('inert'),'');
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')??document.activeElement.className),name);
 }
 assert.deepEqual(await page.evaluate(()=>({...counts})),original.counts,'navigation never restarts map/style/field acquisitions');
 assert.deepEqual(await page.evaluate(()=>Object.fromEntries(Object.entries(map._listeners??{}).map(([k,v])=>[k,v.length]))),original.events,'no duplicate map listeners');
 assert.deepEqual(await page.evaluate(()=>({center:map.getCenter().toArray(),zoom:map.getZoom(),bearing:map.getBearing()})),{center:[-91,26],zoom:6,bearing:32});
 await page.getByRole('button',{name:'Reports',exact:true}).click();await page.getByRole('button',{name:'Intelligence',exact:true}).click();await page.goBack();await page.waitForFunction(()=>location.hash==='#pelora');await page.goForward();await page.waitForFunction(()=>location.hash==='#pelora/intelligence');await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Change current trip mission'}).click();await page.getByRole('button',{name:'Keep Current Trip'}).waitFor();await page.goBack();await page.getByRole('button',{name:'Keep Current Trip'}).waitFor({state:'hidden'});await page.goForward();await page.getByRole('button',{name:'Keep Current Trip'}).waitFor();await page.keyboard.press('Escape');assert.deepEqual(await page.evaluate(()=>({...counts})),original.counts);
 await page.getByRole('button',{name:'Reports',exact:true}).click();await page.getByRole('button',{name:'Log fishing day',exact:true}).click();await page.goBack();await page.getByRole('textbox',{name:'Synthetic draft'}).waitFor({state:'hidden'});await page.goForward();await page.getByRole('textbox',{name:'Synthetic draft'}).waitFor();await page.getByRole('textbox',{name:'Synthetic draft'}).fill('recoverable draft');await page.getByRole('button',{name:'Profile',exact:true}).click();assert.equal(await page.getByRole('textbox',{name:'Synthetic draft'}).inputValue(),'recoverable draft');
 await page.getByRole('button',{name:'Focus ocean',exact:true}).click();assert.equal(await page.getByRole('textbox',{name:'Synthetic draft'}).inputValue(),'recoverable draft');assert(await page.getByText('Current evidence unavailable').isVisible());await page.getByRole('button',{name:'Restore map controls'}).click();await page.keyboard.press('Escape');
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Intelligence',exact:true}).click();assert.equal(await page.getByRole(width<=700?'dialog':'region',{name:'Intelligence',exact:true}).evaluate(n=>getComputedStyle(n).animationName),'none');await page.keyboard.press('Escape');
 const dock=await page.getByRole('navigation',{name:'Pelora navigation'}).boundingBox();assert(dock.x>=0&&dock.x+dock.width<=width+.5);assert(dock.y>=0&&dock.y+dock.height<=800);
 await page.screenshot({path:output+'/shell-'+width+'.png'});
 await page.evaluate(()=>renderOwner('B'));await page.waitForFunction(n=>counts.created===2&&counts.removed===1&&map.loaded()&&counts.requests>=n+2,original.counts.requests);assert.equal(await page.evaluate(()=>admitted),false);await page.getByRole('button',{name:'Explore Entire Gulf'}).click();assert.equal(await page.evaluate(()=>admitted),false);await page.getByRole('button',{name:'Blue Marlin',exact:true}).click();await page.waitForFunction(()=>admitted===true);assert.equal(await page.evaluate(()=>counts.created),2);await page.evaluate(()=>root.unmount());await page.waitForFunction(()=>counts.removed===2);
 assert.equal(errors.length,0,errors.join(';'));assert.equal(denied.length,0,'all field/style requests stay controlled');console.log('PASS actual shell / actual MapLibre component+setup+field lifecycle '+width+'px');await context.close();
 }
 console.log('Synthetic offline browser artifacts: '+output);
}finally{await browser.close();}
