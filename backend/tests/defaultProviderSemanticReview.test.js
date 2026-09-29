// A passing STOP diagnostic does not qualify the original nine-area model.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {run,scenarios,profiler,count,source} from './fixtures/defaultProviderSemanticReviewFixture.mjs';
const review=JSON.parse(readFileSync(new URL('../../docs/Default_Provider_Semantic_Review_v1.json',import.meta.url)));

test('nine-area ledger preserves exact 12B.6Q descriptions and limitations without adding a tenth',()=>{
 const md=readFileSync(new URL('../../docs/Default_Provider_Transitive_Review_v1.md',import.meta.url),'utf8');
 const descriptions=[...md.split('## Work still required')[1].split('\n\n')[1].matchAll(/^\d\. (.+)$/gm)].map(m=>m[1].trim());
 const diagnostic=JSON.parse(readFileSync(new URL('../../docs/Default_Provider_Transitive_Review_v1.json',import.meta.url)));
 assert.equal(review.ledger.length,9);assert.deepEqual(review.ledger.map(r=>r.description),descriptions);
 for(const [i,r]of review.ledger.entries()){assert.equal(r.reviewId,'SEMANTIC_REVIEW_'+String(i+1).padStart(2,'0'));assert.equal(r.statedLimitation,diagnostic.branchReview.openReviewObligations[i].reason);assert.equal(r.disposition,'BLOCKING_UNRESOLVED');}
 assert.equal(review.newArea.appendedToNineAreaLedger,false);
});

test('accepted default chain executes distinct lunar phase branches and retains scientific values',async t=>{
 const p=await profiler();try{
  const a=await run(t,scenarios[0]),ac=await p.take();
  const b=await run(t,scenarios[1],Date.parse('2080-01-02')),bc=await p.take();
  assert.equal(a.ocean.moon.phase,'full-moon');assert.equal(b.ocean.moon.phase,'waning-gibbous');
  assert(count(ac,'full-moon')>0);assert.equal(count(ac,'waning-gibbous'),0);assert.equal(count(bc,'full-moon'),0);assert(count(bc,'waning-gibbous')>0);
  for(const [i,r]of [a,b].entries()){
   assert.equal(r.ocean.observationSnapshot.available,true);
   assert.deepEqual(r.ocean.observationSnapshot.observations.moon,r.ocean.moon);
   assert.notEqual(r.ocean.observationSnapshot.observations.moon,r.ocean.moon);
   assert.equal(r.ocean.moon.observedAt,new Date(scenarios[i].assessmentAt).toISOString());
   assert.equal(r.ocean.moon.source.availability,'available');
   assert.equal(r.ocean.dataQuality.layers.moon.state,'calculated');
  }
  assert.notEqual(a.ocean.moon.phaseFraction,b.ocean.moon.phaseFraction);
  assert.notEqual(a.ocean.moon.illuminationPercent,b.ocean.moon.illuminationPercent);
  assert.deepEqual(a.requests,b.requests,'Same environmental request identities; explicit assessment changes lunar calculation');
 }finally{await p.close();}
});

test('lunar values follow assessment rather than cache/execution time under reverse and duplicate runs',async t=>{
 const expected=new Map();let execution=0;for(const order of [scenarios,[...scenarios].reverse(),[scenarios[1],scenarios[0],scenarios[0],scenarios[1]]])for(const s of order){
  const clock=Date.parse('2090-01-01')+(execution++)*86400000;
  const cold=await run(t,s,clock),warm=await run(t,s,clock+1000);
  if(!expected.has(s.id))expected.set(s.id,cold.ocean.moon);
  assert.deepEqual(cold.ocean.moon,expected.get(s.id));assert.deepEqual(warm.ocean.moon,expected.get(s.id));
  assert.deepEqual(warm.ocean.observationSnapshot.observations.moon,expected.get(s.id));
  assert(warm.requests.length<cold.requests.length);
 }
});

test('source binding and existing root scientific category exclude documentary demotion',()=>{
 const start=source.indexOf('async function getOceanConditionsAtAssessment('),snapshot=source.indexOf('const observationSnapshot =',start);
 assert(start>=0&&snapshot>start);assert(source.slice(start,snapshot).includes('getMoonConditions(assessment.assessmentAt)'));
 const call=source.slice(snapshot,source.indexOf('const backendSupabaseConfiguration',snapshot));assert(/currents,\s*moon\s*}/.test(call));
 const manifest=JSON.parse(readFileSync(new URL('../../docs/Candidate_Semantic_Surfaces_v1.json',import.meta.url)));
 for(const key of ['phase','phaseFraction','lunarAgeDays','illuminationPercent','observedAt'])assert.equal(manifest.reviewedPaths.find(p=>p[0]==='/moon/'+key)?.[1],'currentOceanScientificEvidence');
 // This reads a locked category, not a proposed registry or new snapshot permission.
});

test('new-area STOP preserves unqualified status and all forbidden-work boundaries',()=>{
 assert.equal(review.verdict,'DEFAULT_PROVIDER_SEMANTIC_MODEL_INCOMPLETE');assert.equal(review.qualified,false);
 assert.deepEqual(review.dispositionCounts,{SEMANTIC_REACHABLE:0,SEMANTIC_UNREACHABLE_ENFORCED:0,OPERATIONAL_EQUIVALENT:0,OUTSIDE_DEFAULT_DOMAIN:0,BLOCKING_UNRESOLVED:9});
 assert.equal(review.newArea.whyOutsideNine.length,9);
 for(const key of ['compactQualifiedBranchModelCreated','optionalityQualified','requirementAuthorityCreated','authorityProposalCreated','authorityFreezeCreated','projectionV3Created','productionChanged','injectedProviderQualified'])assert.equal(review[key],false,key);
});

test('preservation evidence is internally consistent without importing protected drafts',()=>{
 const p=JSON.parse(readFileSync(new URL('../../docs/Default_Provider_Semantic_Review_Preservation_v1.json',import.meta.url)));assert.equal(p.files.length,48);
 for(const f of p.files){assert.match(f.before,/^[a-f0-9]{64}$/);assert.equal(f.before,f.after);assert.equal(f.unchanged,true);}
});
