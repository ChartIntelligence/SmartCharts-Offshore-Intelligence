import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {run,inward} from './fixtures/convergenceContractFixture.mjs';
import {buildMixingZoneAnalysis,buildEnvironmentalTransitionAnalysis,buildOceanOrganizationAnalysis,assessOceanEvidence,buildObservationSnapshot} from '../server.js';
const evidence={runtime:[],substitution:[],replay:null};
after(()=>{if(process.env.PELORA_WRITE_CONVERGENCE==='1')writeFileSync('.local/ocean-quarantine/task12b6v/evidence.json',JSON.stringify(evidence,null,2)+'\n');});
const get=o=>o.currents.derived.spatialAnalysis.convergence;
function summary(o){const e=o.oceanEvidence;return {current:o.currents,convergence:get(o),group:e.groups.current,snapshotConvergence:o.observationSnapshot.observations.currents.derived.spatialAnalysis.convergence,mixing:e.mixingZoneAnalysis,transition:e.environmentalTransitionAnalysis,organization:e.oceanOrganization};}
test('default-chain candidate preserves exact production handoffs, without a borrowed Boolean',async t=>{
 const {ocean:o}=await run(t,{current:'convergenceOnly'},Date.parse('2501-01-01'));
 const c=get(o);assert.equal(c.available,true);assert.equal(c.convergenceType,'convergence-candidate');assert.equal(c.convergenceState,'candidate');assert.equal(Object.hasOwn(c,'currentConvergenceDetected'),false);
 assert.deepEqual(c,o.oceanEvidence.groups.current.spatialAnalysis.convergence);
 assert.deepEqual(c,o.observationSnapshot.observations.currents.derived.spatialAnalysis.convergence);
 assert.equal(o.oceanEvidence.environmentalTransitionAnalysis.evidence.hydrodynamicSignalCount,0);
 evidence.witness=summary(o);evidence.rootKeys=Object.keys(o);
});
test('accepted current-state and radial threshold matrix records actual default outcomes',async t=>{
 const cases=[['empty',{current:'missing'}],['rejected',{currentRejected:true}],['uniform',{}],['candidate',{current:'convergenceOnly'}],['pronounced',{vectors:inward(.2)}],['partial',{current:'convergenceOnly',missingRoles:['east','west']}],['missing-time',{current:'convergenceOnly',currentTime:null}],['future-time',{current:'convergenceOnly',currentTime:'2026-09-27T00:00:00Z'}],['stale',{current:'convergenceOnly',currentTime:'2020-01-01T00:00:00Z'}],... [.0499,.05,.0501,.1499,.15,.1501].map(speed=>['radial-'+speed,{vectors:inward(speed)}])];
 for(let i=0;i<cases.length;i++){const [id,config]=cases[i];try{const {ocean:o}=await run(t,config,Date.parse('2510-01-01')+i*86400000);assert(!Object.hasOwn(get(o),'currentConvergenceDetected'));evidence.runtime.push({id,config,result:summary(o)});}catch(error){evidence.runtime.push({id,config,error:String(error)});if(!['future-time','missing-time'].includes(id))throw error;}}
 const expected={empty:'unavailable',rejected:'unavailable',uniform:'localized-inward-flow',candidate:'convergence-candidate',pronounced:'pronounced-convergence-candidate',partial:'unavailable','missing-time':'unavailable','future-time':'unavailable',stale:'convergence-candidate','radial-0.0499':'no-convergence-candidate','radial-0.05':'convergence-candidate','radial-0.0501':'convergence-candidate','radial-0.1499':'convergence-candidate','radial-0.15':'pronounced-convergence-candidate','radial-0.1501':'pronounced-convergence-candidate'};
 for(const row of evidence.runtime)assert.equal(row.result?.convergence.convergenceType,expected[row.id],row.id);
});
test('DIAGNOSTIC ONLY: strict Boolean substitution changes three consumers; not producer qualification',async t=>{
 const {ocean:o}=await run(t,{current:'convergenceOnly'},Date.parse('2520-01-01'));
 const base=o.oceanEvidence;
 for(const [label,value]of [['missing',undefined],['false',false],['true',true],['one',1],['string','true'],['null',null]]){
  const current=structuredClone(base.groups.current);if(label!=='missing')current.spatialAnalysis.convergence.currentConvergenceDetected=value;
  const args={...base,temperature:base.groups.temperature,current};
  const mixing=buildMixingZoneAnalysis(args),transition=buildEnvironmentalTransitionAnalysis(args),organization=buildOceanOrganizationAnalysis(args);
  for(const r of [mixing,transition,organization])assert.equal(r.evidence.convergenceDetected,label==='true');
  evidence.substitution.push({label,mixing,transition,organization});
 }
 assert.deepEqual(evidence.substitution[0].transition,evidence.substitution[1].transition);
 assert.equal(evidence.substitution[2].transition.evidence.hydrodynamicSignalCount,1);
});
test('DIAGNOSTIC ONLY: recomposed snapshot carries substituted results without runtime mutation',async t=>{
 const {ocean:o}=await run(t,{current:'convergenceOnly'},Date.parse('2530-01-01'));
 const currents=structuredClone(o.currents);currents.derived.spatialAnalysis.convergence.currentConvergenceDetected=true;
 const assessed=assessOceanEvidence({latitude:25,longitude:-90,sst:o.sst,chlorophyll:o.chlorophyll,currents,dataQuality:o.dataQuality});
 for(const key of ['confidence','summary','environmentalOpportunityEvidence']){assert(assessed[key]!==undefined,key);assert.deepEqual(assessed[key],o.oceanEvidence[key],key);}
 evidence.unchangedDiagnosticConsumers=['confidence','summary','environmentalOpportunityEvidence'];
 const snap=buildObservationSnapshot({location:{latitude:25,longitude:-90},observedAt:'2026-09-24T00:00:00Z',generatedAt:'2026-09-26T01:00:00Z',observations:{currents},oceanEvidence:assessed,dataQuality:o.dataQuality});
 assert.equal(snap.oceanPhysics.environmentalTransitionAnalysis.evidence.convergenceDetected,true);
 assert.equal(Object.hasOwn(get(o),'currentConvergenceDetected'),false);
 evidence.diagnosticSnapshot={original:o.observationSnapshot.oceanPhysics,substituted:snap.oceanPhysics,originalOrganization:o.observationSnapshot.oceanOrganization,substitutedOrganization:snap.oceanOrganization};
});
test('current cache replay preserves candidate and consumer facts at identical explicit assessment',async t=>{
 const a=await run(t,{current:'convergenceOnly'},Date.parse('2540-01-01')),b=await run(t,{current:'convergenceOnly'},Date.parse('2540-01-01')+1000),c=await run(t,{current:'convergenceOnly'},Date.parse('2541-01-01'));
 for(const x of [b,c]){assert.deepEqual(get(a.ocean),get(x.ocean));assert.deepEqual(a.ocean.observationSnapshot.oceanPhysics,x.ocean.observationSnapshot.oceanPhysics);}
 assert(a.requests.length>b.requests.length);evidence.replay={requests:[a.requests.length,b.requests.length,c.requests.length],equal:true};
});

test('candidate/consumer output is independent of inert captain context and exposes no second-stage Boolean',async t=>{
 const a=await run(t,{current:'convergenceOnly'},Date.parse('2550-01-01'));
 const b=await run(t,{current:'convergenceOnly',extras:{captain:{id:'synthetic'},boat:'synthetic',origin:[0,0],range:99,mission:'synthetic',Auth:'synthetic',fishingLog:[{catch:'synthetic'}]}},Date.parse('2551-01-01'));
 assert.deepEqual(get(a.ocean),get(b.ocean));assert.deepEqual(a.ocean.observationSnapshot.oceanPhysics,b.ocean.observationSnapshot.oceanPhysics);
 const base=a.ocean.oceanEvidence,current=structuredClone(base.groups.current);current.spatialAnalysis.convergence.currentConvergenceDetected=true;current.spatialAnalysis.convergence.convergenceState='not-supported';
 for(const f of [buildMixingZoneAnalysis,buildEnvironmentalTransitionAnalysis,buildOceanOrganizationAnalysis])assert.equal(f({...base,temperature:base.groups.temperature,current}).evidence.convergenceDetected,false);
 evidence.independence={inertPrivateContext:true,wrongStateWithTrueRejected:true};
});
