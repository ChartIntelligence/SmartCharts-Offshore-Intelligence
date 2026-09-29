// Task 12B.6N. Source review evidence only; no projection permission or freeze.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createHarness,scenarios,source} from './snapshotProducerQualificationV2Fixture.mjs';
export const read=path=>JSON.parse(readFileSync(new URL('../../../'+path,import.meta.url)));
export const prior=read('docs/Candidate_Snapshot_Producer_Branches_v2.json');
export const inventory=read('docs/Candidate_Snapshot_Producer_Surface_v3.json');
export const targets=prior.ranges.filter(r=>r.status==='REQUIRES_SOURCE_REACHABILITY_REVIEW');
export const hash=data=>createHash('sha256').update(data).digest('hex');
export const additionalScenarios=Object.freeze(['latitude','longitude','both'].map(role=>Object.freeze({
 ...scenarios.find(s=>s.id==='availability-15'),id:'provider-coordinate-fallback-'+role,
 coordinates:Object.freeze({latitude:25,longitude:-91}),omitProviderCoordinates:role,
 purpose:'Actual SST parser requested-coordinate fallback; source lines 6225/6231.'
})));

// Response adapter, not a new producer/harness: uses the existing semantic-keyed
// transport and removes only the explicitly selected provider-coordinate fields.
export async function extensionHarness(t){
 let active=null;
 const adapter={mock:{method(object,key,implementation){
  if(object!==globalThis||key!=='fetch')return t.mock.method(object,key,implementation);
  return t.mock.method(object,key,async function(...args){
   const response=await implementation.apply(this,args);
   if(!active||!String(args[0]).includes('marine-api.open-meteo.com'))return response;
   return {...response,json:async()=>{
    const payload=await response.json();
    if(active==='latitude'||active==='both')delete payload.latitude;
    if(active==='longitude'||active==='both')delete payload.longitude;
    return payload;
   }};
  });
 }}};
 const harness=await createHarness(adapter);
 return {close:()=>harness.close(),async run(scenario,options){
  active=scenario.omitProviderCoordinates??null;
  try{return await harness.run(scenario,options);}finally{active=null;}
 }};
}

const CALLER='UNREACHABLE_CALLER_CONTRACT', IMPOSSIBLE='UNREACHABLE_IMPOSSIBLE_STATE';
const decisions=new Map();
function lines(numbers,disposition,proof,counterexample){
 for(const line of numbers){assert(!decisions.has(line));decisions.set(line,{disposition,proof,counterexample});}
}
lines([6225,6231],'REACHABLE_REVIEWED_DOMAIN',
 'The actual parser accepts a current SST payload without provider coordinates and uses the finite requested coordinate. No parser validation rejects this omission.',
 'Exercised by the three provider-coordinate-fallback scenarios; V8 source range counts must be positive.');
lines([7027],'NON_SEMANTIC_OPERATIONAL_BRANCH',
 'The nullish operand is inside console.warn interpolation only; it cannot affect returned scientific evidence.',
 'Rejected cardinal requests exercise the surrounding warning. The sampler still supplies a direction.');
lines([7034,7039,7044],CALLER,
 'Promise.allSettled preserves array length/order. samplePoints[index] is the same four-cardinal entry used to create the corresponding promise; each entry has a direction and finite requested coordinates at 25,-91.',
 'Reject each direction independently: rejection does not remove or reorder its sampler entry.');
lines([24026,24030,24035,24054,24105,24430,24435,24451,24456],CALLER,
 'Caller passes only the actual spatialStructure, with fixed thresholdVersion, radius 15 and four-entry samples array. Feature/source/type overrides are omitted, so producer defaults apply. None of these fallbacks can be reached by varying SST values, times or transport rejection.',
 'Null/missing/partial temperatures, missing times and rejected directions change sample validity, not these outer contracts. Injecting an invalid contract or override would leave this caller domain.');
lines([24219],'UNREACHABLE_UPSTREAM_VALIDATION',
 'The immediately preceding sample filter requires source.availability === available. A retained sample cannot reach the map with null availability.',
 'Missing temperature or rejected source is filtered out before the map; it cannot exercise this fallback.');
lines([10550,10551,10556,10614,10623,10631,10641,10649,10685,10690,10695,10723,10917,10926,10935],CALLER,
 'The actual route assembly supplies derived spatialStructure and feature observation objects. Spatial coverage/orientation/confidence/limitations, finite neighbor counts, expected count 4 and radius 15 always exist. A true governedObservationAvailable gate additionally requires the available feature contract whose types/source/time are populated.',
 'All-missing and rejected sample states retain these outer fields. Available feature observation requires one retained time and valid contract labels. Deleting outer fields is not a parser-produced state.');
lines([9535,9536,9541,9542,9547,9548,9581,9582,9587,9588,9593,9594],CALLER,
 'The fixed auxiliary current/chlorophyll parser outputs are finite and have explicit represented time. Their unchanged evidence assemblers populate values.observedAt, ageHours and freshness before open-water assembly.',
 'SST scenario changes do not change the auxiliary current/chlorophyll transport or observation time. Missing those auxiliary families is outside this SST-only domain.');
lines([9650],CALLER,
 'dataQuality.lineage.warnings is an array from the unchanged quality assembler for the fixed marine input. The array fallback requires a different caller shape.',
 'Varying SST transport cannot turn this quality array into a non-array.');
lines([15684],CALLER,
 'Every cloneSnapshotValue call in buildObservationSnapshot supplies a concrete assembled object or explicitly coalesces to null/{}. dataQuality is the fixed quality-assembler object. No argument can be undefined.',
 'Unavailable SST changes object contents, not snapshot argument existence.');
lines([15740,15747,15940],CALLER,
 'Snapshot location is the explicit finite scenario coordinate pair 25,-91. Provider-coordinate omission uses requested coordinates and does not replace the scenario location.',
 'Missing/invalid caller coordinates would violate this fixed nonpolar caller domain.');
lines([15978],CALLER,
 'The reviewed caller supplies location with latitude and longitude only, never a display name.',
 'A name override is a different caller input, not an SST producer branch.');
lines([15986,15992],CALLER,
 'The composite caller supplies the fixed marine observedAt string and explicit retrieval string. SST represented time is independent of both.',
 'SST missing-time scenarios do not remove these wrapper timestamps.');
lines([15767,15773,15778,15783,15788,15793,15798,15804,15810,15816,15822,15828,15834,15843,15849,15855,15861,15867,15873,15879,15886,15891,15897,15902,15918,15932,15948,15996,16003,16026,16039,16047],CALLER,
 'assessOceanEvidence unconditionally returns its groups, physics, organization, confidence, summary and lineage contracts, including unavailable temperature states. Their return literals contain the version/interpretation labels copied here. Snapshot arguments include observations and quality; limitations remains an array.',
 'Unavailable observation is not absence of the evidence contract. Only bypassing or deleting assembler outputs can reach these defensive snapshot fallbacks.');
lines([12476,12933,12934,12935,13479,13480,14083,14084,14085,14086,14087],IMPOSSIBLE,
 'Source fixes salinity, spatial chlorophyll, density, vertical profile, persistence and established adjacent water masses to false. Only temperature is a spatial water-character variable, so independent spatial-character count cannot reach two. The leading readiness conjunct is false before these later operands.',
 'SST values cannot create another water-character variable, persistence or verified adjacent water masses.');
lines([14733,14737],IMPOSSIBLE,
 'All reviewed physics producers return false readiness/detection for established fronts/mixing/water masses; downstream summary cannot select verified-detection or readiness status.',
 'Changing thermal contrast only changes candidate context, never the hard-coded unavailable independent evidence.');
lines([15392,15407],CALLER,
 'Fixed spatial current is uniform (no variation, shear, convergence or edge). Only thermal contribution (at most 2), surface boundary (at most 1) and water-mass boundary (at most 1) can contribute. Thus organizationIndex <=4, below both 5 and 8.',
 'Both uniform and extreme SST contrasts leave all fixed current contributions zero; current-varying input would be a different qualification domain.');
lines([11835,11853,11865,11881,11908,11911,11916,11928,11933,12114,12124,12134,12144,12218,12252,12257,12274,12284,12294,12304,
12345,12350,12403,12443,12447,12607,12617,12627,12637,12647,12722,12727,12756,12766,12776,12786,12796,
12853,12858,12863,12868,13077,13087,13097,13107,13117,13127,13214,13224,13234,13244,13254,13264,
13304,13310,13360,13365,13370,13375,13696,13706,13716,13726,13736,13746,13756,13869,13879,13889,13899,13909,13919,13929,
13954,13959,13964,14000,14037,14272,14282,14292,14302,14405,14415,14425,14435,
14469,14474,14502,14504,14506,14520,14533,14554,14575,14596,14634,14705,
14812,14843,14848,14853,14858,14863,14868,14884,14892,14921,14928,14933,14946,14954,14968,
15003,15008,15013,15018,15023,15028,15084,15472,15568,15570,15580,15590,15600,15610,15620,15630,15640,15650],CALLER,
 'This defensive fallback receives the actual upstream evidence object, not a user-supplied partial object. assessOceanEvidence constructs every physics stage and the snapshot caller passes all of them. Their return literals contain the referenced classification/state/contract/lineage/limitations fields. Fixed finite chlorophyll supplies populated productivity/clarity values; fixed uniform-current assembly supplies finite signal counts and spatial subcontracts. Empty arrays remain arrays. No SST branch deletes these outer fields.',
 'All-missing center/directions, rejected samples and absent SST time retain upstream schema. Reaching this operand requires deleting a producer field, bypassing an assembler, or varying the fixed non-SST auxiliary family; these are outside this caller contract. Exact referenced expression is recorded in predicate/source.');
lines([11846,12040,12048,12053,12058,12066,12074,12079,12084,12088,12414,12538,12540,12553,12555,
12874,12882,12890,12995,12997,13014,13381,13389,13397,13452,13582,13584,13607,13609,13636,
14070,14074,14159,14161,14183,14185,14210,15055,15063,15071],CALLER,
 'These branches require current edge/shear/convergence or combined hydrodynamic interaction. The fixed auxiliary transport returns the same u=.5,v=.2 at every current location; unchanged spatial current assemblers report uniform current and no detected edge/shear/convergence. Thermal variations alone cannot make any hydrodynamic antecedent true.',
 'Extreme, uniform, partial and missing SST change thermal predicates but keep all current detections false. A nonuniform current transport is outside this SST-input qualification domain.');
lines([11938,12942,13490,13491,13492,13493,14094,14095,15039,15344,15347,15350,15353,15356,15359],CALLER,
 'This later || operand is short-circuited by an earlier fixed true observation/contract condition: finite chlorophyll supplies productivity/clarity and surface-character availability; downstream physics analysis objects are available even without detection; fixed current organization is available and uniform.',
 'Absent SST does not remove finite chlorophyll or fixed current organization. Those earlier true operands persist independently of SST.');
lines([12575,12579,12583,12587,12591,12596,13046,13050,13054,13058,13062,13066,13665,13669,13673,13679,13685,14241,14245,14249,14253,14257,14261,15322,15328,15334,15340],IMPOSSIBLE,
 'This null alternative would remove a prerequisite/counter-evidence entry only if unavailable independent science became established. The source fixes salinity, spatial chlorophyll, vertical/density context, persistence, established water masses and verified detections false; thermal contrast cannot establish them.',
 'Increasing temperature magnitude never changes these explicit false prerequisite/verified-state constants. No alternate science is supplied by this caller.');
lines([14836],CALLER,
 'This map callback consumes unavailableStages. With fixed populated chlorophyll/current and all synthesis contracts constructed, every stage is available; unavailableStages is empty. Availability here is analysis availability, not successful scientific detection.',
 'All-missing SST leaves the surface-character analysis available via finite chlorophyll; downstream analyses remain available.');
lines([15312],CALLER,
 'This null alternative removes uniform-current-field counter-evidence. The fixed current organization is uniform for every SST scenario.',
 'Varying SST does not vary the current transport.');

export function rangeReview(execution=[]){
 return targets.map(r=>{
  assert.equal(source.slice(r.start,r.end),r.source,'Source drift '+r.id);
  const decision=decisions.get(r.line)??{disposition:'REQUIRES_FURTHER_REVIEW',proof:'This range is not assigned an exclusion merely because it was unexecuted. Its transitive fixed-auxiliary/schema predicate proof remains to be completed.',counterexample:'No completed valid-input exclusion proof recorded.'};
  const hits=execution.find(x=>x.id===r.id)?.scenarios??[];
  return {...r,priorStatus:r.status,status:undefined,disposition:decision.disposition,
   predicate:r.precedingSource+r.source,outputAffected:r.producer+' return object / listed source expression',
   upstreamPrerequisites:'Actual SST parser/assembler; fixed current, chlorophyll, marine and explicit assessment caller described in Harness v2.',
   proof:decision.proof,counterexampleAttempt:decision.counterexample,exercisingScenarios:hits};
 });
}

const base='/observationSnapshot/';
export const requirementPrefix=base+'observations/sst/derived/governedEnvironmentalFeatureObservation/missingRequirements/';
export const requirementOrder=['sufficient-spatial-coverage','supported-temperature-transition-classification','at-least-three-valid-spatial-samples','consistent-spatial-sample-observation-time'];
export function optionalityReview(records=inventory.inventory){
 return records.filter(r=>r.absentStates.length&&r.presentStates.length).map(r=>{
  let producer=null,control=null,kind='ARRAY_MEMBER',resolved=false;
  if(r.path.startsWith(base+'evidence/groups/temperature/values/')){
   producer='buildTemperatureEvidence';control='!available early return omits the five extended values; normal return includes them (possibly null).';kind='OBJECT_KEY';resolved=true;
  }else if(/spatialStructure\/samples\/\d+\/(providerCoordinates|timestampProvenance)/.test(r.path)){
   producer='getSstSpatialStructureAtAssessment';control='Fulfilled point carries parser metadata; rejected allSettled branch constructs a missing sample without providerCoordinates or timestampProvenance. Descendant absence follows parent absence.';kind='OBJECT_KEY_OR_DESCENDANT';resolved=true;
  }else if(r.path.includes('/governedEnvironmentalFeatureObservation/samplingFootprint/samples/')){
   producer='buildGovernedEnvironmentalFeatureObservationV1';control='Filter requires valid cardinal coordinates, finite F, parseable time, populated source labels and available source; map emits a fixed sample object; cardinal sort compacts the retained list. Index i exists iff retained length > i; descendants follow that index.';resolved=true;
  }else if(r.path.startsWith(requirementPrefix)){
   producer='buildGovernedEnvironmentalFeatureObservationV1';control='Twelve ordered prerequisite checks, four reachable in this caller; [...new Set(missingRequirements)] preserves first occurrence order. Index i exists iff failed-check count > i.';resolved=true;
  }else if(r.path.includes('/confidence/reasons/')){
   producer='assessSstTransitionConfidence';control='Five ordered stages: coverage, optional finite range, direction, axis, time. Exactly one reason per active stage; array index exists iff emitted reason count exceeds index. Snapshot and temperature evidence carry the same list.';resolved=true;
  }else if(r.path.includes('/temperature/drivers/')){
   producer='buildTemperatureEvidence';control='Ordered conditional pushes: center, spatial classification, directional orientation, confidence; then unavailable early return or final insufficient-coverage push. Index presence depends on preceding active stages.';resolved=true;
  }else{
   const mappings=[['/confidence/limitations/','buildOceanEvidenceConfidence'],['/evidence/summary/supportingGroups/','buildOceanEvidenceSummary'],['/evidence/groups/temperature/limitations/','buildTemperatureEvidence'],['/lineage/oceanEvidence/','buildOceanEvidenceLineage'],['/lineage/oceanPhysicsExplainability/','buildOceanPhysicsExplainabilityLineage'],['/oceanPhysics/explainability/lineage/','buildOceanPhysicsExplainabilityLineage'],['/oceanPhysics/explainability/','buildOceanPhysicsExplainabilitySummary'],['/oceanOrganization/','buildOceanOrganizationAnalysis'],['/oceanPhysics/surfaceWaterCharacter/','buildSurfaceWaterCharacterAnalysis'],['/oceanPhysics/waterMassAnalysis/','buildWaterMassAnalysis'],['/oceanPhysics/mixingZoneAnalysis/','buildMixingZoneAnalysis'],['/oceanPhysics/environmentalTransitionAnalysis/','buildEnvironmentalTransitionAnalysis'],['/oceanPhysics/oceanFrontAnalysis/','buildOceanFrontAnalysis']];
   producer=mappings.find(([fragment])=>r.path.includes(fragment))?.[1]??'buildObservationSnapshot';
   const controls={
    buildOceanEvidenceConfidence:'Ordered pushes for unavailable evidence groups, freshness states, quality limitations and prefixed temperature-confidence limitations. Source conditions, not observation availability alone, determine list length.',
    buildOceanEvidenceSummary:'Object.entries(groups).filter(group.available===true), then filter populated classification excluding unavailable and clarity-undetermined, then map names; ordering remains group insertion order.',
    buildTemperatureEvidence:'Set union of spatial limitations plus fixed five limitations; !available early return prepends center/spatial unavailable labels. The list is always present; only indexes beyond its state-dependent length disappear.',
    buildOceanEvidenceLineage:'observationsUsed/Unavailable filter the temperature/current/chlorophyll availability record. inheritedLimitations filters nonempty strings from the supplied evidence limitations and deduplicates them; inheritedWarnings use ordered quality/open-water/persistence checks. Snapshot carries the returned dense lists.',
    buildOceanPhysicsExplainabilityLineage:'propagateEvidenceLineage carries primary oceanEvidenceLineage observation lists and merges primary limitations/warnings with the supplied explainability limitations and missing-primary/contract warnings. availableStages filters stage availability. No root observation is deleted.',
    buildOceanPhysicsExplainabilitySummary:'Ordered stage normalization, unavailable-stage/requirement/readiness/detection predicates and Set-deduplicated inherited limitations. All stages remain present even where an analysis does not detect a feature.',
    buildOceanOrganizationAnalysis:'organizationDrivers filters weightedSignals.supported then maps driver; counterEvidence filters conditional strings/null; limitations deduplicates inherited explainability limitations plus fixed caveats. No sparse arrays.',
    buildSurfaceWaterCharacterAnalysis:'Set-deduplicated inherited temperature/productivity/clarity/current limitations plus fixed local-character caveats. SST branches vary inherited temperature limitations.',
    buildWaterMassAnalysis:'spatialCharacterVariables filters spatialThermalContrast ? temperature : null; localCharacterVariables filters three observation-availability ternaries. limitations deduplicates upstream limitations with fixed independent-evidence caveats.',
    buildMixingZoneAnalysis:'Set-deduplicated inherited temperature/current/surface-character/water-mass limitations plus fixed unverified-interaction caveats.',
    buildEnvironmentalTransitionAnalysis:'Set-deduplicated inherited temperature/current/surface-character/water-mass/mixing limitations plus fixed transition caveats.',
    buildOceanFrontAnalysis:'Set-deduplicated inherited transition/water-mass/mixing/current limitations plus fixed front caveats.',
    buildObservationSnapshot:'Snapshot limitations Set-union carries oceanEvidence.limitations (itself confidence plus group limitations), missing-contract/location/evidence conditions and fixed snapshot caveats. All reviewed caller contracts/location exist; variability comes from upstream temperature/lineage limitations.'
   };
   control=controls[producer];resolved=Boolean(control);
  }
  const sourceMatch=[...source.matchAll(/^(?:export )?(?:async )?function\s+(\w+)\s*\(/gm)].find(m=>m[1]===producer);
  assert(sourceMatch,'Missing optionality producer '+producer);
  return {path:r.path,disposition:resolved?'BRANCH_OPTIONAL':'REQUIRES_FURTHER_REVIEW',producer,sourceFile:'backend/server.js',sourceLine:source.slice(0,sourceMatch.index).split('\n').length,control,kind,presentScenarios:r.presentStates,absentScenarios:r.absentStates,presentShapes:r.shapes,nullIsNotAbsence:true,arrayPolicy:'Dense producer arrays only; no sparse-array or arbitrary-index authority.'};
 });
}

export function requirementReview(rows){
 return [0,1,2,3].map(index=>({path:requirementPrefix+index,disposition:'SCIENTIFIC_STATE',
  producer:'buildGovernedEnvironmentalFeatureObservationV1',sourceLines:[24316,24346],
  consumer:'Producer reads missingRequirements.length to establish available; buildTemperatureEvidence reads available and governed reference fields to establish observationProvenance, which is part of current scientific evidence. No downstream reclassification is implemented.',
  semantics:'Ordered failed scientific prerequisite state; no arbitrary strings. Snapshot structuredClone retains it.',
  order:requirementOrder,deduplication:'Set preserves first occurrence; each reachable check pushes its distinct value once.',
  states:rows.filter(r=>r.feature.missingRequirements.length>index).map(r=>({scenario:r.id,value:r.feature.missingRequirements[index]}))}));
}
