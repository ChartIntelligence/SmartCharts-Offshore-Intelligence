import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import React, {act,useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {transformSync} from 'rolldown/utils';
import {interpretOpportunityEvaluation,EVALUATION_MESSAGES} from '../../utils/opportunityEvaluationState.js';
import {useCaptainAccess} from '../useCaptainAccess.js';

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


function compile(path, expression, scope={}) {
  const source=readFileSync(new URL(path,import.meta.url),'utf8')
    .replace(/^import\s[\s\S]*?;\s*/gm,'').replace(/export default \w+;/g,'')
    .replace(/export function /g,'function ').replace(/import\.meta\.env/g,'({DEV:false})');
  return vm.runInNewContext(transformSync(path,source,{jsx:{runtime:'classic'}}).code+'\n'+expression,
    {React,useCallback,useEffect,useMemo,useRef,useState,console:{error(){}},JSON,Date,Number,Array,Map,Set,AbortController,URLSearchParams,...scope});
}
async function mount(Component,props={}) {
  const {doc,win}=host(); Object.assign(win,{setInterval:()=>1,clearInterval(){},confirm:()=>true,alert(){}});
  Object.assign(globalThis,{window:win,document:doc,IS_REACT_ACT_ENVIRONMENT:true});
  const container=doc.createElement('div'),root=createRoot(container);
  const render=async next=>{props=next??props;await act(async()=>root.render(React.createElement(Component,props)));};
  await render(); return {container,win,render,close:async()=>{await act(async()=>root.unmount());delete globalThis.window;delete globalThis.document;delete globalThis.IS_REACT_ACT_ENVIRONMENT;}};
}
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const principal=id=>({user:{id,is_anonymous:false},access_token:id+'-token'});
const cycle=(rank=1,score=60,id='identity-X',coordinates=[25,-90],text='old evidence')=>({
  evaluationState:{contractVersion:'pelora-governed-opportunity-evaluation-state-v1',state:'available'},
  opportunities:[{location:{id,coordinates},rank,score,confidence:{label:text},primarySignal:{type:text},observedAt:text}],
  delivery:{captainNarratives:[{opportunityId:id,narrative:{sections:{summary:text},continuity:text,trend:text}}]}
});

async function requestDashboard(){
 const requests=[];
 const hook=compile('../useDynamicOpportunities.js','useDynamicOpportunities',{
  fetch:()=>{const d=deferred();requests.push(d);return d.promise;},resolvePeloraApiUrl:x=>x,persistenceRequestHeaders:()=>({})});
 const h=await dashboard(hook);
 const success=(i,value=cycle())=>act(async()=>requests[i].resolve({ok:true,json:async()=>value}));
 const failure=i=>act(async()=>requests[i].reject(new Error('synthetic terminal failure')));
 await success(0);await h.select();
 return {...h,requests,success,failure,
  token:token=>h.context({session:{...principal('A'),access_token:token}}),
  selected:()=>h.seen.MapLibreIntelligenceMap.selectedOpportunity,
  reselect:()=>act(async()=>h.seen.MapLibreIntelligenceMap.setSelectedOpportunity(h.seen.MapLibreIntelligenceMap.openWaterOpportunities[0]))};
}
test('actual Dashboard/hook failed credential refresh clears intent; changed-X retry does not reopen; explicit reselection works',async()=>{
 const h=await requestDashboard();try{
  await h.token('A-refresh');assert.equal(h.selected(),null);
  await h.failure(1);assert.equal(h.selected(),null);
  await h.token('A-retry');await h.success(2,cycle(3,81,'identity-X',[26,-91],'new evidence'));
  assert.equal(h.selected(),null);assert.equal(h.seen.MapLibreIntelligenceMap.openWaterOpportunities[0].id,'identity-X');
  assert.doesNotMatch(h.container.textContent,/SELECTED_PANEL/);
  await h.reselect();assert.equal(h.selected().dynamicOpportunity.score,81);
  assert.deepEqual(Array.from(h.selected().coordinates),[26,-91]);assert.equal(h.selected().captainNarrative.continuity,'new evidence');
  await act(async()=>h.seen.SelectedTarget.onViewIntelligence());
  assert.deepEqual(h.seen.OpportunityIntelligence.opportunity,h.selected());
 }finally{await h.close();}
});
test('loading-only credential refresh preserves intent and resolves newest same-ID content',async()=>{
 const h=await requestDashboard();try{const old=h.selected();await h.token('A-success');await h.success(1,cycle(2,75));
  assert.equal(h.selected().id,old.id);assert.notEqual(h.selected(),old);assert.equal(h.selected().dynamicOpportunity.rank,2);
 }finally{await h.close();}
});
test('failure followed by absent X then later X does not restore selection; governed zero is success',async()=>{
 const h=await requestDashboard();try{await h.token('fail');await h.failure(1);await h.token('without-X');await h.success(2,cycle(1,65,'Y'));
  assert.equal(h.selected(),null);await h.token('X-again');await h.success(3);assert.equal(h.selected(),null);
  await h.reselect();await h.token('zero');await h.success(4,{...cycle(),opportunities:[],evaluationState:{contractVersion:'pelora-governed-opportunity-evaluation-state-v1',state:'governed-zero'}});
  assert.equal(h.selected(),null);await h.token('after-zero');await h.success(5);assert.equal(h.selected(),null);
 }finally{await h.close();}
});
for(const oldResult of ['success','failure'])for(const latestResult of ['success','failure'])
test('actual request race: obsolete '+oldResult+' after active '+latestResult,async()=>{
 const h=await requestDashboard();try{
  await h.token('request-A');await h.token('request-B');
  if(latestResult==='success')await h.success(2,cycle(2,80));else await h.failure(2);
  if(oldResult==='success')await h.success(1,cycle(1,99));else await h.failure(1);
  assert.equal(h.selected()?.dynamicOpportunity.score??null,latestResult==='success'?80:null);
  await h.token('request-C');await h.success(3,cycle(3,82));
  assert.equal(h.selected()?.dynamicOpportunity.score??null,latestResult==='success'?82:null);
 }finally{await h.close();}
});
test('rapid A/B/C keeps C; obsolete outcomes cannot restore context or logout selection',async()=>{
 const h=await requestDashboard();try{
  await h.token('A1');await h.token('A2');await h.token('A3');await h.success(3,cycle(3,83));await h.failure(2);await h.success(1,cycle(1,99));assert.equal(h.selected().dynamicOpportunity.score,83);
  await h.token('pending');await h.context({tripMission:{selectedSpecies:'wahoo'}});await h.success(5,cycle(1,70));await h.success(4);assert.equal(h.selected(),null);
  await h.reselect();await h.context({user:null,session:null});await h.success(6);assert.equal(h.selected(),null);
 }finally{await h.close();}
});

for(const row of [null,{},[],{user_id:'B',access_status:'approved',access_role:'founder'},
 ...['founder','founding_captain'].flatMap(access_role=>['approved','pending','revoked'].map(access_status=>({user_id:'A',access_status,access_role}))),
 {user_id:'A',access_status:'approved',access_role:null},{user_id:'A',access_status:'invalid',access_role:'founder'}])
test('adversarial access owner/role/status '+JSON.stringify(row),async()=>{
 let view;const d=deferred();const client={from:()=>({select(){return this;},eq(){return this;},maybeSingle:()=>d.promise})};
 const h=await mount(()=>{view=useCaptainAccess({session:principalA,authLoading:false,client});return null;});
 try{assert.equal(view.approved,false);await act(async()=>d.resolve({data:row}));
  assert.equal(view.approved,row?.user_id==='A'&&row?.access_status==='approved'&&['founder','founding_captain'].includes(row?.access_role));
 }finally{await h.close();}
});
const principalA=principal('A');
test('adversarial pending to approved, then revoked; no-session ignores late approval',async()=>{
 const requests=[];let view;const client={from:()=>({select(){return this;},eq(){return this;},maybeSingle(){const d=deferred();requests.push(d);return d.promise;}})};
 const C=p=>{view=useCaptainAccess({...p,client,authLoading:false});return null;};const h=await mount(C,{session:principal('A')});
 const settle=(i,status)=>act(async()=>requests[i].resolve({data:{user_id:'A',access_status:status,access_role:'founder'}}));
 try{await settle(0,'pending');assert.equal(view.approved,false);await h.render({session:principal('A')});await settle(1,'approved');assert.equal(view.approved,true);
  await h.render({session:principal('A')});await settle(2,'revoked');assert.equal(view.approved,false);
  await h.render({session:principal('A')});await h.render({session:null});await settle(3,'approved');assert.equal(view.approved,false);
 }finally{await h.close();}
});
test('adversarial Saved Reports rapid A/B/A rejects both older owners and clears failure/empty state',async()=>{
 const h=await reports();try{
  await h.render({user:principal('B').user});await h.render({user:principal('A').user});
  await h.settle(0,'A','OLD A');await h.settle(1,'B','PRIVATE B');assert.doesNotMatch(h.container.textContent,/OLD A|PRIVATE B/);
  await h.settle(2,'A','CURRENT A');assert.match(h.container.textContent,/CURRENT A/);
  await h.render({user:principal('B').user});await act(async()=>h.requests[3].reject(Error('B failure')));assert.doesNotMatch(h.container.textContent,/CURRENT A/);
  await h.render({user:principal('B').user,refreshToken:1});await act(async()=>h.requests[4].resolve({data:[],error:null}));assert.match(h.container.textContent,/No reports/);
  await h.render({user:null});assert.doesNotMatch(h.container.textContent,/CURRENT A|PRIVATE B/);
 }finally{await h.close();}
});
test('adversarial Saved Reports unmount/remount never consumes prior request',async()=>{
 const old=await reports();await old.close();const fresh=await reports();
 try{await old.settle(0,'A','OLD INSTANCE');assert.doesNotMatch(fresh.container.textContent,/OLD INSTANCE/);await fresh.settle(0,'A','NEW INSTANCE');assert.match(fresh.container.textContent,/NEW INSTANCE/);}
 finally{await fresh.close();}
});
test('adversarial rapid same-ID rank/content cycles resolve last collection on every navigation',async()=>{
 const h=await dashboard();try{await h.select();for(let i=2;i<=5;i++){await h.refresh(cycle(i,60+i,'identity-X',[25+i/10,-90],'cycle-'+i));assert.equal(h.seen.SelectedTarget.selectedSpot.dynamicOpportunity.rank,i);}
  await act(async()=>h.seen.SelectedTarget.onViewIntelligence());assert.equal(h.seen.OpportunityIntelligence.opportunity.captainNarrative.continuity,'cycle-5');
 }finally{await h.close();}
});
async function dashboard(actualHook=null) {
  let data=cycle(); const seen={}; const child=name=>props=>{seen[name]=props;return name==='SelectedTarget'?React.createElement('div',null,'SELECTED_PANEL'):null;};
  const scope={interpretOpportunityEvaluation,structures:[],peloraHeaderLockup:'image',
    buildMapEnvironmentalObservations:()=>[],buildMapObservationDisplay:()=>({}),fieldStatusText:()=>'',sampleLayersForMode:x=>x,
    useLiveMarineConditions:()=>({data:null,loading:false,error:null}),useOceanMemoryPersistence(){},
    useDynamicOpportunities:actualHook??(()=>({data,loading:false,error:null})),window:{setInterval:()=>1,clearInterval(){}},
    ...Object.fromEntries(['TodayDashboard','LayerControls','MapLibreIntelligenceMap','MapLegend','TopOpportunity','OpportunityRanking','OpportunityIntelligence','HistoricalOpportunityContinuity','SelectedTarget','LocationSearch','FishingDayReportPanel','SavedFishingDayReports'].map(n=>[n,child(n)]))};
  const C=compile('../../components/Dashboard.jsx','Dashboard',scope);
  let props={session:principal('A'),user:principal('A').user,tripMission:{selectedSpecies:'blue-marlin'},captainSpatialContext:{explorationMode:'entire-gulf'}};
  const h=await mount(C,props);
  return {...h,seen,async select(){await act(async()=>{seen.TodayDashboard.setSelectedOpportunity(seen.TodayDashboard.topOpportunities[0]);seen.TodayDashboard.setActiveTab('map');});},
    async refresh(next){data=next;await h.render(props);},async context(patch){props={...props,...patch};await h.render(props);}};
}
test('actual Dashboard same-ID refresh replaces selected rank, score, evidence, narrative, coordinates and continuity',async()=>{
 const h=await dashboard();try{await h.select();const old=h.seen.SelectedTarget.selectedSpot;
 await h.refresh(cycle(3,81,'identity-X',[26,-91],'new governed evidence'));
 const fresh=h.seen.SelectedTarget.selectedSpot;
 assert.notEqual(fresh,old);assert.equal(fresh.id,old.id);assert.equal(fresh.dynamicOpportunity.rank,3);assert.equal(fresh.dynamicOpportunity.score,81);
 assert.equal(fresh.dynamicOpportunity.confidence.label,'new governed evidence');assert.equal(fresh.dynamicOpportunity.primarySignal.type,'new governed evidence');
 assert.deepEqual(Array.from(fresh.coordinates),[26,-91]);assert.equal(fresh.captainNarrative.continuity,'new governed evidence');
 assert.equal(h.seen.MapLibreIntelligenceMap.selectedOpportunity,fresh);
 await act(async()=>h.seen.SelectedTarget.onViewIntelligence());
 assert.equal(h.seen.OpportunityIntelligence.opportunity.id,fresh.id);
 assert.equal(h.seen.OpportunityIntelligence.opportunity.dynamicOpportunity.score,81);
 assert.equal(h.seen.OpportunityIntelligence.opportunity.captainNarrative.continuity,'new governed evidence');
 }finally{await h.close();}
});
test('removed identity and governed-zero clear selection; restoration does not resurrect it',async()=>{
 const h=await dashboard();try{await h.select();await h.refresh({...cycle(),opportunities:[],evaluationState:{contractVersion:'pelora-governed-opportunity-evaluation-state-v1',state:'governed-zero'}});
 assert.equal(h.seen.MapLibreIntelligenceMap.selectedOpportunity,null);await h.refresh(cycle());assert.equal(h.seen.MapLibreIntelligenceMap.selectedOpportunity,null);
 }finally{await h.close();}
});
for(const [name,patch] of [
 ['species',{tripMission:{selectedSpecies:'wahoo'}}],['origin',{captainSpatialContext:{explorationMode:'within-range',origin:{coordinates:[25,-90]},operatingRangeNm:50}}],
 ['range',{captainSpatialContext:{explorationMode:'within-range',origin:{coordinates:[25,-90]},operatingRangeNm:100}}],['principal',{user:principal('B').user,session:principal('B')}]
])test('Dashboard invalidates old selection on '+name,async()=>{const h=await dashboard();try{await h.select();await h.context(patch);assert.equal(h.seen.MapLibreIntelligenceMap.selectedOpportunity,null);}finally{await h.close();}});
test('manual exploration and close-to-explore remove governed selection without inventing history',async()=>{
 const h=await dashboard();try{await h.select();await act(async()=>h.seen.MapLibreIntelligenceMap.setSelectedSpot({id:'place',coordinates:[24,-89]}));
 assert.equal(h.seen.MapLibreIntelligenceMap.selectedOpportunity,null);assert.equal(h.seen.SelectedTarget.selectedSpot.id,'place');
 await act(async()=>h.seen.SelectedTarget.onClose());assert.equal(h.seen.MapLibreIntelligenceMap.selectedSpot,null);
 }finally{await h.close();}
});
for(const mobile of [false,true])test('map selection uses refreshed coordinates on '+(mobile?'mobile':'desktop')+' without recentering on prose-only refresh',async()=>{
 const calls=[];const mapRef={current:{flyTo:x=>calls.push(x)}};
 const hook=compile('../useMapLibreOpportunitySelection.js','useMapLibreOpportunitySelection',{window:{matchMedia:()=>({matches:mobile})}});
 const C=p=>{hook(p);return null;};const h=await mount(C,{mapRef,selectedOpportunity:{id:'X',coordinates:[25,-90]}});
 try{await h.render({mapRef,selectedOpportunity:{id:'X',coordinates:[25,-90],score:90}});assert.equal(calls.length,1);
 await h.render({mapRef,selectedOpportunity:{id:'X',coordinates:[26,-91]}});assert.equal(calls.length,2);assert.deepEqual(Array.from(calls[1].center),[-91,26]);assert.deepEqual(Array.from(calls[1].offset),mobile?[0,-85]:[0,0]);
 }finally{await h.close();}
});
test('Opportunity hook masks old context synchronously and rejects late responses even when transport ignores abort',async()=>{
 const requests=[],renders=[];let view;
 const hook=compile('../useDynamicOpportunities.js','useDynamicOpportunities',{fetch:()=>{const d=deferred();requests.push(d);return d.promise;},resolvePeloraApiUrl:x=>x,persistenceRequestHeaders:()=>({})});
 const C=p=>{view=hook(p.species,p.token,p.context);renders.push(view);return null;};
 const a={species:'blue-marlin',token:'A',context:null};const h=await mount(C,a);
 const result=(d,value)=>act(async()=>d.resolve({ok:true,json:async()=>value}));
 try{await result(requests[0],cycle());assert.equal(view.data.opportunities[0].score,60);
 const start=renders.length;await h.render({...a,token:'B'});assert(renders.slice(start).every(v=>v.data===null));
 const stale=requests[1];await h.render({...a,token:'C'});await result(requests[2],cycle(2,80));await result(stale,cycle(1,99));assert.equal(view.data.opportunities[0].score,80);
 await h.render({...a,token:'D'});await act(async()=>requests[3].reject(Error('failure')));assert.equal(view.data,null);assert(view.error);
 }finally{await h.close();}
});
async function reports(){
 const requests=[];const client={from:table=>{assert.equal(table,'fishing_day_reports');const q={orders:[],select(){return this;},eq(k,id){assert.equal(k,'user_id');this.id=id;return this;},order(k,v){this.orders.push([k,v]);if(this.orders.length<2)return this;const d=deferred();requests.push({...d,id:this.id,orders:this.orders});return d.promise;}};return q;}};
 const C=compile('../../components/SavedFishingDayReports.jsx','SavedFishingDayReports',{supabase:client});
 const h=await mount(C,{user:principal('A').user,authLoading:false});return {...h,requests,settle:async(index,id='A',boat='A PRIVATE')=>act(async()=>requests[index].resolve({data:[{id:'report-'+id,user_id:id,boat_private:boat,trip_date:'2026-09-29',created_at:'2026-09-29',species_results:{}}],error:null}))};
}
test('Saved Reports filters owner and preserves trip-date/created-at ordering',async()=>{
 const h=await reports();try{assert.equal(h.requests[0].id,'A');assert.deepEqual(h.requests[0].orders.map(x=>[x[0],x[1].ascending]),[['trip_date',false],['created_at',false]]);
 await h.settle(0,'B','B PRIVATE');assert.doesNotMatch(h.container.textContent,/B PRIVATE/);assert.match(h.container.textContent,/No reports/);
 }finally{await h.close();}
});
for(const transition of ['other-user','logout','auth-loading','anonymous'])test('Saved Reports immediately hides prior private rows on '+transition,async()=>{
 const h=await reports();try{await h.settle(0);assert.match(h.container.textContent,/A PRIVATE/);
 const props=transition==='other-user'?{user:principal('B').user}:transition==='logout'?{user:null}:transition==='anonymous'?{user:{id:'A',is_anonymous:true}}:{user:principal('A').user,authLoading:true};
 await h.render(props);assert.doesNotMatch(h.container.textContent,/A PRIVATE/);
 if(transition==='other-user'){await act(async()=>h.requests[1].reject(Error('B failure')));assert.doesNotMatch(h.container.textContent,/A PRIVATE/);assert.match(h.container.textContent,/could not be loaded/);}
 }finally{await h.close();}
});
test('Saved Reports ignores pending former-owner success/error and same-owner older refresh',async()=>{
 const h=await reports();try{await h.render({user:principal('B').user});await h.settle(1,'B','B PRIVATE');await h.settle(0,'A','A PRIVATE');assert.match(h.container.textContent,/B PRIVATE/);assert.doesNotMatch(h.container.textContent,/A PRIVATE/);
 await h.render({user:principal('B').user,refreshToken:1});await h.render({user:principal('B').user,refreshToken:2});await h.settle(3,'B','B NEW');await act(async()=>h.requests[2].reject(Error('obsolete error')));assert.match(h.container.textContent,/B NEW/);assert.doesNotMatch(h.container.textContent,/obsolete/);
 }finally{await h.close();}
});
for(const event of ['SIGNED_OUT','SIGNED_IN'])test('Auth initializer cannot override newer '+event,async()=>{
 const initial=deferred();let callback,view,anonymousCalls=0;
 const hook=compile('../useSupabaseAuth.js','useSupabaseAuth',{supabase:{auth:{getSession:()=>initial.promise,signInAnonymously:()=>{anonymousCalls++;throw Error('unexpected');},onAuthStateChange:fn=>{callback=fn;return {data:{subscription:{unsubscribe(){}}}};}}}});
 const C=()=>{view=hook();return null;};const h=await mount(C);
 try{await act(async()=>callback(event,event==='SIGNED_OUT'?null:principal('B')));await act(async()=>initial.resolve({data:{session:principal('A')}}));assert.equal(view.user?.id??null,event==='SIGNED_OUT'?null:'B');assert.equal(view.loading,false);assert.equal(anonymousCalls,0);}finally{await h.close();}
});
test('Auth first request rejection fails closed without protected session',async()=>{
 const hook=compile('../useSupabaseAuth.js','useSupabaseAuth',{supabase:{auth:{getSession:async()=>{throw Error('synthetic');},onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})}}});let view;
 const h=await mount(()=>{view=hook();return null;});try{assert.equal(view.user,null);assert.equal(view.loading,false);assert.match(view.error,/could not verify/);}finally{await h.close();}
});
test('late anonymous initialization cannot replace a newly authenticated principal',async()=>{
 const anonymous=deferred();let callback,view;
 const hook=compile('../useSupabaseAuth.js','useSupabaseAuth',{supabase:{auth:{getSession:async()=>({data:{session:null}}),signInAnonymously:()=>anonymous.promise,onAuthStateChange:fn=>{callback=fn;return {data:{subscription:{unsubscribe(){}}}};}}}});
 const h=await mount(()=>{view=hook();return null;});try{await act(async()=>callback('SIGNED_IN',principal('B')));await act(async()=>anonymous.resolve({data:{session:{user:{id:'anonymous',is_anonymous:true}}}}));assert.equal(view.user.id,'B');}finally{await h.close();}
});
for(const [label,status,role,allowed] of [['founder','approved','founder',true],['founding captain','approved','founding_captain',true],['pending','pending','founding_captain',false],['revoked','revoked','founder',false],['invalid','unexpected','founder',false],['unknown role','approved','unrecognized',false],['missing role','approved',undefined,false]])test('actual direct app gate: '+label,async()=>{
 const lookup=deferred(),timers=[];let lookups=0;
 const client={from:()=>({select(){return this;},eq(k,v){assert.equal(k,'user_id');assert.equal(v,'A');return this;},maybeSingle(){lookups++;return lookup.promise;}})};
 const auth={session:principal('A'),user:principal('A').user,loading:false};
 const Gate=compile('../../components/FoundingCaptainAccessGate.jsx','FoundingCaptainAccessGate',{useCaptainAccess,supabase:client,useSupabaseAuth:()=>auth,
 PeloraStartupFlow:()=>React.createElement('div',null,'PROTECTED WORKSPACE'),peloraWordmark:'image',window:{setTimeout:fn=>timers.push(fn),clearTimeout(){}}});
 const App=compile('../../App.jsx','App',{FoundingCaptainAccessGate:Gate,PublicLandingPage:()=>React.createElement('div',null,'public'),window:{location:{search:'?app=1'}}});
 const h=await mount(App);try{assert.doesNotMatch(h.container.textContent,/PROTECTED|Unavailable/);await act(async()=>timers.forEach(fn=>fn()));assert.doesNotMatch(h.container.textContent,/PROTECTED/);
 await act(async()=>lookup.resolve({data:{user_id:'A',access_status:status,access_role:role}}));assert.equal(h.container.textContent.includes('PROTECTED WORKSPACE'),allowed);assert.equal(lookups,1);
 }finally{await h.close();}
});
for(const edge of [null,{available:false},{available:true,currentEdgeDetected:true,edgeStrength:'pronounced'}])test('SelectedTarget suppresses paused edge claims but preserves raw current '+JSON.stringify(edge),async()=>{
 const C=compile('../../components/SelectedTarget.jsx','SelectedTarget');
 const h=await mount(C,{selectedSpot:{id:'X',name:'Location'},oceanData:{currents:{speedKnots:1.25,directionDegrees:90,derived:{spatialAnalysis:{edge}}}}});
 try{assert.match(h.container.textContent,/1.25/);assert.doesNotMatch(h.container.textContent,/Current Edge|Edge Signal|current edge identified/);}finally{await h.close();}
});
test('same-ID rank-label refresh preserves expanded mobile sheet; a different selection resets it',async()=>{
 let expand;
 const C=compile('../../components/SelectedTarget.jsx','SelectedTarget',{React:{...React,createElement(type,props,...children){if(props?.className==='selected-target-map-expand')expand=props;return React.createElement(type,props,...children);}}});
 const h=await mount(C,{mapPanel:true,selectedSpot:{id:'X',name:'Open Water Opportunity 1'}});
 try{await act(async()=>expand.onClick());assert.equal(expand['aria-expanded'],true);
 await h.render({mapPanel:true,selectedSpot:{id:'X',name:'Open Water Opportunity 3'}});assert.equal(expand['aria-expanded'],true);assert.match(h.container.textContent,/Opportunity 3/);
 await h.render({mapPanel:true,selectedSpot:{id:'Y',name:'Open Water Opportunity 1'}});assert.equal(expand['aria-expanded'],false);
 }finally{await h.close();}
});
for(const signal of ['current-supported-transition','temperature-transition',null])test('Today brief does not promote co-located observations into shaping/developing/moving features: '+signal,()=>{
 const build=compile('../../components/TodayDashboard.jsx','buildOceanBriefSummary',{EVALUATION_MESSAGES});
 const prose=build({opportunity:{name:'Test'},opportunityState:'available',dynamicOpportunity:{primarySignal:{type:signal},pathway:'open-water'},liveMarineData:{oceanEvidence:{groups:{temperature:{available:true},current:{available:true}}}},confidence:65});
 assert.doesNotMatch(prose,/helping shape|helping define|beginning|developing|being created|convergence|shear|upwelling|downwelling/i);assert.match(prose,/evidence|observation/);
});

// These are the existing organization-history lifecycle states, not a new
// qualified persistence fixture. Documentary builders and their data survive.
for(const [state,indices] of [['developing',[1,4]],['stable',[4,4]],['strengthening',[3,5]],['weakening',[5,3]],['fading',[4,0]]])
test('actual documentary builders cannot render captain persistence: '+state,async()=>{
 const previousMode=process.env.PELORA_TEST_OCEAN_CONDITIONS;
 process.env.PELORA_TEST_OCEAN_CONDITIONS='1';
 let builders;
 try{builders=await import('../../../../backend/server.js');}
 finally{if(previousMode===undefined)delete process.env.PELORA_TEST_OCEAN_CONDITIONS;else process.env.PELORA_TEST_OCEAN_CONDITIONS=previousMode;}
 const histories=indices.map((organizationIndex,i)=>({snapshot:{available:true,identity:{snapshotId:'documentary-'+i},
  metadata:{time:{observedAt:['2026-09-28T00:00:00Z','2026-09-28T04:00:00Z'][i]}},
  observation:{oceanOrganization:{available:true,organizationIndex,organizationLevel:'diagnostic',organizationState:'diagnostic',organizationSignalCount:1}}}}));
 const persistence=builders.buildOceanPersistence({historicalSnapshots:histories});
 const oceanOpportunity=builders.assessOceanOpportunity({oceanEvidence:{groups:{}},oceanPersistence:persistence});
 assert.equal(persistence.values.lifecycleState,state);
 assert.equal(oceanOpportunity.persistenceContext.available,true);
 assert(oceanOpportunity.persistenceContext.limitations.includes('persistence-context-is-documentary-only'));
 const before=JSON.stringify(oceanOpportunity);
 const C=compile('../../components/SelectedTarget.jsx','SelectedTarget');
 const h=await mount(C,{mapPanel:true,selectedSpot:{id:'X',name:'Location'},oceanData:{oceanOpportunity,
  oceanSignals:{available:true,primarySignal:{signalType:'temperature-transition'}},currents:{speedKnots:1.25,directionDegrees:90}}});
 try{assert.doesNotMatch(h.container.textContent,/persist|develop|strengthen|weaken|stable|fading/i);
  assert.match(h.container.textContent,/1\.25 kt toward 090°/);assert.doesNotMatch(h.container.textContent,/Current Edge|No Edge/);
  assert.equal(JSON.stringify(oceanOpportunity),before);
 }finally{await h.close();}
});
for(const context of [undefined,null,'malformed',[],{},
 {available:true,lifecycleState:'developing',limitations:['diagnostic-only']},
 {available:true,lifecycleState:'stable'},
 {available:false,lifecycleState:'weakening'}])
test('SelectedTarget neutrally omits missing/malformed/unqualified persistence '+JSON.stringify(context),async()=>{
 const C=compile('../../components/SelectedTarget.jsx','SelectedTarget');
 const h=await mount(C,{selectedSpot:{id:'X'},oceanData:{oceanOpportunity:{persistenceContext:context},
  oceanSignals:{available:true,primarySignal:{signalType:'temperature-transition'}},currents:{speedKnots:1.25,directionDegrees:90}}});
 try{assert.doesNotMatch(h.container.textContent,/persist|develop|strengthen|weaken|stable/i);assert.match(h.container.textContent,/1\.25 kt toward 090°/);}
 finally{await h.close();}
});
