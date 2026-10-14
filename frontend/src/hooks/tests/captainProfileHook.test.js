import assert from 'node:assert/strict';
import {test} from 'node:test';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {useCaptainAccess} from '../useCaptainAccess.js';
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


test('actual owner hook: single read, revalidation, principal race and signout masking',async()=>{
 const {doc,win}=host();globalThis.document=doc;globalThis.window=win;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 let session={access_token:'CONTROLLED_TOKEN',user:{id:'CONTROLLED_A',is_anonymous:false,email:'a@example.invalid'}};const requests=[];let view;
 const client={from(table){assert.equal(table,'captain_access');return {select(fields){assert.equal(fields,'user_id, display_name, boat_name, access_role, access_status');return {eq(key,id){assert.equal(key,'user_id');return {maybeSingle:()=>new Promise(resolve=>requests.push({id,resolve}))};}};}};}};
 function Probe(){view=useCaptainAccess({session,authLoading:false,client});return null;}
 const root=createRoot(doc.createElement('div'));const render=()=>act(async()=>root.render(React.createElement(Probe)));
 const settle=async(index,status='approved')=>act(async()=>requests[index].resolve({data:{user_id:requests[index].id,access_role:'founding_captain',access_status:status,display_name:'Controlled'},error:null}));
 await render();assert.equal(view.profileRead.resolution,'LOADING');assert.equal(view.approved,false);assert.equal(requests.length,1);
 await settle(0);assert.equal(view.approved,true);assert.equal(view.profileRead.resolution,'RESOLVED');assert.equal(view.profileRead.profile.ownerId,'CONTROLLED_A');
 session={...session,access_token:'CONTROLLED_REFRESH'};await render();assert.equal(view.revalidating,true);assert.equal(view.profileRead.resolution,'REVALIDATING');assert.equal(requests.length,2);
 session={access_token:'CONTROLLED_B_TOKEN',user:{id:'CONTROLLED_B',is_anonymous:false}};await render();assert.equal(view.approved,false);assert.equal(view.profileRead.profile,null);await settle(1);assert.equal(view.profileRead.profile,null);await settle(2);assert.equal(view.profileRead.profile.ownerId,'CONTROLLED_B');
 session=null;await render();assert.equal(view.approved,false);assert.equal(view.profileRead.resolution,'NO_AUTHORIZED_OWNER');assert.equal(view.profileRead.profile,null);await act(async()=>root.unmount());
});
