import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {scenarios,createHarness,produceCases} from './fixtures/snapshotProducerQualificationV2Fixture.mjs';
import {buildInventory,semanticLeaves,auditDigest,compareHistorical} from './fixtures/snapshotProducerInventoryV2.mjs';
import {startSourceCoverage,coverageMatrix,thresholdEvidence,sourceVocabularies,sourceHash,functions,possibleCoherentScores,sourcePredicates,vocabularyAudit,reviewedCoverage,authorityFreezeGate} from './fixtures/snapshotProducerBranchAuditV2.mjs';
const file=p=>new URL('../../'+p,import.meta.url);
const hash=p=>createHash('sha256').update(readFileSync(file(p))).digest('hex');
let baseline,inventory,coverage,digest;
const attackResults=[];
function same(rows,label){
 const candidate=buildInventory(rows);
 assert.deepEqual(candidate,inventory,label);
 assert.equal(auditDigest(candidate),digest,label);
 const byId=new Map(baseline.map(r=>[r.id,semanticLeaves(r.snapshot)]));
 for(const row of rows)assert.deepEqual(semanticLeaves(row.snapshot),byId.get(row.id),label+': '+row.id);
 attackResults.push({label,digest});
}
function shuffled(input,seed){
 const result=[...input];let state=seed;
 for(let i=result.length-1;i>0;i--){state=(Math.imul(state,1664525)+1013904223)>>>0;const j=state%(i+1);[result[i],result[j]]=[result[j],result[i]];}
 return result;
}

test('stable explicit coordinates; actual producer cold/warm baseline and source coverage',async t=>{
 const profiler=await startSourceCoverage(),harness=await createHarness(t);await profiler.discardSetup();baseline=[];
 try{for(const scenario of scenarios){const rows=await harness.run(scenario);if(scenario.id==='availability-15')rows.push(...await harness.run(scenario,{mode:'concurrent'}));baseline.push(...rows);for(const row of rows){assert.deepEqual(semanticLeaves(rows[0].snapshot),semanticLeaves(row.snapshot));assert.deepEqual(rows[0].feature,row.feature);}assert.deepEqual(rows[0].snapshot.location,{...scenario.coordinates,name:null});await profiler.collect(scenario.id);}}
 finally{coverage=reviewedCoverage(coverageMatrix(await profiler.stop()),baseline);harness.close();}
 inventory=buildInventory(baseline);digest=auditDigest(inventory);
 assert.deepEqual(buildInventory(baseline,{algorithm:'recursive'}),inventory);
 assert.equal(inventory.find(x=>x.path==='/observationSnapshot').presence,'PRESENT_IN_ALL_RELEVANT_SCENARIOS');
 console.log('NEW_BASELINE',JSON.stringify({scenarios:scenarios.length,snapshots:baseline.length,paths:inventory.length,digest,ranges:coverage.length,executed:coverage.filter(x=>x.status==='EXECUTED').length,excluded:coverage.filter(x=>x.status==='EXCLUDED_WITH_SOURCE_PROOF').length,unresolved:coverage.filter(x=>x.status==='REQUIRES_SOURCE_REACHABILITY_REVIEW').length}));
});

test('reverse and five deterministic permutations preserve exact per-scenario evidence and inventory',async t=>{
 same(await produceCases(t,[...scenarios].reverse(),{mode:'cold',reverseRequestSetup:true,irrelevantRequest:true}),'reverse');
 for(const seed of [1,7,42,1729,65537])same(await produceCases(t,shuffled(scenarios,seed),{mode:'cold'}),'permutation-'+seed);
});

test('first/middle/last/multiple duplicate scenarios cannot alter optionality',async t=>{
 for(const indexes of [[0],[Math.floor(scenarios.length/2)],[scenarios.length-1],[0,0,Math.floor(scenarios.length/2),scenarios.length-1]]){
  same(await produceCases(t,[...scenarios,...indexes.map(i=>scenarios[i])],{mode:'cold'}),'duplicates-'+indexes.join('-'));
 }
 const duplicated=buildInventory([...baseline,baseline[0],baseline[0]]);
 assert.deepEqual(duplicated,inventory);
 assert.equal(duplicated.find(x=>x.path==='/observationSnapshot').absentStates.length,0);
});

test('warm-first, cache hits, subset then full and repeated process runs preserve inventory',async t=>{
 same(await produceCases(t,scenarios,{mode:'warm-first'}),'warm-first');
 const subset=await produceCases(t,[scenarios[0],scenarios.at(-1)],{mode:'warm'});
 const subsetInventory=buildInventory(subset,{knownPaths:inventory.map(x=>x.path)});
 assert(subsetInventory.some(x=>x.presence==='NEVER_EMITTED'));
 assert.equal(subsetInventory.find(x=>x.path==='/observationSnapshot').presence,'PRESENT_IN_ALL_RELEVANT_SCENARIOS');
 same(await produceCases(t,scenarios,{mode:'warm'}),'subset-then-full-warm');
 same(await produceCases(t,scenarios,{mode:'cold'}),'repeated-full-cold');
});

test('both historical omissions and signed zeros survive actual producer assembly',()=>{
 const weak=baseline.find(x=>x.id==='weak-axis-demonstrated');
 assert.equal(weak.spatial.confidence.axisSeparationFahrenheit,0.4);
 assert(weak.spatial.confidence.reasons.includes('weak-axis-separation'));
 const partial=baseline.find(x=>x.id==='partial-low-driver-demonstrated');
 assert.equal(partial.snapshot.evidence.groups.temperature.drivers[3],'spatial-pattern-confidence-low');
 assert(baseline.find(x=>x.id==='negative-zero').spatial.samples.every(s=>Object.is(s.temperatureCelsius,-0)));
 assert(baseline.find(x=>x.id==='positive-zero').spatial.samples.every(s=>Object.is(s.temperatureCelsius,0)));
});

test('source boundaries and unreviewed range evidence are explicit, never inferred qualified',()=>{
 const thresholds=thresholdEvidence(baseline);
 console.log('THRESHOLD_AUDIT',JSON.stringify(thresholds));
 console.log('SOURCE_VOCABULARY',JSON.stringify(sourceVocabularies));
 assert.equal(functions.find(f=>f.name==='cloneSnapshotValue').text.includes('structuredClone('),true);
 assert.equal(functions.find(f=>f.name==='cloneSnapshotValue').text.includes('catch'),false);
 assert(coverage.some(x=>x.producer==='buildTemperatureEvidence'&&x.source.includes('drivers.push')));
 const complete=coverage.find(x=>x.kind==='BLOCK_RANGE'&&x.producer==='assessSstTransitionConfidence'&&x.source.includes('complete-four-point-coverage'));
 assert(complete);assert(!complete.scenarios.includes('availability-0'),'Auxiliary setup must not contaminate scenario coverage');
});

test('actual threshold outcomes bracket discrete confidence 45 without inventing a producer score',()=>{
 assert(!possibleCoherentScores().includes(45));
 for(const score of [44,46,74,76])assert.equal(baseline.find(x=>x.id==='score-'+score).spatial.confidence.score,score);
 assert(thresholdEvidence(baseline).every(x=>x.status!=='BOUNDARY_NOT_YET_COVERED'));
});

test('duplicate state with conflicting scientific values is rejected instead of merged',()=>{
 const original=baseline.find(x=>x.id==='uniform');
 const altered=structuredClone(original);altered.snapshot.observations.sst.temperatureCelsius=999;
 assert.throws(()=>buildInventory([original,altered]),/Conflicting evidence/);
});

test('future evidence is rejected by the unchanged assembler, not relabelled as missing time',async t=>{
 const scenario={...scenarios.find(s=>s.id==='availability-15'),id:'invalid-future',time:'2026-09-24T02:00:00Z'};
 await assert.rejects(()=>produceCases(t,[scenario]),/timestamp after scientific assessment/);
});

test('unresolved source reachability blocks an authority freeze and projection implementation',()=>{
 const gate=authorityFreezeGate(coverage);
 assert.equal(gate.freezeAllowed,false);
 assert.equal(gate.verdict,'SNAPSHOT_PRODUCER_BRANCH_AUTHORITY_UNRESOLVED');
 assert(gate.blockingRangeIds.length>0);
 assert(!existsSync(file('docs/Candidate_Snapshot_Authority_Freeze_v2.json')));
 assert(!existsSync(file('docs/Candidate_Semantic_Projection_v3_Proposed_Delta_v2.json')));
});

test('new evidence artifacts are independently reproducible; no failed artifact is an oracle',()=>{
 // Historical artifacts are read only here, after generating the new inventory, for comparison.
 const comparisons=[1,2].map(version=>({version,differences:compareHistorical(inventory,JSON.parse(readFileSync(file('docs/Candidate_Snapshot_Producer_Surface_v'+version+'.json'))))}));
 const contents={
  'docs/Candidate_Snapshot_Producer_Surface_v3.json':{version:'pelora-snapshot-producer-surface-v3',status:'SOURCE_AUDIT_PENDING_NO_AUTHORITY',scenarioCount:scenarios.length,pathCount:inventory.length,digest,inventory,attacks:attackResults,historicalComparisons:comparisons},
  'docs/Candidate_Snapshot_Producer_Branches_v2.json':{version:'pelora-snapshot-source-coverage-v2',status:'REQUIRES_REACHABILITY_REVIEW',sourceHash,functions:functions.map(({text,...rest})=>rest),predicates:sourcePredicates(),ranges:coverage,thresholds:thresholdEvidence(baseline),vocabularies:vocabularyAudit(baseline),gate:authorityFreezeGate(coverage)},
  'docs/Candidate_Snapshot_Producer_Scenarios_v2.json':{version:'pelora-snapshot-producer-scenarios-v2',domain:'Explicit nonpolar 25,-91 coordinates; existing four-cardinal sampler; synthetic finite/null SST and past UTC/null time; fixed producer-derived auxiliary inputs. No global/polar qualification.',scenarios:scenarios.map(s=>({...s,center:Object.is(s.center,-0)?'NEGATIVE_ZERO':s.center,values:s.values.map(x=>Object.is(x,-0)?'NEGATIVE_ZERO':x),executedRangeIds:coverage.filter(r=>r.scenarios.includes(s.id)).map(r=>r.id)}))}
 };
 if(process.env.PELORA_WRITE_HARNESS_V2_EVIDENCE==='1')for(const [path,content] of Object.entries(contents))writeFileSync(file(path),JSON.stringify(content,null,2)+'\n');
 for(const [path,content] of Object.entries(contents))if(existsSync(file(path)))assert.deepEqual(JSON.parse(readFileSync(file(path))),content,'Regenerated evidence differs: '+path);
 // Coverage range counts can change with instrumentation; never freeze unreviewed ranges.
 console.log('NEW_EVIDENCE',JSON.stringify({digest,paths:inventory.length,sourcePredicates:sourcePredicates().length,unresolvedRanges:authorityFreezeGate(coverage).blockingRangeIds.length}));
});

test('failed qualification artifacts and quarantined drafts remain unchanged',()=>{
 const before=JSON.parse(readFileSync(file('docs/Candidate_Snapshot_Harness_v2_Preservation.json'))).expectedHashes;
 for(const [path,expected] of Object.entries(before))assert.equal(hash(path),expected,path);
});
