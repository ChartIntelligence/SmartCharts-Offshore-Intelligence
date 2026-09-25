import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getMarineConditions,getMoonConditions,buildOceanEvidenceLineage} from '../server.js';
import {captureWeatherMarineQualityV1 as capture,validateWeatherMarineQualityCaptureV1 as validate,
  serializeWeatherMarineQualityCaptureV1 as serialize,readWeatherMarineQualityCaptureV1 as read,
  replayWeatherMarineQualityV1 as replay,weatherMarineQualityReferenceV1 as reference} from '../weatherMarineQualityCapture.mjs';
import {captureCurrentEvidenceV1 as currentCapture,replayCurrentEvidenceSourceV1 as currentReplay,
  captureSampleAgeV1 as age} from '../currentEvidenceCapture.mjs';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {qualityCaptureInput,currentQuality} from './fixtures/weatherMarineQualityFixture.mjs';
import {frame,publication} from './fixtures/temporalEvidenceFixture.mjs';
import {planOceanArchiveWriteV1} from '../../shared/oceanProductArchive.mjs';
import {freezeEvidenceV1,publicationV3,hash} from '../../shared/oceanPublication.mjs';

const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'};
function supporting(at=assessment) {
  const point=family=>{const c=currentCapture(captureFixture(family));return {...currentReplay(c).samples[0].point,ageHours:age(c,'center',at)};};
  return {chlorophyll:point('CHLOROPHYLL_DIRECT'),currents:point('CURRENTS'),moon:getMoonConditions(at.assessmentAt),
    chlorophyllResult:{status:'fulfilled'},gapFilledChlorophyllResult:{status:'fulfilled'},currentsResult:{status:'fulfilled'}};
}
function lineage(q,available=true) {
  return buildOceanEvidenceLineage({groups:{temperature:{available},current:{available},productivity:{available}},
    environmentalOpportunityEvidence:{openWater:{available},persistence:{available}},limitations:[],dataQuality:q});
}
async function parsed(t,opts={}) {
  const mock=t.mock.method(globalThis,'fetch',async url=>{
    const weather=String(url).includes('api.open-meteo.com/v1/forecast');
    if(weather?opts.weatherFail:opts.marineFail)throw Error('synthetic acquisition failure');
    const current=weather
      ? {time:'2026-09-24T00:00:00Z',wind_speed_10m:4,wind_direction_10m:90,wind_gusts_10m:6,...opts.weather}
      : {time:'2026-09-24T00:00:00Z',sea_surface_temperature:26,wave_height:1,wave_period:7,swell_wave_height:0.5,swell_wave_direction:120,swell_wave_period:8,...opts.marine};
    return {ok:true,json:async()=>({latitude:25.05,longitude:-90.05,current})};
  });
  try{return await getMarineConditions(25,-90);}finally{mock.mock.restore();}
}
function projection(m) { const p=qualityCaptureInput(m);return {location:p.location,...p.qualityInputs}; }
function fixture() {
  return qualityCaptureInput({location:{latitude:25,longitude:-90},wind:{speedKnots:8},waves:{heightFeet:3},swell:{heightFeet:2},
    observedAt:'2026-09-24T00:00:00Z',diagnostics:{providerStatus:{weatherApi:'fulfilled',marineApi:'fulfilled'}}});
}
function sstCapture(m) {
  const p=captureFixture();p.samples[0].point={...m.sst,source:{provider:'Open-Meteo',classification:'forecast-model',
    availability:Number.isFinite(m.sst.temperatureFahrenheit)?'available':'unavailable'}};
  return currentCapture(p);
}
function reconstructed(c,sst) {return {...replay(read(serialize(c))),sst:currentReplay(sst).samples[0].point};}

const cases=[
  ['all valid',{},'complete',['live','live','live']],
  ['wind missing',{weather:{wind_speed_10m:undefined}},'degraded',['unavailable','live','live']],
  ['waves missing',{marine:{wave_height:undefined}},'degraded',['live','unavailable','live']],
  ['swell missing',{marine:{swell_wave_height:undefined}},'degraded',['live','live','unavailable']],
  ['multiple missing',{marine:{wave_height:undefined,swell_wave_height:undefined}},'degraded',['live','unavailable','unavailable']],
  ['fulfilled all missing',{weather:{wind_speed_10m:undefined},marine:{wave_height:undefined,swell_wave_height:undefined,sea_surface_temperature:undefined}},'insufficient',['unavailable','unavailable','unavailable']],
  ['weather failed',{weatherFail:true},'degraded',['degraded','live','live']],
  ['marine failed',{marineFail:true},'insufficient',['live','degraded','degraded']],
  ['wind zero',{weather:{wind_speed_10m:0}},'complete',['live','live','live']],
  ['waves and swell zero',{marine:{wave_height:0,swell_wave_height:0}},'complete',['live','live','live']]
];
for(const [name,opts,classification,states] of cases)test('actual parsers -> capture -> SAME quality assembler: '+name,async t=>{
  const m=await parsed(t,opts),c=capture(qualityCaptureInput(m)),sst=sstCapture(m),ctx=supporting();
  assert.deepEqual(replay(read(serialize(c))),projection(m));
  const a=currentQuality(m,ctx),b=currentQuality(reconstructed(c,sst),ctx);
  assert.deepEqual(b,a);assert.deepEqual(lineage(b),lineage(a));
  assert.equal(a.overall.classification,classification);
  assert.deepEqual(['wind','waves','swell'].map(k=>a.layers[k].state),states);
});
test('same SST with different weather quality and acquisition status is now distinguishable',async t=>{
  const a=await parsed(t),b=await parsed(t,{weatherFail:true}),d=await parsed(t,{weather:{wind_speed_10m:undefined}});
  assert.deepEqual(sstCapture(a),sstCapture(b));assert.deepEqual(sstCapture(b),sstCapture(d));
  const captures=[a,b,d].map(m=>capture(qualityCaptureInput(m)));
  assert.equal(new Set(captures.map(c=>c.captureId)).size,3);
  const q=captures.map((c,i)=>currentQuality(reconstructed(c,sstCapture([a,b,d][i])),supporting()));
  assert.equal(q[1].layers.wind.state,'degraded');assert.equal(q[2].layers.wind.state,'unavailable');
  assert.notDeepEqual(lineage(q[0]),lineage(q[1]));
});
test('quality usable-with-gaps and supporting stale retain existing semantics',async t=>{
  const m=await parsed(t),c=capture(qualityCaptureInput(m)),ctx=supporting();
  ctx.chlorophyll={concentrationMgM3:null,observedAt:null,ageHours:null,source:{availability:'no-valid-pixel'}};
  const q=currentQuality(reconstructed(c,sstCapture(m)),ctx);
  assert.equal(q.overall.classification,'usable-with-gaps');assert.deepEqual(q,currentQuality(m,ctx));
  const later=supporting({...assessment,assessmentAt:'2026-09-29T01:00:00Z'});
  const stale=currentQuality(reconstructed(c,sstCapture(m)),later);
  assert.equal(stale.layers.chlorophyll.state,'stale');assert.equal(stale.layers.currents.state,'stale');
  assert.deepEqual(stale,currentQuality(m,later));
});
test('both providers rejected has no current normalized object and fails closed',async t=>{
  await assert.rejects(parsed(t,{weatherFail:true,marineFail:true}));
  const f=fixture();f.qualityInputs.wind.speedKnots=null;f.qualityInputs.waves.heightFeet=null;f.qualityInputs.swell.heightFeet=null;
  f.qualityInputs.diagnostics.providerStatus={weatherApi:'rejected',marineApi:'rejected'};assert.throws(()=>capture(f));
});
test('upstream transport null coercion is recorded, not silently repaired or qualified',async t=>{
  const m=await parsed(t,{weather:{wind_speed_10m:null},marine:{wave_height:null,swell_wave_height:null}});
  assert.equal(m.wind.speedKnots,0);assert.equal(m.waves.heightFeet,0);assert.equal(m.swell.heightFeet,0);
  const c=capture(qualityCaptureInput(m));assert.deepEqual(replay(c),projection(m));
  assert.equal(currentQuality(m,supporting()).overall.classification,'complete');
  // Existing converters use Number(null). Capture cannot recover pre-normalization missingness.
  // This is not provider qualification; changing that behavior requires separate review.
});
test('normalized missing values remain null and never become zero during capture',()=>{
  const f=fixture();for(const [k,v] of [['wind','speedKnots'],['waves','heightFeet'],['swell','heightFeet']])f.qualityInputs[k][v]=null;
  const c=capture(f),r=replay(read(serialize(c)));
  assert.equal(r.wind.speedKnots,null);assert.equal(r.waves.heightFeet,null);assert.equal(r.swell.heightFeet,null);
});
for(const [label,weatherTime,marineTime,expected] of [
  ['weather first','2026-09-23T22:00:00Z','2026-09-24T00:00:00Z','2026-09-23T22:00:00Z'],
  ['marine fallback',null,'2026-09-24T00:00:00Z','2026-09-24T00:00:00Z'],
  ['missing',null,null,null],['malformed','not-a-time','2026-09-24T00:00:00Z','not-a-time'],
  ['ambiguous','2026-09-24T00:00:00','2026-09-24T00:00:00Z','2026-09-24T00:00:00'],
  ['future','2027-01-01T00:00:00Z','2026-09-24T00:00:00Z','2027-01-01T00:00:00Z'],
  ['empty nullish distinction','','2026-09-24T00:00:00Z','']
])test('aggregate quality time preserves parser semantics: '+label,async t=>{
  const m=await parsed(t,{weather:{time:weatherTime},marine:{time:marineTime}}),c=capture(qualityCaptureInput(m));
  assert.equal(m.observedAt,expected);assert.equal(replay(c).observedAt,expected);
  const q=currentQuality(reconstructed(c,sstCapture(m)),supporting());assert.deepEqual(q,currentQuality(m,supporting()));
  for(const family of ['wind','waves','swell','sst'])assert.equal(q.layers[family].observedAt,expected);
  assert.equal(q.layers.wind.state,'live'); // Existing numeric availability, NOT age/freshness qualification.
  assert(!Object.hasOwn(q.layers.wind,'ageHours'));
});
test('aggregate quality time and SST represented time stay separate',async t=>{
  const m=await parsed(t,{weather:{time:'2026-09-23T22:00:00Z'}}),c=capture(qualityCaptureInput(m)),sst=sstCapture(m);
  assert.notEqual(replay(c).observedAt,currentReplay(sst).samples[0].point.observedAt);
  assert.equal(age(sst,'center',assessment),1);
});
test('later execution clock and network/Auth traps cannot alter replay',async t=>{
  const m=await parsed(t),c=capture(qualityCaptureInput(m)),sst=sstCapture(m),ctx=supporting(),expected=currentQuality(m,ctx);
  const OriginalDate=Date;
  class NoImplicitDate extends OriginalDate {constructor(...args){if(!args.length)throw Error('implicit clock');super(...args);}static now(){throw Error('implicit clock');}}
  t.mock.method(globalThis,'fetch',()=>{throw Error('network/Auth forbidden');});
  t.mock.property(globalThis,'Date',NoImplicitDate);
  assert.deepEqual(currentQuality(reconstructed(c,sst),ctx),expected);
  assert.deepEqual(lineage(currentQuality(reconstructed(c,sst),ctx)),lineage(expected));
});
test('lineage warnings use exact existing facts, no frozen prose',()=>{
  const q={overall:{classification:'insufficient'},methodVersion:'pelora-data-quality-v2'};
  assert.deepEqual(lineage(q,false).inheritedWarnings,['data-quality:insufficient','open-water-evidence-unavailable','persistence-evidence-unavailable']);
  assert.deepEqual(lineage({...q,overall:{classification:'complete'}},true).inheritedWarnings,[]);
  const f=fixture();f.warning='data-quality:insufficient';assert.throws(()=>capture(f));
});
test('identity is deterministic, key-order independent and binds all eight projection leaves',()=>{
  const f=fixture(),c=capture(f);
  const reverse=x=>Array.isArray(x)?x.map(reverse):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).reverse().map(([k,v])=>[k,reverse(v)])):x;
  assert.deepEqual(capture(reverse(f)),c);
  for(const path of ['location.latitude','location.longitude','qualityInputs.wind.speedKnots','qualityInputs.waves.heightFeet','qualityInputs.swell.heightFeet','qualityInputs.observedAt']){
    const g=structuredClone(f),parts=path.split('.'),last=parts.pop(),target=parts.reduce((v,k)=>v[k],g);
    target[last]=typeof target[last]==='number'?target[last]+0.1:'2026-09-24T00:01:00Z';assert.notEqual(capture(g).captureId,c.captureId);
    const tampered=structuredClone(c);parts.reduce((v,k)=>v[k],tampered)[last]=target[last];assert.throws(()=>validate(tampered));
  }
  for(const provider of ['weatherApi','marineApi']){const g=fixture();g.qualityInputs.wind.speedKnots=null;g.qualityInputs.waves.heightFeet=null;g.qualityInputs.swell.heightFeet=null;const original=capture(g);g.qualityInputs.diagnostics.providerStatus[provider]='rejected';assert.notEqual(capture(g).captureId,original.captureId);}
  const g=fixture();g.lineageReferences.reverse();assert.notEqual(capture(g).captureId,c.captureId);assert.equal(capture(g).scientificContentDigest,c.scientificContentDigest);
});
test('source identity fixed; qualification never inferred from capture validity',()=>{
  for(const key of ['provider','weatherProduct','marineProduct']){const f=fixture();f.source[key]='replacement';assert.throws(()=>capture(f));}
  const f=fixture();f.sourceAuthority.status='QUALIFIED';assert.throws(()=>capture(f));
  f.sourceAuthority.status='RECORDED_NOT_REQUALIFIED';assert.equal(capture(f).sourceAuthority.status,f.sourceAuthority.status);
});
test('caller mutation, serialization tampering and output mutation fail closed',()=>{
  const f=fixture(),c=capture(f),bytes=serialize(c),r=replay(c);
  f.qualityInputs.wind.speedKnots=900;f.location.latitude=30;f.lineageReferences.reverse();f.source.provider='changed';
  assert.equal(serialize(c),bytes);assert(Object.isFrozen(c.qualityInputs.diagnostics.providerStatus));
  assert.throws(()=>{r.wind.speedKnots=9;});assert.throws(()=>{c.lineageReferences.push({});});
  assert.throws(()=>read(bytes.replace('"speedKnots":8','"speedKnots":9')));
  assert.throws(()=>read(' '+bytes));assert.notEqual(replay(c).wind,r.wind);
});
for(const privateField of ['captain_id','captainId','user_id','userId','email','Auth UUID','boat','origin','range','Fishing Log','catch','lure','bait','private coordinates','session','token','mission'])test('reject private channels: '+privateField,()=>{
  for(const channel of ['root','nested','metadata','quality','lineage']){
    const f=fixture();
    if(channel==='root')f[privateField]='synthetic';
    if(channel==='nested')f.qualityInputs.wind[privateField]='synthetic';
    if(channel==='metadata')f.source.metadata=[{name:privateField,value:'synthetic'}];
    if(channel==='quality')f.qualityInputs.quality={flagId:privateField};
    if(channel==='lineage')f.lineageReferences[0].metadata={name:privateField,value:'synthetic'};
    assert.throws(()=>capture(f));
  }
});
test('opaque reference strings do not evade known private markers',()=>{
  for(const value of ['captain_id','synthetic@example.invalid','11111111-1111-1111-1111-111111111111']){
    const f=fixture();f.lineageReferences[0].referenceId=value;assert.throws(()=>capture(f));
  }
});
test('all public object boundaries reject accessors without invoking them',()=>{
  for(const invoke of [capture,validate,serialize,replay,reference])for(const setter of [false,true]){
    let reads=0;const p=invoke===capture?fixture():structuredClone(capture(fixture()));
    Object.defineProperty(p.qualityInputs.wind,'speedKnots',{enumerable:true,...(setter?{set(){reads++;}}:{get(){reads++;throw Error('getter');}})});
    assert.throws(()=>invoke(p));assert.equal(reads,0);
  }
});
test('prototype, array prototype, symbols, cycles and coercion hooks rejected',()=>{
  for(const key of ['__proto__','constructor','prototype','toJSON','valueOf']){const f=fixture();Object.defineProperty(f.qualityInputs,key,{value:'synthetic',enumerable:true});assert.throws(()=>capture(f));}
  const inherited=fixture();Object.setPrototypeOf(inherited.qualityInputs.wind,{captainId:'synthetic'});assert.throws(()=>capture(inherited));
  const array=fixture();Object.setPrototypeOf(array.lineageReferences,{});assert.throws(()=>capture(array));
  const symbol=fixture();symbol[Symbol('private')]=true;assert.throws(()=>capture(symbol));
  const cyclic=fixture();cyclic.self=cyclic;assert.throws(()=>capture(cyclic));
});
test('malformed values, outcomes, time types and contradictory failure payload reject',()=>{
  for(const v of [NaN,Infinity,-Infinity,'0',{},undefined]){const f=fixture();f.qualityInputs.wind.speedKnots=v;assert.throws(()=>capture(f));}
  for(const status of ['available','unknown','success',200,null]){const f=fixture();f.qualityInputs.diagnostics.providerStatus.weatherApi=status;assert.throws(()=>capture(f));}
  for(const time of [1,{},[],true]){const f=fixture();f.qualityInputs.observedAt=time;assert.throws(()=>capture(f));}
  const f=fixture();f.qualityInputs.diagnostics.providerStatus.weatherApi='rejected';assert.throws(()=>capture(f));
  delete f.qualityInputs.wind.speedKnots;assert.throws(()=>capture(f));
});
test('species and operational fields cannot enter this narrow projection',()=>{
  for(const key of ['species','score','confidence','rankingPermission','eligibility','quality','ageHours','retrievedAt','assessmentAt','providerErrors','windDirection','wavePeriod']){
    const f=fixture();f.qualityInputs[key]=1;assert.throws(()=>capture(f));
  }
  const code=readFileSync(new URL('../weatherMarineQualityCapture.mjs',import.meta.url),'utf8');
  assert(!/blue.?marlin|fetch\(|Date\.now|new Date|supabase|server\.js|process\.env/i.test(code));
});
test('archive compatibility remains reference-only',()=>{
  const c=capture(fixture()),r=reference(c);
  const p=planOceanArchiveWriteV1(frame(),{writeId:'synthetic',archivedAt:assessment.assessmentAt,storageReference:'synthetic',sourceRevision:null,
    rawEvidence:[{reference:r.referenceId,sha256:r.sha256,availability:'reference-only'}]});
  assert.equal(p.intent.rawEvidence[0].sha256,hash(c));assert.throws(()=>planOceanArchiveWriteV1(c,p.intent));
});
test('V3 binds exact weather/marine capture reference without amendment',()=>{
  const p=publication(),r=reference(capture(fixture())),entries=structuredClone(p.evidence.entries);entries[0].reference=r;
  const evidence=freezeEvidenceV1(p.cycle,entries);
  const result=publicationV3({cycle:p.cycle,evidence,history:p.history,attempt:{id:'synthetic-weather-binding',startedAt:p.cycle.scheduledAt,endedAt:p.cycle.scheduledAt},evaluation:{...p.evaluation,evidenceSetId:evidence.evidenceSetId}});
  assert.deepEqual(result.evidence.entries[0].reference,r);
});
test('request and scheduled assessments compose with the same quality projection',async t=>{
  const m=await parsed(t),c=capture(qualityCaptureInput(m)),sst=sstCapture(m);
  const scheduled={...assessment,contractVersion:'pelora-scheduled-scientific-assessment-v1'};
  assert.deepEqual(currentQuality(reconstructed(c,sst),supporting(scheduled)),currentQuality(m,supporting(assessment)));
});
test('machine-readable audit preserves the qualified subset and unresolved source limitations',()=>{
  const m=JSON.parse(readFileSync(new URL('../../docs/Weather_Marine_Quality_Capture_Matrix_v1.json',import.meta.url),'utf8'));
  assert.equal(m.inputEquivalence.length,8);assert(m.inputEquivalence.every(r=>r.classification==='EXACT_MATCH'));
  assert.equal(m.assemblerEquivalence,'EXACT_MATCH');assert.equal(m.unexplainedMismatches,0);
  assert(m.unresolved.some(r=>r.includes('null versus zero')));
  assert(m.dependencies.some(r=>r.input==='marine.observedAt'&&r.role==='AGGREGATE_TIME_INPUT'));
});

// Independent adversarial review of the 54-test implementation baseline.
for(let mask=0;mask<8;mask++)test('review: every wind/wave/swell availability combination '+mask,async t=>{
  const m=await parsed(t,{weather:{wind_speed_10m:mask&1?4:undefined},marine:{wave_height:mask&2?1:undefined,swell_wave_height:mask&4?0.5:undefined}});
  const c=capture(qualityCaptureInput(m)),a=currentQuality(m,supporting()),b=currentQuality(reconstructed(c,sstCapture(m)),supporting());
  assert.deepEqual(replay(read(serialize(c))),projection(m));assert.deepEqual(b,a);assert.deepEqual(lineage(b),lineage(a));
  const count=[1,2,4].filter(bit=>mask&bit).length+1;assert.equal(a.overall.coreOperationalCoverage.available,count);
  assert.equal(a.overall.classification,count===4?'complete':count>=2?'degraded':'insufficient');
});
for(const family of ['wind','waves','swell'])test('review: capture never coerces null or numeric zero: '+family,()=>{
  const field=family==='wind'?'speedKnots':'heightFeet',f=fixture();f.qualityInputs[family][field]=null;
  const missing=capture(f);assert.equal(replay(read(serialize(missing)))[family][field],null);
  f.qualityInputs[family][field]=0;const zero=capture(f);assert.equal(replay(read(serialize(zero)))[family][field],0);
  assert.notEqual(missing.captureId,zero.captureId);
  for(const value of ['',false,'0',undefined,NaN,Infinity]){f.qualityInputs[family][field]=value;assert.throws(()=>capture(f));}
});
test('review: upstream null and genuine zero collapse BEFORE capture, absent value does not',async t=>{
  const a=await parsed(t,{weather:{wind_speed_10m:null},marine:{wave_height:null,swell_wave_height:null}});
  const b=await parsed(t,{weather:{wind_speed_10m:0},marine:{wave_height:0,swell_wave_height:0}});
  const c=await parsed(t,{weather:{wind_speed_10m:undefined},marine:{wave_height:undefined,swell_wave_height:undefined}});
  assert.deepEqual(projection(a),projection(b));assert.deepEqual(capture(qualityCaptureInput(a)),capture(qualityCaptureInput(b)));
  assert.notDeepEqual(projection(a),projection(c));
  // UPSTREAM_SOURCE_NORMALIZATION_REVIEW_REQUIRED: no converter repair in this task.
});
test('review: wind versus height family substitution rejects; wave/swell swap changes bound identity',()=>{
  const f=fixture();[f.qualityInputs.wind,f.qualityInputs.waves]=[f.qualityInputs.waves,f.qualityInputs.wind];assert.throws(()=>capture(f));
  const c=capture(fixture()),bad=structuredClone(c);[bad.qualityInputs.waves,bad.qualityInputs.swell]=[bad.qualityInputs.swell,bad.qualityInputs.waves];assert.throws(()=>validate(bad));
  const g=fixture();[g.qualityInputs.waves,g.qualityInputs.swell]=[g.qualityInputs.swell,g.qualityInputs.waves];assert.notEqual(capture(g).captureId,c.captureId);
  // A newly authored self-consistent source claim is not authenticated by hashing.
});
test('review: every acquisition outcome change is bound and cannot upgrade retained state',()=>{
  for(const provider of ['weatherApi','marineApi']){
    const f=fixture();f.qualityInputs.wind.speedKnots=null;f.qualityInputs.waves.heightFeet=null;f.qualityInputs.swell.heightFeet=null;
    const c=capture(f),bad=structuredClone(c);bad.qualityInputs.diagnostics.providerStatus[provider]='rejected';assert.throws(()=>validate(bad));
    f.qualityInputs.diagnostics.providerStatus[provider]='rejected';assert.notEqual(capture(f).scientificContentDigest,c.scientificContentDigest);
  }
});
test('review: weather-first precedence is neither latest nor earliest',async t=>{
  for(const weatherTime of ['2026-09-23T20:00:00Z','2026-09-24T00:30:00Z']){
    const m=await parsed(t,{weather:{time:weatherTime}}),c=capture(qualityCaptureInput(m));
    assert.equal(replay(c).observedAt,weatherTime);assert.equal(age(sstCapture(m),'center',assessment),1);
    assert.deepEqual(currentQuality(reconstructed(c,sstCapture(m)),supporting()),currentQuality(m,supporting()));
  }
});
test('review: later wall clock cannot affect capture identity or replay; explicit reassessment can affect family age',async t=>{
  const m=await parsed(t),f=qualityCaptureInput(m),c=capture(f),sst=sstCapture(m),before=serialize(c),ctx=supporting();
  const a=currentQuality(reconstructed(c,sst),ctx),NativeDate=Date;
  class LaterDate extends NativeDate {constructor(...args){super(...(args.length?args:['2040-01-01T00:00:00Z']));}static now(){return NativeDate.parse('2040-01-01T00:00:00Z');}}
  t.mock.property(globalThis,'Date',LaterDate);t.mock.method(globalThis,'fetch',()=>{throw Error('network prohibited');});
  assert.equal(serialize(capture(f)),before);assert.deepEqual(currentQuality(reconstructed(c,sst),ctx),a);
  const later=supporting({...assessment,assessmentAt:'2026-09-29T01:00:00Z'});
  assert.equal(currentQuality(reconstructed(c,sst),later).layers.currents.state,'stale');assert.equal(serialize(c),before);
});
test('review: lineage reconstruction preserves warning content/order without species feedback',()=>{
  for(const classification of ['complete','usable-with-gaps','degraded','insufficient']){
    const q={overall:{classification},methodVersion:'pelora-data-quality-v2'};
    const expected=classification==='complete'?[]:[`data-quality:${classification}`];assert.deepEqual(lineage(q).inheritedWarnings,expected);
    assert.deepEqual(lineage(q,false).inheritedWarnings,[...expected,'open-water-evidence-unavailable','persistence-evidence-unavailable']);
  }
});
for(const privateLabel of ['captain_id','userId','mission_context','token'])test('review: dedicated private labels embedded in reference metadata reject '+privateLabel,()=>{
  for(const target of ['authority','lineage'])for(const separator of ['.','-','_']){
    const f=fixture(),r=target==='authority'?f.sourceAuthority.reference:f.lineageReferences[0];
    r.referenceId=`synthetic${separator}${privateLabel}${separator}synthetic-17`;assert.throws(()=>capture(f));
  }
});
test('review: hostile descriptors at every major nested boundary never execute',()=>{
  for(const path of ['source','sourceAuthority','location','qualityInputs','qualityInputs.diagnostics','lineageReferences']){
    for(const invoke of [capture,validate,serialize,replay,reference]){
      const p=invoke===capture?fixture():structuredClone(capture(fixture())),parts=path.split('.'),key=parts.pop(),owner=parts.reduce((o,k)=>o[k],p);let reads=0;
      Object.defineProperty(owner,key,{enumerable:true,get(){reads++;throw Error('hostile getter');}});assert.throws(()=>invoke(p));assert.equal(reads,0);
    }
  }
});
test('review: inherited array entries, nonenumerable values and null prototypes reject',()=>{
  const a=fixture();a.lineageReferences=new Array(1);assert.throws(()=>capture(a));
  const b=fixture();Object.defineProperty(b.qualityInputs.wind,'speedKnots',{value:8,enumerable:false});assert.throws(()=>capture(b));
  const c=fixture();Object.setPrototypeOf(c.location,null);assert.throws(()=>capture(c));
});
test('review: mutations of time/source/location/outcomes/lineage cannot alter completed capture',()=>{
  const f=fixture(),c=capture(f),bytes=serialize(c),r=replay(c);
  f.qualityInputs.observedAt='2040-01-01T00:00:00Z';f.sourceAuthority.reference.referenceId='other';f.lineageReferences[0].sha256='f'.repeat(64);
  f.qualityInputs.diagnostics.providerStatus.weatherApi='rejected';f.location.longitude=1;
  assert.equal(serialize(c),bytes);assert.deepEqual(replay(c),r);
  for(const o of [c,c.source,c.sourceAuthority.reference,c.lineageReferences,c.lineageReferences[0],r.location,r.diagnostics.providerStatus])assert(Object.isFrozen(o));
});
test('review: composition does not claim cross-capture source authentication',async t=>{
  const m=await parsed(t),c=capture(qualityCaptureInput(m)),s=sstCapture(m);
  assert.deepEqual(currentQuality(reconstructed(c,s),supporting()),currentQuality(m,supporting()));
  const changed=structuredClone(s);changed.samples[0].point.temperatureFahrenheit=900;assert.throws(()=>currentReplay(changed));
  assert.throws(()=>replay(s));assert.throws(()=>currentReplay(c));
  // Exact candidate/location/source matching across independently valid captures belongs to 12B.6C.
});
test('review: alternate product, species and warning metadata are not silently stripped',()=>{
  for(const value of [{species:'blue-marlin'},{score:90},{quality:{flagId:'captain_id'}},{lineage:{name:'token',value:'synthetic'}},{warnings:[{name:'mission',value:'synthetic'}]}]){
    const f=fixture();Object.assign(f.qualityInputs,value);assert.throws(()=>capture(f));
  }
  const f=fixture();f.source.marineProduct='NOAA Geo-Polar SST';assert.throws(()=>capture(f));
});
