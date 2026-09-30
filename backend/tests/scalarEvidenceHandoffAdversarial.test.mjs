// Offline same-center validation/capture boundary attacks. No provider or storage access.
import test from 'node:test';
import assert from 'node:assert/strict';
import {bindCenterSstSpatial,captureBoundCenterSst,captureLiveChlorophyll,decodeScalarHandoff,
  registerScalarPublication,encodeScalarHandoff} from '../scalarEvidenceHandoff.mjs';
import {SOURCE_NORMALIZATION_VERSION as version,SOURCE_NORMALIZATION_REFERENCE as provenance} from '../sourceNormalization.mjs';
import {captureFixture,ref} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {readCurrentEvidenceCaptureV2 as read} from '../currentEvidenceCaptureV2.mjs';
import {encodeNormalizedOceanResponse,decodeNormalizedOceanSnapshot} from '../normalizedEvidenceCapture.mjs';
import {runScenario,scenarios} from './fixtures/transitiveProducerBoundaryFixture.mjs';
import {freeze} from '../../shared/oceanPublication.mjs';

const refs=[provenance];
const point=()=>{const p=captureFixture('SST').samples[0].point;delete p.source.availability;return p;};
const resultFor=f=>({thresholdVersion:'pelora-sst-spatial-range-v1',centerTemperatureAvailable:Number.isFinite(f),samples:[]});
async function binding(p=point(),produce=resultFor) {
  const spatial=await bindCenterSstSpatial(p,version,async f=>produce(f));
  return {spatial,assembled:{...p,derived:{spatialStructure:spatial}}};
}
const issue=(b,lineage=refs)=>captureBoundCenterSst(b.assembled,b.spatial,lineage);

async function scenario(changeDuringValidation) {
  const source=captureFixture('SST').samples[0].point;
  delete source.source.availability;
  const recordedCelsius=source.temperatureCelsius;
  const spatial=await bindCenterSstSpatial(source,version,async f=>({
    thresholdVersion:'pelora-sst-spatial-range-v1',centerTemperatureAvailable:Number.isFinite(f),samples:[]
  }));
  const assembled={...source,derived:{spatialStructure:spatial}};
  let getterCalls=0;
  if(changeDuringValidation)Object.defineProperty(assembled,'temperatureCelsius',{
    enumerable:true,configurable:true,get(){
      getterCalls++;
      // The validating read sees the bound value; subsequent capture reads see 27.
      Object.defineProperty(assembled,'temperatureCelsius',{
        enumerable:true,configurable:true,writable:true,value:27
      });
      return recordedCelsius;
    }
  });
  const envelope=captureBoundCenterSst(assembled,spatial,[provenance]);
  const capturedCelsius=read(envelope.captureText).samples[0].point.temperatureCelsius;
  return {recordedCelsius,capturedCelsius,getterCalls};
}

test('control: unchanged assembled center preserves recorded Celsius',async()=>{
  const result=await scenario(false);
  assert.equal(result.capturedCelsius,result.recordedCelsius);
});

test('Celsius changed during validation must not become accepted exact center evidence',async()=>{
  const result=await scenario(true);
  assert.equal(result.getterCalls,1);
  assert.equal(result.capturedCelsius,result.recordedCelsius,
    'Accepted capture must retain the same Celsius that established the center binding');
});

for(const field of ['temperatureCelsius','temperatureFahrenheit','requestedLatitude','requestedLongitude',
  'resolvedLatitude','resolvedLongitude','observedAt','timestampProvenance']) {
  for(const mode of ['changing','throwing-second']) test(field+' retained once at capture: '+mode,async()=>{
    const b=await binding(),expected=b.assembled[field];let reads=0;
    Object.defineProperty(b.assembled,field,{enumerable:true,configurable:true,get(){
      reads++;if(reads>1&&mode==='throwing-second')throw Error('Second read');
      return reads===1?expected:typeof expected==='number'?expected+1:'changed';
    }});
    const e=issue(b),p=read(e.captureText).samples[0].point;
    assert.equal(reads,1);assert(Object.is(p[field],expected));
    assert(Object.is(decodeScalarHandoff(e,'SST')[field],expected));
  });
}

for(const field of ['temperatureCelsius','temperatureFahrenheit','requestedLatitude','requestedLongitude','observedAt']) {
  test(field+' retained once before spatial producer and backing mutation',async()=>{
    const source=point(),assembled=structuredClone(source),expected=source[field];let reads=0,backing=expected;
    Object.defineProperty(source,field,{enumerable:true,get(){reads++;if(reads>1)throw Error('Second source read');return backing;}});
    let delivered;
    const spatial=await bindCenterSstSpatial(source,version,async f=>{delivered=f;backing='mutated';return resultFor(f);});
    assembled.derived={spatialStructure:spatial};
    const e=captureBoundCenterSst(assembled,spatial,refs);
    assert.equal(reads,1);assert.equal(delivered,78.8);assert(Object.is(read(e.captureText).samples[0].point[field],expected));
  });
}
test('first Celsius read failure creates no spatial authority',async()=>{
  const p=point();let reads=0,calls=0;
  Object.defineProperty(p,'temperatureCelsius',{enumerable:true,get(){reads++;throw Error('First Celsius read');}});
  await assert.rejects(bindCenterSstSpatial(p,version,async f=>{calls++;return resultFor(f);}),/First Celsius read/);
  assert.equal(reads,1);assert.equal(calls,0);
});
test('original source alias reuses its tuple without a second Celsius/Fahrenheit read',async()=>{
  const p=point();let c=0,f=0;
  Object.defineProperty(p,'temperatureCelsius',{enumerable:true,get(){c++;if(c>1)throw Error('Second Celsius');return 26;}});
  Object.defineProperty(p,'temperatureFahrenheit',{enumerable:true,get(){f++;if(f>1)throw Error('Second Fahrenheit');return 78.8;}});
  const spatial=await bindCenterSstSpatial(p,version,async x=>resultFor(x));p.derived={spatialStructure:spatial};
  const e=captureBoundCenterSst(p,spatial,refs),captured=read(e.captureText).samples[0].point;
  assert.deepEqual([c,f],[1,1]);assert.equal(captured.temperatureCelsius,26);assert.equal(captured.temperatureFahrenheit,78.8);
});
test('post-materialization source mutations retain exact center identity, not revised raw values',async()=>{
  const p=point(),expected=structuredClone(p),spatial=await bindCenterSstSpatial(p,version,async x=>resultFor(x));
  p.derived={spatialStructure:spatial};const before=captureBoundCenterSst(p,spatial,refs);
  p.temperatureCelsius=27;p.temperatureFahrenheit=80.6;p.requestedLatitude=26;p.requestedLongitude=-91;
  p.observedAt='changed';p.providerCoordinates.resolvedLatitude=27;
  spatial.centerTemperatureAvailable=false;spatial.thresholdVersion='changed';
  const after=captureBoundCenterSst(p,spatial,refs),captured=read(after.captureText).samples[0].point;
  assert.deepEqual(after,before);
  for(const field of ['temperatureCelsius','temperatureFahrenheit','requestedLatitude','requestedLongitude','observedAt','providerCoordinates'])assert.deepEqual(captured[field],expected[field]);
});
test('nested provider coordinates are single-read retained and bound',async()=>{
  const b=await binding(),expected=structuredClone(b.assembled.providerCoordinates);let lat=0,lon=0,outer=0;
  const coords={get resolvedLatitude(){lat++;if(lat>1)throw Error('latitude reread');return expected.resolvedLatitude;},
    get resolvedLongitude(){lon++;if(lon>1)throw Error('longitude reread');return expected.resolvedLongitude;}};
  Object.defineProperty(b.assembled,'providerCoordinates',{enumerable:true,get(){outer++;return coords;}});
  const e=issue(b);assert.deepEqual(read(e.captureText).samples[0].point.providerCoordinates,expected);
  assert.deepEqual([outer,lat,lon],[1,1,1]);
});
test('changed nested coordinates cannot substitute for the bound center',async()=>{
  const b=await binding();b.assembled.providerCoordinates={...b.assembled.providerCoordinates,resolvedLatitude:26};
  assert.throws(()=>issue(b));
});

test('producer version and Boolean materialize once; later backing mutation has no authority',async()=>{
  const p=point();let v=0,a=0,producer='pelora-sst-spatial-range-v1',available=true;
  const spatial=await bindCenterSstSpatial(p,version,async()=>({
    get thresholdVersion(){v++;if(v>1)throw Error('producer reread');return producer;},
    get centerTemperatureAvailable(){a++;if(a>1)throw Error('availability reread');return available;},samples:[]
  }));
  producer='unqualified';available=false;
  const assembled={...p,derived:{spatialStructure:spatial}},e=captureBoundCenterSst(assembled,spatial,refs);
  assert.equal(read(e.captureText).samples[0].point.source.availability,'available');assert.deepEqual([v,a],[1,1]);
  assert.equal(decodeScalarHandoff(e,'SST').derived.spatialStructure.thresholdVersion,'pelora-sst-spatial-range-v1');
});
test('snapshot clone authority getters are retained once before validation',async()=>{
  const b=await binding();let a=0,v=0;
  b.assembled.derived.spatialStructure={samples:[],get thresholdVersion(){v++;if(v>1)throw Error('version reread');return 'pelora-sst-spatial-range-v1';},
    get centerTemperatureAvailable(){a++;if(a>1)throw Error('availability reread');return true;}};
  assert.equal(read(issue(b).captureText).samples[0].point.source.availability,'available');assert.deepEqual([a,v],[1,1]);
});
for(const value of [undefined,null,'true','false',0,1,[],{},new Boolean(true)]) test('malformed availability refuses '+String(value),async()=>{
  const b=await binding(point(),()=>({thresholdVersion:'pelora-sst-spatial-range-v1',centerTemperatureAvailable:value,samples:[]}));
  assert.throws(()=>issue(b));
});
test('inherited availability and throwing availability getter have no authority',async()=>{
  for(const produce of [()=>Object.assign(Object.create({centerTemperatureAvailable:true}),{thresholdVersion:'pelora-sst-spatial-range-v1',samples:[]}),
    ()=>({thresholdVersion:'pelora-sst-spatial-range-v1',get centerTemperatureAvailable(){throw Error('unreadable');},samples:[]})]) {
    const b=await binding(point(),produce);assert.throws(()=>issue(b));
  }
});
for(const producer of [undefined,null,'wrong','pelora-sst-spatial-range-v2']) test('unqualified producer version refuses '+String(producer),async()=>{
  const b=await binding(point(),()=>({thresholdVersion:producer,centerTemperatureAvailable:true,samples:[]}));assert.throws(()=>issue(b));
});
test('copied producer label, spatial object or directional lookalike cannot establish binding',async()=>{
  const b=await binding();for(const s of [structuredClone(b.spatial),{...b.spatial,direction:'north'}]) {
    assert.throws(()=>captureBoundCenterSst({...b.assembled,derived:{spatialStructure:s}},s,refs));
  }
});

test('source identity and processing-reference getters cannot change validated capture values',async()=>{
  const b=await binding();let providers=0,classes=0;const counts={};
  b.assembled.source={get provider(){providers++;if(providers>1)throw Error('provider reread');return 'Open-Meteo';},
    get classification(){classes++;if(classes>1)throw Error('classification reread');return 'forecast-model';}};
  const processing={};for(const [key,value]of Object.entries(provenance))Object.defineProperty(processing,key,{enumerable:true,get(){
    counts[key]=(counts[key]??0)+1;if(counts[key]>1)throw Error('provenance reread');return value;
  }});
  const e=issue(b,[processing]),c=read(e.captureText);
  assert.deepEqual(c.lineageReferences,refs);assert.equal(c.samples[0].point.source.provider,'Open-Meteo');
  assert.equal(providers,1);assert.equal(classes,1);assert(Object.values(counts).every(x=>x===1));
});
test('mutation during later materialization cannot rewrite earlier retained center/provenance',async()=>{
  const b=await binding(),lineage=structuredClone(refs),originalSource=b.assembled.source;
  Object.defineProperty(b.assembled,'source',{enumerable:true,get(){
    b.assembled.temperatureCelsius=27;b.assembled.temperatureFahrenheit=80.6;b.assembled.requestedLatitude=26;
    b.assembled.observedAt='changed';lineage[0].contractVersion='unqualified';return originalSource;
  }});
  const e=issue(b,lineage),c=read(e.captureText);
  assert.equal(c.samples[0].point.temperatureCelsius,26);assert.equal(c.samples[0].point.temperatureFahrenheit,78.8);
  assert.equal(c.samples[0].point.requestedLatitude,25);assert.equal(c.samples[0].point.observedAt,'2026-09-24T00:00:00Z');
  assert.deepEqual(c.lineageReferences,refs);
});
test('processing reference order retains existing v2 ordered-array identity; object order is canonical',async()=>{
  const b=await binding(),extra=ref('extra-processing');
  const a=issue(b,[provenance,extra]),c=issue(b,[extra,provenance]);assert.notDeepEqual(a.reference,c.reference);
  assert.deepEqual(read(a.captureText).lineageReferences,[provenance,extra]);
  assert.deepEqual(issue(b,[Object.fromEntries(Object.entries(provenance).reverse()),extra]).reference,a.reference);
});

for(const z of [0,-0]) test('single-read Celsius signed zero '+(Object.is(z,-0)?'-0':'+0'),async()=>{
  const source=point();source.temperatureCelsius=z;source.temperatureFahrenheit=32;const assembled=structuredClone(source);let reads=0;
  Object.defineProperty(source,'temperatureCelsius',{enumerable:true,get(){reads++;if(reads>1)throw Error('Celsius reread');return z;}});
  const spatial=await bindCenterSstSpatial(source,version,async f=>resultFor(f));assembled.derived={spatialStructure:spatial};
  const e=captureBoundCenterSst(assembled,spatial,refs);assert.equal(reads,1);
  assert(Object.is(read(e.captureText).samples[0].point.temperatureCelsius,z));
  assert(Object.is(decodeScalarHandoff(JSON.parse(JSON.stringify(e)),'SST').temperatureCelsius,z));
});
for(const [name,c,f,availability,accepted]of [
  ['normal',26,78.8,true,true],['subnormal',Number.MIN_VALUE,32,true,true],['extreme finite',Number.MAX_VALUE,Number.MAX_VALUE,true,true],
  ['finite pair mismatch',26,80.6,true,true], // V2 does not establish a C/F conversion-equality policy.
  ['C nonfinite',NaN,78.8,true,false],['F nonfinite',26,Infinity,true,false],
  ['C absent',undefined,78.8,true,false],['F absent',26,undefined,true,false],
  ['false null pair',null,null,false,true],['false diagnostic C',26,null,false,true],
  ['false finite F',null,78.8,false,false],['false finite pair',26,78.8,false,false],['false signed zero',-0,-0,false,false]
]) test('retained tuple/v2 state: '+name,async()=>{
  const p=point();p.temperatureCelsius=c;p.temperatureFahrenheit=f;
  const b=await binding(p,()=>({thresholdVersion:'pelora-sst-spatial-range-v1',centerTemperatureAvailable:availability,samples:[]}));
  if(accepted){const cp=read(issue(b).captureText).samples[0].point;assert(Object.is(cp.temperatureCelsius,c));assert(Object.is(cp.temperatureFahrenheit,f));}
  else assert.throws(()=>issue(b));
});

for(const family of ['CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED']) {
  test(family+' same-time identity, reconstruction, context neutrality and detachment',()=>{
    const p=captureFixture(family).samples[0].point,e=captureLiveChlorophyll(p,refs),reference=structuredClone(e.reference);
    for(const mutate of [q=>q.concentrationMgM3+=.1,q=>q.requestedLatitude+=1]) {
      const q=structuredClone(p);mutate(q);assert.notDeepEqual(captureLiveChlorophyll(q,refs).reference,e.reference);
    }
    assert.notDeepEqual(captureLiveChlorophyll(p,[provenance,ref('other-processing')]).reference,e.reference);
    assert.throws(()=>captureLiveChlorophyll(p,[]));assert.throws(()=>captureLiveChlorophyll({...p,source:{...p.source,provider:'wrong'}},refs));
    assert.deepEqual(captureLiveChlorophyll({...p,ageHours:100},refs).reference,e.reference);
    assert.deepEqual(decodeScalarHandoff(JSON.parse(JSON.stringify(e)),family),p);
    p.concentrationMgM3=99;p.source.availability='unavailable';assert.deepEqual(e.reference,reference);
    for(const field of ['captureText','contextText','sha256']) {const bad=structuredClone(e);bad[field]+=' ';assert.throws(()=>decodeScalarHandoff(bad,family));}
  });
}
test('GAP_FILLED markers cannot be removed, changed or augmented with invented deployment authority',()=>{
  for(const mutate of [p=>delete p.source.algorithm,p=>p.source.algorithm='other',p=>delete p.source.observationType,
    p=>p.source.deploymentVersion='invented',p=>p.source.algorithmVersion='invented']) {
    const p=captureFixture('CHLOROPHYLL_GAP_FILLED').samples[0].point;mutate(p);assert.throws(()=>captureLiveChlorophyll(p,refs));
  }
});
test('DIRECT/GAP_FILLED family substitution rejects partial relabeling and equal values remain distinct',()=>{
  const d=captureFixture('CHLOROPHYLL_DIRECT').samples[0].point,g=captureFixture('CHLOROPHYLL_GAP_FILLED').samples[0].point;
  assert.notDeepEqual(captureLiveChlorophyll(d,refs).reference,captureLiveChlorophyll(g,refs).reference);
  assert.throws(()=>captureLiveChlorophyll({...d,source:{...d.source,classification:g.source.classification}},refs));
  assert.throws(()=>captureLiveChlorophyll({...g,source:{...g.source,classification:d.source.classification}},refs));
});
test('actual spatial omission preserves ordinary publication and refuses center reference',async t=>{
  const {ocean}=await runScenario(t,scenarios.find(s=>s.id==='future-directional-sst'),{clock:Date.parse('2090-01-01T00:00:00Z')});
  const original=ocean.observationSnapshot.observations.sst;
  assert.equal(original.temperatureFahrenheit,77);assert(!Object.hasOwn(original.derived.spatialStructure,'centerTemperatureAvailable'));
  const wire=encodeNormalizedOceanResponse(ocean,version);
  assert.deepEqual(wire.observationSnapshot.observations.sst,original);
  assert(!Object.hasOwn(wire.observationSnapshot.observations.sst,'captureText'));
  assert.deepEqual(wire.dataQuality,ocean.dataQuality);assert.equal(wire.dataQuality.layers.sst.state,'live');
});
test('unmarked history is not recaptured or defaulted; unavailable generic chlorophyll is not substituted',()=>{
  const p=freeze(point()),o={observations:{sst:p,chlorophyll:freeze({source:{classification:'chlorophyll-unavailable'}})},lineage:{processingReferences:[]}};
  registerScalarPublication(o,{});assert.equal(encodeScalarHandoff(p),p);assert.equal(encodeScalarHandoff(o.observations.chlorophyll),o.observations.chlorophyll);
  assert.deepEqual(decodeNormalizedOceanSnapshot({observation:o}),{observation:o});
});
