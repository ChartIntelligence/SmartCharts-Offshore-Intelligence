import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {run,inward} from './fixtures/convergenceDecisionFixture.mjs';
const evidence={cases:[]};
after(()=>{if(process.env.PELORA_WRITE_CONVERGENCE_DECISION==='1')writeFileSync('.local/ocean-quarantine/task12b6w/evidence.json',JSON.stringify(evidence,null,2)+'\n');});
async function record(t,id,config,clock){const {ocean:o}=await run(t,{current:'convergenceOnly',...config},clock);const s=o.currents.derived.spatialAnalysis;const row={id,config,convergence:s.convergence,spatial:s.spatialStructure,projection:s.vectorProjection,shear:s.shear,edge:s.edge,currentGroup:{available:o.oceanEvidence.groups.current.available,classification:o.oceanEvidence.groups.current.classification},transition:o.oceanEvidence.environmentalTransitionAnalysis,organization:o.oceanEvidence.oceanOrganization};assert(!Object.hasOwn(row.convergence,'currentConvergenceDetected'));evidence.cases.push(row);return row;}
test('directional missingness and center independence through unchanged default chain',async t=>{
 const cases=[['all',{},'candidate'],['one-missing',{missingRoles:['east']},'candidate'],['two-missing',{missingRoles:['east','west']},'insufficient-evidence'],['center-missing',{missingRoles:['center']},'candidate'],['unavailable',{currentRejected:true},'insufficient-evidence'],['future-one',{currentTimes:{north:'2026-09-27T00:00:00Z'}},'candidate'],['untimed-one',{currentTimes:{north:null}},'candidate'],['future-all',{currentTime:'2026-09-27T00:00:00Z'},'insufficient-evidence'],['untimed-all',{currentTime:null},'insufficient-evidence']];
 for(let i=0;i<cases.length;i++){const[id,c,state]=cases[i];const r=await record(t,id,c,Date.parse('2600-01-01')+i*86400000);assert.equal(r.convergence.convergenceState,state,id);}
});
test('accepted vectors can have different represented times without a convergence coherence gate',async t=>{
 const r=await record(t,'heterogeneous-times',{currentTimes:{north:'2026-09-24T00:00:00Z',east:'2026-09-25T00:00:00Z',south:'2020-01-01T00:00:00Z',west:'2026-09-26T00:00:00Z'}},Date.parse('2601-01-01'));
 assert.equal(r.convergence.convergenceState,'candidate');assert.equal(new Set(r.projection.projections.map(x=>x.observedAt)).size,4);
 const adjacent=await record(t,'adjacent-represented-times',{currentTimes:{north:'2026-09-24T00:00:00Z',east:'2026-09-25T00:00:00Z',south:'2026-09-24T00:00:00Z',west:'2026-09-25T00:00:00Z'}},Date.parse('2601-01-02'));
 assert.equal(adjacent.convergence.convergenceState,'candidate');assert.equal(new Set(adjacent.projection.projections.map(x=>x.observedAt)).size,2);
});
test('unequal inward magnitudes still satisfy the existing candidate rule',async t=>{
 const r=await record(t,'unequal-magnitudes',{vectors:{north:[0,-.06],east:[-1,0],south:[0,.06],west:[.2,0]}},Date.parse('2602-01-01'));
 assert.equal(r.convergence.convergenceState,'candidate');assert.equal(r.convergence.evidence.meanMeaningfulInwardMetersPerSecond,.33);
});
test('convergence and shear/edge are independent classifiers with possible overlap',async t=>{
 const a=await record(t,'low-inward',{},Date.parse('2603-01-01')),b=await record(t,'strong-inward',{vectors:inward(1)},Date.parse('2603-01-02')),c=await record(t,'shear-only',{current:'shear'},Date.parse('2603-01-03'));
 assert.equal(a.shear.currentShearDetected,false);assert.equal(a.edge.currentEdgeDetected,false);assert.equal(b.convergence.convergenceState,'candidate');assert.equal(c.shear.currentShearDetected,true);assert.notEqual(c.convergence.convergenceState,'candidate');
});
test('same evidence and assessment preserve candidate under later execution and cache hit',async t=>{
 const a=await record(t,'replay-cold',{},Date.parse('2604-01-01')),b=await record(t,'replay-warm',{},Date.parse('2604-01-01')+1000),c=await record(t,'replay-later',{},Date.parse('2605-01-01'));
 assert.deepEqual(a.convergence,b.convergence);assert.deepEqual(a.convergence,c.convergence);
});
