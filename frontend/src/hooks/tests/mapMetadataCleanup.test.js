import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import {pathToFileURL} from 'node:url';
import {FIELD_CONTROLS,fieldStatusText} from '../../utils/oceanFieldPresentation.js';
import {OBSERVATION_CONTROLS} from '../../utils/mapObservationDisplay.js';
const source=readFileSync(new URL('../../components/LayerControls.jsx',import.meta.url),'utf8');
const helper=vm.runInNewContext(source.slice(source.indexOf('function captainFieldStatus'),source.indexOf('function LayerControls'))+'\ncaptainFieldStatus');
const now=Date.parse('2026-10-11T17:00:00Z');
const field={displayName:'Geostrophic Surface Currents',provider:'NOAA NESDIS CoastWatch',datasetId:'synthetic-dataset',productVersion:'synthetic-version',validTime:'2026-10-09T00:00:00Z',status:'latest-available',freshness:{maxFreshAgeHours:24},coverage:{validCells:199,returnedCells:238},resolution:{deliveredDegrees:0.5},payload:{values:[1,null]}};
const cases=[
 ['initial',undefined,'Loading…'],['loading',{status:'loading'},'Loading…'],
 ['static',{status:'static',field:{...field,status:'static',validTime:null,freshness:{maxFreshAgeHours:null}}},'Available'],
 ['stale',{status:'latest-available',field},'Stale · latest available · 65h old'],
 ['refresh',{status:'loading',field},'Loading… · Stale · latest available · 65h old'],
 ['degraded',{status:'degraded',field,reason:'Synthetic transport failure'},'Degraded · Stale · latest available · 65h old'],
 ['unavailable',{status:'unavailable',reason:'Synthetic failure'},'Unavailable'],
 ['error',{status:'error'},'Error · unavailable'],['degraded-empty',{status:'degraded'},'Degraded · unavailable'],
 ['off',{status:'off'},'Off'],
 ['fresh-latest',{status:'latest-available',field:{...field,validTime:'2026-10-11T16:00:00Z'}},'Latest available · 1h old'],
 ['declared-stale',{status:'stale',field:{...field,status:'stale',freshness:{maxFreshAgeHours:null}}},'Stale · latest available · 65h old'],
 ['threshold',{status:'latest-available',field:{...field,freshness:{maxFreshAgeHours:65}}},'Latest available · 65h old']
];
for(const [name,state,expected] of cases)test(name,()=>{const before=JSON.stringify(state);assert.equal(helper(state,now),expected);assert.equal(JSON.stringify(state),before);});
test('original technical formatter preserves full telemetry',()=>{
 const output=fieldStatusText('currents',{status:'latest-available',field},now);
 for(const text of ['NOAA NESDIS CoastWatch','2026-10-09 00:00 UTC','65h old','199/238 valid cells','0.500° grid','stale'])assert(output.includes(text));
});
test('Dashboard removes canvas telemetry and supplies clock to layer details',()=>{
 const dash=readFileSync(new URL('../../components/Dashboard.jsx',import.meta.url),'utf8');
 assert(!dash.includes('ocean-field-status'));assert(!dash.includes('fieldStatusText'));assert(dash.includes('observationTime={observationDisplayTime}'));
});
// Explicit runtime argument allows use of the already installed read-only test
// toolchain without copying or installing dependencies in this worktree.
const runtime=pathToFileURL(process.argv[2].replaceAll('\\','/')+'/');
const React=(await import(new URL('react/index.js',runtime))).default;
const {renderToStaticMarkup}=await import(new URL('react-dom/server.node.js',runtime));
const {transformSync}=await import(new URL('rolldown/dist/utils-index.mjs',runtime));
const compiled=transformSync('LayerControls.jsx',source.replace(/^import[\s\S]*?;\s*/gm,'').replace('export default LayerControls;',''),{jsx:{runtime:'classic'}}).code;
const Controls=vm.runInNewContext(compiled+'\nLayerControls',{React,useState:()=>[true,()=>{}],FIELD_CONTROLS,OBSERVATION_CONTROLS,fieldStatusText});
test('actual open controls exclude field evidence details without mutating internal state',()=>{
 const states={currents:{status:'degraded',field,reason:'Synthetic transport failure'},bathymetry:{status:'static',field:{...field,displayName:'Bathymetry',provider:'NOAA/NCEI',status:'static',validTime:null,productVersion:'2022-v1-60s',freshness:{maxFreshAgeHours:null}}}};
 const before=JSON.stringify(states);
 const html=renderToStaticMarkup(React.createElement(Controls,{layers:{locations:true,bathymetry:true,currentField:true},setLayers(){},fieldStatus:states,observationTime:now}));
 assert(!html.includes('<details'));assert(!html.includes('<pre'));assert(!html.includes('Source &amp; Evidence Details'));
 const primary=html.replace(/<details>[\s\S]*?<\/details>/g,'');
 for(const raw of ['NOAA','2022-v1-60s','2026-10-09','199/238','0.500','synthetic-dataset','Synthetic transport failure'])assert(!primary.includes(raw),raw);
 assert(primary.includes('Bathymetry'));assert(primary.includes('Available'));assert(primary.includes('Degraded · Stale · latest available · 65h old'));
 for(const raw of ['Source &amp; Evidence Details','ETOPO','NOAA','2022-v1-60s','2026-10-09','199/238','0.500','synthetic-dataset','Synthetic transport failure'])assert(!html.includes(raw),raw);
 assert.equal(JSON.stringify(states),before);
});
test('actual controls never label initial loading unavailable',()=>{
 const html=renderToStaticMarkup(React.createElement(Controls,{layers:{locations:true,bathymetry:true,currentField:true},setLayers(){},fieldStatus:{},observationTime:now}));
 const primary=html.replace(/<details>[\s\S]*?<\/details>/g,'');assert(primary.includes('Loading…'));assert(!primary.includes('Unavailable'));
});
for(const name of ['Dashboard','LayerControls'])test('JSX parse '+name,()=>{transformSync(name+'.jsx',readFileSync(new URL('../../components/'+name+'.jsx',import.meta.url),'utf8'),{jsx:{runtime:'automatic'}});});

test('actual open captain legend excludes bathymetry source/grid caption',()=>{
 const source=readFileSync(new URL('../../components/MapLegend.jsx',import.meta.url),'utf8');
 const code=transformSync('MapLegend.jsx',source.replace(/^import[\s\S]*?;\s*/gm,'').replace('export default MapLegend;',''),{jsx:{runtime:'classic'}}).code;
 const Legend=vm.runInNewContext(code+'\nMapLegend',{React,useState:()=>[true,()=>{}]});
 const html=renderToStaticMarkup(React.createElement(Legend,{layers:{bathymetry:true,currentField:true,locations:true},observationDisplay:{counts:{}}}));
 assert(html.includes('Depth shading'));assert(html.includes('Geostrophic surface flow'));
 for(const raw of ['ETOPO','NOAA','decimated grid','Source &amp; Evidence Details','valid cells'])assert(!html.includes(raw),raw);
});
