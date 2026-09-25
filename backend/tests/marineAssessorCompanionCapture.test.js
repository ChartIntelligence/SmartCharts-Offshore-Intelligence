import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assessOceanConditions} from '../server.js';
import {captureMarineAssessorCompanionV1 as capture,validateMarineAssessorCompanionV1 as validate,
  replayMarineAssessorCompanionV1 as replay,serializeMarineAssessorCompanionV1 as serialize,
  readMarineAssessorCompanionV1 as read,marineAssessorCompanionReferenceV1 as reference} from '../marineAssessorCompanionCapture.mjs';
import {parsed,inputs,currentSupport,sixFields} from './fixtures/marineAssessorCompanionFixture.mjs';
import {frame,publication} from './fixtures/temporalEvidenceFixture.mjs';
import {planOceanArchiveWriteV1} from '../../shared/oceanProductArchive.mjs';
import {freezeEvidenceV1,publicationV3,hash} from '../../shared/oceanPublication.mjs';
import {captureWeatherMarineQualityV1 as captureQuality,weatherMarineQualityReferenceV1 as qualityReference} from '../weatherMarineQualityCapture.mjs';
import {qualityCaptureInput} from './fixtures/weatherMarineQualityFixture.mjs';

function compare(m) {
  const {q,input}=inputs(m),c=capture(input,q),r=replay(read(serialize(c,q),q),q);
  for(const k of ['wind','waves','swell','source','location','observedAt'])assert.deepEqual(r[k],m[k]);
  assert.deepEqual(r.diagnostics.providerStatus,m.diagnostics.providerStatus);
  const support=currentSupport(m),a=support.quality(m),b=support.quality({...r,sst:support.replaySst});
  assert.deepEqual(a,b);
  const expected=assessOceanConditions({...m,dataQuality:a});
  assert.deepEqual(assessOceanConditions({...r,dataQuality:b}),expected);
  return {q,input,c,r,expected};
}
for(const [family,field,transport,value] of sixFields)test('six-field controlled equivalence: '+family+'.'+field,async t=>{
  const a=compare(await parsed(t)),b=compare(await parsed(t,{[family==='wind'?'weather':'marine']:{[transport]:value}}));
  assert.deepEqual(a.q,b.q);assert.notEqual(a.c.captureId,b.c.captureId);assert.notDeepEqual(a.expected,b.expected);
});
for(const [name,opts] of [
  ['complete',{}],['units provenance',{units:true}],['weather rejected',{weatherFail:true}],['marine rejected',{marineFail:true}],
  ['no weather current',{noWeatherCurrent:true}],['wind all missing',{weather:{wind_speed_10m:undefined,wind_gusts_10m:undefined,wind_direction_10m:undefined}}],
  ['speed missing only',{weather:{wind_speed_10m:undefined}}],['invalid quality time',{weather:{time:'invalid'}}],
  ['future quality time',{weather:{time:'2040-01-01T00:00:00Z'}}]
])test('three-contract complete marine input and same-assessor equivalence: '+name,async t=>{compare(await parsed(t,opts));});
for(let mask=0;mask<8;mask++)test('partial family availability combination '+mask,async t=>{
  compare(await parsed(t,{weather:{wind_speed_10m:mask&1?undefined:4},marine:{wave_height:mask&2?undefined:1,swell_wave_height:mask&4?undefined:0.5}}));
});
for(const [family,field,transport] of sixFields){
  for(const value of [0,null,-1,721])test('normalized exact value '+family+'.'+field+' = '+value,async t=>{
    const m=await parsed(t);m[family][field]=value;
    const result=compare(m);assert.equal(result.r[family][field],value);
  });
  test('upstream normalization stays unresolved '+family+'.'+field,async t=>{
    const options=value=>({[family==='wind'?'weather':'marine']:{[transport]:value}});
    const nullResult=await parsed(t,options(null)),absent=await parsed(t,options(undefined));
    assert.equal(nullResult[family][field],field==='gustKnots'?0:null);assert.equal(absent[family][field],null);
    compare(nullResult);compare(absent);
  });
  test('malformed/nonfinite reject '+family+'.'+field,async t=>{
    const {q,input}=inputs(await parsed(t));
    for(const value of [NaN,Infinity,-Infinity,'3',undefined,{},[]]){
      const x=structuredClone(input);x.marineInputs[family][field]=value;assert.throws(()=>capture(x,q));
    }
  });
}
test('full wind availability and provenance are preserved, not inferred from speed',async t=>{
  const a=compare(await parsed(t,{weather:{wind_speed_10m:undefined,wind_gusts_10m:undefined,wind_direction_10m:undefined}}));
  const b=compare(await parsed(t,{weather:{wind_speed_10m:undefined}}));
  assert.deepEqual(a.q,b.q);assert.equal(a.r.wind.source.availability,'provider-returned-null');
  assert.equal(b.r.wind.source.availability,'available');assert.notEqual(a.c.captureId,b.c.captureId);
});
test('family swaps, unknown family, foreign payload and species fields fail closed',async t=>{
  const {q,input}=inputs(await parsed(t));
  for(const [a,b] of [['wind','waves'],['waves','swell'],['swell','wind']]){
    const x=structuredClone(input);[x.marineInputs[a],x.marineInputs[b]]=[x.marineInputs[b],x.marineInputs[a]];assert.throws(()=>capture(x,q));
  }
  for(const k of ['sst','chlorophyll','currents','bathymetry','species','score','confidence','rankingPermission']){
    const x=structuredClone(input);x.marineInputs[k]={value:1};assert.throws(()=>capture(x,q));
  }
});
test('value, direction/period, reference and source tampering rejects',async t=>{
  const {q,input,c}=compare(await parsed(t));
  for(const [family,field] of sixFields){const x=structuredClone(c);x.marineInputs[family][field]++;assert.throws(()=>validate(x,q));}
  const x=structuredClone(c);[x.marineInputs.waves.directionDegrees,x.marineInputs.waves.periodSeconds]=[x.marineInputs.waves.periodSeconds,x.marineInputs.waves.directionDegrees];assert.throws(()=>validate(x,q));
  for(const alter of [p=>p.source.provider='NOAA',p=>p.source.weatherModel='other',p=>p.marineInputs.wind.source.provider='marine',p=>p.qualityReference.sha256='a'.repeat(64)]){
    const p=structuredClone(input);alter(p);assert.throws(()=>capture(p,q));
  }
  const other=inputs(await parsed(t,{weather:{time:'2026-09-23T00:00:00Z'}})).q;
  assert.throws(()=>replay(c,other));
});
for(const label of ['captain_id','captainId','user_id','userId','auth_uuid','email','boat','origin','range','Fishing_Log','catch','lure','bait','private_coordinates','session','token','mission'])
test('privacy rejects keys and structured reference labels: '+label,async t=>{
  const {q,input}=inputs(await parsed(t));
  for(const sep of ['.','-','_']){
    const p=structuredClone(input);p.lineageReferences[0].referenceId='synthetic'+sep+label+sep+'17';assert.throws(()=>capture(p,q));
  }
  const p=structuredClone(input);p.marineInputs.wind[label]='private';assert.throws(()=>capture(p,q));
  const x=structuredClone(input);x.lineageReferences.push({name:label,value:'private'});assert.throws(()=>capture(x,q));
});
test('accessors, inherited values, prototype keys and toJSON never execute',async t=>{
  const {q,input,c}=compare(await parsed(t));
  for(const invoke of [capture,validate,replay,serialize,reference])for(const path of ['source','marineInputs.wind','qualityReference','lineageReferences']){
    const p=structuredClone(invoke===capture?input:c),parts=path.split('.'),key=parts.pop(),owner=parts.reduce((o,k)=>o[k],p);let reads=0;
    Object.defineProperty(owner,key,{get(){reads++;throw Error('getter');},enumerable:true});assert.throws(()=>invoke(p,q));assert.equal(reads,0);
  }
  for(const proto of [null,{gustKnots:10}]){const x=structuredClone(input);Object.setPrototypeOf(x.marineInputs.wind,proto);assert.throws(()=>capture(x,q));}
  const x=structuredClone(input);x.toJSON=()=>{throw Error('must not call');};assert.throws(()=>capture(x,q));
  const p=JSON.parse(JSON.stringify(input));Object.defineProperty(p,'__proto__',{value:{},enumerable:true});assert.throws(()=>capture(p,q));
});
test('canonical keys, meaningful provenance/order, detachment and deep freeze',async t=>{
  const {q,input,c}=compare(await parsed(t));
  const reverse=v=>Array.isArray(v)?v.map(reverse):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).reverse().map(([k,x])=>[k,reverse(x)])):v;
  assert.equal(capture(reverse(input),reverse(q)).captureId,c.captureId);
  const p=structuredClone(input);p.source.weatherModel='Weather Forecast API';assert.notEqual(capture(p,q).captureId,c.captureId);
  const a=structuredClone(input);a.lineageReferences.push({...a.lineageReferences[0],referenceId:'other'});
  const b=structuredClone(a);b.lineageReferences.reverse();assert.notEqual(capture(a,q).captureId,capture(b,q).captureId);
  const bytes=serialize(c,q),r=replay(c,q);input.marineInputs.wind.gustKnots=999;input.source.provider='other';input.lineageReferences[0].referenceId='other';
  assert.equal(serialize(c,q),bytes);assert.deepEqual(replay(c,q),r);
  const frozen=v=>{if(v&&typeof v==='object'){assert(Object.isFrozen(v));Object.values(v).forEach(frozen);}};frozen(c);frozen(r);
});
test('replay no network/Auth/captain or execution clock; quality time is not age',async t=>{
  const m=await parsed(t),support=currentSupport(m),{q,c,r,expected}=compare(m);
  t.mock.method(globalThis,'fetch',()=>{throw Error('network');});t.mock.method(Date,'now',()=>{throw Error('clock');});
  const NativeDate=Date;class LaterDate extends NativeDate {constructor(...a){super(...(a.length?a:['2040-01-01T00:00:00Z']));}}
  t.mock.property(globalThis,'Date',LaterDate);
  for(const wrapper of [{authenticated:false},{authenticated:true,origin:[1,2],range:5}]){
    assert.deepEqual(replay(c,q),r);assert(!Object.hasOwn(r,'ageHours'));void wrapper;
  }
  const dataQuality=support.quality({...r,sst:support.replaySst});
  assert.deepEqual(assessOceanConditions({...replay(c,q),dataQuality}),expected);
});
test('archive and V3 bind reference only, not capture bytes as frame',async t=>{
  const {q,c}=compare(await parsed(t)),r=reference(c,q);
  const plan=planOceanArchiveWriteV1(frame(),{writeId:'synthetic',archivedAt:'2026-09-24T01:00:00Z',storageReference:'synthetic',sourceRevision:null,
    rawEvidence:[{reference:r.referenceId,sha256:r.sha256,availability:'reference-only'}]});
  assert.equal(plan.intent.rawEvidence[0].sha256,hash(c));assert.throws(()=>planOceanArchiveWriteV1(c,plan.intent));
  const p=publication(),entries=structuredClone(p.evidence.entries);entries[0].reference=r;
  const evidence=freezeEvidenceV1(p.cycle,entries);
  const result=publicationV3({cycle:p.cycle,evidence,history:p.history,attempt:{id:'synthetic-companion',startedAt:p.cycle.scheduledAt,endedAt:p.cycle.scheduledAt},evaluation:{...p.evaluation,evidenceSetId:evidence.evidenceSetId}});
  assert.deepEqual(result.evidence.entries[0].reference,r);
});
test('generic module has no evaluator/acquisition dependency or species formulas',()=>{
  const text=readFileSync(new URL('../marineAssessorCompanionCapture.mjs',import.meta.url),'utf8');
  assert(!/blue.?marlin|assessOceanConditions|server\.js|fetch\(|Date\.|Math\.random|process\.env/i.test(text));
});

test('review: finite wind evidence cannot carry missing-source provenance',async t=>{
  const {q,input}=inputs(await parsed(t));
  for(const state of ['provider-returned-null','provider-returned-no-current-data']){
    const p=structuredClone(input);p.marineInputs.wind.source.availability=state;
    assert.throws(()=>capture(p,q));
  }
});
test('review: all-null wind cannot claim available provenance',async t=>{
  const {q,input}=inputs(await parsed(t,{weather:{wind_speed_10m:undefined,wind_gusts_10m:undefined,wind_direction_10m:undefined}}));
  input.marineInputs.wind.source.availability='available';assert.throws(()=>capture(input,q));
});

for(const dimension of ['location','time','speed','height','lineage','authority'])test('review: exact quality envelope binding rejects swap '+dimension,async t=>{
  const m=await parsed(t),{q,c,input}=compare(m),p=qualityCaptureInput(m);
  if(dimension==='location')p.location.longitude+=0.001;
  if(dimension==='time')p.qualityInputs.observedAt='2030-01-01T00:00:00Z';
  if(dimension==='speed')p.qualityInputs.wind.speedKnots++;
  if(dimension==='height')p.qualityInputs.waves.heightFeet++;
  if(dimension==='lineage')p.lineageReferences.reverse();
  if(dimension==='authority')p.sourceAuthority.reference.referenceId='different-authority';
  const other=captureQuality(p);
  for(const invoke of [validate,replay,serialize,reference])assert.throws(()=>invoke(c,other));
  assert.throws(()=>capture(input,other));assert.throws(()=>read(serialize(c,q),other));
  // Explicit construction against a different valid envelope has a different identity.
  const rebound={...input,qualityReference:qualityReference(other)};
  assert.notEqual(capture(rebound,other).captureId,c.captureId);
});
for(const part of ['kind','referenceId','contractVersion','sha256'])test('review: malformed/fabricated reference '+part,async t=>{
  const {q,input,c}=compare(await parsed(t));
  for(const value of [null,{},'fabricated']){
    const p=structuredClone(input);p.qualityReference[part]=value;assert.throws(()=>capture(p,q));
  }
  const damaged=structuredClone(q);damaged.captureId='wmq-fabricated';assert.throws(()=>replay(c,damaged));
});
for(const [family,field,transport] of sixFields)test('review: actual parser boundaries and directional units '+family+'.'+field,async t=>{
  for(const value of [0,-1,360,361,720,'malformed',NaN,Infinity]){
    const m=await parsed(t,{[family==='wind'?'weather':'marine']:{[transport]:value}});
    compare(m);
  }
  const {q,input}=inputs(await parsed(t));
  for(const key of ['units','speedKnots','heightFeet','observedAt','assessmentAt']){
    const p=structuredClone(input);p.marineInputs[family][key]='unsupported';assert.throws(()=>capture(p,q));
  }
});
test('review: all directed family swaps reject and direction/period tampering rejects in both families',async t=>{
  const {q,input,c}=compare(await parsed(t));
  for(const a of ['wind','waves','swell'])for(const b of ['wind','waves','swell'])if(a!==b){
    const p=structuredClone(input);p.marineInputs[a]=p.marineInputs[b];assert.throws(()=>capture(p,q));
  }
  for(const f of ['waves','swell']){
    const p=structuredClone(c);[p.marineInputs[f].directionDegrees,p.marineInputs[f].periodSeconds]=[p.marineInputs[f].periodSeconds,p.marineInputs[f].directionDegrees];
    assert.throws(()=>validate(p,q));
  }
});
test('review: provenance removal, conflicting classification, unused metadata fail closed',async t=>{
  const {q,input,c}=compare(await parsed(t));
  for(const path of ['source.provider','source.weatherModel','source.marineModel','marineInputs.wind.source.provider','marineInputs.wind.source.classification','marineInputs.wind.source.availability']){
    const p=structuredClone(input),parts=path.split('.'),key=parts.pop(),owner=parts.reduce((o,k)=>o[k],p);
    delete owner[key];assert.throws(()=>capture(p,q));
    const changed=structuredClone(c),cs=path.split('.'),ck=cs.pop(),co=cs.reduce((o,k)=>o[k],changed);co[ck]='substituted';assert.throws(()=>validate(changed,q));
  }
  for(const extra of [{name:'email',value:'private@example.test'},{flagId:'captain_id'},{revision:'unknown'},{dataset:'NOAA'}]){
    const p=structuredClone(input);Object.assign(p.source,extra);assert.throws(()=>capture(p,q));
  }
});
test('review: getters and setters on bound quality envelope are never invoked',async t=>{
  const {q,input,c}=compare(await parsed(t));
  for(const path of ['source','location','qualityInputs.wind.speedKnots','sourceAuthority.reference','lineageReferences']){
    for(const accessor of ['get','set']){
      const p=structuredClone(q),parts=path.split('.'),key=parts.pop(),owner=parts.reduce((o,k)=>o[k],p);let calls=0;
      Object.defineProperty(owner,key,{enumerable:true,[accessor](){calls++;throw Error('hostile');}});
      assert.throws(()=>capture(input,p));assert.throws(()=>replay(c,p));assert.equal(calls,0);
    }
  }
});
test('review: private metadata arrays, email/UUID and sparse/inherited data reject',async t=>{
  const {q,input}=inputs(await parsed(t));
  for(const text of ['captain.identity','Auth-UUID','Fishing_Log','private.coordinates','mission-context','private@example.test','12345678-1234-1234-1234-123456789abc']){
    const p=structuredClone(input);p.lineageReferences[0].referenceId=text;assert.throws(()=>capture(p,q));
  }
  for(const value of [[{name:'userId',value:'17'}],new Array(1),Object.create({referenceId:'inherited'})]){
    const p=structuredClone(input);p.lineageReferences=value;assert.throws(()=>capture(p,q));
  }
  const p=structuredClone(input);Object.defineProperty(p.source,'provider',{value:'Open-Meteo',enumerable:false});assert.throws(()=>capture(p,q));
});
test('review: parser, quality, reference and lineage mutation cannot change accepted content',async t=>{
  const m=await parsed(t),fixture=inputs(m),q=fixture.q,input=structuredClone(fixture.input),mutableQ=structuredClone(q),c=capture(input,mutableQ),bytes=serialize(c,q),r=replay(c,q);
  for(const [f,k] of sixFields){m[f][k]=999;input.marineInputs[f][k]=999;}
  m.wind.source.availability='other';input.source.weatherModel=null;input.lineageReferences[0].referenceId='other';
  input.qualityReference.sha256='f'.repeat(64);mutableQ.qualityInputs.wind.speedKnots=999;
  assert.equal(serialize(c,q),bytes);assert.deepEqual(replay(c,q),r);assert.throws(()=>replay(c,mutableQ));
  assert.throws(()=>{r.wind.gustKnots=999;});assert.throws(()=>{c.qualityReference.sha256='f'.repeat(64);});
});
test('review: explicit source identity does not authenticate a fabricated but consistent producer',async t=>{
  const {q,input}=inputs(await parsed(t));input.marineInputs.waves.periodSeconds=123;
  const c=capture(input,q);assert.equal(replay(c,q).waves.periodSeconds,123);
  // Truthful measurement identity/units cannot be proven from self-consistent bytes.
  // No qualification flag is added by validation; authority stays upstream.
  assert(!Object.hasOwn(c,'qualified'));assert(!Object.hasOwn(c,'assessmentAt'));
});
