// Exact retention is not scientific admission. This module never evaluates or acquires.
import {createHash} from 'node:crypto';
import {copy,freeze,keys,reference} from '../../shared/oceanPublication.mjs';
import {exactJson} from '../exactScientificEvidence.mjs';
import {decodeScalarHandoff} from '../scalarEvidenceHandoff.mjs';
import {decodeNormalizedCurrentHandoff} from '../normalizedEvidenceCapture.mjs';
import {readOceanArchiveV1} from '../../shared/oceanProductArchive.mjs';
import {requireScientificAssessmentV1,reassessCurrentAgeV1} from '../scientificAssessment.mjs';
import {createOceanStateReader} from './oceanStateReader.mjs';
import {retainedSpatialSampleLayoutV1,resolveOpportunityCandidateBathymetryV1,
 evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1,BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE} from '../server.js';

export const RETAINED_INPUT_RECORD='pelora-retained-input-record-v1';
export const RETAINED_INPUT_REFERENCE_SET='pelora-retained-input-reference-set-v1';
export const EXPLICIT_RETAINED_SELECTION='pelora-explicit-retained-input-selection-v1';
const hash=x=>createHash('sha256').update(x).digest('hex');
const same=(a,b)=>exactJson(a)===exactJson(b);
const requireValue=(v,r)=>{if(!v)throw new TypeError('Retained supply: '+r);};
const types=['P1_EXACT_ARTIFACT','SCALAR_HANDOFF','CURRENT_HANDOFF','FRAME_ARCHIVE','STATIC_CONTEXT','REFERENCE_SET'];
function privateFields(v){
 if(!v||typeof v!=='object')return;
 for(const [k,c] of Object.entries(v)){
  requireValue(!/^(captainid|userid|session|sessionid|authtoken|credentials|password|token|privatecoordinates|captaincoordinates|captainlatitude|captainlongitude|usercoordinates|sessioncoordinates|triporigincoordinates|requestlocation|viewport|selectedmission|auth|triporigin|fishingreport|reportcontents|email|boatname)$/i.test(k.replace(/[_-]/g,'')),'private input');privateFields(c);
 }
}
function artifact(a){keys(a,['reference','content']);reference(a.reference);requireValue(a.reference.kind==='captured'&&a.reference.sha256===hash(exactJson(a.content)),'artifact reference');}
function identity(ref){return 'supply1-'+hash(exactJson({contractVersion:ref.contractVersion,referenceId:ref.referenceId}));}
function nativeKey(type,content){
 if(type==='FRAME_ARCHIVE')return {type,archiveId:content.receipt.archiveId};
 const ref=content.payload.reference;
 return {type,contractVersion:ref.contractVersion,referenceId:ref.referenceId};
}
export function nativeRetainedArtifact(type,content){
 requireValue(['SCALAR_HANDOFF','CURRENT_HANDOFF','FRAME_ARCHIVE'].includes(type),'native type');
 const c=copy(content),referenceId='native-'+hash(exactJson(nativeKey(type,c)));
 return freeze({reference:{kind:'captured',contractVersion:'pelora-retained-native-transport-v1',referenceId,sha256:hash(exactJson(c))},content:c});
}
function point(record){
 if(record.type==='SCALAR_HANDOFF')return decodeScalarHandoff(record.artifact.content.payload,record.artifact.content.family);
 if(record.type==='CURRENT_HANDOFF')return decodeNormalizedCurrentHandoff(record.artifact.content.payload);
 const c=record.artifact.content;
 if(c?.format==='SCALAR_HANDOFF')return decodeScalarHandoff(c.payload,c.family);
 if(c?.format==='CURRENT_HANDOFF')return decodeNormalizedCurrentHandoff(c.payload);
 if(c?.format==='CONTROLLED_NORMALIZED_POINT')return c.payload;
 return null;
}
export async function validateRetainedInputRecord(input){
 const x=copy(input);privateFields(x);
 keys(x,['contractVersion','identity','type','sourceClass','admission','artifact','metadata']);
 requireValue(x.contractVersion===RETAINED_INPUT_RECORD&&types.includes(x.type),'record version/type');
 requireValue(['CONTROLLED_FIXTURE','RETAINED_SOURCE'].includes(x.sourceClass)&&x.admission==='NOT_SCIENTIFICALLY_ADMITTED','retention/admission');
 artifact(x.artifact);requireValue(x.identity===identity(x.artifact.reference),'source identity binding');
 requireValue(x.metadata&&typeof x.metadata==='object'&&!Array.isArray(x.metadata),'metadata');
 if(x.type==='P1_EXACT_ARTIFACT')requireValue(x.sourceClass==='CONTROLLED_FIXTURE','fixture guard');
 if(x.type==='SCALAR_HANDOFF')requireValue(x.artifact.content.format==='SCALAR_HANDOFF'&&['SST','CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED'].includes(x.artifact.content.family),'scalar type');
 if(x.type==='CURRENT_HANDOFF')requireValue(x.artifact.content.format==='CURRENT_HANDOFF'&&x.artifact.content.family==='CURRENTS','current type');
 if(['SCALAR_HANDOFF','CURRENT_HANDOFF','FRAME_ARCHIVE'].includes(x.type))requireValue(same(x.artifact.reference,nativeRetainedArtifact(x.type,x.artifact.content).reference),'native source identity');
 if(x.type==='STATIC_CONTEXT'){
  const c=x.artifact.content;keys(c,['version','candidate','staticParent']);
  requireValue(typeof c.version==='string'&&c.version.length>0&&!Object.hasOwn(c.candidate,'eligibility'),'static context version');
  requireValue(same(c.staticParent,{candidateId:c.candidate.id,coordinates:c.candidate.coordinates,bathymetry:resolveOpportunityCandidateBathymetryV1(c.candidate)}),'static context producer');
  evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1({candidate:c.candidate,speciesProfile:BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE});
 }
 if(x.type==='REFERENCE_SET'){
  const s=x.artifact.content,{digest,...body}=s;
  requireValue(digest===hash(exactJson(body))&&((s.contractVersion===RETAINED_INPUT_REFERENCE_SET&&s.sourceClass==='CONTROLLED_FIXTURE'&&x.sourceClass==='CONTROLLED_FIXTURE')||(s.contractVersion===EXPLICIT_RETAINED_SELECTION&&s.sourceClass==='RETAINED_SOURCE'&&x.sourceClass==='RETAINED_SOURCE')),'reference set retention');
 }
 point(x); // Existing decoders validate native bytes/references/context, not scientific admission.
 if(x.type==='FRAME_ARCHIVE'){
  const r=x.artifact.content;requireValue(r?.receipt?.archiveId,'archive identity');
  const found=await readOceanArchiveV1({readExact:async()=>({status:'found',durable:true,record:r})},{frameId:null,archiveId:r.receipt.archiveId});
  requireValue(found.status==='ARCHIVED','archive record');
 }
 requireValue(Buffer.byteLength(exactJson(x),'utf8')<=4194304,'record capacity');
 return freeze(x);
}
export async function sealRetainedInputRecord({type,sourceClass,artifact:source,metadata}){
 const a=copy(source);
 return validateRetainedInputRecord({contractVersion:RETAINED_INPUT_RECORD,identity:identity(a.reference),type,sourceClass,
  admission:'NOT_SCIENTIFICALLY_ADMITTED',artifact:a,metadata:copy(metadata)});
}
export function createRetainedInputStore({query}){
 requireValue(typeof query==='function','query port');
 async function read(ref){
  reference(ref);let row;try{row=(await query('SELECT cp09b_supply.read_exact($1) AS value',[identity(ref)])).rows[0].value;}catch{return freeze({status:'READ_UNAVAILABLE',reference:copy(ref)});}
  if(row===null)return freeze({status:'ABSENT',reference:copy(ref)});
  try{
   requireValue(typeof row.recordText==='string'&&hash(row.recordText)===row.digest,'stored byte digest');
   const record=await validateRetainedInputRecord(JSON.parse(row.recordText));
   requireValue(exactJson(record)===row.recordText&&same(record.artifact.reference,ref),'stored exact reference');
   requireValue(typeof row.retainedAt==='string'&&Number.isFinite(Date.parse(row.retainedAt)),'retention time');
   return freeze({status:'FOUND_VALIDATED',reference:copy(ref),record,recordText:row.recordText,digest:row.digest,retainedAt:row.retainedAt,
    admission:'NOT_SCIENTIFICALLY_ADMITTED'});
  }catch{return freeze({status:'CONFLICT_OR_CORRUPT',reference:copy(ref)});}
 }
 async function retain(input){
  const record=await validateRetainedInputRecord(input),text=exactJson(record),digest=hash(text);
  try{await query('SELECT cp09b_supply.retain($1,$2,$3) AS value',[record.identity,text,digest]);}
  catch{
   // The connection may have lost a successful commit ACK. Query authoritative bytes first.
   let state;try{state=await read(record.artifact.reference);}catch{return freeze({status:'OUTCOME_UNKNOWN',reference:record.artifact.reference});}
   if(state.status==='FOUND_VALIDATED'&&state.recordText===text)return freeze({...state,reconciledUncertainWrite:true});
   if(state.status==='READ_UNAVAILABLE')return freeze({status:'OUTCOME_UNKNOWN',reference:record.artifact.reference});
   return freeze({status:state.status==='ABSENT'?'WRITE_UNRESOLVED':'CONFLICT_OR_CORRUPT',reference:record.artifact.reference});
  }
  const state=await read(record.artifact.reference);
  if(state.status==='READ_UNAVAILABLE')return freeze({status:'OUTCOME_UNKNOWN',reference:record.artifact.reference});
  requireValue(state.status==='FOUND_VALIDATED'&&state.recordText===text,'retention readback');return state;
 }
 return Object.freeze({read,retain});
}
// Explicit fixture reference set only; real-source retention must never be relabeled for P1.
export function planControlledRetainedSupply(input,constructedAt){
 const x=copy(input);privateFields(x);requireScientificAssessmentV1(x.assessment);
 requireValue(x.context?.sourceAuthority==='CONTROLLED_FIXTURE'&&x.history?.state==='UNAVAILABLE','controlled scope');
 requireValue(typeof constructedAt==='string'&&new Date(constructedAt).toISOString()===constructedAt,'construction time');
 const sources=new Map();
 function index(v){
  if(!v||typeof v!=='object')return v;
  if(v.reference?.kind==='captured'&&Object.hasOwn(v,'content')){
   artifact(v);const key=identity(v.reference),old=sources.get(key);
   requireValue(!old||same(old,v),'conflicting source');sources.set(key,v);
   // Index nested source artifacts as well; parent text remains byte-exact.
   index(v.content);return {retainedReference:v.reference};
  }
  if(Array.isArray(v))return v.map(index);
  return Object.fromEntries(Object.entries(v).map(([k,c])=>[k,index(c)]));
 }
 const template=index(x),body={contractVersion:RETAINED_INPUT_REFERENCE_SET,sourceClass:'CONTROLLED_FIXTURE',constructedAt,
  assessment:x.assessment,context:x.context,template,references:[...sources.values()].map(a=>a.reference)};
 return freeze({referenceSet:{...body,digest:hash(exactJson(body))},artifacts:[...sources.values()]});
}
function binding(x){
 requireValue(x.contractVersion==='pelora-retained-blue-marlin-composition-input-v1','P1 version');
 requireScientificAssessmentV1(x.assessment);requireValue(x.context.sourceAuthority==='CONTROLLED_FIXTURE'&&x.context.species==='blue-marlin','context');
 requireValue(x.history.state==='UNAVAILABLE'&&x.history.sourceReference===null,'history unavailable');
 requireValue(Array.isArray(x.entries)&&x.entries.length>0&&x.entries.length<=64,'cohort bounds');
 requireValue(x.context.cohortReference.sha256===hash(exactJson(x.entries.map(e=>e.candidate.content))),'cohort');
 const unresolved=[],seen=new Set();
 for(const e of x.entries){
  keys(e,['candidate','staticParent','environment']);const c=e.candidate.content,p=e.staticParent.content,env=e.environment.content;
  requireValue(typeof c.id==='string'&&!seen.has(c.id)&&!Object.hasOwn(c,'eligibility'),'candidate');seen.add(c.id);
  const b=resolveOpportunityCandidateBathymetryV1(c);
  requireValue(same(p,{candidateId:c.id,coordinates:c.coordinates,bathymetry:b}),'static producer binding');
  evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1({candidate:c,speciesProfile:BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE});
  requireValue(env.candidateId===c.id&&same(env.requestedCoordinates,c.coordinates)&&same(env.context,x.context)&&env.assessmentAt===x.assessment.assessmentAt,'environment binding');
  keys(env,['candidateId','assessmentAt','context','requestedCoordinates','sst','currents','chlorophyll','dataQuality','sourceMetadata']);
  keys(env.sst,['center','neighbors']);keys(env.currents,['center','neighbors']);keys(env.chlorophyll,['direct','gapFilled']);
  const layout=retainedSpatialSampleLayoutV1(...c.coordinates);
  function checkPoint(a,family,coords,role){
   if(a===null){unresolved.push({candidateId:c.id,role,reason:'REQUIRED_ARTIFACT_ABSENT'});return;}
   artifact(a);const v=a.content;requireValue(v.family===family,'family');
   const q=point({type:'P1_EXACT_ARTIFACT',artifact:a});requireValue(q&&q.source&&typeof q.source==='object','point contract');
   for(const key of family==='SST'?['temperatureCelsius','temperatureFahrenheit']:family==='CURRENTS'?['speedKnots','directionDegrees','eastwardMetersPerSecond','northwardMetersPerSecond']:['concentrationMgM3'])requireValue(Object.hasOwn(q,key)&&(q[key]===null||Number.isFinite(q[key])),'point scalar shape');
   requireValue(Object.is(q.requestedLatitude,coords[0])&&Object.is(q.requestedLongitude,coords[1]),'requested coordinates');
   if(Object.hasOwn(q,'direction'))requireValue(q.direction===role,'direction binding');
   // Source context is not rewritten to match a new assessment.
   if(q.ageHours!==undefined&&q.observedAt){const projected=reassessCurrentAgeV1(q,x.assessment);if(!Object.is(projected.ageHours,q.ageHours))unresolved.push({candidateId:c.id,role,reason:'SOURCE_ASSESSMENT_CONTEXT_DIFFERS'});}
  }
  for(const [name,family] of [['sst','SST'],['currents','CURRENTS']]){
   checkPoint(env[name].center,family,c.coordinates,name+'-center');const samples=env[name].neighbors;
   requireValue(Array.isArray(samples)&&samples.length<=layout[name].length,'sample bounds');
   if(samples.length!==layout[name].length)unresolved.push({candidateId:c.id,role:name,reason:'NEIGHBORHOOD_SUPPORT_UNRESOLVED'});
   for(let i=0;i<samples.length;i++){
    const sample=samples[i],expected=layout[name][i];keys(sample,['direction','outcome','point','reason']);
    requireValue(sample.direction===expected.direction,'sample layout');
    if(sample.outcome==='REJECTED')requireValue(sample.point===null&&typeof sample.reason==='string'&&sample.reason.length>0,'failure representation');
    else{requireValue(sample.outcome==='FULFILLED'&&sample.reason===null,'sample outcome');checkPoint(sample.point,family,[expected.latitude,expected.longitude],sample.direction);}
   }
  }
  checkPoint(env.chlorophyll.direct,'CHLOROPHYLL_DIRECT',c.coordinates,'chlorophyll-direct');
  checkPoint(env.chlorophyll.gapFilled,'CHLOROPHYLL_GAP_FILLED',c.coordinates,'chlorophyll-gap');
 }
 return unresolved;
}
export async function readRetainedReferenceSet({reference:ref,store}){
 const state=await store.read(ref);
 if(state.status!=='FOUND_VALIDATED')return state;
 requireValue(state.record.type==='REFERENCE_SET','reference set type');
 return freeze({status:'FOUND_VALIDATED',referenceSet:state.record.artifact.content,retainedAt:state.retainedAt});
}
export async function resolveControlledRetainedSupply({referenceSet,store}){
 const s=copy(referenceSet);privateFields(s);keys(s,['contractVersion','sourceClass','constructedAt','assessment','context','template','references','digest']);
 const {digest,...body}=s;requireValue(s.contractVersion===RETAINED_INPUT_REFERENCE_SET&&s.sourceClass==='CONTROLLED_FIXTURE'&&digest===hash(exactJson(body)),'reference set');
 requireValue(Array.isArray(s.references)&&s.references.length<=2048,'reference capacity');
 const states=[],found=new Map();
 for(const ref of s.references){const r=await store.read(ref);states.push(r);if(r.status==='FOUND_VALIDATED'){
  requireValue(r.record.sourceClass==='CONTROLLED_FIXTURE'&&r.record.type==='P1_EXACT_ARTIFACT','no real-source fixture relabeling');
  requireValue(!found.has(identity(ref)),'duplicate reference');found.set(identity(ref),r.record.artifact);
 }}
 if(states.some(r=>r.status!=='FOUND_VALIDATED'))return freeze({status:states.some(r=>r.status==='CONFLICT_OR_CORRUPT')?'CONFLICT_OR_CORRUPT':'UNRESOLVED_SUPPLY',states,compositionInput:null});
 function expand(v){
  if(!v||typeof v!=='object')return v;
  if(Object.hasOwn(v,'retainedReference')){keys(v,['retainedReference']);const a=found.get(identity(v.retainedReference));requireValue(a&&same(a.reference,v.retainedReference),'template reference');return copy(a);}
  return Array.isArray(v)?v.map(expand):Object.fromEntries(Object.entries(v).map(([k,c])=>[k,expand(c)]));
 }
 try{
  const x=expand(s.template);requireValue(same(x.assessment,s.assessment)&&same(x.context,s.context),'assessment/context');
  // Every embedded artifact must match an explicitly read exact artifact, not just a plausible parent.
  function verify(v){if(!v||typeof v!=='object')return;if(v.reference?.kind==='captured'&&Object.hasOwn(v,'content')){requireValue(same(v,found.get(identity(v.reference))),'embedded source binding');}Object.values(v).forEach(verify);}verify(x);
  const unresolved=binding(x);
  return freeze({status:unresolved.length?'UNRESOLVED_SUPPLY':'CONTROLLED_SUPPLY_READY',states,unresolved,referenceSet:s,
   compositionInput:unresolved.length?null:x,admission:'NOT_SCIENTIFICALLY_ADMITTED'});
 }catch{return freeze({status:'CONFLICT_OR_CORRUPT',states,compositionInput:null});}
}
export async function inspectRetainedSource({reference:ref,store,assessment}){
 const a=requireScientificAssessmentV1(assessment),state=await store.read(ref);
 if(state.status!=='FOUND_VALIDATED')return state;
 const q=point(state.record);
 return freeze({...state,status:'RETAINED_AUTHORITY_UNRESOLVED',assessment:a,
  originalSourceIdentity:state.record.type==='FRAME_ARCHIVE'?{contractVersion:state.record.artifact.content.receipt.contractVersion,archiveId:state.record.artifact.content.receipt.archiveId,frameId:state.record.artifact.content.receipt.frameId}:q?state.record.artifact.content.payload.reference??state.record.artifact.reference:state.record.artifact.reference,
  sourcePoint:q,assessmentProjection:q&&q.observedAt?reassessCurrentAgeV1(q,a):null,
  limits:['PRODUCT_AND_TEMPORAL_SUPPORT_NOT_ADMITTED','SPATIAL_CORRESPONDENCE_NOT_QUALIFIED','RECEIPT_ADMISSION_UNCHANGED'],compositionInput:null});
}
export async function resolveExactCurrentReaderSupply({query,clock,request,observationId,requestedCoordinates,qualifiedCorrespondence=null}){
 const r=await createOceanStateReader({query,clock}).read(copy(request));
 if(r.status!=='OK')return freeze({status:'UNRESOLVED_SUPPLY',reader:r,compositionInput:null});
 const o=r.observations.find(v=>v.observationId===observationId);
 if(!o)return freeze({status:r.hasMore?'UNRESOLVED_SUPPLY':'ABSENT',reason:r.hasMore?'EXACT_REFERENCE_NOT_IN_BOUNDED_PAGE':'EXACT_REFERENCE_NOT_IN_REQUESTED_SCOPE',reader:r,compositionInput:null});
 // A claimed Boolean or native cell does not establish qualified P1 neighborhood correspondence.
 requireValue(qualifiedCorrespondence===null,'no correspondence authority approved in P2');
 return freeze({status:'RETAINED_AUTHORITY_UNRESOLVED',observation:o,requestedCoordinates:copy(requestedCoordinates),
  limits:['EXACT_CANDIDATE_SAMPLE_CORRESPONDENCE_REQUIRED','NATIVE_CELL_NOT_P1_NEIGHBORHOOD'],compositionInput:null});
}

// Explicit real-source selection inspection. It does not invoke P1 or grant admission.
export function sealExplicitRetainedSelection(input){
 const x=copy(input);privateFields(x);
 keys(x,['contractVersion','sourceClass','constructedAt','assessment','context','bindings']);
 requireValue(x.contractVersion===EXPLICIT_RETAINED_SELECTION&&x.sourceClass==='RETAINED_SOURCE','explicit selection version');
 requireScientificAssessmentV1(x.assessment);keys(x.context,['species','regionId','contextVersion']);
 requireValue(x.context.species==='blue-marlin'&&typeof x.context.regionId==='string'&&x.context.regionId.length>0&&typeof x.context.contextVersion==='string'&&x.context.contextVersion.length>0,'explicit context');
 requireValue(typeof x.constructedAt==='string'&&new Date(x.constructedAt).toISOString()===x.constructedAt,'selection construction time');
 requireValue(Array.isArray(x.bindings)&&x.bindings.length>0&&x.bindings.length<=2048,'selection bounds');
 const seen=new Set();for(const b of x.bindings){
  keys(b,['candidateId','staticReference','artifactReference','family','role']);reference(b.staticReference);reference(b.artifactReference);
  requireValue(typeof b.candidateId==='string'&&b.candidateId.length>0,'candidate binding');
  requireValue(['SST','CURRENTS','CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED'].includes(b.family),'selection family');
  requireValue(['center','north','east','south','west'].includes(b.role)&&(!b.family.startsWith('CHLOROPHYLL')||b.role==='center'),'selection role');
  const key=exactJson([b.candidateId,b.family,b.role]);requireValue(!seen.has(key),'duplicate binding');seen.add(key);
 }
 return freeze({...x,digest:hash(exactJson(x))});
}
export async function resolveExplicitRetainedSelection({selection,store}){
 const x=copy(selection),{digest,...body}=x;requireValue(same(sealExplicitRetainedSelection(body),x)&&digest===hash(exactJson(body)),'selection reference');
 const results=[];
 for(const b of x.bindings){
  const parent=await store.read(b.staticReference),source=await store.read(b.artifactReference);
  if(parent.status!=='FOUND_VALIDATED'||source.status!=='FOUND_VALIDATED'){
   results.push({binding:b,status:[parent,source].some(r=>r.status==='CONFLICT_OR_CORRUPT')?'CONFLICT_OR_CORRUPT':[parent,source].some(r=>r.status==='READ_UNAVAILABLE')?'READ_UNAVAILABLE':'ABSENT',parent,source});continue;
  }
  try{
   requireValue(parent.record.type==='STATIC_CONTEXT'&&parent.record.sourceClass==='RETAINED_SOURCE'&&source.record.sourceClass==='RETAINED_SOURCE','source class/type');
   const c=parent.record.artifact.content.candidate;requireValue(c.id===b.candidateId,'candidate identity');
   const content=source.record.artifact.content;requireValue(content.family===b.family,'source family');
   const q=point(source.record);requireValue(q,'native scientific source contract');
   const layout=retainedSpatialSampleLayoutV1(...c.coordinates),sample=b.role==='center'?null:layout[b.family==='SST'?'sst':'currents'].find(s=>s.direction===b.role);
   const coords=sample?[sample.latitude,sample.longitude]:c.coordinates;
   requireValue(Object.is(q.requestedLatitude,coords[0])&&Object.is(q.requestedLongitude,coords[1]),'native requested/sample mismatch');
   results.push({binding:b,status:'RETAINED_AUTHORITY_UNRESOLVED',parent,source,sourcePoint:q,
    assessmentProjection:q.observedAt?reassessCurrentAgeV1(q,x.assessment):null,
    limits:['PRODUCT_TEMPORAL_SPATIAL_AND_CUTOFF_ADMISSION_NOT_QUALIFIED'],compositionInput:null});
  }catch{results.push({binding:b,status:'CONFLICT_OR_CORRUPT',parent,source,compositionInput:null});}
 }
 return freeze({status:results.some(r=>r.status==='CONFLICT_OR_CORRUPT')?'CONFLICT_OR_CORRUPT':'UNRESOLVED_SUPPLY',selection:x,
  results,admission:'NOT_SCIENTIFICALLY_ADMITTED',compositionInput:null});
}