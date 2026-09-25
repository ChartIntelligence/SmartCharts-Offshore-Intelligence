import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {environmentalObservationV1, validateEnvironmentalObservationV1, scientificAssessmentRecordV1, validateScientificAssessmentRecordV1} from '../temporalEvidencePrimitives.mjs';
import {frame, observation, at, context, publication, sstQualificationView, ref} from './fixtures/temporalEvidenceFixture.mjs';
import {fixture} from './fixtures/scientificAssessmentFixture.js';
import {buildSeaSurfaceTemperaturePersistence as persistence, assessOceanOpportunity, assessBlueMarlinHabitat, resolveOceanSignals, buildUnifiedSpeciesOpportunityInterpretationV1, resolveUnifiedOpportunityRankingInputV1} from '../server.js';
import {freezeScientificHistoryV1, hash, cycleV1, cycleV2, freezeEvidenceV1, publicationV1, publicationV2, publicationV3} from '../../shared/oceanPublication.mjs';
const pair=f=>({frame:f,observation:observation(f)});

test('observation validates exact frame sample; malformed sample fails',()=>{
  const f=frame(),o=observation(f);assert.deepEqual(validateEnvironmentalObservationV1(o,f),o);
  for(const sampleIndex of [-1,1,0.1,null])assert.throws(()=>environmentalObservationV1({frame:f,componentIndex:0,sampleIndex}));
  const bad=structuredClone(o);bad.component.value=999;assert.throws(()=>validateEnvironmentalObservationV1(bad,f));
});
test('deterministic identity ignores object key ordering',()=>{
  const reverse=v=>Array.isArray(v)?v.map(reverse):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).reverse().map(([k,x])=>[k,reverse(x)])):v;
  assert.deepEqual(observation(frame()),observation(reverse(frame())));
});
test('grid sampling is not silently inferred by the point primitive',()=>{
  const f=frame();f.payload.layout='rectilinear-grid';f.payload.axes={x:[-90],y:[25]};f.payload.coordinates=null;
  assert.throws(()=>observation(f));
});
test('observation detached and deeply immutable',()=>{
  const f=frame(),o=observation(f);f.payload.components[0].values[0]=90;
  assert.equal(o.component.value,84);assert.throws(()=>{o.component.value=90;});assert(Object.isFrozen(o.provenance.sources[0]));
});
for(const field of ['captainId','user_id','email','boat','origin','range','FishingLog','catch','lure','bait','privateCoordinates','token','session'])test('private field rejected: '+field,()=>{
  const f=frame();f.quality[field]='synthetic-private';assert.throws(()=>observation(f));
  const p=structuredClone(publication());p.evaluation[field]='synthetic-private';assert.throws(()=>scientificAssessmentRecordV1({publication:p,candidateId:'synthetic-candidate'}));
});
test('accessors and inherited input rejected without invoking getters',()=>{
  let reads=0;const f=frame();Object.defineProperty(f,'boat',{enumerable:true,get(){reads++;return 'x';}});assert.throws(()=>observation(f));assert.equal(reads,0);
  assert.throws(()=>observation(Object.assign(Object.create({boat:'x'}),frame())));
});
test('one observation reused in three publications remains one evidence identity and three assessments',()=>{
  const ps=[0,4,8].map(h=>publication(h));const records=ps.map(p=>scientificAssessmentRecordV1({publication:p,candidateId:'synthetic-candidate'}));
  assert.equal(new Set(ps.map(p=>p.evidence.entries[0].reference.sha256)).size,1);
  assert.equal(new Set(records.map(r=>r.assessmentId)).size,3);
  assert(records.every(r=>r.assessmentId!==observation(frame()).observationId));
  const o=pair(frame());assert.equal(sstQualificationView([o,o,o],context(8)).length,1);
});
test('equal-valued distinct observations preserve three samples and persistence equivalence',()=>{
  const pairs=[0,4,8].map(h=>pair(frame(h)));
  const direct=pairs.map(({observation:o})=>({snapshot:{available:true,identity:{snapshotId:o.observationId},metadata:{time:{observedAt:o.temporal.observationTime}},observation:{observations:{sst:{temperatureFahrenheit:84}}}}}));
  const a=persistence({historicalSnapshots:direct}),b=persistence({historicalSnapshots:sstQualificationView(pairs,context(8))});
  assert.deepEqual(a,b);assert.equal(b.confidence.score,70);assert.equal(b.values.sampleCount,3);
});
test('represented-time ordering and exact duplicates are deterministic',()=>{
  const pairs=[0,4,8].map(h=>pair(frame(h)));assert.deepEqual(sstQualificationView([...pairs].reverse(),context(8)),sstQualificationView([...pairs,pairs[1]],context(8)));
});
test('different explicitly supplied history retains existing feature-confidence difference',()=>{
  const evaluate=hours=>persistence({historicalSnapshots:sstQualificationView(hours.map(h=>pair(frame(h))),context(8))});
  assert.equal(evaluate([0,8]).confidence.score,60);
  assert.equal(evaluate([0,4,8]).confidence.score,70);
  // Feature confidence only; this is not final Blue Marlin score or confidence.
});
test('same support revision preserves exact as-used evidence but requires explicit choice',()=>{
  const a=pair(frame(0)),b=pair(frame(0,'corrected',85));assert.notEqual(a.observation.observationId,b.observation.observationId);
  assert.equal(a.observation.temporal.observationTime,b.observation.temporal.observationTime);
  assert.throws(()=>sstQualificationView([a,b],context(8)));
  assert.equal(sstQualificationView([a],context(8))[0].snapshot.observation.observations.sst.temperatureFahrenheit,84);
});
test('missing SST remains missing, not zero',()=>{
  const p=pair(frame(4,'original',null));assert.equal(p.observation.component.value,null);
  const r=persistence({historicalSnapshots:sstQualificationView([pair(frame()),p,pair(frame(8))],context(8))});assert.equal(r.values.sampleCount,2);
});
for(const support of [{kind:'static'},{kind:'interval',start:at(0),end:at(4)},{kind:'composite-window',start:at(0),end:at(4)}])test('support preserved without flattening: '+support.kind,()=>{
  const f=frame();f.temporal.support=support;f.temporal.observationTime=null;
  const p=pair(f);assert.deepEqual(p.observation.temporal.support,support);assert.throws(()=>sstQualificationView([p],context(8)));
});
test('future observation and assessment-time substitution rejected',()=>{
  assert.throws(()=>sstQualificationView([pair(frame(8))],context(4)));
  const p=pair(frame());p.observation=structuredClone(p.observation);p.observation.temporal.observationTime=at(4);
  assert.throws(()=>sstQualificationView([p],context(8)));
});
test('assessment validates original V3 authority, candidate and mutation isolation',()=>{
  const p=structuredClone(publication()),r=scientificAssessmentRecordV1({publication:p,candidateId:'synthetic-candidate'});
  assert.deepEqual(validateScientificAssessmentRecordV1(r,p),r);assert.throws(()=>scientificAssessmentRecordV1({publication:p,candidateId:'unknown'}));
  p.evaluation.assessmentAt=at(4);assert.equal(r.assessment.assessmentAt,at(0));assert.throws(()=>validateScientificAssessmentRecordV1(r,p));
  assert.throws(()=>{r.result.gate.reasons.push('changed');});
});
test('V3 binds exact assessment reference without a new publication schema',()=>{
  const p=publication(),r=scientificAssessmentRecordV1({publication:p,candidateId:'synthetic-candidate'});
  const c=publication(8).cycle;
  const h=freezeScientificHistoryV1(c,{contractVersion:'pelora-shared-scientific-history-v1',state:'AVAILABLE',asOf:at(8),reason:'synthetic-qualified',sourceReference:ref('synthetic-resolver'),entries:[{candidateId:r.result.candidateId,species:'blue-marlin',representedAt:at(0),evaluatedAt:r.assessment.assessmentAt,evaluationReference:{kind:'captured',referenceId:'synthetic-assessment',contractVersion:r.contractVersion,sha256:hash(r)},opportunityId:null,continuityReference:null}]});
  assert.equal(h.entries[0].evaluationReference.sha256,hash(r));
});

function candidateScience(persistenceContext) {
  const f=fixture(),o=structuredClone(f.ocean);
  o.oceanOpportunity=assessOceanOpportunity({oceanEvidence:o.oceanEvidence,oceanPersistence:persistenceContext});
  o.blueMarlinHabitat=assessBlueMarlinHabitat(o);
  o.oceanSignals=resolveOceanSignals({oceanOpportunity:o.oceanOpportunity});
  const interpretation=buildUnifiedSpeciesOpportunityInterpretationV1({candidate:f.candidate,oceanConditions:o,species:'blue-marlin',assessment:context(1)});
  return {habitat:o.blueMarlinHabitat,interpretation,gate:resolveUnifiedOpportunityRankingInputV1({speciesInterpretation:interpretation}),documentary:o.oceanOpportunity.persistenceContext};
}
test('Blue Marlin history context changes documentary output, not habitat/science/gate',()=>{
  const a=candidateScience(null),b=candidateScience({available:true,classification:'persistent',confidence:{score:99,level:'High'},values:{sampleCount:100,observationWindowHours:1000},limitations:[]});
  assert.notDeepEqual(a.documentary,b.documentary);
  for(const k of ['habitat','interpretation','gate'])assert.deepEqual(a[k],b[k]);
  assert.equal(a.habitat.relationshipGroups.persistence.score,0);
  assert.equal(a.habitat.summary.suitabilityScore,24);
  assert.equal(a.habitat.summary.confidenceScore,35);
});
test('pure construction/replay has no Auth or wall-clock dependency',t=>{
  const p=publication(),f=frame(),o=observation(f),r=scientificAssessmentRecordV1({publication:p,candidateId:'synthetic-candidate'});
  t.mock.method(Date,'now',()=>{throw Error('clock forbidden');});
  assert.deepEqual(observation(f),o);assert.deepEqual(scientificAssessmentRecordV1({publication:p,candidateId:'synthetic-candidate'}),r);
});
test('source guards preserve current documentary and zero-score boundary',()=>{
  const s=readFileSync(new URL('../server.js',import.meta.url),'utf8');
  assert(s.includes('persistence-context-is-documentary-only'));assert(s.includes('const persistenceScore = 0;'));
});
test('Blue Marlin qualification matrix preserves unresolved policies and zero unexplained mismatches',()=>{
  const matrix=JSON.parse(readFileSync(new URL('../../docs/Blue_Marlin_Temporal_Primitives_v1.json',import.meta.url),'utf8'));
  assert.equal(matrix.universalSelectorQualified,false);assert.equal(matrix.unexplainedMismatches,0);
  assert(matrix.dependencies.some(r=>r.classification==='SCIENTIFIC_BLOCKING'));
  assert(matrix.dependencies.filter(r=>r.input.startsWith('Historical')).every(r=>r.historySelectionRequiredForBlockingOutputs===false));
  const allowed=['EXACT_MATCH','EXPECTED_HISTORY_DIFFERENCE','NOT_CURRENTLY_BLOCKING','UNRESOLVED','MISMATCH'];
  assert(matrix.equivalence.every(r=>allowed.includes(r.classification)));
});

// Task 12B.5 final adversarial review: authority is exact validated content,
// not a signature proving source acquisition or provider qualification.
for (const [name, mutate] of [
  ['frameId', o=>{o.source.frameId='fabricated';}],
  ['contentDigest', o=>{o.source.contentDigest='0'.repeat(64);}],
  ['frameDigest', o=>{o.source.frameDigest='0'.repeat(64);}],
  ['product', o=>{o.product.productId='other';}],
  ['component', o=>{o.component.variableId='other';}],
  ['unit', o=>{o.component.unit='K';}],
  ['support', o=>{o.temporal.support.at=at(4);}],
  ['revision', o=>{o.product.productVersion='corrected';}],
  ['provenance', o=>{o.provenance.sources[0].recordId='other';}],
  ['lineage', o=>{o.lineage.sourceRecordIds=['other'];}],
  ['address', o=>{o.sampleIndex=1;}]
]) test('source-backed sample tampering rejected: '+name,()=>{
  const f=frame(),o=structuredClone(observation(f));mutate(o);
  assert.throws(()=>validateEnvironmentalObservationV1(o,f));
});

test('a structurally valid changed frame is new unqualified evidence, never the original as-used sample',()=>{
  const f=frame(),o=observation(f),changed=structuredClone(f);
  changed.frameId='synthetic-fabricated-alias';
  assert.throws(()=>validateEnvironmentalObservationV1(o,changed));
  assert.notEqual(observation(changed).observationId,o.observationId);
  // Structural validation cannot authenticate a provider; no such claim is made.
  assert.throws(()=>environmentalObservationV1({frame:{value:84},componentIndex:0,sampleIndex:0}));
});

test('asymmetric point addresses retain exact x/y, component and value',()=>{
  const f=frame();f.payload.kind='multivariable';
  f.payload.coordinates=[[-91,24],[-88,27],[-85,23]];
  f.payload.components[0].values=[11,22,33];f.payload.components[0].missing=[null,null,null];
  f.payload.components.push({...structuredClone(f.payload.components[0]),variableId:'other',values:[101,202,303]});
  for(let c=0;c<2;c++)for(let i=0;i<3;i++){
    const o=environmentalObservationV1({frame:f,componentIndex:c,sampleIndex:i});
    assert.deepEqual(o.spatial.coordinates,f.payload.coordinates[i]);
    assert.equal(o.component.value,f.payload.components[c].values[i]);
    assert.equal(o.componentIndex,c);assert.equal(o.sampleIndex,i);
  }
  for(const c of [-1,2,0.5,null])assert.throws(()=>environmentalObservationV1({frame:f,componentIndex:c,sampleIndex:0}));
});

test('asymmetric 2-by-3 grid is rejected, never transposed or interpolated',()=>{
  const f=frame();f.payload.layout='rectilinear-grid';f.payload.coordinates=null;
  f.payload.axes={x:[-91,-87],y:[23,26,29]};f.payload.components[0].values=[11,12,21,22,31,32];f.payload.components[0].missing=Array(6).fill(null);
  for(let i=0;i<6;i++)assert.throws(()=>environmentalObservationV1({frame:f,componentIndex:0,sampleIndex:i}));
});

for(const value of [NaN,Infinity,-Infinity])test('nonfinite source value rejected: '+value,()=>assert.throws(()=>observation(frame(0,'original',value))));
for(const reason of ['provider-no-data','land','cloud-obscuration'])test('missing reason preserved and never converted to zero: '+reason,()=>{
  const f=frame(4,'original',null);f.payload.components[0].missing[0]=reason;
  const p=pair(f);assert.equal(p.observation.component.missing,reason);assert.equal(p.observation.component.value,null);
  const r=persistence({historicalSnapshots:sstQualificationView([pair(frame()),p,pair(frame(8))],context(8))});
  assert.equal(r.values.sampleCount,2);assert.equal(r.values.temperatureChangeFahrenheit,0);
});
test('malformed missingness/mask cannot fabricate numeric evidence',()=>{
  for(const [value,reason] of [[0,'land'],[null,null],[null,'masked']]){
    const f=frame();f.payload.components[0].values[0]=value;f.payload.components[0].missing[0]=reason;
    assert.throws(()=>observation(f));
  }
});
test('numeric zero is retained where supplied as valid evidence',()=>{
  const p=pair(frame(0,'original',0));assert.equal(p.observation.component.value,0);assert.equal(p.observation.component.missing,null);
  const rows=sstQualificationView([p,pair(frame(4,'original',0))],context(4));
  const r=persistence({historicalSnapshots:rows});assert.equal(r.values.sampleCount,2);assert.equal(r.values.temperatureChangeFahrenheit,0);
});

for(const [name,mutate] of [
  ['family',f=>{f.product.family='chlorophyll';}],
  ['component',f=>{f.payload.components[0].variableId='other';}],
  ['unit',f=>{f.payload.components[0].unit='K';}],
  ['reconstructed',f=>{f.product.evidenceClass='RECONSTRUCTED';}]
])test('generic frame representation does not grant SST-view authority: '+name,()=>{
  const f=frame();mutate(f);assert.throws(()=>sstQualificationView([pair(f)],context(8)));
});

for(const hours of [[0,8],[0,4,8],[0,1,13],[0,240]])test('direct versus view SST equivalence including supplied gaps: '+hours,()=>{
  const ps=hours.map(h=>pair(frame(h))),cutoff=context(hours.at(-1));
  const direct=ps.map(p=>({snapshot:{available:true,identity:{snapshotId:p.observation.observationId},metadata:{time:{observedAt:p.frame.temporal.observationTime}},observation:{observations:{sst:{temperatureFahrenheit:p.frame.payload.components[0].values[0]}}}}}));
  assert.deepEqual(persistence({historicalSnapshots:direct}),persistence({historicalSnapshots:sstQualificationView(ps,cutoff)}));
});
test('one repeated represented instant remains insufficient after exact deduplication',()=>{
  const p=pair(frame()),rows=sstQualificationView([p,p,p],context(8));
  const r=persistence({historicalSnapshots:rows});assert.equal(rows.length,1);assert.equal(r.available,false);
});

function historicalPublication(version){
  const p=publication();const configuration={...p.cycle.configuration,evaluatorVersion:version===1?'synthetic-legacy':'synthetic-explicit-assessment-v1'};
  const cycle=(version===1?cycleV1:cycleV2)({scheduledAt:p.cycle.scheduledAt,region:p.cycle.region,configuration});
  const evidence=freezeEvidenceV1(cycle,p.evidence.entries);
  const {historyId,historyState,assessmentAt,...evaluation}=p.evaluation;
  return (version===1?publicationV1:publicationV2)({cycle,evidence,attempt:p.attempt,evaluation:{...evaluation,evaluatorVersion:configuration.evaluatorVersion,evidenceSetId:evidence.evidenceSetId,...(version===2?{assessmentAt}:{})}});
}
for(const version of [1,2])test('valid earlier publication rejected: V'+version,()=>assert.throws(()=>scientificAssessmentRecordV1({publication:historicalPublication(version),candidateId:'synthetic-candidate'})));
for(const [name,mutate] of [
  ['contentDigest',p=>{p.contentDigest='0'.repeat(64);}],
  ['integrityDigest',p=>{p.integrityDigest='0'.repeat(64);}],
  ['incomplete',p=>{p.evaluation.candidateResults=[];}],
  ['species',p=>{p.evaluation.candidateResults[0].species='wahoo';}],
  ['undeclared candidate',p=>{p.evaluation.candidateResults[0].candidateId='other';}],
  ['gate',p=>{p.evaluation.candidateResults[0].gate.eligibleForRanking=true;}],
  ['admitted substitution',p=>{p.evaluation.candidateResults[0].opportunityId='fake';}],
  ['score',p=>{p.evaluation.candidateResults[0].score=99;}],
  ['confidence',p=>{p.evaluation.candidateResults[0].confidence=99;}],
  ['assessmentAt',p=>{p.evaluation.assessmentAt=at(4);}],
  ['history',p=>{p.evaluation.historyId='fake';}],
  ['evidence',p=>{p.evaluation.evidenceSetId='fake';}]
])test('publication authority tampering rejected: '+name,()=>{
  const p=structuredClone(publication());mutate(p);assert.throws(()=>scientificAssessmentRecordV1({publication:p,candidateId:'synthetic-candidate'}));
});
test('caller cannot add assessment overrides; altered primitive rejected against source',()=>{
  const p=publication(),input={publication:p,candidateId:'synthetic-candidate'};
  for(const field of ['score','confidence','assessmentAt','historyId'])assert.throws(()=>scientificAssessmentRecordV1({...input,[field]:'fake'}));
  const r=structuredClone(scientificAssessmentRecordV1(input));r.result.gate.eligibleForRanking=true;
  assert.throws(()=>validateScientificAssessmentRecordV1(r,p));
});
test('valid governed decision changes affect assessment identity; execution metadata does not',()=>{
  const p=publication(),input={cycle:p.cycle,evidence:p.evidence,history:p.history,attempt:structuredClone(p.attempt),evaluation:structuredClone(p.evaluation)};
  input.attempt.startedAt=at(1);input.attempt.endedAt=at(2);
  const retry=publicationV3(input);const make=p=>scientificAssessmentRecordV1({publication:p,candidateId:'synthetic-candidate'});
  assert.deepEqual(make(retry),make(p));
  input.evaluation.candidateResults[0].gate.reasons=['different-governed-reason'];
  const revised=publicationV3(input);assert.notEqual(make(revised).assessmentId,make(p).assessmentId);
});

for(const field of ['userId','captain_id','Auth UUID','boat_name','captain origin','captain range','Fishing Log','private trip coordinates','mission context'])test('additional nested privacy rejection: '+field,()=>{
  const f=frame();f.provenance.sources[0][field]='synthetic-private';assert.throws(()=>observation(f));
  const p=structuredClone(publication());p.history[field]='synthetic-private';assert.throws(()=>scientificAssessmentRecordV1({publication:p,candidateId:'synthetic-candidate'}));
});
for(const field of ['captain_id','auth_uuid','token','session','boat','private_coordinates','mission_context'])test('dedicated private name/value metadata rejected: '+field,()=>{
  const f=frame();f.provenance.steps=[{operationId:'synthetic',version:'1',parameters:[{name:field,value:'synthetic-private'}]}];assert.throws(()=>observation(f));
  const q=frame();q.quality.flags=[{flagId:field,value:'synthetic-private'}];assert.throws(()=>observation(q));
});
test('assessment getters/inherited fields rejected without invocation',()=>{
  let reads=0;const p=structuredClone(publication());Object.defineProperty(p.evaluation,'historyId',{enumerable:true,get(){reads++;throw Error('must not run');}});
  assert.throws(()=>scientificAssessmentRecordV1({publication:p,candidateId:'synthetic-candidate'}));assert.equal(reads,0);
  assert.throws(()=>scientificAssessmentRecordV1(Object.assign(Object.create({session:'private'}),{publication:publication(),candidateId:'synthetic-candidate'})));
});
test('nested provenance/lineage/support and assessment result detach and freeze',()=>{
  const f=frame(),o=observation(f),p=structuredClone(publication()),r=scientificAssessmentRecordV1({publication:p,candidateId:'synthetic-candidate'});
  f.provenance.sources[0].recordId='changed';f.lineage.sourceRecordIds.push('changed');f.temporal.support.at=at(4);
  p.history.historyId='changed';p.evaluation.candidateResults[0].gate.reasons.push('changed');
  assert.deepEqual(o,observation(frame()));assert.deepEqual(r,scientificAssessmentRecordV1({publication:publication(),candidateId:'synthetic-candidate'}));
  for(const change of [()=>{o.temporal.support.at=at(4);},()=>{o.lineage.sourceRecordIds.push('changed');},()=>{o.sampleIndex=2;},()=>{r.historyId='changed';}])assert.throws(change);
});
test('assessment object key ordering deterministic; source array order meaningful',()=>{
  const reverse=v=>Array.isArray(v)?v.map(reverse):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).reverse().map(([k,x])=>[k,reverse(x)])):v;
  const make=p=>scientificAssessmentRecordV1({publication:p,candidateId:'synthetic-candidate'});
  assert.deepEqual(make(publication()),make(reverse(publication())));
  const f=frame();f.payload.coordinates=[[-90,25],[-89,26]];f.payload.components[0].values=[84,85];f.payload.components[0].missing=[null,null];
  const a=observation(f);f.payload.coordinates.reverse();f.payload.components[0].values.reverse();
  const b=observation(f);assert.notEqual(a.observationId,b.observationId);assert.notEqual(a.component.value,b.component.value);
});
