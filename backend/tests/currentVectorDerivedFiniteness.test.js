import assert from 'node:assert/strict';
import {test} from 'node:test';
import {writeFileSync} from 'node:fs';
import {runCurrent,nonfinitePaths} from './fixtures/currentVectorDerivedFinitenessFixture.mjs';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {captureCurrentEvidenceV1} from '../currentEvidenceCapture.mjs';
import {captureCurrentEvidenceV2,replayCurrentEvidenceSourceV2} from '../currentEvidenceCaptureV2.mjs';
import {buildCurrentVectorProjectionAnalysis,buildObservationSnapshot} from '../server.js';
import {exactJson} from '../exactScientificEvidence.mjs';
import {projectCandidateSemanticSurfacesV1} from '../candidateSemanticProjection.mjs';
import {projectCandidateSemanticSurfacesV2} from '../candidateSemanticProjectionV2.mjs';
import {copy as publicationCopy} from '../../shared/oceanPublication.mjs';
const MAX=Number.MAX_VALUE,evidence={cases:[],boundaries:[],capture:null};
const pairs=[['++',MAX,MAX],['+-',MAX,-MAX],['-+',-MAX,MAX],['--',-MAX,-MAX],
 ['extreme-ordinary',MAX,1],['extreme-positive-zero',MAX,0],['extreme-negative-zero',MAX,-0],
 ['zero++',0,0],['zero+-',0,-0],['zero-+',-0,0],['zero--',-0,-0],
 ['subnormal++',Number.MIN_VALUE,Number.MIN_VALUE],['subnormal-+',-Number.MIN_VALUE,Number.MIN_VALUE],
 ['intermediate-overflow',1e200,1],['ordinary',.5,.2]];
for(const [id,u,v]of pairs)test(`actual current derivations ${id}`,async t=>{
 const result=await runCurrent(t,{all:[u,v]});
 assert.equal(result.requests.length,5);
 assert.ok(Number.isFinite(result.point.eastwardMetersPerSecond));
 assert.ok(Number.isFinite(result.point.northwardMetersPerSecond));
 assert.ok(Number.isFinite(result.point.directionDegrees));
 if(Math.abs(u)===MAX&&Math.abs(v)===MAX){
  assert.equal(result.point.speedKnots,null);
  assert.equal(result.point.source.availability,'available');
  assert.equal(result.projection.available,true);assert.equal(result.projection.coverage,'complete');
  assert.ok(result.projection.projections.every(p=>p.vectorMagnitudeMetersPerSecond===Infinity));
 }
 if(id==='intermediate-overflow'){
  assert.equal(result.point.speedKnots,null);
  assert.ok(result.projection.projections.every(p=>Number.isFinite(p.vectorMagnitudeMetersPerSecond)));
 }
 const bad=nonfinitePaths(result);assert.ok(!bad.some(p=>p.value==='NaN'));
 evidence.cases.push({id,input:[u,v],result,nonfinite:bad});
});
test('opposing component deltas overflow after finite projection admission',async t=>{
 const result=await runCurrent(t,{all:[MAX,MAX],south:[-MAX,-MAX],west:[-MAX,-MAX]});
 assert.equal(result.gradient.available,true);assert.equal(result.gradient.coverage,'complete');
 const bad=nonfinitePaths(result.gradient);assert.ok(bad.length>0);
 assert.ok(bad.some(p=>p.path.endsWith('/eastwardDifferenceMetersPerSecond')));
 assert.ok(!bad.some(p=>p.value==='NaN'));
 assert.equal(result.gradient.measurements.maximumTotalVectorGradientMetersPerSecondPerNauticalMile,null);
 evidence.cases.push({id:'opposing-extremes',result,nonfinite:nonfinitePaths(result)});
});
test('adjacent binary64 overflow boundaries of the two actual magnitude algorithms',()=>{
 const view=new DataView(new ArrayBuffer(8));const value=bits=>{view.setBigUint64(0,bits);return view.getFloat64(0);};
 for(const [id,operation]of [['square-sum-sqrt',x=>Math.sqrt(x**2+x**2)],['hypot',x=>Math.hypot(x,x)]]){
  let low=0n,high=0x7fefffffffffffffn;
  while(high-low>1n){const mid=(low+high)/2n;if(Number.isFinite(operation(value(mid))))low=mid;else high=mid;}
  assert.ok(Number.isFinite(operation(value(low))));assert.equal(operation(value(high)),Infinity);
  evidence.boundaries.push({id,lastFiniteInput:value(low),firstOverflowInput:value(high),lastBits:low.toString(16),firstBits:high.toString(16)});
 }
});
test('capture admission, exact replay and projection admission are separate contracts',async t=>{
 const {spatial}=await runCurrent(t,{all:[MAX,MAX]});
 const captureInput=captureFixture('CURRENTS');
 const template=captureInput.samples[0].point;
 captureInput.samples=spatial.vectors.map(vector=>({role:vector.direction,outcome:'FULFILLED',
  point:Object.fromEntries(Object.keys(template).map(k=>[k,vector[k]]))}));
 assert.throws(()=>captureCurrentEvidenceV1(captureInput));assert.throws(()=>captureCurrentEvidenceV2(captureInput));
 // Schema/replay diagnostic only: no production claim for this unavailable-source substitution.
 for(const sample of captureInput.samples)sample.point.source={...sample.point.source,availability:'unavailable'};
 const captured=captureCurrentEvidenceV2(captureInput),replay=replayCurrentEvidenceSourceV2(captured);
 const projected=buildCurrentVectorProjectionAnalysis({vectors:replay.samples.map(s=>({direction:s.role,...s.point}))});
 assert.ok(nonfinitePaths(projected).some(p=>p.path.endsWith('/vectorMagnitudeMetersPerSecond')));
 assert.throws(()=>exactJson(projected));assert.doesNotThrow(()=>exactJson({u:MAX,v:MAX}));
 evidence.capture={productionAvailablePartial:'REJECTED_V1_V2',diagnosticUnavailableCapture:'ACCEPTED_V2',
  diagnosticNotProduction:true,replay:'REPLAY_EQUIVALENCE_PRESERVES_DERIVATION_FAILURE',nonfinite:nonfinitePaths(projected)};
});
test('snapshot representation retains derived Infinity; strict comparison/publication copies reject it',async t=>{
 const {point,spatial,projection,gradient}=await runCurrent(t,{all:[MAX,MAX]});
 // Isolated representation boundary, production-derived values only. No Ocean Physics evaluation.
 const currents={...point,derived:{...point.derived,spatialAnalysis:{spatialStructure:spatial,vectorProjection:projection,gradient}}};
 const snapshot=buildObservationSnapshot({location:{latitude:25,longitude:-90},observations:{currents}});
 const paths=nonfinitePaths(snapshot);
 assert.ok(paths.some(p=>p.path.startsWith('/observations/currents/derived/spatialAnalysis/vectorProjection/')));
 assert.equal(snapshot.available,false); // No complete oceanEvidence supplied in this isolated boundary probe.
 assert.throws(()=>projectCandidateSemanticSurfacesV1({observationSnapshot:snapshot}));
 assert.throws(()=>projectCandidateSemanticSurfacesV2({observationSnapshot:snapshot}));
 assert.throws(()=>publicationCopy(snapshot));
 evidence.snapshot={boundaryProbeOnly:true,wholeEvaluationClaim:false,available:snapshot.available,nonfinite:paths,
  projectionV1:'REJECTED',projectionV2:'REJECTED',publicationStrictCopy:'REJECTED'};
});
test('save bounded current-only evidence',()=>{
 writeFileSync('.local/ocean-quarantine/task12b7e/evidence.json',JSON.stringify(evidence,(_k,v)=>
 typeof v==='number'&&!Number.isFinite(v)?{nonfinite:String(v)}:Object.is(v,-0)?{signedZero:'-0'}:v,2)+'\n');
});
