// Qualification-only assertions and a dependency truth table; no runtime normalizer or policy helper.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync,writeFileSync} from 'node:fs';
import {runCurrent,nonfinitePaths} from './fixtures/currentVectorDerivedFinitenessFixture.mjs';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {captureCurrentEvidenceV1,captureSampleAgeV1} from '../currentEvidenceCapture.mjs';
import {captureCurrentEvidenceV2,replayCurrentEvidenceSourceV2} from '../currentEvidenceCaptureV2.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
import {copy} from '../../shared/oceanPublication.mjs';
import {getCurrentConditionsPoint,getMoonConditions} from '../server.js';
import {currentQuality} from './fixtures/weatherMarineQualityFixture.mjs';
import {parsed} from './fixtures/marineAssessorCompanionFixture.mjs';
import {assessment} from './fixtures/sourceNormalizationFixture.mjs';
const evidence={};
const captureInput=p=>{const x=captureFixture('CURRENTS');x.samples[0].point=Object.fromEntries(Object.keys(x.samples[0].point).map(k=>[k,p[k]]));return x;};
test('actual independent heading and projection remain finite when normalized speed fails',async t=>{
 const r=await runCurrent(t,{all:[1e200,1]});
 assert.equal(r.point.speedKnots,null);assert.equal(r.point.directionDegrees,90);
 assert.equal(r.point.source.availability,'available');
 assert.ok(r.projection.projections.every(p=>Number.isFinite(p.vectorMagnitudeMetersPerSecond)));
 assert.equal(r.gradient.coverage,'complete');
 assert.ok(r.gradient.axisComparisons.every(a=>a.speedDifferenceKnots===null&&Number.isFinite(a.totalVectorGradientMetersPerSecondPerNauticalMile)));
 assert.equal(r.spatial.available,false); // speed-required consumer still refuses this vector group
 assert.throws(()=>captureCurrentEvidenceV2(captureInput(r.point)));
 evidence.independent={point:r.point,projection:r.projection,gradient:r.gradient,spatialAvailable:r.spatial.available};
});
test('failed projection norm cannot be rescued by finite alignment or source availability',async t=>{
 const r=await runCurrent(t,{all:[Number.MAX_VALUE,Number.MAX_VALUE]});
 assert.equal(r.projection.coverage,'complete');assert.equal(r.projection.available,true);
 assert.ok(r.projection.projections.every(p=>p.vectorMagnitudeMetersPerSecond===Infinity));
 assert.ok(r.projection.projections.some(p=>Number.isFinite(p.inwardAlignmentDegrees)));
 assert.throws(()=>exactJson(r.projection));assert.throws(()=>copy(r.projection));
 evidence.projection={current:r.projection,requiredOutcome:'Failed required norm invalidates projection bundle and alignment; source retained. Current code is not compliant.'};
});
test('opposing differences and gradient failure are local to required axis relationships',async t=>{
 const M=Number.MAX_VALUE,r=await runCurrent(t,{all:[M,M],south:[-M,-M],west:[-M,-M]});
 assert.equal(r.gradient.available,true);assert.equal(r.gradient.coverage,'complete');
 assert.ok(nonfinitePaths(r.gradient).some(p=>p.path.endsWith('/eastwardDifferenceMetersPerSecond')));
 assert.ok(Number.isFinite(r.point.directionDegrees));
 evidence.gradient={current:r.gradient,nonfinite:nonfinitePaths(r.gradient),requiredOutcome:'Failed axes excluded from valid counts; dependent facts blocked; heading is independent.'};
});
test('dependency truth-table attacks include finite final output with failed prerequisite',()=>{
 // Abstract Boolean/numeric contract counterexamples, not a proposed implementation algorithm.
 const cases=[
  {id:'failed-speed',source:true,required:[null],output:1,expected:false},
  {id:'failed-norm-finite-alignment',source:true,required:[Infinity],output:90,expected:false},
  {id:'failed-gradient',source:true,required:[Infinity],output:null,expected:false},
  {id:'multiple-failures',source:true,required:[null,Infinity],output:0,expected:false},
  {id:'independent-heading',source:true,required:[1e200,1],output:90,expected:true},
  {id:'source-inadmissible',source:false,required:[1,1],output:45,expected:false},
  {id:'negative-zero',source:true,required:[-0,0],output:-0,expected:true},
  {id:'nonfinite-result',source:true,required:[1,1],output:NaN,expected:false}
 ];
 for(const c of cases)assert.equal(c.source&&c.required.every(Number.isFinite)&&Number.isFinite(c.output),c.expected,c.id);
 evidence.dependencyAttacks=cases;
});
test('all four zero pairs and ordinary control keep legitimate finite evidence',async t=>{
 const rows=[];
 for(const [u,v]of [[0,0],[0,-0],[-0,0],[-0,-0],[.5,.2]]){
  const r=await runCurrent(t,{all:[u,v]});assert.equal(r.point.source.availability,'available');
  assert.equal(nonfinitePaths(r).length,0);assert.equal(r.projection.coverage,'complete');
  rows.push({input:[u,v],point:r.point});
 }
 assert.notEqual(exactJson({u:-0,v:0}),exactJson({u:0,v:0}));evidence.controls=rows;
});
test('source null and missing are not finite components or arithmetic failure',async t=>{
 const rows=[];
 for(const components of [{u_current:null,v_current:1},{v_current:1},{}]){
  const mock=t.mock.method(globalThis,'fetch',async input=>{
   assert.equal(new URL(input).hostname,'coastwatch.noaa.gov');
   const data={time:'2026-09-24T00:00:00Z',latitude:25,longitude:-90,...components};
   return {ok:true,json:async()=>({table:{columnNames:Object.keys(data),rows:[Object.values(data)]}})};
  });
  try{const p=await getCurrentConditionsPoint(25,-90,assessment);assert.equal(p.source.availability,'no-valid-pixel');
   assert.equal(p.eastwardMetersPerSecond,null);assert.equal(p.directionDegrees,null);rows.push({components,point:p});
  }finally{mock.mock.restore();}
 }
 evidence.missing=rows;
});
test('existing time rules still govern preserved captured components',()=>{
 const f=captureFixture('CURRENTS'),c=captureCurrentEvidenceV1(f);
 assert.equal(captureSampleAgeV1(c,'center',assessment),1);
 assert.equal(captureSampleAgeV1(c,'center',{...assessment,assessmentAt:'2026-09-30T01:00:00Z'}),145);
 assert.throws(()=>captureSampleAgeV1(c,'center',{...assessment,assessmentAt:'2026-09-23T01:00:00Z'}));
 f.samples[0].point.observedAt=null;assert.throws(()=>captureSampleAgeV1(captureCurrentEvidenceV1(f),'center',assessment));
 evidence.temporal={ageHours:[1,145],future:'REJECTED_FOR_ASSESSMENT',missingTime:'NO_REASSESSABLE_AGE',finiteArithmeticOverridesTime:false};
});
test('capture preserves eligible normalized evidence without promising future derived validity',async t=>{
 const r=await runCurrent(t,{all:[.5,.2]}),input=captureInput(r.point),c=captureCurrentEvidenceV2(input);
 assert.equal(exactJson(replayCurrentEvidenceSourceV2(c).samples),exactJson(input.samples));
 const extreme=await runCurrent(t,{all:[Number.MAX_VALUE,Number.MAX_VALUE]});
 assert.throws(()=>captureCurrentEvidenceV1(captureInput(extreme.point)));
 assert.throws(()=>captureCurrentEvidenceV2(captureInput(extreme.point)));
 evidence.capture={ordinary:'EXACT',actualAvailablePartial:'REJECTED',sourceRelabelled:false};
});
test('speed-requiring quality fails locally and preserved old evidence does not become live',async t=>{
 const marine=await parsed(t),r=await runCurrent(t,{all:[1e200,1]});
 const context={currents:r.point,chlorophyll:{...captureFixture('CHLOROPHYLL_DIRECT').samples[0].point,ageHours:1},
  moon:getMoonConditions(assessment.assessmentAt),chlorophyllResult:{status:'fulfilled'},gapFilledChlorophyllResult:{status:'fulfilled'},currentsResult:{status:'fulfilled'}};
 const failed=currentQuality(marine,context);
 assert.equal(failed.layers.currents.state,'unavailable');
 assert.equal(failed.layers.currents.reason,'available'); // Existing source-state fallback is not an arithmetic cause.
 const ordinary=await runCurrent(t,{all:[.5,.2]});
 const old=currentQuality(marine,{...context,currents:{...ordinary.point,ageHours:145}});
 assert.equal(old.layers.currents.state,'stale');
 evidence.quality={failed:failed.layers.currents,old:old.layers.currents,requiredReason:'Truthful derived cause, not inherited source available'};
});
test('normative document reconciles stricter capture rather than silently overriding it',()=>{
 const doc=readFileSync('docs/Current_Vector_Failure_Locality_Contract_v1.md','utf8');
 for(const rule of ['SOURCE PRESERVATION','DERIVED-FACT LOCALITY','DEPENDENCY PROPAGATION','INDEPENDENT RECOMPUTATION','FINITE-RESULT REQUIREMENT','AVAILABILITY LOCALITY','COVERAGE LOCALITY','QUALITY LOCALITY','SIGNED ZERO','MISSINGNESS','TEMPORAL/PROVENANCE','REPLAY','HISTORY','SPECIES NEUTRALITY'])assert.ok(doc.includes(rule),rule);
 assert.ok(doc.includes('not every preserved component-only point is capturable'));
 assert.ok(doc.includes('Do not change source availability'));
 assert.ok(doc.includes('NO_NEW_ENUM_REQUIRED'));
});
test('save bounded evidence with explicit nonfinite and signed-zero diagnostic tags',()=>{
 writeFileSync('.local/ocean-quarantine/task12b7f-locality/evidence.json',JSON.stringify(evidence,(_k,v)=>
 typeof v==='number'&&!Number.isFinite(v)?{nonfinite:String(v)}:Object.is(v,-0)?{signedZero:'-0'}:v,2)+'\n');
});
