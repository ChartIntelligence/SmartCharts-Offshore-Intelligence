import {composeRetainedBlueMarlinV1} from '../../durableObserve/retainedBlueMarlinComposition.mjs';
import {bindCenterSstSpatial,captureBoundCenterSst,captureLiveChlorophyll} from '../../scalarEvidenceHandoff.mjs';import {encodeNormalizedCurrentHandoff} from '../../normalizedEvidenceCapture.mjs';import {SOURCE_NORMALIZATION_VERSION,SOURCE_NORMALIZATION_REFERENCE} from '../../sourceNormalization.mjs';
// Controlled scenario creation precedes retention. No existing source bytes are rewritten.
import {randomUUID} from 'node:crypto';
import {retainedBlueMarlinFixture,refresh,retainedArtifact} from './retainedBlueMarlinFixture.mjs';
import {planControlledRetainedSupply,sealRetainedInputRecord,createRetainedInputStore} from '../../durableObserve/retainedInputSupply.mjs';
import {createControlledP4Configuration,createControlledP4Runtime} from '../../durableObserve/controlledRetainedPublication.mjs';
import {registerLocalPublisherConfiguration,createPublisherLedger,utcBoundary,disableLocalPublisherConfiguration} from '../../durableObserve/publicationScheduler.mjs';
import {createLocalFourHourPublisher} from '../../durableObserve/localPublicationPublisher.mjs';
export async function setupControlledP4(db,{mutate,count=2,settings,native=false}={}){
 const x=retainedBlueMarlinFixture(count),at=utcBoundary(new Date().toISOString()),name='controlled-p4-'+randomUUID();
 x.assessment.assessmentAt=at;const sourceAt=new Date(Date.parse(at)-4*3600000).toISOString();
 function visit(v){if(!v||typeof v!=='object')return;if(v.observedAt)v.observedAt=sourceAt;if(v.reference?.kind==='captured'&&Object.hasOwn(v,'content'))v.reference.referenceId=name+'-'+v.reference.referenceId;Object.values(v).forEach(visit);}
 visit(x);for(const e of x.entries)e.environment.content.assessmentAt=at;mutate?.(x);refresh(x);for(const e of x.entries)e.environment.content.context=structuredClone(x.context);refresh(x);
 if(native){const expected=composeRetainedBlueMarlinV1(x);for(let i=0;i<x.entries.length;i++){
  const e=x.entries[i].environment.content,p=structuredClone(e.sst.center.content.payload);delete p.source.availability;
  const spatial=await bindCenterSstSpatial(p,SOURCE_NORMALIZATION_VERSION,()=>expected.evaluations[i].ocean.sst.derived.spatialStructure);p.derived={spatialStructure:spatial};e.sst.center.content={format:'SCALAR_HANDOFF',family:'SST',payload:captureBoundCenterSst(p,spatial,[SOURCE_NORMALIZATION_REFERENCE])};
  e.currents.center.content={format:'CURRENT_HANDOFF',family:'CURRENTS',payload:encodeNormalizedCurrentHandoff(e.currents.center.content.payload,SOURCE_NORMALIZATION_VERSION)};
  for(const [name,family] of [['direct','CHLOROPHYLL_DIRECT'],['gapFilled','CHLOROPHYLL_GAP_FILLED']])e.chlorophyll[name].content={format:'SCALAR_HANDOFF',family,payload:captureLiveChlorophyll(e.chlorophyll[name].content.payload,[SOURCE_NORMALIZATION_REFERENCE])};
 }refresh(x);}
 const plan=planControlledRetainedSupply(x,new Date().toISOString()),store=createRetainedInputStore({query:db.query});
 for(const a of plan.artifacts){const r=await sealRetainedInputRecord({type:'P1_EXACT_ARTIFACT',sourceClass:'CONTROLLED_FIXTURE',artifact:a,metadata:{fixtureOrigin:'CONTROLLED_P4A',temporalSupport:null,receipt:null}});if((await store.retain(r)).status!=='FOUND_VALIDATED')throw Error('controlled-source-retention');}
 const setArtifact=retainedArtifact(name+'-reference-set',plan.referenceSet);await store.retain(await sealRetainedInputRecord({type:'REFERENCE_SET',sourceClass:'CONTROLLED_FIXTURE',artifact:setArtifact,metadata:{fixtureOrigin:'CONTROLLED_P4A'}}));
 const c=await createControlledP4Configuration({store,referenceSetReference:setArtifact.reference,configurationId:name,settings});await registerLocalPublisherConfiguration(db.owner,c);db.registered.add(c.id);
 const ledger=createPublisherLedger({query:db.query});await ledger.enumerate(c,new Date().toISOString());const [id]=await ledger.pending(c);
 return {x,plan,store,setArtifact,c,id,ledger,async publisher(options={}){const runtime=await createControlledP4Runtime({query:db.query,configuration:c,...options});return {runtime,publisher:createLocalFourHourPublisher({enabled:true,createRuntime:async()=>runtime})};},disable:()=>disableLocalPublisherConfiguration(db.owner,c.id,new Date().toISOString())};
}
