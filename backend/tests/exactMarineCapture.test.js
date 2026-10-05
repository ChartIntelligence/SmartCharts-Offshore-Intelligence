import {discoverDefaultGraph} from './fixtures/defaultProviderGraphReview.mjs';
import {verifyExtractionGraph} from './fixtures/currentProviderExtractionReview.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import * as q2 from '../weatherMarineQualityCaptureV2.mjs';
import * as c2 from '../marineAssessorCompanionCaptureV2.mjs';
import * as q1 from '../weatherMarineQualityCapture.mjs';
import * as c1 from '../marineAssessorCompanionCapture.mjs';
import * as current from '../currentEvidenceCaptureV2.mjs';
import {currentV2Golden} from './fixtures/exactCurrentV2ExtractionGolden.mjs';
import {captureFixture,ref} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {parsed,nine,prepare,reconstruct} from './fixtures/exactMarineCaptureFixture.mjs';
import {inputs,sixFields} from './fixtures/marineAssessorCompanionFixture.mjs';
import {compareCandidateScientificSurfacesV2 as compare} from '../candidateSemanticProjectionV2.mjs';
import {publication} from './fixtures/temporalEvidenceFixture.mjs';
import {freezeEvidenceV1,publicationV3,validatePublicationV3} from '../../shared/oceanPublication.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const reverse=x=>Array.isArray(x)?x.map(reverse):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).reverse().map(k=>[k,reverse(x[k])])):x;
const values={'positive-zero':0,'negative-zero':-0,finite:0.1,'negative-finite':-12.125,smallest:Number.MIN_VALUE,largest:Number.MAX_VALUE};
for(const g of currentV2Golden)test('authorized extraction preserves pre-extraction current v2 '+g.family+'/'+g.label,()=>{
  const p=captureFixture(g.family);p.samples[0].point[g.key]=values[g.label];
  const c=current.captureCurrentEvidenceV2(p),wire=current.serializeCurrentEvidenceCaptureV2(c);
  assert.equal(hash(wire),g.wireSha256);assert.equal(c.captureId,g.captureId);assert.equal(c.scientificContentDigest,g.scientificContentDigest);assert.deepEqual(current.currentCaptureReferenceV2(c),g.reference);
  assert(Object.is(current.replayCurrentEvidenceSourceV2(current.readCurrentEvidenceCaptureV2(wire)).samples[0].point[g.key],values[g.label]));
});
function equivalent(p) {
  const r=reconstruct(p.wires,p.refs,p.support);
  assert.deepEqual(r.r,p.expectedNormalized);assert.deepEqual(r.dataQuality,p.Aquality);assert.deepEqual(r.B,p.A);
  const result=compare(p.A,r.B);assert.equal(result.classification,'EXACT_MATCH');
  return r;
}
for(const [family,field,owner] of nine)test('nine sign cases '+family+'/'+field,async t=>{
  const m=await parsed(t);m[family][field]=-0;const a=prepare(m);m[family][field]=0;const b=prepare(m);
  const ar=equivalent(a),br=equivalent(b);assert(Object.is(ar.r[family][field],-0));assert(Object.is(br.r[family][field],0));
  const key=owner==='quality'?'q':'c',wire=owner==='quality'?'quality':'companion';
  assert.notEqual(a.wires[wire],b.wires[wire]);assert.notEqual(a[key].scientificContentDigest,b[key].scientificContentDigest);assert.notEqual(a[key].captureId,b[key].captureId);assert.notEqual(a.refs[wire].sha256,b.refs[wire].sha256);
  assert.equal(compare(a.A,b.A).classification,'MISMATCH');
  // Same normalized source under unchanged historical captures retains expected canonical sign loss.
  m[family][field]=-0;const old=inputs(m),oldc=c1.captureMarineAssessorCompanionV1(old.input,old.q);
  const qr=q1.readWeatherMarineQualityCaptureV1(q1.serializeWeatherMarineQualityCaptureV1(old.q));
  const cr=c1.readMarineAssessorCompanionV1(c1.serializeMarineAssessorCompanionV1(oldc,old.q),qr);
  assert(Object.is(c1.replayMarineAssessorCompanionV1(cr,qr)[family][field],0));
});
for(let mask=0;mask<8;mask++)test('eight independent quality family states '+mask,async t=>{
  equivalent(prepare(await parsed(t,{weather:{wind_speed_10m:mask&1?undefined:4},marine:{wave_height:mask&2?undefined:1,swell_wave_height:mask&4?undefined:0.5}})));
});
for(const [family,field,transport,value] of sixFields)test('six controlled companion changes '+family+'/'+field,async t=>{
  const a=prepare(await parsed(t)),b=prepare(await parsed(t,{[family==='wind'?'weather':'marine']:{[transport]:value}}));
  equivalent(a);equivalent(b);assert.notDeepEqual(a.A,b.A);assert.notEqual(a.c.captureId,b.c.captureId);
});
for(const [name,opts] of [['complete',{}],['weather rejected',{weatherFail:true}],['marine rejected',{marineFail:true}],['fulfilled missing',{noWeatherCurrent:true}],['wind missing',{weather:{wind_speed_10m:undefined,wind_gusts_10m:undefined,wind_direction_10m:undefined}}],['quality time fallback',{weather:{time:null}}],['malformed quality time',{weather:{time:'not-a-time'}}],['units provenance',{units:true}]])test('unchanged quality/provenance/lineage '+name,async t=>{equivalent(prepare(await parsed(t,opts)));});
for(const bits of [0,0b101010101,0b010101010,511])test('mixed sign independence '+bits,async t=>{
  const m=await parsed(t);nine.forEach(([f,k],i)=>m[f][k]=bits&(1<<i)?-0:0);const r=equivalent(prepare(m)).r;
  nine.forEach(([f,k])=>assert(Object.is(r[f][k],m[f][k])));
});
for(const [family,field,owner] of nine){
  test('finite and normalized missing exactness '+family+'/'+field,async t=>{
    for(const n of [-1,0,0.1,721,Number.MIN_VALUE,Number.MAX_VALUE,null]){
      const m=await parsed(t);m[family][field]=n;const p=prepare(m);
      const r=reconstruct(p.wires,p.refs,p.support).r;assert(Object.is(r[family][field],n));
    }
  });
  test('nonfinite/malformed/required missing '+family+'/'+field,async t=>{
    const p=prepare(await parsed(t)),make=x=>owner==='quality'?q2.captureWeatherMarineQualityV2(x):c2.captureMarineAssessorCompanionV2(x,p.q);
    for(const n of [NaN,Infinity,-Infinity,undefined,'0',{},[]]){
      const x=structuredClone(owner==='quality'?p.qualityInput:p.input);(owner==='quality'?x.qualityInputs:x.marineInputs)[family][field]=n;assert.throws(()=>make(x));
    }
    const x=structuredClone(owner==='quality'?p.qualityInput:p.input);delete (owner==='quality'?x.qualityInputs:x.marineInputs)[family][field];assert.throws(()=>make(x));
  });
}
test('upstream null coercion remains separate',async t=>{
  const m=await parsed(t,{weather:{wind_speed_10m:null,wind_gusts_10m:null,wind_direction_10m:null},marine:{wave_height:null,wave_direction:null,wave_period:null,swell_wave_height:null,swell_wave_direction:null,swell_wave_period:null}});
  assert.equal(m.wind.speedKnots,0);assert.equal(m.wind.gustKnots,0);assert.equal(m.wind.directionDegrees,null);equivalent(prepare(m));
});
test('wind provenance contradictory to speed OR gust OR direction fails closed',async t=>{
  const p=prepare(await parsed(t));const x=structuredClone(p.input);x.marineInputs.wind.source.availability='provider-returned-null';assert.throws(()=>c2.captureMarineAssessorCompanionV2(x,p.q));
  const absent=prepare(await parsed(t,{weather:{wind_speed_10m:undefined,wind_gusts_10m:undefined,wind_direction_10m:undefined}}));
  const y=structuredClone(absent.input);y.marineInputs.wind.source.availability='available';assert.throws(()=>c2.captureMarineAssessorCompanionV2(y,absent.q));
  const gust=prepare(await parsed(t,{weather:{wind_speed_10m:undefined}}));assert.equal(equivalent(gust).r.wind.source.availability,'available');
});
test('exact quality binding includes sign, time, location and acquisition; never a v1 bridge',async t=>{
  const p=prepare(await parsed(t));
  for(const mutate of [x=>x.qualityInputs.wind.speedKnots=-0,x=>x.qualityInputs.observedAt='2026-09-23T00:00:00Z',x=>x.location.latitude=26]){
    const input=structuredClone(p.qualityInput);mutate(input);const other=q2.captureWeatherMarineQualityV2(input);assert.throws(()=>c2.validateMarineAssessorCompanionV2(p.c,other));
    const newc=c2.captureMarineAssessorCompanionV2({...p.input,qualityReference:q2.weatherMarineQualityReferenceV2(other)},other);assert.notEqual(newc.captureId,p.c.captureId);
  }
  const zero=structuredClone(p.qualityInput);zero.qualityInputs.wind.speedKnots=0;const positive=q2.captureWeatherMarineQualityV2(zero);zero.qualityInputs.wind.speedKnots=-0;const negative=q2.captureWeatherMarineQualityV2(zero);
  const pos=c2.captureMarineAssessorCompanionV2({...p.input,qualityReference:q2.weatherMarineQualityReferenceV2(positive)},positive);
  assert.throws(()=>c2.validateMarineAssessorCompanionV2(pos,negative));
  const old=inputs(await parsed(t));assert.throws(()=>c2.captureMarineAssessorCompanionV2(old.input,p.q));assert.throws(()=>c2.captureMarineAssessorCompanionV2(p.input,old.q));
});

test('both v2 records and typed references reject tampering and cross-version records',async t=>{
  const m=await parsed(t),p=prepare(m),old=inputs(m),oldc=c1.captureMarineAssessorCompanionV1(old.input,old.q);
  assert.throws(()=>q2.validateWeatherMarineQualityCaptureV2(old.q));assert.throws(()=>q1.validateWeatherMarineQualityCaptureV1(p.q));
  assert.throws(()=>c2.validateMarineAssessorCompanionV2(oldc,p.q));assert.throws(()=>c1.validateMarineAssessorCompanionV1(p.c,old.q));
  for(const [record,validate,ref,verify,oldref] of [
    [p.q,q2.validateWeatherMarineQualityCaptureV2,p.refs.quality,r=>q2.validateWeatherMarineQualityReferenceV2(r,p.q),q1.weatherMarineQualityReferenceV1(old.q)],
    [p.c,x=>c2.validateMarineAssessorCompanionV2(x,p.q),p.refs.companion,r=>c2.validateMarineAssessorCompanionReferenceV2(r,p.c,p.q),c1.marineAssessorCompanionReferenceV1(oldc,old.q)]]){
    assert.throws(()=>verify(oldref));
    for(const k of ['contractVersion','serializationVersion','digestVersion','scientificContentDigest','captureId']){const x=structuredClone(record);x[k]='substituted';assert.throws(()=>validate(x));}
    for(const k of ['contractVersion','referenceId','sha256']){const x={...ref};x[k]=k==='sha256'?'a'.repeat(64):'substituted';assert.throws(()=>verify(x));}
    assert.throws(()=>verify({...ref,purpose:'unreviewed'}));assert.throws(()=>verify({...ref,sha256:record.scientificContentDigest}));
    assert.throws(()=>validate({...record,extraDigest:'a'.repeat(64)}));
  }
  for(const [family,field,owner] of nine){const x=structuredClone(owner==='quality'?p.q:p.c);(owner==='quality'?x.qualityInputs:x.marineInputs)[family][field]=-0;
    assert.throws(()=>owner==='quality'?q2.validateWeatherMarineQualityCaptureV2(x):c2.validateMarineAssessorCompanionV2(x,p.q));}
});
test('domain-separated versions and reference purposes are independently recomputable',async t=>{
  const p=prepare(await parsed(t));
  // Independent test encoder for digest assertions only; production has one shared implementation.
  const encode=v=>typeof v==='number'&&Object.is(v,-0)?'-0':Array.isArray(v)?'['+v.map(encode).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+encode(v[k])).join(',')+'}':JSON.stringify(v);
  for(const [c,r,purpose,body] of [[p.q,p.refs.quality,q2.EXACT_WEATHER_MARINE_REFERENCE_V1,{source:p.q.source,location:p.q.location,qualityInputs:p.q.qualityInputs}],
    [p.c,p.refs.companion,c2.EXACT_MARINE_COMPANION_REFERENCE_V1,{qualityReference:p.c.qualityReference,marineInputs:p.c.marineInputs,source:p.c.source}]]){
    const envelope={digestVersion:c.digestVersion,serializationVersion:c.serializationVersion,captureVersion:c.contractVersion,purpose,content:c};
    assert.equal(hash(encode(envelope)),r.sha256);
    assert.equal(hash(encode({...envelope,purpose:'scientific-content',content:body})),c.scientificContentDigest);
    const {captureId,...content}=c;assert.equal(hash(encode({...envelope,purpose:'capture-identity',content})),captureId.slice(c===p.q?5:5));
    for(const k of ['digestVersion','serializationVersion','captureVersion','purpose']){
      const bad={...envelope};delete bad[k];assert.notEqual(hash(encode(bad)),r.sha256);assert.notEqual(hash(encode({...envelope,[k]:'unrelated'})),r.sha256);
    }
  }
});
test('canonical re-encoding rejects duplicate keys at every object boundary in both wire schemas',async t=>{
  const p=prepare(await parsed(t));
  for(const [wire,read] of [[p.wires.quality,q2.readWeatherMarineQualityCaptureV2],[p.wires.companion,s=>c2.readMarineAssessorCompanionV2(s,p.q)]]){
    assert.equal(wire,wire===p.wires.quality?q2.serializeWeatherMarineQualityCaptureV2(read(wire)):c2.serializeMarineAssessorCompanionV2(read(wire),p.q));
    for(const match of wire.matchAll(/\{("(?:[^"\\]|\\.)+"):/g))for(const value of ['null','0','-0','{}']){
      const at=match.index+1;assert.throws(()=>read(wire.slice(0,at)+match[1]+':'+value+','+wire.slice(at)));
    }
    assert.throws(()=>read(wire+' '));assert.throws(()=>read(wire+'/*comment*/'));assert.throws(()=>read(wire.slice(0,-1)+',}'));
  }
});
test('key order does not matter; ordered lineage and duplicate references remain identity-significant',async t=>{
  const p=prepare(await parsed(t));assert.equal(q2.serializeWeatherMarineQualityCaptureV2(q2.captureWeatherMarineQualityV2(reverse(p.qualityInput))),p.wires.quality);
  assert.equal(c2.serializeMarineAssessorCompanionV2(c2.captureMarineAssessorCompanionV2(reverse(p.input),p.q),p.q),p.wires.companion);
  const x=structuredClone(p.qualityInput);x.lineageReferences.reverse();const q=q2.captureWeatherMarineQualityV2(x);assert.notEqual(q.captureId,p.q.captureId);assert.equal(q.scientificContentDigest,p.q.scientificContentDigest);
  const y=structuredClone(p.input);y.lineageReferences.push(ref('second-lineage'));const a=c2.captureMarineAssessorCompanionV2(y,p.q);y.lineageReferences.reverse();const b=c2.captureMarineAssessorCompanionV2(y,p.q);assert.notEqual(a.captureId,b.captureId);
  y.lineageReferences.push(y.lineageReferences[0]);assert.notEqual(c2.captureMarineAssessorCompanionV2(y,p.q).captureId,b.captureId);
});
test('family swaps, foreign evidence, unknown descendants and extension bags rejected',async t=>{
  const p=prepare(await parsed(t));
  for(const [a,b] of [['wind','waves'],['waves','swell'],['swell','wind']]){const x=structuredClone(p.input);[x.marineInputs[a],x.marineInputs[b]]=[x.marineInputs[b],x.marineInputs[a]];assert.throws(()=>c2.captureMarineAssessorCompanionV2(x,p.q));}
  for(const key of ['sst','chlorophyll','currents','bathymetry','species','score','confidence','metadata']){
    const x=structuredClone(p.qualityInput);x.qualityInputs[key]={value:-0};assert.throws(()=>q2.captureWeatherMarineQualityV2(x));
    const y=structuredClone(p.input);y.marineInputs[key]={value:-0};assert.throws(()=>c2.captureMarineAssessorCompanionV2(y,p.q));
  }
  const q=structuredClone(p.qualityInput);q.qualityInputs.waves={heightFeet:1,periodSeconds:2};assert.throws(()=>q2.captureWeatherMarineQualityV2(q));
});
for(const label of ['captain_id','captainId','user_id','userId','email','boat','origin','range','Fishing_Log','catch','lure','bait','private-coordinates','session','token','mission','captain.identity','captain-id','captain_id','boatName','private.trip.coordinates','captain.coordinates','missionContext','auth','550e8400-e29b-41d4-a716-446655440000_suffix'])test('private labels rejected on both new capture surfaces '+label,async t=>{
  const p=prepare(await parsed(t));
  const x=structuredClone(p.qualityInput);x.lineageReferences[0].referenceId='source.'+label;assert.throws(()=>q2.captureWeatherMarineQualityV2(x));
  const y=structuredClone(p.input);y.lineageReferences[0].referenceId='source.'+label;assert.throws(()=>c2.captureMarineAssessorCompanionV2(y,p.q));
  const r={...p.refs.quality,referenceId:'source.'+label};assert.throws(()=>q2.validateWeatherMarineQualityReferenceV2(r,p.q));
  assert.throws(()=>c2.captureMarineAssessorCompanionV2({...p.input,qualityReference:r},p.q));
});
test('private fields inside provenance and nested metadata rejected rather than stripped',async t=>{
  const p=prepare(await parsed(t));
  for(const [obj,key,value] of [[p.qualityInput,'sourceAuthority',{status:'SYNTHETIC_FIXTURE',reference:{...p.refs.quality,referenceId:'source.user_id'}}],[p.input,'source',{...p.input.source,captain_id:'private'}]]){
    const x={...obj,[key]:value};assert.throws(()=>obj===p.qualityInput?q2.captureWeatherMarineQualityV2(x):c2.captureMarineAssessorCompanionV2(x,p.q));
  }
  const c=structuredClone(p.c);c.marineInputs.wind.source.metadata={name:'user_id',value:'private'};assert.throws(()=>c2.validateMarineAssessorCompanionV2(c,p.q));
});
test('accessors, prototypes, sparse arrays, cycles and misleading conversion hooks fail without invoking getters',async t=>{
  const p=prepare(await parsed(t));let calls=0;
  for(const [input,make] of [[p.qualityInput,q2.captureWeatherMarineQualityV2],[p.input,x=>c2.captureMarineAssessorCompanionV2(x,p.q)]]){
    for(const attack of [x=>Object.defineProperty(x,'source',{get(){calls++;return {};},enumerable:true}),x=>Object.setPrototypeOf(x,{inherited:1}),x=>Object.defineProperty(x,'toJSON',{value(){calls++;return {};},enumerable:true}),x=>x.constructor={},x=>Object.defineProperty(x,'__proto__',{value:{},enumerable:true}),x=>x.lineageReferences=new Array(2),x=>x.self=x]){const x=structuredClone(input);attack(x);assert.throws(()=>make(x));}
  }
  const r={...p.refs.companion};Object.defineProperty(r,'sha256',{get(){calls++;return '';},enumerable:true});assert.throws(()=>c2.validateMarineAssessorCompanionReferenceV2(r,p.c,p.q));assert.equal(calls,0);
});
test('detached immutable replay survives source mutation; no network/Auth/clock/random needed',async t=>{
  const m=await parsed(t),p=prepare(m),expected=structuredClone(p.A);m.wind.gustKnots=999;
  p.input.marineInputs.wind.gustKnots=777;p.qualityInput.qualityInputs.wind.speedKnots=555;
  t.mock.method(globalThis,'fetch',()=>{throw Error('network forbidden');});t.mock.method(Date,'now',()=>{throw Error('clock forbidden');});t.mock.method(Math,'random',()=>{throw Error('random forbidden');});
  const r=equivalent(p);assert.deepEqual(r.B,expected);
  const checkFrozen=x=>{if(x&&typeof x==='object'){assert(Object.isFrozen(x));Object.values(x).forEach(checkFrozen);}};
  checkFrozen(p.q);checkFrozen(p.c);Object.values(p.refs).forEach(checkFrozen);checkFrozen(r.r);
  assert.throws(()=>{r.r.wind.gustKnots=0;});
});
test('no implicit temporal authority or private wrapper dependency',async t=>{
  const p=prepare(await parsed(t));const r=equivalent(p);assert(!Object.hasOwn(r.r,'ageHours'));assert.equal(r.r.observedAt,p.q.qualityInputs.observedAt);
  // Wrappers are deliberately outside the reconstruction port, never supplied as scientific inputs.
  for(const wrapper of [{authenticated:false},{authenticated:true,userId:'synthetic',origin:[1,2],range:10}]){const request={wrapper,wires:p.wires};assert.deepEqual(reconstruct(request.wires,p.refs,p.support).B,p.A);}
});
for(const kind of ['quality','companion'])test('V3 exact '+kind+' reference binding and sign-only change',async t=>{
  const m=await parsed(t);m.wind[kind==='quality'?'speedKnots':'gustKnots']=-0;const a=prepare(m);m.wind[kind==='quality'?'speedKnots':'gustKnots']=0;const b=prepare(m);
  const build=r=>{const p=publication(),entries=structuredClone(p.evidence.entries);entries[0].reference=r;const evidence=freezeEvidenceV1(p.cycle,entries);return publicationV3({cycle:p.cycle,evidence,history:p.history,attempt:p.attempt,evaluation:{...p.evaluation,evidenceSetId:evidence.evidenceSetId}});};
  const A=build(a.refs[kind]),B=build(b.refs[kind]);assert.equal(A.publicationId,B.publicationId);assert.notEqual(A.contentDigest,B.contentDigest);assert.deepEqual(validatePublicationV3(JSON.parse(JSON.stringify(A))),A);
  for(const [key,value] of [['contractVersion',kind==='quality'?q1.WEATHER_MARINE_QUALITY_CAPTURE_V1:c1.MARINE_ASSESSOR_COMPANION_V1],['sha256','0'.repeat(64)],['referenceId','wrong-capture']]){
    const bad=structuredClone(A);bad.evidence.entries[0].reference[key]=value;assert.throws(()=>validatePublicationV3(bad));
    assert.throws(()=>kind==='quality'?q2.validateWeatherMarineQualityReferenceV2(bad.evidence.entries[0].reference,a.q):c2.validateMarineAssessorCompanionReferenceV2(bad.evidence.entries[0].reference,a.c,a.q));
  }
});
test('diagnostic performance for both successors; no production budget',async t=>{
  const m=await parsed(t);nine.forEach(([f,k])=>m[f][k]=-0);const p=prepare(m),old=inputs(m),oldc=c1.captureMarineAssessorCompanionV1(old.input,old.q),iterations=20;
  const time=fn=>{const start=performance.now();for(let i=0;i<iterations;i++)fn();return (performance.now()-start)/iterations;};
  const oldQ=q1.serializeWeatherMarineQualityCaptureV1(old.q),oldC=c1.serializeMarineAssessorCompanionV1(oldc,old.q);
  const results=[['quality',oldQ,p.wires.quality,()=>q1.serializeWeatherMarineQualityCaptureV1(old.q),()=>q2.serializeWeatherMarineQualityCaptureV2(p.q),()=>q1.replayWeatherMarineQualityV1(q1.readWeatherMarineQualityCaptureV1(oldQ)),()=>q2.replayWeatherMarineQualityV2(q2.readWeatherMarineQualityCaptureV2(p.wires.quality))],
    ['companion',oldC,p.wires.companion,()=>c1.serializeMarineAssessorCompanionV1(oldc,old.q),()=>c2.serializeMarineAssessorCompanionV2(p.c,p.q),()=>c1.replayMarineAssessorCompanionV1(c1.readMarineAssessorCompanionV1(oldC,old.q),old.q),()=>c2.replayMarineAssessorCompanionV2(c2.readMarineAssessorCompanionV2(p.wires.companion,p.q),p.q)]].map(([family,a,b,sa,sb,ra,rb])=>({family,iterations,v1Bytes:Buffer.byteLength(a),v2Bytes:Buffer.byteLength(b),v1SerializeMs:time(sa),v2SerializeMs:time(sb),v1ReadReplayMs:time(ra),v2ReadReplayMs:time(rb)}));
  console.log('EXACT_MARINE_PERFORMANCE='+JSON.stringify(results));
});
test('historical capture source bytes remain checkpoint-identical; production has one exact encoder',()=>{
  for(const [file,expected] of [['weatherMarineQualityCapture.mjs','53f5d1c44fe8842e2e715b2504720f66d3623dda'],['marineAssessorCompanionCapture.mjs','e47f734c14c43f0327076bf88e30d557b886f071']]){
    const s=readFileSync(new URL('../'+file,import.meta.url),'utf8').replaceAll('\r\n','\n');assert.equal(createHash('sha1').update('blob '+Buffer.byteLength(s)+'\0'+s).digest('hex'),expected);
  }
  for(const file of ['currentEvidenceCaptureV2.mjs','weatherMarineQualityCaptureV2.mjs','marineAssessorCompanionCaptureV2.mjs']){const s=readFileSync(new URL('../'+file,import.meta.url),'utf8');assert(s.includes("from './exactScientificEvidence.mjs'"));assert(!s.includes('function exactJson'));}
});

import {buildOceanEvidenceLineage,getMoonConditions,assessOceanConditions} from '../server.js';
import {currentQuality} from './fixtures/weatherMarineQualityFixture.mjs';
function lineage(dataQuality){return buildOceanEvidenceLineage({groups:{temperature:{available:true},current:{available:true},productivity:{available:true}},environmentalOpportunityEvidence:{openWater:{available:true},persistence:{available:true}},limitations:[],dataQuality});}
for(const [name,opts,expected] of [['complete',{},'complete'],['degraded',{weatherFail:true},'degraded'],['insufficient',{marineFail:true},'insufficient'],['fulfilled all missing',{weather:{wind_speed_10m:undefined},marine:{wave_height:undefined,swell_wave_height:undefined,sea_surface_temperature:undefined}},'insufficient']])test('explicit quality state and lineage reconstruction '+name,async t=>{
  const p=prepare(await parsed(t,opts)),r=equivalent(p);assert.equal(p.Aquality.overall.classification,expected);assert.deepEqual(lineage(r.dataQuality),lineage(p.Aquality));
});
test('usable-with-gaps quality and lineage use same explicit supporting current context',async t=>{
  const m=await parsed(t),p=prepare(m),r=reconstruct(p.wires,p.refs,p.support);
  const ctx={chlorophyll:{concentrationMgM3:null,observedAt:null,ageHours:null,source:{availability:'no-valid-pixel'}},currents:{...captureFixture('CURRENTS').samples[0].point,ageHours:1},moon:getMoonConditions('2026-09-24T01:00:00Z'),chlorophyllResult:{status:'fulfilled'},gapFilledChlorophyllResult:{status:'fulfilled'},currentsResult:{status:'fulfilled'}};
  const A=currentQuality(m,ctx),B=currentQuality({...r.r,sst:current.replayCurrentEvidenceSourceV2(p.sst).samples[0].point},ctx);
  assert.equal(A.overall.classification,'usable-with-gaps');assert.deepEqual(A,B);assert.deepEqual(lineage(A),lineage(B));
  assert.deepEqual(assessOceanConditions({...m,dataQuality:A}),assessOceanConditions({...r.r,dataQuality:B}));
});
test('removing producer derived outputs does not prevent reconstruction from frozen bytes',async t=>{
  const m=await parsed(t),p=prepare(m),expected=structuredClone(p.A),quality=structuredClone(p.Aquality);
  delete p.A;delete p.Aquality;delete p.expectedNormalized;delete p.input;delete p.qualityInput;delete p.q;delete p.c;delete p.sst;
  delete m.wind;delete m.waves;delete m.swell;
  const r=reconstruct(p.wires,p.refs,p.support);assert.deepEqual(r.B,expected);assert.deepEqual(r.dataQuality,quality);assert.equal(compare(expected,r.B).classification,'EXACT_MATCH');
});
test('quality all-provider rejection remains unrepresentable and finite evidence cannot upgrade failure',async t=>{
  const p=prepare(await parsed(t)),x=structuredClone(p.qualityInput);
  x.qualityInputs.diagnostics.providerStatus={weatherApi:'rejected',marineApi:'rejected'};x.qualityInputs.wind.speedKnots=null;x.qualityInputs.waves.heightFeet=null;x.qualityInputs.swell.heightFeet=null;assert.throws(()=>q2.captureWeatherMarineQualityV2(x));
  const y=structuredClone(p.qualityInput);y.qualityInputs.diagnostics.providerStatus.weatherApi='rejected';assert.throws(()=>q2.captureWeatherMarineQualityV2(y));
});
test('finite-null changes and optional-absence do not collapse; schema has no optional extension fields',async t=>{
  const m=await parsed(t),a=prepare(m);m.waves.periodSeconds=null;const b=prepare(m);
  assert.notEqual(a.c.captureId,b.c.captureId);assert.equal(equivalent(b).r.waves.periodSeconds,null);
  const absent=structuredClone(b.input);delete absent.marineInputs.waves.periodSeconds;assert.throws(()=>c2.captureMarineAssessorCompanionV2(absent,b.q));
  assert.throws(()=>c2.captureMarineAssessorCompanionV2({...b.input,optionalMetadata:null},b.q));
});
test('same shared size/depth bounds and noncanonical minus-zero spellings apply to both successors',async t=>{
  const m=await parsed(t);m.wind.speedKnots=-0;m.wind.gustKnots=-0;const p=prepare(m);
  for(const [wire,field,read] of [[p.wires.quality,'speedKnots',q2.readWeatherMarineQualityCaptureV2],[p.wires.companion,'gustKnots',s=>c2.readMarineAssessorCompanionV2(s,p.q)]]){
    for(const n of ['-0.0','-0e0','+0','"-0"','NaN','Infinity','{"value":-0}'])assert.throws(()=>read(wire.replace('"'+field+'":-0','"'+field+'":'+n)));
    assert.throws(()=>read(' '.repeat(1024*1024+1)));assert.throws(()=>read('['.repeat(100)+']'.repeat(100)));
  }
});

import {oceanArchiveIdentityV1} from '../../shared/oceanProductArchive.mjs';
import {frame} from './fixtures/temporalEvidenceFixture.mjs';
test('canonical archive references coexist without restoring sign or claiming exact archive authority',async t=>{
  const m=await parsed(t);m.wind.speedKnots=-0;m.wind.gustKnots=-0;const p=prepare(m),i=oceanArchiveIdentityV1(frame(0,'original',-0));
  const archive={kind:'archive',archiveId:i.archiveId,frameId:i.frameId,receiptDigest:hash('synthetic-receipt'),contentDigest:i.contentDigest};
  p.qualityInput.lineageReferences.push(archive);const q=q2.captureWeatherMarineQualityV2(p.qualityInput);
  const input={...p.input,qualityReference:q2.weatherMarineQualityReferenceV2(q),lineageReferences:[...p.input.lineageReferences,archive]};const c=c2.captureMarineAssessorCompanionV2(input,q);
  const restored=q2.readWeatherMarineQualityCaptureV2(q2.serializeWeatherMarineQualityCaptureV2(q));const cr=c2.readMarineAssessorCompanionV2(c2.serializeMarineAssessorCompanionV2(c,q),restored);
  const replay=c2.replayMarineAssessorCompanionV2(cr,restored);assert(Object.is(replay.wind.speedKnots,-0));assert(Object.is(replay.wind.gustKnots,-0));assert.deepEqual(cr.lineageReferences.at(-1),archive);
});
for(const key of ['latitude','longitude'])test('quality location exact sign and nonfinite binding '+key,async t=>{
  const p=prepare(await parsed(t)),x=structuredClone(p.qualityInput);x.location[key]=-0;const a=q2.captureWeatherMarineQualityV2(x);x.location[key]=0;const b=q2.captureWeatherMarineQualityV2(x);
  assert.notEqual(a.captureId,b.captureId);assert.notEqual(a.scientificContentDigest,b.scientificContentDigest);assert(Object.is(q2.replayWeatherMarineQualityV2(q2.readWeatherMarineQualityCaptureV2(q2.serializeWeatherMarineQualityCaptureV2(a))).location[key],-0));
  for(const bad of [NaN,Infinity,-Infinity,null,'0',undefined]){x.location[key]=bad;assert.throws(()=>q2.captureWeatherMarineQualityV2(x));}
});

// Adversarial review: shared parameterization must not turn domain identifiers into objects.
import {exactDigest,exactJson} from '../exactScientificEvidence.mjs';
test('shared digest rejects malformed or inherited domain identifiers before reading descriptors',()=>{
  for(const bad of [null,undefined,0,-0,false,{},[],Object.create({version:'inherited'}),'','bad domain']){
    assert.throws(()=>exactDigest(bad,'scientific-content',{}));
    assert.throws(()=>exactDigest(current.CURRENT_EVIDENCE_CAPTURE_V2,bad,{}));
  }
});
test('shared digest never invokes hostile domain getters',()=>{
  let calls=0;const hostile={};Object.defineProperty(hostile,'version',{enumerable:true,get(){calls++;return 'hostile';}});
  assert.throws(()=>exactDigest(hostile,'scientific-content',{}));assert.throws(()=>exactDigest(current.CURRENT_EVIDENCE_CAPTURE_V2,hostile,{}));assert.equal(calls,0);
});

for(const bits of [0b000111000,0b111000111,0b000000111,0b001100110])test('adversarial mixed family signs '+bits,async t=>{
  const m=await parsed(t);nine.forEach(([f,k],i)=>m[f][k]=bits&(1<<i)?-0:0);const p=prepare(m),r=equivalent(p).r;nine.forEach(([f,k])=>assert(Object.is(r[f][k],m[f][k])));
});
function protocols(p){return [
  {name:'current',capture:p.sst,ref:p.refs.sst,validate:current.validateCurrentEvidenceCaptureV2,verify:r=>current.validateCurrentCaptureReferenceV2(r,p.sst),purpose:current.EXACT_CURRENT_REFERENCE_V1},
  {name:'quality',capture:p.q,ref:p.refs.quality,validate:q2.validateWeatherMarineQualityCaptureV2,verify:r=>q2.validateWeatherMarineQualityReferenceV2(r,p.q),purpose:q2.EXACT_WEATHER_MARINE_REFERENCE_V1},
  {name:'companion',capture:p.c,ref:p.refs.companion,validate:x=>c2.validateMarineAssessorCompanionV2(x,p.q),verify:r=>c2.validateMarineAssessorCompanionReferenceV2(r,p.c,p.q),purpose:c2.EXACT_MARINE_COMPANION_REFERENCE_V1}
];}
test('all six cross-family capture ID/reference substitutions fail despite valid hash syntax',async t=>{
  const all=protocols(prepare(await parsed(t)));
  for(const a of all)for(const b of all)if(a!==b){
    assert.throws(()=>a.verify(b.ref));assert.throws(()=>a.verify({...a.ref,referenceId:b.ref.referenceId}));assert.throws(()=>a.verify({...a.ref,sha256:b.ref.sha256}));assert.throws(()=>a.validate({...a.capture,captureId:b.capture.captureId}));
    const wrongPurpose=exactDigest(a.capture.contractVersion,b.purpose,a.capture);assert.throws(()=>a.verify({...a.ref,sha256:wrongPurpose}));
    const wrongVersion=exactDigest(b.capture.contractVersion,a.purpose,a.capture);assert.throws(()=>a.verify({...a.ref,sha256:wrongVersion}));
  }
});
test('malformed prefixes, case, hash length and reference version extensions reject across all families',async t=>{
  for(const p of protocols(prepare(await parsed(t)))){
    for(const id of ['bad-'+p.capture.captureId.slice(5),p.capture.captureId.toUpperCase(),p.capture.captureId+'0',p.capture.captureId.slice(0,-1)])assert.throws(()=>p.verify({...p.ref,referenceId:id}));
    for(const extra of [{serializationVersion:'other'},{digestVersion:'other'},{purpose:'other'},{contractVersion:p.purpose}])assert.throws(()=>p.verify({...p.ref,...extra}));
    for(const key of Object.keys(p.ref)){const r={...p.ref};delete r[key];assert.throws(()=>p.verify(r));}
    for(const key of ['serializationVersion','digestVersion'])assert.throws(()=>p.validate({...p.capture,[key]:'other'}));
  }
});
test('reference descriptors and inherited fields fail without getters on all three protocols',async t=>{
  let called=0;
  for(const p of protocols(prepare(await parsed(t)))){
    for(const key of Object.keys(p.ref)){
      const r={...p.ref};Object.defineProperty(r,key,{enumerable:true,get(){called++;return p.ref[key];}});assert.throws(()=>p.verify(r));
      const s={...p.ref};Object.defineProperty(s,key,{enumerable:true,set(v){called++;}});assert.throws(()=>p.verify(s));
      const inherited=Object.create({[key]:p.ref[key]});Object.assign(inherited,p.ref);delete inherited[key];assert.throws(()=>p.verify(inherited));
    }
  }
  assert.equal(called,0);
});
for(const [name,change] of [
 ['authority',x=>x.sourceAuthority.status='RECORDED_NOT_REQUALIFIED'],
 ['authority reference',x=>x.sourceAuthority.reference.referenceId='different-authority'],
 ['lineage',x=>x.lineageReferences.push(ref('additional-lineage'))],
 ['lineage order',x=>x.lineageReferences.reverse()],
 ['quality time',x=>x.qualityInputs.observedAt='2026-09-23T23:00:00Z'],
 ['latitude',x=>x.location.latitude=25.00001],
 ['longitude',x=>x.location.longitude=-90.00001],
 ['acquisition',x=>{x.qualityInputs.diagnostics.providerStatus.weatherApi='rejected';x.qualityInputs.wind.speedKnots=null;}]
])test('companion binding guards quality envelope '+name,async t=>{
  const p=prepare(await parsed(t)),x=structuredClone(p.qualityInput);change(x);const other=q2.captureWeatherMarineQualityV2(x);
  assert.throws(()=>c2.validateMarineAssessorCompanionV2(p.c,other));assert.throws(()=>c2.captureMarineAssessorCompanionV2(p.input,other));
  if(name!=='acquisition'){
    const updated=c2.captureMarineAssessorCompanionV2({...p.input,qualityReference:q2.weatherMarineQualityReferenceV2(other)},other);
    assert.notEqual(updated.captureId,p.c.captureId);assert.notEqual(updated.scientificContentDigest,p.c.scientificContentDigest);assert.notEqual(c2.marineAssessorCompanionReferenceV2(updated,other).sha256,p.refs.companion.sha256);
  }else assert.throws(()=>c2.captureMarineAssessorCompanionV2({...p.input,qualityReference:q2.weatherMarineQualityReferenceV2(other)},other));
});
test('sign conflicting duplicate numeric keys reject in both directions for all nine measurements',async t=>{
  const m=await parsed(t);nine.forEach(([f,k])=>m[f][k]=-0);const a=prepare(m);nine.forEach(([f,k])=>m[f][k]=0);const b=prepare(m);
  for(const [family,field,owner] of nine)for(const [p,first,last] of [[a,'-0','0'],[b,'0','-0']]){
    const wire=owner==='quality'?p.wires.quality:p.wires.companion;
    // Target the named family so repeated wave/swell names cannot mask coverage.
    const root=JSON.parse(wire),obj=owner==='quality'?root.qualityInputs[family]:root.marineInputs[family];
    const original=exactJson(obj),changed=original.replace('"'+field+'":'+first,'"'+field+'":'+first+',"'+field+'":'+last);
    assert.notEqual(changed,original);const attack=wire.replace('"'+family+'":'+original,'"'+family+'":'+changed);assert.notEqual(attack,wire);
    assert.throws(()=>owner==='quality'?q2.readWeatherMarineQualityCaptureV2(attack):c2.readMarineAssessorCompanionV2(attack,p.q));
  }
});
test('every normalized scientific field rejects sign tampering after serialization and reference retention',async t=>{
  for(const [family,field,owner] of nine){const m=await parsed(t);m[family][field]=-0;const p=prepare(m),c=structuredClone(owner==='quality'?p.q:p.c);(owner==='quality'?c.qualityInputs:c.marineInputs)[family][field]=0;
    assert.throws(()=>owner==='quality'?q2.validateWeatherMarineQualityCaptureV2(c):c2.validateMarineAssessorCompanionV2(c,p.q));
    assert.throws(()=>owner==='quality'?q2.validateWeatherMarineQualityReferenceV2(p.refs.quality,c):c2.validateMarineAssessorCompanionReferenceV2(p.refs.companion,c,p.q));
  }
});
test('post-construction mutation of every provenance/binding input cannot affect accepted records',async t=>{
  const p=prepare(await parsed(t)),before={q:p.wires.quality,c:p.wires.companion,refs:structuredClone(p.refs)};
  p.qualityInput.sourceAuthority.reference.referenceId='changed';p.qualityInput.lineageReferences.reverse();p.qualityInput.source.provider='changed';
  p.input.source.weatherModel=null;p.input.marineInputs.wind.source.availability='provider-returned-null';p.input.lineageReferences[0].referenceId='changed';p.input.qualityReference={...p.input.qualityReference,sha256:'0'.repeat(64)};
  assert.equal(q2.serializeWeatherMarineQualityCaptureV2(p.q),before.q);assert.equal(c2.serializeMarineAssessorCompanionV2(p.c,p.q),before.c);assert.deepEqual(p.refs,before.refs);equivalent(p);
});
test('inventory reconciles all nine exact capture paths and actual reviewed scientific consumer paths',()=>{
  const inventory=JSON.parse(readFileSync(new URL('../../docs/Exact_Marine_Capture_Inventory_v2.json',import.meta.url))).inventory;
  assert.equal(inventory.length,9);assert.equal(new Set(inventory.map(x=>x.normalizedPath)).size,9);
  const source=readFileSync(new URL('../server.js',import.meta.url),'utf8');
  const graph=discoverDefaultGraph();
  verifyExtractionGraph(graph,Object.fromEntries(Object.keys(graph.sourceHashes).map(file=>[file,readFileSync(new URL('../../'+file,import.meta.url),'utf8')])));
  for(const [family,field,owner,output] of nine){const row=inventory.find(x=>x.normalizedPath===family+'/'+field);assert(row);assert.equal(row.capturePath,(owner==='quality'?'qualityInputs':'marineInputs')+'/'+family+'/'+field);assert.equal(row.consumer.scientificPath,'/oceanConditions/'+output);assert(source.includes(row.producer.transportField));assert(graph.nodes.some(node=>node.function===row.producer.converter));}
});
test('V3 binds protocol versions and cross-family references as distinct content, not interchangeable resolution',async t=>{
  const p=prepare(await parsed(t)),all=protocols(p);
  const build=r=>{const b=publication(),entries=structuredClone(b.evidence.entries);entries[0].reference=r;const evidence=freezeEvidenceV1(b.cycle,entries);return publicationV3({cycle:b.cycle,evidence,history:b.history,attempt:b.attempt,evaluation:{...b.evaluation,evidenceSetId:evidence.evidenceSetId}});};
  for(const a of all.slice(1))for(const b of all)if(a!==b){
    const original=build(a.ref),other=build(b.ref);assert.notEqual(original.contentDigest,other.contentDigest);
    const tampered=structuredClone(original);tampered.evidence.entries[0].reference=b.ref;assert.throws(()=>validatePublicationV3(tampered));assert.throws(()=>a.verify(b.ref));
    const protocol={...a.ref,contractVersion:b.purpose};assert.throws(()=>a.verify(protocol));assert.notEqual(build(protocol).contentDigest,original.contentDigest);
  }
  // V3 is intentionally an opaque reference binder. Exact family resolution is enforced by the typed validator.
});
