import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {pathToFileURL} from 'node:url';
import * as startup from '../../utils/founderHttpsPreview.js';
import {captainProfileRead} from '../../utils/captainProfileRead.js';
const runtime=pathToFileURL(process.argv[2].replaceAll('\\','/')+'/');
const React=(await import(new URL('react/index.js',runtime))).default;
const {act,useEffect,useLayoutEffect,useState,useRef,useCallback}=React;
const {createRoot}=await import(new URL('react-dom/client.js',runtime));
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




const ids=['synthetic-captain-a','synthetic-captain-b'];
const emails=['a@example.invalid','b@example.invalid'];
const preview={VITE_PELORA_FOUNDER_HTTPS_PREVIEW:'1',VITE_PELORA_LOCAL_QA_READ_ONLY:'1',VITE_SUPABASE_URL:'https://vqzskzoizpomwzgbgdwl.supabase.co',VITE_PELORA_API_BASE:'https://pelora-backend-build-validation.onrender.com',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_SYNTHETIC'};
const legacy={VITE_PELORA_LOCAL_QA_READ_ONLY:'1',VITE_SUPABASE_URL:'https://vqzskzoizpomwzgbgdwl.supabase.co',VITE_PELORA_API_BASE:'http://127.0.0.1:8787',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_SYNTHETIC'};
const session=(index=0)=>({access_token:'SYNTHETIC-NO-CREDENTIAL',user:{id:ids[index],email:emails[index],is_anonymous:false}});
function nodes(root){return [root,...root.childNodes.flatMap(nodes)];}
function props(node){const key=Object.keys(node).find(k=>k.startsWith('__reactProps$'));return key?node[key]:{};}
function compile(file,name,scope){const raw=readFileSync(new URL(file,import.meta.url),'utf8').replace(/^import[\s\S]*?;\s*/gm,'').replace(/export default \w+;/g,'').replace(/export function /g,'function ');return new Function(...Object.keys(scope),transformSync(name+'.jsx',raw,{jsx:{runtime:'classic'}}).code+';return '+name)(...Object.values(scope));}
async function mount({environment=preview,initial=null,initialError=null,gate=false,origin=environment.VITE_PELORA_FOUNDER_HTTPS_PREVIEW==='1'?'https://pelora-release-build-validation.onrender.com':'https://ordinary.example.invalid',pendingSession=false,signInOptions,expectFailure=false,strict=false}={}){
 const state={get:0,anonymous:0,otp:[],logout:[],queries:[],view:null,workspace:null,logs:[],unsub:0};const listeners=new Set();
 const sdk={auth:{getSession(){state.get++;return pendingSession?new Promise(r=>state.finishSession=r):Promise.resolve({data:{session:initial},error:initialError});},onAuthStateChange(cb){listeners.add(cb);return {data:{subscription:{unsubscribe(){listeners.delete(cb);state.unsub++;}}}};},signInAnonymously:async()=>{state.anonymous++;return {data:{session:{access_token:'SYNTHETIC',user:{id:'synthetic-anonymous',is_anonymous:true}}},error:null};},signInWithOtp(options){state.otp.push(options);state.onOtp?.();return state.otpResult?state.otpResult():Promise.resolve({error:null});},signOut(...args){state.logout.push(args);return state.logoutResult?state.logoutResult():Promise.resolve({error:null});}},from(){return {select(){return this;},eq(key,id){this.id=id;return this;},maybeSingle(){state.queries.push(this.id);return Promise.resolve({data:{user_id:this.id,access_role:'founder',access_status:state.accessStatus??'approved',display_name:'Synthetic Captain',boat_name:'Synthetic Boat'},error:null});}};}};
 const configured=()=>startup.founderPreviewConfiguration(environment,origin);
 const scope={React,useEffect,useLayoutEffect,useCallback,useRef,useState,supabase:sdk,founderPreviewConfiguration:configured,founderPreviewSession:startup.founderPreviewSession,founderPreviewSignInOptions:signInOptions??startup.founderPreviewSignInOptions,console:{error:()=>state.logs.push('error')}};
 const useAuth=compile('../useSupabaseAuth.js','useSupabaseAuth',scope);
 const useAccess=compile('../useCaptainAccess.js','useCaptainAccess',{...scope,captainProfileRead});
 const Workspace=props=>{state.workspace=props;return React.createElement('div',null,'SYNTHETIC WORKSPACE');};
 const Component=gate?compile('../../components/FoundingCaptainAccessGate.jsx','FoundingCaptainAccessGate',{...scope,useSupabaseAuth:useAuth,useCaptainAccess:useAccess,PeloraStartupFlow:Workspace,peloraWordmark:'SYNTHETIC',invalidateStoredSelection(){}}):()=>{state.view=useAuth();return React.createElement('div',null,state.view.user?'SESSION ADMITTED':'NO SESSION');};
 const {doc,win}=host();win.location={origin};win.setTimeout=fn=>{fn();return 1;};win.clearTimeout=()=>{};win.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
 Object.assign(globalThis,{window:win,document:doc,IS_REACT_ACT_ENVIRONMENT:true});const errors=[],container=doc.createElement('div'),root=createRoot(container,{onCaughtError:e=>errors.push(e),onUncaughtError:e=>errors.push(e)});try{await act(async()=>root.render(strict?React.createElement(React.StrictMode,null,React.createElement(Component)):React.createElement(Component)));}catch(error){if(!expectFailure)throw error;errors.push(error);}return {state,container,errors,emit:async next=>{await act(async()=>{for(const listener of [...listeners])listener('SYNTHETIC_EVENT',next);});},close:async()=>{await act(async()=>root.unmount());delete globalThis.window;delete globalThis.document;},type:async value=>{const input=nodes(container).find(n=>n.tagName==='INPUT');assert(input);await act(async()=>props(input).onChange({target:{value}}));},submit:()=>{const form=nodes(container).find(n=>n.tagName==='FORM');assert(form);return props(form).onSubmit({preventDefault(){}});}};
}

for(const [label,initial] of [['empty',null],['anonymous',{access_token:'SYNTHETIC',user:{id:ids[0],is_anonymous:true}}],['malformed',{access_token:'SYNTHETIC',user:{id:123,is_anonymous:false}}]])test('preview '+label+' startup no anonymous creation',async()=>{const h=await mount({initial});try{assert.equal(h.state.get,1);assert.equal(h.state.anonymous,0);assert.equal(h.state.view.session,null);assert.equal(h.state.view.loading,false);}finally{await h.close();}});
for(const index of [0,1])test('preview retains exact authenticated session reference '+index,async()=>{const original=session(index),h=await mount({initial:original});try{assert.strictEqual(h.state.view.session,original);await h.emit(null);assert.equal(h.state.view.session,null);assert.equal(h.state.anonymous,0);await h.emit(original);assert.strictEqual(h.state.view.session,original);}finally{await h.close();}});
test('preview SDK session error is fixed and not logged',async()=>{const h=await mount({initialError:{message:'PRIVATE SDK DETAIL'}});try{assert.equal(h.state.view.session,null);assert.equal(h.state.anonymous,0);assert(!h.state.view.error.includes('PRIVATE'));assert.equal(h.state.logs.length,0);}finally{await h.close();}});
test('delayed initial session cannot overwrite newer Auth event',async()=>{const h=await mount({pendingSession:true});try{const b=session(1);await h.emit(b);await act(async()=>h.state.finishSession({data:{session:session()},error:null}));assert.strictEqual(h.state.view.session,b);}finally{await h.close();}});
for(const environment of [{},legacy])test('normal/legacy anonymous startup unchanged '+(environment===legacy?'legacy':'normal'),async()=>{const h=await mount({environment});try{assert.equal(h.state.anonymous,1);assert.equal(h.state.view.user.is_anonymous,true);}finally{await h.close();}});
test('preview malformed email makes no OTP request',async()=>{const h=await mount({gate:true});try{await h.type('invalid');await act(async()=>h.submit());assert.equal(h.state.otp.length,0);assert.match(h.container.textContent,/could not be requested/);}finally{await h.close();}});
test('preview explicit existing-account OTP is normalized/no-create/exact HTTPS redirect',async()=>{const h=await mount({gate:true});try{await h.type(' A@EXAMPLE.INVALID ');await act(async()=>h.submit());assert.deepEqual(h.state.otp,[{email:emails[0],options:{shouldCreateUser:false,emailRedirectTo:'https://pelora-release-build-validation.onrender.com/?app=1'}}]);assert.match(h.container.textContent,/Delivery and captain access are not yet verified/);assert.equal(h.state.anonymous,0);}finally{await h.close();}});
test('preview duplicate pending OTP denied and SDK errors fixed',async()=>{let done;const h=await mount({gate:true});try{h.state.otpResult=()=>new Promise(r=>done=r);await h.type(emails[0]);let pending;const ready=new Promise(r=>h.state.onOtp=r);await act(async()=>{pending=h.submit();await ready;});await act(async()=>h.submit());assert.equal(h.state.otp.length,1);await act(async()=>{done({error:{message:'PRIVATE OTP DETAIL'}});await pending;});assert.match(h.container.textContent,/could not be requested/);assert(!h.container.textContent.includes('PRIVATE'));}finally{await h.close();}});
for(const environment of [{},legacy])test('normal/legacy OTP and redirect unchanged '+(environment===legacy?'legacy':'normal'),async()=>{const h=await mount({gate:true,environment,origin:'http://127.0.0.1:4173'});try{await h.type('normal@example.invalid');await act(async()=>h.submit());assert.deepEqual(h.state.otp[0],{email:'normal@example.invalid',options:{emailRedirectTo:'http://127.0.0.1:4173/?app=1'}});}finally{await h.close();}});
for(const environment of [preview,{},legacy])test('preview-only local logout; ACK not session removal '+(environment===preview?'preview':environment===legacy?'legacy':'normal'),async()=>{const initial=session(),h=await mount({gate:true,environment,initial});try{const old=h.state.workspace.onSignOut;let result;await act(async()=>result=await old());assert.equal(result.reason,'SIGN_OUT_REQUESTED');assert.deepEqual(h.state.logout[0],environment===preview?[{scope:'local'}]:[]);assert.strictEqual(h.state.workspace.session,initial);await h.emit(null);assert(!h.container.textContent.includes('SYNTHETIC WORKSPACE'));}finally{await h.close();}});
test('retired preview Gate callback cannot invoke logout',async()=>{const h=await mount({gate:true,initial:session()});const old=h.state.workspace.onSignOut;await h.close();let result;await act(async()=>result=await old());assert.equal(result.reason,'STALE_OWNER');assert.equal(h.state.logout.length,0);});
for(const outcome of ['resolve','reject'])test('preview logout pending settlement stale after unmount '+outcome,async()=>{let done,fail;const h=await mount({gate:true,initial:session()});h.state.logoutResult=()=>new Promise((r,j)=>{done=r;fail=j;});let pending;await act(async()=>{pending=h.state.workspace.onSignOut();});await h.close();let result;await act(async()=>{if(outcome==='resolve')done({error:null});else fail(Error('PRIVATE SDK ERROR'));result=await pending;});assert.equal(result.reason,'STALE_OWNER');assert.deepEqual(h.state.logout,[[{scope:'local'}]]);});
test('same-principal Auth event retires prior logout callback',async()=>{const initial=session(),h=await mount({gate:true,initial});try{const old=h.state.workspace.onSignOut;await h.emit(initial);let result;await act(async()=>result=await old());assert.equal(result.reason,'STALE_OWNER');assert.equal(h.state.logout.length,0);await act(async()=>result=await h.state.workspace.onSignOut());assert.equal(result.reason,'SIGN_OUT_REQUESTED');}finally{await h.close();}});
test('null-session Auth event retires pending sign-in before SDK',async()=>{let release;const ready=new Promise(r=>release=r);const h=await mount({gate:true,signInOptions:async(...args)=>{await ready;return startup.founderPreviewSignInOptions(...args);}});try{await h.type(emails[0]);let pending;await act(async()=>{pending=h.submit();});await h.emit(null);await act(async()=>{release();await pending;});assert.equal(h.state.otp.length,0);assert(!h.container.textContent.includes('Sending...'));}finally{await h.close();}});
test('old pending OTP cannot overwrite new Auth epoch request',async()=>{let oldDone,newDone;const h=await mount({gate:true});try{h.state.otpResult=()=>new Promise(r=>{if(h.state.otp.length===1)oldDone=r;else newDone=r;});await h.type(emails[0]);let first,second;const r1=new Promise(r=>h.state.onOtp=r);await act(async()=>{first=h.submit();await r1;});await h.emit(null);await h.type(emails[1]);const r2=new Promise(r=>h.state.onOtp=r);await act(async()=>{second=h.submit();await r2;});await act(async()=>{oldDone({error:{message:'PRIVATE OLD ERROR'}});await first;});assert.match(h.container.textContent,/Sending.../);assert(!h.container.textContent.includes('PRIVATE'));await act(async()=>{newDone({error:null});await second;});assert.match(h.container.textContent,/Delivery and captain access/);}finally{await h.close();}});
test('preview still requires approved server access row',async()=>{const h=await mount({gate:true});try{h.state.accessStatus='pending';await h.emit(session());assert(!h.container.textContent.includes('SYNTHETIC WORKSPACE'));assert.match(h.container.textContent,/not.*currently approved/s);}finally{await h.close();}});
for(const patch of [{VITE_PELORA_FOUNDER_HTTPS_PREVIEW:undefined},{VITE_PELORA_LOCAL_QA_READ_ONLY:undefined},{VITE_SUPABASE_URL:'https://wrong.invalid'},{VITE_PELORA_API_BASE:'https://wrong.invalid'}])test('preview bad configuration blocks before Auth SDK '+Object.keys(patch)[0],async()=>{const h=await mount({gate:true,environment:{...preview,...patch},origin:'https://pelora-release-build-validation.onrender.com',expectFailure:true});try{assert.equal(h.state.get,0);assert.equal(h.state.otp.length,0);assert.equal(h.state.queries.length,0);assert(h.errors.length>0);}finally{await h.close();}});
test('wrong HTTPS origin cannot enter preview Auth',async()=>{const h=await mount({gate:true,origin:'https://unapproved.invalid',expectFailure:true});try{assert.equal(h.state.get,0);assert(h.errors.length>0);}finally{await h.close();}});
test('owner A-B-A logout callbacks never resurrect',async()=>{const h=await mount({gate:true,initial:session()});try{const old=h.state.workspace.onSignOut;await h.emit(session(1));await h.emit(session());let result;await act(async()=>result=await old());assert.equal(result.reason,'STALE_OWNER');assert.equal(h.state.logout.length,0);}finally{await h.close();}});

test('preview effect replay does not strand the current Auth epoch',async()=>{const h=await mount({gate:true,initial:session(),strict:true});try{assert.equal(h.state.anonymous,0);assert(h.state.workspace);let result;await act(async()=>result=await h.state.workspace.onSignOut());assert.equal(result.reason,'SIGN_OUT_REQUESTED');assert.deepEqual(h.state.logout,[[{scope:'local'}]]);}finally{await h.close();}});
test('preview duplicate logout remains blocked and new Auth epoch owns its completion',async()=>{let firstDone,secondDone;const h=await mount({gate:true,initial:session()});try{h.state.logoutResult=()=>new Promise(r=>{if(h.state.logout.length===1)firstDone=r;else secondDone=r;});const old=h.state.workspace.onSignOut;let first,second,result;await act(async()=>{first=old();});await act(async()=>result=await old());assert.equal(result.reason,'IN_PROGRESS');await h.emit(session());const fresh=h.state.workspace.onSignOut;await act(async()=>{second=fresh();});await act(async()=>{firstDone({error:null});result=await first;});assert.equal(result.reason,'STALE_OWNER');await act(async()=>result=await fresh());assert.equal(result.reason,'IN_PROGRESS');assert.equal(h.state.logout.length,2);await act(async()=>{secondDone({error:null});result=await second;});assert.equal(result.reason,'SIGN_OUT_REQUESTED');}finally{await h.close();}});
