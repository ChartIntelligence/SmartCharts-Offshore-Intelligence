import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getSstSpatialStructure} from '../server.js';
import {projectCandidateSemanticSurfacesV1 as v1,compareCandidateScientificSurfacesV1 as compareV1} from '../candidateSemanticProjection.mjs';
import {projectCandidateSemanticSurfacesV2 as project,compareCandidateScientificSurfacesV2 as compare} from '../candidateSemanticProjectionV2.mjs';
import amendment from '../../docs/Candidate_Semantic_Shapes_v2.json' with {type:'json'};
const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'};
let sequence=0;
async function produce(t,values,center=78.8,time='2026-09-24T00:00:00Z'){
  const latitude=20+(sequence++);let n=0;
  const mock=t.mock.method(globalThis,'fetch',async url=>{
    assert.equal(new URL(url).hostname,'marine-api.open-meteo.com');
    return {ok:true,json:async()=>({latitude,longitude:-91,current:{time,sea_surface_temperature:values[n++%4]}})};
  });
  try{
    return {assessment:{...assessment},sst:{derived:{spatialStructure:await getSstSpatialStructure(latitude,-91,center,assessment)}}};
  }finally{mock.mock.restore();}
}
const shape=x=>x.sst.derived.spatialStructure;
const cases=[];
test.before(async t=>{
  for(let mask=0;mask<16;mask++)cases.push(await produce(t,[25,26,27,28].map((v,i)=>mask&(1<<i)?v:null)));
});
for(let mask=0;mask<16;mask++)test('actual directional availability combination '+mask+' self-compares under v2',()=>{
  const p=project(cases[mask]);assert(p.complete);assert.equal(p.version,'pelora-candidate-semantic-projection-v2');
  assert.equal(compare(cases[mask],cases[mask]).classification,'EXACT_MATCH');
  assert.equal(shape(cases[mask]).validNeighborCount,[0,1,2,3].filter(i=>mask&(1<<i)).length);
});
for(const [name,values,center,time] of [
 ['uniform',[25,25,25,25],77,'2026-09-24T00:00:00Z'],
 ['zero',[0,0,0,0],32,'2026-09-24T00:00:00Z'],
 ['center missing',[25,26,27,28],null,'2026-09-24T00:00:00Z'],
 ['all missing including center',[null,null,null,null],null,'2026-09-24T00:00:00Z'],
 ['missing represented time',[25,26,27,28],78.8,null],
 ['malformed time retained by current assembler',[25,26,27,28],78.8,'not-a-time']
])test(name,async t=>{
  const x=await produce(t,values,center,time);assert.equal(compare(x,x).classification,'EXACT_MATCH');
  if(time===null||time==='not-a-time')assert.equal(shape(x).confidence.sampleAgeHours,null);
  if(name==='zero')assert(shape(x).samples.every(x=>x.temperatureCelsius===0&&x.temperatureFahrenheit===32));
});
test('future represented time is rejected by actual unchanged assembler',async t=>{
  await assert.rejects(produce(t,[25,26,27,28],78.8,'2030-01-01T00:00:00Z'),/after scientific assessment/);
});
test('v1 populated behavior remains valid and v1 missing behavior remains fail closed',()=>{
  assert.equal(compareV1(cases[15],cases[15]).classification,'EXACT_MATCH');
  assert.equal(v1(cases[0]).unresolved.length,22);
  assert.throws(()=>compareV1(cases[0],cases[0]),/SEMANTIC_AUTHORITY_UNRESOLVED/);
});
function target(x,path){
  const parts=path.slice(1).split('/').map(k=>k==='*'?'0':k);
  let parent=x;for(const k of parts.slice(0,-1))parent=parent[k];
  return [parent,parts.at(-1)];
}
for(const row of amendment.nullablePaths)test('strict invalid/missing shapes: '+row.path,()=>{
  for(const bad of [undefined,NaN,Infinity,false,{},[]]){
    const x=structuredClone(cases[0]),[p,k]=target(x,row.path);p[k]=bad;
    assert.throws(()=>{if(!project(x).complete)throw Error('unresolved');});
  }
  const x=structuredClone(cases[0]),[p,k]=target(x,row.path);delete p[k];assert.throws(()=>compare(x,x));
});
for(const [name,change] of [
 ['fabricated Fahrenheit',s=>s.samples[0].temperatureFahrenheit=32],
 ['fabricated Celsius',s=>s.samples[0].temperatureCelsius=0],
 ['false availability',s=>s.samples[0].source.availability='available'],
 ['false count',s=>s.validNeighborCount=4],
 ['false coverage',s=>s.coverage='sufficient'],
 ['fabricated range',s=>s.rangeFahrenheit=0],
 ['fabricated classification',s=>s.classification='uniform-water'],
 ['fabricated opposite pair',s=>s.orientation.eastWestDifferenceFahrenheit=0],
 ['fabricated orientation',s=>s.orientation.dominantAxis='east-west'],
 ['fabricated confidence difference',s=>s.confidence.axisSeparationFahrenheit=0],
 ['fabricated age',s=>s.confidence.sampleAgeHours=0],
 ['unsupported provenance',s=>s.samples[0].timestampProvenance='retrieval-time'],
 ['missing direction',s=>delete s.samples[0].direction],
 ['reordered roles',s=>s.samples.reverse()],
 ['sparse samples',s=>delete s.samples[1]]
])test('reject impossible missing-state combination: '+name,()=>{
  const x=structuredClone(cases[0]);change(shape(x));assert.throws(()=>compare(x,x));
});
test('finite valid evidence cannot conceal age as null or hide future time',()=>{
  for(const change of [s=>s.confidence.sampleAgeHours=null,s=>{s.samples[0].observedAt='2030-01-01T00:00:00Z';s.confidence.sampleAgeHours=null;}]){
    const x=structuredClone(cases[15]);change(shape(x));assert.throws(()=>compare(x,x));
  }
});
test('null permission does not extend to other scientific fields or aliases',()=>{
  for(const x of [{wind:{speedKnots:null}},{sst:{derived:{spatialStructure:{sampleRadiusNauticalMiles:null}}}}]){
    // Existing v1 null policy remains authoritative outside the amendment.
    if(!v1(x).complete)assert.throws(()=>compare(x,x));
  }
  const x=structuredClone(cases[0]);shape(x).unknownScientific=null;
  assert(!project(x).complete);assert.throws(()=>compare(x,x),/UNRESOLVED/);
});
test('comparison is two-sided and distinguishes missing fields, changed values and signed zero',()=>{
  const x=structuredClone(cases[15]);x.sst.derived.spatialStructure.rangeFahrenheit+=1;
  assert.equal(compare(cases[15],x).classification,'MISMATCH');
  assert.equal(compare({currents:{northwardMetersPerSecond:-0}},{currents:{northwardMetersPerSecond:0}}).classification,'MISMATCH');
  const y=structuredClone(cases[15]);delete y.assessment;
  assert.throws(()=>compare(cases[15],y));assert.throws(()=>compare(y,cases[15]));
});
test('privacy and descriptor checks remain inherited from locked v1',()=>{
  const x=structuredClone(cases[15]);shape(x).samples[0].source.provider='captain_id.private';assert.throws(()=>project(x));
  let called=false;const y=structuredClone(cases[15]);Object.defineProperty(shape(y),'rangeFahrenheit',{get(){called=true;return 1;}});
  assert.throws(()=>project(y));assert(!called);
  assert.throws(()=>project(Object.assign(Object.create({secret:1}),cases[15])));
});
test('projection remains detached immutable deterministic and clock/network independent',t=>{
  const x=structuredClone(cases[0]);t.mock.method(Date,'now',()=>{throw Error('clock');});t.mock.method(globalThis,'fetch',()=>{throw Error('network');});
  const p=project(x),text=JSON.stringify(p);shape(x).samples[0].source.provider='changed';
  assert.equal(JSON.stringify(p),text);assert(Object.isFrozen(p.currentOceanScientificEvidence[0]));
  const reorder=v=>Array.isArray(v)?v.map(reorder):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).reverse().map(([k,x])=>[k,reorder(x)])):v;
  assert.deepEqual(project(cases[0]),project(reorder(cases[0])));
  assert(!Object.keys(p).some(k=>/digest|identity|captureId/.test(k)));
});
test('amendment is exact and explicit: original sixteen plus represented-time prerequisite',()=>{
  const original=JSON.parse(readFileSync(new URL('../../docs/Current_Scientific_Reconstruction_Boundary_v1.json',import.meta.url),'utf8'));
  assert.deepEqual(amendment.nullablePaths.slice(0,16).map(x=>x.path),original.blockingRegistryPaths.map(x=>x.path));
  assert.equal(amendment.nullablePaths.length,17);
});

test('v1 implementation and registry bytes remain exactly checkpoint-compatible',async()=>{
  const {createHash}=await import('node:crypto');
  for(const [path,digest] of Object.entries(amendment.v1ByteDigests)){
    assert.equal(createHash('sha256').update(readFileSync(new URL('../../'+path,import.meta.url))).digest('hex'),digest);
  }
  assert.deepEqual(project(cases[15]).currentOceanScientificEvidence,v1(cases[15]).currentOceanScientificEvidence);
});
test('new public confidence text is path-specific and cannot carry appended private data',()=>{
  const good=structuredClone(cases[15]);shape(good).confidence.reasons=['minimal-total-temperature-range'];
  assert(project(good).complete);
  for(const value of ['minimal-total-temperature-range captain_id.x','weak-total-temperature-range.user_id.secret']){
    const x=structuredClone(good);shape(x).confidence.reasons=[value];assert.throws(()=>project(x));
  }
  const x=structuredClone(cases[15]);shape(x).samples[0].source.provider='minimal-total-temperature-range';
  assert.throws(()=>project(x));
});

for(const [name,change] of [
 ['three finite with null classification',s=>s.classification=null],
 ['three finite with null minimum',s=>s.minimumFahrenheit=null],
 ['three finite with null maximum',s=>s.maximumFahrenheit=null],
 ['three finite with null range',s=>s.rangeFahrenheit=null],
 ['negative range',s=>s.rangeFahrenheit=-1],
 ['reversed bounds',s=>{s.minimumFahrenheit=100;s.maximumFahrenheit=10;}],
 ['invented classification',s=>s.classification='invented'],
 ['axis null sides populated',s=>s.orientation.dominantAxis=null],
 ['side absent',s=>s.orientation.warmSide=null],
 ['same sides',s=>{s.orientation.warmSide='east';s.orientation.coolSide='east';}],
 ['wrong side axis',s=>{s.orientation.dominantAxis='east-west';s.orientation.warmSide='north';s.orientation.coolSide='south';}],
 ['clear null magnitude',s=>s.orientation.dominantDifferenceFahrenheit=null],
 ['east west pair hidden',s=>s.orientation.eastWestDifferenceFahrenheit=null],
 ['north south pair hidden',s=>s.orientation.northSouthDifferenceFahrenheit=null],
 ['dominant hidden',s=>s.confidence.dominantDirectionalDifferenceFahrenheit=null],
 ['secondary hidden',s=>s.confidence.secondaryDirectionalDifferenceFahrenheit=null],
 ['separation hidden',s=>s.confidence.axisSeparationFahrenheit=null]
])test('adversarial populated coherence: '+name,()=>{
  const x=structuredClone(cases[15]);change(shape(x));assert.throws(()=>compare(x,x));
});
test('all partial masks enforce their own opposite-pair nullability independently',()=>{
  for(let mask=0;mask<16;mask++){
    for(const [group,key] of [['orientation','eastWestDifferenceFahrenheit'],['orientation','northSouthDifferenceFahrenheit'],
      ['confidence','dominantDirectionalDifferenceFahrenheit'],['confidence','secondaryDirectionalDifferenceFahrenheit'],['confidence','axisSeparationFahrenheit']]){
      const x=structuredClone(cases[mask]),old=shape(x)[group][key];shape(x)[group][key]=old===null?0:null;
      assert.throws(()=>compare(x,x));
    }
  }
});
test('exact reason exception rejects case whitespace prefix suffix punctuation and private label variations',()=>{
  for(const word of amendment.reviewedReasonText.values){
    const good=structuredClone(cases[15]);shape(good).confidence.reasons=[word];assert(project(good).complete);
    for(const value of [word.toUpperCase(),' '+word,word+' ',word+'X','X'+word,word.replaceAll('-','.'),word.replaceAll('-','_'),word.replaceAll('-',''),word+'.captain_id',word+'-userId',word+'_origin']){
      const x=structuredClone(good);shape(x).confidence.reasons=[value];assert.throws(()=>compare(x,x),value);
    }
    for(const mutate of [
      s=>s.samples[0].source.provider=word,
      s=>s.samples[0].source.referenceId=word,
      s=>s.confidence.metadata={reason:word},
      s=>s.confidence.reasons=[{value:word}]
    ]){
      const x=structuredClone(cases[15]);mutate(shape(x));assert.throws(()=>compare(x,x));
    }
  }
});
test('privacy labels cannot enter shared scientific source or reason paths',()=>{
  for(const label of ['captain_id','captainId','user_id','userId','email','boat','origin','range','Fishing Log','catch','lure','bait','private coordinates','session','token','mission','test@example.invalid','12345678-1234-1234-1234-123456789012']){
    for(const separator of ['.','-','_']){
      const x=structuredClone(cases[15]);shape(x).samples[0].source.provider=label+separator+'private';
      assert.throws(()=>compare(x,x),label);
    }
  }
});
test('unknown descendants remain accounted and block both comparison inputs',()=>{
  for(const extra of [
    x=>x.historyNovel={value:null},
    x=>x.oceanOpportunity={persistenceContext:{novel:null}},
    x=>x.snapshotMetadata={novel:null},
    x=>shape(x).orientation.novel=null,
    x=>shape(x).samples[0].source.novel={nested:null}
  ]){
    const x=structuredClone(cases[15]);extra(x);
    const p=project(x);assert(!p.complete);assert(p.unresolved.length);
    assert.throws(()=>compare(cases[15],x));assert.throws(()=>compare(x,cases[15]));
  }
});
test('malformed arrays containers and extra elements do not gain nullability',()=>{
  for(const value of [null,{},[],1,'missing']){
    const x=structuredClone(cases[15]);x.sst.derived.spatialStructure=value;assert.throws(()=>compare(x,x));
  }
  for(const mutation of [s=>s.samples.push(structuredClone(s.samples[0])),s=>s.samples=[],s=>s.orientation=null,s=>s.confidence=[],s=>delete s.confidence,s=>s.samples[0]=null]){
    const x=structuredClone(cases[15]);mutation(shape(x));assert.throws(()=>compare(x,x));
  }
});
test('valid null and finite scenes differ in both comparison directions',()=>{
  assert.equal(compare(cases[0],cases[0]).classification,'EXACT_MATCH');
  assert.equal(compare(cases[0],cases[15]).classification,'MISMATCH');
  assert.equal(compare(cases[15],cases[0]).classification,'MISMATCH');
  const x=structuredClone(cases[0]);delete shape(x).samples[0].observedAt;
  assert.throws(()=>compare(x,cases[0]));assert.throws(()=>compare(cases[0],x));
});
test('signed zero remains distinct at newly reviewed numeric spatial paths',()=>{
  for(const [group,key] of [['orientation','eastWestDifferenceFahrenheit'],['orientation','northSouthDifferenceFahrenheit'],['confidence','axisSeparationFahrenheit']]){
    const a=structuredClone(cases[15]),b=structuredClone(cases[15]);
    shape(a)[group][key]=-0;shape(b)[group][key]=0;
    assert.equal(compare(a,b).classification,'MISMATCH');
  }
});
test('numeric truth remains assembler authority rather than a second calculator',()=>{
  for(const change of [
    s=>s.rangeFahrenheit=999,
    s=>s.samples[0].temperatureFahrenheit+=0.1,
    s=>s.orientation.eastWestDifferenceFahrenheit+=0.1,
    s=>s.confidence.sampleAgeHours+=0.1
  ]){
    const x=structuredClone(cases[15]);change(shape(x));
    assert(project(x).complete); // Shape-valid does not certify numeric scientific correctness.
    assert.equal(compare(cases[15],x).classification,'MISMATCH');
  }
});
for(const [label,time] of [
 ['ambiguous timezone','2026-09-23T00:00:00'],
 ['offset timestamp','2026-09-24T00:00:00+00:00'],
 ['extra fractional precision','2026-09-24T00:00:00.123456Z'],
 ['malformed text','invalid-time']
])test('actual assembler time behavior is preserved without new temporal qualification: '+label,async t=>{
  const x=await produce(t,[25,26,27,28],78.8,time);
  assert.equal(compare(x,x).classification,'EXACT_MATCH');
  assert(shape(x).samples.every(s=>s.observedAt===time));
  assert.equal(shape(x).confidence.sampleAgeHours===null,!Number.isFinite(Date.parse(time)));
});
test('observedAt substitutions do not create hidden acquisition or assessment authority',()=>{
  const original=cases[15];
  for(const value of [123,{},[],undefined]){
    const x=structuredClone(original);shape(x).samples[0].observedAt=value;assert.throws(()=>compare(x,x));
  }
  for(const key of ['acquisitionAt','retrievedAt','assessmentAt']){
    const x=structuredClone(original);shape(x).samples[0][key]=assessment.assessmentAt;assert.throws(()=>compare(x,x));
  }
  const x=structuredClone(original);shape(x).samples[0].observedAt=assessment.assessmentAt;
  assert.equal(compare(original,x).classification,'MISMATCH');
  // Supplied text alone cannot authenticate whether a caller lied about its origin.
});
test('null times cannot conceal a valid finite-sample time or carry fabricated age',()=>{
  const x=structuredClone(cases[15]);shape(x).samples.forEach(s=>s.observedAt=null);
  assert.throws(()=>compare(x,x));shape(x).confidence.sampleAgeHours=null;assert(project(x).complete);
  shape(x).samples[0].observedAt='2026-09-24T00:00:00Z';assert.throws(()=>compare(x,x));
});
test('missing-temperature samples do not provide confidence age authority',()=>{
  const x=structuredClone(cases[0]);shape(x).samples.forEach(s=>s.observedAt='2030-01-01T00:00:00Z');
  assert(project(x).complete);assert.equal(shape(x).confidence.sampleAgeHours,null);
});
test('observedAt accessor and inherited values are rejected without invocation',()=>{
  for(const mode of ['getter','setter','inherited']){
    const x=structuredClone(cases[15]),sample=shape(x).samples[0];let invoked=false;
    if(mode==='inherited'){delete sample.observedAt;Object.setPrototypeOf(sample,{observedAt:'2026-09-24T00:00:00Z'});}
    else Object.defineProperty(sample,'observedAt',{enumerable:true,[mode==='getter'?'get':'set'](){invoked=true;return null;}});
    assert.throws(()=>project(x));assert(!invoked);
  }
});
test('mutation of all expanded evidence surfaces leaves output detached and deeply frozen',()=>{
  const x=structuredClone(cases[15]),p=project(x),before=JSON.stringify(p);
  shape(x).samples[0].observedAt=null;shape(x).samples[0].temperatureCelsius=null;
  shape(x).orientation.warmSide='changed';shape(x).confidence.sampleAgeHours=null;shape(x).confidence.reasons.reverse();
  assert.equal(JSON.stringify(p),before);
  function frozen(v){if(v&&typeof v==='object'){assert(Object.isFrozen(v));Object.values(v).forEach(frozen);}}frozen(p);
});
test('v2 projection records are explicit and cannot be silently consumed as raw v1 or v2 input',()=>{
  const p=project(cases[0]);assert.equal(p.version,'pelora-candidate-semantic-projection-v2');
  assert(!v1(p).complete);assert.throws(()=>compare(p,p));assert.equal(v1(cases[15]).version,'pelora-candidate-semantic-projection-v1');
});
test('emit actual sixteen-case review matrix',()=>{
  const matrix=cases.map((x,mask)=>{
    const s=shape(x);return {mask,finiteNeighborCount:s.validNeighborCount,
      oppositePairs:{eastWest:s.orientation.eastWestDifferenceFahrenheit!==null,northSouth:s.orientation.northSouthDifferenceFahrenheit!==null},
      orientation:s.orientation.classification,dominantAxis:s.orientation.dominantAxis,
      confidenceNulls:Object.fromEntries(['dominantDirectionalDifferenceFahrenheit','secondaryDirectionalDifferenceFahrenheit','axisSeparationFahrenheit','sampleAgeHours'].map(k=>[k,s.confidence[k]===null])),
      sampleNulls:s.samples.map(s=>s.temperatureCelsius===null),observedAtShapes:s.samples.map(s=>s.observedAt===null?'null':typeof s.observedAt),
      comparison:compare(x,x).classification};
  });
  console.log('V2_AVAILABILITY_MATRIX='+JSON.stringify(matrix));
});
