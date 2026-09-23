import assert from "node:assert/strict";
import {buildGovernedOpportunityEvaluationStateV1, translateOpportunityEvaluationNarrativeV1} from "../opportunityEvaluationState.js";
import {buildCandidateNegativeConclusionAdequacyV1, assessOceanEvidence,
  buildCurrentVectorProjectionAnalysis, buildCurrentGradientAnalysis,
  buildUnifiedSpeciesOpportunityInterpretationV1, buildUnifiedCaptainOpportunityDeliveryV1} from "../server.js";

const now = new Date().toISOString();
const candidate = {id:"cohort-test", coordinates:[28,-88], eligibility:{eligible:true}};
const source = {provider:"fixture", availability:"available", classification:"forecast-model", observationType:"direct-satellite"};
const samples = ["north","east","south","west"].map((direction,i)=>({direction,
  requestedLatitude:28+(i===0?0.2:i===2?-0.2:0), requestedLongitude:-88+(i===1?0.2:i===3?-0.2:0),
  resolvedLatitude:28, resolvedLongitude:-88, observedAt:now, ageHours:1, source,
  temperatureFahrenheit:80, speedKnots:1, directionDegrees:90, eastwardMetersPerSecond:0.5, northwardMetersPerSecond:0}));
const spatial = {available:true,sufficientCoverage:true,coverage:"complete",validSampleCount:4,vectors:samples};
const vectorProjection = buildCurrentVectorProjectionAnalysis(spatial);
const gradient = buildCurrentGradientAnalysis(vectorProjection);
assert.equal(gradient.available,true);
const ocean = {
  sst:{temperatureFahrenheit:80, derived:{spatialStructure:{thresholdVersion:"pelora-sst-spatial-range-v1",
    coverage:"sufficient",classification:"uniform-water",validNeighborCount:4,samples}}},
  currents:{...samples[0],derived:{spatialAnalysis:{available:true,spatialStructure:spatial,gradient}}},
  chlorophyll:{concentrationMgM3:0.1,ageHours:1,observedAt:now,source},
  dataQuality:{layers:{chlorophyll:{state:"live"}}}
};
ocean.oceanEvidence=assessOceanEvidence({latitude:28,longitude:-88,...ocean});
const adequacy = value => buildCandidateNegativeConclusionAdequacyV1({candidate,oceanConditions:value});
assert.equal(adequacy(ocean).adequate,true,"Observed uniform conditions can be adequate without a positive feature");
for (const mutate of [
  value=>{value.sst.derived.spatialStructure.coverage="insufficient";},
  value=>{value.sst.derived.spatialStructure=null;},
  value=>{value.sst.derived.spatialStructure.samples={};},
  value=>{value.sst.derived.spatialStructure.samples[0].observedAt="2000-01-01T00:00:00Z";},
  value=>{value.currents.ageHours=80;},
  value=>{value.oceanEvidence.groups.current.spatialAnalysis=null;},
  value=>{value.oceanEvidence.groups.current.spatialAnalysis.spatialStructure.vectors={};},
  value=>{value.oceanEvidence.groups.current.spatialAnalysis.gradient.available=false;},
  value=>{value.oceanEvidence.groups.current.spatialAnalysis.spatialStructure.vectors[0].ageHours=80;},
  value=>{value.oceanEvidence.groups.productivity.values.freshness="stale";},
  value=>{value.dataQuality.layers.chlorophyll.state="stale";},
  value=>{value.dataQuality.layers.chlorophyll.state="degraded";},
  value=>{value.dataQuality=null;},
  value=>{value.chlorophyll.source.availability="provider-unavailable";},
  value=>{value.chlorophyll=null;}
]) {const value=structuredClone(ocean);mutate(value);assert.equal(adequacy(value).adequate,false);}
assert.equal(buildCandidateNegativeConclusionAdequacyV1({candidate:{...candidate,eligibility:{eligible:null}},oceanConditions:ocean}).adequate,false);
for (const candidateClass of ["open-water", "physical-structure"]) {
  assert.equal(buildCandidateNegativeConclusionAdequacyV1({candidate:{...candidate,candidateClass},oceanConditions:ocean}).adequate,true);
  assert.equal(buildCandidateNegativeConclusionAdequacyV1({candidate:{...candidate,candidateClass},oceanConditions:{...ocean,chlorophyll:null}}).adequate,false);
}
const reconstructed = structuredClone(ocean);
reconstructed.chlorophyll.source.observationType = "gap-filled-reconstruction";
assert.equal(adequacy(reconstructed).adequate,true,"Current governed reconstruction remains usable");
console.log("PASS negative adequacy reuses spatial coverage, freshness and provenance; uniform observations allowed");

function cohort(entries) {
  const candidates=entries.map((_,i)=>({...candidate,id:"candidate-"+i}));
  const results=entries.map((entry,i)=> {
    if(entry==="failed")return {status:"rejected",candidate:candidates[i],reason:"test-provider-failure"};
    const value=buildUnifiedSpeciesOpportunityInterpretationV1({candidate:candidates[i],species:"blue-marlin",
      oceanConditions:{blueMarlinHabitat:{summary:{classification:entry.positive?"limited-preliminary-habitat-support":"insufficient-habitat-evidence"},
        confidence:{score:60,level:"Moderate",components:{confidenceAdjustedSuitability:{score:45}}},
        opportunityTypes:entry.positive?["environmental-transition-zone"]:[],
        relationshipGroups:{thermalStructure:{score:22,classification:"moderate-temperature-transition-supported"},
          waterCharacter:{score:8,classification:"clear-blue-surface-water-observed"}}}}});
    value.negativeConclusionAdequacy={...adequacy(ocean),adequate:entry.adequate};
    return {status:"fulfilled",candidate:candidates[i],value};
  });
  const delivery=buildUnifiedCaptainOpportunityDeliveryV1({species:"blue-marlin",speciesInterpretations:results.filter(r=>r.status==="fulfilled").map(r=>r.value)});
  const original=structuredClone(delivery);
  const state=buildGovernedOpportunityEvaluationStateV1({candidates,results,delivery});
  assert.deepEqual(delivery,original,"Classifier cannot change governance or delivery");
  assert.equal(state.counts.selectedCandidates,state.counts.fulfilledExecutionResults+state.counts.failedExecutionResults);
  assert.equal(state.counts.selectedCandidates,state.counts.adequatelyEvaluatedCandidates+state.counts.unresolvedCandidates);
  return state;
}
assert.equal(cohort([{adequate:true,positive:true}]).state,"available");
assert.equal(cohort([{adequate:true,positive:false}]).state,"governed-zero");
const partialPositive=cohort([{adequate:true,positive:true},"failed"]);
assert.equal(partialPositive.state,"partial");assert.equal(partialPositive.counts.deliveredOpportunities,1);
assert.equal(partialPositive.counts.minimumEvidenceGateApprovedCandidates,1);
assert.equal(partialPositive.counts.rankedOpportunities,1);
assert.equal(cohort([{adequate:true,positive:false},"failed"]).state,"partial");
assert.equal(cohort([{adequate:false,positive:false}]).state,"unavailable");
assert.equal(cohort([{adequate:false,positive:true}]).state,"partial");
assert.equal(cohort(["failed","failed"]).state,"unavailable");
assert.equal(cohort([]).state,"unavailable");
const thrown=buildGovernedOpportunityEvaluationStateV1({failed:true});
assert.equal(thrown.state,"unavailable");assert.ok(Object.values(thrown.counts).every(v=>v===null));
assert.equal(buildGovernedOpportunityEvaluationStateV1({candidates:[candidate],results:[]}).state,"unavailable");
assert.equal(buildGovernedOpportunityEvaluationStateV1({
  candidates: [candidate], results: [{candidate,status:"fulfilled",value:{negativeConclusionAdequacy:adequacy(ocean)}}],
  delivery: {opportunities:[],ranking:{rankingResolutions:[{}]}}
}).state,"unavailable","Unknown delivery counts cannot authorize governed zero");
for (const [approved, ranked, delivered] of [[false,2,2],[true,1,2],[true,1,0]]) {
  assert.throws(() => buildGovernedOpportunityEvaluationStateV1({
    candidates:[candidate],
    results:[{candidate,status:"fulfilled",value:{negativeConclusionAdequacy:adequacy(ocean),
      speciesOpportunity:{eligibility:{eligibleForRanking:approved}}}}],
    delivery:{ranking:{rankingResolutions:[{}],rankedOpportunities:Array.from({length:ranked},()=>({}))},
      opportunities:Array.from({length:delivered},()=>({}))}
  }), /governed-evaluation-delivery-counts-inconsistent/);
}
for(const state of ["available","governed-zero","partial","unavailable"]){
 const narrative=translateOpportunityEvaluationNarrativeV1({state});
 assert.equal(typeof narrative.summary,"string");
 assert.doesNotMatch(narrative.summary,/provider failure|request failed|candidate evaluation|no opportunities were found/i);
}
console.log("PASS available, governed zero, partial with/without delivery, unavailable, empty cohort, counts and immutable ranking");
