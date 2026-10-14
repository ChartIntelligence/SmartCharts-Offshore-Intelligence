import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import * as qa from '../../utils/localQaReadOnly.js';
const runtime=pathToFileURL(process.argv[2].replaceAll('\\','/')+'/');
const React=(await import(new URL('react/index.js',runtime))).default;
const {act,useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState}=React;
const {createRoot}=await import(new URL('react-dom/client.js',runtime));
const {flushSync}=await import(new URL('react-dom/index.js',runtime));
const {transformSync}=await import(new URL('rolldown/dist/utils-index.mjs',runtime));
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



const QA={VITE_PELORA_LOCAL_QA_READ_ONLY:'1',VITE_SUPABASE_URL:'https://vqzskzoizpomwzgbgdwl.supabase.co',VITE_PELORA_API_BASE:'http://127.0.0.1:8787'};
const principal=id=>({id,is_anonymous:false});
const row=(id='A')=>({id:id+'-REPORT',user_id:id,trip_date:'2026-10-13',captain_private:'Synthetic captain '+id,boat_private:'Synthetic boat '+id,notes_private:'SYNTHETIC NOTES '+id,species_results:{},created_at:'2026-10-13T12:00:00Z'});
function nodes(root){return [root,...root.childNodes.flatMap(nodes)];}
function props(node){const key=Object.keys(node).find(k=>k.startsWith('__reactProps$'));return key?node[key]:{};}
function button(h,text){const n=nodes(h.container).find(n=>n.tagName==='BUTTON'&&n.textContent===text);assert(n,'Missing '+text);return props(n).onClick;}
async function click(h,text){await act(async()=>{await button(h,text)();});}
async function workspace(environment={},options={}){
 const state={environment,from:[],selects:[],deletes:[],confirm:[],alerts:[],loads:[],deleteResult:{error:null},confirmValue:true};
 const sdk={from(table){state.from.push(table);const q={mode:null,filters:[],select(){this.mode='read';return this;},delete(){this.mode='delete';return this;},eq(k,v){this.filters.push([k,v]);return this;},order(){return this;},then(resolve,reject){if(this.mode==='read'){state.selects.push(this.filters);const owner=this.filters.find(x=>x[0]==='user_id')?.[1];if(options.pendingRead)return new Promise((r,j)=>state.loads.push({owner,resolve:r,reject:j})).then(resolve,reject);return Promise.resolve(options.readResult??{data:[row(owner)],error:null}).then(resolve,reject);}state.deletes.push(this.filters);return Promise.resolve(state.deleteResult).then(resolve,reject);}};return q;}};
 const source=process.argv[3]==='--baseline'?execFileSync('git',['show','71356135fe7aa945b52ea032d367e4f65dea5156:frontend/src/components/SavedFishingDayReports.jsx'],{encoding:'utf8'}):readFileSync(new URL('../../components/SavedFishingDayReports.jsx',import.meta.url),'utf8');
 const raw=source.replace(/^import[\s\S]*?;\s*/gm,'').replace(/export default \w+;/g,'');
 const code=transformSync('SavedFishingDayReports.jsx',raw,{jsx:{runtime:'classic'}}).code;
 const quiet={error(){}};
 const Component=new Function('React','useCallback','useEffect','useLayoutEffect','useMemo','useRef','useState','supabase','assertLocalQaWriteAllowed','console',code+';return SavedFishingDayReports;')(React,useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,sdk,()=>qa.assertLocalQaWriteAllowed(state.environment),quiet);
 const {doc,win}=host();win.confirm=text=>{state.confirm.push(text);state.onConfirm?.();return state.confirmValue;};win.alert=text=>state.alerts.push(text);
 Object.assign(globalThis,{window:win,document:doc,IS_REACT_ACT_ENVIRONMENT:true});const errors=[],container=doc.createElement('div'),root=createRoot(container,{onUncaughtError:e=>errors.push(e),onCaughtError:e=>errors.push(e)});let input={user:principal('A'),authLoading:false,...options.props};
 const render=async next=>{input={...input,...next};await act(async()=>root.render(React.createElement(Component,input)));};await render();return {container,state,errors,render,renderSync:next=>{input={...input,...next};flushSync(()=>root.render(React.createElement(Component,input)));},close:async()=>{await act(async()=>root.unmount());delete globalThis.window;delete globalThis.document;}};
}
for(const [label,env] of [['explicit QA',QA],['missing URL',{...QA,VITE_SUPABASE_URL:undefined}],['wrong URL',{...QA,VITE_SUPABASE_URL:'https://wrong.invalid'}],['missing API',{...QA,VITE_PELORA_API_BASE:undefined}],['wrong API',{...QA,VITE_PELORA_API_BASE:'https://wrong.invalid'}]])test(label+' denies direct handler before confirm/SDK and retains expanded nonempty row',async()=>{const h=await workspace(env);try{await click(h,'View Details');assert.match(h.container.textContent,/SYNTHETIC NOTES A/);const direct=button(h,'Delete'),calls=h.state.from.length;await act(async()=>direct());assert.equal(h.state.deletes.length,0);assert.equal(h.state.confirm.length,0);assert.equal(h.state.from.length,calls);assert.match(h.container.textContent,/Report was not deleted/);assert.match(h.container.textContent,/SYNTHETIC NOTES A/);assert.match(h.container.textContent,/1 private report/);assert.equal(h.errors.length,0);}finally{await h.close();}});
test('normal confirmed deletion uses exact owner/id filters and removes only target',async()=>{const h=await workspace({}, {readResult:{data:[row(),{...row(),id:'A-SECOND',boat_private:'Second boat'}],error:null}});try{await click(h,'View Details');await click(h,'Delete');assert.equal(h.state.confirm.length,1);assert.deepEqual(h.state.deletes,[[['id','A-REPORT'],['user_id','A']]]);assert(!h.container.textContent.includes('Synthetic boat A'));assert.match(h.container.textContent,/Second boat/);assert.match(h.container.textContent,/1 private report/);}finally{await h.close();}});
test('normal cancel retains expanded report with no SDK mutation',async()=>{const h=await workspace();try{h.state.confirmValue=false;await click(h,'View Details');await click(h,'Delete');assert.equal(h.state.deletes.length,0);assert.match(h.container.textContent,/SYNTHETIC NOTES A/);}finally{await h.close();}});
test('normal SDK error retains report and existing failure behavior',async()=>{const h=await workspace();try{h.state.deleteResult={error:{message:'CONTROLLED DELETE ERROR'}};await click(h,'View Details');await click(h,'Delete');assert.match(h.container.textContent,/SYNTHETIC NOTES A/);assert.match(h.state.alerts[0],/could not be deleted/);}finally{await h.close();}});
test('QA activated during confirm is checked again before SDK',async()=>{const h=await workspace();try{h.state.onConfirm=()=>h.state.environment=QA;await click(h,'Delete');assert.equal(h.state.deletes.length,0);assert.match(h.container.textContent,/Report was not deleted/);}finally{await h.close();}});
for(const loss of [{user:null},{authLoading:true},{user:{id:'A',is_anonymous:true}},{user:{id:''}}])test('missing owner/session authority masks rows '+JSON.stringify(loss),async()=>{const h=await workspace();try{const old=button(h,'Delete');await h.render(loss);await act(async()=>old());assert.equal(h.state.deletes.length,0);assert.equal(h.state.confirm.length,0);assert(!h.container.textContent.includes('Synthetic boat A'));}finally{await h.close();}});
test('old A handler after B/A cannot delete or expose old rows',async()=>{const h=await workspace();try{const old=button(h,'Delete');await h.render({user:principal('B')});assert(!h.container.textContent.includes('Synthetic boat A'));await h.render({user:principal('A')});await act(async()=>old());assert.equal(h.state.deletes.length,0);assert.equal(h.state.confirm.length,0);}finally{await h.close();}});
test('owner changes inside confirm deny SDK call',async()=>{const h=await workspace();try{const old=button(h,'Delete');h.state.onConfirm=()=>{h.renderSync({user:principal('B')});};await act(async()=>old());assert.equal(h.state.deletes.length,0);}finally{await h.close();}});
test('late A read after B does not reveal A nonempty reports',async()=>{const h=await workspace({}, {pendingRead:true});try{assert.match(h.container.textContent,/Loading fishing reports/);await h.render({user:principal('B')});await act(async()=>h.state.loads.find(x=>x.owner==='B').resolve({data:[row('B'),row('A')],error:null}));await act(async()=>h.state.loads.find(x=>x.owner==='A').resolve({data:[row('A')],error:null}));assert.match(h.container.textContent,/Synthetic boat B/);assert(!h.container.textContent.includes('Synthetic boat A'));assert(!h.container.textContent.includes('SYNTHETIC NOTES A'));}finally{await h.close();}});
test('loading, failed/unavailable read, successful empty remain distinct',async()=>{for(const result of [{data:null,error:{message:'Controlled unavailable'}},{data:[],error:null}]){const h=await workspace({}, {readResult:result});try{assert.match(h.container.textContent,result.error?/Reports could not be loaded/:/No reports saved yet/);assert(!h.container.textContent.includes('Loading fishing reports'));}finally{await h.close();}}});
test('no owner starts no report read',async()=>{const h=await workspace(QA,{props:{user:null}});try{assert.equal(h.state.from.length,0);assert(!h.container.textContent.includes('Synthetic boat'));assert.match(h.container.textContent,/Private reports are unavailable/);assert(!h.container.textContent.includes('No reports saved yet'));}finally{await h.close();}});
test('late normal delete success cannot clear a new owner or returning A report',async()=>{let done;const h=await workspace();try{h.state.deleteResult=new Promise(r=>done=r);const old=button(h,'Delete');let pending;await act(async()=>{pending=old();});await h.render({user:principal('B')});assert.match(h.container.textContent,/Synthetic boat B/);await h.render({user:principal('A')});await act(async()=>{done({error:null});await pending;});assert.match(h.container.textContent,/Synthetic boat A/);assert.match(h.container.textContent,/1 private report/);assert.equal(h.state.alerts.length,0);}finally{await h.close();}});
test('late delete error after owner change never alerts the new captain',async()=>{let done;const h=await workspace();try{h.state.deleteResult=new Promise(r=>done=r);let pending;await act(async()=>{pending=button(h,'Delete')();});await h.render({user:principal('B')});await act(async()=>{done({error:{message:'OBSOLETE A DELETE'}});await pending;});assert.equal(h.state.alerts.length,0);assert.match(h.container.textContent,/Synthetic boat B/);}finally{await h.close();}});
test('captured handler after component unmount cannot confirm/delete',async()=>{const h=await workspace();const old=button(h,'Delete');await h.close();await act(async()=>old());assert.equal(h.state.deletes.length,0);assert.equal(h.state.confirm.length,0);});
for(const id of [123,{},'   '])test('malformed owner is fail-closed '+JSON.stringify(id),async()=>{const h=await workspace({}, {props:{user:{id,is_anonymous:false}}});try{assert.equal(h.state.from.length,0);assert(!h.container.textContent.includes('Synthetic boat'));}finally{await h.close();}});
test('QA blocked status does not follow owner B/A; source rows unchanged',async()=>{const records=[row(),row('B')],before=JSON.stringify(records);const h=await workspace(QA,{readResult:{data:records,error:null}});try{await click(h,'Delete');assert.match(h.container.textContent,/Report was not deleted/);await h.render({user:principal('B')});assert(!h.container.textContent.includes('Report was not deleted'));assert(!h.container.textContent.includes('Synthetic boat A'));await h.render({user:principal('A')});assert(!h.container.textContent.includes('Report was not deleted'));assert.equal(JSON.stringify(records),before);assert.equal(h.state.deletes.length,0);}finally{await h.close();}});
