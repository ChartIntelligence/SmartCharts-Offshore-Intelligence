import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import {createHash} from 'node:crypto';
import {renderToString} from 'react-dom/server';
import React, {act,useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {transformSync} from 'rolldown/utils';
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
    .replace(/export function /g,'function ').replace(/import\.meta\.env/g,'({DEV:false})');
  return vm.runInNewContext(transformSync(path,source,{jsx:{runtime:'classic'}}).code+'\n'+expression,
    {React,useCallback,useEffect,useMemo,useRef,useState,console:{error(){}},JSON,Date,Number,Array,Map,Set,AbortController,URLSearchParams,...scope});
}
async function mount(Component,props={}) {
  const {doc,win}=host(); Object.assign(win,{setInterval:()=>1,clearInterval(){},confirm:()=>true,alert(){}});
  Object.assign(globalThis,{window:win,document:doc,IS_REACT_ACT_ENVIRONMENT:true});
  const errors=[]; const container=doc.createElement('div'),root=createRoot(container,{onUncaughtError:error=>errors.push(error),onCaughtError:error=>errors.push(error)});
  const render=async next=>{props=next??props;await act(async()=>root.render(React.createElement(Component,props)));};
  await render(); return {container,win,render,errors,close:async()=>{await act(async()=>root.unmount());delete globalThis.window;delete globalThis.document;delete globalThis.IS_REACT_ACT_ENVIRONMENT;}};
}
const baselineSHA='94cc8b41fbf1e440dc2a27618617704a93025782';
const fixture={id:'synthetic-X',name:'Synthetic opportunity',captainNarrative:{available:true,state:'available',sections:{thermalStructure:{state:'available',observed:{nested:'SYNTHETIC MALFORMED OBJECT'},interpreted:null,supported:null,limited:'Synthetic limitation.'}}}};
console.log('Fixture SHA256: '+createHash('sha256').update(JSON.stringify(fixture)).digest('hex'));
const textOf=value=>Array.isArray(value)?value.map(textOf).join(''):typeof value==='string'?value:'';
const buttons=new Map(); const seen={};
const instrumentedReact={...React,createElement(type,props,...children){
 if(type==='button' && props?.onClick) buttons.set(textOf(children).trim(),props.onClick);
 return React.createElement(type,props,...children);
}};
const scope={React:instrumentedReact,Component:React.Component,EVALUATION_MESSAGES};
const Intelligence=compile('../../components/OpportunityIntelligence.jsx','OpportunityIntelligence',scope);
const Recovery=compile('../../components/IntelligenceRecovery.jsx','IntelligenceRecovery',scope);
const Today=compile('../../components/TodayDashboard.jsx','TodayDashboard',{...scope,HistoricalOpportunityContinuity:()=>null});
const Target=compile('../../components/SelectedTarget.jsx','SelectedTarget',scope);
const validNarrative=()=>({available:true,state:'available',sections:{thermalStructure:{state:'available',observed:'Synthetic observation.',interpreted:'Synthetic interpretation.',supported:'Synthetic support.',limited:'Synthetic limitation.'}}});
const evaluation=(narrative=fixture.captainNarrative,state='available')=>({
 evaluationState:{contractVersion:'pelora-governed-opportunity-evaluation-state-v1',state},
 opportunities:['available','partial'].includes(state)?[{location:{id:'synthetic-X',coordinates:[25,-90]},rank:1,score:60,confidence:{label:'Low'},primarySignal:{type:'synthetic'},observedAt:null}]:[],
 delivery:{captainNarratives:[{opportunityId:'synthetic-X',narrative}]}
});
async function click(label){assert(buttons.has(label),'Missing button '+label);await act(async()=>buttons.get(label)());}
async function dashboard(data=evaluation()){
 buttons.clear();
 const stub=name=>props=>{seen[name]=props;return React.createElement('div',null,name==='MapLibreIntelligenceMap'?'SYNTHETIC MAP HOST':null);};
 const C=compile('../../components/Dashboard.jsx','Dashboard',{
  ...scope,interpretOpportunityEvaluation,structures:[],peloraHeaderLockup:'synthetic-image',IntelligenceRecovery:Recovery,OpportunityIntelligence:Intelligence,
  TodayDashboard:props=>{seen.TodayDashboard=props;return React.createElement(Today,props);},SelectedTarget:props=>{seen.SelectedTarget=props;return React.createElement(Target,props);},
  buildMapEnvironmentalObservations:()=>[],buildMapObservationDisplay:()=>({}),fieldStatusText:()=>'',sampleLayersForMode:x=>x,
  useLiveMarineConditions:()=>({data:null,loading:false,error:null}),useOceanMemoryPersistence(){},useDynamicOpportunities:(species,token,context)=>{seen.request={species,token,context};return {data,loading:false,error:null};},
  window:{setInterval:()=>1,clearInterval(){}},
  ...Object.fromEntries(['LayerControls','MapLibreIntelligenceMap','MapLegend','TopOpportunity','OpportunityRanking','HistoricalOpportunityContinuity','LocationSearch','FishingDayReportPanel','SavedFishingDayReports'].map(name=>[name,stub(name)]))
 });
 const mission={selectedSpecies:'blue-marlin'};const range={explorationMode:'within-range',origin:{coordinates:[25,-90]},operatingRangeNm:50};
 const props={session:{user:{id:'synthetic-captain'},access_token:'synthetic-token'},user:{id:'synthetic-captain'},tripMission:mission,captainSpatialContext:range};
 const h=await mount(C,props);
 return {...h,props,async refresh(next){data=next;await h.render(props);},async select(){await act(async()=>seen.TodayDashboard.setSelectedOpportunity(seen.TodayDashboard.topOpportunities[0]));}};
}
if(process.argv.includes('--baseline')){
 const source=readFileSync(0,'utf8');
 const Baseline=compile('../../components/OpportunityIntelligence.jsx','OpportunityIntelligence',scope,source);
 assert.throws(()=>renderToString(React.createElement(Baseline,{opportunity:fixture,opportunityState:'available'})),/Objects are not valid as a React child/);
 console.log('BASELINE REPRODUCED: actual unchanged Intelligence children reject nested object as React child; source '+baselineSHA);
}else{
 for(const entry of ['View All','Open Full Analysis','Intelligence'])test('actual Dashboard/Today/Intelligence recovery through '+entry,async()=>{
  const h=await dashboard();try{
   await h.select();const selected=seen.TodayDashboard.activeOpportunity;await click('Map');await act(async()=>seen.LayerControls.setLayers(previous=>({...previous,syntheticRetentionMarker:true})));await click('Home');
   await click(entry);assert.match(h.container.textContent,/could not be displayed/);assert.doesNotMatch(h.container.textContent,/SYNTHETIC MALFORMED OBJECT/);
   await click('Retry Intelligence');assert.match(h.container.textContent,/could not be displayed/);
   await click('Map');assert.match(h.container.textContent,/SYNTHETIC MAP HOST/);assert.equal(seen.MapLibreIntelligenceMap.selectedOpportunity.id,selected.id);assert.equal(seen.MapLibreIntelligenceMap.selectedOpportunity.dynamicOpportunity.score,60);assert.equal(seen.MapLibreIntelligenceMap.layers.syntheticRetentionMarker,true);
   await click('Home');assert.match(h.container.textContent,/Open Full Analysis/);assert.equal(seen.TodayDashboard.activeOpportunity.id,selected.id);
   assert.equal(seen.request.species,'blue-marlin');assert.equal(seen.request.context,h.props.captainSpatialContext);assert.equal(seen.request.context.operatingRangeNm,50);assert.deepEqual(seen.request.context.origin.coordinates,[25,-90]);assert.equal(h.errors.filter(error=>!error.message.includes('Invalid Intelligence')).length,0);
   await h.refresh(evaluation(validNarrative()));await click(entry);assert.match(h.container.textContent,/Synthetic observation\./);assert.doesNotMatch(h.container.textContent,/could not be displayed/);
  }finally{await h.close();}
 });
 test('failed mounted analysis accepts new same-ID narrative without resetting selection',async()=>{
  const h=await dashboard();try{await h.select();await click('Intelligence');await h.refresh(evaluation(validNarrative()));assert.match(h.container.textContent,/Synthetic observation\./);await click('Map');assert.equal(seen.MapLibreIntelligenceMap.selectedOpportunity.id,'synthetic-X');}finally{await h.close();}
 });
 for(const field of ['observed','interpreted','supported','limited'])for(const value of [{nested:{}},['invented prose'],[{}],0,false,true])test('reject '+field+' '+JSON.stringify(value),async()=>{
  const narrative=validNarrative();narrative.sections.thermalStructure[field]=value;const before=JSON.stringify(narrative);
  const h=await dashboard(evaluation(narrative));try{await click('Intelligence');assert.match(h.container.textContent,/could not be displayed/);assert.equal(JSON.stringify(narrative),before);}finally{await h.close();}
 });
 for(const value of [null,undefined,'','exact supplied text'])test('permitted statement '+String(value),()=>{
  const narrative=validNarrative();narrative.sections.thermalStructure.observed=value;
  const result=renderToString(React.createElement(Intelligence,{opportunity:{...fixture,captainNarrative:narrative},opportunityState:'available'}));
  if(value)assert.match(result,/exact supplied text/);assert.doesNotMatch(result,/could not be displayed/);
 });
 for(const sections of [[],3,'invalid',{thermalStructure:[]},{thermalStructure:'invalid'}])test('reject malformed section container '+JSON.stringify(sections),async()=>{
  const h=await dashboard(evaluation({...validNarrative(),sections}));try{await click('Intelligence');assert.match(h.container.textContent,/could not be displayed/);}finally{await h.close();}
 });
 for(const narrative of [null,{available:false,state:'unavailable',sections:null},{available:true,sections:null},{available:true,sections:{}}])test('absent narrative/sections '+JSON.stringify(narrative),async()=>{
  const h=await dashboard(evaluation(narrative));try{await click('Intelligence');assert.doesNotMatch(h.container.textContent,/could not be displayed/);assert.match(h.container.textContent,/not currently available/);}finally{await h.close();}
 });
 for(const state of ['available','partial','governed-zero','unavailable'])test('preserve evaluation distinction '+state,async()=>{
  const h=await dashboard(evaluation(validNarrative(),state));try{await click('Intelligence');assert.match(h.container.textContent,new RegExp(EVALUATION_MESSAGES[state].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.doesNotMatch(h.container.textContent,/could not be displayed/);if(['available','partial'].includes(state))assert.match(h.container.textContent,/Synthetic observation/);else assert.doesNotMatch(h.container.textContent,/Synthetic observation/);}finally{await h.close();}
 });
 test('evaluation state change clears recovery and retains governed-zero distinction',async()=>{
  const h=await dashboard();try{await click('Intelligence');assert.match(h.container.textContent,/could not be displayed/);await h.refresh(evaluation(null,'governed-zero'));assert.match(h.container.textContent,/No governed Top Opportunity/);assert.doesNotMatch(h.container.textContent,/could not be displayed/);}finally{await h.close();}
 });
 test('explicit retry rereads corrected same-reference narrative and keeps selected identity',async()=>{
  const narrative=structuredClone(fixture.captainNarrative);const h=await dashboard(evaluation(narrative));
  try{await h.select();await click('Intelligence');assert.match(h.container.textContent,/could not be displayed/);narrative.sections.thermalStructure.observed='Corrected synthetic statement.';await click('Retry Intelligence');assert.match(h.container.textContent,/Corrected synthetic statement\./);await click('Map');assert.equal(seen.MapLibreIntelligenceMap.selectedOpportunity.id,'synthetic-X');}finally{await h.close();}
 });
 for(const key of ['thermalStructure','oceanMovement','waterColorAndWaterCharacter','productivityAndPreyContext','structureInteraction','persistence','speciesHabitatFit','evidenceAndConfidence'])test('validate actual section child '+key,()=>{
  const narrative={available:true,sections:{[key]:{state:'unavailable',observed:null,interpreted:'Exact synthetic string.',supported:null,limited:null}}};
  assert.match(renderToString(React.createElement(Intelligence,{opportunity:{...fixture,captainNarrative:narrative},opportunityState:'partial'})),/Exact synthetic string\./);
  narrative.sections[key].limited={nested:['invalid']};
  assert.throws(()=>renderToString(React.createElement(Intelligence,{opportunity:{...fixture,captainNarrative:narrative},opportunityState:'partial'})),/Invalid Intelligence statement display type/);
 });}
