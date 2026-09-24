import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cycleV2,freezeEvidenceV1,publicationV2,hash} from '../../shared/oceanPublication.mjs';
const at='2026-09-24T12:00:00.000Z';
const ref=value=>({kind:'captured',referenceId:'synthetic-history',contractVersion:'diagnostic-only',sha256:hash(value)});
function input(){
 const cycle=cycleV2({scheduledAt:at,region:{id:'synthetic',version:'1'},configuration:{id:'test',version:'1',governanceReference:'test',evaluatorVersion:'test-explicit-assessment-v1',candidateUniverseVersion:'1',species:['blue-marlin'],families:['SST'],candidateUniverse:{reference:ref('universe'),candidateIds:[]}}});
 const evidence=freezeEvidenceV1(cycle,[{family:'SST',status:'UNAVAILABLE',reason:'fixture',reference:null,product:null,representedAt:null,support:{kind:'unknown',start:null,end:null},qualification:{status:'UNKNOWN',policyReference:'fixture'},admissibility:{status:'UNASSESSED',policyReference:'fixture'},assessedAt:at,ageHours:null,qualityReferences:[],lineageReferences:[]}]);
 return {cycle,evidence,attempt:{id:'test',startedAt:at,endedAt:at},evaluation:{assessmentAt:at,evaluatorVersion:cycle.configuration.evaluatorVersion,evidenceSetId:evidence.evidenceSetId,candidateResults:[],signalReferences:[],lineageReferences:[]}};
}
test('v2 accepts no-history publication; no history semantics are inferred',()=>{const p=publicationV2(input());assert(!Object.hasOwn(p,'history'));assert(!Object.hasOwn(p.evaluation,'history'));});
test('explicit history cannot be added to v2 input or evaluation',()=>{for(const location of ['root','evaluation']){const p=input();(location==='root'?p:p.evaluation).history={asOf:at,entries:[]};assert.throws(()=>publicationV2(p));}});
test('lineage can bind a digest but cannot validate history cutoff or privacy',()=>{
 const p=input();p.evaluation.lineageReferences=[ref({asOf:'2099-01-01T00:00:00Z',user_id:'synthetic-private'})];assert.doesNotThrow(()=>publicationV2(p));
 const a=publicationV2(p);p.evaluation.lineageReferences=[ref({asOf:at,entries:[]})];assert.notEqual(a.contentDigest,publicationV2(p).contentDigest);
 console.log(JSON.stringify({boundary:'history-binding',digestBinding:'EXACT_MATCH',historyInputSemantics:'NOT_COMPARABLE_NONSCIENTIFIC',verdict:'TASK_12A_2_REQUIRED'}));
});
test('worker freezes evidence and assessment but lacks history verification or retry comparison',()=>{const s=readFileSync(new URL('../oceanState/publicationWorker.mjs',import.meta.url),'utf8');assert(s.includes('port.evaluate(freeze({cycle,evidence,'));assert(!s.includes('verifyHistory'));assert(s.includes('existing.evidence.evidenceSetId!==evidence.evidenceSetId'));});
test('authenticated memory precedes scientific temporal composition; history tables remain owner-bound',()=>{const s=readFileSync(new URL('../server.js',import.meta.url),'utf8');const start=s.indexOf('const oceanMemoryRowRetrieval =',s.indexOf('async function getOceanConditionsAtAssessment'));const end=s.indexOf('const blueMarlinHabitat =',start);const flow=s.slice(start,end);for(const symbol of ['normalizedBearerToken','buildHistoricalSnapshotQuery','buildOceanMemoryTimeSeries','buildOceanPersistence','assessOceanOpportunity'])assert(flow.includes(symbol));assert(s.includes('const persistenceScore = 0;'));for(const table of ['20260907_governed_opportunity_history_v1.sql','20260912_governed_opportunity_observation_v1.sql']){const sql=readFileSync(new URL('../../supabase/migrations/'+table,import.meta.url),'utf8');assert(sql.includes('user_id uuid not null'));assert(sql.includes('references auth.users(id)'));}});
