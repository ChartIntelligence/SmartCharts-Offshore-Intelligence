import {test} from 'node:test';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {fields,parse,encode,nonfinitePaths,leaves,mixedSst,historyDiagnostic,extracted} from './fixtures/crossRouteFinitenessAtomicityResumedFixture.mjs';
import {assessOceanConditions,buildProductivityPersistence,buildClarityPersistence} from '../server.js';
import {runCurrent} from './fixtures/currentVectorDerivedFinitenessFixture.mjs';
import {parsed,currentSupport,inputs} from './fixtures/marineAssessorCompanionFixture.mjs';
import {prepare,reconstruct} from './fixtures/exactMarineCaptureFixture.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {captureCurrentEvidenceV1} from '../currentEvidenceCapture.mjs';
import {captureCurrentEvidenceV2} from '../currentEvidenceCaptureV2.mjs';
import {captureMarineAssessorCompanionV1} from '../marineAssessorCompanionCapture.mjs';
const evidence={routes:[],conversions:[],marine:[],history:[]};
test('25 routes receive finite extreme, subnormal, signed zero and ordinary controls',async t=>{
 assert.equal(fields.length,25);
 for(const f of fields){const rows=[];for(const input of [1e308,-1e308,Number.MAX_VALUE,-Number.MAX_VALUE,Number.MIN_VALUE,-Number.MIN_VALUE,0,-0,2]){
 const r=await parse(t,f,Object.is(input,-0)?'negative-zero':'positive',input);rows.push({input:encode(input),value:encode(r.value),nonfinite:nonfinitePaths(r.result)});
 }evidence.routes.push({id:f.id,rows});}
});
test('six known conversion overflows remain and SST downstream rejects bad Fahrenheit',async t=>{
 for(const id of ['marine:sea_surface_temperature','sst:directional','marine:wind_speed_10m','marine:wind_gusts_10m','marine:wave_height','marine:swell_wave_height']){
  const f=fields.find(f=>f.id===id);for(const n of [1e308,-1e308]){const {result}=await parse(t,f,'positive',n);const bad=nonfinitePaths(result);assert(bad.length);assert(bad.every(p=>p.value===(n>0?'Infinity':'-Infinity')));
  if(id==='sst:directional'){assert.equal(result.validNeighborCount,0);assert.equal(result.coverage,'insufficient');}
  if(id==='marine:sea_surface_temperature')assert.equal(leaves.buildTemperatureEvidence(result.sst).available,false);
  evidence.conversions.push({id,input:n,nonfinite:bad});}}
});
test('marine null zero missing and conversion overflow retain distinct assessor and quality consequences',async t=>{
 const support=currentSupport(await parsed(t));
 for(const id of ['marine:wind_speed_10m','marine:wind_gusts_10m','marine:wave_height','marine:swell_wave_height']){
 for(const [name,value]of [['null',null],['positive-zero',0],['negative-zero',-0],['missing',undefined],['positive',1e308]]){
 const {result,value:normalized}=await parse(t,fields.find(f=>f.id===id),name,value);const assessor=assessOceanConditions(result),quality=support.quality(result);
 assert.equal(nonfinitePaths(assessor).length,0);assert.equal(nonfinitePaths(quality).length,0);
 evidence.marine.push({id,state:name,input:encode(value),normalized:encode(normalized),windAvailability:result.wind.source.availability,assessor,quality});}}
});
test('opposed extreme marine directions are reduced before subtraction; extreme periods remain finite',async t=>{
 const m=await parsed(t,{weather:{wind_direction_10m:Number.MAX_VALUE},marine:{wave_direction:-Number.MAX_VALUE,swell_wave_direction:Number.MAX_VALUE,wave_period:Number.MAX_VALUE,swell_wave_period:-Number.MAX_VALUE}});
 const r=assessOceanConditions(m);assert.equal(nonfinitePaths(r).length,0);evidence.directionPeriod=r;
});
test('SST opposite finite converted extrema remain finite through directional science',async t=>{
 const r=await mixedSst(t,{north:1e307,south:-1e307,east:1e307,west:-1e307});
 assert.equal(r.validNeighborCount,4);assert.equal(r.coverage,'sufficient');assert.equal(nonfinitePaths(r).length,0);evidence.sstSpatial=r;
});
test('chlorophyll immediate classification stays finite while malformed source findings are not reopened',async t=>{
 for(const parser of ['direct','gap'])for(const n of [1e308,-1e308,Number.MIN_VALUE,-0]){
 const {result}=await parse(t,fields.find(f=>f.id===parser+':chlor_a'),'positive',n);
 for(const leaf of [leaves.buildProductivityEvidence,leaves.buildClarityEvidence]){const r=leaf(result);assert(r.available);assert.equal(nonfinitePaths(r).length,0);}
 }
});
test('current locality preserves independent finite facts and rejects no production code here',async t=>{
 const independent=await runCurrent(t,{all:[1e200,1]}),failed=await runCurrent(t,{all:[Number.MAX_VALUE,Number.MAX_VALUE],south:[-Number.MAX_VALUE,-Number.MAX_VALUE]});
 assert.equal(independent.point.speedKnots,null);assert(Number.isFinite(independent.point.directionDegrees));assert.equal(nonfinitePaths(independent.projection).length,0);
 assert(nonfinitePaths(failed.projection).length);assert(nonfinitePaths(failed.gradient).length);evidence.current={independent,failed};
});
test('finite normalized chlorophyll endpoints can overflow temporal difference: bounded consumer diagnostic',async t=>{
 for(const parser of ['direct','gap']){
 const points=[];for(const [n,time]of [[1e308,'2026-09-23T00:00:00Z'],[-1e308,'2026-09-24T00:00:00Z']]){
  const {result}=await parse(t,fields.find(f=>f.id===parser+':chlor_a'),'positive',n,{rowOverrides:{time}});points.push(result);
  const source=captureFixture(parser==='direct'?'CHLOROPHYLL_DIRECT':'CHLOROPHYLL_GAP_FILLED');
  source.samples[0].point=Object.fromEntries(Object.keys(source.samples[0].point).map(k=>[k,result[k]]));
  assert.doesNotThrow(()=>captureCurrentEvidenceV1(source));assert.doesNotThrow(()=>captureCurrentEvidenceV2(source));
 }
 for(const [kind,producer]of [['productivity',buildProductivityPersistence],['clarity',buildClarityPersistence]]){
 const r=producer({historicalSnapshots:historyDiagnostic(points,kind)});assert.equal(r.available,true);assert.equal(r.values.concentrationChangeMgM3,-Infinity);assert.throws(()=>exactJson(r));
 evidence.history.push({parser,kind,points,result:r,endpointsAcceptedByCurrentCaptureV1V2:true,boundary:'Actual normalized points and verbatim leaf science; synthetic historical container; no database/default history integration claim'});
 }}
});
test('capture schemas represent paired missing SST but reject nonfinite and available partial current',()=>{
 for(const capture of [captureCurrentEvidenceV1,captureCurrentEvidenceV2]){
 const s=captureFixture('SST');s.samples[0].point.temperatureCelsius=null;s.samples[0].point.temperatureFahrenheit=null;s.samples[0].point.source.availability='unavailable';assert.doesNotThrow(()=>capture(s));
 s.samples[0].point.temperatureCelsius=1e308;s.samples[0].point.temperatureFahrenheit=Infinity;assert.throws(()=>capture(s));
 const c=captureFixture('CURRENTS');c.samples[0].point.speedKnots=null;assert.throws(()=>capture(c));
 }evidence.capture='Corrected coherent null shape accepted; nonfinite and available partial rejected; no source-state rewrite licensed';
});
test('exact marine captures distinguish null and zero and replay corrected-shape diagnostics',async t=>{
 const original=await parsed(t);const modified=structuredClone(original);modified.wind.speedKnots=null;modified.wind.gustKnots=null;modified.waves.heightFeet=null;modified.swell.heightFeet=null;
 const a=prepare(original),b=prepare(modified),replay=reconstruct(b.wires,b.refs,b.support);
 assert.notEqual(a.wires.quality,b.wires.quality);assert.equal(exactJson(replay.B),exactJson(b.A));assert.equal(replay.r.wind.speedKnots,null);
 const legacy=inputs(modified);assert.doesNotThrow(()=>captureMarineAssessorCompanionV1(legacy.input,legacy.q));
 evidence.marineCaptures={boundary:'SCHEMA_ONLY_CORRECTED_SHAPE_NOT_NEW_NORMALIZER',exactReplay:true,contentIdentityDiffers:true,legacyQualityAndCompanionAccepted:true};
});
test('save bounded resumed evidence and extracted function hashes',()=>{
 evidence.extracted=extracted;writeFileSync('.local/ocean-quarantine/task12b7dr/evidence.json',JSON.stringify(evidence,(_k,v)=>typeof v==='number'&&!Number.isFinite(v)?{nonfinite:String(v)}:Object.is(v,-0)?{signedZero:'-0'}:v,2)+'\n');
});
