import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import React, {act, useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {transformSync} from 'rolldown/utils';
import {useCaptainAccess} from '../useCaptainAccess.js';
import {createTemporalDraft, updateTemporalDraft} from '../../utils/fishingLogTemporalCapture.js';

// Minimal DOM host for real React reconciliation, not a hook/reconciler mock.
// Browser layout, events and the full Dashboard are deliberately outside this test.
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

const gateSource = transformSync('gate.jsx', readFileSync(new URL('../../components/FoundingCaptainAccessGate.jsx', import.meta.url), 'utf8')
  .replace(/import[\s\S]*?;\s*/g, '').replace('export default FoundingCaptainAccessGate;', ''), {jsx:{runtime:'classic'}}).code;

function session(id = 'test-captain', token = 'test-credential') {
  return {user:{id, is_anonymous:false}, access_token:token};
}

async function setup() {
  const {doc, win} = host();
  globalThis.window = win; globalThis.document = doc; globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let auth = {session:session(), loading:false};
  const requests = []; const timers = [];
  const client = {from(table) {
    assert.equal(table, 'captain_access');
    return {select() {return this;}, eq(column, id) {
      assert.equal(column, 'user_id'); this.id = id; return this;
    }, maybeSingle() {return new Promise((resolve, reject) => requests.push({id:this.id, resolve, reject}));}};
  }};
  const view = {mounts:0, unmounts:0};
  // Real Fishing Log state/handlers; unrelated temporal-control presentation is
  // stubbed. Dashboard/startup is a stateful tab/modal ownership fixture.
  const panelSource = transformSync('panel.jsx', readFileSync(new URL('../../components/FishingDayReportPanel.jsx', import.meta.url), 'utf8')
    .replace(/import[\s\S]*?;\s*/g, '').replace('export default FishingDayReportPanel;', ''), {jsx:{runtime:'classic'}}).code;
  const FishingLog = vm.runInNewContext(`${panelSource}\nFishingDayReportPanel`, {
    React:{...React, createElement(type, props, ...children) {
      if (type === 'textarea') {
        view.draft = props.value;
        view.setDraft = value => props.onChange({target:{value}});
      }
      return React.createElement(type, props, ...children);
    }}, useMemo, useState, structuredClone, createTemporalDraft, updateTemporalDraft,
    FishingLogTemporalControls:() => null,
    insertReportWithTime:() => {throw new Error('Persistence is forbidden in this test');}
  });
  function Workspace({session:currentSession}) {
    const [tab, setTab] = useState('Home');
    const [open, setOpen] = useState(false);
    Object.assign(view, {tab, setTab, open, setOpen, token:currentSession.access_token});
    useEffect(() => {view.mounts++; return () => {view.unmounts++;};}, []);
    return React.createElement('section', null, 'workspace', tab, open ? 'log-open' : '', React.createElement(FishingLog, {isOpen:open, user:currentSession.user}));
  }
  const Gate = vm.runInNewContext(`${gateSource}\nFoundingCaptainAccessGate`, {
    React, useEffect, useState, useCaptainAccess, supabase:client,
    useSupabaseAuth:() => ({...auth, user:auth.session?.user ?? null}),
    PeloraStartupFlow:Workspace, peloraWordmark:'test-image',
    window:{setTimeout:fn => {timers.push(fn); return timers.length;}, clearTimeout() {}}
  });
  const container = doc.createElement('div'); const root = createRoot(container);
  const render = async next => {if (next) auth = next; await act(async () => root.render(React.createElement(Gate)));};
  await render(); await act(async () => timers.forEach(fn => fn()));
  const settle = async (status = 'approved', index = requests.length - 1) => {
    const request = requests[index];
    await act(async () => request.resolve(status === 'error' ? {error:new Error('synthetic lookup failure')} :
      {data:status === null ? null : {user_id:request.id, access_status:status}, error:null}));
  };
  const enterDraft = async () => {
    await settle();
    await act(async () => {view.setTab('Reports'); view.setOpen(true);});
    await act(async () => view.setDraft('unsaved-test-draft'));
  };
  const continuous = () => {
    assert.equal(view.mounts, 1); assert.equal(view.unmounts, 0);
    assert.equal(view.tab, 'Reports'); assert.equal(view.open, true); assert.equal(view.draft, 'unsaved-test-draft');
    assert.match(container.textContent, /workspace/); assert.doesNotMatch(container.textContent, /The ocean is talking/);
  };
  return {view, requests, container, render, settle, enterDraft, continuous,
    close:async () => {await act(async () => root.unmount()); delete globalThis.window; delete globalThis.document; delete globalThis.IS_REACT_ACT_ENVIRONMENT;}};
}

test('initial authorization blocks; same-principal recovery/refresh preserves mounted tab, modal, draft and current token', async () => {
  const h = await setup();
  try {
    assert.equal(h.view.mounts, 0); assert.doesNotMatch(h.container.textContent, /workspace/);
    await h.enterDraft();
    for (const token of ['recovered-token', 'refreshed-token', 'recovered-again-token']) {
      await h.render({session:session('test-captain', token), loading:false});
      h.continuous(); assert.equal(h.view.token, token);
      await h.settle(); h.continuous();
    }
  } finally {await h.close();}
});

for (const result of ['error', 'revoked', 'pending', null]) {
  test(`pending preserves workspace; ${result ?? 'missing approval'} removes it`, async () => {
    const h = await setup();
    try {
      await h.enterDraft(); await h.render({session:session(), loading:false}); h.continuous();
      await h.settle(result);
      assert.equal(h.view.unmounts, 1); assert.doesNotMatch(h.container.textContent, /workspace/);
      if (result === 'error') assert.match(h.container.textContent, /could not verify/);
      await h.render({session:session(), loading:false});
      assert.doesNotMatch(h.container.textContent, /workspace/); // No stale approval on the next lookup.
    } finally {await h.close();}
  });
}

for (const [name, next] of [
  ['sign-out', null], ['anonymous', {...session(), user:{id:'test-captain', is_anonymous:true}}],
  ['missing credential', {...session(), access_token:null}], ['principal change', session('other-test-captain')]
]) {
  test(`${name} rejects prior workspace and late results`, async () => {
    const h = await setup();
    try {
      await h.enterDraft(); await h.render({session:session(), loading:false}); const stale = h.requests.length - 1;
      await h.render({session:next, loading:false});
      assert.equal(h.view.unmounts, 1); assert.doesNotMatch(h.container.textContent, /workspace/);
      await h.settle('approved', stale); assert.doesNotMatch(h.container.textContent, /workspace/);
      if (name === 'principal change') {
        await h.settle(); assert.equal(h.view.tab, 'Home'); assert.equal(h.view.open, false);
        await act(async () => h.view.setOpen(true)); assert.equal(h.view.draft, '');
      }
    } finally {await h.close();}
  });
}

test('stale overlapping lookup cannot override newest approval; rejected promise fails closed', async () => {
  const h = await setup();
  try {
    await h.enterDraft(); await h.render({session:session(), loading:false}); const stale = h.requests.length - 1;
    await h.render({session:session(), loading:false}); await h.settle(); await h.settle('revoked', stale); h.continuous();
    await h.render({session:session(), loading:false}); h.continuous();
    await act(async () => h.requests.at(-1).reject(new Error('synthetic network error')));
    assert.equal(h.view.unmounts, 1);
  } finally {await h.close();}
});

test('approved record for another principal cannot authorize initial entry', async () => {
  const h = await setup();
  try {
    await act(async () => h.requests[0].resolve({data:{user_id:'other-test-captain', access_status:'approved'}}));
    assert.equal(h.view.mounts, 0); assert.doesNotMatch(h.container.textContent, /workspace/);
  } finally {await h.close();}
});

test('a superseded approval cannot override a newer same-principal denial', async () => {
  const h = await setup();
  try {
    await h.enterDraft();
    await h.render({session:session(), loading:false}); const stale = h.requests.length - 1;
    await h.render({session:session(), loading:false}); h.continuous();
    await h.settle('revoked');
    await h.settle('approved', stale);
    assert.equal(h.view.mounts, 1); assert.equal(h.view.unmounts, 1);
    assert.doesNotMatch(h.container.textContent, /workspace|unsaved-test-draft/);
  } finally {await h.close();}
});

test('new principal denial cannot be overridden by the former principal approval', async () => {
  const h = await setup();
  try {
    await h.enterDraft();
    await h.render({session:session(), loading:false}); const stale = h.requests.length - 1;
    await h.render({session:session('other-test-captain'), loading:false});
    assert.doesNotMatch(h.container.textContent, /workspace|unsaved-test-draft/);
    await h.settle('pending'); await h.settle('approved', stale);
    assert.equal(h.view.mounts, 1); assert.equal(h.view.unmounts, 1);
    assert.doesNotMatch(h.container.textContent, /workspace|unsaved-test-draft/);
  } finally {await h.close();}
});

test('pending result is not consumed after unmount; a fresh gate requires fresh approval', async () => {
  const h = await setup();
  await h.enterDraft(); await h.render({session:session(), loading:false});
  const request = h.requests.at(-1);
  await h.close();
  let consumed = false;
  request.resolve({data:{get user_id() {consumed = true; return request.id;}, access_status:'approved'}});
  await Promise.resolve(); await Promise.resolve();
  assert.equal(consumed, false); assert.equal(h.view.unmounts, 1);
  assert.equal(h.container.textContent, '');
  const fresh = await setup();
  try {
    assert.equal(fresh.view.mounts, 0); assert.doesNotMatch(fresh.container.textContent, /workspace/);
  } finally {await fresh.close();}
});
