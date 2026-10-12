// Focused unchanged selection/race assertions with persistence dependencies
// injected into the original suite's import-stripping VM harness.
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {registerHooks} from 'node:module';
const runtime=pathToFileURL(process.argv[2].replaceAll('\\','/')+'/');
const ports={'react':'react/index.js','react-dom/client':'react-dom/client.js','rolldown/utils':'rolldown/dist/utils-index.mjs'};
registerHooks({resolve(specifier,context,next){if(ports[specifier])return {shortCircuit:true,url:new URL(ports[specifier],runtime).href};return next(specifier,context);}});
const original=new URL('./betaSafetyCaptainState.test.js',import.meta.url);
let source=readFileSync(original,'utf8')
 .replace("import {test} from 'node:test';", "import {test as baseTest} from 'node:test'; const test=(name,fn)=>{if(/Dashboard|request race|rapid A\\/B\\/C|rapid same-ID|removed identity|manual exploration|map selection|Opportunity hook|loading-only credential|failure followed/.test(name))baseTest(name,fn);};")
 .replace('act,useCallback,useEffect,useMemo,useRef,useState','act,useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState')
 .replace('{React,useCallback,useEffect,useMemo,useRef,useState,', '{React,useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,')
 .replace('doc.defaultView = win;', "doc.defaultView = win; const storage=new Map();win.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};")
 .replace('const scope={interpretOpportunityEvaluation,structures:[],', "const scope={useCaptainContinuity:compile('../useCaptainContinuity.js','useCaptainContinuity',{...continuity,window:new Proxy({}, {get:(_,key)=>globalThis.window?.[key]})}),validateWorkspace:continuity.validateWorkspace,IntelligenceRecovery:compile('../../components/IntelligenceRecovery.jsx','IntelligenceRecovery',{Component:React.Component}),interpretOpportunityEvaluation,structures:[{id:'place',coordinates:[24,-89]}],")
 .replace('const seen={}; const child=name=>props=>{seen[name]=props;', "const seen={}; let currentTestOwner; const child=name=>props=>{useEffect(()=>{const owner=currentTestOwner;return()=>{if(name==='MapLibreIntelligenceMap' && owner!==currentTestOwner)seen[name]={selectedOpportunity:null};};},[]);seen[name]=props;")
 .replace("const C=compile('../../components/Dashboard.jsx','Dashboard',scope);", "const Actual=compile('../../components/Dashboard.jsx','Dashboard',scope);const C=props=>{currentTestOwner=props.user?.id;return React.createElement(Actual,props);};")
 .replace('import {readFileSync}', "import * as continuity from '../../utils/captainContinuity.js';\nimport {readFileSync}")
 .replaceAll('import.meta.url',JSON.stringify(original.href))
 .replace(/from (['"])([^'"]+)\1/g,(_,quote,path)=>'from '+JSON.stringify(path.startsWith('.')?new URL(path,original).href:path));
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
