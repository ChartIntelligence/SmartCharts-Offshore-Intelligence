import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import React, {act, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {transformSync} from 'rolldown/utils';
import * as spatial from '../fishingLogSpatialCapture.js';
import * as temporal from '../fishingLogTemporalCapture.js';

// Minimal DOM host for actual React reconciliation; no layout simulation.
class HostNode {
  constructor(name, doc, type = 1) {
    this.nodeType = type; this.nodeName = name.toUpperCase();
    this.tagName = this.nodeName; this.ownerDocument = doc;
    this.childNodes = []; this.parentNode = null; this.style = {};
    this.attributes = {}; this.namespaceURI = 'http://www.w3.org/1999/xhtml';
  }
  focus() { this.ownerDocument.activeElement = this; }
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

const compile = name => transformSync(name, readFileSync(new URL(`../../components/${name}`,import.meta.url),'utf8')
  .replace(/import[\s\S]*?;\s*/g,'').replace(/export default function /,'function ').replace(/export default \w+;/,''),{jsx:{runtime:'classic'}}).code;
async function setup() {
  const {doc,win}=host(); globalThis.window=win; globalThis.document=doc; globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  let elements=[]; const payloads=[]; let fail=false; let closed=0;
  const proxyReact={...React,createElement(type,props,...children){elements.push({type,props,children});return React.createElement(type,props,...children);}};
  const Controls=vm.runInNewContext(`${compile('FishingLogSpatialControls.jsx')}\nFishingLogSpatialControls`,{
    React:proxyReact,useRef,useState,...spatial
  });
  const client={from(){return {insert(payload){payloads.push(payload);return {select(){return {single:async()=>fail?{error:new Error('synthetic failure')}:{data:{id:'test-report'}}};}};}};}};
  const Panel=vm.runInNewContext(`${compile('FishingDayReportPanel.jsx')}\nFishingDayReportPanel`,{
    React:proxyReact,useMemo,useRef,useState,structuredClone,...spatial,...temporal,
    FishingLogSpatialControls:Controls,FishingLogTemporalControls:()=>null,supabase:client,
    window:{alert(){}},console:{error(){}},requestAnimationFrame:fn=>fn()
  });
  const container=doc.createElement('div'); const root=createRoot(container);
  const run=async fn=>{elements=[];await act(async()=>{await fn();});};
  const latest=(type,predicate=()=>true)=>elements.findLast(e=>e.type===type&&predicate(e));
  const button=text=>latest('button',e=>e.children.includes(text));
  const input=field=>latest('input',e=>field==='label' ? e.props.type==='text'&&!e.props.placeholder&&!e.props.enterKeyHint : e.props.placeholder===(field==='latitude'?'29.12345':'-87.54321'));
  const change=async(field,value)=>{
    const element=field==='certainty'?latest('input',e=>e.props.type==='radio'&&e.props.value===value):input(field);
    await run(()=>element.props.onChange({target:{value}}));
  };
  const click=async text=>{const element=button(text);assert.ok(element,`button ${text}`);const form=latest('form'); await run(()=>element.props.type==='submit' ? form.props.onSubmit({preventDefault(){},nativeEvent:{submitter:{value:element.props.value}}}) : element.props.onClick());};
  const save=async()=>{const form=latest('form');await run(()=>form.props.onSubmit({preventDefault(){}}));};
  await run(()=>root.render(React.createElement(Panel,{isOpen:true,user:{id:'test-captain'},onClose:()=>{closed++;}})));
  return {run,latest,input,change,click,save,container,payloads,doc,setFail:value=>{fail=value;},closed:()=>closed,
    close:async()=>{await act(async()=>root.unmount());delete globalThis.window;delete globalThis.document;delete globalThis.IS_REACT_ACT_ENVIRONMENT;}};
}

test('real editor adds source facts, clears fields and errors, and renders accessible removable cards',async()=>{
  const h=await setup();try {
    assert.equal(h.input('latitude').props.type,'text');assert.equal(h.input('latitude').props.inputMode,'text');
    assert.equal(h.input('latitude').props.required,undefined);
    for(const field of ['latitude','longitude']) {
      const props=h.input(field).props;
      assert.equal(props.autoComplete,'off');assert.equal(props.autoCapitalize,'none');assert.equal(props.spellCheck,false);
      assert.equal(props.enterKeyHint,field==='latitude'?'next':'done');
    }
    for(const value of ['exact-as-reported','approximate','unknown']) assert.equal(h.latest('input',e=>e.props.value===value).props.checked,false);
    assert.ok(h.latest('legend',e=>e.children.includes('Position — optional')));
    await h.change('latitude','-');await h.click('Add Location');
    assert.equal(h.input('latitude').props.value,'-'); assert.equal(h.input('latitude').props['aria-invalid'],true);
    assert.match(h.input('latitude').props['aria-describedby'],/latitude-error/);
    assert.equal(h.doc.activeElement,h.input('latitude').props.ref.current);
    await h.change('latitude','29.5');await h.change('longitude','-86.2');
    await h.change('label','Morning stop');await h.change('certainty','approximate');await h.click('Add Location');
    assert.equal(h.input('latitude').props.value,'');assert.equal(h.input('longitude').props.value,'');assert.equal(h.input('label').props.value,'');
    assert.equal(h.latest('input',e=>e.props.value==='approximate').props.checked,false);
    assert.equal(h.input('latitude').props['aria-invalid'],false);assert.match(h.container.textContent,/Location added/);
    assert.match(h.container.textContent,/Morning stop/);
    assert.ok(h.latest('p',e=>e.props?.role==='status' && e.props['aria-live']==='polite'));
    assert.match(h.latest('button',e=>e.children.includes('Remove')).props['aria-label'],/Morning stop/);
    await h.click("Remove"); assert.doesNotMatch(h.container.textContent,/Morning stop/);
  }finally{await h.close();}
});

for (const [field,value] of [['latitude','29'],['longitude','-86'],['label','Edge'],['certainty','unknown']]) {
  test(`${field}-only draft requires fresh omission; Return preserves draft without INSERT`,async()=>{
    const h=await setup();try {
      await h.change(field,value);await h.save();assert.equal(h.payloads.length,0);
      assert.match(h.container.textContent,/This location hasn’t been added/);
      await h.click('Return to location');assert.equal(h.payloads.length,0);
      if(field!=='certainty') assert.equal(h.input(field).props.value,value);
      else assert.equal(h.latest('input',e=>e.props.value==='unknown').props.checked,true);
      await h.save();assert.match(h.container.textContent,/This location hasn’t been added/);
      await h.click('Save without this location'); assert.equal(h.payloads.length,1);
      assert.equal(h.payloads[0].fishing_locations.length,0);assert.equal(h.payloads[0].evidence_capture.locations.length,0);
      assert.equal(h.input('latitude').props.value,'');assert.equal(h.closed(),1);
    }finally{await h.close();}
  });
}

test('untouched and whitespace-only editors save without confirmation or auto-add',async()=>{
  for(const whitespace of [false,true]) {
    const h=await setup();try {
      if(whitespace) for(const field of ['latitude','longitude','label']) await h.change(field,'  ');
      await h.save();assert.equal(h.payloads.length,1);assert.equal(h.payloads[0].evidence_capture.locations.length,0);
      assert.doesNotMatch(h.container.textContent,/This location hasn’t been added/);
    }finally{await h.close();}
  }
});

test('failed omission preserves all draft fields and added entries; changed draft requires new consent',async()=>{
  const h=await setup();try {
    const notes=h.latest('textarea');await h.run(()=>notes.props.onChange({target:{value:'private-test-draft'}}));
    await h.change('latitude','29.5');await h.change('longitude','-86.2');await h.click('Add Location');
    await h.change('latitude','-');await h.change('longitude','4.');await h.change('label','Unadded');await h.change('certainty','approximate');
    h.setFail(true);await h.save();await h.click('Save without this location');
    assert.equal(h.payloads.length,1);assert.equal(h.latest('textarea').props.value,'private-test-draft');assert.equal(h.input('latitude').props.value,'-');assert.equal(h.input('longitude').props.value,'4.');
    assert.equal(h.input('label').props.value,'Unadded');assert.equal(h.latest('input',e=>e.props.value==='approximate').props.checked,true);
    assert.deepEqual(JSON.parse(JSON.stringify(h.payloads[0].fishing_locations)),[{latitude:29.5,longitude:-86.2}]);
    assert.equal(h.payloads[0].evidence_capture.locations.length,1);assert.equal(h.payloads[0].evidence_capture.locations[0].source,'manual');
    assert.equal(h.payloads[0].evidence_capture.locations[0].label,undefined);
    await h.save();assert.equal(h.payloads.length,1);await h.click('Return to location');await h.change('label','Changed draft');
    await h.save();assert.equal(h.payloads.length,1);assert.match(h.container.textContent,/This location hasn’t been added/);
    h.setFail(false);await h.click('Save without this location');assert.equal(h.payloads.length,2);
    assert.equal(h.input('label').props.value,'');assert.equal(h.closed(),1);
  }finally{await h.close();}
});

test('coordinate CSS uses real responsive stacking and focus/clearance rules',()=>{
  const css=readFileSync(new URL('../../styles/dashboard.css',import.meta.url),'utf8');
  assert.match(css,/@media \(max-width: 700px\)\s*\{\s*\.report-spatial-controls \.report-form-grid \{ grid-template-columns: minmax\(0,1fr\); \}/);
  assert.match(css,/\.report-location-card > div \{ min-width: 0/);
  assert.match(css,/scroll-padding-bottom: calc\(100px \+ env\(safe-area-inset-bottom/);
});
