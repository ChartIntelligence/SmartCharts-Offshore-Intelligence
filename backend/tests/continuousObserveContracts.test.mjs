import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {canonical,digest,seal,utc} from '../observe/canonical.mjs';
import {createManifest,validateManifest,readManifest,gridReference,samplingReference,manifestReference,MANIFEST} from '../observe/manifest.mjs';
import {createActivation,resolveActivation} from '../observe/activation.mjs';
import {createJob,validateJob,planJobs,authorizeJob} from '../observe/jobs.mjs';
import {createExecution,validateExecution,createBinding,validateBinding,BINDING} from '../observe/provenance.mjs';
import {readCurrentEvidenceCaptureV3,captureCurrentEvidenceV3,serializeCurrentEvidenceCaptureV3,currentCaptureReferenceV3} from '../currentEvidenceCaptureV3.mjs';
import {fixture,manifestBody,plannerInput,executionFixture,time} from './fixtures/continuousObserveFixture.mjs';
const clone = structuredClone;
const withoutDigest = ({digest:ignored,...body}) => { void ignored; return body; };

test('canonical identity ignores property and set ordering, preserves immutable detached values',()=>{
  const raw=manifestBody(), a=createManifest(raw);
  raw.sampling.cells.reverse();raw.retry.retryableFailures.reverse();
  const reversed=JSON.parse(JSON.stringify(raw, Object.keys(raw))); // Deliberately incomplete object rejected, not silently defaulted.
  assert.throws(()=>createManifest(reversed));
  function reorder(v){return Array.isArray(v)?v.map(reorder):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).reverse().map(([k,x])=>[k,reorder(x)])):v;}
  assert.deepEqual(createManifest(reorder(raw)),a);
  assert.equal(readManifest(canonical(a)).digest,a.digest);
  assert(Object.isFrozen(a.sampling.cells[0].coordinates));
  raw.region.id='mutated';assert.notEqual(a.region.id,raw.region.id);
  assert.notEqual(digest('one',a),digest('two',a));
});

for (const [name,change] of [
  ['wrong version',m=>m.contractVersion='v2'],['missing cadence',m=>delete m.schedule.intervalMs],
  ['zero interval',m=>m.schedule.intervalMs=0],['negative deadline',m=>m.schedule.deadlineMs=-1],
  ['delay beyond deadline',m=>m.schedule.permittedExecutionDelayMs=m.schedule.deadlineMs],
  ['waiting timeout budget',m=>m.providerTime.maxWaitMs=m.schedule.deadlineMs-1],
  ['duplicate key',m=>m.sampling.cells[1].key=m.sampling.cells[0].key],
  ['duplicate cell aliases',m=>{m.sampling.cells[1]=clone(m.sampling.cells[0]);m.sampling.cells[1].key='alias';}],
  ['wrong cell coordinate',m=>m.sampling.cells[0].coordinates.latitude=26],
  ['wrong provider',m=>m.product.provider='other'],['wrong dataset',m=>m.product.dataset='other'],
  ['wrong grid reference',m=>m.gridReference.sha256='0'.repeat(64)],
  ['wrong sampling reference',m=>m.samplingReference.sha256='0'.repeat(64)],
  ['negative zero',m=>m.sampling.cells[0].coordinates.latitude=-0],
  ['numeric string',m=>m.schedule.intervalMs='3600000'],['NaN',m=>m.schedule.intervalMs=NaN],
  ['infinity',m=>m.schedule.intervalMs=Infinity],['submicrodegree alias',m=>m.sampling.cells[0].coordinates.latitude=25.0000001],
  ['positive antimeridian alias',m=>m.sampling.cells[0].coordinates.longitude=180],
  ['pole alias',m=>m.sampling.cells[0].coordinates.latitude=90],['invalid bounds',m=>m.sampling.cells[0].coordinates.longitude=-181],
  ['bad index',m=>m.sampling.cells[0].indices.latitude=3],['fractional index',m=>m.sampling.cells[0].indices.latitude=0.5],
  ['bad grid extent',m=>m.grid.dimensions.latitude=100000],['bad effective range',m=>m.effectiveUntil=m.effectiveFrom],
  ['implicit mask',m=>delete m.coverage.maskReference],['unknown inclusion',m=>m.sampling.inclusionRule='VIEWPORT'],
  ['extra private field',m=>m.sessionId='private'],['retry duplicate',m=>m.retry.retryableFailures.push(m.retry.retryableFailures[0])],
  ['oversized cell policy',m=>m.limits.maxCells=10001],['invalid queue',m=>m.limits.queueCapacity=0]
]) test('manifest rejects '+name,()=>{const m=clone(manifestBody());change(m);assert.throws(()=>createManifest(m));});

test('all manifest fields are required, including each nested policy field',()=>{
  const m=manifestBody();
  for (const key of Object.keys(m)){const x=clone(m);delete x[key];assert.throws(()=>createManifest(x),key);}
  for (const parent of ['product','region','coverage','schedule','providerTime','limits','retry','grid','sampling'])
    for(const key of Object.keys(m[parent])){const x=clone(m);delete x[parent][key];assert.throws(()=>createManifest(x),parent+'.'+key);}
});
test('data admission rejects getters, prototypes, symbols, cycles and sparse arrays without evaluating getters',()=>{
  let calls=0;const m=manifestBody();Object.defineProperty(m,'id',{get(){calls++;return 'bad';},enumerable:true});assert.throws(()=>createManifest(m));assert.equal(calls,0);
  for(const build of [()=>Object.create(manifestBody()),()=>{const m=manifestBody();m[Symbol('x')]=1;return m;},()=>{const m=manifestBody();m.loop=m;return m;},()=>{const m=manifestBody();delete m.sampling.cells[0];return m;}])assert.throws(()=>createManifest(build()));
});
test('wire rejects duplicate keys, alternate numbers, whitespace, noncanonical set order, and changed digests',()=>{
  const m=fixture().manifest, wire=canonical(m);
  for(const text of [wire+' ',wire.replace('"intervalMs":3600000','"intervalMs":3.6e6'),wire.replace('"version":"v1"','"version":"v1","version":"v1"')])assert.throws(()=>readManifest(text));
  const changed=clone(m);changed.region.id='different';assert.throws(()=>validateManifest(changed));changed.digest='f'.repeat(64);assert.throws(()=>validateManifest(changed));
  const raw=withoutDigest(clone(m));raw.sampling.cells.reverse();assert.throws(()=>validateManifest(seal(MANIFEST,raw)));
});
for (const bad of ['2026-10-01T00:00:00Z','2026-10-01T00:00:00.000+00:00','2026-02-30T00:00:00.000Z','2026-10-01T24:00:00.000Z','2026-10-01T00:00:60.000Z','not-a-date'])
  test('reject noncanonical UTC '+bad,()=>assert.throws(()=>utc(bad)));

test('activation requires exact approved manifest and latest protected activation revision',()=>{
  const f=fixture();assert.equal(resolveActivation(f.manifest,f.activation,f.trustedState,time()).state,'ENABLED');
  for(const change of [t=>t.activationRevision++,t=>t.activationDigest='0'.repeat(64),t=>t.approvedManifestReference=manifestReference(fixture('synthetic-atlantic').manifest)]){
    const t=clone(f.trustedState);change(t);assert.throws(()=>resolveActivation(f.manifest,f.activation,t,time()));
  }
  const input=withoutDigest(f.activation);input.effectiveAt=time(0,0,-2);assert.throws(()=>createActivation(input));
});
for(const state of ['DISABLED','REVOKED'])test(state+' stops planning and execution even for previously generated jobs',()=>{
  const f=fixture(), job=createJob(f.manifest,'cell-a',time());
  f.activation=createActivation({...withoutDigest(f.activation),revision:2,state,stoppedAt:time(1)});
  f.trustedState.activationDigest=f.activation.digest;f.trustedState.activationRevision=2;
  assert.throws(()=>planJobs(plannerInput(f)));assert.throws(()=>authorizeJob(f.manifest,f.activation,f.trustedState,job,time(1)));
});
test('activation cannot authorize earlier scheduled windows or execution',()=>{
  const f=fixture();f.activation=createActivation({...withoutDigest(f.activation),effectiveAt:time(0,30)});f.trustedState.activationDigest=f.activation.digest;
  assert.deepEqual(planJobs(plannerInput(f,time(1))).jobs.map(j=>j.window.start),[time(1),time(1)]);
  assert.throws(()=>authorizeJob(f.manifest,f.activation,f.trustedState,createJob(f.manifest,'cell-a',time()),time(0,40)));
  assert.throws(()=>planJobs(plannerInput(f,time(0,29))));
});

test('UTC anchor, half-open range, deterministic cell order and restart re-enumeration',()=>{
  const p=plannerInput();const a=planJobs(p);assert.equal(a.jobs.length,4);assert.deepEqual(planJobs(clone(p)),a);
  assert.deepEqual(a.jobs.map(j=>j.cellKey),['cell-a','cell-b','cell-a','cell-b']);
  p.range={from:time(1),until:time(2)};assert.equal(planJobs(p).jobs.length,2);
  p.range={from:time(),until:time(1)};assert.equal(planJobs(p).jobs.length,2);
  assert.equal(planJobs(plannerInput(fixture(),time())).jobs.length,2);
  assert.equal(planJobs(plannerInput(fixture(),time(0,0,1))).jobs.length,2);
  assert.throws(()=>planJobs(plannerInput(fixture(),time(0,0,-1))));
});
test('before/at/after interval boundary enumerate the correct windows',()=>{
  for(const [asOf,count] of [[time(1,0,-1),2],[time(1),4],[time(1,0,1),4]])assert.equal(planJobs(plannerInput(fixture(),asOf)).jobs.length,count);
});
test('effective-from inclusive and effective-until exclusive, including clipped deadline',()=>{
  const f=fixture('synthetic-gulf',m=>{m.effectiveFrom=time(1);m.effectiveUntil=time(2,30);});
  assert.equal(planJobs(plannerInput(f,time(1))).jobs.length,2);
  assert.equal(createJob(f.manifest,'cell-a',time(2)).deadline,time(2,30));
  assert.throws(()=>createJob(f.manifest,'cell-a',time()));
  assert.throws(()=>planJobs(plannerInput(f,time(2,30))));
  assert.throws(()=>authorizeJob(f.manifest,f.activation,f.trustedState,createJob(f.manifest,'cell-a',time(2)),time(2,30)));
});
test('missed windows are bounded by count, age, delay and exclusive deadline',()=>{
  for(const mutate of [m=>m.schedule.catchUpMaxWindows=1,m=>m.schedule.catchUpMaxAgeMs=0,m=>m.schedule.permittedExecutionDelayMs=0,m=>{m.schedule.deadlineMs=3600000;m.schedule.permittedExecutionDelayMs=3599999;}]){
    const f=fixture('synthetic-gulf',mutate);assert.deepEqual(planJobs(plannerInput(f,time(1))).jobs.map(j=>j.window.start),[time(1),time(1)]);
  }
  const f=fixture();assert.deepEqual(planJobs(plannerInput(f,time(2))).jobs.map(j=>j.window.start),[time(1),time(1),time(2),time(2)]);
  assert.deepEqual(planJobs(plannerInput(f,time(1,30))).jobs.map(j=>j.window.start),[time(),time(),time(1),time(1)]);
  assert.deepEqual(planJobs(plannerInput(f,time(1,30,1))).jobs.map(j=>j.window.start),[time(1),time(1)]);
});
test('capacity overflow fails rather than silently omitting authorized cells',()=>{
  const f=fixture('synthetic-gulf',m=>m.limits.maxJobsPerPlan=2);assert.throws(()=>planJobs(plannerInput(f)),/planning-capacity/);
});
test('unaligned windows, forged IDs, altered windows and unauthorized cells fail closed',()=>{
  const m=fixture().manifest,j=createJob(m,'cell-a',time());
  assert.throws(()=>createJob(m,'cell-z',time()));assert.throws(()=>createJob(m,'cell-a',time(0,1)));
  for(const change of [x=>x.jobId+='0',x=>x.window.end=time(3),x=>x.window.start=time(1),x=>x.cell.coordinates.latitude=26,x=>x.manifestDigest='0'.repeat(64),x=>x.providerTime=time()]){
    const x=clone(j);change(x);assert.throws(()=>validateJob(m,x));
  }
});
test('second synthetic region uses unchanged generic planner with distinct manifest/job identities',()=>{
  const a=planJobs(plannerInput(fixture())),b=planJobs(plannerInput(fixture('synthetic-atlantic')));
  assert.equal(a.jobs.length,b.jobs.length);assert.notEqual(a.jobs[0].jobId,b.jobs[0].jobId);assert.equal(b.jobs[0].cell.coordinates.latitude,35);
});

const privateContexts={captainCoordinates:{latitude:4,longitude:5},tripOrigin:{latitude:8,longitude:9},captainRange:900,mapOpen:true,mapViewport:[1,2,3,4],viewportMovement:[1,4],selectedSpecies:'marlin',selectedOpportunity:'opportunity',selectedPlace:'place',searches:['private'],reports:[{id:'report',edited:true}],authenticated:true,sessionId:'private-session',activeCaptains:100,zeroActiveUsers:0};
for(const [field,value] of Object.entries(privateContexts))test('privacy independence: '+field,()=>{
  const p=plannerInput(), baseline=planJobs(p);
  // App context stays outside the allowlisted planner input and cannot influence it.
  const app= {context:{[field]:value},controlPlane:p};
  assert.deepEqual(planJobs(app.controlPlane),baseline);
  assert.throws(()=>planJobs({...p,[field]:value}),/exact-fields/);
  const m=manifestBody();m[field]=value;assert.throws(()=>createManifest(m));
});
test('contracts have no request, cache, environment, network, timer or receipt dependencies',()=>{
  const folder=new URL('../observe/',import.meta.url);
  for(const name of readdirSync(folder)){
    const source=readFileSync(new URL(name,folder),'utf8');
    assert.doesNotMatch(source,/from\s+['"].*(?:server\.js|historicalReceipt|fields\/|node:(?:fs|http|https|net|child_process))/);
    assert.doesNotMatch(source,/\b(?:fetch|setInterval|setTimeout)\s*\(|Date\.now\s*\(|process\.env/);
  }
  const p=plannerInput(),old=globalThis.fetch;globalThis.fetch=()=>{throw Error('unexpected network');};
  try{assert.equal(planJobs(p).jobs.length,4);}finally{globalThis.fetch=old;}
});

test('successful exact external binding is immutable and does not modify CURRENTS V3 bytes',()=>{
  const f=executionFixture(),original=f.captureText;
  const b=createBinding(f.context,f.execution,f.captureText);
  assert.deepEqual(validateBinding(f.context,f.execution,f.captureText,b),b);
  assert.equal(f.captureText,original);assert(Object.isFrozen(b.evidenceReference));
  assert.match(b.assurance,/REQUIRES_TRUSTED_EXECUTION_WITNESS/);
  assert.deepEqual(validateExecution(f.context,f.execution,f.captureText),f.execution);
});
for(const [name,change] of [
  ['wrong job',e=>e.jobId='wrong'],['wrong manifest',e=>e.manifestDigest='0'.repeat(64)],['wrong cell',e=>e.cellKey='cell-b'],
  ['wrong canonical request',e=>e.acquisition.request.coordinates.latitude=26],['wrong resolved coordinate',e=>e.acquisition.response.coordinates.latitude=26],
  ['wrong provider',e=>e.acquisition.request.provider='wrong'],['wrong dataset',e=>e.acquisition.request.dataset='wrong'],
  ['wrong grid',e=>e.acquisition.request.gridReference.sha256='0'.repeat(64)],['wrong adapter',e=>e.acquisition.request.adapter.sha256='0'.repeat(64)],
  ['wrong index',e=>e.acquisition.request.indices.latitude=1],['wrong return provider',e=>e.acquisition.response.provider='wrong'],
  ['before activation',e=>e.startedAt=time(0,0,-1)],['after expiry',e=>e.finishedAt=time(24)],
  ['zero attempt',e=>e.attemptNumber=0],['too many attempts',e=>e.attemptNumber=99],['bad attempt ID',e=>e.attemptId=''],
  ['zero fencing token',e=>e.fencingToken=0],['string fence',e=>e.fencingToken='1'],['fractional fence',e=>e.fencingToken=1.5],
  ['wrong exact evidence',e=>e.evidenceReference.sha256='0'.repeat(64)],['wrong normalization',e=>e.normalizationVersion='wrong'],
  ['backward acquisition',e=>e.acquisition.receivedAt=time()],['provider time mismatch',e=>e.acquisition.response.observationTime=time(1)],
  ['private execution metadata',e=>e.sessionId='private'],['private request metadata',e=>e.acquisition.request.userId='private']
])test('execution rejects '+name,()=>{const f=executionFixture();change(f.input);assert.throws(()=>createExecution(f.context,f.input,f.captureText));});
test('binding cannot substitute another reference, attempt, response or activation even with a recomputed digest',()=>{
  const f=executionFixture(), b=createBinding(f.context,f.execution,f.captureText);
  for(const change of [x=>x.evidenceReference.sha256='0'.repeat(64),x=>x.attemptId='other',x=>x.retainedResponseReference.sha256='0'.repeat(64),x=>x.activationDigest='0'.repeat(64)]){
    const x=withoutDigest(clone(b));change(x);assert.throws(()=>validateBinding(f.context,f.execution,f.captureText,seal(BINDING,x)));
  }
});
test('failed attempts cannot claim evidence or create bindings',()=>{
  const f=executionFixture();Object.assign(f.input,{outcome:'FAILED',failure:'PROVIDER_TIMEOUT',acquisition:null,evidenceReference:null,normalizationVersion:null});
  const e=createExecution(f.context,f.input);assert.throws(()=>createBinding(f.context,e,null));
  f.input.evidenceReference=f.execution.evidenceReference;assert.throws(()=>createExecution(f.context,f.input));
});
test('provider time belongs to execution only, never logical job identity',()=>{
  const f=executionFixture();assert(!Object.hasOwn(f.context.job,'selectedProviderTime'));
  assert.equal(createJob(f.context.manifest,'cell-a',time()).jobId,f.context.job.jobId);
  assert.throws(()=>planJobs({...plannerInput(),providerTime:time()}));
});

for(const [name,change] of [
  ['different requested coordinates',c=>c.samples[0].point.requestedLatitude=26],
  ['different resolved coordinates',c=>c.samples[0].point.resolvedLongitude=-89],
  ['different provider time',c=>c.samples[0].point.observedAt=time(1)],
  ['noncanonical provider time',c=>c.samples[0].point.observedAt='October 1, 2026 00:00:00 GMT'],
  ['forged recorded metadata reference',c=>c.sourceAuthority.reference.sha256='0'.repeat(64)],
  ['additional spatial sample',c=>c.samples.push({...clone(c.samples[0]),role:'north'})],
  ['wrong lineage',c=>c.lineageReferences=[]]
])test('a valid rehashed V3 capture still cannot bypass '+name,()=>{
  const f=executionFixture(), old=readCurrentEvidenceCaptureV3(f.captureText);
  const c=clone({family:old.family,sourceAuthority:old.sourceAuthority,samples:old.samples,lineageReferences:old.lineageReferences});
  change(c);const altered=captureCurrentEvidenceV3(c);f.input.evidenceReference=currentCaptureReferenceV3(altered);
  assert.throws(()=>createExecution(f.context,f.input,serializeCurrentEvidenceCaptureV3(altered)));
});
test('planner handles a bounded larger sampling set without changing scope or ordering',()=>{
  const raw=manifestBody();raw.grid.dimensions={latitude:50,longitude:50};
  raw.sampling.cells=Array.from({length:500},(_,i)=>({key:'cell-'+String(i).padStart(4,'0'),indices:{latitude:Math.floor(i/50),longitude:i%50},coordinates:{latitude:25+Math.floor(i/50)*0.25,longitude:-90+(i%50)*0.25}}));
  raw.limits.maxCells=500;raw.limits.maxJobsPerPlan=1000;raw.limits.queueCapacity=1000;
  raw.gridReference=gridReference(raw.grid);raw.samplingReference=samplingReference(raw.sampling,raw.grid);
  const manifest=createManifest(raw), f=fixture();
  const activation=createActivation({...withoutDigest(f.activation),manifestReference:manifestReference(manifest)});
  const state={approvedManifestReference:manifestReference(manifest),activationDigest:activation.digest,activationRevision:activation.revision};
  const plan=planJobs(plannerInput({manifest,activation,trustedState:state}));
  assert.equal(plan.jobs.length,1000);assert.equal(new Set(plan.jobs.map(j=>j.jobId)).size,1000);
});
