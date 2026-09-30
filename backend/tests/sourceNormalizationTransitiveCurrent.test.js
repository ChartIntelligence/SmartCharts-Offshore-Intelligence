// Current-runtime successor: independent setup preserves behavior checks without frozen source coordinates.
// Historical transitiveProducerBoundary.test.js is immutable; no graph/scientific qualification.
import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {writeFileSync,readFileSync} from 'node:fs';
import {evaluateUnifiedOpportunityOceanConditionsV1,evaluateUnifiedOpenWaterOceanConditionsV1,getChlorophyllConditions} from '../server.js';
import {assessment,candidate,scenarios,runScenario,coverageSession,discoverBoundary,source} from './fixtures/transitiveProducerBoundaryFixture.mjs';

const results=[];
let execution=0;
let profiler;
after(async()=>{if(profiler)await profiler.close();});
async function run(t,id){const scenario=scenarios.find(s=>s.id===id);assert(scenario);profiler??=await coverageSession();const result=await runScenario(t,scenario,{clock:Date.parse('2040-01-01T00:00:00Z')+(execution++)*86400000});result.coverage=await profiler.take();results.push(result);return result;}
function covered(result,name,text){const offset=source.indexOf(text,source.indexOf('function '+name+'('));assert(offset>=0);const ranges=result.coverage.flatMap(f=>f.ranges).filter(r=>r.startOffset<=offset&&r.endOffset>offset).sort((a,b)=>(a.endOffset-a.startOffset)-(b.endOffset-b.startOffset));assert(ranges.length);return ranges[0].count>0;}

test('actual internal boundary enforces class and coordinate box, not fixed auxiliary values',async()=>{
 let calls=0;const provider=async()=>{calls++;return {};};
 for(const coordinates of [[15,-100],[32,-75],['25','-90']])assert.equal((await evaluateUnifiedOpenWaterOceanConditionsV1({assessment,candidate:{...candidate,coordinates},oceanConditionsProvider:provider})).available,true);
 for(const coordinates of [[14.999,-90],[32.001,-90],[25,-100.001],[25,-74.999],[null,-90],['',-90]])assert.equal((await evaluateUnifiedOpenWaterOceanConditionsV1({assessment,candidate:{...candidate,coordinates},oceanConditionsProvider:provider})).reason,'candidate-coordinates-invalid');
 assert.equal(calls,3);
 assert.equal((await evaluateUnifiedOpenWaterOceanConditionsV1({assessment,candidate:{...candidate,candidateClass:'unsupported'},oceanConditionsProvider:provider})).reason,'candidate-evaluation-pathway-not-governed');
});

test('injected provider output is not schema-enforced: precise boundary STOP',async()=>{
 for(const output of [false,0,'not-ocean-evidence',{observationSnapshot:{unreviewed:'arbitrary'}}]){
  const result=await evaluateUnifiedOpportunityOceanConditionsV1({assessment,candidates:[candidate],oceanConditionsProvider:async()=>output});
  const evaluation=result.controlledEvaluation.evaluation.results[0].value;
  assert.equal(evaluation.available,true);assert.deepEqual(evaluation.oceanConditions,output);
 }
 const none=await evaluateUnifiedOpenWaterOceanConditionsV1({assessment,candidate,oceanConditionsProvider:async()=>null});assert.equal(none.available,false);
});

test('actual default caller reaches empty chlorophyll branch and normalizes final availability',async t=>{
 const finite=await run(t,'finite-control'),missing=await run(t,'empty-chlorophyll');
 assert.equal(finite.ocean.oceanEvidence.groups.productivity.available,true);
 assert.equal(missing.ocean.chlorophyll.concentrationMgM3,null);
 assert.equal(missing.ocean.chlorophyll.source.availability,'unavailable');
 assert.equal(missing.ocean.oceanEvidence.groups.productivity.available,false);
 assert.equal(missing.ocean.observationSnapshot.available,true);
 // V8 omits subranges whose count equals the enclosing range; use the
 // narrowest containing interval, including zero-count child overrides.
 const start=source.indexOf('const chlorophyllConcentrationMgM3 =',source.indexOf('function buildSurfaceWaterCharacterAnalysis('));
 const offset=source.indexOf(': null;',start)+2;
 assert(offset>=0); // Current source location, not a historical line-number identity.
 const count=result=>result.coverage.flatMap(f=>f.ranges).filter(r=>r.startOffset<=offset&&r.endOffset>offset).sort((a,b)=>(a.endOffset-a.startOffset)-(b.endOffset-b.startOffset))[0]?.count;
 assert(count(missing)>0,'chlorophyll null alternative executed');assert.equal(count(finite),0);
 assert(covered(missing,'getChlorophyllConditionsAtAssessment','"no-valid-pixel"'));
 assert(!covered(finite,'getChlorophyllConditionsAtAssessment','"no-valid-pixel"'));
 // Independent raw parser observation complements full-chain positive coverage.
 const mock=t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>({table:{columnNames:['time','latitude','longitude','chlor_a'],rows:[]}})}));
 try{const parsed=await getChlorophyllConditions(25,-90,assessment);assert.equal(parsed.source.availability,'no-valid-pixel');assert.equal(parsed.concentrationMgM3,null);}finally{mock.mock.restore();}
});

test('future directional time reaches actual rejected-assembly fallback through default evaluator',async t=>{
 const result=await run(t,'future-directional-sst'),spatial=result.ocean.sst.derived.spatialStructure;
 assert.equal(spatial.coverage,'unavailable');assert.deepEqual(spatial.samples,[]);
 assert.equal(Object.hasOwn(spatial,'orientation'),false);assert.equal(Object.hasOwn(spatial,'confidence'),false);
 assert(result.warnings.includes('SST spatial analysis failed:'));
 assert(covered(result,'getOceanConditionsAtAssessment','"spatial-sampling-unavailable"'));
 assert(!covered(results.find(r=>r.id==='finite-control'),'getOceanConditionsAtAssessment','"spatial-sampling-unavailable"'));
 assert.equal(result.ocean.observationSnapshot.available,true);
});

test('individual rejected directional acquisitions are a different governed missing state',async t=>{
 const result=await run(t,'rejected-directional-sst'),spatial=result.ocean.sst.derived.spatialStructure;
 assert.equal(spatial.samples.length,4);assert(spatial.samples.every(s=>s.source.availability==='request-failed'));
 assert.equal(spatial.coverage,'insufficient');assert(Object.hasOwn(spatial,'orientation'));assert(Object.hasOwn(spatial,'confidence'));
 assert(!result.warnings.includes('SST spatial analysis failed:'));
});

test('current empty evidence and rejected weather flow through unchanged default caller',async t=>{
 const current=await run(t,'empty-currents');assert.equal(current.ocean.currents.speedKnots,null);assert.equal(current.ocean.observationSnapshot.available,true);
 const weather=await run(t,'rejected-weather');assert.equal(weather.ocean.dataQuality.layers.wind.state,'degraded');assert.equal(weather.ocean.observationSnapshot.available,true);
});

test('cold/warm sanity check preserves directional temperatures; full equivalence remains open',async t=>{
 const scenario=scenarios[0],clock=Date.parse('2050-01-01T00:00:00Z');
 const cold=await runScenario(t,scenario,{clock}),warm=await runScenario(t,scenario,{clock});
 assert(cold.calls.length>warm.calls.length);
 // Do not silently remove metadata and claim full semantic equivalence.
 assert.deepEqual(cold.ocean.observationSnapshot.observations.sst.derived.spatialStructure.samples.map(s=>s.temperatureCelsius),warm.ocean.observationSnapshot.observations.sst.derived.spatialStructure.samples.map(s=>s.temperatureCelsius));
});

test('AST discovery includes the omitted caller and remains explicitly incomplete',()=>{
 const a=discoverBoundary(),b=discoverBoundary();assert.deepEqual(a,b);
 for(const name of ['getOceanConditionsAtAssessment','getSstSpatialStructureAtAssessment','getChlorophyllConditionsAtAssessment','buildObservationSnapshot'])assert(a.nodes.some(n=>n.function===name));
 assert(a.branches.length>0);assert(a.branches.every(b=>b.disposition==='REQUIRES_FURTHER_REVIEW'));
 assert.equal(new Set(a.branches.map(b=>b.id)).size,a.branches.length);
 if(process.env.PELORA_WRITE_TRANSITIVE_STOP==='1'){
  const evidence=results.map(r=>({id:r.id,requests:r.calls,snapshotAvailable:r.ocean.observationSnapshot.available,chlorophyll:r.ocean.chlorophyll,productivityAvailable:r.ocean.oceanEvidence.groups.productivity.available,sstSpatial:r.ocean.sst.derived.spatialStructure,windState:r.ocean.dataQuality.layers.wind.state,executedFunctions:r.coverage.filter(f=>f.ranges[0]?.count>0).map(f=>f.functionName).filter(Boolean).sort(),branchCoverage:r.coverage.filter(f=>['getOceanConditionsAtAssessment','getChlorophyllConditionsAtAssessment','buildSurfaceWaterCharacterAnalysis','assessSstTransitionConfidence'].includes(f.functionName))}));
  writeFileSync(new URL('../../.local/ocean-quarantine/task12b6o/discovery.json',import.meta.url),JSON.stringify({verdict:'ACCEPTED_PROVIDER_OUTPUT_DOMAIN_UNRESOLVED',qualified:false,graph:a,evidence},null,2)+'\n');
 }
});

test('current discovery is reproducible while historical STOP remains nonauthoritative',()=>{
 const saved=JSON.parse(readFileSync(new URL('../../docs/Transitive_Producer_Boundary_Discovery_v1.json',import.meta.url)));
 const fresh=discoverBoundary();assert.equal(saved.qualification,'NOT_QUALIFIED');
 assert.deepEqual(fresh,discoverBoundary()); // Separate current inventory; never rewrite saved historical hashes.
 const stop=JSON.parse(readFileSync(new URL('../../docs/Transitive_Producer_Boundary_Stop_v1.json',import.meta.url)));
 assert.equal(stop.qualified,false);assert.equal(stop.producerInventory.digest,null);
 assert.equal(stop.discovery.semanticBranchTotal,null);
});

test('preservation record is internally consistent without requiring failed drafts to run',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../../docs/Transitive_Producer_Boundary_Preservation_v1.json',import.meta.url)));
 assert.equal(manifest.files.length,29);
 assert.equal(new Set(manifest.files.map(f=>f.path)).size,29);
 // Actual file hashes are verified by checkpoint-time shell checks, not by
 // importing/requiring failed untracked work in the runnable STOP diagnostic.
 for(const entry of manifest.files){assert.match(entry.before,/^[a-f0-9]{64}$/);assert.equal(entry.after,entry.before);assert.equal(entry.unchanged,true);}
});
