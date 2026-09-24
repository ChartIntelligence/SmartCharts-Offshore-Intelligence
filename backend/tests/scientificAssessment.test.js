import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {readFileSync} from 'node:fs';
import {fixture} from './fixtures/scientificAssessmentFixture.js';
import {resolveScientificAssessmentV1,requireScientificAssessmentV1,scientificAgeHoursV1,reassessCurrentAgeV1,SCIENTIFIC_ASSESSMENT_V1,SCHEDULED_ASSESSMENT_V1} from '../scientificAssessment.mjs';
import {buildUnifiedSpeciesOpportunityInterpretationV1,resolveUnifiedOpportunityRankingInputV1,assessSstTransitionConfidence,getAgeHours,getMoonConditions,getChlorophyllConditions,getGapFilledChlorophyllConditions,getCachedCurrentConditionsPoint,getCurrentSpatialStructure,evaluateUnifiedOpportunityOceanConditionsV1,filterUnifiedOpportunityCandidatesByCaptainContextV1} from '../server.js';
const early='2026-09-24T01:00:00.000Z',late='2026-09-27T01:00:00.000Z';
const context=at=>({contractVersion:SCIENTIFIC_ASSESSMENT_V1,assessmentAt:at});
const interpret=(f,assessment)=>buildUnifiedSpeciesOpportunityInterpretationV1({candidate:f.candidate,oceanConditions:f.ocean,species:'blue-marlin',assessment});
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
test('checkpoint implicit output exactly equals new explicit output at same captured clock',t=>{t.mock.method(Date,'now',()=>Date.parse(early));const f=fixture();assert.equal(hash(interpret(f,context(early))),'4474b759ddd3e981ee95a3ee4c9b9319816877ca6f4f1478bfbeb62345f41135');assert.deepEqual(interpret(f),interpret(f,context(early)));});
test('Sep24 explicit assessment replays identically Sep27, changed assessment is governed reassessment',t=>{
 const clock=t.mock.method(Date,'now',()=>Date.parse(early)),f=fixture(),before=hash(f),a=interpret(f,context(early));clock.mock.mockImplementation(()=>Date.parse(late));const b=interpret(f,context(early)),c=interpret(f,context(late));assert.deepEqual(a,b);assert.equal(a.negativeConclusionAdequacy.adequate,true);assert.equal(c.negativeConclusionAdequacy.adequate,false);assert.equal(hash(f),before);
 const fields=['candidate','species','speciesOpportunity','intelligenceSource','negativeConclusionAdequacy'];
 const matrix=fields.map(field=>({field,replay:hash(a[field])===hash(b[field])?'EXACT_MATCH':'MISMATCH',reassessment:hash(a[field])===hash(c[field])?'EXACT_MATCH':'EXPECTED_ASSESSMENT_TIME_DIFFERENCE'}));
 assert(matrix.every(x=>x.replay==='EXACT_MATCH'));assert.deepEqual(resolveUnifiedOpportunityRankingInputV1({speciesInterpretation:a}),resolveUnifiedOpportunityRankingInputV1({speciesInterpretation:b}));console.log(JSON.stringify({contractVersion:'pelora-scientific-assessment-equivalence-v1',matrix}));
});
test('default candidate evaluation captures once even as clock advances',t=>{let calls=0;t.mock.method(Date,'now',()=>Date.parse(calls++===0?early:late));const f=fixture(),r=interpret(f);assert.equal(calls,1);assert.equal(r.negativeConclusionAdequacy.adequate,true);});
test('explicit mode never reads scientific wall clock',t=>{t.mock.method(Date,'now',()=>{throw Error('clock forbidden');});assert.equal(interpret(fixture(),context(early)).negativeConclusionAdequacy.adequate,true);});
for(const value of [null,{},[],new Date(early),{contractVersion:'wrong',assessmentAt:early},{contractVersion:SCIENTIFIC_ASSESSMENT_V1},{contractVersion:SCIENTIFIC_ASSESSMENT_V1,assessmentAt:'2026-09-24T01:00:00+00:00'},{contractVersion:SCIENTIFIC_ASSESSMENT_V1,assessmentAt:'2026-09-24T01:00:00.0001Z'},{contractVersion:SCIENTIFIC_ASSESSMENT_V1,assessmentAt:NaN}])test('malformed explicit context fails closed '+JSON.stringify(value),()=>assert.throws(()=>interpret(fixture(),value)));
test('assessment input detached, frozen, accessor/private fields rejected',()=>{const raw=context(early),c=requireScientificAssessmentV1(raw);raw.assessmentAt=late;assert.equal(c.assessmentAt,early);assert(Object.isFrozen(c));let hit=false;Object.defineProperty(raw,'assessmentAt',{get(){hit=true;return early;}});assert.throws(()=>requireScientificAssessmentV1(raw));assert.equal(hit,false);assert.throws(()=>requireScientificAssessmentV1({...context(early),boat:'private'}));assert.throws(()=>requireScientificAssessmentV1(undefined));});
test('scheduled policy accepted without changing cycle semantics',()=>{const c={contractVersion:SCHEDULED_ASSESSMENT_V1,assessmentAt:'2026-09-24T00:00:00Z'};assert.equal(requireScientificAssessmentV1(c).assessmentAt,'2026-09-24T00:00:00.000Z');assert.doesNotThrow(()=>interpret(fixture(),c));});
test('age rounding unchanged, zero age, leap day, invalid and future evidence explicit',()=>{assert.equal(getAgeHours('2026-09-24T00:00:00Z',context(early)),1);assert.equal(getAgeHours(early,context(early)),0);assert.throws(()=>getAgeHours(late,context(early)));assert.equal(getAgeHours('invalid',context(early)),null);assert.equal(scientificAgeHoursV1('2024-02-28T12:00:00Z',context('2024-03-01T12:00:00Z')),48);});
test('SST future evidence rejected before rounding or classification',()=>{assert.throws(()=>assessSstTransitionConfidence({samples:[{temperatureFahrenheit:80,observedAt:late}],sufficientCoverage:false,assessment:context(early)}));});
test('moon algorithm uses supplied instant, never execution time',t=>{const a=getMoonConditions(early);t.mock.method(Date,'now',()=>{throw Error('clock forbidden');});assert.deepEqual(getMoonConditions(early),a);assert.equal(a.observedAt,early);assert.notDeepEqual(getMoonConditions(late),a);assert.throws(()=>getMoonConditions());});
const response=(time='2026-09-24T00:00:00Z')=>({ok:true,json:async()=>({table:{columnNames:['time','latitude','longitude','chlor_a','u_current','v_current'],rows:[[time,25,-90,0.1,0.5,0.2]]}})});
test('chlorophyll direct and gap-filled ages share explicit assessment using mocked retained response',async t=>{t.mock.method(globalThis,'fetch',async()=>response());t.mock.method(Date,'now',()=>Date.parse(late));const a=await getChlorophyllConditions(25,-90,context(early)),b=await getGapFilledChlorophyllConditions(25,-90,context(early));assert.equal(a.ageHours,1);assert.equal(b.ageHours,1);assert.equal(a.observedAt,b.observedAt);assert.equal((await getChlorophyllConditions(25,-90,context(late))).ageHours,73);});
test('cached and in-flight current age recomputed from timestamp for each assessment',async t=>{
 t.mock.method(Date,'now',()=>Date.parse(early));let requests=0;t.mock.method(globalThis,'fetch',async()=>{requests++;return response();});
 const [a,b]=await Promise.all([getCachedCurrentConditionsPoint(25.123,-90,context(early)),getCachedCurrentConditionsPoint(25.123,-90,context(late))]);const c=await getCachedCurrentConditionsPoint(25.123,-90,context(late));assert.equal(requests,1);assert.equal(a.ageHours,1);assert.equal(b.ageHours,73);assert.equal(c.ageHours,73);assert.equal(c.cache.status,'hit');assert.equal(a.observedAt,c.observedAt);assert.equal(a.speedKnots,c.speedKnots);
});
test('current spatial samples share assessment across changing execution clock',async t=>{let n=0;t.mock.method(Date,'now',()=>Date.parse(early)+n++*1000);t.mock.method(globalThis,'fetch',async()=>response());const r=await getCurrentSpatialStructure(26.123,-91,context(early));assert(r.vectors.length>0);assert(r.vectors.every(x=>x.ageHours===1));});
test('timestamp-less available cached current stops rather than fabricates age',()=>assert.throws(()=>reassessCurrentAgeV1({source:{availability:'available'},ageHours:1},context(early))));
test('multi-candidate outer composition captures once despite advancing callback clock',async t=>{
 let calls=0;t.mock.method(Date,'now',()=>Date.parse(calls++===0?early:late));const f=fixture(),seen=[];
 const r=await evaluateUnifiedOpportunityOceanConditionsV1({candidates:[f.candidate,{...f.candidate,id:'synthetic-second'}],maximumCandidates:2,concurrency:1,oceanConditionsProvider:async(_lat,_lon,options)=>{seen.push(options.assessment.assessmentAt);return f.ocean;}});assert.equal(calls,1);assert.deepEqual(seen,[early,early]);assert.equal(r.available,true);
});
test('same explicit time preserves scientific interpretation across captain projection contexts',()=>{const f=fixture(),a=interpret(f,context(early));for(const origin of [[20,-90],[28,-85]])for(const range of [20,80,200]){filterUnifiedOpportunityCandidatesByCaptainContextV1({candidates:[f.candidate],originCoordinates:origin,operatingRangeNm:range,explorationMode:'within-range'});assert.deepEqual(interpret(f,context(early)),a);}});
test('unsupported species remains unavailable',()=>{const f=fixture();assert.equal(buildUnifiedSpeciesOpportunityInterpretationV1({candidate:f.candidate,oceanConditions:f.ocean,species:'wahoo',assessment:context(early)}).available,false);});
test('HTTP and history clocks remain separate; no client assessment selector',()=>{const s=readFileSync(new URL('../server.js',import.meta.url),'utf8');const routes=s.slice(s.indexOf('export function createPeloraServer'));assert(!/searchParams\.get\(["']assessment/.test(routes));assert(!/headers\[["']assessment/.test(routes));const start=s.indexOf('export function buildGovernedOpportunityEvidenceAccumulationV1'),end=s.indexOf('export function rankDynamic',start);assert(!/Date\.now\(\)|new Date\(\)/.test(s.slice(start,end)));});
test('nonzero score/confidence and failed gate exactly match checkpoint science',t=>{
 t.mock.method(Date,'now',()=>Date.parse(late));const f=structuredClone(fixture());
 f.ocean.blueMarlinHabitat={confidence:{score:64,level:'Moderate',components:{confidenceAdjustedSuitability:{score:41}}},limitations:['test-only']};f.ocean.oceanOpportunity={pathwayClassification:{classification:'open-water'}};
 const r=interpret(f,context(early));assert.equal(hash(r),'d0ab89dfff546738366eade0010580aeecdb8294401a147ae7865e350e33e910');assert.equal(r.speciesOpportunity.score,41);assert.equal(r.speciesOpportunity.confidence.score,64);assert.equal(resolveUnifiedOpportunityRankingInputV1({speciesInterpretation:r}).eligibleForRanking,false);
});
import {cycleV2,assessmentContextV2,hash as contentHash} from '../../shared/oceanPublication.mjs';
test('checkpointed publication context reaches each real interpretation call offline',async t=>{
 const f=fixture(),cycle=cycleV2({scheduledAt:'2026-09-24T04:00:00Z',region:{id:'test-region',version:'1'},configuration:{id:'test',version:'2',governanceReference:'test-only',evaluatorVersion:'pelora-blue-marlin-explicit-assessment-v1',candidateUniverseVersion:'1',species:['blue-marlin'],families:['SST'],candidateUniverse:{reference:{kind:'captured',referenceId:'fixture',contractVersion:'synthetic-v1',sha256:contentHash('fixture')},candidateIds:[f.candidate.id]}}});
 const assessment=assessmentContextV2(cycle),seen=[];t.mock.method(Date,'now',()=>{throw Error('scientific clock forbidden');});
 await evaluateUnifiedOpportunityOceanConditionsV1({candidates:[f.candidate],assessment,oceanConditionsProvider:async(_lat,_lon,options)=>{seen.push(options.assessment.assessmentAt);assert.deepEqual(interpret(f,options.assessment),interpret(f,assessment));return f.ocean;}});assert.deepEqual(seen,[cycle.scheduledAt]);
});

import {EventEmitter} from 'node:events';
import {createPeloraServer} from '../server.js';
async function httpStyle(server,url,{method='GET',headers={},body={}}={}){
 const req=Object.assign(new EventEmitter(),{method,url,headers:{host:'localhost',...headers},body});
 const res=new EventEmitter();let status,payload;res.writeHead=code=>{status=code;};res.end=value=>{payload=value?JSON.parse(value):null;};
 await server.listeners('request')[0](req,res);return {status,payload};
}
test('actual HTTP parsing ignores client assessment query/header/cookie/body/environment',async t=>{
 t.mock.method(Date,'now',()=>Date.parse(early));const f=fixture(),seen=[];
 const previous=process.env.PELORA_ASSESSMENT_AT;process.env.PELORA_ASSESSMENT_AT=late;t.after(()=>{if(previous===undefined)delete process.env.PELORA_ASSESSMENT_AT;else process.env.PELORA_ASSESSMENT_AT=previous;});
 const server=createPeloraServer({persistenceConfigurationProvider:()=>({configured:false}),oceanConditionsProvider:async(lat,lon,options)=>{
 assert.deepEqual(Object.keys(options),['bearerToken']);seen.push(options);return {science:interpret(f)};
 }});
 const base='/api/ocean?lat=25&lon=-90';const normal=await httpStyle(server,base);
 assert.equal(normal.status,200);
 for(const suffix of ['&assessmentAt='+late,'&assessment_at='+late,'&assessmentAt='+late+'&assessmentAt='+early,'&assessment='+encodeURIComponent(JSON.stringify(context(late)))]){
 const result=await httpStyle(server,base+suffix,{headers:{assessmentAt:late,'x-assessment-at':late,cookie:'assessmentAt='+late},body:{assessmentAt:late,assessment:context(late)}});assert.deepEqual(result,normal);
 }
 assert.equal(seen.length,5);assert.equal(normal.payload.science.negativeConclusionAdequacy.adequate,true);
 assert.equal((await httpStyle(server,base,{method:'POST',body:{assessmentAt:late}})).status,404);
 assert.equal((await httpStyle(server,'/api/ocean?lat=0&lon=0')).status,400);
 assert.equal((await httpStyle(server,'/api/health')).status,200);
});
test('legacy field statuses and cancellation unchanged using actual handler',async()=>{
 const server=createPeloraServer({persistenceConfigurationProvider:()=>{throw Error('Auth forbidden');}});
 assert.equal((await httpStyle(server,'/api/ocean/field?mode=scalar')).status,404);
 assert.equal((await httpStyle(server,'/api/ocean/field?mode=unknown')).status,400);
 assert.equal((await httpStyle(server,'/api/ocean/field?layer=unknown&bbox=-90,24,-85,28')).status,400);
 let signal;const cancellable=createPeloraServer({scalarFieldRuntime:async(_p,s)=>{signal=s;await Promise.resolve();return {statusCode:200,body:{test:true}};}});
 const req=Object.assign(new EventEmitter(),{method:'GET',url:'/api/ocean/field?mode=scalar',headers:{host:'localhost'}});const res=new EventEmitter();let wrote=false;res.writeHead=()=>{wrote=true;};res.end=()=>{};
 const pending=cancellable.listeners('request')[0](req,res);req.emit('aborted');await pending;assert.equal(signal.aborted,true);assert.equal(wrote,false);
});
for(const mode of ['omitted','null','wrong','different-time','removed'])test('nested context '+mode+' cannot fall back or change assessment',async t=>{
 let clock=0;t.mock.method(Date,'now',()=>{clock++;return Date.parse(late);});const f=fixture();let rejected=false;
 await evaluateUnifiedOpportunityOceanConditionsV1({candidates:[f.candidate],assessment:context(early),oceanConditionsProvider:async(_lat,_lon,options)=>{
 let nested=options.assessment;if(mode==='omitted'||mode==='removed')nested=undefined;if(mode==='null')nested=null;if(mode==='wrong')nested={...nested,contractVersion:'wrong'};if(mode==='different-time')nested=context(late);
 assert.throws(()=>interpret(f,nested));rejected=true;return f.ocean;
 }});assert.equal(rejected,true);assert.equal(clock,0);
});
test('concurrent root assessments remain isolated',async t=>{
 t.mock.method(Date,'now',()=>{throw Error('scientific clock forbidden');});const f=fixture();const results=await Promise.all([early,late].map(at=>evaluateUnifiedOpportunityOceanConditionsV1({candidates:[f.candidate],assessment:context(at),oceanConditionsProvider:async(_a,_b,options)=>{await Promise.resolve();assert.equal(options.assessment.assessmentAt,at);interpret(f,options.assessment);return f.ocean;}})));assert(results.every(r=>r.available));
});
test('multi-candidate multi-family capture diagnostic consumes one scheduled instant',async t=>{
 const f=fixture(),seen=[],urls=[];let ticks=0;t.mock.method(Date,'now',()=>Date.parse(late)+ticks++*86400000);
 t.mock.method(globalThis,'fetch',async(url,options)=>{urls.push({url:String(url),options});return response();});
 const assessment={contractVersion:SCHEDULED_ASSESSMENT_V1,assessmentAt:early};
 await evaluateUnifiedOpportunityOceanConditionsV1({candidates:[f.candidate,{...f.candidate,id:'test-second'},{...f.candidate,id:'test-third'}],maximumCandidates:3,assessment,oceanConditionsProvider:async(_lat,_lon,options)=>{
 const c=options.assessment;const sst=assessSstTransitionConfidence({samples:f.ocean.sst.derived.spatialStructure.samples,sufficientCoverage:false,assessment:c});const direct=await getChlorophyllConditions(25,-90,c),gap=await getGapFilledChlorophyllConditions(25,-90,c),current=await getCachedCurrentConditionsPoint(25.781,-90,c),moon=getMoonConditions(c.assessmentAt);
 assert.equal(sst.sampleAgeHours,1);assert.equal(direct.ageHours,1);assert.equal(gap.ageHours,1);assert.equal(current.ageHours,1);assert.equal(moon.observedAt,early);
 seen.push({assessmentAt:c.assessmentAt,sst:sst.sampleAgeHours,direct:direct.ageHours,gap:gap.ageHours,current:current.ageHours,moon:moon.observedAt});return f.ocean;
 }});assert.equal(seen.length,3);assert(seen.every(x=>x.assessmentAt===early));
 for(const item of urls){assert(!/assessment|2026-09-24|2026-09-27/.test(item.url));assert(!JSON.stringify(item.options??{}).includes('assessment'));}
 console.log(JSON.stringify({classification:'EXACT_MATCH',diagnostic:'multi-family-explicit-consumption',candidates:seen}));
});
for(const time of ['2026-09-24T01:00:00.001Z',late])test('raw future timestamp rejected before age rounding '+time,async t=>{
 t.mock.method(globalThis,'fetch',async()=>response(time));assert.throws(()=>getAgeHours(time,context(early)));assert.throws(()=>assessSstTransitionConfidence({samples:[{temperatureFahrenheit:80,observedAt:time}],sufficientCoverage:false,assessment:context(early)}));
 await assert.rejects(getChlorophyllConditions(25,-90,context(early)));await assert.rejects(getGapFilledChlorophyllConditions(25,-90,context(early)));await assert.rejects(getCachedCurrentConditionsPoint(24.777,-92,context(early)));
});
test('original context mutation during await cannot change detached scientific input',async()=>{
 const original=context(early),f=fixture();await evaluateUnifiedOpportunityOceanConditionsV1({candidates:[f.candidate],assessment:original,oceanConditionsProvider:async(_a,_b,options)=>{original.assessmentAt=late;original.contractVersion='changed';await Promise.resolve();assert.equal(options.assessment.assessmentAt,early);assert.throws(()=>{options.assessment.assessmentAt=late;});assert.equal(interpret(f,options.assessment).negativeConclusionAdequacy.adequate,true);return f.ocean;}});
});
import {withScientificAssessmentV1} from '../scientificAssessment.mjs';
test('moon cannot substitute a different instant inside an active assessment',()=>{
 withScientificAssessmentV1(context(early),()=>{assert.equal(getMoonConditions(early).observedAt,early);assert.throws(()=>getMoonConditions(late));assert.throws(()=>getMoonConditions());});
});

test('outer assessment accessors and inherited options fail without invoking getter',()=>{
 const f=fixture();let invoked=false;const accessor={candidate:f.candidate,oceanConditions:f.ocean,species:'blue-marlin'};
 Object.defineProperty(accessor,'assessment',{enumerable:true,get(){invoked=true;return context(early);}});
 assert.throws(()=>buildUnifiedSpeciesOpportunityInterpretationV1(accessor));assert.equal(invoked,false);
 const inherited=Object.assign(Object.create({assessment:context(early)}),{candidate:f.candidate,oceanConditions:f.ocean,species:'blue-marlin'});
 assert.throws(()=>buildUnifiedSpeciesOpportunityInterpretationV1(inherited));
});
