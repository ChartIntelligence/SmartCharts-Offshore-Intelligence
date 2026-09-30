// Bounded STOP evidence. Existing parsers/capture contracts only; no live integration.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHarness, scenarios} from './fixtures/snapshotProducerQualificationV2Fixture.mjs';
import {runScenario, scenarios as liveScenarios} from './fixtures/transitiveProducerBoundaryFixture.mjs';
import {probe} from './fixtures/sstChlorophyllTemporalSupportFixture.mjs';
import {historicalSnapshot, adapt} from './fixtures/sstProvenanceGapFilledBindingFixture.mjs';
import {captureFixture, ref} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {SOURCE_NORMALIZATION_REFERENCE} from '../sourceNormalization.mjs';
import {captureCurrentEvidenceV2 as capture, currentCaptureReferenceV2 as reference,
  serializeCurrentEvidenceCaptureV2 as serialize, readCurrentEvidenceCaptureV2 as read,
  replayCurrentEvidenceSourceV2 as replay} from '../currentEvidenceCaptureV2.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';

function input(point, family) {
  // Age/cache/derived runtime context is not part of this existing source capture.
  const {ageHours, cache, derived, direction, ...sourcePoint} = point;
  return {family, sourceAuthority:{status:'SYNTHETIC_FIXTURE',reference:ref('synthetic-authority')},
    samples:[{role:'center',outcome:'FULFILLED',point:sourcePoint}],
    lineageReferences:[SOURCE_NORMALIZATION_REFERENCE]};
}
const roundTrip = c => replay(read(serialize(c))).samples[0].point;

test('STOP is also reached through the actual default live producer, not just extracted assembly',async t=>{
  const {ocean}=await runScenario(t,liveScenarios.find(s=>s.id==='finite-control'));
  const observation=ocean.observationSnapshot;
  assert.deepEqual(observation.lineage.processingReferences,[SOURCE_NORMALIZATION_REFERENCE]);
  const p=observation.observations.sst;
  assert(!Object.hasOwn(p.source,'availability'));
  assert.throws(()=>capture(input(p,'SST')));
  assert(!Object.hasOwn(p,'captureText'));
  assert(!Object.hasOwn(observation.observations.chlorophyll,'captureText'));
});

test('STOP: actual center SST assembler omits required availability on cold/warm paths', async t => {
  const h=await createHarness(t);
  try {
    for (const id of ['uniform','center-missing','positive-zero','negative-zero']) {
      const rows=await h.run(scenarios.find(s=>s.id===id));
      assert.equal(rows.length,2);
      for (const row of rows) {
        const p=row.snapshot.observations.sst;
        assert.deepEqual(p.source,{provider:'Open-Meteo',classification:'forecast-model'});
        assert(!Object.hasOwn(p.source,'availability'));
        assert.throws(()=>capture(input(p,'SST')));
        for(const sample of row.spatial.samples) {
          assert(Object.hasOwn(sample.source,'availability'));
          assert.doesNotThrow(()=>capture(input(sample,'SST')));
        }
      }
    }
  } finally { h.close(); }
});

test('SST directional capture is deterministic across cold/warm cache context', async t => {
  const h=await createHarness(t);
  try {
    const [cold,warm]=await h.run(scenarios.find(s=>s.id==='uniform'));
    assert(warm.requests<cold.requests);
    assert.deepEqual(cold.spatial.samples.map(p=>reference(capture(input(p,'SST')))),
      warm.spatial.samples.map(p=>reference(capture(input(p,'SST')))));
  } finally {h.close();}
});

test('SST same-time changed value collides in legacy snapshot ID but not v2 reference', async t => {
  const a=(await probe(t,'sst',{current:{time:'2026-09-24T12:00:00Z',sea_surface_temperature:25}})).point;
  const b=(await probe(t,'sst',{current:{time:a.observedAt,sea_surface_temperature:26}})).point;
  const sa=historicalSnapshot(a),sb=historicalSnapshot(b);
  assert.equal(sa.identity.snapshotId,sb.identity.snapshotId);
  assert.notDeepEqual(reference(capture(input(a,'SST'))),reference(capture(input(b,'SST'))));
  assert.equal(adapt(sa).snapshot.observation.observations.sst.temperatureCelsius,25);
  assert.equal(adapt(sb).snapshot.observation.observations.sst.temperatureCelsius,26);
});

for(const [runtime,family] of [['sst','SST'],['direct','CHLOROPHYLL_DIRECT'],['gap','CHLOROPHYLL_GAP_FILLED']]) {
  const field=runtime==='sst'?'temperatureCelsius':'concentrationMgM3';
  const get=async(t,value)=> (await probe(t,runtime,runtime==='sst'?{current:{time:'2026-09-24T12:00:00Z',sea_surface_temperature:value}}:{},value)).point;
  test(family+': exact source capture reconstructs parser content, detached and frozen',async t=>{
    const p=await get(t,1),i=input(p,family),c=capture(i),r=reference(c);
    assert.deepEqual(roundTrip(c),i.samples[0].point);
    p[field]=99;i.samples[0].point[field]=88;
    assert.deepEqual(reference(c),r);assert(Object.isFrozen(c.samples[0].point.source));
    assert.throws(()=>{c.samples[0].point[field]=77;});
    const reverse=o=>Array.isArray(o)?o.map(reverse):o&&typeof o==='object'?Object.fromEntries(Object.entries(o).reverse().map(([k,v])=>[k,reverse(v)])):o;
    const original=input(await get(t,1),family);
    assert.deepEqual(reference(capture(original)),reference(capture(reverse(original))));
  });
  test(family+': same-time changed value and coordinates change exact reference',async t=>{
    const a=await get(t,1),b=await get(t,2);assert.equal(a.observedAt,b.observedAt);
    const r=reference(capture(input(a,family)));
    assert.notDeepEqual(r,reference(capture(input(b,family))));
    a.resolvedLatitude+=0.01;assert.notDeepEqual(r,reference(capture(input(a,family))));
  });
  test(family+': signed zero requires exact codec, ordinary JSON loses it',async t=>{
    const minus=await get(t,-0),plus=await get(t,0);
    assert(Object.is(minus[field],-0));
    assert(!Object.is(JSON.parse(JSON.stringify(minus))[field],-0));
    const c=capture(input(minus,family));assert(Object.is(roundTrip(c)[field],-0));
    assert.notDeepEqual(reference(c),reference(capture(input(plus,family))));
    const wire=JSON.parse(JSON.stringify({captureText:serialize(c),reference:reference(c)}));
    assert(Object.is(roundTrip(read(wire.captureText))[field],-0));
  });
  test(family+': null, measured zero and missing required value cannot collapse',async t=>{
    const missing=await get(t,null),zero=await get(t,0);
    assert.equal(missing[field],null);assert.equal(zero[field],0);
    assert.notDeepEqual(reference(capture(input(missing,family))),reference(capture(input(zero,family))));
    const absent=input(missing,family);delete absent.samples[0].point[field];assert.throws(()=>capture(absent));
  });
  test(family+': normalization lineage binds identity without relabelling history',async t=>{
    const i=input(await get(t,1),family),c=capture(i);
    assert.deepEqual(c.lineageReferences,[SOURCE_NORMALIZATION_REFERENCE]);
    i.lineageReferences=[];const historical=capture(i);
    assert.deepEqual(read(serialize(historical)).lineageReferences,[]);
    assert.notDeepEqual(reference(c),reference(historical));
    assert.equal(c.scientificContentDigest,historical.scientificContentDigest);
    i.lineageReferences=[ref('synthetic-other-processing')];
    assert.notDeepEqual(reference(c),reference(capture(i)));
  });
}

test('DIRECT and GAP_FILLED identical time/value remain distinct exact evidence',async t=>{
  const direct=input((await probe(t,'direct')).point,'CHLOROPHYLL_DIRECT');
  const gap=input((await probe(t,'gap')).point,'CHLOROPHYLL_GAP_FILLED');
  assert.equal(direct.samples[0].point.observedAt,gap.samples[0].point.observedAt);
  assert.equal(direct.samples[0].point.concentrationMgM3,gap.samples[0].point.concentrationMgM3);
  assert.notDeepEqual(reference(capture(direct)),reference(capture(gap)));
  const wrong=structuredClone(direct);wrong.family='CHLOROPHYLL_GAP_FILLED';assert.throws(()=>capture(wrong));
});

test('GAP_FILLED binds known family markers, refuses invented deployment claims',async t=>{
  const i=input((await probe(t,'gap')).point,'CHLOROPHYLL_GAP_FILLED');
  for(const key of ['algorithm','observationType','resolutionKilometers','experimental']) {
    const bad=structuredClone(i);delete bad.samples[0].point.source[key];assert.throws(()=>capture(bad));
  }
  const bad=structuredClone(i);bad.samples[0].point.source.algorithmVersion='unqualified';assert.throws(()=>capture(bad));
  const c=capture(i);i.lineageReferences.push(ref('synthetic-dependency'));
  assert.notDeepEqual(reference(c),reference(capture(i)));
  assert.equal(c.scientificContentDigest,capture(i).scientificContentDigest);
});

test('quality is outside source capture, never silently stripped by the codec',()=>{
  for(const family of ['SST','CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED']) {
    const i=captureFixture(family);i.samples[0].point.quality={state:'qualified'};
    assert.throws(()=>capture(i));
  }
});

test('optional coordinate absence is distinct from explicit null in exact content',()=>{
  for(const family of ['SST','CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED']) {
    const a=captureFixture(family),b=captureFixture(family);
    delete a.samples[0].point.requestedLatitude;b.samples[0].point.requestedLatitude=null;
    assert.notDeepEqual(reference(capture(a)),reference(capture(b)));
    assert(!Object.hasOwn(roundTrip(capture(a)),'requestedLatitude'));
    assert.equal(roundTrip(capture(b)).requestedLatitude,null);
  }
});

test('capture references and replay expose identity only, no eligibility or receipt authority',()=>{
  for(const family of ['SST','CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED']) {
    const c=capture(captureFixture(family));
    assert.deepEqual(Object.keys(reference(c)).sort(),['contractVersion','kind','referenceId','sha256']);
    const text=exactJson(replay(c));
    for(const name of ['receivedAt','scientificallyEligible','preferredRevision','lookbackEligible','score','confidence','rank'])
      assert(!text.includes('"'+name+'":'));
  }
});

// CENTER SST AVAILABILITY CONTRACT REVIEW. Diagnostic only: never add or map
// availability onto producer output, never alter the capture schema.
const centerCases = [
  {id:'finite',value:25,c:25,f:77},
  {id:'positive-zero',value:0,c:0,f:32},
  {id:'negative-zero',value:-0,c:-0,f:32},
  {id:'fahrenheit-zero',value:-160/9,c:-160/9,f:0},
  {id:'null',value:null,c:null,f:null},
  {id:'undefined',value:undefined,c:null,f:null},
  {id:'missing',omit:true,c:null,f:null},
  {id:'nan-internal',value:NaN,c:null,f:null},
  {id:'positive-infinity-internal',value:Infinity,c:null,f:null},
  {id:'negative-infinity-internal',value:-Infinity,c:null,f:null},
  {id:'finite-conversion-overflow',value:Number.MAX_VALUE,c:null,f:null},
  {id:'marine-provider-failure',reject:true,c:null,f:null},
  {id:'malformed-string',value:'bad',c:null,f:null},
  {id:'numeric-string',value:'25',c:null,f:null},
  {id:'malformed-object',value:{value:25},c:null,f:null},
  {id:'empty-string',value:'',c:null,f:null},
  {id:'old-center-time',value:25,time:'2000-01-01T00:00:00Z',c:25,f:77},
  {id:'future-center-time',value:25,time:'2040-01-01T00:00:00Z',c:25,f:77},
  {id:'missing-center-time',value:25,time:null,c:25,f:77}
];
async function centerCase(t,row) {
  const adapter={mock:{method(object,key,implementation){
    if(object!==globalThis||key!=='fetch')return t.mock.method(object,key,implementation);
    return t.mock.method(object,key,async raw=>{
      const u=new URL(raw),response=await implementation(raw);
      if(u.hostname!=='marine-api.open-meteo.com'||u.searchParams.get('current')==='sea_surface_temperature')return response;
      if(row.reject)throw Error('Synthetic center marine failure');
      return {...response,json:async()=>{
        const body=await response.json();
        if(row.omit)delete body.current.sea_surface_temperature;
        else body.current.sea_surface_temperature=row.value;
        if(Object.hasOwn(row,'time'))body.current.time=row.time;
        return body;
      }};
    });
  }}};
  return runScenario(adapter,liveScenarios.find(s=>s.id==='finite-control'),
    {clock:Date.parse('2060-01-01T00:00:00Z')+centerCases.indexOf(row)*86400000});
}
for(const row of centerCases)test('center contract matrix: '+row.id,async t=>{
  const {ocean}=await centerCase(t,row),p=ocean.observationSnapshot.observations.sst;
  const q=ocean.dataQuality.layers.sst,group=ocean.oceanEvidence.groups.temperature;
  assert(Object.is(p.temperatureCelsius,row.c));assert(Object.is(p.temperatureFahrenheit,row.f));
  assert.deepEqual(p.source,{provider:'Open-Meteo',classification:'forecast-model'});
  assert.equal(ocean.diagnostics.openMeteo.providerStatus.marineApi,row.reject?'rejected':'fulfilled');
  const admitted=row.f!==null;
  assert.equal(q.state,admitted?'live':row.reject?'degraded':'unavailable');
  assert.equal(q.reason,admitted?'current-model-value-available':row.reject?'marine-provider-request-failed':'no-valid-center-temperature');
  assert.equal(ocean.status.sst,admitted?'live':'unavailable');
  assert.equal(group.drivers.includes('center-temperature-available'),admitted);
  assert.equal(p.derived.spatialStructure.thresholdVersion,'pelora-sst-spatial-range-v1');
  assert.equal(p.derived.spatialStructure.centerTemperatureAvailable,admitted);
  // Neighbors remain finite: aggregate evidence availability is NOT center availability.
  assert.equal(group.available,true);
  assert.throws(()=>capture(input(p,'SST')));
  const value=n=>Object.is(n,-0)?'-0':n;
  console.log('CENTER_SST_CONTRACT_CASE '+JSON.stringify({id:row.id,celsius:value(p.temperatureCelsius),
    fahrenheit:p.temperatureFahrenheit,observedAt:p.observedAt,source:p.source,
    providerStatus:ocean.diagnostics.openMeteo.providerStatus.marineApi,status:ocean.status.sst,
    quality:q,temperatureEvidenceAvailable:group.available,centerDriverPresent:admitted,
    centerTemperatureAvailable:p.derived.spatialStructure.centerTemperatureAvailable,
    captureV2:'REJECTS_ABSENT_AVAILABILITY',existingFact:admitted?'NORMALIZED_PAIR_RETAINED':'NORMALIZED_PAIR_UNAVAILABLE'}));
});

test('center availability is explicit even when every directional request fails',async t=>{
  const {ocean}=await runScenario(t,liveScenarios.find(s=>s.id==='rejected-directional-sst'),
    {clock:Date.parse('2070-01-01T00:00:00Z')});
  const s=ocean.observationSnapshot.observations.sst.derived.spatialStructure;
  assert.equal(s.centerTemperatureAvailable,true);assert.equal(s.validNeighborCount,0);
  assert.equal(s.coverage,'insufficient');
});

test('spatial assembly failure omits center availability; omission is not false',async t=>{
  const {ocean}=await runScenario(t,liveScenarios.find(s=>s.id==='future-directional-sst'),
    {clock:Date.parse('2070-01-02T00:00:00Z')});
  const p=ocean.observationSnapshot.observations.sst,s=p.derived.spatialStructure;
  assert.equal(p.temperatureFahrenheit,77);assert(!Object.hasOwn(s,'centerTemperatureAvailable'));
  assert.equal(s.coverage,'unavailable');assert.equal(ocean.dataQuality.layers.sst.state,'live');
  assert(ocean.oceanEvidence.groups.temperature.drivers.includes('center-temperature-available'));
  assert(!Object.hasOwn(p.source,'availability'));assert.throws(()=>capture(input(p,'SST')));
});

test('capture-v2 SST availability is a required string enum, not a Boolean or unknown state',()=>{
  for(const availability of ['available','unavailable','no-valid-pixel','provider-unavailable','request-failed']) {
    const i=captureFixture('SST');i.samples[0].point.source.availability=availability;
    assert.equal(roundTrip(capture(i)).source.availability,availability);
    // Non-available states may retain finite diagnostics: v2 is not an iff classifier.
    assert.equal(roundTrip(capture(i)).temperatureCelsius,26);
  }
  for(const availability of [true,false,null,undefined,'unknown','AVAILABILITY_UNKNOWN','stale','degraded','invalid']) {
    const i=captureFixture('SST');i.samples[0].point.source.availability=availability;
    assert.throws(()=>capture(i));
  }
  const absent=captureFixture('SST');delete absent.samples[0].point.source.availability;
  assert.throws(()=>capture(absent));
  const inconsistent=captureFixture('SST');inconsistent.samples[0].point.temperatureCelsius=null;
  assert.throws(()=>capture(inconsistent));
});
