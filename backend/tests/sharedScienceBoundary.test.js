// Historical Task 12B diagnostic. Task 12B.1 preserves distinct default request assessments.
// Ocean-condition values are synthetic; candidate geometry and retained bathymetry
// come from the repository catalog. No provider, history store or Auth calls.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {buildUnifiedOpportunityCandidateSourceUniverseV1,
  evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1, BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE,
  filterUnifiedOpportunityCandidatesByCaptainContextV1, selectCaptainRangeStableGulfCandidatesV1,
  selectDistributedGulfCandidatesV1, GULF_EVALUATION_CONTROL_V1, kilometersBetween,
  assessOceanEvidence, buildCurrentVectorProjectionAnalysis, buildCurrentGradientAnalysis,
  buildUnifiedSpeciesOpportunityInterpretationV1, resolveUnifiedOpportunityRankingInputV1,
  rankUnifiedSpeciesOpportunitiesV1, evaluateUnifiedOpenWaterOceanConditionsV1} from '../server.js';

const sourceTime='2026-09-24T00:00:00Z';
const atOneHour=Date.parse('2026-09-24T01:00:00Z');
const atSeventyThreeHours=Date.parse('2026-09-27T01:00:00Z');
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const frozen=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(frozen);Object.freeze(v);}return v;};
function fixture(){
  const raw=buildUnifiedOpportunityCandidateSourceUniverseV1().candidates[0];
  const candidate={...raw,eligibility:evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1({candidate:raw,speciesProfile:BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE})};
  const source={provider:'SYNTHETIC-12B',availability:'available',classification:'forecast-model',observationType:'direct-satellite'};
  const [latitude,longitude]=candidate.coordinates;
  const samples=['north','east','south','west'].map((direction,i)=>({direction,
    requestedLatitude:latitude+(i===0?0.2:i===2?-0.2:0),requestedLongitude:longitude+(i===1?0.2:i===3?-0.2:0),
    resolvedLatitude:latitude,resolvedLongitude:longitude,observedAt:sourceTime,ageHours:1,source,
    temperatureFahrenheit:80,speedKnots:1,directionDegrees:90,eastwardMetersPerSecond:0.5,northwardMetersPerSecond:0}));
  const spatial={available:true,sufficientCoverage:true,coverage:'complete',validSampleCount:4,vectors:samples};
  const gradient=buildCurrentGradientAnalysis(buildCurrentVectorProjectionAnalysis(spatial));
  const ocean={observedAt:sourceTime,
    sst:{temperatureFahrenheit:80,derived:{spatialStructure:{thresholdVersion:'pelora-sst-spatial-range-v1',coverage:'sufficient',classification:'uniform-water',validNeighborCount:4,samples}}},
    currents:{...samples[0],derived:{spatialAnalysis:{available:true,spatialStructure:spatial,gradient}}},
    chlorophyll:{concentrationMgM3:0.1,ageHours:1,observedAt:sourceTime,source},
    dataQuality:{layers:{chlorophyll:{state:'live'}}}};
  ocean.oceanEvidence=assessOceanEvidence({latitude,longitude,...ocean});
  return frozen({candidate,ocean});
}
const interpret=f=>buildUnifiedSpeciesOpportunityInterpretationV1({candidate:f.candidate,oceanConditions:f.ocean,species:'blue-marlin'});

test('historical baseline: separate default assessments change adequacy with time',t=>{
  const clock=t.mock.method(Date,'now',()=>atOneHour);
  const f=fixture(),before=hash(f),first=interpret(f);
  clock.mock.mockImplementation(()=>atSeventyThreeHours);
  const replay=interpret(f);
  assert.equal(hash(f),before,'No fixture value, timestamp, status, age or mask changed');
  assert.equal(first.negativeConclusionAdequacy.adequate,true);
  assert.equal(replay.negativeConclusionAdequacy.adequate,false);
  assert.equal(first.negativeConclusionAdequacy.predicates.thermalStructure,true);
  assert.equal(replay.negativeConclusionAdequacy.predicates.thermalStructure,false);
  const fields=['candidate','species','speciesOpportunity','intelligenceSource','negativeConclusionAdequacy'];
  const matrix=fields.map(field=>({field,classification:hash(first[field])===hash(replay[field])?'EXACT_MATCH':'EXPECTED_ASSESSMENT_TIME_DIFFERENCE',beforeDigest:hash(first[field]),afterDigest:hash(replay[field])}));
  assert.equal(matrix.filter(x=>x.classification==='EXPECTED_ASSESSMENT_TIME_DIFFERENCE').length,1);
  console.log(JSON.stringify({contractVersion:'pelora-12b-boundary-diagnostic-v1',verdict:'DEFAULT_REQUEST_REASSESSMENT_PRESERVED',
    comparison:'existing-governed-function-frozen-input-replay-not-an-adapter-equivalence-pass',
    sourceTime,inputDigest:before,clockA:new Date(atOneHour).toISOString(),clockB:new Date(atSeventyThreeHours).toISOString(),matrix}));
});

test('same clock and captured ocean: existing callback boundary matches direct composition exactly',async t=>{
  t.mock.method(Date,'now',()=>atOneHour);const f=fixture();let calls=0;
  const captured=await evaluateUnifiedOpenWaterOceanConditionsV1({candidate:f.candidate,oceanConditionsProvider:async(lat,lon,options)=>{
    calls++;assert.deepEqual([lat,lon],f.candidate.coordinates);assert.equal(options.bearerToken,null);return f.ocean;
  }});
  const current=buildUnifiedSpeciesOpportunityInterpretationV1({candidate:f.candidate,oceanConditions:captured.oceanConditions,species:'blue-marlin'});
  assert.deepEqual(current,interpret(f));assert.equal(calls,1);
  // A local retained-object callback only; this proves a narrow seam, not upstream science equivalence.
});

test('synthetic origins/ranges change inclusion, not the same candidate interpretation',t=>{
  t.mock.method(Date,'now',()=>atOneHour);const f=fixture(),science=interpret(f),digest=hash(science);
  const [lat,lon]=f.candidate.coordinates;
  const contexts=[{originCoordinates:[lat+0.1,lon],operatingRangeNm:20},{originCoordinates:[lat+1,lon],operatingRangeNm:80},{originCoordinates:[lat+3,lon],operatingRangeNm:100}];
  const included=contexts.map(context=>{
    const result=filterUnifiedOpportunityCandidatesByCaptainContextV1({candidates:[f.candidate],explorationMode:'within-range',...context});
    assert.equal(hash(interpret(f)),digest);return result.candidates.length===1;
  });
  assert.deepEqual(included,[true,true,false]);
});

test('existing range uses inclusive exact backend distance boundary',t=>{
  t.mock.method(Date,'now',()=>atOneHour);const f=fixture(),origin=[20,-94];
  const distance=kilometersBetween(...origin,...f.candidate.coordinates)/1.852;
  const include=range=>filterUnifiedOpportunityCandidatesByCaptainContextV1({candidates:[f.candidate],originCoordinates:origin,operatingRangeNm:range,explorationMode:'within-range'}).candidates.length;
  assert.equal(include(distance),1);assert.equal(include(distance-0.000001),0);assert.equal(include(distance+0.000001),1);
});

test('catalog is declared before context, but current cap prevents full shared evaluation',()=>{
  const universe=buildUnifiedOpportunityCandidateSourceUniverseV1();
  const eligible=universe.candidates.filter(candidate=>evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1({candidate,speciesProfile:BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE}).eligible===true);
  const maximum=GULF_EVALUATION_CONTROL_V1.maximumCandidates;
  const near=selectCaptainRangeStableGulfCandidatesV1({candidates:eligible,originCoordinates:[19,-94]});
  const far=selectCaptainRangeStableGulfCandidatesV1({candidates:eligible,originCoordinates:[29,-85]});
  const distributed=selectDistributedGulfCandidatesV1({candidates:eligible});
  assert(eligible.length>maximum);assert.equal(near.length,maximum);assert.equal(distributed.length,maximum);assert.notDeepEqual(near.map(x=>x.id),far.map(x=>x.id));
  console.log(JSON.stringify({catalogCandidates:universe.candidates.length,habitatEligible:eligible.length,preEvaluationCap:maximum,classification:'EXPECTED_PROJECTION_DIFFERENCE',sharedUniverseIsNotCurrentCappedCohort:true}));
});

test('ranking ties retain input order; distance relevance must be handled in projection',()=>{
  const opportunity=id=>({available:true,candidate:{id},species:'blue-marlin',speciesOpportunity:{available:true,location:{id},score:0,confidence:{score:50},eligibility:{eligibleForRanking:true}}});
  const a=opportunity('a'),b=opportunity('b'),blocked=opportunity('blocked');blocked.speciesOpportunity.score=999;blocked.speciesOpportunity.eligibility.eligibleForRanking=false;
  const rank=items=>rankUnifiedSpeciesOpportunitiesV1({speciesInterpretations:items,species:'blue-marlin'}).rankedOpportunities.map(x=>x.location.id);
  assert.deepEqual(rank([a,b,blocked]),['a','b']);assert.deepEqual(rank([b,a,blocked]),['b','a']);
  assert.equal(resolveUnifiedOpportunityRankingInputV1({speciesInterpretation:blocked}).eligibleForRanking,false);
});

test('missing habitat and unsupported species do not receive affirmative ranking',t=>{
  t.mock.method(Date,'now',()=>atOneHour);const f=fixture();assert.equal(resolveUnifiedOpportunityRankingInputV1({speciesInterpretation:interpret(f)}).eligibleForRanking,false);
  for(const species of ['yellowfin-tuna','blackfin-tuna','mahi','sailfish','white-marlin','wahoo','unknown','']){
    const p=buildUnifiedSpeciesOpportunityInterpretationV1({candidate:f.candidate,oceanConditions:f.ocean,species});assert.equal(p.available,false);assert.equal(resolveUnifiedOpportunityRankingInputV1({speciesInterpretation:p}).eligibleForRanking,false);
  }
  // Removing waterMask alone still permits the existing retained-grid resolver.
  const candidate={id:'synthetic-unresolved',coordinates:[0,0],candidateClass:'location'};
  assert.notEqual(evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1({candidate,speciesProfile:BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE}).eligible,true);
});

test('history dependency remains; default-clock diagnostic is distinct from explicit replay',()=>{
  const source=readFileSync(new URL('../server.js',import.meta.url),'utf8');
  const confidence=source.slice(source.indexOf('function assessSstTransitionConfidence('),source.indexOf('function assessSstTransitionConfidence(')+4000);
  assert(confidence.includes('Date.parse(assessment.assessmentAt)'));
  assert(!confidence.includes('Date.now()')); // Task 12B.1 explicit seam; default calls still reassess now.
  const start=source.indexOf('async function getOceanConditionsAtAssessment(');assert(start>=0);
  const runtime=source.slice(source.indexOf('  const oceanMemoryRowRetrieval =',start));
  assert(runtime.includes('normalizedBearerToken'));assert(runtime.includes('buildOceanPersistence({'));assert(runtime.includes('assessOceanOpportunity({'));
});

test('diagnostic timings distinguish captured interpretation from relevance filtering only',t=>{
  t.mock.method(Date,'now',()=>atOneHour);const f=fixture(),before=hash(f);
  const start=performance.now();for(let i=0;i<100;i++)interpret(f);const interpretationMs=performance.now()-start;
  const projected=performance.now();for(let i=0;i<100;i++)filterUnifiedOpportunityCandidatesByCaptainContextV1({candidates:[f.candidate],originCoordinates:[20,-94],operatingRangeNm:80,explorationMode:'within-range'});
  console.log(JSON.stringify({iterations:100,capturedInterpretationMs:interpretationMs,relevanceFilterMs:performance.now()-projected,scope:'one-candidate-diagnostic-not-shared-pipeline-or-completed-publication-projection'}));
  assert.equal(hash(f),before);
});
