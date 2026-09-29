import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {readFileSync,writeFileSync} from 'node:fs';
import {createPeloraServer,buildDynamicBlueMarlinOpportunity} from '../server.js';
import {requireCurrentScientificSurfaceV2} from '../candidateSemanticProjectionV2.mjs';
import {assessment,candidate,modes,actualDefault,injected,observation,inventory} from './fixtures/oceanProviderBoundaryFixture.mjs';
const source=readFileSync(new URL('../server.js',import.meta.url),'utf8');
const rows=[],outputs=[];let baseline;

test('primitive invocation availability is non-nullish, not scientific adequacy',async()=>{
 const cases=[['false',false],['zero',0],['string','arbitrary-string'],['true',true],['one',1],['minus-one',-1],['null',null],['undefined',undefined],['array',[]],['object',{}],['function',()=>1],['NaN',NaN],['Infinity',Infinity]];
 for(const [id,value]of cases){const result=await injected(value);const state=observation(result);assert.equal(state.status,'fulfilled');assert.equal(state.leafAvailable,value!=null);assert.equal(state.wrapperAvailable,true);assert.equal(state.successful,1);assert.equal(state.failed,0);assert.equal(result.controlledEvaluation.evaluation.results[0].value.oceanConditions,value);rows.push({id,...state,snapshotCreated:false,scoreOrGateInvoked:false});}
});

test('malformed structured evidence and private fields are passed through, not authenticated',async()=>{
 const cases=[['missing-family',{wind:{speedKnots:4}}],['wrong-primitive',{sst:'hot'}],['null-sst',{sst:null}],['nonfinite',{sst:{temperatureFahrenheit:NaN}}],['wrong-provenance',{sst:{source:{provider:42,availability:'invented'}}}],['wrong-time',{observedAt:'tomorrow',assessmentAt:'1900-01-01'}],['malformed-spatial',{sst:{derived:{spatialStructure:[]}}}],['private',{captain_id:'synthetic-private-label',userId:'synthetic-private-user'}],['unreviewed-snapshot',{observationSnapshot:{unreviewed:'arbitrary'}}],['inherited',Object.create({sst:{temperatureFahrenheit:80}})]];
 for(const [id,value]of cases){const result=await injected(value);assert.equal(observation(result).leafAvailable,true);assert.equal(result.controlledEvaluation.evaluation.results[0].value.oceanConditions,value);rows.push({id,...observation(result),snapshotCreated:false,scoreOrGateInvoked:false});}
 assert.throws(()=>requireCurrentScientificSurfaceV2(cases.find(c=>c[0]==='private')[1]));
});

test('descendant accessors are not traversed; await still assimilates thenables',async()=>{
 let reads=0;const value={};Object.defineProperty(value,'sst',{enumerable:true,get(){reads++;throw Error('Should not traverse evidence');}});
 assert.equal(observation(await injected(value)).leafAvailable,true);assert.equal(reads,0);
 let thenReads=0;const thenable={get then(){thenReads++;throw Error('Controlled thenable rejection');}};
 const result=await injected(thenable);assert.equal(observation(result).status,'rejected');assert.equal(thenReads,1);
 rows.push({id:'thenable-throw',...observation(result),thenReads});
});

test('a deliberate internal bridge can copy a claimed score, but score alone does not satisfy gate',async()=>{
 const claimed={blueMarlinHabitat:{confidence:{components:{confidenceAdjustedSuitability:{score:88}},score:91,level:'high'}}};
 const result=await injected(claimed);
 // Explicit extra application-code call, NOT an automatic callback consumer.
 // Needed only to distinguish non-null invocation success from scientific trust.
 const interpreted=buildDynamicBlueMarlinOpportunity({location:candidate,oceanConditions:result.controlledEvaluation.evaluation.results[0].value.oceanConditions});
 assert.equal(interpreted.score,88);assert.equal(interpreted.confidence.score,91);
 assert.equal(interpreted.eligibility.eligibleForRanking,false);
 rows.push({id:'explicit-internal-score-bridge',automaticProductionPath:false,copiedScore:interpreted.score,copiedConfidence:interpreted.confidence.score,eligibleForRanking:interpreted.eligibility.eligibleForRanking});
});

test('explicit assessment remains immutable while conflicting returned times are not validated by seam',async()=>{
 let seen;const value={assessmentAt:'2099-01-01T00:00:00Z',observedAt:'2099-01-01T00:00:00Z',retrievedAt:'1900-01-01T00:00:00Z'};
 const result=await injected(value,{oceanConditionsProvider:async(_a,_b,options)=>{seen=options.assessment;assert(Object.isFrozen(seen));return value;}});
 assert.equal(seen.assessmentAt,'2026-09-24T01:00:00.000Z');assert.equal(result.controlledEvaluation.evaluation.results[0].value.oceanConditions,value);
 // Output time acceptance does not demonstrate downstream age/gate acceptance.
});

test('HTTP data cannot replace the provider callback captured at server construction',async()=>{
 let calls=0;const chosen=async()=>{calls++;return {marker:'internally-selected'};};
 const server=createPeloraServer({oceanConditionsProvider:chosen,persistenceConfigurationProvider:()=>({configured:false})});
 try{for(const suffix of ['', '&oceanConditionsProvider=untrusted&provider=untrusted']){
  const req=Object.assign(new EventEmitter(),{method:'GET',url:'/api/ocean?lat=25&lon=-90'+suffix,headers:{host:'localhost','x-ocean-conditions-provider':'untrusted',cookie:'provider=untrusted'},body:{oceanConditionsProvider:'untrusted'}});
  let status,payload;const res=Object.assign(new EventEmitter(),{writeHead(code){status=code;},end(value){payload=JSON.parse(value);}});
  await server.listeners('request')[0](req,res);assert.equal(status,200);assert.equal(payload.marker,'internally-selected');
 }assert.equal(calls,2);}finally{server.close();}
});

test('production species caller hard-binds the private default; injected seam does not score',()=>{
 const start=source.indexOf('async function evaluateControlledGulfBlueMarlinV1AtAssessment('),end=source.indexOf('async function getDynamicBlueMarlinOpportunities',start);
 assert(start>=0&&end>start);const caller=source.slice(start,end);
 assert.equal((caller.match(/oceanConditionsProvider:\s*getOceanConditions/g)||[]).length,2);
 const leaf=source.slice(source.indexOf('async function evaluateUnifiedOpenWaterOceanConditionsV1AtAssessment('),source.indexOf('async function evaluateUnifiedPhysicalStructureOceanConditionsV1AtAssessment('));
 assert(leaf.includes('oceanConditions != null'));assert(!leaf.includes('buildUnifiedSpeciesOpportunityInterpretation'));assert(!leaf.includes('buildObservationSnapshot'));
 assert(!/^export (?:async )?function getOceanConditions\(/m.test(source));
});

test('default current producer and unchanged returned-object replay are exactly equivalent',async t=>{
 const produced=await actualDefault(t);baseline=produced;outputs.push({id:'complete',ocean:produced.ocean});
 const replay=await injected(produced.ocean,{concurrency:1,bearerToken:null});
 assert.deepEqual(replay,produced.result);
 assert.equal(replay.controlledEvaluation.evaluation.results[0].value.oceanConditions.observationSnapshot,produced.ocean.observationSnapshot);
 // The exact already-produced object is replayed, not reconstructed/authenticated.
});

test('actual default fallback outputs remain independent from injected malformed-output domain',async t=>{
 for(const [i,mode]of modes.slice(1).entries()){
  const produced=await actualDefault(t,mode,Date.parse('2045-02-01T00:00:00Z')+i*86400000);outputs.push({id:mode,ocean:produced.ocean});
  assert.equal(produced.ocean.observationSnapshot.available,true);
  if(mode==='empty-chlorophyll'){assert.equal(produced.ocean.chlorophyll.source.availability,'unavailable');assert.equal(produced.ocean.oceanEvidence.groups.productivity.available,false);}
  if(mode==='future-sst'){assert.deepEqual(produced.ocean.sst.derived.spatialStructure.samples,[]);assert.equal(produced.ocean.sst.derived.spatialStructure.coverage,'unavailable');}
  if(mode==='rejected-sst')assert.equal(produced.ocean.sst.derived.spatialStructure.samples.length,4);
  if(mode==='empty-currents')assert.equal(produced.ocean.currents.speedKnots,null);
  if(mode==='rejected-weather')assert.equal(produced.ocean.dataQuality.layers.wind.state,'degraded');
 }
});

test('observed return-shape inventory is duplicate/order invariant, without completeness claim',()=>{
 const a=inventory(outputs);assert.deepEqual(inventory([...outputs].reverse()),a);assert.deepEqual(inventory([...outputs,outputs[0]]),a);
 assert.deepEqual(a.find(p=>p.path==='').absent,[]);
 if(process.env.PELORA_WRITE_PROVIDER_REVIEW==='1')writeFileSync(new URL('../../.local/ocean-quarantine/task12b6p/observations.json',import.meta.url),JSON.stringify({rows,topLevelKeys:Object.keys(baseline.ocean).sort(),scenarios:outputs.map(o=>o.id),paths:a},null,2)+'\n');
});

test('publication binding names evaluator capability but does not register provider implementations',()=>{
 const worker=readFileSync(new URL('../oceanState/publicationWorker.mjs',import.meta.url),'utf8');
 const contract=readFileSync(new URL('../../shared/oceanPublication.mjs',import.meta.url),'utf8');
 assert(worker.includes('await port.evaluate('));assert(worker.includes("Object.hasOwn(d,'value')&&typeof d.value==='function'"));
 assert(contract.includes("evaluatorVersion.endsWith('-explicit-assessment-history-v1')"));assert(contract.includes('e.evaluatorVersion===cycle.configuration.evaluatorVersion'));
 assert(!worker.includes('oceanConditionsProvider'));assert(!contract.includes('oceanConditionsProvider'));
});
