import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sources,composite,histories,spatialCorpus,semanticReviewCorpus,captainReviewFixture,speciesReviewFixture} from './fixtures/candidateSemanticFixture.mjs';
import {projectCandidateSemanticSurfacesV1 as project,requireCurrentScientificSurfaceV1 as scientific,
  compareCandidateScientificSurfacesV1 as compare} from '../candidateSemanticProjection.mjs';
import manifest from '../../docs/Candidate_Semantic_Surfaces_v1.json' with {type:'json'};

const scenarios=[['complete',{}],['partial',{weather:{wind_speed_10m:undefined}}],['weather rejected',{weatherFail:true}],
  ['marine rejected',{marineFail:true}],['fulfilled missing',{weather:{wind_speed_10m:undefined,wind_gusts_10m:undefined,wind_direction_10m:undefined}}],
  ['zero',{weather:{wind_speed_10m:0,wind_gusts_10m:0,wind_direction_10m:0}}],['directions',{marine:{wave_direction:270,wave_period:3}}]];
for(const [name,opts] of scenarios)test('parser/capture replay scientific projection: '+name,async t=>{
  const b=await sources(t,opts),a=composite(b.original,b.support),c=composite(b.replayed,b.support);
  assert.deepEqual(scientific(a),scientific(c));
  assert(project(a).complete);assert(project(c).complete);
});
test('history changes remain documentary through existing snapshot and signal assemblers',async t=>{
  const b=await sources(t),a=project(composite(b.original,b.support)),c=project(composite(b.original,b.support,{history:histories()}));
  assert(a.complete&&c.complete);assert.deepEqual(a.currentOceanScientificEvidence,c.currentOceanScientificEvidence);
  assert.notDeepEqual(a.documentaryHistoryContext,c.documentaryHistoryContext);
});
test('recording time changes metadata, not quality or environmental time',async t=>{
  const b=await sources(t),a=project(composite(b.original,b.support)),c=project(composite(b.original,b.support,{retrieval:'2035-01-01T00:00:00Z'}));
  assert.deepEqual(a.currentOceanScientificEvidence,c.currentOceanScientificEvidence);
  assert.notDeepEqual(a.retrievalSnapshotMetadata,c.retrievalSnapshotMetadata);
});
test('synthetic Auth/captain context is retained only outside scientific evidence',async t=>{
  const b=await sources(t),a=project(composite(b.original,b.support)),c=project(composite(b.original,b.support,{captain:{userId:'synthetic-user',origin:{latitude:22,longitude:-87},range:200,session:'synthetic-only'}}));
  assert.deepEqual(a.currentOceanScientificEvidence,c.currentOceanScientificEvidence);
  assert.notDeepEqual(a.operationalRequestContext,c.operationalRequestContext);
  assert(c.operationalRequestContext.some(x=>x.path==='/captainContext/userId'&&x.value==='synthetic-user'));
});
test('controlled species outputs do not become their own evidence; no evaluator invoked',async t=>{
  const b=await sources(t),a=project(composite(b.original,b.support,{species:{score:1,confidence:0.2,eligible:false}})),
    c=project(composite(b.original,b.support,{species:{score:99,confidence:1,eligible:true}}));
  assert.deepEqual(a.currentOceanScientificEvidence,c.currentOceanScientificEvidence);
  assert.notDeepEqual(a.speciesInterpretationOutput,c.speciesInterpretationOutput);
});
test('scientific value, source provenance, quality and quality time are not hidden',async t=>{
  const b=await sources(t),a=composite(b.original,b.support);
  for(const change of [x=>x.sst.temperatureFahrenheit=0,x=>x.sst.source.provider='different-product',
    x=>x.dataQuality.overall.classification='insufficient',x=>x.observedAt='2026-09-25T00:00:00Z']){
    const c=structuredClone(a);change(c);assert.notDeepEqual(scientific(a),scientific(c));
  }
});
test('documentary lineage warnings remain exact, ordered and outside science',async t=>{
  const b=await sources(t),a=composite(b.original,b.support),c=structuredClone(a);
  c.oceanEvidence.lineage.inheritedWarnings=['synthetic-warning-b','synthetic-warning-a'];
  assert.deepEqual(scientific(a),scientific(c));
  const doc=project(c).documentaryHistoryContext.filter(x=>x.path.startsWith('/oceanEvidence/lineage/inheritedWarnings/'));
  assert.deepEqual(doc.map(x=>x.value),['synthetic-warning-b','synthetic-warning-a']);
});
test('coverage is lossless including null, empty containers and all documentary subtrees',async t=>{
  const b=await sources(t),a=composite(b.original,b.support),p=project(a),rebuilt={};
  const entries=['currentOceanScientificEvidence','documentaryHistoryContext','retrievalSnapshotMetadata','operationalRequestContext','speciesInterpretationOutput','unresolved'].flatMap(k=>p[k]);
  const set=(path,value)=>{const parts=path.slice(1).split('/').map(x=>x.replaceAll('~1','/').replaceAll('~0','~'));let o=rebuilt;for(const k of parts.slice(0,-1))o=o[k];o[parts.at(-1)]=structuredClone(value);};
  for(const row of p.coverage)if(row.path!=='/'&&row.kind!=='value')set(row.path,row.kind==='array'?[]:{});
  for(const e of entries)set(e.path,e.value);
  assert.deepEqual(rebuilt,a);assert.equal(new Set(entries.map(x=>x.path)).size,entries.length);
});
test('unknown fields at root or within reviewed scientific objects are retained unresolved',async t=>{
  const b=await sources(t),a=composite(b.original,b.support);
  for(const change of [x=>x.newAuthority={value:1},x=>x.sst.newAuthority={value:1},x=>x.sst.source.newAuthority='private-unknown']){
    const c=structuredClone(a);change(c);const p=project(c);assert(!p.complete);assert(p.unresolved.length);
    assert.throws(()=>scientific(c),/SEMANTIC_AUTHORITY_UNRESOLVED/);
  }
});
for(const privateValue of ['captain_id:one','captainId.one','user-id-one','user_id_one','email:one','boat.one','origin.one','range.one',
  'Fishing_Log_one','catch.one','lure-one','bait_one','private_coordinates_one','session.one','token-one','mission_one',
  '11111111-1111-4111-8111-111111111111'])test('private scientific provenance rejected: '+privateValue,()=>{
  assert.throws(()=>project({sst:{source:{provider:privateValue}}}),/Private/);
});
test('private unknown fields cannot enter shared science and are not discarded',()=>{
  const p=project({sst:{captain_id:'synthetic'}});assert(!p.complete);assert.equal(p.currentOceanScientificEvidence.length,0);
  assert.deepEqual(p.unresolved,[{path:'/sst/captain_id',value:'synthetic'}]);
});
for(const attack of ['getter','setter','inherited','array prototype','toJSON','pollution'])test('own data only: '+attack,()=>{
  let invoked=false;let x={sst:{temperatureFahrenheit:0}};
  if(attack==='getter')Object.defineProperty(x.sst,'source',{enumerable:true,get(){invoked=true;return {};}});
  if(attack==='setter')Object.defineProperty(x.sst,'source',{enumerable:true,set(){invoked=true;}});
  if(attack==='inherited')Object.setPrototypeOf(x.sst,{temperatureFahrenheit:1});
  if(attack==='array prototype'){x.sst=[];Object.setPrototypeOf(x.sst,Object.create(Array.prototype));}
  if(attack==='toJSON')x.sst.toJSON=()=>{invoked=true;return {};};
  if(attack==='pollution')x=JSON.parse('{"sst":{"__proto__":{"temperatureFahrenheit":1}}}');
  assert.throws(()=>project(x));assert.equal(invoked,false);
});
test('detached deeply immutable; key order incidental; array order meaningful',async t=>{
  const b=await sources(t),a=composite(b.original,b.support),p=project(a),c=structuredClone(a);
  assert.deepEqual(project(Object.fromEntries(Object.entries(a).reverse())),p);
  c.oceanEvidence.confidence.limitations.reverse();assert.notDeepEqual(scientific(c),scientific(a));
  a.sst.temperatureFahrenheit=7;assert.notDeepEqual(project(a),p);
  function frozen(v){if(v&&typeof v==='object'){assert(Object.isFrozen(v));Object.values(v).forEach(frozen);}}frozen(p);
});
test('explicit auxiliary replay with network and implicit clock forbidden',async t=>{
  const b=await sources(t),a=composite(b.original,b.support,{history:histories()}),expected=project(a);
  t.mock.method(globalThis,'fetch',()=>{throw Error('network prohibited');});t.mock.method(Date,'now',()=>{throw Error('clock prohibited');});
  assert.deepEqual(project(composite(b.replayed,b.support,{history:histories()})),expected);
});
test('46 prior groups remain accounted with explicit cross-cutting authorities',()=>{
  const prior=JSON.parse(readFileSync(new URL('../../docs/Complete_Candidate_Evidence_Boundary_v1.json',import.meta.url),'utf8'));
  assert.deepEqual(manifest.groups.map(g=>g.field),[...prior.requestObjectGroups,...prior.spatialDerivationMap].map(g=>g.field));
  assert.equal(manifest.groups.length,46);for(const g of manifest.groups)if(g.primaryAuthority==='CROSS_CUTTING')assert(g.authorities.length>1);
});
test('lineage documentary governance and actual route boundaries remain explicit',()=>{
  const s=readFileSync(new URL('../server.js',import.meta.url),'utf8');
  for(const text of ['lineageMayChangeReasoning:','lineageMayChangeScores:','persistence-context-is-documentary-only',
    'const relationshipContext =','buildSnapshotMetadata({','marine.retrievedAt'])assert(s.includes(text));
});
test('existing spatial assembler corpus stays scientific; changed spatial values cannot disappear',async t=>{
  const b=await sources(t),ocean=await spatialCorpus(t),a=composite(b.original,b.support,{ocean}),p=project(a);
  assert(p.complete,JSON.stringify(p.unresolved.map(x=>x.path)));
  const c=structuredClone(a);c.sst.derived.spatialStructure.samples[0].temperatureFahrenheit+=2;
  assert.notDeepEqual(scientific(a),scientific(c));
  c.currents.derived.spatialAnalysis.spatialStructure.vectors[0].source.provider='another-source';
  assert.notDeepEqual(scientific(a),scientific(c));
  // Holding explicit spatial facts fixed is not a claim that captures reconstructed them.
  assert.deepEqual(scientific(a),scientific(composite(b.replayed,b.support,{ocean})));
});
test('static context and explicit assessment belong to science, not recording time',async t=>{
  const b=await sources(t),a=composite(b.original,b.support),c=structuredClone(a);
  c.assessment.assessmentAt='2026-09-25T01:00:00Z';assert.notDeepEqual(scientific(a),scientific(c));
  assert(project(a).currentOceanScientificEvidence.some(x=>x.path.startsWith('/candidateContext/bathymetry/')));
  assert(!JSON.stringify(a.candidateContext.bathymetry).includes('observedAt'));
});

const unpointer=p=>p.slice(1).split('/').map(x=>x.replaceAll('~1','/').replaceAll('~0','~'));
function assign(root,path,value,remove=false){const parts=Array.isArray(path)?path:unpointer(path);let at=root;
  for(const key of parts.slice(0,-1))at=at[key];if(remove)delete at[parts.at(-1)];else at[parts.at(-1)]=value;}
function nested(parts,value){return parts.reduceRight((v,k)=>k===0?[v]:{[k]:v},value);}

for(const path of [[],['sst'],['oceanOpportunity','persistenceContext'],['snapshotMetadata'],['snapshotMetadata','time'],
  ['oceanSnapshot','observation'],['oceanSnapshot','intelligence','oceanOpportunity'],['oceanOpportunity'],
  ['relationshipContext'],['sst','source'],['dataQuality'],['oceanEvidence','lineage'],
  ['oceanEvidence','lineage','upstream',0],['blueMarlinHabitat'],['captainContext'],['diagnostics']])
test('unknown descendant never inherits authority: '+path.join('/'),()=>{
  const x={sst:{temperatureFahrenheit:78.8},...nested(path,{unknownScientificEvidence:{sst:90}})};
  const p=project(x);assert(!p.complete);assert(p.unresolved.length);
  assert.throws(()=>compare(x,x),/SEMANTIC_AUTHORITY_UNRESOLVED/);
  assert(JSON.stringify(p.unresolved).includes('unknownScientificEvidence'));
});
for(const name of ['generatedAtScientific','assessmentGeneratedAt','currentScore','historicalSstCurrent',
  'captainRangeScientific','sourceHistory','qualityNarrative','rankEvidence'])
test('lookalike paths are unresolved everywhere: '+name,()=>{
  for(const base of ['sst','snapshotMetadata','diagnostics','blueMarlinHabitat']){
    const x={sst:{temperatureFahrenheit:78.8},[base]:{[name]:4}};
    assert(!project(x).complete);assert.throws(()=>compare(x,x),/SEMANTIC_AUTHORITY_UNRESOLVED/);
  }
});
for(const root of ['snapshotMetadata','diagnostics','captainContext','blueMarlinHabitat'])
test('non-scientific containers cannot bypass shape validation: '+root,()=>{
  const x={sst:{temperatureFahrenheit:78.8},[root]:17};assert(!project(x).complete);
  assert.throws(()=>scientific(x),/SEMANTIC_AUTHORITY_UNRESOLVED/);
});
test('primitive shape laundering cannot turn measurements into metadata or vice versa',()=>{
  for(const x of [{sst:{temperatureFahrenheit:{score:90}}},{sst:{temperatureFahrenheit:'species score 90'}},
    {snapshotMetadata:{time:{generatedAt:78.8}}},{assessment:{assessmentAt:99}}]){
    assert(!project(x).complete);assert.throws(()=>compare(x,x),/SEMANTIC_AUTHORITY_UNRESOLVED/);
  }
});
test('guard refuses empty scientific comparisons and mismatched missing/zero/null values',()=>{
  assert.throws(()=>compare({},{}),/SCIENTIFIC_SURFACE_EMPTY/);
  assert.throws(()=>compare({diagnostics:{synthetic:true}},{diagnostics:{synthetic:true}}),/SCIENTIFIC_SURFACE_EMPTY/);
  const a={sst:{temperatureFahrenheit:78.8},wind:{speedKnots:4}};
  for(const b of [{sst:{temperatureFahrenheit:0},wind:{speedKnots:4}},
    {sst:{temperatureFahrenheit:null},wind:{speedKnots:4}},{wind:{speedKnots:4}},
    {sst:{},wind:{speedKnots:4}}])assert.equal(compare(a,b).classification,'MISMATCH');
  assert.equal(compare(a,a).classification,'EXACT_MATCH');assert.equal(compare(a,a).completeCandidateReconstruction,false);
});
test('all reviewed registry paths and input nodes are accounted from actual corpus',async t=>{
  const observed=new Set();
  function paths(v,path=[]){observed.add('/'+path.join('/'));let count=1;
    if(v&&typeof v==='object')for(const[k,x]of Object.entries(v))count+=paths(x,[...path,Array.isArray(v)?'*':k]);
    return count;}
  for(const c of await semanticReviewCorpus(t)){
    const count=paths(c),p=project(c);assert(p.complete,JSON.stringify(p.unresolved.map(x=>x.path)));
    assert.equal(p.coverage.length,count);assert.equal(new Set(p.coverage.map(x=>x.path)).size,count);
  }
  assert.deepEqual([...observed].sort(),manifest.reviewedPaths.map(x=>x[0]).sort());
  assert.equal(manifest.groups.length,46);
  console.log(JSON.stringify({groupCoverage:46,reviewedPaths:observed.size,registryRows:manifest.reviewedPaths.length}));
});
test('scientific demotion, provenance, static and temporal attacks against controlled composite',async t=>{
  const b=await sources(t),ocean=await spatialCorpus(t),a=composite(b.original,b.support,{ocean});
  const p=project(a);assert(p.complete);
  const names=[['SST','/sst/temperatureFahrenheit'],['wind','/wind/gustKnots'],['waves','/waves/periodSeconds'],
    ['swell','/swell/directionDegrees'],['chlorophyll','/chlorophyll/concentrationMgM3'],['currents','/currents/speedKnots'],
    ['assessment','/assessment/assessmentAt'],['quality','/dataQuality/overall/classification'],
    ['source','/currents/source/provider'],['availability','/currents/source/availability'],
    ['spatial','/sst/derived/spatialStructure/samples/0/temperatureFahrenheit']];
  const staticField=p.currentOceanScientificEvidence.find(x=>x.path.startsWith('/candidateContext/bathymetry/')&&typeof x.value==='number');
  assert(staticField);names.push(['static',staticField.path]);
  for(const [name,path]of names)await t.test('demotion/missing/difference: '+name,()=>{
    const entry=p.currentOceanScientificEvidence.find(x=>x.path===path);assert(entry,path);
    const c=structuredClone(a);assign(c,path,null,true);
    // Moving a source value to an already known downstream scalar slot cannot erase its loss.
    c.blueMarlinHabitat=typeof entry.value==='number'?{score:entry.value}:{narrative:String(entry.value)};
    assert.equal(compare(a,c).classification,'MISMATCH');
    c.diagnostics.renamedEvidence=entry.value;assert.throws(()=>compare(a,c),/SEMANTIC_AUTHORITY_UNRESOLVED/);
    const d=structuredClone(a);assign(d,path,typeof entry.value==='number'?entry.value+1:'changed-source-fact');
    assert.equal(compare(a,d).classification,'MISMATCH');
  });
  for(const path of ['/sst/observedAt','/assessment/assessmentAt','/dataQuality/layers/wind/observedAt'])
    await t.test('scientific time visible: '+path,()=>{const c=structuredClone(a);assign(c,path,'2030-01-01T00:00:00Z');
      assert.equal(compare(a,c).classification,'MISMATCH');});
  for(const path of ['/observationSnapshot/generatedAt','/intelligenceSnapshot/generatedAt',
    '/snapshotMetadata/time/generatedAt','/oceanSnapshot/metadata/time/generatedAt',
    '/oceanSnapshot/observation/generatedAt','/oceanSnapshot/intelligence/generatedAt'])
    await t.test('six recording timestamps independent: '+path,()=>{const c=structuredClone(a);assign(c,path,'2030-01-01T00:00:00Z');
      assert.equal(compare(a,c).classification,'EXACT_MATCH');assert.notDeepEqual(project(c).retrievalSnapshotMetadata,p.retrievalSnapshotMetadata);});
  for(const key of ['publicationTime','acquisitionTime','executionTime','historicalSnapshots','priorOpportunity','oceanEvolution'])
    await t.test('unreviewed auxiliary authority fails closed: '+key,()=>{
      const c=structuredClone(a);c.oceanEvidence[key]='2030-01-01T00:00:00Z';assert.throws(()=>compare(a,c),/SEMANTIC_AUTHORITY_UNRESOLVED/);});
  const cache=p.coverage.find(x=>x.path.includes('/cache')&&x.authority==='operationalRequestContext'&&x.kind==='value');
  assert(cache);const c=structuredClone(a);const parts=unpointer(cache.path);let v=c;for(const k of parts)v=v[k];
  assign(c,cache.path,typeof v==='number'?v+1:typeof v==='boolean'?!v:'synthetic-cache-change');
  assert.equal(compare(a,c).classification,'EXACT_MATCH');
});
test('cross-cutting snapshots and relationships retain each independent authority',async t=>{
  const b=await sources(t),a=composite(b.original,b.support,{history:histories()});
  const p=project(a);assert(p.complete);
  const paths=[['/observationSnapshot/observations/sst/temperatureFahrenheit','currentOceanScientificEvidence',88],
    ['/intelligenceSnapshot/oceanOpportunity/persistenceContext/sampleCount','documentaryHistoryContext',77],
    ['/oceanSnapshot/intelligence/generatedAt','retrievalSnapshotMetadata','2030-01-01T00:00:00Z']];
  for(const[path,surface,value]of paths){const c=structuredClone(a);assign(c,path,value);const q=project(c);assert(q.complete);
    for(const bucket of ['currentOceanScientificEvidence','documentaryHistoryContext','retrievalSnapshotMetadata','operationalRequestContext','speciesInterpretationOutput'])
      if(bucket===surface)assert.notDeepEqual(p[bucket],q[bucket]);else assert.deepEqual(p[bucket],q[bucket]);}
  const relation=p.currentOceanScientificEvidence.find(x=>x.path.startsWith('/relationshipContext/relationshipSupport/')&&typeof x.value==='boolean');
  assert(relation);const c=structuredClone(a);assign(c,relation.path,!relation.value);assert.equal(compare(a,c).classification,'MISMATCH');
  const d=structuredClone(a);d.oceanOpportunity.score={species:'synthetic',value:99};assert.throws(()=>compare(a,d),/SEMANTIC_AUTHORITY_UNRESOLVED/);
});
test('scientific and documentary ordering, duplicates and unknown elements remain distinct',async t=>{
  const b=await sources(t),ocean=await spatialCorpus(t),a=composite(b.original,b.support,{ocean,history:histories()});
  const c=structuredClone(a);c.sst.derived.spatialStructure.samples.reverse();assert.equal(compare(a,c).classification,'MISMATCH');
  const d=structuredClone(a);d.sst.derived.spatialStructure.samples.push(structuredClone(d.sst.derived.spatialStructure.samples[0]));
  assert.equal(compare(a,d).classification,'MISMATCH');
  const e=structuredClone(a);e.sst.derived.spatialStructure.samples.push({unreviewed:1});assert.throws(()=>compare(a,e),/SEMANTIC_AUTHORITY_UNRESOLVED/);
  const f=structuredClone(a);delete f.sst.derived.spatialStructure.samples[0];assert.throws(()=>project(f));
  const g=structuredClone(a);g.oceanOpportunity.persistenceContext.limitations.reverse();assert.equal(compare(a,g).classification,'EXACT_MATCH');
  assert.notDeepEqual(project(a).documentaryHistoryContext,project(g).documentaryHistoryContext);
  for(const v of [undefined,null,[],{}]){const x=structuredClone(a);if(v===undefined)delete x.sst.derived.spatialStructure.samples;else x.sst.derived.spatialStructure.samples=v;
    const projected=project(x);if(projected.complete)assert.equal(compare(a,x).classification,'MISMATCH');else assert.throws(()=>compare(a,x),/SEMANTIC_AUTHORITY_UNRESOLVED/);}
});
test('private captain/Auth fields retained operationally; species outputs remain downstream',async t=>{
  const b=await sources(t),a=composite(b.original,b.support,{captain:captainReviewFixture(),species:speciesReviewFixture()}),p=project(a);
  assert(p.complete);const c=structuredClone(a);
  for(const key of ['boat','mission','session','email','user_id','captainId'])c.captainContext[key]='changed-private-'+key;
  c.captainContext.origin.latitude=21;c.captainContext.range=900;c.captainContext.auth.token='changed-private-token';
  c.blueMarlinHabitat={...speciesReviewFixture(),score:99,confidence:1,rank:1,rankingPermission:true,eligible:true};
  assert.equal(compare(a,c).classification,'EXACT_MATCH');
  assert.notDeepEqual(project(c).operationalRequestContext,p.operationalRequestContext);
  assert.notDeepEqual(project(c).speciesInterpretationOutput,p.speciesInterpretationOutput);
  assert(!JSON.stringify(p.currentOceanScientificEvidence).includes('synthetic@example.invalid'));
  for(const surface of ['oceanEvidence','oceanOpportunity','relationshipAssessment']){
    const x=structuredClone(a);x[surface].captainRangeScientific=900;assert.throws(()=>compare(a,x),/SEMANTIC_AUTHORITY_UNRESOLVED/);}
});
test('private labels and metadata attacks cannot enter science through arrays or references',()=>{
  for(const value of ['captain_id','captainId','user_id','userId','Auth UUID','boat','origin','range','Fishing Log','catch','lure','bait','private coordinates','session','token','mission']){
    const x={sst:{source:{provider:'source.'+value.replaceAll(' ','.')+'.secret'}}};assert.throws(()=>scientific(x));
  }
  assert.throws(()=>project({sst:{source:{provider:'does-not-confirm-bait.captain_id.secret'}}}),/Private/);
  const x={oceanEvidence:{lineage:{inheritedWarnings:['captain_id.secret']}},sst:{temperatureFahrenheit:78.8}};
  const p=project(x);assert(p.complete);assert(!JSON.stringify(p.currentOceanScientificEvidence).includes('captain_id'));
  assert(JSON.stringify(p.documentaryHistoryContext).includes('captain_id'));
});
test('hostile descriptors fail across all semantic surfaces without invocation',()=>{
  for(const root of ['sst','oceanOpportunity','snapshotMetadata','captainContext','blueMarlinHabitat','diagnostics'])
    for(const attack of ['get','set','inherited','toJSON','valueOf','constructor','prototype','hidden','symbol']){
      let called=false;const child={},x={[root]:child};
      if(attack==='get'||attack==='set')Object.defineProperty(child,'test',{enumerable:true,[attack](){called=true;}});
      else if(attack==='inherited')Object.setPrototypeOf(child,{test:1});
      else if(attack==='hidden')Object.defineProperty(child,'test',{value:1});
      else if(attack==='symbol')child[Symbol('test')]=1;
      else child[attack]=()=>{called=true;return 1;};
      assert.throws(()=>project(x));assert(!called);
    }
});
test('mutation of every surface and nested key order cannot alter accepted projection',async t=>{
  const b=await sources(t),a=structuredClone(composite(b.original,b.support,{history:histories(),captain:captainReviewFixture(),species:speciesReviewFixture()}));
  const p=project(a),serialized=JSON.stringify(p);
  a.sst.source.provider='changed';a.oceanOpportunity.persistenceContext.sampleCount=77;a.snapshotMetadata.time.generatedAt='changed';
  a.blueMarlinHabitat.score=77;a.wind.gustKnots=77;a.captainContext.range=77;
  assert.equal(JSON.stringify(p),serialized);
  function frozen(v){if(v&&typeof v==='object'){assert(Object.isFrozen(v));Object.values(v).forEach(frozen);}}frozen(p);
  const original=composite(b.original,b.support);
  function reorder(v){return Array.isArray(v)?v.map(reorder):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).reverse().map(([k,x])=>[k,reorder(x)])):v;}
  assert.deepEqual(project(original),project(reorder(original)));
  const comparison=compare(original,reorder(original));frozen(comparison);assert.equal(comparison.classification,'EXACT_MATCH');
  assert(!Object.keys(project(original)).some(k=>/id$|digest|hash/i.test(k)));
});
test('comparison preserves signed numeric zero rather than JSON-collapsing source components',()=>{
  const a={currents:{northwardMetersPerSecond:-0}},b={currents:{northwardMetersPerSecond:0}};
  assert(Object.is(scientific(a)[0].value,-0));assert.equal(compare(a,b).classification,'MISMATCH');
  assert.equal(compare(a,a).classification,'EXACT_MATCH');
});
test('non-scientific names cannot acquire science by nesting under an Ocean container',()=>{
  for(const name of ['persistenceContext','historicalSnapshots','generatedAt','retrievedAt','requestId','origin','range',
    'session','score','confidence','rank','opportunity']){
    const x={sst:{temperatureFahrenheit:78.8,[name]:17}};assert(!project(x).complete);
    assert.throws(()=>compare(x,x),/SEMANTIC_AUTHORITY_UNRESOLVED/);
  }
  for(const key of ['sst/source','sst~1source','*','oceanEvidence.lineage']){
    const x={sst:{temperatureFahrenheit:78.8},[key]:{provider:'lookalike'}};assert(!project(x).complete);
    assert.throws(()=>compare(x,x),/SEMANTIC_AUTHORITY_UNRESOLVED/);
  }
});
test('sparse documentary arrays fail; ordering/duplicates are preserved outside science',()=>{
  const a={sst:{temperatureFahrenheit:78.8},oceanEvidence:{lineage:{inheritedWarnings:['one','two']}}};
  const b=structuredClone(a);b.oceanEvidence.lineage.inheritedWarnings.reverse();
  assert.equal(compare(a,b).classification,'EXACT_MATCH');assert.notDeepEqual(project(a).documentaryHistoryContext,project(b).documentaryHistoryContext);
  b.oceanEvidence.lineage.inheritedWarnings.push('one');assert.notDeepEqual(project(a).documentaryHistoryContext,project(b).documentaryHistoryContext);
  delete b.oceanEvidence.lineage.inheritedWarnings[0];assert.throws(()=>project(b));
});
