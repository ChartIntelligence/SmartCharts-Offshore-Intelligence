import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {copy, freeze, cycleV2} from '../../shared/oceanPublication.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
import {contextKey, versionId, byteHash, CONTEXT, RANKED_PUBLICATION} from '../durableObserve/publicationEnvelope.mjs';
import {createOfflinePublicationReadProjection, SYNTHETIC_PUBLICATION_SCOPE} from '../durableObserve/captainPublicationReadProjection.mjs';

// Passive synthetic port doubles ONLY: no producer execution, provider science or
// strict CP-08 completed-envelope validation is represented by these projections.
const ref = {kind:'captured',referenceId:'controlled-source',contractVersion:'controlled-source-v1',sha256:'a'.repeat(64)};
const context = {contractVersion:CONTEXT,species:'blue-marlin',region:{id:'controlled-region',version:'v1'},
  spatialClass:'REGIONAL_SELECTED_COHORT',spatialReference:ref,missionReference:null};
const slot = '2026-10-13T12:00:00.000Z';
const older = '2026-10-13T08:00:00.000Z';
function cycle(scheduledAt) { return cycleV2({scheduledAt,region:context.region,configuration:{id:'controlled',version:'v1',
  governanceReference:'controlled-governance',evaluatorVersion:'controlled-explicit-assessment-v1',candidateUniverseVersion:'v1',
  species:['blue-marlin'],families:['CURRENTS'],candidateUniverse:{reference:ref,candidateIds:['controlled-candidate']}}}); }
function source({science='available',lifecycle='completed',revision=1,action='ORIGINAL',scheduledAt=slot,controlled=false}={}) {
  const body = {contractVersion:RANKED_PUBLICATION,context,contextKey:contextKey(context),cycle:cycle(scheduledAt),assessmentCutoff:scheduledAt,
    execution:{startedAt:'2026-10-13T12:01:00.000Z',finishedAt:'2026-10-13T12:02:00.000Z'},publicationAt:'2026-10-13T12:03:00.000Z',
    revision,parentId:revision===1?null:versionId(contextKey(context),scheduledAt,revision-1),action,lifecycle,reason:'CONTROLLED_PORT_DOUBLE',
    producerBundle:lifecycle==='completed'?{
      binding:{contextKey:contextKey(context),cycleId:cycle(scheduledAt).cycleId,assessmentCutoff:scheduledAt,cohortReference:ref,evidenceSetId:'controlled-evidence'},
      candidates:[{candidateId:'controlled-candidate'}],results:[{candidateId:'controlled-candidate',status:'CONTROLLED_OPAQUE_RESULT'}],
      searchCounts:{selected:1},evidenceFreeze:[{reference:ref,status:'controlled-only'}],
      inputsUsed:[{reference:{...ref,sha256:byteHash(exactJson({sourceTime:'2026-10-13T06:00:00.000Z',value:-0,receipt:null,temporalSupport:null}))},assessmentCutoff:scheduledAt,receivedAt:'2026-10-13T07:00:00.000Z',content:{sourceTime:'2026-10-13T06:00:00.000Z',value:-0,receipt:null,temporalSupport:null}}],
      delivery:{opportunities:science==='available'?[{opportunityId:'controlled-opportunity',score:-0,confidence:0.5,rank:1}]:[],exclusions:['controlled-exclusion']},
      evaluationState:{state:science,scope:'selected-analysis-cohort',establishesSpatialCoverage:false,reason:'CONTROLLED_PORT_DOUBLE'},
      producerVersions:{fixture:'PASSIVE_PORT_DOUBLE_NOT_PRODUCER'},producerText:'opaque controlled payload',producerDigest:'b'.repeat(64),
    }:null,versionId:versionId(contextKey(context),scheduledAt,revision)};
  if(controlled) body.controlledQualification={scope:'CONTROLLED_CURRENT_EVIDENCE_ONLY',sourceAdmission:'NOT_SCIENTIFICALLY_ADMITTED',history:'UNAVAILABLE',historySourceReference:null,operationalPublishing:false,betaReady:false,cp10:'BLOCKED'};
  return {...body,contentDigest:byteHash(exactJson(body))};
}
function request(mode='current-cycle') {return {scope:{contractVersion:SYNTHETIC_PUBLICATION_SCOPE,kind:'SYNTHETIC_SCOPE_ONLY',context},mode,
  scheduledAt:mode==='exact-cycle'?slot:null,priorWitness:null};}
function response(p=source(),mode='current-cycle',native=false) {
  const historical=mode==='latest-successful-history';
  const usable=p?.lifecycle==='completed'&&p.producerBundle.evaluationState.state!=='unavailable';
  return {status:'VALIDATED',recordText:native&&p?exactJson(p):null,value:{contractVersion:'pelora-published-opportunity-store-v1',mode,
    historicalOnly:historical,requestedCycle:slot,currentCycle:slot,currentCycleStatus:'completed',lifecycle:p?.lifecycle??'missing',
    scientificState:p?.producerBundle?.evaluationState.state??null,record:p,activePublication:usable?p:null,isCurrent:!historical&&Boolean(usable),
    readAt:'2026-10-13T12:10:00.000Z',sourceAgesAtRead:p?.producerBundle?[{reference:ref,sourceTime:'2026-10-13T06:00:00.000Z',milliseconds:22200000}]:[],
    ...(p?.controlledQualification?{qualification:p.controlledQualification,operationalPublication:false}:{})}};
}
async function run(r=response(),q=request()) {return createOfflinePublicationReadProjection({readValidated:async()=>r}).read(q);}

for(const science of ['available','governed-zero','partial','unavailable']) test(`preserves opaque upstream ${science} without constructing science`,async()=>{
  const r=response(source({science})); const result=await run(r);
  assert.equal(result.resolution,'RESOLVED'); assert.deepEqual(result.source,r.value);
  assert.equal(result.source.scientificState,science);assert.equal(result.operationalAdmission,'UNKNOWN');
  assert(Object.is(result.source.record.producerBundle.inputsUsed[0].content.value,-0));
  assert(Object.isFrozen(result.source.record));
});
for(const lifecycle of ['running','delayed','failed']) test(`preserves ${lifecycle} distinct from science`,async()=>{
  const result=await run(response(source({lifecycle})));assert.equal(result.resolution,'RESOLVED');
  assert.equal(result.source.scientificState,null);assert.equal(result.currentPresentation,false);
});
test('partial empty delivery does not establish zero',async()=>{
  const result=await run(response(source({science:'partial'})));assert.equal(result.source.scientificState,'partial');
  assert.equal(result.source.record.producerBundle.delivery.opportunities.length,0);
});
test('missing current cannot borrow older history',async()=>{
  const r=response(null);r.value.currentCycleStatus='missing';const result=await run(r);
  assert.equal(result.resolution,'NO_RECORD');assert.equal(result.identity,null);assert.equal(result.currentPresentation,false);
});
test('explicit exact cycle at current boundary remains historical presentation',async()=>{
  const result=await run(response(source(),'exact-cycle'),request('exact-cycle'));
  assert.equal(result.source.isCurrent,true);assert.equal(result.source.historicalOnly,false);
  assert.equal(result.queryContext,'historical');assert.equal(result.currentPresentation,false);
});
test('older explicit successful history preserves failed current status',async()=>{
  const r=response(source({scheduledAt:older}),'latest-successful-history');r.value.currentCycleStatus='failed';
  const result=await run(r,request('latest-successful-history'));assert.equal(result.resolution,'RESOLVED');
  assert.equal(result.source.currentCycleStatus,'failed');assert.equal(result.identity.scheduledAt,older);assert.equal(result.currentPresentation,false);
});
for(const [action,lifecycle] of [['CORRECTION','completed'],['WITHDRAWAL','withdrawn']]) test(`preserves ${action} lineage`,async()=>{
  const result=await run(response(source({revision:2,action,lifecycle})));assert.equal(result.resolution,'RESOLVED');
  assert.equal(result.identity.action,action);assert.equal(result.identity.revision,2);
  if(action==='WITHDRAWAL') assert.equal(result.source.activePublication,null);
});
test('native and derived exact text are labelled separately and preserve signed zero',async()=>{
  const p=source();const native=await run(response(p,'current-cycle',true));const derived=await run(response(p));
  assert.equal(native.sourceText.origin,'PORT_NATIVE_TEXT');assert.equal(derived.sourceText.origin,'DERIVED_EXACT_SERIALIZATION');
  assert.equal(native.sourceText.text,derived.sourceText.text);assert.match(native.sourceText.text,/"score":-0/);
});
test('controlled remains false-operational, materiality always unresolved',async()=>{
  const result=await run(response(source({controlled:true})));assert.equal(result.operationalAdmission,'CONTROLLED_NOT_OPERATIONAL');
  assert.equal(result.source.operationalPublication,false);assert.deepEqual(result.materialComparison,{state:'UNRESOLVED',reason:'NO_QUALIFIED_PRODUCER'});
});
for(const [name,mutate] of [
  ['context',r=>r.value.record.context.region.id='wrong'],
  ['species',r=>r.value.record.context.species='other'],
  ['cycle',r=>r.value.record.cycle.scheduledAt=older],
  ['science alias',r=>r.value.scientificState='governed-zero'],
  ['active pointer',r=>r.value.activePublication=null],
  ['digest',r=>r.value.record.contentDigest='f'.repeat(64)],
  ['native text',r=>r.recordText='{}'],
  ['unknown wrapper field',r=>r.value.materialComparison={state:'material'}],
  ['current boundary',r=>r.value.currentCycle=older],
  ['qualification',r=>r.value.operationalPublication=true],
]) test(`${name} mismatch fails closed`,async()=>{const r=copy(response(source({controlled:true})));mutate(r);
  const result=await run(r);assert.equal(result.resolution,'INVALID_BINDING');assert.equal(result.identity,null);});
for(const reason of ['corrupt reference','cohort mismatch','producer text mismatch']) test(`${reason}: upstream invalid stays invalid`,async()=>{
  // Full strict source validation is the port's responsibility, NOT simulated by digest checking.
  const result=await run({status:'INVALID_BINDING'});assert.equal(result.resolution,'INVALID_BINDING');assert.equal(result.source,null);
});
test('read unavailable is explicit, unexpected exceptions are not benign missingness',async()=>{
  assert.equal((await run({status:'READ_UNAVAILABLE'})).resolution,'READ_UNAVAILABLE');
  await assert.rejects(createOfflinePublicationReadProjection({readValidated:async()=>{throw new Error('controlled bug');}}).read(request()),/controlled bug/);
});
test('absent admission scope calls no port',async()=>{
  let calls=0;const q=request();q.scope=null;
  const result=await createOfflinePublicationReadProjection({readValidated:async()=>{calls++;}}).read(q);
  assert.equal(result.resolution,'UNRESOLVED_CONTEXT');assert.equal(calls,0);
});
test('request snapshots before await; source detaches before later caller mutation',async()=>{
  let release;let captured;const r=response();const q=copy(request());
  const pending=createOfflinePublicationReadProjection({readValidated:query=>{captured=query;return new Promise(resolve=>{release=resolve;});}}).read(q);
  q.scope.context.region.id='later';assert.equal(captured.context.region.id,'controlled-region');release(r);
  const result=await pending;r.value.record.producerBundle.delivery.opportunities[0].confidence=99;
  assert.equal(result.source.record.producerBundle.delivery.opportunities[0].confidence,0.5);
});
test('repeat replay deterministic; explicit prior witness detects same-version conflict',async()=>{
  const r=response();const first=await run(r);assert.deepEqual(await run(r),first);
  const q=request();q.priorWitness={versionId:first.identity.versionId,contentDigest:first.identity.contentDigest,text:first.sourceText.text};
  assert.equal((await run(r,q)).resolution,'RESOLVED');q.priorWitness.text+=' ';
  assert.equal((await run(r,q)).resolution,'INVALID_BINDING');
});
test('source times, unknown possession, and ages pass through unchanged',async()=>{
  const r=response();const result=await run(r);assert.deepEqual(result.source.sourceAgesAtRead,r.value.sourceAgesAtRead);
  assert.deepEqual(result.source.record.producerBundle.inputsUsed,r.value.record.producerBundle.inputsUsed);
});
test('static containment: adapter contains no producer/submit/acquisition/database calls',()=>{
  const source=readFileSync(new URL('../durableObserve/captainPublicationReadProjection.mjs',import.meta.url),'utf8');
  for(const forbidden of ['readRankedPublication(', 'serializeRankedPublication(', 'composeRankedPublication(', 'buildGovernedOpportunityEvaluationStateV1(',
    'fetch(', '.query(', '.submit(', 'setInterval(', 'server.js', 'rankedPublicationFixture']) assert.equal(source.includes(forbidden),false,forbidden);
});

for (const [name, mutate] of [
  ['malformed retained reference', p=>p.producerBundle.inputsUsed[0].reference.sha256='not-a-digest'],
  ['recomputed outer digest with wrong retained content', p=>p.producerBundle.inputsUsed[0].content.value=42],
  ['cross-cohort binding', p=>p.producerBundle.binding.cohortReference={...ref,sha256:'c'.repeat(64)}],
  ['cross-cycle binding', p=>p.producerBundle.binding.cycleId='ocycle-other'],
]) test(`${name} rejects even with recomputed envelope hash`, async()=>{
  const p=source();mutate(p);const {contentDigest,...body}=p;p.contentDigest=byteHash(exactJson(body));
  const result=await run(response(p));assert.equal(result.resolution,'INVALID_BINDING');
});
test('unsupported material producer payload is rejected rather than passed through', async()=>{
  const r=response();r.materialComparison={state:'MATERIAL'};
  assert.equal((await run(r)).resolution,'INVALID_BINDING');
});
test('unsafe request accessor is rejected without evaluating it', async()=>{
  let calls=0;const q=request();Object.defineProperty(q,'scope',{enumerable:true,get(){calls++;return null;}});
  assert.equal((await run(response(),q)).resolution,'INVALID_BINDING');assert.equal(calls,0);
});
test('new revision gets source identity; lifecycle-only status cannot replace it',async()=>{
  const r=response(source({revision:2,action:'CORRECTION'}));r.value.currentCycleStatus='failed';
  const result=await run(r);assert.equal(result.resolution,'RESOLVED');assert.equal(result.identity.revision,2);
  assert.equal(result.source.currentCycleStatus,'failed');assert.equal(result.source.record.versionId,r.value.record.versionId);
});
