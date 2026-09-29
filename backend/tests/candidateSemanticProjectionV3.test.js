import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {producerCorpus,assessment,scenarios} from './fixtures/snapshotProducerSurfaceFixture.mjs';
import {projectCandidateSemanticSurfacesV3 as project,compareCandidateScientificSurfacesV3 as compare,SEMANTIC_PROJECTION_V3} from '../candidateSemanticProjectionV3.mjs';
import {projectCandidateSemanticSurfacesV2 as v2} from '../candidateSemanticProjectionV2.mjs';
import frozen from '../../docs/Candidate_Snapshot_Producer_Surface_v1.json' with {type:'json'};
import amendment from '../../docs/Candidate_Semantic_Shapes_v3.json' with {type:'json'};
import predecessor from '../../docs/Candidate_Snapshot_Shape_Authority_Boundary_v1.json' with {type:'json'};
const cases=[];
const input=c=>({assessment,observationSnapshot:c.snapshot});
const spatial=x=>x.observationSnapshot.observations.sst.derived.spatialStructure;
const feature=x=>x.observationSnapshot.observations.sst.derived.governedEnvironmentalFeatureObservation;
const clone=structuredClone;
test.before(async t=>cases.push(...await producerCorpus(t)));
for(const s of scenarios)test('actual producer snapshot self-compares: '+s.name,()=>{
  const c=cases.find(x=>x.name===s.name),p=project(input(c));
  assert.equal(p.version,SEMANTIC_PROJECTION_V3);assert(p.complete);assert.equal(p.unresolved.length,0);
  assert.equal(compare(input(c),input(c)).classification,'EXACT_MATCH');
});
test('frozen delta is exactly the prior-to-implementation inventory; no new patterns',()=>{
  assert.equal(createHash('sha256').update(JSON.stringify(frozen.proposedDelta)).digest('hex'),frozen.frozenDeltaSha256);
  assert.equal(amendment.frozenDeltaSha256,frozen.frozenDeltaSha256);
  assert.deepEqual(amendment.delta.map(x=>x.path),frozen.proposedDelta.map(x=>x.path));
  for(let i=0;i<frozen.proposedDelta.length;i++)assert.deepEqual(Object.fromEntries(Object.keys(frozen.proposedDelta[i]).map(key=>[key,amendment.delta[i][key]])),frozen.proposedDelta[i]);
  assert.equal(amendment.delta.length,33);
});
test('v1/v2 bytes and their registries are unchanged',()=>{
  for(const [path,hash] of Object.entries(predecessor.predecessorHashes))assert.equal(createHash('sha256').update(readFileSync(new URL('../../'+path,import.meta.url))).digest('hex'),hash);
});

test('reviewed temporal authority preserves exact locked roles, not lexical discovery hints',()=>{
  const registry=JSON.parse(readFileSync(new URL('../../docs/Candidate_Semantic_Surfaces_v1.json',import.meta.url)));
  assert.deepEqual(amendment.reviewedTemporalAuthority,registry.temporalAuthority.filter(r=>r.path.startsWith('/observationSnapshot/')));
  assert.equal(amendment.reviewedTemporalAuthority.find(r=>r.path==='/observationSnapshot/observedAt').role,'QUALITY_TIME');
});
test('all projected entries retain source values exactly; validation tokens do not escape',()=>{
  for(const c of cases){const x=input(c),p=project(x);
    for(const surface of ['currentOceanScientificEvidence','documentaryHistoryContext','retrievalSnapshotMetadata','operationalRequestContext','speciesInterpretationOutput'])
      for(const row of p[surface])assert.deepEqual(row.value,row.path.slice(1).split('/').map(k=>k.replaceAll('~1','/').replaceAll('~0','~')).reduce((v,k)=>v[k],x));
  }
});
test('v2 remains fail closed for its old missing snapshot boundary',()=>{
  assert(!v2(input(cases[0])).complete);assert(project(input(cases[0])).complete);
  assert.throws(()=>compare(v2({sst:{temperatureCelsius:1}}),v2({sst:{temperatureCelsius:1}})));
});
const mutations=[
 ['unknown scientific descendant',x=>spatial(x).unknownScience=null],
 ['unknown documentary descendant',x=>x.observationSnapshot.metadataUnknown={a:1}],
 ['missing sample time key',x=>delete spatial(x).samples[0].observedAt],
 ['missing classification',x=>delete spatial(x).classification],
 ['finite minimum replaced with null',x=>spatial(x).minimumFahrenheit=null],
 ['wrong nullable container',x=>spatial(x).orientation=null],
 ['sparse sample array',x=>delete spatial(x).samples[0]],
 ['extra sample',x=>spatial(x).samples.push(clone(spatial(x).samples[0]))],
 ['reordered spatial samples',x=>spatial(x).samples.reverse()],
 ['wrong finite/null pair',x=>spatial(x).samples[0].temperatureCelsius=null],
 ['missing band',x=>delete x.observationSnapshot.observations.sst.derived.temperatureBand],
 ['null band with finite center',x=>x.observationSnapshot.observations.sst.derived.temperatureBand=null],
 ['missing feature reference',x=>delete feature(x).observationReference],
 ['empty reference',x=>feature(x).observationReference=''],
 ['object reference',x=>feature(x).observationReference={}],
 ['wrong reference family',x=>feature(x).observationReference='pelora-capture-v1:'+'a'.repeat(64)],
 ['wrong reference version',x=>feature(x).observationReference='pelora-observation-v2:'+'a'.repeat(64)],
 ['malformed reference digest',x=>feature(x).observationReference='pelora-observation-v1:xyz'],
 ['private reference label',x=>feature(x).observationReference='captain_id.secret'],
 ['null reference despite available',x=>feature(x).observationReference=null],
 ['missing feature time',x=>delete feature(x).observedAt],
 ['null feature time conceals retained time',x=>feature(x).observedAt=null],
 ['malformed feature time',x=>feature(x).observedAt='not-a-time'],
 ['ambiguous feature time',x=>feature(x).observedAt='2026-09-24 00:00:00'],
 ['offset feature time',x=>feature(x).observedAt='2026-09-24T00:00:00+00:00'],
 ['unsupported precision',x=>feature(x).observedAt='2026-09-24T00:00:00.0000Z'],
 ['future feature time',x=>feature(x).observedAt='2030-01-01T00:00:00Z'],
 ['assessment substitution',x=>feature(x).observedAt=assessment.assessmentAt],
 ['retrieval substitution',x=>feature(x).observedAt=x.observationSnapshot.generatedAt],
 ['acquisition-time sample provenance',x=>spatial(x).samples[0].timestampProvenance='acquisition-time'],
 ['malformed source time',x=>spatial(x).samples[0].observedAt='not-a-time'],
 ['future source time',x=>spatial(x).samples[0].observedAt='2030-01-01T00:00:00Z'],
 ['offset source time',x=>spatial(x).samples[0].observedAt='2026-09-24T00:00:00+00:00'],
 ['missing requirement array',x=>delete feature(x).missingRequirements],
 ['null requirements',x=>feature(x).missingRequirements=null],
 ['unknown requirement',x=>feature(x).missingRequirements=['invented']],
 ['contradictory requirements with reference',x=>feature(x).missingRequirements=['at-least-three-valid-spatial-samples']],
 ['false feature availability',x=>feature(x).available=false],
 ['feature footprint reordered',x=>feature(x).samplingFootprint.samples.reverse()],
 ['feature footprint duplicate',x=>feature(x).samplingFootprint.samples[1]=clone(feature(x).samplingFootprint.samples[0])],
 ['feature footprint changed provenance',x=>feature(x).samplingFootprint.samples[0].source.provider='Other'],
 ['feature footprint changed time',x=>feature(x).samplingFootprint.samples[0].observedAt=assessment.assessmentAt],
 ['feature time/availability conflation',x=>{feature(x).available=false;feature(x).observationReference=null;feature(x).observedAt=null;}],
 ['unknown feature sibling',x=>feature(x).newAuthority=true],
 ['independent confidence alias change',x=>x.observationSnapshot.evidence.groups.temperature.confidence.sampleAgeHours=0],
 ['independent orientation alias change',x=>{const o=x.observationSnapshot.evidence.groups.temperature.orientation;o.warmSide=o.warmSide==='west'?'east':'west';}]
];
for(const [name,change] of mutations)test('guard rejects: '+name,()=>{
  const good=input(cases.find(c=>c.name==='direction-mask-15')),bad=clone(good);change(bad);
  assert.throws(()=>compare(bad,bad));assert.throws(()=>compare(good,bad));assert.throws(()=>compare(bad,good));
});
for(const label of ['captain_id','captainId','user_id','userId','email','boat','origin','range','Fishing Log','catch','lure','bait','private_coordinates','session','token','mission','550e8400-e29b-41d4-a716-446655440000_private'])test('new strings reject private label: '+label,()=>{
  for(const assign of [x=>spatial(x).confidence.reasons[0]=label,x=>feature(x).missingRequirements=[label],x=>feature(x).observationReference=label,x=>feature(x).observedAt=label]){
    const x=clone(input(cases[15]));assign(x);assert.throws(()=>compare(x,x));
  }
});
for(const variant of ['MINIMAL-TOTAL-TEMPERATURE-RANGE','minimal-total-temperature-range ',' minimal-total-temperature-range','prefix-minimal-total-temperature-range','minimal-total-temperature-range.suffix','minimal_total_temperature_range','minimal.total.temperature.range'])test('confidence reason exact allowlist: '+variant,()=>{
  const x=clone(input(cases.find(c=>c.name==='uniform')));spatial(x).confidence.reasons[1]=variant;assert.throws(()=>compare(x,x));
});
test('exact reasons cannot be reused in reference IDs or nested metadata',()=>{
  for(const change of [x=>feature(x).observationReference='minimal-total-temperature-range',x=>spatial(x).confidence.extra={reason:'minimal-total-temperature-range'},x=>spatial(x).samples[0].source.provider='minimal-total-temperature-range']){
    const x=clone(input(cases[15]));change(x);assert.throws(()=>compare(x,x));
  }
});
test('closed requirements preserve spelling ordering uniqueness and empty versus absent',()=>{
  for(const change of [a=>a.reverse(),a=>a.push(a[0]),a=>a[0]+=' ',a=>a[0]=a[0].toUpperCase(),a=>a[0]='prefix-'+a[0]]){
    const x=clone(input(cases[0]));change(feature(x).missingRequirements);assert.throws(()=>compare(x,x));
  }
});
test('valid-shaped changed reference is visible, not cryptographically authenticated by shape validation',()=>{
  const x=input(cases[15]),y=clone(x);const ref=feature(y).observationReference;
  feature(y).observationReference=ref.slice(0,-1)+(ref.endsWith('a')?'b':'a');
  assert.throws(()=>compare(y,y)); // A mismatched consumer alias is structurally impossible.
  y.observationSnapshot.evidence.groups.temperature.observationProvenance.observationReference=feature(y).observationReference;
  assert.equal(compare(x,y).classification,'MISMATCH');assert.equal(compare(y,x).classification,'MISMATCH');
  assert.equal(compare(y,y).classification,'EXACT_MATCH'); // Explicit producer-authentication boundary.
  feature(y).observationReference=feature(input(cases[7])).observationReference;
  y.observationSnapshot.evidence.groups.temperature.observationProvenance.observationReference=feature(y).observationReference;
  if(feature(y).observationReference!==null)assert.equal(compare(x,y).classification,'MISMATCH');
});
test('two-sided null/finite and signed-zero differences remain visible',()=>{
  const positive=input(cases.find(c=>c.name==='positive-zero')),negative=input(cases.find(c=>c.name==='negative-zero'));
  assert.equal(compare(positive,negative).classification,'MISMATCH');
  assert.equal(compare(negative,positive).classification,'MISMATCH');
  assert.equal(compare(input(cases[0]),input(cases[15])).classification,'MISMATCH');
  assert.equal(compare(input(cases[15]),input(cases[0])).classification,'MISMATCH');
  const single=clone(positive);spatial(single).samples[0].temperatureCelsius=-0;
  assert.deepEqual(compare(positive,single).differences.map(x=>x.path),['/observationSnapshot/observations/sst/derived/spatialStructure/samples/0/temperatureCelsius']);
  assert.equal(compare(single,positive).classification,'MISMATCH');
  const invalid=clone(input(cases[0]));spatial(invalid).minimumFahrenheit=0;
  assert.throws(()=>compare(input(cases[0]),invalid));assert.throws(()=>compare(invalid,input(cases[0])));
});
test('optional root facts must agree with snapshot scientific facts',()=>{
  const c=cases[15],x={...clone(input(c)),sst:{derived:{spatialStructure:clone(c.spatial)}}};
  assert.equal(compare(x,x).classification,'EXACT_MATCH');
  x.sst.derived.spatialStructure.rangeFahrenheit+=1;assert.throws(()=>compare(x,x));
});
test('prototype and accessor attacks never invoke hostile code',()=>{
  for(const key of ['observedAt','observationReference','missingRequirements']){
    let calls=0;const x=clone(input(cases[15]));Object.defineProperty(feature(x),key,{get(){calls++;return null;},set(){calls++;},enumerable:true});
    assert.throws(()=>project(x));assert.equal(calls,0);
  }
  for(const key of ['__proto__','constructor','prototype']){
    const x=clone(input(cases[15]));Object.defineProperty(feature(x),key,{value:{secret:1},enumerable:true});assert.throws(()=>project(x));
  }
  const x=clone(input(cases[15]));Object.setPrototypeOf(feature(x),{observedAt:null});assert.throws(()=>project(x));
});
test('detached immutable deterministic projection needs no network or clock',t=>{
  t.mock.method(globalThis,'fetch',()=>{throw Error('network');});t.mock.method(Date,'now',()=>{throw Error('clock');});
  const x=clone(input(cases[0])),p=project(x);feature(x).missingRequirements[0]='changed';
  assert.deepEqual(p,project(input(cases[0])));assert(Object.isFrozen(p.currentOceanScientificEvidence[0]));
  const reorder=value=>Array.isArray(value)?value.map(reorder):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).reverse().map(k=>[k,reorder(value[k])])):value;
  assert.deepEqual(project(reorder(input(cases[0]))),p);
});
