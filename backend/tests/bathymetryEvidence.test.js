import assert from "node:assert/strict";
import {normalizeBathymetryElevationV1, normalizeEtopoWaterMaskObservationV1} from "../bathymetryEvidence.js";
import waterMask from "../data/gulf-water-mask-v1.json" with {type:"json"};
import {resolveGulfWaterMaskV1, resolveOpportunityCandidateBathymetryV1,
  evaluateSpeciesCandidateHabitatEligibilityV1, evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1,
  buildCandidateNegativeConclusionAdequacyV1, buildUnifiedCaptainOpportunityDeliveryV1} from "../server.js";
import {buildGovernedOpportunityEvaluationStateV1} from "../opportunityEvaluationState.js";

const profile = {species:"fixture-species",habitatEligibility:{bathymetry:{enabled:true,minimumDepthMeters:100}}};
const candidate = value => ({id:"bathymetry-fixture",coordinates:[25.5,-90.5],waterMask:{elevationMeters:value}});
const invalid = [null,undefined,NaN,Infinity,-Infinity,""," ","invalid","NaN","Infinity",false,true,[],{},[0]];
for (const value of invalid) {
  assert.equal(normalizeBathymetryElevationV1(value),null);
  assert.deepEqual(normalizeEtopoWaterMaskObservationV1(value),{elevationMeters:null,water:null});
  const resolved=resolveOpportunityCandidateBathymetryV1(candidate(value));
  assert.equal(resolved.available,false);
  assert.equal(resolved.elevationMeters,null);
  assert.equal(resolved.depthMeters,null);
  for (const evaluate of [evaluateSpeciesCandidateHabitatEligibilityV1,evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1]) {
    const result=evaluate({candidate:candidate(value),speciesProfile:profile});
    assert.equal(result.eligible,null,"Missing evidence must be neither eligible nor known ineligible");
    assert.equal(result.bathymetry.eligible,null);
    assert.equal(result.bathymetry.elevationMeters,null);
    assert.equal(result.bathymetry.depthMeters,null);
  }
}
for (const value of [{id:"missing",coordinates:[25.5,-90.5]}, {id:"missing-field",coordinates:[25.5,-90.5],waterMask:{}}]) {
  assert.equal(resolveOpportunityCandidateBathymetryV1(value).available,false);
  assert.equal(evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1({candidate:value,speciesProfile:profile}).eligible,null);
}
for (const value of [-500,-50,0,50]) {
  assert.equal(normalizeBathymetryElevationV1(value),value);
  const resolved=resolveOpportunityCandidateBathymetryV1(candidate(value));
  assert.equal(resolved.available,true);
  assert.equal(resolved.elevationMeters,value);
  assert.equal(resolved.depthMeters,value<0?-value:0);
  const result=evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1({candidate:candidate(value),speciesProfile:profile});
  assert.equal(result.eligible,value<=-100);
  assert.equal(result.classification,value<=-100?"species-habitat-eligible":"species-habitat-ineligible");
}
assert.equal(normalizeBathymetryElevationV1(" -500.25 "),-500.25,"Preserve existing numeric-string boundary behavior");
assert.equal(resolveOpportunityCandidateBathymetryV1(candidate("-500.25")).depthMeters,500.25);
assert.equal(normalizeBathymetryElevationV1("0"),0);
assert.deepEqual(normalizeEtopoWaterMaskObservationV1("-500"),{elevationMeters:null,water:null},"ETOPO JSON contract remains numeric-only");
assert.deepEqual(normalizeEtopoWaterMaskObservationV1(-500.126),{elevationMeters:-500.13,water:true});
assert.deepEqual(normalizeEtopoWaterMaskObservationV1(0),{elevationMeters:0,water:false});

// Exercise the actual artifact reader using a temporary in-memory fixture only.
const sample=waterMask.candidates.find(value=>value.water===true);
const original=sample.elevationMeters;
try {
  for (const value of invalid) {
    sample.elevationMeters=value;
    const resolved=resolveGulfWaterMaskV1(...sample.coordinates);
    assert.equal(resolved.available,false);
    assert.equal(resolved.water,null);
    assert.equal(resolved.elevationMeters,null);
    const fallback=resolveOpportunityCandidateBathymetryV1({coordinates:sample.coordinates});
    assert.equal(fallback.available,false);
    assert.equal(fallback.depthMeters,null);
  }
  sample.elevationMeters=original;
  const fallback=resolveOpportunityCandidateBathymetryV1({coordinates:sample.coordinates,waterMask:{elevationMeters:null}});
  assert.equal(fallback.available,true,"Existing coordinate match may still supply a real observation");
  assert.equal(fallback.elevationMeters,original);
  assert.equal(fallback.resolutionMethod,"gulf-water-mask-coordinate-match");
} finally {sample.elevationMeters=original;}

const eligibility=evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1({candidate:candidate(null),speciesProfile:profile});
const unresolved={...candidate(null),eligibility};
assert.equal(buildCandidateNegativeConclusionAdequacyV1({candidate:unresolved}).predicates.upstreamHabitatEligible,false);
const selected=[unresolved].filter(value=>value.eligibility.eligible===true);
const state=buildGovernedOpportunityEvaluationStateV1({candidates:selected,results:[],
  delivery:buildUnifiedCaptainOpportunityDeliveryV1({species:"blue-marlin",speciesInterpretations:[]}),
  searchCounts:{habitatUnresolvedCandidates:1,habitatIneligibleCandidates:0}});
assert.equal(state.state,"unavailable");
assert.equal(state.counts.habitatUnresolvedCandidates,1);
assert.equal(state.counts.habitatIneligibleCandidates,0);
assert.equal(state.counts.adequatelyEvaluatedCandidates,0);
const ungoverned=evaluateSpeciesCandidateHabitatEligibilityV1({candidate:candidate(null),speciesProfile:{species:"future-species"}});
assert.equal(ungoverned.eligible,true,"Do not invent species rules");
assert.equal(ungoverned.bathymetry.governed,false);
assert.equal(ungoverned.bathymetry.elevationMeters,null);
console.log("PASS shared bathymetry normalization, provider parsing, resolution, zero, habitat distinction and Task 2 continuity");
