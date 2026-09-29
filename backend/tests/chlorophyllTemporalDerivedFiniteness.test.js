import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {endpoints,captureInput,consumers,history,run,encoded,leaves,extracted,times} from './fixtures/chlorophyllTemporalDerivedFinitenessFixture.mjs';
import {captureCurrentEvidenceV1} from '../currentEvidenceCapture.mjs';
import {captureCurrentEvidenceV2,serializeCurrentEvidenceCaptureV2,readCurrentEvidenceCaptureV2} from '../currentEvidenceCaptureV2.mjs';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
import {copy} from '../../shared/oceanPublication.mjs';
import {projectCandidateSemanticSurfacesV1} from '../candidateSemanticProjection.mjs';
import {projectCandidateSemanticSurfacesV2} from '../candidateSemanticProjectionV2.mjs';
import {buildFeaturePersistenceContract,buildTemporalFeatureContinuity,buildHistoricalSnapshotQuery,buildSeaSurfaceTemperaturePersistence,buildCurrentPersistence} from '../server.js';
import {frame,observation} from './fixtures/temporalEvidenceFixture.mjs';
const evidence={counterexamples:[],timeControls:[],valueControls:[],mixing:[],dependencies:[],siblings:[]};
for(const family of ['direct','gap'])test(family+' finite captured endpoints overflow actual productivity and clarity subtraction',async t=>{
 const points=await endpoints(t,family);
 for(const point of points){assert(Number.isFinite(point.concentrationMgM3));assert.equal(point.source.availability,'available');for(const capture of [captureCurrentEvidenceV1,captureCurrentEvidenceV2])assert.doesNotThrow(()=>capture(captureInput(point,family)));}
 for(const kind of Object.keys(consumers)){const r=run(points,kind);assert.equal(r.available,true);assert.equal(r.values.concentrationChangeMgM3,-Infinity);assert.equal(r.values.durationHours,24);assert.equal(r.confidence.score,60);assert.equal(r.confidence.level,'Moderate');assert.throws(()=>exactJson(r));evidence.counterexamples.push({family,kind,points,history:history(points,kind),result:r});}
});
test('positive overflow is symmetric; equal extreme endpoints do not fail',async t=>{
 for(const [values,want] of [[[-1e308,1e308],Infinity],[[1e308,1e308],0]]){const points=await endpoints(t,'direct',values);for(const kind of Object.keys(consumers))assert.equal(run(points,kind).values.concentrationChangeMgM3,want);}
});
test('positive time span is a gate, not a denominator for concentration change',async t=>{
 const points=await endpoints(t,'direct',[.3,.4]);
 for(const kind of Object.keys(consumers))for(const [name,dates]of [['equal',[times[0],times[0]]],['one-ms',[times[0],'2026-09-23T00:00:00.001Z']],['ordinary',times],['large-gap',['2020-01-01T00:00:00Z',times[1]]],['future',['2090-01-01T00:00:00Z','2090-01-02T00:00:00Z']]]){
 const rows=history(points,kind);rows.forEach((r,i)=>r.snapshot.observation.evidence.groups[kind].values.observedAt=dates[i]);const r=consumers[kind]({historicalSnapshots:rows});assert.equal(r.available,name!=='equal');if(r.available)assert.equal(r.values.concentrationChangeMgM3,.1);evidence.timeControls.push({kind,name,result:r});
 }for(const kind of Object.keys(consumers)){const rows=history(points,kind);assert.deepEqual(consumers[kind]({historicalSnapshots:rows}),consumers[kind]({historicalSnapshots:[...rows].reverse()}));}
});
test('ordinary value changes zero and subnormal rounding remain finite',async t=>{
 for(const values of [[.3,.3],[.3,.4],[.4,.3],[0,-0],[-0,0],[Number.MIN_VALUE,-Number.MIN_VALUE]]){const points=await endpoints(t,'direct',values);for(const kind of Object.keys(consumers)){const r=run(points,kind);assert(r.available);assert(Number.isFinite(r.values.concentrationChangeMgM3));evidence.valueControls.push({values,points,kind,result:r});}}
});
test('exact capture v2 preserves literal endpoint signed zero independently of source rounding',()=>{
 for(const family of ['CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED']){const input=captureFixture(family);input.samples[0].point.concentrationMgM3=-0;const minus=captureCurrentEvidenceV2(input);assert(Object.is(readCurrentEvidenceCaptureV2(serializeCurrentEvidenceCaptureV2(minus)).samples[0].point.concentrationMgM3,-0));input.samples[0].point.concentrationMgM3=0;assert.notEqual(minus.captureId,captureCurrentEvidenceV2(input).captureId);}
});
test('ordinary clarity label mismatch is separate from numeric finiteness',async t=>{
 const points=await endpoints(t,'direct',[.1,.1]);assert.equal(leaves.buildClarityEvidence(points[0]).classification,'clear-surface-water');assert.equal(run(points,'clarity').available,false);assert.equal(run(points,'clarity').values.sampleCount,0);assert.equal(run(points,'productivity').available,true);
});
test('same ID deduplicates; competing IDs at same support can inflate sample confidence with a later endpoint',async t=>{
 const points=await endpoints(t,'direct',[.3,.4]);for(const kind of Object.keys(consumers)){const rows=history(points,kind);assert.equal(consumers[kind]({historicalSnapshots:[rows[0],rows[0],rows[1]]}).values.sampleCount,2);const alias=structuredClone(rows[0]);alias.snapshot.identity.snapshotId='synthetic-revision';const r=consumers[kind]({historicalSnapshots:[rows[0],alias,rows[1]]});assert.equal(r.values.sampleCount,3);assert.equal(r.confidence.score,70);}
});
test('direct direct gap gap and mixed labels are processed without qualifying equivalence',async t=>{
 const d=await endpoints(t,'direct',[.3,.4]),g=await endpoints(t,'gap',[.3,.4]);for(const [name,points]of [['direct-direct',d],['gap-gap',g],['direct-gap',[d[0],g[1]]]])for(const kind of Object.keys(consumers)){const r=run(points,kind);assert(r.available);evidence.mixing.push({name,kind,result:r});}
});
test('missing null nonfinite and unavailable endpoint evidence is excluded',async t=>{
 const points=await endpoints(t);for(const kind of Object.keys(consumers))for(const value of [null,undefined,Infinity,-Infinity,NaN]){const rows=history(points,kind);rows[0].snapshot.observation.evidence.groups[kind].values.concentrationMgM3=value;const r=consumers[kind]({historicalSnapshots:rows});assert.equal(r.available,false);assert.equal(r.values.sampleCount,1);}
});
test('recorded stale and unknown freshness are accepted without historical as-of policy',async t=>{
 const points=await endpoints(t,'direct',[.3,.4]);for(const kind of Object.keys(consumers))for(const freshness of ['stale','unknown']){const rows=history(points,kind);for(const row of rows){row.snapshot.observation.evidence.groups[kind].values.freshness=freshness;row.snapshot.observation.evidence.groups[kind].values.ageHours=100000;}const r=consumers[kind]({historicalSnapshots:rows});assert(r.available);assert.equal(r.confidence.score,60);}
});
test('clarity rank is independent arithmetic but returned temporal object contains failed concentration change',async t=>{
 const points=await endpoints(t);for(const kind of Object.keys(consumers)){const r=run(points,kind),c=buildTemporalFeatureContinuity({featurePersistence:r});assert.equal(c.available,true);if(kind==='clarity')assert.equal(c.continuity.supported,true);assert(leaves.buildProductivityEvidence(points[0]).available);assert(leaves.buildClarityEvidence(points[0]).available);evidence.dependencies.push({kind,result:r,continuity:c});}
});
test('existing unavailable shape must clear dependent lifecycle and confidence as well as availability',async t=>{
 const points=await endpoints(t);for(const kind of Object.keys(consumers)){const r=run(points,kind);const flagOnly={...r,available:false};assert.equal(buildTemporalFeatureContinuity({featurePersistence:flagOnly}).available,true);
 const diagnostic=buildFeaturePersistenceContract({...r,available:false,classification:'unavailable',lifecycleState:null,reason:'qualification-only-arithmetic-failure',values:{...r.values,concentrationChangeMgM3:null},confidence:{score:0,level:'Unavailable'}});
 assert.equal(buildTemporalFeatureContinuity({featurePersistence:diagnostic}).available,false);assert.doesNotThrow(()=>exactJson(diagnostic));assert.equal(diagnostic.values.firstConcentrationMgM3,1e308);evidence.dependencies.push({kind,diagnosticShapeOnly:diagnostic,flagOnlyInsufficient:true});}
});
test('synthetic low-level wrapper is not an admitted production history storage record',async t=>{
 const points=await endpoints(t);for(const kind of Object.keys(consumers)){const query=buildHistoricalSnapshotQuery({historicalSnapshots:history(points,kind)});assert.equal(query.historicalSnapshots.length,0);assert.equal(query.available,false);}
});
test('qualified temporal primitive can represent finite endpoints but is not a chlorophyll history adapter',()=>{
 for(const family of ['CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED'])for(const value of [1e308,-1e308]){const f=frame(0,'original',value);f.product.family=family;f.product.evidenceClass=family.endsWith('DIRECT')?'DIRECT_OBSERVATION':'RECONSTRUCTED';f.payload.components[0].variableId='chlor_a';f.payload.components[0].unit='mg/m3';const o=observation(f);assert.equal(o.component.value,value);assert.equal(o.product.family,family);for(const consumer of Object.values(consumers))assert.equal(consumer({historicalSnapshots:[o]}).available,false);}
});
test('strict semantic and publication copy boundaries reject failed results; replay deterministically preserves failure',async t=>{
 const points=await endpoints(t);for(const kind of Object.keys(consumers)){const rows=history(points,kind),r=consumers[kind]({historicalSnapshots:rows});assert.deepEqual(r,consumers[kind]({historicalSnapshots:structuredClone(rows)}));for(const fn of [exactJson,copy,projectCandidateSemanticSurfacesV1,projectCandidateSemanticSurfacesV2])assert.throws(()=>fn({temporal:r}));}
});
test('same subtraction pattern exists in SST/current low-level persistence, not proof of source reachability',()=>{
 const rows=[1e308,-1e308].map((v,i)=>({snapshot:{available:true,identity:{snapshotId:'sibling-'+i},metadata:{time:{observedAt:times[i]}},observation:{observations:{sst:{temperatureFahrenheit:v},currents:{speedKnots:v,directionDegrees:90}}}}}));
 for(const [name,fn,key]of [['sst',buildSeaSurfaceTemperaturePersistence,'temperatureChangeFahrenheit'],['current',buildCurrentPersistence,'speedChangeKnots']]){const r=fn({historicalSnapshots:rows});assert.equal(r.values[key],-Infinity);evidence.siblings.push({name,result:r,scope:'synthetic low-level history; negative current speed is not default converter output'});}
});
test('history source-policy gates remain explicit and default retrieval has no qualified shared selector',()=>{
 const s=readFileSync(new URL('../server.js',import.meta.url),'utf8'),start=s.indexOf('const oceanMemoryRowRetrieval =',s.indexOf('async function getOceanConditionsAtAssessment')),call=s.slice(start,s.indexOf('const adaptedHistoricalStorageRecords',start));assert(call.includes('normalizedBearerToken'));assert(/maximumRows:\s*48/.test(call));assert(!call.includes('observedBefore'));const doc=readFileSync(new URL('../../docs/Temporal_History_Selection_Semantics_v1.md',import.meta.url),'utf8');assert(doc.includes('CONSUMER_AWARE_POLICY_REQUIRED'));assert(doc.includes('HISTORY_SELECTION_POLICY_REQUIRED'));
});
test('save diagnostic evidence only in ignored scratch',()=>{evidence.extracted=extracted;writeFileSync('.local/ocean-quarantine/chlorophyll-temporal/evidence.json',JSON.stringify(encoded(evidence),null,2)+'\n');});
