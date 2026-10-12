// Two fresh Node processes with synthetic device-storage bytes on disk.
// This is process-loss simulation; it is not a real-browser kill qualification.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {registerHooks} from 'node:module';
import vm from 'node:vm';
import {continuityKey,writeContinuity,readContinuity,validateWorkspace,validateFishingDraft,CONTINUITY_VERSION} from '../../utils/captainContinuity.js';
const [phase,path,runtimePath]=process.argv.slice(2);
const runtime=pathToFileURL(runtimePath.replaceAll('\\','/')+'/');
registerHooks({resolve(specifier,context,next){if(specifier==='@js-temporal/polyfill')return {shortCircuit:true,url:new URL('@js-temporal/polyfill/dist/index.esm.js',runtime).href};return next(specifier,context);}});
const {createTemporalDraft}=await import('../../utils/fishingLogTemporalCapture.js');
const reportSource=readFileSync(new URL('../../components/FishingDayReportPanel.jsx',import.meta.url),'utf8');
const initial=vm.runInNewContext(reportSource.slice(reportSource.indexOf('const INITIAL_SPECIES_RESULTS'),reportSource.indexOf('function FishingDayReportPanel'))+'\ncreateInitialReport()',{
 structuredClone,createTemporalDraft:()=>createTemporalDraft(new Date('2026-10-12T12:00:00Z'),'UTC')
});
const draft={report:{...initial,captain:'SYNTHETIC PARTIAL DRAFT',notes:'No credentials or real user data'},fishingLocationDraft:{latitude:'25.',longitude:'',label:'partial',certainty:'approximate'},areaSearch:'partial search'};

const entries=phase==='save'?new Map():new Map(JSON.parse(readFileSync(path,'utf8')));
const storage={getItem:key=>entries.get(key) ?? null,setItem:(key,value)=>{entries.set(key,value);writeFileSync(path,JSON.stringify([...entries]));}};
const workspace={activeTab:'map',layers:{marlin:true,yellowfin:true,blackfin:true,locations:true,bathymetry:true,currentField:true,temperatureSamples:false,chlorophyll:false,currents:false,temperatureTransition:false,baitProbability:false},mapCamera:{center:[-91,26],zoom:8,bearing:42},selectedSpotId:'synthetic-place',opportunitySelection:null,sheetExpanded:true,reportPanelOpen:true};
if(phase==='save'){
 assert.equal(writeContinuity(storage,'synthetic-A','workspace',workspace).error,null);
 assert.equal(writeContinuity(storage,'synthetic-A','fishing-draft',draft).error,null);
 console.log('PROCESS SAVE PASS '+CONTINUITY_VERSION);
}else{
 assert.equal(phase,'load');assert.deepEqual(readContinuity(storage,'synthetic-A','workspace',validateWorkspace).value,workspace);
 assert.deepEqual(readContinuity(storage,'synthetic-A','fishing-draft',value=>validateFishingDraft(value,initial)).value,JSON.parse(JSON.stringify(draft)));
 assert.equal(readContinuity(storage,'synthetic-B','workspace',validateWorkspace).value,null);
 assert(entries.has(continuityKey('synthetic-A','fishing-draft')));
 console.log('FRESH PROCESS RESTORE / CROSS-ACCOUNT PASS');
}
