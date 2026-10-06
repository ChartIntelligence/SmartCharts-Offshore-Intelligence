// Explicit isolated controlled integration; never an operational source admission adapter.
import {copy,freeze,check,cycleV2,freezeEvidenceV1,utc} from '../../shared/oceanPublication.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
import {createRetainedInputStore,readRetainedReferenceSet,resolveControlledRetainedSupply} from './retainedInputSupply.mjs';
import {composeRetainedBlueMarlinV1} from './retainedBlueMarlinComposition.mjs';
import {sealPublisherConfiguration,PUBLISHER_CONFIGURATION,createPublisherLedger,emptyCycleInput} from './publicationScheduler.mjs';
import {CONTEXT,byteHash,createRankedPublicationComposer} from './publicationEnvelope.mjs';
import {CONTROLLED_P4_ADAPTER,CONTROLLED_P4_BUNDLE,controlledQualification,same,validateControlledBundle} from './controlledPublicationBinding.mjs';
import {evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1,resolveOpportunityCandidateBathymetryV1,BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE} from '../server.js';
function gate(){check(process.env.PELORA_CP09_P4A_LOCAL==='1'&&process.env.PELORA_CP09_LOCAL==='1'&&process.env.PELORA_CP08_LOCAL==='1'&&process.env.PELORA_TEST_OCEAN_CONDITIONS==='1');}
const captured=(contractVersion,id,content)=>({kind:'captured',contractVersion,referenceId:id+'-'+byteHash(exactJson(content)),sha256:byteHash(exactJson(content))});
function candidates(input){return input.entries.map(e=>{const raw=e.candidate.content;check(same(e.staticParent.content,{candidateId:raw.id,coordinates:raw.coordinates,bathymetry:resolveOpportunityCandidateBathymetryV1(raw)}));return {...raw,eligibility:evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1({candidate:raw,speciesProfile:BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE})};});}
async function supply(store,ref){const read=await readRetainedReferenceSet({reference:ref,store});if(read.status!=='FOUND_VALIDATED')throw Object.assign(Error('controlled-reference-set-unresolved'),{supplyStatus:read.status});const r=await resolveControlledRetainedSupply({referenceSet:read.referenceSet,store});if(r.status!=='CONTROLLED_SUPPLY_READY')throw Object.assign(Error('controlled-input-supply-unresolved'),{supplyStatus:r.status,resolutions:r.states.map(s=>({reference:s.reference,status:s.status}))});return r;}
export async function createControlledP4Configuration({store,referenceSetReference,configurationId,regionVersion='controlled-v1',settings={}}){
 gate();referenceSetReference=freeze(copy(referenceSetReference));const r=await supply(store,referenceSetReference),x=r.compositionInput,derived=candidates(x),at=x.assessment.assessmentAt;
 const cohort=captured('pelora-controlled-p4-publication-cohort-v1','p4-cohort',derived);
 const context={contractVersion:CONTEXT,species:'blue-marlin',region:{id:x.context.regionId,version:regionVersion},spatialClass:'REGIONAL_SELECTED_COHORT',spatialReference:captured('pelora-controlled-p4-context-v1','p4-context',{configurationId,referenceSetReference,qualification:controlledQualification}),missionReference:null};
 return sealPublisherConfiguration({contractVersion:PUBLISHER_CONFIGURATION,context,cycleConfiguration:{id:configurationId,version:'controlled-p4a-v1',governanceReference:'controlled-unadmitted-p4a-v1',evaluatorVersion:CONTROLLED_P4_ADAPTER,candidateUniverseVersion:'controlled-rich-cohort-v1',species:['blue-marlin'],families:['CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED','CURRENTS','SST'],candidateUniverse:{reference:cohort,candidateIds:derived.map(c=>c.id).sort()}},candidates:derived,scopes:[],approvedAt:at,effectiveAt:at,clockMode:'CONTROLLED_FIXTURE',settings:{catchUpCycles:1,maxConcurrent:1,maxAttempts:5,deadlineMs:172800000,leaseMs:30000,pollMs:1000,executionTimeoutMs:20000,lookBackMs:1,...settings},adapterVersion:CONTROLLED_P4_ADAPTER,requireHistoricalReceipt:false,
 controlledSupply:{referenceSetReference,originalCohortReference:x.context.cohortReference,originalCandidates:x.entries.map(e=>e.candidate.content),staticParents:x.entries.map(e=>e.staticParent.content)}});
}
export async function collectControlledP4Input(c,at,{store,clock,signal}){
 gate();check(c.adapterVersion===CONTROLLED_P4_ADAPTER);signal?.throwIfAborted();const r=await supply(store,c.controlledSupply.referenceSetReference),x=r.compositionInput;
 check(x.assessment.assessmentAt===at&&x.context.regionId===c.context.region.id&&same(x.context.cohortReference,c.controlledSupply.originalCohortReference)&&same(candidates(x),c.candidates)&&same(x.entries.map(e=>e.candidate.content),c.controlledSupply.originalCandidates)&&same(x.entries.map(e=>e.staticParent.content),c.controlledSupply.staticParents));
 const constructedAt=utc(clock.now()),content={contractVersion:CONTROLLED_P4_BUNDLE,assessmentCutoff:at,constructedAt,qualification:controlledQualification,referenceSetReference:c.controlledSupply.referenceSetReference,referenceSet:r.referenceSet,
 records:r.states.map(s=>({reference:s.reference,recordText:s.recordText,digest:s.digest,retainedAt:s.retainedAt})),compositionInput:x,candidateBinding:{...c.controlledSupply,publicationCohortReference:c.cycleConfiguration.candidateUniverse.reference,derivedCandidates:c.candidates}};
 delete content.candidateBinding.referenceSetReference;validateControlledBundle(content,at);
 const reference=captured(CONTROLLED_P4_BUNDLE,'p4-bundle',content),input=emptyCycleInput(c,at,'completed');
 input.reason='controlled-current-evidence-history-unavailable';input.artifacts=[{reference,receivedAt:constructedAt,constructedAt,assessmentCutoff:at,content}];
 input.evidenceFreeze=freezeEvidenceV1(cycleV2(input.cycle),input.evidenceFreeze.entries.map(e=>({...e,status:'AVAILABLE',reason:'controlled-retained-input-bundle',reference,product:{providerId:'controlled-p2-p1',productId:e.family,evidenceClass:'synthetic-not-scientifically-admitted'},qualification:{status:'UNQUALIFIED',policyReference:'controlled-p4a-only'},admissibility:{status:'UNASSESSED',policyReference:'scientific-admission-gated'}})));
 return freeze(input);
}
export async function createControlledP4Runtime({query,configuration,clock={now:()=>new Date().toISOString()},hooks={},close}){
 gate();configuration=freeze(copy(configuration));check(configuration.adapterVersion===CONTROLLED_P4_ADAPTER);const store=createRetainedInputStore({query}),base=createPublisherLedger({query});
 const ledger={...base,configurations:async()=> (await base.configurations()).filter(c=>c.id===configuration.id)};
 return {ledger,collect:async(c,at,{signal})=>{await hooks.beforeCollect?.();const x=await collectControlledP4Input(c,at,{store,clock,signal});await hooks.afterCollect?.(x);return x;},
 compose:async(input,c)=>{
  check(c.id===configuration.id&&c.adapterVersion===CONTROLLED_P4_ADAPTER);
  if(input.lifecycle!=='completed')return (await createRankedPublicationComposer({clock,evaluate:()=>{throw Error('no fabricated evaluation');}})).compose(input);
  check(same(input.context,c.context)&&same(input.cycle.configuration,c.cycleConfiguration)&&same(input.candidates,c.candidates));check(input.artifacts.length===1&&same(input.artifacts[0].content.referenceSetReference,c.controlledSupply.referenceSetReference)&&same(input.artifacts[0].content.candidateBinding.originalCohortReference,c.controlledSupply.originalCohortReference));const ref=input.artifacts[0].reference;let actual;
  const composer=await createRankedPublicationComposer({clock,evaluate:async({binding,candidates:declared},read)=>{
   const bundle=validateControlledBundle(read(ref,declared[0].id),binding.assessmentCutoff);for(const candidate of declared)read(ref,candidate.id);
   check(same(bundle.candidateBinding.derivedCandidates,declared));await hooks.beforeCompute?.();actual=composeRetainedBlueMarlinV1(bundle.compositionInput);await hooks.afterCompute?.(actual);
   return {binding,results:actual.evaluations.map(e=>({candidate:e.candidate,status:'fulfilled',value:e.interpretation})),controlledComposition:actual};
  }});
  const p=await composer.compose(input);check(same(actual.delivery,p.producerBundle.delivery)&&same(actual.evaluationState,p.producerBundle.evaluationState));return p;
 },close};
}
