import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SOURCE_NORMALIZATION_VERSION, normalizationCacheKey, sourceNumber, sourceScaledNumber,
  roundFinite, SOURCE_NORMALIZATION_REFERENCE} from '../sourceNormalization.mjs';
import {fields, parse} from './fixtures/sourceNormalizationFixture.mjs';
import {runCurrent, nonfinitePaths} from './fixtures/currentVectorDerivedFinitenessFixture.mjs';
import {currentSupport, inputs, parsed} from './fixtures/marineAssessorCompanionFixture.mjs';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {captureCurrentEvidenceV2} from '../currentEvidenceCaptureV2.mjs';
import {captureWeatherMarineQualityV2} from '../weatherMarineQualityCaptureV2.mjs';
import {qualityCaptureInput, currentQuality} from './fixtures/weatherMarineQualityFixture.mjs';
import {captureMarineAssessorCompanionV1} from '../marineAssessorCompanionCapture.mjs';
import {getMoonConditions, celsiusToFahrenheit, assessOceanConditions, resolveChlorophyllObservation} from '../server.js';

// Execute exact production cache functions, exposing private maps only in this fixture.
// Literal boundaries follow the established inline-quality fixture pattern.
const source = readFileSync(new URL('../server.js', import.meta.url), 'utf8');
function section(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `production boundary ${start}`);
  return source.slice(a, b);
}
function cacheHarness(family, rejectFirst = false) {
  let now = 1000, calls = 0, release;
  const pending = new Promise(resolve => { release = resolve; });
  const point = family === 'current'
    ? {eastwardMetersPerSecond: 1, northwardMetersPerSecond: 2, speedKnots: 4.3}
    : {temperatureCelsius: 25, temperatureFahrenheit: 77};
  const acquire = async () => { calls++; await pending; if(rejectFirst && calls===1)throw Error('SYNTHETIC_PROVIDER_REJECTION');return point; };
  const current = family === 'current';
  const body = current
    ? section('const CURRENT_POINT_CACHE_TTL_MS =', '/**\n * Build four nearby current sampling') +
      section('async function getCachedCurrentConditionsPointAtAssessment(', 'async function getCurrentSpatialStructureAtAssessment(')
    : section('const SST_POINT_CACHE_TTL_MS =', '/**\n * Build four nearby sampling points') +
      section('async function getCachedSeaSurfaceTemperaturePoint(', 'async function getSstSpatialStructureAtAssessment(');
  const result = new Function('normalizationCacheKey','SOURCE_NORMALIZATION_VERSION','Date',
    'getCurrentConditionsPoint','getSeaSurfaceTemperaturePoint','resolveScientificAssessmentV1',
    'reassessCurrentAgeV1', body + (current
      ? '\nreturn {cache:currentPointCache,inFlight:currentPointRequestsInFlight,read:getCachedCurrentPoint,get:getCachedCurrentConditionsPointAtAssessment};'
      : '\nreturn {cache:sstPointCache,inFlight:sstPointRequestsInFlight,read:getCachedSstPoint,get:getCachedSeaSurfaceTemperaturePoint};'))(
    normalizationCacheKey,SOURCE_NORMALIZATION_VERSION,{now:()=>now},acquire,acquire,x=>x,x=>x);
  return {...result, release:()=>release(), calls:()=>calls, setTime:x=>{now=x;}, point};
}

test('normalization identity is deterministic and separates old/new/unversioned coordinates', () => {
  assert.equal(SOURCE_NORMALIZATION_VERSION, 'pelora-source-normalization-v1');
  const key=normalizationCacheKey(25,-90);
  assert.notEqual(key,normalizationCacheKey(25,-90,'legacy-normalization'));
  assert.notEqual(key,'25.0000,-90.0000');
  assert.equal(key,normalizationCacheKey(25,-90));
  assert.throws(()=>normalizationCacheKey(25,-90,''));
});

for (const family of ['current','sst']) {
  test(`${family}: rejected shared acquisition clears in-flight state and allows a clean retry`, async () => {
    const h=cacheHarness(family,true),a=h.get(25,-90,{}),b=h.get(25,-90,{});h.release();
    const results=await Promise.allSettled([a,b]);assert(results.every(x=>x.status==='rejected'&&/SYNTHETIC_PROVIDER_REJECTION/.test(x.reason.message)));
    assert.equal(h.calls(),1);assert.equal(h.inFlight.size,0);assert.equal(h.cache.size,0);
    assert.equal((await h.get(25,-90,{})).cache.status,'miss');assert.equal(h.calls(),2);assert.equal(h.inFlight.size,0);
  });
  test(`${family}: old cached entries and old in-flight results cannot satisfy v1; same-version reuse and TTL survive`, async () => {
    const h=cacheHarness(family), old=normalizationCacheKey(25,-90,'legacy-normalization'), key=normalizationCacheKey(25,-90);
    const sentinel={...h.point,marker:'old'};
    h.cache.set(old,{cachedAt:1000,value:sentinel});
    h.cache.set('25.0000,-90.0000',{cachedAt:1000,value:sentinel});
    let finishOld; const oldPromise=new Promise(resolve=>{finishOld=resolve;});
    h.inFlight.set(old,oldPromise); h.inFlight.set('25.0000,-90.0000',oldPromise);
    assert.equal(h.read(25,-90),null);
    const a=h.get(25,-90,{}), b=h.get(25,-90,{});
    assert.equal(h.calls(),1); assert(h.inFlight.has(key));
    assert.notEqual(h.inFlight.get(key),oldPromise);
    finishOld(sentinel); h.cache.set(old,{cachedAt:1000,value:sentinel});
    h.release(); const [first,shared]=await Promise.all([a,b]);
    assert.equal(first.marker,undefined); assert.equal(shared.marker,undefined);
    assert.equal(first.cache.status,'miss'); assert(['shared','shared-in-flight'].includes(shared.cache.status));
    assert.equal(h.inFlight.has(key),false);
    assert.equal((await h.get(25,-90,{})).cache.status,'hit'); assert.equal(h.calls(),1);
    h.setTime(301000); assert(h.read(25,-90)); // Preserve existing strict greater-than expiry.
    h.setTime(301001); assert.equal(h.read(25,-90),null); assert.equal(h.cache.has(key),false);
    assert.equal((await h.get(25,-90,{})).cache.status,'miss'); assert.equal(h.calls(),2);
  });
  test(`${family}: independent cold cache starts empty and acquires normally`, async () => {
    const h=cacheHarness(family); assert.equal(h.cache.size,0); assert.equal(h.inFlight.size,0);
    h.release(); assert.equal((await h.get(25,-90,{})).cache.status,'miss'); assert.equal(h.calls(),1);
  });
}

test('primitive rules preserve route-specific strings, reject malformed structures, and preserve signed zero', () => {
  for(const value of [null,undefined,NaN,Infinity,-Infinity,[],[2],{},false,true]) {
    assert.equal(sourceNumber(value),null); assert.equal(sourceScaledNumber(value,1.94384),null);
  }
  for(const value of ['25',' 25 ']) assert.equal(sourceNumber(value),25);
  assert.equal(sourceNumber(''),null); assert.equal(sourceNumber('  '),0);
  assert.equal(sourceScaledNumber('',1.94384),0); // Unresolved string compatibility preserved.
  assert(Object.is(sourceNumber(-0),-0)); assert(Object.is(roundFinite(-0,4),-0));
  assert(Object.is(sourceScaledNumber(-0,1.94384),-0)); assert(Object.is(roundFinite(-0.00001,4),-0));
  assert.equal(sourceScaledNumber(1e308,3.28084),null);
  assert.equal(celsiusToFahrenheit(1e308),null); assert.equal(celsiusToFahrenheit(-1e308),null);
  assert.equal(celsiusToFahrenheit(25),77); assert.equal(celsiusToFahrenheit(-0),32);
});

test('all 15 measurement routes reject null/missing/malformed/nonfinite values through actual transport parsers', async t => {
  for(const field of fields.filter(f=>f.conversion!=='coordinate')) {
    for(const [state,value] of [['null',null],['missing',undefined],['undefined',undefined],['array',[]],['numeric-array',[2]],['object',{}],['boolean',false],['nan',NaN],['infinity',Infinity],['negative-infinity',-Infinity]]) {
      const r=await parse(t,field,state,value); assert.equal(r.value,null,`${field.id}/${state}`);
      if(field.parser==='current')assert.equal(r.result.speedKnots,null);
    }
    for(const [state,value] of [['positive-zero',0],['negative-zero',-0],['positive',2]]) {
      const r=await parse(t,field,state,value); assert(Number.isFinite(r.value),field.id);
      if(state==='negative-zero')assert(Object.is(r.value,-0),field.id);
    }
  }
});

test('string compatibility stays route-specific through production parsers', async t => {
  for(const f of fields.filter(f=>f.conversion!=='coordinate'))for(const text of ['25',' 25 ','','  ']) {
    const r=await parse(t,f,'numeric-string',text);
    if(f.conversion==='strict' || (text===''&&['safe','safe-rounded'].includes(f.conversion)))assert.equal(r.value,null);
    else assert(Number.isFinite(r.value),f.id+JSON.stringify(text));
  }
});

test('six scaled/paired routes reject finite conversion overflow without poisoning sibling facts', async t => {
  for(const f of fields.filter(f=>['knots','feet','strict'].includes(f.conversion)))for(const value of [1e308,-1e308]) {
    const {result,value:leaf}=await parse(t,f,'positive',value);
    assert.equal(leaf,null,f.id); assert.equal(nonfinitePaths(result).length,0,f.id);
    if(f.parser==='sst')assert.equal(result.validNeighborCount,0);
    if(f.parser==='marine'&&f.key!=='wind_direction_10m')assert.equal(result.wind.directionDegrees,90);
  }
});

test('null gust cannot reappear as available wind; quality and chlorophyll consumers fail closed', async t => {
  const gust=fields.find(f=>f.key==='wind_gusts_10m');
  const m=(await parse(t,gust,'null',null,{allMissing:true})).result;
  assert.notEqual(m.wind.source.availability,'available'); assert.equal(m.wind.gustKnots,null);
  assert.equal(assessOceanConditions(m).assessments.wind.classification,'unavailable');
  for(const key of ['wind_speed_10m','wave_height','swell_wave_height']) {
    const f=fields.find(f=>f.key===key), x=(await parse(t,f,'null',null)).result;
    const q=currentSupport(x).quality(x); const name=key.startsWith('wind')?'wind':key.startsWith('swell')?'swell':'waves';
    assert.notEqual(q.layers[name].state,'live');
  }
  for(const field of fields.filter(f=>f.parser==='marine'&&['knots','feet','safe'].includes(f.conversion))) {
    const missing=(await parse(t,field,'missing',undefined)).result;
    for(const [state,value] of [['null',null],['array',[]]]) {
      const rejected=(await parse(t,field,state,value)).result;
      assert.deepEqual(currentSupport(rejected).quality(rejected),currentSupport(missing).quality(missing),field.id);
      assert.deepEqual(assessOceanConditions(rejected),assessOceanConditions(missing),field.id);
    }
  }
  for(const parser of ['direct','gap']) {
    const r=(await parse(t,fields.find(f=>f.parser===parser),'array',[])).result;
    assert.equal(r.concentrationMgM3,null); assert.notEqual(r.source.availability,'available');
    assert.equal(resolveChlorophyllObservation({observations:[r]}).available,false);
  }
});

test('current local failure preserves valid components, excludes bad projections/axes, and cannot improve quality', async t => {
  for(const u of [0,-0])for(const v of [0,-0]) {
    const zero=await runCurrent(t,{all:[u,v]});
    assert(Object.is(zero.point.eastwardMetersPerSecond,u));
    assert(Object.is(zero.point.northwardMetersPerSecond,v));
    assert(zero.projection.available);
    assert(zero.projection.projections.every(p=>p.vectorMagnitudeMetersPerSecond===0&&p.inwardAlignmentDegrees===null));
  }
  const independent=await runCurrent(t,{all:[1e200,1]});
  assert.equal(independent.point.speedKnots,null); assert.equal(independent.point.eastwardMetersPerSecond,1e200);
  assert.equal(independent.point.source.availability,'available'); assert(independent.projection.available);
  const bad=await runCurrent(t,{all:[Number.MAX_VALUE,Number.MAX_VALUE]});
  assert.equal(bad.point.source.availability,'available'); assert.equal(bad.projection.available,false);
  assert.equal(bad.projection.validProjectionCount,0); assert.notEqual(bad.projection.coverage,'complete');
  assert.equal(bad.gradient.available,false); assert.equal(nonfinitePaths(bad.projection).length,0);
  const axis=await runCurrent(t,{all:[1,1],north:[1e308,1],south:[-1e308,1],east:[1,1],west:[1,1]});
  assert.notEqual(axis.gradient.coverage,'complete'); assert.equal(nonfinitePaths(axis.gradient).length,0);
  for(const p of axis.gradient.axes??axis.gradient.axisComparisons??[])if(p.available)assert.equal(nonfinitePaths(p).length,0);
  const marine=await parsed(t);
  const context={currents:independent.point,chlorophyll:{...captureFixture('CHLOROPHYLL_DIRECT').samples[0].point,ageHours:1},
    moon:getMoonConditions('2026-09-24T01:00:00Z'),chlorophyllResult:{status:'fulfilled'},
    gapFilledChlorophyllResult:{status:'fulfilled'},currentsResult:{status:'fulfilled'}};
  const quality=currentQuality(marine,context);
  assert.equal(quality.layers.currents.state,'unavailable');
  assert.equal(quality.layers.currents.reason,'current-speed-derivation-unavailable');
});

test('quality and companion captures retain normalization lineage and corrected missingness', async t => {
  const m=(await parse(t,fields.find(f=>f.key==='wind_gusts_10m'),'null',null)).result;
  const input=qualityCaptureInput(m); input.lineageReferences.push(SOURCE_NORMALIZATION_REFERENCE);
  const capture=captureWeatherMarineQualityV2(input);
  assert(capture.lineageReferences.some(r=>r.contractVersion===SOURCE_NORMALIZATION_VERSION));
  const companion=inputs(m); companion.input.lineageReferences.push(SOURCE_NORMALIZATION_REFERENCE);
  const c=captureMarineAssessorCompanionV1(companion.input,companion.q);
  assert.equal(c.marineInputs.wind.gustKnots,null);
  assert(c.lineageReferences.some(r=>r.contractVersion===SOURCE_NORMALIZATION_VERSION));
});

test('existing capture lineage binds processing version without relabelling history or changing scientific digest', () => {
  const input=captureFixture('CURRENTS'), old=captureCurrentEvidenceV2(input);
  const next=captureCurrentEvidenceV2({...input,lineageReferences:[...input.lineageReferences,SOURCE_NORMALIZATION_REFERENCE]});
  assert.equal(old.scientificContentDigest,next.scientificContentDigest); assert.notEqual(old.captureId,next.captureId);
  assert.equal(old.lineageReferences.some(r=>r.contractVersion===SOURCE_NORMALIZATION_VERSION),false);
  assert.equal(next.lineageReferences.at(-1).sha256,SOURCE_NORMALIZATION_REFERENCE.sha256);
  const partial=structuredClone(input); partial.samples[0].point.speedKnots=null;
  assert.throws(()=>captureCurrentEvidenceV2({...partial,lineageReferences:[SOURCE_NORMALIZATION_REFERENCE]}));
  assert.equal(partial.samples[0].point.source.availability,'available');
});
