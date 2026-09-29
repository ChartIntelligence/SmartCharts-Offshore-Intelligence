import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {scenarios,source} from './fixtures/snapshotProducerQualificationV2Fixture.mjs';
import {startSourceCoverage,coverageMatrix} from './fixtures/snapshotProducerBranchAuditV2.mjs';
import {buildInventory,auditDigest,semanticLeaves} from './fixtures/snapshotProducerInventoryV2.mjs';
import {targets,prior,inventory,extensionHarness,additionalScenarios,rangeReview,optionalityReview,requirementReview,requirementOrder,hash,read} from './fixtures/snapshotBranchReachabilityReview.mjs';
const path=p=>new URL('../../'+p,import.meta.url);
let rows=[],coverage=[],review=[],union,digest;
const all=[...scenarios,...additionalScenarios];
const attacks=[];
function permute(input,seed){let state=seed;const result=[...input];for(let i=result.length-1;i>0;i--){state=(Math.imul(state,1664525)+1013904223)>>>0;const j=state%(i+1);[result[i],result[j]]=[result[j],result[i]];}return result;}
async function run(t,cases,options){const harness=await extensionHarness(t);try{const output=[];for(const s of cases)output.push(...await harness.run(s,options));return output;}finally{harness.close();}}
function equivalent(output,label){assert.deepEqual(buildInventory(output),union,label);const originals=new Map(rows.map(r=>[r.id,semanticLeaves(r.snapshot)]));for(const row of output)assert.deepEqual(semanticLeaves(row.snapshot),originals.get(row.id),label+':'+row.id);attacks.push({label,digest:auditDigest(buildInventory(output))});}

test('actual parser coordinate fallbacks have positive test-only source coverage; original harness reused',async t=>{
 const profiler=await startSourceCoverage(),harness=await extensionHarness(t);await profiler.discardSetup();
 try{for(const scenario of all){const output=await harness.run(scenario);rows.push(...output);assert.deepEqual(semanticLeaves(output[0].snapshot),semanticLeaves(output[1].snapshot));await profiler.collect(scenario.id);}}
 finally{coverage=coverageMatrix(await profiler.stop());harness.close();}
 review=rangeReview(coverage);union=buildInventory(rows);digest=auditDigest(union);
 assert.equal(targets.length,313);assert.equal(new Set(review.map(r=>r.id)).size,313);
 for(const line of [6225,6231]){const row=review.find(r=>r.line===line);assert.equal(row.disposition,'REACHABLE_REVIEWED_DOMAIN');assert(row.exercisingScenarios.some(id=>id.startsWith('provider-coordinate-fallback-')));}
 const original=rows.find(r=>r.id==='availability-15');
 for(const scenario of additionalScenarios){const result=rows.find(r=>r.id===scenario.id);
  assert.deepEqual(result.feature,original.feature);
  for(let i=0;i<4;i++)for(const field of ['Latitude','Longitude']){
   const sample=result.spatial.samples[i],omitted=scenario.omitProviderCoordinates==='both'||scenario.omitProviderCoordinates===field.toLowerCase();
   assert.equal(sample['resolved'+field],original.spatial.samples[i]['resolved'+field]);
   assert.equal(sample.providerCoordinates['resolved'+field],omitted?null:original.spatial.samples[i].providerCoordinates['resolved'+field]);
  }
  const withoutRawProvider=leaves=>leaves.filter(([p])=>!p.includes('/providerCoordinates/'));
  assert.deepEqual(withoutRawProvider(semanticLeaves(result.snapshot)),withoutRawProvider(semanticLeaves(original.snapshot)));
 }
 assert.equal(auditDigest(buildInventory(rows.filter(r=>!r.id.startsWith('provider-coordinate-fallback-')))),inventory.digest);
});

test('extended scenario set remains order-, duplicate-, cache- and process-state independent',async t=>{
 equivalent(await run(t,[...all].reverse(),{mode:'cold'}),'reverse');
 for(const seed of [1,7,42,1729,65537])equivalent(await run(t,permute(all,seed),{mode:'cold'}),'seed-'+seed);
 for(const extra of [[all[0]],[all[Math.floor(all.length/2)]],[all.at(-1)],[all[0],all.at(-1),all[0]]])equivalent(await run(t,[...all,...extra],{mode:'cold'}),'duplicate-'+extra.map(s=>s.id).join(','));
 equivalent(await run(t,all,{mode:'warm-first'}),'warm-first');
 await run(t,[all[0],all.at(-1)],{mode:'cold'});
 equivalent(await run(t,all,{mode:'warm'}),'subset-then-full');
 equivalent(await run(t,all,{mode:'cold'}),'same-process-repeat');
});

test('all 122 optional paths are accounted for; duplicates cannot change per-state presence',()=>{
 const optional=optionalityReview(union);assert.equal(optional.length,122);
 const duplicates=[];
 for(const entry of optional){assert(entry.producer&&entry.control);assert(entry.presentScenarios.length&&entry.absentScenarios.length);assert.equal(entry.presentScenarios.length+entry.absentScenarios.length,all.length);const present=rows.find(r=>r.id===entry.presentScenarios[0]),absent=rows.find(r=>r.id===entry.absentScenarios[0]);duplicates.push(present,absent,present);}
 assert.deepEqual(buildInventory([...rows,...duplicates]),union);
 assert.equal(union.find(r=>r.path==='/observationSnapshot').presence,'PRESENT_IN_ALL_RELEVANT_SCENARIOS');
});

test('source-grounded optional object keys and sample metadata follow producer branches, not nullness',()=>{
 for(const r of rows){const t=r.snapshot.evidence.groups.temperature;
  for(const key of ['minimumFahrenheit','maximumFahrenheit','validNeighborCount','expectedNeighborCount','sampleRadiusNauticalMiles'])assert.equal(Object.hasOwn(t.values,key),t.available);
  for(const sample of r.spatial.samples){const rejected=all.find(s=>s.id===r.id).rejected?.includes(sample.direction)??false;assert.equal(Object.hasOwn(sample,'providerCoordinates'),!rejected);assert.equal(Object.hasOwn(sample,'timestampProvenance'),!rejected);}
  for(const a of [r.spatial.samples,r.feature.samplingFootprint.samples,r.feature.missingRequirements,t.drivers])assert.deepEqual(Object.keys(a),Array.from({length:a.length},(_,i)=>String(i)));
 }
});

test('requirement checks have exact ordering and scientific availability linkage; no reference authentication',()=>{
 for(const r of rows){const requirements=r.feature.missingRequirements;
  assert(Array.isArray(requirements));assert.deepEqual(requirements,[...new Set(requirements)]);
  assert(requirements.every(value=>requirementOrder.includes(value)));
  assert.deepEqual(requirements,[...requirements].sort((a,b)=>requirementOrder.indexOf(a)-requirementOrder.indexOf(b)));
  assert.equal(r.feature.available,requirements.length===0);
  assert.equal(r.feature.observationReference===null,!r.feature.available);
  assert.equal(r.snapshot.evidence.groups.temperature.observationProvenance.available,r.feature.available);
 }
 const requirements=requirementReview(rows);assert.equal(requirements.length,4);assert(requirements.every(r=>r.states.length));
 assert(rows.some(r=>r.feature.missingRequirements.length===0));
 assert(rows.some(r=>!r.feature.available&&r.feature.observedAt!==null));
});

test('driver ordering and two prior missed outputs remain producer-derived',()=>{
 const low=rows.find(r=>r.id==='partial-low-driver-demonstrated');assert.equal(low.snapshot.evidence.groups.temperature.drivers[3],'spatial-pattern-confidence-low');
 const weak=rows.find(r=>r.id==='weak-axis-demonstrated');assert.equal(weak.spatial.confidence.axisSeparationFahrenheit,0.4);assert(weak.spatial.confidence.reasons.includes('weak-axis-separation'));
 const indexes=new Set(rows.flatMap(r=>r.snapshot.evidence.groups.temperature.drivers.map((s,i)=>s.startsWith('spatial-pattern-confidence-')?i:null).filter(i=>i!==null)));
 assert(indexes.size>1,'Index 3 is scenario-specific, not a universal confidence position');
});

test('range dispositions retain exact source and distinguish unresolved proof from exclusion',()=>{
 const allowed=new Set(['REACHABLE_REVIEWED_DOMAIN','UNREACHABLE_UPSTREAM_VALIDATION','UNREACHABLE_CALLER_CONTRACT','UNREACHABLE_NONPOLAR_DOMAIN','UNREACHABLE_IMPOSSIBLE_STATE','NON_SEMANTIC_OPERATIONAL_BRANCH','NOT_PRODUCER_OUTPUT_BRANCH','REQUIRES_FURTHER_REVIEW']);
 for(const r of review){assert(allowed.has(r.disposition));assert.equal(source.slice(r.start,r.end),r.source);assert(r.proof&&r.counterexampleAttempt);if(r.disposition.startsWith('UNREACHABLE_'))assert.equal(r.exercisingScenarios.length,0,r.id);}
});

test('fixed-caller exclusion premises hold for every SST state without modifying auxiliary science',()=>{
 for(const {snapshot:s,spatial,feature} of rows){
  const o=s.oceanOrganization,e=o.evidence;
  assert.equal(e.currentFieldUniform,true);assert.equal(e.currentOrganizationAvailable,true);
  for(const key of ['currentVariationObserved','shearDetected','convergenceDetected','currentEdgeDetected','mixingInteractionContext','environmentalTransitionContext','oceanFrontCandidateContext'])assert.equal(e[key],false,key);
  assert(o.organizationIndex<=4);
  assert(s.evidence.groups.productivity.available&&s.evidence.groups.clarity.available);
  assert.equal(spatial.expectedNeighborCount,4);assert.equal(spatial.sampleRadiusNauticalMiles,15);assert(Number.isFinite(spatial.validNeighborCount));
  assert.equal(feature.source.contractVersion,'pelora-sst-spatial-range-v1');
  assert(Object.values(s.contractVersions).every(v=>typeof v==='string'&&v.length));
  assert(s.oceanPhysics.explainability.stages.every(stage=>stage.available));
  assert.equal(s.oceanPhysics.waterMassAnalysis.distinctAdjacentWaterMassesEstablished,false);
  assert.equal(s.oceanPhysics.mixingZoneAnalysis.mixingZoneDetected,false);
  assert.equal(s.oceanPhysics.environmentalTransitionAnalysis.environmentalTransitionDetected,false);
  assert.equal(s.oceanPhysics.oceanFrontAnalysis.oceanFrontDetected,false);
 }
});

test('produce reproducible review evidence; no authority proposal, freeze or v3 is created',()=>{
 const optional=optionalityReview(union),unresolvedRanges=review.filter(r=>r.disposition==='REQUIRES_FURTHER_REVIEW').length,unresolvedOptional=optional.filter(r=>r.disposition==='REQUIRES_FURTHER_REVIEW').length;
 const content={version:'pelora-snapshot-branch-optionality-review-v1',verdict:unresolvedRanges||unresolvedOptional?'SNAPSHOT_PRODUCER_BRANCH_AUTHORITY_UNRESOLVED':'SNAPSHOT_PRODUCER_BRANCH_AUTHORITY_QUALIFIED',sourceHash:hash(source),scenarioCount:all.length,pathCount:union.length,inventoryDigest:digest,baselineDigest:inventory.digest,
  dispositionCounts:Object.fromEntries([...new Set(review.map(r=>r.disposition))].map(d=>[d,review.filter(r=>r.disposition===d).length])),unresolvedRanges,unresolvedOptional,ranges:review,optionality:optional,requirements:requirementReview(rows),additionalScenarios,attacks};
 const oldByPath=new Map(inventory.inventory.map(r=>[r.path,r]));
 const shapeChanges=union.filter(r=>JSON.stringify(r.shapes)!==JSON.stringify(oldByPath.get(r.path)?.shapes)).map(r=>({path:r.path,oldShapes:oldByPath.get(r.path)?.shapes,newShapes:r.shapes,producer:'getSeaSurfaceTemperaturePoint -> resolveProviderCoordinates',reason:'Raw provider coordinates remain null when omitted; legacy request-coordinate fallback is separately preserved.'}));
 assert.equal(shapeChanges.length,8);content.shapeChanges=shapeChanges;
 const surface={version:'pelora-snapshot-producer-surface-v4',status:'PRODUCER_REACHABILITY_REVIEW_ONLY_NOT_PROJECTION_AUTHORITY',scenarioCount:all.length,pathCount:union.length,digest,inventory:union,shapeChanges};
  if(process.env.PELORA_WRITE_BRANCH_REVIEW==='1')writeFileSync(path('docs/Candidate_Snapshot_Branch_Optionality_Review_v1.json'),JSON.stringify(content,null,2)+'\n');
 if(process.env.PELORA_WRITE_BRANCH_REVIEW==='1')writeFileSync(path('docs/Candidate_Snapshot_Producer_Surface_v4.json'),JSON.stringify(surface)+'\n');
  if(existsSync(path('docs/Candidate_Snapshot_Branch_Optionality_Review_v1.json')))assert.deepEqual(read('docs/Candidate_Snapshot_Branch_Optionality_Review_v1.json'),JSON.parse(JSON.stringify(content)));
 if(existsSync(path('docs/Candidate_Snapshot_Producer_Surface_v4.json')))assert.deepEqual(read('docs/Candidate_Snapshot_Producer_Surface_v4.json'),surface);
 assert(!existsSync(path('docs/Candidate_Semantic_Projection_v3_Proposed_Delta_v2.json')));assert(!existsSync(path('docs/Candidate_Snapshot_Authority_Freeze_v2.json')));
 console.log('REVIEW_RESULT',JSON.stringify({verdict:content.verdict,counts:content.dispositionCounts,unresolvedOptional,digest,paths:union.length}));
});

test('all historical failed artifacts and quarantined drafts remain byte-identical',()=>{
 for(const [file,digest] of Object.entries(read('docs/Candidate_Snapshot_Harness_v2_Preservation.json').expectedHashes))assert.equal(hash(readFileSync(path(file))),digest,file);
});
