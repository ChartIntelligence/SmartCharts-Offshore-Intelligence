// Offline contract audit only. No production numeric policy or serializer is changed.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import * as current from '../currentEvidenceCapture.mjs';
import * as quality from '../weatherMarineQualityCapture.mjs';
import * as companion from '../marineAssessorCompanionCapture.mjs';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {parsed,inputs,currentSupport} from './fixtures/marineAssessorCompanionFixture.mjs';
import {qualityCaptureInput} from './fixtures/weatherMarineQualityFixture.mjs';
import {frame,observation,publication} from './fixtures/temporalEvidenceFixture.mjs';
import {syntheticScalarFrame} from './fixtures/syntheticScalarFrame.js';
import {normalizeOceanProductFrameV1,serializeOceanProductFrameV1} from '../../shared/oceanProductFrame.mjs';
import {oceanArchiveIdentityV1,writeOceanArchiveV1,readOceanArchiveV1} from '../../shared/oceanProductArchive.mjs';
import {deliverOceanScalarFieldV1} from '../../shared/oceanScalarFieldDelivery.mjs';
import {validateEnvironmentalObservationV1} from '../temporalEvidencePrimitives.mjs';
import {canonical,hash,copy,freezeEvidenceV1,publicationV3,validatePublicationV3,cycleV1,cycleV2,publicationV1,publicationV2,validatePublicationV1,validatePublicationV2} from '../../shared/oceanPublication.mjs';
import {compareCandidateScientificSurfacesV1} from '../candidateSemanticProjection.mjs';
import {compareCandidateScientificSurfacesV2} from '../candidateSemanticProjectionV2.mjs';
import {normalizeBathymetryElevationV1,normalizeEtopoWaterMaskObservationV1} from '../bathymetryEvidence.js';
import {getSeaSurfaceTemperaturePoint,getCurrentConditionsPoint,getChlorophyllConditions,getGapFilledChlorophyllConditions,
  getMarineConditions,celsiusToFahrenheit,buildCurrentVectorProjectionAnalysis,buildCurrentGradientAnalysis,
  resolveOpportunityCandidateBathymetryV1,assessOceanConditions} from '../server.js';

const rows=[];
const sign=v=>Object.is(v,-0)?'NEGATIVE_ZERO':Object.is(v,0)?'POSITIVE_ZERO':v===null?'NULL':v;
const record=(contract,path,details)=>rows.push({contract,path,...details});
function differences(a,b,path=''){if(isDeepStrictEqual(a,b))return [];if(a&&b&&typeof a==='object'&&typeof b==='object')return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>differences(a[k],b[k],path+'/'+k));return [{path,left:sign(a),right:sign(b)}];}
const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'};
const source=readFileSync(new URL('../server.js',import.meta.url),'utf8');
function exact(start,end,name){const a=source.indexOf(start),b=source.indexOf(end,a+start.length);assert(a>=0&&b>a);return new Function(source.slice(a,b)+'\nreturn '+name+';')();}
const direction=exact('function currentDirectionDegrees(','function getCircularDirectionDifference(','currentDirectionDegrees');
const orientation=exact('function deriveSstTransitionOrientation(','export function assessSstTransitionConfidence(','deriveSstTransitionOrientation');
const jsonClone=v=>JSON.parse(JSON.stringify(v));
function memory(){const records=new Map();return {async createIfAbsent(key,value){const exists=records.has(key);if(!exists)records.set(key,jsonClone(value));return {outcome:exists?'exists':'created',durable:true,record:jsonClone(records.get(key))};},async readExact(key){return records.has(key)?{status:'found',durable:true,record:jsonClone(records.get(key))}:{status:'not-found'};}};} // Simulated durability only.
const intent={writeId:'synthetic-write',archivedAt:'2026-09-25T00:00:00Z',storageReference:'synthetic-memory',sourceRevision:null,rawEvidence:[]};
async function transport(t,body,run){const mock=t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>JSON.parse(body)}));try{return await run();}finally{mock.mock.restore();}}
const num=v=>Object.is(v,-0)?'-0':JSON.stringify(v);
const table=(u,v)=>'{"table":{"columnNames":["time","latitude","longitude","u_current","v_current","chlor_a"],"rows":[["2026-09-24T00:00:00Z",25,-90,'+num(u)+','+num(v)+','+num(u)+']]}}';

test('IEEE operators and actual conversion precedent distinguish representation from arithmetic',()=>{
  assert.equal(Object.is(-0,0),false);assert.equal(-0===0,true);assert.equal(JSON.stringify(-0),'0');
  assert(Object.is(JSON.parse('-0'),-0));assert(Object.is(copy({a:[-0]}).a[0],-0));
  assert.equal(canonical({a:[-0]}),canonical({a:[0]}));assert.equal(hash(-0),hash(0));
  assert.equal(1/-0,-Infinity);assert.equal(1/0,Infinity);assert(Object.is(Math.min(-0,0),-0));
  assert(Object.is(Math.max(-0,0),0));assert(Object.is(Math.hypot(-0,0),0));
  assert.equal(celsiusToFahrenheit(-0),32);assert.equal(celsiusToFahrenheit(0),32);
  assert.equal(Number((-0).toFixed(4)),0);assert(Object.is(Number((-0.00001).toFixed(4)),-0));
  record('canonical-json-hash','nested/array/value',{accepted:true,inMemory:'NEGATIVE_ZERO',serialized:'POSITIVE_ZERO',digestEqual:true,identity:'CALLER_SPECIFIC',comparison:'Object.is distinguishes; === does not'});
});

for(const [name,mutate,get] of [
  ['scalar-array',f=>f.payload.components[0].values[0]=-0,f=>f.payload.components[0].values[0]],
  ['uncertainty',f=>f.quality.uncertainty={value:-0,unit:'degF',meaning:'synthetic'},f=>f.quality.uncertainty.value],
  ['coordinates',f=>f.payload.coordinates[0][0]=-0,f=>f.payload.coordinates[0][0]],
  ['quality-flag',f=>f.quality.flags=[{flagId:'synthetic',value:-0}],f=>f.quality.flags[0].value],
  ['provenance-parameter',f=>f.provenance.steps=[{operationId:'synthetic',version:'1',parameters:[{name:'offset',value:-0}]}],f=>f.provenance.steps[0].parameters[0].value],
  ['vector-component',f=>{f.payload.kind='vector';f.payload.vectorBasis='east-north';f.payload.components=[{variableId:'u',unit:'m/s',axis:'east',positiveDirection:null,values:[-0],missing:[null]},{variableId:'v',unit:'m/s',axis:'north',positiveDirection:null,values:[0],missing:[null]}];},f=>f.payload.components[0].values[0]]
])test('frame/archive round trip '+name,async()=>{
  const a=frame(0,'original',0);mutate(a);const b=jsonClone(a);
  assert(Object.is(get(normalizeOceanProductFrameV1(a)),-0));
  assert.equal(serializeOceanProductFrameV1(a),serializeOceanProductFrameV1(b));
  assert.deepEqual(oceanArchiveIdentityV1(a),oceanArchiveIdentityV1(b));
  const port=memory(),written=await writeOceanArchiveV1(port,a,intent);assert.equal(written.status,'ARCHIVED');
  const read=await readOceanArchiveV1(port,{frameId:a.frameId,archiveId:null});assert.equal(read.status,'ARCHIVED');assert(Object.is(get(read.frame),0));
  assert.equal((await writeOceanArchiveV1(port,b,intent)).duplicate,true);
  record('frame-and-archive-v1',name,{accepted:true,inMemory:'NEGATIVE_ZERO',serialized:'POSITIVE_ZERO',digestEqual:true,identityEqual:true,validationDistinguishes:false,replay:'POSITIVE_ZERO',archiveIdMeaning:'hash of caller frameId; frame/content digests seal canonical bytes'});
});

test('frame missing mask remains distinct; numeric masks unsupported',()=>{
  const a=frame(0,'original',-0),b=frame(0,'original',null);assert.notEqual(oceanArchiveIdentityV1(a).contentDigest,oceanArchiveIdentityV1(b).contentDigest);
  a.payload.components[0].missing[0]=-0;assert.throws(()=>normalizeOceanProductFrameV1(a));
});

test('scalar derivative inherits archive zero normalization and delivery identity collision',async()=>{
  const outputs=[];
  for(const value of [-0,0]){const f=syntheticScalarFrame();f.payload.components[0].values[0]=value;const p=memory(),w=await writeOceanArchiveV1(p,f,intent);assert.equal(w.status,'ARCHIVED');
    const d=await deliverOceanScalarFieldV1(p,{source:{archiveId:w.receipt.archiveId,receiptDigest:w.receipt.receiptDigest},variableId:'temperature',bounds:f.spatial.bounds,stride:{x:1,y:1},limits:{maxCells:100,maxPayloadBytes:100000},generatedAt:'2026-09-25T00:00:00Z'});assert.equal(d.status,'DELIVERED_PARTIAL');outputs.push(d);}
  assert.deepEqual(outputs[0],outputs[1]);record('scalar-delivery-v1','grid.values[0]',{accepted:true,inMemory:'POSITIVE_ZERO_FROM_ARCHIVE',serializedEqual:true,digestEqual:true,identityEqual:true,replay:'POSITIVE_ZERO'});
});

for(const [family,key] of [['SST','temperatureCelsius'],['CHLOROPHYLL_DIRECT','concentrationMgM3'],['CHLOROPHYLL_GAP_FILLED','concentrationMgM3'],['CURRENTS','eastwardMetersPerSecond'],['CURRENTS','northwardMetersPerSecond']])test('current capture '+family+' '+key,()=>{
  const raw=captureFixture(family);raw.samples[0].point[key]=-0;
  const a=current.captureCurrentEvidenceV1(raw),positive=structuredClone(raw);positive.samples[0].point[key]=0;const b=current.captureCurrentEvidenceV1(positive);
  const bytes=current.serializeCurrentEvidenceCaptureV1(a),r=current.replayCurrentEvidenceSourceV1(current.readCurrentEvidenceCaptureV1(bytes));
  assert(Object.is(a.samples[0].point[key],-0));assert(Object.is(current.replayCurrentEvidenceSourceV1(a).samples[0].point[key],-0));assert(Object.is(r.samples[0].point[key],0));
  assert.equal(bytes,current.serializeCurrentEvidenceCaptureV1(b));assert.equal(a.captureId,b.captureId);assert.equal(a.scientificContentDigest,b.scientificContentDigest);
  const substituted=structuredClone(a);substituted.samples[0].point[key]=0;assert.doesNotThrow(()=>current.validateCurrentEvidenceCaptureV1(substituted));
  record('current-evidence-capture-v1',family+'.'+key,{accepted:true,inMemory:'NEGATIVE_ZERO',directReplay:'NEGATIVE_ZERO',serializedReplay:'POSITIVE_ZERO',serializedEqual:true,digestEqual:true,identityEqual:true,validationDistinguishes:false});
});

for(const [family,key] of [['wind','speedKnots'],['waves','heightFeet'],['swell','heightFeet']])test('quality capture '+family,async t=>{
  const m=await parsed(t),raw=qualityCaptureInput(m);raw.qualityInputs[family][key]=-0;const a=quality.captureWeatherMarineQualityV1(raw);
  raw.qualityInputs[family][key]=0;const b=quality.captureWeatherMarineQualityV1(raw);const bytes=quality.serializeWeatherMarineQualityCaptureV1(a);
  const r=quality.replayWeatherMarineQualityV1(quality.readWeatherMarineQualityCaptureV1(bytes));
  assert(Object.is(a.qualityInputs[family][key],-0));assert(Object.is(quality.replayWeatherMarineQualityV1(a)[family][key],-0));assert(Object.is(r[family][key],0));
  assert.equal(bytes,quality.serializeWeatherMarineQualityCaptureV1(b));assert.equal(a.captureId,b.captureId);assert.equal(a.scientificContentDigest,b.scientificContentDigest);
  const tampered=structuredClone(a);tampered.qualityInputs[family][key]=0;assert.doesNotThrow(()=>quality.validateWeatherMarineQualityCaptureV1(tampered));
  const context=currentSupport(m),n=structuredClone(m),p=structuredClone(m);n[family][key]=-0;p[family][key]=0;assert.deepEqual(context.quality(n),context.quality(p));
  record('weather-marine-quality-capture-v1',family+'.'+key,{accepted:true,inMemory:'NEGATIVE_ZERO',directReplay:'NEGATIVE_ZERO',serializedReplay:'POSITIVE_ZERO',serializedEqual:true,digestEqual:true,identityEqual:true,validationDistinguishes:false,qualityOutputEqual:true});
});

for(const [family,key] of [['wind','gustKnots'],['wind','directionDegrees'],['waves','directionDegrees'],['waves','periodSeconds'],['swell','directionDegrees'],['swell','periodSeconds']])test('companion capture '+family+'.'+key,async t=>{
  const m=await parsed(t),{q,input}=inputs(m);input.marineInputs[family][key]=-0;const a=companion.captureMarineAssessorCompanionV1(input,q);input.marineInputs[family][key]=0;const b=companion.captureMarineAssessorCompanionV1(input,q);
  const bytes=companion.serializeMarineAssessorCompanionV1(a,q),r=companion.replayMarineAssessorCompanionV1(companion.readMarineAssessorCompanionV1(bytes,q),q);
  assert(Object.is(a.marineInputs[family][key],-0));assert(Object.is(companion.replayMarineAssessorCompanionV1(a,q)[family][key],-0));assert(Object.is(r[family][key],0));
  assert.equal(bytes,companion.serializeMarineAssessorCompanionV1(b,q));assert.equal(a.captureId,b.captureId);assert.equal(companion.marineAssessorCompanionReferenceV1(a,q).sha256,companion.marineAssessorCompanionReferenceV1(b,q).sha256);
  const changed=structuredClone(a);changed.marineInputs[family][key]=0;assert.doesNotThrow(()=>companion.validateMarineAssessorCompanionV1(changed,q));
  record('marine-assessor-companion-capture-v1',family+'.'+key,{accepted:true,inMemory:'NEGATIVE_ZERO',directReplay:'NEGATIVE_ZERO',serializedReplay:'POSITIVE_ZERO',serializedEqual:true,digestEqual:true,identityEqual:true,validationDistinguishes:false});
});

test('temporal exact sample has same observation ID despite distinct in-memory sign',()=>{
  const a=frame(0,'original',-0),b=frame(0,'original',0),x=observation(a),y=observation(b);
  assert(Object.is(x.component.value,-0));assert.equal(x.observationId,y.observationId);assert.equal(canonical(x),canonical(y));
  assert(Object.is(validateEnvironmentalObservationV1(jsonClone(x),a).component.value,-0));
  assert(Object.is(validateEnvironmentalObservationV1(jsonClone(x),b).component.value,0));
  record('environmental-evidence-sample-v1','component.value',{accepted:true,inMemory:'NEGATIVE_ZERO',serializedEqual:true,digestEqual:true,identityEqual:true,validationDistinguishes:false,replay:'depends on supplied frame; JSON-reloaded frame yields POSITIVE_ZERO',noStandaloneReader:true});
});

test('publication v3 embedded age and referenced observation hash collisions are scope-specific',()=>{
  const build=value=>{const p=publication();const entries=structuredClone(p.evidence.entries);entries[0].ageHours=value;const evidence=freezeEvidenceV1(p.cycle,entries);return publicationV3({cycle:p.cycle,evidence,history:p.history,attempt:p.attempt,evaluation:{...p.evaluation,evidenceSetId:evidence.evidenceSetId}});};
  const a=build(-0),b=build(0);assert(Object.is(a.evidence.entries[0].ageHours,-0));assert.equal(a.contentDigest,b.contentDigest);assert.equal(a.publicationId,b.publicationId);assert.equal(canonical(a),canonical(b));assert(Object.is(validatePublicationV3(jsonClone(a)).evidence.entries[0].ageHours,0));
  assert.equal(hash(observation(frame(0,'original',-0))),hash(observation(frame(0,'original',0))));
  record('publication-v3','evidence.entries[0].ageHours',{accepted:true,inMemory:'NEGATIVE_ZERO',serializedEqual:true,digestEqual:true,identityEqual:true,validationDistinguishes:false,replay:'POSITIVE_ZERO',scope:'Numeric age embedded; source values and species scores are references, not arbitrary embedded science'});
});

for(const [version,cycle,create,validate] of [['v1',cycleV1,publicationV1,validatePublicationV1],['v2',cycleV2,publicationV2,validatePublicationV2]])test('publication '+version+' same-cycle numeric collision',()=>{
  const build=value=>{const p=publication(),configuration={...p.cycle.configuration,evaluatorVersion:'synthetic-explicit-assessment-v1'},c=cycle({scheduledAt:p.cycle.scheduledAt,region:p.cycle.region,configuration});
    const entries=structuredClone(p.evidence.entries);entries[0].ageHours=value;const evidence=freezeEvidenceV1(c,entries),evaluation={...p.evaluation,evaluatorVersion:configuration.evaluatorVersion,evidenceSetId:evidence.evidenceSetId};delete evaluation.historyId;delete evaluation.historyState;if(version==='v1')delete evaluation.assessmentAt;
    return create({cycle:c,evidence,attempt:p.attempt,evaluation});};
  const a=build(-0),b=build(0);assert(Object.is(a.evidence.entries[0].ageHours,-0));assert.equal(a.publicationId,b.publicationId);assert.equal(a.contentDigest,b.contentDigest);assert.equal(canonical(a),canonical(b));assert(Object.is(validate(jsonClone(a)).evidence.entries[0].ageHours,0));
  record('publication-'+version,'evidence.entries[0].ageHours',{accepted:true,inMemory:'NEGATIVE_ZERO',serializedEqual:true,digestEqual:true,identityEqual:true,validationDistinguishes:false,replay:'POSITIVE_ZERO'});
});

for(const [name,compare] of [['v1',compareCandidateScientificSurfacesV1],['v2',compareCandidateScientificSurfacesV2]])test('projection '+name+' exact sign retained, no digest',()=>{
  const a={sst:{temperatureCelsius:-0}},b={sst:{temperatureCelsius:0}};assert.equal(compare(a,b).classification,'MISMATCH');assert.equal(compare(a,a).classification,'EXACT_MATCH');
  record('semantic-projection-'+name,'/sst/temperatureCelsius',{accepted:true,inMemory:'NEGATIVE_ZERO',identity:'NONE',comparisonDistinguishes:true,serialization:'No projection record serializer/replay contract; ordinary JSON loses sign'});
});

test('literal SST sign survives parser, Fahrenheit and orientation do not differ',async t=>{
  const out=[];for(const value of [-0,0,null])out.push(await transport(t,'{"latitude":25,"longitude":-90,"current":{"time":"2026-09-24T00:00:00Z","sea_surface_temperature":'+num(value)+'}}',()=>getSeaSurfaceTemperaturePoint(25,-90)));
  assert(Object.is(out[0].temperatureCelsius,-0));assert(Object.is(out[1].temperatureCelsius,0));assert.equal(out[2].temperatureCelsius,null);assert.equal(out[0].temperatureFahrenheit,32);
  const samples=value=>['east','west','north','south'].map(direction=>({direction,temperatureFahrenheit:celsiusToFahrenheit(value)}));assert.deepEqual(orientation(samples(-0)),orientation(samples(0)));
  record('parser-SST','temperatureCelsius',{origin:'literal transport',negative:sign(out[0].temperatureCelsius),positive:sign(out[1].temperatureCelsius),missing:sign(out[2].temperatureCelsius),fahrenheitEqual:true,orientationEqual:true});
});

for(const [name,parser] of [['chlorophyll-direct',getChlorophyllConditions],['chlorophyll-gap-filled',getGapFilledChlorophyllConditions]])test('actual '+name+' parser literal and computed zero',async t=>{
  const out=[];for(const v of [-0,0,-0.00001,null])out.push(await transport(t,table(v,0),()=>parser(25,-90,assessment)));
  assert(Object.is(out[0].concentrationMgM3,0));assert(Object.is(out[2].concentrationMgM3,-0));assert.equal(out[3].concentrationMgM3,null);
  record('parser-'+name,'concentrationMgM3',{literalNegative:sign(out[0].concentrationMgM3),positive:sign(out[1].concentrationMgM3),computedNegative:sign(out[2].concentrationMgM3),missing:sign(out[3].concentrationMgM3),classificationEqual:out[0].waterClassification===out[1].waterClassification});
});

test('actual current parser distinguishes north component signed zero before rounding',async t=>{
  const out=[];for(const [u,v] of [[0,0],[0,-0],[-0,0],[-0,-0],[-0.00001,1],[null,0]])out.push(await transport(t,table(u,v),()=>getCurrentConditionsPoint(25,-90,assessment)));
  assert.deepEqual(out.slice(0,4).map(x=>x.directionDegrees),[0,180,0,180]);assert.equal(out[0].derived.compassDirection,'N');assert.equal(out[1].derived.compassDirection,'S');
  assert(out.slice(0,4).every(x=>Object.is(x.northwardMetersPerSecond,0)&&x.speedKnots===0));assert(Object.is(out[4].eastwardMetersPerSecond,-0));assert.equal(out[5].speedKnots,0);assert.equal(out[5].directionDegrees,null); // Existing null speed converter behavior, not approval.
  record('parser-currents','u_current=0; v_current=+0 versus -0',{directionPositive:out[0].directionDegrees,directionNegative:out[1].directionDegrees,compassPositive:out[0].derived.compassDirection,compassNegative:out[1].derived.compassDirection,speedEqual:true,componentsAfterRounding:'POSITIVE_ZERO',computedSmallNegativeComponent:sign(out[4].eastwardMetersPerSecond),differences:differences(out[0],out[1]),physicalMeaning:'zero-speed heading is not authenticated by this audit'});
});

test('actual private current direction function shows sign sensitivity and nonzero controls',()=>{
  assert.equal(direction(0,0),0);assert.equal(direction(0,-0),180);assert.equal(direction(-0,-0),180);
  for(const v of [-1,1])assert.equal(direction(-0,v),direction(0,v));for(const u of [-1,1])assert.equal(direction(u,-0),direction(u,0));assert.equal(direction(null,0),null);
});

test('marine parser literal, computed and missing zeros use current conversions',async t=>{
  const out=[];for(const value of [-0,0,-0.00001,null]){
    const body='{"latitude":25,"longitude":-90,"current":{"time":"2026-09-24T00:00:00Z","wind_speed_10m":'+num(value)+',"wind_gusts_10m":'+num(value)+',"wind_direction_10m":'+num(value)+',"sea_surface_temperature":26,"wave_height":'+num(value)+',"wave_direction":'+num(value)+',"wave_period":'+num(value)+',"swell_wave_height":'+num(value)+',"swell_wave_direction":'+num(value)+',"swell_wave_period":'+num(value)+'}}';
    out.push(await transport(t,body,()=>getMarineConditions(25,-90)));
  }
  for(const [family,key] of [['wind','speedKnots'],['wind','gustKnots'],['waves','heightFeet'],['swell','heightFeet']]){assert(Object.is(out[0][family][key],0));assert(Object.is(out[2][family][key],-0));assert(Object.is(out[3][family][key],0));record('parser-marine',family+'.'+key,{literalNegative:'POSITIVE_ZERO',computedNegative:'NEGATIVE_ZERO',missing:'POSITIVE_ZERO',upstreamNullConversionUnresolved:true});}
  for(const [family,key] of [['wind','directionDegrees'],['waves','directionDegrees'],['waves','periodSeconds'],['swell','directionDegrees'],['swell','periodSeconds']]){assert(Object.is(out[0][family][key],-0));assert.equal(out[3][family][key],null);record('parser-marine',family+'.'+key,{literalNegative:'NEGATIVE_ZERO',missing:'NULL'});}
});

test('marine assessor zero substitutions preserve tested interpretation; raw retained leaves may differ',async t=>{
  const m=await parsed(t),context=currentSupport(m),results=[];
  for(const value of [-0,0]){const p=structuredClone(m);for(const [family,key] of [['wind','speedKnots'],['wind','gustKnots'],['wind','directionDegrees'],['waves','heightFeet'],['waves','directionDegrees'],['waves','periodSeconds'],['swell','heightFeet'],['swell','directionDegrees'],['swell','periodSeconds']])p[family][key]=value;
    results.push(assessOceanConditions({...p,dataQuality:context.quality(p)}));}
  assert.equal(canonical(results[0]),canonical(results[1]));
  record('marine-assessor','all nine zero marine fields',{canonicalOutputEqual:true,exactOutputEqual:isDeepStrictEqual(results[0],results[1]),differences:differences(results[0],results[1]),scope:'species-neutral marine assessor only; no species evaluation'});
});

test('static bathymetry retains input sign but zero water/depth decisions do not change',()=>{
  assert(Object.is(normalizeBathymetryElevationV1(-0),-0));assert(Object.is(normalizeEtopoWaterMaskObservationV1(-0).elevationMeters,0));assert.equal(normalizeEtopoWaterMaskObservationV1(-0).water,false);
  const resolve=value=>resolveOpportunityCandidateBathymetryV1({id:'synthetic',coordinates:[25,-90],waterMask:{elevationMeters:value}});const a=resolve(-0),b=resolve(0);assert.equal(a.available,b.available);assert.equal(a.depthMeters,b.depthMeters);assert(Object.is(a.elevationMeters,-0));
  record('bathymetry-static','elevationMeters',{accepted:true,inMemory:'NEGATIVE_ZERO',ingestedRounded:'POSITIVE_ZERO',waterEqual:true,depthEqual:true,identity:'not created by normalizer'});
});

test('actual vector/gradient functions test all zero component sign combinations',()=>{
  const outputs=[];
  for(const [u,v] of [[0,0],[-0,0],[0,-0],[-0,-0]]){const p=buildCurrentVectorProjectionAnalysis({vectors:['east','west','north','south'].map(direction=>({direction,eastwardMetersPerSecond:u,northwardMetersPerSecond:v,speedKnots:0,directionDegrees:0,requestedLatitude:25,requestedLongitude:-90}))});outputs.push({p,g:buildCurrentGradientAnalysis(p)});}
  for(const output of outputs)assert.equal(canonical(output),canonical(outputs[0]));
  record('current-vector-and-gradient-assemblers','zero component sign combinations',{canonicalOutputsEqual:true,exactOutputsEqual:outputs.every(x=>isDeepStrictEqual(x,outputs[0])),limit:'controlled zero vectors; no species-output equivalence claim'});
});

test('privacy/accessor and nonfinite protections unchanged; no arbitrary numeric tags accepted',()=>{
  for(const value of [NaN,Infinity,-Infinity,{number:'-0'},undefined]){const a=captureFixture();a.samples[0].point.temperatureCelsius=value;assert.throws(()=>current.captureCurrentEvidenceV1(a));}
  const a=captureFixture();let calls=0;Object.defineProperty(a.samples[0].point,'temperatureCelsius',{enumerable:true,get(){calls++;return -0;}});assert.throws(()=>current.captureCurrentEvidenceV1(a));assert.equal(calls,0);
  const b=captureFixture();b.samples[0].point.source.captain_id='private';assert.throws(()=>current.captureCurrentEvidenceV1(b));
  assert.throws(()=>copy(Object.assign(Object.create({value:-0}),{sample:1})));
  const n=captureFixture(),z=captureFixture();n.samples[0].point.temperatureCelsius=null;n.samples[0].point.temperatureFahrenheit=null;n.samples[0].point.source.availability='unavailable';z.samples[0].point.temperatureCelsius=-0;assert.notEqual(current.captureCurrentEvidenceV1(n).scientificContentDigest,current.captureCurrentEvidenceV1(z).scientificContentDigest);
});

test('emit executed numeric-contract collision and parser matrix',()=>{assert(rows.length>=30);console.log('SIGNED_ZERO_MATRIX='+JSON.stringify(rows));});
