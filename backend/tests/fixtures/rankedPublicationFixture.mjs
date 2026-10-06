// Synthetic upstream decisions patterned after opportunityEvaluationState.test.js.
// Actual governed interpretation, delivery/ranking and evaluation-state functions
// execute; adequacy flags are controlled fixtures, not source-science qualification.
import {buildUnifiedSpeciesOpportunityInterpretationV1} from '../../server.js';
import {createRankedPublicationComposer,CONTEXT,byteHash} from '../../durableObserve/publicationEnvelope.mjs';
import {cycleV2,freezeEvidenceV1,hash} from '../../../shared/oceanPublication.mjs';
import {exactJson} from '../../exactScientificEvidence.mjs';
export const ref=id=>({kind:'captured',contractVersion:'synthetic-publication-input-v1',referenceId:id,sha256:hash(id)});
export function fixtureInput(states=[{adequate:true,positive:true}],scheduledAt='2026-10-06T00:00:00.000Z',contextId='synthetic-regional-context'){
 const candidates=states.map((_,i)=>({id:'candidate-'+i,coordinates:[28,-88],eligibility:{eligible:true}}));
 const context={contractVersion:CONTEXT,species:'blue-marlin',region:{id:'synthetic-region',version:'v1'},spatialClass:'REGIONAL_SELECTED_COHORT',spatialReference:ref(contextId),missionReference:null};
 const cycle={scheduledAt,region:context.region,configuration:{id:'synthetic-cycle',version:'v1',governanceReference:'synthetic-only',evaluatorVersion:'synthetic-explicit-assessment-v1',candidateUniverseVersion:'v1',species:['blue-marlin'],families:['SST'],candidateUniverse:{reference:{kind:'captured',contractVersion:'pelora-selected-publication-cohort-v1',referenceId:'cohort-'+byteHash(exactJson(candidates)),sha256:byteHash(exactJson(candidates))},candidateIds:candidates.map(c=>c.id)}}};
 const content={contractVersion:'synthetic-controlled-upstream-input-v1',states,receiptStatus:'AS_OF_AUTHORITY_UNKNOWN',sourceTime:new Date(Date.parse(scheduledAt)-80*3600000).toISOString(),freshnessState:'stale',liveAuthorityState:'eligible'};
 const reference={...ref('synthetic-input-'+hash(content)),sha256:byteHash(exactJson(content))};
 const evidenceFreeze=freezeEvidenceV1(cycleV2(cycle),[{family:'SST',status:'STALE',reason:'synthetic-frozen-input',reference,product:{providerId:'synthetic',productId:'synthetic',evidenceClass:'synthetic'},representedAt:content.sourceTime,support:{kind:'instant',start:null,end:null},qualification:{status:'QUALIFIED',policyReference:'synthetic-only'},admissibility:{status:'ADMISSIBLE',policyReference:'synthetic-only'},assessedAt:scheduledAt,ageHours:80,qualityReferences:[],lineageReferences:[]}]);
 return {context,cycle,candidates,evidenceFreeze,artifacts:[{reference,receivedAt:new Date(Date.parse(scheduledAt)-1000).toISOString(),assessmentCutoff:scheduledAt,content}],searchCounts:{},revision:1,parentId:null,action:'ORIGINAL',lifecycle:'completed',reason:'synthetic-produced-result'};
}
export async function composer(reference,clock={now:()=>new Date().toISOString()}){return createRankedPublicationComposer({clock,evaluate:async({binding,candidates,species},readEvidence)=>{
 return {binding,results:candidates.map((candidate,i)=>{
  const source=readEvidence(reference,candidate.id);
  const e=source.states[i];if(e==='failed')return {status:'rejected',candidate,reason:'synthetic-upstream-failure'};
  const value=buildUnifiedSpeciesOpportunityInterpretationV1({assessment:{contractVersion:'pelora-scientific-assessment-v1',assessmentAt:binding.assessmentCutoff},candidate,species,oceanConditions:{blueMarlinHabitat:{summary:{classification:e.positive?'limited-preliminary-habitat-support':'insufficient-habitat-evidence'},confidence:{score:60,level:'Moderate',components:{confidenceAdjustedSuitability:{score:45}}},opportunityTypes:e.positive?['environmental-transition-zone']:[],relationshipGroups:{thermalStructure:{score:22,classification:'moderate-temperature-transition-supported'},waterCharacter:{score:8,classification:'clear-blue-surface-water-observed'}}}}});
  value.negativeConclusionAdequacy={contractVersion:'pelora-candidate-negative-conclusion-adequacy-v1',adequate:e.adequate};return {status:'fulfilled',candidate,value};
 })};
 }});}

export async function envelope(input=fixtureInput()){return (await composer(input.artifacts[0].reference)).compose(input);}
