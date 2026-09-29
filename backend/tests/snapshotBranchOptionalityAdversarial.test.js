// Reproduce a qualification STOP, not broaden scientific or projection authority.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parsed,currentSupport} from './fixtures/marineAssessorCompanionFixture.mjs';
import {spatialCorpus,composite} from './fixtures/candidateSemanticFixture.mjs';
import {startSourceCoverage,coverageMatrix,functions,sourcePredicates} from './fixtures/snapshotProducerBranchAuditV2.mjs';
const file=p=>new URL('../../'+p,import.meta.url);
const source=readFileSync(file('backend/server.js'),'utf8');
const review=JSON.parse(readFileSync(file('docs/Candidate_Snapshot_Branch_Optionality_Review_v1.json')));
const target='buildSurfaceWaterCharacterAnalysis:232417:232423';
let baseline,missing,coverage;

// Exact observational fixture-domain predicate. It is deliberately NOT a
// production validator: the attack demonstrates production permits its negation.
function fixtureDomain(ocean){return ocean.chlorophyll.concentrationMgM3===0.1;}
async function produce(t,noChlorophyll){
 const marine=await parsed(t),support=currentSupport(marine);
 const adapter={mock:{method(object,key){
  assert.equal(object,globalThis);assert.equal(key,'fetch');
  return t.mock.method(object,key,async url=>{
   const u=new URL(url),isMarine=u.hostname==='marine-api.open-meteo.com';
   const payload=isMarine?{latitude:Number(u.searchParams.get('latitude')),longitude:Number(u.searchParams.get('longitude')),current:{time:'2026-09-24T00:00:00Z',sea_surface_temperature:25}}:
    {table:{columnNames:['time','latitude','longitude','chlor_a','u_current','v_current'],rows:noChlorophyll&&decodeURIComponent(String(url)).includes('chlor_a')?[]:[['2026-09-24T00:00:00Z',25,-90,0.1,0.5,0.2]]}};
   assert(isMarine||u.hostname.endsWith('noaa.gov'));
   return {ok:true,json:async()=>structuredClone(payload)};
  });
 }}};
 const ocean=await spatialCorpus(adapter);
 // Keep caller location consistent with the committed corpus's actual queries.
 // The old -91 literal was itself fixture-only, not a production invariant.
 return {ocean,candidate:composite({...marine,location:{latitude:25,longitude:-90}},support,{ocean})};
}

test('actual parser accepts missing chlorophyll and reaches a claimed caller-contract exclusion',async t=>{
 const clock=t.mock.method(Date,'now',()=>Date.parse('2035-01-01T00:00:00Z'));
 const profiler=await startSourceCoverage();
 try{
  baseline=await produce(t,false);await profiler.collect('finite-chlorophyll-control');
  missing=await produce(t,true);await profiler.collect('fulfilled-no-valid-chlorophyll-pixel');
 }finally{coverage=coverageMatrix(await profiler.stop());clock.mock.restore();}
 assert(fixtureDomain(baseline.ocean));assert(!fixtureDomain(missing.ocean));
 assert.equal(missing.ocean.chlorophyll.concentrationMgM3,null);
 assert.equal(missing.ocean.chlorophyll.source.availability,'no-valid-pixel');
 assert.equal(baseline.candidate.oceanEvidence.groups.productivity.available,true);
 assert.equal(missing.candidate.oceanEvidence.groups.productivity.available,false);
 assert.equal(missing.candidate.observationSnapshot.available,true);
 const disposition=review.ranges.find(r=>r.id===target);
 assert.equal(disposition.disposition,'UNREACHABLE_CALLER_CONTRACT');
 const executed=coverage.find(r=>r.id===target);assert(executed);
 assert(executed.scenarios.includes('fulfilled-no-valid-chlorophyll-pixel'));
 assert(!executed.scenarios.includes('finite-chlorophyll-control'));
 console.log('FALSE_CALLER_EXCLUSION',JSON.stringify({id:target,line:disposition.line,scenarios:executed.scenarios,sourceAvailability:missing.ocean.chlorophyll.source.availability}));
});

test('fixed chlorophyll/current values originate in the test transport, not production validation',()=>{
 const fixture=readFileSync(file('backend/tests/fixtures/snapshotProducerQualificationV2Fixture.mjs'),'utf8');
 assert(fixture.includes("25,-90,0.1,0.5,0.2"));
 const start=source.indexOf('async function getChlorophyllConditionsAtAssessment('),end=source.indexOf('const row =',start);
 const parser=source.slice(start,end);
 assert(parser.includes('rows.length === 0'));assert(parser.includes('concentrationMgM3: null'));assert(parser.includes('"no-valid-pixel"'));
 // A conditional test domain is legitimate as an experiment, but cannot prove
 // a code-enforced production caller exclusion. This task requires that distinction.
});

test('313 ranges are exact prior unexecuted coverage intervals, not a complete source-predicate inventory',()=>{
 const ranges=review.ranges;
 assert.equal(ranges.length,313);assert.equal(new Set(ranges.map(r=>r.id)).size,313);
 for(const r of ranges)assert.equal(source.slice(r.start,r.end),r.source,r.id);
 assert(!functions.some(f=>f.name==='getOceanConditionsAtAssessment'));
 const route=source.indexOf('async function getOceanConditionsAtAssessment(');
 const fallback=source.indexOf('const sstSpatial =',route);
 const rejected=source.indexOf('"spatial-sampling-unavailable"',fallback);
 assert(route>=0&&fallback>route&&rejected>fallback);
 assert(!ranges.some(r=>r.start<=rejected&&r.end>rejected));
 assert(!sourcePredicates().some(p=>p.producer==='getOceanConditionsAtAssessment'));
 // The real caller has a rejected-assembly fallback with samples: [], without
 // orientation/confidence. The fixed harness invokes the successful assembler
 // directly. The omitted caller branch needs separate reachability review.
 assert(source.slice(fallback,rejected).includes('samples: []'));
});

test('protected historical artifacts and drafts remain byte-identical',()=>{
 const guard=JSON.parse(readFileSync(file('docs/Candidate_Snapshot_Branch_Review_Preservation_v1.json')));
 assert.equal(guard.files.length,21);
 for(const entry of guard.files)assert.equal(createHash('sha256').update(readFileSync(file(entry.path))).digest('hex'),entry.before,entry.path);
});
