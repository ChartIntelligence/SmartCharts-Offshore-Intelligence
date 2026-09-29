import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {getMoonConditions} from '../server.js';
import {requireScientificAssessmentV1,withScientificAssessmentV1} from '../scientificAssessment.mjs';
import {cycleV3,assessmentContextV3,hash} from '../../shared/oceanPublication.mjs';
import {runDefault,instants,differences,source,profiler,phaseCount} from './fixtures/assessmentAstronomyFixture.mjs';
const core=at=>withScientificAssessmentV1({contractVersion:'pelora-scientific-assessment-v1',assessmentAt:at},()=>getMoonConditions(at));
const labels=['new-moon','waxing-crescent','first-quarter','waxing-gibbous','full-moon','waning-gibbous','last-quarter','waning-crescent'];
const evidence={cases:[],boundaries:[],differences:[],clock:[],domain:[],identity:null,cache:null,retainedAstronomyDifferences:[]};let sequence=0;
const clock=()=>Date.parse('2150-01-01')+(sequence++)*86400000;
after(()=>{if(process.env.PELORA_WRITE_ASTRONOMY==='1')writeFileSync('.local/ocean-quarantine/task12b6s/evidence.json',JSON.stringify(evidence,null,2)+'\n');});
function finite(m){for(const k of ['phaseFraction','lunarAgeDays','illuminationPercent'])assert(Number.isFinite(m[k]),k);assert(labels.includes(m.phase));assert.equal(m.source.availability,'available');}

test('astronomy entry, inputs, fixed constants and downstream call order are source-bound',()=>{
 const a=source.indexOf('export function getMoonConditions('),b=source.indexOf('\n}',a)+2,body=source.slice(a,b);
 assert(!body.includes('Date.now'));assert(!body.includes('new Date()'));assert(!/latitude|longitude|captain|species|cache|generatedAt/.test(body));
 assert(body.includes('assertScientificInstantV1(timestamp)'));
 const provider=source.slice(source.indexOf('async function getOceanConditionsAtAssessment('),source.indexOf('export function createPeloraServer('));
 assert(provider.includes('getMoonConditions(assessment.assessmentAt)'));
 assert(provider.indexOf('getMoonConditions(')<provider.indexOf('buildObservationSnapshot('));assert(provider.indexOf('buildObservationSnapshot(')<provider.indexOf('assessBlueMarlinHabitat('));
 const classifier=source.slice(source.indexOf('function classifyMoonPhase('),a);assert.deepEqual([...classifier.matchAll(/return "([a-z-]+)";/g)].map(m=>m[1]),labels);
 assert(source.includes('29.530588853'));assert(source.includes('"2000-01-06T18:14:00Z"'));
});

test('demonstrated assessment instants retain exact output shape and snapshot copies',async t=>{
 const p=await profiler();try{for(const [i,at]of instants.entries()){
 const r=await runDefault(t,{assessmentAt:at,clock:clock()}),m=r.ocean.moon,c=await p.take();finite(m);
 assert.equal(m.phase,i===0?'full-moon':'waning-gibbous');assert(phaseCount(c,m.phase)>0);
 assert.deepEqual(Object.keys(m).sort(),['illuminationPercent','lunarAgeDays','observedAt','phase','phaseFraction','source']);
 assert.deepEqual(Object.keys(m.source).sort(),['accuracy','availability','classification','provider','referenceEpoch']);
 assert.deepEqual(r.ocean.observationSnapshot.observations.moon,m);assert.deepEqual(r.ocean.oceanSnapshot.observation.observations.moon,m);
 assert.equal(r.ocean.dataQuality.layers.moon.state,'calculated');assert.equal(r.ocean.dataQuality.layers.moon.observedAt,m.observedAt);
 evidence.cases.push({id:'demonstrated-'+i,assessmentAt:at,moon:m,phaseBranchCount:phaseCount(c,m.phase)});
 }}finally{await p.close();}
});

test('astronomy core replays with Date.now and no-argument Date construction prohibited',t=>{
 const at=instants[0],expected=core(at),RealDate=Date;
 const Replacement=new Proxy(RealDate,{construct(target,args){assert(args.length>0,'Hidden wall-clock Date construction');return Reflect.construct(target,args);},apply(target,that,args){throw Error('Hidden Date function clock');}});
 const dateMock=t.mock.method(globalThis,'Date',Replacement);const now=t.mock.method(RealDate,'now',()=>{throw Error('Date.now prohibited');});
 try{for(let i=0;i<3;i++)assert.deepEqual(core(at),expected);}finally{now.mock.restore();dateMock.mock.restore();}
 const ctx=requireScientificAssessmentV1({contractVersion:'pelora-scientific-assessment-v1',assessmentAt:at});assert(Object.isFrozen(ctx));
 assert.throws(()=>withScientificAssessmentV1(ctx,()=>getMoonConditions(instants[1])),/Inconsistent/);
});

test('all source phase thresholds are exercised around the nearest representable millisecond',async t=>{
 const period=29.530588853*86400000,epoch=Date.parse('2000-01-06T18:14:00Z'),cycle=330;
 const fractions=[0.03125,0.21875,0.28125,0.46875,0.53125,0.71875,0.78125,0.96875];
 const right=['waxing-crescent','first-quarter','waxing-gibbous','full-moon','waning-gibbous','last-quarter','waning-crescent','new-moon'];const seen=new Set();const p=await profiler();
 try{for(const [i,f]of fractions.entries()){
  const ideal=epoch+(cycle+f)*period;let transition=null;
  // Locate the first actual accepted millisecond crossing. No epsilon or fuzzy comparison.
  for(let ms=Math.floor(ideal)-3;ms<=Math.ceil(ideal)+3;ms++)if(core(new Date(ms).toISOString()).phase===right[i]&&core(new Date(ms-1).toISOString()).phase===labels[i]){transition=ms;break;}
  assert.notEqual(transition,null,'A source threshold must have an exact adjacent-ms witness');
  const records=[];for(const delta of [-1,0,1]){const at=new Date(transition+delta).toISOString(),r=await runDefault(t,{assessmentAt:at,sourceTime:'2020-01-01T00:00:00Z',clock:clock()}),c=await p.take();const expected=delta<0?labels[i]:right[i];assert.equal(r.ocean.moon.phase,expected);assert(phaseCount(c,expected)>0);finite(r.ocean.moon);seen.add(expected);records.push({assessmentAt:at,offsetMilliseconds:delta,phase:expected,phaseBranchCount:phaseCount(c,expected)});}
  evidence.boundaries.push({fraction:f,idealMilliseconds:ideal,transitionMilliseconds:transition,exactIdealOnMillisecondGrid:Number.isInteger(ideal),meaning:'first representable millisecond taking the next source branch, not a tolerance',records});
 }assert.deepEqual([...seen].sort(),[...labels].sort());}finally{await p.close();}
 // Exact epoch is representable. Before epoch exercises normalized negative remainder.
 for(const at of ['2000-01-06T18:13:59.999Z','2000-01-06T18:14:00.000Z','2000-01-06T18:14:00.001Z']){const r=await runDefault(t,{assessmentAt:at,sourceTime:'2000-01-01T00:00:00Z',clock:clock()});finite(r.ocean.moon);assert.equal(r.ocean.moon.phase,'new-moon');evidence.boundaries.push({id:'epoch-wrap',assessmentAt:at,moon:r.ocean.moon});}
});

test('existing assessment grammar rejects malformed and nonfinite inputs before provider execution',async t=>{
 const invalid=['2026-09-26','2026-09-26T01:00:00','2026-09-26T01:00:00+00:00','2026-09-26T01:00:00.12Z','2026-09-26T01:00:00.0001Z','2026-02-30T01:00:00Z','tomorrow',NaN,Infinity,-Infinity,null,new Date(instants[0])];
 for(const value of invalid){const trace={requests:[],clocks:[]};await assert.rejects(runDefault(t,{assessmentAt:value,trace,clock:clock()}));assert.equal(trace.requests.length,0);evidence.domain.push({input:String(value),accepted:false,requests:0});}
 assert.throws(()=>withScientificAssessmentV1({contractVersion:'pelora-scientific-assessment-v1',assessmentAt:instants[0]},()=>getMoonConditions('2026-09-26T01:00:00+00:00')));
 for(const at of ['0000-01-01T00:00:00.000Z','9999-12-31T23:59:59.999Z','2028-02-29T12:00:00Z','2099-01-01T00:00:00Z']){const r=await runDefault(t,{assessmentAt:at,sourceTime:at,clock:clock()});finite(r.ocean.moon);evidence.domain.push({input:at,accepted:true,moon:r.ocean.moon});}
});

test('candidate, location, ignored captain/species wrapper and later execution cannot change astronomy',async t=>{
 const expected=core(instants[0]);const variants=[{coordinates:[15,-100],candidateId:'a'},{coordinates:[32,-75],candidateId:'b'},{coordinates:[25,-90],candidateId:'c',extras:{captain:{id:'synthetic'},auth:{claim:'synthetic'},origin:[1,2],range:1,boat:'synthetic',mission:'synthetic',species:'synthetic-other',candidate:{captain:'synthetic'}}}];
 for(const v of [...variants,...variants.slice().reverse(),variants[0]]){const now=clock();for(const c of [now,now+1000]){const r=await runDefault(t,{...v,clock:c});assert.deepEqual(r.ocean.moon,expected);assert.deepEqual(r.ocean.observationSnapshot.observations.moon,expected);}}
 // These inert wrapper fields are not a qualification of Auth or injected providers.
});

test('request-style omitted assessment captures one instant and propagates it to astronomy',async t=>{
 const fixed=Date.parse(instants[0]),r=await runDefault(t,{assessmentOmitted:true,clock:fixed});
 const captures=r.trace.clocks.filter(s=>s.includes('resolveScientificAssessmentV1'));
 assert.equal(captures.length,1);assert.equal(r.ocean.moon.observedAt,new Date(fixed).toISOString());assert.deepEqual(r.ocean.moon,core(new Date(fixed).toISOString()));
 evidence.clock.push({kind:'outer-capture',assessmentCaptures:captures.length,operationalClockCalls:r.trace.clocks.length-1,observedAt:r.ocean.moon.observedAt});
});

test('scheduled publication context is accepted and deterministic without publication changes',async t=>{
 const c=cycleV3({scheduledAt:'2026-09-26T00:00:00Z',region:{id:'synthetic-region',version:'1'},configuration:{id:'synthetic-config',version:'1',governanceReference:'synthetic',evaluatorVersion:'synthetic-explicit-assessment-history-v1',candidateUniverseVersion:'1',species:['blue-marlin'],families:['SST'],candidateUniverse:{reference:{kind:'captured',referenceId:'synthetic-universe',contractVersion:'synthetic-v1',sha256:hash('synthetic')},candidateIds:['a']}}});
 const a=assessmentContextV3(c);assert(Object.isFrozen(a));assert.equal(a.contractVersion,'pelora-scheduled-scientific-assessment-v1');
 const first=await runDefault(t,{...a,clock:clock()}),second=await runDefault(t,{...a,clock:clock()});assert.deepEqual(first.ocean.moon,second.ocean.moon);assert.equal(first.ocean.moon.observedAt,a.assessmentAt);
 evidence.clock.push({kind:'scheduled-context',assessment:a,moon:first.ocean.moon});
});

test('mutable root result is detached from frozen snapshots and other evaluations',async t=>{
 const first=await runDefault(t,{clock:clock()}),expected=structuredClone(first.ocean.moon);first.ocean.moon.phase='synthetic-mutation';first.ocean.moon.source.provider='synthetic-mutation';
 assert.deepEqual(first.ocean.observationSnapshot.observations.moon,expected);assert(Object.isFrozen(first.ocean.observationSnapshot.observations.moon));assert(Object.isFrozen(first.ocean.observationSnapshot.observations.moon.source));
 const next=await runDefault(t,{clock:clock()});assert.deepEqual(next.ocean.moon,expected);assert.notEqual(next.ocean.moon,first.ocean.moon);
});

test('environmental cache hit does not cache or substitute astronomy assessment time',async t=>{
 const execution=clock(),cold=await runDefault(t,{clock:execution}),warm=await runDefault(t,{clock:execution+1000});
 assert(cold.trace.requests.length>warm.trace.requests.length,'Warm execution must demonstrate actual request avoidance');
 assert.deepEqual(cold.ocean.moon,warm.ocean.moon);
 const changed=await runDefault(t,{clock:execution+2000,assessmentAt:instants[1]});
 assert.equal(changed.ocean.moon.phase,'waning-gibbous');assert.deepEqual(changed.ocean.moon,core(instants[1]));
 evidence.cache={coldRequests:cold.trace.requests.length,warmRequests:warm.trace.requests.length,changedAssessmentRequests:changed.trace.requests.length,sameAssessmentExact:true,changedAssessmentRecomputed:true};
});

test('snapshot diffs separate astronomy from legitimate assessment-relative environmental age',async t=>{
 const a=await runDefault(t,{sourceTime:'2026-09-01T00:00:00Z',clock:clock()}),b=await runDefault(t,{assessmentAt:instants[1],sourceTime:'2026-09-01T00:00:00Z',clock:clock()});
 const d=differences(a.ocean.observationSnapshot,b.ocean.observationSnapshot);for(const x of d){
 if(x.path.startsWith('/observations/moon/')||x.path==='/dataQuality/layers/moon/observedAt')x.subsystem='ASSESSMENT_DERIVED_ASTRONOMY';
 else if(x.path==='/generatedAt')x.subsystem='RETRIEVAL_SNAPSHOT_METADATA';
 else if(x.path.endsWith('/sampleAgeHours'))x.subsystem='SST_ASSESSMENT_AGE';
 else if(x.path.endsWith('/ageHours')&&/currents?|vector/.test(x.path))x.subsystem='CURRENT_ASSESSMENT_AGE';
 else if(x.path.endsWith('/ageHours')&&/chlorophyll|clarity|productivity/.test(x.path))x.subsystem='CHLOROPHYLL_ASSESSMENT_AGE';
 else assert.fail('Unexplained snapshot difference '+x.path);
 if(x.subsystem.endsWith('_AGE'))assert.equal(x.right-x.left,168);
 }
 assert.equal(d.filter(x=>x.subsystem==='ASSESSMENT_DERIVED_ASTRONOMY').length,6);
 assert.equal(a.ocean.snapshotMetadata.identity.snapshotId,b.ocean.snapshotMetadata.identity.snapshotId);
 const retained=differences(a.ocean,b.ocean).filter(x=>x.path.includes('/moon/'));
 assert.equal(retained.length,18);evidence.retainedAstronomyDifferences=retained;
 evidence.differences=d;evidence.identity={sameExistingSnapshotId:a.ocean.snapshotMetadata.identity.snapshotId,moonContentDifferent:true,interpretation:'Current snapshot ID is location/represented-time/capture/schema identity, not a full content digest.'};
});
