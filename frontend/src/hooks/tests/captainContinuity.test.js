import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';

const runtime=pathToFileURL(process.argv[2].replaceAll('\\','/')+'/');
const React=(await import(new URL('react/index.js',runtime))).default;
const {act,useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState}=React;
const {createRoot}=await import(new URL('react-dom/client.js',runtime));
const {transformSync}=await import(new URL('rolldown/dist/utils-index.mjs',runtime));
registerHooks({resolve(specifier,context,next){
 if(specifier==='@js-temporal/polyfill')return {shortCircuit:true,url:new URL('@js-temporal/polyfill/dist/index.esm.js',runtime).href};
 return next(specifier,context);
}});
const temporal=await import('../../utils/fishingLogTemporalCapture.js');
const spatial=await import('../../utils/fishingLogSpatialCapture.js');
const continuity=await import('../../utils/captainContinuity.js');
const {captainProfileRead}=await import('../../utils/captainProfileRead.js');
const {buildCaptainSpatialContext}=await import('../../utils/captainSpatialContext.js');
import {interpretOpportunityEvaluation,EVALUATION_MESSAGES} from '../../utils/opportunityEvaluationState.js';


// Real React reconciliation with a minimal DOM host; no browser layout claim.
class HostNode {
  constructor(name, doc, type = 1) {
    this.nodeType = type; this.nodeName = name.toUpperCase();
    this.tagName = this.nodeName; this.ownerDocument = doc;
    this.childNodes = []; this.parentNode = null; this.style = {};
    this.attributes = {}; this.namespaceURI = 'http://www.w3.org/1999/xhtml';
  }
  appendChild(node) { return this.insertBefore(node, null); }
  insertBefore(node, before) {
    node.parentNode?.removeChild(node);
    this.childNodes.splice(before ? this.childNodes.indexOf(before) : this.childNodes.length, 0, node);
    node.parentNode = this; return node;
  }
  removeChild(node) { this.childNodes.splice(this.childNodes.indexOf(node), 1); node.parentNode = null; return node; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  removeAttribute(key) { delete this.attributes[key]; }
  addEventListener() {}
  removeEventListener() {}
  get firstChild() { return this.childNodes[0] || null; }
  get options() { return this.childNodes.filter(n => n.tagName === 'OPTION'); }
  get textContent() { return this.nodeType === 3 ? this.nodeValue : this.childNodes.map(n => n.textContent).join(''); }
  set textContent(value) {
    this.childNodes.forEach(n => {n.parentNode = null;}); this.childNodes = [];
    if (value) this.appendChild(this.ownerDocument.createTextNode(value));
  }
}

function host() {
  const doc = new HostNode('#document', null, 9);
  doc.ownerDocument = doc;
  doc.createElement = name => new HostNode(name, doc);
  doc.createElementNS = (_, name) => doc.createElement(name);
  doc.createTextNode = value => Object.assign(new HostNode('#text', doc, 3), {nodeValue:String(value)});
  doc.body = doc.createElement('body'); doc.documentElement = doc.createElement('html');
  doc.activeElement = doc.body;
  const win = {document:doc, HTMLIFrameElement:class {}, HTMLElement:HostNode};
  doc.defaultView = win;
  return {doc, win};
}


function compile(path, expression, scope={}, original=null) {
  const source=(original ?? readFileSync(new URL(path,import.meta.url),'utf8'))
    .replace(/^import\s[\s\S]*?;\s*/gm,'').replace(/export default \w+;/g,'')
    .replace(/export function /g,'function ').replace(/export const /g,'const ').replace(/import\.meta\.env/g,'({DEV:false})');
  return vm.runInNewContext(transformSync(path,source,{jsx:{runtime:'classic'}}).code+'\n'+expression,
    {React,useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,console:{error(){}},JSON,Date,Number,Array,Map,Set,AbortController,URLSearchParams,...scope});
}
async function mount(Component,props={},storage=new Storage(),mobile=false) {
  const {doc,win}=host();win.localStorage=storage;win.matchMedia=()=>({matches:mobile});win.addEventListener=(name,callback)=>events.set(name,callback);win.removeEventListener=name=>events.delete(name);doc.addEventListener=win.addEventListener;doc.removeEventListener=win.removeEventListener; Object.assign(win,{setInterval:()=>1,clearInterval(){},confirm:()=>true,alert(){}});
  Object.assign(globalThis,{window:win,document:doc,IS_REACT_ACT_ENVIRONMENT:true});
  const errors=[]; const container=doc.createElement('div'),root=createRoot(container,{onUncaughtError:error=>errors.push(error),onCaughtError:error=>errors.push(error)});
  const render=async next=>{props=next??props;await act(async()=>root.render(React.createElement(Component,props)));};
  await render(); return {container,win,render,errors,storage,close:async()=>{await act(async()=>root.unmount());delete globalThis.window;delete globalThis.document;delete globalThis.IS_REACT_ACT_ENVIRONMENT;}};
}

class Storage {
 constructor(seed=[]){this.data=new Map(seed);}
 getItem(key){return this.data.get(key) ?? null;}
 setItem(key,value){this.data.set(key,value);}
 removeItem(key){this.data.delete(key);}
}
const events=new Map();const buttons=new Map();const inputs=new Map();const seen={};let submit;
const principal=id=>({id,is_anonymous:false});
const hook=compile('../useCaptainContinuity.js','useCaptainContinuity',{...continuity,window:new Proxy({}, {get:(_,key)=>globalThis.window?.[key]})});
const browserWindow=new Proxy({}, {get:(_,key)=>globalThis.window?.[key]});
const browserDocument=new Proxy({}, {get:(_,key)=>globalThis.document?.[key]});
const common={...continuity,window:browserWindow,document:browserDocument,useCaptainContinuity:hook,captainProfileRead};
const observedReact={...React,createElement(type,props,...children){
 const text=children.flat(Infinity).filter(value=>typeof value==='string').join('').trim();
 if(type==='button' && props?.onClick)buttons.set(props['aria-label'] ?? text,props.onClick);
 if(typeof type==='function' && type.name==='ReportInput')inputs.set(props.label,props);
 if(type==='form' && props.className==='fishing-report-form')submit=props.onSubmit;
 return React.createElement(type,props,...children);
}};
const scope={...common,React:observedReact,structuredClone,EVALUATION_MESSAGES,Component:React.Component};
const Target=compile('../../components/SelectedTarget.jsx','SelectedTarget',scope);
const Intelligence=compile('../../components/OpportunityIntelligence.jsx','OpportunityIntelligence',scope);
const Recovery=compile('../../components/IntelligenceRecovery.jsx','IntelligenceRecovery',scope);
const Today=compile('../../components/TodayDashboard.jsx','TodayDashboard',{...scope,HistoricalOpportunityContinuity:()=>null});
let insertResult={data:{id:'synthetic-saved'},error:null};let insertCount=0;const payloads=[];
const client={from(table){assert.equal(table,'fishing_day_reports');return {insert(payload){insertCount++;payloads.push(payload);return {select(){return {single:async()=>typeof insertResult==='function'?insertResult():insertResult};}};}};}};
const Report=compile('../../components/FishingDayReportPanel.jsx','FishingDayReportPanel',{...scope,...temporal,...spatial,supabase:client,FishingLogSpatialControls:props=>{seen.spatial=props;return null;},FishingLogTemporalControls:props=>{seen.temporal=props;return null;}});
const Saved=compile('../../components/SavedFishingDayReports.jsx','SavedFishingDayReports',{...scope,supabase:{from:()=>({select(){return this;},eq(){return this;},order(){return this;},then:resolve=>Promise.resolve({data:[],error:null}).then(resolve)})}});
const missionHook=compile('../useTripMission.js','useTripMission',{...common,buildCaptainSpatialContext});
const place={id:'synthetic-place',name:'Synthetic Place',coordinates:[25,-90]};
const data=(id='X',rank=1)=>({evaluationState:{contractVersion:'pelora-governed-opportunity-evaluation-state-v1',state:'available'},opportunities:[{location:{id,coordinates:[25,-90]},rank,score:60,confidence:{label:'Low'},primarySignal:{type:'synthetic'}}],delivery:{captainNarratives:[{opportunityId:id,narrative:{available:true,sections:{thermalStructure:{observed:'Synthetic evidence.'}}}}]}});
async function click(name){assert(buttons.has(name),'Missing '+name);await act(async()=>buttons.get(name)());}
async function workspace(storage=new Storage(),id='A',mobile=false,initial=data()){
 let result={data:initial,loading:false,error:null};
 const child=name=>props=>{seen[name]=props;return React.createElement('div',null,name==='MapLibreIntelligenceMap'?'SYNTHETIC MAP HOST':'');};
 const Dashboard=compile('../../components/Dashboard.jsx','Dashboard',{
  ...scope,structures:[place],peloraHeaderLockup:'image',interpretOpportunityEvaluation,
  buildMapEnvironmentalObservations:()=>[],buildMapObservationDisplay:()=>({}),sampleLayersForMode:x=>x,
  useLiveMarineConditions:()=>({data:null,loading:false,error:null}),useOceanMemoryPersistence(){},useDynamicOpportunities:()=>result,
  window:{setInterval:()=>1,clearInterval(){}},
  TodayDashboard:props=>{seen.Today=props;return React.createElement(Today,props);},SelectedTarget:props=>{seen.Target=props;return React.createElement(Target,props);},
  OpportunityIntelligence:Intelligence,IntelligenceRecovery:Recovery,FishingDayReportPanel:Report,SavedFishingDayReports:Saved,
  ...Object.fromEntries(['MapLibreIntelligenceMap','MapLegend','LayerControls','TopOpportunity','OpportunityRanking','HistoricalOpportunityContinuity','LocationSearch'].map(name=>[name,child(name)]))
 });
 const props={user:principal(id),session:{user:principal(id),access_token:'synthetic'},tripMission:{selectedSpecies:'blue-marlin'},captainSpatialContext:{explorationMode:'entire-gulf'}};
 const h=await mount(Dashboard,props,storage,mobile);
 return {...h,props,async refresh(next){result=next;await h.render(props);},async select(){await act(async()=>seen.Today.setSelectedOpportunity(seen.Today.topOpportunities[0]));},async report(){await act(async()=>seen.Today.setReportPanelOpen(true));}};
}
async function edit(name,value){assert(inputs.has(name),'Missing input '+name);await act(async()=>inputs.get(name).onChange(value));}
const stored=(storage,id,kind)=>JSON.parse(storage.getItem(continuity.continuityKey(id,kind)) ?? 'null');
for(const mobile of [false,true])test('same-user process/remount workspace restore; navigation and no black screen '+mobile,async()=>{
 const store=new Storage();let h=await workspace(store,'A',mobile);
 await h.select();await click('Map');await act(async()=>seen.Target.onExpandedChange(true));await act(async()=>seen.LayerControls.setLayers(v=>({...v,bathymetry:false})));
 await act(async()=>seen.MapLibreIntelligenceMap.onCameraChange({center:[-91,26],zoom:8,bearing:42}));
 await h.close();h=await workspace(new Storage(store.data),'A',mobile);
 try{assert.match(h.container.textContent,/SYNTHETIC MAP HOST/);assert.equal(seen.Target.selectedSpot.id,'X');assert.equal(seen.Target.expanded,true);assert.equal(seen.MapLibreIntelligenceMap.layers.bathymetry,false);assert.deepEqual(Array.from(seen.MapLibreIntelligenceMap.camera.center),[-91,26]);assert.equal(seen.MapLibreIntelligenceMap.camera.bearing,42);
 await click('Intelligence');assert.match(h.container.textContent,/Synthetic evidence/);await click('Reports');assert.match(h.container.textContent,/No reports/);await click('Home');assert.match(h.container.textContent,/Open Full Analysis/);assert.equal(h.errors.length,0);}finally{await h.close();}
});
test('Place restores only from current Places and sheet survives tabs',async()=>{
 const store=new Storage();let h=await workspace(store);await click('Map');await act(async()=>seen.MapLibreIntelligenceMap.setSelectedSpot(place));await act(async()=>seen.Target.onExpandedChange(true));await click('Home');await click('Map');assert.equal(seen.Target.expanded,true);await h.close();h=await workspace(store);try{assert.equal(seen.Target.selectedSpot.id,place.id);assert.equal(seen.Target.expanded,true);}finally{await h.close();}
});
test('loading keeps intent, current same-ID refresh uses newest content; terminal failure invalidates durably',async()=>{
 const store=new Storage();const h=await workspace(store);try{await h.select();await click('Map');await act(async()=>seen.Target.onExpandedChange(true));await h.refresh({data:null,loading:true,error:null});assert.match(h.container.textContent,/Refreshing current governed evidence/);assert.equal(seen.Target.expanded,true);assert.equal(seen.MapLibreIntelligenceMap.selectedOpportunity,null);assert.equal(stored(store,'A','workspace').value.opportunitySelection.opportunity.id,'X');await h.refresh({data:data('X',3),loading:false,error:null});assert.equal(seen.Target.selectedSpot.dynamicOpportunity.rank,3);assert.equal(seen.Target.expanded,true);
 await h.refresh({data:null,loading:false,error:Error('Synthetic terminal failure')});assert.equal(stored(store,'A','workspace').value.opportunitySelection,null);await h.refresh({data:data(),loading:false,error:null});assert.equal(seen.MapLibreIntelligenceMap.selectedOpportunity,null);assert.equal(stored(store,'A','workspace').value.activeTab,'map');}finally{await h.close();}
 const restored=await workspace(store);try{assert.equal(seen.MapLibreIntelligenceMap.selectedOpportunity,null);}finally{await restored.close();}
});
for(const state of ['absent','zero','context'])test('authoritative invalidation '+state,async()=>{
 const store=new Storage();const h=await workspace(store);try{await h.select();await click('Map');if(state==='context')await h.render({...h.props,tripMission:{selectedSpecies:'wahoo'}});else await h.refresh({data:state==='absent'?data('Y'):{...data(),opportunities:[],evaluationState:{contractVersion:'pelora-governed-opportunity-evaluation-state-v1',state:'governed-zero'}},loading:false,error:null});assert.equal(stored(store,'A','workspace').value.opportunitySelection,null);}finally{await h.close();}
});
test('initial pending restore resolves only matching collection; absence never resurrects on retry',async()=>{
 const store=new Storage();let h=await workspace(store);await h.select();await h.close();h=await workspace(store,'A',false,null);try{assert.equal(stored(store,'A','workspace').value.opportunitySelection.opportunity.id,'X');await h.refresh({data:data('Y'),loading:false,error:null});assert.equal(stored(store,'A','workspace').value.opportunitySelection,null);await h.refresh({data:data(),loading:false,error:null});await click('Map');assert.equal(seen.MapLibreIntelligenceMap.selectedOpportunity,null);}finally{await h.close();}
});
test('partial fishing draft persists on each edit before hide/reload; successful completion clears',async()=>{
 const store=new Storage();let h=await workspace(store);await h.report();await edit('Captain','Captain A');await edit('Boat Name','Boat A');await edit('Hours Fished','4');
 await act(async()=>seen.spatial.setDraft({latitude:'25.',longitude:'',label:'partial point',certainty:'approximate'}));
 assert.equal(stored(store,'A','fishing-draft').value.report.captain,'Captain A');await h.close();h=await workspace(new Storage(store.data));
 try{assert.equal(inputs.get('Captain').value,'Captain A');assert.equal(inputs.get('Hours Fished').value,'4');assert.equal(seen.spatial.draft.latitude,'25.');await act(async()=>seen.spatial.setDraft(spatial.emptyLocationDraft()));
 insertResult={data:{id:'saved'},error:null};await act(async()=>submit({preventDefault(){},nativeEvent:{}}));assert.equal(h.storage.getItem(continuity.continuityKey('A','fishing-draft')),null);assert.equal(stored(h.storage,'A','workspace').value.reportPanelOpen,false);assert.equal(payloads.at(-1).user_id,'A');assert(payloads.at(-1).evidence_capture);}finally{await h.close();}
});
test('failed submit retains durable draft, refreshed workspace cannot discard it',async()=>{
 const store=new Storage();const h=await workspace(store);try{await h.report();await edit('Captain','Still working');insertResult={data:null,error:Error('Synthetic insert failure')};await act(async()=>submit({preventDefault(){},nativeEvent:{}}));await h.refresh({data:data('X',4),loading:false,error:null});assert.equal(inputs.get('Captain').value,'Still working');assert.equal(stored(store,'A','fishing-draft').value.report.captain,'Still working');}finally{await h.close();insertResult={data:{id:'saved'},error:null};}
});
test('newer edits during async save survive successful old completion',async()=>{
 const store=new Storage();const h=await workspace(store);let resolve;try{await h.report();await edit('Captain','submitted');insertResult=()=>new Promise(r=>resolve=r);let saving;await act(async()=>{saving=submit({preventDefault(){},nativeEvent:{}});});await edit('Captain','newer');await act(async()=>{resolve({data:{id:'saved'},error:null});await saving;});assert.equal(inputs.get('Captain').value,'newer');assert.equal(stored(store,'A','fishing-draft').value.report.captain,'newer');}finally{await h.close();insertResult={data:{id:'saved'},error:null};}
});
test('cross-account draft isolation and old async handler cannot overwrite new account',async()=>{
 const store=new Storage();const h=await workspace(store);try{await h.report();await edit('Captain','PRIVATE A');const oldEdit=inputs.get('Captain').onChange;await h.render({...h.props,user:principal('B'),session:{user:principal('B'),access_token:'synthetic-B'}});await click('Home');await act(async()=>seen.Today.setReportPanelOpen(true));assert.equal(inputs.get('Captain').value,'');await edit('Captain','PRIVATE B');await act(async()=>oldEdit('LATE A'));assert.equal(inputs.get('Captain').value,'PRIVATE B');assert.equal(stored(store,'A','fishing-draft').value.report.captain,'PRIVATE A');assert.equal(stored(store,'B','fishing-draft').value.report.captain,'PRIVATE B');}finally{await h.close();}
});
test('corrupt/foreign/unknown-version persistence falls back without a black screen',async()=>{
 for(const raw of ['{broken',JSON.stringify({owner:'B',version:continuity.CONTINUITY_VERSION,revision:'r',value:{}}),JSON.stringify({owner:'A',version:'unknown',revision:'r',value:{}})]){
 const store=new Storage([[continuity.continuityKey('A','workspace'),raw],[continuity.continuityKey('A','fishing-draft'),raw]]);const h=await workspace(store);try{await h.report();assert.equal(inputs.get('Captain').value,'');assert.match(h.container.textContent,/recovery was unavailable or damaged/);assert.equal(h.errors.length,0);}finally{await h.close();}}
});
test('mission context is per account, legacy global key is never adopted',async()=>{
 const store=new Storage([['pelora.tripMission.v1',JSON.stringify({selectedSpecies:'wahoo',explorationMode:'entire-gulf'})]]);let view;const C=props=>{view=missionHook(props.user);return null;};let h=await mount(C,{user:principal('A')},store);
 assert.equal(view.tripMission.selectedSpecies,'blue-marlin');await act(async()=>view.updateTripMission({selectedSpecies:'wahoo',explorationMode:'entire-gulf'}));await h.close();h=await mount(C,{user:principal('A')},new Storage(store.data));assert.equal(view.tripMission.selectedSpecies,'wahoo');assert.equal(view.missionReady,true);await h.render({user:principal('B')});assert.equal(view.tripMission.selectedSpecies,'blue-marlin');await h.close();
});
test('same-owner reauthenticated session preserves navigation/draft',async()=>{
 const store=new Storage();const h=await workspace(store);try{await h.report();await edit('Captain','REAUTH DRAFT');await click('Intelligence');await h.render({...h.props,session:{...h.props.session,access_token:'reauthenticated-synthetic'}});assert.match(h.container.textContent,/Synthetic evidence/);assert.equal(inputs.get('Captain').value,'REAUTH DRAFT');assert.equal(h.errors.length,0);}finally{await h.close();}
});
test('anonymous or signed-out storage hook cannot read/write private owner records',async()=>{
 const store=new Storage();continuity.writeContinuity(store,'A','test',{text:'PRIVATE'});let view;const C=props=>{view=hook(props.user,'test',()=>({text:''}),v=>typeof v?.text==='string');return null;};
 const h=await mount(C,{user:{id:'A',is_anonymous:true}},store);try{assert.equal(view.value.text,'');await act(async()=>view.setValue({text:'ANONYMOUS'}));assert.equal(stored(store,'A','test').value.text,'PRIVATE');await h.render({user:null});assert.equal(view.value.text,'');}finally{await h.close();}
});
test('logout selection invalidation preserves account draft/rest of workspace',async()=>{
 const store=new Storage();let h=await workspace(store);await h.select();await h.report();await edit('Captain','PRIVATE DRAFT');await click('Map');await h.close();continuity.invalidateStoredSelection(store,'A');h=await workspace(store);try{assert.equal(seen.MapLibreIntelligenceMap.selectedOpportunity,null);assert.equal(inputs.get('Captain').value,'PRIVATE DRAFT');assert.equal(stored(store,'A','workspace').value.activeTab,'map');}finally{await h.close();}
});
test('quota/storage denial is visible and does not discard edits',async()=>{
 const store=new Storage();store.setItem=()=>{throw Error('Quota denied');};const h=await workspace(store);try{await h.report();await edit('Captain','UNSAVED');assert.equal(inputs.get('Captain').value,'UNSAVED');assert.match(h.container.textContent,/Could not save on this device/);}finally{await h.close();}
});
test('camera restore, app-switch visibility capture, listener cleanup',async()=>{
 const hookCamera=compile('../useMapCameraContinuity.js','useMapCameraContinuity',common);const listeners=new Map();const jumps=[];let captured;const map={jumpTo:camera=>jumps.push(camera),on:(name,callback)=>listeners.set(name,callback),off:name=>listeners.delete(name),getCenter:()=>({lng:-92,lat:28}),getZoom:()=>9,getBearing:()=>27};const mapRef={current:map};const camera={center:[-91,26],zoom:7,bearing:15};
 const C=props=>{hookCamera({...props,mapRef,onCameraChange:value=>captured=value});return null;};const h=await mount(C,{camera,restoredSelectionId:'X',selectedIdentity:null});try{assert.equal(jumps.length,1);await h.render({camera,restoredSelectionId:'X',selectedIdentity:'X'});assert.equal(jumps.length,2);events.get('visibilitychange')();assert.deepEqual(Array.from(captured.center),[-92,28]);assert.equal(captured.zoom,9);assert.equal(captured.bearing,27);events.get('pagehide')();assert.equal(listeners.size,1);}finally{await h.close();assert.equal(listeners.size,0);}
});

const accessHook=compile('../useCaptainAccess.js','useCaptainAccess',common);
test('actual private gate: anonymous/denied never reads draft; approved A/B, logout and reauth isolated',async()=>{
 const store=new Storage();continuity.writeContinuity(store,'A','private-test',{text:'PRIVATE A'});continuity.writeContinuity(store,'B','private-test',{text:'PRIVATE B'});
 let auth={session:{user:{id:'A',is_anonymous:true},access_token:'synthetic'},user:{id:'A',is_anonymous:true},loading:false};let approved=false;let reads=0;
 const get=store.getItem.bind(store);store.getItem=key=>{if(key.endsWith(':private-test'))reads++;return get(key);};
 const startup=props=>{const view=hook(props.user,'private-test',()=>({text:''}),v=>typeof v?.text==='string');return React.createElement('div',null,view.value.text);};
 const gate=compile('../../components/FoundingCaptainAccessGate.jsx','FoundingCaptainAccessGate',{
  ...common,useCaptainAccess:accessHook,useSupabaseAuth:()=>auth,peloraWordmark:'image',PeloraStartupFlow:startup,
  supabase:{from:()=>({select(){return this;},eq(key,id){this.id=id;return this;},maybeSingle(){return Promise.resolve({data:{user_id:this.id,access_status:approved?'approved':'pending',access_role:'founder'},error:null});}})}
 });
 const C=()=>{window.setTimeout=fn=>{fn();return 1;};window.clearTimeout=()=>{};return React.createElement(gate);};const h=await mount(C,{},store);
 try{
 assert(!h.container.textContent.includes('PRIVATE'));assert.equal(reads,0);
 auth={session:{user:principal('A'),access_token:'synthetic-A'},user:principal('A'),loading:false};await h.render({});assert(!h.container.textContent.includes('PRIVATE'));assert.equal(reads,0);
 approved=true;auth={...auth,session:{...auth.session,access_token:'synthetic-reauth'}};await h.render({});assert.match(h.container.textContent,/PRIVATE A/);
 auth={session:{user:principal('B'),access_token:'synthetic-B'},user:principal('B'),loading:false};await h.render({});assert.match(h.container.textContent,/PRIVATE B/);assert(!h.container.textContent.includes('PRIVATE A'));
 auth={session:null,user:null,loading:false};await h.render({});assert(!h.container.textContent.includes('PRIVATE'));
 auth={session:{user:principal('A'),access_token:'synthetic-A-again'},user:principal('A'),loading:false};await h.render({});assert.match(h.container.textContent,/PRIVATE A/);assert.equal(h.errors.length,0);
 }finally{await h.close();}
});
test('late successful save after account switch cannot erase another draft or alert other captain',async()=>{
 const store=new Storage();const h=await workspace(store);let resolve;try{await h.report();await edit('Captain','A submitted');insertResult=()=>new Promise(r=>resolve=r);let saving;await act(async()=>{saving=submit({preventDefault(){},nativeEvent:{}});});await h.render({...h.props,user:principal('B'),session:{user:principal('B'),access_token:'B'}});await act(async()=>seen.Today.setReportPanelOpen(true));await edit('Captain','B current');let alerts=0;h.win.alert=()=>alerts++;await act(async()=>{resolve({data:{id:'saved-A'},error:null});await saving;});assert.equal(alerts,0);assert.equal(stored(store,'B','fishing-draft').value.report.captain,'B current');}finally{await h.close();insertResult={data:{id:'saved'},error:null};}
});
test('concurrent replacement revision is not deleted by older completion',async()=>{
 const store=new Storage();let view;const C=()=>{view=hook(principal('A'),'revision-test',()=>({text:''}),v=>typeof v?.text==='string');return null;};const h=await mount(C,{},store);try{await act(async()=>view.setValue({text:'old'}));const snapshot=view.capture();continuity.writeContinuity(store,'A','revision-test',{text:'other tab newer'});await act(async()=>assert.equal(view.complete(snapshot),false));assert.equal(stored(store,'A','revision-test').value.text,'other tab newer');}finally{await h.close();}
});
test('invalid draft field shapes and invalid camera use corruption fallback',async()=>{
 const store=new Storage();const invalid={activeTab:'map',layers:{},selectedSpotId:null,opportunitySelection:null,mapCamera:{center:[-91,'invalid'],zoom:7,bearing:0},sheetExpanded:false,reportPanelOpen:false};continuity.writeContinuity(store,'A','workspace',invalid);const h=await workspace(store);try{assert.match(h.container.textContent,/recovery was unavailable or damaged/);assert.equal(h.errors.length,0);}finally{await h.close();}
});

for(const review of [false,true])test('actual map component has stable hook order and preserves QA camera '+review,async()=>{
 const jumps=[];const listeners=new Map();const map={jumpTo:value=>jumps.push(value),on:(name,fn)=>listeners.set(name,fn),off:name=>listeners.delete(name),getCenter:()=>({lng:-91,lat:26}),getZoom:()=>8,getBearing:()=>42};
 const cameraHook=compile('../useMapCameraContinuity.js','useMapCameraContinuity',common);
 const noop=()=>{};const MapComponent=compile('../../components/MapLibreIntelligenceMap.jsx','MapLibreIntelligenceMap',{
  ...common,structures:[],buildMapGeoJson:()=>({type:'FeatureCollection',features:[]}),sampleLayersForMode:x=>x,
  useMapLibreSetup:({mapRef})=>{useEffect(()=>{mapRef.current=map;return()=>{mapRef.current=null;};},[mapRef]);},
  useMapCameraContinuity:cameraHook,useMapLibreLayers:noop,useMapLibreOceanFeatures:noop,useMapLibreEnvironmentalObservations:noop,
  useMapLibreOceanFields:noop,useSyntheticSstReview:noop,useMapLibreOpenWaterOpportunities:noop,useMapLibreOpportunitySelection:noop,useMapLibreMarkers:noop,useMapLibreSelection:noop
 });
 let captures=0;const props={layers:{locations:true},camera:{center:[-91,26],zoom:8,bearing:42},onCameraChange:()=>captures++,qaSamples:review};const h=await mount(MapComponent,props);
 try{assert.equal(jumps.length,review?0:1);await h.render({...props,layers:{locations:false}});assert.equal(h.errors.length,0);if(!review){listeners.get('moveend')();assert.equal(captures,1);}else assert.equal(listeners.size,0);}finally{await h.close();}
});
test('actual gate sign-out removes stored selection and later sign-in requires reselection',async()=>{
 const store=new Storage();let seeded=await workspace(store);await seeded.select();await click('Map');await seeded.close();
 let auth={session:{user:principal('A'),access_token:'A'},user:principal('A'),loading:false};
 const Gate=compile('../../components/FoundingCaptainAccessGate.jsx','FoundingCaptainAccessGate',{
  ...common,useCaptainAccess:accessHook,useSupabaseAuth:()=>auth,peloraWordmark:'image',PeloraStartupFlow:()=>React.createElement('div',null,'APPROVED WORKSPACE'),
  supabase:{from:()=>({select(){return this;},eq(key,id){this.id=id;return this;},maybeSingle(){return Promise.resolve({data:{user_id:this.id,access_status:'approved',access_role:'founder'}});}})}
 });
 const C=()=>{window.setTimeout=fn=>{fn();return 1;};window.clearTimeout=()=>{};return React.createElement(Gate);};const h=await mount(C,{},store);
 try{assert.match(h.container.textContent,/APPROVED WORKSPACE/);auth={session:null,user:null,loading:false};await h.render({});assert.equal(stored(store,'A','workspace').value.opportunitySelection,null);auth={session:{user:principal('A'),access_token:'reauth'},user:principal('A'),loading:false};await h.render({});assert.equal(stored(store,'A','workspace').value.opportunitySelection,null);assert.equal(h.errors.length,0);}finally{await h.close();}
});

test('draft restore schema rejects malformed nested display types and unknown report fields',()=>{
 const initial=compile('../../components/FishingDayReportPanel.jsx','createInitialReport()', {...scope,...temporal,...spatial});
 const original={report:initial,fishingLocationDraft:spatial.emptyLocationDraft(),areaSearch:''};assert.equal(continuity.validateFishingDraft(original,initial),true);
 for(const mutate of [v=>v.report.notes={nested:'invalid'},v=>v.report.birdActivity=[{}],v=>v.report.speciesResults.unknown={},v=>v.report.speciesResults.blueMarlin.sightings='invalid',v=>v.report.fishingLocations=[{}],v=>v.report.areasFished=[{id:'place',name:{}}],v=>v.report.access_token='must not restore',v=>v.fishingLocationDraft.latitude=null]){
 const value=structuredClone(original);mutate(value);assert.equal(continuity.validateFishingDraft(value,initial),false);
 }
});
test('workspace bytes carry only UI intent, never tokens or scientific opportunity snapshots',async()=>{
 const store=new Storage();const h=await workspace(store);try{await h.select();const record=stored(store,'A','workspace');assert.deepEqual(Object.keys(record.value.opportunitySelection.opportunity),['id']);const bytes=JSON.stringify(record);for(const text of ['access_token','captainNarrative','dynamicOpportunity','score','confidence'])assert(!bytes.includes(text));const invalid=structuredClone(record.value);invalid.access_token='invalid';assert.equal(continuity.validateWorkspace(invalid),false);}finally{await h.close();}
});

test('absent restored Place clears only its intent while preserving map position/tab',async()=>{
 const store=new Storage();let h=await workspace(store);await click('Map');await act(async()=>seen.MapLibreIntelligenceMap.setSelectedSpot(place));await h.close();const record=stored(store,'A','workspace');record.value.selectedSpotId='removed-place';store.setItem(continuity.continuityKey('A','workspace'),JSON.stringify(record));h=await workspace(store);try{assert.equal(stored(store,'A','workspace').value.selectedSpotId,null);assert.equal(stored(store,'A','workspace').value.activeTab,'map');assert.equal(h.errors.length,0);}finally{await h.close();}
});
